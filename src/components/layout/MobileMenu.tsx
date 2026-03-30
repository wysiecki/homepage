'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/navigation';

const locales = ['en', 'de', 'pl'] as const;
const labels: Record<string, string> = { en: 'EN', de: 'DE', pl: 'PL' };

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('Nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function close() {
    setOpen(false);
    document.body.classList.remove('overflow-hidden');
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    document.body.classList.toggle('overflow-hidden', next);
  }

  function switchLocale(l: string) {
    close();
    router.replace(pathname, { locale: l });
  }

  const links = [
    { href: '/' as const, label: t('home') },
    { href: '/tools' as const, label: t('tools') },
    { href: '/ai' as const, label: t('aiRadar') },
    { href: '/blog' as const, label: t('blog') },
    { href: '/quiz' as const, label: t('quiz') },
  ];

  return (
    <>
      <button
        onClick={toggle}
        className="md:hidden p-2 cursor-pointer text-on-surface"
        aria-label={t('openMenu')}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div
        className={`fixed inset-0 z-40 bg-surface-base transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-10">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              className="font-display text-3xl text-on-surface hover:text-primary transition-colors cursor-pointer"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/#contact"
            onClick={close}
            className="font-display text-3xl text-on-surface hover:text-primary transition-colors cursor-pointer"
          >
            {t('contact')}
          </Link>
          <div className="flex gap-4 mt-4">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                className={`font-mono text-sm transition-colors ${
                  l === locale ? 'text-primary' : 'text-on-surface/40 hover:text-primary'
                }`}
              >
                {labels[l]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
