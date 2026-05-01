'use client';

import React from 'react';
import Markdown from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-sm bg-indigo-500 text-white'
            : 'rounded-bl-sm bg-zinc-800 text-zinc-200'
        }`}
      >
        {isUser ? (
          content
        ) : (
          <Markdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-zinc-100">{children}</strong>,
              ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
              ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="rounded bg-zinc-900 px-1 py-0.5 font-mono text-xs text-zinc-300">{children}</code>
              ),
            }}
          >
            {content}
          </Markdown>
        )}
      </div>
    </div>
  );
}
