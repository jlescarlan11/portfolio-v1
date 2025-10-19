import { useRef, useCallback } from 'react';
import { animate } from 'motion';

interface HoverAnimationConfig {
  scale?: [number, number];
  translateY?: [number, number];
  rotate?: [number, number];
  duration?: number;
}

/**
 * Reusable hook for hover animations following DRY principle
 * Handles common hover animation patterns across components
 */
export function useHoverAnimation<T extends HTMLElement>(
  config: HoverAnimationConfig = {}
) {
  const {
    scale = [1, 1.05],
    translateY = [0, 0],
    rotate = [0, 0],
    duration = 0.3,
  } = config;

  const ref = useRef<T>(null);

  const handleMouseEnter = useCallback(() => {
    if (ref.current) {
      animate(
        ref.current,
        {
          transform: [
            `scale(${scale[0]}) translateY(${translateY[0]}px) rotate(${rotate[0]}deg)`,
            `scale(${scale[1]}) translateY(${translateY[1]}px) rotate(${rotate[1]}deg)`,
          ],
        },
        { duration }
      );
    }
  }, [scale, translateY, rotate, duration]);

  const handleMouseLeave = useCallback(() => {
    if (ref.current) {
      animate(
        ref.current,
        {
          transform: [
            `scale(${scale[1]}) translateY(${translateY[1]}px) rotate(${rotate[1]}deg)`,
            `scale(${scale[0]}) translateY(${translateY[0]}px) rotate(${rotate[0]}deg)`,
          ],
        },
        { duration }
      );
    }
  }, [scale, translateY, rotate, duration]);

  return {
    ref,
    handleMouseEnter,
    handleMouseLeave,
  };
}

