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
