/* NightPane — Chrome extension page with a live browser simulator (Bazozo Studio).
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
    const { el, G, reduced, toast, store } = H, pb = H.pop.body, view = page.parentElement;
    const SITES = {
      docs: { d: 'docs.pebble.dev', n: 'Pebble Docs', path: '/getting-started', fav: '#2563EB' },
      news: { d: 'thecourier.news', n: 'The Courier', path: '/world/arctic-shipping', fav: '#B91C1C' }
    };
    const DEF = { docs: { mode: 'off', b: 100, c: 100, s: 0, w: 0 }, news: { mode: 'oled', b: 92, c: 106, s: 8, w: 35 } };
    let cfg = store.get('np_sites', null); if (!cfg || !cfg.docs || !cfg.news) cfg = JSON.parse(JSON.stringify(DEF));
    let cur = 'docs', lastDark = 'oled';
    const PAL = { off: { bg: '#FFFFFF', text: '#1F2937' }, dim: { bg: '#1B1B22', text: '#D7D6E0' }, oled: { bg: '#000000', text: '#E8E6F0' } };

    /* two tabs, two sites */
    const bar = document.querySelector('.cx-tabs'); bar.querySelectorAll('.cx-tab').forEach(t => t.remove());
    const tabsWrap = el('div', 'np-tabs'); bar.insertBefore(tabsWrap, bar.querySelector('.cx-plus'));
    const tabBtn = {}; Object.entries(SITES).forEach(([k, s]) => { const b = el('button', 'cx-tab np-tab'); b.type = 'button'; const f = el('i', 'fav'); f.style.background = s.fav; b.append(f, el('span', null, s.n)); b.addEventListener('click', () => switchTo(k)); tabBtn[k] = b; tabsWrap.append(b); });

    /* site builders */
    const site = el('div', 'np-site'); page.append(site);
    const warm = el('div', 'np-warm'); view.append(warm);
    function docs() {
      const top = el('header', 'np-top'); top.append(el('b', 'np-logo', '◆ Pebble'), el('span', null, 'Docs'), el('span', null, 'API'), el('span', null, 'Blog'), el('span', 'np-cta', 'Sign in'));
      const wrap = el('div', 'np-docs'), side = el('nav', 'np-side');
      ['Getting started', 'Install', 'Your first app', 'Routing', 'Data', 'Deploy'].forEach((t, i) => side.append(el('span', i === 0 ? 'on' : null, t)));
      const main = el('article', 'np-main');
      main.append(el('p', 'np-kick', 'Guide · 5 min'), el('h1', null, 'Getting started with Pebble'), el('p', null, 'Pebble is a tiny framework for building fast, accessible web apps. This guide takes you from an empty folder to a deployed site.'));
      const call = el('div', 'np-call'); call.append(el('b', null, 'Before you begin'), el('span', null, ' You need Node 20 or newer. Check with node --version.')); main.append(call);
      main.append(el('h2', null, 'Install'), el('pre', 'np-code', '$ npm create pebble@latest my-app\n$ cd my-app && npm run dev\n\n  ➜ Local: http://localhost:5173'));
      const fig = el('figure', 'np-img'); const ph = el('div', 'np-photo'); fig.append(ph, el('figcaption', null, 'Photos are left untouched, so colours stay true.')); main.append(fig);
      const tbl = el('table', 'np-tbl'); [['Command', 'What it does'], ['dev', 'Starts the local server'], ['build', 'Bundles for production'], ['deploy', 'Publishes to the edge']].forEach((r, i) => { const tr = el('tr'); r.forEach(c => tr.append(el(i ? 'td' : 'th', null, c))); tbl.append(tr); }); main.append(tbl);
      main.append(el('p', null, 'Next, read Routing to add more pages, or jump straight to Deploy.'));
      wrap.append(side, main); site.append(top, wrap);
    }
    function news() {
      const top = el('header', 'np-ntop'); top.append(el('b', 'np-mast', 'The Courier'), el('span', null, 'Tuesday 3 November 2026'));
      const main = el('article', 'np-news');
      main.append(el('p', 'np-kick', 'World · Arctic'), el('h1', null, 'A new sea lane opens at the top of the world'), el('p', 'np-dek', 'Summer ice has thinned enough for cargo ships to cut weeks off the route between Asia and Europe. Not everyone is celebrating.'));
      const fig = el('figure', 'np-img'); const ph = el('div', 'np-photo ice'); fig.append(ph, el('figcaption', null, 'A container ship passes sea ice off Svalbard in September.')); main.append(fig);
      const cols = el('div', 'np-cols');
      ['Shipping firms say the northern route saves fuel and time. Scientists worry about black carbon settling on the ice and darkening it, which speeds up melting.', 'Communities along the coast are split. Some welcome jobs at new ports. Others fear spills in waters where a rescue could take days to arrive.', 'For now, traffic remains small: a few hundred voyages a year, against tens of thousands through the Suez Canal.'].forEach(t => cols.append(el('p', null, t)));
      main.append(cols); const q = el('blockquote', null, '“The ice was our road. Now it is a highway for someone else.”'); main.append(q);
      site.append(top, main);
    }

    /* apply settings */
    function apply(animate) {
      const s = cfg[cur]; site.className = 'np-site m-' + s.mode + ' s-' + cur;
      site.style.filter = `brightness(${s.b}%) contrast(${s.c}%) sepia(${s.s}%)`;
      warm.style.opacity = String(s.w / 100 * .42);
      tabsWrap.dataset.mode = s.mode;
      H.badge(s.mode === 'off' ? '' : s.mode === 'oled' ? 'OLED' : 'DIM');
      renderRead();
      if (animate && G && !reduced) G.fromTo(site, { opacity: .6 }, { opacity: 1, duration: .5 });
      try { store.set('np_sites', cfg); } catch (_) {}
    }
    function switchTo(k) {
      cur = k; Object.entries(tabBtn).forEach(([x, b]) => { b.classList.toggle('on', x === k); b.setAttribute('aria-selected', String(x === k)); });
      site.replaceChildren(); (k === 'docs' ? docs : news)(); H.url(SITES[k].d + SITES[k].path); page.scrollTop = 0;
      apply(false); syncControls();
      if (G && !reduced) G.from(site.children, { opacity: 0, y: 10, duration: .35, stagger: .06 });
    }

    /* popup controls */
    const lum = h => { const n = parseInt(h.slice(1), 16), f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(n >> 16 & 255) + .7152 * f(n >> 8 & 255) + .0722 * f(n & 255); };
    const head = el('div', 'np-head'), sw = el('button', 'np-sw'); sw.type = 'button'; sw.setAttribute('role', 'switch'); sw.setAttribute('aria-label', 'Dark mode for this site');
    const knob = el('i', 'np-knob'); sw.append(knob);
    const hl = el('div'), hsite = el('b'), hsub = el('small'); hl.append(hsite, hsub); head.append(hl, sw);
    const modes = el('div', 'np-seg'); [['off', 'Off'], ['dim', 'Dim'], ['oled', 'OLED black']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.k = k; b.addEventListener('click', () => setMode(k)); modes.append(b); });
    const sliders = {};
    const mkS = (key, label, min, max, unit) => { const w = el('label', 'np-sl'), t = el('span', null, label), v = el('b'), i = el('input'); i.type = 'range'; i.min = min; i.max = max; i.addEventListener('input', () => { cfg[cur][key] = +i.value; v.textContent = i.value + unit; apply(false); }); w.append(t, i, v); sliders[key] = { i, v, unit }; return w; };
    const read = el('div', 'np-read');
    const peek = el('button', 'np-peek', 'Hold to peek at the original'); peek.type = 'button';
    const sched = el('label', 'np-sched'), sc = el('input'); sc.type = 'checkbox'; sc.checked = !!store.get('np_sched', false); sc.addEventListener('change', () => { try { store.set('np_sched', sc.checked); } catch (_) {} toast(sc.checked ? 'Warmth will rise automatically from sunset (17:42).' : 'Sunset schedule off.'); }); sched.append(sc, document.createTextNode(' Warm the screen automatically from sunset'));
    const reset = el('button', 'np-reset', 'Reset this site'); reset.type = 'button'; reset.addEventListener('click', () => { cfg[cur] = { ...DEF[cur] }; apply(true); syncControls(); toast(`${SITES[cur].d} reset.`); });
    pb.append(head, modes, el('p', 'np-l', 'Adjust'), mkS('b', 'Brightness', 50, 130, '%'), mkS('c', 'Contrast', 70, 150, '%'), mkS('s', 'Sepia', 0, 100, '%'), mkS('w', 'Warmth', 0, 100, '%'), read, peek, sched, reset);
    function syncControls() {
      const s = cfg[cur]; hsite.textContent = SITES[cur].d; hsub.textContent = s.mode === 'off' ? 'Dark mode off for this site' : `${s.mode === 'oled' ? 'OLED black' : 'Dim'} · remembered for this site`;
      sw.setAttribute('aria-checked', String(s.mode !== 'off'));
      modes.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === s.mode)));
      Object.entries(sliders).forEach(([k, o]) => { o.i.value = s[k]; o.v.textContent = s[k] + o.unit; });
      H.pop.body.parentElement.querySelector('.cx-pop-s').textContent = SITES[cur].d;
      renderRead();
    }
    function renderRead() {
      const s = cfg[cur], p = PAL[s.mode], L1 = lum(p.bg), L2 = lum(p.text), ratio = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
      const blue = Math.round(Math.min(95, s.w * .7 + s.s * .2)), off = s.mode === 'oled' ? 74 : 0;
      read.replaceChildren();
      [[ratio.toFixed(1) + ':1', ratio >= 7 ? 'text contrast · AAA' : ratio >= 4.5 ? 'text contrast · AA' : 'text contrast · low'], [blue + '%', 'blue light cut'], [off + '%', 'pixels switched off']].forEach(([a, b]) => { const d = el('div'); d.append(el('b', null, a), el('span', null, b)); read.append(d); });
    }
    function setMode(k) {
      const s = cfg[cur]; if (k !== 'off') lastDark = k; s.mode = k; apply(true); syncControls();
      if (G && !reduced) G.fromTo(sw, { scale: .88 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.4)', clearProps: 'transform' });
      toast(k === 'off' ? `Dark mode off for ${SITES[cur].d}.` : `${k === 'oled' ? 'OLED black' : 'Dim'} on for ${SITES[cur].d}. NightPane will remember.`);
    }
    sw.addEventListener('click', () => setMode(cfg[cur].mode === 'off' ? lastDark : 'off'));
    const peekOn = () => { site.classList.add('np-orig'); site.style.filter = 'none'; warm.style.opacity = '0'; };
    const peekOff = () => apply(false);
    peek.addEventListener('pointerdown', peekOn); ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(e => peek.addEventListener(e, peekOff));
    peek.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); peekOn(); } }); peek.addEventListener('keyup', peekOff);
    document.addEventListener('keydown', e => { if (e.altKey && e.shiftKey && e.code === 'KeyD') { e.preventDefault(); setMode(cfg[cur].mode === 'off' ? lastDark : 'off'); } });
    switchTo('docs'); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
