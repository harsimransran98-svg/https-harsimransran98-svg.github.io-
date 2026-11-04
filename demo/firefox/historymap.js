/* HistoryMap — Firefox add-on page with a live browser simulator (Bazozo Studio).
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

/* ---------- add-on simulator ---------- */
  function demo(page, H) {
    const { el, svgEl, G, reduced, toast } = H, pb = H.pop.body;
    const KIND = { search: ['Search', '#FFC857'], wiki: ['Encyclopedia', '#5B8CFF'], news: ['News', '#FF7A90'], paper: ['Papers', '#7CE0C3'], video: ['Video', '#C38BFF'], shop: ['Shopping', '#FF9F43'], blog: ['Blogs', '#9AD0FF'], maps: ['Maps', '#6EE7B7'], travel: ['Travel', '#F9A8D4'] };
    const SESS = {
      octo: { name: 'Octopus sleep', start: [10, 2], nodes: [
        [0, null, 'do octopuses sleep?', 'search.example', 'search', 40], [2, 0, 'Octopus', 'wiki.example', 'wiki', 150], [4, 0, 'Octopuses may dream, scientists say', 'sciencenews.example', 'news', 260],
        [9, 2, 'Two-stage sleep in the common octopus', 'journals.example', 'paper', 420], [11, 2, 'Octopus changes colour while asleep', 'tube.example', 'video', 180], [14, 1, 'Cephalopod intelligence', 'wiki.example', 'wiki', 200],
        [17, 3, 'REM sleep', 'wiki.example', 'wiki', 160], [21, 6, 'do fish dream?', 'search.example', 'search', 30], [24, 7, 'Zebrafish show REM-like sleep', 'sciencenews.example', 'news', 220],
        [26, 5, 'Cuttlefish', 'wiki.example', 'wiki', 120], [29, 9, 'Cuttlefish camouflage in slow motion', 'tube.example', 'video', 240], [33, 10, 'Skin patterning during REM-like sleep', 'journals.example', 'paper', 380],
        [37, 4, 'Octopus enrichment at the aquarium', 'aquablog.example', 'blog', 140], [40, 12, 'Giant octopus plush, 60 cm', 'shop.example', 'shop', 90]] },
      lis: { name: 'Lisbon trip', start: [19, 30], nodes: [
        [0, null, 'lisbon in november', 'search.example', 'search', 25], [2, 0, 'Lisbon travel guide', 'travelwiki.example', 'travel', 240], [5, 0, 'Flights LIS 14–21 Nov', 'flights.example', 'travel', 300],
        [9, 1, 'Alfama neighbourhood', 'travelwiki.example', 'travel', 150], [12, 3, 'Alfama loft · 2 guests', 'staybnb.example', 'shop', 280], [15, 1, 'Tram 28 route', 'maps.example', 'maps', 90],
        [18, 5, 'Belém tower tickets', 'visitlisboa.example', 'shop', 110], [22, 3, 'Best pastel de nata in Lisbon', 'foodblog.example', 'blog', 200], [25, 7, 'Pastel de nata recipe', 'tube.example', 'video', 260]] }
    };
    let S = null, N = [], playT = Infinity, sel = null, off = new Set(), playing = null;
    /* layout: time on x, branches on lanes */
    function build(key) {
      S = SESS[key]; N = S.nodes.map(([t, p, title, host, kind, dwell], id) => ({ id, t, p, title, host, kind, dwell, kids: [] }));
      N.forEach(n => { if (n.p != null) N[n.p].kids.push(n); });
      let lane = 0; const place = (n, l) => { n.lane = l; n.kids.sort((a, b) => a.t - b.t).forEach((k, i) => place(k, i === 0 ? l : ++lane)); }; place(N[0], 0);
      N.forEach(n => { let d = 0, x = n; while (x.p != null) { d++; x = N[x.p]; } n.depth = d; });
      off.clear(); sel = null; playT = Infinity;
    }
    const clock = m => { const [h, mm] = S.start, tot = h * 60 + mm + m; return `${String(Math.floor(tot / 60) % 24).padStart(2, '0')}:${String(tot % 60).padStart(2, '0')}`; };

    /* the map page */
    const app = el('div', 'hm-app'), head = el('header', 'hm-head'), chips = el('div', 'hm-chips'), wrap = el('div', 'hm-wrap'), card = el('div', 'hm-card'); card.hidden = true;
    const ctrl = el('div', 'hm-ctrl'), play = el('button', 'hm-play', '▶ Replay session'), scrub = el('input'); play.type = 'button'; scrub.type = 'range'; scrub.min = 0; scrub.step = .5; scrub.setAttribute('aria-label', 'Session time');
    const tlab = el('code', 'hm-tl'); ctrl.append(play, scrub, tlab);
    app.append(head, chips, ctrl, wrap, card); page.append(app);
    let svg = null;
    function draw() {
      const maxT = N[N.length - 1].t, lanes = Math.max(...N.map(n => n.lane)) + 1, W = Math.max(640, wrap.clientWidth - 10), X = t => 80 + t / maxT * (W - 170), Y = l => 70 + l * 74;
      scrub.max = maxT; scrub.value = Math.min(playT, maxT); tlab.textContent = playT >= maxT ? `${clock(0)}–${clock(maxT)}` : clock(playT);
      svg = svgEl('svg', { viewBox: `0 0 ${W} ${Y(lanes) + 10}`, width: W, height: Y(lanes) + 10, class: 'hm-svg', role: 'img', 'aria-label': `Browsing map: ${N.length} pages` });
      const axis = svgEl('g', { class: 'hm-axis' }); for (let t = 0; t <= maxT; t += 5) { axis.append(svgEl('line', { x1: X(t), x2: X(t), y1: 22, y2: Y(lanes) - 20 })); const tx = svgEl('text', { x: X(t), y: 16, 'text-anchor': 'middle' }); tx.textContent = clock(t); axis.append(tx); } svg.append(axis);
      const path = new Set(); if (sel) { let x = sel; while (x) { path.add(x.id); x = x.p != null ? N[x.p] : null; } }
      const links = svgEl('g'), nodes = svgEl('g');
      N.forEach(n => {
        const vis = n.t <= playT, dim = off.has(n.kind) || (sel && !path.has(n.id)), x = X(n.t), y = Y(n.lane), col = KIND[n.kind][1];
        if (n.p != null) { const p = N[n.p], px = X(p.t), py = Y(p.lane), mx = (px + x) / 2; const l = svgEl('path', { d: `M${px} ${py} C${mx} ${py} ${mx} ${y} ${x} ${y}`, class: 'hm-link' + (dim ? ' dim' : '') + (path.has(n.id) && sel ? ' hot' : ''), stroke: col }); if (!vis) l.style.opacity = 0; links.append(l); n.link = l; }
        const g = svgEl('g', { class: 'hm-node' + (dim ? ' dim' : '') + (sel === n ? ' sel' : ''), transform: `translate(${x} ${y})`, tabindex: 0, role: 'button', 'aria-label': `${n.title}, ${n.host}, ${clock(n.t)}` });
        const r = 7 + Math.sqrt(n.dwell) / 3; g.append(svgEl('circle', { r: r + 5, class: 'halo', fill: col })), g.append(svgEl('circle', { r, fill: col }));
        const up = N.filter(m => m.lane === n.lane && m.t < n.t).length % 2 === 1; const lab = svgEl('text', { x: 0, y: up ? -(r + 8) : r + 15, 'text-anchor': 'middle' }); lab.textContent = n.title.length > 22 ? n.title.slice(0, 21) + '…' : n.title; g.append(lab);
        if (!vis) g.style.opacity = 0;
        g.addEventListener('click', () => select(n)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(n); } });
        nodes.append(g); n.g = g;
      });
      svg.append(links, nodes); wrap.replaceChildren(svg);
    }
    function select(n) {
      sel = sel === n ? null : n; draw(); card.hidden = !sel; if (!sel) return;
      card.replaceChildren(); card.style.setProperty('--k', KIND[n.kind][1]);
      const trail = []; let x = n; while (x) { trail.unshift(x); x = x.p != null ? N[x.p] : null; }
      const x2 = el('button', 'hm-x', '×'); x2.type = 'button'; x2.setAttribute('aria-label', 'Close details'); x2.addEventListener('click', () => select(n));
      card.append(x2, el('small', null, `${KIND[n.kind][0]} · ${n.host}`), el('b', null, n.title));
      const grid = el('div', 'hm-cg'); [['Visited', clock(n.t)], ['Time on page', `${Math.floor(n.dwell / 60)}m ${n.dwell % 60}s`], ['Opened from', n.p != null ? N[n.p].title : 'Start of session'], ['Led to', `${n.kids.length} page${n.kids.length === 1 ? '' : 's'}`]].forEach(([k, v]) => { const d = el('div'); d.append(el('span', null, k), el('em', null, v)); grid.append(d); }); card.append(grid);
      const tr = el('ol', 'hm-trail'); trail.forEach(t => tr.append(el('li', null, t.title))); card.append(el('span', 'hm-tlh', `Trail · ${trail.length} steps`), tr);
      const row = el('div', 'hm-row'), cp = el('button', 'btn pri', 'Copy trail'), ro = el('button', 'hm-sb', 'Reopen page'); cp.type = ro.type = 'button';
      cp.addEventListener('click', () => { const t = trail.map((s, i) => `${i + 1}. ${s.title} (${s.host})`).join('\n'); try { navigator.clipboard.writeText(t).catch(() => {}); } catch (_) {} toast(`Trail copied · ${trail.length} steps.`); });
      ro.addEventListener('click', () => toast(`Reopening ${n.host} in a new tab.`)); row.append(cp, ro); card.append(row);
      if (G && !reduced) G.from(card, { y: 14, opacity: 0, duration: .35, ease: 'power3.out' });
    }
    function setT(t, animate) {
      const before = playT; playT = t; const maxT = N[N.length - 1].t; scrub.value = Math.min(t, maxT); tlab.textContent = t >= maxT ? `${clock(0)}–${clock(maxT)}` : clock(t);
      N.forEach(n => { const vis = n.t <= t, was = n.t <= before; if (vis === was) return; if (vis && animate && G && !reduced) { G.fromTo(n.g, { opacity: 0, scale: 0, transformOrigin: 'center' }, { opacity: 1, scale: 1, duration: .45, ease: 'back.out(2.5)', clearProps: 'scale' }); if (n.link) { const L = n.link.getTotalLength(); n.link.style.opacity = 1; G.fromTo(n.link, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .5, ease: 'power2.out', clearProps: 'strokeDasharray,strokeDashoffset' }); } } else { n.g.style.opacity = vis ? 1 : 0; if (n.link) n.link.style.opacity = vis ? 1 : 0; } });
    }
    function replay() {
      if (playing) { playing.kill(); playing = null; play.textContent = '▶ Replay session'; return; }
      sel = null; card.hidden = true; draw(); setT(-1, false); const maxT = N[N.length - 1].t, o = { t: -1 }; play.textContent = '❚❚ Pause';
      if (!G || reduced) { setT(Infinity, false); play.textContent = '▶ Replay session'; return; }
      playing = G.to(o, { t: maxT, duration: Math.min(7, maxT / 5), ease: 'none', onUpdate: () => setT(o.t, true), onComplete: () => { playing = null; play.textContent = '▶ Replay session'; setT(Infinity, false); } });
    }
    play.addEventListener('click', replay);
    scrub.addEventListener('input', () => { if (playing) { playing.kill(); playing = null; play.textContent = '▶ Replay session'; } setT(+scrub.value, true); });
    function renderHead() {
      head.replaceChildren(); head.append(el('h1', null, S.name), el('span', null, `${N.length} pages · ${clock(0)}–${clock(N[N.length - 1].t)} · today`));
      chips.replaceChildren(); [...new Set(N.map(n => n.kind))].forEach(k => { const b = el('button', 'hm-chip'); b.type = 'button'; b.style.setProperty('--k', KIND[k][1]); b.append(el('i'), document.createTextNode(`${KIND[k][0]} · ${N.filter(n => n.kind === k).length}`)); b.setAttribute('aria-pressed', String(!off.has(k))); b.addEventListener('click', () => { off.has(k) ? off.delete(k) : off.add(k); renderHead(); draw(); }); chips.append(b); });
    }
    /* popup: sessions and stats */
    const sessBox = el('div', 'hm-sess'), stats = el('div', 'hm-stats'), rp = el('button', 'btn pri hm-rp', '▶ Replay this session'); rp.type = 'button'; rp.addEventListener('click', () => { H.pop.close(); replay(); });
    pb.append(el('p', 'hm-l', 'Today’s sessions'), sessBox, el('p', 'hm-l', 'This session'), stats, rp);
    let curKey = 'octo';
    function renderPop() {
      sessBox.replaceChildren(); Object.entries(SESS).forEach(([k, s]) => { const b = el('button', 'hm-s' + (k === curKey ? ' on' : '')); b.type = 'button'; const n = s.nodes.length; b.append(el('b', null, s.name), el('small', null, `${n} pages · started ${String(s.start[0]).padStart(2, '0')}:${String(s.start[1]).padStart(2, '0')}`)); b.addEventListener('click', () => load(k)); sessBox.append(b); });
      const longest = [...N].sort((a, b) => b.dwell - a.dwell)[0];
      stats.replaceChildren(); [['Pages', N.length], ['Branch points', N.filter(n => n.kids.length > 1).length], ['Deepest trail', Math.max(...N.map(n => n.depth)) + 1 + ' steps'], ['Longest stay', `${Math.round(longest.dwell / 60)} min`]].forEach(([k, v]) => { const d = el('div'); d.append(el('b', null, String(v)), el('span', null, k)); stats.append(d); });
      H.badge(N.length);
    }
    function load(k) { curKey = k; build(k); H.url('moz-extension://historymap/session/' + (k === 'octo' ? 'octopus-sleep' : 'lisbon-trip')); const tab = document.querySelector('.cx-tab.on span'); if (tab) tab.textContent = 'HistoryMap · ' + S.name; card.hidden = true; renderHead(); draw(); renderPop(); }
    let rz = null; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(draw, 150); });
    load('octo'); setTimeout(() => { H.pop.open(); }, 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
