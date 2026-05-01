'use client';

import React, { useEffect, useRef, useState, FormEvent } from 'react';
import { useWebLLM, MODEL_ID } from '../hooks/useWebLLM';
import { ChatMessage } from './ChatMessage';

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const { status, progress, progressText, messages, send, initialize, isStreaming } =
    useWebLLM();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localStorage.getItem('webllm-cached') === MODEL_ID) {
      initialize();
    }
  }, [initialize]);

  const prevMsgCount = useRef(messages.length);
  useEffect(() => {
    if (!bottomRef.current) return;
    const newMessage = messages.length !== prevMsgCount.current;
    prevMsgCount.current = messages.length;
    // Use instant during streaming to avoid stacking compositor frames on top of GPU inference
    bottomRef.current.scrollIntoView({ behavior: newMessage || !isStreaming ? 'smooth' : 'instant' });
  }, [messages, isStreaming]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    await send(text);
  }

  return (
    <div className="relative flex h-[520px] w-80 flex-col overflow-hidden border border-surface bg-background shadow-2xl sm:w-96">
      {/* corner brackets */}
      <span className="pointer-events-none absolute left-2 top-2 z-10 h-4 w-4 border-l border-t border-foreground/20" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-2 right-2 z-10 h-4 w-4 border-b border-r border-foreground/20" aria-hidden="true" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-surface px-4 py-3">
        <div>
          <p className="font-serif text-sm font-semibold tracking-tight text-foreground">
            John&apos;s AI Assistant
          </p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em]">
            {status === 'ready' && <span className="text-foreground/50">● Online</span>}
            {status === 'loading' && <span className="text-subtle-foreground">Downloading...</span>}
            {status === 'unsupported' && <span className="text-subtle-foreground">Not available</span>}
            {status === 'error' && <span className="text-foreground/50">Error</span>}
            {status === 'idle' && <span className="text-subtle-foreground">Offline AI</span>}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="font-mono text-xs text-subtle-foreground transition-colors hover:text-foreground"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">

        {status === 'idle' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
            <div className="space-y-3">
              <p className="font-serif text-base font-semibold tracking-tight text-foreground">
                Run AI in your browser
              </p>
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                Downloads a{' '}
                <span className="text-foreground">~2.4 GB</span> model to your device.
                <br />
                Fully offline — nothing sent to a server.
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-subtle-foreground/50">
                Cached after first download
              </p>
            </div>
            <button
              onClick={initialize}
              className="border border-surface px-5 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground transition-colors duration-200 hover:border-foreground/40 hover:text-foreground"
            >
              Download &amp; Start
            </button>
          </div>
        )}

        {status === 'unsupported' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle-foreground">
              WebGPU required
            </p>
            <p className="font-serif text-sm text-muted-foreground">
              Open in{' '}
              <span className="text-foreground">Chrome</span> or{' '}
              <span className="text-foreground">Edge</span>{' '}
              to use this feature.
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="border border-surface px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-subtle-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              Copy link →
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
            <div className="w-full space-y-4">
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-subtle-foreground">
                Downloading model
              </p>
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-px w-full bg-foreground/10"
              >
                <div
                  className="h-full bg-foreground/60 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="truncate text-center font-mono text-[10px] text-subtle-foreground/50">
                {progressText}
              </p>
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.1em] text-subtle-foreground/40">
                First visit only — cached after this
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle-foreground">
              Error
            </p>
            <p className="font-serif text-sm text-muted-foreground">
              Failed to load the AI model. Please refresh and try again.
            </p>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  isThinking={isStreaming && i === messages.length - 1 && msg.role === 'assistant' && msg.content === ''}
                />
              ))}
              <div ref={bottomRef} />
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 border-t border-surface px-4 py-3"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isStreaming}
                className="flex-1 bg-transparent font-mono text-[12px] text-foreground placeholder:text-foreground/40 focus:outline-none disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="font-mono text-sm text-subtle-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                →
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
