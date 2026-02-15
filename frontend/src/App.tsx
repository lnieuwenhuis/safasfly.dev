import { useEffect, useMemo, useState, type FormEvent } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  backend: string[];
  frontend: string[];
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AboutInfo {
  name: string;
  gamertag: string;
  title: string;
  bio: string;
  location: string;
  email: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface ContactRequest {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface AdminAuth {
  token: string;
  email: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
  expiresAt: string;
}

type ContactState = 'idle' | 'sending' | 'success' | 'error';
type AdminStatus = 'idle' | 'loading' | 'ready' | 'error';
type RoutePath = '/' | '/projects' | '/contact' | '/admin';

const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');
const ADMIN_SESSION_TOKEN_KEY = 'safasfly_admin_session_token';
const ADMIN_SESSION_EMAIL_KEY = 'safasfly_admin_session_email';
const SEEDED_ADMIN_EMAIL = 'lnieuwenhuis48@icloud.com';

const navItems: Array<{ path: RoutePath; label: string }> = [
  { path: '/', label: 'Home' },
  { path: '/projects', label: 'Projects' },
  { path: '/contact', label: 'Contact' },
];

const emptyProjectForm = {
  id: '',
  name: '',
  description: '',
  url: '',
  frontend: '',
  backend: '',
  featured: false,
};

function normalizeRoute(pathname: string): RoutePath {
  if (pathname.startsWith('/projects')) {
    return '/projects';
  }

  if (pathname.startsWith('/contact')) {
    return '/contact';
  }

  if (pathname.startsWith('/admin')) {
    return '/admin';
  }

  return '/';
}

function formatDate(date: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function getProjectTimestamp(project: Project): number {
  const value = project.updatedAt || project.createdAt;
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toTechStack(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function fromTechStack(value: string[]): string {
  return value.join(', ');
}

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function SocialIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'github':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2a10 10 0 0 0-3.162 19.49c.5.093.682-.217.682-.483v-1.69c-2.782.604-3.369-1.194-3.369-1.194-.454-1.158-1.11-1.467-1.11-1.467-.908-.62.069-.608.069-.608 1.003.07 1.53 1.03 1.53 1.03.892 1.53 2.341 1.088 2.91.832.092-.646.35-1.088.636-1.338-2.22-.252-4.555-1.112-4.555-4.949 0-1.094.39-1.989 1.029-2.69-.103-.252-.446-1.272.098-2.649 0 0 .84-.269 2.75 1.027A9.56 9.56 0 0 1 12 6.843a9.56 9.56 0 0 1 2.503.337c1.909-1.296 2.747-1.027 2.747-1.027.545 1.378.202 2.397.1 2.65.639.7 1.028 1.595 1.028 2.689 0 3.846-2.338 4.694-4.565 4.947.359.308.678.92.678 1.853v2.747c0 .268.18.577.688.48A10 10 0 0 0 12 2Z"
          />
        </svg>
      );
    case 'linkedin':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M20.45 20.45h-3.55v-5.57c0-1.32-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77A1.77 1.77 0 0 0 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"
          />
        </svg>
      );
    case 'twitter':
    case 'x':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M18.25 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.81-5.95 6.81H1.7l7.72-8.84L1.25 2.25h6.83l4.71 6.23 5.46-6.23Zm-1.16 17.53h1.83L7.08 4.13H5.12l11.97 15.65Z"
          />
        </svg>
      );
    default:
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
            d="m14 3 7 7-7 7M3 12h17"
          />
        </svg>
      );
  }
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className="project-card" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="project-top">
        <h3>{project.name}</h3>
        {project.featured ? <span className="badge">Featured</span> : null}
      </div>

      <p>{project.description}</p>

      <div className="stack-group">
        <p>Frontend</p>
        <div>
          {project.frontend.map((tech) => (
            <span key={`${project.id}-fe-${tech}`}>{tech}</span>
          ))}
        </div>
      </div>

      <div className="stack-group">
        <p>Backend</p>
        <div>
          {project.backend.map((tech) => (
            <span key={`${project.id}-be-${tech}`}>{tech}</span>
          ))}
        </div>
      </div>

      <a href={project.url} target="_blank" rel="noreferrer" className="project-link">
        Visit project
      </a>
    </article>
  );
}

