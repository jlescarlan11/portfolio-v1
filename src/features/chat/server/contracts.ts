export type ChatRole = 'user' | 'assistant';

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
}

export type StartHostedChat = (
  input: StartHostedChatInput
) => Promise<HostedChatStream> | HostedChatStream;
