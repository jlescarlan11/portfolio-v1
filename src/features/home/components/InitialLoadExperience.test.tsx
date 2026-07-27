import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  act,
  cleanup,
  render,
  screen
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INITIAL_LOAD_TIMEOUT_MS } from '@/shared/loading';
import InitialLoadExperience from './InitialLoadExperience';

interface InitialLoadWindow extends Window {
  __portfolioInitialPath?: string;
  __portfolioInitialLoadConsumed?: boolean;
}

function mockMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn()
    })
  });
}

describe('InitialLoadExperience', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia();
    Reflect.deleteProperty(document, 'fonts');
    document.documentElement.dataset.initialPath = '/';
    delete document.documentElement.dataset.initialLoadConsumed;
    (window as InitialLoadWindow).__portfolioInitialPath = '/';
    delete (window as InitialLoadWindow).__portfolioInitialLoadConsumed;
  });

  afterEach(() => {
    cleanup();
    document.querySelector('[data-test-global-interactions]')?.remove();
    delete document.documentElement.dataset.initialPath;
    delete document.documentElement.dataset.initialLoadConsumed;
    delete (window as InitialLoadWindow).__portfolioInitialPath;
    delete (window as InitialLoadWindow).__portfolioInitialLoadConsumed;
    document.body.style.overflow = '';
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('blocks landing and global controls only after enhancement, then fails open', () => {
    const globalInteractions = document.createElement('div');
    globalInteractions.dataset.initialLoadGlobal = '';
    globalInteractions.dataset.testGlobalInteractions = '';
    globalInteractions.innerHTML = '<button>Global action</button>';
    document.body.append(globalInteractions);

    const view = render(
      <InitialLoadExperience>
        <button>Landing action</button>
      </InitialLoadExperience>
    );

    const content = view.container.querySelector<HTMLElement>(
      '[data-initial-load-content]'
    );
    expect(screen.getByTestId('initial-load-overlay')).toBeInTheDocument();
    expect(content).toHaveAttribute('inert');
    expect(content).toHaveAttribute('aria-hidden', 'true');
    expect(globalInteractions).toHaveAttribute('inert');
    expect(globalInteractions).toHaveAttribute('aria-hidden', 'true');

    act(() => {
      vi.advanceTimersByTime(INITIAL_LOAD_TIMEOUT_MS);
    });

    expect(screen.queryByTestId('initial-load-overlay')).not.toBeInTheDocument();
    expect(content).not.toHaveAttribute('inert');
    expect(content).not.toHaveAttribute('aria-hidden');
    expect(globalInteractions).not.toHaveAttribute('inert');
    expect(globalInteractions).not.toHaveAttribute('aria-hidden');
  });

  it('does not replay after the landing load is consumed', () => {
    const first = render(
      <InitialLoadExperience>
        <p>Landing content</p>
      </InitialLoadExperience>
    );
    expect(screen.getByTestId('initial-load-overlay')).toBeInTheDocument();
    expect(document.documentElement.dataset.initialLoadConsumed).toBe('true');
    first.unmount();
    delete document.documentElement.dataset.initialLoadConsumed;

    render(
      <InitialLoadExperience>
        <p>Landing content</p>
      </InitialLoadExperience>
    );
    expect(screen.queryByTestId('initial-load-overlay')).not.toBeInTheDocument();
    expect(screen.getByText('Landing content')).toBeVisible();
  });

  it('does not run when the initial document was a project route', () => {
    document.documentElement.dataset.initialPath = '/projects/rent-n-roll';
    (window as InitialLoadWindow).__portfolioInitialPath =
      '/projects/rent-n-roll';

    render(
      <InitialLoadExperience>
        <p>Client-navigated landing content</p>
      </InitialLoadExperience>
    );

    expect(screen.queryByTestId('initial-load-overlay')).not.toBeInTheDocument();
    expect(screen.getByText('Client-navigated landing content')).toBeVisible();
  });

  it('ships an immediate no-JavaScript reveal rule', () => {
    const markup = renderToStaticMarkup(
      <InitialLoadExperience>
        <p>Landing content</p>
      </InitialLoadExperience>
    );

    expect(markup).toContain(
      '.initial-load-overlay{display:none!important}'
    );
  });
});
