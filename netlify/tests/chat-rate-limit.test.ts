import { describe, expect, it } from 'vitest';
import {
  RATE_LIMIT_REQUESTS,
  RATE_LIMIT_WINDOW_SECONDS
} from '../../src/features/chat/server/config';
import chat, { config } from '../functions/chat.mts';

describe('chat Netlify function', () => {
  it('declares a distributed IP-and-domain rule with the documented boundary', () => {
    expect(config).toEqual({
      path: '/api/chat',
      rateLimit: {
        action: 'rate_limit',
        aggregateBy: ['ip', 'domain'],
        windowLimit: RATE_LIMIT_REQUESTS,
        windowSize: RATE_LIMIT_WINDOW_SECONDS
      }
    });
  });

  it('passes below-limit requests to the shared handler without process-local counters', async () => {
    const incoming = (): Request =>
      new Request('https://example.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{'
      });

    const results = await Promise.all([
      chat(incoming(), {}),
      chat(incoming(), {})
    ]);

    expect(results.map(result => result.status)).toEqual([400, 400]);
    expect(await results[0].json()).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Check your conversation and try again.'
      }
    });
  });
});