function App() {
  const [route, setRoute] = useState<RoutePath>(() => {
    if (typeof window === 'undefined') {
      return '/';
    }

    return normalizeRoute(window.location.pathname);
  });

  const [about, setAbout] = useState<AboutInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [contactState, setContactState] = useState<ContactState>('idle');

  const [adminAuth, setAdminAuth] = useState<AdminAuth | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus>('idle');
  const [adminError, setAdminError] = useState('');
  const [loginForm, setLoginForm] = useState({
    email: SEEDED_ADMIN_EMAIL,
    password: '',
  });
  const [adminProjects, setAdminProjects] = useState<Project[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);

  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectActionMessage, setProjectActionMessage] = useState('');

  const adminToken = adminAuth?.token || '';

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => getProjectTimestamp(b) - getProjectTimestamp(a)),
    [projects],
  );

  const latestProjects = useMemo(() => sortedProjects.slice(0, 2), [sortedProjects]);

  const displayName = about?.name ?? 'Lars Nieuwenhuis';
  const displayTitle = about?.title ?? 'Freelance Full Stack Developer';
  const displayBio =
    about?.bio ||
    'I am a freelance developer building products end-to-end: design-minded frontend, stable backend, and practical deployment.';
  const displayLocation = about?.location ?? 'Netherlands';
  const displayGamertag = about?.gamertag ?? 'safasfly';
  const displayEmail = about?.email ?? 'contact@safasfly.dev';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const onPopState = () => {
      setRoute(normalizeRoute(window.location.pathname));
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedToken = window.localStorage.getItem(ADMIN_SESSION_TOKEN_KEY);
    const storedEmail = window.localStorage.getItem(ADMIN_SESSION_EMAIL_KEY);

    if (storedToken && storedEmail) {
      setAdminAuth({ token: storedToken, email: storedEmail });
      setLoginForm((prev) => ({ ...prev, email: storedEmail }));
    }
  }, []);

  function navigate(path: RoutePath) {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }

    setRoute(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function persistAdminSession(auth: AdminAuth | null) {
    if (typeof window === 'undefined') {
      return;
    }

    if (!auth) {
      window.localStorage.removeItem(ADMIN_SESSION_TOKEN_KEY);
      window.localStorage.removeItem(ADMIN_SESSION_EMAIL_KEY);
      return;
    }

    window.localStorage.setItem(ADMIN_SESSION_TOKEN_KEY, auth.token);
    window.localStorage.setItem(ADMIN_SESSION_EMAIL_KEY, auth.email);
  }

  async function fetchPublicData() {
    setLoading(true);
    setLoadError(null);

    try {
      const [aboutRes, projectsRes, socialsRes] = await Promise.all([
        fetch(`${API_BASE}/about`),
        fetch(`${API_BASE}/projects`),
        fetch(`${API_BASE}/socials`),
      ]);

      if (!aboutRes.ok || !projectsRes.ok || !socialsRes.ok) {
        throw new Error('Failed to load portfolio data');
      }

      const [aboutData, projectsData, socialsData] = await Promise.all([
        aboutRes.json() as Promise<AboutInfo>,
        projectsRes.json() as Promise<Project[]>,
        socialsRes.json() as Promise<SocialLink[]>,
      ]);

      setAbout(aboutData);
      setProjects(projectsData);
      setSocials(socialsData);
    } catch (error) {
      console.error(error);
      setLoadError('Could not load portfolio data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }

  async function loadAdminDashboard(token: string) {
    setAdminStatus('loading');
    setAdminError('');

    try {
      const [projectsRes, contactsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/projects`, { headers: authHeaders(token) }),
        fetch(`${API_BASE}/admin/contacts`, { headers: authHeaders(token) }),
      ]);

      if (projectsRes.status === 401 || contactsRes.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }

      if (!projectsRes.ok || !contactsRes.ok) {
        throw new Error('Failed to load admin data.');
      }

      const [projectsData, contactsData] = await Promise.all([
        projectsRes.json() as Promise<Project[]>,
        contactsRes.json() as Promise<ContactRequest[]>,
      ]);

      setAdminProjects(projectsData);
      setContactRequests(contactsData);
      setAdminStatus('ready');
    } catch (error) {
      console.error(error);
      setAdminStatus('error');
      const message = error instanceof Error ? error.message : 'Failed to load admin data.';
      setAdminError(message);

      if (message.toLowerCase().includes('session')) {
        setAdminAuth(null);
        persistAdminSession(null);
      }
    }
  }

  useEffect(() => {
    fetchPublicData();
  }, []);

  useEffect(() => {
    if (route !== '/admin' || !adminToken) {
      return;
    }

    loadAdminDashboard(adminToken);
  }, [route, adminToken]);

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactState('sending');

    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to send message'));
      }

      setContactState('success');
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error(error);
      setContactState('error');
    }
  }

  async function handleAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdminStatus('loading');
    setAdminError('');

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Invalid credentials'));
      }

      const data = (await response.json()) as LoginResponse;
      const nextAuth: AdminAuth = {
        token: data.token,
        email: data.user.email,
      };

      setAdminAuth(nextAuth);
      persistAdminSession(nextAuth);
      setLoginForm((prev) => ({ ...prev, password: '' }));
      await loadAdminDashboard(nextAuth.token);
    } catch (error) {
      console.error(error);
      setAdminStatus('error');
      setAdminError(error instanceof Error ? error.message : 'Failed to login');
    }
  }

  async function handleAdminLogout() {
    if (adminToken) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: authHeaders(adminToken),
      }).catch(() => undefined);
    }

    setAdminAuth(null);
    persistAdminSession(null);
    setAdminProjects([]);
    setContactRequests([]);
    setAdminStatus('idle');
    setAdminError('');
    setEditingProjectId(null);
    setProjectForm(emptyProjectForm);
    setProjectActionMessage('');
  }

  function beginEditProject(project: Project) {
    setEditingProjectId(project.id);
    setProjectForm({
      id: project.id,
      name: project.name,
      description: project.description,
      url: project.url,
      frontend: fromTechStack(project.frontend),
      backend: fromTechStack(project.backend),
      featured: Boolean(project.featured),
    });
    setProjectActionMessage('');
  }

  function resetProjectEditor() {
    setEditingProjectId(null);
    setProjectForm(emptyProjectForm);
    setProjectActionMessage('');
  }

  async function refreshDataAfterAdminWrite() {
    await fetchPublicData();
    if (adminToken) {
      await loadAdminDashboard(adminToken);
    }
  }

  async function handleProjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!adminToken) {
      setProjectActionMessage('You are not authenticated.');
      return;
    }

    setProjectActionMessage(editingProjectId ? 'Updating project...' : 'Creating project...');

    const payload = {
      id: projectForm.id.trim(),
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
      url: projectForm.url.trim(),
      frontend: toTechStack(projectForm.frontend),
      backend: toTechStack(projectForm.backend),
      featured: projectForm.featured,
    };

    const isEditing = Boolean(editingProjectId);
    const endpoint = editingProjectId ? `${API_BASE}/admin/projects/${editingProjectId}` : `${API_BASE}/admin/projects`;
    const method = editingProjectId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          ...authHeaders(adminToken),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to save project'));
      }

      resetProjectEditor();
      await refreshDataAfterAdminWrite();
      setProjectActionMessage(isEditing ? 'Project updated.' : 'Project created.');
    } catch (error) {
      console.error(error);
      setProjectActionMessage(error instanceof Error ? error.message : 'Failed to save project');
    }
  }

  async function handleDeleteProject(id: string) {
    if (!adminToken) {
      setProjectActionMessage('You are not authenticated.');
      return;
    }

    if (!window.confirm('Delete this project?')) {
      return;
    }

    setProjectActionMessage('Deleting project...');
    const wasEditingDeletedProject = editingProjectId === id;

    try {
      const response = await fetch(`${API_BASE}/admin/projects/${id}`, {
        method: 'DELETE',
        headers: authHeaders(adminToken),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Failed to delete project'));
      }

      if (wasEditingDeletedProject) {
        resetProjectEditor();
      }

      await refreshDataAfterAdminWrite();
      setProjectActionMessage('Project deleted.');
    } catch (error) {
      console.error(error);
      setProjectActionMessage(error instanceof Error ? error.message : 'Failed to delete project');
    }
  }

  function renderHomePage() {
    return (
      <>
        <section className="hero-grid reveal">
          <div className="hero-copy">
            <p className="eyebrow">Freelance Developer</p>
            <h1>{displayName}</h1>
            <p className="subtitle">{displayTitle}</p>
            <p className="lead">{displayBio}</p>
            <p className="solo-line">One technical owner from concept to delivery. Fast communication, direct accountability.</p>

            <div className="hero-meta">
              <span>{displayLocation}</span>
              <span>@{displayGamertag}</span>
              <a href={`mailto:${displayEmail}`}>{displayEmail}</a>
            </div>

            <div className="hero-actions">
              <button type="button" className="button solid" onClick={() => navigate('/contact')}>
                Start a project
              </button>
              <button type="button" className="button ghost" onClick={() => navigate('/projects')}>
                View all projects
              </button>
            </div>

            <div className="social-row" aria-label="Social links">
              {socials.map((social) => (
                <a key={social.platform} href={social.url} target="_blank" rel="noreferrer" aria-label={social.platform}>
                  <SocialIcon icon={social.icon} />
                </a>
              ))}
            </div>
          </div>

          <aside className="hero-panel">
            <p className="panel-label">How I work</p>
            <h2>Fast delivery without agency overhead.</h2>
            <p>I run projects solo so communication stays direct and engineering stays consistent from day one.</p>
            <ul>
              <li>React + TypeScript frontends with high velocity</li>
              <li>Lean backend services with Hono and Go</li>
              <li>Simple infrastructure and maintainable deployments</li>
            </ul>
          </aside>
        </section>

        <section className="page-section reveal">
          <div className="section-head compact">
            <p className="eyebrow">Latest work</p>
            <h2>Most recent 2 projects</h2>
            <p>See the newest production work first, then browse everything on the projects page.</p>
          </div>

          <div className="project-grid">
            {latestProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>

          <div className="page-actions">
            <button type="button" className="button ghost" onClick={() => navigate('/projects')}>
              Open all projects
            </button>
          </div>
        </section>
      </>
    );
  }

  function renderProjectsPage() {
    return (
      <section className="page-section reveal">
        <div className="section-head">
          <p className="eyebrow">Projects</p>
          <h2>All projects</h2>
          <p>Detailed overview of delivered projects, stack choices, and production links.</p>
        </div>

        <div className="project-grid">
          {sortedProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>
    );
  }

  function renderContactPage() {
    return (
      <section className="page-section contact-layout reveal">
        <div className="section-head">
          <p className="eyebrow">Contact</p>
          <h2>Let&apos;s discuss your project</h2>
          <p>Send a brief and I will reply personally. No middle layers, no handoffs.</p>

          <div className="contact-aside">
            <p>
              I work as a freelancer and can support full delivery from planning to deployment, or plug into your existing
              stack for focused implementation.
            </p>
            <a href={`mailto:${displayEmail}`}>{displayEmail}</a>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleContactSubmit}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={contactForm.name}
            onChange={(event) => setContactForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={contactForm.email}
            onChange={(event) => setContactForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />

          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            name="subject"
            type="text"
            value={contactForm.subject}
            onChange={(event) => setContactForm((prev) => ({ ...prev, subject: event.target.value }))}
            required
          />

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={contactForm.message}
            onChange={(event) => setContactForm((prev) => ({ ...prev, message: event.target.value }))}
            required
          />

          <button type="submit" className="button solid" disabled={contactState === 'sending'}>
            {contactState === 'sending' ? 'Sending...' : 'Send message'}
          </button>

          {contactState === 'success' ? <p className="status success">Thanks, message sent.</p> : null}
          {contactState === 'error' ? <p className="status error">Could not send your message. Please try again.</p> : null}
        </form>
      </section>
    );
  }

  function renderAdminPage() {
    return (
      <section className="page-section reveal">
        <div className="section-head">
          <p className="eyebrow">Admin</p>
          <h2>Project and inbox management</h2>
          <p>Sign in with your seeded admin account to manage projects and contact requests.</p>
        </div>

        {!adminAuth ? (
          <form className="admin-login" onSubmit={handleAdminLogin}>
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              value={loginForm.email}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />

            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />

            <button type="submit" className="button solid" disabled={adminStatus === 'loading'}>
              {adminStatus === 'loading' ? 'Signing in...' : 'Sign in'}
            </button>
            {adminError ? <p className="status error">{adminError}</p> : null}
          </form>
        ) : (
          <div className="admin-shell">
            <div className="admin-toolbar">
              <p>Signed in as {adminAuth.email}</p>
              <button type="button" className="button ghost" onClick={handleAdminLogout}>
                Log out
              </button>
            </div>

            {adminStatus === 'loading' ? <p className="status">Loading admin data...</p> : null}
            {adminStatus === 'error' ? <p className="status error">{adminError}</p> : null}

            <div className="admin-grid">
              <section className="admin-card">
                <h3>{editingProjectId ? `Edit project: ${editingProjectId}` : 'Add project'}</h3>
                <form className="project-form" onSubmit={handleProjectSubmit}>
                  {!editingProjectId ? (
                    <>
                      <label htmlFor="project-id">Project ID (optional)</label>
                      <input
                        id="project-id"
                        type="text"
                        value={projectForm.id}
                        onChange={(event) => setProjectForm((prev) => ({ ...prev, id: event.target.value }))}
                        placeholder="my-project"
                      />
                    </>
                  ) : null}

                  <label htmlFor="project-name">Name</label>
                  <input
                    id="project-name"
                    type="text"
                    value={projectForm.name}
                    onChange={(event) => setProjectForm((prev) => ({ ...prev, name: event.target.value }))}
                    required
                  />

                  <label htmlFor="project-url">URL</label>
                  <input
                    id="project-url"
                    type="url"
                    value={projectForm.url}
                    onChange={(event) => setProjectForm((prev) => ({ ...prev, url: event.target.value }))}
                    required
                  />

                  <label htmlFor="project-description">Description</label>
                  <textarea
                    id="project-description"
                    rows={4}
                    value={projectForm.description}
                    onChange={(event) => setProjectForm((prev) => ({ ...prev, description: event.target.value }))}
                    required
                  />

                  <label htmlFor="project-frontend">Frontend stack (comma-separated)</label>
                  <input
                    id="project-frontend"
                    type="text"
                    value={projectForm.frontend}
                    onChange={(event) => setProjectForm((prev) => ({ ...prev, frontend: event.target.value }))}
                    required
                  />

                  <label htmlFor="project-backend">Backend stack (comma-separated)</label>
                  <input
                    id="project-backend"
                    type="text"
                    value={projectForm.backend}
                    onChange={(event) => setProjectForm((prev) => ({ ...prev, backend: event.target.value }))}
                    required
                  />

                  <label className="checkbox-row" htmlFor="project-featured">
                    <input
                      id="project-featured"
                      type="checkbox"
                      checked={projectForm.featured}
                      onChange={(event) => setProjectForm((prev) => ({ ...prev, featured: event.target.checked }))}
                    />
                    Featured project
                  </label>

                  <div className="admin-actions">
                    <button type="submit" className="button solid">
                      {editingProjectId ? 'Update project' : 'Add project'}
                    </button>
                    {editingProjectId ? (
                      <button type="button" className="button ghost" onClick={resetProjectEditor}>
                        Cancel edit
                      </button>
                    ) : null}
                  </div>

                  {projectActionMessage ? <p className="status">{projectActionMessage}</p> : null}
                </form>
              </section>

              <section className="admin-card">
                <h3>Projects ({adminProjects.length})</h3>
                <div className="admin-list">
                  {adminProjects.map((project) => (
                    <article key={project.id} className="admin-list-item">
                      <div>
                        <h4>{project.name}</h4>
                        <p>{project.id}</p>
                      </div>
                      <div className="list-item-actions">
                        <button type="button" className="button ghost" onClick={() => beginEditProject(project)}>
                          Edit
                        </button>
                        <button type="button" className="button danger" onClick={() => handleDeleteProject(project.id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <section className="admin-card">
              <h3>Contact requests ({contactRequests.length})</h3>
              <div className="admin-list">
                {contactRequests.length === 0 ? <p className="muted">No contact requests yet.</p> : null}
                {contactRequests.map((request) => (
                  <article key={request.id} className="contact-item">
                    <header>
                      <h4>{request.subject}</h4>
                      <span>{formatDate(request.createdAt)}</span>
                    </header>
                    <p className="meta">
                      <strong>{request.name}</strong> • {request.email}
                    </p>
                    <p>{request.message}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </section>
    );
  }

  const currentYear = new Date().getFullYear();

  if (loading) {
    return (
      <div className="page page-loading">
        <div className="loader" />
        <p>Loading portfolio</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page page-loading">
        <p>{loadError}</p>
        <button type="button" className="button solid" onClick={fetchPublicData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="bg-shape shape-one" />
      <div className="bg-shape shape-two" />

      <header className="site-header">
        <a
          className="brand"
          href="/"
          onClick={(event) => {
            event.preventDefault();
            navigate('/');
          }}
        >
          safasfly.dev
        </a>

        <nav aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={route === item.path ? 'active' : ''}
              onClick={(event) => {
                event.preventDefault();
                navigate(item.path);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="layout">
        {route === '/' ? renderHomePage() : null}
        {route === '/projects' ? renderProjectsPage() : null}
        {route === '/contact' ? renderContactPage() : null}
        {route === '/admin' ? renderAdminPage() : null}
      </main>

      <footer className="site-footer">
        <p>{currentYear} safasfly.dev</p>
        <p>React • TypeScript • Hono • SQLite</p>
      </footer>
    </div>
  );
}

export default App;
