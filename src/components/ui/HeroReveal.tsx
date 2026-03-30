'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function HeroReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = el.querySelectorAll<HTMLElement>('.hero-reveal');

    items.forEach((item) => {
      if (prefersReduced) {
        item.style.opacity = '1';
        item.style.transform = 'none';
        return;
      }
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px)';
      item.style.transition =
        'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    if (prefersReduced) return;

    requestAnimationFrame(() => {
      items.forEach((item) => {
        const delay = parseInt(item.style.getPropertyValue('--delay') || '0');
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 200 + delay);
      });
    });
  }, []);

  return <div ref={ref}>{children}</div>;
}
