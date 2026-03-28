---
name: blog-post
description: Create a blog post by fetching a URL, summarizing the article, and publishing via the blog API. Generates EN, DE, and PL versions. Usage - /blog-post <url>
user_invocable: true
---

# Create Blog Post from URL

You are creating a blog post for Martin von Wysiecki's portfolio site (wysiecki.de). Martin is a 30+ year IT veteran who writes about technology, architecture, and leadership.

The site supports 3 languages: English (default at `/`), German (`/de/`), Polish (`/pl/`). Every blog post must be created in all 3 languages.

## Input

The user provides a URL to an article. The URL is passed as the argument: `$ARGUMENTS`

## EU Copyright Compliance (MANDATORY)

This skill generates original commentary, NOT reproductions. Every post must comply with EU copyright law (Directive 2019/790, German UrhG):

### What is legally required
- **Original work**: The blog post must be Martin's own analysis, opinion, and commentary. It must NOT be a rewrite or paraphrase of the source article.
- **Source attribution**: Always link to the original article with author name, publication name, and URL.
- **No reproduction**: NEVER reproduce, closely paraphrase, or reword passages from the source. Extract only the factual claims (facts are not copyrightable), then write entirely new text around them.
- **No displacive summaries**: The post must NOT serve as a substitute for reading the original. A reader should still want/need to visit the source for the full picture.
- **Quotes**: Maximum ONE short quote (under 15 words) per post, in quotation marks, with clear attribution. Never quote entire sentences or paragraphs.
- **Title**: Must be a completely original title — never reuse or closely mirror the source article's headline.

### How to write the post
1. Read the source and identify 2-4 key factual claims or developments
2. Close the source mentally — write Martin's reaction, perspective, and analysis from scratch
3. The post should be 60%+ Martin's own opinion/experience, 40% or less factual summary
4. Add value the source doesn't have: industry context, historical parallels, practical implications
5. End with Martin's own takeaway — not a summary of the article

### Self-check before presenting to user
Before showing the draft, verify:
- [ ] No sentence closely mirrors a sentence from the source
- [ ] No paragraph could replace reading the original article
- [ ] The post adds substantial original perspective
- [ ] Source is clearly attributed with link, author, and publication name
- [ ] Title is original, not derived from the source headline

## Steps

### 1. Fetch the article

