/* ClipQueue — Chrome extension page with a live browser simulator (Bazozo Studio).
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
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    let queue = [], pins = store.get('cq_pins', ['Thanks! — Priya, Northwind Support']);
    // the simulated page: a changelog with copyable snippets
    const art = el('article', 'cq-art');
    const snip = (tag, cls, text, kind) => { const n = el(tag, 'cq-s ' + (cls || ''), text); n.dataset.kind = kind; n.tabIndex = 0; n.setAttribute('role', 'button'); n.setAttribute('aria-label', `Copy ${kind}: ${text.slice(0, 40)}`); return n; };
    art.append(el('p', 'cq-k', 'Changelog · v4.2'), el('h1', null, 'Webhooks get retries, and keys get scopes'));
    const p1 = el('p'); p1.append(document.createTextNode('Failed webhook deliveries now retry with exponential backoff. Reach the team at '), snip('span', 'inl', 'api-support@northwind.dev', 'email'), document.createTextNode(' if a delivery looks stuck.')); art.append(p1);
    art.append(el('h2', null, 'Create a scoped key'), snip('pre', 'code', 'curl -X POST https://api.northwind.dev/v4/keys \\\n  -H "Authorization: Bearer $NW_TOKEN" \\\n  -d scope=orders:read', 'code'));
    const p2 = el('p'); p2.append(document.createTextNode('Your sandbox base URL is '), snip('span', 'inl', 'https://sandbox.northwind.dev/v4', 'url'), document.createTextNode(' and the test webhook secret is '), snip('span', 'inl', 'whsec_test_5f2a91c8', 'secret'), document.createTextNode('.')); art.append(p2);
    art.append(snip('blockquote', 'quote', 'Retries back off 1, 4, 16 and 64 minutes, then the event is parked for manual replay.', 'quote'));
    art.append(el('h2', null, 'Reply to the thread'));
    const box = el('textarea', 'cq-box'); box.rows = 5; box.placeholder = 'Paste here with a ClipQueue slot or Ctrl+Shift+1…9'; box.setAttribute('aria-label', 'Reply box'); art.append(box);
    page.append(art);
    page.addEventListener('click', e => { const s = e.target.closest('.cq-s'); if (s) copy(s); });
    page.addEventListener('keydown', e => { const s = e.target.closest('.cq-s'); if (s && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); copy(s); } });
    function copy(s) {
      const t = s.textContent; queue = [{ t, kind: s.dataset.kind, at: Date.now() }, ...queue.filter(q => q.t !== t)].slice(0, 9);
      s.classList.add('got'); setTimeout(() => s.classList.remove('got'), 700);
      try { navigator.clipboard.writeText(t).catch(() => {}); } catch (_) {}
      H.flyToIcon(s); H.badge(queue.length); render(true);
    }
    function paste(t) { const a = box.selectionStart ?? box.value.length, b = box.selectionEnd ?? a; box.setRangeText(t + (t.endsWith('\n') ? '' : ' '), a, b, 'end'); box.focus(); if (G && !reduced) G.fromTo(box, { boxShadow: '0 0 0 3px #00E0B8' }, { boxShadow: '0 0 0 0px #00E0B8', duration: .8 }); }
    const age = ms => { const s = Math.round((Date.now() - ms) / 1000); return s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`; };
    function render(anim) {
      pb.replaceChildren();
      const pinBox = el('div', 'cq-pins'); pinBox.append(el('p', 'cq-l', `Pinned · ${pins.length}`));
      pins.forEach((t, i) => { const r = el('div', 'cq-pin'); const b = el('button', 'cq-paste', t); b.type = 'button'; b.addEventListener('click', () => { paste(t); toast('Pinned clip pasted.'); }); const x = el('button', 'cq-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Unpin'); x.addEventListener('click', () => { pins.splice(i, 1); store.set('cq_pins', pins); render(); }); r.append(el('span', null, '★'), b, x); pinBox.append(r); });
      pb.append(pinBox, el('p', 'cq-l', `Queue · ${queue.length}/9`));
      if (!queue.length) pb.append(el('p', 'cq-empty', 'Click a highlighted snippet on the page to start your queue.'));
      const list = el('ol', 'cq-list');
      queue.forEach((q, i) => { const li = el('li', 'cq-item'); const n = el('kbd', null, `⌃⇧${i + 1}`); const body = el('button', 'cq-body'); body.type = 'button'; body.append(el('span', 'cq-t', q.t), el('small', null, `${q.kind} · ${age(q.at)}`)); body.addEventListener('click', () => { paste(q.t); toast(`Slot ${i + 1} pasted.`); }); const pin = el('button', 'cq-star', '☆'); pin.type = 'button'; pin.setAttribute('aria-label', 'Pin this clip'); pin.addEventListener('click', () => { if (!pins.includes(q.t)) { pins.push(q.t); store.set('cq_pins', pins); toast('Pinned. It stays even after the queue rolls over.'); render(); } }); li.append(n, body, pin); list.append(li); });
      pb.append(list);
      if (queue.length) { const clr = el('button', 'cq-clear', 'Clear queue'); clr.type = 'button'; clr.addEventListener('click', () => { queue = []; H.badge(0); render(); }); pb.append(clr); }
      if (anim && G && !reduced && list.firstChild) G.from(list.firstChild, { x: 30, opacity: 0, backgroundColor: 'rgba(0,224,184,.3)', duration: .5, ease: 'back.out(2)' });
    }
    document.addEventListener('keydown', e => { if (e.ctrlKey && e.shiftKey && /^Digit[1-9]$/.test(e.code)) { const i = +e.code.slice(5) - 1; if (queue[i]) { e.preventDefault(); paste(queue[i].t); toast(`Ctrl+Shift+${i + 1} pasted slot ${i + 1}.`); } } });
    H.pop.onToggle(o => { if (o) render(); });
    render(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
