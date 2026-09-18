'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RiCloseLine, RiFocus3Line, RiRobot2Line } from 'react-icons/ri';
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
        <div className="hidden h-11 items-center rounded-xl border border-surface bg-background lg:flex">
          <span className="px-4 font-sans text-base uppercase tracking-[0.15em] text-subtle-foreground">
            Ask about John&apos;s work
          </span>
          <button
            onClick={() => setLabelVisible(false)}
            aria-label="Dismiss"
            className="mr-2 inline-flex size-6 items-center justify-center rounded-md text-subtle-foreground/60 transition-colors hover:bg-surface-tint hover:text-foreground"
          >
            <RiCloseLine className="size-5" aria-hidden="true" />
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
          className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-surface bg-background transition-colors duration-300 hover:border-foreground/50 hover:bg-surface-tint focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <RiFocus3Line className="absolute size-8 text-foreground/25" aria-hidden="true" />
          <RiRobot2Line className="relative size-4 text-muted-foreground" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
