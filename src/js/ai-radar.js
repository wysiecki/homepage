// ── AI Radar — Live AI News Hub ─────────────────────────────────
// Fetches from HackerNews, Dev.to, GitHub (client-side)
// arXiv goes through /api/ai-feed proxy (XML → JSON)

const aiLang = document.documentElement.lang || 'en';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const ITEMS_PER_TAB = 15;

const aiStrings = {
  en: {
    noStories: 'No stories found.',
    noTutorials: 'No tutorials found.',
    noPapers: 'No papers found.',
    noRepos: 'No repos found.',
    minRead: 'min read',
    reactions: 'reactions',
    comments: 'comments',
    pts: 'pts',
    forks: 'forks',
  },
  de: {
    noStories: 'Keine Beiträge gefunden.',
    noTutorials: 'Keine Tutorials gefunden.',
    noPapers: 'Keine Paper gefunden.',
    noRepos: 'Keine Repos gefunden.',
    minRead: 'Min. Lesezeit',
    reactions: 'Reaktionen',
    comments: 'Kommentare',
    pts: 'Pkt.',
    forks: 'Forks',
  },
  pl: {
    noStories: 'Nie znaleziono artykułów.',
    noTutorials: 'Nie znaleziono poradników.',
    noPapers: 'Nie znaleziono publikacji.',
    noRepos: 'Nie znaleziono repozytoriów.',
    minRead: 'min czytania',
    reactions: 'reakcji',
    comments: 'komentarzy',
    pts: 'pkt.',
    forks: 'forków',
  },
}[aiLang] || {
  noStories: 'No stories found.',
  noTutorials: 'No tutorials found.',
  noPapers: 'No papers found.',
  noRepos: 'No repos found.',
  minRead: 'min read',
  reactions: 'reactions',
  comments: 'comments',
  pts: 'pts',
  forks: 'forks',
};

// ── Cache helpers ────────────────────────────────────────────────

