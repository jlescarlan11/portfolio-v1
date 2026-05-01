'use client';

import React, { useState } from 'react';
import { RiRobot2Line } from 'react-icons/ri';
import { ChatWindow } from './ChatWindow';

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [labelVisible, setLabelVisible] = useState(true);

  function toggle() {
    if (!hasOpened) setHasOpened(true);
    setIsOpen(prev => !prev);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {hasOpened && (
        <div data-testid="chat-window-wrapper" className={isOpen ? 'block' : 'hidden'}>
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}
      {!isOpen && labelVisible && (
        <div className="flex items-center gap-1.5 border border-surface bg-background/90 pl-3 pr-1.5 py-1.5 backdrop-blur-md">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-subtle-foreground">
            Ask me about John
          </span>
          <button
            onClick={() => setLabelVisible(false)}
            aria-label="Dismiss"
            className="font-mono text-[10px] text-subtle-foreground/50 transition-colors hover:text-foreground leading-none"
          >
            ✕
          </button>
        </div>
      )}
      <button
        onClick={toggle}
        aria-label="Open AI chat"
        className="relative flex h-11 w-11 items-center justify-center border border-surface bg-background/90 backdrop-blur-md transition-colors duration-300 hover:border-foreground/40 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <span className="absolute left-[3px] top-[3px] h-2.5 w-2.5 border-l border-t border-foreground/30" aria-hidden="true" />
        <span className="absolute bottom-[3px] right-[3px] h-2.5 w-2.5 border-b border-r border-foreground/30" aria-hidden="true" />
        <RiRobot2Line className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </button>
    </div>
  );
}
