/* TaskDock — Windows app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
  { const nb = $('[data-burger]'), nm = nb && document.getElementById(nb.getAttribute('aria-controls')); if (nb && nm) { const lock = nb.dataset.burger !== 'card';
    const set = o => { nm.hidden = !o; nb.setAttribute('aria-expanded', String(o)); nb.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); if (lock) document.body.style.overflow = o ? 'hidden' : '';
      if (o && G && !reduced) { const pan = nm.querySelector('[data-panel]'); if (pan) G.from(pan, Object.assign({ duration: .55, ease: 'expo.out' }, nb.dataset.burger === 'sheet' ? { yPercent: 100 } : nb.dataset.burger === 'drawer' ? { xPercent: 100 } : { y: -12, opacity: 0, scale: .96, transformOrigin: '100% 0' })); G.from(nm.querySelectorAll('li'), { y: 24, opacity: 0, stagger: .05, duration: .5, ease: 'expo.out', delay: .1 }); }
      if (o) { const f = nm.querySelector('a'); if (f) f.focus(); } };
    nb.addEventListener('click', e => { e.stopPropagation(); set(nm.hidden); }); nm.addEventListener('click', e => { if (e.target.closest('a') || e.target === nm) set(false); });
    document.addEventListener('click', e => { if (!nm.hidden && !nm.contains(e.target) && !nb.contains(e.target)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !nm.hidden) { set(false); nb.focus(); } }); } }
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

  H.layout = "deskSplit";
/* ---------- TaskDock ---------- */
  function demo(app, H) {
    const { el, G, reduced, tone, haptic, check, say, desk, extra, win } = H;
    const tasks = [{ t: 'Finish Q3 report charts', due: '12:00', hi: true, tag: 'work', done: false }, { t: 'Reply to Priya about onboarding', due: '', hi: false, tag: 'work', done: false }, { t: 'Book dentist', due: '', hi: false, tag: 'home', done: true }, { t: 'Buy oat milk', due: '18:30', hi: false, tag: '', done: false }];
    /* ---- Word (frame window) + Outlook ---- */
    const ttl = win.querySelector('.tbar span:not(.ico):not(.tools):not(.wctl)'); if (ttl) ttl.textContent = 'Q3 Report.docx — Word';
    const doc = el('div', 'tdk-doc'), pg = el('div', 'pg'); pg.append(el('h4', null, 'Q3 Performance Report'), el('p', null, 'Revenue grew 14% quarter on quarter, led by the new subscription tier.'), el('i'), el('i'), el('i'), el('p', null, 'Chart 2: churn by cohort (to do)'), el('i'), el('i')); doc.append(pg); app.append(doc);
    const ol = el('section', 'tdk-ol'), oh = el('header'), ows = el('span'); ['—', '▢', '✕'].forEach(x => ows.append(el('em', null, x))); oh.append(el('i'), document.createTextNode('Inbox — Outlook'), ows); const ml = el('div', 'ml');
    [['#7C5CFF', 'Priya Shah', 'Onboarding flow v3, quick look?', '10:42'], ['#2FB36B', 'Sam Okafor', 'lunch tomorrow?', '09:15'], ['#F59E0B', 'Finance', 'Q3 numbers attached', 'Mon']].forEach(([c, n, sub, t]) => { const r = el('div'), av = el('i'), m = el('span'); av.style.setProperty('--c', c); m.append(el('b', null, n), el('small', null, sub)); r.append(av, m, el('small', null, t)); ml.append(r); });
    ol.append(oh, ml); desk.append(ol);
    let z = 22; const raise = n => { [win, ol].forEach(x => { x.style.zIndex = x === n ? 22 : 21; }); if (W.classList.contains('unpin')) return; if (!S.hidden) check('pin'); };
    win.addEventListener('pointerdown', () => raise(win), true); ol.addEventListener('pointerdown', () => raise(ol), true);
    /* ---- the widget ---- */
    const S = { pinned: true, hidden: false, corner: 'tr', compact: false };
    const W = el('section', 'tdk-w'), hd = el('div', 'tdk-hd'), title = el('b', null, 'Today'), sub = el('small'), pin = el('button', 'tdk-ib', '📌'), cmp = el('button', 'tdk-ib', '▾'), hide = el('button', 'tdk-ib', '—');
    [pin, cmp, hide].forEach(b => { b.type = 'button'; }); pin.setAttribute('aria-label', 'Keep on top'); cmp.setAttribute('aria-label', 'Compact view'); hide.setAttribute('aria-label', 'Hide TaskDock'); W.setAttribute('role', 'region'); W.setAttribute('aria-label', 'TaskDock widget');
    hd.append(title, sub, pin, cmp, hide); const add = el('form', 'tdk-add'), inp = el('input'), ab = el('button', null, '+'); inp.type = 'text'; inp.maxLength = 80; inp.placeholder = 'Add a task…'; inp.setAttribute('aria-label', 'New task'); ab.type = 'submit'; ab.setAttribute('aria-label', 'Add task'); add.append(inp, ab);
    const hint = el('p', 'tdk-hint', 'try: call Sam @15:00 ! #work'), ls = el('ul', 'tdk-ls'), ft = el('div', 'tdk-ft'); W.append(hd, add, hint, ls, ft); desk.append(W);
    const ghost = el('i', 'tdk-ghost'); desk.append(ghost);
    const CORNER = { tl: [18, 18], tr: [1200 - 318, 18], bl: [18, 600 - 18], br: [1200 - 318, 600 - 18] };
    function cornerPos(k) { const [x, y] = CORNER[k], h = W.offsetHeight || 300; return [x, k[0] === 'b' ? 720 - 48 - 18 - h : y]; }
    function placeCorner(k, anim) { S.corner = k; const [x, y] = cornerPos(k); if (G && !reduced && anim) G.to(W, { left: x, top: y, duration: .45, ease: 'back.out(1.4)' }); else { W.style.left = x + 'px'; W.style.top = y + 'px'; } }
    function parse(raw) { let t = ' ' + raw.trim() + ' '; const o = { due: '', hi: false, tag: '' }; const tm = t.match(/@(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i); if (tm) { let h = +tm[1]; const m = tm[2] || '00', ap = (tm[3] || '').toLowerCase(); if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0; if (h < 24 && +m < 60) o.due = String(h).padStart(2, '0') + ':' + m; t = t.replace(tm[0], ' '); }
      if (/(^|\s)!(\s|$)/.test(t)) { o.hi = true; t = t.replace(/(^|\s)!(?=\s|$)/, ' '); } const tg = t.match(/#([a-z0-9-]{1,16})/i); if (tg) { o.tag = tg[1].toLowerCase(); t = t.replace(tg[0], ' '); } o.t = t.replace(/\s+/g, ' ').trim(); return o; }
    function render() { ls.textContent = ''; const order = tasks.slice().sort((a, b) => a.done - b.done || b.hi - a.hi || (a.due || '99').localeCompare(b.due || '99'));
      order.forEach(task => { const li = el('li', 'tdk-it' + (task.done ? ' done' : '')), ck = el('button', 'tdk-ck'), m = el('div'), x = el('button', 'tdk-x', '✕'); ck.type = x.type = 'button'; ck.setAttribute('role', 'checkbox'); ck.setAttribute('aria-checked', String(task.done)); ck.setAttribute('aria-label', task.t); x.setAttribute('aria-label', 'Delete ' + task.t);
        m.append(el('div', 'tx', task.t)); const ch = el('div', 'ch'); if (task.hi) ch.append(el('span', 'hi', '! high')); if (task.due) ch.append(el('span', 'due', '⏰ ' + task.due)); if (task.tag) ch.append(el('span', 'tg', '#' + task.tag)); if (ch.childNodes.length) m.append(ch);
        ck.addEventListener('click', () => { task.done = !task.done; if (task.done) { check('done'); tone(880, .04); setTimeout(() => tone(1320, .05), 70); haptic(6); } render(); }); x.addEventListener('click', () => { tasks.splice(tasks.indexOf(task), 1); tone(300, .03); render(); });
        li.append(ck, m, x); ls.append(li); });
      const left = tasks.filter(t => !t.done).length; sub.textContent = left + ' left'; ft.textContent = ''; ft.append(el('span', null, tasks.filter(t => t.done).length + ' done today'), el('b', null, S.pinned ? '📌 on top' : 'behind windows')); trayI.textContent = String(left); tray.setAttribute('aria-label', 'TaskDock, ' + left + ' tasks left. Click to ' + (S.hidden ? 'show' : 'hide'));
      if (S.corner[0] === 'b') placeCorner(S.corner, false); }
    add.addEventListener('submit', e => { e.preventDefault(); const p = parse(inp.value); if (!p.t) { say('Type a task first'); return; } tasks.unshift(Object.assign(p, { done: false })); inp.value = ''; check('add'); tone(700, .04); render(); const n = ls.firstChild; if (n && G && !reduced) G.from(n, { y: -10, opacity: 0, duration: .35, ease: 'back.out(2)' }); });
    pin.addEventListener('click', () => { S.pinned = !S.pinned; W.classList.toggle('unpin', !S.pinned); pin.setAttribute('aria-pressed', String(S.pinned)); say(S.pinned ? 'Pinned: stays above every window' : 'Unpinned: goes behind windows'); tone(S.pinned ? 760 : 420, .03); render(); });
    cmp.addEventListener('click', () => { S.compact = !S.compact; W.classList.toggle('compact', S.compact); cmp.textContent = S.compact ? '▴' : '▾'; cmp.setAttribute('aria-pressed', String(S.compact)); render(); });
    function setHidden(v, how) { S.hidden = v; W.classList.toggle('gone', v); tray.classList.toggle('off', v); if (v) check('hide'); say(v ? 'Hidden. ' + (how === 'key' ? 'Press the hotkey again' : 'Click the tray icon') + ' to bring it back' : 'TaskDock is back'); tone(v ? 420 : 760, .03); render(); }
    hide.addEventListener('click', () => setHidden(true));
    /* drag + snap to the nearest corner */
    let st = null; hd.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; const dr = desk.getBoundingClientRect(), sc = dr.width / 1200; st = { mx: e.clientX, my: e.clientY, x: W.offsetLeft, y: W.offsetTop, sc, moved: false }; try { hd.setPointerCapture(e.pointerId); } catch (x) {} });
    hd.addEventListener('pointermove', e => { if (!st) return; const dx = (e.clientX - st.mx) / st.sc, dy = (e.clientY - st.my) / st.sc; if (!st.moved && Math.hypot(dx, dy) < 4) return; st.moved = true; const x = st.x + dx, y = st.y + dy; W.style.left = x + 'px'; W.style.top = y + 'px';
      const k = (y + W.offsetHeight / 2 > 330 ? 'b' : 't') + (x + 150 > 600 ? 'r' : 'l'); st.k = k; const [gx, gy] = cornerPos(k); ghost.style.left = gx + 'px'; ghost.style.top = gy + 'px'; ghost.style.height = W.offsetHeight + 'px'; ghost.style.opacity = '1'; });
    const end = () => { if (!st) return; const m = st.moved, k = st.k; st = null; ghost.style.opacity = '0'; if (m && k) { if (k !== S.corner) check('move'); placeCorner(k, true); tone(600, .03); } }; hd.addEventListener('pointerup', end); hd.addEventListener('pointercancel', end);
    /* tray + hotkey */
    const tray = el('button', 'tdk-tray'), trayI = el('i'); tray.type = 'button'; tray.append(trayI); extra.append(tray); tray.addEventListener('click', () => setHidden(!S.hidden));
    window.addEventListener('keydown', e => { if ((e.metaKey || e.altKey) && e.shiftKey && (e.key === 'T' || e.key === 't')) { e.preventDefault(); setHidden(!S.hidden, 'key'); } });
    H.jump = (k, fs) => { if (fs) return; if (k === 'add') { inp.focus(); inp.value = 'call Sam @15:00 ! #work'; } else if (k === 'corner') { const nx = { tr: 'bl', bl: 'br', br: 'tl', tl: 'tr' }[S.corner]; check('move'); placeCorner(nx, true); } else if (k === 'hide') setHidden(!S.hidden); };
    pin.setAttribute('aria-pressed', 'true'); render(); placeCorner('tr', false);
  }
  demo(H.app, H);
  H.boot();
})();
