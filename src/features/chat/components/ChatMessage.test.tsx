import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { ChatMessage } from './ChatMessage';

afterEach(cleanup);

describe('ChatMessage', () => {
  it('renders message content', () => {
    const { getByText } = render(<ChatMessage role="user" content="Hello" />);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('right-aligns user messages', () => {
    const { container } = render(<ChatMessage role="user" content="Hello" />);
    expect(container.firstElementChild?.className).toContain('flex-row-reverse');
  });

  it('left-aligns assistant messages', () => {
    const { container } = render(<ChatMessage role="assistant" content="Hi" />);
    expect(container.firstElementChild?.className).toContain('flex-row');
  });

  it('keeps assistant identity and progress labels readable', () => {
    const { getByText } = render(
      <ChatMessage role="assistant" content="" isThinking />
    );

    expect(getByText('AI')).toHaveClass('text-subtle-foreground');
    expect(getByText('thinking')).toHaveClass('text-subtle-foreground');
  });

  it('does not render model-provided remote images', () => {
    const { getByText, queryByRole } = render(
      <ChatMessage
        role="assistant"
        content="![Untrusted image](https://third-party.invalid/pixel.png)"
      />
    );

    expect(queryByRole('img', { name: 'Untrusted image' })).not.toBeInTheDocument();
    expect(getByText('Untrusted image')).toBeInTheDocument();
  });
});
