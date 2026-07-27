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
  rateLimit: {
    action: 'rewrite',
    to: '/api/chat/rate-limited',
    aggregateBy: ['ip', 'domain'],
    // Netlify requires inline config declarations to contain static literals.
    // It starts blocking after this count is exceeded, so 19 implements the
    // product boundary of 20 allowed requests and a blocked request 21.
    // The companion test guards this translation against server-config drift.
    windowLimit: 19,
    windowSize: 60
  }
};
