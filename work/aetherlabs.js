/* Aether Labs — live demo build (Bazozo Studio) */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  $('#year').textContent = new Date().getFullYear();

  /* ---------- nav: scrolled state + elastic burger drawer ---------- */
  const nav = $('#nav'), burger = $('#burger'), drawer = $('#drawer');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setDrawer(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { drawer.hidden = false; void drawer.offsetWidth; drawer.classList.add('open'); }
    else { drawer.classList.remove('open'); setTimeout(() => { if (!drawer.classList.contains('open')) drawer.hidden = true; }, 700); }
  }
  burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) setDrawer(false); });

  /* ---------- particle network hero ---------- */
  const cvs = $('#net'), ctx = cvs.getContext('2d');
  const hero = $('.hero');
  let W = 0, H = 0, pts = [], pulses = [], running = false, raf = 0;
  const mouse = { x: -9999, y: -9999, on: false };
  const LINK = () => (W < 700 ? 100 : 135);
  const MOUSE_R = 190;
  const spawn = () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, r: 1 + Math.random() * 1.4 });

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = W * dpr; cvs.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.round(Math.min(150, Math.max(40, (W * H) / 11000)));
    while (pts.length < target) pts.push(spawn());
    pts.length = target;
    if (!running) draw();
  }

  let links = 0;
  function step() {
    pts.forEach(p => {
      if (mouse.on) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
        if (d < MOUSE_R && d > 0.1) {
          const f = d < 46 ? -0.09 : 0.012; // pulled in, but never collapse onto the cursor
          p.vx += (dx / d) * f; p.vy += (dy / d) * f;
        }
      }
      pulses.forEach(pl => {
        const dx = p.x - pl.x, dy = p.y - pl.y, d = Math.hypot(dx, dy);
        if (Math.abs(d - pl.r) < 26 && d > 0.1) { p.vx += (dx / d) * 0.6 * pl.life; p.vy += (dy / d) * 0.6 * pl.life; }
      });
      p.vx *= 0.975; p.vy *= 0.975;
      const sp = Math.hypot(p.vx, p.vy);
      if (sp < 0.12) { p.vx += (Math.random() - .5) * .06; p.vy += (Math.random() - .5) * .06; }
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
    });
    pulses.forEach(pl => { pl.r += 7; pl.life *= 0.95; });
    pulses = pulses.filter(pl => pl.life > 0.05);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const L = LINK(); links = 0;
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], dx = a.x - b.x, dy = a.y - b.y;
        if (Math.abs(dx) > L || Math.abs(dy) > L) continue;
        const d = Math.hypot(dx, dy);
        if (d < L) {
          links++;
          ctx.strokeStyle = `rgba(0,240,255,${(1 - d / L) * 0.32})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    if (mouse.on) {
      pts.forEach(p => {
        const d = Math.hypot(mouse.x - p.x, mouse.y - p.y);
        if (d < MOUSE_R) {
          ctx.strokeStyle = `rgba(123,97,255,${(1 - d / MOUSE_R) * 0.7})`;
          ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        }
      });
      ctx.fillStyle = 'rgba(0,240,255,.9)';
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2); ctx.fill();
    }
    pts.forEach(p => {
      const near = mouse.on && Math.hypot(mouse.x - p.x, mouse.y - p.y) < MOUSE_R;
      ctx.fillStyle = near ? '#ffffff' : 'rgba(0,240,255,.85)';
      ctx.beginPath(); ctx.arc(p.x, p.y, near ? p.r + 0.8 : p.r, 0, Math.PI * 2); ctx.fill();
    });
    pulses.forEach(pl => {
      ctx.strokeStyle = `rgba(0,240,255,${pl.life * 0.6})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(pl.x, pl.y, pl.r, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1;
    });
  }

  let frames = 0, lastHud = performance.now();
  const hudNodes = $('#hudNodes'), hudLinks = $('#hudLinks'), hudFps = $('#hudFps'), hudXY = $('#hudXY');
  function loop(now) {
    step(); draw(); frames++;
    if (now - lastHud > 500) {
      hudNodes.textContent = pts.length; hudLinks.textContent = links;
      hudFps.textContent = Math.round(frames * 1000 / (now - lastHud)); frames = 0; lastHud = now;
    }
    raf = requestAnimationFrame(loop);
  }
  const start = () => { if (!running && !reduced) { running = true; lastHud = performance.now(); raf = requestAnimationFrame(loop); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  window.addEventListener('pointermove', e => {
    const r = cvs.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    mouse.on = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
    mouse.x = x; mouse.y = y;
    if (mouse.on) hudXY.textContent = String(Math.round(x)).padStart(3, '0') + ' · ' + String(Math.round(y)).padStart(3, '0');
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { mouse.on = false; });
  hero.addEventListener('pointerdown', e => {
    if (e.target.closest('a,button')) return;
    const r = cvs.getBoundingClientRect();
    pulses.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 4, life: 1 });
  });

  window.addEventListener('resize', resize);
  resize();
  hudNodes.textContent = pts.length; hudLinks.textContent = links;
  // only animate while the hero is visible and the tab is active
  new IntersectionObserver(([en]) => (en.isIntersecting && !document.hidden ? start() : stop())).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : (hero.getBoundingClientRect().bottom > 0 && start())));

  /* ---------- GSAP ---------- */
  if (!window.gsap || !window.ScrollTrigger) { $$('.rv').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger);

  // Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = document.querySelector(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -60 });
    }));
  }

  // magnetic buttons
  if (finePointer && !reduced) {
    $$('.magnetic').forEach(btn => {
      const xTo = gsap.quickTo(btn, 'x', { duration: .5, ease: 'elastic.out(1, .4)' });
      const yTo = gsap.quickTo(btn, 'y', { duration: .5, ease: 'elastic.out(1, .4)' });
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .3); yTo((e.clientY - r.top - r.height / 2) * .4);
      });
      btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  if (reduced) {
    gsap.set('.rv', { opacity: 1, y: 0 });
    $$('[data-count]').forEach(el => { el.textContent = el.dataset.count; });
    return;
  }

  // hero intro
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero .tag', { y: 20, opacity: 0, duration: .8 })
    .from('.hero h1 .line > span', { yPercent: 110, duration: 1.1, stagger: .08 }, '-=.5')
    .from('.hero .lede, .hero-ctas', { y: 24, opacity: 0, duration: .9, stagger: .1 }, '-=.7')
    .from('.hud', { opacity: 0, duration: 1 }, '-=.6');

  // headline drifts and fades as you scroll away
  gsap.to('.hero-inner', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // counters
  $$('[data-count]').forEach(el => {
    const obj = { v: 0 }, target = +el.dataset.count;
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(obj, { v: target, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(obj.v); } }) });
  });

  // generic reveals
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08 }) });

  // 3D flip cards
  const inners = $$('.card-inner'), cards = $$('.card');
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1001px)', () => {
    // desktop: pin the section and flip the four modules in sequence
    gsap.set(cards, { rotateX: -70, y: 120, opacity: 0, transformOrigin: '50% 100%' });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '.platform', start: 'top top', end: '+=2200', pin: true, scrub: 1, anticipatePin: 1 }
    });
    tl.to(cards, { rotateX: 0, y: 0, opacity: 1, duration: 1, stagger: .25, ease: 'power2.out' })
      .to(inners, { rotateY: 180, duration: 1, stagger: .5, ease: 'power2.inOut' }, '+=.2')
      .to('#flipBar', { scaleX: 1, duration: tl.duration() }, 0);
  });
  mm.add('(max-width: 1000px)', () => {
    // tablet/mobile: each card flips as it crosses the middle of the screen
    cards.forEach((card, i) => {
      gsap.from(card, { rotateX: -50, y: 60, opacity: 0, transformOrigin: '50% 100%', ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 95%', end: 'top 65%', scrub: 1 } });
      gsap.to(inners[i], { rotateY: 180, ease: 'power2.inOut',
        scrollTrigger: { trigger: card, start: 'top 60%', end: 'top 25%', scrub: 1 } });
    });
    gsap.to('#flipBar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#cards', start: 'top 70%', end: 'bottom 30%', scrub: true } });
  });
})();
