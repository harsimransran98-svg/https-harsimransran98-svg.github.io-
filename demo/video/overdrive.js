/* Overdrive — Motion-graphics film page: DOM + SVG + GSAP master timeline with Pexels stock media (Bazozo Studio).
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
/* OVERDRIVE — Cam 4 redline shake: 0.4 s match cuts, Dutch angles, radial tunnel zoom · Bg 5 35mm grain + halation + dust · Type 6 chromatic-split impact · skewed parallelogram stock cutouts */
const CUT = .4;
const CUTS = [
  { video: '15270404/15270404-hd_1280_720_60fps.mp4', word: '200 MPH', cr: 'PEXELS · NIGHT HIGHWAY' },
  { video: '13795953/13795953-hd_1280_720_30fps.mp4', word: 'NO BRAKES', cr: 'PEXELS · ERIK MCLEAN' },
  { video: '19653393/19653393-hd_720_1280_30fps.mp4', word: 'ONE NIGHT', cr: 'PEXELS · LIGHT TRAILS' },
  { photo: 35416467, word: 'ONE CITY', cr: 'PEXELS · SHIBUYA' },
  { video: '7628845/7628845-hd_1280_720_25fps.mp4', word: 'ZERO', cr: 'PEXELS · DONALD NICHOLSON' },
  { video: '5309381/5309381-hd_1280_720_25fps.mp4', word: 'MERCY', cr: 'PEXELS · SUPERCARS', grade: 1 }
];
let voice = null;
const FILM = {
  id: 'Overdrive', W: 1600, H: 670, dur: 13, fps: 60, seed: 13, poster: 7.6,
  alt: 'Overdrive: a hypercar trailer. A tachometer sweeps to the 9,000 RPM redline, night-highway footage cuts every 0.4 seconds under Dutch angles, a cyan nitrous burst fires into a tunnel zoom, horsepower and torque curves draw on a dyno chart, and the title slams in with a chromatic split.',
  badge: 'REDLINE SHAKE CAM · LIVE',
  scenes: [[0, 'Ignition'], [2, 'Match cuts'], [4.4, 'Nitrous'], [6.6, 'Dyno'], [9.4, 'Title']],
  tracks: {
    V1: [[0, 2, 'Dutch −6° push'], [2, 4.4, '0.4 s match cuts'], [4.4, 6.6, 'Radial tunnel zoom'], [6.6, 9.4, 'Dutch +4° creep'], [9.4, 13, 'Impact shake']],
    V2: [[0, 2, 'Tach 0 → redline'], [2, 4.4, 'Chromatic words'], [4.4, 6.6, 'NITROUS + flame burst'], [6.6, 9.4, 'HP / torque curves'], [9.4, 13, 'Title slam']],
    V3: [[2, 4.4, '6 night cutouts'], [4.4, 6.6, 'POV highway'], [6.6, 9.4, 'Car still · dyno bay']],
    A1: [[0, 2, 'Ignition + rev'], [2, 4.4, '150 BPM kicks'], [4.2, 4.6, 'Turbo spool + drop'], [6.6, 9.4, 'Shift pops'], [9.2, 13, 'Bass drop']]
  },
  props: [
    { k: 'redline', label: 'Redline', type: 'range', min: 7000, max: 10000, step: 250, v: 9000, rebuild: true, fmt: v => v.toLocaleString('en-US') + ' rpm' },
    { k: 'nitro', label: 'Nitro intensity', type: 'range', min: .3, max: 1.6, step: .1, v: 1, rebuild: true, fmt: v => Math.round(v * 100) + '%' },
    { k: 'shake', label: 'Camera shake', type: 'range', min: 0, max: 2, step: .1, v: 1, rebuild: true, fmt: v => v.toFixed(1) + '×' },
    { k: 'title', label: 'Title', type: 'text', max: 12, v: 'OVERDRIVE', rebuild: true }
  ],
  onState(api, playing) {
    const A = api.A;
    if (playing && A.on && !voice) {
      const c = A.ctx, o1 = c.createOscillator(), o2 = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain();
      o1.type = 'sawtooth'; o2.type = 'square'; lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = 4; g.gain.value = 0;
      o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(A.out); o1.start(); o2.start(); voice = { o1, o2, lp, g, c };
    }
    if (voice && (!playing || !A.on)) { const v = voice; voice = null; v.g.gain.setTargetAtTime(0, v.c.currentTime, .05); setTimeout(() => { try { v.o1.stop(); v.o2.stop(); } catch (_) {} }, 400); }
  },
  build(api) {
    const { tl, stage, hud, split, G, el, svgEl, rnd, shaker } = api, P = api.props, SH = P.shake;
    const add = (p, cls, text) => api.add(p, 'div', cls, text);
    G.set(stage, { transformOrigin: '800px 335px' });
    const rpm = { v: 0 };

    /* Bg 5: 35mm grain + halation + dust (HUD, above everything) */
    const grain = add(hud, 'od-grain'), hal = add(hud, 'od-hal');
    for (let i = 0; i < 14; i++) { const d = add(hud, 'od-dust'); G.set(d, { x: rnd() * 1600, y: rnd() * 670, scale: .4 + rnd() }); tl.to(d, { x: '+=' + (rnd() * 200 - 100), y: '+=' + (rnd() * 120 - 60), duration: 13, ease: 'none' }, 0); }
    const top = api.mirror();
    const speed = add(top, 'od-speed'); const sl = svgEl('svg', { viewBox: '-800 -335 1600 670', width: 1600, height: 670 }); speed.append(sl);
    for (let i = 0; i < 70; i++) { const a = rnd() * Math.PI * 2, r1 = 160 + rnd() * 260, r2 = r1 + 200 + rnd() * 500; sl.append(svgEl('line', { x1: Math.cos(a) * r1, y1: Math.sin(a) * r1 * .6, x2: Math.cos(a) * r2, y2: Math.sin(a) * r2 * .6, class: i % 5 ? '' : 'c' })); }
    G.set(speed, { opacity: .25 });

    /* scene 1: ignition + tachometer to the redline */
    const tach = add(top, 'od-tach'); const ts = svgEl('svg', { viewBox: '-200 -200 400 400', width: 400, height: 400 }); tach.append(ts);
    const max = P.redline + 1000, ang = r => -225 + 270 * Math.min(1, r / max), rad = a => a * Math.PI / 180;
    const arc = (r0, r1, R) => { const a0 = rad(ang(r0)), a1 = rad(ang(r1)); return `M${Math.cos(a0) * R} ${Math.sin(a0) * R} A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${Math.cos(a1) * R} ${Math.sin(a1) * R}`; };
    ts.append(svgEl('path', { d: arc(0, max, 170), class: 'od-arc' }), svgEl('path', { d: arc(P.redline, max, 170), class: 'od-red' }));
    for (let r = 0; r <= max; r += 500) { const a = rad(ang(r)), big = r % 1000 === 0, r1 = big ? 140 : 152; ts.append(svgEl('line', { x1: Math.cos(a) * r1, y1: Math.sin(a) * r1, x2: Math.cos(a) * 164, y2: Math.sin(a) * 164, class: r >= P.redline ? 'od-tk r' : 'od-tk' })); if (big) { const t = svgEl('text', { x: Math.cos(a) * 116, y: Math.sin(a) * 116 + 8, 'text-anchor': 'middle', class: r >= P.redline ? 'r' : '' }); t.textContent = r / 1000; ts.append(t); } }
    const needle = svgEl('g', { class: 'od-needle' }); needle.append(svgEl('path', { d: 'M-6 0 L0 -158 L6 0 Z' }), svgEl('circle', { r: 16 })); ts.append(needle);
    const rd = add(tach, 'od-rpm', '0'); add(tach, 'od-rl', 'RPM × 1000');
    const setRpm = () => { G.set(needle, { rotation: ang(rpm.v) + 90, svgOrigin: '0 0' }); rd.textContent = Math.round(rpm.v).toLocaleString('en-US'); tach.classList.toggle('hot', rpm.v >= P.redline); };
    setRpm();
    const press = add(top, 'od-press', 'PRESS START'); tl.to(press, { opacity: 0, duration: .05, repeat: 5, yoyo: true }, 0); tl.to(press, { opacity: 0, duration: .1 }, .4);
    tl.from(tach, { scale: .6, opacity: 0, duration: .5, ease: 'back.out(2)' }, .35);
    tl.to(rpm, { v: 1200, duration: .3, ease: 'power2.out', onUpdate: setRpm }, .4);
    tl.to(rpm, { v: P.redline + 300, duration: 1.2, ease: 'power3.in', onUpdate: setRpm }, .75);
    tl.to(rpm, { v: P.redline - 600, duration: .2, ease: 'power1.inOut', onUpdate: setRpm }, 1.95);
    tl.fromTo(stage, { rotateZ: 0, scale: 1 }, { rotateZ: -6, scale: 1.12, duration: 1.9, ease: 'power2.in' }, .1);
    tl.to(speed, { opacity: .7, scale: 1.4, duration: 1.6, ease: 'power2.in' }, .4);
    api.cue(.4, a => { a.impact(.7); a.osc(55, .6, { type: 'sawtooth', v: .25, lp: 400, to: 110 }); });
    api.shake(1.7, .3, 8 * SH, 30, 1.5 * SH);
    tl.to(tach, { x: -520, scale: .5, opacity: .9, duration: .35, ease: 'power4.inOut' }, 1.95);

    /* scene 2: 0.4 s match cuts in skewed frames */
    const shapes = ['polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)', 'polygon(0% 0%, 92% 0%, 100% 100%, 8% 100%)'];
    const frames = CUTS.map((c, i) => {
      const t0 = 2 + i * CUT;
      const m = api.stock({ video: c.video && api.PXV(c.video), photo: c.photo && api.PX(c.photo, 1280), from: t0 - .2, to: t0 + CUT + .1, cls: 'od-cut' + (c.grade ? ' night' : ''), fallback: `linear-gradient(${120 + i * 40}deg, #0b1a24, #08080a 60%, #2a0d05)`, label: c.cr, alt: 'Supercar at night in Shibuya' });
      stage.append(m); m.style.clipPath = shapes[i % 2];
      tl.set(m, { autoAlpha: 0 }, 0); tl.set(m, { autoAlpha: 1 }, t0); tl.set(m, { autoAlpha: 0 }, t0 + CUT);
      tl.fromTo(m, { scale: 1.18, x: i % 2 ? -60 : 60 }, { scale: 1, x: 0, duration: CUT, ease: 'power3.out', immediateRender: false }, t0);
      tl.set(stage, { rotateZ: i % 2 ? 5 : -6 }, t0);
      const w = add(top, 'od-word'); split(w, c.word);
      tl.set(w, { autoAlpha: 0 }, 0); tl.set(w, { autoAlpha: 1 }, t0); tl.set(w, { autoAlpha: 0 }, t0 + CUT);
      tl.fromTo(w, { scale: 1.6, skewX: -14, '--ca': '18px' }, { scale: 1, skewX: -8, '--ca': '3px', duration: .25, ease: 'expo.out', immediateRender: false }, t0);
      api.shake(t0, .16, 10 * SH, 40, 1.2 * SH);
      api.cue(t0, a => { a.kick(.85); a.hiss(.06, { v: .2, f: 3000 }); });
      return m;
    });
    for (let t = 2; t < 4.4; t += CUT / 2) api.cue(t + CUT / 4, a => a.hat(.07));
    api.flash(2, '#fff', .2, .8);
    tl.to(speed, { opacity: .2, scale: 1, duration: .2 }, 2);

    /* scene 3: NITROUS: tunnel zoom + cyan flame burst */
    const pov = api.stock({ video: api.PXV('15270404/15270404-hd_1280_720_60fps.mp4'), from: 4.2, to: 6.8, cls: 'od-pov', fallback: 'radial-gradient(circle at 50% 55%, #1a2a3a, #08080a 60%)', label: 'PEXELS · NIGHT HIGHWAY' }); stage.append(pov);
    tl.set(pov, { autoAlpha: 0 }, 0); tl.set(pov, { autoAlpha: 1 }, 4.4); tl.set(pov, { autoAlpha: 0 }, 6.6);
    tl.set(stage, { rotateZ: 0 }, 4.4);
    tl.fromTo(stage, { scale: 1 }, { scale: 1 + .5 * P.nitro, duration: 2.1, ease: 'power2.in', immediateRender: false }, 4.45);
    tl.fromTo(speed, { opacity: .35, scale: .8 }, { opacity: .95, scale: 2.2, duration: 2.1, ease: 'power2.in', immediateRender: false }, 4.45);
    const nos = add(top, 'od-nos'); split(nos, 'NITROUS');
    tl.set(nos, { autoAlpha: 0 }, 0); tl.set(nos, { autoAlpha: 1 }, 4.55);
    tl.fromTo(nos.querySelectorAll('.mo-ch'), { scaleX: 2.4, opacity: 0, '--ca': '30px' }, { scaleX: 1, opacity: 1, '--ca': '4px', duration: .35, stagger: .04, ease: 'expo.out', immediateRender: false }, 4.55);
    tl.to(nos, { scale: 1.6, opacity: 0, duration: .4, ease: 'power3.in' }, 6.2);
    const N = Math.round((api.lite ? 26 : 54) * P.nitro), flames = add(top, 'od-flames');
    for (let i = 0; i < N; i++) {
      const f = add(flames, 'od-f'), a = (-.5 + rnd()) * .9 + Math.PI, d = 300 + rnd() * 700 * P.nitro, t = 4.5 + rnd() * .9;
      tl.fromTo(f, { x: 0, y: 0, scale: .3 + rnd() * .6, opacity: 1 }, { x: Math.cos(a) * d, y: Math.sin(a) * d * .45, scale: 1.4 + rnd() * 2, opacity: 0, duration: .55 + rnd() * .5, ease: 'power2.out', immediateRender: false }, t);
    }
    tl.set(flames, { autoAlpha: 0 }, 0); tl.set(flames, { autoAlpha: 1 }, 4.45); tl.set(flames, { autoAlpha: 0 }, 6.4);
    api.cue(4.0, a => a.osc(700, .45, { v: .08, to: 3400, a: .4 })); api.cue(4.4, a => { a.drop(.95); a.hiss(.5, { v: .3, type: 'bandpass', f: 1800, to: 300, q: .8 }); });
    api.shake(4.4, .5, 22 * SH, 34, 2.5 * SH); api.flash(4.4, '#00F0FF', .35, .7);
    tl.to(rpm, { v: P.redline + 500, duration: .4, onUpdate: setRpm }, 4.4);
    for (let t = 4.4; t < 6.6; t += CUT) api.cue(t, a => a.kick(.9));

    /* scene 4: dyno chart */
    const bay = api.stock({ photo: api.PX(5880077, 1280), cls: 'od-bay', fallback: 'linear-gradient(160deg,#1b1b22,#08080a)', alt: 'Sports car on a city street at night' }); stage.append(bay);
    tl.set(bay, { autoAlpha: 0 }, 0); tl.set(bay, { autoAlpha: 1 }, 6.6); tl.set(bay, { autoAlpha: 0 }, 9.4);
    tl.fromTo(stage, { scale: 1, rotateZ: 4 }, { scale: 1.08, rotateZ: 2, duration: 2.8, ease: 'sine.inOut', immediateRender: false }, 6.6);
    tl.set(speed, { opacity: 0 }, 6.6);
    const dyno = add(top, 'od-dyno'); const dh = add(dyno, 'od-dh'); dh.append(el('b', null, 'DYNO RUN 07'), el('span', null, 'WHEEL HP · TORQUE NM'));
    const ds = svgEl('svg', { viewBox: '0 0 640 300', class: 'od-ds' }); dyno.append(ds);
    for (let x = 0; x <= 640; x += 80) ds.append(svgEl('line', { x1: x, y1: 0, x2: x, y2: 300, class: 'g' }));
    for (let y = 0; y <= 300; y += 60) ds.append(svgEl('line', { x1: 0, y1: y, x2: 640, y2: y, class: 'g' }));
    const hp = svgEl('path', { d: 'M0 290 C120 270 220 180 330 120 S520 40 640 30', class: 'hp', pathLength: 1 }), tq = svgEl('path', { d: 'M0 230 C90 120 200 70 300 70 S520 100 640 150', class: 'tq', pathLength: 1 });
    ds.append(hp, tq);
    const rd2 = add(dyno, 'od-read'); const hpN = el('b', 'c'), tqN = el('b', 'o'); const r1 = el('div'), r2 = el('div'), r3 = el('div'); r1.append(hpN, el('span', null, 'HP')); r2.append(tqN, el('span', null, 'NM')); r3.append(el('b', null, '2.3 s'), el('span', null, '0–100 KM/H')); rd2.append(r1, r2, r3);
    tl.set(dyno, { autoAlpha: 0 }, 0); tl.set(dyno, { autoAlpha: 1 }, 6.6); tl.set(dyno, { autoAlpha: 0 }, 9.4);
    tl.from(dyno, { x: 200, skewX: -12, opacity: 0, duration: .45, ease: 'expo.out' }, 6.6);
    tl.fromTo([hp, tq], { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 2.2, stagger: .15, ease: 'power2.inOut', immediateRender: true }, 6.8);
    api.count(hpN, 0, 1200, 6.8, 2.2, v => Math.round(v).toLocaleString('en-US'), 'power2.inOut'); api.count(tqN, 0, 1050, 6.95, 2.1, v => Math.round(v).toLocaleString('en-US'), 'power2.inOut');
    tl.to(tach, { x: -560, y: 40, scale: .42, duration: .4, ease: 'power3.inOut' }, 6.6);
    [6.9, 7.6, 8.3, 9.0].forEach((t, i) => { tl.to(rpm, { v: P.redline - 200, duration: .6, ease: 'power2.in', onUpdate: setRpm }, t).to(rpm, { v: P.redline * .62, duration: .1, ease: 'none', onUpdate: setRpm }, t + .6); api.cue(t + .6, a => { a.hiss(.12, { v: .22, type: 'bandpass', f: 2600, q: 1.5 }); a.osc(90, .08, { type: 'square', v: .12, lp: 900 }); }); });
    api.flash(6.6, '#FF3B00', .25, .5);

    /* scene 5: title slam with chromatic split */
    tl.set(stage, { rotateZ: 0, scale: 1 }, 9.4);
    const tt = add(top, 'od-title'); const tch = split(tt, P.title);
    const sub = add(top, 'od-sub', 'REDLINE HEIST · COMING SOON');
    tl.set([tt, sub], { autoAlpha: 0 }, 0); tl.set([tt, sub], { autoAlpha: 1 }, 9.4);
    tl.fromTo(tch, { y: -260, scaleY: 1.8, opacity: 0, '--ca': '26px' }, { y: 0, scaleY: 1, opacity: 1, '--ca': '2px', duration: .45, stagger: .045, ease: 'expo.out', immediateRender: false }, 9.45);
    tl.from(sub, { opacity: 0, letterSpacing: '1em', duration: .8, ease: 'expo.out' }, 10.1);
    tl.fromTo(tt, { skewX: 0 }, { skewX: -8, duration: .3, ease: 'power2.out', immediateRender: false }, 9.9);
    tl.to(tach, { x: 610, y: 150, scale: .38, opacity: .7, duration: .5, ease: 'power3.inOut' }, 9.4);
    tl.to(rpm, { v: max, duration: .5, ease: 'power3.in', onUpdate: setRpm }, 11.6);
    api.shake(9.4, .6, 26 * SH, 34, 3 * SH); api.flash(9.4, '#fff', .3, .9);
    api.cue(9.2, a => a.riser(.25, .12)); api.cue(9.4, a => { a.drop(1); a.impact(.8); }); api.cue(12.1, a => a.impact(.6));
    tl.to([tt, sub, tach], { opacity: 0, duration: .25 }, 12.6);
    add(hud, 'od-blk');
    tl.fromTo(api.view, { '--od-black': 0 }, { '--od-black': 1, duration: .2, immediateRender: false }, 12.75);

    /* engine voice follows the tach */
    api.tick(() => { if (!voice || !api.playing) return; const f = 28 + rpm.v / max * 160, now = voice.c.currentTime; voice.o1.frequency.setTargetAtTime(f, now, .03); voice.o2.frequency.setTargetAtTime(f * .5, now, .03); voice.lp.frequency.setTargetAtTime(300 + rpm.v / max * 2600, now, .05); voice.g.gain.setTargetAtTime(api.t < .4 || api.t > 12.6 ? 0 : .09, now, .08); });
  }
};
function demo(root, H) { H.motion(root, FILM); }

  demo(document.getElementById('mo'), H);
})();
