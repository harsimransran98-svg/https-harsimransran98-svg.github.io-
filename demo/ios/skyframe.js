/* Skyframe — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- Skyframe ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const MW = 362, MH = 330, GS = 3, GW = Math.ceil(MW / GS), GH = Math.ceil(MH / GS), WIND = [2.1, .55];
    /* ---- deterministic noise ---- */
    const hash = (x, y) => { let h = x * 374761393 + y * 668265263; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
    const sm = t => t * t * (3 - 2 * t), vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1), u = sm(xf), v = sm(yf); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
    const fbm = (x, y) => vn(x, y) * .55 + vn(x * 2.1, y * 2.1) * .3 + vn(x * 4.3, y * 4.3) * .15;
    const CELLS = [[112, 192, 32, 1.0, -90, 200], [30, 70, 40, .85, -120, 220], [-60, 250, 36, .95, -40, 200], [210, 60, 22, .7, -60, 90], [-140, 140, 44, 1.1, -10, 200], [280, 270, 26, .6, -100, 100], [60, 300, 18, .8, -20, 70]];
    function rain(x, y, t) { let v = 0; for (const [cx, cy, r, pk, born, life] of CELLS) { const age = t - born; if (age < 0 || age > life) continue; const env = Math.sin(Math.PI * age / life), dx = x - (cx + WIND[0] * t), dy = y - (cy + WIND[1] * t); v += pk * env * Math.exp(-(dx * dx + dy * dy) / (2 * r * r)); }
      if (v < .02) return 0; return v * (.55 + .9 * fbm((x - WIND[0] * t) / 38, (y - WIND[1] * t) / 38)); }
    const RAMP = [[.08, [120, 205, 140, .55]], [.25, [70, 175, 90, .75]], [.45, [235, 215, 60, .82]], [.7, [245, 145, 40, .86]], [.95, [225, 50, 60, .88]], [1.3, [190, 60, 200, .9]]];
    const col = v => { if (v < .05) return null; if (v < RAMP[0][0]) { const k = (v - .05) / (RAMP[0][0] - .05), c = RAMP[0][1]; return [c[0], c[1], c[2], c[3] * k]; } for (let i = 1; i < RAMP.length; i++) if (v < RAMP[i][0]) { const [t0, a] = RAMP[i - 1], [t1, b] = RAMP[i], k = (v - t0) / (t1 - t0); return a.map((x, j) => x + (b[j] - x) * k); } return RAMP[RAMP.length - 1][1]; }, mmh = v => v <= .08 ? 0 : v * 7.5;
    /* ---- UI ---- */
    const root = el('div', 'sf'), V = el('div', 'sf-v'); root.append(V); app.append(root);
    const now = el('div', 'sf-now'), nl = el('div'), nr = el('div'), temp = el('b', null, '13°'), cond = el('p'); nl.append(el('small', null, '◉ Pinned spot'), el('h2', null, 'Bermondsey, London'), temp); nr.append(cond); now.append(nl, nr);
    const ban = el('div', 'sf-ban'), bi = el('i', null, '☂'), bt = el('div'); ban.append(bi, bt); ban.setAttribute('aria-live', 'polite');
    const map = el('div', 'sf-map'), base = el('canvas'), ov = el('canvas'); [base, ov].forEach(c => { c.width = MW * 2; c.height = MH * 2; }); ov.setAttribute('role', 'img'); ov.setAttribute('aria-label', 'Rain radar map. Tap to move the pin.');
    const lay = el('div', 'sf-lay'), tag = el('span', 'sf-tag'), key = el('div', 'sf-key'), kg = el('i'); key.append(el('span', null, 'light'), kg, el('span', null, 'heavy')); map.append(base, ov, lay, tag, key);
    const scr = el('div', 'sf-scr'), pl = el('button', 'sf-pl', '▶'), rng = el('div', 'sf-rng'), inp = el('input'), rl = el('span'); pl.type = 'button'; pl.setAttribute('aria-label', 'Play radar loop'); inp.type = 'range'; inp.min = -60; inp.max = 60; inp.step = 1; inp.value = 0; inp.setAttribute('aria-label', 'Radar time, minutes from now');
    rl.append(el('em', null, '−60'), el('em', null, 'now'), el('em', null, '+60')); rl.querySelectorAll('em').forEach(e => { e.style.fontStyle = 'normal'; }); rng.append(inp, rl); scr.append(pl, rng);
    const nc = el('section', 'sf-card'), ncT = el('h3', null, 'Next hour'), ncS = el('small'), bars = el('div', 'sf-nc'), ncl = el('div', 'sf-ncl'); bars.setAttribute('role', 'img'); ['now', '+15', '+30', '+45', '+60'].forEach(t => ncl.append(el('span', null, t))); nc.append(ncT, ncS, bars, ncl);
    const BI = []; for (let i = 0; i < 60; i++) { const b = el('i'); bars.append(b); BI.push(b); }
    const hc = el('section', 'sf-card'), hr = el('div', 'sf-hr'); hc.append(el('h3', null, 'Today'), el('small', null, 'Clearing after the evening showers'), hr);
    V.append(now, ban, map, scr, nc, hc);
    /* ---- base map ---- */
    const bx = base.getContext('2d'); bx.scale(2, 2); (function drawBase() { bx.fillStyle = '#ECEFEA'; bx.fillRect(0, 0, MW, MH);
      bx.fillStyle = '#D6E8D2'; [[60, 80, 34], [280, 230, 40], [170, 300, 26], [320, 60, 22]].forEach(([x, y, r]) => { bx.beginPath(); for (let a = 0; a < 6.3; a += .3) { const rr = r * (.8 + .35 * vn(x + a * 3, y)); bx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } bx.fill(); });
      bx.strokeStyle = '#A9C9EE'; bx.lineWidth = 22; bx.lineCap = 'round'; bx.beginPath(); bx.moveTo(-10, 150); bx.bezierCurveTo(80, 110, 120, 210, 200, 170); bx.bezierCurveTo(270, 135, 300, 200, 380, 160); bx.stroke();
      bx.strokeStyle = '#fff'; bx.lineWidth = 3; for (let i = 0; i < 9; i++) { bx.beginPath(); bx.moveTo(i * 45 + 8 * vn(i, 1), 0); bx.lineTo(i * 45 - 30 + 20 * vn(i, 2), MH); bx.stroke(); } for (let j = 0; j < 8; j++) { bx.beginPath(); bx.moveTo(0, j * 46 + 10 * vn(1, j)); bx.lineTo(MW, j * 46 + 18 - 14 * vn(2, j)); bx.stroke(); }
      bx.strokeStyle = '#F7D58A'; bx.lineWidth = 5; bx.beginPath(); bx.moveTo(0, 60); bx.quadraticCurveTo(180, 120, MW, 40); bx.stroke(); bx.beginPath(); bx.moveTo(90, MH); bx.quadraticCurveTo(140, 180, 250, 0); bx.stroke();
      bx.fillStyle = '#7B8797'; bx.font = '600 9px "Public Sans", sans-serif'; [['SOUTHWARK', 40, 40], ['BERMONDSEY', 210, 215], ['ROTHERHITHE', 285, 120], ['WALWORTH', 40, 290], ['WAPPING', 250, 30], ['THAMES', 120, 162]].forEach(([t, x, y]) => bx.fillText(t, x, y)); })();
    /* ---- state ---- */
    let t = 0, layer = 'rain', pin = [200, 190], playing = false, scrubbed = false;
    const ox = ov.getContext('2d'), off = document.createElement('canvas'); off.width = GW; off.height = GH; const offx = off.getContext('2d'), img = offx.createImageData(GW, GH);
    const parts = Array.from({ length: 260 }, () => [Math.random() * MW, Math.random() * MH, Math.random() * 60]);
    const windAt = (x, y, tt) => { const a = (fbm(x / 120 + tt * .004, y / 120) - .5) * 2.4; return [WIND[0] * Math.cos(a) - WIND[1] * Math.sin(a), WIND[0] * Math.sin(a) + WIND[1] * Math.cos(a)]; };
    const tempAt = (x, y, tt) => 13.5 - y / 90 + (x / MW) * 1.2 - rain(x, y, tt) * 2.4 + (fbm(x / 70, y / 70) - .5) * 2;
    function drawOverlay() { ox.setTransform(2, 0, 0, 2, 0, 0); ox.clearRect(0, 0, MW, MH);
      if (layer === 'rain') { const d = img.data; for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) { const c = col(rain(gx * GS + 2, gy * GS + 2, t)), i = (gy * GW + gx) * 4; if (c) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = Math.round(c[3] * 255); } else d[i + 3] = 0; }
        offx.putImageData(img, 0, 0); ox.imageSmoothingEnabled = true; ox.drawImage(off, 0, 0, MW, MH); }
      else if (layer === 'temp') { for (let gy = 0; gy < GH; gy += 2) for (let gx = 0; gx < GW; gx += 2) { const v = tempAt(gx * GS, gy * GS, t), k = Math.max(0, Math.min(1, (v - 9) / 7)); ox.fillStyle = 'rgba(' + Math.round(60 + 195 * k) + ',' + Math.round(120 + 40 * (1 - Math.abs(k - .5) * 2)) + ',' + Math.round(230 - 190 * k) + ',.42)'; ox.fillRect(gx * GS, gy * GS, GS * 2, GS * 2); }
        ox.fillStyle = '#0D1B2E'; ox.font = '600 10px "Sora", sans-serif'; for (let y = 40; y < MH; y += 90) for (let x = 40; x < MW; x += 100) ox.fillText(Math.round(tempAt(x, y, t)) + '°', x, y); }
      else { ox.strokeStyle = 'rgba(13,27,46,.55)'; ox.lineWidth = 1.4; ox.lineCap = 'round'; parts.forEach(p => { const [u, v] = windAt(p[0], p[1], t), a = Math.min(1, p[2] / 12); ox.globalAlpha = a * .8; ox.beginPath(); ox.moveTo(p[0], p[1]); ox.lineTo(p[0] - u * 4, p[1] - v * 4); ox.stroke(); }); ox.globalAlpha = 1; }
      ox.fillStyle = 'rgba(47,107,255,.18)'; ox.beginPath(); ox.arc(pin[0], pin[1], 16, 0, 7); ox.fill(); ox.fillStyle = '#fff'; ox.beginPath(); ox.arc(pin[0], pin[1], 7.5, 0, 7); ox.fill(); ox.fillStyle = '#2F6BFF'; ox.beginPath(); ox.arc(pin[0], pin[1], 5, 0, 7); ox.fill();
      tag.textContent = t === 0 ? 'Now' : (t > 0 ? '+' : '−') + Math.abs(t) + ' min' + (t > 0 ? ' · forecast' : ''); tag.className = 'sf-tag' + (t > 0 ? ' fut' : ''); }
    function windTick() { if (layer !== 'wind') return; parts.forEach(p => { const [u, v] = windAt(p[0], p[1], t); p[0] += u * .9; p[1] += v * .9; p[2]--; if (p[2] < 0 || p[0] > MW + 5 || p[1] > MH + 5 || p[0] < -5 || p[1] < -5) { p[0] = Math.random() * MW; p[1] = Math.random() * MH; p[2] = 30 + Math.random() * 40; } }); drawOverlay(); }
    setInterval(windTick, 50);
    /* ---- nowcast from the field at the pin ---- */
    function nowcast() { const vals = []; for (let m = 0; m < 60; m++) vals.push(mmh(rain(pin[0], pin[1], m))); const mx = Math.max(...vals), wet0 = vals[0] > 0;
      vals.forEach((v, i) => { BI[i].style.height = Math.max(1, v / Math.max(4, mx) * 82) + 'px'; BI[i].style.setProperty('--c', v > 4 ? '#E1323C' : v > 2 ? '#F5912A' : v > .8 ? '#2F6BFF' : '#8FB0FF'); });
      const fmtT = m => { const d = new Date(Date.now() + m * 6e4); return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }, kind = v => v > 4 ? 'heavy rain' : v > 1.5 ? 'rain' : 'light rain';
      let head, sub; const start = vals.findIndex(v => v > 0), stop = wet0 ? vals.findIndex(v => v === 0) : -1, peakI = vals.indexOf(mx);
      if (!wet0 && start < 0) { head = 'No rain for the next hour'; sub = 'Dry at your pin until at least ' + fmtT(60); bi.textContent = '☀'; }
      else if (!wet0) { head = 'Rain starting in ' + start + (start === 1 ? ' minute' : ' minutes'); sub = 'Peaks at ' + mx.toFixed(1) + ' mm/h (' + kind(mx) + ') around ' + fmtT(peakI); bi.textContent = '☂'; }
      else { head = kind(vals[0]).replace(/^./, c => c.toUpperCase()) + ' now' + (stop > 0 ? ', stopping in ' + stop + ' min' : ''); sub = stop > 0 ? 'Dry from ' + fmtT(stop) : 'Wet for the whole hour, peak ' + mx.toFixed(1) + ' mm/h'; bi.textContent = '🌧'; }
      bt.textContent = ''; bt.append(document.createTextNode(head), el('small', null, sub)); ncS.textContent = head + '. ' + sub + '.'; bars.setAttribute('aria-label', 'Next hour rain: ' + head);
      const r0 = vals[0]; cond.textContent = ''; cond.append(document.createTextNode(r0 > 0 ? kind(r0).replace(/^./, c => c.toUpperCase()) : start > 0 && start < 20 ? 'Clouding over' : 'Partly cloudy'), el('br'), document.createTextNode('H 15°  L 9°')); temp.textContent = Math.round(tempAt(pin[0], pin[1], 0)) + '°'; }
    /* ---- hourly ---- */
    (function hourly() { const h0 = new Date().getHours(); [['☁', 13], ['🌧', 12], ['🌧', 12], ['🌦', 11], ['☁', 11], ['⛅', 10], ['🌙', 9], ['🌙', 9], ['☁', 9], ['🌙', 8], ['🌙', 8], ['🌙', 8]].forEach(([ic, tt], i) => { const d = el('div', i ? null : 'on'); d.append(el('small', null, i ? String((h0 + i) % 24).padStart(2, '0') : 'Now'), el('span', null, ic), el('b', null, tt + '°')); hr.append(d); }); })();
    /* ---- interactions ---- */
    function setT(v, user) { t = Math.max(-60, Math.min(60, Math.round(v))); inp.value = t; drawOverlay(); if (user && t !== 0) { scrubbed = true; check('scrub'); } }
    inp.addEventListener('input', () => { stopPlay(); setT(+inp.value, true); haptic(1); });
    let pt = 0; function stopPlay() { playing = false; clearInterval(pt); pl.textContent = '▶'; pl.setAttribute('aria-label', 'Play radar loop'); }
    pl.addEventListener('click', () => { if (playing) { stopPlay(); return; } playing = true; check('play'); pl.textContent = 'Ⅱ'; pl.setAttribute('aria-label', 'Pause radar loop'); if (t >= 60) setT(-60); pt = setInterval(() => { if (t >= 60) { setT(-60); return; } setT(t + 2); }, reduced ? 400 : 110); });
    ov.addEventListener('click', e => { const r = ov.getBoundingClientRect(); pin = [(e.clientX - r.left) * MW / r.width, (e.clientY - r.top) * MH / r.height]; check('pin'); tone(720, .04); haptic(6); nowcast(); drawOverlay(); if (G && !reduced) G.fromTo(ban, { scale: .97 }, { scale: 1, duration: .4, ease: 'back.out(2)' }); });
    [['rain', 'Rain'], ['wind', 'Wind'], ['temp', 'Temp']].forEach(([k, l]) => { const b = el('button', null, l); b.type = 'button'; b.dataset.l = k; b.addEventListener('click', () => { layer = k; if (k === 'wind') check('layer'); paintLay(); drawOverlay(); tone(560, .03); }); lay.append(b); });
    function paintLay() { lay.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.l === layer))); key.style.setProperty('--g', layer === 'temp' ? 'linear-gradient(90deg, #3C78E6, #8CA078, #FFA028)' : 'linear-gradient(90deg, #78CD8C, #46AF5A, #EBD73C, #F5912A, #E1323C, #BE3CC8)'); key.firstChild.textContent = layer === 'temp' ? '9°' : 'light'; key.lastChild.textContent = layer === 'temp' ? '16°' : 'heavy'; key.hidden = layer === 'wind'; }
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && e.intersectionRatio > .6) check('nowcast'); }), { root: V, threshold: [.6] }) : null; if (io) io.observe(nc);
    const scrollTo = node => { V.scrollTo({ top: Math.max(0, node.offsetTop - 60), behavior: reduced ? 'auto' : 'smooth' }); };
    H.jump = (k, fs) => { if (k === 'radar') { V.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); if (!fs && !playing) pl.click(); } else if (k === 'pin') { V.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); if (!fs) say('Tap anywhere on the map to move the pin'); } else if (k === 'nowcast') { scrollTo(nc); if (!fs) check('nowcast'); } else if (k === 'layers') { V.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); if (!fs) { layer = 'wind'; check('layer'); paintLay(); drawOverlay(); } } };
    paintLay(); nowcast(); drawOverlay();
  }
  demo(H.app, H);
  H.boot();
})();
