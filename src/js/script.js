// ── Language detection & auto-redirect ────────────────────────
// Uses setTimeout so the rest of the script still runs (language switcher, etc.)
(function () {
  const path = window.location.pathname;
  const currentLang = path.startsWith('/de/') ? 'de' : path.startsWith('/pl/') ? 'pl' : 'en';
  const stored = localStorage.getItem('preferredLang');

  function redirect(lang) {
    setTimeout(() => window.location.replace('/' + lang + path), 0);
  }

  if (!stored && currentLang === 'en') {
    const browserLang = (navigator.language || '').slice(0, 2);
    if (browserLang === 'de') {
      localStorage.setItem('preferredLang', 'de');
      redirect('de');
    } else if (browserLang === 'pl') {
      localStorage.setItem('preferredLang', 'pl');
      redirect('pl');
    }
  }
  if (stored && stored !== 'en' && stored !== currentLang && currentLang === 'en') {
    redirect(stored);
  }
})();

// ── Language helper ───────────────────────────────────────────
const pageLang = document.documentElement.lang || 'en';

// ── Footer year ───────────────────────────────────────────────
document.querySelectorAll('.footer-year').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ── Constants ─────────────────────────────────────────────────
const NAVBAR_SCROLL_THRESHOLD = 60;
const SECTION_OFFSET = 120;
const REVEAL_FALLBACK_MS = 3000;
const TYPEWRITER_TYPE_MS = 80;
const TYPEWRITER_DELETE_MS = 40;
const TYPEWRITER_PAUSE_MS = 2200;
const TYPEWRITER_GAP_MS = 400;
const FORM_RESET_MS = 3000;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Navbar ─────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');

// Partial includes bg by default (for subpages). Homepage starts transparent.
navbar.classList.remove('bg-surface-base/90', 'backdrop-blur-md');

function onScroll() {
  const y = window.scrollY;

  if (y > NAVBAR_SCROLL_THRESHOLD) {
    navbar.classList.add('bg-surface-base/90', 'backdrop-blur-md');
  } else {
    navbar.classList.remove('bg-surface-base/90', 'backdrop-blur-md');
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Mobile menu ────────────────────────────────────────────────
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
let menuOpen = false;

mobileMenuBtn.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('translate-x-full', !menuOpen);
  mobileMenu.classList.toggle('translate-x-0', menuOpen);
  document.body.classList.toggle('overflow-hidden', menuOpen);
});

document.querySelectorAll('.mobile-menu-link').forEach((link) => {
  link.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.add('translate-x-full');
    mobileMenu.classList.remove('translate-x-0');
    document.body.classList.remove('overflow-hidden');
  });
});

// ── Smooth scroll ──────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  const href = anchor.getAttribute('href');
  if (href.length <= 1) return; // skip bare "#" links (e.g. language switcher)
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Hero stagger reveal ────────────────────────────────────────
function revealHero() {
  const items = document.querySelectorAll('.hero-reveal');
  if (prefersReducedMotion) {
    items.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }
  items.forEach((el) => {
    const delay = parseInt(el.style.getPropertyValue('--delay') || '0');
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200 + delay);
  });
}

// Set initial state
document.querySelectorAll('.hero-reveal').forEach((el) => {
  if (prefersReducedMotion) {
    el.style.opacity = '1';
  } else {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition =
      'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
  }
});

window.addEventListener('load', revealHero);

// ── Intersection Observer for reveals ──────────────────────────
if (prefersReducedMotion) {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('revealed'));
} else {
  requestAnimationFrame(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01 }
    );

    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    // Safety fallback — force-reveal if observer never fires
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
        el.classList.add('revealed');
      });
    }, REVEAL_FALLBACK_MS);
  });
}

// ── Typewriter ─────────────────────────────────────────────────
const typewriterEl = document.getElementById('typewriter-text');
const phrasesByLang = {
  en: [
    'Full-Stack Developer',
    'CEO & Tech Solutions',
    'Mobile App Creator',
    'Database Architect',
    'Available for Projects',
  ],
  de: [
    'Full-Stack-Entwickler',
    'CEO & Tech-Lösungen',
    'Mobile-App-Entwickler',
    'Datenbank-Architekt',
    'Verfügbar für Projekte',
  ],
  pl: [
    'Full-Stack Developer',
    'CEO & Rozwiązania IT',
    'Twórca aplikacji mobilnych',
    'Architekt baz danych',
    'Dostępny na projekty',
  ],
};
const phrases = phrasesByLang[pageLang] || phrasesByLang.en;
let phraseIdx = 0;
let charIdx = 0;
let deleting = false;

