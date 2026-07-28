import type { LanguageModel } from 'ai';

export interface HostedChatProvider {
  readonly id: string;
  readonly modelId: string;
  readonly telemetryModel: string;
  createModel: (environment?: NodeJS.ProcessEnv) => LanguageModel;
}
