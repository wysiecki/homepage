import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync } from 'fs';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DB_PATH = process.env.BLOG_DB_PATH || path.join(process.cwd(), 'data', 'blog.db');

// ---------------------------------------------------------------------------
// Singleton DB
// ---------------------------------------------------------------------------

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    migrate(db);
  }
  return db;
}

function migrate(d: Database.Database): void {
  d.exec(`
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PostRow {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string; // JSON string
  status: 'draft' | 'published';
  source_url: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface SanitizedPost {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published';
  source_url: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface CreatePostInput {
  slug: string;
  title: string;
  description?: string;
  content: string;
  tags?: string[];
  status?: 'draft' | 'published';
  source_url?: string;
}

export interface UpdatePostInput {
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  tags?: string[];
  source_url?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function sanitizePost(row: PostRow): SanitizedPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
    status: row.status,
    source_url: row.source_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    published_at: row.published_at,
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' })[c] || c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export function getAllPosts(status?: string): PostRow[] {
  const d = getDb();
  if (status) {
    return d
      .prepare(
        'SELECT * FROM posts WHERE status = ? ORDER BY COALESCE(published_at, created_at) DESC'
      )
      .all(status) as PostRow[];
  }
  return d
    .prepare('SELECT * FROM posts ORDER BY COALESCE(published_at, created_at) DESC')
    .all() as PostRow[];
}

export function getPostBySlug(slug: string): PostRow | undefined {
  return getDb().prepare('SELECT * FROM posts WHERE slug = ?').get(slug) as PostRow | undefined;
}

export function createPost(input: CreatePostInput): PostRow {
  const d = getDb();
  const now = new Date().toISOString();
  const status = input.status || 'draft';
  const publishedAt = status === 'published' ? now : null;

  const info = d
    .prepare(
      `INSERT INTO posts (slug, title, description, content, tags, status, source_url, created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.slug,
      input.title,
      input.description || '',
      input.content,
      JSON.stringify(input.tags || []),
      status,
      input.source_url || '',
      now,
      now,
      publishedAt
    );

  return d.prepare('SELECT * FROM posts WHERE id = ?').get(info.lastInsertRowid) as PostRow;
}

export function updatePost(slug: string, fields: UpdatePostInput): PostRow | null {
  const d = getDb();
  const existing = d.prepare('SELECT * FROM posts WHERE slug = ?').get(slug) as PostRow | undefined;
  if (!existing) return null;

  const now = new Date().toISOString();
  const newSlug = fields.slug ?? slug;

  d.prepare(
    `UPDATE posts SET slug = ?, title = ?, description = ?, content = ?, tags = ?,
      source_url = ?, updated_at = ?
    WHERE slug = ?`
  ).run(
    newSlug,
    fields.title ?? existing.title,
    fields.description ?? existing.description,
    fields.content ?? existing.content,
    fields.tags ? JSON.stringify(fields.tags) : existing.tags,
    fields.source_url ?? existing.source_url,
    now,
    slug
  );

  return d.prepare('SELECT * FROM posts WHERE slug = ?').get(newSlug) as PostRow;
}

export function deletePost(slug: string): boolean {
  const d = getDb();
  const post = d.prepare('SELECT * FROM posts WHERE slug = ?').get(slug) as PostRow | undefined;
  if (!post) return false;
  d.prepare('DELETE FROM posts WHERE slug = ?').run(slug);
  return true;
}

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

export function requireAuth(authHeader: string | null): { ok: true } | { ok: false; status: number; error: string } {
  const BLOG_API_KEY = process.env.BLOG_API_KEY || '';
  if (!BLOG_API_KEY) {
    return { ok: false, status: 500, error: 'BLOG_API_KEY not configured on server.' };
  }
  const token = (authHeader || '').replace(/^Bearer\s+/i, '');
  if (!token || token !== BLOG_API_KEY) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }
  return { ok: true };
}

export function hasAuth(authHeader: string | null): boolean {
  const BLOG_API_KEY = process.env.BLOG_API_KEY || '';
  if (!BLOG_API_KEY) return false;
  const token = (authHeader || '').replace(/^Bearer\s+/i, '');
  return token === BLOG_API_KEY;
}
