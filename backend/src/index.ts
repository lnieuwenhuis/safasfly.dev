import { Hono, type Context, type Next } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import nodemailer from 'nodemailer';
import { aboutInfo, socialLinks } from './data.js';
import {
  createContactRequest,
  createProject,
  deleteProject,
  getAdminBySessionToken,
  getProjectById,
  listContactRequests,
  listProjects,
  loginAdmin,
  revokeAdminSession,
  updateProject,
} from './db.js';
import { ContactForm } from './types.js';

interface ProjectPayload {
  name: string;
  description: string;
  url: string;
  frontend: string[];
  backend: string[];
  featured: boolean;
}

const app = new Hono();
const defaultOrigins = ['http://localhost:5173', 'https://safasfly.dev', 'https://www.safasfly.dev'];
const configuredOrigins = process.env.CORS_ORIGINS
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function sanitizeString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

function parseTechStack(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20);
  }

  return [];
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function toProjectId(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .slice(0, 60);
}

function extractSessionToken(authorization: string | undefined, xSessionToken: string | undefined): string {
  if (xSessionToken && xSessionToken.trim()) {
    return xSessionToken.trim();
  }

  if (!authorization) {
    return '';
  }

  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  return authorization.trim();
}

function parseProjectPayload(body: Record<string, unknown>): { error?: string; data?: ProjectPayload } {
  const name = sanitizeString(body.name, 120);
  const description = sanitizeString(body.description, 2000);
  const url = sanitizeString(body.url, 512);
  const frontend = parseTechStack(body.frontend);
  const backend = parseTechStack(body.backend);
  const featured = typeof body.featured === 'boolean' ? body.featured : false;

  if (!name || !description || !url) {
    return { error: 'name, description and url are required' };
  }

  if (!isValidHttpUrl(url)) {
    return { error: 'url must be a valid http(s) url' };
  }

  if (frontend.length === 0 || backend.length === 0) {
    return { error: 'frontend and backend tech stacks are required' };
  }

  return {
    data: {
      name,
      description,
      url,
      frontend,
      backend,
      featured,
    },
  };
}

async function requireAdmin(c: Context, next: Next) {
  const token = extractSessionToken(c.req.header('Authorization'), c.req.header('x-session-token'));
  const admin = getAdminBySessionToken(token);

  if (!token || !admin) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('admin', admin);
  c.set('sessionToken', token);
  await next();
}

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: configuredOrigins && configuredOrigins.length > 0 ? configuredOrigins : defaultOrigins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Session-Token'],
  }),
);

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', async (c) => {
  try {
    const body = (await c.req.json()) as Record<string, unknown>;
    const email = sanitizeString(body.email, 254).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email address' }, 400);
    }

    const session = loginAdmin(email, password);
    if (!session) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    return c.json(session);
  } catch (error) {
    console.error('Admin login error:', error);
    return c.json({ error: 'Failed to login' }, 500);
  }
});

app.post('/api/auth/logout', requireAdmin, (c) => {
  const token = extractSessionToken(c.req.header('Authorization'), c.req.header('x-session-token'));
  revokeAdminSession(token);
  return c.json({ success: true });
});

app.get('/api/auth/me', requireAdmin, (c) => {
  const token = extractSessionToken(c.req.header('Authorization'), c.req.header('x-session-token'));
  const admin = getAdminBySessionToken(token);

  if (!admin) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.json({ user: admin });
});

app.get('/api/about', (c) => {
  return c.json(aboutInfo);
});

app.get('/api/projects', (c) => {
  return c.json(listProjects());
});

app.get('/api/projects/:id', (c) => {
  const { id } = c.req.param();
  const project = getProjectById(id);

  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }

  return c.json(project);
});

app.get('/api/socials', (c) => {
  return c.json(socialLinks);
});

app.post('/api/contact', async (c) => {
  try {
    const body = await c.req.json<ContactForm>();

    const name = sanitizeString(body.name, 120);
    const email = sanitizeString(body.email, 254);
    const subject = sanitizeString(body.subject, 180);
    const message = sanitizeString(body.message, 5000);

    if (!name || !email || !subject || !message) {
      return c.json({ error: 'All fields are required' }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email address' }, 400);
    }

    const savedContact = createContactRequest({
      name,
      email,
      subject,
      message,
    });

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const contactEmail = process.env.CONTACT_EMAIL || aboutInfo.email;

    let emailSent = false;
    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: smtpUser,
          to: contactEmail,
          replyTo: email,
          subject: `[Portfolio Contact] ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <h3>Message:</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
          `,
        });

        emailSent = true;
      } catch (emailError) {
        console.error('Contact email notification failed:', emailError);
      }
    }

    return c.json({
      success: true,
      message: emailSent ? 'Message sent successfully' : 'Message received successfully',
      requestId: savedContact.id,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

app.get('/api/admin/projects', requireAdmin, (c) => {
  return c.json(listProjects());
});

app.post('/api/admin/projects', requireAdmin, async (c) => {
  try {
    const body = (await c.req.json()) as Record<string, unknown>;
    const parsed = parseProjectPayload(body);

    if (!parsed.data) {
      return c.json({ error: parsed.error || 'Invalid project payload' }, 400);
    }

    const idSource = sanitizeString(body.id, 120) || parsed.data.name;
    const id = toProjectId(idSource);

    if (!id) {
      return c.json({ error: 'A valid project id or name is required' }, 400);
    }

    if (getProjectById(id)) {
      return c.json({ error: 'Project id already exists' }, 409);
    }

    const created = createProject({ id, ...parsed.data });
    return c.json(created, 201);
  } catch (error) {
    console.error('Create project error:', error);
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

app.put('/api/admin/projects/:id', requireAdmin, async (c) => {
  try {
    const { id } = c.req.param();
    if (!getProjectById(id)) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const body = (await c.req.json()) as Record<string, unknown>;
    const parsed = parseProjectPayload(body);

    if (!parsed.data) {
      return c.json({ error: parsed.error || 'Invalid project payload' }, 400);
    }

    const updated = updateProject(id, parsed.data);
    if (!updated) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json(updated);
  } catch (error) {
    console.error('Update project error:', error);
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

app.delete('/api/admin/projects/:id', requireAdmin, (c) => {
  const { id } = c.req.param();
  const deleted = deleteProject(id);
  if (!deleted) {
    return c.json({ error: 'Project not found' }, 404);
  }

  return c.json({ success: true });
});

app.get('/api/admin/contacts', requireAdmin, (c) => {
  return c.json(listContactRequests());
});

export default app;
