import { handleChatRequest } from '@/features/chat/server/handler';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  return handleChatRequest(request);
}
