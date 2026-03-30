import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// ---------------------------------------------------------------------------
// Configuration (read from env at call time for testability)
// ---------------------------------------------------------------------------

function getConfig() {
  return {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    mailTo: process.env.MAIL_TO || 'info@wysiecki.de',
    mailFrom: process.env.MAIL_FROM || process.env.SMTP_USER || '',
  };
}

// ---------------------------------------------------------------------------
// Lazy singleton transport
// ---------------------------------------------------------------------------

let transporter: Transporter | null = null;

export function getTransporter(): Transporter | null {
  const cfg = getConfig();
  if (!cfg.host || !cfg.user || !cfg.pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.port === 465,
      auth: { user: cfg.user, pass: cfg.pass },
    });
  }
  return transporter;
}

export function isSmtpConfigured(): boolean {
  return getTransporter() !== null;
}

// ---------------------------------------------------------------------------
// Send contact email
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendContactEmail(name: string, email: string, message: string): Promise<void> {
  const cfg = getConfig();
  const mailer = getTransporter();

  if (!mailer) {
    console.warn('SMTP not configured — logging message instead.');
    console.log(`[CONTACT] From: ${name} <${email}>\n${message}`);
    return;
  }

  const safeName = name.replace(/[\r\n"]/g, '');

  await mailer.sendMail({
    from: `"${safeName}" <${cfg.mailFrom}>`,
    replyTo: email,
    to: cfg.mailTo,
    subject: `Contact form: ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<hr>
<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
  });

  console.log(`[CONTACT] Sent mail from ${name} <${email}>`);
}
