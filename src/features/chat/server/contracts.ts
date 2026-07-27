export type ChatRole = 'user' | 'assistant';
export const MAX_STREAM_FRAME_CHARACTERS = 128 * 1024;
export const MAX_STREAM_FRAME_COUNT = 512;
export const MAX_STREAM_RESPONSE_CHARACTERS = 64 * 1024;

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
}

export type ChatErrorCode =
  | 'VALIDATION_ERROR'
  | 'PAYLOAD_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT';

export interface ChatErrorBody {
  error: {
    code: ChatErrorCode;
    message: string;
  };
}

export type ChatStreamFrame =
  | { type: 'text-delta'; delta: string }
  | { type: 'finish'; finishReason: string }
  | { type: 'error'; code: 'STREAM_ERROR'; message: string };

export interface ChatCompletionMetadata {
  finishReason: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface HostedChatStream {
  iterator: AsyncIterator<string>;
  getCompletion: () => Promise<ChatCompletionMetadata>;
}

export interface StartHostedChatInput {
  messages: ChatMessage[];
  signal: AbortSignal;
  systemPrompt: string;
}

export type StartHostedChat = (
  input: StartHostedChatInput
) => Promise<HostedChatStream> | HostedChatStream;
