const BLOG_API_KEY = process.env.BLOG_API_KEY || '';

function requireAuth(req, res, next) {
  if (!BLOG_API_KEY) {
    return res.status(500).json({ error: 'BLOG_API_KEY not configured on server.' });
  }
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || token !== BLOG_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/** Returns true if the request carries a valid auth token (non-blocking). */
function hasAuth(req) {
  if (!BLOG_API_KEY) return false;
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return token === BLOG_API_KEY;
}

module.exports = { requireAuth, hasAuth };
