import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET() {
  const baseUrl = 'https://wysiecki.de';
  const blogDir = path.join(process.cwd(), 'content', 'blog');

  let items = '';

  if (fs.existsSync(blogDir)) {
    const files = fs
      .readdirSync(blogDir)
      .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
      .sort()
      .reverse();

    for (const file of files) {
      const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
      const { data } = matter(raw);

      const slug = data.slug || file.replace(/\.mdx?$/, '');
      const title = escapeXml(data.title || slug);
      const description = escapeXml(data.description || '');
      const pubDate = data.date
        ? new Date(data.date).toUTCString()
        : new Date().toUTCString();

      items += `
    <item>
      <title>${title}</title>
      <link>${baseUrl}/blog/${slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${slug}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Martin von Wysiecki — Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Blog posts by Martin von Wysiecki — Full-Stack Developer &amp; Tech Solutions</description>
    <language>en</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
