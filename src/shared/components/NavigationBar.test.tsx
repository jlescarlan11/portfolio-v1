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

function rectangle(top: number): DOMRect {
  return {
    bottom: top + 600,
    height: 600,
    left: 0,
    right: 100,
    top,
    width: 100,
    x: 0,
    y: top,
    toJSON: () => ({})
  } as DOMRect;
}

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
  document
    .querySelectorAll('[data-navigation-section-test]')
    .forEach((element) => element.remove());
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

  it('exposes the current section and updates it as the page scrolls', () => {
    const workSection = document.createElement('section');
    workSection.id = 'work';
    workSection.dataset.navigationSectionTest = '';
    workSection.getBoundingClientRect = vi.fn(() => rectangle(0));
    const aboutSection = document.createElement('section');
    aboutSection.id = 'about';
    aboutSection.dataset.navigationSectionTest = '';
    let aboutTop = window.innerHeight;
    aboutSection.getBoundingClientRect = vi.fn(() => rectangle(aboutTop));
    document.body.append(workSection, aboutSection);

    render(<NavigationBar items={ITEMS} />);
    const workLink = screen.getByRole('link', { name: 'Work' });
    const aboutLink = screen.getByRole('link', { name: 'About' });

    expect(workLink).toHaveAttribute('aria-current', 'location');
    expect(aboutLink).not.toHaveAttribute('aria-current');

    aboutTop = 0;
    fireEvent.scroll(window);
    expect(workLink).not.toHaveAttribute('aria-current');
    expect(aboutLink).toHaveAttribute('aria-current', 'location');
  });
});
