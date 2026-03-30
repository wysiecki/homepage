import { NextRequest, NextResponse } from 'next/server';
import {
  isRateLimited,
  isSaltConfigured,
  recordPageview,
} from '@/lib/db/analytics';

export async function POST(request: NextRequest) {
  if (!isSaltConfigured()) {
    return new NextResponse(null, { status: 503 });
  }

  try {
    const ip = getClientIP(request);

    if (isRateLimited(ip)) {
      return new NextResponse(null, { status: 429 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return new NextResponse(null, { status: 400 });
    }

    const { path: pagePath, referrer, screenWidth, screenHeight } = body as {
      path?: string;
      referrer?: string;
      screenWidth?: number;
      screenHeight?: number;
    };

    // Input validation
    if (!pagePath || typeof pagePath !== 'string' || pagePath.length > 500) {
      return new NextResponse(null, { status: 400 });
    }
    if (referrer && (typeof referrer !== 'string' || referrer.length > 2000)) {
      return new NextResponse(null, { status: 400 });
    }
    if (screenWidth && (typeof screenWidth !== 'number' || screenWidth <= 0)) {
      return new NextResponse(null, { status: 400 });
    }
    if (screenHeight && (typeof screenHeight !== 'number' || screenHeight <= 0)) {
      return new NextResponse(null, { status: 400 });
    }

    const ua = (request.headers.get('user-agent') || '').slice(0, 500);
    const country = request.headers.get('cf-ipcountry') || 'unknown';

    recordPageview({
      path: pagePath,
      referrer,
      screenWidth,
      screenHeight,
      ua,
      ip,
      country,
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[ANALYTICS] Pageview error:', (err as Error).message);
    return new NextResponse(null, { status: 500 });
  }
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}
