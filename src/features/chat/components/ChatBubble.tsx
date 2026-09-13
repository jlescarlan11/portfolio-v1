'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RiRobot2Line } from 'react-icons/ri';
import { ChatWindow } from './ChatWindow';
import { CHAT_WINDOW_ID } from './chat-window-contract';

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [labelVisible, setLabelVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const restoreLauncherFocusRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      restoreLauncherFocusRef.current = true;
      return;
    }

    if (restoreLauncherFocusRef.current) {
      restoreLauncherFocusRef.current = false;
      launcherRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !rootRef.current) return;

    const background = new Set<HTMLElement>();
    let branch: HTMLElement = rootRef.current;

    while (branch.parentElement) {
      const parent = branch.parentElement;
      for (const sibling of parent.children) {
        if (sibling instanceof HTMLElement && sibling !== branch) {
          background.add(sibling);
        }
      }
      if (parent === document.body) break;
      branch = parent;
    }

    const backgroundElements = Array.from(background);
    const previous = backgroundElements.map(element => ({
      element,
      inert: element.hasAttribute('inert'),
      ariaHidden: element.getAttribute('aria-hidden')
    }));

    for (const element of backgroundElements) {
      element.setAttribute('inert', '');
      element.setAttribute('aria-hidden', 'true');
    }

    return () => {
      for (const state of previous) {
        if (state.inert) {
          state.element.setAttribute('inert', '');
        } else {
          state.element.removeAttribute('inert');
        }
        if (state.ariaHidden === null) {
          state.element.removeAttribute('aria-hidden');
        } else {
          state.element.setAttribute('aria-hidden', state.ariaHidden);
        }
      }
    };
  }, [isOpen]);

  function closeChat(): void {
    setIsOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
    >
      {isOpen && (
        <div data-testid="chat-window-wrapper">
          <ChatWindow onClose={closeChat} />
        </div>
      )}
      {!isOpen && labelVisible && (
        <div className="hidden items-center gap-1.5 border border-surface bg-background/90 py-1.5 pl-3 pr-1.5 backdrop-blur-md lg:flex">
          <span className="font-sans text-base uppercase tracking-[0.15em] text-subtle-foreground">
            Ask about John&apos;s work
          </span>
          <button
            onClick={() => setLabelVisible(false)}
            aria-label="Dismiss"
            className="inline-flex size-6 items-center justify-center font-sans text-base leading-none text-subtle-foreground/50 transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>
      )}
      {!isOpen && (
        <button
          ref={launcherRef}
          onClick={() => setIsOpen(true)}
          aria-label="Open AI chat"
          aria-controls={CHAT_WINDOW_ID}
          aria-expanded="false"
          className="relative flex h-11 w-11 items-center justify-center border border-surface bg-background/90 backdrop-blur-md transition-colors duration-300 hover:border-foreground/40 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <span className="absolute left-[3px] top-[3px] h-2.5 w-2.5 border-l border-t border-foreground/30" aria-hidden="true" />
          <span className="absolute bottom-[3px] right-[3px] h-2.5 w-2.5 border-b border-r border-foreground/30" aria-hidden="true" />
          <RiRobot2Line className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
