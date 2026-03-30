import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { AiRadar } from '@/components/ai-radar/AiRadar';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('AiRadar');
  return {
    title: `${t('title')} — Live AI News, Research & Trends | wysiecki.de`,
    description: t('subtitle'),
  };
}

export default function AiRadarPage() {
  return (
    <main className="pt-32 pb-24">
      <AiRadar />
    </main>
  );
}
