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
navStyle.textContent = `.nav-link.active { color: var(--orange) !important; background: var(--orange-light) !important; }`;
document.head.appendChild(navStyle);

/* ══════════════════════════════════════════════════════════════
   1. INTERACTIVE WELDING ARC & SPARK PHYSICS ENGINE
   Realistic gravity, air resistance, thermal decay & cooling
══════════════════════════════════════════════════════════════ */
(function initWeldingSparkPhysics() {
  const canvas = document.getElementById('hero-spark-canvas');
  const hero   = document.getElementById('hero');
  const tip    = document.getElementById('hero-spark-tip');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width  = 0;
  let height = 0;
  let dpr    = Math.min(window.devicePixelRatio || 1, 2);
  let isHeroVisible = true;
  let animId = null;

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    width  = rect.width;
    height = rect.height;
    dpr    = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  // Particle pool
  const sparks = [];
  const MAX_SPARKS = 250;

  class Spark {
    constructor(x, y, vx, vy, isEmbers = false) {
      this.x     = x;
      this.y     = y;
      this.px    = x;
      this.py    = y;
      this.vx    = vx;
      this.vy    = vy;
      this.life  = 1.0;
      this.decay = isEmbers ? (0.005 + Math.random() * 0.008) : (0.014 + Math.random() * 0.022);
      this.size  = isEmbers ? (1.5 + Math.random() * 2) : (1.8 + Math.random() * 2.8);
      this.isEmbers = isEmbers;
      this.gravity = isEmbers ? -0.04 : (0.16 + Math.random() * 0.12);
      this.friction = 0.982;
    }

    update() {
      this.px = this.x;
      this.py = this.y;
      this.vx *= this.friction;
      this.vy = (this.vy + this.gravity) * this.friction;
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;

      // Subtle ground bounce
      if (!this.isEmbers && this.y >= height - 4) {
        this.y = height - 4;
        this.vy = -this.vy * 0.38;
        this.vx *= 0.7;
      }
    }

    draw(ctx) {
      if (this.life <= 0) return;
      ctx.save();
      ctx.lineWidth = Math.max(1, this.size * this.life);
      ctx.lineCap = 'round';

      // Realistic welding thermal color shift:
      // White-hot core -> Electric arc cyan -> Deep Royal Blue -> Extinguish
      let strokeColor, glowColor;
      if (this.life > 0.75) {
        strokeColor = `rgba(255, 255, 255, ${this.life})`;
        glowColor   = `rgba(56, 189, 248, 0.9)`;
      } else if (this.life > 0.4) {
        strokeColor = `rgba(56, 189, 248, ${this.life * 1.1})`;
        glowColor   = `rgba(37, 99, 235, 0.7)`;
      } else {
        strokeColor = `rgba(29, 104, 189, ${this.life * 1.3})`;
        glowColor   = `rgba(15, 23, 42, 0.4)`;
      }

      ctx.strokeStyle = strokeColor;
      ctx.shadowBlur  = this.isEmbers ? 6 : 14;
      ctx.shadowColor = glowColor;

      ctx.beginPath();
      ctx.moveTo(this.px, this.py);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();

      ctx.restore();
    }
  }

  function emitSparksAt(x, y, count, isArcBurst = false) {
    if (sparks.length > MAX_SPARKS) return;
    for (let i = 0; i < count; i++) {
      const angle = isArcBurst
        ? Math.random() * Math.PI * 2
        : (Math.random() * Math.PI * 1.5 - Math.PI * 0.75); // spray out & upwards
      const speed = isArcBurst
        ? (3 + Math.random() * 8.5)
        : (2 + Math.random() * 6);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - (isArcBurst ? 1 : 2.5);
      sparks.push(new Spark(x, y, vx, vy, false));
    }
  }

  // Pointer / Touch Handlers
  let hasInteracted = false;
  function markInteraction() {
    if (!hasInteracted && tip) {
      tip.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      tip.style.opacity = '0';
      tip.style.transform = 'translateY(-6px)';
      setTimeout(() => tip.remove(), 700);
      hasInteracted = true;
    }
  }

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    emitSparksAt(x, y, 4);
    markInteraction();
  }, { passive: true });

  hero.addEventListener('click', e => {
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    emitSparksAt(x, y, 22, true);
    markInteraction();
  });

  hero.addEventListener('touchmove', e => {
    if (!e.touches.length) return;
    const rect = hero.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    emitSparksAt(x, y, 4);
    markInteraction();
  }, { passive: true });

  // Ambient floating embers & periodic subtle arc pulses
  let idleTimer = 0;
  function emitAmbientEmbers() {
    idleTimer++;
    if (idleTimer % 18 === 0 && sparks.length < 80) {
      // Lazy rising blue embers
      const x = Math.random() * width;
      const y = height * 0.4 + Math.random() * (height * 0.5);
      const vx = (Math.random() - 0.5) * 1.2;
      const vy = - (0.8 + Math.random() * 1.5);
      sparks.push(new Spark(x, y, vx, vy, true));
    }
  }

  // Optimized Animation Loop
  function loop() {
    if (!isHeroVisible) {
      animId = null;
      return;
    }

    ctx.clearRect(0, 0, width, height);

    emitAmbientEmbers();

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.update();
      s.draw(ctx);
      if (s.life <= 0 || s.x < -40 || s.x > width + 40 || s.y > height + 20) {
        sparks.splice(i, 1);
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // IntersectionObserver pauses rendering when scrolled out of hero
  const heroVisibilityObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      isHeroVisible = entry.isIntersecting;
      if (isHeroVisible && !animId) {
        animId = requestAnimationFrame(loop);
      }
    });
  }, { threshold: 0.05 });

  heroVisibilityObs.observe(hero);
  animId = requestAnimationFrame(loop);
})();

