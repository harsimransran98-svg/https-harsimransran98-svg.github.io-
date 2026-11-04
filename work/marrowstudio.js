/* Marrow Studio — live demo build (Bazozo Studio) */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  $('#year').textContent = new Date().getFullYear();

  function svgEl(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.append(n);
    return n;
  }

  /* ---------- nav: dual-blade menu ---------- */
  const nav = $('#nav'), btn = $('#menuBtn'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      menu.hidden = false; void menu.offsetWidth; menu.classList.add('open');
      if (hasGsap && !reduced) gsap.fromTo('.slash-menu > a', { xPercent: -30, opacity: 0, skewX: 12 }, { xPercent: 0, opacity: 1, skewX: 0, duration: .7, stagger: .06, ease: 'expo.out', delay: .2 });
    } else {
      menu.classList.remove('open');
      setTimeout(() => { if (!menu.classList.contains('open')) menu.hidden = true; }, 700);
    }
  }
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });

  /* ---------- liquid ink buttons: fill spreads from the entry point ---------- */
  document.addEventListener('pointerover', e => {
    const b = e.target.closest('.ink'); if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--x', ((e.clientX - r.left) / r.width * 100) + '%');
    b.style.setProperty('--y', ((e.clientY - r.top) / r.height * 100) + '%');
  });
  document.addEventListener('pointerout', e => {
    const b = e.target.closest('.ink'); if (!b || b.contains(e.relatedTarget)) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty('--x', ((e.clientX - r.left) / r.width * 100) + '%');
    b.style.setProperty('--y', ((e.clientY - r.top) / r.height * 100) + '%');
  });

  /* ---------- flash designs (hand-built SVG line art, 100×100) ---------- */
  const star = (cx, cy, R, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1); } return d + 'Z'; };
  const rays = (n, r1, r2) => Array.from({ length: n }, (_, i) => { const a = Math.PI + (i + .5) * Math.PI / n; return ['path', 'o', { d: `M${(50 + r1 * Math.cos(a)).toFixed(1)} ${(50 + r1 * Math.sin(a)).toFixed(1)} L${(50 + r2 * Math.cos(a)).toFixed(1)} ${(50 + r2 * Math.sin(a)).toFixed(1)}` }]; });
  const DESIGNS = [
    { name: 'Heart Dagger', style: 'trad', size: 12, used: 1, art: [
      ['path', 'r', { d: 'M50 88 C34 76 22 66 22 52 C22 43 29 38 36 38 C42 38 47 42 50 47 C53 42 58 38 64 38 C71 38 78 43 78 52 C78 66 66 76 50 88 Z' }],
      ['path', 'o', { d: 'M50 4 L56 30 L50 76 L44 30 Z', fill: '#EFE9DD' }], ['path', 'o', { d: 'M50 8 L50 70' }],
      ['path', 'k', { d: 'M36 30 Q50 25 64 30 Q50 35 36 30 Z' }], ['circle', 'o', { cx: 50, cy: 4, r: 3 }] ] },
    { name: 'Full Rose', style: 'neo', size: 10, used: 2, art: [
      ['path', 'k', { d: 'M50 74 C38 70 26 76 22 86 C34 88 44 84 50 74 Z' }], ['path', 'k', { d: 'M52 80 C62 74 74 78 78 88 C66 90 58 88 52 80 Z' }],
      ['path', 'o', { d: 'M50 70 C49 80 51 88 50 96' }],
      ['path', 'r', { d: 'M50 22 C26 20 18 44 30 58 C40 70 60 70 70 58 C82 44 74 20 50 22 Z' }],
      ['path', 'o', { d: 'M50 34 C40 34 37 46 44 51 C51 56 59 47 53 42 C49 39 45 44 49 47' }],
      ['path', 'o', { d: 'M30 42 C38 40 42 48 40 58' }], ['path', 'o', { d: 'M70 42 C62 40 58 48 60 58' }] ] },
    { name: 'Homeward Swallow', style: 'trad', size: 9, used: 0, art: [
      ['path', 'k', { d: 'M12 40 C30 34 42 40 50 48 C58 36 72 28 90 28 C78 38 72 46 68 54 C60 60 52 62 46 62 C34 62 22 56 12 40 Z' }],
      ['path', 'r', { d: 'M46 62 C40 70 36 78 34 88 L44 78 L48 90 L52 72 C52 68 50 64 46 62 Z' }],
      ['path', 'r', { d: 'M40 52 C46 56 54 56 60 52 C56 58 50 60 44 58 Z' }], ['circle', 'o', { cx: 80, cy: 32, r: 1.6, fill: '#EFE9DD', stroke: 'none' }] ] },
    { name: 'Coiled Serpent', style: 'black', size: 14, used: 1, art: [
      ['path', 'o', { d: 'M30 92 C8 82 18 60 40 62 C62 64 74 48 60 36 C48 26 30 32 34 22', 'stroke-width': 10, stroke: '#151313' }],
      ['path', 'o', { d: 'M30 92 C8 82 18 60 40 62 C62 64 74 48 60 36 C48 26 30 32 34 22', 'stroke-width': 5, stroke: '#D92B2B' }],
      ['path', 'k', { d: 'M24 14 C32 4 46 10 42 20 C38 28 26 26 24 14 Z' }], ['path', 'o', { d: 'M24 14 L14 10 M24 14 L15 18', stroke: '#D92B2B', 'stroke-width': 2 }],
      ['circle', 'o', { cx: 34, cy: 15, r: 1.8, fill: '#EFE9DD', stroke: 'none' }] ] },
    { name: 'All-Seeing Eye', style: 'black', size: 8, used: 3, art: [
      ...rays(9, 34, 46),
      ['path', 'o', { d: 'M12 50 Q50 16 88 50 Q50 84 12 50 Z' }], ['circle', 'r', { cx: 50, cy: 50, r: 15 }], ['circle', 'k', { cx: 50, cy: 50, r: 6.5 }],
      ['circle', 'o', { cx: 46, cy: 46, r: 1.6, fill: '#EFE9DD', stroke: 'none' }] ] },
    { name: 'Night Moth', style: 'fine', size: 11, used: 0, art: [
      ['path', 'r', { d: 'M50 40 C34 20 10 24 12 44 C14 58 34 58 48 50 Z' }], ['path', 'r', { d: 'M50 40 C66 20 90 24 88 44 C86 58 66 58 52 50 Z' }],
      ['path', 'o', { d: 'M48 54 C36 62 30 76 40 80 C46 80 48 68 50 60 Z' }], ['path', 'o', { d: 'M52 54 C64 62 70 76 60 80 C54 80 52 68 50 60 Z' }],
      ['circle', 'o', { cx: 28, cy: 42, r: 5 }], ['circle', 'o', { cx: 72, cy: 42, r: 5 }],
      ['ellipse', 'k', { cx: 50, cy: 54, rx: 3.6, ry: 17 }], ['path', 'o', { d: 'M48 38 C44 28 40 24 34 20 M52 38 C56 28 60 24 66 20' }] ] },
    { name: 'Sailor Anchor', style: 'trad', size: 10, used: 2, art: [
      ['circle', 'o', { cx: 50, cy: 14, r: 6 }], ['path', 'o', { d: 'M50 20 V86 M34 30 H66' }],
      ['path', 'o', { d: 'M18 62 C22 80 40 88 50 88 C60 88 78 80 82 62' }],
      ['path', 'r', { d: 'M18 62 L12 72 L25 70 Z' }], ['path', 'r', { d: 'M82 62 L88 72 L75 70 Z' }],
      ['path', 'o', { d: 'M44 14 C28 28 72 38 52 54 C34 68 66 74 56 86', stroke: '#D92B2B', 'stroke-width': 3 }] ] },
    { name: 'Sacred Heart', style: 'neo', size: 12, used: 1, art: [
      ['path', 'o', { d: 'M50 30 C44 22 52 14 46 4 C58 10 60 20 55 30', stroke: '#D92B2B', 'stroke-width': 3 }],
      ['path', 'r', { d: 'M50 90 C30 74 14 62 14 46 C14 34 24 28 32 28 C40 28 46 32 50 38 C54 32 60 28 68 28 C76 28 86 34 86 46 C86 62 70 74 50 90 Z' }],
      ['path', 'o', { d: 'M24 52 Q50 62 76 52' }], ['path', 'o', { d: 'M40 31 Q50 36 60 31' }], ['path', 'o', { d: 'M50 46 V70 M42 54 H58' }] ] },
    { name: 'Crescent & Star', style: 'fine', size: 7, used: 0, art: [
      ['path', 'r', { d: 'M60 12 C36 14 22 36 26 58 C30 80 52 92 74 84 C54 82 40 66 40 48 C40 32 48 20 60 12 Z' }],
      ['path', 'o', { d: star(70, 42, 12, 5) }], ['circle', 'k', { cx: 82, cy: 70, r: 2 }], ['circle', 'k', { cx: 58, cy: 26, r: 1.5 }] ] }
  ];
  const STYLES = {
    fine: { label: 'Fine line', rate: 140, f: .75, artist: 'Vera Lind', info: 'Single needle, delicate detail' },
    black: { label: 'Blackwork', rate: 160, f: 1.1, artist: 'Okan Ruiz', info: 'Solid black, bold shapes' },
    neo: { label: 'Neo-trad', rate: 170, f: 1.0, artist: 'Mia Sato', info: 'Bold lines, rich colour' },
    real: { label: 'Realism', rate: 190, f: 1.4, artist: 'Dev Arora', info: 'Soft shading, slowest to build' },
    trad: { label: 'Traditional', rate: 150, f: .9, artist: 'Theo Brandt', info: 'Classic flash, quick to tattoo' },
    letter: { label: 'Lettering', rate: 130, f: .6, artist: 'June Okafor', info: 'Script and type' }
  };

  function drawArt(parent, art) {
    const s = svgEl('svg', { viewBox: '0 0 100 100', 'aria-hidden': 'true' }, parent);
    // paint overrides (stroke/fill) go in style so they win over the class defaults
    art.forEach(([tag, cls, attrs]) => {
      const geo = {}, style = [];
      for (const k in attrs) (['stroke', 'stroke-width', 'fill'].includes(k) ? style.push(`${k}:${attrs[k]}`) : geo[k] = attrs[k]);
      const n = svgEl(tag, Object.assign({ class: cls }, geo), s);
      if (style.length) n.setAttribute('style', style.join(';'));
    });
    return s;
  }

  const grid = $('#sheetGrid');
  const designBtns = DESIGNS.map((d, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'design';
    b.setAttribute('aria-label', `${d.name}, ${STYLES[d.style].label}`);
    drawArt(b, d.art);
    const l = document.createElement('span'); l.className = 'lbl'; l.textContent = String(i + 1).padStart(2, '0');
    b.append(l);
    b.addEventListener('click', () => selectDesign(i));
    grid.append(b);
    return b;
  });

  let selected = 0;
  const fromPrice = d => quote(d.size, 'forearm', d.style, 1).low;
  function selectDesign(i) {
    selected = i;
    const d = DESIGNS[i];
    designBtns.forEach((b, j) => b.classList.toggle('sel', j === i));
    const big = $('#detailArt'); big.replaceChildren(); drawArt(big, d.art);
    $('#detailNo').textContent = 'No. ' + String(i + 1).padStart(2, '0');
    $('#detailName').textContent = d.name;
    $('#dStyle').textContent = STYLES[d.style].label;
    $('#dSize').textContent = `${d.size} cm`;
    $('#dPrice').textContent = '$' + fromPrice(d);
    $('#dUsed').textContent = `${d.used} of 3`;
    if (hasGsap && !reduced) gsap.from(big.firstChild, { scale: .8, rotate: -6, opacity: 0, duration: .5, ease: 'back.out(2)' });
    refreshLens();
  }
  $('#useDesign').addEventListener('click', () => {
    const d = DESIGNS[selected];
    state.style = d.style; state.size = d.size;
    syncControls(); update();
    document.getElementById('calculator').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });

  /* magnifying lens: a scaled clone of the sheet follows the cursor */
  const sheet = $('#sheet'), lens = $('#lens'), ZOOM = 2.3;
  let zoomEl = null;
  function refreshLens() {
    if (!fine) return;
    zoomEl = document.createElement('div');
    zoomEl.className = 'zoom';
    const cs = getComputedStyle(sheet);
    Object.assign(zoomEl.style, { width: sheet.clientWidth + 'px', height: sheet.clientHeight + 'px', padding: cs.padding, background: cs.backgroundColor, backgroundImage: cs.backgroundImage, backgroundSize: cs.backgroundSize });
    const clone = grid.cloneNode(true); clone.removeAttribute('id');
    clone.querySelectorAll('[aria-label]').forEach(n => n.removeAttribute('aria-label'));
    zoomEl.append(clone);
    lens.replaceChildren(zoomEl);
  }
  if (fine) {
    sheet.addEventListener('pointermove', e => {
      const r = sheet.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      lens.style.left = x + 'px'; lens.style.top = y + 'px';
      if (zoomEl) zoomEl.style.transform = `translate(${100 - x * ZOOM}px, ${100 - y * ZOOM}px) scale(${ZOOM})`;
      lens.classList.add('on');
    });
    sheet.addEventListener('pointerleave', () => lens.classList.remove('on'));
    window.addEventListener('resize', refreshLens);
  }

  /* ---------- placement & price calculator ---------- */
  const ZONES = {
    forearm: { label: 'Forearm', f: 1.0, max: 30, info: 'Low pain · flat canvas' },
    upperarm: { label: 'Upper arm', f: 1.0, max: 30, info: 'Low pain · wraps well' },
    hand: { label: 'Hand', f: 1.45, max: 12, info: 'High pain · fades faster' },
    neck: { label: 'Neck', f: 1.35, max: 14, info: 'High pain · thin skin' },
    chest: { label: 'Chest', f: 1.15, max: 35, info: 'Medium pain · sternum is sharp' },
    ribs: { label: 'Ribs', f: 1.4, max: 35, info: 'High pain · skin stretches' },
    stomach: { label: 'Stomach', f: 1.2, max: 30, info: 'Medium pain · stretchy skin' },
    back: { label: 'Back', f: 1.05, max: 40, info: 'Medium pain · biggest flat canvas' },
    thigh: { label: 'Thigh', f: 1.0, max: 35, info: 'Low pain · lots of room' },
    calf: { label: 'Calf', f: 1.05, max: 30, info: 'Low–medium pain' }
  };
  const state = { zone: 'forearm', size: 10, style: 'fine', ink: 1, view: 'front' };

  function quote(size, zone, style, ink) {
    const S = STYLES[style], Z = ZONES[zone];
    const hours = Math.max(1, Math.round(0.055 * Math.pow(size, 1.6) * Z.f * S.f * ink * 2) / 2);
    const price = hours * S.rate;
    const low = Math.max(120, Math.round(price * .9 / 10) * 10);
    const high = Math.max(low + 30, Math.round(price * 1.15 / 10) * 10);
    const sessions = Math.ceil(hours / 4.5);
    return { hours, low, high, sessions, deposit: Math.max(80, Math.round(low * .2 / 10) * 10), artist: S.artist };
  }

  /* body map */
  const body = $('#body');
  const LIMBS = [
    ['upperarm', 'rect', { x: 36, y: 78, width: 22, height: 62, rx: 10 }], ['upperarm', 'rect', { x: 142, y: 78, width: 22, height: 62, rx: 10 }],
    ['forearm', 'rect', { x: 30, y: 142, width: 22, height: 62, rx: 10 }], ['forearm', 'rect', { x: 148, y: 142, width: 22, height: 62, rx: 10 }],
    ['hand', 'circle', { cx: 40, cy: 216, r: 11 }], ['hand', 'circle', { cx: 160, cy: 216, r: 11 }],
    ['thigh', 'rect', { x: 68, y: 182, width: 30, height: 92, rx: 12 }], ['thigh', 'rect', { x: 102, y: 182, width: 30, height: 92, rx: 12 }],
    ['calf', 'rect', { x: 71, y: 278, width: 24, height: 96, rx: 11 }], ['calf', 'rect', { x: 105, y: 278, width: 24, height: 96, rx: 11 }],
    ['neck', 'rect', { x: 89, y: 54, width: 22, height: 18, rx: 4 }]
  ];
  const FRONT = [['chest', 'rect', { x: 62, y: 74, width: 76, height: 48, rx: 14 }], ['ribs', 'rect', { x: 60, y: 124, width: 18, height: 54, rx: 6 }], ['ribs', 'rect', { x: 122, y: 124, width: 18, height: 54, rx: 6 }], ['stomach', 'rect', { x: 80, y: 124, width: 40, height: 54, rx: 6 }]];
  const BACK = [['back', 'rect', { x: 60, y: 74, width: 80, height: 104, rx: 16 }]];
  function drawBody() {
    body.replaceChildren();
    svgEl('circle', { cx: 100, cy: 30, r: 22, fill: '#1C1A1A', stroke: 'rgba(242,239,233,.32)' }, body);
    [...(state.view === 'front' ? FRONT : BACK), ...LIMBS].forEach(([zone, tag, attrs]) => {
      const n = svgEl(tag, Object.assign({ class: 'zone', 'data-zone': zone, tabindex: '0', role: 'button', 'aria-label': ZONES[zone].label }, attrs), body);
      n.addEventListener('click', () => setZone(zone));
      n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setZone(zone); } });
    });
    paintBody();
  }
  function paintBody() { body.querySelectorAll('.zone').forEach(z => z.classList.toggle('on', z.dataset.zone === state.zone)); }
  $$('.view-toggle button').forEach(b => b.addEventListener('click', () => {
    state.view = b.dataset.view;
    $$('.view-toggle button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    if (state.view === 'back' && ['chest', 'ribs', 'stomach'].includes(state.zone)) state.zone = 'back';
    if (state.view === 'front' && state.zone === 'back') state.zone = 'chest';
    drawBody(); syncControls(); update();
  }));

  /* option buttons */
  const zoneOpts = $('#zoneOpts'), styleOpts = $('#styleOpts'), sizeIn = $('#size');
  Object.entries(ZONES).forEach(([id, z]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.dataset.zone = id; b.textContent = z.label;
    b.addEventListener('click', () => setZone(id)); zoneOpts.append(b);
  });
  Object.entries(STYLES).forEach(([id, s]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.dataset.style = id; b.textContent = s.label;
    b.addEventListener('click', () => { state.style = id; syncControls(); update(); }); styleOpts.append(b);
  });
  $$('#inkOpts .opt').forEach(b => b.addEventListener('click', () => { state.ink = +b.dataset.ink; syncControls(); update(); }));
  sizeIn.addEventListener('input', () => { state.size = +sizeIn.value; syncControls(); update(); });

  function setZone(id) {
    state.zone = id;
    if (id === 'back' && state.view !== 'back') { state.view = 'back'; $$('.view-toggle button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.view === 'back'))); drawBody(); }
    if (['chest', 'ribs', 'stomach'].includes(id) && state.view !== 'front') { state.view = 'front'; $$('.view-toggle button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.view === 'front'))); drawBody(); }
    syncControls(); update();
  }
  function syncControls() {
    const Z = ZONES[state.zone];
    sizeIn.max = Z.max;
    if (state.size > Z.max) state.size = Z.max;
    sizeIn.value = state.size;
    sizeIn.style.setProperty('--p', ((state.size - 3) / (Z.max - 3) * 100) + '%');
    $('#sizeOut').textContent = state.size;
    $('#zoneName').textContent = Z.label;
    $('#zoneInfo').textContent = Z.info;
    $('#styleInfo').textContent = STYLES[state.style].info;
    $$('#zoneOpts .opt').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.zone === state.zone)));
    $$('#styleOpts .opt').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.style === state.style)));
    $$('#inkOpts .opt').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.ink === state.ink)));
    paintBody();
  }

  const shown = { low: 0, high: 0 };
  function update() {
    const q = quote(state.size, state.zone, state.style, state.ink);
    const setP = () => { $('#pLow').textContent = '$' + Math.round(shown.low); $('#pHigh').textContent = '$' + Math.round(shown.high); };
    if (hasGsap && !reduced) gsap.to(shown, { low: q.low, high: q.high, duration: .6, ease: 'power3.out', onUpdate: setP, overwrite: true });
    else { shown.low = q.low; shown.high = q.high; setP(); }
    $('#qHours').textContent = q.hours + (q.hours === 1 ? ' hr' : ' hrs');
    $('#qSessions').textContent = q.sessions;
    $('#qDeposit').textContent = '$' + q.deposit;
    $('#qArtist').textContent = q.artist;
    $('#qNote').textContent = q.sessions > 1
      ? `Booked as ${q.sessions} sittings, 3–4 weeks apart so each layer heals. Estimate only: your artist confirms after a stencil consult.`
      : 'Estimate only. Your artist confirms the final price after a stencil consult.';
  }

  drawBody(); syncControls(); update(); selectDesign(0);

  /* ---------- GSAP ---------- */
  if (!hasGsap) { $$('.rv').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (reduced) { gsap.set('.rv', { opacity: 1, y: 0 }); return; }

  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = document.querySelector(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -70 });
    }));
  }

  // hero: letters punch up, photo bleeds in
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero h1 .row > span', { yPercent: 105, skewY: 8, duration: 1.1, stagger: .09 })
    .from('#heroPhoto', { clipPath: 'inset(0 0 0 100%)', duration: 1.4, ease: 'expo.inOut' }, 0)
    .from('#heroPhoto img', { scale: 1.3, duration: 2 }, .2)
    .from('.rv-h', { y: 20, opacity: 0, duration: .8, stagger: .08 }, .6);
  gsap.to('#heroPhoto img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero h1', { xPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // flash designs drop onto the sheet like stickers
  gsap.from('.design', { y: -30, rotate: () => gsap.utils.random(-12, 12), opacity: 0, duration: .7, stagger: .06, ease: 'back.out(1.8)',
    scrollTrigger: { trigger: '#sheet', start: 'top 80%' }, onComplete: refreshLens });

  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .9, ease: 'expo.out', stagger: .07 }) });
})();
