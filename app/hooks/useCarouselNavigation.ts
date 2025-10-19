import { useCallback } from 'react';

interface UseCarouselNavigationProps {
  goToNext: () => void;
  goToPrevious: () => void;
  pauseAutoPlay: () => void;
  resumeAutoPlay: () => void;
  autoPlayPauseDelay?: number;
}

/**
 * Hook to manage carousel navigation with auto-play pause/resume
 * Follows SRP by separating navigation logic from carousel state management
 */
export function useCarouselNavigation({
  goToNext,
  goToPrevious,
  pauseAutoPlay,
  resumeAutoPlay,
  autoPlayPauseDelay = 1000,
}: UseCarouselNavigationProps) {
  const handleNavigationWithAutoPlay = useCallback(
    (navigationFn: () => void) => {
      pauseAutoPlay();
      navigationFn();
      setTimeout(() => resumeAutoPlay(), autoPlayPauseDelay);
    },
    [pauseAutoPlay, resumeAutoPlay, autoPlayPauseDelay]
  );

  const handleNext = useCallback(() => {
    handleNavigationWithAutoPlay(goToNext);
  }, [handleNavigationWithAutoPlay, goToNext]);

  const handlePrevious = useCallback(() => {
    handleNavigationWithAutoPlay(goToPrevious);
  }, [handleNavigationWithAutoPlay, goToPrevious]);

  return {
    handleNext,
    handlePrevious,
    handleNavigationWithAutoPlay,
  };
}

