export interface AppEnv {
  port: number;
  dbPath: string;
  corsOrigins: string[];
  adminSessionTtlDays: number;
  seedAdminEmail: string;
  seedAdminPassword: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  contactEmail: string;
}

const defaultCorsOrigins = ['http://localhost:5173', 'https://safasfly.dev', 'https://www.safasfly.dev'];

function sanitizeNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function splitOrigins(value: string | undefined): string[] {
  if (!value) {
    return defaultCorsOrigins;
  }

  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : defaultCorsOrigins;
}

function resolveDbPath(): string {
  const explicitPath = (process.env.DB_PATH || '').trim();
  if (explicitPath) {
    return explicitPath;
  }

  const railwayMount = (process.env.RAILWAY_VOLUME_MOUNT_PATH || '').trim();
  if (railwayMount) {
    const normalizedMount = railwayMount.endsWith('/') ? railwayMount.slice(0, -1) : railwayMount;
    return `${normalizedMount}/portfolio.db`;
  }

  return './data/portfolio.db';
}

export function loadEnv(): AppEnv {
  return {
    port: sanitizeNumber(process.env.PORT, 3002),
    dbPath: resolveDbPath(),
    corsOrigins: splitOrigins(process.env.CORS_ORIGINS),
    adminSessionTtlDays: Math.max(1, sanitizeNumber(process.env.ADMIN_SESSION_TTL_DAYS, 30)),
    seedAdminEmail: (process.env.SEED_ADMIN_EMAIL || 'lnieuwenhuis48@icloud.com').trim().toLowerCase(),
    seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || '',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: sanitizeNumber(process.env.SMTP_PORT, 587),
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    contactEmail: process.env.CONTACT_EMAIL || 'contact@safasfly.dev',
  };
}
