/* Pulseform — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- Pulseform ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const ZC = ['#8E99AE', '#2F7BFF', '#00B39B', '#FFB000', '#FF6A2B', '#FF2D55'], ZN = ['Resting', 'Zone 1 · Recovery', 'Zone 2 · Base', 'Zone 3 · Tempo', 'Zone 4 · Threshold', 'Zone 5 · Max'];
    const P = { age: 32, rest: 58, method: 'hrr', target: 2, kg: 72 };
    const EF = [['Walk', .54], ['Jog', .655], ['Run', .76], ['Sprint', .96]];
    let effort = 0, hr = 64, running = false, t = 0, tz = [0, 0, 0, 0, 0, 0], hist = [], inZ = 0, lastZ = 0, sum = null, drift = 0, peak = 0, hrSum = 0, trimp = 0, kcal = 0;
    const maxHR = () => 220 - P.age, bounds = () => { const mx = maxHR(), r = P.rest; return [.5, .6, .7, .8, .9, 1].map(f => Math.round(P.method === 'hrr' ? r + f * (mx - r) : f * mx)); };
    const zoneOf = h => { const b = bounds(); if (h < b[0]) return 0; for (let i = 1; i < 6; i++) if (h < b[i]) return i; return 5; };
    const root = el('div', 'pz'), V = {}; ['workout', 'zones', 'summary'].forEach(k => { V[k] = el('section', 'pz-v'); V[k].setAttribute('aria-label', k); if (k !== 'workout') V[k].hidden = true; root.append(V[k]); }); app.append(root); let cur = 'workout';
    function go(k, fs) { if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; if (k === 'zones') zones(); if (k === 'summary') summary();
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .32, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .1, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; if (!fs) haptic(4); }
    H.jump = (k, fs) => go(k, fs);
    const back = () => { const b = el('button', 'pz-bk', '‹ Workout'); b.type = 'button'; b.addEventListener('click', () => go('workout')); return b; };
    /* ---- workout view ---- */
    const W = V.workout, hd = el('div', 'pz-hd'), hl = el('div'), tg = el('div', 'pz-tg'), wt = el('div', 'pz-w'), wsv = svgEl('svg', { viewBox: '0 0 52 64', 'aria-hidden': 'true' }), wring = svgEl('circle', { cx: 26, cy: 30, r: 21, fill: 'none', stroke: '#FF2D55', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-dasharray': '132', 'stroke-dashoffset': '132', transform: 'rotate(-90 26 30)' }), wb = el('b', null, '64'), wz = el('small', null, 'REST'), sync = el('i', 'pz-sync');
    wsv.append(svgEl('circle', { cx: 26, cy: 30, r: 21, fill: 'none', stroke: '#2A3245', 'stroke-width': 3.5 }), wring); wt.append(wsv, wb, wz, sync); wt.setAttribute('role', 'img');
    hl.append(el('p', 'pz-tl', 'TARGET ZONE')); for (let z = 1; z <= 5; z++) { const b = el('button', null, 'Z' + z); b.type = 'button'; b.style.setProperty('--c', ZC[z]); b.dataset.z = z; b.setAttribute('aria-label', ZN[z]); b.addEventListener('click', () => { P.target = z; inZ = 0; paintTarget(); tone(400 + z * 90, .03); }); tg.append(b); } hl.append(tg); hd.append(hl, wt);
    const big = el('div', 'pz-big'), ht = el('div', 'pz-ht'), hsv = svgEl('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }), bpm = el('div', 'pz-bpm'), bn = el('span', null, '64'); hsv.append(svgEl('path', { d: 'M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.6 4.5c2.1 0 3.6 1.2 4.4 2.6.8-1.4 2.3-2.6 4.4-2.6 3.6 0 5.7 3.8 4.2 7.2C19.5 16.4 12 21 12 21z' })); ht.append(hsv); bpm.append(bn, el('small', null, 'bpm')); bpm.setAttribute('aria-live', 'off'); big.append(ht, bpm);
    const zl = el('p', 'pz-zl', 'Resting'), ga = el('div', 'pz-ga'), gsv = svgEl('svg', { viewBox: '0 0 250 140', 'aria-hidden': 'true' }), arcs = el('i'), co = el('p', 'pz-co', 'Press Start when you are ready'); ga.append(gsv);
    const CX = 125, CY = 125, R = 100, A0 = Math.PI, ang = h => { const b = bounds(), lo = b[0] - 20, hi = b[5]; return A0 + Math.max(0, Math.min(1, (h - lo) / (hi - lo))) * Math.PI; }, pt = (a, r) => [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
    const arcP = (a1, a2, r) => { const [x1, y1] = pt(a1, r), [x2, y2] = pt(a2, r); return 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1); };
    const tband = svgEl('path', { fill: 'none', stroke: '#0E1525', 'stroke-width': 26, opacity: .08, 'stroke-linecap': 'round' }), needle = svgEl('g'); needle.append(svgEl('path', { d: 'M-4 0 L0 -86 L4 0 Z', fill: '#0E1525' }), svgEl('circle', { r: 8, fill: '#0E1525' }), svgEl('circle', { r: 3, fill: '#fff' }));
    const segs = []; for (let z = 1; z <= 5; z++) { const p = svgEl('path', { fill: 'none', stroke: ZC[z], 'stroke-width': 14 }); segs.push(p); } const labs = [];
    gsv.append(tband, ...segs, needle); for (let i = 0; i < 6; i++) { const t2 = svgEl('text'); labs.push(t2); gsv.append(t2); }
    function paintGauge() { const b = bounds(); for (let z = 1; z <= 5; z++) segs[z - 1].setAttribute('d', arcP(ang(b[z - 1]) + .01, ang(b[z]) - .01, R)); b.forEach((v, i) => { const [x, y] = pt(ang(v), R + 16); labs[i].setAttribute('x', (x - 8).toFixed(1)); labs[i].setAttribute('y', (y + 3).toFixed(1)); labs[i].textContent = String(v); }); tband.setAttribute('d', arcP(ang(b[P.target - 1]), ang(b[P.target]), R)); }
    const gr = el('div', 'pz-gr'), cv = el('canvas'); cv.width = 716; cv.height = 192; gr.append(cv); const cx = cv.getContext('2d');
    const tzb = el('div', 'pz-tz'), tzl = el('div', 'pz-tzl'), bars = []; for (let z = 0; z <= 5; z++) { const i = el('i'); i.style.setProperty('--c', ZC[z]); i.style.width = '0'; bars.push(i); tzb.append(i); } tzl.append(el('span', null, 'time in zone'), el('span', null, '—'));
    const ef = el('div', 'pz-ef'); EF.forEach(([n, e], i) => { const b = el('button'); b.type = 'button'; b.append(el('span', null, n), el('small', null, Math.round(e * 100) + '%')); b.dataset.i = i; b.addEventListener('click', () => { const was = effort; effort = i; paintEf(); if (i > was) check('effort'); tone(500 + i * 150, .03); haptic(4); }); ef.append(b); });
    const ct = el('div', 'pz-ct'), st = el('button', 'pz-st', 'Start'), fn = el('button', 'pz-fn', 'Finish'), clk = el('p', 'pz-clk', '00:00 · not recording'); st.type = fn.type = 'button'; fn.disabled = true; ct.append(st, fn);
    const zb = el('button', 'pz-bk', 'Zones ›'); zb.type = 'button'; zb.style.marginTop = '10px'; zb.addEventListener('click', () => go('zones'));
    W.append(hd, big, zl, ga, co, gr, tzb, tzl, ef, ct, clk, zb);
    const paintEf = () => ef.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === effort)));
    function paintTarget() { tg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.z === P.target))); paintGauge(); }
    st.addEventListener('click', () => { running = !running; st.textContent = running ? 'Pause' : 'Resume'; fn.disabled = false; if (running) { check('start'); tone(660, .06); setTimeout(() => tone(990, .08), 100); say('Workout started · ' + ZN[P.target] + ' target'); } else say('Paused'); });
    fn.addEventListener('click', () => { if (!t) return; running = false; sum = { t, tz: tz.slice(), avg: Math.round(hrSum / t), peak, trimp, kcal, target: P.target }; check('summary'); tone(880, .06); setTimeout(() => tone(1320, .1), 120); go('summary');
      t = 0; tz = [0, 0, 0, 0, 0, 0]; hrSum = 0; peak = 0; trimp = 0; kcal = 0; drift = 0; inZ = 0; st.textContent = 'Start'; fn.disabled = true; });
    /* ---- physiology tick (0.25 s) ---- */
    setInterval(() => { const mx = maxHR(), e = running ? EF[effort][1] : 0; if (running && e > .5) drift = Math.min(8, drift + .012 * (e - .5)); else drift = Math.max(0, drift - .02);
      const tgt = (e ? P.rest + e * (mx - P.rest) : P.rest + 6) + drift, tau = tgt > hr ? 9 : 22; hr += (tgt - hr) * (.25 / tau) * 4 + (Math.random() - .5) * .7; hr = Math.max(P.rest - 2, Math.min(mx + 2, hr));
      const h = Math.round(hr), z = zoneOf(h); hist.push([h, z]); if (hist.length > 160) hist.shift();
      if (running) { const dt = .25; t += dt; tz[z] += dt; hrSum += h * dt; peak = Math.max(peak, h); const hrr = Math.max(0, (h - P.rest) / (mx - P.rest)); trimp += (dt / 60) * hrr * .64 * Math.exp(1.92 * hrr); kcal += Math.max(0, (-55.0969 + .6309 * h + .1988 * P.kg + .2017 * P.age) / 4.184) * dt / 60;
        if (z === P.target) { inZ += dt; if (inZ >= 10) check('zone'); } else inZ = 0;
        if (z !== lastZ) { haptic(z > lastZ ? [10, 40, 10] : 18); tone(z > lastZ ? 700 + z * 80 : 500, .05, 'sine', .03); } }
      lastZ = z; paint(h, z); }, 250);
    function paint(h, z) { root.style.setProperty('--zc', ZC[z]); bn.textContent = String(h); zl.textContent = ZN[z]; wb.textContent = String(h); wz.textContent = z ? 'ZONE ' + z : 'REST'; wring.setAttribute('stroke', ZC[z]); wring.setAttribute('stroke-dashoffset', (132 * (1 - Math.min(1, (h - P.rest) / (maxHR() - P.rest)))).toFixed(1));
      wt.setAttribute('aria-label', 'Apple Watch mirror: ' + h + ' bpm'); needle.setAttribute('transform', 'translate(' + CX + ' ' + CY + ') rotate(' + ((ang(h) - A0) * 180 / Math.PI - 90).toFixed(1) + ')');
      if (!running) { co.className = 'pz-co'; co.textContent = t ? 'Paused · ' + fmtT(t) : 'Press Start when you are ready'; }
      else if (z === P.target) { co.className = 'pz-co in'; co.textContent = 'In ' + ZN[P.target].split(' · ')[0] + ' · hold it · ' + Math.floor(inZ) + ' s'; }
      else if (z > P.target) { co.className = 'pz-co hi'; co.textContent = 'Ease off · ' + (h - bounds()[P.target]) + ' bpm over'; }
      else { co.className = 'pz-co lo'; co.textContent = 'Pick it up · ' + (bounds()[P.target - 1] - h) + ' bpm under'; }
      clk.textContent = fmtT(t) + (running ? ' · recording' : t ? ' · paused' : ' · not recording');
      const tot = tz.reduce((a, b) => a + b, 0); bars.forEach((b, i) => { b.style.width = (tot ? tz[i] / tot * 100 : 0) + '%'; }); tzl.lastChild.textContent = tot ? Math.round(tz[P.target] / tot * 100) + '% in target' : '—';
      cx.clearRect(0, 0, 716, 192); const b = bounds(), lo = b[0] - 25, hi = b[5] + 5, Y = v => 184 - (v - lo) / (hi - lo) * 176; cx.fillStyle = 'rgba(14,21,37,.05)'; cx.fillRect(0, Y(b[P.target]), 716, Y(b[P.target - 1]) - Y(b[P.target]));
      cx.lineWidth = 5; cx.lineCap = 'round'; for (let i = 1; i < hist.length; i++) { const x0 = 716 - (hist.length - i) * 4.5, x1 = x0 + 4.5; cx.strokeStyle = ZC[hist[i][1]]; cx.beginPath(); cx.moveTo(x0, Y(hist[i - 1][0])); cx.lineTo(x1, Y(hist[i][0])); cx.stroke(); } }
    const fmtT = s2 => { const m = Math.floor(s2 / 60), ss = Math.floor(s2 % 60); return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0'); };
    /* beat-synced heart + watch sync blink */
    (function beat() { if (!reduced && G) G.fromTo(ht, { scale: 1.22 }, { scale: 1, duration: .28, ease: 'power2.out' }); sync.classList.remove('blink'); void sync.offsetWidth; sync.classList.add('blink'); setTimeout(beat, 60000 / Math.max(40, hr)); })();
    /* ---- zones view ---- */
    function zones() { const v = V.zones; v.textContent = ''; v.append(back(), el('h2', 'pz-h2', 'Your zones'));
      const set = el('div', 'pz-set'); [['age', 'Age', 16, 80], ['rest', 'Resting HR', 38, 90]].forEach(([k, l, mn, mx]) => { const c = el('div'), sp = el('div', 'pz-sp'), m = el('button', null, '−'), p = el('button', null, '+'), b = el('b', null, String(P[k])); [m, p].forEach(x => { x.type = 'button'; }); m.setAttribute('aria-label', 'Decrease ' + l); p.setAttribute('aria-label', 'Increase ' + l);
        const ch = d => { P[k] = Math.max(mn, Math.min(mx, P[k] + d)); zones(); paintGauge(); }; m.addEventListener('click', () => ch(-1)); p.addEventListener('click', () => ch(1)); sp.append(m, b, p); c.append(el('small', null, l), sp); set.append(c); }); v.append(set);
      const md = el('div', 'pz-md'); [['hrr', 'Heart-rate reserve'], ['max', '% of max HR']].forEach(([k, l]) => { const b = el('button', null, l); b.type = 'button'; b.setAttribute('aria-pressed', String(P.method === k)); b.addEventListener('click', () => { if (P.method !== k) { P.method = k; check('setup'); tone(620, .03); zones(); paintGauge(); } }); md.append(b); }); v.append(md);
      const b = bounds(), D = ['Easy chat pace, active recovery', 'Aerobic base, can hold for hours', 'Comfortably hard, steady tempo', 'Race pace, lactate threshold', 'All-out, short intervals only'];
      for (let z = 5; z >= 1; z--) { const r = el('div', 'pz-zr'), i = el('i', null, String(z)), m = el('div'); i.style.setProperty('--c', ZC[z]); m.append(el('b', null, ZN[z].split(' · ')[1]), el('span', null, D[z - 1])); r.append(i, m, el('em', null, b[z - 1] + '–' + (b[z] - (z < 5 ? 1 : 0)))); v.append(r); }
      v.append(el('p', 'pz-note', 'Max HR ' + maxHR() + ' bpm (220 − age). ' + (P.method === 'hrr' ? 'Heart-rate reserve (Karvonen) counts from your resting rate of ' + P.rest + ' bpm, so zones fit fitter hearts better.' : 'Percent of max ignores resting heart rate. Simple, but zones sit lower for fit people.'))); }
    /* ---- summary view ---- */
    function summary() { const v = V.summary; v.textContent = ''; v.append(back(), el('h2', 'pz-h2', 'Workout summary')); if (!sum) { v.append(el('p', 'pz-note', 'Finish a workout to see its summary here.')); return; }
      const g = el('div', 'pz-sum'), cell = (b, s2, hl2) => { const d = el('div', hl2 ? 'hl' : null); d.append(el('b', null, b), el('span', null, s2)); g.append(d); };
      cell(fmtT(sum.t), 'duration'); cell(Math.round(sum.tz[sum.target] / sum.t * 100) + '%', 'in ' + ZN[sum.target].split(' · ')[0], true); cell(sum.avg + ' bpm', 'average · peak ' + sum.peak); cell(sum.trimp.toFixed(1), 'TRIMP load'); cell(Math.round(sum.kcal) + ' kcal', 'active energy'); cell(Math.round(sum.t / 60 * 10) / 10 + ' min', 'recorded'); v.append(g);
      const mx = Math.max(...sum.tz); for (let z = 5; z >= 0; z--) { const r = el('div', 'pz-zb'), bar = el('div'), i = el('i'); i.style.setProperty('--c', ZC[z]); i.style.width = (mx ? sum.tz[z] / mx * 100 : 0) + '%'; bar.append(i); r.append(el('span', null, z ? 'Z' + z : 'R'), bar, el('span', null, fmtT(sum.tz[z]))); v.append(r); if (G && !reduced) G.from(i, { width: 0, duration: .7, delay: (5 - z) * .06, ease: 'expo.out' }); }
      const hk = el('div', 'pz-hk'); hk.append(el('span', null, '♥'), el('span', null, 'Saved to Apple Health as an outdoor run')); v.append(hk); }
    paintEf(); paintTarget(); paint(64, 0);
  }
  demo(H.app, H);
  H.boot();
})();
