# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the portfolio's visual quality with Playfair Display + Geist typography, scroll-triggered motion, and sync all content to the current resume.

**Architecture:** Font swap (Poppins → Playfair Display + Geist) drives the aesthetic shift. FadeIn gains IntersectionObserver for scroll-triggered reveals. All other changes are targeted component edits — no structural changes to layout, routing, or section order.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS v4, TypeScript, `geist` npm package, `next/font/google` (Playfair Display), Vitest, Node test runner.

**Spec:** `docs/superpowers/specs/2026-04-30-portfolio-redesign-design.md`

---

## File Map

| File | What changes |
|------|-------------|
| `package.json` | Add `geist` dependency |
| `src/app/layout.tsx` | Replace Poppins with Playfair Display + Geist |
| `src/app/globals.css` | Font variables, type scale adds `font-serif` / `font-mono` |
| `src/shared/components/FadeIn.tsx` | Add IntersectionObserver scroll-trigger |
| `src/shared/components/FadeIn.test.tsx` | New — test IntersectionObserver behaviour |
| `src/shared/components/NavigationBar.tsx` | Underline hover + active section indicator |
| `src/shared/components/WelcomeOverlay.tsx` | Add `font-serif` to h1 |
| `src/features/home/components/HeroSection.tsx` | Word-by-word name animation, corner brackets, scroll draw |
| `src/features/about/AboutSection.tsx` | Add 'use client', stagger TimelineRow, new icons, chip hover |
| `src/features/about/content.ts` | Updated experience bullets, new skills |
| `src/features/projects/data.ts` | Add FireCheck, update HEALTH + PriceCraft |
| `src/features/projects/project.test.ts` | Add FireCheck and content assertions |
| `src/features/projects/components/ProjectCard.tsx` | Add `translateY(-2px)` hover |

---

## Task 1: Install Geist and update font loading in layout.tsx

**Files:**
- Modify: `package.json`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Install the geist package**

```bash
npm install geist
```

Expected: `geist` appears in `package.json` dependencies.

- [ ] **Step 2: Update `src/app/layout.tsx`**

Replace the entire file with:

```tsx
import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import WelcomeOverlay from '@/shared/components/WelcomeOverlay';
import { siteConfig } from '@/shared/site/config';
import './globals.css';

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900']
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.seo.siteTitle,
    template: `%s - ${siteConfig.seo.titleTemplateName}`
  },
  description: siteConfig.seo.description,
  metadataBase: new URL(siteConfig.seo.siteUrl),
  openGraph: {
    title: siteConfig.seo.siteTitle,
    description: siteConfig.seo.openGraphDescription,
    url: siteConfig.seo.siteUrl,
    siteName: siteConfig.seo.siteName,
    images: [
      {
        url: '/hero-image.svg',
        width: 1200,
        height: 630,
        alt: 'Portrait of John Lester Escarlan'
      }
    ],
    locale: siteConfig.seo.locale,
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.siteTitle,
    description: siteConfig.seo.description,
    images: ['/hero-image.svg']
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body
        className={`${playfairDisplay.variable} ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <WelcomeOverlay />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:border focus:border-surface-strong focus:bg-surface focus:px-3 focus:py-2 focus:text-foreground"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/app/layout.tsx
git commit -m "feat: replace Poppins with Playfair Display and Geist font system"
```

---

## Task 2: Update globals.css — font variables and type scale

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update `src/app/globals.css`**

Replace the entire file with:

```css
@import "tailwindcss";

:root {
  --background-rgb: 0, 0, 0;
  --foreground-rgb: 255, 255, 255;
  --background: rgb(var(--background-rgb));
  --foreground: rgb(var(--foreground-rgb));
  --surface-border: rgba(var(--foreground-rgb), 0.16);
  --surface-border-strong: rgba(var(--foreground-rgb), 0.28);
  --surface-border-dim: rgba(var(--foreground-rgb), 0.1);
  --background-muted: rgba(var(--background-rgb), 0.95);
  --background-glass: rgba(var(--background-rgb), 0.75);
  --surface-divider: rgba(var(--foreground-rgb), 0.1);
  --surface-tint: rgba(var(--foreground-rgb), 0.08);
  --surface-tint-strong: rgba(var(--foreground-rgb), 0.16);
  --focus-ring: var(--foreground);
  --text-foreground: var(--foreground);
  --text-muted-foreground: rgba(var(--foreground-rgb), 0.7);
  --text-subtle-foreground: rgba(var(--foreground-rgb), 0.55);
  --motion-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-serif: var(--font-playfair);
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media (prefers-color-scheme: light) {
  :root {
    --background-rgb: 255, 255, 255;
    --foreground-rgb: 0, 0, 0;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --background-rgb: 0, 0, 0;
    --foreground-rgb: 255, 255, 255;
  }
}

:where(a, button, [role="button"], input, textarea, summary):focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}

::selection {
  background-color: rgba(var(--foreground-rgb), 0.12);
  color: var(--foreground);
}

