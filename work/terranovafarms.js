/* Terra Nova Farms — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    const { el, svgEl, G, reduced, toast } = H;
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const SEASON = m => m < 2 || m === 11 ? 'winter' : m < 5 ? 'spring' : m < 8 ? 'summer' : 'autumn';
    const LOOK = { winter: { sky: '#C9D6DF', field: '#8D8B6E', crop: '#6B705C', h: 4, note: 'Cover crops of rye and clover hold the soil. The cattle graze the stubble.', box: ['Stored squash', 'Leeks', 'Kale', 'Bone broth'] }, spring: { sky: '#BDE0FE', field: '#7FA35B', crop: '#A7C957', h: 16, note: 'No-till drilling straight into last year’s roots. Lambs out on the top field.', box: ['Asparagus', 'Radishes', 'Pea shoots', 'Spring lamb'] }, summer: { sky: '#FFE8A3', field: '#9BB35A', crop: '#E9C46A', h: 34, note: 'Wheat high, hedgerows full, and the soil stays covered all summer.', box: ['Tomatoes', 'Courgettes', 'New potatoes', 'Strawberries'] }, autumn: { sky: '#F6C59A', field: '#B5885A', crop: '#C0703A', h: 22, note: 'Harvest, then compost goes straight back on. Soil carbon is tested every October.', box: ['Apples', 'Pumpkins', 'Beetroot', 'Stone-ground flour'] } };
    let month = new Date().getMonth(), ang = month / 12 * 360;
    const wrap = el('div', 'tn-wrap'), dial = el('div', 'tn-dial'), wheel = svgEl('svg', { viewBox: '0 0 300 300', class: 'tn-wheel', role: 'slider', tabindex: 0, 'aria-label': 'Month of the year', 'aria-valuemin': 1, 'aria-valuemax': 12 });
    const segC = { winter: '#9FB3C8', spring: '#A7C957', summer: '#E9C46A', autumn: '#C0703A' };
    for (let i = 0; i < 12; i++) { const a0 = (i / 12 - .25) * Math.PI * 2, a1 = ((i + 1) / 12 - .25) * Math.PI * 2, r0 = 92, r1 = 140; const p = svgEl('path', { d: `M${150 + Math.cos(a0) * r1} ${150 + Math.sin(a0) * r1} A${r1} ${r1} 0 0 1 ${150 + Math.cos(a1) * r1} ${150 + Math.sin(a1) * r1} L${150 + Math.cos(a1) * r0} ${150 + Math.sin(a1) * r0} A${r0} ${r0} 0 0 0 ${150 + Math.cos(a0) * r0} ${150 + Math.sin(a0) * r0}Z`, fill: segC[SEASON(i)], opacity: .85, stroke: '#F1EBDD', 'stroke-width': 2 }); wheel.append(p); const am = (i + .5) / 12 * Math.PI * 2 - Math.PI / 2, t = svgEl('text', { x: 150 + Math.cos(am) * 116, y: 150 + Math.sin(am) * 116 + 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#2F3B1F' }); t.textContent = MONTHS[i]; wheel.append(t); }
    const hand = svgEl('g'); hand.append(svgEl('line', { x1: 150, y1: 150, x2: 150, y2: 40, stroke: '#2F3B1F', 'stroke-width': 4, 'stroke-linecap': 'round' }), svgEl('circle', { cx: 150, cy: 40, r: 9, fill: '#2F3B1F' }), svgEl('circle', { cx: 150, cy: 150, r: 46, fill: '#F1EBDD' })); wheel.append(hand);
    const mid = svgEl('text', { x: 150, y: 156, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: '#2F3B1F' }); wheel.append(mid);
    dial.append(wheel);
    const field = svgEl('svg', { viewBox: '0 0 600 300', class: 'tn-field', 'aria-hidden': 'true' }), sky = svgEl('rect', { width: 600, height: 300 }), sunM = svgEl('circle', { r: 26, fill: '#FFF3B0' }), hill = svgEl('path', { d: 'M0 170 Q 150 120 300 160 T 600 150 V300 H0Z' }), rows = svgEl('g');
    field.append(sky, sunM, hill, rows);
    const side = el('div', 'tn-side'), box = el('div', 'tn-box');
    side.append(field, box); wrap.append(dial, side); root.append(wrap);
    function render(animate) {
      const s = SEASON(month), L = LOOK[s]; hand.setAttribute('transform', `rotate(${ang} 150 150)`); mid.textContent = MONTHS[month]; wheel.setAttribute('aria-valuenow', month + 1); wheel.setAttribute('aria-valuetext', MONTHS[month]);
      sky.setAttribute('fill', L.sky); hill.setAttribute('fill', L.field); const sy = { winter: 110, spring: 70, summer: 50, autumn: 90 }[s]; sunM.setAttribute('cx', 120 + month * 30); sunM.setAttribute('cy', sy);
      rows.replaceChildren(); for (let r = 0; r < 7; r++) for (let c = 0; c < 22; c++) { const x = c * 28 + (r % 2) * 14, y = 190 + r * 16, h = L.h * (0.6 + r * .08); rows.append(svgEl('rect', { x, y: y - h, width: 6, height: h, rx: 3, fill: L.crop, opacity: .65 + r * .05 })); }
      box.replaceChildren(); const hd = el('div', 'tn-hd'); hd.append(el('p', 'tn-l', `${s[0].toUpperCase() + s.slice(1)} on the farm`), el('p', null, L.note));
      const items = el('ul', 'tn-items'); L.box.forEach(b => items.append(el('li', null, b)));
      const shop = el('button', 'btn pri', `Order the ${MONTHS[month]} box · $48`); shop.type = 'button'; shop.addEventListener('click', () => toast(`${MONTHS[month]} harvest box reserved. Ships fresh, twice weekly.`));
      box.append(hd, el('p', 'tn-l', 'In this week’s box'), items, shop);
      if (animate && G && !reduced) { G.from(rows.children, { scaleY: 0, transformOrigin: '50% 100%', duration: .5, stagger: { each: .003, from: 'random' }, ease: 'back.out(2)' }); G.from(items.children, { x: -12, opacity: 0, duration: .35, stagger: .05 }); }
    }
    let drag = false, last = month;
    const setFrom = e => { const r = wheel.getBoundingClientRect(), a = Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180 / Math.PI + 90; ang = (a + 360) % 360; month = Math.floor(ang / 30) % 12; hand.setAttribute('transform', `rotate(${ang} 150 150)`); if (month !== last) { last = month; render(true); } };
    wheel.addEventListener('pointerdown', e => { drag = true; try { wheel.setPointerCapture(e.pointerId); } catch (_) {} setFrom(e); });
    wheel.addEventListener('pointermove', e => { if (drag) setFrom(e); });
    wheel.addEventListener('pointerup', () => { drag = false; ang = month * 30 + 15; render(false); });
    wheel.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowUp') month = (month + 1) % 12; else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') month = (month + 11) % 12; else return; e.preventDefault(); ang = month * 30 + 15; last = month; render(true); });
    ang = month * 30 + 15; render(false);
  }

  demo(document.getElementById('demo'), H);
})();
