export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  frontend: string[];
  backend: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteProfile {
  name: string;
  gamertag: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  nicheOffer: string;
  responseSla: string;
  availability: string;
  bookingUrl: string;
  hourlyRateFrom: string;
  monthlyHostingFrom: string;
  updatedAt: string;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
  sortOrder: number;
}

export interface OfferPackage {
  id: string;
  name: string;
  description: string;
  priceFrom: string;
  timeline: string;
  revisions: string;
  hosting: string;
  includes: string[];
  featured: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface RetainerPlan {
  id: string;
  name: string;
  hoursPerMonth: number;
  price: string;
  hostingIncluded: boolean;
  supportSla: string;
  includes: string[];
  sortOrder: number;
  updatedAt: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  clientName: string;
  industry: string;
  challenge: string;
  solution: string;
  outcome: string;
  testimonialQuote: string;
  testimonialAuthor: string;
  projectUrl: string;
  featured: boolean;
  updatedAt: string;
}

export interface ServiceLandingPage {
  id: string;
  slug: string;
  title: string;
  audience: string;
  city: string;
  summary: string;
  offer: string;
  seoDescription: string;
  ctaLabel: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  readTime: string;
  publishedAt: string;
  updatedAt: string;
}

export interface ContactRequest {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  budgetRange: string;
  timeline: string;
  projectType: string;
  source: string;
  status: string;
  createdAt: string;
}

export interface LeadCapture {
  id: number;
  email: string;
  name: string;
  company: string;
  website: string;
  useCase: string;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: number;
  eventName: string;
  path: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  email: string;
}

export interface AdminSession {
  token: string;
  user: AdminUser;
  expiresAt: string;
}

export interface SiteBundle {
  profile: SiteProfile;
  socials: SocialLink[];
  projects: Project[];
  offers: OfferPackage[];
  retainers: RetainerPlan[];
  caseStudies: CaseStudy[];
  servicePages: ServiceLandingPage[];
  blogPosts: BlogPost[];
}
