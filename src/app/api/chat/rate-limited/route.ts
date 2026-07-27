import { RATE_LIMIT_WINDOW_SECONDS } from '@/features/chat/server/config';
import {
  consoleTelemetryWriter,
  emitTelemetrySafely
} from '@/features/chat/server/telemetry';

export async function POST(): Promise<Response> {
  emitTelemetrySafely(consoleTelemetryWriter, {
    requestId: crypto.randomUUID(),
    status: 'application_rate_limited',
    durationMs: 0,
    errorCategory: 'application_rate_limit'
  });

  return Response.json(
    {
      error: {
        code: 'RATE_LIMITED',
        message: 'You have sent too many messages. Please try again in a minute.'
      }
    },
    {
      status: 429,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': String(RATE_LIMIT_WINDOW_SECONDS)
      }
    }
  );
}
