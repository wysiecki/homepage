const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const MAIL_TO = process.env.MAIL_TO || 'info@wysiecki.de';
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || '';

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

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
  if (!getTransporter()) {
    console.warn('SMTP not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.');
  }
});
