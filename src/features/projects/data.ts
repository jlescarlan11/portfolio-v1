import type { ProjectRecord, ProjectsSectionContent } from './types';

export const projectsSectionContent: ProjectsSectionContent = {
  eyebrow: 'Selected Work',
  title: 'Four builds across marketplaces, civic tech, business tooling, and AI automation.',
  intro:
    'Full-stack products built around transaction integrity, offline reliability, pricing logic, and automation guardrails. Each case study focuses on the problem, the engineering decisions, and the systems delivered.',
  ctaLabel: 'View project',
};

export const projects: ProjectRecord[] = [
  {
    slug: 'rent-n-roll',
    title: 'Rent N Roll',
    category: 'Full-Stack Marketplace / Two-Sided Platform',
    description:
      'A pre-launch two-sided camera rental marketplace covering listing and photo management, booking and availability, identity verification, digital contracts, handoff confirmation, and PayMongo-based payment and deposit workflows.',
    logo: '/project/rent-n-roll.jpg',
    technologies: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Zod', 'PayMongo'],
    completedAt: '2025-12',
    links: {
      liveUrl: 'https://rentnroll.store'
    },
    caseStudy: {
      summary:
        'A pre-launch camera rental marketplace covering the full booking lifecycle, from listings and availability to identity verification, contracts, handoffs, and PayMongo-backed payments.',
      roleScope: {
        role: 'Full-Stack Engineer',
        team: 'Solo project',
        status: 'Pre-launch',
        ownership: [
          'Built the marketplace end to end across listings, discovery, booking, identity verification, contracts, handoffs, and payment workflows.',
          'Refactored the data-access layer from untyped queries to typed Supabase RPC patterns with generated types.'
        ]
      },
      overview: [
        'Built the marketplace end to end with Next.js, React, TypeScript, Supabase, and PostgreSQL, supporting equipment owners and renters across listing, discovery, booking, and handoff workflows.',
        'Refactored 24 untyped database queries into typed Supabase RPC patterns with generated types, reducing data-layer ambiguity and improving maintainability before launch.'
      ],
      impact: [
        {
          value: '24 queries',
          label: 'Typed data access',
          context:
            'Replaced 24 untyped database queries with typed Supabase RPC patterns and generated types before launch.'
        },
        {
          value: 'Full lifecycle',
          label: 'Marketplace delivery',
          context:
            'Delivered the workflow from listings and availability through verification, contracts, handoffs, payments, and deposits.'
        }
      ],
      decisions: [
        {
          title: 'Typed database boundary',
          constraint:
            'Twenty-four untyped database queries made data contracts ambiguous before launch.',
          decision:
            'Move those queries behind typed Supabase RPC patterns backed by generated types.',
          rationale:
            'Keep application and database contracts explicit as the booking lifecycle expanded.',
          validation:
            'All 24 identified queries were migrated to the typed pattern.'
        },
        {
          title: 'Provider-backed payment events',
          constraint:
            'Payment and deposit state had to follow asynchronous provider events.',
          decision:
            'Integrate payment and deposit handling through PayMongo webhooks.',
          rationale:
            'Keep marketplace payment handling aligned with events reported by the payment provider.'
        }
      ],
      highlights: [
        'Built a two-sided camera rental workflow spanning listing and photo management, availability, identity verification, digital contracts, and handoff confirmation.',
        'Integrated payment and deposit handling through PayMongo webhooks.',
        'Replaced 24 untyped database queries with typed Supabase RPC patterns and generated types.'
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
      'A civic health application for Naga City combining deterministic safety checks, Gemini-assisted triage, facility guidance, and offline clinical data; led to a top-15 finish among 200+ hackathon teams.',
    logo: '/project/health.svg',
    technologies: ['TypeScript', 'React Native', 'Expo', 'Node.js', 'Prisma', 'PostgreSQL', 'SQLite', 'Gemini API'],
    completedAt: '2026-02',
    links: {
      githubUrl: 'https://github.com/jlescarlan11/health'
    },
    caseStudy: {
      summary:
        'A civic health app combining deterministic safety checks, Gemini-assisted triage, and offline clinical records to help residents identify an appropriate next level of care.',
      roleScope: {
        role: 'Team Lead / Full-Stack Engineer',
        team: 'Five-person hackathon team',
        status: 'Hackathon semi-finalist',
        ownership: [
          'Led a five-person team in building symptom assessment, facility discovery, medication records, and YAKAP enrollment guidance.',
          'Combined SQLite-backed offline data with the Node.js, Prisma, and PostgreSQL backend.'
        ]
      },
      overview: [
        'Led a five-person team in building a React Native and Expo application that guides Naga City residents through symptom assessment, local-facility discovery, medication records, and YAKAP enrollment information.',
        'Combined SQLite-based offline data with a Node.js, Express, Prisma, and PostgreSQL backend, while deterministic emergency and mental-health checks run before eligible requests reach Gemini.'
      ],
      impact: [
        {
          value: 'Top 15 / 200+',
          label: 'Hackathon result',
          context:
            'The five-person team reached the semi-finals, placing in the top 15 of 200+ teams at the 1st Naga City Mayoral Hackathon.'
        },
        {
          value: 'Offline records',
          label: 'Continuity without connectivity',
          context:
            'Assessments, medication records, and facility data remain available locally, with synchronization when connectivity returns.'
        }
      ],
      decisions: [
        {
          title: 'Deterministic safety gate',
          constraint:
            'Emergency and mental-health inputs required predictable handling before any AI-assisted triage.',
          decision:
            'Run deterministic emergency and mental-health checks before eligible requests reach Gemini.',
          rationale:
            'Keep urgent safety decisions outside the generative-model request path.',
          tradeoff:
            'Only inputs that clear the deterministic checks are eligible for Gemini-assisted triage.'
        },
        {
          title: 'Offline-first clinical data',
          constraint:
            'Residents may need assessment, medication, and facility information without reliable connectivity.',
          decision:
            'Persist those records in SQLite and synchronize them with the backend when connectivity returns.',
          rationale:
            'Preserve access to the supported clinical workflows while the device is offline.'
        }
      ],
      highlights: [
        'Led a five-person team to the semi-finals, placing in the top 15 of 200+ teams at the 1st Naga City Mayoral Hackathon.',
        'Gated emergency and mental-health inputs with deterministic checks before any Gemini request.',
        'Persisted assessments, medication records, and facility data locally, with synchronization when connectivity returns.'
      ]
    }
  },
  {
    slug: 'pricecraft',
    title: 'PriceCraft',
    category: 'Web Application / Business Tooling',
    description:
      'A pricing and cost-planning application for small food businesses, combining live margin calculations with reusable recipe variants, offline-first use, Supabase-backed accounts and synchronization, and portable JSON backups.',
    logo: '/project/pricecraft.svg',
    technologies: ['TypeScript', 'React', 'Vite', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Vitest'],
    completedAt: '2026-01',
    links: {
      githubUrl: 'https://github.com/jlescarlan11/pricecraft',
      liveUrl: 'https://pricecraft.netlify.app/'
    },
    caseStudy: {
      summary:
        'An offline-capable pricing tool that turns ingredient, labor, and overhead costs into clear selling-price decisions for small food businesses.',
      roleScope: {
        role: 'Full-Stack Engineer',
        status: 'Live',
        ownership: [
          'Built the pricing workflow across ingredient, labor, overhead, markup, and profit-margin calculations.',
          'Added reusable recipe variants, offline operation, Supabase accounts and synchronization, guest-data migration, and portable backups.'
        ]
      },
      overview: [
        'Built PriceCraft to replace spreadsheet-heavy pricing workflows with immediate cost breakdowns, markup and profit-margin strategies, and visual margin indicators.',
        'Expanded the calculator with reusable base recipes and product variants, offline operation, Supabase authentication and synchronization, Row-Level Security, guest-data migration, and JSON import and export.'
      ],
      impact: [
        {
          value: '2 strategies',
          label: 'Pricing coverage',
          context:
            'Calculates selling prices with both markup and profit-margin strategies across ingredient, labor, and overhead costs.'
        },
        {
          value: 'Offline-capable',
          label: 'Workflow continuity',
          context:
            'Supports guest use and offline changes, then synchronizes authenticated account data through Supabase.'
        },
        {
          value: 'Portable data',
          label: 'Backup and migration',
          context:
            'Supports guest-data migration plus JSON import and export for portable backups.'
        }
      ],
      decisions: [
        {
          title: 'Reusable recipe variants',
          constraint:
            'Related products needed to share a base recipe without duplicating shared ingredient costs.',
          decision:
            'Model reusable base recipes and allocate shared costs across product variants.',
          rationale:
            'Keep variant pricing comparable while retaining one source for shared recipe costs.'
        },
        {
          title: 'Guest-first offline persistence',
          constraint:
            'The calculator needed to remain useful before sign-in and during connectivity loss.',
          decision:
            'Support local guest changes, optional Supabase authentication and synchronization, and guest-data migration.',
          rationale:
            'Let users begin and continue pricing work without making an account or active connection a prerequisite.'
        }
      ],
      highlights: [
        'Calculates ingredient, labor, and overhead costs using both markup and profit-margin pricing strategies.',
        'Allocates shared recipe costs across product variants and compares resulting margins.',
        'Supports guest use, offline changes, authenticated cloud synchronization, account migration, and portable backups.'
      ]
    }
  },
  {
    slug: 'job-pipeline',
    title: 'Job Pipeline',
    category: 'AI Automation / Developer Tooling',
    description:
      'A three-workflow n8n system that collects OnlineJobs.ph listings, deduplicates them across active and archived Google Sheets, drafts tailored messages with Groq, and archives processed rows using rate-aware batching and prompt guardrails for manual review.',
    logo: '',
    technologies: ['n8n', 'Groq API', 'Google Sheets API', 'JavaScript', 'Prompt Engineering'],
    completedAt: '2025-11',
    links: {
      githubUrl: 'https://github.com/jlescarlan11/Job-Pipeline'
    },
    caseStudy: {
      summary:
        'An automated job-application workflow for collecting listings, drafting tailored messages, and archiving processed results while preserving manual review before sending.',
      roleScope: {
        role: 'Workflow Automation Engineer',
        ownership: [
          'Connected OnlineJobs.ph, n8n, Groq, and Google Sheets across independently scheduled scraping, drafting, and archival workflows.',
          'Added cross-sheet deduplication, generation guardrails, per-run limits, and rate-aware batching while preserving manual review.'
        ]
      },
      overview: [
        'Connected OnlineJobs.ph, n8n, Groq, and Google Sheets through three independently scheduled workflows for scraping, message generation, and archival.',
        'Added cross-sheet deduplication, URL and project whitelists, banned-language checks, self-review instructions, per-run generation limits, and rate-aware batching to keep generated drafts grounded and processing predictable.'
      ],
      impact: [
        {
          value: '3 workflows',
          label: 'Automation coverage',
          context:
            'Separates listing collection, tailored-message drafting, and processed-row archival into three independently scheduled n8n workflows.'
        },
        {
          value: '2-sheet check',
          label: 'Duplicate prevention',
          context:
            'Checks both active and archived Google Sheets before inserting a listing for processing.'
        },
        {
          value: 'Human-reviewed',
          label: 'Sending boundary',
          context:
            'Produces constrained message drafts while retaining manual review before anything is sent.'
        }
      ],
      decisions: [
        {
          title: 'Cross-sheet deduplication',
          constraint:
            'A listing could already exist in either the active queue or the processed archive.',
          decision:
            'Check both Google Sheets before inserting a newly collected listing.',
          rationale:
            'Prevent the independently scheduled workflows from processing the same listing again.'
        },
        {
          title: 'Guarded draft generation',
          constraint:
            'Generated messages needed to stay grounded and processing had to remain predictable under provider limits.',
          decision:
            'Apply URL and project whitelists, banned-language checks, self-review instructions, per-run limits, and rate-aware batching.',
          rationale:
            'Constrain draft content and bound each generation run.',
          tradeoff:
            'The workflow stops at a draft and keeps final review and sending manual.'
        }
      ],
      highlights: [
        'Automated listing collection, tailored-message drafting, and result archival across three n8n workflows.',
        'Prevented repeated processing by checking both active and archived Google Sheets before inserting a listing.',
        'Constrained Groq-generated drafts with explicit whitelists, validation rules, self-check instructions, and per-run limits while retaining manual review before sending.'
      ]
    }
  }
];
