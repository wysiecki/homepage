const crypto = require('crypto');
const path = require('path');

const DB_PATH = process.env.ANALYTICS_DB_PATH || '/data/analytics.db';
const TOKEN = process.env.ANALYTICS_TOKEN || '';
const SALT = process.env.ANALYTICS_SALT || '';
const RETENTION_DAYS = parseInt(process.env.ANALYTICS_RETENTION_DAYS || '730', 10);

let db;

// --- Simple in-memory rate limiter (no dependency) ---

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window per IP

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Periodic cleanup of stale rate limit entries (every 5 minutes)
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
      if (now - entry.start > RATE_LIMIT_WINDOW) rateLimitMap.delete(ip);
    }
  },
  5 * 60 * 1000
).unref();

function getDb() {
  if (!db) {
    const Database = require('better-sqlite3');
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

// --- UA parsing (simple, no dependency) ---

function parseBrowser(ua) {
  if (!ua) return 'Other';
  // Order matters: check specific browsers before generic Chrome/Safari
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

function parseOS(ua) {
  if (!ua) return 'Other';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS X|macOS/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Other';
}

function deviceType(width) {
  if (!width || width <= 0) return 'unknown';
  if (width < 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

// --- IP extraction ---

function getClientIP(req) {
  return (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.ip
  );
}

// --- Auth middleware ---

function requireToken(req, res, next) {
  if (!TOKEN) {
    return res.status(503).json({ error: 'Analytics token not configured.' });
  }
  const authHeader = req.headers.authorization || '';
  const queryToken = req.query.token || '';
  if (authHeader === `Bearer ${TOKEN}` || queryToken === TOKEN) {
    return next();
  }
  console.warn(`[ANALYTICS] Unauthorized access attempt from ${getClientIP(req)} to ${req.path}`);
  return res.status(401).json({ error: 'Unauthorized.' });
}

// --- Date helpers ---

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// --- Aggregation queries ---

function queryData(from, to) {
  const d = getDb();

  const fromDate = from || daysAgo(30);
  const toDate = to || todayUTC();
  const toEnd = toDate + 'T23:59:59.999Z';

  const summary = {};

  // Totals for different periods
  for (const [label, start] of [
    ['today', todayUTC()],
    ['7d', daysAgo(7)],
    ['30d', daysAgo(30)],
    ['all', '2000-01-01'],
  ]) {
    const row = d
      .prepare(
        `SELECT COUNT(*) as views, COUNT(DISTINCT visitor_hash) as visitors
         FROM pageviews WHERE timestamp >= ?`
      )
      .get(start);
    summary[label] = { views: row.views, visitors: row.visitors };
  }

  // Views over time (within selected range)
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
    .all(fromDate, toEnd);

  // Top pages
  const topPages = d
    .prepare(
      `SELECT path, COUNT(*) as views, COUNT(DISTINCT visitor_hash) as visitors
       FROM pageviews
       WHERE timestamp >= ? AND timestamp <= ?
       GROUP BY path ORDER BY views DESC LIMIT 20`
    )
    .all(fromDate, toEnd);

  // Top referrers
  const topReferrers = d
    .prepare(
      `SELECT referrer, COUNT(*) as views
       FROM pageviews
       WHERE timestamp >= ? AND timestamp <= ? AND referrer != ''
       GROUP BY referrer ORDER BY views DESC LIMIT 20`
    )
    .all(fromDate, toEnd);

  // Browsers
  const browsers = d
    .prepare(
      `SELECT browser, COUNT(*) as count
       FROM pageviews
       WHERE timestamp >= ? AND timestamp <= ?
       GROUP BY browser ORDER BY count DESC`
    )
    .all(fromDate, toEnd);

  // OS
  const operatingSystems = d
    .prepare(
      `SELECT os, COUNT(*) as count
       FROM pageviews
       WHERE timestamp >= ? AND timestamp <= ?
       GROUP BY os ORDER BY count DESC`
    )
    .all(fromDate, toEnd);

  // Devices
  const devices = d
    .prepare(
      `SELECT device_type as deviceType, COUNT(*) as count
       FROM pageviews
       WHERE timestamp >= ? AND timestamp <= ?
       GROUP BY device_type ORDER BY count DESC`
    )
    .all(fromDate, toEnd);

  // Countries
  const countries = d
    .prepare(
      `SELECT country, COUNT(*) as count
       FROM pageviews
       WHERE timestamp >= ? AND timestamp <= ?
       GROUP BY country ORDER BY count DESC LIMIT 30`
    )
    .all(fromDate, toEnd);

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

// --- Route registration ---

function initAnalytics(app) {
  // Validate salt configuration
  if (!SALT || SALT.length < 16) {
    console.error('[ANALYTICS] ANALYTICS_SALT must be set to a secure random value (16+ chars).');
    console.error('[ANALYTICS] Analytics module disabled.');
    return;
  }

  // Serve static assets (Chart.js)
  const express = require('express');
  app.use('/api/analytics/static', express.static(path.join(__dirname, 'public')));

  // Data retention: delete records older than RETENTION_DAYS (runs daily)
  function cleanupOldData() {
    try {
      const d = getDb();
      const cutoff = daysAgo(RETENTION_DAYS);
      const result = d.prepare('DELETE FROM pageviews WHERE timestamp < ?').run(cutoff);
      if (result.changes > 0) {
        console.log(
          `[ANALYTICS] Retention cleanup: deleted ${result.changes} records older than ${RETENTION_DAYS} days`
        );
        // Reclaim disk space after bulk deletes
        d.exec('VACUUM');
      }
    } catch (err) {
      console.error('[ANALYTICS] Retention cleanup error:', err.message);
    }
  }
  // Run cleanup on startup and then daily
  cleanupOldData();
  setInterval(cleanupOldData, 24 * 60 * 60 * 1000).unref();

  // Ingest pageview (rate-limited)
  app.post('/api/analytics/pageview', (req, res) => {
    try {
      const ip = getClientIP(req);

      // Rate limiting
      if (isRateLimited(ip)) {
        return res.status(429).end();
      }

      const { path: pagePath, referrer, screenWidth, screenHeight } = req.body;

      // Input validation
      if (!pagePath || typeof pagePath !== 'string' || pagePath.length > 500) {
        return res.status(400).end();
      }
      if (referrer && (typeof referrer !== 'string' || referrer.length > 2000)) {
        return res.status(400).end();
      }
      if (screenWidth && (typeof screenWidth !== 'number' || screenWidth <= 0)) {
        return res.status(400).end();
      }
      if (screenHeight && (typeof screenHeight !== 'number' || screenHeight <= 0)) {
        return res.status(400).end();
      }

      const today = todayUTC();
      const hash = crypto
        .createHash('sha256')
        .update(ip + today + SALT)
        .digest('hex');

      const ua = (req.headers['user-agent'] || '').slice(0, 500);
      const country = req.headers['cf-ipcountry'] || 'unknown';

      const d = getDb();
      d.prepare(
        `INSERT INTO pageviews
         (timestamp, path, referrer, screen_width, screen_height, device_type, browser, os, country, visitor_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        new Date().toISOString(),
        pagePath.slice(0, 500),
        (referrer || '').slice(0, 2000),
        screenWidth || 0,
        screenHeight || 0,
        deviceType(screenWidth),
        parseBrowser(ua),
        parseOS(ua),
        country.slice(0, 10),
        hash
      );

      res.status(204).end();
    } catch (err) {
      console.error('[ANALYTICS] Pageview error:', err.message);
      res.status(500).end();
    }
  });

  // Data API (JSON)
  app.get('/api/analytics/data', requireToken, (req, res) => {
    try {
      const data = queryData(req.query.from, req.query.to);
      res.json(data);
    } catch (err) {
      console.error('[ANALYTICS] Data query error:', err.message);
      res.status(500).json({ error: 'Query failed.' });
    }
  });

  // Dashboard HTML
  app.get('/api/analytics/dashboard', requireToken, (req, res) => {
    console.log(`[ANALYTICS] Dashboard accessed from ${getClientIP(req)}`);
    try {
      const { generateDashboard } = require('./dashboard');
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self';"
      );
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(generateDashboard());
    } catch (err) {
      console.error('[ANALYTICS] Dashboard error:', err.message);
      res.status(500).send('Dashboard error.');
    }
  });

  console.log('[ANALYTICS] Module initialized (db: ' + DB_PATH + ')');
}

module.exports = { initAnalytics };
