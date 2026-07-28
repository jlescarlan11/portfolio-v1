import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HOSTED_CHAT_MODEL,
  HOSTED_CHAT_REASONING,
  HOSTED_CHAT_VERBOSITY,
  MAX_OUTPUT_TOKENS,
  PROVIDER_TIMEOUT_MS
} from './config';

const mocks = vi.hoisted(() => {
  return {
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

vi.mock('ai', () => ({
  streamText: mocks.streamText
}));

import { startHostedChat } from './provider';

const TEST_SYSTEM_PROMPT = 'Use this exact cached system prompt.';

describe('startHostedChat', () => {
  beforeEach(() => {
    vi.stubEnv('VERCEL_OIDC_TOKEN', 'test-placeholder-oidc-token');
    vi.stubEnv('AI_GATEWAY_API_KEY', '');
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('OPENAI_BASE_URL', '');
    vi.stubEnv('NETLIFY_AI_GATEWAY_KEY', '');
    vi.stubEnv('NETLIFY_AI_GATEWAY_BASE_URL', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('owns the gateway, model, prompt, output budget, timeout, and abort signal on the server', async () => {
    const signal = new AbortController().signal;
    const messages = [{ role: 'user' as const, content: 'Tell me about John.' }];
    const stream = await startHostedChat({
      messages,
      signal,
      systemPrompt: TEST_SYSTEM_PROMPT
    });

    expect(mocks.streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: HOSTED_CHAT_MODEL,
        system: TEST_SYSTEM_PROMPT,
        messages,
        reasoning: HOSTED_CHAT_REASONING,
        providerOptions: {
          openai: {
            textVerbosity: HOSTED_CHAT_VERBOSITY
          }
        },
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

  it('accepts the AI Gateway API key supported for local development', () => {
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');
    vi.stubEnv('AI_GATEWAY_API_KEY', 'test-placeholder-gateway-key');

    startHostedChat({
      messages: [{ role: 'user', content: 'Hello' }],
      signal: new AbortController().signal,
      systemPrompt: TEST_SYSTEM_PROMPT
    });

    expect(mocks.streamText).toHaveBeenCalledOnce();
  });

  it('fails closed without server-side gateway authentication', () => {
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');
    vi.stubEnv('AI_GATEWAY_API_KEY', '');

    expect(() =>
      startHostedChat({
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
        systemPrompt: TEST_SYSTEM_PROMPT
      })
    ).toThrow('Hosted chat configuration is unavailable.');
    expect(mocks.streamText).not.toHaveBeenCalled();
  });

  it('does not accept a credential exposed through a client-public variable', () => {
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');
    vi.stubEnv('AI_GATEWAY_API_KEY', '');
    vi.stubEnv(
      'NEXT_PUBLIC_AI_GATEWAY_API_KEY',
      'test-placeholder-public-key'
    );

    expect(() =>
      startHostedChat({
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
        systemPrompt: TEST_SYSTEM_PROMPT
      })
    ).toThrow('Hosted chat configuration is unavailable.');
    expect(mocks.streamText).not.toHaveBeenCalled();
  });

  it('does not fall back to obsolete OpenAI or Netlify credentials', () => {
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');
    vi.stubEnv('AI_GATEWAY_API_KEY', '');
    vi.stubEnv('OPENAI_API_KEY', 'test-placeholder-openai-key');
    vi.stubEnv('OPENAI_BASE_URL', 'https://openai.invalid/v1');
    vi.stubEnv('NETLIFY_AI_GATEWAY_KEY', 'test-placeholder-netlify-key');
    vi.stubEnv(
      'NETLIFY_AI_GATEWAY_BASE_URL',
      'https://netlify-gateway.invalid'
    );

    expect(() =>
      startHostedChat({
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
        systemPrompt: TEST_SYSTEM_PROMPT
      })
    ).toThrow('Hosted chat configuration is unavailable.');
    expect(mocks.streamText).not.toHaveBeenCalled();
  });
});
