/* CacheRunner — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
   All DOM is built with createElement + textContent. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap || null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} } };
  let tt = null;
  const toast = msg => { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(tt); if (G && !reduced) G.fromTo(t, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'back.out(2)' }); tt = setTimeout(() => { t.hidden = true; }, 2600); };
  let ac = null;
  const tone = (f = 440, d = .12, type = 'sine', v = .05) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + d + .02); } catch (_) {} };
  const audio = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); return ac; } catch (_) { return null; } };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- smooth scroll (Lenis) + ScrollTrigger ---------- */
  let lenis = null;
  if (G && window.ScrollTrigger) G.registerPlugin(ScrollTrigger);
  if (window.Lenis && G && !reduced) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    G.ticker.add(t => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'); const t = id.length > 1 ? $(id) : null; if (!t && id !== '#top') return; e.preventDefault(); closeMenu(); if (lenis) lenis.scrollTo(id === '#top' ? 0 : t, { offset: -70 }); else (t || document.body).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }));
  const nav = $('#nav'), prog = $('#prog');
  const onScroll = () => { const h = document.documentElement, y = window.scrollY; nav.classList.toggle('scrolled', y > 40); prog.style.transform = `scaleX(${Math.min(1, y / ((h.scrollHeight - h.clientHeight) || 1))})`; };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- animated menu ---------- */
  const burger = $('#burger'), menu = $('#menu'), variant = +menu.dataset.variant;
  let menuOpen = false, back = null;
  function openMenu() {
    menuOpen = true; menu.hidden = false; burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Close menu');
    if (lenis) lenis.stop(); document.documentElement.style.overflow = 'hidden';
    const links = menu.querySelectorAll('nav a, .mnote');
    if (variant === 2) { back = el('div', 'menu-back'); back.addEventListener('click', closeMenu); document.body.append(back); }
    if (G && !reduced) {
      if (variant === 1) G.fromTo(menu, { clipPath: 'circle(0% at calc(100% - 44px) 40px)' }, { clipPath: 'circle(150% at calc(100% - 44px) 40px)', duration: .8, ease: 'power3.inOut' });
      if (variant === 2) { G.fromTo(menu, { xPercent: 100 }, { xPercent: 0, duration: .8, ease: 'elastic.out(1,.85)' }); G.from(back, { opacity: 0, duration: .3 }); }
      if (variant === 3) G.fromTo(menu, { scaleY: 0 }, { scaleY: 1, duration: .6, ease: 'expo.inOut' });
      if (variant === 4) { G.set(menu, { clipPath: 'none' }); G.fromTo(menu.querySelectorAll('.tiles i'), { scale: 0, borderRadius: '50%' }, { scale: 1.02, borderRadius: '0%', duration: .55, stagger: .07, ease: 'power3.out' }); }
      G.fromTo(links, { y: 60, opacity: 0, rotation: variant === 3 ? 4 : 0 }, { y: 0, opacity: 1, rotation: 0, duration: .7, stagger: .06, delay: .25, ease: 'expo.out' });
    }
    setTimeout(() => { const a = menu.querySelector('nav a'); if (a) a.focus(); }, 300);
  }
  function closeMenu() {
    if (!menuOpen) return; menuOpen = false; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu');
    if (lenis) lenis.start(); document.documentElement.style.overflow = '';
    const done = () => { menu.hidden = true; if (G) G.set(menu, { clearProps: 'all' }); if (back) { back.remove(); back = null; } };
    if (G && !reduced) {
      if (variant === 1) G.to(menu, { clipPath: 'circle(0% at calc(100% - 44px) 40px)', duration: .55, ease: 'power3.inOut', onComplete: done });
      else if (variant === 2) { G.to(menu, { xPercent: 100, duration: .45, ease: 'power3.in', onComplete: done }); if (back) G.to(back, { opacity: 0, duration: .3 }); }
      else if (variant === 3) G.to(menu, { scaleY: 0, transformOrigin: '50% 100%', duration: .5, ease: 'expo.inOut', onComplete: done });
      else G.to(menu.querySelectorAll('.tiles i, nav a, .mnote'), { scale: 0, opacity: 0, duration: .35, stagger: .03, ease: 'power2.in', onComplete: done });
    } else done();
    burger.focus();
  }
  burger.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) closeMenu(); });

  /* ---------- buttons ---------- */
  const BTN = 5;
  $$('.btn').forEach(b => {
    if (BTN === 4) { const label = b.textContent; b.textContent = ''; const r = el('span', 'roll'); r.append(el('span', null, label), el('span', null, label)); b.append(r); b.setAttribute('aria-label', label); }
    if (BTN === 2 && G && !reduced) {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); G.to(b, { x: (e.clientX - r.left - r.width / 2) * .35, y: (e.clientY - r.top - r.height / 2) * .45, duration: .4, ease: 'power3.out' }); });
      b.addEventListener('pointerleave', () => G.to(b, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.35)' }));
    }
  });

  /* ---------- hero + reveals (responsive with matchMedia) ---------- */
  if (G && !reduced) {
    G.from('#h1 .w > span', { yPercent: 115, duration: 1.1, stagger: .07, ease: 'expo.out', delay: .15 });
    G.from('.hero .kick, .hero .lead, .hero .acts, .hero .stats', { y: 24, opacity: 0, duration: .9, stagger: .1, ease: 'expo.out', delay: .45 });
    G.from('.orb', { scale: .4, opacity: 0, duration: 1.6, stagger: .15, ease: 'expo.out' });
    const mm = G.matchMedia();
    mm.add('(min-width: 861px)', () => { if (window.ScrollTrigger) $$('.orb').forEach((o, i) => G.to(o, { yPercent: (i % 2 ? -1 : 1) * 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } })); });
    if (window.ScrollTrigger) G.from('.wpa', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.wpa', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };

/* ---------- plugin simulator ---------- */
  function demo(root, H) {
    const { el, svgEl, G, reduced, toast } = H;
    const LAYERS = [
      { k: 'redis', n: 'Redis Object Cache', d: 'Database queries answered from memory', save: 1.6, hit: 38 },
      { k: 'ccss', n: 'Critical CSS', d: 'Inline above-the-fold styles per template', save: .9, hit: 0 },
      { k: 'brotli', n: 'Brotli Compression', d: 'Edge-compressed HTML, CSS and JS (level 11)', save: .72, hit: 22 }
    ];
    const on = { redis: false, ccss: false, brotli: false };
    const BASE = 3.4, MAX = 4;
    const wrap = el('div', 'cr'), gaugeBox = el('div', 'cr-gauge'), ctrl = el('div', 'cr-ctrl'), bench = el('div', 'cr-bench');
    const sv = svgEl('svg', { viewBox: '0 0 300 190', class: 'cr-svg', role: 'img', 'aria-label': 'TTFB speedometer' });
    const arc = (a0, a1, r) => { const p = a => [150 + Math.cos(a) * r, 160 + Math.sin(a) * r]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}`; };
    const A = v => Math.PI + (Math.min(MAX, v) / MAX) * Math.PI; // 0s on the left, 4s on the right
    [[0, .8, '#22C55E'], [.8, 1.8, '#FFE600'], [1.8, 4, '#EF4444']].forEach(([a, b, c]) => sv.append(svgEl('path', { d: arc(A(a), A(b), 120), fill: 'none', stroke: c, 'stroke-width': 14, opacity: .85 })));
    for (let t = 0; t <= 4; t += .5) { const a = A(t); sv.append(svgEl('line', { x1: 150 + Math.cos(a) * 100, y1: 160 + Math.sin(a) * 100, x2: 150 + Math.cos(a) * 108, y2: 160 + Math.sin(a) * 108, stroke: '#F5F5F0', 'stroke-width': t % 1 ? 1 : 2 })); if (t % 1 === 0) { const tx = svgEl('text', { x: 150 + Math.cos(a) * 86, y: 164 + Math.sin(a) * 86, fill: '#9CA3AF', 'font-size': 11, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, monospace' }); tx.textContent = t + 's'; sv.append(tx); } }
    const needle = svgEl('g'); needle.append(svgEl('path', { d: 'M150 155 L262 160 L150 165 Z', fill: '#FFE600' }), svgEl('circle', { cx: 150, cy: 160, r: 12, fill: '#FFE600', stroke: '#0B0B0B', 'stroke-width': 4 }));
    sv.append(needle);
    const read = el('div', 'cr-read'), grade = el('div', 'cr-grade');
    gaugeBox.append(sv, read, grade);
    LAYERS.forEach(L => { const row = el('div', 'cr-row'), t = el('div'); t.append(el('b', null, L.n), el('span', null, L.d)); const tg = el('button', 'cr-tg'); tg.type = 'button'; tg.setAttribute('role', 'switch'); tg.setAttribute('aria-checked', 'false'); tg.setAttribute('aria-label', L.n); const s = el('em', null, `−${L.save.toFixed(2)}s`); tg.addEventListener('click', () => { on[L.k] = !on[L.k]; tg.setAttribute('aria-checked', String(on[L.k])); row.classList.toggle('on', on[L.k]); update(true); }); row.append(t, s, tg); ctrl.append(row); });
    const acts = el('div', 'cr-acts'), runB = el('button', 'btn pri', 'Run benchmark'), purge = el('button', 'btn ghost', 'Purge all caches'); runB.type = purge.type = 'button'; acts.append(runB, purge); ctrl.append(acts);
    const water = el('div', 'cr-water'), hitBox = el('div', 'cr-hit'); bench.append(el('p', 'cr-l', 'Request waterfall · /shop/'), water, el('p', 'cr-l', 'Cache hit ratio · last 60 s'), hitBox);
    wrap.append(gaugeBox, ctrl, bench); root.append(wrap);
    const ttfb = () => +(BASE - LAYERS.reduce((a, L) => a + (on[L.k] ? L.save : 0), 0)).toFixed(2);
    let shown = BASE, hits = Array(30).fill(4), warm = 0;
    function setNeedle(v) { needle.setAttribute('transform', `rotate(${A(v) * 180 / Math.PI} 150 160)`); read.replaceChildren(el('b', null, v.toFixed(2)), el('span', null, 's TTFB')); }
    function update(anim) {
      const t = ttfb(), g = t < .3 ? ['A+', '#22C55E'] : t < .8 ? ['A', '#22C55E'] : t < 1.8 ? ['C', '#FFE600'] : ['F', '#EF4444'];
      grade.textContent = `Grade ${g[0]} · ${Math.round((1 - t / BASE) * 100)}% faster`; grade.style.color = g[1];
      if (G && !reduced && anim) { const o = { v: shown }; G.to(o, { v: t, duration: 1.4, ease: 'elastic.out(1,.45)', onUpdate: () => setNeedle(Math.max(0, o.v)) }); } else setNeedle(t);
      shown = t; renderWater(t);
      if (anim && t <= .18) toast('All three layers on: 0.18 s TTFB. That’s faster than a blink.');
    }
    function renderWater(t, jitter) {
      water.replaceChildren(); const j = () => jitter ? 1 + (Math.random() - .5) * .25 : 1;
      const parts = [['DNS', .03], ['TCP', .04], ['TLS', .05], ['Wait (TTFB)', Math.max(.06, t - .12)], ['Download', on.brotli ? .04 : .22], ['Render', on.ccss ? .25 : .95]].map(([n, v]) => [n, v * j()]);
      const total = parts.reduce((a, p) => a + p[1], 0); let x = 0;
      parts.forEach(([n, v]) => { const r = el('div', 'cr-wr'), bar = el('i'); bar.style.marginLeft = (x / Math.max(total, 1.4) * 100) + '%'; bar.style.width = Math.max(.6, v / Math.max(total, 1.4) * 100) + '%'; if (n.startsWith('Wait')) bar.classList.add('ttfb'); r.append(el('span', null, n), el('div', 'cr-track'), el('b', null, (v * 1000).toFixed(0) + ' ms')); r.querySelector('.cr-track').append(bar); water.append(r); x += v; });
      const tot = el('p', 'cr-tot', `Fully loaded in ${(total).toFixed(2)} s`); water.append(tot);
    }
    function renderHits() {
      hitBox.replaceChildren(); const target = (on.redis ? 38 : 0) + (on.brotli ? 22 : 0) + 36 * (on.redis || on.brotli ? 1 : .1);
      hits.push(Math.max(0, Math.min(99, target * Math.min(1, warm) + (Math.random() - .5) * 4))); hits.shift(); warm = Math.min(1, warm + .08);
      const s = svgEl('svg', { viewBox: '0 0 300 70', class: 'cr-spark' }), pts = hits.map((h, i) => `${i * 10.3},${66 - h * .62}`).join(' ');
      s.append(svgEl('polyline', { points: pts, fill: 'none', stroke: '#FFE600', 'stroke-width': 2 }), svgEl('polyline', { points: `0,70 ${pts} 300,70`, fill: 'rgba(255,230,0,.12)', stroke: 'none' }));
      hitBox.append(s, el('b', 'cr-hv', `${hits[hits.length - 1].toFixed(0)}% hits`));
    }
    setInterval(renderHits, 900);
    runB.addEventListener('click', () => {
      runB.disabled = true; let n = 0; const iv = setInterval(() => { renderWater(ttfb(), true); setNeedle(Math.max(.05, ttfb() * (1 + (Math.random() - .5) * .2))); if (++n > 10) { clearInterval(iv); update(false); runB.disabled = false; toast(`Benchmark: 10 runs from 3 regions, median TTFB ${ttfb().toFixed(2)} s.`); } }, 180);
    });
    purge.addEventListener('click', () => { warm = 0; hits = hits.map(() => 2); renderHits(); toast('Purged in 0.4 s across 312 edge locations. Re-warming now.'); if (G && !reduced) G.fromTo(gaugeBox, { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)' }); });
    setNeedle(BASE); update(false); renderHits();
  }

  demo(document.getElementById('demo'), H);
})();
