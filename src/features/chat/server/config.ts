export const HOSTED_CHAT_MODEL = 'gpt-5-nano';
export const HOSTED_CHAT_REASONING = 'minimal' as const;
export const HOSTED_CHAT_VERBOSITY = 'low' as const;
export const MAX_REQUEST_BYTES = 16 * 1024;
export const MAX_MESSAGE_COUNT = 12;
export const MAX_USER_CHARACTERS = 2_000;
export const MAX_CONTEXT_TOKENS = 8_000;
export const MAX_OUTPUT_TOKENS = 256;
export const PROVIDER_TIMEOUT_MS = 25_000;
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

function normalizeOpenAiCompatibleBaseUrl(baseUrl: string): string {
  const normalized = baseUrl.replace(/\/+$/, '');
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

  const isNetlifyRuntime = Boolean(environment.SITE_ID?.trim());
  if (isNetlifyRuntime || netlifyApiKey || netlifyBaseUrl) {
    throw new ChatConfigurationError();
  }

  const openAiApiKey = environment.OPENAI_API_KEY?.trim();
  const openAiBaseUrl = environment.OPENAI_BASE_URL?.trim();
  if (openAiApiKey) {
    return {
      apiKey: openAiApiKey,
      baseUrl: openAiBaseUrl || DEFAULT_OPENAI_BASE_URL
    };
  }

  throw new ChatConfigurationError();
}
