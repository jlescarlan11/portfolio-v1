'use client';

import { useEffect, useRef, useState } from 'react';

interface CopyEmailButtonProps {
  email: string;
}

type CopyStatus = 'idle' | 'copying' | 'copied' | 'failed';

export function CopyEmailButton({
  email
}: CopyEmailButtonProps): React.JSX.Element {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const copyInProgress = useRef(false);
  const attemptId = useRef(0);
  const recoveryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => {
    attemptId.current += 1;
    clearTimeout(recoveryTimer.current);
  }, []);

  async function copyEmail(): Promise<void> {
    if (copyInProgress.current) return;
    copyInProgress.current = true;
    const attempt = ++attemptId.current;
    setStatus('copying');

    try {
      if (typeof navigator.clipboard?.writeText !== 'function') {
        throw new Error('Clipboard unavailable');
      }
      // Dismissing Chrome's permission prompt can leave writeText unresolved.
      // The timeout ends our wait; it cannot cancel the browser's native write.
      await Promise.race([
        navigator.clipboard.writeText(email),
        new Promise<never>((_, reject) => {
          recoveryTimer.current = setTimeout(
            () => reject(new Error('Clipboard request timed out')),
            5_000
          );
        })
      ]);
      if (attempt === attemptId.current) setStatus('copied');
    } catch {
      if (attempt === attemptId.current) setStatus('failed');
    } finally {
      if (attempt === attemptId.current) {
        clearTimeout(recoveryTimer.current);
        recoveryTimer.current = undefined;
        copyInProgress.current = false;
      }
    }
  }

  const statusMessage =
    status === 'copying'
      ? 'Copying email.'
      : status === 'copied'
        ? 'Email copied.'
        : status === 'failed'
          ? 'Copy failed. Select the email address manually.'
          : '';

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => void copyEmail()}
        disabled={status === 'copying'}
        aria-label={`Copy email address ${email}`}
        title="Copy email address"
        className="select-all font-sans text-base text-foreground underline decoration-transparent underline-offset-4 transition-colors hover:text-muted-foreground hover:decoration-muted-foreground"
      >
        {email}
      </button>
      <span
        role="status"
        className={
          status === 'idle'
            ? 'sr-only'
            : 'font-sans text-base text-subtle-foreground'
        }
      >
        {statusMessage}
      </span>
    </span>
  );
}
