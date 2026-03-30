---
name: verify
description: End-to-end validation — builds project, tests routes, checks CSS, prints manual test checklist
---

Run the following verification steps in order. Stop and report if any step fails.

## 1. Production build
```bash
npm run build
```
Confirm build completes with no errors.

## 2. Start dev server
```bash
./local.sh &
sleep 10
```

## 3. Verify all pages load
```bash
for path in "/" "/tools" "/tools/json-formatter" "/tools/base64" "/tools/regex-tester" "/tools/cron-explainer" "/tools/jwt-decoder" "/tools/color-converter" "/ai" "/blog" "/quiz" "/impressum" "/datenschutz" "/sitemap.xml" "/feed.xml"; do
  code=$(/usr/bin/curl -s --max-time 60 -o /dev/null -w "%{http_code}" "http://localhost:3004${path}")
  echo "$code $path"
done
```
All should return 200 or 301.

## 4. Verify i18n
```bash
for path in "/de" "/de/tools" "/de/blog" "/pl" "/pl/tools" "/pl/blog"; do
  code=$(/usr/bin/curl -s --max-time 30 -o /dev/null -w "%{http_code}" "http://localhost:3004${path}")
  echo "$code $path"
done
```

## 5. Verify API
```bash
/usr/bin/curl -s http://localhost:3004/api/health
/usr/bin/curl -s http://localhost:3004/api/config
```
Health should return `{"status":"ok"}`. Config should return `{"turnstileSiteKey":""}`.

## 6. Check CSS includes custom classes
```bash
/usr/bin/curl -s http://localhost:3004/_next/static/css/app/layout.css | grep -c 'reveal'
```
Should return > 0. If 0, the `@layer components` block in `globals.css` is broken.

## 7. Check security headers
```bash
/usr/bin/curl -sI http://localhost:3004/ | grep -i -E "(x-frame|x-content|csp|referrer)"
```
Verify all security headers are present.

## 8. Manual test checklist
Print this checklist for the user:
- [ ] Homepage: hero animation, typewriter, code snippets visible
- [ ] Services section: 3 cards with stagger animation
- [ ] About section: terminal display with stats
- [ ] Contact form: validates and shows Turnstile captcha
- [ ] Tools: all 6 tools load and function correctly
- [ ] AI Radar: tabs switch and load content from APIs
- [ ] Blog: listing shows posts, individual post renders MDX
- [ ] Quiz: 5 questions flow, result shows stack recommendation
- [ ] Language switcher: EN/DE/PL all render correctly
- [ ] Mobile: hamburger menu works, layout responsive
- [ ] Grain overlay effect visible on all pages

## 9. Cleanup
Kill the dev server process.
