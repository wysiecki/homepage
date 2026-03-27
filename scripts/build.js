#!/usr/bin/env node

/**
 * Build script for wysiecki.de
 *
 * - Copies HTML pages from src/pages/ → build/ with partial injection
 * - Compiles blog markdown → HTML with frontmatter
 * - Copies JS from src/js/ → build/
 * - Copies assets from src/assets/ → build/assets/
 * - Generates sitemap.xml, feed.xml, and robots.txt
 */

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
  statSync,
  existsSync,
  rmSync,
} from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');
const BUILD = join(ROOT, 'build');

const DIRS = {
  pages: join(SRC, 'pages'),
  partials: join(SRC, 'partials'),
  js: join(SRC, 'js'),
  assets: join(SRC, 'assets'),
  blogPosts: join(SRC, 'blog', 'posts'),
};

const SITE_URL = 'https://wysiecki.de';

// ── Helpers ──────────────────────────────────────────────────────

function loadPartials() {
  const partials = {};
  if (!existsSync(DIRS.partials)) return partials;
  for (const file of readdirSync(DIRS.partials)) {
    if (extname(file) === '.html') {
      const name = file.replace('.html', '');
      partials[name] = readFileSync(join(DIRS.partials, file), 'utf-8');
    }
  }
  return partials;
}

function injectPartials(html, partials) {
  return html.replace(/<!--\s*PARTIAL:(\S+)\s*-->/g, (_match, name) => {
    if (partials[name]) return partials[name];
    console.warn(`  Warning: partial "${name}" not found`);
    return _match;
  });
}

