/**
 * Project Type Definitions
 * Shared types for project data across the application
 */

export interface ProjectBase {
  title: string;
  category: string;
  description: string;
  logo: string;
}

export interface ProjectDetail extends ProjectBase {
  fullDescription?: string;
  technologies: string[];
  year: string;
  client?: string;
  additionalImages?: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export type Project = ProjectBase;
export type ProjectWithDetails = ProjectDetail;

