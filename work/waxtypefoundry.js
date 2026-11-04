/* Wax Type Foundry — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    const { el, G, reduced, toast } = H;
    const FAM = [
      { n: 'Wax Grotesk', css: "'Darker Grotesque', sans-serif", min: 300, max: 900, styles: 7, price: 60 },
      { n: 'Wax Serif', css: "'Fraunces', serif", min: 300, max: 900, styles: 12, price: 80 },
      { n: 'Wax Mono', css: "'Spline Sans Mono', monospace", min: 300, max: 700, styles: 5, price: 50 },
      { n: 'Wax Display', css: "'DM Serif Display', serif", min: 400, max: 400, styles: 2, price: 45 },
      { n: 'Wax Block', css: "'Rubik Mono One', sans-serif", min: 400, max: 400, styles: 1, price: 40 },
      { n: 'Wax Sans', css: "'Space Grotesk', sans-serif", min: 300, max: 700, styles: 5, price: 55 }
    ];
    const S = { f: 0, size: 96, wght: 700, track: 0, text: 'Letterforms worth licensing' };
    const wrap = el('div', 'wt-wrap'), bar = el('div', 'wt-bar'), spec = el('div', 'wt-spec'), out = el('div', 'wt-out');
    out.contentEditable = 'true'; out.spellcheck = false; out.setAttribute('role', 'textbox'); out.setAttribute('aria-label', 'Type to test the font'); out.textContent = S.text;
    out.addEventListener('input', () => { if (out.textContent.length > 120) out.textContent = out.textContent.slice(0, 120); });
    const fams = el('div', 'wt-fams'); FAM.forEach((f, i) => { const b = el('button', 'wt-fam'); b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0)); const aa = el('b', null, 'Aa'); aa.style.fontFamily = f.css; b.append(aa, el('span', null, f.n)); b.addEventListener('click', () => { S.f = i; fams.querySelectorAll('.wt-fam').forEach(x => x.setAttribute('aria-pressed', String(x === b))); S.wght = Math.max(f.min, Math.min(f.max, S.wght)); wght.min = f.min; wght.max = f.max; wght.value = S.wght; wght.disabled = f.min === f.max; apply(true); }); fams.append(b); });
    const slider = (label, min, max, val, key, unit) => { const w = el('label', 'wt-sl'); const v = el('b', null, val + unit); const r = el('input'); r.type = 'range'; r.min = min; r.max = max; r.value = val; r.setAttribute('aria-label', label); r.addEventListener('input', () => { S[key] = +r.value; v.textContent = r.value + unit; apply(false); }); w.append(el('span', null, label), r, v); w.r = r; w.v = v; return w; };
    const size = slider('Size', 24, 180, S.size, 'size', 'px'), wghtL = slider('Weight', 300, 900, S.wght, 'wght', ''), track = slider('Tracking', -8, 30, 0, 'track', '');
    const wght = wghtL.r;
    const samples = el('div', 'wt-samples'); ['Hamburgefonstiv', 'The quick brown fox jumps', '0123456789 &@?!', 'Aa Bb Gg Qq Rr Ww'].forEach(t => { const b = el('button', 'wt-s', t); b.type = 'button'; b.addEventListener('click', () => { out.textContent = t; apply(true); }); samples.append(b); });
    const lic = el('div', 'wt-lic');
    bar.append(fams, size, wghtL, track, samples); wrap.append(bar, out, spec, lic); root.append(wrap);
    function apply(anim) {
      const f = FAM[S.f]; out.style.fontFamily = f.css; out.style.fontSize = S.size + 'px'; out.style.fontWeight = S.wght; out.style.letterSpacing = (S.track / 100) + 'em'; wghtL.v.textContent = f.min === f.max ? 'single weight' : S.wght;
      spec.replaceChildren(); const chars = el('p', 'wt-chars', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 ‘’“” ¿?¡! & @ € £ $'); chars.style.fontFamily = f.css; chars.style.fontWeight = S.wght; spec.append(chars);
      lic.replaceChildren(); [['Desktop', f.price], ['Web · 50k views', f.price + 20], ['App', f.price * 2]].forEach(([n, p]) => { const b = el('button', 'wt-li'); b.type = 'button'; b.append(el('span', null, n), el('b', null, `$${p}`)); b.addEventListener('click', () => toast(`${f.n} · ${n} licence added. The trial weight is free forever.`)); lic.append(b); });
      lic.prepend(el('p', 'wt-meta', `${f.n} · ${f.styles} style${f.styles === 1 ? '' : 's'} · ${f.min === f.max ? 'static' : `variable ${f.min}–${f.max}`}`));
      if (anim && G && !reduced) G.fromTo(out, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .45, ease: 'power3.out' });
    }
    apply(false);
  }

  demo(document.getElementById('demo'), H);
})();
