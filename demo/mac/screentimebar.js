/* ScreenTimeBar — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "deskSplit";
/* ---------- ScreenTimeBar ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, tone, haptic, check, say, desk, extra, win } = H;
    const CAT = { work: ['Productive', '#7C3AED'], social: ['Social', '#0EA5E9'], fun: ['Entertainment', '#D6246E'], other: ['Other', '#9CA3AF'] };
    const APPS = [['xcode', 'Xcode', 'work', 'X', '#2563EB', 102], ['notion', 'Notion', 'work', 'N', '#1B1A2E', 38], ['mail', 'Mail', 'work', 'M', '#3B82F6', 12], ['messages', 'Messages', 'social', 'Me', '#22C55E', 24], ['x', 'X', 'social', '𝕏', '#111827', 31], ['youtube', 'YouTube', 'fun', '▶', '#FF0033', 22], ['music', 'Music', 'fun', '♪', '#F43F5E', 46]]
      .map(([id, n, cat, g, c, m]) => ({ id, n, cat, g, c, m, limit: id === 'youtube' ? 30 : id === 'x' ? 0 : 0 }));
    const byId = Object.fromEntries(APPS.map(a => [a.id, a]));
    const S = { active: 'xcode', hour: 14 * 60 + 10, focus: 0, snoozed: {}, tab: 'today' };
    const HOURS = Array.from({ length: 24 }, (_, h) => h < 8 ? 0 : h > 14 ? 0 : [0, 0, 0, 0, 0, 0, 0, 0, 22, 41, 48, 35, 26, 44, 38][h] || 0);
    const total = () => APPS.reduce((a, b) => a + b.m, 0), fmt = m => Math.floor(m / 60) + 'h ' + String(Math.round(m % 60)).padStart(2, '0') + 'm', fmtS = m => m >= 60 ? fmt(m) : Math.round(m) + 'm', catSum = k => APPS.filter(a => a.cat === k).reduce((x, a) => x + a.m, 0);
    /* ---- report window (frame window) ---- */
    const ttl = win.querySelector('.ttl'); if (ttl) ttl.textContent = 'ScreenTimeBar — Report';
    const root = el('div', 'sb'), tabs = el('div', 'sb-tabs'), body = el('div', 'sb-body'); root.append(tabs, body); app.append(root);
    [['today', 'Today'], ['week', 'This week'], ['limits', 'Limits']].forEach(([k, l]) => { const b = el('button', null, l); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.t = k; b.addEventListener('click', () => { S.tab = k; if (k === 'week') check('week'); paintWin(); }); tabs.append(b); });
    let live = {};
    function paintWin() { tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === S.tab))); body.textContent = ''; live = {};
      if (S.tab === 'today') { const bg = el('div', 'sb-big'), tb = el('b'); live.tot = tb; bg.append(tb, el('span', null, 'today · avg 5h 10m')); body.append(bg); const ch = el('div', 'sb-chart'); live.ch = ch; body.append(ch); const lg = el('div', 'sb-legend'); Object.values(CAT).forEach(([n, c]) => { const sp = el('span', null, n); sp.style.setProperty('--c', c); lg.append(sp); }); body.append(lg); live.rows = el('div', 'sb-rows'); body.append(live.rows); paintToday(); }
      else if (S.tab === 'week') { const D = [[312, .58, .14, .2], [286, .62, .12, .18], [344, .5, .18, .24], [298, .66, .1, .16], [370, .44, .2, .3], [210, .2, .3, .45]];
        const today = [total(), catSum('work') / total(), catSum('social') / total(), catSum('fun') / total()], days = [...D, today], avg = days.reduce((a, d) => a + d[0], 0) / days.length;
        const bg = el('div', 'sb-big'); bg.append(el('b', null, fmt(avg)), el('span', null, 'daily average · this week')); body.append(bg); const ch = el('div', 'sb-chart'), sv = svgEl('svg', { viewBox: '0 0 520 250', role: 'img', 'aria-label': 'Screen time per day this week, stacked by category' }), mx = Math.max(...days.map(d => d[0]));
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((dn, i) => { const d = days[i], x = 30 + i * 70, hT = d[0] / mx * 200; let y = 228; [['work', d[1]], ['social', d[2]], ['fun', d[3]], ['other', Math.max(0, 1 - d[1] - d[2] - d[3])]].forEach(([k, f]) => { const h = hT * f; sv.append(svgEl('rect', { x, y: y - h, width: 40, height: Math.max(0, h - 1.5), rx: 4, fill: CAT[k][1], opacity: i === 6 ? 1 : .8 })); y -= h; });
          const t = svgEl('text', { x: x + 8, y: 244 }); t.textContent = i === 6 ? 'Today' : dn; sv.append(t); const v = svgEl('text', { x: x + 2, y: 222 - hT }); v.textContent = fmtS(d[0]); sv.append(v); });
        const ay = 228 - avg / mx * 200; sv.append(svgEl('line', { x1: 20, x2: 510, y1: ay, y2: ay, stroke: '#1B1A2E', 'stroke-dasharray': '4 4', opacity: .5 })); ch.append(sv); body.append(ch);
        if (G && !reduced) G.from(sv.querySelectorAll('rect'), { scaleY: 0, transformOrigin: '50% 100%', stagger: .02, duration: .5, ease: 'back.out(1.4)' }); }
      else { body.append(el('p', null, 'Daily limits · drag to set, 0 = no limit')); APPS.forEach(a => body.append(limRow(a, 'win'))); } }
    function paintToday() { if (!live.tot) return; live.tot.textContent = fmt(total()); const sv = svgEl('svg', { viewBox: '0 0 520 150', role: 'img', 'aria-label': 'Screen time per hour today' }), mx = Math.max(60, ...HOURS);
      HOURS.forEach((m, h) => { if (h < 7 || h > 22) return; const x = (h - 7) * 32 + 12, bh = m / mx * 118, now = h === Math.floor(S.hour / 60); sv.append(svgEl('rect', { x, y: 128 - bh, width: 22, height: Math.max(1, bh), rx: 5, fill: now ? '#D6246E' : '#C7C2EE' })); if (h % 3 === 1) { const t = svgEl('text', { x: x - 2, y: 145 }); t.textContent = String(h).padStart(2, '0'); sv.append(t); } });
      live.ch.textContent = ''; live.ch.append(sv); live.rows.textContent = ''; const mxA = Math.max(...APPS.map(a => a.m));
      APPS.slice().sort((a, b) => b.m - a.m).slice(0, 5).forEach(a => { const r = el('div', 'sb-row'), ic = el('i', null, a.g), bar = el('div'), u = el('u'); ic.style.setProperty('--c', a.c); u.style.setProperty('--c', CAT[a.cat][1]); u.style.width = (a.m / mxA * 100) + '%'; bar.append(u); if (a.limit) { const lm = el('s'); lm.style.left = Math.min(100, a.limit / mxA * 100) + '%'; bar.append(lm); } bar.append(el('span', null, a.n + (a.id === S.active ? ' · now' : ''))); r.append(ic, bar, el('b', null, fmtS(a.m))); live.rows.append(r); }); }
    function limRow(a, src) { const r = el('label', 'sb-lim'), ic = el('i', null, a.g), rg = el('input'), b = el('b', null, a.limit ? fmtS(a.limit) : 'off'); ic.style.setProperty('--c', a.c); rg.type = 'range'; rg.min = 0; rg.max = 180; rg.step = 5; rg.value = a.limit; rg.setAttribute('aria-label', a.n + ' daily limit in minutes');
      rg.addEventListener('input', () => { a.limit = +rg.value; delete S.snoozed[a.id]; b.textContent = a.limit ? fmtS(a.limit) : 'off'; if (a.limit) check('limit'); paintToday(); if (src === 'dd') { if (S.tab === 'limits') paintWin(); } else if (dd) paintDD(); }); r.append(ic, rg, b); return r; }
    /* ---- the app in front ---- */
    const front = el('section', 'sb-app'), fh = el('header'), fbd = el('div', 'bd'); fh.append(el('i'), el('span')); front.append(fh, fbd); desk.append(front);
    const VIEW = { xcode: () => { const c = el('div', 'ap-code'); [[['k', 'struct'], ['', ' Usage {']], [['', '  '], ['k', 'var'], ['', ' minutes: '], ['t', 'Int']], [['', '  '], ['k', 'func'], ['', ' limitReached() -> '], ['t', 'Bool'], ['', ' {']], [['', '    minutes >= limit']], [['', '  }']], [['', '}']]].forEach(l => { const d = el('div'); l.forEach(([k, t]) => d.append(k ? el('span', k, t) : document.createTextNode(t))); c.append(d); }); return c; },
      notion: () => { const d = el('div', 'ap-doc'); d.append(el('h4', null, 'Q4 roadmap'), el('p', null, 'Ship the weekly report, then limits. Focus blocks after that.'), el('i'), el('i'), el('i')); return d; },
      mail: () => { const d = el('div', 'ap-doc'); d.append(el('h4', null, 'Inbox · 4 unread'), el('p', null, 'Invoice #2291 · Studio North'), el('p', null, 'Design review moved to 15:00')); return d; },
      messages: () => { const d = el('div', 'ap-msg'); d.append(el('p', null, 'lunch tomorrow?'), el('p', 'me', 'yes! the noodle place'), el('p', null, '12:30 then 🍜')); return d; },
      x: () => { const d = el('div', 'ap-x'); [['@designnotes', 'Why every dashboard looks the same'], ['@swiftlang', 'Swift 6.1 is out'], ['@nasa', 'A new view of the Pillars of Creation']].forEach(([h, t]) => { const r = el('div'), m = el('div'); m.append(el('b', null, h), el('br'), document.createTextNode(t)); r.append(el('i'), m); d.append(r); }); return d; },
      youtube: () => { const d = el('div', 'ap-yt'), p = el('div', 'pl'), pb = el('b', null, '▶'), t = el('p', null, 'Building a menu bar app in SwiftUI'); p.append(pb); t.append(el('small', null, '1.2M views · 18:42')); d.append(p, t); return d; },
      music: () => { const d = el('div', 'ap-music'), m = el('div'); m.append(el('b', null, 'Late Light'), el('span', null, 'Album · 12 songs · playing')); d.append(el('div', 'cov'), m); return d; } };
    function showFront() { const a = byId[S.active]; fh.lastChild.textContent = a.n; fbd.textContent = ''; fbd.append(VIEW[a.id]()); if (G && !reduced) G.fromTo(front, { scale: .985 }, { scale: 1, duration: .3, ease: 'power2.out' }); paintShield(); }
    let shield = null; function paintShield() { if (shield) { shield.remove(); shield = null; } const a = byId[S.active], over = a.limit && a.m >= a.limit + (S.snoozed[a.id] || 0); if (!over) return;
      shield = el('div', 'sb-shield'); const box = el('div'), row = el('div'), ig = el('button', null, 'One more 15 min'), ok = el('button', 'ok', 'OK, close it'); ig.type = ok.type = 'button'; box.append(el('div', 'ic', '⏳'), el('b', null, 'Time limit reached'), el('p', null, a.n + ' · ' + fmtS(a.m) + ' of your ' + fmtS(a.limit) + ' today'), row); row.append(ig, ok); shield.append(box); front.append(shield);
      check('hit'); tone(330, .1, 'triangle', .04); haptic(20); ig.addEventListener('click', () => { S.snoozed[a.id] = (S.snoozed[a.id] || 0) + 15; paintShield(); say('15 more minutes of ' + a.n); }); ok.addEventListener('click', () => switchTo('xcode', true)); }
    /* ---- ⌘Tab switcher ---- */
    const sw = el('nav', 'sb-sw'); sw.setAttribute('aria-label', 'App switcher'); sw.append(el('kbd', null, '⌘ Tab')); desk.append(sw);
    const swBtns = APPS.map(a => { const b = el('button'), ic = el('i', null, a.g); b.type = 'button'; ic.style.setProperty('--c', a.c); b.append(ic, document.createTextNode(a.n)); b.dataset.a = a.id; b.addEventListener('click', () => switchTo(a.id)); sw.append(b); return b; });
    function switchTo(id, quiet) { const a = byId[id]; if (S.focus > 0 && (a.cat === 'social' || a.cat === 'fun')) { say('Focus block: ' + a.n + ' is paused for ' + Math.ceil(S.focus) + ' more min'); tone(220, .08, 'square', .03); if (G && !reduced) G.fromTo(swBtns[APPS.indexOf(a)], { x: -6 }, { x: 0, duration: .4, ease: 'elastic.out(1,.3)' }); return; }
      if (S.active !== id) { S.active = id; if (!quiet) { check('switch'); tone(600 + APPS.indexOf(a) * 40, .03); } } paintSw(); showFront(); paintToday(); if (dd) paintDD(); }
    function paintSw() { swBtns.forEach(b => { const a = byId[b.dataset.a]; b.setAttribute('aria-pressed', String(a.id === S.active)); b.classList.toggle('lock', S.focus > 0 && (a.cat === 'social' || a.cat === 'fun')); }); }
    window.addEventListener('keydown', e => { if (e.key === 'Tab' && (e.metaKey || e.altKey)) { e.preventDefault(); const i = APPS.findIndex(a => a.id === S.active); for (let k = 1; k <= APPS.length; k++) { const n = APPS[(i + k) % APPS.length]; if (!(S.focus > 0 && (n.cat === 'social' || n.cat === 'fun'))) { switchTo(n.id); break; } } } });
    /* ---- menu bar ---- */
    const mx = el('button', 'sb-mx'), msv = svgEl('svg', { viewBox: '0 0 14 14', 'aria-hidden': 'true' }), mt = el('span'); msv.append(svgEl('circle', { cx: 7, cy: 7, r: 5.5, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6 }), svgEl('path', { d: 'M7 3.6 V7 L9.4 8.4', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round' })); mx.append(msv, mt); mx.type = 'button'; mx.setAttribute('aria-haspopup', 'true'); mx.setAttribute('aria-expanded', 'false'); extra.append(mx);
    let dd = null, ddL = {};
    function openDD(auto) { if (dd) { closeDD(); return; } dd = el('div', 'sb-dd'); dd.setAttribute('role', 'dialog'); dd.setAttribute('aria-label', 'ScreenTimeBar'); const r = mx.getBoundingClientRect(), dr = desk.getBoundingClientRect(), sc = dr.width / 1200; dd.style.left = Math.min(1200 - 322, (r.left - dr.left) / sc - 140) + 'px'; desk.append(dd); mx.setAttribute('aria-expanded', 'true'); paintDD(); if (G && !reduced && !auto) G.from(dd, { opacity: 0, y: -6, duration: .2 }); }
    function closeDD() { if (!dd) return; dd.remove(); dd = null; mx.setAttribute('aria-expanded', 'false'); }
    mx.addEventListener('click', e => { e.stopPropagation(); openDD(); });
    function paintDD() { if (!dd) return; dd.textContent = ''; const top2 = el('div', 'top2'), sv = svgEl('svg', { viewBox: '0 0 96 96', 'aria-hidden': 'true' }), T = total(), C = 2 * Math.PI * 38; let off = 0;
      Object.entries(CAT).forEach(([k, [, c]]) => { const v = catSum(k); if (!v) return; const L = v / T * C; sv.append(svgEl('circle', { cx: 48, cy: 48, r: 38, fill: 'none', stroke: c, 'stroke-width': 14, 'stroke-dasharray': Math.max(0, L - 2).toFixed(1) + ' ' + C.toFixed(1), 'stroke-dashoffset': (-off).toFixed(1) })); off += L; });
      const tx = el('div'), tb = el('b', null, fmt(T)); ddL.tot = tb; tx.append(tb, el('span', null, 'today · ' + Math.round(catSum('work') / T * 100) + '% productive')); top2.append(sv, tx); dd.append(top2);
      dd.append(el('h5', null, 'Limits')); APPS.filter(a => a.cat !== 'work').forEach(a => dd.append(limRow(a, 'dd')));
      const fb = el('button', 'sb-focus' + (S.focus > 0 ? ' on' : ''), S.focus > 0 ? 'Focus · ' + Math.ceil(S.focus) + ' min left · End' : 'Start 25-min focus block'); fb.type = 'button'; ddL.fb = fb;
      fb.addEventListener('click', () => { if (S.focus > 0) { S.focus = 0; say('Focus block ended'); } else { S.focus = 25; check('focus'); tone(660, .05); setTimeout(() => tone(990, .07), 100); say('Focus: social and entertainment paused for 25 min'); const a = byId[S.active]; if (a.cat === 'social' || a.cat === 'fun') switchTo('xcode', true); } paintSw(); paintDD(); paintMx(); }); dd.append(fb); }
    function paintMx() { mt.textContent = S.focus > 0 ? 'Focus ' + Math.ceil(S.focus) + 'm' : fmt(total()); mx.classList.toggle('fo', S.focus > 0); mx.setAttribute('aria-label', 'ScreenTimeBar, ' + mt.textContent + ' today'); }
    /* ---- the clock: 1 s = 1 min for the app in front ---- */
    setInterval(() => { const d = .25, a = byId[S.active]; a.m += d; S.hour = (S.hour + d) % 1440; HOURS[Math.floor(S.hour / 60)] += d;
      if (S.focus > 0) { S.focus = Math.max(0, S.focus - d); if (S.focus === 0) { say('Focus block done. Nice work.'); tone(880, .08); paintSw(); if (dd) paintDD(); } else if (dd && ddL.fb) ddL.fb.textContent = 'Focus · ' + Math.ceil(S.focus) + ' min left · End'; }
      paintMx(); if (dd && ddL.tot) ddL.tot.textContent = fmt(total()); if (live.tot) { live.tot.textContent = fmt(total()); }
      tick++; if (tick % 4 === 0) paintToday(); if (!shield && a.limit && a.m >= a.limit + (S.snoozed[a.id] || 0)) paintShield(); }, 250);
    let tick = 0;
    H.jump = (k, fs) => { if (fs) return; if (k === 'today' || k === 'week') { S.tab = k; if (k === 'week') check('week'); paintWin(); } else if (k === 'focus') { if (!dd) openDD(); if (S.focus <= 0 && ddL.fb) ddL.fb.click(); } };
    paintWin(); paintSw(); showFront(); paintMx(); setTimeout(() => { if (!dd) openDD(true); }, 900);
  }
  demo(H.app, H);
  H.boot();
})();
