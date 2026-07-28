# John Lester Escarlan — Developer Portfolio

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> Personal developer portfolio showcasing full-stack builds across product, backend, and developer tooling.

**Live →** [johnlesterescarlan.pro](https://johnlesterescarlan.pro)

`https://johnlesterescarlan.pro` is the canonical public address. Production
traffic still resolves to Netlify while the gated Vercel migration is prepared;
the generated provider domains are fallbacks, not preferred portfolio URLs.
See the [Vercel cutover runbook](docs/vercel-cutover-runbook.md) for the
verified DNS inventory, release gates, and rollback procedure.

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
| AI chat   | Vercel AI Gateway · AI SDK · OpenAI `gpt-5-nano`            |
| Icons     | React Icons                                                  |
| Testing   | Vitest · Node Test Runner · React Testing Library · Jest DOM |
| Tooling   | ESLint · Turbopack                                           |

---

## Getting Started

### Prerequisites

- Node.js 24
- pnpm 10.33.1

### Installation

```bash
git clone https://github.com/jlescarlan11/portfolio-v1.git
cd portfolio-v1
pnpm install --frozen-lockfile
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SITE_URL=https://johnlesterescarlan.pro
NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com
```

Vercel deployments inject a short-lived `VERCEL_OIDC_TOKEN` automatically, so
the hosted chat does not require an OpenAI API key. For local chat development,
link this clone to the existing Vercel project and pull a short-lived OIDC token:

```bash
vercel link --yes --scope lester-s-projects4 --project portfolio-v1
vercel env pull .env.local --yes
```

Re-run the environment pull when the local token expires. Keep
`VERCEL_OIDC_TOKEN` and the optional server-only `AI_GATEWAY_API_KEY` out of Git,
browser code, fixtures, logs, and screenshots. Never prefix either credential
with `NEXT_PUBLIC_`. If server-side gateway authentication is unavailable,
`POST /api/chat` intentionally returns a sanitized `503`.

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

The portfolio runs locally with `pnpm dev`; only a real chat request needs
Gateway configuration. The Netlify development path remains available solely
for rollback compatibility until the production cutover and observation window
are complete.

---

## Commands

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`       | Start development server with Turbopack      |
| `pnpm build`     | Build for production                         |
| `pnpm start`         | Run the production build                     |
| `pnpm lint`      | Lint with ESLint                             |
| `pnpm typecheck` | Type-check with TypeScript compiler          |
| `pnpm test`          | Run all tests (unit + UI)                    |
| `pnpm test:unit` | Run unit tests via Node's native test runner |
| `pnpm test:ui`   | Run component tests via Vitest               |
| `pnpm verify:chat` | Run the hosted-chat quality corpus against `CHAT_BASE_URL` |
| `pnpm verify:chat:rate-limit` | Verify the live distributed 20-per-minute boundary |
| `pnpm verify:cutover` | Run read-only domain, content, metadata, and header checks |

---

## Hosted AI Chat

The browser posts validated `user`/`assistant` history to `POST /api/chat`.
The server prepends the trusted portfolio prompt, trims the oldest complete
turns to the input budget, and streams newline-delimited JSON text frames from
Vercel AI Gateway. Closing the widget aborts the browser request and forwards
the cancellation signal upstream.

Application limits are deliberately conservative:

- `gpt-5-nano` with `minimal` reasoning effort
- 16 KiB body, 12 messages, and 2,000 Unicode characters in the current prompt
- 8,000 estimated input tokens and 256 maximum output tokens
- 25-second provider timeout
- 20 anonymous POST requests per client IP across every site domain in a
  60-second Vercel Firewall fixed window

The server calls the `portfolio-chat` rule through `@vercel/firewall` before it
parses the request or starts AI Gateway. Vercel derives the anonymous key from
the connection IP; the application does not read, store, or log raw IP
addresses. The fixed-window counter is shared across function instances within
a Vercel region. Counters are regional rather than globally exact, so traffic
that reaches multiple regions can receive a separate 20-request allowance in
each region. This is abuse protection rather than a strict billing cap.

If the rule is missing or the Firewall check fails, the route fails closed with
a sanitized `503` and does not call the model. Keep the WAF rule on the Hobby
plan's included allowance, AI Gateway automatic top-up disabled, and no paid
fallback configured.

Pre-stream errors use JSON with `400`, `413`, `429`, `503`, or `504`. A stream
that fails after text begins ends with a sanitized error frame. Application
telemetry records only request ID, model, outcome, duration, token counts,
finish reason, and error category—never message content, the system prompt,
credentials, authorization headers, raw provider bodies, or IP addresses.
See [the model and API decision](docs/ai-chat-hosted-model-decision.md) for the
full contract and operational policy.

### Preview and production verification

1. Open a pull request and wait for the Vercel Preview deployment.
2. Run
   `CUTOVER_BASE_URL=https://<preview-host> pnpm verify:cutover`.
3. Run `CHAT_BASE_URL=https://<preview-host> pnpm verify:chat`.
   After at least 60 seconds with no requests from the same client, run
   `CHAT_BASE_URL=https://<preview-host> pnpm verify:chat:rate-limit`.
   This sends only invalid bodies, so it exercises the edge boundary without
   invoking the model.
4. In a narrow mobile viewport, open the widget, send a prompt, observe
   progressive text, close it mid-stream, reopen it, and retry a simulated
   network failure.
5. Repeat in Safari or Firefox with graphics acceleration unavailable. The
   welcome message and input must still appear immediately.
6. Inspect browser network traffic and built client assets: only `/api/chat`
   may receive prompt content, and no gateway credential or legacy model asset
   may be present.
7. After production release, repeat the corpus and review Vercel AI Gateway
   usage, Firewall traffic, application outcomes, and the account-credit
   notifications described in the decision record.

`CHAT_BASE_URL` is only the public preview/production origin; it is not a
credential. The verification script makes seven real model requests, so do not
run it repeatedly without checking gateway usage.

GitHub `main` is the Vercel Production source; eligible pull requests and other
branches produce Vercel Previews. Preview responses must remain
`noindex, nofollow`. The project operates with no paid AI credits, no automatic
top-up, and no paid provider fallback. Free allowances are capped, not
unlimited; exhausted or unavailable inference must degrade to the sanitized
chat error while static portfolio pages remain available.

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
