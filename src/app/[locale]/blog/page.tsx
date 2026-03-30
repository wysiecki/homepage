import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { getAllPosts } from '@/lib/blog/posts';
import { BlogCard } from '@/components/blog/BlogCard';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Blog');
  return {
    title: `${t('metaTitle')} — Martin von Wysiecki`,
    description: t('metaDescription'),
    alternates: { canonical: '/blog/' },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: '/blog/',
      type: 'website',
    },
  };
}

export default function BlogPage() {
  const t = useTranslations('Blog');
  const posts = getAllPosts();

  return (
    <main className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <RevealOnScroll className="mb-16">
          <p className="section-label">{t('label')}</p>
          <h1 className="section-heading mb-4">
            {t('heading1')}
            <br />
            <span className="text-primary">{t('heading2')}</span>
          </h1>
          <p className="text-on-surface/50 text-lg">
            {t('subtitle')}
          </p>
        </RevealOnScroll>

        {/* Blog post listing */}
        <RevealOnScroll>
          <div className="space-y-8">
            {posts.map(post => (
              <BlogCard key={post.slug} post={post} />
            ))}

            {posts.length === 0 && (
              <p className="text-on-surface/40 font-mono text-sm">{t('noPosts')}</p>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </main>
  );
}