Use WebFetch to read the article at the provided URL. Extract:
- The article title and author/publication
- The key factual claims and developments (NOT the author's phrasing)
- Publication date if available
- The 2-4 most noteworthy points worth commenting on

### 2. Generate the blog post (English)

Write an original blog post (400-800 words) that:
- Opens with a link to the source: "I came across [an article by Author at Publication](url) about [topic]." or similar natural phrasing
- Discusses 2-4 key points from the article using **Martin's own words and analysis**
- Adds Martin's perspective as a 30+ year IT veteran — this is the core value of the post
- Draws on real-world experience: industry patterns, historical parallels, practical implications
- Uses a conversational but professional tone
- Structures content with markdown headings (## and ###)
- Ends with Martin's own takeaway or call-to-action
- Is clearly opinion/commentary, not reportage

Generate appropriate metadata:
- **title**: An original, compelling title reflecting Martin's angle (NOT the source headline)
- **slug**: URL-friendly version (lowercase, hyphens, no special chars)
- **description**: 1-2 sentence summary of Martin's take (max 160 chars)
- **tags**: 2-4 relevant tags (lowercase)
- **source_url**: The original article URL

### 3. Generate German and Polish translations

Translate the English blog post content into:
- **German (DE)**: Natural, professional German. Translate the full markdown content, title, and description. Keep technical terms that are commonly used in English in the German IT industry (e.g., "Full-Stack", "API", "DevOps"). Translate the source attribution line naturally.
- **Polish (PL)**: Natural, professional Polish. Same guidelines as German.

For each translation, generate:
- **title_de / title_pl**: Translated title
- **description_de / description_pl**: Translated description (max 160 chars)
- The full translated markdown content

### 4. Show for review

Present the complete post to the user with:
- The English version: title, metadata, and full markdown content
- The German title and first paragraph (to verify translation quality)
- The Polish title and first paragraph (to verify translation quality)
- A brief copyright compliance note confirming: original title, no reproduced passages, source attributed
- Ask if they want to edit anything before saving

### 5. Save via API (English version)

After the user approves (or edits), create the English post via the blog API:

```bash
curl -s -X POST http://localhost:8002/api/blog \
  -H "Authorization: Bearer $BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "...",
    "slug": "...",
    "description": "...",
    "content": "...",
    "tags": [...],
    "source_url": "...",
    "status": "draft"
  }'
```

Read the `BLOG_API_KEY` from the environment variable. If not set, ask the user for it.

### 6. Save German and Polish versions as static files

The DE/PL blog posts are saved as compiled HTML files directly into the source pages directory. The build system will copy them to the build output.

For each language (DE and PL), create the blog post HTML file by:

1. Read the post template from `src/pages/blog/post-template.html`
2. Fill in the template variables with the translated content:
   - `{{TITLE}}` → translated title
   - `{{DESCRIPTION}}` → translated description
   - `{{SLUG}}` → same slug as English (shared across languages)
   - `{{DATE_ISO}}` → ISO date string
   - `{{DATE_DISPLAY}}` → formatted date in target language (German: `toLocaleDateString('de-DE', ...)`, Polish: `toLocaleDateString('pl-PL', ...)`)
   - `{{READING_TIME}}` → calculated reading time
   - `{{TAGS_HTML}}` → same tags HTML
   - `{{CONTENT}}` → translated content compiled from markdown to HTML
3. Replace the language-specific chrome:
   - Change `lang="en"` to `lang="de"` or `lang="pl"`
   - Update canonical URL: `https://wysiecki.de/de/blog/{{SLUG}}/` or `/pl/blog/...`
   - Update og:url similarly
   - Update breadcrumb: "Home" → "Startseite" (DE) / "Strona główna" (PL), "Blog" stays "Blog"
   - Update "min read" → "Min. Lesezeit" (DE) / "min czytania" (PL)
   - Update "Back to all posts" → "Zurück zu allen Beiträgen" (DE) / "Wróć do wszystkich wpisów" (PL)
   - Update breadcrumb links: `href="/"` → `href="/de/"` (DE) / `href="/pl/"` (PL), `href="/blog/"` → `href="/de/blog/"` / `href="/pl/blog/"`
   - Update "Back to blog" link: `href="/blog/"` → `href="/de/blog/"` / `href="/pl/blog/"`
4. Replace `<!-- PARTIAL:nav -->` with the content of `src/partials/nav-de.html` (DE) or `src/partials/nav-pl.html` (PL)
5. Replace `<!-- PARTIAL:footer -->` with the content of `src/partials/footer-de.html` (DE) or `src/partials/footer-pl.html` (PL)
6. Replace `<!-- PARTIAL:head -->` with the content of `src/partials/head.html`

Write the files to:
- `src/pages/de/blog/{slug}/index.html`
- `src/pages/pl/blog/{slug}/index.html`

Then rebuild the site:
```bash
npm run build
```

### 7. Offer to publish

After creating the draft, ask the user if they want to publish it immediately:

```bash
curl -s -X PATCH http://localhost:8002/api/blog/{slug}/publish \
  -H "Authorization: Bearer $BLOG_API_KEY"
```

After publishing, rebuild the site so the DE/PL versions are included in the build output:
```bash
npm run build
```

Report the result: draft URL or published URL, plus the DE/PL URLs.

## Important

- **COPYRIGHT**: Never reproduce, closely paraphrase, or reword the source. Write original commentary only. This is a legal requirement under EU/German copyright law, not a style preference.
- **ATTRIBUTION**: Every post must link to the source with author name and publication.
- **NO DISPLACEMENT**: The post must not serve as a substitute for reading the original article.
- **QUOTES**: Maximum one short quote (<15 words) per post, in quotation marks with attribution.
- **VOICE**: Match Martin's tone — experienced, pragmatic, slightly opinionated. The post should read like Martin's blog, not like a news aggregator.
- **3 LANGUAGES**: Every blog post MUST be created in EN, DE, and PL. The English version goes through the API. The DE and PL versions are written as static HTML files.
- **API FALLBACK**: If the API is not reachable, fall back to writing the markdown file to `src/blog/posts/` with proper frontmatter, plus the DE/PL HTML files as described above.
- **PRODUCTION API**: For production deploys, use `https://wysiecki.de/api/blog` with `BLOG_API_KEY` from env. For local testing, use `http://localhost:8002/api/blog`.
- **REBUILD**: Always run `npm run build` after creating posts so DE/PL versions appear in the build output.
