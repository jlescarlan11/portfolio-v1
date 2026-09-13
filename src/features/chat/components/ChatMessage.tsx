'use client';

import React, { memo } from 'react';
import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { NewTabNotice } from '@/shared/components/NewTabNotice';

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 text-base leading-relaxed last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-medium text-foreground">{children}</strong>,
  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 text-base last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 text-base last:mb-0">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-foreground underline decoration-foreground/30 underline-offset-2 transition-colors hover:decoration-foreground/70">
      {children}
      <NewTabNotice />
    </a>
  ),
  code: ({ children }) => (
    <code className="bg-surface-tint px-1 py-0.5 font-sans text-base text-foreground">{children}</code>
  ),
  img: ({ alt }) =>
    alt ? (
      <span className="text-base italic text-subtle-foreground">{alt}</span>
    ) : null,
};

const THINKING_DELAYS = [0, 150, 300];

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isThinking?: boolean;
}

export const ChatMessage = memo(function ChatMessage({ role, content, isThinking }: ChatMessageProps) {
  const isUser = role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center border font-sans text-base uppercase tracking-widest ${
        isUser
          ? 'border-foreground/20 bg-foreground/10 text-foreground/70'
          : 'border-foreground/15 bg-foreground/[0.06] text-subtle-foreground'
      }`}>
        {isUser ? 'You' : 'AI'}
      </span>
      <div className={`max-w-[85%] text-base leading-relaxed ${
        isUser ? 'bg-surface-tint px-3 py-2 font-sans text-base text-foreground' : 'text-muted-foreground'
      }`}>
        {isThinking ? (
          <span className="flex items-center gap-2" aria-label="Thinking">
            <span className="font-sans text-base uppercase tracking-[0.12em] text-subtle-foreground animate-pulse">thinking</span>
            {THINKING_DELAYS.map((delay, i) => (
              <span key={i} className="h-1 w-1 animate-pulse rounded-full bg-current opacity-30" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </span>
        ) : isUser ? (
          content
        ) : (
          <Markdown components={markdownComponents}>{content}</Markdown>
        )}
      </div>
    </div>
  );
});
