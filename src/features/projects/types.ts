export interface ProjectRoleScope {
  role: string;
  ownership: string[];
  team?: string;
  duration?: string;
  status?: string;
}

export interface ProjectImpact {
  value: string;
  label: string;
  context: string;
}

export interface ProjectDecision {
  title: string;
  constraint: string;
  decision: string;
  rationale: string;
  tradeoff?: string;
  validation?: string;
}

export interface ProjectCaseStudy {
  summary: string;
  roleScope: ProjectRoleScope;
  overview: string[];
  impact: ProjectImpact[];
  decisions: ProjectDecision[];
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
  ctaLabel: string;
}