/* ══════════════════════════════════════════════════════════════
   2. INTERACTIVE BEFORE & AFTER RESTORATION INSPECTION SLIDER
══════════════════════════════════════════════════════════════ */
(function initBeforeAfterSlider() {
  const container = document.getElementById('ba-container');
  const beforeLayer = document.getElementById('ba-before-layer');
  const handleLine = document.getElementById('ba-handle-line');
  const sliderInput = document.getElementById('ba-slider');
  const btnBefore = document.getElementById('ba-btn-before');
  const btnSplit  = document.getElementById('ba-btn-split');
  const btnAfter  = document.getElementById('ba-btn-after');
  const presetBtns = [btnBefore, btnSplit, btnAfter];

  if (!container || !beforeLayer || !handleLine || !sliderInput) return;

  function setSliderPosition(pct, updateActiveBtn = true) {
    const clamped = Math.max(0, Math.min(100, pct));
    beforeLayer.style.clipPath = `inset(0 calc(100% - ${clamped}%) 0 0)`;
    handleLine.style.left = `${clamped}%`;
    sliderInput.value = clamped;

    if (updateActiveBtn) {
      presetBtns.forEach(btn => btn?.classList.remove('active'));
      if (clamped >= 95) btnBefore?.classList.add('active');
      else if (clamped <= 5) btnAfter?.classList.add('active');
      else if (Math.abs(clamped - 50) <= 8) btnSplit?.classList.add('active');
    }
  }

  sliderInput.addEventListener('input', e => {
    setSliderPosition(parseFloat(e.target.value));
  });

  // Preset button actions
  btnBefore?.addEventListener('click', () => {
    setSliderPosition(100);
  });
  btnSplit?.addEventListener('click', () => {
    setSliderPosition(50);
  });
  btnAfter?.addEventListener('click', () => {
    setSliderPosition(0);
  });

  // Mouse / Touch Drag support on container
  let isDragging = false;
  function handleMove(clientX) {
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setSliderPosition(pct);
  }

  container.addEventListener('mousedown', e => {
    isDragging = true;
    handleMove(e.clientX);
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    handleMove(e.clientX);
  });
  window.addEventListener('mouseup', () => { isDragging = false; });

  container.addEventListener('touchstart', e => {
    if (!e.touches.length) return;
    isDragging = true;
    handleMove(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (!isDragging || !e.touches.length) return;
    handleMove(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchend', () => { isDragging = false; });

  // Initial 50/50 state
  setSliderPosition(50);
})();

/* ══════════════════════════════════════════════════════════════
   3. 60-SECOND PROJECT SCOPE & WHATSAPP ESTIMATOR
══════════════════════════════════════════════════════════════ */
(function initProjectScopeEstimator() {
  const estimatorSection = document.getElementById('estimator');
  if (!estimatorSection) return;

  const serviceBtns = estimatorSection.querySelectorAll('.est-options-grid[data-group="service"] .est-opt-btn');
  const scaleBtns   = estimatorSection.querySelectorAll('.est-options-grid[data-group="scale"] .est-opt-btn');
  const urgencyBtns = estimatorSection.querySelectorAll('.est-options-grid[data-group="urgency"] .est-opt-btn');

  const summaryService    = document.getElementById('summary-service');
  const summaryScale      = document.getElementById('summary-scale');
  const summaryTurnaround = document.getElementById('summary-turnaround');
  const summaryUrgency    = document.getElementById('summary-urgency');
  const waSendBtn         = document.getElementById('est-wa-send-btn');

  let currentService    = 'Trailer Floor & Body Repair';
  let currentScale      = 'Minor Repair / Single Component';
  let currentTurnaround = 'Same-Day or 24-48 Hours';
  let currentUrgency    = '⚡ Urgent (24–48 hrs)';

  function updateEstimatorWhatsAppLink() {
    if (summaryService)    summaryService.textContent    = currentService;
    if (summaryScale)      summaryScale.textContent      = currentScale;
    if (summaryTurnaround) summaryTurnaround.textContent = currentTurnaround;
    if (summaryUrgency)    summaryUrgency.textContent    = currentUrgency;

    const message = [
      `Hello Kiranbir, I just configured my steel project on gillengineeringworks.com.au:`,
      ``,
      `🔧 *Category:* ${currentService}`,
      `📐 *Scope / Scale:* ${currentScale}`,
      `⏱️ *Expected Turnaround:* ${currentTurnaround}`,
      `🚨 *Priority:* ${currentUrgency}`,
      ``,
      `Could you please review this scope and provide an estimated quote & turnaround?`,
      `Thank you!`
    ].join('\n');

    if (waSendBtn) {
      waSendBtn.href = `https://wa.me/61432072008?text=${encodeURIComponent(message)}`;
    }
  }

  function bindGroup(buttons, callback) {
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        callback(btn);
        updateEstimatorWhatsAppLink();
      });
    });
  }

  bindGroup(serviceBtns, btn => {
    currentService = btn.getAttribute('data-val') || btn.querySelector('.est-opt-title')?.textContent || currentService;
  });

  bindGroup(scaleBtns, btn => {
    currentScale      = btn.getAttribute('data-val') || btn.querySelector('.est-opt-title')?.textContent || currentScale;
    currentTurnaround = btn.getAttribute('data-turnaround') || '2 to 4 Working Days';
  });

  bindGroup(urgencyBtns, btn => {
    currentUrgency = btn.getAttribute('data-val') || btn.querySelector('.est-opt-title')?.textContent || currentUrgency;
  });

  // Initial trigger
  updateEstimatorWhatsAppLink();
})();
