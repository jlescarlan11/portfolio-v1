'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Typography } from '@/shared/components/Typography';
import { useInitialLoad } from '@/shared/loading';
import { siteConfig } from '@/shared/site/config';

const PREFER_REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const EXIT_DURATION = 300;

function getProgressStyle(progress: number): CSSProperties {
  return { transform: `scaleX(${progress})` };
}

export default function WelcomeOverlay(): React.JSX.Element | null {
  const { status, progress } = useInitialLoad();
  const progressPercentage = Math.round(progress * 100);
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
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

  useEffect(() => {
    if (!visible || status === 'loading') {
      return;
    }

    if (reduceMotion || status === 'timed-out') {
      setVisible(false);
      return;
    }

    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      closeTimerRef.current = null;
    }, EXIT_DURATION);

    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [reduceMotion, status, visible]);

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

  if (!visible) {
    return null;
  }

  return (
    <div
      data-testid="initial-load-overlay"
      className={[
        'initial-load-overlay fixed inset-0 z-[9999] grid min-h-dvh place-items-center overflow-hidden bg-surface px-6 py-10',
        'transition-opacity duration-300',
        closing ? 'pointer-events-none opacity-0' : 'opacity-100'
      ].join(' ')}
    >
      <div
        className="surface-grid-mask pointer-events-none-safe absolute inset-0 opacity-50"
        aria-hidden="true"
      />
      <div
        className={[
          'relative w-full max-w-md space-y-8 text-center transition-[opacity,transform] duration-300',
          closing ? '-translate-y-2 opacity-0' : ''
        ].join(' ')}
      >
        <div className="space-y-3">
          <Typography
            variant="caption"
            as="p"
            className="font-semibold uppercase tracking-[0.14em] text-subtle-foreground"
          >
            {siteConfig.overlay.eyebrow}
          </Typography>
          <Typography variant="h1" as="p" className="font-serif">
            {siteConfig.overlay.title}
          </Typography>
        </div>

        <div className="space-y-3">
          <div
            role="progressbar"
            aria-label={siteConfig.overlay.progressLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercentage}
            aria-valuetext={`${progressPercentage}% complete`}
            className="h-1 w-full overflow-hidden bg-surface-tint-strong"
          >
            <div
              className="h-full origin-left bg-foreground transition-transform duration-300"
              style={getProgressStyle(progress)}
            />
          </div>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="flex items-center justify-between gap-4"
          >
            <Typography
              variant="caption"
              as="span"
              className="text-subtle-foreground"
            >
              {siteConfig.overlay.loadingLabel}
            </Typography>
            <Typography
              variant="caption"
              as="span"
              aria-hidden="true"
              className="tabular-nums text-subtle-foreground"
            >
              {progressPercentage}%
            </Typography>
            <span className="sr-only">
              {progressPercentage}% complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
