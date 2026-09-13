import type { ProjectRecord, ProjectsSectionContent } from './types';

export const projectsSectionContent: ProjectsSectionContent = {
  eyebrow: 'Selected Work',
  title: 'A pharmacy learning platform, rental marketplace, civic health app, pricing tool, automata workspace, and job-search pipeline.',
  intro:
    'Open a case study to see the user problem, what I owned, the decisions behind the build, and the proof available from the repository.',
  ctaLabel: 'Read case study',
};

export const projects: ProjectRecord[] = [
  {
    slug: 'rent-n-roll',
    title: 'Rent N Roll',
    category: 'Marketplace / Booking and Payments',
    listing: {
      capabilities: ['Web Development', 'Marketplace'],
      homepageRank: 1,
      thumbnail: {
        src: '/project/rent-n-roll.jpg',
        alt:
          'Rent N Roll marketplace browse page with camera categories and featured equipment.',
        fit: 'cover',
        objectPosition: 'center'
      }
    },
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
      evidence: [
        {
          kind: 'live-product',
          description:
            'Public pre-launch marketplace surfaces demonstrate listing and discovery behavior, not adoption, transaction volume, or launch status.'
        }
      ],
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
            'The marketplace starts with category-led discovery so renters can narrow the equipment they want to browse.',
          sourceLabel: 'Live product'
        },
        {
          kind: 'supporting',
          section: 'solution',
          src: '/project/rent-n-roll-listing.jpg',
          alt:
            'Rent N Roll equipment detail page with product photos, daily price, deposit amount, booking notice, and availability calendar.',
          caption:
            'The listing view keeps product media, price, deposit information, booking constraints, and availability in one decision point.',
          sourceLabel: 'Live product'
        }
      ]
    }
  },
  {
    slug: 'health',
    title: 'HEALTH',
    category: 'Civic Health / Offline Mobile App',
    listing: {
      capabilities: ['Mobile App'],
      homepageRank: 2,
      thumbnail: {
        src: '/project/health-safety-check.png',
        alt:
          'HEALTH mobile safety check directing residents to emergency help before assisted triage.',
        fit: 'cover',
        objectPosition: 'center'
      }
    },
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
      evidence: [
        {
          kind: 'public-repository',
          description:
            'The archived public repository documents the safety-first mobile flow, offline record boundaries, and implementation stack.'
        }
      ],
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
            'The symptom flow begins with a deterministic safety check so immediate-danger guidance appears before any assisted triage.',
          sourceLabel: 'Public repository'
        }
      ]
    }
  },
  {
    slug: 'pricecraft',
    title: 'PriceCraft',
    category: 'Pricing PWA / Small Business',
    listing: {
      capabilities: ['Web Development', 'PWA'],
      homepageRank: 3,
      thumbnail: {
        src: '/project/pricecraft-results.png',
        alt:
          'PriceCraft pricing results with recommended price, break-even price, margin, and cost breakdown.',
        fit: 'cover',
        objectPosition: 'center'
      }
    },
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
      evidence: [
        {
          kind: 'live-product',
          description:
            'The public PWA demonstrates the current pricing workflow, offline-capable shell, and reviewed receipt-cost entry points.'
        },
        {
          kind: 'public-repository',
          description:
            'The public repository contains the pricing, persistence, migration, Row-Level Security, and automated-test implementation.'
        }
      ],
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
            'The results view keeps the recommended selling price beside break-even, margin, per-unit profit, batch profit, and the underlying cost breakdown.',
          sourceLabel: 'Live product'
        }
      ]
    }
  },
  {
    slug: 'regex2nfa',
    title: 'Regex2NFA',
    category: 'Computer Science Education / Interactive Visualization',
    listing: {
      capabilities: ['Web Development', 'Visualization'],
      thumbnail: {
        src: '/project/regex2nfa-workspace.jpg',
        alt:
          'Regex2NFA workspace showing a Thompson NFA graph and input simulation controls.',
        fit: 'contain',
        objectPosition: 'center'
      }
    },
    description:
      'An interactive automata workspace that converts regular expressions into Thompson NFAs, exposes epsilon transitions, and animates accepted or rejected input strings.',
    logo: '',
    technologies: ['Next.js', 'React', 'TypeScript', 'vis-network', 'Radix UI', 'Tailwind CSS'],
    completedAt: '2026-09',
    links: {
      liveUrl: 'https://regex2nfa.vercel.app',
      githubUrl: 'https://github.com/jlescarlan11/regex2nfa'
    },
    caseStudy: {
      summary:
        'A full-canvas learning tool that turns regular-expression syntax into a visible state machine and shows exactly how an input moves through it.',
      evidence: [
        {
          kind: 'live-product',
          description:
            'The deployed workspace demonstrates expression entry, Thompson NFA construction, graph interaction, simulation, export, and responsive behavior.'
        },
        {
          kind: 'public-repository',
          description:
            'The public repository contains the parser, construction logic, simulation state, responsive interface, and build configuration.'
        }
      ],
      roleScope: {
        role: 'Frontend Engineer and Product Designer',
        team: 'Four-person academic project',
        status: 'Live',
        ownership: [
          'Redesigned the tool around a dominant NFA canvas with progressive-disclosure controls for expressions, guidance, graph utilities, and simulation.',
          'Preserved regex parsing, Thompson construction, epsilon closure, input simulation, graph manipulation, PNG export, and URL-persisted expressions while simplifying the interface.'
        ]
      },
      problem: {
        audience:
          'Students learning how regular expressions become nondeterministic finite automata and how those machines process strings.',
        challenge:
          'A correct conversion result is not enough when the state structure, epsilon transitions, and active simulation path remain difficult to follow.',
        stakes:
          'If construction and execution are hidden behind controls or dense panels, the learner sees an answer without building intuition for why it is correct.',
        constraints: [
          'The graph must remain readable and interactive across desktop and mobile layouts.',
          'Start, accept, active, epsilon, and symbol transitions need distinct non-color cues.',
          'The redesign must retain the existing parser and simulator behavior rather than replacing it with a visual mock.'
        ]
      },
      solution: {
        summary:
          'The interface treats the NFA as the primary artifact, keeps the active expression centered, and reveals authoring, guidance, export, and simulation controls only when needed.',
        workflow: [
          'Choose an example or enter a custom regular expression from the expression drawer, then generate its Thompson NFA.',
          'Pan the full-canvas graph, distinguish start and accept rings, follow dashed epsilon edges, and recenter or export the result.',
          'Enter a test string and animate the input tape while active states progress to an accepted or rejected result.'
        ]
      },
      learnings: {
        lessons: [
          'For educational visualization, progressive disclosure works only when the core artifact and current state remain continuously visible.',
          'A near-monochrome graph can preserve semantic clarity through rings, dashes, labels, and motion instead of relying on color alone.'
        ],
        improvements: [
          'Add optional construction-step playback so learners can inspect how each regex operator contributes fragments to the final NFA.'
        ],
        unvalidated: [
          'The redesign has not yet been evaluated in a structured classroom study or measured against learning outcomes.'
        ]
      },
      impact: [
        {
          kind: 'product',
          value: 'Full canvas',
          label: 'Graph stays primary',
          context:
            'Expression, guide, graph utility, and simulation controls float or open on demand without permanently reducing the visualization area.'
        },
        {
          kind: 'implementation',
          value: '4 routes',
          label: 'One coherent system',
          context:
            'Workspace, fullscreen graph, unified guide, and legacy About redirect share one responsive visual language and URL-persisted expression state.'
        }
      ],
      decisions: [
        {
          title: 'Make the graph the workspace, not a card',
          constraint:
            'Persistent side panels and toolbars competed with the automaton for limited screen space.',
          decision:
            'Use a full-viewport graph with floating expression, information, recenter, export, and simulation controls.',
          rationale:
            'Keep the machine visible while controls appear only at the moment they are useful.',
          tradeoff:
            'Some secondary actions require opening a drawer instead of remaining permanently visible.'
        },
        {
          title: 'Animate one clear simulation path',
          constraint:
            'A full transport console added controls before a learner understood the basic run state.',
          decision:
            'Lead with one Animate action, a speed multiplier, and a live input tape that resolves to Accepted or Rejected.',
          rationale:
            'Make the primary learning loop obvious while keeping simulation feedback close to the graph.'
        }
      ],
      highlights: [
        'Converts custom and preset regular expressions into manipulable Thompson NFAs with visible epsilon transitions.',
        'Animates input processing through active states and communicates accepted or rejected completion in a compact live tape.',
        'Uses a responsive full-canvas interface with progressive-disclosure drawers, recentering, PNG export, and a unified field guide.'
      ],
      visuals: [
        {
          kind: 'hero',
          src: '/project/regex2nfa-workspace.jpg',
          alt:
            'Regex2NFA workspace showing a Thompson NFA graph, centered expression, floating utilities, and input simulation dock.',
          caption:
            'The full-canvas workspace keeps the automaton dominant while expression, graph, and simulation controls remain close at hand.',
          sourceLabel: 'Live product'
        }
      ]
    }
  },
  {
    slug: 'job-pipeline',
    title: 'Job Pipeline',
    category: 'AI-Assisted Job Search Automation',
    listing: {
      capabilities: ['Automation', 'AI Workflow'],
      thumbnail: {
        src: '/project/job-pipeline-workflows.png',
        alt:
          'Job Pipeline repository table listing seven scheduled automation workflows and their responsibilities.',
        fit: 'cover',
        objectPosition: 'center'
      }
    },
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
      evidence: [
        {
          kind: 'public-repository',
          description:
            'The public repository exposes the versioned policies, generated workflow inventory, deterministic tests, and manual-review boundary.'
        }
      ],
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
            'The checked-in workflow inventory makes each independently scheduled export and its responsibility explicit before activation.',
          sourceLabel: 'Public repository'
        }
      ]
    }
  },
  {
    slug: 'pacu',
    title: 'PACU',
    category: 'Pharmacy Education / Web Platform',
    listing: {
      capabilities: ['WordPress', 'Airtable', 'Web Development'],
      thumbnail: {
        src: '/project/pacu-logo.png',
        alt:
          'Orange PACU wordmark for Pharmacy and Acute Care University.',
        fit: 'contain',
        objectPosition: 'center'
      }
    },
    description:
      'The Pharmacy & Acute Care University web platform combines a WordPress content and marketing site, Airtable-supported operations, and custom full-stack learning experiences for pharmacy professionals.',
    logo: '/project/pacu-logo.png',
    technologies: ['WordPress', 'Airtable', 'React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    completedAt: '2026-08',
    client: 'Pharmacy & Acute Care University',
    links: {
      liveUrl: 'https://pharmacyacute.com'
    },
    caseStudy: {
      summary:
        'A pharmacy education platform that brings public course discovery, operational content, and custom learning tools together for clinicians preparing for practice and board certification.',
      evidence: [
        {
          kind: 'live-product',
          description:
            'The public PACU website demonstrates the current course, literature, board-prep, pricing, and account-entry experience.'
        }
      ],
      roleScope: {
        role: 'Full-Stack Engineer (Contract)',
        team: 'PACU product team',
        status: 'Live client platform; contract completed',
        duration: 'February–August 2026',
        ownership: [
          'Built and maintained WordPress pages, Airtable-supported operational workflows, and custom React, TypeScript, Node.js, and PostgreSQL features across the platform.',
          'Delivered admin workflows, personalized study programs, eBook and reader access, review reminders, subscription access, production fixes, tests, and rollout support.'
        ]
      },
      problem: {
        audience:
          'Pharmacy professionals who need one place to discover courses, stay current with clinical literature, and prepare for board certification.',
        challenge:
          'The learner journey crosses a public WordPress site, Airtable-supported operations, and custom application features, so content, account access, and study tools must stay aligned across different systems.',
        stakes:
          'When course information, subscription entitlements, or operational records disagree, learners can lose access and administrators can be blocked from supporting them.',
        constraints: [
          'The live platform needed targeted improvements without interrupting active learning and administrative workflows.',
          'WordPress, Airtable, custom application code, APIs, and PostgreSQL each owned a different part of the experience.',
          'Subscription access and personalized study state had to remain consistent across learner and administrator surfaces.'
        ]
      },
      solution: {
        summary:
          'PACU uses each layer for the work it handles best: WordPress for public content, Airtable for flexible operations, and custom builds for specialized learning and administration.',
        workflow: [
          'Publish course, board-prep, literature, pricing, and resource information through the public WordPress experience.',
          'Support content and operational records in Airtable where the team needs fast, structured updates.',
          'Use custom React and TypeScript interfaces with Node.js APIs and PostgreSQL for personalized study programs, eBook reading, review reminders, subscription entitlements, and admin workflows.',
          'Trace production issues across the relevant layer, apply a targeted fix, verify it with tests, and support the rollout.'
        ]
      },
      learnings: {
        lessons: [
          'A content-heavy education business benefits from a CMS, while specialized learner and administrator workflows still need purpose-built application code.',
          'Mixed-platform delivery works best when ownership of content, operational records, and subscription state is explicit.'
        ],
        improvements: [
          'Continue strengthening cross-system regression coverage and operational documentation as learning products and subscription paths evolve.'
        ],
        unvalidated: [
          'The live site demonstrates delivered capabilities, but it does not by itself attribute learner growth, certification outcomes, or revenue changes to this engineering work.'
        ]
      },
      impact: [
        {
          kind: 'product',
          value: '3 delivery layers',
          label: 'Right tool for each job',
          context:
            'Combined WordPress publishing, Airtable-supported operations, and custom full-stack features in one client platform.'
        },
        {
          kind: 'product',
          value: 'Learner + admin',
          label: 'Two sides supported',
          context:
            'Covered learner-facing study, reading, reminder, and subscription flows alongside the administrative workflows that support them.'
        }
      ],
      decisions: [
        {
          title: 'Use fit-for-purpose platform layers',
          constraint:
            'Marketing content, flexible operational records, and specialized learning workflows have different editing, validation, and release needs.',
          decision:
            'Keep public publishing in WordPress, support adaptable operations with Airtable, and build product-specific behavior in the custom application stack.',
          rationale:
            'Let the PACU team update routine content and records quickly without forcing complex learner and entitlement logic into a general-purpose CMS.'
        },
        {
          title: 'Treat access as application state',
          constraint:
            'A visible purchase or account record does not guarantee that the learner has the correct study, reader, or subscription access.',
          decision:
            'Trace entitlement rules through the interface, API, and database, then repair mismatches at the layer that owns the state.',
          rationale:
            'Restore blocked learner and administrator workflows without masking the underlying data or access issue.'
        }
      ],
      highlights: [
        'Built and maintained WordPress pages, Airtable-supported operations, and custom React, TypeScript, Node.js, and PostgreSQL features.',
        'Delivered personalized study programs, eBook and reader access, review reminders, subscription entitlements, and admin workflows.',
        'Diagnosed production issues across interfaces, APIs, database schemas, content assets, and access rules, then supported tested rollouts.'
      ],
      visuals: [
        {
          kind: 'hero',
          src: '/project/pacu-logo.png',
          alt:
            'Orange PACU wordmark for Pharmacy & Acute Care University with a medical caduceus integrated into the letter U.',
          caption:
            'PACU is a live pharmacy education platform spanning public course discovery, clinical learning resources, board preparation, and account access.',
          sourceLabel: 'Live product'
        }
      ]
    }
  }
];
