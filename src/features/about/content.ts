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
        { label: 'C#' }
      ]
    },
    {
      // Frontend frameworks, backend frameworks, libraries, testing, auth
      category: 'Frameworks & Libraries',
      items: [
        { label: 'React' },
        { label: 'Next.js' },
        { label: 'React Native' },
        { label: 'Node.js' },
        { label: 'Express.js' },
        { label: 'Spring Boot' },
        { label: 'ASP.NET' },
        { label: 'Tailwind CSS' },
        { label: 'TanStack Query' },
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
        { label: 'MongoDB' },
        { label: 'SQLite' },
        { label: 'Redis' },
        { label: 'Drizzle ORM' },
        { label: 'Prisma ORM' },
        { label: 'Docker' },
        { label: 'Kubernetes' },
        { label: 'GitHub CI/CD' },
        { label: 'AWS' },
        { label: 'Vercel' },
        { label: 'Supabase' },
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
      id: 'exp-pc-software-engineer',
      title: 'Software Engineer',
      company: 'Pharmacy & Acute Care University (PACU) — Remote',
      startDate: '2026-02',
      endDate: null,
      isCurrent: true,
      responsibilities: [
        'Shipped backend features end-to-end on a live healthcare education platform used in production.',
        'Reduced manual overhead by building automated pipelines for deployment, testing, and content generation.',
        'Improved long-term codebase health by leading refactors that increased maintainability and cut technical debt.'
      ]
    },
    {
      id: 'exp-codevf-software-engineer',
      title: 'Software Engineer',
      company: 'CodeVF — Contract',
      startDate: '2026-01',
      endDate: '2026-03',
      responsibilities: [
        'Diagnosed and resolved production-blocking issues under time pressure, directly restoring system workflows for end users.',
        'Strengthened internal developer experience by overhauling automation tooling, cutting repetitive manual steps for the engineering team.'
      ]
    },
    {
      id: 'exp-wg-monitoring-engineer',
      title: 'Software Monitoring Engineer',
      company: "Wind's Gate Philippines — Cebu City",
      startDate: '2025-06',
      endDate: '2026-02',
      responsibilities: [
        'Own uptime visibility for distributed production systems, catching and escalating incidents before they impact end users.',
        'Traced root causes from raw logs and alerts, turning ambiguous system noise into actionable incident reports for engineering teams.'
      ]
    },
    {
      id: 'exp-asi-software-engineer-intern',
      title: 'Software Engineer Intern',
      company: 'Alliance Software Inc. — Cebu City',
      startDate: '2025-06',
      endDate: '2025-07',
      responsibilities: [
        "Delivered features that passed production code review standards at one of the Philippines' largest software firms — as a first-year CS student."
      ]
    },
    {
      id: 'exp-bayoa-full-stack-intern',
      title: 'Full-Stack Developer Intern',
      company: 'Bayoa Analytics — Remote',
      startDate: '2024-09',
      endDate: '2024-11',
      responsibilities: [
        'Applied mathematics-informed thinking to identify and fix N+1 query patterns and schema inefficiencies, measurably improving backend response performance.'
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