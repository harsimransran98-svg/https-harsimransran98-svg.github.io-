/* Concrete Bloom — Motion-graphics film page: DOM + SVG + GSAP master timeline with Pexels stock media (Bazozo Studio).
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
/* CONCRETE BLOOM — CAD view-cube camera (TOP → ISO → FRONT snaps) · raw-concrete drafting sheet · blueprint lines drawn by stroke-dashoffset · extruded wireframe tower that morphs into real facade footage + living-wall vines */
const FILM = {
  id: 'ConcreteBloom', dur: 16, fps: 60, seed: 61, poster: 12.6,
  alt: 'Concrete Bloom: an architecture motion film. A floor plan draws itself, the camera snaps from top to isometric to front like a CAD view cube, a wireframe tower morphs into real facade footage and green vines grow beside carbon-offset data cards.',
  badge: 'CAD VIEW-CUBE CAM · LIVE',
  scenes: [[0, 'Plan'], [3.5, 'Isometric'], [7.1, 'Elevation'], [10.4, 'Bloom']],
  props: [
    { k: 'floors', label: 'Floors', type: 'range', min: 4, max: 14, step: 1, v: 9, rebuild: true, fmt: v => v + ' floors' },
    { k: 'carbon', label: 'Embodied carbon cut', type: 'range', min: 20, max: 90, step: 1, v: 62, rebuild: true, fmt: v => '−' + v + '%' },
    { k: 'name', label: 'Project', type: 'text', max: 18, v: 'Concrete Bloom', rebuild: true },
    { k: 'accent', label: 'Living colour', type: 'chips', v: '#10B981', options: [['#10B981', 'Emerald'], ['#65A30D', 'Moss'], ['#B45309', 'Copper']] }
  ],
  onProp(k, v, api) { if (k === 'accent') api.view.style.setProperty('--cb-g', v); },
  build(api) {
    const { tl, stage, hud, split, G, el, svgEl, rnd } = api, P = api.props;
    const add = (p, cls, text) => api.add(p, 'div', cls, text);
    const draw = (paths, t, d, st = .03) => tl.fromTo(paths, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: d, stagger: st, ease: 'power2.inOut', immediateRender: true }, t);
    const line = (svg, d, cls = '') => { const p = svgEl('path', { d, class: cls, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 }); svg.append(p); return p; };
    G.set(stage, { transformOrigin: '800px 450px' });

    /* drafting sheet + plan */
    const sheet = add(stage, 'cb-sheet');
    const plan = svgEl('svg', { viewBox: '0 0 1600 900', class: 'cb-plan' }); stage.append(plan);
    const walls = ['M540 270 H1060 V630 H540 Z', 'M540 430 H760 M760 270 V520 M860 630 V470 H1060 M920 270 V360'].map(d => line(plan, d, 'w'));
    const doors = ['M760 520 A60 60 0 0 1 820 580', 'M860 470 A50 50 0 0 0 810 420', 'M920 360 A40 40 0 0 1 960 400'].map(d => line(plan, d, 'd'));
    const dims = ['M540 240 H1060 M540 232 V248 M1060 232 V248', 'M1095 270 V630 M1087 270 H1103 M1087 630 H1103'].map(d => line(plan, d, 'm'));
    const t1 = svgEl('text', { x: 800, y: 228, 'text-anchor': 'middle', class: 'cb-dt' }); t1.textContent = '24 600'; const t2 = svgEl('text', { x: 1112, y: 455, class: 'cb-dt' }); t2.textContent = '17 000'; plan.append(t1, t2);
    const rooms = [['LIVING', 640, 360], ['STUDIO', 640, 540], ['ATRIUM', 965, 560], ['CORE', 840, 330]].map(([n, x, y]) => { const t = svgEl('text', { x, y, 'text-anchor': 'middle', class: 'cb-rt' }); t.textContent = n; plan.append(t); return t; });
    draw(walls, .2, 1.4, .15); draw(doors, 1.2, .6, .1); draw(dims, 1.5, .6, .1);
    tl.from([t1, t2, ...rooms], { opacity: 0, duration: .4, stagger: .06 }, 1.9);
    for (let t = .2; t < 2.2; t += .12) api.cue(t, a => a.hiss(.1, { v: .05, type: 'bandpass', f: 3200 + rnd() * 1500, q: 2 }));

    /* extruded wireframe tower (3D) */
    const tower = add(stage, 'cb-tower'); const FH = 46, N = P.floors;
    const plates = []; for (let i = 0; i <= N; i++) { const p = add(tower, 'cb-plate' + (i === N ? ' roof' : '')); G.set(p, { z: i * FH }); plates.push(p); }
    const posts = [[0, 0], [520, 0], [520, 360], [0, 360], [260, 0], [260, 360]].map(([x, y]) => { const w = add(tower, 'cb-post'); w.style.left = x + 'px'; w.style.top = y + 'px'; w.style.height = N * FH + 'px'; return add(w, 'cb-pi'); });
    tl.set(tower, { autoAlpha: 0 }, 0); tl.set(tower, { autoAlpha: 1 }, 3.6);
    tl.from(plates, { opacity: 0, z: 0, duration: .5, stagger: .12, ease: 'expo.out' }, 3.8);
    tl.from(posts, { scaleY: 0, transformOrigin: '50% 0%', duration: 1, stagger: .05, ease: 'expo.out' }, 3.9);
    plates.forEach((_, i) => api.cue(3.8 + i * .12, a => a.click(.08)));

    /* view-cube camera snaps */
    const cube = add(hud, 'cb-cube'); const cb = add(cube, 'cb-cb'); ['TOP', 'FRONT', 'RIGHT', 'LEFT', 'BACK', 'BTM'].forEach(f => add(cb, 'cb-f ' + f.toLowerCase(), f)); const vlab = add(hud, 'cb-vlab', 'VIEW · TOP');
    const snap = (t, cam, cubeRot, label) => { tl.to(stage, { ...cam, duration: .9, ease: 'expo.inOut' }, t); tl.to(cb, { ...cubeRot, duration: .9, ease: 'expo.inOut' }, t); api.cue(t, a => { a.whoosh(.8, .1); }); api.cue(t + .85, a => { a.click(.15); a.osc(140, .18, { v: .3, to: 70 }); }); };
    G.set(cb, { rotateX: -90, rotateZ: 0 });
    snap(3.5, { rotateX: 58, rotateZ: -40, scale: .78, y: 60 }, { rotateX: -58, rotateZ: 40 }, 'ISO');
    tl.to(stage, { rotateZ: -50, duration: 3, ease: 'sine.inOut' }, 4.4);
    snap(7.1, { rotateX: 86, rotateZ: 0, scale: .9, y: 260 }, { rotateX: 0, rotateZ: 0 }, 'FRONT');
    tl.to([sheet, plan], { opacity: .25, duration: .6 }, 7.1);
    api.tick(t => { const v = t < 3.9 ? 'TOP' : t < 7.5 ? 'ISO' : 'FRONT'; if (vlab.textContent !== 'VIEW · ' + v) vlab.textContent = 'VIEW · ' + v; });

    /* morph: the wireframe dissolves into real facade footage (HUD frame aligned over the tower) */
    const morph = api.stock({ video: api.PXV('17860868/17860868-hd_720_1280_30fps.mp4'), photo: api.PX(16566142, 900), from: 8.4, to: 10.8, cls: 'cb-morph', fallback: 'linear-gradient(180deg,#9aa3a8,#3a4146)', label: 'PEXELS · ARCHITECTURE' }); hud.append(morph);
    const scan = add(hud, 'cb-scan');
    tl.fromTo(morph, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power2.inOut', immediateRender: true }, 8.6);
    tl.fromTo(scan, { y: 720, opacity: 0 }, { y: 80, opacity: 1, duration: 1.4, ease: 'power2.inOut', immediateRender: true }, 8.6); tl.to(scan, { opacity: 0, duration: .3 }, 10);
    tl.to([...plates, ...posts], { opacity: 0, duration: .8, stagger: .02 }, 9);
    tl.to(morph, { x: -340, scale: .82, duration: .8, ease: 'expo.inOut' }, 10.3); tl.to(morph, { opacity: 0, duration: .4 }, 10.9);
    api.cue(8.6, a => a.riser(1.4, .1));

    /* bloom: facade with growing vines + carbon cards */
    const bloom = add(hud, 'cb-bloom'); const fac = api.stock({ video: api.PXV('8783447/8783447-hd_1280_720_30fps.mp4'), photo: api.PX(7396896, 1280), from: 10, to: 16, cls: 'cb-fac', fallback: 'linear-gradient(170deg,#8b98a3,#2f363b)', label: 'PEXELS · RDNE STOCK' }); bloom.append(fac);
    const vs = svgEl('svg', { viewBox: '0 0 760 720', class: 'cb-vines' }); fac.append(vs); const vines = []; const leaves = [];
    for (let k = 0; k < 6; k++) { let x = 60 + k * 125, y = 720, d = `M${x} ${y}`; for (let j = 0; j < 7; j++) { const nx = x + (rnd() - .5) * 80, ny = y - 70 - rnd() * 50; d += ` Q${x + (rnd() - .5) * 90} ${(y + ny) / 2} ${nx} ${ny}`; const lf = svgEl('ellipse', { cx: nx, cy: ny, rx: 9, ry: 5, transform: `rotate(${rnd() * 180} ${nx} ${ny})`, class: 'cb-leaf' }); leaves.push([lf, j]); x = nx; y = ny; } vines.push(line(vs, d, 'cb-vine')); }
    leaves.forEach(([l]) => vs.append(l));
    tl.set(bloom, { autoAlpha: 0 }, 0); tl.set(bloom, { autoAlpha: 1 }, 10.4);
    tl.fromTo(fac, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9, ease: 'expo.inOut', immediateRender: true }, 10.4);
    draw(vines, 11, 2.6, .12);
    leaves.forEach(([l, j], i) => tl.from(l, { scale: 0, transformOrigin: '50% 50%', duration: .4, ease: 'back.out(3)' }, 11.2 + j * .34 + (i % 6) * .05));
    const cards = add(bloom, 'cb-cards');
    const c1 = add(cards, 'cb-card big'); const cn = el('b', null, '0%'); c1.append(el('small', null, 'EMBODIED CARBON'), cn, el('span', null, 'vs. a conventional concrete frame'));
    const c2 = add(cards, 'cb-card'); const on = el('b', null, '0 t'); c2.append(el('small', null, 'CO₂e OFFSET / YR'), on);
    const c3 = add(cards, 'cb-card'); const gr = el('b', null, '0 m²'); c3.append(el('small', null, 'GREEN ROOF + WALLS'), gr);
    const c4 = add(cards, 'cb-card bars'); c4.append(el('small', null, 'ENERGY USE · kWh/m²')); const bw = add(c4, 'cb-bars'); const bars = [['Typical', 1], ['Code', .72], [P.name, .38]].map(([n, v]) => { const r = add(bw, 'cb-br'); r.append(el('span', null, n)); const b = add(r, 'cb-bv'); b.style.setProperty('--w', v); return b; });
    tl.from(cards.children, { x: 80, opacity: 0, duration: .7, stagger: .14, ease: 'expo.out' }, 10.9);
    api.count(cn, 0, P.carbon, 11.2, 1.8, v => '−' + Math.round(v) + '%', 'expo.out'); api.count(on, 0, Math.round(P.floors * 138), 11.4, 1.8, v => Math.round(v).toLocaleString('en-US') + ' t', 'expo.out'); api.count(gr, 0, Math.round(P.floors * 356), 11.6, 1.8, v => Math.round(v).toLocaleString('en-US') + ' m²', 'expo.out');
    tl.from(bars, { scaleX: 0, transformOrigin: '0 50%', duration: 1, stagger: .15, ease: 'expo.out' }, 11.8);
    const ttl = add(bloom, 'cb-ttl', P.name); tl.from(ttl, { yPercent: 100, opacity: 0, duration: .8, ease: 'expo.out' }, 13.4);
    [11, 11.5, 12, 12.5, 13, 13.5].forEach((t, i) => api.cue(t, a => a.bell([523.25, 587.33, 659.25, 783.99, 880, 1046.5][i], .08, 1.6)));

    /* opening title over the plan */
    const it = add(hud, 'cb-it'); it.append(el('small', null, 'PROJECT 07 · MIXED USE · 2.4 HA'), el('b', null, P.name));
    tl.from(it.children, { yPercent: 120, opacity: 0, duration: .8, stagger: .12, ease: 'expo.out' }, .3); tl.to(it, { opacity: 0, y: -20, duration: .4 }, 3.2);
    api.cue(.1, a => a.pad([98, 146.83, 196, 233.08], 4, .12)); api.cue(7.1, a => a.pad([87.31, 130.81, 174.61, 220], 4, .12)); api.cue(10.4, a => a.pad([130.81, 196, 261.63, 329.63], 5.5, .14));
  }
};
function demo(root, H) { H.motion(root, FILM); }

  demo(document.getElementById('mo'), H);
})();
