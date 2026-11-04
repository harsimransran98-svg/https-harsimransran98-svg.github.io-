/* ReadRail — Chrome extension page with a live browser simulator (Bazozo Studio).
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
    const { el, G, reduced, toast } = H, pb = H.pop.body, view = page.parentElement;
    const URL0 = 'dailycurrent.news/science/ocean-noise';
    const junk = []; const J = (n, kind) => { n.classList.add('rr-junk'); n.dataset.kind = kind; junk.push(n); return n; };
    /* a cluttered news page */
    const site = el('div', 'rr-site t-paper f-serif');
    const top = el('header', 'rr-top'); top.append(el('b', 'rr-logo', 'DAILY CURRENT'));
    const nav = J(el('nav', 'rr-nav'), 'widget'); ['World', 'Science', 'Money', 'Sport', 'Culture', 'Video'].forEach(t => nav.append(el('span', null, t))); top.append(nav, J(el('span', 'rr-sub', 'Subscribe £1'), 'widget'));
    const lead = J(el('div', 'rr-ad rr-lead'), 'ad'); lead.append(el('small', null, 'Advertisement'), el('b', null, 'MEGA SALE · 70% OFF MATTRESSES · ENDS TONIGHT'));
    const grid = el('div', 'rr-grid'), art = el('article', 'rr-art'), aside = J(el('aside', 'rr-aside'), 'widget');
    const prog = el('div', 'rr-prog'), progI = el('i'), left = el('span', 'rr-left'); prog.append(progI);
    art.append(el('p', 'rr-kick', 'Science · Oceans'), el('h1', null, 'Why the oceans are getting louder, and who is listening'), el('p', 'rr-dek', 'Shipping, sonar and offshore building have doubled underwater noise in some seas. Whales are changing how they talk.'));
    const by = el('p', 'rr-by', 'By Tomas Reyes · 3 November 2026'); art.append(by, left);
    const share = J(el('div', 'rr-share'), 'widget'); ['Share', 'Post', 'Email', 'Save'].forEach(t => share.append(el('span', null, t))); art.append(share);
    const fig = el('figure', 'rr-fig'); const ph = el('div', 'rr-ph'); fig.append(ph, el('figcaption', null, 'A humpback whale off the Azores, where hydrophones have recorded rising noise since 2010.')); art.append(fig);
    const P = [
      'Sound travels four times faster in water than in air, and much further. For whales and dolphins, it is how they find food, keep track of their young and call across hundreds of kilometres of open sea.',
      'That quiet world is getting crowded. Large cargo ships produce a constant low hum, close to the same frequencies that baleen whales use to communicate. Along busy routes, the background level has risen by roughly three decibels every decade since the 1960s.',
      'Three decibels does not sound like much. But on the logarithmic scale used for sound, it means the energy has doubled each time. A call that once carried a thousand kilometres may now fade out in a fraction of that distance.',
      'Researchers listening with underwater microphones have noticed whales adapting. Some call louder. Some repeat themselves, the way people raise their voices in a noisy restaurant. Others simply go quiet when a ship passes, and wait.',
      'The good news is that noise, unlike plastic, disappears the moment it stops. When shipping slowed sharply in early 2020, scientists in several seas recorded the quietest conditions in decades almost overnight.',
      'That pause showed what is possible. Slower ships are much quieter, and burn less fuel. A handful of ports now pay lower fees to vessels that slow down near feeding grounds, and early results suggest whales return within weeks.',
      'Quieter propellers and better hull designs already exist. The question, researchers say, is whether the shipping industry will adopt them before the ocean loses more of its voices.'
    ];
    const video = J(el('div', 'rr-video'), 'video'); const vb = el('div', 'rr-vbar'); vb.append(el('i')); video.append(el('b', null, '▶ AUTOPLAY · 10 celebrity homes you won’t believe'), el('small', null, '🔊 Sound on · Up next in 3'), vb);
    const inad = J(el('div', 'rr-ad rr-in'), 'ad'); inad.append(el('small', null, 'Sponsored'), el('b', null, 'Doctors hate this one weird trick for better sleep'));
    const rel = () => { const r = J(el('div', 'rr-rel'), 'widget'); r.append(el('small', null, 'READ MORE'), el('b', null, ['Ten foods that are secretly fish', 'Is your dog a genius? Take the quiz'][junk.filter(j => j.classList.contains('rr-rel')).length % 2])); return r; };
    P.forEach((t, i) => { art.append(el('p', 'rr-p', t)); if (i === 1) art.append(video); if (i === 2) art.append(rel()); if (i === 3) art.append(inad); if (i === 5) art.append(rel()); });
    const ad2 = J(el('div', 'rr-ad rr-box'), 'ad'); ad2.append(el('small', null, 'Advertisement'), el('b', null, 'Crypto pension? Ask our AI broker'));
    const ad3 = J(el('div', 'rr-ad rr-box tall'), 'ad'); ad3.append(el('small', null, 'Advertisement'), el('b', null, 'Hot singles in your postcode'));
    const trend = el('div', 'rr-trend'); trend.append(el('b', null, 'Trending now')); ['Royal baby name odds', 'Celebrity chef’s feud', 'Five-hour energy rule', 'Lottery winner’s regret'].forEach((t, i) => trend.append(el('p', null, `${i + 1}  ${t}`)));
    aside.append(ad2, trend, ad3);
    grid.append(art, aside);
    const recs = J(el('section', 'rr-recs'), 'widget'); recs.append(el('b', null, 'You may also like')); const rg = el('div'); ['Shocking photos', 'She tried this diet', 'Banks hate it', 'The 2026 SUVs'].forEach(t => { const c = el('div', 'rr-rc'); c.append(el('i'), el('span', null, t)); rg.append(c); }); recs.append(rg);
    const com = J(el('section', 'rr-com'), 'widget'); com.append(el('b', null, '1,284 comments'), el('p', null, 'FIRST!!!'), el('p', null, 'This is all fake news, wake up people'));
    site.append(prog, top, lead, grid, recs, com); page.append(site);
    // overlays sit on the visible viewport, not the scrolled page
    const cookie = J(el('div', 'rr-cookie'), 'popup'); cookie.append(el('span', null, 'We and our 847 partners value your privacy.')); const ca = el('button', null, 'Accept all'); ca.type = 'button'; cookie.append(ca); view.append(cookie);
    const modal = J(el('div', 'rr-modal'), 'popup'); const mc = el('div', 'rr-mc'); mc.append(el('b', null, 'Wait! Before you go…'), el('p', null, 'Get the 12 stories everyone is talking about. Every hour.')); const mf = el('div', 'rr-mf'); const mi = el('span', 'rr-mi', 'your@email'); const ms = el('span', 'rr-ms', 'Sign me up'); mf.append(mi, ms); const mx = el('button', 'rr-mx', 'No thanks, I hate news'); mx.type = 'button'; mc.append(mf, mx); modal.append(mc); modal.hidden = true; view.append(modal);
    ca.addEventListener('click', () => { cookie.hidden = true; toast('Cookie banner dismissed. 847 partners say thanks.'); counts(); });
    mx.addEventListener('click', () => { modal.hidden = true; counts(); });
    const modalT = setTimeout(() => { if (!reader) { modal.hidden = false; if (G && !reduced) G.from(mc, { scale: .8, opacity: 0, duration: .45, ease: 'back.out(2)' }); counts(); } }, 2600);
    const words = P.join(' ').split(/\s+/).length + 40, WPM = 230;

    /* reading view state */
    let reader = false, theme = 'paper', font = 'serif', size = 19, width = 64, lh = 1.7, rail = false;
    const apply = () => { view.classList.toggle('rr-reading', reader); site.className = `rr-site t-${theme} f-${font}` + (reader ? ' rr-on' : ''); site.style.setProperty('--rr-s', size + 'px'); site.style.setProperty('--rr-w', width + 'ch'); site.style.setProperty('--rr-lh', lh); };
    const live = () => junk.filter(j => !j.hidden && j.getClientRects().length);
    function counts() {
      if (reader) return; const L = live(), by = k => L.filter(j => j.dataset.kind === k).length;
      sumBox.replaceChildren();
      const h = el('div', 'rr-big'); h.append(el('b', null, String(L.length)), el('span', null, 'distractions on this page')); sumBox.append(h);
      const ch = el('div', 'rr-kinds'); [['ad', 'ads'], ['popup', 'pop-ups'], ['video', 'autoplay video'], ['widget', 'widgets']].forEach(([k, n]) => { const c = by(k); if (!c) return; const s = el('span', 'k-' + k); s.append(el('b', null, String(c)), document.createTextNode(' ' + (c === 1 && n.endsWith('s') ? n.slice(0, -1) : n))); ch.append(s); }); sumBox.append(ch);
      sumBox.append(el('p', 'rr-est', `${Math.ceil(words / WPM)} min read · ${words.toLocaleString('en-GB')} words of actual article`));
      H.badge(L.length);
    }
    function enter() {
      if (reader) return; clearTimeout(modalT); const L = live(); let done = 0;
      go.disabled = true;
      const finish = () => {
        reader = true; apply(); junk.forEach(j => G && G.set(j, { clearProps: 'all' }));
        H.url('reader · ' + URL0); H.badge('✓'); page.scrollTop = 0; renderPop(); onScroll();
        if (G && !reduced) G.from(art.querySelectorAll(':scope > :not(.rr-junk)'), { y: 18, opacity: 0, duration: .5, stagger: .04, ease: 'power3.out' });
        toast(`Removed ${L.length} distractions. Enjoy the quiet.`);
        try { H.tone(523, .15, 'sine', .05); setTimeout(() => H.tone(784, .25, 'sine', .05), 120); } catch (_) {}
      };
      if (G && !reduced && L.length) G.to(L, { opacity: 0, scale: .92, y: -12, filter: 'blur(5px)', duration: .32, ease: 'power2.in', stagger: { each: .07, onComplete: () => { done++; go.textContent = `Removing… ${done}/${L.length}`; } }, onComplete: finish });
      else finish();
    }
    function exit() { reader = false; apply(); H.url(URL0); renderPop(); counts(); if (G && !reduced) G.from(live(), { opacity: 0, y: 10, duration: .4, stagger: .04 }); toast('Back to the original page, clutter and all.'); }

    /* reading progress */
    function onScroll() { const max = page.scrollHeight - page.clientHeight, p = max > 0 ? Math.min(1, page.scrollTop / max) : 0; progI.style.transform = `scaleX(${p})`; left.textContent = reader ? (p > .98 ? 'Finished · nicely done' : `${Math.max(1, Math.ceil(words * (1 - p) / WPM))} min left`) : ''; }
    page.addEventListener('scroll', onScroll, { passive: true });

    /* focus ruler: a spotlight bar you can drag anywhere, or let it follow the pointer */
    let follow = false, bion = false, fix = .45;
    const band = el('div', 'rr-rail'); band.hidden = true; const grip = el('button', 'rr-grip'); grip.type = 'button'; grip.setAttribute('aria-label', 'Drag the focus ruler, or use the up and down arrow keys'); grip.append(el('i'), el('i'), el('i')); band.append(grip); view.append(band);
    const placeRail = y => { const vr = view.getBoundingClientRect(), hgt = size * lh * 1.15; band.style.height = hgt + 'px'; band.style.top = Math.max(0, Math.min(vr.height - hgt, y - vr.top - hgt / 2)) + 'px'; };
    const nudge = dir => { const t = parseFloat(band.style.top) || 0; placeRail(view.getBoundingClientRect().top + t + size * lh * dir + size * lh * .575); };
    let dragY = null;
    grip.addEventListener('pointerdown', e => { e.preventDefault(); grip.setPointerCapture(e.pointerId); dragY = e.clientY - band.getBoundingClientRect().top - band.offsetHeight / 2; band.classList.add('drag'); });
    grip.addEventListener('pointermove', e => { if (dragY != null) placeRail(e.clientY - dragY); });
    const endDrag = () => { dragY = null; band.classList.remove('drag'); }; grip.addEventListener('pointerup', endDrag); grip.addEventListener('pointercancel', endDrag);
    grip.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); nudge(e.key === 'ArrowDown' ? 1 : -1); } });
    page.addEventListener('pointermove', e => { if (rail && follow && dragY == null) placeRail(e.clientY); });
    document.addEventListener('keydown', e => { if (!rail || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return; if (e.key === 'j' || e.key === 'k') nudge(e.key === 'j' ? 1 : -1); });
    /* bionic reading: bold the first part of every word */
    const orig = new Map(); art.querySelectorAll('.rr-p').forEach(p => orig.set(p, p.textContent));
    function bionic() {
      orig.forEach((t, p) => {
        if (!bion) { p.textContent = t; return; }
        p.replaceChildren();
        t.split(/(\s+)/).forEach(w => { const m = w.match(/^([^A-Za-z0-9]*)([A-Za-z0-9'’-]+)([\s\S]*)$/); if (!m) { p.append(document.createTextNode(w)); return; } const k = Math.max(1, Math.round(m[2].length * fix)); if (m[1]) p.append(document.createTextNode(m[1])); p.append(el('b', 'rr-bx', m[2].slice(0, k)), document.createTextNode(m[2].slice(k) + m[3])); });
      });
      site.classList.toggle('rr-bio', bion);
    }

    /* popup */
    const sumBox = el('div', 'rr-sum'), go = el('button', 'btn pri rr-go', 'Reading view'); go.type = 'button'; go.addEventListener('click', enter);
    const ctl = el('div', 'rr-ctl'), tools = el('div', 'rr-tools');
    pb.append(sumBox, go, ctl, tools);
    const sw = (label, sub, get, set) => { const r = el('div', 'rr-row rr-railrow'), t = el('div'); t.append(el('b', null, label), el('small', null, sub)); const b = el('button', 'rr-tg'); b.type = 'button'; b.setAttribute('role', 'switch'); b.setAttribute('aria-label', label); b.setAttribute('aria-checked', String(get())); b.addEventListener('click', () => { set(!get()); b.setAttribute('aria-checked', String(get())); }); r.append(t, b); return r; };
    tools.append(el('p', 'rr-tl', 'Focus tools'));
    tools.append(sw('Bionic reading', 'Bold the start of each word so your eyes glide', () => bion, v => { bion = v; bionic(); toast(v ? 'Bionic reading on. Try the fixation slider.' : 'Bionic reading off.'); }));
    const fixRow = el('label', 'rr-row rr-sl'), fv = el('b', null, Math.round(fix * 100) + '%'), fi = el('input'); fi.type = 'range'; fi.min = 25; fi.max = 70; fi.step = 5; fi.value = fix * 100; fi.addEventListener('input', () => { fix = fi.value / 100; fv.textContent = fi.value + '%'; if (bion) bionic(); }); fixRow.append(el('span', 'rr-l', 'Fixation'), fi, fv); tools.append(fixRow);
    tools.append(sw('Focus ruler', 'A spotlight bar. Drag its handle, or press J and K', () => rail, v => { rail = v; band.hidden = !v; if (v) { placeRail(view.getBoundingClientRect().top + view.clientHeight * .42); if (G && !reduced) G.from(band, { scaleY: 0, duration: .4, ease: 'back.out(2)' }); toast('Drag the handle on the right to move the ruler.'); } }));
    tools.append(sw('Ruler follows pointer', 'Instead of staying where you drop it', () => follow, v => { follow = v; }));
    const seg = (label, opts, cur, fn) => { const w = el('div', 'rr-row'); w.append(el('span', 'rr-l', label)); const s = el('div', 'rr-seg'); opts.forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.setAttribute('aria-pressed', String(k === cur)); b.addEventListener('click', () => { s.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); fn(k); apply(); onScroll(); }); s.append(b); }); w.append(s); return w; };
    const slider = (label, min, max, step, val, fmt, fn) => { const w = el('label', 'rr-row rr-sl'); const t = el('span', 'rr-l', label), v = el('b', null, fmt(val)), i = el('input'); i.type = 'range'; i.min = min; i.max = max; i.step = step; i.value = val; i.addEventListener('input', () => { fn(+i.value); v.textContent = fmt(+i.value); apply(); onScroll(); }); w.append(t, i, v); return w; };
    function renderPop() {
      ctl.replaceChildren();
      if (!reader) { go.hidden = false; go.disabled = false; go.textContent = 'Reading view'; sumBox.hidden = false; return; }
      go.hidden = true; sumBox.hidden = true;
      const ok = el('div', 'rr-ok'); ok.append(el('b', null, '✓ Reading view on'), el('span', null, `${junk.length} distractions removed · ${Math.ceil(words / WPM)} min read`)); ctl.append(ok);
      ctl.append(seg('Theme', [['paper', 'Paper'], ['sepia', 'Sepia'], ['night', 'Night']], theme, k => { theme = k; }));
      ctl.append(seg('Font', [['serif', 'Serif'], ['sans', 'Sans'], ['hyper', 'Hyperlegible']], font, k => { font = k; }));
      ctl.append(slider('Size', 15, 26, 1, size, v => v + 'px', v => { size = v; }));
      ctl.append(slider('Width', 46, 80, 2, width, v => v + 'ch', v => { width = v; }));
      ctl.append(slider('Line height', 1.4, 2.1, .05, lh, v => v.toFixed(2), v => { lh = v; }));
      const ex = el('button', 'rr-exit', 'Exit reading view'); ex.type = 'button'; ex.addEventListener('click', () => { exit(); }); ctl.append(ex);
      if (G && !reduced) G.from(ctl.children, { y: 10, opacity: 0, duration: .3, stagger: .04, ease: 'power2.out' });
    }
    document.addEventListener('keydown', e => { if (e.altKey && e.shiftKey && e.code === 'KeyR') { e.preventDefault(); reader ? exit() : enter(); } });
    apply(); counts(); renderPop(); onScroll(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
