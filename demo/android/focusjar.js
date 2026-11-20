/* FocusJar — Android app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "poster";
/* ---------- FocusJar ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const M = {"key":"fj_state_v1","tags":[["Writing","#D9662B"],["Study","#4C7BD9"],["Code","#5B8C5A"],["Design","#B4529C"]],"week":[[["Writing",25],["Code",50]],[["Study",25]],[["Code",25],["Design",25],["Writing",15]],[],[["Study",50]],[["Design",25]]]};
    const saved = store.get(M.key, null) || {};
    const S = { len: [15, 25, 50].includes(saved.len) ? saved.len : 25, brk: [5, 10].includes(saved.brk) ? saved.brk : 5, fast: saved.fast !== false, sound: saved.sound !== false, dnd: saved.dnd !== false, tag: Number.isInteger(saved.tag) && saved.tag >= 0 && saved.tag < M.tags.length ? saved.tag : 0 };
    const save = () => store.set(M.key, S);
    const today = new Date().getDay() || 7; const week = M.week.map(d => d.slice()); while (week.length < 7) week.push([]); const todayIdx = Math.min(6, today - 1);
    let elapsed = 0, running = false, paused = false, sealed = false, lidY = -60, onBreak = false;

    const root = el('div', 'fj'), tabs = el('div', 'fj-tabs'), pill = el('i'), V = {};
    ['timer', 'shelf', 'settings'].forEach(k => { V[k] = el('section', 'fj-v'); V[k].setAttribute('aria-label', k); if (k !== 'timer') V[k].hidden = true; root.append(V[k]); const b = el('button', null, k[0].toUpperCase() + k.slice(1)); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.addEventListener('click', () => go(k)); tabs.append(b); });
    tabs.prepend(pill); root.append(tabs); app.append(root);
    let cur = 'timer';
    function movePill() { const b = tabs.querySelector('[data-v="' + cur + '"]'); pill.style.left = b.offsetLeft + 'px'; pill.style.width = b.offsetWidth + 'px'; tabs.querySelectorAll('button').forEach(x => x.setAttribute('aria-selected', String(x.dataset.v === cur))); }
    function go(k) { if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; movePill(); if (k === 'shelf') { renderShelf(); check('shelf'); }
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { scale: .96, opacity: 0 }, { scale: 1, opacity: 1, duration: .35, ease: 'back.out(1.4)' }); G.to(a, { opacity: 0, duration: .12, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; haptic(5); }
    H.jump = go;

    /* ---- timer view ---- */
    const tags = el('div', 'fj-tags'); M.tags.forEach(([n, c], i) => { const b = el('button'), d = el('i'); b.type = 'button'; b.style.setProperty('--c', c); b.append(d, document.createTextNode(n)); b.addEventListener('click', () => { S.tag = i; save(); syncTags(); check('tag'); tone(520 + i * 80, .05); }); tags.append(b); });
    const cv = el('canvas', 'fj-jar'), tm = el('div', 'fj-time'), st = el('div', 'fj-st'), ctl = el('div', 'fj-ctl'), rst = el('button', 'fj-sm', '■'), goB = el('button', 'fj-go', '▶'), fast = el('button', 'fj-sm'); fast.append(el('small', null, '×60'));
    cv.setAttribute('role', 'img'); [rst, goB, fast].forEach(b => { b.type = 'button'; }); rst.setAttribute('aria-label', 'Stop session'); fast.setAttribute('aria-label', 'Demo speed, 60 times faster');
    ctl.append(rst, goB, fast); V.timer.append(tags, cv, tm, st, ctl);
    function syncTags() { tags.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === S.tag))); }

    /* ---- the jar: precomputed marble slots inside a jar outline ---- */
    const W = 280, Hh = 330, dpr = window.devicePixelRatio || 1, ctx = cv.getContext('2d'); cv.width = W * dpr; cv.height = Hh * dpr; ctx.scale(dpr, dpr);
    const jl = 52, jr = 228, jt = 70, jb = 312, R = 12.5;
    const halfAt = y => y < jt + 26 ? 70 : 88 - Math.max(0, (y - (jb - 40)) / 40) * 6;
    const slots = []; for (let row = 0, y = jb - R - 4; y > jt + 30; row++, y -= R * 1.74) { const hw = halfAt(y) - R - 2; for (let x = 140 - hw + (row % 2 ? R : 0); x <= 140 + hw; x += R * 2.02) slots.push([x + (Math.random() - .5) * 1.5, y]); }
    const marbles = [];
    const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, k = v => Math.max(0, Math.min(255, Math.round(v * f))); return 'rgb(' + k(r) + ',' + k(g) + ',' + k(b) + ')'; };
    function drop() { const sl = slots[marbles.length]; if (!sl) return; const c = M.tags[S.tag][1]; marbles.push({ x: sl[0] + (Math.random() - .5) * 30, y: jt - 20, tx: sl[0], ty: sl[1], vy: 0, c, f: .85 + Math.random() * .3, done: reduced }); if (S.sound) tone(900 + Math.random() * 400, .05, 'triangle', .03); }
    function jarPath() { ctx.beginPath(); ctx.moveTo(140 - 70, jt); ctx.lineTo(140 - 70, jt + 18); ctx.quadraticCurveTo(140 - 88, jt + 34, 140 - 88, jt + 70); ctx.lineTo(140 - 88, jb - 30); ctx.quadraticCurveTo(140 - 88, jb, 140 - 58, jb); ctx.lineTo(140 + 58, jb); ctx.quadraticCurveTo(140 + 88, jb, 140 + 88, jb - 30); ctx.lineTo(140 + 88, jt + 70); ctx.quadraticCurveTo(140 + 88, jt + 34, 140 + 70, jt + 18); ctx.lineTo(140 + 70, jt); }
    function draw() {
      ctx.clearRect(0, 0, W, Hh);
      ctx.save(); jarPath(); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(); ctx.clip();
      marbles.forEach(mb => { if (!mb.done) { mb.vy += .55; mb.y += mb.vy; mb.x += (mb.tx - mb.x) * .12; if (mb.y >= mb.ty) { mb.y = mb.ty; mb.vy *= -.32; if (Math.abs(mb.vy) < .8) { mb.done = true; mb.x = mb.tx; } } }
        const g = ctx.createRadialGradient(mb.x - 3, mb.y - 3, 1, mb.x, mb.y, R); g.addColorStop(0, '#fff'); g.addColorStop(.25, shade(mb.c, mb.f * 1.15)); g.addColorStop(1, shade(mb.c, mb.f * .7)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mb.x, mb.y, R, 0, 7); ctx.fill(); });
      ctx.restore();
      jarPath(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(120,96,70,.55)'; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.moveTo(140 - 74, jt + 90); ctx.lineTo(140 - 74, jb - 50); ctx.stroke();
      if (sealed || lidY > -60) { const y = jt - 22 + (sealed ? Math.min(0, lidY) : lidY); ctx.fillStyle = '#B5652F'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(140 - 80, y, 160, 24, 7) : ctx.rect(140 - 80, y, 160, 24); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(140 - 72, y + 5, 144, 3); }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    /* ---- timekeeping ---- */
    const total = () => (onBreak ? S.brk : S.len) * 60 * 1000;
    const fmt = ms => { const s0 = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(s0 / 60)).padStart(2, '0') + ':' + String(s0 % 60).padStart(2, '0'); };
    let last = performance.now();
    function loop() { const now = performance.now(), dt = Math.min(5000, now - last); last = now;
      if (running) { elapsed += dt * (S.fast ? 60 : 1); const p = Math.min(1, elapsed / total());
        if (!onBreak) { const want = Math.floor(elapsed / 60000); const before = marbles.length; while (marbles.length < Math.min(slots.length, want)) drop(); if (marbles.length !== before) cv.setAttribute('aria-label', marbles.length + ' marbles in the jar'); }
        if (p >= 1) finish(); }
      tm.textContent = fmt(total() - elapsed); }
    setInterval(loop, 200);
    function sync() { goB.textContent = running ? '❚❚' : '▶'; goB.classList.toggle('run', running); goB.setAttribute('aria-label', running ? 'Pause' : 'Start'); fast.setAttribute('aria-pressed', String(S.fast)); cv.setAttribute('aria-label', marbles.length + ' marbles in the jar' + (sealed ? ', sealed' : ''));
      st.textContent = onBreak ? (running ? 'Break · stretch, drink some water' : 'Break ready') : running ? 'Focusing on ' + M.tags[S.tag][0] + (S.dnd ? ' · Do Not Disturb on' : '') : paused ? 'Paused' : sealed ? 'Jar sealed. Nice work.' : S.len + ' minute session · ' + M.tags[S.tag][0]; }
    goB.addEventListener('click', () => {
      if (sealed && !onBreak) { reset(); }
      if (running) { running = false; paused = true; say('Paused'); } else { if (paused) check('pause'); running = true; paused = false; if (!onBreak) check('start'); tone(660, .07); }
      haptic(10); sync(); });
    rst.addEventListener('click', () => { reset(); say('Session cleared'); });
    fast.addEventListener('click', () => { S.fast = !S.fast; save(); sync(); say(S.fast ? 'Demo speed: a minute every second' : 'Real time'); });
    function reset() { running = false; paused = false; sealed = false; onBreak = false; elapsed = 0; marbles.length = 0; lidY = -60; sync(); }
    function finish() {
      running = false; elapsed = total();
      if (onBreak) { onBreak = false; reset(); say('Break over. Ready for the next jar?'); return; }
      sealed = true; lidY = -60; if (G) G.to({ v: -60 }, { v: 0, duration: .7, ease: 'bounce.out', onUpdate() { lidY = this.targets()[0].v; } }); else lidY = 0;
      week[todayIdx].push([M.tags[S.tag][0], S.len]); check('seal'); tone(784, .1); setTimeout(() => tone(1046, .14), 140); haptic(30); say('Jar sealed · ' + S.len + ' focused minutes on ' + M.tags[S.tag][0]);
      setTimeout(() => { onBreak = true; elapsed = 0; sync(); }, 2200); sync();
    }

    /* ---- shelf ---- */
    function miniJar(c, min) { const sv = svgEl('svg', { viewBox: '0 0 30 44', 'aria-hidden': 'true' }), f = min / 50, h = 34 * f;
      sv.append(svgEl('rect', { x: 4, y: 40 - h, width: 22, height: h, rx: 3, fill: c, opacity: .85 }), svgEl('path', { d: 'M5 8 V36 Q5 41 10 41 H20 Q25 41 25 36 V8', fill: 'none', stroke: 'rgba(120,96,70,.6)', 'stroke-width': 2 }), svgEl('rect', { x: 3, y: 3, width: 24, height: 6, rx: 2, fill: '#B5652F' })); return sv; }
    function renderShelf() {
      const v = V.shelf; v.textContent = ''; const mins = week.flat().reduce((a, x) => a + x[1], 0), sum = el('div', 'fj-sum'); sum.append(el('b', null, Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm'), el('span', null, 'focused this week · ' + week.flat().length + ' jars')); v.append(sum);
      const wk = el('div', 'fj-wk'), days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      week.forEach((d, i) => { const r = el('div', 'fj-day' + (i === todayIdx ? ' today' : '')), mini = el('div', 'fj-mini'); d.forEach(([t, mn]) => { const tg = M.tags.find(x => x[0] === t) || M.tags[0]; mini.append(miniJar(tg[1], mn)); }); if (!d.length) mini.append(el('em', null, i > todayIdx ? 'still to come' : 'rest day'));
        r.append(el('b', null, days[i]), mini, el('span', null, d.reduce((a, x) => a + x[1], 0) + 'm')); wk.append(r); });
      v.append(wk); if (G) G.from(wk.children, { x: -16, opacity: 0, duration: .4, stagger: .04, ease: 'expo.out' });
    }

    /* ---- settings ---- */
    const set = el('div', 'fj-set');
    const segBox = (title, sub, opts, key) => { const d = el('div'), p = el('p'); p.append(document.createTextNode(title + ' '), el('small', null, sub)); const sg = el('div', 'fj-seg'); opts.forEach(o => { const b = el('button', null, o + ' min'); b.type = 'button'; b.dataset.o = o; b.addEventListener('click', () => { S[key] = o; save(); reset(); paint(); }); sg.append(b); }); d.append(p, sg); set.append(d); return sg; };
    const sLen = segBox('Focus', 'one jar', [15, 25, 50], 'len'), sBrk = segBox('Break', 'between jars', [5, 10], 'brk');
    const tg = (t, key) => { const d = el('div'), b = el('button', 'fj-tg'); b.type = 'button'; b.setAttribute('role', 'switch'); b.append(el('span', null, t), el('i')); b.addEventListener('click', () => { S[key] = !S[key]; save(); paint(); sync(); }); d.append(b); set.append(d); return b; };
    const tSound = tg('Marble drop sound', 'sound'), tDnd = tg('Do Not Disturb while focusing', 'dnd'), tFast = tg('Demo speed (×60)', 'fast'); V.settings.append(set);
    function paint() { sLen.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.o === S.len))); sBrk.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.o === S.brk))); tSound.setAttribute('aria-checked', String(S.sound)); tDnd.setAttribute('aria-checked', String(S.dnd)); tFast.setAttribute('aria-checked', String(S.fast)); }

    syncTags(); paint(); sync(); requestAnimationFrame(movePill); window.addEventListener('resize', movePill);
  }
  demo(H.app, H);
  H.boot();
})();
