/* NightShelf — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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
  const BTN = 5;
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


/* ---------- NightShelf simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"cities":[["London",7.35,16.08],["New York",6.72,16.63],["Mumbai",6.78,17.98],["Sydney",5.83,19.68],["Reykjavík",10,16.33]],"key":"ns_state_v1","host":"docs.lumen.example"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const hx = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
    const mix = (a, b, t) => '#' + hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, '0')).join('');
    const fmt = t => { t = ((t % 24) + 24) % 24; const h = Math.floor(t), mm = Math.floor((t - h) * 60); return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };
    const parse = v => { const mt = /^(\d{1,2}):(\d{2})$/.exec(v || ''); return mt ? Math.min(23.99, +mt[1] + +mt[2] / 60) : null; };
    const saved = store.get(M.key, null) || {};
    const S = { mode: ['sun', 'custom', 'always', 'off'].includes(saved.mode) ? saved.mode : 'sun', city: Number.isInteger(saved.city) && saved.city >= 0 && saved.city < M.cities.length ? saved.city : 0,
      from: typeof saved.from === 'number' ? saved.from : 20, to: typeof saved.to === 'number' ? saved.to : 7, fade: [0, .25, 1].includes(saved.fade) ? saved.fade : .25, img: saved.img !== false, skip: saved.skip === true };
    const save = () => store.set(M.key, S);
    const now = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
    let t = now(), playing = 0;
    const times = () => S.mode === 'custom' ? [S.to, S.from] : [M.cities[S.city][1], M.cities[S.city][2]];
    const ramp = (x, c, f) => f <= 0 ? (x >= c ? 1 : 0) : Math.max(0, Math.min(1, (x - (c - f / 2)) / f));
    function dark() { if (S.skip || S.mode === 'off') return 0; if (S.mode === 'always') return 1; const [R, St] = times(); return t < 12 ? 1 - ramp(t, R, S.fade) : ramp(t, St, S.fade); }

    /* ---- docs page ---- */
    const site = el('div', 'ns-site'), side = el('nav', 'ns-side'), main = el('main', 'ns-main'), sb = el('b'); sb.append(el('i'), document.createTextNode('Lumen Docs'));
    side.append(sb); [['Start', ['Introduction', 'Getting started', 'Installation']], ['Guides', ['Dashboards', 'Alerts', 'Sharing']]].forEach(([g, items]) => { side.append(el('small', null, g)); items.forEach(i => { const a = el('a', i === 'Getting started' ? 'on' : '', i); a.href = '#'; a.addEventListener('click', e => e.preventDefault()); side.append(a); }); });
    const code = el('div', 'ns-code'); code.append(document.createTextNode('$ npm install '), el('em', null, '@lumen/sdk'), document.createTextNode('\n$ lumen init --project '), el('em', null, 'my-app'));
    const call = el('div', 'ns-call', 'Tip: NightShelf is changing this page’s colours. Nothing on docs.lumen.example was built with a dark theme.');
    main.append(el('p', 'crumb', 'Docs / Start / Getting started'), el('h1', null, 'Getting started'), el('p', null, 'Lumen turns your product events into dashboards your whole team can read. This guide takes about five minutes.'),
      el('h2', null, '1. Install the SDK'), el('p', null, 'Add the SDK to your project and create a config file with the init command.'), code,
      el('h2', null, '2. Send your first event'), el('p', null, 'Events appear on your dashboard within a few seconds. Here is what a healthy first day looks like.'), el('div', 'ns-img'), call,
      el('p', null, 'From here, set up alerts for the numbers you care about and share a dashboard with your team.'));
    site.append(side, main); page.append(site);
    const clock = el('div', 'ns-clock'); page.parentElement.append(clock);
    const L = { bg: '#FFFFFF', side: '#F7F7F9', ink: '#1C1D24', ink2: '#3B3D48', dim: '#8B8D98', line: '#ECEDF1', hl: '#EEF0FF', acc: '#4F46E5', code: '#F4F4F7', codeink: '#2B2D38' };
    const D = { bg: '#14151B', side: '#101116', ink: '#E8E9EF', ink2: '#B9BBC6', dim: '#7C7F8C', line: '#262833', hl: '#23253A', acc: '#A5B4FC', code: '#0C0D12', codeink: '#D4D6E0' };
    function paint() {
      const d = dark(); Object.keys(L).forEach(k => site.style.setProperty('--p-' + k, mix(L[k], D[k], d))); site.style.setProperty('--p-img', S.img ? (1 - d * .3).toFixed(2) : 1);
      clock.textContent = (d > .5 ? '☾ ' : '☀ ') + fmt(t) + (playing ? '  ·  time-lapse' : '') + '  ·  ' + (d > .98 ? 'dark' : d < .02 ? 'light' : 'fading ' + Math.round(d * 100) + '%');
      H.badge(d > .5 ? '☾' : ''); drawDial(d);
    }

    /* ---- sky dial ---- */
    const NS = 'http://www.w3.org/2000/svg', W = 300, Hh = 132, mid = 84, amp = 56;
    const dial = el('div', 'ns-dial'), stars = el('div', 'ns-stars'), svg = document.createElementNS(NS, 'svg'), trail = document.createElementNS(NS, 'path'), hor = document.createElementNS(NS, 'line'), orb = el('span', 'ns-orb');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true'); trail.setAttribute('class', 'trail'); hor.setAttribute('x1', 0); hor.setAttribute('x2', W); hor.setAttribute('y1', mid); hor.setAttribute('y2', mid);
    const lbl = []; for (let i = 0; i < 4; i++) { const tx = document.createElementNS(NS, 'text'); svg.append(tx); lbl.push(tx); }
    svg.prepend(hor, trail); dial.append(stars, svg, orb);
    orb.tabIndex = 0; orb.setAttribute('role', 'slider'); orb.setAttribute('aria-label', 'Time of day'); orb.setAttribute('aria-valuemin', '0'); orb.setAttribute('aria-valuemax', '24');
    const elev = x => { const [R, St] = times(); if (x >= R && x <= St) return Math.sin(Math.PI * (x - R) / (St - R)); const len = 24 - St + R, k = x > St ? x - St : x + 24 - St; return -Math.sin(Math.PI * k / len) * .55; };
    function drawDial(d) {
      let p = ''; for (let i = 0; i <= 96; i++) { const x = i / 96 * 24; p += (i ? ' L' : 'M') + (x / 24 * W).toFixed(1) + ' ' + (mid - elev(x) * amp).toFixed(1); } trail.setAttribute('d', p);
      const [R, St] = times(); [[R, '↑ ' + fmt(R)], [St, '↓ ' + fmt(St)], [0, '00'], [24, '24']].forEach(([x, s], i) => { lbl[i].textContent = s; lbl[i].setAttribute('x', Math.max(2, Math.min(W - 40, x / 24 * W - (i < 2 ? 18 : i === 3 ? 14 : 0)))); lbl[i].setAttribute('y', i < 2 ? mid + 16 : Hh - 6); });
      const e = elev(t); orb.style.left = (t / 24 * 100) + '%'; orb.style.top = ((mid - e * amp) / Hh * 100) + '%'; orb.classList.toggle('moon', e < 0);
      dial.style.setProperty('--sky', 'linear-gradient(180deg, ' + mix('#7CC4FF', '#0B1030', d) + ', ' + mix('#DDF1FF', '#28305E', d) + ')'); stars.style.setProperty('--st', d.toFixed(2));
      orb.setAttribute('aria-valuenow', t.toFixed(2)); orb.setAttribute('aria-valuetext', fmt(t)); tout.textContent = fmt(t) + (Math.abs(t - now()) < .05 && !playing ? ' · now' : '');
    }
    const setT = v => { t = ((v % 24) + 24) % 24; paint(); };
    dial.addEventListener('pointerdown', e => { stop(); try { dial.setPointerCapture(e.pointerId); } catch (_) {} const mv = ev => { const r = dial.getBoundingClientRect(); setT(Math.max(0, Math.min(23.99, (ev.clientX - r.left) / r.width * 24))); }; mv(e); const up = () => { dial.removeEventListener('pointermove', mv); dial.removeEventListener('pointerup', up); }; dial.addEventListener('pointermove', mv); dial.addEventListener('pointerup', up); });
    orb.addEventListener('keydown', e => { const k = { ArrowLeft: -.25, ArrowRight: .25, ArrowDown: -1, ArrowUp: 1 }[e.key]; if (k) { e.preventDefault(); stop(); setT(t + k); } });
    function play() { if (playing) { stop(); return; } const t0 = performance.now(), from = t; playBtn.textContent = '❚❚ Pause'; const step = n => { const p = (n - t0) / 10000; setT(from + p * 24); if (p < 1) playing = requestAnimationFrame(step); else stop(); }; playing = requestAnimationFrame(step); }
    function stop() { if (playing) cancelAnimationFrame(playing); playing = 0; playBtn.textContent = '▶ Play 24 h'; paint(); }

    /* ---- popover ---- */
    const P = el('div', 'pc'), db = el('div'), ctl = el('div', 'ns-ctl'), tout = el('output'), playBtn = btn('play', '▶ Play 24 h'), nowBtn = btn('', 'Now');
    playBtn.addEventListener('click', play); nowBtn.addEventListener('click', () => { stop(); setT(now()); }); ctl.append(tout, nowBtn, playBtn); db.append(label('Today'), dial, ctl);
    const mb = el('div'), seg = el('div', 'pc-seg'); [['sun', 'Sun'], ['custom', 'Custom'], ['always', 'Always'], ['off', 'Off']].forEach(([k, tt]) => { const b = btn('', tt); b.dataset.k = k; b.addEventListener('click', () => { S.mode = k; save(); sync(); }); seg.append(b); }); mb.append(label('Dark mode'), seg);
    const cb = el('div'), cw = el('div', 'ns-sel'), sel = el('select'), ct = el('div', 'ns-times'), cr = el('span'), cs = el('span'); sel.setAttribute('aria-label', 'City');
    M.cities.forEach(([n], i) => { const o = el('option', null, n); o.value = i; sel.append(o); }); sel.addEventListener('change', () => { S.city = +sel.value; save(); sync(); toast('Following the sun in ' + M.cities[S.city][0]); }); cw.append(sel); ct.append(cr, cs); cb.append(label('Location'), cw, ct);
    const hb = el('div', 'ns-hr'), l1 = el('label', null, 'Dark from'), l2 = el('label', null, 'Light from'), i1 = el('input'), i2 = el('input'); i1.type = i2.type = 'time'; l1.append(i1); l2.append(i2); hb.append(l1, l2);
    i1.addEventListener('change', () => { const v = parse(i1.value); if (v != null && v > 12) { S.from = v; save(); sync(); } else { toast('Pick an evening time'); sync(); } }); i2.addEventListener('change', () => { const v = parse(i2.value); if (v != null && v < 12) { S.to = v; save(); sync(); } else { toast('Pick a morning time'); sync(); } });
    const fb = el('div'), fs = el('div', 'pc-seg'); [[0, 'Instant'], [.25, '15 min'], [1, '1 hour']].forEach(([k, tt]) => { const b = btn('', tt); b.dataset.k = k; b.addEventListener('click', () => { S.fade = k; save(); sync(); }); fs.append(b); }); fb.append(label('Fade'), fs);
    const im = swBtn('Dim images at night', null, true), sk = swBtn('Keep ' + M.host + ' light', null, true);
    im.addEventListener('click', () => { S.img = !S.img; save(); sync(); }); sk.addEventListener('click', () => { S.skip = !S.skip; save(); sync(); toast(S.skip ? 'This site will always stay light' : 'This site follows the schedule again'); });
    P.append(db, mb, cb, hb, fb, im, sk); pb.append(P);
    function sync() {
      seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.mode))); fs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.k === S.fade)));
      sel.value = S.city; const [R, St] = M.cities[S.city].slice(1); cr.textContent = 'Sunrise ' + fmt(R); cs.textContent = 'Sunset ' + fmt(St);
      cb.hidden = S.mode !== 'sun'; hb.hidden = S.mode !== 'custom'; i1.value = fmt(S.from); i2.value = fmt(S.to);
      im.setAttribute('aria-checked', String(S.img)); sk.setAttribute('aria-checked', String(S.skip)); paint();
    }
    sync();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
