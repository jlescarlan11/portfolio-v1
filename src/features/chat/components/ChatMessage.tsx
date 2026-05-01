'use client';

import React from 'react';

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
        {content}
      </div>
    </div>
  );
}
