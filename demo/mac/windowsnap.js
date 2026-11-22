/* WindowSnap — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "desk";
/* ---------- WindowSnap ---------- */
  function demo(app, H) {
    const { el, G, reduced, tone, haptic, check, say, desk, extra, win } = H;
    const A = { x: 0, y: 26, w: 1200, h: 620 }; let GAP = 8;
    const KEYS = { left: 'Left half', right: 'Right half', top: 'Top half', bottom: 'Bottom half', max: 'Maximise', center: 'Centre', tl: 'Top-left', tr: 'Top-right', bl: 'Bottom-left', br: 'Bottom-right', t1: 'First third', t2: 'Centre third', t3: 'Last third', l23: 'Left two-thirds', r23: 'Right two-thirds', t3a: 'Right third, top', t3b: 'Right third, bottom' };
    function rect(k) { const g = GAP, x0 = A.x + g, y0 = A.y + g, W = A.w - 2 * g, Hh = A.h - 2 * g, hw = (W - g) / 2, hh = (Hh - g) / 2, tw = (W - 2 * g) / 3;
      return ({ left: [x0, y0, hw, Hh], right: [x0 + hw + g, y0, hw, Hh], top: [x0, y0, W, hh], bottom: [x0, y0 + hh + g, W, hh], max: [x0, y0, W, Hh], center: [A.x + A.w * .2, A.y + A.h * .14, A.w * .6, A.h * .72],
        tl: [x0, y0, hw, hh], tr: [x0 + hw + g, y0, hw, hh], bl: [x0, y0 + hh + g, hw, hh], br: [x0 + hw + g, y0 + hh + g, hw, hh],
        t1: [x0, y0, tw, Hh], t2: [x0 + tw + g, y0, tw, Hh], t3: [x0 + 2 * (tw + g), y0, tw, Hh], l23: [x0, y0, 2 * tw + g, Hh], r23: [x0 + tw + g, y0, 2 * tw + g, Hh], t3a: [x0 + 2 * (tw + g), y0, tw, hh], t3b: [x0 + 2 * (tw + g), y0 + hh + g, tw, hh] })[k]; }
    /* ---- windows: the frame window is Safari; three more are built ---- */
    const ttl = win.querySelector('.ttl'); if (ttl) ttl.textContent = 'Safari — studio.site';
    const web = el('div', 'wsn-web'); web.append(el('h4', null, 'Spring launch'), el('p', null, 'A homepage draft open in Safari. Snap it beside your notes and the terminal so everything fits without overlapping.'), el('div', 'hero'), el('p', null, 'Hero image · 1600 × 900'));
    app.append(web);
    const mk = (title, color, body, x, y, w, h) => { const n = el('section', 'wsn-w'), hd = el('header'), bd = el('div', 'bd'); n.style.setProperty('--wc', color); hd.append(el('i'), document.createTextNode(title)); bd.append(body); n.append(hd, bd); desk.append(n); Object.assign(n.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); return n; };
    const term = el('div', 'wsn-term'); [['$ ', 'npm run dev'], ['', '  ready on http://localhost:3000'], ['$ ', 'git status'], ['', '  On branch spring-launch'], ['', '  modified: app/page.tsx']].forEach(([p, t]) => { const l = el('div'); if (p) l.append(el('b', null, p)); l.append(document.createTextNode(t)); term.append(l); });
    const notes = el('div', 'wsn-notes'); notes.append(el('h5', null, 'Launch checklist'), el('div', null, '☑ hero copy'), el('div', null, '☐ pricing table'), el('div', null, '☐ og image'), el('div', null, '☐ ship it'));
    const mus = el('div', 'wsn-music'), mt = el('div'); mt.append(el('b', null, 'Focus Flow'), el('span', null, 'Playlist · 42 songs')); mus.append(el('i'), mt);
    const W = [{ n: win, name: 'Safari', hd: win.querySelector('.tbar') }, { n: mk('Terminal', '#E8E8E8', term, 640, 300, 460, 260), name: 'Terminal' }, { n: mk('Notes', '#FFF2B3', notes, 760, 60, 300, 260), name: 'Notes' }, { n: mk('Music', '#E4E0FF', mus, 180, 420, 380, 170), name: 'Music' }];
    W.forEach(o => { o.hd = o.hd || o.n.querySelector('header'); o.snap = null; o.prev = null; o.tag = el('span', 'wsn-tag'); o.tag.hidden = true; (o.n === win ? win.querySelector('#app') || win : o.n).append(o.tag); });
    let focus = W[0], zTop = 30, dd = null, uB = null, fTxt = null; const geo = o => { const r = o.n.style; return [parseFloat(r.left) || o.n.offsetLeft, parseFloat(r.top) || o.n.offsetTop, o.n.offsetWidth, o.n.offsetHeight]; };
    win.style.left = '60px'; win.style.top = '70px'; win.style.width = '560px'; win.style.height = '380px';
    function setFocus(o) { focus = o; W.forEach(x => x.n.classList.toggle('wsn-focus', x === o)); o.n.style.zIndex = ++zTop; paintDD(); }
    W.forEach(o => o.n.addEventListener('pointerdown', () => setFocus(o), true));
    function place(o, r, anim) { const [x, y, w, h] = r.map(v => Math.round(v)); if (G && !reduced && anim !== false) G.to(o.n, { left: x, top: y, width: w, height: h, duration: .38, ease: 'power3.out', overwrite: true }); else Object.assign(o.n.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); }
    function minimise(o) { o.prev = { r: geo(o), snap: o.snap, min: false }; o.min = true; if (G && !reduced) G.to(o.n, { scale: .1, opacity: 0, y: 260, duration: .35, ease: 'power2.in', onComplete: () => { o.n.style.visibility = 'hidden'; } }); else { o.n.style.visibility = 'hidden'; } }
    function unmin(o) { if (!o.min) return; o.min = false; o.n.style.visibility = ''; if (G) G.set(o.n, { scale: 1, opacity: 1, y: 0 }); }
    function snap(o, k, how) { if (!rect(k)) return; unmin(o); o.prev = { r: geo(o), snap: o.snap }; o.snap = k; place(o, rect(k)); o.tag.hidden = false; o.tag.textContent = KEYS[k]; tone(520 + Object.keys(KEYS).indexOf(k) * 30, .03); haptic(5);
      if (['tl', 'tr', 'bl', 'br'].includes(k)) check('quarter'); if (how === 'key') check('key'); if (how === 'drag') check('drag'); paintDD(); }
    function undo() { const o = focus; if (!o.prev) { say('Nothing to undo for ' + o.name); return; } const p = o.prev; o.prev = null; unmin(o); o.snap = p.snap; place(o, p.r); o.tag.hidden = !o.snap; if (o.snap) o.tag.textContent = KEYS[o.snap]; say('Restored ' + o.name); tone(400, .04); paintDD(); }
    /* ---- drag with snap zones ---- */
    const zone = el('div', 'wsn-zone'), zl = el('b'); zone.append(zl); desk.append(zone); const sc = () => desk.getBoundingClientRect().width / 1200;
    function zoneAt(px, py) { const y = py, x = px; if (y < A.y + 14) return x < 140 ? 'tl' : x > 1060 ? 'tr' : 'max'; if (x < 14) return y < A.y + 140 ? 'tl' : y > A.y + A.h - 140 ? 'bl' : 'left'; if (x > 1186) return y < A.y + 140 ? 'tr' : y > A.y + A.h - 140 ? 'br' : 'right'; if (y > A.y + A.h - 10) return 'bottom'; return null; }
    W.forEach(o => { let st = null; o.hd.addEventListener('pointerdown', e => { if (e.button) return; const d = desk.getBoundingClientRect(), s2 = sc(), [x, y, w, h] = geo(o); st = { mx: e.clientX, my: e.clientY, x, y, w, h, d, s2, moved: false }; try { o.hd.setPointerCapture(e.pointerId); } catch (x2) {} });
      o.hd.addEventListener('pointermove', e => { if (!st) return; const dx = (e.clientX - st.mx) / st.s2, dy = (e.clientY - st.my) / st.s2; if (!st.moved && Math.hypot(dx, dy) < 4) return; if (!st.moved && o.snap) { o.prev = { r: [st.x, st.y, st.w, st.h], snap: o.snap }; o.snap = null; o.tag.hidden = true; } st.moved = true;
        Object.assign(o.n.style, { left: (st.x + dx) + 'px', top: Math.max(A.y, st.y + dy) + 'px' }); const px = (e.clientX - st.d.left) / st.s2, py = (e.clientY - st.d.top) / st.s2, k = zoneAt(px, py); st.k = k;
        if (k) { const [zx, zy, zw, zh] = rect(k); Object.assign(zone.style, { left: zx + 'px', top: zy + 'px', width: zw + 'px', height: zh + 'px', opacity: 1 }); zl.textContent = KEYS[k]; } else zone.style.opacity = 0; });
      const end = () => { if (!st) return; const k = st.moved && st.k; st = null; zone.style.opacity = 0; if (k) snap(o, k, 'drag'); }; o.hd.addEventListener('pointerup', end); o.hd.addEventListener('pointercancel', end); });
    /* ---- keyboard: Control-Option + arrows / U I J K / D F G / E T / Enter / C / Backspace ---- */
    const MAP = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'top', ArrowDown: 'bottom', Enter: 'max', c: 'center', u: 'tl', i: 'tr', j: 'bl', k: 'br', d: 't1', f: 't2', g: 't3', e: 'l23', t: 'r23' };
    window.addEventListener('keydown', e => { if (!(e.ctrlKey && e.altKey)) return; const key = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (key === 'Backspace') { e.preventDefault(); undo(); return; } const k = MAP[key]; if (!k) return; e.preventDefault(); snap(focus, k, 'key'); flashKey(key); });
    const kp = el('div', 'wsn-keys'), kg = el('div'); kp.append(el('p', null, '⌃ ⌥ + key · or click a keycap'), kg); const caps = {};
    [['u', '↖'], ['ArrowUp', '↑'], ['i', '↗'], ['Enter', '⤢'], ['ArrowLeft', '←'], ['c', '◎'], ['ArrowRight', '→'], ['Backspace', '↶'], ['j', '↙'], ['ArrowDown', '↓'], ['k', '↘'], ['f', '⅓']].forEach(([k, l]) => { const b = el('button', null, l); b.type = 'button'; b.setAttribute('aria-label', 'Control Option ' + k + ': ' + (k === 'Backspace' ? 'undo' : KEYS[MAP[k]])); b.addEventListener('click', () => { if (k === 'Backspace') undo(); else snap(focus, MAP[k], 'key'); flashKey(k); }); caps[k] = b; kg.append(b); });
    function flashKey(k) { const b = caps[k]; if (!b) return; b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 160); }
    /* ---- menu bar ---- */
    const mx = el('button', 'wsn-mx'), mi = el('i'); mi.append(el('b'), el('b'), el('b')); mx.append(mi); mx.type = 'button'; mx.setAttribute('aria-label', 'WindowSnap'); mx.setAttribute('aria-haspopup', 'true'); mx.setAttribute('aria-expanded', 'false'); extra.append(mx);
    const LAYOUTS = { code: ['Coding', [['Safari', 'l23'], ['Notes', 't3a'], ['Terminal', 't3b'], ['Music', 'min']], 'Safari ⅔ + side stack'], quarters: ['Four quarters', [['Safari', 'tl'], ['Notes', 'tr'], ['Terminal', 'bl'], ['Music', 'br']], '2 × 2 grid'], thirds: ['Thirds', [['Notes', 't1'], ['Safari', 't2'], ['Terminal', 't3'], ['Music', 'min']], 'three columns'] };
    function applyLayout(k) { LAYOUTS[k][1].forEach(([n, key], i) => { const o = W.find(x => x.name === n); setTimeout(() => key === 'min' ? minimise(o) : snap(o, key), reduced ? 0 : i * 70); }); check('layout'); say('Layout: ' + LAYOUTS[k][0]); }
    function openDD(auto) { if (dd) { closeDD(); return; } dd = el('div', 'wsn-dd'); dd.setAttribute('role', 'dialog'); dd.setAttribute('aria-label', 'WindowSnap'); const r = mx.getBoundingClientRect(), dr = desk.getBoundingClientRect(), s2 = dr.width / 1200; dd.style.left = Math.min(1200 - 316, (r.left - dr.left) / s2 - 140) + 'px';
      const h1 = el('h5'); fTxt = el('span'); h1.append(document.createTextNode('Snap the window in focus'), fTxt); const gr = el('div', 'wsn-grid');
      ['left', 'right', 'top', 'max', 'tl', 'tr', 'bl', 'br', 't1', 't2', 't3', 'center'].forEach(k => { const b = el('button'), i = el('i'), [x, y, w, h] = rect(k); b.type = 'button'; b.setAttribute('aria-label', KEYS[k]); Object.assign(i.style, { left: ((x - A.x) / A.w * 100) + '%', top: ((y - A.y) / A.h * 100) + '%', width: (w / A.w * 100) + '%', height: (h / A.h * 100) + '%' }); b.append(i); b.addEventListener('click', () => snap(focus, k)); gr.append(b); });
      const h2 = el('h5', null, 'Layouts'), ly = el('div', 'wsn-lay'); Object.entries(LAYOUTS).forEach(([k, [n, , d]]) => { const b = el('button'), t = el('span', null, n); b.type = 'button'; b.append(t, el('em', null, d)); b.addEventListener('click', () => applyLayout(k)); ly.append(b); });
      const gp = el('label', 'wsn-gap'), gi = el('input'), gv = el('b', null, GAP + ' px'); gi.type = 'range'; gi.min = 0; gi.max = 24; gi.step = 2; gi.value = GAP; gi.setAttribute('aria-label', 'Gap between windows'); gi.addEventListener('input', () => { GAP = +gi.value; gv.textContent = GAP + ' px'; check('gap'); W.forEach(o => { if (o.snap) place(o, rect(o.snap), false); }); }); gp.append(el('span', null, 'Gap'), gi, gv);
      uB = el('button', 'wsn-undo', '↶ Undo last snap  ⌃⌥⌫'); uB.type = 'button'; uB.addEventListener('click', undo);
      dd.append(h1, gr, h2, ly, gp, kp, uB); desk.append(dd); mx.setAttribute('aria-expanded', 'true'); paintDD(); if (G && !reduced && !auto) G.from(dd, { opacity: 0, y: -6, duration: .2 }); }
    function closeDD() { if (!dd) return; dd.remove(); dd = null; mx.setAttribute('aria-expanded', 'false'); }
    function paintDD() { if (!dd) return; fTxt.textContent = focus.name; uB.disabled = !focus.prev; }
    mx.addEventListener('click', e => { e.stopPropagation(); openDD(); });
    H.jump = (k, fs) => { if (fs) return; if (LAYOUTS[k]) applyLayout(k); else if (k === 'undo') undo(); };
    setFocus(W[0]); setTimeout(() => { if (!dd) openDD(true); }, 900);
  }
  demo(H.app, H);
  H.boot();
})();
