# John Lester Escarlan — Developer Portfolio

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> Personal developer portfolio showcasing full-stack builds across product, backend, and developer tooling.

**Live →** [johnlesterescarlan.pro](https://johnlesterescarlan.pro)

Netlify hosts the application, but `https://johnlesterescarlan.pro` is the
canonical public address. The generated `.netlify.app` URL is a deployment
fallback, not the preferred portfolio URL.

---

## Overview

This is the source code for my personal portfolio site — built with Next.js 15 and the App Router, designed to present a focused set of projects including **Rent N Roll** (a two-sided rental marketplace), **HEALTH** (AI-powered healthcare navigation), and **PriceCraft**. The architecture follows a feature-based structure for clean separation of concerns and long-term maintainability.

---

## Tech Stack

| Layer     | Technology                                                   |
| --------- | ------------------------------------------------------------ |
| Framework | Next.js 15 (App Router)                                      |
| UI        | React 19                                                     |
| Language  | TypeScript                                                   |
| Styling   | Tailwind CSS 4                                               |
| AI chat   | Netlify AI Gateway · AI SDK · OpenAI `gpt-5-nano`           |
| Icons     | React Icons                                                  |
| Testing   | Vitest · Node Test Runner · React Testing Library · Jest DOM |
| Tooling   | ESLint · Turbopack                                           |

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Installation

```bash
git clone https://github.com/jlescarlan11/portfolio-v1.git
cd portfolio-v1
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SITE_URL=https://johnlesterescarlan.pro
NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com

# Server-only hosted chat values. Never use NEXT_PUBLIC_ for these.
OPENAI_API_KEY=replace-with-a-local-development-key
# Optional: omit for the official OpenAI API.
# OPENAI_BASE_URL=https://replace-with-an-openai-compatible-v1-endpoint
```

Netlify deploys inject the collision-free `NETLIFY_AI_GATEWAY_KEY` and
`NETLIFY_AI_GATEWAY_BASE_URL` values at runtime; the server prefers that pair so
existing provider-specific project settings cannot bypass the gateway.
`OPENAI_API_KEY` is the local or non-Netlify fallback and uses the official
OpenAI endpoint by default. Set `OPENAI_BASE_URL` only for a different
OpenAI-compatible endpoint.
Do not set the `NETLIFY_AI_GATEWAY_*` values by hand or copy any runtime value
into the repository, browser code, fixtures, logs, or screenshots. If neither
the Netlify pair nor `OPENAI_API_KEY` is available, `POST /api/chat`
intentionally returns a sanitized `503`.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

To exercise Netlify-provided integrations locally, use `npx netlify dev`
instead. The rest of the portfolio runs with `npm run dev`; only a real chat
request needs gateway configuration.

---

## Commands

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start development server with Turbopack      |
| `npm run build`     | Build for production                         |
| `npm start`         | Run the production build                     |
| `npm run lint`      | Lint with ESLint                             |
| `npm run typecheck` | Type-check with TypeScript compiler          |
| `npm test`          | Run all tests (unit + UI)                    |
| `npm run test:unit` | Run unit tests via Node's native test runner |
| `npm run test:ui`   | Run component tests via Vitest               |
| `npm run verify:chat` | Run the hosted-chat quality corpus against `CHAT_BASE_URL` |
| `npm run verify:chat:rate-limit` | Verify the live distributed 20-per-minute boundary |

---

## Hosted AI Chat

The browser posts validated `user`/`assistant` history to `POST /api/chat`.
The server prepends the trusted portfolio prompt, trims the oldest complete
turns to the input budget, and streams newline-delimited JSON text frames from
Netlify AI Gateway. Closing the widget aborts the browser request and forwards
the cancellation signal upstream.

Application limits are deliberately conservative:

- `gpt-5-nano` with `minimal` reasoning effort
- 16 KiB body, 12 messages, and 2,000 Unicode characters in the current prompt
- 8,000 estimated input tokens and 256 maximum output tokens
- 25-second provider timeout
- 20 anonymous POST requests per IP and domain in a 60-second distributed
  Netlify rate-limit window

Netlify's edge counter can admit requests that are already in flight at the
boundary, so this is abuse protection rather than a strict billing cap. The
live verifier checks convergence and retry-window recovery; gateway account
TPM limits and Netlify's documented 50%, 75%, and 100% account-credit
notifications are the cost backstops. Netlify's Agent Runner AI Credit Usage
Limit does not stop AI Gateway traffic, so keep paid-plan auto recharge disabled
when a hard account-credit ceiling is required.

Pre-stream errors use JSON with `400`, `413`, `429`, `503`, or `504`. A stream
that fails after text begins ends with a sanitized error frame. Application
telemetry records only request ID, model, outcome, duration, token counts,
finish reason, and error category—never message content, the system prompt,
credentials, authorization headers, raw provider bodies, or IP addresses.
See [the model and API decision](docs/ai-chat-hosted-model-decision.md) for the
full contract and operational policy.

### Preview and production verification

1. Open a pull request and wait for the Netlify deploy preview.
2. Run `CHAT_BASE_URL=https://<deploy-preview-host> npm run verify:chat`.
   After at least 60 seconds with no requests from the same client, run
   `CHAT_BASE_URL=https://<deploy-preview-host> npm run verify:chat:rate-limit`.
   This sends only invalid bodies, so it exercises the edge boundary without
   invoking the model.
3. In a narrow mobile viewport, open the widget, send a prompt, observe
   progressive text, close it mid-stream, reopen it, and retry a simulated
   network failure.
4. Repeat in Safari or Firefox with graphics acceleration unavailable. The
   welcome message and input must still appear immediately.
5. Inspect browser network traffic and built client assets: only `/api/chat`
   may receive prompt content, and no gateway credential or legacy model asset
   may be present.
6. After production release, repeat the corpus and review Netlify gateway usage,
   application outcomes, and the account-credit notifications described in the
   decision record.

`CHAT_BASE_URL` is only the public preview/production origin; it is not a
credential. The verification script makes seven real model requests, so do not
run it repeatedly without checking gateway usage.

---

## Project Structure

Feature-based architecture within the Next.js App Router paradigm.

```
app/                        # Next.js route entrypoints
src/
  app/                      # Route assets and route-specific modules
  features/                 # Isolated feature modules
    ├── home/               # Landing section components & content
    ├── about/              # Profile, timeline, and background data
    ├── contact/            # Contact form and links
    ├── chat/               # Hosted chat client, API policy, and tests
    └── projects/           # Project data, galleries, and filtering
  shared/                   # Globally shared resources
    ├── components/         # Reusable UI components (buttons, badges)
    ├── hooks/              # Custom React hooks
    ├── lib/                # Utility functions and shared logic
    ├── site/               # Site-wide configuration and metadata
    └── styles/             # Global styles and Tailwind configuration
```

---

## Contact

- **GitHub:** [@jlescarlan11](https://github.com/jlescarlan11)
- **Portfolio:** [johnlesterescarlan.pro](https://johnlesterescarlan.pro)
- **Email:** Available via the contact section on the live site

---

_Designed and built by John Lester Escarlan._
