---
name: dev
description: Start the local development environment — Next.js dev server on port 3004
---

Start the local development environment.

## 1. Install dependencies (if needed)
Check if `node_modules` exists. If not:
```bash
npm install
```

## 2. Start dev server
Run the local startup script (kills stale process on port 3004, sets env vars, starts Next.js):
```bash
./local.sh
```

This sets: `BLOG_DB_PATH`, `BLOG_API_KEY`

Site is available at http://localhost:3004

Note: First page load triggers compilation (~10-15s), subsequent loads are fast.

## 3. Verify
```bash
for path in "/" "/tools" "/ai" "/blog" "/quiz" "/api/health"; do
  code=$(/usr/bin/curl -s --max-time 60 -o /dev/null -w "%{http_code}" "http://localhost:3004${path}")
  echo "$code $path"
done
```
All should return 200 (or 301 for trailing slash redirects).

## 4. Report to user
Tell the user:
- Dev server running at http://localhost:3004
- Available pages: Home, Tools (6), AI Radar, Blog, Quiz
- i18n: EN (default), DE at `/de/`, PL at `/pl/`
- To stop: Ctrl+C or kill the process
- To restart after sleep/wake: `./local.sh`
