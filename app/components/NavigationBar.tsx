'use client';

import Link from 'next/link';

const navItems = [
  { name: 'Work', href: '#work' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export default function NavigationBar() {
  return (
    <nav className="fixed top-5 sm:top-8 left-6 sm:left-8 z-50">
      <div className="flex items-center gap-6">
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

