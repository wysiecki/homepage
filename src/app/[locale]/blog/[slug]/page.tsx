import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import { getLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { getAllPosts, getPostBySlug } from '@/lib/blog/posts';
import { Link } from '@/i18n/navigation';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} — Martin von Wysiecki`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}/`,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

async function formatDate(iso: string): Promise<string> {
  const locale = await getLocale();
  const localeMap: Record<string, string> = { en: 'en-US', de: 'de-DE', pl: 'pl-PL' };
  const d = new Date(iso);
  return d.toLocaleDateString(localeMap[locale] || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { content } = await compileMDX({ source: post.content });
  const dateStr = await formatDate(post.date);

  return (
    <main className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Breadcrumb - uses Nav translations for Home */}
        <RevealOnScroll>
          <nav className="mb-8">
            <ol className="flex items-center gap-2 font-mono text-xs text-on-surface/40">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  <BreadcrumbHome />
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/blog" className="hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>/</li>
              <li className="text-primary truncate max-w-[200px]">{post.title}</li>
            </ol>
          </nav>
        </RevealOnScroll>

        {/* Article Header */}
        <RevealOnScroll>
          <header className="mb-12">
            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {post.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm font-mono text-on-surface/40">
              <time dateTime={post.date}>{dateStr}</time>
              <span>&middot;</span>
              <span>{post.readingTime} <MinReadLabel /></span>
            </div>
          </header>
        </RevealOnScroll>

        {/* Article Content */}
        <RevealOnScroll>
          <article className="prose">{content}</article>
        </RevealOnScroll>

        {/* Back to blog */}
        <RevealOnScroll>
          <div
            className="mt-16 pt-8"
            style={{ borderTop: '1px solid rgba(72, 69, 83, 0.15)' }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-mono text-on-surface/40 hover:text-primary transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              <BackLabel />
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </main>
  );
}

function BreadcrumbHome() {
  const t = useTranslations('Nav');
  return <>{t('home')}</>;
}

function MinReadLabel() {
  const t = useTranslations('Blog');
  return <>{t('minRead')}</>;
}

function BackLabel() {
  const t = useTranslations('Blog');
  return <>{t('backToAll')}</>;
}
