import { useTranslations } from 'next-intl';
import { HeroReveal } from '@/components/ui/HeroReveal';
import { TypewriterWrapper } from './TypewriterWrapper';

export function HeroSection() {
  const t = useTranslations('Hero');

  return (
    <section id="home" className="min-h-dvh flex flex-col justify-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full pt-24">
        <div className="max-w-4xl">
          <HeroReveal>
            <p
              className="font-mono text-sm tracking-wider text-primary/60 mb-6 hero-reveal"
              style={{ '--delay': '0ms' } as React.CSSProperties}
            >
              {t('label')}
            </p>
            <h1
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8 hero-reveal"
              style={{ '--delay': '100ms' } as React.CSSProperties}
            >
              {t('heading1')}
              <br />
              <span className="text-primary">{t('heading2')}</span>
              <br />
              {t('heading3')}
            </h1>
            <div
              className="flex items-center gap-3 mb-8 hero-reveal"
              style={{ '--delay': '200ms' } as React.CSSProperties}
            >
              <span className="status-beacon" />
              <TypewriterWrapper />
            </div>
            <p
              className="text-lg md:text-xl leading-relaxed text-on-surface/50 max-w-xl mb-10 hero-reveal text-balance"
              style={{ '--delay': '300ms' } as React.CSSProperties}
            >
              {t('subtitle')}
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 hero-reveal"
              style={{ '--delay': '400ms' } as React.CSSProperties}
            >
              <a href="#work" className="btn-primary">
                {t('ctaWork')}
              </a>
              <a href="#contact" className="btn-ghost">
                {t('ctaContact')}
              </a>
            </div>
          </HeroReveal>
        </div>
      </div>

      {/* Decorative glass code snippets (lg only) */}
      <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-8 xl:right-16 max-w-xs">
        <div className="glass p-5 mb-4 opacity-40">
          <pre className="font-mono text-xs leading-relaxed text-primary/70">
            <code>{`const buildSolution = async
  (requirements) => {
  const tech = ['React',
    'Node.js', 'Python'];
  return scalableApp.deploy();
};`}</code>
          </pre>
        </div>
        <div className="glass p-5 opacity-25 ml-8">
          <pre className="font-mono text-xs leading-relaxed text-secondary/60">
            <code>{`deploy(architect)
  .then(innovate)
  .catch(debug);`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
