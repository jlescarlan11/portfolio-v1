'use client';

import { useEffect, useRef, useState } from 'react';
import { FaLocationDot, FaPhone } from 'react-icons/fa6';
import { SiGmail } from 'react-icons/si';

export default function Footer() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show when scrolling down, hide when scrolling up (opposite of nav)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <footer
      className={`
        fixed bottom-0 left-0 right-0 z-50
        text-[11px] tracking-[0.3em] uppercase text-white/50
        bg-black backdrop-blur-md border-t border-white/10
        py-4
        transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}
    >
      <div className="pointer-events-auto max-w-5xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>© John Lester Escarlan - {new Date().getFullYear()}</div>
          <div className="flex flex-wrap items-center justify-end gap-4">
            <span className="flex items-center gap-1">
              <FaLocationDot className="h-2.5 w-2.5" />
              Cebu City
            </span>
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
              className="flex items-center gap-1 underline underline-offset-4 decoration-white/20 hover:decoration-white"
            >
              <SiGmail className="h-2.5 w-2.5" />
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
            </a>
            <a
              href="tel:+639957128195"
              className="flex items-center gap-1 underline underline-offset-4 decoration-white/20 hover:decoration-white"
            >
              <FaPhone className="h-2.5 w-2.5" />
              +63 995 712 8195
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

