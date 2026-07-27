import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { handleChatRequest } from '@/features/chat/server/handler';

vi.mock('@/features/chat/server/handler', () => ({
  handleChatRequest: vi.fn(async () => new Response(null, { status: 204 }))
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.mocked(handleChatRequest).mockClear();
});

describe('chat App Router fallback', () => {
  it('fails closed when a Netlify request bypasses the edge function', async () => {
    vi.stubEnv('SITE_ID', 'production-site');
    const request = new Request('https://example.com/api/chat/', {
      method: 'POST'
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
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
    expect(handleChatRequest).not.toHaveBeenCalled();
  });

  it('retains the direct handler for local and non-Netlify runtimes', async () => {
    vi.stubEnv('SITE_ID', '');
    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST'
    });

    const response = await POST(request);

    expect(response.status).toBe(204);
    expect(handleChatRequest).toHaveBeenCalledWith(request);
  });
});
