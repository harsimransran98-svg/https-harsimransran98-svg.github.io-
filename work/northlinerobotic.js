/* Northline Robotics — live demo build (Bazozo Studio) */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  $('#year').textContent = new Date().getFullYear();

  function el(tag, attrs, parent, text) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.append(n);
    return n;
  }
  /* gear outline centred on 0,0 (inward teeth when inner = true) */
  function gearPath(n, r, h, inner) {
    let d = '';
    const p = Math.PI * 2 / n;
    for (let i = 0; i < n; i++) {
      const a = i * p;
      const pts = [[r, a], [r + (inner ? -h : h), a + p * .2], [r + (inner ? -h : h), a + p * .5], [r, a + p * .7]];
      pts.forEach(([rr, aa], j) => { d += (i === 0 && j === 0 ? 'M' : 'L') + (rr * Math.cos(aa)).toFixed(2) + ' ' + (rr * Math.sin(aa)).toFixed(2); });
    }
    return d + 'Z';
  }

  /* ---------- 3-gear menu button ---------- */
  const icon = [
    { g: $('#gA'), n: 12, r: 8.6, cls: 'g' },
    { g: $('#gB'), n: 8, r: 5.4, cls: 'g2' },
    { g: $('#gC'), n: 7, r: 4.8, cls: 'g2' }
  ].map(o => {
    const rot = el('g', {}, o.g);
    el('path', { class: o.cls, d: gearPath(o.n, o.r, 2.2) }, rot);
    el('circle', { class: 'hub', r: o.r * .38 }, rot);
    return { rot, n: o.n, a: 0 };
  });
  const turn = { v: 0 };
  function spinIcon(deg) {
    const paint = () => icon.forEach((g, i) => g.rot.setAttribute('transform', `rotate(${(i === 0 ? 1 : -12 / g.n) * turn.v})`));
    if (hasGsap && !reduced) gsap.to(turn, { v: turn.v + deg, duration: 1, ease: 'back.out(1.4)', onUpdate: paint });
    else { turn.v += deg; paint(); }
  }

  const nav = $('#nav'), btn = $('#menuBtn'), side = $('#side'), scrim = $('#scrim');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    spinIcon(open ? 180 : -180);
    [side, scrim].forEach(n => {
      if (open) { n.hidden = false; void n.offsetWidth; n.classList.add('open'); }
      else { n.classList.remove('open'); setTimeout(() => { if (!n.classList.contains('open')) n.hidden = true; }, 800); }
    });
    if (open && hasGsap && !reduced) gsap.fromTo('.side a.lnk', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: .7, stagger: .06, ease: 'expo.out', delay: .25 });
  }
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  scrim.addEventListener('click', () => setMenu(false));
  side.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !side.hidden) { setMenu(false); btn.focus(); } });

  /* ---------- exploded actuator ---------- */
  const CX = 230, ISO = .34;
  const PARTS = [
    { name: 'Output flange', r: 92, t: 14, m: 'm', deco: 'bolts', spin: 'out', desc: 'Where the tool or next arm link bolts on. Turns at output speed.', specs: [['Diameter', '184 mm'], ['Interface', 'ISO 9409-1-A100'], ['Bolts', '12 × M6']] },
    { name: 'Cross-roller bearing', r: 100, t: 18, m: 'd', deco: 'rollers', spin: 'out', desc: 'Carries the bending load so the gears only ever see torque.', specs: [['Moment load', '450 N·m'], ['Preload', 'Factory set'], ['Seal', 'IP67']] },
    { name: 'Circular spline', r: 96, t: 16, m: 'g', deco: 'innerGear', spin: 'fixed', desc: 'Rigid ring with 162 internal teeth, fixed to the housing.', specs: [['Teeth', '162'], ['Material', 'Nitrided steel'], ['Motion', 'Stationary']] },
    { name: 'Flexspline', r: 80, t: 24, m: 'm', deco: 'outerGear', spin: 'out', desc: 'Thin flexible cup with 160 teeth. Two fewer teeth than the spline gives an 80:1 reduction.', specs: [['Teeth', '160'], ['Ratio', '80 : 1'], ['Backlash', '< 20 arc-sec']] },
    { name: 'Wave generator', r: 66, t: 16, m: 'g', deco: 'cam', spin: 'fast', desc: 'Elliptical cam that flexes the flexspline into the spline at two points as it spins.', specs: [['Type', 'Elliptical cam'], ['Bearing', 'Thin-section ball'], ['Speed', 'Motor speed']] },
    { name: 'Rotor', r: 56, t: 28, m: 'd', deco: 'magnets', spin: 'fast', desc: 'Frameless torque motor rotor with 24 bonded neodymium magnets.', specs: [['Poles', '24'], ['Max speed', '3,000 rpm'], ['Magnets', 'NdFeB N42']] },
    { name: 'Stator', r: 96, t: 34, m: 'm', deco: 'windings', spin: 'fixed', desc: 'Copper windings potted in the housing. No brushes, nothing to wear out.', specs: [['Bus voltage', '48 V'], ['Peak power', '2.1 kW'], ['Cooling', 'Passive']] },
    { name: 'Absolute encoder', r: 60, t: 12, m: 'd', deco: 'code', spin: 'fast', desc: 'Reads the motor shaft 8.4 million times per turn, so position survives a power cut.', specs: [['Resolution', '23-bit'], ['Accuracy', '±0.005°'], ['Interface', 'EtherCAT']] }
  ];
  const ex = $('#ex'), partsG = $('#parts'), callG = $('#callouts');
  const compactY = i => 250 + i * 20, openY = i => 52 + i * 86;
  const spinners = [];

  function band(r, t) {
    const ry = r * ISO;
    return `M${-r} 0 L${-r} ${t} A${r} ${ry} 0 0 0 ${r} ${t} L${r} 0 A${r} ${ry} 0 0 1 ${-r} 0 Z`;
  }
  const built = PARTS.map((P, i) => ({ P, i })).reverse().map(({ P, i }) => {
    const g = el('g', { class: 'part', tabindex: '0', role: 'button', 'aria-label': P.name }, partsG);
    el('path', { class: 'side-f', d: band(P.r, P.t), fill: `url(#${P.m}Side)`, transform: `translate(${CX} 0)` }, g);
    el('ellipse', { class: 'top-f', cx: CX, cy: 0, rx: P.r, ry: P.r * ISO, fill: `url(#${P.m}Top)` }, g);
    const face = el('g', { transform: `translate(${CX} 0) scale(1 ${ISO})` }, g);
    const rot = el('g', {}, face);
    const deco = { class: 'deco' };
    switch (P.deco) {
      case 'bolts': for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; el('circle', { ...deco, cx: Math.cos(a) * P.r * .78, cy: Math.sin(a) * P.r * .78, r: 4.5, fill: '#2A2E35' }, rot); } el('circle', { ...deco, r: P.r * .42, fill: '#1A1D22' }, rot); break;
      case 'rollers': for (let k = 0; k < 36; k++) { const a = k * Math.PI / 18; el('rect', { ...deco, x: Math.cos(a) * P.r * .82 - 3, y: Math.sin(a) * P.r * .82 - 3, width: 6, height: 6, transform: `rotate(${k * 10 + 45} ${Math.cos(a) * P.r * .82} ${Math.sin(a) * P.r * .82})`, stroke: '#C9CED6' }, rot); } el('circle', { ...deco, r: P.r * .66, fill: '#14171C' }, rot); break;
      case 'innerGear': el('circle', { r: P.r * .86, fill: '#14171C' }, rot); el('path', { d: gearPath(54, P.r * .78, 7, false), fill: '#14171C', stroke: '#F0D27A', 'stroke-width': 1 }, rot); el('circle', { r: P.r * .74, fill: '#0F1115' }, rot); break;
      case 'outerGear': el('path', { d: gearPath(48, P.r * .88, 6, false), fill: '#AEB4BD', stroke: '#2A2E35', 'stroke-width': .8 }, rot); el('circle', { r: P.r * .6, fill: '#3A3F48' }, rot); el('circle', { r: P.r * .25, fill: '#1A1D22' }, rot); break;
      case 'cam': el('ellipse', { rx: P.r * .9, ry: P.r * .72, fill: '#E8C766', stroke: '#6B5715', 'stroke-width': 1.5 }, rot); for (let k = 0; k < 20; k++) { const a = k * Math.PI / 10; el('circle', { cx: Math.cos(a) * P.r * .78, cy: Math.sin(a) * P.r * .62, r: 3.2, fill: '#F7F1DE', stroke: '#6B5715', 'stroke-width': .6 }, rot); } el('circle', { r: P.r * .3, fill: '#2A2E35' }, rot); break;
      case 'magnets': for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12; el('rect', { x: P.r * .62, y: -4, width: P.r * .3, height: 8, fill: k % 2 ? '#B33A3A' : '#3A5FB3', transform: `rotate(${k * 15})` }, rot); } el('circle', { r: P.r * .5, fill: '#1A1D22', stroke: '#5B616B' }, rot); break;
      case 'windings': for (let k = 0; k < 48; k++) el('rect', { x: P.r * .58, y: -2.6, width: P.r * .34, height: 5.2, fill: '#C67B3C', stroke: '#6E3F1A', 'stroke-width': .5, transform: `rotate(${k * 7.5})` }, rot); el('circle', { r: P.r * .56, fill: '#14171C' }, rot); break;
      case 'code': for (let k = 0; k < 64; k++) if (k % 3) el('rect', { x: P.r * .62, y: -1.6, width: P.r * .26, height: 3.2, fill: '#D4AF37', transform: `rotate(${k * 5.625})` }, rot); el('circle', { r: P.r * .5, fill: '#0F1115', stroke: '#5B616B' }, rot); break;
    }
    spinners.push({ rot, spin: P.spin, a: 0 });
    // callout
    const c = el('g', { class: 'callout', opacity: 0 }, callG);
    const ly = P.t / 2 + 4;
    el('circle', { cx: CX + P.r * .72, cy: ly, r: 2.5 }, c);
    el('line', { x1: CX + P.r * .72, y1: ly, x2: 360, y2: ly }, c);
    el('text', { class: 't1', x: 366, y: ly - 2 }, c, P.name.toUpperCase());
    el('text', { class: 't2', x: 366, y: ly + 12 }, c, P.specs[0][1] + ' · ' + P.specs[1][1]);
    g.addEventListener('mouseenter', () => showPart(i));
    g.addEventListener('click', () => showPart(i));
    g.addEventListener('focus', () => showPart(i));
    return { g, c, i };
  }).sort((a, b) => a.i - b.i);

  let sep = 0;
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function render(s) {
    sep = s;
    built.forEach(({ g, c, i }) => {
      const local = Math.min(1, Math.max(0, s * 1.15 - i * .02));
      const y = compactY(i) + (openY(i) - compactY(i)) * ease(local);
      g.setAttribute('transform', `translate(0 ${y.toFixed(1)})`);
      c.setAttribute('transform', `translate(0 ${y.toFixed(1)})`);
      c.setAttribute('opacity', Math.min(1, Math.max(0, (s - .55) / .3)).toFixed(2));
    });
    $('#axis').setAttribute('opacity', Math.min(1, s * 2).toFixed(2));
    $('#sepOut').textContent = Math.round(s * 100) + '%';
    const range = $('#sep'); range.value = Math.round(s * 100); range.style.setProperty('--p', Math.round(s * 100) + '%');
  }
  $('#sep').addEventListener('input', e => render(+e.target.value / 100));

  function showPart(i) {
    const P = PARTS[i];
    built.forEach(b => b.g.classList.toggle('hl', b.i === i));
    $('#pcNo').textContent = `Part ${String(i + 1).padStart(2, '0')} / 08`;
    $('#pcName').textContent = P.name;
    $('#pcDesc').textContent = P.desc;
    const dl = $('#pcSpecs'); dl.replaceChildren();
    P.specs.forEach(([k, v]) => { const d = document.createElement('div'); const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.textContent = v; d.append(dt, dd); dl.append(d); });
  }
  render(0); showPart(3);

  // gears turn at their real ratios while the joint is open: motor shaft fast, output 80× slower
  const MOTOR = 90; // deg/s at full separation
  function spin(dt) {
    if (sep < .05) return;
    spinners.forEach(s => {
      if (s.spin === 'fixed') return;
      s.a += (s.spin === 'fast' ? MOTOR : -MOTOR / 80 * 8) * sep * dt; // output exaggerated 8× so you can see it move
      s.rot.setAttribute('transform', `rotate(${s.a.toFixed(2)})`);
    });
  }

  /* ---------- model spec cards ---------- */
  const MODELS = [
    { payload: 6, reach: 900, repeat: .02, weight: 32 },
    { payload: 12, reach: 1450, repeat: .03, weight: 64 },
    { payload: 25, reach: 1850, repeat: .04, weight: 138 }
  ];
  const cards = $$('.model');
  cards.forEach((card, i) => {
    const M = MODELS[i], bars = card.querySelector('.bars');
    [['Payload', M.payload + ' kg', M.payload / 25], ['Reach', M.reach.toLocaleString() + ' mm', M.reach / 1850], ['Repeatability', '±' + M.repeat + ' mm', .02 / M.repeat], ['Arm weight', M.weight + ' kg', M.weight / 138]].forEach(([k, v, f]) => {
      const b = document.createElement('div'); b.className = 'bar';
      const l = document.createElement('div'); l.className = 'bl';
      const s = document.createElement('span'); s.textContent = k; const vb = document.createElement('b'); vb.textContent = v; l.append(s, vb);
      const t = document.createElement('div'); t.className = 'bt'; const fill = document.createElement('i'); fill.dataset.w = (f * 100).toFixed(1); t.append(fill);
      b.append(l, t); bars.append(b);
    });
    card.addEventListener('click', () => {
      cards.forEach(c => c.setAttribute('aria-pressed', String(c === card)));
      const spec = $$('.hero-spec b');
      spec[0].textContent = '±' + M.repeat; spec[1].textContent = M.payload + ' kg'; spec[2].textContent = M.reach.toLocaleString();
    });
  });
  const fillBars = () => $$('.bar .bt i').forEach(i => { i.style.width = i.dataset.w + '%'; });

  /* ---------- GSAP ---------- */
  if (!hasGsap) { fillBars(); $$('.rv').forEach(n => { n.style.opacity = 1; n.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (reduced) { fillBars(); gsap.set('.rv', { opacity: 1, y: 0 }); render(1); return; }

  gsap.ticker.add((t, dt) => spin(dt / 1000));
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = document.querySelector(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: id === '#assembly' ? 0 : -60 });
    }));
  }

  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero h1 .ln > span', { yPercent: 110, duration: 1.2, stagger: .12 })
    .from('#heroPanel', { clipPath: 'inset(50% 0 50% 0)', duration: 1.4, ease: 'expo.inOut' }, .1)
    .from('#heroPanel img', { scale: 1.25, duration: 2 }, .3)
    .from('.rv-h', { y: 24, opacity: 0, duration: .9, stagger: .1 }, .5);

  const mm = gsap.matchMedia();
  mm.add('(min-width: 981px)', () => {
    // desktop: pin the assembly and let scroll pull it apart
    ScrollTrigger.create({ trigger: '#assembly', start: 'top top', end: '+=1600', pin: true, scrub: true, anticipatePin: 1,
      onUpdate: self => render(Math.min(1, self.progress * 1.25)) });
  });
  mm.add('(max-width: 980px)', () => {
    ScrollTrigger.create({ trigger: '#assembly', start: 'top 75%', end: 'bottom 70%', scrub: true,
      onUpdate: self => render(self.progress) });
  });

  ScrollTrigger.create({ trigger: '#models', start: 'top 70%', once: true, onEnter: () => gsap.to('.bar .bt i', { width: (i, t) => t.dataset.w + '%', duration: 1.2, stagger: .05, ease: 'power3.out' }) });
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .1 }) });
})();
