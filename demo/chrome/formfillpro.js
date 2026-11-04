/* FormFill Pro — Chrome extension page with a live browser simulator (Bazozo Studio).
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
    const { el, G, reduced, toast } = H, pb = H.pop.body;
    // checkout form on the page
    const F = [['name', 'Full name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel'], ['addr', 'Street address', 'text'], ['city', 'City', 'text'], ['zip', 'Postcode', 'text'], ['country', 'Country', 'select'], ['card', 'Card number', 'text'], ['exp', 'Expiry (MM/YY)', 'text'], ['cvc', 'CVC', 'text']];
    const wrap = el('div', 'fp-site'), head = el('div', 'fp-top'); head.append(el('b', null, 'NORTHWIND'), el('span', 'fp-stg', 'STAGING'));
    const grid = el('div', 'fp-grid'), form = el('form', 'fp-form'); form.noValidate = true; form.append(el('h2', null, 'Checkout'));
    const inputs = {};
    F.forEach(([k, l, t]) => { const w = el('div', 'fp-f fp-' + k), lb = el('label', null, l), id = 'fp_' + k; lb.htmlFor = id; let i; if (t === 'select') { i = el('select'); ['', 'United Kingdom', 'United States', 'Germany', 'India', 'Japan'].forEach(o => { const op = el('option', null, o || 'Choose…'); op.value = o; i.append(op); }); } else { i = el('input'); i.type = t; i.autocomplete = 'off'; } i.id = id; const e = el('small', 'fp-e'); w.append(lb, i, e); form.append(w); inputs[k] = i; });
    const terms = el('label', 'fp-terms'), tc = el('input'); tc.type = 'checkbox'; terms.append(tc, document.createTextNode(' I agree to the terms')); form.append(terms);
    const place = el('button', 'fp-place', 'Place order · $129.00'); place.type = 'submit'; form.append(place);
    const sum = el('aside', 'fp-sum'); sum.append(el('b', null, 'Your order'), el('p', null, 'Linen throw · oat × 1'), el('p', null, 'Shipping · free'), el('strong', null, 'Total $129.00'));
    grid.append(form, sum); wrap.append(head, grid); page.append(wrap);
    const luhn = n => { const d = n.replace(/\D/g, ''); if (d.length < 13) return false; let s = 0; for (let i = 0; i < d.length; i++) { let x = +d[d.length - 1 - i]; if (i % 2) { x *= 2; if (x > 9) x -= 9; } s += x; } return s % 10 === 0; };
    const CHECK = {
      name: v => v.trim().length >= 2 || 'Enter your name', email: v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v) || 'Enter a valid email', phone: v => v.replace(/\D/g, '').length >= 7 || 'Enter a phone number', addr: v => v.trim().length >= 4 || 'Enter a street address', city: v => !!v.trim() || 'Enter a city', zip: v => v.trim().length >= 3 || 'Enter a postcode', country: v => !!v || 'Choose a country',
      card: v => luhn(v) || 'Card number fails the Luhn check', exp: v => { const m = v.match(/^(\d{2})\/(\d{2})$/); if (!m || +m[1] < 1 || +m[1] > 12) return 'Use MM/YY'; const now = new Date(), y = 2000 + +m[2]; return (y > now.getFullYear() || (y === now.getFullYear() && +m[1] >= now.getMonth() + 1)) || 'Card has expired'; }, cvc: v => /^\d{3,4}$/.test(v) || '3 or 4 digits'
    };
    const PROFILES = {
      us: { n: 'US shopper', d: { name: 'Jordan Ellis', email: 'jordan.ellis+qa@example.com', phone: '+1 415 555 0132', addr: '1200 Market Street, Apt 5', city: 'San Francisco', zip: '94103', country: 'United States', card: '4242 4242 4242 4242', exp: '12/29', cvc: '123' } },
      eu: { n: 'EU business', d: { name: 'Katharina Müller-Lüdenscheidt', email: 'k.mueller@firma-test.example', phone: '+49 30 901820', addr: 'Friedrichstraße 43', city: 'Berlin', zip: '10117', country: 'Germany', card: '5555 5555 5555 4444', exp: '08/28', cvc: '737' } },
      edge: { n: 'Edge cases', d: { name: 'Ñandú O’Sullivan-Δελτα 山田', email: 'very.long.address.with.dots+tag@sub.example.co.uk', phone: '+44 (0)20 7946 0018', addr: 'Flat 3/B, “The Old Mill”, 1 Long Lane', city: 'São Paulo', zip: 'SW1A 1AA', country: 'United Kingdom', card: '4000 0000 0000 0002', exp: '01/24', cvc: '12' } }
    };
    let prof = 'us', filling = false;
    const seg = el('div', 'fp-seg'); Object.entries(PROFILES).forEach(([k, p]) => { const b = el('button', null, p.n); b.type = 'button'; b.setAttribute('aria-pressed', String(k === prof)); b.addEventListener('click', () => { prof = k; seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); renderPrev(); }); seg.append(b); });
    const prev = el('div', 'fp-prev'), fill = el('button', 'btn pri fp-fill', 'Fill Test Profile'), clr = el('button', 'fp-clr', 'Clear form'), status = el('div', 'fp-status'); fill.type = clr.type = 'button';
    pb.append(el('p', 'fp-l', 'Profile'), seg, prev, fill, clr, el('p', 'fp-l', 'Field check'), status);
    function renderPrev() { prev.replaceChildren(); const d = PROFILES[prof].d; [['Name', d.name], ['Email', d.email], ['Card', d.card + (prof === 'edge' ? ' · declines' : ' · sandbox')]].forEach(([k, v]) => { const r = el('div'); r.append(el('span', null, k), el('code', null, v)); prev.append(r); }); }
    function validate(show) { let ok = 0; status.replaceChildren(); F.forEach(([k, l]) => { const v = inputs[k].value, r = CHECK[k](v), w = inputs[k].parentElement; const pass = r === true; if (show) { w.classList.toggle('bad', !pass); w.classList.toggle('good', pass); w.querySelector('.fp-e').textContent = pass ? '' : r; } if (pass) ok++; const s = el('span', pass ? 'ok' : 'no', `${pass ? '✓' : '✗'} ${l}`); status.append(s); }); return ok === F.length; }
    const wait = ms => new Promise(r => setTimeout(r, reduced ? 0 : ms));
    fill.addEventListener('click', async () => {
      if (filling) return; filling = true; fill.disabled = true; const d = PROFILES[prof].d;
      for (const [k] of F) {
        const i = inputs[k]; i.scrollIntoView({ block: 'nearest' }); i.classList.add('typing');
        if (i.tagName === 'SELECT') { i.value = d[k]; await wait(120); }
        else { i.value = ''; const step = Math.max(1, Math.ceil(d[k].length / 14)); for (let c = 0; c < d[k].length; c += step) { i.value = d[k].slice(0, c + step); await wait(18); } }
        i.classList.remove('typing'); if (G && !reduced) G.fromTo(i, { backgroundColor: 'rgba(245,158,11,.25)' }, { backgroundColor: 'rgba(245,158,11,0)', duration: .6, clearProps: 'backgroundColor' });
        validate(false);
      }
      tc.checked = true; validate(true); filling = false; fill.disabled = false; toast(`Filled “${PROFILES[prof].n}”. Now place the order.`);
    });
    clr.addEventListener('click', () => { Object.values(inputs).forEach(i => { i.value = ''; i.parentElement.classList.remove('bad', 'good'); i.parentElement.querySelector('.fp-e').textContent = ''; }); tc.checked = false; validate(false); });
    form.addEventListener('submit', e => {
      e.preventDefault(); const ok = validate(true);
      if (!ok) { toast('The form caught some errors. That’s the point of edge cases.'); if (G && !reduced) G.fromTo(form, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)' }); return; }
      if (!tc.checked) { toast('Tick the terms box.'); return; }
      const card = inputs.card.value.replace(/\D/g, ''); if (card === '4000000000000002') { toast('Sandbox: card declined (4000 0000 0000 0002 always declines).'); return; }
      form.replaceChildren(); const okBox = el('div', 'fp-ok'); okBox.append(el('b', null, '✓ Sandbox charge approved'), el('p', null, `Order NW-${Math.floor(Math.random() * 90000 + 10000)} · test mode · no real money moved`)); form.append(okBox);
      if (G && !reduced) G.from(okBox, { scale: .85, opacity: 0, duration: .5, ease: 'back.out(2)' });
    });
    renderPrev(); validate(false); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
