/* FocusVeil — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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


/* ---------- FocusVeil simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"a":{"kick":"Science","h1":"Why the night sky is getting brighter","dek":"Light pollution is growing almost 10% a year, and most of us have never seen the Milky Way.","ps":["Look up from almost any town tonight and you will see a few dozen stars. Two generations ago the same view held thousands. The difference is not the sky but the light we pour into it.","A study using reports from 51,000 citizen scientists found the night sky brightening by almost 10% every year, far faster than satellites had measured. LED streetlights, bright white and often pointing sideways, are a large part of the jump.","The effects go beyond stargazing. Migrating birds steer by the stars and crash into lit towers. Moths gather at lamps instead of pollinating, and sea turtle hatchlings crawl toward roads instead of the sea.","People are affected too. Bright evenings delay the release of melatonin, the hormone that tells the body it is time to sleep, and long-term exposure has been linked to poorer sleep.","The fixes are cheap. Shielded lamps that point down, warmer colour temperatures and switching off when no one is around can cut sky glow by more than half without making streets less safe.","Some towns have gone further and earned dark-sky status. Visitors now travel to them for something that was once free everywhere: a sky full of stars."]},"trending":["Heatwave warning for the weekend","Rail strike: what you need to know","The best budget phones of 2026","Inside the new city library","Why rents are finally falling"],"ticker":"BREAKING: Markets open higher · Storm warning for the north coast · Cup final tickets sell out in 6 minutes · New tram line approved · ","key":"fv_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const saved = store.get(M.key, null) || {};
    const S = { on: false, mode: ['column', 'para', 'line'].includes(saved.mode) ? saved.mode : 'para', style: ['dim', 'paper', 'blur'].includes(saved.style) ? saved.style : 'dim', k: typeof saved.k === 'number' && saved.k >= .3 && saved.k <= .9 ? saved.k : .62, freeze: saved.freeze !== false };
    const save = () => store.set(M.key, { mode: S.mode, style: S.style, k: S.k, freeze: S.freeze });

    /* ---- the noisy page ---- */
    const site = el('div', 'fv-site fv-off'), top = el('div', 'fv-top'); top.append(document.createTextNode('Daily Pulse'), el('span', null, 'News'), el('span', null, 'Sport'), el('span', null, 'Science'));
    const tick = el('div', 'fv-tick fv-mv'), td = el('div', null, M.ticker + M.ticker); tick.append(td);
    const grid = el('div', 'fv-grid'), trend = el('aside', 'fv-trend'), ol = el('ol'); M.trending.forEach(t => ol.append(el('li', null, t))); trend.append(el('h4', null, 'Trending'), ol);
    const main = el('article', 'fv-main'); main.append(el('p', 'fv-kick', M.a.kick), el('h1', null, M.a.h1), el('p', 'fv-dek', M.a.dek));
    const P = M.a.ps.map((t, i) => { const p = el('p', 'fv-p', t); main.append(p); if (i === 2) { const n = el('div', 'fv-news fv-mv'); n.append(el('i'), document.createTextNode('Get the Daily Pulse briefing every morning'), el('span', null, 'Sign up')); main.append(n); } return p; });
    const ads = el('aside', 'fv-ads'), a1 = el('div', 'fv-ad fv-mv'), a2 = el('div', 'fv-ad b fv-mv'); a1.append(el('b', null, '70% OFF'), el('small', null, 'Today only · Shop now'));
    const a2t = el('div'); a2t.append(el('b', null, 'NEW'), el('small', null, 'Phones from £9/mo')); a2.append(a2t); ads.append(el('h4', null, 'Sponsored'), a1, a2);
    grid.append(trend, main, ads); site.append(top, tick, grid);
    const pn = ['t', 'b', 'l', 'r'].map(() => { const d = el('i', 'fv-pn'); site.append(d); return d; }), ring = el('i', 'fv-ring'); site.append(ring);
    page.append(site); page.tabIndex = 0; page.setAttribute('aria-label', 'Article. With FocusVeil on, press J and K to move between paragraphs.');

    /* ---- veil geometry ---- */
    const rel = n => { const r = n.getBoundingClientRect(), o = site.getBoundingClientRect(); return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height }; };
    const cur = { x: 0, y: 0, w: 0, h: 0 }; let tw = null, idx = 0;
    function place() {
      const W = site.scrollWidth, Hh = site.scrollHeight, c = cur;
      const set = (d, x, y, w, h) => { d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.width = Math.max(0, w) + 'px'; d.style.height = Math.max(0, h) + 'px'; };
      set(pn[0], 0, 0, W, c.y); set(pn[1], 0, c.y + c.h, W, Hh - c.y - c.h); set(pn[2], 0, c.y, c.x, c.h); set(pn[3], c.x + c.w, c.y, W - c.x - c.w, c.h); set(ring, c.x, c.y, c.w, c.h);
    }
    function readingY() { return page.scrollTop + page.clientHeight * .4; }
    function target() {
      const col = rel(main), pad = 14;
      if (S.mode === 'column') return { x: col.x - pad, y: col.y - pad, w: col.w + pad * 2, h: col.h + pad * 2 };
      if (S.mode === 'para') { const p = P[idx], r = rel(p); return { x: col.x - pad, y: r.y - 10, w: col.w + pad * 2, h: r.h + 14 }; }
      return { x: col.x - pad, y: readingY() - 32, w: col.w + pad * 2, h: 64 };
    }
    function nearest() { const y = readingY(); let bi = 0, bd = Infinity; P.forEach((p, i) => { const r = rel(p), d = Math.abs(r.y + r.h / 2 - y); if (d < bd) { bd = d; bi = i; } }); return bi; }
    function move(instant) {
      if (!S.on) return; const t = target();
      if (tw) tw.kill();
      if (instant || !G || reduced || S.mode === 'line') { Object.assign(cur, t); place(); } else tw = G.to(cur, { ...t, duration: .55, ease: 'power3.out', onUpdate: place });
      renderProg();
    }
    let raf = 0;
    page.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (S.mode === 'para') { const n = nearest(); if (n !== idx) { idx = n; move(); } } else if (S.mode === 'line') move(true); renderProg(); }); }, { passive: true });
    window.addEventListener('resize', () => move(true));
    page.addEventListener('keydown', e => {
      if (!S.on || (e.key !== 'j' && e.key !== 'k')) return; e.preventDefault(); if (S.mode === 'column') setMode('para');
      idx = Math.max(0, Math.min(P.length - 1, idx + (e.key === 'j' ? 1 : -1))); const r = rel(P[idx]);
      page.scrollTo({ top: Math.max(0, r.y - page.clientHeight * .4 + r.h / 2), behavior: reduced ? 'auto' : 'smooth' }); move();
    });
    function paintVeil() {
      const a = S.k, v = S.style === 'paper' ? 'rgba(246,244,238,' + (a * .95).toFixed(2) + ')' : S.style === 'blur' ? 'rgba(24,24,32,' + (a * .45).toFixed(2) + ')' : 'rgba(14,14,22,' + a.toFixed(2) + ')';
      site.style.setProperty('--veil', v); site.style.setProperty('--bl', (2 + a * 6).toFixed(1) + 'px'); site.classList.toggle('fv-blur', S.style === 'blur');
    }
    function setOn(v) {
      S.on = v; site.classList.toggle('fv-off', !v); site.classList.toggle('fv-freeze', v && S.freeze); H.badge(v ? '✓' : '');
      if (v) { idx = nearest(); const t = target(); Object.assign(cur, { x: 0, y: t.y, w: site.scrollWidth, h: t.h }); place(); move();
        if (G && !reduced) G.fromTo(pn, { opacity: 0 }, { opacity: 1, duration: .5, stagger: .04 }); }
      sync();
    }
    function setMode(k) { S.mode = k; save(); if (!S.on) setOn(true); else move(); sync(); H.tone(523, .05); }

    /* ---- popover ---- */
    const PP = el('div', 'pc'), power = swBtn('FocusVeil', 'Dim everything but what you read');
    power.addEventListener('click', () => { setOn(!S.on); toast(S.on ? 'FocusVeil on · press J and K to move' : 'FocusVeil off'); H.tone(S.on ? 660 : 440, .08); });
    const mb = el('div'), seg = el('div', 'pc-seg'); [['column', 'Column'], ['para', 'Paragraph'], ['line', 'Ruler']].forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => setMode(k)); seg.append(b); }); mb.append(label('Keep lit'), seg);
    const sb = el('div'), st = el('div', 'fv-st'); [['dim', 'Dim', 'rgba(14,14,22,.7)'], ['paper', 'Paper', 'rgba(232,229,220,.95)'], ['blur', 'Blur', 'rgba(120,120,140,.5)']].forEach(([k, t, v]) => { const b = btn(''); b.dataset.k = k; const i = el('i'); i.style.setProperty('--v', v); b.append(i, el('span', null, t)); b.addEventListener('click', () => { S.style = k; save(); paintVeil(); if (!S.on) setOn(true); sync(); }); st.append(b); }); sb.append(label('Veil'), st);
    const kb = el('div'), ko = el('output'), rng = el('input', 'fv-rng'); rng.type = 'range'; rng.min = 30; rng.max = 90; rng.step = 1; rng.setAttribute('aria-label', 'Veil strength'); kb.append(label('Strength', ko), rng);
    rng.addEventListener('input', () => { S.k = +rng.value / 100; paintVeil(); if (!S.on) setOn(true); sync(); }); rng.addEventListener('change', save);
    const fz = swBtn('Freeze tickers and moving ads', null, true); fz.addEventListener('click', () => { S.freeze = !S.freeze; save(); site.classList.toggle('fv-freeze', S.on && S.freeze); sync(); });
    const prog = el('div', 'fv-prog'), pr = el('div'), pp = el('b'), pl = el('span'), bar = el('i'), be = el('em'); bar.append(be); pr.append(pp, pl); prog.append(pr, bar);
    PP.append(power, mb, sb, kb, fz, prog); pb.append(PP);
    const words = M.a.ps.join(' ').split(/\s+/).length;
    function renderProg() { const col = rel(main), f = Math.max(0, Math.min(1, (readingY() - col.y) / col.h)); pp.textContent = Math.round(f * 100) + '%'; pl.textContent = Math.max(0, Math.ceil(words * (1 - f) / 230)) + ' min left'; be.style.width = (f * 100) + '%'; }
    function sync() {
      power.setAttribute('aria-checked', String(S.on)); fz.setAttribute('aria-checked', String(S.freeze));
      seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(S.on && b.dataset.k === S.mode))); st.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.style)));
      rng.value = Math.round(S.k * 100); rng.style.setProperty('--p', ((S.k * 100 - 30) / 60 * 100) + '%'); ko.textContent = Math.round(S.k * 100) + '%';
    }
    paintVeil(); sync(); renderProg();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => move(true));
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
