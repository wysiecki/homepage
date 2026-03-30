import { useTranslations } from 'next-intl';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

export function WorkSection() {
  const t = useTranslations('Work');

  const projects = [
    {
      key: 'mspharm' as const,
      url: 'https://mspharm.eu',
      number: '01',
      gradientFrom: 'from-primary-container/30',
      numberColor: 'text-primary/10',
      hoverColor: 'group-hover:text-primary',
    },
    {
      key: 'waidwiki' as const,
      url: 'https://waidwiki.de',
      number: '02',
      gradientFrom: 'from-secondary-container/20',
      numberColor: 'text-secondary/10',
      hoverColor: 'group-hover:text-secondary',
    },
  ];

  return (
    <section id="work" className="section bg-surface-low">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <RevealOnScroll className="mb-16">
          <p className="section-label">{t('label')}</p>
          <h2 className="section-heading">
            {t('heading1')}
            <br />
            <span className="text-primary">{t('heading2')}</span>
          </h2>
        </RevealOnScroll>

        <RevealOnScroll className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto" stagger>
            {projects.map(({ key, url, number, gradientFrom, numberColor, hoverColor }) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="card overflow-hidden group"
              >
                <div className={`aspect-[4/3] relative bg-gradient-to-br ${gradientFrom} to-surface-high`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`font-display text-7xl font-bold ${numberColor}`}>{number}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3 className={`font-display text-xl font-semibold mb-2 ${hoverColor} transition-colors`}>
                    {t(`${key}.title`)}
                  </h3>
                  <p className="text-on-surface/50 text-sm leading-relaxed mb-4">
                    {t(`${key}.description`)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(t.raw(`${key}.tags`) as string[]).map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
