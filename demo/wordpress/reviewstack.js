/* ReviewStack — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
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
    if (window.ScrollTrigger) G.from('.wpa', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.wpa', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };

/* ---------- plugin simulator ---------- */
  function demo(root, H) {
    const { el, G, reduced, toast } = H;
    const PH = ['linear-gradient(160deg,#C2A878,#7C6A5A)', 'linear-gradient(160deg,#A3B18A,#5B6F4A)', 'linear-gradient(160deg,#D6A2AD,#8E5965)', 'linear-gradient(160deg,#9DB4C0,#4E6A7A)', 'linear-gradient(160deg,#E9C46A,#B0822C)'];
    let reviews = [
      { n: 'Hannah W.', s: 5, t: 'Softer than I expected and the colour is exactly like the photos.', ph: 0, v: true, d: 3 },
      { n: 'Ravi P.', s: 4, t: 'Lovely weight. Took a week to arrive but worth it.', ph: 1, v: true, d: 6 },
      { n: 'Chloé M.', s: 5, t: 'Bought a second one for my sister.', ph: 2, v: true, d: 9 },
      { n: 'Sam O.', s: 3, t: 'Nice blanket, but it sheds a little in the first wash.', ph: null, v: true, d: 12 },
      { n: 'Ingrid L.', s: 5, t: 'The stitching is beautiful up close.', ph: 3, v: false, d: 15 },
      { n: 'Marcus T.', s: 2, t: 'Smaller than I hoped. Customer service swapped it quickly though.', ph: null, v: true, d: 20 },
      { n: 'Ana R.', s: 5, t: 'Our sofa finally looks finished.', ph: 4, v: true, d: 24 }
    ];
    const BASE = { 5: 168, 4: 41, 3: 12, 2: 5, 1: 3 };
    const S = { f: 'all', bars: true, i: 0 };
    let photo = null, stars = 5;
    const wrap = el('div', 'rs'), top = el('div', 'rs-top'), sum = el('div', 'rs-sum'), barsBox = el('div', 'rs-bars');
    const tg = el('button', 'rs-tg'); tg.type = 'button'; tg.setAttribute('role', 'switch'); tg.setAttribute('aria-checked', 'true'); tg.setAttribute('aria-label', 'Show rating summary bars');
    tg.addEventListener('click', () => { S.bars = !S.bars; tg.setAttribute('aria-checked', String(S.bars)); renderSum(true); });
    const tgRow = el('label', 'rs-tgrow'); tgRow.append(tg, el('span', null, 'Show rating breakdown'));
    top.append(sum, barsBox, tgRow);
    const chips = el('div', 'rs-chips'); [['all', 'All'], ['photo', 'With photos'], ['verified', 'Verified buyers'], ['5', '5 stars'], ['low', '1–3 stars']].forEach(([k, t]) => { const b = el('button', 'rs-chip', t); b.type = 'button'; b.setAttribute('aria-pressed', String(S.f === k)); b.addEventListener('click', () => { S.f = k; S.i = 0; chips.querySelectorAll('.rs-chip').forEach(x => x.setAttribute('aria-pressed', String(x === b))); renderCar(true); }); chips.append(b); });
    const car = el('div', 'rs-car'), track = el('div', 'rs-track'), prev = el('button', 'rs-nav', '‹'), next = el('button', 'rs-nav', '›'); prev.type = next.type = 'button'; prev.setAttribute('aria-label', 'Previous reviews'); next.setAttribute('aria-label', 'Next reviews'); car.append(prev, track, next);
    const form = el('form', 'rs-form'); form.setAttribute('aria-label', 'Write a test review');
    const nm = el('input', 'rs-in'); nm.placeholder = 'Your name'; nm.maxLength = 30; nm.setAttribute('aria-label', 'Your name');
    const starRow = el('div', 'rs-stars'); starRow.setAttribute('role', 'radiogroup'); starRow.setAttribute('aria-label', 'Rating');
    for (let i = 1; i <= 5; i++) { const b = el('button', 'rs-star', '★'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-label', `${i} star${i > 1 ? 's' : ''}`); b.addEventListener('click', () => { stars = i; paintStars(); }); b.addEventListener('mouseenter', () => paintStars(i)); starRow.append(b); }
    starRow.addEventListener('mouseleave', () => paintStars());
    const txt = el('textarea', 'rs-in'); txt.rows = 3; txt.maxLength = 240; txt.placeholder = 'What did you think?'; txt.setAttribute('aria-label', 'Review text');
    const phRow = el('div', 'rs-ph'), file = el('input'); file.type = 'file'; file.accept = 'image/*'; file.hidden = true;
    const up = el('button', 'rs-up', '+ Photo'); up.type = 'button'; up.addEventListener('click', () => file.click());
    file.addEventListener('change', () => { const f = file.files[0]; if (!f || !/^image\//.test(f.type) || f.size > 8e6) { toast('Pick an image under 8 MB.'); return; } photo = { url: URL.createObjectURL(f) }; up.textContent = '✓ Photo added'; });
    PH.forEach((g, i) => { const b = el('button', 'rs-sw'); b.type = 'button'; b.style.background = g; b.setAttribute('aria-label', `Use sample photo ${i + 1}`); b.addEventListener('click', () => { photo = { ph: i }; up.textContent = '+ Photo'; phRow.querySelectorAll('.rs-sw').forEach(x => x.classList.toggle('on', x === b)); }); phRow.append(b); });
    phRow.prepend(up, file);
    const sub = el('button', 'btn pri', 'Post review'); sub.type = 'submit';
    form.append(el('p', 'rs-l', 'Write a test review'), nm, starRow, txt, phRow, sub);
    const left = el('div'); left.append(top, chips, car);
    wrap.append(left, form); root.append(wrap);
    function paintStars(h) { starRow.querySelectorAll('.rs-star').forEach((b, i) => { b.classList.toggle('on', i < (h || stars)); b.setAttribute('aria-checked', String(i + 1 === stars)); }); }
    function counts() { const c = { ...BASE }; reviews.filter(r => r.mine).forEach(r => { c[r.s]++; }); return c; }
    function renderSum(anim) {
      const c = counts(), tot = Object.values(c).reduce((a, b) => a + b, 0), avg = Object.entries(c).reduce((a, [s, n]) => a + s * n, 0) / tot;
      sum.replaceChildren(el('b', null, avg.toFixed(1)), el('span', 'rs-st', '★★★★★'.slice(0, Math.round(avg)) + '☆☆☆☆☆'.slice(Math.round(avg))), el('small', null, `${tot} reviews · ${Math.round((c[5] + c[4]) / tot * 100)}% recommend`));
      barsBox.replaceChildren(); barsBox.hidden = !S.bars;
      [5, 4, 3, 2, 1].forEach(s => { const r = el('div', 'rs-bar'), tr = el('div', 'rs-tr'), f = el('i'); tr.append(f); r.append(el('span', null, `${s}★`), tr, el('em', null, String(c[s]))); barsBox.append(r); const w = c[s] / tot * 100; if (G && !reduced && anim) G.fromTo(f, { width: 0 }, { width: w + '%', duration: .8, ease: 'power3.out' }); else f.style.width = w + '%'; });
    }
    function list() { return reviews.filter(r => S.f === 'all' || (S.f === 'photo' && r.ph != null) || (S.f === 'verified' && r.v) || (S.f === '5' && r.s === 5) || (S.f === 'low' && r.s <= 3)); }
    function card(r) {
      const c = el('article', 'rs-card' + (r.mine ? ' mine' : '')); if (r.ph != null || r.url) { const im = el('div', 'rs-img'); if (r.url) { const img = el('img'); img.src = r.url; img.alt = `Photo from ${r.n}`; im.append(img); } else im.style.background = PH[r.ph]; c.append(im); }
      const b = el('div', 'rs-cb'); b.append(el('span', 'rs-st', '★'.repeat(r.s) + '☆'.repeat(5 - r.s)), el('p', null, r.t)); const who = el('div', 'rs-who'); who.append(el('b', null, r.n)); if (r.v) who.append(el('em', null, '✓ Verified buyer')); else if (r.mine) who.append(el('em', 'pend', 'Pending order match')); who.append(el('small', null, r.d ? `${r.d} days ago` : 'just now')); b.append(who); c.append(b); return c;
    }
    function renderCar(anim) {
      const L = list(); track.replaceChildren(); if (!L.length) { track.append(el('p', 'rs-empty', 'No reviews match this filter yet.')); return; }
      S.i = Math.max(0, Math.min(S.i, Math.max(0, L.length - 2))); L.slice(S.i, S.i + 2).forEach(r => track.append(card(r)));
      prev.disabled = S.i === 0; next.disabled = S.i + 2 >= L.length;
      if (anim && G && !reduced) G.from(track.children, { x: 30, opacity: 0, duration: .45, stagger: .08, ease: 'power3.out' });
    }
    prev.addEventListener('click', () => { S.i -= 1; renderCar(true); }); next.addEventListener('click', () => { S.i += 1; renderCar(true); });
    form.addEventListener('submit', e => {
      e.preventDefault(); const t = txt.value.trim(), n = nm.value.trim() || 'You';
      if (t.length < 10) { toast('Write at least 10 characters.'); txt.focus(); return; }
      const r = { n, s: stars, t, ph: photo && photo.ph != null ? photo.ph : null, url: photo && photo.url, v: false, d: 0, mine: true };
      reviews.unshift(r); S.f = 'all'; S.i = 0; chips.querySelectorAll('.rs-chip').forEach((x, i) => x.setAttribute('aria-pressed', String(i === 0)));
      renderSum(true); renderCar(true); form.reset(); photo = null; stars = 5; paintStars(); up.textContent = '+ Photo'; phRow.querySelectorAll('.rs-sw').forEach(x => x.classList.remove('on'));
      toast('Review posted. Verifying it against your order…');
      setTimeout(() => { r.v = true; renderCar(false); toast('Order matched: verified buyer badge added.'); }, 2200);
    });
    paintStars(); renderSum(false); renderCar(false);
  }

  demo(document.getElementById('demo'), H);
})();
