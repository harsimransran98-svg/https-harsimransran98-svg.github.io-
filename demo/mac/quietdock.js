/* QuietDock — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "deskCenter";
/* ---------- QuietDock ---------- */
  function demo(app, H) {
    const { el, G, reduced, tone, haptic, check, say, desk, extra, win } = H;
    const APPS = [['finder', 'Finder', '#2E7CF6', 'F'], ['safari', 'Safari', '#1A9BE6', 'S'], ['mail', 'Mail', '#3B82F6', 'M'], ['messages', 'Messages', '#22C55E', 'Me'], ['calendar', 'Calendar', '#EF4444', '20'], ['notes', 'Notes', '#EAB308', 'N'], ['xcode', 'Xcode', '#1D4ED8', 'X'], ['terminal', 'Terminal', '#27272A', '>_'], ['figma', 'Figma', '#A855F7', 'Fi'], ['pages', 'Pages', '#F97316', 'P'], ['zoom', 'Zoom', '#2563EB', 'Z'], ['slack', 'Slack', '#7C3AED', 'Sl'], ['music', 'Music', '#F43F5E', '♪'], ['photos', 'Photos', '#F59E0B', 'Ph'], ['settings', 'Settings', '#71717A', '⚙']]
      .map(([id, n, c, g]) => ({ id, n, c, g }));
    const byId = Object.fromEntries(APPS.map(a => [a.id, a]));
    const CTX = { code: ['Coding', 'xcode', ['xcode', 'terminal', 'safari', 'slack']], write: ['Writing', 'pages', ['pages', 'notes', 'safari', 'mail']], design: ['Design', 'figma', ['figma', 'photos', 'safari', 'slack']], meet: ['Meeting', 'zoom', ['zoom', 'calendar', 'notes', 'messages']] };
    const S = { on: true, ctx: 'code', pins: new Set(['finder', 'settings']), editCtx: 'code' };
    const visible = () => { if (!S.on) return APPS.map(a => a.id); const set = new Set([...S.pins, ...CTX[S.ctx][2]]); return APPS.filter(a => set.has(a.id)).map(a => a.id); };
    /* ---- windows: the frame window is Xcode, plus three more ---- */
    const ttl = win.querySelector('.ttl'); if (ttl) ttl.textContent = 'QuietDock.swift — Xcode';
    const code = el('div', 'qd-code'); [[['k', 'final class'], ['t', ' DockContext'], ['', ' {']], [['', '  '], ['k', 'let'], ['', ' app: '], ['t', 'String']], [['', '  '], ['k', 'var'], ['', ' keep: ['], ['t', 'String'], ['', ']']], [['', '  '], ['k', 'func'], ['', ' apply(to dock: '], ['t', 'Dock'], ['', ') {']], [['', '    dock.show(keep + pinned)']], [['', '    dock.hide(dock.all.subtracting(keep))']], [['', '  }']], [['', '}']], [], [['s2', '// switch apps: the Dock follows']]]
      .forEach((ln, i) => { const d = el('div'), c = el('span'); d.append(el('span', null, String(i + 1)), c); ln.forEach(([k, t]) => c.append(k ? el('span', k, t) : document.createTextNode(t))); code.append(d); }); app.append(code);
    const mkWin = (title, x, y, w, h, body) => { const n = el('section', 'qd-w'), hd = el('header'), bd = el('div', 'bd'); hd.append(el('i'), document.createTextNode(title)); bd.append(body); n.append(hd, bd); Object.assign(n.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); desk.append(n); return n; };
    const doc = el('div', 'qd-doc'); doc.append(el('h4', null, 'Quarterly letter'), el('p', null, 'Dear readers, this quarter we shipped less and finished more. Here is what changed and why it matters.'), el('p', null, 'First, we stopped starting things on Fridays.'));
    const fig = el('div', 'qd-fig'), fa = el('aside'), cv = el('div', 'cv'); for (let i = 0; i < 6; i++) fa.append(el('i')); [['#0F766E', '12%', '14%', '46%', '34%'], ['#F59E0B', '62%', '20%', '28%', '28%'], ['#1C2421', '14%', '58%', '70%', '10%'], ['#E7C9A9', '14%', '74%', '40%', '10%']].forEach(([c, l, t, w, h]) => { const b = el('b'); Object.assign(b.style, { background: c, left: l, top: t, width: w, height: h }); cv.append(b); }); fig.append(fa, cv);
    const zm = el('div', 'qd-zoom'); [['#4B6B63', 'Priya'], ['#7A5C3E', 'Sam'], ['#3E4C6B', 'Jonah'], ['#6B3E5C', 'You']].forEach(([c, n]) => { const d = el('div', null, n); d.style.background = 'linear-gradient(160deg,' + c + ', #1C2421)'; zm.append(d); });
    const W = { code: win, write: mkWin('Quarterly letter — Pages', 600, 70, 390, 250, doc), design: mkWin('Homepage v2 — Figma', 110, 410, 400, 200, fig), meet: mkWin('Weekly sync — Zoom', 560, 360, 330, 210, zm) };
    let z = 30; function focusWin(k, quiet) { Object.entries(W).forEach(([kk, n]) => n.classList.toggle('on-top', kk === k)); W[k].style.zIndex = ++z; if (S.ctx !== k) { S.ctx = k; if (!quiet) { check('switch'); tone(520 + Object.keys(CTX).indexOf(k) * 90, .04); } layout(); if (dd) paintDD(); } }
    Object.entries(W).forEach(([k, n]) => n.addEventListener('pointerdown', () => focusWin(k)));
    /* ---- the Dock: magnification + FLIP hide/show ---- */
    const dk = el('nav', 'qd-dk'); dk.setAttribute('aria-label', 'Dock'); desk.append(dk); const icons = {};
    APPS.forEach((a, i) => { const ic = el('button', 'qd-ic'), b = el('b', null, a.g); ic.type = 'button'; ic.style.setProperty('--c', a.c); ic.append(b, el('em'), el('small', null, a.n)); ic.setAttribute('aria-label', a.n);
      ic.addEventListener('click', () => { const k = Object.keys(CTX).find(kk => CTX[kk][1] === a.id); if (k) focusWin(k); else { if (G && !reduced) G.fromTo(b, { y: 0 }, { y: -18, duration: .22, yoyo: true, repeat: 3, ease: 'power1.out' }); say(a.n + ' opened'); } }); icons[a.id] = ic; dk.append(ic); if (i === 0) dk.append(el('i', 'qd-sep')); });
    let shown = new Set(APPS.map(a => a.id));
    function layout() { const vis = new Set(visible()); APPS.forEach(a => { const ic = icons[a.id], on = vis.has(a.id), was = shown.has(a.id); ic.classList.toggle('qd-pin', S.pins.has(a.id)); ic.classList.toggle('qd-run', Object.values(CTX).some(c => c[1] === a.id));
        ic.tabIndex = on ? 0 : -1; ic.setAttribute('aria-hidden', String(!on)); if (on === was) return;
        if (G && !reduced) { G.killTweensOf(ic); G.to(ic, on ? { width: 48, marginLeft: 3, marginRight: 3, opacity: 1, scale: 1, duration: .45, ease: 'back.out(1.7)' } : { width: 0, marginLeft: 0, marginRight: 0, opacity: 0, scale: .4, duration: .35, ease: 'power2.in' }); }
        else Object.assign(ic.style, on ? { width: '48px', margin: '0 3px', opacity: 1, transform: '' } : { width: '0px', margin: '0', opacity: 0 }); });
      shown = vis; if (dd) paintSum(); }
    let hovered = false; dk.addEventListener('pointermove', e => { const sc = desk.getBoundingClientRect().width / 1200; APPS.forEach(a => { const ic = icons[a.id]; if (!shown.has(a.id)) return; const r = ic.getBoundingClientRect(), d = Math.abs(e.clientX - (r.left + r.width / 2)) / sc, k = Math.max(0, 1 - d / 150), m = 1 + .75 * Math.cos((1 - k) * Math.PI / 2) * k;
        ic.style.width = (48 * m).toFixed(1) + 'px'; ic.firstChild.style.transform = 'scale(' + m.toFixed(3) + ') translateY(' + (-(m - 1) * 14).toFixed(1) + 'px)'; }); if (!hovered) { hovered = true; check('magnify'); } });
    dk.addEventListener('pointerleave', () => { hovered = false; APPS.forEach(a => { const ic = icons[a.id], b = ic.firstChild; if (!shown.has(a.id)) return; if (G && !reduced) { G.to(ic, { width: 48, duration: .35, ease: 'power2.out' }); G.to(b, { scale: 1, y: 0, duration: .35, ease: 'power2.out', clearProps: 'transform' }); } else { ic.style.width = '48px'; b.style.transform = ''; } }); });
    /* ---- menu-bar extra + dropdown ---- */
    const mx = el('button', 'qd-mx'), mi = el('i'), mt = el('span'); mi.append(el('b'), el('b'), el('b')); mx.append(mi, mt); mx.type = 'button'; mx.setAttribute('aria-haspopup', 'true'); mx.setAttribute('aria-expanded', 'false'); extra.append(mx);
    let dd = null, sum = null;
    function openDD(auto) { if (dd) { closeDD(); return; } dd = el('div', 'qd-dd'); dd.setAttribute('role', 'dialog'); dd.setAttribute('aria-label', 'QuietDock'); const r = mx.getBoundingClientRect(), dr = desk.getBoundingClientRect(), sc = dr.width / 1200; dd.style.left = Math.min(1200 - 342, (r.left - dr.left) / sc - 150) + 'px'; desk.append(dd); mx.setAttribute('aria-expanded', 'true'); paintDD(); if (G && !reduced && !auto) G.from(dd, { opacity: 0, y: -6, scale: .97, transformOrigin: '50% 0', duration: .22 }); }
    function closeDD() { if (!dd) return; dd.remove(); dd = null; sum = null; mx.setAttribute('aria-expanded', 'false'); }
    mx.addEventListener('click', e => { e.stopPropagation(); openDD(); });
    function paintSum() { if (!sum) return; const n = APPS.length - shown.size; sum.textContent = ''; sum.append(document.createTextNode(S.on ? 'Showing ' : 'Paused · showing all '), el('b', null, String(shown.size)), document.createTextNode(' of ' + APPS.length + ' icons' + (S.on ? ' · ' + n + ' hidden for ' + CTX[S.ctx][0].toLowerCase() : ''))); mt.textContent = S.on ? String(shown.size) : 'off'; }
    function paintDD() { if (!dd) { paintSum(); return; } dd.textContent = ''; const hd = el('header'), hl = el('div'), tg = el('button', 'qd-tg'); tg.type = 'button'; tg.setAttribute('role', 'switch'); tg.setAttribute('aria-checked', String(S.on)); tg.setAttribute('aria-label', 'QuietDock on');
      hl.append(el('b', null, 'QuietDock'), el('small', null, 'Active: ' + byId[CTX[S.ctx][1]].n + ' · ' + CTX[S.ctx][0])); hd.append(hl, tg); dd.append(hd);
      tg.addEventListener('click', () => { S.on = !S.on; if (!S.on) { check('off'); say('Paused: every icon is back'); } else say('Quiet again'); tone(S.on ? 760 : 380, .04); layout(); paintDD(); });
      const cx = el('div', 'qd-ctx'); Object.entries(CTX).forEach(([k, [n]]) => { const b = el('button', null, n); b.type = 'button'; b.setAttribute('aria-pressed', String(S.editCtx === k)); b.addEventListener('click', () => { S.editCtx = k; paintDD(); }); cx.append(b); }); dd.append(cx);
      const h5 = el('h5'); h5.append(el('span', null, 'Keep for ' + CTX[S.editCtx][0]), el('span', null, CTX[S.editCtx][2].length + ' apps')); const ch = el('div', 'qd-chips');
      APPS.forEach(a => { if (S.pins.has(a.id)) return; const on = CTX[S.editCtx][2].includes(a.id), b = el('button'), ic = el('i', null, a.g.slice(0, 2)); b.type = 'button'; ic.style.setProperty('--c', a.c); b.append(ic, document.createTextNode(a.n)); b.setAttribute('aria-pressed', String(on));
        b.addEventListener('click', () => { const list = CTX[S.editCtx][2], i = list.indexOf(a.id); if (i >= 0) { if (a.id === CTX[S.editCtx][1]) { say('The context’s own app always stays'); return; } list.splice(i, 1); } else list.push(a.id); check('rule'); tone(i >= 0 ? 440 : 700, .03); layout(); paintDD(); }); ch.append(b); }); dd.append(h5, ch);
      const p5 = el('h5'); p5.append(el('span', null, 'Pinned · never hide'), el('span', null, String(S.pins.size))); const pc = el('div', 'qd-chips pins');
      APPS.forEach(a => { const b = el('button'), ic = el('i', null, a.g.slice(0, 2)); b.type = 'button'; ic.style.setProperty('--c', a.c); b.append(ic, document.createTextNode(a.n)); b.setAttribute('aria-pressed', String(S.pins.has(a.id)));
        if (!S.pins.has(a.id) && !['music', 'mail', 'messages', 'photos', 'calendar'].includes(a.id)) return;
        b.addEventListener('click', () => { if (S.pins.has(a.id)) S.pins.delete(a.id); else { S.pins.add(a.id); check('pin'); } tone(820, .03); layout(); paintDD(); }); pc.append(b); }); dd.append(p5, pc);
      sum = el('p', 'qd-sum'); dd.append(sum); paintSum(); }
    H.jump = (k, fs) => { if (fs) return; if (W[k]) focusWin(k); };
    focusWin('code', true); S.ctx = 'code'; layout(); paintSum();
    setTimeout(() => { if (!dd) openDD(true); }, 900);
  }
  demo(H.app, H);
  H.boot();
})();
