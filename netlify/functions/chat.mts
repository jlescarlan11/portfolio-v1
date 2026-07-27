import { handleChatRequest } from '../../src/features/chat/server/handler';

const CHAT_PATH = '/api/chat';

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+/g, '/').replace(/\/+$/, '');
}

export default async function chat(
  request: Request,
  _context: unknown
): Promise<Response> {
  void _context;
  if (normalizePathname(new URL(request.url).pathname) !== CHAT_PATH) {
    return new Response(null, {
      status: 404,
      headers: { 'Cache-Control': 'no-store' }
    });
  }
  return handleChatRequest(request);
}

export const config = {
  path: '/api/*',
  excludedPath: '/api/chat/rate-limited',
  method: 'POST',
  rateLimit: {
    action: 'rewrite',
    to: '/api/chat/rate-limited',
    aggregateBy: ['ip'],
    // Netlify requires inline config declarations to contain static literals.
    // windowLimit is the maximum permitted count, so 20 allows request 20 and
    // applies the rewrite starting with request 21.
    // The companion test guards this translation against server-config drift.
    windowLimit: 20,
    windowSize: 60
  }
};
