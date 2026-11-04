/* The Quiet Room — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    const { el, G, reduced, audio, toast } = H;
    // every sound is synthesised live with WebAudio; nothing is downloaded
    const LAYERS = [{ k: 'rain', n: 'Rain', c: '#A5B4FC' }, { k: 'waves', n: 'Waves', c: '#7DD3FC' }, { k: 'drone', n: 'Low drone', c: '#F0ABFC' }, { k: 'bells', n: 'Far bells', c: '#FDE68A' }];
    const vol = { rain: .5, waves: .3, drone: .25, bells: .2 };
    let ctx = null, nodes = {}, playing = false, bellT = null, timer = 0, timerT = null;
    const wrap = el('div', 'qr-wrap'), orb = el('button', 'qr-orb'), sliders = el('div', 'qr-sliders'), meta = el('div', 'qr-meta');
    orb.type = 'button'; orb.setAttribute('aria-pressed', 'false'); orb.append(el('span', 'qr-ring'), el('span', 'qr-ring r2'), el('b', null, 'Begin'));
    LAYERS.forEach(L => { const row = el('label', 'qr-row'); const r = el('input'); r.type = 'range'; r.min = 0; r.max = 100; r.value = vol[L.k] * 100; r.style.setProperty('--c', L.c); r.setAttribute('aria-label', L.n + ' volume'); r.addEventListener('input', () => { vol[L.k] = r.value / 100; if (nodes[L.k]) nodes[L.k].gain.setTargetAtTime(vol[L.k] * .5, ctx.currentTime, .2); }); const dot = el('i'); dot.style.background = L.c; row.append(dot, el('span', null, L.n), r); sliders.append(row); });
    const presets = el('div', 'qr-presets'); [['Storm', { rain: .9, waves: .5, drone: .4, bells: 0 }], ['Shore', { rain: 0, waves: .8, drone: .2, bells: .3 }], ['Temple', { rain: .1, waves: 0, drone: .7, bells: .7 }]].forEach(([n, p]) => { const b = el('button', 'qr-pre', n); b.type = 'button'; b.addEventListener('click', () => { Object.assign(vol, p); sliders.querySelectorAll('input').forEach((r, i) => { r.value = vol[LAYERS[i].k] * 100; }); if (ctx) Object.entries(nodes).forEach(([k, g]) => { if (k in vol) g.gain.setTargetAtTime(vol[k] * .5, ctx.currentTime, .4); }); }); presets.append(b); });
    meta.append(el('p', 'qr-l', 'Session'), el('b', 'qr-t', '10:00'), presets);
    const panel = el('div', 'qr-panel'); panel.append(sliders, meta);
    wrap.append(orb, panel); root.append(wrap);
    function noiseBuf(c, brown) { const n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); let last = 0; for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; if (brown) { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; } return b; }
    function start() {
      ctx = audio(); if (!ctx) { toast('Audio isn’t available in this browser.'); return; } if (ctx.state === 'suspended') ctx.resume();
      const out = ctx.createGain(); out.gain.value = 0; out.gain.linearRampToValueAtTime(1, ctx.currentTime + 2); out.connect(ctx.destination); nodes.out = out;
      const mk = k => { const g = ctx.createGain(); g.gain.value = vol[k] * .5; g.connect(out); return g; };
      // rain: band-passed white noise
      const rain = ctx.createBufferSource(); rain.buffer = noiseBuf(ctx, false); rain.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = .6; nodes.rain = mk('rain'); rain.connect(bp).connect(nodes.rain); rain.start();
      // waves: brown noise with a slow swell
      const wv = ctx.createBufferSource(); wv.buffer = noiseBuf(ctx, true); wv.loop = true; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; const sw = ctx.createGain(); sw.gain.value = .5; const lfo = ctx.createOscillator(); lfo.frequency.value = .09; const lg = ctx.createGain(); lg.gain.value = .45; lfo.connect(lg).connect(sw.gain); lfo.start(); nodes.waves = mk('waves'); wv.connect(lp).connect(sw).connect(nodes.waves); wv.start();
      // drone: two detuned low sines
      nodes.drone = mk('drone'); [55, 82.6, 55.4].forEach(f => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f; const g = ctx.createGain(); g.gain.value = .25; o.connect(g).connect(nodes.drone); o.start(); });
      // bells: occasional soft pentatonic tones
      nodes.bells = mk('bells'); const notes = [523, 587, 659, 784, 880];
      const ring = () => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = notes[Math.floor(Math.random() * notes.length)]; g.gain.setValueAtTime(.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.3, ctx.currentTime + .02); g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + 4); o.connect(g).connect(nodes.bells); o.start(); o.stop(ctx.currentTime + 4.1); bellT = setTimeout(ring, 2500 + Math.random() * 4000); };
      ring();
      playing = true; timer = 600; tickTimer();
    }
    function stop() { if (!ctx || !nodes.out) return; nodes.out.gain.setTargetAtTime(0, ctx.currentTime, .4); const o = nodes.out; setTimeout(() => { try { o.disconnect(); } catch (_) {} }, 1600); nodes = {}; clearTimeout(bellT); clearTimeout(timerT); playing = false; }
    function tickTimer() { const m = Math.floor(timer / 60), s = timer % 60; meta.querySelector('.qr-t').textContent = `${m}:${String(s).padStart(2, '0')}`; if (!playing) return; if (timer-- <= 0) { stop(); setUi(); toast('Ten minutes. Notice how you feel.'); return; } timerT = setTimeout(tickTimer, 1000); }
    function setUi() { orb.setAttribute('aria-pressed', String(playing)); orb.querySelector('b').textContent = playing ? 'Pause' : 'Begin'; orb.classList.toggle('on', playing); }
    orb.addEventListener('click', () => { if (playing) stop(); else start(); setUi(); });
    if (G && !reduced) G.to('.qr-orb b', { scale: 1.06, duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  demo(document.getElementById('demo'), H);
})();
