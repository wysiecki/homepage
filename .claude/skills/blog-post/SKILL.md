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

### 5. Save as MDX file

After the user approves (or edits), save the English blog post as an MDX file:

Write the file to `content/blog/{slug}.mdx` with this format:

```mdx
---
title: "The post title"
slug: the-post-slug
date: 2026-03-28
description: "1-2 sentence description"
tags:
  - tag1
  - tag2
source_url: https://original-article-url.com
---

The markdown content goes here...
```

The Next.js dev server picks up new MDX files immediately — no build or API call needed.

Note: DE/PL translations are handled automatically by next-intl. The blog content itself is in English only (matching the original site behavior). The page chrome (headings, labels, navigation) switches language via the translation JSON files.

### 6. Offer to publish

After saving, tell the user:
- The post is live in dev mode at `http://localhost:3004/blog/{slug}`
- For production: commit the MDX file and deploy (the post will be statically generated at build time)
- All 3 language versions are available: `/blog/{slug}`, `/de/blog/{slug}`, `/pl/blog/{slug}`

Report the dev URL for the user to preview.

## Important

- **COPYRIGHT**: Never reproduce, closely paraphrase, or reword the source. Write original commentary only. This is a legal requirement under EU/German copyright law, not a style preference.
- **ATTRIBUTION**: Every post must link to the source with author name and publication.
- **NO DISPLACEMENT**: The post must not serve as a substitute for reading the original article.
- **QUOTES**: Maximum one short quote (<15 words) per post, in quotation marks with attribution.
- **VOICE**: Match Martin's tone — experienced, pragmatic, slightly opinionated. The post should read like Martin's blog, not like a news aggregator.
- **MDX FILE**: Save English blog post as `content/blog/{slug}.mdx`. Next.js picks it up automatically — no API call or rebuild needed in dev.
- **I18N**: Page chrome (nav, labels, "min read", etc.) is translated via next-intl. Blog content is English only.
- **PRODUCTION**: Commit the MDX file and deploy. The post is statically generated at build time via `generateStaticParams`.
