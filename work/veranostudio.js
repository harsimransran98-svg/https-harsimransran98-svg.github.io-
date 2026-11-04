/* Verano Studio — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
  const BTN = 1;
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
    const TOPS = [{ n: 'Linen camp shirt', p: 140 }, { n: 'Ribbed tank', p: 65 }, { n: 'Cropped knit', p: 120 }];
    const BOTTOMS = [{ n: 'Wide-leg trouser', p: 180 }, { n: 'Bias midi skirt', p: 160 }, { n: 'Pleated short', p: 110 }];
    const COLS = [['Terracotta', '#C2410C'], ['Olive', '#5F6B3A'], ['Bone', '#E7DCCB'], ['Ink', '#1F2430'], ['Saffron', '#D8A031']];
    const S = { top: 0, bottom: 0, tc: 2, bc: 0 };
    const wrap = el('div', 'vs-wrap'), stage = el('div', 'vs-stage'), sv = svgEl('svg', { viewBox: '0 0 300 520', class: 'vs-svg', role: 'img', 'aria-label': 'Illustrated look' });
    stage.append(sv);
    const panel = el('div', 'vs-panel');
    const pick = (label, arr, key, ckey) => {
      const g = el('div', 'vs-g'); g.append(el('p', 'vs-l', label));
      const row = el('div', 'vs-row'); arr.forEach((it, i) => { const b = el('button', 'vs-chip', it.n); b.type = 'button'; b.setAttribute('aria-pressed', String(S[key] === i)); b.addEventListener('click', () => { S[key] = i; row.querySelectorAll('.vs-chip').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(key); }); row.append(b); });
      const crow = el('div', 'vs-cols'); COLS.forEach(([n, c], i) => { const b = el('button', 'vs-dot'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', `${label} in ${n}`); b.setAttribute('aria-pressed', String(S[ckey] === i)); b.addEventListener('click', () => { S[ckey] = i; crow.querySelectorAll('.vs-dot').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(ckey); }); crow.append(b); });
      g.append(row, crow); return g;
    };
    const sum = el('div', 'vs-sum'), add = el('button', 'btn pri', 'Add the look to bag'); add.type = 'button';
    add.addEventListener('click', () => toast(`Added: ${TOPS[S.top].n} in ${COLS[S.tc][0].toLowerCase()} + ${BOTTOMS[S.bottom].n} in ${COLS[S.bc][0].toLowerCase()}. The drop closes in two weeks.`));
    panel.append(pick('Top', TOPS, 'top', 'tc'), pick('Bottom', BOTTOMS, 'bottom', 'bc'), sum, add);
    wrap.append(stage, panel); root.append(wrap);
    function draw(changed) {
      sv.replaceChildren(); const tc = COLS[S.tc][1], bc = COLS[S.bc][1];
      sv.append(svgEl('rect', { width: 300, height: 520, fill: '#EFE4D6' }), svgEl('ellipse', { cx: 150, cy: 500, rx: 90, ry: 10, fill: 'rgba(0,0,0,.08)' }));
      const skin = '#C68B67';
      sv.append(svgEl('circle', { cx: 150, cy: 62, r: 28, fill: skin }), svgEl('path', { d: 'M122 58 q 4 -36 30 -34 q 26 2 28 36 q -8 -14 -28 -14 q -20 0 -30 12z', fill: '#2A1D17' }), svgEl('rect', { x: 141, y: 86, width: 18, height: 18, fill: skin }));
      // legs
      const legLong = S.bottom === 2 ? 1 : 0; sv.append(svgEl('path', { d: 'M128 300 L120 480 L136 480 L148 320 L152 320 L164 480 L180 480 L172 300z', fill: skin }));
      sv.append(svgEl('path', { d: 'M116 482 h24 v8 h-26z M160 482 h24 v8 h-24z', fill: '#2A1D17' }));
      // bottoms
      const bG = svgEl('g', { class: 'vs-b' });
      if (S.bottom === 0) bG.append(svgEl('path', { d: 'M118 238 H182 L198 470 H158 L150 300 L142 470 H102z', fill: bc }));
      if (S.bottom === 1) bG.append(svgEl('path', { d: 'M120 238 H180 Q 200 340 206 400 Q 150 418 94 400 Q 100 340 120 238z', fill: bc }));
      if (S.bottom === 2) bG.append(svgEl('path', { d: 'M118 238 H182 L192 330 H156 L150 300 L144 330 H108z', fill: bc }));
      bG.append(svgEl('path', { d: 'M118 244 H182', stroke: 'rgba(0,0,0,.18)', 'stroke-width': 4 }));
      // arms
      sv.append(svgEl('path', { d: 'M108 112 Q 86 170 92 236 L104 236 Q 104 176 120 130z M192 112 Q 214 170 208 236 L196 236 Q 196 176 180 130z', fill: skin }));
      // tops
      const tG = svgEl('g', { class: 'vs-t' });
      if (S.top === 0) tG.append(svgEl('path', { d: 'M150 102 L112 112 L96 168 L114 174 L120 150 L118 246 H182 L180 150 L186 174 L204 168 L188 112z', fill: tc }), svgEl('path', { d: 'M150 104 L140 126 L150 120 L160 126z', fill: 'rgba(0,0,0,.15)' }), svgEl('line', { x1: 150, y1: 122, x2: 150, y2: 244, stroke: 'rgba(0,0,0,.15)', 'stroke-width': 2 }));
      if (S.top === 1) tG.append(svgEl('path', { d: 'M132 106 Q 150 120 168 106 L178 116 L182 246 H118 L122 116z', fill: tc }), ...[0, 1, 2, 3, 4, 5, 6].map(i => svgEl('line', { x1: 124 + i * 9, y1: 130, x2: 124 + i * 9, y2: 244, stroke: 'rgba(0,0,0,.08)', 'stroke-width': 2 })));
      if (S.top === 2) tG.append(svgEl('path', { d: 'M150 100 L108 112 L90 200 L110 204 L120 160 L120 214 H180 L180 160 L190 204 L210 200 L192 112z', fill: tc }), svgEl('rect', { x: 120, y: 206, width: 60, height: 10, fill: 'rgba(0,0,0,.12)' }));
      sv.append(bG, tG);
      const total = TOPS[S.top].p + BOTTOMS[S.bottom].p;
      sum.replaceChildren(); [[TOPS[S.top].n, `$${TOPS[S.top].p}`, COLS[S.tc][0]], [BOTTOMS[S.bottom].n, `$${BOTTOMS[S.bottom].p}`, COLS[S.bc][0]]].forEach(([n, p, c]) => { const r = el('div', 'vs-line'); r.append(el('span', null, `${n} · ${c}`), el('b', null, p)); sum.append(r); });
      const t = el('div', 'vs-line vs-total'); t.append(el('span', null, 'The look'), el('b', null, `$${total}`)); sum.append(t);
      if (changed && G && !reduced) { const target = changed === 'top' || changed === 'tc' ? tG : bG; G.from(target, { opacity: 0, y: changed === 'top' || changed === 'tc' ? -20 : 20, duration: .5, ease: 'expo.out' }); }
    }
    draw();
  }

  demo(document.getElementById('demo'), H);
})();
