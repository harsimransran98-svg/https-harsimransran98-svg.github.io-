/* First Light — Motion-graphics film page: DOM + SVG + GSAP master timeline with Pexels stock media (Bazozo Studio).
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
  const BTN = 3;
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
/* FIRST LIGHT — isometric 3D map tilt (rotateX 28°) · Bg 6 topographic contours drawn by stroke-dashoffset + sunburst rays · Type 4 highlight pill & mask reveal · Frame 4 Polaroid trail cards */
const STOPS = [
  { n: 'Visitor Center', x: 420, y: 1180, km: 0, note: 'Trailhead · lockers · guides', media: { photo: 2918149, alt: 'Forest trail with a rope railing' } },
  { n: 'Canopy Falls', x: 900, y: 860, km: 1.2, note: '32 m fall · swim at the pool', media: { video: '5736057/5736057-hd_1280_720_24fps.mp4', cr: 'PAT WHELEN' } },
  { n: 'Hanging Bridge', x: 1380, y: 1040, km: 1.67, note: '84 m span · 40 m above the gorge', media: { video: '4782376/4782376-hd_1280_720_30fps.mp4', cr: 'PEXELS' } },
  { n: 'Mirror Lake', x: 1760, y: 700, km: .8, note: 'Still water before 6 am', media: { video: '15944393/15944393-hd_1280_720_30fps.mp4', cr: 'ACER BAYED' } },
  { n: 'The Sun Gate', x: 2080, y: 320, km: 2, note: 'Sunrise 06:12 · east ridge', media: { photo: 417074, alt: 'Mountain peaks glowing at sunrise over a lake' } }
];
const LEGS = ['M420 1180 C560 1100 760 1000 900 860', 'M900 860 C1020 760 1240 1180 1380 1040', 'M1380 1040 C1520 900 1560 760 1760 700', 'M1760 700 C1960 640 1900 420 2080 320'];
const PEAKS = [[700, 470, 9], [1500, 420, 10], [2060, 300, 8], [1150, 1230, 8], [260, 780, 7], [1880, 1180, 7]];

