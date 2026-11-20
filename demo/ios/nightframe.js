/* Nightframe — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- Nightframe ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const P = { iso: [100, 200, 400, 800, 1600, 3200, 6400], sh: ['1/500', '1/250', '1/125', '1/60', '1/30', '1/15', '1/8', '1/4', '1/2', '1"'], ap: [1.4, 2, 2.8, 4, 5.6, 8, 11, 16], wb: [2800, 3200, 4000, 5000, 5600, 6500] };
    const shSec = t => t.endsWith('"') ? parseFloat(t) : 1 / parseFloat(t.split('/')[1]);
    const S = { iso: 2, sh: 3, ap: 2, wb: 4 }; let param = 'iso', preset = 'none', shots = [];
    const PRE = { none: ['Natural', ''], portra: ['Portra 400', 'sepia(.18) saturate(1.05) contrast(.92)'], cine: ['CineStill 800T', 'hue-rotate(-12deg) saturate(1.2) contrast(1.05)'], trix: ['Tri-X 400', 'grayscale(1) contrast(1.35)'], velvia: ['Velvia 50', 'saturate(1.7) contrast(1.15)'], ektar: ['Ektar 100', 'saturate(1.35) contrast(1.05) sepia(.08)'] };
    const root = el('div', 'nf'), vf = el('div', 'nf-vf'), cv = el('canvas'), gr = el('canvas', 'gr'), hud = el('div', 'nf-hud'), flash = el('i', 'nf-flash'); const W = 330, Hh = 430; cv.width = W; cv.height = Hh; gr.width = 165; gr.height = 215;
    cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Camera viewfinder: a neon street at night'); const meter = el('div', 'nf-meter'); vf.append(cv, gr, hud, meter, flash); root.append(vf); app.append(root);
    const ctx = cv.getContext('2d'), gctx = gr.getContext('2d');
    /* ---- the scene ---- */
    let sd = 3; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const bld = []; let x = -10; while (x < W) { const w = 40 + rnd() * 50, h = 140 + rnd() * 160, win = []; for (let wy = Hh - 120 - h + 14; wy < Hh - 130; wy += 16) for (let wx = x + 6; wx < x + w - 8; wx += 12) if (rnd() < .45) win.push([wx, wy, rnd() < .7 ? '#FFD58A' : '#9ED8FF']); bld.push({ x, w, h, win }); x += w + 2; }
    const neon = [[40, 230, 'BAR', '#FF3D7F'], [190, 200, 'NOODLES', '#3FD0E0'], [250, 268, '24H', '#B6FF3B']], cars = [{ x: 0, v: 1.6, y: Hh - 66, c: '#FFF2C7' }, { x: 200, v: -2.2, y: Hh - 52, c: '#FF3B30' }, { x: 120, v: 1.1, y: Hh - 66, c: '#FFF2C7' }];
    const exposure = () => (P.iso[S.iso] / 400) * (shSec(P.sh[S.sh]) * 60) * Math.pow(2.8 / P.ap[S.ap], 2), ev = () => Math.log2(exposure());
    function frame() {
      const sh = shSec(P.sh[S.sh]), trail = Math.min(.92, sh * 12), apR = Math.pow(2.8 / P.ap[S.ap], 1.3);
      ctx.globalAlpha = 1 - trail; const g = ctx.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, '#0B0D1C'); g.addColorStop(.6, '#1A1430'); g.addColorStop(1, '#141018'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, Hh);
      ctx.globalAlpha = 1; bld.forEach(b => { ctx.fillStyle = '#0E0E14'; ctx.fillRect(b.x, Hh - 120 - b.h, b.w, b.h); b.win.forEach(([wx, wy, c]) => { ctx.fillStyle = c; ctx.globalAlpha = .75; ctx.fillRect(wx, wy, 6, 8); }); ctx.globalAlpha = 1; });
      ctx.fillStyle = '#17141C'; ctx.fillRect(0, Hh - 120, W, 120); ctx.fillStyle = '#25202B'; ctx.fillRect(0, Hh - 80, W, 4);
      const light = (lx, ly, r, c, a) => { const rr = r * (1 + apR * 1.8); const rg = ctx.createRadialGradient(lx, ly, 0, lx, ly, rr); rg.addColorStop(0, c); rg.addColorStop(.35, c); rg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalAlpha = a / (1 + apR * .4); ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(lx, ly, rr, 0, 7); ctx.fill(); ctx.globalAlpha = 1; };
      neon.forEach(([nx, ny, t, c]) => { ctx.font = '700 22px "Big Shoulders Display", sans-serif'; ctx.shadowColor = preset === 'cine' ? '#FF2A2A' : c; ctx.shadowBlur = preset === 'cine' ? 28 : 14; ctx.fillStyle = c; ctx.fillText(t, nx, ny); ctx.shadowBlur = 0; light(nx + 20, ny - 8, 10, c, .35); });
      cars.forEach(cr => { cr.x += cr.v * (reduced ? 0 : 1); if (cr.x > W + 20) cr.x = -20; if (cr.x < -20) cr.x = W + 20; light(cr.x, cr.y, 3, cr.c, 1); light(cr.x + 12 * Math.sign(cr.v || 1), cr.y, 3, cr.c, 1); if (preset === 'cine') light(cr.x, cr.y, 7, 'rgba(255,40,40,.9)', .5); });
      for (let i = 0; i < 6; i++) light(20 + i * 60, Hh - 160, 2.5, '#FFE7B0', .8);
      requestAnimationFrame(frame);
    }
    function grain() { const amt = Math.max(0, (P.iso[S.iso] - 200) / 6200); const im = gctx.createImageData(165, 215); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } gctx.putImageData(im, 0, 0); gr.style.opacity = (preset === 'trix' ? .2 : 0) + amt * .75; }
    setInterval(grain, 90);
    function look() { const e = ev(), br = Math.max(.25, Math.min(2.4, Math.pow(2, e * .55))), wb = P.wb[S.wb], tint = wb < 4000 ? 'hue-rotate(' + ((wb - 5000) / 60) + 'deg) saturate(1.1)' : wb > 5800 ? 'sepia(.2) hue-rotate(-8deg)' : '';
      cv.style.filter = 'brightness(' + br.toFixed(2) + ') ' + tint + ' ' + PRE[preset][1]; return cv.style.filter; }
    /* ---- HUD + meter ---- */
    const msv = svgEl('svg', { viewBox: '0 0 200 26', 'aria-hidden': 'true' }); for (let i = -3; i <= 3; i++) { msv.append(svgEl('line', { x1: 100 + i * 28, x2: 100 + i * 28, y1: 4, y2: i % 1 ? 8 : 10, stroke: '#ddd', 'stroke-width': 1.5 })); const t = svgEl('text', { x: 100 + i * 28 - 4, y: 22 }); t.textContent = i > 0 ? '+' + i : String(i); msv.append(t); }
    const needle = svgEl('path', { d: 'M100 2 l-5 -0 l5 8 l5 -8 z', fill: '#E0457B' }); msv.append(needle); meter.append(msv);
    function hudPaint() { hud.textContent = ''; const e = ev(); hud.append(el('span', null, 'ISO ' + P.iso[S.iso] + '  ' + P.sh[S.sh] + '  ƒ' + P.ap[S.ap]), el('b', null, PRE[preset][0].toUpperCase())); needle.setAttribute('transform', 'translate(' + Math.max(-84, Math.min(84, e * 28)).toFixed(1) + ' 0)'); look(); }
    /* ---- presets ---- */
    const pre = el('div', 'nf-pre'); Object.entries(PRE).forEach(([k, [n]]) => { const b = el('button', null, n); b.type = 'button'; b.dataset.k = k; b.addEventListener('click', () => { preset = k; if (k !== 'none') check('preset'); syncUI(); tone(500 + n.length * 20, .04); }); pre.append(b); }); root.append(pre);
    /* ---- parameter chips + snap wheel ---- */
    const par = el('div', 'nf-par'), wheel = el('div', 'nf-wheel'), mark = el('i', 'nf-mark'); wheel.tabIndex = 0; wheel.setAttribute('role', 'slider');
    const LBL = { iso: 'ISO', sh: 'SHUTTER', ap: 'APERTURE', wb: 'WB' }, fmtV = (k, v) => k === 'ap' ? 'ƒ' + v : k === 'wb' ? v + 'K' : String(v);
    Object.keys(LBL).forEach(k => { const b = el('button'), sb = el('b'); b.type = 'button'; b.dataset.k = k; b.append(el('small', null, LBL[k]), sb); b.addEventListener('click', () => { param = k; buildWheel(); syncUI(); }); par.append(b); });
    root.append(par, mark, wheel);
    let wt = 0;
    function buildWheel() { wheel.textContent = ''; P[param].forEach(v => wheel.append(el('span', null, fmtV(param, v)))); wheel.setAttribute('aria-label', LBL[param]); requestAnimationFrame(() => { wheel.scrollLeft = S[param] * 64; paintWheel(); }); }
    function paintWheel() { [...wheel.children].forEach((c, i) => c.classList.toggle('on', i === S[param])); wheel.setAttribute('aria-valuetext', fmtV(param, P[param][S[param]])); }
    function setIdx(i) { i = Math.max(0, Math.min(P[param].length - 1, i)); if (i === S[param]) return; const was = S[param]; S[param] = i; tone(1100, .01, 'square', .015); haptic(3);
      if (param === 'iso' && P.iso[i] >= 1600) check('iso'); if (param === 'sh' && shSec(P.sh[i]) >= 1 / 8) check('shutter'); if (param === 'ap' && P.ap[i] <= 2) check('aperture'); paintWheel(); syncUI(); }
    wheel.addEventListener('scroll', () => { clearTimeout(wt); setIdx(Math.round(wheel.scrollLeft / 64)); wt = setTimeout(() => wheel.scrollTo({ left: S[param] * 64, behavior: 'smooth' }), 140); }, { passive: true });
    wheel.addEventListener('keydown', e => { const d = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: 1, ArrowDown: -1 }[e.key]; if (d) { e.preventDefault(); setIdx(S[param] + d); wheel.scrollLeft = S[param] * 64; } });
    function syncUI() { par.querySelectorAll('button').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.k === param)); b.querySelector('b').textContent = fmtV(b.dataset.k, P[b.dataset.k][S[b.dataset.k]]); }); pre.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === preset))); hudPaint(); }
    /* ---- shoot + roll ---- */
    const bot = el('div', 'nf-bot'), roll = el('button', 'nf-roll'), sh = el('button', 'nf-sh'), sw = el('button', 'nf-sw', '↺'); [roll, sh, sw].forEach(b => { b.type = 'button'; }); roll.setAttribute('aria-label', 'Open camera roll'); sh.setAttribute('aria-label', 'Take photo'); sw.setAttribute('aria-label', 'Reset to auto');
    bot.append(roll, sh, sw); root.append(bot);
    sh.addEventListener('click', () => { const url = cv.toDataURL('image/jpeg', .82), f = look(); shots.unshift({ url, f, cap: PRE[preset][0] + ' · ISO ' + P.iso[S.iso] + ' · ' + P.sh[S.sh] + ' · ƒ' + P.ap[S.ap] }); check('shoot'); tone(1800, .03, 'square', .04); setTimeout(() => tone(900, .04, 'square', .03), 60); haptic(20);
      if (G && !reduced) G.fromTo(flash, { opacity: .85 }, { opacity: 0, duration: .35 }); roll.textContent = ''; const im = el('img'); im.src = url; im.alt = ''; im.style.filter = f; roll.append(im); say(Math.abs(ev()) > 1.5 ? (ev() > 0 ? 'A bit bright. Try a faster shutter' : 'Underexposed. Push the ISO or slow down') : 'Nice exposure'); });
    sw.addEventListener('click', () => { Object.assign(S, { iso: 2, sh: 3, ap: 2, wb: 4 }); preset = 'none'; buildWheel(); syncUI(); say('Back to auto'); });
    let rv = null; function openRoll() { if (rv) return; rv = el('div', 'nf-rv'); const x = el('button', 'nf-x', '‹ Camera'); x.type = 'button'; x.addEventListener('click', () => { rv.remove(); rv = null; }); rv.append(x, el('h2', null, 'Roll · ' + shots.length + (shots.length === 1 ? ' frame' : ' frames'))); const st = el('div', 'nf-strip');
      if (!shots.length) rv.append(el('p', null, 'No frames yet. Take a photo first.')); shots.forEach(sht => { const f = el('figure'), im = el('img'); im.src = sht.url; im.alt = sht.cap; im.style.filter = sht.f; f.append(im, el('figcaption', null, sht.cap)); st.append(f); }); rv.append(st); root.append(rv); }
    roll.addEventListener('click', openRoll); H.jump = k => { if (k === 'roll') openRoll(); else if (rv) { rv.remove(); rv = null; } };
    buildWheel(); syncUI(); requestAnimationFrame(frame);
  }
  demo(H.app, H);
  H.boot();
})();
