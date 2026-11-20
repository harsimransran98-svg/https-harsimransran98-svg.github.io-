/* QuietScroll — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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


/* ---------- QuietScroll simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"key":"qs_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const saved = store.get(M.key, null) || {};
    const S = { on: saved.on !== false, ease: typeof saved.ease === 'number' && saved.ease >= .04 && saved.ease <= .3 ? saved.ease : .1, speed: typeof saved.speed === 'number' && saved.speed >= .5 && saved.speed <= 1.5 ? saved.speed : .9, calm: saved.calm !== false, pops: saved.pops !== false };
    const save = () => store.set(M.key, S);
    let popsBlocked = 0, popShown = false;

    /* ---- the busy feed ---- */
    const site = el('div', 'qs-site'), top = el('div', 'qs-top'); top.append(document.createTextNode('Trendline'), el('span', null, '● LIVE 12,481 reading'));
    const hero = el('div', 'qs-hero'), hi = el('i'); hero.append(hi, el('b', null, 'The 40 stories everyone is reading today'));
    const feed = el('div', 'qs-feed'), G2 = ['linear-gradient(135deg,#264653,#2A9D8F)', 'linear-gradient(135deg,#E76F51,#F4A261)', 'linear-gradient(135deg,#6D597A,#B56576)', 'linear-gradient(135deg,#355070,#6D9DC5)', 'linear-gradient(135deg,#2A9D8F,#E9C46A)'];
    const items = [['Tech', 'The tiny laptop that lasts three days'], ['Food', 'Why everyone is baking with rye again'], ['Travel', 'The quietest beaches left in Europe'], ['Money', 'Five apps that actually help you save'], ['Science', 'A new map of the ocean floor'], ['Culture', 'The year’s best albums so far'], ['Health', 'How long a walk you really need'], ['Design', 'Small homes with big ideas'], ['Sport', 'The comeback nobody saw coming'], ['Books', 'Ten novels for a long weekend']];
    const cards = [], car = el('div', 'qs-car'), carItems = [];
    items.forEach(([k, t], i) => { const c = el('article', 'qs-card'), im = el('i'), tx = el('div'); im.style.setProperty('--g', G2[i % 5]); tx.append(el('small', null, k), el('b', null, t), el('p', null, 'Readers can’t stop sharing this one. Here is the short version, in three minutes.')); c.append(im, tx); feed.append(c); cards.push(c);
      if (i === 3) { for (let j = 0; j < 8; j++) { const d = el('div'); d.style.setProperty('--g', G2[j % 5]); car.append(d); carItems.push(d); } feed.append(car); } });
    const bar = el('div', 'qs-bar', '🔥 Flash deal: 3 months free · Tap to claim');
    const pop = el('div', 'qs-pop'), pd = el('div'), pc = btn('', 'No thanks'); pd.append(el('b', null, 'Wait! Don’t miss out'), el('p', null, 'Join 2 million readers and get the best stories every morning.'), pc); pop.append(pd); pop.hidden = true; pc.addEventListener('click', () => { pop.hidden = true; });
    site.append(top, hero, feed, bar); page.append(site); page.parentElement.append(pop);

    /* ---- scrolling engine ---- */
    let target = 0, cur = 0, raf = 0, rawV = 0, lastTop = 0;
    const maxS = () => page.scrollHeight - page.clientHeight;
    page.addEventListener('wheel', e => {
      rawV += e.deltaY;
      if (!S.on || reduced) return; e.preventDefault();
      target = Math.max(0, Math.min(maxS(), target + e.deltaY * S.speed)); if (!raf) loop();
    }, { passive: false });
    page.addEventListener('keydown', e => { if (!S.on) return; const k = { ArrowDown: 80, ArrowUp: -80, PageDown: page.clientHeight * .85, PageUp: -page.clientHeight * .85, ' ': page.clientHeight * .85 }[e.key]; if (k == null) return; e.preventDefault(); rawV += k; target = Math.max(0, Math.min(maxS(), target + k)); if (!raf) loop(); });
    function loop() { raf = requestAnimationFrame(() => { cur += (target - cur) * S.ease; if (Math.abs(target - cur) < .4) cur = target; page.scrollTop = cur; if (cur !== target) loop(); else raf = 0; }); }
    page.tabIndex = 0;
    page.addEventListener('scroll', () => {
      const y = page.scrollTop; if (!raf) { cur = target = y; }
      const jitter = !(S.on && S.calm);
      hi.style.transform = 'translateY(' + (y * (jitter ? .55 : .12)) + 'px)';
      carItems.forEach((d, i) => { d.style.transform = 'translateX(' + (jitter ? -y * (.35 + (i % 3) * .1) % 220 : 0) + 'px)'; });
      cards.forEach((c, i) => { c.style.transform = jitter ? 'translateY(' + (Math.sin(y / 60 + i) * 6) + 'px)' : ''; });
      bar.style.transform = jitter ? 'translateY(' + (Math.abs(Math.sin(y / 40)) * -10) + 'px)' : '';
      const f = y / Math.max(1, maxS());
      if (f > .4 && !popShown) { popShown = true; if (S.on && S.pops) { popsBlocked++; toast('QuietScroll blocked a scroll pop-up'); renderPop(); } else { pop.hidden = false; if (G && !reduced) G.from(pd, { scale: .7, opacity: 0, duration: .4, ease: 'back.out(2)' }); } }
      if (f < .1) popShown = false;
    }, { passive: true });

    /* ---- live speed graph ---- */
    const gw = el('div', 'qs-graph'), cv = el('canvas'); gw.append(cv); const ctx = cv.getContext('2d'); const N = 120, rawH = new Array(N).fill(0), smH = new Array(N).fill(0);
    function graph() {
      const st = page.scrollTop, sv = st - lastTop; lastTop = st; rawH.push(rawV); rawH.shift(); smH.push(sv); smH.shift(); rawV *= .0;
      if (H.pop.isOpen()) { const r = gw.getBoundingClientRect(), d = window.devicePixelRatio || 1; if (cv.width !== Math.round(r.width * d)) { cv.width = r.width * d; cv.height = r.height * d; }
        const w = cv.width, h = cv.height, mid = h / 2, sc = h / 2 / 90; ctx.clearRect(0, 0, w, h); ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
        [[rawH, '#E76F51'], [smH, '#4ADE80']].forEach(([a, col]) => { ctx.strokeStyle = col; ctx.lineWidth = 2 * d; ctx.beginPath(); a.forEach((v, i) => { const x = i / (N - 1) * w, y = mid - Math.max(-90, Math.min(90, v)) * sc; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); }); }
      requestAnimationFrame(graph);
    }
    requestAnimationFrame(graph);

    /* ---- popover ---- */
    const P = el('div', 'pc'), power = swBtn('QuietScroll', 'Smooth scrolling on this site');
    power.addEventListener('click', () => { S.on = !S.on; save(); renderPop(); page.dispatchEvent(new Event('scroll')); toast(S.on ? 'QuietScroll on: scroll the feed' : 'QuietScroll off: feel the jolts'); });
    const gb = el('div'), leg = el('div', 'qs-leg'), l1 = el('span'), l2 = el('span'), i1 = el('i'), i2 = el('i'); i1.style.background = '#E76F51'; i2.style.background = '#4ADE80'; l1.append(i1, document.createTextNode('your input')); l2.append(i2, document.createTextNode('page movement')); leg.append(l1, l2); gb.append(label('Scroll speed, live'), gw, leg);
    const mk = (t, min, max, step, key, fmt) => { const b = el('div'), o = el('output'), r = el('input', 'qs-rng'); r.type = 'range'; r.min = min; r.max = max; r.step = step; r.setAttribute('aria-label', t); b.append(label(t, o), r);
      const sync = () => { r.value = S[key]; o.textContent = fmt(S[key]); r.style.setProperty('--p', ((S[key] - min) / (max - min) * 100) + '%'); }; r.addEventListener('input', () => { S[key] = +r.value; sync(); }); r.addEventListener('change', save); return [b, sync]; };
    const [smB, smS] = mk('Smoothness', .04, .3, .01, 'ease', v => v <= .07 ? 'very soft' : v <= .12 ? 'soft' : v <= .2 ? 'light' : 'crisp');
    const [spB, spS] = mk('Speed', .5, 1.5, .05, 'speed', v => Math.round(v * 100) + '%');
    const calm = swBtn('Calm parallax and bouncing bars', null, true), pops = swBtn('Block pop-ups triggered by scrolling', null, true);
    calm.addEventListener('click', () => { S.calm = !S.calm; save(); renderPop(); page.dispatchEvent(new Event('scroll')); }); pops.addEventListener('click', () => { S.pops = !S.pops; save(); renderPop(); });
    const st = el('div', 'qs-st'), a = el('div'), b2 = el('div'), n1 = el('b'), n2 = el('b'); a.append(n1, el('span', null, 'pop-ups blocked')); b2.append(n2, el('span', null, 'smoothing')); st.append(a, b2);
    P.append(power, gb, smB, spB, calm, pops, st); pb.append(P);
    function renderPop() { power.setAttribute('aria-checked', String(S.on)); calm.setAttribute('aria-checked', String(S.calm)); pops.setAttribute('aria-checked', String(S.pops)); [smB, spB, calm, pops].forEach(x => x.classList.toggle('pc-off', !S.on)); smS(); spS(); n1.textContent = String(popsBlocked); n2.textContent = S.on ? 'on' : 'off'; H.badge(popsBlocked || ''); }
    renderPop(); page.dispatchEvent(new Event('scroll'));
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
