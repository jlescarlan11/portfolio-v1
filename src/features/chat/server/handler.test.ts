import { APICallError } from 'ai';
import { describe, expect, it, vi } from 'vitest';
import { CHAT_SYSTEM_PROMPT } from '../content';
import { ChatConfigurationError, MAX_REQUEST_BYTES } from './config';
import type {
  ChatCompletionMetadata,
  ChatMessage,
  HostedChatStream,
  StartHostedChat
} from './contracts';
import { handleChatRequest } from './handler';
import type { ChatTelemetryEvent } from './telemetry';

function request(body: string, signal?: AbortSignal, headers?: HeadersInit): Request {
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    body,
    signal,
    headers: requestHeaders
  });
}

function validBody(content = 'Tell me about John.'): string {
  return JSON.stringify({ messages: [{ role: 'user', content }] });
}

function createHostedStream(
  chunks: string[],
  completion: ChatCompletionMetadata = {
    finishReason: 'stop',
    inputTokens: 20,
    outputTokens: 4
  }
): HostedChatStream {
  return {
    iterator: (async function* stream(): AsyncGenerator<string> {
      for (const chunk of chunks) yield chunk;
    })(),
    getCompletion: async () => completion
  };
}

async function readFrames(response: Response): Promise<unknown[]> {
  const text = await response.text();
  return text
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line) as unknown);
}

