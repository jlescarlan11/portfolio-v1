import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WelcomeOverlay from './WelcomeOverlay';

function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}

describe('WelcomeOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(false);
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => window.setTimeout(() => callback(Date.now()), 16))
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => window.clearTimeout(id)));
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('dismisses when the overlay is clicked', () => {
    render(<WelcomeOverlay />);

    fireEvent.click(screen.getByRole('dialog', { name: 'Welcome' }));

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(screen.queryByRole('dialog', { name: 'Welcome' })).not.toBeInTheDocument();
  });

  it('dismisses on Escape', async () => {
    render(<WelcomeOverlay />);

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      vi.advanceTimersByTime(600);
    });

    expect(screen.queryByRole('dialog', { name: 'Welcome' })).not.toBeInTheDocument();
  });

  it('respects reduced motion and exits immediately', () => {
    mockMatchMedia(true);

    render(<WelcomeOverlay />);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByRole('dialog', { name: 'Welcome' })).not.toBeInTheDocument();
  });

  it('updates progress over time before dismissing', () => {
    render(<WelcomeOverlay />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByRole('dialog', { name: 'Welcome' })).not.toBeInTheDocument();
  });
});
