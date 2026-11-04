/* Signal — Motion-graphics film page: DOM + SVG + GSAP master timeline with Pexels stock media (Bazozo Studio).
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
/* SIGNAL — Cam 6 blueprint orthographic pan · Bg 2 crosshair grid + live rulers · Type 2 terminal typewriter + glitch slice · Frame 5 viewfinder lens masks */
const ERRORS = ['429 rate limited', '401 invalid key', '403 forbidden', '503 overloaded', 'quota exceeded', 'key expired', '402 payment required', 'timeout 30s', '429 slow down', '400 bad auth'];
const APIS = ['payments', 'maps', 'weather', 'email', 'search', 'sms', 'storage', 'calendar', 'crm', 'vision', 'speech', 'finance'];
const MODELS = ['reasoning', 'vision', 'code', 'embed', 'speech', 'image', 'rerank', 'audio', 'small', 'large'];
const ROUTES = [['POST', '/v1/messages'], ['GET', '/v1/weather'], ['POST', '/v1/charge'], ['GET', '/v1/maps/route'], ['POST', '/v1/embed'], ['GET', '/v1/search'], ['POST', '/v1/sms'], ['POST', '/v1/vision'], ['GET', '/v1/fx/rates'], ['POST', '/v1/speech']];

const FILM = {
  id: 'Signal', dur: 15, fps: 60, seed: 29, poster: 11.5,
  alt: 'Signal: an AI developer-tool motion film. A terminal types your agent needs, the screen flashes SKILLS, a counter climbs to 4,763 API keys among rate-limit errors, then everything collapses into one orange key wired to 5,000+ APIs and 110+ models.',
  badge: 'ORTHO BLUEPRINT CAM · LIVE',
  scenes: [[0, 'Prompt'], [2.3, 'SKILLS'], [3.5, 'Key count'], [6.4, '429 storm'], [8.5, 'One key.'], [10, 'Wired'], [13.2, 'Blueprint']],
  tracks: {
    V1: [[0, 2.3, 'Lock (0,0)'], [3.5, 4.3, 'Plot → X 1600'], [6.4, 8.4, 'Ortho shake'], [10, 10.9, 'Plot → Y 900'], [13.2, 15, 'Zoom out 0.5×']],
    V2: [[0, 2.3, 'Typewriter █'], [2.3, 3.5, 'SKILLS glitch'], [3.5, 6.4, '51 → 4,763'], [6.4, 8.5, 'Error badges'], [8.5, 10, 'One key.'], [10, 13.2, 'Node wiring + feed'], [13.2, 15, 'End card']],
    V3: [[9.6, 15, 'Server room · lens'], [10, 15, 'Rack photo · lens']],
    A1: [[0, 2.3, 'Key clicks'], [2.3, 3.5, 'Impact + glitch'], [3.5, 8.4, 'Blips + buzz'], [8.5, 10, 'Collapse + bell'], [10, 15, '120 BPM pulse']]
  },
  props: [
    { k: 'prompt', label: 'Prompt', type: 'text', max: 26, v: 'your agent needs', rebuild: true },
    { k: 'keys', label: 'API keys', type: 'range', min: 1000, max: 9999, step: 1, v: 4763, rebuild: true, fmt: v => v.toLocaleString('en-US') },
    { k: 'models', label: 'Models', type: 'range', min: 20, max: 300, step: 1, v: 110, rebuild: true, fmt: v => v + '+' },
    { k: 'accent', label: 'Brand colour', type: 'chips', v: '#FF5722', options: [['#FF5722', 'Claude orange'], ['#F59E0B', 'Amber'], ['#22C55E', 'Signal green'], ['#38BDF8', 'Sky']] }
  ],
  onProp(k, v, api) { if (k === 'accent') api.view.style.setProperty('--sg-acc', v); },
  build(api) {
    const { tl, stage, hud, split, G, el, svgEl, rnd } = api, P = api.props;
    const add = (p, cls, text) => api.add(p, 'div', cls, text);
    const at = (n, x, y) => { n.style.left = x + 'px'; n.style.top = y + 'px'; return n; };
    G.set(stage, { transformOrigin: '0 0', x: 0, y: 0 });
    add(stage, 'sg-grid');
    [[0, 0, 'A1 · PROMPT'], [1600, 0, 'A2 · KEYS'], [0, 900, 'B1 · SHIP'], [1600, 900, 'B2 · WIRED']].forEach(([x, y, t]) => at(add(stage, 'sg-cell', t), x + 40, y + 34));

    /* comet orb that leads the camera */
    const orb = add(stage, 'sg-orb'); const tail = add(orb, 'sg-tail'); add(orb, 'sg-core');
    G.set(orb, { x: 260, y: 300 });
    const go = (t, x, y, d = .6) => tl.to(orb, { x, y, duration: d, ease: 'power4.inOut' }, t);
    let px = 0, py = 0; api.tick(() => { const x = G.getProperty(orb, 'x'), y = G.getProperty(orb, 'y'), dx = x - px, dy = y - py, v = Math.hypot(dx, dy); if (v > .5) { tail.style.transform = `rotate(${Math.atan2(dy, dx) * 180 / Math.PI + 180}deg) scaleX(${Math.min(4, .4 + v / 18)})`; } else tail.style.transform = 'scaleX(.3)'; px = x; py = y; });

    /* plotter camera: X then Y, never rotated, never warped */
    const cam = (t, cx, cy, d = .7) => { if (cx !== null) tl.to(stage, { x: -cx * 1600, duration: d, ease: 'power4.inOut' }, t); tl.to(stage, { y: -cy * 900, duration: d, ease: 'power4.inOut' }, t + (cx !== null ? d * .85 : 0)); };

    /* rulers + live coordinates (HUD, outside the camera) */
    const rx = add(hud, 'sg-rx'), ry = add(hud, 'sg-ry'), xy = add(hud, 'sg-xy');
    api.tick(() => { const x = -G.getProperty(stage, 'x'), y = -G.getProperty(stage, 'y'), s = G.getProperty(stage, 'scale') || 1; rx.style.backgroundPositionX = `${-x * s}px`; ry.style.backgroundPositionY = `${-y * s}px`; xy.textContent = `X ${String(Math.round(x)).padStart(4, '0')}  Y ${String(Math.round(y)).padStart(4, '0')}  ${s.toFixed(2)}×`; });

    /* A1: terminal typewriter */
    const term = at(add(stage, 'sg-term'), 200, 230); const tb = add(term, 'sg-tb'); tb.append(el('i'), el('i'), el('i'), el('span', null, 'agent@signal: ~/launch — zsh'));
    const line = add(term, 'sg-line'); line.append(el('span', 'sg-pr', '>')); const typed = el('span', 'sg-typed'); line.append(typed);
    const chars = [...P.prompt].map(c => { const s = el('span', 'sg-k', c); typed.append(s); return s; });
    typed.setAttribute('aria-label', P.prompt); const cur = el('span', 'sg-cur', '█'); line.append(cur);
    const hint = add(term, 'sg-hint', '# 0 skills installed · 0 keys configured');
    tl.set(chars, { display: 'none' }, 0);
    chars.forEach((c, i) => { const t = .35 + i * .075 + (c.textContent === ' ' ? .05 : 0); tl.set(c, { display: 'inline' }, t); api.cue(t, a => a.click(.1)); });
    tl.from(term, { y: 40, opacity: 0, duration: .5, ease: 'expo.out' }, 0);
    tl.from(hint, { opacity: 0, duration: .3 }, 1.7);
    go(.2, 1240, 420, 1.6);

    /* SKILLS: full-screen orange flash + glitch slices (HUD) */
    const sk = add(hud, 'sg-skills'); const slices = [0, 1, 2, 3].map(i => { const s = add(sk, 'sg-sl', 'SKILLS'); s.style.clipPath = `inset(${i * 25}% 0 ${100 - (i + 1) * 25}% 0)`; return s; });
    tl.set(sk, { autoAlpha: 0 }, 0); tl.set(sk, { autoAlpha: 1 }, 2.3);
    tl.fromTo(slices, { scaleY: 0, x: (i) => (i % 2 ? -1 : 1) * 300 }, { scaleY: 1, x: 0, duration: .32, stagger: .03, ease: 'expo.out' }, 2.3);
    [2.75, 2.95, 3.1].forEach(t => tl.to(slices, { x: () => (rnd() * 2 - 1) * 70, duration: .05, ease: 'none' }, t).to(slices, { x: 0, duration: .06, ease: 'none' }, t + .05));
    tl.to(slices, { x: (i) => (i % 2 ? 1 : -1) * 1800, duration: .38, stagger: .02, ease: 'power4.in' }, 3.18);
    tl.set(sk, { autoAlpha: 0 }, 3.6);
    api.cue(2.3, a => { a.impact(.8); a.hiss(.3, { v: .25, f: 3000 }); }); [2.75, 2.95, 3.1].forEach(t => api.cue(t, a => a.hiss(.05, { v: .2, type: 'bandpass', f: 2400, q: 3 })));

    /* A2: key counter */
    cam(3.45, 1, 0, .75);
    go(3.45, 2400, 400, .8);
    const chips = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const k = at(add(stage, 'sg-chip', 'sk-' + ['live', 'prod', 'test', 'org'][(r + c) % 4] + '-' + Math.floor(rnd() * 9000 + 1000) + '••••'), 1700 + c * 240, 70 + r * 210 + (c % 2) * 40); chips.push(k); }
    const cnt = at(add(stage, 'sg-count'), 1600, 250); const lab = at(add(stage, 'sg-lab'), 1600, 560); const labc = split(lab, 'API KEYS TO MANAGE');
    tl.from(chips, { opacity: 0, scale: .6, duration: .3, stagger: { each: .04, grid: [4, 6], from: 'start' }, ease: 'power3.out' }, 3.7);
    tl.from(cnt, { opacity: 0, duration: .1 }, 3.8);
    api.count(cnt, 0, 51, 3.8, .5, undefined, 'power1.out');
    api.count(cnt, 51, 1077, 4.5, .7, undefined, 'power2.inOut');
    api.count(cnt, 1077, P.keys, 5.3, .8, undefined, 'expo.out');
    tl.set(labc, { opacity: 0 }, 0); labc.forEach((c, i) => tl.set(c, { opacity: 1 }, 5.4 + i * .028));
    [[3.8, 4.3], [4.5, 5.2], [5.3, 6.1]].forEach(([a, b], j) => { for (let t = a; t < b; t += .07 - j * .015) api.cue(t, x => x.osc(900 + j * 300, .03, { type: 'square', v: .04, lp: 2500 })); });
    api.cue(6.1, a => a.impact(.5));

    /* 429 storm */
    const badges = ERRORS.map((e, i) => { const a = i / ERRORS.length * Math.PI * 2, b = at(add(stage, 'sg-err', e), 2400 + Math.cos(a) * 560 - 110, 430 + Math.sin(a) * 300 - 22); return b; });
    badges.forEach((b, i) => {
      const t = 6.45 + i * .12; tl.from(b, { scale: 0, opacity: 0, duration: .25, ease: 'back.out(3)' }, t); api.cue(t, a => a.buzz(.08));
      const kf = []; for (let k = 0; k < 14; k++) kf.push({ x: (rnd() * 2 - 1) * 9, y: (rnd() * 2 - 1) * 6, duration: .05 }); kf.push({ x: 0, y: 0, duration: .05 });
      tl.to(b, { keyframes: kf, ease: 'none' }, t + .3);
    });
    api.shake(7.6, .7, 12, 32, 0);
    tl.to(cnt, { color: '#FF3B30', duration: .2 }, 6.5);

    /* collapse into One key. */
    tl.to([...badges, ...chips], { left: 2300, top: 430, scale: 0, opacity: 0, duration: .5, stagger: .012, ease: 'power4.in' }, 8.4);
    tl.to([cnt, lab], { scale: .2, opacity: 0, duration: .4, ease: 'power4.in' }, 8.45);
    api.flash(8.5, '#F5F2EB', .6);
    tl.to(api.view, { '--sbg': '#F5F2EB', '--sg-ink': '#070709', '--sg-grid': 'rgba(7,7,9,.09)', duration: .1, ease: 'none' }, 8.5);
    const one = at(add(stage, 'sg-one'), 1600, 300); const key = svgEl('svg', { viewBox: '0 0 120 60', width: 210, height: 105, class: 'sg-key' });
    key.append(svgEl('circle', { cx: 30, cy: 30, r: 20, fill: 'none', 'stroke-width': 9 }), svgEl('path', { d: 'M50 30 H112 M92 30 V46 M104 30 V42', fill: 'none', 'stroke-width': 9, 'stroke-linecap': 'round' }));
    one.append(key); const keyClone = () => { const k = key.cloneNode(true); k.removeAttribute('style'); return k; }; const ot = el('b'); one.append(ot); const otc = split(ot, 'One key.');
    tl.from(key, { scale: 0, rotation: -200, duration: .7, ease: 'back.out(2.2)' }, 8.55);
    tl.from(otc, { opacity: 0, x: -30, duration: .02, stagger: .06, ease: 'none' }, 8.75);
    api.cue(8.4, a => a.whoosh(.5, .25, false)); api.cue(8.55, a => { a.bell(523.25, .18, 2); a.bell(783.99, .12, 2.2); });
    go(8.45, 2400, 470, .4);

    /* B2: wired to every API and model */
    tl.to(api.view, { '--sbg': '#070709', '--sg-ink': '#F5F2EB', '--sg-grid': 'rgba(245,242,235,.07)', duration: .5, ease: 'power2.inOut' }, 9.9);
    cam(9.95, null, 1, .8);
    tl.to(one, { opacity: 0, scale: .5, duration: .45, ease: 'power3.in' }, 9.95);
    go(9.95, 2400, 1350, .8);
    const wires = svgEl('svg', { viewBox: '1600 900 1600 900', class: 'sg-wires', width: 1600, height: 900 }); at(wires, 1600, 900); stage.append(wires);
    const hub = at(add(stage, 'sg-hub'), 2310, 1260); hub.append(keyClone());
    const apiChips = APIS.map((n, i) => at(add(stage, 'sg-node a', n), 1690 + (i % 2) * 180, 1010 + Math.floor(i / 2) * 118));
    const modChips = MODELS.map((n, i) => at(add(stage, 'sg-node m', n), 2860 + (i % 2) * 170, 1060 + Math.floor(i / 2) * 120));
    const paths = [];
    [...apiChips, ...modChips].forEach((n, i) => {
      const x = parseFloat(n.style.left) + (i < APIS.length ? 150 : 0), y = parseFloat(n.style.top) + 20, hx = i < APIS.length ? 2310 : 2490, hy = 1350;
      const p = svgEl('path', { d: `M${x} ${y} C${(x + hx) / 2} ${y} ${(x + hx) / 2} ${hy} ${hx} ${hy}`, class: 'sg-w' }); wires.append(p); paths.push(p);
    });
    const apiBig = at(add(stage, 'sg-big'), 1690, 935); api.count(apiBig, 0, 5000, 10.5, 1.4, v => Math.round(v).toLocaleString('en-US') + '+ APIs', 'expo.out');
    const modBig = at(add(stage, 'sg-big r'), 2640, 935); api.count(modBig, 0, P.models, 10.6, 1.3, v => Math.round(v) + '+ Models', 'expo.out');
    tl.from(hub, { scale: 0, duration: .6, ease: 'back.out(2)' }, 10.6);
    tl.from([...apiChips, ...modChips], { opacity: 0, x: (i) => i < APIS.length ? -60 : 60, duration: .4, stagger: .03, ease: 'expo.out' }, 10.55);
    tl.fromTo(paths, { strokeDashoffset: 900, strokeDasharray: '900 900' }, { strokeDashoffset: 0, duration: .9, stagger: .025, ease: 'power2.inOut' }, 10.7);
    tl.to(paths, { strokeDasharray: '6 14', strokeDashoffset: -240, duration: 3, ease: 'none' }, 11.9);
    const pulse = add(hub, 'sg-pulse'); tl.fromTo(pulse, { scale: 1, opacity: .9 }, { scale: 2.4, opacity: 0, duration: .5, repeat: 6, ease: 'power2.out' }, 11.4);
    /* live 200 OK feed */
    const feed = at(add(stage, 'sg-feed'), 2105, 1530); const fh = add(feed, 'sg-fh', 'LIVE CALLS · one key'); const fl = add(feed, 'sg-fl');
    for (let i = 0; i < 36; i++) { const [m, r] = ROUTES[Math.floor(rnd() * ROUTES.length)]; const row = add(fl, 'sg-fr'); row.append(el('b', null, '200 OK'), el('span', null, m + ' ' + r), el('em', null, Math.round(40 + rnd() * 380) + 'ms')); }
    tl.from(feed, { y: 80, opacity: 0, duration: .5, ease: 'expo.out' }, 10.9);
    tl.fromTo(fl, { y: 0 }, { y: -30 * 28, duration: 4, ease: 'none' }, 11);
    for (let t = 11.1; t < 15; t += .14) api.cue(t, a => a.osc(1760, .02, { v: .025 }));
    /* Frame 5: viewfinder lenses over real server footage */
    const lens = (x, y, size, media, label) => {
      const L = at(add(stage, 'sg-lens'), x, y); L.style.width = L.style.height = size + 'px';
      const m = api.stock(media); m.classList.add('sg-lm'); L.append(m);
      const ring = svgEl('svg', { viewBox: '-110 -110 220 220', class: 'sg-ring' });
      for (let d = 0; d < 360; d += 6) { const r1 = d % 30 ? 100 : 94, a = d * Math.PI / 180; ring.append(svgEl('line', { x1: Math.cos(a) * r1, y1: Math.sin(a) * r1, x2: Math.cos(a) * 106, y2: Math.sin(a) * 106 })); }
      L.append(ring); const os = add(L, 'sg-os'); os.append(el('span', null, label), el('span', null, 'ISO 800 · 1/120 · f2.8')); add(L, 'sg-ret');
      tl.fromTo(ring, { rotation: 0 }, { rotation: 140, duration: 6, ease: 'none' }, 9.5);
      return L;
    };
    const l1 = lens(1690, 1500, 200, { video: api.PXV('5028622/5028622-hd_1280_720_25fps.mp4'), from: 9.6, to: 15, fallback: 'radial-gradient(circle,#24324a,#05070b)' }, 'REC · RACK 07');
    const l2 = lens(2930, 1500, 200, { photo: api.PX(17489160, 640), fallback: 'radial-gradient(circle,#0b3a66,#05070b)', alt: 'Illuminated server racks' }, 'EDGE · FRA-2');
    tl.from([l1, l2], { scale: 0, rotation: -90, duration: .7, stagger: .12, ease: 'back.out(1.8)' }, 11.2);
    for (let t = 10; t < 15; t += .5) { api.cue(t, a => a.kick(.6)); api.cue(t + .25, a => a.hat(.06)); }
    for (let t = 10; t < 15; t += 1) api.cue(t + .5, a => a.bass(55, .3, .22));

    /* B1: end card, then the whole blueprint */
    const end = at(add(stage, 'sg-end'), 0, 900); const ew = add(end, 'sg-ew'); ew.append(keyClone(), el('b', null, 'Signal'));
    add(end, 'sg-et', 'One key. Every API. Every model.'); add(end, 'sg-cmd', '$ npx signal init');
    const l3 = lens(1170, 1280, 300, { photo: api.PX(37605913, 640), fallback: 'radial-gradient(circle,#123,#05070b)', alt: 'Server rack lights' }, 'ONE KEY · ALL REGIONS'); end.append(l3); l3.style.left = '1170px'; l3.style.top = '380px';
    tl.from(end, { opacity: 0, duration: .01 }, 13.2);
    tl.to(stage, { scale: .5, x: 0, y: 0, duration: 1.3, ease: 'expo.inOut' }, 13.25);
    go(13.25, 520, 1330, 1.1);
    api.cue(13.25, a => { a.riser(1.1, .1); }); api.cue(14.35, a => a.chime(.14));
  }
};
function demo(root, H) { H.motion(root, FILM); }

  demo(document.getElementById('mo'), H);
})();
