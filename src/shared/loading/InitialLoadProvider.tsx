'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef
} from 'react';
import type { ReactNode } from 'react';
import {
  createInitialLoadState,
  getInitialLoadSnapshot,
  initialLoadReducer,
  INITIAL_LOAD_TIMEOUT_MS
} from './initial-load-state';
import type {
  InitialLoadMilestone,
  InitialLoadSnapshot
} from './initial-load-state';

export interface InitialLoadContextValue extends InitialLoadSnapshot {
  settleMilestone: (milestone: InitialLoadMilestone) => void;
}

const InitialLoadContext = createContext<InitialLoadContextValue | null>(null);

interface InitialLoadProviderProps {
  children: ReactNode;
}

export function InitialLoadProvider({
  children
}: InitialLoadProviderProps): React.JSX.Element {
  const [state, dispatch] = useReducer(
    initialLoadReducer,
    undefined,
    createInitialLoadState
  );
  const timeoutRef = useRef<number | null>(null);

  const settleMilestone = useCallback((milestone: InitialLoadMilestone): void => {
    dispatch({ type: 'settle', milestone });
  }, []);

  useEffect(() => {
    settleMilestone('hydration');
  }, [settleMilestone]);

  useEffect(() => {
    let active = true;
    let fontsReady: Promise<FontFaceSet> | undefined;

    try {
      fontsReady = document.fonts?.ready;
    } catch {
      settleMilestone('fonts');
      return;
    }

    if (!fontsReady) {
      settleMilestone('fonts');
      return;
    }

    void Promise.resolve(fontsReady).then(
      () => {
        if (active) {
          settleMilestone('fonts');
        }
      },
      () => {
        if (active) {
          settleMilestone('fonts');
        }
      }
    );

    return () => {
      active = false;
    };
  }, [settleMilestone]);

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      dispatch({ type: 'timeout' });
      timeoutRef.current = null;
    }, INITIAL_LOAD_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (state.status !== 'loading' && timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [state.status]);

  const value = useMemo<InitialLoadContextValue>(
    () => ({
      ...getInitialLoadSnapshot(state),
      settleMilestone
    }),
    [settleMilestone, state]
  );

  return (
    <InitialLoadContext.Provider value={value}>
      {children}
    </InitialLoadContext.Provider>
  );
}

export function useInitialLoad(): InitialLoadContextValue {
  const context = useContext(InitialLoadContext);

  if (!context) {
    throw new Error('useInitialLoad must be used within an InitialLoadProvider.');
  }

  return context;
}

export function useOptionalInitialLoad(): InitialLoadContextValue | null {
  return useContext(InitialLoadContext);
}
