# safasfly.dev

Dark-theme portfolio and sales site for Lars Nieuwenhuis (solo freelance developer), with independent frontend and backend deployment.

## Architecture

- `frontend/`: React + TypeScript + Vite + `react-router-dom` (served as static files by nginx)
- `backend/`: Hono API + SQLite + admin session auth + content/inbox/analytics management

## What Is Implemented

- Conversion-focused homepage with:
  - niche positioning + pricing anchors
  - productized packages
  - case studies + outcomes
  - retainer tiers
  - trust/operations blocks
- Route pages:
  - `/` home
  - `/projects`
  - `/services`
  - `/insights`
  - `/contact`
  - `/free-audit`
  - `/terms`
  - `/privacy`
  - `/maintenance-agreement`
  - `/admin`
  - `/admin/dashboard`
- Contact qualification form (budget/timeline/project type)
- Lead magnet capture endpoint and page
- Analytics event tracking for funnel actions
- Robust admin dashboard sections:
  - profile and socials
  - projects
  - packages
  - retainers
  - case studies
  - service landing pages
  - blog posts
  - contact inbox + status updates
  - leads
  - analytics summary/events
- Sticky navbar and dark blurple/purple visual system

## Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs at `http://localhost:3002`.

Default seeded admin credentials are read from env (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.
Vite proxies `/api/*` to `http://localhost:3002`.

## Railway Deployment (Monorepo)

This repo is now workspace-ready (`package.json` at root) and can be deployed as two Railway services from the same GitHub repository.

### Service 1: Backend API

- Create a Railway service from this repo.
- Set **Root Directory** to `backend`.
- Build command: `npm run build`
- Start command: `npm run start`

Attach a **Railway Volume** to the backend service for SQLite persistence.

- Mount path example: `/data`
- The app automatically uses `RAILWAY_VOLUME_MOUNT_PATH/portfolio.db` when `DB_PATH` is not set.

Recommended backend variables:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `ADMIN_SESSION_TTL_DAYS=30`
- `CONTACT_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `CORS_ORIGINS=https://safasfly.dev,https://www.safasfly.dev,https://staging.safasfly.dev`

### Service 2: Frontend Web

- Create a second Railway service from this repo.
- Set **Root Directory** to `frontend`.
- Build command: `npm run build`
- Start command: `npm run start`

Required frontend variable:

- `VITE_API_BASE=https://<your-backend-domain>/api`

Example:

- `VITE_API_BASE=https://api.safasfly.dev/api`

Optional staging guard variables:

- `VITE_STAGING_GUARD=true` (force guard on any host)
- `VITE_STAGING_HOST_PREFIX=staging.` (default behavior)

### Domains

- Frontend service:
  - `safasfly.dev`
  - `www.safasfly.dev`
- Backend service:
  - `api.safasfly.dev`

After domain setup:

1. Point frontend `VITE_API_BASE` to backend domain.
2. Update backend `CORS_ORIGINS` to include frontend domains.

### Notes

- Backend requires Node `>=22` (`node:sqlite`).
- Frontend serves built SPA via `serve -s dist`.
- Staging guard is enforced on hosts starting with `staging.` and checks admin password through `/api/auth/staging-unlock`.

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
