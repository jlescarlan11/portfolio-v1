'use client';

import { useEffect, useState, useRef } from 'react';

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
        text-[11px] tracking-[0.3em] uppercase text-white/50 text-center
        bg-black backdrop-blur-md border-t border-white/10
        py-4
        transition-all duration-300 ease-out
        ${isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0'
        }
      `}
    >
      <div className="pointer-events-auto">
        <div>© John Lester Escarlan — {new Date().getFullYear()}</div>
        <a 
          href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} 
          className="underline underline-offset-4 decoration-white/20 hover:decoration-white block mt-1"
        >
          {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  );
}

