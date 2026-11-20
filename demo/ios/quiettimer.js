/* QuietTimer — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} } };
  let ac = null;
  const tone = (f = 440, d = .1, type = 'sine', v = .04) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d); o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d + .02); } catch (_) {} };
  const haptic = (p = 8) => { try { navigator.vibrate && navigator.vibrate(p); } catch (_) {} };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- fit the device to the space ---------- */
  const stage = $('#stage'), desk = $('#desk'), device = $('#device');
  function fit() {
    const vw = document.documentElement.clientWidth;
    if (desk) { const w = stage.clientWidth || vw - 32; stage.style.setProperty('--s', Math.min(1, w / 1200).toFixed(4)); return; }
    const W = device.offsetWidth, Hh = device.offsetHeight, wide = vw > 1180;
    stage.style.setProperty('--s', Math.max(.55, Math.min(1, wide ? (window.innerHeight - 110) / Hh : 1, (vw - 32) / W)).toFixed(3));
  }
  window.addEventListener('resize', fit); fit();
  const tick = () => { const d = new Date(); $$('[data-clock]').forEach(n => { n.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }); $$('[data-date]').forEach(n => { n.textContent = d.toLocaleDateString(); }); };
  tick(); setInterval(tick, 15000);

  /* ---------- try-it checklist (list, callouts or chips depending on layout) ---------- */
  const done = new Set(), total = $$('#tryList [data-t]').length;
  function check(k) {
    if (done.has(k)) return; done.add(k);
    $$('[data-t="' + k + '"]').forEach(n => n.classList.add('done'));
    const c = $('#tryCount'), b = $('#tryBar'); if (c) c.textContent = done.size + '/' + total; if (b) b.style.width = (done.size / total * 100) + '%';
    if (done.size === total) toastx('All done. That is the whole app in a minute.');
  }
  const snack = $('#snack');
  function say(msg) {
    if (!snack) return; snack.textContent = msg;
    if (G) { G.killTweensOf(snack); G.fromTo(snack, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: 'back.out(1.6)' }); G.to(snack, { y: 12, opacity: 0, duration: .3, delay: 2.3 }); }
    else { snack.style.opacity = 1; clearTimeout(say.t); say.t = setTimeout(() => { snack.style.opacity = 0; }, 2500); }
  }
  let tt = 0; function toastx(msg) { const t = $('#toastx'); t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => { t.hidden = true; }, 2800); }

  const H = { el, svgEl, G, reduced, store, tone, haptic, check, say, toast: say, $, $$, app: $('#app'), screen: $('#screen'), desk, win: $('#win'), tools: $('#tools'), extra: $('#menuExtra'), jump: null };

  /* ---------- jump buttons + chapters ---------- */
  $$('[data-jump]').forEach(b => b.addEventListener('click', () => {
    if (document.documentElement.clientWidth <= 1180 && !b.closest('.ch')) stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    if (H.jump) H.jump(b.dataset.jump);
  }));
  H.boot = () => {
    if (window.ScrollTrigger && window.gsap) { gsap.registerPlugin(ScrollTrigger);
      $$('.ch').forEach(ch => ScrollTrigger.create({ trigger: ch, start: 'top 55%', end: 'bottom 45%', onToggle: st => { ch.classList.toggle('on', st.isActive); if (st.isActive && H.jump) H.jump(ch.dataset.ch, true); } }));
      if (!reduced && $('.po-dev')) { const mm = gsap.matchMedia(); mm.add('(min-width: 1181px)', () => { gsap.to('.po-dev', { rotate: 2, y: -40, ease: 'none', scrollTrigger: { trigger: '.po-grid', start: 'top 80%', end: 'bottom top', scrub: 1 } }); }); }
    }
    if (G) {
      G.from(device || $('.desk-wrap'), { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' });
      G.from('#h1', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', delay: .1 });
      G.from('.lede, .try, .kick, .call, .spec, .metrics, .jump, .cta, .dk-chips, .po-steps', { y: 24, opacity: 0, duration: .9, stagger: .05, ease: 'expo.out', delay: .25 });
    }
  };

  H.layout = "stage";
/* ---------- QuietTimer ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const KC = { prep: '#A7A99F', work: '#C2502E', rest: '#5E7A6B', in: '#5E7A6B', hold: '#B89A4A', out: '#4F6C8C', sit: '#8A7AA8', bell: '#B89A4A' };
    const LB = { prep: 'Get ready', work: 'Work', rest: 'Rest', in: 'Breathe in', hold: 'Hold', out: 'Breathe out', sit: 'Sit', bell: 'Bell' };
    const PRESETS = { move: { tabata: ['Tabata', 20, 10, 8], emom: ['EMOM 10', 45, 15, 10], hiit: ['30/30', 30, 30, 6] }, breathe: { b478: ['4-7-8', [['in', 4], ['hold', 7], ['out', 8]], 4], box: ['Box 4×4', [['in', 4], ['hold', 4], ['out', 4], ['hold', 4]], 4], sit: ['10 min sit', [['sit', 150]], 4] } };
    let mode = 'move', preset = 'hiit', cfg = { work: 30, rest: 30, rounds: 6 }, bcfg = PRESETS.breathe.b478, segs = [], idx = 0, left = 0, running = false, last = 0, done = false;
    function build() { segs = [{ k: 'prep', s: 5 }]; if (mode === 'move') for (let r = 0; r < cfg.rounds; r++) { segs.push({ k: 'work', s: cfg.work, r }); if (r < cfg.rounds - 1) segs.push({ k: 'rest', s: cfg.rest, r }); }
      else for (let r = 0; r < bcfg[2]; r++) bcfg[1].forEach(([k, s2]) => segs.push({ k, s: s2, r })); idx = 0; left = segs[0].s; done = false; }
    const total = () => segs.reduce((a, b) => a + b.s, 0), elapsed = () => segs.slice(0, idx).reduce((a, b) => a + b.s, 0) + (segs[idx] ? segs[idx].s - left : 0);
    const root = el('div', 'qt'); app.append(root);
    const md = el('div', 'qt-mode'); [['move', 'Intervals'], ['breathe', 'Breathe']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.m = k; b.addEventListener('click', () => setMode(k)); md.append(b); });
    const pre = el('div', 'qt-pre'), dial = el('div', 'qt-dial'), dsv = svgEl('svg', { viewBox: '0 0 290 290', 'aria-hidden': 'true' }), RR = 140, CC = 2 * Math.PI * RR, pg = svgEl('circle', { class: 'pg', cx: 145, cy: 145, r: RR, 'stroke-dasharray': CC.toFixed(1), 'stroke-dashoffset': '0' });
    dsv.append(svgEl('circle', { class: 'tr', cx: 145, cy: 145, r: RR }), pg); const orb = el('i', 'qt-orb'), rd = el('div', 'qt-rd'), ph = el('p', 'qt-ph'), tm = el('p', 'qt-tm'), rn = el('p', 'qt-rn'); rd.append(ph, tm, rn); rd.setAttribute('aria-live', 'polite'); dial.append(orb, dsv, rd);
    const strip = el('div', 'qt-strip'), tl = el('div', 'qt-tl'), play = el('i', 'qt-ph2'), leg = el('div', 'qt-leg'); strip.append(tl, play, leg);
    const cf = el('div', 'qt-cfg'), ctl = el('div', 'qt-ctl'), rs = el('button', 'qt-sm', '↺'), go = el('button', 'qt-go', '▶'), lk = el('button', 'qt-sm', '⏻'); [rs, go, lk].forEach(b => { b.type = 'button'; }); rs.setAttribute('aria-label', 'Reset'); go.setAttribute('aria-label', 'Start'); lk.setAttribute('aria-label', 'Lock the phone'); ctl.append(rs, go, lk);
    root.append(md, pre, dial, strip, cf, ctl);
    const mmss = s2 => { s2 = Math.max(0, Math.ceil(s2)); return Math.floor(s2 / 60) + ':' + String(s2 % 60).padStart(2, '0'); };
    /* ---- bell: inharmonic partials ---- */
    let ac = null; function bell(f, vol) { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t0 = ac.currentTime; [[1, 1], [2.76, .4], [5.4, .2], [8.9, .08]].forEach(([m, a]) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f * m; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime((vol || .06) * a, t0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + 3.2 / Math.sqrt(m)); o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + 3.4); }); } catch (e) {} }
    /* ---- presets + config ---- */
    function paintPre() { pre.textContent = ''; Object.entries(PRESETS[mode]).forEach(([k, p]) => { const b = el('button', null, p[0]); b.type = 'button'; b.setAttribute('aria-pressed', String(k === preset)); b.addEventListener('click', () => { preset = k; if (mode === 'move') { cfg = { work: p[1], rest: p[2], rounds: p[3] }; if (k === 'tabata') check('preset'); } else bcfg = p; stop(); build(); paintAll(); tone(560, .03); }); pre.append(b); }); }
    function paintCfg() { cf.textContent = ''; const rows = mode === 'move' ? [['work', 'Work', 5, 180, 5, 's'], ['rest', 'Rest', 0, 120, 5, 's'], ['rounds', 'Rounds', 1, 20, 1, '']] : [['cycles', 'Cycles', 1, 12, 1, ''], ['len', 'Length', 0, 0, 0, ''], ['cue', 'Cue', 0, 0, 0, '']];
      rows.forEach(([k, l, mn, mx, st, u]) => { const c = el('div'), p = el('p'); c.append(el('small', null, l));
        if (mode === 'breathe' && k !== 'cycles') { const b = el('b', null, k === 'len' ? mmss(total() - 5) : 'Bell'); p.style.justifyContent = 'center'; p.append(b); c.append(p); cf.append(c); return; }
        const get = () => k === 'cycles' ? bcfg[2] : cfg[k], set = v => { if (k === 'cycles') bcfg = [bcfg[0], bcfg[1], v]; else cfg[k] = v; stop(); build(); paintAll(); };
        const m = el('button', null, '−'), pl = el('button', null, '+'); m.type = pl.type = 'button'; m.setAttribute('aria-label', 'Less ' + l); pl.setAttribute('aria-label', 'More ' + l); m.addEventListener('click', () => set(Math.max(mn, get() - st))); pl.addEventListener('click', () => set(Math.min(mx, get() + st)));
        p.append(m, el('b', null, get() + u), pl); c.append(p); cf.append(c); }); }
    /* ---- timeline with drag-resize ---- */
    function paintStrip() { tl.textContent = ''; const T = total(); segs.forEach((sg, i) => { const b = el('div', 'qt-sg'); b.style.flex = sg.s + ' 1 0'; b.style.setProperty('--c', KC[sg.k]); b.title = LB[sg.k] + ' ' + sg.s + 's'; b.dataset.i = i;
        if (mode === 'move' && (sg.k === 'work' || sg.k === 'rest') && sg.r === 0) { const hd = el('span', 'qt-hd'); hd.tabIndex = 0; hd.setAttribute('role', 'slider'); hd.setAttribute('aria-label', LB[sg.k] + ' length'); hd.setAttribute('aria-valuenow', String(sg.s)); hd.setAttribute('aria-valuetext', sg.s + ' seconds'); hookDrag(hd, sg.k); b.append(hd); }
        tl.append(b); }); leg.textContent = ''; leg.append(el('span', null, mode === 'move' ? cfg.work + 's on · ' + cfg.rest + 's off · ×' + cfg.rounds : bcfg[0] + ' · ' + bcfg[2] + ' cycles'), el('span', null, mmss(T) + ' total')); paintProgress(); }
    function hookDrag(hd, k) { let x0 = 0, v0 = 0, pxPer = 1;
      const mv = e => { const v = Math.max(k === 'work' ? 5 : 0, Math.min(k === 'work' ? 180 : 120, Math.round((v0 + (e.clientX - x0) / pxPer) / 5) * 5)); if (v !== cfg[k]) { cfg[k] = v; build(); paintStrip(); paintCfg(); paintRead(); tone(900, .008, 'square', .012); haptic(2); check('resize'); const nh = tl.querySelector('.qt-sg:nth-child(' + (k === 'work' ? 2 : 3) + ') .qt-hd'); if (nh) nh.classList.add('on'); } };
      const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); tl.querySelectorAll('.qt-hd').forEach(h => h.classList.remove('on')); };
      hd.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); stop(); x0 = e.clientX; v0 = cfg[k]; const r = tl.getBoundingClientRect(); pxPer = r.width / total() * 3; hd.classList.add('on'); window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); });
      hd.addEventListener('keydown', e => { const d = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key]; if (!d) return; e.preventDefault(); cfg[k] = Math.max(k === 'work' ? 5 : 0, Math.min(k === 'work' ? 180 : 120, cfg[k] + d)); stop(); build(); paintAll(); check('resize'); const nh = tl.querySelector('.qt-sg:nth-child(' + (k === 'work' ? 2 : 3) + ') .qt-hd'); if (nh) nh.focus(); }); }
    function paintProgress() { const T = total(), e = elapsed(); play.style.left = (T ? e / T * 100 : 0) + '%'; [...tl.children].forEach((c, i) => c.classList.toggle('done', i < idx)); }
    /* ---- readout ---- */
    function paintRead() { const sg = segs[idx] || segs[segs.length - 1], kc = KC[sg.k]; root.style.setProperty('--kc', kc); ph.textContent = done ? 'Done' : LB[sg.k]; tm.textContent = done ? '0:00' : mmss(left);
      const rounds = mode === 'move' ? cfg.rounds : bcfg[2]; rn.textContent = done ? 'well done' : sg.k === 'prep' ? mmss(total() - 5) + ' session' : (mode === 'move' ? 'round ' : 'cycle ') + (sg.r + 1) + ' of ' + rounds;
      const frac = done ? 1 : 1 - left / sg.s; pg.setAttribute('stroke-dashoffset', (CC * (1 - frac)).toFixed(1));
      let sc = .55; if (mode === 'breathe' && !done) { const p = 1 - left / sg.s; sc = sg.k === 'in' ? .55 + .45 * p : sg.k === 'out' ? 1 - .45 * p : sg.k === 'hold' ? (segs[idx - 1] && segs[idx - 1].k === 'in' ? 1 : .55) : sg.k === 'sit' ? .7 + .05 * Math.sin(Date.now() / 900) : .55; } orb.style.transform = 'scale(' + sc.toFixed(3) + ')'; orb.style.opacity = mode === 'breathe' ? .3 : .12; paintProgress(); if (lockEl) paintLock(); }
    /* ---- engine ---- */
    function stop() { running = false; go.textContent = '▶'; go.setAttribute('aria-label', 'Start'); }
    function next() { idx++; if (idx >= segs.length) { done = true; stop(); bell(392, .08); setTimeout(() => bell(523, .07), 700); say('Session complete · ' + mmss(total())); return; } left = segs[idx].s; const k = segs[idx].k;
      if (mode === 'breathe') { bell(k === 'in' ? 523 : k === 'out' ? 392 : 440, .035); if (k === 'in' && segs[idx].r >= 1) check('breath'); } else { bell(k === 'work' ? 587 : 440, .05); haptic(k === 'work' ? [20, 60, 20] : 30); }
      if (!segs[idx].s) next(); }
    setInterval(() => { const now = performance.now(), dt = (now - last) / 1000; last = now; if (!running || done) { if (mode === 'breathe') paintRead(); return; } const pl2 = left; left -= Math.min(dt, .5);
      if (mode === 'move' && Math.ceil(pl2) !== Math.ceil(left) && Math.ceil(left) <= 3 && Math.ceil(left) >= 1) tone(880, .05, 'sine', .03);
      while (left <= 0 && !done) { const over = -left; next(); if (!done) left -= over; } paintRead(); }, 100);
    go.addEventListener('click', () => { if (done) { build(); } running = !running; last = performance.now(); go.textContent = running ? 'Ⅱ' : '▶'; go.setAttribute('aria-label', running ? 'Pause' : 'Start'); if (running) { check('start'); bell(523, .04); haptic(8); } paintRead(); });
    rs.addEventListener('click', () => { stop(); build(); paintAll(); });
    function setMode(k, fs) { if (k === mode) return; mode = k; preset = k === 'move' ? 'hiit' : 'b478'; if (k === 'move') cfg = { work: 30, rest: 30, rounds: 6 }; else bcfg = PRESETS.breathe.b478; stop(); build(); paintAll(); if (G && !reduced) G.fromTo(dial, { scale: .94, opacity: .4 }, { scale: 1, opacity: 1, duration: .5, ease: 'expo.out' }); if (!fs) tone(440, .04); }
    /* ---- lock screen + live activity ---- */
    let lockEl = null, lp = {};
    function lock() { if (lockEl) return; lockEl = el('div', 'qt-lk'); lockEl.setAttribute('role', 'button'); lockEl.setAttribute('aria-label', 'Lock screen. Tap to unlock'); lockEl.tabIndex = 0; const n = new Date();
      lp.clock = el('h2', null, String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0')); const la = el('div', 'qt-la'), hh = el('header'), big = el('div', 'big'); lp.ph = el('span'); lp.tm = el('b'); lp.rn = el('span'); lp.bar = el('div', 'qt-lb');
      hh.append(el('span', null, '◔ QuietTimer'), lp.rn); big.append(lp.tm, lp.ph); la.append(hh, big, lp.bar); lockEl.append(el('small', null, n.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })), lp.clock, la, el('p', 'qt-unl', 'Tap to unlock'), el('i', 'qt-bar'));
      segs.forEach(sg => { const i = el('i'); i.style.flex = sg.s + ' 1 0'; i.append(el('b')); lp.bar.append(i); }); lockEl.addEventListener('click', unlock); lockEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); unlock(); } }); root.append(lockEl); paintLock();
      if (G && !reduced) G.from(lockEl, { opacity: 0, duration: .35 }); tone(200, .04, 'square', .03); haptic(10); if (running) check('lock'); else say('Start the timer first to see the Live Activity'); }
    function paintLock() { const sg = segs[idx] || segs[segs.length - 1]; lp.ph.textContent = done ? 'done' : LB[sg.k]; lp.tm.textContent = done ? '0:00' : mmss(left); lp.rn.textContent = done ? 'complete' : (running ? '' : 'paused · ') + mmss(total() - elapsed()) + ' left';
      [...lp.bar.children].forEach((c, i) => { c.firstChild.style.width = (i < idx || done ? 100 : i === idx ? (1 - left / segs[i].s) * 100 : 0) + '%'; }); }
    function unlock() { if (!lockEl) return; const l = lockEl; lockEl = null; l.style.pointerEvents = 'none'; if (G && !reduced) G.to(l, { y: -60, opacity: 0, duration: .3, onComplete: () => l.remove() }); else l.remove(); }
    lk.addEventListener('click', lock);
    function paintAll() { md.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === mode))); paintPre(); paintCfg(); paintStrip(); paintRead(); }
    H.jump = (k, fs) => { if (k === 'lock') { if (!fs && !running) { if (done) build(); running = true; last = performance.now(); go.textContent = 'Ⅱ'; check('start'); } lock(); return; } unlock(); setMode(k, fs); };
    build(); paintAll(); last = performance.now();
  }
  demo(H.app, H);
  H.boot();
})();
