'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Typography } from '@/shared/components/Typography';
import type { NavItem } from '@/shared/site/config';

interface NavigationBarProps {
  items: NavItem[];
}

export default function NavigationBar({
  items
}: NavigationBarProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(true);
  const [isPastHero, setIsPastHero] = useState(false);
  const lastScrollY = useRef(0);
  const isClicked = useRef(false);

  useEffect(() => {
    const handleScroll = (): void => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 80 && !isClicked.current) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
        isClicked.current = false;
      }

      setIsPastHero(currentScrollY > window.innerHeight * 0.5);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pillBase = [
    'flex items-center gap-1',
    'border px-2 py-1.5 sm:px-3 sm:py-2',
    'backdrop-blur-md transition-colors duration-500',
    isPastHero
      ? 'border-foreground/15 bg-background/80'
      : 'border-surface bg-surface-glass'
  ].join(' ');

  return (
    <nav
      aria-label="main navigation"
      className={[
        'fixed top-6 left-1/2 z-50 -translate-x-1/2',
        'transition-all duration-300 ease-out',
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-4 opacity-0 pointer-events-none'
      ].join(' ')}
    >
      <ul className={pillBase}>
        {items.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              onClick={() => {
                isClicked.current = true;
                setIsVisible(true);
              }}
              className={[
                'group block px-4 py-2 sm:py-1.5',
                'transition-colors duration-200',
                'hover:bg-surface-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20',
                'active:bg-surface-tint-strong'
              ].join(' ')}
            >
              <Typography
                variant="label"
                as="span"
                className="text-[13px] text-muted-foreground transition-colors duration-200 group-hover:text-foreground"
              >
                {item.name}
              </Typography>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
