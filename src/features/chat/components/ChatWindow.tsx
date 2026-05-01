'use client';

import React, { useEffect, useRef, useState, FormEvent } from 'react';
import { useWebLLM } from '../hooks/useWebLLM';
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
    if (bottomRef.current?.scrollIntoView) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    await send(text);
  }

  return (
    <div className="flex h-[480px] w-80 flex-col rounded-t-xl border border-zinc-700/50 bg-zinc-900 shadow-2xl sm:w-96">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-zinc-100">John&apos;s AI Assistant</p>
          <p className="text-xs">
            {status === 'ready' && <span className="text-emerald-400">● Ready</span>}
            {status === 'loading' && (
              <span className="text-zinc-500">Loading model...</span>
            )}
            {status === 'unsupported' && (
              <span className="text-zinc-500">Not available</span>
            )}
            {status === 'error' && <span className="text-red-400">Error</span>}
            {status === 'idle' && <span className="text-zinc-500">Offline AI</span>}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="text-zinc-500 hover:text-zinc-300"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {status === 'idle' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <span className="text-4xl">🤖</span>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-200">Run AI in your browser</p>
              <p className="text-xs text-zinc-400">
                This downloads a <strong className="text-zinc-300">~2.4 GB</strong> AI model to your device.
                It runs fully offline — nothing is sent to a server.
              </p>
              <p className="text-xs text-zinc-600">Cached after the first download.</p>
            </div>
            <button
              onClick={initialize}
              className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
            >
              Download &amp; Start
            </button>
          </div>
        )}

        {status === 'unsupported' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="text-3xl">⚠️</span>
            <p className="text-sm text-zinc-400">
              This feature requires{' '}
              <strong className="text-zinc-200">WebGPU</strong>. Please open in{' '}
              <strong className="text-zinc-200">Chrome</strong> or{' '}
              <strong className="text-zinc-200">Edge</strong> to chat.
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-indigo-400 hover:border-indigo-500"
            >
              Copy link →
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <span className="text-4xl">🤖</span>
            <div className="w-full space-y-2">
              <p className="text-center text-xs text-zinc-500">
                Downloading AI model
                <br />
                <span className="text-zinc-600">First visit only — cached after this</span>
              </p>
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1 w-full overflow-hidden rounded-full bg-zinc-800"
              >
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-xs text-zinc-600">{progressText}</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="text-3xl">❌</span>
            <p className="text-sm text-zinc-400">
              Failed to load the AI model. Please refresh and try again.
            </p>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
              <div ref={bottomRef} />
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex gap-2 border-t border-zinc-800 p-3"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isStreaming}
                className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="rounded-md bg-indigo-500 px-3 py-2 text-sm text-white hover:bg-indigo-600 disabled:opacity-50"
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
