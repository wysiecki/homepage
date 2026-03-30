import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { JwtDecoder } from '@/components/tools/JwtDecoder';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Tools');
  return {
    title: `${t('jwtDecoder.title')} — Free Online JWT Token Decoder`,
    description: 'Decode JWT tokens instantly in your browser. Inspect header, payload, signature, check expiration status, and view human-readable timestamps.',
  };
}

export default function JwtDecoderPage() {
  return <JwtDecoder />;
}
