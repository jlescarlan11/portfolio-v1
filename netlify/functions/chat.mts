import { handleChatRequest } from '../../src/features/chat/server/handler';

export default async function chat(
  request: Request,
  _context: unknown
): Promise<Response> {
  void _context;
  return handleChatRequest(request);
}

export const config = {
  path: '/api/chat',
  method: 'POST',
  rateLimit: {
    action: 'rewrite',
    to: '/api/chat/rate-limited',
    aggregateBy: ['ip', 'domain'],
    // Netlify requires inline config declarations to contain static literals.
    // windowLimit is the maximum permitted count, so 20 allows request 20 and
    // applies the rewrite starting with request 21.
    // The companion test guards this translation against server-config drift.
    windowLimit: 20,
    windowSize: 60
  }
};