function typeWriter() {
  const phrase = phrases[phraseIdx];

  if (deleting) {
    charIdx--;
    typewriterEl.textContent = phrase.substring(0, charIdx);
  } else {
    charIdx++;
    typewriterEl.textContent = phrase.substring(0, charIdx);
  }

  if (!deleting && charIdx === phrase.length) {
    setTimeout(() => {
      deleting = true;
      typeWriter();
    }, TYPEWRITER_PAUSE_MS);
    return;
  }

  if (deleting && charIdx === 0) {
    deleting = false;
    phraseIdx = (phraseIdx + 1) % phrases.length;
    setTimeout(typeWriter, TYPEWRITER_GAP_MS);
    return;
  }

  setTimeout(typeWriter, deleting ? TYPEWRITER_DELETE_MS : TYPEWRITER_TYPE_MS);
}

typeWriter();

// ── Turnstile captcha (lazy-loaded on contact form interaction) ──
let turnstileLoaded = false;

function loadTurnstile() {
  if (turnstileLoaded) return;
  turnstileLoaded = true;

  (async () => {
    try {
      const res = await fetch('/api/config');
      const config = await res.json();
      const siteKey = config.turnstileSiteKey || '';
      if (!siteKey) return;

      // Inject the Turnstile script dynamically
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.setAttribute('data-cfasync', 'false');
      document.body.appendChild(script);

      // Wait for Turnstile to load, max 10s
      await new Promise((resolve, reject) => {
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

      turnstile.render('#turnstile-container', {
        sitekey: siteKey,
        theme: 'auto',
        callback: (token) => console.log('[Turnstile] Verified, token received'),
        'error-callback': () => console.error('[Turnstile] Challenge error'),
        'expired-callback': () => console.warn('[Turnstile] Token expired'),
      });
    } catch (err) {
      console.error('[Turnstile]', err.message || err);
    }
  })();
}

// Load Turnstile when user interacts with the contact form
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('focusin', loadTurnstile, { once: true });
contactForm.addEventListener('pointerenter', loadTurnstile, { once: true });

// ── Contact form ───────────────────────────────────────────────
const formMessages = {
  en: {
    sending: 'Sending...',
    sent: 'Sent!',
    captcha: 'Please complete the captcha',
    network: 'Network error — check connection',
    fallback: 'Error — try again',
  },
  de: {
    sending: 'Wird gesendet...',
    sent: 'Gesendet!',
    captcha: 'Bitte Captcha ausfüllen',
    network: 'Netzwerkfehler — Verbindung prüfen',
    fallback: 'Fehler — erneut versuchen',
  },
  pl: {
    sending: 'Wysyłanie...',
    sent: 'Wysłano!',
    captcha: 'Proszę uzupełnić captcha',
    network: 'Błąd sieci — sprawdź połączenie',
    fallback: 'Błąd — spróbuj ponownie',
  },
};
const fm = formMessages[pageLang] || formMessages.en;

document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = fm.sending;
  btn.disabled = true;

  const turnstileResponse = form.querySelector('[name="cf-turnstile-response"]')?.value;
  if (!turnstileResponse) {
    btn.textContent = fm.captcha;
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, FORM_RESET_MS);
    return;
  }

  const data = {
    name: form.querySelector('#name').value,
    email: form.querySelector('#email').value,
    message: form.querySelector('#message').value,
    'cf-turnstile-response': turnstileResponse,
  };

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(body.error || 'Something went wrong.');
    }

    btn.textContent = fm.sent;
    form.reset();
    if (window.turnstile) turnstile.reset();
  } catch (err) {
    const isNetwork = err instanceof TypeError;
    btn.textContent = isNetwork ? fm.network : err.message || fm.fallback;
    console.error('[Contact]', isNetwork ? 'Network error' : err.message);
  }

  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;
  }, FORM_RESET_MS);
});

// ── Language switcher ─────────────────────────────────────────
(function () {
  function switchLang(targetLang) {
    const path = window.location.pathname;
    const currentLang = path.startsWith('/de/') ? 'de' : path.startsWith('/pl/') ? 'pl' : 'en';
    let basePath = path;
    if (currentLang === 'de') basePath = path.replace(/^\/de/, '') || '/';
    if (currentLang === 'pl') basePath = path.replace(/^\/pl/, '') || '/';
    const newPath = targetLang === 'en' ? basePath : '/' + targetLang + basePath;
    localStorage.setItem('preferredLang', targetLang);
    window.location.href = newPath;
  }

  document.querySelectorAll('[data-lang-switcher]').forEach((switcher) => {
    const btn = switcher.querySelector('button');
    const dropdown = switcher.querySelector('.lang-dropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => dropdown.classList.add('hidden'));
  });

  document.querySelectorAll('[data-switch-lang]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchLang(link.dataset.switchLang);
    });
  });
})();
