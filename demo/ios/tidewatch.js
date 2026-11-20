/* Tidewatch — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- Tidewatch ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const SPOTS = [
      { id: 'fistral', name: 'Fistral', face: 290, pref: .55, rise: 0, exp: 1, A: [1.65, .55, .32, .09, .07], P: [100, 140, 80, 210, 190], z: 3.0, wt: 13 },
      { id: 'croyde', name: 'Croyde', face: 275, pref: .35, rise: 1, exp: .9, A: [2.6, .9, .5, .1, .08], P: [120, 160, 95, 215, 200], z: 4.1, wt: 13 },
      { id: 'porth', name: 'Porthleven', face: 215, pref: .7, rise: 0, exp: 1.18, A: [1.75, .6, .34, .08, .06], P: [85, 125, 70, 200, 180], z: 3.1, wt: 14 } ];
    const SPD = [28.9841042, 30, 28.4397295, 15.0410686, 13.9430356].map(d => d * Math.PI / 180);
    const D0 = new Date(); D0.setHours(0, 0, 0, 0); const EPOCH = Date.UTC(2026, 0, 1), baseH = (D0.getTime() - EPOCH) / 36e5;
    let sp = SPOTS[0], day = 0, hour = Math.min(20, Math.max(5, new Date().getHours() + new Date().getMinutes() / 60)), alert = null, minStars = 4;
    const tide = (S, h) => { let v = S.z; for (let i = 0; i < 5; i++) v += S.A[i] * Math.cos(SPD[i] * (baseH + h) - S.P[i] * Math.PI / 180); return v; };
    const RC = new Map(), range = S => { if (RC.has(S)) return RC.get(S); let lo = Infinity, hi = -Infinity; for (let h = -24; h < 96; h += .5) { const v = tide(S, h); lo = Math.min(lo, v); hi = Math.max(hi, v); } RC.set(S, [lo, hi]); return [lo, hi]; };
    const extremes = (S, d) => { const out = []; for (let h = d * 24; h < d * 24 + 24; h += 1 / 12) { const a = tide(S, h - 1 / 12), b = tide(S, h), c = tide(S, h + 1 / 12); if ((b > a && b >= c) || (b < a && b <= c)) out.push([h - d * 24, b, b > a ? 'High' : 'Low']); } return out; };
    /* deterministic weather */
    const n1 = x => Math.sin(x * 1.7) * .5 + Math.sin(x * .63 + 1.3) * .35 + Math.sin(x * 3.1 + .2) * .15;
    const wx = h => { const t = baseH + h, hr = ((h % 24) + 24) % 24; const hs = Math.max(.4, 1.25 + .55 * n1(t / 30) + .12 * n1(t / 4)), per = 10.5 + 2.6 * n1(t / 40 + 3), sdir = 268 + 18 * n1(t / 36 + 7);
      const sea = Math.max(0, Math.sin((hr - 10) / 10 * Math.PI)); const wdir = (95 + 180 * sea + 25 * n1(t / 20)) % 360, wspd = Math.max(2, 6 + 10 * sea + 4 * n1(t / 12 + 5)); return { hs, per, sdir, wdir, wspd }; };
    const angDiff = (a, b) => { const d = ((a - b) % 360 + 540) % 360 - 180; return Math.abs(d); };
    function rate(S, h) { const w = wx(h), [lo, hi] = range(S), lvl = (tide(S, h) - lo) / (hi - lo), rising = tide(S, h + .1) > tide(S, h);
      const ang = Math.max(0, Math.cos(angDiff(w.sdir, S.face) * Math.PI / 180)), face = w.hs * 3.28 * 1.15 * (.55 + .045 * w.per) * S.exp * Math.sqrt(ang);
      const size = face < 1 ? face * .8 : face < 3 ? .8 + (face - 1) * .6 : face <= 6 ? 2 : Math.max(.8, 2 - (face - 6) * .3);
      const off = Math.cos(angDiff(w.wdir, (S.face + 180) % 360) * Math.PI / 180), wind = off > .3 ? 1.2 * Math.min(1, w.wspd / 12 + .4) : off > -.3 ? .5 - w.wspd / 40 : -.2 - w.wspd / 18;
      const td = 1.2 * Math.exp(-Math.pow((lvl - S.pref) / .22, 2)) + (S.rise && rising ? .25 : 0) + (lvl < .12 && S.id === 'porth' ? -.6 : 0);
      const stars = Math.max(0, Math.min(5, Math.round((size + wind + td) * 1.02 * 2) / 2)); return { stars, face, w, lvl, rising, off }; }
    const fmtH = h => { const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return String((hh + (mm === 60 ? 1 : 0)) % 24).padStart(2, '0') + ':' + String(mm === 60 ? 0 : mm).padStart(2, '0'); };
    const best = (S, d) => { let bh = -1, bs = -1; for (let h = 5; h <= 19; h += .5) { const s2 = (rate(S, d * 24 + h).stars + rate(S, d * 24 + h + 1).stars + rate(S, d * 24 + h + 2).stars) / 3; if (s2 > bs) { bs = s2; bh = h; } } return [bh, bs]; };
    const ftRange = f => { const a = Math.max(0, Math.floor(f)), b = Math.max(a + 1, Math.round(f + .6)); return f < .8 ? 'Flat' : a + '–' + b; };
    const compassTxt = d => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(d / 45) % 8];
    /* ---- UI ---- */
    const root = el('div', 'tw'), V = el('div', 'tw-v'); root.append(V); app.append(root);
    const spr = el('div', 'tw-sp'); SPOTS.forEach(S => { const b = el('button'); b.type = 'button'; b.dataset.s = S.id; b.append(S.name, el('small', null, compassTxt(S.face))); b.addEventListener('click', () => { if (S === sp) return; sp = S; check('spot'); tone(520, .04); haptic(5); paint(); }); spr.append(b); });
    const hero = el('div', 'tw-hero'), hS = el('small'), hB = el('b'), hSt = el('div', 'tw-st'), hP = el('p'), days = el('div', 'tw-days');
    const wave = (c, a) => { const sv = svgEl('svg', { viewBox: '0 0 800 70', preserveAspectRatio: 'none', 'aria-hidden': 'true' }); let d = 'M0 40'; for (let x = 0; x <= 800; x += 50) d += ' Q' + (x + 25) + ' ' + (40 - a) + ' ' + (x + 50) + ' 40'; sv.append(svgEl('path', { d: d + ' V70 H0 Z', fill: c })); return sv; };
    [['Today', 0], ['Tmrw', 1], ['+2', 2]].forEach(([l, d]) => { const b = el('button', null, l); b.type = 'button'; b.dataset.d = d; b.addEventListener('click', () => { day = d; if (d > 0) check('day'); paint(); tone(600 + d * 100, .03); }); days.append(b); });
    hero.append(wave('rgba(255,255,255,.12)', 14), wave('rgba(255,255,255,.18)', 9), hS, hB, hSt, hP, days);
    const tc = el('section', 'tw-card'), tH = el('h3'), tW = el('div', 'tw-tide'), TWD = 340, THT = 130, tsv = svgEl('svg', { viewBox: '0 0 ' + TWD + ' ' + THT, role: 'img' }), rd = el('div', 'tw-rd'), rL = el('span'), rR = el('span'); tW.tabIndex = 0; tW.setAttribute('role', 'slider'); tW.setAttribute('aria-label', 'Time of day on the tide curve'); tW.append(tsv); rd.append(rL, rR); tc.append(tH, tW, rd);
    const cc = el('section', 'tw-card'), row = el('div', 'tw-row'), cmp = el('div', 'tw-cmp'), kv = el('div', 'tw-kv'); row.append(cmp, kv); cc.append(el('h3', null, 'Swell & wind'), row);
    const hc = el('section', 'tw-card'), hr = el('div', 'tw-hr'); hc.append(el('h3', null, 'Through the day'), hr);
    const act = el('div', 'tw-act'), bb = el('button', 'tw-bst', 'Best window'), ab = el('button', 'tw-al', '🔔 Alert me'); bb.type = ab.type = 'button'; act.append(bb, ab);
    V.append(spr, hero, tc, act, cc, hc);
    let showBest = false;
    /* tide chart */
    const PX = h => 8 + h / 24 * (TWD - 16);
    function paintTide() { tsv.textContent = ''; const [lo, hi] = range(sp), PY = v => THT - 22 - (v - lo) / (hi - lo) * (THT - 44), base = day * 24;
      if (showBest) { const [bh] = best(sp, day); tsv.append(svgEl('rect', { x: PX(bh), y: 4, width: PX(bh + 2) - PX(bh), height: THT - 26, rx: 8, fill: '#F2A541', opacity: .22 })); const t = svgEl('text', { x: PX(bh) + 4, y: 14 }); t.textContent = 'BEST'; t.setAttribute('fill', '#B26F12'); tsv.append(t); }
      const prefV = lo + sp.pref * (hi - lo); tsv.append(svgEl('line', { x1: 8, x2: TWD - 8, y1: PY(prefV), y2: PY(prefV), stroke: '#0A84A0', 'stroke-dasharray': '2 4', opacity: .35 }));
      let d = ''; for (let h = 0; h <= 24; h += .25) d += (h ? ' L' : 'M') + PX(h).toFixed(1) + ' ' + PY(tide(sp, base + h)).toFixed(1); tsv.append(svgEl('path', { d: d + ' L' + PX(24) + ' ' + (THT - 18) + ' L' + PX(0) + ' ' + (THT - 18) + ' Z', fill: '#0A84A0', opacity: .12 }), svgEl('path', { d, fill: 'none', stroke: '#0A84A0', 'stroke-width': 2.5 }));
      extremes(sp, day).forEach(([h, v, k]) => { const x = PX(h), y = PY(v); tsv.append(svgEl('circle', { cx: x, cy: y, r: 3, fill: '#0B2A33' })); const t = svgEl('text', { x: Math.min(TWD - 66, Math.max(2, x - 20)), y: k === 'High' ? y - 7 : y + 13 }); t.textContent = k[0] + ' ' + fmtH(h) + ' ' + v.toFixed(1) + 'm'; tsv.append(t); });
      [0, 6, 12, 18, 24].forEach(h => { const t = svgEl('text', { x: PX(h) - (h === 24 ? 14 : h ? 7 : 0), y: THT - 4 }); t.textContent = String(h % 24).padStart(2, '0'); tsv.append(t); });
      const cx = PX(hour), cy = PY(tide(sp, base + hour)); tsv.append(svgEl('line', { x1: cx, x2: cx, y1: 4, y2: THT - 18, stroke: '#0B2A33', 'stroke-width': 1.5 }), svgEl('circle', { cx, cy, r: 7, fill: '#fff', stroke: '#0B2A33', 'stroke-width': 2.5 }));
      const v = tide(sp, base + hour), rate2 = (tide(sp, base + hour + .5) - tide(sp, base + hour - .5)); rL.textContent = ''; rL.append(el('b', null, v.toFixed(2) + ' m'), document.createTextNode('  at ' + fmtH(hour))); rR.textContent = (rate2 >= 0 ? '↑ rising ' : '↓ falling ') + Math.abs(rate2).toFixed(2) + ' m/h';
      tH.textContent = ''; tH.append(document.createTextNode('Tide'), el('span', null, 'best at ' + Math.round(sp.pref * 100) + '% ' + (sp.rise ? 'rising' : 'tide'))); tW.setAttribute('aria-valuetext', fmtH(hour) + ', ' + v.toFixed(2) + ' metres, ' + (rate2 >= 0 ? 'rising' : 'falling')); }
    const setHour = (h, user) => { hour = Math.max(0, Math.min(23.75, Math.round(h * 4) / 4)); if (user) check('scrub'); paintNow(); };
    let drag = false; const hx = e => { const r = tsv.getBoundingClientRect(); return ((e.clientX - r.left) / r.width * TWD - 8) / (TWD - 16) * 24; };
    tW.addEventListener('pointerdown', e => { drag = true; try { tW.setPointerCapture(e.pointerId); } catch (x) {} setHour(hx(e), true); }); tW.addEventListener('pointermove', e => { if (drag) { const was = Math.round(hour); setHour(hx(e), true); if (Math.round(hour) !== was) tone(1000, .006, 'square', .01); } });
    ['pointerup', 'pointercancel'].forEach(t => tW.addEventListener(t, () => { drag = false; })); tW.addEventListener('keydown', e => { const d = { ArrowRight: .25, ArrowLeft: -.25, ArrowUp: 1, ArrowDown: -1 }[e.key]; if (d) { e.preventDefault(); setHour(hour + d, true); } });
    /* compass + hero for the selected hour */
    function paintNow() { const r = rate(sp, day * 24 + hour), w = r.w; hS.textContent = sp.name + ' · ' + (day === 0 ? 'Today' : day === 1 ? 'Tomorrow' : 'In 2 days') + ' ' + fmtH(hour); hB.textContent = ftRange(r.face); hB.append(el('em', null, r.face < .8 ? '' : ' ft'));
      hSt.textContent = ''; for (let i = 1; i <= 5; i++) hSt.append(el('i', i <= r.stars ? 'on' : i - .5 === r.stars ? 'hf' : null, '★')); hSt.setAttribute('aria-label', r.stars + ' out of 5 stars');
      hP.textContent = (r.off > .3 ? 'Clean, offshore ' + compassTxt(w.wdir) + ' wind. ' : r.off > -.3 ? 'Cross-shore wind. ' : 'Onshore and choppy. ') + (r.lvl > .8 ? 'Very high tide, may be full.' : r.lvl < .15 ? 'Low tide, watch the rocks.' : (r.rising ? 'Pushing tide.' : 'Dropping tide.'));
      cmp.textContent = ''; const sv = svgEl('svg', { viewBox: '0 0 132 132', role: 'img', 'aria-label': 'Compass: beach faces ' + compassTxt(sp.face) + ', swell from ' + compassTxt(w.sdir) + ', wind from ' + compassTxt(w.wdir) }), C = 66, P = (deg, r2) => [C + Math.sin(deg * Math.PI / 180) * r2, C - Math.cos(deg * Math.PI / 180) * r2];
      sv.append(svgEl('circle', { cx: C, cy: C, r: 58, fill: '#F3F8F8' }), svgEl('circle', { cx: C, cy: C, r: 58, fill: 'none', stroke: '#D7E3E5' })); [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(([l, a]) => { const [x, y] = P(a, 48); const t = svgEl('text', { x: x - 3, y: y + 3 }); t.textContent = l; sv.append(t); });
      const [ox1, oy1] = P((sp.face + 180 - 40) % 360, 58), [ox2, oy2] = P((sp.face + 180 + 40) % 360, 58); sv.append(svgEl('path', { d: 'M' + C + ' ' + C + ' L' + ox1.toFixed(1) + ' ' + oy1.toFixed(1) + ' A58 58 0 0 1 ' + ox2.toFixed(1) + ' ' + oy2.toFixed(1) + ' Z', fill: '#0A8F62', opacity: .12 }));
      const [bx1, by1] = P(sp.face - 90, 30), [bx2, by2] = P(sp.face + 90, 30); sv.append(svgEl('line', { x1: bx1, y1: by1, x2: bx2, y2: by2, stroke: '#E8C88A', 'stroke-width': 6, 'stroke-linecap': 'round' }));
      const arrow = (deg, len, c, wd) => { const [x1, y1] = P(deg, len), [x2, y2] = P(deg, 10), a = Math.atan2(y2 - y1, x2 - x1); sv.append(svgEl('path', { d: 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' M' + (x2 - 8 * Math.cos(a - .5)).toFixed(1) + ' ' + (y2 - 8 * Math.sin(a - .5)).toFixed(1) + ' L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' L' + (x2 - 8 * Math.cos(a + .5)).toFixed(1) + ' ' + (y2 - 8 * Math.sin(a + .5)).toFixed(1), stroke: c, 'stroke-width': wd, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })); };
      arrow(w.sdir, 56, '#0A84A0', 4); arrow(w.wdir, 44, r.off > .3 ? '#0A8F62' : r.off > -.3 ? '#8A9AA0' : '#D2553B', 2.5); cmp.append(sv);
      kv.textContent = ''; const add = (k, v, cls) => { const d = el('div'); d.append(el('span', null, k), el('b', cls, v)); kv.append(d); }; add('Swell', w.hs.toFixed(1) + ' m · ' + Math.round(w.per) + ' s'); add('From', compassTxt(w.sdir) + ' ' + Math.round(w.sdir) + '°'); add('Wind', Math.round(w.wspd) + ' kt ' + compassTxt(w.wdir), r.off > .3 ? 'good' : r.off < -.3 ? 'bad' : null); add('Water', sp.wt + '°C · 4/3 mm');
      hr.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(Math.abs(+b.dataset.h - hour) < 1.5))); paintTide(); }
    function paintHours() { hr.textContent = ''; [6, 9, 12, 15, 18, 21].forEach(h => { const r = rate(sp, day * 24 + h), b = el('button'), bar = el('i'); b.type = 'button'; b.dataset.h = h; bar.style.setProperty('--c', r.stars >= 4 ? '#0A8F62' : r.stars >= 2.5 ? '#F2A541' : '#D2553B'); b.append(el('small', null, String(h).padStart(2, '0')), el('b', null, ftRange(r.face)), bar); b.setAttribute('aria-label', h + ':00, ' + ftRange(r.face) + ' feet, ' + r.stars + ' stars'); b.addEventListener('click', () => setHour(h, true)); hr.append(b); }); }
    function paint() { spr.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.s === sp.id))); days.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.d === day))); paintHours(); paintNow(); }
    function findBest() { const [bh, bs] = best(sp, day); showBest = true; check('best'); setHour(bh + 1); say('Best at ' + sp.name + ': ' + fmtH(bh) + '–' + fmtH(bh + 2) + ', about ' + bs.toFixed(1) + ' stars'); tone(660, .05); setTimeout(() => tone(990, .07), 90); haptic(10); V.scrollTo({ top: tc.offsetTop - 60, behavior: reduced ? 'auto' : 'smooth' }); }
    bb.addEventListener('click', findBest);
    /* alerts */
    let sh = null; function nextMatch(min) { for (let d = 0; d < 3; d++) for (const S of SPOTS) { for (let h = (d === 0 ? Math.ceil(new Date().getHours()) : 5); h <= 19; h++) { if (rate(S, d * 24 + h).stars >= min) return [S, d, h]; } } return null; }
    function openAlert() { if (sh) return; sh = el('div', 'tw-sh'); sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-label', 'Surf alert'); const seg = el('div', 'tw-seg'), nx = el('div', 'tw-nx'), sv = el('button', 'tw-sv', 'Save alert'), cl = el('button', 'grab'); sv.type = cl.type = 'button'; cl.setAttribute('aria-label', 'Close');
      const pn = () => { const m = nextMatch(minStars); nx.textContent = ''; if (m) { const [S, d, h] = m; nx.append(document.createTextNode('Next match: ' + S.name + ', ' + (d === 0 ? 'today' : d === 1 ? 'tomorrow' : 'in 2 days') + ' ' + fmtH(h)), el('small', null, rate(S, d * 24 + h).stars + ' stars · ' + ftRange(rate(S, d * 24 + h).face) + ' ft · scanned 3 days, 3 spots')); } else { nx.append(document.createTextNode('Nothing that good in the next 3 days'), el('small', null, 'We will still watch and tell you')); } seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.m === minStars))); };
      [3, 4, 4.5].forEach(m => { const b = el('button', null, m + '★+'); b.type = 'button'; b.dataset.m = m; b.addEventListener('click', () => { minStars = m; pn(); }); seg.append(b); }); pn();
      sv.addEventListener('click', () => { alert = minStars; ab.textContent = '🔔 ' + minStars + '★ alert on'; ab.classList.add('on'); check('alert'); tone(880, .05); setTimeout(() => tone(1320, .08), 90); haptic(12); say('We will ping you when any spot hits ' + minStars + ' stars'); closeAlert(); });
      cl.addEventListener('click', closeAlert); sh.append(cl, el('h3', null, 'Surf alert'), el('p', null, 'Notify me when any of my spots reaches'), seg, nx, sv); root.append(sh); if (G && !reduced) G.from(sh, { yPercent: 100, duration: .4, ease: 'expo.out' }); }
    function closeAlert() { if (!sh) return; const s2 = sh; sh = null; s2.style.pointerEvents = 'none'; if (G && !reduced) G.to(s2, { yPercent: 100, duration: .25 }); setTimeout(() => s2.remove(), 260); }
    ab.addEventListener('click', openAlert);
    H.jump = (k, fs) => { if (k === 'today') { closeAlert(); V.scrollTo({ top: 0, behavior: 'smooth' }); } else if (k === 'best') { closeAlert(); if (!fs) findBest(); } else if (k === 'alert') { if (!fs) openAlert(); } };
    paint();
  }
  demo(H.app, H);
  H.boot();
})();
