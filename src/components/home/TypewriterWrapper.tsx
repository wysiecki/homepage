'use client';

import { useTranslations } from 'next-intl';
import { Typewriter } from '@/components/ui/Typewriter';

export function TypewriterWrapper() {
  const t = useTranslations('Hero');
  const phrases = t.raw('typewriterPhrases') as string[];

  return <Typewriter phrases={phrases} />;
}
