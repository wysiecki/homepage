import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
  readingTime: number;
  lang: string;
}

function parsePost(file: string): BlogPost {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
  const { data, content } = matter(raw);
  const words = content.split(/\s+/).length;
  return {
    slug: data.slug || file.replace(/\.(mdx|md)$/, ''),
    title: data.title || '',
    description: data.description || '',
    date: data.date ? new Date(data.date).toISOString() : '',
    tags: data.tags || [],
    content,
    readingTime: Math.max(1, Math.ceil(words / 200)),
    lang: data.lang || 'en',
  };
}

export function getAllPosts(locale?: string): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));
  const posts = files.map(parsePost);

  if (locale) {
    // For each slug, prefer the locale-specific version, fall back to 'en'
    const bySlug = new Map<string, BlogPost[]>();
    for (const post of posts) {
      const group = bySlug.get(post.slug) || [];
      group.push(post);
      bySlug.set(post.slug, group);
    }
    const result: BlogPost[] = [];
    for (const [, group] of bySlug) {
      const match = group.find(p => p.lang === locale) || group.find(p => p.lang === 'en');
      if (match) result.push(match);
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string, locale?: string): BlogPost | undefined {
  const all = getAllPosts();
  if (locale) {
    return all.find(p => p.slug === slug && p.lang === locale) ||
           all.find(p => p.slug === slug && p.lang === 'en');
  }
  return all.find(p => p.slug === slug);
}
