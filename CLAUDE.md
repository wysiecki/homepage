# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern portfolio homepage for Martin von Wysiecki — Next.js 15 App Router with TypeScript, Tailwind CSS v4, and next-intl (EN/DE/PL), deployed via Docker.

## Essential Commands

```bash
# Local dev (recommended — kills stale process, sets env vars, port 3004)
./local.sh

# Dev server (default port 3004)
npm run dev

# Production build
npm run build

# Lint & format
npm run lint          # ESLint
npm run format        # Prettier on all source files
npm run format:check  # Check without writing

# Docker: build + serve
docker compose build && docker compose up -d

# Health check
curl http://localhost:3004/api/health
```

## Important Configuration Notes

- CSP adds `'unsafe-eval'` in dev mode only (required for Next.js HMR)
- Tailwind v4 uses CSS-first config in `src/styles/globals.css` with `@theme` and `@layer` blocks
- Custom component CSS MUST be inside `@layer components` to avoid tree-shaking
- i18n: `localePrefix: 'as-needed'` — EN has no prefix, DE/PL get `/de/`, `/pl/`
- Blog posts are MDX files in `content/blog/`
- API routes at `src/app/api/` — analytics needs `ANALYTICS_SALT` env var (32+ chars)
- SQLite DBs stored in `data/` directory (gitignored)
- Dark mode only (`class="dark"` on html)

## Documentation Lookups

When working with any library, framework, or tool (Next.js, Tailwind CSS, next-intl, TypeScript, Docker, etc.), always use the Context7 MCP (`mcp__plugin_context7_context7__resolve-library-id` → `mcp__plugin_context7_context7__query-docs`) to fetch current documentation before relying on training data. This ensures you use the latest API syntax and avoid deprecated patterns.

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
