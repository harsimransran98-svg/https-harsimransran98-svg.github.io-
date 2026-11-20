/* TrailMarker — Android app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- TrailMarker ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const W = 340, Hh = 300;
    /* ---- seeded value-noise heightmap ---- */
    let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647; const grid = []; for (let i = 0; i < 64 * 64; i++) grid.push(rnd());
    const sm = t => t * t * (3 - 2 * t), vn = (x, y) => { const xi = Math.floor(x) & 63, yi = Math.floor(y) & 63, xf = x - Math.floor(x), yf = y - Math.floor(y), g = (a, b) => grid[((b & 63) * 64) + (a & 63)];
      const a = g(xi, yi), b = g(xi + 1, yi), c = g(xi, yi + 1), d = g(xi + 1, yi + 1); return a + (b - a) * sm(xf) + (c - a) * sm(yf) + (a - b - c + d) * sm(xf) * sm(yf); };
    const hAt = (x, y) => { const nx = x / W, ny = y / Hh; let h = 0, amp = 1, f = 3, tot = 0; for (let o = 0; o < 4; o++) { h += vn(nx * f + 5, ny * f + 9) * amp; tot += amp; amp *= .5; f *= 2; } h /= tot; return h * .75 + (1 - Math.hypot(nx - .62, ny - .35) * 1.3) * .35; };
    const HM = new Float32Array(W * Hh); let mn = 9, mx = -9; for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const v = hAt(x, y); HM[y * W + x] = v; mn = Math.min(mn, v); mx = Math.max(mx, v); }
    const elev = (x, y) => Math.round(850 + (HM[Math.max(0, Math.min(Hh - 1, Math.round(y))) * W + Math.max(0, Math.min(W - 1, Math.round(x)))] - mn) / (mx - mn) * 1450);
    const base = document.createElement('canvas'); base.width = W; base.height = Hh; const bctx = base.getContext('2d'), img = bctx.createImageData(W, Hh);
    const tint = t => t < .25 ? [196, 214, 170] : t < .45 ? [214, 222, 176] : t < .62 ? [230, 220, 182] : t < .78 ? [222, 200, 166] : t < .9 ? [206, 184, 160] : [238, 236, 232];
    for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const i = y * W + x, t = (HM[i] - mn) / (mx - mn), c = tint(t), hx = (HM[i + 1] || HM[i]) - HM[i], hy = (HM[i + W] || HM[i]) - HM[i], sh = 1 + (-hx - hy) * 18;
      const band = Math.floor(t * 18), line = x < W - 1 && y < Hh - 1 && (Math.floor((HM[i + 1] - mn) / (mx - mn) * 18) !== band || Math.floor((HM[i + W] - mn) / (mx - mn) * 18) !== band), major = line && band % 4 === 0;
      const o = i * 4; img.data[o] = line ? (major ? 120 : 160) : Math.min(255, c[0] * sh); img.data[o + 1] = line ? (major ? 95 : 130) : Math.min(255, c[1] * sh); img.data[o + 2] = line ? (major ? 70 : 100) : Math.min(255, c[2] * sh); img.data[o + 3] = 255; }
    bctx.putImageData(img, 0, 0);
    const TR = [[30, 270], [70, 240], [95, 205], [120, 185], [150, 170], [175, 140], [205, 120], [230, 100], [255, 92], [280, 80], [300, 60]];
    const pathPts = (() => { const out = []; for (let i = 0; i < TR.length - 1; i++) for (let k = 0; k < 12; k++) { const t = k / 12, a = TR[Math.max(0, i - 1)], b = TR[i], c = TR[i + 1], d = TR[Math.min(TR.length - 1, i + 2)], cr = (p0, p1, p2, p3) => .5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t); out.push([cr(a[0], b[0], c[0], d[0]), cr(a[1], b[1], c[1], d[1])]); } out.push(TR[TR.length - 1]); return out; })();
    const segLen = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]) * 19; const cum = [0]; for (let i = 1; i < pathPts.length; i++) cum.push(cum[i - 1] + segLen(pathPts[i - 1], pathPts[i]));
    let rec = false, idx = 0, crumbs = [], pins = [], tmr = 0, offline = false, back = false, scrubI = -1;

    const root = el('div', 'tm'), V = {}; ['map', 'profile', 'areas'].forEach(k => { V[k] = el('section', 'tm-v'); V[k].setAttribute('aria-label', k); if (k !== 'map') V[k].hidden = true; root.append(V[k]); });
    const nav = el('nav', 'tm-nav'); [['map', 'MAP'], ['profile', 'PROFILE'], ['areas', 'OFFLINE']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(nav); app.append(root); let cur = 'map';
    function go(k) { if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k))); if (k === 'profile') renderProfile(); if (k === 'areas') renderAreas();
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0 }, { opacity: 1, duration: .3 }); G.to(a, { opacity: 0, duration: .1, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; }
    H.jump = go;

    /* ---- map ---- */
    const mapW = el('div', 'tm-map'), cv = el('canvas'), chip = el('span', 'tm-chip', '● Online'), comp = el('span', 'tm-comp', 'N'); cv.width = W; cv.height = Hh; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Topographic map with your trail'); mapW.append(cv, chip, comp);
    const ctx = cv.getContext('2d'); const st = el('div', 'tm-st'), S = ['KM', 'CLIMB m', 'ALT m', 'TIME'].map(t => { const d = el('div'), b = el('b', null, '0'); d.append(b, el('span', null, t)); st.append(d); return b; });
    const ctl = el('div', 'tm-ctl'), rb = el('button', 'rec', '● Record'), bb = el('button', null, '↩ Back'), cb = el('button', null, 'Clear'); [rb, bb, cb].forEach(b => { b.type = 'button'; }); bb.setAttribute('aria-pressed', 'false'); ctl.append(rb, bb, cb);
    const pinRow = el('div', 'tm-pins'); [['💧', 'Water'], ['👁', 'View'], ['⛺', 'Camp']].forEach(([ic, t]) => { const b = el('button', null, ic + ' ' + t); b.type = 'button'; b.addEventListener('click', () => { const p = crumbs.length ? crumbs[crumbs.length - 1] : pathPts[idx]; pins.push({ x: p[0], y: p[1], ic, t }); check('pin'); tone(820, .05); say(t + ' pin dropped at ' + elev(p[0], p[1]) + ' m'); draw(); }); pinRow.append(b); });
    V.map.append(mapW, st, ctl, pinRow);
    function draw() {
      ctx.drawImage(base, 0, 0); ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(217,81,44,.55)'; ctx.lineWidth = 2.5; ctx.beginPath(); pathPts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.setLineDash([]);
      if (crumbs.length > 1) { ctx.strokeStyle = back ? '#2A6F4E' : '#D9512C'; ctx.lineWidth = 4; ctx.lineCap = ctx.lineJoin = 'round'; ctx.beginPath(); for (let i = 0; i <= Math.min(idx, pathPts.length - 1); i++) { const p = pathPts[i]; i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke(); }
      crumbs.forEach((c, i) => { ctx.fillStyle = 'rgba(31,42,34,.55)'; ctx.beginPath(); ctx.arc(c[0], c[1], 2.4, 0, 7); ctx.fill(); });
      if (back && crumbs.length) for (let i = crumbs.length - 1; i > 0; i -= 4) { const a = crumbs[i], b = crumbs[Math.max(0, i - 4)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]); ctx.save(); ctx.translate(a[0], a[1]); ctx.rotate(ang); ctx.fillStyle = '#2A6F4E'; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-3, -4); ctx.lineTo(-3, 4); ctx.fill(); ctx.restore(); }
      pins.forEach(p => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y - 12, 11, 0, 7); ctx.fill(); ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.ic, p.x, p.y - 7); });
      const me = scrubI >= 0 ? pathPts[scrubI] : pathPts[Math.min(idx, pathPts.length - 1)]; ctx.fillStyle = 'rgba(28,100,242,.18)'; ctx.beginPath(); ctx.arc(me[0], me[1], 14, 0, 7); ctx.fill(); ctx.fillStyle = '#1C64F2'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(me[0], me[1], 6, 0, 7); ctx.fill(); ctx.stroke();
      let climb = 0; for (let i = 1; i <= idx && i < pathPts.length; i++) climb += Math.max(0, elev(...pathPts[i]) - elev(...pathPts[i - 1]));
      S[0].textContent = (cum[Math.min(idx, cum.length - 1)] / 1000).toFixed(2); S[1].textContent = String(climb); S[2].textContent = String(elev(me[0], me[1])); const mins = Math.round(cum[Math.min(idx, cum.length - 1)] / 1000 * 15 + climb / 10); S[3].textContent = Math.floor(mins / 60) + ':' + String(mins % 60).padStart(2, '0');
    }
    rb.addEventListener('click', () => { rec = !rec; rb.textContent = rec ? '■ Stop' : '● Record'; rb.classList.toggle('on', rec); if (rec) { if (idx >= pathPts.length - 1) { idx = 0; crumbs = []; } back = false; bb.setAttribute('aria-pressed', 'false'); check('record'); tone(660, .06);
        tmr = setInterval(() => { idx++; const p = pathPts[Math.min(idx, pathPts.length - 1)]; crumbs.push([p[0] + (rnd() - .5) * 9, p[1] + (rnd() - .5) * 9]); comp.style.transform = 'rotate(' + (-Math.atan2(p[1] - pathPts[Math.max(0, idx - 1)][1], p[0] - pathPts[Math.max(0, idx - 1)][0]) * 57 - 90) + 'deg)'; draw(); if (idx >= pathPts.length - 1) { clearInterval(tmr); rec = false; rb.textContent = '● Record'; rb.classList.remove('on'); say('Summit reached · ' + S[0].textContent + ' km, ' + S[1].textContent + ' m climbed'); } }, 160); }
      else { clearInterval(tmr); say('Paused · ' + crumbs.length + ' breadcrumbs saved'); } });
    bb.addEventListener('click', () => { if (crumbs.length < 4) { say('Record a little first, then trace back'); return; } back = !back; bb.setAttribute('aria-pressed', String(back)); if (back) { check('back'); say('Follow the green arrows back to the start · ' + S[0].textContent + ' km'); } draw(); });
    cb.addEventListener('click', () => { clearInterval(tmr); rec = false; idx = 0; crumbs = []; pins = []; back = false; rb.textContent = '● Record'; rb.classList.remove('on'); draw(); });

    /* ---- elevation profile ---- */
    function renderProfile() { const v = V.profile; v.textContent = ''; const h = el('div', 'tm-h'); h.append(el('small', null, 'Ridge trail · ' + (cum[cum.length - 1] / 1000).toFixed(1) + ' km'), el('h2', null, 'ELEVATION')); v.append(h);
      const box = el('div', 'tm-prof'), PW = 320, PH = 150, es = pathPts.map(p => elev(p[0], p[1])), lo = Math.min(...es) - 40, hi = Math.max(...es) + 40, X = i => 30 + cum[i] / cum[cum.length - 1] * (PW - 38), Y = e => 10 + (1 - (e - lo) / (hi - lo)) * (PH - 30);
      const sv = svgEl('svg', { viewBox: '0 0 ' + PW + ' ' + PH, role: 'slider', tabindex: '0', 'aria-label': 'Elevation profile, use arrow keys to move along the trail' });
      let d = 'M' + X(0) + ' ' + (PH - 20); es.forEach((e, i) => { d += ' L' + X(i).toFixed(1) + ' ' + Y(e).toFixed(1); }); d += ' L' + X(es.length - 1) + ' ' + (PH - 20) + 'Z';
      sv.append(svgEl('path', { d, fill: 'rgba(217,81,44,.18)', stroke: '#D9512C', 'stroke-width': 2 })); [lo + 40, hi - 40].forEach(e => { const t = svgEl('text', { x: 0, y: Y(e) + 3 }); t.textContent = e + 'm'; sv.append(t); });
      const cur2 = svgEl('line', { x1: 0, x2: 0, y1: 8, y2: PH - 20, stroke: '#1C64F2', 'stroke-width': 2 }), dotc = svgEl('circle', { r: 5, fill: '#1C64F2' }); sv.append(cur2, dotc); box.append(sv); const pv = el('div', 'tm-pv'); v.append(box, pv);
      const set = i => { scrubI = Math.max(0, Math.min(es.length - 1, i)); cur2.setAttribute('x1', X(scrubI)); cur2.setAttribute('x2', X(scrubI)); dotc.setAttribute('cx', X(scrubI)); dotc.setAttribute('cy', Y(es[scrubI])); sv.setAttribute('aria-valuetext', (cum[scrubI] / 1000).toFixed(1) + ' km, ' + es[scrubI] + ' metres');
        const ahead = es[Math.min(es.length - 1, scrubI + 12)] - es[scrubI]; pv.textContent = ''; pv.append(el('b', null, es[scrubI] + ' m'), document.createTextNode('  at ' + (cum[scrubI] / 1000).toFixed(1) + ' km · ' + (ahead > 15 ? 'climbing ' + ahead + ' m in the next stretch' : ahead < -15 ? 'descending ' + -ahead + ' m next' : 'fairly flat next')));
        draw(); check('profile'); };
      const fromX = e => { const r = sv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * PW; let best = 0; for (let i = 0; i < es.length; i++) if (Math.abs(X(i) - x) < Math.abs(X(best) - x)) best = i; return best; };
      box.addEventListener('pointerdown', e => { try { box.setPointerCapture(e.pointerId); } catch (_) {} set(fromX(e)); const mv = ev => set(fromX(ev)); const up = () => { box.removeEventListener('pointermove', mv); box.removeEventListener('pointerup', up); }; box.addEventListener('pointermove', mv); box.addEventListener('pointerup', up); });
      sv.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); set(scrubI + 3); } if (e.key === 'ArrowLeft') { e.preventDefault(); set(scrubI - 3); } });
      set(Math.floor(es.length * .55)); }

    /* ---- offline areas ---- */
    const areas = [['Cairn Ridge & Lochs', 42, 'linear-gradient(135deg,#C4D6AA,#DEC8A6)'], ['Pine Valley loop', 18, 'linear-gradient(135deg,#9FC59A,#E6DCB6)'], ['High Tops plateau', 64, 'linear-gradient(135deg,#DEC8A6,#EEECE8)']], got = new Set();
    function renderAreas() { const v = V.areas; v.textContent = ''; const h = el('div', 'tm-h'); h.append(el('small', null, got.size + ' areas on this phone'), el('h2', null, 'OFFLINE MAPS')); v.append(h);
      areas.forEach(([n, mb, g], i) => { const r = el('div', 'tm-area'), ic = el('i'), p = el('p'), b = el('button', null, got.has(i) ? 'Saved' : 'Download'), bar = el('div', 'tm-dl'), bi = el('i'); b.type = 'button'; ic.style.setProperty('--g', g); bar.append(bi); p.append(el('b', null, n), document.createTextNode(mb + ' MB · contours, trails, huts'), bar); b.disabled = got.has(i); if (got.has(i)) bi.style.width = '100%';
        b.addEventListener('click', () => { b.disabled = true; b.textContent = '…'; let pct = 0; const t2 = setInterval(() => { pct += 9; bi.style.width = Math.min(100, pct) + '%'; if (pct >= 100) { clearInterval(t2); got.add(i); b.textContent = 'Saved'; if (i === 0) { offline = true; chip.textContent = '✓ Offline · ' + mb + ' MB'; chip.classList.add('off'); } check('offline'); tone(880, .08); say(n + ' saved for offline use'); } }, 90); });
        r.append(ic, p, b); v.append(r); }); }

    nav.querySelector('[data-v="map"]').setAttribute('aria-selected', 'true'); draw();
  }
  demo(H.app, H);
  H.boot();
})();
