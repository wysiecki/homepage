import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Quiz } from '@/components/quiz/Quiz';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Quiz');
  return {
    title: `${t('title')} — What Tech Stack Should You Use? | wysiecki.de`,
    description: t('subtitle'),
  };
}

export default function QuizPage() {
  return (
    <main className="pt-32 pb-24">
      <Quiz />
    </main>
  );
}
