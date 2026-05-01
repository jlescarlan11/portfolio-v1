'use client';

import { useState, useRef, useCallback } from 'react';
import { buildSystemPrompt } from '../content';
import type { MLCEngineInterface } from '@mlc-ai/web-llm';

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

export const MODEL_ID = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';
const CACHE_KEY = 'webllm-cached';

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
  const engineRef = useRef<MLCEngineInterface | null>(null);
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
      const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm');
      const worker = new Worker(
        new URL('../workers/llm-worker.ts', import.meta.url),
        { type: 'module' }
      );
      const engine = await CreateWebWorkerMLCEngine(worker, MODEL_ID, {
        initProgressCallback: (report: { progress: number; text: string }) => {
          setProgress(Math.round(report.progress * 100));
          setProgressText(report.text);
        }
      });
      engineRef.current = engine;
      localStorage.setItem(CACHE_KEY, MODEL_ID);
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
        stream: true,
        temperature: 0.3,
        stop: ['<|im_end|>', '<|im_start|>']
      });

      let buffer = '';
      let rafId: number | null = null;

      const flush = () => {
        if (!buffer) return;
        const toAppend = buffer;
        buffer = '';
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + toAppend
          };
          return updated;
        });
        rafId = null;
      };

      for await (const chunk of chunks) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) {
          buffer += delta;
          if (!rafId) rafId = requestAnimationFrame(flush);
        }
      }

      if (rafId !== null) cancelAnimationFrame(rafId);
      flush();
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Something went wrong. Please try again.'
        };
        return updated;
      });
    } finally {
      isStreamingRef.current = false;
      setIsStreaming(false);
    }
  }, [messages]);

  return { status, progress, progressText, messages, send, initialize, isStreaming };
}
