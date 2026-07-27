import { handleChatRequest } from '@/features/chat/server/handler';
import { isNetlifyRuntime } from '@/features/chat/server/config';

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
  return handleChatRequest(request);
}
