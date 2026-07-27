import type { Config, Context } from '@netlify/edge-functions';

export default async function chatRateLimit(
  _request: Request,
  context: Context
): Promise<Response> {
  return context.next();
}

export const config: Config = {
  path: '/api/chat',
  rateLimit: {
    action: 'rewrite',
    to: '/api/chat/rate-limited',
    aggregateBy: ['ip', 'domain'],
    // Netlify requires inline config declarations to contain static literals.
    // The companion test guards these values against server-config drift.
    windowLimit: 20,
    windowSize: 60
  }
};
