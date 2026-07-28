import { streamText, type ModelMessage } from 'ai';
import {
  HOSTED_CHAT_REASONING,
  MAX_OUTPUT_TOKENS,
  PROVIDER_TIMEOUT_MS
} from './config';
import type { HostedChatStream, StartHostedChat } from './contracts';
import { resolveHostedChatProvider } from './providers';

export const startHostedChat: StartHostedChat = ({
  messages,
  signal,
  systemPrompt
}): HostedChatStream => {
  const environment = process.env;
  const hostedProvider = resolveHostedChatProvider(environment);
  const model = hostedProvider.createModel(environment);

  const modelMessages: ModelMessage[] = messages.map(message => ({
    role: message.role,
    content: message.content
  }));

  const result = streamText({
    model,
    system: systemPrompt,
    messages: modelMessages,
    reasoning: HOSTED_CHAT_REASONING,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    maxRetries: 0,
    abortSignal: signal,
    timeout: {
      totalMs: PROVIDER_TIMEOUT_MS,
      firstChunkMs: PROVIDER_TIMEOUT_MS,
      chunkMs: PROVIDER_TIMEOUT_MS
    },
    onError: () => {
      // The route emits a sanitized operational event without raw provider data.
    }
  });

  return {
    iterator: result.textStream[Symbol.asyncIterator](),
    getCompletion: async () => {
      const [finishReason, usage] = await Promise.all([
        result.finishReason,
        result.usage
      ]);
      return {
        finishReason,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens
      };
    }
  };
};
