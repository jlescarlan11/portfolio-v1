export interface PortfolioTechItem {
  label: string;
}

export interface PortfolioExperienceItem {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  isCurrent?: boolean;
  responsibilities: string[];
}

export interface PortfolioEducationItem {
  id: string;
  degree: string;
  school: string;
  achievements?: string[];
  startDate: string;
  endDate?: string | null;
  isCurrent?: boolean;
}

export interface PortfolioCertificationItem {
  name: string;
  issuer?: string;
  year?: string;
  url?: string;
}

export interface PortfolioTechCategory {
  category: string;
  items: PortfolioTechItem[];
}

export interface AboutContent {
  eyebrow: string;
  title: string;
  intro: string;
  skillsHeading: string;
  skillsIntro: string;
  credentialsHeading: string;
  credentialsIntro: string;
  experienceHeading: string;
  educationHeading: string;
  certificationsVisibleCount: number;
  education: PortfolioEducationItem[];
  experience: PortfolioExperienceItem[];
  certifications: PortfolioCertificationItem[];
  techCategories: PortfolioTechCategory[];
}

export const aboutContent: AboutContent = {
  eyebrow: 'About',
  title: 'Experience, education, and the stack behind it.',
  intro:
    'From production monitoring to full-stack product delivery, the throughline is keeping reliability, observability, and automation front and center so the systems stay useful in real-world use.',
  skillsHeading: 'Skills',
  skillsIntro: 'The tools I reach for most often, grouped by where they show up in the stack.',
  credentialsHeading: 'Credentials',
  credentialsIntro: 'Selected certifications and formal training that support the engineering work.',
  experienceHeading: 'Experience',
  educationHeading: 'Education',
  certificationsVisibleCount: 2,

  // ── Three compact groups: write → build → deploy ─────────────────────────
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
      // Frontend frameworks, backend frameworks, libraries, testing, auth
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
      // Databases, ORMs, DevOps, cloud, Git
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

  education: [
    {
      id: 'edu-up-cs',
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of the Philippines',
      achievements: [
        'University Scholar (consistent academic honor)',
        'Semi-Finalist, 1st Naga City Mayoral Hackathon'
      ],
      startDate: '2025-08',
      endDate: null,
      isCurrent: true
    },
    {
      id: 'edu-up-math',
      degree: 'Bachelor of Science in Mathematics',
      school: 'University of the Philippines',
      achievements: [
        'College Scholar (consistent academic honor)',
        'DOST Junior Level Science Scholarship (JLSS) Awardee'
      ],
      startDate: '2022-09',
      endDate: '2025-06'
    }
  ],

  experience: [
    {
      id: 'exp-freelance-software-engineer',
      title: 'Freelance Software Engineer',
      company: 'Upwork — Remote',
      startDate: '2025-01',
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

  certifications: [
    {
      name: 'Amazon Junior Software Developer with Generative AI',
      issuer: 'Amazon',
      year: '2025',
      url: 'https://www.coursera.org/account/accomplishments/specialization/PLMC59Z3XNB9'
    },
    {
      name: 'Agile Project Management',
      issuer: 'Google',
      year: '2025',
      url: 'https://www.coursera.org/account/accomplishments/verify/QYUV5C56WQCV'
    }
  ]
};