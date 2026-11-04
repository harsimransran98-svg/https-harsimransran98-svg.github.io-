/* Home Cooked — Motion-graphics film page: DOM + SVG + GSAP master timeline with Pexels stock media (Bazozo Studio).
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
/* HOME COOKED — chef's-table overhead macro dolly with lazy-Susan rotation · walnut table + rising steam · editorial serif split-apart · circular plate frames + arched chef portrait */
const DISHES = [
  { n: 'Smoky Pan Veg', p: '₹249', x: 470, y: 470, r: 230, v: '854216/854216-hd_1280_720_25fps.mp4', cr: 'PEXELS · ELA HANEY' },
  { n: 'Puri Platter', p: '₹189', x: 1150, y: 300, r: 190, v: '9320054/9320054-hd_720_1280_30fps.mp4', cr: 'PEXELS · PANKAJ PATEL' },
  { n: 'Wok Noodles', p: '₹229', x: 1180, y: 700, r: 200, v: '12837557/12837557-hd_720_1280_25fps.mp4', cr: 'PEXELS' }
];
const FILM = {
  id: 'HomeCooked', dur: 16, fps: 60, seed: 17, poster: 8.6,
  alt: 'Home Cooked: a cloud-kitchen motion film. The words Home and Cooked part to reveal a sizzling pan, an overhead camera turns a chef’s table of real cooking footage, nutrient rings scale with servings and a delivery tracker counts down eighteen minutes.',
  badge: 'CHEF’S TABLE DOLLY · LIVE',
  scenes: [[0, 'Split title'], [3.2, 'The table'], [7, 'Macro dish'], [10.5, '18 min'], [13.5, 'Order']],
  props: [
    { k: 'servings', label: 'Servings', type: 'range', min: 1, max: 6, step: 1, v: 2, rebuild: true, fmt: v => v + '×' },
    { k: 'dish', label: 'Dish name', type: 'text', max: 24, v: 'Saffron Veg Skillet', rebuild: true },
    { k: 'minutes', label: 'Delivery time', type: 'range', min: 10, max: 45, step: 1, v: 18, rebuild: true, fmt: v => v + ' min' },
    { k: 'accent', label: 'Accent', type: 'chips', v: '#F97316', options: [['#F97316', 'Saffron'], ['#DC2626', 'Chili'], ['#65A30D', 'Basil']] }
  ],
  onProp(k, v, api) { if (k === 'accent') api.view.style.setProperty('--hc-acc', v); },
  build(api) {
    const { tl, stage, hud, split, G, el, svgEl, rnd } = api, P = api.props;
    const add = (p, cls, text) => api.add(p, 'div', cls, text);
    G.set(stage, { transformOrigin: '800px 450px' });
    /* camera helper: centre a table point at scale s and table rotation r */
    const focus = (px, py, s, r) => { const a = r * Math.PI / 180, dx = (px - 800) * s, dy = (py - 450) * s; return { x: -(dx * Math.cos(a) - dy * Math.sin(a)), y: -(dx * Math.sin(a) + dy * Math.cos(a)), scale: s, rotation: r }; };

    /* the table (stage) and its labels (mirror plane, always above the footage) */
    add(stage, 'hc-table'); add(stage, 'hc-pool');
    const herbs = []; for (let i = 0; i < 18; i++) { const h = add(stage, 'hc-herb'); h.style.left = 200 + rnd() * 1200 + 'px'; h.style.top = 120 + rnd() * 700 + 'px'; h.style.transform = `rotate(${rnd() * 360}deg)`; herbs.push(h); }
    const top = api.mirror();
    const plates = DISHES.map((d, i) => {
      const pl = add(stage, 'hc-plate'); Object.assign(pl.style, { left: d.x - d.r - 26 + 'px', top: d.y - d.r - 26 + 'px', width: d.r * 2 + 52 + 'px', height: d.r * 2 + 52 + 'px' });
      const m = api.stock({ video: api.PXV(d.v), from: 2.8, to: 10.6, cls: 'hc-food', fallback: 'radial-gradient(circle,#7c3d12,#2a160b)' }); pl.append(m);
      const tag = add(top, 'hc-tag'); tag.style.left = d.x + d.r * .55 + 'px'; tag.style.top = d.y + d.r * .62 + 'px'; tag.append(el('b', null, d.n), el('span', null, d.p));
      const cr = add(top, 'hc-cr', d.cr); cr.style.left = d.x - 60 + 'px'; cr.style.top = d.y + d.r + 34 + 'px';
      for (let k = 0; k < 3; k++) { const s = add(top, 'hc-steam'); s.style.left = d.x - 40 + k * 34 + 'px'; s.style.top = d.y - d.r * .3 + 'px'; tl.fromTo(s, { y: 0, opacity: 0, scale: .6 }, { y: -170, opacity: .55, scale: 1.4, duration: 1.6, repeat: 6, ease: 'sine.out', delay: k * .5 }, 3.2); }
      tl.from(pl, { scale: 0, rotation: -40, duration: .7, ease: 'back.out(1.7)' }, 3.4 + i * .22);
      tl.from(tag, { x: -30, opacity: 0, duration: .5, ease: 'expo.out' }, 3.9 + i * .22);
      api.cue(3.4 + i * .22, a => { a.osc(180 - i * 20, .12, { type: 'triangle', v: .25, to: 90 }); a.click(.1); });
      return pl;
    });
    tl.from(herbs, { opacity: 0, scale: 0, duration: .4, stagger: .02 }, 3.6);

    /* lazy-Susan dolly */
    G.set(stage, focus(800, 450, .95, -8));
    tl.to(stage, { ...focus(820, 480, 1, 4), duration: 2.4, ease: 'sine.inOut' }, 3.2);
    tl.to(stage, { ...focus(DISHES[1].x, DISHES[1].y, 1.7, 10), duration: 1.4, ease: 'expo.inOut' }, 5.6);
    tl.to(stage, { ...focus(DISHES[0].x, DISHES[0].y, 2.25, -6), duration: 1.6, ease: 'expo.inOut' }, 7);
    tl.to(stage, { ...focus(DISHES[0].x + 40, DISHES[0].y, 2.45, -2), duration: 3.3, ease: 'sine.inOut' }, 8.6);
    tl.to(stage, { ...focus(900, 500, 1.15, 14), duration: 1.6, ease: 'expo.inOut' }, 10.5);
    tl.to(stage, { ...focus(900, 500, 1.05, 22), duration: 2, ease: 'sine.inOut' }, 12.1);
    api.cue(5.6, a => a.whoosh(1.1, .1)); api.cue(7, a => a.whoosh(1.2, .1)); api.cue(10.5, a => a.whoosh(1.2, .1));

    /* scene A: editorial serif split-apart over a sizzling pan (HUD) */
    const intro = add(hud, 'hc-intro'); const win = api.stock({ video: api.PXV('4139331/4139331-hd_1366_720_24fps.mp4'), from: 0, to: 3.4, cls: 'hc-win', fallback: 'radial-gradient(circle,#6b2f12,#140f0b)', label: 'PEXELS · SIZZLE' }); intro.append(win);
    const wL = add(intro, 'hc-w l', 'Home'), wR = add(intro, 'hc-w r', 'Cooked.'); const kick = add(intro, 'hc-kick', 'CLOUD KITCHEN · SLOW FOOD, FAST');
    tl.fromTo(win, { clipPath: 'inset(48% 50% 48% 50% round 200px)' }, { clipPath: 'inset(22% 36% 22% 36% round 200px)', duration: 1.3, ease: 'expo.inOut', immediateRender: true }, .7);
    tl.from([wL, wR], { yPercent: 70, opacity: 0, duration: .9, stagger: .12, ease: 'expo.out' }, .1);
    tl.fromTo(wL, { x: 170 }, { x: 0, duration: 1.3, ease: 'expo.inOut', immediateRender: false }, .7); tl.fromTo(wR, { x: -170 }, { x: 0, duration: 1.3, ease: 'expo.inOut', immediateRender: false }, .7);
    tl.from(kick, { opacity: 0, letterSpacing: '.9em', duration: 1, ease: 'expo.out' }, 1.2);
    tl.fromTo(win, { clipPath: 'inset(22% 36% 22% 36% round 200px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: .8, ease: 'expo.inOut', immediateRender: false }, 2.4);
    tl.to([wL, wR, kick], { opacity: 0, scale: 1.2, duration: .5, ease: 'power2.in' }, 2.5);
    tl.to(intro, { autoAlpha: 0, duration: .5 }, 3.05);
    for (let t = .1; t < 3.2; t += .23) api.cue(t, a => a.hiss(.22, { v: .05 + rnd() * .05, f: 2800 + rnd() * 3000 }));

    /* scene C: macro-nutrient rings for N servings (HUD card) */
    const S = P.servings, nut = [['Protein', 18 * S, 60 * Math.max(1, S / 2), '#F97316'], ['Carbs', 42 * S, 160 * Math.max(1, S / 2), '#FDE68A'], ['Fat', 14 * S, 50 * Math.max(1, S / 2), '#FDF8F5']];
    const card = add(hud, 'hc-card'); const ch = add(card, 'hc-ch'); ch.append(el('small', null, `DISH OF THE DAY · ${S} SERVING${S > 1 ? 'S' : ''}`), el('b', null, P.dish));
    const rings = add(card, 'hc-rings'); const arcs = [];
    nut.forEach(([n, g, max, col]) => { const w = add(rings, 'hc-ring'); const s = svgEl('svg', { viewBox: '0 0 120 120' }); s.append(svgEl('circle', { cx: 60, cy: 60, r: 50, class: 'bg' })); const c = svgEl('circle', { cx: 60, cy: 60, r: 50, class: 'fg', stroke: col, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1, transform: 'rotate(-90 60 60)' }); s.append(c); w.append(s); const v = el('b', null, '0 g'); w.append(v, el('span', null, n)); arcs.push([c, Math.min(.98, g / max), v, g]); });
    const kc = add(card, 'hc-kcal'); const kN = el('b', null, '0'); kc.append(kN, el('span', null, ' kcal'));
    tl.set(card, { autoAlpha: 0 }, 0); tl.set(card, { autoAlpha: 1 }, 7.3);
    tl.from(card, { x: 120, opacity: 0, duration: .7, ease: 'expo.out' }, 7.3);
    arcs.forEach(([c, f, v, g], i) => { tl.to(c, { attr: { 'stroke-dashoffset': 1 - f }, duration: 1.3, ease: 'expo.out' }, 7.7 + i * .15); api.count(v, 0, g, 7.7 + i * .15, 1.3, x => Math.round(x) + ' g', 'expo.out'); });
    api.count(kN, 0, Math.round(370 * S), 7.8, 1.6, x => Math.round(x).toLocaleString('en-IN'), 'expo.out');
    tl.to(card, { x: 120, opacity: 0, duration: .45, ease: 'power2.in' }, 10.3);
    api.cue(7.7, a => { a.pluck(587.33, .6, .1); a.pluck(739.99, .6, .08, .1); });

    /* scene D: live delivery tracker (HUD) */
    const trk = add(hud, 'hc-trk'); const big = add(trk, 'hc-min'); const bn = el('b', null, String(P.minutes)); big.append(bn, el('span', null, 'MIN'));
    add(trk, 'hc-eta', 'Arriving at your door');
    const steps = add(trk, 'hc-steps'); const stEls = ['Kitchen', 'Packed', 'On the way', 'Door'].map(n => { const s = add(steps, 'hc-st'); s.append(el('i'), el('span', null, n)); return s; });
    const map = svgEl('svg', { viewBox: '0 0 420 150', class: 'hc-map' }); const route = svgEl('path', { d: 'M20 120 C90 120 90 40 170 40 S260 110 320 80 S390 30 400 30', class: 'hc-route' }); map.append(route); const rider = svgEl('circle', { r: 9, class: 'hc-rider' }); map.append(rider); trk.append(map);
    const pip = api.stock({ video: api.PXV('19043388/19043388-hd_720_1280_30fps.mp4'), from: 10.2, to: 13.6, cls: 'hc-pip', fallback: 'linear-gradient(160deg,#7c2d12,#140f0b)', label: 'PEXELS · FLAME' }); hud.append(pip);
    tl.set([trk, pip], { autoAlpha: 0 }, 0); tl.set([trk, pip], { autoAlpha: 1 }, 10.6);
    tl.from(trk, { y: 80, opacity: 0, duration: .6, ease: 'expo.out' }, 10.6); tl.from(pip, { rotation: 8, x: -120, opacity: 0, duration: .7, ease: 'back.out(1.6)' }, 10.75);
    stEls.forEach((s, i) => { tl.set(s, { attr: { class: 'hc-st' } }, 0); if (i <= 1) tl.set(s, { attr: { class: 'hc-st done' } }, 10.6); if (i === 2) tl.set(s, { attr: { class: 'hc-st done' } }, 11.8); });
    const o = { p: 0 };
    tl.fromTo(o, { p: 0 }, { p: .78, duration: 2.6, ease: 'sine.inOut', onUpdate: () => { const pt = route.getPointAtLength(o.p * route.getTotalLength()); rider.setAttribute('cx', pt.x); rider.setAttribute('cy', pt.y); } }, 10.8);
    tl.fromTo(route, { strokeDasharray: '6 9', strokeDashoffset: 0 }, { strokeDashoffset: -60, duration: 2.6, ease: 'none' }, 10.8);
    [11.4, 12.4].forEach(t => { tl.fromTo(big, { scale: 1.12 }, { scale: 1, duration: .4, ease: 'back.out(3)', immediateRender: false }, t); api.cue(t, a => a.click(.12)); });
    api.tick(t => { const m = P.minutes - (t >= 12.4 ? 2 : t >= 11.4 ? 1 : 0); if (bn.textContent !== String(m)) bn.textContent = String(m); });
    tl.to([trk, pip], { opacity: 0, y: 40, duration: .4, ease: 'power2.in' }, 13.3);
    api.cue(11.8, a => a.chime(.12));

    /* scene E: cream end card with the chef */
    const end = add(hud, 'hc-end'); const arch = api.stock({ photo: api.PX(36430080, 800), cls: 'hc-arch', fallback: 'linear-gradient(160deg,#d6c4b0,#8a6a50)', alt: 'Chef finishing a plated dish in a kitchen' }); end.append(arch);
    const et = add(end, 'hc-et'); et.append(el('em', null, 'Made slow.'), el('b', null, 'Delivered fast.'));
    const ep = add(end, 'hc-ep', `${P.dish} · ${P.minutes} min to your door · order before 9 pm`); const cta = add(end, 'hc-cta', 'Order now →');
    tl.set(end, { autoAlpha: 0 }, 0); tl.to(end, { autoAlpha: 1, duration: .5 }, 13.5);
    tl.fromTo(arch, { clipPath: 'inset(100% 0% 0% 0% round 260px 260px 0px 0px)' }, { clipPath: 'inset(0% 0% 0% 0% round 260px 260px 0px 0px)', duration: 1.1, ease: 'expo.inOut', immediateRender: true }, 13.6);
    tl.from(et.children, { yPercent: 100, opacity: 0, duration: .8, stagger: .15, ease: 'expo.out' }, 13.9);
    tl.from([ep, cta], { y: 24, opacity: 0, duration: .6, stagger: .12, ease: 'expo.out' }, 14.5);
    api.cue(14.5, a => { a.bell(1046.5, .12, 1.6); a.bell(1567.98, .08, 1.8); });

    /* soft jazz: Rhodes chords + brushed swing */
    const ch2 = [[146.83, 174.61, 220, 261.63, 329.63], [98, 123.47, 174.61, 220, 329.63], [130.81, 164.81, 196, 246.94, 293.66], [110, 130.81, 164.81, 196, 246.94]];
    for (let t = 3.2, k = 0; t < 16; t += 2, k++) api.cue(t, a => a.pad(ch2[k % 4], 2.1, .14));
    for (let t = 3.2; t < 13.4; t += .5) { api.cue(t, a => a.hat(.03, .07)); api.cue(t + .33, a => a.hat(.02, .04)); }
  }
};
function demo(root, H) { H.motion(root, FILM); }

  demo(document.getElementById('mo'), H);
})();
