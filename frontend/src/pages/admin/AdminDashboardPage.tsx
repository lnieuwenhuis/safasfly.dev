import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { trackEvent } from '../../lib/analytics';
import { useAdminAuth } from '../../state/AdminAuthContext';
import type {
  AdminDashboardStats,
  AnalyticsEvent,
  AnalyticsSummary,
  BlogPost,
  CaseStudy,
  ContactRequest,
  LeadCapture,
  OfferPackage,
  Project,
  RetainerPlan,
  ServiceLandingPage,
  SiteProfile,
  SocialLink,
} from '../../types/models';

function toCsv(items: string[]): string {
  return items.join(', ');
}

function fromCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
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

const contactStatuses = ['new', 'in_review', 'quoted', 'closed', 'archived'] as const;

type DashboardSection =
  | 'overview'
  | 'profile'
  | 'projects'
  | 'offers'
  | 'retainers'
  | 'caseStudies'
  | 'servicePages'
  | 'blogPosts'
  | 'inbox'
  | 'leads'
  | 'analytics';

const initialStats: AdminDashboardStats = {
  totalProjects: 0,
  totalOffers: 0,
  totalRetainers: 0,
  totalCaseStudies: 0,
  openContacts: 0,
  totalLeads: 0,
};

const initialProfile: SiteProfile = {
  name: '',
  gamertag: '',
  title: '',
  bio: '',
  location: '',
  email: '',
  nicheOffer: '',
  responseSla: '',
  availability: '',
  bookingUrl: '',
  hourlyRateFrom: '',
  monthlyHostingFrom: '',
  updatedAt: '',
};

const emptyProjectForm = {
  id: '',
  name: '',
  description: '',
  url: '',
  frontend: '',
  backend: '',
  featured: false,
};

const emptyOfferForm = {
  id: '',
  name: '',
  description: '',
  priceFrom: '',
  timeline: '',
  revisions: '',
  hosting: '',
  includes: '',
  featured: false,
  sortOrder: 0,
};

const emptyRetainerForm = {
  id: '',
  name: '',
  hoursPerMonth: 10,
  price: '',
  hostingIncluded: true,
  supportSla: '',
  includes: '',
  sortOrder: 0,
};

const emptyCaseStudyForm = {
  id: '',
  title: '',
  clientName: '',
  industry: '',
  challenge: '',
  solution: '',
  outcome: '',
  testimonialQuote: '',
  testimonialAuthor: '',
  projectUrl: '',
  featured: false,
};

const emptyServicePageForm = {
  id: '',
  slug: '',
  title: '',
  audience: '',
  city: '',
  summary: '',
  offer: '',
  seoDescription: '',
  ctaLabel: '',
};

const emptyBlogPostForm = {
  id: '',
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  category: '',
  readTime: '',
  publishedAt: '',
};

const sections: Array<{ key: DashboardSection; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'profile', label: 'Profile' },
  { key: 'projects', label: 'Projects' },
  { key: 'offers', label: 'Packages' },
  { key: 'retainers', label: 'Retainers' },
  { key: 'caseStudies', label: 'Case Studies' },
  { key: 'servicePages', label: 'Service Pages' },
  { key: 'blogPosts', label: 'Blog Posts' },
  { key: 'inbox', label: 'Inbox' },
  { key: 'leads', label: 'Leads' },
  { key: 'analytics', label: 'Analytics' },
];

const adminPageClass =
  'mx-auto w-full max-w-[1500px] px-4 pb-14 pt-8 md:px-6 lg:px-8';

const adminSectionGridClass = 'grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]';

const adminCardClass =
  `${'rounded-3xl border border-primary/30 bg-base-200/65 p-6 shadow-xl shadow-primary/10 backdrop-blur '} ` +
  '[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-base-content ' +
  '[&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-base-content ' +
  '[&_p]:text-sm [&_p]:text-base-content/80 [&_ul]:space-y-2 [&_li]:text-sm [&_li]:text-base-content/75';

const adminStatCardClass =
  `${adminCardClass} space-y-1 ` +
  '[&_h3]:text-xs [&_h3]:uppercase [&_h3]:tracking-[0.2em] [&_h3]:text-base-content/60 ' +
  '[&_p]:text-5xl [&_p]:font-semibold [&_p]:leading-none [&_p]:text-base-content';

const adminFormCardClass =
  `${adminCardClass} flex flex-col gap-3 ` +
  '[&_h3]:mb-1 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-base-content ' +
  '[&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.18em] [&_label]:text-base-content/70 ' +
  '[&_input:not([type=checkbox])]:w-full [&_input:not([type=checkbox])]:rounded-xl [&_input:not([type=checkbox])]:border [&_input:not([type=checkbox])]:border-primary/35 ' +
  '[&_input:not([type=checkbox])]:bg-base-100/60 [&_input:not([type=checkbox])]:px-4 [&_input:not([type=checkbox])]:py-2.5 [&_input:not([type=checkbox])]:text-sm ' +
  '[&_input:not([type=checkbox])]:text-base-content [&_input:not([type=checkbox])]:outline-none [&_input:not([type=checkbox])]:transition ' +
  '[&_input:not([type=checkbox])]:focus:border-primary [&_input:not([type=checkbox])]:focus:ring-2 [&_input:not([type=checkbox])]:focus:ring-primary/35 ' +
  '[&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-primary/35 [&_textarea]:bg-base-100/60 [&_textarea]:px-4 [&_textarea]:py-3 [&_textarea]:text-sm ' +
  '[&_textarea]:text-base-content [&_textarea]:outline-none [&_textarea]:transition [&_textarea]:focus:border-primary [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-primary/35 ' +
  '[&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-primary/35 [&_select]:bg-base-100/60 [&_select]:px-4 [&_select]:py-2.5 [&_select]:text-sm ' +
  '[&_select]:text-base-content [&_select]:outline-none [&_select]:transition [&_select]:focus:border-primary [&_select]:focus:ring-2 [&_select]:focus:ring-primary/35 ' +
  '[&_input:not([type=checkbox]):disabled]:cursor-not-allowed [&_input:not([type=checkbox]):disabled]:opacity-60';

const adminListItemClass =
  `${'flex flex-col gap-3 rounded-2xl border border-primary/25 bg-base-100/40 p-4 md:flex-row md:items-start md:justify-between '} ` +
  '[&_p]:text-sm [&_p]:text-base-content/75 ' +
  '[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-primary/35 [&_input]:bg-base-100/60 [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm ' +
  '[&_input]:text-base-content [&_input]:outline-none [&_input]:transition [&_input]:focus:border-primary [&_input]:focus:ring-2 [&_input]:focus:ring-primary/35';

