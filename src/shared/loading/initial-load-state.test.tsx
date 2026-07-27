import { describe, expect, it } from 'vitest';
import {
  createInitialLoadState,
  getInitialLoadSnapshot,
  initialLoadReducer,
  INITIAL_LOAD_MILESTONES
} from './initial-load-state';

describe('initialLoadReducer', () => {
  it('starts with exactly the required landing-page milestones pending', () => {
    const snapshot = getInitialLoadSnapshot(createInitialLoadState());

    expect(snapshot.status).toBe('loading');
    expect(snapshot.completedMilestones).toEqual([]);
    expect(snapshot.pendingMilestones).toEqual(INITIAL_LOAD_MILESTONES);
    expect(snapshot.completedCount).toBe(0);
    expect(snapshot.totalCount).toBe(3);
    expect(snapshot.progress).toBe(0);
    expect(snapshot.isBlocking).toBe(true);
  });

  it('derives progress only from unique settled milestones', () => {
    const initial = createInitialLoadState();
    const afterHydration = initialLoadReducer(initial, {
      type: 'settle',
      milestone: 'hydration'
    });
    const afterDuplicate = initialLoadReducer(afterHydration, {
      type: 'settle',
      milestone: 'hydration'
    });
    const snapshot = getInitialLoadSnapshot(afterDuplicate);

    expect(snapshot.completedMilestones).toEqual(['hydration']);
    expect(snapshot.pendingMilestones).toEqual(['fonts', 'hero-image']);
    expect(snapshot.completedCount).toBe(1);
    expect(snapshot.progress).toBe(1 / 3);
    expect(afterDuplicate).toBe(afterHydration);
  });

  it('reaches ready only after every milestone settles', () => {
    const afterHydration = initialLoadReducer(createInitialLoadState(), {
      type: 'settle',
      milestone: 'hydration'
    });
    const afterFonts = initialLoadReducer(afterHydration, {
      type: 'settle',
      milestone: 'fonts'
    });
    const ready = initialLoadReducer(afterFonts, {
      type: 'settle',
      milestone: 'hero-image'
    });

    expect(afterFonts.status).toBe('loading');
    expect(getInitialLoadSnapshot(afterFonts).progress).toBe(2 / 3);
    expect(ready.status).toBe('ready');
    expect(getInitialLoadSnapshot(ready).progress).toBe(1);
  });

  it('keeps ready and timed-out states terminal', () => {
    const ready = INITIAL_LOAD_MILESTONES.reduce(
      (state, milestone) => initialLoadReducer(state, { type: 'settle', milestone }),
      createInitialLoadState()
    );
    const readyAfterTimeout = initialLoadReducer(ready, { type: 'timeout' });

    const timedOut = initialLoadReducer(createInitialLoadState(), { type: 'timeout' });
    const timedOutAfterSettle = initialLoadReducer(timedOut, {
      type: 'settle',
      milestone: 'hydration'
    });

    expect(readyAfterTimeout).toBe(ready);
    expect(readyAfterTimeout.status).toBe('ready');
    expect(timedOutAfterSettle).toBe(timedOut);
    expect(timedOutAfterSettle.status).toBe('timed-out');
    expect(getInitialLoadSnapshot(timedOutAfterSettle).completedCount).toBe(0);
  });
});
