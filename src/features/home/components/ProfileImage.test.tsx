import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProfileImage from './ProfileImage';

vi.mock('next/image', async () => {
  const ReactModule = await import('react');

  const MockImage = ReactModule.forwardRef<
    HTMLImageElement,
    React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }
  >(function MockImage({ priority, alt = '', ...props }, ref) {
    return (
      // The production component remains next/image; this native element exposes
      // its load, error, cache, and decode boundaries to the component tests.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        alt={alt}
        data-priority={String(Boolean(priority))}
        {...props}
      />
    );
  });

  return { default: MockImage };
});

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

function setImageState(
  image: HTMLImageElement,
  {
    complete,
    naturalWidth,
    decode
  }: {
    complete: boolean;
    naturalWidth: number;
    decode?: () => Promise<void>;
  }
): void {
  Object.defineProperties(image, {
    complete: {
      configurable: true,
      get: () => complete
    },
    naturalWidth: {
      configurable: true,
      get: () => naturalWidth
    },
    decode: {
      configurable: true,
      value: decode
    }
  });
}

function setCachedImageDefaults(
  complete: boolean,
  naturalWidth: number,
  decode?: () => Promise<void>
): void {
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(complete);
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(
    naturalWidth
  );
  Object.defineProperty(HTMLImageElement.prototype, 'decode', {
    configurable: true,
    value: decode
  });
}

describe('ProfileImage', () => {
  const originalDecode = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype,
    'decode'
  );

  beforeEach(() => {
    setCachedImageDefaults(false, 0);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();

    if (originalDecode) {
      Object.defineProperty(HTMLImageElement.prototype, 'decode', originalDecode);
    } else {
      Reflect.deleteProperty(HTMLImageElement.prototype, 'decode');
    }
  });

  it('preserves the existing portrait contract when no callback is provided', () => {
    render(<ProfileImage src="/hero-image.jpg" alt="Portrait of John" />);

    const image = screen.getByRole('img', { name: 'Portrait of John' });
    expect(image).toHaveAttribute('src', '/hero-image.jpg');
    expect(image).toHaveAttribute('width', '300');
    expect(image).toHaveAttribute('height', '300');
    expect(image).toHaveAttribute('data-priority', 'true');
    expect(image).toHaveClass('object-cover', 'grayscale');
  });

  it('waits for a non-cached image to decode before reporting success', async () => {
    const decoded = createDeferred<void>();
    const onSettled = vi.fn();
    render(
      <ProfileImage
        src="/hero-image.jpg"
        alt="Portrait of John"
        onSettled={onSettled}
      />
    );

    const image = screen.getByRole('img', {
      name: 'Portrait of John'
    }) as HTMLImageElement;
    setImageState(image, {
      complete: true,
      naturalWidth: 300,
      decode: () => decoded.promise
    });

    fireEvent.load(image);
    expect(onSettled).not.toHaveBeenCalled();

    await act(async () => {
      decoded.resolve();
      await decoded.promise;
    });

    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(onSettled).toHaveBeenCalledWith('loaded');
  });

  it('detects an already-complete cached image', async () => {
    const onSettled = vi.fn();
    setCachedImageDefaults(true, 300, () => Promise.resolve());

    render(
      <ProfileImage
        src="/hero-image.jpg"
        alt="Portrait of John"
        onSettled={onSettled}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(onSettled).toHaveBeenCalledWith('loaded');
  });

  it('settles a decode rejection from the actual post-decode image state', async () => {
    const onSettled = vi.fn();
    setCachedImageDefaults(true, 300, () => Promise.reject(new Error('decode failed')));

    render(
      <ProfileImage
        src="/hero-image.jpg"
        alt="Portrait of John"
        onSettled={onSettled}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(onSettled).toHaveBeenCalledWith('loaded');
  });

  it('uses a layout-stable accessible fallback for errors and invalid images', async () => {
    const onErrorSettled = vi.fn();
    const errorView = render(
      <ProfileImage
        src="/hero-image.jpg"
        alt="Portrait of John"
        onSettled={onErrorSettled}
      />
    );

    fireEvent.error(screen.getByRole('img', { name: 'Portrait of John' }));

    expect(onErrorSettled).toHaveBeenCalledTimes(1);
    expect(onErrorSettled).toHaveBeenCalledWith('fallback');
    expect(screen.getByRole('img', { name: 'Portrait of John' })).toHaveClass(
      'h-full',
      'w-full',
      'bg-surface-muted'
    );
    errorView.unmount();

    const onInvalidSettled = vi.fn();
    setCachedImageDefaults(true, 0, () => Promise.resolve());
    render(
      <ProfileImage
        src="/hero-image.jpg"
        alt="Portrait of John"
        onSettled={onInvalidSettled}
      />
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(onInvalidSettled).toHaveBeenCalledTimes(1);
    expect(onInvalidSettled).toHaveBeenCalledWith('fallback');
    expect(screen.getByRole('img', { name: 'Portrait of John' })).toBeVisible();
  });

  it('reports only once when cached, load, decode, and error paths overlap', async () => {
    const onSettled = vi.fn();
    const decoded = createDeferred<void>();
    setCachedImageDefaults(true, 300, () => decoded.promise);

    render(
      <ProfileImage
        src="/hero-image.jpg"
        alt="Portrait of John"
        onSettled={onSettled}
      />
    );

    const image = screen.getByRole('img', { name: 'Portrait of John' });
    fireEvent.load(image);

    await act(async () => {
      decoded.resolve();
      await decoded.promise;
    });

    fireEvent.load(image);
    fireEvent.error(image);

    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(onSettled).toHaveBeenCalledWith('loaded');
  });

  it('does not report or update state after unmount during decode', async () => {
    const decoded = createDeferred<void>();
    const onSettled = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    setCachedImageDefaults(true, 300, () => decoded.promise);

    const view = render(
      <ProfileImage
        src="/hero-image.jpg"
        alt="Portrait of John"
        onSettled={onSettled}
      />
    );
    view.unmount();

    await act(async () => {
      decoded.resolve();
      await decoded.promise;
    });

    expect(onSettled).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('ignores a stale decode result after the portrait source changes', async () => {
    const firstDecode = createDeferred<void>();
    const secondDecode = createDeferred<void>();
    const onSettled = vi.fn();
    setCachedImageDefaults(true, 300, () => firstDecode.promise);

    const view = render(
      <ProfileImage
        src="/first-portrait.svg"
        alt="Portrait of John"
        onSettled={onSettled}
      />
    );

    setCachedImageDefaults(true, 300, () => secondDecode.promise);
    view.rerender(
      <ProfileImage
        src="/second-portrait.svg"
        alt="Portrait of John"
        onSettled={onSettled}
      />
    );

    await act(async () => {
      firstDecode.resolve();
      await firstDecode.promise;
    });
    expect(onSettled).not.toHaveBeenCalled();

    await act(async () => {
      secondDecode.resolve();
      await secondDecode.promise;
    });
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(onSettled).toHaveBeenCalledWith('loaded');
  });
});
