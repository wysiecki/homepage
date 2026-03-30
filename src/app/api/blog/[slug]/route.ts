import { NextRequest, NextResponse } from 'next/server';
import {
  getPostBySlug,
  updatePost,
  deletePost,
  sanitizePost,
  requireAuth,
  hasAuth,
} from '@/lib/db/blog-db';

// ---------------------------------------------------------------------------
// GET /api/blog/[slug] — single post
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Drafts require auth
  if (post.status === 'draft' && !hasAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json({ post: sanitizePost(post) });
}

// ---------------------------------------------------------------------------
// PUT /api/blog/[slug] — update post
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = requireAuth(request.headers.get('authorization'));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = await params;
  const existing = getPostBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const {
    title,
    slug: newSlug,
    description,
    content,
    tags,
    source_url,
  } = body as {
    title?: string;
    slug?: string;
    description?: string;
    content?: string;
    tags?: string[];
    source_url?: string;
  };

  // If changing slug, check uniqueness
  if (newSlug && newSlug !== slug && getPostBySlug(newSlug)) {
    return NextResponse.json(
      { error: `Slug "${newSlug}" already exists.` },
      { status: 409 }
    );
  }

  const updated = updatePost(slug, {
    title,
    slug: newSlug,
    description,
    content,
    tags,
    source_url,
  });

  if (!updated) {
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }

  return NextResponse.json({ post: sanitizePost(updated) });
}

// ---------------------------------------------------------------------------
// DELETE /api/blog/[slug] — delete post
// ---------------------------------------------------------------------------

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = requireAuth(request.headers.get('authorization'));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = await params;
  const existing = getPostBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  deletePost(slug);
  return NextResponse.json({ ok: true });
}
