/* Skyline Reel — Motion-graphics film page: DOM + SVG + GSAP master timeline with Pexels stock media (Bazozo Studio).
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
    G.from('.hero .kick, .hero .lead, .hero .acts, .hero .stats', { y: 24, opacity: 0, duration: .9, stagger: .1, ease: 'expo.out', delay: .45 });
    G.from('.orb', { scale: .4, opacity: 0, duration: 1.6, stagger: .15, ease: 'expo.out' });
    const mm = G.matchMedia();
    mm.add('(min-width: 861px)', () => { if (window.ScrollTrigger) $$('.orb').forEach((o, i) => G.to(o, { yPercent: (i % 2 ? -1 : 1) * 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } })); });
    if (window.ScrollTrigger) G.from('.mo-props', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.mo-props', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };

  /* ---------- motion engine: 3D camera rig + GSAP master timeline + stock media + Web Audio ---------- */
  if (G && window.MotionPathPlugin) G.registerPlugin(MotionPathPlugin);
  const PX = (id, w = 1280) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
  const PXV = p => `https://videos.pexels.com/video-files/${p}`;
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const seeded = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* Web Audio synth: every sound is generated, nothing is sampled */
  function Sound() {
    let ctx = null, out = null, on = false, nbuf = null;
    const ok = () => !!ctx && on && ctx.state === 'running';
    const init = () => {
      if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5; out = ctx.createGain(); out.gain.value = .72; out.connect(comp); comp.connect(ctx.destination); } catch (_) { ctx = null; } }
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
      return !!ctx;
    };
    const noise = () => { if (!nbuf) { nbuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } const s = ctx.createBufferSource(); s.buffer = nbuf; s.loop = true; return s; };
    const vca = (t, a, peak, d) => { const g = ctx.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(peak, .0002), t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); g.connect(out); return g; };
    const A = {
      get ctx() { return ctx; }, get on() { return ok(); }, get out() { return out; },
      osc(f, d = .2, { type = 'sine', v = .2, a = .005, to = null, at = 0, lp = 0 } = {}) {
        if (!ok()) return; const t = ctx.currentTime + at, o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
        if (to) o.frequency.exponentialRampToValueAtTime(to, t + a + d);
        let n = o; if (lp) { const b = ctx.createBiquadFilter(); b.type = 'lowpass'; b.frequency.value = lp; o.connect(b); n = b; }
        n.connect(vca(t, a, v, d)); o.start(t); o.stop(t + a + d + .05);
      },
      hiss(d = .2, { v = .2, a = .005, type = 'highpass', f = 6000, to = null, q = .7, at = 0 } = {}) {
        if (!ok()) return; const t = ctx.currentTime + at, s = noise(), b = ctx.createBiquadFilter(); b.type = type; b.frequency.setValueAtTime(f, t);
        if (to) b.frequency.exponentialRampToValueAtTime(to, t + a + d); b.Q.value = q; s.connect(b).connect(vca(t, a, v, d)); s.start(t); s.stop(t + a + d + .05);
      },
      kick(v = .9) { A.osc(160, .34, { v, to: 40 }); },
      snare(v = .3) { A.hiss(.17, { v, type: 'bandpass', f: 1900, q: .7 }); A.osc(200, .09, { v: v * .6, type: 'triangle', to: 130 }); },
      clap(v = .28) { [0, .012, .026].forEach(at => A.hiss(.09, { v, type: 'bandpass', f: 1300, q: 1.4, at })); },
      hat(v = .1, d = .04) { A.hiss(d, { v, f: 8200 }); },
      bass(f, d = .3, v = .3) { A.osc(f, d, { type: 'sawtooth', v, lp: 420, a: .01 }); A.osc(f / 2, d, { v: v * .7 }); },
      pluck(f, d = .5, v = .14) { A.osc(f, d, { type: 'triangle', v, a: .004 }); A.osc(f * 2, d * .4, { v: v * .25, a: .004 }); },
      bell(f, v = .12, d = 1.4) { A.osc(f, d, { v }); A.osc(f * 2.76, d * .5, { v: v * .35 }); A.osc(f * 5.4, d * .25, { v: v * .12 }); },
      pad(fs, d = 2, v = .16) { fs.forEach(f => { A.osc(f, d, { type: 'triangle', v: v / fs.length, a: d * .35, lp: 1800 }); A.osc(f * 1.004, d, { type: 'sawtooth', v: v / fs.length * .25, a: d * .4, lp: 900 }); }); },
      whoosh(d = .45, v = .22, up = true) { A.hiss(d, { v, type: 'bandpass', f: up ? 400 : 4200, to: up ? 4200 : 300, q: 1.1, a: d * .55 }); },
      riser(d = 1.5, v = .14) { A.osc(180, d, { type: 'sawtooth', v: v * .7, to: 1500, a: d * .9, lp: 2400 }); A.hiss(d, { v, type: 'bandpass', f: 500, to: 7000, a: d * .9 }); },
      impact(v = .85) { A.kick(v); A.osc(52, 1.1, { v: v * .55, to: 34 }); A.hiss(.6, { v: v * .35, type: 'lowpass', f: 900, to: 120 }); },
      drop(v = .85) { A.osc(150, 1.1, { v, to: 32 }); A.hiss(.35, { v: v * .3, type: 'lowpass', f: 1400, to: 100 }); },
      click(v = .07) { A.hiss(.014, { v, type: 'bandpass', f: 3200, q: 2 }); },
      buzz(v = .1) { A.osc(110, .16, { type: 'square', v, lp: 1200 }); A.osc(116, .16, { type: 'square', v: v * .6, lp: 1200 }); },
      chime(v = .14) { A.bell(1318.5, v, 1.1); A.bell(1975.5, v * .7, 1.3); }
    };
    return { A, init, set(o) { on = !!o; if (on) init(); }, get muted() { return !on; } };
  }

  function stockFactory(media) {
    return o => {
      const box = el('div', 'mo-media ' + (o.cls || ''));
      box.style.setProperty('--fb', o.fallback || 'linear-gradient(135deg,#1b1d24,#050507)');
      if (o.photo) { const img = el('img'); img.alt = o.alt || ''; img.decoding = 'async'; img.loading = 'eager'; img.src = o.photo; img.addEventListener('error', () => img.remove()); box.append(img); }
      if (o.video) {
        const v = document.createElement('video');
        ['autoplay', 'muted', 'loop', 'playsinline'].forEach(a => v.setAttribute(a, ''));
        v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
        v.setAttribute('aria-hidden', 'true'); v.tabIndex = -1;
        if (o.rate) v.defaultPlaybackRate = o.rate;
        v.addEventListener('error', () => box.classList.add('mo-fail'));
        v.addEventListener('loadeddata', () => { box.classList.add('mo-live'); if (o.rate) v.playbackRate = o.rate; if (o.start) try { v.currentTime = o.start; } catch (_) {} }, { once: true });
        box.append(v); media.push({ v, src: o.video, a: o.from ?? 0, b: o.to ?? 1e9, box });
      }
      if (o.label) { const l = el('span', 'mo-src', o.label); l.setAttribute('aria-hidden', 'true'); box.append(l); }
      return box;
    };
  }

  function motion(root, F) {
    const fps = F.fps || 60, W = F.W || 1600, HH = F.H || 900, dur = F.dur, total = Math.round(dur * fps);
    const snd = Sound(), A = snd.A;
    root.dataset.ar = HH / W < .5 ? '239' : '169';

    /* viewport: rig (perspective) > shaker > stage (preserve-3d) */
    const view = el('div', 'mo-view'), rig = el('div'), shaker = el('div', 'mo-shaker'), stage = el('div'), hud = el('div', 'mo-hud');
    rig.id = 'camera-rig'; stage.id = 'camera-stage'; rig.style.width = W + 'px'; rig.style.height = HH + 'px';
    shaker.append(stage); rig.append(shaker, hud); view.append(rig);
    view.setAttribute('role', 'img'); view.setAttribute('aria-label', F.alt || F.id);
    const big = el('button', 'mo-big'); big.type = 'button'; big.setAttribute('aria-label', 'Play with sound'); big.append(el('i', null, '▶'), el('span', null, 'Play with sound'));
    const live = el('span', 'mo-live'); live.setAttribute('aria-hidden', 'true'); live.append(el('i'), document.createTextNode(F.badge || 'GSAP MASTER TIMELINE'));
    view.append(big, live);

    /* sequencer */
    const seq = el('div', 'mo-seq'), tx = el('div', 'mo-tx');
    const bPlay = el('button', 'mo-b mo-play', '▶'), bRe = el('button', 'mo-b', '⟲ Restart'), fc = el('code', 'mo-fc'), tc = el('code', 'mo-tc'), sp = el('span', 'mo-sp');
    const bMute = el('button', 'mo-b mo-mute', '♪ Unmute'), bFull = el('button', 'mo-b', '⤢ Full screen'), fpsEl = el('code', 'mo-fps', '-- fps');
    [bPlay, bRe, bMute, bFull].forEach(b => { b.type = 'button'; });
    bPlay.setAttribute('aria-label', 'Play'); bMute.setAttribute('aria-pressed', 'false'); bMute.setAttribute('aria-label', 'Web Audio sound');
    tx.append(bPlay, bRe, fc, tc, sp, bMute, bFull, fpsEl);
    seq.append(tx);
    root.append(view, seq);

    /* scale the 1600px composition to the viewport */
    const fit = () => { const k = view.clientWidth / W; rig.style.transform = `scale(${k})`; };
    if (window.ResizeObserver) new ResizeObserver(fit).observe(view); else window.addEventListener('resize', fit);
    fit();

    /* build */
    let tl = null, cues = [], ticks = [], media = [], T = 0, playing = false, vis = false, userPaused = false, started = false;
    const props = {}; (F.props || []).forEach(p => { props[p.k] = p.v; });
    const split = (node, text, by = 'char') => {
      node.textContent = ''; node.setAttribute('aria-label', text); const out = [];
      text.split(' ').forEach((w, wi) => {
        if (wi) node.append(document.createTextNode(' '));
        if (by === 'word') { const s = el('span', 'mo-w', w); s.setAttribute('aria-hidden', 'true'); node.append(s); out.push(s); return; }
        const ws = el('span', 'mo-wd'); ws.setAttribute('aria-hidden', 'true'); [...w].forEach(ch => { const s = el('span', 'mo-ch', ch); ws.append(s); out.push(s); }); node.append(ws);
      });
      return out;
    };
    const api = {
      W, H: HH, fps, dur, G, el, svgEl, PX, PXV, pad, clamp, rig, view, stage, shaker, hud, props, A, reduced,
      lite: window.matchMedia('(max-width: 700px)').matches,
      get t() { return T; }, get playing() { return playing; },
      cue(t, fn) { cues.push({ t, fn }); }, tick(fn) { ticks.push(fn); }, split,
      add(parent, tag, cls, text) { const n = el(tag, cls, text); (parent || stage).append(n); return n; },
      count(node, a, b, at, d, fmt = v => Math.round(v).toLocaleString('en-US'), ease = 'power2.out') { const o = { v: a }; node.textContent = fmt(a); api.tl.to(o, { v: b, duration: d, ease, onUpdate: () => { node.textContent = fmt(o.v); } }, at); },
      shake(at, d, amp = 10, freq = 28, rot = 0) {
        const r = api.rnd, n = Math.max(2, Math.round(d * freq)), kf = [];
        for (let i = 0; i < n; i++) { const f = 1 - i / n; kf.push({ x: (r() * 2 - 1) * amp * f, y: (r() * 2 - 1) * amp * f, rotation: (r() * 2 - 1) * rot * f, duration: 1 / freq }); }
        kf.push({ x: 0, y: 0, rotation: 0, duration: .06 }); api.tl.to(shaker, { keyframes: kf, ease: 'none' }, at);
      },
      flash(at, color = '#fff', d = .45, peak = 1) { const f = el('div', 'mo-flash'); f.style.background = color; hud.append(f); api.tl.fromTo(f, { opacity: peak }, { opacity: 0, duration: d, ease: 'power2.out', immediateRender: false }, at); api.tl.set(f, { opacity: 0 }, 0); return f; },
      stock: null,
      /* a flat plane in the HUD that copies the camera every frame: type placed here always sits above stock video
         (Chrome paints video planes inside a preserve-3d context above their 3D siblings) */
      mirror(w = W, h = HH) { const o = el('div', 'mo-mirror'), s = el('div', 'mo-mirror-s'); s.style.width = w + 'px'; s.style.height = h + 'px'; o.append(s); hud.append(o); ticks.push(() => { o.style.transform = shaker.style.transform; o.style.transformOrigin = shaker.style.transformOrigin; s.style.transform = stage.style.transform; s.style.transformOrigin = stage.style.transformOrigin; }); return s; }
    };
    G.set(shaker, { x: 0, y: 0, rotation: 0 });
    const build = () => {
      if (tl) tl.kill();
      cues = []; ticks = [];
      media.forEach(m => { try { m.v.pause(); m.v.removeAttribute('src'); m.v.load(); } catch (_) {} }); media = [];
      stage.textContent = ''; hud.textContent = ''; view.style.cssText = '';
      G.set([stage, shaker], { clearProps: 'all' });
      api.rnd = seeded(F.seed || 7); api.stock = stockFactory(media);
      tl = api.tl = G.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      F.build(api);
      tl.set({}, {}, dur);
      cues.sort((a, b) => a.t - b.t);
      (F.props || []).forEach(p => { if (!p.rebuild && F.onProp) F.onProp(p.k, props[p.k], api); });
      render(true);
    };

    /* playback */
    const fire = (a, b) => { if (!A.on) return; for (const c of cues) { if (c.t > a && c.t <= b) { try { c.fn(A, api); } catch (_) {} } } };
    let lastSync = 0;
    const syncMedia = force => {
      const now = performance.now(); if (!force && now - lastSync < 180) return; lastSync = now;
      media.forEach(m => {
        const near = T >= m.a - 2.6 && T <= m.b + .2;
        if (near && !m.v.getAttribute('src')) { m.v.preload = 'auto'; m.v.src = m.src; }
        const want = playing && vis && T >= m.a - .4 && T <= m.b + .2;
        if (want && m.v.paused && m.v.getAttribute('src')) { const p = m.v.play(); if (p) p.catch(() => {}); }
        else if (!want && !m.v.paused) m.v.pause();
      });
    };
    const render = force => {
      tl.time(T, false);
      const f = Math.min(total, Math.floor(T * fps + 1e-6));
      fc.textContent = `Frame ${pad(f, 3)} / ${total} @ ${fps}fps`;
      tc.textContent = `${pad(Math.floor(T / 60))}:${pad(Math.floor(T) % 60)}:${pad(Math.floor((T % 1) * fps))}`;
      ticks.forEach(fn => fn(T, api));
      syncMedia(force);
    };
    const seek = t => { T = clamp(t, 0, dur - 1e-4); render(true); };
    const play = () => {
      if (playing) return; playing = true; started = true; root.classList.add('playing'); if (F.onState) F.onState(api, true); bPlay.textContent = '❚❚'; bPlay.setAttribute('aria-label', 'Pause'); last = performance.now(); syncMedia(true);
    };
    const pause = user => { if (user) userPaused = true; if (!playing) return; playing = false; root.classList.remove('playing'); if (F.onState) F.onState(api, false); bPlay.textContent = '▶'; bPlay.setAttribute('aria-label', 'Play'); syncMedia(true); };
    let last = performance.now(), frames = 0, fpsT = performance.now();
    G.ticker.add(() => {
      const now = performance.now();
      if (playing) {
        const dt = Math.min(.1, (now - last) / 1000), t0 = T; T += dt;
        if (T >= dur) { fire(t0, dur); T -= dur; fire(-1, T); } else fire(t0, T);
        render(false); frames++;
      }
      last = now;
      if (now - fpsT >= 500) { fpsEl.textContent = playing ? Math.round(frames * 1000 / (now - fpsT)) + ' fps' : 'paused'; frames = 0; fpsT = now; }
    });
    const setSound = on => { snd.set(on); bMute.setAttribute('aria-pressed', String(on)); bMute.textContent = on ? '♪ Mute' : '♪ Unmute'; big.hidden = true; if (F.onState) F.onState(api, playing); };
    bPlay.addEventListener('click', () => { big.hidden = true; if (playing) pause(true); else { userPaused = false; play(); } });
    bRe.addEventListener('click', () => { seek(0); userPaused = false; play(); });
    bMute.addEventListener('click', () => setSound(snd.muted));
    big.addEventListener('click', e => { e.stopPropagation(); setSound(true); seek(0); userPaused = false; play(); });
    view.addEventListener('click', () => { if (!big.hidden) return; if (playing) pause(true); else { userPaused = false; play(); } });
    bFull.addEventListener('click', () => { big.hidden = true; const d = document; if (d.fullscreenElement) d.exitFullscreen(); else if (root.requestFullscreen) root.requestFullscreen().catch(() => toast('Full screen is not available here')); });
    document.addEventListener('fullscreenchange', () => { bFull.textContent = document.fullscreenElement === root ? '⤡ Exit full screen' : '⤢ Full screen'; setTimeout(fit, 60); });
    root.addEventListener('keydown', e => {
      if (e.target.closest('input, select, textarea')) return;
      const k = e.key.toLowerCase();
      if (k === ' ') { e.preventDefault(); bPlay.click(); } else if (k === 'm') setSound(snd.muted); else if (k === 'f') bFull.click(); else if (k === 'r') bRe.click();
      else if (k === 'arrowright' || k === 'arrowleft') { e.preventDefault(); seek(T + (k === 'arrowright' ? 1 : -1)); }
      else if (k === '.' || k === ',') { pause(true); seek(T + (k === '.' ? 1 : -1) / fps); }
    });

    /* test / automation hook: dispatch new CustomEvent('mo-seek', { detail: seconds }) on the player */
    root.addEventListener('mo-seek', e => { pause(true); seek(+e.detail || 0); });
    api.go = t => { seek(t); userPaused = false; big.hidden = true; play(); };

    /* full screen: the film fills the screen and the controls fade away after 2 s without activity */
    let idleT = null;
    const wake = () => { root.classList.remove('idle'); clearTimeout(idleT); if (document.fullscreenElement === root) idleT = setTimeout(() => root.classList.add('idle'), 2000); };
    ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'wheel'].forEach(ev => root.addEventListener(ev, () => { if (document.fullscreenElement === root) wake(); }, { passive: true }));
    document.addEventListener('fullscreenchange', () => { if (document.fullscreenElement === root) wake(); else { clearTimeout(idleT); root.classList.remove('idle'); } });

    /* live props + Remotion composition code */
    const pp = $('#moProps');
    if (pp && F.props) {
      const head = el('div', 'mo-ph-h'); const dot = el('i', 'mo-pdot'); head.append(dot, el('b', null, 'Live props'), el('small', null, `<${F.id}Film /> · edits re-render the master timeline instantly`));
      const grid = el('div', 'mo-pgrid'), ctl = el('div', 'mo-pctl'), code = el('pre', 'mo-code');
      const wf = 1920, hf = Math.round(1920 * HH / W);
      const lit = v => typeof v === 'string' ? JSON.stringify(v) : String(v);
      const showCode = () => { code.textContent = `<Composition\n  id="${F.id}"\n  component={${F.id}Film}\n  durationInFrames={${total}}\n  fps={${fps}}\n  width={${wf}}\n  height={${hf}}\n  defaultProps={{\n${F.props.filter(p => p.type !== 'button').map(p => `    ${p.k}: ${lit(props[p.k])},`).join('\n')}\n  }}\n/>`; };
      let rb = null; const rebuild = () => { clearTimeout(rb); rb = setTimeout(build, 180); };
      const apply = (p, v) => { props[p.k] = v; showCode(); if (p.rebuild) rebuild(); else if (F.onProp) F.onProp(p.k, v, api); if (G && !reduced) G.fromTo(dot, { scale: 1.8 }, { scale: 1, duration: .5, ease: 'back.out(3)' }); };
      F.props.forEach(p => {
        const row = el('label', 'mo-prow'); row.append(el('span', null, p.label));
        if (p.type === 'range') {
          const i = el('input'); i.type = 'range'; i.min = p.min; i.max = p.max; i.step = p.step || 1; i.value = p.v; const b = el('b', null, p.fmt ? p.fmt(p.v) : p.v);
          i.addEventListener('input', () => { const v = +i.value; b.textContent = p.fmt ? p.fmt(v) : v; apply(p, v); }); row.append(i, b);
        } else if (p.type === 'select') {
          const s = el('select'); p.options.forEach(([v, l]) => { const o = el('option', null, l); o.value = v; s.append(o); }); s.value = p.v; s.addEventListener('change', () => apply(p, s.value)); row.append(s);
        } else if (p.type === 'chips') {
          const w = el('div', 'mo-chips'); w.setAttribute('role', 'radiogroup'); w.setAttribute('aria-label', p.label);
          p.options.forEach(([v, l, sw]) => { const c = el('button', 'mo-chip'); c.type = 'button'; c.setAttribute('role', 'radio'); c.setAttribute('aria-checked', String(v === p.v)); const d = el('i'); d.style.background = sw || v; c.append(d, el('span', null, l)); c.addEventListener('click', e => { e.preventDefault(); w.querySelectorAll('.mo-chip').forEach(x => x.setAttribute('aria-checked', String(x === c))); apply(p, v); }); w.append(c); });
          row.append(w);
        } else if (p.type === 'text') {
          const i = el('input'); i.type = 'text'; i.maxLength = p.max || 32; i.value = p.v; i.spellcheck = false; i.autocomplete = 'off';
          i.addEventListener('input', () => { const v = i.value.replace(/[<>{}`]/g, '').slice(0, p.max || 32); if (v !== i.value) i.value = v; apply(p, v.trim() || p.v); }); row.append(i);
        } else if (p.type === 'button') {
          const b = el('button', 'btn mo-pbtn', p.text); b.type = 'button'; b.addEventListener('click', e => { e.preventDefault(); p.run(api, { seek, play }); }); row.append(b);
        }
        ctl.append(row);
      });
      const meta = el('p', 'mo-pmeta', `${total} frames · ${fps} fps · ${wf}×${hf} · stock via Pexels`);
      const right = el('div'); right.append(code, meta); grid.append(ctl, right); pp.append(head, grid); showCode();
    }

    build();
    if (reduced) { seek(F.poster ?? dur * .5); }
    if ('IntersectionObserver' in window) new IntersectionObserver(es => {
      const e = es[es.length - 1]; vis = e.isIntersecting && e.intersectionRatio > .25;
      if (vis && !userPaused && !reduced) play(); else if (!vis && playing) pause(false);
      syncMedia(true);
    }, { threshold: [0, .25, .5] }).observe(view);
    else { vis = true; if (!reduced) play(); }
    return { api, seek, play, pause, get t() { return T; } };
  }
  H.motion = motion;

/* ---------- the film ---------- */
/* SKYLINE REEL — Cam 3 FPV Z-axis flythrough with banking · Frame 2 full-bleed aerial footage with tracked SVG callouts · Type 5 editorial serif split-apart */
const DEPTH = 1400;
const FILM = {
  id: 'SkylineReel', W: 1600, H: 670, dur: 18, fps: 60, seed: 3, poster: 12.6,
  alt: 'Skyline Reel: a luxury real estate motion film. Serif words split apart to open a window onto aerial footage, then a drone-style camera flies through layered shots of the property with gold callouts, a +312% ROI chart and a 78% occupancy gauge.',
  badge: 'FPV Z-DOLLY · LIVE',
  scenes: [[0, 'Living above'], [3.2, 'Sky deck'], [7, 'Solar facade'], [10.6, 'Returns'], [14.2, 'The Meridian']],
  tracks: {
    V1: [[0, 3.2, 'Window push'], [3.2, 6.9, 'Drift z+150'], [6.9, 8.5, 'Dive z 1400 · bank 8°'], [8.5, 10.4, 'Drift'], [10.4, 12, 'Dive · bank −8°'], [12, 14.1, 'Drift'], [14.1, 15.5, 'Dive to end card'], [15.5, 18, 'Hover']],
    V2: [[0, 3.2, 'Serif split-apart'], [3.4, 6.8, 'Callout · Sky Deck'], [7.6, 10.4, 'Callout · Solar Glass'], [10.6, 14, '+312% ROI · 78% ring'], [14.4, 18, 'End card split']],
    V3: [[0, 7, 'Aerial · coastal homes'], [6.6, 10.6, 'Glass facade'], [10.2, 14.4, 'Villa · pool'], [14.2, 18, 'Pool drone']],
    A1: [[0, 18, 'Pad · Cmaj9 → Am9 → Fmaj9'], [6.9, 8.5, 'Dive boom'], [10.4, 12, 'Dive boom'], [14.1, 15.5, 'Dive boom']]
  },
  props: [
    { k: 'name', label: 'Property', type: 'text', max: 20, v: 'THE MERIDIAN', rebuild: true },
    { k: 'roi', label: 'ROI', type: 'range', min: 80, max: 500, step: 1, v: 312, rebuild: true, fmt: v => '+' + v + '%' },
    { k: 'occ', label: 'Occupancy', type: 'range', min: 40, max: 99, step: 1, v: 78, rebuild: true, fmt: v => v + '%' },
    { k: 'bank', label: 'Bank angle', type: 'range', min: 0, max: 16, step: 1, v: 8, rebuild: true, fmt: v => v + '°' }
  ],
  build(api) {
    const { tl, stage, hud, split, G, el, svgEl, rnd } = api, P = api.props;
    const add = (p, cls, text) => api.add(p, 'div', cls, text);

    /* three full-bleed footage layers stacked in depth */
    const layer = (i, media) => { const L = add(stage, 'sk-L'); G.set(L, { z: -i * DEPTH }); const m = api.stock(media); m.classList.add('sk-m'); L.append(m); L.m = m; return L; };
    const L1 = layer(0, { video: api.PXV('15506451/15506451-hd_1280_720_24fps.mp4'), from: 0, to: 7.2, fallback: 'linear-gradient(170deg,#6d8fa8,#1d2b36 60%,#0b0d12)', label: 'PEXELS · AERIAL COAST' });
    const L2 = layer(1, { video: api.PXV('8783447/8783447-hd_1280_720_30fps.mp4'), photo: api.PX(7396896, 1280), from: 6.4, to: 10.8, fallback: 'linear-gradient(170deg,#7b93a8,#1b2530)', label: 'PEXELS · RDNE STOCK' });
    const L3 = layer(2, { video: api.PXV('4407791/4407791-hd_1366_720_25fps.mp4'), from: 9.9, to: 14.6, fallback: 'linear-gradient(170deg,#5f8a6c,#1d2b22)', label: 'PEXELS · JOASH' });
    [L2, L3].forEach(L => L.m.append(el('div', 'sk-vig')));

    /* gold callouts pinned to the footage */
    /* motion-tracked callouts: an invisible anchor rides on the 3D footage layer; every frame its projected
       screen position drives a gold SVG leader line in the HUD (video planes in a 3D context paint above siblings) */
    const cs = svgEl('svg', { viewBox: `0 0 ${api.W} ${api.H}`, class: 'sk-cs' }); hud.append(cs);
    const tracked = [];
    const callout = (L, x, y, dx, dy, title, sub, t0, t1) => {
      const anc = add(L, 'sk-anc'); anc.style.left = x + 'px'; anc.style.top = y + 'px';
      const g = svgEl('g', { class: 'sk-co' }); cs.append(g);
      const path = svgEl('path', { class: 'sk-line', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }), ring = svgEl('circle', { r: 9, class: 'sk-ring' }), dot = svgEl('circle', { r: 9, class: 'sk-dot' }); g.append(path, ring, dot);
      const lab = add(hud, 'sk-lab' + (dx < 0 ? ' l' : '')); lab.append(el('b', null, title), el('span', null, sub));
      tracked.push({ anc, g, path, ring, dot, lab, dx, dy });
      tl.set([g, lab], { autoAlpha: 0 }, 0); tl.set([g, lab], { autoAlpha: 1 }, t0);
      tl.fromTo(path, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: .8, ease: 'power2.inOut', immediateRender: false }, t0 + .2);
      tl.fromTo(dot, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: .4, ease: 'back.out(3)', immediateRender: false }, t0);
      tl.fromTo(ring, { scale: 1, opacity: 1, transformOrigin: '50% 50%' }, { scale: 4.5, opacity: 0, duration: 1.1, repeat: 2, ease: 'power2.out', immediateRender: false }, t0 + .3);
      tl.from(lab.children, { yPercent: 110, opacity: 0, duration: .6, stagger: .1, ease: 'expo.out' }, t0 + .75);
      tl.to(anc, { x: (rnd() - .5) * 70, y: -20 - rnd() * 16, duration: t1 - t0, ease: 'none' }, t0);
      tl.to([g, lab], { autoAlpha: 0, duration: .3 }, t1 - .3);
      api.cue(t0 + .2, a => { a.bell(1568, .07, 1.2); a.bell(2093, .05, 1); });
    };
    api.tick(() => {
      const rr = api.rig.getBoundingClientRect(), k = rr.width / api.W || 1;
      tracked.forEach(c => {
        if (c.g.style.visibility === 'hidden') return;
        const r = c.anc.getBoundingClientRect(), x = (r.left - rr.left) / k, y = (r.top - rr.top) / k, lx = x + c.dx, ly = y + c.dy, mx = lx - Math.sign(c.dx) * 40;
        c.path.setAttribute('d', `M${x.toFixed(1)} ${y.toFixed(1)} L${mx.toFixed(1)} ${ly.toFixed(1)} L${lx.toFixed(1)} ${ly.toFixed(1)}`);
        c.dot.setAttribute('cx', x.toFixed(1)); c.dot.setAttribute('cy', y.toFixed(1)); c.ring.setAttribute('cx', x.toFixed(1)); c.ring.setAttribute('cy', y.toFixed(1));
        c.lab.style.transform = `translate(${(c.dx < 0 ? lx : lx).toFixed(1)}px, ${(ly - 34).toFixed(1)}px)` + (c.dx < 0 ? ' translateX(-100%)' : '');
      });
    });
    callout(L1, 1080, 420, -300, -120, 'Penthouse Sky Deck', '4,200 sq ft · 360° terrace', 3.5, 6.9);
    callout(L2, 820, 470, 300, -130, 'Solar Glass Facade', 'Triple-glazed · −38% energy', 7.7, 10.4);
    callout(L3, 1010, 300, -330, -70, 'Infinity Edge Pool', '21 m heated · ocean side', 11, 14);

    /* Type 5: split-apart title opening a window onto the footage */
    const title = add(hud, 'sk-title'); const tL = add(title, 'sk-tw l'), tR = add(title, 'sk-tw r');
    split(tL, 'LIVING', 'word'); split(tR, 'ABOVE', 'word'); const tag = add(hud, 'sk-tag', P.name + ' · RESIDENCES');
    tl.fromTo(L1.m, { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(37% 50% 37% 50%)', duration: .01 }, 0);
    tl.from([tL, tR], { yPercent: 60, opacity: 0, filter: 'blur(10px)', duration: 1, stagger: .12, ease: 'expo.out' }, .1);
    tl.from(tag, { opacity: 0, letterSpacing: '0.9em', duration: 1.2, ease: 'expo.out' }, .4);
    tl.to(tL, { x: -470, duration: 1.3, ease: 'expo.inOut' }, 1.1); tl.to(tR, { x: 470, duration: 1.3, ease: 'expo.inOut' }, 1.1);
    tl.fromTo(L1.m, { clipPath: 'inset(37% 50% 37% 50%)' }, { clipPath: 'inset(37% 19% 37% 19%)', duration: 1.3, ease: 'expo.inOut', immediateRender: false }, 1.1);
    tl.fromTo(L1.m, { clipPath: 'inset(37% 19% 37% 19%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9, ease: 'expo.inOut', immediateRender: false }, 2.45);
    tl.to([tL, tR], { opacity: 0, scale: 1.4, duration: .7, ease: 'power2.in' }, 2.5); tl.to(tag, { opacity: 0, duration: .4 }, 2.6);
    api.cue(.05, a => a.pad([130.81, 164.81, 196, 246.94, 293.66], 4.5, .2)); api.cue(1.1, a => a.whoosh(1.3, .12));

    /* FPV camera: drift, dive through the frame, bank, settle */
    G.set(stage, { transformOrigin: '800px 335px' });
    const bank = P.bank;
    tl.to(stage, { z: 150, duration: 3.6, ease: 'sine.inOut' }, 3.2);
    const dive = (t, zTo, dir, out, next) => {
      tl.to(stage, { z: zTo, duration: 1.6, ease: 'power3.inOut' }, t);
      tl.to(stage, { rotateZ: bank * dir, rotateY: -3 * dir, duration: .8, ease: 'sine.inOut' }, t).to(stage, { rotateZ: 0, rotateY: 0, duration: .8, ease: 'sine.inOut' }, t + .8);
      tl.to(out, { opacity: 0, duration: .45, ease: 'power1.in' }, t + .5); tl.set(out, { visibility: 'hidden' }, t + .96);
      if (next) tl.fromTo(next, { opacity: .35 }, { opacity: 1, duration: 1.2, ease: 'power1.out', immediateRender: false }, t);
      api.cue(t, a => { a.whoosh(1.4, .2); a.osc(70, 1.6, { v: .35, to: 40, a: .6 }); });
    };
    G.set([L2, L3], { opacity: .35 }); tl.set(L2, { visibility: 'hidden' }, 0); tl.set(L2, { visibility: 'visible' }, 6.8); tl.set(L3, { visibility: 'hidden' }, 0); tl.set(L3, { visibility: 'visible' }, 10.3);
    dive(6.9, DEPTH, 1, L1, L2); tl.to(stage, { z: DEPTH + 150, duration: 1.9, ease: 'sine.inOut' }, 8.5);
    dive(10.4, DEPTH * 2, -1, L2, L3); tl.to(stage, { z: DEPTH * 2 + 150, duration: 2.1, ease: 'sine.inOut' }, 12);
    dive(14.1, DEPTH * 3, 1, L3, null);
    api.cue(6.9, a => a.pad([110, 130.81, 164.81, 196, 246.94], 4, .18)); api.cue(10.4, a => a.pad([87.31, 130.81, 174.61, 220, 261.63], 4, .18)); api.cue(14.2, a => a.pad([98, 146.83, 196, 246.94, 293.66], 4, .2));
    for (let t = 3.4; t < 14; t += 60 / 72 * 2) { const n = [523.25, 659.25, 783.99, 987.77][Math.floor(rnd() * 4)]; api.cue(t, a => a.pluck(n, 1.2, .06)); }

    /* guide eye: a gold light pulse leading the camera */
    const glint = add(hud, 'sk-glint'); G.set(glint, { x: 800, y: 335, scale: 0 });
    [[3.3, 1080, 420], [6.6, 800, 335], [7.6, 820, 470], [10.1, 800, 335], [10.9, 1010, 300], [13.8, 800, 335]].forEach(([t, x, y], i) => tl.to(glint, { x: (x - 950) * (1600 / 1900) + 800, y: (y - 450) * (670 / 900) * 1.2 + 335, scale: i % 2 ? 1.6 : .8, duration: .7, ease: 'expo.inOut' }, t));
    tl.to(glint, { scale: 0, duration: .4 }, 14.1);

    /* Claude-style data: +312% ROI bars and occupancy ring (HUD glass cards) */
    const roi = add(hud, 'sk-card sk-roi'); const rh = add(roi, 'sk-ch'); rh.append(el('span', null, 'PROJECTED ROI · 5 YR'), el('b', null, '+0%'));
    const bars = svgEl('svg', { viewBox: '0 0 300 130', class: 'sk-bars' }); const vals = [.22, .36, .5, .7, 1];
    const rects = vals.map((v, i) => { const r = svgEl('rect', { x: i * 62 + 4, y: 120 - v * 110, width: 44, height: v * 110, rx: 6, class: i === 4 ? 'hi' : '' }); bars.append(r); return r; });
    ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].forEach((y, i) => { const tx = svgEl('text', { x: i * 62 + 26, y: 129, 'text-anchor': 'middle' }); tx.textContent = y; bars.append(tx); });
    roi.append(bars);
    const occ = add(hud, 'sk-card sk-occ'); add(occ, 'sk-ch').append(el('span', null, 'OCCUPANCY · 12 MO'));
    const ring = svgEl('svg', { viewBox: '0 0 160 160', class: 'sk-gauge' }); const C = 2 * Math.PI * 64;
    ring.append(svgEl('circle', { cx: 80, cy: 80, r: 64, class: 'bg' })); const arc = svgEl('circle', { cx: 80, cy: 80, r: 64, class: 'fg', 'stroke-dasharray': C, 'stroke-dashoffset': C, transform: 'rotate(-90 80 80)' }); ring.append(arc);
    const pct = el('b', 'sk-pct', '0%'); occ.append(ring, pct);
    tl.from([roi, occ], { y: 80, opacity: 0, duration: .8, stagger: .15, ease: 'expo.out' }, 10.7);
    tl.from(rects, { attr: { y: 120, height: 0 }, duration: .9, stagger: .1, ease: 'expo.out' }, 11);
    api.count(rh.lastChild, 0, P.roi, 11, 1.6, v => '+' + Math.round(v) + '%', 'expo.out');
    tl.to(arc, { attr: { 'stroke-dashoffset': C * (1 - P.occ / 100) }, duration: 1.6, ease: 'expo.out' }, 11.2);
    api.count(pct, 0, P.occ, 11.2, 1.6, v => Math.round(v) + '%', 'expo.out');
    tl.to([roi, occ], { y: 60, opacity: 0, duration: .5, ease: 'power2.in' }, 13.8);
    for (let t = 11; t < 12.4; t += .1) api.cue(t, a => a.osc(1046.5 + (t - 11) * 600, .03, { v: .03 }));

    /* end card: alabaster invert, the name splits apart over the pool */
    const end = add(hud, 'sk-end'); const win = api.stock({ video: api.PXV('16580831/16580831-hd_1280_720_30fps.mp4'), photo: api.PX(16566142, 1280), from: 14.2, to: 18, cls: 'sk-win', fallback: 'linear-gradient(170deg,#6aa6b8,#2b4a52)', label: 'PEXELS · RAMON MARTINEZ' });
    end.append(win); const words = P.name.split(' '); const a1 = words.length > 1 ? words.slice(0, Math.ceil(words.length / 2)).join(' ') : P.name, a2 = words.length > 1 ? words.slice(Math.ceil(words.length / 2)).join(' ') : '';
    const eL = add(end, 'sk-ew l', a1), eR = add(end, 'sk-ew r', a2); const rule = add(end, 'sk-rule'); const price = add(end, 'sk-price', 'Residences from $4.2M · private viewings by appointment');
    tl.set(end, { autoAlpha: 0 }, 0); tl.to(end, { autoAlpha: 1, duration: .5, ease: 'power2.inOut' }, 14.3);
    tl.to(api.view, { '--sbg': '#F4F0EA', duration: .5, ease: 'power2.inOut' }, 14.3);
    tl.fromTo(win, { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', immediateRender: false }, 15);
    tl.from([eL, eR], { opacity: 0, yPercent: 50, duration: .9, stagger: .1, ease: 'expo.out' }, 14.4);
    tl.fromTo(eL, { x: 300 }, { x: 0, duration: 1.4, ease: 'expo.inOut', immediateRender: false }, 15); tl.fromTo(eR, { x: -300 }, { x: 0, duration: 1.4, ease: 'expo.inOut', immediateRender: false }, 15);
    tl.from(rule, { scaleX: 0, duration: 1.2, ease: 'expo.inOut' }, 15.6); tl.from(price, { opacity: 0, y: 16, duration: .8, ease: 'expo.out' }, 16);
    api.cue(15, a => a.whoosh(1.2, .14)); api.cue(15.6, a => { a.bell(783.99, .1, 2.4); a.bell(1174.66, .07, 2.6); });
  }
};
function demo(root, H) { H.motion(root, FILM); }

  demo(document.getElementById('mo'), H);
})();
