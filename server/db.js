const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.BLOG_DB_PATH || path.join(__dirname, 'data', 'blog.db');

let db;

function getDb() {
  if (!db) {
    const { mkdirSync } = require('fs');
    mkdirSync(path.dirname(DB_PATH), { recursive: true });

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    migrate();
  }
  return db;
}

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      slug         TEXT    NOT NULL UNIQUE,
      title        TEXT    NOT NULL,
      description  TEXT    NOT NULL DEFAULT '',
      content      TEXT    NOT NULL,
      tags         TEXT    NOT NULL DEFAULT '[]',
      status       TEXT    NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
      source_url   TEXT    DEFAULT '',
      created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      published_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    CREATE INDEX IF NOT EXISTS idx_posts_slug   ON posts(slug);
  `);
}

// ── Query helpers ────────────────────────────────────────────────

function getAllPosts(status) {
  const d = getDb();
  if (status) {
    return d
      .prepare(
        'SELECT * FROM posts WHERE status = ? ORDER BY COALESCE(published_at, created_at) DESC'
      )
      .all(status);
  }
  return d.prepare('SELECT * FROM posts ORDER BY COALESCE(published_at, created_at) DESC').all();
}

function getPostBySlug(slug) {
  return getDb().prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
}

function createPost({ slug, title, description, content, tags, status, source_url }) {
  const d = getDb();
  const now = new Date().toISOString();
  const publishedAt = status === 'published' ? now : null;

  const stmt = d.prepare(`
    INSERT INTO posts (slug, title, description, content, tags, status, source_url, created_at, updated_at, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    slug,
    title,
    description || '',
    content,
    JSON.stringify(tags || []),
    status || 'draft',
    source_url || '',
    now,
    now,
    publishedAt
  );

  return getDb().prepare('SELECT * FROM posts WHERE id = ?').get(info.lastInsertRowid);
}

function updatePost(slug, fields) {
  const d = getDb();
  const existing = d.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updates = {
    title: fields.title ?? existing.title,
    description: fields.description ?? existing.description,
    content: fields.content ?? existing.content,
    tags: fields.tags ? JSON.stringify(fields.tags) : existing.tags,
    source_url: fields.source_url ?? existing.source_url,
    updated_at: now,
  };

  // Allow slug change
  const newSlug = fields.slug ?? slug;

  d.prepare(
    `
    UPDATE posts SET slug = ?, title = ?, description = ?, content = ?, tags = ?,
      source_url = ?, updated_at = ?
    WHERE slug = ?
  `
  ).run(
    newSlug,
    updates.title,
    updates.description,
    updates.content,
    updates.tags,
    updates.source_url,
    updates.updated_at,
    slug
  );

  return d.prepare('SELECT * FROM posts WHERE slug = ?').get(newSlug);
}

function setStatus(slug, status) {
  const d = getDb();
  const post = d.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
  if (!post) return null;

  const now = new Date().toISOString();
  const publishedAt = status === 'published' && !post.published_at ? now : post.published_at;

  d.prepare('UPDATE posts SET status = ?, published_at = ?, updated_at = ? WHERE slug = ?').run(
    status,
    publishedAt,
    now,
    slug
  );

  return d.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
}

function deletePost(slug) {
  const d = getDb();
  const post = d.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
  if (!post) return false;
  d.prepare('DELETE FROM posts WHERE slug = ?').run(slug);
  return true;
}

module.exports = {
  getDb,
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  setStatus,
  deletePost,
};
