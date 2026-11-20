/* TabCompass — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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


/* ---------- TabCompass simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"tabs":[["Inbox (12) — Postbox","postbox.example/inbox","#3B5BFD"],["Invoice #2041 — Ledgerly","ledgerly.example/invoices/2041","#16A34A"],["Flights to Lisbon — Skyfare","skyfare.example/lis","#0EA5E9"],["Sprint board — Trackly","trackly.example/board","#7C3AED"],["Q4 plan — Notely","notely.example/q4-plan","#E8A33D"],["PR #482: faster search","codehub.example/pr/482","#24292F"],["Postgres index types","docs.example/postgres/indexes","#336791"],["Hiking boots — Trailshop","trailshop.example/boots","#3F8F4E"],["Lo-fi for focus — Wavelength","wavelength.example/focus","#7B61FF"],["Weather: Lisbon","skycast.example/lisbon","#F59E0B"],["Design review notes","notely.example/review","#E8A33D"],["Figma file: Onboarding","canvas.example/onboarding","#F24E1E"],["Flight status BA117","skyfare.example/ba117","#0EA5E9"],["Calendar — Week 47","calendar.example/week/47","#EF4444"],["Rent invoice — November","homely.example/invoice/nov","#14B8A6"],["Regex cheat sheet","docs.example/regex","#336791"],["Tram line approved — Metro Daily","metrodaily.example/tram","#C2410C"],["Bank — Accounts","northbank.example/accounts","#1E3A8A"]],"key":"tc_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    let tabs = M.tabs.map(([t, h, c], i) => ({ t, h, c, id: i })), act = 0, jumps = 0, closed = 0;

    /* ---- crowded tab strip ---- */
    const cx = document.getElementById('cx'), strip = cx.querySelector('.cx-tabs'), plus = strip.querySelector('.cx-plus'); strip.querySelectorAll('.cx-tab').forEach(n => n.remove());
    function renderTabs(flash) { strip.querySelectorAll('.tc-t').forEach(n => n.remove()); tabs.forEach((x, i) => { const n = el('div', 'cx-tab tc-t' + (i === act ? ' on' : '') + (x === flash ? ' flash' : '')), f = el('i', 'fav'); f.style.background = x.c; n.title = x.t; n.setAttribute('role', 'tab'); n.setAttribute('aria-label', x.t); n.append(f, el('span', null, x.t)); n.addEventListener('click', () => { act = i; renderTabs(); paint(); }); strip.insertBefore(n, plus); }); }
    function paint() { const x = tabs[act]; H.url(x.h); page.textContent = ''; const site = el('div', 'tc-site'), top = el('div', 'tc-top'), ti = el('i'); ti.style.setProperty('--c', x.c); top.append(ti, document.createTextNode(x.h.split('/')[0]));
      const b = el('div', 'tc-body'), hint = el('div', 'tc-hint'); hint.append(document.createTextNode('Lost in tabs? Press'), el('kbd', null, '⌥ Space'), document.createTextNode('for TabCompass'));
      b.append(el('h1', null, x.t), el('p', null, 'One of ' + tabs.length + ' open tabs. Squint at that tab bar: every tab is just a tiny icon now. That is exactly when TabCompass helps.'), hint); site.append(top, b); page.append(site); page.tabIndex = 0; }

    /* ---- compass ---- */
    const ov = el('div', 'tc-ov'), cmp = el('div', 'tc-cmp'), face = el('div', 'tc-face'), ring = el('div', 'tc-ring'), mid = el('div', 'tc-mid'), q = el('input'), tl = el('b'), ul = el('small'), meta = el('em'), keys = el('div', 'tc-keys');
    ov.hidden = true; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'TabCompass'); q.placeholder = 'Search ' + tabs.length + ' tabs'; q.setAttribute('aria-label', 'Search tabs'); q.autocomplete = 'off';
    [['← →', 'turn'], ['↑ / Return', 'open'], ['↓', 'close tab'], ['Esc', 'dismiss']].forEach(([k, t]) => { const sp = el('span'); sp.append(el('kbd', null, k), document.createTextNode(t)); keys.append(sp); });
    mid.append(q, tl, ul, meta); cmp.append(face, ring, mid, keys); ov.append(cmp); page.parentElement.append(ov);
    let res = [], sel = 0, rot = 0;
    function fuzzy(str, qq) { if (!qq) return { score: 0, idx: [] }; const s0 = str.toLowerCase(); let j = 0, score = 0, last = -2; const idx = []; for (let i = 0; i < s0.length && j < qq.length; i++) if (s0[i] === qq[j]) { idx.push(i); score += i === last + 1 ? 3 : 1; if (i === 0 || ' -#—/.'.includes(s0[i - 1])) score += 2; last = i; j++; } return j === qq.length ? { score, idx } : null; }
    function search() {
      const qq = q.value.trim().toLowerCase().replace(/\s+/g, ''); const out = [];
      tabs.forEach(x => { const a = fuzzy(x.t, qq), b = fuzzy(x.h, qq); if (a || b) out.push({ x, score: Math.max(a ? a.score + 1 : -1, b ? b.score : -1), idx: a ? a.idx : [] }); });
      if (qq) out.sort((a, b) => b.score - a.score); res = out.slice(0, 12); sel = 0; rot = 0; drawRing(); show();
    }
    function drawRing() {
      ring.textContent = ''; const n = res.length || 1, R = cmp.offsetWidth * .4;
      res.forEach((r, i) => { const it = el('button', 'tc-it' + (i === sel ? ' sel' : '')); it.type = 'button'; it.style.setProperty('--c', r.x.c); it.textContent = r.x.t.replace(/[^A-Za-z0-9]/g, '')[0] || '•'; it.setAttribute('aria-label', r.x.t);
        const a = (i - sel) / n * Math.PI * 2 - Math.PI / 2; it.style.transform = 'translate(' + (Math.cos(a) * R).toFixed(1) + 'px,' + (Math.sin(a) * R).toFixed(1) + 'px) scale(' + (i === sel ? 1.18 : 1) + ')';
        it.addEventListener('click', () => { if (i === sel) openSel(); else { sel = i; drawRing(); show(); } }); ring.append(it); });
    }
    function show() {
      tl.textContent = ''; ul.textContent = ''; meta.textContent = ''; const r = res[sel];
      if (!r) { tl.append(el('span', 'tc-none', 'No tab matches “' + q.value + '”')); return; }
      const t = r.x.t; let k = 0; for (let i = 0; i < t.length; i++) { if (r.idx[k] === i) { let j = i; while (r.idx[k] === j) { k++; j++; } tl.append(el('mark', null, t.slice(i, j))); i = j - 1; } else tl.append(document.createTextNode(t[i])); }
      ul.textContent = r.x.h; meta.textContent = (sel + 1) + ' of ' + res.length + (q.value ? ' matches' : ' tabs');
    }
    function turn(d) { if (!res.length) return; sel = (sel + d + res.length) % res.length; if (G && !reduced) { const its = ring.children, n = res.length, R = cmp.offsetWidth * .4; [...its].forEach((it, i) => { const a = (i - sel) / n * Math.PI * 2 - Math.PI / 2; it.classList.toggle('sel', i === sel); it.style.transition = 'transform .35s cubic-bezier(.34,1.3,.64,1)'; it.style.transform = 'translate(' + (Math.cos(a) * R).toFixed(1) + 'px,' + (Math.sin(a) * R).toFixed(1) + 'px) scale(' + (i === sel ? 1.18 : 1) + ')'; }); } else drawRing(); show(); H.tone(560 + sel * 20, .03); }
    function openSel() { const r = res[sel]; if (!r) return; act = tabs.indexOf(r.x); close(); renderTabs(r.x); paint(); jumps++; renderPop(); toast('Jumped to ' + r.x.t); H.tone(880, .06); }
    function closeSel() { const r = res[sel]; if (!r || tabs.length < 2) return; const i = tabs.indexOf(r.x); tabs.splice(i, 1); if (act >= tabs.length || act === i) act = Math.max(0, Math.min(act, tabs.length - 1)); closed++; renderTabs(); paint(); search(); renderPop(); toast('Closed ' + r.x.t); H.tone(330, .06); }
    function open() { ov.hidden = false; q.value = ''; search(); if (G && !reduced) { G.fromTo(cmp, { scale: .85, opacity: 0, rotate: -12 }, { scale: 1, opacity: 1, rotate: 0, duration: .5, ease: 'back.out(1.5)' }); G.from(ring, { scale: .6, opacity: 0, duration: .45, delay: .05, ease: 'back.out(1.8)' }); } setTimeout(() => q.focus(), 30); H.pop.close(); }
    function close() { ov.hidden = true; }
    q.addEventListener('input', search);
    ov.addEventListener('keydown', e => { const k = e.key; if (k === 'ArrowRight' || (k === 'Tab' && !e.shiftKey)) { e.preventDefault(); turn(1); } else if (k === 'ArrowLeft' || (k === 'Tab' && e.shiftKey)) { e.preventDefault(); turn(-1); } else if (k === 'ArrowUp' || k === 'Enter') { e.preventDefault(); openSel(); } else if (k === 'ArrowDown') { e.preventDefault(); closeSel(); } else if (k === 'Escape') { e.preventDefault(); close(); } });
    ov.addEventListener('pointerdown', e => { if (e.target === ov) close(); });
    let ax = 0, ay = 0, wt = 0;
    ov.addEventListener('wheel', e => { e.preventDefault(); ax += e.deltaX; ay += e.deltaY; clearTimeout(wt); wt = setTimeout(() => { ax = ay = 0; }, 220);
      if (Math.abs(ax) > 70) { turn(ax > 0 ? 1 : -1); ax = 0; ay = 0; } else if (ay < -90) { ay = 0; openSel(); } else if (ay > 90) { ay = 0; closeSel(); } }, { passive: false });
    document.addEventListener('keydown', e => { if (e.altKey && e.code === 'Space' && cx.contains(document.activeElement)) { e.preventDefault(); open(); } });
    page.addEventListener('keydown', e => { if (e.altKey && (e.code === 'Space' || e.key === ' ')) { e.preventDefault(); open(); } });

    /* ---- popover ---- */
    const P = el('div', 'pc'), ob = btn('tc-open', 'Open TabCompass  ⌥ Space'); ob.addEventListener('click', open);
    const gb = el('div'), gs = el('div', 'tc-gs'); [['⇆', 'Swipe two fingers sideways to turn the ring'], ['↑', 'Swipe up, or press Return, to open'], ['↓', 'Swipe down to close the selected tab'], ['Aa', 'Type to fuzzy-search titles and addresses']].forEach(([i, t]) => { const d = el('div'); d.append(el('i', null, i), document.createTextNode(t)); gs.append(d); }); gb.append(label('Gestures'), gs);
    const st = el('div', 'tc-st'), a = el('div'), b2 = el('div'), n1 = el('b'), n2 = el('b'); a.append(n1, el('span', null, 'open tabs')); b2.append(n2, el('span', null, 'jumps made')); st.append(a, b2);
    P.append(ob, gb, st); pb.append(P);
    function renderPop() { n1.textContent = String(tabs.length); n2.textContent = String(jumps); H.badge(tabs.length); }
    renderTabs(); paint(); renderPop();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
