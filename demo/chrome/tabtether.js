/* TabTether — Chrome extension page with a live browser simulator (Bazozo Studio).
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
  /* ---------- Chrome toolbar popup ---------- */
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

/* ---------- extension simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast } = H, pb = H.pop.body;
    const GROUPS = { trip: ['Lisbon trip', '#F28B30'], work: ['Q4 launch', '#6C9BFF'], food: ['Recipes', '#3DBE8B'] };
    const BLURB = {
      trip: 'Seven nights in Lisbon. Compare prices, pick a neighbourhood and plan the first morning around the tram.',
      work: 'Everything the launch team needs this week: the board, the deck, the hero banner and the numbers.',
      food: 'Crisp, blistered pastry and a just-set custard. Patience with the oven is the whole trick.',
      none: 'Not related to anything else you have open, so TabTether leaves it where it is.'
    };
    let uid = 0;
    const T = (title, host, fav, topic, path) => { const id = ++uid; return { id, title, host, fav, topic, path: path || '', g: null, mb: 70 + (id * 53) % 190, frozen: false }; };
    const FROZEN_MB = 4;
    const ram = () => tabs.reduce((a, t) => a + (t.frozen ? FROZEN_MB : t.mb), 0);
    let shownRam = 0;
    const tabs = [
      T('Flights LIS · 14–21 Nov', 'flights.example', '#F28B30', 'trip', '/lis/14-21-nov'),
      T('Sprint 42 board', 'jira.northwind.dev', '#2684FF', 'work', '/board/42'),
      T('Pastel de nata, step by step', 'bakewell.example', '#E8B04B', 'food', '/pastel-de-nata'),
      T('Inbox (3)', 'mail.example', '#EA4335', null, '/inbox'),
      T('Launch deck v7', 'slides.example', '#F4B400', 'work', '/d/launch-v7'),
      T('Alfama loft · 2 guests', 'staybnb.example', '#FF5A5F', 'trip', '/rooms/alfama-loft'),
      T('Hero banner · Figma', 'figma.example', '#A259FF', 'work', '/file/hero'),
      T('Tram 28 route map', 'maps.example', '#34A853', 'trip', '/tram-28')
    ];
    let win2 = [
      T('Time Out Lisbon · 48 hours', 'timeout.example', '#E4002B', 'trip', '/lisbon/48-hours'),
      T('Q4 metrics dashboard', 'metrics.northwind.dev', '#00A3A3', 'work', '/q4'),
      T('Custard tart troubleshooting', 'seriouseats.example', '#C0392B', 'food', '/custard-tarts'),
      T('lo-fi beats to code to', 'tube.example', '#FF0000', null, '/watch')
    ];
    const NEW_TABS = [
      T('Belém Tower tickets', 'visitlisboa.example', '#F28B30', 'trip', '/belem'),
      T('Launch checklist', 'docs.northwind.dev', '#6C9BFF', 'work', '/checklist'),
      T('Best custard tins, tested', 'kitchenlab.example', '#3DBE8B', 'food', '/tins'),
      T('Weather · Lisbon', 'weather.example', '#4FC3F7', 'trip', '/lisbon')
    ];
    let active = tabs[0].id, auto = true, sync = false, newIdx = 0;
    const collapsed = new Set();

    /* the real tab strip in the Chrome window */
    const bar = document.querySelector('.cx-tabs'); bar.classList.add('tt-bar');
    bar.querySelectorAll('.cx-tab').forEach(t => t.remove());
    const strip = el('div', 'tt-strip'); strip.setAttribute('role', 'tablist'); strip.setAttribute('aria-label', 'Open tabs');
    bar.insertBefore(strip, bar.querySelector('.cx-plus'));
    const nodes = new Map(), chips = new Map();
    function tabNode(t) {
      let n = nodes.get(t.id); if (n) return n;
      n = el('button', 'cx-tab tt-tab'); n.type = 'button'; n.setAttribute('role', 'tab');
      const f = el('i', 'fav'); f.style.background = t.fav; n.append(f, el('span', null, t.title));
      n.addEventListener('click', () => activate(t)); nodes.set(t.id, n); return n;
    }
    function chipNode(g) {
      let c = chips.get(g); if (!c) {
        c = el('button', 'tt-chip'); c.type = 'button'; c.style.setProperty('--gc', GROUPS[g][1]);
        c.addEventListener('click', () => toggleCollapse(g)); chips.set(g, c);
      }
      const n = tabs.filter(t => t.g === g).length, folded = collapsed.has(g);
      c.textContent = folded ? `${GROUPS[g][0]} · ${n}` : GROUPS[g][0]; c.setAttribute('aria-expanded', String(!folded));
      c.setAttribute('aria-label', `${GROUPS[g][0]} group, ${n} tabs, ${folded ? 'collapsed' : 'expanded'}`); return c;
    }
    const groupsUsed = () => Object.keys(GROUPS).filter(g => tabs.some(t => t.g === g));
    function renderStrip() {
      const first = new Map(); [...strip.children].forEach(n => first.set(n, n.getBoundingClientRect().left));
      const seq = [];
      groupsUsed().forEach(g => {
        seq.push(chipNode(g));
        tabs.filter(t => t.g === g).forEach(t => { const n = tabNode(t); n.classList.add('grp'); n.style.setProperty('--gc', GROUPS[g][1]); n.classList.toggle('tt-hide', collapsed.has(g) && t.id !== active); seq.push(n); });
      });
      tabs.filter(t => !t.g).forEach(t => { const n = tabNode(t); n.classList.remove('grp', 'tt-hide'); n.style.removeProperty('--gc'); seq.push(n); });
      [...strip.children].forEach(c => { if (!seq.includes(c)) c.remove(); });
      seq.forEach(n => strip.append(n));
      tabs.forEach(t => { const n = tabNode(t), on = t.id === active; n.classList.toggle('on', on); n.classList.toggle('frz', t.frozen); n.setAttribute('aria-selected', String(on)); n.title = t.frozen ? `${t.title} · frozen, click to wake` : t.title; });
      if (G && !reduced) seq.forEach(n => {
        if (n.classList.contains('tt-hide')) return;
        const f = first.get(n), now = n.getBoundingClientRect().left;
        if (f == null) G.fromTo(n, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .45, ease: 'back.out(2)', clearProps: 'transform,opacity' });
        else if (Math.abs(f - now) > 1) G.fromTo(n, { x: f - now }, { x: 0, duration: .65, ease: 'power3.out', clearProps: 'transform' });
      });
    }

    /* the page for the active tab */
    const view = el('div', 'tt-view'); page.append(view);
    function renderPage() {
      const t = tabs.find(x => x.id === active); if (!t) return;
      H.url(t.host + t.path); view.replaceChildren();
      const top = el('div', 'tt-ph'), f = el('i'); f.style.background = t.fav; top.append(f, el('b', null, t.host));
      if (t.g) { const gt = el('span', 'tt-gtag', 'Group · ' + GROUPS[t.g][0]); gt.style.setProperty('--gc', GROUPS[t.g][1]); top.append(gt); }
      const hero = el('div', 'tt-hero'); hero.style.background = `radial-gradient(120% 140% at 85% 10%, ${t.fav}, #14121E 70%)`;
      hero.append(el('h1', null, t.title));
      const body = el('div', 'tt-pb'); body.append(el('p', 'tt-lead', BLURB[t.topic || 'none']));
      const row = el('div', 'tt-cards'); for (let j = 0; j < 3; j++) { const c = el('div', 'tt-card'); c.append(el('i'), el('i'), el('i')); row.append(c); } body.append(row);
      const lines = el('div', 'tt-lines'); for (let i = 0; i < 5; i++) lines.append(el('i')); body.append(lines);
      view.append(top, hero, body);
      if (G && !reduced) G.from(view.children, { opacity: 0, y: 10, duration: .35, stagger: .05, ease: 'power2.out' });
    }
    function activate(t) { active = t.id; if (t.frozen) { t.frozen = false; toast(`“${t.title}” woke up and reloaded.`); } renderStrip(); renderPage(); renderPop(); }

    /* popup */
    const go = el('button', 'btn pri tt-go', 'Tether tabs'); go.type = 'button';
    const sw = (label, sub, on, fn) => { const r = el('div', 'tt-sw'), b = el('button', 'tt-tg'); b.type = 'button'; b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', String(on)); b.setAttribute('aria-label', label); const t = el('div'); t.append(el('b', null, label), el('small', null, sub)); r.append(t, b); b.addEventListener('click', () => { const v = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', String(v)); fn(v); }); return r; };
    const autoSw = sw('Auto-group new tabs', 'New tabs join the right group', auto, v => { auto = v; toast(v ? 'New tabs will join their group.' : 'New tabs will stay ungrouped.'); });
    const syncSw = sw('Sync across windows', 'Pull related tabs from Window 2', sync, v => { sync = v; if (v) pullFromWin2(); else renderPop(); });
    const openBtn = el('button', 'tt-open', '+ Open a related tab'); openBtn.type = 'button';
    const glist = el('div', 'tt-groups'), wins = el('div', 'tt-wins');
    const ramBox = el('div', 'tt-ram'), ramNum = el('b', 'tt-rn'), ramBar = el('span', 'tt-rb'), ramFill = el('i'), ramSub = el('small'); ramBar.append(ramFill); const rh = el('div', 'tt-rh'); rh.append(el('span', null, 'Memory used by tabs'), ramNum); ramBox.append(rh, ramBar, ramSub);
    const frz = el('button', 'tt-frz'); frz.type = 'button';
    frz.addEventListener('click', () => { const idle = tabs.filter(t => t.id !== active && !t.frozen); if (!idle.length) { tabs.forEach(t => { t.frozen = false; }); toast('All tabs awake again.'); } else { idle.forEach(t => { t.frozen = true; }); const saved = idle.reduce((a, t) => a + t.mb - FROZEN_MB, 0); toast(`Froze ${idle.length} inactive tabs. ${saved.toLocaleString('en-GB')} MB freed.`); if (G && !reduced) G.fromTo(idle.map(t => nodes.get(t.id)), { filter: 'brightness(2)' }, { filter: 'brightness(1)', duration: .7, stagger: .04, clearProps: 'filter' }); } renderStrip(); renderPop(); });
    pb.append(go, ramBox, frz, el('p', 'tt-l', 'Project islands'), glist, autoSw, syncSw, openBtn, el('p', 'tt-l', 'Your windows'), wins);
    function renderPop() {
      const used = groupsUsed(); go.textContent = used.length ? 'Ungroup all' : 'Tether tabs';
      glist.replaceChildren();
      if (!used.length) glist.append(el('p', 'tt-empty', `${tabs.length} loose tabs. TabTether can see 3 topics.`));
      used.forEach(g => {
        const n = tabs.filter(t => t.g === g).length, r = el('div', 'tt-g'), dot = el('i'); dot.style.background = GROUPS[g][1];
        const fold = el('button', 'tt-fold', collapsed.has(g) ? 'Expand' : 'Collapse'); fold.type = 'button'; fold.addEventListener('click', () => toggleCollapse(g));
        r.style.setProperty('--gc', GROUPS[g][1]); r.classList.add('tt-island'); const favs = el('div', 'tt-ifav'); tabs.filter(t => t.g === g).forEach(t => { const i = el('i'); i.style.background = t.fav; if (t.frozen) i.className = 'f'; i.title = t.title; favs.append(i); }); const mb = tabs.filter(t => t.g === g).reduce((a, t) => a + (t.frozen ? FROZEN_MB : t.mb), 0);
        r.append(dot, el('b', null, GROUPS[g][0]), el('small', null, `${n} tab${n === 1 ? '' : 's'} · ${mb} MB`), fold, favs); glist.append(r);
      });
      const total = ram(), peak = tabs.reduce((a, t) => a + t.mb, 0), nf = tabs.filter(t => t.frozen).length;
      const from = shownRam || total; shownRam = total;
      if (G && !reduced && from !== total) { const o = { v: from }; G.to(o, { v: total, duration: .9, ease: 'power3.out', onUpdate: () => { ramNum.textContent = Math.round(o.v).toLocaleString('en-GB') + ' MB'; } }); } else ramNum.textContent = total.toLocaleString('en-GB') + ' MB';
      ramFill.style.width = Math.min(100, total / 2400 * 100) + '%'; ramBox.classList.toggle('low', nf > 0);
      ramSub.textContent = nf ? `${nf} frozen · ${(peak - total).toLocaleString('en-GB')} MB saved · click a frozen tab to wake it` : `${tabs.length} tabs awake · nothing frozen`;
      const idleN = tabs.filter(t => t.id !== active && !t.frozen).length; frz.textContent = idleN ? `❄ Freeze ${idleN} inactive tab${idleN === 1 ? '' : 's'}` : '☀ Wake all tabs';
      wins.replaceChildren();
      const w = (name, list, here) => { const c = el('div', 'tt-win' + (here ? ' here' : '')); c.append(el('b', null, name), el('small', null, `${list.length} tab${list.length === 1 ? '' : 's'}`)); const fl = el('div', 'tt-favs'); list.forEach(t => { const i = el('i'); i.style.background = t.fav; i.title = t.title; fl.append(i); }); c.append(fl); return c; };
      wins.append(w('This window', tabs, true), w('Window 2 · MacBook', win2, false));
      H.pop.body.parentElement.querySelector('.cx-pop-s').textContent = `this window · ${tabs.length} tabs`;
      H.badge(used.length || '');
    }
    function tether() {
      tabs.forEach(t => { t.g = t.topic; }); collapsed.clear();
      // keep group members in their original relative order, grouped together
      renderStrip(); renderPage(); renderPop();
      const n = groupsUsed().length, moved = tabs.filter(t => t.g).length;
      toast(`${moved} tabs tethered into ${n} groups. ${tabs.length - moved} left loose.`);
      try { H.tone(620, .12, 'triangle', .04); setTimeout(() => H.tone(930, .16, 'triangle', .04), 110); } catch (_) {}
    }
    function ungroup() { tabs.forEach(t => { t.g = null; }); collapsed.clear(); renderStrip(); renderPage(); renderPop(); toast('All groups dissolved. Back to the mess.'); }
    function toggleCollapse(g) {
      if (collapsed.has(g)) collapsed.delete(g); else { collapsed.add(g); const a = tabs.find(t => t.id === active); if (a && a.g === g) { const other = tabs.find(t => t.g !== g); if (other) active = other.id; } }
      renderStrip(); renderPage(); renderPop();
    }
    function pullFromWin2() {
      const rel = win2.filter(t => t.topic); if (!rel.length) { toast('Window 2 has nothing related left.'); renderPop(); return; }
      const fromEl = wins.querySelectorAll('.tt-win')[1];
      rel.forEach(t => { t.g = t.topic; tabs.push(t); });
      win2 = win2.filter(t => !t.topic);
      // anything already open here gets grouped too, so the window matches
      tabs.forEach(t => { if (t.topic) t.g = t.topic; });
      renderStrip(); renderPage(); renderPop();
      if (fromEl) H.flyToIcon(fromEl, GROUPS[rel[0].topic][1]);
      toast(`Pulled ${rel.length} related tabs from Window 2 into their groups.`);
    }
    go.addEventListener('click', () => groupsUsed().length ? ungroup() : tether());
    openBtn.addEventListener('click', () => {
      const src = NEW_TABS[newIdx++ % NEW_TABS.length], t = { ...src, id: ++uid };
      t.g = auto && groupsUsed().length ? t.topic : null; if (t.g) collapsed.delete(t.g);
      tabs.push(t); active = t.id; renderStrip(); renderPage(); renderPop();
      toast(t.g ? `“${t.title}” joined ${GROUPS[t.g][0]}.` : `“${t.title}” opened. Tether to group it.`);
      const n = nodes.get(t.id); if (n) strip.scrollLeft = n.offsetLeft + n.offsetWidth - strip.clientWidth + 20;
    });
    document.addEventListener('keydown', e => { if (e.altKey && e.shiftKey && e.code === 'KeyG') { e.preventDefault(); groupsUsed().length ? ungroup() : tether(); } });
    renderStrip(); renderPage(); renderPop(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
