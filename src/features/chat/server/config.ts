export const HOSTED_CHAT_MODEL = 'gpt-5-nano';
export const HOSTED_CHAT_REASONING = 'minimal' as const;
export const HOSTED_CHAT_VERBOSITY = 'low' as const;
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
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';

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

export function isNetlifyRuntime(
  environment: NodeJS.ProcessEnv = process.env
): boolean {
  return Boolean(environment.SITE_ID?.trim()) ||
    environment.NETLIFY?.trim().toLowerCase() === 'true';
}

function validateSecureBaseUrl(baseUrl: string): string {
  try {
    const parsed = new URL(baseUrl);
    if (
      parsed.protocol !== 'https:' ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash
    ) {
      throw new ChatConfigurationError();
    }
  } catch (error: unknown) {
    if (error instanceof ChatConfigurationError) throw error;
    throw new ChatConfigurationError();
  }

  return baseUrl.replace(/\/+$/, '');
}

function normalizeOpenAiCompatibleBaseUrl(baseUrl: string): string {
  const normalized = validateSecureBaseUrl(baseUrl);
  return /\/v1$/i.test(normalized) ? normalized : `${normalized}/v1`;
}

export function getHostedChatConfiguration(
  environment: NodeJS.ProcessEnv = process.env
): HostedChatConfiguration {
  const netlifyApiKey = environment.NETLIFY_AI_GATEWAY_KEY?.trim();
  const netlifyBaseUrl = environment.NETLIFY_AI_GATEWAY_BASE_URL?.trim();
  if (netlifyApiKey && netlifyBaseUrl) {
    return {
      apiKey: netlifyApiKey,
      baseUrl: normalizeOpenAiCompatibleBaseUrl(netlifyBaseUrl)
    };
  }

  if (isNetlifyRuntime(environment) || netlifyApiKey || netlifyBaseUrl) {
    throw new ChatConfigurationError();
  }

  const openAiApiKey = environment.OPENAI_API_KEY?.trim();
  const openAiBaseUrl = environment.OPENAI_BASE_URL?.trim();
  if (openAiApiKey) {
    return {
      apiKey: openAiApiKey,
      baseUrl: openAiBaseUrl
        ? validateSecureBaseUrl(openAiBaseUrl)
        : DEFAULT_OPENAI_BASE_URL
    };
  }

  throw new ChatConfigurationError();
}
