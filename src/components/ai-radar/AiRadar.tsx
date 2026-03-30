'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArticleCard,
  type TrendingItem,
  type TutorialItem,
  type ResearchItem,
  type OpenSourceItem,
  type ArticleItem,
} from './ArticleCard';

// ── Constants ──────────────────────────────────────────────────────

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const ITEMS_PER_TAB = 15;

type TabName = 'trending' | 'tutorials' | 'research' | 'opensource';

const TABS: TabName[] = ['trending', 'tutorials', 'research', 'opensource'];

// ── Cache helpers ──────────────────────────────────────────────────

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`ai-radar:${key}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(`ai-radar:${key}`);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`ai-radar:${key}`, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage full or disabled
  }
}

// ── arXiv XML parser ───────────────────────────────────────────────

function parseArxivXml(xml: string): Omit<ResearchItem, 'type'>[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const entries = doc.querySelectorAll('entry');
  const items: Omit<ResearchItem, 'type'>[] = [];

  entries.forEach((entry) => {
    const title = entry.querySelector('title')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const summary =
      entry.querySelector('summary')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const id = entry.querySelector('id')?.textContent || '';
    const published = entry.querySelector('published')?.textContent || '';
    const authors = Array.from(entry.querySelectorAll('author name'))
      .map((n) => n.textContent || '')
      .slice(0, 3);
    const pdfLink = Array.from(entry.querySelectorAll('link')).find(
      (l) => l.getAttribute('title') === 'pdf',
    );
    const categories = Array.from(entry.querySelectorAll('category'))
      .map((c) => c.getAttribute('term'))
      .filter(Boolean)
      .slice(0, 3) as string[];

    items.push({
      title,
      url: id.replace('http://', 'https://'),
      pdfUrl: pdfLink?.getAttribute('href')?.replace('http://', 'https://') || '',
      source: 'arXiv',
      date: published,
      authors,
      summary: summary.length > 200 ? summary.substring(0, 200) + '...' : summary,
      categories,
    });
  });

  return items;
}

// ── Data fetchers ──────────────────────────────────────────────────

async function fetchTrending(): Promise<TrendingItem[]> {
  const cached = getCached<TrendingItem[]>('trending');
  if (cached) return cached;

  const res = await fetch(
    'https://hn.algolia.com/api/v1/search?query=AI+OR+LLM+OR+%22machine+learning%22+OR+GPT+OR+%22artificial+intelligence%22&tags=story&hitsPerPage=' +
      ITEMS_PER_TAB,
  );
  const json = await res.json();

  const items: TrendingItem[] = json.hits.map(
    (hit: {
      title: string;
      url?: string;
      objectID: string;
      points: number;
      num_comments: number;
      created_at: string;
      author: string;
    }) => ({
      type: 'trending' as const,
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      source: 'HackerNews',
      points: hit.points,
      comments: hit.num_comments,
      commentsUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
      date: hit.created_at,
      author: hit.author,
    }),
  );

  setCache('trending', items);
  return items;
}

async function fetchTutorials(): Promise<TutorialItem[]> {
  const cached = getCached<TutorialItem[]>('tutorials');
  if (cached) return cached;

  const res = await fetch('https://dev.to/api/articles?tag=ai&top=7&per_page=' + ITEMS_PER_TAB);
  const articles = await res.json();

  const items: TutorialItem[] = articles.map(
    (a: {
      title: string;
      url: string;
      user?: { name?: string; username?: string };
      published_at: string;
      reading_time_minutes?: number;
      positive_reactions_count?: number;
      tag_list?: string[];
      cover_image?: string;
      description?: string;
    }) => ({
      type: 'tutorial' as const,
      title: a.title,
      url: a.url,
      source: 'Dev.to',
      author: a.user?.name || a.user?.username,
      date: a.published_at,
      readingTime: a.reading_time_minutes,
      reactions: a.positive_reactions_count,
      tags: a.tag_list?.slice(0, 3) || [],
      cover: a.cover_image,
      description: a.description,
    }),
  );

  setCache('tutorials', items);
  return items;
}

async function fetchResearch(): Promise<ResearchItem[]> {
  const cached = getCached<ResearchItem[]>('research');
  if (cached) return cached;

  let rawItems: Omit<ResearchItem, 'type'>[] | undefined;

  // Try proxy first, fall back to direct arXiv API
  try {
    const res = await fetch('/api/ai-feed?source=arxiv');
    if (res.ok) {
      rawItems = await res.json();
    }
  } catch {
    // proxy not available
  }

  if (!rawItems) {
    const res = await fetch(
      'https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=' +
        ITEMS_PER_TAB,
    );
    const text = await res.text();
    rawItems = parseArxivXml(text);
  }

  const items: ResearchItem[] = rawItems.map((item) => ({
    ...item,
    type: 'research' as const,
  }));

  setCache('research', items);
  return items;
}

async function fetchOpenSource(): Promise<OpenSourceItem[]> {
  const cached = getCached<OpenSourceItem[]>('opensource');
  if (cached) return cached;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const res = await fetch(
    `https://api.github.com/search/repositories?q=topic:llm+OR+topic:machine-learning+OR+topic:artificial-intelligence+pushed:>${weekAgo}&sort=stars&order=desc&per_page=${ITEMS_PER_TAB}`,
    {
      headers: { Accept: 'application/vnd.github.v3+json' },
    },
  );
  const json = await res.json();

  const items: OpenSourceItem[] = (json.items || []).map(
    (repo: {
      full_name: string;
      html_url: string;
      description?: string;
      stargazers_count: number;
      forks_count: number;
      language?: string;
      topics?: string[];
      updated_at: string;
    }) => ({
      type: 'opensource' as const,
      title: repo.full_name,
      url: repo.html_url,
      source: 'GitHub',
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      topics: (repo.topics || []).slice(0, 4),
      date: repo.updated_at,
    }),
  );

  setCache('opensource', items);
  return items;
}

