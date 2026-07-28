'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MAX_REQUEST_BYTES,
  MAX_STREAM_FRAME_CHARACTERS,
  MAX_STREAM_FRAME_COUNT,
  MAX_STREAM_RESPONSE_CHARACTERS,
  type ChatMessage,
  type ChatStreamFrame
} from '../server/contracts';

const CHAT_ENDPOINT = '/api/chat';
export const CLIENT_TIMEOUT_MS = 31_000;
const MAX_CONTEXT_MESSAGES = 10;
const DEFAULT_RETRY_AFTER_SECONDS = 60;
const MAX_CONSECUTIVE_EMPTY_STREAM_CHUNKS = 32;

export const MAX_API_ERROR_RESPONSE_BYTES = 8 * 1024;
export const API_ERROR_RESPONSE_TIMEOUT_MS = 2_000;
export const MAX_CHAT_STREAM_RESPONSE_BYTES =
  MAX_STREAM_FRAME_CHARACTERS * 4;

export const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Hi—ask about John's services, project evidence, technical stack, or experience."
};

function prepareClientConversation(
  history: ChatMessage[],
  currentUser: ChatMessage
): ChatMessage[] {
  let retainedHistory = history.slice(-MAX_CONTEXT_MESSAGES);
  let conversation = [...retainedHistory, currentUser];
  const encoder = new TextEncoder();

  while (
    retainedHistory.length >= 2 &&
    encoder.encode(JSON.stringify({ messages: conversation })).byteLength >
      MAX_REQUEST_BYTES
  ) {
    retainedHistory = retainedHistory.slice(2);
    conversation = [...retainedHistory, currentUser];
  }

  return conversation;
}

function cancelSafely(
  cancelable: { cancel: () => unknown } | null | undefined
): void {
  try {
    const cancellation = cancelable?.cancel();
    if (cancellation !== undefined) {
      void Promise.resolve(cancellation).catch(() => undefined);
    }
  } catch {
    // Cancellation is best-effort and must not interrupt state cleanup.
  }
}

export type ChatClientErrorKind =
  | 'validation'
  | 'rate_limit'
  | 'offline'
  | 'timeout'
  | 'output_limit'
  | 'unavailable'
  | 'network'
  | 'protocol';

export interface ChatClientError {
  kind: ChatClientErrorKind;
  message: string;
  retryAfterSeconds?: number;
  canRetry: boolean;
}

export interface UseOnlineChatResult {
  messages: ChatMessage[];
  isStreaming: boolean;
  retryBlocked: boolean;
  error: ChatClientError | null;
  send: (text: string) => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
}

interface ApiErrorBody {
  error?: {
    code?: unknown;
  };
}

class ChatProtocolError extends Error {
  constructor() {
    super('The chat stream did not match the expected protocol.');
    this.name = 'ChatProtocolError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseStreamFrame(line: string): ChatStreamFrame {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    throw new ChatProtocolError();
  }

  if (!isRecord(value)) {
    throw new ChatProtocolError();
  }

  if (value.type === 'text-delta' && typeof value.delta === 'string') {
    return { type: 'text-delta', delta: value.delta };
  }

  if (value.type === 'finish' && typeof value.finishReason === 'string') {
    return { type: 'finish', finishReason: value.finishReason };
  }

  if (
    value.type === 'error' &&
    value.code === 'STREAM_ERROR' &&
    typeof value.message === 'string'
  ) {
    return {
      type: 'error',
      code: 'STREAM_ERROR',
      message: value.message
    };
  }

  throw new ChatProtocolError();
}

function parseStreamReadResult(
  result: unknown
): ReadableStreamReadResult<Uint8Array> {
  if (!isRecord(result)) {
    throw new ChatProtocolError();
  }

  try {
    const done = result.done;
    if (typeof done !== 'boolean') {
      throw new ChatProtocolError();
    }
    if (done) {
      return { done: true, value: undefined };
    }

    const value = result.value;
    if (
      Object.prototype.toString.call(value) !== '[object Uint8Array]'
    ) {
      throw new ChatProtocolError();
    }
    return { done: false, value: value as Uint8Array };
  } catch (caught: unknown) {
    if (caught instanceof ChatProtocolError) throw caught;
    throw new ChatProtocolError();
  }
}

