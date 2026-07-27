import type { ProjectRecord, ProjectsSectionContent } from './types';

export const projectsSectionContent: ProjectsSectionContent = {
  eyebrow: 'Selected Work',
  title: 'Four builds. Marketplace, civic tech, business tooling, and AI automation.',
  intro:
    'End-to-end ownership across different problem spaces — from a solo-built rental marketplace with escrow and identity verification to an LLM-powered job application pipeline. Each project has real stakes and ships to real users.',
  ctaLabel: 'View project',
};

export const projects: ProjectRecord[] = [
  {
    slug: 'rent-n-roll',
    title: 'Rent N Roll',
    category: 'Full-Stack Marketplace / Two-Sided Platform',
    description:
      'A solo-built two-sided rental marketplace — listing management with photo uploads, multi-tier volume pricing, contract e-signatures, custodial escrow via PayMongo webhooks, identity verification, booking handoff scheduling, and dispute adjudication.',
    logo: '/project/rent-n-roll.jpg',
    technologies: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'Supabase', 'Zod', 'PayMongo'],
    completedAt: '2025-12',
    links: {
      liveUrl: 'https://rentnroll.store'
    },
    caseStudy: {
      summary:
        'A production rental marketplace architected solo — custodial escrow, identity verification, and dispute adjudication built from scratch.',
      overview: [
        'Rent N Roll handles the full lifecycle of a rental transaction: discovery, booking, identity verification, contract e-signature, escrow via PayMongo webhooks, handoff scheduling, and dispute resolution — all architected and shipped by one engineer.',
        'The data layer was migrated from 24 untyped database queries to Supabase RPC patterns with server-side type generation, eliminating a class of runtime errors before launch.'
      ],
      highlights: [
        'Architected full-stack marketplace solo: escrow, e-signatures, identity verification, and dispute adjudication.',
        'Led data layer migration eliminating 24 untyped queries through Supabase RPC patterns and server-side type generation.',
        'Multi-tier volume pricing and custodial escrow via PayMongo webhooks.'
      ],
      gallery: [
        '/project/rent-n-roll.jpg',
        '/project/rent-n-roll-listing.jpg'
      ]
    }
  },
  {
    slug: 'health',
    title: 'HEALTH',
    category: 'Mobile Application / Civic Tech',
    description:
      'An AI-assisted triage and offline care guide — Semi-Finalist (top 15 of 200+ teams) at the 1st Naga City Mayoral Hackathon, built for reliable use in low-connectivity areas.',
    logo: '/project/health.svg',
    technologies: ['TypeScript', 'React Native', 'Expo', 'Node.js', 'Prisma', 'PostgreSQL', 'SQLite'],
    completedAt: '2026-02',
    links: {
      githubUrl: 'https://github.com/jlescarlan11/health'
    },
    caseStudy: {
      summary:
        'A civic health app that safety-gates AI triage through deterministic logic and keeps 100% of core features usable offline.',
      overview: [
        'HEALTH combined local-first mobile behavior with healthcare decision support so residents could navigate care options without depending on a stable network connection.',
        'The project centered on practical usability: facility discovery, enrollment guidance, and language that helped users move from uncertainty to the next action.'
      ],
      highlights: [
        'Led a 5-man team to Semi-Finalist (top 15 of 200+ teams) at the 1st Naga City Mayoral Hackathon.',
        'Safety-gates AI triage through deterministic logic — AI suggestions never bypass hard clinical rules.',
        '100% of core features usable offline via SQLite local persistence.'
      ]
    }
  },
  {
    slug: 'pricecraft',
    title: 'PriceCraft',
    category: 'Web Application / Business Tooling',
    description:
      'A live profit pricing calculator for small-business operators — edge-case-hardened (zero-cost, negative margins, rounding) so non-technical users get correct prices on the first try.',
    logo: '/project/pricecraft.svg',
    technologies: ['TypeScript', 'React', 'Vite', 'Tailwind CSS'],
    completedAt: '2026-01',
    links: {
      githubUrl: 'https://github.com/jlescarlan11/pricecraft',
      liveUrl: 'https://pricecraft.netlify.app/'
    },
    caseStudy: {
      summary:
        'A pricing tool engineered around the edge cases that break generic calculators — zero-cost inputs, negative margins, and rounding — for small Filipino food businesses.',
      overview: [
        'PriceCraft was built to make pricing decisions legible for small food entrepreneurs. Instead of burying cost assumptions in spreadsheets, the app surfaces margin, labor, and overhead tradeoffs in one clear workflow.',
        'The build focused on practical usability, fast calculation feedback, and a responsive layout that works in low-resource environments.'
      ],
      highlights: [
        'Targeted at small Filipino food businesses — a specific, underserved use case.',
        'Deployed live at pricecraft.netlify.app.',
        'Edge-case-hardened: handles zero-cost inputs, negative margins, and rounding correctly.'
      ]
    }
  },
  {
    slug: 'job-pipeline',
    title: 'Job Pipeline',
    category: 'AI Automation / Developer Tooling',
    description:
      'A 3-workflow n8n automation pipeline that scrapes job listings, generates tailored application messages via Groq llama-3.3-70b, and auto-archives processed entries — with deterministic guardrails to prevent LLM hallucinations.',
    logo: '',
    technologies: ['n8n', 'Groq API', 'Google Sheets API', 'JavaScript', 'Prompt Engineering'],
    completedAt: '2025-11',
    links: {
      githubUrl: 'https://github.com/jlescarlan11/Job-Pipeline'
    },
    caseStudy: {
      summary:
        'An end-to-end LLM-powered job application pipeline eliminating manual scraping, writing, and archiving steps.',
      overview: [
        'The pipeline connects OnlineJobs.ph → n8n → Groq API → Google Sheets across three discrete workflows: a scraper, a generator, and an archiver. Processing runs end-to-end with zero manual steps between stages.',
        'The LLM step uses a deterministic master prompt with URL/project whitelists, banned-phrase enforcement, and self-check guardrails. Per-run generation caps and rate-limit-aware batching keep the pipeline reliable and cost-controlled.'
      ],
      highlights: [
        'End-to-end automation: scrape → generate → archive with zero manual steps between.',
        'Deterministic LLM guardrails: URL/project whitelists, banned phrases, and self-check prompts to prevent hallucinations.',
        'Dedup across active and archived sheets with per-run caps and rate-limit-aware batching.'
      ]
    }
  }
];
