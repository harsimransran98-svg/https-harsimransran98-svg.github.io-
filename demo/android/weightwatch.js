/* WeightWatch — Android app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- WeightWatch ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    let sd = 5; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const N = 60, data = []; for (let i = 0; i < N; i++) data.push(+(84.6 - i * .045 + Math.sin(i / 6) * .35 + (rnd() - .5) * 1.4).toFixed(1));
    const waist = Array.from({ length: 8 }, (_, i) => +(92 - i * .55 + (rnd() - .5) * .6).toFixed(1)), fat = Array.from({ length: 8 }, (_, i) => +(24.8 - i * .22 + (rnd() - .5) * .3).toFixed(1));
    let unit = 'kg', smooth = true, goal = 78, logged = false, today = data[N - 1];
    const ema = a => { const out = []; let e = a[0]; a.forEach(v => { e = e + .1 * (v - e); out.push(e); }); return out; };
    const conv = kg => unit === 'kg' ? kg : unit === 'lb' ? kg * 2.20462 : kg / 6.35029;
    const fmtW = kg => unit === 'st' ? (() => { const st = kg / 6.35029, s0 = Math.floor(st), lb = Math.round((st - s0) * 14 * 10) / 10; return s0 + ' st ' + lb + ' lb'; })() : conv(kg).toFixed(1) + ' ' + unit;
    const root = el('div', 'ww'), V = {}; ['log', 'trend', 'metrics', 'goal'].forEach(k => { V[k] = el('section', 'ww-v'); V[k].setAttribute('aria-label', k); if (k !== 'log') V[k].hidden = true; root.append(V[k]); });
    const nav = el('nav', 'ww-nav'); [['log', 'Log'], ['trend', 'Trend'], ['metrics', 'Body'], ['goal', 'Goal']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(nav); app.append(root); let cur = 'log';
    function go(k, fromScroll) { if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k))); render();
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0 }, { opacity: 1, duration: .3 }); G.to(a, { opacity: 0, duration: .1, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; if (!fromScroll) haptic(4); }
    H.jump = (k, f) => go(k, f);
    const head = (v, t, right) => { const h = el('div', 'ww-h'); h.append(el('h2', null, t)); if (right) h.append(right); v.append(h); };
    const unitSw = () => { const u = el('div', 'ww-u'); ['kg', 'lb', 'st'].forEach(x => { const b = el('button', null, x); b.type = 'button'; b.setAttribute('aria-pressed', String(x === unit)); b.addEventListener('click', () => { unit = x; check('units'); render(); }); u.append(b); }); return u; };

    /* ---- drum picker (0.1 steps), keyboard = slider ---- */
    const vals = []; for (let v = 70; v <= 100.001; v += .1) vals.push(+v.toFixed(1));
    const drum = el('div', 'ww-drum'), lst = el('div', 'lst'), unitEm = el('em'); vals.forEach(v => lst.append(el('div', 'it', v.toFixed(1)))); drum.append(lst, el('i'), unitEm); drum.tabIndex = 0; drum.setAttribute('role', 'slider'); drum.setAttribute('aria-label', 'Today’s weight'); drum.setAttribute('aria-valuemin', '70'); drum.setAttribute('aria-valuemax', '100');
    let pickI = vals.indexOf(today), st0 = 0;
    const markOn = () => { [...lst.children].forEach((c, i) => c.classList.toggle('on', i === pickI)); drum.setAttribute('aria-valuenow', String(vals[pickI])); drum.setAttribute('aria-valuetext', fmtW(vals[pickI])); delta.textContent = ''; const d = vals[pickI] - data[N - 2]; const b = el('b', d > 0 ? 'up' : '', (d > 0 ? '+' : '') + conv(Math.abs(d) * Math.sign(d) || 0).toFixed(1)); delta.append(b, document.createTextNode(' ' + (unit === 'st' ? 'kg' : unit) + ' since yesterday')); };
    lst.addEventListener('scroll', () => { clearTimeout(st0); const i = Math.round(lst.scrollTop / 44); if (i !== pickI && vals[i] != null) { pickI = i; markOn(); tone(1200, .01, 'square', .015); } st0 = setTimeout(() => { lst.scrollTo({ top: pickI * 44, behavior: 'smooth' }); }, 120); }, { passive: true });
    drum.addEventListener('keydown', e => { const d = { ArrowUp: -1, ArrowDown: 1, PageUp: -10, PageDown: 10 }[e.key]; if (!d) return; e.preventDefault(); pickI = Math.max(0, Math.min(vals.length - 1, pickI + d)); lst.scrollTop = pickI * 44; markOn(); });
    const delta = el('div', 'ww-delta'), save = el('button', 'ww-save', 'Save today'); save.type = 'button';
    save.addEventListener('click', () => { today = vals[pickI]; data[N - 1] = today; logged = true; save.textContent = '✓ Saved · ' + fmtW(today); save.classList.add('ok'); check('log'); tone(700, .06); setTimeout(() => tone(1000, .08), 80); say('Logged · trend ' + fmtW(ema(data)[N - 1])); });

    function sparks(a, col) { const sv = svgEl('svg', { viewBox: '0 0 300 44', 'aria-hidden': 'true' }), lo = Math.min(...a), hi = Math.max(...a), X = i => 4 + i / (a.length - 1) * 292, Y = v => 4 + (1 - (v - lo) / Math.max(.1, hi - lo)) * 36;
      sv.append(svgEl('path', { d: a.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' '), fill: 'none', stroke: col, 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })); a.forEach((v, i) => sv.append(svgEl('circle', { cx: X(i), cy: Y(v), r: i === a.length - 1 ? 4 : 2, fill: col }))); return sv; }
    function render() {
      unitEm.textContent = unit === 'st' ? 'kg' : unit;
      /* log */
      const lv = V.log; if (!lv.contains(drum)) { lv.textContent = ''; head(lv, new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }), unitSw()); lv.append(drum, delta, save); requestAnimationFrame(() => { lst.scrollTop = pickI * 44; markOn(); }); }
      else { lv.querySelector('.ww-u').replaceWith(unitSw()); markOn(); }
      /* trend */
      const tv = V.trend; tv.textContent = ''; head(tv, 'Last 60 days', unitSw()); const tr = ema(data), W = 320, Hh = 200, lo = Math.min(...data, goal) - .6, hi = Math.max(...data) + .6, X = i => 26 + i / (N - 1) * (W - 34), Y = v => 10 + (1 - (v - lo) / (hi - lo)) * (Hh - 30);
      const ch = el('div', 'ww-ch'), sv = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + Hh, role: 'img', 'aria-label': 'Weight over 60 days, trend ' + fmtW(tr[N - 1]) });
      [Math.ceil(lo), Math.round((lo + hi) / 2), Math.floor(hi)].forEach(v => { sv.append(svgEl('line', { x1: 26, x2: W - 8, y1: Y(v), y2: Y(v), stroke: '#F0F0EC' })); const t = svgEl('text', { x: 0, y: Y(v) + 3 }); t.textContent = conv(v).toFixed(unit === 'kg' ? 0 : 0); sv.append(t); });
      sv.append(svgEl('line', { x1: 26, x2: W - 8, y1: Y(goal), y2: Y(goal), stroke: '#FF6B4A', 'stroke-dasharray': '4 4' })); const gt = svgEl('text', { x: W - 40, y: Y(goal) - 4 }); gt.textContent = 'goal'; gt.setAttribute('fill', '#FF6B4A'); sv.append(gt);
      data.forEach((v, i) => sv.append(svgEl('circle', { cx: X(i).toFixed(1), cy: Y(v).toFixed(1), r: 2.4, fill: smooth ? '#C9C9C3' : '#111' })));
      if (smooth) { const p = svgEl('path', { d: tr.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' '), fill: 'none', stroke: '#0E7C66', 'stroke-width': 3, 'stroke-linecap': 'round' }); sv.append(p); if (G && !reduced) { const L = p.getTotalLength ? 600 : 600; p.style.strokeDasharray = L; p.style.strokeDashoffset = L; G.to(p.style, { strokeDashoffset: 0, duration: 1, ease: 'power2.out' }); } }
      ch.append(sv); const tg = el('button', 'ww-tg'); tg.type = 'button'; tg.setAttribute('role', 'switch'); tg.setAttribute('aria-checked', String(smooth)); tg.append(el('span', null, 'Show trend line'), el('i')); tg.addEventListener('click', () => { smooth = !smooth; check('trend'); render(); });
      const big = el('div', 'ww-big'), d30 = tr[N - 1] - tr[N - 31]; [[fmtW(tr[N - 1]), 'trend weight'], [(d30 < 0 ? '−' : '+') + conv(Math.abs(d30)).toFixed(1) + ' ' + (unit === 'st' ? 'kg' : unit), 'last 30 days']].forEach(([b, t]) => { const d = el('div'); d.append(el('b', null, b), el('span', null, t)); big.append(d); });
      tv.append(big, ch, tg);
      /* metrics */
      const mv = V.metrics; mv.textContent = ''; head(mv, 'Body');
      [['Waist', waist, 'cm', '#0E7C66', .5], ['Body fat', fat, '%', '#FF6B4A', .1]].forEach(([n, a, u, col, step]) => { const c = el('div', 'ww-met'), p = el('p'); p.append(document.createTextNode(n), el('b', null, a[a.length - 1].toFixed(1) + ' ' + u)); const stp = el('div', 'ww-step'), mi = el('button', null, '−' + step), pl = el('button', null, '+' + step), sv2 = el('button', null, 'Log');
        [mi, pl, sv2].forEach(b => { b.type = 'button'; }); mi.addEventListener('click', () => { a[a.length - 1] = +(a[a.length - 1] - step).toFixed(1); render(); }); pl.addEventListener('click', () => { a[a.length - 1] = +(a[a.length - 1] + step).toFixed(1); render(); }); sv2.addEventListener('click', () => { a.push(a[a.length - 1]); a.shift(); check('metric'); say(n + ' logged · ' + a[a.length - 1] + ' ' + u); tone(760, .05); render(); });
        mi.setAttribute('aria-label', 'Decrease ' + n); pl.setAttribute('aria-label', 'Increase ' + n); stp.append(mi, pl, sv2); c.append(p, sparks(a, col), stp); mv.append(c); });
      /* goal */
      const gv = V.goal; gv.textContent = ''; head(gv, 'Goal'); const rate = (tr[N - 31] - tr[N - 1]) / 30, left = tr[N - 1] - goal, days = rate > 0 ? Math.ceil(left / rate) : null, when = days != null && days > 0 ? new Date(Date.now() + days * 864e5) : null;
      const gc = el('div', 'ww-goal'); gc.append(el('small', null, 'GOAL'), el('b', null, fmtW(goal)), el('p', null, left <= 0 ? 'Goal reached. Nicely done.' : when ? 'At your current pace (' + conv(rate * 7).toFixed(2) + ' ' + (unit === 'st' ? 'kg' : unit) + ' a week) you will get there around ' + when.toLocaleDateString(undefined, { day: 'numeric', month: 'long' }) + '.' : 'Your trend is flat right now, so no date yet.'));
      const rg = el('input', 'ww-rng'); rg.type = 'range'; rg.min = 65; rg.max = 85; rg.step = .5; rg.value = goal; rg.setAttribute('aria-label', 'Goal weight'); rg.addEventListener('input', () => { goal = +rg.value; check('goal'); const lf = tr[N - 1] - goal, dy = rate > 0 ? Math.ceil(lf / rate) : null; gc.children[1].textContent = fmtW(goal); gc.children[2].textContent = lf <= 0 ? 'Goal reached. Nicely done.' : dy ? 'At your current pace you will get there around ' + new Date(Date.now() + dy * 864e5).toLocaleDateString(undefined, { day: 'numeric', month: 'long' }) + '.' : 'Your trend is flat right now, so no date yet.'; }); rg.addEventListener('change', () => { render(); }); gv.append(gc, rg);
    }
    nav.querySelector('[data-v="log"]').setAttribute('aria-selected', 'true'); render();
  }
  demo(H.app, H);
  H.boot();
})();
