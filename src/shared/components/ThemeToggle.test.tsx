import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  afterEach(() => {
    cleanup();
    localStorage.removeItem('theme');
    document.documentElement.removeAttribute('data-theme');
    vi.unstubAllGlobals();
  });

  it('falls back to light mode when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined);

    render(<ThemeToggle />);

    const toggle = screen.getByRole('button', {
      name: 'Switch to dark mode'
    });
    expect(toggle).toHaveClass('opacity-100');

    fireEvent.click(toggle);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('follows system theme changes until the user chooses a theme', () => {
    let onChange: ((event: MediaQueryListEvent) => void) | undefined;
    const mediaQuery = {
      matches: false,
      addEventListener: vi.fn(
        (_type: 'change', listener: (event: MediaQueryListEvent) => void) => {
          onChange = listener;
        }
      ),
      removeEventListener: vi.fn()
    };
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));

    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();

    act(() => {
      onChange?.({ matches: true } as MediaQueryListEvent);
    });

    const toggle = screen.getByRole('button', { name: 'Switch to light mode' });
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('theme')).toBeNull();

    fireEvent.click(toggle);
    expect(localStorage.getItem('theme')).toBe('light');

    act(() => {
      onChange?.({ matches: true } as MediaQueryListEvent);
    });

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  });
});
