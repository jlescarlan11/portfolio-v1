# Portfolio v1 — UI/UX Redesign & Content Update

**Date:** 2026-04-30  
**Status:** Approved  
**Scope:** Visual elevation (typography, motion, component polish) + content sync to resume

---

## 1. Goals

1. Elevate the visual quality of the portfolio without changing structure, layout order, or color palette.
2. Sync all work experience, project descriptions, and skills to match the current resume (`public/John_Lester_Escarlan_Resume.pdf`).
3. Add FireCheck as a new featured project.

---

## 2. Aesthetic Direction

**Refined minimalism** — same monochromatic (black/white) palette, same section order, elevated execution.

The single biggest change is the typography system. Everything else (motion, component polish) serves the typography upgrade.

---

## 3. Typography System

### Fonts

| Role | Font | Weights |
|------|------|---------|
| Display / Headings | Playfair Display | 400, 600, 700, 900 |
| Body / UI | Geist | 300, 400, 500, 600 |
| Labels / Captions / Dates | Geist Mono | 400 |

**Poppins is removed entirely.**

### Font Application

- **Hero name** → Playfair Display 900, tight tracking, `clamp(2.5rem, 6.5vw, 4.5rem)`
- **Section titles** (e.g. "Experience, education, and the stack behind it.") → Playfair Display 700
- **Body paragraphs, bullet points, project descriptions** → Geist 400
- **Eyebrow labels** (`About`, `Selected Work`, `Contact`), role tag, dates → Geist Mono, uppercase, `tracking-[0.12em]`
- **Skill chips, nav links, buttons, captions** → Geist 500
- **WelcomeOverlay** → Playfair Display (matches first-load experience)

### Layout Adjustments

Geist is more condensed than Poppins. Adjust:
- `leading-relaxed` on body paragraphs (body-lg class: increase to `leading-[1.8]`)
- `max-w-md` on hero tagline may need to widen slightly to `max-w-lg`
- Skill chip padding: increase from `px-2.5 py-1.5` to `px-3 py-2` to compensate for Geist's narrower metrics

---

## 4. Motion & Interactions

### Hero Entrance (high-impact)

- Hero name animates word-by-word: each word of "John Lester Escarlan" slides up (`translateY(20px)→0`) and fades in, with 80ms stagger between words.
- Role tag fades in 150ms after name completes.
- Tagline fades in 150ms after role tag.
- Profile image fades in with subtle scale `0.96→1`, `duration-700`.
- Total choreography completes within ~800ms.
- Scroll indicator line: CSS height animates `0→48px` on load (`duration-[1200ms] ease-out`) instead of opacity fade.

### Scroll-Triggered Section Reveals

- Update `FadeIn` component to use `IntersectionObserver` instead of mount-only animation.
- Each section (`#projects`, `#about`, `#contact`) triggers fade-up when entering viewport.
- Within `AboutSection`, `TimelineRow` entries stagger 60ms apart on scroll entry.
- `threshold: 0.1` for trigger, `rootMargin: '0px 0px -40px 0px'` to fire slightly before fully visible.

### Hover States

| Element | Current | Updated |
|---------|---------|---------|
| Nav links | None | Underline grows left→right (`scaleX 0→1`, 200ms ease) |
| Timeline rows | Left border slide + text color | Same + title underline draw on hover |
| Skill chips | Border brightens | Border `foreground/8→foreground/24`, 150ms ease |
| Project cards | Grayscale lift + scale | Add `translateY(-2px)`, 200ms ease |

### Explicitly Out of Scope

- No parallax
- No cursor effects
- No scroll-jacking
- No JS animation libraries (CSS-only + IntersectionObserver)

---

## 5. Content Updates

### 5a. Experience Bullets (`src/features/about/content.ts`)

**Freelance Software Engineer (Upwork) — Jan 2026–Present:**
```
- Resolved 12+ production-blocking bugs with average turnaround under 24 hours, restoring client workflows fast.
- Rebuilt internal release automation, cutting 15+ manual steps and reclaiming roughly 4 engineering hours per week for the team.
- Shipped 3 client-facing features end-to-end across React, TypeScript, and Node.js stacks, scoping requirements directly with non-technical stakeholders before writing a line of code.
- Wrote technical documentation and API specs for client handoff, reducing onboarding time for new contributors from 1 week to 2 days.
```

**Software Monitoring Engineer (Wind's Gate Philippines) — Jun 2025–Jan 2026:**
```
- Caught and escalated 25+ incidents across 8 production services before they reached end users, owning live uptime visibility for the team.
- Traced incidents from raw logs to root cause and redesigned the team's incident report format, cutting average triage time by 30%.
- Authored 8+ runbooks documenting recovery procedures for recurring incidents, enabling on-call engineers to resolve Tier 1 issues without escalation.
```

**Software Engineer Intern (Alliance Software Inc.) — Jun 2025–Jul 2025:**
```
- Delivered 5 production features into live client codebases at one of the Philippines' largest software firms.
- Worked across the full stack using C# and ASP.NET MVC on enterprise applications used by thousands of daily users.
- Participated in code reviews, pair programming, and agile ceremonies with senior engineers.
```

**Full-Stack Developer Intern (Bayoa Analytics) — Sep 2024–Nov 2024:**
```
- Diagnosed N+1 query patterns and schema bottlenecks, cutting API response time from 800ms to 150ms on top-traffic endpoints.
- Built 10+ REST API endpoints using Node.js and Express to power a new analytics dashboard feature.
- Wrote reusable React components with TypeScript and Tailwind CSS, speeding up feature delivery for downstream teams.
```

Also update company label for Freelance from `'Remote'` to `'Upwork — Remote'`.

### 5b. New Project — FireCheck (`src/features/projects/data.ts`)

Add as the first entry in the `projects` array:

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
}
```

### 5c. Updated Project Descriptions

**HEALTH** — update `description` and `caseStudy`:
```
description: 'An AI-assisted triage and offline care guide — Semi-Finalist (top 15 of 200+ teams) at the 1st Naga City Mayoral Hackathon, built for reliable use in low-connectivity areas.'

