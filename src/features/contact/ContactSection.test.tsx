import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ContactSection from './ContactSection';
import { contactContent } from './content';

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  'clipboard'
);

beforeEach(() => {
  vi.stubGlobal('React', React);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  if (originalClipboard) {
    Object.defineProperty(navigator, 'clipboard', originalClipboard);
  } else {
    Reflect.deleteProperty(navigator, 'clipboard');
  }
});

describe('ContactSection', () => {
  it('copies the visible email through an explicit accessible control', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText }
    });

    render(<ContactSection content={contactContent} />);
    fireEvent.click(
      screen.getByRole('button', {
        name: `Copy email address ${contactContent.email}`
      })
    );

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(contactContent.email);
    });
    expect(screen.getByRole('status')).toHaveTextContent('Email copied.');
  });

  it('announces when clipboard access is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined
    });

    render(<ContactSection content={contactContent} />);
    fireEvent.click(
      screen.getByRole('button', {
        name: `Copy email address ${contactContent.email}`
      })
    );

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Copy failed. Select the email address manually.'
      );
    });
  });
});
