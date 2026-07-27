import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
});
