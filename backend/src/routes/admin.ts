import { Hono } from 'hono';
import { Repository } from '../db/repository.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  BlogPost,
  CaseStudy,
  OfferPackage,
  Project,
  RetainerPlan,
  ServiceLandingPage,
  SiteProfile,
  SocialLink,
} from '../types/models.js';
import {
  isValidEmail,
  isValidHttpUrl,
  parseBoolean,
  parseInteger,
  parseStringArray,
  sanitizeString,
  toSlug,
} from '../utils/strings.js';

function parseProjectPayload(body: Record<string, unknown>): Omit<Project, 'createdAt' | 'updatedAt'> | null {
  const id = toSlug(sanitizeString(body.id, 120) || sanitizeString(body.name, 120), 60);
  const name = sanitizeString(body.name, 120);
  const description = sanitizeString(body.description, 2000);
  const url = sanitizeString(body.url, 512);
  const frontend = parseStringArray(body.frontend, 30);
  const backend = parseStringArray(body.backend, 30);
  const featured = parseBoolean(body.featured, false);

  if (!id || !name || !description || !url || !isValidHttpUrl(url) || frontend.length === 0 || backend.length === 0) {
    return null;
  }

  return {
    id,
    name,
    description,
    url,
    frontend,
    backend,
    featured,
  };
}

function parseOfferPayload(body: Record<string, unknown>): Omit<OfferPackage, 'updatedAt'> | null {
  const id = toSlug(sanitizeString(body.id, 120) || sanitizeString(body.name, 120), 60);
  const name = sanitizeString(body.name, 120);
  const description = sanitizeString(body.description, 1200);
  const priceFrom = sanitizeString(body.priceFrom, 120);
  const timeline = sanitizeString(body.timeline, 120);
  const revisions = sanitizeString(body.revisions, 120);
  const hosting = sanitizeString(body.hosting, 220);
  const includes = parseStringArray(body.includes, 40);
  const featured = parseBoolean(body.featured, false);
  const sortOrder = parseInteger(body.sortOrder, 0);

  if (!id || !name || !description || !priceFrom || !timeline || !revisions || !hosting || includes.length === 0) {
    return null;
  }

  return {
    id,
    name,
    description,
    priceFrom,
    timeline,
    revisions,
    hosting,
    includes,
    featured,
    sortOrder,
  };
}

function parseRetainerPayload(body: Record<string, unknown>): Omit<RetainerPlan, 'updatedAt'> | null {
  const id = toSlug(sanitizeString(body.id, 120) || sanitizeString(body.name, 120), 60);
  const name = sanitizeString(body.name, 120);
  const hoursPerMonth = Math.max(1, parseInteger(body.hoursPerMonth, 0));
  const price = sanitizeString(body.price, 120);
  const hostingIncluded = parseBoolean(body.hostingIncluded, true);
  const supportSla = sanitizeString(body.supportSla, 160);
  const includes = parseStringArray(body.includes, 40);
  const sortOrder = parseInteger(body.sortOrder, 0);

  if (!id || !name || !price || !supportSla || includes.length === 0) {
    return null;
  }

  return {
    id,
    name,
    hoursPerMonth,
    price,
    hostingIncluded,
    supportSla,
    includes,
    sortOrder,
  };
}

function parseCaseStudyPayload(body: Record<string, unknown>): Omit<CaseStudy, 'updatedAt'> | null {
  const id = toSlug(sanitizeString(body.id, 120) || sanitizeString(body.title, 120), 60);
  const title = sanitizeString(body.title, 180);
  const clientName = sanitizeString(body.clientName, 180);
  const industry = sanitizeString(body.industry, 120);
  const challenge = sanitizeString(body.challenge, 2400);
  const solution = sanitizeString(body.solution, 2400);
  const outcome = sanitizeString(body.outcome, 1200);
  const testimonialQuote = sanitizeString(body.testimonialQuote, 1200);
  const testimonialAuthor = sanitizeString(body.testimonialAuthor, 180);
  const projectUrl = sanitizeString(body.projectUrl, 512);
  const featured = parseBoolean(body.featured, false);

  if (
    !id ||
    !title ||
    !clientName ||
    !industry ||
    !challenge ||
    !solution ||
    !outcome ||
    !testimonialQuote ||
    !testimonialAuthor ||
    !projectUrl ||
    !isValidHttpUrl(projectUrl)
  ) {
    return null;
  }

  return {
    id,
    title,
    clientName,
    industry,
    challenge,
    solution,
    outcome,
    testimonialQuote,
    testimonialAuthor,
    projectUrl,
    featured,
  };
}

