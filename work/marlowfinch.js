/* Marlow & Finch — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    G.from('.hero .kick, .hero .lead, .hero .acts', { y: 24, opacity: 0, duration: .9, stagger: .1, ease: 'expo.out', delay: .45 });
    G.from('#heroImg', { scale: 1.18, duration: 2.2, ease: 'expo.out' });
    const mm = G.matchMedia();
    mm.add('(min-width: 861px)', () => { if (window.ScrollTrigger) G.to('#heroImg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } }); });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };

/* ---------- live demo ---------- */
  function demo(root, H) {
    const { el, G, reduced, toast, store } = H;
    const STAFF = [
      { n: 'Ines', role: 'Fiction buyer', books: [['The Salt Path Home', 'R. Calder', '#2F5D50', 'Read it on a train and missed my stop. Twice.'], ['Small Hours', 'M. Okoye', '#8C2F39', 'A whole marriage in one sleepless night.'], ['Glass Orchard', 'L. Varga', '#C9A227', 'The kind of ending you think about for a week.'], ['North of Quiet', 'T. Brandt', '#3D5A80', 'Short, cold, perfect.']] },
      { n: 'Sam', role: 'History & ideas', books: [['The Map Makers', 'J. Haldane', '#6B4226', 'How six people drew the modern world.'], ['Ledger', 'P. Imani', '#264653', 'Money explained by the people who lost it.'], ['Common Ground', 'A. Ruiz', '#E76F51', 'Hopeful without being naive.']] },
      { n: 'Priya', role: 'Kids & teens', books: [['Moth & Lantern', 'E. Fenn', '#9D4EDD', 'My niece has read it four times.'], ['The Tin Fox', 'K. Marsh', '#F4A261', 'Read aloud with all the voices.'], ['Ninth Floor', 'D. Abara', '#2A9D8F', 'A thriller for twelve-year-olds that adults steal.'], ['Little Weather', 'S. Kim', '#90BE6D', 'For anxious kids and their grown-ups.'], ['Brave Small Things', 'O. Reyes', '#E63946', 'Picture book. Bring tissues.']] }
    ];
    let who = 0; const saved = new Set(store.get('mf_list', []));
    const wrap = el('div', 'mf-wrap'), tabs = el('div', 'mf-tabs'), shelf = el('div', 'mf-shelf'), note = el('div', 'mf-note'), list = el('div', 'mf-list');
    STAFF.forEach((s, i) => { const b = el('button', 'mf-tab'); b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0)); const av = el('span', 'mf-av', s.n[0]); b.append(av, el('b', null, s.n), el('small', null, s.role)); b.addEventListener('click', () => { who = i; tabs.querySelectorAll('.mf-tab').forEach(x => x.setAttribute('aria-pressed', String(x === b))); render(true); }); tabs.append(b); });
    const left = el('div'); left.append(shelf, el('div', 'mf-plank'));
    const right = el('div', 'mf-right'); right.append(note, list);
    wrap.append(tabs, left, right); root.append(wrap);
    function renderList() { list.replaceChildren(el('p', 'mf-l', `Your list · ${saved.size}`)); [...saved].forEach(t => { const r = el('div', 'mf-li', t); list.append(r); }); if (!saved.size) list.append(el('p', 'mf-empty', 'Nothing yet. Tap a spine, then save it.')); }
    function open(bk) {
      const [t, a, c, q] = bk; note.replaceChildren();
      const cover = el('div', 'mf-cover'); cover.style.background = c; cover.append(el('b', null, t), el('span', null, a));
      const txt = el('div'); const s = STAFF[who]; txt.append(el('p', 'mf-l', `${s.n} says`), el('blockquote', null, `“${q}”`));
      const b = el('button', 'btn pri', saved.has(t) ? 'On your list ✓' : 'Save to my list'); b.type = 'button';
      b.addEventListener('click', () => { if (saved.has(t)) saved.delete(t); else saved.add(t); store.set('mf_list', [...saved]); b.textContent = saved.has(t) ? 'On your list ✓' : 'Save to my list'; renderList(); if (saved.has(t)) toast(`Saved. We’ll hold a copy of ${t} at the counter for 3 days.`); });
      txt.append(b); note.append(cover, txt);
      if (G && !reduced) G.fromTo(cover, { rotationY: -70, transformPerspective: 600, transformOrigin: '0 50%' }, { rotationY: 0, duration: .8, ease: 'expo.out' });
    }
    function render(anim) {
      shelf.replaceChildren(); const s = STAFF[who];
      s.books.forEach((bk, i) => { const sp = el('button', 'mf-spine'); sp.type = 'button'; sp.style.background = bk[2]; sp.style.height = (180 + (i * 37) % 60) + 'px'; sp.append(el('span', null, bk[0])); sp.setAttribute('aria-label', `${bk[0]} by ${bk[1]}`); sp.addEventListener('click', () => { shelf.querySelectorAll('.mf-spine').forEach(x => x.classList.remove('out')); sp.classList.add('out'); open(bk); }); shelf.append(sp); });
      if (anim && G && !reduced) G.from(shelf.children, { y: -60, opacity: 0, rotation: () => (Math.random() - .5) * 20, duration: .6, stagger: .06, ease: 'bounce.out' });
      shelf.firstChild.classList.add('out'); open(s.books[0]);
    }
    render(false); renderList();
  }

  demo(document.getElementById('demo'), H);
})();
