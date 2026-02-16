import type { Project } from '../types/models';

export function sortProjectsByUpdated(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const aTime = Date.parse(a.updatedAt || a.createdAt || '');
    const bTime = Date.parse(b.updatedAt || b.createdAt || '');
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
  });
}
