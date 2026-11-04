/* Paperplane Agency — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    const CASES = [
      { d: 120, t: 'Harbour Transit', k: 'Wayfinding · 14 months', r: 'Missed connections down 31% after the redesign.' },
      { d: 260, t: 'Oakline Bank', k: 'Product strategy · 9 months', r: 'Mortgage applications finished in 11 minutes, not 40.' },
      { d: 400, t: 'Field Notes Radio', k: 'Brand + app · 7 months', r: 'Listeners doubled without a single paid ad.' },
      { d: 560, t: 'Kindred Health', k: 'Service design · 18 months', r: 'Nurses saved 52 minutes a shift on handovers.' }
    ];
    const wrap = el('div', 'pp-wrap'), cv = el('canvas', 'pp-cv'), side = el('div', 'pp-side');
    cv.width = 900; cv.height = 420; cv.setAttribute('aria-label', 'Paper plane launcher. Drag back from the plane and release to throw. Or press Space.'); cv.tabIndex = 0;
    const best = el('p', 'pp-best', 'Drag back from the plane, then let go.'), card = el('div', 'pp-card'); card.append(el('p', 'pp-k', 'Land a plane to open a case study'));
    side.append(best, card); wrap.append(cv, side); root.append(wrap);
    const ctx = cv.getContext('2d'), O = { x: 90, y: 300 };
    let plane = null, aim = null, trail = [], far = 0, opened = new Set(), wind = (Math.random() - .5) * 20;
    const toLocal = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 900, (e.clientY - r.top) / r.height * 420]; };
    cv.addEventListener('pointerdown', e => { if (plane && plane.fly) return; const [x, y] = toLocal(e); aim = { x, y }; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
    cv.addEventListener('pointermove', e => { if (!aim) return; const [x, y] = toLocal(e); aim.x = x; aim.y = y; });
    cv.addEventListener('pointerup', () => { if (!aim) return; const dx = O.x - aim.x, dy = O.y - aim.y, p = Math.min(1, Math.hypot(dx, dy) / 180); aim = null; if (p < .1) return; throwIt(Math.atan2(dy, dx), p); });
    cv.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); throwIt(-.45 + (Math.random() - .5) * .2, .65 + Math.random() * .35); } });
    function throwIt(a, p) { const v = 380 + p * 520; plane = { x: O.x, y: O.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: a, fly: true }; trail = []; }
    function land() {
      plane.fly = false; const dist = Math.round(plane.x - O.x); far = Math.max(far, dist);
      best.textContent = `${dist} m · best throw ${far} m`;
      const c = [...CASES].reverse().find(q => dist >= q.d);
      if (!c) { card.replaceChildren(el('p', 'pp-k', 'Too short to open a case study. Throw harder or flatter.')); return; }
      opened.add(c.t); card.replaceChildren(el('p', 'pp-k', c.k), el('h3', null, c.t), el('p', null, c.r), el('p', 'pp-k', `${opened.size} of 4 opened`));
      if (G && !reduced) G.fromTo(card, { rotation: -6, y: 20, opacity: 0 }, { rotation: 0, y: 0, opacity: 1, duration: .7, ease: 'elastic.out(1,.6)' });
      if (opened.size === 4) toast('All four case studies opened. Fancy being the fifth?');
    }
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(.033, (now - last) / 1000); last = now;
      if (plane && plane.fly) {
        const sp = Math.hypot(plane.vx, plane.vy), lift = Math.min(1, sp / 600) * 260;
        plane.vy += (420 - lift) * dt; plane.vx += wind * dt - plane.vx * .12 * dt; plane.x += plane.vx * dt; plane.y += plane.vy * dt; plane.rot = Math.atan2(plane.vy, plane.vx);
        trail.push([plane.x, plane.y]); if (trail.length > 70) trail.shift();
        if (plane.y > 360 || plane.x > 880) { plane.y = Math.min(plane.y, 360); land(); }
      }
      ctx.clearRect(0, 0, 900, 420);
      ctx.fillStyle = '#F2F0EA'; ctx.fillRect(0, 0, 900, 420);
      ctx.strokeStyle = 'rgba(18,18,18,.08)'; for (let x = 0; x < 900; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 420); ctx.stroke(); }
      ctx.fillStyle = '#121212'; ctx.fillRect(0, 362, 900, 2);
      CASES.forEach(c => { const x = O.x + c.d; ctx.fillStyle = opened.has(c.t) ? '#2B59FF' : 'rgba(18,18,18,.35)'; ctx.fillRect(x, 330, 2, 32); ctx.font = '600 12px DM Sans, sans-serif'; ctx.fillText(c.t, x + 6, 344); ctx.fillText(`${c.d} m`, x + 6, 358); });
      if (aim) { ctx.strokeStyle = '#FF5C39'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(O.x, O.y); ctx.lineTo(aim.x, aim.y); ctx.stroke(); ctx.setLineDash([]); const dx = O.x - aim.x, dy = O.y - aim.y, p = Math.min(1, Math.hypot(dx, dy) / 180); ctx.strokeStyle = 'rgba(43,89,255,.4)'; ctx.beginPath(); let px = O.x, py = O.y, vx = Math.cos(Math.atan2(dy, dx)) * (380 + p * 520), vy = Math.sin(Math.atan2(dy, dx)) * (380 + p * 520); for (let i = 0; i < 30; i++) { const sp = Math.hypot(vx, vy); vy += (420 - Math.min(1, sp / 600) * 260) * .03; px += vx * .03; py += vy * .03; ctx.lineTo(px, py); } ctx.stroke(); }
      ctx.strokeStyle = 'rgba(43,89,255,.35)'; ctx.beginPath(); trail.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
      const p = plane || { x: O.x, y: O.y, rot: -.3 };
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#121212'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(-18, -12); ctx.lineTo(-10, 0); ctx.lineTo(-18, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2B59FF'; ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(-10, 0); ctx.lineTo(-18, 12); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.fillStyle = 'rgba(18,18,18,.5)'; ctx.font = '600 12px DM Sans, sans-serif'; ctx.fillText(`wind ${wind > 0 ? '→' : '←'} ${Math.abs(wind).toFixed(0)}`, 820, 24);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  demo(document.getElementById('demo'), H);
})();
