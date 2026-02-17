import { Link } from 'react-router-dom';
import { ProjectCard } from '../components/cards/ProjectCard';
import { sortProjectsByUpdated } from '../lib/sort';
import { useSiteData } from '../state/SiteDataContext';

export function ProjectsPage() {
  const { data } = useSiteData();
  if (!data) {
    return null;
  }

  const projects = sortProjectsByUpdated(data.projects);

  return (
    <section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Projects</p>
        <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ fontFamily: 'Sora, sans-serif' }}>
          Build log
        </h2>
        <p className="text-base-content/80">
          A selection of projects where I practiced full-stack implementation, architecture decisions, and deployment.
        </p>
        <Link className="btn btn-outline btn-primary btn-sm normal-case md:btn-md" to="/contact">
          Ask me about a project
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
