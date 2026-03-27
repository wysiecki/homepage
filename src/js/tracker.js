/**
 * Lightweight, privacy-friendly analytics tracker.
 * No cookies, no localStorage, no fingerprinting.
 * Sends a single pageview beacon on each page load.
 */
(function () {
  'use strict';

  if (navigator.doNotTrack === '1') return;

  const data = JSON.stringify({
    path: location.pathname,
    referrer:
      document.referrer && new URL(document.referrer).origin !== location.origin
        ? document.referrer
        : '',
    screenWidth: screen.width,
    screenHeight: screen.height,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/pageview', new Blob([data], { type: 'application/json' }));
  } else {
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
      keepalive: true,
    }).catch(function () {});
  }
})();
