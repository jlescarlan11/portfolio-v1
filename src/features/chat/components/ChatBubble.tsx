'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { RiRobot2Line } from 'react-icons/ri';
import { CHAT_WINDOW_ID } from './chat-window-contract';

const ChatWindow = dynamic(
  () => import('./ChatWindow').then(module => module.ChatWindow),
  { ssr: false }
);

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [labelVisible, setLabelVisible] = useState(true);
  const launcherRef = useRef<HTMLButtonElement>(null);

  function toggle(): void {
    setIsOpen(prev => !prev);
  }

  function closeChat(): void {
    setIsOpen(false);
    launcherRef.current?.focus();
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div data-testid="chat-window-wrapper">
          <ChatWindow onClose={closeChat} />
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
            className="inline-flex size-6 items-center justify-center font-mono text-[10px] leading-none text-subtle-foreground/50 transition-colors hover:text-foreground"
          >
            ✕
          </button>
        </div>
      )}
      <button
        ref={launcherRef}
        onClick={toggle}
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
        aria-controls={CHAT_WINDOW_ID}
        aria-expanded={isOpen}
        className="relative flex h-11 w-11 items-center justify-center border border-surface bg-background/90 backdrop-blur-md transition-colors duration-300 hover:border-foreground/40 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <span className="absolute left-[3px] top-[3px] h-2.5 w-2.5 border-l border-t border-foreground/30" aria-hidden="true" />
        <span className="absolute bottom-[3px] right-[3px] h-2.5 w-2.5 border-b border-r border-foreground/30" aria-hidden="true" />
        <RiRobot2Line className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </button>
    </div>
  );
}
