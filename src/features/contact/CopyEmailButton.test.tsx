import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CopyEmailButton } from './CopyEmailButton';

const email = 'jlescarlan11@gmail.com';
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

beforeEach(() => {
  vi.stubGlobal('React', React);
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
  else Reflect.deleteProperty(navigator, 'clipboard');
});

function setup(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  const view = render(<CopyEmailButton email={email} />);
  return { ...view, button: screen.getByRole('button', { name: `Copy email address ${email}` }) };
}

describe('CopyEmailButton recovery', () => {
  it('recovers from an unresolved permission prompt and allows a successful retry', async () => {
    const writeText = vi.fn().mockImplementationOnce(() => new Promise<void>(() => {}))
      .mockResolvedValueOnce(undefined);
    const { button } = setup(writeText);
    fireEvent.click(button);
    expect(button).toBeDisabled();
    await act(async () => { await vi.advanceTimersByTimeAsync(5_000); });
    expect(button).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('Copy failed. Select the email address manually.');
    await act(async () => { fireEvent.click(button); });
    expect(writeText).toHaveBeenCalledTimes(2);
    expect(writeText).toHaveBeenLastCalledWith(email);
    expect(screen.getByRole('status')).toHaveTextContent('Email copied.');
  });

  it.each(['resolve', 'reject'] as const)('ignores a late %s from a timed-out attempt while retrying', async settlement => {
    let resolveOld!: () => void;
    let rejectOld!: () => void;
    const oldWrite = new Promise<void>((resolve, reject) => { resolveOld = resolve; rejectOld = reject; });
    const writeText = vi.fn().mockReturnValueOnce(oldWrite)
      .mockImplementationOnce(() => new Promise<void>(() => {}));
    const { button } = setup(writeText);
    fireEvent.click(button);
    await act(async () => { await vi.advanceTimersByTimeAsync(5_000); });
    fireEvent.click(button);
    await act(async () => { if (settlement === 'resolve') resolveOld(); else rejectOld(); });
    expect(button).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Copying email.');
    await act(async () => { await vi.advanceTimersByTimeAsync(5_000); });
    expect(button).toBeEnabled();
  });

  it('releases the recovery timer on unmount', () => {
    const { button, unmount } = setup(() => new Promise<void>(() => {}));
    fireEvent.click(button);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('announces a denied write and leaves no recovery timer', async () => {
    const { button } = setup(() => Promise.reject(new DOMException('Denied', 'NotAllowedError')));
    await act(async () => { fireEvent.click(button); });
    expect(button).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('Copy failed. Select the email address manually.');
    expect(vi.getTimerCount()).toBe(0);
  });
});
