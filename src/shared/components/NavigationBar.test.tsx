import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NavigationBar from './NavigationBar';

vi.mock('./ThemeToggle', () => ({
  ThemeToggle: () => <button type="button">Theme</button>
}));

const ITEMS = [
  { name: 'Work', href: '/#work' },
  { name: 'About', href: '/#about' }
];

beforeEach(() => {
  vi.stubGlobal('React', React);
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value: 0,
    writable: true
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('NavigationBar visibility', () => {
  it('removes hidden navigation controls from sequential interaction', () => {
    render(<NavigationBar items={ITEMS} />);
    const navigation = screen.getByRole('navigation', {
      name: 'main navigation'
    });

    expect(navigation).not.toHaveAttribute('inert');

    window.scrollY = 100;
    fireEvent.scroll(window);
    expect(navigation).toHaveAttribute('inert');

    window.scrollY = 50;
    fireEvent.scroll(window);
    expect(navigation).not.toHaveAttribute('inert');
  });
});
