import { Link } from 'react-router-dom';
import { ProjectCard } from '../components/cards/ProjectCard';
import { SocialIcon } from '../components/common/SocialIcon';
import { trackEvent } from '../lib/analytics';
import { sortProjectsByUpdated } from '../lib/sort';
import { useSiteData } from '../state/SiteDataContext';

const quickLinks = [
  {
    title: 'Services',
    summary: 'Packages, scope options, and delivery model.',
    to: '/services',
    cta: 'See services',
  },
  {
    title: 'Projects',
    summary: 'Recent shipped work and technical stack choices.',
    to: '/projects',
    cta: 'See projects',
  },
  {
    title: 'Insights',
    summary: 'Short notes on pricing, growth, and execution.',
    to: '/insights',
    cta: 'Read insights',
  },
  {
    title: 'Contact',
    summary: 'Share your scope. I will confirm next steps.',
    to: '/contact',
    cta: 'Send inquiry',
  },
];

export function HomePage() {
  const { data } = useSiteData();

  if (!data) {
    return null;
  }

  const { profile, socials, projects } = data;
  const latestProjects = sortProjectsByUpdated(projects).slice(0, 2);

  return (
    <div className="space-y-12 md:space-y-16">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Solo Freelance Developer</p>
          <h1 className="max-w-[12ch] text-4xl font-bold leading-tight md:text-6xl" style={{ fontFamily: 'Sora, sans-serif' }}>
            {profile.name}
          </h1>
          <p className="text-xl font-medium text-base-content/90">{profile.title}</p>
          <p className="line-clamp-3 max-w-2xl text-base leading-relaxed text-base-content/80">{profile.bio}</p>

          <div className="flex flex-wrap gap-3">
            <Link
              className="btn btn-primary normal-case"
              to="/contact"
              onClick={() => {
                trackEvent('hero_start_project');
              }}
            >
              Start a project
            </Link>
            <Link className="btn btn-outline btn-primary normal-case" to="/projects">
              View projects
            </Link>
          </div>

          <p className="text-sm font-medium text-success">{profile.responseSla}</p>

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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Quick intro</p>
            <h2 className="text-2xl font-bold leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
              Build fast. Keep it stable.
            </h2>
            <p className="text-sm leading-relaxed text-base-content/80">{profile.nicheOffer}</p>
            <p className="text-sm text-base-content/70">{profile.availability}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link className="btn btn-outline btn-primary btn-sm normal-case" to="/services">
                Services
              </Link>
              <Link className="btn btn-outline btn-primary btn-sm normal-case" to="/insights">
                Insights
              </Link>
              <Link className="btn btn-outline btn-primary btn-sm normal-case" to="/free-audit">
                Free audit
              </Link>
            </div>
          </div>
        </aside>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Latest work</p>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ fontFamily: 'Sora, sans-serif' }}>
              Recent shipped projects
            </h2>
          </div>
          <Link className="btn btn-outline btn-primary btn-sm normal-case md:btn-md" to="/projects">
            All projects
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
