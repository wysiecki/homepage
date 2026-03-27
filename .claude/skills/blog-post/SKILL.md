---
name: blog-post
description: Create a blog post by fetching a URL, summarizing the article, and publishing via the blog API. Usage - /blog-post <url>
user_invocable: true
---

# Create Blog Post from URL

You are creating a blog post for Martin von Wysiecki's portfolio site (wysiecki.de). Martin is a 30+ year IT veteran who writes about technology, architecture, and leadership.

## Input

The user provides a URL to an article. The URL is passed as the argument: `$ARGUMENTS`

## Steps

### 1. Fetch the article

Use WebFetch to read the article at the provided URL. Extract:
- The article title
- The main content/arguments
- The author and publication date if available
- Key topics and themes

### 2. Generate the blog post

Write a blog post (600-1000 words) that:
- Summarizes the article's key points **in Martin's own words** — do NOT copy or closely paraphrase the original
- Adds Martin's perspective as a seasoned IT professional (30+ years experience)
- Includes a clear link to the original article at the top: "Originally published at [Source Name](url)"
- Uses a conversational but professional tone
- Structures content with markdown headings (## and ###)
- Ends with a brief takeaway or call-to-action

Generate appropriate metadata:
- **title**: A compelling title (not just the original title)
- **slug**: URL-friendly version (lowercase, hyphens, no special chars)
- **description**: 1-2 sentence summary for SEO/listing (max 160 chars)
- **tags**: 2-4 relevant tags (lowercase)
- **source_url**: The original article URL

### 3. Show for review

Present the complete post to the user with:
- The generated title and metadata
- The full markdown content
- Ask if they want to edit anything before saving

### 4. Save via API

After the user approves (or edits), create the post via the blog API:

```bash
curl -s -X POST http://localhost:3004/api/blog \
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

### 5. Offer to publish

After creating the draft, ask the user if they want to publish it immediately:

```bash
curl -s -X PATCH http://localhost:3004/api/blog/{slug}/publish \
  -H "Authorization: Bearer $BLOG_API_KEY"
```

Report the result: draft URL or published URL.

## Important

- NEVER reproduce large chunks of the original article — always rewrite in your own words
- Always link back to the original source
- The tone should match Martin's voice: experienced, pragmatic, slightly opinionated
- If the API is not reachable, fall back to writing the markdown file to `src/blog/posts/` with proper frontmatter
