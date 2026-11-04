/* TabTimer — Chrome extension page with a live browser simulator (Bazozo Studio).
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
  /* ---------- Chrome toolbar popup ---------- */
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

/* ---------- extension simulator ---------- */
  function demo(page, H) {
    const { el, svgEl, G, reduced, toast } = H, pb = H.pop.body, view = page.parentElement;
    const M = 60;
    const SITES = [
      { d: 'docs.northwind.dev', n: 'Northwind Docs', c: '#5EEAD4', k: 'focus', t: 102 * M, lim: 0, path: '/api', h: 'API reference · Webhooks' },
      { d: 'figma.example', n: 'Figma', c: '#A78BFA', k: 'focus', t: 65 * M, lim: 0, path: '/file/hero', h: 'Hero banner · v4' },
      { d: 'mail.example', n: 'Mail', c: '#60A5FA', k: 'neutral', t: 38 * M, lim: 0, path: '/inbox', h: 'Inbox (3)' },
      { d: 'scrollr.social', n: 'Scrollr', c: '#F472B6', k: 'distract', t: 52 * M, lim: 60 * M, path: '/home', h: 'Home feed' },
      { d: 'tube.example', n: 'Tube', c: '#F87171', k: 'distract', t: 24 * M, lim: 30 * M, path: '/watch', h: 'Up next: 10 desk setups' },
      { d: 'news.example', n: 'Daily News', c: '#FFB547', k: 'distract', t: 18 * M, lim: 0, path: '/today', h: 'Morning briefing' }
    ];
    const KIND = { focus: ['Focus', '#5EEAD4'], neutral: ['Admin', '#60A5FA'], distract: ['Distraction', '#F472B6'] };
    let active = SITES[0], speed = 60, warned = new Set(), blocked = new Set(), alertFor = null;
    const fmt = s => { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? `${h}h ${String(m).padStart(2, '0')}m` : m ? `${m}m` : `${s}s`; };

    /* one tab per site */
    const bar = document.querySelector('.cx-tabs'); bar.classList.add('tm-bar'); bar.querySelectorAll('.cx-tab').forEach(t => t.remove());
    const strip = el('div', 'tm-strip'); strip.setAttribute('role', 'tablist'); strip.setAttribute('aria-label', 'Open tabs'); bar.insertBefore(strip, bar.querySelector('.cx-plus'));
    SITES.forEach(s => { const n = el('button', 'cx-tab tm-tab'); n.type = 'button'; n.setAttribute('role', 'tab'); const f = el('i', 'fav'); f.style.background = s.c; n.append(f, el('span', null, s.n)); n.addEventListener('click', () => go(s)); s.node = n; strip.append(n); });

    /* page */
    const site = el('div', 'tm-site'); page.append(site);
    const alertBox = el('div', 'tm-alert'); alertBox.hidden = true; view.append(alertBox);
    function renderPage() {
      const s = active; H.url(s.d + s.path); site.replaceChildren(); site.style.setProperty('--c', s.c);
      const top = el('div', 'tm-ph'), f = el('i'); top.append(f, el('b', null, s.d)); const pill = el('span', 'tm-on'); s.pill = pill; top.append(pill); site.append(top);
      const hero = el('div', 'tm-hero'); hero.append(el('small', null, KIND[s.k][0] + ' site'), el('h1', null, s.h)); site.append(hero);
      if (s.k === 'distract') { const feed = el('div', 'tm-feed'); for (let i = 0; i < 4; i++) { const p = el('div', 'tm-post'); p.append(el('i'), el('b'), el('span')); feed.append(p); } site.append(feed); }
      else { const lines = el('div', 'tm-lines'); for (let i = 0; i < 8; i++) lines.append(el('i')); site.append(lines); }
      if (blocked.has(s)) showAlert(s, true);
      if (G && !reduced) G.from(site.children, { opacity: 0, y: 8, duration: .3, stagger: .05 });
    }
    function go(s) { active = s; SITES.forEach(x => { const on = x === s; x.node.classList.toggle('on', on); x.node.setAttribute('aria-selected', String(on)); }); hideAlert(); renderPage(); live(); }
    function hideAlert() { alertBox.hidden = true; alertFor = null; }
    function showAlert(s, done) {
      alertFor = s; alertBox.replaceChildren(); const card = el('div', 'tm-ac');
      card.append(el('span', 'tm-ai', '⏳'), el('b', null, done ? `${s.n} is closed for today` : `You’ve hit your ${fmt(s.lim)} limit on ${s.n}`), el('p', null, done ? 'You chose to stop here. It opens again tomorrow at midnight.' : `That’s ${fmt(s.t)} today. Your focus sites are waiting.`));
      const row = el('div', 'tm-arow');
      if (!done) { const more = el('button', 'tm-more', '5 more minutes'); more.type = 'button'; more.addEventListener('click', () => { s.lim = Math.max(s.lim, s.t) + 5 * M; warned.delete(s.d + '80'); hideAlert(); renderPop(); toast(`${s.n} limit moved to ${fmt(s.lim)}.`); }); row.append(more); }
      const stop = el('button', 'btn pri tm-stop', done ? 'Back to Northwind Docs' : 'Close it for today'); stop.type = 'button';
      stop.addEventListener('click', () => { if (!done) { blocked.add(s); toast(`${s.n} closed until tomorrow.`); } go(SITES[0]); renderPop(); });
      row.append(stop); card.append(row); alertBox.append(card); alertBox.hidden = false;
      if (G && !reduced) G.fromTo(card, { scale: .85, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: 'back.out(2)' });
      try { H.tone(660, .18, 'sine', .05); setTimeout(() => H.tone(440, .3, 'sine', .05), 180); } catch (_) {}
    }

    /* popup: two donuts + per-site limits */
    const C = 2 * Math.PI * 46, grow = { v: 1 };
    function donut(cls, label) {
      const svg = svgEl('svg', { viewBox: '0 0 120 120', class: 'tm-donut ' + cls, role: 'img', 'aria-label': label });
      svg.append(svgEl('circle', { cx: 60, cy: 60, r: 46, fill: 'none', stroke: 'rgba(255,255,255,.06)', 'stroke-width': 14 }));
      const g = svgEl('g', { transform: 'rotate(-90 60 60)' }); svg.append(g);
      const big = svgEl('text', { x: 60, y: 60, 'text-anchor': 'middle', class: 'tm-dv' }), sub = svgEl('text', { x: 60, y: 76, 'text-anchor': 'middle', class: 'tm-ds' }); svg.append(big, sub);
      return { svg, g, big, sub, segs: new Map() };
    }
    function drawDonut(D, items, total) {
      let off = 0;
      items.forEach(([key, val, color]) => {
        let c = D.segs.get(key); if (!c) { c = svgEl('circle', { cx: 60, cy: 60, r: 46, fill: 'none', stroke: color, 'stroke-width': 14, 'stroke-dasharray': `0 ${C}` }); D.g.append(c); D.segs.set(key, c); }
        const len = total ? val / total * C * grow.v : 0, gap = items.length > 1 ? Math.min(2, len) : 0;
        c.setAttribute('stroke-dasharray', `${Math.max(0, len - gap)} ${C}`); c.setAttribute('stroke-dashoffset', String(-off)); off += len;
      });
    }
    const dSite = donut('big', 'Time today by site'), dKind = donut('small', 'Focus versus distraction');
    const charts = el('div', 'tm-charts'), kLeg = el('div', 'tm-kleg'); const right = el('div', 'tm-right'); right.append(dKind.svg, kLeg); charts.append(dSite.svg, right);
    const spd = el('div', 'tm-seg'); [[1, 'Real time'], [60, '×60'], [600, '×600']].forEach(([v, t]) => { const b = el('button', null, t); b.type = 'button'; b.setAttribute('aria-pressed', String(v === speed)); b.addEventListener('click', () => { speed = v; spd.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); }); spd.append(b); });
    const list = el('div', 'tm-list');
    pb.append(charts, el('p', 'tm-l', 'Clock speed'), spd, el('p', 'tm-l', 'Sites today · daily limits'), list);
    const LIMS = [[0, 'No limit'], [15 * M, '15 min'], [30 * M, '30 min'], [60 * M, '1 hour'], [120 * M, '2 hours']];
    function renderPop() {
      list.replaceChildren();
      [...SITES].sort((a, b) => b.t - a.t).forEach(s => {
        const r = el('div', 'tm-row'), dot = el('i'); dot.style.background = s.c;
        const mid = el('div', 'tm-mid'), top = el('div', 'tm-rt'); top.append(el('b', null, s.n), el('code', null, fmt(s.t))); mid.append(top);
        const meter = el('span', 'tm-meter'), fill = el('i'); meter.append(fill); mid.append(meter);
        const sel = el('select', 'tm-sel'); sel.setAttribute('aria-label', `Daily limit for ${s.n}`);
        const opts = LIMS.some(([v]) => v === s.lim) ? LIMS : [...LIMS, [s.lim, fmt(s.lim)]];
        opts.forEach(([v, t]) => { const o = el('option', null, t); o.value = String(v); o.selected = v === s.lim; sel.append(o); });
        sel.addEventListener('change', () => { s.lim = +sel.value; warned.delete(s.d + '80'); blocked.delete(s); live(); toast(s.lim ? `${s.n}: daily limit set to ${fmt(s.lim)}.` : `${s.n}: no limit.`); });
        r.append(dot, mid, sel); list.append(r); s.row = { code: top.lastChild, fill, r };
      });
      live();
    }
    function live() {
      const total = SITES.reduce((a, s) => a + s.t, 0);
      drawDonut(dSite, SITES.map(s => [s.d, s.t, s.c]), total); dSite.big.textContent = fmt(total); dSite.sub.textContent = 'today';
      const kinds = Object.keys(KIND).map(k => [k, SITES.filter(s => s.k === k).reduce((a, s) => a + s.t, 0), KIND[k][1]]);
      drawDonut(dKind, kinds, total); dKind.big.textContent = Math.round(kinds[0][1] / total * 100) + '%'; dKind.sub.textContent = 'focus';
      kLeg.replaceChildren(); kinds.forEach(([k, v, c]) => { const r = el('span'), i = el('i'); i.style.background = c; r.append(i, document.createTextNode(`${KIND[k][0]} ${fmt(v)}`)); kLeg.append(r); });
      SITES.forEach(s => {
        if (s.row) { s.row.code.textContent = fmt(s.t); const p = s.lim ? Math.min(1, s.t / s.lim) : 0; s.row.fill.style.width = (s.lim ? p * 100 : 0) + '%'; s.row.r.classList.toggle('warn', p >= .8 && p < 1); s.row.r.classList.toggle('over', p >= 1); s.row.r.classList.toggle('on', s === active); }
        if (s.pill) s.pill.textContent = `${fmt(s.t)} today` + (s.lim ? ` · limit ${fmt(s.lim)}` : '');
      });
      const am = Math.floor(active.t / 60); H.badge(am >= 60 ? `${Math.floor(am / 60)}h${String(am % 60).padStart(2, '0')}` : am + 'm');
    }
    /* the clock: only the visible tab counts */
    let last = performance.now();
    setInterval(() => {
      const now = performance.now(), dt = (now - last) / 1000; last = now;
      if (document.hidden || alertFor || blocked.has(active)) return;
      active.t += dt * speed;
      const s = active;
      if (s.lim) {
        if (s.t >= s.lim * .8 && s.t < s.lim && !warned.has(s.d + '80')) { warned.add(s.d + '80'); toast(`Heads up: ${fmt(s.lim - s.t)} left on ${s.n} today.`); }
        if (s.t >= s.lim) showAlert(s, false);
      }
      live();
    }, 250);
    H.pop.onToggle(o => { if (o && G && !reduced) G.fromTo(grow, { v: 0 }, { v: 1, duration: 1.1, ease: 'power3.out', onUpdate: live }); });
    go(SITES[0]); renderPop(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
