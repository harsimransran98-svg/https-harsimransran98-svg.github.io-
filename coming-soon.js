/* ==================================================================
   Bazozo coming-soon page: ?topic= detection, pre-filled demo CTAs,
   and an interactive blueprint gear loader (drag / wheel / idle spin).
   Zero inline scripts; all text goes in through textContent.
   ================================================================== */
(() => {
  if(window.top !== window.self){ try { window.top.location.replace(window.self.location.href); } catch(e){ document.documentElement.style.display = 'none'; } }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVGNS = 'http://www.w3.org/2000/svg';
  const $ = id => document.getElementById(id);
  $('csYear').textContent = new Date().getFullYear();

  /* ---------- topic from the URL (sanitised, text only) ---------- */
  const raw = new URLSearchParams(location.search).get('topic') || '';
  const topic = raw.replace(/[^A-Za-z0-9 &/+.,'()\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 48) || 'Next Build';
  $('csTopic').textContent = topic;
  $('csSpecStack').textContent = topic;
  document.title = `${topic} Showcase — Launching Soon · Bazozo`;
  $('csLede').textContent = `We're engineering a public ${topic} showcase right now. Want to see the work before it ships? Ask for a private walkthrough with live builds, code structure and performance numbers.`;

  const msg = `Hi Bazozo, I'd like a private demo of your ${topic} work.`;
  $('csWa').href = `https://wa.me/917347500770?text=${encodeURIComponent(msg)}`;
  $('csMail').href = `mailto:hello@bazozo.in?subject=${encodeURIComponent('Private demo request: ' + topic)}&body=${encodeURIComponent(msg + '\n\nProject / company:\nWhat we want to build:\n')}`;

  /* back buttons: return to the exact homepage the visitor came from when possible */
  const fromHome = document.referrer && new URL(document.referrer, location.href).origin === location.origin;
  ['backTop', 'backBottom'].forEach(id => $(id).addEventListener('click', e => { if(fromHome && history.length > 1){ e.preventDefault(); history.back(); } }));

  /* ---------- gear-toggle menu ---------- */
  const btn = $('csMenuBtn'), menu = $('csMenu'), label = $('csMenuLabel');
  let open = false;
  const setMenu = o => {
    open = o; btn.setAttribute('aria-expanded', String(o)); btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    label.textContent = o ? 'Close' : 'Index'; document.documentElement.classList.toggle('cs-menu-open', o);
    menu.setAttribute('aria-hidden', String(!o)); o ? menu.removeAttribute('inert') : menu.setAttribute('inert', '');
  };
  btn.addEventListener('click', () => setMenu(!open));
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && open){ setMenu(false); btn.focus(); } });

  /* ---------- blueprint gear train ---------- */
  const svg = $('csRig');
  const el = (tag, attrs, parent) => { const n = document.createElementNS(SVGNS, tag); for(const k in attrs) n.setAttribute(k, attrs[k]); (parent || svg).append(n); return n; };
  function gearPath(cx, cy, r, n, phase, hub, spokes){
    const step = 2 * Math.PI / n, m = 2 * r / n, ro = r + m * 0.95, ri = r - m * 1.15;
    const P = (R, a) => (cx + R * Math.cos(a)).toFixed(2) + ' ' + (cy + R * Math.sin(a)).toFixed(2);
    let d = '';
    for(let i = 0; i < n; i++){
      const a = phase + i * step;
      [[ri, a - step * 0.5], [ri, a - step * 0.29], [ro, a - step * 0.15], [ro, a + step * 0.15], [ri, a + step * 0.29]].forEach(([R, A], k) => { d += (i === 0 && k === 0 ? 'M' : 'L') + P(R, A); });
    }
    const hole = (hx, hy, hr) => `M${(hx + hr).toFixed(2)} ${hy.toFixed(2)}A${hr} ${hr} 0 1 0 ${(hx - hr).toFixed(2)} ${hy.toFixed(2)}A${hr} ${hr} 0 1 0 ${(hx + hr).toFixed(2)} ${hy.toFixed(2)}Z`;
    d += 'Z' + hole(cx, cy, hub);
    for(let k = 0; k < spokes; k++){ const a = phase + k * 2 * Math.PI / spokes; d += hole(cx + Math.cos(a) * r * 0.56, cy + Math.sin(a) * r * 0.56, +(r * 0.16).toFixed(2)); }
    return d;
  }

  // blueprint layer: grid, dimension lines, progress ring
  const defs = el('defs', {});
  const pat = el('pattern', { id:'csGrid', width:20, height:20, patternUnits:'userSpaceOnUse' }, defs);
  el('path', { d:'M20 0H0V20', class:'bp-grid' }, pat);
  el('rect', { x:0, y:0, width:420, height:420, fill:'url(#csGrid)', class:'bp-bed' });
  el('circle', { cx:210, cy:210, r:196, class:'bp-ring-bg' });
  const ring = el('circle', { cx:210, cy:210, r:196, class:'bp-ring', pathLength:100 });
  for(let i = 0; i < 60; i++){ const a = i * 6 * Math.PI / 180, r1 = i % 5 ? 186 : 180; el('line', { x1:(210 + Math.cos(a) * r1).toFixed(1), y1:(210 + Math.sin(a) * r1).toFixed(1), x2:(210 + Math.cos(a) * 190).toFixed(1), y2:(210 + Math.sin(a) * 190).toFixed(1), class:'bp-tick' }); }

  const pitch = 2 * Math.PI * 70 / 24, rad = n => n * pitch / (2 * Math.PI), step = n => 2 * Math.PI / n;
  const A = { cx:180, cy:212, n:24, r:rad(24), phase:0, k:1, hub:10, spokes:6, cls:'bp-gear main' };
  const gears = [A];
  function mesh(parent, n, dir, cls, spokes){
    const r = rad(n), sp = step(parent.n), sc = step(n);
    const delta = (((dir - parent.phase) % sp) + sp) % sp;
    const g = { n, r, cx: parent.cx + Math.cos(dir) * (parent.r + r), cy: parent.cy + Math.sin(dir) * (parent.r + r),
      phase: dir + Math.PI + delta * parent.r / r + sc / 2, k: -parent.k * parent.r / r, hub: 6, spokes, cls };
    gears.push(g); return g;
  }
  const B = mesh(A, 14, -0.42, 'bp-gear', 0);
  mesh(B, 10, -1.55, 'bp-gear alt', 0);
  mesh(A, 12, 1.15, 'bp-gear alt', 0);

  gears.forEach(g => el('circle', { cx:g.cx.toFixed(1), cy:g.cy.toFixed(1), r:g.r.toFixed(1), class:'bp-pitch' }));
  // dimension callout on the main gear
  el('path', { d:`M${A.cx - A.r} ${A.cy + A.r + 22}H${A.cx + A.r}M${A.cx - A.r} ${A.cy + A.r + 16}v12M${A.cx + A.r} ${A.cy + A.r + 16}v12`, class:'bp-dim' });
  const dimT = el('text', { x:A.cx, y:A.cy + A.r + 38, class:'bp-txt', 'text-anchor':'middle' }); dimT.textContent = `Ø ${(A.r * 2).toFixed(0)} · 24T`;
  const gearEls = gears.map(g => el('path', { d:gearPath(g.cx, g.cy, g.r, g.n, g.phase, g.hub, g.spokes), class:g.cls, 'fill-rule':'evenodd' }));
  gears.forEach(g => el('circle', { cx:g.cx.toFixed(1), cy:g.cy.toFixed(1), r:3.2, class:'bp-axle' }));
  const topicT = el('text', { x:210, y:34, class:'bp-txt lg', 'text-anchor':'middle' }); topicT.textContent = topic.toUpperCase() + ' · REV 0.7';

  // drive state: angle (radians) of the main gear
  let angle = 0, vel = reduced ? 0 : 0.6, dragging = false, lastA = 0;
  const pct = $('csPct');
  let progress = 0;
  function render(){
    gears.forEach((g, i) => gearEls[i].setAttribute('transform', `rotate(${(g.k * angle * 180 / Math.PI).toFixed(2)} ${g.cx.toFixed(2)} ${g.cy.toFixed(2)})`));
    const p = Math.min(0.94, 0.55 + Math.abs(Math.sin(angle * 0.08)) * 0.39);
    progress += (p - progress) * 0.08;
    ring.setAttribute('stroke-dashoffset', (100 - progress * 100).toFixed(2));
    const t = String(Math.round(progress * 100)).padStart(2, '0') + '%';
    if(pct.textContent !== t) pct.textContent = t;
  }
  let last = performance.now();
  function loop(now){
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if(!dragging){ angle += vel * dt; vel += ((reduced ? 0 : 0.6) - vel) * Math.min(1, dt * 1.6); }
    render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // drag: the main gear follows the pointer's angle around its axle
  const toLocal = e => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 420, (e.clientY - r.top) / r.height * 420]; };
  const ptrAngle = e => { const [x, y] = toLocal(e); return Math.atan2(y - A.cy, x - A.cx); };
  svg.addEventListener('pointerdown', e => { dragging = true; lastA = ptrAngle(e); svg.setPointerCapture(e.pointerId); svg.classList.add('is-drag'); });
  svg.addEventListener('pointermove', e => {
    if(!dragging) return;
    const a = ptrAngle(e); let d = a - lastA;
    if(d > Math.PI) d -= 2 * Math.PI; if(d < -Math.PI) d += 2 * Math.PI;
    angle += d; vel = d * 60; lastA = a;
  });
  const end = () => { dragging = false; svg.classList.remove('is-drag'); };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  svg.addEventListener('wheel', e => { e.preventDefault(); vel += Math.sign(e.deltaY) * 1.4; }, { passive:false });
  svg.addEventListener('keydown', e => { if(e.key === 'ArrowRight' || e.key === 'ArrowLeft'){ e.preventDefault(); vel += e.key === 'ArrowRight' ? 2 : -2; } });
  svg.setAttribute('tabindex', '0');

  /* ---------- entrance ---------- */
  if(window.gsap && !reduced){
    gsap.timeline({ defaults:{ ease:'power3.out' } })
      .from('.cs-kicker', { opacity:0, y:14, duration:0.6 })
      .from('.cs-topic', { yPercent:100, opacity:0, duration:0.9 }, '-=0.3')
      .from('.cs-sub', { opacity:0, x:-20, duration:0.7 }, '-=0.5')
      .from(['.cs-lede', '.cs-cta', '.cs-back-lg', '.cs-spec'], { opacity:0, y:20, duration:0.7, stagger:0.08 }, '-=0.4')
      .from('.cs-loader', { opacity:0, scale:0.92, rotation:-6, duration:1.1 }, 0.2);
    if(window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  }
  if(window.Lenis && !reduced){
    const lenis = new Lenis({ autoRaf:true, smoothWheel:true });
    svg.addEventListener('pointerenter', () => lenis.stop());
    svg.addEventListener('pointerleave', () => lenis.start());
  }
})();
