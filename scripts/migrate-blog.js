#!/usr/bin/env node

/**
 * One-time migration: import existing markdown blog posts into the SQLite database.
 *
 * Usage:
 *   BLOG_DB_PATH=./server/data/blog.db node scripts/migrate-blog.js
 */

const { readFileSync, readdirSync, existsSync } = require('fs');
const { join, extname } = require('path');
const matter = require('gray-matter');

const ROOT = join(__dirname, '..');
const POSTS_DIR = join(ROOT, 'src', 'blog', 'posts');

const dbPath = process.env.BLOG_DB_PATH || join(ROOT, 'server', 'data', 'blog.db');
process.env.BLOG_DB_PATH = dbPath;

const db = require(join(ROOT, 'server', 'db.js'));

console.log(`Migrating blog posts from ${POSTS_DIR} → ${dbPath}\n`);

if (!existsSync(POSTS_DIR)) {
  console.log('No posts directory found. Nothing to migrate.');
  process.exit(0);
}

const files = readdirSync(POSTS_DIR).filter((f) => extname(f) === '.md');

if (!files.length) {
  console.log('No markdown files found. Nothing to migrate.');
  process.exit(0);
}

let migrated = 0;
let skipped = 0;

for (const file of files) {
  const raw = readFileSync(join(POSTS_DIR, file), 'utf-8');
  const { data: frontmatter, content } = matter(raw);

  if (!frontmatter.title || !frontmatter.slug || !frontmatter.date) {
    console.warn(`  SKIP ${file} — missing required frontmatter (title, slug, date)`);
    skipped++;
    continue;
  }

  const existing = db.getPostBySlug(frontmatter.slug);
  if (existing) {
    console.log(`  SKIP ${frontmatter.slug} — already exists in database`);
    skipped++;
    continue;
  }

  const publishedAt = new Date(frontmatter.date).toISOString();

  db.createPost({
    slug: frontmatter.slug,
    title: frontmatter.title,
    description: frontmatter.description || '',
    content: content.trim(),
    tags: frontmatter.tags || [],
    status: 'published',
    source_url: frontmatter.source_url || '',
  });

  // Fix published_at to match the original frontmatter date
  const d = db.getDb();
  d.prepare('UPDATE posts SET published_at = ?, created_at = ? WHERE slug = ?').run(
    publishedAt,
    publishedAt,
    frontmatter.slug
  );

  console.log(`  OK   ${frontmatter.slug} (${frontmatter.title})`);
  migrated++;
}

console.log(`\nDone: ${migrated} migrated, ${skipped} skipped.`);
