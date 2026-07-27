import {
  act,
  cleanup,
  renderHook,
  waitFor
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_STREAM_FRAME_CHARACTERS,
  MAX_STREAM_FRAME_COUNT,
  MAX_STREAM_RESPONSE_CHARACTERS
} from '../server/contracts';
import {
  API_ERROR_RESPONSE_TIMEOUT_MS,
  MAX_CHAT_STREAM_RESPONSE_BYTES,
  MAX_API_ERROR_RESPONSE_BYTES,
  useOnlineChat,
  WELCOME_MESSAGE
} from './useOnlineChat';

const STREAM_RESPONSE_HEADERS = {
  'Content-Type': 'application/x-ndjson'
} as const;

function frame(value: unknown): string {
  return `${JSON.stringify(value)}\n`;
}

function streamResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller): void {
        chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk)));
        controller.close();
      }
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/x-ndjson' }
    }
  );
}

function successResponse(text = 'John builds products.'): Response {
  return streamResponse([
    frame({ type: 'text-delta', delta: text }),
    frame({ type: 'finish', finishReason: 'stop' })
  ]);
}

function errorResponse(
  status: number,
  code: string,
  retryAfter?: string
): Response {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (retryAfter) headers.set('Retry-After', retryAfter);
  return new Response(
    JSON.stringify({ error: { code, message: 'server detail' } }),
    { status, headers }
  );
}

