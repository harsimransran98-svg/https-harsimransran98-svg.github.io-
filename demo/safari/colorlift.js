/* ColorLift — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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
    if (window.ScrollTrigger) G.from('.cx', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.cx', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };
  /* ---------- Safari toolbar popup ---------- */
  const cxExt = $('#cxExt'), cxPop = $('#cxPop');
  let cxOpen = false; const cxHooks = [];
  function cxShow() { if (cxOpen) return; cxOpen = true; cxPop.hidden = false; cxExt.setAttribute('aria-expanded', 'true'); if (G && !reduced) G.fromTo(cxPop, { scale: .88, opacity: 0, y: -8 }, { scale: 1, opacity: 1, y: 0, duration: .45, ease: 'back.out(1.8)' }); cxHooks.forEach(f => f(true)); }
  function cxHide() { if (!cxOpen) return; cxOpen = false; cxExt.setAttribute('aria-expanded', 'false'); const done = () => { cxPop.hidden = true; if (G) G.set(cxPop, { clearProps: 'all' }); }; if (G && !reduced) G.to(cxPop, { scale: .92, opacity: 0, duration: .18, onComplete: done }); else done(); cxHooks.forEach(f => f(false)); }
  cxExt.addEventListener('click', () => cxOpen ? cxHide() : cxShow());
  $('#cxPopX').addEventListener('click', cxHide);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && cxOpen && !menuOpen) cxHide(); });
  H.pop = { body: $('#cxPopBody'), open: cxShow, close: cxHide, isOpen: () => cxOpen, onToggle: f => cxHooks.push(f) };
  H.badge = v => { const b = $('#cxBadge'); b.hidden = v == null || v === '' || v === 0; b.textContent = String(v); if (G && !reduced && !b.hidden) G.fromTo(b, { scale: 1.6 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); };
  H.url = t => { $('#cxUrl').textContent = t; };
  H.flyToIcon = (fromEl, color) => {
    if (!G || reduced) return; const a = fromEl.getBoundingClientRect(), b = cxExt.getBoundingClientRect(), d = el('i');
    Object.assign(d.style, { position: 'fixed', zIndex: 95, left: a.left + a.width / 2 + 'px', top: a.top + a.height / 2 + 'px', width: '14px', height: '14px', margin: '-7px 0 0 -7px', borderRadius: '50%', background: color || 'var(--accent)', boxShadow: '0 0 14px var(--accent)', pointerEvents: 'none' });
    document.body.append(d);
    G.to(d, { x: b.left + b.width / 2 - (a.left + a.width / 2), duration: .6, ease: 'power1.in' });
    G.to(d, { y: b.top + b.height / 2 - (a.top + a.height / 2), duration: .6, ease: 'back.in(1.4)', onComplete: () => { d.remove(); G.fromTo(cxExt, { scale: 1.35 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); } });
  };


/* ---------- ColorLift simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"photos":[["dusk","Santorini at dusk","Whitewashed walls hold the last of the light."],["forest","Morning in the Black Forest","Mist burns off the pines by nine."],["spice","Spice market, Marrakech","Turmeric, paprika and sumac, by the scoop."]],"key":"cl_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const hex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
    const rgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const lum = c => { const a = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    const sat = c => { const mx = Math.max(...c), mn = Math.min(...c); return mx ? (mx - mn) / mx : 0; };
    const saved = store.get(M.key, null) || {};
    const S = { n: [4, 6, 8].includes(saved.n) ? saved.n : 6, fmt: ['css', 'tw', 'json'].includes(saved.fmt) ? saved.fmt : 'css', src: 0 };
    const save = () => store.set(M.key, { n: S.n, fmt: S.fmt });
    let pal = [], locks = [], eye = false;

    /* ---- procedural photos ---- */
    function rnd(seed) { return () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }
    function paint(kind, cv) {
      const W = cv.width = 480, Hh = cv.height = 300, c = cv.getContext('2d'), r = rnd(kind.length * 977);
      const lg = (y0, y1, stops) => { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
      if (kind === 'dusk') {
        c.fillStyle = lg(0, Hh * .6, [[0, '#4B3A7A'], [.45, '#C8657A'], [.8, '#F4845F'], [1, '#F7B267']]); c.fillRect(0, 0, W, Hh);
        const g = c.createRadialGradient(330, 168, 4, 330, 168, 90); g.addColorStop(0, 'rgba(255,224,170,1)'); g.addColorStop(1, 'rgba(255,224,170,0)'); c.fillStyle = g; c.fillRect(0, 0, W, Hh);
        c.fillStyle = '#FFE1A8'; c.beginPath(); c.arc(330, 170, 22, 0, 7); c.fill();
        c.fillStyle = lg(Hh * .6, Hh, [[0, '#2B4C7E'], [1, '#14243F']]); c.fillRect(0, Hh * .6, W, Hh);
        for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(247,178,103,' + (.25 + r() * .4) + ')'; c.fillRect(300 + r() * 70 - 35, Hh * .62 + i * 4.4, 20 + r() * 40, 2); }
        c.fillStyle = '#B9A58A'; c.beginPath(); c.moveTo(0, Hh * .62); c.quadraticCurveTo(110, Hh * .3, 230, Hh * .62); c.fill();
        for (let i = 0; i < 22; i++) { const x = 10 + r() * 190, y = Hh * .42 + r() * 50 + Math.abs(x - 110) * .35; c.fillStyle = r() > .2 ? '#F4F1EA' : '#E6DCCB'; c.fillRect(x, y, 14 + r() * 14, 10 + r() * 10); if (r() > .7) { c.fillStyle = '#2F6DB5'; c.beginPath(); c.arc(x + 9, y, 7, Math.PI, 0); c.fill(); } }
      } else if (kind === 'forest') {
        c.fillStyle = lg(0, Hh, [[0, '#E9E4C9'], [.5, '#D5E2D0'], [1, '#B9CDB8']]); c.fillRect(0, 0, W, Hh);
        const g = c.createRadialGradient(380, 70, 4, 380, 70, 120); g.addColorStop(0, 'rgba(255,238,190,.95)'); g.addColorStop(1, 'rgba(255,238,190,0)'); c.fillStyle = g; c.fillRect(0, 0, W, Hh);
        [['#8FAE8F', 120, 26], ['#5F8A65', 165, 34], ['#3B6646', 210, 42], ['#21422C', 255, 52]].forEach(([col, base, h], k) => {
          c.fillStyle = col; for (let x = -20; x < W + 20; x += 16 + r() * 14) { const th = h + r() * h; c.beginPath(); c.moveTo(x, base + 20); c.lineTo(x + 12, base - th); c.lineTo(x + 24, base + 20); c.fill(); }
          c.fillRect(0, base + 10, W, Hh); if (k < 3) { c.fillStyle = 'rgba(240,244,236,.35)'; c.fillRect(0, base + 4, W, 16); } });
        c.fillStyle = '#13261A'; c.fillRect(0, Hh - 26, W, 26);
      } else {
        c.fillStyle = '#6B4226'; c.fillRect(0, 0, W, Hh); for (let y = 0; y < Hh; y += 38) { c.fillStyle = '#5A361F'; c.fillRect(0, y, W, 3); }
        const cols = ['#E9B44C', '#C1440E', '#8E1B30', '#9DB17C', '#E0A100', '#7A4A33'];
        cols.forEach((col, i) => { const x = 82 + (i % 3) * 158, y = 92 + Math.floor(i / 3) * 128;
          c.fillStyle = '#D9CBB6'; c.beginPath(); c.ellipse(x, y + 28, 70, 26, 0, 0, 7); c.fill();
          c.fillStyle = col; c.beginPath(); c.ellipse(x, y + 18, 60, 52, 0, Math.PI, 0); c.fill(); c.beginPath(); c.ellipse(x, y + 18, 60, 16, 0, 0, Math.PI); c.fill();
          c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(x - 18, y - 12, 16, 9, -.5, 0, 7); c.fill();
          for (let k = 0; k < 40; k++) { c.fillStyle = 'rgba(0,0,0,' + r() * .15 + ')'; c.fillRect(x - 50 + r() * 100, y - 20 + r() * 34, 2, 2); } });
      }
    }

    /* ---- k-means on real pixels ---- */
    function pixels(list) { const out = []; list.forEach(cv => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; for (let i = 0; i < d.length; i += 4 * 7) out.push([d[i], d[i + 1], d[i + 2]]); }); return out; }
    function kmeans(px, k) {
      const dist = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
      const cs = [px[Math.floor(px.length / 2)].slice()];
      while (cs.length < k) { let best = null, bd = -1; for (let i = 0; i < px.length; i += 13) { const d = Math.min(...cs.map(c => dist(c, px[i]))); if (d > bd) { bd = d; best = px[i]; } } cs.push(best.slice()); }
      let cnt = [];
      for (let it = 0; it < 9; it++) {
        const sum = cs.map(() => [0, 0, 0]); cnt = cs.map(() => 0);
        px.forEach(p => { let bi = 0, bd = Infinity; cs.forEach((c, i) => { const d = dist(c, p); if (d < bd) { bd = d; bi = i; } }); sum[bi][0] += p[0]; sum[bi][1] += p[1]; sum[bi][2] += p[2]; cnt[bi]++; });
        cs.forEach((c, i) => { if (cnt[i]) { c[0] = sum[i][0] / cnt[i]; c[1] = sum[i][1] / cnt[i]; c[2] = sum[i][2] / cnt[i]; } });
      }
      return cs.map((c, i) => ({ c, n: cnt[i] })).filter(x => x.n).sort((a, b) => b.n - a.n).map(x => hex(x.c));
    }
    function extract(animate) {
      const list = S.src === 'all' ? canv : [canv[S.src]];
      const kept = pal.filter((h, i) => locks[i]);
      const fresh = kmeans(pixels(list), S.n + 2).filter(h => !kept.some(k => Math.hypot(...rgb(k).map((v, i) => v - rgb(h)[i])) < 40));
      const next = [], nl = [];
      for (let i = 0; i < S.n; i++) { if (locks[i] && pal[i]) { next.push(pal[i]); nl.push(true); } else { next.push(fresh.shift() || '#CCCCCC'); nl.push(false); } }
      pal = next; locks = nl; renderPop(animate);
      if (animate) figs.forEach((f, i) => { if (S.src === 'all' || S.src === i) { const sc = el('i', 'cl-scan'); f.append(sc); setTimeout(() => sc.remove(), 950); } });
    }

    /* ---- page ---- */
    const site = el('div', 'cl-site'), top = el('div', 'cl-top'), art = el('div', 'cl-art');
    top.append(document.createTextNode('Wander Journal'), el('span', null, 'Photo essays · Guides'));
    art.append(el('h1', null, 'Three places, three palettes'), el('p', null, 'Every place has its own colours. Here are three we keep coming back to.'));
    const canv = [], figs = M.photos.map(([k, t, d], i) => { const f = el('figure', 'cl-fig'), cv = el('canvas'), cap = el('figcaption'), chip = btn('cl-chip'); paint(k, cv); cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', t); canv.push(cv);
      chip.append(el('i'), document.createTextNode('Lift palette')); chip.setAttribute('aria-label', 'Lift a palette from ' + t); chip.addEventListener('click', e => { e.stopPropagation(); choose(i); });
      cap.append(el('b', null, t), document.createTextNode(d)); f.append(cv, chip, cap); f.addEventListener('click', e => { if (!eye) choose(i); }); art.append(f); return f; });
    const loupe = el('div', 'cl-loupe'), lb = el('b'); loupe.append(lb); loupe.hidden = true; site.append(top, art, loupe); page.append(site);
    function choose(i) { S.src = i; figs.forEach((f, j) => f.classList.toggle('sel', j === i)); extract(true); toast('Palette lifted from ' + M.photos[i][1]); H.tone(660, .06); if (!H.pop.isOpen()) H.pop.open(); }

    /* ---- eyedropper ---- */
    const pickAt = (cv, e) => { const r = cv.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * cv.width), y = Math.floor((e.clientY - r.top) / r.height * cv.height); const d = cv.getContext('2d').getImageData(Math.max(0, Math.min(cv.width - 1, x)), Math.max(0, Math.min(cv.height - 1, y)), 1, 1).data; return hex([d[0], d[1], d[2]]); };
    canv.forEach(cv => {
      cv.addEventListener('pointermove', e => { if (!eye) return; const h = pickAt(cv, e), o = site.getBoundingClientRect(); loupe.hidden = false; loupe.style.left = (e.clientX - o.left) + 'px'; loupe.style.top = (e.clientY - o.top) + 'px'; loupe.style.background = h; lb.textContent = h; });
      cv.addEventListener('pointerleave', () => { loupe.hidden = true; });
      cv.addEventListener('click', e => { if (!eye) return; e.stopPropagation(); const h = pickAt(cv, e); let i = locks.findIndex(l => !l); if (i < 0) i = pal.length - 1; pal[i] = h; locks[i] = true; renderPop(true); toast('Picked ' + h + ' and locked it'); H.tone(880, .05); });
    });
    function setEye(v) { eye = v; site.classList.toggle('cl-eye', v); loupe.hidden = true; eyeBtn.setAttribute('aria-pressed', String(v)); if (v) toast('Eyedropper on: click any pixel in a photo'); }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && eye) setEye(false); });

    /* ---- popover ---- */
    const P = el('div', 'pc');
    const srcBox = el('div'), seg = el('div', 'pc-seg'); [[0, 'Dusk'], [1, 'Forest'], [2, 'Spices'], ['all', 'All']].forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => { if (k === 'all') { S.src = 'all'; figs.forEach(f => f.classList.add('sel')); extract(true); } else choose(k); }); seg.append(b); }); srcBox.append(label('Source'), seg);
    const palBox = el('div'), palEl = el('div', 'cl-pal'), nOut = el('output'); palBox.append(label('Palette', nOut), palEl);
    const tools = el('div', 'cl-tools'), eyeBtn = btn('', '⌖ Eyedropper'), cnt = el('div', 'pc-seg');
    eyeBtn.setAttribute('aria-pressed', 'false'); eyeBtn.addEventListener('click', () => setEye(!eye));
    [4, 6, 8].forEach(n => { const b = btn('', String(n)); b.dataset.n = n; b.setAttribute('aria-label', n + ' colours'); b.addEventListener('click', () => { S.n = n; locks = locks.slice(0, n); pal = pal.slice(0, n); save(); extract(true); }); cnt.append(b); });
    tools.append(eyeBtn, cnt);
    const prevBox = el('div'), prev = el('div', 'cl-prev'), card = el('div', 'card'), row = el('div', 'row'); row.append(el('span', null, 'Book a trip'), el('span', null, 'Save'));
    card.append(el('b', null, 'Santorini, 4 nights'), el('p', null, 'Sunset rooms with a sea view, from £420.'), row); prev.append(card); prevBox.append(label('Preview'), prev);
    const exBox = el('div'), fseg = el('div', 'pc-seg'), code = el('pre', 'cl-code'), copy = btn('cl-copy', 'Copy');
    [['css', 'CSS'], ['tw', 'Tailwind'], ['json', 'JSON']].forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => { S.fmt = k; save(); renderPop(); }); fseg.append(b); });
    copy.addEventListener('click', () => { try { navigator.clipboard.writeText(code.textContent).then(() => toast('Palette copied'), () => toast('Your browser blocked the clipboard')); } catch (_) { toast('Your browser blocked the clipboard'); } });
    fseg.style.marginBottom = '6px'; exBox.append(label('Export'), fseg, code, copy);
    P.append(srcBox, palBox, tools, prevBox, exBox); pb.append(P);

    function roles() {
      const by = [...pal].sort((a, b) => lum(rgb(b)) - lum(rgb(a))), sats = [...pal].sort((a, b) => sat(rgb(b)) * (1 - Math.abs(lum(rgb(b)) - .3)) - sat(rgb(a)) * (1 - Math.abs(lum(rgb(a)) - .3)));
      const bg = by[0], text = by[by.length - 1], surface = by[1] || bg, primary = sats[0] === bg ? sats[1] : sats[0], accent = sats.find(c => c !== primary && c !== bg) || primary;
      return { bg, surface, primary, accent, text };
    }
    function renderPop(animate) {
      seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(String(S.src) === b.dataset.k)));
      cnt.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.n === S.n)));
      palEl.style.setProperty('--n', S.n); palEl.textContent = ''; nOut.textContent = pal.length + ' colours · ' + locks.filter(Boolean).length + ' locked';
      pal.forEach((h, i) => { const c = rgb(h), w = ratio(c, [255, 255, 255]), k = ratio(c, [17, 17, 17]), t = w >= k ? '#FFFFFF' : '#111111';
        const sw = btn('cl-sw'); sw.style.setProperty('--c', h); sw.style.setProperty('--t', t); sw.setAttribute('aria-label', 'Copy ' + h);
        sw.append(el('span', null, 'Aa'), el('em', null, (w >= k ? w : k).toFixed(1) + ':1'), document.createTextNode(h));
        sw.addEventListener('click', () => { try { navigator.clipboard.writeText(h).then(() => toast(h + ' copied'), () => toast(h)); } catch (_) { toast(h); } });
        const lk = btn('cl-lk', locks[i] ? '🔒' : '🔓'); lk.setAttribute('aria-pressed', String(!!locks[i])); lk.setAttribute('aria-label', (locks[i] ? 'Unlock ' : 'Lock ') + h);
        lk.addEventListener('click', e => { e.stopPropagation(); locks[i] = !locks[i]; renderPop(); }); sw.append(lk); palEl.append(sw); });
      if (animate && G && !reduced) G.from(palEl.children, { scaleY: 0, transformOrigin: '50% 100%', duration: .5, stagger: .05, ease: 'back.out(1.8)' });
      const R = roles(), tx = h => ratio(rgb(h), [255, 255, 255]) >= ratio(rgb(h), [17, 17, 17]) ? '#FFFFFF' : '#111111';
      prev.style.setProperty('--pb', R.bg); prev.style.setProperty('--pt', R.text); prev.style.setProperty('--ps', R.surface); prev.style.setProperty('--pp', R.primary); prev.style.setProperty('--ppt', tx(R.primary)); prev.style.setProperty('--pa', R.accent);
      fseg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.fmt)));
      const named = [['bg', R.bg], ['surface', R.surface], ['primary', R.primary], ['accent', R.accent], ['text', R.text]];
      code.textContent = S.fmt === 'css' ? ':root {\n' + named.map(([n, h]) => '  --' + n + ': ' + h + ';').join('\n') + '\n' + pal.map((h, i) => '  --lift-' + (i + 1) + ': ' + h + ';').join('\n') + '\n}'
        : S.fmt === 'tw' ? 'theme: {\n  extend: {\n    colors: {\n      lift: {\n' + pal.map((h, i) => "        " + ((i + 1) * 100) + ": '" + h + "',").join('\n') + '\n      },\n' + named.map(([n, h]) => "      " + n + ": '" + h + "',").join('\n') + '\n    },\n  },\n}'
        : JSON.stringify({ palette: pal, roles: Object.fromEntries(named) }, null, 2);
      H.badge(pal.length || '');
    }
    figs[0].classList.add('sel'); extract(false);
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
  /* poster layout: the tilted demo straightens as it scrolls into view */
  if (window.gsap && window.ScrollTrigger && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', () => { gsap.to('.po-tilt', { rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.po-tilt', start: 'top 95%', end: 'top 30%', scrub: 1 } }); });
    mm.add('(max-width: 699px)', () => { gsap.set('.po-tilt', { rotate: 0, scale: 1 }); });
  }
})();
