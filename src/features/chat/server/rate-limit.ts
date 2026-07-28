import { checkRateLimit } from '@vercel/firewall';
import {
  RATE_LIMIT_WINDOW_SECONDS
} from './config';
import type { ChatErrorBody } from './contracts';
import {
  consoleTelemetryWriter,
  emitTelemetrySafely,
  type TelemetryWriter
} from './telemetry';

export const CHAT_RATE_LIMIT_ID = 'portfolio-chat';

export type ChatRateLimitStatus = 'allowed' | 'limited' | 'unavailable';

export type FirewallRateLimitCheck = (
  rateLimitId: string,
  options: { request: Request }
) => Promise<{
  rateLimited: boolean;
  error?: 'not-found' | 'blocked';
}>;

const NO_STORE_RESPONSE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
} as const;

export async function checkChatRateLimit(
  request: Request,
  check: FirewallRateLimitCheck = checkRateLimit
): Promise<ChatRateLimitStatus> {
  try {
    const result = await check(CHAT_RATE_LIMIT_ID, { request });
    if (result.rateLimited) return 'limited';
    return result.error ? 'unavailable' : 'allowed';
  } catch {
    return 'unavailable';
  }
}

export function createChatRateLimitedResponse(
  writeTelemetry: TelemetryWriter = consoleTelemetryWriter
): Response {
  emitTelemetrySafely(writeTelemetry, {
    requestId: crypto.randomUUID(),
    status: 'application_rate_limited',
    durationMs: 0,
    errorCategory: 'application_rate_limit'
  });

  const body: ChatErrorBody = {
    error: {
      code: 'RATE_LIMITED',
      message: 'You have sent too many messages. Please try again in a minute.'
    }
  };
  return Response.json(body, {
    status: 429,
    headers: {
      ...NO_STORE_RESPONSE_HEADERS,
      'Retry-After': String(RATE_LIMIT_WINDOW_SECONDS)
    }
  });
}

export function createChatRateLimitUnavailableResponse(
  writeTelemetry: TelemetryWriter = consoleTelemetryWriter
): Response {
  emitTelemetrySafely(writeTelemetry, {
    requestId: crypto.randomUUID(),
    status: 'failed',
    durationMs: 0,
    errorCategory: 'application_rate_limit'
  });

  const body: ChatErrorBody = {
    error: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'The chat service is temporarily unavailable. Please try again.'
    }
  };
  return Response.json(body, {
    status: 503,
    headers: NO_STORE_RESPONSE_HEADERS
  });
}
