# AI Chat Feature — Design Spec

**Date:** 2026-05-01  
**Status:** Approved

---

## Overview

A floating AI chat widget that lets portfolio visitors ask questions about John Lester Escarlan — his skills, experience, projects, and background. The AI runs entirely in the visitor's browser using WebLLM (no server, no API keys, no token cost ever). The model downloads once on first visit and is cached permanently in the browser.

---

## User Experience

### Closed state
A floating button (bottom-right corner, indigo gradient) with a subtle tooltip: "Ask me about John ✨". Always visible while the user scrolls. No model is loaded at this point — zero page-load overhead.

### On click — loading state
The chat window slides up from the button. WebLLM begins downloading and initializing the model in a Web Worker. A progress bar shows download progress with the message: "Downloading AI model — first visit only, cached after this." Download size: ~800 MB (Llama-3.2-1B).

### Active state
Once the model is ready, the header shows a green "● Ready" indicator. A welcome message from the assistant appears: "Hi! I'm John's AI assistant. Ask me anything about his work, skills, or experience." The user types questions; responses stream in token by token.

### Unsupported browser state
If WebGPU is not available, the chat window opens but shows a warning: "This feature requires WebGPU. Please open in Chrome or Edge to chat." A "Copy link" button lets the visitor copy the portfolio URL to reopen in a supported browser.

---

## Architecture

### Feature directory
```
src/features/chat/
  components/
    ChatBubble.tsx       ← floating button, renders the tooltip and opens the window
    ChatWindow.tsx       ← the chat panel (loading / active / unsupported states)
    ChatMessage.tsx      ← individual message bubble (user or assistant)
  hooks/
    useWebLLM.ts         ← manages model loading, Web Worker, inference, streaming
  content.ts             ← assembles the system prompt from portfolio content
  index.ts               ← barrel export
```

### Integration point
`ChatBubble` is added to `src/app/layout.tsx` so it persists across all routes.

### Lazy loading
`@mlc-ai/web-llm` is imported dynamically inside `useWebLLM.ts` (`import()`). It never appears in the initial bundle. The import fires only when the user opens the chat for the first time.

---

## Model

**Model ID:** `Llama-3.2-1B-Instruct-q4f32_1-MLC`  
**Download size:** ~800 MB  
**Cache:** Stored in browser IndexedDB via WebLLM's built-in caching — subsequent visits load from cache in seconds.  
**Runtime:** WebGPU (Chrome 113+, Edge 113+). No CPU fallback — unsupported browsers get the warning message.

---

## Knowledge Base & System Prompt

`src/features/chat/content.ts` assembles a system prompt from the existing content files. It is a plain TypeScript string — no build step, no embedding, no vector search needed (the knowledge base is small enough to fit in context).

**System prompt structure:**

```
You are John's AI assistant on his portfolio website.
Answer questions about John Lester Escarlan — his skills, experience,
projects, and background. Be helpful and professional.
If you don't know something, say so honestly.
Do not make up information about John.

--- Identity ---
Name: John Lester Escarlan
Role: Full-Stack Software Engineer
Email: jlescarlan11@gmail.com
GitHub: https://github.com/jlescarlan11
LinkedIn: https://www.linkedin.com/in/john-lester-escarlan/

--- Summary ---
[heroContent.tagline from home/content.ts]

--- Experience ---
[experience entries from about/content.ts — title, company, dates, responsibilities]

--- Education ---
[education entries from about/content.ts — degree, school, achievements]

--- Skills ---
[techCategories from about/content.ts — category + item labels]

--- Projects ---
[projects from projects/data.ts — title, category, description, highlights]

--- Contact ---
[contactContent from contact/content.ts — availability statement, email]
```

Total system prompt: ~1,200–1,800 tokens. Conversation history is kept to the last 6 messages to stay well within the model's 4K context window.

---

## Component Behaviour

### `useWebLLM.ts`
- Exposes: `{ status, progress, messages, send, isStreaming }`
- `status`: `'idle' | 'unsupported' | 'loading' | 'ready' | 'error'`
- On first `send()` call (or when the window opens), it checks for WebGPU, then triggers the dynamic import and model load.
- Streams tokens back by updating the last assistant message in place.
- Runs inference in a Web Worker to keep the UI thread unblocked.

### `ChatBubble.tsx`
- Renders the floating button and tooltip.
- On click: sets `isOpen = true`, which mounts `ChatWindow`.

### `ChatWindow.tsx`
- Renders the correct inner state based on `useWebLLM.status`.
- Calls `useWebLLM.send(userMessage)` on form submit.
- Auto-scrolls to the latest message.

### `ChatMessage.tsx`
- Accepts `role: 'user' | 'assistant'` and `content: string`.
- User bubbles: right-aligned, indigo background.
- Assistant bubbles: left-aligned, dark background.

---

## WebGPU Detection

```ts
function isWebGPUSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}
```

Checked synchronously on mount inside `useWebLLM`. Sets `status = 'unsupported'` immediately if false — no model download is attempted.

---

## Testing Plan

| Test | Type | File |
|------|------|------|
| WebGPU detection returns true when `navigator.gpu` exists | Unit | `chat.test.ts` |
| WebGPU detection returns false when `navigator.gpu` is absent | Unit | `chat.test.ts` |
| System prompt includes name, email, and at least one project | Unit | `chat.test.ts` |
| `ChatBubble` renders the floating button | Component | `ChatBubble.test.tsx` |
| Clicking `ChatBubble` mounts `ChatWindow` | Component | `ChatBubble.test.tsx` |
| `ChatWindow` renders unsupported message when status is `'unsupported'` | Component | `ChatWindow.test.tsx` |
| `ChatWindow` renders progress bar when status is `'loading'` | Component | `ChatWindow.test.tsx` |

WebLLM itself is mocked in tests — only the integration points (detection, prompt assembly, component rendering) are tested.

---

## Constraints & Trade-offs

- **~800 MB first-load download** — unavoidable with in-browser AI. Mitigated by showing clear progress and a "first visit only" message. The download happens after the user intentionally opens the chat.
- **WebGPU required** — Chrome/Edge only. Users on other browsers get a clear message with a copy-link affordance.
- **No persistent chat history** — conversation resets on page reload. This is intentional: each visitor starts fresh, and persisting chat adds complexity with no clear benefit.
- **Model accuracy** — a 1B parameter model is capable but not perfect. The system prompt instructs it not to fabricate information about John, and the knowledge base is narrow enough to reduce hallucination risk.
