'use client';

import React, { useEffect, useRef, useState, FormEvent } from 'react';
import {
  RiCheckboxBlankCircleFill,
  RiCloseLine,
  RiSendPlaneLine
} from 'react-icons/ri';
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
      className="relative flex h-[min(560px,calc(100dvh-7rem))] w-[calc(100vw-3rem)] max-w-none flex-col overflow-hidden rounded-2xl border border-surface-strong bg-background shadow-[0_16px_50px_rgba(0,0,0,0.16)] sm:w-96"
    >
      {/* Header */}
      <div className="relative z-10 flex min-h-24 items-center justify-between border-b border-surface px-5 py-4">
        <div>
          <p className="mb-1 font-sans text-base uppercase tracking-[0.14em] text-subtle-foreground">
            AI portfolio guide
          </p>
          <p
            id={CHAT_WINDOW_TITLE_ID}
            className="font-sans text-base font-medium tracking-tight text-foreground"
          >
            John&apos;s AI Assistant
          </p>
          <p className="mt-1 font-sans text-base uppercase tracking-[0.12em]">
            {isStreaming ? (
              <span className="inline-flex items-center gap-2 text-subtle-foreground">
                <RiCheckboxBlankCircleFill className="size-2" aria-hidden="true" />
                Answering
              </span>
            ) : error ? (
              <span className="inline-flex items-center gap-2 text-subtle-foreground">
                <RiCheckboxBlankCircleFill className="size-2" aria-hidden="true" />
                Attention
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-subtle-foreground">
                <RiCheckboxBlankCircleFill className="size-2" aria-hidden="true" />
                Ready
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleClose}
          aria-label="Close chat"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-subtle-foreground transition-colors hover:bg-surface-tint hover:text-foreground"
        >
          <RiCloseLine className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Body */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <div
          className="no-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-5"
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
            className="mx-5 mb-3 flex items-center justify-between gap-3 rounded-xl border border-surface px-4 py-2"
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
          className="mx-5 mb-5 flex min-h-14 items-center overflow-hidden rounded-xl border border-surface-strong bg-background pl-4 transition-colors focus-within:border-foreground"
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
            className="chat-input min-w-0 flex-1 bg-transparent py-3 font-sans text-base text-foreground placeholder:text-foreground/40 disabled:opacity-40"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={isStreaming || retryBlocked || !input.trim()}
            className="inline-flex size-11 shrink-0 items-center justify-center border-l border-surface text-subtle-foreground transition-colors hover:bg-foreground hover:text-background disabled:bg-transparent disabled:text-subtle-foreground disabled:opacity-30"
          >
            <RiSendPlaneLine className="size-5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
