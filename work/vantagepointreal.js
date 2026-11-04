/* Vantage Point — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    const { el, G, reduced, toast } = H;
    const SPOTS = [
      { x: 0, z: 0, n: '14 Harbour View Rd', d: '4 bed · 3 bath · $2.4M', c: '#FBBF24' },
      { x: -260, z: 180, n: 'Crestwood Primary', d: '6 min walk · rated Outstanding', c: '#7DD3FC' },
      { x: 300, z: 120, n: 'Marina & ferry', d: '9 min walk · city in 22 min', c: '#7DD3FC' },
      { x: 140, z: -220, n: 'Ridge Park trails', d: '3 min walk · 12 km of trail', c: '#86EFAC' },
      { x: -200, z: -160, n: 'High Street', d: 'Bakery, grocer, two cafés', c: '#F9A8D4' }
    ];
    const wrap = el('div', 'vp-wrap'), cv = el('canvas', 'vp-cv'), hud = el('div', 'vp-hud'), alt = el('input'), card = el('div', 'vp-card');
    cv.width = 1000; cv.height = 560; cv.tabIndex = 0; cv.setAttribute('aria-label', 'Drone view of the neighbourhood. Drag to pan, use the altitude slider, tap markers.');
    alt.type = 'range'; alt.min = 30; alt.max = 160; alt.value = 80; alt.className = 'vp-alt'; alt.setAttribute('aria-label', 'Drone altitude in metres');
    const altV = el('b', null, '80 m'); const altBox = el('div', 'vp-altbox'); altBox.append(el('span', null, 'ALT'), alt, altV);
    hud.append(altBox); wrap.append(cv, hud, card); root.append(wrap);
    const ctx = cv.getContext('2d');
    // procedural neighbourhood: houses, trees, roads, water
    let s = 11; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    const houses = []; for (let i = 0; i < 160; i++) { const x = (r() - .5) * 1400, z = (r() - .5) * 1100; if (Math.abs(x) < 40 && Math.abs(z) < 40) continue; if (x > 380) continue; houses.push({ x, z, w: 18 + r() * 22, d: 16 + r() * 18, h: 8 + r() * 14, c: ['#E2E8F0', '#CBD5E1', '#FDE68A', '#FECACA', '#BFDBFE'][Math.floor(r() * 5)] }); }
    const trees = []; for (let i = 0; i < 220; i++) trees.push({ x: (r() - .5) * 1400, z: (r() - .5) * 1100, s: 6 + r() * 8 });
    const cam = { x: 0, z: 260, h: 80, yaw: 0 }; let sel = 0, t0 = performance.now(), drag = null;
    const project = (x, y, z) => { const dx = x - cam.x, dz = z - cam.z, cs = Math.cos(cam.yaw), sn = Math.sin(cam.yaw), rx = dx * cs - dz * sn, rz = dx * sn + dz * cs; const depth = -rz + 40; if (depth <= 5) return null; const f = 520 / depth; return { x: 500 + rx * f, y: 260 + (cam.h - y) * f * .9 - 80, f, depth }; };
    function draw(now) {
      const t = (now - t0) / 1000;
      if (!drag) cam.yaw += Math.sin(t * .15) * .0004;
      const sky = ctx.createLinearGradient(0, 0, 0, 560); sky.addColorStop(0, '#0F1720'); sky.addColorStop(.35, '#1E3A5F'); sky.addColorStop(.36, '#2B4A3A'); sky.addColorStop(1, '#16271E'); ctx.fillStyle = sky; ctx.fillRect(0, 0, 1000, 560);
      // water to the east
      const items = [];
      for (let zz = -600; zz <= 600; zz += 60) { const a = project(400, 0, zz), b = project(900, 0, zz), c2 = project(900, 0, zz + 60), d2 = project(400, 0, zz + 60); if (a && b && c2 && d2) items.push({ depth: a.depth + 2000, draw: () => { ctx.fillStyle = '#1D4E6B'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(d2.x, d2.y); ctx.fill(); } }); }
      // roads
      [[-700, 0, 380, 0], [0, -550, 0, 550], [-700, 220, 380, 220], [-350, -550, -350, 550]].forEach(([x1, z1, x2, z2]) => { const N = 30; for (let i = 0; i < N; i++) { const a = project(x1 + (x2 - x1) * i / N, 0, z1 + (z2 - z1) * i / N), b = project(x1 + (x2 - x1) * (i + 1) / N, 0, z1 + (z2 - z1) * (i + 1) / N); if (a && b) items.push({ depth: a.depth + 1500, draw: () => { ctx.strokeStyle = '#3B4A42'; ctx.lineWidth = Math.max(1, 14 * a.f); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }); } });
      houses.forEach(hh => { const p = project(hh.x, hh.h, hh.z), g = project(hh.x, 0, hh.z); if (!p || !g) return; items.push({ depth: p.depth, draw: () => { const w = hh.w * p.f, hgt = (g.y - p.y); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(g.x - w / 2 + 4, g.y - 2, w, 5 * p.f); ctx.fillStyle = hh.c; ctx.fillRect(p.x - w / 2, p.y, w, hgt); ctx.fillStyle = '#7F1D1D'; ctx.beginPath(); ctx.moveTo(p.x - w / 2 - 2, p.y); ctx.lineTo(p.x, p.y - w * .35); ctx.lineTo(p.x + w / 2 + 2, p.y); ctx.fill(); } }); });
      trees.forEach(tr => { const p = project(tr.x, tr.s, tr.z); if (!p) return; items.push({ depth: p.depth, draw: () => { ctx.fillStyle = '#2F6B3F'; ctx.beginPath(); ctx.arc(p.x, p.y, tr.s * p.f, 0, 7); ctx.fill(); } }); });
      items.sort((a, b) => b.depth - a.depth).forEach(i => i.draw());
      // markers
      SPOTS.forEach((sp, i) => { const p = project(sp.x, 30, sp.z); sp.screen = p; if (!p) return; const bob = Math.sin(t * 3 + i) * 4; ctx.strokeStyle = sp.c; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y + bob); ctx.lineTo(p.x, p.y + 30 * p.f * 2); ctx.stroke(); ctx.fillStyle = i === sel ? '#fff' : sp.c; ctx.beginPath(); ctx.arc(p.x, p.y + bob, i === sel ? 13 : 10, 0, 7); ctx.fill(); ctx.fillStyle = '#0F1720'; ctx.font = '700 12px Mulish, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(i ? i : '★', p.x, p.y + bob + 4); });
      // drone HUD lines
      ctx.strokeStyle = 'rgba(240,244,248,.35)'; ctx.lineWidth = 1; ctx.strokeRect(470, 230, 60, 60); ctx.beginPath(); ctx.moveTo(500, 220); ctx.lineTo(500, 240); ctx.moveTo(500, 280); ctx.lineTo(500, 300); ctx.stroke();
      ctx.fillStyle = 'rgba(240,244,248,.75)'; ctx.font = '600 13px Mulish, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(`REC ●  4K · ${cam.h.toFixed(0)} m · heading ${((cam.yaw * 180 / Math.PI) % 360 + 360).toFixed(0) % 360}°`, 20, 30);
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    function show(i) { sel = i; const sp = SPOTS[i]; card.replaceChildren(el('p', 'vp-k', i ? 'Nearby' : 'The listing'), el('h3', null, sp.n), el('p', null, sp.d)); if (!i) { const b = el('button', 'btn pri', 'Book a private viewing'); b.type = 'button'; b.addEventListener('click', () => toast('Viewing requested. The agent will confirm a time today.')); card.append(b); } if (G && !reduced) G.fromTo(card, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .4 }); }
    const local = e => { const rc = cv.getBoundingClientRect(); return [(e.clientX - rc.left) / rc.width * 1000, (e.clientY - rc.top) / rc.height * 560]; };
    cv.addEventListener('pointerdown', e => { const [x, y] = local(e); drag = { x, y, cx: cam.x, cz: cam.z, yaw: cam.yaw, moved: false }; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
    cv.addEventListener('pointermove', e => { if (!drag) return; const [x, y] = local(e), dx = x - drag.x, dy = y - drag.y; if (Math.hypot(dx, dy) > 4) drag.moved = true; cam.yaw = drag.yaw + dx * .003; cam.z = Math.max(-300, Math.min(600, drag.cz + dy * 1.2)); });
    cv.addEventListener('pointerup', e => { const [x, y] = local(e); if (drag && !drag.moved) { const hit = SPOTS.findIndex(sp => sp.screen && Math.hypot(sp.screen.x - x, sp.screen.y - y) < 22); if (hit >= 0) show(hit); } drag = null; });
    cv.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') cam.yaw -= .08; if (e.key === 'ArrowRight') cam.yaw += .08; if (e.key === 'ArrowUp') cam.z -= 20; if (e.key === 'ArrowDown') cam.z += 20; if (/^[0-4]$/.test(e.key)) show(+e.key); });
    alt.addEventListener('input', () => { const target = +alt.value; altV.textContent = target + ' m'; if (G && !reduced) G.to(cam, { h: target, duration: .6, ease: 'power2.out' }); else cam.h = target; });
    show(0);
  }

  demo(document.getElementById('demo'), H);
})();
