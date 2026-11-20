/* Fuelog — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- Fuelog ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const fills = [[38.2, 1.47, 61240, 'Oct 2'], [41.0, 1.45, 61895, 'Oct 16'], [36.6, 1.49, 62460, 'Oct 30'], [40.1, 1.44, 63118, 'Nov 12']].map(([l, p, odo, d]) => ({ l, p, odo, d }));
    let unit = 'l100', odo = 63118, tankL = 18, scanned = false;
    const svcs = [['Oil and filter', 15000, 52300, '#00957C', 'km'], ['Tyre rotation', 10000, 54200, '#4C7BD9', 'km'], ['MOT', 365, 290, '#FF5A5F', 'days']].map(([n, every, since, c, u]) => ({ n, every, since, c, u, done: false }));
    const econ = () => { const out = []; for (let i = 1; i < fills.length; i++) { const km = fills[i].odo - fills[i - 1].odo; out.push({ v: fills[i].l / km * 100, d: fills[i].d }); } return out; };
    const disp = l100 => unit === 'l100' ? l100.toFixed(1) : (282.481 / l100).toFixed(1), uLbl = () => unit === 'l100' ? 'L/100 km' : 'MPG';
    const root = el('div', 'fl'), V = {}, order = ['scan', 'stats', 'service', 'range']; order.forEach(k => { V[k] = el('section', 'fl-v'); V[k].setAttribute('aria-label', k); if (k !== 'scan') V[k].hidden = true; root.append(V[k]); });
    const tab = el('nav', 'fl-tab'); [['scan', '📷', 'Scan'], ['stats', '📈', 'Economy'], ['service', '🔧', 'Service'], ['range', '⛽', 'Range']].forEach(([k, ic, t]) => { const b = el('button'); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.append(el('span', null, ic), document.createTextNode(t)); b.addEventListener('click', () => go(k)); tab.append(b); });
    root.append(tab); app.append(root); let cur = 'scan';
    function go(k, fs) { if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; tab.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k))); render(); if (k === 'stats') check('stats'); if (k === 'range') check('range');
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: .3, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .1, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; if (!fs) haptic(4); }
    H.jump = (k, fs) => go(k, fs);
    const unitSw = () => { const u = el('div', 'fl-u'); [['l100', 'L/100'], ['mpg', 'MPG']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.setAttribute('aria-pressed', String(k === unit)); b.addEventListener('click', () => { unit = k; if (k === 'mpg') check('units'); render(); }); u.append(b); }); return u; };
    const head = (v, small, title, right) => { const h = el('div', 'fl-h'), d = el('div'); d.append(el('small', null, small), el('h2', null, title)); h.append(d); if (right) h.append(right); v.append(h); };

    /* ---- receipt scan ---- */
    const NEW = { l: 37.4, p: 1.46, odo: 63702, d: 'Today' };
    function renderScan() { const v = V.scan; v.textContent = ''; head(v, 'Point at the pump receipt', 'Add fill-up');
      const cam = el('div', 'fl-cam'), rc = el('div', 'fl-rc'), line = el('i', 'fl-scan'); rc.append(el('b', null, 'QUICKFUEL · PUMP 4'));
      const rows = [['UNLEADED', '', 0], ['LITRES', NEW.l.toFixed(2), 1], ['PRICE/L', '£' + NEW.p.toFixed(3), 1], ['TOTAL', '£' + (NEW.l * NEW.p).toFixed(2), 0], ['ODO', NEW.odo + ' km', 1]];
      const pEls = rows.map(([a, b, hit], i) => { if (i === 3) rc.append(el('hr')); const p = el('p'); p.append(el('span', null, a), el('span', null, b)); p.dataset.hit = hit; rc.append(p); return p; }); rc.append(el('hr'), el('p', null, 'THANK YOU · ' + new Date().toLocaleDateString()));
      cam.append(rc, line); cam.setAttribute('role', 'img'); cam.setAttribute('aria-label', 'Camera view of a fuel receipt');
      const btn = el('button', 'fl-cbtn', scanned ? 'Scan another receipt' : '📷 Scan receipt'); btn.type = 'button'; const read = el('div', 'fl-read'); v.append(cam, btn, read);
      btn.addEventListener('click', () => { btn.disabled = true; btn.textContent = 'Reading…'; tone(1400, .03, 'square', .02);
        const finish = () => { pEls.forEach(p => { if (p.dataset.hit === '1') p.classList.add('hit'); }); read.textContent = ''; [[NEW.l + ' L', 'litres'], ['£' + NEW.p.toFixed(2), 'per litre'], [NEW.odo.toLocaleString(), 'odometer']].forEach(([b, sp]) => { const d = el('div'); d.append(el('b', null, b), el('span', null, sp)); read.append(d); });
          if (!scanned) { fills.push({ ...NEW }); odo = NEW.odo; tankL = 52; scanned = true; } check('scan'); tone(880, .07); haptic(15); say('Fill-up added · ' + disp(fills[fills.length - 1].l / (NEW.odo - fills[fills.length - 2].odo) * 100) + ' ' + uLbl()); btn.disabled = false; btn.textContent = 'Saved ✓'; if (G && !reduced) G.from(read.children, { y: 10, opacity: 0, duration: .4, stagger: .08 }); };
        if (G && !reduced) { G.fromTo(line, { top: 0, opacity: 1 }, { top: '100%', duration: 1.1, ease: 'power1.inOut', yoyo: true, repeat: 1 }); setTimeout(() => { line.style.opacity = 0; finish(); }, 2250); } else finish(); }); }

    /* ---- economy ---- */
    function renderStats() { const v = V.stats; v.textContent = ''; head(v, 'Last ' + (fills.length - 1) + ' tanks', 'Economy', unitSw()); const e = econ(), avg = e.reduce((a, x) => a + x.v, 0) / e.length, perKm = avg / 100 * fills[fills.length - 1].p;
      const k = el('div', 'fl-kpi'); [[disp(avg) + ' ' + (unit === 'l100' ? 'L' : 'mpg'), 'average ' + uLbl()], ['£' + perKm.toFixed(3), 'per km']].forEach(([b, t]) => { const d = el('div'); d.append(el('b', null, b), el('span', null, t)); k.append(d); }); v.append(k);
      const W = 320, Hh = 160, vals = e.map(x => +disp(x.v)), lo = Math.min(...vals) * .92, hi = Math.max(...vals) * 1.06, X = i => 30 + i / Math.max(1, vals.length - 1) * (W - 44), Y = val => 12 + (1 - (val - lo) / (hi - lo)) * (Hh - 34);
      const ch = el('div', 'fl-ch'), sv = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + Hh, role: 'img', 'aria-label': 'Economy per tank in ' + uLbl() });
      sv.append(svgEl('path', { d: vals.map((x, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(x).toFixed(1)).join(' '), fill: 'none', stroke: '#00957C', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      vals.forEach((x, i) => { sv.append(svgEl('circle', { cx: X(i), cy: Y(x), r: 5, fill: i === vals.length - 1 && scanned ? '#FF5A5F' : '#00957C', stroke: '#fff', 'stroke-width': 2 })); const t = svgEl('text', { x: X(i) - 10, y: Hh - 6 }); t.textContent = e[i].d; sv.append(t); const t2 = svgEl('text', { x: X(i) - 8, y: Y(x) - 10 }); t2.textContent = x; sv.append(t2); });
      ch.append(sv); v.append(ch); [...fills].reverse().forEach((f, i) => { const r = el('div', 'fl-fill' + (i === 0 && scanned ? ' new' : '')); r.append(el('b', null, f.d), el('span', null, f.l + ' L · £' + (f.l * f.p).toFixed(2) + ' · ' + f.odo.toLocaleString() + ' km')); v.append(r); }); }

    /* ---- service ---- */
    function renderSvc() { const v = V.service; v.textContent = ''; head(v, 'Odometer ' + odo.toLocaleString() + ' km', 'Service');
      svcs.forEach(s0 => { const used = s0.u === 'km' ? (s0.done ? 0 : odo - s0.since) : (s0.done ? 0 : s0.since), left = s0.every - used, f = Math.max(0, Math.min(1, used / s0.every)), due = left < s0.every * .1;
        const c = el('div', 'fl-svc' + (due && !s0.done ? ' due' : '')), p = el('p'), bar = el('div', 'fl-bar'), bi = el('i'); bi.style.setProperty('--c', s0.c); bi.style.width = (f * 100) + '%'; bar.append(bi);
        p.append(document.createTextNode(s0.n), el('small', null, s0.done ? 'reset' : left > 0 ? left.toLocaleString() + ' ' + s0.u + ' left' : 'overdue')); c.append(p, bar);
        if (s0.done) c.append(el('span', 'ok', '✓ Done today. Next in ' + s0.every.toLocaleString() + ' ' + s0.u + '.')); else { const b = el('button', null, 'Mark done'); b.type = 'button'; b.setAttribute('aria-label', 'Mark ' + s0.n + ' done'); b.addEventListener('click', () => { s0.done = true; check('service'); tone(760, .06); say(s0.n + ' logged'); render(); }); c.append(b); }
        v.append(c); }); }

    /* ---- range ---- */
    function renderRange() { const v = V.range; v.textContent = ''; head(v, 'At your average economy', 'Range', unitSw()); const e = econ(), avg = e.reduce((a, x) => a + x.v, 0) / e.length, km = tankL / avg * 100;
      const g = el('div', 'fl-gauge'), sv = svgEl('svg', { viewBox: '0 0 250 150', 'aria-hidden': 'true' }), defs = svgEl('defs'), gr = svgEl('linearGradient', { id: 'flG' }); gr.append(svgEl('stop', { offset: 0, 'stop-color': '#FF5A5F' }), svgEl('stop', { offset: .4, 'stop-color': '#F5B342' }), svgEl('stop', { offset: 1, 'stop-color': '#00957C' })); defs.append(gr); sv.append(defs);
      const d = 'M25 135 A100 100 0 0 1 225 135'; const fgp = svgEl('path', { d, class: 'fg', pathLength: 100, 'stroke-dasharray': (tankL / 55 * 100).toFixed(1) + ' 100' }); sv.append(svgEl('path', { d, class: 'bg' }), fgp); const gr2 = el('div', 'fl-gr'); gr2.append(el('b', null, Math.round(km) + ' km'), el('span', null, tankL + ' L in the tank'));
      g.append(sv, gr2); const rg = el('input', 'fl-rng'); rg.type = 'range'; rg.min = 3; rg.max = 55; rg.value = tankL; rg.setAttribute('aria-label', 'Fuel in the tank, litres'); const note = el('div', 'fl-fill'); const upd = () => { const k2 = tankL / avg * 100; fgp.setAttribute('stroke-dasharray', (tankL / 55 * 100).toFixed(1) + ' 100'); gr2.firstChild.textContent = Math.round(k2) + ' km'; gr2.lastChild.textContent = tankL + ' L in the tank'; note.textContent = k2 < 80 ? 'Low: nearest cheap fuel is 3.2 km away, £1.43/L' : 'Plenty for a return trip to Leeds (' + Math.round(k2 / 2) + ' km each way).'; }; rg.addEventListener('input', () => { tankL = +rg.value; upd(); });
      upd(); v.append(g, el('p', 'fl-h', ''), rg, note); }
    function render() { if (cur === 'scan') renderScan(); if (cur === 'stats') renderStats(); if (cur === 'service') renderSvc(); if (cur === 'range') renderRange(); }
    tab.querySelector('[data-v="scan"]').setAttribute('aria-selected', 'true'); renderScan();
  }
  demo(H.app, H);
  H.boot();
})();
