const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const TEMPLATES_DIR = process.env.BLOG_TEMPLATES_DIR || path.join(__dirname, 'templates');
const HTML_DIR = process.env.BLOG_HTML_DIR || path.join(__dirname, '..', 'build');
const SITE_URL = 'https://wysiecki.de';

// ── Template helpers (mirrors scripts/build.js) ─────────────────

let partials = null;
let postTemplate = null;
let listingTemplate = null;

function loadTemplates() {
  if (partials) return;
  partials = {};
  const partialsDir = path.join(TEMPLATES_DIR, 'partials');
  if (fs.existsSync(partialsDir)) {
    for (const file of fs.readdirSync(partialsDir)) {
      if (path.extname(file) === '.html') {
        partials[file.replace('.html', '')] = fs.readFileSync(
          path.join(partialsDir, file),
          'utf-8'
        );
      }
    }
  }
  const postTemplatePath = path.join(TEMPLATES_DIR, 'post-template.html');
  if (fs.existsSync(postTemplatePath)) {
    postTemplate = fs.readFileSync(postTemplatePath, 'utf-8');
  }
  const listingPath = path.join(TEMPLATES_DIR, 'blog-index.html');
  if (fs.existsSync(listingPath)) {
    listingTemplate = fs.readFileSync(listingPath, 'utf-8');
  }
}

function injectPartials(html) {
  return html.replace(/<!--\s*PARTIAL:(\S+)\s*-->/g, (_match, name) => {
    if (partials[name]) return partials[name];
    console.warn(`  Warning: partial "${name}" not found`);
    return _match;
  });
}

function readingTime(text) {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ── Render a single post to HTML ────────────────────────────────

function renderPost(post) {
  loadTemplates();
  if (!postTemplate) {
    console.error('[RENDERER] post-template.html not found in', TEMPLATES_DIR);
    return;
  }

  const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags || [];
  const htmlContent = marked.parse(post.content);
  const minutes = readingTime(post.content);
  const dateISO = new Date(post.published_at || post.created_at).toISOString();
  const dateDisplay = formatDate(post.published_at || post.created_at);
  const tagsHtml = tags.map((t) => `<span class="tag">${t}</span>`).join('\n            ');

  let page = postTemplate
    .replace(/\{\{TITLE\}\}/g, post.title)
    .replace(/\{\{DESCRIPTION\}\}/g, post.description || '')
    .replace(/\{\{SLUG\}\}/g, post.slug)
    .replace(/\{\{DATE_ISO\}\}/g, dateISO)
    .replace(/\{\{DATE_DISPLAY\}\}/g, dateDisplay)
    .replace(/\{\{READING_TIME\}\}/g, String(minutes))
    .replace(/\{\{TAGS_HTML\}\}/g, tagsHtml)
    .replace(/\{\{CONTENT\}\}/g, htmlContent);

  page = injectPartials(page);

  const outDir = path.join(HTML_DIR, 'blog', post.slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), page);
  console.log(`[RENDERER] Wrote blog/${post.slug}/index.html`);
}

// ── Remove a post's static HTML ─────────────────────────────────

function removePost(slug) {
  const postDir = path.join(HTML_DIR, 'blog', slug);
  if (fs.existsSync(postDir)) {
    fs.rmSync(postDir, { recursive: true });
    console.log(`[RENDERER] Removed blog/${slug}/`);
  }
}

// ── Regenerate blog listing page ────────────────────────────────

function renderListing(publishedPosts) {
  loadTemplates();
  if (!listingTemplate) {
    console.error('[RENDERER] blog-index.html not found in', TEMPLATES_DIR);
    return;
  }

  const posts = publishedPosts
    .map((p) => {
      const tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags || [];
      const dateISO = new Date(p.published_at || p.created_at).toISOString();
      const dateDisplay = formatDate(p.published_at || p.created_at);
      const minutes = readingTime(p.content);
      return { ...p, tags, dateISO, dateDisplay, readingTime: minutes };
    })
    .sort(
      (a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)
    );

  const postsHtml = posts.length
    ? posts
        .map(
          (post) => `
          <a href="/blog/${post.slug}/" class="card p-6 block group hover:border-primary-container/30 transition-colors">
            <div class="flex flex-wrap items-center gap-2 mb-3">
              ${post.tags.map((t) => `<span class="tag text-[10px]">${t}</span>`).join('')}
            </div>
            <h2 class="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              ${post.title}
            </h2>
            <p class="text-on-surface/40 text-sm mb-3">${post.description}</p>
            <div class="flex items-center gap-3 text-xs font-mono text-on-surface/30">
              <time datetime="${post.dateISO}">${post.dateDisplay}</time>
              <span>&middot;</span>
              <span>${post.readingTime} min read</span>
            </div>
          </a>`
        )
        .join('')
    : '<p class="text-on-surface/40 text-center py-12">No posts yet. Check back soon!</p>';

  let listing = listingTemplate.replace('<!-- BLOG_LISTING -->', postsHtml);
  listing = injectPartials(listing);

  const blogDir = path.join(HTML_DIR, 'blog');
  fs.mkdirSync(blogDir, { recursive: true });
  fs.writeFileSync(path.join(blogDir, 'index.html'), listing);
  console.log(`[RENDERER] Wrote blog/index.html (${posts.length} posts)`);
}

// ── Regenerate RSS feed ─────────────────────────────────────────

function renderFeed(publishedPosts) {
  const posts = publishedPosts
    .sort(
      (a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)
    )
    .slice(0, 20);

  const items = posts
    .map(
      (post) => `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${SITE_URL}/blog/${post.slug}/</link>
    <guid>${SITE_URL}/blog/${post.slug}/</guid>
    <pubDate>${new Date(post.published_at || post.created_at).toUTCString()}</pubDate>
    <description>${escapeXml(post.description || '')}</description>
  </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Martin von Wysiecki — Blog</title>
  <link>${SITE_URL}/blog/</link>
  <description>IT insights and tech leadership from 30+ years of building software.</description>
  <language>en</language>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`;

  fs.mkdirSync(HTML_DIR, { recursive: true });
  fs.writeFileSync(path.join(HTML_DIR, 'feed.xml'), xml);
  console.log(`[RENDERER] Wrote feed.xml (${posts.length} items)`);
}

// ── High-level: publish/unpublish with full regeneration ────────

function publishPost(post, allPublishedPosts) {
  renderPost(post);
  renderListing(allPublishedPosts);
  renderFeed(allPublishedPosts);
}

function unpublishPost(slug, allPublishedPosts) {
  removePost(slug);
  renderListing(allPublishedPosts);
  renderFeed(allPublishedPosts);
}

/** Force-reload templates from disk (useful after deploy). */
function reloadTemplates() {
  partials = null;
  postTemplate = null;
  listingTemplate = null;
}

module.exports = {
  renderPost,
  removePost,
  renderListing,
  renderFeed,
  publishPost,
  unpublishPost,
  reloadTemplates,
};
