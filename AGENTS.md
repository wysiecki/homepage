# Repository Guidelines

## Project Structure & Module Organization
- Static site built with Tailwind CSS and vanilla JS, served by Nginx in Docker.
- Key paths:
  - `index.html` (markup), `script.js` (interactions)
  - `src/input.css` (Tailwind source) → `dist/output.css` (generated)
  - `tailwind.config.js`, `Dockerfile`, `docker-compose.yml`, `nginx.conf`
- Do not edit files in `dist/` directly; rebuild CSS instead.

## Build, Test, and Development Commands
- `npm install`: install Node dev dependencies (Tailwind).
- `npm run dev`: watch Tailwind and write `dist/output.css`.
- `npm run build`: compile and minify CSS for production.
- `docker-compose up -d`: build and serve via Nginx (behind Traefik in production).
- `docker-compose --profile dev up`: dev mode (Nginx + Tailwind watcher). For live reload, uncomment the volume mounts in `docker-compose.yml` (`index.html`, `script.js`, `dist/`).
- `docker-compose logs -f homepage`: follow server logs.

## Coding Style & Naming Conventions
- JavaScript: 2-space indent, semicolons, `const`/`let` (no `var`), camelCase for variables and functions. Keep DOM selectors and data attributes descriptive (e.g., `.project-card`, `data-filter`).
- Tailwind: prefer utilities over custom CSS; place shared styles in `@layer components`/`utilities` within `src/input.css` (e.g., `.glass-effect`, `.btn-primary`).
- HTML: semantic elements, organized Tailwind classes; keep dark mode toggling via `html.dark` consistent with `tailwind.config.js` (`darkMode: 'class'`).

## Testing Guidelines
- No unit test framework present. Validate manually:
  - Build CSS (`npm run build`) and confirm styles load.
  - Run via Docker and verify nav highlighting, dark mode toggle, animations, and project filtering.
  - Health check: `curl http://localhost:3004/health` should return `healthy`.
- Optional: run a Lighthouse audit; add E2E later (e.g., Playwright) using `data-*` hooks for selectors.

## Commit & Pull Request Guidelines
- Commits: concise, imperative summaries (e.g., "Update hero animations", "Remove particle background animation"). One logical change per commit.
- Branches: `feature/...`, `fix/...`, `chore/...`.
- PRs: include a clear description, linked issues, local test steps, and screenshots/GIFs for UI changes. Call out changes to Docker/Nginx/Tailwind config.

## Security & Configuration Tips
- CSP and security headers are set in `nginx.conf`. Keep scripts in `script.js`; if adding inline scripts/styles, update CSP accordingly.
- Do not commit generated assets in `dist/`; they are built locally and in the Docker image.
- Local dev ports: 3004 (static server), 8002 (API). See README.md for full port table.
