import { Hono } from 'hono';
import { AppEnv } from '../config/env.js';
import { Repository } from '../db/repository.js';
import { notifyContactRequest } from '../services/mailer.js';
import { AnalyticsEventPayload, ContactFormPayload, LeadCapturePayload } from '../types/payloads.js';
import { isValidEmail, sanitizeString } from '../utils/strings.js';

function parseContactPayload(body: Record<string, unknown>): ContactFormPayload | null {
  const payload: ContactFormPayload = {
    name: sanitizeString(body.name, 120),
    email: sanitizeString(body.email, 254).toLowerCase(),
    subject: sanitizeString(body.subject, 180),
    message: sanitizeString(body.message, 5000),
    budgetRange: sanitizeString(body.budgetRange, 120),
    timeline: sanitizeString(body.timeline, 120),
    projectType: sanitizeString(body.projectType, 120),
    source: sanitizeString(body.source, 120),
  };

  if (!payload.name || !payload.email || !payload.subject || !payload.message) {
    return null;
  }

  if (!isValidEmail(payload.email)) {
    return null;
  }

  return payload;
}

function parseLeadPayload(body: Record<string, unknown>): LeadCapturePayload | null {
  const payload: LeadCapturePayload = {
    email: sanitizeString(body.email, 254).toLowerCase(),
    name: sanitizeString(body.name, 120),
    company: sanitizeString(body.company, 120),
    website: sanitizeString(body.website, 255),
    useCase: sanitizeString(body.useCase, 500),
  };

  if (!payload.email || !isValidEmail(payload.email)) {
    return null;
  }

  return payload;
}

function parseAnalyticsPayload(body: Record<string, unknown>): AnalyticsEventPayload | null {
  const eventName = sanitizeString(body.eventName, 120);
  const path = sanitizeString(body.path, 512);

  if (!eventName || !path) {
    return null;
  }

  const metadata = body.metadata;
  const safeMetadata = metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {};

  return {
    eventName,
    path,
    metadata: safeMetadata as Record<string, unknown>,
  };
}

export function createPublicRoutes(repository: Repository, env: AppEnv) {
  const app = new Hono();

  app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/site', (c) => {
    return c.json(repository.getSiteBundle());
  });

  app.get('/about', (c) => {
    const profile = repository.getProfile();
    return c.json({
      name: profile.name,
      gamertag: profile.gamertag,
      title: profile.title,
      bio: profile.bio,
      location: profile.location,
      email: profile.email,
      nicheOffer: profile.nicheOffer,
      responseSla: profile.responseSla,
      availability: profile.availability,
      bookingUrl: profile.bookingUrl,
      hourlyRateFrom: profile.hourlyRateFrom,
      monthlyHostingFrom: profile.monthlyHostingFrom,
    });
  });

  app.get('/socials', (c) => {
    return c.json(repository.listSocials());
  });

  app.get('/projects', (c) => {
    return c.json(repository.listProjects());
  });

  app.get('/projects/:id', (c) => {
    const { id } = c.req.param();
    const project = repository.getProjectById(id);
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json(project);
  });

  app.get('/offers', (c) => {
    return c.json(repository.listOffers());
  });

  app.get('/retainers', (c) => {
    return c.json(repository.listRetainers());
  });

  app.get('/case-studies', (c) => {
    return c.json(repository.listCaseStudies());
  });

  app.get('/service-pages', (c) => {
    return c.json(repository.listServicePages());
  });

  app.get('/blog-posts', (c) => {
    return c.json(repository.listBlogPosts());
  });

  app.post('/contact', async (c) => {
    try {
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseContactPayload(body);
      if (!payload) {
        return c.json({ error: 'Invalid contact request payload' }, 400);
      }

      const saved = repository.createContactRequest(payload);
      const emailSent = await notifyContactRequest(env, saved);

      return c.json({
        success: true,
        requestId: saved.id,
        message: emailSent ? 'Message sent successfully' : 'Message received successfully',
      });
    } catch (error) {
      console.error('Failed to handle contact request', error);
      return c.json({ error: 'Failed to send message' }, 500);
    }
  });

  app.post('/leads', async (c) => {
    try {
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseLeadPayload(body);
      if (!payload) {
        return c.json({ error: 'Invalid lead payload' }, 400);
      }

      const lead = repository.createLeadCapture(payload);
      return c.json({ success: true, leadId: lead.id });
    } catch (error) {
      console.error('Failed to save lead capture', error);
      return c.json({ error: 'Failed to capture lead' }, 500);
    }
  });

  app.post('/analytics/event', async (c) => {
    try {
      const body = (await c.req.json()) as Record<string, unknown>;
      const payload = parseAnalyticsPayload(body);
      if (!payload) {
        return c.json({ error: 'Invalid analytics event payload' }, 400);
      }

      repository.createAnalyticsEvent(payload.eventName, payload.path, payload.metadata || {});
      return c.json({ success: true });
    } catch (error) {
      console.error('Failed to save analytics event', error);
      return c.json({ error: 'Failed to record analytics event' }, 500);
    }
  });

  return app;
}