function copyDirRecursive(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function processPages(srcDir, destDir, partials, skipFiles = []) {
  mkdirSync(destDir, { recursive: true });
  let count = 0;
  for (const entry of readdirSync(srcDir)) {
    if (skipFiles.includes(entry)) continue;
    const srcPath = join(srcDir, entry);
    const destPath = join(destDir, entry);
    if (statSync(srcPath).isDirectory()) {
      count += processPages(srcPath, destPath, partials, skipFiles);
    } else if (extname(entry) === '.html') {
      const content = readFileSync(srcPath, 'utf-8');
      writeFileSync(destPath, injectPartials(content, partials));
      count++;
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
  return count;
}

// ── Blog ─────────────────────────────────────────────────────────

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

function buildBlog(partials) {
  if (!existsSync(DIRS.blogPosts)) return [];

  const templatePath = join(DIRS.pages, 'blog', 'post-template.html');
  if (!existsSync(templatePath)) {
    console.warn('  Warning: blog post-template.html not found');
    return [];
  }

  const template = readFileSync(templatePath, 'utf-8');
  const posts = [];

  for (const file of readdirSync(DIRS.blogPosts)) {
    if (extname(file) !== '.md') continue;

    const raw = readFileSync(join(DIRS.blogPosts, file), 'utf-8');
    const { data: frontmatter, content: markdown } = matter(raw);

    if (!frontmatter.title || !frontmatter.slug || !frontmatter.date) {
      console.warn(
        `  Warning: skipping ${file} — missing required frontmatter (title, slug, date)`
      );
      continue;
    }

    const htmlContent = marked.parse(markdown);
    const minutes = readingTime(markdown);
    const dateISO = new Date(frontmatter.date).toISOString();
    const dateDisplay = formatDate(frontmatter.date);
    const tags = frontmatter.tags || [];
    const tagsHtml = tags.map((t) => `<span class="tag">${t}</span>`).join('\n            ');

    // Fill template
    let page = template
      .replace(/\{\{TITLE\}\}/g, frontmatter.title)
      .replace(/\{\{DESCRIPTION\}\}/g, frontmatter.description || '')
      .replace(/\{\{SLUG\}\}/g, frontmatter.slug)
      .replace(/\{\{DATE_ISO\}\}/g, dateISO)
      .replace(/\{\{DATE_DISPLAY\}\}/g, dateDisplay)
      .replace(/\{\{READING_TIME\}\}/g, String(minutes))
      .replace(/\{\{TAGS_HTML\}\}/g, tagsHtml)
      .replace(/\{\{CONTENT\}\}/g, htmlContent);

    // Inject partials
    page = injectPartials(page, partials);

    // Write to build/blog/{slug}/index.html
    const outDir = join(BUILD, 'blog', frontmatter.slug);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), page);

    posts.push({
      title: frontmatter.title,
      slug: frontmatter.slug,
      date: frontmatter.date,
      dateISO,
      dateDisplay,
      description: frontmatter.description || '',
      tags,
      readingTime: minutes,
    });
  }

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

function generateBlogListing(posts, partials) {
  const listingPath = join(DIRS.pages, 'blog', 'index.html');
  if (!existsSync(listingPath)) return;

  let listing = readFileSync(listingPath, 'utf-8');

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

  listing = listing.replace('<!-- BLOG_LISTING -->', postsHtml);
  listing = injectPartials(listing, partials);

  mkdirSync(join(BUILD, 'blog'), { recursive: true });
  writeFileSync(join(BUILD, 'blog', 'index.html'), listing);
}

function generateRssFeed(posts) {
  const items = posts
    .slice(0, 20)
    .map(
      (post) => `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${SITE_URL}/blog/${post.slug}/</link>
    <guid>${SITE_URL}/blog/${post.slug}/</guid>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <description>${escapeXml(post.description)}</description>
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

  writeFileSync(join(BUILD, 'feed.xml'), xml);
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ── Sitemap ──────────────────────────────────────────────────────

function generateSitemap(buildDir) {
  const urls = [];

  function scan(dir, prefix = '') {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (['assets', 'dist', 'tools'].includes(entry) && prefix === '') {
          // Scan tools separately but skip assets/dist
          if (entry === 'tools') scan(full, `${prefix}/${entry}`);
          continue;
        }
        scan(full, `${prefix}/${entry}`);
      } else if (entry === 'index.html') {
        const path = prefix || '';
        urls.push({ loc: `${path}/`, priority: path === '' ? '1.0' : '0.8' });
      } else if (
        extname(entry) === '.html' &&
        !['404.html', 'post-template.html'].includes(entry)
      ) {
        urls.push({ loc: `${prefix}/${entry}`, priority: '0.6' });
      }
    }
  }

  scan(buildDir);

  const today = new Date().toISOString().split('T')[0];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`
    ),
    '</urlset>',
    '',
  ].join('\n');

  writeFileSync(join(buildDir, 'sitemap.xml'), xml);
  return urls.length;
}

// ── Main ─────────────────────────────────────────────────────────

console.log('Building wysiecki.de...\n');

// Clean build directory
if (existsSync(BUILD)) {
  rmSync(BUILD, { recursive: true });
}
mkdirSync(BUILD, { recursive: true });

// 1. Load partials
const partials = loadPartials();
const partialNames = Object.keys(partials);
console.log(`Partials: ${partialNames.length ? partialNames.join(', ') : '(none)'}`);

// 2. Process HTML pages (copy + inject partials)
// Skip post-template.html — it's used by the blog builder, not served directly
const pageCount = processPages(DIRS.pages, BUILD, partials, ['post-template.html']);
console.log(`Pages: ${pageCount} processed`);

// 3. Build blog (markdown → HTML) — skip if using dynamic blog API
if (process.env.SKIP_BLOG_BUILD === '1') {
  console.log('Blog: skipped (SKIP_BLOG_BUILD=1, using dynamic API)');
} else {
  const posts = buildBlog(partials);
  if (posts.length) {
    generateBlogListing(posts, partials);
    generateRssFeed(posts);
    console.log(`Blog: ${posts.length} posts compiled`);
  }
}

// 4. Copy JS files to build root
if (existsSync(DIRS.js)) {
  copyDirRecursive(DIRS.js, BUILD);
  console.log('JS: copied');
}

// 5. Copy assets
if (existsSync(DIRS.assets)) {
  copyDirRecursive(DIRS.assets, join(BUILD, 'assets'));
  console.log('Assets: copied');
}

// 6. Copy dist/ (CSS) into build if it exists
const DIST = join(ROOT, 'dist');
if (existsSync(DIST)) {
  copyDirRecursive(DIST, join(BUILD, 'dist'));
  console.log('Dist: copied');
}

// 8. Generate sitemap.xml
const urlCount = generateSitemap(BUILD);
console.log(`Sitemap: ${urlCount} URLs`);

// 9. Generate robots.txt
writeFileSync(
  join(BUILD, 'robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`
);
console.log('robots.txt: generated');

console.log('\nBuild complete!');
