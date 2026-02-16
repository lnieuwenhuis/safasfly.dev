import type { Project } from '../../types/models';

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const stack = [...new Set([...project.frontend, ...project.backend])].slice(0, 6);

  return (
    <article
      className="card border border-primary/25 bg-base-200/60 shadow-xl transition hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="card-body gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="card-title text-lg">{project.name}</h3>
          {project.featured ? <span className="badge badge-primary badge-outline">Featured</span> : null}
        </div>

        <p className="line-clamp-3 text-sm text-base-content/80">{project.description}</p>

        <div className="flex flex-wrap gap-2">
          {stack.map((item) => (
            <span key={`${project.id}-stack-${item}`} className="badge badge-outline badge-sm">
              {item}
            </span>
          ))}
          {project.frontend.length + project.backend.length > stack.length ? (
            <span className="badge badge-outline badge-sm text-base-content/70">More</span>
          ) : null}
        </div>

        <div className="card-actions pt-1">
          <a href={project.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm normal-case">
            Visit project
          </a>
        </div>
      </div>
    </article>
  );
}
