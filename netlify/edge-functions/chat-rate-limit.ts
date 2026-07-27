import type { Config, Context } from '@netlify/edge-functions';
import {
  RATE_LIMIT_REQUESTS,
  RATE_LIMIT_WINDOW_SECONDS
} from '../../src/features/chat/server/config';

export default async function chatRateLimit(
  _request: Request,
  context: Context
): Promise<Response> {
  return context.next();
}

export const config: Config = {
  path: '/api/chat',
  method: 'POST',
  rateLimit: {
    action: 'rewrite',
    to: '/api/chat/rate-limited',
    aggregateBy: ['ip', 'domain'],
    windowLimit: RATE_LIMIT_REQUESTS,
    windowSize: RATE_LIMIT_WINDOW_SECONDS
  }
};
