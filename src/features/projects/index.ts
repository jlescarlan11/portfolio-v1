export { projects, projectsSectionContent } from './data.ts';
export {
  getAllProjects,
  getNextProject,
  getProjectBySlug,
  getProjectSlugs
} from './lib/projects.ts';
export type { ProjectRecord, ProjectsSectionContent } from './types.ts';
export { default as ProjectsSection } from './components/ProjectsSection';
