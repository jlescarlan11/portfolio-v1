import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import type { ChatClientError } from '../hooks/useOnlineChat';
import type { ChatMessage } from '../server/contracts';
import { ChatWindow } from './ChatWindow';

afterEach(cleanup);

window.HTMLElement.prototype.scrollIntoView = vi.fn();

const hookResult = vi.hoisted(() => ({
  messages: [
    {
      role: 'assistant' as const,
      content: "Hi! I'm John's AI assistant. Ask me anything about his work."
    }
  ] as ChatMessage[],
  isStreaming: false,
  retryBlocked: false,
  error: null as ChatClientError | null,
  send: vi.fn(async () => undefined),
  retry: vi.fn(async () => undefined),
  reset: vi.fn()
}));

vi.mock('../hooks/useOnlineChat', () => ({
  useOnlineChat: () => hookResult
}));

describe('ChatWindow', () => {
  afterEach(() => {
    hookResult.isStreaming = false;
    hookResult.retryBlocked = false;
    hookResult.error = null;
    hookResult.send.mockClear();
    hookResult.retry.mockClear();
    hookResult.reset.mockClear();
  });

  it('opens ready with the welcome message and input on a non-WebGPU browser', () => {
    const {
      container,
      getByRole,
      getByText,
      getByPlaceholderText,
      queryByText
    } = render(<ChatWindow onClose={vi.fn()} />);

    expect(container.querySelector('[aria-live="polite"]')).toHaveAttribute(
      'aria-busy',
      'false'
    );
    expect(getByRole('dialog', { name: "John's AI Assistant" })).toBeTruthy();
    expect(getByText(/Hi! I'm John's AI assistant/)).toBeTruthy();
    expect(getByPlaceholderText(/ask a question/i)).toHaveFocus();
    expect(getByText(/ready/i)).toHaveClass('text-subtle-foreground');
    expect(queryByText(/WebGPU/i)).toBeNull();
    expect(queryByText(/Download.*Start/i)).toBeNull();
  });

  it('opens when scrollIntoView is unavailable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      window.HTMLElement.prototype,
      'scrollIntoView'
    );
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: undefined
    });

    try {
      const { getByRole, getByPlaceholderText } = render(
        <ChatWindow onClose={vi.fn()} />
      );

      expect(
        getByRole('dialog', { name: "John's AI Assistant" })
      ).toBeInTheDocument();
      expect(getByPlaceholderText(/ask a question/i)).toHaveFocus();
    } finally {
      if (descriptor) {
        Object.defineProperty(
          window.HTMLElement.prototype,
          'scrollIntoView',
          descriptor
        );
      } else {
        Reflect.deleteProperty(
          window.HTMLElement.prototype,
          'scrollIntoView'
        );
      }
    }
  });

  it('reserves mobile viewport gutters before applying desktop widths', () => {
    const { getByRole } = render(<ChatWindow onClose={vi.fn()} />);
    const dialog = getByRole('dialog', { name: "John's AI Assistant" });

    expect(dialog).toHaveClass('w-[calc(100vw-3rem)]');
    expect(dialog).toHaveClass('max-w-80');
    expect(dialog).toHaveClass('sm:w-96');
    expect(dialog).toHaveClass('sm:max-w-none');
  });

  it('trims and submits one non-empty message', () => {
    const { getByPlaceholderText, getByRole } = render(
      <ChatWindow onClose={vi.fn()} />
    );
    const input = getByPlaceholderText(/ask a question/i);

    fireEvent.change(input, { target: { value: '  Tell me about John.  ' } });
    fireEvent.click(getByRole('button', { name: /send message/i }));

    expect(hookResult.send).toHaveBeenCalledOnce();
    expect(hookResult.send).toHaveBeenCalledWith('Tell me about John.');
  });

  it('disables submission and displays thinking while a request streams', () => {
    hookResult.isStreaming = true;
    hookResult.messages = [
      hookResult.messages[0],
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: '' }
    ];
    const {
      container,
      getByLabelText,
      getByPlaceholderText,
      getByText
    } = render(
      <ChatWindow onClose={vi.fn()} />
    );

    expect(container.querySelector('[aria-live="polite"]')).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(getByLabelText('Thinking')).toBeTruthy();
    expect(getByText(/answering/i)).toHaveClass('text-subtle-foreground');
    expect(getByPlaceholderText(/ask a question/i)).toHaveProperty('disabled', true);
    expect(getByLabelText(/send message/i)).toHaveProperty('disabled', true);
  });

  it('shows a retry action for recoverable service errors', () => {
    hookResult.error = {
      kind: 'unavailable',
      message: 'The AI service is temporarily unavailable. Please try again.',
      canRetry: true
    };
    const { getByRole } = render(<ChatWindow onClose={vi.fn()} />);

    fireEvent.click(getByRole('button', { name: /retry/i }));
    expect(hookResult.retry).toHaveBeenCalledOnce();
  });

  it('keeps input available without retrying a truncated answer', () => {
    hookResult.error = {
      kind: 'output_limit',
      message: 'The answer was cut off. Please ask a more specific question.',
      canRetry: false
    };
    const { getByPlaceholderText, getByText, queryByRole } = render(
      <ChatWindow onClose={vi.fn()} />
    );

    expect(getByText(/answer was cut off/i)).toBeTruthy();
    expect(queryByRole('button', { name: /retry/i })).toBeNull();
    expect(getByPlaceholderText(/ask a question/i)).not.toHaveProperty(
      'disabled',
      true
    );
  });

  it('resets active chat state before closing', () => {
    const onClose = vi.fn();
    const { getByLabelText } = render(<ChatWindow onClose={onClose} />);

    fireEvent.click(getByLabelText(/close chat/i));
    expect(hookResult.reset).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('resets and closes when Escape is pressed inside the chat', () => {
    const onClose = vi.fn();
    const { getByRole } = render(<ChatWindow onClose={onClose} />);

    fireEvent.keyDown(getByRole('dialog'), { key: 'Escape' });

    expect(hookResult.reset).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
