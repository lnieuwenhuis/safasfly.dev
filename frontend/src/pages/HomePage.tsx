import { Link } from 'react-router-dom';
import { ProjectCard } from '../components/cards/ProjectCard';
import { SocialIcon } from '../components/common/SocialIcon';
import { trackEvent } from '../lib/analytics';
import { sortProjectsByUpdated } from '../lib/sort';
import { useSiteData } from '../state/SiteDataContext';

const quickLinks = [
  {
    title: 'Skills',
    summary: 'Frontend, backend, and tooling I am actively learning.',
    to: '/services',
    cta: 'View skills',
  },
  {
    title: 'Projects',
    summary: 'Recent builds with stack decisions and technical scope.',
    to: '/projects',
    cta: 'Browse projects',
  },
  {
    title: 'Notes',
    summary: 'Short write-ups about what I learn while building.',
    to: '/insights',
    cta: 'Read notes',
  },
  {
    title: 'Contact',
    summary: 'Internships, collaboration, or questions about my work.',
    to: '/contact',
    cta: 'Send message',
  },
];

export function HomePage() {
  const { data } = useSiteData();

  if (!data) {
    return null;
  }

  const { profile, socials, projects } = data;
  const latestProjects = sortProjectsByUpdated(projects).slice(0, 2);
  const coreStack = [...new Set(projects.flatMap((project) => [...project.frontend, ...project.backend]))].slice(0, 8);

  return (
    <div className="space-y-12 md:space-y-16">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
            4th-year MBO4 Software Development Student
          </p>
          <h1 className="max-w-[12ch] text-4xl font-bold leading-tight md:text-6xl" style={{ fontFamily: 'Sora, sans-serif' }}>
            {profile.name}
          </h1>
          <p className="text-xl font-medium text-base-content/90">Student developer focused on full-stack web applications</p>
          <p className="max-w-2xl text-base leading-relaxed text-base-content/80">
            I am currently in my final year of MBO4 Software Development in the Netherlands. I use school assignments and
            side projects to improve my frontend, backend, and deployment skills.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link className="btn btn-primary normal-case" to="/projects">
              View projects
            </Link>
            <Link
              className="btn btn-outline btn-primary normal-case"
              to="/contact"
              onClick={() => {
                trackEvent('hero_contact_click');
              }}
            >
              Contact me
            </Link>
          </div>

          <p className="text-sm font-medium text-success">Open to internships, graduation projects, and collaboration.</p>

          <div className="flex flex-wrap gap-2" aria-label="Social links">
            {socials.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                aria-label={social.platform}
                className="btn btn-square btn-ghost border border-primary/25"
              >
                <SocialIcon icon={social.icon} />
              </a>
            ))}
          </div>
        </div>

        <aside className="card border border-primary/25 bg-base-200/70 shadow-xl">
          <div className="card-body gap-4 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Student snapshot</p>
            <h2 className="text-2xl font-bold leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
              Learning by shipping
            </h2>
            <p className="text-sm leading-relaxed text-base-content/80">
              I practice by building real projects end-to-end: UX, APIs, auth, data models, and production deployment.
            </p>
            <p className="text-sm text-base-content/70">
              Based in {profile.location}. Also online as <span className="font-medium">{profile.gamertag}</span>.
            </p>
            <div className="flex flex-wrap gap-2">
              {coreStack.map((item) => (
                <span key={`stack-${item}`} className="badge badge-outline badge-sm">
                  {item}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link className="btn btn-outline btn-primary btn-sm normal-case" to="/services">
                Skills
              </Link>
              <Link className="btn btn-outline btn-primary btn-sm normal-case" to="/insights">
                Notes
              </Link>
              <Link className="btn btn-outline btn-primary btn-sm normal-case" to="/free-audit">
                Checklist
              </Link>
            </div>
          </div>
        </aside>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Recent work</p>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ fontFamily: 'Sora, sans-serif' }}>
              Latest builds
            </h2>
          </div>
          <Link className="btn btn-outline btn-primary btn-sm normal-case md:btn-md" to="/projects">
            See all
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {latestProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Explore</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((item) => (
            <article key={item.to} className="card border border-primary/25 bg-base-200/55 shadow-lg">
              <div className="card-body gap-3 p-5">
                <h3 className="card-title text-lg">{item.title}</h3>
                <p className="text-sm text-base-content/80">{item.summary}</p>
                <div className="card-actions">
                  <Link className="btn btn-primary btn-sm normal-case" to={item.to}>
                    {item.cta}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
