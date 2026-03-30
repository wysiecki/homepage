import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { NavbarClient } from './NavbarClient';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import Image from 'next/image';

export function Navbar() {
  const t = useTranslations('Nav');

  return (
    <>
      <NavbarClient>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image src="/assets/logo.png" alt="Martin von Wysiecki" width={48} height={48} className="h-12 w-auto" priority />
            </Link>

            <div className="hidden md:flex items-center gap-10">
              <Link href="/" className="nav-link">{t('home')}</Link>
              <Link href="/tools" className="nav-link">{t('tools')}</Link>
              <Link href="/ai" className="nav-link">{t('aiRadar')}</Link>
              <Link href="/blog" className="nav-link">{t('blog')}</Link>
              <Link href="/quiz" className="nav-link">{t('quiz')}</Link>
              <LanguageSwitcher />
              <Link href="/#contact" className="btn-primary text-xs py-2.5 px-6">{t('contact')}</Link>
            </div>

            <MobileMenu />
          </div>
        </div>
      </NavbarClient>
    </>
  );
}
