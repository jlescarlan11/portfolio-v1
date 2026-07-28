import type { ProjectRecord, ProjectsSectionContent } from './types';

export const projectsSectionContent: ProjectsSectionContent = {
  eyebrow: 'Selected Work',
  title: 'A rental marketplace, a civic health app, a pricing tool, and a job-search pipeline.',
  intro:
    'Open a case study to see the user problem, what I owned, the decisions behind the build, and the proof available from the repository.',
  ctaLabel: 'Read case study',
};

export const projects: ProjectRecord[] = [
  {
    slug: 'rent-n-roll',
    title: 'Rent N Roll',
    category: 'Marketplace / Booking and Payments',
    description:
      'A pre-launch camera rental marketplace that guides owners and renters through availability, identity verification, digital contracts, handoff confirmation, and PayMongo payment and deposit handling.',
    logo: '/project/rent-n-roll.jpg',
    technologies: ['Next.js', 'TypeScript', 'React', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Zod', 'PayMongo'],
    completedAt: '2025-12',
    links: {
      liveUrl: 'https://rentnroll.store'
    },
    caseStudy: {
      summary:
        'A pre-launch marketplace that gives camera owners and renters one booking to follow from available dates and verification through payment, handoff, and return.',
      roleScope: {
        role: 'Full-Stack Engineer',
        team: 'Solo project',
        status: 'Pre-launch',
        ownership: [
          'Built the owner and renter journeys across equipment listings, discovery, booking, identity verification, digital contracts, handoff confirmation, and PayMongo payments.',
          'Replaced 24 untyped database queries with typed Supabase RPC patterns and generated types before launch.'
        ]
      },
      problem: {
        audience:
          'Camera owners listing equipment and renters looking for the right gear on specific dates.',
        challenge:
          'Both people need to know what gear is available, who has been verified, what has been signed and paid, and whether the equipment is ready for handoff or return.',
        stakes:
          'If any of those details disagree, the owner and renter can act on different booking information or lose sight of the next required step.',
        constraints: [
          'The marketplace is still pre-launch, so the build proves feature coverage—not adoption or live rental volume.',
          'PayMongo confirms payment and deposit changes asynchronously through webhook events.',
          'The initial data layer contained 24 untyped database queries across a growing booking journey.'
        ]
      },
      solution: {
        summary:
          'One booking connects the listing, renter, required checks, money movement, and physical exchange so each side can see what happens next.',
        workflow: [
          'Owners publish equipment with photos, daily pricing, deposit details, and available dates.',
          'Renters choose available gear, complete the supported identity verification and contract steps, and request the booking.',
          'That booking carries PayMongo payment and deposit updates through handoff confirmation and return.'
        ]
      },
      learnings: {
        lessons: [
          'The difficult part of rental software is not the listing page; it is keeping two people aligned through every commitment and handoff.',
          'A payment button shows intent, but the PayMongo event must confirm whether money actually moved.'
        ],
        improvements: [
          'Run the complete booking, payment, handoff, return, and exception paths with launch users before adding more marketplace scope.'
        ],
        unvalidated: [
          'Because the marketplace is pre-launch, there is no verified rental volume, user adoption, or live payment history yet.'
        ]
      },
      impact: [
        {
          kind: 'implementation',
          value: '24 queries',
          label: 'Safer database changes',
          context:
            'Moved 24 untyped database queries to typed Supabase RPC patterns so mismatched application and database assumptions can be caught earlier.'
        },
        {
          kind: 'product',
          value: 'Full lifecycle',
          label: 'One booking, end to end',
          context:
            'Connected listings and availability to verification, contracts, PayMongo payments and deposits, handoff confirmation, and return.'
        }
      ],
      decisions: [
        {
          title: 'Fix ambiguous database calls before launch',
          constraint:
            'Twenty-four untyped database queries made it easy for application code and stored data to disagree.',
          decision:
            'Move every identified query behind typed Supabase RPC patterns backed by generated types.',
          rationale:
            'Make booking-data changes reviewable and catch mismatched fields before they reach an owner or renter.',
          validation:
            'All 24 identified queries were migrated to the typed pattern.'
        },
        {
          title: 'Let PayMongo confirm money movement',
          constraint:
            'The interface can start a payment, but it cannot prove that PayMongo completed it.',
          decision:
            'Integrate payment and deposit handling through PayMongo webhooks.',
          rationale:
            'Update the booking from provider-confirmed events instead of assuming a successful button click.'
        }
      ],
      highlights: [
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
    category: 'Civic Health / Offline Mobile App',
    description:
      'A Naga City health app that routes immediate-danger and mental-health inputs before Gemini, keeps supported care records available offline, and helped a five-person team reach the top 15 of 200+ hackathon teams.',
    logo: '/project/health.svg',
    technologies: ['TypeScript', 'React Native', 'Expo', 'Node.js', 'Prisma', 'PostgreSQL', 'SQLite', 'Gemini API'],
    completedAt: '2026-02',
    links: {
      githubUrl: 'https://github.com/jlescarlan11/health'
    },
    caseStudy: {
      summary:
        'A civic health app that helps residents decide whether to seek emergency help, find a nearby facility, or continue to a lower-acuity next step—even with unreliable connectivity.',
      roleScope: {
        role: 'Project and Technical Lead',
        team: 'Five-person hackathon team',
        status: 'Hackathon semi-finalist; repository archived',
        ownership: [
          'Led a five-person team delivering symptom assessment, nearby-facility discovery, medication records, and YAKAP enrollment guidance.',
          'Designed the handoff between deterministic safety checks, Gemini-assisted triage, SQLite-backed offline records, and the Node.js, Prisma, and PostgreSQL backend.'
        ]
      },
      problem: {
        audience:
          'Naga City residents deciding whether symptoms call for emergency help, a nearby facility, or a lower-acuity next step.',
        challenge:
          'A symptom tool needs to react predictably to immediate danger while still making supported assessments, medications, and facility information useful when connectivity drops.',
        stakes:
          'An urgent case should never wait for a generative answer, and losing locally needed information during an outage would undermine the app when guidance matters most.',
        constraints: [
          'The product was built by a five-person team within a hackathon timeline.',
          'Offline support covers defined assessment, medication, and facility records—not every care scenario.',
          'Emergency and mental-health inputs must receive deterministic handling before any eligible request reaches Gemini.'
        ]
      },
      solution: {
        summary:
          'The app handles immediate safety first, uses Gemini only for eligible lower-risk inputs, and keeps a defined set of care information on the device.',
        workflow: [
          'Residents answer an immediate-danger and mental-health check before any AI request can run.',
          'Inputs that clear that check can receive Gemini-assisted triage and guidance toward local facilities.',
          'Supported assessments, medication records, and facility data stay in SQLite and use synchronization when connectivity returns.'
        ]
      },
      learnings: {
        lessons: [
          'In a health product, AI is a conditional helper—not the first or final authority for urgent safety.',
          '“Works offline” is only credible when the exact records available without a connection are named.'
        ],
        improvements: [
          'Bring clinicians and residents into structured review and field testing before treating the guidance as production care infrastructure.'
        ],
        unvalidated: [
          'The hackathon placement demonstrates team delivery, not clinical effectiveness, resident adoption, or production reliability.'
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
          label: 'Care data kept on-device',
          context:
            'Assessments, medication records, and facility data remain available locally, with synchronization when connectivity returns.'
        }
      ],
      decisions: [
        {
          title: 'Route danger signals before calling Gemini',
          constraint:
            'Emergency and mental-health inputs cannot depend on model availability or model-generated wording.',
          decision:
            'Run deterministic emergency and mental-health checks before eligible requests reach Gemini.',
          rationale:
            'Give urgent inputs a predictable response path before assisted triage is considered.',
          tradeoff:
            'Only inputs that clear the deterministic checks are eligible for Gemini-assisted triage.'
        },
        {
          title: 'Keep a defined record set on the device',
          constraint:
            'Residents may need assessment, medication, and facility information without reliable connectivity.',
          decision:
            'Persist those records in SQLite and synchronize them with the backend when connectivity returns.',
          rationale:
            'Keep the supported care information readable during an outage without overstating universal offline coverage.'
        }
      ],
      highlights: [
        'Led a five-person team to the semi-finals, placing in the top 15 of 200+ teams at the 1st Naga City Mayoral Hackathon.',
        'Gated emergency and mental-health inputs with deterministic checks before any Gemini request.',
        'Persisted assessments, medication records, and facility data locally, with synchronization when connectivity returns.'
      ],
      visuals: [
        {
          kind: 'hero',
          src: '/project/health-safety-check.png',
          alt:
            'HEALTH safety check warning residents to contact emergency services when someone is in immediate danger.',
          caption:
            'The symptom flow begins with a deterministic safety check so immediate-danger guidance appears before any assisted triage.'
        }
      ]
    }
  },
  {
    slug: 'pricecraft',
    title: 'PriceCraft',
    category: 'Pricing PWA / Small Business',
    description:
      'A live, installable pricing PWA that helps small food businesses turn recipe costs into selling prices, reuse costs across variants, and update an ingredient catalog from reviewed receipt lines.',
    logo: '/project/pricecraft.svg',
    technologies: ['TypeScript', 'React', 'Vite', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Tesseract.js', 'Vitest', 'Vite PWA'],
    completedAt: '2026-05',
    links: {
      githubUrl: 'https://github.com/jlescarlan11/pricecraft',
      liveUrl: 'https://pricecraft.netlify.app/'
    },
    caseStudy: {
      summary:
        'A pricing tool for small food businesses that answers a recurring question: after ingredients, labor, and overhead change, what should this product sell for?',
      roleScope: {
        role: 'Full-Stack Engineer',
        team: 'Solo project',
        status: 'Live',
        ownership: [
          'Built the calculator across ingredient, labor, overhead, markup, profit-margin, break-even, and per-unit profit calculations.',
          'Added shared recipe costs, product variants, a personal ingredient catalog, receipt OCR with user confirmation, offline use, and Supabase synchronization.'
        ]
      },
      problem: {
        audience:
          'Small food businesses that need to price products repeatedly as ingredient costs change.',
        challenge:
          'A price is easy to calculate once; keeping it current is harder when spreadsheets repeat ingredient costs and related products duplicate the same base recipe.',
        stakes:
          'Missing a shared cost can make real margins look healthier than they are, while required sign-in or connectivity can block a quick pricing check.',
        constraints: [
          'The calculator must remain useful before sign-in and during connectivity loss.',
          'Related product variants need one source for shared recipe costs.',
          'Noisy receipt OCR output cannot be trusted to update ingredient costs without user review.'
        ]
      },
      solution: {
        summary:
          'PriceCraft keeps the recipe, selling-price options, and future cost updates together so a business can recalculate instead of rebuilding its math.',
        workflow: [
          'The business records ingredients, labor, overhead, and shared recipe costs, then compares markup and profit-margin prices with break-even and profit figures.',
          'Product variants reuse one base recipe and add only the costs that differ.',
          'Receipt OCR proposes ingredient names, quantities, units, and prices; the user edits and confirms them before the ingredient catalog or price history changes.',
          'Guest data works offline, can move into an account after sign-in, and can synchronize through Supabase with Row-Level Security; JSON import and export provide a portable backup.'
        ]
      },
      learnings: {
        lessons: [
          'Receipt OCR is most useful as a draft that reduces typing; it should not silently rewrite the costs behind a selling price.',
          'A calculator earns trust faster when it works before account creation and explains the cost behind its recommendation.'
        ],
        improvements: [
          'Test receipt extraction across more layouts and let users review several detected price changes in one pass.'
        ],
        unvalidated: [
          'User adoption, pricing time saved, and business-margin improvement have not been measured.'
        ]
      },
      impact: [
        {
          kind: 'product',
          value: '2 strategies',
          label: 'Two ways to set a price',
          context:
            'Calculates selling prices with both markup and profit-margin strategies across ingredient, labor, and overhead costs.'
        },
        {
          kind: 'product',
          value: 'Offline-capable',
          label: 'Works before sign-in',
          context:
            'Lets a guest calculate and save locally without a connection, then migrate and synchronize data after signing in.'
        },
        {
          kind: 'implementation',
          value: '300+ tests',
          label: 'Pricing changes checked',
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
          title: 'Share one base recipe across variants',
          constraint:
            'Related products needed to share a base recipe without duplicating shared ingredient costs.',
          decision:
            'Model reusable base recipes and allocate shared costs across product variants.',
          rationale:
            'Update shared costs once while keeping each variant’s added costs and resulting margin visible.'
        },
        {
          title: 'Treat receipt OCR as a draft',
          constraint:
            'Receipt text is noisy and cannot safely update ingredient costs without review.',
          decision:
            'Preprocess captured images, extract candidate lines through the available OCR path, and require editable confirmation before catalog or price-history writes.',
          rationale:
            'Reduce re-entry work without letting uncertain text silently alter a selling-price calculation.',
          tradeoff:
            'The user remains responsible for checking names, quantities, units, and prices before saving.'
        },
        {
          title: 'Let the calculator work before sign-in',
          constraint:
            'The calculator needed to remain useful before sign-in and during connectivity loss.',
          decision:
            'Support local guest changes, optional Supabase authentication and synchronization, and guest-data migration.',
          rationale:
            'Make the core calculation immediately useful, then offer cloud sync when the user wants it.'
        }
      ],
      highlights: [
        'Calculates ingredient, labor, and overhead costs using both markup and profit-margin pricing strategies.',
        'Allocates shared recipe costs across product variants and compares resulting margins.',
        'Captures receipts, extracts candidate items, and requires user confirmation before updating the ingredient catalog and price history.',
        'Supports installable PWA use, offline changes, authenticated cloud synchronization, account migration, and portable backups.'
      ],
      visuals: [
        {
          kind: 'hero',
          src: '/project/pricecraft-results.png',
          alt:
            'PriceCraft results screen for chocolate chip cookies showing recommended price, break-even price, margin, profit, and cost breakdown.',
          caption:
            'The results view keeps the recommended selling price beside break-even, margin, per-unit profit, batch profit, and the underlying cost breakdown.'
        }
      ]
    }
  },
  {
    slug: 'job-pipeline',
    title: 'Job Pipeline',
    category: 'AI-Assisted Job Search Automation',
    description:
      'Seven n8n workflows that find and rank OnlineJobs.ph listings, prepare grounded application drafts with Groq, send Slack alerts, and leave review and submission manual.',
    logo: '',
    technologies: ['n8n', 'Node.js', 'JavaScript', 'Groq API', 'Google Sheets API', 'Google Apps Script', 'Slack Webhooks'],
    completedAt: '2026-07',
    links: {
      githubUrl: 'https://github.com/jlescarlan11/Job-Pipeline'
    },
    caseStudy: {
      summary:
        'A job-search assistant that reduces the repetitive work around finding, comparing, drafting for, and tracking roles without applying on the candidate’s behalf.',
      roleScope: {
        role: 'Workflow Automation Engineer',
        team: 'Solo project',
        status: 'Validated; disabled by default',
        ownership: [
          'Designed seven independently scheduled n8n workflows for discovery, drafting, Slack alerts, manual review, archival, analytics, and recommendations.',
          'Built the pipeline from versioned configuration, an 89-field canonical job record, additive Google Sheet migration, and 147 deterministic tests.'
        ]
      },
      problem: {
        audience:
          'A job candidate reviewing OnlineJobs.ph at scale who still wants to judge fit and submit every application personally.',
        challenge:
          'Finding new listings, removing duplicates, checking fit, drafting from real experience, and tracking outcomes consumes time before an application is even sent.',
        stakes:
          'A retry can surface the same role twice, a fluent draft can claim unsupported experience, and an automated sender can take away the candidate’s final judgment.',
        constraints: [
          'The seven n8n workflows run independently and must handle retries, moved rows, unfinished work, and older records.',
          'Drafts and scoring must stay grounded in one versioned candidate profile and policy set.',
          'Live OnlineJobs.ph, Google Sheets, Groq, Slack, and n8n actions are disabled by default while deterministic checks run.'
        ]
      },
      solution: {
        summary:
          'The pipeline prepares a smaller, better-supported review queue; the candidate decides what is true, worth pursuing, and ready to send.',
        workflow: [
          'Twenty-two evidence-linked searches find listings and compare them with active and archived history using a canonical job identity.',
          'Qualification and opportunity scores prioritize roles before Groq prepares experience-grounded application material and Slack alerts.',
          'The candidate performs manual review, submits outside the automation, records outcomes, and receives deduplicated analytics and recommendations.'
        ]
      },
      learnings: {
        lessons: [
          'The safest way to maintain exported automation is to generate it from checked-in rules instead of editing seven copies by hand.',
          'A durable listing identity matters more than row position when schedules overlap, retries happen, and records move to an archive.'
        ],
        improvements: [
          'Enable external services one at a time, inspect real listing, Sheet, model, and alert behavior, then increase the schedule frequency.'
        ],
        unvalidated: [
          'The 147 deterministic tests prove checked-in behavior, not better application conversion or reliable live provider performance.'
        ]
      },
      impact: [
        {
          kind: 'product',
          value: '7 workflows',
          label: 'Jobs split by responsibility',
          context:
            'Separates discovery, generation, Slack alerts, manual review, archival, analytics, and recommendations into independently scheduled n8n workflows.'
        },
        {
          kind: 'product',
          value: '22 queries',
          label: 'Repeatable search coverage',
          context:
            'Runs a versioned search catalog while reconciling active and archived records around one canonical job identity.'
        },
        {
          kind: 'implementation',
          value: '147 tests',
          label: 'Checked without live actions',
          context:
            'Covers profile and policy contracts, discovery, ranking, generation, review, alerts, archival, analytics, recommendations, generated artifacts, and a synthetic lifecycle.'
        },
        {
          kind: 'product',
          value: 'Manual-only',
          label: 'Candidate keeps control',
          context:
            'Prepares application material while requiring the candidate to review and submit every application.'
        }
      ],
      decisions: [
        {
          title: 'Generate seven automations from one policy',
          constraint:
            'Editing exported workflows directly would let runtime behavior drift from profile, ranking, alert, analytics, and application rules.',
          decision:
            'Treat versioned configuration as the source of truth and generate the seven workflow exports and Sheet setup from it.',
          rationale:
            'Review and test one set of rules before producing the files n8n and Google Sheets consume.',
          validation:
            'The validation command checks generated-artifact drift and runs 147 deterministic tests without live service calls.'
        },
        {
          title: 'Give every listing one durable identity',
          constraint:
            'Independent schedules, retries, legacy rows, and reviewer actions could otherwise duplicate work or overwrite a newer decision.',
          decision:
            'Use canonical job identities, append-only claims, processing tokens, state guards, idempotent upserts, and archive confirmation before deletion.',
          rationale:
            'Recognize the same listing across active and archived Sheets even when work overlaps or retries.',
          validation:
            'Regression fixtures cover duplicate discovery, stale claims, concurrent review, partial archive writes, row shifts, and legacy records.'
        },
        {
          title: 'Automate preparation, never submission',
          constraint:
            'The pipeline needed better prioritization and feedback without allowing generated output or aggregate analytics to take action for the candidate.',
          decision:
            'Keep review, Apply Points, submission, and outcomes explicit while limiting analytics and weekly recommendations to versioned, evidence-backed advisory output.',
          rationale:
            'Use past outcomes to improve the review queue without making the candidate’s decision.',
          tradeoff:
            'The system prepares and prioritizes work but never applies for a job.'
        }
      ],
      highlights: [
        'Separates discovery, drafting, Slack alerts, manual review, archival, analytics, and recommendations across seven n8n workflows.',
        'Runs 22 evidence-linked searches, dual-score evaluation, instruction-aware application packs, and canonical cross-sheet reconciliation.',
        'Generates grounded application material while the candidate reviews, submits, and records every outcome manually; it never applies for a job.'
      ],
      visuals: [
        {
          kind: 'hero',
          src: '/project/job-pipeline-workflows.png',
          alt:
            'Job Pipeline repository table listing seven workflow exports with their schedules and responsibilities.',
          caption:
            'The checked-in workflow inventory makes each independently scheduled export and its responsibility explicit before activation.'
        }
      ]
    }
  }
];
