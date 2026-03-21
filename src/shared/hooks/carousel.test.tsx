import type { TouchEvent, WheelEvent } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCarouselNavigation } from './useCarouselNavigation';
import { useSimpleCarousel } from './useSimpleCarousel';
import { useSwipeGesture } from './useSwipeGesture';
import { useWheelNavigation } from './useWheelNavigation';

describe('carousel hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => window.setTimeout(() => callback(Date.now()), 16))
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => window.clearTimeout(id)));
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('clamps finite carousel navigation and pauses autoplay after manual navigation', () => {
    const { result } = renderHook(() =>
      useSimpleCarousel({ totalItems: 5, itemsPerView: 2, autoPlayInterval: 1000 })
    );

    expect(result.current.maxIndex).toBe(3);

    act(() => {
      result.current.goToIndex(10);
    });

    expect(result.current.currentIndex).toBe(3);
    expect(result.current.isAutoPlaying).toBe(false);

    act(() => {
      result.current.goToPrevious();
    });

    expect(result.current.currentIndex).toBe(2);
  });

  it('advances autoplay while active', () => {
    const { result } = renderHook(() =>
      useSimpleCarousel({ totalItems: 5, itemsPerView: 1, autoPlayInterval: 1000 })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it('pauses and resumes autoplay around navigation', () => {
    const pauseAutoPlay = vi.fn();
    const resumeAutoPlay = vi.fn();
    const goToNext = vi.fn();
    const goToPrevious = vi.fn();

    const { result } = renderHook(() =>
      useCarouselNavigation({
        goToNext,
        goToPrevious,
        pauseAutoPlay,
        resumeAutoPlay,
        autoPlayPauseDelay: 400
      })
    );

    act(() => {
      result.current.handleNext();
    });

    expect(pauseAutoPlay).toHaveBeenCalledTimes(1);
    expect(goToNext).toHaveBeenCalledTimes(1);
    expect(resumeAutoPlay).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(resumeAutoPlay).toHaveBeenCalledTimes(1);
  });

  it('fires swipe callbacks only when thresholds are met', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();

    const { result } = renderHook(() =>
      useSwipeGesture({
        onSwipeLeft,
        onSwipeRight,
        minSwipeDistance: 30,
        minVelocity: 0.5,
        throttleMs: 100
      })
    );

    act(() => {
      result.current.touchHandlers.onTouchStart({
        targetTouches: [{ clientX: 200 }]
      } as unknown as TouchEvent<Element>);
    });

    act(() => {
      vi.advanceTimersByTime(50);
      result.current.touchHandlers.onTouchMove({
        targetTouches: [{ clientX: 120 }]
      } as unknown as TouchEvent<Element>);
    });

    act(() => {
      result.current.touchHandlers.onTouchEnd();
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('ignores small wheel gestures and handles horizontal navigation', () => {
    const onNavigateNext = vi.fn();
    const onNavigatePrevious = vi.fn();

    const { result } = renderHook(() =>
      useWheelNavigation({
        onNavigateNext,
        onNavigatePrevious,
        minDelta: 20,
        throttleMs: 100
      })
    );

    const smallEvent = {
      deltaX: 10,
      deltaY: 0,
      preventDefault: vi.fn()
    } as unknown as WheelEvent<Element>;

    act(() => {
      result.current.handleWheel(smallEvent);
    });

    expect(onNavigateNext).not.toHaveBeenCalled();

    const largeEvent = {
      deltaX: 40,
      deltaY: 5,
      preventDefault: vi.fn()
    } as unknown as WheelEvent<Element>;

    act(() => {
      vi.advanceTimersByTime(150);
      result.current.handleWheel(largeEvent);
    });

    expect(largeEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(onNavigateNext).toHaveBeenCalledTimes(1);
    expect(onNavigatePrevious).not.toHaveBeenCalled();
  });
});
