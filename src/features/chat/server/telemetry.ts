import { getHostedChatTelemetryModel } from './providers';

export type ChatTelemetryStatus =
  | 'success'
  | 'failed'
  | 'rejected'
  | 'cancelled'
  | 'output_limit'
  | 'provider_quota'
  | 'application_rate_limited';

export interface ChatTelemetryEvent {
  event: 'portfolio_chat_request';
  requestId: string;
  status: ChatTelemetryStatus;
  model: string;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
  finishReason?: string;
  errorCategory?: string;
}

export type TelemetryWriter = (event: ChatTelemetryEvent) => void;

export const consoleTelemetryWriter: TelemetryWriter = (
  event: ChatTelemetryEvent
): void => {
  console.info(JSON.stringify(event));
};

export function emitTelemetrySafely(
  writer: TelemetryWriter,
  event: Omit<ChatTelemetryEvent, 'event' | 'model'>
): void {
  try {
    writer({
      event: 'portfolio_chat_request',
      model: getHostedChatTelemetryModel(),
      ...event
    });
  } catch {
    // Observability must never alter the response path.
  }
}
