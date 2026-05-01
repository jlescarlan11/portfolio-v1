import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { ChatBubble } from './ChatBubble';

afterEach(cleanup);

vi.mock('../hooks/useWebLLM', () => ({
  useWebLLM: () => ({
    status: 'unsupported',
    progress: 0,
    progressText: '',
    messages: [],
    send: vi.fn(),
    initialize: vi.fn(),
    isStreaming: false
  })
}));

describe('ChatBubble', () => {
  it('renders the floating button', () => {
    const { getByRole } = render(<ChatBubble />);
    expect(getByRole('button', { name: /open ai chat/i })).toBeTruthy();
  });

  it('mounts ChatWindow when button is clicked', () => {
    const { getByRole, getByText } = render(<ChatBubble />);
    fireEvent.click(getByRole('button', { name: /open ai chat/i }));
    expect(getByText("John's AI Assistant")).toBeTruthy();
  });

  it('hides ChatWindow when close button is triggered', () => {
    const { getByRole, getByLabelText, getByTestId } = render(<ChatBubble />);
    fireEvent.click(getByRole('button', { name: /open ai chat/i }));
    fireEvent.click(getByLabelText('Close chat'));
    expect(getByTestId('chat-window-wrapper').className).toContain('hidden');
  });
});
