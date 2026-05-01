'use client';

import React, { useState } from 'react';
import { ChatWindow } from './ChatWindow';

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  function toggle() {
    if (!hasOpened) setHasOpened(true);
    setIsOpen(prev => !prev);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Keep ChatWindow mounted after first open so the model stays loaded */}
      {hasOpened && (
        <div data-testid="chat-window-wrapper" className={isOpen ? 'block' : 'hidden'}>
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}
      {!isOpen && (
        <span className="rounded-lg border border-zinc-700/50 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-400 backdrop-blur-sm">
          Ask me about John ✨
        </span>
      )}
      <button
        onClick={toggle}
        aria-label="Open AI chat"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-xl text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
      >
        💬
      </button>
    </div>
  );
}
