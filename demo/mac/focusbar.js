/* Focusbar — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- Focusbar ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say, desk, extra, win } = H;
    const PRE = [[25, 5], [50, 10], [90, 20]];
    let heldTotal = 11, pre = 0, phase = 'idle', left = PRE[0][0] * 60, dnd = true, allowFav = true, task = 'Write chapter 3', held = [], sessions = [[9.0, 9.42, 'f'], [9.42, 9.5, 'b'], [9.5, 9.92, 'f'], [9.92, 10.0, 'b'], [10.6, 11.02, 'f'], [13.2, 13.62, 'f']], liveSeg = null, simMin = 0;
    const now0 = new Date(), dayH = () => Math.min(18.5, Math.max(8.5, now0.getHours() + now0.getMinutes() / 60)) + simMin / 60;
    const mmss = s2 => Math.floor(s2 / 60) + ':' + String(Math.floor(s2 % 60)).padStart(2, '0');
    /* ---- menu-bar extra ---- */
    const mx = el('button', 'fb-mx'), msv = svgEl('svg', { viewBox: '0 0 16 16', 'aria-hidden': 'true' }), mfg = svgEl('circle', { cx: 8, cy: 8, r: 6, fill: 'none', stroke: '#111', 'stroke-width': 2.4, 'stroke-dasharray': '37.7', 'stroke-dashoffset': '0' }), mt = el('span'), moon = el('span', 'fb-moon', '☾'), bd = el('span', 'bd');
    msv.append(svgEl('circle', { cx: 8, cy: 8, r: 6, fill: 'none', stroke: 'rgba(0,0,0,.2)', 'stroke-width': 2.4 }), mfg); mx.append(msv, mt, moon, bd); mx.type = 'button'; mx.setAttribute('aria-haspopup', 'true'); mx.setAttribute('aria-expanded', 'false'); extra.append(mx);
    let dd = null, R = {};
    function openDD(auto) { if (dd) { closeDD(); return; } if (!auto) check('menu'); if (hint) { hint.remove(); hint = null; } dd = el('div', 'fb-dd'); dd.setAttribute('role', 'dialog'); dd.setAttribute('aria-label', 'Focusbar'); const r = mx.getBoundingClientRect(), dr = desk.getBoundingClientRect(), sc = dr.width / 1200; dd.style.left = Math.min(1200 - 334, (r.left - dr.left) / sc - 150) + 'px'; desk.append(dd); mx.setAttribute('aria-expanded', 'true'); buildDD(); if (G && !reduced) G.from(dd, { opacity: 0, y: -6, scale: .97, transformOrigin: '50% 0', duration: .22 }); }
    function closeDD() { if (!dd) return; dd.remove(); dd = null; mx.setAttribute('aria-expanded', 'false'); }
    function buildDD() { dd.textContent = ''; const ring = el('div', 'fb-ring'), sv = svgEl('svg', { viewBox: '0 0 170 170', 'aria-hidden': 'true' }), C = 2 * Math.PI * 76, fg = svgEl('circle', { class: 'fg', cx: 85, cy: 85, r: 76, 'stroke-dasharray': C.toFixed(1) }); sv.append(svgEl('circle', { class: 'bg', cx: 85, cy: 85, r: 76 }), fg); const mid = el('div'), tb = el('b'), ts = el('small'); mid.append(tb, ts); ring.append(sv, mid); dd.append(ring);
      const pr = el('div', 'fb-pre'); PRE.forEach(([f, b], i) => { const x = el('button', null, f + '/' + b); x.type = 'button'; x.setAttribute('aria-pressed', String(i === pre)); x.addEventListener('click', () => { if (phase !== 'idle') { say('Stop the session to change the rhythm'); return; } pre = i; left = f * 60; buildDD(); paint(); }); pr.append(x); }); dd.append(pr);
      const inp = el('input', 'fb-task'); inp.type = 'text'; inp.maxLength = 60; inp.value = task; inp.placeholder = 'What are you working on?'; inp.setAttribute('aria-label', 'Task name'); inp.addEventListener('input', () => { task = inp.value; }); dd.append(inp);
      const ctl = el('div', 'fb-ctl'), go = el('button', 'fb-go'), sk = el('button', 'fb-sk', '⏭'); go.type = sk.type = 'button'; sk.setAttribute('aria-label', 'Skip to next phase'); go.addEventListener('click', toggle); sk.addEventListener('click', skip); ctl.append(go, sk); dd.append(ctl);
      const tg = (label, sub, get, set2) => { const r = el('div', 'fb-row'), t = el('span'), b = el('button', 'fb-tg'); b.type = 'button'; b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', String(get())); b.setAttribute('aria-label', label); t.append(document.createTextNode(label), el('small', null, sub)); b.addEventListener('click', () => { set2(!get()); b.setAttribute('aria-checked', String(get())); tone(get() ? 800 : 500, .02); paint(); }); r.append(t, b); dd.append(r); };
      tg('Do Not Disturb while focusing', 'Syncs with the Focus mode', () => dnd, v => { dnd = v; }); tg('Let favourites call through', 'Calls from Favourites still ring', () => allowFav, v => { allowFav = v; });
      const st = el('button', 'fb-lnk', 'Today’s stats…'); st.type = 'button'; st.addEventListener('click', () => { closeDD(); showStats(); }); dd.append(st); R = { fg, C, tb, ts, go }; paint(); }
    mx.addEventListener('click', e => { e.stopPropagation(); openDD(); }); desk.addEventListener('click', e => { const p = e.composedPath();  });
    /* ---- engine (1 s = 1 min) ---- */
    const total = () => (phase === 'break' ? PRE[pre][1] : PRE[pre][0]) * 60;
    function toggle() { if (phase === 'idle') { phase = 'focus'; left = PRE[pre][0] * 60; liveSeg = [dayH(), dayH(), 'f']; sessions.push(liveSeg); check('start'); tone(660, .06); setTimeout(() => tone(990, .08), 110); say('Focus on: ' + (task || 'your task') + (dnd ? ' · notifications held' : '')); }
      else if (phase === 'focus' || phase === 'break') { phase = phase + '-p'; say('Paused'); } else phase = phase.replace('-p', ''); paint(); }
    function skip() { if (phase.startsWith('focus')) startBreak(); else if (phase.startsWith('break')) endBreak(); }
    function startBreak() { phase = 'break'; left = PRE[pre][1] * 60; liveSeg = [dayH(), dayH(), 'b']; sessions.push(liveSeg); tone(523, .1); setTimeout(() => tone(659, .1), 150); setTimeout(() => tone(784, .14), 300); release(); showBreak(); paint(); }
    function endBreak() { hideBreak(); phase = 'idle'; left = PRE[pre][0] * 60; liveSeg = null; tone(880, .05); say('Break over. Ready when you are'); paint(); }
    setInterval(() => { if (phase === 'focus' || phase === 'break') { left -= 15; simMin += .25; if (liveSeg) liveSeg[1] = dayH(); if (left <= 0) { if (phase === 'focus') startBreak(); else endBreak(); } paint(); } }, 250);
    /* ---- notifications ---- */
    const NOTES = [['Slack', '#611F69', 'S', '#design · Priya', 'Can you look at the new onboarding flow?'], ['Mail', '#2D8CFF', '✉', 'Invoice #2291', 'Your invoice from Studio North is ready.'], ['Messages', '#34C759', '✆', 'Sam', 'lunch at 1? 🍜'], ['Calendar', '#E5533D', '▦', 'Design review', 'Starts in 15 minutes'], ['GitHub', '#24292F', 'G', 'PR #482 approved', 'jonah approved your pull request'], ['FaceTime', '#30C85E', '☏', 'Mum · Favourite', 'Incoming call', true]];
    let ni = 0, banners = [];
    function notify() { const [app2, c, ic, t, body, fav] = NOTES[ni++ % NOTES.length], focusing = phase.startsWith('focus') && dnd;
      if (focusing && !(fav && allowFav)) { held.push([app2, c, ic, t, body]); heldTotal++; check('dnd'); const g = el('i', 'fb-ghost'); g.style.setProperty('--c', c); g.style.right = '160px'; g.style.top = '60px'; desk.append(g); const r = mx.getBoundingClientRect(), dr = desk.getBoundingClientRect(), sc = dr.width / 1200;
        if (G && !reduced) G.to(g, { right: 1200 - ((r.left - dr.left) / sc + 10), top: 2, scale: .4, opacity: .2, duration: .7, ease: 'power2.in', onComplete: () => g.remove() }); setTimeout(() => g.remove(), 800); tone(300, .02, 'sine', .015); paint(); return; }
      banner([app2, c, ic, t, body], fav && focusing ? 'Breaks through: Favourite' : null); }
    function banner(n, why) { const [app2, c, ic, t, body] = n, b = el('div', 'fb-nt'), i = el('i', null, ic), m = el('div'); i.style.setProperty('--c', c); m.append(el('b', null, t), el('p', null, why ? why + ' · ' + body : body)); b.append(i, m, el('small', null, 'now')); b.setAttribute('role', 'status'); b.style.top = (36 + banners.length * 74) + 'px'; desk.append(b); banners.push(b);
      if (G && !reduced) G.from(b, { x: 360, duration: .45, ease: 'expo.out' }); tone(1200, .03, 'sine', .02); setTimeout(() => { b.remove(); banners = banners.filter(x => x !== b); banners.forEach((x, k) => { x.style.top = (36 + k * 74) + 'px'; }); }, 3200); }
    function release() { if (!held.length) return; const n = held.length; held.slice(0, 3).forEach((h, k) => setTimeout(() => banner(h), 300 + k * 350)); say(n + (n === 1 ? ' notification' : ' notifications') + ' arrived during your break'); held = []; }
    setInterval(notify, reduced ? 6000 : 4200);
    /* ---- break overlay ---- */
    let brk = null, bT = null;
    function showBreak() { check('break'); closeDD(); brk = el('div', 'fb-brk'); brk.setAttribute('role', 'dialog'); brk.setAttribute('aria-label', 'Break'); bT = el('b'); const row = el('div'), sk = el('button', null, 'Skip break'), pl = el('button', null, '+1 min'); sk.type = pl.type = 'button'; sk.addEventListener('click', endBreak); pl.addEventListener('click', () => { left += 60; paint(); }); row.append(pl, sk);
      brk.append(el('small', null, 'Break'), bT, el('i', 'orb'), el('p', null, 'Stand up. Look at something 6 metres away.'), el('em', null, 'Breathe with the circle'), row); desk.append(brk); if (G && !reduced) G.from(brk, { opacity: 0, duration: .5 }); }
    function hideBreak() { if (!brk) return; const b = brk; brk = null; if (G && !reduced) G.to(b, { opacity: 0, duration: .3, onComplete: () => b.remove() }); else b.remove(); }
    /* ---- stats window ---- */
    const root = el('div', 'fb'); app.append(root); const ttl = win.querySelector('.ttl'); if (ttl) ttl.textContent = 'Focusbar · Today';
    let statsOn = false; function showStats() { statsOn = true; check('stats'); win.style.visibility = 'visible'; if (G && !reduced) G.fromTo(win, { scale: .94, opacity: 0 }, { scale: 1, opacity: 1, duration: .35, ease: 'back.out(1.6)' }); paintStats(); }
    function paintStats() { root.textContent = ''; const fm = sessions.filter(x => x[2] === 'f').reduce((a, x) => a + (x[1] - x[0]) * 60, 0), cnt = sessions.filter(x => x[2] === 'f' && x[1] - x[0] > .25).length;
      root.append(el('h2', null, 'Today'), el('p', null, task ? 'Current task: ' + task : 'No task set')); const tot = el('div', 'fb-tot'), cell = (b, sp) => { const d = el('div'); d.append(el('b', null, b), el('span', null, sp)); tot.append(d); }; cell(Math.floor(fm / 60) + 'h ' + Math.round(fm % 60) + 'm', 'focused'); cell(String(cnt), 'sessions'); cell(String(heldTotal), 'notifications held'); root.append(tot);
      const tl = el('div', 'fb-tl'), X = h => (h - 8) / 11 * 100; sessions.forEach(x => { const i = el('i', x[2] === 'b' ? 'br' : null); i.style.left = X(x[0]) + '%'; i.style.width = Math.max(.6, X(x[1]) - X(x[0])) + '%'; if (x === liveSeg) i.classList.add('live'); tl.append(i); }); const u = el('u'); u.style.left = X(dayH()) + '%'; tl.append(u); tl.setAttribute('role', 'img'); tl.setAttribute('aria-label', 'Timeline of today’s focus sessions');
      const tll = el('div', 'fb-tll'); ['08:00', '11:00', '14:00', '17:00', '19:00'].forEach(t => tll.append(el('span', null, t))); root.append(tl, tll);
      const hm = el('div', 'fb-hm'); for (let i = 0; i < 49; i++) { const c = el('i'), l = i === 48 ? Math.min(4, cnt) : (i * 7 + 3) % 11 < 2 ? 0 : 1 + ((i * 13) % 4); c.dataset.l = String(l); if (i === 48) c.classList.add('today'); c.title = l + ' sessions'; hm.append(c); } const hl = el('div', 'fb-hl'); hl.append(el('span', null, '7 weeks'), el('span', null, '12 day streak')); root.append(hm, hl); }
    win.style.visibility = 'hidden';
    let hint = el('div', 'fb-hint', 'Focusbar lives up here in the menu bar'); desk.append(hint); requestAnimationFrame(() => { const r = mx.getBoundingClientRect(), dr = desk.getBoundingClientRect(), sc = dr.width / 1200; if (hint) hint.style.right = Math.max(8, 1200 - ((r.right - dr.left) / sc) - 10) + 'px'; });
    /* ---- paint ---- */
    function paint() { const run = phase === 'focus' || phase === 'break', brkP = phase.startsWith('break'), frac = phase === 'idle' ? 1 : left / total(); mt.textContent = phase === 'idle' ? '' : mmss(left); mfg.setAttribute('stroke-dashoffset', (37.7 * (1 - frac)).toFixed(1)); mfg.setAttribute('stroke', brkP ? '#4C6EF5' : '#111');
      moon.hidden = !(phase.startsWith('focus') && dnd); bd.hidden = !held.length; bd.textContent = String(held.length); mx.setAttribute('aria-label', 'Focusbar ' + (phase === 'idle' ? 'idle' : phase + ' ' + mmss(left)) + (held.length ? ', ' + held.length + ' held' : ''));
      if (dd && R.fg) { R.fg.setAttribute('stroke-dashoffset', (R.C * (1 - frac)).toFixed(1)); dd.style.setProperty('--rc', brkP ? '#4C6EF5' : '#E5533D'); R.tb.textContent = mmss(left); R.ts.textContent = phase === 'idle' ? 'ready' : (brkP ? 'break' : 'focus') + (run ? '' : ' · paused'); R.go.textContent = phase === 'idle' ? 'Start focus' : run ? 'Pause' : 'Resume'; R.go.classList.toggle('pz', phase !== 'idle'); }
      if (brk && bT) bT.textContent = mmss(left); if (statsOn) paintStats(); }
    H.jump = (k, fs) => { if (fs) return; if (k === 'menu') openDD(); else if (k === 'start') { if (!dd) openDD(); if (phase === 'idle') toggle(); } else if (k === 'stats') { closeDD(); showStats(); } };
    paint();
    setTimeout(() => { if (!dd) openDD(true); }, 900);
  }
  demo(H.app, H);
  H.boot();
})();
