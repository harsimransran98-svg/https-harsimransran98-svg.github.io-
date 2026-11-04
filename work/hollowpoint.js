/* Hollow Point — keyframe curve editor + 3D wireframe + spatial audio (Bazozo Studio) */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  $('#year').textContent = new Date().getFullYear();
  const sv = (tag, attrs, parent, text) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (text != null) n.textContent = text; if (parent) parent.append(n); return n; };

  /* ---------- nav: rotary knob menu ---------- */
  const nav = $('#nav'), btn = $('#menuBtn'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    if (open && hasGsap && !reduced) gsap.from('.menu a', { x: -30, opacity: 0, duration: .6, stagger: .06, ease: 'expo.out' });
  }
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });

  // drum-pad ripple from the touch point
  document.addEventListener('pointerdown', e => {
    const p = e.target.closest('.pad'); if (!p) return;
    const r = p.getBoundingClientRect();
    p.style.setProperty('--x', (e.clientX - r.left) + 'px'); p.style.setProperty('--y', (e.clientY - r.top) + 'px');
    p.classList.remove('hit'); void p.offsetWidth; p.classList.add('hit');
  });

  /* ---------- easing curve editor ---------- */
  const E = { x1: .65, y1: 0, x2: .35, y2: 1 };
  const VMIN = -.4, VMAX = 1.6, X0 = 40, X1 = 290, YT = 18, YB = 302;
  const gx = u => X0 + (X1 - X0) * u, gy = v => YB - (v - VMIN) / (VMAX - VMIN) * (YB - YT);
  const bz = (a, b, c, d, t) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
  function ease(p) {
    let lo = 0, hi = 1, t = p;
    for (let i = 0; i < 26; i++) { t = (lo + hi) / 2; if (bz(0, E.x1, E.x2, 1, t) < p) lo = t; else hi = t; }
    return bz(0, E.y1, E.y2, 1, t);
  }
  const curve = $('#curve');
  curve.style.overflow = 'visible';
  [[0, 'frame 0'], [.25, '12'], [.5, '24'], [.75, '36'], [1, '48']].forEach(([u, t]) => { sv('line', { class: 'grid', x1: gx(u), x2: gx(u), y1: gy(VMIN), y2: gy(VMAX) }, curve); sv('text', { class: 'axis-t', x: gx(u), y: YB + 14, 'text-anchor': 'middle' }, curve, t); });
  [[0, 'A'], [1, 'B']].forEach(([v, t]) => { sv('line', { class: 'grid', x1: X0, x2: X1, y1: gy(v), y2: gy(v), 'stroke-dasharray': '2 4' }, curve); sv('text', { class: 'axis-t', x: X0 - 8, y: gy(v) + 3, 'text-anchor': 'end' }, curve, t); });
  sv('line', { class: 'lin', x1: gx(0), y1: gy(0), x2: gx(1), y2: gy(1) }, curve);
  const arm1 = sv('line', { class: 'arm' }, curve), arm2 = sv('line', { class: 'arm' }, curve);
  const path = sv('path', { class: 'path' }, curve);
  sv('circle', { class: 'end', cx: gx(0), cy: gy(0), r: 5 }, curve); sv('circle', { class: 'end', cx: gx(1), cy: gy(1), r: 5 }, curve);
  const phLine = sv('line', { class: 'ph-line' }, curve), ph = sv('circle', { class: 'ph', r: 6 }, curve);
  const hA = sv('circle', { class: 'h a', r: 10, tabindex: 0, role: 'slider', 'aria-label': 'First handle' }, curve);
  const hB = sv('circle', { class: 'h b', r: 10, tabindex: 0, role: 'slider', 'aria-label': 'Second handle' }, curve);
  const fmt = n => (Math.round(n * 100) / 100).toString();
  function drawCurve() {
    let d = '';
    for (let i = 0; i <= 80; i++) { const t = i / 80; d += (i ? 'L' : 'M') + gx(bz(0, E.x1, E.x2, 1, t)).toFixed(1) + ' ' + gy(bz(0, E.y1, E.y2, 1, t)).toFixed(1); }
    path.setAttribute('d', d);
    hA.setAttribute('cx', gx(E.x1)); hA.setAttribute('cy', gy(E.y1)); hB.setAttribute('cx', gx(E.x2)); hB.setAttribute('cy', gy(E.y2));
    arm1.setAttribute('x1', gx(0)); arm1.setAttribute('y1', gy(0)); arm1.setAttribute('x2', gx(E.x1)); arm1.setAttribute('y2', gy(E.y1));
    arm2.setAttribute('x1', gx(1)); arm2.setAttribute('y1', gy(1)); arm2.setAttribute('x2', gx(E.x2)); arm2.setAttribute('y2', gy(E.y2));
    $('#bez').textContent = `cubic-bezier(${fmt(E.x1)}, ${fmt(E.y1)}, ${fmt(E.x2)}, ${fmt(E.y2)})`;
  }
  const svgPt = e => { const p = curve.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(curve.getScreenCTM().inverse()); };
  const clampE = () => { E.x1 = Math.min(1, Math.max(0, E.x1)); E.x2 = Math.min(1, Math.max(0, E.x2)); E.y1 = Math.min(VMAX, Math.max(VMIN, E.y1)); E.y2 = Math.min(VMAX, Math.max(VMIN, E.y2)); };
  [[hA, 'x1', 'y1'], [hB, 'x2', 'y2']].forEach(([h, kx, ky]) => {
    let drag = false;
    h.addEventListener('pointerdown', e => { drag = true; h.setPointerCapture(e.pointerId); markChip(null); });
    h.addEventListener('pointermove', e => {
      if (!drag) return; const p = svgPt(e);
      E[kx] = (p.x - X0) / (X1 - X0); E[ky] = VMIN + (YB - p.y) / (YB - YT) * (VMAX - VMIN); clampE(); drawCurve();
    });
    h.addEventListener('pointerup', () => { drag = false; });
    h.addEventListener('keydown', e => {
      const st = .05, m = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, st], ArrowDown: [0, -st] }[e.key]; if (!m) return;
      e.preventDefault(); markChip(null); E[kx] += m[0]; E[ky] += m[1]; clampE(); drawCurve();
    });
  });
  function markChip(b) { $$('[data-e]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); }
  $$('[data-e]').forEach(b => b.addEventListener('click', () => {
    const [x1, y1, x2, y2] = b.dataset.e.split(',').map(Number); markChip(b);
    if (hasGsap && !reduced) gsap.to(E, { x1, y1, x2, y2, duration: .55, ease: 'power3.inOut', onUpdate: drawCurve });
    else { Object.assign(E, { x1, y1, x2, y2 }); drawCurve(); }
  }));
  $('#copyBtn').addEventListener('click', async e => {
    try { await navigator.clipboard.writeText($('#bez').textContent); e.currentTarget.textContent = 'Copied'; } catch (_) { e.currentTarget.textContent = 'Blocked'; }
    setTimeout(() => { $('#copyBtn').textContent = 'Copy'; }, 1200);
  });
  const durIn = $('#dur');
  let DUR = 2.4;
  durIn.addEventListener('input', () => { DUR = +durIn.value / 10; $('#durOut').textContent = DUR.toFixed(1) + ' s'; durIn.style.setProperty('--p', ((durIn.value - 6) / 44 * 100) + '%'); });
  durIn.style.setProperty('--p', ((24 - 6) / 44 * 100) + '%');
  drawCurve();

  /* ---------- 3D scene ---------- */
  const PATHS = {
    orbit: { name: 'Orbit the listener', at: v => { const a = -Math.PI / 2 + v * Math.PI * 2; return [3.2 * Math.sin(a), .7, 3.2 * Math.cos(a)]; } },
    fly: { name: 'Fly-by, left to right', at: v => [-7 + 14 * v, .9, 2.4] },
    dive: { name: 'Dive towards you', at: v => [1.4 * Math.sin(v * Math.PI), 4.2 - 3.5 * v, 11 - 10 * v] }
  };
  let pathKey = 'orbit';
  $$('[data-path]').forEach(b => b.addEventListener('click', () => {
    pathKey = b.dataset.path; $$('[data-path]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $('#pathName').textContent = PATHS[pathKey].name; trail.length = 0; T = 0;
  }));

  // icosphere (one subdivision): 42 vertices, 120 edges
  const ico = (() => {
    const t = (1 + Math.sqrt(5)) / 2;
    let V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
    let F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    const norm = v => { const l = Math.hypot(...v); return v.map(c => c / l); };
    V = V.map(norm);
    const cache = {}, mid = (a, b) => { const k = a < b ? a + '_' + b : b + '_' + a; if (cache[k] != null) return cache[k]; V.push(norm(V[a].map((c, i) => (c + V[b][i]) / 2))); return (cache[k] = V.length - 1); };
    const F2 = []; F.forEach(([a, b, c]) => { const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a); F2.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]); });
    const E2 = new Set(); F2.forEach(([a, b, c]) => [[a, b], [b, c], [c, a]].forEach(([p, q]) => E2.add(p < q ? p + ',' + q : q + ',' + p)));
    return { V, E: [...E2].map(s => s.split(',').map(Number)) };
  })();

  const stage = $('#stage'), ctx = stage.getContext('2d'), SW = stage.width, SH = stage.height;
  const CAM = { y: 3.4, z: -8.6, pitch: Math.atan2(3.4 - .6, 11), f: 900 };
  function proj(x, y, z) {
    const py = y - CAM.y, pz = z - CAM.z;
    const c = Math.cos(CAM.pitch), s = Math.sin(CAM.pitch);
    const yy = py * c + pz * s, zz = -py * s + pz * c;
    if (zz < .2) return null;
    return [SW / 2 + CAM.f * x / zz, SH * .58 - CAM.f * yy / zz, zz];
  }
  const trail = [];
  function drawScene(pos, rot, scale, speed) {
    ctx.clearRect(0, 0, SW, SH);
    // floor grid
    ctx.lineWidth = 1;
    for (let i = -8; i <= 8; i++) {
      const a = proj(i, 0, -4), b = proj(i, 0, 13); if (a && b) { ctx.strokeStyle = i === 0 ? 'rgba(46,242,208,.25)' : 'rgba(46,242,208,.08)'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    }
    for (let z = -4; z <= 13; z++) {
      const a = proj(-8, 0, z), b = proj(8, 0, z); if (a && b) { ctx.strokeStyle = z === 0 ? 'rgba(46,242,208,.25)' : 'rgba(46,242,208,.08)'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    }
    // listener: head ring, nose pointing forward (+z), ears
    ctx.strokeStyle = 'rgba(236,235,245,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, p = proj(Math.sin(a) * .55, .9, Math.cos(a) * .55); if (p) ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); } ctx.stroke();
    const n0 = proj(0, .9, .55), n1 = proj(0, .9, 1.0); if (n0 && n1) { ctx.beginPath(); ctx.moveTo(n0[0], n0[1]); ctx.lineTo(n1[0], n1[1]); ctx.stroke(); }
    [[-1, '#FF2E88'], [1, '#2EF2D0']].forEach(([s, c]) => { const p = proj(s * .6, .9, 0); if (p) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, Math.PI * 2); ctx.fill(); } });
    // motion trail
    trail.push(pos); if (trail.length > 40) trail.shift();
    trail.forEach((q, i) => { const p = proj(...q); if (!p) return; ctx.fillStyle = `rgba(255,46,136,${i / trail.length * .5})`; ctx.beginPath(); ctx.arc(p[0], p[1], 2 + i / trail.length * 3, 0, Math.PI * 2); ctx.fill(); });
    // shadow on the floor
    const sh = proj(pos[0], 0, pos[2]); if (sh) { ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(sh[0], sh[1], 900 / sh[2] * .6 * scale, 900 / sh[2] * .18 * scale, 0, 0, Math.PI * 2); ctx.fill(); }
    // wireframe icosphere
    const [ry, rx] = rot, cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx), R = .7 * scale;
    const P = ico.V.map(([x, y, z]) => {
      let X = x * cy + z * sy, Z = -x * sy + z * cy; let Y = y * cx - Z * sx; Z = y * sx + Z * cx;
      return proj(pos[0] + X * R, pos[1] + Y * R, pos[2] + Z * R);
    });
    const glow = Math.min(1, speed / 2.2);
    ico.E.forEach(([a, b]) => {
      const p = P[a], q = P[b]; if (!p || !q) return;
      const depth = Math.max(.15, Math.min(1, 1.6 - ((p[2] + q[2]) / 2 - (pos[2] - CAM.z)) * 1.2));
      ctx.strokeStyle = `rgba(${Math.round(46 + 209 * glow)},${Math.round(242 - 196 * glow)},${Math.round(208 - 72 * glow)},${depth})`;
      ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
    });
    P.forEach(p => { if (p) { ctx.fillStyle = 'rgba(236,235,245,.9)'; ctx.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3); } });
  }
  const radar = $('#radar'), rctx = radar.getContext('2d');
  function drawRadar(pos) {
    const W = radar.width, c = W / 2, sc = W / 2 / 8;
    rctx.clearRect(0, 0, W, W);
    rctx.strokeStyle = 'rgba(46,242,208,.18)'; rctx.lineWidth = 1.5;
    [1, 2, 3].forEach(k => { rctx.beginPath(); rctx.arc(c, c, k * W / 7, 0, Math.PI * 2); rctx.stroke(); });
    rctx.fillStyle = '#ECEBF5'; rctx.beginPath(); rctx.moveTo(c, c - 12); rctx.lineTo(c - 7, c + 7); rctx.lineTo(c + 7, c + 7); rctx.closePath(); rctx.fill();
    const x = c + pos[0] * sc, y = c - pos[2] * sc;
    rctx.fillStyle = '#FF2E88'; rctx.shadowColor = '#FF2E88'; rctx.shadowBlur = 14; rctx.beginPath(); rctx.arc(Math.max(6, Math.min(W - 6, x)), Math.max(6, Math.min(W - 6, y)), 7, 0, Math.PI * 2); rctx.fill(); rctx.shadowBlur = 0;
  }

  /* ---------- spatial audio (WebAudio, HRTF panner) ---------- */
  let A = null;
  function initAudio() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    const ctxA = new AC();
    const panner = new PannerNode(ctxA, { panningModel: 'HRTF', distanceModel: 'inverse', refDistance: 1.4, rolloffFactor: 1.1 });
    const master = ctxA.createGain(); master.gain.value = .85;
    const tone = ctxA.createGain(); tone.gain.value = .07;
    const lp = ctxA.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; lp.Q.value = 6;
    [110, 110.7, 164.8].forEach((f, i) => { const o = ctxA.createOscillator(); o.type = i === 2 ? 'triangle' : 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(); });
    lp.connect(tone).connect(panner);
    const nb = ctxA.createBuffer(1, ctxA.sampleRate * 2, ctxA.sampleRate), d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctxA.createBufferSource(); noise.buffer = nb; noise.loop = true;
    const bp = ctxA.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 1.1;
    const whoosh = ctxA.createGain(); whoosh.gain.value = 0;
    noise.connect(bp).connect(whoosh).connect(panner); noise.start();
    panner.connect(master); master.connect(ctxA.destination);
    const split = ctxA.createChannelSplitter(2), aL = ctxA.createAnalyser(), aR = ctxA.createAnalyser(); aL.fftSize = aR.fftSize = 512;
    master.connect(split); split.connect(aL, 0); split.connect(aR, 1);
    return { ctx: ctxA, panner, lp, bp, whoosh, aL, aR, buf: new Float32Array(512), on: true };
  }
  function blip() { if (!A || !A.on) return; const t = A.ctx.currentTime, o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.frequency.setValueAtTime(1400, t); o.frequency.exponentialRampToValueAtTime(700, t + .08); g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(.0001, t + .12); o.connect(g).connect(A.panner); o.start(t); o.stop(t + .14); }
  const audioBtn = $('#audioBtn');
  audioBtn.addEventListener('click', () => {
    if (!A) { A = initAudio(); if (!A) { $('#note').textContent = 'Your browser has no Web Audio support, so the lab runs silently.'; return; } }
    else if (A.on) { A.ctx.suspend(); A.on = false; }
    else { A.ctx.resume(); A.on = true; }
    if (A && A.on && A.ctx.state === 'suspended') A.ctx.resume();
    audioBtn.setAttribute('aria-pressed', String(!!(A && A.on)));
    audioBtn.textContent = A && A.on ? 'Sound on · stop' : 'Play with sound';
  });
  const rms = an => { an.getFloatTimeDomainData(A.buf); let s = 0; for (let i = 0; i < A.buf.length; i++) s += A.buf[i] * A.buf[i]; return Math.sqrt(s / A.buf.length); };

  /* ---------- main loop ---------- */
  let T = 0, last = performance.now(), prevV = 0, frames = 0, fpsT = 0, visible = true, hitDone = false;
  const HOLD = .5;
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    frames++; fpsT += dt; if (fpsT > .5) { $('#fpsOut').textContent = Math.round(frames / fpsT) + ' fps'; frames = 0; fpsT = 0; }
    T += reduced ? 0 : dt;
    if (T > DUR + HOLD) { T = 0; trail.length = 0; hitDone = false; }
    const p = Math.min(1, T / DUR), v = ease(p);
    if (p >= 1 && !hitDone) { hitDone = true; blip(); }
    const vel = dt > 0 ? (v - prevV) / dt * DUR : 0; prevV = v; // velocity in "A→B per clip" units
    const speed = Math.abs(vel);
    const pos = PATHS[pathKey].at(v);
    const rot = [v * Math.PI * 2 + now / 4000, v * Math.PI * .6 + .4];
    if (visible) { drawScene(pos, rot, 1 + Math.min(.35, speed * .08), speed); drawRadar(pos); }
    ph.setAttribute('cx', gx(p)); ph.setAttribute('cy', gy(v)); phLine.setAttribute('x1', gx(p)); phLine.setAttribute('x2', gx(p)); phLine.setAttribute('y1', gy(VMIN)); phLine.setAttribute('y2', gy(VMAX));
    $('#hudP').textContent = Math.round(p * 100) + '%'; $('#hudV').textContent = v.toFixed(2); $('#hudS').textContent = vel.toFixed(2);
    $('#hudA').textContent = Math.round(Math.atan2(pos[0], pos[2]) * 180 / Math.PI) + '°';
    if (A && A.on) {
      const t = A.ctx.currentTime;
      A.panner.positionX.setTargetAtTime(pos[0], t, .02); A.panner.positionY.setTargetAtTime(pos[1] - .9, t, .02); A.panner.positionZ.setTargetAtTime(-pos[2], t, .02);
      A.whoosh.gain.setTargetAtTime(Math.min(.55, speed * .16), t, .03);
      A.bp.frequency.setTargetAtTime(600 + Math.min(5000, speed * 1600), t, .03);
      A.lp.frequency.setTargetAtTime(350 + Math.min(3500, speed * 900), t, .04);
      $('#mL').style.height = Math.min(100, rms(A.aL) * 420) + '%'; $('#mR').style.height = Math.min(100, rms(A.aR) * 420) + '%';
    } else { $('#mL').style.height = '0%'; $('#mR').style.height = '0%'; }
    requestAnimationFrame(loop);
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe($('.stage'));
  requestAnimationFrame(loop);

  /* ---------- GSAP intro + reveals ---------- */
  if (!hasGsap) { $$('.rv').forEach(n => { n.style.opacity = 1; n.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (reduced) { gsap.set('.rv', { opacity: 1, y: 0 }); return; }
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero h1 .ln > span', { yPercent: 110, duration: 1.2, stagger: .12 })
    .from('.hero-img img', { scale: 1.2, opacity: 0, duration: 2 }, 0)
    .from('.rv-h', { y: 20, opacity: 0, duration: .9, stagger: .1 }, .4);
  gsap.to('.hero-img img', { yPercent: 15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .08 }) });
})();
