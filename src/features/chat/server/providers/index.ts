import { ChatConfigurationError } from '../config';
import { groqHostedChatProvider } from './groq';
import type { HostedChatProvider } from './types';

export const DEFAULT_HOSTED_CHAT_PROVIDER = 'groq';

const HOSTED_CHAT_PROVIDERS = {
  groq: groqHostedChatProvider
} satisfies Record<string, HostedChatProvider>;

function getConfiguredProviderId(environment: NodeJS.ProcessEnv): string {
  return environment.HOSTED_CHAT_PROVIDER?.trim().toLowerCase() ||
    DEFAULT_HOSTED_CHAT_PROVIDER;
}

export function resolveHostedChatProvider(
  environment: NodeJS.ProcessEnv = process.env
): HostedChatProvider {
  const providerId = getConfiguredProviderId(environment);
  const provider = HOSTED_CHAT_PROVIDERS[
    providerId as keyof typeof HOSTED_CHAT_PROVIDERS
  ];

  if (!provider) {
    throw new ChatConfigurationError();
  }

  return provider;
}

export function getHostedChatTelemetryModel(
  environment: NodeJS.ProcessEnv = process.env
): string {
  const providerId = getConfiguredProviderId(environment);
  return HOSTED_CHAT_PROVIDERS[
    providerId as keyof typeof HOSTED_CHAT_PROVIDERS
  ]?.telemetryModel ?? 'unconfigured';
}

export type { HostedChatProvider } from './types';
