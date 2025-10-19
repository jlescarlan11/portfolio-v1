import { useEffect, RefObject } from 'react';
import { animate } from 'motion';

interface AnimationOptions {
  duration?: number;
  delay?: number;
}

export function useFadeInAnimation(
  ref: RefObject<HTMLElement | null>,
  options: AnimationOptions = {}
) {
  const { duration = 0.8, delay = 0 } = options;

  useEffect(() => {
    if (!ref.current) return;

    animate(
      ref.current,
      { 
        opacity: [0, 1], 
        transform: ['translateY(20px)', 'translateY(0)'] 
      },
      { duration, delay }
    );
  }, [ref, duration, delay]);
}

