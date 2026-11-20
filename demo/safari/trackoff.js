/* TrackOff — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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


/* ---------- TrackOff simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"cats":{"ads":["Ads","#F04438"],"analytics":["Analytics","#F79009"],"social":["Social","#7A5AF8"],"finger":["Fingerprinting","#0BA5EC"]},"trackers":[["AdNexus","ads"],["ClickFunnel","ads"],["BidStream","ads"],["PixelPeek","analytics"],["HeatTrail","analytics"],["MetricMax","analytics"],["ShareWave","social"],["LikeLoop","social"],["DeviceDNA","finger"],["CanvasPrint","finger"]],"key":"to_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const saved = store.get(M.key, null) || {};
    const S = { on: saved.on !== false, allow: Array.isArray(saved.allow) ? saved.allow.filter(n => M.trackers.some(t => t[0] === n)) : [] };
    const save = () => store.set(M.key, S);
    const T = M.trackers.map(([n, cat], i) => ({ n, cat, c: M.cats[cat][1], a: i / M.trackers.length * Math.PI * 2 + .3, hits: 0, blocked: 0 }));
    let blocked = 0, wake = 0, through = 0;
    const isBlocked = t => S.on && !S.allow.includes(t.n);

    /* ---- page: recipe on the left, tracker radar on the right ---- */
    const site = el('div', 'to-site'), art = el('article', 'to-art'), radar = el('div', 'to-radar'), cv = el('canvas'), rl = el('div', 'to-rl'), cnt = el('div', 'to-cnt'), cb = el('b', null, '0'), cs = el('span', null, 'trackers blocked');
    art.append(el('small', null, 'Dinner · 30 min'), el('h1', null, 'Weeknight lemon chicken'), el('p', null, 'Golden thighs, a buttery lemon sauce and a handful of capers. One pan, thirty minutes, almost no washing up.'), el('div', 'to-img'));
    const ol = el('ol'); ['Season the chicken and brown it skin-side down.', 'Add garlic, lemon and stock; simmer for ten minutes.', 'Stir in butter and capers, then serve with greens.'].forEach(t => ol.append(el('li', null, t))); art.append(ol, el('p', null, 'This page loads 10 trackers in the background. You would never know from looking at it.'));
    rl.append(document.createTextNode('Tracker radar · '), el('b', null, 'live')); cnt.append(cb, cs); radar.append(cv, rl, cnt); radar.setAttribute('aria-label', 'Tracker radar: trackers on this page and whether they are blocked'); radar.setAttribute('role', 'img');
    site.append(radar, art); page.append(site);

    /* ---- radar animation ---- */
    const ctx = cv.getContext('2d'), pulses = []; let W = 0, Hh = 0, dpr = 1, t0 = performance.now();
    function size() { const r = radar.getBoundingClientRect(); dpr = window.devicePixelRatio || 1; W = r.width; Hh = r.height; cv.width = W * dpr; cv.height = Hh * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    window.addEventListener('resize', size); size();
    function fire() {
      const t = T[Math.floor(Math.random() * T.length)], b = isBlocked(t); pulses.push({ t, b, p: 0 }); t.hits++;
      if (b) { t.blocked++; blocked++; } else { through++; wake++; }
      renderPop();
    }
    let ft = 0;
    function frame(now) {
      if (!W) size(); const cx0 = W / 2, cy0 = Hh / 2 + 6, R = Math.min(W, Hh) * .38, shield = R * .42, el2 = now - t0;
      ctx.clearRect(0, 0, W, Hh);
      ctx.strokeStyle = 'rgba(148,163,184,.12)'; ctx.lineWidth = 1; [R * .42, R * .72, R].forEach(r => { ctx.beginPath(); ctx.arc(cx0, cy0, r, 0, 7); ctx.stroke(); });
      const sweep = (el2 / 2200) % (Math.PI * 2); const g = ctx.createConicGradient ? ctx.createConicGradient(sweep, cx0, cy0) : null; if (g) { g.addColorStop(0, 'rgba(52,211,153,.18)'); g.addColorStop(.12, 'rgba(52,211,153,0)'); g.addColorStop(1, 'rgba(52,211,153,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx0, cy0, R, 0, 7); ctx.fill(); }
      if (S.on) { ctx.strokeStyle = 'rgba(52,211,153,.75)'; ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.arc(cx0, cy0, shield, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
      T.forEach(t => { const x = cx0 + Math.cos(t.a) * R, y = cy0 + Math.sin(t.a) * R, b = isBlocked(t);
        ctx.strokeStyle = b ? 'rgba(148,163,184,.12)' : 'rgba(240,68,56,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = b ? 'rgba(148,163,184,.45)' : t.c; ctx.beginPath(); ctx.arc(x, y, b ? 6 : 8, 0, 7); ctx.fill();
        if (b) { ctx.strokeStyle = '#0B1320'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 3, y - 3); ctx.lineTo(x + 3, y + 3); ctx.moveTo(x + 3, y - 3); ctx.lineTo(x - 3, y + 3); ctx.stroke(); }
        ctx.fillStyle = b ? 'rgba(148,163,184,.6)' : '#E2E8F0'; ctx.font = '600 10px ' + getComputedStyle(document.documentElement).getPropertyValue('--mono'); ctx.textAlign = Math.cos(t.a) > .2 ? 'left' : Math.cos(t.a) < -.2 ? 'right' : 'center'; ctx.fillText(t.n, x + Math.cos(t.a) * 14, y + Math.sin(t.a) * 14 + 3); });
      ctx.fillStyle = '#FDE68A'; ctx.beginPath(); ctx.arc(cx0, cy0, 15, 0, 7); ctx.fill(); ctx.fillStyle = '#0B1320'; ctx.font = '800 11px Archivo, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('page', cx0, cy0 + 4);
      for (let i = pulses.length - 1; i >= 0; i--) { const pu = pulses[i]; pu.p += reduced ? 1 : .022; const lim = pu.b ? shield / R : 1, f = Math.min(pu.p, lim), x = cx0 + Math.cos(pu.t.a) * R * f, y = cy0 + Math.sin(pu.t.a) * R * f;
        if (pu.b && pu.p >= lim) { const k = (pu.p - lim) / .3; ctx.strokeStyle = 'rgba(52,211,153,' + Math.max(0, 1 - k) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 4 + k * 14, 0, 7); ctx.stroke(); if (k >= 1) pulses.splice(i, 1); continue; }
        ctx.fillStyle = pu.b ? '#34D399' : pu.t.c; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); if (!pu.b && pu.p >= 1) pulses.splice(i, 1); }
      if (now - ft > 650 && !document.hidden) { ft = now; fire(); }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    /* ---- popover ---- */
    const P = el('div', 'pc'), power = swBtn('TrackOff', 'Blocking trackers on this site');
    power.addEventListener('click', () => { S.on = !S.on; save(); renderPop(); toast(S.on ? 'TrackOff on' : 'TrackOff off: every tracker gets through'); H.tone(S.on ? 660 : 330, .08); });
    const bat = el('div', 'to-bat'), cell = el('div', 'to-cell'), lvl = el('i'), bt = el('div'), bm = el('b'), bs = el('span'); cell.append(lvl); bt.append(bm, bs); bat.append(cell, bt);
    const cb2 = el('div'), cats = el('div', 'to-cats'), catEls = {}; Object.entries(M.cats).forEach(([k, [n, c]]) => { const d = el('div'), b = el('b', null, '0'); b.style.setProperty('--c', c); d.append(b, el('span', null, n + ' blocked')); cats.append(d); catEls[k] = b; }); cb2.append(label('Blocked by type'), cats);
    const lb = el('div'), list = el('div', 'to-list'), lc = el('output'); lb.append(label('Companies on this page', lc), list);
    const rows = T.map(t => { const r = el('div', 'to-co'), i = el('i'), sm = el('small'), b = btn(''); i.style.setProperty('--c', t.c); r.append(i, el('span', null, t.n), sm, b);
      b.addEventListener('click', () => { const k = S.allow.indexOf(t.n); if (k < 0) S.allow.push(t.n); else S.allow.splice(k, 1); save(); renderPop(); toast(k < 0 ? t.n + ' allowed on this site' : t.n + ' blocked again'); }); list.append(r); return { t, sm, b }; });
    P.append(power, bat, cb2, lb); pb.append(P);
    function renderPop() {
      power.setAttribute('aria-checked', String(S.on)); cb.textContent = String(blocked);
      const saveMin = Math.round(blocked * .09), lost = Math.round(through * .09), pct = Math.max(18, Math.min(100, 70 + saveMin * .4 - lost * .6));
      lvl.style.height = pct + '%'; lvl.classList.toggle('lo', pct < 45); bm.textContent = (saveMin - lost >= 0 ? '+' : '') + (saveMin - lost) + ' min';
      bs.textContent = 'battery today · ' + wake + ' CPU wake-ups let through';
      Object.keys(catEls).forEach(k => { catEls[k].textContent = String(T.filter(t => t.cat === k).reduce((a, t) => a + t.blocked, 0)); });
      const allowed = T.filter(t => !isBlocked(t)).length; lc.textContent = allowed ? allowed + ' allowed' : 'all blocked';
      rows.forEach(({ t, sm, b }) => { const a = S.allow.includes(t.n); sm.textContent = t.blocked + ' stopped'; b.textContent = a ? 'Allowed' : 'Blocked'; b.setAttribute('aria-pressed', String(a)); b.setAttribute('aria-label', (a ? 'Block ' : 'Allow ') + t.n); b.classList.toggle('pc-off', !S.on); });
      H.badge(blocked > 99 ? '99+' : blocked || '');
    }
    renderPop();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
  /* poster layout: the tilted demo straightens as it scrolls into view */
  if (window.gsap && window.ScrollTrigger && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', () => { gsap.to('.po-tilt', { rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.po-tilt', start: 'top 95%', end: 'top 30%', scrub: 1 } }); });
    mm.add('(max-width: 699px)', () => { gsap.set('.po-tilt', { rotate: 0, scale: 1 }); });
  }
})();
