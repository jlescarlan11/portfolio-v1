import type { Context } from '@netlify/edge-functions';
import { describe, expect, it, vi } from 'vitest';
import {
  RATE_LIMIT_REQUESTS,
  RATE_LIMIT_WINDOW_SECONDS
} from '../../src/features/chat/server/config';
import chatRateLimit, { config } from './chat-rate-limit';

describe('chat rate limit edge function', () => {
  it('declares a distributed IP-and-domain rule with the documented boundary', () => {
    expect(config).toEqual({
      path: '/api/chat',
      method: 'POST',
      rateLimit: {
        action: 'rewrite',
        to: '/api/chat/rate-limited',
        aggregateBy: ['ip', 'domain'],
        windowLimit: RATE_LIMIT_REQUESTS,
        windowSize: RATE_LIMIT_WINDOW_SECONDS
      }
    });
  });

  it('passes below-limit requests to the Next route without process-local counters', async () => {
    const next = vi.fn(async () => new Response('ok'));
    const context = { next } as unknown as Context;
    const incoming = new Request('https://example.com/api/chat', { method: 'POST' });

    const results = await Promise.all([
      chatRateLimit(incoming, context),
      chatRateLimit(incoming, context)
    ]);

    expect(next).toHaveBeenCalledTimes(2);
    expect(await results[0].text()).toBe('ok');
    expect(await results[1].text()).toBe('ok');
  });
});
