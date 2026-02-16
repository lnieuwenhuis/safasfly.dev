import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './app.js';
import { loadEnv } from './config/env.js';

const env = loadEnv();

serve({
  fetch: app.fetch,
  port: env.port,
});

console.log(`Server running on http://localhost:${env.port}`);
