# Frontend

React + TypeScript frontend for safasfly.dev.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Routes

- `/` home page (latest 2 projects)
- `/projects` all projects
- `/contact` contact form page
- `/admin` admin login and dashboard

## API Configuration

The app expects backend APIs under `VITE_API_BASE`.

- Default: `/api`
- Local dev: Vite proxies `/api` to `http://localhost:3002`
- Production (nginx): keep `VITE_API_BASE=/api` and proxy `/api` to backend

## Admin Login

Seeded defaults:

- Email: `lnieuwenhuis48@icloud.com`
- Password: `***REMOVED_SECRET***`

Change these via backend env in production.
