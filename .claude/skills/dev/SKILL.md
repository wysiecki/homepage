---
name: dev
description: Start the local development environment — installs deps if needed, starts Tailwind watcher and local server
---

Start the local development environment with build, serve, and log analysis.

## 1. Install dependencies (if needed)
Check if `node_modules` exists. If not:
```bash
npm install
```

## 2. Run initial build
Build the site (partials + blog + sitemap + CSS):
```bash
npm run build
```
Copy CSS to the build directory so it's servable:
```bash
mkdir -p build/dist && cp dist/output.css build/dist/output.css
```

## 3. Start Tailwind CSS watcher
Run in background:
```bash
npm run dev
```
This watches for changes and rebuilds `dist/output.css`. After each rebuild, CSS needs to be copied to `build/dist/`.

## 4. Start local server
Serve the built site from `build/` directory on port 3004:
```bash
cd build && python3 -m http.server 3004
```
Run this in the background. Site is available at http://localhost:3004

## 5. Verify all pages load
Run HTTP status checks against all major routes:
```bash
for path in "/" "/tools/" "/ai/" "/blog/" "/quiz/" "/tools/json-formatter.html" "/sitemap.xml"; do
  code=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" "http://localhost:3004${path}")
  echo "$code $path"
done
```
Report any non-200 status codes.

## 6. Report to user
Tell the user:
- Both processes are running (Tailwind watcher + HTTP server)
- Site URL: http://localhost:3004
- Available sections: Home, Tools (6), AI Radar, Blog, Quiz
- Note: After editing source files, re-run `node scripts/build.js` to rebuild pages, then refresh browser
- To stop: kill the background processes

## 7. Log analysis (if requested)
If the user mentions logs or errors:
- Check the Python server output for HTTP request logs (404s, 500s)
- Check browser console errors by asking user to open DevTools
- Check Tailwind watcher output for CSS build errors
- If Docker is running: `docker compose logs -f homepage` for nginx logs, `docker compose logs -f api` for API logs
