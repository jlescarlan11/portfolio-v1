import { APICallError } from 'ai';
import { CHAT_SYSTEM_PROMPT } from '../content';
import {
  ChatConfigurationError,
  MAX_REQUEST_BYTES
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

const STREAM_ERROR_MESSAGE = 'The AI service stopped responding. Please try again.';

function jsonError(
  status: number,
  code: ChatErrorCode,
  message: string,
  retryAfter?: number
): Response {
  const body: ChatErrorBody = { error: { code, message } };
  const headers = new Headers({
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8'
  });

  if (retryAfter !== undefined) {
    headers.set('Retry-After', String(retryAfter));
  }

  return new Response(JSON.stringify(body), { status, headers });
}

function encodeFrame(frame: ChatStreamFrame): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(frame)}\n`);
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

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      receivedBytes += value.byteLength;
      if (receivedBytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
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
    return jsonError(400, 'VALIDATION_ERROR', 'Check your conversation and try again.');
  } finally {
    reader.releaseLock();
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

  const stream = new ReadableStream<Uint8Array>({
    start(controller): void {
      const pump = async (): Promise<void> => {
        try {
          if (!firstChunk.done && firstChunk.value) {
            controller.enqueue(
              encodeFrame({ type: 'text-delta', delta: firstChunk.value })
            );
          }

          let nextChunk = firstChunk.done
            ? firstChunk
            : await hostedStream.iterator.next();

          while (!nextChunk.done) {
            if (nextChunk.value) {
              controller.enqueue(
                encodeFrame({ type: 'text-delta', delta: nextChunk.value })
              );
            }
            nextChunk = await hostedStream.iterator.next();
          }

          const completion = await hostedStream.getCompletion();
          if (completion.finishReason === 'error') {
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

          const reachedOutputLimit = completion.finishReason === 'length';
          emitOutcome(reachedOutputLimit ? 'output_limit' : 'success', {
            inputTokens: completion.inputTokens,
            outputTokens: completion.outputTokens,
            finishReason: completion.finishReason
          });
          controller.enqueue(
            encodeFrame({
              type: 'finish',
              finishReason: completion.finishReason
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
    async cancel(): Promise<void> {
      abortController.abort(new DOMException('Client cancelled the stream.', 'AbortError'));
      try {
        await hostedStream.iterator.return?.();
      } catch {
        // Cancellation cleanup is best-effort; the abort signal is authoritative.
      } finally {
        if (!completed) {
          emitOutcome('cancelled', { errorCategory: 'cancelled' });
          completed = true;
        }
        removeAbortListener();
      }
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
    emitOutcome('rejected', {
      errorCategory: requestText.status === 413 ? 'payload' : 'request'
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
      return new Response(null, { status: 499 });
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
      return new Response(null, { status: 499 });
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
