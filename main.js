/* ── main.js — Gill Engineering Works ── */
'use strict';

/* ─── NAV SCROLL & HAMBURGER ─── */
const header     = document.getElementById('site-header');
const hamburger  = document.getElementById('hamburger-btn');
const drawer     = document.getElementById('mobile-drawer');
const mobLinks   = drawer.querySelectorAll('.mob-link, .mob-cta');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const isOpen = drawer.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  drawer.setAttribute('aria-hidden', !isOpen);
});

mobLinks.forEach(link => {
  link.addEventListener('click', () => {
    drawer.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  });
});

/* ─── SMOOTH ACTIVE NAV LINKS ─── */
const navLinks   = document.querySelectorAll('.nav-link');
const sections   = document.querySelectorAll('section[id], div[id]');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));

/* ─── SCROLL REVEAL ANIMATIONS ─── */
const revealEls = document.querySelectorAll(
  '.service-card, .why-card, .work-item, .about-inner > *, .contact-inner > *, .section-header'
);

const revealObs = new IntersectionObserver(entries => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el  = entry.target;
      const del = parseInt(el.dataset.delay || 0);
      setTimeout(() => {
        el.style.opacity    = '1';
        el.style.transform  = 'translateY(0)';
      }, del);
      revealObs.unobserve(el);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach((el, i) => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  if (!el.dataset.delay) el.dataset.delay = (i % 6) * 60;
  revealObs.observe(el);
});

/* ─── ANIMATED STAT COUNTERS ─── */
function animateCount(el, target, suffix, duration) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + (suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const statObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num[data-target]');
      nums.forEach(num => {
        const target = parseInt(num.dataset.target);
        const suffix = num.dataset.suffix || '';
        animateCount(num, target, suffix, 1600);
      });
      statObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statObs.observe(heroStats);

/* ─── WORK GALLERY FILTER ─── */
const filterBtns = document.querySelectorAll('.filter-btn');
const workItems  = document.querySelectorAll('.work-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    workItems.forEach(item => {
      const cat = item.dataset.cat;
      const show = filter === 'all' || cat === filter;
      item.style.display = show ? '' : 'none';
      if (show) {
        requestAnimationFrame(() => {
          item.style.opacity   = '0';
          item.style.transform = 'scale(0.92)';
          item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          requestAnimationFrame(() => {
            item.style.opacity   = '1';
            item.style.transform = 'scale(1)';
          });
        });
      }
    });
  });
});

/* ─── TESTIMONIALS CAROUSEL ─── */
(function () {
  const track   = document.getElementById('testi-track');
  const dotsWrap= document.getElementById('testi-dots');
  const prevBtn = document.getElementById('testi-prev');
  const nextBtn = document.getElementById('testi-next');
  const cards   = track ? track.querySelectorAll('.testi-card') : [];
  if (!cards.length) return;

  let current = 0;
  const getVisible = () => window.innerWidth < 769 ? 1 : window.innerWidth < 1025 ? 2 : 3;
  const getMaxIndex = () => Math.max(0, cards.length - getVisible());

  /* Build dots */
  function buildDots() {
    dotsWrap.innerHTML = '';
    const maxIdx = getMaxIndex();
    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(idx) {
    const maxIdx = getMaxIndex();
    if (idx > maxIdx) idx = 0;
    else if (idx < 0) idx = maxIdx;
    current = idx;

    const card = cards[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 18;
    const step = card.offsetWidth + gap;
    track.style.transform = `translateX(-${current * step}px)`;
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  /* Touch swipe support */
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
  });

  buildDots();
  goTo(0);
  window.addEventListener('resize', () => {
    buildDots();
    goTo(Math.min(current, getMaxIndex()));
  });

  /* Auto-advance */
  let timer = setInterval(() => goTo(current + 1), 6000);
  track.addEventListener('mouseenter', () => clearInterval(timer));
  track.addEventListener('mouseleave', () => { timer = setInterval(() => goTo(current + 1), 6000); });
})();

/* ─── CONTACT FORM ─── */
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');
const submitBtn = document.getElementById('form-submit-btn');

form?.addEventListener('submit', e => {
  e.preventDefault();
  const name  = form.querySelector('#f-name').value.trim();
  const phone = form.querySelector('#f-phone').value.trim();
  if (!name || !phone) {
    form.querySelectorAll('input[required]').forEach(inp => {
      if (!inp.value.trim()) inp.style.borderColor = '#f87171';
    });
    return;
  }
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  /* Simulate send */
  setTimeout(() => {
    form.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg> Send Message`;
    success.textContent = '✅ Thank you! We\'ll be in touch shortly.';
    success.classList.add('visible');
    setTimeout(() => success.classList.remove('visible'), 5000);
  }, 1200);
});

/* Reset red border on input */
form?.querySelectorAll('input').forEach(inp => {
  inp.addEventListener('input', () => inp.style.borderColor = '');
});

/* ─── NAV ACTIVE STYLE ─── */
const navStyle = document.createElement('style');
navStyle.textContent = `.nav-link.active { color: #fff !important; }`;
document.head.appendChild(navStyle);
