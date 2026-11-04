/* Founders — Motion-graphics film page: DOM + SVG + GSAP master timeline with Pexels stock media (Bazozo Studio).
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
/* FOUNDERS — Cam 1 Tally isometric orbit · Bg 1 dot-matrix + cursor spotlight · Type 3 slot-machine cylinder roll · Frame 1 3D glass mockups */
const TABS = [['Payouts', '$3,912'], ['Storefront', '$1,284'], ['Social ads', '-$412'], ['Search ads', '-$200'], ['Wallet', '$96'], ['Shipping', '-$218'], ['Email', '$0'], ['Sales tax', '-$61'], ['Refunds', '-$38'], ['Marketplace', '$402'], ['Video ads', '-$155'], ['Bank feed', '$2,041'], ['Spreadsheet', '#REF!'], ['Invoices', '7 due']];
const money = v => '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FILM = {
  id: 'Founders', dur: 16, fps: 60, seed: 11, poster: 10.4,
  alt: 'Founders: a SaaS motion film. Fourteen revenue tabs orbit in 3D, collapse into one logo, and a counter rolls from $1,284 gross to $412 profit on a phone lock screen at 7:02 AM.',
  badge: 'TALLY ISO RIG · LIVE',
  scenes: [[0, '11:46 PM'], [2.4, '14 tabs open'], [5.6, 'Clean screen'], [7.4, 'One logo'], [9.2, '$1,284'], [11.6, 'Red slash'], [13.6, '7:02 AM']],
  tracks: {
    V1: [[0, 2.4, 'Slow push-in'], [2.4, 5.6, 'Iso orbit 18° / −12°'], [5.6, 7.4, 'Zoom 2.1× expo'], [7.4, 11.6, 'Locked + drift'], [11.6, 13.6, 'Pan to ledger'], [13.6, 16, 'Orbit to phone']],
    V2: [[0, 2.4, '11:46 PM roll'], [2.4, 5.6, '14 TABS OPEN'], [5.6, 9.2, 'Particles → logo'], [9.2, 11.6, '$1,284 counter'], [11.6, 13.6, 'Red slash'], [13.6, 16, '7:02 AM lock screen']],
    V3: [[0, 2.6, 'Late-night desk'], [13.4, 16, 'Coffee + laptop · office']],
    A1: [[0, 2.4, 'Clock ticks'], [2.4, 7.2, '110 BPM pulse'], [7.2, 8.7, 'Riser + chime'], [9.2, 13.6, 'Counter + slash'], [13.6, 16, 'Notification']]
  },
  props: [
    { k: 'gross', label: 'Gross revenue', type: 'range', min: 900, max: 4000, step: 1, v: 1284, rebuild: true, fmt: v => '$' + v.toLocaleString('en-US') },
    { k: 'adSpend', label: 'Ad spend', type: 'range', min: 100, max: 800, step: 1, v: 612, rebuild: true, fmt: v => '$' + v },
    { k: 'wake', label: 'Lock-screen time', type: 'text', max: 8, v: '7:02 AM', rebuild: true },
    { k: 'accent', label: 'Brand accent', type: 'chips', v: '#6366F1', options: [['#6366F1', 'Indigo'], ['#0EA5E9', 'Sky'], ['#A855F7', 'Violet'], ['#F43F5E', 'Rose']] }
  ],
  onProp(k, v, api) { if (k === 'accent') api.view.style.setProperty('--fd-acc', v); },
  build(api) {
    const { tl, stage, hud, split, G, el, svgEl, rnd } = api, P = api.props;
    const fee = Math.round(P.gross * (41.2 / 1284) * 100) / 100, ship = 218.8, net = Math.max(0, Math.round((P.gross - fee - P.adSpend - ship) * 100) / 100);
    const add = (p, cls, text) => api.add(p, 'div', cls, text);

    /* Bg 1: dot-matrix grid + spotlight that follows the guide cursor */
    const grid = add(stage, 'fd-grid'), spot = add(stage, 'fd-spot');
    const cursor = add(stage, 'fd-cursor'); const cs = svgEl('svg', { viewBox: '0 0 40 40', width: 46, height: 46 });
    cs.append(svgEl('path', { d: 'M6 4 L6 32 L13 25 L18 36 L23 34 L18 23 L28 23 Z', fill: '#fff', stroke: '#0B0C10', 'stroke-width': 2, 'stroke-linejoin': 'round' })); cursor.append(el('i', 'fd-comet'), cs);
    const eye = (at, x, y, d = .9, ease = 'expo.inOut') => { tl.to(cursor, { x, y, duration: d, ease }, at); tl.to(spot, { x: x - 450, y: y - 450, duration: d * 1.2, ease: 'power2.inOut' }, at); };
    G.set(cursor, { x: 1180, y: 300 }); G.set(spot, { x: 730, y: -150 });

    /* scene A: 11:46 PM */
    const A = add(stage, 'fd-s fd-a');
    const day = add(A, 'fd-kick', 'MON · PAYOUT NIGHT · 14 TABS');
    const clock = add(A, 'fd-clock'); const cch = split(clock, '11:46 PM');
    const sub = add(A, 'fd-sub'); const sw = split(sub, 'Reconciling revenue. Again.', 'word');
    const mac = add(A, 'fd-mac'); const bar = add(mac, 'fd-bar'); bar.append(el('i'), el('i'), el('i'), el('span', null, 'revenue-final-v9.xlsx — 14 tabs'));
    const scr = api.stock({ video: api.PXV('20563164/20563164-hd_1280_720_30fps.mp4'), from: 0, to: 2.6, cls: 'fd-macv', fallback: 'radial-gradient(circle at 50% 30%, #2a2f4a, #07080c 70%)', label: 'PEXELS · ONKAR MEHTA' }); mac.append(scr); G.set(mac, { rotateY: -14, rotateX: 6 });
    tl.from(cch, { rotateX: -100, yPercent: 60, opacity: 0, transformOrigin: '50% 50% -60px', stagger: .055, duration: .8, ease: 'back.out(2.4)' }, .15);
    tl.from(day, { opacity: 0, y: 14, duration: .5 }, .1);
    tl.from(sw, { rotateX: -90, opacity: 0, stagger: .08, duration: .6, ease: 'back.out(2)' }, .9);
    tl.from(mac, { rotateY: -48, rotateX: 14, z: -500, opacity: 0, duration: 1.2, ease: 'expo.out' }, .25);
    tl.to(stage, { scale: 1.06, duration: 2.4, ease: 'sine.inOut' }, 0);
    eye(.4, 1080, 380, 1.4);
    for (let t = .5; t < 2.4; t += .5) api.cue(t, a => a.click(.12));
    api.cue(.05, a => a.pad([110, 165, 220], 2.6, .12));
    tl.to([...cch, ...sw, day], { rotateX: 90, opacity: 0, stagger: .015, duration: .35, ease: 'power2.in' }, 2.15);
    tl.to(mac, { z: -900, rotateY: 30, opacity: 0, duration: .6, ease: 'power3.in' }, 2.1);

    /* scene B: 14 tabs orbit in isometric 3D */
    const B = add(stage, 'fd-s fd-b');
    const orbit = add(B, 'fd-orbit'); const cards = [];
    TABS.forEach(([n, v], i) => {
      const slot = add(orbit, 'fd-slot'); slot.style.transform = `rotateY(${i * 360 / TABS.length}deg) translateZ(560px)`;
      const c = add(slot, 'fd-card' + (v.startsWith('-') || v.startsWith('#') ? ' bad' : ''));
      const top = add(c, 'fd-ct'); top.append(el('i'), el('span', null, n)); add(c, 'fd-cv', v);
      const sp = svgEl('svg', { viewBox: '0 0 120 28', class: 'fd-spark' }); let d = 'M0 ' + (14 + rnd() * 10);
      for (let x = 12; x <= 120; x += 12) d += ` L${x} ${4 + rnd() * 20}`; sp.append(svgEl('path', { d, fill: 'none' })); c.append(sp); cards.push(c);
    });
    const tabsT = add(B, 'fd-tabs'); const num = add(tabsT, 'fd-num'); const roll14 = digits(num, '14'); const tw = add(tabsT, 'fd-tw'); const twc = split(tw, 'TABS OPEN');
    tl.set(B, { autoAlpha: 1 }, 2.3);
    tl.to(stage, { rotateX: 18, rotateZ: -12, scale: .92, duration: 1.1, ease: 'expo.inOut' }, 2.3);
    tl.from(cards, { scale: 0, opacity: 0, duration: .45, stagger: .07, ease: 'back.out(2.2)' }, 2.45);
    tl.fromTo(orbit, { rotateY: 0 }, { rotateY: -210, duration: 3.4, ease: 'power1.inOut' }, 2.4);
    spinTo(roll14, '14', 2.5, 1.2);
    tl.from(twc, { rotateX: -100, opacity: 0, transformOrigin: '50% 50% -30px', stagger: .04, duration: .7, ease: 'back.out(2.4)' }, 2.75);
    TABS.forEach((_, i) => api.cue(2.45 + i * .07, a => a.click(.09)));
    for (let t = 2.4; t < 7.3; t += 60 / 110) { api.cue(t, a => a.kick(.55)); api.cue(t + 30 / 110, a => a.hat(.05)); }
    api.shake(4.6, .35, 6, 30);
    eye(2.6, 820, 620, .9); eye(3.8, 520, 330, .9); eye(4.8, 800, 450, .8);
    tl.to(orbit, { scale: 2.6, opacity: 0, duration: .55, ease: 'power3.in' }, 5.45);
    tl.to(tabsT, { scale: .4, opacity: 0, duration: .4, ease: 'power3.in' }, 5.45);
    tl.set(B, { autoAlpha: 0 }, 6.1);

    /* scene C: flash-invert to a clean white screen */
    const C = add(stage, 'fd-s fd-c');
    const screen = add(C, 'fd-screen'); const sb = add(screen, 'fd-bar'); sb.append(el('i'), el('i'), el('i'), el('span', null, 'app.ledgr.io / today'));
    const sc = add(screen, 'fd-sc'); const close = add(sc, 'fd-close'); const clc = split(close, 'Close the tabs.');
    api.flash(5.6, '#FFFFFF', .5);
    tl.to(api.view, { '--sbg': '#FFFFFF', '--stx': '#0B0C10', '--dot': 'rgba(11,12,16,.16)', duration: .12, ease: 'none' }, 5.6);
    tl.set(C, { autoAlpha: 1 }, 5.6);
    tl.to(stage, { rotateX: 0, rotateZ: 0, scale: 2.1, duration: 1.3, ease: 'expo.inOut' }, 5.65);
    tl.from(screen, { z: -600, opacity: 0, duration: .8, ease: 'expo.out' }, 5.6);
    tl.from(clc, { rotateX: -100, opacity: 0, transformOrigin: '50% 50% -20px', stagger: .035, duration: .6, ease: 'back.out(2.6)' }, 6.1);
    api.cue(5.6, a => { a.impact(.6); a.whoosh(.6, .2); });
    eye(5.7, 860, 470, .8);
    tl.to(clc, { opacity: 0, y: -20, stagger: .01, duration: .3 }, 7.15);

    /* scene D: particles converge into one logo */
    const D = add(stage, 'fd-s fd-d'); const parts = []; const N = api.lite ? 28 : 46;
    for (let i = 0; i < N; i++) { const p = add(D, 'fd-p' + (i % 3 ? '' : ' e')); parts.push(p); }
    const logo = add(D, 'fd-logo'); const mk = svgEl('svg', { viewBox: '0 0 64 64', width: 64, height: 64 });
    mk.append(svgEl('rect', { x: 2, y: 2, width: 60, height: 60, rx: 18, class: 'fd-lk' }), svgEl('path', { d: 'M22 16 V44 H44', fill: 'none', stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }), svgEl('circle', { cx: 44, cy: 22, r: 5, fill: '#10B981' }));
    logo.append(mk); const wm = el('b', 'fd-wm'); logo.append(wm); const wmc = split(wm, 'Ledgr');
    tl.set(D, { autoAlpha: 1 }, 7.2);
    parts.forEach((p, i) => {
      const a = rnd() * Math.PI * 2, r = 380 + rnd() * 420, ang = i / N * Math.PI * 2;
      tl.fromTo(p, { x: Math.cos(a) * r, y: Math.sin(a) * r * .6, scale: .4 + rnd(), opacity: 0 }, { x: Math.cos(ang) * 46, y: Math.sin(ang) * 46, scale: .6, opacity: 1, duration: 1 + rnd() * .3, ease: 'expo.inOut' }, 7.25 + rnd() * .2);
      tl.to(p, { x: 0, y: 0, scale: 0, duration: .3, ease: 'power3.in' }, 8.55);
    });
    tl.from(logo.firstChild, { scale: 0, rotation: -120, duration: .8, ease: 'back.out(2.6)' }, 8.6);
    tl.from(wmc, { rotateX: -100, opacity: 0, transformOrigin: '50% 50% -18px', stagger: .05, duration: .6, ease: 'back.out(2.4)' }, 8.75);
    tl.to(stage, { scale: 1.9, duration: 1.8, ease: 'sine.inOut' }, 7.4);
    api.cue(7.2, a => a.riser(1.35, .12)); api.cue(8.6, a => a.chime(.16));
    eye(7.3, 800, 445, .6);
    tl.to(logo, { y: -150, scale: .55, duration: .7, ease: 'expo.inOut' }, 9.1);

    /* scene E: slot-machine counter to the gross */
    const E = add(stage, 'fd-s fd-e');
    const lab = add(E, 'fd-lab', 'GROSS REVENUE · YESTERDAY'); const big = add(E, 'fd-big'); const grossTxt = '$' + P.gross.toLocaleString('en-US');
    const rg = digits(big, grossTxt);
    const chart = svgEl('svg', { viewBox: '0 0 520 90', class: 'fd-chart' }); const cp = svgEl('path', { d: 'M0 80 C60 70 90 74 130 58 S210 64 250 40 S330 46 380 26 S470 22 520 6', fill: 'none' }); chart.append(cp); E.append(chart);
    tl.set(E, { autoAlpha: 1 }, 9.15);
    tl.to(stage, { scale: 1.25, duration: 1, ease: 'expo.inOut' }, 9.1);
    tl.from(lab, { y: 20, opacity: 0, duration: .5 }, 9.35);
    spinTo(rg, grossTxt, 9.3, 1.5); tl.from(rg.cols, { rotateX: -90, transformOrigin: '50% 50% -50px', stagger: .06, duration: .7, ease: 'back.out(2)' }, 9.3);
    tl.fromTo(cp, { strokeDashoffset: 640, strokeDasharray: 640 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 9.6);
    for (let t = 9.3; t < 10.8; t += .08) api.cue(t, a => a.click(.05));
    api.cue(10.85, a => { a.impact(.45); a.pluck(659, .5, .14); a.pluck(988, .6, .1); });
    eye(9.4, 1150, 520, .9);
    tl.to(stage, { rotateY: 6, duration: 2.4, ease: 'sine.inOut' }, 9.4);

    /* scene F: red slash cuts fees / ads / shipping */
    const F2 = add(stage, 'fd-s fd-f'); const rows = [['Payment fees', fee], ['Ad spend', P.adSpend], ['Shipping', ship]];
    const rEls = rows.map(([n, v], i) => { const r = add(F2, 'fd-row'); r.style.top = (560 + i * 66) + 'px'; r.append(el('span', null, n), el('b', null, '−' + money(v))); const s = add(r, 'fd-slash'); return [r, s]; });
    const netWrap = add(E, 'fd-net'); const rn = digits(netWrap, money(net)); const nl = add(E, 'fd-nl', 'ACTUAL PROFIT · AFTER EVERYTHING');
    tl.set(F2, { autoAlpha: 1 }, 11.5);
    tl.to(stage, { y: -150, rotateY: -4, scale: 1.12, duration: 1, ease: 'expo.inOut' }, 11.5);
    tl.to(chart, { opacity: 0, duration: .3 }, 11.5);
    rEls.forEach(([r, s], i) => {
      const at = 11.75 + i * 60 / 110;
      tl.from(r, { x: -120, opacity: 0, duration: .45, ease: 'expo.out' }, at - .25);
      tl.fromTo(s, { scaleX: 0 }, { scaleX: 1, duration: .22, ease: 'power4.in' }, at);
      tl.to(r, { opacity: .42, duration: .3 }, at + .25);
      api.cue(at, a => { a.whoosh(.18, .25, false); a.snare(.22); });
    });
    tl.to([big, lab], { opacity: 0, y: -30, duration: .35, ease: 'power3.in' }, 13.05);
    tl.from(rn.cols, { rotateX: -90, opacity: 0, transformOrigin: '50% 50% -50px', stagger: .05, duration: .6, ease: 'back.out(2)' }, 13.1);
    spinTo(rn, money(net), 13.1, .9, true);
    tl.from(nl, { opacity: 0, y: 14, duration: .4 }, 13.3);
    api.cue(13.15, a => a.drop(.5));
    eye(11.7, 560, 640, .6); eye(13.0, 1000, 500, .5);

    /* scene G: 7:02 AM lock screen, before coffee */
    const Gs = add(stage, 'fd-s fd-g');
    tl.to(api.view, { '--sbg': '#090A0F', '--stx': '#F4F5FB', '--dot': 'rgba(255,255,255,.12)', duration: .4, ease: 'power2.inOut' }, 13.55);
    tl.set([E, F2], { autoAlpha: 0 }, 13.75);
    tl.set(Gs, { autoAlpha: 1 }, 13.55);
    tl.to(stage, { y: 0, x: 0, scale: 1, rotateX: 8, rotateY: 10, rotateZ: 0, duration: 1.1, ease: 'expo.inOut' }, 13.55);
    tl.to(stage, { rotateY: -6, duration: 1.8, ease: 'sine.inOut' }, 14.65);
    const phone = add(Gs, 'fd-phone'); const ph = add(phone, 'fd-ps'); add(ph, 'fd-island');
    const pt = add(ph, 'fd-pt', P.wake.replace(/\s*[AP]M$/i, '')); add(ph, 'fd-pd', 'Tuesday, 14 May');
    const note = add(ph, 'fd-note'); const ni = add(note, 'fd-ni'); ni.append(mk.cloneNode(true)); const nb = add(note, 'fd-nb');
    nb.append(el('b', null, 'Ledgr'), el('small', null, 'now')); add(nb, 'fd-nt', `You kept ${money(net)} yesterday. Fees, ads and shipping are already out.`);
    const pip1 = api.stock({ video: api.PXV('3969421/3969421-hd_1280_720_25fps.mp4'), from: 13.4, to: 16, cls: 'fd-pip p1', fallback: 'linear-gradient(135deg,#d9c2a7,#7a5a43)', label: 'PEXELS · PAVEL DANILYUK' });
    const pip2 = api.stock({ video: api.PXV('3126361/3126361-hd_1280_720_25fps.mp4'), from: 13.4, to: 16, cls: 'fd-pip p2', fallback: 'linear-gradient(135deg,#c8ccd3,#3f4652)', label: 'PEXELS · PRESSMASTER' });
    Gs.append(pip1, pip2); G.set(phone, { rotateY: -16, rotateX: 6 }); G.set(pip1, { rotateY: -20, z: 120 }); G.set(pip2, { rotateY: -12, z: -60 });
    const wake = add(Gs, 'fd-wake'); const wk = split(wake, P.wake); const bc = add(Gs, 'fd-bc'); const bcc = split(bc, 'before coffee.', 'word');
    tl.from(phone, { y: 700, rotateX: 40, duration: 1.1, ease: 'expo.out' }, 13.6);
    tl.from([pip1, pip2], { z: -800, opacity: 0, rotateY: 40, stagger: .12, duration: 1, ease: 'expo.out' }, 13.8);
    tl.to(pip1, { y: -18, duration: 2, ease: 'sine.inOut' }, 14.4); tl.to(pip2, { y: 16, duration: 2, ease: 'sine.inOut' }, 14.4);
    tl.from(note, { y: -120, scale: .8, opacity: 0, duration: .7, ease: 'back.out(1.8)' }, 14.5);
    tl.from(wk, { rotateX: -100, opacity: 0, transformOrigin: '50% 50% -40px', stagger: .05, duration: .7, ease: 'back.out(2.4)' }, 14.0);
    tl.from(bcc, { rotateX: -90, opacity: 0, stagger: .1, duration: .6, ease: 'back.out(2)' }, 14.6);
    api.cue(14.5, a => a.chime(.18)); api.cue(13.6, a => { a.whoosh(.7, .18); a.pad([220, 277, 330, 415], 2.4, .12); });
    eye(13.8, 1090, 420, 1); eye(15, 310, 640, .9);
    tl.to(Gs, { opacity: 0, duration: .25 }, 15.75);

    tl.set([B, C, D, E, F2, Gs], { autoAlpha: 0 }, 0);
    tl.set(A, { autoAlpha: 1 }, 0); tl.set(A, { autoAlpha: 0 }, 2.7);
    tl.set(C, { autoAlpha: 0 }, 7.4); tl.set(D, { autoAlpha: 0 }, 9.1);
    tl.set(logo, { autoAlpha: 0 }, 11.5);

    /* slot-machine digit cylinders */
    function digits(host, str) {
      host.textContent = ''; host.setAttribute('aria-label', str); const cols = [], strips = [];
      [...str].forEach(ch => {
        const col = el('span', 'fd-col'); col.setAttribute('aria-hidden', 'true');
        if (/\d/.test(ch)) { const s = el('span', 'fd-strip'); for (let k = 0; k < 20; k++) s.append(el('span', null, String(k % 10))); col.append(s); strips.push(s); }
        else col.append(el('span', 'fd-sym', ch));
        host.append(col); cols.push(col);
      });
      return { cols, strips };
    }
    function spinTo(r, str, at, d) { const ds = [...str].filter(c => /\d/.test(c)).map(Number); r.strips.forEach((s, i) => tl.fromTo(s, { yPercent: 0 }, { yPercent: -(10 + ds[i]) * 5, duration: d + i * .12, ease: 'back.out(1.3)' }, at)); }
  }
};
function demo(root, H) { H.motion(root, FILM); }

  demo(document.getElementById('mo'), H);
})();
