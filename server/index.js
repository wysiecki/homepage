const express = require('express');
const nodemailer = require('nodemailer');
const { initAnalytics } = require('./analytics');
const blogRoutes = require('./blog-routes');

const app = express();
app.use(express.json());

// Default CSP for API responses (dashboard overrides this per-route)
app.use((req, res, next) => {
  if (!res.headersSent) {
    res.setHeader('Content-Security-Policy', "default-src 'none'; connect-src 'self';");
  }
  next();
});

const PORT = process.env.PORT || 8002;

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const MAIL_TO = process.env.MAIL_TO || 'info@wysiecki.de';
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || '';
const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY || '';

let transporter = null;

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  const turnstileToken = req.body['cf-turnstile-response'];

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // Verify Cloudflare Turnstile token
  if (TURNSTILE_SECRET) {
    if (!turnstileToken) {
      return res.status(400).json({ error: 'Captcha verification required.' });
    }
    try {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET,
          response: turnstileToken,
          remoteip: req.headers['x-real-ip'] || req.ip,
        }),
      });
      const result = await verifyRes.json();
      if (!result.success) {
        console.warn('[CONTACT] Turnstile verification failed:', result['error-codes']);
        return res.status(403).json({ error: 'Captcha verification failed. Please try again.' });
      }
    } catch (err) {
      console.error('[CONTACT] Turnstile verification error:', err.message);
      return res.status(500).json({ error: 'Captcha verification error. Please try again.' });
    }
  }

  const mailer = getTransporter();
  if (!mailer) {
    console.warn('SMTP not configured — logging message instead.');
    console.log(`[CONTACT] From: ${name} <${email}>\n${message}`);
    return res.json({ ok: true, note: 'SMTP not configured, message logged.' });
  }

  const safeName = name.replace(/[\r\n"]/g, '');

  try {
    await mailer.sendMail({
      from: `"${safeName}" <${MAIL_FROM}>`,
      replyTo: email,
      to: MAIL_TO,
      subject: `Contact form: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<hr>
<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    });
    console.log(`[CONTACT] Sent mail from ${name} <${email}>`);
    res.json({ ok: true });
  } catch (err) {
    console.error('[CONTACT] Send failed:', err.message);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

// ── AI Feed proxy (arXiv XML → JSON) ──────────────────────────
const aiFeedCache = {};
const AI_FEED_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

app.get('/api/ai-feed', async (req, res) => {
  const source = req.query.source;
  if (source !== 'arxiv') {
    return res.status(400).json({ error: 'Supported sources: arxiv' });
  }

  // Check cache
  if (aiFeedCache[source] && Date.now() - aiFeedCache[source].ts < AI_FEED_CACHE_TTL) {
    return res.json(aiFeedCache[source].data);
  }

  try {
    const arxivRes = await fetch(
      'https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=15'
    );
    const xml = await arxivRes.text();

    // Simple XML extraction (no dependency needed)
    const items = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const get = (tag) => {
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

    aiFeedCache[source] = { data: items, ts: Date.now() };
    res.json(items);
  } catch (err) {
    console.error('[AI-FEED] arXiv fetch failed:', err.message);
    res.status(502).json({ error: 'Failed to fetch from arXiv' });
  }
});

// ── Blog API ────────────────────────────────────────────────────
app.use('/api/blog', blogRoutes);

app.get('/api/config', (_req, res) => {
  res.json({ turnstileSiteKey: TURNSTILE_SITE_KEY });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', smtp: !!getTransporter() });
});

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

initAnalytics(app);

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
  if (!getTransporter()) {
    console.warn('SMTP not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.');
  }

  // Regenerate all published blog HTML on startup (ensures shared volume is populated)
  try {
    const db = require('./db');
    const renderer = require('./blog-renderer');
    const posts = db.getAllPosts('published');
    if (posts.length) {
      posts.forEach((p) => renderer.renderPost(p));
      renderer.renderListing(posts);
      renderer.renderFeed(posts);
      console.log(`[BLOG] Regenerated ${posts.length} published posts on startup`);
    }
  } catch (err) {
    console.warn('[BLOG] Startup regeneration failed:', err.message);
  }
});
