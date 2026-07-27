export const INITIAL_LOAD_MILESTONES = [
  'hydration',
  'fonts',
  'hero-image'
] as const;

export const INITIAL_LOAD_TIMEOUT_MS = 10_000;

export type InitialLoadMilestone = (typeof INITIAL_LOAD_MILESTONES)[number];
export type InitialLoadStatus = 'loading' | 'ready' | 'timed-out';

export interface InitialLoadState {
  status: InitialLoadStatus;
  settled: Record<InitialLoadMilestone, boolean>;
}

export type InitialLoadAction =
  | {
      type: 'settle';
      milestone: InitialLoadMilestone;
    }
  | {
      type: 'timeout';
    };

export interface InitialLoadSnapshot {
  status: InitialLoadStatus;
  completedMilestones: InitialLoadMilestone[];
  pendingMilestones: InitialLoadMilestone[];
  completedCount: number;
  totalCount: number;
  progress: number;
  isBlocking: boolean;
}

export function createInitialLoadState(): InitialLoadState {
  return {
    status: 'loading',
    settled: {
      hydration: false,
      fonts: false,
      'hero-image': false
    }
  };
}

export function initialLoadReducer(
  state: InitialLoadState,
  action: InitialLoadAction
): InitialLoadState {
  if (state.status !== 'loading') {
    return state;
  }

  if (action.type === 'timeout') {
    return {
      ...state,
      status: 'timed-out'
    };
  }

  if (state.settled[action.milestone]) {
    return state;
  }

  const settled = {
    ...state.settled,
    [action.milestone]: true
  };
  const ready = INITIAL_LOAD_MILESTONES.every((milestone) => settled[milestone]);

  return {
    settled,
    status: ready ? 'ready' : 'loading'
  };
}

export function getInitialLoadSnapshot(state: InitialLoadState): InitialLoadSnapshot {
  const completedMilestones = INITIAL_LOAD_MILESTONES.filter(
    (milestone) => state.settled[milestone]
  );
  const pendingMilestones = INITIAL_LOAD_MILESTONES.filter(
    (milestone) => !state.settled[milestone]
  );
  const totalCount = INITIAL_LOAD_MILESTONES.length;
  const completedCount = completedMilestones.length;

  return {
    status: state.status,
    completedMilestones,
    pendingMilestones,
    completedCount,
    totalCount,
    progress: completedCount / totalCount,
    isBlocking: state.status === 'loading'
  };
}
