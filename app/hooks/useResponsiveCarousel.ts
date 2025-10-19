import { useState, useEffect } from 'react';

interface Breakpoint {
  minWidth: number;
  itemsPerView: number;
}

const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { minWidth: 1024, itemsPerView: 3 },
  { minWidth: 768, itemsPerView: 2 },
  { minWidth: 0, itemsPerView: 1 },
];

/**
 * Custom hook for managing responsive carousel layout
 * Returns the number of items to display based on viewport width
 */
export function useResponsiveCarousel(breakpoints: Breakpoint[] = DEFAULT_BREAKPOINTS) {
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (typeof window === 'undefined') return;

      const width = window.innerWidth;
      
      // Find the matching breakpoint (sorted from largest to smallest)
      const sortedBreakpoints = [...breakpoints].sort((a, b) => b.minWidth - a.minWidth);
      const matchingBreakpoint = sortedBreakpoints.find((bp) => width >= bp.minWidth);
      const newItemsPerView = matchingBreakpoint?.itemsPerView ?? 1;

      // Only update if changed to prevent unnecessary re-renders
      setItemsPerView((prev) => (prev !== newItemsPerView ? newItemsPerView : prev));
    };

    updateItemsPerView();

    // Debounce resize events for better performance
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateItemsPerView, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [breakpoints]);

  return itemsPerView;
}

