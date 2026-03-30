import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { JsonFormatter } from '@/components/tools/JsonFormatter';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Tools');
  return {
    title: `${t('jsonFormatter.title')} — Free Online JSON Beautifier`,
    description: 'Free online JSON formatter, validator, and beautifier. Format, minify, and validate JSON with error detection showing line and column. No signup required.',
  };
}

export default function JsonFormatterPage() {
  return <JsonFormatter />;
}
