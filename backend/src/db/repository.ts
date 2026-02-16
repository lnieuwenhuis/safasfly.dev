import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { AppEnv } from '../config/env.js';
import { createDatabase } from './database.js';
import {
  AdminSession,
  AdminUser,
  AnalyticsEvent,
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
} from '../types/models.js';
import {
  seedBlogPosts,
  seedCaseStudies,
  seedOffers,
  seedProfile,
  seedProjects,
  seedRetainers,
  seedServicePages,
  seedSocials,
} from './seed.js';
import { ContactFormPayload, LeadCapturePayload } from '../types/payloads.js';

interface ProjectRow {
  id: string;
  name: string;
  description: string;
  url: string;
  frontend: string;
  backend: string;
  featured: number;
  created_at: string;
  updated_at: string;
}

interface SocialRow {
  id: number;
  platform: string;
  url: string;
  icon: string;
  sort_order: number;
}

interface ProfileRow {
  name: string;
  gamertag: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  niche_offer: string;
  response_sla: string;
  availability: string;
  booking_url: string;
  hourly_rate_from: string;
  monthly_hosting_from: string;
  updated_at: string;
}

interface OfferRow {
  id: string;
  name: string;
  description: string;
  price_from: string;
  timeline: string;
  revisions: string;
  hosting: string;
  includes: string;
  featured: number;
  sort_order: number;
  updated_at: string;
}

interface RetainerRow {
  id: string;
  name: string;
  hours_per_month: number;
  price: string;
  hosting_included: number;
  support_sla: string;
  includes: string;
  sort_order: number;
  updated_at: string;
}

interface CaseStudyRow {
  id: string;
  title: string;
  client_name: string;
  industry: string;
  challenge: string;
  solution: string;
  outcome: string;
  testimonial_quote: string;
  testimonial_author: string;
  project_url: string;
  featured: number;
  updated_at: string;
}

interface ServicePageRow {
  id: string;
  slug: string;
  title: string;
  audience: string;
  city: string;
  summary: string;
  offer: string;
  seo_description: string;
  cta_label: string;
  updated_at: string;
}

interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  read_time: string;
  published_at: string;
  updated_at: string;
}

interface ContactRequestRow {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  budget_range: string;
  timeline: string;
  project_type: string;
  source: string;
  status: string;
  created_at: string;
}

interface LeadCaptureRow {
  id: number;
  email: string;
  name: string;
  company: string;
  website: string;
  use_case: string;
  created_at: string;
}

interface AnalyticsEventRow {
  id: number;
  event_name: string;
  path: string;
  metadata: string;
  created_at: string;
}

interface AdminRow {
  id: number;
  email: string;
  password_hash: string;
}

interface AdminSessionJoinRow {
  id: number;
  email: string;
}

interface AdminPasswordHashRow {
  password_hash: string;
}

interface CountRow {
  count: number;
}

interface TableInfoRow {
  name: string;
}

interface AnalyticsSummary {
  totalEvents: number;
  byEvent: Array<{ eventName: string; count: number }>;
  topPaths: Array<{ path: string; count: number }>;
}

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return '{}';
  }
}

function createPasswordHash(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }

  const actualHash = scryptSync(password, salt, 64);
  const expectedHash = Buffer.from(hash, 'hex');
  if (actualHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(actualHash, expectedHash);
}

function nowIso(): string {
  return new Date().toISOString();
}

function mapProfile(row: ProfileRow): SiteProfile {
  return {
    name: row.name,
    gamertag: row.gamertag,
    title: row.title,
    bio: row.bio,
    location: row.location,
    email: row.email,
    nicheOffer: row.niche_offer,
    responseSla: row.response_sla,
    availability: row.availability,
    bookingUrl: row.booking_url,
    hourlyRateFrom: row.hourly_rate_from,
    monthlyHostingFrom: row.monthly_hosting_from,
    updatedAt: row.updated_at,
  };
}

function mapSocial(row: SocialRow): SocialLink {
  return {
    id: row.id,
    platform: row.platform,
    url: row.url,
    icon: row.icon,
    sortOrder: row.sort_order,
  };
}

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    url: row.url,
    frontend: parseJsonArray(row.frontend),
    backend: parseJsonArray(row.backend),
    featured: row.featured === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOffer(row: OfferRow): OfferPackage {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceFrom: row.price_from,
    timeline: row.timeline,
    revisions: row.revisions,
    hosting: row.hosting,
    includes: parseJsonArray(row.includes),
    featured: row.featured === 1,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}

function mapRetainer(row: RetainerRow): RetainerPlan {
  return {
    id: row.id,
    name: row.name,
    hoursPerMonth: row.hours_per_month,
    price: row.price,
    hostingIncluded: row.hosting_included === 1,
    supportSla: row.support_sla,
    includes: parseJsonArray(row.includes),
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}

function mapCaseStudy(row: CaseStudyRow): CaseStudy {
  return {
    id: row.id,
    title: row.title,
    clientName: row.client_name,
    industry: row.industry,
    challenge: row.challenge,
    solution: row.solution,
    outcome: row.outcome,
    testimonialQuote: row.testimonial_quote,
    testimonialAuthor: row.testimonial_author,
    projectUrl: row.project_url,
    featured: row.featured === 1,
    updatedAt: row.updated_at,
  };
}

function mapServicePage(row: ServicePageRow): ServiceLandingPage {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    audience: row.audience,
    city: row.city,
    summary: row.summary,
    offer: row.offer,
    seoDescription: row.seo_description,
    ctaLabel: row.cta_label,
    updatedAt: row.updated_at,
  };
}

function mapBlogPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    category: row.category,
    readTime: row.read_time,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

function mapContact(row: ContactRequestRow): ContactRequest {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    budgetRange: row.budget_range,
    timeline: row.timeline,
    projectType: row.project_type,
    source: row.source,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapLead(row: LeadCaptureRow): LeadCapture {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    company: row.company,
    website: row.website,
    useCase: row.use_case,
    createdAt: row.created_at,
  };
}

function mapAnalytics(row: AnalyticsEventRow): AnalyticsEvent {
  return {
    id: row.id,
    eventName: row.event_name,
    path: row.path,
    metadata: (() => {
      try {
        const parsed = JSON.parse(row.metadata) as unknown;
        if (parsed && typeof parsed === 'object') {
          return parsed as Record<string, unknown>;
        }
      } catch {
        // ignore malformed metadata
      }

      return {};
    })(),
    createdAt: row.created_at,
  };
}

function ensureColumns(db: DatabaseSync, table: string, definitions: string[]) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as unknown as TableInfoRow[];
  const existing = new Set(rows.map((row) => row.name));

  for (const definition of definitions) {
    const [columnName] = definition.split(' ');
    if (!existing.has(columnName)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
    }
  }
}

export interface Repository {
  getSiteBundle(): SiteBundle;
  getProfile(): SiteProfile;
  updateProfile(input: Omit<SiteProfile, 'updatedAt'>): SiteProfile;
  listSocials(): SocialLink[];
  replaceSocials(input: Array<Omit<SocialLink, 'id'>>): SocialLink[];

