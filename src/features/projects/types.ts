export interface ProjectCaseStudy {
  summary: string;
  overview: string[];
  highlights: string[];
  gallery?: string[];
}

export interface ProjectLinks {
  liveUrl?: string;
  githubUrl?: string;
}

export interface ProjectRecord {
  slug: string;
  title: string;
  category: string;
  description: string;
  logo: string;
  technologies: string[];
  completedAt: string;
  client?: string;
  links: ProjectLinks;
  caseStudy: ProjectCaseStudy;
}

export interface ProjectsSectionContent {
  eyebrow: string;
  title: string;
  intro: string;
  initialCount: number;
  increment: number;
  ctaLabel: string;
  loadMoreLabel: string;
}
