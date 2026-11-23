/* Academy App reel (Type B+C mix): the real app, recorded at natural speed.
   A "director" taps through the live app on a fixed script: launch → login → watermarked
   lecture → unlock → live re-skin for a new academy → live class → end card.
   Everything runs on page time, so the exporter can drive it with Chrome virtual time
   and every animation plays at its true speed. The soundtrack is rendered offline from
   the same script, so each tap gets its own soft click. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const params = new URLSearchParams(location.search), EXPORT = params.has('export');
  if (EXPORT) document.documentElement.classList.add('export');
  const state = { aspect: params.get('export') === 'h' || (!EXPORT && innerWidth > innerHeight * 1.2) ? 'h' : 'v' };
  const fit = $('#fit'), stage = $('#stage'), frame = $('#app'), taps = $('#taps'), cap = $('#cap'), end = $('#end');
  fit.classList.toggle('is-h', state.aspect === 'h');
  const root = document.documentElement.style;

  /* ---------------- the script (seconds from start) ---------------- */
  const NEW_NAME = 'Vidya Maths Classes';
  const CHAT = 'Thank you ma’am! 🙏';
  const CAPS = [
    [0.5, 3.0, 'Your academy. Your own app.', 'Your academy, your own app', 'Its own name, logo and colours on every screen. No platform branding.'],
    [3.2, 6.0, 'Students log in. No codes, no setup.', 'Log in, start learning', 'Students open the app and they are in. No academy codes.'],
    [7.6, 11.2, 'Every video is watermarked with the student’s email', 'Videos that can’t be shared', 'The student’s email drifts across every lecture, so screen recordings point back to them.'],
    [12.0, 15.8, 'Paid lectures unlock in one tap', 'Paid lectures, one tap', 'Free and paid courses with instant UPI, card or net-banking checkout.'],
    [16.4, 21.4, 'Pitching an academy? Re-skin the app live', 'Re-skin it live', 'Type the academy’s name, pick its colours. The whole app changes while they watch.'],
    [21.8, 24.2, 'Their name, their colours, everywhere', 'Their brand, everywhere', 'Home, courses, player, receipts: all in the academy’s own colours.'],
    [24.6, 28.0, 'Live classes with chat, built in', 'Live classes, built in', 'Go live from the owner app. Students join and ask doubts in the chat.'],
  ];
  const END_AT = 28.2, DUR = 31.6;
  const TAPS = [];                     // filled while the script runs; mirrored by the audio schedule below
  const SCHEDULE = [                   // [time, action, ...args]   (also read by renderAudio for tap clicks)
    [2.4, 'tap', '.demo-pick button', 0],
    [3.4, 'scroll', 380, 1.7],
    [5.5, 'tap', '.nav button', 1],
    [6.4, 'tap', '.course', 0],
    [7.3, 'tap', '.lec', 0],
    [11.4, 'tap', '.sheet .x', 0],
    [12.0, 'tap', '.lec.locked', 0],
    [13.5, 'tap', '.sheet .btn-p', 0],
    [15.7, 'tap', '.sheet .x', 0],
    [16.3, 'tap', '.customize', 0],
    [17.1, 'type', '.drawer input[aria-label="Academy name"]', NEW_NAME, 0.085],
    [19.3, 'tap', '.drawer .sw-row .sw', 3],
    [20.1, 'tap', '.drawer .sw-row .sw', 10],
    [20.9, 'tap', '.drawer .x', 0],
    [21.5, 'tap', '.nav button', 0],
    [22.1, 'scroll', 250, 1.2],
    [23.6, 'tap', '.nav button', 2],
    [24.4, 'tap', '.live-hero .btn', 0],
    [25.4, 'type', '.chat-form input', CHAT, 0.075],
    [26.9, 'tap', '.chat-form .btn', 0],
  ];
  const BRAND_AT = [[0, '#2952E3', '#FF9F1C'], [19.35, '#E8590C', '#FF9F1C'], [20.15, '#E8590C', '#FFD43B']];
  const STATUS_AT = [[0, '#2952E3', '#FFFFFF'], [2.45, '#F6F7FB', '#121528'], [24.45, '#0B0D18', '#FFFFFF']];

  /* ---------------- helpers (all on page time) ---------------- */
  let t0 = 0;
  const now = () => (performance.now() - t0) / 1000;
  const until = t => new Promise(r => { const loop = () => (now() >= t ? r() : setTimeout(loop, 6)); loop(); });
  const W = () => frame.contentWindow, D = () => frame.contentDocument;
  const find = (sel, i) => { const list = D().querySelectorAll(sel); return list[i] || null; };
  function ripple(x, y) {
    const dot = document.createElement('i'), ring = document.createElement('i');
    dot.className = 'tap'; ring.className = 'ring';
    for (const n of [dot, ring]) { n.style.left = x + 'px'; n.style.top = y + 'px'; taps.append(n); }
    gsap.fromTo(dot, { scale: .55, opacity: 0 }, { scale: 1, opacity: 1, duration: .12, ease: 'power2.out' });
    gsap.to(dot, { scale: .8, opacity: 0, duration: .35, delay: .22, ease: 'power2.in', onComplete: () => dot.remove() });
    gsap.fromTo(ring, { scale: .6, opacity: .9 }, { scale: 1.9, opacity: 0, duration: .55, ease: 'power2.out', onComplete: () => ring.remove() });
  }
  function point(elm) { const r = elm.getBoundingClientRect(); return [r.left + r.width / 2, 40 + r.top + r.height / 2]; }
  async function tap(sel, i) {
    const elm = find(sel, i); if (!elm) { console.warn('reel: missing', sel, i); return; }
    const [x, y] = point(elm); ripple(x, y); TAPS.push(now());
    await new Promise(r => setTimeout(r, 110));
    if (elm.focus && /INPUT|TEXTAREA/.test(elm.tagName)) elm.focus(); else elm.click();
  }
  async function type(sel, text, per) {
    const elm = find(sel, 0); if (!elm) return;
    const [x, y] = point(elm); ripple(x, y); elm.focus(); elm.value = '';
    await new Promise(r => setTimeout(r, 180));
    const chars = [...text];
    for (let k = 1; k <= chars.length; k++) {
      elm.value = chars.slice(0, k).join(''); elm.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, per * 1000));
    }
  }
  function scroll(to, secs) {
    return new Promise(r => {
      const w = W(), from = w.scrollY, s0 = performance.now();
      const ease = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const step = () => { const p = Math.min(1, (performance.now() - s0) / (secs * 1000)); w.scrollTo(0, from + (to - from) * ease(p)); if (p < 1) requestAnimationFrame(step); else r(); };
      requestAnimationFrame(step);
    });
  }
  function caption(i) {
    const c = CAPS[i];
    cap.textContent = c[2];
    $('#stepNo').textContent = String(i + 1).padStart(2, '0') + ' / ' + String(CAPS.length).padStart(2, '0');
    $('#big').textContent = c[3]; $('#sub').textContent = c[4];
    gsap.fromTo(cap, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .35, ease: 'power2.out' });
    gsap.fromTo('#side .big, #side .sub, #stepNo', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, stagger: .06, ease: 'power3.out' });
  }

  /* ---------------- director ---------------- */
  async function run() {
    const jobs = [];
    CAPS.forEach((c, i) => jobs.push((async () => { await until(c[0]); caption(i); await until(c[1]); gsap.to(cap, { opacity: 0, y: -4, duration: .3 }); })()));
    BRAND_AT.forEach(([t, b, b2]) => jobs.push((async () => { await until(t); root.setProperty('--brand', b); root.setProperty('--brand-2', b2); })()));
    STATUS_AT.forEach(([t, bg, ink]) => jobs.push((async () => { await until(t); root.setProperty('--status-bg', bg); root.setProperty('--status-ink', ink); })()));
    jobs.push((async () => {
      for (const [t, act, a, b, c] of SCHEDULE) {
        await until(t);
        if (act === 'tap') await tap(a, b);
        else if (act === 'type') await type(a, b, c);
        else if (act === 'scroll') await scroll(a, b);
      }
    })());
    jobs.push((async () => {
      await until(END_AT);
      end.style.visibility = 'visible';
      gsap.to(end, { opacity: 1, duration: .7, ease: 'power2.out' });
      gsap.from('.end > *', { y: 26, opacity: 0, duration: .8, stagger: .12, delay: .25, ease: 'power3.out' });
    })());
    await Promise.all(jobs);
  }

  /* ---------------- setup ---------------- */
  const clock = () => { const d = new Date(); $('#clock').textContent = (d.getHours() % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0'); };
  clock();
  ['ZM8ECpBuQYE', 'WUvTyaaNkzM', 'spUNpyF58BY', 'FSyAehMdpyI', 'QnQe0xW_JY4', 'fNk_zzaMoSs'].forEach(id => { const im = new Image(); im.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; });
  function freshApp() {
    try { Object.keys(localStorage).filter(k => k.startsWith('academyapp.')).forEach(k => localStorage.removeItem(k)); } catch (e) { /* storage blocked */ }
    root.setProperty('--brand', BRAND_AT[0][1]); root.setProperty('--brand-2', BRAND_AT[0][2]);
    root.setProperty('--status-bg', STATUS_AT[0][1]); root.setProperty('--status-ink', STATUS_AT[0][2]);
    end.style.opacity = '0'; end.style.visibility = 'hidden'; cap.style.opacity = '0';
    return new Promise(res => {
      frame.addEventListener('load', async () => {
        for (let i = 0; i < 200 && !(W().academyApp && W().academyApp.boot); i++) await new Promise(r => setTimeout(r, 25));
        try { await D().fonts.ready; } catch (e) { /* ignore */ }
        res();
      }, { once: true });
      frame.src = '../../work/academyapp.html?reel=1&r=' + Date.now();
    });
  }
  async function start() { t0 = performance.now(); W().academyApp.boot(); return run(); }

  /* fit the stage to the browser window when previewing */
  function fitStage() {
    if (EXPORT) return;
    const w = state.aspect === 'h' ? 1600 : 405, h = state.aspect === 'h' ? 900 : 720;
    stage.style.transform = `scale(${Math.min(innerWidth / w, innerHeight / h) * .96})`;
  }
  fitStage(); addEventListener('resize', fitStage);

  /* ---------------- soundtrack: calm 84 BPM keys, rendered offline ---------------- */
  const BPM = 84, B = 60 / BPM, TAIL = 1.2;
  const mid = m => 440 * Math.pow(2, (m - 69) / 12);
  const CH = [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 66]];   // Dmaj7 Bm7 Gmaj7 A6
  const ROOT = [38, 35, 31, 33];
  function tapTimes() {   // the same moments the director taps or types
    const out = [];
    for (const [t, act, , b, c] of SCHEDULE) {
      if (act === 'tap') out.push([t + .11, .5]);
      if (act === 'type') { out.push([t, .4]); [...b].forEach((_, k) => out.push([t + .18 + k * c, .16])); }
    }
    return out;
  }
  async function renderBuffer() {
    const sr = 48000, ctx = new OfflineAudioContext(2, Math.ceil((DUR + TAIL) * sr), sr);
    const G = v => { const g = ctx.createGain(); g.gain.value = v; return g; };
    const master = G(.85), comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 2.5; master.connect(comp); comp.connect(ctx.destination);
    const music = G(1), sfx = G(1), rev = G(1), conv = ctx.createConvolver(), revOut = G(.38);
    music.connect(master); sfx.connect(master); rev.connect(conv); conv.connect(revOut); revOut.connect(master);
    const ir = ctx.createBuffer(2, sr * 2.6, sr);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); let lp = 0; for (let i = 0; i < d.length; i++) { lp += ((Math.random() * 2 - 1) - lp) * .25; d[i] = lp * Math.pow(1 - i / d.length, 3.2); } }
    conv.buffer = ir;
    const noise = ctx.createBuffer(1, sr, sr), nd = noise.getChannelData(0); for (let i = 0; i < sr; i++) nd[i] = Math.random() * 2 - 1;
    const gn = (dest, v) => { const g = ctx.createGain(); g.gain.value = v; g.connect(dest); return g; };
    const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); };
    const osc = (type, f, t, len, dest) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.connect(dest); o.start(t); o.stop(t + len + .05); return o; };
    const keys = (t, notes, len, v) => {                          // soft electric-piano chord with a slow tremolo
      const g = gn(music, 0), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; lp.connect(g); g.connect(gn(rev, .5));
      notes.forEach((m, k) => { const n = gn(lp, 1 / notes.length); osc('sine', mid(m), t + k * .012, len, n); osc('triangle', mid(m) * 2, t + k * .012, len * .5, gn(n, .12)); });
      const trem = ctx.createOscillator(), td = ctx.createGain(); trem.frequency.value = 4.2; td.gain.value = v * .18; trem.connect(td); td.connect(g.gain); trem.start(t); trem.stop(t + len + .1);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .03); g.gain.setTargetAtTime(v * .55, t + .1, .6); g.gain.setTargetAtTime(.0001, t + len - .15, .12);
    };
    const bass = (t, m, len, v) => { const g = gn(music, 0), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; lp.connect(g); osc('sine', mid(m), t, len, lp); env(g, t, .02, v, len); };
    const shaker = (t, v) => { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = gn(music, 0); s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7000; s.connect(f); f.connect(g); env(g, t, .008, v, .05); s.start(t); s.stop(t + .08); };
    const kick = (t, v) => { const g = gn(music, 0), o = osc('sine', 110, t, .3, g); o.frequency.exponentialRampToValueAtTime(48, t + .12); env(g, t, .004, v, .28); };
    const bell = (t, m, v) => { const g = gn(music, 0); g.connect(gn(rev, .8)); osc('sine', mid(m), t, 2.4, g); osc('sine', mid(m) * 2.76, t, .8, gn(g, .2)); env(g, t, .004, v, 2.4); };
    const click = (t, v) => { const g = gn(sfx, 0); osc('sine', 2300, t, .03, g); env(g, t, .001, .1 * v, .03); const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g2 = gn(sfx, 0); s.buffer = noise; f.type = 'bandpass'; f.frequency.value = 3800; s.connect(f); f.connect(g2); env(g2, t, .001, .09 * v, .02); s.start(t); s.stop(t + .04); };
    // music: one chord per bar; groove enters gently after the splash and drops out under the end card
    for (let bar = 0; bar * 4 * B < END_AT; bar++) {
      const t = bar * 4 * B, ch = CH[bar % 4];
      keys(t, ch, 4 * B, bar === 0 ? .16 : .2);
      if (bar >= 1) bass(t, ROOT[bar % 4], 2 * B, .32), bass(t + 2.5 * B, ROOT[bar % 4] + 7, 1.4 * B, .22);
      for (let s = 0; s < 8; s++) { const tt = t + s * B / 2; if (tt >= END_AT) break; if (bar >= 1) shaker(tt, s % 2 ? .035 : .05); if (bar >= 2 && s % 4 === 0) kick(tt, .45); }
      if (bar % 2 === 1) [ch[3] + 12, ch[2] + 12].forEach((m, k) => bell(t + (2 + k) * B, m, .05));
    }
    // end card: open chord + a three-note bell signature
    keys(END_AT, [50, 57, 62, 66, 69, 73], 3.2, .2); bass(END_AT, 38, 3, .3);
    [74, 78, 81].forEach((m, k) => bell(END_AT + .3 + k * .32, m, .11));
    if (params.get('music') !== '0') tapTimes().forEach(([t, v]) => click(t, v));
    return ctx.startRendering();
  }
  async function renderAudio() {
    const buf = await renderBuffer(), n = buf.length, L = buf.getChannelData(0), R = buf.getChannelData(1), dv = new DataView(new ArrayBuffer(44 + n * 4));
    const w = (o, s) => [...s].forEach((c, k) => dv.setUint8(o + k, c.charCodeAt(0)));
    w(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true);
    dv.setUint32(24, 48000, true); dv.setUint32(28, 192000, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, n * 4, true);
    for (let k = 0; k < n; k++) { dv.setInt16(44 + k * 4, Math.max(-1, Math.min(1, L[k])) * 32767, true); dv.setInt16(46 + k * 4, Math.max(-1, Math.min(1, R[k])) * 32767, true); }
    const u8 = new Uint8Array(dv.buffer); let bin = ''; for (let k = 0; k < u8.length; k += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(k, k + 0x8000));
    return btoa(bin);
  }

  /* ---------------- preview in the browser ---------------- */
  const playBtn = $('#play');
  let actx = null, src = null;
  playBtn.addEventListener('click', async () => {
    playBtn.disabled = true; playBtn.textContent = 'Loading…';
    actx = actx || new AudioContext(); await actx.resume();
    const [buf] = await Promise.all([renderBuffer(), freshApp()]);
    if (src) try { src.stop(); } catch (e) { /* already stopped */ }
    src = actx.createBufferSource(); src.buffer = buf; src.connect(actx.destination); src.start();
    playBtn.textContent = 'Playing'; await start(); playBtn.disabled = false; playBtn.textContent = 'Replay';
  });

  /* exporter API */
  freshApp().then(() => { window.__reel = { state, DUR, start, renderAudio, taps: TAPS }; });
})();
