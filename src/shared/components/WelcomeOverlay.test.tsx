import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  InitialLoadProvider,
  useInitialLoad
} from '@/shared/loading';
import { INITIAL_LOAD_TIMEOUT_MS } from '@/shared/loading/initial-load-state';
import WelcomeOverlay from './WelcomeOverlay';

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

function mockMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
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

function setDocumentFonts(ready: Promise<FontFaceSet>): void {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready }
  });
}

function HeroSettler(): React.JSX.Element {
  const { settleMilestone } = useInitialLoad();
  return (
    <button onClick={() => settleMilestone('hero-image')}>
      Settle hero
    </button>
  );
}

function renderOverlay(): ReturnType<typeof render> {
  return render(
    <InitialLoadProvider>
      <WelcomeOverlay />
      <HeroSettler />
    </InitialLoadProvider>
  );
}

describe('WelcomeOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
    Reflect.deleteProperty(document, 'fonts');
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows a truthful milestone percentage without dialog semantics', () => {
    const fonts = createDeferred<FontFaceSet>();
    setDocumentFonts(fonts.promise);
    renderOverlay();

    const progress = screen.getByRole('progressbar', {
      name: 'Portfolio startup progress'
    });
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).toHaveAttribute('aria-valuenow', '33');
    expect(progress).toHaveAttribute(
      'aria-valuetext',
      '33% complete'
    );
    expect(screen.getByText('33%')).toBeInTheDocument();
    expect(screen.queryByText(/\d+\s*\/\s*\d+/)).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Preparing portfolio');

    act(() => {
      vi.advanceTimersByTime(INITIAL_LOAD_TIMEOUT_MS - 1);
    });

    expect(progress).toHaveAttribute('aria-valuenow', '33');
    expect(screen.getByTestId('initial-load-overlay')).toBeInTheDocument();
  });

  it('cannot be dismissed by click or Escape while readiness is pending', () => {
    const fonts = createDeferred<FontFaceSet>();
    setDocumentFonts(fonts.promise);
    renderOverlay();

    const overlay = screen.getByTestId('initial-load-overlay');
    fireEvent.click(overlay);
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(overlay).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33');
  });

  it('exits promptly after all real milestones settle and restores overflow', async () => {
    const fonts = createDeferred<FontFaceSet>();
    setDocumentFonts(fonts.promise);
    document.body.style.overflow = 'clip';
    renderOverlay();

    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Settle hero' }));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '67');

    await act(async () => {
      fonts.resolve({} as FontFaceSet);
      await fonts.promise;
    });

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByTestId('initial-load-overlay')).toHaveClass('opacity-0');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByTestId('initial-load-overlay')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('clip');
  });

  it('fails open immediately when the coordinator times out', () => {
    const fonts = createDeferred<FontFaceSet>();
    setDocumentFonts(fonts.promise);
    renderOverlay();

    act(() => {
      vi.advanceTimersByTime(INITIAL_LOAD_TIMEOUT_MS);
    });

    expect(screen.queryByTestId('initial-load-overlay')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });

  it('still waits for readiness under reduced motion and then exits without animation', async () => {
    const fonts = createDeferred<FontFaceSet>();
    setDocumentFonts(fonts.promise);
    mockMatchMedia(true);
    renderOverlay();

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(screen.getByTestId('initial-load-overlay')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Settle hero' }));
    await act(async () => {
      fonts.resolve({} as FontFaceSet);
      await fonts.promise;
    });

    expect(screen.queryByTestId('initial-load-overlay')).not.toBeInTheDocument();
  });
});
