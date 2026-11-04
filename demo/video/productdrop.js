/* Product Drop — Motion-graphics film page: DOM + SVG + GSAP master timeline with Pexels stock media (Bazozo Studio).
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
/* PRODUCT DROP — Cam 2 Katana whip-pan + elastic snap zoom · Bg 3 perspective horizon grid · Type 1 variable stretch slam · Frame 3 diagonal clip-path splits */
const BEAT = 60 / 128;
const FILM = {
  id: 'ProductDrop', dur: 14, fps: 60, seed: 5, poster: 6.9,
  alt: 'Product Drop: a sneaker launch motion film. THE WAIT IS OVER slams onto a lime horizon grid, three streetwear clips slice in diagonally on the beat, a 3D spec card spins, SEAMLESS MOVEMENT stretches across a spinning sneaker and a launch countdown ticks.',
  badge: 'KATANA WHIP CAM · LIVE',
  scenes: [[0, 'Wait is over'], [6 * BEAT, 'Diagonal cuts'], [12 * BEAT, 'Spec card'], [18 * BEAT, 'Seamless'], [24 * BEAT, 'Countdown']],
  tracks: {
    V1: [[0, 6 * BEAT, 'Push + slam'], [6 * BEAT, 12 * BEAT, 'Whip −100% · snap back.out(2)'], [12 * BEAT, 18 * BEAT, 'Whip · orbit card'], [18 * BEAT, 24 * BEAT, 'Whip · elastic zoom'], [24 * BEAT, 14, 'Whip · lock-off']],
    V2: [[0, 6 * BEAT, 'THE WAIT IS OVER'], [6 * BEAT, 12 * BEAT, 'DROP 07'], [12 * BEAT, 18 * BEAT, '3D spec card'], [18 * BEAT, 24 * BEAT, 'SEAMLESS MOVEMENT'], [24 * BEAT, 14, 'Countdown']],
    V3: [[6 * BEAT, 12 * BEAT, '3 clips · diagonal'], [12 * BEAT, 18 * BEAT, 'Product photos'], [18 * BEAT, 24 * BEAT, 'Spin clip']],
    A1: [[0, 6 * BEAT, 'Slam hits'], [6 * BEAT, 22 * BEAT, '128 BPM · 808'], [22 * BEAT, 24 * BEAT, 'Riser'], [24 * BEAT, 14, 'Tick + drop']]
  },
  props: [
    { k: 'colorway', label: 'Colourway', type: 'chips', v: '#CCFF00', options: [['#CCFF00', 'Acid lime'], ['#FF6A00', 'Volt orange'], ['#7DF9FF', 'Ice'], ['#FF2E93', 'Hot pink']] },
    { k: 'headline', label: 'Headline', type: 'text', max: 22, v: 'THE WAIT IS OVER', rebuild: true },
    { k: 'drop', label: 'Drop time', type: 'select', v: 'FRI 10:00 IST', rebuild: true, options: [['FRI 10:00 IST', 'Friday 10:00 IST'], ['SAT 09:00 GMT', 'Saturday 09:00 GMT'], ['SUN 12:00 EST', 'Sunday 12:00 EST']] },
    { k: 'whip', label: 'Whip speed', type: 'range', min: .2, max: .6, step: .05, v: .35, rebuild: true, fmt: v => v.toFixed(2) + ' s' }
  ],
  onProp(k, v, api) { if (k === 'colorway') { api.view.style.setProperty('--pd-acc', v); const n = api.stage.querySelector('.pd-cw b'); if (n) n.textContent = ({ '#CCFF00': 'ACID LIME', '#FF6A00': 'VOLT ORANGE', '#7DF9FF': 'ICE', '#FF2E93': 'HOT PINK' })[v] || v; } },
  build(api) {
    const { tl, stage, hud, split, G, el, svgEl, rnd, rig, shaker } = api, P = api.props, B = BEAT;
    const add = (p, cls, text) => api.add(p, 'div', cls, text);
    const panel = i => { const p = add(stage, 'pd-p'); p.style.left = i * 1600 + 'px'; return p; };
    /* type overlay: a flat plane in the HUD that copies the camera every frame, so slams always sit above the footage */
    const ov = add(hud, 'pd-ov'), ovs = add(ov, 'pd-ovs');
    const opanel = i => { const p = add(ovs, 'pd-p'); p.style.left = i * 1600 + 'px'; return p; };
    api.tick(() => { ov.style.transform = shaker.style.transform; ovs.style.transform = stage.style.transform; ovs.style.transformOrigin = stage.style.transformOrigin; });

    /* Bg 3: perspective floor grid scrolling toward the viewer (behind the camera stage) */
    rig.querySelectorAll('.pd-hz').forEach(n => n.remove());
    const hz = el('div', 'pd-hz'), floor = el('div', 'pd-floor'), tiles = el('div', 'pd-tiles'), sky = el('div', 'pd-sky'), fade = el('div', 'pd-fade'); floor.append(tiles); hz.append(sky, floor, fade); rig.insertBefore(hz, shaker);
    tl.fromTo(tiles, { y: -120 }, { y: 0, duration: 1, ease: 'none', repeat: 13 }, 0);

    /* Katana camera: whip-pan with horizontal smear, then elastic snap-in */
    const smear = el('div', 'pd-smear'); hud.append(smear); G.set(smear, { opacity: 0 });
    const whip = (t, i) => {
      const d = P.whip;
      tl.to(stage, { x: -i * 1600, duration: d, ease: 'power4.inOut' }, t - d * .55);
      tl.fromTo(shaker, { scaleX: 1 }, { scaleX: 1.15, duration: d * .5, ease: 'power2.in', immediateRender: false }, t - d * .55);
      tl.to(shaker, { scaleX: 1, duration: d * .45, ease: 'power2.out' }, t - d * .05);
      tl.fromTo(smear, { opacity: 0, x: 400 }, { opacity: 1, x: 0, duration: d * .5, ease: 'power2.in', immediateRender: false }, t - d * .55);
      tl.to(smear, { opacity: 0, x: -400, duration: d * .5, ease: 'power2.out' }, t - d * .05);
      tl.fromTo(stage, { scale: 1.16 }, { scale: 1, duration: .55, ease: 'back.out(2)', immediateRender: false }, t);
      api.cue(t - d * .55, a => a.whoosh(d + .05, .3));
    };
    G.set(stage, { transformOrigin: '800px 450px' });
    tl.to(stage, { transformOrigin: '2400px 450px', duration: .01 }, 6 * B - .2); tl.to(stage, { transformOrigin: '4000px 450px', duration: .01 }, 12 * B - .2);
    tl.to(stage, { transformOrigin: '5600px 450px', duration: .01 }, 18 * B - .2); tl.to(stage, { transformOrigin: '7200px 450px', duration: .01 }, 24 * B - .2);

    /* stretch slam helper (Type 1) */
    const slam = (n, t, hit = true) => { tl.fromTo(n, { scaleX: .4, scaleY: 1.12, opacity: 0 }, { scaleX: 1.3, scaleY: .94, opacity: 1, duration: .11, ease: 'power4.out', immediateRender: true }, t).to(n, { scaleX: 1, scaleY: 1, duration: .36, ease: 'back.out(3)' }, t + .11); if (hit) api.cue(t, a => a.impact(.55)); };

    /* P0: THE WAIT IS OVER */
    const p0 = panel(0); const words = P.headline.split(' ').filter(Boolean);
    const h0 = add(p0, 'pd-h0'); const half = Math.ceil(words.length / 2);
    const lines = [words.slice(0, half), words.slice(half)].filter(l => l.length).map(l => { const ln = add(h0, 'pd-ln'); return l.map(w => add(ln, 'pd-w', w)); });
    const all = lines.flat(); h0.setAttribute('aria-label', P.headline);
    all.forEach((w, i) => slam(w, (i + 1) * B * (4 / Math.max(4, all.length))));
    const meta0 = add(p0, 'pd-meta'); meta0.append(el('span', null, 'DROP 07'), el('span', null, '·'), el('b', null, P.drop));
    tl.from(meta0, { y: 30, opacity: 0, duration: .4, ease: 'expo.out' }, 2.3);
    tl.set(api.view, { '--pd-bg': P.colorway, '--pd-ink': '#050505', '--pd-l2': '#050505' }, 4 * B);
    tl.set(api.view, { '--pd-bg': '#050505', '--pd-ink': '#F4F4F0', '--pd-l2': 'var(--pd-acc)' }, 4 * B + .22);
    api.shake(4 * B, .3, 14, 34);

    /* P1: three clips sliced diagonally on the beat (Frame 3) */
    const p1 = panel(1), o1 = opanel(1); whip(6 * B, 1);
    const shapes = [['0% 0%', '40% 0%', '28% 100%', '0% 100%'], ['42% 0%', '72% 0%', '60% 100%', '30% 100%'], ['74% 0%', '100% 0%', '100% 100%', '62% 100%']];
    const clips = [['3890371/3890371-hd_1280_720_30fps.mp4', '01 / KNIT', 'linear-gradient(135deg,#7a2d1c,#121212)', 'PEXELS · WESTARMONEY'], ['6962324/6962324-hd_1280_720_25fps.mp4', '02 / NIGHT', 'linear-gradient(135deg,#3b1f6b,#0a0a0a)', 'PEXELS · IVAN S'], ['7644257/7644257-hd_1280_720_24fps.mp4', '03 / STREET', 'linear-gradient(135deg,#2b3b44,#0a0a0a)', 'PEXELS · YAROSLAV SHURAEV']];
    clips.forEach(([v, lab, fb, cr], i) => {
      const m = api.stock({ video: api.PXV(v), from: 6 * B, to: 12 * B, cls: 'pd-slice', fallback: fb, label: cr }); p1.append(m);
      const sh = shapes[i], mid = sh.map(pt => { const x = parseFloat(pt); const cx = (parseFloat(sh[0]) + parseFloat(sh[1])) / 2; return `${(x + cx) / 2}% ${pt.split(' ')[1]}`; });
      const t = (7 + i) * B;
      tl.fromTo(m, { clipPath: `polygon(${mid.join(',')})`, y: i % 2 ? 260 : -260 }, { clipPath: `polygon(${sh.join(',')})`, y: 0, duration: .42, ease: 'expo.out', immediateRender: true }, t);
      const tag = add(o1, 'pd-tag', lab); tag.style.left = (parseFloat(sh[0]) * 16 + 40) + 'px';
      tl.from(tag, { y: 40, opacity: 0, duration: .3, ease: 'back.out(3)' }, t + .1);
      api.cue(t, a => a.snare(.3));
    });
    const d07 = add(o1, 'pd-d07', 'DROP 07'); slam(d07, 10 * B);
    tl.to(p1.querySelectorAll('.pd-slice'), { x: (i) => (i - 1) * 26, duration: .35, ease: 'expo.out' }, 10 * B);

    /* P2: 3D rotating spec card + colourway */
    const p2 = panel(2); whip(12 * B, 2);
    const left = add(p2, 'pd-l'); const lw = ['ENGINEERED', 'FOR', 'NOISE'].map(w => add(left, 'pd-lw', w)); lw.forEach((w, i) => slam(w, 12 * B + .25 + i * B * .5, i === 0));
    const scene = add(p2, 'pd-card3'), card = add(scene, 'pd-card');
    const front = add(card, 'pd-face pd-front'), back = add(card, 'pd-face pd-back');
    const ph = api.stock({ photo: api.PX(7460139, 900), cls: 'pd-shoe', fallback: 'linear-gradient(160deg,#2a2a2a,#0a0a0a)', alt: 'Black sneaker with red details' }); front.append(ph); add(ph, 'pd-tint');
    const fn = add(front, 'pd-fn'); fn.append(el('small', null, 'DROP 07 · AIR-KNIT'), el('b', null, 'SEAMLESS 07'));
    add(back, 'pd-bh', 'SPEC SHEET');
    [['Weight', '287 g'], ['Heel drop', '8 mm'], ['Upper', 'Engineered knit'], ['Midsole', 'Phylon foam'], ['Outsole', 'Gum rubber'], ['Pairs', '1,200 only']].forEach(([k, v]) => { const r = add(back, 'pd-row'); r.append(el('span', null, k), el('b', null, v)); });
    const cw = add(back, 'pd-cw'); cw.append(el('i'), el('b', null, 'ACID LIME'));
    G.set(card, { rotateY: -18, rotateX: 6 });
    tl.from(scene, { z: -900, rotateZ: -10, opacity: 0, duration: .6, ease: 'expo.out' }, 12 * B);
    tl.to(card, { rotateY: 342, duration: 2.6, ease: 'power2.inOut' }, 12 * B + .2);
    const side = api.stock({ photo: api.PX(5413294, 640), cls: 'pd-side', fallback: 'linear-gradient(160deg,#eee,#bbb)', alt: 'High-top sneakers' }); p2.append(side); add(side, 'pd-tint');
    tl.from(side, { x: 300, rotate: 8, opacity: 0, duration: .5, ease: 'back.out(2)' }, 13 * B);
    api.cue(12 * B + .2, a => a.riser(.6, .06));

    /* P3: SEAMLESS MOVEMENT over a spinning-shoe clip */
    const p3 = panel(3), o3 = opanel(3); whip(18 * B, 3);
    const spin = api.stock({ video: api.PXV('4380323/4380323-hd_720_1280_60fps.mp4'), from: 18 * B, to: 24 * B, cls: 'pd-spin', fallback: 'linear-gradient(160deg,#5b1a1a,#0a0a0a)', label: 'PEXELS · DANNY ORLOFF' }); p3.append(spin);
    tl.fromTo(spin, { clipPath: 'inset(50% 0% 50% 0% round 40px)' }, { clipPath: 'inset(0% 0% 0% 0% round 40px)', duration: .5, ease: 'expo.out', immediateRender: true }, 18 * B + .05);
    const s1 = add(o3, 'pd-big a', 'SEAMLESS'), s2 = add(o3, 'pd-big b', 'MOVEMENT'); const pill = add(o3, 'pd-pill', 'ONE-PIECE KNIT · ZERO SEAMS');
    slam(s1, 19 * B); slam(s2, 20 * B);
    tl.from(pill, { scaleX: 0, transformOrigin: '0 50%', duration: .4, ease: 'expo.out' }, 21 * B);
    tl.fromTo([s1, s2], { x: 0 }, { x: (i) => i ? 26 : -26, duration: 2, ease: 'none' }, 19 * B + .4);
    tl.fromTo(stage, { scale: 1 }, { scale: 1.07, duration: 1.2, ease: 'sine.inOut', immediateRender: false }, 21 * B);
    api.cue(22 * B, a => a.riser(2 * B, .14));

    /* P4: countdown */
    const p4 = panel(4); whip(24 * B, 4);
    const ct = add(p4, 'pd-ct'); const ctl = add(ct, 'pd-ctl', 'DROPS IN');
    const blocks = [['03', 'DAYS'], ['12', 'HRS'], ['45', 'MIN'], ['09', 'SEC']].map(([v, l]) => { const b = add(ct, 'pd-blk'); const n = el('b', null, v); b.append(n, el('small', null, l)); return n; });
    const when = add(p4, 'pd-when', P.drop); const cta = add(p4, 'pd-cta'); cta.append(el('span', null, 'NOTIFY ME'), el('i', null, '→'));
    tl.from(ctl, { y: 30, opacity: 0, duration: .3 }, 24 * B + .15);
    tl.from(ct.querySelectorAll('.pd-blk'), { scaleX: .4, opacity: 0, duration: .35, stagger: .07, ease: 'back.out(3)' }, 24 * B + .25);
    slam(when, 25 * B + .1, false);
    tl.from(cta, { scale: 0, duration: .5, ease: 'back.out(2.4)' }, 26 * B);
    tl.to(cta, { boxShadow: '0 0 0 14px rgba(255,255,255,0), 0 0 80px rgba(255,255,255,.45)', duration: .4, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 26 * B + .5);
    const T0 = 24 * B; let lastS = -1;
    api.tick(t => { if (t < T0) { if (lastS !== -2) { blocks[3].textContent = '09'; blocks[2].textContent = '45'; lastS = -2; } return; } const s = Math.floor(t - T0); if (s === lastS) return; lastS = s; const total = 9 + 45 * 60 - s, ss = ((total % 60) + 60) % 60, mm = Math.floor(total / 60); blocks[3].textContent = String(ss).padStart(2, '0'); blocks[2].textContent = String(mm).padStart(2, '0'); });
    for (let s = 1; s < 3; s++) { tl.fromTo(blocks[3].parentNode, { scaleY: 1.25 }, { scaleY: 1, duration: .3, ease: 'back.out(3)', immediateRender: false }, T0 + s); api.cue(T0 + s, a => a.osc(1200, .05, { type: 'square', v: .05, lp: 3000 })); }
    api.cue(T0, a => a.drop(.9));

    hud.append(smear);
    /* 128 BPM 808 + hats */
    for (let i = 0; i < 30; i++) { const t = i * B; if (t >= 14) break; if (i >= 6 && i < 22 || i >= 24) api.cue(t, a => a.kick(.75)); if (i >= 6 && i < 22 && i % 2) api.cue(t, a => a.clap(.22)); if (i >= 6 && i < 22) { api.cue(t + B / 2, a => a.hat(.06)); if (i % 4 === 0) api.cue(t, a => a.osc(55, B * 1.8, { v: .45, to: 46 })); } }
  }
};
function demo(root, H) { H.motion(root, FILM); }

  demo(document.getElementById('mo'), H);
})();
