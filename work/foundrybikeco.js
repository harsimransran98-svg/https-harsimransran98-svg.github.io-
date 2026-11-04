/* Foundry Bike Co — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    const COLORS = [['Forge orange', '#FF5F1F'], ['Gunmetal', '#4B5563'], ['Sage', '#8BA888'], ['Ivory', '#E8E2D0'], ['Cobalt', '#2459D6']];
    const WHEELS = [{ n: 'Alloy 700c', kg: 1.9, p: 0, rim: 10 }, { n: 'Carbon 45mm', kg: 1.35, p: 1150, rim: 18 }, { n: 'Gravel 650b', kg: 2.1, p: 320, rim: 14, tire: 9 }];
    const S = { color: 0, size: 56, wheel: 0, drops: true };
    const box = el('div', 'fb-wrap'), stage = el('div', 'fb-stage'), sv = svgEl('svg', { viewBox: '0 0 600 360', class: 'fb-svg', role: 'img', 'aria-label': 'Your configured bicycle' });
    stage.append(sv); const panel = el('div', 'fb-panel');
    const row = (label, node) => { const r = el('div', 'fb-row'); r.append(el('p', 'fb-l', label), node); return r; };
    const sw = el('div', 'fb-sw'); COLORS.forEach(([n, c], i) => { const b = el('button', 'fb-dot'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', n); b.setAttribute('aria-pressed', String(i === 0)); b.addEventListener('click', () => { S.color = i; sw.querySelectorAll('.fb-dot').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(true); }); sw.append(b); });
    const size = el('input'); size.type = 'range'; size.min = 49; size.max = 61; size.value = S.size; size.className = 'fb-range'; size.setAttribute('aria-label', 'Frame size in centimetres');
    const sizeV = el('b', 'fb-v', '56 cm'); const sizeBox = el('div', 'fb-sizebox'); sizeBox.append(size, sizeV);
    size.addEventListener('input', () => { S.size = +size.value; draw(false); });
    const wh = el('div', 'fb-seg'); WHEELS.forEach((w, i) => { const b = el('button', null, w.n); b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0)); b.addEventListener('click', () => { S.wheel = i; wh.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(true); }); wh.append(b); });
    const bars = el('div', 'fb-seg'); [['Drop bars', true], ['Flat bars', false]].forEach(([n, v]) => { const b = el('button', null, n); b.type = 'button'; b.setAttribute('aria-pressed', String(v)); b.addEventListener('click', () => { S.drops = v; bars.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(true); }); bars.append(b); });
    const stats = el('div', 'fb-stats'), go = el('button', 'btn pri', 'Reserve a build slot'); go.type = 'button'; go.addEventListener('click', () => toast(`Slot held: ${S.size} cm in ${COLORS[S.color][0].toLowerCase()}. We’ll email your geometry sheet.`));
    panel.append(row('Paint', sw), row('Frame size', sizeBox), row('Wheels', wh), row('Cockpit', bars), stats, go);
    box.append(stage, panel); root.append(box);
    function draw(anim) {
      sv.replaceChildren(); const col = COLORS[S.color][1], w = WHEELS[S.wheel], k = (S.size - 49) / 12;
      const R = 78 + (w.tire || 0), rx = 140, fx = 450 - k * 12, wy = 270, bb = [285, 280], seatTop = [255 - k * 10, 120 - k * 40], head = [fx - 40, 135 - k * 18];
      const line = (a, b, wdt, c = col) => sv.append(svgEl('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: c, 'stroke-width': wdt, 'stroke-linecap': 'round' }));
      [rx, fx].forEach(x => { sv.append(svgEl('circle', { cx: x, cy: wy, r: R, fill: 'none', stroke: '#222', 'stroke-width': 7 + (w.tire || 0) / 2 })); sv.append(svgEl('circle', { cx: x, cy: wy, r: R - w.rim / 2 - 4, fill: 'none', stroke: S.wheel === 1 ? '#111' : '#777', 'stroke-width': w.rim })); for (let a = 0; a < 16; a++) { const t = a / 16 * Math.PI * 2; sv.append(svgEl('line', { x1: x, y1: wy, x2: x + Math.cos(t) * (R - 12), y2: wy + Math.sin(t) * (R - 12), stroke: '#999', 'stroke-width': S.wheel === 1 ? 0 : 1 })); } sv.append(svgEl('circle', { cx: x, cy: wy, r: 7, fill: '#333' })); });
      line([rx, wy], bb, 7); line([rx, wy], seatTop, 7); line(bb, seatTop, 10); line(seatTop, head, 10); line(bb, head, 12); line(head, [fx, wy], 8);
      line(seatTop, [seatTop[0] - 6, seatTop[1] - 26], 5, '#222'); sv.append(svgEl('path', { d: `M${seatTop[0] - 30} ${seatTop[1] - 30} h44 q6 0 6 6 h-50 z`, fill: '#1a1a1a' }));
      line(head, [head[0] - 4, head[1] - 22], 6, '#222');
      if (S.drops) sv.append(svgEl('path', { d: `M${head[0] - 4} ${head[1] - 22} h28 q14 0 14 14 v18 q0 10 -10 10 h-8`, fill: 'none', stroke: '#1a1a1a', 'stroke-width': 6, 'stroke-linecap': 'round' }));
      else line([head[0] - 14, head[1] - 24], [head[0] + 30, head[1] - 24], 6, '#1a1a1a');
      sv.append(svgEl('circle', { cx: bb[0], cy: bb[1], r: 16, fill: 'none', stroke: '#444', 'stroke-width': 4 })); line(bb, [bb[0] + 18, bb[1] + 30], 5, '#333');
      const t = svgEl('text', { x: (bb[0] + head[0]) / 2 - 20, y: (bb[1] + head[1]) / 2 + 4, fill: S.color === 3 ? '#111' : '#fff', 'font-size': 13, 'font-weight': 800, 'letter-spacing': 3, transform: `rotate(${Math.atan2(head[1] - bb[1], head[0] - bb[0]) * 180 / Math.PI} ${(bb[0] + head[0]) / 2} ${(bb[1] + head[1]) / 2})` }); t.textContent = 'FOUNDRY'; sv.append(t);
      sizeV.textContent = `${S.size} cm · rider ${Math.round(S.size * 3.2)}–${Math.round(S.size * 3.3 + 8)} cm`;
      const price = 2890 + w.p + (S.drops ? 140 : 0) + (S.color === 4 ? 180 : 0), kg = (7.6 + w.kg + (S.size - 56) * .04 + (S.drops ? .1 : 0)).toFixed(2), weeks = 3 + (S.color === 4 ? 1 : 0) + (S.wheel === 1 ? 1 : 0);
      stats.replaceChildren(); [[`$${price.toLocaleString()}`, 'built price'], [`${kg} kg`, 'complete'], [`${weeks} wks`, 'to your door']].forEach(([v, l]) => { const d = el('div'); d.append(el('b', null, v), el('span', null, l)); stats.append(d); });
      if (anim && G && !reduced) G.fromTo(sv, { scale: .96, rotation: -1 }, { scale: 1, rotation: 0, duration: .7, ease: 'elastic.out(1,.5)', transformOrigin: '50% 80%' });
    }
    draw(false);
  }

  demo(document.getElementById('demo'), H);
})();
