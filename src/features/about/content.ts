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
  title: 'Product delivery shaped by production operations.',
  intro:
    'My work spans client delivery and production monitoring. I turn requirements into explicit system states, keep trade-offs visible, document the handoff, and verify changes with tests and rollout checks.',
  skillsHeading: 'Core stack',
  skillsIntro: 'The tools most relevant to the product, reliability, and automation work I take on.',
  credentialsHeading: 'Credentials',
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
