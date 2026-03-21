import { useCallback, useEffect, useRef } from 'react';

interface UseCarouselNavigationProps {
  goToNext: () => void;
  goToPrevious: () => void;
  pauseAutoPlay: () => void;
  resumeAutoPlay: () => void;
  autoPlayPauseDelay?: number;
}

interface UseCarouselNavigationResult {
  handleNext: () => void;
  handlePrevious: () => void;
  handleNavigationWithAutoPlay: (navigationFn: () => void) => void;
}

/**
 * Hook to coordinate carousel navigation with autoplay pause/resume.
 * Complexity: O(1) time and O(1) space per navigation. Expected input size is one navigation action at a time.
 */
export function useCarouselNavigation({
  goToNext,
  goToPrevious,
  pauseAutoPlay,
  resumeAutoPlay,
  autoPlayPauseDelay = 1000,
}: UseCarouselNavigationProps): UseCarouselNavigationResult {
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResumeTimeout = useCallback((): void => {
    if (resumeTimeoutRef.current !== null) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const handleNavigationWithAutoPlay = useCallback(
    (navigationFn: () => void): void => {
      pauseAutoPlay();
      clearResumeTimeout();
      navigationFn();
      resumeTimeoutRef.current = setTimeout(() => {
        resumeAutoPlay();
        resumeTimeoutRef.current = null;
      }, autoPlayPauseDelay);
    },
    [autoPlayPauseDelay, clearResumeTimeout, pauseAutoPlay, resumeAutoPlay]
  );

  const handleNext = useCallback((): void => {
    handleNavigationWithAutoPlay(goToNext);
  }, [handleNavigationWithAutoPlay, goToNext]);

  const handlePrevious = useCallback((): void => {
    handleNavigationWithAutoPlay(goToPrevious);
  }, [handleNavigationWithAutoPlay, goToPrevious]);

  useEffect(() => clearResumeTimeout, [clearResumeTimeout]);

  return {
    handleNext,
    handlePrevious,
    handleNavigationWithAutoPlay,
  };
}

