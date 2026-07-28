import { describe, expect, it, vi } from 'vitest';
import {
  CHAT_RATE_LIMIT_ID,
  checkChatRateLimit,
  createChatRateLimitedResponse,
  createChatRateLimitUnavailableResponse,
  type FirewallRateLimitCheck
} from './rate-limit';

const TEST_REQUEST = new Request('https://portfolio.example/api/chat', {
  method: 'POST'
});

describe('chat rate-limit boundary', () => {
  it('delegates the anonymous key to Vercel without supplying an application-derived key', async () => {
    const check: FirewallRateLimitCheck = vi.fn(async () => ({
      rateLimited: false
    }));

    await expect(checkChatRateLimit(TEST_REQUEST, check)).resolves.toBe(
      'allowed'
    );
    expect(check).toHaveBeenCalledWith(CHAT_RATE_LIMIT_ID, {
      request: TEST_REQUEST
    });
  });

  it.each([
    ['limited response', { rateLimited: true }, 'limited'],
    [
      'blocked response',
      { rateLimited: true, error: 'blocked' as const },
      'limited'
    ],
    [
      'missing rule',
      { rateLimited: false, error: 'not-found' as const },
      'unavailable'
    ]
  ])('maps a %s without exposing platform details', async (
    _name,
    result,
    expected
  ) => {
    const check: FirewallRateLimitCheck = vi.fn(async () => result);

    await expect(checkChatRateLimit(TEST_REQUEST, check)).resolves.toBe(
      expected
    );
  });

  it('fails closed when the distributed limiter cannot be reached', async () => {
    const check: FirewallRateLimitCheck = vi.fn(async () => {
      throw new Error('private platform failure');
    });

    await expect(checkChatRateLimit(TEST_REQUEST, check)).resolves.toBe(
      'unavailable'
    );
  });

  it('returns the established 429 contract with privacy-safe telemetry', async () => {
    const writeTelemetry = vi.fn();
    const response = createChatRateLimitedResponse(writeTelemetry);

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('60');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(await response.json()).toEqual({
      error: {
        code: 'RATE_LIMITED',
        message: 'You have sent too many messages. Please try again in a minute.'
      }
    });
    expect(writeTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'application_rate_limited',
        errorCategory: 'application_rate_limit'
      })
    );
    expect(JSON.stringify(writeTelemetry.mock.calls)).not.toMatch(
      /authorization|content|credential|ip|prompt/i
    );
  });

  it('returns a sanitized 503 when enforcement is unavailable', async () => {
    const writeTelemetry = vi.fn();
    const response = createChatRateLimitUnavailableResponse(writeTelemetry);

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'The chat service is temporarily unavailable. Please try again.'
      }
    });
    expect(writeTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        errorCategory: 'application_rate_limit'
      })
    );
  });
});
