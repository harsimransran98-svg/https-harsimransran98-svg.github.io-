/* Lumen Optics — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    const FRAMES = [
      { n: 'Halden', shape: 'round', w: 132, lens: 48, bridge: 20, temple: 145, price: 145 },
      { n: 'Orrin', shape: 'square', w: 140, lens: 52, bridge: 18, temple: 145, price: 155 },
      { n: 'Juno', shape: 'cat', w: 136, lens: 50, bridge: 17, temple: 140, price: 165 },
      { n: 'Bexley', shape: 'aviator', w: 142, lens: 55, bridge: 16, temple: 145, price: 175 }
    ];
    const COLORS = [['Tortoise', '#7A4A2A'], ['Ink', '#222'], ['Crystal', 'rgba(200,210,220,.9)'], ['Terracotta', '#E07A5F']];
    const TINTS = [['Clear', 'rgba(255,255,255,0)'], ['Grey sun', 'rgba(40,40,40,.55)'], ['Rose', 'rgba(224,122,95,.35)'], ['Blue-light', 'rgba(255,230,120,.18)']];
    const S = { f: 0, c: 0, t: 0, dx: 0, dy: 0 };
    const wrap = el('div', 'lo-wrap'), stage = el('div', 'lo-stage'), sv = svgEl('svg', { viewBox: '0 0 400 420', class: 'lo-svg', role: 'img', 'aria-label': 'Illustrated face wearing the chosen frames' });
    // face
    sv.append(svgEl('rect', { width: 400, height: 420, fill: '#F1E4D8' }));
    sv.append(svgEl('path', { d: 'M110 420 C 110 330, 150 300, 200 300 S 290 330, 290 420 Z', fill: '#3D405B' }));
    sv.append(svgEl('rect', { x: 175, y: 260, width: 50, height: 60, fill: '#D9A688' }));
    sv.append(svgEl('ellipse', { cx: 200, cy: 190, rx: 92, ry: 115, fill: '#E8B796' }));
    sv.append(svgEl('path', { d: 'M108 170 C 100 80, 160 60, 205 62 C 260 64, 300 90, 292 170 C 285 120, 250 100, 205 104 C 160 104, 118 120, 108 170 Z', fill: '#3B2A22' }));
    [[164, 182], [236, 182]].forEach(([x, y]) => { sv.append(svgEl('ellipse', { cx: x, cy: y, rx: 11, ry: 7, fill: '#fff' })); sv.append(svgEl('circle', { cx: x, cy: y, r: 5, fill: '#3B2A22' })); });
    sv.append(svgEl('path', { d: 'M200 190 q -10 34 2 42 q 8 4 14 -2', fill: 'none', stroke: '#C98D6E', 'stroke-width': 3, 'stroke-linecap': 'round' }));
    sv.append(svgEl('path', { d: 'M178 262 q 22 14 44 0', fill: 'none', stroke: '#B5615B', 'stroke-width': 4, 'stroke-linecap': 'round' }));
    const glasses = svgEl('g', { class: 'lo-g', tabindex: 0, role: 'slider', 'aria-label': 'Glasses position. Drag or use arrow keys.' }); sv.append(glasses);
    stage.append(sv);
    const panel = el('div', 'lo-panel');
    const mk = (label, items, key, render) => { const g = el('div', 'lo-grp'); g.append(el('p', 'lo-l', label)); const row = el('div', 'lo-row'); items.forEach((it, i) => { const b = render(it, i); b.type = 'button'; b.setAttribute('aria-pressed', String(i === S[key])); b.addEventListener('click', () => { S[key] = i; row.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(true); }); row.append(b); }); g.append(row); return g; };
    panel.append(mk('Frame', FRAMES, 'f', f => el('button', 'lo-chip', f.n)));
    panel.append(mk('Colour', COLORS, 'c', ([n, c]) => { const b = el('button', 'lo-dot'); b.style.background = c; b.setAttribute('aria-label', n); return b; }));
    panel.append(mk('Lens', TINTS, 't', ([n]) => el('button', 'lo-chip', n)));
    const specs = el('div', 'lo-specs'), fit = el('p', 'lo-fit'), add = el('button', 'btn pri', 'Add to my try-on kit'); add.type = 'button';
    const kit = []; add.addEventListener('click', () => { const f = FRAMES[S.f]; if (!kit.includes(f.n)) kit.push(f.n); toast(kit.length >= 5 ? 'Your kit is full: five frames, one week, free returns.' : `${f.n} added · ${kit.length}/5 in your home try-on kit.`); });
    panel.append(specs, fit, add); wrap.append(stage, panel); root.append(wrap);
    function lensPath(shape, cx, cy, w) {
      const h = w * .78;
      if (shape === 'round') return `M${cx - w / 2} ${cy} a${w / 2} ${h / 2} 0 1 0 ${w} 0 a${w / 2} ${h / 2} 0 1 0 ${-w} 0`;
      if (shape === 'square') return `M${cx - w / 2 + 6} ${cy - h / 2} h${w - 12} q6 0 6 6 v${h - 12} q0 6 -6 6 h${-(w - 12)} q-6 0 -6 -6 v${-(h - 12)} q0 -6 6 -6z`;
      if (shape === 'cat') return `M${cx - w / 2} ${cy - h / 2 + 4} Q${cx} ${cy - h / 2 - 10} ${cx + w / 2 + 6} ${cy - h / 2 - 6} Q${cx + w / 2} ${cy + h / 2} ${cx} ${cy + h / 2} Q${cx - w / 2} ${cy + h / 2} ${cx - w / 2} ${cy - h / 2 + 4}z`;
      return `M${cx - w / 2} ${cy - h / 2} h${w} Q${cx + w / 2 + 4} ${cy + h / 2 + 8} ${cx} ${cy + h / 2 + 6} Q${cx - w / 2 - 4} ${cy + h / 2} ${cx - w / 2} ${cy - h / 2}z`;
    }
    function draw(anim) {
      const f = FRAMES[S.f], col = COLORS[S.c][1], tint = TINTS[S.t][1], w = f.lens * 1.25, y = 184;
      glasses.replaceChildren(); glasses.setAttribute('transform', `translate(${S.dx} ${S.dy})`);
      const flip = S.f === 2; // cat-eye mirrors on the left lens
      [[200 - f.bridge / 2 - w / 2, 1], [200 + f.bridge / 2 + w / 2, -1]].forEach(([cx, side]) => {
        const p = svgEl('path', { d: lensPath(f.shape, cx, y, w), fill: tint, stroke: col, 'stroke-width': S.f === 3 ? 4 : 7, 'stroke-linejoin': 'round' });
        if (flip && side === 1) p.setAttribute('transform', `translate(${cx * 2} 0) scale(-1 1)`);
        glasses.append(p);
        glasses.append(svgEl('line', { x1: cx + side * -1 * w / 2, y1: y - 6, x2: cx + side * -1 * (w / 2 + 34), y2: y - 10, stroke: col, 'stroke-width': 6, 'stroke-linecap': 'round' }));
      });
      glasses.append(svgEl('path', { d: `M${200 - f.bridge / 2} ${y - 6} q${f.bridge / 2} -10 ${f.bridge} 0`, fill: 'none', stroke: col, 'stroke-width': 6 }));
      specs.replaceChildren(); [[`${f.lens} mm`, 'lens'], [`${f.bridge} mm`, 'bridge'], [`${f.temple} mm`, 'temple'], [`$${f.price}`, 'with lenses']].forEach(([v, l]) => { const d = el('div'); d.append(el('b', null, v), el('span', null, l)); specs.append(d); });
      const off = Math.hypot(S.dx, S.dy); fit.textContent = off < 6 ? '✓ Sits level on the bridge of the nose.' : S.dy > 0 ? 'Sliding down: a smaller bridge would suit you.' : 'Sitting high: a wider bridge would suit you.';
      if (anim && G && !reduced) G.fromTo(glasses, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: .5, ease: 'back.out(2)', clearProps: 'y' });
    }
    let drag = null;
    glasses.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY, S.dx, S.dy]; try { glasses.setPointerCapture(e.pointerId); } catch (_) {} });
    glasses.addEventListener('pointermove', e => { if (!drag) return; const k = 400 / sv.getBoundingClientRect().width; S.dx = Math.max(-30, Math.min(30, drag[2] + (e.clientX - drag[0]) * k)); S.dy = Math.max(-25, Math.min(30, drag[3] + (e.clientY - drag[1]) * k)); draw(false); });
    glasses.addEventListener('pointerup', () => { drag = null; if (G && !reduced && Math.hypot(S.dx, S.dy) < 10) { G.to(S, { dx: 0, dy: 0, duration: .4, ease: 'elastic.out(1,.4)', onUpdate: () => draw(false) }); } });
    glasses.addEventListener('keydown', e => { const m = { ArrowUp: [0, -3], ArrowDown: [0, 3], ArrowLeft: [-3, 0], ArrowRight: [3, 0] }[e.key]; if (!m) return; e.preventDefault(); S.dx += m[0]; S.dy += m[1]; draw(false); });
    draw(false);
  }

  demo(document.getElementById('demo'), H);
})();
