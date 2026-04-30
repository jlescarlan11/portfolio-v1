'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number | string;
  className?: string;
  as?: React.ElementType;
}

export function FadeIn({
  children,
  delay = 0,
  className = '',
  as: Component = 'div'
}: FadeInProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const delayValue = typeof delay === 'number' ? `${delay}ms` : delay;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      className={isVisible ? `animate-enter ${className}`.trim() : `opacity-0 ${className}`.trim()}
      style={isVisible ? ({ '--enter-delay': delayValue } as CSSProperties) : undefined}
    >
      {children}
    </Component>
  );
}
