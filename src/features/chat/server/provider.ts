import { streamText, type ModelMessage } from 'ai';
import {
  HOSTED_CHAT_MODEL,
  HOSTED_CHAT_REASONING,
  HOSTED_CHAT_VERBOSITY,
  assertHostedChatConfiguration,
  MAX_OUTPUT_TOKENS,
  PROVIDER_TIMEOUT_MS
} from './config';
import type { HostedChatStream, StartHostedChat } from './contracts';

export const startHostedChat: StartHostedChat = ({
  messages,
  signal,
  systemPrompt
}): HostedChatStream => {
  assertHostedChatConfiguration();

  const modelMessages: ModelMessage[] = messages.map(message => ({
    role: message.role,
    content: message.content
  }));

  const result = streamText({
    model: HOSTED_CHAT_MODEL,
    system: systemPrompt,
    messages: modelMessages,
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
