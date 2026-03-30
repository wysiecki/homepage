import { useTranslations } from 'next-intl';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

export function CtaSection() {
  const t = useTranslations('CTA');

  return (
    <section className="py-32 md:py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-base via-primary-container/5 to-surface-base" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative">
        <RevealOnScroll>
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6">
            {t('heading1')}
            <br />
            {t('heading2')}
            <br />
            <span className="text-primary">{t('heading3')}</span>
          </h2>
          <p className="text-on-surface/50 text-lg md:text-xl max-w-lg mx-auto mb-10">
            {t('subtitle')}
          </p>
          <a href="#contact" className="btn-primary text-base px-10 py-4">
            {t('button')}
          </a>
        </RevealOnScroll>
      </div>
    </section>
  );
}
