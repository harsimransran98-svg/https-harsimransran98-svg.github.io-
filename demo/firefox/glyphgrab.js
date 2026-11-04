/* GlyphGrab — Firefox add-on page with a live browser simulator (Bazozo Studio).
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

/* ---------- add-on simulator ---------- */
  function demo(page, H) {
    const { el, svgEl, G, reduced, toast } = H, pb = H.pop.body, view = page.parentElement;
    const ICONS = {
      home: ['M3 11 12 4l9 7', 'M5 10v10h14V10'], search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z', 'm20 20-4-4'], bell: ['M6 16v-5a6 6 0 1 1 12 0v5l2 2H4Z', 'M10 20a2 2 0 0 0 4 0'],
      user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'], chart: ['M4 20V11', 'M10 20V5', 'M16 20v-7', 'M3 21h18'], calendar: ['M4 6h16v15H4Z', 'M4 10h16', 'M8 3v4M16 3v4'],
      mail: ['M3 6h18v12H3Z', 'm3 7 9 6 9-6'], settings: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1'],
      lock: ['M6 11h12v10H6Z', 'M8 11V8a4 4 0 0 1 8 0v3'], heart: ['M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9Z'], cart: ['M3 4h2l2.4 11h11L21 8H6.2', 'M9 20h.01M18 20h.01'],
      star: ['M12 3l2.8 5.9 6.2.8-4.6 4.3 1.2 6.2L12 17.3l-5.6 2.9 1.2-6.2L3 9.7l6.2-.8Z']
    };
    const NAMES = { '↑': 'UPWARDS ARROW', '↓': 'DOWNWARDS ARROW', '→': 'RIGHTWARDS ARROW', '←': 'LEFTWARDS ARROW', '€': 'EURO SIGN', '£': 'POUND SIGN', '★': 'BLACK STAR', '☆': 'WHITE STAR', '✓': 'CHECK MARK', '⌘': 'PLACE OF INTEREST SIGN', '⇧': 'UPWARDS WHITE ARROW', '©': 'COPYRIGHT SIGN', '™': 'TRADE MARK SIGN', '½': 'VULGAR FRACTION ONE HALF', '°': 'DEGREE SIGN', '•': 'BULLET', '…': 'HORIZONTAL ELLIPSIS', '±': 'PLUS-MINUS SIGN', '≈': 'ALMOST EQUAL TO', '×': 'MULTIPLICATION SIGN', '—': 'EM DASH', '–': 'EN DASH', '·': 'MIDDLE DOT', '⚡': 'HIGH VOLTAGE SIGN', '‘': 'LEFT SINGLE QUOTATION MARK', '’': 'RIGHT SINGLE QUOTATION MARK' };
    const ico = (name, cls) => { const s = svgEl('svg', { viewBox: '0 0 24 24', width: 20, height: 20, fill: name === 'star' ? 'currentColor' : 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-icon': name, 'aria-hidden': 'true' }); if (cls) s.setAttribute('class', cls); ICONS[name].forEach(d => s.append(svgEl('path', { d }))); return s; };
    /* a dashboard full of icons and special characters */
    const app = el('div', 'gg-app'), side = el('nav', 'gg-side'), logo = svgEl('svg', { viewBox: '0 0 32 32', width: 28, height: 28, 'data-icon': 'pulse-logo', 'aria-hidden': 'true' });
    logo.append(svgEl('rect', { width: 32, height: 32, rx: 9, fill: '#6D5BFF' }), svgEl('path', { d: 'M5 17h5l3-7 5 13 3-6h6', fill: 'none', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    const brand = el('div', 'gg-brand'); brand.append(logo, el('b', null, 'Pulse')); side.append(brand);
    [['home', 'Overview'], ['chart', 'Reports'], ['calendar', 'Schedule'], ['mail', 'Inbox'], ['settings', 'Settings']].forEach(([i, t], k) => { const a = el('span', 'gg-nav' + (k === 0 ? ' on' : '')); a.append(ico(i), el('span', null, t)); side.append(a); });
    const main = el('main', 'gg-main'), top = el('div', 'gg-top'), sb = el('div', 'gg-search'); sb.append(ico('search'), el('span', null, 'Search…'), el('kbd', null, '⌘K'));
    top.append(sb, ico('bell', 'gg-ti'), ico('user', 'gg-ti')); main.append(top, el('h1', null, 'Good morning, Sam'), el('p', 'gg-sub', 'Here’s what changed since yesterday · 21° and sunny'));
    const cards = el('div', 'gg-cards');
    [['Revenue', '€ 48,210', '↑ 12.4%', 'up'], ['Churn', '1.8%', '↓ 0.3%', 'up'], ['NPS', '★★★★☆', '4.2 ± 0.1', ''], ['Sync', '✓ Synced', '½ of jobs done', '']].forEach(([a, b, c, d]) => { const k = el('div', 'gg-card'); k.append(el('small', null, a), el('b', null, b), el('span', d, c)); cards.append(k); });
    main.append(cards);
    const list = el('div', 'gg-list'); [['heart', 'Saved reports', '12 items • updated today'], ['lock', 'Permissions', 'Admin × 3 — Editor × 9'], ['cart', 'Orders', '≈ 1,240 this week…'], ['star', 'Favourites', 'Press ⇧ + F to add']].forEach(([i, t, s]) => { const r = el('div', 'gg-row'); r.append(ico(i), el('b', null, t), el('span', null, s), el('em', null, 'View →')); list.append(r); });
    main.append(list, el('p', 'gg-foot', '© 2026 Pulse™ · Made with care · Status: all systems go'));
    app.append(side, main); page.append(app);

    /* scanning */
    let icons = [], glyphs = [], mode = 'icons', pick = null, color = '#7CF29C', size = 24, q = '';
    const ser = new XMLSerializer();
    function scan() {
      const line = el('div', 'gg-scanline'); view.append(line); go.disabled = true; go.textContent = 'Scanning…';
      const done = () => {
        line.remove();
        const map = new Map(); page.querySelectorAll('svg').forEach(s => { const k = s.getAttribute('data-icon') || 'icon'; if (!map.has(k)) map.set(k, { name: k, nodes: [], src: s }); map.get(k).nodes.push(s); }); icons = [...map.values()];
        const gm = new Map(), w = document.createTreeWalker(page, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) for (const ch of n.data) { const cp = ch.codePointAt(0); if (cp > 127 && !/\p{L}|\p{N}/u.test(ch)) gm.set(ch, (gm.get(ch) || 0) + 1); }
        glyphs = [...gm].sort((a, b) => b[1] - a[1]).map(([ch, c]) => ({ ch, c, cp: ch.codePointAt(0) }));
        go.disabled = false; go.textContent = 'Scan again'; H.pop.body.parentElement.querySelector('.cx-pop-s').textContent = `${icons.length} icons · ${glyphs.length} glyphs`;
        H.badge(icons.length + glyphs.length); render(true); toast(`Found ${icons.length} SVG icons and ${glyphs.length} special characters.`);
      };
      if (G && !reduced) G.fromTo(line, { top: 0 }, { top: '100%', duration: 1.1, ease: 'power1.inOut', onComplete: done }); else done();
    }
    const svgText = (it, c = color, sz = size) => { const s = it.src.cloneNode(true); s.removeAttribute('class'); s.removeAttribute('aria-hidden'); s.removeAttribute('data-icon'); s.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); s.setAttribute('width', sz); s.setAttribute('height', sz); if (it.name !== 'pulse-logo') { if (s.getAttribute('stroke')) s.setAttribute('stroke', c); if (s.getAttribute('fill') === 'currentColor') s.setAttribute('fill', c); } return ser.serializeToString(s); };
    const hex = cp => cp.toString(16).toUpperCase().padStart(4, '0');
    const copy = (t, m) => { try { navigator.clipboard.writeText(t).catch(() => {}); } catch (_) {} toast(m); };
    function flash(nodes) { const first = nodes[0]; if (!first) return; const pr = page.getBoundingClientRect(), r = first.getBoundingClientRect(); page.scrollTo({ top: page.scrollTop + r.top - pr.top - page.clientHeight / 3, behavior: reduced ? 'auto' : 'smooth' }); nodes.forEach(n => { n.classList.add('gg-hit'); setTimeout(() => n.classList.remove('gg-hit'), 1800); }); }

    /* popup */
    const go = el('button', 'btn pri gg-go', 'Scan this page'); go.type = 'button'; go.addEventListener('click', scan);
    const seg = el('div', 'gg-seg'), sIn = el('input', 'gg-q'); sIn.type = 'search'; sIn.placeholder = 'Filter…'; sIn.maxLength = 30; sIn.setAttribute('aria-label', 'Filter results'); sIn.addEventListener('input', () => { q = sIn.value.toLowerCase(); render(); });
    const res = el('div', 'gg-res'), det = el('div', 'gg-det');
    pb.append(go, seg, sIn, res, det);
    function render(anim) {
      seg.replaceChildren(); [['icons', `Icons · ${icons.length}`], ['glyphs', `Glyphs · ${glyphs.length}`]].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.setAttribute('aria-pressed', String(mode === k)); b.addEventListener('click', () => { mode = k; pick = null; render(true); }); seg.append(b); });
      res.replaceChildren(); res.className = 'gg-res ' + mode;
      if (!icons.length && !glyphs.length) { res.append(el('p', 'gg-empty', 'Press Scan to find every SVG icon and special character on this page.')); det.replaceChildren(); return; }
      if (mode === 'icons') icons.filter(i => !q || i.name.includes(q)).forEach(i => { const b = el('button', 'gg-tile' + (pick === i ? ' on' : '')); b.type = 'button'; b.setAttribute('aria-label', `${i.name} icon, used ${i.nodes.length} times`); const c = i.src.cloneNode(true); c.removeAttribute('class'); c.setAttribute('width', 22); c.setAttribute('height', 22); b.append(c, el('small', null, i.name)); if (i.nodes.length > 1) b.append(el('em', null, '×' + i.nodes.length)); b.addEventListener('click', () => { pick = i; flash(i.nodes); render(); }); res.append(b); });
      else glyphs.filter(g => !q || (NAMES[g.ch] || '').toLowerCase().includes(q) || g.ch === q).forEach(g => { const r = el('div', 'gg-gl'); const big = el('button', 'gg-ch', g.ch); big.type = 'button'; big.setAttribute('aria-label', `Copy ${NAMES[g.ch] || 'character'}`); big.addEventListener('click', () => copy(g.ch, `Copied ${g.ch}`)); const meta = el('div'); meta.append(el('b', null, NAMES[g.ch] || 'UNICODE CHARACTER'), el('small', null, `U+${hex(g.cp)} · used ${g.c}×`)); const bs = el('div', 'gg-gb'); [['U+', `U+${hex(g.cp)}`], ['&#x;', `&#x${hex(g.cp)};`], ['CSS', `\\${hex(g.cp)}`]].forEach(([t, v]) => { const b = el('button', null, t); b.type = 'button'; b.title = v; b.addEventListener('click', () => copy(v, `Copied ${v}`)); bs.append(b); }); r.append(big, meta, bs); res.append(r); });
      if (anim && G && !reduced) G.from(res.children, { scale: .7, opacity: 0, duration: .35, stagger: .02, ease: 'back.out(2)' });
      renderDet();
    }
    function renderDet() {
      det.replaceChildren(); if (mode !== 'icons' || !pick) return;
      const pv = el('div', 'gg-pv'), holder = el('div', 'gg-ph'); const tmp = new DOMParser().parseFromString(svgText(pick, color, 64), 'image/svg+xml').documentElement; holder.append(document.importNode(tmp, true)); pv.append(holder);
      const info = el('div', 'gg-info'), src = svgText(pick); info.append(el('b', null, pick.name), el('small', null, `viewBox ${pick.src.getAttribute('viewBox')} · ${pick.src.querySelectorAll('path,rect,circle').length} shapes · ${src.length} bytes`));
      const ctl = el('div', 'gg-ctl'), ci = el('input'); ci.type = 'color'; ci.value = color; ci.setAttribute('aria-label', 'Icon colour'); ci.addEventListener('input', () => { color = ci.value; renderDet(); });
      const ss = el('select'); ss.setAttribute('aria-label', 'Export size'); [16, 24, 32, 48].forEach(v => { const o = el('option', null, v + ' px'); o.value = v; o.selected = v === size; ss.append(o); }); ss.addEventListener('change', () => { size = +ss.value; renderDet(); });
      ctl.append(ci, ss); info.append(ctl); pv.append(info); det.append(pv);
      const code = el('pre', 'gg-code'); code.textContent = src; det.append(code);
      const row = el('div', 'gg-btns'), a = el('button', 'btn pri', 'Copy SVG'), b = el('button', 'gg-sb', 'Data URI'), c = el('button', 'gg-sb', 'Download'); a.type = b.type = c.type = 'button';
      a.addEventListener('click', () => copy(src, 'Raw SVG copied.')); b.addEventListener('click', () => copy('data:image/svg+xml,' + encodeURIComponent(src), 'Data URI copied.'));
      c.addEventListener('click', () => { const bl = new Blob([src], { type: 'image/svg+xml' }), u = URL.createObjectURL(bl), l = el('a'); l.href = u; l.download = pick.name + '.svg'; document.body.append(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); toast(`Saved ${pick.name}.svg`); });
      row.append(a, b, c); det.append(row);
    }
    render(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
