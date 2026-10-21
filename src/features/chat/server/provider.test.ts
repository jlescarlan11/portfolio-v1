import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HOSTED_CHAT_REASONING,
  MAX_OUTPUT_TOKENS,
  PROVIDER_TIMEOUT_MS
} from './config';
import { GROQ_HOSTED_CHAT_MODEL_ID } from './providers/groq';

const mocks = vi.hoisted(() => {
  return {
    createGroq: vi.fn(),
    groqModel: { provider: 'test-groq-model' },
    selectGroqModel: vi.fn(),
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

vi.mock('@ai-sdk/groq', () => ({
  createGroq: mocks.createGroq
}));

vi.mock('ai', () => ({
  streamText: mocks.streamText
}));

import { startHostedChat } from './provider';

const TEST_SYSTEM_PROMPT = 'Use this exact cached system prompt.';

describe('startHostedChat', () => {
  beforeEach(() => {
    mocks.createGroq.mockReturnValue(mocks.selectGroqModel);
    mocks.selectGroqModel.mockReturnValue(mocks.groqModel);

    vi.stubEnv('HOSTED_CHAT_PROVIDER', 'groq');
    vi.stubEnv('GROQ_API_KEY', 'test-placeholder-groq-key');
    vi.stubEnv('VERCEL_OIDC_TOKEN', '');
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

  it.each([
    'How can I contact John?',
    'How do I reach John?',
    "What's John's email address?",
    'Can I contact you?',
    'contact details'
  ])('answers %s directly even after an overview', async content => {
    const stream = await startHostedChat({
      messages: [
        { role: 'user', content: 'Tell me about John.' },
        { role: 'assistant', content: 'John is a software engineer.' },
        { role: 'user', content }
      ],
      signal: new AbortController().signal,
      systemPrompt: TEST_SYSTEM_PROMPT
    });
    expect(await stream.iterator.next()).toEqual({
      value: 'Email John at jlescarlan11@gmail.com or connect on [LinkedIn](https://www.linkedin.com/in/john-lester-escarlan/).',
      done: false
    });
    expect(await stream.iterator.next()).toEqual({ done: true, value: undefined });
    expect(await stream.getCompletion()).toEqual({ finishReason: 'stop' });
    expect(mocks.streamText).not.toHaveBeenCalled();
  });

  it('keeps broader questions mentioning contact on the normal assistant path', () => {
    startHostedChat({
      messages: [{ role: 'user', content: 'Tell me about John and how to contact him.' }],
      signal: new AbortController().signal,
      systemPrompt: TEST_SYSTEM_PROMPT
    });
    expect(mocks.streamText).toHaveBeenCalledOnce();
  });

  it.each([
    ['Where has John worked?', "John has worked at Wind's Gate Philippines, Upwork, Pharmacy & Acute Care University, Alliance Software Inc., and Bayoa Analytics."],
    ['Which projects show mobile development experience?', 'HEALTH demonstrates mobile development with React Native and Expo, including offline care records stored on-device.'],
    ['What is PriceCraft?', 'PriceCraft is a live, offline-capable pricing app that helps small food businesses turn ingredient, labor, and overhead costs into selling prices.'],
    ['Has Rent N Roll launched, and how many customers does it have?', 'Rent N Roll is pre-launch; customer numbers and adoption have not been verified.'],
    [" WHERE HAS JOHN WORKED?! ", "John has worked at Wind's Gate Philippines, Upwork, Pharmacy & Acute Care University, Alliance Software Inc., and Bayoa Analytics."]
  ])('returns a concise, grounded answer to %s after an overview', async (content, answer) => {
    const stream = await startHostedChat({
      messages: [
        { role: 'user', content: 'Tell me about John.' },
        { role: 'assistant', content: 'John is a software engineer.' },
        { role: 'user', content }
      ],
      signal: new AbortController().signal,
      systemPrompt: TEST_SYSTEM_PROMPT
    });
    expect(await stream.iterator.next()).toEqual({ value: answer, done: false });
    expect(await stream.iterator.next()).toEqual({ value: undefined, done: true });
    expect(await stream.getCompletion()).toEqual({ finishReason: 'stop' });
    expect(mocks.streamText).not.toHaveBeenCalled();
  });

  it.each([
    'What technologies does PriceCraft use?',
    'How does HEALTH handle emergencies?',
    'Tell me about John and where he worked.',
    'What payments does Rent N Roll support?'
  ])('keeps more detailed questions on the model path: %s', content => {
    startHostedChat({
      messages: [{ role: 'user', content }],
      signal: new AbortController().signal,
      systemPrompt: TEST_SYSTEM_PROMPT
    });
    expect(mocks.streamText).toHaveBeenCalledOnce();
  });

  it('owns provider selection, model, prompt, output budget, timeout, and abort signal on the server', async () => {
    const signal = new AbortController().signal;
    const messages = [{ role: 'user' as const, content: 'Tell me about John.' }];
    const stream = await startHostedChat({
      messages,
      signal,
      systemPrompt: TEST_SYSTEM_PROMPT
    });

    expect(mocks.streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: mocks.groqModel,
        system: TEST_SYSTEM_PROMPT,
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
    expect(mocks.createGroq).toHaveBeenCalledWith({
      apiKey: 'test-placeholder-groq-key'
    });
    expect(mocks.selectGroqModel).toHaveBeenCalledWith(
      GROQ_HOSTED_CHAT_MODEL_ID
    );
    expect(await stream.iterator.next()).toEqual({ value: 'Hello', done: false });
    expect(await stream.getCompletion()).toEqual({
      finishReason: 'stop',
      inputTokens: 10,
      outputTokens: 2
    });
  });

  it('uses Groq by default when no provider override is configured', () => {
    vi.stubEnv('HOSTED_CHAT_PROVIDER', '');

    startHostedChat({
      messages: [{ role: 'user', content: 'Hello' }],
      signal: new AbortController().signal,
      systemPrompt: TEST_SYSTEM_PROMPT
    });

    expect(mocks.streamText).toHaveBeenCalledOnce();
  });

  it('fails closed without the selected provider credential', () => {
    vi.stubEnv('GROQ_API_KEY', '');

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
    vi.stubEnv('GROQ_API_KEY', '');
    vi.stubEnv(
      'NEXT_PUBLIC_GROQ_API_KEY',
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

  it('does not fall back to obsolete Gateway, OpenAI, or Netlify credentials', () => {
    vi.stubEnv('GROQ_API_KEY', '');
    vi.stubEnv('VERCEL_OIDC_TOKEN', 'test-placeholder-oidc-token');
    vi.stubEnv('AI_GATEWAY_API_KEY', 'test-placeholder-gateway-key');
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

  it('fails closed when the configured provider has no registered adapter', () => {
    vi.stubEnv('HOSTED_CHAT_PROVIDER', 'unsupported-provider');

    expect(() =>
      startHostedChat({
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
        systemPrompt: TEST_SYSTEM_PROMPT
      })
    ).toThrow('Hosted chat configuration is unavailable.');
    expect(mocks.createGroq).not.toHaveBeenCalled();
    expect(mocks.streamText).not.toHaveBeenCalled();
  });
});