function getCached(key) {
  try {
    const raw = localStorage.getItem(`ai-radar:${key}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(`ai-radar:${key}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(`ai-radar:${key}`, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage full or disabled — ignore
  }
}

// ── Time formatting ──────────────────────────────────────────────

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

// ── Data fetchers ────────────────────────────────────────────────

async function fetchTrending() {
  const cached = getCached('trending');
  if (cached) return cached;

  const res = await fetch(
    'https://hn.algolia.com/api/v1/search?query=AI+OR+LLM+OR+%22machine+learning%22+OR+GPT+OR+%22artificial+intelligence%22&tags=story&hitsPerPage=' +
      ITEMS_PER_TAB
  );
  const json = await res.json();

  const items = json.hits.map((hit) => ({
    title: hit.title,
    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    source: 'HackerNews',
    points: hit.points,
    comments: hit.num_comments,
    commentsUrl: `https://news.ycombinator.com/item?id=${hit.objectID}`,
    date: hit.created_at,
    author: hit.author,
  }));

  setCache('trending', items);
  return items;
}

async function fetchTutorials() {
  const cached = getCached('tutorials');
  if (cached) return cached;

  const res = await fetch('https://dev.to/api/articles?tag=ai&top=7&per_page=' + ITEMS_PER_TAB);
  const articles = await res.json();

  const items = articles.map((a) => ({
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
  }));

  setCache('tutorials', items);
  return items;
}

async function fetchResearch() {
  const cached = getCached('research');
  if (cached) return cached;

  // Try the proxy first, fall back to direct arXiv API
  let items;
  try {
    const res = await fetch('/api/ai-feed?source=arxiv');
    if (res.ok) {
      items = await res.json();
    }
  } catch {
    // proxy not available
  }

  if (!items) {
    // Direct fetch (arXiv allows CORS)
    const res = await fetch(
      'https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=' +
        ITEMS_PER_TAB
    );
    const text = await res.text();
    items = parseArxivXml(text);
  }

  setCache('research', items);
  return items;
}

function parseArxivXml(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const entries = doc.querySelectorAll('entry');
  const items = [];

  entries.forEach((entry) => {
    const title = entry.querySelector('title')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const summary = entry.querySelector('summary')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const id = entry.querySelector('id')?.textContent || '';
    const published = entry.querySelector('published')?.textContent || '';
    const authors = Array.from(entry.querySelectorAll('author name'))
      .map((n) => n.textContent)
      .slice(0, 3);
    const pdfLink = Array.from(entry.querySelectorAll('link')).find(
      (l) => l.getAttribute('title') === 'pdf'
    );
    const categories = Array.from(entry.querySelectorAll('category'))
      .map((c) => c.getAttribute('term'))
      .filter(Boolean)
      .slice(0, 3);

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

async function fetchOpenSource() {
  const cached = getCached('opensource');
  if (cached) return cached;

  // Get repos with AI/ML topics, pushed in last 7 days, sorted by stars
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const res = await fetch(
    `https://api.github.com/search/repositories?q=topic:llm+OR+topic:machine-learning+OR+topic:artificial-intelligence+pushed:>${weekAgo}&sort=stars&order=desc&per_page=${ITEMS_PER_TAB}`,
    {
      headers: { Accept: 'application/vnd.github.v3+json' },
    }
  );
  const json = await res.json();

  const items = (json.items || []).map((repo) => ({
    title: repo.full_name,
    url: repo.html_url,
    source: 'GitHub',
    description: repo.description,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    topics: (repo.topics || []).slice(0, 4),
    date: repo.updated_at,
  }));

  setCache('opensource', items);
  return items;
}

// ── Renderers ────────────────────────────────────────────────────

function renderTrending(items) {
  if (!items.length)
    return `<p class="text-on-surface/40 text-center py-8">${aiStrings.noStories}</p>`;

  return items
    .map(
      (item) => `
    <article class="card p-5 hover:border-primary-container/30 transition-colors">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0 flex-1">
          <a href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer"
             class="font-display text-base font-medium hover:text-primary transition-colors block mb-2 leading-snug">
            ${escapeHtml(item.title)}
          </a>
          <div class="flex flex-wrap items-center gap-3 text-xs font-mono text-on-surface/40">
            <span class="text-primary/60">${escapeHtml(item.source)}</span>
            <span>${timeAgo(item.date)}</span>
            ${item.author ? `<span>by ${escapeHtml(item.author)}</span>` : ''}
          </div>
        </div>
        <div class="flex flex-col items-end gap-1 shrink-0 text-xs font-mono text-on-surface/40">
          <span class="text-secondary" title="Points">${formatNumber(item.points)} ${aiStrings.pts}</span>
          <a href="${escapeAttr(item.commentsUrl)}" target="_blank" rel="noopener noreferrer"
             class="hover:text-primary transition-colors" title="Comments">
            ${formatNumber(item.comments)} ${aiStrings.comments}
          </a>
        </div>
      </div>
    </article>`
    )
    .join('');
}

function renderTutorials(items) {
  if (!items.length)
    return `<p class="text-on-surface/40 text-center py-8">${aiStrings.noTutorials}</p>`;

  return items
    .map(
      (item) => `
    <article class="card p-5 hover:border-primary-container/30 transition-colors">
      <a href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer" class="block">
        <h3 class="font-display text-base font-medium hover:text-primary transition-colors mb-2 leading-snug">
          ${escapeHtml(item.title)}
        </h3>
        ${item.description ? `<p class="text-on-surface/40 text-sm mb-3 line-clamp-2">${escapeHtml(item.description)}</p>` : ''}
        <div class="flex flex-wrap items-center gap-3 text-xs font-mono text-on-surface/40">
          <span class="text-secondary/60">Dev.to</span>
          <span>${timeAgo(item.date)}</span>
          ${item.author ? `<span>by ${escapeHtml(item.author)}</span>` : ''}
          ${item.readingTime ? `<span>${item.readingTime} ${aiStrings.minRead}</span>` : ''}
          ${item.reactions ? `<span class="text-tertiary/60">${formatNumber(item.reactions)} ${aiStrings.reactions}</span>` : ''}
        </div>
        ${
          item.tags?.length
            ? `<div class="flex flex-wrap gap-2 mt-3">${item.tags.map((t) => `<span class="tag text-[10px]">${escapeHtml(t)}</span>`).join('')}</div>`
            : ''
        }
      </a>
    </article>`
    )
    .join('');
}

function renderResearch(items) {
  if (!items.length)
    return `<p class="text-on-surface/40 text-center py-8">${aiStrings.noPapers}</p>`;

  return items
    .map(
      (item) => `
    <article class="card p-5 hover:border-primary-container/30 transition-colors">
      <a href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer" class="block">
        <h3 class="font-display text-base font-medium hover:text-primary transition-colors mb-2 leading-snug">
          ${escapeHtml(item.title)}
        </h3>
        ${item.summary ? `<p class="text-on-surface/40 text-sm mb-3 line-clamp-3">${escapeHtml(item.summary)}</p>` : ''}
        <div class="flex flex-wrap items-center gap-3 text-xs font-mono text-on-surface/40">
          <span class="text-tertiary/60">arXiv</span>
          <span>${timeAgo(item.date)}</span>
          ${item.authors?.length ? `<span>${escapeHtml(item.authors.join(', '))}${item.authors.length >= 3 ? ' et al.' : ''}</span>` : ''}
        </div>
        ${
          item.categories?.length
            ? `<div class="flex flex-wrap gap-2 mt-3">${item.categories.map((c) => `<span class="tag text-[10px]">${escapeHtml(c)}</span>`).join('')}</div>`
            : ''
        }
      </a>
      ${item.pdfUrl ? `<a href="${escapeAttr(item.pdfUrl)}" target="_blank" rel="noopener noreferrer" class="inline-block mt-3 text-xs font-mono text-primary/60 hover:text-primary transition-colors">PDF &rarr;</a>` : ''}
    </article>`
    )
    .join('');
}

function renderOpenSource(items) {
  if (!items.length)
    return `<p class="text-on-surface/40 text-center py-8">${aiStrings.noRepos}</p>`;

  return items
    .map(
      (item) => `
    <article class="card p-5 hover:border-primary-container/30 transition-colors">
      <a href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer" class="block">
        <h3 class="font-display text-base font-medium hover:text-primary transition-colors mb-1">
          ${escapeHtml(item.title)}
        </h3>
        ${item.description ? `<p class="text-on-surface/40 text-sm mb-3 line-clamp-2">${escapeHtml(item.description)}</p>` : ''}
        <div class="flex flex-wrap items-center gap-4 text-xs font-mono text-on-surface/40">
          <span class="text-secondary/60">GitHub</span>
          <span title="Stars">&#9733; ${formatNumber(item.stars)}</span>
          <span title="Forks">${formatNumber(item.forks)} ${aiStrings.forks}</span>
          ${item.language ? `<span class="text-tertiary/60">${escapeHtml(item.language)}</span>` : ''}
        </div>
        ${
          item.topics?.length
            ? `<div class="flex flex-wrap gap-2 mt-3">${item.topics.map((t) => `<span class="tag text-[10px]">${escapeHtml(t)}</span>`).join('')}</div>`
            : ''
        }
      </a>
    </article>`
    )
    .join('');
}

// ── Escape helpers ───────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Tab logic ────────────────────────────────────────────────────

const tabs = document.querySelectorAll('.ai-tab');
const panels = document.querySelectorAll('.ai-panel');
const errorEl = document.getElementById('ai-error');
const retryBtn = document.getElementById('ai-retry');

const fetchers = {
  trending: { fetch: fetchTrending, render: renderTrending },
  tutorials: { fetch: fetchTutorials, render: renderTutorials },
  research: { fetch: fetchResearch, render: renderResearch },
  opensource: { fetch: fetchOpenSource, render: renderOpenSource },
};

const loaded = {};

async function loadTab(tabName) {
  const panel = document.getElementById(`panel-${tabName}`);
  const contentEl = document.getElementById(`${tabName}-content`);
  if (!panel || !contentEl) return;

  // Don't reload if already loaded and cached
  if (loaded[tabName]) return;

  const { fetch: fetchFn, render: renderFn } = fetchers[tabName];

  try {
    errorEl.classList.add('hidden');
    const items = await fetchFn();
    contentEl.innerHTML = renderFn(items);
    loaded[tabName] = true;
  } catch (err) {
    console.error(`[AI Radar] Failed to load ${tabName}:`, err);
    contentEl.innerHTML = '';
    errorEl.classList.remove('hidden');
  }
}

function switchTab(tabName) {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  panels.forEach((panel) => {
    const isActive = panel.id === `panel-${tabName}`;
    panel.hidden = !isActive;
    panel.classList.toggle('active', isActive);
  });

  loadTab(tabName);
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

retryBtn?.addEventListener('click', () => {
  const activeTab = document.querySelector('.ai-tab.active');
  if (activeTab) {
    loaded[activeTab.dataset.tab] = false;
    loadTab(activeTab.dataset.tab);
  }
});

// Load initial tab
loadTab('trending');
