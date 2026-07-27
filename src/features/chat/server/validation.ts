import {
  MAX_MESSAGE_COUNT,
  MAX_REQUEST_BYTES,
  MAX_USER_CHARACTERS
} from './config';
import type { ChatErrorCode, ChatMessage, ChatRequestBody } from './contracts';

interface ValidationFailure {
  ok: false;
  status: 400 | 413;
  code: ChatErrorCode;
  message: string;
}

interface ValidationSuccess {
  ok: true;
  value: ChatRequestBody;
}

export type ValidationResult = ValidationFailure | ValidationSuccess;

const VALIDATION_MESSAGE = 'Check your conversation and try again.';
const SHORTEN_MESSAGE = 'Please shorten your message and try again.';

function failure(
  status: 400 | 413,
  code: 'VALIDATION_ERROR' | 'PAYLOAD_TOO_LARGE',
  message: string
): ValidationFailure {
  return { ok: false, status, code, message };
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, expected: string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === expected.length && expected.every(key => actual.includes(key));
}

function validateMessage(value: unknown): ChatMessage | null {
  if (!isPlainRecord(value) || !hasOnlyKeys(value, ['role', 'content'])) {
    return null;
  }

  if (value.role !== 'user' && value.role !== 'assistant') {
    return null;
  }

  if (typeof value.content !== 'string') {
    return null;
  }

  const content = value.content.trim();
  if (!content) {
    return null;
  }

  return { role: value.role, content };
}

export function getUtf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function validateChatRequestText(text: string): ValidationResult {
  if (getUtf8ByteLength(text) > MAX_REQUEST_BYTES) {
    return failure(413, 'PAYLOAD_TOO_LARGE', SHORTEN_MESSAGE);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return failure(400, 'VALIDATION_ERROR', VALIDATION_MESSAGE);
  }

  if (!isPlainRecord(parsed) || !hasOnlyKeys(parsed, ['messages'])) {
    return failure(400, 'VALIDATION_ERROR', VALIDATION_MESSAGE);
  }

  if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) {
    return failure(400, 'VALIDATION_ERROR', VALIDATION_MESSAGE);
  }

  if (parsed.messages.length > MAX_MESSAGE_COUNT) {
    return failure(413, 'PAYLOAD_TOO_LARGE', SHORTEN_MESSAGE);
  }

  const messages: ChatMessage[] = [];
  for (const candidate of parsed.messages) {
    const message = validateMessage(candidate);
    if (!message) {
      return failure(400, 'VALIDATION_ERROR', VALIDATION_MESSAGE);
    }
    messages.push(message);
  }

  if (messages[0].role !== 'user' || messages[messages.length - 1].role !== 'user') {
    return failure(400, 'VALIDATION_ERROR', VALIDATION_MESSAGE);
  }

  for (let index = 1; index < messages.length; index += 1) {
    if (messages[index].role === messages[index - 1].role) {
      return failure(400, 'VALIDATION_ERROR', VALIDATION_MESSAGE);
    }
  }

  const currentUserMessage = messages[messages.length - 1];
  if (Array.from(currentUserMessage.content).length > MAX_USER_CHARACTERS) {
    return failure(413, 'PAYLOAD_TOO_LARGE', SHORTEN_MESSAGE);
  }

  return { ok: true, value: { messages } };
}
