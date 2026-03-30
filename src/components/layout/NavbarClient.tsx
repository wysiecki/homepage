'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from '@/i18n/navigation';

export function NavbarClient({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showBg = !isHomepage || scrolled;

  return (
    <nav
      id="navbar"
      className={`fixed top-0 w-full z-50 transition-colors duration-200 ${
        showBg ? 'bg-surface-base/90 backdrop-blur-md' : ''
      }`}
    >
      {children}
    </nav>
  );
}
