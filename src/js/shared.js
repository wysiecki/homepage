// ── Language detection & auto-redirect ────────────────────────
// Uses setTimeout so the rest of the script still runs (language switcher, etc.)
(function () {
  const path = window.location.pathname;
  const currentLang = path.startsWith('/de/') ? 'de' : path.startsWith('/pl/') ? 'pl' : 'en';
  const stored = localStorage.getItem('preferredLang');

  function redirect(lang) {
    setTimeout(() => window.location.replace('/' + lang + path), 0);
  }

  // Auto-redirect first-time visitors based on browser language
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
  // Redirect if stored preference differs from current (only from English)
  if (stored && stored !== 'en' && stored !== currentLang && currentLang === 'en') {
    redirect(stored);
  }
})();

// ── Footer year ───────────────────────────────────────────────
document.querySelectorAll('.footer-year').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ── Sub-page nav active state ─────────────────────────────────
const currentPath = window.location.pathname.replace(/^\/(de|pl)/, '');
document.querySelectorAll('[data-nav-page]').forEach((link) => {
  const page = link.getAttribute('data-nav-page');
  if (currentPath === page || currentPath.startsWith(page + '/')) {
    link.classList.add('active');
  }
});

// ── Reveal animations (Intersection Observer) ────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Fallback — force reveal after 3s if observer never fires
    setTimeout(() => {
      document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => {
        el.classList.add('revealed');
      });
    }, 3000);
  });
}

// ── Mobile menu toggle (sub-pages) ───────────────────────────
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileMenuBtn && mobileMenu) {
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
}

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

  // Desktop dropdown toggle
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

  // All language switch links (desktop + mobile)
  document.querySelectorAll('[data-switch-lang]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchLang(link.dataset.switchLang);
    });
  });
})();
