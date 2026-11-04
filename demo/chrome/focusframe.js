/* FocusFrame — Chrome extension page with a live browser simulator (Bazozo Studio).
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
    if (window.ScrollTrigger) G.from('.cx', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.cx', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };
  /* ---------- Chrome toolbar popup ---------- */
  const cxExt = $('#cxExt'), cxPop = $('#cxPop');
  let cxOpen = false; const cxHooks = [];
  function cxShow() { if (cxOpen) return; cxOpen = true; cxPop.hidden = false; cxExt.setAttribute('aria-expanded', 'true'); if (G && !reduced) G.fromTo(cxPop, { scale: .88, opacity: 0, y: -8 }, { scale: 1, opacity: 1, y: 0, duration: .45, ease: 'back.out(1.8)' }); cxHooks.forEach(f => f(true)); }
  function cxHide() { if (!cxOpen) return; cxOpen = false; cxExt.setAttribute('aria-expanded', 'false'); const done = () => { cxPop.hidden = true; if (G) G.set(cxPop, { clearProps: 'all' }); }; if (G && !reduced) G.to(cxPop, { scale: .92, opacity: 0, duration: .18, onComplete: done }); else done(); cxHooks.forEach(f => f(false)); }
  cxExt.addEventListener('click', () => cxOpen ? cxHide() : cxShow());
  $('#cxPopX').addEventListener('click', cxHide);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && cxOpen && !menuOpen) cxHide(); });
  H.pop = { body: $('#cxPopBody'), open: cxShow, close: cxHide, isOpen: () => cxOpen, onToggle: f => cxHooks.push(f) };
  H.badge = v => { const b = $('#cxBadge'); b.hidden = v == null || v === '' || v === 0; b.textContent = String(v); if (G && !reduced && !b.hidden) G.fromTo(b, { scale: 1.6 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); };
  H.url = t => { $('#cxUrl').textContent = t; };
  H.flyToIcon = (fromEl, color) => {
    if (!G || reduced) return; const a = fromEl.getBoundingClientRect(), b = cxExt.getBoundingClientRect(), d = el('i');
    Object.assign(d.style, { position: 'fixed', zIndex: 95, left: a.left + a.width / 2 + 'px', top: a.top + a.height / 2 + 'px', width: '14px', height: '14px', margin: '-7px 0 0 -7px', borderRadius: '50%', background: color || 'var(--accent)', boxShadow: '0 0 14px var(--accent)', pointerEvents: 'none' });
    document.body.append(d);
    G.to(d, { x: b.left + b.width / 2 - (a.left + a.width / 2), duration: .6, ease: 'power1.in' });
    G.to(d, { y: b.top + b.height / 2 - (a.top + a.height / 2), duration: .6, ease: 'back.in(1.4)', onComplete: () => { d.remove(); G.fromTo(cxExt, { scale: 1.35 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); } });
  };

/* ---------- extension simulator ---------- */
  function demo(page, H) {
    const { el, svgEl, G, reduced, toast, audio } = H, pb = H.pop.body;
    // simulated social feed
    const feed = el('div', 'ff-site'), top = el('div', 'ff-top'); top.append(el('b', null, 'scrollr'), el('span', null, 'Home · Trending · Reels'));
    const cols = el('div', 'ff-cols'), main = el('div', 'ff-feed'), aside = el('aside', 'ff-aside');
    const POSTS = [['Mia', 'You will not BELIEVE what this cat did next 😱', '#F472B6'], ['Dev Daily', '27 tabs open and counting. Who else?', '#60A5FA'], ['Travel Now', 'Hidden beaches nobody tells you about (thread 1/40)', '#34D399'], ['Ken', 'Hot take: pineapple belongs on everything', '#FBBF24'], ['Clipz', 'Reel: 3-second trick that changes everything', '#A78BFA']];
    POSTS.forEach(([n, t, c]) => { const p = el('article', 'ff-post'); const h = el('div', 'ff-ph'); const av = el('i'); av.style.background = c; h.append(av, el('b', null, n), el('span', null, '2m')); const img = el('div', 'ff-img'); img.style.background = `linear-gradient(135deg, ${c}, #1F2937)`; p.append(h, el('p', null, t), img, el('div', 'ff-acts', '♡ 2.4k   💬 318   ↗ Share')); main.append(p); });
    aside.append(el('b', null, 'Trending'), ...['#MondayMood', '#CatsOfScrollr', '#HotTakes', '#Reels'].map(t => el('span', null, t)));
    cols.append(main, aside);
    const shield = el('div', 'ff-shield'); shield.hidden = true; const sh = el('div', 'ff-shc'); sh.append(el('b', null, 'Blocked by FocusFrame'), el('p', null, 'Back to the thing that matters.'), el('span', 'ff-sht'));
    const peek = el('button', 'ff-peek', 'Peek for 30 seconds'); peek.type = 'button'; sh.append(peek); shield.append(sh);
    feed.append(top, cols, shield); page.append(feed);
    // popup
    const MODES = [['Focus', 25 * 60], ['Short break', 5 * 60], ['Demo · 1 min', 60]];
    let mode = 0, total = MODES[0][1], left = total, running = false, iv = null, fast = false, block = false, sessions = 0, peekT = null;
    const C = 2 * Math.PI * 70, ring = svgEl('svg', { viewBox: '0 0 170 170', class: 'ff-ring', role: 'img', 'aria-label': 'Countdown' });
    ring.append(svgEl('circle', { cx: 85, cy: 85, r: 70, fill: 'none', stroke: 'rgba(255,255,255,.08)', 'stroke-width': 10 }));
    const arc = svgEl('circle', { cx: 85, cy: 85, r: 70, fill: 'none', stroke: '#F2A65A', 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-dasharray': C, 'stroke-dashoffset': 0, transform: 'rotate(-90 85 85)' }); ring.append(arc);
    const tt = svgEl('text', { x: 85, y: 92, 'text-anchor': 'middle', 'font-size': 32, 'font-weight': 700, fill: '#E8F1EC' }); const tl = svgEl('text', { x: 85, y: 114, 'text-anchor': 'middle', 'font-size': 11, fill: '#9DB8AC' }); ring.append(tt, tl);
    const modes = el('div', 'ff-modes'); MODES.forEach(([n], i) => { const b = el('button', null, n); b.type = 'button'; b.setAttribute('aria-pressed', String(i === mode)); b.addEventListener('click', () => { mode = i; total = left = MODES[i][1]; stop(); modes.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw(); }); modes.append(b); });
    const ctrl = el('div', 'ff-ctrl'), go = el('button', 'btn pri', 'Start'), rst = el('button', 'ff-rst', 'Reset'); go.type = rst.type = 'button'; ctrl.append(go, rst);
    const sounds = el('div', 'ff-snd'); const SND = [['rain', 'Rain'], ['cafe', 'Café'], ['white', 'White noise']]; let sndOn = null, sndNode = null;
    SND.forEach(([k, n]) => { const b = el('button', null, n); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', () => { const on = sndOn !== k; stopSound(); sounds.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false')); if (on) { startSound(k); sndOn = k; b.setAttribute('aria-pressed', 'true'); } }); sounds.append(b); });
    const blockRow = el('div', 'ff-block'), bt = el('button', 'ff-tg'); bt.type = 'button'; bt.setAttribute('role', 'switch'); bt.setAttribute('aria-checked', 'false'); bt.setAttribute('aria-label', 'Block distracting sites');
    const bl = el('div'); bl.append(el('b', null, '🛡 Block distracting sites'), el('small', null, 'scrollr, videotube, newsfeed')); blockRow.append(bl, bt);
    const speed = el('label', 'ff-fast'), sp = el('input'); sp.type = 'checkbox'; sp.addEventListener('change', () => { fast = sp.checked; if (running) { stop(); start(); } }); speed.append(sp, document.createTextNode(' Demo speed ×60'));
    const sess = el('p', 'ff-sess');
    pb.append(ring, modes, ctrl, el('p', 'ff-l', 'Ambient sound'), sounds, blockRow, speed, sess);
    const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    function draw() { arc.setAttribute('stroke-dashoffset', C * (1 - left / total)); tt.textContent = fmt(left); tl.textContent = running ? MODES[mode][0].toLowerCase() + ' · running' : 'ready'; arc.setAttribute('stroke', mode === 1 ? '#7BC6A4' : '#F2A65A'); go.textContent = running ? 'Pause' : left < total ? 'Resume' : 'Start'; sess.textContent = `${sessions} focus session${sessions === 1 ? '' : 's'} today`; sh.querySelector('.ff-sht').textContent = running ? `${fmt(left)} left in this session` : 'Timer paused'; H.badge(running ? Math.ceil(left / 60) + 'm' : ''); }
    function tick() { left--; if (left <= 0) { left = 0; stop(); if (mode !== 1) sessions++; toast(mode === 1 ? 'Break over. Ready for another round?' : 'Session complete. Take five.'); try { H.tone(880, .4, 'sine', .06); setTimeout(() => H.tone(660, .5, 'sine', .06), 250); } catch (_) {} if (G && !reduced) G.fromTo(ring, { scale: 1.1 }, { scale: 1, duration: .8, ease: 'elastic.out(1,.4)' }); } draw(); }
    function start() { running = true; clearInterval(iv); iv = setInterval(tick, fast ? 1000 / 60 : 1000); draw(); }
    function stop() { running = false; clearInterval(iv); draw(); }
    go.addEventListener('click', () => { running ? stop() : start(); });
    rst.addEventListener('click', () => { stop(); left = total; draw(); });
    function setBlock(v) { block = v; bt.setAttribute('aria-checked', String(v)); feed.classList.toggle('blocked', v); shield.hidden = !v; if (v && G && !reduced) G.fromTo(sh, { scale: .8, opacity: 0 }, { scale: 1, opacity: 1, duration: .6, ease: 'back.out(2)' }); H.url(v ? 'scrollr.social/home  ·  blocked' : 'scrollr.social/home'); }
    bt.addEventListener('click', () => { setBlock(!block); toast(block ? 'Feeds blurred until you switch the shield off.' : 'Shield off. Careful now.'); });
    peek.addEventListener('click', () => { shield.hidden = true; feed.classList.remove('blocked'); clearTimeout(peekT); peekT = setTimeout(() => { if (block) setBlock(true); }, 30000); toast('30-second peek. The shield comes back on its own.'); });
    function stopSound() { if (sndNode) { try { sndNode.g.gain.setTargetAtTime(0, sndNode.a.currentTime, .3); const n = sndNode; setTimeout(() => { try { n.src.stop(); } catch (_) {} }, 1200); } catch (_) {} } sndNode = null; sndOn = null; }
    function startSound(k) {
      const a = audio(); if (!a) { toast('Audio is not available here.'); return; } if (a.state === 'suspended') a.resume();
      const n = a.sampleRate * 2, buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); let last = 0;
      for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; if (k === 'cafe') { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
      const src = a.createBufferSource(); src.buffer = buf; src.loop = true; const f = a.createBiquadFilter(); f.type = k === 'rain' ? 'bandpass' : 'lowpass'; f.frequency.value = k === 'rain' ? 2200 : k === 'cafe' ? 700 : 9000; const g = a.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(k === 'white' ? .05 : .12, a.currentTime + 1);
      src.connect(f).connect(g).connect(a.destination); src.start(); sndNode = { a, src, g };
    }
    draw(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
