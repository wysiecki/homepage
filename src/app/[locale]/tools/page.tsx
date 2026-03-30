import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Tools');
  return {
    title: `${t('title')} — Free Online Dev Tools`,
    description: t('subtitle'),
  };
}

const tools = [
  {
    key: 'jsonFormatter' as const,
    href: '/tools/json-formatter',
    icon: (
      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    iconBg: 'bg-primary-container/10',
    hoverColor: 'group-hover:text-primary',
  },
  {
    key: 'base64' as const,
    href: '/tools/base64',
    icon: (
      <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    iconBg: 'bg-secondary-container/10',
    hoverColor: 'group-hover:text-secondary',
  },
  {
    key: 'regexTester' as const,
    href: '/tools/regex-tester',
    icon: (
      <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    iconBg: 'bg-tertiary-container/10',
    hoverColor: 'group-hover:text-tertiary',
  },
  {
    key: 'cronExplainer' as const,
    href: '/tools/cron-explainer',
    icon: (
      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: 'bg-primary-container/10',
    hoverColor: 'group-hover:text-primary',
  },
  {
    key: 'jwtDecoder' as const,
    href: '/tools/jwt-decoder',
    icon: (
      <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
    iconBg: 'bg-secondary-container/10',
    hoverColor: 'group-hover:text-secondary',
  },
  {
    key: 'colorConverter' as const,
    href: '/tools/color-converter',
    icon: (
      <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
      </svg>
    ),
    iconBg: 'bg-tertiary-container/10',
    hoverColor: 'group-hover:text-tertiary',
  },
];

export default function ToolsPage() {
  const t = useTranslations('Tools');

  return (
    <main className="pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <RevealOnScroll className="mb-16">
          <p className="section-label">{t('title')}</p>
          <h1 className="section-heading mb-4">
            Free Online<br />
            <span className="text-primary">Dev Tools</span>
          </h1>
          <p className="text-on-surface/50 text-lg max-w-xl">
            {t('subtitle')}
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(({ key, href, icon, iconBg, hoverColor }) => (
              <Link key={key} href={href} className="card p-6 group">
                <div className={`w-10 h-10 flex items-center justify-center mb-4 rounded-cyber ${iconBg}`}>
                  {icon}
                </div>
                <h2 className={`font-display text-lg font-semibold mb-2 ${hoverColor} transition-colors`}>
                  {t(`${key}.title`)}
                </h2>
                <p className="text-on-surface/50 text-sm">
                  {t(`${key}.description`)}
                </p>
              </Link>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </main>
  );
}
