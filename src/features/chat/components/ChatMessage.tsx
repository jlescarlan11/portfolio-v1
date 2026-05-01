'use client';

import React from 'react';
import Markdown from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isThinking?: boolean;
}

export function ChatMessage({ role, content, isThinking }: ChatMessageProps) {
  const isUser = role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center border font-mono text-[9px] uppercase tracking-widest ${
        isUser
          ? 'border-foreground/20 bg-foreground/10 text-foreground/70'
          : 'border-foreground/15 bg-foreground/[0.06] text-foreground/50'
      }`}>
        {isUser ? 'You' : 'AI'}
      </span>
      <div
        className={`max-w-[85%] text-sm leading-relaxed ${
          isUser
            ? 'bg-surface-tint px-3 py-2 font-mono text-[12px] text-foreground'
            : 'text-muted-foreground'
        }`}
      >
        {isThinking ? (
          <span className="flex items-center gap-1" aria-label="Thinking">
            {[0, 160, 320].map((delay, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-current opacity-40"
                style={{ animation: `pulse 1.2s ease-in-out ${delay}ms infinite` }}
              />
            ))}
          </span>
        ) : isUser ? (
          content
        ) : (
          <Markdown
            components={{
              p: ({ children }) => <p className="mb-2 text-[13px] leading-relaxed last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 text-[13px] last:mb-0">{children}</ul>,
              ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 text-[13px] last:mb-0">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline decoration-foreground/30 underline-offset-2 transition-colors hover:decoration-foreground/70"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="bg-surface-tint px-1 py-0.5 font-mono text-xs text-foreground">{children}</code>
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
