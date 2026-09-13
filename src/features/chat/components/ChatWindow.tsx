'use client';

import React, { useEffect, useRef, useState, FormEvent } from 'react';
import { useOnlineChat } from '../hooks/useOnlineChat';
import { ChatMessage } from './ChatMessage';
import { CHAT_WINDOW_ID } from './chat-window-contract';

const CHAT_WINDOW_TITLE_ID = 'portfolio-chat-window-title';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia !== 'function' ||
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const {
    messages,
    send,
    retry,
    reset,
    error,
    isStreaming,
    retryBlocked
  } = useOnlineChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const prevMsgCount = useRef(messages.length);
  useEffect(() => {
    const bottom = bottomRef.current;
    const newMessage = messages.length !== prevMsgCount.current;
    prevMsgCount.current = messages.length;
    if (!bottom || typeof bottom.scrollIntoView !== 'function') return;
    bottom.scrollIntoView({
      behavior:
        prefersReducedMotion() || (!newMessage && isStreaming)
          ? 'auto'
          : 'smooth'
    });
  }, [messages, isStreaming]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    await send(text);
  }

  function handleClose(): void {
    reset();
    onClose();
  }

  function handleDialogKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>
  ): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      handleClose();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    );
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (
      event.shiftKey &&
      (active === first || !event.currentTarget.contains(active))
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (active === last || !event.currentTarget.contains(active))
    ) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      id={CHAT_WINDOW_ID}
      role="dialog"
      aria-modal="true"
      aria-labelledby={CHAT_WINDOW_TITLE_ID}
      onKeyDown={handleDialogKeyDown}
      className="relative flex h-[min(520px,calc(100dvh-7rem))] w-[calc(100vw-3rem)] max-w-80 flex-col overflow-hidden border border-surface bg-background shadow-2xl sm:w-96 sm:max-w-none"
    >
      {/* corner brackets */}
      <span className="pointer-events-none absolute left-2 top-2 z-10 h-4 w-4 border-l border-t border-foreground/20" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-2 right-2 z-10 h-4 w-4 border-b border-r border-foreground/20" aria-hidden="true" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-surface px-4 py-3">
        <div>
          <p
            id={CHAT_WINDOW_TITLE_ID}
            className="font-sans text-base font-medium tracking-tight text-foreground"
          >
            John&apos;s AI Assistant
          </p>
          <p className="mt-0.5 font-sans text-base uppercase tracking-[0.12em]">
            {isStreaming ? (
              <span className="text-subtle-foreground">● Answering</span>
            ) : error ? (
              <span className="text-subtle-foreground">● Attention</span>
            ) : (
              <span className="text-subtle-foreground">● Ready</span>
            )}
          </p>
        </div>
        <button
          onClick={handleClose}
          aria-label="Close chat"
          className="inline-flex size-11 shrink-0 items-center justify-center font-sans text-base text-subtle-foreground transition-colors hover:text-foreground"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <div
          className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-4"
          aria-live="polite"
          aria-busy={isStreaming}
        >
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              isThinking={
                isStreaming &&
                i === messages.length - 1 &&
                msg.role === 'assistant' &&
                msg.content === ''
              }
            />
          ))}
          <div ref={bottomRef} />
        </div>
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 border-t border-surface px-4 py-2"
          >
            <p className="font-sans text-base leading-relaxed text-subtle-foreground">
              {error.message}
            </p>
            {error.canRetry && (
              <button
                type="button"
                onClick={() => void retry()}
                disabled={isStreaming || retryBlocked}
                className="inline-flex min-h-11 shrink-0 items-center font-sans text-base uppercase tracking-[0.1em] text-foreground underline decoration-foreground/30 underline-offset-2 disabled:opacity-30"
              >
                Retry
              </button>
            )}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 border-t border-surface px-4 py-3"
        >
          <input
            ref={inputRef}
            type="text"
            aria-label="Ask about a project"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about a project..."
            disabled={isStreaming || retryBlocked}
            maxLength={2000}
            className="min-w-0 flex-1 bg-transparent font-sans text-base text-foreground placeholder:text-foreground/40 focus:outline-none disabled:opacity-40"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={isStreaming || retryBlocked || !input.trim()}
            className="inline-flex size-11 shrink-0 items-center justify-center font-sans text-base text-subtle-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            →
          </button>
        </form>
      </div>
    </div>
  );
}
