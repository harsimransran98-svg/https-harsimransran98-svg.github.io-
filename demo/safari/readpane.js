/* ReadPane — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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
  const BTN = 4;
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


/* ---------- ReadPane simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"a":{"title":"The quiet return of the paper map","dek":"Sales of folding maps have doubled in five years. Hikers, drivers and even teenagers say they want to see the whole picture again.","by":"By Ines Calder","sections":[["A screen shows you a street",["Your phone is brilliant at the next turn. It is less good at telling you where you are in the world.","A paper map shows the whole valley at once: the river, the ridge and the village you did not know was there."]],["Getting lost, on purpose",["Map shops report a new kind of customer: people who want to plan a route themselves.","Several told us that tracing a path with a finger made the trip feel like theirs before they had even left."]],["The best of both",["Most map lovers still carry a phone. They just open it less.","The map comes out at the trailhead, the phone stays in a pocket, and the walk is better for it."]]]},"key":"rp_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const FONTS = [['ny', 'New York', "'Newsreader', Georgia, serif"], ['sf', 'SF Pro', "'Inter', -apple-system, sans-serif"], ['ch', 'Charter', "'Source Serif 4', Georgia, serif"], ['io', 'Iowan', "'Literata', Georgia, serif"]];
    const THEMES = [['white', 'White', '#FFFFFF', '#1D1D1F', '#6E6E73'], ['sepia', 'Sepia', '#F8F1E3', '#4B3A26', '#8A7356'], ['gray', 'Gray', '#4A4A4D', '#EDEDED', '#B5B5B8'], ['night', 'Night', '#121212', '#D7D7D7', '#8A8A8E']];
    const saved = store.get(M.key, null) || {};
    const S = { f: FONTS.some(f => f[0] === saved.f) ? saved.f : 'ny', t: THEMES.some(t => t[0] === saved.t) ? saved.t : 'white', size: typeof saved.size === 'number' && saved.size >= 15 && saved.size <= 24 ? saved.size : 19, w: typeof saved.w === 'number' && saved.w >= 520 && saved.w <= 820 ? saved.w : 660 };
    const save = () => store.set(M.key, S);
    let on = false, speaking = false, timer = 0;

    /* ---- cluttered page ---- */
    const site = el('div', 'rp-site'), bar = el('div', 'rp-bar'), bi = el('i'); bar.append(bi);
    const nav = el('div', 'rp-nav rp-cl'); nav.append(document.createTextNode('WAYFARER'), el('span', null, 'Travel'), el('span', null, 'Gear'), el('span', null, 'Subscribe'));
    const promo = el('div', 'rp-promo rp-cl', 'Spring offer: 12 issues for £12 · Ends tonight');
    const grid = el('div', 'rp-grid'), art = el('article', 'rp-art'), side = el('aside', 'rp-side rp-cl');
    side.append(el('div', 'rp-ad', 'ADVERTISEMENT')); const rel = el('div', 'rp-rel'); rel.append(el('b', null, 'Most read'), document.createTextNode('Ten hidden beaches · The best rain jackets · Why trains beat planes')); side.append(rel, el('div', 'rp-ad', 'ADVERTISEMENT'));
    const sents = []; const sp = t => { const s0 = el('span', 'rp-s', t); sents.push(s0); return s0; };
    const h1 = el('h1'), heads = []; h1.append(sp(M.a.title)); art.append(h1, el('p', 'dek', M.a.dek), el('p', 'by', M.a.by));
    M.a.sections.forEach(([h, ps], i) => { const h2 = el('h2'); h2.append(sp(h)); heads.push(h2); art.append(h2); const p = el('p'); ps.forEach((t, j) => { if (j) p.append(document.createTextNode(' ')); p.append(sp(t)); }); art.append(p);
      if (i === 0) art.append(el('div', 'rp-vid rp-cl', '▶ Autoplay: 10 gadgets every traveller needs')); if (i === 1) art.append(el('div', 'rp-news rp-cl', '✉ Get our weekly travel letter. Sign up free')); });
    grid.append(art, side); const cookie = el('div', 'rp-cookie rp-cl'); cookie.append(document.createTextNode('We use cookies to improve your experience and show you ads.'), el('b', null, 'Accept all'));
    site.append(bar, nav, promo, grid, cookie); page.append(site);
    page.addEventListener('scroll', () => { const f = page.scrollTop / Math.max(1, page.scrollHeight - page.clientHeight); bi.style.width = (f * 100) + '%'; }, { passive: true });

    /* ---- Safari's own Reader button ---- */
    const aa = document.querySelector('#cx .sf-aa'), aaBtn = btn('sf-aa', 'aA'); aaBtn.setAttribute('aria-label', 'Toggle ReadPane'); aaBtn.setAttribute('aria-pressed', 'false'); if (aa) aa.replaceWith(aaBtn); aaBtn.addEventListener('click', () => toggle());

    function paint() {
      const f = FONTS.find(x => x[0] === S.f), t = THEMES.find(x => x[0] === S.t);
      site.style.setProperty('--r-f', f[2]); site.style.setProperty('--r-bg', t[2]); site.style.setProperty('--r-ink', t[3]); site.style.setProperty('--r-dim', t[4]); site.style.setProperty('--r-s', S.size + 'px'); site.style.setProperty('--r-w', S.w + 'px');
    }
    function toggle(v) {
      const next = v == null ? !on : v; if (next === on) return; on = next; const cl = site.querySelectorAll('.rp-cl');
      if (on) { if (G && !reduced) { G.to(cl, { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, marginBottom: 0, duration: .45, stagger: .04, ease: 'power3.in', onComplete: () => { cl.forEach(x => { x.hidden = true; }); site.classList.add('rp-on'); G.from(art, { y: 24, opacity: 0, duration: .6, ease: 'expo.out' }); } }); }
        else { cl.forEach(x => { x.hidden = true; }); site.classList.add('rp-on'); } toast('ReadPane on · ' + Math.ceil(sents.reduce((a, x) => a + x.textContent.split(' ').length, 0) / 230) + ' min read'); H.tone(660, .06); }
      else { stopListen(); site.classList.remove('rp-on'); cl.forEach(x => { x.hidden = false; if (G) G.set(x, { clearProps: 'all' }); }); toast('Back to the original page'); }
      page.scrollTop = 0; renderPop();
    }

    /* ---- listen ---- */
    function stopListen() { speaking = false; clearTimeout(timer); try { speechSynthesis.cancel(); } catch (_) {} sents.forEach(x => x.classList.remove('now')); renderPop(); }
    function listen() {
      if (speaking) { stopListen(); return; } if (!on) toggle(true); speaking = true; renderPop(); let i = 0;
      const canSpeak = 'speechSynthesis' in window && speechSynthesis.getVoices().length > 0;
      const next = () => { sents.forEach(x => x.classList.remove('now')); if (!speaking || i >= sents.length) { stopListen(); return; } const sN = sents[i++]; sN.classList.add('now'); const r = sN.getBoundingClientRect(), o = page.getBoundingClientRect(); if (r.top < o.top + 60 || r.bottom > o.bottom - 60) page.scrollTo({ top: page.scrollTop + r.top - o.top - page.clientHeight * .35, behavior: reduced ? 'auto' : 'smooth' });
        if (canSpeak) { const u = new SpeechSynthesisUtterance(sN.textContent); u.lang = 'en-GB'; u.rate = 1; u.onend = () => { if (speaking) next(); }; u.onerror = () => { if (speaking) timer = setTimeout(next, 600); }; speechSynthesis.speak(u); }
        else timer = setTimeout(next, Math.max(1400, sN.textContent.split(' ').length * 330)); };
      next();
    }

    /* ---- popover ---- */
    const P = el('div', 'pc'), open = btn('rp-open', 'Open ReadPane'); open.addEventListener('click', () => toggle());
    const fb = el('div'), fonts = el('div', 'rp-fonts'); FONTS.forEach(([k, n, ff]) => { const b = btn(''); b.dataset.k = k; const g = el('b', null, 'Ag'); g.style.fontFamily = ff; b.append(g, document.createTextNode(n)); b.addEventListener('click', () => { S.f = k; save(); paint(); renderPop(); if (!on) toggle(true); }); fonts.append(b); }); fb.append(label('Typeface'), fonts);
    const mk = (t, min, max, step, key, fmt) => { const b = el('div'), o = el('output'), r = el('input', 'rp-rng'); r.type = 'range'; r.min = min; r.max = max; r.step = step; r.setAttribute('aria-label', t); b.append(label(t, o), r);
      const sync = () => { r.value = S[key]; o.textContent = fmt(S[key]); r.style.setProperty('--p', ((S[key] - min) / (max - min) * 100) + '%'); }; r.addEventListener('input', () => { S[key] = +r.value; paint(); sync(); if (!on) toggle(true); }); r.addEventListener('change', save); return [b, sync]; };
    const [sb, ss] = mk('Size', 15, 24, 1, 'size', v => v + ' px'), [wb, ws] = mk('Line width', 520, 820, 20, 'w', v => Math.round(v / 9.5) + ' ch');
    const tb = el('div'), th = el('div', 'rp-th'); THEMES.forEach(([k, n, bg, ink]) => { const b = btn('', n); b.dataset.k = k; b.style.setProperty('--b', bg); b.style.setProperty('--c', ink); b.addEventListener('click', () => { S.t = k; save(); paint(); renderPop(); if (!on) toggle(true); }); th.append(b); }); tb.append(label('Theme'), th);
    const ob = el('div'), out = el('div', 'rp-out'); heads.forEach((h, i) => { const b = btn(''); b.append(el('i', null, String(i + 1).padStart(2, '0')), document.createTextNode(h.textContent)); b.addEventListener('click', () => { if (!on) toggle(true); setTimeout(() => { const r = h.getBoundingClientRect(), o = page.getBoundingClientRect(); page.scrollTo({ top: page.scrollTop + r.top - o.top - 20, behavior: reduced ? 'auto' : 'smooth' }); }, on ? 0 : 700); }); out.append(b); }); ob.append(label('Outline'), out);
    const ls = el('div', 'rp-listen'), lb = btn('', '▶ Listen'), lt = el('span', null, 'Your Mac reads it aloud'); lb.addEventListener('click', listen); ls.append(lb, lt);
    P.append(open, fb, sb, wb, tb, ob, ls); pb.append(P);
    function renderPop() { open.textContent = on ? 'Close ReadPane' : 'Open ReadPane'; open.setAttribute('aria-pressed', String(on)); aaBtn.setAttribute('aria-pressed', String(on)); fonts.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.f))); th.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.t))); ss(); ws(); lb.textContent = speaking ? '■ Stop' : '▶ Listen'; lt.textContent = speaking ? 'Reading aloud…' : 'Your Mac reads it aloud'; H.badge(on ? '✓' : ''); }
    paint(); renderPop();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
