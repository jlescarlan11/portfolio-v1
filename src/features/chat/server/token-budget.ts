import { MAX_CONTEXT_TOKENS } from './config';
import type { ChatMessage } from './contracts';

// Two UTF-8 bytes per token intentionally overestimates English and non-Latin text.
const BYTES_PER_ESTIMATED_TOKEN = 2;

export interface PreparedChatContext {
  messages: ChatMessage[];
  estimatedTokens: number;
  trimmedTurnCount: number;
}

export class CurrentMessageTooLargeError extends Error {
  constructor() {
    super('The current message exceeds the hosted chat context budget.');
    this.name = 'CurrentMessageTooLargeError';
  }
}

export function estimateTokenCount(value: string): number {
  return Math.ceil(
    new TextEncoder().encode(value).byteLength / BYTES_PER_ESTIMATED_TOKEN
  );
}

function estimateContextTokens(systemPrompt: string, messages: ChatMessage[]): number {
  const messageTokens = messages.reduce(
    (total, message) => total + estimateTokenCount(message.content) + 4,
    0
  );
  return estimateTokenCount(systemPrompt) + messageTokens;
}

export function prepareChatContext(
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number = MAX_CONTEXT_TOKENS
): PreparedChatContext {
  const currentUserMessage = messages[messages.length - 1];
  const minimumTokens = estimateContextTokens(systemPrompt, [currentUserMessage]);

  if (minimumTokens > maxTokens) {
    throw new CurrentMessageTooLargeError();
  }

  const prepared = [...messages];
  let trimmedTurnCount = 0;
  let estimatedTokens = estimateContextTokens(systemPrompt, prepared);

  while (estimatedTokens > maxTokens && prepared.length > 1) {
    prepared.splice(0, 2);
    trimmedTurnCount += 1;
    estimatedTokens = estimateContextTokens(systemPrompt, prepared);
  }

  return { messages: prepared, estimatedTokens, trimmedTurnCount };
}
