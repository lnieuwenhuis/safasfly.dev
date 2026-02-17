import { Link } from 'react-router-dom';
import { useSiteData } from '../state/SiteDataContext';

export function ServicesPage() {
  const { data } = useSiteData();
  if (!data) {
    return null;
  }

  const frontendStack = [...new Set(data.projects.flatMap((project) => project.frontend))].sort();
  const backendStack = [...new Set(data.projects.flatMap((project) => project.backend))].sort();

  return (
    <>
      <section className="space-y-6">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Skills</p>
          <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ fontFamily: 'Sora, sans-serif' }}>
            Current technical focus
          </h2>
          <p className="text-base-content/80">
            The stack below reflects what I am actively building with in school and side projects.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="card border border-primary/25 bg-base-200/60 shadow-xl">
            <div className="card-body gap-3 p-5">
              <h3 className="card-title text-lg">Frontend</h3>
              <p className="text-sm text-base-content/80">Building responsive interfaces, reusable components, and clean UX.</p>
              <div className="flex flex-wrap gap-2">
                {frontendStack.map((item) => (
                  <span key={`frontend-${item}`} className="badge badge-outline badge-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <article className="card border border-primary/25 bg-base-200/60 shadow-xl">
            <div className="card-body gap-3 p-5">
              <h3 className="card-title text-lg">Backend</h3>
              <p className="text-sm text-base-content/80">
                Building APIs, data models, authentication flows, and service reliability.
              </p>
              <div className="flex flex-wrap gap-2">
                {backendStack.map((item) => (
                  <span key={`backend-${item}`} className="badge badge-outline badge-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <article className="card border border-primary/25 bg-base-200/60 shadow-xl">
            <div className="card-body gap-3 p-5">
              <h3 className="card-title text-lg">Workflow</h3>
              <p className="text-sm text-base-content/80">I focus on practical engineering habits that scale beyond school projects.</p>
              <ul className="space-y-2 text-sm text-base-content/80">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Type-safe development with clear domain models</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Version control and small iterative commits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Deployment-oriented builds and maintenance basics</span>
                </li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-14 space-y-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">This school year</p>
          <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ fontFamily: 'Sora, sans-serif' }}>
            What I am improving next
          </h2>
          <p className="text-base-content/80">My current priority areas for growth and portfolio quality.</p>
        </div>

        <div className="card border border-primary/25 bg-base-200/60 shadow-xl">
          <div className="card-body p-5">
            <ul className="space-y-2 text-sm text-base-content/85">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>Cleaner architecture for larger React and API codebases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>Testing confidence for both frontend interactions and backend routes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>Production-readiness with observability, error handling, and deployment hygiene</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link className="btn btn-primary normal-case" to="/projects">
            View projects
          </Link>
          <Link className="btn btn-outline btn-primary normal-case" to="/contact">
            Contact me
          </Link>
        </div>
      </section>
    </>
  );
}
