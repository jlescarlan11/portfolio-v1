'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Typography } from '@/shared/components/Typography';
import { siteConfig } from '@/shared/site/config';

const PREFER_REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const EXIT_DURATION = 500;

function getProgressStyle(progress: number): CSSProperties {
  return { width: `${progress}%` };
}

export default function WelcomeOverlay(): React.JSX.Element | null {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(PREFER_REDUCED_MOTION);
    const update = (): void => setReduceMotion(mediaQuery.matches);
    update();

    const handler = (event: MediaQueryListEvent): void => {
      setReduceMotion(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  const dismiss = useCallback((): void => {
    if (!visible || closing) {
      return;
    }

    if (reduceMotion) {
      setVisible(false);
      return;
    }

    setClosing(true);
    if (typeof window === 'undefined') {
      setVisible(false);
      setClosing(false);
      return;
    }

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      closeTimerRef.current = null;
    }, EXIT_DURATION);
  }, [closing, reduceMotion, visible]);

  useEffect(() => {
    if (!visible || typeof window === 'undefined') {
      return;
    }

    const duration = reduceMotion ? 0 : 3000;

    const step = (timestamp: number): void => {
      if (startRef.current == null) {
        startRef.current = timestamp;
      }

      const elapsed = timestamp - startRef.current;
      const pct = duration === 0 ? 100 : Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 100) {
        rafRef.current = window.requestAnimationFrame(step);
      } else {
        const exitDelay = reduceMotion ? 0 : 150;
        window.setTimeout(() => dismiss(), exitDelay);
      }
    };

    if (duration === 0) {
      setProgress(100);
      dismiss();
      return;
    }

    rafRef.current = window.requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startRef.current = null;
    };
  }, [dismiss, reduceMotion, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setProgress(100);
        dismiss();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dismiss, visible]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label={siteConfig.overlay.ariaLabel}
      aria-live="polite"
      className={[
        'fixed inset-0 z-[9999] grid place-items-center bg-surface-muted px-6 transition-opacity duration-500',
        closing ? 'opacity-0' : 'opacity-100'
      ].join(' ')}
      onClick={() => {
        setProgress(100);
        dismiss();
      }}
    >
      <div
        className={[
          'animate-enter w-full max-w-md space-y-6 text-center',
          closing ? '-translate-y-2 opacity-0' : ''
        ].join(' ')}
      >
        <Typography variant="h1" as="h1">
          {siteConfig.overlay.title}
        </Typography>
        <div className="space-y-2" aria-live="polite">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-1.5 w-full overflow-hidden border border-surface bg-surface-tint"
          >
            <div
              className="h-full bg-foreground transition-[width] duration-200"
              style={getProgressStyle(progress)}
            />
          </div>
          <Typography variant="caption" className="text-subtle-foreground">
            {siteConfig.overlay.loadingLabel} {progress}%
          </Typography>
        </div>
      </div>
    </div>
  );
}
