/* MultiLang Bridge — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
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
  const BTN = 2;
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
    const LANGS = [
      { c: 'en', n: 'English', flag: ['#012169', '#FFFFFF', '#C8102E'], cur: 'USD', loc: 'en-US', rate: 1, slug: 'linen-throw-blanket' },
      { c: 'es', n: 'Español', flag: ['#AA151B', '#F1BF00', '#AA151B'], cur: 'EUR', loc: 'es-ES', rate: .92, slug: 'manta-de-lino' },
      { c: 'fr', n: 'Français', flag: ['#0055A4', '#FFFFFF', '#EF4135'], cur: 'EUR', loc: 'fr-FR', rate: .92, slug: 'plaid-en-lin' },
      { c: 'de', n: 'Deutsch', flag: ['#000000', '#DD0000', '#FFCE00'], cur: 'EUR', loc: 'de-DE', rate: .92, slug: 'leinen-plaid' },
      { c: 'ja', n: '日本語', flag: ['#FFFFFF', '#BC002D', '#FFFFFF'], cur: 'JPY', loc: 'ja-JP', rate: 151, slug: 'linen-blanket' },
      { c: 'hi', n: 'हिन्दी', flag: ['#FF9933', '#FFFFFF', '#138808'], cur: 'INR', loc: 'hi-IN', rate: 83.5, slug: 'linen-kambal' }
    ];
    const T = {
      nav: { en: ['Shop', 'Journal', 'About'], es: ['Tienda', 'Diario', 'Nosotros'], fr: ['Boutique', 'Journal', 'À propos'], de: ['Shop', 'Journal', 'Über uns'], ja: ['ショップ', 'ジャーナル', '私たちについて'], hi: ['दुकान', 'जर्नल', 'हमारे बारे में'] },
      badge: { en: 'New season', es: 'Nueva temporada', fr: 'Nouvelle saison', de: 'Neue Saison', ja: '新シーズン', hi: 'नया सीज़न' },
      title: { en: 'Linen Throw Blanket', es: 'Manta de lino', fr: 'Plaid en lin', de: 'Leinen-Plaid', ja: 'リネン ブランケット', hi: 'लिनन कंबल' },
      desc: { en: 'Stonewashed European linen that gets softer with every wash. Made to be lived with.', es: 'Lino europeo lavado a la piedra que se vuelve más suave con cada lavado. Hecho para vivirlo.', fr: 'Lin européen lavé à la pierre, plus doux à chaque lavage. Fait pour être vécu.', de: 'Stonewashed-Leinen aus Europa, das mit jeder Wäsche weicher wird. Gemacht für den Alltag.', ja: '洗うたびに柔らかくなる、ストーンウォッシュ加工のヨーロッパ産リネン。毎日の暮らしに。', hi: 'स्टोनवॉश्ड यूरोपीय लिनन, जो हर धुलाई के साथ और मुलायम होता है। रोज़ के इस्तेमाल के लिए।' },
      cta: { en: 'Add to cart', es: 'Añadir al carrito', fr: 'Ajouter au panier', de: 'In den Warenkorb', ja: 'カートに追加', hi: 'कार्ट में डालें' },
      ship: { en: 'Free shipping over $150', es: 'Envío gratis a partir de 140 €', fr: 'Livraison offerte dès 140 €', de: 'Kostenloser Versand ab 140 €', ja: '¥20,000以上で送料無料', hi: '₹12,000 से ऊपर मुफ़्त शिपिंग' }
    };
    const PRICE = 129;
    const reviewed = new Set(['en']);
    let lang = 'en';
    const wrap = el('div', 'ml'), flags = el('div', 'ml-flags'), store = el('div', 'ml-store'), side = el('div', 'ml-side');
    LANGS.forEach(L => { const b = el('button', 'ml-flag'); b.type = 'button'; b.setAttribute('aria-pressed', String(L.c === lang)); b.setAttribute('aria-label', L.n); const f = el('i'); f.style.background = L.c === 'ja' ? `radial-gradient(circle, ${L.flag[1]} 32%, ${L.flag[0]} 34%)`
        : L.c === 'en' ? 'linear-gradient(90deg, transparent 40%, #C8102E 40% 60%, transparent 60%), linear-gradient(transparent 36%, #C8102E 36% 64%, transparent 64%), linear-gradient(90deg, transparent 33%, #fff 33% 67%, transparent 67%), linear-gradient(transparent 28%, #fff 28% 72%, transparent 72%), #012169'
        : L.c === 'es' ? 'linear-gradient(180deg, #AA151B 25%, #F1BF00 25% 75%, #AA151B 75%)'
        : `linear-gradient(${['de', 'hi'].includes(L.c) ? '180deg' : '90deg'}, ${L.flag[0]} 33%, ${L.flag[1]} 33% 66%, ${L.flag[2]} 66%)`; b.append(f, el('b', null, L.c.toUpperCase())); b.addEventListener('click', () => setLang(L.c)); flags.append(b); });
    // storefront
    const bar = el('div', 'ml-sbar'), url = el('span', 'ml-url'); bar.append(el('i'), el('i'), el('i'), url);
    const nav = el('nav', 'ml-nav'), logo = el('b', 'ml-logo', 'Northwind'); const navLinks = el('span', 'ml-navl'); nav.append(logo, navLinks);
    const prod = el('div', 'ml-prod'), img = el('div', 'ml-img'), info = el('div', 'ml-info');
    const badge = el('span', 'ml-badge'), h = el('h4', 'ml-t'), p = el('p', 'ml-d'), price = el('b', 'ml-p'), cta = el('button', 'ml-cta'), ship = el('small', 'ml-ship'); cta.type = 'button';
    cta.addEventListener('click', () => toast(T.cta[lang] + ' ✓'));
    info.append(badge, h, p, price, cta, ship); prod.append(img, info); store.append(bar, nav, prod);
    const seo = el('div', 'ml-seo'), mem = el('div', 'ml-mem');
    side.append(el('p', 'ml-l', 'SEO · hreflang (live)'), seo, el('p', 'ml-l', 'Translation memory'), mem);
    const left = el('div'); left.append(el('p', 'ml-l', 'Pick a language'), flags, store);
    wrap.append(left, side); root.append(wrap);
    const fmt = L => new Intl.NumberFormat(L.loc, { style: 'currency', currency: L.cur, maximumFractionDigits: L.cur === 'JPY' || L.cur === 'INR' ? 0 : 2 }).format(L.cur === 'JPY' ? Math.round(PRICE * L.rate / 100) * 100 : L.cur === 'INR' ? Math.round(PRICE * L.rate / 50) * 50 : Math.round(PRICE * L.rate) - .01);
    function seoTags() {
      seo.replaceChildren(); const L = LANGS.find(x => x.c === lang);
      const lines = [`<html lang="${L.loc}">`, ...LANGS.map(x => `<link rel="alternate" hreflang="${x.c}" href="https://northwind.store/${x.c === 'en' ? '' : x.c + '/'}${x.slug}">`), `<link rel="alternate" hreflang="x-default" href="https://northwind.store/linen-throw-blanket">`, `<link rel="canonical" href="https://northwind.store/${L.c === 'en' ? '' : L.c + '/'}${L.slug}">`];
      lines.forEach((t, i) => { const c = el('code', 'ml-code' + (t.includes(`hreflang="${lang}"`) || i === 0 || t.includes('canonical') ? ' hot' : ''), t); seo.append(c); });
      if (G && !reduced) G.from(seo.querySelectorAll('.hot'), { backgroundColor: 'rgba(15,118,110,.35)', duration: .9 });
    }
    function memory() {
      mem.replaceChildren(); ['title', 'desc', 'cta', 'ship'].forEach(k => { const r = el('div', 'ml-row'), st = reviewed.has(lang) ? 'Reviewed' : 'AI draft'; r.append(el('span', 'ml-k', k), el('span', 'ml-v', Array.isArray(T[k][lang]) ? T[k][lang].join(' · ') : T[k][lang]), el('em', reviewed.has(lang) ? 'ok' : 'ai', st)); mem.append(r); });
      const b = el('button', 'btn pri ml-approve', reviewed.has(lang) ? 'Published ✓' : `Approve ${LANGS.find(x => x.c === lang).n}`); b.type = 'button'; b.disabled = reviewed.has(lang);
      b.addEventListener('click', () => { reviewed.add(lang); memory(); toast(`${LANGS.find(x => x.c === lang).n} approved and published with hreflang tags.`); }); mem.append(b);
      mem.append(el('p', 'ml-cov', `${reviewed.size} of ${LANGS.length} languages published`));
    }
    function fill() {
      const L = LANGS.find(x => x.c === lang);
      store.setAttribute('lang', L.c); url.textContent = `northwind.store/${L.c === 'en' ? '' : L.c + '/'}${L.slug}`;
      navLinks.replaceChildren(...T.nav[lang].map(t => el('span', null, t)));
      badge.textContent = T.badge[lang]; h.textContent = T.title[lang]; p.textContent = T.desc[lang]; price.textContent = fmt(L); cta.textContent = T.cta[lang]; ship.textContent = T.ship[lang];
    }
    function setLang(c) {
      if (c === lang) return; lang = c; flags.querySelectorAll('.ml-flag').forEach((b, i) => b.setAttribute('aria-pressed', String(LANGS[i].c === c)));
      const parts = [badge, h, p, price, cta, ship, navLinks];
      if (G && !reduced) { G.to(parts, { opacity: 0, y: -8, filter: 'blur(4px)', duration: .22, stagger: .02, onComplete: () => { fill(); G.fromTo(parts, { opacity: 0, y: 10, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .45, stagger: .04, ease: 'power3.out', clearProps: 'filter' }); } }); G.fromTo(img, { rotate: -3, scale: .97 }, { rotate: 0, scale: 1, duration: .8, ease: 'elastic.out(1,.5)' }); }
      else fill();
      seoTags(); memory();
    }
    fill(); seoTags(); memory();
  }

  demo(document.getElementById('demo'), H);
})();
