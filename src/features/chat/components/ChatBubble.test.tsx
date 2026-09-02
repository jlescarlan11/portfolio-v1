import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  render,
  fireEvent,
  cleanup,
  screen,
  waitFor
} from '@testing-library/react';
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

  it('gives compact chat controls at least a 24px pointer target', () => {
    const { getByRole } = render(<ChatBubble />);

    expect(getByRole('button', { name: 'Dismiss' })).toHaveClass('size-6');
    expect(getByRole('button', { name: /open ai chat/i })).toHaveClass(
      'h-11',
      'w-11'
    );
  });

  it('defers the promotional label below the desktop breakpoint and supports dismissal', () => {
    const { getByText, getByRole, queryByText } = render(<ChatBubble />);
    const label = getByText(/ask about john's work/i).parentElement;

    expect(label).toHaveClass('hidden', 'lg:flex');
    fireEvent.click(getByRole('button', { name: 'Dismiss' }));
    expect(queryByText(/ask about john's work/i)).not.toBeInTheDocument();
    expect(getByRole('button', { name: /open ai chat/i })).toBeVisible();
  });

  it('mounts ChatWindow when button is clicked', async () => {
    const { getByRole } = render(<ChatBubble />);
    const launcher = getByRole('button', { name: /open ai chat/i });
    expect(launcher).toHaveAttribute('aria-expanded', 'false');
    expect(launcher).toHaveAttribute('aria-controls', 'portfolio-chat-window');

    fireEvent.click(launcher);

    expect(await screen.findByText("John's AI Assistant")).toBeTruthy();
    expect(getByRole('dialog', { name: "John's AI Assistant" })).toHaveAttribute(
      'id',
      'portfolio-chat-window'
    );
    expect(getByRole('dialog', { name: "John's AI Assistant" })).toHaveAttribute(
      'aria-modal',
      'true'
    );
    expect(getByRole('button', { name: 'Close chat' })).toBeVisible();
    expect(screen.queryByRole('button', { name: /open ai chat/i })).toBeNull();
    expect(screen.getByPlaceholderText(/ask about a project/i)).toHaveFocus();
  });

  it('unmounts ChatWindow when close button is triggered', async () => {
    const { getByRole, queryByTestId } = render(<ChatBubble />);
    fireEvent.click(getByRole('button', { name: /open ai chat/i }));
    fireEvent.click(await screen.findByLabelText('Close chat'));
    expect(queryByTestId('chat-window-wrapper')).toBeNull();
    await waitFor(() => {
      expect(getByRole('button', { name: /open ai chat/i })).toHaveFocus();
    });
  });

  it('makes body-level background content inert while the modal is open', async () => {
    const background = document.createElement('main');
    background.setAttribute('aria-hidden', 'false');
    document.body.append(background);
    const { getByRole } = render(
      <>
        <a href="#main">Skip to main content</a>
        <ChatBubble />
      </>
    );
    const skipLink = getByRole('link', { name: 'Skip to main content' });

    fireEvent.click(getByRole('button', { name: /open ai chat/i }));
    await screen.findByRole('dialog', { name: "John's AI Assistant" });

    expect(background).toHaveAttribute('inert');
    expect(background).toHaveAttribute('aria-hidden', 'true');
    expect(skipLink).toHaveAttribute('inert');
    expect(skipLink).toHaveAttribute('aria-hidden', 'true');

    fireEvent.click(getByRole('button', { name: 'Close chat' }));
    expect(background).not.toHaveAttribute('inert');
    expect(background).toHaveAttribute('aria-hidden', 'false');
    expect(skipLink).not.toHaveAttribute('inert');
    expect(skipLink).not.toHaveAttribute('aria-hidden');
    background.remove();
  });
});
