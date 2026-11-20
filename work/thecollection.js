/* Your Motors · The Collection: real footage, scrubbed by scroll. Lights on, the arrival, doors up, walkaround, through the glass into stock, the garage, the test drive. */
(async () => {
  'use strict';
  const { gsap, ScrollTrigger, MotionPathPlugin, Lenis } = window;
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  const $ = s => document.querySelector(s);
  const el = (t, c, txt) => { const n = document.createElement(t); if (c) n.className = c; if (txt != null) n.textContent = txt; return n; };
  const NS = 'http://www.w3.org/2000/svg', svgEl = (t, a) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); return n; };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, small = innerWidth < 760;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const PX = (id, w) => 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id + '.jpeg?auto=compress&cs=tinysrgb&w=' + w;
  const PXV = (id, fps) => 'https://videos.pexels.com/video-files/' + id + '/' + id + '-' + (small ? 'hd_1280_720' : 'hd_1920_1080') + '_' + fps + 'fps.mp4';

  /* slower, weightier scroll */
  const lenis = new Lenis({ lerp: reduced ? 1 : 0.06, smoothWheel: !reduced, wheelMultiplier: 0.7, touchMultiplier: 1.1 });
  lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  const spacer = $('#spacer'); spacer.style.height = (small ? 1900 : 2600) + 'vh';

  /* real video as frame sequences */
  function makeSeq(dir, n) { const imgs = new Array(n); let started = false;
    return { n, load() { if (started) return; started = true; const order = []; for (let s = 8; s >= 1; s = s >> 1) for (let i = 0; i < n; i += s) if (!order.includes(i)) order.push(i); order.forEach(i => { const im = new Image(); im.decoding = 'async'; im.src = dir + '/f' + String(i + 1).padStart(3, '0') + '.webp'; imgs[i] = im; }); },
      frame(t) { const i = Math.round(clamp(t, 0, 1) * (n - 1)); for (let k = 0; k < n; k++) { const a = imgs[i - k], b = imgs[i + k]; if (a && a.complete && a.naturalWidth) return a; if (b && b.complete && b.naturalWidth) return b; } return null; } }; }
  const SEQ = { ignite: makeSeq('thecollection/seq/ignite', 81), garage: makeSeq('thecollection/seq/garage', 101), arrive: makeSeq('thecollection/seq/arrive', 111), walk: makeSeq('thecollection/seq/walk', 101) };
  SEQ.ignite.load(); setTimeout(() => { SEQ.garage.load(); setTimeout(() => { SEQ.arrive.load(); setTimeout(() => SEQ.walk.load(), 1500); }, 1500); }, 800);
  const surface = cvEl => { const c = cvEl.getContext('2d'); let last = null; return { el: cvEl, size() { const r = Math.min(devicePixelRatio || 1, 1.5), b = cvEl.getBoundingClientRect(); cvEl.width = Math.max(2, Math.round(b.width * r)); cvEl.height = Math.max(2, Math.round(b.height * r)); last = null; },
    draw(seq, t) { const im = seq.frame(t); if (!im || im === last) return; last = im; const W = cvEl.width, Hh = cvEl.height, s = Math.max(W / im.naturalWidth, Hh / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s; c.drawImage(im, (W - w) / 2, (Hh - h) / 2, w, h); } }; };
  const main = surface($('#seq')), wk = surface($('#wkCv')), wkBg = surface($('#wkBg'));
  const resizeAll = () => { main.size(); wk.size(); wkBg.size(); }; addEventListener('resize', resizeAll);

  /* ceiling light strips that switch on with scroll */
  const strips = $('#strips'), STRIPS = Array.from({ length: small ? 3 : 5 }, () => { const i = el('i'); strips.append(i); return i; });

  /* doors-up photos + dot/line tags mapped onto the real car */
  $('#d1').src = PX(26954167, small ? 1100 : 2000); $('#d2').src = PX(9582704, small ? 1100 : 2000);
  const TAGS = [[16, 25, 'Doors', 'Dihedral · carbon fibre'], [50, 42, 'Cabin', 'Tan leather · 2 seats'], [24, 61, 'Lights', 'Full-LED · adaptive'], [72, 82, 'Aero', 'Carbon front splitter']];
  const tagsEl = $('#tags'), lines = $('#lines'), d2 = $('#d2'), tagShow = { 0: 0, 1: 0, 2: 0, 3: 0 };
  const tagNodes = TAGS.map(([, , k, v]) => { const dot = el('i', 'tdot'), t = el('div', 'tag'), path = svgEl('path', { fill: 'none', stroke: '#FF3B1F', 'stroke-width': 1.2 }); t.append(el('small', null, k), el('b', null, v)); dot.style.opacity = t.style.opacity = path.style.opacity = '0'; tagsEl.append(dot, t); lines.append(path); return { dot, t, path }; });
  function placeTags() { const W = innerWidth, Hh = innerHeight, iw = d2.naturalWidth || 1500, ih = d2.naturalHeight || 1000, s = Math.max(W / iw, Hh / ih), ox = (W - iw * s) / 2, oy = (Hh - ih * s) / 2;
    TAGS.forEach(([px, py], i) => { const n = tagNodes[i], o = tagShow[i]; n.dot.style.opacity = n.t.style.opacity = n.path.style.opacity = String(o); if (o <= 0) return; const x = ox + iw * s * px / 100, y = oy + ih * s * py / 100, right = px > 50 || (px > 40 && i === 1);
      const tw = n.t.offsetWidth, th = n.t.offsetHeight, tx = clamp(right ? x + 80 : x - 80 - tw, 12, W - tw - 12), ty = clamp(y - 60, Hh * .14, Hh * .82 - th); n.dot.style.left = x + 'px'; n.dot.style.top = y + 'px'; n.t.style.left = tx + 'px'; n.t.style.top = ty + 'px';
      const ex = right ? tx : tx + tw, ey = ty + th / 2; n.path.setAttribute('d', 'M' + x + ' ' + y + ' L' + (x + (ex - x) * .55) + ' ' + ey + ' L' + ex + ' ' + ey); }); }

  /* ---------------- flagship spec, revealed one line at a time ---------------- */
  const spec = $('#spec'), SPEC = [['Engine', '4.0 L V8 twin-turbo'], ['Power', '720 hp · 770 Nm'], ['0–100 km/h', '2.9 s'], ['Top speed', '341 km/h'], ['Mileage', '1,240 km'], ['Warranty', '3 years · unlimited km'], ['Price', 'AED 1,180,000']];
  spec.append(el('h3', null, 'The Flagship'), el('p', null, '2025 · GCC spec · 1 owner')); const specRows = SPEC.map(([k, v], i) => { const r = el('div', i === SPEC.length - 1 ? 'row price' : 'row'); r.append(el('span', null, k), el('b', null, v)); spec.append(r); return r; });

  /* ---------------- stock: real photographs ---------------- */
  const CARS = [
    { id: 261985, n: '01 / 04', name: 'British grand tourer', win: [56, 44], rows: [['Year', '2022'], ['Mileage', '14,800 km'], ['Engine', '6.0 L W12 · 626 hp'], ['Spec', 'GCC · dealer serviced']], price: 689000 },
    { id: 29753296, n: '02 / 04', name: 'Mid-engine V8 coupé', win: [56, 50], rows: [['Year', '2023'], ['Mileage', '6,200 km'], ['Engine', '4.0 L V8 · 710 hp'], ['Spec', 'GCC · PPF wrapped']], price: 1045000 },
    { id: 31298995, n: '03 / 04', name: 'Rear-engine sports coupé', win: [64, 44], rows: [['Year', '2021'], ['Mileage', '22,400 km'], ['Engine', '3.8 L flat-six · 650 hp'], ['Spec', 'European · full history']], price: 798000 },
    { id: 337909, n: '04 / 04', name: 'Italian V8 berlinetta', win: [52, 48], rows: [['Year', '2019'], ['Mileage', '31,000 km'], ['Engine', '4.5 L V8 · 562 hp'], ['Spec', 'GCC · new tyres']], price: 529000 } ];
  const monthly = pr => Math.round(pr * .8 * (1 + .0349 * 5) / 60 / 10) * 10, aed = v => 'AED ' + v.toLocaleString('en-GB');
  const lStock = $('#lStock'), carEls = CARS.map(c => { const box = el('figure', 'car'), im = el('img'), card = el('div', 'ccard'); im.src = PX(c.id, small ? 1100 : 2000); im.alt = c.name + ' for sale'; im.style.transformOrigin = c.win[0] + '% ' + c.win[1] + '%'; im.loading = 'lazy';
    card.append(el('p', 'n', 'In stock · ' + c.n), el('h3', null, c.name)); const rs = c.rows.concat([['Finance', 'from ' + aed(monthly(c.price)) + ' / mo'], ['Price', aed(c.price)]]).map(([k, v], i, a) => { const r = el('div', i === a.length - 1 ? 'row price' : 'row'); r.append(el('span', null, k), el('b', null, v)); card.append(r); return r; });
    const cta = el('div', 'cta-row'), b1 = el('a', 'btn-hot mag'), b2 = el('a', 'btn-line mag'); b1.href = 'https://wa.me/971500000000?text=' + encodeURIComponent('Is the ' + c.name + ' (' + aed(c.price) + ') still available?'); b1.target = '_blank'; b1.rel = 'noopener'; b1.append(el('span', null, 'Enquire')); b2.href = '#finale'; b2.dataset.jump = 'finale'; b2.append(el('span', null, 'Test drive')); cta.append(b1, b2); card.append(cta);
    box.append(im, card); lStock.append(box); return { box, im, rows: rs, cta }; });

  /* ---------------- garage + paint ---------------- */
  const SVC = [['Major service', 'Oil, filters, plugs, 120-point check', 'from AED 1,450'], ['Ceramic coating', '9H · 5-year warranty', 'from AED 3,900'], ['Paint protection film', 'Self-healing · full body', 'from AED 14,500'], ['Window tint', 'Ceramic 50% · RTA compliant', 'from AED 1,200'], ['Bodywork & paint', 'OEM-matched · dust-free booth', 'by quote'], ['Detailing', 'Interior + engine bay', 'from AED 650']];
  const svc = $('#svc'); SVC.forEach(([n, d, pr], i) => { const li = el('li'), m = el('div'); m.append(el('b', null, n), el('small', null, d)); li.append(el('i', null, String(i + 1).padStart(2, '0')), m, el('em', null, pr)); svc.append(li); });
  const vGarage = $('#vGarage'), vFinale = $('#vFinale');  vGarage.src = PXV(6158068, 30); vFinale.poster = PX(337909, 1600); vFinale.src = PXV(13796181, 24);
  $('#pBefore').src = PX(337909, small ? 1000 : 1800); $('#pAfter').src = PX(337909, small ? 1000 : 1800);


  /* ---------------- titles ---------------- */
  const titles = $('#titles'), T = (cls, txt, em) => { const t = el('div', 't ' + cls, txt); if (em) t.append(el('em', null, em)); titles.append(t); return t; };
  const tPre = T('t-pre', 'Your Motors presents'), tMain = T('t-main', 'THE COLLECTION', 'luxury · performance · care');
  const lap = (n, name) => { const t = el('div', 't t-lap', 'SCENE ' + n); t.append(el('b', null, name)); titles.append(t); return t; };
  const L2 = lap('02', 'The arrival'), L3 = lap('03', 'Doors up'), L4 = lap('04', 'Walkaround'), L5 = lap('05', 'In stock'), L6 = lap('06', 'The garage');
  const SUBS = [[4, 9, 'Every car deserves an entrance.'], [17, 23, 'Hand-picked. Inspected on 160 points. Delivered to your door.'], [29, 35, 'Open it up. Every panel, every stitch, exactly as described.'], [44.5, 48.5, 'Step through the glass…'], [79.5, 84.5, 'And when it needs us again, our own technicians take it from here.']];
  const LAPS = [[0, 'LIGHTS', 'N'], [14, 'ARRIVAL', '1'], [26, 'DOORS', '2'], [37, 'WALKAROUND', '3'], [50, 'IN STOCK', '4'], [78.5, 'GARAGE', '5'], [91, 'TEST DRIVE', '6']];
  const roll = $('#roll'), rl = el('div'); [['Dealer', 'Your Motors'], ['Garage', 'Your Motors Service Centre'], ['Showroom', 'Sheikh Zayed Road · Dubai'], ['Workshop', 'Industrial Area 4 · Sharjah'], ['Website', 'Bazozo Studio']].forEach(([k, v]) => { const s2 = el('span', null, k + ' · '); s2.append(el('b', null, v)); rl.append(s2); }); roll.append(rl);

  /* ---------------- master timeline ---------------- */
  const tl = gsap.timeline({ defaults: { ease: 'none' } }), F = { bright: 0 };
  const lSeq = $('#lSeq'), cvMain = $('#seq'), lDoors = $('#lDoors'), lWalk = $('#lWalk'), dark = $('#dark'), flash = $('#flash'), lGar = $('#lGarage'), lPaint = $('#lPaint'), lFin = $('#lFinale'), fin = $('#finale');
  tl.set(lSeq, { autoAlpha: 1 }, 0); tl.to('#hint', { autoAlpha: 0, duration: 1 }, .4);
  /* 01 lights on: the headlight ignites, then the garage lights come up strip by strip */
  tl.to(dark, { opacity: 0, duration: 1.6 }, .5); tl.fromTo(F, { bright: .25 }, { bright: 1, duration: 6 }, .5);
  STRIPS.forEach((s2, i) => { const at = 7 + i * .9; tl.to(s2, { opacity: 1, duration: .15 }, at); tl.to(s2, { opacity: .25, duration: .08 }, at + .2); tl.to(s2, { opacity: 1, duration: .1 }, at + .35); });
  tl.to(strips, { autoAlpha: 0, duration: 1 }, 13.4);
  tl.fromTo(tPre, { autoAlpha: 0, letterSpacing: '1.4em' }, { autoAlpha: 1, letterSpacing: '.6em', duration: 1.6 }, 1.5); tl.to(tPre, { autoAlpha: 0, duration: .8 }, 5);
  tl.fromTo(tMain, { autoAlpha: 0, scale: .88, filter: 'blur(12px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 2.2, ease: 'power3.out' }, 8.6); tl.to(tMain, { autoAlpha: 0, y: -30, duration: 1.2 }, 12.4);
  /* 02 the arrival */
  tl.to(L2, { autoAlpha: 1, duration: 1 }, 14.4); tl.to(L2, { autoAlpha: 0, duration: 1 }, 18.4); tl.fromTo(cvMain, { scale: 1.12 }, { scale: 1, duration: 11 }, 14);
  /* 03 doors up: the garage lights find the car, then the turntable car with tags */
  tl.to(cvMain, { scale: 2.2, filter: 'blur(10px) brightness(1.5)', duration: 1.4, ease: 'power2.in' }, 24.4); tl.to(flash, { opacity: 1, duration: .6 }, 25.4); tl.set(lDoors, { autoAlpha: 1 }, 26); tl.set(lSeq, { autoAlpha: 0 }, 26.1); tl.to(flash, { opacity: 0, duration: 1.2 }, 26.1);
  tl.fromTo('#d1', { scale: 1.3, filter: 'brightness(.15) contrast(1.3)' }, { scale: 1.04, filter: 'brightness(1) contrast(1)', duration: 4, ease: 'power2.out' }, 26); tl.to(L3, { autoAlpha: 1, duration: 1 }, 26.4); tl.to(L3, { autoAlpha: 0, duration: 1 }, 30);
  tl.fromTo('#d2', { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'power2.out' }, 30.6); TAGS.forEach((_, i) => { tl.to(tagShow, { [i]: 1, duration: .7 }, 32 + i * 1.1); tl.to(tagShow, { [i]: 0, duration: .5 }, 36.4); });
  /* 04 walkaround: real dealership footage, spec line by line */
  tl.to(lWalk, { autoAlpha: 1, duration: 1.2 }, 36.8); tl.set(lDoors, { autoAlpha: 0 }, 38.1); tl.fromTo('#wk', { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.4, ease: 'power3.out' }, 37); tl.to(L4, { autoAlpha: 1, duration: 1 }, 37.4); tl.to(L4, { autoAlpha: 0, duration: 1 }, 40.6);
  tl.to('#spec', { autoAlpha: 1, duration: 1 }, 38.4); tl.to('#spec', { autoAlpha: 0, duration: .8 }, 45.2);
  /* through the driver-side glass into the stock */
  tl.to('#wkCv', { scale: 3.4, filter: 'blur(8px) brightness(1.6)', duration: 2.4, ease: 'power2.in' }, 45.6); tl.to(flash, { opacity: 1, duration: .6 }, 47.6); tl.set(lStock, { autoAlpha: 1 }, 48.2); tl.set(lWalk, { autoAlpha: 0 }, 48.3); tl.to(flash, { opacity: 0, duration: 1.2 }, 48.3);
  /* 05 stock: each car zooms out of its own side glass, then we dive into the next */
  tl.fromTo(L5, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, 48.4); tl.to(L5, { autoAlpha: 0, duration: .4 }, 49.3);
  carEls.forEach((c, i) => { const at = 48.3 + i * 7.4; tl.set(c.box, { autoAlpha: 1 }, at); tl.fromTo(c.im, { scale: 3.2, filter: 'blur(14px) brightness(1.8)' }, { scale: 1.04, filter: 'blur(0px) brightness(1)', duration: 2, ease: 'power3.out' }, at);
    tl.fromTo(c.box.querySelectorAll('.ccard > .n, .ccard h3'), { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, stagger: .2, duration: .8 }, at + 1);
    c.rows.forEach((r, k) => tl.to(r, { opacity: 1, x: 0, duration: .5 }, at + 1.8 + k * .55)); tl.to(c.cta, { opacity: 1, duration: .5 }, at + 5.4);
    if (i < carEls.length - 1) { tl.to(c.im, { scale: 4.2, filter: 'blur(10px) brightness(1.7)', duration: 1.4, ease: 'power3.in' }, at + 6); tl.to(c.box.querySelector('.ccard'), { autoAlpha: 0, duration: .5 }, at + 6); tl.set(c.box, { autoAlpha: 0 }, at + 7.4); } });
  /* 06 garage + paint correction */
  tl.to(lGar, { autoAlpha: 1, duration: 1 }, 78.4); tl.to(carEls[3].box, { autoAlpha: 0, duration: 1 }, 78.8); tl.to(L6, { autoAlpha: 1, duration: .8 }, 78.6); tl.to(L6, { autoAlpha: 0, duration: .6 }, 80);
  tl.to('#svc li', { opacity: 1, x: 0, stagger: .7, duration: .6 }, 80.4); tl.fromTo('#vGarage', { scale: 1.15 }, { scale: 1, duration: 8 }, 78.4);
  tl.to(lPaint, { autoAlpha: 1, duration: 1 }, 85.4); tl.fromTo('#pAfter', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 3.6, ease: 'power1.inOut' }, 86.6); tl.fromTo('#blade', { left: '100%' }, { left: '0%', duration: 3.6, ease: 'power1.inOut' }, 86.6); tl.fromTo('#swirl', { clipPath: 'inset(0 0% 0 0)' }, { clipPath: 'inset(0 100% 0 0)', duration: 3.6, ease: 'power1.inOut' }, 86.6); tl.fromTo('#lPaint img', { scale: 1.12 }, { scale: 1, duration: 5 }, 85.4);
  /* 07 finale */
  tl.to(lFin, { autoAlpha: 1, duration: 1.2 }, 91); tl.to([lGar, lPaint], { autoAlpha: 0, duration: .5 }, 92); tl.fromTo('#vFinale', { scale: 1.2 }, { scale: 1, duration: 9 }, 91); tl.fromTo(fin, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.6 }, 93); tl.set({}, {}, 100);
  gsap.set('.ccard .row, #svc li', { x: 20, transition: 'none' });
  const st = ScrollTrigger.create({ trigger: spacer, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : 1.6, animation: tl });
  gsap.to(rl, { yPercent: -50, duration: 12, ease: 'none', repeat: -1 });
  requestAnimationFrame(resizeAll);

  /* ---------------- per-frame ---------------- */
  const sub = $('#sub'), tf = $('#tf'), gear = $('#gear'), lapEl = $('#lap'); let curSub = -1;
  gsap.ticker.add(() => { const p = tl.progress() * 100;
    if (p < 7) main.draw(SEQ.ignite, .14 + .86 * p / 7); else if (p < 14) main.draw(SEQ.garage, (p - 7) / 7); else if (p < 26.2) main.draw(SEQ.arrive, (p - 14) / 11);
    cvMain.style.opacity = p < 26 ? String(F.bright) : '';
    if (p > 36 && p < 48.5) { const t = (p - 37) / 9.5; wk.draw(SEQ.walk, t); wkBg.draw(SEQ.walk, t); }
    if (p > 26 && p < 37.5) placeTags();
    const k = clamp((p - 39) / 5.5, 0, 1); specRows.forEach((r, i) => r.classList.toggle('on', k > i / SPEC.length));
    [[lGar, vGarage], [lFin, vFinale]].forEach(([l, v]) => { const on = +getComputedStyle(l).opacity > .02; if (on && v.paused) v.play().catch(() => {}); else if (!on && !v.paused) v.pause(); });
    const s = SUBS.findIndex(([a, b]) => p >= a && p <= b); if (s !== curSub) { curSub = s; if (s >= 0) { sub.textContent = SUBS[s][2]; gsap.fromTo(sub, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .6 }); } else gsap.to(sub, { opacity: 0, duration: .4 }); }
    tf.style.strokeDashoffset = String(151 * (1 - p / 100)); const lp = LAPS.filter(([a]) => p >= a).pop(); gear.textContent = lp[2]; lapEl.textContent = lp[1]; });

  /* ---------------- menu, jumps, magnetic buttons ---------------- */
  const burger = $('.burger'), laps = $('#laps'), JUMP = { lights: 8, arrive: 18, doors: 33, spin: 42, stock: 52, garage: 83, finale: 97 };
  const setMenu = o => { laps.hidden = !o; burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Close scene list' : 'Open scene list'); if (o) { lenis.stop(); gsap.fromTo('#laps li', { opacity: 0, x: -30 }, { opacity: 1, x: 0, stagger: .05, duration: .5, ease: 'expo.out' }); laps.querySelector('button').focus(); } else { lenis.start(); burger.focus(); } };
  burger.addEventListener('click', () => setMenu(laps.hidden)); addEventListener('keydown', e => { if (e.key === 'Escape' && !laps.hidden) setMenu(false); });
  document.addEventListener('click', e => { const b = e.target.closest('[data-jump]'); if (!b) return; e.preventDefault(); if (!laps.hidden) setMenu(false); lenis.scrollTo(st.start + (st.end - st.start) * JUMP[b.dataset.jump] / 100, { duration: reduced ? 0 : 3 }); if (b.dataset.jump === 'finale') setTimeout(() => fin.focus({ preventScroll: true }), 3100); });
  $('.mark').addEventListener('click', e => { e.preventDefault(); lenis.scrollTo(0, { duration: reduced ? 0 : 2.4 }); });
  const mm = gsap.matchMedia(); mm.add('(hover: hover) and (prefers-reduced-motion: no-preference)', () => { const on = []; document.querySelectorAll('.mag').forEach(b => { const s2 = b.querySelector('span'), mv = e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .45, ease: 'power3.out' }); gsap.to(s2, { x: (e.clientX - r.left - r.width / 2) * .1, duration: .45 }); }, lv = () => gsap.to([b, s2], { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.32)' }); b.addEventListener('mousemove', mv); b.addEventListener('mouseleave', lv); on.push([b, mv, lv]); }); return () => on.forEach(([b, mv, lv]) => { b.removeEventListener('mousemove', mv); b.removeEventListener('mouseleave', lv); }); });
  addEventListener('resize', () => ScrollTrigger.refresh());
})();
