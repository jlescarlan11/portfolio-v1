import { useCallback, useRef } from 'react';

interface WheelNavigationConfig {
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
  throttleMs?: number;
  minDelta?: number;
}

interface UseWheelNavigationResult {
  handleWheel: (e: React.WheelEvent) => void;
}

/**
 * Custom hook for horizontal wheel navigation.
 * Complexity: O(1) time and O(1) space per wheel event. Expected input size is one event at a time.
 */
export function useWheelNavigation({
  onNavigateNext,
  onNavigatePrevious,
  throttleMs = 500,
  minDelta = 10,
}: WheelNavigationConfig): UseWheelNavigationResult {
  const lastWheelTimeRef = useRef<number>(0);

  const handleWheel = useCallback(
    (e: React.WheelEvent): void => {
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

