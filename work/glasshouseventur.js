/* Glasshouse Ventures — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    const FLOORS = 12, UNITS = ['A', 'B', 'C', 'D'];
    const status = {}; let seed = 7; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    for (let f = 1; f <= FLOORS; f++) UNITS.forEach(u => { status[f + u] = r() < .7 ? 'sold' : r() < .5 ? 'hold' : 'open'; });
    let rot = -32, tilt = 58, floor = 6, drag = null;
    const wrap = el('div', 'gh-wrap'), scene = el('div', 'gh-scene'), tower = el('div', 'gh-tower');
    scene.setAttribute('aria-label', 'Rotatable 3D tower. Drag to turn, or use the floor list.'); scene.tabIndex = 0;
    const slabs = [];
    for (let f = 1; f <= FLOORS; f++) {
      const s = el('div', 'gh-floor'); s.style.setProperty('--z', (f - 1) * 22 + 'px'); s.dataset.f = f;
      UNITS.forEach(u => { const q = el('i', 'gh-unit ' + status[f + u]); s.append(q); });
      s.addEventListener('click', () => pick(f)); slabs.push(s); tower.append(s);
    }
    const roof = el('div', 'gh-floor gh-roof'); roof.style.setProperty('--z', FLOORS * 22 + 'px'); tower.append(roof);
    scene.append(tower);
    const side = el('div', 'gh-side'), list = el('div', 'gh-list'), info = el('div', 'gh-info');
    for (let f = FLOORS; f >= 1; f--) { const b = el('button', 'gh-fb'); b.type = 'button'; b.dataset.f = f; const open = UNITS.filter(u => status[f + u] === 'open').length; b.append(el('b', null, `L${String(f).padStart(2, '0')}`), el('span', null, open ? `${open} open` : 'sold out')); b.addEventListener('click', () => pick(f)); list.append(b); }
    side.append(info, list); wrap.append(scene, side); root.append(wrap);
    const apply = () => { tower.style.transform = `rotateX(${tilt}deg) rotateZ(${rot}deg)`; };
    function pick(f) {
      floor = f;
      slabs.forEach(s => { const n = +s.dataset.f; s.classList.toggle('sel', n === f); s.classList.toggle('above', n > f); });
      list.querySelectorAll('.gh-fb').forEach(b => b.setAttribute('aria-current', String(+b.dataset.f === f)));
      info.replaceChildren(el('h3', null, `Level ${f}`), el('p', null, `${f > 9 ? 'Penthouse' : f > 5 ? 'Upper' : 'Garden'} floor · ${(64 + f * 2)} m² to ${(118 + f * 3)} m² · ${f > 8 ? 'river and city views' : 'courtyard views'}`));
      const units = el('div', 'gh-units');
      UNITS.forEach(u => { const st = status[f + u], b = el('button', 'gh-ub ' + st); b.type = 'button'; b.disabled = st === 'sold'; b.append(el('b', null, `${f}${u}`), el('span', null, st === 'open' ? `$${(520 + f * 18 + UNITS.indexOf(u) * 40).toLocaleString()}k` : st === 'hold' ? 'on hold' : 'sold')); b.addEventListener('click', () => { status[f + u] = 'hold'; toast(`Unit ${f}${u} held for 48 hours. A sales lead will call you.`); pick(f); slabs[f - 1].children[UNITS.indexOf(u)].className = 'gh-unit hold'; }); units.append(b); });
      info.append(units);
      if (G && !reduced) G.fromTo(info, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .4 });
    }
    scene.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY, rot, tilt]; try { scene.setPointerCapture(e.pointerId); } catch (_) {} });
    scene.addEventListener('pointermove', e => { if (!drag) return; rot = drag[2] + (e.clientX - drag[0]) * .5; tilt = Math.max(35, Math.min(75, drag[3] - (e.clientY - drag[1]) * .3)); apply(); });
    scene.addEventListener('pointerup', () => { drag = null; });
    scene.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { rot -= 10; apply(); } if (e.key === 'ArrowRight') { rot += 10; apply(); } if (e.key === 'ArrowUp') pick(Math.min(FLOORS, floor + 1)); if (e.key === 'ArrowDown') pick(Math.max(1, floor - 1)); });
    apply(); pick(floor);
    if (G && !reduced) G.from(slabs, { opacity: 0, duration: .6, stagger: .05, ease: 'power3.out', clearProps: 'opacity', scrollTrigger: window.ScrollTrigger ? { trigger: scene, start: 'top 80%' } : undefined });
  }

  demo(document.getElementById('demo'), H);
})();
