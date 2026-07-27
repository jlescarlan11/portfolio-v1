import { describe, expect, it } from 'vitest';
import type { ChatMessage } from './contracts';
import {
  CurrentMessageTooLargeError,
  estimateTokenCount,
  prepareChatContext
} from './token-budget';

describe('prepareChatContext', () => {
  it('keeps the full conversation when it is within budget', () => {
    const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }];
    const result = prepareChatContext('System', messages, 100);

    expect(result.messages).toEqual(messages);
    expect(result.trimmedTurnCount).toBe(0);
  });

  it('trims the oldest complete turns while preserving the current user message', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'a'.repeat(60) },
      { role: 'assistant', content: 'b'.repeat(60) },
      { role: 'user', content: 'c'.repeat(30) },
      { role: 'assistant', content: 'd'.repeat(30) },
      { role: 'user', content: 'current question' }
    ];
    const currentOnly = estimateTokenCount('system') + estimateTokenCount('current question') + 4;
    const result = prepareChatContext('system', messages, currentOnly + 40);

    expect(result.messages).toEqual([
      { role: 'user', content: 'c'.repeat(30) },
      { role: 'assistant', content: 'd'.repeat(30) },
      { role: 'user', content: 'current question' }
    ]);
    expect(result.trimmedTurnCount).toBe(1);
  });

  it('rejects when the trusted prompt plus current message cannot fit', () => {
    expect(() =>
      prepareChatContext(
        'system',
        [{ role: 'user', content: 'x'.repeat(100) }],
        10
      )
    ).toThrow(CurrentMessageTooLargeError);
  });
});
