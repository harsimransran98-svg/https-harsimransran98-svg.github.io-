/* Cast Iron Coffee — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    const { el, svgEl, G, reduced } = H;
    const CAFES = [
      { n: 'Foundry Lane', x: 120, y: 120, roast: 'Ethiopia Guji · washed', wait: 4, seats: 22, wifi: 1, outlets: 1, late: 0 },
      { n: 'Ironworks Yard', x: 330, y: 90, roast: 'Colombia Huila · honey', wait: 9, seats: 40, wifi: 1, outlets: 1, late: 1 },
      { n: 'Canal Street', x: 470, y: 210, roast: 'Kenya Nyeri · washed', wait: 2, seats: 12, wifi: 0, outlets: 0, late: 0 },
      { n: 'Old Mill', x: 210, y: 300, roast: 'House espresso · Brazil + Guji', wait: 6, seats: 30, wifi: 1, outlets: 0, late: 1 },
      { n: 'Station Kiosk', x: 380, y: 340, roast: 'Decaf Peru · sugarcane', wait: 1, seats: 4, wifi: 0, outlets: 0, late: 1 },
      { n: 'Riverside', x: 560, y: 360, roast: 'Rwanda Huye · natural', wait: 5, seats: 26, wifi: 1, outlets: 1, late: 0 }
    ];
    const F = { wifi: false, outlets: false, late: false };
    const wrap = el('div', 'ci-wrap'), map = svgEl('svg', { viewBox: '0 0 640 440', class: 'ci-map', role: 'img', 'aria-label': 'Map of six Cast Iron Coffee locations' });
    // streets, river and park
    map.append(svgEl('rect', { width: 640, height: 440, fill: '#241C16' }));
    map.append(svgEl('path', { d: 'M-10 250 C 120 200, 220 330, 360 280 S 560 230, 660 300', fill: 'none', stroke: '#2F4A55', 'stroke-width': 34, 'stroke-linecap': 'round' }));
    map.append(svgEl('rect', { x: 40, y: 360, width: 120, height: 60, rx: 14, fill: '#2C3A26' }));
    [[0, 60, 640, 60], [0, 180, 640, 170], [0, 400, 640, 390], [90, 0, 110, 440], [280, 0, 300, 440], [440, 0, 420, 440], [600, 0, 590, 440]].forEach(([a, b, c, d]) => map.append(svgEl('line', { x1: a, y1: b, x2: c, y2: d, stroke: '#3A2F27', 'stroke-width': 10 })));
    const you = svgEl('g', { transform: 'translate(300 220)' }); you.append(svgEl('circle', { r: 26, fill: 'rgba(143,185,150,.18)' }), svgEl('circle', { r: 8, fill: '#8FB996', stroke: '#F2E9DC', 'stroke-width': 3 })); map.append(you);
    const pins = CAFES.map((c, i) => {
      const g = svgEl('g', { class: 'ci-pin', transform: `translate(${c.x} ${c.y})`, tabindex: 0, role: 'button', 'aria-label': `${c.n}, ${c.wait} minute wait` });
      const p = svgEl('path', { d: 'M0 0 C -14 -18, -18 -26, -18 -34 A 18 18 0 1 1 18 -34 C 18 -26, 14 -18, 0 0 Z', fill: '#D97736' });
      const t = svgEl('text', { y: -29, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#1C1612' }); t.textContent = c.wait + 'm';
      g.append(p, t); g.addEventListener('click', () => pick(i)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } });
      map.append(g); return g;
    });
    const side = el('div', 'ci-side'), filters = el('div', 'ci-f'), card = el('div', 'ci-card'), list = el('div', 'ci-list');
    [['wifi', 'Wi-Fi'], ['outlets', 'Outlets'], ['late', 'Open late']].forEach(([k, l]) => { const b = el('button', 'ci-chip', l); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', () => { F[k] = !F[k]; b.setAttribute('aria-pressed', String(F[k])); apply(); }); filters.append(b); });
    side.append(filters, card, list); wrap.append(map, side); root.append(wrap);
    const dist = c => Math.round(Math.hypot(c.x - 300, c.y - 220) * 2.4);
    let sel = 0;
    function apply() {
      const ok = CAFES.map(c => (!F.wifi || c.wifi) && (!F.outlets || c.outlets) && (!F.late || c.late));
      pins.forEach((p, i) => { p.classList.toggle('off', !ok[i]); });
      list.replaceChildren(); CAFES.map((c, i) => [c, i]).filter(([, i]) => ok[i]).sort((a, b) => dist(a[0]) - dist(b[0])).forEach(([c, i]) => { const r = el('button', 'ci-row'); r.type = 'button'; r.append(el('b', null, c.n), el('span', null, `${dist(c)} m · ${c.wait} min wait`)); r.addEventListener('click', () => pick(i)); list.append(r); });
      if (!ok[sel]) { const f = ok.indexOf(true); if (f >= 0) pick(f, true); else card.replaceChildren(el('p', null, 'No café has all of that. Try fewer filters.')); }
    }
    function pick(i, quiet) {
      sel = i; const c = CAFES[i]; pins.forEach((p, j) => p.classList.toggle('sel', j === i));
      card.replaceChildren(); const h = el('h3', null, c.n), r = el('p', 'ci-roast'); r.append(el('small', null, 'Today’s roast'), document.createTextNode(c.roast));
      const facts = el('ul', 'ci-facts'); [[`${c.wait} min`, 'queue right now'], [`${c.seats}`, 'seats'], [c.wifi ? 'Yes' : 'No', 'Wi-Fi'], [c.late ? 'Until 10pm' : 'Until 6pm', 'hours']].forEach(([v, l]) => { const li = el('li'); li.append(el('b', null, v), el('span', null, l)); facts.append(li); });
      card.append(h, r, facts);
      if (!quiet && G && !reduced) { G.fromTo(card, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'power3.out' }); G.fromTo(pins[i], { scale: 1.5 }, { scale: 1, duration: .7, ease: 'elastic.out(1,.4)', transformOrigin: '50% 100%' }); }
    }
    // the queue is "live": nudge the numbers every few seconds
    setInterval(() => { CAFES.forEach((c, i) => { c.wait = Math.max(1, Math.min(14, c.wait + Math.round((Math.random() - .5) * 2))); pins[i].querySelector('text').textContent = c.wait + 'm'; }); apply(); pick(sel, true); }, 4000);
    apply(); pick(0, true);
  }

  demo(document.getElementById('demo'), H);
})();
