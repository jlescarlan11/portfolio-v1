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
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <span className="mt-[3px] shrink-0 font-mono text-[9px] uppercase tracking-widest text-subtle-foreground/50">
        {isUser ? 'You' : 'AI'}
      </span>
      <div
        className={`max-w-[85%] text-sm leading-relaxed ${
          isUser
            ? 'bg-surface-tint px-3 py-2 font-mono text-[12px] text-foreground'
            : 'text-muted-foreground'
        }`}
      >
        {isUser ? (
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
