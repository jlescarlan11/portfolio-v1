import React from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number | string;
  className?: string;
  as?: React.ElementType;
}

/**
 * A shared component for entrance animations.
 * Uses the `animate-enter` utility class and `--enter-delay` CSS variable
 * defined in `globals.css`.
 */
export function FadeIn({
  children,
  delay = 0,
  className = '',
  as: Component = 'div'
}: FadeInProps): React.JSX.Element {
  const delayValue = typeof delay === 'number' ? `${delay}ms` : delay;

  const style = {
    '--enter-delay': delayValue
  } as CSSProperties;

  return (
    <Component
      className={`animate-enter ${className}`.trim()}
      style={style}
    >
      {children}
    </Component>
  );
}
