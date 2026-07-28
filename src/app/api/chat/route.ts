import { handleChatRequest } from '@/features/chat/server/handler';
import { isNetlifyRuntime } from '@/features/chat/server/config';
import {
  checkChatRateLimit,
  createChatRateLimitedResponse,
  createChatRateLimitUnavailableResponse
} from '@/features/chat/server/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  if (isNetlifyRuntime()) {
    return new Response(null, {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }

  const rateLimitStatus = await checkChatRateLimit(request);
  if (rateLimitStatus === 'limited') {
    return createChatRateLimitedResponse();
  }
  if (rateLimitStatus === 'unavailable') {
    return createChatRateLimitUnavailableResponse();
  }

  return handleChatRequest(request);
}
