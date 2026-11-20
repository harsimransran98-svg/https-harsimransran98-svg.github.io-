/* LinkLatch — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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


/* ---------- LinkLatch simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"links":{"bees":{"label":"how bees learn to count","url":"naturenow.example/bees-count","title":"Bees can count to four, and they learn fast","site":"Nature Now","c":"#E9A800","mins":5,"sum":"Researchers trained bumblebees to pick the flower with exactly three petals. After two days, most got it right nine times out of ten."},"trains":{"label":"Europe’s night trains","url":"railways.example/night-trains-2026","title":"The night train map of Europe, 2026 edition","site":"Railways Weekly","c":"#2B59C3","mins":8,"sum":"Twenty-six overnight routes, from Paris to Vienna and Amsterdam to Prague, with sleeper prices from €49."},"short":{"label":"bit.example/3xQ9","url":"bit.example/3xQ9","real":"cooksmag.example/one-pot-dal","title":"A one-pot dal for busy evenings","site":"Cooks Magazine","c":"#C2410C","mins":4,"sum":"Red lentils, ginger and a sizzling garlic oil. Twenty minutes, one pot, no soaking."},"phish":{"label":"confirm your PayPal account","url":"paypa1-secure.example/login","real":"paypa1-secure.example/login","title":"Log in to confirm your account","site":"paypa1-secure.example","c":"#64748B","mins":1,"sum":"This page asks for your password and card details.","warn":"This address imitates paypal.com with the number 1 instead of the letter l."},"fonts":{"label":"a free type specimen tool","url":"typecase.example/specimen","title":"Typecase: specimen sheets in one click","site":"Typecase","c":"#6C3CE9","mins":3,"sum":"Drop in any font and get a printable specimen with every weight, size and glyph."}},"paras":[["This week’s favourite science story is about ","bees",": it turns out they can learn numbers faster than some primates."],["Planning a slow trip? The new guide to ","trains"," covers every overnight route, with prices."],["A reader sent us a recipe link, ","short",", which we have been cooking on repeat."],["Careful with emails asking you to ","phish",". We received three this week, and they look convincing."],["Finally, for the designers: ","fonts"," that makes proofing a new typeface painless."]],"key":"ll_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const saved = store.get(M.key, null) || {};
    const S = { on: saved.on !== false, trig: saved.trig === 'hover' ? 'hover' : 'press', ms: typeof saved.ms === 'number' && saved.ms >= 250 && saved.ms <= 900 ? saved.ms : 450, size: saved.size === 'lg' ? 'lg' : 'sm', expand: saved.expand !== false, warn: saved.warn !== false };
    const save = () => store.set(M.key, S);
    let rl = [], previews = 0, stayed = 0;

    /* ---- article ---- */
    const site = el('div', 'll-site'), top = el('div', 'll-top'), art = el('article', 'll-art');
    top.append(document.createTextNode('Linkletter'), el('span', null, 'Issue 112 · Friday'));
    art.append(el('small', null, 'Weekly roundup'), el('h1', null, 'Five links worth your time'));
    M.paras.forEach(([a, k, b]) => { const p = el('p'), L = M.links[k], ln = el('a', 'll-a', L.label); ln.href = '#'; ln.dataset.k = k; ln.setAttribute('aria-describedby', 'llHint'); p.append(document.createTextNode(a), ln, document.createTextNode(b)); art.append(p); });
    const hint = el('span', null, 'Long-press, or press P, to preview this link'); hint.id = 'llHint'; hint.hidden = true; art.append(hint);
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); ring.setAttribute('viewBox', '0 0 44 44'); ring.setAttribute('class', 'll-ring'); ring.style.display = 'none';
    const mk = cls => { const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('cx', 22); c.setAttribute('cy', 22); c.setAttribute('r', 18); if (cls) c.setAttribute('class', cls); return c; };
    const rb = mk('bg'), rp = mk(''); rp.setAttribute('stroke-dasharray', '113.1'); rp.setAttribute('stroke-dashoffset', '113.1'); ring.append(rb, rp);
    const card = el('div', 'll-card'); card.hidden = true; card.setAttribute('role', 'dialog');
    site.append(top, art, ring, card); page.append(site);

    /* ---- press / hover detection ---- */
    let timer = 0, holding = null, opened = false, rt = null;
    const pos = e => { const o = site.getBoundingClientRect(); return [e.clientX - o.left, e.clientY - o.top]; };
    function startHold(ln, xy) {
      if (!S.on) return; cancelHold(); holding = ln; opened = false; ln.classList.add('hold');
      ring.style.display = 'block'; ring.style.left = xy[0] + 'px'; ring.style.top = xy[1] + 'px';
      if (G && !reduced) { rt = G.fromTo(rp, { attr: { 'stroke-dashoffset': 113.1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: S.ms / 1000, ease: 'none' }); }
      timer = setTimeout(() => { opened = true; ring.style.display = 'none'; ln.classList.remove('hold'); show(ln); }, S.ms);
    }
    function cancelHold() { clearTimeout(timer); if (rt) rt.kill(); ring.style.display = 'none'; if (holding) holding.classList.remove('hold'); holding = null; }
    art.addEventListener('pointerdown', e => { const ln = e.target.closest('.ll-a'); if (!ln || S.trig !== 'press' || e.button > 0) return; e.preventDefault(); startHold(ln, pos(e)); });
    art.addEventListener('pointerup', cancelHold); art.addEventListener('pointerleave', cancelHold);
    art.addEventListener('pointerover', e => { const ln = e.target.closest('.ll-a'); if (ln && S.trig === 'hover' && holding !== ln) startHold(ln, pos(e)); });
    art.addEventListener('pointerout', e => { if (S.trig === 'hover' && e.target.closest('.ll-a') && !opened) cancelHold(); });
    art.addEventListener('contextmenu', e => { if (e.target.closest('.ll-a')) e.preventDefault(); });
    art.addEventListener('click', e => { const ln = e.target.closest('.ll-a'); if (!ln) return; e.preventDefault(); if (opened) { opened = false; return; }
      toast(S.on ? 'A normal click would leave this page. Hold the link to preview it' : 'Without LinkLatch you would be on ' + M.links[ln.dataset.k].url.split('/')[0] + ' now'); });
    art.addEventListener('keydown', e => { const ln = e.target.closest('.ll-a'); if (ln && S.on && (e.key === 'p' || e.key === 'P')) { e.preventDefault(); show(ln); } });

    /* ---- the preview card ---- */
    function show(ln) {
      if (G) { G.killTweensOf(card); G.set(card, { clearProps: 'all' }); }
      const k = ln.dataset.k, L = M.links[k], bad = !!(L.warn && S.warn); previews++; stayed++;
      card.textContent = ''; card.className = 'll-card' + (S.size === 'lg' ? ' lg' : '') + (bad ? ' bad' : ''); card.style.setProperty('--c', L.c); card.setAttribute('aria-label', 'Preview of ' + L.title);
      const ch = el('div', 'll-ch'); ch.append(el('i'), el('span', null, (S.expand && L.real ? L.real : L.url))); card.append(ch);
      if (L.real && S.expand && !L.warn) { const x = el('div', 'll-exp'); x.append(document.createTextNode('↳ Short link expanded: '), el('s', null, L.url)); card.append(x); }
      if (bad) { const w = el('div', 'll-warn'); w.append(el('b', null, '!'), el('span', null, L.warn + ' Do not enter your password.')); card.append(w); }
      const cb = el('div', 'll-cb'); cb.append(el('small', null, L.site + ' · ' + L.mins + ' min read'), el('b', null, L.title), el('p', null, L.sum));
      const a = el('div', 'll-act'), ab = (ic, t, f) => { const b = btn(''); b.append(el('span', null, ic), document.createTextNode(t)); b.addEventListener('click', f); a.append(b); return b; };
      ab(bad ? '⛔' : '↗', bad ? 'Open anyway' : 'Open', () => { hide(); toast(bad ? 'Blocked one risky page. Good call staying put' : 'Opening ' + L.site + '…'); });
      ab('⧉', 'New tab', () => { hide(); toast('Opened in a background tab'); H.tone(660, .05); });
      ab('🔗', 'Copy link', () => { const u = 'https://' + (L.real || L.url); try { navigator.clipboard.writeText(u).then(() => toast('Link copied'), () => toast(u)); } catch (_) { toast(u); } });
      ab('👓', 'Read later', () => { if (!rl.some(x => x.k === k)) rl.unshift({ k, ...L }); hide(); renderPop(); H.flyToIcon(ln, L.c); toast('Saved to Reading List'); });
      card.append(el('div', 'll-hero'), cb, a); card.hidden = false;
      const r = ln.getBoundingClientRect(), o = site.getBoundingClientRect(), w = card.offsetWidth;
      const left = Math.max(12, Math.min(site.clientWidth - w - 12, r.left - o.left + r.width / 2 - w / 2)); card.style.left = left + 'px'; card.style.top = (r.bottom - o.top + 10) + 'px';
      card.style.setProperty('--ox', (r.left - o.left + r.width / 2 - left) + 'px');
      if (G && !reduced) G.fromTo(card, { scale: .5, opacity: 0, y: -10 }, { scale: 1, opacity: 1, y: 0, duration: .45, ease: 'back.out(1.7)' });
      H.tone(bad ? 300 : 740, .06); renderPop(); card.querySelector('.ll-act button').focus({ preventScroll: true });
    }
    function hide() { if (card.hidden) return; if (G && !reduced) G.to(card, { scale: .9, opacity: 0, duration: .18, onComplete: () => { card.hidden = true; G.set(card, { clearProps: 'all' }); } }); else card.hidden = true; }
    site.addEventListener('pointerdown', e => { if (!card.hidden && !card.contains(e.target) && !e.target.closest('.ll-a')) hide(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });

    /* ---- popover ---- */
    const P = el('div', 'pc'), power = swBtn('LinkLatch', 'Preview links instead of leaving');
    power.addEventListener('click', () => { S.on = !S.on; save(); renderPop(); hide(); toast(S.on ? 'Previews on' : 'Previews off: links open normally'); });
    const tb = el('div'), seg = el('div', 'pc-seg'); [['press', 'Long-press'], ['hover', 'Hover']].forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => { S.trig = k; save(); renderPop(); }); seg.append(b); }); tb.append(label('Show a preview on'), seg);
    const db = el('div'), dout = el('output'), rng = el('input', 'll-rng'); rng.type = 'range'; rng.min = 250; rng.max = 900; rng.step = 50; rng.setAttribute('aria-label', 'Delay before the preview'); db.append(label('Delay', dout), rng);
    rng.addEventListener('input', () => { S.ms = +rng.value; renderPop(); }); rng.addEventListener('change', save);
    const zb = el('div'), zs = el('div', 'pc-seg'); [['sm', 'Compact'], ['lg', 'Large']].forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => { S.size = k; save(); renderPop(); }); zs.append(b); }); zb.append(label('Card size'), zs);
    const ex = swBtn('Expand short links', null, true), wn = swBtn('Warn about look-alike sites', null, true);
    ex.addEventListener('click', () => { S.expand = !S.expand; save(); renderPop(); }); wn.addEventListener('click', () => { S.warn = !S.warn; save(); renderPop(); });
    const st = el('div', 'll-st'), s1 = el('div'), s2 = el('div'), n1 = el('b'), n2 = el('b'); s1.append(n1, el('span', null, 'previews')); s2.append(n2, el('span', null, 'times you stayed put')); st.append(s1, s2);
    const rb2 = el('div'), rlEl = el('div', 'll-rl'); rb2.append(label('Reading List'), rlEl);
    P.append(power, tb, db, zb, ex, wn, st, rb2); pb.append(P);
    function renderPop() {
      power.setAttribute('aria-checked', String(S.on)); ex.setAttribute('aria-checked', String(S.expand)); wn.setAttribute('aria-checked', String(S.warn));
      seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.trig))); zs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.size)));
      rng.value = S.ms; rng.style.setProperty('--p', ((S.ms - 250) / 650 * 100) + '%'); dout.textContent = S.ms + ' ms';
      n1.textContent = String(previews); n2.textContent = String(stayed); H.badge(rl.length || '');
      rlEl.textContent = ''; rl.forEach(x => { const d = el('div'), i = el('i'); i.style.setProperty('--c', x.c); d.append(i, el('span', null, x.title), el('small', null, x.mins + ' min')); rlEl.append(d); });
      if (!rl.length) rlEl.append(el('p', 'pc-empty', 'Saved links appear here.'));
    }
    renderPop();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
  /* poster layout: the tilted demo straightens as it scrolls into view */
  if (window.gsap && window.ScrollTrigger && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', () => { gsap.to('.po-tilt', { rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.po-tilt', start: 'top 95%', end: 'top 30%', scrub: 1 } }); });
    mm.add('(max-width: 699px)', () => { gsap.set('.po-tilt', { rotate: 0, scale: 1 }); });
  }
})();
