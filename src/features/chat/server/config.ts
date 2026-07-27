export const HOSTED_CHAT_MODEL = 'gpt-5-nano';
export const MAX_REQUEST_BYTES = 16 * 1024;
export const MAX_MESSAGE_COUNT = 12;
export const MAX_USER_CHARACTERS = 2_000;
export const MAX_CONTEXT_TOKENS = 8_000;
export const MAX_OUTPUT_TOKENS = 256;
export const PROVIDER_TIMEOUT_MS = 25_000;
export const RATE_LIMIT_WINDOW_SECONDS = 60;
export const RATE_LIMIT_REQUESTS = 20;

export interface HostedChatConfiguration {
  apiKey: string;
  baseUrl: string;
}

export class ChatConfigurationError extends Error {
  constructor() {
    super('Hosted chat configuration is unavailable.');
    this.name = 'ChatConfigurationError';
  }
}

export function getHostedChatConfiguration(
  environment: NodeJS.ProcessEnv = process.env
): HostedChatConfiguration {
  const apiKey = environment.OPENAI_API_KEY?.trim();
  const baseUrl = environment.OPENAI_BASE_URL?.trim();

  if (!apiKey || !baseUrl) {
    throw new ChatConfigurationError();
  }

  return { apiKey, baseUrl };
}
