---
name: verify
description: End-to-end validation — builds CSS, builds Docker image, runs health check, and prints manual test checklist
---

Run the following verification steps in order. Stop and report if any step fails.

## 1. Build site + CSS
```bash
npm run build
```
Confirm `dist/output.css` exists and is non-empty.
Confirm `build/` directory has all expected HTML files.

## 2. Build Docker image
```bash
docker compose build
```

## 3. Start container
```bash
docker compose up -d
```
Wait a few seconds for the container to be healthy.

## 4. Health check
```bash
/usr/bin/curl -sf http://localhost:3004/health
```
Expected: `healthy`

## 5. Verify all pages load
```bash
for path in "/" "/tools/" "/tools/json-formatter.html" "/tools/base64.html" "/tools/regex-tester.html" "/tools/cron-explainer.html" "/tools/jwt-decoder.html" "/tools/color-converter.html" "/ai/" "/blog/" "/blog/architecture-decisions/" "/quiz/" "/impressum.html" "/datenschutz.html" "/sitemap.xml" "/feed.xml" "/robots.txt"; do
  code=$(/usr/bin/curl -s -o /dev/null -w "%{http_code}" "http://localhost:3004${path}")
  echo "$code $path"
done
```
All should return 200.

## 6. Verify API proxy
```bash
/usr/bin/curl -sf http://localhost:3004/api/health
```
Expected: JSON with `{"status":"ok"}`

## 7. Check security headers
```bash
/usr/bin/curl -sI http://localhost:3004/ | grep -i -E "(x-frame|x-content|csp|referrer)"
```
Verify all security headers are present.

## 8. Manual test checklist
Print this checklist for the user to verify interactively:
- [ ] Homepage loads with nav links to Tools, AI Radar, Blog, Quiz
- [ ] Mobile hamburger menu opens and shows all sections
- [ ] Smooth scroll navigation with active link highlighting
- [ ] Typewriter effect animates in hero section
- [ ] Contact form validates and shows captcha
- [ ] Tools: JSON Formatter formats/validates JSON correctly
- [ ] Tools: Base64 encodes/decodes with UTF-8
- [ ] Tools: Regex Tester highlights matches live
- [ ] Tools: Cron Explainer shows human-readable output + next runs
- [ ] Tools: JWT Decoder splits and decodes tokens
- [ ] Tools: Color Converter syncs HEX/RGB/HSL fields
- [ ] AI Radar: tabs switch and load content from APIs
- [ ] Blog: listing page shows post, post page renders markdown
- [ ] Quiz: 5 questions flow, result shows stack recommendation
- [ ] Quiz: Share button copies result text
- [ ] Sub-page nav shows active state for current section
- [ ] Footer links to Impressum/Datenschutz work
- [ ] Dark mode consistent across all pages

## 9. Cleanup
```bash
docker compose down
```
