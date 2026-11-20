/* QuietAlarm — Android app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- QuietAlarm ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const M = {"key":"qa_state_v1"};
    const saved = store.get(M.key, null) || {};
    const S = { win: [15, 30, 45].includes(saved.win) ? saved.win : 30, snd: ['birds', 'chimes', 'waves'].includes(saved.snd) ? saved.snd : 'birds' };
    const save = () => store.set(M.key, S);
    const END = 7 * 60, BED = 23 * 60, SPAN = 8 * 60; let night = null, firedAt = null;
    const hm = mins => { mins = ((Math.round(mins) % 1440) + 1440) % 1440; return String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0'); };

    /* ---- audio: three synthesized wake sounds with a slow volume ramp ---- */
    let ctx = null, master = null, loopT = 0;
    function audio() { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; } catch (_) { return null; } }
    function voice(kind, out) { const c = ctx, t = c.currentTime;
      if (kind === 'birds') { for (let i = 0; i < 3; i++) { const o = c.createOscillator(), g = c.createGain(), st = t + i * .18 + Math.random() * .1, f = 2200 + Math.random() * 1600; o.frequency.setValueAtTime(f, st); o.frequency.exponentialRampToValueAtTime(f * 1.5, st + .08); o.frequency.exponentialRampToValueAtTime(f * .9, st + .14); g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(.4, st + .02); g.gain.exponentialRampToValueAtTime(.001, st + .16); o.connect(g); g.connect(out); o.start(st); o.stop(st + .2); } }
      else if (kind === 'chimes') { const n = [523, 587, 659, 784, 880][Math.floor(Math.random() * 5)]; [1, 2.76, 5.4].forEach((h, i) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = n * h; g.gain.setValueAtTime(.35 / (i + 1), t); g.gain.exponentialRampToValueAtTime(.001, t + 2.4 / (i + 1)); o.connect(g); g.connect(out); o.start(t); o.stop(t + 2.5); }); }
      else { const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const n = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); n.buffer = b; f.type = 'lowpass'; f.frequency.value = 600; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5, t + .9); g.gain.linearRampToValueAtTime(0, t + 2); n.connect(f); f.connect(g); g.connect(out); n.start(t); } }
    function startSound(ramp) { if (!audio()) return; stopSound(); master = ctx.createGain(); master.gain.setValueAtTime(.0001, ctx.currentTime); master.gain.exponentialRampToValueAtTime(.12, ctx.currentTime + ramp); master.connect(ctx.destination); const out = master; const tick = () => { voice(S.snd, out); loopT = setTimeout(tick, S.snd === 'waves' ? 1900 : S.snd === 'chimes' ? 1300 : 900); }; tick(); }
    function stopSound() { clearTimeout(loopT); if (master && ctx) { const g = master; g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setTargetAtTime(0, ctx.currentTime, .15); setTimeout(() => g.disconnect(), 800); master = null; } }

    /* ---- shell ---- */
    const root = el('div', 'qa'); root.append(el('div', 'qa-stars')); const V = {}; ['alarm', 'night', 'week'].forEach(k => { V[k] = el('section', 'qa-v'); V[k].setAttribute('aria-label', k); if (k !== 'alarm') V[k].hidden = true; root.append(V[k]); });
    const nav = el('nav', 'qa-nav'); [['alarm', 'Alarm'], ['night', 'Last night'], ['week', 'Week']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(nav); app.append(root); let cur = 'alarm';
    function go(k) { if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k))); if (k === 'night') renderNight(); if (k === 'week') { renderWeek(); check('history'); }
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0 }, { opacity: 1, duration: .35 }); G.to(a, { opacity: 0, duration: .12, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; }
    H.jump = go;

    /* ---- alarm view ---- */
    const big = el('div', 'qa-big'), bt = el('b'), bs = el('small'); big.append(el('small', null, 'WAKE BY'), bt, bs);
    const win = el('div', 'qa-win'), band = el('i', 'band'), l1 = el('span'), l2 = el('span'); win.append(el('i', 'tl'), band, l1, l2); win.setAttribute('aria-hidden', 'true');
    const seg = el('div', 'qa-seg'); [15, 30, 45].forEach(w => { const b = el('button', null, w + ' min'); b.type = 'button'; b.dataset.w = w; b.addEventListener('click', () => { S.win = w; save(); paint(); check('window'); tone(500 + w * 6, .05); }); seg.append(b); });
    const snd = el('div', 'qa-snd'); [['birds', '🐦', 'Birds'], ['chimes', '🔔', 'Chimes'], ['waves', '🌊', 'Waves']].forEach(([k, ic, t]) => { const b = el('button'); b.type = 'button'; b.dataset.k = k; b.append(el('span', null, ic), document.createTextNode(t)); b.setAttribute('aria-label', 'Preview ' + t);
      b.addEventListener('click', () => { S.snd = k; save(); paint(); check('sound'); b.classList.add('play'); startSound(.4); setTimeout(() => { stopSound(); b.classList.remove('play'); }, 2600); }); snd.append(b); });
    const goB = el('button', 'qa-go', '☾ Fast-forward tonight'); goB.type = 'button';
    V.alarm.append(big, win, el('p', 'qa-lbl', 'Wake window'), seg, el('p', 'qa-lbl', 'Wake sound'), snd, goB);
    function paint() { const st = END - S.win; bt.textContent = hm(END); bs.textContent = 'gently, between ' + hm(st) + ' and ' + hm(END); const L = 360; band.style.left = ((st - (END - 60)) / 60 * 100) + '%'; band.style.width = (S.win / 60 * 100) + '%'; l1.style.left = band.style.left; l1.textContent = hm(st); l2.style.left = '100%'; l2.textContent = hm(END);
      seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.w === S.win))); snd.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.snd))); }

    /* ---- the night: 90-minute cycles, fires in light sleep inside the window ---- */
    function makeNight() { const pts = []; let t = 0; pts.push([0, 0]); t = 12; pts.push([t, 2]); let c = 0;
      while (t < SPAN) { const deep = Math.max(10, 50 - c * 14), rem = 12 + c * 7; [[2, 18], [3, deep], [2, 14], [1, rem]].forEach(([lvl, d]) => { t += d * (.85 + Math.random() * .3); pts.push([Math.min(SPAN, t), lvl]); }); c++; if (c === 2 && Math.random() < .7) { t += 3; pts.push([t, 0]); t += 4; pts.push([t, 2]); } }
      return pts.filter(p => p[0] <= SPAN); }
    const stageAt = (pts, mm) => { let s0 = 0; pts.forEach(p => { if (p[0] <= mm) s0 = p[1]; }); return s0; };
    goB.addEventListener('click', () => { night = makeNight(); firedAt = null; check('simulate'); go('night'); goB.disabled = true; audio(); renderNight(true); });
    let hypRaf = 0;
    function renderNight(animate) {
      const v = V.night; v.textContent = ''; if (!night) { night = makeNight(); firedAt = END - Math.floor(S.win / 2); }
      const h = el('div', 'qa-big'); h.append(el('small', null, 'LAST NIGHT'), el('b', null, firedAt ? hm(firedAt) : '··:··')); h.querySelector('b').style.fontSize = '48px'; v.append(h);
      const box = el('div', 'qa-hyp'), W = 320, Hh = 150, sv = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + Hh, role: 'img', 'aria-label': 'Sleep stages from 23:00 to 07:00' }), x = mm => 34 + mm / SPAN * (W - 44), y = l => 18 + l * 34;
      const defs = svgEl('defs'), gr = svgEl('linearGradient', { id: 'qaG', x1: 0, y1: 0, x2: 0, y2: 1 }); [['0', '#E8892F'], ['.45', '#9AA0F5'], ['1', '#3B44C4']].forEach(([o, c]) => gr.append(svgEl('stop', { offset: o, 'stop-color': c }))); defs.append(gr); sv.append(defs);
      ['Awake', 'REM', 'Light', 'Deep'].forEach((t, i) => { const tx = svgEl('text', { x: 2, y: y(i) + 3 }); tx.textContent = t; sv.append(tx, svgEl('line', { x1: 34, x2: W - 10, y1: y(i), y2: y(i), stroke: '#1F275A' })); });
      const ws = END - S.win - BED + 1440, we = SPAN; sv.append(svgEl('rect', { x: x(ws), y: 8, width: x(we) - x(ws), height: Hh - 30, rx: 6, fill: 'rgba(232,137,47,.14)' }));
      [0, 2, 4, 6, 8].forEach(hh => { const tx = svgEl('text', { x: x(hh * 60) - 12, y: Hh - 4 }); tx.textContent = hm(BED + hh * 60); sv.append(tx); });
      const lvl = [0, 1, 2, 3], path = svgEl('path', { class: 'ln' }); sv.append(path); const mark = svgEl('circle', { r: 6, fill: '#FFC86B', opacity: 0 }); sv.append(mark);
      const dOf = upto => { let d = '', last = night[0]; night.forEach((p, i) => { if (p[0] > upto) return; d += (i ? ' H' + x(p[0]).toFixed(1) + ' V' + y(lvl[p[1]]).toFixed(1) : 'M' + x(p[0]).toFixed(1) + ' ' + y(lvl[p[1]]).toFixed(1)); last = p; }); return d + ' H' + x(Math.min(upto, SPAN)).toFixed(1); };
      box.append(sv); v.append(box); const st = el('div', 'qa-st'); v.append(st);
      const stats = upto => { st.textContent = ''; let deep = 0, rem = 0; for (let i = 1; i < night.length; i++) { const d = Math.min(night[i][0], upto) - Math.min(night[i - 1][0], upto); if (night[i - 1][1] === 3) deep += d; if (night[i - 1][1] === 1) rem += d; }
        [[Math.floor(upto / 60) + 'h ' + Math.round(upto % 60) + 'm', 'asleep'], [Math.round(deep / Math.max(1, upto) * 100) + '%', 'deep'], [Math.round(rem / Math.max(1, upto) * 100) + '%', 'REM']].forEach(([b, t]) => { const d = el('div'); d.append(el('b', null, b), el('span', null, t)); st.append(d); }); };
      if (!animate || reduced) { const upto = firedAt ? firedAt - BED + 1440 : SPAN; path.setAttribute('d', dOf(upto)); stats(upto); if (firedAt) { mark.setAttribute('cx', x(upto)); mark.setAttribute('cy', y(2)); mark.setAttribute('opacity', 1); } return; }
      const t0 = performance.now(), dur = 6000; clearInterval(hypRaf);
      const step = () => { const f = Math.max(0, Math.min(1, (performance.now() - t0) / dur)), upto = f * SPAN; path.setAttribute('d', dOf(upto)); stats(upto); h.querySelector('b').textContent = hm(BED + upto);
        if (upto >= ws && stageAt(night, upto) === 2 || upto >= SPAN - 1) { firedAt = (BED + Math.round(upto)) % 1440; h.querySelector('b').textContent = hm(firedAt); mark.setAttribute('cx', x(upto)); mark.setAttribute('cy', y(stageAt(night, upto))); mark.setAttribute('opacity', 1); clearInterval(hypRaf); wake(); } };
      hypRaf = setInterval(step, 40);
    }

    /* ---- the sunrise wake screen ---- */
    function wake() {
      const w = el('div', 'qa-wake'), sun = el('div', 'qa-sun'), t = el('div', 't'), sl = el('div', 'qa-slide', 'SLIDE TO WAKE'), th = el('button', 'qa-thumb', '☀'), snz = el('button', 'qa-snz', 'Snooze 5 min, gently'); th.type = snz.type = 'button';
      w.setAttribute('role', 'alertdialog'); w.setAttribute('aria-label', 'Alarm'); th.setAttribute('aria-label', 'Slide to wake. Press Enter to dismiss.');
      t.append(el('small', null, 'GOOD MORNING'), el('b', null, hm(firedAt)), el('span', null, 'Woken in light sleep · ' + (END - firedAt) + ' min before your latest time')); sl.append(th); w.append(sun, t, sl, snz); root.append(w);
      const sky = { p: 0 }, mixc = (a, b, k) => { const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16)); return 'rgb(' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',') + ')'; };
      const paintSky = () => { w.style.setProperty('--s1', mixc('0B1026', 'FFB46B', sky.p)); w.style.setProperty('--s2', mixc('1A2150', 'FFE7B8', sky.p)); sun.style.top = (420 - sky.p * 300) + 'px'; t.style.color = sky.p > .5 ? '#2A1A10' : '#E9EBF7'; };
      paintSky(); if (G && !reduced) G.to(sky, { p: 1, duration: 7, ease: 'sine.inOut', onUpdate: paintSky }); else { sky.p = 1; paintSky(); }
      startSound(8); haptic([60, 120, 60]);
      const done = () => { stopSound(); check('dismiss'); tone(880, .1); say('Good morning · sleep score ' + (78 + Math.floor(Math.random() * 15))); if (G) G.to(w, { opacity: 0, duration: .5, onComplete: () => w.remove() }); else w.remove(); goB.disabled = false; renderNight(false); };
      let x0 = 0, dragging = false; const maxX = () => sl.clientWidth - 60;
      th.addEventListener('pointerdown', e => { dragging = true; x0 = e.clientX; try { th.setPointerCapture(e.pointerId); } catch (_) {} });
      th.addEventListener('pointermove', e => { if (!dragging) return; const dx = Math.max(0, Math.min(maxX(), e.clientX - x0)); th.style.transform = 'translateX(' + dx + 'px)'; if (dx >= maxX() * .9) { dragging = false; done(); } });
      th.addEventListener('pointerup', () => { if (!dragging) return; dragging = false; if (G) G.to(th, { x: 0, duration: .4, ease: 'back.out(2)', onComplete: () => { th.style.transform = ''; } }); else th.style.transform = ''; });
      th.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); done(); } });
      snz.addEventListener('click', () => { stopSound(); say('Snoozed. The sunrise will come back in 5 minutes'); w.remove(); goB.disabled = false; renderNight(false); });
      setTimeout(() => th.focus(), 300);
    }

    /* ---- week ---- */
    const wkData = [['Mon', 82, '7h 10m'], ['Tue', 74, '6h 25m'], ['Wed', 88, '7h 40m'], ['Thu', 69, '6h 05m'], ['Fri', 77, '6h 50m'], ['Sat', 91, '8h 15m'], ['Sun', 85, '7h 30m']]; let wsel = 6;
    function renderWeek() { const v = V.week; v.textContent = ''; const h = el('div', 'qa-big'); h.append(el('small', null, 'THIS WEEK'), el('b', null, Math.round(wkData.reduce((a, d) => a + d[1], 0) / 7))); h.querySelector('b').style.fontSize = '56px'; v.append(h, el('p', 'qa-lbl', 'Sleep score by night'));
      const wk = el('div', 'qa-wk'), det = el('div', 'qa-wd'); wkData.forEach(([d, sc, hrs], i) => { const b = el('button'), bar = el('i'); b.type = 'button'; b.setAttribute('aria-pressed', String(i === wsel)); b.setAttribute('aria-label', d + ', score ' + sc + ', ' + hrs); bar.style.height = ((sc - 50) / 50 * 100) + '%'; b.append(bar, el('span', null, d));
        b.addEventListener('click', () => { wsel = i; renderWeek(); }); wk.append(b); });
      const [d, sc, hrs] = wkData[wsel]; det.append(el('b', null, d + ': ' + sc + ' · ' + hrs), document.createTextNode(sc > 85 ? '. Long deep sleep early in the night.' : sc < 75 ? '. Short night with two wake-ups.' : '. A steady night.')); v.append(wk, det); }

    nav.querySelector('[data-v="alarm"]').setAttribute('aria-selected', 'true'); paint();
  }
  demo(H.app, H);
  H.boot();
})();
