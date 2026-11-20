/* ScanStack — Android app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "chapters";
/* ---------- ScanStack ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const W = 340, Hh = 420; let auto = true, captured = null, filt = 'bw'; const pages = [];
    const root = el('div', 'ss'), V = {}; ['camera', 'scan', 'stack'].forEach(k => { V[k] = el('section', 'ss-v'); V[k].setAttribute('aria-label', k); if (k !== 'camera') V[k].hidden = true; root.append(V[k]); });
    const nav = el('nav', 'ss-nav'); [['camera', 'Camera'], ['scan', 'Scan'], ['stack', 'Stack']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(nav); app.append(root); let cur = 'camera';
    function go(k) { if (k === 'scan' && !captured) { capture(true); } if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k))); if (k === 'scan') renderScan(); if (k === 'stack') renderStack();
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .3, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .1, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; }
    H.jump = k => { if (k === 'filter') { go('scan'); } else go(k); };

    /* ---- camera scene: desk + an angled, gently drifting receipt ---- */
    const cam = el('div', 'ss-cam'), cv = el('canvas'), hint = el('div', 'ss-hint', 'Looking for a page…'), flash = el('i', 'ss-flash'); cv.width = W; cv.height = Hh; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Camera view with a receipt on a desk'); cam.append(cv, hint, flash);
    const ov = el('canvas'); ov.width = W; ov.height = Hh; ov.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none'; cam.insertBefore(ov, hint);
    const ctx = cv.getContext('2d', { willReadFrequently: true }), octx = ov.getContext('2d');
    const base = [[82, 70], [262, 92], [282, 352], [64, 334]]; let t = 0, quad = null, stable = 0, lastQ = null;
    function drawScene() {
      t += 1; const wob = (i, k) => Math.sin(t / 40 + i * 1.7 + k) * (auto ? 5 : 7) * (stable > 25 ? .2 : 1);
      const g = ctx.createLinearGradient(0, 0, W, Hh); g.addColorStop(0, '#6B4A33'); g.addColorStop(1, '#4A3020'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);
      for (let i = 0; i < 26; i++) { ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.moveTo(0, i * 17 + (i % 3)); ctx.bezierCurveTo(W / 3, i * 17 + 6, W / 1.5, i * 17 - 5, W, i * 17 + 3); ctx.stroke(); }
      const P = base.map(([x, y], i) => [x + wob(i, 0), y + wob(i, 2)]); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); P.forEach(([x, y], i) => i ? ctx.lineTo(x + 8, y + 10) : ctx.moveTo(x + 8, y + 10)); ctx.fill();
      ctx.fillStyle = '#F4F1EA'; ctx.beginPath(); P.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.fill();
      const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], at = (u, v) => lerp(lerp(P[0], P[1], u), lerp(P[3], P[2], u), v);
      const line = (v, u0, u1, w, col) => { const a = at(u0, v), b = at(u1, v); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };
      line(.08, .25, .75, 7, '#2C2C2C'); line(.15, .3, .7, 3, '#777'); for (let i = 0; i < 9; i++) { line(.26 + i * .06, .1, .55, 3, '#555'); line(.26 + i * .06, .72, .9, 3, '#555'); } line(.84, .1, .9, 1.5, '#999'); line(.9, .1, .4, 5, '#222'); line(.9, .66, .9, 5, '#222');
      const sh = ctx.createLinearGradient(0, 0, W, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.18)'); ctx.fillStyle = sh; ctx.fillRect(0, 0, W, Hh);
    }
    /* real detection on the camera pixels: paper = bright + low saturation, corners = extreme points */
    function detect() {
      const d = ctx.getImageData(0, 0, W, Hh).data; let tl = null, tr = null, br = null, bl = null, cnt = 0;
      for (let y = 0; y < Hh; y += 3) for (let x = 0; x < W; x += 3) { const i = (y * W + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        if (mx > 175 && mx - mn < 40) { cnt++; const s1 = x + y, s2 = x - y; if (!tl || s1 < tl[2]) tl = [x, y, s1]; if (!br || s1 > br[2]) br = [x, y, s1]; if (!tr || s2 > tr[2]) tr = [x, y, s2]; if (!bl || s2 < bl[2]) bl = [x, y, s2]; } }
      if (cnt < 400) return null; return [tl, tr, br, bl].map(p => [p[0], p[1]]); }
    function drawQuad(q) { octx.clearRect(0, 0, W, Hh); if (!q) return; const ok = stable > 12; octx.fillStyle = ok ? 'rgba(20,184,166,.18)' : 'rgba(28,100,242,.14)'; octx.strokeStyle = ok ? '#14B8A6' : '#1C64F2'; octx.lineWidth = 3;
      octx.beginPath(); q.forEach(([x, y], i) => i ? octx.lineTo(x, y) : octx.moveTo(x, y)); octx.closePath(); octx.fill(); octx.stroke(); q.forEach(([x, y]) => { octx.fillStyle = '#fff'; octx.beginPath(); octx.arc(x, y, 7, 0, 7); octx.fill(); octx.stroke(); }); }
    let frames = 0;
    function tick() {
      if (cur === 'camera' && !document.hidden) { drawScene(); quad = detect(); frames++; if (quad && frames > 3) check('detect');
        if (quad && lastQ) { const mv = quad.reduce((a, p, i) => a + Math.hypot(p[0] - lastQ[i][0], p[1] - lastQ[i][1]), 0) / 4; stable = mv < 3.2 ? stable + 1 : Math.max(0, stable - 2); }
        lastQ = quad; drawQuad(quad); hint.textContent = !quad ? 'Looking for a page…' : stable > 12 ? (auto ? 'Hold still… capturing' : 'Edges locked · tap the shutter') : 'Page found · hold steady'; hint.classList.toggle('ok', !!quad && stable > 12);
        ring.setAttribute('stroke-dasharray', (Math.min(1, stable / 30) * 100).toFixed(1) + ' 100'); if (auto && stable >= 30) capture(); }
    }
    setInterval(tick, 66);

    /* ---- perspective flattening (bilinear inverse map) + filters ---- */
    const OW = 240, OH = 320; let raw = null;
    function warp(q) { const src = ctx.getImageData(0, 0, W, Hh).data, out = new ImageData(OW, OH), o = out.data; const [a, b, c, d2] = q;
      for (let v = 0; v < OH; v++) { const fv = v / (OH - 1); for (let u = 0; u < OW; u++) { const fu = u / (OW - 1), x = (1 - fu) * (1 - fv) * a[0] + fu * (1 - fv) * b[0] + fu * fv * c[0] + (1 - fu) * fv * d2[0], y = (1 - fu) * (1 - fv) * a[1] + fu * (1 - fv) * b[1] + fu * fv * c[1] + (1 - fu) * fv * d2[1];
        const si = ((Math.round(y) * W) + Math.round(x)) * 4, oi = (v * OW + u) * 4; o[oi] = src[si]; o[oi + 1] = src[si + 1]; o[oi + 2] = src[si + 2]; o[oi + 3] = 255; } } return out; }
    function filtered(img, f) { const out = new ImageData(new Uint8ClampedArray(img.data), OW, OH), o = out.data;
      for (let i = 0; i < o.length; i += 4) { const g = .3 * o[i] + .59 * o[i + 1] + .11 * o[i + 2];
        if (f === 'bw') { const v = g > 150 ? 255 : g < 95 ? 15 : (g - 95) / 55 * 240; o[i] = o[i + 1] = o[i + 2] = v; } else if (f === 'boost') { for (let k = 0; k < 3; k++) o[i + k] = Math.max(0, Math.min(255, (o[i + k] - 128) * 1.35 + 140)); } } return out; }
    const toCanvas = img => { const c = el('canvas'); c.width = OW; c.height = OH; c.getContext('2d').putImageData(img, 0, 0); return c; };
    function capture(silent) { const q = quad || detect() || base; raw = warp(q); captured = true; stable = 0; if (!silent) { check('capture'); if (G && !reduced) G.fromTo(flash, { opacity: .95 }, { opacity: 0, duration: .45 }); tone(1600, .04, 'square', .03); haptic(15); say('Captured · flattened to A4'); setTimeout(() => go('scan'), 350); } }

    /* ---- views ---- */
    const shut = el('div', 'ss-shut'), au = el('button', 'ss-auto'), sh = el('button', 'sh'), ringSv = svgEl('svg', { viewBox: '0 0 40 40', class: 'ss-ring', 'aria-hidden': 'true' }), ring = svgEl('circle', { cx: 20, cy: 20, r: 16, class: 'a', pathLength: 100, 'stroke-dasharray': '0 100' });
    ringSv.append(svgEl('circle', { cx: 20, cy: 20, r: 16, class: 't' }), ring); au.type = sh.type = 'button'; sh.setAttribute('aria-label', 'Capture page'); au.setAttribute('aria-pressed', 'true'); au.textContent = 'AUTO';
    au.addEventListener('click', () => { auto = !auto; au.setAttribute('aria-pressed', String(auto)); say(auto ? 'Auto-capture on' : 'Manual: tap the shutter'); }); sh.addEventListener('click', () => capture());
    const thumbs = el('div', 'ss-thumbs'); shut.append(au, sh, ringSv); V.camera.append(cam, shut, thumbs);
    function renderScan() { const v = V.scan; v.textContent = ''; const h = el('div', 'ss-h'); h.append(el('small', null, 'Page ' + (pages.length + 1) + ' · flattened'), el('h2', null, 'Your scan')); v.append(h);
      const pg = el('div', 'ss-page'); pg.append(toCanvas(filtered(raw, filt))); v.append(pg);
      const fl = el('div', 'ss-flt'); [['orig', 'Original', 'linear-gradient(135deg,#C9B79A,#F4F1EA)'], ['bw', 'Clean B&W', 'linear-gradient(135deg,#111,#fff)'], ['boost', 'Colour', 'linear-gradient(135deg,#FCE7B2,#fff)']].forEach(([k, t, g]) => { const b = el('button'), i = el('i'); b.type = 'button'; i.style.setProperty('--g', g); b.append(i, document.createTextNode(t)); b.setAttribute('aria-pressed', String(k === filt)); b.addEventListener('click', () => { filt = k; if (k === 'bw') check('filter'); renderScan(); }); fl.append(b); }); v.append(fl);
      const add = el('button', 'ss-btn', 'Add to stack'), re = el('button', 'ss-btn alt', 'Retake'); add.type = re.type = 'button'; add.addEventListener('click', () => { pages.push(filtered(raw, filt)); if (pages.length >= 2) check('stack'); thumbs.textContent = ''; pages.forEach(p => thumbs.append(toCanvas(p))); captured = null; say('Page ' + pages.length + ' added'); go(pages.length >= 2 ? 'stack' : 'camera'); });
      re.addEventListener('click', () => { captured = null; go('camera'); }); v.append(add, re); }
    function renderStack() { const v = V.stack; v.textContent = ''; const h = el('div', 'ss-h'); h.append(el('small', null, pages.length + ' pages'), el('h2', null, 'Stack')); v.append(h);
      if (!pages.length) { v.append(el('p', 'ss-h', 'Capture a page to start a stack.')); return; }
      const g = el('div', 'ss-pages'); pages.forEach((p, i) => { const d = el('div', 'ss-pg'), mv = el('div', 'mv'), l = el('button', null, '←'), r = el('button', null, '→'); l.type = r.type = 'button'; l.disabled = !i; r.disabled = i === pages.length - 1; l.setAttribute('aria-label', 'Move page ' + (i + 1) + ' earlier'); r.setAttribute('aria-label', 'Move page ' + (i + 1) + ' later');
        l.addEventListener('click', () => { [pages[i - 1], pages[i]] = [pages[i], pages[i - 1]]; renderStack(); }); r.addEventListener('click', () => { [pages[i + 1], pages[i]] = [pages[i], pages[i + 1]]; renderStack(); }); mv.append(l, r); d.append(toCanvas(p), el('b', null, String(i + 1)), mv); g.append(d); }); v.append(g);
      const ex = el('button', 'ss-btn', 'Export PDF'); ex.type = 'button'; ex.addEventListener('click', () => { const out = el('div', 'ss-pdf'), tx = el('div'); tx.append(el('b', null, 'Scan_' + new Date().toISOString().slice(0, 10) + '.pdf'), el('small', null, pages.length + ' pages · ' + (pages.length * .38).toFixed(1) + ' MB · searchable text')); out.append(el('i', null, 'PDF'), tx); v.append(out); ex.disabled = true; check('export'); tone(880, .08); say('PDF ready to share'); }); v.append(ex); }

    nav.querySelector('[data-v="camera"]').setAttribute('aria-selected', 'true');
  }
  demo(H.app, H);
  H.boot();
})();
