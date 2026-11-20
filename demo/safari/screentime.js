/* ScreenTime+ — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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
  const BTN = 1;
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


/* ---------- ScreenTime+ simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"cats":{"social":["Social","#F97316"],"video":["Video","#E11D48"],"news":["News","#0EA5E9"],"work":["Productivity","#22C55E"]},"sites":[{"k":"chirper","t":"Chirper","h":"chirper.example/home","cat":"social","c":"#1D9BF0","today":38},{"k":"streamly","t":"Streamly","h":"streamly.example/watch","cat":"video","c":"#E11D48","today":52},{"k":"pulse","t":"Daily Pulse","h":"dailypulse.example","cat":"news","c":"#D7263D","today":21},{"k":"docs","t":"Lumen Docs","h":"docs.lumen.example","cat":"work","c":"#4F46E5","today":64}],"week":[[48,70,25,120],[62,45,30,140],[55,90,18,95],[70,40,22,150],[90,110,35,60],[120,150,40,20],[38,52,21,64]],"key":"stp_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const saved = store.get(M.key, null) || {};
    const limits = {}; M.sites.forEach(x => { const v = saved.limits && saved.limits[x.k]; limits[x.k] = typeof v === 'number' && v > 0 && v <= 600 ? v : 0; });
    const save = () => store.set(M.key, { limits });
    const sites = M.sites.map(x => ({ ...x })); let act = 0, extra = {}, paused = false;
    const hm = n => { n = Math.round(n); return n >= 60 ? Math.floor(n / 60) + 'h ' + String(n % 60).padStart(2, '0') + 'm' : n + 'm'; };
    const G2 = ['linear-gradient(135deg,#60A5FA,#A78BFA)', 'linear-gradient(135deg,#F472B6,#FB923C)', 'linear-gradient(135deg,#34D399,#22D3EE)', 'linear-gradient(135deg,#FBBF24,#F87171)'];

    /* ---- tabs + pages ---- */
    const cx = document.getElementById('cx'), strip = cx.querySelector('.cx-tabs'), plus = strip.querySelector('.cx-plus');
    strip.querySelectorAll('.cx-tab').forEach(n => n.remove());
    function renderTabs() {
      strip.querySelectorAll('.st2-t').forEach(n => n.remove());
      sites.forEach((x, i) => { const n = el('div', 'cx-tab st2-t' + (i === act ? ' on' : '')), f = el('i', 'fav'); f.style.background = x.c; n.setAttribute('role', 'tab'); n.setAttribute('aria-selected', String(i === act)); n.tabIndex = 0;
        n.append(f, el('span', null, x.t)); const go = () => { act = i; paused = false; pause.hidden = true; renderTabs(); paint(); renderPop(); }; n.addEventListener('click', go); n.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }); strip.insertBefore(n, plus); });
    }
    function paint() {
      const x = sites[act]; H.url(x.h); page.textContent = ''; const site = el('div', 'st2-site'), top = el('div', 'st2-top'), ti = el('i'); ti.style.setProperty('--c', x.c); top.append(ti, document.createTextNode(x.t));
      const feed = el('div', 'st2-feed'), lines = { social: ['Hot take: the best coffee is the one someone else makes.', 'This thread on tiny houses is incredible, read to the end.', 'Who else is watching the final tonight?'], video: ['Up next: 10 minute bread, no knead', 'Autoplay in 5… The ultimate desk setup tour', 'Recommended for you: 1 hour of rain sounds'], news: ['Rail strike called off after late talks', 'City approves new tram line', 'Why the night sky is getting brighter'], work: ['Getting started: install the SDK', 'Send your first event', 'Set up alerts for the numbers you care about'] }[x.cat];
      for (let i = 0; i < 6; i++) { const p = el('article', 'st2-post'), who = el('div', 'who'), av = el('i'); av.style.setProperty('--g', G2[i % 4]); who.append(av, document.createTextNode(['Mia', 'Theo', 'Ana', 'Raj', 'Lena', 'Sam'][i] + ' · ' + (i + 2) + 'm')); p.append(who, el('p', null, lines[i % 3])); if (i % 2 === 0) { const md = el('div', 'media'); md.style.setProperty('--g', G2[(i + 1) % 4]); p.append(md); } feed.append(p); }
      site.append(top, feed); page.append(site);
    }
    const live = el('div', 'st2-live'), lt = el('span'); live.append(el('i'), lt); page.parentElement.append(live);
    const pause = el('div', 'st2-pause'); pause.hidden = true; page.parentElement.append(pause);
    function showPause(x) {
      paused = true; pause.textContent = ''; const box = el('div'), ring = el('div', 'ring', hm(limits[x.k])), acts = el('div', 'acts2'), more = btn('more', '5 more minutes'), close = btn('close', 'Close tab');
      more.addEventListener('click', () => { extra[x.k] = (extra[x.k] || 0) + 5; paused = false; pause.hidden = true; toast('5 more minutes on ' + x.t); renderPop(); });
      close.addEventListener('click', () => { paused = false; pause.hidden = true; act = sites.findIndex(y => y.cat === 'work'); renderTabs(); paint(); renderPop(); toast('Closed ' + x.t + '. Back to work'); });
      acts.append(more, close); box.append(ring, el('h3', null, 'Time’s up on ' + x.t), el('p', null, 'You set a daily limit of ' + hm(limits[x.k]) + '. Take a break, or keep going if you need to.'), acts);
      pause.append(box); pause.hidden = false; H.tone(392, .12); if (G && !reduced) G.from(box, { y: 20, scale: .95, opacity: 0, duration: .5, ease: 'back.out(1.6)' });
    }

    /* ---- the clock: 1 s = 1 min on the active tab ---- */
    setInterval(() => {
      if (document.hidden || paused) return; const x = sites[act]; x.today += 1;
      lt.textContent = 'Counting ' + x.t + ' · ' + hm(x.today);
      if (limits[x.k] && x.today >= limits[x.k] + (extra[x.k] || 0)) showPause(x);
      renderPop();
    }, 1000);

    /* ---- popover ---- */
    const P = el('div', 'pc'), totB = el('div'), tot = el('div', 'st2-tot'), tb = el('b'), ts = el('span'), cb = el('div', 'st2-catbar'), leg = el('div', 'st2-leg');
    tot.append(tb, ts); Object.entries(M.cats).forEach(([k, [n, c]]) => { const i = el('i'); i.dataset.k = k; i.style.background = c; cb.append(i); const l = el('span', null, n); l.style.setProperty('--c', c); leg.append(l); }); totB.append(label('Today'), tot, cb, leg);
    const lB = el('div'), list = el('div', 'st2-list'); lB.append(label('By site'), list);
    const wB = el('div'), wk = el('div', 'st2-week'); wB.append(label('This week'), wk);
    const sum = el('div', 'st2-sum'); P.append(totB, lB, wB, sum); pb.append(P);
    const days = (() => { const out = [], d = new Date(); for (let i = 6; i >= 0; i--) { const x = new Date(d); x.setDate(d.getDate() - i); out.push(x.toLocaleDateString(undefined, { weekday: 'narrow' })); } return out; })();
    const rows = sites.map(x => { const r = el('div', 'st2-row'), ic = el('i'), dv = el('div'), bar = el('span'), em = el('em'), o = el('output'), lim = el('small'), b = btn(''); ic.style.setProperty('--c', x.c); em.style.setProperty('--c', x.c); bar.append(em); dv.append(el('b', null, x.t), bar); o.append(lim);
      b.addEventListener('click', () => { const opts = [0, x.today + 3, 30, 60, 120]; const cur = opts.indexOf(limits[x.k]); limits[x.k] = opts[(cur + 1) % opts.length]; extra[x.k] = 0; save(); toast(limits[x.k] ? 'Daily limit for ' + x.t + ': ' + hm(limits[x.k]) : 'No limit for ' + x.t); renderPop(); });
      r.append(ic, dv, o, b); list.append(r); return { x, r, em, o, b }; });
    function renderPop() {
      const total = sites.reduce((a, x) => a + x.today, 0); tb.textContent = hm(total); ts.textContent = 'across ' + sites.length + ' sites';
      const byCat = {}; sites.forEach(x => { byCat[x.cat] = (byCat[x.cat] || 0) + x.today; }); cb.querySelectorAll('i').forEach(i => { i.style.width = ((byCat[i.dataset.k] || 0) / total * 100) + '%'; });
      const mx = Math.max(...sites.map(x => x.today));
      rows.forEach(({ x, r, em, o, b }) => { r.classList.toggle('on', sites[act] === x); em.style.width = (x.today / mx * 100) + '%'; const lim = limits[x.k] + (extra[x.k] || 0); em.classList.toggle('over', !!limits[x.k] && x.today >= lim);
        o.textContent = hm(x.today); const sm = el('small', null, limits[x.k] ? 'limit ' + hm(lim) : 'no limit'); o.append(sm); b.textContent = limits[x.k] ? 'Change limit' : 'Set a limit'; b.setAttribute('aria-label', 'Set a daily limit for ' + x.t); });
      const wd = M.week.map((d, i) => i === 6 ? sites.map(x => x.today) : d), wmax = Math.max(...wd.map(d => d.reduce((a, v) => a + v, 0)));
      wk.textContent = ''; wd.forEach((d, i) => { const day = el('div', 'st2-day' + (i === 6 ? ' today' : '')), stack = el('div', 'stack'), tt = d.reduce((a, v) => a + v, 0); stack.style.height = (tt / wmax * 86) + '%';
        sites.forEach((x, j) => { const seg = el('i'); seg.style.background = M.cats[x.cat][1]; seg.style.height = (d[j] / tt * 100) + '%'; stack.append(seg); }); stack.title = days[i] + ': ' + hm(tt); day.append(stack, el('small', null, days[i])); wk.append(day); });
      const social = wd.reduce((a, d) => a + d[0], 0), prev = 560; sum.textContent = ''; sum.append(document.createTextNode('This week: '), el('b', null, hm(wd.reduce((a, d) => a + d.reduce((x, y) => x + y, 0), 0))), document.createTextNode(' in Safari. Social is ' + (social < prev ? 'down ' : 'up ') + Math.abs(Math.round((social - prev) / prev * 100)) + '% on last week.'));
      H.badge(Object.values(limits).filter(Boolean).length ? '⏱' : '');
    }
    renderTabs(); paint(); renderPop(); lt.textContent = 'Counting ' + sites[act].t;
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
