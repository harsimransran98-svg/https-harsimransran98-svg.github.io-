/* Bazozo Reel: a clean, beat-cut transformation edit (idea -> wireframe -> design -> live -> 209 projects -> bazozo).
   One paused GSAP timeline on a 120 BPM grid; the soundtrack is synthesised offline with Web Audio and plays in sync. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const BPM = 120, B = 60 / BPM, bt = n => (n - 1) * B, DUR = bt(33);
  const params = new URLSearchParams(location.search), EXPORT = params.has('export');
  if(EXPORT) document.documentElement.classList.add('export');
  let reduced = false;
  gsap.matchMedia().add('(prefers-reduced-motion: reduce)', () => { reduced = true; });

  const fit = $('#fit'), stage = $('#stage'), frame = $('#frame'), shotsEl = $('#shots'), cap = $('#cap'), label = $('#label');
  const IMG = '../../images/preview/';
  const SITES = ['afterglow', 'castironcoffee', 'nordlysarchitect', 'foundrybikeco', 'saltcedar', 'waxtypefoundry', 'aetherlabs', 'terranovafarms', 'marlowfinch', 'solsticeenergy'];
  const TONES = ['#e7e2d8', '#dde3e7', '#ebdfd5', '#e0e6db', '#ece2e6', '#dedcea'];
  const KINDS = [
    ['chrome/clipqueue', 'Chrome extension', 'tall'], ['android/coinkeeper', 'Android app', 'square'], ['iosgames/cascadeblocks', 'iOS game', 'wide'],
    ['mac/batterybar', 'macOS app', 'square'], ['wordpress/backupvault', 'WordPress plugin', 'tall'], ['androidgames/blockcascade', 'Android game', 'wide']
  ];
  const state = { aspect: params.get('export') === 'h' || (!EXPORT && innerWidth > innerHeight) ? 'h' : 'v', t: 0 };
  const V = state.aspect === 'v';
  fit.classList.toggle('is-h', !V);
  const SIZE = V ? { tall: [620, 1000], square: [720, 691], wide: [780, 547] } : { tall: [440, 620], square: [600, 576], wide: [760, 533] };
  const [FW, FH] = SIZE.tall;

  /* images */
  const mk = (src, cls) => { const i = new Image(); i.src = src; i.alt = ''; i.decoding = 'sync'; if(cls) i.className = cls; shotsEl.append(i); return i; };
  const baaz = mk(IMG + 'baazrecords.webp');
  const sites = SITES.map(n => mk(IMG + n + '.webp'));
  const kinds = KINDS.map(k => mk(IMG + k[0] + '.webp', 'fill'));
  const all = [baaz, ...sites, ...kinds];
  const word = $('#word'); 'bazozo'.split('').forEach(ch => { const s = document.createElement('span'); s.textContent = ch; s.setAttribute('aria-hidden', 'true'); word.append(s); });
  const letters = [...word.children];
  const blocks = [...frame.querySelectorAll('.blk')];

  function fitStage(){ stage.style.transform = `scale(${fit.clientWidth / (V ? 900 : 1600)})`; }
  new ResizeObserver(fitStage).observe(fit);

  /* ---------- timeline ---------- */
  const tl = gsap.timeline({ paused: true });
  const say = (el, text, at) => tl.set(el, { textContent: text }, at);
  const bg = (c, at) => tl.set(stage, { backgroundColor: c }, at);
  const only = (img, at) => { tl.set(all, { autoAlpha: 0 }, at).set(img, { autoAlpha: 1 }, at); };

  tl.set(frame, { xPercent: -50, yPercent: -50, width: 18, height: 18, borderRadius: 9, backgroundColor: '#141414', borderWidth: 0 }, 0)
    .set(blocks, { autoAlpha: 0 }, 0).set(all, { autoAlpha: 0 }, 0).set('#end', { autoAlpha: 0 }, 0).set(stage, { backgroundColor: '#f2ede4' }, 0);
  say(cap, '01 — an idea', 0); say(label, '', 0);

  /* beats 1–4: a dot becomes a line becomes a page */
  tl.fromTo(frame, { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 0.02);
  tl.to(frame, { width: FW, height: 3, borderRadius: 2, duration: 0.32, ease: 'power3.out' }, bt(2));
  say(cap, '02 — a sketch', bt(3));
  tl.to(frame, { height: FH, borderRadius: 18, backgroundColor: '#ffffff', borderWidth: 2, duration: 0.4, ease: 'power3.inOut' }, bt(3));

  /* beats 5–8: wireframe lands block by block, on the eighths */
  say(cap, '03 — wireframe', bt(5));
  const slots = [[0], [1], [2], [3], [4], [5], [6, 7, 8]];
  slots.forEach((ids, k) => ids.forEach((id, j) => tl.fromTo(blocks[id], { autoAlpha: 0, scaleX: 0.2, transformOrigin: '0 50%' }, { autoAlpha: 1, scaleX: 1, duration: 0.22, ease: 'expo.out' }, bt(5) + k * B / 2 + j * 0.05)));

  /* beat 9: design drops in */
  say(cap, '04 — design', bt(9));
  tl.set(frame, { backgroundColor: '#0e0e0e', borderWidth: 0 }, bt(9)).fromTo(frame, { scale: 1.06 }, { scale: 1, duration: 0.45, ease: 'expo.out', immediateRender: false }, bt(9));
  const DESIGN = ['#262626', '#f4f1ea', '#f4f1ea', '#6d6d6d', '#e0322c', '#4a1513', '#1d1d1d', '#1d1d1d', '#1d1d1d'];
  blocks.forEach((b, i) => tl.set(b, { backgroundColor: DESIGN[i] }, bt(9)));

  /* beats 11–14: it goes live, a real build scrolls */
  say(cap, '05 — live', bt(11)); say(label, 'baazrecords.in', bt(11));
  tl.set(blocks, { autoAlpha: 0 }, bt(11)); only(baaz, bt(11));
  tl.set(frame, { borderRadius: 18 }, bt(11));
  tl.fromTo(baaz, { y: 0 }, { y: -(FW * 1800 / 640 - FH), duration: 4 * B - 0.1, ease: 'power2.inOut' }, bt(11));

  /* beats 15–22: one finished site per beat, double-time burst on 21–22 */
  say(cap, '06 — and many more', bt(15));
  const cuts = [15, 16, 17, 18, 19, 20, 21, 21.5, 22, 22.5];
  const count = { n: 1 };
  tl.fromTo(count, { n: 1 }, { n: 209, duration: bt(23) - bt(15), ease: 'power1.in', immediateRender: false, onUpdate: () => { label.textContent = String(Math.round(count.n)).padStart(3, '0') + ' projects shipped'; } }, bt(15));
  cuts.forEach((c, i) => {
    only(sites[i], bt(c)); bg(TONES[i % TONES.length], bt(c));
    tl.fromTo(sites[i], { y: 0 }, { y: -FH * 0.35, duration: c < 21 ? B : B / 2, ease: 'none' }, bt(c));
  });

  /* beats 23–28: not just websites, the frame reshapes for every discipline */
  say(cap, '07 — not just websites', bt(23));
  KINDS.forEach(([, name, shape], i) => {
    const at = bt(23 + i), [w, h] = SIZE[shape];
    tl.to(frame, { width: w, height: h, duration: 0.22, ease: 'expo.out' }, at);
    only(kinds[i], at); bg(TONES[(i + 2) % TONES.length], at); say(label, name, at);
    tl.fromTo(frame, { rotation: i % 2 ? 1.5 : -1.5 }, { rotation: 0, duration: 0.3, ease: 'expo.out', immediateRender: false }, at);
  });

  /* beat 29: hard cut to the wordmark */
  tl.set('#end', { autoAlpha: 1 }, bt(29));
  tl.fromTo(letters, { yPercent: 70, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: 'expo.out', stagger: B / 4 }, bt(29));
  tl.fromTo('#tag', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, bt(31));
  tl.fromTo('#url', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, bt(31.5));
  tl.set({}, {}, DUR);

  /* ---------- soundtrack: clean 120 BPM house in A minor ---------- */
  const mid = m => 440 * Math.pow(2, (m - 69) / 12);
  const CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 60, 64, 71], [55, 59, 62, 64]];   // Am7  Fmaj7  Cmaj9  G6
  const ROOT = [33, 29, 36, 31];
  let A;                                                                                     // the graph currently being written to

  function graph(ctx){
    const G = v => { const g = ctx.createGain(); g.gain.value = v; return g; };
    const master = G(0.8), comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.006; comp.release.value = 0.2;
    master.connect(comp); comp.connect(ctx.destination);
    const drum = G(1), music = G(1), rev = G(1), conv = ctx.createConvolver(), revOut = G(0.42);
    drum.connect(master); music.connect(master); rev.connect(conv); conv.connect(revOut); revOut.connect(master);
    const sr = ctx.sampleRate, ir = ctx.createBuffer(2, Math.floor(sr * 2.4), sr);
    for(let c = 0; c < 2; c++){ const d = ir.getChannelData(c); let lp = 0; for(let i = 0; i < d.length; i++){ lp += ((Math.random() * 2 - 1) - lp) * 0.3; d[i] = lp * Math.pow(1 - i / d.length, 3); } }
    conv.buffer = ir;
    const noise = ctx.createBuffer(1, sr, sr), nd = noise.getChannelData(0); for(let i = 0; i < sr; i++) nd[i] = Math.random() * 2 - 1;
    return { ctx, master, drum, music, rev, noise };
  }
  const gn = (dest, v = 1) => { const g = A.ctx.createGain(); g.gain.value = v; g.connect(dest); return g; };
  const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  const osc = (type, f, t, len, dest, det = 0) => { const o = A.ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = det; o.connect(dest); o.start(t); o.stop(t + len + 0.05); return o; };
  const send = (node, amt) => node.connect(gn(A.rev, amt));
  const noiseHit = (t, len, type, f, q, v, dest, f2) => { const s = A.ctx.createBufferSource(), fl = A.ctx.createBiquadFilter(), g = gn(dest, 0); s.buffer = A.noise; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); if(f2) fl.frequency.exponentialRampToValueAtTime(f2, t + len); fl.Q.value = q; s.connect(fl); fl.connect(g); env(g, t, 0.002, v, len); s.start(t, Math.random() * 0.5); s.stop(t + len + 0.05); return g; };
  const S = {
    duck(t){ const g = A.music.gain; g.setValueAtTime(0.35, t); g.linearRampToValueAtTime(1, t + 0.22); },
    kick(t, v = 1){ const g = gn(A.drum, 0), o = osc('sine', 150, t, 0.32, g); o.frequency.exponentialRampToValueAtTime(46, t + 0.09); env(g, t, 0.002, v, 0.3); noiseHit(t, 0.01, 'highpass', 3000, 0.7, 0.18 * v, A.drum); S.duck(t); },
    clap(t, v = 0.5){ const bus = gn(A.drum, 1); send(bus, 0.25); [0, 0.01, 0.022].forEach(k => noiseHit(t + k, 0.035, 'bandpass', 1300, 1.2, v, bus)); noiseHit(t + 0.03, 0.16, 'bandpass', 1500, 0.9, v * 0.6, bus); },
    hat(t, v = 0.1, open = false){ noiseHit(t, open ? 0.12 : 0.03, 'highpass', open ? 7500 : 9500, 0.8, v, A.drum); },
    tick(t, v = 0.12){ const g = gn(A.drum, 0); osc('sine', 1900, t, 0.03, g); env(g, t, 0.001, v, 0.025); },
    bass(t, m, len, v = 0.55){ const lp = A.ctx.createBiquadFilter(), g = gn(A.music, 0); lp.type = 'lowpass'; lp.frequency.value = 520; lp.connect(g); osc('sine', mid(m), t, len, lp); osc('triangle', mid(m + 12), t, len, gn(lp, 0.35)); env(g, t, 0.006, v, len); },
    stab(t, notes, len = 0.2, v = 0.16){ const lp = A.ctx.createBiquadFilter(), g = gn(A.music, 0); lp.type = 'lowpass'; lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(700, t + len); lp.Q.value = 2; lp.connect(g); send(g, 0.35); notes.forEach(m => { const n = gn(lp, 1 / notes.length); osc('sawtooth', mid(m), t, len, n, -8); osc('sawtooth', mid(m), t, len, n, 8); }); env(g, t, 0.004, v, len); },
    pluck(t, m, v = 0.09){ const lp = A.ctx.createBiquadFilter(), g = gn(A.music, 0); lp.type = 'lowpass'; lp.frequency.value = 3200; lp.connect(g); send(g, 0.5); osc('triangle', mid(m), t, 0.4, lp); osc('sine', mid(m + 12), t, 0.25, gn(lp, 0.3)); env(g, t, 0.002, v, 0.36); },
    pad(t, notes, len, v = 0.1){ const lp = A.ctx.createBiquadFilter(), g = gn(A.music, 0); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.connect(g); send(g, 0.6); notes.forEach(m => { const n = gn(lp, 1 / notes.length); osc('sawtooth', mid(m), t, len, n, -10); osc('sawtooth', mid(m), t, len, n, 10); }); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + len * 0.25); g.gain.setValueAtTime(v, t + len * 0.7); g.gain.linearRampToValueAtTime(0.0001, t + len); },
    bell(t, m, len = 1.6, v = 0.12){ const g = gn(A.music, 0); send(g, 0.7); osc('sine', mid(m), t, len, g); osc('sine', mid(m) * 2.76, t, len * 0.4, gn(g, 0.25)); env(g, t, 0.003, v, len); },
    riser(t, len, v = 0.25){ const g = noiseHit(t, len, 'bandpass', 400, 1.5, 0.001, A.music, 7000); g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + len * 0.97); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.02); send(g, 0.4); },
    impact(t, v = 0.8){ const g = gn(A.drum, 0), o = osc('sine', 70, t, 1.4, g); o.frequency.exponentialRampToValueAtTime(32, t + 1.2); env(g, t, 0.003, v, 1.3); const n = noiseHit(t, 0.9, 'lowpass', 1800, 0.7, 0.35, A.drum, 200); send(n, 0.5); }
  };
  const SD = B / 4;                                                           // one 1/16 step
  function step(i, time){
    const beat = i / 4 + 1, bar = Math.floor(i / 16), s = i % 16, ch = CH[bar % 4], root = ROOT[bar % 4];
    if(beat >= 29){                                                            // outro: the wordmark lands
      if(i === 112){ S.impact(time, 0.9); S.kick(time); S.pad(time, [53, 57, 60, 64, 67], 4 * B + 1.2, 0.13); S.bass(time, 29, 2.2, 0.5); S.bell(time, 76, 2.4); }
      if(i === 116) S.bell(time, 72, 2); if(i === 120) S.bell(time, 69, 2.6, 0.1);
      if(i >= 112 && i < 124 && s % 4 === 0) S.tick(time, 0.06);
      return;
    }
    if(beat < 9){                                                              // intro: ticks + plucked arpeggio while the page is drawn
      if(s % 4 === 0) S.tick(time, beat < 5 ? 0.09 : 0.12);
      if(s % 2 === 0) S.pluck(time, ch[(s / 2) % ch.length] + (s >= 8 ? 12 : 0), beat < 5 ? 0.13 : 0.16);
      if(i === 0) S.pad(time, CH[0], 8 * B, 0.12);
      if(i === 16) S.pad(time, CH[1], 8 * B, 0.12);
      if(beat >= 5 && s % 2 === 0) S.hat(time, 0.04);
      if(i === 24) S.riser(time, 4 * SD * 2);
      return;
    }
    if(i === 32) S.impact(time, 0.7);
    const gap = beat >= 28 && beat < 29;                                       // one-beat breath before the wordmark
    if(gap){ if(i === 108) S.riser(time, B * 0.98, 0.3); return; }
    if(s % 4 === 0) S.kick(time, s === 0 ? 1 : 0.9);
    if(s === 4 || s === 12) S.clap(time);
    if(beat >= 21 && beat < 23 && s % 2 === 0 && s !== 4 && s !== 12) S.clap(time, 0.18 + (s / 16) * 0.2);   // burst under the double-time cuts
    if(s % 4 === 2) S.hat(time, 0.12, true); else S.hat(time, s % 2 ? 0.035 : 0.06);
    if(s % 4 === 2) S.bass(time, root + (s === 14 ? 12 : 0), SD * 1.6);
    if(s === 3 || s === 6 || s === 10) S.stab(time, ch, s === 10 ? 0.3 : 0.18);
    if(beat >= 15 && s % 2 === 0) S.pluck(time, ch[(s / 2) % ch.length] + 12, 0.045);
  }
  const STEPS = Math.round(DUR / SD);
  async function renderBuffer(){
    const sr = 48000, off = new OfflineAudioContext(2, Math.ceil((DUR + 1.6) * sr), sr);
    A = graph(off); for(let i = 0; i < STEPS; i++) step(i, i * SD + 0.01);
    return off.startRendering();
  }
  async function renderAudio(){
    const buf = await renderBuffer(), n = buf.length, L = buf.getChannelData(0), R = buf.getChannelData(1), dv = new DataView(new ArrayBuffer(44 + n * 4));
    const w = (o, str) => [...str].forEach((c, k) => dv.setUint8(o + k, c.charCodeAt(0)));
    w(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true);
    dv.setUint32(24, 48000, true); dv.setUint32(28, 192000, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 4, true);
    for(let k = 0; k < n; k++){ dv.setInt16(44 + k * 4, Math.max(-1, Math.min(1, L[k])) * 32767, true); dv.setInt16(46 + k * 4, Math.max(-1, Math.min(1, R[k])) * 32767, true); }
    const u8 = new Uint8Array(dv.buffer); let bin = ''; for(let k = 0; k < u8.length; k += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(k, k + 0x8000));
    return btoa(bin);
  }

  /* ---------- playback (preview in the browser) ---------- */
  let ctx, src, t0 = 0, raf = 0, bufP;
  const playBtn = $('#play');
  function tick(){ const t = ctx.currentTime - t0; tl.seek(Math.min(t, DUR)); if(t < DUR + 1.6) raf = requestAnimationFrame(tick); else stop(); }
  function stop(){ cancelAnimationFrame(raf); if(src){ try{ src.stop(); }catch(e){} src = null; } playBtn.textContent = 'Play with sound'; }
  playBtn.addEventListener('click', async () => {
    if(src){ stop(); return; }
    ctx = ctx || new AudioContext(); await ctx.resume();
    bufP = bufP || renderBuffer(); const buf = await bufP;
    src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination);
    t0 = ctx.currentTime + 0.05; src.start(t0); playBtn.textContent = 'Stop'; tick();
  });

  async function renderAt(t){ tl.seek(t, false); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return true; }

  fitStage(); tl.seek(reduced ? DUR : 0);
  Promise.all([document.fonts.ready, ...all.map(i => i.decode().catch(() => null))]).then(() => {
    window.__ad = { state, DUR, B, renderAt, renderAudio };
  });
})();
