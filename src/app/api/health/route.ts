import { NextResponse } from 'next/server';
import { isSmtpConfigured } from '@/lib/mail';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    smtp: isSmtpConfigured(),
  });
}
