# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern portfolio homepage for Martin von Wysiecki — static site (vanilla JS + Tailwind CSS v3), deployed via Docker/nginx.

## Essential Commands

```bash
# Build CSS (required before serving — dist/output.css is gitignored)
npm run build

# Lint & format
npm run lint          # ESLint on *.js
npm run format        # Prettier on all source files
npm run format:check  # Check without writing

# Docker: build + serve at http://localhost:8080
docker compose build && docker compose up -d

# Docker dev mode (nginx + Tailwind watcher)
# First uncomment volumes in docker-compose.yml
docker compose --profile dev up

# Local dev: Tailwind watch + static server
npm run dev
python3 -m http.server 8000

# Health check
curl http://localhost:8080/health
```

## Important Configuration Notes

- `dist/output.css` is generated and gitignored — always rebuild CSS after editing HTML/JS/CSS
- CSP is `script-src 'self'` — no inline scripts allowed, all JS goes in `script.js`
- nginx `add_header` in nested `location` blocks replaces parent headers (security headers must be re-declared)
- Port 8080 (configurable in docker-compose.yml), 404 for unknown paths (no SPA fallback)
- Dark mode: `html.dark` class strategy, persisted via `localStorage` key `theme-v2`

## Coding Style & Conventions

@AGENTS.md

## Design-Regeln
- Nutze das AskUserQuestion Tool, um den Nutzer über das Websitedesign zu interviewen, damit du die Vorstellungen des Nutzers genau abbilden kannst
- Nutze den frontend-design Skill für alle UI-Entscheidungen
- Nutze UI/UX Pro Max für Design-System-Generierung
- Nutze ggf. 21st.dev für Component-Inspiration (falls vorgegeben)
- Keine generischen AI-Aesthetics
- Bold, distinctive Design-Choices
- Performance-optimiert (Core Web Vitals)