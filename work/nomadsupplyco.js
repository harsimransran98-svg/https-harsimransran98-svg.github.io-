/* Nomad Supply Co — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    const { el, svgEl, G, reduced } = H;
    const W = 900, Hh = 300, N = 120;
    const ele = []; let s = 3; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < N; i++) { const t = i / (N - 1); ele.push(1200 + Math.sin(t * Math.PI) * 1500 + Math.sin(t * 11) * 140 + Math.sin(t * 27) * 50 + (r() - .5) * 40); }
    const WP = [
      { at: .08, n: 'Trailhead · 1,240 m', gear: 'Ridge 38L pack', note: 'Loaded to 11 kg. Hip belt held its shape for all 4 days.' },
      { at: .3, n: 'River ford · 1,630 m', gear: 'Ford trail shoes', note: 'Drained in under a minute. Dry socks by the next switchback.' },
      { at: .52, n: 'High camp · 2,710 m', gear: 'Sela 2P tent', note: 'Held through 60 km/h gusts. One guy-line clip cracked; redesigned.' },
      { at: .7, n: 'Scree pass · 2,540 m', gear: 'Talus gaiters', note: 'Honest note: the strap wore through at 140 km. Fixed in v2.' },
      { at: .92, n: 'Lake finish · 1,380 m', gear: 'Ember down jacket', note: 'Packed to the size of a mango. Still lofted after a wet night.' }
    ];
    const min = Math.min(...ele), max = Math.max(...ele), X = i => i / (N - 1) * W, Y = v => Hh - 30 - (v - min) / (max - min) * (Hh - 70);
    const wrap = el('div', 'ns-wrap'), sv = svgEl('svg', { viewBox: `0 0 ${W} ${Hh}`, class: 'ns-svg', role: 'slider', tabindex: 0, 'aria-label': 'Trail position', 'aria-valuemin': 0, 'aria-valuemax': 100 });
    const grad = svgEl('linearGradient', { id: 'nsg', x1: 0, y1: 0, x2: 0, y2: 1 }); grad.append(svgEl('stop', { offset: 0, 'stop-color': '#E9A23B', 'stop-opacity': .45 }), svgEl('stop', { offset: 1, 'stop-color': '#E9A23B', 'stop-opacity': 0 })); const defs = svgEl('defs'); defs.append(grad); sv.append(defs);
    for (let k = 0; k < 4; k++) { const y = 30 + k * 60; sv.append(svgEl('line', { x1: 0, x2: W, y1: y, y2: y, stroke: 'rgba(237,232,218,.08)' })); }
    const d = ele.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
    sv.append(svgEl('path', { d: `${d} L${W} ${Hh} L0 ${Hh}Z`, fill: 'url(#nsg)' }));
    const walked = svgEl('path', { d, fill: 'none', stroke: '#E9A23B', 'stroke-width': 4, 'stroke-linejoin': 'round' }); sv.append(svgEl('path', { d, fill: 'none', stroke: 'rgba(237,232,218,.25)', 'stroke-width': 2, 'stroke-dasharray': '4 6' }), walked);
    WP.forEach((w, i) => { const idx = Math.round(w.at * (N - 1)); const g = svgEl('g', { class: 'ns-wp' }); g.append(svgEl('line', { x1: X(idx), x2: X(idx), y1: Y(ele[idx]), y2: Hh - 10, stroke: 'rgba(141,181,128,.5)', 'stroke-dasharray': '3 4' }), svgEl('circle', { cx: X(idx), cy: Y(ele[idx]), r: 8, fill: '#1F2A1F', stroke: '#8DB580', 'stroke-width': 3 })); const t = svgEl('text', { x: X(idx), y: Hh - 2, 'text-anchor': 'middle', fill: '#8DB580', 'font-size': 13, 'font-weight': 700 }); t.textContent = i + 1; g.append(t); sv.append(g); });
    const hiker = svgEl('g'); hiker.append(svgEl('circle', { r: 11, fill: '#E9A23B' }), svgEl('circle', { r: 4, fill: '#1F2A1F' })); sv.append(hiker);
    const card = el('div', 'ns-card'), meta = el('div', 'ns-meta');
    wrap.append(sv, meta, card); root.append(wrap);
    const len = walked.getTotalLength ? walked.getTotalLength() : 1000; walked.style.strokeDasharray = len;
    let pos = 0, lastWp = -1;
    function set(p) {
      pos = Math.max(0, Math.min(1, p)); const i = Math.round(pos * (N - 1)), x = X(i), y = Y(ele[i]);
      hiker.setAttribute('transform', `translate(${x} ${y})`); walked.style.strokeDashoffset = len * (1 - pos); sv.setAttribute('aria-valuenow', Math.round(pos * 100));
      let climb = 0; for (let k = 1; k <= i; k++) climb += Math.max(0, ele[k] - ele[k - 1]);
      meta.replaceChildren(); [[`${(pos * 64).toFixed(1)} km`, 'walked'], [`${Math.round(ele[i]).toLocaleString()} m`, 'elevation'], [`+${Math.round(climb).toLocaleString()} m`, 'climbed'], [`Day ${1 + Math.floor(pos * 3.99)}`, 'of 4']].forEach(([v, l]) => { const dd = el('div'); dd.append(el('b', null, v), el('span', null, l)); meta.append(dd); });
      const wi = WP.reduce((best, w, k) => Math.abs(w.at - pos) < Math.abs(WP[best].at - pos) ? k : best, 0);
      if (wi !== lastWp) { lastWp = wi; const w = WP[wi]; card.replaceChildren(); const n = el('p', 'ns-n', `Waypoint ${wi + 1} · ${w.n}`); card.append(n, el('h3', null, w.gear), el('p', null, w.note)); if (G && !reduced) G.fromTo(card, { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: .4, ease: 'power3.out' }); }
    }
    const fromEvent = e => { const r = sv.getBoundingClientRect(); return (e.clientX - r.left) / r.width; };
    let drag = false;
    sv.addEventListener('pointerdown', e => { drag = true; try { sv.setPointerCapture(e.pointerId); } catch (_) {} set(fromEvent(e)); });
    sv.addEventListener('pointermove', e => { if (drag) set(fromEvent(e)); });
    sv.addEventListener('pointerup', () => { drag = false; });
    sv.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); set(pos + .02); } if (e.key === 'ArrowLeft') { e.preventDefault(); set(pos - .02); } });
    set(.08);
    if (G && !reduced && window.ScrollTrigger) { const o = { p: 0 }; G.to(o, { p: .3, duration: 2, ease: 'power2.inOut', onUpdate: () => set(o.p), scrollTrigger: { trigger: sv, start: 'top 75%' } }); }
  }

  demo(document.getElementById('demo'), H);
})();
