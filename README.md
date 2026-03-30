# Martin von Wysiecki — Portfolio Homepage

Modern portfolio site built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, and next-intl (EN/DE/PL). Deployed via Docker behind Traefik.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server on port 3004
./local.sh
```

Site is available at `http://localhost:3004`.

## local.sh

The `local.sh` script manages the local development environment:

| Command | Description |
|---------|-------------|
| `./local.sh` | Start Next.js dev server on port 3004 (kills stale process, sets env vars) |
| `./local.sh stop` | Stop whatever is running (dev server or Docker container) |
| `./local.sh docker` | Build Docker image and run container on port 3004 |
| `./local.sh docker stop` | Stop the Docker container |

The script automatically sets dev defaults for `BLOG_DB_PATH` and `BLOG_API_KEY`.

## Development

```bash
# Install dependencies
npm install

# Dev server (with Turbopack, port 3004)
npm run dev

# Production build
npm run build

# Lint & format
npm run lint
npm run format
```

Note: First page load in dev triggers compilation (~10-15s), subsequent loads are fast.

### Local Dev Port

| Port | Service | Description |
|------|---------|-------------|
| 3004 | Next.js | Dev server and API routes (`./local.sh` or `npm run dev`) |

## Project Structure

```
homepage/
├── src/
│   ├── app/                # Next.js App Router pages, layouts, API routes
│   │   ├── [locale]/       # Locale-based routing (EN/DE/PL)
│   │   └── api/            # API route handlers
│   ├── components/         # React components (server + client)
│   ├── lib/                # Shared utilities (DB, mail, turnstile)
│   ├── i18n/               # next-intl config (routing, navigation)
│   └── styles/             # Tailwind v4 CSS (globals.css, fonts.css)
├── messages/               # i18n translation files (en.json, de.json, pl.json)
├── content/blog/           # MDX blog posts
├── public/assets/          # Static files (logo, fonts)
├── data/                   # SQLite databases (gitignored)
├── next.config.ts          # Next.js config (standalone, CSP, next-intl)
├── Dockerfile              # 3-stage build (deps → build → runner)
├── docker-compose.yml      # Production compose (Traefik)
├── docker-compose.local.yml # Local Docker override (port 3004)
├── local.sh                # Local dev script
└── package.json
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (default: 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `MAIL_TO` | Contact form recipient (default: info@wysiecki.de) |
| `MAIL_FROM` | Sender address (default: SMTP_USER) |
| `TURNSTILE_SECRET` | Cloudflare Turnstile secret key |
| `TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |
| `BLOG_API_KEY` | Blog CRUD API auth token |
| `BLOG_DB_PATH` | Blog SQLite path (default: /data/blog.db) |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/contact` | Turnstile | Submit contact form |
| `GET` | `/api/config` | — | Public config (Turnstile site key) |
| `GET` | `/api/health` | — | Health check (`{ status, smtp }`) |
| `GET` | `/api/ai-feed` | — | arXiv proxy with cache |
| `GET/POST` | `/api/blog` | Bearer token (POST) | List / create blog posts |
| `GET/PUT/DELETE` | `/api/blog/[slug]` | Bearer token (PUT/DELETE) | Single post CRUD |

## Health Check

```bash
curl http://localhost:3004/api/health
```

## Production Deployment

```bash
# On the production server
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Traefik labels configured for `wysiecki.de` / `www.wysiecki.de` with TLS via Cloudflare cert resolver.

## License

All rights reserved. Martin von Wysiecki.
