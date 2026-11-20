/* CommuteSense — Android app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- CommuteSense ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const M = {"key":"cs_state_v1","stops":["Harbour Rd","Mill St","Market Sq","Station","University","Science Park"],"from":"Mill St","to":"Science Park","reasons":["Signal fault near Market Sq","Heavy boarding at Station","Roadworks on the bridge","Driver change at the depot","Running to time"],"routes":[["Tram 12","Walk 4 · Tram 12 · Walk 3",26,"#E89A00"],["Bus 40 + Tram 9","Walk 2 · Bus 40 · Tram 9",29,"#3DD6D0"],["Cycle hire","Dock to dock along the river",31,"#7C83FD"]]};
    const saved = store.get(M.key, null) || {};
    let route = Number.isInteger(saved.route) && saved.route >= 0 && saved.route < M.routes.length ? saved.route : 0, alert = saved.alert === true;
    const save = () => store.set(M.key, { route, alert });
    const delay = M.stops.slice(1).map(() => Math.random() * 4); let leave = 6 * 60, conf = 72;
    const root = el('div', 'cs'), V = {}, order = ['home', 'map', 'routes', 'alerts'];
    order.forEach(k => { V[k] = el('section', 'cs-v'); V[k].setAttribute('aria-label', k); if (k !== 'home') V[k].hidden = true; root.append(V[k]); });
    const nav = el('nav', 'cs-nav'); [['home', '⏱', 'Leave'], ['map', '🚋', 'Line'], ['routes', '⇄', 'Routes'], ['alerts', '🔔', 'Alerts']].forEach(([k, ic, t]) => { const b = el('button'); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.append(el('span', null, ic), document.createTextNode(t)); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(nav); app.append(root);
    let cur = 'home';
    function go(k, fromScroll) { if (k === cur || !V[k]) return; const a = V[cur], b = V[k], dir = order.indexOf(k) > order.indexOf(cur) ? 1 : -1; b.hidden = false; nav.querySelectorAll('button').forEach(x => x.setAttribute('aria-selected', String(x.dataset.v === k)));
      const ak = cur; if (G) { G.killTweensOf(b); G.fromTo(b, { x: 40 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: .4, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .15, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true;
      cur = k; if (k === 'home') check('leave'); if (!fromScroll) haptic(5); }
    H.jump = (k, fromScroll) => go(k, fromScroll);
    const head = (k, t, sub) => { const h = el('div', 'cs-h'), d = el('div'); d.append(el('small', null, sub), el('h2', null, t)); h.append(d); V[k].append(h); return h; };
    const totalDelay = () => delay.slice(1, 5).reduce((a, x) => a + x, 0);

    /* ---- home: leave-by ring ---- */
    const hh = head('home', 'Leave by', M.from + ' → ' + M.to), ref = el('button', 'cs-ref', '↻'); ref.type = 'button'; ref.setAttribute('aria-label', 'Refresh prediction'); hh.append(ref);
    const ring = el('div', 'cs-ring'), rs = svgEl('svg', { viewBox: '0 0 220 220', 'aria-hidden': 'true' }), C = 2 * Math.PI * 96, arc = svgEl('circle', { cx: 110, cy: 110, r: 96, class: 'ar', 'stroke-dasharray': C.toFixed(1) });
    rs.append(svgEl('circle', { cx: 110, cy: 110, r: 96, class: 'tr' }), arc); const rin = el('div', 'cs-rin'), rd = el('div'), rb = el('b'), rsub = el('span'); rd.append(el('small', null, 'Leave in'), rb, rsub); rin.append(rd); ring.append(rs, rin);
    const leg = el('div', 'cs-leg'), risk = el('div', 'cs-risk'), rp = el('p'), rbar = el('div', 'bar'), rbi = el('i'), rsm = el('small'); rbar.append(rbi); risk.append(rp, rbar, rsm);
    V.home.append(ring, leg, risk);
    function renderHome() {
      const mm = Math.max(0, Math.floor(leave / 60)), ss = leave % 60; rb.textContent = mm + ':' + String(ss).padStart(2, '0');
      const arrive = new Date(Date.now() + (leave + M.routes[route][2] * 60 + totalDelay() * 60) * 1000); rsub.textContent = 'arrive ' + arrive.getHours() + ':' + String(arrive.getMinutes()).padStart(2, '0');
      arc.setAttribute('stroke-dashoffset', (C * (1 - leave / (12 * 60))).toFixed(1)); arc.style.stroke = leave < 120 ? '#F04438' : '#E89A00';
      leg.textContent = ''; M.routes[route][1].split(' · ').forEach((p, i) => { if (i) leg.append(el('em', null, '›')); leg.append(el('i', /Tram|Bus/.test(p) ? 'tr' : '', p)); });
      const d = totalDelay(); rp.textContent = ''; rp.append(document.createTextNode('Likely delay on your line'), el('b', null, '+' + d.toFixed(0) + ' min')); rbi.style.width = Math.min(100, d / 12 * 100) + '%'; rsm.textContent = conf + '% confident · ' + M.reasons[Math.floor(d) % (M.reasons.length - 1)];
    }
    ref.addEventListener('click', () => { ref.classList.remove('spin'); void ref.offsetWidth; ref.classList.add('spin'); live(true); check('refresh'); say('Fresh prediction from 14 live trams'); });

    /* ---- map ---- */
    head('map', 'Tram 12', 'live · ' + M.stops.length + ' stops');
    const mp = el('div', 'cs-map'), ms = svgEl('svg', { viewBox: '0 0 320 420', role: 'img', 'aria-label': 'Live line map of Tram 12' }), why = el('div', 'cs-why'), key = el('div', 'cs-key');
    const pts = M.stops.map((_, i) => [i % 2 ? 210 : 110, 40 + i * 66]); const segs = [], trams = [];
    pts.slice(1).forEach((p, i) => { const a = pts[i], l = svgEl('path', { d: 'M' + a[0] + ' ' + a[1] + ' C' + a[0] + ' ' + (a[1] + 40) + ' ' + p[0] + ' ' + (p[1] - 40) + ' ' + p[0] + ' ' + p[1], class: 'seg', fill: 'none', tabindex: '0', role: 'button' });
      l.addEventListener('click', () => pick(i)); l.addEventListener('keydown', e => { if (e.key === 'Enter') pick(i); }); ms.append(l); segs.push(l); });
    pts.forEach((p, i) => { ms.append(svgEl('circle', { cx: p[0], cy: p[1], r: 9, class: 'stop' + (M.stops[i] === M.from ? ' me' : '') })); const t = svgEl('text', { x: p[0] + (i % 2 ? 16 : -16), y: p[1] + 4, 'text-anchor': i % 2 ? 'start' : 'end' }); t.textContent = M.stops[i]; ms.append(t); });
    for (let i = 0; i < 3; i++) { const t = svgEl('circle', { r: 7, class: 'tram' }); ms.append(t); trams.push({ el: t, p: i / 3 }); }
    [['#3DD6D0', 'on time'], ['#E89A00', '2–5 min late'], ['#F04438', '5+ min']].forEach(([c, t]) => { const sp = el('span', null, t); sp.style.setProperty('--c', c); key.append(sp); });
    why.textContent = 'Tap a stretch of line to see what is slowing it down.'; mp.append(ms); V.map.append(mp, why, key);
    const segCol = d => d < 2 ? '#3DD6D0' : d < 5 ? '#E89A00' : '#F04438';
    function pick(i) { const d = delay[i]; why.textContent = ''; why.append(el('b', null, M.stops[i] + ' → ' + M.stops[i + 1] + ': '), document.createTextNode(d < 2 ? 'running to time' : '+' + d.toFixed(1) + ' min · ' + M.reasons[i % (M.reasons.length - 1)])); check('seg'); tone(500 + d * 60, .05);
      if (G) G.fromTo(segs[i], { attr: { 'stroke-width': 14 } }, { attr: { 'stroke-width': 8 }, duration: .6 }); }
    function paintMap() { segs.forEach((l, i) => { l.style.stroke = segCol(delay[i]); l.setAttribute('aria-label', M.stops[i] + ' to ' + M.stops[i + 1] + ', ' + (delay[i] < 2 ? 'on time' : Math.round(delay[i]) + ' minutes late')); }); }
    let lt = performance.now();
    function animTrams(now) { const dt = (now - lt) / 1000; lt = now; trams.forEach(t => { const seg = Math.min(segs.length - 1, Math.floor(t.p * segs.length)), slow = 1 / (1 + delay[seg] * .25); t.p = (t.p + dt * .025 * slow) % 1;
      const f = t.p * segs.length - seg, L = segs[seg].getTotalLength(), q = segs[seg].getPointAtLength(f * L); t.el.setAttribute('cx', q.x.toFixed(1)); t.el.setAttribute('cy', q.y.toFixed(1)); });
      if (!reduced) requestAnimationFrame(animTrams); }

    /* ---- routes ---- */
    head('routes', 'Routes', 'ranked by predicted arrival'); const rl = el('div'); V.routes.append(rl);
    function renderRoutes() { rl.textContent = ''; const d = totalDelay();
      M.routes.map((r, i) => ({ r, i, eta: r[2] + (i === 0 ? d : i === 1 ? d * .35 : 0), c: Math.max(40, Math.round((i === 0 ? conf : 88 - i * 6) - (i === 0 ? d * 2 : 0))) })).sort((a, b) => a.eta - b.eta)
        .forEach(({ r, i, eta, c }) => { const b = el('button', 'cs-rt'), ic = el('i'), mid = el('div'), et = el('div', 'eta'), cf = el('span', 'conf'), ce = el('em'); b.type = 'button'; ic.style.setProperty('--c', r[3]); mid.append(el('b', null, r[0]), el('small', null, r[1]));
          ce.style.width = c + '%'; cf.append(ce); et.append(el('b', null, Math.round(eta) + ' min'), cf, el('small', null, c + '% sure')); b.append(ic, mid, et); b.setAttribute('aria-pressed', String(i === route));
          b.addEventListener('click', () => { route = i; save(); renderRoutes(); renderHome(); if (i !== 0) check('route'); say('Switched to ' + r[0]); tone(700, .06); }); rl.append(b); }); }

    /* ---- alerts ---- */
    head('alerts', 'Alerts', 'one nudge per trip'); const sw = el('button', 'cs-sw'), st = el('span'); sw.type = 'button'; sw.setAttribute('role', 'switch'); st.append(document.createTextNode('Tell me when to leave'), el('small', null, '5 minutes before, updated if the delay changes')); sw.append(st, el('i')); V.alerts.append(sw);
    [['Morning commute', 'Mon–Fri · leaves around 08:10'], ['Evening home', 'Mon–Thu · leaves around 17:40']].forEach(([a, b]) => { const r = el('div', 'cs-sw'), t = el('span'); t.append(document.createTextNode(a), el('small', null, b)); r.append(t); V.alerts.append(r); });
    sw.addEventListener('click', () => { alert = !alert; save(); sw.setAttribute('aria-checked', String(alert)); if (alert) { check('alert'); setTimeout(notify, 1200); } });
    function notify() { const n = el('div', 'cs-note'), t = el('div'); t.append(el('b', null, 'Leave in 5 minutes'), el('span', null, 'Tram 12 is running ' + totalDelay().toFixed(0) + ' min late. You will still make the 08:41.')); n.append(el('i', null, 'CS'), t); n.setAttribute('role', 'status'); root.append(n); tone(880, .1); haptic(20);
      if (G) { G.from(n, { y: -80, opacity: 0, duration: .5, ease: 'back.out(1.6)' }); G.to(n, { y: -80, opacity: 0, duration: .4, delay: 4, onComplete: () => n.remove() }); } else setTimeout(() => n.remove(), 4500); }

    /* ---- live updates ---- */
    function live(force) { delay.forEach((d, i) => { delay[i] = Math.max(0, Math.min(9, d + (Math.random() - .45) * (force ? 3 : 1.4))); }); conf = Math.round(66 + Math.random() * 20); paintMap(); renderHome(); renderRoutes(); }
    setInterval(() => { leave = leave > 0 ? leave - 1 : 12 * 60; renderHome(); }, 1000); setInterval(() => live(false), 7000);
    sw.setAttribute('aria-checked', String(alert)); nav.querySelector('[data-v="home"]').setAttribute('aria-selected', 'true'); paintMap(); renderHome(); renderRoutes(); requestAnimationFrame(animTrams);
  }
  demo(H.app, H);
  H.boot();
})();
