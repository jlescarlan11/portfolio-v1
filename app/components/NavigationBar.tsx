'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'About', href: '#about' },
  { name: 'Work', href: '#work' },
  { name: 'Contact', href: '#contact' },
];

export default function NavigationBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-auto">
      <div className="
        flex items-center justify-center gap-1
        px-3 py-2.5 sm:px-8 sm:py-4
        bg-black/40 backdrop-blur-xs
        border border-white/20
        rounded-full
        transition-all duration-500
        hover:bg-black/60 hover:border-white/40
      ">
        {navItems.map((item, index) => (
          <Link
            key={item.name}
            href={item.href}
            className="
              relative
              px-3 py-1.5 sm:px-6 sm:py-2
              text-xs sm:text-sm 
              tracking-wide
              text-gray-400
              transition-all duration-300
              hover:text-white
              group
            "
          >
            <span className="relative z-10">{item.name}</span>
            
            {/* Hover underline effect */}
            <span className="
              absolute bottom-0.5 sm:bottom-1 left-3 right-3 sm:left-6 sm:right-6
              h-[1px]
              bg-white
              scale-x-0
              group-hover:scale-x-100
              transition-transform duration-300
              origin-left
            "/>
          </Link>
        ))}
      </div>
    </nav>
  );
}

