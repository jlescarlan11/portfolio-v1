import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSystemPrompt } from '../content';
import {
  HOSTED_CHAT_MODEL,
  HOSTED_CHAT_REASONING,
  MAX_OUTPUT_TOKENS,
  PROVIDER_TIMEOUT_MS
} from './config';

const mocks = vi.hoisted(() => {
  const chat = vi.fn(() => ({ modelId: 'mock-model' }));
  return {
    chat,
    createOpenAI: vi.fn(() => ({ chat })),
    streamText: vi.fn(() => ({
      textStream: {
        async *[Symbol.asyncIterator]() {
          yield 'Hello';
        }
      },
      finishReason: Promise.resolve('stop'),
      usage: Promise.resolve({ inputTokens: 10, outputTokens: 2 })
    }))
  };
});

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: mocks.createOpenAI
}));

vi.mock('ai', () => ({
  streamText: mocks.streamText
}));

import { startHostedChat } from './provider';

describe('startHostedChat', () => {
  beforeEach(() => {
    vi.stubEnv('NETLIFY_AI_GATEWAY_KEY', '');
    vi.stubEnv('NETLIFY_AI_GATEWAY_BASE_URL', '');
    vi.stubEnv('OPENAI_API_KEY', 'test-placeholder-key');
    vi.stubEnv('OPENAI_BASE_URL', 'https://gateway.invalid/v1');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('owns the gateway, model, prompt, output budget, timeout, and abort signal on the server', async () => {
    const signal = new AbortController().signal;
    const messages = [{ role: 'user' as const, content: 'Tell me about John.' }];
    const stream = await startHostedChat({ messages, signal });

    expect(mocks.createOpenAI).toHaveBeenCalledWith({
      apiKey: 'test-placeholder-key',
      baseURL: 'https://gateway.invalid/v1',
      name: 'netlify-ai-gateway'
    });
    expect(mocks.chat).toHaveBeenCalledWith(HOSTED_CHAT_MODEL);
    expect(mocks.streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: buildSystemPrompt(),
        messages,
        reasoning: HOSTED_CHAT_REASONING,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        maxRetries: 0,
        abortSignal: signal,
        timeout: {
          totalMs: PROVIDER_TIMEOUT_MS,
          firstChunkMs: PROVIDER_TIMEOUT_MS,
          chunkMs: PROVIDER_TIMEOUT_MS
        }
      })
    );
    expect(await stream.iterator.next()).toEqual({ value: 'Hello', done: false });
    expect(await stream.getCompletion()).toEqual({
      finishReason: 'stop',
      inputTokens: 10,
      outputTokens: 2
    });
  });

  it('prefers Netlify collision-free gateway configuration when both pairs exist', () => {
    vi.stubEnv('NETLIFY_AI_GATEWAY_KEY', 'netlify-test-placeholder-key');
    vi.stubEnv(
      'NETLIFY_AI_GATEWAY_BASE_URL',
      'https://netlify-gateway.invalid/'
    );

    startHostedChat({
      messages: [{ role: 'user', content: 'Hello' }],
      signal: new AbortController().signal
    });

    expect(mocks.createOpenAI).toHaveBeenCalledWith({
      apiKey: 'netlify-test-placeholder-key',
      baseURL: 'https://netlify-gateway.invalid/v1',
      name: 'netlify-ai-gateway'
    });
  });

  it('uses the official OpenAI endpoint when the fallback key has no custom base URL', () => {
    vi.stubEnv('OPENAI_BASE_URL', '');

    startHostedChat({
      messages: [{ role: 'user', content: 'Hello' }],
      signal: new AbortController().signal
    });

    expect(mocks.createOpenAI).toHaveBeenCalledWith({
      apiKey: 'test-placeholder-key',
      baseURL: 'https://api.openai.com/v1',
      name: 'netlify-ai-gateway'
    });
  });

  it('fails without exposing details when gateway configuration is missing', () => {
    vi.stubEnv('NETLIFY_AI_GATEWAY_KEY', '');
    vi.stubEnv('NETLIFY_AI_GATEWAY_BASE_URL', '');
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('OPENAI_BASE_URL', '');

    expect(() =>
      startHostedChat({
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal
      })
    ).toThrow('Hosted chat configuration is unavailable.');
  });
});
