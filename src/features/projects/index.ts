export { projects, projectsSectionContent } from './data.ts';
export {
  getAllProjects,
  getHomepageProjects,
  getNextProject,
  getProjectBySlug,
  getProjectSlugs,
  selectHomepageProjects
} from './lib/projects.ts';
export type {
  ProjectListing,
  ProjectListingThumbnail,
  ProjectRecord,
  ProjectsSectionContent
} from './types.ts';
export {
  default as ProjectsSection,
  ProjectGrid
} from './components/ProjectsSection';
