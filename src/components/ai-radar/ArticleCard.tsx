'use client';

import { useTranslations } from 'next-intl';

// ── Types ──────────────────────────────────────────────────────────

export interface TrendingItem {
  type: 'trending';
  title: string;
  url: string;
  source: string;
  points: number;
  comments: number;
  commentsUrl: string;
  date: string;
  author?: string;
}

export interface TutorialItem {
  type: 'tutorial';
  title: string;
  url: string;
  source: string;
  author?: string;
  date: string;
  readingTime?: number;
  reactions?: number;
  tags?: string[];
  cover?: string;
  description?: string;
}

export interface ResearchItem {
  type: 'research';
  title: string;
  url: string;
  pdfUrl?: string;
  source: string;
  date: string;
  authors?: string[];
  summary?: string;
  categories?: string[];
}

export interface OpenSourceItem {
  type: 'opensource';
  title: string;
  url: string;
  source: string;
  description?: string;
  stars: number;
  forks: number;
  language?: string;
  topics?: string[];
  date: string;
}

export type ArticleItem = TrendingItem | TutorialItem | ResearchItem | OpenSourceItem;

// ── Helpers ────────────────────────────────────────────────────────

interface TimeLabels {
  justNow: string;
  mAgo: string;
  hAgo: string;
  dAgo: string;
}

function timeAgo(dateStr: string, labels: TimeLabels): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return labels.justNow;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} ${labels.mAgo}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${labels.hAgo}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ${labels.dAgo}`;
  return new Date(dateStr).toLocaleDateString();
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

// ── Component ──────────────────────────────────────────────────────

export function ArticleCard({ item }: { item: ArticleItem }) {
  const t = useTranslations('AiRadar');
  const timeLabels: TimeLabels = {
    justNow: t('justNow'),
    mAgo: t('mAgo'),
    hAgo: t('hAgo'),
    dAgo: t('dAgo'),
  };
  const byLabel = t('by');

  if (item.type === 'trending') {
    return (
      <article className="card p-5 hover:border-primary-container/30 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-base font-medium hover:text-primary transition-colors block mb-2 leading-snug"
            >
              {item.title}
            </a>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-on-surface/40">
              <span className="text-primary/60">{item.source}</span>
              <span>{timeAgo(item.date, timeLabels)}</span>
              {item.author && <span>{byLabel} {item.author}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 text-xs font-mono text-on-surface/40">
            <span className="text-secondary" title="Points">
              {formatNumber(item.points)} {t('pts')}
            </span>
            <a
              href={item.commentsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              title="Comments"
            >
              {formatNumber(item.comments)} {t('comments')}
            </a>
          </div>
        </div>
      </article>
    );
  }

  if (item.type === 'tutorial') {
    return (
      <article className="card p-5 hover:border-primary-container/30 transition-colors">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
          <h3 className="font-display text-base font-medium hover:text-primary transition-colors mb-2 leading-snug">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-on-surface/40 text-sm mb-3 line-clamp-2">{item.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-on-surface/40">
            <span className="text-secondary/60">Dev.to</span>
            <span>{timeAgo(item.date, timeLabels)}</span>
            {item.author && <span>{byLabel} {item.author}</span>}
            {item.readingTime != null && (
              <span>
                {item.readingTime} {t('minRead')}
              </span>
            )}
            {item.reactions != null && item.reactions > 0 && (
              <span className="text-tertiary/60">
                {formatNumber(item.reactions)} {t('reactions')}
              </span>
            )}
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.tags.map((tag) => (
                <span key={tag} className="tag text-[10px]">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </a>
      </article>
    );
  }

  if (item.type === 'research') {
    return (
      <article className="card p-5 hover:border-primary-container/30 transition-colors">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
          <h3 className="font-display text-base font-medium hover:text-primary transition-colors mb-2 leading-snug">
            {item.title}
          </h3>
          {item.summary && (
            <p className="text-on-surface/40 text-sm mb-3 line-clamp-3">{item.summary}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-on-surface/40">
            <span className="text-tertiary/60">arXiv</span>
            <span>{timeAgo(item.date, timeLabels)}</span>
            {item.authors && item.authors.length > 0 && (
              <span>
                {item.authors.join(', ')}
                {item.authors.length >= 3 ? ' et al.' : ''}
              </span>
            )}
          </div>
          {item.categories && item.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.categories.map((cat) => (
                <span key={cat} className="tag text-[10px]">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </a>
        {item.pdfUrl && (
          <a
            href={item.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-xs font-mono text-primary/60 hover:text-primary transition-colors"
          >
            PDF &rarr;
          </a>
        )}
      </article>
    );
  }

  // opensource
  return (
    <article className="card p-5 hover:border-primary-container/30 transition-colors">
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
        <h3 className="font-display text-base font-medium hover:text-primary transition-colors mb-1">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-on-surface/40 text-sm mb-3 line-clamp-2">{item.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-on-surface/40">
          <span className="text-secondary/60">GitHub</span>
          <span title="Stars">&#9733; {formatNumber(item.stars)}</span>
          <span title="Forks">
            {formatNumber(item.forks)} {t('forks')}
          </span>
          {item.language && <span className="text-tertiary/60">{item.language}</span>}
        </div>
        {item.topics && item.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {item.topics.map((topic) => (
              <span key={topic} className="tag text-[10px]">
                {topic}
              </span>
            ))}
          </div>
        )}
      </a>
    </article>
  );
}
