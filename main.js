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
   3. PRIORITY SCHEDULING & DIRECT WHATSAPP DISPATCH
══════════════════════════════════════════════════════════════ */
(function initPriorityScheduling() {
  const estimatorSection = document.getElementById('estimator');
  if (!estimatorSection) return;

  const urgencyBtns       = estimatorSection.querySelectorAll('.est-options-grid[data-group="urgency"] .est-opt-btn');
  const summaryUrgency    = document.getElementById('summary-urgency');
  const summaryCommitment = document.getElementById('summary-commitment');
  const waSendBtn         = document.getElementById('est-wa-send-btn');

  let currentUrgency    = '⚡ Urgent (24–48 hrs)';
  let currentCommitment = 'Fast-Tracked Workshop Slot (Within 48h)';

  function updateEstimatorWhatsAppLink() {
    if (summaryUrgency)    summaryUrgency.textContent    = currentUrgency;
    if (summaryCommitment) summaryCommitment.textContent = currentCommitment;

    const message = [
      `Hello Kiranbir, I would like to book a priority steel / welding service via gillengineeringworks.com.au:`,
      ``,
      `🚨 *Priority Timeline:* ${currentUrgency}`,
      `⏱️ *Response Commitment:* ${currentCommitment}`,
      ``,
      `Please let me know your earliest opening / dispatch time. Thank you!`
    ].join('\n');

    if (waSendBtn) {
      waSendBtn.href = `https://wa.me/61432072008?text=${encodeURIComponent(message)}`;
    }
  }

  urgencyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      urgencyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentUrgency    = btn.getAttribute('data-val') || btn.querySelector('.est-opt-title')?.textContent || currentUrgency;
      currentCommitment = btn.getAttribute('data-commitment') || 'Fast-Tracked Booking';
      updateEstimatorWhatsAppLink();
    });
  });

  // Initial trigger
  updateEstimatorWhatsAppLink();
})();

