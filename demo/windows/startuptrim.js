/* StartupTrim — Windows 11 desktop simulator (Bazozo Studio). DOM built with textContent only. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const sv = (tag, attrs, parent, text) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (text != null) n.textContent = text; if (parent) parent.append(n); return n; };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- desktop scale + clock ---------- */
  const wrap = $('#deskWrap'), desk = $('#desk');
  let S = 1;
  function fit() { S = Math.max(.5, Math.min(1, wrap.clientWidth / 1200)); wrap.style.setProperty('--s', S.toFixed(4)); }
  window.addEventListener('resize', fit); fit();
  const toDesk = (cx, cy) => { const r = desk.getBoundingClientRect(); return [(cx - r.left) / S, (cy - r.top) / S]; };
  const tick = () => { const d = new Date(), c = $('#clock'); c.replaceChildren(document.createTextNode(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), el('br'), document.createTextNode(d.toLocaleDateString('en-GB'))); };
  tick(); setInterval(tick, 10000);

  /* ---------- checklist + toast ---------- */
  const done = new Set();
  function check(k) { if (done.has(k)) return; done.add(k); const c = $(`#tryList [data-t="${k}"]`); if (c) { c.classList.add('done'); if (G) G.fromTo(c, { scale: .9 }, { scale: 1, duration: .45, ease: 'back.out(3)' }); } $('#tryCount').textContent = `${done.size}/5`; }
  const toast = $('#toast'); let tTimer = null;
  function notify(t, s) {
    $('#toastT').textContent = t; $('#toastS').textContent = s; toast.hidden = false; clearTimeout(tTimer);
    if (G) G.fromTo(toast, { x: 380 }, { x: 0, duration: .5, ease: 'expo.out' });
    tTimer = setTimeout(() => { if (G) G.to(toast, { x: 380, duration: .3, ease: 'power2.in', onComplete: () => { toast.hidden = true; } }); else toast.hidden = true; }, 3200);
  }
  const history = [];
  function log(text, undo) { history.unshift({ text, at: new Date(), undo }); renderHist(); }

  /* ---------- state ---------- */
  const APPS = [
    { n: 'Microsoft Teams', p: 'Microsoft', c: '#5B5FC7', i: 'T', imp: 'h', s: 6.2, mem: 9, on: true },
    { n: 'Steam', p: 'Valve', c: '#1B2838', i: 'S', imp: 'h', s: 5.1, mem: 7, on: true },
    { n: 'Discord', p: 'Discord Inc.', c: '#5865F2', i: 'D', imp: 'h', s: 4.4, mem: 6, on: true },
    { n: 'Spotify', p: 'Spotify AB', c: '#1DB954', i: 'S', imp: 'm', s: 2.9, mem: 4, on: true },
    { n: 'OneDrive', p: 'Microsoft', c: '#0F6CBD', i: 'O', imp: 'm', s: 2.1, mem: 3, on: true },
    { n: 'Adobe Updater', p: 'Adobe', c: '#E1251B', i: 'A', imp: 'm', s: 1.9, mem: 2, on: true },
    { n: 'Logi Options+', p: 'Logitech', c: '#00B8FC', i: 'L', imp: 'l', s: .8, mem: 1, on: true },
    { n: 'Windows Security', p: 'Microsoft · required', c: '#2B88D8', i: '✓', imp: 'l', s: .6, mem: 1, on: true, locked: true }
  ];
  const K = { power: 65, fan: 45, boost: 120, park: 50 };
  const T = { cpu: 34, ram: 68, gpu: 22, scanned: false };
  const bootSecs = () => 14 + APPS.filter(a => a.on).reduce((s, a) => s + a.s, 0);
  const ramBase = () => 38 + APPS.filter(a => a.on).reduce((s, a) => s + a.mem, 0) - (T.scanned ? 12 : 0);

  /* ---------- telemetry dials ---------- */
  const DIALS = [
    { k: 'cpu', label: 'CPU', unit: '%', sub: () => `${Math.round(48 + T.cpu * .4 - (K.fan - 45) * .15)}°C · ${(3.2 + K.boost / 400).toFixed(2)} GHz` },
    { k: 'ram', label: 'Memory', unit: '%', sub: () => `${(T.ram * .32).toFixed(1)} / 32 GB` },
    { k: 'gpu', label: 'GPU', unit: '%', sub: () => `${Math.round(42 + T.gpu * .35 - (K.fan - 45) * .12)}°C · ${1800 + K.boost} MHz` }
  ];
  const R = 52, CX = 75, CY = 72;
  const pt = a => [CX + R * Math.cos(a), CY + R * Math.sin(a)];
  const arc = (a0, a1) => { const [x0, y0] = pt(a0), [x1, y1] = pt(a1); return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
  const A0 = Math.PI * .75, SPAN = Math.PI * 1.5;
  const dialsEl = $('#dials');
  DIALS.forEach(D => {
    const c = el('div', 'card dial');
    const s = sv('svg', { viewBox: '0 0 150 130', 'aria-hidden': 'true' }, c);
    sv('path', { class: 'tr', d: arc(A0, A0 + SPAN) }, s);
    D.ar = sv('path', { class: 'ar' }, s);
    D.val = sv('text', { class: 'val', x: CX, y: CY + 6, 'text-anchor': 'middle' }, s, '0');
    sv('text', { class: 'unit', x: CX, y: CY + 22, 'text-anchor': 'middle' }, s, D.unit + ' load');
    c.append(el('div', 'lbl', D.label)); D.subEl = el('div', 'sub', ''); c.append(D.subEl);
    const sp = sv('svg', { class: 'spark', viewBox: '0 0 120 36', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, c);
    D.line = sv('path', { fill: 'none', stroke: '#60CDFF', 'stroke-width': 1.6, 'stroke-opacity': .8 }, sp);
    D.hist = new Array(40).fill(T[D.k]); D.shown = T[D.k];
    c.setAttribute('aria-label', D.label + ' usage');
    dialsEl.append(c);
  });
  const colorFor = v => v > 80 ? '#FF99A4' : v > 60 ? '#FCE100' : '#60CDFF';
  function paintDials(snap) {
    DIALS.forEach(D => {
      const v = T[D.k];
      D.shown = snap ? v : D.shown + (v - D.shown) * .25;
      const a1 = A0 + SPAN * Math.max(.005, Math.min(1, D.shown / 100));
      D.ar.setAttribute('d', arc(A0, a1)); D.ar.setAttribute('stroke', colorFor(D.shown)); D.ar.style.color = colorFor(D.shown);
      D.val.textContent = Math.round(D.shown); D.subEl.textContent = D.sub();
    });
  }
  setInterval(() => {
    const powerBias = (K.power - 65) * .12, parkBias = (50 - K.park) * .06;
    T.cpu = Math.max(4, Math.min(98, (T.scanned ? 22 : 34) + powerBias + parkBias + (Math.random() - .5) * 14));
    T.ram = Math.max(20, Math.min(97, ramBase() + (Math.random() - .5) * 3));
    T.gpu = Math.max(2, Math.min(98, 22 + K.boost / 30 + (Math.random() - .5) * 10));
    DIALS.forEach(D => { D.hist.push(T[D.k]); D.hist.shift(); D.line.setAttribute('d', D.hist.map((v, i) => (i ? 'L' : 'M') + (i / 39 * 120).toFixed(1) + ' ' + (34 - v / 100 * 32).toFixed(1)).join('')); });
    const worst = Math.max(T.cpu, T.ram);
    $('#health').textContent = 'Health: ' + (worst > 85 ? 'Under pressure' : worst > 65 ? 'Fair' : 'Good');
  }, 1000);
  (function loop() { paintDials(false); requestAnimationFrame(loop); })();

  /* ---------- deep optimization ---------- */
  const STEPS = [['Creating a system restore point', 'done', 700], ['Scanning 214 startup items', '3 flagged', 900], ['Clearing temp files and caches', '2.4 GB', 1300], ['Trimming idle service memory', '1.1 GB', 1000], ['Optimizing SSD (TRIM)', 'done', 900], ['Rebuilding search index priority', 'done', 700]];
  let scanning = false;
  $('#scanBtn').addEventListener('click', () => {
    if (scanning) return; scanning = true;
    const btn = $('#scanBtn'); btn.disabled = true; btn.textContent = 'Optimizing…';
    const card = $('#scanCard'), list = $('#steps'), res = $('#result');
    card.hidden = false; res.hidden = true; list.replaceChildren();
    const lis = STEPS.map(([t]) => { const li = el('li'); li.append(el('i'), document.createTextNode(t), el('span', null, '')); list.append(li); return li; });
    if (G) G.from(lis, { x: -12, opacity: 0, duration: .35, stagger: .05 });
    const total = STEPS.reduce((s, x) => s + x[2], 0); let acc = 0, i = 0;
    const bar = $('#scanBar');
    const next = () => {
      if (i > 0) { lis[i - 1].className = 'ok'; lis[i - 1].lastChild.textContent = STEPS[i - 1][1]; }
      if (i >= STEPS.length) return finish();
      lis[i].className = 'run'; $('#scanT').textContent = STEPS[i][0] + '…';
      const dur = STEPS[i][2] * (reduced ? .2 : 1);
      if (G) G.to(bar, { width: ((acc + STEPS[i][2]) / total * 100) + '%', duration: dur / 1000, ease: 'none' }); else bar.style.width = ((acc + STEPS[i][2]) / total * 100) + '%';
      acc += STEPS[i][2]; $('#scanP').textContent = Math.round(acc / total * 100) + '%';
      i++; setTimeout(next, dur);
    };
    const finish = () => {
      scanning = false; T.scanned = true; btn.disabled = false; btn.textContent = 'Run again';
      const before = bootSecs() + 6;
      $('#scanT').textContent = 'Optimization complete · just now';
      res.replaceChildren();
      [[`${before.toFixed(0)}s → ${(before - 6).toFixed(0)}s`, 'boot time'], ['3.5 GB', 'space freed'], ['-12%', 'memory in use']].forEach(([b, s]) => { const d = el('div'); d.append(el('b', null, b), el('small', null, s)); res.append(d); });
      res.hidden = false; if (G) G.from(res.children, { y: 12, opacity: 0, duration: .45, stagger: .08, ease: 'back.out(2)' });
      notify('Deep optimization complete', 'Freed 3.5 GB and cut memory use by 12%. A restore point was created.');
      log('Deep optimization · freed 3.5 GB'); check('scan');
    };
    next();
  });

  /* ---------- startup apps ---------- */
  const appsEl = $('#apps');
  const bootShown = { v: bootSecs() };
  function paintBoot() {
    const to = bootSecs();
    if (G) G.to(bootShown, { v: to, duration: .7, ease: 'power3.out', onUpdate: () => { $('#bootN').textContent = bootShown.v.toFixed(0) + 's'; } });
    else $('#bootN').textContent = to.toFixed(0) + 's';
  }
  function setApp(a, on, quiet) {
    a.on = on; renderApps(); paintBoot();
    if (quiet) return;
    check('startup');
    log(`${on ? 'Enabled' : 'Disabled'} ${a.n} at startup`, () => setApp(a, !on, true));
    notify(`${a.n} ${on ? 'enabled' : 'disabled'}`, `Estimated boot time is now ${bootSecs().toFixed(0)}s.`);
  }
  function renderApps() {
    appsEl.replaceChildren();
    APPS.forEach(a => {
      const r = el('div', 'row');
      const ic = el('span', 'ic', a.i); ic.style.background = a.c;
      const n = el('div', null, a.n); n.append(el('small', null, a.p));
      const imp = el('span', 'impact ' + a.imp, { h: 'High impact', m: 'Medium', l: 'Low' }[a.imp]);
      const t = el('span', 'mono', `+${a.s.toFixed(1)}s`); t.style.cssText = 'font-family:var(--mono);font-size:12px;color:var(--faint)';
      const tg = el('button', 'tg'); tg.type = 'button'; tg.setAttribute('role', 'switch'); tg.setAttribute('aria-checked', String(a.on)); tg.setAttribute('aria-label', `${a.n} at startup`);
      if (a.locked) { tg.disabled = true; tg.style.opacity = .4; tg.title = 'Required by Windows'; }
      tg.addEventListener('click', () => setApp(a, !a.on));
      r.append(ic, n, imp, t, tg); appsEl.append(r);
    });
  }
  renderApps(); $('#bootN').textContent = bootSecs().toFixed(0) + 's';

  /* ---------- knobs + sliders ---------- */
  const KNOBS = [
    { k: 'power', label: 'Power limit', unit: 'W', min: 35, max: 120, step: 1 },
    { k: 'fan', label: 'Fan curve', unit: '%', min: 20, max: 100, step: 1 },
    { k: 'boost', label: 'GPU boost', unit: 'MHz', min: 0, max: 300, step: 5 },
    { k: 'park', label: 'Core parking', unit: '%', min: 0, max: 100, step: 1 }
  ];
  const KA0 = Math.PI * .75, KSPAN = Math.PI * 1.5, KR = 46;
  const kpt = (a, r = KR) => [60 + r * Math.cos(a), 60 + r * Math.sin(a)];
  const karc = (a0, a1) => { const [x0, y0] = kpt(a0), [x1, y1] = kpt(a1); return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${KR} ${KR} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
  const knobsEl = $('#knobs');
  KNOBS.forEach((N, idx) => {
    const c = el('div', 'card knob');
    const s = sv('svg', { viewBox: '0 0 120 120', role: 'slider', tabindex: 0, 'aria-label': N.label, 'aria-valuemin': N.min, 'aria-valuemax': N.max }, c);
    if (idx === 0) { const d = sv('defs', {}, s); const g = sv('radialGradient', { id: 'kg', cx: '.4', cy: '.35', r: '.8' }, d); sv('stop', { offset: 0, 'stop-color': '#4A4B52' }, g); sv('stop', { offset: 1, 'stop-color': '#1F2024' }, g); }
    sv('path', { class: 'kt', d: karc(KA0, KA0 + KSPAN) }, s);
    N.arc = sv('path', { class: 'ka' }, s);
    sv('circle', { class: 'body', cx: 60, cy: 60, r: 34 }, s);
    N.ptr = sv('line', { class: 'ptr' }, s);
    N.svg = s; N.out = el('b'); c.append(N.out, el('small', null, N.label)); knobsEl.append(c);
    let y0 = null, v0 = 0;
    s.addEventListener('pointerdown', e => { y0 = e.clientY; v0 = K[N.k]; try { s.setPointerCapture(e.pointerId); } catch (_) {} });
    s.addEventListener('pointermove', e => { if (y0 == null) return; setKnob(N, v0 + (y0 - e.clientY) / S * (N.max - N.min) / 180); });
    s.addEventListener('pointerup', () => { if (y0 != null) { y0 = null; check('knob'); log(`${N.label} set to ${K[N.k]} ${N.unit}`); } });
    s.addEventListener('wheel', e => { e.preventDefault(); setKnob(N, K[N.k] - Math.sign(e.deltaY) * N.step * 3); check('knob'); }, { passive: false });
    s.addEventListener('keydown', e => { const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key]; if (!d) return; e.preventDefault(); setKnob(N, K[N.k] + d * N.step * 2); check('knob'); });
    setKnob(N, K[N.k], true);
  });
  function setKnob(N, v, init) {
    v = Math.round(Math.max(N.min, Math.min(N.max, v)) / N.step) * N.step; K[N.k] = v;
    const f = (v - N.min) / (N.max - N.min), a = KA0 + KSPAN * f;
    N.arc.setAttribute('d', karc(KA0, KA0 + Math.max(.01, KSPAN * f)));
    const [x0, y0] = kpt(a, 16), [x1, y1] = kpt(a, 30);
    N.ptr.setAttribute('x1', x0.toFixed(1)); N.ptr.setAttribute('y1', y0.toFixed(1)); N.ptr.setAttribute('x2', x1.toFixed(1)); N.ptr.setAttribute('y2', y1.toFixed(1));
    N.out.textContent = v + ' ' + N.unit; N.svg.setAttribute('aria-valuenow', v);
    if (!init) paintScore();
  }
  const sliders = [['#fx', '#fxOut'], ['#bg', '#bgOut']];
  sliders.forEach(([i, o]) => { const n = $(i); const paint = () => { n.style.setProperty('--p', n.value + '%'); $(o).textContent = n.value + '%'; paintScore(); }; n.addEventListener('input', paint); n.addEventListener('change', () => check('knob')); paint(); });
  function paintScore() {
    const fx = +$('#fx').value, bg = +$('#bg').value;
    const sc = Math.round(Math.max(20, Math.min(99, 40 + (K.power - 35) / 85 * 28 + K.boost / 300 * 14 + (100 - K.park) / 100 * 8 + (100 - fx) / 100 * 6 + (100 - bg) / 100 * 8 - Math.max(0, 60 - K.fan) / 40 * 6)));
    $('#scoreN').textContent = sc; $('#scoreBar').style.width = sc + '%';
    $('#profile').textContent = sc > 85 ? 'Max performance' : sc > 65 ? 'Balanced' : 'Quiet & cool';
  }
  paintScore();

  /* ---------- history ---------- */
  function renderHist() {
    const h = $('#hist'); h.replaceChildren();
    if (!history.length) { const r = el('div', 'row'); r.style.gridTemplateColumns = '1fr'; r.append(el('span', null, 'No changes yet. Everything you do here can be undone.')); h.append(r); return; }
    history.forEach(x => {
      const r = el('div', 'row'); r.style.gridTemplateColumns = '80px 1fr auto';
      const t = el('span', null, x.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })); t.style.cssText = 'font-family:var(--mono);font-size:12px;color:var(--faint)';
      r.append(t, el('span', null, x.text));
      if (x.undo) { const u = el('button', 'btn-sub', 'Undo'); u.type = 'button'; u.addEventListener('click', () => { x.undo(); x.undo = null; x.text += ' · undone'; renderHist(); }); r.append(u); } else r.append(el('span'));
      h.append(r);
    });
  }
  renderHist();

  /* ---------- navigation rail ---------- */
  const pip = $('#pip');
  function nav(p, btn) {
    $$('.rail button').forEach(b => b.toggleAttribute('aria-current', b === btn)); btn.setAttribute('aria-current', 'page');
    pip.style.top = (btn.offsetTop + 11) + 'px';
    $$('[data-pg]').forEach(s => { s.hidden = s.dataset.pg !== p; });
    const shown = $(`[data-pg="${p}"]`);
    if (G) G.from(shown, { y: 16, opacity: 0, duration: .35, ease: 'power3.out' });
    if (p !== 'overview') check('nav');
  }
  $$('.rail button').forEach(b => b.addEventListener('click', () => nav(b.dataset.p, b)));
  requestAnimationFrame(() => { pip.style.top = ($('.rail button').offsetTop + 11) + 'px'; });

  /* ---------- window management ---------- */
  const win = $('#win'), tb = $('#titlebar'), tbApp = $('#tbApp');
  let drag = null, maxed = false, saved = null, minimised = false;
  tb.addEventListener('pointerdown', e => { if (e.target.closest('button') || maxed) return; const [x, y] = toDesk(e.clientX, e.clientY); drag = { x, y, l: win.offsetLeft, t: win.offsetTop }; try { tb.setPointerCapture(e.pointerId); } catch (_) {} });
  tb.addEventListener('pointermove', e => { if (!drag) return; const [x, y] = toDesk(e.clientX, e.clientY); win.style.left = Math.max(-700, Math.min(1100, drag.l + x - drag.x)) + 'px'; win.style.top = Math.max(0, Math.min(640, drag.t + y - drag.y)) + 'px'; });
  tb.addEventListener('pointerup', () => { drag = null; });
  tb.addEventListener('dblclick', e => { if (!e.target.closest('button')) maximise(); });
  function maximise() {
    const to = maxed ? saved : { left: 0, top: 0, width: 1200, height: 672 };
    if (!maxed) saved = { left: win.offsetLeft, top: win.offsetTop, width: win.offsetWidth, height: win.offsetHeight };
    maxed = !maxed;
    const css = Object.fromEntries(Object.entries(to).map(([k, v]) => [k, v + 'px']));
    if (G) G.to(win, { ...css, borderRadius: maxed ? 0 : 8, duration: .35, ease: 'power3.inOut' }); else Object.assign(win.style, css);
  }
  function minimise() {
    if (minimised) return; minimised = true; tbApp.classList.remove('active');
    const tr = tbApp.getBoundingClientRect(), wr = win.getBoundingClientRect();
    const dx = (tr.left + tr.width / 2 - (wr.left + wr.width / 2)) / S, dy = (tr.top - (wr.top + wr.height / 2)) / S;
    if (G) G.to(win, { x: dx, y: dy, scale: .08, opacity: 0, duration: .35, ease: 'power2.in', onComplete: () => { win.hidden = true; } }); else win.hidden = true;
  }
  function restore() {
    const was = minimised; minimised = false; win.hidden = false; tbApp.classList.add('open', 'active'); tbApp.hidden = false;
    if (G) G.to(win, { x: 0, y: 0, scale: 1, opacity: 1, duration: .4, ease: 'expo.out' }); else win.style.transform = '';
    if (was) check('task');
  }
  $('#wMin').addEventListener('click', minimise);
  $('#wMax').addEventListener('click', maximise);
  $('#wClose').addEventListener('click', () => {
    const fin = () => { win.hidden = true; tbApp.classList.remove('open', 'active'); if (G) G.set(win, { scale: 1, opacity: 1 }); };
    minimised = false; if (G) G.to(win, { scale: .96, opacity: 0, duration: .15, onComplete: fin }); else fin();
    notify('StartupTrim closed', 'Open it again from Start or the taskbar.');
  });
  tbApp.addEventListener('click', () => { if (win.hidden) restore(); else minimise(); });
  const start = $('#startMenu');
  $('#startBtn').addEventListener('click', e => {
    e.stopPropagation(); start.hidden = !start.hidden;
    if (!start.hidden && G) G.fromTo(start, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .3, ease: 'expo.out' });
  });
  start.addEventListener('click', e => { e.stopPropagation(); if (e.target.closest('[data-open]')) { start.hidden = true; restore(); } });
  document.addEventListener('click', () => { start.hidden = true; });

  /* ---------- boot ---------- */
  paintDials(true);
  if (G) {
    G.from('.intro > *', { y: 24, opacity: 0, duration: .8, stagger: .1, ease: 'expo.out' });
    G.from('#win', { y: 40, scale: .97, opacity: 0, duration: .7, ease: 'expo.out', delay: .3 });
    G.from('.taskbar', { y: 50, duration: .6, ease: 'expo.out', delay: .4 });
  }
})();
