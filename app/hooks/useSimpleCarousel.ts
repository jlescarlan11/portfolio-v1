import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSimpleCarouselProps {
  totalItems: number;
  itemsPerView: number;
  autoPlayInterval?: number;
  initialIndex?: number;
  isInfinite?: boolean;
  originalItemsCount?: number;
}

export function useSimpleCarousel({ 
  totalItems, 
  itemsPerView, 
  autoPlayInterval = 3000,
  initialIndex = 0,
  isInfinite = false,
  originalItemsCount = 0
}: UseSimpleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const maxIndex = Math.max(0, totalItems - itemsPerView);

  // Clean up timeouts
  const clearAllTimeouts = useCallback(() => {
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
  const handleInfiniteReset = useCallback(() => {
    if (!isInfinite || !originalItemsCount) return;

    clearAllTimeouts();
    
    const TOTAL_SECTIONS = Math.floor(totalItems / originalItemsCount);
    const MIDDLE_SECTION = Math.floor(TOTAL_SECTIONS / 2);
    const HIGH_THRESHOLD = originalItemsCount * (MIDDLE_SECTION + 10); // Reset when 10 sections ahead
    const LOW_THRESHOLD = originalItemsCount * (MIDDLE_SECTION - 10); // Reset when 10 sections behind
    
    if (currentIndex >= HIGH_THRESHOLD) {
      // Reset from high section back to middle
      setIsTransitioning(true);
      setIsResetting(true);
      
      // Use requestAnimationFrame for smoother reset
      requestAnimationFrame(() => {
        const offsetInSection = currentIndex % originalItemsCount;
        setCurrentIndex(originalItemsCount * MIDDLE_SECTION + offsetInSection);
        
        resetTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          setIsResetting(false);
        }, 100);
      });
    } else if (currentIndex < LOW_THRESHOLD) {
      // Reset from low section back to middle
      setIsTransitioning(true);
      setIsResetting(true);
      
      // Use requestAnimationFrame for smoother reset
      requestAnimationFrame(() => {
        const offsetInSection = currentIndex % originalItemsCount;
        setCurrentIndex(originalItemsCount * MIDDLE_SECTION + offsetInSection);
        
        resetTimeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
          setIsResetting(false);
        }, 100);
      });
    }
  }, [currentIndex, isInfinite, originalItemsCount, totalItems, clearAllTimeouts]);

  const goToNext = useCallback(() => {
    setIsAutoPlaying(false);
    clearAllTimeouts();
    
    if (isInfinite) {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        const TOTAL_SECTIONS = Math.floor(totalItems / originalItemsCount);
        const MIDDLE_SECTION = Math.floor(TOTAL_SECTIONS / 2);
        // Check if we need to reset (when approaching the end buffer zone)
        if (nextIndex >= originalItemsCount * (MIDDLE_SECTION + 10)) {
          // Schedule reset after transition
          transitionTimeoutRef.current = setTimeout(handleInfiniteReset, 700);
        }
        return nextIndex;
      });
    } else {
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    }
  }, [isInfinite, maxIndex, originalItemsCount, totalItems, handleInfiniteReset, clearAllTimeouts]);

  const goToPrevious = useCallback(() => {
    setIsAutoPlaying(false);
    clearAllTimeouts();
    
    if (isInfinite) {
      setCurrentIndex((prev) => {
        const prevIndex = prev - 1;
        const TOTAL_SECTIONS = Math.floor(totalItems / originalItemsCount);
        const MIDDLE_SECTION = Math.floor(TOTAL_SECTIONS / 2);
        // Check if we need to reset (when approaching the start buffer zone)
        if (prevIndex < originalItemsCount * (MIDDLE_SECTION - 10)) {
          // Schedule reset after showing this slide
          transitionTimeoutRef.current = setTimeout(handleInfiniteReset, 700);
        }
        return prevIndex;
      });
    } else {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  }, [isInfinite, originalItemsCount, totalItems, handleInfiniteReset, clearAllTimeouts]);

  const goToIndex = useCallback((index: number) => {
    setIsAutoPlaying(false);
    clearAllTimeouts();
    
    if (isInfinite) {
      setCurrentIndex(index);
    } else {
      setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    }
  }, [isInfinite, maxIndex, clearAllTimeouts]);

  const pauseAutoPlay = useCallback(() => setIsAutoPlaying(false), []);
  const resumeAutoPlay = useCallback(() => setIsAutoPlaying(true), []);

  // Auto-play effect with improved logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        if (isInfinite) {
          const TOTAL_SECTIONS = Math.floor(totalItems / originalItemsCount);
          const MIDDLE_SECTION = Math.floor(TOTAL_SECTIONS / 2);
          if (nextIndex >= originalItemsCount * (MIDDLE_SECTION + 10)) {
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
