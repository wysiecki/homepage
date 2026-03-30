'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: Record<string, unknown>
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
}

export function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/config');
        const config = await res.json();
        const siteKey = config.turnstileSiteKey || '';
        if (!siteKey || cancelled) return;

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.setAttribute('data-cfasync', 'false');
        document.body.appendChild(script);

        await new Promise<void>((resolve, reject) => {
          let elapsed = 0;
          const check = setInterval(() => {
            elapsed += 100;
            if (window.turnstile) {
              clearInterval(check);
              resolve();
            } else if (elapsed >= 10000) {
              clearInterval(check);
              reject(new Error('Turnstile script failed to load'));
            }
          }, 100);
        });

        if (cancelled || !containerRef.current) return;

        window.turnstile!.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'auto',
          callback: (token: string) => onVerify(token),
          'error-callback': () => console.error('[Turnstile] Challenge error'),
          'expired-callback': () => console.warn('[Turnstile] Token expired'),
        });

        setLoaded(true);
      } catch (err) {
        console.error('[Turnstile]', (err as Error).message || err);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [loaded, onVerify]);

  return <div ref={containerRef} className="flex justify-center" />;
}
