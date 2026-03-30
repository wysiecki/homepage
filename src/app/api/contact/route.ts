import { NextRequest, NextResponse } from 'next/server';
import { verifyTurnstile } from '@/lib/turnstile';
import { sendContactEmail, getTransporter } from '@/lib/mail';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { name, email, message } = body as {
    name?: string;
    email?: string;
    message?: string;
  };
  const turnstileToken = body['cf-turnstile-response'] as string | undefined;

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
  }

  // Verify Cloudflare Turnstile
  const turnstileSecret = process.env.TURNSTILE_SECRET || '';
  if (turnstileSecret) {
    if (!turnstileToken) {
      return NextResponse.json({ error: 'Captcha verification required.' }, { status: 400 });
    }
    try {
      const remoteIp =
        request.headers.get('x-real-ip') ||
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        '127.0.0.1';
      const result = await verifyTurnstile(turnstileToken, remoteIp);
      if (!result.success) {
        console.warn('[CONTACT] Turnstile verification failed:', result.errorCodes);
        return NextResponse.json(
          { error: 'Captcha verification failed. Please try again.' },
          { status: 403 }
        );
      }
    } catch (err) {
      console.error('[CONTACT] Turnstile verification error:', (err as Error).message);
      return NextResponse.json(
        { error: 'Captcha verification error. Please try again.' },
        { status: 500 }
      );
    }
  }

  // Send email
  const mailer = getTransporter();
  if (!mailer) {
    console.warn('SMTP not configured — logging message instead.');
    console.log(`[CONTACT] From: ${name} <${email}>\n${message}`);
    return NextResponse.json({ ok: true, note: 'SMTP not configured, message logged.' });
  }

  try {
    await sendContactEmail(name, email, message);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[CONTACT] Send failed:', (err as Error).message);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
