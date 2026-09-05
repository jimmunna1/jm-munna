/* ==========================================================================
   JM Munna — Interaction Script
   Theme toggle, mobile nav, scroll-spy active link, and a light one-time
   reveal for section headers as they enter view.
   ========================================================================== */

(function () {
  const root = document.body;
  const themeToggle = document.getElementById('theme-toggle');
  const STORAGE_KEY = 'jm-munna-theme';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved) { applyTheme(saved); return; }
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }
  initTheme();

  /* ---- Mobile menu ---- */
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Scroll-spy active nav link ---- */
  const sections = ['home', 'about', 'skills', 'education', 'experience', 'projects', 'gallery', 'videos', 'certificates', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));

  function setActiveLink(id) {
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveLink(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(sec => spy.observe(sec));
  }

  /* ---- Reveal section headers once, on entry ---- */
  const revealables = document.querySelectorAll('.section-head');
  if ('IntersectionObserver' in window) {
    const revealer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal', 'in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    revealables.forEach(el => revealer.observe(el));
  }

  /* ---- Reveal cards/photos/videos as they scroll into view ----
     Runs after content-loader.js has injected the dynamic content,
     so it waits for the "content:loaded" event instead of DOMContentLoaded. */
  document.addEventListener('content:loaded', () => {
    const cardSelector = '.project-card, .gallery-item, .video-card, .cert-card, .skill-card, .timeline-item';
    const cards = Array.from(document.querySelectorAll(cardSelector));
    if (!cards.length) return;

    cards.forEach((el, i) => {
      el.classList.add('reveal-card');
      el.style.transitionDelay = ((i % 5) * 0.07) + 's';
    });

    if ('IntersectionObserver' in window) {
      const cardObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      cards.forEach(el => cardObserver.observe(el));
    } else {
      cards.forEach(el => el.classList.add('in'));
    }
  });
})();
