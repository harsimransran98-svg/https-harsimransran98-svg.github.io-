/* Static Motion — beat-sync & speed-ramp studio (Bazozo Studio) */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  $('#year').textContent = new Date().getFullYear();
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const sv = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.append(n); return n; };

  /* ---------- nav + equalizer menu ---------- */
  const nav = $('#nav'), mBtn = $('#menuBtn'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    mBtn.setAttribute('aria-expanded', String(open)); mBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    if (open && hasGsap && !reduced) { gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: .5, ease: 'expo.out' }); gsap.from('.menu a.big', { yPercent: 60, opacity: 0, skewY: 6, duration: .6, stagger: .06, ease: 'expo.out', delay: .1 }); }
  }
  mBtn.addEventListener('click', () => setMenu(mBtn.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); mBtn.focus(); } });

  /* ---------- timing ---------- */
  const BPM = 120, BEAT = 60 / BPM, LOOP = 16 * BEAT; // 4 bars of 4/4 = 8 s
  const S = { t: 0, abs: 0, m: 0, playing: false, muted: false, auto: true, fps: 120, cam: 'A', lastBeat: -1, punch: 0 };

  /* ---------- cameras ---------- */
  const CAMS = [
    { id: 'A', name: 'Wide', src: '../images/ironcladfitness.jpg', fx: .5, fy: .55, zoom: 1.0, color: '#CCFF00' },
    { id: 'B', name: 'Mid', src: '../images/ironcladfitness.jpg', fx: .49, fy: .52, zoom: 1.9, color: '#00E5FF' },
    { id: 'C', name: 'Close-up', src: '../images/ironcladfitness.jpg', fx: .485, fy: .44, zoom: 4.2, color: '#FF2BD6' },
    { id: 'D', name: 'FX insert', src: '../images/staticmotion.jpg', fx: .5, fy: .5, zoom: 1.15, color: '#FF8A00', spin: true }
  ];
  const camById = id => CAMS.find(c => c.id === id);
  const imgs = {};
  const loadImg = src => imgs[src] || (imgs[src] = new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }));
  function drawCam(ctx, cam, w, h, time, punch) {
    const img = cam.img; if (!img) { ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, h); return; }
    const z = cam.zoom * (1 + punch) * (1 + .025 * Math.sin(time * .5));
    const base = Math.max(w / img.naturalWidth, h / img.naturalHeight) * z;
    const dw = img.naturalWidth * base, dh = img.naturalHeight * base;
    const cx = cam.fx + .006 * Math.sin(time * .9), cy = cam.fy + .005 * Math.cos(time * .7);
    let x = w / 2 - dw * cx, y = h / 2 - dh * cy;
    x = Math.min(0, Math.max(w - dw, x)); y = Math.min(0, Math.max(h - dh, y));
    if (cam.spin) {
      ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(time * .12); ctx.scale(1.25, 1.25); ctx.translate(-w / 2, -h / 2);
      ctx.drawImage(img, x, y, dw, dh); ctx.restore();
    } else ctx.drawImage(img, x, y, dw, dh);
  }

  // camera buttons with live previews
  const camsEl = $('#cams');
  CAMS.forEach((c, i) => {
    const b = el('button', 'cam'); b.type = 'button'; b.dataset.cam = c.id; b.setAttribute('aria-label', `Cut to camera ${c.id}, ${c.name}`);
    const cv = el('canvas'); cv.width = 320; cv.height = 180; c.prev = cv.getContext('2d');
    b.append(cv, el('span', 'lab', 'CAM ' + c.id), el('span', 'kbd', String(i + 1)), el('span', 'nm', c.name));
    b.style.setProperty('--c', c.color);
    b.addEventListener('click', () => cut(c.id, true));
    camsEl.append(b);
  });

  /* ---------- cut list ---------- */
  let cuts = [{ t: 0, cam: 'A' }];
  const camAt = t => { let c = cuts[cuts.length - 1].cam; for (const k of cuts) if (k.t <= t + 1e-4) c = k.cam; return c; };
  function cut(id, manual) {
    const snap = Math.round(S.t / BEAT) * BEAT % LOOP; // land every cut on the beat
    cuts = cuts.filter(k => Math.abs(k.t - snap) > 1e-3);
    cuts.push({ t: snap, cam: id }); cuts.sort((a, b) => a.t - b.t);
    if (manual) S.manualUntil = S.abs + 4 * BEAT; // a manual cut holds off auto-cut for one bar
    S.cam = id; S.flash = 1;
    drawCuts(); paintCams();
  }
  const cutsEl = $('#cuts');
  function drawCuts() {
    cutsEl.replaceChildren();
    cuts.forEach((k, i) => {
      const end = i + 1 < cuts.length ? cuts[i + 1].t : LOOP;
      if (end - k.t < 1e-3) return;
      const s = el('span', null, 'CAM ' + k.cam); const c = camById(k.cam);
      s.style.left = (k.t / LOOP * 100) + '%'; s.style.width = `calc(${(end - k.t) / LOOP * 100}% - 2px)`; s.style.background = c.color;
      cutsEl.append(s);
    });
  }
  function paintCams() {
    $$('.cam').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cam === S.cam)));
    const c = camById(S.cam);
    $('#pgmCam').textContent = 'Cam ' + c.id; $('#hudCam').textContent = `CAM ${c.id} · ${c.name.toUpperCase()}`;
  }
  $('#autoBtn').addEventListener('click', e => { S.auto = !S.auto; e.currentTarget.setAttribute('aria-pressed', String(S.auto)); });
  $('#clearBtn').addEventListener('click', () => { cuts = [{ t: 0, cam: S.cam }]; drawCuts(); });
  document.addEventListener('keydown', e => {
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const n = +e.key; if (n >= 1 && n <= 4) cut(CAMS[n - 1].id, true);
    if (e.code === 'Space' && !['BUTTON', 'A'].includes(document.activeElement.tagName)) { e.preventDefault(); setPlay(!S.playing); }
  });

  /* ---------- speed ramp (cubic bezier velocity curve) ---------- */
  const R = { x1: .3, y1: 0, x2: .7, y2: 0 };
  const PRESETS = { hero: [.3, 0, .7, 0], whip: [.12, 0, .35, 1], drop: [.55, 1, .8, -.2], none: [.33, 1, .67, 1] };
  const bez = (a, b, c, d, t) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
  function speedAt(u) {
    let lo = 0, hi = 1, t = u;
    for (let i = 0; i < 24; i++) { t = (lo + hi) / 2; const x = bez(0, R.x1, R.x2, 1, t); if (x < u) lo = t; else hi = t; }
    const y = bez(1, R.y1, R.y2, 1, t);
    return Math.max(floor(), Math.min(1, y));
  }
  const floor = () => 24 / S.fps; // slowest clean speed for the capture rate on a 24p timeline
  const ramp = $('#ramp');
  const X0 = 46, X1 = 404, YT = 22, YB = 192;
  const px = u => X0 + (X1 - X0) * u, py = s => YB - (YB - YT) * s;
  const gAx = sv('g', {}, ramp), area = sv('path', { class: 'area' }, ramp), floorL = sv('line', { class: 'floor', x1: X0, x2: X1 }, ramp), floorT = sv('text', { class: 'floor-t', x: X1, 'text-anchor': 'end' }, ramp);
  const curve = sv('path', { class: 'curve' }, ramp), arm1 = sv('line', { class: 'arm' }, ramp), arm2 = sv('line', { class: 'arm' }, ramp);
  sv('circle', { class: 'end', cx: px(0), cy: py(1), r: 5 }, ramp); sv('circle', { class: 'end', cx: px(1), cy: py(1), r: 5 }, ramp);
  const h1 = sv('circle', { class: 'h', r: 9, tabindex: 0, role: 'slider', 'aria-label': 'Ramp handle 1' }, ramp), h2 = sv('circle', { class: 'h', r: 9, tabindex: 0, role: 'slider', 'aria-label': 'Ramp handle 2' }, ramp);
  const phase = sv('circle', { class: 'ph', r: 5 }, ramp);
  [[1, '100%'], [.5, '50%'], [0, '0%']].forEach(([s, t]) => { sv('line', { class: 'ax', x1: X0, x2: X1, y1: py(s), y2: py(s) }, gAx); const n = sv('text', { class: 'axt', x: X0 - 8, y: py(s) + 3, 'text-anchor': 'end' }, gAx); n.textContent = t; });
  ['Beat 1', '2', '3', '4'].forEach((t, i) => { const n = sv('text', { class: 'axt', x: px(i / 4) + 3, y: YB + 18 }, gAx); n.textContent = t; });
  function drawRamp() {
    let d = '', a = `M${px(0)} ${YB}`;
    for (let i = 0; i <= 90; i++) { const u = i / 90, s = speedAt(u); d += (i ? 'L' : 'M') + px(u).toFixed(1) + ' ' + py(s).toFixed(1); a += 'L' + px(u).toFixed(1) + ' ' + py(s).toFixed(1); }
    curve.setAttribute('d', d); area.setAttribute('d', a + `L${px(1)} ${YB}Z`);
    const fy = py(floor()); floorL.setAttribute('y1', fy); floorL.setAttribute('y2', fy);
    floorT.setAttribute('y', fy - 6); floorT.textContent = `${S.fps} FPS FLOOR · ${Math.round(floor() * 100)}%`;
    const ys = v => py(Math.max(0, Math.min(1, v)));
    h1.setAttribute('cx', px(R.x1)); h1.setAttribute('cy', ys(R.y1)); h2.setAttribute('cx', px(R.x2)); h2.setAttribute('cy', ys(R.y2));
    arm1.setAttribute('x1', px(0)); arm1.setAttribute('y1', py(1)); arm1.setAttribute('x2', px(R.x1)); arm1.setAttribute('y2', ys(R.y1));
    arm2.setAttribute('x1', px(1)); arm2.setAttribute('y1', py(1)); arm2.setAttribute('x2', px(R.x2)); arm2.setAttribute('y2', ys(R.y2));
    $('#bez').textContent = `cubic-bezier(${R.x1.toFixed(2)}, ${R.y1.toFixed(2)}, ${R.x2.toFixed(2)}, ${R.y2.toFixed(2)})`;
    let mn = 1; for (let i = 0; i <= 50; i++) mn = Math.min(mn, speedAt(i / 50));
    $('#rampMin').textContent = `Min speed ${Math.round(mn * 100)}% · ${mn <= floor() + .001 ? 'at the ' + S.fps + ' fps limit' : 'clean'}`;
  }
  function svgPoint(e) { const p = ramp.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(ramp.getScreenCTM().inverse()); }
  [[h1, 'x1', 'y1'], [h2, 'x2', 'y2']].forEach(([h, kx, ky]) => {
    let drag = false;
    h.addEventListener('pointerdown', e => { drag = true; h.setPointerCapture(e.pointerId); markPreset(null); });
    h.addEventListener('pointermove', e => {
      if (!drag) return; const p = svgPoint(e);
      R[kx] = Math.min(1, Math.max(0, (p.x - X0) / (X1 - X0)));
      R[ky] = Math.min(1.2, Math.max(-.2, (YB - p.y) / (YB - YT)));
      drawRamp();
    });
    h.addEventListener('pointerup', () => { drag = false; });
    h.addEventListener('keydown', e => {
      const st = .05, m = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, st], ArrowDown: [0, -st] }[e.key];
      if (!m) return; e.preventDefault(); markPreset(null);
      R[kx] = Math.min(1, Math.max(0, R[kx] + m[0])); R[ky] = Math.min(1.2, Math.max(-.2, R[ky] + m[1])); drawRamp();
    });
  });
  function markPreset(k) { $$('[data-pre]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pre === k))); }
  $$('[data-pre]').forEach(b => b.addEventListener('click', () => {
    const [x1, y1, x2, y2] = PRESETS[b.dataset.pre]; markPreset(b.dataset.pre);
    if (hasGsap && !reduced) gsap.to(R, { x1, y1, x2, y2, duration: .5, ease: 'power3.inOut', onUpdate: drawRamp });
    else { Object.assign(R, { x1, y1, x2, y2 }); drawRamp(); }
  }));
  $$('[data-fps]').forEach(b => b.addEventListener('click', () => {
    S.fps = +b.dataset.fps; $$('[data-fps]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $('#hudFps').textContent = `SHOT ${S.fps} FPS`; drawRamp();
  }));
  drawRamp();

  /* ---------- audio: a synthesised 4-bar drum & bass loop ---------- */
  let useAudioClock = false, actx = null, master = null, noise = null, sched = null, nextStep = 0, nextTime = 0, audioStart = 0, startT = 0;
  const STEP = BEAT / 4, BASS = [41, 41, 44, 39]; // MIDI roots per bar
  function initAudio() {
    if (actx) return actx.state === 'suspended' ? actx.resume() : Promise.resolve();
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return Promise.resolve();
    actx = new AC();
    const comp = actx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    master = actx.createGain(); master.gain.value = S.muted ? 0 : .55; master.connect(comp); comp.connect(actx.destination);
    noise = actx.createBuffer(1, actx.sampleRate * .5, actx.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return Promise.resolve();
  }
  const env = (g, t, a, peak, dec) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dec); };
  function kick(t) { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + .12); env(g, t, .002, 1, .35); o.connect(g).connect(master); o.start(t); o.stop(t + .4); }
  function snare(t) {
    const n = actx.createBufferSource(); n.buffer = noise; const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = .8;
    const g = actx.createGain(); env(g, t, .002, .55, .2); n.connect(f).connect(g).connect(master); n.start(t); n.stop(t + .25);
    const o = actx.createOscillator(), og = actx.createGain(); o.frequency.value = 190; env(og, t, .002, .3, .1); o.connect(og).connect(master); o.start(t); o.stop(t + .12);
  }
  function hat(t, open) { const n = actx.createBufferSource(); n.buffer = noise; const f = actx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7500; const g = actx.createGain(); env(g, t, .001, open ? .22 : .12, open ? .14 : .04); n.connect(f).connect(g).connect(master); n.start(t); n.stop(t + .2); }
  function bass(t, midi) { const o = actx.createOscillator(), f = actx.createBiquadFilter(), g = actx.createGain(); o.type = 'sawtooth'; o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(160, t + .2); env(g, t, .005, .35, .22); o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + .26); }
  function schedule() {
    while (nextTime < actx.currentTime + .12) {
      const s = nextStep % 64, bar = Math.floor(s / 16);
      if (s % 4 === 0) kick(nextTime);
      if (s % 16 === 4 || s % 16 === 12) snare(nextTime);
      if (s % 2 === 0) hat(nextTime, s % 4 === 2);
      if (s % 4 === 2) bass(nextTime, BASS[bar]);
      nextStep++; nextTime += STEP;
    }
  }
  function startClock() {
    startT = S.t;
    useAudioClock = !!actx && actx.state === 'running'; // fall back to the system clock if audio is blocked
    if (useAudioClock) {
      audioStart = actx.currentTime + .05;
      nextStep = Math.ceil(S.t / STEP - 1e-6); nextTime = audioStart + (nextStep * STEP - S.t);
      clearInterval(sched); sched = setInterval(schedule, 25); schedule();
    } else audioStart = performance.now() / 1000;
  }
  const clockNow = () => useAudioClock ? actx.currentTime : performance.now() / 1000;

  /* ---------- transport ---------- */
  function setPlay(on) {
    S.playing = on;
    $('#playLbl').textContent = on ? 'Pause' : 'Play'; $('#playBtn').dataset.text = on ? 'Pause' : 'Play';
    if (on) { startClock(); initAudio().then(() => { if (S.playing && actx && actx.state === 'running') startClock(); }); }
    else { clearInterval(sched); if (actx) actx.suspend(); }
  }
  $('#playBtn').addEventListener('click', () => setPlay(!S.playing));
  $('#muteBtn').addEventListener('click', e => {
    S.muted = !S.muted; e.currentTarget.setAttribute('aria-pressed', String(S.muted));
    e.currentTarget.lastChild.textContent = S.muted ? 'Muted' : 'Sound on';
    if (master) master.gain.setTargetAtTime(S.muted ? 0 : .55, actx.currentTime, .02);
  });

  /* ---------- waveform (synthetic, matches the drum pattern) ---------- */
  const wave = $('#wave'), wctx = wave.getContext('2d'), WN = 300;
  const amp = new Float32Array(WN);
  (() => { let x = 11; const rnd = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
    for (let i = 0; i < WN; i++) {
      const t = i / WN * LOOP, b = t / BEAT, fb = b - Math.floor(b), beatN = Math.floor(b) % 4;
      let a = .14 + rnd() * .12 + Math.exp(-fb * 9) * .7;
      if (beatN === 1 || beatN === 3) a += Math.exp(-fb * 6) * .25;
      amp[i] = Math.min(1, a);
    } })();
  function drawWave() {
    const W = wave.width, H = wave.height, bw = W / WN, ph = S.t / LOOP;
    wctx.clearRect(0, 0, W, H);
    for (let b = 0; b <= 16; b++) { const x = b / 16 * W; wctx.fillStyle = b % 4 === 0 ? 'rgba(204,255,0,.35)' : 'rgba(255,255,255,.07)'; wctx.fillRect(x, 0, b % 4 === 0 ? 2 : 1, H); if (b % 4 === 0 && b < 16) { wctx.fillStyle = 'rgba(204,255,0,.8)'; wctx.font = '700 20px Inter, sans-serif'; wctx.fillText('BAR ' + (b / 4 + 1), x + 8, 26); } }
    for (let i = 0; i < WN; i++) {
      const played = i / WN < ph, h = amp[i] * (H * .42);
      wctx.fillStyle = played ? '#CCFF00' : 'rgba(242,244,247,.38)';
      wctx.fillRect(i * bw + 1, H / 2 - h, bw - 2, h * 2);
    }
    wctx.fillStyle = '#fff'; wctx.fillRect(ph * W - 1.5, 0, 3, H);
  }
  let scrubbing = false;
  const scrubTo = e => { const r = wave.getBoundingClientRect(); S.t = Math.min(LOOP - .001, Math.max(0, (e.clientX - r.left) / r.width * LOOP)); S.cam = camAt(S.t); paintCams(); if (S.playing) startClock(); };
  wave.addEventListener('pointerdown', e => { scrubbing = true; wave.setPointerCapture(e.pointerId); scrubTo(e); });
  wave.addEventListener('pointermove', e => { if (scrubbing) scrubTo(e); });
  wave.addEventListener('pointerup', () => { scrubbing = false; });

  /* ---------- render loop ---------- */
  const pgm = $('#pgm'), pctx = pgm.getContext('2d');
  const dots = $$('.beat-dots i');
  let lastFrame = performance.now(), visible = true;
  const tcFmt = t => { const f = Math.floor(t * 24); return `00:${String(Math.floor(f / 24)).padStart(2, '0')}:${String(f % 24).padStart(2, '0')}`; };
  function frame(now) {
    const dt = Math.min(.1, (now - lastFrame) / 1000); lastFrame = now;
    if (S.playing && !scrubbing) {
      S.abs += dt;
      S.t = (startT + (clockNow() - audioStart)) % LOOP; if (S.t < 0) S.t += LOOP;
      const beat = Math.floor(S.t / BEAT);
      if (beat !== S.lastBeat) {
        S.lastBeat = beat; S.punch = .06;
        if (S.auto && beat % 4 === 0 && !(S.manualUntil && S.abs < S.manualUntil)) {
          const pattern = ['A', 'C', 'B', 'D'];
          cut(pattern[(beat / 4) % 4], false);
        }
      }
      const c = camAt(S.t); if (c !== S.cam) { S.cam = c; S.flash = 1; paintCams(); }
    }
    // speed ramp runs across each bar
    const u = (S.t % (4 * BEAT)) / (4 * BEAT);
    const sp = S.playing ? speedAt(u) : 1;
    S.m += dt * (S.playing ? sp : .25);
    S.punch *= Math.pow(.02, dt);
    // program: frame-blend (ghosting) when slowed down, like optical-flow-less slow motion
    pctx.globalAlpha = S.playing ? Math.min(1, .25 + sp * .85) : 1;
    drawCam(pctx, camById(S.cam), pgm.width, pgm.height, S.m, S.punch);
    pctx.globalAlpha = 1;
    if (S.flash > 0) { pctx.fillStyle = `rgba(255,255,255,${S.flash * .35})`; pctx.fillRect(0, 0, pgm.width, pgm.height); S.flash = Math.max(0, S.flash - dt * 6); }
    $('#hudSpd').textContent = `SPEED ${Math.round(sp * 100)}%`;
    phase.setAttribute('cx', px(u)); phase.setAttribute('cy', py(sp));
    if (visible) CAMS.forEach(c => drawCam(c.prev, c, 320, 180, now / 1000, 0));
    const b = Math.floor(S.t / BEAT);
    dots.forEach((d, i) => d.classList.toggle('on', S.playing && b % 4 === i));
    $('#barOut').textContent = `Bar ${Math.floor(b / 4) + 1} · Beat ${b % 4 + 1}`;
    $('#tc').firstChild.textContent = tcFmt(S.t);
    drawWave();
    requestAnimationFrame(frame);
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe($('#studio'));

  Promise.all(CAMS.map(c => loadImg(c.src).then(i => { c.img = i; }))).then(() => {
    paintCams(); drawCuts(); requestAnimationFrame(frame);
  });

  /* ---------- GSAP ---------- */
  if (!hasGsap) { $$('.rv').forEach(n => { n.style.opacity = 1; n.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (reduced) { gsap.set('.rv', { opacity: 1, y: 0 }); return; }
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero h1 .row > span', { yPercent: 110, skewY: 10, duration: 1, stagger: .1 })
    .from('.hero-bg img', { scale: 1.3, duration: 1.8 }, 0)
    .from('.rv-h', { y: 20, opacity: 0, duration: .8, stagger: .08 }, .3);
  gsap.to('.hero-bg img', { yPercent: 18, scale: 1.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .8, ease: 'expo.out', stagger: .07 }) });
})();
