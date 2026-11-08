import type { ProjectRecord, ProjectsSectionContent } from './types';
import { healthHackathonResult } from './stories.ts';

export const projectsSectionContent: ProjectsSectionContent = {
  eyebrow: 'Selected Work',
  title: 'A pharmacy learning platform, rental marketplace, civic health app, pricing tool, automata workspace, and job-search pipeline.',
  intro:
    'Read the story behind each user problem: what I owned, the decisions I made, and the proof available from the work.',
  ctaLabel: 'Read the story',
};

export const projects: ProjectRecord[] = [
  {
    slug: 'rent-n-roll',
    title: 'Rent N Roll',
    category: 'Marketplace / Booking and Payments',
    listing: {
      capabilities: ['Web Development', 'Marketplace'],
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
        'I built this pre-launch camera rental marketplace on my own. I used PayMongo events to keep each booking up to date when a payment or deposit changed.',
      evidence: [
        {
          kind: 'live-product',
          linkLabel: 'Browse the marketplace',
          description:
            'See the public browse and listing pages, including equipment details, prices, deposits, and availability.'
        }
      ],
      roleScope: {
        role: 'Full-Stack Engineer',
        team: 'Solo project',
        status: 'Pre-launch',
        ownership: [
          'I built the listing, booking, identity verification, and digital contract flows, including how renters and owners confirm handoff and return.',
          'I also rebuilt the database calls that those steps depend on.'
        ]
      },
      problem: {
        audience:
          'Camera owners listing equipment and renters looking for the right gear on specific dates.',
        challenge:
          'Both people need to know what gear is available, who has been verified, what has been signed and paid, and whether the equipment is ready for handoff or return.',
        stakes:
          'If the owner and renter see different information, one can show up for a handoff the other isn’t ready for.',
        constraints: [
          'The marketplace is still pre-launch, so the build proves feature coverage—not adoption or live rental volume.',
          'PayMongo confirms payment and deposit changes asynchronously through webhook events.',
          'The initial data layer contained 24 untyped database queries across a growing booking journey.'
        ]
      },
      solution: {
        summary:
          'I kept the required checks, payment status, and handoff on the same booking so both people could see what came next.',
        workflow: [
          'Owners publish equipment with photos, daily pricing, deposit details, and available dates.',
          'Renters choose available gear, complete the supported identity verification and contract steps, and request the booking.',
          'That booking carries PayMongo payment and deposit updates through handoff confirmation and return.'
        ]
      },
      learnings: {
        lessons: [
          'I learned to design around what each person needs to know before the next handoff.'
        ],
        improvements: [
          'Before launch, I’d walk owners and renters through a full rental, including what happens when a payment fails or plans change.'
        ],
        unvalidated: [
          'I haven’t verified the flow with real rentals or live payments.'
        ]
      },
      impact: [
        {
          kind: 'implementation',
          value: '24 queries',
          label: 'Safer database changes',
          context:
            'The generated types let TypeScript catch mismatched database fields while I’m editing the application.'
        },
        {
          kind: 'product',
          value: 'Full lifecycle',
          label: 'One booking, end to end',
          context:
            'The build covers the rental from discovery to return.'
        }
      ],
      decisions: [
        {
          title: 'Type the booking queries',
          constraint:
            'A change to a database field could leave the booking code expecting the old shape.',
          decision:
            'I moved the queries to typed Supabase RPC calls backed by generated types.',
          rationale:
            'I wanted errors in the database contract to show up before someone tried to make a booking.',
          validation:
            'I migrated all 24 untyped database queries I identified.'
        },
        {
          title: 'Let PayMongo confirm money movement',
          constraint:
            'Starting checkout doesn’t tell the app whether the payment went through.',
          decision:
            'I updated the booking when PayMongo sent a webhook for a payment or deposit.',
          rationale:
            'That way, both sides see a status backed by the provider’s confirmation.'
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
            'Renters can start by choosing a camera category.',
          sourceLabel: 'Live product'
        },
        {
          kind: 'supporting',
          section: 'solution',
          src: '/project/rent-n-roll-listing.jpg',
          alt:
            'Rent N Roll equipment detail page with product photos, daily price, deposit amount, booking notice, and availability calendar.',
          caption:
            'A listing puts the daily rate and deposit next to the availability calendar.',
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
      homepageRank: 3,
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
        'I led the team building a health navigation prototype for Naga City residents. I designed the symptom flow to check for emergencies before calling Gemini.',
      evidence: [
        {
          kind: 'public-repository',
          linkLabel: 'View archived source',
          description:
            'The repository shows the symptom checks and which records the prototype stores offline.'
        }
      ],
      roleScope: {
        role: 'Project and Technical Lead',
        team: 'Five-person hackathon team',
        status: 'Hackathon semi-finalist; repository archived',
        ownership: [
          'I led the team across symptom assessment, nearby facility search, medication records, and YAKAP enrollment guidance.',
          'I designed how the mobile app exchanged records with the backend and what it could keep on the device.'
        ]
      },
      problem: {
        audience:
          'Naga City residents deciding whether symptoms call for emergency help, a nearby facility, or a lower-acuity next step.',
        challenge:
          'A resident in immediate danger needs emergency help. They may also need to look up a medication or facility when connectivity drops.',
        stakes:
          'Neither task should depend on whether an AI service or a network connection is available.',
        constraints: [
          'The product was built by a five-person team within a hackathon timeline.',
          'Offline support covers defined assessment, medication, and facility records—not every care scenario.',
          'Emergency and mental-health inputs must receive deterministic handling before any eligible request reaches Gemini.'
        ]
      },
      solution: {
        summary:
          'I separated the emergency path, the assisted symptom check, and the records someone might need offline.',
        workflow: [
          'Residents answer an immediate-danger and mental-health check before any AI request can run.',
          'Inputs that clear that check can receive Gemini-assisted triage and guidance toward local facilities.',
          'Supported assessments, medication records, and facility data stay in SQLite and use synchronization when connectivity returns.'
        ]
      },
      learnings: {
        lessons: [
          'I learned to work out what the app should do in an emergency before deciding where AI might help.',
          'I’d also define exactly what someone can open offline before promising offline access.'
        ],
        improvements: [
          'I’d ask clinicians and residents to review the guidance and try it under real conditions before using it in a care setting.'
        ],
        unvalidated: [
          'We didn’t measure clinical effectiveness or resident adoption.'
        ]
      },
      impact: [
        {
          kind: 'product',
          value: 'Top 15 / 200+',
          label: 'Hackathon result',
          showInLead: true,
          context:
            `${healthHackathonResult} at the 1st Naga City Mayoral Hackathon`
        },
        {
          kind: 'product',
          value: 'Offline records',
          label: 'Care data kept on-device',
          context:
            'The prototype kept selected records readable even with no connection.'
        }
      ],
      decisions: [
        {
          title: 'Route danger signals before calling Gemini',
          constraint:
            'Emergency and mental-health inputs needed a reliable response even if Gemini was unavailable.',
          decision:
            'I put deterministic checks in front of the Gemini call. A flagged response sends the resident to emergency or crisis guidance.',
          rationale:
            'The response for those inputs stays the same each time.'
        },
        {
          title: 'Keep a defined record set on the device',
          constraint:
            'We had to choose which information was useful enough to keep on the device.',
          decision:
            'I used SQLite for selected assessments, medication records, and facility data, with synchronization when connectivity returns.',
          rationale:
            'That kept the supported records accessible during a network outage.'
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
            'The first screen asks about immediate danger and tells residents when to contact emergency services.',
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
      homepageRank: 2,
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
        'I built PriceCraft so small food businesses can turn ingredient, labor, and overhead costs into a selling price. The calculator works offline, and guests can bring their saved work into an account later.',
      evidence: [
        {
          kind: 'live-product',
          linkLabel: 'Try the calculator',
          description: 'Enter recipe costs and compare prices without signing in.'
        },
        {
          kind: 'public-repository',
          linkLabel: 'View source',
          description: 'See the pricing logic, guest-data migration, and tests.'
        }
      ],
      roleScope: {
        role: 'Full-Stack Engineer',
        team: 'Solo project',
        status: 'Live',
        ownership: [
          'I built the price and break-even calculations, then added support for variants that share a base recipe.',
          'I also built the ingredient catalog and the receipt review step that feeds it.'
        ]
      },
      problem: {
        audience:
          'Small food businesses that need to price products repeatedly as ingredient costs change.',
        challenge:
          'When several products share a base recipe, copying ingredient costs between spreadsheets makes price changes easy to miss.',
        stakes:
          'One missed cost can make real margins look higher than they are. A quick price check also needs to work without an account.',
        constraints: [
          'The calculator must remain useful before sign-in and during connectivity loss.',
          'Related product variants need one source for shared recipe costs.',
          'Noisy receipt OCR output cannot be trusted to update ingredient costs without user review.'
        ]
      },
      solution: {
        summary:
          'I wanted someone to update an ingredient price once and see what it did to the products that use it.',
        workflow: [
          'The business records ingredients, labor, overhead, and shared recipe costs, then compares markup and profit-margin prices with break-even and profit figures.',
          'Product variants reuse one base recipe and add only the costs that differ.',
          'Receipt OCR proposes ingredient names, quantities, units, and prices; the user edits and confirms them before the ingredient catalog or price history changes.',
          'Guest data works offline, can move into an account after sign-in, and can synchronize through Supabase with Row-Level Security; JSON import and export provide a portable backup.'
        ]
      },
      learnings: {
        lessons: [
          'I learned to give people the quickest way to check a suggestion before it affects their prices.'
        ],
        improvements: [
          'I’d test more receipt layouts and make it easier to review several suggested price changes together.'
        ],
        unvalidated: [
          'I haven’t measured how much time the tool saves or whether it improves margins.'
        ]
      },
      impact: [
        {
          kind: 'product',
          value: '2 strategies',
          label: 'Two ways to set a price',
          context:
            'The results compare markup and target profit margin, alongside break-even price and profit per unit.'
        },
        {
          kind: 'product',
          value: 'Offline-capable',
          label: 'Works before sign-in',
          context:
            'Businesses can keep a local copy or use account sync when they need it.'
        },
        {
          kind: 'implementation',
          value: '300+ tests',
          label: 'Pricing changes checked',
          context:
            'More than 300 unit and integration tests cover pricing, saved data, guest migration, catalog changes, and the interface.'
        },
        {
          kind: 'product',
          value: 'Receipt to catalog',
          label: 'Cost capture',
          context:
            'Confirmed receipt lines can become new catalog ingredients or update price history.'
        }
      ],
      decisions: [
        {
          title: 'Share one base recipe across variants',
          constraint:
            'A base recipe can contribute a different share of its cost to each variant.',
          decision:
            'I made the base recipe reusable and added the costs that differ for each product variant.',
          rationale:
            'Each variant’s margin stays visible when an ingredient price changes.'
        },
        {
          title: 'Treat receipt OCR as a draft',
          constraint:
            'Receipt OCR can misread a number or attach a price to the wrong item.',
          decision:
            'I turned extracted lines into suggestions the user can correct before saving anything to the catalog.',
          rationale:
            'A misread receipt can’t quietly change a selling price.',
          tradeoff:
            'The review step shows the suggested name, quantity, unit, and price together.'
        },
        {
          title: 'Let the calculator work before sign-in',
          constraint:
            'People needed to keep working if the connection dropped or they didn’t have an account.',
          decision:
            'I saved guest changes on the device and added optional Supabase sync, including migration when a guest signs in.',
          rationale:
            'Signing in lets people pick up the work they already started.'
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
            'A cookie recipe’s results show the suggested price, break-even point, margins, and costs side by side.',
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
        'I redesigned the workspace around the state machine graph so students could follow an input as it moved through the states. I kept our team’s existing parser and simulator.',
      evidence: [
        {
          kind: 'live-product',
          linkLabel: 'Try the simulator',
          description: 'Enter a(b|c)*d, then animate abd to see why it’s accepted.'
        },
        {
          kind: 'public-repository',
          linkLabel: 'View source',
          description: 'See the workspace code alongside the parser and simulation logic.'
        }
      ],
      roleScope: {
        role: 'Frontend Engineer and Product Designer',
        team: 'Four-person class project',
        status: 'Live',
        ownership: [
          'I designed and built the graph-first layout, expression drawer, and simulation controls.',
          'I kept Thompson construction, epsilon closure, graph manipulation, PNG export, and expressions that can be shared by URL working through the redesign.'
        ]
      },
      problem: {
        audience:
          'Students learning how regular expressions become nondeterministic finite automata and how those machines process strings.',
        challenge:
          'Students learning regular expressions need to see the state structure, which transitions consume input, and which states are active.',
        stakes:
          'A correct answer on its own doesn’t help with building intuition for why a string matches.',
        constraints: [
          'The graph must remain readable and interactive across desktop and mobile layouts.',
          'Start, accept, active, epsilon, and symbol transitions need distinct non-color cues.',
          'The redesign must retain the existing parser and simulator behavior rather than replacing it with a visual mock.'
        ]
      },
      solution: {
        summary:
          'I kept the expression at the top of the screen and gave the graph the rest of the space.',
        workflow: [
          'Choose an example or enter a custom regular expression from the expression drawer, then generate its Thompson NFA.',
          'Pan the full-canvas graph, distinguish start and accept rings, follow dashed epsilon edges, and recenter or export the result.',
          'Enter a test string and animate the input tape while active states progress to an accepted or rejected result.'
        ]
      },
      learnings: {
        lessons: [
          'I learned that students need to see the graph and the current state together, even when they’re working with the controls.',
          'Rings, dashes, and labels helped me distinguish state and transition types without relying on color.'
        ],
        improvements: [
          'I’d add playback for the construction itself so students can see what each operator adds to the graph.'
        ],
        unvalidated: [
          'I haven’t tested the redesign in a classroom study.'
        ]
      },
      impact: [
        {
          kind: 'product',
          value: 'Full canvas',
          label: 'Graph stays primary',
          context:
            'Students can open the expression drawer or run the simulator without leaving the graph.'
        },
        {
          kind: 'implementation',
          value: '4 routes',
          label: 'One coherent system',
          context:
            'The project includes the workspace, a fullscreen graph, a guide, and a redirect from the old About page.'
        }
      ],
      decisions: [
        {
          title: 'Give the graph the full window',
          constraint:
            'Side panels and toolbars left too little room for the graph, especially on small screens.',
          decision:
            'I moved the tools into floating controls and drawers.',
          rationale:
            'That made more room to follow long paths and branching transitions.',
          tradeoff:
            'Editing the expression takes an extra click to open its drawer.'
        },
        {
          title: 'Make it easy to run a string',
          constraint:
            'The playback controls made the first run harder to start.',
          decision:
            'I put one Animate button beside the input and left the speed control close by.',
          rationale:
            'Students can follow each character in the input while the graph shows which states are active.'
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
            'Dashed edges mark transitions that don’t consume an input character.',
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
        'I built and tested this n8n job search pipeline locally. I made overlapping runs recognize the same listing and kept application drafts for manual review.',
      evidence: [
        {
          kind: 'public-repository',
          linkLabel: 'View workflows and tests',
          description: 'The repository includes n8n exports and tests. Live integrations are disabled by default.'
        }
      ],
      roleScope: {
        role: 'Workflow Automation Engineer',
        team: 'Solo project',
        status: 'Validated; disabled by default',
        ownership: [
          'I split the work into seven n8n workflows, from finding roles and sending Slack alerts to archiving outcomes and producing recommendations.',
          'I defined an 89-field job record and wrote a migration that could add fields to the Google Sheet without replacing existing rows.'
        ]
      },
      problem: {
        audience:
          'A job candidate reviewing OnlineJobs.ph at scale who still wants to judge fit and submit every application personally.',
        challenge:
          'Before applying, a candidate has to find new roles, keep removing duplicates, and work out which jobs fit their experience.',
        stakes:
          'A retry can surface the same role twice, and a draft can claim unsupported experience. The candidate needs final judgment on what goes out.',
        constraints: [
          'The seven n8n workflows run independently and must handle retries, moved rows, unfinished work, and older records.',
          'Drafts and scoring must stay grounded in one versioned candidate profile and policy set.',
          'Live OnlineJobs.ph, Google Sheets, Groq, Slack, and n8n actions are disabled by default while deterministic checks run.'
        ]
      },
      solution: {
        summary:
          'I set up a queue for OnlineJobs.ph listings, with fit scores and a draft for the candidate to check.',
        workflow: [
          'Twenty-two evidence-linked searches find listings and compare them with active and archived history using a canonical job identity.',
          'Qualification and opportunity scores prioritize roles before Groq prepares experience-grounded application material and Slack alerts.',
          'The candidate performs manual review, submits outside the automation, records outcomes, and receives deduplicated analytics and recommendations.'
        ]
      },
      learnings: {
        lessons: [
          'I learned to keep rules in one place so a change to the candidate profile doesn’t have to be repeated across workflows.',
          'I also learned to treat a spreadsheet row number as temporary: someone can move the row while a run is still processing it.'
        ],
        improvements: [
          'I’d verify the external services one by one before turning on scheduled runs.'
        ],
        unvalidated: [
          'I haven’t measured how the pipeline performs with live services or whether it improves application outcomes.'
        ]
      },
      impact: [
        {
          kind: 'product',
          value: '7 workflows',
          label: 'Jobs split by responsibility',
          context:
            'The workflow exports include their own schedules, so discovery and later steps can run independently.'
        },
        {
          kind: 'product',
          value: '22 queries',
          label: 'Repeatable search coverage',
          context:
            'The search catalog has 22 queries, with a record of why each was included.'
        },
        {
          kind: 'implementation',
          value: '147 tests',
          label: 'Checked without live actions',
          context:
            'I ran 147 deterministic tests without live integrations, including a simulated run from discovery through archive.'
        },
        {
          kind: 'product',
          value: 'Manual-only',
          label: 'Candidate keeps control',
          context:
            'The candidate still has to review and submit every application.'
        }
      ],
      decisions: [
        {
          title: 'Generate seven automations from one policy',
          constraint:
            'Editing the workflow exports by hand could leave the candidate profile or ranking rules out of sync.',
          decision:
            'I generated the workflow exports and Sheet setup from versioned configuration.',
          rationale:
            'I can review one change to the rules before it reaches the exports.',
          validation:
            'The validation command checks that the exported files still match the checked-in rules.'
        },
        {
          title: 'Give every listing one durable identity',
          constraint:
            'Two scheduled runs can see the same job, or a retry can finish after a reviewer has changed its status.',
          decision:
            'I gave each listing one ID across active and archived rows. I used claims and state checks to keep overlapping runs from reprocessing the same job or overwriting a newer decision.',
          rationale:
            'An archive step confirms the new row before removing the original.',
          validation:
            'Tests cover duplicate listings, stale claims, and overlapping reviews, plus moved rows and partial archive writes.'
        },
        {
          title: 'Automate preparation, never submission',
          constraint:
            'A generated draft can sound right even when it misstates the candidate’s experience.',
          decision:
            'I gave Groq the versioned candidate profile as a source for drafts and left review and submission to the candidate.',
          rationale:
            'Past outcomes inform the analytics and recommendations for future reviews.',
          tradeoff:
            'The pipeline never applies for a job.'
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
            'The repository lists each workflow and its intended schedule.',
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
      homepageRank: 1,
      thumbnail: {
        src: '/project/pacu-logo.png',
        alt:
          'Orange PACU wordmark for Pharmacy and Acute Care University.',
        fit: 'contain',
        objectPosition: 'center'
      }
    },
    description:
      'My contract work on a pharmacy learning platform: learning-progress fixes, certificate achievement records, and development-to-production content promotion.',
    logo: '/project/pacu-logo.png',
    technologies: ['WordPress', 'Airtable', 'React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    completedAt: '2026-08',
    client: 'Pharmacy & Acute Care University',
    links: {
      liveUrl: 'https://pharmacyacute.com'
    },
    caseStudy: {
      summary:
        'At Pharmacy & Acute Care University, I fixed a bug that let course progress go past 100%. I also prevented duplicate certificate records and gave the team a way to undo a content release.',
      evidence: [
        {
          kind: 'live-product',
          linkLabel: 'Public PACU site',
          description:
            'You can browse courses, board prep, and clinical resources. Progress and certificate records are behind sign-in, and content releases use an internal tool.'
        }
      ],
      roleScope: {
        role: 'Software Engineer (Contract)',
        team: 'PACU product team',
        status: 'Live client platform; contract completed',
        duration: 'February–August 2026',
        ownership: [
          'I worked with the PACU product team on study tools and subscription access for learners, plus the WordPress and Airtable workflows the team used to manage the site.'
        ]
      },
      problem: {
        audience:
          'Pharmacy professionals who need one place to discover courses, stay current with clinical literature, and prepare for board certification.',
        challenge:
          'Learners could miss required readings or see the wrong status in FastTrack.',
        stakes:
          'That made it hard to tell what they still needed to finish.',
        constraints: [
          'The live platform needed targeted improvements without interrupting active learning and administrative workflows.',
          'WordPress, Airtable, custom application code, APIs, and PostgreSQL each owned a different part of the experience.',
          'Subscription access and personalized study state had to remain consistent across learner and administrator surfaces.'
        ]
      },
      solution: {
        summary:
          'I traced where the platform counted a reading or activity as complete.',
        workflow: [
          'Publish course, board-prep, literature, pricing, and resource information through the public WordPress experience.',
          'Support content and operational records in Airtable where the team needs fast, structured updates.',
          'Use custom React and TypeScript interfaces with Node.js APIs and PostgreSQL for personalized study programs, eBook reading, review reminders, subscription entitlements, and admin workflows.',
          'Trace production issues across the relevant layer, apply a targeted fix, verify it with tests, and support the rollout.'
        ]
      },
      learnings: {
        lessons: [
          'I learned to plan for retries and failed writes before building the first version.'
        ],
        improvements: [
          'I’d add a test that follows a required reading from completion to the learner’s progress screen.'
        ],
        unvalidated: [
          'Measuring the effect on course completion would take a follow-up with learner data.'
        ]
      },
      impact: [
        {
          kind: 'implementation',
          value: '5 code paths',
          label: 'Shared completion check',
          context: 'I made five code paths use the same completion check.'
        },
        {
          kind: 'implementation',
          value: '51 passing tests',
          label: 'Certificate records verified',
          context: 'The certificate change passed 51 tests, including access checks.'
        },
        {
          kind: 'product',
          value: 'Release rollback',
          label: 'Content recovery',
          context: 'The team could roll back a content release using the snapshot.'
        }
      ],
      decisions: [
        {
          title: 'Keep one record per certificate achievement',
          constraint: 'A request to save an achievement could be sent more than once.',
          decision: 'I made the write safe to retry and added a database rule to prevent duplicate records. I also added support for filling in past achievements.',
          rationale: 'The rule also applies if two requests arrive at the same time.'
        },
        {
          title: 'Keep content linked through a release',
          constraint: 'Content had to move from development to production with its IDs and relationships intact.',
          decision: 'I built a release tool that checks for missing content, saves a snapshot, and verifies the records after writing them.',
          rationale: 'The tool writes the changes together, so a failed write won’t leave half a release in production.'
        }
      ],
      highlights: [
        'I unified learning-progress completion checks across five code paths and implemented certificate achievement records validated with 51 passing tests.',
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
          caption: 'The PACU wordmark.',
          sourceLabel: 'Live product'
        }
      ]
    }
  }
];
