export interface ProjectRoleScope {
  role: string;
  ownership: string[];
  team?: string;
  duration?: string;
  status?: string;
}

export interface ProjectProblem {
  audience: string;
  challenge: string;
  stakes: string;
  constraints: string[];
}

export interface ProjectSolution {
  summary: string;
  workflow: string[];
}

export interface ProjectLearnings {
  lessons: string[];
  improvements: string[];
  unvalidated: string[];
}

export type ProjectOutcomeKind = 'product' | 'implementation';

export interface ProjectImpact {
  kind: ProjectOutcomeKind;
  value: string;
  label: string;
  context: string;
}

export type ProjectVisualSection =
  | 'problem'
  | 'solution'
  | 'decisions'
  | 'outcomes'
  | 'learnings';

interface ProjectVisualBase {
  src: string;
  alt: string;
  caption: string;
}

export interface ProjectHeroVisual extends ProjectVisualBase {
  kind: 'hero';
}

export interface ProjectSupportingVisual extends ProjectVisualBase {
  kind: 'supporting';
  section: ProjectVisualSection;
}

export type ProjectVisual = ProjectHeroVisual | ProjectSupportingVisual;

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
  problem: ProjectProblem;
  solution: ProjectSolution;
  learnings: ProjectLearnings;
  impact: ProjectImpact[];
  decisions: ProjectDecision[];
  highlights: string[];
  visuals: ProjectVisual[];
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
