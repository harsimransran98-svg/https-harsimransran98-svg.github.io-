/* RideLog — Android app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- RideLog ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const M = {"key":"rl_state_v1","trips":[["Col du Galibier loop",142,58,4.9,"2 days ago"],["Coast road to Nice",96,64,4.3,"Last week"],["Morning commute",24,41,3.9,"Last week"],["Alps tour, day 1",238,61,5.2,"Oct 12"]]};
    const trips = M.trips.map(t => ({ n: t[0], km: t[1], avg: t[2], l100: t[3], when: t[4] })); const KM = 18;
    let rid = false, prog = 0, dist = 0, peak = 0, sumV = 0, n = 0, fuel = 0, open = -1, timer = 0;
    const root = el('div', 'rl'), V = {}; ['ride', 'trips', 'fuel'].forEach(k => { V[k] = el('section', 'rl-v'); V[k].setAttribute('aria-label', k); if (k !== 'ride') V[k].hidden = true; root.append(V[k]); });
    const nav = el('nav', 'rl-nav'); [['ride', 'Ride'], ['trips', 'Trips'], ['fuel', 'Fuel']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(nav); app.append(root); let cur = 'ride';
    function go(k) { if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k))); if (k === 'trips') renderTrips(); if (k === 'fuel') { renderFuel(); check('economy'); }
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: .3, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .1, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; haptic(5); }
    H.jump = go;

    /* ---- the pass: a twisty road + contour lines ---- */
    const map = el('div', 'rl-map'), sv = svgEl('svg', { viewBox: '0 0 360 250', role: 'img', 'aria-label': 'Route map of a mountain pass' });
    for (let i = 0; i < 6; i++) sv.append(svgEl('path', { class: 'ctr', d: 'M-10 ' + (40 + i * 38) + ' C 80 ' + (10 + i * 40) + ' 140 ' + (90 + i * 30) + ' 220 ' + (40 + i * 36) + ' S 340 ' + (20 + i * 40) + ' 380 ' + (60 + i * 34) }));
    const D = 'M20 220 C 60 220 70 190 50 170 S 40 120 90 120 S 150 150 160 110 S 120 60 170 50 S 230 90 250 60 S 230 20 280 25 S 330 70 300 100 S 260 140 300 160 S 350 200 340 230';
    const road = svgEl('path', { d: D, class: 'road' }), done = svgEl('path', { d: D, class: 'done' }), bike = svgEl('circle', { r: 7, class: 'bike' }); sv.append(road, done, bike);
    [['Bourg', 26, 238], ['Col 2642 m', 262, 16], ['Valloire', 300, 246]].forEach(([t, x, y]) => { const tx = svgEl('text', { x, y }); tx.textContent = t; sv.append(tx); }); map.append(sv);
    const L = road.getTotalLength(); done.setAttribute('stroke-dasharray', L + ' ' + L);
    const curv = f => { const d0 = 4, a = road.getPointAtLength(Math.max(0, f * L - d0)), b = road.getPointAtLength(f * L), c = road.getPointAtLength(Math.min(L, f * L + d0)); const a1 = Math.atan2(b.y - a.y, b.x - a.x), a2 = Math.atan2(c.y - b.y, c.x - b.x); let da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; return da / (2 * d0); };

    /* ---- gauges ---- */
    const gauge = (cls, label) => { const g = el('div', 'rl-g ' + cls), s0 = svgEl('svg', { viewBox: '0 0 160 110', 'aria-hidden': 'true' }), defs = svgEl('defs'), gr = svgEl('linearGradient', { id: 'rlG' }); gr.append(svgEl('stop', { offset: 0, 'stop-color': '#FFD23F' }), svgEl('stop', { offset: 1, 'stop-color': '#F2541B' })); defs.append(gr); s0.append(defs);
      const arcD = 'M20 96 A60 60 0 0 1 140 96'; s0.append(svgEl('path', { d: arcD, class: 'arc' })); const fill = svgEl('path', { d: arcD, class: 'fill', pathLength: 100, 'stroke-dasharray': '0 100' }), nd = svgEl('line', { x1: 80, y1: 96, x2: 80, y2: 46, class: 'nd' }); s0.append(fill, nd);
      const val = el('div', 'val', '0'); g.append(s0, val, el('small', null, label)); return { g, fill, nd, val }; };
    const spd = gauge('', 'KM/H'), lean = el('div', 'rl-g rl-lean'), ls = svgEl('svg', { viewBox: '0 0 160 110', 'aria-hidden': 'true' }), bk = svgEl('g'), lv = el('div', 'val', '0°'), pk = el('div', 'pk', 'peak 0°');
    ls.append(svgEl('line', { x1: 20, y1: 96, x2: 140, y2: 96, class: 'hz' })); bk.append(svgEl('rect', { x: -6, y: -54, width: 12, height: 54, rx: 6, class: 'bk' }), svgEl('circle', { cx: 0, cy: -60, r: 9, fill: '#F2F2F4' })); bk.setAttribute('transform', 'translate(80 96)'); ls.append(bk); lean.append(ls, lv, el('small', null, 'LEAN'), pk);
    const dash = el('div', 'rl-dash'); dash.append(spd.g, lean);
    const st = el('div', 'rl-st'), cells = ['KM', 'AVG', 'L USED', 'L/100'].map(t => { const d = el('div'), b = el('b', null, '0'); d.append(b, el('span', null, t)); st.append(d); return b; });
    const acts = el('div', 'rl-acts'), goB = el('button', 'go', 'Start ride'), ref = el('button', null, '⛽'); goB.type = ref.type = 'button'; ref.setAttribute('aria-label', 'Log a fill-up'); ref.addEventListener('click', () => go('fuel')); acts.append(goB, ref);
    V.ride.append(map, dash, st, acts);
    function paint(v, lnDeg) {
      const p = road.getPointAtLength(prog * L); bike.setAttribute('cx', p.x.toFixed(1)); bike.setAttribute('cy', p.y.toFixed(1)); done.setAttribute('stroke-dashoffset', (L * (1 - prog)).toFixed(1));
      spd.fill.setAttribute('stroke-dasharray', (v / 160 * 100).toFixed(1) + ' 100'); const a = (-90 + v / 160 * 180) * Math.PI / 180; spd.nd.setAttribute('x2', (80 + Math.sin(a) * 50).toFixed(1)); spd.nd.setAttribute('y2', (96 - Math.cos(a) * 50).toFixed(1)); spd.val.textContent = String(Math.round(v));
      bk.setAttribute('transform', 'translate(80 96) rotate(' + lnDeg.toFixed(1) + ')'); lv.textContent = Math.round(Math.abs(lnDeg)) + '°'; pk.textContent = 'peak ' + Math.round(peak) + '°';
      cells[0].textContent = dist.toFixed(1); cells[1].textContent = n ? Math.round(sumV / n) : '0'; cells[2].textContent = fuel.toFixed(2); cells[3].textContent = dist > .2 ? (fuel / dist * 100).toFixed(1) : '–';
    }
    goB.addEventListener('click', () => { if (rid) { stop(); return; } rid = true; if (prog >= 1) { prog = 0; dist = 0; peak = 0; sumV = 0; n = 0; fuel = 0; } goB.textContent = 'Stop'; goB.classList.add('on'); check('start'); tone(140, .3, 'sawtooth', .05); haptic(30); let last = performance.now();
      timer = setInterval(() => { const now = performance.now(), dt = Math.min(.2, (now - last) / 1000); last = now; const k = Math.abs(curv(prog)), v = Math.max(28, Math.min(150, 150 - k * 2600)), c0 = curv(prog), lnDeg = Math.sign(c0) * 52 * Math.tanh(Math.abs(c0) * 18);
        prog = Math.min(1, prog + v * dt / 3600 * 60 / KM * .4); dist = prog * KM; sumV += v; n++; fuel = dist * (4.2 + Math.min(1.6, peak / 40)) / 100; peak = Math.max(peak, Math.abs(lnDeg)); if (peak >= 30) check('lean');
        paint(v, lnDeg); if (prog >= 1) stop(true); }, 40); });
    function stop(done2) { clearInterval(timer); rid = false; goB.textContent = prog >= 1 ? 'Ride again' : 'Resume'; goB.classList.remove('on'); paint(0, 0);
      if (done2 || dist > 1) { trips.unshift({ n: 'Col du Galibier, just now', km: +dist.toFixed(1), avg: n ? Math.round(sumV / n) : 0, l100: +(fuel / Math.max(.1, dist) * 100).toFixed(1), when: 'Just now', peak: Math.round(peak), fresh: true }); say('Ride saved · ' + dist.toFixed(1) + ' km, peak lean ' + Math.round(peak) + '°'); tone(660, .08); prog = done2 ? 1 : prog; } }

    /* ---- trips ---- */
    const thumb = (seed) => { const s0 = svgEl('svg', { viewBox: '0 0 72 54', 'aria-hidden': 'true' }); let d = 'M6 46', x = 6, y = 46, r = seed * 9301 % 233; for (let i = 0; i < 6; i++) { r = (r * 9301 + 49297) % 233280; const nx = x + 9 + (r % 7), ny = 10 + (r % 36); d += ' Q ' + (x + 4) + ' ' + ((y + ny) / 2 - 8) + ' ' + nx + ' ' + ny; x = nx; y = ny; } s0.append(svgEl('path', { d, fill: 'none', stroke: '#F2541B', 'stroke-width': 2.5, 'stroke-linecap': 'round' })); return s0; };
    function renderTrips() { const v = V.trips; v.textContent = ''; const h = el('div', 'rl-h'); h.append(el('small', null, trips.length + ' rides · ' + Math.round(trips.reduce((a, t) => a + t.km, 0)) + ' km'), el('h2', null, 'Trips')); v.append(h);
      trips.forEach((t, i) => { const b = el('button', 'rl-trip'), mid = el('div'); b.type = 'button'; b.setAttribute('aria-expanded', String(i === open)); mid.append(el('b', null, t.n), el('small', null, t.when + ' · ' + t.km + ' km')); b.append(thumb(i + 3 + t.km), mid, el('em', null, t.l100 + ' L'));
        if (i === open) { const det = el('div', 'rl-det'); [[t.avg, 'avg km/h'], [t.peak || 38 + i * 3, 'peak lean °'], [(t.km * t.l100 / 100).toFixed(1), 'litres']].forEach(([x, l]) => { const d = el('div'); d.append(el('b', null, String(x)), document.createTextNode(l)); det.append(d); }); b.append(det); }
        b.addEventListener('click', () => { open = open === i ? -1 : i; check('trip'); renderTrips(); }); v.append(b); }); }

    /* ---- fuel ---- */
    function renderFuel() { const v = V.fuel; v.textContent = ''; const h = el('div', 'rl-h'), best = Math.min(...trips.map(t => t.l100)); h.append(el('small', null, 'Litres per 100 km · lower is better'), el('h2', null, 'Fuel')); v.append(h);
      const ec = el('div', 'rl-ec'), mx = Math.max(...trips.map(t => t.l100)); trips.slice(0, 5).reverse().forEach(t => { const d = el('div'), bar = el('i', t.l100 === best ? 'best' : t.fresh ? 'now' : ''); bar.style.height = (t.l100 / mx * 74) + '%'; d.append(el('b', null, String(t.l100)), bar, el('span', null, t.n.split(/[ ,]/)[0])); ec.append(d); }); v.append(ec);
      const f = el('form', 'rl-fill'), inp = el('input'), b = el('button', null, 'Log fill-up'); inp.inputMode = 'decimal'; inp.placeholder = 'Litres, e.g. 14.2'; inp.setAttribute('aria-label', 'Litres filled'); inp.maxLength = 5; b.type = 'submit'; f.append(inp, b);
      const note = el('p', 'rl-note', 'Economy is worked out from your fill-ups, so it gets more accurate every tank.');
      f.addEventListener('submit', e => { e.preventDefault(); const l = parseFloat(inp.value.replace(',', '.')); if (!(l > 0 && l < 40)) { say('Enter the litres you filled, up to 40'); return; } const km = trips.slice(0, 3).reduce((a, t) => a + t.km, 0) || 100; note.textContent = 'Logged ' + l.toFixed(1) + ' L · ' + (l / km * 100).toFixed(1) + ' L/100 km since your last fill-up.'; check('refuel'); tone(700, .07); say('Fill-up logged'); inp.value = ''; });
      v.append(f, note); }
    nav.querySelector('[data-v="ride"]').setAttribute('aria-selected', 'true'); paint(0, 0);
  }
  demo(H.app, H);
  H.boot();
})();
