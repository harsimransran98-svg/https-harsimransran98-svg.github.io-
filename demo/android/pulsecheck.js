/* PulseCheck — interactive Pixel workout prototype (Bazozo Studio). DOM built with textContent only. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const haptic = (p = 8) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- fit + clock ---------- */
  const stage = $('#stage');
  function fit() {
    const vw = document.documentElement.clientWidth, wide = vw > 1180;
    stage.style.setProperty('--s', Math.max(.55, Math.min(1, wide ? (window.innerHeight - 110) / 840 : 1, (vw - 32) / 396)).toFixed(3));
  }
  window.addEventListener('resize', fit); fit();
  const tick = () => { const d = new Date(); $('#clock').textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };
  tick(); setInterval(tick, 15000);
  $('#dateLbl').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  /* ---------- checklist + snackbar ---------- */
  const done = new Set();
  function check(k) { if (done.has(k)) return; done.add(k); const li = $(`#tryList [data-t="${k}"]`); if (li) li.classList.add('done'); $('#tryCount').textContent = `${done.size}/5`; $('#tryBar').style.width = (done.size * 20) + '%'; }
  const snack = $('#snack');
  function say(msg, strong) {
    snack.replaceChildren(el('span', null, msg)); if (strong) snack.append(el('b', null, strong));
    if (G) { G.killTweensOf(snack); G.fromTo(snack, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'back.out(1.6)' }); G.to(snack, { y: 20, opacity: 0, duration: .3, delay: 2.4 }); }
    else { snack.style.opacity = 1; setTimeout(() => { snack.style.opacity = 0; }, 2600); }
  }

  /* ---------- activity rings ---------- */
  const A = { move: 412, active: 28, steps: 6840 };
  const GOAL = { move: 620, active: 45, steps: 9000 };
  const RINGS = [['#r1', 74, 'move'], ['#r2', 55, 'active'], ['#r3', 36, 'steps']].map(([sel, r, k]) => {
    const c = 2 * Math.PI * r, n = $(sel); n.setAttribute('stroke-dasharray', c.toFixed(1)); n.setAttribute('stroke-dashoffset', c.toFixed(1)); return { n, c, k };
  });
  const shown = { move: 0, active: 0, steps: 0 };
  function paintRings(from0) {
    if (from0) { shown.move = shown.active = shown.steps = 0; }
    const draw = () => {
      RINGS.forEach(R => R.n.setAttribute('stroke-dashoffset', (R.c * (1 - Math.min(1, shown[R.k] / GOAL[R.k]))).toFixed(1)));
      $('#lv1').textContent = Math.round(shown.move); $('#lv2').textContent = Math.round(shown.active); $('#lv3').textContent = (shown.steps / 1000).toFixed(1) + 'k';
      const pct = (Math.min(1, shown.move / GOAL.move) + Math.min(1, shown.active / GOAL.active) + Math.min(1, shown.steps / GOAL.steps)) / 3;
      $('#ringPct').textContent = Math.round(pct * 100) + '%';
    };
    if (G) G.to(shown, { ...A, duration: 1.6, ease: 'expo.out', onUpdate: draw, overwrite: true });
    else { Object.assign(shown, A); draw(); }
  }
  const rings = $('#rings');
  const sync = () => {
    A.move += 18 + Math.round(Math.random() * 30); A.steps += 300 + Math.round(Math.random() * 600); A.active += 2;
    paintRings(true); haptic(12); check('rings'); say('Synced from Health Connect · ', '+' + 'activity');
    if (G) G.fromTo(rings, { scale: .92 }, { scale: 1, duration: .8, ease: 'elastic.out(1, .45)' });
  };
  rings.addEventListener('click', sync);
  rings.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sync(); } });

  /* ---------- live heart rate ---------- */
  const HR = { v: 72, target: 72, hist: Array.from({ length: 48 }, (_, i) => 70 + Math.sin(i / 4) * 3) };
  function drawSpark() {
    const min = 55, max = 160, pts = HR.hist.map((v, i) => [i / (HR.hist.length - 1) * 300, 58 - (v - min) / (max - min) * 54]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
    $('#sparkL').setAttribute('d', d); $('#sparkA').setAttribute('d', d + 'L300 60L0 60Z');
  }
  const ZONES = [[100, 'Zone 1 · Easy'], [125, 'Zone 2 · Fat burn'], [145, 'Zone 3 · Cardio'], [999, 'Zone 4 · Peak']];
  setInterval(() => {
    HR.target += (72 - HR.target) * .04; // drift back to resting after effort
    HR.v += (HR.target - HR.v) * .25 + (Math.random() - .5) * 2.4;
    HR.hist.push(HR.v); HR.hist.shift(); drawSpark();
    $('#bpm').textContent = Math.round(HR.v);
    $('#zone').textContent = ZONES.find(z => HR.v < z[0])[1];
    $('.heart').style.animationDuration = (60 / HR.v).toFixed(2) + 's';
  }, 700);
  drawSpark();

  /* ---------- rep logger + rest timer ---------- */
  const W = { w: 60, r: 8, set: 0, total: 4, log: [], volume: 0 };
  const setsEl = $('#sets');
  function paintSets() {
    setsEl.replaceChildren();
    for (let i = 0; i < W.total; i++) {
      const L = W.log[i];
      const s = el('div', 'set' + (L ? ' done' : i === W.set ? ' cur' : ''));
      s.append(document.createTextNode('Set ' + (i + 1)), el('b', null, L ? `${L.w}×${L.r}` : i === W.set ? 'now' : '—'));
      setsEl.append(s);
    }
    const btn = $('#logBtn');
    btn.disabled = W.set >= W.total;
    btn.textContent = W.set >= W.total ? 'Exercise complete ✓' : `Log set ${W.set + 1} · ${W.w} kg × ${W.r}`;
    $('#vol').textContent = W.volume.toLocaleString() + ' kg';
  }
  $$('.stepper button').forEach(b => b.addEventListener('click', () => {
    const d = +b.dataset.d;
    if (b.dataset.st === 'w') W.w = Math.max(20, Math.min(200, W.w + d)); else W.r = Math.max(1, Math.min(30, W.r + d));
    const v = b.dataset.st === 'w' ? $('#wVal') : $('#rVal');
    v.textContent = b.dataset.st === 'w' ? (W.w % 1 ? W.w.toFixed(1) : W.w) : W.r;
    if (G) G.fromTo(v, { y: d > 0 ? 10 : -10, opacity: .3 }, { y: 0, opacity: 1, duration: .45, ease: 'back.out(2.2)' });
    haptic(5); paintSets();
  }));
  // rest timer
  const T = { left: 0, total: 90, id: null };
  const C = 2 * Math.PI * 52;
  function paintTimer() {
    const m = Math.floor(T.left / 60), s = Math.ceil(T.left % 60) === 60 ? 0 : Math.ceil(T.left % 60);
    $('#tVal').textContent = `${m}:${String(s).padStart(2, '0')}`;
    $('#tArc').setAttribute('stroke-dashoffset', (C * (1 - T.left / T.total)).toFixed(1));
    $('#tLbl').textContent = T.id ? 'Resting' : 'Rest timer';
  }
  function startRest(sec) {
    clearInterval(T.id); T.total = sec; T.left = sec;
    const t0 = performance.now(), base = sec;
    T.id = setInterval(() => {
      T.left = Math.max(0, base + T.extra - (performance.now() - t0) / 1000);
      paintTimer();
      if (T.left <= 0) { stopRest(); haptic([20, 80, 20]); say('Rest over · ', W.set < W.total ? `set ${W.set + 1} is up` : 'nice session'); }
    }, 100);
    T.extra = 0; paintTimer();
  }
  function stopRest() { clearInterval(T.id); T.id = null; T.left = 0; paintTimer(); $('#tVal').textContent = '1:30'; $('#tArc').setAttribute('stroke-dashoffset', C.toFixed(1)); }
  $('#plus15').addEventListener('click', () => { if (!T.id) return; T.extra += 15; T.total += 15; haptic(); check('rest'); });
  $('#skipRest').addEventListener('click', () => { if (!T.id) return; stopRest(); haptic(10); check('rest'); say('Rest skipped · ', 'go when ready'); });
  $('#logBtn').addEventListener('click', () => {
    if (W.set >= W.total) return;
    W.log[W.set] = { w: W.w, r: W.r }; W.volume += W.w * W.r; W.set++;
    A.active += 4; A.move += 38; HR.target = 128 + Math.random() * 14; // effort shows up in rings and heart rate
    paintSets(); paintRings(false); haptic([10, 40, 14]); check('set');
    const doneSet = setsEl.children[W.set - 1];
    if (G) G.fromTo(doneSet, { scale: .8 }, { scale: 1, duration: .7, ease: 'elastic.out(1, .45)' });
    if (W.set < W.total) startRest(90); else { stopRest(); say('Bench press done · ', W.volume.toLocaleString() + ' kg moved'); }
  });
  paintSets(); paintTimer();

  /* ---------- weekly stats ---------- */
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const DATA = {
    hr: { unit: 'bpm', label: 'Average heart rate', v: [74, 81, 69, 88, 77, 92, 71], sub: i => [['Resting', 58 + (i % 3)], ['Max', [142, 165, 120, 171, 150, 178, 131][i]], ['HRV', [48, 41, 55, 39, 46, 37, 52][i] + ' ms']] },
    kcal: { unit: 'kcal', label: 'Calories burned', v: [2240, 2610, 2050, 2780, 2390, 2920, 2130], sub: i => [['Active', [520, 780, 410, 860, 610, 940, 450][i]], ['Workouts', [1, 1, 0, 2, 1, 2, 0][i]], ['Steps', [8.2, 11.4, 6.1, 12.9, 9.3, 14.2, 7.0][i] + 'k']] }
  };
  let metric = 'hr', day = (new Date().getDay() + 6) % 7;
  const weekEl = $('#week'), statN = $('#statN'), sn = { v: 0 };
  function paintStats(animate) {
    const D = DATA[metric], max = Math.max(...D.v), min = Math.min(...D.v) * .8;
    weekEl.replaceChildren();
    D.v.forEach((v, i) => {
      const b = el('button', 'day'); b.type = 'button'; b.setAttribute('aria-pressed', String(i === day)); b.setAttribute('aria-label', `${FULL[i]}: ${v} ${D.unit}`);
      const bar = el('i'); bar.style.height = ((v - min) / (max - min) * 78 + 8) + '%';
      b.append(bar, el('small', null, DAYS[i][0]));
      b.addEventListener('click', () => { day = i; haptic(6); check('day'); paintStats(false); });
      weekEl.append(b);
    });
    if (G && animate) G.from(weekEl.querySelectorAll('i'), { scaleY: 0, transformOrigin: 'bottom', duration: .7, stagger: .04, ease: 'back.out(1.5)' });
    $('#statLbl').textContent = `${D.label} · ${FULL[day]}`; $('#statU').textContent = D.unit;
    const to = D.v[day];
    if (G) G.to(sn, { v: to, duration: .6, ease: 'power3.out', onUpdate: () => { statN.textContent = Math.round(sn.v).toLocaleString(); } });
    else statN.textContent = to.toLocaleString();
    const sub = $('#subStats'); sub.replaceChildren();
    D.sub(day).forEach(([k, v]) => { const d = el('div'); d.append(el('small', null, k), el('b', null, String(v))); sub.append(d); });
    if (G) G.from(sub.children, { y: 8, opacity: 0, duration: .35, stagger: .04 });
  }
  $$('[data-m]').forEach(b => b.addEventListener('click', () => {
    metric = b.dataset.m; $$('[data-m]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); haptic(6);
    if (metric === 'kcal') check('metric');
    paintStats(true);
  }));

  /* ---------- navigation ---------- */
  const views = { today: $('#v-today'), workout: $('#v-workout'), stats: $('#v-stats') };
  const order = ['today', 'workout', 'stats'];
  let cur = 'today';
  const fab = $('#fab');
  function go(v) {
    if (v === cur) return;
    const dir = order.indexOf(v) > order.indexOf(cur) ? 1 : -1, from = views[cur], to = views[v];
    $$('.navbar button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === v)));
    to.hidden = false; to.scrollTop = 0;
    if (G) { G.fromTo(to, { x: 40 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: 'expo.out' }); G.to(from, { x: -30 * dir, opacity: 0, duration: .25, onComplete: () => { from.hidden = true; G.set(from, { x: 0, opacity: 1 }); } }); }
    else from.hidden = true;
    cur = v; haptic(5);
    fab.hidden = v !== 'today';
    if (v === 'stats') paintStats(true);
  }
  $$('.navbar button').forEach(b => b.addEventListener('click', () => go(b.dataset.v)));
  fab.addEventListener('click', () => { if (G) G.fromTo(fab, { scale: .9 }, { scale: 1, duration: .5, ease: 'elastic.out(1,.5)' }); go('workout'); });
  $$('[data-jump]').forEach(b => b.addEventListener('click', () => { if (document.documentElement.clientWidth <= 1180) stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); go(b.dataset.jump); }));
  $$('#v-today .chip').forEach(c => c.addEventListener('click', () => { $$('#v-today .chip').forEach(x => x.setAttribute('aria-pressed', String(x === c))); haptic(5); }));

  /* ---------- intro ---------- */
  if (G) {
    G.from('#device', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' });
    G.from('.side', { y: 30, opacity: 0, duration: 1, stagger: .15, ease: 'expo.out', delay: .2 });
    G.from('#v-today .card', { y: 30, opacity: 0, duration: .8, stagger: .08, ease: 'expo.out', delay: .4 });
    G.delayedCall(.7, () => paintRings(true));
  } else paintRings(true);
})();
