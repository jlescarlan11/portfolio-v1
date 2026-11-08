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
  expectedGraduationDate?: string;
}

export interface PortfolioCertificationItem {
  name: string;
  issuer?: string;
  year?: string;
  issuedOn?: string;
  description?: string;
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
  skillsIntro: 'I build interfaces with React and TypeScript and use Node.js and PostgreSQL for APIs and data.',
  credentialsHeading: 'Certificates',
  credentialsIntro: 'Selected courses and certificates in data science, software development, and project management.',
  experienceHeading: 'Experience',
  educationHeading: 'Education',
  certificationsVisibleCount: 2,

  techCategories: [
    {
      category: 'Core stack',
      items: [
        { label: 'React' },
        { label: 'TypeScript' },
        { label: 'Node.js' },
        { label: 'PostgreSQL' }
      ]
    },
    {
      category: 'Web and mobile',
      items: [
        { label: 'Next.js' },
        { label: 'React Native' },
        { label: 'Expo' },
        { label: 'Flutter' },
        { label: 'Tailwind CSS' }
      ]
    },
    {
      category: 'Backend and data',
      items: [
        { label: 'REST APIs' },
        { label: 'Supabase' },
        { label: 'Prisma' },
        { label: 'SQLite' }
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
        'DOST Junior Level Science Scholarship (JLSS) Awardee',
        'Health-track semifinalist with Team CTRL+H at the 1st Naga City Mayoral Hackathon'
      ],
      startDate: '2025-08',
      endDate: null,
      isCurrent: true,
      expectedGraduationDate: '2027-08'
    },
    {
      id: 'edu-up-math',
      degree: 'Mathematics studies',
      school: 'University of the Philippines Cebu',
      achievements: [
        'College Scholar (consistent academic honor)'
      ],
      startDate: '2022-09',
      endDate: '2025-06'
    }
  ],

  experience: [
    {
      id: 'exp-wg-monitoring-engineer',
      summary: 'I caught and escalated at least 25 incidents across eight production services and wrote eight recovery guides.',
      title: 'Software Monitoring Engineer',
      company: "Wind's Gate Philippines — Cebu City",
      startDate: '2025-06',
      endDate: null,
      isCurrent: true,
      responsibilities: [
        'I identified and escalated 25+ incidents across eight production services before they reached users.',
        'I wrote eight recovery runbooks that helped engineers resolve Tier 1 issues without escalation and cut average triage time by 30%.'
      ]
    },
    {
      id: 'exp-freelance-software-engineer',
      summary: 'I fixed at least a dozen issues that blocked client work and automated release steps, saving about four engineering hours a week.',
      title: 'Freelance Software Engineer',
      company: 'Upwork — Remote',
      startDate: '2025-01',
      endDate: null,
      isCurrent: true,
      responsibilities: [
        'I fixed 12+ production issues that blocked client work, with an average turnaround under 24 hours.',
        'I automated releases, removing 15+ manual steps and saving about four engineering hours a week.',
        'I delivered three client features with React, TypeScript, and Node.js. I also documented REST APIs, cutting contributor onboarding from one week to two days.'
      ]
    },
    {
      id: 'exp-pharmacy-acute-care-software-engineer',
      summary: 'I fixed course progress and corrected exam access checks so they used the learner’s enrollment.',
      title: 'Software Engineer (Contract)',
      company: 'Pharmacy & Acute Care University — Remote',
      startDate: '2026-02',
      endDate: '2026-08',
      responsibilities: [
        'I fixed course progress bugs and made five code paths use the same completion check.',
        'I made certificate records safe to retry, added a database rule to prevent duplicates, and supported filling in past records. The change passed 51 tests, including access checks.',
        'I built a tool to release course content from development to production. It checks for missing content, takes a snapshot, applies changes in a transaction, verifies the result, and supports rollback.',
        'I fixed exam access so it checks the right enrollment and course group.'
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
        'I worked on the frontend and backend of enterprise web applications using C# and ASP.NET MVC.',
        'I paired with senior engineers, took part in code reviews, and joined the team’s agile meetings.'
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
        'I worked on React interfaces and Node.js and Express APIs for analytics workflows.',
        'I built reusable components with TypeScript and Tailwind CSS and helped improve database and API performance.'
      ]
    }
  ],

  certifications: [
    {
      name: 'GCI World April 2026',
      issuer: 'Matsuo-Iwasawa Laboratory, Graduate School of Engineering, The University of Tokyo',
      year: '2026',
      issuedOn: '2026-08-31',
      description: 'I completed the April 2026 course in data science theory and implementation and passed the final assessment.',
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

export const stackExamples = [
  {
    slug: 'pacu',
    title: 'PACU',
    description: 'React and TypeScript study tools, with Node.js APIs and PostgreSQL for learner progress and certificate records.'
  },
  {
    slug: 'pricecraft',
    title: 'PriceCraft',
    description: 'An offline-capable React and TypeScript pricing calculator with Supabase sync and Vitest coverage for pricing calculations.'
  },
  {
    slug: 'health',
    title: 'HEALTH',
    description: 'A React Native and Expo app that stores care records offline in SQLite and syncs them with a Node.js, Prisma, and PostgreSQL backend.'
  },
  {
    slug: 'rent-n-roll',
    title: 'Rent N Roll',
    description: 'A Next.js rental marketplace with typed Supabase database calls and PayMongo webhooks for payment and deposit updates.'
  },
  {
    slug: 'job-pipeline',
    title: 'Job Pipeline',
    description: 'Seven n8n workflows that rank job listings and use Groq to prepare application drafts for manual review.'
  }
];