@layer utilities {
  .text-foreground { color: var(--text-foreground); }
  .text-muted-foreground { color: var(--text-muted-foreground); }
  .text-subtle-foreground { color: var(--text-subtle-foreground); }
  .decoration-foreground { text-decoration-color: var(--text-foreground); }
  .decoration-muted-foreground { text-decoration-color: var(--text-muted-foreground); }
  .decoration-subtle-foreground { text-decoration-color: var(--text-subtle-foreground); }
  .bg-surface { background-color: var(--background); }
  .bg-surface-muted { background-color: var(--background-muted); }
  .bg-surface-glass { background-color: var(--background-glass); }
  .bg-surface-divider { background-color: var(--surface-divider); }
  .bg-surface-tint { background-color: var(--surface-tint); }
  .bg-surface-tint-strong { background-color: var(--surface-tint-strong); }
  .border-surface { border-color: var(--surface-border); }
  .border-surface-subtle { border-color: rgba(var(--foreground-rgb), 0.06); }
  .border-surface-strong { border-color: var(--surface-border-strong); }
  .select-none-safe {
    user-select: none;
    -webkit-user-select: none;
  }
  .pointer-events-none-safe {
    pointer-events: none;
  }
  .display {
    @apply font-serif text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-foreground;
  }
  .h1 {
    @apply font-serif text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground;
  }
  .h2 {
    @apply font-serif text-2xl md:text-3xl font-semibold tracking-tight leading-snug text-foreground;
  }
  .h3 {
    @apply font-serif text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground;
  }
  .h4 {
    @apply font-serif text-lg md:text-xl font-medium leading-snug text-foreground;
  }
  .body-lg {
    @apply text-lg leading-[1.8];
    color: var(--text-muted-foreground);
  }
  .body {
    @apply text-base leading-7 text-foreground;
  }
  .body-sm {
    @apply text-sm leading-6;
    color: var(--text-muted-foreground);
  }
  .label {
    @apply font-sans text-sm font-medium leading-none text-foreground;
  }
  .caption {
    @apply font-mono text-xs leading-5;
    color: var(--text-muted-foreground);
  }
  .code {
    @apply font-mono text-sm leading-6 text-foreground;
  }
  .surface-grid-mask {
    background-image:
      linear-gradient(var(--surface-border-dim) 1px, transparent 1px),
      linear-gradient(90deg, var(--surface-border-dim) 1px, transparent 1px);
    background-size: 64px 64px;
    mask-image: radial-gradient(ellipse 100% 70% at 50% 40%, black 20%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 100% 70% at 50% 40%, black 20%, transparent 100%);
  }
  .animate-enter {
    opacity: 0;
    transform: translateY(16px);
    animation: fade-in-up 0.75s var(--motion-ease) forwards;
    animation-delay: var(--enter-delay, 0ms);
    will-change: opacity, transform;
  }
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

@keyframes infinite-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.333%); }
}

