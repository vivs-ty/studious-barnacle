/* ═══════════════════════════════════════════════════════════════
   VIVESH TYAGI — SRE COMMAND CENTER  |  script.js
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Utility helpers ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ════════════════════════════════════════════════════════════════
   1. BOOT SCREEN
   ════════════════════════════════════════════════════════════════ */
(function bootScreen() {
  const screen = $('#boot-screen');
  if (!screen) return;

  const lines = $$('.bl', screen);
  const bar   = $('.boot-bar', screen);

  // Reveal lines one by one
  lines.forEach((ln, i) => {
    setTimeout(() => ln.classList.add('visible'), 300 + i * 450);
  });

  // Progress bar
  setTimeout(() => { bar.style.width = '100%'; }, 400);

  // Hide boot screen after all lines are shown
  const total = 300 + lines.length * 450 + 600;
  setTimeout(() => {
    screen.classList.add('hide');
    screen.addEventListener('transitionend', () => screen.remove(), { once: true });
    startHeroTyping();
    startCounters();
  }, total);
})();

/* ════════════════════════════════════════════════════════════════
   2. HERO TYPING ANIMATION
   ════════════════════════════════════════════════════════════════ */
function startHeroTyping() {
  const el = $('#hero-typing');
  if (!el) return;

  const phrases = [
    'whoami',
    'echo "Sr. CloudOps Specialist"',
    'cat skills.txt',
    'kubectl get pods --all-namespaces',
    'terraform apply --auto-approve',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let paused    = false;

  function tick() {
    const phrase = phrases[phraseIdx];

    if (!deleting) {
      el.textContent = phrase.slice(0, ++charIdx);
      if (charIdx === phrase.length) {
        deleting = true;
        paused   = true;
        setTimeout(() => { paused = false; }, 1800);
      }
    } else {
      el.textContent = phrase.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }

    if (!paused) {
      const speed = deleting ? 35 : 80;
      setTimeout(tick, speed);
    } else {
      setTimeout(tick, 1800);
    }
  }

  tick();
}

/* ════════════════════════════════════════════════════════════════
   3. STAT COUNTERS
   ════════════════════════════════════════════════════════════════ */
function startCounters() {
  $$('.h-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    let current  = 0;
    const step   = Math.max(1, Math.floor(target / 30));
    const timer  = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 50);
  });
}

/* ════════════════════════════════════════════════════════════════
   4. CIRCUIT CANVAS BACKGROUND
   ════════════════════════════════════════════════════════════════ */
(function circuitCanvas() {
  const canvas = $('#circuit-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, nodes = [], particles = [];

  const COLS = 18;
  const ROWS = 12;
  const CYAN = 'rgba(0,229,255,';

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildGrid();
  }

  function buildGrid() {
    nodes = [];
    const cw = W / COLS;
    const rh = H / ROWS;
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        if (Math.random() < 0.55) {
          nodes.push({ x: c * cw, y: r * rh });
        }
      }
    }
    // seed initial particles
    particles = [];
    for (let i = 0; i < 8; i++) spawnParticle();
  }

  function spawnParticle() {
    if (!nodes.length) return;
    const start = nodes[Math.floor(Math.random() * nodes.length)];
    particles.push({
      x: start.x, y: start.y,
      tx: 0, ty: 0,
      progress: 0,
      speed: 0.008 + Math.random() * 0.012,
      trail: [],
      alpha: 0.6 + Math.random() * 0.4,
    });
    pickTarget(particles[particles.length - 1], start);
  }

  function pickTarget(p, from) {
    const candidates = nodes.filter(n => {
      const dx = Math.abs(n.x - from.x);
      const dy = Math.abs(n.y - from.y);
      return (dx < 100 && dy === 0) || (dy < 80 && dx === 0);
    });
    const dest = candidates.length
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : nodes[Math.floor(Math.random() * nodes.length)];
    p.sx = from.x; p.sy = from.y;
    p.tx = dest.x;  p.ty = dest.y;
    p.progress = 0;
  }

  function drawGrid() {
    ctx.clearRect(0, 0, W, H);

    // draw faint circuit lines between adjacent nodes
    ctx.lineWidth = 0.5;
    const cw = W / COLS;
    const rh = H / ROWS;

    nodes.forEach(n => {
      // horizontal neighbor
      const right = nodes.find(m => Math.abs(m.y - n.y) < 2 && Math.abs(m.x - n.x - cw) < 2);
      if (right) {
        ctx.beginPath();
        ctx.strokeStyle = CYAN + '0.08)';
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
      }
      // vertical neighbor
      const down = nodes.find(m => Math.abs(m.x - n.x) < 2 && Math.abs(m.y - n.y - rh) < 2);
      if (down) {
        ctx.beginPath();
        ctx.strokeStyle = CYAN + '0.08)';
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(down.x, down.y);
        ctx.stroke();
      }
      // node dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = CYAN + '0.18)';
      ctx.fill();
    });
  }

  function updateParticles() {
    particles.forEach((p, i) => {
      p.progress = Math.min(1, p.progress + p.speed);
      p.x = p.sx + (p.tx - p.sx) * p.progress;
      p.y = p.sy + (p.ty - p.sy) * p.progress;

      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 14) p.trail.shift();

      if (p.progress >= 1) {
        const dest = { x: p.tx, y: p.ty };
        pickTarget(p, dest);
        if (Math.random() < 0.03) {
          // occasionally respawn for variety
          particles.splice(i, 1);
          spawnParticle();
        }
      }

      // draw trail
      p.trail.forEach((pt, ti) => {
        const ratio = ti / p.trail.length;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.5 * ratio, 0, Math.PI * 2);
        ctx.fillStyle = CYAN + (ratio * p.alpha * 0.7) + ')';
        ctx.fill();
      });

      // draw head
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = CYAN + p.alpha + ')';
      ctx.fill();
      // glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = CYAN + (p.alpha * 0.2) + ')';
      ctx.fill();
    });
  }

  function frame() {
    drawGrid();
    updateParticles();
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();
  frame();
})();

