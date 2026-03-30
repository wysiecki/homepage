import crypto from 'crypto';
import Database from 'better-sqlite3';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DB_PATH = process.env.ANALYTICS_DB_PATH || '/data/analytics.db';
const SALT = process.env.ANALYTICS_SALT || '';
const RETENTION_DAYS = parseInt(process.env.ANALYTICS_RETENTION_DAYS || '730', 10);

// ---------------------------------------------------------------------------
// Singleton DB
// ---------------------------------------------------------------------------

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS pageviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        path TEXT NOT NULL,
        referrer TEXT DEFAULT '',
        screen_width INTEGER DEFAULT 0,
        screen_height INTEGER DEFAULT 0,
        device_type TEXT DEFAULT 'unknown',
        browser TEXT DEFAULT 'Other',
        os TEXT DEFAULT 'Other',
        country TEXT DEFAULT 'unknown',
        visitor_hash TEXT NOT NULL
      )
    `);
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_pageviews_timestamp ON pageviews(timestamp);
      CREATE INDEX IF NOT EXISTS idx_pageviews_path ON pageviews(path);
      CREATE INDEX IF NOT EXISTS idx_pageviews_visitor ON pageviews(visitor_hash);
    `);
  }
  return db;
}

// ---------------------------------------------------------------------------
// Rate limiter (in-memory)
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, { start: number; count: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Periodic cleanup of stale rate-limit entries (every 5 min)
if (typeof globalThis !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
      if (now - entry.start > RATE_LIMIT_WINDOW) rateLimitMap.delete(ip);
    }
  }, 5 * 60 * 1000);
  timer.unref?.();
}

// ---------------------------------------------------------------------------
// UA parsing
// ---------------------------------------------------------------------------

