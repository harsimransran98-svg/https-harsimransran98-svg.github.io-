/* SpeedTrim — Firefox add-on page with a live browser simulator (Bazozo Studio, generated).
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


/* ---------- SpeedTrim simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"cats":[["video","Autoplay video"],["ads","Ad payloads"],["track","Trackers"],["widgets","Heavy widgets"]],"reqs":[{"n":"tram-line.html","t":"doc","kb":46,"s":0,"d":260},{"n":"site.css","t":"css","kb":62,"s":240,"d":180},{"n":"app.js","t":"js","kb":96,"s":250,"d":240},{"n":"serif-display.woff2","t":"font","kb":84,"s":420,"d":220},{"n":"tram-hero.webp","t":"img","kb":210,"s":430,"d":420},{"n":"autoplay-promo.mp4","t":"media","kb":8420,"s":520,"d":5200,"trim":"video"},{"n":"adsbygoodness.js","t":"js","kb":412,"s":480,"d":900,"trim":"ads"},{"n":"ad-frame-leader.html","t":"doc","kb":688,"s":1380,"d":1100,"trim":"ads"},{"n":"ad-frame-side.html","t":"doc","kb":540,"s":1400,"d":1300,"trim":"ads"},{"n":"analytics-suite.js","t":"js","kb":318,"s":500,"d":700,"trim":"track"},{"n":"pixel.gif?uid=…","t":"img","kb":2,"s":1200,"d":300,"trim":"track"},{"n":"heatmap-recorder.js","t":"js","kb":266,"s":1250,"d":800,"trim":"track"},{"n":"comments-widget.js","t":"js","kb":524,"s":900,"d":1500,"trim":"widgets"},{"n":"map-thumb.png","t":"img","kb":128,"s":700,"d":360}],"article":{"kick":"City · 4 min read","h1":"City council approves new tram line","dek":"The 9 km route will link the station to the university, with services every six minutes from 2028.","ps":["Councillors voted 31 to 9 on Tuesday night to approve the line, ending a two-year consultation that drew more than 14,000 responses.","The route runs along Harbour Road and Mill Street, replacing two bus services that currently carry around 22,000 passengers a day.","Construction is expected to start next spring. Businesses along the route will be offered grants to cover lost trade during the works."]},"key":"st_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const saved = store.get(M.key, null) || {};
    const S = { on: saved.on !== false, cats: {} };
    M.cats.forEach(([k]) => { S.cats[k] = !(saved.cats && saved.cats[k] === false); });
    const save = () => store.set(M.key, { on: S.on, cats: S.cats });
    const trimmed = r => !!(r.trim && S.on && S.cats[r.trim]);
    const SCALE = Math.max(...M.reqs.map(r => r.s + r.d)) * 1.04;
    const result = all => { const live = M.reqs.filter(r => all || !trimmed(r)); return { ms: Math.max(...live.map(r => r.s + r.d)), kb: live.reduce((a, r) => a + r.kb, 0), n: live.length }; };
    const mb = kb => kb >= 1000 ? (kb / 1000).toFixed(1) + ' MB' : Math.round(kb) + ' kB';
    const sec = ms => (ms / 1000).toFixed(2) + ' s';
    let savedKb = 0, savedMs = 0, runs = 0;

    /* ---- article (built once, revealed as requests finish) ---- */
    const A = M.article, art = el('div', 'stp raw'), top = el('div', 'st-top'), wrap = el('div', 'st-wrap'), main = el('div'), side = el('div', 'st-side');
    top.append(document.createTextNode('Metro Daily'), el('span', null, 'News · City · Sport · Opinion'));
    const lead = el('div', 'st-ad', 'ADVERTISEMENT'), sideAd = el('div', 'st-ad', 'AD');
    const hero = el('div', 'st-hero'), body = el('div'), vid = el('div', 'st-vid'), cm = el('div', 'st-cm');
    main.append(el('p', 'st-kick', A.kick), el('h1', null, A.h1), el('p', 'st-dek', A.dek), hero, body, vid, cm);
    const card = t => { const c = el('div', 'card'), i = el('i'); c.append(i, document.createTextNode(t)); return c; };
    const c1 = card('Harbour Road works: what changes'), c2 = card('Map: the full tram route');
    side.append(sideAd, c1, c2); wrap.append(lead, main, side); art.append(top, wrap); page.append(art);

    /* ---- network panel ---- */
    const view = page.parentElement, net = el('div', 'st-net'), nh = el('div', 'st-nh'), sum = el('span', 'sum'), rows = el('div', 'st-rows');
    const rl = btn('', '↻ Reload'); rl.addEventListener('click', () => run());
    nh.append(el('b', null, 'Network'), sum, rl); net.append(nh, rows); view.append(net);
    const dcl = el('i', 'st-dcl'), ld = el('i', 'st-ld');
    const R = M.reqs.map(r => { const row = el('div', 'st-r'), wf = el('div', 'st-wf'), bar = el('i', r.kb > 400 ? 'heavy' : ''), sz = el('span', 'sz', '');
      wf.append(bar); row.append(el('span', 'nm', r.n), el('span', 'ty', r.t), sz, wf); rows.append(row); return { r, row, bar, sz, wf }; });
    rows.append(dcl, ld);
    const tb = document.querySelectorAll('#cx .cx-nb')[2]; const reload = btn('cx-nb', '↻'); reload.setAttribute('aria-label', 'Reload page'); tb.replaceWith(reload); reload.addEventListener('click', () => run());

    /* ---- the load ---- */
    let raf = 0, busy = false;
    function reset() {
      art.className = 'stp raw'; hero.className = 'st-hero'; lead.classList.remove('in'); sideAd.classList.remove('in'); c2.querySelector('i').className = '';
      body.textContent = ''; for (let i = 0; i < 5; i++) body.append(el('div', 'st-sk')); vid.textContent = ''; cm.textContent = ''; cm.hidden = true;
      R.forEach(x => { x.row.className = 'st-r' + (trimmed(x.r) ? ' trim' : ''); x.bar.style.left = (x.r.s / SCALE * 100) + '%'; x.bar.style.width = '0'; x.sz.textContent = trimmed(x.r) ? '0 B' : '–'; x.wf.style.setProperty('--x', (x.r.s / SCALE * 100) + '%'); });
      dcl.style.display = 'none'; ld.style.display = 'none';
    }
    const colX = () => { const r0 = rows.getBoundingClientRect(), w = R[0].wf.getBoundingClientRect(); return [w.left - r0.left, w.width]; };
    function videoState(state, pct) {
      if (state === 'trim') { vid.textContent = ''; const mg = el('div', 'msg'), p = btn('play', '▶'); p.setAttribute('aria-label', 'Play video (8.4 MB)');
        p.addEventListener('click', () => { videoState('play'); toast('Video loaded on demand · 8.4 MB'); H.tone(660, .06); });
        mg.append(p, el('span', null, 'Video held back by SpeedTrim'), el('span', null, 'Tap to load · 8.4 MB')); vid.append(el('span', 'tag', 'Promo'), mg); }
      else if (state === 'buf') { if (!vid.querySelector('.buf')) { vid.textContent = ''; const mg = el('div', 'msg'); mg.append(el('span', null, 'Autoplay video buffering…')); vid.append(el('span', 'tag', 'Promo · autoplay'), mg, el('i', 'buf')); } vid.querySelector('.buf').style.width = pct + '%'; }
      else { vid.textContent = ''; vid.append(el('div', 'bg'), el('span', 'tag', 'Promo · playing')); }
    }
    function run() {
      if (busy) cancelAnimationFrame(raf); busy = true; reset(); reload.classList.add('spin'); page.scrollTop = 0;
      const res = result(false), full = result(true), t0 = performance.now(), speed = reduced ? 100 : 1.6, done = new Set();
      const at = (k, f) => { if (!done.has(k)) { done.add(k); f(); } };
      const frame = () => {
        const t = (performance.now() - t0) * speed; let kb = 0, n = 0;
        R.forEach(x => { if (trimmed(x.r)) return; const p = Math.max(0, Math.min(1, (t - x.r.s) / x.r.d)); if (p > 0) { n++; kb += x.r.kb * p; } x.bar.style.width = (x.r.d / SCALE * 100 * p) + '%'; if (p > 0) x.sz.textContent = mb(x.r.kb * p); });
        const fin = n => { const r = M.reqs.find(q => q.n.startsWith(n)); return r && !trimmed(r) && t >= r.s + r.d; };
        if (fin('tram-line')) at('doc', () => { body.textContent = ''; A.ps.forEach(p => body.append(el('p', 'tx', p))); });
        if (fin('site.css')) at('css', () => art.classList.remove('raw'));
        if (fin('serif')) at('font', () => art.classList.add('fnt'));
        if (fin('tram-hero')) at('hero', () => hero.classList.add('in'));
        if (fin('map-thumb')) at('map', () => c2.querySelector('i').className = 'in');
        const v = M.reqs.find(q => q.trim === 'video');
        if (trimmed(v)) at('vtrim', () => videoState('trim')); else if (t >= v.s) { const p = Math.min(100, (t - v.s) / v.d * 100); if (p < 100) videoState('buf', p); else at('vplay', () => videoState('play')); }
        if (fin('ad-frame-leader')) at('ad1', () => { lead.classList.add('in'); toast('Layout shift: an ad pushed the article down'); });
        if (fin('ad-frame-side')) at('ad2', () => sideAd.classList.add('in'));
        const w = M.reqs.find(q => q.trim === 'widgets');
        if (trimmed(w)) at('cm', () => { cm.hidden = false; cm.textContent = 'Comments (148) · '; const b = btn('', 'Load comments · 524 kB'); b.addEventListener('click', () => { cm.textContent = '148 comments loaded on demand.'; }); cm.append(b); });
        else if (t >= w.s + w.d) at('cm', () => { cm.hidden = false; cm.textContent = '148 comments · loaded automatically with 524 kB of script'; });
        if (t >= 490) at('dcl', () => { const [x, wd] = colX(); dcl.style.display = 'block'; dcl.style.left = (x + 490 / SCALE * wd) + 'px'; });
        sum.textContent = ''; sum.append(document.createTextNode(n + ' requests · ' + mb(kb) + ' · '), el('em', null, 'Load ' + sec(Math.min(t, res.ms))), el('span', null, '  ·  ' + M.reqs.filter(trimmed).length + ' trimmed'));
        if (t < res.ms) { raf = requestAnimationFrame(frame); return; }
        const [x, wd] = colX(); ld.style.display = 'block'; ld.style.left = (x + res.ms / SCALE * wd) + 'px';
        busy = false; reload.classList.remove('spin'); runs++;
        if (res.kb < full.kb) { savedKb += full.kb - res.kb; savedMs += full.ms - res.ms; }
        renderPop(); H.tone(res.ms < 2000 ? 880 : 330, .08);
        toast(res.ms < full.ms ? 'Loaded in ' + sec(res.ms) + ', ' + (full.ms / res.ms).toFixed(1) + '× faster' : 'Loaded in ' + sec(res.ms) + ' with nothing trimmed');
      };
      raf = requestAnimationFrame(frame);
    }

    /* ---- popup ---- */
    const P = el('div', 'pc'), power = swBtn('SpeedTrim on this site', 'metrodaily.example');
    power.addEventListener('click', () => { S.on = !S.on; save(); renderPop(); toast(S.on ? 'SpeedTrim on · reload to see it' : 'SpeedTrim off · reload to feel the difference'); H.tone(S.on ? 660 : 440, .08); });
    const cmpBox = el('div'), cmp = el('div', 'st-cmp');
    const bar = (lbl, on) => { const r = el('div', 'st-bar' + (on ? ' on' : '')), i = el('i'), e = el('em'), b = el('b'); i.append(e); r.append(el('span', null, lbl), i, b); cmp.append(r); return { e, b }; };
    const bt1 = bar('Load, untrimmed'), bt2 = bar('Load, trimmed', true), bw1 = bar('Data, untrimmed'), bw2 = bar('Data, trimmed', true);
    cmpBox.append(label('This page'), cmp);
    const catBox = el('div'), cats = el('div', 'st-cats');
    const catBtns = M.cats.map(([k, t]) => { const b = btn('st-cat'); b.setAttribute('role', 'switch'); const kb = M.reqs.filter(r => r.trim === k).reduce((a, r) => a + r.kb, 0);
      b.append(el('span', null, t), el('small', null, mb(kb)), el('i')); b.addEventListener('click', () => { S.cats[k] = !S.cats[k]; save(); renderPop(); H.tone(523, .05); }); cats.append(b); return [k, b]; });
    catBox.append(label('Trim'), cats);
    const tot = el('div', 'st-tot'), tk = el('b'), tm = el('b'), d1 = el('div'), d2 = el('div'); d1.append(tk, el('span', null, 'data saved so far')); d2.append(tm, el('span', null, 'waiting saved')); tot.append(d1, d2);
    const go = btn('st-go', '↻ Reload this page'); go.addEventListener('click', () => run());
    P.append(power, cmpBox, catBox, tot, go); pb.append(P);
    function renderPop() {
      power.setAttribute('aria-checked', String(S.on)); catBtns.forEach(([k, b]) => { b.setAttribute('aria-checked', String(S.cats[k])); b.classList.toggle('pc-off', !S.on); });
      const full = result(true), res = result(false);
      bt1.e.style.width = '100%'; bt1.b.textContent = sec(full.ms); bt2.e.style.width = (res.ms / full.ms * 100) + '%'; bt2.b.textContent = sec(res.ms);
      bw1.e.style.width = '100%'; bw1.b.textContent = mb(full.kb); bw2.e.style.width = (res.kb / full.kb * 100) + '%'; bw2.b.textContent = mb(res.kb);
      tk.textContent = mb(savedKb); tm.textContent = (savedMs / 1000).toFixed(1) + ' s';
      const n = M.reqs.filter(trimmed).length; H.badge(n || '');
    }
    renderPop(); reset();
    const first = () => { if (!runs && !busy) setTimeout(run, 400); };
    if (G && window.ScrollTrigger) ScrollTrigger.create({ trigger: '#cx', start: 'top 75%', once: true, onEnter: first });
    else if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); first(); } }, { threshold: .3 }); io.observe(document.getElementById('cx')); }
    else first();
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
