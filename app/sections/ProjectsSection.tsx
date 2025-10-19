'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import type { Project } from '../types/project';
import { useSimpleCarousel } from '../hooks/useSimpleCarousel';
import { useFadeInAnimation } from '../hooks/useFadeInAnimation';
import { useResponsiveCarousel } from '../hooks/useResponsiveCarousel';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { useWheelNavigation } from '../hooks/useWheelNavigation';
import { useCarouselNavigation } from '../hooks/useCarouselNavigation';
import { CarouselButton } from '../components/CarouselButton';
import { ProjectCard } from '../components/ProjectCard';
import { CarouselIndicators } from '../components/CarouselIndicators';
import { LAYOUT_STYLES, TYPOGRAPHY_STYLES, ANIMATION_STYLES } from '../styles/shared';

interface ProjectsSectionProps {
  projects: Project[];
}

// Constants for infinite scroll configuration
const INFINITE_SCROLL_CONFIG = {
  copies: 50,
  autoPlayInterval: 3000,
  autoPlayPauseDelay: 1000,
} as const;

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemsPerView = useResponsiveCarousel();
  
  const startIndex = projects.length * (INFINITE_SCROLL_CONFIG.copies / 2);

  // Memoize the infinite projects array
  const infiniteProjects = useMemo(() => {
    const copies = [];
    for (let i = 0; i < INFINITE_SCROLL_CONFIG.copies; i++) {
      copies.push(...projects);
    }
    return copies;
  }, [projects]);
  
  const {
    currentIndex,
    goToNext,
    goToPrevious,
    goToIndex,
    pauseAutoPlay,
    resumeAutoPlay,
    isTransitioning,
    isResetting,
  } = useSimpleCarousel({
    totalItems: infiniteProjects.length,
    itemsPerView,
    autoPlayInterval: INFINITE_SCROLL_CONFIG.autoPlayInterval,
    initialIndex: startIndex,
    isInfinite: true,
    originalItemsCount: projects.length,
  });

  useFadeInAnimation(titleRef);

  // Extract navigation logic to separate hook (SRP)
  const { handleNext, handlePrevious } = useCarouselNavigation({
    goToNext,
    goToPrevious,
    pauseAutoPlay,
    resumeAutoPlay,
    autoPlayPauseDelay: INFINITE_SCROLL_CONFIG.autoPlayPauseDelay,
  });

  const { touchHandlers, mouseHandlers, isDragging, hasActiveTouch } = useSwipeGesture({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
  });

  const { handleWheel } = useWheelNavigation({
    onNavigateNext: handleNext,
    onNavigatePrevious: handlePrevious,
  });

  // Add native event listeners to prevent browser navigation
  useEffect(() => {
    const carouselElement = carouselRef.current;
    if (!carouselElement) return;

    const handleNativeWheel = (e: WheelEvent) => {
      const isHorizontalSwipe = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (isHorizontalSwipe && Math.abs(e.deltaX) > 10) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleNativeTouchMove = (e: TouchEvent) => {
      if (hasActiveTouch) {
        const target = e.target as HTMLElement;
        if (carouselElement.contains(target)) {
          e.preventDefault();
        }
      }
    };

    carouselElement.addEventListener('wheel', handleNativeWheel, { passive: false });
    carouselElement.addEventListener('touchmove', handleNativeTouchMove, { passive: false });

    return () => {
      carouselElement.removeEventListener('wheel', handleNativeWheel);
      carouselElement.removeEventListener('touchmove', handleNativeTouchMove);
    };
  }, [hasActiveTouch]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrevious();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  }, [handleNext, handlePrevious]);

  const isNavigationDisabled = projects.length <= itemsPerView;

  return (
    <section 
      id="work"
      className="min-h-screen px-6 md:px-12 py-16 md:py-24 bg-black border-t border-gray-900"
      style={{ 
        scrollPaddingTop: '120px',
        overscrollBehaviorX: 'none', // Prevent horizontal overscroll at section level
      }}
      aria-label="Projects section"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      <div className={LAYOUT_STYLES.container}>
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 pt-8 sm:pt-12">
          <h2 
            ref={titleRef}
            className={TYPOGRAPHY_STYLES.sectionTitle}
            style={ANIMATION_STYLES.fadeInOpacity}
          >
            Works
          </h2>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Projects carousel"
          aria-live="polite"
          aria-atomic="false"
        >
          {/* Navigation Arrows */}
          <div className="flex items-center justify-between -mb-6 relative z-20">
            <CarouselButton 
              direction="prev" 
              onClick={handlePrevious} 
              disabled={isNavigationDisabled} 
            />
            
            <div className="flex-1" />
            
            <CarouselButton 
              direction="next" 
              onClick={handleNext} 
              disabled={isNavigationDisabled} 
            />
          </div>

          {/* Screen reader announcement */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {`Showing project ${(currentIndex % projects.length) + 1} of ${projects.length}`}
          </div>

          {/* Carousel Track */}
          <div
            ref={carouselRef}
            className="overflow-hidden w-full max-w-4xl mx-auto"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              touchAction: 'pan-y',
              overscrollBehaviorX: 'none',
              overscrollBehavior: 'none',
            }}
            {...touchHandlers}
            {...mouseHandlers}
            onWheel={handleWheel}
          >
            <div 
              className="flex"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                transition: isResetting ? 'none' : (isTransitioning ? 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)'),
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
            >
              {infiniteProjects.map((project, index) => (
                <div
                  key={`${project.id}-${index}`}
                  className="flex-shrink-0"
                  style={{
                    width: `${100 / itemsPerView}%`,
                  }}
                >
                  <ProjectCard
                    project={project}
                    isActive={
                      index >= currentIndex &&
                      index < currentIndex + itemsPerView
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <CarouselIndicators
          projects={projects}
          currentIndex={currentIndex % projects.length}
          onIndicatorClick={(index) => {
            pauseAutoPlay();
            const targetIndex = projects.length * (INFINITE_SCROLL_CONFIG.copies / 2) + index;
            goToIndex(targetIndex);
          }}
        />
      </div>
    </section>
  );
}