export function parseBrowser(ua: string): string {
  if (!ua) return 'Other';
  if (/Edg(e|A)?\//i.test(ua)) return 'Edge';
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'Opera';
  if (/Brave\//i.test(ua)) return 'Brave';
  if (/Vivaldi\//i.test(ua)) return 'Vivaldi';
  if (/SamsungBrowser\//i.test(ua)) return 'Samsung';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Chrome';
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  if (/bot|crawl|spider|slurp|Googlebot/i.test(ua)) return 'Bot';
  return 'Other';
}

export function parseOS(ua: string): string {
  if (!ua) return 'Other';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS X|macOS/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Other';
}

export function deviceType(width: number | undefined): string {
  if (!width || width <= 0) return 'unknown';
  if (width < 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

// ---------------------------------------------------------------------------
// Visitor hash (SHA-256, rotating daily)
// ---------------------------------------------------------------------------

export function visitorHash(ip: string): string {
  const today = todayUTC();
  return crypto
    .createHash('sha256')
    .update(ip + today + SALT)
    .digest('hex');
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Record pageview
// ---------------------------------------------------------------------------

export interface PageviewInput {
  path: string;
  referrer?: string;
  screenWidth?: number;
  screenHeight?: number;
  ua: string;
  ip: string;
  country?: string;
}

export function recordPageview(input: PageviewInput): void {
  const d = getDb();
  d.prepare(
    `INSERT INTO pageviews
     (timestamp, path, referrer, screen_width, screen_height, device_type, browser, os, country, visitor_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    new Date().toISOString(),
    input.path.slice(0, 500),
    (input.referrer || '').slice(0, 2000),
    input.screenWidth || 0,
    input.screenHeight || 0,
    deviceType(input.screenWidth),
    parseBrowser(input.ua),
    parseOS(input.ua),
    (input.country || 'unknown').slice(0, 10),
    visitorHash(input.ip)
  );
}

// ---------------------------------------------------------------------------
// Query / aggregation
// ---------------------------------------------------------------------------

interface SummaryRow {
  views: number;
  visitors: number;
}

interface ViewsOverTimeRow {
  date: string;
  views: number;
  visitors: number;
}

interface TopPageRow {
  path: string;
  views: number;
  visitors: number;
}

interface TopReferrerRow {
  referrer: string;
  views: number;
}

interface CountRow {
  count: number;
}

export interface AnalyticsData {
  summary: Record<string, SummaryRow>;
  viewsOverTime: ViewsOverTimeRow[];
  topPages: TopPageRow[];
  topReferrers: TopReferrerRow[];
  browsers: (CountRow & { browser: string })[];
  operatingSystems: (CountRow & { os: string })[];
  devices: (CountRow & { deviceType: string })[];
  countries: (CountRow & { country: string })[];
}

export function queryData(from?: string, to?: string): AnalyticsData {
  const d = getDb();

  const fromDate = from || daysAgo(30);
  const toDate = to || todayUTC();
  const toEnd = toDate + 'T23:59:59.999Z';

  const summary: Record<string, SummaryRow> = {};
  for (const [label, start] of [
    ['today', todayUTC()],
    ['7d', daysAgo(7)],
    ['30d', daysAgo(30)],
    ['all', '2000-01-01'],
  ] as const) {
    const row = d
      .prepare(
        `SELECT COUNT(*) as views, COUNT(DISTINCT visitor_hash) as visitors
         FROM pageviews WHERE timestamp >= ?`
      )
      .get(start) as SummaryRow;
    summary[label] = { views: row.views, visitors: row.visitors };
  }

  const viewsOverTime = d
    .prepare(
      `SELECT DATE(timestamp) as date,
              COUNT(*) as views,
              COUNT(DISTINCT visitor_hash) as visitors
       FROM pageviews
       WHERE timestamp >= ? AND timestamp <= ?
       GROUP BY DATE(timestamp)
       ORDER BY date`
    )
    .all(fromDate, toEnd) as ViewsOverTimeRow[];

  const topPages = d
    .prepare(
      `SELECT path, COUNT(*) as views, COUNT(DISTINCT visitor_hash) as visitors
       FROM pageviews
       WHERE timestamp >= ? AND timestamp <= ?
       GROUP BY path ORDER BY views DESC LIMIT 20`
    )
    .all(fromDate, toEnd) as TopPageRow[];

  const topReferrers = d
    .prepare(
      `SELECT referrer, COUNT(*) as views
       FROM pageviews
       WHERE timestamp >= ? AND timestamp <= ? AND referrer != ''
       GROUP BY referrer ORDER BY views DESC LIMIT 20`
    )
    .all(fromDate, toEnd) as TopReferrerRow[];

  const browsers = d
    .prepare(
      `SELECT browser, COUNT(*) as count
       FROM pageviews
       WHERE timestamp >= ? AND timestamp <= ?
       GROUP BY browser ORDER BY count DESC`
    )
    .all(fromDate, toEnd) as (CountRow & { browser: string })[];

  const operatingSystems = d
    .prepare(
      `SELECT os, COUNT(*) as count
       FROM pageviews
       WHERE timestamp >= ? AND timestamp <= ?
       GROUP BY os ORDER BY count DESC`
    )
    .all(fromDate, toEnd) as (CountRow & { os: string })[];

  const devices = d
    .prepare(
      `SELECT device_type as deviceType, COUNT(*) as count
       FROM pageviews
       WHERE timestamp >= ? AND timestamp <= ?
       GROUP BY device_type ORDER BY count DESC`
    )
    .all(fromDate, toEnd) as (CountRow & { deviceType: string })[];

  const countries = d
    .prepare(
      `SELECT country, COUNT(*) as count
       FROM pageviews
       WHERE timestamp >= ? AND timestamp <= ?
       GROUP BY country ORDER BY count DESC LIMIT 30`
    )
    .all(fromDate, toEnd) as (CountRow & { country: string })[];

  return {
    summary,
    viewsOverTime,
    topPages,
    topReferrers,
    browsers,
    operatingSystems,
    devices,
    countries,
  };
}

// ---------------------------------------------------------------------------
// Retention cleanup
// ---------------------------------------------------------------------------

export function cleanupOldData(): void {
  try {
    const d = getDb();
    const cutoff = daysAgo(RETENTION_DAYS);
    const result = d.prepare('DELETE FROM pageviews WHERE timestamp < ?').run(cutoff);
    if (result.changes > 0) {
      console.log(
        `[ANALYTICS] Retention cleanup: deleted ${result.changes} records older than ${RETENTION_DAYS} days`
      );
      d.exec('VACUUM');
    }
  } catch (err) {
    console.error('[ANALYTICS] Retention cleanup error:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Auth check for analytics token
// ---------------------------------------------------------------------------

export function requireAnalyticsToken(authHeader: string | null, queryToken: string | null): boolean {
  const TOKEN = process.env.ANALYTICS_TOKEN || '';
  if (!TOKEN) return false;
  if (authHeader === `Bearer ${TOKEN}`) return true;
  if (queryToken === TOKEN) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Salt validation
// ---------------------------------------------------------------------------

export function isSaltConfigured(): boolean {
  return !!SALT && SALT.length >= 32;
}
