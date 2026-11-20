/* Steadyroute — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "triptych";
/* ---------- Steadyroute ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const TOTAL = 5000, SPEED = 20, FIT = 312;
    /* ---- route geometry (closed loop scaled to 5 km) ---- */
    const RP = []; for (let i = 0; i <= 240; i++) { const a = i / 240 * Math.PI * 2, r = 1 + .22 * Math.sin(3 * a + .6) + .1 * Math.cos(5 * a); RP.push([180 + Math.cos(a) * 128 * r, 118 + Math.sin(a) * 82 * r]); }
    const cum = [0]; for (let i = 1; i < RP.length; i++) cum.push(cum[i - 1] + Math.hypot(RP[i][0] - RP[i - 1][0], RP[i][1] - RP[i - 1][1])); const LEN = cum[cum.length - 1];
    const at = d => { const L = (d % TOTAL) / TOTAL * LEN; let i = 1; while (i < cum.length - 1 && cum[i] < L) i++; const k = (L - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); return [RP[i - 1][0] + (RP[i][0] - RP[i - 1][0]) * k, RP[i - 1][1] + (RP[i][1] - RP[i - 1][1]) * k]; };
    const elev = d => 14 + 11 * Math.sin(2 * Math.PI * d / TOTAL * 2 - .9) + 5 * Math.sin(2 * Math.PI * d / TOTAL * 5 + .4), grade = d => (elev(d + 20) - elev(d - 20)) / 40 * 100;
    /* ---- plan ---- */
    let target = 330, strat = 'even';
    const kmTarget = km => strat === 'neg' ? target + (2 - km) * 5 : strat === 'hill' ? target + Math.round(((elev((km + 1) * 1000) - elev(km * 1000)) / 10) * 9) : target;
    const ghostDist = tt => { let d = 0, t2 = tt; for (let km = 0; km < 5 && t2 > 0; km++) { const p = kmTarget(km); if (t2 >= p) { d += 1000; t2 -= p; } else { d += t2 / p * 1000; t2 = 0; } } return Math.min(TOTAL, d); };
    const planTotal = () => [0, 1, 2, 3, 4].reduce((a, k) => a + kmTarget(k), 0);
    /* ---- state ---- */
    let run = null; const fresh = () => ({ t: 0, d: 0, pace: FIT + 40, effort: 1, splits: [], trail: [], lastCue: -999, passed: false, done: false, running: false, lastSplitT: 0 });
    run = fresh();
    const fmt = s2 => { s2 = Math.max(0, Math.round(s2)); const h = Math.floor(s2 / 3600), m = Math.floor(s2 % 3600 / 60), ss = s2 % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(ss).padStart(2, '0'); }, fp = p => Math.floor(p / 60) + ':' + String(Math.round(p % 60)).padStart(2, '0').replace('60', '59');
    /* ---- shell ---- */
    const root = el('div', 'sr'), V = {}; ['run', 'splits', 'plan'].forEach(k => { V[k] = el('section', 'sr-v'); V[k].setAttribute('aria-label', k); if (k !== 'run') V[k].hidden = true; root.append(V[k]); }); app.append(root); let cur = 'run';
    const tabs = () => { const t = el('div', 'sr-tabs'); t.setAttribute('role', 'tablist'); [['run', 'Run'], ['splits', 'Splits'], ['plan', 'Plan']].forEach(([k, l]) => { const b = el('button', null, l); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(k === cur)); b.addEventListener('click', () => go(k)); t.append(b); }); return t; };
    function go(k, fs) { if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; paintView(); V[k].scrollTop = 0; ctl.hidden = k !== 'run';
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0, x: 16 }, { opacity: 1, x: 0, duration: .3, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .1, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; if (!fs) haptic(4); }
    H.jump = (k, fs) => go(k, fs);
    /* ---- run view (built once, painted per tick) ---- */
    const R = V.run, top = el('div', 'sr-top'), tl = el('div'); tl.append(el('small', null, 'Riverside loop · 5 km'), el('h2', null, 'Tempo run')); const gps = el('span', 'sr-gps'); gps.append(el('i'), document.createTextNode('GPS ±3 m')); top.append(tl, gps);
    const map = el('div', 'sr-map'), msv = svgEl('svg', { viewBox: '0 0 360 236', role: 'img', 'aria-label': 'Route map with your position and the ghost runner' });
    msv.append(svgEl('path', { d: 'M-10 200 C80 170 140 230 380 190', stroke: '#BFD3E6', 'stroke-width': 18, fill: 'none' })); [[40, 40, 30], [310, 60, 24], [300, 205, 20]].forEach(([x, y, r]) => msv.append(svgEl('circle', { cx: x, cy: y, r, fill: '#D3DEC0' })));
    msv.append(svgEl('path', { d: 'M' + RP.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ' Z', fill: 'none', stroke: '#fff', 'stroke-width': 9, 'stroke-linejoin': 'round' }), svgEl('path', { d: 'M' + RP.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L') + ' Z', fill: 'none', stroke: '#C9CDBD', 'stroke-width': 3, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round' }));
    for (let k = 1; k < 5; k++) { const [x, y] = at(k * 1000); msv.append(svgEl('circle', { cx: x, cy: y, r: 7, fill: '#141612' })); const t = svgEl('text', { x: x - 2.5, y: y + 3 }); t.textContent = String(k); t.setAttribute('fill', '#D9FF5B'); msv.append(t); }
    const trailG = svgEl('g'), ghost = svgEl('g'), me = svgEl('g'); ghost.append(svgEl('circle', { r: 9, fill: '#141612', opacity: .14 }), svgEl('circle', { r: 5, fill: 'none', stroke: '#141612', 'stroke-width': 2, 'stroke-dasharray': '2 2' })); me.append(svgEl('circle', { r: 12, fill: '#FF4F1F', opacity: .2 }), svgEl('circle', { r: 6.5, fill: '#FF4F1F', stroke: '#fff', 'stroke-width': 2.5 }));
    const [sx, sy] = at(0); msv.append(svgEl('rect', { x: sx - 10, y: sy - 4, width: 20, height: 8, rx: 2, fill: '#141612' }), trailG, ghost, me); map.append(msv);
    const dl = el('div', 'sr-dl'), dlL = el('span', null, 'ghost'), dlBar = el('div'), dlDot = el('i'), dlR = el('span', null, '±0 m'); dlBar.append(dlDot); dl.append(dlL, dlBar, dlR); map.append(dl);
    const big = el('div', 'sr-big'), cell = l => { const d = el('div'), b = el('b'), e = el('em'); d.append(el('small', null, l), b, e); big.append(d); return [b, e]; }, [pB, pE] = cell('Pace /km'), [dB, dE] = cell('Distance'), [tB, tE] = cell('Time');
    const co = el('div', 'sr-co'), coI = el('i', null, '◎'), coP = el('p', null, 'Set your target on the Plan tab, then start.'); co.append(coI, coP); co.setAttribute('aria-live', 'polite');
    R.append(tabs(), top, map, big, co);
    const ctl = el('div', 'sr-ctl'), ea = el('button', 'sr-ea'), gob = el('button', 'sr-go'), pu = el('button', 'sr-pu'); ea.append('Ease', el('small', null, '−4% effort')); pu.append('Push', el('small', null, '+4% effort')); [ea, gob, pu].forEach(b => { b.type = 'button'; }); ctl.append(ea, gob, pu); root.append(ctl);
    const setEff = dv => { run.effort = Math.max(.86, Math.min(1.16, run.effort + dv)); tone(dv > 0 ? 760 : 420, .04); haptic(5); say('Effort ' + Math.round(run.effort * 100) + '%'); };
    ea.addEventListener('click', () => setEff(-.04)); pu.addEventListener('click', () => setEff(.04));
    gob.addEventListener('click', () => { if (run.done) { run = fresh(); animated = -1; trailG.textContent = ''; } run.running = !run.running; if (run.running) { check('start'); tone(660, .06); setTimeout(() => tone(990, .1), 120); cue('Go. Target ' + fp(kmTarget(0)) + ' for the first kilometre.', 'good'); } paintRun(); });
    function cue(text, kind) { coP.textContent = text; co.className = 'sr-co' + (kind ? ' ' + kind : ''); coI.textContent = kind === 'fast' ? '↓' : kind === 'slow' ? '↑' : '✓'; run.lastCue = run.d; if (G && !reduced) G.fromTo(co, { scale: .97 }, { scale: 1, duration: .4, ease: 'back.out(2.5)' }); }
    /* ---- engine: tick 0.25 s real = 5 s run ---- */
    setInterval(() => { if (!run.running || run.done) return; const dt = .25 * SPEED, km = Math.min(4, Math.floor(run.d / 1000));
      const want = FIT / run.effort + Math.max(-6, grade(run.d) * 9) + run.d / 1000 * 2.2; run.pace += (want - run.pace) * .18 + (Math.random() - .5) * 1.2; run.pace = Math.max(200, Math.min(520, run.pace));
      const d0 = run.d; run.d = Math.min(TOTAL, run.d + dt * 1000 / run.pace); run.t += (run.d - d0) / (1000 / run.pace); run.trail.push([d0, run.d, run.pace]);
      const tp = kmTarget(km), diff = run.pace - tp, gd = ghostDist(run.t), lead = run.d - gd;
      if (Math.floor(run.d / 1000) > Math.floor(d0 / 1000) || run.d >= TOTAL) { const st = run.t - run.lastSplitT, k = run.splits.length; run.splits.push({ t: st, target: kmTarget(k), up: Math.max(0, elev((k + 1) * 1000) - elev(k * 1000)) }); run.lastSplitT = run.t; check('split'); tone(880, .06); setTimeout(() => tone(1175, .08), 120); haptic([20, 50, 20]);
        const dd = st - kmTarget(k); cue('Kilometre ' + (k + 1) + ' in ' + fp(st) + ', ' + (Math.abs(dd) < 2 ? 'right on target.' : Math.abs(Math.round(dd)) + ' s ' + (dd < 0 ? 'faster' : 'slower') + ' than plan.'), Math.abs(dd) < 4 ? 'good' : dd < 0 ? 'fast' : 'slow'); if (cur === 'splits') paintView(); }
      else if (run.d - run.lastCue > 350) { if (Math.abs(diff) > 7) { cue(diff < 0 ? 'You are ' + Math.round(-diff) + ' s/km fast. Ease off' + (grade(run.d) > 1.5 ? ', it is uphill.' : '.') : Math.round(diff) + ' s/km slow. ' + (grade(run.d) > 1.5 ? 'Hill. Shorten your stride and hold effort.' : 'Lift the pace a little.'), diff < 0 ? 'fast' : 'slow'); check('coach'); } else if (run.d - run.lastCue > 700) { cue('Holding ' + fp(run.pace) + '. Steady, right in the band.', 'good'); check('coach'); } }
      if (!run.passed && lead > 25) { run.passed = true; check('ghost'); cue('You passed your ghost. Bank it, do not sprint.', 'good'); tone(1320, .08); }
      if (run.d >= TOTAL) { run.done = true; run.running = false; cue('Done. ' + fmt(run.t) + ' for 5 km, ' + (run.t <= planTotal() ? fmt(planTotal() - run.t) + ' under' : fmt(run.t - planTotal()) + ' over') + ' your plan.', run.t <= planTotal() ? 'good' : 'slow'); say('Run saved to Health'); }
      paintRun(); }, 250);
    function paintRun() { const gd = ghostDist(run.t), lead = run.d - gd; const [x, y] = at(run.d), [gx, gy] = at(gd); me.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')'); ghost.setAttribute('transform', 'translate(' + gx.toFixed(1) + ' ' + gy.toFixed(1) + ')');
      while (run.trail.length) { const [a, b, p] = run.trail.shift(), [x1, y1] = at(a), [x2, y2] = at(b), k = Math.max(0, Math.min(1, (p - (target - 25)) / 50)); trailG.append(svgEl('line', { x1, y1, x2, y2, stroke: 'rgb(' + Math.round(255 - 208 * k) + ',' + Math.round(79 + 44 * k) + ',' + Math.round(31 + 224 * k) + ')', 'stroke-width': 5, 'stroke-linecap': 'round' })); }
      dlDot.style.left = (50 + Math.max(-48, Math.min(48, lead / 4))) + '%'; dlR.textContent = (lead >= 0 ? '+' : '−') + Math.abs(Math.round(lead)) + ' m'; dlL.textContent = lead >= 0 ? 'ahead' : 'behind';
      const km = Math.min(4, Math.floor(run.d / 1000)); pB.textContent = run.t ? fp(run.pace) : '–:––'; pE.textContent = 'target ' + fp(kmTarget(km)); dB.textContent = (run.d / 1000).toFixed(2); dE.textContent = 'km of 5'; tB.textContent = fmt(run.t); tE.textContent = 'plan ' + fmt(planTotal());
      gob.textContent = ''; gob.append(run.done ? 'Again' : run.running ? 'Pause' : run.t ? 'Resume' : 'Start', el('small', null, run.running ? '20× speed' : run.done ? 'new run' : 'ready')); }
    /* ---- splits + plan views ---- */
    let animated = -1; function splitsView(v) { v.append(tabs()); const el2 = el('div', 'sr-el'), W = 340, Hh = 92, sv = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + Hh, role: 'img', 'aria-label': 'Elevation profile' }), X = d => 10 + d / TOTAL * (W - 20), Y = e => Hh - 16 - (e - -4) / 36 * (Hh - 24); let d = 'M' + X(0) + ' ' + Y(elev(0));
      for (let m = 50; m <= TOTAL; m += 50) d += ' L' + X(m).toFixed(1) + ' ' + Y(elev(m)).toFixed(1); sv.append(svgEl('path', { d: d + ' L' + X(TOTAL) + ' ' + (Hh - 14) + ' L' + X(0) + ' ' + (Hh - 14) + ' Z', fill: '#E3E6DA' }), svgEl('path', { d, fill: 'none', stroke: '#141612', 'stroke-width': 2 }));
      for (let k = 0; k <= 5; k++) { const t = svgEl('text', { x: X(k * 1000) - 6, y: Hh - 3 }); t.textContent = k + 'k'; sv.append(t); } sv.append(svgEl('line', { x1: X(run.d), x2: X(run.d), y1: 4, y2: Hh - 14, stroke: '#FF4F1F', 'stroke-width': 2 }), svgEl('circle', { cx: X(run.d), cy: Y(elev(run.d)), r: 4.5, fill: '#FF4F1F', stroke: '#fff', 'stroke-width': 2 }));
      el2.append(sv); v.append(el2); if (!run.splits.length && !run.t) { v.append(el('p', 'sr-emp', 'Start a run and your kilometre splits appear here as you go.')); return; }
      const tb = el('table', 'sr-tb'), th = el('tr'); ['km', 'split', '+elev', 'vs plan'].forEach(h => th.append(el('th', null, h))); const thd = el('thead'); thd.append(th); tb.append(thd); const tbd = el('tbody'); const best = run.splits.length ? Math.min(...run.splits.map(s2 => s2.t)) : 0;
      run.splits.forEach((sp, i) => { const tr = el('tr', sp.t === best && run.splits.length > 1 ? 'best' : null), dd = sp.t - sp.target; tr.append(el('td', null, String(i + 1)), el('td', null, fp(sp.t)), el('td', null, '+' + Math.round(sp.up) + ' m'), el('td', dd <= 0 ? 'pos' : 'neg', (dd <= 0 ? '−' : '+') + Math.abs(Math.round(dd)) + ' s')); tbd.append(tr); if (i === run.splits.length - 1 && i !== animated && G && !reduced) { animated = i; G.from(tr, { opacity: 0, y: -8, duration: .35 }); } });
      if (!run.done && run.t) { const tr = el('tr', 'live'), part = run.d - run.splits.length * 1000; tr.append(el('td', null, String(run.splits.length + 1)), el('td', null, fmt(run.t - run.lastSplitT)), el('td', null, Math.round(part) + ' m'), el('td', null, 'live')); tbd.append(tr); } tb.append(tbd); v.append(tb);
      if (run.done) { const c = el('div', 'sr-card'), g = el('div', 'sr-sum'), add = (b, s2) => { const d2 = el('div'); d2.append(el('b', null, b), el('span', null, s2)); g.append(d2); }; add(fmt(run.t), '5 km time'); add(fp(run.t / 5), 'average pace'); add(fmt(run.t * Math.pow(2, 1.06)), 'predicted 10K (Riegel)'); add(fp(best), 'fastest km'); c.append(el('small', null, 'Run summary'), g); c.style.marginTop = '8px'; v.append(c); } }
    function planView(v) { v.append(tabs()); const c = el('div', 'sr-card'), pc = el('div', 'sr-pace'), m = el('button', null, '−'), p = el('button', null, '+'), b = el('b'); m.type = p.type = 'button'; m.setAttribute('aria-label', 'Faster target, 5 seconds'); p.setAttribute('aria-label', 'Slower target, 5 seconds');
      const paintB = () => { b.textContent = fp(target); b.append(el('em', null, ' /km')); }; paintB(); const set = d => { if (run.running) { say('Pause the run to change the plan'); return; } target = Math.max(240, Math.min(450, target + d)); check('target'); tone(600 + (450 - target), .02); paintView(); }; m.addEventListener('click', () => set(-5)); p.addEventListener('click', () => set(5));
      pc.append(m, b, p); c.append(el('small', null, 'Target pace'), pc); v.append(c);
      const c2 = el('div', 'sr-card'), st = el('div', 'sr-strat'); [['even', 'Even', 'Same pace every kilometre'], ['neg', 'Negative split', 'Start 10 s slow, finish 10 s fast'], ['hill', 'Hill-adjusted', 'Same effort: slower up, faster down']].forEach(([k, l, d]) => { const bt = el('button'), tx = el('span'); bt.type = 'button'; bt.setAttribute('aria-pressed', String(strat === k)); tx.append(document.createTextNode(l), el('small', null, d)); bt.append(tx, el('i', null, k === strat ? '●' : '○'));
        bt.addEventListener('click', () => { if (run.running) { say('Pause the run to change the plan'); return; } strat = k; check('target'); paintView(); }); st.append(bt); }); c2.append(el('small', null, 'Strategy'), st);
      const pl = el('div', 'sr-pl'), ks = [0, 1, 2, 3, 4].map(kmTarget), lo = Math.min(...ks) - 20, hi = Math.max(...ks); ks.forEach((t, i) => { const d = el('div'), bar = el('i'); bar.style.height = Math.round(14 + (hi - t) / Math.max(1, hi - lo) * 30 + 6) + 'px'; d.append(bar, el('span', null, fp(t))); pl.append(d); }); c2.append(pl, el('p', 'sr-emp', 'Planned finish ' + fmt(planTotal()) + ' · ghost runs exactly this plan')); v.append(c2); }
    function paintView() { const v = V[cur]; if (cur === 'run') { v.querySelector('.sr-tabs').replaceWith(tabs()); return; } v.textContent = ''; (cur === 'splits' ? splitsView : planView)(v); }
    setInterval(() => { if (cur === 'splits' && run.running) paintView(); }, 1000);
    paintRun();
  }
  demo(H.app, H);
  H.boot();
})();
