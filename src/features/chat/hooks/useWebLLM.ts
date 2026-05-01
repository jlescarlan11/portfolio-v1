'use client';

import { useState, useRef, useCallback } from 'react';
import { buildSystemPrompt } from '../content';

export type ChatStatus = 'idle' | 'unsupported' | 'loading' | 'ready' | 'error';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface UseWebLLMResult {
  status: ChatStatus;
  progress: number;
  progressText: string;
  messages: Message[];
  send: (text: string) => Promise<void>;
  initialize: () => Promise<void>;
  isStreaming: boolean;
}

export function isWebGPUSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

const MODEL_ID = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: "Hi! I'm John's AI assistant. Ask me anything about his work, skills, or experience."
};

export function useWebLLM(): UseWebLLMResult {
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const engineRef = useRef<any>(null);
  const initStarted = useRef(false);
  const isStreamingRef = useRef(false);

  const initialize = useCallback(async () => {
    if (initStarted.current) return;
    initStarted.current = true;

    if (!isWebGPUSupported()) {
      setStatus('unsupported');
      return;
    }

    setStatus('loading');
    try {
      const { MLCEngine } = await import('@mlc-ai/web-llm');
      const engine = new MLCEngine();
      engine.setInitProgressCallback((report: { progress: number; text: string }) => {
        setProgress(Math.round(report.progress * 100));
        setProgressText(report.text);
      });
      await engine.reload(MODEL_ID);
      engineRef.current = engine;
      setStatus('ready');
      setMessages([WELCOME_MESSAGE]);
    } catch {
      setStatus('error');
    }
  }, []);

  const send = useCallback(async (text: string) => {
    if (!engineRef.current || isStreamingRef.current) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage, { role: 'assistant', content: '' }]);
    isStreamingRef.current = true;
    setIsStreaming(true);

    const context = [...messages.slice(-5), userMessage];
    try {
      const chunks = await engineRef.current.chat.completions.create({
        messages: [{ role: 'system', content: buildSystemPrompt() }, ...context],
        stream: true
      });
      for await (const chunk of chunks) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: updated[updated.length - 1].content + delta
            };
            return updated;
          });
        }
      }
    } finally {
      isStreamingRef.current = false;
      setIsStreaming(false);
    }
  }, [messages]);

  return { status, progress, progressText, messages, send, initialize, isStreaming };
}
