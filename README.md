# Safasfly.dev Portfolio

Portfolio website for Lars Nieuwenhuis (Safasfly).

## Project Structure

```
safasfly.dev/
├── backend/          # Hono API server (Docker)
├── frontend/         # React + TypeScript + Tailwind
└── docker-compose.yml
```

## Development

### Prerequisites
- Node.js 22+
- Bun or npm

### Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on http://localhost:3001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Production Deployment

### Backend (Docker)

1. Create `.env` file:
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
CONTACT_EMAIL=contact@safasfly.dev
```

2. Deploy:
```bash
docker compose up -d --build
```

Backend will be available on port 3001.

### Frontend (Static Build)

Build the frontend and serve via your nginx:

```bash
cd frontend
VITE_API_URL=https://safasfly.dev npm run build
```

The built files will be in `frontend/dist/`.

### Nginx Config Example

```nginx
server {
    listen 443 ssl http2;
    server_name safasfly.dev www.safasfly.dev;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

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

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/about` | GET | Get about info |
| `/api/projects` | GET | List all projects |
| `/api/projects/:id` | GET | Get single project |
| `/api/socials` | GET | Get social links |
| `/api/contact` | POST | Submit contact form |
