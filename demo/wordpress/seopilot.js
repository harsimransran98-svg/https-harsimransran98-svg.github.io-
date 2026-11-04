/* SeoPilot — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
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
    if (window.ScrollTrigger) G.from('.wpa', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.wpa', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };

/* ---------- plugin simulator ---------- */
  function demo(root, H) {
    const { el, svgEl, G, reduced } = H;
    const S = { kw: 'linen throw blanket', title: 'Linen Throw Blanket | Northwind', slug: 'linen-throw', desc: 'A soft throw for your sofa.', schema: 'Product' };
    const wrap = el('div', 'sp'), form = el('div', 'sp-form'), right = el('div', 'sp-right');
    const field = (k, label, max, area) => { const w = el('label', 'sp-f'), top = el('span', 'sp-ft'), cnt = el('em'), i = el(area ? 'textarea' : 'input', 'sp-in'); top.append(el('b', null, label), cnt); i.value = S[k]; i.maxLength = max; if (area) i.rows = 3; i.spellcheck = false; i.addEventListener('input', () => { S[k] = i.value; update(); }); w.append(top, i); w.cnt = cnt; return w; };
    const fKw = field('kw', 'Focus keyword', 60), fTi = field('title', 'SEO title', 90), fSl = field('slug', 'Slug', 70), fDe = field('desc', 'Meta description', 220, true);
    const sch = el('div', 'sp-seg'); ['Article', 'Product', 'FAQ'].forEach(t => { const b = el('button', null, t); b.type = 'button'; b.setAttribute('aria-pressed', String(S.schema === t)); b.addEventListener('click', () => { S.schema = t; sch.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); update(); }); sch.append(b); });
    form.append(fKw, fTi, fSl, fDe, el('p', 'sp-l', 'Schema type'), sch);
    const dev = el('div', 'sp-dev'); let mobile = false; ['Desktop', 'Mobile'].forEach((t, i) => { const b = el('button', null, t); b.type = 'button'; b.setAttribute('aria-pressed', String(!i)); b.addEventListener('click', () => { mobile = !!i; dev.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); update(); }); dev.append(b); });
    const serp = el('div', 'sp-serp'), gaugeRow = el('div', 'sp-gr'), checks = el('ul', 'sp-checks'), json = el('pre', 'sp-json');
    const gauge = svgEl('svg', { viewBox: '0 0 120 120', class: 'sp-gauge', role: 'img' }); const C = 2 * Math.PI * 50;
    gauge.append(svgEl('circle', { cx: 60, cy: 60, r: 50, fill: 'none', stroke: 'rgba(255,255,255,.08)', 'stroke-width': 10 })); const arc = svgEl('circle', { cx: 60, cy: 60, r: 50, fill: 'none', stroke: '#10B981', 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-dasharray': C, 'stroke-dashoffset': C, transform: 'rotate(-90 60 60)' }); gauge.append(arc);
    const gNum = svgEl('text', { x: 60, y: 68, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: '#E6F0FA' }); gauge.append(gNum);
    const gLab = el('div', 'sp-glab'); gaugeRow.append(gauge, gLab);
    right.append(el('div', 'sp-rh'), serp, gaugeRow, checks, el('p', 'sp-l', 'Generated JSON-LD'), json);
    right.firstChild.append(el('p', 'sp-l', 'Search preview'), dev);
    wrap.append(form, right); root.append(wrap);
    const cv = document.createElement('canvas').getContext('2d');
    const px = (t, size) => { cv.font = `${size}px Arial, sans-serif`; return cv.measureText(t).width; };
    const cut = (t, maxPx, size) => { if (px(t, size) <= maxPx) return t; let s = t; while (s.length && px(s + ' …', size) > maxPx) s = s.slice(0, -1); return s.trimEnd() + ' …'; };
    let shown = 0;
    function bolded(parent, text, kw) { if (!kw) { parent.append(text); return; } const words = kw.toLowerCase().split(/\s+/).filter(w => w.length > 2).slice(0, 8).map(w => w.slice(0, 40)); /* every word is regex-escaped below, so the pattern is a plain literal alternation */ const re = words.length ? new RegExp( // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'ig') : null; if (!re) { parent.append(text); return; } text.split(re).forEach((part, i) => parent.append(i % 2 ? el('b', null, part) : document.createTextNode(part))); }
    function update() {
      const kw = S.kw.trim().toLowerCase(), slug = S.slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const tPx = px(S.title, 20), dLen = S.desc.length, maxT = mobile ? 520 : 580;
      // snippet
      serp.replaceChildren(); serp.classList.toggle('mob', mobile);
      const site = el('div', 'sp-site'); const fav = el('i', null, 'N'); const sn = el('div'); sn.append(el('b', null, 'Northwind'), el('span', null, `northwind.store › shop › ${slug || '…'}`)); site.append(fav, sn);
      const t = el('a', 'sp-t'); t.textContent = cut(S.title || 'Untitled', maxT, 20);
      const d = el('p', 'sp-d'); bolded(d, S.desc.length > (mobile ? 120 : 158) ? S.desc.slice(0, mobile ? 120 : 158).trimEnd() + ' …' : (S.desc || 'Search engines will pick text from the page when the description is empty.'), kw);
      serp.append(site, t, d);
      if (S.schema === 'Product') { const r = el('p', 'sp-rich'); r.append(el('span', 'sp-stars', '★★★★★'), document.createTextNode(' Rating: 4.8 · 229 reviews · $129.00 · In stock')); serp.append(r); }
      if (S.schema === 'FAQ') { const r = el('div', 'sp-faq'); ['Is the linen pre-washed?', 'How do I care for it?'].forEach(q => r.append(el('span', null, q + ' ⌄'))); serp.append(r); }
      // checks
      const C2 = [
        [!!kw, 'Focus keyword set', 'Add the phrase you want this page to rank for.'],
        [kw && S.title.toLowerCase().includes(kw), 'Keyword in SEO title', 'Use the exact keyword in the title, ideally near the start.'],
        [kw && S.title.toLowerCase().indexOf(kw) === 0, 'Keyword at the start of the title', 'Titles that lead with the keyword tend to earn more clicks.', true],
        [tPx >= 300 && tPx <= maxT, `Title width ${Math.round(tPx)} px (aim 300–${maxT})`, tPx > maxT ? 'Too wide: search engines will cut it off.' : 'A little short: there is room for a benefit.'],
        [dLen >= 120 && dLen <= 158, `Description ${dLen} characters (aim 120–158)`, dLen < 120 ? 'Too short to sell the click.' : 'Too long: it will be cut off.'],
        [kw && S.desc.toLowerCase().includes(kw), 'Keyword in meta description', 'Search engines bold matching words, which draws the eye.'],
        [kw && slug.includes(kw.replace(/\s+/g, '-')), 'Keyword in slug', `Try “${kw.replace(/\s+/g, '-')}” as the slug.`],
        [slug.length > 0 && slug.length <= 60, 'Slug is short and readable', 'Keep slugs under 60 characters.'],
        [true, `${S.schema} schema generated`, '']
      ];
      const W = [10, 18, 6, 14, 16, 12, 12, 6, 6]; let score = 0; C2.forEach((c, i) => { if (c[0]) score += W[i]; });
      checks.replaceChildren(); C2.forEach(([ok, label, tip, soft]) => { const li = el('li', ok ? 'ok' : soft ? 'soft' : 'bad'); li.append(el('span', 'sp-ic', ok ? '✓' : soft ? '·' : '!'), el('b', null, label)); if (!ok && tip) li.append(el('small', null, tip)); checks.append(li); });
      const col = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'; arc.setAttribute('stroke', col);
      gauge.setAttribute('aria-label', `SEO score ${score} out of 100`);
      gLab.replaceChildren(el('b', null, score >= 80 ? 'Ready to rank' : score >= 50 ? 'Getting there' : 'Needs work'), el('span', null, `${C2.filter(c => c[0]).length} of ${C2.length} checks passing`)); gLab.firstChild.style.color = col;
      const setG = v => { arc.setAttribute('stroke-dashoffset', C * (1 - v / 100)); gNum.textContent = Math.round(v); };
      if (G && !reduced) { const o = { v: shown }; G.to(o, { v: score, duration: .7, ease: 'power3.out', overwrite: true, onUpdate: () => setG(o.v) }); } else setG(score);
      shown = score;
      [[fKw, S.kw.length, 60], [fTi, S.title.length, 60], [fSl, slug.length, 60], [fDe, dLen, 158]].forEach(([f, n, m]) => { f.cnt.textContent = `${n}/${m}`; f.cnt.className = n > m ? 'over' : ''; });
      const ld = { '@context': 'https://schema.org', '@type': S.schema === 'FAQ' ? 'FAQPage' : S.schema, ...(S.schema === 'Product' ? { name: S.title.split('|')[0].trim(), description: S.desc, sku: 'NW-LIN-01', offers: { '@type': 'Offer', price: '129.00', priceCurrency: 'USD', availability: 'https://schema.org/InStock' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '229' } } : S.schema === 'Article' ? { headline: S.title, description: S.desc, author: { '@type': 'Organization', name: 'Northwind' }, datePublished: new Date().toISOString().slice(0, 10) } : { mainEntity: [{ '@type': 'Question', name: 'Is the linen pre-washed?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, stonewashed twice.' } }] }), url: `https://northwind.store/shop/${slug}` };
      json.textContent = JSON.stringify(ld, null, 2);
    }
    update();
  }

  demo(document.getElementById('demo'), H);
})();
