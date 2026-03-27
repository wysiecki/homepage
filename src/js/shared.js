// ── Footer year ───────────────────────────────────────────────
document.querySelectorAll('.footer-year').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ── Sub-page nav active state ─────────────────────────────────
const currentPath = window.location.pathname;
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
