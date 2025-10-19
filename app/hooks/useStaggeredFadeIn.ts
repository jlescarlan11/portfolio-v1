import { useEffect, RefObject } from 'react';
import { animate, stagger } from 'motion';
import { ANIMATION_CONFIG } from '../styles/shared';

interface UseStaggeredFadeInProps {
  textRefs: RefObject<HTMLElement | null>[];
  socialRef?: RefObject<HTMLElement | null>;
  imageRef?: RefObject<HTMLElement | null>;
}

/**
 * Hook to handle staggered fade-in animations for Hero section
 * Follows SRP by separating animation logic from component rendering
 */
export function useStaggeredFadeIn({
  textRefs,
  socialRef,
  imageRef,
}: UseStaggeredFadeInProps) {
  useEffect(() => {
    const { durations, delays } = ANIMATION_CONFIG;

    // Animate text elements with stagger
    const textElements = textRefs
      .map((ref) => ref.current)
      .filter(Boolean) as HTMLElement[];

    if (textElements.length > 0) {
      animate(
        textElements,
        { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
        { duration: durations.slow, delay: stagger(delays.short) }
      );
    }

    // Animate social links
    if (socialRef?.current) {
      animate(
        socialRef.current,
        { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
        { duration: durations.slow, delay: delays.long }
      );
    }

    // Animate profile image
    if (imageRef?.current) {
      animate(
        imageRef.current,
        { opacity: [0, 1], transform: ['scale(0.9)', 'scale(1)'] },
        { duration: durations.verySlow, delay: delays.medium }
      );
    }
  }, [textRefs, socialRef, imageRef]);
}

