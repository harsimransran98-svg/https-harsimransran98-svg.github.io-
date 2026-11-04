/* Nordlys Arkitekter — live demo build (Bazozo Studio) */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  $('#year').textContent = new Date().getFullYear();

  function svg(tag, attrs, parent, text) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.append(n);
    return n;
  }

  /* ---------- nav + crosshair menu ---------- */
  const nav = $('#nav'), btn = $('#menuBtn'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('on-dark', open);
    if (open) {
      menu.hidden = false; void menu.offsetWidth; menu.classList.add('open');
      if (hasGsap && !reduced) gsap.fromTo('.menu li a', { yPercent: 110 }, { yPercent: 0, duration: .9, stagger: .07, ease: 'expo.out', delay: .25 });
    } else {
      menu.classList.remove('open');
      setTimeout(() => { if (!menu.classList.contains('open')) menu.hidden = true; }, 900);
    }
  }
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });

  /* ---------- the building: elevation levels, plans, wall build-ups ---------- */
  const SCALE = 0.0036; // plan units² → m²
  const LEVELS = [
    { tag: 'L0 Plinth', name: 'Plinth', y: 380, h: 40, rl: '+0.0',
      wins: [[96, 394, 30, 12], [300, 394, 30, 12]],
      rooms: [[40, 40, 120, 110, 'Plant room'], [160, 40, 100, 110, 'Bike store'], [260, 40, 80, 110, 'Stair core'], [40, 150, 300, 100, 'Storage & services']],
      light: [[110, 50], [300, 50]], structure: true,
      buildup: { title: 'Plinth wall', note: 'Board-marked concrete, insulated on the outside so the thermal mass stays inside.', layers: [['m-conc', 300, 'Concrete'], ['m-ins', 150, 'XPS insulation'], ['m-air', 25, 'Drainage gap']] } },
    { tag: 'L1 Ground', name: 'Ground floor', y: 300, h: 80, rl: '+3.2',
      wins: [[86, 320, 40, 44], [146, 320, 40, 44], [236, 320, 40, 44], [296, 320, 40, 44]],
      rooms: [[40, 40, 170, 130, 'Workshop'], [210, 40, 130, 90, 'Café'], [210, 130, 80, 40, 'WC'], [290, 130, 50, 120, 'Stair'], [40, 170, 250, 80, 'Entrance hall']],
      light: [[106, 150], [166, 150], [256, 150]], structure: true,
      buildup: { title: 'Timber wall, ground floor', note: 'Cross-laminated timber carries the load; wood-fibre insulation and a ventilated birch rainscreen keep it dry.', layers: [['m-clad', 22, 'Birch cladding'], ['m-air', 36, 'Vent. cavity'], ['m-ins', 240, 'Wood-fibre'], ['m-clt', 120, 'CLT'], ['m-gyp', 13, 'Gypsum']] } },
    { tag: 'L2 First', name: 'First floor', y: 220, h: 80, rl: '+6.4',
      wins: [[86, 240, 40, 44], [146, 240, 40, 44], [236, 240, 40, 44], [296, 240, 40, 44]],
      rooms: [[40, 40, 125, 120, 'Studio A'], [165, 40, 125, 120, 'Studio B'], [290, 40, 50, 210, 'Stair'], [40, 160, 150, 90, 'Meeting'], [190, 160, 100, 90, 'Kitchenette']],
      light: [[106, 170], [166, 170], [256, 170]], structure: true,
      buildup: { title: 'Timber wall, first floor', note: 'Same build-up as below, with a thinner CLT panel because it carries less load.', layers: [['m-clad', 22, 'Birch cladding'], ['m-air', 36, 'Vent. cavity'], ['m-ins', 240, 'Wood-fibre'], ['m-clt', 100, 'CLT'], ['m-gyp', 13, 'Gypsum']] } },
    { tag: 'L3 Loft', name: 'Loft gallery', y: 180, h: 40, rl: '+9.6', roof: true,
      wins: [[196, 150, 28, 22]],
      rooms: [[40, 40, 250, 210, 'Gallery'], [290, 40, 50, 120, 'Stair'], [290, 160, 50, 90, 'Archive']],
      light: [[90, 210], [165, 210], [240, 210]], roofLights: [[90, 110], [165, 110], [240, 110]], structure: true,
      buildup: { title: 'Roof build-up', note: 'The loft is lit from three roof lights, so the roof carries the thickest insulation in the building.', layers: [['m-clad', 22, 'Birch roof boards'], ['m-air', 50, 'Vent. cavity'], ['m-ins', 300, 'Wood-fibre'], ['m-clt', 100, 'CLT'], ['m-gyp', 13, 'Gypsum']] } }
  ];

  /* elevation */
  const levelsG = $('#levels'), dims = $('#dims');
  const groups = LEVELS.map((L, i) => {
    const g = svg('g', { class: 'lvl', tabindex: '0', role: 'button', 'aria-label': `${L.name}: show plan and wall build-up`, 'data-i': i }, levelsG);
    if (L.roof) svg('path', { class: 'face', d: `M70 ${L.y + L.h} L70 ${L.y} L210 90 L350 ${L.y} L350 ${L.y + L.h} Z` }, g);
    else svg('rect', { class: 'face', x: 70, y: L.y, width: 280, height: L.h }, g);
    L.wins.forEach(([x, y, w, h]) => svg('rect', { class: 'win', x, y, width: w, height: h }, g));
    if (L.roofLights) [[110, 150], [196, 118], [282, 150]].forEach(([x, y]) => svg('rect', { class: 'win', x: x - 2, y, width: 22, height: 8, transform: `rotate(${x < 200 ? -33 : x > 220 ? 33 : 0} ${x} ${y})` }, g));
    svg('text', { class: 'tag', x: 358, y: L.y + L.h / 2 + 3 }, g, L.tag);
    return g;
  });
  // levels above the plinth get the floor-line rhythm; dimension string on the left
  svg('line', { class: 'dim', x1: 44, y1: 90, x2: 44, y2: 420 }, dims);
  [[420, '+0.0'], [380, '+1.2'], [300, '+4.4'], [220, '+7.6'], [180, '+9.6'], [90, '+14.2']].forEach(([y, t]) => {
    svg('line', { class: 'dim', x1: 38, y1: y, x2: 50, y2: y }, dims);
    svg('text', { class: 'dim-t', x: 34, y: y + 3, 'text-anchor': 'end' }, dims, t);
  });

  /* plan */
  const roomsG = $('#planRooms'), ovL = $('#ovLight'), ovS = $('#ovStructure'), ovV = $('#ovServices');
  const planTitle = $('#planTitle'), planArea = $('#planArea');
  function drawPlan(L) {
    [roomsG, ovL, ovS, ovV].forEach(g => g.replaceChildren());
    let total = 0;
    L.rooms.forEach(([x, y, w, h, label]) => {
      const area = Math.round(w * h * SCALE);
      total += area;
      const g = svg('g', { class: 'room' }, roomsG);
      svg('rect', { class: 'plan-room', x, y, width: w, height: h }, g);
      svg('text', { class: 'plan-label', x: x + w / 2, y: y + h / 2, 'text-anchor': 'middle' }, g, label);
      svg('text', { class: 'plan-area', x: x + w / 2, y: y + h / 2 + 13, 'text-anchor': 'middle' }, g, area + ' m²');
    });
    svg('rect', { class: 'plan-wall', x: 40, y: 40, width: 300, height: 210 }, roomsG);
    // south windows as gaps in the wall
    L.light.forEach(([x]) => svg('rect', { x: x - 16, y: 246, width: 32, height: 8, fill: '#EAE6DF', stroke: '#141413', 'stroke-width': .8 }, roomsG));
    // daylight wedges from the south (and roof lights in the loft)
    L.light.forEach(([x, depth]) => svg('path', { d: `M${x - 16} 250 L${x + 16} 250 L${x + 46} ${250 - depth} L${x - 46} ${250 - depth} Z` }, ovL));
    (L.roofLights || []).forEach(([x, r]) => svg('circle', { cx: x, cy: 145, r: r / 3.2, fill: 'url(#sun)' }, ovL));
    // structural grid: glulam columns every 6 m
    for (let gx = 40; gx <= 340; gx += 75) svg('line', { x1: gx, y1: 30, x2: gx, y2: 260 }, ovS);
    for (const gy of [40, 145, 250]) { svg('line', { x1: 30, y1: gy, x2: 350, y2: gy }, ovS); for (let gx = 40; gx <= 340; gx += 75) svg('circle', { cx: gx, cy: gy, r: 4 }, ovS); }
    // services: riser from the stair core, branches to each room
    const core = L.rooms.find(r => /Stair/.test(r[4])) || L.rooms[0];
    const cx = core[0] + core[2] / 2, cy = core[1] + 16;
    L.rooms.filter(r => r !== core).forEach(([x, y, w, h]) => svg('path', { d: `M${cx} ${cy} L${cx} ${y + h / 2} L${x + w / 2} ${y + h / 2}` }, ovV));
    svg('circle', { cx, cy, r: 5, fill: 'none', stroke: '#B2532F', 'stroke-width': 1.6 }, ovV);
    planTitle.textContent = 'Plan — ' + L.name;
    planArea.textContent = total + ' m² · RL ' + L.rl;
    applyLayers();
    if (hasGsap && !reduced) gsap.from(roomsG.querySelectorAll('.room'), { opacity: 0, scale: .94, transformOrigin: '50% 50%', duration: .5, stagger: .05, ease: 'power3.out' });
  }

  /* wall build-up strip */
  const buName = $('#buName'), buNote = $('#buNote'), buStack = $('#buStack'), buKey = $('#buKey');
  function drawBuildup(B) {
    buName.textContent = B.title; buNote.textContent = B.note;
    buStack.replaceChildren(); buKey.replaceChildren();
    const sum = B.layers.reduce((s, l) => s + l[1], 0);
    B.layers.forEach(([cls, mm, label]) => {
      const s = document.createElement('span'); s.className = cls; s.style.width = (mm / sum * 100) + '%'; s.title = `${label}, ${mm} mm`;
      buStack.append(s);
      const k = document.createElement('span'); const b = document.createElement('b'); b.textContent = mm + ' mm';
      k.append(b, document.createTextNode(' ' + label)); buKey.append(k);
    });
    const tot = document.createElement('span'); const tb = document.createElement('b'); tb.textContent = sum + ' mm'; tot.append(tb, document.createTextNode(' total'));
    buKey.append(tot);
    if (hasGsap && !reduced) gsap.from(buStack.children, { scaleX: 0, transformOrigin: 'left', duration: .6, stagger: .06, ease: 'power3.out' });
  }

  /* layer toggles */
  const layerEls = { structure: ovS, services: ovV, light: ovL };
  function applyLayers() {
    $$('.chip').forEach(c => { layerEls[c.dataset.layer].style.display = c.getAttribute('aria-pressed') === 'true' ? '' : 'none'; });
  }
  $$('.chip').forEach(c => c.addEventListener('click', () => {
    c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'));
    applyLayers();
    const g = layerEls[c.dataset.layer];
    if (hasGsap && !reduced && g.style.display !== 'none') gsap.from(g.children, { opacity: 0, duration: .4, stagger: .01 });
  }));

  /* selecting a level lifts every level above it, like pulling a model apart */
  let current = -1;
  function select(i) {
    if (i === current) return;
    current = i;
    groups.forEach((g, j) => {
      g.classList.toggle('sel', j === i);
      g.setAttribute('aria-pressed', String(j === i));
      const lift = j > i ? -38 - (j - i) * 6 : 0;
      if (hasGsap && !reduced) gsap.to(g, { y: lift, duration: .8, ease: 'expo.out' });
      else g.setAttribute('transform', `translate(0 ${lift})`);
    });
    drawPlan(LEVELS[i]); drawBuildup(LEVELS[i].buildup);
  }
  groups.forEach((g, i) => {
    g.addEventListener('click', () => select(i));
    g.addEventListener('mouseenter', () => { if (window.matchMedia('(hover:hover)').matches) select(i); });
    g.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); }
      if (e.key === 'ArrowUp' && i < groups.length - 1) { groups[i + 1].focus(); select(i + 1); }
      if (e.key === 'ArrowDown' && i > 0) { groups[i - 1].focus(); select(i - 1); }
    });
  });
  select(1);

  /* ---------- GSAP: smooth scroll, curtains, reveals ---------- */
  if (!hasGsap) { $$('.rv').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }); $$('.curtain, .pc').forEach(c => c.remove()); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (reduced) { gsap.set('.rv', { opacity: 1, y: 0 }); return; }

  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.3, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = document.querySelector(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -40 });
    }));
  }

  // hero: headline rises, image curtains part
  gsap.timeline({ defaults: { ease: 'expo.inOut' } })
    .from('.hero h1 .ln > span', { yPercent: 110, duration: 1.3, stagger: .1, ease: 'expo.out' })
    .to('#heroFig .curtain.l', { xPercent: -101, duration: 1.4 }, .3)
    .to('#heroFig .curtain.r', { xPercent: 101, duration: 1.4 }, .3)
    .from('#heroFig img', { scale: 1.3, duration: 2, ease: 'expo.out' }, .5)
    .from('.rv-h, .fig-cap', { y: 24, opacity: 0, duration: 1, stagger: .1, ease: 'power3.out' }, .7);
  gsap.to('#heroFig img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '#heroFig', start: 'top 60%', end: 'bottom top', scrub: true } });

  // project images: curtains open as you scroll in, image drifts inside its frame
  $$('.proj figure').forEach(fig => {
    const img = fig.querySelector('img');
    gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 88%', end: 'top 30%', scrub: 1 } })
      .to(fig.querySelector('.pc.l'), { xPercent: -101, ease: 'none' }, 0)
      .to(fig.querySelector('.pc.r'), { xPercent: 101, ease: 'none' }, 0)
      .fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'none' }, 0);
    gsap.fromTo(img, { yPercent: -12 }, { yPercent: -2, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .1 }) });
})();
