import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
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
  vi.stubGlobal('requestAnimationFrame', undefined);
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

  it('coalesces burst scroll events into one animation frame', () => {
    let frameCallback: FrameRequestCallback | undefined;
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      frameCallback = callback;
      return 1;
    });
    vi.stubGlobal('requestAnimationFrame', requestFrame);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    render(<NavigationBar items={ITEMS} />);
    const navigation = screen.getByRole('navigation', {
      name: 'main navigation'
    });
    window.scrollY = 100;

    fireEvent.scroll(window);
    fireEvent.scroll(window);
    fireEvent.scroll(window);

    expect(requestFrame).toHaveBeenCalledTimes(1);

    act(() => {
      frameCallback?.(0);
    });

    expect(navigation).toHaveAttribute('inert');
  });

  it('recomputes hero styling when the viewport height changes', () => {
    vi.stubGlobal('innerHeight', 800);
    window.scrollY = 500;

    render(<NavigationBar items={ITEMS} />);
    const navigation = screen.getByRole('navigation', {
      name: 'main navigation'
    });
    const pill = navigation.querySelector('ul');

    expect(pill).toHaveClass('border-foreground/15');

    vi.stubGlobal('innerHeight', 1_200);
    fireEvent(window, new Event('resize'));

    expect(pill).toHaveClass('border-surface');
  });
});
