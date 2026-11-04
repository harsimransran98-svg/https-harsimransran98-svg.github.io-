/* Afterglow — colour grade & edit suite simulator (Bazozo Studio) */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!window.gsap;
  $('#year').textContent = new Date().getFullYear();
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  /* ---------- clapperboard menu ---------- */
  const btn = $('#menuBtn'), menu = $('#menu');
  function setMenu(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { menu.hidden = false; if (hasGsap && !reduced) gsap.fromTo(menu, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: 'power3.out' }); }
    else menu.hidden = true;
  }
  btn.addEventListener('click', e => { e.stopPropagation(); setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });

  /* ---------- looks: per-channel curves + saturation + split toning ---------- */
  const LOOKS = {
    kodak: { name: 'Kodak 2383', note: 'Print-film emulation: rich contrast, warm highlights, slightly cool shadows and a gentle highlight roll-off.',
      contrast: .55, lift: [.02, .012, .03], gamma: [1, .98, .94], gain: [1.06, 1, .9], sat: .92, shadow: [0, .01, .035], high: [.05, .02, -.04] },
    teal: { name: 'Teal & Orange', note: 'Blockbuster split-tone: teal pushed into the shadows, warm orange into skin and highlights.',
      contrast: .42, lift: [0, .01, .02], gamma: [1, 1, 1], gain: [1.03, 1, .96], sat: 1.15, shadow: [-.07, .03, .08], high: [.09, .025, -.08] },
    bleach: { name: 'Bleach Bypass', note: 'Silver retained in the print: low saturation, hard contrast, metallic highlights.',
      contrast: .85, lift: [-.01, -.01, -.01], gamma: [1, 1, 1], gain: [1.05, 1.05, 1.04], sat: .38, shadow: [0, 0, .01], high: [.02, .02, .01] },
    neon: { name: 'Neon Nocturne', note: 'Night look: exposure pulled down, blacks crushed, magenta shadows and cyan highlights.',
      contrast: .6, lift: [-.03, -.04, -.01], gamma: [.92, .9, 1.06], gain: [.9, .84, 1.02], sat: 1.35, shadow: [.06, -.02, .13], high: [-.05, .08, .1] }
  };
  function tables(L) {
    return [0, 1, 2].map(c => {
      const t = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        let x = i / 255;
        const s = x * x * (3 - 2 * x);
        x = x + (s - x) * L.contrast;
        x = L.gain[c] * (x + L.lift[c] * (1 - x));
        x = Math.pow(Math.max(0, x), 1 / L.gamma[c]);
        t[i] = x;
      }
      return t;
    });
  }
  const TABLES = Object.fromEntries(Object.entries(LOOKS).map(([k, L]) => [k, tables(L)]));
  const clamp8 = v => v < 0 ? 0 : v > 1 ? 255 : v * 255;
  function grade(src, dst, key, strength) {
    const L = LOOKS[key], [TR, TG, TB] = TABLES[key];
    for (let i = 0; i < src.length; i += 4) {
      const r0 = src[i], g0 = src[i + 1], b0 = src[i + 2];
      let r = TR[r0], g = TG[g0], b = TB[b0];
      const y = .2126 * r + .7152 * g + .0722 * b;
      r = y + (r - y) * L.sat; g = y + (g - y) * L.sat; b = y + (b - y) * L.sat;
      const sw = (1 - y) * (1 - y), hw = y * y;
      r += L.shadow[0] * sw + L.high[0] * hw; g += L.shadow[1] * sw + L.high[1] * hw; b += L.shadow[2] * sw + L.high[2] * hw;
      dst[i] = r0 + (clamp8(r) - r0) * strength;
      dst[i + 1] = g0 + (clamp8(g) - g0) * strength;
      dst[i + 2] = b0 + (clamp8(b) - b0) * strength;
      dst[i + 3] = 255;
    }
  }
  // flat "camera log": lifted blacks, compressed highlights, low saturation, faint green cast
  function toLog(src, dst) {
    for (let i = 0; i < src.length; i += 4) {
      const r = src[i] / 255, g = src[i + 1] / 255, b = src[i + 2] / 255;
      const y = .2126 * r + .7152 * g + .0722 * b;
      const f = v => .13 + .66 * Math.pow(y + (v - y) * .5, .78);
      dst[i] = f(r) * 255; dst[i + 1] = (f(g) + .012) * 255; dst[i + 2] = f(b) * 255; dst[i + 3] = 255;
    }
  }

  /* ---------- clips ---------- */
  const W = 1200, H = 510, SW = 1320, SH = 561; // source canvases are oversized for Ken Burns moves
  const DUR = 30, FPS = 24;
  const CLIPS = [
    { src: '../images/driftwoodfilms.jpg', name: 'SC12_A001', shot: 'SC12 · TK3 · Set', start: 0, end: 10, focus: [.55, .55], kb: [1.0, 1.08, -20, 0] },
    { src: '../images/veranostudio.jpg', name: 'SC04_B007', shot: 'SC04 · TK1 · Portrait', start: 10, end: 20, focus: [.55, .3], kb: [1.06, 1.0, 0, 12] },
    { src: '../images/kettleash.jpg', name: 'SC21_C003', shot: 'SC21 · TK5 · Product', start: 20, end: 30, focus: [.5, .45], kb: [1.0, 1.1, 10, -8] }
  ];
  const TITLES = [{ start: 1.5, end: 6, text: 'AFTERGLOW', sub: 'A BAZOZO STUDIO GRADE' }, { start: 25, end: 29.5, text: 'GRADED IN AFTERGLOW', sub: 'ARRI LOGC4 → KODAK 2383' }];
  let pixelMode = true; // false if the browser blocks getImageData (e.g. opened from file://)
  const CSS_LOOKS = { kodak: 'contrast(1.12) saturate(.92) sepia(.12)', teal: 'contrast(1.08) saturate(1.2) hue-rotate(-8deg)', bleach: 'contrast(1.35) saturate(.4)', neon: 'brightness(.8) contrast(1.15) saturate(1.4) hue-rotate(18deg)' };

  function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function coverDraw(ctx, img, w, h, focus) {
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    ctx.drawImage(img, (w - dw) * focus[0], (h - dh) * focus[1], dw, dh);
  }
  function loadClip(c) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => {
        c.img = img;
        c.srcC = mkCanvas(SW, SH);
        coverDraw(c.srcC.getContext('2d'), img, SW, SH, c.focus);
        c.logC = mkCanvas(SW, SH);
        try {
          const sctx = c.srcC.getContext('2d', { willReadFrequently: true });
          c.data = sctx.getImageData(0, 0, SW, SH);
          const out = new ImageData(SW, SH); toLog(c.data.data, out.data);
          c.logC.getContext('2d').putImageData(out, 0, 0);
        } catch (e) {
          pixelMode = false;
          const lctx = c.logC.getContext('2d'); lctx.filter = 'contrast(.62) saturate(.5) brightness(1.08)'; lctx.drawImage(c.srcC, 0, 0);
        }
        c.cache = {};
        res();
      };
      img.onerror = res;
      img.src = c.src;
    });
  }
  function gradedFor(c, key, strength) {
    const k = key + ':' + strength.toFixed(2);
    if (c.cache[k]) return c.cache[k];
    const out = mkCanvas(SW, SH), ctx = out.getContext('2d');
    if (pixelMode && c.data) {
      const id = new ImageData(SW, SH); grade(c.data.data, id.data, key, strength); ctx.putImageData(id, 0, 0);
    } else {
      ctx.drawImage(c.srcC, 0, 0); ctx.globalAlpha = strength; ctx.filter = CSS_LOOKS[key]; ctx.drawImage(c.srcC, 0, 0);
    }
    const keys = Object.keys(c.cache); if (keys.length > 6) delete c.cache[keys[0]]; // keep memory bounded
    c.cache[k] = out;
    return out;
  }

  /* ---------- state ---------- */
  const S = { t: 3.2, playing: false, wipe: .5, look: 'kodak', strength: 1, bypass: false, prevLook: null, xf: 1 };
  const cv = $('#cv'), ctx = cv.getContext('2d');
  const clipAt = t => CLIPS.find(c => t >= c.start && t < c.end) || CLIPS[CLIPS.length - 1];

  function drawClipFrame(c, t, which) {
    const p = Math.min(1, Math.max(0, (t - c.start) / (c.end - c.start)));
    const [s0, s1, dx, dy] = c.kb;
    const sc = s0 + (s1 - s0) * p;
    const w = W * sc * (SW / W) / 1.1, h = H * sc * (SH / H) / 1.1;
    const x = (W - w) / 2 + dx * p, y = (H - h) / 2 + dy * p;
    const source = which === 'log' ? c.logC : gradedFor(c, which, S.strength);
    ctx.drawImage(source, x, y, w, h);
  }
  function drawSide(t, which) {
    const c = clipAt(t);
    drawClipFrame(c, t, which);
    // half-second cross-dissolve into the next clip
    const next = CLIPS[CLIPS.indexOf(c) + 1];
    if (next && t > c.end - .5) { ctx.globalAlpha = (t - (c.end - .5)) / .5; drawClipFrame(next, next.start, which); ctx.globalAlpha = 1; }
  }
  function render() {
    if (!CLIPS[0].srcC) return;
    const t = S.t, splitX = Math.round(W * S.wipe);
    ctx.clearRect(0, 0, W, H);
    // left of the wipe: flat log
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, splitX, H); ctx.clip(); drawSide(t, 'log'); ctx.restore();
    // right of the wipe: the grade (cross-fading between looks when one is switched)
    ctx.save(); ctx.beginPath(); ctx.rect(splitX, 0, W - splitX, H); ctx.clip();
    if (S.bypass) drawSide(t, 'log');
    else {
      if (S.prevLook && S.xf < 1) { drawSide(t, S.prevLook); ctx.globalAlpha = S.xf; }
      drawSide(t, S.look); ctx.globalAlpha = 1;
    }
    ctx.restore();
    // V2 titles
    TITLES.forEach(T => {
      if (t < T.start || t > T.end) return;
      const a = Math.min(1, (t - T.start) / .6, (T.end - t) / .6);
      ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.fillStyle = '#EDEDEF';
      ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 18;
      ctx.font = `400 ${Math.round(H * .2)}px "Bebas Neue", Impact, sans-serif`; ctx.fillText(T.text, W / 2, H * .56);
      ctx.font = `500 ${Math.round(H * .034)}px "IBM Plex Mono", monospace`; ctx.fillText(T.sub, W / 2, H * .66);
      ctx.restore();
    });
    // UI readouts
    const c = clipAt(t);
    $('#clipName').textContent = c.name; $('#hudShot').textContent = c.shot;
    $('#tc').textContent = tc(t);
    $('#playhead').style.left = `calc(${laneLeft()}px + (100% - ${laneLeft()}px - 10px) * ${t / DUR})`;
    $$('#laneV1 .clip').forEach((n, i) => n.classList.toggle('on', CLIPS[i] === c));
  }
  const tc = t => { const f = Math.floor(t * FPS), fr = f % FPS, s = Math.floor(f / FPS); return `00:00:${String(s).padStart(2, '0')}:${String(fr).padStart(2, '0')}`; };

  /* ---------- scopes (sampled from what the viewer actually shows) ---------- */
  const SC = mkCanvas(160, 68), sctx = SC.getContext('2d', { willReadFrequently: true });
  const parade = $('#parade'), pctx = parade.getContext('2d'), histo = $('#histo'), hctx = histo.getContext('2d');
  const BINS = 64;
  let hist = { r: new Float32Array(BINS), g: new Float32Array(BINS), b: new Float32Array(BINS), y: new Float32Array(BINS) };
  let histTarget = null;
  function sampleScopes() {
    sctx.drawImage(cv, 0, 0, SC.width, SC.height);
    let d;
    try { d = sctx.getImageData(0, 0, SC.width, SC.height).data; } catch (e) { return; }
    // parade: each column's R, G and B plotted in three panels
    pctx.fillStyle = '#050506'; pctx.fillRect(0, 0, parade.width, parade.height);
    pctx.strokeStyle = 'rgba(255,255,255,.06)';
    for (let k = 1; k < 4; k++) { const y = parade.height * k / 4; pctx.beginPath(); pctx.moveTo(0, y); pctx.lineTo(parade.width, y); pctx.stroke(); }
    const pw = parade.width / 3, cols = ['rgba(255,70,70,.16)', 'rgba(70,255,120,.16)', 'rgba(80,140,255,.18)'];
    pctx.globalCompositeOperation = 'lighter';
    for (let ch = 0; ch < 3; ch++) {
      pctx.fillStyle = cols[ch];
      for (let x = 0; x < SC.width; x++) for (let y = 0; y < SC.height; y += 1) {
        const v = d[(y * SC.width + x) * 4 + ch];
        pctx.fillRect(ch * pw + x / SC.width * (pw - 4) + 2, parade.height - 4 - v / 255 * (parade.height - 8), 1.2, 1.2);
      }
    }
    pctx.globalCompositeOperation = 'source-over';
    // histogram target
    const T = { r: new Float32Array(BINS), g: new Float32Array(BINS), b: new Float32Array(BINS), y: new Float32Array(BINS) };
    for (let i = 0; i < d.length; i += 4) {
      T.r[d[i] >> 2]++; T.g[d[i + 1] >> 2]++; T.b[d[i + 2] >> 2]++;
      T.y[Math.min(63, (.2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]) >> 2)]++;
    }
    const m = Math.max(...T.y, ...T.r, ...T.g, ...T.b) || 1;
    for (const k in T) for (let i = 0; i < BINS; i++) T[k][i] /= m;
    histTarget = T;
  }
  function drawHisto() {
    if (histTarget) for (const k in hist) for (let i = 0; i < BINS; i++) hist[k][i] += (histTarget[k][i] - hist[k][i]) * .18; // eased so the scope visibly settles
    hctx.fillStyle = '#050506'; hctx.fillRect(0, 0, histo.width, histo.height);
    const bw = histo.width / BINS, hh = histo.height - 6;
    hctx.globalCompositeOperation = 'lighter';
    [['r', 'rgba(255,60,60,.5)'], ['g', 'rgba(60,255,110,.45)'], ['b', 'rgba(80,130,255,.55)']].forEach(([k, col]) => {
      hctx.fillStyle = col; hctx.beginPath(); hctx.moveTo(0, histo.height);
      for (let i = 0; i < BINS; i++) hctx.lineTo(i * bw + bw / 2, histo.height - 3 - hist[k][i] * hh);
      hctx.lineTo(histo.width, histo.height); hctx.fill();
    });
    hctx.globalCompositeOperation = 'source-over';
    hctx.strokeStyle = 'rgba(237,237,239,.85)'; hctx.lineWidth = 1.2; hctx.beginPath();
    for (let i = 0; i < BINS; i++) hctx[i ? 'lineTo' : 'moveTo'](i * bw + bw / 2, histo.height - 3 - hist.y[i] * hh);
    hctx.stroke();
  }

  /* ---------- LUT buttons ---------- */
  const lutsEl = $('#luts');
  Object.entries(LOOKS).forEach(([k, L]) => {
    const b = el('button', 'lut'); b.type = 'button'; b.dataset.k = k; b.setAttribute('aria-pressed', String(k === S.look));
    const sw = el('span', 'sw'); sw.setAttribute('aria-hidden', 'true');
    const nm = el('span', 'nm'); nm.append(el('span', 'led'), document.createTextNode(L.name));
    b.append(sw, nm);
    b.addEventListener('click', () => setLook(k));
    lutsEl.append(b);
  });
  function setLook(k) {
    if (k === S.look) return;
    S.prevLook = S.look; S.look = k; S.xf = 0; S.bypass = false;
    $('#bypassBtn').setAttribute('aria-pressed', 'false');
    $$('.lut').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
    $('#lutName').textContent = LOOKS[k].name; $('#gradeTag').textContent = 'GRADED · ' + LOOKS[k].name.toUpperCase();
    $('#note').textContent = LOOKS[k].note;
    if (hasGsap && !reduced) gsap.to(S, { xf: 1, duration: .55, ease: 'power2.inOut', onUpdate: render, onComplete: () => { S.prevLook = null; sampleScopes(); } });
    else { S.xf = 1; S.prevLook = null; render(); sampleScopes(); }
  }
  function lutThumbs() {
    const c = CLIPS[0]; if (!c.srcC) return;
    $$('.lut').forEach(b => {
      const t = mkCanvas(188, 80), tctx = t.getContext('2d');
      tctx.drawImage(gradedFor(c, b.dataset.k, 1), 0, 0, 188, 80);
      try { b.querySelector('.sw').style.backgroundImage = `url(${t.toDataURL('image/jpeg', .7)})`; } catch (e) { /* tainted: leave plain swatch */ }
    });
  }

  /* ---------- strength, bypass, grain ---------- */
  const str = $('#strength');
  let strPending = false;
  str.addEventListener('input', () => {
    str.style.setProperty('--p', str.value + '%'); $('#strOut').textContent = str.value + '%';
    S.strength = Math.round(+str.value / 5) * .05; // snap to 5% steps so results can be cached
    if (!strPending) { strPending = true; requestAnimationFrame(() => { strPending = false; render(); sampleScopes(); }); }
  });
  $('#bypassBtn').addEventListener('click', e => { S.bypass = !S.bypass; e.currentTarget.setAttribute('aria-pressed', String(S.bypass)); render(); sampleScopes(); });
  $('#grainBtn').addEventListener('click', e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', String(on)); $('.grain').hidden = !on; });

  /* ---------- wipe ---------- */
  const viewer = $('#viewer'), wipe = $('#wipe');
  function setWipe(v) {
    S.wipe = Math.min(1, Math.max(0, v));
    wipe.style.left = (S.wipe * 100) + '%';
    viewer.setAttribute('aria-valuenow', Math.round(S.wipe * 100));
    render();
  }
  let dragging = false;
  viewer.addEventListener('pointerdown', e => { dragging = true; viewer.setPointerCapture(e.pointerId); const r = viewer.getBoundingClientRect(); setWipe((e.clientX - r.left) / r.width); });
  viewer.addEventListener('pointermove', e => { if (!dragging) return; const r = viewer.getBoundingClientRect(); setWipe((e.clientX - r.left) / r.width); });
  viewer.addEventListener('pointerup', () => { dragging = false; sampleScopes(); });
  viewer.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { setWipe(S.wipe - .05); e.preventDefault(); } if (e.key === 'ArrowRight') { setWipe(S.wipe + .05); e.preventDefault(); } });

  /* ---------- timeline ---------- */
  const laneLeft = () => (window.innerWidth <= 640 ? 40 : 54) + 10;
  const ruler = $('#ruler');
  for (let s = 0; s <= DUR; s += 5) {
    const i = el('i'); i.style.left = (s / DUR * 100) + '%'; ruler.append(i);
    if (s < DUR) { const sp = el('span', null, `00:${String(s).padStart(2, '0')}`); sp.style.left = (s / DUR * 100) + '%'; if (s === 0) sp.style.transform = 'none'; ruler.append(sp); }
  }
  const place = (n, a, b) => { n.style.left = (a / DUR * 100) + '%'; n.style.width = ((b - a) / DUR * 100) + '%'; };
  CLIPS.forEach(c => {
    const n = el('div', 'clip v'); place(n, c.start, c.end);
    const th = el('span', 'th-img'); th.style.backgroundImage = `url(${c.src})`; n.append(th, el('span', null, c.name));
    n.addEventListener('click', e => { e.stopPropagation(); seek(c.start + .8); });
    $('#laneV1').append(n);
  });
  TITLES.forEach(T => { const n = el('div', 'clip t'); place(n, T.start, T.end); n.append(el('span', null, 'TXT · ' + T.text)); $('#laneV2').append(n); });
  function waveClip(lane, cls, a, b, seed, beats) {
    const n = el('div', 'clip ' + cls); place(n, a, b);
    const c = el('canvas'); c.width = 600; c.height = 60; n.append(c); lane.append(n);
    const g = c.getContext('2d'); let x = seed;
    const rnd = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
    g.fillStyle = cls === 'a' ? '#5FE39A' : '#E8B36A';
    for (let i = 0; i < 300; i++) {
      const beat = beats ? Math.pow(Math.abs(Math.sin(i / 300 * (b - a) * Math.PI * 2)), 8) * .5 : 0;
      const h = (.15 + rnd() * .45 + beat) * 30;
      g.fillRect(i * 2, 30 - h, 1.4, h * 2);
    }
  }
  waveClip($('#laneA1'), 'a', 0, DUR, 7, true);
  [[2.5, 8.5], [12, 17.5], [21, 24.5]].forEach(([a, b], i) => waveClip($('#laneA2'), 'vo', a, b, 31 + i * 13, false));

  const tl = $('#tl');
  let scrubbing = false;
  const tFromX = clientX => { const r = tl.getBoundingClientRect(); const x0 = r.left + laneLeft(), x1 = r.right - 10; return Math.min(DUR - .001, Math.max(0, (clientX - x0) / (x1 - x0) * DUR)); };
  tl.addEventListener('pointerdown', e => { if (e.target.closest('.clip.v')) return; scrubbing = true; tl.setPointerCapture(e.pointerId); seek(tFromX(e.clientX)); });
  tl.addEventListener('pointermove', e => { if (scrubbing) seek(tFromX(e.clientX)); });
  tl.addEventListener('pointerup', () => { scrubbing = false; sampleScopes(); });
  function seek(t) { S.t = t; render(); if (!S.playing) sampleScopesThrottled(); }
  let lastSample = 0;
  function sampleScopesThrottled() { const now = performance.now(); if (now - lastSample > 120) { lastSample = now; sampleScopes(); } }

  /* ---------- transport ---------- */
  const playBtn = $('#playBtn');
  let last = 0;
  function loop(now) {
    if (!S.playing) return;
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    S.t = (S.t + dt) % DUR;
    render(); sampleScopesThrottled();
    requestAnimationFrame(loop);
  }
  function setPlay(on) {
    S.playing = on; playBtn.setAttribute('aria-pressed', String(on)); $('#playLbl').textContent = on ? 'Pause' : 'Play';
    if (on) { last = performance.now(); requestAnimationFrame(loop); } else sampleScopes();
  }
  playBtn.addEventListener('click', () => setPlay(!S.playing));
  document.addEventListener('keydown', e => { if (e.code === 'Space' && !['INPUT', 'BUTTON', 'A', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName) && document.activeElement !== viewer) { e.preventDefault(); setPlay(!S.playing); } });
  (function scopeTick() { drawHisto(); requestAnimationFrame(scopeTick); })();
  window.addEventListener('resize', render);

  /* ---------- boot ---------- */
  $('#note').textContent = LOOKS[S.look].note;
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.all([...CLIPS.map(loadClip), fontsReady]).then(() => {
    render(); sampleScopes(); lutThumbs();
    if (!pixelMode) $('#note').textContent = 'Preview mode: your browser blocked pixel access, so looks are approximated.';
    if (hasGsap && !reduced) {
      // demo the wipe once: sweep across so it's obvious it can be dragged
      const o = { v: .5 };
      gsap.timeline({ delay: .6 }).to(o, { v: .2, duration: .9, ease: 'power2.inOut', onUpdate: () => setWipe(o.v) })
        .to(o, { v: .8, duration: 1.2, ease: 'power2.inOut', onUpdate: () => setWipe(o.v) })
        .to(o, { v: .5, duration: .8, ease: 'power2.out', onUpdate: () => setWipe(o.v), onComplete: sampleScopes });
    }
  });
  if (hasGsap && !reduced) {
    gsap.from('.hero h1', { yPercent: 40, opacity: 0, duration: 1, ease: 'expo.out' });
    gsap.from('.suite .pane, .timeline', { y: 30, opacity: 0, duration: .9, stagger: .08, ease: 'expo.out', delay: .15 });
  }
})();
