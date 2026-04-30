import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import { FadeIn } from './FadeIn';

const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let intersectionCallback: ((entries: Partial<IntersectionObserverEntry>[]) => void) | null = null;

beforeEach(() => {
  mockObserve.mockClear();
  mockDisconnect.mockClear();
  intersectionCallback = null;

  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn().mockImplementation((callback) => {
      intersectionCallback = callback;
      return { observe: mockObserve, disconnect: mockDisconnect, unobserve: vi.fn() };
    })
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('FadeIn', () => {
  it('renders children without animate-enter class before intersection', () => {
    const { getByText } = render(<FadeIn><span>hello</span></FadeIn>);
    const wrapper = getByText('hello').parentElement!;
    expect(wrapper.className).not.toContain('animate-enter');
  });

  it('adds animate-enter class after IntersectionObserver fires isIntersecting=true', () => {
    const { getByText } = render(<FadeIn><span>hello</span></FadeIn>);
    const wrapper = getByText('hello').parentElement!;

    act(() => {
      intersectionCallback?.([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(wrapper.className).toContain('animate-enter');
  });

  it('disconnects the observer after becoming visible', () => {
    render(<FadeIn><span>hello</span></FadeIn>);

    act(() => {
      intersectionCallback?.([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('passes the delay as --enter-delay CSS variable when visible', () => {
    const { getByText } = render(<FadeIn delay={200}><span>hello</span></FadeIn>);
    const wrapper = getByText('hello').parentElement!;

    act(() => {
      intersectionCallback?.([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect((wrapper as HTMLElement).style.getPropertyValue('--enter-delay')).toBe('200ms');
  });

  it('renders as a custom element when as prop is provided', () => {
    const { container } = render(<FadeIn as="section"><span>hello</span></FadeIn>);
    expect(container.querySelector('section')).not.toBeNull();
  });
});
