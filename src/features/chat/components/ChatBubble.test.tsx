import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup, screen } from '@testing-library/react';
import { ChatBubble } from './ChatBubble';

afterEach(cleanup);

window.HTMLElement.prototype.scrollIntoView = vi.fn();

vi.mock('../hooks/useOnlineChat', () => ({
  useOnlineChat: () => ({
    messages: [
      {
        role: 'assistant',
        content: "Hi! I'm John's AI assistant."
      }
    ],
    error: null,
    send: vi.fn(),
    retry: vi.fn(),
    reset: vi.fn(),
    isStreaming: false,
    retryBlocked: false
  })
}));

describe('ChatBubble', () => {
  it('renders the floating button', () => {
    const { getByRole } = render(<ChatBubble />);
    expect(getByRole('button', { name: /open ai chat/i })).toBeTruthy();
  });

  it('mounts ChatWindow when button is clicked', () => {
    const { getByRole, getByText } = render(<ChatBubble />);
    const launcher = getByRole('button', { name: /open ai chat/i });
    expect(launcher).toHaveAttribute('aria-expanded', 'false');
    expect(launcher).toHaveAttribute('aria-controls', 'portfolio-chat-window');

    fireEvent.click(launcher);

    expect(getByText("John's AI Assistant")).toBeTruthy();
    expect(getByRole('dialog', { name: "John's AI Assistant" })).toHaveAttribute(
      'id',
      'portfolio-chat-window'
    );
    expect(getByRole('button', { name: /close ai chat/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByPlaceholderText(/ask a question/i)).toHaveFocus();
  });

  it('unmounts ChatWindow when close button is triggered', () => {
    const { getByRole, getByLabelText, queryByTestId } = render(<ChatBubble />);
    fireEvent.click(getByRole('button', { name: /open ai chat/i }));
    fireEvent.click(getByLabelText('Close chat'));
    expect(queryByTestId('chat-window-wrapper')).toBeNull();
    expect(getByRole('button', { name: /open ai chat/i })).toHaveFocus();
  });

  it('unmounts ChatWindow from the floating toggle while open', () => {
    const { getByRole, queryByTestId } = render(<ChatBubble />);
    fireEvent.click(getByRole('button', { name: /open ai chat/i }));
    fireEvent.click(getByRole('button', { name: /close ai chat/i }));
    expect(queryByTestId('chat-window-wrapper')).toBeNull();
  });
});
