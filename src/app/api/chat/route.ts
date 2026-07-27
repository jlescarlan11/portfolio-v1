import { handleChatRequest } from '@/features/chat/server/handler';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  if (process.env.SITE_ID?.trim()) {
    return new Response(null, {
      status: 404,
      headers: { 'Cache-Control': 'no-store' }
    });
  }
  return handleChatRequest(request);
}
