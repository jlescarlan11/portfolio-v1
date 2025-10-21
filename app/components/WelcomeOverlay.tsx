"use client";

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

export default function WelcomeOverlay() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const reduceMotion = useReducedMotion();
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setVisible(true);

    const duration = reduceMotion ? 0 : 3000;
    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct = duration === 0 ? 100 : Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = window.requestAnimationFrame(step);
      } else {
        window.setTimeout(() => dismiss(), reduceMotion ? 0 : 150);
      }
    };

    if (duration === 0) {
      setProgress(100);
      dismiss();
      return;
    }
    rafRef.current = window.requestAnimationFrame(step);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [reduceMotion]);

  // Prevent background scroll while overlay is visible
  useEffect(() => {
    if (!visible) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [visible]);

  function dismiss() {
    setVisible(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setProgress(100); dismiss(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Welcome"
          aria-live="polite"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: reduceMotion ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.6, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#0b0b0b',
            color: '#f5f5f5',
            display: 'grid',
            placeItems: 'center',
          }}
          onClick={() => { setProgress(100); dismiss(); }}
        >
          <motion.div
            initial={{ y: reduceMotion ? 0 : 16, opacity: reduceMotion ? 1 : 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduceMotion ? 0 : -16, opacity: reduceMotion ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
            style={{ textAlign: 'center', padding: '0 1rem' }}
          >
            <motion.h1
              initial={{ opacity: reduceMotion ? 1 : 1 }}
              animate={
                reduceMotion
                  ? { opacity: 1 }
                  : {
                      opacity: [0.5, 1, 0.5],
                      filter: ['brightness(0.9)', 'brightness(1.2)', 'brightness(0.9)'],
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 1.6, times: [0, 0.5, 1], repeat: Infinity, ease: 'easeInOut' }
              }
              style={{ fontSize: 'clamp(14px, 3vw, 32px)', letterSpacing: 2, textTransform: 'uppercase', willChange: 'opacity, filter' }}
            >
              John Lester Escarlan
            </motion.h1>

            {/* Progress meter */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }} aria-live="polite">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                style={{
                  width: 'min(320px, 80vw)',
                  height: 3,
                  background: '#1a1a1a',
                  border: '1px solid #222',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  style={{ height: '100%', background: '#ffffff' }}
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, letterSpacing: 1, color: '#cccccc' }}>
                Loading {progress}%
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


