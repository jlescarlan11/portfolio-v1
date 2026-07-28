import { APICallError } from 'ai';
import { describe, expect, it, vi } from 'vitest';
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
        model: 'openai/gpt-5-nano',
        inputTokens: 20,
        outputTokens: 4,
        finishReason: 'stop'
      })
    ]);
  });

  it('measures telemetry duration with a monotonic clock', async () => {
    vi.useFakeTimers();
    try {
      let wallNow = 1_000;
      const telemetry: ChatTelemetryEvent[] = [];
      let nextCall = 0;
      const responsePromise = handleChatRequest(request(validBody()), {
        startChat: () => ({
          iterator: {
            next: async () => {
              nextCall += 1;
              if (nextCall > 1) {
                return { done: true as const, value: undefined };
              }
              return new Promise<IteratorResult<string>>(resolve => {
                setTimeout(() => {
                  wallNow = 0;
                  resolve({ done: false, value: 'Complete' });
                }, 1_000);
              });
            }
          },
          getCompletion: async () => ({
            finishReason: 'stop',
            inputTokens: 10,
            outputTokens: 2
          })
        }),
        now: () => wallNow,
        writeTelemetry: event => telemetry.push(event)
      });

      await vi.advanceTimersByTimeAsync(1_000);
      const response = await responsePromise;
      await response.text();

      expect(telemetry).toEqual([
        expect.objectContaining({
          status: 'success',
          durationMs: expect.any(Number)
        })
      ]);
      expect(telemetry[0].durationMs).toBeGreaterThanOrEqual(1_000);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects non-POST requests before reading or calling the provider', async () => {
    const inbound = new Request('http://localhost/api/chat', {
      method: 'DELETE',
      body: validBody(),
      headers: { 'Content-Type': 'application/json' }
    });
    const getReader = vi.spyOn(inbound.body!, 'getReader');
    const cancelBody = vi.spyOn(inbound.body!, 'cancel');
    const startChat = vi.fn<StartHostedChat>(() =>
      createHostedStream(['should not run'])
    );

    const response = await handleChatRequest(inbound, { startChat });

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
    expect(getReader).not.toHaveBeenCalled();
    expect(cancelBody).toHaveBeenCalledOnce();
    expect(startChat).not.toHaveBeenCalled();
  });

  it('assimilates a PromiseLike unread request cancellation', async () => {
    let cancellationStarted = false;
    const inbound = new Request('http://localhost/api/chat', {
      method: 'DELETE',
      body: validBody(),
      headers: { 'Content-Type': 'application/json' }
    });
    vi.spyOn(inbound.body!, 'cancel').mockReturnValue(
      {
        then: (resolve: (value: void) => void) => {
          cancellationStarted = true;
          resolve();
        }
      } as Promise<void>
    );

    const response = await handleChatRequest(inbound);
    await Promise.resolve();

    expect(response.status).toBe(405);
    expect(cancellationStarted).toBe(true);
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

  it('rejects invalid request UTF-8 without calling the provider', async () => {
    const encoder = new TextEncoder();
    const prefix = encoder.encode(
      '{"messages":[{"role":"user","content":"'
    );
    const suffix = encoder.encode('"}]}');
    const bytes = new Uint8Array(prefix.length + suffix.length + 1);
    bytes.set(prefix);
    bytes[prefix.length] = 0xff;
    bytes.set(suffix, prefix.length + 1);
    const inboundRequest = {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: new ReadableStream<Uint8Array>({
        start(controller): void {
          controller.enqueue(bytes);
          controller.close();
        }
      }),
      signal: new AbortController().signal
    } as Request;
    const startChat = vi.fn<StartHostedChat>(() =>
      createHostedStream(['should not run'])
    );

    const response = await handleChatRequest(inboundRequest, { startChat });

    expect(response.status).toBe(400);
    expect(startChat).not.toHaveBeenCalled();
  });

  it('cancels a request body that yields a non-byte chunk', async () => {
    const cancelBody = vi.fn();
    const inboundRequest = {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: new ReadableStream<Uint8Array>({
        start(controller): void {
          controller.enqueue('not bytes' as unknown as Uint8Array);
        },
        cancel: cancelBody
      }),
      signal: new AbortController().signal
    } as Request;
    const startChat = vi.fn<StartHostedChat>();

    const response = await handleChatRequest(inboundRequest, { startChat });

    expect(response.status).toBe(400);
    expect(cancelBody).toHaveBeenCalledOnce();
    expect(startChat).not.toHaveBeenCalled();
  });

  it('rejects a request body that makes no byte progress', async () => {
    const cancelBody = vi.fn();
    const inboundRequest = {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: new ReadableStream<Uint8Array>({
        start(controller): void {
          for (let index = 0; index < 64; index += 1) {
            controller.enqueue(new Uint8Array());
          }
          controller.enqueue(new TextEncoder().encode(validBody()));
          controller.close();
        },
        cancel: cancelBody
      }),
      signal: new AbortController().signal
    } as Request;
    const startChat = vi.fn<StartHostedChat>(() =>
      createHostedStream(['should not run'])
    );

    const response = await handleChatRequest(inboundRequest, { startChat });

    expect(response.status).toBe(400);
    expect(cancelBody).toHaveBeenCalledOnce();
    expect(startChat).not.toHaveBeenCalled();
  });

  it('rejects a pre-locked request body without throwing', async () => {
    const body = new ReadableStream<Uint8Array>();
    const bodyLock = body.getReader();
    const inboundRequest = {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body,
      signal: new AbortController().signal
    } as Request;
    const startChat = vi.fn<StartHostedChat>();

    try {
      const response = await handleChatRequest(inboundRequest, { startChat });

      expect(response.status).toBe(400);
      expect(startChat).not.toHaveBeenCalled();
    } finally {
      await bodyLock.cancel();
      bodyLock.releaseLock();
    }
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

  it.each(['-1', '1.5', 'not-a-number'])(
    'rejects an invalid Content-Length value %s before reading',
    async (declaredLength) => {
      const startChat = vi.fn<StartHostedChat>();
      const body = new ReadableStream<Uint8Array>({
        start(controller): void {
          controller.enqueue(new TextEncoder().encode(validBody()));
          controller.close();
        }
      });
      const getReader = vi.spyOn(body, 'getReader');
      const inboundRequest = {
        method: 'POST',
        headers: new Headers({
          'Content-Length': declaredLength,
          'Content-Type': 'application/json'
        }),
        body,
        signal: new AbortController().signal
      } as Request;

      const response = await handleChatRequest(inboundRequest, { startChat });

      expect(response.status).toBe(400);
      expect(getReader).not.toHaveBeenCalled();
      expect(startChat).not.toHaveBeenCalled();
    }
  );

  it('cancels a declared-empty body without waiting for its stream', async () => {
    vi.useFakeTimers();
    try {
      const cancelBody = vi.fn();
      const inboundRequest = {
        method: 'POST',
        headers: new Headers({
          'Content-Length': '0',
          'Content-Type': 'application/json'
        }),
        body: new ReadableStream<Uint8Array>({
          cancel: cancelBody
        }),
        signal: new AbortController().signal
      } as Request;
      const startChat = vi.fn<StartHostedChat>();
      let response: Response | undefined;
      void handleChatRequest(inboundRequest, { startChat }).then(value => {
        response = value;
      });

      await vi.advanceTimersByTimeAsync(0);
      const settledBeforeTimeout = response !== undefined;
      if (!settledBeforeTimeout) {
        await vi.advanceTimersByTimeAsync(REQUEST_BODY_TIMEOUT_MS);
      }

      expect(settledBeforeTimeout).toBe(true);
      expect(response?.status).toBe(400);
      expect(cancelBody).toHaveBeenCalledOnce();
      expect(startChat).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects a body whose byte count differs from Content-Length', async () => {
    const startChat = vi.fn<StartHostedChat>();
    const encodedBody = new TextEncoder().encode(validBody());
    const inboundRequest = {
      method: 'POST',
      headers: new Headers({
        'Content-Length': String(encodedBody.byteLength - 1),
        'Content-Type': 'application/json'
      }),
      body: new ReadableStream<Uint8Array>({
        start(controller): void {
          controller.enqueue(encodedBody);
          controller.close();
        }
      }),
      signal: new AbortController().signal
    } as Request;

    const response = await handleChatRequest(inboundRequest, { startChat });

    expect(response.status).toBe(400);
    expect(startChat).not.toHaveBeenCalled();
  });

  it('rejects and cancels a body as soon as it exceeds Content-Length', async () => {
    vi.useFakeTimers();
    try {
      const cancelBody = vi.fn();
      const inboundRequest = {
        method: 'POST',
        headers: new Headers({
          'Content-Length': '1',
          'Content-Type': 'application/json'
        }),
        body: new ReadableStream<Uint8Array>({
          start(controller): void {
            controller.enqueue(new TextEncoder().encode('{}'));
          },
          cancel: cancelBody
        }),
        signal: new AbortController().signal
      } as Request;
      const startChat = vi.fn<StartHostedChat>();
      let response: Response | undefined;
      void handleChatRequest(inboundRequest, { startChat }).then(value => {
        response = value;
      });

      await vi.advanceTimersByTimeAsync(0);
      const settledBeforeTimeout = response !== undefined;
      if (!settledBeforeTimeout) {
        await vi.advanceTimersByTimeAsync(REQUEST_BODY_TIMEOUT_MS);
      }

      expect(settledBeforeTimeout).toBe(true);
      expect(response?.status).toBe(400);
      expect(cancelBody).toHaveBeenCalledOnce();
      expect(startChat).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects conflicting length and transfer framing before reading', async () => {
    const startChat = vi.fn<StartHostedChat>();
    const encodedBody = new TextEncoder().encode(validBody());
    const body = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(encodedBody);
        controller.close();
      }
    });
    const getReader = vi.spyOn(body, 'getReader');
    const inboundRequest = {
      method: 'POST',
      headers: new Headers({
        'Content-Length': String(encodedBody.byteLength),
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked'
      }),
      body,
      signal: new AbortController().signal
    } as Request;

    const response = await handleChatRequest(inboundRequest, { startChat });

    expect(response.status).toBe(400);
    expect(getReader).not.toHaveBeenCalled();
    expect(startChat).not.toHaveBeenCalled();
  });

  it('rejects an unsupported transfer coding before reading', async () => {
    const encodedBody = new TextEncoder().encode(validBody());
    const body = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(encodedBody);
        controller.close();
      }
    });
    const getReader = vi.spyOn(body, 'getReader');
    const inboundRequest = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'gzip'
      }),
      body,
      signal: new AbortController().signal
    } as Request;
    const startChat = vi.fn<StartHostedChat>(() =>
      createHostedStream(['should not run'])
    );

    const response = await handleChatRequest(inboundRequest, { startChat });

    expect(response.status).toBe(400);
    expect(getReader).not.toHaveBeenCalled();
    expect(startChat).not.toHaveBeenCalled();
  });

  it('cancels an unread body when its declared length is oversized', async () => {
    const startChat = vi.fn<StartHostedChat>();
    const cancelBody = vi.fn();
    const inboundRequest = {
      method: 'POST',
      headers: new Headers({
        'Content-Length': String(MAX_REQUEST_BYTES + 1),
        'Content-Type': 'application/json'
      }),
      body: new ReadableStream<Uint8Array>({
        cancel: cancelBody
      }),
      signal: new AbortController().signal
    } as Request;

    const response = await handleChatRequest(inboundRequest, { startChat });

    expect(response.status).toBe(413);
    expect(cancelBody).toHaveBeenCalledOnce();
    expect(startChat).not.toHaveBeenCalled();
  });

  it('does not wait for oversized body cancellation to settle', async () => {
    vi.useFakeTimers();
    try {
      const startChat = vi.fn<StartHostedChat>();
      const cancelBody = vi.fn(() => new Promise<void>(() => undefined));
      const inboundRequest = {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: new ReadableStream<Uint8Array>({
          start(controller): void {
            controller.enqueue(
              new Uint8Array(MAX_REQUEST_BYTES + 1)
            );
          },
          cancel: cancelBody
        }),
        signal: new AbortController().signal
      } as Request;
      let response: Response | undefined;
      void handleChatRequest(inboundRequest, { startChat }).then(value => {
        response = value;
      });

      await vi.advanceTimersByTimeAsync(50);

      expect(response?.status).toBe(413);
      expect(cancelBody).toHaveBeenCalledOnce();
      expect(startChat).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('times out and cancels a request body that never closes', async () => {
    vi.useFakeTimers();
    const startChat = vi.fn<StartHostedChat>();
    const cancelBody = vi.fn();
    const requestInit: RequestInit & { duplex: 'half' } = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: new ReadableStream<Uint8Array>({
        start(controller): void {
          controller.enqueue(
            new TextEncoder().encode('{"messages":[')
          );
        },
        cancel: cancelBody
      }),
      duplex: 'half'
    };
    const responsePromise = handleChatRequest(
      new Request('http://localhost/api/chat', requestInit),
      { startChat }
    );

    await vi.advanceTimersByTimeAsync(REQUEST_BODY_TIMEOUT_MS);
    const response = await Promise.race([
      responsePromise,
      Promise.resolve(undefined)
    ]);

    expect(response?.status).toBe(408);
    expect(await response?.json()).toEqual({
      error: {
        code: 'TIMEOUT',
        message: 'The chat request took too long. Please try again.'
      }
    });
    expect(cancelBody).toHaveBeenCalledOnce();
    expect(startChat).not.toHaveBeenCalled();
  });

  it('treats a client disconnect during request ingestion as cancellation', async () => {
    const abortController = new AbortController();
    const startChat = vi.fn<StartHostedChat>();
    const telemetry: ChatTelemetryEvent[] = [];
    const inboundRequest = {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: new ReadableStream<Uint8Array>({
        start(controller): void {
          controller.enqueue(
            new TextEncoder().encode('{"messages":[')
          );
          abortController.signal.addEventListener(
            'abort',
            () => controller.error(abortController.signal.reason),
            { once: true }
          );
        }
      }),
      signal: abortController.signal
    } as Request;
    const responsePromise = handleChatRequest(
      inboundRequest,
      {
        startChat,
        writeTelemetry: event => telemetry.push(event)
      }
    );

    await Promise.resolve();
    abortController.abort(
      new DOMException('Client disconnected.', 'AbortError')
    );
    const response = await responsePromise;

    expect(response.status).toBe(499);
    expect(await response.text()).toBe('');
    expect(startChat).not.toHaveBeenCalled();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'cancelled',
        errorCategory: 'cancelled'
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

  it('rejects a non-UTF-8 JSON charset before reading', async () => {
    const body = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(new TextEncoder().encode(validBody()));
        controller.close();
      }
    });
    const getReader = vi.spyOn(body, 'getReader');
    const inboundRequest = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json; charset=iso-8859-1'
      }),
      body,
      signal: new AbortController().signal
    } as Request;
    const startChat = vi.fn<StartHostedChat>(() =>
      createHostedStream(['should not run'])
    );

    const response = await handleChatRequest(inboundRequest, { startChat });

    expect(response.status).toBe(400);
    expect(getReader).not.toHaveBeenCalled();
    expect(startChat).not.toHaveBeenCalled();
  });

  it('cancels an unread body with an unsupported content type', async () => {
    const startChat = vi.fn<StartHostedChat>();
    const cancelBody = vi.fn();
    const inboundRequest = {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'text/plain' }),
      body: new ReadableStream<Uint8Array>({
        cancel: cancelBody
      }),
      signal: new AbortController().signal
    } as Request;

    const response = await handleChatRequest(inboundRequest, { startChat });

    expect(response.status).toBe(400);
    expect(cancelBody).toHaveBeenCalledOnce();
    expect(startChat).not.toHaveBeenCalled();
  });

  it('rejects an unsupported request content encoding before reading', async () => {
    const startChat = vi.fn<StartHostedChat>();
    const encodedBody = new TextEncoder().encode(validBody());
    const body = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(encodedBody);
        controller.close();
      }
    });
    const getReader = vi.spyOn(body, 'getReader');
    const inboundRequest = {
      method: 'POST',
      headers: new Headers({
        'Content-Encoding': 'gzip',
        'Content-Type': 'application/json'
      }),
      body,
      signal: new AbortController().signal
    } as Request;

    const response = await handleChatRequest(inboundRequest, { startChat });

    expect(response.status).toBe(400);
    expect(getReader).not.toHaveBeenCalled();
    expect(startChat).not.toHaveBeenCalled();
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

  it('times out when the first provider chunk never settles', async () => {
    vi.useFakeTimers();
    try {
      let providerSignal: AbortSignal | undefined;
      const telemetry: ChatTelemetryEvent[] = [];
      const returnUpstream = vi.fn(async () => ({
        done: true as const,
        value: undefined
      }));
      let response: Response | undefined;
      void handleChatRequest(request(validBody()), {
        startChat: ({ signal }) => {
          providerSignal = signal;
          return {
            iterator: {
              next: () =>
                new Promise<IteratorResult<string>>(() => undefined),
              return: returnUpstream
            },
            getCompletion: async () => ({ finishReason: 'stop' })
          };
        },
        writeTelemetry: event => telemetry.push(event)
      }).then(value => {
        response = value;
      });

      await vi.advanceTimersByTimeAsync(PROVIDER_TIMEOUT_MS);

      expect(response?.status).toBe(504);
      expect(await response?.json()).toEqual({
        error: {
          code: 'TIMEOUT',
          message: 'The AI service took too long to respond. Please try again.'
        }
      });
      expect(providerSignal?.aborted).toBe(true);
      expect(returnUpstream).toHaveBeenCalledOnce();
      expect(telemetry).toEqual([
        expect.objectContaining({
          status: 'failed',
          errorCategory: 'timeout'
        })
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects startup that exhausts the deadline synchronously', async () => {
    vi.useFakeTimers();
    try {
      let providerSignal: AbortSignal | undefined;
      const nextUpstream = vi.fn(async () => ({
        done: true as const,
        value: undefined
      }));
      const returnUpstream = vi.fn(async () => ({
        done: true as const,
        value: undefined
      }));
      const response = await handleChatRequest(request(validBody()), {
        startChat: ({ signal }) => {
          providerSignal = signal;
          vi.advanceTimersByTime(PROVIDER_TIMEOUT_MS + 1);
          return {
            iterator: {
              next: nextUpstream,
              return: returnUpstream
            },
            getCompletion: async () => ({ finishReason: 'stop' })
          };
        }
      });

      expect(response.status).toBe(504);
      expect(nextUpstream).not.toHaveBeenCalled();
      expect(providerSignal?.aborted).toBe(true);
      expect(returnUpstream).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('releases a provider stream that resolves after startup timeout', async () => {
    vi.useFakeTimers();
    try {
      let providerSignal: AbortSignal | undefined;
      let resolveStart: ((stream: HostedChatStream) => void) | undefined;
      const telemetry: ChatTelemetryEvent[] = [];
      const nextUpstream = vi.fn(async () => ({
        done: true as const,
        value: undefined
      }));
      const returnUpstream = vi.fn(async () => ({
        done: true as const,
        value: undefined
      }));
      let response: Response | undefined;
      void handleChatRequest(request(validBody()), {
        startChat: ({ signal }) => {
          providerSignal = signal;
          return new Promise<HostedChatStream>(resolve => {
            resolveStart = resolve;
          });
        },
        writeTelemetry: event => telemetry.push(event)
      }).then(value => {
        response = value;
      });

      await vi.advanceTimersByTimeAsync(PROVIDER_TIMEOUT_MS);
      expect(response?.status).toBe(504);
      expect(providerSignal?.aborted).toBe(true);

      resolveStart?.({
        iterator: {
          next: nextUpstream,
          return: returnUpstream
        },
        getCompletion: async () => ({ finishReason: 'stop' })
      });
      await vi.advanceTimersByTimeAsync(0);

      expect(nextUpstream).not.toHaveBeenCalled();
      expect(returnUpstream).toHaveBeenCalledOnce();
      expect(telemetry).toEqual([
        expect.objectContaining({
          status: 'failed',
          errorCategory: 'timeout'
        })
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects a malformed first iterator result and releases upstream', async () => {
    let providerSignal: AbortSignal | undefined;
    const telemetry: ChatTelemetryEvent[] = [];
    const returnUpstream = vi.fn(async () => ({
      done: true as const,
      value: undefined
    }));
    const response = await handleChatRequest(request(validBody()), {
      startChat: ({ signal }) => {
        providerSignal = signal;
        return {
          iterator: {
            next: async () =>
              null as unknown as IteratorResult<string>,
            return: returnUpstream
          },
          getCompletion: async () => ({ finishReason: 'stop' })
        };
      },
      writeTelemetry: event => telemetry.push(event)
    });
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).not.toContain('null');
    expect(providerSignal?.aborted).toBe(true);
    expect(returnUpstream).toHaveBeenCalledOnce();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'provider_protocol'
      })
    ]);
  });

  it('releases a stream when the first iterator read fails', async () => {
    let providerSignal: AbortSignal | undefined;
    const telemetry: ChatTelemetryEvent[] = [];
    const returnUpstream = vi.fn(async () => ({
      done: true as const,
      value: undefined
    }));
    const response = await handleChatRequest(request(validBody()), {
      startChat: ({ signal }) => {
        providerSignal = signal;
        return {
          iterator: {
            next: async () => {
              throw new Error('sensitive first chunk failure');
            },
            return: returnUpstream
          },
          getCompletion: async () => ({ finishReason: 'stop' })
        };
      },
      writeTelemetry: event => telemetry.push(event)
    });
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).not.toContain('sensitive first chunk failure');
    expect(providerSignal?.aborted).toBe(true);
    expect(returnUpstream).toHaveBeenCalledOnce();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'provider'
      })
    ]);
  });

  it('assimilates a PromiseLike upstream release', async () => {
    let cleanupStarted = false;
    const response = await handleChatRequest(request(validBody()), {
      startChat: () => ({
        iterator: {
          next: async () =>
            null as unknown as IteratorResult<string>,
          return: () =>
            ({
              then: (
                resolve: (value: IteratorResult<string>) => void
              ) => {
                cleanupStarted = true;
                resolve({ done: true, value: undefined });
              }
            }) as Promise<IteratorResult<string>>
        },
        getCompletion: async () => ({ finishReason: 'stop' })
      })
    });

    expect(response.status).toBe(503);
    await Promise.resolve();
    expect(cleanupStarted).toBe(true);
  });

  it('treats a throwing iterator result getter as a protocol failure', async () => {
    let providerSignal: AbortSignal | undefined;
    const telemetry: ChatTelemetryEvent[] = [];
    const returnUpstream = vi.fn(async () => ({
      done: true as const,
      value: undefined
    }));
    const response = await handleChatRequest(request(validBody()), {
      startChat: ({ signal }) => {
        providerSignal = signal;
        return {
          iterator: {
            next: async () => {
              const result = {};
              Object.defineProperty(result, 'done', {
                get(): never {
                  throw new Error('sensitive result getter failure');
                }
              });
              return result as IteratorResult<string>;
            },
            return: returnUpstream
          },
          getCompletion: async () => ({ finishReason: 'stop' })
        };
      },
      writeTelemetry: event => telemetry.push(event)
    });
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).not.toContain('sensitive result getter failure');
    expect(providerSignal?.aborted).toBe(true);
    expect(returnUpstream).toHaveBeenCalledOnce();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'provider_protocol'
      })
    ]);
  });

  it('rejects a malformed hosted stream before reading it', async () => {
    let providerSignal: AbortSignal | undefined;
    const telemetry: ChatTelemetryEvent[] = [];
    const nextUpstream = vi.fn(async () => ({
      done: true as const,
      value: undefined
    }));
    const returnUpstream = vi.fn(async () => ({
      done: true as const,
      value: undefined
    }));
    const response = await handleChatRequest(request(validBody()), {
      startChat: ({ signal }) => {
        providerSignal = signal;
        return {
          iterator: {
            next: nextUpstream,
            return: returnUpstream
          },
          getCompletion: undefined
        } as unknown as HostedChatStream;
      },
      writeTelemetry: event => telemetry.push(event)
    });

    expect(response.status).toBe(503);
    expect(nextUpstream).not.toHaveBeenCalled();
    expect(providerSignal?.aborted).toBe(true);
    expect(returnUpstream).toHaveBeenCalledOnce();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'provider_protocol'
      })
    ]);
  });

  it('treats a throwing hosted stream getter as a protocol failure', async () => {
    let providerSignal: AbortSignal | undefined;
    const telemetry: ChatTelemetryEvent[] = [];
    const nextUpstream = vi.fn(async () => ({
      done: true as const,
      value: undefined
    }));
    const returnUpstream = vi.fn(async () => ({
      done: true as const,
      value: undefined
    }));
    const response = await handleChatRequest(request(validBody()), {
      startChat: ({ signal }) => {
        providerSignal = signal;
        const hostedStream = {
          iterator: {
            next: nextUpstream,
            return: returnUpstream
          }
        };
        Object.defineProperty(hostedStream, 'getCompletion', {
          get(): never {
            throw new Error('sensitive getter failure');
          }
        });
        return hostedStream as unknown as HostedChatStream;
      },
      writeTelemetry: event => telemetry.push(event)
    });
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).not.toContain('sensitive getter failure');
    expect(nextUpstream).not.toHaveBeenCalled();
    expect(providerSignal?.aborted).toBe(true);
    expect(returnUpstream).toHaveBeenCalledOnce();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'provider_protocol'
      })
    ]);
  });

  it('uses a stable hosted stream facade after validation', async () => {
    let completionGetterReads = 0;
    let nextCall = 0;
    const telemetry: ChatTelemetryEvent[] = [];
    const getCompletion = vi.fn(async () => ({
      finishReason: 'stop',
      inputTokens: 10,
      outputTokens: 2
    }));
    const response = await handleChatRequest(request(validBody()), {
      startChat: () => {
        const hostedStream = {
          iterator: {
            next: async () => {
              nextCall += 1;
              return nextCall === 1
                ? { done: false as const, value: 'Complete' }
                : { done: true as const, value: undefined };
            }
          }
        };
        Object.defineProperty(hostedStream, 'getCompletion', {
          get() {
            completionGetterReads += 1;
            if (completionGetterReads > 1) {
              throw new Error('transient completion getter');
            }
            return getCompletion;
          }
        });
        return hostedStream as unknown as HostedChatStream;
      },
      writeTelemetry: event => telemetry.push(event)
    });

    expect(await readFrames(response)).toEqual([
      { type: 'text-delta', delta: 'Complete' },
      { type: 'finish', finishReason: 'stop' }
    ]);
    expect(completionGetterReads).toBe(1);
    expect(getCompletion).toHaveBeenCalledOnce();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'success',
        finishReason: 'stop'
      })
    ]);
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

  it('clamps an overflowing provider Retry-After delay', async () => {
    const startChat = vi.fn<StartHostedChat>(() => {
      throw new APICallError({
        message: 'quota',
        url: 'https://gateway.invalid',
        requestBodyValues: {},
        responseHeaders: { 'Retry-After': '9'.repeat(400) },
        statusCode: 429
      });
    });

    const response = await handleChatRequest(request(validBody()), {
      startChat
    });

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('3600');
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
    let providerSignal: AbortSignal | undefined;
    let nextCall = 0;
    const telemetry: ChatTelemetryEvent[] = [];
    const returnUpstream = vi.fn(async () => ({
      done: true as const,
      value: undefined
    }));
    const startChat: StartHostedChat = () => ({
      iterator: {
        next: async () => {
          nextCall += 1;
          if (nextCall === 1) {
            return { done: false as const, value: 'Partial answer' };
          }
          throw new Error('raw provider failure');
        },
        return: returnUpstream
      },
      getCompletion: async () => ({ finishReason: 'error' })
    });
    const response = await handleChatRequest(request(validBody()), {
      startChat: input => {
        providerSignal = input.signal;
        return startChat(input);
      },
      writeTelemetry: event => telemetry.push(event)
    });

    expect(await readFrames(response)).toEqual([
      { type: 'text-delta', delta: 'Partial answer' },
      {
        type: 'error',
        code: 'STREAM_ERROR',
        message: 'The AI service stopped responding. Please try again.'
      }
    ]);
    expect(providerSignal?.aborted).toBe(true);
    expect(returnUpstream).toHaveBeenCalledOnce();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'provider'
      })
    ]);
  });

  it('times out when a later provider chunk never settles', async () => {
    vi.useFakeTimers();
    try {
      let providerSignal: AbortSignal | undefined;
      let nextCall = 0;
      const telemetry: ChatTelemetryEvent[] = [];
      const returnUpstream = vi.fn(async () => ({
        done: true as const,
        value: undefined
      }));
      const response = await handleChatRequest(request(validBody()), {
        startChat: ({ signal }) => {
          providerSignal = signal;
          return {
            iterator: {
              next: async () => {
                nextCall += 1;
                if (nextCall === 1) {
                  return { done: false as const, value: 'Partial answer' };
                }
                return new Promise<IteratorResult<string>>(() => undefined);
              },
              return: returnUpstream
            },
            getCompletion: async () => ({ finishReason: 'stop' })
          };
        },
        writeTelemetry: event => telemetry.push(event)
      });
      let responseText: string | undefined;
      void response.text().then(value => {
        responseText = value;
      });

      await vi.advanceTimersByTimeAsync(PROVIDER_TIMEOUT_MS);

      expect(responseText).toBe(
        [
          JSON.stringify({ type: 'text-delta', delta: 'Partial answer' }),
          JSON.stringify({
            type: 'error',
            code: 'STREAM_ERROR',
            message: 'The AI service stopped responding. Please try again.'
          }),
          ''
        ].join('\n')
      );
      expect(providerSignal?.aborted).toBe(true);
      expect(returnUpstream).toHaveBeenCalledOnce();
      expect(telemetry).toEqual([
        expect.objectContaining({
          status: 'failed',
          errorCategory: 'timeout'
        })
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('enforces one total provider deadline across slow chunks', async () => {
    vi.useFakeTimers();
    try {
      let providerSignal: AbortSignal | undefined;
      let nextCall = 0;
      const returnUpstream = vi.fn(async () => ({
        done: true as const,
        value: undefined
      }));
      const response = await handleChatRequest(request(validBody()), {
        startChat: ({ signal }) => {
          providerSignal = signal;
          return {
            iterator: {
              next: async () => {
                nextCall += 1;
                if (nextCall === 1) {
                  return { done: false as const, value: 'First' };
                }
                return new Promise<IteratorResult<string>>(resolve => {
                  setTimeout(
                    () => resolve(
                      nextCall === 2
                        ? { done: false as const, value: 'Second' }
                        : { done: true as const, value: undefined }
                    ),
                    20_000
                  );
                });
              },
              return: returnUpstream
            },
            getCompletion: async () => ({ finishReason: 'stop' })
          };
        }
      });
      let responseText: string | undefined;
      void response.text().then(value => {
        responseText = value;
      });

      await vi.advanceTimersByTimeAsync(PROVIDER_TIMEOUT_MS);

      expect(responseText).toBe(
        [
          JSON.stringify({ type: 'text-delta', delta: 'First' }),
          JSON.stringify({ type: 'text-delta', delta: 'Second' }),
          JSON.stringify({
            type: 'error',
            code: 'STREAM_ERROR',
            message: 'The AI service stopped responding. Please try again.'
          }),
          ''
        ].join('\n')
      );
      expect(providerSignal?.aborted).toBe(true);
      expect(returnUpstream).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not extend the provider deadline after wall-clock rollback', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    try {
      let nextCall = 0;
      const returnUpstream = vi.fn(async () => ({
        done: true as const,
        value: undefined
      }));
      const response = await handleChatRequest(request(validBody()), {
        startChat: () => ({
          iterator: {
            next: async () => {
              nextCall += 1;
              if (nextCall === 1) {
                return { done: false as const, value: 'First' };
              }
              if (nextCall === 2) {
                return new Promise<IteratorResult<string>>(resolve => {
                  setTimeout(() => {
                    vi.setSystemTime(
                      new Date('2025-12-31T23:00:00.000Z')
                    );
                    resolve({
                      done: false as const,
                      value: 'Second'
                    });
                  }, 20_000);
                });
              }
              return new Promise<IteratorResult<string>>(() => undefined);
            },
            return: returnUpstream
          },
          getCompletion: async () => ({ finishReason: 'stop' })
        })
      });
      let responseText: string | undefined;
      void response.text().then(value => {
        responseText = value;
      });

      await vi.advanceTimersByTimeAsync(PROVIDER_TIMEOUT_MS);

      expect(responseText).toContain(
        JSON.stringify({
          type: 'error',
          code: 'STREAM_ERROR',
          message: 'The AI service stopped responding. Please try again.'
        })
      );
      expect(returnUpstream).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('aborts a provider stream that exceeds the chunk-count budget', async () => {
    vi.useFakeTimers();
    try {
      let providerSignal: AbortSignal | undefined;
      let nextCall = 0;
      const telemetry: ChatTelemetryEvent[] = [];
      const returnUpstream = vi.fn(async () => ({
        done: true as const,
        value: undefined
      }));
      const response = await handleChatRequest(request(validBody()), {
        startChat: ({ signal }) => {
          providerSignal = signal;
          return {
            iterator: {
              next: async () => {
                nextCall += 1;
                if (nextCall <= MAX_PROVIDER_CHUNK_COUNT + 1) {
                  return { done: false as const, value: '' };
                }
                return new Promise<IteratorResult<string>>(() => undefined);
              },
              return: returnUpstream
            },
            getCompletion: async () => ({ finishReason: 'stop' })
          };
        },
        writeTelemetry: event => telemetry.push(event)
      });
      let responseText: string | undefined;
      void response.text().then(value => {
        responseText = value;
      });

      await vi.advanceTimersByTimeAsync(50);

      expect(responseText).toBe(
        `${JSON.stringify({
          type: 'error',
          code: 'STREAM_ERROR',
          message: 'The AI service stopped responding. Please try again.'
        })}\n`
      );
      expect(providerSignal?.aborted).toBe(true);
      expect(returnUpstream).toHaveBeenCalledOnce();
      expect(telemetry).toEqual([
        expect.objectContaining({
          status: 'failed',
          errorCategory: 'provider_protocol'
        })
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects a non-string provider chunk as a protocol failure', async () => {
    let providerSignal: AbortSignal | undefined;
    let nextCall = 0;
    const telemetry: ChatTelemetryEvent[] = [];
    const returnUpstream = vi.fn(async () => ({
      done: true as const,
      value: undefined
    }));
    const response = await handleChatRequest(request(validBody()), {
      startChat: ({ signal }) => {
        providerSignal = signal;
        return {
          iterator: {
            next: async () => {
              nextCall += 1;
              if (nextCall === 1) {
                return { done: false as const, value: 'Partial' };
              }
              return nextCall === 2
                ? { done: false as const, value: 123 as unknown as string }
                : { done: true as const, value: undefined };
            },
            return: returnUpstream
          },
          getCompletion: async () => ({ finishReason: 'stop' })
        };
      },
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
    expect(providerSignal?.aborted).toBe(true);
    expect(returnUpstream).toHaveBeenCalledOnce();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'provider_protocol'
      })
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

  it('treats a content-filter finish as a sanitized failed stream', async () => {
    const telemetry: ChatTelemetryEvent[] = [];
    const response = await handleChatRequest(request(validBody()), {
      startChat: () =>
        createHostedStream(['Partial'], {
          finishReason: 'content-filter',
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
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'provider'
      })
    ]);
  });

  it('stops provider output that exceeds the independent stream byte cap', async () => {
    const telemetry: ChatTelemetryEvent[] = [];
    let providerSignal: AbortSignal | undefined;
    const returnUpstream = vi.fn(async () => ({
      done: true as const,
      value: undefined
    }));
    const response = await handleChatRequest(request(validBody()), {
      startChat: ({ signal }) => {
        providerSignal = signal;
        let emitted = false;
        return {
          iterator: {
            next: async () => {
              if (emitted) return { done: true as const, value: undefined };
              emitted = true;
              return {
                done: false as const,
                value: 'x'.repeat(MAX_STREAM_OUTPUT_BYTES + 1)
              };
            },
            return: returnUpstream
          },
          getCompletion: async () => ({
            finishReason: 'stop',
            outputTokens: 1
          })
        };
      },
      writeTelemetry: event => telemetry.push(event)
    });

    expect(await readFrames(response)).toEqual([
      { type: 'finish', finishReason: 'length' }
    ]);
    expect(providerSignal?.aborted).toBe(true);
    expect(returnUpstream).toHaveBeenCalledOnce();
    expect(telemetry[0]).toEqual(
      expect.objectContaining({
        status: 'output_limit',
        finishReason: 'length'
      })
    );
  });

  it('counts JSON escaping against the stream byte cap', async () => {
    const telemetry: ChatTelemetryEvent[] = [];
    let providerSignal: AbortSignal | undefined;
    const escapedDelta = '\u0000'.repeat(
      Math.ceil(MAX_STREAM_OUTPUT_BYTES / 6)
    );
    const response = await handleChatRequest(request(validBody()), {
      startChat: ({ signal }) => {
        providerSignal = signal;
        return createHostedStream([escapedDelta]);
      },
      writeTelemetry: event => telemetry.push(event)
    });

    expect(await readFrames(response)).toEqual([
      { type: 'finish', finishReason: 'length' }
    ]);
    expect(providerSignal?.aborted).toBe(true);
    expect(telemetry[0]).toEqual(
      expect.objectContaining({
        status: 'output_limit',
        finishReason: 'length'
      })
    );
  });

  it('reserves stream bytes for the mandatory terminal frame', async () => {
    const encoder = new TextEncoder();
    const emptyDeltaFrameBytes = encoder.encode(
      `${JSON.stringify({ type: 'text-delta', delta: '' })}\n`
    ).byteLength;
    const delta = 'x'.repeat(
      MAX_STREAM_OUTPUT_BYTES - emptyDeltaFrameBytes
    );
    let providerSignal: AbortSignal | undefined;
    const response = await handleChatRequest(request(validBody()), {
      startChat: ({ signal }) => {
        providerSignal = signal;
        return createHostedStream([delta]);
      }
    });

    expect(await readFrames(response)).toEqual([
      { type: 'finish', finishReason: 'length' }
    ]);
    expect(providerSignal?.aborted).toBe(true);
  });

  it('finishes the output-limit response without waiting for provider cleanup', async () => {
    vi.useFakeTimers();
    try {
      const returnUpstream = vi.fn(
        () => new Promise<IteratorResult<string>>(() => undefined)
      );
      const response = await handleChatRequest(request(validBody()), {
        startChat: () => ({
          iterator: {
            next: async () => ({
              done: false as const,
              value: 'x'.repeat(MAX_STREAM_OUTPUT_BYTES + 1)
            }),
            return: returnUpstream
          },
          getCompletion: async () => ({
            finishReason: 'stop'
          })
        })
      });
      let responseText: string | undefined;
      void response.text().then(value => {
        responseText = value;
      });

      await vi.advanceTimersByTimeAsync(50);

      expect(responseText).toBe(
        `${JSON.stringify({ type: 'finish', finishReason: 'length' })}\n`
      );
      expect(returnUpstream).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('times out when provider completion metadata never settles', async () => {
    vi.useFakeTimers();
    try {
      let providerSignal: AbortSignal | undefined;
      const telemetry: ChatTelemetryEvent[] = [];
      const response = await handleChatRequest(request(validBody()), {
        startChat: ({ signal }) => {
          providerSignal = signal;
          return {
            iterator: (async function* stream(): AsyncGenerator<string> {
              yield 'Partial answer';
            })(),
            getCompletion: () =>
              new Promise<ChatCompletionMetadata>(() => undefined)
          };
        },
        writeTelemetry: event => telemetry.push(event)
      });
      let responseText: string | undefined;
      void response.text().then(value => {
        responseText = value;
      });

      await vi.advanceTimersByTimeAsync(COMPLETION_TIMEOUT_MS);

      expect(responseText).toBe(
        [
          JSON.stringify({ type: 'text-delta', delta: 'Partial answer' }),
          JSON.stringify({
            type: 'error',
            code: 'STREAM_ERROR',
            message: 'The AI service stopped responding. Please try again.'
          }),
          ''
        ].join('\n')
      );
      expect(providerSignal?.aborted).toBe(true);
      expect(telemetry).toEqual([
        expect.objectContaining({
          status: 'failed',
          errorCategory: 'timeout'
        })
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects malformed provider completion metadata', async () => {
    let providerSignal: AbortSignal | undefined;
    let nextCall = 0;
    const telemetry: ChatTelemetryEvent[] = [];
    const returnUpstream = vi.fn(async () => ({
      done: true as const,
      value: undefined
    }));
    const response = await handleChatRequest(request(validBody()), {
      startChat: ({ signal }) => {
        providerSignal = signal;
        return {
          iterator: {
            next: async () => {
              nextCall += 1;
              return nextCall === 1
                ? { done: false as const, value: 'Partial' }
                : { done: true as const, value: undefined };
            },
            return: returnUpstream
          },
          getCompletion: async () =>
            null as unknown as ChatCompletionMetadata
        };
      },
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
    expect(providerSignal?.aborted).toBe(true);
    expect(returnUpstream).toHaveBeenCalledOnce();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'provider_protocol'
      })
    ]);
  });

  it('treats a throwing completion getter as a protocol failure', async () => {
    let providerSignal: AbortSignal | undefined;
    let nextCall = 0;
    const telemetry: ChatTelemetryEvent[] = [];
    const returnUpstream = vi.fn(async () => ({
      done: true as const,
      value: undefined
    }));
    const response = await handleChatRequest(request(validBody()), {
      startChat: ({ signal }) => {
        providerSignal = signal;
        return {
          iterator: {
            next: async () => {
              nextCall += 1;
              return nextCall === 1
                ? { done: false as const, value: 'Partial' }
                : { done: true as const, value: undefined };
            },
            return: returnUpstream
          },
          getCompletion: async () => {
            const completion = {};
            Object.defineProperty(completion, 'finishReason', {
              get(): never {
                throw new Error('sensitive completion getter failure');
              }
            });
            return completion as ChatCompletionMetadata;
          }
        };
      },
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
    expect(providerSignal?.aborted).toBe(true);
    expect(returnUpstream).toHaveBeenCalledOnce();
    expect(telemetry).toEqual([
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'provider_protocol'
      })
    ]);
  });

  it('sanitizes an unrecognized provider finish reason as a failed stream', async () => {
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

    expect(await readFrames(response)).toEqual([
      { type: 'text-delta', delta: 'Complete' },
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

  it('does not wait for provider cleanup when the response reader cancels', async () => {
    vi.useFakeTimers();
    try {
      let receivedSignal: AbortSignal | undefined;
      let emitted = false;
      const returnUpstream = vi.fn(
        () => new Promise<IteratorResult<string>>(() => undefined)
      );
      const response = await handleChatRequest(request(validBody()), {
        startChat: ({ signal }) => {
          receivedSignal = signal;
          return {
            iterator: {
              next: async () => {
                if (!emitted) {
                  emitted = true;
                  return { done: false, value: 'first' };
                }
                return new Promise<IteratorResult<string>>((_resolve, reject) => {
                  signal.addEventListener(
                    'abort',
                    () => reject(signal.reason),
                    { once: true }
                  );
                });
              },
              return: returnUpstream
            },
            getCompletion: async () => ({ finishReason: 'stop' })
          };
        }
      });
      const reader = response.body!.getReader();
      await reader.read();
      let cancellationSettled = false;
      void reader.cancel().then(() => {
        cancellationSettled = true;
      });

      await vi.advanceTimersByTimeAsync(50);

      expect(cancellationSettled).toBe(true);
      expect(receivedSignal?.aborted).toBe(true);
      expect(returnUpstream).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
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