const adminContactItemClass =
  `${adminListItemClass} ` +
  '[&_header]:flex [&_header]:flex-wrap [&_header]:items-center [&_header]:justify-between [&_header]:gap-2 ' +
  '[&_header_h4]:text-base [&_header_h4]:font-semibold [&_header_h4]:text-base-content ' +
  '[&_header_span]:text-xs [&_header_span]:uppercase [&_header_span]:tracking-[0.14em] [&_header_span]:text-base-content/60 ' +
  '[&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.16em] [&_label]:text-base-content/65 ' +
  '[&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-primary/35 [&_select]:bg-base-100/60 [&_select]:px-3 [&_select]:py-2 [&_select]:text-sm ' +
  '[&_select]:text-base-content [&_select]:outline-none [&_select]:transition [&_select]:focus:border-primary [&_select]:focus:ring-2 [&_select]:focus:ring-primary/35';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { session, logout } = useAdminAuth();

  const [section, setSection] = useState<DashboardSection>('overview');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [stats, setStats] = useState<AdminDashboardStats>(initialStats);
  const [profile, setProfile] = useState<SiteProfile>(initialProfile);
  const [socials, setSocials] = useState<Array<Omit<SocialLink, 'id'>>>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [offers, setOffers] = useState<OfferPackage[]>([]);
  const [retainers, setRetainers] = useState<RetainerPlan[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [servicePages, setServicePages] = useState<ServiceLandingPage[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [leads, setLeads] = useState<LeadCapture[]>([]);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary>({
    totalEvents: 0,
    byEvent: [],
    topPaths: [],
  });
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);

  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);

  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState(emptyOfferForm);

  const [editingRetainerId, setEditingRetainerId] = useState<string | null>(null);
  const [retainerForm, setRetainerForm] = useState(emptyRetainerForm);

  const [editingCaseStudyId, setEditingCaseStudyId] = useState<string | null>(null);
  const [caseStudyForm, setCaseStudyForm] = useState(emptyCaseStudyForm);

  const [editingServicePageId, setEditingServicePageId] = useState<string | null>(null);
  const [servicePageForm, setServicePageForm] = useState(emptyServicePageForm);

  const [editingBlogPostId, setEditingBlogPostId] = useState<string | null>(null);
  const [blogPostForm, setBlogPostForm] = useState(emptyBlogPostForm);

  const hasSession = Boolean(session?.token);
  const token = session?.token || '';

  const sortedContacts = useMemo(() => [...contacts], [contacts]);

  useEffect(() => {
    trackEvent('admin_dashboard_view').catch(() => undefined);
  }, []);

  async function loadAllData() {
    if (!token) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [coreResult, analyticsSummaryResult, analyticsEventsResult] = await Promise.allSettled([
        Promise.all([
          api.getAdminDashboard(token),
          api.getAdminProfile(token),
          api.getAdminSocials(token),
          api.getAdminProjects(token),
          api.getAdminOffers(token),
          api.getAdminRetainers(token),
          api.getAdminCaseStudies(token),
          api.getAdminServicePages(token),
          api.getAdminBlogPosts(token),
          api.getAdminContacts(token),
          api.getAdminLeads(token),
        ]),
        api.getAdminAnalyticsSummary(token),
        api.getAdminAnalyticsEvents(token, 200),
      ]);

      if (coreResult.status !== 'fulfilled') {
        throw coreResult.reason;
      }

      const [
        nextStats,
        nextProfile,
        nextSocials,
        nextProjects,
        nextOffers,
        nextRetainers,
        nextCaseStudies,
        nextServicePages,
        nextBlogPosts,
        nextContacts,
        nextLeads,
      ] = coreResult.value;

      setStats(nextStats);
      setProfile(nextProfile);
      setSocials(
        nextSocials.map((item) => ({
          platform: item.platform,
          url: item.url,
          icon: item.icon,
          sortOrder: item.sortOrder,
        })),
      );
      setProjects(nextProjects);
      setOffers(nextOffers);
      setRetainers(nextRetainers);
      setCaseStudies(nextCaseStudies);
      setServicePages(nextServicePages);
      setBlogPosts(nextBlogPosts);
      setContacts(nextContacts);
      setLeads(nextLeads);

      if (analyticsSummaryResult.status === 'fulfilled') {
        setAnalyticsSummary(analyticsSummaryResult.value);
      } else {
        setAnalyticsSummary({
          totalEvents: 0,
          byEvent: [],
          topPaths: [],
        });
      }

      if (analyticsEventsResult.status === 'fulfilled') {
        setAnalyticsEvents(analyticsEventsResult.value);
      } else {
        setAnalyticsEvents([]);
      }
    } catch (cause) {
      console.error(cause);
      const nextError = cause instanceof Error ? cause.message : 'Failed to load admin data';
      setError(nextError);

      if (nextError.toLowerCase().includes('unauthorized')) {
        await logout();
        navigate('/admin', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    loadAllData().catch(() => undefined);
  }, [token]);

  if (!hasSession) {
    return <Navigate to="/admin" replace />;
  }

  async function handleLogout() {
    await logout();
    navigate('/admin', { replace: true });
  }

  function setSuccess(text: string) {
    setMessage(text);
    setError('');
  }

  function setFailure(cause: unknown, fallback: string) {
    console.error(cause);
    setMessage('');
    setError(cause instanceof Error ? cause.message : fallback);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const updated = await api.updateAdminProfile(token, profile);
      setProfile(updated);
      setSuccess('Profile updated.');
    } catch (cause) {
      setFailure(cause, 'Failed to update profile');
    }
  }

  function addSocialRow() {
    setSocials((prev) => [
      ...prev,
      {
        platform: '',
        url: '',
        icon: 'github',
        sortOrder: prev.length + 1,
      },
    ]);
  }

  function updateSocialRow(index: number, field: keyof Omit<SocialLink, 'id'>, value: string | number) {
    setSocials((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  }

  function deleteSocialRow(index: number) {
    setSocials((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }

  async function saveSocials() {
    try {
      const updated = await api.updateAdminSocials(token, socials);
      setSocials(
        updated.map((item) => ({
          platform: item.platform,
          url: item.url,
          icon: item.icon,
          sortOrder: item.sortOrder,
        })),
      );
      setSuccess('Social links updated.');
    } catch (cause) {
      setFailure(cause, 'Failed to update social links');
    }
  }

  function startProjectEdit(item: Project) {
    setEditingProjectId(item.id);
    setProjectForm({
      id: item.id,
      name: item.name,
      description: item.description,
      url: item.url,
      frontend: toCsv(item.frontend),
      backend: toCsv(item.backend),
      featured: item.featured,
    });
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      id: projectForm.id,
      name: projectForm.name,
      description: projectForm.description,
      url: projectForm.url,
      frontend: fromCsv(projectForm.frontend),
      backend: fromCsv(projectForm.backend),
      featured: projectForm.featured,
    };

    try {
      if (editingProjectId) {
        await api.updateAdminProject(token, editingProjectId, payload);
      } else {
        await api.createAdminProject(token, payload);
      }

      setProjects(await api.getAdminProjects(token));
      setProjectForm(emptyProjectForm);
      setEditingProjectId(null);
      setSuccess(editingProjectId ? 'Project updated.' : 'Project created.');
    } catch (cause) {
      setFailure(cause, 'Failed to save project');
    }
  }

  async function deleteProject(id: string) {
    if (!window.confirm('Delete this project?')) {
      return;
    }

    try {
      await api.deleteAdminProject(token, id);
      setProjects(await api.getAdminProjects(token));
      if (editingProjectId === id) {
        setEditingProjectId(null);
        setProjectForm(emptyProjectForm);
      }
      setSuccess('Project deleted.');
    } catch (cause) {
      setFailure(cause, 'Failed to delete project');
    }
  }

  function startOfferEdit(item: OfferPackage) {
    setEditingOfferId(item.id);
    setOfferForm({
      id: item.id,
      name: item.name,
      description: item.description,
      priceFrom: item.priceFrom,
      timeline: item.timeline,
      revisions: item.revisions,
      hosting: item.hosting,
      includes: toCsv(item.includes),
      featured: item.featured,
      sortOrder: item.sortOrder,
    });
  }

  async function saveOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      id: offerForm.id,
      name: offerForm.name,
      description: offerForm.description,
      priceFrom: offerForm.priceFrom,
      timeline: offerForm.timeline,
      revisions: offerForm.revisions,
      hosting: offerForm.hosting,
      includes: fromCsv(offerForm.includes),
      featured: offerForm.featured,
      sortOrder: Number(offerForm.sortOrder) || 0,
    };

    try {
      if (editingOfferId) {
        await api.updateAdminOffer(token, editingOfferId, payload);
      } else {
        await api.createAdminOffer(token, payload);
      }

      setOffers(await api.getAdminOffers(token));
      setOfferForm(emptyOfferForm);
      setEditingOfferId(null);
      setSuccess(editingOfferId ? 'Offer updated.' : 'Offer created.');
    } catch (cause) {
      setFailure(cause, 'Failed to save offer');
    }
  }

  async function deleteOffer(id: string) {
    if (!window.confirm('Delete this package?')) {
      return;
    }

    try {
      await api.deleteAdminOffer(token, id);
      setOffers(await api.getAdminOffers(token));
      if (editingOfferId === id) {
        setEditingOfferId(null);
        setOfferForm(emptyOfferForm);
      }
      setSuccess('Offer deleted.');
    } catch (cause) {
      setFailure(cause, 'Failed to delete offer');
    }
  }

  function startRetainerEdit(item: RetainerPlan) {
    setEditingRetainerId(item.id);
    setRetainerForm({
      id: item.id,
      name: item.name,
      hoursPerMonth: item.hoursPerMonth,
      price: item.price,
      hostingIncluded: item.hostingIncluded,
      supportSla: item.supportSla,
      includes: toCsv(item.includes),
      sortOrder: item.sortOrder,
    });
  }

  async function saveRetainer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      id: retainerForm.id,
      name: retainerForm.name,
      hoursPerMonth: Number(retainerForm.hoursPerMonth),
      price: retainerForm.price,
      hostingIncluded: retainerForm.hostingIncluded,
      supportSla: retainerForm.supportSla,
      includes: fromCsv(retainerForm.includes),
      sortOrder: Number(retainerForm.sortOrder) || 0,
    };

    try {
      if (editingRetainerId) {
        await api.updateAdminRetainer(token, editingRetainerId, payload);
      } else {
        await api.createAdminRetainer(token, payload);
      }

      setRetainers(await api.getAdminRetainers(token));
      setRetainerForm(emptyRetainerForm);
      setEditingRetainerId(null);
      setSuccess(editingRetainerId ? 'Retainer updated.' : 'Retainer created.');
    } catch (cause) {
      setFailure(cause, 'Failed to save retainer');
    }
  }

  async function deleteRetainer(id: string) {
    if (!window.confirm('Delete this retainer plan?')) {
      return;
    }

    try {
      await api.deleteAdminRetainer(token, id);
      setRetainers(await api.getAdminRetainers(token));
      if (editingRetainerId === id) {
        setEditingRetainerId(null);
        setRetainerForm(emptyRetainerForm);
      }
      setSuccess('Retainer deleted.');
    } catch (cause) {
      setFailure(cause, 'Failed to delete retainer');
    }
  }

  function startCaseStudyEdit(item: CaseStudy) {
    setEditingCaseStudyId(item.id);
    setCaseStudyForm({
      id: item.id,
      title: item.title,
      clientName: item.clientName,
      industry: item.industry,
      challenge: item.challenge,
      solution: item.solution,
      outcome: item.outcome,
      testimonialQuote: item.testimonialQuote,
      testimonialAuthor: item.testimonialAuthor,
      projectUrl: item.projectUrl,
      featured: item.featured,
    });
  }

  async function saveCaseStudy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (editingCaseStudyId) {
        await api.updateAdminCaseStudy(token, editingCaseStudyId, caseStudyForm);
      } else {
        await api.createAdminCaseStudy(token, caseStudyForm);
      }

      setCaseStudies(await api.getAdminCaseStudies(token));
      setCaseStudyForm(emptyCaseStudyForm);
      setEditingCaseStudyId(null);
      setSuccess(editingCaseStudyId ? 'Case study updated.' : 'Case study created.');
    } catch (cause) {
      setFailure(cause, 'Failed to save case study');
    }
  }

  async function deleteCaseStudy(id: string) {
    if (!window.confirm('Delete this case study?')) {
      return;
    }

    try {
      await api.deleteAdminCaseStudy(token, id);
      setCaseStudies(await api.getAdminCaseStudies(token));
      if (editingCaseStudyId === id) {
        setEditingCaseStudyId(null);
        setCaseStudyForm(emptyCaseStudyForm);
      }
      setSuccess('Case study deleted.');
    } catch (cause) {
      setFailure(cause, 'Failed to delete case study');
    }
  }

  function startServicePageEdit(item: ServiceLandingPage) {
    setEditingServicePageId(item.id);
    setServicePageForm({
      id: item.id,
      slug: item.slug,
      title: item.title,
      audience: item.audience,
      city: item.city,
      summary: item.summary,
      offer: item.offer,
      seoDescription: item.seoDescription,
      ctaLabel: item.ctaLabel,
    });
  }

  async function saveServicePage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (editingServicePageId) {
        await api.updateAdminServicePage(token, editingServicePageId, servicePageForm);
      } else {
        await api.createAdminServicePage(token, servicePageForm);
      }

      setServicePages(await api.getAdminServicePages(token));
      setServicePageForm(emptyServicePageForm);
      setEditingServicePageId(null);
      setSuccess(editingServicePageId ? 'Service page updated.' : 'Service page created.');
    } catch (cause) {
      setFailure(cause, 'Failed to save service page');
    }
  }

  async function deleteServicePage(id: string) {
    if (!window.confirm('Delete this service page?')) {
      return;
    }

    try {
      await api.deleteAdminServicePage(token, id);
      setServicePages(await api.getAdminServicePages(token));
      if (editingServicePageId === id) {
        setEditingServicePageId(null);
        setServicePageForm(emptyServicePageForm);
      }
      setSuccess('Service page deleted.');
    } catch (cause) {
      setFailure(cause, 'Failed to delete service page');
    }
  }

  function startBlogPostEdit(item: BlogPost) {
    setEditingBlogPostId(item.id);
    setBlogPostForm({
      id: item.id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      body: item.body,
      category: item.category,
      readTime: item.readTime,
      publishedAt: item.publishedAt,
    });
  }

  async function saveBlogPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (editingBlogPostId) {
        await api.updateAdminBlogPost(token, editingBlogPostId, blogPostForm);
      } else {
        await api.createAdminBlogPost(token, blogPostForm);
      }

      setBlogPosts(await api.getAdminBlogPosts(token));
      setBlogPostForm(emptyBlogPostForm);
      setEditingBlogPostId(null);
      setSuccess(editingBlogPostId ? 'Blog post updated.' : 'Blog post created.');
    } catch (cause) {
      setFailure(cause, 'Failed to save blog post');
    }
  }

  async function deleteBlogPost(id: string) {
    if (!window.confirm('Delete this blog post?')) {
      return;
    }

    try {
      await api.deleteAdminBlogPost(token, id);
      setBlogPosts(await api.getAdminBlogPosts(token));
      if (editingBlogPostId === id) {
        setEditingBlogPostId(null);
        setBlogPostForm(emptyBlogPostForm);
      }
      setSuccess('Blog post deleted.');
    } catch (cause) {
      setFailure(cause, 'Failed to delete blog post');
    }
  }

  async function updateContactStatus(id: number, status: string) {
    try {
      const updated = await api.updateAdminContactStatus(token, id, status);
      setContacts((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setSuccess(`Contact #${id} updated to ${status}.`);
    } catch (cause) {
      setFailure(cause, 'Failed to update contact status');
    }
  }

  return (
    <section className={adminPageClass}>
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">Admin Dashboard</p>
        <h2 className="text-4xl font-semibold leading-tight text-base-content md:text-6xl" style={{ fontFamily: 'Sora, sans-serif' }}>
          Content, offers, leads, and operations
        </h2>
        <p className="text-base text-base-content/75">Signed in as {session?.email}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-3xl border border-primary/25 bg-base-200/65 p-4 shadow-xl shadow-primary/15 backdrop-blur lg:sticky lg:top-24">
          <button type="button" className="btn btn-outline btn-primary btn-sm w-full rounded-2xl md:btn-md" onClick={loadAllData}>
            Refresh data
          </button>

          {sections.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`btn btn-sm mt-2 w-full justify-start rounded-2xl text-base-content md:btn-md ${
                section === item.key
                  ? 'btn-primary'
                  : 'btn-ghost border border-primary/20 bg-transparent hover:bg-base-100/70'
              }`}
              onClick={() => setSection(item.key)}
            >
              {item.label}
            </button>
          ))}

          <button
            type="button"
            className="btn btn-outline btn-error btn-sm mt-4 w-full rounded-2xl md:btn-md"
            onClick={handleLogout}
          >
            Log out
          </button>
        </aside>

        <div className="space-y-4">
          {loading ? <p className="text-sm text-base-content/70">Loading dashboard data...</p> : null}
          {message ? <p className="text-sm font-semibold text-success">{message}</p> : null}
          {error ? <p className="text-sm font-semibold text-error">{error}</p> : null}

          {section === 'overview' ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article className={adminStatCardClass}>
                <h3>Projects</h3>
                <p>{stats.totalProjects}</p>
              </article>
              <article className={adminStatCardClass}>
                <h3>Packages</h3>
                <p>{stats.totalOffers}</p>
              </article>
              <article className={adminStatCardClass}>
                <h3>Retainers</h3>
                <p>{stats.totalRetainers}</p>
              </article>
              <article className={adminStatCardClass}>
                <h3>Case studies</h3>
                <p>{stats.totalCaseStudies}</p>
              </article>
              <article className={adminStatCardClass}>
                <h3>Open contacts</h3>
                <p>{stats.openContacts}</p>
              </article>
              <article className={adminStatCardClass}>
                <h3>Leads captured</h3>
                <p>{stats.totalLeads}</p>
              </article>
            </div>
          ) : null}

          {section === 'profile' ? (
            <div className={adminSectionGridClass}>
              <form className={adminFormCardClass} onSubmit={saveProfile}>
                <h3>Site profile</h3>

                <label htmlFor="profile-name">Name</label>
                <input
                  id="profile-name"
                  value={profile.name}
                  onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
                />

                <label htmlFor="profile-gamertag">Gamertag</label>
                <input
                  id="profile-gamertag"
                  value={profile.gamertag}
                  onChange={(event) => setProfile((prev) => ({ ...prev, gamertag: event.target.value }))}
                />

                <label htmlFor="profile-title">Title</label>
                <input
                  id="profile-title"
                  value={profile.title}
                  onChange={(event) => setProfile((prev) => ({ ...prev, title: event.target.value }))}
                />

                <label htmlFor="profile-bio">Bio</label>
                <textarea
                  id="profile-bio"
                  rows={4}
                  value={profile.bio}
                  onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))}
                />

                <label htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
                />

                <label htmlFor="profile-location">Location</label>
                <input
                  id="profile-location"
                  value={profile.location}
                  onChange={(event) => setProfile((prev) => ({ ...prev, location: event.target.value }))}
                />

                <label htmlFor="profile-niche">Niche offer</label>
                <textarea
                  id="profile-niche"
                  rows={3}
                  value={profile.nicheOffer}
                  onChange={(event) => setProfile((prev) => ({ ...prev, nicheOffer: event.target.value }))}
                />

                <label htmlFor="profile-sla">Response SLA</label>
                <input
                  id="profile-sla"
                  value={profile.responseSla}
                  onChange={(event) => setProfile((prev) => ({ ...prev, responseSla: event.target.value }))}
                />

                <label htmlFor="profile-availability">Availability</label>
                <input
                  id="profile-availability"
                  value={profile.availability}
                  onChange={(event) => setProfile((prev) => ({ ...prev, availability: event.target.value }))}
                />

                <label htmlFor="profile-booking">Booking URL</label>
                <input
                  id="profile-booking"
                  value={profile.bookingUrl}
                  onChange={(event) => setProfile((prev) => ({ ...prev, bookingUrl: event.target.value }))}
                />

                <label htmlFor="profile-hourly">Hourly rate from</label>
                <input
                  id="profile-hourly"
                  value={profile.hourlyRateFrom}
                  onChange={(event) => setProfile((prev) => ({ ...prev, hourlyRateFrom: event.target.value }))}
                />

                <label htmlFor="profile-hosting">Hosting from</label>
                <input
                  id="profile-hosting"
                  value={profile.monthlyHostingFrom}
                  onChange={(event) => setProfile((prev) => ({ ...prev, monthlyHostingFrom: event.target.value }))}
                />

                <button type="submit" className="btn btn-primary btn-sm md:btn-md">
                  Save profile
                </button>
              </form>

              <div className={adminCardClass}>
                <h3>Social links</h3>

                <div className="space-y-3">
                  {socials.map((item, index) => (
                    <article key={`${item.platform}-${index}`} className={adminListItemClass}>
                      <input
                        value={item.platform}
                        onChange={(event) => updateSocialRow(index, 'platform', event.target.value)}
                        placeholder="Platform"
                      />
                      <input
                        value={item.icon}
                        onChange={(event) => updateSocialRow(index, 'icon', event.target.value)}
                        placeholder="Icon"
                      />
                      <input
                        value={item.url}
                        onChange={(event) => updateSocialRow(index, 'url', event.target.value)}
                        placeholder="URL"
                      />
                      <input
                        type="number"
                        value={item.sortOrder}
                        onChange={(event) => updateSocialRow(index, 'sortOrder', Number(event.target.value))}
                        placeholder="Sort"
                      />
                      <button type="button" className="btn btn-outline btn-error btn-sm md:btn-md" onClick={() => deleteSocialRow(index)}>
                        Remove
                      </button>
                    </article>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" className="btn btn-outline btn-primary btn-sm md:btn-md" onClick={addSocialRow}>
                    Add social row
                  </button>
                  <button type="button" className="btn btn-primary btn-sm md:btn-md" onClick={saveSocials}>
                    Save socials
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {section === 'projects' ? (
            <div className={adminSectionGridClass}>
              <form className={adminFormCardClass} onSubmit={saveProject}>
                <h3>{editingProjectId ? 'Edit project' : 'Create project'}</h3>

                <label htmlFor="project-id">ID</label>
                <input
                  id="project-id"
                  value={projectForm.id}
                  onChange={(event) => setProjectForm((prev) => ({ ...prev, id: event.target.value }))}
                  disabled={Boolean(editingProjectId)}
                />

                <label htmlFor="project-name">Name</label>
                <input
                  id="project-name"
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

                <label htmlFor="project-frontend">Frontend stack (comma separated)</label>
                <input
                  id="project-frontend"
                  value={projectForm.frontend}
                  onChange={(event) => setProjectForm((prev) => ({ ...prev, frontend: event.target.value }))}
                  required
                />

                <label htmlFor="project-backend">Backend stack (comma separated)</label>
                <input
                  id="project-backend"
                  value={projectForm.backend}
                  onChange={(event) => setProjectForm((prev) => ({ ...prev, backend: event.target.value }))}
                  required
                />

                <label className="flex items-center gap-3 rounded-xl border border-primary/20 bg-base-100/30 px-3 py-2 text-sm font-medium text-base-content">
                  <input
                    type="checkbox"
                    checked={projectForm.featured}
                    onChange={(event) => setProjectForm((prev) => ({ ...prev, featured: event.target.checked }))}
                  />
                  Featured project
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="btn btn-primary btn-sm md:btn-md">
                    {editingProjectId ? 'Update project' : 'Create project'}
                  </button>
                  {editingProjectId ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-primary btn-sm md:btn-md"
                      onClick={() => {
                        setEditingProjectId(null);
                        setProjectForm(emptyProjectForm);
                      }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>

              <div className={adminCardClass}>
                <h3>Projects</h3>
                <div className="space-y-3">
                  {projects.map((item) => (
                    <article key={item.id} className={adminListItemClass}>
                      <div>
                        <h4>{item.name}</h4>
                        <p>{item.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="btn btn-outline btn-primary btn-sm md:btn-md" onClick={() => startProjectEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-outline btn-error btn-sm md:btn-md" onClick={() => deleteProject(item.id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {section === 'offers' ? (
            <div className={adminSectionGridClass}>
              <form className={adminFormCardClass} onSubmit={saveOffer}>
                <h3>{editingOfferId ? 'Edit package' : 'Create package'}</h3>

                <label htmlFor="offer-id">ID</label>
                <input
                  id="offer-id"
                  value={offerForm.id}
                  onChange={(event) => setOfferForm((prev) => ({ ...prev, id: event.target.value }))}
                  disabled={Boolean(editingOfferId)}
                />

                <label htmlFor="offer-name">Name</label>
                <input
                  id="offer-name"
                  value={offerForm.name}
                  onChange={(event) => setOfferForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />

                <label htmlFor="offer-price">Price from</label>
                <input
                  id="offer-price"
                  value={offerForm.priceFrom}
                  onChange={(event) => setOfferForm((prev) => ({ ...prev, priceFrom: event.target.value }))}
                  required
                />

                <label htmlFor="offer-timeline">Timeline</label>
                <input
                  id="offer-timeline"
                  value={offerForm.timeline}
                  onChange={(event) => setOfferForm((prev) => ({ ...prev, timeline: event.target.value }))}
                  required
                />

                <label htmlFor="offer-revisions">Revisions</label>
                <input
                  id="offer-revisions"
                  value={offerForm.revisions}
                  onChange={(event) => setOfferForm((prev) => ({ ...prev, revisions: event.target.value }))}
                  required
                />

                <label htmlFor="offer-hosting">Hosting line</label>
                <input
                  id="offer-hosting"
                  value={offerForm.hosting}
                  onChange={(event) => setOfferForm((prev) => ({ ...prev, hosting: event.target.value }))}
                  required
                />

                <label htmlFor="offer-description">Description</label>
                <textarea
                  id="offer-description"
                  rows={3}
                  value={offerForm.description}
                  onChange={(event) => setOfferForm((prev) => ({ ...prev, description: event.target.value }))}
                  required
                />

                <label htmlFor="offer-includes">Includes (comma separated)</label>
                <input
                  id="offer-includes"
                  value={offerForm.includes}
                  onChange={(event) => setOfferForm((prev) => ({ ...prev, includes: event.target.value }))}
                  required
                />

                <label htmlFor="offer-sort">Sort order</label>
                <input
                  id="offer-sort"
                  type="number"
                  value={offerForm.sortOrder}
                  onChange={(event) => setOfferForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))}
                />

                <label className="flex items-center gap-3 rounded-xl border border-primary/20 bg-base-100/30 px-3 py-2 text-sm font-medium text-base-content">
                  <input
                    type="checkbox"
                    checked={offerForm.featured}
                    onChange={(event) => setOfferForm((prev) => ({ ...prev, featured: event.target.checked }))}
                  />
                  Featured package
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="btn btn-primary btn-sm md:btn-md">
                    {editingOfferId ? 'Update package' : 'Create package'}
                  </button>
                  {editingOfferId ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-primary btn-sm md:btn-md"
                      onClick={() => {
                        setEditingOfferId(null);
                        setOfferForm(emptyOfferForm);
                      }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>

              <div className={adminCardClass}>
                <h3>Packages</h3>
                <div className="space-y-3">
                  {offers.map((item) => (
                    <article key={item.id} className={adminListItemClass}>
                      <div>
                        <h4>{item.name}</h4>
                        <p>
                          {item.id} • {item.priceFrom}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="btn btn-outline btn-primary btn-sm md:btn-md" onClick={() => startOfferEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-outline btn-error btn-sm md:btn-md" onClick={() => deleteOffer(item.id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {section === 'retainers' ? (
            <div className={adminSectionGridClass}>
              <form className={adminFormCardClass} onSubmit={saveRetainer}>
                <h3>{editingRetainerId ? 'Edit retainer' : 'Create retainer'}</h3>

                <label htmlFor="retainer-id">ID</label>
                <input
                  id="retainer-id"
                  value={retainerForm.id}
                  onChange={(event) => setRetainerForm((prev) => ({ ...prev, id: event.target.value }))}
                  disabled={Boolean(editingRetainerId)}
                />

                <label htmlFor="retainer-name">Name</label>
                <input
                  id="retainer-name"
                  value={retainerForm.name}
                  onChange={(event) => setRetainerForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />

                <label htmlFor="retainer-hours">Hours per month</label>
                <input
                  id="retainer-hours"
                  type="number"
                  value={retainerForm.hoursPerMonth}
                  onChange={(event) =>
                    setRetainerForm((prev) => ({ ...prev, hoursPerMonth: Number(event.target.value) || 0 }))
                  }
                  required
                />

                <label htmlFor="retainer-price">Price</label>
                <input
                  id="retainer-price"
                  value={retainerForm.price}
                  onChange={(event) => setRetainerForm((prev) => ({ ...prev, price: event.target.value }))}
                  required
                />

                <label htmlFor="retainer-sla">Support SLA</label>
                <input
                  id="retainer-sla"
                  value={retainerForm.supportSla}
                  onChange={(event) => setRetainerForm((prev) => ({ ...prev, supportSla: event.target.value }))}
                  required
                />

                <label htmlFor="retainer-includes">Includes (comma separated)</label>
                <input
                  id="retainer-includes"
                  value={retainerForm.includes}
                  onChange={(event) => setRetainerForm((prev) => ({ ...prev, includes: event.target.value }))}
                  required
                />

                <label htmlFor="retainer-sort">Sort order</label>
                <input
                  id="retainer-sort"
                  type="number"
                  value={retainerForm.sortOrder}
                  onChange={(event) =>
                    setRetainerForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 0 }))
                  }
                />

                <label className="flex items-center gap-3 rounded-xl border border-primary/20 bg-base-100/30 px-3 py-2 text-sm font-medium text-base-content">
                  <input
                    type="checkbox"
                    checked={retainerForm.hostingIncluded}
                    onChange={(event) =>
                      setRetainerForm((prev) => ({ ...prev, hostingIncluded: event.target.checked }))
                    }
                  />
                  Hosting included
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="btn btn-primary btn-sm md:btn-md">
                    {editingRetainerId ? 'Update retainer' : 'Create retainer'}
                  </button>
                  {editingRetainerId ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-primary btn-sm md:btn-md"
                      onClick={() => {
                        setEditingRetainerId(null);
                        setRetainerForm(emptyRetainerForm);
                      }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>

              <div className={adminCardClass}>
                <h3>Retainer plans</h3>
                <div className="space-y-3">
                  {retainers.map((item) => (
                    <article key={item.id} className={adminListItemClass}>
                      <div>
                        <h4>{item.name}</h4>
                        <p>
                          {item.hoursPerMonth}h • {item.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="btn btn-outline btn-primary btn-sm md:btn-md" onClick={() => startRetainerEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-outline btn-error btn-sm md:btn-md" onClick={() => deleteRetainer(item.id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {section === 'caseStudies' ? (
            <div className={adminSectionGridClass}>
              <form className={adminFormCardClass} onSubmit={saveCaseStudy}>
                <h3>{editingCaseStudyId ? 'Edit case study' : 'Create case study'}</h3>

                <label htmlFor="case-id">ID</label>
                <input
                  id="case-id"
                  value={caseStudyForm.id}
                  onChange={(event) => setCaseStudyForm((prev) => ({ ...prev, id: event.target.value }))}
                  disabled={Boolean(editingCaseStudyId)}
                />

                <label htmlFor="case-title">Title</label>
                <input
                  id="case-title"
                  value={caseStudyForm.title}
                  onChange={(event) => setCaseStudyForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />

                <label htmlFor="case-client">Client</label>
                <input
                  id="case-client"
                  value={caseStudyForm.clientName}
                  onChange={(event) => setCaseStudyForm((prev) => ({ ...prev, clientName: event.target.value }))}
                  required
                />

                <label htmlFor="case-industry">Industry</label>
                <input
                  id="case-industry"
                  value={caseStudyForm.industry}
                  onChange={(event) => setCaseStudyForm((prev) => ({ ...prev, industry: event.target.value }))}
                  required
                />

                <label htmlFor="case-url">Project URL</label>
                <input
                  id="case-url"
                  type="url"
                  value={caseStudyForm.projectUrl}
                  onChange={(event) => setCaseStudyForm((prev) => ({ ...prev, projectUrl: event.target.value }))}
                  required
                />

                <label htmlFor="case-challenge">Challenge</label>
                <textarea
                  id="case-challenge"
                  rows={3}
                  value={caseStudyForm.challenge}
                  onChange={(event) => setCaseStudyForm((prev) => ({ ...prev, challenge: event.target.value }))}
                  required
                />

                <label htmlFor="case-solution">Solution</label>
                <textarea
                  id="case-solution"
                  rows={3}
                  value={caseStudyForm.solution}
                  onChange={(event) => setCaseStudyForm((prev) => ({ ...prev, solution: event.target.value }))}
                  required
                />

                <label htmlFor="case-outcome">Outcome</label>
                <textarea
                  id="case-outcome"
                  rows={2}
                  value={caseStudyForm.outcome}
                  onChange={(event) => setCaseStudyForm((prev) => ({ ...prev, outcome: event.target.value }))}
                  required
                />

                <label htmlFor="case-quote">Testimonial quote</label>
                <textarea
                  id="case-quote"
                  rows={2}
                  value={caseStudyForm.testimonialQuote}
                  onChange={(event) => setCaseStudyForm((prev) => ({ ...prev, testimonialQuote: event.target.value }))}
                  required
                />

                <label htmlFor="case-author">Testimonial author</label>
                <input
                  id="case-author"
                  value={caseStudyForm.testimonialAuthor}
                  onChange={(event) => setCaseStudyForm((prev) => ({ ...prev, testimonialAuthor: event.target.value }))}
                  required
                />

                <label className="flex items-center gap-3 rounded-xl border border-primary/20 bg-base-100/30 px-3 py-2 text-sm font-medium text-base-content">
                  <input
                    type="checkbox"
                    checked={caseStudyForm.featured}
                    onChange={(event) => setCaseStudyForm((prev) => ({ ...prev, featured: event.target.checked }))}
                  />
                  Featured case study
                </label>

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="btn btn-primary btn-sm md:btn-md">
                    {editingCaseStudyId ? 'Update case study' : 'Create case study'}
                  </button>
                  {editingCaseStudyId ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-primary btn-sm md:btn-md"
                      onClick={() => {
                        setEditingCaseStudyId(null);
                        setCaseStudyForm(emptyCaseStudyForm);
                      }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>

              <div className={adminCardClass}>
                <h3>Case studies</h3>
                <div className="space-y-3">
                  {caseStudies.map((item) => (
                    <article key={item.id} className={adminListItemClass}>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.clientName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="btn btn-outline btn-primary btn-sm md:btn-md" onClick={() => startCaseStudyEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-outline btn-error btn-sm md:btn-md" onClick={() => deleteCaseStudy(item.id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {section === 'servicePages' ? (
            <div className={adminSectionGridClass}>
              <form className={adminFormCardClass} onSubmit={saveServicePage}>
                <h3>{editingServicePageId ? 'Edit service page' : 'Create service page'}</h3>

                <label htmlFor="service-id">ID</label>
                <input
                  id="service-id"
                  value={servicePageForm.id}
                  onChange={(event) => setServicePageForm((prev) => ({ ...prev, id: event.target.value }))}
                  disabled={Boolean(editingServicePageId)}
                />

                <label htmlFor="service-slug">Slug</label>
                <input
                  id="service-slug"
                  value={servicePageForm.slug}
                  onChange={(event) => setServicePageForm((prev) => ({ ...prev, slug: event.target.value }))}
                  required
                />

                <label htmlFor="service-title">Title</label>
                <input
                  id="service-title"
                  value={servicePageForm.title}
                  onChange={(event) => setServicePageForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />

                <label htmlFor="service-audience">Audience</label>
                <input
                  id="service-audience"
                  value={servicePageForm.audience}
                  onChange={(event) => setServicePageForm((prev) => ({ ...prev, audience: event.target.value }))}
                  required
                />

                <label htmlFor="service-city">City/Market</label>
                <input
                  id="service-city"
                  value={servicePageForm.city}
                  onChange={(event) => setServicePageForm((prev) => ({ ...prev, city: event.target.value }))}
                  required
                />

                <label htmlFor="service-summary">Summary</label>
                <textarea
                  id="service-summary"
                  rows={3}
                  value={servicePageForm.summary}
                  onChange={(event) => setServicePageForm((prev) => ({ ...prev, summary: event.target.value }))}
                  required
                />

                <label htmlFor="service-offer">Offer text</label>
                <textarea
                  id="service-offer"
                  rows={3}
                  value={servicePageForm.offer}
                  onChange={(event) => setServicePageForm((prev) => ({ ...prev, offer: event.target.value }))}
                  required
                />

                <label htmlFor="service-seo">SEO description</label>
                <textarea
                  id="service-seo"
                  rows={2}
                  value={servicePageForm.seoDescription}
                  onChange={(event) => setServicePageForm((prev) => ({ ...prev, seoDescription: event.target.value }))}
                  required
                />

                <label htmlFor="service-cta">CTA label</label>
                <input
                  id="service-cta"
                  value={servicePageForm.ctaLabel}
                  onChange={(event) => setServicePageForm((prev) => ({ ...prev, ctaLabel: event.target.value }))}
                  required
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="btn btn-primary btn-sm md:btn-md">
                    {editingServicePageId ? 'Update service page' : 'Create service page'}
                  </button>
                  {editingServicePageId ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-primary btn-sm md:btn-md"
                      onClick={() => {
                        setEditingServicePageId(null);
                        setServicePageForm(emptyServicePageForm);
                      }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>

              <div className={adminCardClass}>
                <h3>Service pages</h3>
                <div className="space-y-3">
                  {servicePages.map((item) => (
                    <article key={item.id} className={adminListItemClass}>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="btn btn-outline btn-primary btn-sm md:btn-md" onClick={() => startServicePageEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-outline btn-error btn-sm md:btn-md" onClick={() => deleteServicePage(item.id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {section === 'blogPosts' ? (
            <div className={adminSectionGridClass}>
              <form className={adminFormCardClass} onSubmit={saveBlogPost}>
                <h3>{editingBlogPostId ? 'Edit blog post' : 'Create blog post'}</h3>

                <label htmlFor="blog-id">ID</label>
                <input
                  id="blog-id"
                  value={blogPostForm.id}
                  onChange={(event) => setBlogPostForm((prev) => ({ ...prev, id: event.target.value }))}
                  disabled={Boolean(editingBlogPostId)}
                />

                <label htmlFor="blog-slug">Slug</label>
                <input
                  id="blog-slug"
                  value={blogPostForm.slug}
                  onChange={(event) => setBlogPostForm((prev) => ({ ...prev, slug: event.target.value }))}
                  required
                />

                <label htmlFor="blog-title">Title</label>
                <input
                  id="blog-title"
                  value={blogPostForm.title}
                  onChange={(event) => setBlogPostForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />

                <label htmlFor="blog-category">Category</label>
                <input
                  id="blog-category"
                  value={blogPostForm.category}
                  onChange={(event) => setBlogPostForm((prev) => ({ ...prev, category: event.target.value }))}
                  required
                />

                <label htmlFor="blog-read">Read time</label>
                <input
                  id="blog-read"
                  value={blogPostForm.readTime}
                  onChange={(event) => setBlogPostForm((prev) => ({ ...prev, readTime: event.target.value }))}
                  required
                />

                <label htmlFor="blog-published">Published at (ISO)</label>
                <input
                  id="blog-published"
                  value={blogPostForm.publishedAt}
                  onChange={(event) => setBlogPostForm((prev) => ({ ...prev, publishedAt: event.target.value }))}
                  placeholder="2026-02-16T10:00:00.000Z"
                />

                <label htmlFor="blog-excerpt">Excerpt</label>
                <textarea
                  id="blog-excerpt"
                  rows={3}
                  value={blogPostForm.excerpt}
                  onChange={(event) => setBlogPostForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                  required
                />

                <label htmlFor="blog-body">Body</label>
                <textarea
                  id="blog-body"
                  rows={6}
                  value={blogPostForm.body}
                  onChange={(event) => setBlogPostForm((prev) => ({ ...prev, body: event.target.value }))}
                  required
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="btn btn-primary btn-sm md:btn-md">
                    {editingBlogPostId ? 'Update blog post' : 'Create blog post'}
                  </button>
                  {editingBlogPostId ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-primary btn-sm md:btn-md"
                      onClick={() => {
                        setEditingBlogPostId(null);
                        setBlogPostForm(emptyBlogPostForm);
                      }}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>

              <div className={adminCardClass}>
                <h3>Blog posts</h3>
                <div className="space-y-3">
                  {blogPosts.map((item) => (
                    <article key={item.id} className={adminListItemClass}>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="btn btn-outline btn-primary btn-sm md:btn-md" onClick={() => startBlogPostEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-outline btn-error btn-sm md:btn-md" onClick={() => deleteBlogPost(item.id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {section === 'inbox' ? (
            <div className={adminCardClass}>
              <h3>Contact inbox</h3>
              <div className="space-y-3">
                {sortedContacts.length === 0 ? <p className="text-sm text-base-content/65">No contact requests yet.</p> : null}
                {sortedContacts.map((item) => (
                  <article key={item.id} className={adminContactItemClass}>
                    <header>
                      <h4>{item.subject}</h4>
                      <span>{formatDate(item.createdAt)}</span>
                    </header>
                    <p className="text-sm text-base-content/70">
                      <strong>{item.name}</strong> • {item.email}
                    </p>
                    <p>{item.message}</p>
                    <p className="text-sm text-base-content/70">
                      Budget: {item.budgetRange || 'n/a'} • Timeline: {item.timeline || 'n/a'} • Type:{' '}
                      {item.projectType || 'n/a'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <label htmlFor={`status-${item.id}`}>Status</label>
                      <select
                        id={`status-${item.id}`}
                        value={item.status}
                        onChange={(event) => {
                          updateContactStatus(item.id, event.target.value).catch(() => undefined);
                        }}
                      >
                        {contactStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {section === 'leads' ? (
            <div className={adminCardClass}>
              <h3>Lead magnet signups</h3>
              <div className="space-y-3">
                {leads.length === 0 ? <p className="text-sm text-base-content/65">No lead captures yet.</p> : null}
                {leads.map((lead) => (
                  <article key={lead.id} className={adminContactItemClass}>
                    <header>
                      <h4>{lead.email}</h4>
                      <span>{formatDate(lead.createdAt)}</span>
                    </header>
                    <p className="text-sm text-base-content/70">
                      {lead.name || 'No name'} • {lead.company || 'No company'}
                    </p>
                    <p>{lead.website || 'No website supplied'}</p>
                    <p>{lead.useCase || 'No use-case notes supplied'}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {section === 'analytics' ? (
            <div className={adminSectionGridClass}>
              <div className={adminCardClass}>
                <h3>Analytics summary</h3>
                <p>Total tracked events: {analyticsSummary.totalEvents}</p>

                <h4>Top events</h4>
                <ul>
                  {analyticsSummary.byEvent.map((item) => (
                    <li key={item.eventName}>
                      {item.eventName}: {item.count}
                    </li>
                  ))}
                </ul>

                <h4>Top paths</h4>
                <ul>
                  {analyticsSummary.topPaths.map((item) => (
                    <li key={item.path}>
                      {item.path}: {item.count}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={adminCardClass}>
                <h3>Recent events</h3>
                <div className="space-y-3">
                  {analyticsEvents.slice(0, 60).map((item) => (
                    <article key={item.id} className={adminListItemClass}>
                      <div>
                        <h4>{item.eventName}</h4>
                        <p>
                          {item.path} • {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
