/* PopupCraft — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
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
  const BTN = 1;
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
    const COLS = ['#FF2BD6', '#FFD23F', '#7C3AED', '#22D3EE', '#FF6B6B', '#34D399'];
    const S = { trig: 'time', delay: 3, scroll: 50, head: 'Wait! Spin for a discount', slices: [['10% OFF', 30], ['Free shipping', 25], ['15% OFF', 15], ['Try again', 20], ['25% OFF', 5], ['Free gift', 5]] };
    let rot = 0, open = false, timer = null, spinning = false, views = 0, wins = 0;
    const wrap = el('div', 'pc'), b = el('div', 'pc-b'), pv = el('div', 'pc-pv');
    // builder
    const seg = el('div', 'pc-seg'); [['exit', 'Exit intent'], ['time', 'Time delay'], ['scroll', 'Scroll depth']].forEach(([k, t]) => { const x = el('button', null, t); x.type = 'button'; x.setAttribute('aria-pressed', String(S.trig === k)); x.addEventListener('click', () => { S.trig = k; seg.querySelectorAll('button').forEach(y => y.setAttribute('aria-pressed', String(y === x))); syncTrig(); }); seg.append(x); });
    const slider = (label, min, max, val, unit, on) => { const w = el('label', 'pc-sl'), v = el('b', null, val + unit), r = el('input'); r.type = 'range'; r.min = min; r.max = max; r.value = val; r.setAttribute('aria-label', label); r.addEventListener('input', () => { v.textContent = r.value + unit; on(+r.value); }); w.append(el('span', null, label), r, v); return w; };
    const delayS = slider('Delay', 0, 10, S.delay, ' s', v => { S.delay = v; }), scrollS = slider('Scroll depth', 10, 90, S.scroll, '%', v => { S.scroll = v; });
    const headIn = el('input', 'pc-in'); headIn.value = S.head; headIn.maxLength = 40; headIn.setAttribute('aria-label', 'Popup headline'); headIn.addEventListener('input', () => { S.head = headIn.value; drawPopupText(); });
    const slicesBox = el('div', 'pc-slices');
    const fire = el('button', 'btn pri pc-fire', 'Trigger live popup'); fire.type = 'button';
    const stats = el('div', 'pc-stats');
    b.append(el('p', 'pc-l', 'Trigger'), seg, delayS, scrollS, el('p', 'pc-l', 'Headline'), headIn, el('p', 'pc-l', 'Wheel slices · label & odds'), slicesBox, fire, stats);
    // preview storefront
    const shop = el('div', 'pc-shop'), sbar = el('div', 'pc-sbar'); sbar.append(el('i'), el('i'), el('i'), el('span', null, 'northwind.store/sale'));
    const page = el('div', 'pc-page'); page.append(el('b', 'pc-logo', 'NORTHWIND'), el('h4', null, 'The Winter Edit'), el('p', null, 'Wool, linen and everything in between. New pieces every Thursday.'));
    const grid = el('div', 'pc-grid'); ['#C2A878', '#7C6A5A', '#A3B18A', '#D6A2AD'].forEach(c => { const t = el('i'); t.style.background = c; grid.append(t); }); page.append(grid);
    const count = el('div', 'pc-count'); count.hidden = true;
    const ov = el('div', 'pc-ov'); ov.hidden = true; const pop = el('div', 'pc-pop'); ov.append(pop);
    shop.append(sbar, page, count, ov); pv.append(el('p', 'pc-l', 'Live storefront preview'), shop, el('p', 'pc-hint', 'Exit intent: move the pointer up and out of the preview.'));
    wrap.append(b, pv); root.append(wrap);
    const wheel = svgEl('svg', { viewBox: '-110 -110 220 220', class: 'pc-wheel', 'aria-hidden': 'true' }), wg = svgEl('g');
    const ptr = svgEl('path', { d: 'M0 -104 L-10 -122 L10 -122 Z', fill: '#fff' }); wheel.append(wg, svgEl('circle', { r: 16, fill: '#0E0A12', stroke: '#fff', 'stroke-width': 3 }), ptr);
    const ph = el('h4', 'pc-ph'), pres = el('p', 'pc-res'), spin = el('button', 'btn pri', 'Spin the wheel'), x = el('button', 'pc-x', '×'); spin.type = x.type = 'button'; x.setAttribute('aria-label', 'Close popup');
    pop.append(x, ph, wheel, spin, pres);
    function drawWheel() {
      wg.replaceChildren(); const n = S.slices.length, a = Math.PI * 2 / n;
      S.slices.forEach(([lab], i) => { const a0 = i * a - Math.PI / 2, a1 = a0 + a; wg.append(svgEl('path', { d: `M0 0 L${Math.cos(a0) * 100} ${Math.sin(a0) * 100} A100 100 0 0 1 ${Math.cos(a1) * 100} ${Math.sin(a1) * 100} Z`, fill: COLS[i % COLS.length], stroke: '#0E0A12', 'stroke-width': 2 })); const am = a0 + a / 2, t = svgEl('text', { x: Math.cos(am) * 60, y: Math.sin(am) * 60, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: '#0E0A12', 'font-size': 9.5, 'font-weight': 800, transform: `rotate(${am * 180 / Math.PI + 90} ${Math.cos(am) * 60} ${Math.sin(am) * 60})` }); t.textContent = lab.slice(0, 13); wg.append(t); });
      wg.setAttribute('transform', `rotate(${rot})`);
    }
    function drawPopupText() { ph.textContent = S.head || 'Spin to win'; }
    function renderSlices() {
      slicesBox.replaceChildren(); const tot = S.slices.reduce((a, s) => a + s[1], 0);
      S.slices.forEach((s, i) => { const r = el('div', 'pc-sr'), dot = el('i'); dot.style.background = COLS[i]; const lab = el('input', 'pc-in sm'); lab.value = s[0]; lab.maxLength = 14; lab.setAttribute('aria-label', `Slice ${i + 1} label`); lab.addEventListener('input', () => { s[0] = lab.value || '—'; drawWheel(); }); const odds = el('input'); odds.type = 'range'; odds.min = 0; odds.max = 50; odds.value = s[1]; odds.setAttribute('aria-label', `Slice ${i + 1} odds`); const pct = el('b', null, Math.round(s[1] / tot * 100) + '%'); odds.addEventListener('input', () => { s[1] = +odds.value; renderSlices(); }); r.append(dot, lab, odds, pct); slicesBox.append(r); });
      drawWheel();
    }
    function syncTrig() { delayS.hidden = S.trig !== 'time'; scrollS.hidden = S.trig !== 'scroll'; }
    function renderStats() { stats.replaceChildren(); [[views, 'popup views'], [wins, 'codes won'], [views ? Math.round(wins / views * 100) + '%' : '—', 'conversion']].forEach(([v, l]) => { const d = el('div'); d.append(el('b', null, String(v)), el('span', null, l)); stats.append(d); }); }
    function show() { if (open) return; open = true; views++; renderStats(); count.hidden = true; ov.hidden = false; pres.textContent = ''; spin.disabled = false; if (G && !reduced) { G.fromTo(ov, { opacity: 0 }, { opacity: 1, duration: .3 }); G.fromTo(pop, { scale: .4, rotation: -12, y: 60 }, { scale: 1, rotation: 0, y: 0, duration: .9, ease: 'elastic.out(1,.55)' }); } }
    function hide() { open = false; clearInterval(timer); if (G && !reduced) G.to(ov, { opacity: 0, duration: .25, onComplete: () => { ov.hidden = true; G.set(ov, { clearProps: 'opacity' }); } }); else ov.hidden = true; }
    x.addEventListener('click', hide);
    fire.addEventListener('click', () => {
      hide(); clearInterval(timer);
      if (S.trig === 'exit') { toast('Armed. Now move your pointer up and out of the preview.'); armed = true; return; }
      if (S.trig === 'scroll') { page.scrollTop = 0; count.hidden = false; let p = 0; timer = setInterval(() => { p += 4; page.scrollTop = p * 3; count.textContent = `Visitor scrolled ${p}%`; if (p >= S.scroll) { clearInterval(timer); show(); } }, 60); return; }
      let t = S.delay; count.hidden = false; count.textContent = `Popup in ${t}s`; if (!t) { show(); return; }
      timer = setInterval(() => { t--; count.textContent = `Popup in ${t}s`; if (t <= 0) { clearInterval(timer); show(); } }, 1000);
    });
    let armed = false;
    shop.addEventListener('pointerleave', e => { if (S.trig === 'exit' && armed && e.clientY < shop.getBoundingClientRect().top + 10) { armed = false; show(); } });
    spin.addEventListener('click', () => {
      if (spinning) return; spinning = true; spin.disabled = true;
      const tot = S.slices.reduce((a, s) => a + s[1], 0) || 1; let r = Math.random() * tot, i = 0; while (i < S.slices.length - 1 && r >= S.slices[i][1]) { r -= S.slices[i][1]; i++; }
      const n = S.slices.length, segDeg = 360 / n, target = 360 * 6 - (i * segDeg + segDeg / 2) + (Math.random() - .5) * segDeg * .6;
      const done = () => { spinning = false; const lab = S.slices[i][0]; if (/again/i.test(lab)) { pres.textContent = 'So close! Spin again next visit.'; } else { wins++; const code = 'NW-' + lab.replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase(); pres.replaceChildren(document.createTextNode('You won '), el('b', null, lab), document.createTextNode(' · code '), el('code', null, code)); if (G && !reduced) G.fromTo(pres, { scale: .6 }, { scale: 1, duration: .6, ease: 'back.out(3)' }); } renderStats(); };
      const from = rot % 360; rot = target;
      if (G && !reduced) { const o = { r: from }; G.to(o, { r: target, duration: 4.2, ease: 'power4.out', onUpdate: () => wg.setAttribute('transform', `rotate(${o.r})`), onComplete: done }); }
      else { wg.setAttribute('transform', `rotate(${target})`); done(); }
    });
    drawPopupText(); renderSlices(); syncTrig(); renderStats();
  }

  demo(document.getElementById('demo'), H);
})();
