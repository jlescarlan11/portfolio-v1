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
      problem: {
        audience:
          'Camera owners who want to make equipment available and renters who need to find and book it.',
        challenge:
          'A two-sided rental requires listings, availability, identity checks, contracts, handoffs, payments, and deposits to remain consistent across one booking lifecycle.',
        stakes:
          'If those steps are handled as disconnected records, either party can lose a clear view of what must happen next and which booking state is authoritative.',
        constraints: [
          'The marketplace is still pre-launch, so delivered workflow coverage must not be presented as adoption or live operating evidence.',
          'Payment and deposit state arrives asynchronously through PayMongo events.',
          'Twenty-four untyped database queries made application and database contracts ambiguous as the lifecycle expanded.'
        ]
      },
      solution: {
        summary:
          'Rent N Roll brings both sides of a camera rental into one marketplace workflow from discovery through return.',
        workflow: [
          'Owners publish equipment, photos, pricing, and availability.',
          'Renters discover equipment, complete the supported verification and contract steps, and request an available booking.',
          'The marketplace tracks payment, deposit, handoff, and return state around the same booking record.'
        ]
      },
      learnings: {
        lessons: [
          'Typed RPC boundaries make a growing booking lifecycle easier to review and maintain.',
          'Asynchronous provider events need to remain the authority for payment and deposit state.'
        ],
        improvements: [
          'Exercise the complete booking, handoff, return, and exception paths with launch users before expanding marketplace scope.'
        ],
        unvalidated: [
          'Marketplace adoption and live operating behavior remain unvalidated because the project is pre-launch.'
        ]
      },
      impact: [
        {
          kind: 'implementation',
          value: '24 queries',
          label: 'Typed data access',
          context:
            'Replaced 24 untyped database queries with typed Supabase RPC patterns and generated types before launch.'
        },
        {
          kind: 'product',
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
      visuals: [
        {
          kind: 'hero',
          src: '/project/rent-n-roll.jpg',
          alt:
            'Rent N Roll browse page showing DSLR, mirrorless, camcorder, and action-camera categories.',
          caption:
            'The marketplace starts with category-led discovery so renters can narrow the equipment they want to browse.'
        },
        {
          kind: 'supporting',
          section: 'solution',
          src: '/project/rent-n-roll-listing.jpg',
          alt:
            'Rent N Roll equipment detail page with product photos, daily price, deposit amount, booking notice, and availability calendar.',
          caption:
            'The listing view keeps product media, price, deposit information, booking constraints, and availability in one decision point.'
        }
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
        role: 'Project and Technical Lead',
        team: 'Five-person hackathon team',
        status: 'Hackathon semi-finalist; repository archived',
        ownership: [
          'Led a five-person team in building symptom assessment, facility discovery, medication records, and YAKAP enrollment guidance.',
          'Combined SQLite-backed offline data with the Node.js, Prisma, and PostgreSQL backend.'
        ]
      },
      problem: {
        audience:
          'Naga City residents who need help identifying an appropriate next level of care, including when connectivity is unreliable.',
        challenge:
          'Symptom guidance, nearby-facility information, medication records, and enrollment guidance can span disconnected sources, while emergency and mental-health inputs require predictable handling.',
        stakes:
          'Urgent safety decisions cannot depend on a generative response, and supported care information still needs to remain available during connectivity loss.',
        constraints: [
          'The product was built by a five-person team within a hackathon timeline.',
          'Only supported clinical, medication, assessment, and facility data can be represented as available offline.',
          'Emergency and mental-health inputs must be resolved before any eligible request reaches Gemini.'
        ]
      },
      solution: {
        summary:
          'HEALTH combines deterministic safety checks, assisted triage, local care information, and offline clinical records in one civic health workflow.',
        workflow: [
          'Residents enter symptoms and encounter deterministic emergency or mental-health handling before any AI-assisted path.',
          'Eligible inputs can receive Gemini-assisted triage and local-facility guidance.',
          'Assessments, medication records, and facility data remain on the device and synchronize when connectivity returns.'
        ]
      },
      learnings: {
        lessons: [
          'Deterministic safety gates keep urgent decisions outside the generative-model request path.',
          'Offline claims need to describe the exact records and workflows supported rather than imply universal coverage.'
        ],
        improvements: [
          'A future iteration would require clinical review and field testing before the guidance could be treated as production care infrastructure.'
        ],
        unvalidated: [
          'The hackathon result does not validate clinical effectiveness, resident adoption, or production reliability.'
        ]
      },
      impact: [
        {
          kind: 'product',
          value: 'Top 15 / 200+',
          label: 'Hackathon result',
          context:
            'The five-person team reached the semi-finals, placing in the top 15 of 200+ teams at the 1st Naga City Mayoral Hackathon.'
        },
        {
          kind: 'product',
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
      ],
      visuals: []
    }
  },
  {
    slug: 'pricecraft',
    title: 'PriceCraft',
    category: 'Web Application / Business Tooling',
    description:
      'A live, installable pricing PWA for small food businesses, combining recipe and variant costing, offline and cloud synchronization, a personal ingredient catalog, and receipt capture with OCR-assisted item extraction.',
    logo: '/project/pricecraft.svg',
    technologies: ['TypeScript', 'React', 'Vite', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Tesseract.js', 'Vitest', 'Vite PWA'],
    completedAt: '2026-05',
    links: {
      githubUrl: 'https://github.com/jlescarlan11/pricecraft',
      liveUrl: 'https://pricecraft.netlify.app/'
    },
    caseStudy: {
      summary:
        'An installable, offline-capable pricing tool that turns costs into selling-price decisions and converts reviewed receipt lines into reusable ingredient and price-history records.',
      roleScope: {
        role: 'Full-Stack Engineer',
        team: 'Solo project',
        status: 'Live',
        ownership: [
          'Built the pricing workflow across ingredient, labor, overhead, markup, and profit-margin calculations.',
          'Expanded the product with recipe variants, a personal ingredient catalog, receipt capture and OCR-assisted extraction, price-drift review, offline operation, and Supabase synchronization.'
        ]
      },
      problem: {
        audience:
          'Small food businesses that need repeatable selling-price decisions as ingredient costs change.',
        challenge:
          'Pricing work is often split across spreadsheets, with changing ingredient costs entered repeatedly and shared recipe costs duplicated across related products.',
        stakes:
          'That fragmentation makes real margins harder to understand, shared costs harder to reuse, and pricing work less dependable when connectivity is unreliable.',
        constraints: [
          'The calculator must remain useful before sign-in and during connectivity loss.',
          'Related product variants need one source for shared recipe costs.',
          'Noisy receipt OCR output cannot be trusted to update ingredient costs without user review.'
        ]
      },
      solution: {
        summary:
          'PriceCraft turns recipe costs into selling-price decisions and carries reviewed receipt changes into a reusable ingredient catalog.',
        workflow: [
          'A business records ingredients, labor, overhead, and shared recipe costs, then compares markup and profit-margin pricing.',
          'Related variants reuse a base recipe so shared costs remain consistent across products.',
          'Captured receipt lines stay editable until the user confirms catalog or price-history updates, while local changes remain available offline and can synchronize after sign-in.',
          'Authenticated records synchronize through Supabase with Row-Level Security, while guest-data migration and JSON import and export preserve continuity and portability.'
        ]
      },
      learnings: {
        lessons: [
          'Human confirmation is the safer boundary when OCR output can change cost data.',
          'Guest-first local persistence makes the core pricing workflow useful without turning an account or active connection into a prerequisite.'
        ],
        improvements: [
          'Validate receipt extraction against a broader range of layouts and make price-drift reconciliation easier to review in batches.'
        ],
        unvalidated: [
          'User adoption, pricing time saved, and business-margin improvement have not been measured.'
        ]
      },
      impact: [
        {
          kind: 'product',
          value: '2 strategies',
          label: 'Pricing coverage',
          context:
            'Calculates selling prices with both markup and profit-margin strategies across ingredient, labor, and overhead costs.'
        },
        {
          kind: 'product',
          value: 'Offline-capable',
          label: 'Workflow continuity',
          context:
            'Supports guest use and offline changes, then synchronizes authenticated account data through Supabase.'
        },
        {
          kind: 'implementation',
          value: '300+ tests',
          label: 'Regression coverage',
          context:
            'Covers pricing logic, persistence, migration, catalog, and interface behavior with more than 300 unit and integration tests.'
        },
        {
          kind: 'product',
          value: 'Receipt to catalog',
          label: 'Cost capture',
          context:
            'Turns user-reviewed receipt lines into new catalog ingredients or updated price-history records.'
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
          title: 'Human-confirmed receipt extraction',
          constraint:
            'Receipt text is noisy and cannot safely update ingredient costs without review.',
          decision:
            'Preprocess captured images, extract candidate lines through the available OCR path, and require editable confirmation before catalog or price-history writes.',
          rationale:
            'Reduce re-entry work without treating uncertain OCR output as trusted pricing data.',
          tradeoff:
            'The user remains responsible for checking names, quantities, units, and prices before saving.'
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
        'Captures receipts, extracts candidate items, and requires user confirmation before updating the ingredient catalog and price history.',
        'Supports installable PWA use, offline changes, authenticated cloud synchronization, account migration, and portable backups.'
      ],
      visuals: []
    }
  },
  {
    slug: 'job-pipeline',
    title: 'Job Pipeline',
    category: 'AI Automation / Developer Tooling',
    description:
      'A seven-workflow, resume-driven n8n system that discovers and ranks OnlineJobs.ph listings, builds evidence-supported application packs with Groq, alerts through Slack, records manual outcomes, and publishes guarded analytics and recommendations without submitting applications.',
    logo: '',
    technologies: ['n8n', 'Node.js', 'JavaScript', 'Groq API', 'Google Sheets API', 'Google Apps Script', 'Slack Webhooks'],
    completedAt: '2026-07',
    links: {
      githubUrl: 'https://github.com/jlescarlan11/Job-Pipeline'
    },
    caseStudy: {
      summary:
        'A policy-driven job discovery and application-review system that coordinates seven disabled-by-default workflows while preserving manual review, submission, and outcome decisions.',
      roleScope: {
        role: 'Workflow Automation Engineer',
        team: 'Solo project',
        status: 'Validated; disabled by default',
        ownership: [
          'Designed seven independently scheduled workflows for discovery, generation, alerts, review, analytics, recommendations, and archival.',
          'Modeled the pipeline around versioned policies, an 89-field canonical record, additive Sheet migration, deterministic validation, and a manual-submission boundary.'
        ]
      },
      problem: {
        audience:
          'A job candidate who needs to review relevant OnlineJobs.ph listings and prepare grounded application material without delegating submission authority.',
        challenge:
          'Repeated discovery, qualification review, application drafting, alerting, outcome tracking, and analytics can drift across independent automations and active or archived records.',
        stakes:
          'Duplicate or stale state can waste review effort, while generated output or aggregate recommendations must never submit an application for the candidate.',
        constraints: [
          'Seven workflows run on independent schedules and must tolerate retries, stale claims, row shifts, and legacy records.',
          'One versioned candidate profile and policy set must remain the source of truth for generated artifacts.',
          'Live OnlineJobs.ph, Google Sheets, Groq, Slack, and n8n actions stay disabled by default during deterministic validation.'
        ]
      },
      solution: {
        summary:
          'Job Pipeline coordinates discovery, evidence-based ranking, application-pack generation, review, outcomes, and learning while keeping submission manual.',
        workflow: [
          'Versioned searches discover listings and reconcile active and archived history around a canonical job identity.',
          'Qualification and opportunity scoring prioritize work before grounded application packs and idempotent Slack alerts are generated.',
          'The candidate reviews, applies manually, records outcomes, and receives deduplicated analytics and guarded recommendations.'
        ]
      },
      learnings: {
        lessons: [
          'Versioned configuration and generated artifacts prevent exported automation from becoming a second source of truth.',
          'Canonical identity, guarded transitions, and idempotent writes are necessary when independently scheduled workflows share records.'
        ],
        improvements: [
          'Activate external workflows gradually and inspect live provider, Sheet, and scheduling behavior before increasing automation frequency.'
        ],
        unvalidated: [
          'The disabled-by-default validation proves deterministic behavior, not live conversion improvement or provider reliability.'
        ]
      },
      impact: [
        {
          kind: 'product',
          value: '7 workflows',
          label: 'Automation coverage',
          context:
            'Separates discovery, generation, Slack alerts, manual review, archival, analytics, and recommendations into independently scheduled n8n workflows.'
        },
        {
          kind: 'product',
          value: '22 queries',
          label: 'Evidence-linked discovery',
          context:
            'Runs a versioned search catalog while reconciling active and archived records around one canonical job identity.'
        },
        {
          kind: 'implementation',
          value: '147 tests',
          label: 'Deterministic validation',
          context:
            'Covers profile and policy contracts, discovery, ranking, generation, review, alerts, archival, analytics, recommendations, generated artifacts, and a synthetic lifecycle.'
        },
        {
          kind: 'product',
          value: 'Manual-only',
          label: 'Sending boundary',
          context:
            'Produces validated application material while requiring the candidate to review and submit every application.'
        }
      ],
      decisions: [
        {
          title: 'Versioned policy and generated artifacts',
          constraint:
            'Editing exported workflows directly would let runtime behavior drift from profile, ranking, alert, analytics, and application rules.',
          decision:
            'Treat versioned configuration as the source of truth and generate the seven workflow exports and Sheet setup from it.',
          rationale:
            'Make critical behavior reviewable, reproducible, and testable before activation.',
          validation:
            'The validation command checks generated-artifact drift and runs 147 deterministic tests without live service calls.'
        },
        {
          title: 'Canonical identity and guarded state transitions',
          constraint:
            'Independent schedules, retries, legacy rows, and reviewer actions could otherwise duplicate work or overwrite a newer decision.',
          decision:
            'Use canonical job identities, append-only claims, processing tokens, state guards, idempotent upserts, and archive confirmation before deletion.',
          rationale:
            'Preserve one coherent record across active and archived Sheets even when work overlaps or retries.',
          validation:
            'Regression fixtures cover duplicate discovery, stale claims, concurrent review, partial archive writes, row shifts, and legacy records.'
        },
        {
          title: 'Learning without autonomous submission',
          constraint:
            'The pipeline needed better prioritization and feedback without allowing generated output or aggregate analytics to take action for the candidate.',
          decision:
            'Keep review, Apply Points, submission, and outcomes explicit while limiting analytics and weekly recommendations to versioned, evidence-backed advisory output.',
          rationale:
            'Improve future decisions while keeping authority at the human boundary.',
          tradeoff:
            'The system prepares and prioritizes work but never applies for a job.'
        }
      ],
      highlights: [
        'Coordinates discovery, generation, Slack alerts, review, archival, analytics, and recommendations across seven n8n workflows.',
        'Runs 22 evidence-linked searches, dual-score evaluation, instruction-aware application packs, and canonical cross-sheet reconciliation.',
        'Generates grounded application material and guarded learning output while keeping review, submission, and outcomes manual.'
      ],
      visuals: []
    }
  }
];
