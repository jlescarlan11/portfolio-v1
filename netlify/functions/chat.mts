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
    action: 'rate_limit',
    aggregateBy: ['ip', 'domain'],
    // Netlify requires inline config declarations to contain static literals.
    // The companion test guards these values against server-config drift.
    windowLimit: 20,
    windowSize: 60
  }
};