caseStudy.summary: 'A civic health app that safety-gates AI triage through deterministic logic and keeps 100% of core features usable offline.'

caseStudy.highlights[0]: 'Led a 5-man team to Semi-Finalist (top 15 of 200+ teams) at the 1st Naga City Mayoral Hackathon.'
caseStudy.highlights[1]: 'Safety-gates AI triage through deterministic logic — AI suggestions never bypass hard clinical rules.'
caseStudy.highlights[2]: '100% of core features usable offline via SQLite local persistence.'
```

**PriceCraft** — update `description` and `caseStudy.summary`:
```
description: 'A live profit pricing calculator for small-business operators — edge-case-hardened (zero-cost, negative margins, rounding) so non-technical users get correct prices on the first try.'

caseStudy.summary: 'A pricing tool engineered around the edge cases that break generic calculators — zero-cost inputs, negative margins, and rounding — for small Filipino food businesses.'
```

### 5d. Skills Additions (`src/features/about/content.ts`)

**Languages** — add: `Dart`, `Go`, `C`, `C++`, `SQL`, `Bash`

**Frameworks & Libraries** — add: `Flutter`, `Redux`, `Riverpod`, `Drift`

**Infrastructure** — add: `MySQL`, `Elasticsearch`, `Postman`, `Jira`, `Figma`, `Mapbox`

Also add corresponding icons to `getTechIcon` in `AboutSection.tsx` for: Flutter (`SiFlutter`), Redux (`SiRedux`), Riverpod (no icon — omit from chip display), Drift (no icon — omit), MySQL (`SiMysql`), Elasticsearch (`SiElasticsearch`), Figma (`SiFigma`), Mapbox (`SiMapbox`), Dart (`SiDart`), Go (`SiGo`), Bash (`SiGnubash`).

---

## 6. Component-Level Visual Changes

### Hero Section (`HeroSection.tsx`)

- Replace single offset border with two L-shaped corner brackets (top-left and bottom-right) — each arm is 20px long, 1px stroke, using two `<span>` elements with `border-top border-left` and `border-bottom border-right` respectively, positioned absolute at corners of the image container.
- Scroll indicator: change from fade-in to height-draw animation (`h-0→h-12`, `duration-[1200ms] ease-out`).
- Grid texture: increase opacity from current `0.1` to `0.14` — apply via inline `style` on the grid texture `<div>` in `HeroSection.tsx` overriding `--surface-border-dim` locally, not globally.

### Navigation Bar (`NavigationBar.tsx`)

- Add underline hover effect on nav links: inner `<span>` with `block h-px w-full bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left`.
- Add active section underline: same `<span>` with `scale-x-100` when section is active. Remove any existing active indicator.

### Section Frames — eyebrow + title font classes

- Eyebrow labels: ensure Geist Mono class applied (e.g. `font-mono`).
- Section titles: add Playfair Display class (e.g. `font-serif` mapped to Playfair in Tailwind theme).

### Timeline Rows (`AboutSection.tsx` — `TimelineRow`)

- Add scroll-triggered stagger via updated `FadeIn` + `style={{ '--enter-delay': `${index * 60}ms` }}`.
- Title hover: add underline draw (`text-decoration` + `transition` or `scaleX` span trick).

### Skill Chips (`AboutSection.tsx` — `SkillChip`)

- Ensure no `rounded` class is applied (chips must be square-cornered).
- Border transition: `border-foreground/8 hover:border-foreground/24` at `duration-150`.

### WelcomeOverlay (`WelcomeOverlay.tsx`)

- Apply Playfair Display to heading/name text inside the overlay.

---

## 7. Files Changed

| File | Change type |
|------|-------------|
| `src/app/layout.tsx` | Replace Poppins with Playfair Display (next/font/google) + Geist (geist npm package) |
| `src/app/globals.css` | Update `--font-sans`, `--font-mono`, add `--font-serif`; adjust type scale classes |
| `src/shared/components/FadeIn.tsx` | Add IntersectionObserver scroll-trigger support |
| `src/shared/components/NavigationBar.tsx` | Nav link underline hover effect |
| `src/shared/components/WelcomeOverlay.tsx` | Apply Playfair Display to heading |
| `src/features/home/components/HeroSection.tsx` | Word-by-word name animation, corner brackets, scroll indicator draw |
| `src/features/about/AboutSection.tsx` | Staggered TimelineRow reveals, skill chip hover polish, icon additions |
| `src/features/about/content.ts` | Updated experience bullets, skills additions |
| `src/features/projects/data.ts` | Add FireCheck, update HEALTH + PriceCraft descriptions |
| `src/features/projects/components/ProjectCard.tsx` | Add `translateY(-2px)` hover effect |

---

## 8. Out of Scope

- Section order or layout restructuring
- Color palette changes (stays monochromatic)
- Project card carousel mechanics or hooks
- Contact section copy
- Test files
- Any new pages or routes
