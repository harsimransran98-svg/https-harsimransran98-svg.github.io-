/* ReaderTone — Firefox add-on page with a live browser simulator (Bazozo Studio, generated).
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
  const BTN = 2;
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


/* ---------- pagetune simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"site":{"name":"The Long Read","nav":["Essays","Science","Culture","Subscribe"],"kick":"Science · 9 min read","h1":"Why we read slower on screens","dek":"It is not the words. It is the glare, the line length and the contrast, and all three can be fixed.","by":"By Mira Okafor · Illustrations by Theo Lund","blocks":[["p","Hand someone a printed page and a bright monitor showing the same essay, and they will usually finish the paper first. For years this was blamed on the screen itself, as if pixels were simply harder to read than ink."],["p","The research tells a more useful story. Most of the gap comes from three settings we rarely touch: how bright the background is, how sharp the text is against it, and how far the eye has to travel from one line to the next."],["q","Comfort is not one setting. It is the balance between light, contrast and rhythm."],["h2","Glare tires the eye before the words do"],["p","A pure white page at night is the brightest thing in the room. The pupil narrows, focus works harder, and after twenty minutes readers report the same heavy-eyed feeling, even when they find the essay gripping."],["fig","Fig. 1: Reading speed fell 14% on bright white backgrounds after 20 minutes."],["h2","Too much contrast is a problem too"],["p","Jet black on bright white looks crisp, but it shimmers at the edges of letters. A slightly softer ink on a slightly warmer page is easier to hold for long periods, as long as it stays above readable contrast."],["h2","Long lines lose your place"],["p","Typographers settled on roughly sixty to seventy-five characters per line long before screens existed. Wider than that, and the eye loses its place on the way back to the start of the next line."],["p","None of these fixes needs a new device. They need a page that adapts to the person reading it."]]},"defaults":{"on":false,"warm":0.15,"contrast":0.8,"night":0,"size":17,"measure":68},"original":{"on":false,"warm":0,"contrast":1,"night":0,"size":16,"measure":96},"controls":[{"type":"switch","key":"on","label":"ReaderTone on this site","sub":"thelongread.example","onMsg":"ReaderTone is on","offMsg":"Showing the original page"},{"type":"pad","label":"Tone","keys":["warm","contrast"],"x":["Cool","Warm","Warmth"],"y":["Soft","Crisp","Contrast"],"grad":"linear-gradient(0deg, rgba(255,255,255,.55), rgba(255,255,255,0)), linear-gradient(90deg, #EAF1FB, #FFFFFF 35%, #F6E7C8 70%, #EFCB95)"},{"type":"presets","label":"Presets","items":[{"name":"Daylight","sw":["#FFFFFF","#1A1A1A"],"set":{"warm":0.15,"contrast":0.8,"night":0}},{"name":"Paper","sw":["#F7EAD0","#3B2A18"],"set":{"warm":0.55,"contrast":0.62,"night":0}},{"name":"Dusk","sw":["#EBCB98","#3A2610"],"set":{"warm":0.95,"contrast":0.5,"night":0}},{"name":"Night","sw":["#1E1812","#E9D3AE"],"set":{"warm":0.6,"contrast":0.55,"night":1}}]},{"type":"contrast","label":"Text contrast"},{"type":"slider","key":"size","label":"Text size","min":14,"max":24,"step":1,"fmt":"#px"},{"type":"slider","key":"measure","label":"Line width","min":44,"max":96,"step":2,"fmt":"# ch"},{"type":"actions"},{"type":"sites","label":"Remembered sites"}],"key":"rt_tone_v2","siteHost":"thelongread.example","sites":[{"h":"docs.example","c":"#FFFFFF"},{"h":"newsdaily.example","c":"#1E1A16"}]};
    const paint = function paint(s, mix) {
      const dayBg = mix('#FFFFFF', '#F1D9AE', s.warm), nightBg = mix('#15171B', '#1E1710', s.warm);
      const dayInk = mix(mix('#9A9A9A', '#0E0E0E', s.contrast), '#3A2410', s.warm * .55);
      const nightInk = mix(mix('#6E6E6E', '#F4F4F4', s.contrast), '#F0CF98', s.warm * .5);
      const bg = mix(dayBg, nightBg, s.night), ink = mix(dayInk, nightInk, s.night);
      return {
        'pg-bg': bg, 'pg-ink': ink, 'pg-dim': mix(ink, bg, .38), 'pg-accent': mix(mix('#1F5FBF', '#B4501C', s.warm), '#F2A65A', s.night),
        'pg-fig': `linear-gradient(135deg, ${mix(bg, ink, .1)}, ${mix(bg, '#C2551F', .28)})`,
        'pg-size': s.size + 'px', 'pg-measure': s.measure + 'ch', 'pg-lead': (1.5 + (s.size - 14) * .012 + (s.on === false ? 0 : .1)).toFixed(2),
        'pg-font': s.on === false ? "Arial, Helvetica, sans-serif" : "'Newsreader', Georgia, serif",
        'pg-head': s.on === false ? "Arial, Helvetica, sans-serif" : "'Newsreader', Georgia, serif",
      };
    };
    const hex = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, '0')).join('');
    const lum = h => { const c = hex(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    const saved = store.get(M.key, null);
    const S = Object.assign({}, M.defaults, saved && typeof saved === 'object' ? saved : {});
    Object.keys(S).forEach(k => { if (!(k in M.defaults)) delete S[k]; else if (typeof M.defaults[k] !== typeof S[k]) S[k] = M.defaults[k]; });
    const save = () => store.set(M.key, S);
    const hooks = [];

    /* ---- the sample page (built twice: tuned + untouched original for compare) ---- */
    function build() {
      const root = el('div'), top = el('header', 'pt-top');
      top.append(el('b', null, M.site.name)); M.site.nav.forEach(n => top.append(el('span', null, n)));
      const art = el('article', 'pt-art');
      art.append(el('p', 'pt-kick', M.site.kick), el('h1', null, M.site.h1), el('p', 'pt-dek', M.site.dek), el('p', 'pt-by', M.site.by));
      M.site.blocks.forEach(([k, t]) => {
        if (k === 'h2') art.append(el('h2', null, t));
        else if (k === 'q') art.append(el('blockquote', null, t));
        else if (k === 'fig') { const f = el('figure', 'pt-fig'); f.append(el('i'), el('figcaption', null, t)); art.append(f); }
        else art.append(el('p', null, t));
      });
      root.append(top, art); return root;
    }
    const stage = el('div', 'pt-stage'), A = build(), B = build();
    A.className = 'pt-a'; B.className = 'pt-b'; B.setAttribute('aria-hidden', 'true'); B.hidden = true;
    stage.append(A, B); page.append(stage);
    const setVars = (node, vars) => Object.entries(vars).forEach(([k, v]) => node.style.setProperty('--' + k, String(v)));
    setVars(B, paint(M.original, mix));
    let last = {};
    function apply() {
      last = paint(S.on === false ? M.original : S, mix);
      setVars(A, last);
      H.badge(S.on === false ? '' : '✓');
      hooks.forEach(f => f());
    }

    /* ---- compare handle ---- */
    const view = page.parentElement, split = el('div', 'pt-split'); split.hidden = true;
    const knob = el('button', null, '⇆'); knob.type = 'button'; knob.setAttribute('aria-label', 'Drag to compare before and after');
    split.append(el('em', null, 'Before'), knob, el('em', null, 'After')); view.append(split);
    let sp = 50;
    const setSplit = v => { sp = Math.max(4, Math.min(96, v)); split.style.setProperty('--split', sp + '%'); B.style.setProperty('--split', sp + '%'); };
    setSplit(50);
    knob.addEventListener('pointerdown', e => { knob.setPointerCapture(e.pointerId); const mv = ev => { const r = view.getBoundingClientRect(); setSplit((ev.clientX - r.left) / r.width * 100); }; const up = () => { knob.removeEventListener('pointermove', mv); knob.removeEventListener('pointerup', up); }; knob.addEventListener('pointermove', mv); knob.addEventListener('pointerup', up); });
    knob.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') setSplit(sp - 4); if (e.key === 'ArrowRight') setSplit(sp + 4); });
    let comparing = false;
    function compare(on) {
      comparing = on; B.hidden = !on; split.hidden = !on; hooks.forEach(f => f());
      if (on && G && !reduced) { setSplit(92); G.to({ v: 92 }, { v: 50, duration: 1.1, ease: 'expo.out', onUpdate() { setSplit(this.targets()[0].v); } }); }
    }

    /* ---- popup controls (built from the spec) ---- */
    const wrap = el('div', 'pc'), gated = [];
    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    /* the page starts as the site's own light look; touching any control switches the add-on on */
    const wake = () => { if (S.on === false) { S.on = true; toast(M.wakeMsg || 'Turned on for this site'); } };
    function tweenTo(vals) {
      if (!('on' in vals)) wake();
      const num = {}, now = {};
      Object.entries(vals).forEach(([k, v]) => { if (typeof v === 'number' && typeof S[k] === 'number') { num[k] = v; now[k] = S[k]; } else S[k] = v; });
      if (G && !reduced && Object.keys(num).length) G.to(now, { ...num, duration: .7, ease: 'power3.out', onUpdate: () => { Object.assign(S, now); apply(); }, onComplete: save });
      else { Object.assign(S, num); apply(); save(); }
    }
    M.controls.forEach(c => {
      const box = el('div');
      if (c.type === 'switch') {
        const b = el('button', 'pc-sw'); b.type = 'button'; b.setAttribute('role', 'switch');
        const t = el('span'); t.append(el('b', null, c.label), el('small', null, c.sub)); b.append(t, el('i'));
        const sync = () => b.setAttribute('aria-checked', String(S[c.key] !== false));
        b.addEventListener('click', () => { S[c.key] = S[c.key] === false; save(); apply(); toast(S[c.key] ? c.onMsg : c.offMsg); H.tone(S[c.key] ? 660 : 440, .08); });
        hooks.push(sync); sync(); box.append(b); wrap.append(box); return;
      }
      gated.push(box);
      if (c.type === 'pad') {
        const out = el('output'); box.append(label(c.label, out));
        const pad = el('div', 'pc-pad'); pad.style.background = c.grad;
        const gx = el('i', 'gx'), gy = el('i', 'gy'), puck = el('span', 'pc-puck');
        puck.tabIndex = 0; puck.setAttribute('role', 'slider'); puck.setAttribute('aria-label', c.x[2] + ' and ' + c.y[2] + ' (arrow keys)');
        pad.append(gx, gy, el('span', 'ax l', c.x[0]), el('span', 'ax r', c.x[1]), el('span', 'ax t', c.y[1]), puck);
        const [kx, ky] = c.keys;
        const sync = () => { const x = S[kx] * 100, y = (1 - S[ky]) * 100; puck.style.left = x + '%'; puck.style.top = y + '%'; gx.style.left = x + '%'; gy.style.top = y + '%'; puck.style.background = last['pg-bg'] || '#fff';
          const t = c.x[2] + ' ' + Math.round(S[kx] * 100) + '% · ' + c.y[2] + ' ' + Math.round(S[ky] * 100) + '%'; out.textContent = Math.round(S[kx] * 100) + ' / ' + Math.round(S[ky] * 100); puck.setAttribute('aria-valuetext', t); puck.setAttribute('aria-valuenow', String(Math.round(S[kx] * 100))); };
        const set = e => { wake(); const r = pad.getBoundingClientRect(); S[kx] = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); S[ky] = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height)); apply(); };
        pad.addEventListener('pointerdown', e => { pad.setPointerCapture(e.pointerId); set(e); const mv = ev => set(ev); const up = () => { pad.removeEventListener('pointermove', mv); pad.removeEventListener('pointerup', up); save(); H.tone(520, .05); }; pad.addEventListener('pointermove', mv); pad.addEventListener('pointerup', up); });
        puck.addEventListener('keydown', e => { const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (!d) return; e.preventDefault(); S[kx] = Math.max(0, Math.min(1, S[kx] + d[0] * .05)); S[ky] = Math.max(0, Math.min(1, S[ky] + d[1] * .05)); apply(); save(); });
        hooks.push(sync); box.append(pad);
      } else if (c.type === 'presets') {
        box.append(label(c.label)); const g = el('div', 'pc-pre'); g.style.setProperty('--n', c.items.length);
        c.items.forEach(p => {
          const b = el('button'); b.type = 'button'; const i = el('i'); i.style.setProperty('--a', p.sw[0]); i.style.setProperty('--b', p.sw[1]); b.append(i, el('span', null, p.name));
          b.addEventListener('click', () => { tweenTo(p.set); toast(p.name + ' applied'); H.tone(587, .08); if (G && !reduced) G.fromTo(i, { rotate: -20, scale: .7 }, { rotate: 0, scale: 1, duration: .6, ease: 'back.out(2.4)' }); });
          hooks.push(() => b.setAttribute('aria-pressed', String(Object.entries(p.set).every(([k, v]) => typeof v === 'number' ? Math.abs(S[k] - v) < .02 : S[k] === v)))); g.append(b);
        }); box.append(g);
      } else if (c.type === 'slider') {
        const out = el('output'), r = el('input', 'pc-rng'); r.type = 'range'; r.min = c.min; r.max = c.max; r.step = c.step; r.setAttribute('aria-label', c.label);
        box.append(label(c.label, out), r);
        const sync = () => { r.value = S[c.key]; out.textContent = (c.fmt ? c.fmt.replace('#', Math.round(S[c.key] * (c.mul || 1))) : S[c.key]); r.style.setProperty('--p', ((S[c.key] - c.min) / (c.max - c.min) * 100) + '%'); };
        r.addEventListener('input', () => { wake(); S[c.key] = +r.value; apply(); }); r.addEventListener('change', save); hooks.push(sync);
      } else if (c.type === 'seg') {
        box.append(label(c.label)); const g = el('div', 'pc-seg');
        c.options.forEach(([v, t]) => { const b = el('button', null, t); b.type = 'button'; b.addEventListener('click', () => { tweenTo({ [c.key]: v }); H.tone(494, .05); }); hooks.push(() => b.setAttribute('aria-pressed', String(S[c.key] === v))); g.append(b); });
        box.append(g);
      } else if (c.type === 'contrast') {
        const d = el('div', 'pc-cr'), v = el('b'), badge = el('span'); d.append(el('small', null, c.label), v, badge); box.append(d);
        hooks.push(() => { const r = ratio(last['pg-bg'], last['pg-ink']); v.textContent = r.toFixed(1) + ':1'; badge.textContent = r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : 'LOW'; badge.className = r >= 4.5 ? '' : 'lo'; });
      } else if (c.type === 'actions') {
        const row = el('div', 'pc-row');
        const cmp = el('button', null, 'Compare'); cmp.type = 'button'; cmp.addEventListener('click', () => { compare(!comparing); if (comparing) toast('Drag the handle on the page'); });
        hooks.push(() => cmp.setAttribute('aria-pressed', String(comparing)));
        const rs = el('button', null, 'Reset'); rs.type = 'button'; rs.addEventListener('click', () => { tweenTo(M.defaults); toast('Back to defaults'); });
        row.append(cmp, rs); box.append(row);
      } else if (c.type === 'sites') {
        box.append(label(c.label)); const g = el('div', 'pc-sites'); box.append(g);
        hooks.push(() => { g.textContent = ''; [{ h: M.siteHost, c: last['pg-bg'] }].concat(M.sites).forEach(x => { const t = el('span'); const i = el('i'); i.style.setProperty('--c', x.c); t.append(i, document.createTextNode(x.h)); g.append(t); }); });
      }
      wrap.append(box);
    });
    pb.append(wrap);
    apply();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
