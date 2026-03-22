'use client';

import { useEffect, useRef } from 'react';

interface ScrollableContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollableContainer({
  children,
  className = ''
}: ScrollableContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-x-auto no-scrollbar ${className}`}
    >
      {children}
    </div>
  );
}
