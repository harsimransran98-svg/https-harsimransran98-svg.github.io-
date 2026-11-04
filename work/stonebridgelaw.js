/* Stonebridge Law — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
      { k: 'area', q: 'What is it about?', o: [['family', 'Family or divorce'], ['work', 'Work or employment'], ['property', 'Buying or renting property'], ['business', 'Starting a business'], ['will', 'A will or estate']] },
      { k: 'stage', q: 'Where are you now?', o: [['early', 'Just exploring'], ['letter', 'I received a letter'], ['deadline', 'There’s a deadline']] },
      { k: 'other', q: 'Is anyone else involved?', o: [['none', 'Only me'], ['one', 'One other person or company'], ['many', 'Several parties']] }
    ];
    const FEES = { family: [1400, 'Divorce agreement or custody plan', 'Eleanor Hart'], work: [950, 'Contract review and next-step letter', 'Marcus Webb'], property: [1100, 'Purchase review through to completion', 'Ana Ruiz'], business: [850, 'Company setup and founder agreement', 'Marcus Webb'], will: [650, 'Will, power of attorney, health directive', 'Eleanor Hart'] };
    const A = {}; let step = 0;
    const wrap = el('div', 'sb-wrap'), qbox = el('div', 'sb-q'), out = el('div', 'sb-out'), prog = el('div', 'sb-prog');
    wrap.append(prog, qbox, out); root.append(wrap);
    function renderQ() {
      prog.replaceChildren(); Q.forEach((_, i) => prog.append(el('i', i < step ? 'done' : i === step ? 'cur' : '')));
      qbox.replaceChildren();
      if (step >= Q.length) { result(); return; }
      const q = Q[step]; qbox.append(el('p', 'sb-n', `Question ${step + 1} of ${Q.length}`), el('h3', null, q.q));
      const opts = el('div', 'sb-opts'); opts.setAttribute('role', 'radiogroup'); opts.setAttribute('aria-label', q.q);
      q.o.forEach(([v, t]) => { const b = el('button', 'sb-o', t); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(A[q.k] === v)); b.addEventListener('click', () => { if (Q[step] !== q) return; A[q.k] = v; step++; renderQ(); }); opts.append(b); });
      qbox.append(opts);
      if (step) { const back = el('button', 'sb-back', '← Back'); back.type = 'button'; back.addEventListener('click', () => { step--; renderQ(); }); qbox.append(back); }
      if (G && !reduced) G.fromTo(qbox, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: .4, ease: 'power3.out' });
      const f = qbox.querySelector('.sb-o'); if (f && step) f.focus();
    }
    function result() {
      if (!A.area || !A.stage || !A.other) { step = 0; renderQ(); return; }
      const [base, scope, who] = FEES[A.area], mult = { none: 1, one: 1.25, many: 1.6 }[A.other], fee = Math.round(base * mult / 50) * 50;
      const weeks = { early: '3–4 weeks', letter: '2–3 weeks', deadline: 'prioritised: under 10 days' }[A.stage];
      const d = new Date(); d.setDate(d.getDate() + (A.stage === 'deadline' ? 1 : 3)); while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
      out.replaceChildren();
      const fig = el('div', 'sb-fee'); fig.append(el('p', 'sb-n', 'Fixed fee'), el('b', null, `$${fee.toLocaleString()}`), el('span', null, 'Agreed in writing before any work starts.'));
      const dl = el('dl', 'sb-dl'); [['Scope', scope], ['Timeline', weeks], ['Your lawyer', who], ['First consultation', `$150 · ${d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}, 10:00`]].forEach(([k, v]) => { const r = el('div'); r.append(el('dt', null, k), el('dd', null, v)); dl.append(r); });
      const book = el('button', 'btn pri', 'Book that consultation'); book.type = 'button'; book.addEventListener('click', () => toast(`Requested. ${who} will confirm by email within one working day.`));
      const again = el('button', 'sb-back', 'Start over'); again.type = 'button'; again.addEventListener('click', () => { step = 0; Object.keys(A).forEach(k => delete A[k]); out.replaceChildren(); renderQ(); });
      out.append(fig, dl, book, again);
      if (G && !reduced) G.from(out.children, { y: 16, opacity: 0, duration: .5, stagger: .07, ease: 'power3.out' });
    }
    renderQ();
  }

  demo(document.getElementById('demo'), H);
})();
