const express = require('express');
const { requireAuth, hasAuth } = require('./auth');
const db = require('./db');
const renderer = require('./blog-renderer');

const router = express.Router();

// ── Helpers ──────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' })[c] || c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sanitizePost(row) {
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

/** Return published posts for renderer (needs content for reading time). */
function getPublishedForRenderer() {
  return db.getAllPosts('published');
}

// ── GET /api/blog — list posts ──────────────────────────────────

router.get('/', (req, res) => {
  const status = req.query.status;

  // Drafts require auth
  if (status === 'draft' && !hasAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const posts = status ? db.getAllPosts(status) : db.getAllPosts('published');
  res.json({
    posts: posts.map(sanitizePost),
    total: posts.length,
  });
});

// ── GET /api/blog/:slug — single post ───────────────────────────

router.get('/:slug', (req, res) => {
  const post = db.getPostBySlug(req.params.slug);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  // Drafts require auth
  if (post.status === 'draft' && !hasAuth(req)) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json({ post: sanitizePost(post) });
});

// ── POST /api/blog — create post ────────────────────────────────

router.post('/', requireAuth, (req, res) => {
  const { title, slug, description, content, tags, status, source_url } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required.' });
  }

  const finalSlug = slug || slugify(title);

  // Check uniqueness
  if (db.getPostBySlug(finalSlug)) {
    return res.status(409).json({ error: `Slug "${finalSlug}" already exists.` });
  }

  const post = db.createPost({
    slug: finalSlug,
    title,
    description: description || '',
    content,
    tags: tags || [],
    status: status || 'draft',
    source_url: source_url || '',
  });

  // If created as published, render immediately
  if (post.status === 'published') {
    try {
      renderer.publishPost(post, getPublishedForRenderer());
    } catch (err) {
      console.error('[BLOG] Render failed after create:', err.message);
    }
  }

  res.status(201).json({ post: sanitizePost(post) });
});

// ── PUT /api/blog/:slug — update post ───────────────────────────

router.put('/:slug', requireAuth, (req, res) => {
  const existing = db.getPostBySlug(req.params.slug);
  if (!existing) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const { title, slug, description, content, tags, source_url } = req.body;

  // If changing slug, check uniqueness
  if (slug && slug !== req.params.slug && db.getPostBySlug(slug)) {
    return res.status(409).json({ error: `Slug "${slug}" already exists.` });
  }

  const updated = db.updatePost(req.params.slug, {
    title,
    slug,
    description,
    content,
    tags,
    source_url,
  });

  // If published, re-render
  if (updated.status === 'published') {
    try {
      // If slug changed, remove old HTML
      if (slug && slug !== req.params.slug) {
        renderer.removePost(req.params.slug);
      }
      renderer.publishPost(updated, getPublishedForRenderer());
    } catch (err) {
      console.error('[BLOG] Render failed after update:', err.message);
    }
  }

  res.json({ post: sanitizePost(updated) });
});

// ── PATCH /api/blog/:slug/publish — toggle publish/unpublish ────

router.patch('/:slug/publish', requireAuth, (req, res) => {
  const existing = db.getPostBySlug(req.params.slug);
  if (!existing) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const newStatus = existing.status === 'published' ? 'draft' : 'published';
  const updated = db.setStatus(req.params.slug, newStatus);

  try {
    if (newStatus === 'published') {
      renderer.publishPost(updated, getPublishedForRenderer());
    } else {
      renderer.unpublishPost(req.params.slug, getPublishedForRenderer());
    }
  } catch (err) {
    console.error('[BLOG] Render failed after status change:', err.message);
  }

  res.json({ post: sanitizePost(updated) });
});

// ── DELETE /api/blog/:slug ──────────────────────────────────────

router.delete('/:slug', requireAuth, (req, res) => {
  const existing = db.getPostBySlug(req.params.slug);
  if (!existing) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const wasPublished = existing.status === 'published';
  db.deletePost(req.params.slug);

  if (wasPublished) {
    try {
      renderer.unpublishPost(req.params.slug, getPublishedForRenderer());
    } catch (err) {
      console.error('[BLOG] Render failed after delete:', err.message);
    }
  }

  res.json({ ok: true });
});

module.exports = router;
