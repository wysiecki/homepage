# Martin von Wysiecki — Portfolio Homepage

Modern portfolio site built with vanilla JS + Tailwind CSS, served by nginx, with an Express.js API backend. Deployed via Docker behind Traefik.

## Quick Start

```bash
# Set required env vars (create a .env file or export them)
export ANALYTICS_TOKEN="your-secret-dashboard-token"
export ANALYTICS_SALT="random-string-for-visitor-hashing"

# Build and start
docker compose build && docker compose up -d
```

## Development

```bash
# Install dependencies
npm install

# Build site (partials + blog + CSS) and serve locally
npm run build
cd build && python3 -m http.server 3004
```

Site is available at `http://localhost:3004`.

To run the API server locally (contact form, analytics, blog):

```bash
cd server && npm install && PORT=8002 node index.js
```

```bash
# Lint & format
npm run lint
npm run format
```

### Docker Dev Mode

```bash
docker compose --profile dev up
```

This starts nginx (port 80) + Tailwind watcher. For live reload, uncomment the volume mounts in `docker-compose.yml`.

### Local Dev Ports

| Port | Service | Description |
|------|---------|-------------|
| 3004 | Static server | Python HTTP server serving `build/` directory |
| 8002 | Express API | Contact form, analytics, blog API (`server/index.js`) |

## Project Structure

```
homepage/
├── src/
│   ├── pages/           # HTML pages (index, impressum, datenschutz, 404)
│   ├── js/              # Client-side JavaScript
│   │   ├── script.js    # Homepage interactions (typewriter, animations)
│   │   ├── shared.js    # Shared nav/menu logic for sub-pages
│   │   └── tracker.js   # Analytics pageview tracker
│   ├── css/
│   │   └── input.css    # Tailwind source CSS
│   └── assets/          # Images, fonts, static files
├── server/
│   ├── index.js         # Express API (contact form, config, health)
│   ├── analytics.js     # Analytics module (SQLite, pageview ingestion)
│   ├── dashboard.js     # Analytics dashboard HTML template
│   ├── public/          # Static assets served by Express (Chart.js)
│   ├── Dockerfile       # API container image
│   └── package.json     # API dependencies
├── docker/
│   ├── Dockerfile       # nginx container image (multi-stage: build CSS + serve)
│   └── nginx.conf       # nginx configuration
├── dist/                # Generated CSS (gitignored)
├── docker-compose.yml   # Dev/local compose
├── docker-compose.prod.yml  # Production compose (pre-built images, Traefik)
├── tailwind.config.js
└── package.json         # Frontend dev dependencies (Tailwind, ESLint, Prettier)
```

## Analytics

Self-hosted, privacy-friendly analytics — no cookies, no fingerprinting, no third-party services. All data stays on your server.

### Setup

Set these environment variables before starting the containers:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANALYTICS_TOKEN` | Yes | Secret token to access the dashboard and data API |
| `ANALYTICS_SALT` | Yes | Random string for visitor hashing. Analytics is disabled if not set. |
| `ANALYTICS_DB_PATH` | No | SQLite database path (default: `/data/analytics.db`) |
| `ANALYTICS_RETENTION_DAYS` | No | Auto-delete data older than N days (default: 730 = 2 years) |

### Accessing the Dashboard

Open in your browser:

```
https://your-domain/api/analytics/dashboard?token=YOUR_TOKEN
```

The dashboard shows:
- **Summary cards** — page views, unique visitors, top page (today / 7d / 30d)
- **Views over time** — line chart with daily granularity
- **Top pages** — most visited paths
- **Top referrers** — where your traffic comes from
- **Browsers / OS / Devices** — doughnut charts
- **Countries** — geographic breakdown (requires Cloudflare proxy, see note below)

### Data API

For programmatic access, use the JSON endpoint:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://your-domain/api/analytics/data?from=2026-03-01&to=2026-03-27"
```

Returns aggregated data: summary, viewsOverTime, topPages, topReferrers, browsers, operatingSystems, devices, countries.

### How It Works

1. A lightweight tracker (`tracker.js`, ~30 lines) sends a single `POST /api/analytics/pageview` beacon on each page load
2. The server stores pageviews in SQLite with: path, referrer, screen size, browser, OS, country, and a daily visitor hash
3. **Privacy**: unique visitors are counted via `SHA-256(IP + date + salt)` — the hash rotates daily and cannot be reversed. Raw IPs are never stored. `Do Not Track` is respected.
4. **Rate limiting**: the pageview endpoint is limited to 10 requests/minute per IP to prevent abuse.
5. **Data retention**: records older than `ANALYTICS_RETENTION_DAYS` (default: 2 years) are automatically deleted daily.

### Country Detection

Country data comes from Cloudflare's `CF-IPCountry` header, which is only available when traffic passes through Cloudflare's proxy (orange-cloud DNS records). If you're not using Cloudflare or your DNS records are gray-clouded, country will show as "unknown". No server-side GeoIP library is used.

### Data Persistence

Analytics data is stored in a Docker named volume (`analytics-data`). It survives container restarts and rebuilds. Only `docker compose down -v` removes it.

## Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `SMTP_HOST` | API | SMTP server hostname |
| `SMTP_PORT` | API | SMTP port (default: 587) |
| `SMTP_USER` | API | SMTP username |
| `SMTP_PASS` | API | SMTP password |
| `MAIL_TO` | API | Contact form recipient (default: info@wysiecki.de) |
| `MAIL_FROM` | API | Sender address (default: SMTP_USER) |
| `TURNSTILE_SECRET` | API | Cloudflare Turnstile secret key |
| `TURNSTILE_SITE_KEY` | API | Cloudflare Turnstile site key |
| `ANALYTICS_TOKEN` | API | Dashboard access token |
| `ANALYTICS_SALT` | API | Visitor hash salt (required, analytics disabled if unset) |
| `ANALYTICS_DB_PATH` | API | SQLite path (default: /data/analytics.db) |
| `ANALYTICS_RETENTION_DAYS` | API | Auto-delete data older than N days (default: 730) |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/contact` | Turnstile | Submit contact form |
| `GET` | `/api/config` | — | Public config (Turnstile site key) |
| `GET` | `/api/health` | — | Health check (`{ status, smtp }`) |
| `POST` | `/api/analytics/pageview` | — | Record a page view (called by tracker) |
| `GET` | `/api/analytics/data` | Bearer token | Aggregated analytics JSON |
| `GET` | `/api/analytics/dashboard` | Query token | Analytics dashboard HTML |

## Health Check

```bash
# Local dev — static server health
curl http://localhost:3004/health

# Local dev — API health
curl http://localhost:8002/api/health
```

## Production Deployment

The production setup uses pre-built Docker images and Traefik for HTTPS:

```bash
# On the production server
docker compose -f docker-compose.prod.yml up -d
```

Traefik labels are configured for:
- Hosts: `wysiecki.de`, `www.wysiecki.de`
- TLS via Cloudflare cert resolver
- External network: `mvw-net`

## License

All rights reserved. Martin von Wysiecki.
