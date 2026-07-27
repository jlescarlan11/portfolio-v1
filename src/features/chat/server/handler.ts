import { APICallError, type FinishReason } from 'ai';
import { CHAT_SYSTEM_PROMPT } from '../content';
import {
  ChatConfigurationError,
  MAX_REQUEST_BYTES,
  MAX_STREAM_OUTPUT_BYTES,
  REQUEST_BODY_TIMEOUT_MS
} from './config';
import type {
  ChatErrorBody,
  ChatErrorCode,
  ChatStreamFrame,
  HostedChatStream,
  StartHostedChat
} from './contracts';
import { startHostedChat } from './provider';
import {
  consoleTelemetryWriter,
  emitTelemetrySafely,
  type ChatTelemetryStatus,
  type TelemetryWriter
} from './telemetry';
import { CurrentMessageTooLargeError, prepareChatContext } from './token-budget';
import { validateChatRequestText } from './validation';

interface ChatHandlerDependencies {
  startChat: StartHostedChat;
  writeTelemetry: TelemetryWriter;
  now: () => number;
  createRequestId: () => string;
}

interface ClassifiedError {
  status: 429 | 503 | 504;
  code: ChatErrorCode;
  message: string;
  telemetryStatus: ChatTelemetryStatus;
  category: string;
  retryAfter?: number;
}

const DEFAULT_DEPENDENCIES: ChatHandlerDependencies = {
  startChat: startHostedChat,
  writeTelemetry: consoleTelemetryWriter,
  now: Date.now,
  createRequestId: () => crypto.randomUUID()
};

const REQUEST_BODY_ABORTED = Symbol('request-body-aborted');
const REQUEST_BODY_TIMEOUT = Symbol('request-body-timeout');
const STREAM_ERROR_MESSAGE = 'The AI service stopped responding. Please try again.';
const TEXT_ENCODER = new TextEncoder();
const NO_STORE_RESPONSE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
} as const;
const FINISH_REASONS = new Set<FinishReason>([
  'stop',
  'length',
  'content-filter',
  'tool-calls',
  'error',
  'other'
]);

function normalizeFinishReason(value: string): FinishReason {
  return FINISH_REASONS.has(value as FinishReason)
    ? value as FinishReason
    : 'other';
}

function normalizeTokenCount(value: number | undefined): number | undefined {
  return typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= 0
    ? value
    : undefined;
}

function jsonError(
  status: number,
  code: ChatErrorCode,
  message: string,
  retryAfter?: number
): Response {
  const body: ChatErrorBody = { error: { code, message } };
  const headers = new Headers({
    ...NO_STORE_RESPONSE_HEADERS,
    'Content-Type': 'application/json; charset=utf-8'
  });

  if (retryAfter !== undefined) {
    headers.set('Retry-After', String(retryAfter));
  }

  return new Response(JSON.stringify(body), { status, headers });
}

function cancelledResponse(): Response {
  return new Response(null, {
    status: 499,
    headers: NO_STORE_RESPONSE_HEADERS
  });
}

function encodeFrame(frame: ChatStreamFrame): Uint8Array {
  return TEXT_ENCODER.encode(`${JSON.stringify(frame)}\n`);
}

function releaseHostedStream(hostedStream: HostedChatStream): void {
  try {
    const cleanup = hostedStream.iterator.return?.();
    void cleanup?.catch(() => undefined);
  } catch {
    // The abort signal is authoritative for best-effort upstream cleanup.
  }
}

function isNamedError(error: unknown, name: string): boolean {
  return error instanceof Error && error.name === name;
}

function parseRetryAfterHeader(
  headers: Record<string, string> | undefined,
  now: number
): number | undefined {
  if (!headers) return undefined;
  const entry = Object.entries(headers).find(
    ([name]) => name.toLowerCase() === 'retry-after'
  );
  if (!entry) return undefined;

  const seconds = Number(entry[1]);
  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.min(Math.ceil(seconds), 3_600);
  }

  const retryAt = Date.parse(entry[1]);
  if (!Number.isFinite(retryAt)) return undefined;

  const secondsUntilRetry = Math.ceil((retryAt - now) / 1_000);
  return secondsUntilRetry > 0
    ? Math.min(secondsUntilRetry, 3_600)
    : undefined;
}

function classifyProviderError(
  error: unknown,
  now: number = Date.now()
): ClassifiedError {
  if (isNamedError(error, 'TimeoutError')) {
    return {
      status: 504,
      code: 'TIMEOUT',
      message: 'The AI service took too long to respond. Please try again.',
      telemetryStatus: 'failed',
      category: 'timeout'
    };
  }

  if (APICallError.isInstance(error)) {
    if (error.statusCode === 408 || error.statusCode === 504) {
      return {
        status: 504,
        code: 'TIMEOUT',
        message: 'The AI service took too long to respond. Please try again.',
        telemetryStatus: 'failed',
        category: 'timeout'
      };
    }

    if (error.statusCode === 402 || error.statusCode === 429) {
      return {
        status: 429,
        code: 'RATE_LIMITED',
        message: 'The AI service is busy. Please try again shortly.',
        telemetryStatus: 'provider_quota',
        category: 'provider_quota',
        retryAfter: parseRetryAfterHeader(error.responseHeaders, now)
      };
    }
  }

  return {
    status: 503,
    code: 'SERVICE_UNAVAILABLE',
    message: 'The AI service is temporarily unavailable. Please try again.',
    telemetryStatus: 'failed',
    category: error instanceof ChatConfigurationError ? 'configuration' : 'provider'
  };
}