function parseRetryAfter(response: Response): number {
  const value = response.headers.get('retry-after');
  if (value === null) return DEFAULT_RETRY_AFTER_SECONDS;

  const delaySeconds = Number(value);
  if (delaySeconds > 0) {
    return Math.min(Math.ceil(delaySeconds), 3_600);
  }
  if (!Number.isNaN(delaySeconds)) {
    return DEFAULT_RETRY_AFTER_SECONDS;
  }

  const retryAt = Date.parse(value);
  const responseDate = Date.parse(response.headers.get('date') ?? '');
  const referenceTime = Number.isFinite(responseDate)
    ? responseDate
    : Date.now();
  const dateDelaySeconds = Math.ceil((retryAt - referenceTime) / 1_000);
  return Number.isFinite(dateDelaySeconds) && dateDelaySeconds > 0
    ? Math.min(dateDelaySeconds, 3_600)
    : DEFAULT_RETRY_AFTER_SECONDS;
}

function hasUtf8MediaType(
  response: Response,
  expectedMediaType: string
): boolean {
  const [rawMediaType = '', ...parameters] = (
    response.headers.get('content-type') ?? ''
  ).split(';');
  if (rawMediaType.trim().toLowerCase() !== expectedMediaType) {
    return false;
  }

  return parameters.every(parameter => {
    const separator = parameter.indexOf('=');
    const name = (
      separator === -1 ? parameter : parameter.slice(0, separator)
    )
      .trim()
      .toLowerCase();
    if (name !== 'charset') return true;

    let value = separator === -1 ? '' : parameter.slice(separator + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    return value.toLowerCase() === 'utf-8';
  });
}

function isChatStreamResponse(response: Response): boolean {
  return hasUtf8MediaType(response, 'application/x-ndjson');
}

function isJsonResponse(response: Response): boolean {
  return hasUtf8MediaType(response, 'application/json');
}

function hasAcceptableDeclaredLength(
  response: Response,
  maxBytes: number
): boolean {
  const transferEncoding = response.headers.get('transfer-encoding');
  if (
    transferEncoding !== null &&
    transferEncoding.trim().toLowerCase() !== 'chunked'
  ) {
    return false;
  }

  const value = response.headers.get('content-length');
  if (value === null) return true;
  if (transferEncoding !== null) return false;
  if (!/^\d+$/.test(value)) return false;

  const bytes = Number(value);
  return Number.isSafeInteger(bytes) && bytes <= maxBytes;
}

function getComparableDeclaredLength(response: Response): number | undefined {
  const value = response.headers.get('content-length');
  if (value === null) return undefined;

  const bytes = Number(value);
  if (bytes === 0) return 0;

  const contentEncoding = response.headers.get('content-encoding');
  if (
    contentEncoding !== null &&
    contentEncoding
      .split(',')
      .some(encoding => encoding.trim().toLowerCase() !== 'identity')
  ) {
    return undefined;
  }

  return bytes;
}

function errorCodeFromStatus(status: number): string | undefined {
  if (status === 400 || status === 413) return 'VALIDATION_ERROR';
  if (status === 429) return 'RATE_LIMITED';
  if (status === 504) return 'TIMEOUT';
  return undefined;
}

async function readApiErrorCode(
  response: Response,
  signal?: AbortSignal
): Promise<string | undefined> {
  if (!isJsonResponse(response)) {
    cancelSafely(response.body);
    return undefined;
  }
  if (!hasAcceptableDeclaredLength(response, MAX_API_ERROR_RESPONSE_BYTES)) {
    cancelSafely(response.body);
    return undefined;
  }
  const declaredResponseBytes = getComparableDeclaredLength(response);
  if (declaredResponseBytes === 0) {
    cancelSafely(response.body);
    return undefined;
  }
  if (!response.body) return undefined;

  if (signal?.aborted) {
    throw (
      signal.reason ??
      new DOMException('The chat request was aborted.', 'AbortError')
    );
  }

  let reader: ReadableStreamDefaultReader<Uint8Array>;
  try {
    reader = response.body.getReader();
  } catch {
    return undefined;
  }
  const cancelOnAbort = (): void => {
    cancelSafely(reader);
  };
  if (signal?.aborted) {
    cancelOnAbort();
    throw (
      signal.reason ??
      new DOMException('The chat request was aborted.', 'AbortError')
    );
  }
  signal?.addEventListener('abort', cancelOnAbort, { once: true });
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let receivedBytes = 0;
  let text = '';
  let consecutiveEmptyChunks = 0;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>(resolve => {
    timeoutId = globalThis.setTimeout(
      () => resolve(null),
      API_ERROR_RESPONSE_TIMEOUT_MS
    );
  });

  try {
    while (true) {
      const result = await Promise.race([reader.read(), timeout]);
      if (result === null) {
        cancelSafely(reader);
        return undefined;
      }

      const { done, value } = parseStreamReadResult(result);
      if (done) break;

      const chunkBytes = value.byteLength;
      if (chunkBytes === 0) {
        consecutiveEmptyChunks += 1;
        if (
          consecutiveEmptyChunks > MAX_CONSECUTIVE_EMPTY_STREAM_CHUNKS
        ) {
          cancelSafely(reader);
          return undefined;
        }
      } else {
        consecutiveEmptyChunks = 0;
      }
      receivedBytes += chunkBytes;
      if (
        receivedBytes > MAX_API_ERROR_RESPONSE_BYTES ||
        (declaredResponseBytes !== undefined &&
          receivedBytes > declaredResponseBytes)
      ) {
        cancelSafely(reader);
        return undefined;
      }

      text += decoder.decode(value, { stream: true });
    }
    if (
      declaredResponseBytes !== undefined &&
      receivedBytes !== declaredResponseBytes
    ) {
      return undefined;
    }

    text += decoder.decode();
    const body = JSON.parse(text) as ApiErrorBody;
    return typeof body.error?.code === 'string' ? body.error.code : undefined;
  } catch (caught: unknown) {
    cancelSafely(reader);
    if (signal?.aborted) {
      throw signal.reason ?? caught;
    }
    return undefined;
  } finally {
    signal?.removeEventListener('abort', cancelOnAbort);
    if (timeoutId !== undefined) globalThis.clearTimeout(timeoutId);
    try {
      reader.releaseLock();
    } catch {
      // The response classification still has a safe status-code fallback.
    }
  }
}

async function classifyHttpError(
  response: Response,
  signal?: AbortSignal
): Promise<ChatClientError> {
  const statusCode = errorCodeFromStatus(response.status);
  if (statusCode) {
    cancelSafely(response.body);
  }
  const code = statusCode ?? (await readApiErrorCode(response, signal));

  if (
    response.status === 413 ||
    response.status === 400 ||
    code === 'PAYLOAD_TOO_LARGE' ||
    code === 'VALIDATION_ERROR'
  ) {
    return {
      kind: 'validation',
      message: 'Please shorten or revise your message, then try again.',
      canRetry: false
    };
  }

  if (response.status === 429 || code === 'RATE_LIMITED') {
    const retryAfterSeconds = parseRetryAfter(response);
    return {
      kind: 'rate_limit',
      message: retryAfterSeconds
        ? `Too many requests. Try again in about ${retryAfterSeconds} seconds.`
        : 'Too many requests. Please wait a moment and try again.',
      retryAfterSeconds,
      canRetry: true
    };
  }

  if (response.status === 504 || code === 'TIMEOUT') {
    return {
      kind: 'timeout',
      message: 'The AI took too long to respond. Please try again.',
      canRetry: true
    };
  }

  return {
    kind: 'unavailable',
    message: 'The AI service is temporarily unavailable. Please try again.',
    canRetry: true
  };
}

function networkError(): ChatClientError {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return {
      kind: 'offline',
      message: 'You appear to be offline. Reconnect and try again.',
      canRetry: true
    };
  }

  return {
    kind: 'network',
    message: 'The connection was interrupted. Please try again.',
    canRetry: true
  };
}

