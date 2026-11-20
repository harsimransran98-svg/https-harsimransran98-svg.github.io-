/* GestureBar — Safari extension page with a live browser simulator (Bazozo Studio, generated).
   All DOM is built with createElement + textContent. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap || null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} } };
  let tt = null;
  const toast = msg => { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(tt); if (G && !reduced) G.fromTo(t, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'back.out(2)' }); tt = setTimeout(() => { t.hidden = true; }, 2600); };
  let ac = null;
  const tone = (f = 440, d = .12, type = 'sine', v = .05) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + d + .02); } catch (_) {} };
  const audio = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); return ac; } catch (_) { return null; } };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- smooth scroll (Lenis) + ScrollTrigger ---------- */
  let lenis = null;
  if (G && window.ScrollTrigger) G.registerPlugin(ScrollTrigger);
  if (window.Lenis && G && !reduced) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    G.ticker.add(t => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'); const t = id.length > 1 ? $(id) : null; if (!t && id !== '#top') return; e.preventDefault(); closeMenu(); if (lenis) lenis.scrollTo(id === '#top' ? 0 : t, { offset: -70 }); else (t || document.body).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }));
  const nav = $('#nav'), prog = $('#prog');
  const onScroll = () => { const h = document.documentElement, y = window.scrollY; nav.classList.toggle('scrolled', y > 40); prog.style.transform = `scaleX(${Math.min(1, y / ((h.scrollHeight - h.clientHeight) || 1))})`; };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- animated menu ---------- */
  const burger = $('#burger'), menu = $('#menu'), variant = +menu.dataset.variant;
  let menuOpen = false, back = null;
  function openMenu() {
    menuOpen = true; menu.hidden = false; burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Close menu');
    if (lenis) lenis.stop(); document.documentElement.style.overflow = 'hidden';
    const links = menu.querySelectorAll('nav a, .mnote');
    if (variant === 2) { back = el('div', 'menu-back'); back.addEventListener('click', closeMenu); document.body.append(back); }
    if (G && !reduced) {
      if (variant === 1) G.fromTo(menu, { clipPath: 'circle(0% at calc(100% - 44px) 40px)' }, { clipPath: 'circle(150% at calc(100% - 44px) 40px)', duration: .8, ease: 'power3.inOut' });
      if (variant === 2) { G.fromTo(menu, { xPercent: 100 }, { xPercent: 0, duration: .8, ease: 'elastic.out(1,.85)' }); G.from(back, { opacity: 0, duration: .3 }); }
      if (variant === 3) G.fromTo(menu, { scaleY: 0 }, { scaleY: 1, duration: .6, ease: 'expo.inOut' });
      if (variant === 4) { G.set(menu, { clipPath: 'none' }); G.fromTo(menu.querySelectorAll('.tiles i'), { scale: 0, borderRadius: '50%' }, { scale: 1.02, borderRadius: '0%', duration: .55, stagger: .07, ease: 'power3.out' }); }
      G.fromTo(links, { y: 60, opacity: 0, rotation: variant === 3 ? 4 : 0 }, { y: 0, opacity: 1, rotation: 0, duration: .7, stagger: .06, delay: .25, ease: 'expo.out' });
    }
    setTimeout(() => { const a = menu.querySelector('nav a'); if (a) a.focus(); }, 300);
  }
  function closeMenu() {
    if (!menuOpen) return; menuOpen = false; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu');
    if (lenis) lenis.start(); document.documentElement.style.overflow = '';
    const done = () => { menu.hidden = true; if (G) G.set(menu, { clearProps: 'all' }); if (back) { back.remove(); back = null; } };
    if (G && !reduced) {
      if (variant === 1) G.to(menu, { clipPath: 'circle(0% at calc(100% - 44px) 40px)', duration: .55, ease: 'power3.inOut', onComplete: done });
      else if (variant === 2) { G.to(menu, { xPercent: 100, duration: .45, ease: 'power3.in', onComplete: done }); if (back) G.to(back, { opacity: 0, duration: .3 }); }
      else if (variant === 3) G.to(menu, { scaleY: 0, transformOrigin: '50% 100%', duration: .5, ease: 'expo.inOut', onComplete: done });
      else G.to(menu.querySelectorAll('.tiles i, nav a, .mnote'), { scale: 0, opacity: 0, duration: .35, stagger: .03, ease: 'power2.in', onComplete: done });
    } else done();
    burger.focus();
  }
  burger.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) closeMenu(); });

  /* ---------- buttons ---------- */
  const BTN = 2;
  $$('.btn').forEach(b => {
    if (BTN === 4) { const label = b.textContent; b.textContent = ''; const r = el('span', 'roll'); r.append(el('span', null, label), el('span', null, label)); b.append(r); b.setAttribute('aria-label', label); }
    if (BTN === 2 && G && !reduced) {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); G.to(b, { x: (e.clientX - r.left - r.width / 2) * .35, y: (e.clientY - r.top - r.height / 2) * .45, duration: .4, ease: 'power3.out' }); });
      b.addEventListener('pointerleave', () => G.to(b, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.35)' }));
    }
  });

  /* ---------- hero + reveals (responsive with matchMedia) ---------- */
  if (G && !reduced) {
    G.from('#h1 .w > span', { yPercent: 115, duration: 1.1, stagger: .07, ease: 'expo.out', delay: .15 });
    G.from('.hero .kick, .hero .lead, .hero .acts, .hero .stats', { y: 24, opacity: 0, duration: .9, stagger: .1, ease: 'expo.out', delay: .45 });
    G.from('.orb', { scale: .4, opacity: 0, duration: 1.6, stagger: .15, ease: 'expo.out' });
    const mm = G.matchMedia();
    mm.add('(min-width: 861px)', () => { if (window.ScrollTrigger) $$('.orb').forEach((o, i) => G.to(o, { yPercent: (i % 2 ? -1 : 1) * 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } })); });
    if (window.ScrollTrigger) G.from('.cx', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.cx', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };
  /* ---------- Safari toolbar popup ---------- */
  const cxExt = $('#cxExt'), cxPop = $('#cxPop');
  let cxOpen = false; const cxHooks = [];
  function cxShow() { if (cxOpen) return; cxOpen = true; cxPop.hidden = false; cxExt.setAttribute('aria-expanded', 'true'); if (G && !reduced) G.fromTo(cxPop, { scale: .88, opacity: 0, y: -8 }, { scale: 1, opacity: 1, y: 0, duration: .45, ease: 'back.out(1.8)' }); cxHooks.forEach(f => f(true)); }
  function cxHide() { if (!cxOpen) return; cxOpen = false; cxExt.setAttribute('aria-expanded', 'false'); const done = () => { cxPop.hidden = true; if (G) G.set(cxPop, { clearProps: 'all' }); }; if (G && !reduced) G.to(cxPop, { scale: .92, opacity: 0, duration: .18, onComplete: done }); else done(); cxHooks.forEach(f => f(false)); }
  cxExt.addEventListener('click', () => cxOpen ? cxHide() : cxShow());
  $('#cxPopX').addEventListener('click', cxHide);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && cxOpen && !menuOpen) cxHide(); });
  H.pop = { body: $('#cxPopBody'), open: cxShow, close: cxHide, isOpen: () => cxOpen, onToggle: f => cxHooks.push(f) };
  H.badge = v => { const b = $('#cxBadge'); b.hidden = v == null || v === '' || v === 0; b.textContent = String(v); if (G && !reduced && !b.hidden) G.fromTo(b, { scale: 1.6 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); };
  H.url = t => { $('#cxUrl').textContent = t; };
  H.flyToIcon = (fromEl, color) => {
    if (!G || reduced) return; const a = fromEl.getBoundingClientRect(), b = cxExt.getBoundingClientRect(), d = el('i');
    Object.assign(d.style, { position: 'fixed', zIndex: 95, left: a.left + a.width / 2 + 'px', top: a.top + a.height / 2 + 'px', width: '14px', height: '14px', margin: '-7px 0 0 -7px', borderRadius: '50%', background: color || 'var(--accent)', boxShadow: '0 0 14px var(--accent)', pointerEvents: 'none' });
    document.body.append(d);
    G.to(d, { x: b.left + b.width / 2 - (a.left + a.width / 2), duration: .6, ease: 'power1.in' });
    G.to(d, { y: b.top + b.height / 2 - (a.top + a.height / 2), duration: .6, ease: 'back.in(1.4)', onComplete: () => { d.remove(); G.fromTo(cxExt, { scale: 1.35 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); } });
  };


/* ---------- GestureBar simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"pages":{"home":{"t":"Field Notes — a slow travel blog","h":"fieldnotes.example","h1":"Field Notes","dek":"Slow journeys, long walks and small towns.","links":["porto","dolomites","kyoto"]},"porto":{"t":"Three slow days in Porto","h":"fieldnotes.example/porto","h1":"Three slow days in Porto","dek":"Tiles, tram 28 and the best custard tart we found.","links":["dolomites","kyoto"]},"dolomites":{"t":"Hut to hut in the Dolomites","h":"fieldnotes.example/dolomites","h1":"Hut to hut in the Dolomites","dek":"Five days, four huts and one unforgettable sunrise.","links":["porto","kyoto"]},"kyoto":{"t":"Kyoto before 8am","h":"fieldnotes.example/kyoto","h1":"Kyoto before 8am","dek":"Empty shrines and steaming bowls of breakfast tofu.","links":["porto","dolomites"]}},"key":"gb_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const ACT = { back: 'Back', forward: 'Forward', top: 'Scroll to top', bottom: 'Scroll to bottom', close: 'Close tab', reopen: 'Reopen closed tab', newtab: 'New tab', reload: 'Reload page', none: 'Do nothing' };
    const DEF = { L: 'back', R: 'forward', U: 'top', D: 'bottom', DR: 'close', UL: 'reopen', UR: 'newtab', DL: 'reload' };
    const ARW = { L: '←', R: '→', U: '↑', D: '↓' };
    const GR = { home: 'linear-gradient(135deg, #0A84FF, #5AC8FA)', porto: 'linear-gradient(135deg, #2B59C3, #F2C14E)', dolomites: 'linear-gradient(135deg, #3E7C59, #C9D6DF)', kyoto: 'linear-gradient(135deg, #C1121F, #FDF0D5)', start: 'linear-gradient(135deg, #8E8E93, #C7C7CC)' };
    const saved = store.get(M.key, null) || {};
    const S = { on: saved.on !== false, trail: saved.trail !== false, map: {} };
    Object.keys(DEF).forEach(k => { S.map[k] = saved.map && ACT[saved.map[k]] ? saved.map[k] : DEF[k]; });
    const save = () => store.set(M.key, S);
    let tabs = [{ st: ['home'], i: 0 }], act = 0, closed = [], count = 0, lastG = '–';

    /* ---- tabs ---- */
    const cx = document.getElementById('cx'), strip = cx.querySelector('.cx-tabs'), oldPlus = strip.querySelector('.cx-plus');
    strip.querySelectorAll('.cx-tab').forEach(n => n.remove()); const plus = btn('cx-plus', '+'); plus.setAttribute('aria-label', 'New tab'); oldPlus.replaceWith(plus); plus.addEventListener('click', () => run('newtab'));
    const pg = t => t.st[t.i];
    function renderTabs(fresh) {
      strip.querySelectorAll('.gb-t').forEach(n => n.remove());
      tabs.forEach((t, i) => { const p = pg(t), n = el('div', 'cx-tab gb-t' + (i === act ? ' on' : '') + (fresh === t ? ' new' : '')); n.setAttribute('role', 'tab'); n.setAttribute('aria-selected', String(i === act)); n.tabIndex = 0;
        const f = el('i', 'fav'); f.style.background = GR[p]; const x = btn('gb-x', '×'); x.setAttribute('aria-label', 'Close tab'); x.addEventListener('click', e => { e.stopPropagation(); act = i; run('close'); });
        n.append(x, f, el('span', null, p === 'start' ? 'Start Page' : M.pages[p].t)); n.addEventListener('click', () => { act = i; renderTabs(); paint(0); }); strip.insertBefore(n, plus); });
    }

    /* ---- pages ---- */
    let site = null;
    function paint(dir) {
      const p = pg(tabs[act]); page.textContent = ''; page.scrollTop = 0;
      site = el('div', 'gb-site'); site.style.setProperty('--g', GR[p]);
      const go = k => { const t = tabs[act]; t.st = t.st.slice(0, t.i + 1); t.st.push(k); t.i++; renderTabs(); paint(1); };
      if (p === 'start') { H.url('Search or enter website name'); site.style.background = '#F2F1EE'; const s0 = el('div', 'gb-start'), fav = el('div', 'gb-fav'); s0.append(el('h3', null, 'Favourites'));
        Object.keys(M.pages).forEach(k => { const b = btn(''), i = el('i'); i.style.setProperty('--g', GR[k]); b.append(i, document.createTextNode(k === 'home' ? 'Field Notes' : M.pages[k].h1.split(' ').slice(0, 3).join(' '))); b.addEventListener('click', () => go(k)); fav.append(b); }); s0.append(fav); site.append(s0); }
      else { const d = M.pages[p]; H.url(d.h); const top = el('div', 'gb-top'); top.append(document.createTextNode('Field Notes'), el('span', null, 'Journeys · Maps · About'));
        const body = el('div', 'gb-body'); body.append(el('h1', null, d.h1), el('p', 'dek', d.dek));
        ['We went slowly on purpose. No checklist, no early alarms, just a rough route and whatever the day offered.', 'Most of the best moments came from walking without a plan: a side street, a market stall, a bench with a view nobody mentions online.', 'If you only remember one thing, take the long way between places. It is usually where the trip actually happens.', 'We kept notes each evening, and these pages are what survived the coffee stains.'].forEach(t => body.append(el('p', null, t)));
        const ln = el('div', 'gb-links'); d.links.forEach(k => { const b = btn(''), i = el('i'), sp = el('span'); i.style.setProperty('--g', GR[k]); sp.append(document.createTextNode(M.pages[k].h1), el('small', null, M.pages[k].dek)); b.append(i, sp); b.addEventListener('click', () => go(k)); ln.append(b); });
        body.append(ln); site.append(top, el('div', 'gb-hero'), body); }
      page.append(site);
      if (dir && G && !reduced) G.from(site, { x: 60 * dir, opacity: 0, duration: .45, ease: 'expo.out' });
    }

    /* ---- actions ---- */
    function run(a) {
      const t = tabs[act];
      if (a === 'back') { if (t.i > 0) { t.i--; renderTabs(); paint(-1); } else { toast('No page to go back to. Follow a link first'); return false; } }
      else if (a === 'forward') { if (t.i < t.st.length - 1) { t.i++; renderTabs(); paint(1); } else { toast('Nothing ahead yet'); return false; } }
      else if (a === 'top') page.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      else if (a === 'bottom') page.scrollTo({ top: page.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
      else if (a === 'close') { closed.push(tabs.splice(act, 1)[0]); if (!tabs.length) tabs.push({ st: ['start'], i: 0 }); act = Math.max(0, act - 1); renderTabs(); paint(0); }
      else if (a === 'reopen') { const c = closed.pop(); if (!c) { toast('No closed tabs to reopen'); return false; } tabs.push(c); act = tabs.length - 1; renderTabs(c); paint(1); }
      else if (a === 'newtab') { if (tabs.length >= 6) { toast('Close a tab first'); return false; } const n = { st: ['start'], i: 0 }; tabs.push(n); act = tabs.length - 1; renderTabs(n); paint(1); }
      else if (a === 'reload') { if (G && !reduced) G.fromTo(site, { opacity: .2 }, { opacity: 1, duration: .6 }); }
      H.tone(a === 'back' ? 440 : a === 'forward' ? 660 : 550, .06); return true;
    }

    /* ---- gesture capture ---- */
    const view = page.parentElement, cv = el('canvas', 'gb-cv'), hud = el('div', 'gb-hud'), hb = el('b'), hs = el('span'); hud.append(hb, hs); view.append(cv, hud);
    const eL = el('div', 'gb-edge l', '‹'), eR = el('div', 'gb-edge r', '›'); view.append(eL, eR);
    const ctx = cv.getContext('2d'); let pts = null, seq = [], anchor = null, active = false, eatClick = false;
    function size() { const r = view.getBoundingClientRect(), d = window.devicePixelRatio || 1; cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
    window.addEventListener('resize', size); size();
    const local = e => { const r = view.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    function draw() { ctx.clearRect(0, 0, cv.width, cv.height); if (!S.trail || !pts || pts.length < 2) return; ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0A84FF'; ctx.lineWidth = 5; ctx.globalAlpha = .85; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); pts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.stroke(); ctx.globalAlpha = 1; ctx.fillStyle = ctx.strokeStyle; const l = pts[pts.length - 1]; ctx.beginPath(); ctx.arc(l[0], l[1], 6, 0, 7); ctx.fill(); }
    page.addEventListener('pointerdown', e => { if (!S.on || e.button > 0) return; pts = [local(e)]; anchor = pts[0]; seq = []; active = false; });
    page.addEventListener('pointermove', e => {
      if (!pts) return; const p = local(e); pts.push(p);
      if (!active && Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]) > 14) { active = true; if (site) site.classList.add('drag'); try { page.setPointerCapture(e.pointerId); } catch (_) {} }
      if (!active) return; e.preventDefault();
      const dx = p[0] - anchor[0], dy = p[1] - anchor[1];
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 34) { const d = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'L' : 'R') : (dy < 0 ? 'U' : 'D'); if (seq[seq.length - 1] !== d && seq.length < 3) seq.push(d); anchor = p; }
      draw(); showHud(seq.join(''), true);
    });
    const end = () => {
      if (!pts) return; const was = active; pts = null; if (site) site.classList.remove('drag');
      if (!was) return; eatClick = true; setTimeout(() => { eatClick = false; }, 50);
      const key = seq.join(''), a = S.map[key];
      if (a && a !== 'none') { const ok = run(a); count++; lastG = key; showHud(key, false, ok ? ACT[a] : ACT[a] + ' · not available'); flash(key); renderPop(); }
      else showHud(key || '·', false, key ? 'No action for this gesture' : 'Too short', true);
      if (G && !reduced) G.to(cv, { opacity: 0, duration: .4, onComplete: () => { ctx.clearRect(0, 0, cv.width, cv.height); G.set(cv, { opacity: 1 }); } }); else ctx.clearRect(0, 0, cv.width, cv.height);
    };
    page.addEventListener('pointerup', end); page.addEventListener('pointercancel', end);
    page.addEventListener('click', e => { if (eatClick) { e.stopPropagation(); e.preventDefault(); } }, true);
    function showHud(key, live, label, bad) {
      hb.textContent = key.split('').map(k => ARW[k] || k).join(' '); hs.textContent = live ? (S.map[key] ? ACT[S.map[key]] : '…') : label; hud.classList.toggle('no', !!bad);
      if (G && !reduced) { G.killTweensOf(hud); G.set(hud, { opacity: 1 }); if (!live) G.to(hud, { opacity: 0, duration: .5, delay: .7 }); } else hud.style.opacity = live ? 1 : 0;
    }
    /* two-finger swipe */
    let acc = 0, wt = 0;
    page.addEventListener('wheel', e => {
      if (!S.on || Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.5) return; e.preventDefault(); acc += e.deltaX; clearTimeout(wt);
      const f = Math.min(1, Math.abs(acc) / 160), edge = acc < 0 ? eL : eR; [eL, eR].forEach(x => { x.style.opacity = x === edge ? f : 0; x.style.transform = 'scale(' + (.6 + f * .5) + ')'; });
      if (f >= 1) { const back = acc < 0, ok = run(back ? 'back' : 'forward'); acc = 0; [eL, eR].forEach(x => { x.style.opacity = 0; }); if (ok) toast(back ? 'Swiped back' : 'Swiped forward'); }
      wt = setTimeout(() => { acc = 0; [eL, eR].forEach(x => { x.style.opacity = 0; }); }, 260);
    }, { passive: false });

    /* ---- popover ---- */
    const NS = 'http://www.w3.org/2000/svg';
    const glyph = key => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 40 30'); s.setAttribute('aria-hidden', 'true'); let x = 20, y = 15; const st = { L: [-12, 0], R: [12, 0], U: [0, -10], D: [0, 10] };
      if (key.length === 2) { const [a, b] = key; x -= (st[a][0] + st[b][0]) / 2; y -= (st[a][1] + st[b][1]) / 2; } else { x -= st[key][0] / 2; y -= st[key][1] / 2; }
      let d = 'M' + x + ' ' + y; key.split('').forEach(k => { x += st[k][0]; y += st[k][1]; d += ' L' + x + ' ' + y; });
      const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 3.5); s.append(p, c); return s; };
    const P = el('div', 'pc'), power = swBtn('Gestures on', 'Draw anywhere on a page'), trail = swBtn('Show the trail', null, true);
    power.addEventListener('click', () => { S.on = !S.on; save(); renderPop(); toast(S.on ? 'Gestures on' : 'Gestures off'); });
    trail.addEventListener('click', () => { S.trail = !S.trail; save(); renderPop(); });
    const stat = el('div', 'gb-stat'), s1 = el('div'), s2 = el('div'), sc = el('b'), sl = el('b'); s1.append(sc, el('span', null, 'gestures used')); s2.append(sl, el('span', null, 'last gesture')); stat.append(s1, s2);
    const lb = el('div'), list = el('div', 'gb-list'); lb.append(label('Gestures'), list);
    const rows = {};
    Object.keys(DEF).forEach(k => { const r = el('div', 'gb-row'), wrap = el('div', 'gb-sel'), sel = el('select'), tr = btn('gb-try', 'Try');
      sel.setAttribute('aria-label', 'Action for gesture ' + k.split('').map(x => ({ L: 'left', R: 'right', U: 'up', D: 'down' })[x]).join(' then '));
      Object.entries(ACT).forEach(([v, t]) => { const o = el('option', null, t); o.value = v; sel.append(o); }); sel.value = S.map[k];
      sel.addEventListener('change', () => { S.map[k] = ACT[sel.value] ? sel.value : 'none'; save(); toast(k.split('').map(x => ARW[x]).join(' ') + ' now: ' + ACT[S.map[k]]); });
      tr.setAttribute('aria-label', 'Try ' + ACT[S.map[k]]); tr.addEventListener('click', () => { if (S.map[k] !== 'none') { run(S.map[k]); flash(k); } });
      wrap.append(sel); r.append(glyph(k), wrap, tr); list.append(r); rows[k] = r; });
    P.append(power, trail, stat, lb); pb.append(P);
    function flash(k) { const r = rows[k]; if (!r) return; r.classList.add('hit'); setTimeout(() => r.classList.remove('hit'), 900); }
    function renderPop() { power.setAttribute('aria-checked', String(S.on)); trail.setAttribute('aria-checked', String(S.trail)); sc.textContent = String(count); sl.textContent = lastG === '–' ? '–' : lastG.split('').map(k => ARW[k]).join(''); H.badge(count || ''); }
    renderTabs(); paint(0); renderPop();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
