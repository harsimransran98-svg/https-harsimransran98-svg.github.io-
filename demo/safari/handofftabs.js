/* HandoffTabs — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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
    if (window.ScrollTrigger) G.from('.cx', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.cx', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };
  /* ---------- Safari toolbar popup ---------- */
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


/* ---------- HandoffTabs simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"mac":[{"t":"Ten-minute ramen at home","h":"spoonful.example/ramen","c":"#E85D04","k":"Recipe","d":"Rich broth, soft eggs and crispy garlic, ready before the water boils twice."},{"t":"Ferry times: Harbour to Isle","h":"bayferries.example/timetable","c":"#0077B6","k":"Travel","d":"Sailings every 40 minutes, last boat back at 22:10."},{"t":"How to read a topo map","h":"trailguide.example/topo","c":"#2D6A4F","k":"Outdoors","d":"Contour lines, scale and the three symbols every hiker should know."}],"phone":[{"t":"Gallery opening tonight","h":"artweek.example/opening","c":"#9D4EDD","k":"Events","d":"Doors at 7. Free entry, live music and a rooftop bar."},{"t":"Return label — order #4821","h":"shopnest.example/returns/4821","c":"#F72585","k":"Shopping","d":"Print the label and drop the parcel at any locker."}],"key":"ht_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    let mac = M.mac.map(t => ({ ...t })), phone = M.phone.map(t => ({ ...t })), act = 0, online = true, queue = [], log = [], phoneTab = null;
    const NS = 'http://www.w3.org/2000/svg';
    const phIc = () => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.8'); s.setAttribute('aria-hidden', 'true'); const r = document.createElementNS(NS, 'rect'); [['x', 6], ['y', 2], ['width', 12], ['height', 20], ['rx', 3]].forEach(([k, v]) => r.setAttribute(k, v)); const l = document.createElementNS(NS, 'path'); l.setAttribute('d', 'M10 18h4'); s.append(r, l); return s; };

    /* ---- Mac tabs + page ---- */
    const cx = document.getElementById('cx'), strip = cx.querySelector('.cx-tabs'), plus = strip.querySelector('.cx-plus');
    strip.querySelectorAll('.cx-tab').forEach(n => n.remove());
    function renderTabs(fresh) {
      strip.querySelectorAll('.ht-t').forEach(n => n.remove());
      mac.forEach((t, i) => { const n = el('div', 'cx-tab ht-t' + (i === act ? ' on' : '') + (t === fresh ? ' new' : '')), f = el('i', 'fav'); f.style.background = t.c; n.setAttribute('role', 'tab'); n.setAttribute('aria-selected', String(i === act)); n.tabIndex = 0;
        n.append(f, el('span', null, t.t)); n.addEventListener('click', () => { act = i; renderTabs(); paint(); renderPop(); }); n.addEventListener('keydown', e => { if (e.key === 'Enter') { act = i; renderTabs(); paint(); renderPop(); } }); strip.insertBefore(n, plus); });
    }
    function paint() {
      const t = mac[act]; H.url(t.h); page.textContent = ''; const site = el('div', 'ht-site'); site.style.setProperty('--c', t.c);
      const top = el('div', 'ht-top'); top.append(el('i'), document.createTextNode(t.h.split('/')[0])); const b = el('div', 'ht-body'); b.append(el('small', null, t.k), el('h1', null, t.t), el('p', null, t.d), el('p', null, 'Reading this on the Mac now, finishing it later on the sofa? Send it to the iPhone from the HandoffTabs popover.'));
      site.append(top, el('div', 'ht-hero'), b); page.append(site);
    }

    /* ---- iPhone ---- */
    const ph = el('div', 'ht-ph'), sc = el('div', 'ht-sc'), sb = el('div', 'ht-sb'), clock = el('em'), net = el('em'), pp = el('div', 'ht-pp home'), url = el('div', 'ht-url'), ban = btn('ht-ban');
    ph.setAttribute('role', 'region'); ph.setAttribute('aria-label', 'iPhone'); sb.append(clock, net); ban.hidden = true;
    sc.append(el('i', 'ht-isl'), sb, pp, ban, url); ph.append(sc); page.parentElement.append(ph);
    const tickClock = () => { const d = new Date(); clock.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }; tickClock(); setInterval(tickClock, 15000);
    function paintPhone() {
      net.textContent = online ? 'Wi-Fi' : 'Offline'; net.className = online ? '' : 'off'; pp.textContent = '';
      if (!phoneTab) { pp.className = 'ht-pp home'; url.textContent = 'Search or enter website'; pp.append(el('h5', null, 'Open on iPhone'));
        phone.forEach(t => { const b = btn(''), i = el('i'); i.style.setProperty('--c', t.c); b.append(i, document.createTextNode(t.t)); b.addEventListener('click', () => { phoneTab = t; paintPhone(); }); pp.append(b); }); }
      else { pp.className = 'ht-pp'; pp.style.setProperty('--c', phoneTab.c); url.textContent = phoneTab.h.split('/')[0]; const bd = el('div', 'bd'); bd.append(el('small', null, phoneTab.k), el('b', null, phoneTab.t), el('p', null, phoneTab.d)); pp.append(el('div', 'hh'), bd);
        const back = btn('', '‹ Tabs'); Object.assign(back.style, { position: 'absolute', left: '8px', top: '8px', padding: '3px 8px', borderRadius: '8px', background: 'rgba(255,255,255,.85)', fontSize: '10px', fontWeight: '700' }); back.addEventListener('click', () => { phoneTab = null; paintPhone(); }); pp.append(back); }
    }
    let banT = 0;
    function banner(t) {
      ban.textContent = ''; const sp = el('span'); sp.append(el('b', null, 'HANDOFFTABS · from MacBook'), el('em', null, t.t)); ban.append(el('i'), sp); ban.hidden = false; ban.onclick = () => { phoneTab = t; ban.hidden = true; paintPhone(); H.tone(784, .05); };
      ban.setAttribute('aria-label', 'Open ' + t.t + ' on iPhone');
      if (G && !reduced) G.fromTo(ban, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: .55, ease: 'back.out(1.6)' });
      clearTimeout(banT); banT = setTimeout(() => { if (G && !reduced) G.to(ban, { y: -60, opacity: 0, duration: .35, onComplete: () => { ban.hidden = true; G.set(ban, { clearProps: 'all' }); } }); else ban.hidden = true; }, 5200);
    }
    function fly(t, from, to, done) {
      if (!G || reduced) { done(); return; } const a = from.getBoundingClientRect(), b = to.getBoundingClientRect(), f = el('div', 'ht-fly'), i = el('i'); i.style.setProperty('--c', t.c); f.append(i, el('span', null, t.t.slice(0, 24)));
      Object.assign(f.style, { left: a.left + 'px', top: a.top + 'px' }); document.body.append(f);
      G.to(f, { x: b.left + b.width / 2 - a.left - 60, duration: .8, ease: 'power2.inOut' }); G.to(f, { y: b.top + 60 - a.top, duration: .8, ease: 'back.in(1.2)', onComplete: () => { f.remove(); done(); } }); G.to(f, { scale: .6, duration: .8, ease: 'power1.in' });
    }
    function deliver(t) { phone.unshift({ ...t }); if (phone.length > 6) phone.pop(); const e = log.find(x => x.t === t && x.s === 'q'); if (e) e.s = 'ok'; banner(t); if (!phoneTab) paintPhone(); H.tone(988, .06); setTimeout(() => H.tone(1318, .08), 110); renderPop(); }
    function send(list) {
      list.forEach((t, i) => setTimeout(() => {
        const from = strip.querySelectorAll('.ht-t')[mac.indexOf(t)] || strip; const e = { t, s: online ? 'ok' : 'q' }; log.unshift(e); log = log.slice(0, 6);
        fly(t, from, ph, () => { if (online) deliver(t); else { queue.push(t); toast('iPhone is offline. “' + t.t + '” is queued'); renderPop(); } });
      }, i * 260));
      renderPop();
    }
    function pull(t) {
      phone.splice(phone.indexOf(t), 1); const n = { ...t }; mac.push(n); act = mac.length - 1; if (phoneTab === t) phoneTab = null;
      fly(n, ph, strip, () => { renderTabs(n); paint(); paintPhone(); renderPop(); toast('Opened on your Mac'); H.tone(660, .06); });
    }

    /* ---- popover ---- */
    const P = el('div', 'pc'), dev = el('div', 'ht-dev'), dsp = el('span'), dn = el('b', null, 'iPhone 16 Pro'), ds = el('small'), wifi = btn('ht-wifi');
    dsp.append(dn, ds); dev.append(phIc(), dsp, wifi);
    wifi.addEventListener('click', () => { online = !online; paintPhone(); renderPop(); if (online && queue.length) { toast('iPhone back online · delivering ' + queue.length + ' queued'); const q = queue.splice(0); q.forEach((t, i) => setTimeout(() => deliver(t), 500 + i * 450)); } else toast(online ? 'iPhone online' : 'iPhone Wi-Fi off'); });
    const sendBox = el('div', 'ht-send'), one = btn('pri', 'Send this tab'), all = btn('', 'Send all tabs');
    one.addEventListener('click', () => send([mac[act]])); all.addEventListener('click', () => send(mac.slice()));
    const onBox = el('div'), onList = el('div'), onC = el('output'); onBox.append(label('On your iPhone', onC), onList);
    const logBox = el('div'), logL = el('div'); logBox.append(label('Sent'), logL);
    P.append(dev, sendBox, onBox, logBox); sendBox.append(one, all); pb.append(P);
    function renderPop() {
      ds.textContent = ''; const dot = el('i', online ? '' : 'off'); ds.append(dot, document.createTextNode(online ? 'Online · nearby' : 'Offline · ' + queue.length + ' queued'));
      wifi.textContent = online ? 'Wi-Fi on' : 'Wi-Fi off'; wifi.setAttribute('aria-pressed', String(online)); wifi.setAttribute('aria-label', 'Toggle iPhone Wi-Fi');
      one.textContent = 'Send this tab'; one.setAttribute('aria-label', 'Send “' + mac[act].t + '” to iPhone');
      onC.textContent = String(phone.length); onList.textContent = '';
      phone.slice(0, 4).forEach(t => { const r = el('div', 'ht-li'), i = el('i'), b = btn('', 'Open on Mac'); i.style.setProperty('--c', t.c); b.setAttribute('aria-label', 'Open ' + t.t + ' on Mac'); b.addEventListener('click', () => pull(t)); r.append(i, el('span', null, t.t), b); onList.append(r); });
      logL.textContent = ''; log.slice(0, 3).forEach(x => { const r = el('div', 'ht-li'), i = el('i'); i.style.setProperty('--c', x.t.c); r.append(i, el('span', null, x.t.t), el('span', 'ht-st ' + x.s, x.s === 'ok' ? 'Delivered' : 'Queued')); logL.append(r); });
      if (!log.length) logL.append(el('p', 'pc-empty', 'Nothing sent yet.'));
      H.badge(queue.length || '');
    }
    renderTabs(); paint(); paintPhone(); renderPop();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
