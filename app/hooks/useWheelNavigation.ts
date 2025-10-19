import { useCallback, useRef } from 'react';

interface WheelNavigationConfig {
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
  throttleMs?: number;
  minDelta?: number;
}

/**
 * Custom hook for handling trackpad/wheel horizontal swipe navigation
 * Prevents browser back/forward navigation while enabling carousel control
 */
export function useWheelNavigation({
  onNavigateNext,
  onNavigatePrevious,
  throttleMs = 500,
  minDelta = 10,
}: WheelNavigationConfig) {
  const lastWheelTimeRef = useRef<number>(0);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const isHorizontalSwipe = Math.abs(e.deltaX) > Math.abs(e.deltaY);

      if (isHorizontalSwipe && Math.abs(e.deltaX) > minDelta) {
        e.preventDefault();

        // Throttle to prevent too rapid navigation
        const now = Date.now();
        const timeSinceLastSwipe = now - lastWheelTimeRef.current;

        if (timeSinceLastSwipe > throttleMs) {
          lastWheelTimeRef.current = now;

          if (e.deltaX > 0) {
            onNavigateNext();
          } else {
            onNavigatePrevious();
          }
        }
      }
    },
    [onNavigateNext, onNavigatePrevious, throttleMs, minDelta]
  );

  return { handleWheel };
}