function linkAbortSignal(source: AbortSignal, target: AbortController): () => void {
  const abort = (): void => target.abort(source.reason);
  if (source.aborted) {
    abort();
    return () => undefined;
  }

  source.addEventListener('abort', abort, { once: true });
  return () => source.removeEventListener('abort', abort);
}

async function readRequestText(request: Request): Promise<string | Response> {
  if (request.signal.aborted) return cancelledResponse();

  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== 'application/json') {
    return jsonError(
      400,
      'VALIDATION_ERROR',
      'Send the conversation as application/json.'
    );
  }

  const declaredLength = request.headers.get('content-length');
  if (declaredLength !== null) {
    const bytes = Number(declaredLength);
    if (Number.isFinite(bytes) && bytes > MAX_REQUEST_BYTES) {
      return jsonError(
        413,
        'PAYLOAD_TOO_LARGE',
        'Please shorten your message and try again.'
      );
    }
  }

  if (!request.body) {
    return '';
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let receivedBytes = 0;
  let text = '';
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let removeAbortListener = (): void => undefined;
  const timeout = new Promise<typeof REQUEST_BODY_TIMEOUT>(resolve => {
    timeoutId = setTimeout(
      () => resolve(REQUEST_BODY_TIMEOUT),
      REQUEST_BODY_TIMEOUT_MS
    );
  });
  const aborted = new Promise<typeof REQUEST_BODY_ABORTED>(resolve => {
    if (request.signal.aborted) {
      resolve(REQUEST_BODY_ABORTED);
      return;
    }
    const onAbort = (): void => resolve(REQUEST_BODY_ABORTED);
    request.signal.addEventListener('abort', onAbort, { once: true });
    removeAbortListener = () =>
      request.signal.removeEventListener('abort', onAbort);
  });

  try {
    while (true) {
      const next = await Promise.race([reader.read(), timeout, aborted]);
      if (next === REQUEST_BODY_ABORTED) {
        void reader.cancel().catch(() => undefined);
        return cancelledResponse();
      }
      if (next === REQUEST_BODY_TIMEOUT) {
        void reader.cancel().catch(() => undefined);
        return jsonError(
          408,
          'TIMEOUT',
          'The chat request took too long. Please try again.'
        );
      }

      const { done, value } = next;
      if (done) break;

      receivedBytes += value.byteLength;
      if (receivedBytes > MAX_REQUEST_BYTES) {
        void reader.cancel().catch(() => undefined);
        return jsonError(
          413,
          'PAYLOAD_TOO_LARGE',
          'Please shorten your message and try again.'
        );
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return text;
  } catch {
    if (request.signal.aborted) return cancelledResponse();
    return jsonError(400, 'VALIDATION_ERROR', 'Check your conversation and try again.');
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    removeAbortListener();
    try {
      reader.releaseLock();
    } catch {
      // The timeout response is authoritative if cancellation is still settling.
    }
  }
}

function createStreamResponse(
  hostedStream: HostedChatStream,
  firstChunk: IteratorResult<string>,
  abortController: AbortController,
  removeAbortListener: () => void,
  emitOutcome: (
    status: ChatTelemetryStatus,
    details?: {
      inputTokens?: number;
      outputTokens?: number;
      finishReason?: string;
      errorCategory?: string;
    }
  ) => void
): Response {
  let completed = false;
  let streamedOutputBytes = 0;

  const stream = new ReadableStream<Uint8Array>({
    start(controller): void {
      const pump = async (): Promise<void> => {
        const enqueueDelta = (delta: string): boolean => {
          const nextByteCount = streamedOutputBytes + TEXT_ENCODER.encode(delta).byteLength;
          if (nextByteCount > MAX_STREAM_OUTPUT_BYTES) return false;

          streamedOutputBytes = nextByteCount;
          controller.enqueue(encodeFrame({ type: 'text-delta', delta }));
          return true;
        };

        const stopAtOutputLimit = (): void => {
          abortController.abort(
            new DOMException('Provider output exceeded the response limit.', 'AbortError')
          );
          releaseHostedStream(hostedStream);
          emitOutcome('output_limit', { finishReason: 'length' });
          controller.enqueue(
            encodeFrame({ type: 'finish', finishReason: 'length' })
          );
          completed = true;
          controller.close();
        };

        try {
          if (!firstChunk.done && firstChunk.value) {
            if (!enqueueDelta(firstChunk.value)) {
              stopAtOutputLimit();
              return;
            }
          }

          let nextChunk = firstChunk.done
            ? firstChunk
            : await hostedStream.iterator.next();

          while (!nextChunk.done) {
            if (nextChunk.value) {
              if (!enqueueDelta(nextChunk.value)) {
                stopAtOutputLimit();
                return;
              }
            }
            nextChunk = await hostedStream.iterator.next();
          }

          const completion = await hostedStream.getCompletion();
          const finishReason = normalizeFinishReason(completion.finishReason);
          if (finishReason === 'error') {
            emitOutcome('failed', { errorCategory: 'provider' });
            controller.enqueue(
              encodeFrame({
                type: 'error',
                code: 'STREAM_ERROR',
                message: STREAM_ERROR_MESSAGE
              })
            );
            completed = true;
            controller.close();
            return;
          }

          const reachedOutputLimit = finishReason === 'length';
          const inputTokens = normalizeTokenCount(completion.inputTokens);
          const outputTokens = normalizeTokenCount(completion.outputTokens);
          emitOutcome(reachedOutputLimit ? 'output_limit' : 'success', {
            ...(inputTokens !== undefined ? { inputTokens } : {}),
            ...(outputTokens !== undefined ? { outputTokens } : {}),
            finishReason
          });
          controller.enqueue(
            encodeFrame({
              type: 'finish',
              finishReason
            })
          );
          completed = true;
          controller.close();
        } catch (error: unknown) {
          if (abortController.signal.aborted) {
            emitOutcome('cancelled', { errorCategory: 'cancelled' });
            completed = true;
            return;
          }

          const classified = classifyProviderError(error);
          emitOutcome(classified.telemetryStatus, {
            errorCategory: classified.category
          });
          controller.enqueue(
            encodeFrame({
              type: 'error',
              code: 'STREAM_ERROR',
              message: STREAM_ERROR_MESSAGE
            })
          );
          completed = true;
          controller.close();
        } finally {
          removeAbortListener();
        }
      };

      void pump();
    },
    cancel(): void {
      abortController.abort(new DOMException('Client cancelled the stream.', 'AbortError'));
      releaseHostedStream(hostedStream);
      if (!completed) {
        emitOutcome('cancelled', { errorCategory: 'cancelled' });
        completed = true;
      }
      removeAbortListener();
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store',
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export async function handleChatRequest(
  request: Request,
  dependencies: Partial<ChatHandlerDependencies> = {}
): Promise<Response> {
  const resolved = { ...DEFAULT_DEPENDENCIES, ...dependencies };
  const requestId = resolved.createRequestId();
  const startedAt = resolved.now();
  let outcomeEmitted = false;

  const emitOutcome = (
    status: ChatTelemetryStatus,
    details: {
      inputTokens?: number;
      outputTokens?: number;
      finishReason?: string;
      errorCategory?: string;
    } = {}
  ): void => {
    if (outcomeEmitted) return;
    outcomeEmitted = true;
    emitTelemetrySafely(resolved.writeTelemetry, {
      requestId,
      status,
      durationMs: Math.max(0, resolved.now() - startedAt),
      ...details
    });
  };

  const requestText = await readRequestText(request);
  if (requestText instanceof Response) {
    const wasCancelled = requestText.status === 499;
    emitOutcome(wasCancelled ? 'cancelled' : 'rejected', {
      errorCategory: wasCancelled
        ? 'cancelled'
        : requestText.status === 413
          ? 'payload'
          : 'request'
    });
    return requestText;
  }

  const validation = validateChatRequestText(requestText);
  if (!validation.ok) {
    emitOutcome('rejected', { errorCategory: 'validation' });
    return jsonError(
      validation.status,
      validation.code,
      validation.message
    );
  }

  let messages = validation.value.messages;
  try {
    messages = prepareChatContext(CHAT_SYSTEM_PROMPT, messages).messages;
  } catch (error: unknown) {
    if (error instanceof CurrentMessageTooLargeError) {
      emitOutcome('rejected', { errorCategory: 'context_budget' });
      return jsonError(
        413,
        'PAYLOAD_TOO_LARGE',
        'Please shorten your message and try again.'
      );
    }
    throw error;
  }

  const abortController = new AbortController();
  const removeAbortListener = linkAbortSignal(request.signal, abortController);

  try {
    const hostedStream = await resolved.startChat({
      messages,
      signal: abortController.signal,
      systemPrompt: CHAT_SYSTEM_PROMPT
    });
    const firstChunk = await hostedStream.iterator.next();

    if (abortController.signal.aborted) {
      emitOutcome('cancelled', { errorCategory: 'cancelled' });
      removeAbortListener();
      return cancelledResponse();
    }

    return createStreamResponse(
      hostedStream,
      firstChunk,
      abortController,
      removeAbortListener,
      emitOutcome
    );
  } catch (error: unknown) {
    removeAbortListener();

    if (abortController.signal.aborted) {
      emitOutcome('cancelled', { errorCategory: 'cancelled' });
      return cancelledResponse();
    }

    const classified = classifyProviderError(error, resolved.now());
    emitOutcome(classified.telemetryStatus, {
      errorCategory: classified.category
    });
    return jsonError(
      classified.status,
      classified.code,
      classified.message,
      classified.retryAfter
    );
  }
}