/* ══════════════════════════════════════════════════════════════
   4. INTERACTIVE SERVICE DETAILS MODAL CONTROLLER
   Supports full details popup, direct WhatsApp quotes & booking
══════════════════════════════════════════════════════════════ */
(function initServiceModal() {
  const modal     = document.getElementById('svc-modal');
  const closeBtn  = document.getElementById('svc-modal-close');
  const iconWrap  = document.getElementById('modal-svc-icon');
  const badgeEl   = document.getElementById('modal-svc-badge');
  const titleEl   = document.getElementById('modal-svc-title');
  const descEl    = document.getElementById('modal-svc-desc');
  const specsList = document.getElementById('modal-svc-specs-list');
  const waBtn     = document.getElementById('modal-svc-wa-btn');
  const bookBtn   = document.getElementById('modal-svc-book-btn');

  if (!modal || !closeBtn) return;

  const servicesData = {
    'skid-plate': {
      title: 'SKID Plate Replacement',
      badge: '★ Most Popular Specialist Service',
      desc: 'Specialised heavy-duty SKID plate replacement and chassis reinforcement for trailers, earthmoving equipment, tip trucks, and 4WD transport fleets across Melbourne and Sunbury. We use certified high-yield abrasion-resistant steel (Hardox 450/500 equivalent) to guarantee zero recurrent failure under extreme Australian road and quarry conditions.',
      specs: [
        'Hardox 450/500 High-Yield Abrasion-Resistant Steel Plates',
        'Full Excavation of Fractured Underbody & Chassis Mounting Points',
        'Precision V-Groove Root Welding & AS/NZS Structural Certification',
        'Trailer Floor Restoration, Bumper Rebuild & Wear Strip Lamination',
        'Workshop Fitting or On-Site Mobile Welding Rig Dispatch',
        '100% Penetration Weld Tested — "We Do It Once, And We Do It Right"'
      ],
      formValue: 'SKID Plate Replacement'
    },
    'welding': {
      title: 'Welding & Fabrication',
      badge: 'Certified AS/NZS Standards',
      desc: 'Expert structural and precision welding for commercial builders, industrial facilities, and transport operators. Certified in MIG, TIG, and arc welding for mild steel, structural beams, high-tensile alloys, stainless steel, and aluminium.',
      specs: [
        'MIG, TIG, and Stick/Arc Welding to AS/NZS 1554 Structural Standards',
        'Heavy Structural Columns, Beams, Trusses & Base Plates',
        'Non-Destructive Weld Inspection (NDT) & Certified Clean Finishes',
        'Mobile On-Site Emergency Welding Rig with Generator Setup',
        'Strict ISO Standards & Full Traceability on All Base Metals'
      ],
      formValue: 'Welding & Fabrication'
    },
    'custom-engineering': {
      title: 'Custom Engineering & Welding',
      badge: 'Bespoke Technical Solutions',
      desc: 'Bespoke metal design, CAD-assisted custom engineering, and heavy metal fabrication. From one-off prototype brackets to production-run industrial frames, underbridge culvert grills, access platforms, and heavy equipment attachments.',
      specs: [
        'Custom Engineering Design & CAD-to-Steel Precision Alignment',
        'Underbridge Culvert Grills, Stormwater Gates & Security Platforms',
        'Heavy Machinery Attachments, Buckets, Brackets & Pivot Points',
        'Stainless Steel, Mild Steel & Aluminium Plate Fabrication',
        'High-Tolerance CNC Profile Cutting, Drilling, Tapping & Press Bending'
      ],
      formValue: 'Custom Engineering & Welding'
    },
    'residential': {
      title: 'Residential & Commercial Steel',
      badge: 'Architectural & Structural Steel',
      desc: 'Custom architectural and structural steel installations for residential homebuilders, commercial premises, and property developers. Built for structural durability and pristine finishes with hot-dip galvanising and powder coating.',
      specs: [
        'Architectural Stainless Steel & Mild Steel Handrails and Balustrades',
        'Automated & Manual Security Gates, Heavy Boundary Fencing',
        'Structural Steel Carports, Canopies, Pergolas & Awning Frameworks',
        'Internal & External Spiral/Straight Steel Staircases and Stringers',
        'Hot-Dip Galvanised & UV-Resistant Architectural Powder Coating'
      ],
      formValue: 'Residential & Commercial Steel'
    },
    'machinery': {
      title: 'Earthwork Machinery Repair',
      badge: '24/7 Heavy Equipment Support',
      desc: 'Heavy equipment rebuilds and structural repairs for civil construction, earthmoving, and agricultural machinery. Fast turnaround to minimize costly fleet downtime on jobsites across Melbourne and regional Victoria.',
      specs: [
        'Excavator Booms, Dipper Arms & Bucket Hard-Facing Repairs',
        'Bulldozer Blades, Scraper Bowls & Loader Bucket Re-Skinning',
        'Cracked Chassis Re-alignment, Gusset Plates & Stress Relieving',
        'Pivot Boss Bore Buildup & Line Boring Preparation',
        '24/7 Urgent Site Dispatch Across Melbourne & Macedon Ranges'
      ],
      formValue: 'Earthwork Machinery Repair'
    },
    'truck-trailer': {
      title: 'Truck & Trailer Body Repair',
      badge: 'Heavy Transport Fleet Specialists',
      desc: 'Full structural body restoration and fabrication for tip-trucks, semi-trailers, dog trailers, and heavy haulage transport fleets. Certified heavy vehicle body modifications and chassis rust/fracture repairs.',
      specs: [
        'Tipper Body Relining, Subframe Crack Repairs & Tailgate Rebuilds',
        'Semi-Trailer Rear Bumper Reconstruction & Underrun Protections',
        'Curtain-Sider Roof Track Alignment & Pillar Replacements',
        'Chassis Web Fractures, Tow Bar & Pintle Hook Structural Mounts',
        'Fast Fleet Turnaround to Get Trucks Back on Australian Highways'
      ],
      formValue: 'Truck & Trailer Body Repair'
    }
  };

  let currentKey = 'skid-plate';

  function openModal(serviceKey) {
    const data = servicesData[serviceKey] || servicesData['skid-plate'];
    currentKey = serviceKey;

    // Grab SVG icon from the corresponding card if available
    const cardEl = document.querySelector(`.service-card[data-service="${serviceKey}"]`);
    const svgIcon = cardEl ? cardEl.querySelector('.svc-icon-wrap')?.innerHTML : '';

    if (iconWrap && svgIcon) iconWrap.innerHTML = svgIcon;
    if (badgeEl) badgeEl.textContent = data.badge;
    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.desc;

    if (specsList) {
      specsList.innerHTML = data.specs.map(spec => `<li><span>${spec}</span></li>`).join('');
    }

    if (waBtn) {
      const waMsg = [
        `Hello Kiranbir, I would like to get a quote / book your service via gillengineeringworks.com.au:`,
        ``,
        `🛠️ *Service:* ${data.title}`,
        `📍 *Location:* Melbourne / Sunbury VIC`,
        ``,
        `Please let me know your availability and pricing. Thank you!`
      ].join('\n');
      waBtn.href = `https://wa.me/61432072008?text=${encodeURIComponent(waMsg)}`;
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Click card to open
  document.querySelectorAll('.service-card[data-service]').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      const key = card.getAttribute('data-service');
      openModal(key);
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const key = card.getAttribute('data-service');
        openModal(key);
      }
    });
  });

  // Nav dropdown items click to open
  document.querySelectorAll('.nav-drop-item[data-service], .mob-sub-link[data-service]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const key = link.getAttribute('data-service');
      
      // Close mobile drawer if open
      const drawer = document.getElementById('mobile-drawer');
      const hamburger = document.getElementById('hamburger-btn');
      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        hamburger?.classList.remove('open');
        hamburger?.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
      }

      // Scroll to services section
      const targetCard = document.querySelector(`.service-card[data-service="${key}"]`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => openModal(key), 350);
    });
  });

  // Close handlers
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  // Book button in modal
  bookBtn?.addEventListener('click', () => {
    closeModal();
    const data = servicesData[currentKey] || servicesData['skid-plate'];
    
    // Auto-select in contact form
    const serviceSelect = document.getElementById('f-service');
    if (serviceSelect && data.formValue) {
      serviceSelect.value = data.formValue;
    }

    // Scroll to contact form
    const contactSec = document.getElementById('contact');
    if (contactSec) {
      contactSec.scrollIntoView({ behavior: 'smooth' });
      const nameInput = document.getElementById('f-name');
      if (nameInput) setTimeout(() => nameInput.focus(), 600);
    }
  });

  // Check URL hash on load
  const hash = window.location.hash.replace('#', '');
  if (hash && (servicesData[hash] || hash.startsWith('svc-'))) {
    const key = hash.replace('svc-', '');
    const matchedKey = servicesData[key] ? key : 
      (key === 'trailer' ? 'skid-plate' : (key === 'fabrication' ? 'custom-engineering' : null));
    if (matchedKey) setTimeout(() => openModal(matchedKey), 500);
  }
})();