describe('useOnlineChat', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('starts locally with no persisted session or availability request', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const first = renderHook(() => useOnlineChat());
    expect(first.result.current.messages).toEqual([WELCOME_MESSAGE]);
    first.unmount();

    const second = renderHook(() => useOnlineChat());
    expect(second.result.current.messages).toEqual([WELCOME_MESSAGE]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends one request, adds the user immediately, and streams one assistant message', async () => {
    let streamController: ReadableStreamDefaultController<Uint8Array> | undefined;
    const encoder = new TextEncoder();
    const fetchMock = vi.fn(async () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller): void {
            streamController = controller;
          }
        }),
        { status: 200, headers: STREAM_RESPONSE_HEADERS }
      )
    );
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useOnlineChat());

    let sendPromise: Promise<void> | undefined;
    act(() => {
      sendPromise = result.current.send('Tell me about John.');
    });

    await waitFor(() => {
      expect(result.current.messages).toEqual([
        WELCOME_MESSAGE,
        { role: 'user', content: 'Tell me about John.' },
        { role: 'assistant', content: '' }
      ]);
      expect(result.current.isStreaming).toBe(true);
    });

    act(() => {
      streamController?.enqueue(
        encoder.encode(frame({ type: 'text-delta', delta: 'John builds ' }))
      );
    });
    await waitFor(() => {
      expect(result.current.messages.at(-1)?.content).toBe('John builds ');
    });

    act(() => {
      streamController?.enqueue(
        encoder.encode(frame({ type: 'text-delta', delta: 'products.' }))
      );
      streamController?.enqueue(
        encoder.encode(frame({ type: 'finish', finishReason: 'stop' }))
      );
      streamController?.close();
    });
    await act(async () => {
      await sendPromise;
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result.current.messages.at(-1)).toEqual({
      role: 'assistant',
      content: 'John builds products.'
    });
    expect(result.current.isStreaming).toBe(false);
  });

  it('streams successfully when animation frame APIs are unavailable', async () => {
    vi.stubGlobal('requestAnimationFrame', undefined);
    vi.stubGlobal('cancelAnimationFrame', undefined);
    vi.stubGlobal('fetch', vi.fn(async () => successResponse('Fallback answer.')));
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.messages.at(-1)).toEqual({
      role: 'assistant',
      content: 'Fallback answer.'
    });
    expect(result.current.error).toBeNull();
  });

  it('ignores whitespace and duplicate submissions while a request is active', async () => {
    let streamController: ReadableStreamDefaultController<Uint8Array> | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          new ReadableStream<Uint8Array>({
            start(controller): void {
              streamController = controller;
            }
          }),
          { status: 200, headers: STREAM_RESPONSE_HEADERS }
        )
      )
    );
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('   ');
    });
    act(() => {
      void result.current.send('Hello');
      void result.current.send('Hello');
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    act(() => {
      streamController?.enqueue(
        new TextEncoder().encode(frame({ type: 'finish', finishReason: 'stop' }))
      );
      streamController?.close();
    });
    await waitFor(() => expect(result.current.isStreaming).toBe(false));
  });

  it.each([
    [
      413,
      'PAYLOAD_TOO_LARGE',
      'validation',
      'Please shorten or revise your message, then try again.'
    ],
    [
      429,
      'RATE_LIMITED',
      'rate_limit',
      'Too many requests. Try again in about 60 seconds.'
    ],
    [
      504,
      'TIMEOUT',
      'timeout',
      'The AI took too long to respond. Please try again.'
    ],
    [
      503,
      'SERVICE_UNAVAILABLE',
      'unavailable',
      'The AI service is temporarily unavailable. Please try again.'
    ]
  ])(
    'maps HTTP %s to a distinct %s error while preserving the user message',
    async (status, code, kind, message) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () =>
          errorResponse(status, code, status === 429 ? '60' : undefined)
        )
      );
      const { result } = renderHook(() => useOnlineChat());

      await act(async () => {
        await result.current.send('Hello');
      });

      expect(result.current.error).toEqual(
        expect.objectContaining({ kind, message })
      );
      expect(result.current.messages).toEqual([
        WELCOME_MESSAGE,
        { role: 'user', content: 'Hello' }
      ]);
    }
  );

  it('classifies a known HTTP error without decoding its response body', async () => {
    const response = errorResponse(429, 'RATE_LIMITED', '30');
    const getReader = vi.spyOn(response.body!, 'getReader');
    const cancelBody = vi.spyOn(response.body!, 'cancel');
    vi.stubGlobal('fetch', vi.fn(async () => response));
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.error).toEqual(
      expect.objectContaining({
        kind: 'rate_limit',
        retryAfterSeconds: 30
      })
    );
    expect(getReader).not.toHaveBeenCalled();
    expect(cancelBody).toHaveBeenCalledOnce();
  });

  it('honors an HTTP-date Retry-After value', async () => {
    vi.useFakeTimers();
    const now = new Date('2026-01-01T00:00:00.000Z');
    vi.setSystemTime(now);
    const retryAt = new Date(now.getTime() + 10_000).toUTCString();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => errorResponse(429, 'RATE_LIMITED', retryAt))
    );
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.error).toEqual(
      expect.objectContaining({
        kind: 'rate_limit',
        retryAfterSeconds: 10
      })
    );
  });

  it('rejects a non-JSON API error without reading its response body', async () => {
    const response = new Response('<html>gateway error</html>', {
      status: 418,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
    const getReader = vi.spyOn(response.body!, 'getReader');
    const cancelBody = vi.spyOn(response.body!, 'cancel');
    vi.stubGlobal('fetch', vi.fn(async () => response));
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.error).toEqual(
      expect.objectContaining({ kind: 'unavailable' })
    );
    expect(getReader).not.toHaveBeenCalled();
    expect(cancelBody).toHaveBeenCalledOnce();
  });

  it('rejects an oversized declared API error without reading its body', async () => {
    const response = errorResponse(418, 'RATE_LIMITED');
    response.headers.set(
      'Content-Length',
      String(MAX_API_ERROR_RESPONSE_BYTES + 1)
    );
    const getReader = vi.spyOn(response.body!, 'getReader');
    const cancelBody = vi.spyOn(response.body!, 'cancel');
    vi.stubGlobal('fetch', vi.fn(async () => response));
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.error).toEqual(
      expect.objectContaining({ kind: 'unavailable' })
    );
    expect(getReader).not.toHaveBeenCalled();
    expect(cancelBody).toHaveBeenCalledOnce();
  });

  it('bounds a chunked API error body that never closes', async () => {
    const cancelBody = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          new ReadableStream<Uint8Array>({
            start(controller): void {
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({
                    error: { code: 'RATE_LIMITED' },
                    padding: 'x'.repeat(MAX_API_ERROR_RESPONSE_BYTES)
                  })
                )
              );
            },
            cancel: cancelBody
          }),
          { status: 418 }
        )
      )
    );
    const { result } = renderHook(() => useOnlineChat());

    let sendPromise: Promise<void> | undefined;
    act(() => {
      sendPromise = result.current.send('Hello');
    });

    await waitFor(() => {
      expect(result.current.error?.kind).toBe('unavailable');
    });
    await act(async () => {
      await sendPromise;
    });

    expect(cancelBody).toHaveBeenCalledOnce();
  });

  it('times out a small API error body independently of the request deadline', async () => {
    vi.useFakeTimers();
    const cancelBody = vi.fn();
    let streamController:
      | ReadableStreamDefaultController<Uint8Array>
      | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          new ReadableStream<Uint8Array>({
            start(controller): void {
              streamController = controller;
              controller.enqueue(new TextEncoder().encode('{"error":'));
            },
            cancel: cancelBody
          }),
          {
            status: 418,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      )
    );
    const { result } = renderHook(() => useOnlineChat());
    let settled = false;

    let sendPromise: Promise<void> | undefined;
    act(() => {
      sendPromise = result.current.send('Hello').finally(() => {
        settled = true;
      });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(API_ERROR_RESPONSE_TIMEOUT_MS);
    });
    const settledAtErrorDeadline = settled;

    if (!settled) streamController?.close();
    await act(async () => {
      await sendPromise;
    });

    expect(settledAtErrorDeadline).toBe(true);
    expect(cancelBody).toHaveBeenCalledOnce();
    expect(result.current.error).toEqual(
      expect.objectContaining({ kind: 'unavailable' })
    );
  });

  it('distinguishes an offline fetch failure', async () => {
    vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('failed'))));
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.error).toEqual(
      expect.objectContaining({
        kind: 'offline',
        message: 'You appear to be offline. Reconnect and try again.'
      })
    );
  });

  it('distinguishes an online network failure', async () => {
    vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(true);
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('failed'))));
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.error).toEqual({
      kind: 'network',
      message: 'The connection was interrupted. Please try again.',
      canRetry: true
    });
  });

  it('aborts a client-side timeout and exposes a retryable timeout error', async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
        new Promise((_resolve, reject) => {
          requestSignal = init?.signal ?? undefined;
          requestSignal?.addEventListener(
            'abort',
            () => reject(requestSignal?.reason),
            { once: true }
          );
        })
    );
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useOnlineChat());

    let sendPromise: Promise<void> | undefined;
    act(() => {
      sendPromise = result.current.send('Hello');
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
      await sendPromise;
    });

    expect(requestSignal?.aborted).toBe(true);
    expect(result.current.error).toEqual({
      kind: 'timeout',
      message: 'The AI took too long to respond. Please try again.',
      canRetry: true
    });
  });

  it('treats malformed or interrupted NDJSON as a retryable protocol error', async () => {
    let requestSignal: AbortSignal | null | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal;
        return streamResponse(['not-json\n']);
      })
    );
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.error).toEqual({
      kind: 'protocol',
      message: 'The AI response was interrupted. Please try again.',
      canRetry: true
    });
    expect(result.current.messages.at(-1)).toEqual({
      role: 'user',
      content: 'Hello'
    });
    expect(requestSignal?.aborted).toBe(true);
  });

  it('rejects an unexpected success media type without reading its body', async () => {
    let requestSignal: AbortSignal | null | undefined;
    const cancelBody = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal;
        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller): void {
              controller.enqueue(
                new TextEncoder().encode('<html>gateway error</html>')
              );
            },
            cancel: cancelBody
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          }
        );
      })
    );
    const { result } = renderHook(() => useOnlineChat());

    let sendPromise: Promise<void> | undefined;
    act(() => {
      sendPromise = result.current.send('Hello');
    });

    await waitFor(() => {
      expect(result.current.error?.kind).toBe('protocol');
    });
    await act(async () => {
      await sendPromise;
    });

    expect(cancelBody).toHaveBeenCalledOnce();
    expect(requestSignal?.aborted).toBe(true);
  });

  it('rejects an oversized declared stream without reading its body', async () => {
    const response = successResponse();
    response.headers.set(
      'Content-Length',
      String(MAX_CHAT_STREAM_RESPONSE_BYTES + 1)
    );
    const getReader = vi.spyOn(response.body!, 'getReader');
    const cancelBody = vi.spyOn(response.body!, 'cancel');
    vi.stubGlobal('fetch', vi.fn(async () => response));
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.error).toEqual(
      expect.objectContaining({ kind: 'protocol' })
    );
    expect(getReader).not.toHaveBeenCalled();
    expect(cancelBody).toHaveBeenCalledOnce();
  });

  it('aborts a chunked stream when its actual bytes exceed the transport cap', async () => {
    let requestSignal: AbortSignal | null | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal;
        const padding = Array.from(
          { length: 4 },
          () => `${' '.repeat(MAX_STREAM_FRAME_CHARACTERS)}\n`
        ).join('');
        const body =
          padding +
          frame({ type: 'text-delta', delta: 'Hello' }) +
          frame({ type: 'finish', finishReason: 'stop' });

        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller): void {
              controller.enqueue(new TextEncoder().encode(body));
              controller.close();
            }
          }),
          { status: 200, headers: STREAM_RESPONSE_HEADERS }
        );
      })
    );
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.error).toEqual(
      expect.objectContaining({ kind: 'protocol' })
    );
    expect(requestSignal?.aborted).toBe(true);
  });

  it('rejects invalid UTF-8 instead of accepting replacement characters', async () => {
    let requestSignal: AbortSignal | null | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal;
        const encoder = new TextEncoder();
        const prefix = encoder.encode('{"type":"text-delta","delta":"');
        const suffix = encoder.encode(
          '"}\n{"type":"finish","finishReason":"stop"}\n'
        );
        const body = new Uint8Array(prefix.length + suffix.length + 1);
        body.set(prefix);
        body[prefix.length] = 0xff;
        body.set(suffix, prefix.length + 1);

        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller): void {
              controller.enqueue(body);
              controller.close();
            }
          }),
          { status: 200, headers: STREAM_RESPONSE_HEADERS }
        );
      })
    );
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.error).toEqual(
      expect.objectContaining({ kind: 'protocol' })
    );
    expect(result.current.messages.at(-1)).toEqual({
      role: 'user',
      content: 'Hello'
    });
    expect(requestSignal?.aborted).toBe(true);
  });

  it('aborts an unterminated frame once its buffer exceeds the client cap', async () => {
    let requestSignal: AbortSignal | null | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal;
        const encoder = new TextEncoder();
        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller): void {
              controller.enqueue(
                encoder.encode('x'.repeat(MAX_STREAM_FRAME_CHARACTERS + 1))
              );
              requestSignal?.addEventListener(
                'abort',
                () => controller.error(requestSignal?.reason),
                { once: true }
              );
            }
          }),
          { status: 200, headers: STREAM_RESPONSE_HEADERS }
        );
      })
    );
    const { result } = renderHook(() => useOnlineChat());

    let sendPromise: Promise<void> | undefined;
    act(() => {
      sendPromise = result.current.send('Hello');
    });

    await waitFor(() => {
      expect(result.current.error?.kind).toBe('protocol');
    });
    await act(async () => {
      await sendPromise;
    });

    expect(requestSignal?.aborted).toBe(true);
  });

  it('aborts a stream that exceeds the protocol frame count', async () => {
    let requestSignal: AbortSignal | null | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal;
        const encoder = new TextEncoder();
        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller): void {
              controller.enqueue(
                encoder.encode(
                  Array.from(
                    { length: MAX_STREAM_FRAME_COUNT + 1 },
                    () => frame({ type: 'text-delta', delta: '' })
                  ).join('')
                )
              );
              requestSignal?.addEventListener(
                'abort',
                () => controller.error(requestSignal?.reason),
                { once: true }
              );
            }
          }),
          { status: 200, headers: STREAM_RESPONSE_HEADERS }
        );
      })
    );
    const { result } = renderHook(() => useOnlineChat());

    let sendPromise: Promise<void> | undefined;
    act(() => {
      sendPromise = result.current.send('Hello');
    });

    await waitFor(() => {
      expect(result.current.error?.kind).toBe('protocol');
    });
    await act(async () => {
      await sendPromise;
    });

    expect(requestSignal?.aborted).toBe(true);
  });

  it('aborts when many valid deltas exceed the assembled response cap', async () => {
    let requestSignal: AbortSignal | null | undefined;
    const delta = 'x'.repeat(1_024);
    const chunks = [
      ...Array.from(
        { length: MAX_STREAM_RESPONSE_CHARACTERS / delta.length + 1 },
        () => frame({ type: 'text-delta', delta })
      ),
      frame({ type: 'finish', finishReason: 'stop' })
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal;
        return streamResponse(chunks);
      })
    );
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.error?.kind).toBe('protocol');
    expect(result.current.messages.at(-1)?.content.length).toBeLessThanOrEqual(
      MAX_STREAM_RESPONSE_CHARACTERS
    );
    expect(requestSignal?.aborted).toBe(true);
  });

  it('keeps partial assistant text when the server reports a midstream error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        streamResponse([
          frame({ type: 'text-delta', delta: 'Partial answer' }),
          frame({
            type: 'error',
            code: 'STREAM_ERROR',
            message: 'sanitized server message'
          })
        ])
      )
    );
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.messages.at(-1)).toEqual({
      role: 'assistant',
      content: 'Partial answer'
    });
    expect(result.current.error).toEqual(
      expect.objectContaining({ kind: 'protocol', canRetry: true })
    );
  });

  it('replaces an incomplete assistant message when retrying a failed stream', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        streamResponse([
          frame({ type: 'text-delta', delta: 'Partial answer' }),
          frame({
            type: 'error',
            code: 'STREAM_ERROR',
            message: 'sanitized server message'
          })
        ])
      )
      .mockResolvedValueOnce(successResponse('Recovered answer.'));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });
    expect(result.current.messages.at(-1)).toEqual({
      role: 'assistant',
      content: 'Partial answer'
    });

    await act(async () => {
      await result.current.retry();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.messages).toEqual([
      WELCOME_MESSAGE,
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Recovered answer.' }
    ]);
  });

  it('discards a failed turn before sending a different question', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        streamResponse([
          frame({ type: 'text-delta', delta: 'Partial answer' }),
          frame({
            type: 'error',
            code: 'STREAM_ERROR',
            message: 'sanitized server message'
          })
        ])
      )
      .mockResolvedValueOnce(successResponse('Different answer.'));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Failed question');
    });
    await act(async () => {
      await result.current.send('Different question');
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1]?.body).toBe(
      JSON.stringify({
        messages: [{ role: 'user', content: 'Different question' }]
      })
    );
    expect(result.current.messages).toEqual([
      WELCOME_MESSAGE,
      { role: 'user', content: 'Different question' },
      { role: 'assistant', content: 'Different answer.' }
    ]);
  });

  it('treats a finished stream with no assistant text as an empty protocol error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        streamResponse([frame({ type: 'finish', finishReason: 'stop' })])
      )
    );
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.error).toEqual(
      expect.objectContaining({ kind: 'protocol', canRetry: true })
    );
    expect(result.current.messages.at(-1)).toEqual({
      role: 'user',
      content: 'Hello'
    });
  });

  it('reports output-token exhaustion instead of accepting truncated text as success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        streamResponse([
          frame({ type: 'text-delta', delta: 'Truncated answer' }),
          frame({ type: 'finish', finishReason: 'length' })
        ])
      )
    );
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Tell me everything.');
    });

    expect(result.current.messages.at(-1)).toEqual({
      role: 'assistant',
      content: 'Truncated answer'
    });
    expect(result.current.error).toEqual({
      kind: 'output_limit',
      message: 'The answer was cut off. Please ask a more specific question.',
      canRetry: false
    });
  });

  it('retries the same failed request without duplicating the user message', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(503, 'SERVICE_UNAVAILABLE'))
      .mockResolvedValueOnce(successResponse('Recovered.'));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });
    await act(async () => {
      await result.current.retry();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1]?.body).toBe(fetchMock.mock.calls[1][1]?.body);
    expect(result.current.messages.filter(message => message.role === 'user')).toEqual([
      { role: 'user', content: 'Hello' }
    ]);
    expect(result.current.messages.at(-1)).toEqual({
      role: 'assistant',
      content: 'Recovered.'
    });
    expect(result.current.error).toBeNull();
  });

  it('uses a fallback cooldown when a 429 omits Retry-After', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(429, 'RATE_LIMITED'))
      .mockResolvedValueOnce(successResponse('Recovered.'));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });

    expect(result.current.retryBlocked).toBe(true);
    expect(result.current.error).toEqual(
      expect.objectContaining({
        kind: 'rate_limit',
        retryAfterSeconds: 60
      })
    );

    await act(async () => {
      await result.current.retry();
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('blocks an immediate 429 retry and enables it after Retry-After', async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(errorResponse(429, 'RATE_LIMITED', '60'))
      .mockResolvedValueOnce(successResponse('Recovered.'));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useOnlineChat());

    await act(async () => {
      await result.current.send('Hello');
    });
    expect(result.current.retryBlocked).toBe(true);

    await act(async () => {
      await result.current.retry();
    });
    expect(fetchMock).toHaveBeenCalledOnce();

    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.retryBlocked).toBe(false);

    await act(async () => {
      await result.current.retry();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.messages.at(-1)).toEqual({
      role: 'assistant',
      content: 'Recovered.'
    });
  });

  it('aborts an active request and resets state when closed', async () => {
    let requestSignal: AbortSignal | undefined;
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      requestSignal = init?.signal ?? undefined;
      return new Response(
        new ReadableStream<Uint8Array>({
          start(controller): void {
            requestSignal?.addEventListener(
              'abort',
              () => controller.error(requestSignal?.reason),
              { once: true }
            );
          }
        }),
        { status: 200, headers: STREAM_RESPONSE_HEADERS }
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useOnlineChat());

    act(() => {
      void result.current.send('Hello');
    });
    await waitFor(() => expect(result.current.isStreaming).toBe(true));
    act(() => result.current.reset());

    expect(requestSignal?.aborted).toBe(true);
    expect(result.current.messages).toEqual([WELCOME_MESSAGE]);
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('aborts an active request when the hook unmounts', async () => {
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal ?? undefined;
        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller): void {
              requestSignal?.addEventListener(
                'abort',
                () => controller.error(requestSignal?.reason),
                { once: true }
              );
            }
          }),
          { status: 200, headers: STREAM_RESPONSE_HEADERS }
        );
      })
    );
    const hook = renderHook(() => useOnlineChat());

    act(() => {
      void hook.result.current.send('Hello');
    });
    await waitFor(() => expect(hook.result.current.isStreaming).toBe(true));
    hook.unmount();

    expect(requestSignal?.aborted).toBe(true);
  });
});
