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
});
