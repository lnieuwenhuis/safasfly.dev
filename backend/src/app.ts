import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { AppEnv, loadEnv } from './config/env.js';
import { createRepository } from './db/repository.js';
import { createAdminRoutes } from './routes/admin.js';
import { createAuthRoutes } from './routes/auth.js';
import { createPublicRoutes } from './routes/public.js';

export function createApp(env: AppEnv = loadEnv()) {
  const app = new Hono();
  const repository = createRepository(env);

  app.use('*', logger());
  app.use(
    '*',
    cors({
      origin: env.corsOrigins,
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Session-Token'],
    }),
  );

  app.route('/api', createPublicRoutes(repository, env));
  app.route('/api/auth', createAuthRoutes(repository));
  app.route('/api/admin', createAdminRoutes(repository));

  app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404);
  });

  app.onError((error, c) => {
    console.error('Unhandled API error', error);
    return c.json({ error: 'Internal server error' }, 500);
  });

  return app;
}

const app = createApp();
export default app;
