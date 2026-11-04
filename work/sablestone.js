/* Sable & Stone — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    const { el, svgEl, G, reduced, toast } = H;
    const STONES = [
      { n: 'Montana sapphire', c1: '#7FB3D5', c2: '#1B4F72', cut: 'Oval brilliant · 0.82 ct', from: 'Rock Creek, Montana · mined by a family claim since 1994' },
      { n: 'Tsavorite garnet', c1: '#7DCEA0', c2: '#145A32', cut: 'Cushion · 0.64 ct', from: 'Taita Hills, Kenya · traced through one cutter in Jaipur' },
      { n: 'Padparadscha', c1: '#F5B7B1', c2: '#CB4335', cut: 'Oval · 0.55 ct', from: 'Ratnapura, Sri Lanka · unheated, certificate on file' },
      { n: 'Recycled diamond', c1: '#FDFEFE', c2: '#AAB7B8', cut: 'Old mine cut · 0.40 ct', from: 'Re-set from a 1920s ring, recut by hand in Antwerp' }
    ];
    let si = 0;
    const wrap = el('div', 'ss-wrap'), stage = el('div', 'ss-stage'), sv = svgEl('svg', { viewBox: '0 0 500 500', class: 'ss-svg', 'aria-hidden': 'true' });
    const lens = el('div', 'ss-lens'), zoom = svgEl('svg', { viewBox: '0 0 500 500', class: 'ss-zoom', 'aria-hidden': 'true' }); lens.append(zoom);
    stage.append(sv, lens); stage.setAttribute('role', 'img'); stage.setAttribute('aria-label', 'Ring under a jeweller’s loupe. Move the pointer to inspect.');
    const panel = el('div', 'ss-panel'), chips = el('div', 'ss-chips'), info = el('div', 'ss-info');
    STONES.forEach((s, i) => { const b = el('button', 'ss-chip'); b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0)); const g = el('i'); g.style.background = `radial-gradient(circle at 35% 30%, #fff, ${s.c1} 30%, ${s.c2})`; b.append(g, el('span', null, s.n)); b.addEventListener('click', () => { si = i; chips.querySelectorAll('.ss-chip').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(); if (G && !reduced) G.fromTo('.ss-svg', { rotation: -8, scale: .95 }, { rotation: 0, scale: 1, duration: .8, ease: 'elastic.out(1,.5)', transformOrigin: '50% 50%' }); }); chips.append(b); });
    const cta = el('button', 'btn pri', 'Commission with this stone'); cta.type = 'button'; cta.addEventListener('click', () => toast(`Noted: ${STONES[si].n}. Commissions open twice a year. We’ll write when they do.`));
    panel.append(chips, info, cta); wrap.append(stage, panel); root.append(wrap);
    function ring(svg, detail) {
      const s = STONES[si]; svg.replaceChildren();
      const defs = svgEl('defs'); const gold = svgEl('linearGradient', { id: 'gold' + (detail ? 'z' : ''), x1: 0, y1: 0, x2: 1, y2: 1 }); [['0', '#F7E7B4'], ['.4', '#C8A97E'], ['.7', '#8C6B3F'], ['1', '#E9D3A1']].forEach(([o, c]) => gold.append(svgEl('stop', { offset: o, 'stop-color': c })));
      const gem = svgEl('radialGradient', { id: 'gem' + (detail ? 'z' : ''), cx: .4, cy: .35, r: .7 }); [['0', '#FFFFFF'], ['.25', s.c1], ['1', s.c2]].forEach(([o, c]) => gem.append(svgEl('stop', { offset: o, 'stop-color': c }))); defs.append(gold, gem); svg.append(defs);
      svg.append(svgEl('rect', { width: 500, height: 500, fill: '#0E0D0C' }));
      svg.append(svgEl('ellipse', { cx: 250, cy: 330, rx: 150, ry: 120, fill: 'none', stroke: `url(#gold${detail ? 'z' : ''})`, 'stroke-width': 26 }));
      svg.append(svgEl('ellipse', { cx: 250, cy: 330, rx: 150, ry: 120, fill: 'none', stroke: 'rgba(255,255,255,.25)', 'stroke-width': 2 }));
      // prongs + stone
      [[-46, 0], [46, 0], [0, -40], [0, 40]].forEach(([dx, dy]) => svg.append(svgEl('rect', { x: 250 + dx * .9 - 5, y: 200 + dy * .9 - 16, width: 10, height: 28, rx: 5, fill: `url(#gold${detail ? 'z' : ''})` })));
      svg.append(svgEl('ellipse', { cx: 250, cy: 200, rx: 56, ry: 46, fill: `url(#gem${detail ? 'z' : ''})` }));
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; svg.append(svgEl('line', { x1: 250, y1: 200, x2: 250 + Math.cos(a) * 56, y2: 200 + Math.sin(a) * 46, stroke: 'rgba(255,255,255,.22)', 'stroke-width': detail ? .8 : 1 })); }
      svg.append(svgEl('ellipse', { cx: 250, cy: 200, rx: 28, ry: 23, fill: 'none', stroke: 'rgba(255,255,255,.35)', 'stroke-width': 1 }));
      svg.append(svgEl('ellipse', { cx: 232, cy: 184, rx: 10, ry: 6, fill: 'rgba(255,255,255,.8)', transform: 'rotate(-30 232 184)' }));
      if (detail) { const t = svgEl('text', { x: 250, y: 455, 'text-anchor': 'middle', fill: '#C8A97E', 'font-size': 9, 'letter-spacing': 2 }); t.textContent = 'SABLE & STONE · 18K · HALLMARKED'; svg.append(t); for (let i = 0; i < 30; i++) svg.append(svgEl('circle', { cx: 110 + Math.random() * 280, cy: 230 + Math.random() * 220, r: .6, fill: 'rgba(255,255,255,.35)' })); }
    }
    function draw() { ring(sv, false); ring(zoom, true); const s = STONES[si]; info.replaceChildren(el('h3', null, s.n), el('p', 'ss-cut', s.cut), el('p', null, s.from)); }
    const Z = 2.6;
    function move(e) { const r = stage.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; lens.style.left = x + 'px'; lens.style.top = y + 'px'; const lw = lens.offsetWidth; zoom.style.width = r.width * Z + 'px'; zoom.style.height = r.height * Z + 'px'; zoom.style.left = (-x * Z + lw / 2) + 'px'; zoom.style.top = (-y * Z + lw / 2) + 'px'; lens.style.opacity = 1; }
    stage.addEventListener('pointermove', move); stage.addEventListener('pointerdown', move);
    stage.addEventListener('pointerleave', () => { lens.style.opacity = 0; });
    draw();
    const r0 = () => stage.getBoundingClientRect(); setTimeout(() => { const r = r0(); move({ clientX: r.left + r.width * .5, clientY: r.top + r.height * .4 }); }, 300);
  }

  demo(document.getElementById('demo'), H);
})();
