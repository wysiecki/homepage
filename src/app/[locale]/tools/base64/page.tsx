import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Base64Tool } from '@/components/tools/Base64Tool';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Tools');
  return {
    title: `${t('base64.title')} — Free Online Base64 Converter`,
    description: 'Free online Base64 encoder and decoder with full UTF-8 support. Encode text to Base64 or decode Base64 strings instantly in your browser.',
  };
}

export default function Base64Page() {
  return <Base64Tool />;
}
