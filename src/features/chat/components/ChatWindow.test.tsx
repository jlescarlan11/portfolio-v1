import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { ChatWindow } from './ChatWindow';

afterEach(cleanup);

vi.mock('../hooks/useWebLLM', () => ({
  useWebLLM: vi.fn(),
  MODEL_ID: 'test-model'
}));

import { useWebLLM } from '../hooks/useWebLLM';
const mockUseWebLLM = vi.mocked(useWebLLM);

describe('ChatWindow', () => {
  it('shows progress bar when status is loading', () => {
    mockUseWebLLM.mockReturnValue({
      status: 'loading',
      progress: 45,
      progressText: 'Loading model...',
      messages: [],
      send: vi.fn(),
      initialize: vi.fn(),
      isStreaming: false
    });
    const { getByRole } = render(<ChatWindow onClose={vi.fn()} />);
    expect(getByRole('progressbar')).toBeTruthy();
  });

  it('shows unsupported message when status is unsupported', () => {
    mockUseWebLLM.mockReturnValue({
      status: 'unsupported',
      progress: 0,
      progressText: '',
      messages: [],
      send: vi.fn(),
      initialize: vi.fn(),
      isStreaming: false
    });
    const { getByText } = render(<ChatWindow onClose={vi.fn()} />);
    expect(getByText(/WebGPU/i)).toBeTruthy();
  });

  it('shows message input when status is ready', () => {
    mockUseWebLLM.mockReturnValue({
      status: 'ready',
      progress: 100,
      progressText: '',
      messages: [],
      send: vi.fn(),
      initialize: vi.fn(),
      isStreaming: false
    });
    const { getByPlaceholderText } = render(<ChatWindow onClose={vi.fn()} />);
    expect(getByPlaceholderText(/ask a question/i)).toBeTruthy();
  });
});
