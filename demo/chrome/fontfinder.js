/* FontFinder — Chrome extension page with a live browser simulator (Bazozo Studio).
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
    const { el, G, reduced, toast } = H, pb = H.pop.body;
    // the page uses several real fonts so the inspector has something to find
    const art = el('article', 'fi-art');
    art.append(el('p', 'fi-kick', 'Essay · 9 min read'), el('h1', 'fi-h1', 'The case for slow type'), el('p', 'fi-dek', 'Why the best interfaces still borrow from letterpress, and what we lose when every heading looks the same.'));
    const by = el('div', 'fi-by'); by.append(el('b', null, 'Lena Okafor'), el('span', null, 'November 2026')); art.append(by);
    art.append(el('p', 'fi-p', 'Type is the voice of a page. Before a reader takes in a single word, the shapes have already said something about care, speed and trust.'), el('p', 'fi-p', 'A serif headline slows the eye down just enough. A neutral sans keeps the body out of the way. Somewhere in between, a handwritten note reminds you a person was here.'));
    art.append(el('blockquote', 'fi-q', '“Good typography is invisible until it isn’t.”'));
    art.append(el('h2', 'fi-h2', 'What to measure'), el('p', 'fi-p', 'Size, weight, line height and the space between letters. Get those four right and most of the work is done.'));
    art.append(el('pre', 'fi-code', 'h1 { font: 700 56px/1.05 "Playfair Display", serif; }'));
    art.append(el('p', 'fi-note', 'p.s. the margins matter more than the font.'));
    page.append(art);
    const box = el('div', 'fi-box'), lab = el('span', 'fi-lab'); box.hidden = true; page.append(box, lab);
    let locked = null, hover = null;
    const info = el('div', 'fi-info'), list = el('div', 'fi-list'); pb.append(info, el('p', 'fi-l', 'Fonts on this page'), list);
    const fam = cs => cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const W = { 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black' };
    function place(t) {
      const pr = page.getBoundingClientRect(), r = t.getBoundingClientRect(), cs = getComputedStyle(t);
      Object.assign(box.style, { left: r.left - pr.left + page.scrollLeft - 3 + 'px', top: r.top - pr.top + page.scrollTop - 3 + 'px', width: r.width + 6 + 'px', height: r.height + 6 + 'px' }); box.hidden = false; box.classList.toggle('lock', t === locked);
      lab.textContent = `${fam(cs)} · ${parseFloat(cs.fontSize)}px`; lab.style.left = box.style.left; lab.style.top = Math.max(0, parseFloat(box.style.top) - 24) + 'px'; lab.hidden = false;
    }
    function show(t) {
      const cs = getComputedStyle(t), f = fam(cs), w = cs.fontWeight, size = parseFloat(cs.fontSize), lh = cs.lineHeight === 'normal' ? 'normal' : (parseFloat(cs.lineHeight) / size).toFixed(2), ls = cs.letterSpacing === 'normal' ? '0' : (parseFloat(cs.letterSpacing) / size).toFixed(3) + 'em';
      info.replaceChildren();
      const sample = el('div', 'fi-sample', 'Aa Gg'); sample.style.fontFamily = cs.fontFamily; sample.style.fontWeight = w; sample.style.fontStyle = cs.fontStyle;
      const head = el('div', 'fi-head'); head.append(sample, el('div', null)); head.lastChild.append(el('b', null, f), el('span', null, `${W[w] || w}${cs.fontStyle === 'italic' ? ' Italic' : ''} · <${t.tagName.toLowerCase()}>`));
      const grid = el('div', 'fi-grid'); [['Size', `${size}px`], ['Weight', w], ['Line height', lh], ['Letter spacing', ls], ['Colour', cs.color.replace(/\s/g, '')], ['Style', cs.fontStyle]].forEach(([k, v]) => { const d = el('div'); d.append(el('span', null, k), el('b', null, String(v))); grid.append(d); });
      const css = `font-family: ${cs.fontFamily};\nfont-weight: ${w};\nfont-size: ${size}px;\nline-height: ${lh};\nletter-spacing: ${ls};`;
      const pre = el('pre', 'fi-css'); pre.textContent = css;
      const cp = el('button', 'btn pri fi-copy', 'Copy CSS'); cp.type = 'button'; cp.addEventListener('click', () => { try { navigator.clipboard.writeText(css).catch(() => {}); } catch (_) {} toast(`CSS for ${f} copied.`); });
      info.append(head, grid, pre, cp, el('p', 'fi-hint', locked ? 'Locked. Click the page again to release.' : 'Hovering. Click to lock this selection.'));
    }
    page.addEventListener('pointermove', e => { if (!H.pop.isOpen() || locked) return; const t = e.target.closest('.fi-art *:not(.fi-art)'); if (!t || t === hover) return; hover = t; place(t); show(t); });
    page.addEventListener('pointerleave', () => { if (!locked) { box.hidden = lab.hidden = true; } });
    page.addEventListener('click', e => { if (!H.pop.isOpen()) { toast('Open FontFinder from the toolbar first.'); return; } const t = e.target.closest('.fi-art *'); if (!t) return; locked = locked === t ? null : t; place(t); show(t); if (locked && G && !reduced) G.fromTo(box, { scale: 1.06 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); });
    page.addEventListener('scroll', () => { const t = locked || hover; if (t && !box.hidden) place(t); });
    function tally() {
      const m = new Map(); art.querySelectorAll('*').forEach(n => { const cs = getComputedStyle(n), f = fam(cs); m.set(f, (m.get(f) || new Set()).add(cs.fontWeight)); });
      list.replaceChildren(); [...m].forEach(([f, ws]) => { const r = el('div', 'fi-row'); const s = el('span', 'fi-aa', 'Aa'); s.style.fontFamily = `'${f}'`; r.append(s, el('b', null, f), el('small', null, [...ws].sort().join(' · '))); list.append(r); });
    }
    H.pop.onToggle(o => { if (!o) { box.hidden = lab.hidden = true; locked = null; } else { tally(); if (!info.firstChild) info.append(el('p', 'fi-hint', 'Hover any text on the page.')); } });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { tally(); setTimeout(() => { H.pop.open(); const h = art.querySelector('.fi-h1'); hover = h; place(h); show(h); }, 700); });
  }

  demo(document.getElementById('cxPage'), H);
})();
