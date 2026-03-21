import type { ProjectRecord, ProjectsSectionContent } from './types';

export const projectsSectionContent: ProjectsSectionContent = {
  eyebrow: 'Selected Work',
  title: 'A focused set of builds across product, backend, and developer tooling.',
  intro:
    'Each project solves a concrete problem, from pricing and healthcare access to scheduling, mapping, and personal finance.',
  initialCount: 5,
  increment: 4,
  ctaLabel: 'View project',
  loadMoreLabel: 'Load more'
};

export const projects: ProjectRecord[] = [
  // ─── ACTIVE / NOT ARCHIVED ────────────────────────────────────────────────
  {
    slug: 'kaizen',
    title: 'Kaizen',
    category: 'Web Application / Personal Finance',
    description:
      'A personal finance web app for Filipino students and young adults featuring transaction tracking, budget management, a Hold Vault for pausing impulse purchases, and a regret-tagging system called "Sayang".',
    logo: '',
    technologies: ['TypeScript', 'React', 'Java', 'Spring Boot', 'PostgreSQL', 'Tailwind CSS'],
    completedAt: '2026-03', // last pushed 2026-03-21
    links: {
      githubUrl: 'https://github.com/jlescarlan11/kaizen'
    },
    caseStudy: {
      summary:
        'A finance tool built around the behavioral patterns of Filipino students — impulse control, regret tracking, and incremental improvement.',
      overview: [
        'Kaizen is designed for young Filipinos who struggle with impulse spending. Rather than a generic budgeting app, it introduces culturally resonant mechanics like the Hold Vault (a cooling-off period before purchases) and Sayang tagging (marking transactions you regret).',
        'The stack pairs a React TypeScript frontend with a Java Spring Boot backend, reflecting a production-grade architecture suitable for real user growth.'
      ],
      highlights: [
        'Hold Vault feature introduces behavioral friction before impulse purchases.',
        'Sayang regret-tagging system turns hindsight into actionable spending insights.',
        'Full-stack architecture with Spring Boot API and React TypeScript frontend.'
      ]
    }
  },
  {
    slug: 'pricecraft',
    title: 'PriceCraft',
    category: 'Web Application / Productivity Tool',
    description:
      'A web-based calculator that helps small food businesses in the Philippines determine profitable selling prices for their products.',
    logo: '/project/pricecraft.svg',
    technologies: ['TypeScript', 'React', 'Vite', 'Tailwind CSS'],
    completedAt: '2026-01', // last pushed 2026-01-10
    links: {
      githubUrl: 'https://github.com/jlescarlan11/pricecraft',
      liveUrl: 'https://pricecraft.netlify.app/'
    },
    caseStudy: {
      summary:
        'A product-minded pricing workspace for small Filipino food businesses — modeling margins, labor, and overhead before those assumptions leak into operations.',
      overview: [
        'PriceCraft was built to make pricing decisions legible for small food entrepreneurs. Instead of burying cost assumptions in spreadsheets, the app surfaces margin, labor, and overhead tradeoffs in one clear workflow.',
        'The build focused on practical usability, fast calculation feedback, and a responsive layout that works in low-resource environments.'
      ],
      highlights: [
        'Targeted at small Filipino food businesses — a specific, underserved use case.',
        'Deployed live at pricecraft.netlify.app.',
        'Built with TypeScript and React for a fast, responsive experience.'
      ]
    }
  },
  {
    slug: 'portfolio-v1',
    title: 'Portfolio v1',
    category: 'Personal Portfolio',
    description:
      'A personal developer portfolio showcasing projects, skills, and background — built with TypeScript and deployed on Netlify.',
    logo: '',
    technologies: ['TypeScript', 'React', 'Tailwind CSS'],
    completedAt: '2026-02', // last pushed 2026-02-21
    links: {
      githubUrl: 'https://github.com/jlescarlan11/portfolio-v1',
      liveUrl: 'https://johnlesterescarlan.netlify.app/'
    },
    caseStudy: {
      summary:
        'A clean personal portfolio presenting work, stack, and background as a professional developer.',
      overview: [
        'Portfolio v1 serves as the primary public-facing developer profile, designed to communicate depth of projects and technical range to recruiters and collaborators.',
        'Built with TypeScript and Tailwind CSS, it reflects the same stack choices used in production work.'
      ],
      highlights: [
        'Live at johnlesterescarlan.netlify.app.',
        'TypeScript + Tailwind stack consistent with production projects.',
        'Clean presentation of project history and developer background.'
      ]
    }
  },

  // ─── ARCHIVED — SHOWCASEABLE ──────────────────────────────────────────────
  {
    slug: 'health',
    title: 'HEALTH',
    category: 'Mobile Application',
    description:
      'A mobile application that solves hospital overcrowding by guiding residents to the right healthcare facility — built for the 1st Naga City Mayoral Hackathon.',
    logo: '/project/health.svg',
    technologies: ['TypeScript', 'React Native', 'Expo', 'Node.js', 'Prisma', 'PostgreSQL', 'SQLite'],
    completedAt: '2026-02', // last pushed 2026-02-03
    links: {
      githubUrl: 'https://github.com/jlescarlan11/health'
    },
    caseStudy: {
      summary:
        'A mobile guide for matching people to the right healthcare path even when connectivity is unreliable.',
      overview: [
        'HEALTH combined local-first mobile behavior with healthcare decision support so residents could still navigate care options without depending on a stable network connection.',
        'The project centered on practical usability: facility discovery, enrollment guidance, and language that helped users move from uncertainty to the next action.'
      ],
      highlights: [
        'Designed for offline-first access patterns in low-connectivity areas.',
        'Mapped healthcare facilities and triage guidance into one flow.',
        'Hackathon project: 1st Naga City Mayoral Hackathon (Team MatCs, Project Lead).'
      ]
    }
  },
  {
    slug: 'krawl',
    title: 'Krawl',
    category: 'Progressive Web App (PWA)',
    description:
      'A Progressive Web App designed to help users discover and share authentic Filipino cultural experiences in Cebu City.',
    logo: '/project/krawl.svg',
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Java', 'Spring Boot', 'PostgreSQL', 'PostGIS', 'Mapbox GL JS', 'OAuth2'],
    completedAt: '2026-01', // last pushed 2026-01-06
    links: {
      githubUrl: 'https://github.com/jlescarlan11/project-krawl'
    },
    caseStudy: {
      summary:
        'A mapping product built around cultural discovery, community contribution, and geospatial search in Cebu City.',
      overview: [
        'Krawl treated cultural discovery as a product and data problem at the same time. The experience needed to feel exploratory while still supporting structured geospatial data, routing, and community curation.',
        'The stack deliberately combined a modern React frontend with a stronger backend and database layer for spatial queries, authentication, and future growth.'
      ],
      highlights: [
        'Used PostGIS-backed spatial data for map-driven discovery.',
        'Connected a modern Next.js frontend with a Java Spring Boot backend.',
        'Focused on Filipino cultural contexts specific to Cebu City.'
      ]
    }
  },
  {
    slug: 'john-lester-escarlan-developer',
    title: 'Developer Site',
    category: 'Personal Portfolio',
    description:
      'An earlier developer portfolio deployed on Vercel — presenting projects, skills, and background as a full-stack developer.',
    logo: '/project/blogit.svg',
    technologies: ['TypeScript', 'React', 'Tailwind CSS'],
    completedAt: '2025-10', // last pushed 2025-10-16
    links: {
      githubUrl: 'https://github.com/jlescarlan11/john-lester-escarlan-developer',
      liveUrl: 'https://john-lester-escarlan-developer.vercel.app'
    },
    caseStudy: {
      summary:
        'An early developer portfolio iteration, deployed live on Vercel.',
      overview: [
        'This was the first deployed portfolio iteration, built to establish a public developer identity and showcase project work.',
        'Superseded by portfolio-v1 but preserved as a versioned record of earlier frontend work.'
      ],
      highlights: [
        'Live at john-lester-escarlan-developer.vercel.app.',
        'TypeScript React stack with Tailwind CSS.',
        'First versioned public developer portfolio.'
      ]
    }
  },

  {
    slug: 'regex2nfa',
    title: 'Regex to NFA Converter',
    category: 'Algorithms / Developer Tool',
    description:
      'A learning tool that converts regular expressions into non-deterministic finite automata — most starred repo (2 stars, 1 fork).',
    logo: '/project/regextonfa.svg',
    technologies: ['TypeScript', 'Automata Theory', 'Algorithms'],
    completedAt: '2025-06', // last pushed 2025-06-03
    links: {
      githubUrl: 'https://github.com/jlescarlan11/regex2nfa'
    },
    caseStudy: {
      summary:
        'An educational tool for making abstract automata concepts more concrete and inspectable.',
      overview: [
        'The converter was built to bridge theory and implementation by turning regular expressions into a machine representation learners could inspect and reason about.',
        'The project emphasized correctness, stepwise transformation, and a learning-oriented presentation — making it the most community-engaged repo in the profile (2 stars, 1 fork).'
      ],
      highlights: [
        'Most forked repo (1 fork) and tied highest-starred (2 stars).',
        'Built around formal language theory — directly connected to CS curriculum.',
        'TypeScript implementation for accessibility in the browser.'
      ]
    }
  },
  {
    slug: 'talarama',
    title: 'Talarama',
    category: 'Movie Diary App',
    description:
      'A movie diary app for logging what you watched and capturing your reaction while it is still fresh.',
    logo: '/project/talarama.svg',
    technologies: ['TypeScript', 'Node.js'],
    completedAt: '2025-06', // last pushed 2025-06-06
    links: {
      githubUrl: 'https://github.com/jlescarlan11/talarama',
      liveUrl: 'https://talarama.vercel.app'
    },
    caseStudy: {
      summary:
        'A personal logging product for capturing movies and immediate reactions in one place — tied highest-starred (2 stars, 2 forks).',
      overview: [
        'Talarama approached media tracking as a lightweight journaling problem. The focus was less on social discovery and more on preserving a viewer reaction while it was still recent.',
        'It is the most forked repo (2 forks) and tied for most starred (2 stars), reflecting genuine community interest in the use case.'
      ],
      highlights: [
        'Most forked repo (2 forks) and tied highest-starred (2 stars).',
        'Live at talarama.vercel.app.',
        'Compact TypeScript + Node.js full-stack setup.'
      ]
    }
  },
  {
    slug: 'storifyyy',
    title: 'Storify',
    category: 'File Management',
    description:
      'A tool to upload, store, and share files — with folder organization, shareable links, access control, file previews, and link expiration dates.',
    logo: '/project/storify.svg',
    technologies: ['EJS', 'Node.js', 'Express', 'File Upload'],
    completedAt: '2025-05', // last pushed 2025-05-06
    links: {
      githubUrl: 'https://github.com/jlescarlan11/Storifyyy',
      liveUrl: 'https://storifyyy.onrender.com'
    },
    caseStudy: {
      summary:
        'A file-sharing utility focused on simple upload, organization, and access flows.',
      overview: [
        'Storify treated file handling as a practical product workflow: upload, store, organize, and share without unnecessary interface overhead.',
        'The system was implemented with a server-rendered Node stack suited to form handling, uploads, and straightforward CRUD behavior.'
      ],
      highlights: [
        'Live at storifyyy.onrender.com.',
        'Supports file previews, shareable links, and link expiration.',
        'Built with Express and EJS for a simple delivery model.'
      ]
    }
  },
  {
    slug: 'sutta-blogs',
    title: 'Blog It',
    category: 'Blogging Platform',
    description:
      'A Next.js blogging platform for writing, publishing, and sharing articles with a cleaner authoring flow.',
    logo: '/project/blogit.svg',
    technologies: ['TypeScript', 'Next.js', 'Tailwind CSS'],
    completedAt: '2025-06', // last pushed 2025-06-24
    links: {
      githubUrl: 'https://github.com/jlescarlan11/sutta-blogs',
      liveUrl: 'https://blog-it-gamma.vercel.app'
    },
    caseStudy: {
      summary:
        'A content publishing project that prioritized a cleaner authoring and reading flow.',
      overview: [
        'Blog It centered on the mechanics of writing and publishing without overcomplicating the editorial experience.',
        'The stack used Next.js for routing and rendering, keeping content structure and deployment straightforward.'
      ],
      highlights: [
        'Live at blog-it-gamma.vercel.app.',
        'Built with Next.js — description notes explicit intent to use it.',
        'TypeScript throughout for consistent typing.'
      ]
    }
  },
  {
    slug: 'slink',
    title: 'Slink',
    category: 'Link Shortener',
    description:
      'A link shortener and URL management service focused on fast creation and simple organization.',
    logo: '/project/slink.svg',
    technologies: ['TypeScript', 'React', 'Tailwind CSS', 'Java', 'Spring Boot'],
    completedAt: '2025-09', // last pushed 2025-09-07
    links: {
      githubUrl: 'https://github.com/jlescarlan11/slink-frontend',
      liveUrl: 'https://slink-seven-wine.vercel.app'
    },
    caseStudy: {
      summary:
        'A URL management tool built around speed, clarity, and low-friction creation.',
      overview: [
        'Slink turned a common utility into a cleaner product flow, focusing on link creation, lookup, and lightweight organization rather than dashboards full of noise.',
        'The system combined a React frontend and Spring Boot backend, giving the project a clear separation between interface and service concerns.'
      ],
      highlights: [
        'Live at slink-seven-wine.vercel.app.',
        'Split responsibilities across a React frontend and Spring Boot backend.',
        'Note: only the frontend repo is public; default branch is master.'
      ]
    }
  },
  {
    slug: 'spring-poll-app',
    title: 'Poll App',
    category: 'Web Application',
    description:
      'A Spring Boot polling app for creating surveys, collecting responses, and managing results.',
    logo: '/project/poll.svg',
    technologies: ['Java', 'Spring Boot', 'REST API', 'PostgreSQL'],
    completedAt: '2025-08', // last pushed 2025-08-17
    links: {
      githubUrl: 'https://github.com/jlescarlan11/spring_poll_app'
    },
    caseStudy: {
      summary:
        'A backend-centric polling system focused on survey creation and response management.',
      overview: [
        'This project emphasized the API and persistence side of polling workflows: creating surveys, collecting answers, and exposing results cleanly.',
        'The implementation served as a practical Spring Boot application with domain logic, REST behavior, and database-backed state.'
      ],
      highlights: [
        'Pure Java Spring Boot — demonstrates backend-first development capability.',
        'RESTful polling workflows with PostgreSQL for durable storage.',
        'Relevant to the Spring Boot stack used in Kaizen and Slink.'
      ]
    }
  },
  {
    slug: 'schedsmart',
    title: 'SchedSmart',
    category: 'Scheduling Tool',
    description:
      'A scheduling tool for organizing events and availability without the usual back-and-forth.',
    logo: '/project/smartsched.svg',
    technologies: ['TypeScript', 'React', 'Node.js'],
    completedAt: '2025-09', // last pushed 2025-09-24
    links: {
      githubUrl: 'https://github.com/jlescarlan11/SchedSmart',
      liveUrl: 'https://schedsmart.vercel.app'
    },
    caseStudy: {
      summary:
        'A workflow-focused scheduler aimed at reducing coordination drag.',
      overview: [
        'SchedSmart tackled the repetitive friction of collecting availability and getting groups to a final time.',
        'The implementation balanced straightforward React UI work with backend logic that could support scheduling state and user coordination.'
      ],
      highlights: [
        'Live at schedsmart.vercel.app.',
        'TypeScript React + Node.js full-stack setup.',
        'Focused on reducing availability-coordination overhead.'
      ]
    }
  },
  {
    slug: 'whatsrecip',
    title: 'WhatsRecip',
    category: 'Web Application',
    description:
      'A recipe discovery app that turns available ingredients into practical meal suggestions.',
    logo: '/project/whatsrecip.svg',
    technologies: ['TypeScript', 'React', 'Java', 'Spring Boot', 'API Integration'],
    completedAt: '2025-10', // last pushed 2025-10-14
    links: {
      githubUrl: 'https://github.com/jlescarlan11/whatsrecip',
      liveUrl: 'https://whatsrecip.vercel.app'
    },
    caseStudy: {
      summary:
        'A practical search experience for turning pantry constraints into workable meals.',
      overview: [
        'WhatsRecip was designed around a simple user question: what can I cook right now with what I already have? The product prioritizes low-friction ingredient input and useful suggestions.',
        'The build combined a React TypeScript frontend with a Spring Boot backend and API-backed recipe logic.'
      ],
      highlights: [
        'Live at whatsrecip.vercel.app.',
        'React + Spring Boot stack — consistent with Kaizen and Slink architecture.',
        'Ingredient-first discovery flow.'
      ]
    }
  },
  {
    slug: 'nutcha-bites',
    title: 'Nutcha Bites',
    category: 'Web Application',
    description:
      'A food ordering app built around a simple browsing and checkout experience.',
    logo: '/project/nutchabites.svg',
    technologies: ['JavaScript', 'HTML5', 'CSS3', 'API Integration'],
    completedAt: '2025-02', // last pushed 2025-02-24
    links: {
      githubUrl: 'https://github.com/jlescarlan11/nutcha-bites',
      liveUrl: 'https://nutcha-bites.vercel.app'
    },
    caseStudy: {
      summary:
        'A lightweight ordering experience centered on browse-to-checkout simplicity.',
      overview: [
        'Nutcha Bites focused on a direct food ordering flow with minimal cognitive load: browse, pick, and proceed.',
        'The project emphasized frontend fundamentals using vanilla JavaScript — before moving to TypeScript in later projects.'
      ],
      highlights: [
        'Live at nutcha-bites.vercel.app.',
        'Built in vanilla JavaScript — an early project showing foundational frontend skills.',
        'Integrated external API for product data.'
      ]
    }
  },
  {
    slug: 'time-complexity-counter',
    title: 'Time Complexity Counter',
    category: 'Algorithms',
    description:
      'A Java-based tool for analyzing algorithmic runtime and turning code paths into clearer time complexity estimates.',
    logo: '/project/timecom.svg',
    technologies: ['Java'],
    completedAt: '2025-10', // last pushed 2025-10-20
    links: {
      githubUrl: 'https://github.com/jlescarlan11/time-complexity-counter'
    },
    caseStudy: {
      summary:
        'A developer-facing utility for translating algorithm structure into understandable complexity feedback.',
      overview: [
        'This project focused on making algorithm analysis more explicit. Instead of leaving runtime reasoning as an exercise for the reader, the tool helps reveal how branching and repetition affect overall complexity.',
        'The implementation emphasized correctness and educational clarity over visual polish.'
      ],
      highlights: [
        'Pure Java implementation.',
        'Connected to algorithms coursework at UP Cebu.',
        'Makes code path complexity explicit and inspectable.'
      ]
    }
  },
  {
    slug: 'eduverse',
    title: 'Eduverse',
    category: 'Education Platform',
    description:
      'An ASP.NET learning platform built to support interactive educational experiences.',
    logo: '/project/eduverse.svg',
    technologies: ['C#', 'ASP.NET', 'SQL Server'],
    completedAt: '2025-07', // created 2025-07-16, last pushed same day
    links: {
      githubUrl: 'https://github.com/jlescarlan11/Eduverse'
    },
    caseStudy: {
      summary:
        'An education-focused platform built around structured content and interactive learning flows.',
      overview: [
        'Eduverse explored how an educational product can combine structured learning content with interactive behaviors.',
        'The implementation uses C# and ASP.NET — demonstrating range beyond the TypeScript/Java primary stack.'
      ],
      highlights: [
        'C# ASP.NET stack — demonstrates multi-language development range.',
        'Built for structured educational use cases.',
        'SQL Server for persistence.'
      ]
    }
  },
  {
    slug: 'cmsc-21-project',
    title: 'Quiz Game',
    category: 'Game Development',
    description:
      'An interactive quiz game built as a CMSC 21 course requirement at UP Cebu.',
    logo: '/project/quizgame.svg',
    technologies: ['C'],
    completedAt: '2024-06', // last pushed 2024-06-07
    links: {
      githubUrl: 'https://github.com/jlescarlan11/CMSC-21-PROJECT'
    },
    caseStudy: {
      summary:
        'A course-built game project demonstrating low-level C programming fundamentals.',
      overview: [
        'Quiz Game explored the lower-level mechanics of implementing a playable experience in C: state transitions, question handling, and clear feedback loops.',
        'As the oldest archived project, it marks the starting point of the GitHub profile — built during the CS foundational coursework at UP Cebu.'
      ],
      highlights: [
        'Earliest project in the profile (2024).',
        'Built in C as a CMSC 21 course requirement.',
        'Demonstrates low-level programming foundations before the TypeScript/Java era.'
      ]
    }
  }

  // ─── EXCLUDED FROM PORTFOLIO ──────────────────────────────────────────────
  // jlescarlan11 — GitHub profile README repo (no code)
  // test_repo    — Shell scripts test repo, not a project
];