/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ===== HAMBURGER MENU ===== */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

/* ===== LANGUAGE SWITCHER ===== */
let currentLang = 'tr';

function applyLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-tr]').forEach(el => {
    const val = lang === 'en' ? el.dataset.en : el.dataset.tr;
    if (val !== undefined) el.textContent = val;
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

/* ===== LAMP SPOTLIGHT EFFECT ===== */
const featuresGrid = document.getElementById('featuresGrid');
const featureCards = featuresGrid
  ? Array.from(featuresGrid.querySelectorAll('.feature-card'))
  : [];
const lampSvg = document.querySelector('.lamp-svg');

let _lampRect = null;
let _activeCard = null;
let _rafId = null;
let _pendingCard = null;
let _pendingX = 0;
let _pendingY = 0;

function getLampRect() {
  if (!_lampRect && lampSvg) _lampRect = lampSvg.getBoundingClientRect();
  return _lampRect;
}
window.addEventListener('resize', () => { _lampRect = null; }, { passive: true });
window.addEventListener('scroll', () => { _lampRect = null; }, { passive: true });

function updateLampAngle(card) {
  if (!lampSvg) return;
  const lampRect = getLampRect();
  const cardRect = card.getBoundingClientRect();
  const diff = (cardRect.left + cardRect.width / 2) - (lampRect.left + lampRect.width / 2);
  const angle = Math.max(-25, Math.min(25, -(diff / (window.innerWidth * 0.3)) * 25));
  lampSvg.style.transform = `rotate(${angle}deg)`;
}

function processFrame() {
  _rafId = null;
  const card = _pendingCard;
  if (!card) return;

  if (_activeCard !== card) {
    _activeCard = card;
    featureCards.forEach(c => {
      c.classList.toggle('lit', c === card);
      c.classList.toggle('dim', c !== card);
    });
    updateLampAngle(card);
  }

  const rect = card.getBoundingClientRect();
  card.style.setProperty('--mouse-x', ((_pendingX - rect.left) / rect.width * 100) + '%');
  card.style.setProperty('--mouse-y', ((_pendingY - rect.top) / rect.height * 100) + '%');
}

function scheduleUpdate(card, x, y) {
  _pendingCard = card;
  _pendingX = x;
  _pendingY = y;
  if (!_rafId) _rafId = requestAnimationFrame(processFrame);
}

function deactivateAll() {
  _activeCard = null;
  _pendingCard = null;
  if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
  featureCards.forEach(c => c.classList.remove('lit', 'dim'));
  if (lampSvg) lampSvg.style.transform = 'rotate(0deg)';
}

featureCards.forEach(card => {
  card.addEventListener('mousemove', (e) => scheduleUpdate(card, e.clientX, e.clientY), { passive: true });
  card.addEventListener('mouseenter', (e) => scheduleUpdate(card, e.clientX, e.clientY), { passive: true });
});

if (featuresGrid) {
  featuresGrid.addEventListener('mouseleave', deactivateAll, { passive: true });
}

/* ===== SMOOTH SCROLL FOR NAV LINKS ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 68;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ===== INTERSECTION OBSERVER — fade in sections ===== */
const fadeEls = document.querySelectorAll('.problem-card, .feature-card, .step, .cta-box');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  observer.observe(el);
});
