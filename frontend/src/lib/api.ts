import type {
  AdminDashboardStats,
  AdminLoginResponse,
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
  SiteBundle,
  SiteProfile,
  SocialLink,
} from '../types/models';

const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');

async function parseError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response, `Request failed: ${path}`));
  }

  return (await response.json()) as T;
}

function adminHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const api = {
  getSiteBundle() {
    return request<SiteBundle>('/site');
  },

  sendContact(payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
    budgetRange: string;
    timeline: string;
    projectType: string;
    source: string;
  }) {
    return request<{ success: boolean; requestId: number; message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  captureLead(payload: { email: string; name: string; company: string; website: string; useCase: string }) {
    return request<{ success: boolean; leadId: number }>('/leads', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  trackEvent(payload: { eventName: string; path: string; metadata?: Record<string, unknown> }) {
    return request<{ success: boolean }>('/analytics/event', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  unlockStaging(password: string) {
    return request<{ success: boolean }>('/auth/staging-unlock', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  login(email: string, password: string) {
    return request<AdminLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout(token: string) {
    return request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      headers: adminHeaders(token),
    });
  },

  getAdminDashboard(token: string) {
    return request<AdminDashboardStats>('/admin/dashboard', {
      headers: adminHeaders(token),
    });
  },

  getAdminProfile(token: string) {
    return request<SiteProfile>('/admin/profile', {
      headers: adminHeaders(token),
    });
  },

  updateAdminProfile(token: string, payload: Partial<SiteProfile>) {
    return request<SiteProfile>('/admin/profile', {
      method: 'PUT',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  getAdminSocials(token: string) {
    return request<SocialLink[]>('/admin/socials', {
      headers: adminHeaders(token),
    });
  },

  updateAdminSocials(token: string, items: Array<Omit<SocialLink, 'id'>>) {
    return request<SocialLink[]>('/admin/socials', {
      method: 'PUT',
      headers: adminHeaders(token),
      body: JSON.stringify({ items }),
    });
  },

  getAdminProjects(token: string) {
    return request<Project[]>('/admin/projects', {
      headers: adminHeaders(token),
    });
  },

  createAdminProject(token: string, payload: Partial<Project>) {
    return request<Project>('/admin/projects', {
      method: 'POST',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  updateAdminProject(token: string, id: string, payload: Partial<Project>) {
    return request<Project>(`/admin/projects/${id}`, {
      method: 'PUT',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  deleteAdminProject(token: string, id: string) {
    return request<{ success: boolean }>(`/admin/projects/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(token),
    });
  },

  getAdminOffers(token: string) {
    return request<OfferPackage[]>('/admin/offers', {
      headers: adminHeaders(token),
    });
  },

  createAdminOffer(token: string, payload: Partial<OfferPackage>) {
    return request<OfferPackage>('/admin/offers', {
      method: 'POST',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  updateAdminOffer(token: string, id: string, payload: Partial<OfferPackage>) {
    return request<OfferPackage>(`/admin/offers/${id}`, {
      method: 'PUT',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  deleteAdminOffer(token: string, id: string) {
    return request<{ success: boolean }>(`/admin/offers/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(token),
    });
  },

  getAdminRetainers(token: string) {
    return request<RetainerPlan[]>('/admin/retainers', {
      headers: adminHeaders(token),
    });
  },

  createAdminRetainer(token: string, payload: Partial<RetainerPlan>) {
    return request<RetainerPlan>('/admin/retainers', {
      method: 'POST',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  updateAdminRetainer(token: string, id: string, payload: Partial<RetainerPlan>) {
    return request<RetainerPlan>(`/admin/retainers/${id}`, {
      method: 'PUT',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  deleteAdminRetainer(token: string, id: string) {
    return request<{ success: boolean }>(`/admin/retainers/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(token),
    });
  },

  getAdminCaseStudies(token: string) {
    return request<CaseStudy[]>('/admin/case-studies', {
      headers: adminHeaders(token),
    });
  },

  createAdminCaseStudy(token: string, payload: Partial<CaseStudy>) {
    return request<CaseStudy>('/admin/case-studies', {
      method: 'POST',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  updateAdminCaseStudy(token: string, id: string, payload: Partial<CaseStudy>) {
    return request<CaseStudy>(`/admin/case-studies/${id}`, {
      method: 'PUT',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  deleteAdminCaseStudy(token: string, id: string) {
    return request<{ success: boolean }>(`/admin/case-studies/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(token),
    });
  },

  getAdminServicePages(token: string) {
    return request<ServiceLandingPage[]>('/admin/service-pages', {
      headers: adminHeaders(token),
    });
  },

  createAdminServicePage(token: string, payload: Partial<ServiceLandingPage>) {
    return request<ServiceLandingPage>('/admin/service-pages', {
      method: 'POST',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  updateAdminServicePage(token: string, id: string, payload: Partial<ServiceLandingPage>) {
    return request<ServiceLandingPage>(`/admin/service-pages/${id}`, {
      method: 'PUT',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  deleteAdminServicePage(token: string, id: string) {
    return request<{ success: boolean }>(`/admin/service-pages/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(token),
    });
  },

  getAdminBlogPosts(token: string) {
    return request<BlogPost[]>('/admin/blog-posts', {
      headers: adminHeaders(token),
    });
  },

  createAdminBlogPost(token: string, payload: Partial<BlogPost>) {
    return request<BlogPost>('/admin/blog-posts', {
      method: 'POST',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  updateAdminBlogPost(token: string, id: string, payload: Partial<BlogPost>) {
    return request<BlogPost>(`/admin/blog-posts/${id}`, {
      method: 'PUT',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  deleteAdminBlogPost(token: string, id: string) {
    return request<{ success: boolean }>(`/admin/blog-posts/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(token),
    });
  },

  getAdminContacts(token: string) {
    return request<ContactRequest[]>('/admin/contacts', {
      headers: adminHeaders(token),
    });
  },

  updateAdminContactStatus(token: string, id: number, status: string) {
    return request<ContactRequest>(`/admin/contacts/${id}/status`, {
      method: 'PUT',
      headers: adminHeaders(token),
      body: JSON.stringify({ status }),
    });
  },

  getAdminLeads(token: string) {
    return request<LeadCapture[]>('/admin/leads', {
      headers: adminHeaders(token),
    });
  },

  getAdminAnalyticsEvents(token: string, limit = 200) {
    return request<AnalyticsEvent[]>(`/admin/analytics/events?limit=${encodeURIComponent(String(limit))}`, {
      headers: adminHeaders(token),
    });
  },

  getAdminAnalyticsSummary(token: string) {
    return request<AnalyticsSummary>('/admin/analytics/summary', {
      headers: adminHeaders(token),
    });
  },
};
