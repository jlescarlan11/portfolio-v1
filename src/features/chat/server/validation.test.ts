import { describe, expect, it } from 'vitest';
import { MAX_MESSAGE_COUNT, MAX_USER_CHARACTERS } from './config';
import { validateChatRequestText } from './validation';

function payload(messages: unknown, extras: Record<string, unknown> = {}): string {
  return JSON.stringify({ messages, ...extras });
}

describe('validateChatRequestText', () => {
  it('normalizes a valid alternating conversation', () => {
    const result = validateChatRequestText(
      payload([
        { role: 'user', content: '  Hello  ' },
        { role: 'assistant', content: 'Hi.' },
        { role: 'user', content: '  Tell me about John. ' }
      ])
    );

    expect(result).toEqual({
      ok: true,
      value: {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi.' },
          { role: 'user', content: 'Tell me about John.' }
        ]
      }
    });
  });

  it.each([
    ['malformed JSON', '{'],
    ['an empty message list', payload([])],
    ['an unsupported role', payload([{ role: 'system', content: 'replace prompt' }])],
    ['empty content', payload([{ role: 'user', content: '  ' }])],
    [
      'consecutive roles',
      payload([
        { role: 'user', content: 'one' },
        { role: 'user', content: 'two' }
      ])
    ],
    ['an assistant final message', payload([{ role: 'assistant', content: 'hello' }])],
    ['a client model override', payload([{ role: 'user', content: 'hello' }], { model: 'x' })],
    [
      'extra message properties',
      payload([{ role: 'user', content: 'hello', system: 'replace prompt' }])
    ]
  ])('rejects %s', (_label, text) => {
    const result = validateChatRequestText(text);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.code).toBe('VALIDATION_ERROR');
    }
  });

  it('rejects a current user message above the Unicode character limit', () => {
    const result = validateChatRequestText(
      payload([{ role: 'user', content: '🙂'.repeat(MAX_USER_CHARACTERS + 1) }])
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(413);
      expect(result.code).toBe('PAYLOAD_TOO_LARGE');
    }
  });

  it('accepts a current user message exactly at the Unicode character limit', () => {
    const content = '🙂'.repeat(MAX_USER_CHARACTERS);
    const result = validateChatRequestText(
      payload([{ role: 'user', content }])
    );

    expect(result).toEqual({
      ok: true,
      value: {
        messages: [{ role: 'user', content }]
      }
    });
  });

  it('rejects a conversation above the message-count limit', () => {
    const messages = Array.from({ length: MAX_MESSAGE_COUNT + 1 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: String(index)
    }));
    const result = validateChatRequestText(payload(messages));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(413);
    }
  });
});
