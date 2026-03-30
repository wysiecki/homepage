import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { CronExplainer } from '@/components/tools/CronExplainer';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Tools');
  return {
    title: `${t('cronExplainer.title')} — Free Online Cron Schedule Tool`,
    description: 'Free cron expression explainer and generator. Parse crontab expressions into human-readable descriptions with next scheduled run times.',
  };
}

export default function CronExplainerPage() {
  return <CronExplainer />;
}
