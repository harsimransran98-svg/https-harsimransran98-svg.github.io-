/* Petframe — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- Petframe ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const today = new Date(); today.setHours(12, 0, 0, 0); const D = 864e5, fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const PETS = [
      { id: 'miso', name: 'Miso', kind: 'dog', breed: 'Shiba Inu', age: '3 yrs', c: '#E0874A', band: [8, 11], w: [9.1, 9.3, 9.2, 9.6, 9.8, 10.1, 10.0, 10.3], vac: [['Rabies', 365, 340], ['DHPP', 365, 410], ['Leptospirosis', 365, 120], ['Kennel cough', 180, 150]], med: ['Heartworm chew', 1, 'with breakfast'], visits: [] },
      { id: 'pickle', name: 'Pickle', kind: 'cat', breed: 'Tabby, indoor', age: '6 yrs', c: '#6C7FD8', band: [3.6, 5.4], w: [5.0, 5.1, 5.3, 5.4, 5.6, 5.7, 5.6, 5.8], vac: [['FVRCP', 365, 200], ['Rabies', 1095, 1000], ['FeLV', 365, 30]], med: ['Thyroid tablet', 2, 'morning and evening'], visits: [[6, '10:30', 'Dental']] },
      { id: 'bun', name: 'Bun', kind: 'rabbit', breed: 'Holland Lop', age: '1 yr', c: '#3BA57E', band: [1.6, 2.4], w: [1.5, 1.6, 1.7, 1.8, 1.8, 1.9, 2.0, 2.0], vac: [['RHDV2', 365, 380], ['Myxomatosis', 365, 380]], med: ['Probiotic paste', 1, 'evening'], visits: [] },
    ];
    PETS.forEach(p => { p.given = 0; p.wNew = p.w[p.w.length - 1]; });
    let P = PETS[0];
    /* ---- portraits ---- */
    function face(p, sm) { const sv = svgEl('svg', { viewBox: '0 0 100 100', 'aria-hidden': 'true' }), g = svgEl('g'), fur = p.c, lt = '#FFF4E8', ink = '#2A211C'; sv.append(g); const A = (t, a) => { const n = svgEl(t, a); g.append(n); return n; };
      if (p.kind === 'dog') { A('path', { d: 'M22 40 L30 12 L46 32 Z', fill: fur }); A('path', { d: 'M78 40 L70 12 L54 32 Z', fill: fur }); A('path', { d: 'M28 34 L32 20 L40 30 Z', fill: '#F6C9A8' }); A('path', { d: 'M72 34 L68 20 L60 30 Z', fill: '#F6C9A8' }); A('ellipse', { cx: 50, cy: 56, rx: 32, ry: 28, fill: fur }); A('ellipse', { cx: 50, cy: 68, rx: 20, ry: 15, fill: lt }); A('ellipse', { cx: 37, cy: 46, rx: 6, ry: 4, fill: lt }); A('ellipse', { cx: 63, cy: 46, rx: 6, ry: 4, fill: lt }); }
      else if (p.kind === 'cat') { A('path', { d: 'M20 46 L24 14 L44 32 Z', fill: fur }); A('path', { d: 'M80 46 L76 14 L56 32 Z', fill: fur }); A('ellipse', { cx: 50, cy: 58, rx: 32, ry: 27, fill: fur }); [[40, 34], [50, 32], [60, 34]].forEach(([x, y]) => A('path', { d: 'M' + x + ' ' + (y - 2) + ' l0 9', stroke: 'rgba(0,0,0,.18)', 'stroke-width': 3, 'stroke-linecap': 'round' })); A('ellipse', { cx: 50, cy: 70, rx: 15, ry: 10, fill: lt });
        [[-1, 64], [-1, 70], [1, 64], [1, 70]].forEach(([sd, y]) => A('path', { d: 'M' + (50 + sd * 16) + ' ' + y + ' l' + sd * 22 + ' ' + (y < 67 ? -4 : 3), stroke: ink, 'stroke-width': 1.2, opacity: .5 })); }
      else { A('ellipse', { cx: 36, cy: 30, rx: 9, ry: 26, fill: fur, transform: 'rotate(-14 36 30)' }); A('ellipse', { cx: 64, cy: 30, rx: 9, ry: 26, fill: fur, transform: 'rotate(14 64 30)' }); A('ellipse', { cx: 36, cy: 30, rx: 4, ry: 18, fill: '#F7C6CF', transform: 'rotate(-14 36 30)' }); A('ellipse', { cx: 64, cy: 30, rx: 4, ry: 18, fill: '#F7C6CF', transform: 'rotate(14 64 30)' }); A('ellipse', { cx: 50, cy: 62, rx: 28, ry: 26, fill: fur }); A('ellipse', { cx: 50, cy: 72, rx: 13, ry: 10, fill: lt }); }
      const eye = p.kind === 'cat' ? 'M0 -5 Q3 0 0 5 Q-3 0 0 -5' : null; [38, 62].forEach(x => { if (eye) A('path', { d: eye, fill: ink, transform: 'translate(' + x + ' 54) scale(1.2)' }); else A('circle', { cx: x, cy: 54, r: 4.2, fill: ink }); A('circle', { cx: x + 1.4, cy: 52.6, r: 1.3, fill: '#fff' }); });
      A('path', { d: 'M45 64 Q50 60 55 64 Q50 70 45 64', fill: p.kind === 'rabbit' ? '#E58BA0' : ink }); A('path', { d: 'M50 68 v4 M50 72 q-5 4 -9 1 M50 72 q5 4 9 1', stroke: ink, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' });
      if (!sm) { A('circle', { cx: 28, cy: 66, r: 5, fill: '#FF8FA3', opacity: .45 }); A('circle', { cx: 72, cy: 66, r: 5, fill: '#FF8FA3', opacity: .45 }); } return sv; }
    /* ---- shell ---- */
    const root = el('div', 'pf'), top = el('header', 'pf-top'), tt = el('div'), ttl = el('h2'), av = el('div', 'pf-av'); tt.append(el('small', null, today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })), ttl); top.append(tt, av);
    PETS.forEach(p => { const b = el('button'); b.type = 'button'; b.dataset.p = p.id; b.setAttribute('aria-label', 'Show ' + p.name); b.append(face(p, true)); b.addEventListener('click', () => setPet(p)); av.append(b); });
    const V = {}, order = ['home', 'vacc', 'weight', 'visit']; order.forEach(k => { V[k] = el('section', 'pf-v'); V[k].setAttribute('aria-label', k); if (k !== 'home') V[k].hidden = true; });
    const nav = el('nav', 'pf-nav'); nav.setAttribute('role', 'tablist'); [['home', '◉', 'Today'], ['vacc', '✦', 'Passport'], ['weight', '◭', 'Weight'], ['visit', '✚', 'Vet']].forEach(([k, ic, t]) => { const b = el('button'); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', t); b.append(el('span', null, ic), el('em', null, t)); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(...order.map(k => V[k]), top, nav); app.append(root); let cur = 'home';
    function go(k, fs) { if (k === cur) { render(); return; } const a = V[cur], ak = cur; V[k].hidden = false; cur = k; render(); V[k].scrollTop = 0;
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .32, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .1, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; if (!fs) haptic(4); }
    H.jump = (k, fs) => go(k, fs);
    function setPet(p) { if (p === P) return; P = p; check('pet'); tone(520 + PETS.indexOf(p) * 140, .05); haptic(6); render(); if (G && !reduced) G.fromTo(V[cur], { opacity: .3, x: 10 }, { opacity: 1, x: 0, duration: .35, ease: 'expo.out' }); }
    /* ---- helpers ---- */
    const vStatus = ([n, every, since]) => { const left = every - since; return { left, cls: left < 0 ? 'od' : left <= 30 ? 'sn' : '', txt: left < 0 ? 'Overdue by ' + (-left) + (left === -1 ? ' day' : ' days') : left === 0 ? 'Due today' : 'Due ' + (left > 300 ? new Date(+today + left * D).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : fmt(new Date(+today + left * D))) + ' · in ' + left + (left === 1 ? ' day' : ' days'), frac: Math.max(0, Math.min(1, left / every)) }; };
    const nextVac = () => P.vac.map(v => [v, vStatus(v)]).sort((a, b) => a[1].left - b[1].left)[0];
    const inBand = w => w >= P.band[0] && w <= P.band[1];
    const visitDate = v => new Date(+today + v[0] * D);
    /* ---- views ---- */
    function home(v) { const hero = el('div', 'pf-hero'), pt = el('div', 'pt'), info = el('div'), chips = el('div', 'pf-chips'); pt.append(face(P)); chips.append(el('span', null, P.breed), el('span', null, P.age), el('span', null, P.w[P.w.length - 1].toFixed(1) + ' kg')); info.append(el('h3', null, P.name), el('p', null, nextVac()[1].left < 0 ? nextVac()[0][0] + ' is overdue' : nextVac()[1].left <= 30 ? nextVac()[0][0] + ' due soon' : 'All good today'), chips); hero.append(pt, info); v.append(hero);
      const tiles = el('div', 'pf-tiles'), [nv, ns] = nextVac(), lw = P.w[P.w.length - 1], nx = P.visits.slice().sort((a, b) => a[0] - b[0])[0];
      const tile = (cls, sm, b, sp, to) => { const t = el('button', 'pf-tile' + (cls ? ' ' + cls : '')); t.type = 'button'; t.append(el('small', null, sm), el('b', null, b), el('span', null, sp)); t.addEventListener('click', () => go(to)); tiles.append(t); };
      tile(ns.left <= 30 ? 'warn' : '', 'Next vaccine', nv[0], ns.txt, 'vacc'); tile(inBand(lw) ? '' : 'warn', 'Weight', lw.toFixed(1) + ' kg', inBand(lw) ? 'In healthy range' : 'Above ' + P.band[1] + ' kg range', 'weight');
      tile('', 'Vet visit', nx ? fmt(visitDate(nx)) + ', ' + nx[1] : 'None booked', nx ? nx[2] : 'Tap to book', 'visit'); tile('', 'Doses today', P.given + ' of ' + P.med[1], P.med[0], 'home'); v.append(tiles);
      const med = el('div', 'pf-med'), ring = el('div', 'pf-ring'), sv = svgEl('svg', { viewBox: '0 0 80 80', 'aria-hidden': 'true' }), C = 2 * Math.PI * 34, fg = svgEl('circle', { class: 'fg', cx: 40, cy: 40, r: 34, 'stroke-dasharray': C.toFixed(1), 'stroke-dashoffset': (C * (1 - P.given / P.med[1])).toFixed(1) });
      sv.append(svgEl('circle', { class: 'bg', cx: 40, cy: 40, r: 34 }), fg); ring.append(sv, el('b', null, P.given + '/' + P.med[1])); const md = el('div'), go2 = el('button', 'pf-go', P.given >= P.med[1] ? 'All given ✓' : 'Give dose'); go2.type = 'button'; go2.disabled = P.given >= P.med[1];
      md.append(el('h4', null, P.med[0]), el('p', null, P.med[1] + (P.med[1] === 1 ? ' dose' : ' doses') + ' a day · ' + P.med[2]), go2); med.append(ring, md); v.append(med);
      go2.addEventListener('click', () => { if (P.given >= P.med[1]) return; P.given++; check('meds'); tone(760, .05); setTimeout(() => tone(1140, .06), 80); haptic(10); fg.setAttribute('stroke-dashoffset', (C * (1 - P.given / P.med[1])).toFixed(1)); ring.querySelector('b').textContent = P.given + '/' + P.med[1];
        go2.textContent = P.given >= P.med[1] ? 'All given ✓' : 'Give dose'; go2.disabled = P.given >= P.med[1]; say(P.name + ': ' + P.med[0] + ' given at ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })); tiles.querySelectorAll('.pf-tile b')[3].textContent = P.given + ' of ' + P.med[1]; }); }
    function vacc(v) { const h = el('div', 'pf-h'); h.append(el('h3', null, P.name + '’s passport'), el('span', null, P.vac.length + ' vaccines')); v.append(h); const pass = el('div', 'pf-pass');
      P.vac.forEach(vc => { const st = vStatus(vc), row = el('div', 'pf-vac'), r = svgEl('svg', { class: 'pf-vr', viewBox: '0 0 44 44', 'aria-hidden': 'true' }), C = 2 * Math.PI * 18;
        r.append(svgEl('circle', { class: 'bg', cx: 22, cy: 22, r: 18 }), svgEl('circle', { cx: 22, cy: 22, r: 18, stroke: st.left < 0 ? '#FF6B3D' : st.left <= 30 ? '#E8A33D' : '#2F8F6B', 'stroke-dasharray': C.toFixed(1), 'stroke-dashoffset': (C * (1 - st.frac)).toFixed(1), 'stroke-linecap': 'round', transform: 'rotate(-90 22 22)' }));
        const mid = el('div'), p = el('p', st.cls, st.txt); mid.append(el('h4', null, vc[0]), p); row.append(r, mid);
        if (vc[2] === 0) { const sp = el('span', 'pf-stamp'); sp.append(el('span', null, 'GIVEN'), el('br'), el('span', null, fmt(today).toUpperCase())); row.append(el('span'), sp); }
        else { const b = el('button', 'pf-stp', 'Stamp'); b.type = 'button'; b.setAttribute('aria-label', 'Mark ' + vc[0] + ' as given today'); b.addEventListener('click', () => { vc[2] = 0; check('vaccine'); tone(180, .09, 'square', .05); haptic(25); render(); const sp = V.vacc.querySelectorAll('.pf-stamp'); const last = [...sp].find(x => x.closest('.pf-vac') && x.closest('.pf-vac').querySelector('h4').textContent === vc[0]);
          if (last && G && !reduced) G.from(last, { scale: 2.4, opacity: 0, rotation: -30, duration: .35, ease: 'back.out(1.6)' }); say(vc[0] + ' stamped. Next due ' + fmt(new Date(+today + vc[1] * D))); }); row.append(b); }
        pass.append(row); }); v.append(pass); }
    function weight(v) { const h = el('div', 'pf-h'); h.append(el('h3', null, 'Weight'), el('span', null, 'healthy ' + P.band[0] + '–' + P.band[1] + ' kg')); v.append(h);
      const ch = el('div', 'pf-ch'), Wd = 330, Hd = 170, pl = 30, pr = 10, pt = 10, pb = 22, all = P.w, lo = Math.min(P.band[0], ...all) - .3, hi = Math.max(P.band[1], ...all) + .3, X = i => pl + i * (Wd - pl - pr) / (all.length - 1), Y = w => pt + (hi - w) / (hi - lo) * (Hd - pt - pb);
      const sv = svgEl('svg', { viewBox: '0 0 ' + Wd + ' ' + Hd, role: 'img', 'aria-label': P.name + ' weight over ' + all.length + ' weigh-ins' }); sv.append(svgEl('rect', { x: pl, y: Y(P.band[1]), width: Wd - pl - pr, height: Y(P.band[0]) - Y(P.band[1]), fill: '#2F8F6B', opacity: .1, rx: 6 }));
      [P.band[0], P.band[1]].forEach(b => { sv.append(svgEl('line', { x1: pl, x2: Wd - pr, y1: Y(b), y2: Y(b), stroke: '#2F8F6B', 'stroke-dasharray': '3 4', opacity: .5 })); const t = svgEl('text', { x: 2, y: Y(b) + 3 }); t.textContent = b + ''; sv.append(t); });
      const d = all.map((w, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(w).toFixed(1)).join(' '), line = svgEl('path', { d, fill: 'none', stroke: P.c, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); sv.append(svgEl('path', { d: d + ' L' + X(all.length - 1) + ' ' + (Hd - pb) + ' L' + pl + ' ' + (Hd - pb) + ' Z', fill: P.c, opacity: .1 }), line);
      all.forEach((w, i) => { sv.append(svgEl('circle', { cx: X(i), cy: Y(w), r: i === all.length - 1 ? 5 : 3, fill: inBand(w) ? P.c : '#FF6B3D', stroke: '#fff', 'stroke-width': 2 })); if (i % 2 === all.length % 2 || i === all.length - 1) { const t = svgEl('text', { x: X(i) - 10, y: Hd - 6 }); t.textContent = fmt(new Date(+today - (all.length - 1 - i) * 7 * D)); sv.append(t); } });
      ch.append(sv); v.append(ch); if (G && !reduced) { const L = line.getTotalLength ? 600 : 0; if (L) G.fromTo(line, { attr: { 'stroke-dasharray': L, 'stroke-dashoffset': L } }, { attr: { 'stroke-dashoffset': 0 }, duration: .8, ease: 'power2.out' }); }
      const sc = el('div', 'pf-scale'), num = el('div', 'pf-num'), mi = el('button', null, '−'), pl2 = el('button', null, '+'), big = el('b'), verd = el('p', 'pf-verd'), save = el('button', 'pf-save', 'Save weigh-in'); [mi, pl2, save].forEach(b => { b.type = 'button'; }); mi.setAttribute('aria-label', 'Decrease 0.1 kg'); pl2.setAttribute('aria-label', 'Increase 0.1 kg');
      const paint = () => { big.textContent = P.wNew.toFixed(1); big.append(el('i', null, ' kg')); const dl = P.wNew - P.w[P.w.length - 1]; verd.textContent = (inBand(P.wNew) ? 'In the healthy range' : P.wNew > P.band[1] ? 'Above the healthy range' : 'Below the healthy range') + ' · ' + (dl >= 0 ? '+' : '−') + Math.abs(dl).toFixed(1) + ' kg since last week'; verd.className = 'pf-verd ' + (inBand(P.wNew) ? 'ok' : 'no'); };
      const step = dv => { P.wNew = Math.max(.5, Math.round((P.wNew + dv) * 10) / 10); paint(); tone(900 + P.wNew * 10, .015, 'square', .015); }; mi.addEventListener('click', () => step(-.1)); pl2.addEventListener('click', () => step(.1));
      save.addEventListener('click', () => { P.w.push(P.wNew); if (P.w.length > 8) P.w.shift(); check('weight'); tone(660, .05); haptic(8); say('Weigh-in saved: ' + P.wNew.toFixed(1) + ' kg'); render(); });
      num.append(mi, big, pl2); sc.append(el('small', null, 'TODAY’S WEIGH-IN'), num, save, verd); paint(); v.append(sc); }
    let sel = { day: 1, slot: null, reason: 'Check-up' };
    function visit(v) { const h = el('div', 'pf-h'); h.append(el('h3', null, 'Book the vet'), el('span', null, 'Greenway Vets')); v.append(h); const days = el('div', 'pf-days');
      for (let i = 1; i <= 12; i++) { const dt = new Date(+today + i * D), b = el('button'); b.type = 'button'; b.append(el('small', null, dt.toLocaleDateString('en-GB', { weekday: 'short' })), el('b', null, String(dt.getDate()))); b.disabled = dt.getDay() === 0; b.setAttribute('aria-pressed', String(sel.day === i)); b.setAttribute('aria-label', dt.toDateString());
        b.addEventListener('click', () => { sel.day = i; sel.slot = null; render(); }); days.append(b); }
      if (new Date(+today + sel.day * D).getDay() === 0) sel.day++;
      v.append(days, el('p', 'pf-lab', 'Time')); const slots = el('div', 'pf-slots'), taken = t => ((sel.day * 7 + t.charCodeAt(1) * 3 + t.charCodeAt(3)) % 5) === 0 || PETS.some(p => p.visits.some(x => x[0] === sel.day && x[1] === t));
      ['09:00', '09:30', '10:30', '11:00', '13:30', '14:00', '15:30', '16:30'].forEach(t => { const b = el('button', null, t); b.type = 'button'; b.disabled = taken(t); b.setAttribute('aria-pressed', String(sel.slot === t)); b.addEventListener('click', () => { sel.slot = t; render(); tone(700, .02); }); slots.append(b); }); v.append(slots, el('p', 'pf-lab', 'Reason'));
      const rs = el('div', 'pf-rs'); ['Check-up', 'Vaccine', 'Dental', 'Limping', 'Skin', 'Not eating'].forEach(r => { const b = el('button', null, r); b.type = 'button'; b.setAttribute('aria-pressed', String(sel.reason === r)); b.addEventListener('click', () => { sel.reason = r; render(); }); rs.append(b); }); v.append(rs);
      const bk = el('button', 'pf-book', sel.slot ? 'Book ' + P.name + ' · ' + fmt(new Date(+today + sel.day * D)) + ', ' + sel.slot : 'Pick a time'); bk.type = 'button'; bk.disabled = !sel.slot; v.append(bk);
      bk.addEventListener('click', () => { if (!sel.slot) return; const vv = [sel.day, sel.slot, sel.reason]; P.visits.push(vv); P.justBooked = vv; check('visit'); tone(880, .05); setTimeout(() => tone(1320, .07), 90); haptic(15); say(P.name + ' is booked for ' + fmt(new Date(+today + sel.day * D)) + ' at ' + sel.slot); sel.slot = null; render(); });
      if (P.visits.length) { v.append(el('p', 'pf-lab', 'Upcoming for ' + P.name)); P.visits.slice().sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1])).forEach(x => { const r = el('div', 'pf-up' + (x === P.justBooked ? ' new' : '')), dd = visitDate(x), m = el('div'); m.append(el('b', null, x[2] + ' · ' + x[1]), el('small', null, dd.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }) + ' · in ' + x[0] + (x[0] === 1 ? ' day' : ' days'))); r.append(el('i', null, String(dd.getDate())), m); v.append(r); }); } }
    function render() { root.style.setProperty('--pc', P.c); ttl.textContent = cur === 'home' ? 'Hi, ' + P.name : P.name; av.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.p === P.id))); nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === cur)));
      const v = V[cur], st = v.scrollTop; v.textContent = ''; ({ home, vacc, weight, visit })[cur](v); v.scrollTop = st; }
    render();
  }
  demo(H.app, H);
  H.boot();
})();
