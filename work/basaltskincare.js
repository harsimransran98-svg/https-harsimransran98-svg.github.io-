/* Basalt Skincare — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    const { el, G, reduced, toast } = H;
    const Q = [
      { k: 'skin', q: 'Your skin, most days?', o: ['Oily', 'Dry', 'Combination', 'Sensitive'] },
      { k: 'goal', q: 'What would you change first?', o: ['Dullness', 'Breakouts', 'Fine lines', 'Redness'] },
      { k: 'time', q: 'Time you actually have?', o: ['2 minutes', '5 minutes', '10 minutes'] }
    ];
    const A = { skin: 'Combination', goal: 'Dullness', time: '5 minutes' };
    const CLEAN = { Oily: ['Basalt Clay Wash', 'Kaolin + volcanic basalt powder'], Dry: ['Milk Mineral Cleanser', 'Oat lipids + magnesium'], Combination: ['Balance Gel Cleanser', 'Zinc PCA + basalt water'], Sensitive: ['Calm Cream Cleanser', 'Colloidal oat + allantoin'] };
    const SER = { Dullness: ['Lava Glow Serum', '10% vitamin C (ascorbyl glucoside) + iron oxide-free'], Breakouts: ['Clear Ridge Serum', '2% salicylic acid + sulfur'], 'Fine lines': ['Strata Renewal Serum', '0.3% retinal + bakuchiol'], Redness: ['Cool Stone Serum', '4% azelaic acid + centella'] };
    const MOI = { Oily: ['Featherweight Gel', 'Hyaluronic acid + niacinamide 4%'], Dry: ['Bedrock Barrier Cream', 'Ceramides + squalane'], Combination: ['Even Ground Lotion', 'Niacinamide 5% + glycerin'], Sensitive: ['Quiet Balm', 'Panthenol + madecassoside'] };
    const quiz = el('div', 'bs-quiz'), out = el('div', 'bs-out');
    Q.forEach((q, qi) => {
      const g = el('div', 'bs-q'); g.append(el('p', 'bs-n', `0${qi + 1}`), el('h3', null, q.q));
      const row = el('div', 'bs-opts'); row.setAttribute('role', 'radiogroup'); row.setAttribute('aria-label', q.q);
      q.o.forEach(o => { const b = el('button', 'bs-opt', o); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(A[q.k] === o)); b.addEventListener('click', () => { A[q.k] = o; row.querySelectorAll('.bs-opt').forEach(x => x.setAttribute('aria-checked', String(x === b))); render(true); }); row.append(b); });
      g.append(row); quiz.append(g);
    });
    function bottle(kind, [name, inci], step, tint) {
      const c = el('article', 'bs-card'), b = el('div', 'bs-bottle ' + kind); b.style.setProperty('--tint', tint); b.append(el('i'), el('span', null, 'BASALT'));
      c.append(el('p', 'bs-step', step), b, el('h4', null, name), el('p', 'bs-inci', inci)); return c;
    }
    function render(anim) {
      out.replaceChildren();
      const steps = A.time === '2 minutes' ? 2 : 3, mins = { '2 minutes': '90 seconds', '5 minutes': '3 minutes', '10 minutes': '4 minutes + a mask on Sundays' }[A.time];
      const head = el('div', 'bs-head'); head.append(el('h3', null, `Your ${steps}-step routine`), el('p', null, `For ${A.skin.toLowerCase()} skin, targeting ${A.goal.toLowerCase()} · about ${mins}`)); out.append(head);
      const grid = el('div', 'bs-grid');
      grid.append(bottle('tall', CLEAN[A.skin], 'Step 1 · cleanse', '#5B6B7F'), bottle('drop', SER[A.goal], 'Step 2 · treat', '#B08D57'));
      if (steps === 3) grid.append(bottle('jar', MOI[A.skin], 'Step 3 · protect', '#8A8F86'));
      out.append(grid);
      const go = el('button', 'btn pri bs-save', 'Save this routine'); go.type = 'button'; go.addEventListener('click', () => { H.store.set('basalt_routine', A); toast('Routine saved. Full INCI lists are on each product page.'); }); out.append(go);
      if (anim && G && !reduced) G.from(grid.children, { y: 40, opacity: 0, rotation: (i) => (i - 1) * 4, duration: .7, stagger: .08, ease: 'back.out(1.6)' });
    }
    root.append(quiz, out); render(false);
  }

  demo(document.getElementById('demo'), H);
})();
