'use client';

import React, {
  useEffect,
  useState
} from 'react';
import type { ReactNode } from 'react';
import WelcomeOverlay from '@/shared/components/WelcomeOverlay';
import {
  InitialLoadProvider,
  useInitialLoad
} from '@/shared/loading';

const INITIAL_PATH_ATTRIBUTE = 'initialPath';
const INITIAL_LOAD_CONSUMED_ATTRIBUTE = 'initialLoadConsumed';
const GLOBAL_INTERACTIONS_SELECTOR = '[data-initial-load-global]';

interface InitialLoadWindow extends Window {
  __portfolioInitialPath?: string;
  __portfolioInitialLoadConsumed?: boolean;
}

interface InitialLoadExperienceProps {
  children: ReactNode;
}

function shouldRunInitialLoad(): boolean {
  if (typeof document === 'undefined') {
    return true;
  }

  const root = document.documentElement;
  const browserWindow = window as InitialLoadWindow;
  const initialPath =
    browserWindow.__portfolioInitialPath ??
    root.dataset[INITIAL_PATH_ATTRIBUTE] ??
    window.location.pathname;
  return (
    initialPath === '/' &&
    browserWindow.__portfolioInitialLoadConsumed !== true
  );
}

function InitialLoadGate({ children }: InitialLoadExperienceProps): React.JSX.Element {
  const { isBlocking } = useInitialLoad();
  const [enhanced, setEnhanced] = useState(false);
  const shouldHideContent = enhanced && isBlocking;

  useEffect(() => {
    setEnhanced(true);
  }, []);

  useEffect(() => {
    if (!shouldHideContent) {
      return;
    }

    const globalInteractions = document.querySelector<HTMLElement>(
      GLOBAL_INTERACTIONS_SELECTOR
    );
    if (!globalInteractions) {
      return;
    }

    const previouslyInert = globalInteractions.hasAttribute('inert');
    const previousAriaHidden = globalInteractions.getAttribute('aria-hidden');
    globalInteractions.setAttribute('inert', '');
    globalInteractions.setAttribute('aria-hidden', 'true');

    return () => {
      if (previouslyInert) {
        globalInteractions.setAttribute('inert', '');
      } else {
        globalInteractions.removeAttribute('inert');
      }
      if (previousAriaHidden === null) {
        globalInteractions.removeAttribute('aria-hidden');
      } else {
        globalInteractions.setAttribute('aria-hidden', previousAriaHidden);
      }
    };
  }, [shouldHideContent]);

  return (
    <>
      <WelcomeOverlay />
      <div
        data-initial-load-content
        inert={shouldHideContent ? true : undefined}
        aria-hidden={shouldHideContent ? true : undefined}
      >
        {children}
      </div>
      <noscript>
        <style>{'.initial-load-overlay{display:none!important}'}</style>
      </noscript>
    </>
  );
}

export default function InitialLoadExperience({
  children
}: InitialLoadExperienceProps): React.JSX.Element {
  const [runInitialLoad] = useState(shouldRunInitialLoad);

  useEffect(() => {
    if (runInitialLoad) {
      (window as InitialLoadWindow).__portfolioInitialLoadConsumed = true;
      document.documentElement.dataset[INITIAL_LOAD_CONSUMED_ATTRIBUTE] = 'true';
    }
  }, [runInitialLoad]);

  if (!runInitialLoad) {
    return <>{children}</>;
  }

  return (
    <InitialLoadProvider>
      <InitialLoadGate>{children}</InitialLoadGate>
    </InitialLoadProvider>
  );
}