.animate-infinite-scroll {
  animation: infinite-scroll 28s linear infinite;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes draw-down {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

Key changes vs original:
- `@theme inline`: `--font-sans` → Geist, `--font-mono` → Geist Mono, `--font-serif` → Playfair
- `body`: font-family references `var(--font-geist-sans)` instead of `var(--font-poppins)`
- `.display`, `.h1`, `.h2`, `.h3`, `.h4`: added `font-serif`
- `.caption`: added `font-mono`
- `.label`: added `font-sans` explicitly
- `.body-lg`: `leading-relaxed` → `leading-[1.8]`
- Added `@keyframes draw-down` for scroll indicator

- [ ] **Step 2: Run typecheck and build**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: update type scale — Playfair serif headings, Geist Mono captions"
```

---

## Task 3: Content update — experience bullets and skills

**Files:**
- Modify: `src/features/about/content.ts`
- Modify: `src/features/projects/project.test.ts`

- [ ] **Step 1: Add assertions to `src/features/projects/project.test.ts` for content**

Append to the existing test file:

```ts
import { aboutContent } from '../../features/about/content.ts';

test('freelance experience entry has metric-rich bullets from resume', () => {
  const freelance = aboutContent.experience.find(e => e.id === 'exp-freelance-software-engineer');
  assert.ok(freelance, 'freelance entry should exist');
  assert.ok(
    freelance.responsibilities.some(r => r.includes('12+')),
    'should mention 12+ bugs resolved'
  );
  assert.ok(
    freelance.responsibilities.some(r => r.includes('15+')),
    'should mention 15+ manual steps cut'
  );
});

test('skills include Dart and Flutter from resume', () => {
  const all = aboutContent.techCategories.flatMap(c => c.items.map(i => i.label));
  assert.ok(all.includes('Dart'), 'Dart should be in skills');
  assert.ok(all.includes('Flutter'), 'Flutter should be in skills');
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:unit
```

Expected: the two new tests FAIL (data not updated yet).

- [ ] **Step 3: Update `src/features/about/content.ts`**

Replace the `experience` array and `techCategories` array with the following. Leave all interfaces and other fields unchanged.

**experience** — replace the entire `experience: [...]` array value:

```ts
experience: [
  {
    id: 'exp-freelance-software-engineer',
    title: 'Freelance Software Engineer',
    company: 'Upwork — Remote',
    startDate: '2026-01',
    endDate: null,
    isCurrent: true,
    responsibilities: [
      'Resolved 12+ production-blocking bugs with average turnaround under 24 hours, restoring client workflows fast.',
      'Rebuilt internal release automation, cutting 15+ manual steps and reclaiming roughly 4 engineering hours per week for the team.',
      'Shipped 3 client-facing features end-to-end across React, TypeScript, and Node.js stacks, scoping requirements directly with non-technical stakeholders before writing a line of code.',
      'Wrote technical documentation and API specs for client handoff, reducing onboarding time for new contributors from 1 week to 2 days.'
    ]
  },
  {
    id: 'exp-wg-monitoring-engineer',
    title: 'Software Monitoring Engineer',
    company: "Wind's Gate Philippines — Cebu City",
    startDate: '2025-06',
    endDate: '2026-01',
    responsibilities: [
      'Caught and escalated 25+ incidents across 8 production services before they reached end users, owning live uptime visibility for the team.',
      'Traced incidents from raw logs to root cause and redesigned the team\'s incident report format, cutting average triage time by 30%.',
      'Authored 8+ runbooks documenting recovery procedures for recurring incidents, enabling on-call engineers to resolve Tier 1 issues without escalation.'
    ]
  },
  {
    id: 'exp-asi-software-engineer-intern',
    title: 'Software Engineer Intern',
    company: 'Alliance Software Inc. — Cebu City',
    startDate: '2025-06',
    endDate: '2025-07',
    responsibilities: [
      "Delivered 5 production features into live client codebases at one of the Philippines' largest software firms.",
      'Worked across the full stack using C# and ASP.NET MVC on enterprise applications used by thousands of daily users.',
      'Participated in code reviews, pair programming, and agile ceremonies with senior engineers.'
    ]
  },
  {
    id: 'exp-bayoa-full-stack-intern',
    title: 'Full-Stack Developer Intern',
    company: 'Bayoa Analytics — Remote',
    startDate: '2024-09',
    endDate: '2024-11',
    responsibilities: [
      'Diagnosed N+1 query patterns and schema bottlenecks, cutting API response time from 800ms to 150ms on top-traffic endpoints.',
      'Built 10+ REST API endpoints using Node.js and Express to power a new analytics dashboard feature.',
      'Wrote reusable React components with TypeScript and Tailwind CSS, speeding up feature delivery for downstream teams.'
    ]
  }
],
```

**techCategories** — replace the entire `techCategories: [...]` array value:

```ts
techCategories: [
  {
    category: 'Languages',
    items: [
      { label: 'TypeScript' },
      { label: 'JavaScript' },
      { label: 'Python' },
      { label: 'Java' },
      { label: 'Dart' },
      { label: 'C#' },
      { label: 'Go' },
      { label: 'C' },
      { label: 'C++' },
      { label: 'SQL' },
      { label: 'Bash' }
    ]
  },
  {
    category: 'Frameworks & Libraries',
    items: [
      { label: 'React' },
      { label: 'Next.js' },
      { label: 'React Native' },
      { label: 'Flutter' },
      { label: 'Node.js' },
      { label: 'Express.js' },
      { label: 'Spring Boot' },
      { label: 'ASP.NET' },
      { label: 'Tailwind CSS' },
      { label: 'TanStack Query' },
      { label: 'Redux' },
      { label: 'Riverpod' },
      { label: 'Drift' },
      { label: 'Vite' },
      { label: 'Vitest' },
      { label: 'JWT/OAuth2 Authentication' }
    ]
  },
  {
    category: 'Infrastructure',
    items: [
      { label: 'PostgreSQL' },
      { label: 'PostGIS' },
      { label: 'MySQL' },
      { label: 'MongoDB' },
      { label: 'SQLite' },
      { label: 'Redis' },
      { label: 'Elasticsearch' },
      { label: 'Drizzle ORM' },
      { label: 'Prisma ORM' },
      { label: 'Docker' },
      { label: 'Kubernetes' },
      { label: 'GitHub CI/CD' },
      { label: 'AWS' },
      { label: 'Vercel' },
      { label: 'Supabase' },
      { label: 'Mapbox' },
      { label: 'Figma' },
      { label: 'Git' }
    ]
  }
],
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:unit
```

Expected: all tests PASS including the two new ones.

- [ ] **Step 5: Commit**

```bash
git add src/features/about/content.ts src/features/projects/project.test.ts
git commit -m "feat: update experience bullets and skills to match resume"
```

---

## Task 4: Content update — project data (FireCheck + HEALTH + PriceCraft)

**Files:**
- Modify: `src/features/projects/data.ts`
- Modify: `src/features/projects/project.test.ts`

- [ ] **Step 1: Add test assertions**

Append to `src/features/projects/project.test.ts`:

```ts
test('firecheck is the first project in the array', () => {
  assert.equal(projects[0].slug, 'firecheck');
  assert.equal(projects[0].title, 'FireCheck');
  assert.ok(
    projects[0].technologies.includes('Flutter'),
    'FireCheck should list Flutter as a technology'
  );
});

test('HEALTH description references AI triage', () => {
  const health = projects.find(p => p.slug === 'health');
  assert.ok(health, 'health project should exist');
  assert.ok(
    health.description.toLowerCase().includes('ai'),
    'HEALTH description should mention AI triage'
  );
});

test('PriceCraft description mentions edge cases', () => {
  const pricecraft = projects.find(p => p.slug === 'pricecraft');
  assert.ok(pricecraft, 'pricecraft should exist');
  assert.ok(
    pricecraft.description.includes('edge-case'),
    'PriceCraft description should mention edge cases'
  );
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:unit
```

Expected: the three new tests FAIL.

- [ ] **Step 3: Add FireCheck as the first entry in `src/features/projects/data.ts`**

In `data.ts`, insert the following as the **first element** of the `projects` array (before `kaizen`):

```ts
{
  slug: 'firecheck',
  title: 'FireCheck',
  category: 'Mobile Application / GIS & Field Survey',
  description:
    'An offline-first Android field survey app replacing 2 legacy paper-and-tablet workflows — built with Flutter, an outbox-pattern sync engine, and WorkManager retry/backoff.',
  logo: '',
  technologies: ['Flutter', 'Dart', 'Riverpod', 'Drift', 'Mapbox SDK', 'Supabase', 'WorkManager'],
  completedAt: '2026-04',
  links: {
    githubUrl: 'https://github.com/jlescarlan11/firecheck'
  },
  caseStudy: {
    summary:
      'A production Android tool engineered to replace paper-and-tablet field workflows with a single offline-first app.',
    overview: [
      'FireCheck was shipped across 7 release phases as sole developer. The core challenge was reliable data sync in environments with intermittent connectivity — solved with an outbox-pattern sync engine, two-phase photo upload, and WorkManager retry/backoff.',
      'The 409 bundle-export fallback ensures no field data is lost even when sync conflicts occur. Two legacy workflows were replaced by a single Android tool.'
    ],
    highlights: [
      'Outbox-pattern sync engine with two-phase photo upload and WorkManager retry/backoff.',
      'Shipped across 7 release phases as sole developer.',
      'Replaced 2 legacy paper-and-tablet workflows with a single offline-first Android tool.'
    ]
  }
},
```

- [ ] **Step 4: Update the HEALTH project entry in `data.ts`**

Find the entry with `slug: 'health'` and replace its `description` and `caseStudy` fields:

```ts
description:
  'An AI-assisted triage and offline care guide — Semi-Finalist (top 15 of 200+ teams) at the 1st Naga City Mayoral Hackathon, built for reliable use in low-connectivity areas.',
```

```ts
caseStudy: {
  summary:
    'A civic health app that safety-gates AI triage through deterministic logic and keeps 100% of core features usable offline.',
  overview: [
    'HEALTH combined local-first mobile behavior with healthcare decision support so residents could still navigate care options without depending on a stable network connection.',
    'The project centered on practical usability: facility discovery, enrollment guidance, and language that helped users move from uncertainty to the next action.'
  ],
  highlights: [
    'Led a 5-man team to Semi-Finalist (top 15 of 200+ teams) at the 1st Naga City Mayoral Hackathon.',
    'Safety-gates AI triage through deterministic logic — AI suggestions never bypass hard clinical rules.',
    '100% of core features usable offline via SQLite local persistence.'
  ]
},
```

- [ ] **Step 5: Update the PriceCraft project entry in `data.ts`**

Find the entry with `slug: 'pricecraft'` and replace its `description` and `caseStudy.summary`:

```ts
description:
  'A live profit pricing calculator for small-business operators — edge-case-hardened (zero-cost, negative margins, rounding) so non-technical users get correct prices on the first try.',
```

```ts
summary:
  'A pricing tool engineered around the edge cases that break generic calculators — zero-cost inputs, negative margins, and rounding — for small Filipino food businesses.',
```

- [ ] **Step 6: Run tests to confirm all pass**

```bash
npm run test:unit
```

Expected: all tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/projects/data.ts src/features/projects/project.test.ts
git commit -m "feat: add FireCheck project, update HEALTH and PriceCraft descriptions"
```

---

## Task 5: Upgrade FadeIn to IntersectionObserver scroll-trigger

**Files:**
- Modify: `src/shared/components/FadeIn.tsx`
- Create: `src/shared/components/FadeIn.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/shared/components/FadeIn.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { FadeIn } from './FadeIn';

const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let intersectionCallback: ((entries: Partial<IntersectionObserverEntry>[]) => void) | null = null;

beforeEach(() => {
  mockObserve.mockClear();
  mockDisconnect.mockClear();
  intersectionCallback = null;

  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn().mockImplementation((callback) => {
      intersectionCallback = callback;
      return { observe: mockObserve, disconnect: mockDisconnect, unobserve: vi.fn() };
    })
  );
});

describe('FadeIn', () => {
  it('renders children without animate-enter class before intersection', () => {
    const { getByText } = render(<FadeIn><span>hello</span></FadeIn>);
    const wrapper = getByText('hello').parentElement!;
    expect(wrapper.className).not.toContain('animate-enter');
  });

  it('adds animate-enter class after IntersectionObserver fires isIntersecting=true', () => {
    const { getByText } = render(<FadeIn><span>hello</span></FadeIn>);
    const wrapper = getByText('hello').parentElement!;

    act(() => {
      intersectionCallback?.([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(wrapper.className).toContain('animate-enter');
  });

  it('disconnects the observer after becoming visible', () => {
    render(<FadeIn><span>hello</span></FadeIn>);

    act(() => {
      intersectionCallback?.([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('passes the delay as --enter-delay CSS variable when visible', () => {
    const { getByText } = render(<FadeIn delay={200}><span>hello</span></FadeIn>);
    const wrapper = getByText('hello').parentElement!;

    act(() => {
      intersectionCallback?.([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect((wrapper as HTMLElement).style.getPropertyValue('--enter-delay')).toBe('200ms');
  });

  it('renders as a custom element when as prop is provided', () => {
    const { container } = render(<FadeIn as="section"><span>hello</span></FadeIn>);
    expect(container.querySelector('section')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test:ui
```

Expected: FadeIn tests FAIL — current FadeIn doesn't use IntersectionObserver.

- [ ] **Step 3: Replace `src/shared/components/FadeIn.tsx`**

```tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number | string;
  className?: string;
  as?: React.ElementType;
}

export function FadeIn({
  children,
  delay = 0,
  className = '',
  as: Component = 'div'
}: FadeInProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const delayValue = typeof delay === 'number' ? `${delay}ms` : delay;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      className={isVisible ? `animate-enter ${className}`.trim() : `opacity-0 ${className}`.trim()}
      style={isVisible ? ({ '--enter-delay': delayValue } as CSSProperties) : undefined}
    >
      {children}
    </Component>
  );
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test:ui
```

Expected: all FadeIn tests PASS. Existing WelcomeOverlay tests also pass (WelcomeOverlay doesn't use FadeIn).

- [ ] **Step 5: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/shared/components/FadeIn.tsx src/shared/components/FadeIn.test.tsx
git commit -m "feat: upgrade FadeIn to scroll-triggered IntersectionObserver animation"
```

---

## Task 6: NavigationBar — underline hover + active section indicator

**Files:**
- Modify: `src/shared/components/NavigationBar.tsx`

- [ ] **Step 1: Replace `src/shared/components/NavigationBar.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Typography } from '@/shared/components/Typography';
import type { NavItem } from '@/shared/site/config';

interface NavigationBarProps {
  items: NavItem[];
}

export default function NavigationBar({
  items
}: NavigationBarProps): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(true);
  const [isPastHero, setIsPastHero] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const lastScrollY = useRef(0);
  const isClicked = useRef(false);

  useEffect(() => {
    const handleScroll = (): void => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 80 && !isClicked.current) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
        isClicked.current = false;
      }

      setIsPastHero(currentScrollY > window.innerHeight * 0.5);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = items
      .map((item) => item.href.replace('#', ''))
      .filter(Boolean);

    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.4 }
      );
      observer.observe(el);
      return observer;
    });

    return () => {
      observers.forEach((obs) => obs?.disconnect());
    };
  }, [items]);

  const pillBase = [
    'flex items-center gap-1',
    'border px-2 py-1.5 sm:px-3 sm:py-2',
    'backdrop-blur-md transition-colors duration-500',
    isPastHero
      ? 'border-foreground/15 bg-background/80'
      : 'border-surface bg-surface-glass'
  ].join(' ');

  return (
    <nav
      aria-label="main navigation"
      className={[
        'fixed top-6 left-1/2 z-50 -translate-x-1/2',
        'transition-all duration-300 ease-out',
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-4 opacity-0 pointer-events-none'
      ].join(' ')}
    >
      <ul className={pillBase}>
        {items.map((item) => {
          const sectionId = item.href.replace('#', '');
          const isActive = sectionId === activeSection;

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={() => {
                  isClicked.current = true;
                  setIsVisible(true);
                }}
                className={[
                  'group block px-4 py-2 sm:py-1.5',
                  'transition-colors duration-200',
                  'hover:bg-surface-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20',
                  'active:bg-surface-tint-strong'
                ].join(' ')}
              >
                <span className="relative inline-block">
                  <Typography
                    variant="label"
                    as="span"
                    className="text-[13px] text-muted-foreground transition-colors duration-200 group-hover:text-foreground"
                  >
                    {item.name}
                  </Typography>
                  <span
                    className={[
                      'absolute -bottom-0.5 left-0 h-px w-full bg-foreground origin-left',
                      'transition-transform duration-200',
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    ].join(' ')}
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/NavigationBar.tsx
git commit -m "feat: add underline hover and active section indicator to NavigationBar"
```

---

## Task 7: HeroSection — word-by-word animation, corner brackets, scroll draw

**Files:**
- Modify: `src/features/home/components/HeroSection.tsx`

- [ ] **Step 1: Replace `src/features/home/components/HeroSection.tsx`**

```tsx
'use client';

import type { CSSProperties } from 'react';
import type { HeroContent } from '@/features/home/content';
import ProfileImage from '@/features/home/components/ProfileImage';
import SocialLinks from '@/features/home/components/SocialLinks';
import { Typography } from '@/shared/components/Typography';
import { FadeIn } from '@/shared/components/FadeIn';

export default function HeroSection({
  name,
  role,
  tagline,
  profileImage: { src, alt },
  socialLinks
}: HeroContent): React.JSX.Element {
  const d = {
    role: 320,
    tagline: 440,
    social: 560,
    image: 80,
    scroll: 700
  };

  const shortTagline = tagline.split(/[.!?]/)[0].trim();
  const nameWords = name.split(' ');

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-surface"
      aria-labelledby="hero-heading"
    >
      <div
        className="surface-grid-mask pointer-events-none-safe absolute inset-0"
        aria-hidden="true"
        style={{ '--surface-border-dim': 'rgba(var(--foreground-rgb), 0.14)' } as CSSProperties}
      />

      <div
        className={[
          'relative z-10 mx-auto grid min-h-screen w-full max-w-5xl',
          'grid-cols-1 lg:grid-cols-[1fr_auto]',
          'items-center',
          'px-6 sm:px-10 md:px-12',
          'gap-12 pt-28 pb-24',
          'lg:gap-16 lg:pt-0 lg:pb-0'
        ].join(' ')}
      >
        {/* ── Left: text content ── */}
        <div className="order-2 flex flex-col gap-7 lg:order-1 lg:justify-center lg:pr-12">

          {/* Name — word-by-word entrance */}
          <h1
            id="hero-heading"
            className="font-black leading-[1.0] tracking-tight font-serif"
            style={{ fontSize: 'clamp(2.5rem, 6.5vw, 4.5rem)' }}
          >
            {nameWords.map((word, i) => (
              <span
                key={i}
                className="inline-block animate-enter"
                style={{ '--enter-delay': `${i * 80}ms` } as CSSProperties}
              >
                {word}
                {i < nameWords.length - 1 && <>&nbsp;</>}
              </span>
            ))}
          </h1>

          {/* Role */}
          <FadeIn delay={d.role}>
            <span className="inline-flex items-center gap-2.5">
              <span className="relative flex h-2 w-2 flex-shrink-0" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping bg-foreground opacity-20" />
                <span className="relative inline-flex h-2 w-2 bg-foreground/40" />
              </span>
              <Typography
                variant="caption"
                as="span"
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground"
              >
                {role}
              </Typography>
            </span>
          </FadeIn>

          {/* Tagline */}
          <FadeIn delay={d.tagline}>
            <Typography
              variant="body-lg"
              as="p"
              className="max-w-lg leading-relaxed text-muted-foreground"
            >
              {shortTagline}.
            </Typography>
          </FadeIn>

          {/* Social links */}
          <FadeIn delay={d.social}>
            <SocialLinks links={socialLinks} />
          </FadeIn>
        </div>

        {/* ── Right: profile image with corner brackets ── */}
        <FadeIn
          delay={d.image}
          className="relative order-1 flex items-center justify-start lg:order-2 lg:justify-end"
        >
          <div className="relative">
            {/* Top-left corner bracket */}
            <span
              className="absolute -top-2 -left-2 z-20 h-5 w-5 border-l border-t border-foreground/40 pointer-events-none"
              aria-hidden="true"
            />
            {/* Bottom-right corner bracket */}
            <span
              className="absolute -bottom-2 -right-2 z-20 h-5 w-5 border-r border-b border-foreground/40 pointer-events-none"
              aria-hidden="true"
            />

            <div
              className="relative z-10 overflow-hidden bg-surface-muted"
              style={{ width: 'clamp(160px, 28vw, 300px)', aspectRatio: '1/1' }}
            >
              <ProfileImage src={src} alt={alt} />
            </div>
          </div>
        </FadeIn>
      </div>

      {/* ── Scroll indicator ── */}
      <FadeIn
        delay={d.scroll}
        className="absolute bottom-8 left-6 hidden flex-col items-start gap-3 sm:flex sm:left-10 md:left-12"
        aria-hidden="true"
      >
        <Typography
          variant="caption"
          as="span"
          className="text-[10px] font-semibold uppercase tracking-[0.15em] text-subtle-foreground/60"
        >
          scroll
        </Typography>
        <span
          className="block w-px overflow-hidden"
          style={{ height: '48px' }}
        >
          <span
            className="block h-full w-full bg-foreground/20 origin-top"
            style={{
              animation: 'draw-down 1.2s ease-out 0.7s both'
            }}
          />
        </span>
      </FadeIn>
    </section>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/home/components/HeroSection.tsx
git commit -m "feat: word-by-word hero name animation, corner brackets, scroll draw"
```

---

## Task 8: AboutSection — staggered timeline, new icons, chip hover

**Files:**
- Modify: `src/features/about/AboutSection.tsx`

- [ ] **Step 1: Replace `src/features/about/AboutSection.tsx`**

Replace the entire file. Key changes: add `'use client'`, stagger TimelineRow via `staggerDelay` prop with its own IntersectionObserver, add new icons, fix chip hover border opacity.

```tsx
'use client';

import type { JSX } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { FaJava } from 'react-icons/fa6';
import {
  SiAmazonwebservices,
  SiDart,
  SiDocker,
  SiDotnet,
  SiDrizzle,
  SiElasticsearch,
  SiExpress,
  SiFigma,
  SiFlutter,
  SiGit,
  SiGithubactions,
  SiGnubash,
  SiGo,
  SiJavascript,
  SiKubernetes,
  SiMapbox,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiOpenid,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReact,
  SiRedis,
  SiRedux,
  SiReplit,
  SiRss,
  SiSharp,
  SiSocketdotio,
  SiSpring,
  SiSqlite,
  SiStripe,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite,
  SiWebauthn
} from 'react-icons/si';
import type { AboutContent } from '@/features/about/content';
import SectionFrame from '@/shared/components/SectionFrame';
import { Typography } from '@/shared/components/Typography';
import { FadeIn } from '@/shared/components/FadeIn';
import { formatMonthYear } from '@/shared/lib/project';
import { SURFACE } from '@/shared/styles/shared';
import { CertificationsList } from '@/features/about/components/CertificationsList';

interface AboutSectionProps {
  content: AboutContent;
  contributionSlot?: React.ReactNode;
}

const getTechIcon = (label: string): JSX.Element | null => {
  const techIcons: Record<string, JSX.Element> = {
    TypeScript: <SiTypescript />,
    JavaScript: <SiJavascript />,
    Python: <SiPython />,
    Java: <FaJava />,
    Dart: <SiDart />,
    'C#': <SiSharp />,
    Go: <SiGo />,
    Bash: <SiGnubash />,
    React: <SiReact />,
    'React Native': <SiReact />,
    'Next.js': <SiNextdotjs />,
    Flutter: <SiFlutter />,
    'Node.js': <SiNodedotjs />,
    'Express.js': <SiExpress />,
    'Spring Boot': <SiSpring />,
    'ASP.NET': <SiDotnet />,
    Vite: <SiVite />,
    'Tailwind CSS': <SiTailwindcss />,
    Redux: <SiRedux />,
    PostgreSQL: <SiPostgresql />,
    PostGIS: <SiPostgresql />,
    MySQL: <SiMysql />,
    SQLite: <SiSqlite />,
    MongoDB: <SiMongodb />,
    Redis: <SiRedis />,
    Elasticsearch: <SiElasticsearch />,
    'Drizzle ORM': <SiDrizzle />,
    Prisma: <SiPrisma />,
    'Prisma ORM': <SiPrisma />,
    Docker: <SiDocker />,
    Kubernetes: <SiKubernetes />,
    AWS: <SiAmazonwebservices />,
    Vercel: <SiVercel />,
    Supabase: <SiSupabase />,
    Mapbox: <SiMapbox />,
    Figma: <SiFigma />,
    'Replit Object Storage': <SiReplit />,
    'GitHub CI/CD': <SiGithubactions />,
    'GitHub Actions': <SiGithubactions />,
    'Stripe API': <SiStripe />,
    OAuth2: <SiOpenid />,
    'OpenID Connect': <SiOpenid />,
    'JWT/OAuth2 Authentication': <SiOpenid />,
    'JWT/OAuth2': <SiOpenid />,
    WebAuthn: <SiWebauthn />,
    'Socket.io': <SiSocketdotio />,
    'WebSocket (Socket.io)': <SiSocketdotio />,
    'TanStack Query': <SiReact />,
    Git: <SiGit />,
    'RSS Parsing': <SiRss />
  };
  return techIcons[label] ?? null;
};

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography
      variant="caption"
      as="p"
      className="mb-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle-foreground"
    >
      {children}
    </Typography>
  );
}

interface SkillChipProps {
  label: string;
  icon: JSX.Element;
}

function SkillChip({ label, icon }: SkillChipProps) {
  return (
    <li>
      <span
        className={`inline-flex items-center gap-2 border border-foreground/[0.08] px-3 py-2 transition-colors duration-150 hover:border-foreground/[0.24] hover:text-foreground`}
      >
        <span
          className="flex-shrink-0 text-muted-foreground [&>svg]:h-3.5 [&>svg]:w-3.5"
          aria-hidden="true"
        >
          {icon}
        </span>
        <Typography
          variant="caption"
          as="span"
          className="text-[11px] text-muted-foreground leading-none"
        >
          {label}
        </Typography>
      </span>
    </li>
  );
}

interface TimelineRowProps {
  title: string;
  subtitle: string;
  startDate: string;
  endDate?: string | null;
  isCurrent?: boolean;
  bullets: string[];
  staggerDelay?: number;
}

function TimelineRow({ title, subtitle, startDate, endDate, isCurrent, bullets, staggerDelay = 0 }: TimelineRowProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const start = formatMonthYear(startDate);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <li ref={ref} className="group relative py-7 first:pt-0 last:pb-0">
      <span
        className="absolute left-0 top-7 bottom-7 w-px bg-foreground/0 transition-all duration-300 group-hover:bg-foreground/10"
        aria-hidden="true"
      />
      <div
        className={[
          'pl-0 transition-all duration-300 group-hover:pl-4',
          isVisible ? 'animate-enter' : 'opacity-0'
        ].join(' ')}
        style={isVisible ? ({ '--enter-delay': `${staggerDelay}ms` } as CSSProperties) : {}}
      >
        <div className="mb-1 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <Typography
            variant="h4"
            as="h4"
            className="font-semibold leading-snug transition-colors duration-200 group-hover:text-foreground"
          >
            <span className="relative inline-block after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:bg-foreground/30 after:origin-left after:scale-x-0 after:transition-transform after:duration-200 group-hover:after:scale-x-100">
              {title}
            </span>
          </Typography>
          <Typography
            variant="caption"
            as="p"
            className="flex-shrink-0 font-mono text-[11px] tabular-nums text-subtle-foreground/70"
          >
            <time dateTime={startDate}>{start}</time>
            <span className="mx-1 opacity-40">—</span>
            {isCurrent || !endDate ? (
              <span className="text-foreground/40">Present</span>
            ) : (
              <time dateTime={endDate}>{formatMonthYear(endDate)}</time>
            )}
          </Typography>
        </div>
        <Typography variant="caption" as="p" className="mb-4 text-[12px] text-subtle-foreground">
          {subtitle}
        </Typography>
        {bullets.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-[9px] h-1 w-1 flex-shrink-0 bg-foreground/20 transition-colors duration-300 group-hover:bg-foreground/40"
                />
                <Typography
                  variant="body-sm"
                  as="span"
                  className="leading-relaxed text-muted-foreground transition-colors duration-200 group-hover:text-foreground/80"
                >
                  {bullet}
                </Typography>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export default function AboutSection({ content, contributionSlot }: AboutSectionProps): React.JSX.Element {
  const { certifications, education, experience, techCategories } = content;

  const iconCategories = techCategories
    .map(({ category, items }) => ({
      category,
      items: items.filter((item) => getTechIcon(item.label) !== null)
    }))
    .filter(({ items }) => items.length > 0);

  return (
    <SectionFrame
      id="about"
      headingId="about-heading"
      eyebrow={content.eyebrow}
      title={content.title}
      intro={content.intro}
    >
      <div className="space-y-14">

        {/* ── SKILLS + CONTRIBUTION GRAPH ── */}
        {iconCategories.length > 0 && (
          <FadeIn
            delay={100}
            as="section"
            className={`border-t ${SURFACE.hairline} pt-10`}
            aria-labelledby="skills-heading"
          >
            <SectionLabel>Skills</SectionLabel>
            <div className="mb-10 space-y-7">
              {iconCategories.map(({ category, items }) => (
                <div key={category}>
                  <Typography
                    variant="caption"
                    as="p"
                    className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/25"
                  >
                    {category}
                  </Typography>
                  <ul className="flex flex-wrap gap-2">
                    {items.map((item) => {
                      const icon = getTechIcon(item.label);
                      if (!icon) return null;
                      return <SkillChip key={item.label} label={item.label} icon={icon} />;
                    })}
                  </ul>
                </div>
              ))}
            </div>
            {contributionSlot && (
              <div className={`border-t ${SURFACE.hairline} pt-8`}>
                {contributionSlot}
              </div>
            )}
          </FadeIn>
        )}

        {/* ── CREDENTIALS ── */}
        {certifications.length > 0 && (
          <FadeIn
            delay={200}
            as="section"
            className={`border-t ${SURFACE.hairline} pt-10`}
            aria-labelledby="credentials-heading"
          >
            <SectionLabel>Credentials</SectionLabel>
            <CertificationsList
              certifications={certifications}
              initialVisibleCount={content.certificationsVisibleCount}
            />
          </FadeIn>
        )}

        {/* ── EXPERIENCE ── */}
        <section
          className={`border-t ${SURFACE.hairline} pt-10`}
          aria-labelledby="experience-heading"
        >
          <SectionLabel>Experience</SectionLabel>
          <ul className="divide-y divide-foreground/5">
            {experience.map((item, index) => (
              <TimelineRow
                key={item.id}
                title={item.title}
                subtitle={item.company}
                startDate={item.startDate}
                endDate={item.endDate}
                isCurrent={item.isCurrent}
                bullets={item.responsibilities}
                staggerDelay={index * 60}
              />
            ))}
          </ul>
        </section>

        {/* ── EDUCATION ── */}
        <section
          className={`border-t ${SURFACE.hairline} pt-10`}
          aria-labelledby="education-heading"
        >
          <SectionLabel>Education</SectionLabel>
          <ul className="divide-y divide-foreground/5">
            {education.map((item, index) => (
              <TimelineRow
                key={item.id}
                title={item.degree}
                subtitle={item.school}
                startDate={item.startDate}
                endDate={item.endDate}
                isCurrent={item.isCurrent}
                bullets={item.achievements ?? []}
                staggerDelay={index * 60}
              />
            ))}
          </ul>
        </section>

      </div>
    </SectionFrame>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors. If `SiGnubash` or `SiGo` don't exist in the installed version of `react-icons`, TypeScript will report a missing export. In that case: remove the affected entry from the `getTechIcon` map (the chip simply won't render for that label — the filter already handles missing icons gracefully).

- [ ] **Step 3: Commit**

```bash
git add src/features/about/AboutSection.tsx
git commit -m "feat: staggered timeline reveals, new skill icons, refined chip hover"
```

---

## Task 9: ProjectCard hover refinement

**Files:**
- Modify: `src/features/projects/components/ProjectCard.tsx`

- [ ] **Step 1: Update `src/features/projects/components/ProjectCard.tsx`**

Replace the inner image `<div>` className to add `translateY(-2px)` on hover:

```tsx
import Image from 'next/image';
import Link from 'next/link';
import type { ProjectRecord } from '@/features/projects/types';
import { Typography } from '@/shared/components/Typography';

interface ProjectCardProps {
  project: ProjectRecord;
  isActive: boolean;
}

export function ProjectCard({
  project,
  isActive
}: ProjectCardProps): React.JSX.Element {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block h-full w-full flex-shrink-0 px-3 transition-all duration-500 select-none-safe"
      draggable={false}
    >
      <div className="mb-4 w-full text-center">
        <Typography
          variant="body"
          className={`text-center transition-all duration-500 ${isActive ? 'text-foreground' : 'text-muted-foreground'} group-hover:text-foreground`}
        >
          {project.title}
        </Typography>
      </div>

      <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-surface transition-all duration-200 group-hover:-translate-y-0.5">
        <div className="relative h-full w-full">
          <Image
            src={project.logo}
            alt={`${project.title} logo`}
            fill
            className="pointer-events-none-safe select-none-safe object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
            draggable={false}
          />
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/projects/components/ProjectCard.tsx
git commit -m "feat: add translateY hover lift to project cards"
```

---

## Task 10: WelcomeOverlay — apply Playfair Display to heading

**Files:**
- Modify: `src/shared/components/WelcomeOverlay.tsx`

- [ ] **Step 1: Update the `Typography` h1 in `WelcomeOverlay.tsx`**

Find this line (around line 181):

```tsx
<Typography variant="h1" as="h1">
  {siteConfig.overlay.title}
</Typography>
```

Replace with:

```tsx
<Typography variant="h1" as="h1" className="font-serif">
  {siteConfig.overlay.title}
</Typography>
```

- [ ] **Step 2: Run all tests**

```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/shared/components/WelcomeOverlay.tsx
git commit -m "feat: apply Playfair Display to WelcomeOverlay heading"
```

---

## Task 11: Manual visual verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open `http://localhost:3000` in a browser.

- [ ] **Step 2: Verify hero section**
  - Names "John Lester Escarlan" should animate word-by-word on load, each word sliding up in sequence (~80ms stagger)
  - Role tag and tagline should follow with delay
  - Profile image should have two L-shaped corner brackets (top-left, bottom-right), not a full offset border square
  - Scroll indicator line should draw downward (~1.2s), not fade in
  - Hero heading is visibly serif (Playfair Display)

- [ ] **Step 3: Verify typography**
  - Section titles ("A focused set of builds...", "Experience, education...") are serif
  - Body text and nav links are sans-serif (Geist)
  - Eyebrow labels (About, Selected Work, Contact) are monospace
  - Dates in timeline rows are monospace

- [ ] **Step 4: Verify scroll animations**
  - Scroll to About section — skill chips and timeline rows should fade up as they enter view
  - Timeline rows should stagger (each row ~60ms behind the previous)

- [ ] **Step 5: Verify hover states**
  - Nav links: underline grows left-to-right on hover
  - Active nav section: underline persists on the active link
  - Timeline rows: left border slides in + title underline draws on hover
  - Skill chips: border brightens on hover
  - Project cards: subtle upward lift on hover

- [ ] **Step 6: Verify content**
  - FireCheck appears as first project in the carousel
  - HEALTH description mentions "AI-assisted triage"
  - PriceCraft description mentions "edge-case-hardened"
  - Experience bullets have specific metrics (12+, 25+, 800ms→150ms, etc.)
  - Skills chips include Flutter, Dart, Go, MySQL, Figma, Elasticsearch, Mapbox

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "docs: update implementation plan — all tasks complete"
```
