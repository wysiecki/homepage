import { useTranslations } from 'next-intl';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

export function ServicesSection() {
  const t = useTranslations('Services');

  const services = [
    {
      key: 'web' as const,
      icon: (
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
        </svg>
      ),
      iconBg: 'bg-primary-container/10',
      hoverColor: 'group-hover:text-primary',
    },
    {
      key: 'database' as const,
      icon: (
        <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75m16.5 3.75v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" />
        </svg>
      ),
      iconBg: 'bg-secondary-container/10',
      hoverColor: 'group-hover:text-secondary',
    },
    {
      key: 'mobile' as const,
      icon: (
        <svg className="w-6 h-6 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
      ),
      iconBg: 'bg-tertiary-container/10',
      hoverColor: 'group-hover:text-tertiary',
    },
  ];

  return (
    <section id="services" className="section bg-surface-low">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <RevealOnScroll className="mb-16">
          <p className="section-label">{t('label')}</p>
          <h2 className="section-heading">
            {t('heading1')}
            <br />
            <span className="text-primary">{t('heading2')}</span>
          </h2>
        </RevealOnScroll>

        <RevealOnScroll className="grid md:grid-cols-3 gap-8" stagger>
            {services.map(({ key, icon, iconBg, hoverColor }) => (
              <div key={key} className="card p-8 group">
                <div className={`w-12 h-12 flex items-center justify-center mb-6 rounded-cyber ${iconBg}`}>
                  {icon}
                </div>
                <h3 className={`font-display text-xl font-semibold mb-3 ${hoverColor} transition-colors`}>
                  {t(`${key}.title`)}
                </h3>
                <p className="text-on-surface/50 text-sm leading-relaxed mb-5">
                  {t(`${key}.description`)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(t.raw(`${key}.tags`) as string[]).map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
