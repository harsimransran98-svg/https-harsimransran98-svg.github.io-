/* Your Developments · The Skyline: one fixed stage, one scroll-scrubbed master timeline (0–100), all real footage. */
(async () => {
  'use strict';
  const { gsap, ScrollTrigger, MotionPathPlugin, Lenis } = window;
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  const $ = s => document.querySelector(s);
  const el = (t, c, txt) => { const n = document.createElement(t); if (c) n.className = c; if (txt != null) n.textContent = txt; return n; };
  const NS = 'http://www.w3.org/2000/svg', svg = (t, a) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); return n; };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, small = innerWidth < 760;
  const PX = (id, w) => 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id + '.jpeg?auto=compress&cs=tinysrgb&w=' + w;
  const PXV = (id, fps) => 'https://videos.pexels.com/video-files/' + id + '/' + id + '-' + (small ? 'hd_1280_720' : 'hd_1920_1080') + '_' + fps + 'fps.mp4';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- calm, cinematic scroll ---------- */
  const lenis = new Lenis({ lerp: reduced ? 1 : 0.055, smoothWheel: !reduced, wheelMultiplier: 0.7, touchMultiplier: 1.1 });
  lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  const spacer = $('#spacer'); spacer.style.height = (small ? 2000 : 2800) + 'vh';

  /* ---------- real video, scrubbed frame by frame ---------- */
  function makeSeq(dir, n) { const imgs = new Array(n); let started = false;
    return { n, load() { if (started) return; started = true; const order = []; for (let s = 8; s >= 1; s = s >> 1) for (let i = 0; i < n; i += s) if (!order.includes(i)) order.push(i); order.forEach(i => { const im = new Image(); im.decoding = 'async'; im.src = dir + '/f' + String(i + 1).padStart(3, '0') + '.webp'; imgs[i] = im; }); },
      frame(t) { const i = Math.round(clamp(t, 0, 1) * (n - 1)); for (let k = 0; k < n; k++) { const a = imgs[i - k], b = imgs[i + k]; if (a && a.complete && a.naturalWidth) return a; if (b && b.complete && b.naturalWidth) return b; } return null; } }; }
  const SEQ = { dusk: makeSeq('theskyline/seq/dusk', 121), drone: makeSeq('theskyline/seq/drone', 111), build: makeSeq('theskyline/seq/build', 101) };
  SEQ.dusk.load(); setTimeout(() => { SEQ.drone.load(); setTimeout(() => SEQ.build.load(), 1500); }, 1200);
  const cv = $('#seq'), cx = cv.getContext('2d'); let lastImg = null;
  function sizeCv() { const r = Math.min(devicePixelRatio || 1, 1.5); cv.width = Math.round(innerWidth * r); cv.height = Math.round(innerHeight * r); lastImg = null; } addEventListener('resize', sizeCv); sizeCv();
  function drawSeq(seq, t) { const im = seq.frame(t); if (!im || im === lastImg) return; lastImg = im; const W = cv.width, Hh = cv.height, s = Math.max(W / im.naturalWidth, Hh / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s; cx.drawImage(im, (W - w) / 2, (Hh - h) / 2, w, h); }

  /* ---------- media ---------- */
  const vFinale = $('#vFinale'); vFinale.poster = PX(1571460, small ? 900 : 1800); vFinale.src = PXV(11630727, 25);
  $('#imgBefore').src = PX(7031599, small ? 1000 : 2000); $('#imgAfter').src = PX(1571460, small ? 1000 : 2000);
  $('#imgMarina').src = PX(34738875, small ? 1100 : 2200); $('#imgCons').src = PX(13986101, small ? 1100 : 2000);
  $('#twImg').src = PX(30707660, small ? 900 : 1400); $('#twBg').src = PX(30707660, 600); $('#am1').src = PX(29149087, small ? 1000 : 1800); $('#am2').src = PX(14546230, 1000);

  /* ---------- data ---------- */
  const FLATS = [
    { y: 36.5, floor: 12, unit: '1204', kind: 'Two bedroom residence', beds: 2, baths: 2, sqft: 1180, view: 'Pool + garden', price: 'AED 2.15M', am: ['Balcony', 'Built-in wardrobes', 'Covered parking'] },
    { y: 26.5, floor: 24, unit: '2402', kind: 'Three bedroom corner', beds: 3, baths: 4, sqft: 1940, view: 'Sea + skyline', price: 'AED 3.90M', am: ['Maid’s room', 'Wraparound terrace', 'Smart home'] },
    { y: 16.5, floor: 36, unit: '3601', kind: 'Four bedroom sky villa', beds: 4, baths: 5, sqft: 3610, view: 'Full sea', price: 'AED 8.40M', am: ['Double-height living', 'Private lift lobby', 'Study'] },
    { y: 6.8, floor: 47, unit: 'PH-1', kind: 'The penthouse', beds: 5, baths: 6, sqft: 6220, view: '360° panorama', price: 'AED 21.5M', am: ['Private pool', 'Roof garden', 'Cinema room'] },
  ];
  const AMEN = { x: 50, y: 54, kind: 'Residents’ amenities', list: ['Lap pool · 25 m', 'Kids’ pool', 'Sky gym · level 30', 'Padel court', 'Concierge 24/7', '3 levels of parking'] };
  const ZOOM = { s: 1, ox: 45, oy: 30 };

  /* ---------- dot + line + data card on the real tower ---------- */
  const callouts = $('#callouts'), lines = $('#lines'), tw = $('#tw'), twImg = $('#twImg'), band = $('#band'); let card = null, dot = null, path = null, cur = -2;
  function buildCard(i) { callouts.textContent = ''; lines.textContent = ''; card = dot = path = null; if (i < 0) return;
    const isA = i >= FLATS.length, f = isA ? null : FLATS[i]; dot = el('i', 'dot'); card = el('article', 'card'); card.setAttribute('role', 'group');
    if (isA) { card.append(el('p', 'k', 'Podium · level 4'), el('h3', null, AMEN.kind)); const ul = el('ul'); AMEN.list.forEach(a => ul.append(el('li', null, a))); card.append(ul); card.setAttribute('aria-label', AMEN.kind); }
    else { card.append(el('p', 'k', 'Floor ' + f.floor + ' · Unit ' + f.unit), el('h3', null, f.kind)); const dl = el('dl'); [['Bedrooms', String(f.beds)], ['Bathrooms', String(f.baths)], ['Size', f.sqft.toLocaleString('en-GB') + ' sq ft'], ['Metric', Math.round(f.sqft * 0.092903) + ' m²'], ['View', f.view], ['Floor', String(f.floor)]].forEach(([k, val]) => { dl.append(el('dt', null, k), el('dd', null, val)); });
      const ul = el('ul'); f.am.forEach(a => ul.append(el('li', null, a))); const pr = el('div', 'pr'); pr.append(el('span', null, 'From'), el('b', null, f.price)); card.append(dl, ul, pr); card.setAttribute('aria-label', 'Floor ' + f.floor + ', ' + f.kind + ', ' + f.beds + ' bedrooms, ' + f.sqft + ' square feet'); }
    path = svg('path', { d: '', fill: 'none', stroke: '#D9B26F', 'stroke-width': 1.2 }); lines.append(path); callouts.append(dot, card);
    if (!reduced) { gsap.fromTo(card, { opacity: 0, x: 30, filter: 'blur(8px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: .8, ease: 'expo.out' }); gsap.from(card.querySelectorAll('dd, li, h3'), { opacity: 0, y: 8, stagger: .05, duration: .5, delay: .15 }); gsap.fromTo(path, { strokeDasharray: 700, strokeDashoffset: 700 }, { strokeDashoffset: 0, duration: .9, ease: 'power2.out' }); } }
  function placeCard(i) { if (!card) return; const r = tw.getBoundingClientRect(), isA = i >= FLATS.length, px = isA ? AMEN.x : 40, py = isA ? AMEN.y : FLATS[i].y + 3.6, s = ZOOM.s, ox = ZOOM.ox, oy = ZOOM.oy;
    const x = r.left + r.width * (ox + (px - ox) * s) / 100, y = r.top + r.height * (oy + (py - oy) * s) / 100, W = innerWidth, Hh = innerHeight; dot.style.left = x + 'px'; dot.style.top = y + 'px';
    if (small) { const cr = card.getBoundingClientRect(); path.setAttribute('d', 'M' + x + ' ' + y + ' L' + x + ' ' + (cr.top - 12)); return; }
    const cw = card.offsetWidth, ch = card.offsetHeight, cxp = Math.min(W - cw - 32, r.right + 90), cyp = clamp(y - ch * .4, Hh * .13, Hh * .87 - ch); card.style.left = cxp + 'px'; card.style.top = cyp + 'px';
    path.setAttribute('d', 'M' + x + ' ' + y + ' L' + (r.right + 30) + ' ' + (cyp + 34) + ' L' + cxp + ' ' + (cyp + 34)); }
  /* ---------- interior pins + palette ---------- */
  const PINS = [[56, 64, 'Coffee table', 'Calacatta marble'], [24, 80, 'Flooring', 'Smoked oak, wide plank'], [66, 22, 'Lighting', 'Brass & opal pendants'], [16, 38, 'Windows', 'Linen sheers, motorised'], [80, 58, 'Seating', 'Bouclé, custom-made']];
  const pins = $('#pins'); PINS.forEach(([x, y, k, val]) => { const p = el('div', x > 55 ? 'pin flip' : 'pin'), s = el('span'); p.style.left = x + '%'; p.style.top = y + '%'; s.append(el('small', null, k), document.createTextNode(val)); p.append(el('i', 'dot'), s); pins.append(p); });
  const pal = $('#palette'); [['Marble', 'linear-gradient(135deg,#F3F0EA 0%,#E2DDD3 40%,#CFC8BC 41%,#F1EDE6 60%,#D9D3C8 100%)'], ['Oak', 'repeating-linear-gradient(92deg,#8A6440 0 6px,#9C7450 6px 11px,#7C5838 11px 14px)'], ['Brass', 'linear-gradient(135deg,#7A5A23,#E9C77E 45%,#9C7633 70%,#F3DCA3)'], ['Linen', 'repeating-linear-gradient(0deg,#E8E1D4 0 2px,#DCD4C5 2px 4px)']].forEach(([n, bg]) => { const s = el('div', 'sw'); s.style.background = bg; s.append(el('b', null, n)); pal.append(s); });
  /* ---------- floor plan ---------- */
  const plan = $('#plan'); const W_ = (d, cls) => { const p = svg('path', { d, class: cls || 'w' }); plan.append(p); return p; };
  const ROOMS = [[40, 40, 400, 270, 'Living & dining', '7.6 × 5.4 m'], [440, 40, 180, 150, 'Kitchen', '3.6 × 3.0 m'], [620, 40, 140, 150, 'Maid’s', '2.8 × 3.0 m'], [440, 190, 320, 290, 'Principal suite', '6.4 × 5.8 m'], [40, 310, 200, 170, 'Bedroom 2', '4.0 × 3.4 m'], [240, 310, 200, 170, 'Bedroom 3', '4.0 × 3.4 m']];
  ROOMS.forEach(([x, y, w, h]) => plan.append(svg('rect', { x, y, width: w, height: h, class: 'r' })));
  const walls = [W_('M40 40 H760 V480 H40 Z'), W_('M440 40 V160 M440 220 V480 M440 190 H560 M620 40 V190 M620 190 H760 M40 310 H180 M240 310 V480 M240 310 H380')]; W_('M60 300 H140 M300 470 H380 M700 470 H740', 'p');
  const dims = []; ROOMS.forEach(([x, y, w, h, n, d]) => { const t1 = svg('text', { x: x + 16, y: y + 32, class: 'n' }); t1.textContent = n; const t2 = svg('text', { x: x + 16, y: y + 52 }); t2.textContent = d; plan.append(t1, t2); dims.push(t1, t2); });
  const dimLine = svg('path', { d: 'M40 506 H760 M40 500 V512 M760 500 V512', class: 'dim' }), dimT = svg('text', { x: 360, y: 524, class: 'd' }); dimT.textContent = '14.4 m · 2,140 sq ft · 199 m²'; plan.append(dimLine, dimT); dims.push(dimLine, dimT);
  walls.forEach(p => { const L = p.getTotalLength ? p.getTotalLength() || 3000 : 3000; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.dataset.l = L; });
  const pc = $('#planCard'), pcard = el('article', 'card'); pcard.append(el('p', 'k', 'Type C · floors 18–30'), el('h3', null, 'Three bedroom + maid’s')); const pdl = el('dl'); [['Internal', '1,780 sq ft'], ['Terrace', '360 sq ft'], ['Total', '2,140 sq ft'], ['Handover', 'Q4 2027']].forEach(([k, val]) => pdl.append(el('dt', null, k), el('dd', null, val))); pcard.append(pdl); pcard.style.position = 'relative'; pc.append(pcard);
  /* ---------- zoom-through rooms ---------- */
  const tunnel = $('#tunnel'), ROOMSHOTS = [[6585757, 'Principal suite', 'Bespoke joinery'], [3214064, 'Kitchen', 'Quartz & handleless oak'], [1643383, 'Living', 'Turnkey fit-out']].map(([id, n, k]) => { const f = el('figure', 'room'), im = el('img'); im.src = PX(id, small ? 1000 : 1800); im.alt = n + ' interior'; im.loading = 'lazy'; const cap = el('figcaption', null, k); cap.append(el('b', null, n)); f.append(im, cap); tunnel.append(f); gsap.set(f, { xPercent: -50, yPercent: -50, z: -3200, opacity: 0 }); return f; });
  /* ---------- titles ---------- */
  const titles = $('#titles'); const T = (cls, txt, em) => { const t = el('div', 't ' + cls, txt); if (em) t.append(el('em', null, em)); titles.append(t); return t; };
  const tPre = T('t-pre', 'Your Developments presents'), tMain = T('t-main', 'THE SKYLINE', 'a film about living above the city');
  const slate = (n, name) => { const t = el('div', 't t-slate', 'SC ' + n); t.append(el('b', null, name)); titles.append(t); return t; };
  const S2 = slate('02', 'Over the city'), S3 = slate('03', 'The build'), S4 = slate('04', 'The residences'), S45 = slate('04', 'The amenities'), S5 = slate('05', 'The interior'), S6 = slate('06', 'The plan');
  const SUBS = [[5.5, 10, 'Every great address begins as a line on the horizon.'], [10.3, 14.5, 'From first light to city lights, Dubai never stops rising.'], [20, 27, 'We build where the city looks up.'], [38.5, 44, 'Engineered, poured and glazed floor by floor, on schedule and on budget.'], [70.5, 75, 'Every residence is handed over finished by our own interior studio.'], [88.5, 93.5, 'Bedrooms, kitchens, living rooms: designed, built and styled in-house.']];
  const SCENES = [[0, 'SC 01 · OPENING'], [16, 'SC 02 · OVER THE CITY'], [31, 'SC 03 · THE BUILD'], [44, 'SC 04 · THE RESIDENCES'], [69, 'SC 05 · THE INTERIOR'], [81, 'SC 06 · THE PLAN'], [94.5, 'SC 07 · END CREDITS']];
  const roll = $('#roll'), rl = el('div'); [['Developer', 'Your Developments'], ['Main contractor', 'Your Contracting LLC'], ['Interior design', 'Your Interiors Studio'], ['Sales', 'Your Realty'], ['Location', 'Dubai · Sharjah'], ['Website', 'Bazozo Studio']].forEach(([k, val]) => { const d = el('span', null, k + ' · '); d.append(el('b', null, val)); rl.append(d); }); roll.append(rl);
  const amList = $('#amList'); [['Level 49', 'Infinity pool'], ['Level 30', 'Sky gym'], ['Podium', 'Kids’ club'], ['Podium', 'Padel court'], ['Lobby', 'Concierge 24/7'], ['B1–B3', 'Valet parking']].forEach(([k, v]) => { const li = el('li'); li.append(el('b', null, k), document.createTextNode(v)); amList.append(li); });
  const bh = $('#buildHud'), BH = [['Structure', 1], ['Façade', .92], ['MEP', .85], ['Fit-out', .7]]; bh.append(el('p', null, 'Construction progress · Tower A')); BH.forEach(([n]) => { const d = el('div'), s2 = el('span'), b = el('b'); s2.append(document.createTextNode(n), b); const i = el('i'), u = el('u'); i.append(u); d.append(s2, i); bh.append(d); });
  gsap.set([tPre, tMain], { autoAlpha: 1 });

  /* ---------- master timeline (0–100) ---------- */
  const tl = gsap.timeline({ defaults: { ease: 'none' } }); const show = (n, at, d) => tl.to(n, { autoAlpha: 1, duration: d || 1.2 }, at), hide = (n, at, d) => tl.to(n, { autoAlpha: 0, duration: d || 1.2 }, at);
  const lSeq = $('#lSeq'), lMar = $('#lMarina'), lCons = $('#lCons'), lTow = $('#lTower'), lAmen = $('#lAmen'), lInt = $('#lInt'), lPlan = $('#lPlan'), lTun = $('#lTunnel'), lFin = $('#lFinale'), flash = $('#flash'), cred = $('#credits'), hint = $('#hint');
  const B = { build: 0 };
  /* 01 opening: Dubai, day into night */
  tl.to(hint, { autoAlpha: 0, duration: 1.4 }, .6); tl.to(tPre, { autoAlpha: 0, duration: 1.2 }, 2.2); tl.to(tMain, { autoAlpha: 0, scale: .94, filter: 'blur(10px)', duration: 2 }, 3.4);
  tl.fromTo(cv, { scale: 1.08 }, { scale: 1, duration: 13 }, 0);
  tl.to(cv, { scale: 2.6, filter: 'blur(12px) brightness(1.5)', duration: 2.4, ease: 'power2.in' }, 13.2); tl.to(flash, { opacity: 1, duration: .8 }, 15); tl.set(cv, { scale: 1.12, filter: 'blur(0px) brightness(1)' }, 15.9); tl.to(flash, { opacity: 0, duration: 1.4 }, 16);
  /* 02 over the city (drone) → zoom into the Marina */
  show(S2, 16.6, 1); hide(S2, 21, 1); tl.to(cv, { scale: 1, duration: 11 }, 16);
  show(lMar, 27.4, 1.4); tl.fromTo('#imgMarina', { scale: 1.04 }, { scale: 2.1, duration: 4.4, ease: 'power1.in' }, 27.4); tl.to('#imgMarina', { filter: 'blur(8px) brightness(1.5)', duration: .9 }, 30.9); tl.to(flash, { opacity: 1, duration: .6 }, 31.1); hide(lMar, 31.7, .2); tl.to(flash, { opacity: 0, duration: 1.2 }, 31.8);
  /* 03 the build: crane timelapse, then the tower completes floor by floor */
  show(S3, 31.8, 1); hide(S3, 35.6, 1); tl.fromTo(cv, { scale: 1.1 }, { scale: 1, duration: 6 }, 31.6);
  show(lCons, 37.2, 1.2); hide(lSeq, 38.6, .4); tl.fromTo('#imgCons', { scale: 1.18 }, { scale: 1.02, duration: 7 }, 37.2); tl.to(B, { build: 1, duration: 5.6, ease: 'power1.inOut' }, 38); show('#buildHud', 38.2, 1); hide('#buildHud', 43.6, .8);
  /* 04 the residences: rise up the real tower, one flat at a time */
  show(lTow, 43.8, 1.2); hide(lCons, 45, .4); show(S4, 44.4, 1); hide(S4, 47.8, 1); tl.fromTo(tw, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.6, ease: 'power3.out' }, 43.8);
  FLATS.forEach((f, i) => { const at = 46.5 + i * 4.2; tl.to(ZOOM, { s: 1.45, oy: f.y + 3, duration: 2, ease: 'power2.inOut' }, at - 1.4); tl.fromTo(band, { top: f.y + '%', opacity: 0 }, { top: f.y + '%', opacity: 1, duration: .8 }, at); if (i < FLATS.length - 1) tl.to(band, { opacity: 0, duration: .5 }, at + 3.4); });
  tl.to(band, { opacity: 0, duration: .5 }, 63); tl.to(ZOOM, { s: 1.25, oy: 52, ox: 50, duration: 1.6, ease: 'power2.inOut' }, 62.8);
  /* 04b amenities */
  show(lAmen, 65.8, 1.2); hide(lTow, 66.8, .4); tl.fromTo('#am1', { scale: 1.2 }, { scale: 1.02, duration: 4 }, 65.8); tl.fromTo('.am.a2', { y: 80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.4, ease: 'power3.out' }, 66.4); tl.to('#amList li', { opacity: 1, stagger: .3, duration: .5 }, 66.8);
  /* zoom through the pool glass into a finished interior */
  tl.to('.am.a1', { scale: 2.4, filter: 'blur(8px) brightness(1.6)', duration: 1.6, ease: 'power2.in' }, 68.6); tl.to(flash, { opacity: 1, duration: .6 }, 69.6); show(lInt, 70.1, .2); hide(lAmen, 70.3, .2); tl.to(flash, { opacity: 0, duration: 1.3 }, 70.3);
  /* 05 interior: bare shell → designed home */
  show(S5, 70.5, 1); hide(S5, 74, 1); tl.fromTo('#lInt .ba', { scale: 1.16 }, { scale: 1, duration: 11 }, 70.1);
  tl.fromTo('#imgAfter', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 4.2, ease: 'power1.inOut' }, 71.6); tl.fromTo('#sweep', { left: '0%', autoAlpha: 1 }, { left: '100%', duration: 4.2, ease: 'power1.inOut' }, 71.6); tl.to('#sweep', { autoAlpha: 0, duration: .4 }, 75.8);
  tl.to('#pins .pin', { autoAlpha: 1, stagger: .45, duration: .6 }, 75.6); tl.fromTo('#palette .sw', { autoAlpha: 0, x: 80, rotate: 8 }, { autoAlpha: 1, x: 0, rotate: 0, stagger: .35, duration: .8, ease: 'back.out(1.6)' }, 76.2);
  /* 06 plan draws itself */
  tl.to('#lInt .ba', { scale: 1.5, filter: 'blur(6px)', duration: 1.8, ease: 'power2.in' }, 79.4); show(lPlan, 80.6, 1); hide(lInt, 81.6, .4); show(S6, 81.2, 1); hide(S6, 84.6, 1);
  walls.forEach((p, i) => tl.to(p, { strokeDashoffset: 0, duration: 3.2 }, 81.2 + i * .8)); tl.fromTo(dims, { opacity: 0 }, { opacity: 1, stagger: .12, duration: .4 }, 83.6); tl.fromTo('#planCard', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1 }, 84.6);
  /* zoom-through room tunnel */
  show(lTun, 87.2, .8); hide(lPlan, 87.8, .6); ROOMSHOTS.forEach((f, i) => { const at = 87.6 + i * 2.2; tl.fromTo(f, { z: -3200, opacity: 0 }, { z: 0, opacity: 1, duration: 1.9, ease: 'power1.out' }, at); tl.to(f, { z: 1100, opacity: 0, duration: 1.3, ease: 'power2.in' }, at + 2); });
  /* 07 finale + credits */
  show(lFin, 94.2, 1.2); hide(lTun, 95, .6); tl.fromTo('#vFinale', { scale: 1.2 }, { scale: 1, duration: 5.8 }, 94.2); tl.fromTo(cred, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.4 }, 95.4); tl.set({}, {}, 100);
  const st = ScrollTrigger.create({ trigger: spacer, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : 1.6, animation: tl });
  gsap.to(rl, { yPercent: -50, duration: 14, ease: 'none', repeat: -1 });

  /* ---------- per frame ---------- */
  const sub = $('#sub'), tc = $('#tc'), scn = $('#scn'), cl = $('#consLine'), cd = $('#consDone'); let curSub = -1;
  gsap.ticker.add(() => {
    const p = tl.progress() * 100;
    if (p > 4) SEQ.drone.load(); if (p > 18) SEQ.build.load();
    if (p < 16) drawSeq(SEQ.dusk, p / 14.5); else if (p < 31.6) drawSeq(SEQ.drone, (p - 16) / 12); else if (p < 39) drawSeq(SEQ.build, (p - 31.6) / 6.6);
    const on = +getComputedStyle(lFin).opacity > .02; if (on && vFinale.paused) vFinale.play().catch(() => {}); else if (!on && !vFinale.paused) vFinale.pause();
    if (p > 37 && p < 45) { const k = B.build, top = 100 - k * 72; cl.style.top = top + '%'; cl.dataset.floor = 'FLOOR ' + Math.round(k * 48) + ' / 48'; cd.style.background = 'linear-gradient(0deg, rgba(217,178,111,.0) 0%, rgba(242,199,126,.22) ' + Math.max(0, 100 - top - 1) + '%, transparent ' + (100 - top) + '%)';
      bh.querySelectorAll('div').forEach((d, i) => { const v2 = clamp(Math.min(BH[i][1], k * (1.25 - i * .12)), 0, 1); d.querySelector('b').textContent = Math.round(v2 * 100) + '%'; d.querySelector('u').style.width = v2 * 100 + '%'; }); }
    let fi = -1; if (p >= 45.8 && p < 65.6) { FLATS.forEach((f, i) => { if (p >= 46.5 + i * 4.2 - .3) fi = i; }); if (p >= 63.6) fi = FLATS.length; }
    if (fi !== cur) { cur = fi; buildCard(fi); } twImg.style.transformOrigin = ZOOM.ox + '% ' + ZOOM.oy + '%'; twImg.style.transform = 'scale(' + ZOOM.s + ')'; band.style.transformOrigin = ''; if (fi >= 0) placeCard(fi);
    if (fi >= 0 && fi < FLATS.length) { band.style.transform = 'scaleY(' + ZOOM.s + ')'; band.style.top = (ZOOM.oy + (FLATS[fi].y - ZOOM.oy) * ZOOM.s) + '%'; }
    const s = SUBS.findIndex(([a, b]) => p >= a && p <= b); if (s !== curSub) { curSub = s; if (s >= 0) { sub.textContent = SUBS[s][2]; gsap.fromTo(sub, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .6 }); } else gsap.to(sub, { opacity: 0, duration: .4 }); }
    const secs = p * 3; tc.textContent = ['00', String(Math.floor(secs / 60)).padStart(2, '0'), String(Math.floor(secs % 60)).padStart(2, '0'), String(Math.floor((secs % 1) * 24)).padStart(2, '0')].join(':');
    scn.textContent = SCENES.filter(([a]) => p >= a).pop()[1];
  });

  /* ---------- menu, scene jumps, magnetic buttons ---------- */
  const burger = $('.burger'), reel = $('#reel'), JUMP = { open: 0, city: 18, build: 39, flats: 47, inside: 72, plan: 83, credits: 97 };
  const setMenu = o => { reel.hidden = !o; burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Close scene list' : 'Open scene list'); if (o) { lenis.stop(); gsap.fromTo('#reel li', { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: .05, duration: .5, ease: 'expo.out' }); reel.querySelector('button').focus(); } else { lenis.start(); burger.focus(); } };
  burger.addEventListener('click', () => setMenu(reel.hidden)); addEventListener('keydown', e => { if (e.key === 'Escape' && !reel.hidden) setMenu(false); });
  document.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); const k = b.dataset.jump; if (!reel.hidden) setMenu(false); lenis.scrollTo(st.start + (st.end - st.start) * JUMP[k] / 100, { duration: reduced ? 0 : 3 }); if (k === 'credits') setTimeout(() => cred.focus({ preventScroll: true }), 3100); }));
  $('.mark').addEventListener('click', e => { e.preventDefault(); lenis.scrollTo(0, { duration: reduced ? 0 : 2.4 }); });
  const mm = gsap.matchMedia(); mm.add('(hover: hover) and (prefers-reduced-motion: no-preference)', () => { const on = []; document.querySelectorAll('.mag').forEach(b => { const s2 = b.querySelector('span'), mv = e => { const r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; gsap.to(b, { x: x * .3, y: y * .4, duration: .5, ease: 'power3.out' }); gsap.to(s2, { x: x * .12, y: y * .12, duration: .5 }); }, lv = () => { gsap.to([b, s2], { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.35)' }); }; b.addEventListener('mousemove', mv); b.addEventListener('mouseleave', lv); on.push([b, mv, lv]); }); return () => on.forEach(([b, mv, lv]) => { b.removeEventListener('mousemove', mv); b.removeEventListener('mouseleave', lv); }); });
  addEventListener('resize', () => ScrollTrigger.refresh());
})();
