import { NextRequest, NextResponse } from 'next/server';
import {
  getAllPosts,
  getPostBySlug,
  createPost,
  sanitizePost,
  slugify,
  requireAuth,
  hasAuth,
} from '@/lib/db/blog-db';

// ---------------------------------------------------------------------------
// GET /api/blog — list posts
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') || undefined;

  // Drafts require auth
  if (status === 'draft' && !hasAuth(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const posts = status ? getAllPosts(status) : getAllPosts('published');
  return NextResponse.json({
    posts: posts.map(sanitizePost),
    total: posts.length,
  });
}

// ---------------------------------------------------------------------------
// POST /api/blog — create post
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const auth = requireAuth(request.headers.get('authorization'));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { title, slug, description, content, tags, status, source_url } = body as {
    title?: string;
    slug?: string;
    description?: string;
    content?: string;
    tags?: string[];
    status?: 'draft' | 'published';
    source_url?: string;
  };

  if (!title || !content) {
    return NextResponse.json({ error: 'title and content are required.' }, { status: 400 });
  }

  const finalSlug = slug || slugify(title);

  if (getPostBySlug(finalSlug)) {
    return NextResponse.json(
      { error: `Slug "${finalSlug}" already exists.` },
      { status: 409 }
    );
  }

  const post = createPost({
    slug: finalSlug,
    title,
    description: description || '',
    content,
    tags: tags || [],
    status: status || 'draft',
    source_url: source_url || '',
  });

  return NextResponse.json({ post: sanitizePost(post) }, { status: 201 });
}
