'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

const navItems = [
  { name: 'Work', href: '#work' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export default function NavigationBar() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav 
      className={`
        fixed top-5 sm:top-8 left-1/2 -translate-x-1/2 z-50
        transition-all duration-300 ease-out
        ${isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : '-translate-y-16 opacity-0 scale-95'
        }
      `}
    >
      <div className="flex items-center gap-6 px-6 py-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-lg shadow-black/10">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group relative px-0 py-1 text-[11px] sm:text-xs tracking-[0.3em] text-white/70 hover:text-white transition-colors duration-300 uppercase focus-visible:outline-none"
          >
            <span>{item.name}</span>
            <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-white/80 scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
        ))}
      </div>
    </nav>
  );
}