// ── Fetcher map ────────────────────────────────────────────────────

const fetchers: Record<TabName, () => Promise<ArticleItem[]>> = {
  trending: fetchTrending,
  tutorials: fetchTutorials,
  research: fetchResearch,
  opensource: fetchOpenSource,
};

// ── Skeleton ───────────────────────────────────────────────────────

function SkeletonCards({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card" />
      ))}
    </>
  );
}

// ── Component ──────────────────────────────────────────────────────

export function AiRadar() {
  const t = useTranslations('AiRadar');

  const [activeTab, setActiveTab] = useState<TabName>('trending');
  const [data, setData] = useState<Record<TabName, ArticleItem[]>>({
    trending: [],
    tutorials: [],
    research: [],
    opensource: [],
  });
  const [loading, setLoading] = useState<Record<TabName, boolean>>({
    trending: true,
    tutorials: false,
    research: false,
    opensource: false,
  });
  const [error, setError] = useState(false);
  const loadedRef = useRef<Record<string, boolean>>({});

  const noItemsText: Record<TabName, string> = {
    trending: t('noStories'),
    tutorials: t('noTutorials'),
    research: t('noPapers'),
    opensource: t('noRepos'),
  };

  const tabLabels: Record<TabName, string> = {
    trending: t('tabs.trending'),
    tutorials: t('tabs.tutorials'),
    research: t('tabs.research'),
    opensource: t('tabs.openSource'),
  };

  const loadTab = useCallback(
    async (tabName: TabName) => {
      if (loadedRef.current[tabName]) return;

      setLoading((prev) => ({ ...prev, [tabName]: true }));
      setError(false);

      try {
        const items = await fetchers[tabName]();
        setData((prev) => ({ ...prev, [tabName]: items }));
        loadedRef.current[tabName] = true;
      } catch (err) {
        console.error(`[AI Radar] Failed to load ${tabName}:`, err);
        setError(true);
      } finally {
        setLoading((prev) => ({ ...prev, [tabName]: false }));
      }
    },
    [],
  );

  const switchTab = useCallback(
    (tabName: TabName) => {
      setActiveTab(tabName);
      loadTab(tabName);
    },
    [loadTab],
  );

  const handleRetry = useCallback(() => {
    loadedRef.current[activeTab] = false;
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  // Load initial tab
  useEffect(() => {
    loadTab('trending');
  }, [loadTab]);

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8">
      {/* Header */}
      <div className="reveal revealed mb-10">
        <p className="section-label">{t('title')}</p>
        <h1 className="section-heading mb-3">
          {t('heading1')}
          <br />
          <span className="text-primary">{t('heading2')}</span>
        </h1>
        <p className="text-on-surface/50 text-lg max-w-xl">{t('subtitle')}</p>
      </div>

      {/* Tab Navigation */}
      <div className="reveal revealed mb-8">
        <div
          className="flex flex-wrap gap-2 border-b border-outline-variant/20 pb-px"
          role="tablist"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`ai-tab${activeTab === tab ? ' active' : ''}`}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => switchTab(tab)}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Panels */}
      {TABS.map((tab) => (
        <div
          key={tab}
          className={`ai-panel${activeTab === tab ? ' active' : ''}`}
          role="tabpanel"
          hidden={activeTab !== tab}
        >
          <div className="space-y-4">
            {loading[tab] ? (
              <SkeletonCards count={5} />
            ) : data[tab].length === 0 ? (
              <p className="text-on-surface/40 text-center py-8">{noItemsText[tab]}</p>
            ) : (
              data[tab].map((item, i) => <ArticleCard key={i} item={item} />)
            )}
          </div>
        </div>
      ))}

      {/* Error state */}
      {error && (
        <div className="mt-8 card p-8 text-center">
          <p className="text-on-surface/50 mb-4">{t('error')}</p>
          <button className="btn-ghost text-sm" onClick={handleRetry}>
            {t('retry')}
          </button>
        </div>
      )}
    </div>
  );
}
