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

function onScroll() {
  const y = window.scrollY;

  // Background
  if (y > NAVBAR_SCROLL_THRESHOLD) {
    navbar.classList.add('bg-surface-base/90', 'backdrop-blur-md');
  } else {
    navbar.classList.remove('bg-surface-base/90', 'backdrop-blur-md');
  }

  // Active section
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach((section) => {
    if (y >= section.offsetTop - SECTION_OFFSET) {
      current = section.id;
    }
  });

  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
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
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
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
const phrases = [
  'Full-Stack Developer',
  'CEO & Tech Solutions',
  'Mobile App Creator',
  'Database Architect',
  'Available for Projects',
];
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

// ── Turnstile captcha ─────────────────────────────────────────
(async () => {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    const siteKey = config.turnstileSiteKey || '';
    if (!siteKey) return;

    // Wait for Turnstile script to load (async defer), max 10s
    await new Promise((resolve, reject) => {
      if (window.turnstile) return resolve();
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

// ── Contact form ───────────────────────────────────────────────
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Sending...';
  btn.disabled = true;

  const turnstileResponse = form.querySelector('[name="cf-turnstile-response"]')?.value;
  if (!turnstileResponse) {
    btn.textContent = 'Please complete the captcha';
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

    btn.textContent = 'Sent!';
    form.reset();
    if (window.turnstile) turnstile.reset();
  } catch (err) {
    const isNetwork = err instanceof TypeError;
    btn.textContent = isNetwork
      ? 'Network error — check connection'
      : err.message || 'Error — try again';
    console.error('[Contact]', isNetwork ? 'Network error' : err.message);
  }

  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;
  }, FORM_RESET_MS);
});
