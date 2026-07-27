'use client';

import React, { useEffect, useRef, useState, FormEvent } from 'react';
import { useOnlineChat } from '../hooks/useOnlineChat';
import { ChatMessage } from './ChatMessage';
import { CHAT_WINDOW_ID } from './chat-window-contract';

const CHAT_WINDOW_TITLE_ID = 'portfolio-chat-window-title';

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
      behavior: newMessage || !isStreaming ? 'smooth' : 'auto'
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

  return (
    <div
      id={CHAT_WINDOW_ID}
      role="dialog"
      aria-labelledby={CHAT_WINDOW_TITLE_ID}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          handleClose();
        }
      }}
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
            className="font-serif text-sm font-semibold tracking-tight text-foreground"
          >
            John&apos;s AI Assistant
          </p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em]">
            {isStreaming ? (
              <span className="text-foreground/50">● Answering</span>
            ) : error ? (
              <span className="text-subtle-foreground">● Attention</span>
            ) : (
              <span className="text-foreground/50">● Online</span>
            )}
          </p>
        </div>
        <button
          onClick={handleClose}
          aria-label="Close chat"
          className="font-mono text-xs text-subtle-foreground transition-colors hover:text-foreground"
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
            <p className="font-mono text-[10px] leading-relaxed text-subtle-foreground">
              {error.message}
            </p>
            {error.canRetry && (
              <button
                type="button"
                onClick={() => void retry()}
                disabled={isStreaming || retryBlocked}
                className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-foreground underline decoration-foreground/30 underline-offset-2 disabled:opacity-30"
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
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isStreaming || retryBlocked}
            maxLength={2000}
            className="flex-1 bg-transparent font-mono text-[12px] text-foreground placeholder:text-foreground/40 focus:outline-none disabled:opacity-40"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={isStreaming || retryBlocked || !input.trim()}
            className="font-mono text-sm text-subtle-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            →
          </button>
        </form>
      </div>
    </div>
  );
}
