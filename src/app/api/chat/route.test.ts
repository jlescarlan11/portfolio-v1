import { afterEach, describe, expect, it, vi } from 'vitest';
import { maxDuration, POST } from './route';
import { handleChatRequest } from '@/features/chat/server/handler';
import {
  PROVIDER_TIMEOUT_MS,
  REQUEST_BODY_TIMEOUT_MS
} from '@/features/chat/server/config';
import {
  checkChatRateLimit,
  createChatRateLimitedResponse,
  createChatRateLimitUnavailableResponse
} from '@/features/chat/server/rate-limit';

vi.mock('@/features/chat/server/handler', () => ({
  handleChatRequest: vi.fn(async () => new Response(null, { status: 204 }))
}));

vi.mock('@/features/chat/server/rate-limit', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@/features/chat/server/rate-limit')>();
  return {
    ...actual,
    checkChatRateLimit: vi.fn(async () => 'allowed')
  };
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.mocked(handleChatRequest).mockClear();
  vi.mocked(checkChatRateLimit).mockReset();
  vi.mocked(checkChatRateLimit).mockResolvedValue('allowed');
});

function chatRequest(): Request {
  return new Request('https://example.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"messages":[]}'
  });
}

describe('chat App Router route', () => {
  it('reserves function time for cleanup and terminal framing', () => {
    const requiredHeadroomMs = 1_000;

    expect(
      REQUEST_BODY_TIMEOUT_MS + PROVIDER_TIMEOUT_MS
    ).toBeLessThanOrEqual(
      maxDuration * 1_000 - requiredHeadroomMs
    );
  });

  it('fails closed when a Netlify request bypasses the edge function', async () => {
    vi.stubEnv('SITE_ID', 'production-site');
    const request = new Request('https://example.com/api/chat/', {
      method: 'POST'
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(checkChatRateLimit).not.toHaveBeenCalled();
    expect(handleChatRequest).not.toHaveBeenCalled();
  });

  it('fails closed when only the Netlify runtime marker is available', async () => {
    vi.stubEnv('SITE_ID', '');
    vi.stubEnv('NETLIFY', 'true');
    const request = new Request('https://example.com/api/chat', {
      method: 'POST'
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
    expect(checkChatRateLimit).not.toHaveBeenCalled();
    expect(handleChatRequest).not.toHaveBeenCalled();
  });

  it('checks Vercel Firewall before calling the shared handler', async () => {
    vi.stubEnv('SITE_ID', '');
    const request = chatRequest();

    const response = await POST(request);

    expect(response.status).toBe(204);
    expect(checkChatRateLimit).toHaveBeenCalledWith(request);
    expect(handleChatRequest).toHaveBeenCalledWith(request);
  });

  it('returns the established 429 response before provider handling', async () => {
    vi.mocked(checkChatRateLimit).mockResolvedValue('limited');
    const response = await POST(chatRequest());

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('60');
    expect(await response.json()).toEqual(
      await createChatRateLimitedResponse(vi.fn()).json()
    );
    expect(handleChatRequest).not.toHaveBeenCalled();
  });

  it('fails closed when the distributed limiter is unavailable', async () => {
    vi.mocked(checkChatRateLimit).mockResolvedValue('unavailable');
    const response = await POST(chatRequest());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual(
      await createChatRateLimitUnavailableResponse(vi.fn()).json()
    );
    expect(handleChatRequest).not.toHaveBeenCalled();
  });

  it('preserves fixed-window boundary and expiry behavior from the limiter contract', async () => {
    let nowMs = 0;
    let windowStartedAt = nowMs;
    let accepted = 0;
    vi.mocked(checkChatRateLimit).mockImplementation(async () => {
      if (nowMs - windowStartedAt >= 60_000) {
        windowStartedAt = nowMs;
        accepted = 0;
      }
      accepted += 1;
      return accepted <= 20 ? 'allowed' : 'limited';
    });

    const belowLimit = await Promise.all(
      Array.from({ length: 19 }, () => POST(chatRequest()))
    );
    expect(belowLimit.every(response => response.status === 204)).toBe(true);

    const boundary = await Promise.all([
      POST(chatRequest()),
      POST(chatRequest())
    ]);
    expect(boundary.map(response => response.status).sort()).toEqual([
      204,
      429
    ]);
    expect(handleChatRequest).toHaveBeenCalledTimes(20);

    nowMs = 60_001;
    await expect(POST(chatRequest())).resolves.toHaveProperty('status', 204);
    expect(handleChatRequest).toHaveBeenCalledTimes(21);
  });
});
