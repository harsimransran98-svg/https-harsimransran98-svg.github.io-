/* Blackletter Press — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    const { el, G, reduced, toast, audio } = H;
    const FACES = [['Fraktur', "'UnifrakturMaguntia', serif"], ['Garamond', "'EB Garamond', serif"], ['Garamond Italic', "italic 400 1em 'EB Garamond', serif"]];
    let face = 0, inkC = '#1A1612', runNo = 1 + Math.floor(Math.random() * 40);
    const ctrl = el('div', 'bp-ctrl'), inp = el('input', 'bp-in'); inp.maxLength = 28; inp.value = 'Type set with intent'; inp.setAttribute('aria-label', 'Your line of type'); inp.spellcheck = false;
    const faces = el('div', 'bp-chips'); FACES.forEach(([n], i) => { const b = el('button', 'bp-chip', n); b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0)); b.addEventListener('click', () => { face = i; faces.querySelectorAll('.bp-chip').forEach(x => x.setAttribute('aria-pressed', String(x === b))); compose(); }); faces.append(b); });
    const inks = el('div', 'bp-chips'); [['Black', '#1A1612'], ['Vermilion', '#A4161A'], ['Indigo', '#1F3A5F']].forEach(([n, c], i) => { const b = el('button', 'bp-ink'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', n + ' ink'); b.setAttribute('aria-pressed', String(i === 0)); b.addEventListener('click', () => { inkC = c; inks.querySelectorAll('.bp-ink').forEach(x => x.setAttribute('aria-pressed', String(x === b))); }); inks.append(b); });
    const pull = el('button', 'btn pri bp-pull', 'Pull the lever'); pull.type = 'button';
    ctrl.append(el('label', 'bp-l', 'Your line'), inp, el('label', 'bp-l', 'Typeface'), faces, el('label', 'bp-l', 'Ink'), inks, pull);
    const press = el('div', 'bp-press'), bed = el('div', 'bp-bed'), sheet = el('div', 'bp-sheet'), platen = el('div', 'bp-platen');
    const printed = el('div', 'bp-print'), colo = el('p', 'bp-colo');
    sheet.append(printed, colo); press.append(platen, bed, sheet);
    root.append(ctrl, press);
    function compose() {
      bed.replaceChildren();
      [...(inp.value || ' ')].forEach(ch => { const s = el('span', 'bp-sort', ch === ' ' ? ' ' : ch); s.style.font = FACES[face][1].includes('italic') ? FACES[face][1].replace('1em', '30px') : `30px ${FACES[face][1]}`; bed.append(s); });
    }
    inp.addEventListener('input', compose);
    pull.addEventListener('click', () => {
      printed.replaceChildren(); printed.style.color = inkC;
      const f = FACES[face][1];
      [...(inp.value || ' ')].forEach(ch => { const s = el('span', null, ch === ' ' ? ' ' : ch); s.style.font = f.includes('italic') ? f.replace('1em', 'clamp(26px,4vw,46px)') : `clamp(26px,4vw,46px) ${f}`; s.style.opacity = 0; printed.append(s); });
      colo.textContent = `No. ${String(runNo++).padStart(3, '0')} of 250 · hand-pulled`;
      const thunk = () => { const a = audio(); if (!a) return; const o = a.createOscillator(), g = a.createGain(); o.type = 'square'; o.frequency.setValueAtTime(90, a.currentTime); o.frequency.exponentialRampToValueAtTime(40, a.currentTime + .15); g.gain.setValueAtTime(.12, a.currentTime); g.gain.exponentialRampToValueAtTime(.001, a.currentTime + .2); o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + .22); };
      if (G && !reduced) {
        const tl = G.timeline();
        tl.to(platen, { y: 70, duration: .35, ease: 'power3.in', onComplete: thunk }).to(platen, { y: 0, duration: .5, ease: 'power2.out' })
          .to(printed.children, { opacity: () => .82 + Math.random() * .18, duration: .05, stagger: .03 }, '-=.6')
          .fromTo(sheet, { rotation: -1.5 }, { rotation: .8, duration: .6, ease: 'elastic.out(1,.4)' }, '-=.3');
      } else { [...printed.children].forEach(s => { s.style.opacity = 1; }); thunk(); }
      toast('Printed. Every sheet in a real run is numbered by hand.');
    });
    compose();
  }

  demo(document.getElementById('demo'), H);
})();
