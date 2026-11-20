/* SessionKeeper — Firefox add-on page with a live browser simulator (Bazozo Studio, generated).
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
  const BTN = 3;
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
  /* ---------- Firefox toolbar popup ---------- */
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


/* ---------- SessionKeeper simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"current":[{"t":"Lisbon: 3-day itinerary","h":"wanderly.example/lisbon","c":"#E0784A","b":"Wanderly","d":"Trams, tiles and custard tarts: the perfect three days in Lisbon."},{"t":"Flights LHR → LIS","h":"skyfare.example/lhr-lis","c":"#0EA5E9","b":"Skyfare","d":"Return flights from £74. Prices checked a minute ago."},{"t":"Alfama guesthouse","h":"staybook.example/alfama","c":"#16A34A","b":"Staybook","d":"A quiet room with a view over the river, 4.8 from 312 reviews."},{"t":"Pastéis de nata recipe","h":"spoonful.example/nata","c":"#F2A900","b":"Spoonful","d":"Crisp pastry, wobbly custard, burnt tops. Ready in an hour."}],"saved":[{"n":"Q3 report research","when":"Yesterday, 18:20","tabs":[{"t":"Market size 2026","h":"statsbase.example/market","c":"#6366F1","b":"Statsbase","d":"Global market size and growth rates by region."},{"t":"Competitor pricing","h":"pricewatch.example/saas","c":"#DC2626","b":"Pricewatch","d":"Plan prices for the top twelve tools, updated weekly."},{"t":"Q3 draft — Docs","h":"docs.example/q3-draft","c":"#2563EB","b":"Docs","d":"Draft: revenue up 18%, churn down to 2.1%."},{"t":"Survey results","h":"formly.example/results","c":"#9333EA","b":"Formly","d":"418 responses. Top request: better exports."},{"t":"Board deck template","h":"slides.example/board","c":"#EA580C","b":"Slides","d":"Twelve slides, brand colours, speaker notes."}]},{"n":"Weekend recipes","when":"Sat, 10:05","tabs":[{"t":"Shakshuka for two","h":"spoonful.example/shakshuka","c":"#F2A900","b":"Spoonful","d":"Eggs poached in a spiced tomato sauce. 25 minutes."},{"t":"Sourdough starter guide","h":"crumb.example/starter","c":"#A16207","b":"Crumb","d":"Day by day, from flour and water to bubbly starter."},{"t":"Farmers market hours","h":"localmarket.example","c":"#15803D","b":"Local Market","d":"Open Saturdays 8 to 1. Thirty stalls."}]}],"key":"sk_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const str = (v, n) => typeof v === 'string' ? v.slice(0, n) : '';
    const okTab = t => t && /^#[0-9a-f]{6}$/i.test(t.c) && typeof t.t === 'string' && typeof t.h === 'string';
    const cleanTabs = a => Array.isArray(a) ? a.filter(okTab).slice(0, 12).map(t => ({ t: str(t.t, 80), h: str(t.h, 80), c: t.c, b: str(t.b, 30), d: str(t.d, 160) })) : [];
    const saved = store.get(M.key, null) || {};
    const S = { auto: saved.auto !== false, sessions: Array.isArray(saved.sessions) ? saved.sessions.filter(x => x && typeof x.n === 'string').slice(0, 20).map(x => ({ n: str(x.n, 40), when: str(x.when, 30), tabs: cleanTabs(x.tabs) })).filter(x => x.tabs.length) : M.saved.slice() };
    const save = () => store.set(M.key, { auto: S.auto, sessions: S.sessions });
    let tabs = M.current.map(t => ({ ...t })), active = 0, autoSnap = null, autoAt = 0, undo = null, crashed = false;
    const now = () => new Date().toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    const snapshot = () => tabs.filter(t => t.h).map(t => ({ ...t }));
    const autosave = () => { if (S.auto && !crashed) { autoSnap = snapshot(); autoAt = Date.now(); } };
    const ago = () => { const s = Math.round((Date.now() - autoAt) / 1000); return s < 50 ? 'just now' : Math.round(s / 60) + ' min ago'; };

    /* ---- tab strip ---- */
    const cx = document.getElementById('cx'), strip = cx.querySelector('.cx-tabs'), oldPlus = strip.querySelector('.cx-plus');
    strip.querySelectorAll('.cx-tab').forEach(n => n.remove());
    const plus = btn('cx-plus', '+'); plus.setAttribute('aria-label', 'New tab'); oldPlus.replaceWith(plus);
    plus.addEventListener('click', () => { if (crashed || tabs.length >= 10) return; tabs.push({ t: 'New Tab', h: '', c: '#9059FF', b: '', d: '' }); active = tabs.length - 1; render(true); autosave(); });
    function render(animateLast, stagger) {
      strip.querySelectorAll('.sk-tab').forEach(n => n.remove());
      tabs.forEach((t, i) => {
        const n = el('div', 'cx-tab sk-tab' + (i === active ? ' on' : '')); n.setAttribute('role', 'tab'); n.setAttribute('aria-selected', String(i === active)); n.tabIndex = 0;
        if (stagger || (animateLast && i === tabs.length - 1)) { n.classList.add('new'); n.style.setProperty('--dl', (stagger ? i * .09 : 0) + 's'); }
        const f = el('i', 'fav'); f.style.background = t.h ? t.c : 'conic-gradient(from 200deg, #FF9500, #FF2E63, #9059FF, #FF9500)'; f.style.borderRadius = t.h ? '4px' : '50%';
        const x = btn('sk-x', '×'); x.setAttribute('aria-label', 'Close ' + t.t); x.addEventListener('click', e => { e.stopPropagation(); closeTab(i); });
        n.append(f, el('span', null, t.t), x);
        n.addEventListener('click', () => { active = i; render(); });
        n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); active = i; render(); } });
        strip.insertBefore(n, plus);
      });
      paintPage(); renderPop();
    }
    function closeTab(i) { tabs.splice(i, 1); if (!tabs.length) tabs.push({ t: 'New Tab', h: '', c: '#9059FF', b: '', d: '' }); active = Math.min(active, tabs.length - 1); render(); autosave(); }
    function paintPage() {
      page.textContent = ''; page.scrollTop = 0; const t = tabs[active]; if (!t) return; H.url(t.h || 'about:newtab');
      const site = el('div', 'sk-site'); site.style.setProperty('--c', t.c);
      if (!t.h) { const h = el('div', 'sk-home'); h.append(el('i'), el('p', null, 'New tab. Open SessionKeeper to bring back a saved session.')); site.append(h); }
      else { const top = el('div', 'sk-top'), nav = el('span'); ['Explore', 'Saved', 'Sign in'].forEach(x => nav.append(el('span', null, x))); top.append(el('i'), document.createTextNode(t.b), nav);
        const hero = el('div', 'sk-hero'); hero.append(el('small', null, t.b), el('h1', null, t.t), el('p', null, t.d));
        const g = el('div', 'sk-grid'); g.append(el('i'), el('i'), el('i')); site.append(top, hero, g); }
      page.append(site);
    }

    /* ---- crash + recovery ---- */
    const crash = el('div', 'sk-crash'); crash.hidden = true; page.parentElement.append(crash);
    function doCrash() {
      crashed = true; H.pop.close(); const lost = tabs.length; tabs = []; strip.querySelectorAll('.sk-tab').forEach(n => n.remove()); page.textContent = ''; H.url('');
      crash.textContent = ''; const box = el('div', 'sk-cr'); box.append(el('div', 'face', ':('), el('h3', null, 'Firefox closed unexpectedly'), el('p', null, lost + ' tabs were open. SessionKeeper can bring them back.'));
      const opt = (title, sub, list, cls, label) => { const r = el('div', 'sk-rec' + (cls ? ' ' + cls : '')), dots = el('div', 'dots'); list.forEach(t => { const i = el('i'); i.style.setProperty('--c', t.c); dots.append(i); });
        const b = btn('', label); b.addEventListener('click', () => recover(list, title)); r.append(el('b', null, title), el('small', null, sub), dots, b); box.append(r); };
      if (S.auto && autoSnap && autoSnap.length) opt('Auto-saved session', autoSnap.length + ' tabs · saved ' + ago(), autoSnap, '', 'Restore all ' + autoSnap.length + ' tabs');
      else box.append(el('p', null, 'Auto-save was off, so only your named sessions survived.'));
      S.sessions.slice(0, 1).forEach(x => opt(x.n, x.tabs.length + ' tabs · ' + x.when, x.tabs, 'alt', 'Open this session'));
      crash.append(box); crash.hidden = false; H.tone(160, .3, 'sawtooth', .04);
      if (G && !reduced) { G.fromTo(crash, { opacity: 0 }, { opacity: 1, duration: .25 }); G.from(box.children, { y: 16, opacity: 0, duration: .5, stagger: .07, delay: .15, ease: 'expo.out' }); }
    }
    function recover(list, name) { setTimeout(() => H.pop.open(), 700);
      crashed = false; tabs = list.map(t => ({ ...t })); active = 0;
      const done = () => { crash.hidden = true; render(false, true); autosave(); toast('Restored ' + tabs.length + ' tabs from ' + name); H.tone(784, .1); };
      if (G && !reduced) G.to(crash, { opacity: 0, duration: .3, onComplete: () => { done(); G.set(crash, { clearProps: 'opacity' }); } }); else done();
    }

    /* ---- popup ---- */
    const P = el('div', 'pc');
    const saveBox = el('div'), form = el('form', 'sk-save'), input = el('input'), sbtn = el('button');
    input.maxLength = 40; input.placeholder = 'Name this session'; input.value = 'Lisbon trip'; input.setAttribute('aria-label', 'Session name'); sbtn.type = 'submit';
    form.append(input, sbtn); saveBox.append(label('Save the tabs in this window'), form);
    form.addEventListener('submit', e => {
      e.preventDefault(); const list = snapshot(); if (!list.length) { toast('Open a page first: new tabs are not saved'); return; }
      const n = input.value.trim().slice(0, 40) || 'Untitled session';
      const i = S.sessions.findIndex(x => x.n.toLowerCase() === n.toLowerCase());
      const ses = { n, when: now(), tabs: list }; if (i >= 0) S.sessions.splice(i, 1); S.sessions.unshift(ses); if (S.sessions.length > 20) S.sessions.pop();
      save(); renderPop(); toast((i >= 0 ? 'Updated “' : 'Saved “') + n + '” · ' + list.length + ' tabs'); H.tone(659, .08); H.tone(880, .1);
      const c = list_.querySelector('.sk-card:not(.auto)'); if (c) { H.flyToIcon(sbtn, getComputedStyle(document.documentElement).getPropertyValue('--accent')); if (G && !reduced) G.from(c, { y: -10, scale: .96, opacity: 0, duration: .5, ease: 'back.out(2)' }); }
    });
    const auto = swBtn('Auto-save this window', 'Keeps a crash copy as you browse', true);
    auto.addEventListener('click', () => { S.auto = !S.auto; if (S.auto) autosave(); else autoSnap = null; save(); renderPop(); toast(S.auto ? 'Auto-save on' : 'Auto-save off'); });
    const listBox = el('div'), find = el('input', 'sk-find'), cnt = el('output'), list_ = el('div', 'sk-list');
    find.type = 'search'; find.placeholder = 'Search sessions and tabs'; find.setAttribute('aria-label', 'Search sessions'); find.addEventListener('input', () => renderPop());
    listBox.append(label('Saved sessions', cnt), find, list_);
    const crashBtn = btn('sk-crashbtn', 'Simulate a crash'); crashBtn.addEventListener('click', doCrash);
    P.append(saveBox, auto, listBox, crashBtn); pb.append(P);

    function openSession(x, mode) {
      if (mode === 'replace') { tabs = x.tabs.map(t => ({ ...t })); active = 0; render(false, true); }
      else { const before = tabs.length; tabs = tabs.concat(x.tabs.map(t => ({ ...t }))).slice(0, 12); active = before; render(false, true); }
      autosave(); toast((mode === 'replace' ? 'Opened “' : 'Added “') + x.n + '”'); H.tone(587, .08);
    }
    function card(x, isAuto) {
      const c = el('div', 'sk-card' + (isAuto ? ' auto' : '')), h = el('div', 'sk-ch'), dots = el('div', 'sk-cd');
      h.append(el('b', null, x.n), el('small', null, x.when)); x.tabs.slice(0, 10).forEach(t => { const i = el('i'); i.style.setProperty('--c', t.c); i.title = t.t; dots.append(i); }); dots.append(el('span', null, x.tabs.length + ' tabs'));
      const a = el('div', 'sk-ca'), o = btn('pri', 'Open'), ad = btn('', 'Add to window');
      o.setAttribute('aria-label', 'Open ' + x.n + ', replacing the current tabs'); ad.setAttribute('aria-label', 'Add ' + x.n + ' to this window');
      o.addEventListener('click', () => openSession(x, 'replace')); ad.addEventListener('click', () => openSession(x, 'add')); a.append(o, ad);
      if (!isAuto) { const del = btn('del', '×'); del.setAttribute('aria-label', 'Delete ' + x.n); del.addEventListener('click', () => { const i = S.sessions.indexOf(x); S.sessions.splice(i, 1); save(); clearTimeout(undo && undo.t); undo = { x, i, t: setTimeout(() => { undo = null; renderPop(); }, 6000) }; renderPop(); }); a.append(del); }
      c.append(h, dots, a); return c;
    }
    function renderPop() {
      sbtn.textContent = 'Save ' + snapshot().length + ' tabs'; auto.setAttribute('aria-checked', String(S.auto));
      auto.querySelector('small').textContent = S.auto ? (autoSnap ? 'Last saved ' + ago() + ' · ' + autoSnap.length + ' tabs' : 'Keeps a crash copy as you browse') : 'Off: a crash would lose these tabs';
      cnt.textContent = String(S.sessions.length); list_.textContent = '';
      if (undo) { const u = el('div', 'sk-undo'), b = btn('', 'Undo'); u.append(el('span', null, 'Deleted “' + undo.x.n + '”'), b); b.addEventListener('click', () => { S.sessions.splice(undo.i, 0, undo.x); clearTimeout(undo.t); undo = null; save(); renderPop(); toast('Session restored'); }); list_.append(u); }
      const q = find.value.trim().toLowerCase(), hit = x => !q || x.n.toLowerCase().includes(q) || x.tabs.some(t => t.t.toLowerCase().includes(q) || t.h.includes(q));
      const shown = S.sessions.filter(hit); shown.forEach(x => list_.append(card(x)));
      if (!shown.length) list_.append(el('p', 'pc-empty', q ? 'No session matches “' + find.value.trim() + '”.' : 'No saved sessions yet. Name the tabs above and save them.'));
      H.badge(S.sessions.length || '');
    }
    setInterval(() => { if (!crashed) renderPopTime(); }, 15000);
    const renderPopTime = () => { if (S.auto && autoSnap) auto.querySelector('small').textContent = 'Last saved ' + ago() + ' · ' + autoSnap.length + ' tabs'; };

    autosave(); render(false, true);
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
