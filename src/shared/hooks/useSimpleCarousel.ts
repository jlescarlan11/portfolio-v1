import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSimpleCarouselProps {
  totalItems: number;
  itemsPerView: number;
  autoPlayInterval?: number;
  initialIndex?: number;
  isInfinite?: boolean;
  originalItemsCount?: number;
}

interface UseSimpleCarouselResult {
  currentIndex: number;
  maxIndex: number;
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  pauseAutoPlay: () => void;
  resumeAutoPlay: () => void;
  isAutoPlaying: boolean;
  isTransitioning: boolean;
  isResetting: boolean;
}

/**
 * Carousel state manager with optional infinite reset behavior.
 * Complexity: O(1) time and O(1) space per navigation/update. Expected input size is a small visible window over tens to low hundreds of items.
 */
export function useSimpleCarousel({
  totalItems,
  itemsPerView,
  autoPlayInterval = 3000,
  initialIndex = 0,
  isInfinite = false,
  originalItemsCount = 0
}: UseSimpleCarouselProps): UseSimpleCarouselResult {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxIndex = Math.max(0, totalItems - itemsPerView);

  // Clean up timeouts
  const clearAllTimeouts = useCallback((): void => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  // Handle infinite scroll reset with improved logic
  const handleInfiniteReset = useCallback((): void => {
    if (!isInfinite || !originalItemsCount) {
      return;
    }

    clearAllTimeouts();

    const totalSections = Math.floor(totalItems / originalItemsCount);
    const middleSection = Math.floor(totalSections / 2);
    const highThreshold = originalItemsCount * (middleSection + 10);
    const lowThreshold = originalItemsCount * (middleSection - 10);

    if (currentIndex >= highThreshold) {
      // Reset from high section back to middle
      setIsTransitioning(true);
      setIsResetting(true);

      // Use requestAnimationFrame for smoother reset
      requestAnimationFrame(() => {
        const offsetInSection = currentIndex % originalItemsCount;
        setCurrentIndex(originalItemsCount * middleSection + offsetInSection);

        resetTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          setIsResetting(false);
        }, 100);
      });
    } else if (currentIndex < lowThreshold) {
      // Reset from low section back to middle
      setIsTransitioning(true);
      setIsResetting(true);

      // Use requestAnimationFrame for smoother reset
      requestAnimationFrame(() => {
        const offsetInSection = currentIndex % originalItemsCount;
        setCurrentIndex(originalItemsCount * middleSection + offsetInSection);

        resetTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          setIsResetting(false);
        }, 100);
      });
    }
  }, [currentIndex, isInfinite, originalItemsCount, totalItems, clearAllTimeouts]);

  const goToNext = useCallback((): void => {
    setIsAutoPlaying(false);
    clearAllTimeouts();

    if (isInfinite) {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        const totalSections = Math.floor(totalItems / originalItemsCount);
        const middleSection = Math.floor(totalSections / 2);
        // Check if we need to reset (when approaching the end buffer zone)
        if (nextIndex >= originalItemsCount * (middleSection + 10)) {
          // Schedule reset after transition
          transitionTimeoutRef.current = setTimeout(handleInfiniteReset, 700);
        }
        return nextIndex;
      });
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    }
  }, [isInfinite, maxIndex, originalItemsCount, totalItems, handleInfiniteReset, clearAllTimeouts]);

  const goToPrevious = useCallback((): void => {
    setIsAutoPlaying(false);
    clearAllTimeouts();

    if (isInfinite) {
      setCurrentIndex((prev) => {
        const prevIndex = prev - 1;
        const totalSections = Math.floor(totalItems / originalItemsCount);
        const middleSection = Math.floor(totalSections / 2);
        // Check if we need to reset (when approaching the start buffer zone)
        if (prevIndex < originalItemsCount * (middleSection - 10)) {
          // Schedule reset after showing this slide
          transitionTimeoutRef.current = setTimeout(handleInfiniteReset, 700);
        }
        return prevIndex;
      });
    } else {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  }, [isInfinite, originalItemsCount, totalItems, handleInfiniteReset, clearAllTimeouts]);

  const goToIndex = useCallback((index: number): void => {
    setIsAutoPlaying(false);
    clearAllTimeouts();

    if (isInfinite) {
      setCurrentIndex(index);
    } else {
      setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    }
  }, [isInfinite, maxIndex, clearAllTimeouts]);

  const pauseAutoPlay = useCallback((): void => setIsAutoPlaying(false), []);
  const resumeAutoPlay = useCallback((): void => setIsAutoPlaying(true), []);

  // Auto-play effect with improved logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        if (isInfinite) {
          const totalSections = Math.floor(totalItems / originalItemsCount);
          const middleSection = Math.floor(totalSections / 2);
          if (nextIndex >= originalItemsCount * (middleSection + 10)) {
            // Schedule reset after transition
            transitionTimeoutRef.current = setTimeout(handleInfiniteReset, 700);
          }
        }
        return nextIndex;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlayInterval, isInfinite, originalItemsCount, totalItems, handleInfiniteReset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return {
    currentIndex,
    maxIndex,
    goToNext,
    goToPrevious,
    goToIndex,
    pauseAutoPlay,
    resumeAutoPlay,
    isAutoPlaying,
    isTransitioning,
    isResetting
  };
}
