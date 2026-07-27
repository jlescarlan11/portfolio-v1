import React, { StrictMode } from 'react';
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
} from './InitialLoadProvider';
import { INITIAL_LOAD_TIMEOUT_MS } from './initial-load-state';

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

function setDocumentFonts(ready: Promise<FontFaceSet> | undefined): void {
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: ready ? { ready } : undefined
  });
}

function LoadProbe(): React.JSX.Element {
  const load = useInitialLoad();

  return (
    <div>
      <output data-testid="status">{load.status}</output>
      <output data-testid="completed">{load.completedCount}</output>
      <output data-testid="pending">{load.pendingMilestones.join(',')}</output>
      <output data-testid="progress">{load.progress}</output>
      <button onClick={() => load.settleMilestone('hero-image')}>
        Settle hero
      </button>
    </div>
  );
}

describe('InitialLoadProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    Reflect.deleteProperty(document, 'fonts');
  });

  it('marks hydration, waits for fonts, and does not advance with ordinary time', async () => {
    const fonts = createDeferred<FontFaceSet>();
    setDocumentFonts(fonts.promise);

    render(
      <InitialLoadProvider>
        <LoadProbe />
      </InitialLoadProvider>
    );

    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    expect(screen.getByTestId('completed')).toHaveTextContent('1');
    expect(screen.getByTestId('pending')).toHaveTextContent('fonts,hero-image');
    expect(screen.getByTestId('progress')).toHaveTextContent(String(1 / 3));

    act(() => {
      vi.advanceTimersByTime(INITIAL_LOAD_TIMEOUT_MS - 1);
    });

    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    expect(screen.getByTestId('completed')).toHaveTextContent('1');

    await act(async () => {
      fonts.resolve({} as FontFaceSet);
      await fonts.promise;
    });

    expect(screen.getByTestId('completed')).toHaveTextContent('2');
    expect(screen.getByTestId('pending')).toHaveTextContent('hero-image');
  });

  it('settles fonts when the Font Loading API is unavailable or rejects', async () => {
    setDocumentFonts(undefined);
    const unavailable = render(
      <InitialLoadProvider>
        <LoadProbe />
      </InitialLoadProvider>
    );

    expect(screen.getByTestId('completed')).toHaveTextContent('2');
    expect(screen.getByTestId('pending')).toHaveTextContent('hero-image');
    unavailable.unmount();

    const fonts = createDeferred<FontFaceSet>();
    setDocumentFonts(fonts.promise);
    render(
      <InitialLoadProvider>
        <LoadProbe />
      </InitialLoadProvider>
    );

    await act(async () => {
      fonts.reject(new Error('font load failed'));
      await fonts.promise.catch(() => undefined);
    });

    expect(screen.getByTestId('completed')).toHaveTextContent('2');
    expect(screen.getByTestId('pending')).toHaveTextContent('hero-image');
  });

  it('becomes ready after the remaining hero milestone and clears the timeout', () => {
    setDocumentFonts(undefined);

    render(
      <InitialLoadProvider>
        <LoadProbe />
      </InitialLoadProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Settle hero' }));

    expect(screen.getByTestId('status')).toHaveTextContent('ready');
    expect(screen.getByTestId('completed')).toHaveTextContent('3');
    expect(screen.getByTestId('progress')).toHaveTextContent('1');
    expect(vi.getTimerCount()).toBe(0);

    act(() => {
      vi.advanceTimersByTime(INITIAL_LOAD_TIMEOUT_MS);
    });

    expect(screen.getByTestId('status')).toHaveTextContent('ready');
  });

  it('fails open at ten seconds and remains terminal', () => {
    const fonts = createDeferred<FontFaceSet>();
    setDocumentFonts(fonts.promise);

    render(
      <InitialLoadProvider>
        <LoadProbe />
      </InitialLoadProvider>
    );

    act(() => {
      vi.advanceTimersByTime(INITIAL_LOAD_TIMEOUT_MS);
    });

    expect(screen.getByTestId('status')).toHaveTextContent('timed-out');
    expect(screen.getByTestId('completed')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Settle hero' }));

    expect(screen.getByTestId('status')).toHaveTextContent('timed-out');
    expect(screen.getByTestId('completed')).toHaveTextContent('1');
  });

  it('cleans pending work during Strict Mode unmount', async () => {
    const fonts = createDeferred<FontFaceSet>();
    setDocumentFonts(fonts.promise);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const view = render(
      <StrictMode>
        <InitialLoadProvider>
          <LoadProbe />
        </InitialLoadProvider>
      </StrictMode>
    );

    expect(screen.getByTestId('completed')).toHaveTextContent('1');
    expect(screen.getByTestId('pending')).toHaveTextContent('fonts,hero-image');
    expect(vi.getTimerCount()).toBe(1);

    view.unmount();
    expect(vi.getTimerCount()).toBe(0);

    await act(async () => {
      fonts.resolve({} as FontFaceSet);
      await fonts.promise;
    });

    expect(consoleError).not.toHaveBeenCalled();
  });
});