async function fetchWithAbortSignal(
  input: RequestInfo | URL,
  init: RequestInit,
  signal: AbortSignal
): Promise<Response> {
  const abortReason = (): unknown =>
    signal.reason ??
    new DOMException('The chat request was aborted.', 'AbortError');
  if (signal.aborted) throw abortReason();

  const responsePromise = fetch(input, init).then(response => {
    if (signal.aborted) {
      cancelSafely(response.body);
      throw abortReason();
    }
    return response;
  });
  let rejectOnAbort: (() => void) | undefined;
  const abortPromise = new Promise<never>((_resolve, reject) => {
    rejectOnAbort = () => reject(abortReason());
    signal.addEventListener('abort', rejectOnAbort, { once: true });
  });

  try {
    return await Promise.race([responsePromise, abortPromise]);
  } finally {
    if (rejectOnAbort) {
      signal.removeEventListener('abort', rejectOnAbort);
    }
  }
}

export function useOnlineChat(): UseOnlineChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [retryBlocked, setRetryBlocked] = useState(false);
  const [error, setError] = useState<ChatClientError | null>(null);
  const successfulConversationRef = useRef<ChatMessage[]>([]);
  const failedConversationRef = useRef<ChatMessage[] | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const responseReaderRef =
    useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const abortReasonRef = useRef<'cancel' | 'timeout' | null>(null);
  const operationIdRef = useRef(0);
  const isStreamingRef = useRef(false);
  const retryBlockedRef = useRef(false);
  const retryTimerRef = useRef<number | null>(null);

  const updateMessages = useCallback(
    (updater: (current: ChatMessage[]) => ChatMessage[]): void => {
      setMessages(current => {
        const next = updater(current);
        return next;
      });
    },
    []
  );

  const finishOperation = useCallback((operationId: number): void => {
    if (operationId !== operationIdRef.current) return;
    isStreamingRef.current = false;
    setIsStreaming(false);
    abortControllerRef.current = null;
    abortReasonRef.current = null;
  }, []);

  const removeEmptyPendingAssistant = useCallback((): void => {
    updateMessages(current => {
      const last = current[current.length - 1];
      if (last?.role === 'assistant' && last.content === '') {
        return current.slice(0, -1);
      }
      return current;
    });
  }, [updateMessages]);

  const runRequest = useCallback(
    async (conversation: ChatMessage[], appendUser: boolean): Promise<void> => {
      if (isStreamingRef.current) return;

      const hadPreviousFailure = failedConversationRef.current !== null;
      const operationId = operationIdRef.current + 1;
      operationIdRef.current = operationId;
      isStreamingRef.current = true;
      setIsStreaming(true);
      setError(null);
      failedConversationRef.current = null;

      const currentUser = conversation[conversation.length - 1];
      updateMessages(current => {
        let transcript = current;

        if (hadPreviousFailure) {
          if (transcript.at(-1)?.role === 'assistant') {
            transcript = transcript.slice(0, -1);
          }
          if (appendUser && transcript.at(-1)?.role === 'user') {
            transcript = transcript.slice(0, -1);
          }
        }

        return [
          ...transcript,
          ...(appendUser ? [currentUser] : []),
          { role: 'assistant', content: '' }
        ];
      });

      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      abortReasonRef.current = null;
      let responseReader:
        | ReadableStreamDefaultReader<Uint8Array>
        | undefined;
      const timeoutId = window.setTimeout(() => {
        if (operationId !== operationIdRef.current) return;
        abortReasonRef.current = 'timeout';
        abortController.abort(
          new DOMException('The chat request timed out.', 'TimeoutError')
        );
        cancelSafely(responseReader);
      }, CLIENT_TIMEOUT_MS);

      let fullAssistantResponse = '';
      let bufferedText = '';
      let animationFrameId: number | null = null;

      const flushBufferedText = (): void => {
        if (!bufferedText || operationId !== operationIdRef.current) return;
        const text = bufferedText;
        bufferedText = '';
        updateMessages(current => {
          const next = [...current];
          const pending = next[next.length - 1];
          if (pending?.role !== 'assistant') return current;
          next[next.length - 1] = {
            role: 'assistant',
            content: pending.content + text
          };
          return next;
        });
        animationFrameId = null;
      };

      const scheduleFlush = (): void => {
        if (animationFrameId !== null) return;
        if (typeof window.requestAnimationFrame !== 'function') {
          flushBufferedText();
          return;
        }
        animationFrameId = window.requestAnimationFrame(flushBufferedText);
      };

      const cancelScheduledFlush = (): void => {
        if (animationFrameId === null) return;
        if (typeof window.cancelAnimationFrame === 'function') {
          window.cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = null;
      };

      try {
        const response = await fetchWithAbortSignal(
          CHAT_ENDPOINT,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: conversation }),
            signal: abortController.signal
          },
          abortController.signal
        );

        if (
          abortController.signal.aborted ||
          operationId !== operationIdRef.current
        ) {
          cancelSafely(response.body);
          throw (
            abortController.signal.reason ??
            new DOMException('The chat request is stale.', 'AbortError')
          );
        }

        if (!response.ok) {
          const classified = await classifyHttpError(
            response,
            abortController.signal
          );
          if (operationId !== operationIdRef.current) return;
          failedConversationRef.current = conversation;
          removeEmptyPendingAssistant();
          if (classified.retryAfterSeconds) {
            retryBlockedRef.current = true;
            setRetryBlocked(true);
            if (retryTimerRef.current !== null) {
              window.clearTimeout(retryTimerRef.current);
            }
            retryTimerRef.current = window.setTimeout(() => {
              retryBlockedRef.current = false;
              retryTimerRef.current = null;
              setRetryBlocked(false);
            }, classified.retryAfterSeconds * 1_000);
          }
          setError(classified);
          return;
        }

        if (!isChatStreamResponse(response)) {
          cancelSafely(response.body);
          throw new ChatProtocolError();
        }

        if (
          !hasAcceptableDeclaredLength(
            response,
            MAX_CHAT_STREAM_RESPONSE_BYTES
          )
        ) {
          cancelSafely(response.body);
          throw new ChatProtocolError();
        }
        const declaredResponseBytes = getComparableDeclaredLength(response);
        if (declaredResponseBytes === 0) {
          cancelSafely(response.body);
          throw new ChatProtocolError();
        }

        if (!response.body) {
          throw new ChatProtocolError();
        }

        let reader: ReadableStreamDefaultReader<Uint8Array>;
        try {
          reader = response.body.getReader();
        } catch {
          throw new ChatProtocolError();
        }
        responseReader = reader;
        responseReaderRef.current = reader;
        const decoder = new TextDecoder('utf-8', { fatal: true });
        let pendingLine = '';
        let sawFinish = false;
        let finishReason: string | null = null;
        let frameCount = 0;
        let receivedResponseBytes = 0;
        let consecutiveEmptyChunks = 0;

        const processLine = (line: string): void => {
          frameCount += 1;
          if (frameCount > MAX_STREAM_FRAME_COUNT) {
            throw new ChatProtocolError();
          }
          if (!line.trim()) return;
          const frame = parseStreamFrame(line);

          if (frame.type === 'text-delta') {
            if (sawFinish) throw new ChatProtocolError();
            if (
              fullAssistantResponse.length + frame.delta.length >
              MAX_STREAM_RESPONSE_CHARACTERS
            ) {
              throw new ChatProtocolError();
            }
            fullAssistantResponse += frame.delta;
            bufferedText += frame.delta;
            scheduleFlush();
            return;
          }

          if (frame.type === 'error') {
            throw new ChatProtocolError();
          }

          if (sawFinish) throw new ChatProtocolError();
          sawFinish = true;
          finishReason = frame.finishReason;
        };

        while (true) {
          const { done, value } = parseStreamReadResult(
            await reader.read()
          );
          const chunkBytes = value?.byteLength ?? 0;
          if (!done && chunkBytes === 0) {
            consecutiveEmptyChunks += 1;
            if (
              consecutiveEmptyChunks >
              MAX_CONSECUTIVE_EMPTY_STREAM_CHUNKS
            ) {
              throw new ChatProtocolError();
            }
          } else {
            consecutiveEmptyChunks = 0;
          }
          receivedResponseBytes += chunkBytes;
          if (
            receivedResponseBytes > MAX_CHAT_STREAM_RESPONSE_BYTES ||
            (declaredResponseBytes !== undefined &&
              receivedResponseBytes > declaredResponseBytes)
          ) {
            throw new ChatProtocolError();
          }

          try {
            pendingLine += decoder.decode(value, { stream: !done });
          } catch {
            throw new ChatProtocolError();
          }
          const lines = pendingLine.split('\n');
          pendingLine = lines.pop() ?? '';
          if (
            pendingLine.length > MAX_STREAM_FRAME_CHARACTERS ||
            lines.some(line => line.length > MAX_STREAM_FRAME_CHARACTERS)
          ) {
            throw new ChatProtocolError();
          }
          lines.forEach(processLine);

          if (done) break;
        }
        if (
          declaredResponseBytes !== undefined &&
          receivedResponseBytes !== declaredResponseBytes
        ) {
          throw new ChatProtocolError();
        }

        if (pendingLine.trim()) {
          processLine(pendingLine);
        }

        if (!sawFinish || !fullAssistantResponse.trim()) {
          throw new ChatProtocolError();
        }
        if (finishReason !== 'stop' && finishReason !== 'length') {
          throw new ChatProtocolError();
        }

        cancelScheduledFlush();
        flushBufferedText();

        if (operationId !== operationIdRef.current) return;
        if (finishReason === 'length') {
          failedConversationRef.current = conversation;
          setError({
            kind: 'output_limit',
            message: 'The answer was cut off. Please ask a more specific question.',
            canRetry: false
          });
          return;
        }
        successfulConversationRef.current = [
          ...conversation,
          { role: 'assistant', content: fullAssistantResponse }
        ];
      } catch (caught: unknown) {
        cancelSafely(responseReader);
        cancelScheduledFlush();
        flushBufferedText();

        if (operationId !== operationIdRef.current) return;

        if (abortController.signal.aborted && abortReasonRef.current === 'cancel') {
          removeEmptyPendingAssistant();
          return;
        }

        failedConversationRef.current = conversation;
        if (!fullAssistantResponse) {
          removeEmptyPendingAssistant();
        }

        if (abortController.signal.aborted && abortReasonRef.current === 'timeout') {
          setError({
            kind: 'timeout',
            message: 'The AI took too long to respond. Please try again.',
            canRetry: true
          });
        } else if (caught instanceof ChatProtocolError) {
          abortController.abort(
            new DOMException('The chat stream was invalid.', 'AbortError')
          );
          setError({
            kind: 'protocol',
            message: 'The AI response was interrupted. Please try again.',
            canRetry: true
          });
        } else {
          setError(networkError());
        }
      } finally {
        if (responseReaderRef.current === responseReader) {
          responseReaderRef.current = null;
        }
        try {
          responseReader?.releaseLock();
        } catch {
          // Cancellation remains authoritative when a read is still pending.
        }
        window.clearTimeout(timeoutId);
        finishOperation(operationId);
      }
    },
    [finishOperation, removeEmptyPendingAssistant, updateMessages]
  );

  const send = useCallback(
    async (text: string): Promise<void> => {
      const content = text.trim();
      if (!content || isStreamingRef.current || retryBlockedRef.current) return;

      const currentUser: ChatMessage = { role: 'user', content };
      await runRequest(
        prepareClientConversation(
          successfulConversationRef.current,
          currentUser
        ),
        true
      );
    },
    [runRequest]
  );

  const retry = useCallback(async (): Promise<void> => {
    if (
      !failedConversationRef.current ||
      isStreamingRef.current ||
      retryBlockedRef.current
    ) {
      return;
    }
    await runRequest(failedConversationRef.current, false);
  }, [runRequest]);

  const reset = useCallback((): void => {
    operationIdRef.current += 1;
    abortReasonRef.current = 'cancel';
    cancelSafely(responseReaderRef.current);
    responseReaderRef.current = null;
    abortControllerRef.current?.abort(
      new DOMException('The chat was closed.', 'AbortError')
    );
    abortControllerRef.current = null;
    isStreamingRef.current = false;
    successfulConversationRef.current = [];
    failedConversationRef.current = null;
    retryBlockedRef.current = false;
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    setMessages([WELCOME_MESSAGE]);
    setIsStreaming(false);
    setRetryBlocked(false);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      operationIdRef.current += 1;
      abortReasonRef.current = 'cancel';
      cancelSafely(responseReaderRef.current);
      responseReaderRef.current = null;
      abortControllerRef.current?.abort(
        new DOMException('The chat was unmounted.', 'AbortError')
      );
      if (retryTimerRef.current !== null) {
        window.clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  return { messages, isStreaming, retryBlocked, error, send, retry, reset };
}
