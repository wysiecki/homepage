'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (navigator.doNotTrack === '1') return;

    const data = JSON.stringify({
      path: pathname,
      referrer:
        document.referrer &&
        new URL(document.referrer).origin !== location.origin
          ? document.referrer
          : '',
      screenWidth: screen.width,
      screenHeight: screen.height,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/analytics/pageview',
        new Blob([data], { type: 'application/json' }),
      );
    } else {
      fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
