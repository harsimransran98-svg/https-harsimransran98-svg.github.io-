/* BatteryBar — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "desk";
/* ---------- BatteryBar ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say, desk, extra } = H;
    const B = { pct: 62, plugged: false, limit: 100, low: false, cycles: 312.4, design: 5103, temp: 31.2, hist: [], notified: {} };
    const APPS = [['Google Chrome', '#4285F4', 9.5, '14 tabs, 2 playing video'], ['Xcode', '#1C8EF9', 7.2, 'Indexing project'], ['Slack', '#611F69', 3.1, 'Background sync'], ['Spotify', '#1DB954', 2.2, 'Streaming'], ['Figma', '#F24E1E', 4.4, '2 files open'], ['Docker', '#2496ED', 5.6, '3 containers running']].map(([n, c, e, d]) => ({ n, c, e, d, on: true }));
    const health = () => Math.max(60, 100 - B.cycles * .032 - Math.max(0, B.temp - 30) * .2), fullCap = () => Math.round(B.design * health() / 100);
    for (let i = 0; i < 96; i++) { const t = i / 96; B.hist.push(Math.round(Math.max(18, Math.min(100, 95 - t * 70 + (t > .55 ? (t - .55) * 160 : 0) - (t > .8 ? (t - .8) * 120 : 0))))); } B.hist[B.hist.length - 1] = B.pct;
    const drain = () => APPS.filter(a => a.on).reduce((a, b) => a + b.e, 2) * (B.low ? .6 : 1);
    /* ---- menu-bar extra ---- */
    const mx = el('button', 'bb-mx'), mxg = el('span', 'g'), mxi = el('i'), mxp = el('span'), mxz = el('span', 'z', '⚡'); mxg.append(mxi); mx.append(mxg, mxp, mxz); mx.type = 'button'; mx.setAttribute('aria-haspopup', 'true'); mx.setAttribute('aria-expanded', 'false'); extra.append(mx);
    let dd = null, ddR = null;
    function openDD(auto) { if (dd) { closeDD(); return; } if (!auto) check('menu'); dd = el('div', 'bb-dd'); dd.setAttribute('role', 'menu'); const r = mx.getBoundingClientRect(), dr = desk.getBoundingClientRect(), sc = dr.width / 1200; dd.style.left = Math.min(1200 - 312, (r.left - dr.left) / sc - 120) + 'px'; desk.append(dd); mx.setAttribute('aria-expanded', 'true'); paintDD();
      if (G && !reduced) G.from(dd, { opacity: 0, y: -6, scale: .97, transformOrigin: '50% 0', duration: .22, ease: 'power2.out' }); tone(900, .02); }
    function closeDD() { if (!dd) return; dd.remove(); dd = null; mx.setAttribute('aria-expanded', 'false'); }
    function paintDD() { if (!dd) return; dd.textContent = ''; const hd = el('header'), hb = el('b', null, Math.round(B.pct) + '%'), hs = el('span', null, status()); hd.append(hb, hs); const bar = el('div', 'bar'), bi = el('i'); bi.style.width = B.pct + '%'; ddR = { hb, hs, bi }; bar.append(bi); if (B.limit < 100) { const u = el('u'); u.style.left = B.limit + '%'; bar.append(u); } dd.append(hd, bar);
      dd.append(el('h4', null, 'Using significant energy')); APPS.filter(a => a.on).sort((a, b) => b.e - a.e).slice(0, 3).forEach(a => { const r = el('div', 'ap'); r.append(el('span', null, a.n), el('em', null, a.e.toFixed(1) + ' W')); dd.append(r); }); dd.append(el('hr'));
      const it = (label, right, fn) => { const b = el('button', 'it'); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.append(el('span', null, label), el('span', null, right)); b.addEventListener('click', fn); dd.append(b); };
      it('Low Power Mode', B.low ? '✓' : '', () => { B.low = !B.low; say('Low Power Mode ' + (B.low ? 'on' : 'off')); paintAll(); }); it('Charge limit', B.limit < 100 ? B.limit + '%' : 'Off', () => { setLimit(B.limit < 100 ? 100 : 80); }); it(B.plugged ? 'Unplug charger' : 'Plug in charger', '', () => setPlug(!B.plugged));
      dd.append(el('hr')); it('Battery health…', Math.round(health()) + '%', () => { closeDD(); go('health'); }); it('Open BatteryBar', '⌘O', () => { closeDD(); go('overview'); }); }
    mx.addEventListener('click', e => { e.stopPropagation(); openDD(); }); desk.addEventListener('click', e => { const p = e.composedPath();  });
    /* ---- desk charger ---- */
    const mag = el('button', 'bb-mag'), msv = svgEl('svg', { viewBox: '0 0 70 70', 'aria-hidden': 'true' }); mag.type = 'button'; mag.setAttribute('aria-label', 'MagSafe charger. Click to plug in or unplug');
    msv.append(svgEl('path', { d: 'M8 60 C8 40 20 40 30 40 L44 40', fill: 'none', stroke: '#D9DCD6', 'stroke-width': 5, 'stroke-linecap': 'round' }), svgEl('rect', { x: 42, y: 32, width: 22, height: 16, rx: 4, fill: '#C9CDC6' }), svgEl('circle', { class: 'led', cx: 52, cy: 40, r: 2.5, fill: '#9AA096' })); const ml = el('span', null, 'Plug in'); mag.append(msv, ml); desk.append(mag);
    mag.addEventListener('click', () => setPlug(!B.plugged));
    function setPlug(v) { B.plugged = v; if (v) { check('plug'); tone(1320, .05); setTimeout(() => tone(1760, .06), 70); haptic(10); say('Power adapter connected'); } else { tone(440, .05); say('On battery'); } if (G && !reduced) G.fromTo(mag, { x: v ? -16 : 0 }, { x: 0, duration: .4, ease: 'back.out(3)' }); paintAll(); }
    function setLimit(v) { B.limit = v; if (v <= 85) check('limit'); say(v < 100 ? 'Charging will stop at ' + v + '%' : 'Charge limit off'); paintAll(); }
    const status = () => B.plugged ? (B.pct >= B.limit - .2 ? (B.limit < 100 ? 'Held at ' + B.limit + '% limit' : 'Fully charged') : 'Charging · ' + ttf()) : ttE() + ' remaining';
    const rateC = () => B.pct < 80 ? 1.15 : B.pct < 95 ? .45 : .18;
    const ttf = () => { let p = B.pct, m = 0; const tgt = Math.min(B.limit, 100); while (p < tgt - .1 && m < 600) { p += p < 80 ? 1.15 : p < 95 ? .45 : .18; m++; } const h = Math.floor(m / 60); return (h ? h + ' h ' : '') + (m % 60) + ' min to ' + tgt + '%'; };
    const ttE = () => { const m = Math.round(B.pct / (drain() / 60 * .55)); return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); };
    /* ---- engine: 1 s = 1 min ---- */
    setInterval(() => { const p0 = B.pct; if (B.plugged) { if (B.pct < B.limit - .05) B.pct = Math.min(B.limit, B.pct + rateC() / 4); B.temp += (34 - B.temp) * .02; } else { B.pct = Math.max(1, B.pct - drain() / 60 * .55 / 4); B.temp += (30 + drain() / 8 - B.temp) * .02; B.cycles += (p0 - B.pct) / 100; }
      if (B.pct <= 20 && !B.plugged && !B.notified.low) { B.notified.low = 1; say('Battery at 20%. Plug in soon'); } if (B.plugged && B.pct >= B.limit - .05 && !B.notified.full) { B.notified.full = 1; say(B.limit < 100 ? 'Holding at ' + B.limit + '% to protect the battery' : 'Fully charged'); } if (!B.plugged) B.notified.full = 0; if (B.plugged) B.notified.low = 0;
      tick++; if (tick % 8 === 0) { B.hist.push(Math.round(B.pct)); B.hist.shift(); } paintLive(); }, 250);
    let tick = 0;
    /* ---- window ---- */
    const root = el('div', 'bb'), sd = el('nav', 'bb-sd'), mn = el('main', 'bb-mn'); root.append(sd, mn); app.append(root); let cur = 'overview';
    sd.append(el('small', null, 'BatteryBar')); [['overview', '◐', 'Overview'], ['health', '♥', 'Health'], ['apps', '▤', 'Apps'], ['settings', '⚙', 'Settings']].forEach(([k, ic, l]) => { const b = el('button'); b.type = 'button'; b.dataset.v = k; b.append(el('span', null, ic), document.createTextNode(l)); b.addEventListener('click', () => go(k)); sd.append(b); });
    const foot = el('div', 'bb-ft'); sd.append(foot);
    function go(k, fs) { cur = k; if (k === 'health') check('health'); sd.querySelectorAll('button').forEach(b => { if (b.dataset.v === k) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }); paintMain(); if (G && !reduced && !fs) G.fromTo(mn, { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: .28, ease: 'expo.out' }); }
    H.jump = (k, fs) => { if (k === 'menu') { if (!fs && !dd) openDD(); return; } closeDD(); go(k, fs); };
    let live = {};
    function overview() { live = {}; mn.append(el('h2', null, 'Overview'), el('p', null, 'MacBook Pro 14" · ' + B.design + ' mAh design capacity'));
      const hero = el('div', 'bb-hero'), bat = el('div', 'bb-bat'), bf = el('i'), bp = el('b'), bz = el('em', null, '⚡'); bat.append(bf, bp, bz); const right = el('div'), kv = el('div', 'bb-kv'), mk = l => { const d = el('div'), b = el('b'); d.append(el('small', null, l), b); kv.append(d); return b; };
      live.st = mk('Status'); live.src = mk('Power source'); live.dr = mk('Drain'); const pl = el('div', 'bb-plug'), pb = el('button', 'bb-btn'), lb = el('button', 'bb-btn ghost'); pb.type = lb.type = 'button'; pb.addEventListener('click', () => setPlug(!B.plugged)); lb.addEventListener('click', () => setLimit(B.limit < 100 ? 100 : 80)); pl.append(pb, lb); right.append(kv, pl); hero.append(bat, right); mn.append(hero);
      Object.assign(live, { bat, bf, bp, pb, lb });
      const ch = el('div', 'bb-ch'), h3 = el('h3'); h3.append(document.createTextNode('Last 24 hours'), el('span', null, 'charge level')); const sv = svgEl('svg', { viewBox: '0 0 760 150', role: 'img', 'aria-label': 'Charge level over the last 24 hours' }); ch.append(h3, sv); mn.append(ch); live.sv = sv; paintLive(); }
    function healthV() { mn.append(el('h2', null, 'Health'), el('p', null, 'Measured from the battery controller, not estimated.')); const two = el('div', 'bb-two'), g = el('div', 'bb-cd'), gh = el('h3'); gh.append(document.createTextNode('Maximum capacity'), el('span', null, 'vs new'));
      const gw = el('div', 'bb-gau'), sv = svgEl('svg', { viewBox: '0 0 220 130', 'aria-hidden': 'true' }), hp = health(), A = (f) => { const a = Math.PI * (1 - f); return [110 + Math.cos(a) * 90, 115 - Math.sin(a) * 90]; }, [ex, ey] = A(hp / 100);
      sv.append(svgEl('path', { d: 'M20 115 A90 90 0 0 1 200 115', fill: 'none', stroke: '#EEF2ED', 'stroke-width': 16, 'stroke-linecap': 'round' }), svgEl('path', { d: 'M20 115 A90 90 0 0 1 ' + ex.toFixed(1) + ' ' + ey.toFixed(1), fill: 'none', stroke: hp > 85 ? '#2FA84F' : hp > 75 ? '#F5A623' : '#E5484D', 'stroke-width': 16, 'stroke-linecap': 'round' }));
      gw.append(sv, el('b', null, hp.toFixed(1) + '%'), el('small', null, hp > 80 ? 'Condition: Normal' : 'Service recommended')); g.append(gh, gw);
      const d = el('div', 'bb-cd'), dh = el('h3'); dh.append(document.createTextNode('Details'), el('span', null, 'live')); const rows = el('div', 'bb-rows'), row = (k, v) => { const r = el('div'); r.append(el('span', null, k), el('b', null, v)); rows.append(r); };
      row('Cycle count', B.cycles.toFixed(1) + ' of 1000'); const cy = el('div', 'bb-cyc'), ci = el('i'); ci.style.width = (B.cycles / 10) + '%'; row('Full charge capacity', fullCap() + ' mAh'); row('Design capacity', B.design + ' mAh'); row('Temperature', B.temp.toFixed(1) + ' °C'); row('Charge limit', B.limit < 100 ? B.limit + '%' : 'Off'); row('Manufactured', 'Mar 2024 · 1 y 8 m');
      d.append(dh, cy, rows); cy.append(ci); two.append(g, d); mn.append(two); const tip = el('p'); tip.style.cssText = 'margin-top:12px;font-size:13px;color:#56665C'; tip.textContent = 'At your current pace of ' + (B.cycles / 600 * 30).toFixed(1) + ' cycles a month, you reach 80% health in about ' + Math.max(1, Math.round((100 - 80 - B.cycles * .032) / .032 / (B.cycles / 600 * 30) / 12)) + ' years.' + (B.limit < 100 ? ' The charge limit slows this down.' : ' A charge limit would slow this down.'); mn.append(tip); }
    function appsV() { mn.append(el('h2', null, 'Apps'), el('p', null, 'Energy impact right now. Quit one and watch the time remaining change.')); const mx2 = Math.max(...APPS.map(a => a.e)); APPS.slice().sort((a, b) => b.e - a.e).forEach(a => { const r = el('div', 'bb-app'), ic = el('i'), m = el('div'), ib = el('div', 'ib'), bs = el('span'), q = el('button', null, a.on ? 'Quit' : 'Open'); ic.style.setProperty('--c', a.c); r.style.setProperty('--c', a.c); bs.style.width = (a.on ? a.e / mx2 * 100 : 0) + '%'; ib.append(bs); m.append(el('b', null, a.n), el('small', null, a.on ? a.d + ' · ' + a.e.toFixed(1) + ' W' : 'Not running')); q.type = 'button';
      if (!a.on) r.style.opacity = '.5'; q.addEventListener('click', () => { const top = APPS.filter(x => x.on).sort((x, y) => y.e - x.e)[0]; if (a.on && a === top) check('apps'); a.on = !a.on; tone(a.on ? 700 : 380, .04); say(a.on ? a.n + ' opened' : a.n + ' quit · ' + ttE() + ' remaining now'); paintMain(); }); r.append(ic, m, ib, q); mn.append(r); }); }
    function settingsV() { mn.append(el('h2', null, 'Settings'), el('p', null, 'Charge limits keep lithium cells healthier for longer.')); const st = el('div', 'bb-set'), c1 = el('div'), l1 = el('label'), t1 = el('span'), v1 = el('b', null, B.limit < 100 ? B.limit + '%' : 'Off'), rg = el('input'); t1.append(document.createTextNode('Charge limit'), el('small', null, 'Stop charging at this level when plugged in'));
      l1.append(t1, v1); rg.type = 'range'; rg.min = 50; rg.max = 100; rg.step = 5; rg.value = B.limit; rg.setAttribute('aria-label', 'Charge limit percent'); rg.style.setProperty('--p', ((B.limit - 50) * 2) + '%'); rg.addEventListener('input', () => { v1.textContent = +rg.value < 100 ? rg.value + '%' : 'Off'; rg.style.setProperty('--p', ((rg.value - 50) * 2) + '%'); }); rg.addEventListener('change', () => setLimit(+rg.value)); c1.append(l1, rg);
      const tg = (label, sub, get, set2) => { const c = el('div'), l = el('label'), t = el('span'), b = el('button', 'bb-tg'); b.type = 'button'; b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', String(get())); b.setAttribute('aria-label', label); t.append(document.createTextNode(label), el('small', null, sub)); b.addEventListener('click', () => { set2(!get()); b.setAttribute('aria-checked', String(get())); tone(get() ? 800 : 500, .02); paintLive(); }); l.append(t, b); c.append(l); return c; };
      st.append(c1, tg('Low Power Mode', 'Reduces drain about 40%', () => B.low, v => { B.low = v; }), tg('Show percentage in menu bar', 'Next to the battery icon', () => !mxp.hidden, v => { mxp.hidden = !v; })); mn.append(st); }
    function paintMain() { mn.textContent = ''; ({ overview, health: healthV, apps: appsV, settings: settingsV })[cur](); }
    function paintLive() { const p = Math.round(B.pct), lo = p <= 20; mxi.style.width = B.pct + '%'; mxg.classList.toggle('lo', lo && !B.plugged); mxp.textContent = p + '%'; mxz.hidden = !B.plugged; mx.setAttribute('aria-label', 'Battery ' + p + '%, ' + status());
      mag.classList.toggle('on', B.plugged && B.pct < B.limit - .05); mag.classList.toggle('full', B.plugged && B.pct >= B.limit - .05); ml.textContent = B.plugged ? (B.pct >= B.limit - .05 ? 'Charged' : 'Charging') : 'Plug in';
      foot.textContent = ''; foot.append(el('b', null, p + '% · ' + Math.round(health()) + '% health'), el('br'), document.createTextNode(B.cycles.toFixed(1) + ' cycles'));
      if (cur === 'overview' && live.bf) { live.bf.style.width = B.pct + '%'; live.bat.style.setProperty('--bc', lo ? '#E5484D' : B.pct < 40 ? '#F5A623' : '#2FA84F'); live.bp.textContent = p + '%'; live.bat.classList.toggle('chg', B.plugged); live.st.textContent = status(); live.src.textContent = B.plugged ? '96 W USB-C' : 'Battery'; live.dr.textContent = B.plugged ? (B.pct >= B.limit - .05 ? 'Holding · 0 W' : '+' + Math.round(rateC() / 100 * fullCap() * 11.4 / 1000 * 60) + ' W in') : drain().toFixed(1) + ' W';
        live.pb.textContent = B.plugged ? 'Unplug' : 'Plug in'; live.lb.textContent = B.limit < 100 ? 'Limit ' + B.limit + '% ✓' : 'Limit to 80%';
        const sv = live.sv; sv.textContent = ''; const X = i => 30 + i * (720 / 95), Y = v => 128 - v * 1.12; [0, 50, 100].forEach(v => { sv.append(svgEl('line', { x1: 30, x2: 750, y1: Y(v), y2: Y(v), stroke: '#EEF2ED' })); const t = svgEl('text', { x: 0, y: Y(v) + 3 }); t.textContent = v + '%'; sv.append(t); });
        if (B.limit < 100) sv.append(svgEl('line', { x1: 30, x2: 750, y1: Y(B.limit), y2: Y(B.limit), stroke: '#14201A', 'stroke-dasharray': '4 4', opacity: .4 }));
        const d = B.hist.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' '); sv.append(svgEl('path', { d: d + ' L' + X(95) + ' ' + Y(0) + ' L' + X(0) + ' ' + Y(0) + ' Z', fill: '#2FA84F', opacity: .12 }), svgEl('path', { d, fill: 'none', stroke: '#2FA84F', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }), svgEl('circle', { cx: X(95), cy: Y(B.hist[95]), r: 4.5, fill: '#2FA84F', stroke: '#fff', 'stroke-width': 2 }));
        ['24h ago', '18h', '12h', '6h', 'now'].forEach((l, i) => { const t = svgEl('text', { x: 30 + i * 180 - (i === 4 ? 16 : 0), y: 146 }); t.textContent = l; sv.append(t); }); }
      if (dd && ddR) { ddR.hb.textContent = p + '%'; ddR.hs.textContent = status(); ddR.bi.style.width = B.pct + '%'; } }
    function paintAll() { paintDD(); paintLive(); if (cur !== 'overview') paintMain(); }
    go('overview', true);
    setTimeout(() => { if (!dd) openDD(true); }, 900);
  }
  demo(H.app, H);
  H.boot();
})();
