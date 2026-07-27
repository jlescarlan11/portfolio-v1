'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa6';

type Theme = 'dark' | 'light';
const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return null;
}

function resolveTheme(mediaQuery?: MediaQueryList): Theme {
  const stored = getStoredTheme();
  if (stored) return stored;
  return mediaQuery?.matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme, persist = false): void {
  document.documentElement.setAttribute('data-theme', theme);
  if (!persist) return;
  try {
    localStorage.setItem('theme', theme);
  } catch {}
}

export function ThemeToggle(): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  const hasManualOverride = useRef(false);

  useEffect(() => {
    const mediaQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia(COLOR_SCHEME_QUERY)
      : undefined;
    setTheme(resolveTheme(mediaQuery));
    setMounted(true);

    function handleSystemThemeChange(event: MediaQueryListEvent): void {
      if (hasManualOverride.current || getStoredTheme()) return;
      const nextTheme: Theme = event.matches ? 'dark' : 'light';
      setTheme(nextTheme);
      applyTheme(nextTheme);
    }

    function handleStoredThemeChange(event: StorageEvent): void {
      if (event.key !== 'theme' && event.key !== null) return;
      hasManualOverride.current = false;
      const nextTheme: Theme = event.newValue === 'dark' || event.newValue === 'light'
        ? event.newValue
        : mediaQuery?.matches ? 'dark' : 'light';
      setTheme(nextTheme);
      applyTheme(nextTheme);
    }

    if (mediaQuery) {
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.addListener(handleSystemThemeChange);
      }
    }
    window.addEventListener('storage', handleStoredThemeChange);
    return () => {
      if (mediaQuery) {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', handleSystemThemeChange);
        } else {
          mediaQuery.removeListener(handleSystemThemeChange);
        }
      }
      window.removeEventListener('storage', handleStoredThemeChange);
    };
  }, []);

  function toggle(): void {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    hasManualOverride.current = true;
    setTheme(next);
    applyTheme(next, true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
      className={[
        'flex items-center justify-center w-8 h-8',
        'text-muted-foreground transition-colors duration-200',
        'hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20',
        !mounted ? 'opacity-0' : 'opacity-100'
      ].join(' ')}
    >
      {theme === 'dark'
        ? <FaSun size={13} aria-hidden="true" />
        : <FaMoon size={13} aria-hidden="true" />
      }
    </button>
  );
}