function parseServicePagePayload(body: Record<string, unknown>): Omit<ServiceLandingPage, 'updatedAt'> | null {
  const id = toSlug(sanitizeString(body.id, 120) || sanitizeString(body.title, 120), 60);
  const slug = toSlug(sanitizeString(body.slug, 140) || sanitizeString(body.title, 140), 120);
  const title = sanitizeString(body.title, 180);
  const audience = sanitizeString(body.audience, 120);
  const city = sanitizeString(body.city, 120);
  const summary = sanitizeString(body.summary, 1200);
  const offer = sanitizeString(body.offer, 1200);
  const seoDescription = sanitizeString(body.seoDescription, 280);
  const ctaLabel = sanitizeString(body.ctaLabel, 80);

  if (!id || !slug || !title || !audience || !city || !summary || !offer || !seoDescription || !ctaLabel) {
    return null;
  }

  return {
    id,
    slug,
    title,
    audience,
    city,
    summary,
    offer,
    seoDescription,
    ctaLabel,
  };
}

function parseBlogPostPayload(body: Record<string, unknown>): Omit<BlogPost, 'updatedAt'> | null {
  const id = toSlug(sanitizeString(body.id, 120) || sanitizeString(body.title, 120), 60);
  const slug = toSlug(sanitizeString(body.slug, 140) || sanitizeString(body.title, 140), 120);
  const title = sanitizeString(body.title, 180);
  const excerpt = sanitizeString(body.excerpt, 320);
  const bodyText = sanitizeString(body.body, 12000);
  const category = sanitizeString(body.category, 80);
  const readTime = sanitizeString(body.readTime, 80);
  const publishedAt = sanitizeString(body.publishedAt, 80);

  if (!id || !slug || !title || !excerpt || !bodyText || !category || !readTime) {
    return null;
  }

  const normalizedPublishedAt = publishedAt ? publishedAt : new Date().toISOString();

  return {
    id,
    slug,
    title,
    excerpt,
    body: bodyText,
    category,
    readTime,
    publishedAt: normalizedPublishedAt,
  };
}

function parseProfilePayload(body: Record<string, unknown>, current: SiteProfile): Omit<SiteProfile, 'updatedAt'> | null {
  const payload: Omit<SiteProfile, 'updatedAt'> = {
    name: sanitizeString(body.name, 120) || current.name,
    gamertag: sanitizeString(body.gamertag, 120) || current.gamertag,
    title: sanitizeString(body.title, 180) || current.title,
    bio: sanitizeString(body.bio, 3000) || current.bio,
    location: sanitizeString(body.location, 120) || current.location,
    email: sanitizeString(body.email, 254).toLowerCase() || current.email,
    nicheOffer: sanitizeString(body.nicheOffer, 500) || current.nicheOffer,
    responseSla: sanitizeString(body.responseSla, 180) || current.responseSla,
    availability: sanitizeString(body.availability, 220) || current.availability,
    bookingUrl: sanitizeString(body.bookingUrl, 512) || current.bookingUrl,
    hourlyRateFrom: sanitizeString(body.hourlyRateFrom, 120) || current.hourlyRateFrom,
    monthlyHostingFrom: sanitizeString(body.monthlyHostingFrom, 120) || current.monthlyHostingFrom,
  };

  if (!isValidEmail(payload.email)) {
    return null;
  }

  if (!isValidHttpUrl(payload.bookingUrl)) {
    return null;
  }

  return payload;
}