/* ════════════════════════════════════════════════════════════════
   5. CUSTOM CURSOR
   ════════════════════════════════════════════════════════════════ */
(function customCursor() {
  const dot  = $('#cur-dot');
  const ring = $('#cur-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  // Smooth ring follow
  (function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  // Hover enlargement on interactive elements
  const interactives = 'a,button,.proj-card,.idea-card,.contact-card,.hex-item';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactives)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactives)) document.body.classList.remove('cursor-hover');
  });
})();

/* ════════════════════════════════════════════════════════════════
   6. SIDEBAR TOGGLE
   ════════════════════════════════════════════════════════════════ */
(function sidebarToggle() {
  const toggle  = $('#sb-toggle');
  const sidebar = $('#sidebar');
  const main    = $('#main');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Close when a nav link is clicked on mobile
  $$('.nav-item', sidebar).forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        sidebar.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close on outside click (but not when clicking the toggle button itself)
  document.addEventListener('click', e => {
    if (
      !sidebar.contains(e.target) &&
      !toggle.contains(e.target) &&
      sidebar.classList.contains('open')
    ) {
      sidebar.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ════════════════════════════════════════════════════════════════
   7. ACTIVE NAV ON SCROLL
   ════════════════════════════════════════════════════════════════ */
(function activeNav() {
  const navItems = $$('.nav-item');
  const sections = $$('.section[id]');

  function update() {
    const scrollY = window.scrollY + window.innerHeight * 0.35;
    let current = sections[0]?.id ?? '';

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });

    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.sec === current);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ════════════════════════════════════════════════════════════════
   8. REVEAL ON SCROLL
   ════════════════════════════════════════════════════════════════ */
(function scrollReveal() {
  const reveals = $$('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => obs.observe(el));
})();

/* ════════════════════════════════════════════════════════════════
   9. SKILL TABS
   ════════════════════════════════════════════════════════════════ */
(function skillTabs() {
  const tabs   = $$('.s-tab');
  const panels = $$('.skill-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.cat;
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = $(`.skill-panel[data-cat="${cat}"]`);
      if (panel) panel.classList.add('active');
    });
  });
})();

/* ════════════════════════════════════════════════════════════════
   10. PROJECT FILTERS
   ════════════════════════════════════════════════════════════════ */
(function projectFilters() {
  const filters = $$('.pf');
  const cards   = $$('.proj-card');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const tags = card.dataset.tags || '';
        const show = filter === 'all' || tags.includes(filter);
        card.classList.toggle('hide', !show);
      });
    });
  });
})();

/* ════════════════════════════════════════════════════════════════
   11. 3D TILT EFFECT ON PROJECT CARDS
   ════════════════════════════════════════════════════════════════ */
(function tiltCards() {
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = (e.clientX - cx) / (rect.width  / 2);
      const dy    = (e.clientY - cy) / (rect.height / 2);
      const tiltX = dy * -7;
      const tiltY = dx *  7;
      card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ════════════════════════════════════════════════════════════════
   12. BACK TO TOP
   ════════════════════════════════════════════════════════════════ */
(function backToTop() {
  const btn = $('#back-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ════════════════════════════════════════════════════════════════
   13. SMOOTH ANCHOR SCROLL
   ════════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});
