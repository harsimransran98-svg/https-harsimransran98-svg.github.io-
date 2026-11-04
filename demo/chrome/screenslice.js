/* ScreenSlice — Chrome extension page with a live browser simulator (Bazozo Studio).
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
    const { el, G, reduced, toast } = H, pb = H.pop.body, view = page.parentElement;
    /* the landing page is painted on a canvas so captures are real pixels */
    const W = 1000, PH = 2400, cv = el('canvas', 'ss-cv'); cv.width = W; cv.height = PH; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Orbit landing page');
    const ctx = cv.getContext('2d', { willReadFrequently: true }); page.append(cv);
    const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
    function paint() {
      const c = ctx; c.fillStyle = '#fff'; c.fillRect(0, 0, W, PH);
      c.fillStyle = '#fff'; c.fillRect(0, 0, W, 70); c.fillStyle = '#E2E8F0'; c.fillRect(0, 69, W, 1);
      c.fillStyle = '#2563EB'; c.beginPath(); c.arc(52, 35, 11, 0, 7); c.fill(); c.fillStyle = '#0F172A'; c.font = '400 22px "Archivo Black", sans-serif'; c.fillText('orbit', 72, 43);
      c.font = '500 15px Archivo, sans-serif'; c.fillStyle = '#475569'; ['Product', 'Pricing', 'Customers', 'Docs'].forEach((t, i) => c.fillText(t, 380 + i * 105, 41));
      c.fillStyle = '#2563EB'; rr(c, 836, 18, 120, 36, 18); c.fill(); c.fillStyle = '#fff'; c.font = '600 14px Archivo, sans-serif'; c.fillText('Start free', 862, 41);
      const g = c.createLinearGradient(0, 70, 0, 640); g.addColorStop(0, '#EEF2FF'); g.addColorStop(1, '#fff'); c.fillStyle = g; c.fillRect(0, 70, W, 570);
      c.fillStyle = '#0F172A'; c.font = '400 54px "Archivo Black", sans-serif'; c.fillText('Plan work.', 52, 210); c.fillText('Ship together.', 52, 272);
      c.fillStyle = '#475569'; c.font = '400 19px Archivo, sans-serif'; c.fillText('Roadmaps, sprints and docs in one calm', 54, 322); c.fillText('workspace your whole team will open.', 54, 350);
      c.fillStyle = '#2563EB'; rr(c, 54, 386, 170, 52, 26); c.fill(); c.fillStyle = '#fff'; c.font = '700 16px Archivo, sans-serif'; c.fillText('Try Orbit free', 82, 418);
      c.strokeStyle = '#CBD5E1'; c.lineWidth = 1.5; rr(c, 238, 386, 150, 52, 26); c.stroke(); c.fillStyle = '#0F172A'; c.fillText('Watch demo', 266, 418);
      c.fillStyle = '#0F172A'; rr(c, 530, 130, 420, 430, 18); c.fill();
      ['To do', 'Doing', 'Done'].forEach((t, i) => { const x = 550 + i * 134; c.fillStyle = '#94A3B8'; c.font = '600 12px Archivo, sans-serif'; c.fillText(t.toUpperCase(), x, 165); for (let j = 0; j < 4 - i; j++) { c.fillStyle = ['#1E293B', '#1E3A8A', '#14532D'][i]; rr(c, x, 180 + j * 86, 120, 74, 10); c.fill(); c.fillStyle = ['#F43F5E', '#60A5FA', '#4ADE80', '#FBBF24'][(i + j) % 4]; rr(c, x + 10, 192 + j * 86, 34, 7, 4); c.fill(); c.fillStyle = '#CBD5E1'; rr(c, x + 10, 210 + j * 86, 96, 7, 4); c.fill(); rr(c, x + 10, 224 + j * 86, 70, 7, 4); c.fill(); } });
      c.fillStyle = '#94A3B8'; c.font = '600 13px Archivo, sans-serif'; c.fillText('TRUSTED BY 9,000 TEAMS', 52, 690); c.font = '400 24px "Archivo Black", sans-serif'; c.fillStyle = '#CBD5E1'; ['NORTHWIND', 'Lumen', 'kettle&ash', 'FJORD', 'Sable'].forEach((t, i) => c.fillText(t, 52 + i * 190, 740));
      c.fillStyle = '#0F172A'; c.font = '400 38px "Archivo Black", sans-serif'; c.fillText('Everything in one orbit', 52, 860);
      [['Roadmaps', '#2563EB'], ['Sprints', '#F43F5E'], ['Docs', '#10B981']].forEach(([t, col], i) => { const x = 52 + i * 310; c.fillStyle = '#F8FAFC'; rr(c, x, 900, 286, 250, 18); c.fill(); c.strokeStyle = '#E2E8F0'; rr(c, x, 900, 286, 250, 18); c.stroke(); c.fillStyle = col; c.beginPath(); c.arc(x + 44, 950, 22, 0, 7); c.fill(); c.fillStyle = '#0F172A'; c.font = '700 22px Archivo, sans-serif'; c.fillText(t, x + 24, 1012); c.fillStyle = '#CBD5E1'; [0, 1, 2].forEach(k => { rr(c, x + 24, 1036 + k * 22, 230 - k * 50, 9, 5); c.fill(); }); });
      c.fillStyle = '#0B1220'; rr(c, 52, 1200, 896, 470, 22); c.fill(); c.fillStyle = '#E2E8F0'; c.font = '700 20px Archivo, sans-serif'; c.fillText('Velocity, last 12 sprints', 90, 1252);
      for (let i = 0; i < 12; i++) { const h = 80 + Math.abs(Math.sin(i * 1.3)) * 200 + i * 10; c.fillStyle = i === 11 ? '#F43F5E' : '#3B82F6'; rr(c, 92 + i * 68, 1620 - h, 44, h, 8); c.fill(); }
      c.fillStyle = '#F1F5F9'; rr(c, 52, 1710, 896, 200, 22); c.fill(); c.fillStyle = '#0F172A'; c.font = 'italic 400 26px Archivo, sans-serif'; c.fillText('“We cut our weekly status meeting to ten minutes.”', 92, 1782);
      c.fillStyle = '#F59E0B'; c.beginPath(); c.arc(116, 1846, 24, 0, 7); c.fill(); c.fillStyle = '#0F172A'; c.font = '700 17px Archivo, sans-serif'; c.fillText('Dana Ruiz · Head of Product, Northwind', 154, 1842); c.fillStyle = '#64748B'; c.font = '400 15px Archivo, sans-serif'; c.fillText('dana.ruiz@northwind.example · Card •••• 4242 · Invoice #INV-20931', 154, 1866);
      [['Free', '$0', '#F8FAFC', '#0F172A'], ['Team', '$8', '#2563EB', '#fff'], ['Scale', '$16', '#F8FAFC', '#0F172A']].forEach(([n, p, bg, fg], i) => { const x = 52 + i * 310; c.fillStyle = bg; rr(c, x, 1960, 286, 300, 18); c.fill(); c.fillStyle = fg; c.font = '700 20px Archivo, sans-serif'; c.fillText(n, x + 28, 2010); c.font = '400 52px "Archivo Black", sans-serif'; c.fillText(p, x + 28, 2082); c.font = '400 15px Archivo, sans-serif'; c.fillText('per person / month', x + 28, 2110); c.globalAlpha = .35; [0, 1, 2].forEach(k => { rr(c, x + 28, 2146 + k * 26, 200 - k * 30, 9, 5); c.fill(); }); c.globalAlpha = 1; });
      c.fillStyle = '#0F172A'; c.fillRect(0, 2300, W, 100); c.fillStyle = '#94A3B8'; c.font = '400 14px Archivo, sans-serif'; c.fillText('© 2026 Orbit Labs · Privacy · Terms · Status', 52, 2356);
    }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(paint); paint();

    /* capture modes */
    const scale = () => W / cv.getBoundingClientRect().width;
    function cropFromView(x, y, w, h) { const c = cv.getBoundingClientRect(), s = scale(); return { x: Math.max(0, (x - c.left) * s), y: Math.max(0, (y - c.top) * s), w: w * s, h: h * s }; }
    function grab(r) { r.w = Math.min(r.w, W - r.x); r.h = Math.min(r.h, PH - r.y); if (r.w < 8 || r.h < 8) { toast('That area is too small.'); return; } const out = el('canvas'); out.width = Math.round(r.w); out.height = Math.round(r.h); out.getContext('2d').drawImage(cv, r.x, r.y, r.w, r.h, 0, 0, out.width, out.height); flash(); openEditor(out); }
    function flash() { const f = el('div', 'ss-flash'); view.append(f); if (G && !reduced) G.fromTo(f, { opacity: .9 }, { opacity: 0, duration: .45, onComplete: () => f.remove() }); else f.remove(); try { H.tone(1400, .05, 'square', .03); } catch (_) {} }
    function visible() { const v = view.getBoundingClientRect(); H.pop.close(); setTimeout(() => grab(cropFromView(v.left, v.top, v.width, v.height)), 250); }
    async function full() {
      H.pop.close(); const st = el('div', 'ss-stitch'); view.append(st); const steps = Math.ceil(page.scrollHeight / page.clientHeight); const start = page.scrollTop;
      for (let i = 0; i < steps; i++) { st.textContent = `Capturing slice ${i + 1} of ${steps}…`; page.scrollTop = i * page.clientHeight; flash(); await new Promise(r => setTimeout(r, reduced ? 30 : 280)); }
      st.textContent = 'Stitching…'; await new Promise(r => setTimeout(r, 300)); st.remove(); page.scrollTop = start;
      const out = el('canvas'); out.width = W; out.height = PH; out.getContext('2d').drawImage(cv, 0, 0); openEditor(out);
    }
    /* drag a crop box */
    const sel = el('div', 'ss-sel'), box = el('div', 'ss-box'), dim = el('span', 'ss-dim'), hint = el('p', 'ss-hint', 'Drag to select an area · Esc to cancel'), conf = el('div', 'ss-conf');
    const ok = el('button', 'btn pri', 'Capture area'), no = el('button', 'ss-no', 'Cancel'); ok.type = no.type = 'button'; conf.append(no, ok); conf.hidden = true; box.append(dim, conf); sel.append(hint, box); sel.hidden = true; box.hidden = true; view.append(sel);
    let drag = null, area = null;
    function region() { H.pop.close(); sel.hidden = false; box.hidden = true; conf.hidden = true; area = null; }
    sel.addEventListener('pointerdown', e => { if (e.target.closest('.ss-conf')) return; const v = view.getBoundingClientRect(); drag = { x: e.clientX - v.left, y: e.clientY - v.top }; box.hidden = false; conf.hidden = true; sel.setPointerCapture(e.pointerId); move(e); });
    function move(e) { if (!drag) return; const v = view.getBoundingClientRect(), x = Math.max(0, Math.min(v.width, e.clientX - v.left)), y = Math.max(0, Math.min(v.height, e.clientY - v.top)); area = { x: Math.min(x, drag.x), y: Math.min(y, drag.y), w: Math.abs(x - drag.x), h: Math.abs(y - drag.y) }; Object.assign(box.style, { left: area.x + 'px', top: area.y + 'px', width: area.w + 'px', height: area.h + 'px' }); const s = scale(); dim.textContent = `${Math.round(area.w * s)} × ${Math.round(area.h * s)}`; }
    sel.addEventListener('pointermove', move);
    sel.addEventListener('pointerup', () => { if (!drag) return; drag = null; if (!area || area.w < 12 || area.h < 12) { box.hidden = true; return; } conf.hidden = false; });
    no.addEventListener('click', () => { sel.hidden = true; });
    ok.addEventListener('click', () => { const v = view.getBoundingClientRect(); sel.hidden = true; grab(cropFromView(v.left + area.x, v.top + area.y, area.w, area.h)); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!sel.hidden) sel.hidden = true; } if (e.altKey && e.shiftKey && e.code === 'KeyS') { e.preventDefault(); region(); } });

    /* editor: arrows, boxes, blur, undo, export */
    const ed = el('div', 'ss-ed'); ed.hidden = true; ed.setAttribute('role', 'dialog'); ed.setAttribute('aria-label', 'Annotate capture'); view.append(ed);
    const tb = el('div', 'ss-tb'), stage = el('div', 'ss-stage'), foot = el('div', 'ss-foot');
    const TOOLS = [['arrow', '↗ Arrow'], ['box', '▢ Box'], ['blur', '▦ Blur'], ['mark', '▬ Highlight']]; let tool = 'arrow', color = '#F43F5E';
    const tools = el('div', 'ss-tools'); TOOLS.forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.k = k; b.setAttribute('aria-pressed', String(k === tool)); b.addEventListener('click', () => { tool = k; tools.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); }); tools.append(b); });
    const cols = el('div', 'ss-cols'); ['#F43F5E', '#2563EB', '#FACC15', '#10B981'].forEach(c => { const b = el('button'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', 'Colour ' + c); b.setAttribute('aria-pressed', String(c === color)); b.addEventListener('click', () => { color = c; cols.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); }); cols.append(b); });
    const undoB = el('button', 'ss-undo', '↶ Undo'); undoB.type = 'button';
    tb.append(tools, cols, undoB);
    const info = el('span', 'ss-info'), dl = el('button', 'btn pri ss-dl', 'Download PNG'), cp = el('button', 'ss-cp', 'Copy'), cl = el('button', 'ss-cl', 'Close'); dl.type = cp.type = cl.type = 'button';
    foot.append(info, cl, cp, dl); ed.append(tb, stage, foot);
    let out = null, octx = null, hist = [], base = null, pd = null;
    function openEditor(c) {
      out = c; octx = out.getContext('2d', { willReadFrequently: true }); out.className = 'ss-out'; stage.replaceChildren(out); hist = []; ed.hidden = false;
      info.textContent = `${out.width} × ${out.height} px`; out.toBlob(b => { if (b) info.textContent = `${out.width} × ${out.height} px · ${Math.round(b.size / 1024)} KB`; });
      if (G && !reduced) G.fromTo(ed, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .35, ease: 'power3.out' });
      out.addEventListener('pointerdown', down); out.addEventListener('pointermove', drawMove); out.addEventListener('pointerup', up); out.addEventListener('pointercancel', up);
      addRecent(out);
    }
    const pt = e => { const r = out.getBoundingClientRect(); return { x: (e.clientX - r.left) * out.width / r.width, y: (e.clientY - r.top) * out.height / r.height }; };
    const lw = () => Math.max(4, out.width / 180);
    function shape(c, a, b) {
      c.save(); c.strokeStyle = color; c.fillStyle = color; c.lineWidth = lw(); c.lineCap = 'round'; c.lineJoin = 'round';
      if (tool === 'arrow') { const ang = Math.atan2(b.y - a.y, b.x - a.x), hs = lw() * 4; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x - Math.cos(ang) * hs * .6, b.y - Math.sin(ang) * hs * .6); c.stroke(); c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x - hs * Math.cos(ang - .45), b.y - hs * Math.sin(ang - .45)); c.lineTo(b.x - hs * Math.cos(ang + .45), b.y - hs * Math.sin(ang + .45)); c.closePath(); c.fill(); }
      else if (tool === 'box') { c.beginPath(); c.roundRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y), lw() * 1.5); c.stroke(); }
      else if (tool === 'mark') { c.globalAlpha = .35; c.fillRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y)); }
      else if (tool === 'blur') { const x = Math.round(Math.min(a.x, b.x)), y = Math.round(Math.min(a.y, b.y)), w = Math.round(Math.abs(b.x - a.x)), h = Math.round(Math.abs(b.y - a.y)); if (w > 2 && h > 2) pixelate(c, x, y, w, h); }
      c.restore();
    }
    function pixelate(c, x, y, w, h) {
      const n = Math.max(8, Math.round(out.width / 90)), img = c.getImageData(x, y, w, h), d = img.data;
      for (let by = 0; by < h; by += n) for (let bx = 0; bx < w; bx += n) { let r = 0, g = 0, b = 0, k = 0; for (let yy = by; yy < Math.min(by + n, h); yy++) for (let xx = bx; xx < Math.min(bx + n, w); xx++) { const i = (yy * w + xx) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; k++; } r /= k; g /= k; b /= k; for (let yy = by; yy < Math.min(by + n, h); yy++) for (let xx = bx; xx < Math.min(bx + n, w); xx++) { const i = (yy * w + xx) * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; } }
      c.putImageData(img, x, y);
    }
    function down(e) { e.preventDefault(); out.setPointerCapture(e.pointerId); base = octx.getImageData(0, 0, out.width, out.height); pd = pt(e); }
    function drawMove(e) { if (!pd) return; octx.putImageData(base, 0, 0); const p = pt(e); if (tool === 'blur') { octx.save(); octx.setLineDash([lw() * 2, lw() * 1.5]); octx.strokeStyle = '#0F172A'; octx.lineWidth = lw() * .6; octx.strokeRect(Math.min(pd.x, p.x), Math.min(pd.y, p.y), Math.abs(p.x - pd.x), Math.abs(p.y - pd.y)); octx.restore(); } else shape(octx, pd, p); }
    function up(e) { if (!pd) return; const p = pt(e); octx.putImageData(base, 0, 0); if (Math.hypot(p.x - pd.x, p.y - pd.y) > 6) { hist.push(base); if (hist.length > 10) hist.shift(); shape(octx, pd, p); } pd = null; base = null; }
    undoB.addEventListener('click', () => { const h = hist.pop(); if (h) octx.putImageData(h, 0, 0); else toast('Nothing to undo.'); });
    dl.addEventListener('click', () => {
      out.toBlob(b => { if (!b) return; const url = URL.createObjectURL(b), a = el('a'); a.href = url; a.download = `screenslice-orbit-${out.width}x${out.height}.png`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); toast(`Saved ${a.download} · ${Math.round(b.size / 1024)} KB`); }, 'image/png');
    });
    cp.addEventListener('click', () => { out.toBlob(b => { try { navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]).then(() => toast('Image copied to the clipboard.'), () => toast('Your browser blocked the copy. Use Download instead.')); } catch (_) { toast('Copying images is not supported here. Use Download instead.'); } }, 'image/png'); });
    cl.addEventListener('click', () => { ed.hidden = true; });

    /* popup */
    const MODES = [['region', 'Select area', 'Drag a box over anything', region], ['visible', 'Visible part', 'What you can see right now', visible], ['full', 'Full page', 'Scroll, capture and stitch', full]];
    const grid = el('div', 'ss-modes');
    MODES.forEach(([k, t, s, fn], i) => { const b = el('button', 'ss-mode' + (i === 0 ? ' pri' : '')); b.type = 'button'; const ic = el('i', 'ss-ic ic-' + k); b.append(ic, el('b', null, t), el('small', null, s)); b.addEventListener('click', fn); grid.append(b); });
    const recent = el('div', 'ss-recent');
    pb.append(grid, el('p', 'ss-l', 'Recent captures'), recent, el('p', 'ss-tip', 'Shortcut: Alt+Shift+S to select an area'));
    let recents = [];
    function addRecent(c) { const t = el('canvas', 'ss-th'); const s = 96 / Math.max(c.width, c.height); t.width = Math.max(1, Math.round(c.width * s)); t.height = Math.max(1, Math.round(c.height * s)); t.getContext('2d').drawImage(c, 0, 0, t.width, t.height); recents = [t, ...recents].slice(0, 4); renderRecent(); H.badge(recents.length); }
    function renderRecent() { recent.replaceChildren(); if (!recents.length) { recent.append(el('p', 'ss-empty', 'No captures yet.')); return; } recents.forEach(t => { const w = el('div', 'ss-rt'); w.append(t); recent.append(w); }); }
    renderRecent(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
