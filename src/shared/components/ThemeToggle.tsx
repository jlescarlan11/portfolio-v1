'use client';

import { useEffect, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa6';

type Theme = 'dark' | 'light';

function resolveTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('theme', theme);
  } catch {}
}

export function ThemeToggle(): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(resolveTheme());
    setMounted(true);
  }, []);

  function toggle(): void {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
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
