/* ColorSnap — Chrome extension page with a live browser simulator (Bazozo Studio).
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
    const { el, G, reduced, toast } = H, pb = H.pop.body;
    // the simulated page is painted on a canvas so every pixel can be sampled
    const W = 1000, Hh = 760, cv = el('canvas', 'cs-cv'); cv.width = W; cv.height = Hh; cv.setAttribute('aria-label', 'Webpage. With ColorSnap open, hover to sample and click to save a colour.');
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    function paint() {
      ctx.fillStyle = '#FFF6EC'; ctx.fillRect(0, 0, W, Hh);
      const g = ctx.createLinearGradient(0, 0, W, 420); g.addColorStop(0, '#FF9A8B'); g.addColorStop(.5, '#FF6A88'); g.addColorStop(1, '#FF99AC'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 420);
      ctx.fillStyle = '#FFD166'; ctx.beginPath(); ctx.arc(780, 160, 110, 0, 7); ctx.fill();
      ctx.fillStyle = '#EF476F'; ctx.beginPath(); ctx.moveTo(0, 420); ctx.quadraticCurveTo(300, 300, 620, 400); ctx.quadraticCurveTo(820, 450, W, 360); ctx.lineTo(W, 420); ctx.fill();
      ctx.fillStyle = '#1A1A2E'; ctx.font = '800 64px Unbounded, sans-serif'; ctx.fillText('SUMMER', 60, 150); ctx.fillText('IN COLOUR', 60, 225);
      ctx.fillStyle = '#fff'; ctx.font = '500 22px Rubik, sans-serif'; ctx.fillText('Linen, ceramics and sun-faded prints.', 64, 275);
      ctx.fillStyle = '#1A1A2E'; ctx.beginPath(); ctx.roundRect(64, 310, 200, 56, 28); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '600 20px Rubik, sans-serif'; ctx.fillText('Shop the drop', 96, 345);
      [['#06D6A0', 'Mint tote'], ['#118AB2', 'Lagoon mug'], ['#FFD166', 'Sun print'], ['#8338EC', 'Iris vase']].forEach(([c, n], i) => {
        const x = 40 + i * 240; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(x, 470, 220, 250, 18); ctx.fill();
        const gg = ctx.createRadialGradient(x + 110, 570, 10, x + 110, 570, 120); gg.addColorStop(0, c); gg.addColorStop(1, '#1A1A2E'); ctx.fillStyle = gg; ctx.beginPath(); ctx.roundRect(x + 14, 484, 192, 170, 12); ctx.fill();
        ctx.fillStyle = '#1A1A2E'; ctx.font = '600 18px Rubik, sans-serif'; ctx.fillText(n, x + 18, 685); ctx.fillStyle = '#8D8D9E'; ctx.font = '16px Rubik, sans-serif'; ctx.fillText('$' + (28 + i * 14), x + 18, 708);
      });
    }
    const wrap = el('div', 'cs-wrap'), loupe = el('canvas', 'cs-loupe'), tag = el('span', 'cs-tag'); loupe.width = loupe.height = 132; loupe.hidden = tag.hidden = true;
    wrap.append(cv, loupe, tag); page.append(wrap);
    const lctx = loupe.getContext('2d'); lctx.imageSmoothingEnabled = false;
    let cur = null, palette = [], fmt = 'css';
    const hex = (r, g, b) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    const hsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [Math.round(h), Math.round(s * 100), Math.round(l * 100)]; };
    const lum = (r, g, b) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
    const contrast = (a, b) => { const x = Math.max(a, b), y = Math.min(a, b); return (x + .05) / (y + .05); };
    function sample(e) {
      const r = cv.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * W), y = Math.floor((e.clientY - r.top) / r.height * Hh);
      if (x < 0 || y < 0 || x >= W || y >= Hh) return null;
      const d = ctx.getImageData(x, y, 1, 1).data; lctx.clearRect(0, 0, 132, 132); lctx.drawImage(cv, x - 5, y - 5, 11, 11, 0, 0, 132, 132);
      lctx.strokeStyle = 'rgba(0,0,0,.15)'; for (let i = 0; i <= 11; i++) { lctx.beginPath(); lctx.moveTo(i * 12, 0); lctx.lineTo(i * 12, 132); lctx.moveTo(0, i * 12); lctx.lineTo(132, i * 12); lctx.stroke(); }
      lctx.strokeStyle = '#fff'; lctx.lineWidth = 2; lctx.strokeRect(60, 60, 12, 12); lctx.lineWidth = 1;
      const wr = wrap.getBoundingClientRect(); loupe.style.left = (e.clientX - wr.left + 18) + 'px'; loupe.style.top = (e.clientY - wr.top + 18) + 'px'; tag.style.left = loupe.style.left; tag.style.top = (e.clientY - wr.top + 156) + 'px';
      return { r: d[0], g: d[1], b: d[2], hex: hex(d[0], d[1], d[2]) };
    }
    cv.addEventListener('pointermove', e => { if (!H.pop.isOpen()) return; const c = sample(e); if (!c) return; cur = c; loupe.hidden = tag.hidden = false; tag.textContent = c.hex; tag.style.background = c.hex; tag.style.color = lum(c.r, c.g, c.b) > .45 ? '#111' : '#fff'; renderCur(); });
    cv.addEventListener('pointerleave', () => { loupe.hidden = tag.hidden = true; });
    cv.addEventListener('click', e => { if (!H.pop.isOpen()) { toast('Open ColorSnap from the toolbar first.'); return; } const c = sample(e); if (!c) return; if (!palette.some(p => p.hex === c.hex)) { palette.push(c); if (palette.length > 10) palette.shift(); } H.badge(palette.length); H.flyToIcon(tag.hidden ? cv : tag, c.hex); renderPal(true); });
    const curBox = el('div', 'cs-cur'), palBox = el('div', 'cs-pal'), exp = el('div', 'cs-exp'); pb.append(curBox, el('p', 'cs-l', 'Palette'), palBox, exp);
    function copyRow(label, val) { const r = el('button', 'cs-row'); r.type = 'button'; r.append(el('span', null, label), el('code', null, val), el('em', null, 'copy')); r.addEventListener('click', () => { try { navigator.clipboard.writeText(val).catch(() => {}); } catch (_) {} toast(`${val} copied`); }); return r; }
    function renderCur() {
      curBox.replaceChildren(); if (!cur) { curBox.append(el('p', 'cs-hint', 'Hover the page to sample. Click to save.')); return; }
      const [h, s, l] = hsl(cur.r, cur.g, cur.b), sw = el('div', 'cs-sw'); sw.style.background = cur.hex;
      curBox.append(sw, copyRow('HEX', cur.hex), copyRow('RGB', `rgb(${cur.r}, ${cur.g}, ${cur.b})`), copyRow('HSL', `hsl(${h}, ${s}%, ${l}%)`));
    }
    function renderPal(anim) {
      palBox.replaceChildren();
      if (!palette.length) palBox.append(el('p', 'cs-hint', 'No colours yet.'));
      palette.forEach((p, i) => { const L = lum(p.r, p.g, p.b), cw = contrast(L, 1), cb = contrast(L, 0); const c = el('div', 'cs-chip'); const s = el('i'); s.style.background = p.hex; const x = el('button', 'cs-x', '×'); x.type = 'button'; x.setAttribute('aria-label', `Remove ${p.hex}`); x.addEventListener('click', () => { palette.splice(i, 1); H.badge(palette.length); renderPal(); }); c.append(s, el('code', null, p.hex), el('small', null, `${(cw > cb ? cw : cb).toFixed(1)}:1 on ${cw > cb ? 'white' : 'black'}${Math.max(cw, cb) >= 4.5 ? ' ✓AA' : ''}`), x); palBox.append(c); });
      if (anim && G && !reduced && palBox.lastChild) G.from(palBox.lastChild, { scale: .6, opacity: 0, duration: .4, ease: 'back.out(2.5)' });
      exp.replaceChildren(); if (!palette.length) return;
      const seg = el('div', 'cs-seg'); [['css', 'CSS vars'], ['tw', 'Tailwind'], ['json', 'JSON']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.setAttribute('aria-pressed', String(fmt === k)); b.addEventListener('click', () => { fmt = k; renderPal(); }); seg.append(b); });
      const code = fmt === 'css' ? `:root {\n${palette.map((p, i) => `  --snap-${i + 1}: ${p.hex};`).join('\n')}\n}` : fmt === 'tw' ? `colors: {\n  snap: {\n${palette.map((p, i) => `    ${(i + 1) * 100}: '${p.hex}',`).join('\n')}\n  }\n}` : JSON.stringify(palette.map(p => ({ hex: p.hex, rgb: [p.r, p.g, p.b] })), null, 1);
      const pre = el('pre', 'cs-code'); pre.textContent = code;
      const cp = el('button', 'btn pri cs-copy', 'Copy palette'); cp.type = 'button'; cp.addEventListener('click', () => { try { navigator.clipboard.writeText(code).catch(() => {}); } catch (_) {} toast('Palette copied.'); });
      exp.append(el('p', 'cs-l', 'Export'), seg, pre, cp);
    }
    H.pop.onToggle(o => { cv.classList.toggle('picking', o); if (!o) loupe.hidden = tag.hidden = true; });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(paint); paint(); renderCur(); renderPal(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
