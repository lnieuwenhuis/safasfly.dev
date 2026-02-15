# safasfly.dev

Dark-theme portfolio website for Lars Nieuwenhuis (freelance developer), with separate frontend deployment and Dockerized backend API.

## Architecture

- `frontend/`: React + TypeScript + Vite + Tailwind v4 (served as static files via nginx)
- `backend/`: Hono API with SQLite persistence, admin auth/session handling, project CRUD, and contact request inbox

## Features

- Dark-only design with blurple and deep purple visual language
- Sticky navbar
- Route-based frontend pages:
  - `/` home (latest 2 projects)
  - `/projects` all projects
  - `/contact` contact form
  - `/admin` admin login + dashboard
- Admin dashboard:
  - login with seeded admin account
  - add/edit/delete projects
  - view contact requests
- SQLite-backed persistence for projects and contacts

## Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs at `http://localhost:3001`.

Seeded admin defaults:

- Email: `lnieuwenhuis48@icloud.com`
- Password: `***REMOVED_SECRET***`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.
Vite proxies `/api/*` to `http://localhost:3001` during development.

## Backend Deployment (Single Docker Command)

1. Configure backend env:

```bash
cd backend
cp .env.example .env
```

2. Deploy backend:

```bash
docker compose up -d --build
```

This command is backend-only and uses `backend/docker-compose.yml`.

## Frontend Build and nginx Deploy

Build manually on your server:

```bash
cd frontend
npm ci
VITE_API_BASE=/api npm run build
```

Output is generated in `frontend/dist/`.

Serve that directory with nginx and proxy `/api` to backend (`127.0.0.1:3001`).

Example nginx block:

```nginx
server {
    listen 443 ssl http2;
    server_name safasfly.dev www.safasfly.dev;

    root /var/www/safasfly.dev/dist;
    index index.html;

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## API Endpoints

Public:

- `GET /api/health`
- `GET /api/about`
- `GET /api/projects`
- `GET /api/projects/:id`
- `GET /api/socials`
- `POST /api/contact`

Auth:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Admin (authenticated session token via `Authorization: Bearer <token>`):

- `GET /api/admin/projects`
- `POST /api/admin/projects`
- `PUT /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`
- `GET /api/admin/contacts`
