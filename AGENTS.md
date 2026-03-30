# Repository Guidelines

## Project Structure & Module Organization
- Next.js 15 App Router with TypeScript, Tailwind CSS v4, and next-intl for i18n (EN/DE/PL).
- Key paths:
  - `src/app/` — App Router pages, layouts, and API routes
  - `src/components/` — React components (server by default, `'use client'` only when needed)
  - `src/lib/` — shared utilities and helpers
  - `src/styles/globals.css` — Tailwind v4 CSS-first config (`@theme`, `@layer` blocks)
  - `messages/` — next-intl translation JSON files (en.json, de.json, pl.json)
  - `content/blog/` — MDX blog posts
  - `public/` — static assets
  - `data/` — SQLite databases (gitignored)
  - `Dockerfile`, `docker-compose.yml`, `next.config.ts`

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `./local.sh`: start dev server on port 3004 (kills stale process, sets env vars).
- `npm run dev`: Next.js dev server (port 3004).
- `npm run build`: production build.
- `docker compose build && docker compose up -d`: build and serve via Docker.
- `docker compose logs -f homepage`: follow server logs.

## Coding Style & Naming Conventions
- TypeScript: 2-space indent, semicolons, `const`/`let` (no `var`), camelCase for variables and functions, PascalCase for components and types.
- React: server components by default; add `'use client'` only when hooks or browser APIs are needed.
- Tailwind v4: prefer utilities over custom CSS; place shared styles in `@layer components`/`utilities` within `src/styles/globals.css`.
- i18n: use next-intl `useTranslations()` in client components, `getTranslations()` in server components. Translation keys in `messages/*.json`.

## Testing Guidelines
- No unit test framework present. Validate manually:
  - Run `npm run build` and confirm no TypeScript or build errors.
  - Run via `./local.sh` and verify nav, dark mode, animations, i18n switching, and blog rendering.
  - Health check: `curl http://localhost:3004/api/health` should return healthy.
- Optional: run a Lighthouse audit; add E2E later (e.g., Playwright) using `data-*` hooks for selectors.

## Commit & Pull Request Guidelines
- Commits: concise, imperative summaries (e.g., "Add blog post filtering", "Fix locale redirect"). One logical change per commit.
- Branches: `feature/...`, `fix/...`, `chore/...`.
- PRs: include a clear description, linked issues, local test steps, and screenshots/GIFs for UI changes. Call out changes to Docker/next.config/Tailwind config.

## Security & Configuration Tips
- CSP and security headers are configured in `next.config.ts`. Dev mode adds `'unsafe-eval'` for HMR; production does not.
- API routes in `src/app/api/` handle server-side logic. Analytics requires `ANALYTICS_SALT` env var (32+ chars).
- SQLite databases in `data/` are gitignored — do not commit them.
- Local dev port: 3004. See README.md for full port table.
