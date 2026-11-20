/* QuietTabs — Firefox add-on page with a live browser simulator (Bazozo Studio, generated).
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
  /* ---------- Firefox toolbar popup ---------- */
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


/* ---------- QuietTabs simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"sites":{"home":{"title":"Firefox Home","host":"about:home","fav":"conic-gradient(from 200deg, #FF9500, #FF2E63, #9059FF, #FF9500)","kind":"home"},"ledger":{"title":"Markets rally on rate news — Daily Ledger","short":"Daily Ledger","host":"dailyledger.example/markets","fav":"#C8102E","kind":"news","sound":"ad","h1":"Markets rally as rate cut hopes grow","text":"Shares climbed for a third straight day as traders priced in an earlier cut. The video above started playing the moment the page opened.","label":"Sponsored video · autoplay"},"wavelength":{"title":"Lo-fi for focus — Wavelength","short":"Wavelength","host":"wavelength.example/focus","fav":"#7B61FF","kind":"music","sound":"chords","h1":"Lo-fi for deep focus","text":"Three hours of slow chords for reading and writing. This site is on your allow list, so it plays even in a background tab.","label":"Now playing · Rainy desk"},"spoon":{"title":"One-pan lemon pasta — Spoonful","short":"Spoonful","host":"spoonful.example/lemon-pasta","fav":"#F2A900","kind":"recipe","sound":"pluck","h1":"One-pan lemon pasta in 15 minutes","text":"Butter, lemon, parmesan and pasta water. The recipe video autoplays at the top of the page, like it does on every recipe site.","label":"Recipe video · autoplay"},"arena":{"title":"LIVE: Final round — Arena TV","short":"Arena TV","host":"arena.example/live","fav":"#00A6A6","kind":"stream","sound":"crowd","h1":"Final round, live from the arena","text":"Live commentary and crowd noise from the opening second. QuietTabs holds it silent until you look at it.","label":"Live stream · autoplay"}},"allow":["wavelength.example"],"key":"qt_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const NS = 'http://www.w3.org/2000/svg';
    const icon = d => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2'); s.setAttribute('stroke-linecap', 'round'); d.forEach(p => { const n = document.createElementNS(NS, 'path'); n.setAttribute('d', p); s.append(n); }); s.setAttribute('aria-hidden', 'true'); return s; };
    const SPK = ['M4 9v6h4l5 4V5L8 9Z', 'M16.5 8.5a5 5 0 0 1 0 7', 'M19 6a8.5 8.5 0 0 1 0 12'], MUTE = ['M4 9v6h4l5 4V5L8 9Z', 'M17 9l5 6', 'M22 9l-5 6'];
    const saved = store.get(M.key, null) || {};
    const S = { on: saved.on !== false, rule: saved.rule === 'keep' ? 'keep' : 'focus', audio: saved.audio === true, allow: Array.isArray(saved.allow) ? saved.allow.filter(h => typeof h === 'string' && Object.values(M.sites).some(x => x.host.split('/')[0] === h)) : M.allow.slice() };
    const save = () => store.set(M.key, { on: S.on, rule: S.rule, audio: S.audio, allow: S.allow });
    const hostOf = k => M.sites[k].host.split('/')[0];
    const allowed = k => S.allow.includes(hostOf(k));
    let uid = 0, active = null, quieted = 0, blocked = 0;
    const tabs = [];

    /* ---- synth audio (quiet, only after a click, only while the browser is on screen) ---- */
    let ctx = null, master = null, visible = true;
    const audioOn = () => S.audio && visible;
    function ensure() { if (!S.audio) return null; if (!ctx) { ctx = H.audio(); if (!ctx) return null; master = ctx.createGain(); master.gain.value = .05; master.connect(ctx.destination); } if (ctx.state === 'suspended' && visible) ctx.resume(); return ctx; }
    const PAT = { ad: [523, 659, 784, 659, 880, 784, 659, 587], chords: [[220, 277, 330], [196, 247, 294], [175, 220, 262], [196, 247, 330]], pluck: [392, 440, 494, 587, 494, 440], crowd: null };
    function note(t, f, dur, type, vol) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(vol, ctx.currentTime + .02); g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + dur); o.connect(g); g.connect(t.gain); o.start(); o.stop(ctx.currentTime + dur + .05); }
    function noise(t) { const n = ctx.createBufferSource(), b = ctx.createBuffer(1, ctx.sampleRate * 1.2, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (.5 + .5 * Math.sin(i / 2600)); n.buffer = b; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = .6; const g = ctx.createGain(); g.gain.value = .5; n.connect(f); f.connect(g); g.connect(t.gain); n.start(); }
    setInterval(() => {
      if (!ctx || !audioOn()) return;
      tabs.forEach(t => { if (!t.playing || !t.gain) return; const k = M.sites[t.site].sound; t.step = (t.step || 0) + 1;
        if (k === 'ad') note(t, PAT.ad[t.step % 8], .22, 'square', .16);
        else if (k === 'pluck') { if (t.step % 2) note(t, PAT.pluck[(t.step >> 1) % 6], .5, 'triangle', .4); }
        else if (k === 'chords') { if (t.step % 4 === 1) PAT.chords[(t.step >> 2) % 4].forEach(f => note(t, f, 1.7, 'sine', .22)); }
        else if (k === 'crowd') { if (t.step % 3 === 1) noise(t); }
      });
    }, 400);
    function voice(t) { if (!M.sites[t.site].sound || !ensure()) return; if (!t.gain) { t.gain = ctx.createGain(); t.gain.gain.value = 0; t.gain.connect(master); } t.gain.gain.cancelScheduledValues(ctx.currentTime); t.gain.gain.setTargetAtTime(t.muted ? 0 : 1, ctx.currentTime, t.muted ? .05 : .5); }
    const cx = document.getElementById('cx');
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (ctx) { if (visible && S.audio) ctx.resume(); else ctx.suspend(); } }, { threshold: .15 }).observe(cx);

    /* ---- tabs ---- */
    const strip = cx.querySelector('.cx-tabs'), oldPlus = strip.querySelector('.cx-plus');
    strip.querySelectorAll('.cx-tab').forEach(n => n.remove());
    const plus = btn('cx-plus', '+'); plus.setAttribute('aria-label', 'New tab'); oldPlus.replaceWith(plus);
    plus.addEventListener('click', () => focusTab(open('home', false)));
    function open(site, background, silent) {
      if (tabs.length >= 7) { toast('Close a tab first'); return null; }
      const sd = M.sites[site], t = { id: ++uid, site, playing: !!sd.sound, muted: false, quiet: false, fresh: true, progress: 0 };
      if (sd.sound && background && S.on && !allowed(site)) { t.muted = true; t.quiet = true; quieted++; }
      tabs.push(t); voice(t);
      if (sd.sound && background && !silent) {
        if (t.quiet) { toast('QuietTabs muted ' + sd.short); H.tone(392, .07); }
        else toast(allowed(site) && S.on ? sd.short + ' is allowed, playing' : sd.short + ' is blasting in the background');
      }
      render(); return t;
    }
    function focusTab(t) {
      if (!t) return; active = t;
      if (t.quiet && S.rule === 'focus') { t.quiet = false; t.muted = false; voice(t); toast(M.sites[t.site].short + ' unmuted as you arrived'); }
      H.url(M.sites[t.site].host); render(); paintPage();
    }
    function closeTab(t) { const i = tabs.indexOf(t); if (t.gain) { t.gain.gain.setTargetAtTime(0, ctx.currentTime, .05); } tabs.splice(i, 1); if (!tabs.length) open('home', false); if (active === t) focusTab(tabs[Math.max(0, i - 1)]); else render(); }
    function setMute(t, v) { t.muted = v; if (!v) t.quiet = false; voice(t); render(); if (active === t) paintPage(); }

    function stateOf(t) { if (!t.playing) return ['', '']; if (t.quiet) return ['Muted · QuietTabs', 'q']; if (t.muted) return ['Muted', '']; return ['Playing', 'p']; }
    function render() {
      strip.querySelectorAll('.qt-tab').forEach(n => n.remove());
      tabs.forEach(t => {
        const sd = M.sites[t.site], [st, sc] = stateOf(t), n = el('div', 'cx-tab qt-tab' + (t === active ? ' on' : '') + (t.fresh ? ' new' : '') + (t.quiet ? ' zz' : ''));
        n.setAttribute('role', 'tab'); n.setAttribute('aria-selected', String(t === active)); n.tabIndex = 0; n.setAttribute('aria-label', sd.title + (st ? ', ' + st : ''));
        const f = el('i', 'fav'); f.style.background = sd.fav; const tt = el('span', 'qt-tt'); tt.append(el('span', null, sd.title)); if (st) tt.append(el('small', sc === 'q' ? 'q' : null, st));
        n.append(f, tt);
        if (t.playing) { const b = btn('qt-snd'); b.append(icon(t.muted ? MUTE : SPK)); b.setAttribute('aria-label', (t.muted ? 'Unmute ' : 'Mute ') + sd.short); b.addEventListener('click', e => { e.stopPropagation(); setMute(t, !t.muted); }); n.append(b); }
        const x = btn('qt-x', '×'); x.setAttribute('aria-label', 'Close ' + sd.title); x.addEventListener('click', e => { e.stopPropagation(); closeTab(t); }); n.append(x);
        n.addEventListener('click', () => { if (t !== active) focusTab(t); });
        n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusTab(t); } });
        strip.insertBefore(n, plus); t.fresh = false;
      });
      H.badge(tabs.filter(t => t.quiet).length || ''); renderPop();
    }

    /* ---- the page in the active tab ---- */
    let prog = null, stEl = null;
    function paintPage() {
      page.textContent = ''; page.scrollTop = 0; const sd = M.sites[active.site], site = el('div', 'qt-site'); site.style.setProperty('--f', sd.fav);
      prog = null; stEl = null;
      if (sd.kind === 'home') {
        const h = el('div', 'qt-home'), tiles = el('div', 'qt-tiles');
        h.append(el('div', 'qt-ff'), el('div', 'qt-search', 'Search with Google or enter address'), el('h3', null, 'Shortcuts · open in a background tab'));
        Object.entries(M.sites).filter(([, x]) => x.sound).forEach(([k, x]) => { const b = btn('qt-tile'), i = el('i', null, x.short[0]); i.style.setProperty('--f', x.fav); b.append(i, el('span', null, x.short), el('small', null, allowed(k) && S.on ? 'allowed · plays' : 'autoplays sound'));
          b.addEventListener('click', () => { ensure(); open(k, true); if (G && !reduced) G.fromTo(b, { scale: .92 }, { scale: 1, duration: .5, ease: 'back.out(3)' }); }); tiles.append(b); });
        const tip = el('p', 'qt-tip'); tip.append(document.createTextNode('Tiles open '), el('b', null, 'behind'), document.createTextNode(' this tab, like a middle-click. Watch the tab strip.'));
        h.append(tiles, tip); site.append(h);
      } else {
        const top = el('div', 'qt-top'), fi = el('i'); top.append(fi, document.createTextNode(sd.short));
        const art = el('div', 'qt-art'), vid = el('div', 'qt-vid'), pg = el('div', 'pg'); prog = el('i'); pg.append(prog);
        stEl = el('div', 'st'); vid.append(el('div', 'bg'), el('span', 'lb', sd.label), stEl, pg);
        const more = el('div', 'qt-more'); Object.entries(M.sites).filter(([k, x]) => x.sound && k !== active.site).slice(0, 2).forEach(([k, x]) => { const b = btn('', 'Open ' + x.short + ' in new tab ↗'); b.addEventListener('click', () => { ensure(); open(k, true); }); more.append(b); });
        art.append(vid, el('h1', null, sd.h1), el('p', null, sd.text), more); site.append(top, art); paintState();
      }
      page.append(site);
    }
    function paintState() {
      if (!stEl || !active) return; stEl.textContent = '';
      const t = active, eq = el('span', 'qt-eq' + (t.muted ? ' off' : '')); eq.append(el('i'), el('i'), el('i'));
      stEl.append(eq, document.createTextNode(t.quiet ? 'Muted by QuietTabs' : t.muted ? 'Muted' : S.audio ? 'Playing' : 'Playing · demo audio off'));
      if (t.muted) { const b = btn('', 'Unmute'); b.addEventListener('click', () => { ensure(); setMute(t, false); }); stEl.append(b); }
      else if (!S.audio) { const b = btn('', 'Hear it'); b.addEventListener('click', () => { S.audio = true; save(); ensure(); tabs.forEach(voice); sync(); paintState(); }); stEl.append(b); }
    }
    setInterval(() => {
      tabs.forEach(t => { if (t.playing) t.progress = (t.progress + .6) % 100; if (t.playing && t.quiet) blocked++; });
      if (prog && active) prog.style.width = active.progress + '%';
      bt.textContent = Math.floor(blocked / 60) + ':' + String(blocked % 60).padStart(2, '0');
    }, 1000);

    /* ---- popup ---- */
    const P = el('div', 'pc'), power = swBtn('QuietTabs', 'New background tabs open muted');
    power.addEventListener('click', () => { S.on = !S.on; save(); sync(); toast(S.on ? 'QuietTabs on' : 'QuietTabs off: new tabs will play'); H.tone(S.on ? 660 : 440, .08); });
    const ruleBox = el('div'), seg = el('div', 'pc-seg'), hint = el('p', 'pc-hint');
    [['focus', 'Unmute on focus'], ['keep', 'Keep muted']].forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => { S.rule = k; save(); sync(); H.tone(523, .05); }); seg.append(b); });
    ruleBox.append(label('When I switch to a muted tab'), seg, hint);
    const stats = el('div', 'qt-stats'), s1 = el('div'), s2 = el('div'), qn = el('b', null, '0'), bt = el('b', null, '0:00');
    s1.append(qn, el('span', null, 'tabs quieted')); s2.append(bt, el('span', null, 'of autoplay blocked')); stats.append(s1, s2);
    const listBox = el('div'), list = el('div', 'qt-list'), lc = el('output'); listBox.append(label('Open tabs', lc), list);
    const alBox = el('div'), al = el('div', 'qt-allow'); alBox.append(label('Always allowed'), al);
    Object.keys(M.sites).filter(k => M.sites[k].sound).forEach(k => { const b = btn('', hostOf(k)); b.dataset.h = hostOf(k); b.addEventListener('click', () => { const h = hostOf(k), i = S.allow.indexOf(h); if (i < 0) S.allow.push(h); else S.allow.splice(i, 1); save(); sync(); toast(i < 0 ? h + ' will always play' : h + ' will be muted in new tabs'); }); al.append(b); });
    const aud = swBtn('Demo audio', 'Quiet synthesized sound', true);
    aud.addEventListener('click', () => { S.audio = !S.audio; save(); if (S.audio) { ensure(); tabs.forEach(voice); } else if (ctx) ctx.suspend(); sync(); paintState(); });
    P.append(power, ruleBox, stats, listBox, alBox, aud); pb.append(P);
    function renderPop() {
      qn.textContent = String(quieted); lc.textContent = String(tabs.length); list.textContent = '';
      tabs.forEach(t => { const sd = M.sites[t.site], [st, sc] = stateOf(t), r = el('div', 'qt-li'), f = el('i'); f.style.setProperty('--f', sd.fav);
        r.append(f, el('span', null, sd.short || sd.title)); if (st) r.append(el('span', 'qt-chip ' + sc, sc === 'q' ? 'Quieted' : st));
        if (t.playing) { const b = btn(''); b.append(icon(t.muted ? MUTE : SPK)); b.setAttribute('aria-label', (t.muted ? 'Unmute ' : 'Mute ') + sd.short); b.addEventListener('click', () => { ensure(); setMute(t, !t.muted); }); r.append(b); }
        list.append(r); });
    }
    function sync() {
      power.setAttribute('aria-checked', String(S.on)); aud.setAttribute('aria-checked', String(S.audio));
      seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.rule)));
      al.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(S.allow.includes(b.dataset.h))));
      hint.textContent = S.rule === 'focus' ? 'Sound fades in when you open the tab.' : 'Tabs stay muted until you press Unmute yourself.';
      if (active && M.sites[active.site].kind === 'home') paintPage(); renderPop();
    }

    /* boot: Firefox Home plus one tab that was opened earlier and is being held silent */
    active = open('home', false); open('ledger', true, true);
    focusTab(active); sync();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
