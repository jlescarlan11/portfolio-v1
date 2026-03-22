# John Lester Escarlan — Developer Portfolio

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> Personal developer portfolio showcasing full-stack builds across product, backend, and developer tooling.

**Live →** [johnlesterescarlan.netlify.app](https://johnlesterescarlan.netlify.app)

---

## Overview

This is the source code for my personal portfolio site — built with Next.js 15 and the App Router, designed to present a focused set of projects including **Kaizen** (personal finance for Filipino students), **HEALTH** (AI-powered healthcare navigation), and **PriceCraft**. The architecture follows a feature-based structure for clean separation of concerns and long-term maintainability.

---

## Tech Stack

| Layer     | Technology                                                   |
| --------- | ------------------------------------------------------------ |
| Framework | Next.js 15 (App Router)                                      |
| UI        | React 19                                                     |
| Language  | TypeScript                                                   |
| Styling   | Tailwind CSS 4                                               |
| Icons     | React Icons                                                  |
| Testing   | Vitest · Node Test Runner · React Testing Library · Jest DOM |
| Tooling   | ESLint · Turbopack                                           |

---

## Getting Started

### Prerequisites

- Node.js 18+
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
NEXT_PUBLIC_SITE_URL=https://johnlesterescarlan.netlify.app
NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

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
- **Portfolio:** [johnlesterescarlan.netlify.app](https://johnlesterescarlan.netlify.app)
- **Email:** Available via the contact section on the live site

---

_Designed and built by John Lester Escarlan._