const FILM = {
  id: 'FirstLight', dur: 20, fps: 60, seed: 41, poster: 15.2,
  alt: 'First Light: a resort trail motion film. A topographic reserve map draws itself, tilts into 3D and a glowing route runs through five stops from the Visitor Center to the Sun Gate, each with a Polaroid of real waterfall, bridge, lake and mountain footage and a walking time.',
  badge: 'ISO MAP TILT 28° · LIVE',
  scenes: [[0, 'Title'], [2.6, 'Visitor Center'], [4.2, 'Canopy Falls'], [7.2, 'Hanging Bridge'], [10.2, 'Mirror Lake'], [13.2, 'The Sun Gate'], [16.4, 'Full route']],
  tracks: {
    V1: [[0, 2.6, 'Top-down · 0.62×'], [2.6, 4.2, 'Tilt 28° · dive'], [4.2, 16.2, 'Follow the light pulse · 4 legs'], [16.2, 20, 'Lift to overview']],
    V2: [[0, 2.6, 'Contours draw · pill title'], [4.2, 16.2, 'Route draw · stop labels'], [16.4, 20, 'Pill end card']],
    V3: [[2.8, 7, 'Polaroid · trailhead'], [5.6, 9, 'Canopy Falls'], [8.6, 12, 'Hanging Bridge'], [11.6, 15, 'Mirror Lake'], [14.6, 17, 'Sun Gate']],
    A1: [[0, 4, 'Wind + pad'], [4.2, 16.2, 'Marimba stops · birds'], [14.6, 20, 'Sunrise chord']]
  },
  props: [
    { k: 'pace', label: 'Walking pace', type: 'range', min: 2.5, max: 6, step: .5, v: 4, rebuild: true, fmt: v => v.toFixed(1) + ' km/h' },
    { k: 'route', label: 'Route colour', type: 'chips', v: '#FACC15', options: [['#FACC15', 'Sunburst'], ['#FB7185', 'Coral'], ['#FBF6E9', 'Chalk']] },
    { k: 'reserve', label: 'Reserve name', type: 'text', max: 20, v: 'Ivayu Reserve', rebuild: true },
    { k: 'start', label: 'Start time', type: 'text', max: 8, v: '04:40', rebuild: true }
  ],
  onProp(k, v, api) { if (k === 'route') api.view.style.setProperty('--fl-route', v); },
  build(api) {
    const { tl, stage, hud, split, G, el, svgEl, rnd } = api, P = api.props;
    const add = (p, cls, text) => api.add(p, 'div', cls, text);
    const mins = STOPS.map(s => Math.round(s.km / P.pace * 60)); const total = mins.reduce((a, b) => a + b, 0), km = STOPS.reduce((a, s) => a + s.km, 0);

    /* the map plane */
    /* three planes: rotating sunburst (composited), static contours, live route layer, so only the route repaints */
    const map = add(stage, 'fl-map');
    const raysW = add(map, 'fl-raysw'); const rs = svgEl('svg', { viewBox: '-1300 -1300 2600 2600', width: 2600, height: 2600 }); raysW.append(rs); const gRays = svgEl('g', { class: 'fl-rays' }); rs.append(gRays);
    for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, b = a + .07; gRays.append(svgEl('path', { d: `M0 0 L${Math.cos(a) * 1300} ${Math.sin(a) * 1300} L${Math.cos(b) * 1300} ${Math.sin(b) * 1300} Z` })); }
    const svgS = svgEl('svg', { viewBox: '0 0 2400 1500', width: 2400, height: 1500, class: 'fl-svg' }); map.append(svgS);
    const svg = svgEl('svg', { viewBox: '0 0 2400 1500', width: 2400, height: 1500, class: 'fl-svg fl-dyn' }); map.append(svg);
    const gTopo = svgEl('g', { class: 'fl-topo' }); svgS.append(gTopo); const contours = [];
    PEAKS.forEach(([px, py, n]) => {
      const ph = rnd() * 6, k1 = 2 + Math.floor(rnd() * 3), k2 = 4 + Math.floor(rnd() * 3);
      for (let r = 1; r <= n; r++) {
        const R = r * 44; let d = '';
        for (let j = 0; j <= 48; j++) { const a = j / 48 * Math.PI * 2, rr = R * (1 + .16 * Math.sin(a * k1 + ph + r * .3) + .07 * Math.sin(a * k2 - ph)); d += (j ? ' L' : 'M') + (px + Math.cos(a) * rr * 1.25).toFixed(1) + ' ' + (py + Math.sin(a) * rr).toFixed(1); }
        const p = svgEl('path', { d: d + ' Z', pathLength: 1, class: r % 4 === 0 ? 'idx' : '' }); gTopo.append(p); contours.push(p);
      }
    });
    const river = svgEl('path', { d: 'M0 1010 C260 940 380 1060 620 990 S1000 760 1160 900 S1500 1240 1720 1080 S2140 880 2400 960', class: 'fl-river', pathLength: 1 }); svgS.append(river);
    const legs = LEGS.map(d => { const p = svgEl('path', { d, class: 'fl-leg', pathLength: 1 }); svg.append(p); return p; });
    const legsGlow = LEGS.map(d => { const p = svgEl('path', { d, class: 'fl-legg', pathLength: 1 }); svg.insertBefore(p, legs[0]); return p; });
    const marks = STOPS.map((s, i) => {
      const g = svgEl('g', { class: 'fl-stop', transform: `translate(${s.x} ${s.y})` }); const c = svgEl('circle', { r: 16 }); const h = svgEl('circle', { r: 30, class: 'h' });
      const t = svgEl('text', { x: 0, y: 64, 'text-anchor': 'middle' }); t.textContent = s.n; const no = svgEl('text', { x: 0, y: 6, 'text-anchor': 'middle', class: 'no' }); no.textContent = i + 1;
      g.append(h, c, no, t); svg.append(g); return g;
    });
    const pulse = svgEl('g', { class: 'fl-pulse' }); pulse.append(svgEl('circle', { r: 46, class: 'a' }), svgEl('circle', { r: 24, class: 'b' }), svgEl('circle', { r: 10, class: 'c' })); svg.append(pulse);
    G.set(pulse, { x: STOPS[0].x, y: STOPS[0].y });

    /* camera: top-down overview → isometric tilt → follow the pulse */
    G.set(stage, { transformOrigin: '800px 450px', scale: .62 });
    const focus = s => ({ x: 1200 - s.x, y: 750 - s.y + 110 });
    tl.to(stage, { rotateX: 28, rotateZ: -6, scale: 1.25, duration: 1.6, ease: 'expo.inOut' }, 2.6);
    tl.to(map, { ...focus(STOPS[0]), duration: 1.6, ease: 'expo.inOut' }, 2.6);
    api.cue(2.6, a => a.whoosh(1.4, .14));

    /* Bg 6: contours draw themselves */
    tl.fromTo(contours, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.8, stagger: { each: .012, from: 'random' }, ease: 'power2.out', immediateRender: true }, .1);
    tl.fromTo(river, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 2.4, ease: 'power1.inOut', immediateRender: true }, .4);
    tl.from(marks, { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: .5, stagger: .1, ease: 'back.out(3)' }, 1.4);
    tl.fromTo(raysW, { rotation: 0 }, { rotation: 36, duration: 20, ease: 'none' }, 0);
    [legs, legsGlow].forEach(set => tl.set(set, { attr: { 'stroke-dasharray': 1, 'stroke-dashoffset': 1 } }, 0));

    /* Type 4: mask reveal + highlight pills */
    const title = add(hud, 'fl-title');
    const line = (txt, pillWord, cls) => {
      const m = add(title, 'fl-mask ' + (cls || '')); const inner = add(m, 'fl-in'); const out = { m, inner, pill: null };
      txt.split(' ').forEach((w, i) => { if (i) inner.append(document.createTextNode(' ')); const s = el('span', 'fl-wd', w); if (w === pillWord) { const p = el('i', 'fl-pill'); s.prepend(p); out.pill = p; s.classList.add('hl'); } inner.append(s); });
      return out;
    };
    const k1 = add(title, 'fl-kick', `${P.reserve.toUpperCase()} · SUNRISE TREK · ${P.start} START`);
    const l1 = line('Five stops.', 'Five'), l2 = line('One sunrise.', 'sunrise.', 'c');
    tl.from(k1, { opacity: 0, y: 20, duration: .6, ease: 'expo.out' }, .2);
    [l1, l2].forEach((l, i) => { tl.from(l.inner, { yPercent: 110, duration: .9, ease: 'expo.out' }, .35 + i * .3); tl.fromTo(l.pill, { scaleX: 0 }, { scaleX: 1, duration: .55, ease: 'expo.inOut', immediateRender: true }, .9 + i * .3); });
    tl.to([l1.inner, l2.inner], { yPercent: -110, duration: .6, stagger: .08, ease: 'power3.in' }, 2.3); tl.to(k1, { opacity: 0, duration: .3 }, 2.3);
    api.cue(.05, a => { a.hiss(3.5, { v: .07, type: 'lowpass', f: 600, a: 1.2 }); a.pad([146.83, 220, 293.66, 369.99], 3.6, .14); });

    /* Frame 4: Polaroids in the HUD, pinned every frame to the projected stop on the tilted map */
    const pols = STOPS.map((s, i) => {
      const p = add(hud, 'fl-pol'); const ph = s.media.video ? api.stock({ video: api.PXV(s.media.video), from: 2.6 + i * 3 - .4, to: 2.6 + i * 3 + 4, cls: 'fl-ph', fallback: 'linear-gradient(160deg,#2f6b4c,#0d3b26)' }) : api.stock({ photo: api.PX(s.media.photo, 640), cls: 'fl-ph', fallback: 'linear-gradient(160deg,#2f6b4c,#0d3b26)', alt: s.media.alt });
      p.append(ph); const cap = add(p, 'fl-cap'); cap.append(el('b', null, s.n), el('span', null, s.note));
      const badge = add(p, 'fl-time', i ? `+${mins[i]} min` : 'START'); p.badge = badge; p.style.setProperty('--r', ((i % 2 ? 1 : -1) * (3 + rnd() * 3)).toFixed(1) + 'deg');
      return p;
    });
    api.tick(() => {
      const rr = api.rig.getBoundingClientRect(), k = rr.width / api.W || 1;
      pols.forEach((p, i) => { if (p.style.visibility === 'hidden') return; const r = marks[i].getBoundingClientRect(); const x = (r.left + r.width / 2 - rr.left) / k, y = (r.top + r.height / 2 - rr.top) / k; p.style.left = x.toFixed(1) + 'px'; p.style.top = y.toFixed(1) + 'px'; });
    });

    /* the route: a light pulse leads the camera along each leg */
    const notes = [392, 440, 523.25, 587.33, 659.25];
    STOPS.forEach((s, i) => {
      const arrive = i === 0 ? 2.9 : 4.2 + (i - 1) * 3 + 1.6;
      const p = pols[i];
      tl.set(p, { autoAlpha: 0 }, 0); tl.set(p, { autoAlpha: 1 }, arrive);
      tl.fromTo(p, { scale: .2, rotation: 0, yPercent: 0 }, { scale: 1, rotation: () => parseFloat(p.style.getPropertyValue('--r')), duration: .7, ease: 'back.out(1.8)', immediateRender: false }, arrive);
      tl.from(p.badge, { scale: 0, duration: .4, ease: 'back.out(3)' }, arrive + .45);
      if (i < STOPS.length - 1) tl.to(p, { scale: .35, opacity: 0, duration: .4, ease: 'power2.in' }, 4.2 + i * 3 + .9); else tl.to(p, { scale: .6, opacity: 0, duration: .5, ease: 'power2.in' }, 16.3);
      tl.to(marks[i], { scale: 1.35, transformOrigin: '50% 50%', duration: .4, ease: 'back.out(3)' }, arrive - .1).to(marks[i], { scale: 1, duration: .5 }, arrive + .3);
      tl.set(marks[i], { attr: { class: 'fl-stop on' } }, arrive - .1);
      api.cue(arrive, a => { a.pluck(notes[i], .9, .16); a.pluck(notes[i] * 1.5, .7, .08); });
      if (i === 0) return;
      const t0 = 4.2 + (i - 1) * 3, d = 1.6, leg = legs[i - 1];
      tl.to([leg, legsGlow[i - 1]], { attr: { 'stroke-dashoffset': 0 }, duration: d, ease: 'sine.inOut' }, t0);
      if (window.MotionPathPlugin) tl.to(pulse, { motionPath: { path: leg, align: leg, alignOrigin: [.5, .5] }, duration: d, ease: 'sine.inOut' }, t0);
      else { const L = leg.getTotalLength(), o = { p: 0 }; tl.to(o, { p: 1, duration: d, ease: 'sine.inOut', onUpdate: () => { const pt = leg.getPointAtLength(o.p * L); G.set(pulse, { x: pt.x, y: pt.y }); } }, t0); }
      tl.to(map, { ...focus(s), duration: d + .25, ease: 'sine.inOut' }, t0);
      tl.to(stage, { rotateZ: i % 2 ? 4 : -6, scale: i === 4 ? 1.15 : 1.3, duration: d + .25, ease: 'sine.inOut' }, t0);
      api.cue(t0, a => a.whoosh(1.2, .08));
      for (let b = 0; b < 3; b++) api.cue(t0 + .3 + rnd() * 1.2, a => { const f = 2200 + rnd() * 1400; a.osc(f, .07, { v: .03, to: f * 1.4 }); a.osc(f * 1.1, .05, { v: .02, to: f * 1.6, at: .09 }); });
    });
    for (let t = 4.2; t < 16; t += 60 / 90 / 2) api.cue(t, a => a.hat(.025, .03));

    /* The Sun Gate: rays flare, the map glows gold */
    tl.to(raysW, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 14.3);
    tl.to(api.view, { '--fl-glow': 'rgba(250,204,21,.45)', duration: 1.2 }, 14.3);
    api.flash(14.6, 'rgba(250,204,21,.55)', .9);
    api.cue(14.6, a => { a.pad([293.66, 369.99, 440, 587.33, 739.99], 4.5, .2); a.bell(1174.66, .1, 2.5); });

    /* lift back to the overview and close with pills */
    tl.to(stage, { rotateX: 0, rotateZ: 0, scale: .62, duration: 1.8, ease: 'expo.inOut' }, 16.2);
    tl.to(map, { x: 0, y: 0, duration: 1.8, ease: 'expo.inOut' }, 16.2);
    const end = add(hud, 'fl-end'); const e1 = line.call(null, 'Arrive before first light.', 'first'); end.append(e1.m); e1.m.classList.add('e');
    const e1b = e1.inner.querySelectorAll('.fl-wd'); e1b.forEach(w => { if (w.textContent === 'light.') { w.classList.add('hl'); w.prepend(el('i', 'fl-pill c')); } });
    const eStats = add(end, 'fl-stats'); [[`${km.toFixed(1)} km`, 'distance'], [`${Math.floor(total / 60)} h ${total % 60} min`, `at ${P.pace} km/h`], ['5 stops', 'one sunrise']].forEach(([a, b]) => { const d = add(eStats, 'fl-st'); d.append(el('b', null, a), el('span', null, b)); });
    const brand = add(end, 'fl-brand', P.reserve);
    tl.set(end, { autoAlpha: 0 }, 0); tl.set(end, { autoAlpha: 1 }, 16.6);
    tl.from(e1.inner, { yPercent: 110, duration: .9, ease: 'expo.out' }, 16.7);
    tl.fromTo(end.querySelectorAll('.fl-pill'), { scaleX: 0 }, { scaleX: 1, duration: .6, stagger: .15, ease: 'expo.inOut', immediateRender: true }, 17.3);
    tl.from(eStats.children, { y: 30, opacity: 0, duration: .6, stagger: .1, ease: 'expo.out' }, 17.6);
    tl.from(brand, { opacity: 0, letterSpacing: '.8em', duration: 1, ease: 'expo.out' }, 18);
    api.cue(16.7, a => a.chime(.12));
  }
};
function demo(root, H) { H.motion(root, FILM); }

  demo(document.getElementById('mo'), H);
})();
