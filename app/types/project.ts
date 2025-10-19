/**
 * Project Type Definitions
 * Shared types for project data across the application
 */

export interface ProjectImage {
  desktop: string;
  tablet: string;
  mobile: string;
}

export interface ProjectBase {
  id: string;
  title: string;
  category: string;
  description: string;
  logo: string;
  images: ProjectImage;
}

export interface ProjectDetail extends ProjectBase {
  fullDescription: string;
  technologies: string[];
  year: string;
  client: string;
  additionalImages: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export type Project = ProjectBase;
export type ProjectWithDetails = ProjectDetail;

