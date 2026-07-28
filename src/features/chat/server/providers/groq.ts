import { createGroq } from '@ai-sdk/groq';
import { ChatConfigurationError } from '../config';
import type { HostedChatProvider } from './types';

export const GROQ_HOSTED_CHAT_MODEL_ID = 'openai/gpt-oss-20b';

export const groqHostedChatProvider: HostedChatProvider = {
  id: 'groq',
  modelId: GROQ_HOSTED_CHAT_MODEL_ID,
  telemetryModel: `groq/${GROQ_HOSTED_CHAT_MODEL_ID}`,
  createModel(environment: NodeJS.ProcessEnv = process.env) {
    const apiKey = environment.GROQ_API_KEY?.trim();
    if (!apiKey) {
      throw new ChatConfigurationError();
    }

    return createGroq({ apiKey })(GROQ_HOSTED_CHAT_MODEL_ID);
  }
};
