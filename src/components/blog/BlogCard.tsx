import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { BlogPost } from '@/lib/blog/posts';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const t = useTranslations('Blog');
  const locale = useLocale();
  const localeMap: Record<string, string> = { en: 'en-US', de: 'de-DE', pl: 'pl-PL' };

  const dateStr = new Date(post.date).toLocaleDateString(localeMap[locale] || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="card p-6 md:p-8">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {post.tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight leading-tight mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h2>

        <p className="text-on-surface/50 leading-relaxed mb-4 line-clamp-2">
          {post.description}
        </p>

        <div className="flex items-center gap-4 text-xs font-mono text-on-surface/40">
          <time dateTime={post.date}>{dateStr}</time>
          <span>&middot;</span>
          <span>{post.readingTime} {t('minRead')}</span>
        </div>
      </article>
    </Link>
  );
}
