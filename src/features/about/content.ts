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
    'I work across production monitoring, full-stack product delivery, and workflow automation, with a consistent focus on reliable systems, explicit safeguards, and practical user outcomes.',
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
      id: 'exp-wg-monitoring-engineer',
      title: 'Software Monitoring Engineer',
      company: "Wind's Gate Philippines — Cebu City",
      startDate: '2025-06',
      endDate: null,
      isCurrent: true,
      responsibilities: [
        'Identified and escalated 25+ incidents across eight production services before they reached end users.',
        'Authored eight recovery runbooks that enabled engineers to resolve Tier 1 issues without escalation and reduced average triage time by 30%.'
      ]
    },
    {
      id: 'exp-freelance-software-engineer',
      title: 'Freelance Software Engineer',
      company: 'Upwork — Remote',
      startDate: '2025-01',
      endDate: null,
      isCurrent: true,
      responsibilities: [
        'Resolved 12+ production-blocking defects with an average turnaround of less than 24 hours, restoring affected client workflows.',
        'Rebuilt release automation to remove 15+ manual steps and save approximately four engineering hours per week.',
        'Delivered three client-facing features using React, TypeScript, and Node.js and wrote REST API documentation that reduced contributor onboarding from one week to two days.'
      ]
    },
    {
      id: 'exp-pharmacy-acute-care-software-engineer',
      title: 'Software Engineer (Contract)',
      company: 'Pharmacy & Acute Care University — Remote',
      startDate: '2026-02',
      endDate: '2026-08',
      responsibilities: [
        'Build and maintain full-stack features for an online learning platform, including admin workflows, personalized study programs, eBook and reader access, review reminders, and subscription-based access.',
        'Diagnose production issues involving React and TypeScript interfaces, Node.js APIs, PostgreSQL schemas and migrations, content assets, and entitlement rules; implement targeted fixes that restore blocked learner and administrator workflows.',
        'Contribute to technical design, code review, automated testing, rollout planning, and reliability improvements across frontend and backend systems.'
      ]
    },
    {
      id: 'exp-asi-software-engineer-intern',
      title: 'Software Engineer Intern',
      company: 'Alliance Software Inc. — Cebu City',
      startDate: '2025-06',
      endDate: '2025-07',
      responsibilities: [
        'Delivered five production features using C# and ASP.NET Core MVC while working within an established client codebase, testing process, and code review workflow.'
      ]
    },
    {
      id: 'exp-bayoa-full-stack-intern',
      title: 'Full-Stack Developer Intern',
      company: 'Bayoa Analytics — Remote',
      startDate: '2024-09',
      endDate: '2024-11',
      responsibilities: [
        'Diagnosed N+1 query patterns and database schema bottlenecks, reducing API response time from 800 milliseconds to 150 milliseconds on high-traffic endpoints.'
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
