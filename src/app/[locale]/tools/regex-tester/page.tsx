import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { RegexTester } from '@/components/tools/RegexTester';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Tools');
  return {
    title: `${t('regexTester.title')} — Free Online Regular Expression Tester`,
    description: 'Free online regex tester with live match highlighting, capture groups, and flag support. Test regular expressions instantly in your browser.',
  };
}

export default function RegexTesterPage() {
  return <RegexTester />;
}