  listProjects(): Project[];
  getProjectById(id: string): Project | null;
  createProject(input: Omit<Project, 'createdAt' | 'updatedAt'>): Project;
  updateProject(id: string, input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project | null;
  deleteProject(id: string): boolean;

  listOffers(): OfferPackage[];
  createOffer(input: Omit<OfferPackage, 'updatedAt'>): OfferPackage;
  updateOffer(id: string, input: Omit<OfferPackage, 'id' | 'updatedAt'>): OfferPackage | null;
  deleteOffer(id: string): boolean;

  listRetainers(): RetainerPlan[];
  createRetainer(input: Omit<RetainerPlan, 'updatedAt'>): RetainerPlan;
  updateRetainer(id: string, input: Omit<RetainerPlan, 'id' | 'updatedAt'>): RetainerPlan | null;
  deleteRetainer(id: string): boolean;

  listCaseStudies(): CaseStudy[];
  createCaseStudy(input: Omit<CaseStudy, 'updatedAt'>): CaseStudy;
  updateCaseStudy(id: string, input: Omit<CaseStudy, 'id' | 'updatedAt'>): CaseStudy | null;
  deleteCaseStudy(id: string): boolean;

  listServicePages(): ServiceLandingPage[];
  createServicePage(input: Omit<ServiceLandingPage, 'updatedAt'>): ServiceLandingPage;
  updateServicePage(id: string, input: Omit<ServiceLandingPage, 'id' | 'updatedAt'>): ServiceLandingPage | null;
  deleteServicePage(id: string): boolean;

  listBlogPosts(): BlogPost[];
  createBlogPost(input: Omit<BlogPost, 'updatedAt'>): BlogPost;
  updateBlogPost(id: string, input: Omit<BlogPost, 'id' | 'updatedAt'>): BlogPost | null;
  deleteBlogPost(id: string): boolean;

  createContactRequest(input: ContactFormPayload): ContactRequest;
  listContactRequests(): ContactRequest[];
  updateContactStatus(id: number, status: string): ContactRequest | null;

  createLeadCapture(input: LeadCapturePayload): LeadCapture;
  listLeadCaptures(): LeadCapture[];

  createAnalyticsEvent(eventName: string, path: string, metadata: Record<string, unknown>): void;
  listAnalyticsEvents(limit: number): AnalyticsEvent[];
  getAnalyticsSummary(): AnalyticsSummary;

  verifyAdminPassword(password: string): boolean;
  loginAdmin(email: string, password: string): AdminSession | null;
  getAdminBySessionToken(token: string): AdminUser | null;
  revokeAdminSession(token: string): void;

  getAdminDashboard(): {
    totalProjects: number;
    totalOffers: number;
    totalRetainers: number;
    totalCaseStudies: number;
    openContacts: number;
    totalLeads: number;
  };
}

export function createRepository(env: AppEnv): Repository {
  const db = createDatabase(env.dbPath);

  db.exec(`
  CREATE TABLE IF NOT EXISTS site_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    gamertag TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT NOT NULL,
    location TEXT NOT NULL,
    email TEXT NOT NULL,
    niche_offer TEXT NOT NULL,
    response_sla TEXT NOT NULL,
    availability TEXT NOT NULL,
    booking_url TEXT NOT NULL,
    hourly_rate_from TEXT NOT NULL,
    monthly_hosting_from TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    frontend TEXT NOT NULL,
    backend TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_from TEXT NOT NULL,
    timeline TEXT NOT NULL,
    revisions TEXT NOT NULL,
    hosting TEXT NOT NULL,
    includes TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS retainer_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hours_per_month INTEGER NOT NULL,
    price TEXT NOT NULL,
    hosting_included INTEGER NOT NULL DEFAULT 1,
    support_sla TEXT NOT NULL,
    includes TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS case_studies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    client_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    challenge TEXT NOT NULL,
    solution TEXT NOT NULL,
    outcome TEXT NOT NULL,
    testimonial_quote TEXT NOT NULL,
    testimonial_author TEXT NOT NULL,
    project_url TEXT NOT NULL,
    featured INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS service_pages (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    audience TEXT NOT NULL,
    city TEXT NOT NULL,
    summary TEXT NOT NULL,
    offer TEXT NOT NULL,
    seo_description TEXT NOT NULL,
    cta_label TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL,
    read_time TEXT NOT NULL,
    published_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    budget_range TEXT NOT NULL DEFAULT '',
    timeline TEXT NOT NULL DEFAULT '',
    project_type TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lead_captures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    company TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    use_case TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    path TEXT NOT NULL,
    metadata TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
  CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
  CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at);
  CREATE INDEX IF NOT EXISTS idx_lead_captures_created_at ON lead_captures(created_at);
  CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
  CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
  `);

  ensureColumns(db, 'contact_requests', [
    "budget_range TEXT NOT NULL DEFAULT ''",
    "timeline TEXT NOT NULL DEFAULT ''",
    "project_type TEXT NOT NULL DEFAULT ''",
    "source TEXT NOT NULL DEFAULT ''",
    "status TEXT NOT NULL DEFAULT 'new'",
  ]);

  db.exec('CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status)');

  const profileCount = db.prepare('SELECT COUNT(*) AS count FROM site_profile').get() as unknown as CountRow;
  if (profileCount.count === 0) {
    const now = nowIso();
    db.prepare(`
      INSERT INTO site_profile (
        id, name, gamertag, title, bio, location, email,
        niche_offer, response_sla, availability, booking_url,
        hourly_rate_from, monthly_hosting_from, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      seedProfile.name,
      seedProfile.gamertag,
      seedProfile.title,
      seedProfile.bio,
      seedProfile.location,
      seedProfile.email,
      seedProfile.nicheOffer,
      seedProfile.responseSla,
      seedProfile.availability,
      seedProfile.bookingUrl,
      seedProfile.hourlyRateFrom,
      seedProfile.monthlyHostingFrom,
      now,
    );
  }

  const socialsCount = db.prepare('SELECT COUNT(*) AS count FROM social_links').get() as unknown as CountRow;
  if (socialsCount.count === 0) {
    const insertSocial = db.prepare('INSERT INTO social_links (platform, url, icon, sort_order) VALUES (?, ?, ?, ?)');
    for (const social of seedSocials) {
      insertSocial.run(social.platform, social.url, social.icon, social.sortOrder);
    }
  }

  const projectsCount = db.prepare('SELECT COUNT(*) AS count FROM projects').get() as unknown as CountRow;
  if (projectsCount.count === 0) {
    const insertProject = db.prepare(`
      INSERT INTO projects (id, name, description, url, frontend, backend, featured, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const project of seedProjects) {
      const now = nowIso();
      insertProject.run(
        project.id,
        project.name,
        project.description,
        project.url,
        JSON.stringify(project.frontend),
        JSON.stringify(project.backend),
        project.featured ? 1 : 0,
        now,
        now,
      );
    }
  }

  const offersCount = db.prepare('SELECT COUNT(*) AS count FROM offers').get() as unknown as CountRow;
  if (offersCount.count === 0) {
    const insertOffer = db.prepare(`
      INSERT INTO offers (id, name, description, price_from, timeline, revisions, hosting, includes, featured, sort_order, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const offer of seedOffers) {
      insertOffer.run(
        offer.id,
        offer.name,
        offer.description,
        offer.priceFrom,
        offer.timeline,
        offer.revisions,
        offer.hosting,
        JSON.stringify(offer.includes),
        offer.featured ? 1 : 0,
        offer.sortOrder,
        nowIso(),
      );
    }
  }

  const retainersCount = db.prepare('SELECT COUNT(*) AS count FROM retainer_plans').get() as unknown as CountRow;
  if (retainersCount.count === 0) {
    const insertRetainer = db.prepare(`
      INSERT INTO retainer_plans (id, name, hours_per_month, price, hosting_included, support_sla, includes, sort_order, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const retainer of seedRetainers) {
      insertRetainer.run(
        retainer.id,
        retainer.name,
        retainer.hoursPerMonth,
        retainer.price,
        retainer.hostingIncluded ? 1 : 0,
        retainer.supportSla,
        JSON.stringify(retainer.includes),
        retainer.sortOrder,
        nowIso(),
      );
    }
  }

  const caseStudiesCount = db.prepare('SELECT COUNT(*) AS count FROM case_studies').get() as unknown as CountRow;
  if (caseStudiesCount.count === 0) {
    const insertCaseStudy = db.prepare(`
      INSERT INTO case_studies (
        id, title, client_name, industry, challenge, solution, outcome,
        testimonial_quote, testimonial_author, project_url, featured, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const entry of seedCaseStudies) {
      insertCaseStudy.run(
        entry.id,
        entry.title,
        entry.clientName,
        entry.industry,
        entry.challenge,
        entry.solution,
        entry.outcome,
        entry.testimonialQuote,
        entry.testimonialAuthor,
        entry.projectUrl,
        entry.featured ? 1 : 0,
        nowIso(),
      );
    }
  }

  const servicePagesCount = db.prepare('SELECT COUNT(*) AS count FROM service_pages').get() as unknown as CountRow;
  if (servicePagesCount.count === 0) {
    const insertServicePage = db.prepare(`
      INSERT INTO service_pages (
        id, slug, title, audience, city, summary, offer,
        seo_description, cta_label, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const entry of seedServicePages) {
      insertServicePage.run(
        entry.id,
        entry.slug,
        entry.title,
        entry.audience,
        entry.city,
        entry.summary,
        entry.offer,
        entry.seoDescription,
        entry.ctaLabel,
        nowIso(),
      );
    }
  }

  const blogPostsCount = db.prepare('SELECT COUNT(*) AS count FROM blog_posts').get() as unknown as CountRow;
  if (blogPostsCount.count === 0) {
    const insertBlogPost = db.prepare(`
      INSERT INTO blog_posts (
        id, slug, title, excerpt, body, category, read_time, published_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const entry of seedBlogPosts) {
      insertBlogPost.run(
        entry.id,
        entry.slug,
        entry.title,
        entry.excerpt,
        entry.body,
        entry.category,
        entry.readTime,
        entry.publishedAt,
        nowIso(),
      );
    }
  }

  if (env.seedAdminEmail && env.seedAdminPassword) {
    const adminByEmailStmt = db.prepare('SELECT id, email, password_hash FROM admins WHERE email = ?');
    const existing = adminByEmailStmt.get(env.seedAdminEmail) as AdminRow | undefined;
    const hash = createPasswordHash(env.seedAdminPassword);

    if (existing) {
      db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(hash, existing.id);
    } else {
      db.prepare('INSERT INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)').run(
        env.seedAdminEmail,
        hash,
        nowIso(),
      );
    }
  }

  const getProfileStmt = db.prepare('SELECT * FROM site_profile WHERE id = 1');
  const updateProfileStmt = db.prepare(`
    UPDATE site_profile
    SET
      name = ?, gamertag = ?, title = ?, bio = ?, location = ?, email = ?,
      niche_offer = ?, response_sla = ?, availability = ?, booking_url = ?,
      hourly_rate_from = ?, monthly_hosting_from = ?, updated_at = ?
    WHERE id = 1
  `);

  const listSocialsStmt = db.prepare('SELECT * FROM social_links ORDER BY sort_order ASC, id ASC');
  const deleteAllSocialsStmt = db.prepare('DELETE FROM social_links');
  const insertSocialStmt = db.prepare('INSERT INTO social_links (platform, url, icon, sort_order) VALUES (?, ?, ?, ?)');

  const listProjectsStmt = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC, created_at DESC');
  const projectByIdStmt = db.prepare('SELECT * FROM projects WHERE id = ?');
  const insertProjectStmt = db.prepare(`
    INSERT INTO projects (id, name, description, url, frontend, backend, featured, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateProjectStmt = db.prepare(`
    UPDATE projects
    SET name = ?, description = ?, url = ?, frontend = ?, backend = ?, featured = ?, updated_at = ?
    WHERE id = ?
  `);
  const deleteProjectStmt = db.prepare('DELETE FROM projects WHERE id = ?');

  const listOffersStmt = db.prepare('SELECT * FROM offers ORDER BY sort_order ASC, updated_at DESC');
  const offerByIdStmt = db.prepare('SELECT * FROM offers WHERE id = ?');
  const insertOfferStmt = db.prepare(`
    INSERT INTO offers (id, name, description, price_from, timeline, revisions, hosting, includes, featured, sort_order, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateOfferStmt = db.prepare(`
    UPDATE offers
    SET name = ?, description = ?, price_from = ?, timeline = ?, revisions = ?, hosting = ?, includes = ?, featured = ?, sort_order = ?, updated_at = ?
    WHERE id = ?
  `);
  const deleteOfferStmt = db.prepare('DELETE FROM offers WHERE id = ?');

  const listRetainersStmt = db.prepare('SELECT * FROM retainer_plans ORDER BY sort_order ASC, updated_at DESC');
  const retainerByIdStmt = db.prepare('SELECT * FROM retainer_plans WHERE id = ?');
  const insertRetainerStmt = db.prepare(`
    INSERT INTO retainer_plans (id, name, hours_per_month, price, hosting_included, support_sla, includes, sort_order, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateRetainerStmt = db.prepare(`
    UPDATE retainer_plans
    SET name = ?, hours_per_month = ?, price = ?, hosting_included = ?, support_sla = ?, includes = ?, sort_order = ?, updated_at = ?
    WHERE id = ?
  `);
  const deleteRetainerStmt = db.prepare('DELETE FROM retainer_plans WHERE id = ?');

  const listCaseStudiesStmt = db.prepare('SELECT * FROM case_studies ORDER BY featured DESC, updated_at DESC');
  const caseStudyByIdStmt = db.prepare('SELECT * FROM case_studies WHERE id = ?');
  const insertCaseStudyStmt = db.prepare(`
    INSERT INTO case_studies (
      id, title, client_name, industry, challenge, solution, outcome,
      testimonial_quote, testimonial_author, project_url, featured, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateCaseStudyStmt = db.prepare(`
    UPDATE case_studies
    SET title = ?, client_name = ?, industry = ?, challenge = ?, solution = ?, outcome = ?, testimonial_quote = ?, testimonial_author = ?, project_url = ?, featured = ?, updated_at = ?
    WHERE id = ?
  `);
  const deleteCaseStudyStmt = db.prepare('DELETE FROM case_studies WHERE id = ?');

  const listServicePagesStmt = db.prepare('SELECT * FROM service_pages ORDER BY updated_at DESC');
  const servicePageByIdStmt = db.prepare('SELECT * FROM service_pages WHERE id = ?');
  const insertServicePageStmt = db.prepare(`
    INSERT INTO service_pages (
      id, slug, title, audience, city, summary, offer, seo_description, cta_label, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateServicePageStmt = db.prepare(`
    UPDATE service_pages
    SET slug = ?, title = ?, audience = ?, city = ?, summary = ?, offer = ?, seo_description = ?, cta_label = ?, updated_at = ?
    WHERE id = ?
  `);
  const deleteServicePageStmt = db.prepare('DELETE FROM service_pages WHERE id = ?');

  const listBlogPostsStmt = db.prepare('SELECT * FROM blog_posts ORDER BY published_at DESC, updated_at DESC');
  const blogPostByIdStmt = db.prepare('SELECT * FROM blog_posts WHERE id = ?');
  const insertBlogPostStmt = db.prepare(`
    INSERT INTO blog_posts (
      id, slug, title, excerpt, body, category, read_time, published_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateBlogPostStmt = db.prepare(`
    UPDATE blog_posts
    SET slug = ?, title = ?, excerpt = ?, body = ?, category = ?, read_time = ?, published_at = ?, updated_at = ?
    WHERE id = ?
  `);
  const deleteBlogPostStmt = db.prepare('DELETE FROM blog_posts WHERE id = ?');

  const insertContactStmt = db.prepare(`
    INSERT INTO contact_requests (
      name, email, subject, message, budget_range, timeline, project_type, source, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const contactByIdStmt = db.prepare('SELECT * FROM contact_requests WHERE id = ?');
  const listContactsStmt = db.prepare('SELECT * FROM contact_requests ORDER BY created_at DESC');
  const updateContactStatusStmt = db.prepare('UPDATE contact_requests SET status = ? WHERE id = ?');

  const insertLeadStmt = db.prepare(`
    INSERT INTO lead_captures (email, name, company, website, use_case, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const leadByIdStmt = db.prepare('SELECT * FROM lead_captures WHERE id = ?');
  const listLeadsStmt = db.prepare('SELECT * FROM lead_captures ORDER BY created_at DESC');

  const insertAnalyticsStmt = db.prepare(
    'INSERT INTO analytics_events (event_name, path, metadata, created_at) VALUES (?, ?, ?, ?)',
  );
  const listAnalyticsStmt = db.prepare('SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT ?');

  const eventsSummaryStmt = db.prepare('SELECT COUNT(*) AS count FROM analytics_events');
  const eventsByNameStmt = db.prepare(
    'SELECT event_name AS eventName, COUNT(*) AS count FROM analytics_events GROUP BY event_name ORDER BY count DESC LIMIT 10',
  );
  const topPathsStmt = db.prepare(
    'SELECT path, COUNT(*) AS count FROM analytics_events GROUP BY path ORDER BY count DESC LIMIT 10',
  );

  const listAdminPasswordHashesStmt = db.prepare('SELECT password_hash FROM admins');
  const adminByEmailStmt = db.prepare('SELECT id, email, password_hash FROM admins WHERE email = ?');
  const deleteExpiredSessionsStmt = db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?');
  const insertAdminSessionStmt = db.prepare(
    'INSERT INTO admin_sessions (admin_id, token, created_at, expires_at) VALUES (?, ?, ?, ?)',
  );
  const adminByTokenStmt = db.prepare(`
    SELECT admins.id AS id, admins.email AS email
    FROM admin_sessions
    INNER JOIN admins ON admins.id = admin_sessions.admin_id
    WHERE admin_sessions.token = ? AND admin_sessions.expires_at > ?
  `);
  const deleteSessionByTokenStmt = db.prepare('DELETE FROM admin_sessions WHERE token = ?');

  function getSessionExpiryIso() {
    return new Date(Date.now() + env.adminSessionTtlDays * 24 * 60 * 60 * 1000).toISOString();
  }

  function removeExpiredSessions() {
    deleteExpiredSessionsStmt.run(nowIso());
  }

  function getProfile(): SiteProfile {
    const row = getProfileStmt.get() as ProfileRow | undefined;
    if (!row) {
      throw new Error('Site profile not found');
    }

    return mapProfile(row);
  }

  function listSocials(): SocialLink[] {
    const rows = listSocialsStmt.all() as unknown as SocialRow[];
    return rows.map(mapSocial);
  }

  return {
    getSiteBundle(): SiteBundle {
      return {
        profile: getProfile(),
        socials: listSocials(),
        projects: (listProjectsStmt.all() as unknown as ProjectRow[]).map(mapProject),
        offers: (listOffersStmt.all() as unknown as OfferRow[]).map(mapOffer),
        retainers: (listRetainersStmt.all() as unknown as RetainerRow[]).map(mapRetainer),
        caseStudies: (listCaseStudiesStmt.all() as unknown as CaseStudyRow[]).map(mapCaseStudy),
        servicePages: (listServicePagesStmt.all() as unknown as ServicePageRow[]).map(mapServicePage),
        blogPosts: (listBlogPostsStmt.all() as unknown as BlogPostRow[]).map(mapBlogPost),
      };
    },

    getProfile,

    updateProfile(input): SiteProfile {
      updateProfileStmt.run(
        input.name,
        input.gamertag,
        input.title,
        input.bio,
        input.location,
        input.email,
        input.nicheOffer,
        input.responseSla,
        input.availability,
        input.bookingUrl,
        input.hourlyRateFrom,
        input.monthlyHostingFrom,
        nowIso(),
      );

      return getProfile();
    },

    listSocials,

    replaceSocials(input): SocialLink[] {
      db.exec('BEGIN');
      try {
        deleteAllSocialsStmt.run();
        input.forEach((item, index) => {
          insertSocialStmt.run(item.platform, item.url, item.icon, item.sortOrder || index + 1);
        });
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      return listSocials();
    },

    listProjects(): Project[] {
      const rows = listProjectsStmt.all() as unknown as ProjectRow[];
      return rows.map(mapProject);
    },

    getProjectById(id: string): Project | null {
      const row = projectByIdStmt.get(id) as ProjectRow | undefined;
      return row ? mapProject(row) : null;
    },

    createProject(input): Project {
      const now = nowIso();
      insertProjectStmt.run(
        input.id,
        input.name,
        input.description,
        input.url,
        JSON.stringify(input.frontend),
        JSON.stringify(input.backend),
        input.featured ? 1 : 0,
        now,
        now,
      );

      const row = projectByIdStmt.get(input.id) as ProjectRow | undefined;
      if (!row) {
        throw new Error('Project was not created');
      }

      return mapProject(row);
    },

    updateProject(id, input): Project | null {
      const result = updateProjectStmt.run(
        input.name,
        input.description,
        input.url,
        JSON.stringify(input.frontend),
        JSON.stringify(input.backend),
        input.featured ? 1 : 0,
        nowIso(),
        id,
      );

      if (result.changes === 0) {
        return null;
      }

      const row = projectByIdStmt.get(id) as ProjectRow | undefined;
      return row ? mapProject(row) : null;
    },

    deleteProject(id: string): boolean {
      return deleteProjectStmt.run(id).changes > 0;
    },

    listOffers(): OfferPackage[] {
      return (listOffersStmt.all() as unknown as OfferRow[]).map(mapOffer);
    },

    createOffer(input): OfferPackage {
      insertOfferStmt.run(
        input.id,
        input.name,
        input.description,
        input.priceFrom,
        input.timeline,
        input.revisions,
        input.hosting,
        JSON.stringify(input.includes),
        input.featured ? 1 : 0,
        input.sortOrder,
        nowIso(),
      );

      const row = offerByIdStmt.get(input.id) as OfferRow | undefined;
      if (!row) {
        throw new Error('Offer was not created');
      }

      return mapOffer(row);
    },

    updateOffer(id, input): OfferPackage | null {
      const result = updateOfferStmt.run(
        input.name,
        input.description,
        input.priceFrom,
        input.timeline,
        input.revisions,
        input.hosting,
        JSON.stringify(input.includes),
        input.featured ? 1 : 0,
        input.sortOrder,
        nowIso(),
        id,
      );

      if (result.changes === 0) {
        return null;
      }

      const row = offerByIdStmt.get(id) as OfferRow | undefined;
      return row ? mapOffer(row) : null;
    },

    deleteOffer(id: string): boolean {
      return deleteOfferStmt.run(id).changes > 0;
    },

    listRetainers(): RetainerPlan[] {
      return (listRetainersStmt.all() as unknown as RetainerRow[]).map(mapRetainer);
    },

    createRetainer(input): RetainerPlan {
      insertRetainerStmt.run(
        input.id,
        input.name,
        input.hoursPerMonth,
        input.price,
        input.hostingIncluded ? 1 : 0,
        input.supportSla,
        JSON.stringify(input.includes),
        input.sortOrder,
        nowIso(),
      );

      const row = retainerByIdStmt.get(input.id) as RetainerRow | undefined;
      if (!row) {
        throw new Error('Retainer was not created');
      }

      return mapRetainer(row);
    },

    updateRetainer(id, input): RetainerPlan | null {
      const result = updateRetainerStmt.run(
        input.name,
        input.hoursPerMonth,
        input.price,
        input.hostingIncluded ? 1 : 0,
        input.supportSla,
        JSON.stringify(input.includes),
        input.sortOrder,
        nowIso(),
        id,
      );

      if (result.changes === 0) {
        return null;
      }

      const row = retainerByIdStmt.get(id) as RetainerRow | undefined;
      return row ? mapRetainer(row) : null;
    },

    deleteRetainer(id: string): boolean {
      return deleteRetainerStmt.run(id).changes > 0;
    },

    listCaseStudies(): CaseStudy[] {
      return (listCaseStudiesStmt.all() as unknown as CaseStudyRow[]).map(mapCaseStudy);
    },

    createCaseStudy(input): CaseStudy {
      insertCaseStudyStmt.run(
        input.id,
        input.title,
        input.clientName,
        input.industry,
        input.challenge,
        input.solution,
        input.outcome,
        input.testimonialQuote,
        input.testimonialAuthor,
        input.projectUrl,
        input.featured ? 1 : 0,
        nowIso(),
      );

      const row = caseStudyByIdStmt.get(input.id) as CaseStudyRow | undefined;
      if (!row) {
        throw new Error('Case study was not created');
      }

      return mapCaseStudy(row);
    },

    updateCaseStudy(id, input): CaseStudy | null {
      const result = updateCaseStudyStmt.run(
        input.title,
        input.clientName,
        input.industry,
        input.challenge,
        input.solution,
        input.outcome,
        input.testimonialQuote,
        input.testimonialAuthor,
        input.projectUrl,
        input.featured ? 1 : 0,
        nowIso(),
        id,
      );

      if (result.changes === 0) {
        return null;
      }

      const row = caseStudyByIdStmt.get(id) as CaseStudyRow | undefined;
      return row ? mapCaseStudy(row) : null;
    },

    deleteCaseStudy(id: string): boolean {
      return deleteCaseStudyStmt.run(id).changes > 0;
    },

    listServicePages(): ServiceLandingPage[] {
      return (listServicePagesStmt.all() as unknown as ServicePageRow[]).map(mapServicePage);
    },

    createServicePage(input): ServiceLandingPage {
      insertServicePageStmt.run(
        input.id,
        input.slug,
        input.title,
        input.audience,
        input.city,
        input.summary,
        input.offer,
        input.seoDescription,
        input.ctaLabel,
        nowIso(),
      );

      const row = servicePageByIdStmt.get(input.id) as ServicePageRow | undefined;
      if (!row) {
        throw new Error('Service page was not created');
      }

      return mapServicePage(row);
    },

    updateServicePage(id, input): ServiceLandingPage | null {
      const result = updateServicePageStmt.run(
        input.slug,
        input.title,
        input.audience,
        input.city,
        input.summary,
        input.offer,
        input.seoDescription,
        input.ctaLabel,
        nowIso(),
        id,
      );

      if (result.changes === 0) {
        return null;
      }

      const row = servicePageByIdStmt.get(id) as ServicePageRow | undefined;
      return row ? mapServicePage(row) : null;
    },

    deleteServicePage(id: string): boolean {
      return deleteServicePageStmt.run(id).changes > 0;
    },

    listBlogPosts(): BlogPost[] {
      return (listBlogPostsStmt.all() as unknown as BlogPostRow[]).map(mapBlogPost);
    },

    createBlogPost(input): BlogPost {
      insertBlogPostStmt.run(
        input.id,
        input.slug,
        input.title,
        input.excerpt,
        input.body,
        input.category,
        input.readTime,
        input.publishedAt,
        nowIso(),
      );

      const row = blogPostByIdStmt.get(input.id) as BlogPostRow | undefined;
      if (!row) {
        throw new Error('Blog post was not created');
      }

      return mapBlogPost(row);
    },

    updateBlogPost(id, input): BlogPost | null {
      const result = updateBlogPostStmt.run(
        input.slug,
        input.title,
        input.excerpt,
        input.body,
        input.category,
        input.readTime,
        input.publishedAt,
        nowIso(),
        id,
      );

      if (result.changes === 0) {
        return null;
      }

      const row = blogPostByIdStmt.get(id) as BlogPostRow | undefined;
      return row ? mapBlogPost(row) : null;
    },

    deleteBlogPost(id: string): boolean {
      return deleteBlogPostStmt.run(id).changes > 0;
    },

    createContactRequest(input): ContactRequest {
      const status = 'new';
      const now = nowIso();
      const result = insertContactStmt.run(
        input.name,
        input.email,
        input.subject,
        input.message,
        input.budgetRange,
        input.timeline,
        input.projectType,
        input.source,
        status,
        now,
      );

      const row = contactByIdStmt.get(Number(result.lastInsertRowid)) as ContactRequestRow | undefined;
      if (!row) {
        throw new Error('Contact request was not created');
      }

      return mapContact(row);
    },

    listContactRequests(): ContactRequest[] {
      return (listContactsStmt.all() as unknown as ContactRequestRow[]).map(mapContact);
    },

    updateContactStatus(id, status): ContactRequest | null {
      const result = updateContactStatusStmt.run(status, id);
      if (result.changes === 0) {
        return null;
      }

      const row = contactByIdStmt.get(id) as ContactRequestRow | undefined;
      return row ? mapContact(row) : null;
    },

    createLeadCapture(input): LeadCapture {
      const result = insertLeadStmt.run(input.email, input.name, input.company, input.website, input.useCase, nowIso());
      const row = leadByIdStmt.get(Number(result.lastInsertRowid)) as LeadCaptureRow | undefined;
      if (!row) {
        throw new Error('Lead capture was not created');
      }

      return mapLead(row);
    },

    listLeadCaptures(): LeadCapture[] {
      return (listLeadsStmt.all() as unknown as LeadCaptureRow[]).map(mapLead);
    },

    createAnalyticsEvent(eventName, path, metadata): void {
      insertAnalyticsStmt.run(eventName, path, safeJson(metadata), nowIso());
    },

    listAnalyticsEvents(limit): AnalyticsEvent[] {
      const safeLimit = Math.max(1, Math.min(1000, limit));
      return (listAnalyticsStmt.all(safeLimit) as unknown as AnalyticsEventRow[]).map(mapAnalytics);
    },

    getAnalyticsSummary(): AnalyticsSummary {
      const total = eventsSummaryStmt.get() as unknown as CountRow | undefined;
      const byEvent = eventsByNameStmt.all() as unknown as Array<{ eventName: string; count: number }>;
      const topPaths = topPathsStmt.all() as unknown as Array<{ path: string; count: number }>;

      return {
        totalEvents: total?.count || 0,
        byEvent,
        topPaths,
      };
    },

    verifyAdminPassword(password: string): boolean {
      if (!password) {
        return false;
      }

      const rows = listAdminPasswordHashesStmt.all() as unknown as AdminPasswordHashRow[];
      for (const row of rows) {
        if (verifyPassword(password, row.password_hash)) {
          return true;
        }
      }

      return false;
    },

    loginAdmin(email, password): AdminSession | null {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) {
        return null;
      }

      const admin = adminByEmailStmt.get(normalizedEmail) as AdminRow | undefined;
      if (!admin || !verifyPassword(password, admin.password_hash)) {
        return null;
      }

      removeExpiredSessions();

      const token = randomBytes(32).toString('hex');
      const createdAt = nowIso();
      const expiresAt = getSessionExpiryIso();
      insertAdminSessionStmt.run(admin.id, token, createdAt, expiresAt);

      return {
        token,
        user: {
          id: admin.id,
          email: admin.email,
        },
        expiresAt,
      };
    },

    getAdminBySessionToken(token: string): AdminUser | null {
      if (!token) {
        return null;
      }

      removeExpiredSessions();
      const row = adminByTokenStmt.get(token, nowIso()) as AdminSessionJoinRow | undefined;
      if (!row) {
        return null;
      }

      return {
        id: row.id,
        email: row.email,
      };
    },

    revokeAdminSession(token: string): void {
      if (!token) {
        return;
      }

      deleteSessionByTokenStmt.run(token);
    },

    getAdminDashboard() {
      const totalProjects =
        (db.prepare('SELECT COUNT(*) AS count FROM projects').get() as unknown as CountRow | undefined)?.count || 0;
      const totalOffers =
        (db.prepare('SELECT COUNT(*) AS count FROM offers').get() as unknown as CountRow | undefined)?.count || 0;
      const totalRetainers =
        (db.prepare('SELECT COUNT(*) AS count FROM retainer_plans').get() as unknown as CountRow | undefined)?.count ||
        0;
      const totalCaseStudies =
        (db.prepare('SELECT COUNT(*) AS count FROM case_studies').get() as unknown as CountRow | undefined)?.count ||
        0;
      const openContacts =
        (db
          .prepare("SELECT COUNT(*) AS count FROM contact_requests WHERE status != 'archived'")
          .get() as unknown as CountRow | undefined)
          ?.count || 0;
      const totalLeads =
        (db.prepare('SELECT COUNT(*) AS count FROM lead_captures').get() as unknown as CountRow | undefined)?.count ||
        0;

      return {
        totalProjects,
        totalOffers,
        totalRetainers,
        totalCaseStudies,
        openContacts,
        totalLeads,
      };
    },
  };
}
