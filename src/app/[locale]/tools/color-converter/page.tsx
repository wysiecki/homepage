import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { ColorConverter } from '@/components/tools/ColorConverter';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Tools');
  return {
    title: `${t('colorConverter.title')} — Free Online HEX RGB HSL Converter`,
    description: 'Convert colors between HEX, RGB, and HSL formats instantly. Live color preview, CSS output, and copy-to-clipboard.',
  };
}

export default function ColorConverterPage() {
  return <ColorConverter />;
}
