import { useState, useCallback, useRef } from 'react';

interface SwipeConfig {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  minSwipeDistance?: number;
  minVelocity?: number;
  throttleMs?: number;
}

interface SwipeState {
  start: number | null;
  end: number | null;
  isDragging: boolean;
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

interface MouseHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

interface UseSwipeGestureResult {
  touchHandlers: SwipeHandlers;
  mouseHandlers: MouseHandlers;
  isDragging: boolean;
  hasActiveTouch: boolean;
}

/**
 * Detects if a swipe gesture occurred based on distance and velocity.
 * Complexity: O(1) time and O(1) space. Expected input size is one gesture endpoint pair.
 */
function detectSwipe(
  start: number | null,
  end: number | null,
  startTime: number,
  config: Required<Pick<SwipeConfig, 'minSwipeDistance' | 'minVelocity'>>
): 'left' | 'right' | null {
  if (start === null || end === null) return null;

  const distance = start - end;
  const swipeTime = Date.now() - startTime;
  const velocity = Math.abs(distance) / swipeTime;

  const isFastSwipe = velocity > config.minVelocity;
  const isSufficientDistance = Math.abs(distance) > config.minSwipeDistance;

  if (isFastSwipe || isSufficientDistance) {
    return distance > 0 ? 'left' : 'right';
  }

  return null;
}

/**
 * Custom hook for swipe gestures across touch and mouse input.
 * Complexity: O(1) time and O(1) space per event. Expected input size is one gesture sequence at a time.
 */
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 50,
  minVelocity = 0.3,
  throttleMs = 500,
}: SwipeConfig): UseSwipeGestureResult {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    start: null,
    end: null,
    isDragging: false,
  });
  const startTimeRef = useRef<number>(0);
  const lastSwipeTimeRef = useRef<number>(0);

  const resetSwipeState = useCallback((): void => {
    setSwipeState({ start: null, end: null, isDragging: false });
  }, []);

  const handleSwipeEnd = useCallback((): void => {
    const direction = detectSwipe(swipeState.start, swipeState.end, startTimeRef.current, {
      minSwipeDistance,
      minVelocity,
    });

    if (direction) {
      const now = Date.now();
      const timeSinceLastSwipe = now - lastSwipeTimeRef.current;

      // Throttle swipes to prevent rapid navigation
      if (timeSinceLastSwipe > throttleMs) {
        lastSwipeTimeRef.current = now;
        if (direction === 'left') {
          onSwipeLeft();
        } else {
          onSwipeRight();
        }
      }
    }

    resetSwipeState();
  }, [swipeState, minSwipeDistance, minVelocity, throttleMs, onSwipeLeft, onSwipeRight, resetSwipeState]);

  // Touch event handlers
  const touchHandlers = {
    onTouchStart: useCallback((e: React.TouchEvent): void => {
      setSwipeState((prev) => ({ ...prev, start: e.targetTouches[0].clientX, end: null }));
      startTimeRef.current = Date.now();
    }, []),

    onTouchMove: useCallback((e: React.TouchEvent): void => {
      setSwipeState((prev) => ({ ...prev, end: e.targetTouches[0].clientX }));
    }, []),

    onTouchEnd: useCallback((): void => {
      handleSwipeEnd();
    }, [handleSwipeEnd]),
  };

  // Mouse event handlers
  const mouseHandlers = {
    onMouseDown: useCallback((e: React.MouseEvent): void => {
      e.preventDefault();
      setSwipeState({ start: e.clientX, end: null, isDragging: true });
      startTimeRef.current = Date.now();
    }, []),

    onMouseMove: useCallback((e: React.MouseEvent): void => {
      if (!swipeState.isDragging) {
        return;
      }

      e.preventDefault();
      setSwipeState((prev) => ({ ...prev, end: e.clientX }));
    }, [swipeState.isDragging]),

    onMouseUp: useCallback((): void => {
      if (!swipeState.isDragging) {
        return;
      }

      handleSwipeEnd();
    }, [swipeState.isDragging, handleSwipeEnd]),

    onMouseLeave: useCallback((): void => {
      if (swipeState.isDragging) {
        handleSwipeEnd();
      }
    }, [swipeState.isDragging, handleSwipeEnd]),
  };

  return {
    touchHandlers,
    mouseHandlers,
    isDragging: swipeState.isDragging,
    hasActiveTouch: swipeState.start !== null,
  };
}

