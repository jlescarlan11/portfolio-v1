import { createChatRateLimitedResponse } from '@/features/chat/server/rate-limit';

export async function POST(): Promise<Response> {
  return createChatRateLimitedResponse();
}
