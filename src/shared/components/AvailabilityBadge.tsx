'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AvailabilityBadge(): React.JSX.Element {
  const [visible, setVisible] = useState(false);
  const [nearContact, setNearContact] = useState(false);

  useEffect(() => {
    // Show badge after a short delay on mount — don't compete with hero load
    const showTimer = setTimeout(() => setVisible(true), 1200);

    const handleScroll = () => {
      const contact = document.getElementById('contact');
      if (!contact) return;

      const rect = contact.getBoundingClientRect();
      // Hide when contact section is within the viewport
      setNearContact(rect.top < window.innerHeight && rect.bottom > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      clearTimeout(showTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isShown = visible && !nearContact;

  return (
    <div
      className={[
        'fixed bottom-6 right-6 z-40 transition-all duration-500 ease-out sm:bottom-8 sm:right-8',
        isShown
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-3 opacity-0 pointer-events-none'
      ].join(' ')}
      aria-hidden={!isShown}
    >
      <Link
        href="/#contact"
        className="group flex items-center gap-2.5 border border-foreground/15 bg-background-glass px-4 py-2.5 backdrop-blur-sm transition-all duration-200 hover:border-foreground/30 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-label="Open to opportunities — go to contact section"
        tabIndex={isShown ? 0 : -1}
      >
        {/* Availability dot — matches hero + contact */}
        <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping bg-foreground opacity-20" />
          <span className="relative inline-flex h-2 w-2 bg-foreground/40" />
        </span>

        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle-foreground transition-colors duration-200 group-hover:text-foreground">
          Open to opportunities
        </span>

        <span
          aria-hidden="true"
          className="text-[11px] text-foreground/25 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground/50"
        >
          →
        </span>
      </Link>
    </div>
  );
}