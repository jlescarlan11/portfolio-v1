'use client';

import { useState } from 'react';

interface CopyEmailButtonProps {
  email: string;
}

type CopyStatus = 'idle' | 'copied' | 'failed';

export function CopyEmailButton({
  email
}: CopyEmailButtonProps): React.JSX.Element {
  const [status, setStatus] = useState<CopyStatus>('idle');

  async function copyEmail(): Promise<void> {
    try {
      if (typeof navigator.clipboard?.writeText !== 'function') {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(email);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  }

  const statusMessage =
    status === 'copied'
      ? 'Email copied.'
      : status === 'failed'
        ? 'Copy failed. Select the email address manually.'
        : '';

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => void copyEmail()}
        aria-label={`Copy email address ${email}`}
        title="Copy email address"
        className="select-all font-mono text-[11px] text-subtle-foreground/60 underline decoration-transparent underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
      >
        {email}
      </button>
      <span
        role="status"
        className={
          status === 'idle'
            ? 'sr-only'
            : 'font-mono text-[10px] text-subtle-foreground'
        }
      >
        {statusMessage}
      </span>
    </span>
  );
}
