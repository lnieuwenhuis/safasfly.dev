import { Context, Next } from 'hono';
import { Repository } from '../db/repository.js';
import { extractSessionToken } from '../utils/auth.js';

export function requireAdmin(repository: Repository) {
  return async (c: Context, next: Next) => {
    const token = extractSessionToken(c.req.header('Authorization'), c.req.header('x-session-token'));
    const admin = repository.getAdminBySessionToken(token);

    if (!token || !admin) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('admin', admin);
    c.set('sessionToken', token);
    await next();
  };
}
