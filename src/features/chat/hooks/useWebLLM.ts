'use client';

import { useState, useRef, useCallback } from 'react';
import { buildSystemPrompt } from '../content';
import type { MLCEngine } from '@mlc-ai/web-llm';

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

export const MODEL_ID = 'Phi-3.5-mini-instruct-q4f16_1-MLC';
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
  const engineRef = useRef<MLCEngine | null>(null);
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
      const { MLCEngine: MLCEngineClass } = await import('@mlc-ai/web-llm');
      const engine = new MLCEngineClass();
      engine.setInitProgressCallback((report: { progress: number; text: string }) => {
        setProgress(Math.round(report.progress * 100));
        setProgressText(report.text);
      });
      await engine.reload(MODEL_ID);
      // Warm up the GPU shader pipeline so the first real query doesn't freeze
      setProgressText('Warming up...');
      await engine.chat.completions.create({
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1,
        stream: false
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
      const classification = await engineRef.current.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a topic classifier. Do NOT answer questions. Only output YES or NO, nothing else. Output YES if the question is something a potential employer or client might ask about a software engineer — such as his skills, experience, projects, education, availability, what he can offer, or how to reach him. Output NO only if the question is completely unrelated to a person\'s professional background, such as math problems, science questions, current events, or general knowledge.' },
          { role: 'user', content: `${messages.length > 0 ? `Conversation so far: ${messages.slice(-2).map(m => `${m.role}: ${m.content}`).join(' | ')}\n\n` : ''}Classify this question (YES or NO only): "${text}"` }
        ],
        max_tokens: 5,
        temperature: 0,
        stream: false
      });
      const verdict = classification.choices[0]?.message?.content?.trim().toUpperCase() ?? 'NO';
      if (!verdict.startsWith('YES')) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: "I only have info on John's professional background — try asking about his skills, experience, or projects."
          };
          return updated;
        });
        return;
      }

      const chunks = await engineRef.current.chat.completions.create({
        messages: [{ role: 'system', content: buildSystemPrompt() }, ...context],
        stream: true,
        temperature: 0.3,
        max_tokens: 250
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
