export const HOSTED_CHAT_REASONING = 'minimal' as const;
export { MAX_REQUEST_BYTES } from './contracts';
export const MAX_MESSAGE_COUNT = 12;
export const MAX_USER_CHARACTERS = 2_000;
export const MAX_CONTEXT_TOKENS = 8_000;
export const MAX_OUTPUT_TOKENS = 256;
export const MAX_PROVIDER_CHUNK_COUNT = 512;
export const MAX_STREAM_OUTPUT_BYTES = 16 * 1024;
export const REQUEST_BODY_TIMEOUT_MS = 5_000;
export const COMPLETION_TIMEOUT_MS = 5_000;
export const PROVIDER_TIMEOUT_MS = 24_000;
export const RATE_LIMIT_WINDOW_SECONDS = 60;
export const RATE_LIMIT_REQUESTS = 20;

export class ChatConfigurationError extends Error {
  constructor() {
    super('Hosted chat configuration is unavailable.');
    this.name = 'ChatConfigurationError';
  }
}

export function isNetlifyRuntime(
  environment: NodeJS.ProcessEnv = process.env
): boolean {
  return Boolean(environment.SITE_ID?.trim()) ||
    environment.NETLIFY?.trim().toLowerCase() === 'true';
}
