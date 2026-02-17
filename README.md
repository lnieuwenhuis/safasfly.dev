# safasfly.dev

Monorepo for Lars Nieuwenhuis' portfolio platform.

Current public presentation is student-focused (4th-year MBO4 Software Development), while the backend and admin system
still include the full content and lead-management structure for a future return to freelancing.

## Architecture

- `frontend/`: React + TypeScript + Vite + `react-router-dom`
- `backend/`: Hono API + SQLite + admin auth + content/inbox/analytics management

## Current Product Direction

- Public frontend tone and copy are student portfolio oriented
- Main public navigation:
  - `/` (home)
  - `/projects`
  - `/services` (shown as "Skills")
  - `/insights` (shown as "Notes")
  - `/contact`
  - `/free-audit` (project checklist page)
  - `/terms`
  - `/privacy`
  - `/maintenance-agreement`
- Admin routes remain:
  - `/admin`
  - `/admin/dashboard`

## Backend Capability Kept Intact

The backend/admin model still supports freelancing-style operations and can be reused without schema changes:

- profile + socials
- projects
- offers/packages
- retainers
- case studies
- service landing pages
- blog posts
- contact inbox + status tracking
- lead captures
- analytics events and summaries

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Run backend API

```bash
cp backend/.env.example backend/.env
npm --prefix backend run dev
```

Backend runs at `http://localhost:3002`.

Default seeded admin credentials come from:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

### 3) Run frontend app

```bash
npm --prefix frontend run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api/*` to `http://localhost:3002`.

## Root Workspace Scripts

- `npm run build:backend`
- `npm run start:backend`
- `npm run build:frontend`
- `npm run start:frontend`

## Environment Variables

### Backend (`backend/.env`)

- `DB_PATH` (or Railway volume auto-path via `RAILWAY_VOLUME_MOUNT_PATH`)
- `ADMIN_SESSION_TTL_DAYS`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_EMAIL`
- `CORS_ORIGINS`

### Frontend

- `VITE_API_BASE` (default `/api`)
- `VITE_STAGING_GUARD` (optional)
- `VITE_STAGING_HOST_PREFIX` (optional, default `staging.`)

## Railway Deployment (Monorepo)

Deploy as two services from the same repository.

### Backend service

- Root directory: `backend`
- Build command: `npm run build`
- Start command: `npm run start`
- Attach a Railway volume for SQLite persistence
- When `DB_PATH` is empty, DB path resolves to `RAILWAY_VOLUME_MOUNT_PATH/portfolio.db`

### Frontend service

- Root directory: `frontend`
- Build command: `npm run build`
- Start command: `npm run start`
- Set `VITE_API_BASE=https://<your-backend-domain>/api`

### Domain setup checklist

1. Frontend domains point to frontend service (`safasfly.dev`, `www.safasfly.dev`).
2. Backend domain points to backend service (for example `api.safasfly.dev`).
3. Frontend `VITE_API_BASE` points to backend domain.
4. Backend `CORS_ORIGINS` includes frontend domains.

## API Surface

### Public

- `GET /api/health`
- `GET /api/site`
- `GET /api/about`
- `GET /api/socials`
- `GET /api/projects`
- `GET /api/projects/:id`
- `GET /api/offers`
- `GET /api/retainers`
- `GET /api/case-studies`
- `GET /api/service-pages`
- `GET /api/blog-posts`
- `POST /api/contact`
- `POST /api/leads`
- `POST /api/analytics/event`

### Auth

- `POST /api/auth/staging-unlock`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Admin

- `GET /api/admin/dashboard`
- `GET|PUT /api/admin/profile`
- `GET|PUT /api/admin/socials`
- `GET|POST /api/admin/projects`
- `PUT|DELETE /api/admin/projects/:id`
- `GET|POST /api/admin/offers`
- `PUT|DELETE /api/admin/offers/:id`
- `GET|POST /api/admin/retainers`
- `PUT|DELETE /api/admin/retainers/:id`
- `GET|POST /api/admin/case-studies`
- `PUT|DELETE /api/admin/case-studies/:id`
- `GET|POST /api/admin/service-pages`
- `PUT|DELETE /api/admin/service-pages/:id`
- `GET|POST /api/admin/blog-posts`
- `PUT|DELETE /api/admin/blog-posts/:id`
- `GET /api/admin/contacts`
- `PUT /api/admin/contacts/:id/status`
- `GET /api/admin/leads`
- `GET /api/admin/analytics/summary`
- `GET /api/admin/analytics/events`