function parseSocialsPayload(value: unknown): Array<Omit<SocialLink, 'id'>> | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const socials = value
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return null;
      }

      const item = entry as Record<string, unknown>;
      const platform = sanitizeString(item.platform, 120);
      const url = sanitizeString(item.url, 512);
      const icon = sanitizeString(item.icon, 60);
      const sortOrder = parseInteger(item.sortOrder, index + 1);

      if (!platform || !url || !icon || !isValidHttpUrl(url)) {
        return null;
      }

      return { platform, url, icon, sortOrder };
    })
    .filter((entry): entry is Omit<SocialLink, 'id'> => Boolean(entry));

  if (socials.length === 0) {
    return null;
  }

  return socials;
}

const validContactStatuses = new Set(['new', 'in_review', 'quoted', 'closed', 'archived']);

export function createAdminRoutes(repository: Repository) {
  const app = new Hono();
  app.use('*', requireAdmin(repository));

  app.get('/dashboard', (c) => {
    return c.json(repository.getAdminDashboard());
  });

  app.get('/profile', (c) => {
    return c.json(repository.getProfile());
  });

  app.put('/profile', async (c) => {
    try {
      const body = (await c.req.json()) as Record<string, unknown>;
      const current = repository.getProfile();
      const payload = parseProfilePayload(body, current);
      if (!payload) {
        return c.json({ error: 'Invalid profile payload' }, 400);
      }

      return c.json(repository.updateProfile(payload));
    } catch (error) {
      console.error('Failed to update profile', error);
      return c.json({ error: 'Failed to update profile' }, 500);
    }
  });

  app.get('/socials', (c) => {
    return c.json(repository.listSocials());
  });

  app.put('/socials', async (c) => {
    try {
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseSocialsPayload(body.items);
      if (!payload) {
        return c.json({ error: 'Invalid socials payload' }, 400);
      }

      return c.json(repository.replaceSocials(payload));
    } catch (error) {
      console.error('Failed to update socials', error);
      return c.json({ error: 'Failed to update socials' }, 500);
    }
  });

  app.get('/projects', (c) => {
    return c.json(repository.listProjects());
  });

  app.post('/projects', async (c) => {
    try {
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseProjectPayload(body);
      if (!payload) {
        return c.json({ error: 'Invalid project payload' }, 400);
      }

      if (repository.getProjectById(payload.id)) {
        return c.json({ error: 'Project id already exists' }, 409);
      }

      return c.json(repository.createProject(payload), 201);
    } catch (error) {
      console.error('Failed to create project', error);
      return c.json({ error: 'Failed to create project' }, 500);
    }
  });

  app.put('/projects/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseProjectPayload({ ...body, id });
      if (!payload) {
        return c.json({ error: 'Invalid project payload' }, 400);
      }

      const updated = repository.updateProject(id, {
        name: payload.name,
        description: payload.description,
        url: payload.url,
        frontend: payload.frontend,
        backend: payload.backend,
        featured: payload.featured,
      });

      if (!updated) {
        return c.json({ error: 'Project not found' }, 404);
      }

      return c.json(updated);
    } catch (error) {
      console.error('Failed to update project', error);
      return c.json({ error: 'Failed to update project' }, 500);
    }
  });

  app.delete('/projects/:id', (c) => {
    const { id } = c.req.param();
    const deleted = repository.deleteProject(id);
    if (!deleted) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json({ success: true });
  });

  app.get('/offers', (c) => {
    return c.json(repository.listOffers());
  });

  app.post('/offers', async (c) => {
    try {
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseOfferPayload(body);
      if (!payload) {
        return c.json({ error: 'Invalid offer payload' }, 400);
      }

      return c.json(repository.createOffer(payload), 201);
    } catch (error) {
      console.error('Failed to create offer', error);
      return c.json({ error: 'Failed to create offer' }, 500);
    }
  });

  app.put('/offers/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseOfferPayload({ ...body, id });
      if (!payload) {
        return c.json({ error: 'Invalid offer payload' }, 400);
      }

      const updated = repository.updateOffer(id, {
        name: payload.name,
        description: payload.description,
        priceFrom: payload.priceFrom,
        timeline: payload.timeline,
        revisions: payload.revisions,
        hosting: payload.hosting,
        includes: payload.includes,
        featured: payload.featured,
        sortOrder: payload.sortOrder,
      });

      if (!updated) {
        return c.json({ error: 'Offer not found' }, 404);
      }

      return c.json(updated);
    } catch (error) {
      console.error('Failed to update offer', error);
      return c.json({ error: 'Failed to update offer' }, 500);
    }
  });

  app.delete('/offers/:id', (c) => {
    const { id } = c.req.param();
    const deleted = repository.deleteOffer(id);
    if (!deleted) {
      return c.json({ error: 'Offer not found' }, 404);
    }

    return c.json({ success: true });
  });

  app.get('/retainers', (c) => {
    return c.json(repository.listRetainers());
  });

  app.post('/retainers', async (c) => {
    try {
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseRetainerPayload(body);
      if (!payload) {
        return c.json({ error: 'Invalid retainer payload' }, 400);
      }

      return c.json(repository.createRetainer(payload), 201);
    } catch (error) {
      console.error('Failed to create retainer', error);
      return c.json({ error: 'Failed to create retainer' }, 500);
    }
  });

  app.put('/retainers/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseRetainerPayload({ ...body, id });
      if (!payload) {
        return c.json({ error: 'Invalid retainer payload' }, 400);
      }

      const updated = repository.updateRetainer(id, {
        name: payload.name,
        hoursPerMonth: payload.hoursPerMonth,
        price: payload.price,
        hostingIncluded: payload.hostingIncluded,
        supportSla: payload.supportSla,
        includes: payload.includes,
        sortOrder: payload.sortOrder,
      });

      if (!updated) {
        return c.json({ error: 'Retainer not found' }, 404);
      }

      return c.json(updated);
    } catch (error) {
      console.error('Failed to update retainer', error);
      return c.json({ error: 'Failed to update retainer' }, 500);
    }
  });

  app.delete('/retainers/:id', (c) => {
    const { id } = c.req.param();
    const deleted = repository.deleteRetainer(id);
    if (!deleted) {
      return c.json({ error: 'Retainer not found' }, 404);
    }

    return c.json({ success: true });
  });

  app.get('/case-studies', (c) => {
    return c.json(repository.listCaseStudies());
  });

  app.post('/case-studies', async (c) => {
    try {
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseCaseStudyPayload(body);
      if (!payload) {
        return c.json({ error: 'Invalid case study payload' }, 400);
      }

      return c.json(repository.createCaseStudy(payload), 201);
    } catch (error) {
      console.error('Failed to create case study', error);
      return c.json({ error: 'Failed to create case study' }, 500);
    }
  });

  app.put('/case-studies/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseCaseStudyPayload({ ...body, id });
      if (!payload) {
        return c.json({ error: 'Invalid case study payload' }, 400);
      }

      const updated = repository.updateCaseStudy(id, {
        title: payload.title,
        clientName: payload.clientName,
        industry: payload.industry,
        challenge: payload.challenge,
        solution: payload.solution,
        outcome: payload.outcome,
        testimonialQuote: payload.testimonialQuote,
        testimonialAuthor: payload.testimonialAuthor,
        projectUrl: payload.projectUrl,
        featured: payload.featured,
      });

      if (!updated) {
        return c.json({ error: 'Case study not found' }, 404);
      }

      return c.json(updated);
    } catch (error) {
      console.error('Failed to update case study', error);
      return c.json({ error: 'Failed to update case study' }, 500);
    }
  });

  app.delete('/case-studies/:id', (c) => {
    const { id } = c.req.param();
    const deleted = repository.deleteCaseStudy(id);
    if (!deleted) {
      return c.json({ error: 'Case study not found' }, 404);
    }

    return c.json({ success: true });
  });

  app.get('/service-pages', (c) => {
    return c.json(repository.listServicePages());
  });

  app.post('/service-pages', async (c) => {
    try {
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseServicePagePayload(body);
      if (!payload) {
        return c.json({ error: 'Invalid service page payload' }, 400);
      }

      return c.json(repository.createServicePage(payload), 201);
    } catch (error) {
      console.error('Failed to create service page', error);
      return c.json({ error: 'Failed to create service page' }, 500);
    }
  });

  app.put('/service-pages/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseServicePagePayload({ ...body, id });
      if (!payload) {
        return c.json({ error: 'Invalid service page payload' }, 400);
      }

      const updated = repository.updateServicePage(id, {
        slug: payload.slug,
        title: payload.title,
        audience: payload.audience,
        city: payload.city,
        summary: payload.summary,
        offer: payload.offer,
        seoDescription: payload.seoDescription,
        ctaLabel: payload.ctaLabel,
      });

      if (!updated) {
        return c.json({ error: 'Service page not found' }, 404);
      }

      return c.json(updated);
    } catch (error) {
      console.error('Failed to update service page', error);
      return c.json({ error: 'Failed to update service page' }, 500);
    }
  });

  app.delete('/service-pages/:id', (c) => {
    const { id } = c.req.param();
    const deleted = repository.deleteServicePage(id);
    if (!deleted) {
      return c.json({ error: 'Service page not found' }, 404);
    }

    return c.json({ success: true });
  });

  app.get('/blog-posts', (c) => {
    return c.json(repository.listBlogPosts());
  });

  app.post('/blog-posts', async (c) => {
    try {
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseBlogPostPayload(body);
      if (!payload) {
        return c.json({ error: 'Invalid blog post payload' }, 400);
      }

      return c.json(repository.createBlogPost(payload), 201);
    } catch (error) {
      console.error('Failed to create blog post', error);
      return c.json({ error: 'Failed to create blog post' }, 500);
    }
  });

  app.put('/blog-posts/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseBlogPostPayload({ ...body, id });
      if (!payload) {
        return c.json({ error: 'Invalid blog post payload' }, 400);
      }

      const updated = repository.updateBlogPost(id, {
        slug: payload.slug,
        title: payload.title,
        excerpt: payload.excerpt,
        body: payload.body,
        category: payload.category,
        readTime: payload.readTime,
        publishedAt: payload.publishedAt,
      });

      if (!updated) {
        return c.json({ error: 'Blog post not found' }, 404);
      }

      return c.json(updated);
    } catch (error) {
      console.error('Failed to update blog post', error);
      return c.json({ error: 'Failed to update blog post' }, 500);
    }
  });

  app.delete('/blog-posts/:id', (c) => {
    const { id } = c.req.param();
    const deleted = repository.deleteBlogPost(id);
    if (!deleted) {
      return c.json({ error: 'Blog post not found' }, 404);
    }

    return c.json({ success: true });
  });

  app.get('/contacts', (c) => {
    return c.json(repository.listContactRequests());
  });

  app.put('/contacts/:id/status', async (c) => {
    try {
      const { id } = c.req.param();
      const numericId = Number(id);
      if (!Number.isFinite(numericId) || numericId <= 0) {
        return c.json({ error: 'Invalid contact id' }, 400);
      }

      const body = (await c.req.json()) as Record<string, unknown>;
      const status = sanitizeString(body.status, 40).toLowerCase();
      if (!validContactStatuses.has(status)) {
        return c.json({ error: 'Invalid contact status' }, 400);
      }

      const updated = repository.updateContactStatus(numericId, status);
      if (!updated) {
        return c.json({ error: 'Contact not found' }, 404);
      }

      return c.json(updated);
    } catch (error) {
      console.error('Failed to update contact status', error);
      return c.json({ error: 'Failed to update contact status' }, 500);
    }
  });

  app.get('/leads', (c) => {
    return c.json(repository.listLeadCaptures());
  });

  app.get('/analytics/events', (c) => {
    const limit = Number(c.req.query('limit') || '200');
    return c.json(repository.listAnalyticsEvents(limit));
  });

  app.get('/analytics/summary', (c) => {
    return c.json(repository.getAnalyticsSummary());
  });

  return app;
}
