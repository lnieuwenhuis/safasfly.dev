import { Hono } from 'hono';
import { Repository } from '../db/repository.js';
import { requireAdmin } from '../middleware/auth.js';
import { extractSessionToken } from '../utils/auth.js';
import { isValidEmail, sanitizeString } from '../utils/strings.js';

export function createAuthRoutes(repository: Repository) {
  const app = new Hono();

  app.post('/staging-unlock', async (c) => {
    try {
      const body = (await c.req.json()) as Record<string, unknown>;
      const password = typeof body.password === 'string' ? body.password : '';

      if (!password || password.length > 255) {
        return c.json({ error: 'Invalid password' }, 400);
      }

      if (!repository.verifyAdminPassword(password)) {
        return c.json({ error: 'Invalid password' }, 401);
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Failed to verify staging unlock', error);
      return c.json({ error: 'Failed to verify password' }, 500);
    }
  });

  app.post('/login', async (c) => {
    try {
      const body = (await c.req.json()) as Record<string, unknown>;
      const email = sanitizeString(body.email, 254).toLowerCase();
      const password = typeof body.password === 'string' ? body.password : '';

      if (!email || !password || !isValidEmail(email)) {
        return c.json({ error: 'Invalid email or password' }, 400);
      }

      const session = repository.loginAdmin(email, password);
      if (!session) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      return c.json(session);
    } catch (error) {
      console.error('Failed to login admin', error);
      return c.json({ error: 'Failed to login' }, 500);
    }
  });

  app.post('/logout', requireAdmin(repository), (c) => {
    const token = extractSessionToken(c.req.header('Authorization'), c.req.header('x-session-token'));
    repository.revokeAdminSession(token);
    return c.json({ success: true });
  });

  app.get('/me', requireAdmin(repository), (c) => {
    const token = extractSessionToken(c.req.header('Authorization'), c.req.header('x-session-token'));
    const admin = repository.getAdminBySessionToken(token);
    if (!admin) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({ user: admin });
  });

  return app;
}
