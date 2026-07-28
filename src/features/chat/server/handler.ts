import { APICallError, type FinishReason } from 'ai';
import { CHAT_SYSTEM_PROMPT } from '../content';
import {
  ChatConfigurationError,
  COMPLETION_TIMEOUT_MS,
  MAX_PROVIDER_CHUNK_COUNT,
  MAX_REQUEST_BYTES,
  MAX_STREAM_OUTPUT_BYTES,
  PROVIDER_TIMEOUT_MS,
  REQUEST_BODY_TIMEOUT_MS
} from './config';
import type {
  ChatCompletionMetadata,
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
const MAX_CONSECUTIVE_EMPTY_REQUEST_CHUNKS = 32;
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

class ProviderStreamProtocolError extends Error {
  constructor() {
    super('Provider stream exceeded its protocol budget.');
    this.name = 'ProviderStreamProtocolError';
  }
}

function parseProviderChunkResult(result: unknown): IteratorResult<string> {
  if (
    typeof result !== 'object' ||
    result === null
  ) {
    throw new ProviderStreamProtocolError();
  }

  try {
    const chunk = result as { done?: unknown; value?: unknown };
    const done = chunk.done;
    if (typeof done !== 'boolean') {
      throw new ProviderStreamProtocolError();
    }
    if (done) {
      return { done: true, value: undefined };
    }

    const value = chunk.value;
    if (typeof value !== 'string') {
      throw new ProviderStreamProtocolError();
    }

    return { done: false, value };
  } catch (error) {
    if (error instanceof ProviderStreamProtocolError) {
      throw error;
    }
    throw new ProviderStreamProtocolError();
  }
}

function parseProviderCompletion(result: unknown): ChatCompletionMetadata {
  if (typeof result !== 'object' || result === null) {
    throw new ProviderStreamProtocolError();
  }

  try {
    const completion = result as {
      finishReason?: unknown;
      inputTokens?: unknown;
      outputTokens?: unknown;
    };
    const finishReason = completion.finishReason;
    if (typeof finishReason !== 'string') {
      throw new ProviderStreamProtocolError();
    }

    const inputTokens = completion.inputTokens;
    const outputTokens = completion.outputTokens;
    return {
      finishReason,
      ...(typeof inputTokens === 'number' ? { inputTokens } : {}),
      ...(typeof outputTokens === 'number' ? { outputTokens } : {})
    };
  } catch (error: unknown) {
    if (error instanceof ProviderStreamProtocolError) throw error;
    throw new ProviderStreamProtocolError();
  }
}

function parseHostedChatStream(result: unknown): HostedChatStream {
  if (typeof result !== 'object' || result === null) {
    throw new ProviderStreamProtocolError();
  }

  const stream = result as {
    iterator?: {
      next?: unknown;
      return?: unknown;
    } | null;
    getCompletion?: unknown;
  };

  try {
    const iterator = stream.iterator;
    const next = iterator?.next;
    const release = iterator?.return;
    const getCompletion = stream.getCompletion;
    if (
      typeof iterator !== 'object' ||
      iterator === null ||
      typeof next !== 'function' ||
      (release !== undefined && typeof release !== 'function') ||
      typeof getCompletion !== 'function'
    ) {
      throw new ProviderStreamProtocolError();
    }

    const nextMethod =
      next as HostedChatStream['iterator']['next'];
    const returnMethod = release as Exclude<
      HostedChatStream['iterator']['return'],
      undefined
    > | undefined;
    const completionMethod =
      getCompletion as HostedChatStream['getCompletion'];
    return {
      iterator: {
        next: nextMethod.bind(iterator),
        ...(returnMethod
          ? { return: returnMethod.bind(iterator) }
          : {})
      },
      getCompletion: completionMethod.bind(result)
    };
  } catch (error: unknown) {
    if (error instanceof ProviderStreamProtocolError) throw error;
    throw new ProviderStreamProtocolError();
  }
}

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

function methodNotAllowedResponse(): Response {
  return new Response(null, {
    status: 405,
    headers: {
      ...NO_STORE_RESPONSE_HEADERS,
      Allow: 'POST'
    }
  });
}

function encodeFrame(frame: ChatStreamFrame): Uint8Array {
  return TEXT_ENCODER.encode(`${JSON.stringify(frame)}\n`);
}

const TERMINAL_FRAME_BYTE_BUDGET = Math.max(
  encodeFrame({ type: 'finish', finishReason: 'length' }).byteLength,
  encodeFrame({
    type: 'error',
    code: 'STREAM_ERROR',
    message: STREAM_ERROR_MESSAGE
  }).byteLength
);

function releaseHostedStream(hostedStream: HostedChatStream): void {
  try {
    const cleanup = hostedStream.iterator.return?.();
    if (cleanup !== undefined) {
      void Promise.resolve(cleanup).catch(() => undefined);
    }
  } catch {
    // The abort signal is authoritative for best-effort upstream cleanup.
  }
}

async function withTimeout<T>(
  operation: PromiseLike<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(message);
      error.name = 'TimeoutError';
      reject(error);
    }, timeoutMs);
  });

  try {
    return await Promise.race([Promise.resolve(operation), timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

async function getHostedCompletion(
  hostedStream: HostedChatStream,
  providerDeadline: number
): Promise<ChatCompletionMetadata> {
  const timeoutMs = getRemainingTimeout(
    providerDeadline,
    COMPLETION_TIMEOUT_MS,
    'Provider completion metadata timed out.'
  );
  const result: unknown = await withTimeout(
    hostedStream.getCompletion(),
    timeoutMs,
    'Provider completion metadata timed out.'
  );
  return parseProviderCompletion(result);
}

async function getNextHostedChunk(
  hostedStream: HostedChatStream,
  providerDeadline: number
): Promise<IteratorResult<string>> {
  const timeoutMs = getRemainingTimeout(
    providerDeadline,
    PROVIDER_TIMEOUT_MS,
    'Provider stream chunk timed out.'
  );
  const result: unknown = await withTimeout(
    hostedStream.iterator.next(),
    timeoutMs,
    'Provider stream chunk timed out.'
  );
  return parseProviderChunkResult(result);
}

function getRemainingTimeout(
  deadline: number,
  maximumMs: number,
  message: string
): number {
  const timeoutMs = Math.min(
    maximumMs,
    deadline - performance.now()
  );
  if (timeoutMs <= 0) {
    const error = new Error(message);
    error.name = 'TimeoutError';
    throw error;
  }
  return timeoutMs;
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
  if (seconds > 0) {
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

function cancelSafely(
  cancelable: { cancel: () => unknown } | null | undefined
): void {
  try {
    const cancellation = cancelable?.cancel();
    if (cancellation !== undefined) {
      void Promise.resolve(cancellation).catch(() => undefined);
    }
  } catch {
    // Rejection handling remains authoritative if cleanup cannot be started.
  }
}

function cancelUnreadRequestBody(request: Request): void {
  cancelSafely(request.body);
}

async function readRequestText(request: Request): Promise<string | Response> {
  if (request.signal.aborted) return cancelledResponse();

  const [rawContentType = '', ...contentTypeParameters] = (
    request.headers.get('content-type') ?? ''
  ).split(';');
  const contentType = rawContentType.trim().toLowerCase();
  const hasUnsupportedCharset = contentTypeParameters.some(parameter => {
    const separator = parameter.indexOf('=');
    const name = (
      separator === -1 ? parameter : parameter.slice(0, separator)
    )
      .trim()
      .toLowerCase();
    if (name !== 'charset') return false;

    let value = separator === -1 ? '' : parameter.slice(separator + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    return value.toLowerCase() !== 'utf-8';
  });
  if (contentType !== 'application/json' || hasUnsupportedCharset) {
    cancelUnreadRequestBody(request);
    return jsonError(
      400,
      'VALIDATION_ERROR',
      'Send the conversation as application/json.'
    );
  }

  const contentEncoding = request.headers.get('content-encoding');
  if (
    contentEncoding !== null &&
    contentEncoding.trim().toLowerCase() !== 'identity'
  ) {
    cancelUnreadRequestBody(request);
    return jsonError(400, 'VALIDATION_ERROR', 'Send a valid chat request.');
  }

  let declaredBytes: number | undefined;
  const declaredLength = request.headers.get('content-length');
  const transferEncoding = request.headers.get('transfer-encoding');
  if (declaredLength !== null && transferEncoding !== null) {
    cancelUnreadRequestBody(request);
    return jsonError(400, 'VALIDATION_ERROR', 'Send a valid chat request.');
  }
  if (
    transferEncoding !== null &&
    transferEncoding.trim().toLowerCase() !== 'chunked'
  ) {
    cancelUnreadRequestBody(request);
    return jsonError(400, 'VALIDATION_ERROR', 'Send a valid chat request.');
  }

  if (declaredLength !== null) {
    const normalizedLength = declaredLength.trim();
    if (!/^\d+$/.test(normalizedLength)) {
      cancelUnreadRequestBody(request);
      return jsonError(
        400,
        'VALIDATION_ERROR',
        'Send a valid chat request.'
      );
    }

    const bytes = Number(normalizedLength);
    if (!Number.isSafeInteger(bytes) || bytes > MAX_REQUEST_BYTES) {
      cancelUnreadRequestBody(request);
      return jsonError(
        413,
        'PAYLOAD_TOO_LARGE',
        'Please shorten your message and try again.'
      );
    }
    declaredBytes = bytes;
  }

  if (!request.body) {
    return declaredBytes === undefined || declaredBytes === 0
      ? ''
      : jsonError(400, 'VALIDATION_ERROR', 'Send a valid chat request.');
  }
  if (declaredBytes === 0) {
    cancelUnreadRequestBody(request);
    return '';
  }

  let reader: ReadableStreamDefaultReader<Uint8Array>;
  try {
    reader = request.body.getReader();
  } catch {
    return jsonError(
      400,
      'VALIDATION_ERROR',
      'Check your conversation and try again.'
    );
  }
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let receivedBytes = 0;
  let text = '';
  let consecutiveEmptyChunks = 0;
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
        cancelSafely(reader);
        return cancelledResponse();
      }
      if (next === REQUEST_BODY_TIMEOUT) {
        cancelSafely(reader);
        return jsonError(
          408,
          'TIMEOUT',
          'The chat request took too long. Please try again.'
        );
      }

      const { done, value } = next;
      if (done) break;

      const chunkBytes = value.byteLength;
      if (chunkBytes === 0) {
        consecutiveEmptyChunks += 1;
        if (
          consecutiveEmptyChunks > MAX_CONSECUTIVE_EMPTY_REQUEST_CHUNKS
        ) {
          cancelSafely(reader);
          return jsonError(
            400,
            'VALIDATION_ERROR',
            'Send a valid chat request.'
          );
        }
      } else {
        consecutiveEmptyChunks = 0;
      }
      receivedBytes += chunkBytes;
      if (declaredBytes !== undefined && receivedBytes > declaredBytes) {
        cancelSafely(reader);
        return jsonError(
          400,
          'VALIDATION_ERROR',
          'Send a valid chat request.'
        );
      }
      if (receivedBytes > MAX_REQUEST_BYTES) {
        cancelSafely(reader);
        return jsonError(
          413,
          'PAYLOAD_TOO_LARGE',
          'Please shorten your message and try again.'
        );
      }
      text += decoder.decode(value, { stream: true });
    }
    if (declaredBytes !== undefined && receivedBytes !== declaredBytes) {
      return jsonError(400, 'VALIDATION_ERROR', 'Send a valid chat request.');
    }
    text += decoder.decode();
    return text;
  } catch {
    if (request.signal.aborted) return cancelledResponse();
    cancelSafely(reader);
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
  providerDeadline: number,
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
  let providerChunkCount = firstChunk.done ? 0 : 1;
  let streamedOutputBytes = 0;

  const stream = new ReadableStream<Uint8Array>({
    start(controller): void {
      const pump = async (): Promise<void> => {
        const enqueueDelta = (delta: string): boolean => {
          const encodedDelta = encodeFrame({ type: 'text-delta', delta });
          const nextByteCount =
            streamedOutputBytes + encodedDelta.byteLength;
          if (
            nextByteCount + TERMINAL_FRAME_BYTE_BUDGET >
            MAX_STREAM_OUTPUT_BYTES
          ) {
            return false;
          }

          streamedOutputBytes = nextByteCount;
          controller.enqueue(encodedDelta);
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
          if (!firstChunk.done) {
            if (firstChunk.value) {
              if (!enqueueDelta(firstChunk.value)) {
                stopAtOutputLimit();
                return;
              }
            }
          }

          let nextChunk = firstChunk.done
            ? firstChunk
            : await getNextHostedChunk(
                hostedStream,
                providerDeadline
              );

          while (!nextChunk.done) {
            providerChunkCount += 1;
            if (providerChunkCount > MAX_PROVIDER_CHUNK_COUNT) {
              throw new ProviderStreamProtocolError();
            }
            if (nextChunk.value) {
              if (!enqueueDelta(nextChunk.value)) {
                stopAtOutputLimit();
                return;
              }
            }
            nextChunk = await getNextHostedChunk(
              hostedStream,
              providerDeadline
            );
          }

          const completion = await getHostedCompletion(
            hostedStream,
            providerDeadline
          );
          const finishReason = normalizeFinishReason(completion.finishReason);
          if (finishReason !== 'stop' && finishReason !== 'length') {
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

          const providerProtocolFailure =
            error instanceof ProviderStreamProtocolError;
          const classified = classifyProviderError(error);
          abortController.abort(error);
          releaseHostedStream(hostedStream);
          emitOutcome(classified.telemetryStatus, {
            errorCategory: providerProtocolFailure
              ? 'provider_protocol'
              : classified.category
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
  const startedAt = performance.now();
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
      durationMs: Math.max(
        0,
        Math.round(performance.now() - startedAt)
      ),
      ...details
    });
  };

  if (request.method !== 'POST') {
    cancelUnreadRequestBody(request);
    emitOutcome('rejected', { errorCategory: 'method' });
    return methodNotAllowedResponse();
  }

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
  let pendingHostedStream: HostedChatStream | undefined;
  const providerDeadline = performance.now() + PROVIDER_TIMEOUT_MS;

  try {
    const started = await withTimeout(
      (async () => {
        const hostedStream: unknown = await resolved.startChat({
          messages,
          signal: abortController.signal,
          systemPrompt: CHAT_SYSTEM_PROMPT
        });
        pendingHostedStream = hostedStream as HostedChatStream;
        if (abortController.signal.aborted) {
          releaseHostedStream(pendingHostedStream);
          throw (
            abortController.signal.reason ??
            new DOMException('Provider startup was aborted.', 'AbortError')
          );
        }
        const stableHostedStream = parseHostedChatStream(hostedStream);
        pendingHostedStream = stableHostedStream;
        const firstChunkTimeout = getRemainingTimeout(
          providerDeadline,
          PROVIDER_TIMEOUT_MS,
          'Provider startup timed out.'
        );
        const firstChunk = parseProviderChunkResult(
          await withTimeout(
            stableHostedStream.iterator.next(),
            firstChunkTimeout,
            'Provider startup timed out.'
          )
        );
        return {
          hostedStream: stableHostedStream,
          firstChunk
        };
      })(),
      PROVIDER_TIMEOUT_MS,
      'Provider startup timed out.'
    );

    if (abortController.signal.aborted) {
      emitOutcome('cancelled', { errorCategory: 'cancelled' });
      removeAbortListener();
      return cancelledResponse();
    }

    return createStreamResponse(
      started.hostedStream,
      started.firstChunk,
      providerDeadline,
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

    const providerProtocolFailure =
      error instanceof ProviderStreamProtocolError;
    const classified = classifyProviderError(error, resolved.now());
    abortController.abort(error);
    if (pendingHostedStream) releaseHostedStream(pendingHostedStream);
    emitOutcome(classified.telemetryStatus, {
      errorCategory: providerProtocolFailure
        ? 'provider_protocol'
        : classified.category
    });
    return jsonError(
      classified.status,
      classified.code,
      classified.message,
      classified.retryAfter
    );
  }
}
