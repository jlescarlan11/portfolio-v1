import { useEffect, useState } from 'react';

export interface Breakpoint {
  minWidth: number;
  itemsPerView: number;
}

const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { minWidth: 1024, itemsPerView: 3 },
  { minWidth: 768, itemsPerView: 2 },
  { minWidth: 0, itemsPerView: 1 },
];

/**
 * Responsive carousel layout selector based on viewport width.
 * Complexity: O(b log b) time per resize because breakpoints are sorted, O(b) space for the copied list. Expected input size is a small breakpoint array.
 */
export function useResponsiveCarousel(
  breakpoints: Breakpoint[] = DEFAULT_BREAKPOINTS
): number {
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const updateItemsPerView = (): void => {
      if (typeof window === 'undefined') {
        return;
      }

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
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const debouncedResize = (): void => {
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

