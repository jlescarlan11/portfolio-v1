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
  summary: string;
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
  title: 'From mathematics to building software.',
  intro:
    'I started in mathematics and now study Computer Science at the University of the Philippines Cebu. Along the way, I’ve built client features, worked on a pharmacy learning platform, and helped monitor production services.',
  skillsHeading: 'Core stack',
  skillsIntro: 'The tools most relevant to the product, reliability, and automation work I take on.',
  credentialsHeading: 'Certificates',
  credentialsIntro: 'Selected certifications and formal training that support the engineering work.',
  experienceHeading: 'Experience',
  educationHeading: 'Education',
  certificationsVisibleCount: 2,

  // A focused, evidence-backed stack for the work positioned on this page.
  techCategories: [
    {
      category: 'Product development',
      items: [
        { label: 'TypeScript' },
        { label: 'React' },
        { label: 'Next.js' },
        { label: 'React Native' },
        { label: 'Flutter' },
        { label: 'Node.js' },
        { label: 'Tailwind CSS' }
      ]
    },
    {
      category: 'Backend and data',
      items: [
        { label: 'REST APIs' },
        { label: 'PostgreSQL' },
        { label: 'Supabase' },
        { label: 'Prisma ORM' },
        { label: 'Drizzle ORM' },
        { label: 'MySQL' },
        { label: 'MongoDB' }
      ]
    },
    {
      category: 'Delivery and automation',
      items: [
        { label: 'Vitest' },
        { label: 'GitHub Actions' },
        { label: 'Docker' },
        { label: 'Vercel' },
        { label: 'n8n' },
        { label: 'Groq API' },
        { label: 'PayMongo' }
      ]
    }
  ],

  education: [
    {
      id: 'edu-up-cs',
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of the Philippines Cebu',
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
      school: 'University of the Philippines Cebu',
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
      summary: 'Monitoring eight production services has given me practice recognizing incidents, escalating them, and documenting recovery steps.',
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
      summary: 'Freelance work has meant taking client features and production fixes through delivery, then making releases and handoffs easier.',
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
      summary: 'At PACU, I contributed across learner and administrator workflows, from diagnosing issues to implementation, review, and testing.',
      title: 'Software Engineer (Contract)',
      company: 'Pharmacy & Acute Care University — Remote',
      startDate: '2026-02',
      endDate: '2026-08',
      responsibilities: [
        'Fixed learning-progress defects on an online learning platform and unified completion checks across five code paths.',
        'Implemented certificate achievement records with idempotent writes, database uniqueness constraints, migration and backfill support, and authorization coverage; validated with 51 passing tests.',
        'Built development-to-production content-promotion tooling with completeness checks, snapshots, transactional writes, rollback, and post-write integrity verification.',
        'Corrected enrollment-scoped exam lookups and course-group mapping so entitlement rules used the correct learning records.'
      ]
    },
    {
      id: 'exp-asi-software-engineer-intern',
      summary: 'I worked across C# and ASP.NET MVC applications, learning through code reviews and pair programming with senior engineers.',
      title: 'Software Engineer Intern',
      company: 'Alliance Software Inc. — Cebu City',
      startDate: '2025-06',
      endDate: '2025-07',
      responsibilities: [
        'Contributed to enterprise web applications using C# and ASP.NET MVC across frontend and backend tasks.',
        'Collaborated with senior engineers through code reviews, pair programming, and agile ceremonies.'
      ]
    },
    {
      id: 'exp-bayoa-full-stack-intern',
      summary: 'I worked across React interfaces and Node.js APIs, contributing reusable components and database improvements.',
      title: 'Full-Stack Developer Intern',
      company: 'Bayoa Analytics — Remote',
      startDate: '2024-09',
      endDate: '2024-11',
      responsibilities: [
        'Worked across Node.js and Express APIs and React interfaces for analytics-focused product workflows.',
        'Built reusable interface components with TypeScript and Tailwind CSS and contributed database and API performance improvements.'
      ]
    }
  ],

  certifications: [
    {
      name: 'GCI World April 2026',
      issuer: 'Matsuo-Iwasawa Laboratory, The University of Tokyo',
      year: '2026',
      url: '/certificates/gci-world-april-2026.pdf'
    },
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
