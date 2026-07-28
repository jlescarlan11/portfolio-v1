import { projects } from '../data.ts';
import type { ProjectRecord } from '../types.ts';

export function getAllProjects(): ProjectRecord[] {
  return projects;
}

export function getProjectSlugs(): string[] {
  return projects.map((project) => project.slug);
}

export function getProjectBySlug(slug: string): ProjectRecord | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string): ProjectRecord | undefined {
  const currentIndex = projects.findIndex(project => project.slug === slug);
  if (currentIndex === -1 || projects.length === 0) return undefined;

  return projects[(currentIndex + 1) % projects.length];
}
