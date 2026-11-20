/* ZoomKeeper — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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


/* ---------- ZoomKeeper simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"sites":[{"k":"ledger","t":"The Ledger","h":"theledger.example/briefing","c":"#1F3A5F","z":125,"kind":"news"},{"k":"board","t":"Ops dashboard","h":"opsboard.example/overview","c":"#0F766E","z":80,"kind":"dash"},{"k":"docs","t":"Postgres docs","h":"docs.example/postgres","c":"#336791","z":110,"kind":"docs"},{"k":"shop","t":"Trailshop","h":"trailshop.example/boots","c":"#3F8F4E","z":100,"kind":"shop"}],"key":"zk_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const saved = store.get(M.key, null) || {};
    const ok = v => typeof v === 'number' && v >= 50 && v <= 200;
    const S = { mode: saved.mode === 'text' ? 'text' : 'page', def: ok(saved.def) ? saved.def : 100, z: {} };
    M.sites.forEach(x => { S.z[x.k] = saved.z && ok(saved.z[x.k]) ? saved.z[x.k] : x.z; });
    const save = () => store.set(M.key, S);
    let act = 0, cur = S.z[M.sites[0].k], tw = null;

    /* ---- tabs + page ---- */
    const cx = document.getElementById('cx'), strip = cx.querySelector('.cx-tabs'), plus = strip.querySelector('.cx-plus'); strip.querySelectorAll('.cx-tab').forEach(n => n.remove());
    function renderTabs() { strip.querySelectorAll('.zk-t').forEach(n => n.remove()); M.sites.forEach((x, i) => { const n = el('div', 'cx-tab zk-t' + (i === act ? ' on' : '')), f = el('i', 'fav'); f.style.background = x.c; n.setAttribute('role', 'tab'); n.setAttribute('aria-selected', String(i === act)); n.tabIndex = 0; n.append(f, el('span', null, x.t), el('em', null, S.z[x.k] + '%')); const go = () => switchTo(i); n.addEventListener('click', go); n.addEventListener('keydown', e => { if (e.key === 'Enter') go(); }); strip.insertBefore(n, plus); }); }
    const wrap = el('div', 'zk-wrap'); page.append(wrap);
    function paint() {
      const x = M.sites[act]; H.url(x.h); wrap.textContent = ''; const site = el('div', 'zk-site'); site.style.setProperty('--c', x.c);
      const top = el('div', 'zk-top'); top.append(document.createTextNode(x.t), el('span', null, x.h.split('/')[0]));
      const b = el('div', 'zk-body'), copy = { news: ['Morning briefing', 'Markets opened higher as traders welcomed the rate decision. Here are the five stories you need before your first meeting.'], dash: ['Overview', 'Twelve services healthy, one degraded. Latency is up 4% on the checkout API since 09:00.'], docs: ['Index types', 'B-tree is the default and the right choice for most queries. GIN suits arrays and full-text search; BRIN shines on very large, naturally ordered tables.'], shop: ['Trail boots', 'Waterproof, grippy and broken in from day one. Free returns for 60 days.'] }[x.kind];
      b.append(el('h1', null, copy[0]), el('p', null, copy[1]), el('div', 'zk-img'));
      const cols = el('div', 'zk-cols'); [['12', 'stories today'], ['4 min', 'read time'], ['3', 'updates since 8am']].forEach(([v, l]) => { const d = el('div'); d.append(el('b', null, v), document.createTextNode(l)); cols.append(d); }); b.append(cols, el('p', null, 'Zoom is applied by ZoomKeeper the moment this tab opens, so you never see it at the wrong size.'));
      site.append(top, b); wrap.append(site); apply(cur);
    }
    function apply(z) {
      const site = wrap.firstChild; if (!site) return; const f = z / 100;
      if (S.mode === 'text') { wrap.style.transform = ''; wrap.style.width = ''; site.style.setProperty('--fs', (16 * f) + 'px'); }
      else { site.style.setProperty('--fs', '16px'); wrap.style.transform = 'scale(' + f + ')'; wrap.style.width = (100 / f) + '%'; }
    }
    function animateTo(z, after) { if (tw) tw.kill(); if (G && !reduced) tw = G.to({ v: cur }, { v: z, duration: .55, ease: 'power3.out', onUpdate() { cur = this.targets()[0].v; apply(cur); drawDial(); }, onComplete: after }); else { cur = z; apply(cur); drawDial(); if (after) after(); } }
    const hud = el('div', 'zk-hud'), hb = el('b'), hs = el('span'); hud.append(hb, hs); page.parentElement.append(hud);
    function showHud(z, msg) { hb.textContent = z + '%'; hs.textContent = msg; if (G && !reduced) { G.killTweensOf(hud); G.fromTo(hud, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: .3 }); G.to(hud, { opacity: 0, duration: .4, delay: 1.6 }); } }
    function switchTo(i) { act = i; renderTabs(); const x = M.sites[i]; page.scrollTop = 0; paint(); const z = S.z[x.k]; animateTo(z); showHud(z, z === 100 ? x.h.split('/')[0] + ' at normal size' : 'Restored for ' + x.h.split('/')[0]); renderPop(); H.tone(520 + z, .05); }
    function setZoom(z, quiet) { z = Math.max(50, Math.min(200, Math.round(z / 5) * 5)); const x = M.sites[act]; if (S.z[x.k] === z && quiet) return; S.z[x.k] = z; save(); animateTo(z); renderTabs(); renderPop(); if (!quiet) showHud(z, 'Remembered for ' + x.h.split('/')[0]); }

    /* ---- rotary dial: 50% at -135°, 200% at +135° ---- */
    const NS = 'http://www.w3.org/2000/svg', A0 = -135, A1 = 135, toA = z => A0 + (z - 50) / 150 * (A1 - A0), toZ = a => 50 + (a - A0) / (A1 - A0) * 150;
    const dialW = el('div', 'zk-dialw'), dial = el('div', 'zk-dial'), svg = document.createElementNS(NS, 'svg'), arc = document.createElementNS(NS, 'path'), knob = el('div', 'zk-knob'), ind = el('i'), kv = el('b'), ks = el('small');
    svg.setAttribute('viewBox', '0 0 184 184'); svg.setAttribute('aria-hidden', 'true'); arc.setAttribute('class', 'arc');
    const pt = (a, r) => [92 + Math.sin(a * Math.PI / 180) * r, 92 - Math.cos(a * Math.PI / 180) * r];
    for (let z = 50; z <= 200; z += 10) { const a = toA(z), mj = z % 50 === 0, [x1, y1] = pt(a, 88), [x2, y2] = pt(a, mj ? 76 : 81), l = document.createElementNS(NS, 'line'); [['x1', x1], ['y1', y1], ['x2', x2], ['y2', y2]].forEach(([k, v]) => l.setAttribute(k, v.toFixed(1))); if (mj) l.setAttribute('class', 'mj'); svg.append(l);
      if (mj) { const [tx, ty] = pt(a, 66), t = document.createElementNS(NS, 'text'); t.setAttribute('x', tx.toFixed(1)); t.setAttribute('y', (ty + 3).toFixed(1)); t.textContent = z; svg.append(t); } }
    svg.append(arc); knob.append(ind, kv, ks); dial.append(svg, knob); dialW.append(dial);
    dial.tabIndex = 0; dial.setAttribute('role', 'slider'); dial.setAttribute('aria-label', 'Zoom for this site'); dial.setAttribute('aria-valuemin', '50'); dial.setAttribute('aria-valuemax', '200');
    function drawDial() { const a = toA(cur), [sx, sy] = pt(A0, 92 - 6), [ex, ey] = pt(a, 92 - 6); arc.setAttribute('d', 'M' + sx.toFixed(1) + ' ' + sy.toFixed(1) + ' A86 86 0 ' + (a - A0 > 180 ? 1 : 0) + ' 1 ' + ex.toFixed(1) + ' ' + ey.toFixed(1)); knob.style.transform = 'rotate(' + a + 'deg)'; kv.style.transform = ks.style.transform = 'rotate(' + (-a) + 'deg)'; kv.textContent = Math.round(cur) + '%'; ks.textContent = S.mode === 'text' ? 'text only' : 'whole page'; dial.setAttribute('aria-valuenow', String(Math.round(cur))); dial.setAttribute('aria-valuetext', Math.round(cur) + ' percent'); }
    dial.addEventListener('pointerdown', e => { try { dial.setPointerCapture(e.pointerId); } catch (_) {} const mv = ev => { const r = dial.getBoundingClientRect(), dx = ev.clientX - (r.left + r.width / 2), dy = ev.clientY - (r.top + r.height / 2); let a = Math.atan2(dx, -dy) * 180 / Math.PI; a = Math.max(A0, Math.min(A1, a)); const z = Math.round(toZ(a) / 5) * 5; if (z !== Math.round(cur)) { S.z[M.sites[act].k] = z; cur = z; apply(cur); drawDial(); H.tone(300 + z * 2, .015); } };
      const up = () => { dial.removeEventListener('pointermove', mv); dial.removeEventListener('pointerup', up); save(); renderTabs(); renderPop(); showHud(Math.round(cur), 'Remembered for ' + M.sites[act].h.split('/')[0]); }; dial.addEventListener('pointermove', mv); dial.addEventListener('pointerup', up); mv(e); });
    dial.addEventListener('wheel', e => { e.preventDefault(); setZoom(cur + (e.deltaY < 0 ? 5 : -5), true); }, { passive: false });
    dial.addEventListener('keydown', e => { const d = { ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 25, PageDown: -25 }[e.key]; if (d) { e.preventDefault(); setZoom(cur + d); } else if (e.key === '0') setZoom(100); });

    /* ---- popover ---- */
    const P = el('div', 'pc'), quick = el('div', 'zk-quick'); [80, 100, 125, 150].forEach(z => { const b = btn('', z + '%'); b.addEventListener('click', () => setZoom(z)); quick.append(b); }); dialW.append(quick);
    const mb = el('div'), seg = el('div', 'pc-seg'); [['page', 'Whole page'], ['text', 'Text only']].forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => { S.mode = k; save(); apply(cur); drawDial(); renderPop(); toast(k === 'text' ? 'Only the text grows; the layout stays put' : 'The whole page scales'); }); seg.append(b); }); mb.append(label('Zoom'), seg);
    const lb = el('div'), list = el('div', 'zk-list'); lb.append(label('Remembered sites'), list);
    const db = el('div'), ds = el('div', 'pc-seg'); [90, 100, 110, 125].forEach(z => { const b = btn('', z + '%'); b.dataset.z = z; b.addEventListener('click', () => { S.def = z; save(); renderPop(); toast('New sites open at ' + z + '%'); }); ds.append(b); }); db.append(label('Default for new sites'), ds);
    P.append(dialW, mb, lb, db); pb.append(P);
    function renderPop() {
      seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.mode))); ds.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.z === S.def)));
      list.textContent = ''; M.sites.forEach((x, i) => { const r = el('div', 'zk-li' + (i === act ? ' on' : '')), ic = el('i'), sp = el('span'); ic.style.setProperty('--c', x.c); sp.append(document.createTextNode(x.h.split('/')[0])); if (i === act) sp.append(el('small', null, 'open now')); r.append(ic, sp, el('b', null, S.z[x.k] + '%')); list.append(r); });
      H.badge(Math.round(cur) === 100 ? '' : Math.round(cur) + '');
    }
    renderTabs(); paint(); drawDial(); renderPop();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
