/* GridSnap — Chrome extension page with a live browser simulator (Bazozo Studio).
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
    const BP = { mobile: { w: 375, cols: 4, gut: 16, mar: 16 }, tablet: { w: 768, cols: 8, gut: 20, mar: 32 }, desktop: { w: 1200, cols: 12, gut: 24, mar: 48 } };
    const S = { bp: 'desktop', cols: 12, gut: 24, mar: 48, base: true, rulers: true, on: true, op: 55 };
    const stage = el('div', 'gs-stage'), frame = el('div', 'gs-frame'), site = el('div', 'gs-site'), ov = el('div', 'gs-ov'), base = el('div', 'gs-base'), rx = el('div', 'gs-rx'), ry = el('div', 'gs-ry'), meas = el('div', 'gs-meas'), bpTag = el('span', 'gs-bptag');
    meas.hidden = true;
    // a landing page laid out on the same grid, so the overlay lines up
    const nav = el('header', 'gs-b gs-nav'); nav.append(el('b', null, 'lumen'), el('span', null, 'Product  Pricing  Docs'), el('i', null, 'Sign in'));
    const hero = el('section', 'gs-b gs-hero'); hero.append(el('h1', null, 'Light for every screen'), el('p', null, 'Design systems that hold their shape from 375 to 1440 pixels.'), el('span', 'gs-cta', 'Start free'));
    const img = el('div', 'gs-b gs-img'), c1 = el('div', 'gs-b gs-card'), c2 = el('div', 'gs-b gs-card'), c3 = el('div', 'gs-b gs-card');
    [c1, c2, c3].forEach((c, i) => c.append(el('b', null, ['Tokens', 'Components', 'Grids'][i]), el('p', null, 'Built on an 8 px rhythm with 24 px gutters.')));
    const foot = el('footer', 'gs-b gs-foot', '© Lumen · built on the grid');
    site.append(nav, hero, img, c1, c2, c3, foot);
    frame.append(site, base, ov, meas); stage.append(rx, ry, frame, bpTag); page.append(stage);
    function layout() {
      const b = BP[S.bp], scale = Math.min(1, (stage.clientWidth - 40) / b.w);
      frame.style.width = b.w + 'px'; frame.style.transform = `scale(${scale})`; stage.style.height = (frame.scrollHeight * scale + 60) + 'px';
      site.style.setProperty('--cols', S.cols); site.style.setProperty('--gut', S.gut + 'px'); site.style.setProperty('--mar', S.mar + 'px');
      const span = (n, s) => `${s || 1} / span ${Math.min(n, S.cols)}`;
      nav.style.gridColumn = `1 / span ${S.cols}`; hero.style.gridColumn = S.cols >= 12 ? span(6, 1) : `1 / span ${S.cols}`; img.style.gridColumn = S.cols >= 12 ? `7 / span 6` : `1 / span ${S.cols}`;
      const third = Math.max(1, Math.floor(S.cols / 3)); [c1, c2, c3].forEach((c, i) => { c.style.gridColumn = S.cols >= 8 ? `${1 + i * third} / span ${third}` : `1 / span ${S.cols}`; }); foot.style.gridColumn = `1 / span ${S.cols}`;
      ov.replaceChildren(); ov.style.opacity = S.on ? S.op / 100 : 0; ov.style.padding = `0 ${S.mar}px`; ov.style.gap = S.gut + 'px'; ov.style.gridTemplateColumns = `repeat(${S.cols}, 1fr)`;
      for (let i = 0; i < S.cols; i++) { const c = el('i'); c.append(el('span', null, String(i + 1))); ov.append(c); }
      const colW = (b.w - S.mar * 2 - S.gut * (S.cols - 1)) / S.cols; const gl = el('em', 'gs-gl', `${S.gut}px`); gl.style.left = (S.mar + colW) + 'px'; ov.append(gl); const ml = el('em', 'gs-ml', `${S.mar}px`); ov.append(ml);
      base.hidden = !S.base || !S.on; rx.hidden = ry.hidden = !S.rulers;
      rx.replaceChildren(); for (let x = 0; x <= b.w; x += 50) { const t = el('i', x % 100 ? 's' : ''); t.style.left = (20 + x * scale) + 'px'; if (x % 100 === 0) t.textContent = x; rx.append(t); }
      ry.replaceChildren(); for (let y = 0; y <= frame.scrollHeight; y += 50) { const t = el('i', y % 100 ? 's' : ''); t.style.top = (20 + y * scale) + 'px'; if (y % 100 === 0) t.textContent = y; ry.append(t); }
      bpTag.textContent = `${S.bp} · ${b.w}px · ${S.cols} cols · col ${colW.toFixed(1)}px`;
    }
    frame.addEventListener('pointermove', e => {
      const t = e.target.closest('.gs-b'); if (!t || !S.on) { meas.hidden = true; return; }
      const fr = frame.getBoundingClientRect(), r = t.getBoundingClientRect(), k = BP[S.bp].w / fr.width;
      Object.assign(meas.style, { left: (r.left - fr.left) * k + 'px', top: (r.top - fr.top) * k + 'px', width: r.width * k + 'px', height: r.height * k + 'px' }); meas.hidden = false;
      meas.replaceChildren(el('b', null, `${Math.round(r.width * k)} × ${Math.round(r.height * k)}`), el('span', null, `x ${Math.round((r.left - fr.left) * k)} · y ${Math.round((r.top - fr.top) * k)} · ${Math.round(r.height * k) % 8 === 0 ? 'on' : 'off'} 8px rhythm`));
    });
    frame.addEventListener('pointerleave', () => { meas.hidden = true; });
    // popup controls
    const bps = el('div', 'gs-seg'); Object.keys(BP).forEach(k => { const b = el('button', null, `${k[0].toUpperCase() + k.slice(1)} · ${BP[k].w}`); b.type = 'button'; b.setAttribute('aria-pressed', String(k === S.bp)); b.addEventListener('click', () => { S.bp = k; Object.assign(S, { cols: BP[k].cols, gut: BP[k].gut, mar: BP[k].mar }); bps.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); syncSliders(); layout(); if (G && !reduced) G.from(frame, { opacity: .3, duration: .4 }); H.url(`lumen.app  ·  ${BP[k].w}px`); }); bps.append(b); });
    const sl = {}; const slider = (k, label, min, max, unit) => { const w = el('label', 'gs-sl'), v = el('b'), r = el('input'); r.type = 'range'; r.min = min; r.max = max; r.setAttribute('aria-label', label); r.addEventListener('input', () => { S[k] = +r.value; v.textContent = r.value + unit; layout(); }); w.append(el('span', null, label), r, v); sl[k] = [r, v, unit]; return w; };
    const tg = (k, label) => { const w = el('label', 'gs-tgl'), b = el('button', 'gs-tg'); b.type = 'button'; b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', String(S[k])); b.setAttribute('aria-label', label); b.addEventListener('click', () => { S[k] = !S[k]; b.setAttribute('aria-checked', String(S[k])); layout(); }); w.append(b, el('span', null, label)); return w; };
    pb.append(el('p', 'gs-l', 'Breakpoint'), bps, el('p', 'gs-l', 'Grid'), slider('cols', 'Columns', 2, 16, ''), slider('gut', 'Gutter', 0, 48, 'px'), slider('mar', 'Margin', 0, 96, 'px'), slider('op', 'Opacity', 10, 100, '%'), el('p', 'gs-l', 'Overlays'), tg('on', 'Column grid'), tg('base', '8px baseline'), tg('rulers', 'Pixel rulers'));
    function syncSliders() { Object.entries(sl).forEach(([k, [r, v, u]]) => { r.value = S[k]; v.textContent = S[k] + u; }); }
    window.addEventListener('resize', layout); H.pop.onToggle(o => { if (o) layout(); });
    syncSliders(); layout(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
