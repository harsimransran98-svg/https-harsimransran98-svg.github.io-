/* SleepGuard — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
  /* nav: full-screen burger menu (only on pages that use it) */
  { const nb = $('.nv-burger'), nm = $('#nvMenu'); if (nb && nm) { const set = o => { nm.hidden = !o; nb.setAttribute('aria-expanded', String(o)); nb.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); document.body.style.overflow = o ? 'hidden' : ''; if (o && G && !reduced) G.from(nm.querySelectorAll('li'), { y: 34, opacity: 0, stagger: .05, duration: .55, ease: 'expo.out' }); if (o) { const f = nm.querySelector('a'); if (f) f.focus(); } };
    nb.addEventListener('click', () => set(nm.hidden)); nm.addEventListener('click', e => { if (e.target.closest('a')) set(false); }); document.addEventListener('keydown', e => { if (e.key === 'Escape' && !nm.hidden) { set(false); nb.focus(); } }); } }
  H.boot = () => {
    if (window.ScrollTrigger && window.gsap) { gsap.registerPlugin(ScrollTrigger);
      $$('.ch').forEach(ch => ScrollTrigger.create({ trigger: ch, start: 'top 55%', end: 'bottom 45%', onToggle: st => { ch.classList.toggle('on', st.isActive); if (st.isActive && H.jump) H.jump(ch.dataset.ch, true); } }));
      if (!reduced && $('.dc-tilt')) { const mt = gsap.matchMedia(); mt.add('(min-width: 900px)', () => { gsap.fromTo('.dc-tilt', { rotateX: 22, scale: .93 }, { rotateX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.dc-stage', start: 'top 96%', end: 'top 30%', scrub: 1 } }); }); }
      if (!reduced && $('.po-dev')) { const mm = gsap.matchMedia(); mm.add('(min-width: 1181px)', () => { gsap.to('.po-dev', { rotate: 2, y: -40, ease: 'none', scrollTrigger: { trigger: '.po-grid', start: 'top 80%', end: 'bottom top', scrub: 1 } }); }); }
    }
    if (G) {
      G.from(device || $('.desk-wrap'), { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' });
      G.from('#h1', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', delay: .1 });
      G.from('.lede, .try, .kick, .call, .spec, .metrics, .jump, .cta, .dk-chips, .po-steps, .ds-list, .dc-steps, .db-cards, .df-meta', { y: 24, opacity: 0, duration: .9, stagger: .05, ease: 'expo.out', delay: .25 });
    }
  };

  H.layout = "deskBand";
/* ---------- SleepGuard ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, tone, haptic, check, say, desk, extra, win } = H;
    const IDLE = 10, DIM = 6, JOB = 30, FR = 43200;
    const S = { guard: false, mode: 'forever', dispSleep: false, idleT: 0, started: false, asleep: false, timer: 120, task: { p: 0, running: false, done: false, cut: false } };
    const holding = () => S.guard && !S.asleep && (S.mode === 'forever' || (S.mode === '2h' && S.timer > 0) || (S.mode === 'task' && S.task.running));
    const mm = m => { m = Math.max(0, Math.ceil(m)); return Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm'; };
    /* ---- render queue window ---- */
    const ttl = win.querySelector('.ttl'); if (ttl) ttl.textContent = 'Render Queue';
    const root = el('div', 'sg'), job = el('div', 'sg-job'), th = el('div', 'sg-th'), thi = el('i'), thb = el('b', null, '00:00:00:00'), info = el('div'); th.append(thi, thb);
    const bar = el('div', 'sg-bar'), bi = el('i'); bar.append(bi); const meta = el('div', 'sg-meta'), mL = el('span'), mR = el('span'); meta.append(mL, mR);
    const go = el('button', 'sg-go', 'Start render'); go.type = 'button'; info.append(el('h3', null, 'Wedding film · final cut'), el('small', null, '4K · ProRes 422 HQ · 12 min · 43,200 frames'), bar, meta, go); job.append(th, info);
    const log = el('div', 'sg-log'); log.setAttribute('aria-live', 'polite'); root.append(job, log); app.append(root);
    const line = (t, cls) => { const p = el('p', cls || null, new Date().toTimeString().slice(0, 5) + '  ' + t); log.prepend(p); while (log.children.length > 8) log.lastChild.remove(); };
    line('Queue ready · 1 job'); line('Idle sleep is set to 10 min (System Settings)');
    function paintJob() { const t = S.task, f = Math.round(t.p * FR); bi.style.width = (t.p * 100) + '%'; thi.style.width = (t.p * 100) + '%'; bar.classList.toggle('bad', t.cut && !t.running);
      const secs = Math.round(t.p * 720); thb.textContent = '00:' + String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0') + ':00';
      mL.textContent = ''; mL.append(document.createTextNode('Frame '), el('b', null, f.toLocaleString('en-GB')), document.createTextNode(' / 43,200'));
      mR.textContent = t.done ? 'Done ✓' : t.running ? Math.ceil((1 - t.p) * JOB) + ' min left' : t.cut ? 'Interrupted at ' + Math.round(t.p * 100) + '%' : t.p ? 'Paused' : 'Not started';
      go.textContent = t.done ? 'Rendered' : t.running ? 'Pause' : t.p ? 'Resume render' : 'Start render'; go.disabled = t.done; }
    go.addEventListener('click', () => { const t = S.task; if (t.done) return; t.running = !t.running; if (t.running) { t.cut = false; check('task'); start(); tone(660, .04); line(t.p ? 'Render resumed at ' + Math.round(t.p * 100) + '%' : 'Render started · est. 30 min'); } else line('Render paused'); paintJob(); paintAll(); });
    /* ---- idle HUD, dimmer, sleep overlay ---- */
    const hud = el('div', 'sg-hud'), hsv = svgEl('svg', { viewBox: '0 0 34 34', 'aria-hidden': 'true' }), C = 2 * Math.PI * 14, ring = svgEl('circle', { cx: 17, cy: 17, r: 14, fill: 'none', stroke: '#5B3FD9', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': C.toFixed(1), 'stroke-dashoffset': '0' });
    hsv.append(svgEl('circle', { cx: 17, cy: 17, r: 14, fill: 'none', stroke: '#EEE9F7', 'stroke-width': 4 }), ring); const ht = el('div'), hb = el('b'), hs = el('span'); ht.append(hb, hs); hud.append(hsv, ht); hud.setAttribute('role', 'status'); desk.append(hud);
    const dim = el('i', 'sg-dim'); desk.append(dim); let zz = null;
    function start() { if (!S.started) { S.started = true; S.idleT = 0; } }
    function activity() { if (S.asleep) { wake(); return; } start(); S.idleT = 0; paintAll(); }
    desk.addEventListener('pointerdown', activity, true); desk.addEventListener('pointerenter', start);
    function sleep() { S.asleep = true; const t = S.task; if (t.running) { t.running = false; t.cut = true; line('Mac went to sleep · render interrupted at ' + Math.round(t.p * 100) + '%', 'w'); } else line('Mac went to sleep');
      check('nap'); tone(300, .15, 'sine', .04); setTimeout(() => tone(200, .2, 'sine', .03), 160);
      zz = el('div', 'sg-zz'); zz.setAttribute('role', 'button'); zz.tabIndex = 0; zz.setAttribute('aria-label', 'Mac is asleep. Click to wake'); const box = el('div'); box.append(el('div', 'moon'), el('b', null, 'Your Mac went to sleep'), el('p', null, t.cut ? 'The render stopped at ' + Math.round(t.p * 100) + '%. Click to wake, then try SleepGuard.' : 'Ten idle minutes. Click anywhere to wake it.')); zz.append(box);
      zz.addEventListener('click', wake); zz.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wake(); } }); desk.append(zz); if (G && !reduced) G.from(zz, { opacity: 0, duration: .8 }); paintJob(); paintAll(); }
    function wake() { if (!S.asleep) return; S.asleep = false; S.idleT = 0; if (zz) { zz.remove(); zz = null; } line('Woke from sleep'); tone(720, .05); say(S.task.cut ? 'Awake. The render needs resuming.' : 'Awake'); paintJob(); paintAll(); }
    /* ---- menu bar ---- */
    const mx = el('button', 'sg-mx'), msv = svgEl('svg', { viewBox: '0 0 16 16', 'aria-hidden': 'true' }); msv.append(svgEl('path', { class: 'cup', d: 'M2.5 6 h9 v4.5 a3.5 3.5 0 0 1 -3.5 3.5 h-2 a3.5 3.5 0 0 1 -3.5 -3.5 z', fill: 'none', stroke: '#111', 'stroke-width': 1.4 }), svgEl('path', { d: 'M11.5 7.2 h1 a1.6 1.6 0 0 1 0 3.2 h-1', fill: 'none', stroke: '#111', 'stroke-width': 1.4 }), svgEl('path', { class: 'stm', d: 'M5.5 4.6 q-.8 -1.2 0 -2.4 M8.5 4.6 q-.8 -1.2 0 -2.4', fill: 'none', stroke: '#111', 'stroke-width': 1.2, 'stroke-linecap': 'round' }));
    mx.append(msv); mx.type = 'button'; mx.setAttribute('aria-haspopup', 'true'); mx.setAttribute('aria-expanded', 'false'); extra.append(mx);
    let dd = null, R = {};
    function openDD(auto) { if (dd) { closeDD(); return; } dd = el('div', 'sg-dd'); dd.setAttribute('role', 'dialog'); dd.setAttribute('aria-label', 'SleepGuard'); const r = mx.getBoundingClientRect(), dr = desk.getBoundingClientRect(), sc = dr.width / 1200; dd.style.left = Math.min(1200 - 332, (r.left - dr.left) / sc - 150) + 'px'; desk.append(dd); mx.setAttribute('aria-expanded', 'true'); buildDD(); if (G && !reduced && !auto) G.from(dd, { opacity: 0, y: -6, duration: .2 }); }
    function closeDD() { if (!dd) return; dd.remove(); dd = null; R = {}; mx.setAttribute('aria-expanded', 'false'); }
    mx.addEventListener('click', e => { e.stopPropagation(); openDD(); });
    function setGuard(v) { if (S.guard === v) return; S.guard = v; if (v) { check('guard'); tone(660, .05); setTimeout(() => tone(990, .06), 90); line('SleepGuard on · ' + MODES[S.mode][0].toLowerCase(), 'g'); if (S.mode === '2h') S.timer = 120; } else { tone(400, .05); line('SleepGuard off'); } buildDD(); paintAll(); }
    const MODES = { task: ['Until the task ends', 'Watches Render Queue, then lets go'], '2h': ['For 2 hours', 'Then normal sleep resumes'], forever: ['Indefinitely', 'Until you turn it off'] };
    function buildDD() { if (!dd) return; dd.textContent = ''; R = {}; const hd = el('header'), tg = el('button', 'sg-tg'); tg.type = 'button'; tg.setAttribute('role', 'switch'); tg.setAttribute('aria-checked', String(S.guard)); tg.setAttribute('aria-label', 'SleepGuard on'); tg.addEventListener('click', () => setGuard(!S.guard)); hd.append(el('b', null, 'SleepGuard'), tg); dd.append(hd);
      R.st = el('div', 'sg-st'); dd.append(R.st); const md = el('div', 'sg-modes');
      Object.entries(MODES).forEach(([k, [l, sub]]) => { const b = el('button'), t = el('span'); b.type = 'button'; b.setAttribute('aria-pressed', String(S.mode === k)); t.append(document.createTextNode(l), el('small', null, sub)); const em = el('em'); if (k === '2h') R.left = em; b.append(t, em);
        b.addEventListener('click', () => { if (S.mode === k) return; S.mode = k; if (k === '2h') S.timer = 120; if (k === 'task') check('mode'); tone(560, .03); line('Mode: ' + l.toLowerCase()); buildDD(); paintAll(); }); md.append(b); }); dd.append(md);
      const op = el('div', 'sg-opt'), ot = el('span'), ob = el('button', 'sg-tg'); ob.type = 'button'; ob.setAttribute('role', 'switch'); ob.setAttribute('aria-checked', String(S.dispSleep)); ob.setAttribute('aria-label', 'Let the display sleep'); ot.append(document.createTextNode('Let the display sleep'), el('small', null, 'Screen dims, the Mac keeps working')); ob.addEventListener('click', () => { S.dispSleep = !S.dispSleep; ob.setAttribute('aria-checked', String(S.dispSleep)); tone(600, .02); paintAll(); }); op.append(ot, ob); dd.append(op);
      R.proc = el('p', 'sg-proc'); dd.append(R.proc); paintDD(); }
    function paintDD() { if (!dd || !R.st) return; const h = holding(), armed = S.guard && !h; R.st.className = 'sg-st' + (h ? ' hold' : armed ? ' arm' : ''); R.st.textContent = '';
      R.st.append(el('b', null, h ? 'Holding · your Mac stays awake' : armed ? (S.mode === 'task' ? 'Armed · waiting for a running task' : 'Time is up · normal sleep') : 'Off · sleeps after 10 idle min'), document.createTextNode(h ? (S.mode === 'task' ? 'Releases when Render Queue finishes' : S.mode === '2h' ? mm(S.timer) + ' left' : 'Until you switch it off') : S.started ? 'Next sleep in ' + Math.max(0, Math.ceil(IDLE - S.idleT)) + ' min of idle' : 'Idle clock starts when you use the desktop'));
      if (R.left) R.left.textContent = S.mode === '2h' && S.guard ? mm(S.timer) : ''; R.proc.textContent = ''; R.proc.append(el('span', null, 'Watching: Render Queue'), el('b', null, S.task.running ? 'running' : S.task.done ? 'finished' : 'idle')); }
    function paintAll() { const h = holding(), left = IDLE - S.idleT; mx.classList.toggle('hold', h); mx.setAttribute('aria-label', 'SleepGuard, ' + (h ? 'keeping the Mac awake' : S.guard ? 'armed' : 'off'));
      hud.classList.toggle('hold', h); hb.textContent = S.asleep ? 'Asleep' : h ? 'Sleep blocked' : !S.started ? 'Idle sleep · 10 min' : 'Sleeps in ' + Math.max(0, Math.ceil(left)) + ' min';
      hs.textContent = S.asleep ? 'click to wake' : h ? 'SleepGuard holding' + (S.dispSleep ? ' · display may sleep' : '') : !S.started ? 'move onto the desktop to start' : 'clicks count as activity';
      ring.setAttribute('stroke-dashoffset', (C * (h || !S.started ? 0 : Math.min(1, S.idleT / IDLE))).toFixed(1)); ring.style.stroke = h ? '#5B3FD9' : left < 3 ? '#E0483E' : '#FF9E6B';
      dim.style.opacity = !S.asleep && S.started && S.idleT >= DIM && (!h || S.dispSleep) ? '.62' : '0'; paintDD(); }
    /* ---- the clock: 1 real second = 1 minute ---- */
    setInterval(() => { const d = .25, t = S.task; if (S.asleep) return; const was = holding();
      if (t.running) { t.p = Math.min(1, t.p + d / JOB); if (t.p >= 1) { t.running = false; t.done = true; line('Render finished · 43,200 frames written', 'g'); tone(880, .06); setTimeout(() => tone(1320, .08), 110); if (S.guard && S.mode === 'task') { check('release'); line('SleepGuard released · normal sleep allowed', 'g'); say('Render done. SleepGuard let go, so the Mac can sleep.'); } } paintJob(); }
      if (S.guard && S.mode === '2h' && S.timer > 0) { S.timer = Math.max(0, S.timer - d); if (S.timer === 0) line('2 hours up · SleepGuard stopped holding'); }
      const h = holding(); if (was && !h) S.idleT = Math.min(S.idleT, IDLE - 3);
      if (S.started) { S.idleT += d; if (!h && S.idleT >= IDLE) { sleep(); return; } }
      paintAll(); }, 250);
    H.jump = (k, fs) => { if (fs) return; if (k === 'render') { if (!S.task.running && !S.task.done) go.click(); } else if (k === 'guard') { if (!dd) openDD(); setGuard(true); } else if (k === 'nap') { start(); setGuard(false); S.idleT = Math.max(S.idleT, IDLE - 2.5); paintAll(); say('Hands off: the Mac sleeps in about 2 minutes'); } };
    paintJob(); paintAll(); setTimeout(() => { if (!dd) openDD(true); }, 900);
  }
  demo(H.app, H);
  H.boot();
})();
