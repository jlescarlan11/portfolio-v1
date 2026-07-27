import { describe, expect, it } from 'vitest';
import {
  RATE_LIMIT_REQUESTS,
  RATE_LIMIT_WINDOW_SECONDS
} from '../../src/features/chat/server/config';
import chat, { config } from '../functions/chat.mts';

describe('chat Netlify function', () => {
  it('scopes one distributed IP rule to normalized chat paths', () => {
    expect(config).toEqual({
      path: ['/api/chat', '/api/chat/', '/api//chat'],
      method: 'POST',
      rateLimit: {
        action: 'rewrite',
        to: '/api/chat/rate-limited',
        aggregateBy: ['ip'],
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

  it.each(['/api/chat/', '/api//chat'])(
    'normalizes the equivalent chat path %s before handling it',
    async (path) => {
      const response = await chat(
        new Request(`https://example.com${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{'
        }),
        {}
      );

      expect(response.status).toBe(400);
    }
  );

  it('rejects non-chat API paths before they reach the provider handler', async () => {
    const response = await chat(
      new Request('https://example.com/api/not-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{'
      }),
      {}
    );

    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });
});