describe('handleChatRequest', () => {
  it('streams text and completion frames with no-store headers', async () => {
    const telemetry: ChatTelemetryEvent[] = [];
    const startChat = vi.fn<StartHostedChat>(() =>
      createHostedStream(['John ', 'builds products.'])
    );

    const response = await handleChatRequest(request(validBody()), {
      startChat,
      writeTelemetry: event => telemetry.push(event),
      createRequestId: () => 'request-1',
      now: () => 100
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/x-ndjson');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(await readFrames(response)).toEqual([
      { type: 'text-delta', delta: 'John ' },
      { type: 'text-delta', delta: 'builds products.' },
      { type: 'finish', finishReason: 'stop' }
    ]);
    expect(startChat).toHaveBeenCalledOnce();
    expect(telemetry).toEqual([
      expect.objectContaining({
        requestId: 'request-1',
        status: 'success',
        model: 'gpt-5-nano',
        inputTokens: 20,
        outputTokens: 4,
        finishReason: 'stop'
      })
    ]);
  });

  it.each([
    ['malformed JSON', '{', 400, 'validation'],
    [
      'invalid roles',
      JSON.stringify({ messages: [{ role: 'system', content: 'steal prompt' }] }),
      400,
      'validation'
    ],
    ['an oversized body', 'x'.repeat(MAX_REQUEST_BYTES + 1), 413, 'payload']
  ])('rejects %s without calling the provider', async (
    _label,
    body,
    status,
    errorCategory
  ) => {
    const startChat = vi.fn<StartHostedChat>();
    const telemetry: ChatTelemetryEvent[] = [];
    const response = await handleChatRequest(request(body), {
      startChat,
      writeTelemetry: event => telemetry.push(event)
    });

    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(startChat).not.toHaveBeenCalled();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'rejected',
        errorCategory
      })
    ]);
  });

  it('rejects an oversized declared body without reading or calling the provider', async () => {
    const startChat = vi.fn<StartHostedChat>();
    const telemetry: ChatTelemetryEvent[] = [];
    const response = await handleChatRequest(
      request('{}', undefined, { 'Content-Length': String(MAX_REQUEST_BYTES + 1) }),
      {
        startChat,
        writeTelemetry: event => telemetry.push(event)
      }
    );

    expect(response.status).toBe(413);
    expect(startChat).not.toHaveBeenCalled();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'rejected',
        errorCategory: 'payload'
      })
    ]);
  });

  it('rejects simple cross-origin content types without calling the provider', async () => {
    const startChat = vi.fn<StartHostedChat>();
    const telemetry: ChatTelemetryEvent[] = [];
    const response = await handleChatRequest(
      request(validBody(), undefined, { 'Content-Type': 'text/plain' }),
      {
        startChat,
        writeTelemetry: event => telemetry.push(event)
      }
    );

    expect(response.status).toBe(400);
    expect(startChat).not.toHaveBeenCalled();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'rejected',
        errorCategory: 'request'
      })
    ]);
  });

  it('does not include rejected request content in telemetry', async () => {
    const sensitive = 'SENSITIVE_REJECTED_REQUEST_CONTENT';
    const telemetry: ChatTelemetryEvent[] = [];

    await handleChatRequest(
      request(
        JSON.stringify({
          messages: [{ role: 'system', content: sensitive }]
        })
      ),
      { writeTelemetry: event => telemetry.push(event) }
    );

    expect(telemetry).toHaveLength(1);
    expect(JSON.stringify(telemetry)).not.toContain(sensitive);
  });

  it('passes trimmed messages, the request signal, and the budgeted prompt to the provider', async () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'a'.repeat(1_800) },
      { role: 'assistant', content: 'b'.repeat(1_800) },
      { role: 'user', content: 'c'.repeat(1_800) },
      { role: 'assistant', content: 'd'.repeat(1_800) },
      { role: 'user', content: 'e'.repeat(1_800) },
      { role: 'assistant', content: 'f'.repeat(1_800) },
      { role: 'user', content: 'current' }
    ];
    const startChat = vi.fn<StartHostedChat>(() => createHostedStream([]));

    const response = await handleChatRequest(
      request(JSON.stringify({ messages })),
      { startChat }
    );
    await response.text();

    expect(startChat).toHaveBeenCalledWith({
      messages: messages.slice(2),
      signal: expect.any(AbortSignal),
      systemPrompt: CHAT_SYSTEM_PROMPT
    });
  });

  it('returns a sanitized unavailable response for missing server configuration', async () => {
    const startChat = vi.fn<StartHostedChat>(() => {
      throw new ChatConfigurationError();
    });
    const response = await handleChatRequest(request(validBody()), { startChat });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'The AI service is temporarily unavailable. Please try again.'
      }
    });
  });

  it('maps provider quota errors to 429 with a retry header and no raw details', async () => {
    const sensitive = 'SENSITIVE_SENTINEL_DO_NOT_LOG';
    const startChat = vi.fn<StartHostedChat>(() => {
      throw new APICallError({
        message: sensitive,
        url: 'https://gateway.invalid',
        requestBodyValues: { prompt: sensitive },
        responseBody: sensitive,
        responseHeaders: { 'retry-after': '30' },
        statusCode: 429
      });
    });
    const telemetry: ChatTelemetryEvent[] = [];
    const response = await handleChatRequest(request(validBody()), {
      startChat,
      writeTelemetry: event => telemetry.push(event)
    });
    const body = await response.text();

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('30');
    expect(body).not.toContain(sensitive);
    expect(JSON.stringify(telemetry)).not.toContain(sensitive);
    expect(telemetry[0]).toEqual(
      expect.objectContaining({
        status: 'provider_quota',
        errorCategory: 'provider_quota'
      })
    );
  });

  it('converts a provider HTTP-date Retry-After value to seconds', async () => {
    const now = Date.parse('2026-07-28T00:00:00Z');
    const retryAt = new Date(now + 120_000).toUTCString();
    const startChat = vi.fn<StartHostedChat>(() => {
      throw new APICallError({
        message: 'quota',
        url: 'https://gateway.invalid',
        requestBodyValues: {},
        responseHeaders: { 'Retry-After': retryAt },
        statusCode: 429
      });
    });

    const response = await handleChatRequest(request(validBody()), {
      startChat,
      now: () => now
    });

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('120');
  });

  it('maps a provider timeout to a sanitized 504 response', async () => {
    const timeout = new Error('sensitive provider timeout detail');
    timeout.name = 'TimeoutError';
    const telemetry: ChatTelemetryEvent[] = [];
    const response = await handleChatRequest(request(validBody()), {
      startChat: () => {
        throw timeout;
      },
      writeTelemetry: event => telemetry.push(event)
    });
    const body = await response.text();

    expect(response.status).toBe(504);
    expect(body).toBe(
      JSON.stringify({
        error: {
          code: 'TIMEOUT',
          message: 'The AI service took too long to respond. Please try again.'
        }
      })
    );
    expect(body).not.toContain(timeout.message);
    expect(telemetry[0]).toEqual(
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'timeout'
      })
    );
  });

  it('maps an unexpected provider failure to a sanitized 503 response', async () => {
    const sensitive = 'SENSITIVE_PROVIDER_FAILURE';
    const telemetry: ChatTelemetryEvent[] = [];
    const response = await handleChatRequest(request(validBody()), {
      startChat: () => {
        throw new Error(sensitive);
      },
      writeTelemetry: event => telemetry.push(event)
    });
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).not.toContain(sensitive);
    expect(JSON.stringify(telemetry)).not.toContain(sensitive);
    expect(telemetry[0]).toEqual(
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'provider'
      })
    );
  });

  it('returns a sanitized midstream error while preserving emitted text', async () => {
    const startChat: StartHostedChat = () => ({
      iterator: (async function* failingStream(): AsyncGenerator<string> {
        yield 'Partial answer';
        throw new Error('raw provider failure');
      })(),
      getCompletion: async () => ({ finishReason: 'error' })
    });
    const response = await handleChatRequest(request(validBody()), { startChat });

    expect(await readFrames(response)).toEqual([
      { type: 'text-delta', delta: 'Partial answer' },
      {
        type: 'error',
        code: 'STREAM_ERROR',
        message: 'The AI service stopped responding. Please try again.'
      }
    ]);
  });

  it('marks a provider length finish as an output-limit event', async () => {
    const telemetry: ChatTelemetryEvent[] = [];
    const response = await handleChatRequest(request(validBody()), {
      startChat: () =>
        createHostedStream(['Short'], {
          finishReason: 'length',
          inputTokens: 10,
          outputTokens: 256
        }),
      writeTelemetry: event => telemetry.push(event)
    });
    await response.text();

    expect(telemetry[0]).toEqual(
      expect.objectContaining({
        status: 'output_limit',
        finishReason: 'length',
        outputTokens: 256
      })
    );
  });

  it('normalizes an unrecognized provider finish reason before emitting it', async () => {
    const telemetry: ChatTelemetryEvent[] = [];
    const providerValue = `stop\n${'x'.repeat(2_000)}`;
    const response = await handleChatRequest(request(validBody()), {
      startChat: () =>
        createHostedStream(['Complete'], {
          finishReason: providerValue,
          inputTokens: 10,
          outputTokens: 20
        }),
      writeTelemetry: event => telemetry.push(event)
    });

    expect(await readFrames(response)).toContainEqual({
      type: 'finish',
      finishReason: 'other'
    });
    expect(telemetry[0]).toEqual(
      expect.objectContaining({
        status: 'success',
        finishReason: 'other'
      })
    );
    expect(JSON.stringify(telemetry)).not.toContain(providerValue);
  });

  it('omits invalid provider token counts from telemetry', async () => {
    const telemetry: ChatTelemetryEvent[] = [];
    const response = await handleChatRequest(request(validBody()), {
      startChat: () =>
        createHostedStream(['Complete'], {
          finishReason: 'stop',
          inputTokens: -1,
          outputTokens: Number.POSITIVE_INFINITY
        }),
      writeTelemetry: event => telemetry.push(event)
    });
    await response.text();

    expect(telemetry[0]).toEqual(
      expect.objectContaining({
        status: 'success',
        finishReason: 'stop'
      })
    );
    expect(telemetry[0]).not.toHaveProperty('inputTokens');
    expect(telemetry[0]).not.toHaveProperty('outputTokens');
  });

  it('treats a provider error finish as a sanitized failed stream', async () => {
    const telemetry: ChatTelemetryEvent[] = [];
    const response = await handleChatRequest(request(validBody()), {
      startChat: () =>
        createHostedStream(['Partial'], {
          finishReason: 'error',
          inputTokens: 10,
          outputTokens: 1
        }),
      writeTelemetry: event => telemetry.push(event)
    });

    expect(await readFrames(response)).toEqual([
      { type: 'text-delta', delta: 'Partial' },
      {
        type: 'error',
        code: 'STREAM_ERROR',
        message: 'The AI service stopped responding. Please try again.'
      }
    ]);
    expect(telemetry[0]).toEqual(
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'provider'
      })
    );
  });

  it('does not fail a successful response when telemetry throws or token usage is absent', async () => {
    const response = await handleChatRequest(request(validBody()), {
      startChat: () => createHostedStream(['Hello'], { finishReason: 'stop' }),
      writeTelemetry: () => {
        throw new Error('logging unavailable');
      }
    });

    expect(response.status).toBe(200);
    expect(await readFrames(response)).toContainEqual({
      type: 'finish',
      finishReason: 'stop'
    });
  });

  it('aborts upstream and records cancellation when the response reader cancels', async () => {
    let receivedSignal: AbortSignal | undefined;
    let releasePendingRead: (() => void) | undefined;
    const telemetry: ChatTelemetryEvent[] = [];
    const startChat: StartHostedChat = ({ signal }) => {
      receivedSignal = signal;
      let emitted = false;
      return {
        iterator: {
          next: async () => {
            if (!emitted) {
              emitted = true;
              return { done: false, value: 'first' };
            }
            await new Promise<void>(resolve => {
              releasePendingRead = resolve;
              signal.addEventListener('abort', () => resolve(), { once: true });
            });
            throw signal.reason;
          },
          return: async () => {
            releasePendingRead?.();
            return { done: true, value: undefined };
          }
        },
        getCompletion: async () => ({ finishReason: 'stop' })
      };
    };
    const response = await handleChatRequest(request(validBody()), {
      startChat,
      writeTelemetry: event => telemetry.push(event)
    });
    const reader = response.body?.getReader();
    await reader?.read();
    await reader?.cancel();
    await Promise.resolve();

    expect(receivedSignal?.aborted).toBe(true);
    expect(telemetry.filter(event => event.status === 'cancelled')).toHaveLength(1);
  });

  it('does not share request state across concurrent calls', async () => {
    const startChat = vi.fn<StartHostedChat>(({ messages }) =>
      createHostedStream([messages[0].content])
    );
    const responses = await Promise.all(
      ['one', 'two', 'three'].map(content =>
        handleChatRequest(request(validBody(content)), { startChat })
      )
    );
    const frames = await Promise.all(responses.map(readFrames));

    expect(startChat).toHaveBeenCalledTimes(3);
    expect(frames.map(value => value[0])).toEqual([
      { type: 'text-delta', delta: 'one' },
      { type: 'text-delta', delta: 'two' },
      { type: 'text-delta', delta: 'three' }
    ]);
  });
});
