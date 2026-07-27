import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

describe('rate-limited chat route', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns the public 429 contract and emits only privacy-safe telemetry', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const response = await POST();

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
    expect(info).toHaveBeenCalledOnce();
    const serialized = String(info.mock.calls[0][0]);
    expect(serialized).toContain('"status":"application_rate_limited"');
    expect(serialized).not.toContain('authorization');
    expect(serialized).not.toContain('content');
    expect(serialized).not.toContain('ip');
  });
});
