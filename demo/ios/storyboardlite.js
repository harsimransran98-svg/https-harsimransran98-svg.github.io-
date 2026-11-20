/* Storyboard Lite — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "poster";
/* ---------- Storyboard Lite ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const LOC = { A: 'Rooftop · night', B: 'Rosie’s Diner · day' }, TYPES = ['WS', 'MS', 'OTS', 'CU', 'ECU'], MOVES = [['static', 'Static'], ['pan', 'Pan'], ['tilt', 'Tilt'], ['dolly', 'Dolly in'], ['truck', 'Truck']];
    const ZM = { WS: 1, MS: 1.9, OTS: 2.1, CU: 3.4, ECU: 6.2 };
    let shots = [[1, 'A', 'WS', 'static', 24, 4, 'Establish the rooftop. MAYA alone at the rail.', [60, 52]], [2, 'A', 'MS', 'dolly', 35, 3, 'Push in as she reads the text.', [62, 46]], [3, 'A', 'CU', 'static', 50, 2, 'Her reaction. Hold on the breath.', [62, 40]], [4, 'B', 'WS', 'pan', 24, 4, 'The diner. Rain on the windows, JONAH waiting.', [80, 50]],
      [5, 'B', 'OTS', 'static', 50, 3, 'Over Jonah’s shoulder as Maya walks in.', [104, 46]], [6, 'B', 'CU', 'static', 85, 2, 'Jonah: “You came.”', [56, 36]], [7, 'A', 'ECU', 'static', 100, 2, 'Insert: phone screen, “Diner. Now.”', [68, 60]], [8, 'B', 'MS', 'tilt', 35, 3, 'They sit. Tilt down to the two cups.', [80, 54]]].map(([n, loc, type, move, mm, dur, note, f]) => ({ n, loc, type, move, mm, dur, note, f, setup: { 1: 'rail wide', 2: 'rail wide', 3: 'Maya front', 4: 'door wide', 5: 'Jonah back', 6: 'Maya side', 7: 'Maya front', 8: 'door wide' }[n] }));
    let ar = '16:9', sortMode = 'script', got = new Set();
    const AR = { '16:9': 9 / 16, '2.39': 1 / 2.39, '9:16': 16 / 9 };
    /* ---- pencil scenes in a 160×90 world ---- */
    const INK = '#3A3A42';
    function pencil(g, d, w, op) { g.append(svgEl('path', { d, fill: 'none', stroke: INK, 'stroke-width': w || .9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: op || .9 })); g.append(svgEl('path', { d, fill: 'none', stroke: INK, 'stroke-width': (w || .9) * .5, opacity: .35, transform: 'translate(.4 .3)' })); }
    function person(g, x, y, s2, facing, hair) { g.append(svgEl('path', { d: 'M' + (x - 7 * s2) + ' ' + (y + 40 * s2) + ' Q' + (x - 8 * s2) + ' ' + (y + 12 * s2) + ' ' + x + ' ' + (y + 10 * s2) + ' Q' + (x + 8 * s2) + ' ' + (y + 12 * s2) + ' ' + (x + 7 * s2) + ' ' + (y + 40 * s2) + ' Z', fill: '#D9D6CE' }));
      pencil(g, 'M' + (x - 7 * s2) + ' ' + (y + 40 * s2) + ' Q' + (x - 8 * s2) + ' ' + (y + 12 * s2) + ' ' + x + ' ' + (y + 10 * s2) + ' Q' + (x + 8 * s2) + ' ' + (y + 12 * s2) + ' ' + (x + 7 * s2) + ' ' + (y + 40 * s2));
      g.append(svgEl('circle', { cx: x, cy: y + 4 * s2, r: 5 * s2, fill: '#EDE9E0' })); pencil(g, 'M' + (x + 5 * s2) + ' ' + (y + 4 * s2) + ' a' + 5 * s2 + ' ' + 5 * s2 + ' 0 1 1 0 -.1', .8);
      if (hair) g.append(svgEl('path', { d: 'M' + (x - 5.2 * s2) + ' ' + (y + 4 * s2) + ' Q' + x + ' ' + (y - 4 * s2) + ' ' + (x + 5.2 * s2) + ' ' + (y + 3 * s2) + ' L' + (x + 5 * s2) + ' ' + (y + 9 * s2) + ' Q' + (x + 2 * s2) + ' ' + (y + 1 * s2) + ' ' + (x - 5 * s2) + ' ' + (y + 6 * s2) + ' Z', fill: '#4A4650', opacity: .8 }));
      pencil(g, 'M' + (x + facing * 1.8 * s2) + ' ' + (y + 3.4 * s2) + ' l' + (facing * .1) + ' .1 M' + (x + facing * 3.6 * s2) + ' ' + (y + 3.4 * s2) + ' l.1 .1', 1.1 * s2); }
    function scene(loc, idx) { const g = svgEl('g');
      if (loc === 'A') { g.append(svgEl('rect', { width: 160, height: 90, fill: '#DCDDE6' })); g.append(svgEl('circle', { cx: 128, cy: 18, r: 7, fill: '#F7F4EA' })); pencil(g, 'M135 18 a7 7 0 1 1 0 -.1', .6, .6);
        [[0, 52, 14], [16, 44, 12], [30, 56, 10], [42, 40, 16], [60, 50, 12], [74, 46, 18], [94, 54, 10], [106, 42, 14], [122, 50, 16], [140, 46, 20]].forEach(([x, y, w]) => { g.append(svgEl('rect', { x, y, width: w, height: 90 - y, fill: '#C3C4D0' })); pencil(g, 'M' + x + ' 90 V' + y + ' H' + (x + w) + ' V90', .5, .5); for (let wy = y + 4; wy < 66; wy += 6) if ((x + wy) % 3) g.append(svgEl('rect', { x: x + 3, y: wy, width: 2, height: 2.5, fill: '#F2E7B8', opacity: .9 })); });
        g.append(svgEl('rect', { y: 66, width: 160, height: 24, fill: '#B8B7C0' })); pencil(g, 'M0 66 H160', 1); pencil(g, 'M0 72 H160 M10 66 V72 M40 66 V72 M70 66 V72 M100 66 V72 M130 66 V72', .7, .7); person(g, 62, 36, 1, 1, true);
        g.append(svgEl('rect', { x: 64.5, y: 57, width: 7, height: 10, rx: 1.2, fill: '#2C2C33' })); g.append(svgEl('rect', { x: 65.3, y: 58, width: 5.4, height: 8, rx: .6, fill: '#BFE3FF' })); const t = svgEl('text', { x: 65.8, y: 62.4, 'font-size': 1.5, fill: '#1A1A1F', 'font-family': 'Overpass Mono, monospace' }); t.textContent = 'Diner.'; g.append(t); const t2 = svgEl('text', { x: 65.8, y: 64.4, 'font-size': 1.5, fill: '#1A1A1F', 'font-family': 'Overpass Mono, monospace' }); t2.textContent = 'Now.'; g.append(t2); }
      else { g.append(svgEl('rect', { width: 160, height: 90, fill: '#EFE9DC' })); [[8, 10], [50, 10], [92, 10], [134, 10]].forEach(([x, y]) => { g.append(svgEl('rect', { x, y, width: 36, height: 34, fill: '#C9D3DA' })); pencil(g, 'M' + x + ' ' + y + ' h36 v34 h-36 Z M' + (x + 18) + ' ' + y + ' v34', .6, .7); for (let k = 0; k < 6; k++) pencil(g, 'M' + (x + 3 + k * 6) + ' ' + (y + 4 + (k % 3) * 9) + ' l-1 4', .35, .5); });
        g.append(svgEl('rect', { y: 60, width: 160, height: 30, fill: '#D8CDB8' })); pencil(g, 'M0 60 H160 M0 63 H160', .9); person(g, 56, 30, 1, 1, false); person(g, 104, 30, 1, -1, true);
        [[74, 58], [86, 58]].forEach(([x, y]) => { g.append(svgEl('path', { d: 'M' + x + ' ' + y + ' h6 l-1 5 h-4 Z', fill: '#fff' })); pencil(g, 'M' + x + ' ' + y + ' h6 l-1 5 h-4 Z M' + (x + 6) + ' ' + (y + 1) + ' q2 1 0 3', .6); pencil(g, 'M' + (x + 2) + ' ' + (y - 2) + ' q1 -2 0 -3 M' + (x + 4) + ' ' + (y - 2) + ' q-1 -2 0 -3', .4, .5); }); }
      return g; }
    const zoomOf = sh => ZM[sh.type] * Math.pow(sh.mm / 35, .55);
    function vb(sh, k) { const z = zoomOf(sh) * (k || 1), r = AR[ar]; let w, h; if (r > 1) { h = 90 / z; w = h / r; } else { w = 160 / z; h = w * r; if (h > 90) { h = 90; w = h / r; } } let cx = sh.f[0], cy = sh.f[1]; if (sh.type === 'OTS') cx -= w * .12; cx = Math.max(w / 2, Math.min(160 - w / 2, cx)); cy = Math.max(h / 2, Math.min(90 - h / 2, cy)); return [cx - w / 2, cy - h / 2, w, h]; }
    function frame(sh, opt) { const fr = el('div', 'sb-fr'), r = AR[ar]; fr.style.aspectRatio = r > 1 ? '9 / 16' : (1 / r).toFixed(3) + ' / 1'; if (r > 1 && !(opt && opt.big)) fr.style.maxHeight = '190px', fr.style.margin = '0 auto', fr.style.width = (190 / r) + 'px';
      const [x, y, w, h] = vb(sh), sv = svgEl('svg', { viewBox: x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2), preserveAspectRatio: 'xMidYMid slice', role: 'img', 'aria-label': 'Shot ' + sh.n + ': ' + sh.type + ', ' + sh.mm + ' mm, ' + sh.move });
      const world = scene(sh.loc); sv.append(world); if (sh.type === 'OTS') { const sx = x + w * .02, sy = y + h * .35; sv.append(svgEl('ellipse', { cx: sx, cy: sy + h * .55, rx: w * .26, ry: h * .5, fill: '#5A5862', opacity: .92 }), svgEl('circle', { cx: sx + w * .06, cy: sy + h * .05, r: h * .2, fill: '#4A4650' })); }
      const ov = svgEl('g', { 'stroke-linecap': 'round', fill: 'none' }), ax = (x1, y1, x2, y2) => { const a = Math.atan2(y2 - y1, x2 - x1), L = Math.min(w, h) * .08; ov.append(svgEl('path', { d: 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + ' M' + (x2 - L * Math.cos(a - .5)) + ' ' + (y2 - L * Math.sin(a - .5)) + ' L' + x2 + ' ' + y2 + ' L' + (x2 - L * Math.cos(a + .5)) + ' ' + (y2 - L * Math.sin(a + .5)), stroke: '#E5484D', 'stroke-width': Math.min(w, h) * .025 })); };
      const cxm = x + w / 2, cym = y + h / 2; if (sh.move === 'pan' || sh.move === 'truck') ax(x + w * .25, y + h * .14, x + w * .75, y + h * .14); if (sh.move === 'tilt') ax(x + w * .92, y + h * .2, x + w * .92, y + h * .8); if (sh.move === 'dolly') [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => ax(cxm + a * w * .44, cym + b * h * .42, cxm + a * w * .3, cym + b * h * .28));
      if (sh.move !== 'static' && !(opt && opt.clean)) sv.append(ov); fr.append(sv); fr._sv = sv; return fr; }
    /* ---- shell ---- */
    const root = el('div', 'sb'), V = {}; ['board', 'list'].forEach(k => { V[k] = el('section', 'sb-v'); V[k].setAttribute('aria-label', k); if (k !== 'board') V[k].hidden = true; root.append(V[k]); }); app.append(root); let cur = 'board';
    const bar = el('div', 'sb-bar'), pl = el('button', 'sb-pl', '▶ Animatic'), sl = el('button', 'sb-sl', 'Shot list'); pl.type = sl.type = 'button'; bar.append(pl, sl); root.append(bar);
    pl.addEventListener('click', animatic); sl.addEventListener('click', () => go(cur === 'list' ? 'board' : 'list'));
    function go(k, fs) { if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; paint(); sl.textContent = k === 'list' ? 'Board' : 'Shot list'; sl.setAttribute('aria-pressed', String(k === 'list'));
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .3, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .1, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; if (!fs) haptic(4); }
    const runtime = () => shots.reduce((a, b) => a + b.dur, 0);
    /* ---- board ---- */
    function board(v) { v.textContent = ''; const hd = el('div', 'sb-hd'), t = el('div'), ars = el('div', 'sb-ar'); t.append(el('small', null, 'Sc. 12 · “You came”'), el('h2', null, 'Storyboard')); Object.keys(AR).forEach(k => { const b = el('button', null, k); b.type = 'button'; b.setAttribute('aria-pressed', String(k === ar)); b.setAttribute('aria-label', 'Aspect ratio ' + k); b.addEventListener('click', () => { ar = k; paint(); tone(500, .03); }); ars.append(b); }); hd.append(t, ars); v.append(hd);
      const gr = el('div', 'sb-gr'); shots.forEach((sh, i) => { const p = el('button', 'sb-pn'); p.type = 'button'; p.dataset.i = i; p.setAttribute('aria-label', 'Panel ' + (i + 1) + ', shot ' + sh.n + '. Open to edit, drag to reorder.'); const fr = frame(sh), cap = el('div', 'sb-cap');
        fr.append(el('span', 'sb-no', String(i + 1))); cap.append(el('span', null, sh.type + ' · ' + sh.mm + 'mm' + (sh.move !== 'static' ? ' · ' + sh.move : '')), el('span', null, sh.dur + 's')); p.append(fr, cap, el('p', 'sb-nt', sh.note)); hookDrag(p, i); gr.append(p); }); v.append(gr);
      const rt = el('div', 'sb-rt'), rtl = el('div', 'sb-rtl'); shots.forEach(sh => { const i = el('i'); i.style.flex = sh.dur + ' 1 0'; rt.append(i); }); rtl.append(el('span', null, shots.length + ' shots'), el('span', null, 'runtime 0:' + String(runtime()).padStart(2, '0'))); v.append(rt, rtl); }
    /* drag reorder */
    function hookDrag(p, i) { let sx = 0, sy = 0, dragging = false, gh = null, over = -1;
      const mv = e => { const dx = e.clientX - sx, dy = e.clientY - sy; if (!dragging && Math.hypot(dx, dy) > 8) { dragging = true; p.classList.add('drag'); gh = p.cloneNode(true); gh.className = 'sb-pn sb-ghost'; gh.removeAttribute('aria-label'); root.append(gh); tone(300, .03); haptic(10); }
        if (!dragging) return; const r = root.getBoundingClientRect(), sc = r.width / root.offsetWidth; gh.style.left = ((e.clientX - r.left) / sc - 85) + 'px'; gh.style.top = ((e.clientY - r.top) / sc - 60) + 'px';
        over = -1; V.board.querySelectorAll('.sb-pn:not(.sb-ghost)').forEach(c => { const cr = c.getBoundingClientRect(), hit = e.clientX > cr.left && e.clientX < cr.right && e.clientY > cr.top && e.clientY < cr.bottom; c.classList.toggle('drop', hit && +c.dataset.i !== i); if (hit) over = +c.dataset.i; }); };
      const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); if (gh) gh.remove(); if (dragging) { p.classList.remove('drag'); if (over >= 0 && over !== i) { const [m] = shots.splice(i, 1); shots.splice(over, 0, m); check('reorder'); tone(700, .04); haptic(12); say('Shot ' + m.n + ' moved to panel ' + (over + 1)); } paint(); setTimeout(() => { dragging = false; }, 0); } };
      p.addEventListener('pointerdown', e => { if (e.button) return; sx = e.clientX; sy = e.clientY; dragging = false; window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); });
      p.addEventListener('click', () => { if (!dragging) edit(i); }); }
    /* edit sheet */
    let sheet = null;
    function edit(i) { closeSheet(); const sh = shots[i]; sheet = el('div', 'sb-sh'); sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-label', 'Edit shot ' + sh.n); const h3 = el('h3', null, 'Shot ' + sh.n + ' · ' + LOC[sh.loc].split(' · ')[0]), done = el('button', null, 'Done'); done.type = 'button'; done.addEventListener('click', closeSheet); h3.append(done);
      const pv = el('div'), fill = () => { pv.textContent = ''; pv.append(frame(sh, { big: true })); }; fill();
      const segRow = (label, opts, key, cb) => { const lb = el('p', 'sb-lb', label), seg = el('div', 'sb-seg'); opts.forEach(([k, l]) => { const b = el('button', null, l); b.type = 'button'; b.setAttribute('aria-pressed', String(sh[key] === k)); b.addEventListener('click', () => { sh[key] = k; seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); fill(); cb(k); tone(620, .02); }); seg.append(b); }); return [lb, seg]; };
      const [l1, s1] = segRow('Shot size', TYPES.map(t => [t, t]), 'type', () => check('edit')), [l2, s2] = segRow('Camera move', MOVES.map(([k, l]) => [k, l.split(' ')[0]]), 'move', k => { if (k !== 'static') check('move'); });
      const lb3 = el('p', 'sb-lb', 'Lens'), lv = el('b', null, sh.mm + ' mm'), rg = el('input'); lb3.append(lv); rg.type = 'range'; rg.min = 18; rg.max = 135; rg.step = 1; rg.value = sh.mm; rg.setAttribute('aria-label', 'Focal length'); rg.addEventListener('input', () => { sh.mm = +rg.value; lv.textContent = sh.mm + ' mm'; fill(); check('edit'); });
      const lb4 = el('p', 'sb-lb', 'Duration'), dv = el('b', null, sh.dur + ' s'), dr = el('input'); lb4.append(dv); dr.type = 'range'; dr.min = 1; dr.max = 10; dr.step = 1; dr.value = sh.dur; dr.setAttribute('aria-label', 'Duration in seconds'); dr.addEventListener('input', () => { sh.dur = +dr.value; dv.textContent = sh.dur + ' s'; });
      sheet.append(el('i', 'grab'), h3, pv, l1, s1, l2, s2, lb3, rg, lb4, dr); root.append(sheet); if (G && !reduced) G.from(sheet, { yPercent: 100, duration: .4, ease: 'expo.out' }); }
    function closeSheet() { if (!sheet) return; const s2 = sheet; sheet = null; s2.style.pointerEvents = 'none'; if (G && !reduced) G.to(s2, { yPercent: 100, duration: .25, ease: 'power2.in' }); setTimeout(() => s2.remove(), 260); paint(); }
    /* ---- animatic ---- */
    let an = null, anT = 0;
    function animatic() { closeSheet(); if (an) return; check('animatic'); an = el('div', 'sb-an'); const hh = el('header'), x = el('button', 'x', 'Close'), lab = el('b'), pr = el('div', 'pr'), cap = el('p'), stage = el('div'); x.type = 'button'; hh.append(lab, x); an.append(hh, stage, cap, pr); root.append(an);
      const segs = shots.map(sh => { const i = el('i'), b = el('b'); i.style.flex = sh.dur + ' 1 0'; i.append(b); pr.append(i); return b; });
      let k = -1, t0 = 0, fr = null, base = null; const stop = () => { clearInterval(anT); if (an) { an.remove(); an = null; } };
      x.addEventListener('click', stop);
      const show = j => { k = j; const sh = shots[j]; stage.textContent = ''; fr = frame(sh, { clean: true, big: true }); fr.append(el('span', 'sb-sub', sh.type + ' · ' + sh.mm + 'mm · ' + sh.move)); stage.append(fr); base = vb(sh); lab.textContent = 'Shot ' + sh.n; cap.textContent = sh.note; t0 = performance.now(); tone(240, .03, 'square', .02); };
      show(0); anT = setInterval(() => { const sh = shots[k], p = Math.min(1, (performance.now() - t0) / (sh.dur * 1000 * (reduced ? .5 : 1))); segs.forEach((b, i) => { b.style.width = (i < k ? 100 : i === k ? p * 100 : 0) + '%'; });
        let [x0, y0, w, h] = base; const e = p * p * (3 - 2 * p); if (sh.move === 'pan' || sh.move === 'truck') x0 += (e - .5) * w * .5; if (sh.move === 'tilt') y0 += (e - .5) * h * .5; if (sh.move === 'dolly') { const z = 1 + .35 * e; x0 += w * (1 - 1 / z) / 2; y0 += h * (1 - 1 / z) / 2; w /= z; h /= z; }
        x0 = Math.max(0, Math.min(160 - w, x0)); y0 = Math.max(0, Math.min(90 - h, y0)); fr._sv.setAttribute('viewBox', x0.toFixed(2) + ' ' + y0.toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2));
        if (p >= 1) { if (k + 1 < shots.length) show(k + 1); else { clearInterval(anT); cap.textContent = 'End of scene · ' + runtime() + ' s'; tone(523, .08); setTimeout(() => tone(392, .12), 160); } } }, 40); }
    /* ---- shot list ---- */
    const bySetup = list => list.slice().sort((a, b) => a.loc.localeCompare(b.loc) || a.setup.localeCompare(b.setup) || a.n - b.n);
    function setups(list) { let n = 0, prev = null; list.forEach(sh => { const key = sh.loc + '|' + sh.setup; if (key !== prev) n++; prev = key; }); return n; }
    function listView(v) { v.textContent = ''; const hd = el('div', 'sb-hd'), t = el('div'); t.append(el('small', null, 'Shoot day 3 · call 07:30'), el('h2', null, 'Shot list')); hd.append(t); v.append(hd);
      const ord = sortMode === 'setup' ? bySetup(shots) : shots.slice();
      const sum = el('div', 'sb-sum'), cell = (b, s2) => { const d = el('div'); d.append(el('b', null, b), el('span', null, s2)); sum.append(d); }; cell(String(setups(ord)), 'camera setups'); cell(got.size + '/' + shots.length, 'shots in the can'); cell(sortMode === 'setup' ? String(setups(shots) - setups(ord)) : '—', 'setups saved'); v.append(sum);
      const srt = el('div', 'sb-srt'); [['script', 'Script order'], ['setup', 'By setup']].forEach(([k, l]) => { const b = el('button', null, l); b.type = 'button'; b.setAttribute('aria-pressed', String(sortMode === k)); b.addEventListener('click', () => { sortMode = k; if (k === 'setup') { check('shotlist'); say('Grouped by location and camera position: ' + (setups(shots) - setups(bySetup(shots))) + ' fewer setups'); } paint(); tone(560, .03); }); srt.append(b); }); v.append(srt);
      const ul = el('ul', 'sb-lst'); let grp = null; ord.forEach(sh => { const gk = sortMode === 'setup' ? LOC[sh.loc] : null; if (gk && gk !== grp) { grp = gk; const g = el('li', 'sb-grp'); g.append(el('span', null, gk), el('span', null, ord.filter(o => o.loc === sh.loc).length + ' shots')); ul.append(g); }
        const li = el('li', 'sb-row' + (got.has(sh.n) ? ' got' : '')), m = el('div'), ck = el('button', 'sb-ck', '✓'); ck.type = 'button'; ck.setAttribute('aria-pressed', String(got.has(sh.n))); ck.setAttribute('aria-label', 'Mark shot ' + sh.n + ' as shot');
        ck.addEventListener('click', () => { if (got.has(sh.n)) got.delete(sh.n); else { got.add(sh.n); tone(880, .04); haptic(8); } paint(); }); m.append(el('b', null, sh.note), el('span', null, (sortMode === 'setup' ? '' : LOC[sh.loc].split(' · ')[0] + ' · ') + sh.setup + ' · ' + sh.move));
        li.append(el('b', null, String(sh.n)), m, el('em', null, sh.type + ' ' + sh.mm), ck); ul.append(li); }); v.append(ul); }
    function paint() { const v = V[cur], st = v.scrollTop; (cur === 'board' ? board : listView)(v); v.scrollTop = st; }
    H.jump = (k, fs) => { if (k === 'animatic') { go('board', fs); if (!fs) animatic(); return; } if (an) { clearInterval(anT); an.remove(); an = null; } go(k, fs); };
    paint();
  }
  demo(H.app, H);
  H.boot();
})();
