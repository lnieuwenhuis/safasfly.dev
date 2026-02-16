# Frontend

React + TypeScript + Vite frontend for safasfly.dev.

## Stack

- React 19
- TypeScript
- Vite
- `react-router-dom`
- Tailwind v4

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run start
```

## Main Routes

- `/`
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

## API Configuration

The app expects backend APIs at `VITE_API_BASE`.

- Default: `/api`
- Local dev: Vite proxies `/api` to `http://localhost:3002`
- Production: keep `VITE_API_BASE=/api` and let nginx proxy `/api` to backend

## Staging Guard

A staging unlock screen is enabled automatically when hostname starts with `staging.`.

- Password is verified via `POST /api/auth/staging-unlock`
- Successful unlock is stored in `sessionStorage` for the current browser tab

Optional env vars:

- `VITE_STAGING_GUARD=true` to force guard on any hostname
- `VITE_STAGING_HOST_PREFIX=staging.` to customize the hostname prefix check

## Railway

- Set service root directory to `frontend`
- Build command: `npm run build`
- Start command: `npm run start`
- Set `VITE_API_BASE=https://<your-backend-domain>/api`
