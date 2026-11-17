/* ==================================================================
   Bazozo studio ad: 48 beats at 161 BPM (17.89 s).
   One paused GSAP master timeline is driven by a beat clock. With the
   beat unmuted the clock IS the AudioContext clock, so every cut lands
   on an exact multiple of 60/161 s. Zero inline scripts; all text is
   set with textContent.
   ================================================================== */
(() => {
  if(window.top !== window.self){ try { window.top.location.replace(window.self.location.href); } catch(e){ document.documentElement.style.display = 'none'; } }

  const BPM = 161, B = 60 / BPM, BEATS = 48, DUR = BEATS * B, SD = B / 4, STEPS = BEATS * 4;
  const bt = n => (n - 1) * B;                       // start time of beat n (1-based)
  const SCENES = [[1, 'Laptop Open', 'LAPTOP'], [9, 'Eye Zoom', 'EYE PORTAL'], [17, 'Graphic Design', 'GRAPHIC DESIGN'], [29, 'All 12 Services', '12 SERVICES'], [41, 'Bazozo CTA', 'BAZOZO CTA']];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, CustomEase);
  CustomEase.create('slam', 'M0,0 C0.1,0 0.2,1.25 0.45,1.08 0.6,0.98 0.8,1 1,1');   // hard hit with a small overshoot
  CustomEase.create('whip', 'M0,0 C0.75,0 0.1,1 1,1');

  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if(cls) n.className = cls; if(txt != null) n.textContent = txt; return n; };
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const rig = $('#camera-rig'), cam = $('#camera-stage'), shaker = $('#shaker'), over = $('#overlay'), fit = $('#fit');
  const director = $('.director');
  const EXPORT = new URLSearchParams(location.search).has('export');
  if(EXPORT) document.documentElement.classList.add('export');
  const state = { t: reduced ? DUR : 0, playing: !reduced && !EXPORT, loop: false, rate: 1, aspect: 'h', W: 1600, H: 900 };
  let tl = null, clips = [], ui = {}, lastNow = performance.now(), lastBeat = -1;

  /* ---------------- helpers used while building ---------------- */
  function ctr(node){ let x = node.offsetWidth / 2, y = node.offsetHeight / 2; while(node && node !== rig){ x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; } return { x, y }; }
  /* where a point of the footage frame lands on the stage under object-fit:cover */
  function coverPoint(v, fx, fy, col){
    const a = +v.dataset.a, px = +v.dataset.px, py = +v.dataset.py, H = state.H;
    const W = col ? state.W * col : state.W, x0 = (state.W - W) / 2;
    v.style.left = x0 + 'px'; v.style.width = W + 'px'; v.classList.toggle('is-col', !!col);
    v.style.objectPosition = `${px * 100}% ${py * 100}%`;
    if(W / H > a){ const dh = W / a; return { x: x0 + fx * W, y: (H - dh) * py + fy * dh }; }
    const dw = H * a; return { x: x0 + (W - dw) * px + fx * dw, y: fy * H };
  }
  const place = (nodes, p) => nodes.forEach(n => { n.style.left = p.x + 'px'; n.style.top = p.y + 'px'; });

  /* ---------------- generated scene content ---------------- */
  const DISCIPLINES = ['Websites', 'Graphics / Video Editing', 'Chrome Extensions', 'Firefox Add-ons', 'Safari Extensions', 'WordPress Plugins', 'Android Apps', 'iOS Apps', 'Windows Apps', 'macOS Apps', 'Android Games', 'iOS Games'];
  const SERVICES = ['SEO', 'Migration', 'Redesign', 'Performance', 'E-commerce', 'CMS', 'Landing Pages', 'UI/UX', 'Web Apps', 'API Integration', 'PWAs', 'Accessibility', 'Security', 'Analytics', 'CRO', 'Hosting', 'Maintenance', 'Localization', 'Modernization', 'Speed Audits'];
  const PANELS = ['UI/UX & Web Design', 'Motion Graphics & Video', 'Browser Extensions', 'Mobile & Desktop Apps', 'WordPress · Shopify · SEO · CRO', 'Playable Arcade Games'];

  function populate(){
    /* folder deliverables */
    const fc = $('#fCards', cam);
    const mkCard = (cls, label, fill) => { const c = el('div', 'fc ' + cls); fill(c); c.append(el('small', null, label)); fc.append(c); };
    mkCard('fc-poster', 'Poster 01', c => c.append(el('b', null, 'B')));
    mkCard('fc-type', 'Type specimen', c => c.append(el('b', null, 'Aa'), el('em', null, 'Unbounded 900 / Plus Jakarta Sans')));
    mkCard('fc-sw', '', c => ['#CCFF00', '#FF2A85', '#00F0FF'].forEach(h => c.append(el('i', null, h))));
    mkCard('fc-social', 'Social ad kit', c => c.append(el('i'), el('i'), el('i')));
    mkCard('fc-pack', '3D packaging', c => c.append(el('i')));

    /* tickers: 12 disciplines + 20 services */
    DISCIPLINES.concat(DISCIPLINES).forEach(d => $('#tickA', cam).append(el('span', null, d)));
    SERVICES.concat(SERVICES).forEach(s => $('#tickB', cam).append(el('span', null, s)));
    PANELS.forEach(p => $('#s4Titles', cam).append(el('b', null, p)));

    const wrap = $('#s4Panels', cam);
    const panel = cls => { const p = el('div', 'bp ' + cls); wrap.append(p); return p; };
    /* 1 web */
    const p1 = panel('p-web');
    [['Verano', 'veranostudio'], ['Aether Labs', 'aetherlabs'], ['Kettle & Ash', 'kettleash']].forEach(([n, s]) => {
      const w = el('div', 'wb'), bar = el('div', 'wb-bar'), view = el('div', 'wb-view'), img = new Image();
      bar.append(el('i'), el('i'), el('i'), document.createTextNode(n));
      img.alt = ''; img.decoding = 'async'; img.src = `../../images/preview/${s}.webp`;
      view.append(img); w.append(bar, view); p1.append(w);
    });
    p1.append(el('div', 'badge', '95+ Core Web Vitals'));
    /* 2 motion */
    const p2 = panel('p-motion'), wheels = el('div', 'wheels'), tracks = el('div', 'tracks');
    ['LIFT', 'GAMMA', 'GAIN'].forEach(n => { const w = el('div', 'wheel'); w.append(el('i'), el('small', null, n)); wheels.append(w); });
    [[[2, 30], [36, 22], [62, 34]], [[8, 44], [56, 38]], [[0, 18], [22, 40], [66, 30]]].forEach(row => { const t = el('div', 'trk'); row.forEach(([l, w]) => { const c = el('i'); c.style.left = l + '%'; c.style.width = w + '%'; t.append(c); }); tracks.append(t); });
    tracks.append(el('span', 'ph'));
    p2.append(wheels, tracks, el('div', 'badge', '60 FPS · 4K grade'));
    /* 3 extensions */
    const p3 = panel('p-ext');
    [['Chrome', '#4c8dff', 'PriceEcho'], ['Firefox', '#ff7a3d', 'PrivacyLatch'], ['Safari', '#19c8ff', 'TabCompass']].forEach(([n, k, app]) => {
      const x = el('div', 'ext'); x.style.setProperty('--k', k);
      const bar = el('div', 'ext-bar'); bar.append(document.createTextNode(n), el('em'), el('b', null, '✦'));
      const page = el('div', 'ext-page'); [80, 95, 70, 88, 60, 92].forEach(w => { const l = el('i'); l.style.width = w + '%'; page.append(l); });
      const pop = el('div', 'ext-pop'); pop.append(el('b', null, app));
      ['Enabled', 'Auto-run'].forEach((lab, i) => { const r = el('div', 'ext-row'), tg = el('span', 'tg' + (i ? '' : ' on')); tg.append(el('u')); r.append(document.createTextNode(lab), tg); pop.append(r); });
      x.append(bar, page, pop); p3.append(x);
    });
    p3.append(el('div', 'badge', 'Manifest V3'));
    /* 4 apps */
    const p4 = panel('p-apps'), orbit = el('div', 'orbit');
    [['ph-d', 'iPhone 16 Pro', '#CCFF00', '9:41'], ['ph-d', 'Pixel', '#00F0FF', '12:30'], ['win-d', 'macOS menu bar', '#FF2A85', '⌘K'], ['win-d', 'Windows 11', '#4c8dff', '— ▢ ✕']].forEach(([cls, name, k, st], i) => {
      const d = el('div', 'dev ' + cls); d.style.setProperty('--k', k); d.style.transform = `rotateY(${i * 90}deg) translateZ(220px) scale(1.04)`;
      const h = el('header'); h.append(el('span', null, name), el('span', null, st));
      d.append(h, el('div', 'hero', name.split(' ')[0] + ' app'), el('div', 'row'), el('div', 'row s'), el('div', 'row'));
      orbit.append(d);
    });
    p4.append(orbit, el('div', 'badge', 'iOS · Android · macOS · Windows'));
    /* 5 growth */
    const p5 = panel('p-grow'), top = el('div', 'grow-top'), num = el('div', 'grow-n', '+0%'), tags = el('div', 'grow-tags');
    num.append(el('small', null, 'Conversion'));
    ['WordPress', 'Shopify', 'SEO', 'CRO'].forEach(t => tags.append(el('span', null, t)));
    top.append(num, tags);
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'grow-svg'); svg.setAttribute('viewBox', '0 0 780 240'); svg.setAttribute('preserveAspectRatio', 'none');
    const mkS = (tag, a) => { const n = document.createElementNS(NS, tag); for(const k in a) n.setAttribute(k, a[k]); svg.append(n); return n; };
    mkS('path', { class: 'ax', d: 'M0 60H780M0 120H780M0 180H780' });
    const line = 'M0 220 L90 205 L170 212 L260 180 L340 188 L430 140 L510 150 L600 80 L680 92 L770 12';
    mkS('path', { class: 'ar', d: line + ' L770 240 L0 240Z' }); mkS('path', { class: 'ln', d: line, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }); mkS('circle', { class: 'tip', cx: 770, cy: 12, r: 11 });
    p5.append(top, svg);
    /* 6 games */
    const p6 = panel('p-game'), core = el('div', 'g-core'), hud = el('div', 'g-hud'), score = el('b', null, '000000');
    for(let i = 0; i < 20; i++) core.append(el('i', 'g-p'));
    hud.append(el('span', null, '60 FPS'), score);
    p6.append(el('i', 'g-floor'), hud, core, el('div', 'g-txt', 'COMBO ×12'), el('i', 'g-ship'));
  }

  /* ==================================================================
     build: fresh DOM + master timeline (re-run on aspect change)
     ================================================================== */
  function build(){
    if(tl) tl.kill();
    cam.replaceChildren($('#tplScenes').content.cloneNode(true));
    over.replaceChildren($('#tplOver').content.cloneNode(true));
    gsap.set([cam, shaker], { clearProps: 'all' }); gsap.set($('#invert'), { opacity: 0 });
    populate();
    const { W, H } = state, V = state.aspect === 'v';
    const s = n => $(`.sc[data-sc="${n}"]`, cam);
    const [s1, s2, s3, s4, s5] = [1, 2, 3, 4, 5].map(s);

    /* footage */
    /* each clip maps scene time -> footage time, so shots can be speed-ramped */
    const CLIP = {
      side:   { a: 0,      b: bt(3),  map: tr => 1.15 + tr * 1.8,                                   rate: () => 1.8 },   // hands lift the lid
      laptop: { a: bt(3),  b: bt(9),  map: tr => 0.5 + tr * 1.3,                                    rate: () => 1.3 },   // she turns the screen to camera
      eye:    { a: bt(9),  b: bt(17), map: tr => tr < 0.75 ? 0.45 + tr * 3 : 2.7 + (tr - 0.75) * 0.9, rate: tr => tr < 0.75 ? 3 : 0.9 }   // closed -> snaps open
    };
    clips = $$('video.clip', cam).map(v => {
      v.muted = true; v.addEventListener('error', () => v.classList.add('is-dead'), { once: true });
      v.src = 'https://videos.pexels.com/video-files/' + v.dataset.src;
      return { v, ...CLIP[v.dataset.role] };
    });
    const byRole = r => clips.find(c => c.v.dataset.role === r).v;
    if(V) byRole('side').dataset.px = '0.46';
    coverPoint(byRole('side'), 0.5, 0.5);
    const P1 = coverPoint(byRole('laptop'), 0.5, 0.46, V ? 0 : 0.5), P2 = coverPoint(byRole('eye'), 0.575, 0.53);
    place($$('.pt', s1), P1); place($$('.pt', s2), P2); place([$('#rings', over)], P2);

    tl = gsap.timeline({ paused: true });
    const show = (node, a, b) => { tl.set(node, { autoAlpha: 1 }, a); if(b < DUR) tl.set(node, { autoAlpha: 0 }, b); };
    const fW = $('.f-w', over), f1 = $('.f-1', over), f2 = $('.f-2', over), caM = $('.ca-m', over), caC = $('.ca-c', over), inv = $('#invert');
    const flash = (node, t, d = B * 0.9, peak = 0.9) => tl.fromTo(node, { opacity: peak }, { opacity: 0, duration: d, ease: 'power2.out', immediateRender: false }, t);
    const chroma = (t, d = B * 0.8) => { tl.fromTo(caM, { opacity: 0.75, x: -34 }, { opacity: 0, x: 0, duration: d, immediateRender: false }, t); tl.fromTo(caC, { opacity: 0.75, x: 34 }, { opacity: 0, x: 0, duration: d, immediateRender: false }, t); };
    const shake = (t, amp = 16) => tl.fromTo(shaker, { x: amp, y: -amp * 0.6 }, { keyframes: [{ x: -amp * 0.8, y: amp * 0.5 }, { x: amp * 0.5, y: -amp * 0.3 }, { x: -amp * 0.25, y: amp * 0.15 }, { x: 0, y: 0 }], duration: B * 0.7, ease: 'none', immediateRender: false }, t);
    /* vector cursor with neon trail */
    const cur = $('.cur', over), trail = $$('.trail i', over), ripple = $('.ripple', over);
    const curShow = (x, y, t) => { tl.set(cur, { x, y, opacity: 1, scale: 1 }, t); tl.set(trail, { x, y }, t); };
    const curTo = (p, t, d, dx = 0, dy = 0) => { const x = p.x + dx, y = p.y + dy; tl.to(cur, { x, y, duration: d, ease: 'whip' }, t); tl.to(trail, { x, y, duration: d, ease: 'whip', stagger: 0.03 }, t + 0.02); tl.fromTo(trail, { opacity: 0.95, scale: 1 }, { opacity: 0, scale: 0.3, duration: d + 0.25, stagger: 0.03, immediateRender: false }, t); return { x, y }; };
    const click = (p, t) => { tl.to(cur, { scale: 0.7, duration: 0.06, yoyo: true, repeat: 1 }, t - 0.06); tl.set(ripple, { x: p.x, y: p.y }, t); tl.fromTo(ripple, { scale: 0.3, opacity: 1 }, { scale: 2.6, opacity: 0, duration: B, ease: 'power2.out', immediateRender: false }, t); };
    const curHide = t => tl.to(cur, { opacity: 0, duration: 0.15 }, t);

    /* ---------- SCENE 1 · beats 1–8 · lid lifts -> cut -> screen dive ---------- */
    show(s1, 0, bt(9));
    const pill = $('.pill-launch', s1), side = byRole('side'), caps = $$('.cap1 b', s1);
    /* shot A (beats 1–2): side view, slow push while the lid lifts */
    tl.set(cam, { transformOrigin: '50% 55%', rotationX: 0, rotationY: 0, rotation: -2.5, x: 0, y: 0, scale: 1.18 }, 0)
      .to(cam, { scale: 1.42, rotation: 0, duration: 2 * B, ease: 'power2.in' }, 0);
    tl.set(caps[0], { autoAlpha: 1 }, 0).fromTo(caps[0], { scale: 2.6 }, { scale: 1, duration: B * 0.5, ease: 'slam', immediateRender: false }, 0).set(caps[0], { autoAlpha: 0 }, bt(3));
    /* cut on beat 3 to shot B: she turns the open screen to camera */
    tl.set(side, { autoAlpha: 0 }, bt(3)); flash(fW, bt(3), B * 0.5, 0.85); shake(bt(3), 16); chroma(bt(3), B * 0.6);
    tl.set(cam, { transformOrigin: `${P1.x}px ${P1.y}px`, rotation: 0, rotationX: 12, scale: 1.02 }, bt(3))
      .to(cam, { scale: 1.14, duration: 2.5 * B, ease: 'none' }, bt(3));
    tl.set(caps[1], { autoAlpha: 1 }, bt(3)).fromTo(caps[1], { scale: 2.6 }, { scale: 1, duration: B * 0.5, ease: 'slam', immediateRender: false }, bt(3)).to(caps[1], { autoAlpha: 0, y: 30, duration: 0.15 }, bt(4.6));
    tl.fromTo(pill, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: B * 0.7, ease: 'slam' }, bt(4));
    curShow(W * 0.94, H * 0.97, bt(3.6));
    const c1 = curTo(P1, bt(3.6), B * 1.4 - 0.04, 96, 8);
    click(c1, bt(5));
    tl.to(pill, { scale: 0.9, duration: 0.07, yoyo: true, repeat: 1 }, bt(5) - 0.03).to(pill, { scale: 1.3, autoAlpha: 0, duration: B * 1.4, ease: 'power2.in' }, bt(5.5));
    chroma(bt(5)); curHide(bt(5.7));
    /* dive straight into the laptop screen */
    tl.to(cam, { scale: V ? 9.5 : 12, rotationX: 0, duration: 3.5 * B, ease: 'expo.in' }, bt(5.5));
    tl.fromTo(fW, { opacity: 0 }, { opacity: 1, duration: B * 0.9, ease: 'power2.in', immediateRender: false }, bt(8.1));

    /* ---------- SCENE 2 · beats 9–16 · eye iris portal ---------- */
    show(s2, bt(9), bt(17));
    flash(fW, bt(9), B * 0.7, 1); shake(bt(9), 22); chroma(bt(9));
    tl.set(cam, { transformOrigin: `${P2.x}px ${P2.y}px`, rotationX: 0, rotation: 0, scale: 1.1 }, bt(9))
      .to(cam, { scale: 1.34, duration: 5 * B, ease: 'none' }, bt(9));
    const iris = $('.iris', s2);
    tl.fromTo(iris, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: B * 0.6, ease: 'slam' }, bt(10.6));
    tl.fromTo($('.iris-wheel', s2), { rotation: 0 }, { rotation: 540, duration: 8 * B, ease: 'none' }, bt(9))
      .fromTo($('.iris-ring.r1', s2), { rotation: 0 }, { rotation: -360, duration: 8 * B, ease: 'none' }, bt(9));
    for(let n = 12; n < 14; n++) tl.fromTo(iris, { scale: 1.16 }, { scale: 1, duration: B * 0.85, ease: 'power3.out', immediateRender: false }, bt(n));
    $$('.slam', s2).forEach((w, i) => {
      const t0 = bt(9 + i * 2), t1 = i < 2 ? bt(11 + i * 2) : bt(14.6);
      tl.set(w, { autoAlpha: 1 }, t0).fromTo(w, { scale: 3.4, rotation: i % 2 ? 5 : -5 }, { scale: 1, rotation: 0, duration: B * 0.55, ease: 'slam', immediateRender: false }, t0);
      if(i < 2) tl.set(w, { autoAlpha: 0 }, t1); else tl.to(w, { scale: 5, autoAlpha: 0, duration: B * 1.2, ease: 'power3.in' }, bt(14));
      if(i){ shake(t0, 14); chroma(t0, B * 0.6); }
    });
    /* tunnel zoom through the pupil: beats 14–16 */
    tl.to(cam, { scale: 42, rotation: 28, duration: 3 * B, ease: 'expo.in' }, bt(14))
      .to(iris, { opacity: 0, duration: B }, bt(15.5));
    const rings = $('#rings', over);
    tl.set(rings, { autoAlpha: 1 }, bt(14)).set(rings, { autoAlpha: 0 }, bt(17));
    $$('i', rings).forEach((r, i) => tl.fromTo(r, { scale: 0.1, opacity: 0.95 }, { scale: 14, opacity: 0, duration: B * 1.05, ease: 'power2.in', repeat: 2, immediateRender: false }, bt(14) + i * B * 0.17));
    tl.fromTo([caM, caC], { opacity: 0 }, { opacity: 0.8, duration: 3 * B, ease: 'power2.in', immediateRender: false }, bt(14))
      .fromTo(caM, { x: 0 }, { x: -60, duration: 3 * B, ease: 'power2.in', immediateRender: false }, bt(14))
      .fromTo(caC, { x: 0 }, { x: 60, duration: 3 * B, ease: 'power2.in', immediateRender: false }, bt(14));

    /* ---------- SCENE 3 · beats 17–28 · graphic design showcase ---------- */
    show(s3, bt(17), bt(29));
    tl.set([caM, caC], { opacity: 0, x: 0 }, bt(17));
    flash(f1, bt(17), B * 1.2, 1); shake(bt(17), 24);
    tl.set(cam, { transformOrigin: '50% 50%', rotation: 0, x: 0, y: 0, scale: 2.4 }, bt(17))
      .to(cam, { scale: 1, duration: B * 1.1, ease: 'expo.out' }, bt(17));
    const art = $('.artboard', s3), folder = $('.folder', s3), dock = $('.dock', s3), dk = $('#dkDesign', s3);
    tl.fromTo([$('.s3-title', s3), art, folder, dock], { y: 90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: B * 0.9, ease: 'slam', stagger: 0.05 }, bt(17) + 0.04);
    const dkP = ctr(dk), depP = ctr($('#deployBtn', s3));
    curShow(W * 0.9, H * 0.9, bt(17.2));
    const c3 = curTo(dkP, bt(17.2), B * 0.8 - 0.02, 20, 10);
    click(c3, bt(18));
    tl.set(dk, { attr: { class: 'dk lit' } }, bt(18)).fromTo(dk, { scale: 0.9 }, { scale: 1, duration: B * 0.6, ease: 'slam', immediateRender: false }, bt(18));
    curHide(bt(18.6));
    /* camera leans to the artboard, then whips to the folder */
    const lean = V ? { y: 230, scale: 1.2 } : { x: 190, scale: 1.3 }, lean2 = V ? { y: -330, scale: 1.2 } : { x: -210, scale: 1.3 };
    tl.to(cam, { ...lean, duration: B * 0.7, ease: 'whip' }, bt(18.3)).to(cam, { ...lean2, duration: B * 0.45, ease: 'whip' }, bt(20)).to(cam, { x: 0, y: 0, scale: 1, duration: B * 0.4, ease: 'whip' }, bt(22) - B * 0.4);
    /* bezier pen draws the mark, one stroke per beat; construction circles snap in */
    const mark = $('.mark', s3), pen = $('.pen', s3);
    gsap.set($$('.gold, .anchors rect, .mark-dot', s3), { scale: 0 });
    gsap.set(pen, { motionPath: { path: mark, align: mark, start: 0, end: 0 } });
    [[18.6, 0, 0.36], [19.4, 0.36, 1]].forEach(([n, a, b]) => {
      tl.fromTo(mark, { strokeDashoffset: 1 - a }, { strokeDashoffset: 1 - b, duration: B * 0.75, ease: 'power2.inOut', immediateRender: false }, bt(n));
      tl.to(pen, { motionPath: { path: mark, align: mark, start: a, end: b }, duration: B * 0.75, ease: 'power2.inOut' }, bt(n));
    });
    $$('.gold', s3).forEach((g, i) => tl.to(g, { scale: 1, duration: B * 0.5, ease: 'slam' }, bt(18.5 + i * 0.5)));
    $$('.anchors rect', s3).forEach((a, i) => tl.to(a, { scale: 1, duration: 0.18, ease: 'back.out(3)' }, bt(18.7 + i * 0.4)));
    tl.to($('.mark-dot', s3), { scale: 1, duration: B * 0.7, ease: 'elastic.out(1, 0.45)' }, bt(20) - 0.05);
    /* folder pops open and fans the deliverables */
    tl.to($('.f-front', s3), { rotationX: -32, duration: B * 0.5, ease: 'slam' }, bt(20));
    $$('.fc', s3).forEach((c, i) => {
      const k = i - 2;
      tl.fromTo(c, { y: 40, scale: 0.5, rotation: 0, x: 0, autoAlpha: 0 }, { y: -138 + Math.abs(k) * 30, x: k * 84, rotation: k * 16, scale: 1, autoAlpha: 1, duration: B * 0.7, ease: 'slam' }, bt(20.4) + i * B * 0.2);
      tl.to(c, { y: '-=18', duration: B * 0.25, yoyo: true, repeat: 1, ease: 'power2.out' }, bt(21.6) + i * 0.02);
    });
    /* copy slam */
    const sl = $$('.sl', s3), veil = $('.veil', s3), dep = $('#deployBtn', s3);
    const slam = (w, t) => tl.set(w, { autoAlpha: 1 }, t).fromTo(w, { scale: 3 }, { scale: 1, duration: B * 0.5, ease: 'slam', immediateRender: false }, t);
    tl.to(veil, { opacity: 1, duration: 0.12 }, bt(22) - 0.1);
    slam(sl[0], bt(22)); tl.set(sl[0], { autoAlpha: 0 }, bt(23));
    slam(sl[1], bt(23)); tl.set(sl[1], { autoAlpha: 0 }, bt(24));
    tl.set(inv, { opacity: 1 }, bt(23)).set(inv, { opacity: 0 }, bt(23.7)); shake(bt(23), 26);
    tl.set(sl[2], { y: V ? -70 : -86 }, 0); slam(sl[2], bt(24)); chroma(bt(24), B * 0.6);
    tl.set(sl[3], { y: V ? 30 : 42 }, 0); slam(sl[3], bt(26)); shake(bt(26), 14); flash(f1, bt(26), B * 0.5, 0.35);
    tl.fromTo(dep, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: B * 0.5, ease: 'slam' }, bt(27));
    curShow(W * 0.88, H * 0.94, bt(27));
    const c3b = curTo(depP, bt(27), B - 0.03, 40, 8);
    click(c3b, bt(28));
    tl.to(dep, { x: 8, y: 8, boxShadow: '0px 0px 0px #000', duration: 0.08 }, bt(28)); curHide(bt(28.5));
    tl.to(cam, { scale: 0.2, rotation: -12, duration: B * 0.5, ease: 'power3.in' }, bt(29) - B * 0.5);

    /* ---------- SCENE 4 · beats 29–40 · rapid-fire bento ---------- */
    show(s4, bt(29), bt(41));
    flash(f2, bt(29), B, 0.9); shake(bt(29), 20);
    tl.set(cam, { scale: 1, rotation: 0, x: 0, y: 0 }, bt(29));
    for(let n = 29; n <= 40; n++) tl.fromTo(cam, { scale: n % 2 ? 1.09 : 1.045, rotation: n % 2 ? 0 : (n % 4 ? 0.8 : -0.8) }, { scale: 1, rotation: 0, duration: B * 0.85, ease: 'power3.out', immediateRender: false }, bt(n));
    const tA = $('#tickA', s4), tB = $('#tickB', s4);
    tl.fromTo(tA, { x: 0 }, { x: -(tA.scrollWidth / 2), duration: 12 * B, ease: 'none', immediateRender: false }, bt(29))
      .fromTo(tB, { x: -(tB.scrollWidth / 2) }, { x: 0, duration: 12 * B, ease: 'none', immediateRender: false }, bt(29));
    const panels = $$('.bp', s4), titles = $$('#s4Titles b', s4);
    panels.forEach((p, i) => {
      const t0 = bt(29 + i * 2), t1 = t0 + 2 * B;
      tl.set([p, titles[i]], { autoAlpha: 1 }, t0)
        .fromTo(p, { rotationY: -78, x: 300, scale: 0.8 }, { rotationY: 0, x: 0, scale: 1, duration: B * 0.55, ease: 'slam', immediateRender: false }, t0)
        .fromTo(titles[i], { x: 60 }, { x: 0, duration: B * 0.5, ease: 'slam', immediateRender: false }, t0);
      if(i < 5){ tl.to(p, { rotationY: 70, x: -300, autoAlpha: 0, duration: 0.11, ease: 'power2.in' }, t1 - 0.11).set(titles[i], { autoAlpha: 0 }, t1); }
      if(i) chroma(t0, B * 0.45);
      const badge = $('.badge', p); if(badge) tl.fromTo(badge, { scale: 0, rotation: -10 }, { scale: 1, rotation: 0, duration: B * 0.5, ease: 'slam' }, t0 + B);
      accents[i](p, t0);
    });
    tl.to(panels[5], { scale: 1.6, autoAlpha: 0, duration: B * 0.4, ease: 'power3.in' }, bt(41) - B * 0.4);

    /* ---------- SCENE 5 · beats 41–48 · finale CTA ---------- */
    show(s5, bt(41), DUR + 1);
    flash(fW, bt(41), B * 1.1, 1); shake(bt(41), 22);
    tl.set(cam, { transformOrigin: '50% 50%', x: 0, y: 0, rotation: 0, scale: 3.6, rotationX: 26 }, bt(41))
      .to(cam, { scale: 1, rotationX: 0, duration: B * 2.4, ease: 'expo.out' }, bt(41));
    tl.fromTo($$('.grid3d i', s5), { backgroundPositionY: '0px' }, { backgroundPositionY: '420px', duration: 8 * B, ease: 'none', immediateRender: false }, bt(41));
    const cta = $('.cta', s5);
    tl.fromTo(cta, { scale: 0.3, rotationX: -50, autoAlpha: 0 }, { scale: 1, rotationX: 0, autoAlpha: 1, duration: B * 1.1, ease: 'slam' }, bt(42))
      .fromTo($('.cta-logo', s5), { letterSpacing: '0.3em' }, { letterSpacing: '-0.03em', duration: B * 1.4, ease: 'expo.out', immediateRender: false }, bt(42))
      .fromTo($$('.cta-sub, .cta-foot', s5), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: B * 0.6, stagger: B * 0.5 }, bt(43));
    $$('.cta-btns .cb, .cta-go .cb', s5).forEach((b, i) => tl.fromTo(b, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: B * 0.5, ease: 'slam' }, bt(43) + i * B * 0.5));
    const go = $('.cb.go', s5);
    for(let n = 46; n <= 48; n++) tl.fromTo(go, { scale: 1.1 }, { scale: 1, duration: B * 0.8, ease: 'power3.out', immediateRender: false }, bt(n));
    flash(f1, bt(45), B * 0.6, 0.3);
    tl.set({}, {}, DUR);

    ui = { idx: $('#s4Idx', s4), big: $('#s4Big', s4) };
    lastBeat = -1;
    frame(state.t);
  }

  /* per-panel accents for scene 4 (two beats each) */
  const accents = [
    (p, t) => $$('.wb-view img', p).forEach((img, i) => tl.fromTo(img, { yPercent: 0 }, { yPercent: -52 - i * 6, duration: 2 * B, ease: 'power1.inOut', immediateRender: false }, t)),
    (p, t) => {
      $$('.wheel', p).forEach((w, i) => { tl.fromTo(w, { rotation: 0 }, { rotation: 110, duration: B * 0.6, ease: 'slam', immediateRender: false }, t + i * 0.04).to(w, { rotation: 250, duration: B * 0.6, ease: 'slam' }, t + B + i * 0.04); });
      tl.fromTo($('.ph', p), { x: 0 }, { x: () => $('.tracks', p).clientWidth - 26, duration: 2 * B, ease: 'none', immediateRender: false }, t);
    },
    (p, t) => $$('.ext', p).forEach((x, i) => {
      const pop = $('.ext-pop', x), tg = $$('.tg', x)[1];
      tl.fromTo(pop, { scale: 0 }, { scale: 1, duration: B * 0.45, ease: 'slam' }, t + 0.06 + i * B * 0.3);
      tl.set(tg, { attr: { class: 'tg on' } }, t + B + i * B * 0.25).fromTo(pop, { y: -8 }, { y: 0, duration: B * 0.4, ease: 'slam', immediateRender: false }, t + B + i * B * 0.25);
    }),
    (p, t) => { const o = $('.orbit', p); tl.set(o, { rotationY: 0 }, t); [1, 2, 3].forEach(k => tl.to(o, { rotationY: -90 * k, duration: B * 0.42, ease: 'slam' }, t + k * B * 0.5)); },
    (p, t) => {
      const n = $('.grow-n', p).firstChild, c = { v: 0 };
      tl.fromTo($('.ln', p), { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: B * 1.5, ease: 'power2.in' }, t + 0.05);
      tl.fromTo($('.ar', p), { opacity: 0 }, { opacity: 1, duration: B }, t + B * 0.8);
      tl.fromTo($('.tip', p), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: B * 0.4, ease: 'back.out(3)' }, t + B * 1.5);
      tl.fromTo(c, { v: 0 }, { v: 312, duration: B * 1.5, ease: 'power2.in', immediateRender: false, onUpdate: () => { const s = '+' + Math.round(c.v) + '%'; if(n.nodeValue !== s) n.nodeValue = s; } }, t + 0.05);
      tl.fromTo($$('.grow-tags span', p), { scale: 0 }, { scale: 1, duration: B * 0.4, ease: 'slam', stagger: B * 0.25 }, t + 0.1);
    },
    (p, t) => {
      const sc = $('.g-hud b', p), c = { v: 0 }, txt = $('.g-txt', p);
      $$('.g-p', p).forEach((q, i) => { const a = i / 20 * Math.PI * 2, R = 190 + (i % 3) * 70; tl.fromTo(q, { x: 0, y: 0, scale: 0.2, opacity: 1 }, { x: Math.cos(a) * R, y: Math.sin(a) * R * 0.7, scale: 1.2, opacity: 0, duration: B * 0.95, ease: 'power3.out', immediateRender: false }, t + B); });
      tl.fromTo($('.g-ship', p), { x: -150 }, { x: 150, duration: B, ease: 'sine.inOut', yoyo: true, repeat: 1, immediateRender: false }, t);
      tl.fromTo(txt, { scale: 0 }, { scale: 1, duration: B * 0.5, ease: 'slam' }, t + B);
      tl.fromTo(c, { v: 0 }, { v: 128400, duration: 2 * B, ease: 'none', immediateRender: false, onUpdate: () => { sc.textContent = pad(Math.round(c.v), 6); } }, t);
    }
  ];

  /* ==================================================================
     161 BPM trap / phonk synth (Web Audio), scheduled on 1/16 steps
     ================================================================== */
  const audio = { ctx: null, on: false, t0: 0, next: 0, master: null, an: null, noiseBuf: null, bins: null };
  let exportFrame = false;
  /* builds the mix bus on any context, so the same synth can render live or offline */
  function makeGraph(ctx){
    const sr = ctx.sampleRate, G = v => { const g = ctx.createGain(); g.gain.value = v; return g; };
    const master = G(0.8), clip = ctx.createWaveShaper(), comp = ctx.createDynamicsCompressor(), an = ctx.createAnalyser();
    const cc = new Float32Array(2049); for(let i = 0; i < 2049; i++){ const x = i / 1024 - 1; cc[i] = Math.tanh(x * 1.7) / Math.tanh(1.7); }
    clip.curve = cc; clip.oversample = '2x';
    comp.threshold.value = -12; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.14;
    an.fftSize = 128; an.smoothingTimeConstant = 0.6;
    const outG = G(0.9); master.connect(clip); clip.connect(comp); comp.connect(outG); outG.connect(an); an.connect(ctx.destination);
    const drum = G(1), music = G(1), lead = G(1), rev = G(1), conv = ctx.createConvolver(), revOut = G(0.5), leadSend = G(0.3);
    drum.connect(master); music.connect(master); lead.connect(master); lead.connect(leadSend); leadSend.connect(rev);
    const ir = ctx.createBuffer(2, Math.floor(sr * 1.9), sr);
    for(let ch = 0; ch < 2; ch++){ const d = ir.getChannelData(ch), n = d.length; let lp = 0; for(let i = 0; i < n; i++){ lp += ((Math.random() * 2 - 1) - lp) * 0.35; d[i] = lp * Math.pow(1 - i / n, 2.6); } }
    conv.buffer = ir; rev.connect(conv); conv.connect(revOut); revOut.connect(master);
    const noiseBuf = ctx.createBuffer(1, sr, sr), d = noiseBuf.getChannelData(0);
    for(let i = 0; i < sr; i++) d[i] = Math.random() * 2 - 1;
    const curve = new Float32Array(1025); for(let i = 0; i < 1025; i++){ const x = i / 512 - 1; curve[i] = Math.tanh(x * 3.2); }
    return { ctx, master, drum, music, lead, rev, an, noiseBuf, curve, bins: new Uint8Array(an.frequencyBinCount) };
  }
  function initAudio(){
    const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return false;
    Object.assign(audio, makeGraph(new AC()));
    return true;
  }
  /* offline render of the whole beat -> 16-bit stereo WAV (base64), used by the MP4 export */
  async function renderAudio(){
    const sr = 48000, off = new OfflineAudioContext(2, Math.ceil((DUR + 1.6) * sr), sr), live = { ...audio };
    Object.assign(audio, makeGraph(off)); const ts = TS; TS = 1;
    for(let st = 0; st < STEPS; st++) scheduleStep(st, st * SD + 0.01);
    TS = ts;
    Object.keys(audio).forEach(k => { if(!(k in live)) delete audio[k]; }); Object.assign(audio, live);
    const buf = await off.startRendering();
    const n = buf.length, L = buf.getChannelData(0), R = buf.getChannelData(1), dv = new DataView(new ArrayBuffer(44 + n * 4));
    const w = (o, str) => [...str].forEach((ch, k) => dv.setUint8(o + k, ch.charCodeAt(0)));
    w(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true);
    dv.setUint32(24, sr, true); dv.setUint32(28, sr * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 4, true);
    for(let k = 0; k < n; k++){ dv.setInt16(44 + k * 4, Math.max(-1, Math.min(1, L[k])) * 32767, true); dv.setInt16(46 + k * 4, Math.max(-1, Math.min(1, R[k])) * 32767, true); }
    const u8 = new Uint8Array(dv.buffer); let bin = ''; for(let k = 0; k < u8.length; k += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(k, k + 0x8000));
    return btoa(bin);
  }
  /* frame-exact render for export: seeks the footage and waits for it */
  async function renderAt(t){
    state.playing = false; state.t = t; lastBeat = -1;
    await Promise.all(clips.map(c => {
      const v = c.v; if(t < c.a || t >= c.b || v.readyState < 1) return null;
      const want = c.map(t - c.a); if(Math.abs(v.currentTime - want) < 0.004) return null;
      return new Promise(res => { const done = () => { v.removeEventListener('seeked', done); res(); }; v.addEventListener('seeked', done); v.currentTime = want; setTimeout(done, 1500); });
    }));
    exportFrame = true; frame(t); exportFrame = false;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    return true;
  }
  /* ---------- voices. Every voice takes an absolute context time. ---------- */
  let TS = 1;                                         // time scale = 1 / playback rate (1 for offline renders)
  const V = {
    env(g, t, a, peak, d){ g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); },
    gain(dest, v){ const g = audio.ctx.createGain(); if(v != null) g.gain.value = v; g.connect(dest || audio.drum); return g; },
    osc(type, f, t, dur, dest, detune){ const o = audio.ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if(detune) o.detune.value = detune; o.connect(dest); o.start(t); o.stop(t + dur + 0.05); return o; },
    send(node, amt){ const s = audio.ctx.createGain(); s.gain.value = amt; node.connect(s); s.connect(audio.rev); },
    pan(dest, p){ const c = audio.ctx; if(!c.createStereoPanner) return dest; const n = c.createStereoPanner(); n.pan.value = p; n.connect(dest); return n; },
    noise(t, dur, type, f, q, v, f2, dest){ const c = audio.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = V.gain(dest); s.buffer = audio.noiseBuf; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); if(f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q; s.connect(fl); fl.connect(g); V.env(g, t, 0.002, v, dur); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05); return g; },
    /* pumps the music bus under every kick (sidechain) */
    duck(t){ const g = audio.music.gain; g.cancelScheduledValues(t); g.setValueAtTime(0.32, t); g.linearRampToValueAtTime(1, t + 0.2 * Math.min(1, TS)); },
    kick(t, v = 1){ const sh = audio.ctx.createWaveShaper(); sh.curve = audio.curve; sh.connect(audio.drum); const g = V.gain(sh), o = V.osc('sine', 210, t, 0.34, g); o.frequency.exponentialRampToValueAtTime(44, t + 0.09); V.env(g, t, 0.001, v * 1.1, 0.3); V.noise(t, 0.012, 'highpass', 2500, 0.7, 0.4 * v); V.duck(t); },
    /* distorted 808 bass note with optional glide to another pitch */
    b808(t, f, len, glideTo, v = 0.8){ const c = audio.ctx, sh = c.createWaveShaper(), lp = c.createBiquadFilter(), g = V.gain(audio.drum); sh.curve = audio.curve; lp.type = 'lowpass'; lp.frequency.value = 1400; sh.connect(lp); lp.connect(g); const pre = c.createGain(); pre.gain.value = 1.6; pre.connect(sh);
      const o = V.osc('sine', f * 1.5, t, len + 0.1, pre); o.frequency.exponentialRampToValueAtTime(f, t + 0.035); if(glideTo){ o.frequency.setValueAtTime(f, t + len * 0.45); o.frequency.exponentialRampToValueAtTime(glideTo, t + len * 0.95); }
      V.osc('triangle', f * 2, t, len, pre).detune.value = 4; V.env(g, t, 0.004, v, len); },
    clap(t, v = 0.8){ const bus = V.gain(audio.drum, 1); V.send(bus, 0.35); [0, 0.011, 0.024].forEach(k => V.noise(t + k, 0.04, 'bandpass', 1500, 1.3, v * 0.75, 0, bus)); V.noise(t + 0.03, 0.2, 'bandpass', 1900, 0.8, v * 0.5, 0, bus); V.noise(t, 0.09, 'highpass', 2400, 0.7, v * 0.4, 0, bus);
      const g = V.gain(bus), o = V.osc('triangle', 230, t, 0.09, g); o.frequency.exponentialRampToValueAtTime(160, t + 0.07); V.env(g, t, 0.002, v * 0.45, 0.08); },
    snare(t, v = 0.5, f = 215){ V.noise(t, 0.12, 'highpass', 1900, 0.7, v); const g = V.gain(), o = V.osc('triangle', f, t, 0.1, g); o.frequency.exponentialRampToValueAtTime(f * 0.7, t + 0.08); V.env(g, t, 0.002, v * 0.7, 0.09); },
    hat(t, v = 0.12, open, p = 0){ V.noise(t, open ? 0.13 : 0.028, 'highpass', open ? 7200 : 9000, 0.9, v, 0, V.pan(audio.drum, p)); },
    /* the phonk lead: 808-style cowbell (two detuned squares through a band-pass), saturated, with room */
    bell(t, f, v = 0.3, len = 0.22){ const c = audio.ctx, bp = c.createBiquadFilter(), sh = c.createWaveShaper(), g = V.gain(audio.lead); bp.type = 'bandpass'; bp.frequency.value = f * 1.6; bp.Q.value = 1.8; sh.curve = audio.curve; bp.connect(sh); sh.connect(g);
      const pre = c.createGain(); pre.gain.value = 0.9; pre.connect(bp); V.osc('square', f, t, len, pre); V.osc('square', f * 1.498, t, len, pre); V.osc('square', f * 2.01, t, len, pre).detune.value = 7;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.002); g.gain.exponentialRampToValueAtTime(v * 0.35, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + len); },
    /* dark pad: detuned saws, sidechained */
    pad(t, notes, len, v = 0.2){ const c = audio.ctx, fl = c.createBiquadFilter(), g = V.gain(audio.music); fl.type = 'lowpass'; fl.Q.value = 1.2; fl.frequency.setValueAtTime(500, t); fl.frequency.linearRampToValueAtTime(1500, t + len * 0.5); fl.frequency.linearRampToValueAtTime(600, t + len); fl.connect(g); V.send(g, 0.3);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.06); g.gain.setValueAtTime(v, t + len - 0.08); g.gain.linearRampToValueAtTime(0.0001, t + len);
      notes.forEach((f, i) => { const n = c.createGain(); n.gain.value = 1 / notes.length; n.connect(V.pan(fl, i % 2 ? 0.5 : -0.5)); V.osc('sawtooth', f, t, len, n, -11); V.osc('sawtooth', f, t, len, n, 11); }); },
    /* menacing brass stab for scene drops */
    brass(t, notes, len, v = 0.5){ const c = audio.ctx, fl = c.createBiquadFilter(), g = V.gain(audio.music); fl.type = 'lowpass'; fl.Q.value = 6; fl.frequency.setValueAtTime(260, t); fl.frequency.exponentialRampToValueAtTime(3200, t + 0.06); fl.frequency.exponentialRampToValueAtTime(600, t + len); fl.connect(g); V.send(g, 0.25); V.env(g, t, 0.012, v, len);
      notes.forEach(f => { const n = c.createGain(); n.gain.value = 1 / notes.length; n.connect(fl); V.osc('sawtooth', f, t, len, n, -9); V.osc('sawtooth', f, t, len, n, 9); V.osc('square', f / 2, t, len, n); }); },
    /* west-coast whistle lead with portamento + vibrato */
    whistle(t, seq, stepLen, v = 0.16){ const c = audio.ctx, g = V.gain(audio.lead), o = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain(), total = seq.length * stepLen; o.type = 'sine'; lfo.frequency.value = 5.6; lg.gain.value = 9; lfo.connect(lg); lg.connect(o.frequency);
      seq.forEach((f, i) => { const at = t + i * stepLen; if(i === 0) o.frequency.setValueAtTime(f, at); else o.frequency.exponentialRampToValueAtTime(f, at + stepLen * 0.35); o.frequency.setValueAtTime(f, at + stepLen * 0.36); });
      o.connect(g); V.send(g, 0.5); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.04); g.gain.setValueAtTime(v, t + total - 0.1); g.gain.linearRampToValueAtTime(0.0001, t + total); o.start(t); lfo.start(t); o.stop(t + total + 0.05); lfo.stop(t + total + 0.05); },
    boom(t){ V.noise(t, 1.1, 'lowpass', 260, 0.7, 1); V.b808(t, 36.7, 1.1, 27.5, 1); const cr = V.noise(t, 1.4, 'highpass', 4200, 0.6, 0.3); V.send(cr, 0.6); },
    /* reverse-cymbal swell that lands on `t + len` */
    swell(t, len, v = 0.4){ const g = V.noise(t, len, 'bandpass', 900, 1.4, 0.001, 9500, audio.music); g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + len * 0.98); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.02); },
    blip(t){ const g = V.gain(audio.lead), o = V.osc('sine', 1100, t, 0.09, g); o.frequency.exponentialRampToValueAtTime(2300, t + 0.07); V.env(g, t, 0.002, 0.35, 0.08); }
  };

  /* ---------- the track: F minor drift-phonk, 12 bars ---------- */
  const F1 = 43.65, ROOTS = [F1, F1, 34.65, 32.7];                                              // F  F  Db  C
  const PADS = [[174.61, 207.65, 261.63], [174.61, 207.65, 261.63], [138.59, 174.61, 207.65], [130.81, 164.81, 196]];
  const N = { C5: 523.25, Eb5: 622.25, F5: 698.46, G5: 783.99, Ab5: 830.61, Bb5: 932.33, C6: 1046.5, Db6: 1108.73, Eb6: 1244.51, F6: 1396.91 };
  const MEL = [                                                                                 // cowbell hook, two-bar phrase on 1/16 steps
    { 0: N.F5, 2: N.F5, 3: N.Ab5, 6: N.F5, 8: N.C6, 10: N.Bb5, 11: N.Ab5, 14: N.G5 },
    { 0: N.F5, 2: N.F5, 3: N.Ab5, 6: N.C6, 8: N.Eb6, 10: N.Db6, 12: N.C6, 14: N.Ab5, 15: N.G5 }
  ];
  const WHISTLE = [N.C6 * 2, N.C6 * 2, N.Bb5 * 2, N.Ab5 * 2, N.F5 * 2, N.F5 * 2, N.Ab5 * 2, N.G5 * 2];   // one bar, 1/8 notes
  function scheduleStep(step, time){
    const bar = Math.floor(step / 16), s = step % 16, sd = SD * TS, b = B * TS, mel = MEL[bar % 2][s];
    if(s === 0 && (bar === 2 || bar === 4 || bar === 7 || bar === 10)){ V.boom(time); V.brass(time, PADS[0].map(f => f / 2), b * 2.2, 0.55); }   // scene drops: beats 9, 17, 29, 41
    if(s === 0 && (bar === 1 || bar === 3 || bar === 6 || bar === 9)) V.swell(time, 4 * b, bar === 1 ? 0.5 : 0.3);                            // swell into each drop
    if(s === 0 && bar < 11) V.pad(time, PADS[bar % 4], 4 * b, bar < 2 ? 0.26 : 0.17);

    if(bar < 2){                                                                                // intro (laptop): heartbeat kick, teaser hook, click on beat 4
      if(s % 4 === 0) V.kick(time, 0.75);
      if(s % 2 === 0) V.hat(time, s % 4 === 2 ? 0.16 : 0.07, false, s % 4 === 2 ? 0.3 : -0.3);
      if(mel) V.bell(time, mel / 2, bar === 0 ? 0.1 : 0.16, 0.16);
      if(bar === 1 && s === 0) V.blip(time);
      if(bar === 1 && s >= 8) V.snare(time, 0.12 + (s - 8) * 0.04, 190 + (s - 8) * 14);
      return;
    }
    const roll = bar === 3 && s >= 4, fin = bar === 11;
    if(roll){                                                                                   // beats 14–16: everything drops out for the rising snare roll
      V.snare(time, 0.28 + (s - 4) * 0.045, 200 + (s - 4) * 22); if(s >= 8) V.snare(time + sd / 2, 0.3 + (s - 8) * 0.05, 230 + (s - 4) * 22);
      if(s >= 12){ V.snare(time + sd / 4, 0.5, 420); V.snare(time + sd * 3 / 4, 0.55, 460); }
      return;
    }
    if(fin && s >= 8){ if(s === 8){ V.boom(time); V.bell(time, N.F5, 0.4, 1.4); V.bell(time, N.C6, 0.3, 1.4); V.brass(time, PADS[0], b * 4, 0.5); } return; }
    /* drums */
    if(s === 0 || s === 6 || s === 10 || (s === 3 && bar % 2)) V.kick(time, s === 0 ? 1 : 0.85);
    if(s === 4 || s === 12) V.clap(time, 0.85);
    V.hat(time, s % 4 === 2 ? 0.2 : (s % 2 === 0 ? 0.11 : 0.06), s % 4 === 2, s % 2 ? 0.35 : -0.25);
    if(bar % 2 === 1 && s >= 12){ V.hat(time + sd / 3, 0.07 + (s - 12) * 0.02, false, 0.4); V.hat(time + sd * 2 / 3, 0.08 + (s - 12) * 0.02, false, -0.4); }
    if(bar % 4 === 2 && s >= 14){ V.hat(time + sd / 2, 0.12); }
    /* 808 line: root on 1 and 2.5, pickup with a glide at the end of the bar */
    const root = ROOTS[bar % 4];
    if(s === 0) V.b808(time, root, b * 1.35);
    if(s === 6) V.b808(time, root, b * 0.95);
    if(s === 10) V.b808(time, root * 1.5, b * 0.9, root, 0.7);
    if(s === 14) V.b808(time, root * 2, b * 0.5, ROOTS[(bar + 1) % 4] * 1.02, 0.65);
    /* hook */
    if(mel) V.bell(time, mel, 0.3);
    if(bar >= 4 && bar % 2 === 1 && s % 2 === 0 && s === 0) V.whistle(time, WHISTLE, 2 * sd);
  }
  function rebase(t){ lastNow = performance.now(); TS = 1 / state.rate; if(audio.ctx){ audio.t0 = audio.ctx.currentTime - t * TS; audio.next = Math.ceil(t / SD - 1e-6); } }
  function pump(){
    const c = audio.ctx;
    audio.next = Math.max(audio.next, Math.ceil((state.t - 0.02) / SD));
    while(audio.next < STEPS && audio.next * SD < state.t + 0.14 * state.rate){ scheduleStep(audio.next, Math.max(audio.t0 + audio.next * SD * TS, c.currentTime + 0.004)); audio.next++; }
  }
  function setAudio(on){
    if(on && !audio.ctx && !initAudio()) return;
    audio.on = on;
    if(on){ audio.ctx.resume(); audio.master.gain.setTargetAtTime(state.playing ? 0.8 : 0, audio.ctx.currentTime, 0.01); rebase(state.t); }
    else if(audio.ctx) audio.master.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.02);
    const b = $('#audioBtn'); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '🔊 Beat on' : '🔇 Unmute beat';
    $('#soundPill').hidden = on;
  }

  /* ==================================================================
     clock + per-frame UI
     ================================================================== */
  const hud = { tc: $('#hudTc'), beat: $('#hudBeat'), scene: $('#hudScene'), dot: $('#bpmDot'), dots: $$('#beatDots i'), spec: $('#spec'), head: $('#seqHead') };
  for(let i = 0; i < 20; i++) hud.spec.append(el('i'));
  const specBars = $$('i', hud.spec);
  let jumpBtns = [];
  function onBeat(beatIndex){
    gsap.fromTo(hud.dot, { scale: 1.9 }, { scale: 1, duration: B * 0.8, ease: 'power3.out', overwrite: true });
    hud.dots.forEach((d, i) => d.classList.toggle('on', i === beatIndex % 4));
    hud.beat.textContent = `BEAT ${pad(beatIndex + 1)}/${BEATS}`;
    const si = SCENES.reduce((a, sc, i) => beatIndex + 1 >= sc[0] ? i : a, 0);
    hud.scene.textContent = `${pad(si + 1)} ${SCENES[si][2]}`;
    jumpBtns.forEach((b, i) => b.classList.toggle('on', i === si));
    if(ui.idx){ const pi = Math.min(5, Math.max(0, Math.floor((beatIndex - 28) / 2))); ui.idx.textContent = `${pad(pi + 1)} / 06`; ui.big.textContent = pad(pi + 1); }
  }
  function frame(t){
    tl.time(Math.min(t, DUR));
    clips.forEach(c => {
      const v = c.v, inWin = t >= c.a && t < c.b;
      if(!inWin){ if(!v.paused) v.pause(); return; }
      if(v.readyState < 1) return;
      const want = c.map(t - c.a);
      if(!exportFrame && Math.abs(v.currentTime - want) > 0.35) v.currentTime = want;
      if(state.playing){ v.playbackRate = Math.max(0.1, Math.min(8, c.rate(t - c.a) * state.rate)); if(v.paused) v.play().catch(() => {}); } else if(!v.paused) v.pause();
    });
    const bi = Math.min(BEATS - 1, Math.floor(t / B + 1e-6));
    if(bi !== lastBeat){ lastBeat = bi; onBeat(bi); }
    const f = Math.floor(t * 60);
    hud.tc.textContent = `00:${pad(Math.floor(t))}:${pad(f % 60)}`;
    hud.head.style.transform = `translateX(${(t / DUR) * seqW}px)`;
    /* spectrum: real analyser when the beat is on, beat-shaped pulse when muted */
    if(audio.on && state.playing){ audio.an.getByteFrequencyData(audio.bins); specBars.forEach((b, i) => { b.style.transform = `scaleY(${Math.max(0.06, audio.bins[i * 2 + 1] / 255).toFixed(3)})`; }); }
    else { const ph = (t / B) % 1, e = (state.playing || exportFrame) ? Math.exp(-ph * 4.5) : 0; specBars.forEach((b, i) => { b.style.transform = `scaleY(${(0.06 + e * (0.35 + 0.6 * Math.abs(Math.sin(i * 1.7 + bi * 2.3)))).toFixed(3)})`; }); }
  }
  gsap.ticker.add(() => {
    if(!state.playing || !tl) return;
    let t;
    if(audio.on){ t = (audio.ctx.currentTime - audio.t0) * state.rate; }
    else { const now = performance.now(); t = state.t + Math.min(0.1, (now - lastNow) / 1000) * state.rate; lastNow = now; }
    if(t >= DUR){
      if(state.loop){ t -= DUR; state.t = t; rebase(t); }
      else { state.t = DUR; frame(DUR); setPlaying(false); return; }
    }
    state.t = t;
    if(audio.on) pump();
    frame(t);
  });
  function setPlaying(p){
    state.playing = p; rebase(state.t);
    if(audio.ctx) audio.master.gain.setTargetAtTime(p && audio.on ? 0.8 : 0, audio.ctx.currentTime, 0.015);
    const b = $('#playBtn'), ended = !p && state.t >= DUR;
    b.textContent = p ? '❚❚ Pause' : ended ? '▶ Replay' : '▶ Play'; b.setAttribute('aria-label', p ? 'Pause' : 'Play');
    if(!p) clips.forEach(c => c.v.pause());
  }
  function seek(t, play){ state.t = Math.max(0, Math.min(DUR, t)); lastBeat = -1; rebase(state.t); frame(state.t); if(play != null) setPlaying(play); }
  const togglePlay = () => { if(!state.playing && state.t >= DUR) seek(0, true); else setPlaying(!state.playing); };

  /* ==================================================================
     director controls
     ================================================================== */
  $('#playBtn').addEventListener('click', togglePlay);
  $('#restartBtn').addEventListener('click', () => seek(0, true));
  $('#loopBtn').addEventListener('click', e => { state.loop = !state.loop; e.currentTarget.setAttribute('aria-pressed', String(state.loop)); e.currentTarget.textContent = '∞ Loop: ' + (state.loop ? 'on' : 'off'); });
  $('#audioBtn').addEventListener('click', () => setAudio(!audio.on));
  $('#soundPill').addEventListener('click', e => { e.stopPropagation(); setAudio(true); seek(0, true); });
  rig.addEventListener('click', e => { if(!e.target.closest('a, button')) togglePlay(); });
  document.addEventListener('keydown', e => { if(e.code === 'Space' && !/^(BUTTON|A|INPUT)$/.test(document.activeElement.tagName)){ e.preventDefault(); togglePlay(); } });

  /* playback speed: slows or speeds picture and beat together (161 BPM x rate) */
  function setRate(r){
    state.rate = r; rebase(state.t);
    if(audio.ctx){ audio.music.gain.cancelScheduledValues(0); audio.music.gain.setValueAtTime(1, audio.ctx.currentTime); }
    $$('.sp').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.rate === r)));
    $('#bpmLabel').textContent = Math.round(BPM * r) + ' BPM' + (r === 1 ? '' : ' · ' + r + '×');
  }
  $$('.sp').forEach(b => b.addEventListener('click', () => setRate(+b.dataset.rate)));

  $$('.vb').forEach(b => b.addEventListener('click', () => {
    rig.dataset.vibe = director.dataset.vibe = b.dataset.vibe;
    $$('.vb').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  }));
  director.dataset.vibe = 'pop';

  SCENES.forEach(([beat, name], i) => {
    const b = el('button', 'jb'); b.type = 'button'; b.append(el('span', null, pad(i + 1)), document.createTextNode(name));
    b.addEventListener('click', () => seek(bt(beat) + 0.001, true));
    $('#jumps').append(b); jumpBtns.push(b);
  });

  /* sequencer */
  const TRACKS = [
    ['V1 · 3D camera', '--c3', [[1, 2, 'Push'], [3, 8, 'Cut · screen dive'], [9, 16, 'Iris tunnel ×42'], [17, 28, 'Burst · lean · whip'], [29, 40, 'Beat punches'], [41, 48, 'Grid pull-back']]],
    ['V2 · Design & UI', '--c1', [[1, 3, 'Captions'], [4, 6, 'Launch pill'], [9, 14, 'VISION / MEETS / EXECUTION'], [17, 21, 'Pen tool + folder'], [22, 28, 'Copy slam'], [29, 40, '6 bento panels · 12 + 20'], [42, 48, 'Command card']]],
    ['V3 · HD stock video', '--c4', [[1, 2, 'Lid lift'], [3, 8, 'Laptop reveal'], [9, 10, 'Eye opens ×3'], [11, 16, 'Eye macro'], [29, 30, 'Site previews']]],
    ['A1 · 161 BPM synth', '--c2', [[1, 8, 'Hats + riser'], [9, 13, 'Drop · 808'], [14, 16, 'Snare roll'], [17, 40, 'Full beat · cowbell lead'], [41, 48, 'Finale stab']]]
  ];
  const seq = $('#seq'), tracksEl = $('#seqTracks'), ruler = $('#seqRuler');
  let seqW = 0;
  for(let bar = 0; bar < 12; bar++){ const s = el('span', null, 'bar ' + (bar + 1)); s.style.left = (bar / 12 * 100) + '%'; ruler.append(s); }
  TRACKS.forEach(([name, color, cl]) => {
    const row = el('div', 'seq-t'); row.append(el('b', null, name));
    cl.forEach(([a, b, label]) => { const c = el('span', 'seq-c', label); c.style.left = ((a - 1) / BEATS * 100) + '%'; c.style.width = ((b - a + 1) / BEATS * 100) + '%'; c.style.background = `var(${color})`; row.append(c); });
    tracksEl.append(row);
  });
  const seqSeek = e => { const r = tracksEl.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * DUR); };
  let dragging = false;
  seq.addEventListener('pointerdown', e => { dragging = true; seq.setPointerCapture(e.pointerId); seqSeek(e); });
  seq.addEventListener('pointermove', e => { if(dragging) seqSeek(e); });
  seq.addEventListener('pointerup', () => { dragging = false; });
  seq.addEventListener('pointercancel', () => { dragging = false; });

  /* aspect + fit */
  function fitStage(){ rig.style.transform = `scale(${fit.clientWidth / state.W})`; seqW = tracksEl.clientWidth; }
  function setAspect(a){
    state.aspect = a; state.W = a === 'v' ? 900 : 1600; state.H = a === 'v' ? 1600 : 900;
    fit.classList.toggle('is-v', a === 'v');
    $$('.seg-b').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.aspect === a)));
    fitStage(); build(); fitStage();
  }
  $$('.seg-b').forEach(b => b.addEventListener('click', () => setAspect(b.dataset.aspect)));
  new ResizeObserver(() => { fitStage(); if(tl) frame(state.t); }).observe(fit);
  window.addEventListener('resize', fitStage);

  /* menu */
  const menuBtn = $('#menuBtn'), menu = $('#menu');
  const setMenu = o => { menuBtn.setAttribute('aria-expanded', String(o)); menuBtn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); document.documentElement.classList.toggle('menu-open', o); menu.setAttribute('aria-hidden', String(!o)); if(o) menu.removeAttribute('inert'); else menu.setAttribute('inert', ''); };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', e => { if(e.key === 'Escape') setMenu(false); });

  /* smooth scroll + reveal, responsive */
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    if(window.Lenis && !EXPORT){ const lenis = new Lenis({ smoothWheel: true }); lenis.on('scroll', ScrollTrigger.update); const raf = time => lenis.raf(time * 1000); gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0); return () => { gsap.ticker.remove(raf); lenis.destroy(); }; }
  });
  mm.add('(min-width: 721px) and (prefers-reduced-motion: no-preference)', () => {
    gsap.from('.director > *', { opacity: 0, y: 24, duration: 0.6, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.director', start: 'top 96%' } });
  });

  /* phones start in 9:16 */
  const start = () => { setAspect(EXPORT ? (new URLSearchParams(location.search).get('export') === 'v' ? 'v' : 'h') : window.matchMedia('(max-width: 720px) and (orientation: portrait)').matches ? 'v' : 'h'); setPlaying(state.playing); };
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
  window.__ad = { V, state, seek, setAspect, setAudio, setRate, audio, B, DUR, renderAt, renderAudio };   // read-only hook for automated tests
})();
