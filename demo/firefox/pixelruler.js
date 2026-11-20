/* PixelRuler — Firefox add-on page with a live browser simulator (Bazozo Studio, generated).
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
  const BTN = 4;
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
  /* ---------- Firefox toolbar popup ---------- */
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


/* ---------- PixelRuler simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"site":{"brand":"Lumen","nav":["Product","Pricing","Docs"],"cta":"Sign in","pill":"New · Live funnels","h1":"See every metric at a glance","p":"Lumen turns product data into one calm dashboard, so your whole team can see what changed and why.","b1":"Start free","b2":"Book a demo","cards":[["Live funnels","Watch each step of signup convert in real time."],["Smart alerts","Hear about drops before your customers do."],["Shared boards","One view of the numbers for the whole team."]],"stats":[["2.4M","events a day"],["38 ms","median query"],["99.98%","uptime"]],"quote":"“We replaced four tools with Lumen and our weekly review now takes ten minutes.”","who":"Priya Nair · Head of Growth, Fieldnote","foot":"© Lumen Analytics · Privacy · Terms"},"key":"pr_state_v1","host":"lumen.example"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const view = page.parentElement;
    const MODES = [['inspect', 'Inspect', 'Hover anything on the page to see its size and the gap to its parent. Click to keep it.'], ['measure', 'Measure', 'Drag on the page to measure. Boxes snap to element edges and guides. Arrow keys nudge the selected box.'], ['guides', 'Guides', 'Drag from a ruler to place a guide. Drag a guide back onto the ruler to remove it.']];
    const OVERLAYS = [['none', 'None', 'none'], ['thirds', 'Thirds', 'linear-gradient(90deg, transparent 32%, var(--accent) 32% 35%, transparent 35% 65%, var(--accent) 65% 68%, transparent 68%), linear-gradient(180deg, transparent 31%, var(--accent) 31% 36%, transparent 36% 64%, var(--accent) 64% 69%, transparent 69%)'], ['golden', 'Golden', 'linear-gradient(90deg, transparent 37%, var(--accent-2) 37% 40%, transparent 40% 60%, var(--accent-2) 60% 63%, transparent 63%), linear-gradient(180deg, transparent 36%, var(--accent-2) 36% 41%, transparent 41% 59%, var(--accent-2) 59% 64%, transparent 64%)'], ['cols', '12 col', 'repeating-linear-gradient(90deg, color-mix(in srgb, var(--accent) 35%, transparent) 0 2px, transparent 2px 5px)'], ['base', '8pt', 'repeating-linear-gradient(180deg, transparent 0 3px, color-mix(in srgb, var(--accent-2) 60%, transparent) 3px 4px)']];
    const UNITS = [['px', 'px'], ['rem', 'rem'], ['pt', 'pt']];
    const RAT = [[1, 1], [4, 3], [3, 2], [16, 9], [21, 9], [5, 4], [2, 1], [3, 4], [2, 3], [9, 16], [4, 5], [1, 2]];
    const ok = (v, list) => list.some(x => x[0] === v);
    const saved = store.get(M.key, null) || {};
    const S = { on: false, mode: 'inspect', snap: true, overlay: 'none', unit: 'px', boxes: [], guides: [] };
    const num = v => typeof v === 'number' && Number.isFinite(v);
    if (Array.isArray(saved.boxes)) S.boxes = saved.boxes.filter(b => b && [b.x, b.y, b.w, b.h].every(num) && typeof b.l === 'string').slice(0, 30).map(b => ({ x: b.x, y: b.y, w: b.w, h: b.h, l: b.l.slice(0, 40) }));
    if (Array.isArray(saved.guides)) S.guides = saved.guides.filter(g => g && (g.a === 'x' || g.a === 'y') && num(g.p)).slice(0, 30).map(g => ({ a: g.a, p: g.p }));
    if (ok(saved.mode, MODES)) S.mode = saved.mode; if (ok(saved.overlay, OVERLAYS)) S.overlay = saved.overlay; if (ok(saved.unit, UNITS)) S.unit = saved.unit; if (typeof saved.snap === 'boolean') S.snap = saved.snap;
    const save = () => store.set(M.key, { mode: S.mode, snap: S.snap, overlay: S.overlay, unit: S.unit, boxes: S.boxes, guides: S.guides });
    let sel = S.boxes.length - 1;

    const fmt = v => S.unit === 'rem' ? String(+(v / 16).toFixed(2)) : S.unit === 'pt' ? String(+(v * .75).toFixed(1)) : String(Math.round(v));
    const ratio = (w, h) => { if (!w || !h) return '–'; const r = w / h; for (const [a, b] of RAT) if (Math.abs(r - a / b) / (a / b) < .015) return a + ':' + b; if (Math.abs(r - 1.618) < .03) return 'φ golden'; if (Math.abs(1 / r - 1.618) < .03) return '1:φ'; return r >= 1 ? r.toFixed(2) + ':1' : '1:' + (1 / r).toFixed(2); };
    const size = b => fmt(b.w) + ' × ' + fmt(b.h) + ' ' + S.unit;

    /* ---- the sample site ---- */
    const D = M.site, mk = (node, l) => { node.dataset.m = l; return node; };
    const site = el('div', 'pr-site');
    const nav = mk(el('header', 'pr-nav'), 'Navigation bar'), logo = mk(el('b', 'pr-logo'), 'Logo');
    logo.append(mk(el('i', 'pr-mark'), 'Logo mark'), document.createTextNode(D.brand));
    const links = mk(el('nav', 'pr-links'), 'Nav links'); D.nav.forEach(t => links.append(mk(el('span', null, t), 'Nav link')));
    nav.append(logo, links, mk(el('span', 'pr-btn sm', D.cta), 'Sign-in button'));
    const wrap = mk(el('div', 'pr-wrap'), 'Page container'), hero = mk(el('section', 'pr-hero'), 'Hero');
    const acts = mk(el('div', 'pr-acts'), 'Button group'); acts.append(mk(el('span', 'pr-btn', D.b1), 'Primary button'), mk(el('span', 'pr-btn gh', D.b2), 'Secondary button'));
    hero.append(mk(el('span', 'pr-pill', D.pill), 'Badge'), mk(el('h1', null, D.h1), 'Headline'), mk(el('p', 'pr-lead', D.p), 'Intro text'), acts);
    const shot = mk(el('div', 'pr-shot'), 'Product shot'), side = mk(el('div', 'pr-side'), 'Sidebar'), chart = mk(el('div', 'pr-chart'), 'Chart');
    for (let i = 0; i < 6; i++) side.append(el('i')); [42, 64, 50, 78, 58, 90, 70, 84].forEach(h => { const b = el('i'); b.style.height = h + '%'; chart.append(b); });
    shot.append(side, chart);
    const cards = mk(el('div', 'pr-cards'), 'Feature grid');
    D.cards.forEach(([t, d]) => { const c = mk(el('article', 'pr-card'), 'Feature card'); c.append(mk(el('i', 'pr-ic'), 'Icon'), mk(el('h3', null, t), 'Card title'), mk(el('p', null, d), 'Card text')); cards.append(c); });
    const stats = mk(el('div', 'pr-stats'), 'Stats band'); D.stats.forEach(([v, l]) => { const st = mk(el('div', 'pr-stat'), 'Stat'); st.append(el('b', null, v), el('span', null, l)); stats.append(st); });
    const quote = mk(el('figure', 'pr-quote'), 'Testimonial'), qt = el('div'); qt.append(el('blockquote', null, D.quote), el('figcaption', null, D.who));
    quote.append(mk(el('i', 'pr-av'), 'Avatar'), qt);
    wrap.append(hero, shot, cards, stats, quote);
    site.append(nav, wrap, mk(el('footer', 'pr-foot', D.foot), 'Footer'));
    page.append(site);
    page.tabIndex = 0; page.setAttribute('aria-label', 'Sample page. With a measurement selected, arrow keys nudge it, Alt+arrows resize, Delete removes.');

    /* ---- overlay layers ---- */
    const ov = el('div', 'pr-ov'), cols = el('div', 'pr-cols'), base = el('div', 'pr-base'), gaps = el('div'), boxL = el('div'), gl = el('div');
    for (let i = 0; i < 12; i++) cols.append(el('i'));
    const live = el('div', 'pr-box live'), liveTag = el('span', 'pr-tag'); live.append(liveTag); live.hidden = true;
    const hov = el('div', 'pr-hov'), hovTag = el('span', 'pr-tag'); hov.append(hovTag); hov.hidden = true;
    ov.append(cols, base, gaps, boxL, live, hov, gl); site.append(ov);
    const vw = el('div', 'pr-vw'), frame = el('div', 'pr-frame'), rx = el('div', 'pr-rx'), ry = el('div', 'pr-ry'), ryIn = el('div', 'pr-ryin'), corner = el('div', 'pr-corner', 'px');
    const chx = el('i', 'pr-ch x'), chy = el('i', 'pr-ch y'), xy = el('span', 'pr-xy');
    rx.setAttribute('aria-hidden', 'true'); ry.setAttribute('aria-hidden', 'true'); ry.append(ryIn); vw.append(frame, chx, chy, xy, rx, ry, corner); view.append(vw);

    const pt = e => { const r = site.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const rel = n => { const r = n.getBoundingClientRect(), o = site.getBoundingClientRect(); return { x: Math.round(r.left - o.left), y: Math.round(r.top - o.top), w: Math.round(r.width), h: Math.round(r.height) }; };
    const place = (d, b) => { d.style.left = b.x + 'px'; d.style.top = b.y + 'px'; d.style.width = b.w + 'px'; d.style.height = b.h + 'px'; };

    function layout() {
      const w = rel(wrap), cs = getComputedStyle(wrap), pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight);
      cols.style.left = (w.x + pl) + 'px'; cols.style.width = (w.w - pl - pr) + 'px';
      rx.textContent = ''; for (let x = 100; x < view.clientWidth + 100; x += 100) { const t = el('span', null, String(x)); t.style.left = (x - 20 + 3) + 'px'; rx.append(t); }
      ryIn.textContent = ''; ryIn.style.height = site.scrollHeight + 'px'; for (let y = 100; y < site.scrollHeight; y += 100) { const t = el('span', null, String(y)); t.style.top = (y + 3) + 'px'; ryIn.append(t); }
      scrollSync();
    }
    const scrollSync = () => { ryIn.style.transform = 'translateY(' + (-page.scrollTop - 20) + 'px)'; };
    page.addEventListener('scroll', scrollSync, { passive: true });
    window.addEventListener('resize', layout);

    /* ---- boxes ---- */
    function renderBoxes() {
      boxL.textContent = '';
      S.boxes.forEach((b, i) => { const d = el('div', 'pr-box' + (i === sel ? ' sel' : '')); place(d, b); d.append(el('b', 'pr-n', String(i + 1)), el('span', 'pr-tag', size(b) + ' · ' + ratio(b.w, b.h))); boxL.append(d); });
      H.badge(S.on && S.boxes.length ? S.boxes.length : ''); renderList();
    }
    function addBox(b, l, from) {
      S.boxes.push({ x: b.x, y: b.y, w: b.w, h: b.h, l }); if (S.boxes.length > 30) S.boxes.shift();
      sel = S.boxes.length - 1; save(); renderBoxes(); H.tone(880, .06);
      const d = boxL.lastChild; if (d && G && !reduced) G.from(d, { scale: .92, opacity: 0, duration: .45, ease: 'back.out(2)' });
      if (from || d) H.flyToIcon(from || d, getComputedStyle(document.documentElement).getPropertyValue('--accent'));
    }

    /* ---- snapping ---- */
    let edges = { x: [], y: [] };
    function collect() { edges = { x: [], y: [] }; site.querySelectorAll('[data-m]').forEach(n => { const b = rel(n); edges.x.push(b.x, b.x + b.w); edges.y.push(b.y, b.y + b.h); }); S.guides.forEach(g => edges[g.a].push(g.p)); }
    const snap = (v, a) => { if (!S.snap) return Math.round(v); let best = v, d = 7; edges[a].forEach(e => { const k = Math.abs(e - v); if (k < d) { d = k; best = e; } }); return Math.round(best); };

    /* ---- measure mode ---- */
    let drag = null;
    const upd = e => { const p = pt(e), x1 = snap(p.x, 'x'), y1 = snap(p.y, 'y'); const b = { x: Math.min(drag.x0, x1), y: Math.min(drag.y0, y1), w: Math.abs(x1 - drag.x0), h: Math.abs(y1 - drag.y0) }; drag.b = b; place(live, b); liveTag.textContent = size(b) + ' · ' + ratio(b.w, b.h); };
    ov.addEventListener('pointerdown', e => { if (!S.on || S.mode !== 'measure') return; e.preventDefault(); page.focus({ preventScroll: true }); collect(); const p = pt(e); drag = { x0: snap(p.x, 'x'), y0: snap(p.y, 'y') }; try { ov.setPointerCapture(e.pointerId); } catch (_) {} live.hidden = false; upd(e); });
    ov.addEventListener('pointermove', e => {
      const vr = view.getBoundingClientRect(), x = e.clientX - vr.left, y = e.clientY - vr.top, p = pt(e);
      chx.style.left = x + 'px'; chy.style.top = y + 'px'; xy.style.left = (x + 12) + 'px'; xy.style.top = (y + 12) + 'px'; xy.textContent = 'x ' + fmt(p.x) + '  y ' + fmt(p.y);
      [chx, chy, xy].forEach(n => n.classList.add('show')); if (drag) upd(e);
    });
    ov.addEventListener('pointerleave', () => [chx, chy, xy].forEach(n => n.classList.remove('show')));
    ov.addEventListener('pointerup', () => { if (!drag) return; live.hidden = true; const b = drag.b; drag = null; if (b && b.w >= 4 && b.h >= 4) addBox(b, 'Measurement'); });

    /* ---- inspect mode ---- */
    let cur = null;
    function showHov(t) {
      const b = rel(t); place(hov, b); hov.hidden = false; hovTag.textContent = t.dataset.m + ' · ' + size(b);
      gaps.textContent = ''; const par = t.parentElement && t.parentElement.closest('[data-m]'); if (!par) return;
      const p = rel(par), pd = el('div', 'pr-par'); place(pd, p); gaps.append(pd);
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      [['v', cx, p.y, b.y - p.y], ['v', cx, b.y + b.h, p.y + p.h - b.y - b.h], ['h', p.x, cy, b.x - p.x], ['h', b.x + b.w, cy, p.x + p.w - b.x - b.w]].forEach(([k, x, y, g]) => {
        if (g < 1) return; const d = el('i', 'pr-gap ' + k); d.style.left = x + 'px'; d.style.top = y + 'px'; d.style[k === 'v' ? 'height' : 'width'] = g + 'px'; d.append(el('span', null, fmt(g))); gaps.append(d);
      });
    }
    const hideHov = () => { hov.hidden = true; gaps.textContent = ''; cur = null; };
    site.addEventListener('pointermove', e => {
      if (!S.on || S.mode !== 'inspect') return;
      const t = e.target.closest && e.target.closest('[data-m]');
      if (!t || t === site || !site.contains(t)) { hideHov(); return; }
      if (t !== cur) { cur = t; showHov(t); }
    });
    site.addEventListener('pointerleave', hideHov);
    site.addEventListener('click', () => { if (!S.on || S.mode !== 'inspect' || !cur) return; addBox(rel(cur), cur.dataset.m, hovTag); toast(cur.dataset.m + ' kept · ' + size(rel(cur))); });

    /* ---- guides ---- */
    function renderGuides() {
      gl.textContent = '';
      S.guides.forEach(g => { const d = el('div', 'pr-g ' + g.a); d.style[g.a === 'x' ? 'left' : 'top'] = g.p + 'px'; d.style.setProperty('--gl', (page.scrollTop + 26) + 'px'); d.append(el('span', null, fmt(g.p)));
        d.addEventListener('pointerdown', e => { if (!S.on || S.mode !== 'guides') return; e.preventDefault(); e.stopPropagation(); dragGuide(g); }); gl.append(d); });
    }
    function dragGuide(g) {
      const mv = ev => { const p = pt(ev); g.p = Math.max(0, Math.round(g.a === 'x' ? p.x : p.y)); renderGuides(); };
      const up = ev => { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up);
        const vr = view.getBoundingClientRect(), back = g.a === 'x' ? ev.clientY - vr.top < 20 : ev.clientX - vr.left < 20;
        if (back) { S.guides.splice(S.guides.indexOf(g), 1); toast('Guide removed'); H.tone(330, .06); } save(); renderGuides(); sync(); };
      document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
    }
    const newGuide = (a, e) => { if (!S.on) return; e.preventDefault(); if (S.mode !== 'guides') setMode('guides'); if (S.guides.length >= 30) { toast('That is plenty of guides'); return; } const p = pt(e), g = { a, p: Math.round(a === 'x' ? p.x : p.y) }; S.guides.push(g); renderGuides(); dragGuide(g); H.tone(660, .05); };
    rx.addEventListener('pointerdown', e => newGuide('x', e));
    ry.addEventListener('pointerdown', e => newGuide('y', e));
    page.addEventListener('scroll', () => gl.querySelectorAll('.pr-g.x').forEach(d => d.style.setProperty('--gl', (page.scrollTop + 26) + 'px')), { passive: true });

    /* ---- keyboard nudge ---- */
    page.addEventListener('keydown', e => {
      if (!S.on || sel < 0 || !S.boxes[sel]) return;
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key], b = S.boxes[sel];
      if (d) { e.preventDefault(); const k = e.shiftKey ? 10 : 1; if (e.altKey) { b.w = Math.max(4, b.w + d[0] * k); b.h = Math.max(4, b.h + d[1] * k); } else { b.x += d[0] * k; b.y += d[1] * k; } save(); renderBoxes(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeBox(sel); }
    });
    function removeBox(i) { S.boxes.splice(i, 1); sel = S.boxes.length - 1; save(); renderBoxes(); H.tone(330, .06); }

    /* ---- popup ---- */
    const P = el('div', 'pc');
    const power = swBtn('PixelRuler on this page', M.host);
    power.addEventListener('click', () => { S.on = !S.on; if (!S.on) hideHov(); sync(); toast(S.on ? 'Rulers on' : 'Rulers hidden'); H.tone(S.on ? 660 : 440, .08); });
    const modeBox = el('div'), seg = el('div', 'pc-seg'), hint = el('p', 'pc-hint');
    MODES.forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => setMode(k)); seg.append(b); });
    modeBox.append(label('Tool'), seg, hint);
    const snapSw = swBtn('Snap to edges and guides', null, true);
    snapSw.addEventListener('click', () => { S.snap = !S.snap; save(); sync(); toast(S.snap ? 'Snapping on' : 'Snapping off'); });
    const ovBox = el('div'), chips = el('div', 'pc-chips pr-ovl'); chips.style.setProperty('--n', OVERLAYS.length);
    OVERLAYS.forEach(([k, t, pat]) => { const b = btn(''); b.dataset.k = k; const i = el('i'); i.style.setProperty('--pat', pat); b.append(i, el('span', null, t)); b.addEventListener('click', () => { wake(); S.overlay = k; save(); sync(); H.tone(587, .05); }); chips.append(b); });
    ovBox.append(label('Overlay'), chips);
    const unitBox = el('div'), useg = el('div', 'pc-seg');
    UNITS.forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => { S.unit = k; corner.textContent = k; save(); sync(); renderBoxes(); renderGuides(); }); useg.append(b); });
    unitBox.append(label('Units'), useg);
    const cnt = el('output'), listBox = el('div'), list = el('div', 'pr-list'), pacts = el('div', 'pc-row');
    const copyAll = btn('', 'Copy all as CSS'), clear = btn('', 'Clear');
    copyAll.addEventListener('click', () => copy(S.boxes.map((b, i) => '/* ' + (i + 1) + ' ' + b.l + ' */ ' + css(b)).join('\n')));
    clear.addEventListener('click', () => { if (!S.boxes.length && !S.guides.length) return; S.boxes = []; S.guides = []; sel = -1; save(); renderBoxes(); renderGuides(); sync(); toast('Cleared measurements and guides'); });
    pacts.append(copyAll, clear); listBox.append(label('Measurements', cnt), list, pacts);
    P.append(power, modeBox, snapSw, ovBox, unitBox, listBox); pb.append(P);

    const css = b => { const r = ratio(b.w, b.h), a = /^\d+:\d+$/.test(r) ? ' aspect-ratio: ' + r.replace(':', ' / ') + ';' : ''; return 'width: ' + fmt(b.w) + S.unit + '; height: ' + fmt(b.h) + S.unit + ';' + a; };
    function copy(text) {
      if (!text) { toast('Nothing measured yet'); return; }
      try { navigator.clipboard.writeText(text).then(() => toast('Copied CSS'), () => toast('Your browser blocked the clipboard')); } catch (_) { toast('Your browser blocked the clipboard'); }
    }
    function renderList() {
      list.textContent = ''; cnt.textContent = S.boxes.length + ' · ' + S.guides.length + ' guides';
      if (!S.boxes.length) { list.append(el('p', 'pc-empty', 'Nothing measured yet. Hover in Inspect and click, or drag in Measure.')); return; }
      S.boxes.forEach((b, i) => {
        const r = el('div', 'pr-li' + (i === sel ? ' sel' : '')), t = el('span'); t.append(el('strong', null, size(b)), el('small', null, b.l + ' · ' + ratio(b.w, b.h)));
        const c = btn('', '⧉'); c.setAttribute('aria-label', 'Copy CSS for measurement ' + (i + 1)); c.addEventListener('click', e => { e.stopPropagation(); copy(css(b)); });
        const x = btn('', '×'); x.setAttribute('aria-label', 'Delete measurement ' + (i + 1)); x.addEventListener('click', e => { e.stopPropagation(); removeBox(i); });
        r.tabIndex = 0; r.setAttribute('role', 'button'); r.setAttribute('aria-label', 'Show measurement ' + (i + 1) + ', ' + size(b));
        const go = () => { sel = i; renderBoxes(); page.scrollTo({ top: Math.max(0, b.y - 90), behavior: reduced ? 'auto' : 'smooth' }); const d = boxL.children[i]; if (d && G && !reduced) G.fromTo(d, { scale: 1.06 }, { scale: 1, duration: .5, ease: 'back.out(3)' }); };
        r.addEventListener('click', go); r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        r.append(el('b', null, String(i + 1)), t, c, x); list.append(r);
      });
    }

    let seeded = S.boxes.length > 0;
    function wake() {
      if (S.on) return; S.on = true; toast('PixelRuler is on');
      if (!seeded) { seeded = true; layout(); addBox(rel(shot), 'Product shot'); }
    }
    function setMode(k) { wake(); S.mode = k; hideHov(); save(); sync(); H.tone(523, .05); }
    function sync() {
      view.classList.toggle('pr-on', S.on);
      MODES.forEach(([k]) => view.classList.toggle('m-' + k, S.mode === k));
      OVERLAYS.forEach(([k]) => view.classList.toggle('o-' + k, S.on && S.overlay === k));
      power.setAttribute('aria-checked', String(S.on)); snapSw.setAttribute('aria-checked', String(S.snap));
      seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.mode)));
      chips.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.overlay)));
      useg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.unit)));
      hint.textContent = MODES.find(x => x[0] === S.mode)[2];
      frame.textContent = '';
      const lines = { thirds: [33.333, 66.667, 'Rule of thirds'], golden: [38.2, 61.8, 'Golden ratio'] }[S.overlay];
      if (S.on && lines) { [0, 1].forEach(i => { const a = el('i', 'fx'); a.style.left = lines[i] + '%'; const b = el('i', 'fy'); b.style.top = lines[i] + '%'; frame.append(a, b); }); frame.append(el('em', null, lines[2])); }
      renderBoxes();
    }
    corner.textContent = S.unit;
    requestAnimationFrame(() => { layout(); renderGuides(); sync(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
