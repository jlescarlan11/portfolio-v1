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

/**
 * Detects if a swipe gesture occurred based on distance and velocity
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
 * Custom hook for handling swipe gestures (touch and mouse)
 * Provides handlers for both touch and mouse events with configurable thresholds
 */
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 50,
  minVelocity = 0.3,
  throttleMs = 500,
}: SwipeConfig) {
  const [swipeState, setSwipeState] = useState<SwipeState>({
    start: null,
    end: null,
    isDragging: false,
  });
  const startTimeRef = useRef<number>(0);
  const lastSwipeTimeRef = useRef<number>(0);

  const resetSwipeState = useCallback(() => {
    setSwipeState({ start: null, end: null, isDragging: false });
  }, []);

  const handleSwipeEnd = useCallback(() => {
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
    onTouchStart: useCallback((e: React.TouchEvent) => {
      setSwipeState((prev) => ({ ...prev, start: e.targetTouches[0].clientX, end: null }));
      startTimeRef.current = Date.now();
    }, []),

    onTouchMove: useCallback((e: React.TouchEvent) => {
      setSwipeState((prev) => ({ ...prev, end: e.targetTouches[0].clientX }));
    }, []),

    onTouchEnd: useCallback(() => {
      handleSwipeEnd();
    }, [handleSwipeEnd]),
  };

  // Mouse event handlers
  const mouseHandlers = {
    onMouseDown: useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setSwipeState({ start: e.clientX, end: null, isDragging: true });
      startTimeRef.current = Date.now();
    }, []),

    onMouseMove: useCallback((e: React.MouseEvent) => {
      if (!swipeState.isDragging) return;
      e.preventDefault();
      setSwipeState((prev) => ({ ...prev, end: e.clientX }));
    }, [swipeState.isDragging]),

    onMouseUp: useCallback(() => {
      if (!swipeState.isDragging) return;
      handleSwipeEnd();
    }, [swipeState.isDragging, handleSwipeEnd]),

    onMouseLeave: useCallback(() => {
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

