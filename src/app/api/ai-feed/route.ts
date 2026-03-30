import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------

interface CacheEntry {
  data: ArxivItem[];
  ts: number;
}

interface ArxivItem {
  title: string;
  url: string;
  pdfUrl: string;
  source: string;
  date: string;
  authors: string[];
  summary: string;
  categories: string[];
}

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('source');
  if (source !== 'arxiv') {
    return NextResponse.json({ error: 'Supported sources: arxiv' }, { status: 400 });
  }

  // Check cache
  if (cache[source] && Date.now() - cache[source].ts < CACHE_TTL) {
    return NextResponse.json(cache[source].data);
  }

  try {
    const arxivRes = await fetch(
      'https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=15'
    );
    const xml = await arxivRes.text();

    const items: ArxivItem[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const get = (tag: string): string => {
        const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
        return m ? m[1].replace(/\s+/g, ' ').trim() : '';
      };
      const id = get('id');
      const pdfMatch = entry.match(/href="([^"]*)"[^>]*title="pdf"/);

      items.push({
        title: get('title'),
        url: id.replace('http://', 'https://'),
        pdfUrl: pdfMatch ? pdfMatch[1].replace('http://', 'https://') : '',
        source: 'arXiv',
        date: get('published'),
        authors: (entry.match(/<name>([^<]*)<\/name>/g) || [])
          .map((n) => n.replace(/<\/?name>/g, ''))
          .slice(0, 3),
        summary: get('summary').substring(0, 200) + '...',
        categories: (entry.match(/term="([^"]*)"/g) || [])
          .map((c) => c.replace(/term="|"/g, ''))
          .slice(0, 3),
      });
    }

    cache[source] = { data: items, ts: Date.now() };
    return NextResponse.json(items);
  } catch (err) {
    console.error('[AI-FEED] arXiv fetch failed:', (err as Error).message);
    return NextResponse.json({ error: 'Failed to fetch from arXiv' }, { status: 502 });
  }
}
