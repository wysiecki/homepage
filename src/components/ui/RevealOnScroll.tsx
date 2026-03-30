'use client';

import { useRef, useEffect, useState, type ReactNode } from 'react';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}

export function RevealOnScroll({ children, className = '', stagger = false }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(el);

    const fallback = setTimeout(() => setRevealed(true), 3000);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  const classes = `reveal ${stagger ? 'stagger' : ''} ${revealed ? 'revealed' : ''} ${className}`.trim();

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
