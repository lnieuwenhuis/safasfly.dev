import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { projects as seedProjects } from './data.js';
import { ContactForm, Project } from './types.js';

interface ProjectRow {
  id: string;
  name: string;
  description: string;
  url: string;
  backend: string;
  frontend: string;
  featured: number;
  created_at: string;
  updated_at: string;
}

interface ContactRequestRow {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

interface AdminRow {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

interface AdminSessionJoinRow {
  id: number;
  email: string;
}

export interface ContactRequest {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface ProjectWriteInput {
  id: string;
  name: string;
  description: string;
  url: string;
  frontend: string[];
  backend: string[];
  featured: boolean;
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

const defaultDbPath = resolve(process.cwd(), 'data', 'portfolio.db');
const dbPath = process.env.DB_PATH || defaultDbPath;
const sessionTtlDays = Math.max(1, Number(process.env.ADMIN_SESSION_TTL_DAYS || '30'));
const seedAdminEmail = (process.env.SEED_ADMIN_EMAIL || 'lnieuwenhuis48@icloud.com').trim().toLowerCase();
const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || '***REMOVED_SECRET***';

mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
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

CREATE TABLE IF NOT EXISTS contact_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
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
`);

const projectListStmt = db.prepare(`
  SELECT id, name, description, url, frontend, backend, featured, created_at, updated_at
  FROM projects
  ORDER BY updated_at DESC, created_at DESC
`);

const projectByIdStmt = db.prepare(`
  SELECT id, name, description, url, frontend, backend, featured, created_at, updated_at
  FROM projects
  WHERE id = ?
`);

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

const listContactRequestsStmt = db.prepare(`
  SELECT id, name, email, subject, message, created_at
  FROM contact_requests
  ORDER BY created_at DESC
`);

const insertContactRequestStmt = db.prepare(`
  INSERT INTO contact_requests (name, email, subject, message, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

const contactRequestByIdStmt = db.prepare(`
  SELECT id, name, email, subject, message, created_at
  FROM contact_requests
  WHERE id = ?
`);

const adminByEmailStmt = db.prepare(`
  SELECT id, email, password_hash, created_at
  FROM admins
  WHERE email = ?
`);

const insertAdminStmt = db.prepare(`
  INSERT INTO admins (email, password_hash, created_at)
  VALUES (?, ?, ?)
`);

const updateAdminPasswordStmt = db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?');

const deleteExpiredSessionsStmt = db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?');

const insertAdminSessionStmt = db.prepare(`
  INSERT INTO admin_sessions (admin_id, token, created_at, expires_at)
  VALUES (?, ?, ?, ?)
`);

const adminBySessionTokenStmt = db.prepare(`
  SELECT admins.id AS id, admins.email AS email
  FROM admin_sessions
  INNER JOIN admins ON admins.id = admin_sessions.admin_id
  WHERE admin_sessions.token = ? AND admin_sessions.expires_at > ?
`);

const deleteSessionByTokenStmt = db.prepare('DELETE FROM admin_sessions WHERE token = ?');

function parseTechStack(value: string): string[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return [];
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

function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    url: row.url,
    frontend: parseTechStack(row.frontend),
    backend: parseTechStack(row.backend),
    featured: row.featured === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapContactRow(row: ContactRequestRow): ContactRequest {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    createdAt: row.created_at,
  };
}

function mapAdminRow(row: AdminRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
  };
}

function removeExpiredSessions() {
  deleteExpiredSessionsStmt.run(new Date().toISOString());
}

function getSessionExpiryIso(): string {
  return new Date(Date.now() + sessionTtlDays * 24 * 60 * 60 * 1000).toISOString();
}

function seedInitialProjects() {
  const countRow = db.prepare('SELECT COUNT(*) AS count FROM projects').get() as { count: number } | undefined;
  if (countRow && countRow.count > 0) {
    return;
  }

  const now = new Date().toISOString();
  for (const project of seedProjects) {
    insertProjectStmt.run(
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

function seedAdminAccount() {
  if (!seedAdminEmail || !seedAdminPassword) {
    return;
  }

  const passwordHash = createPasswordHash(seedAdminPassword);
  const existing = adminByEmailStmt.get(seedAdminEmail) as AdminRow | undefined;
  if (existing) {
    updateAdminPasswordStmt.run(passwordHash, existing.id);
    return;
  }

  const now = new Date().toISOString();
  insertAdminStmt.run(seedAdminEmail, passwordHash, now);
}

seedInitialProjects();
seedAdminAccount();

export function listProjects(): Project[] {
  const rows = projectListStmt.all() as unknown as ProjectRow[];
  return rows.map(mapProjectRow);
}

export function getProjectById(id: string): Project | null {
  const row = projectByIdStmt.get(id) as ProjectRow | undefined;
  return row ? mapProjectRow(row) : null;
}

export function createProject(input: ProjectWriteInput): Project {
  const now = new Date().toISOString();
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

  const created = getProjectById(input.id);
  if (!created) {
    throw new Error('Project was not created');
  }

  return created;
}

export function updateProject(id: string, input: Omit<ProjectWriteInput, 'id'>): Project | null {
  const now = new Date().toISOString();
  const result = updateProjectStmt.run(
    input.name,
    input.description,
    input.url,
    JSON.stringify(input.frontend),
    JSON.stringify(input.backend),
    input.featured ? 1 : 0,
    now,
    id,
  );

  if (result.changes === 0) {
    return null;
  }

  return getProjectById(id);
}

export function deleteProject(id: string): boolean {
  const result = deleteProjectStmt.run(id);
  return result.changes > 0;
}

export function createContactRequest(form: ContactForm): ContactRequest {
  const now = new Date().toISOString();
  const result = insertContactRequestStmt.run(form.name, form.email, form.subject, form.message, now);
  const insertedId = Number(result.lastInsertRowid);
  const row = contactRequestByIdStmt.get(insertedId) as ContactRequestRow | undefined;

  if (!row) {
    throw new Error('Contact request was not saved');
  }

  return mapContactRow(row);
}

export function listContactRequests(): ContactRequest[] {
  const rows = listContactRequestsStmt.all() as unknown as ContactRequestRow[];
  return rows.map(mapContactRow);
}

export function loginAdmin(email: string, password: string): AdminSession | null {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return null;
  }

  const admin = adminByEmailStmt.get(normalizedEmail) as AdminRow | undefined;
  if (!admin) {
    return null;
  }

  if (!verifyPassword(password, admin.password_hash)) {
    return null;
  }

  removeExpiredSessions();

  const token = randomBytes(32).toString('hex');
  const now = new Date().toISOString();
  const expiresAt = getSessionExpiryIso();
  insertAdminSessionStmt.run(admin.id, token, now, expiresAt);

  return {
    token,
    user: mapAdminRow(admin),
    expiresAt,
  };
}

export function getAdminBySessionToken(token: string): AdminUser | null {
  if (!token) {
    return null;
  }

  removeExpiredSessions();
  const now = new Date().toISOString();
  const row = adminBySessionTokenStmt.get(token, now) as AdminSessionJoinRow | undefined;
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
  };
}

export function revokeAdminSession(token: string): void {
  if (!token) {
    return;
  }

  deleteSessionByTokenStmt.run(token);
}
