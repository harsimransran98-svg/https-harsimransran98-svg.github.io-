/* Salt & Cedar — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
    G.from('.hero .kick, .hero .lead, .hero .acts', { y: 24, opacity: 0, duration: .9, stagger: .1, ease: 'expo.out', delay: .45 });
    G.from('#heroImg', { scale: 1.18, duration: 2.2, ease: 'expo.out' });
    const mm = G.matchMedia();
    mm.add('(min-width: 861px)', () => { if (window.ScrollTrigger) G.to('#heroImg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } }); });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };

/* ---------- live demo ---------- */
  function demo(root, H) {
    const { el, G, reduced, toast } = H;
    const COURSES = [
      { n: 'Oyster, cucumber, cedar smoke', v: 'Celery, cucumber, cedar smoke', g: 0, wine: 'Muscadet sur lie', na: 'Cucumber & dill tonic', tag: 'sea' },
      { n: 'Sourdough & cultured butter', v: 'Sourdough & cultured butter', g: 1, wine: '—', na: '—', tag: 'bread' },
      { n: 'Charred leeks, hazelnut, brown butter', v: 'Charred leeks, hazelnut, brown butter', g: 0, wine: 'Jura chardonnay', na: 'Roasted apple kombucha', tag: 'field' },
      { n: 'Line-caught cod, mussels, sea herbs', v: 'Salt-baked celeriac, sea herbs', g: 0, wine: 'Albariño', na: 'Sea buckthorn soda', tag: 'sea' },
      { n: 'Aged duck, cherry, cedar', v: 'Mushroom “duck”, cherry, cedar', g: 0, wine: 'Pinot noir, Willamette', na: 'Cherry & smoked tea', tag: 'fire' },
      { n: 'Sheep’s cheese, honeycomb', v: 'Cashew cheese, honeycomb', g: 0, wine: 'Sauternes', na: 'Verjus & honey', tag: 'field' },
      { n: 'Brown-butter cake, salted caramel', v: 'Brown-butter cake, salted caramel', g: 1, wine: 'Madeira', na: 'Cold-brew & orange', tag: 'sweet' }
    ];
    const S = { len: 7, diet: 'none', pair: 'wine' };
    const wrap = el('div', 'sc-wrap'), ctrl = el('div', 'sc-ctrl'), menu = el('div', 'sc-menu');
    const seg = (label, key, opts) => { const g = el('div', 'sc-g'); g.append(el('p', 'sc-l', label)); const row = el('div', 'sc-seg'); opts.forEach(([v, t]) => { const b = el('button', null, t); b.type = 'button'; b.setAttribute('aria-pressed', String(S[key] === v)); b.addEventListener('click', () => { S[key] = v; row.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); render(true); }); row.append(b); }); g.append(row); return g; };
    ctrl.append(seg('Length', 'len', [[5, 'Five courses'], [7, 'Seven courses']]), seg('Dietary', 'diet', [['none', 'Everything'], ['veg', 'Vegetarian'], ['gf', 'Gluten-free']]), seg('Pairing', 'pair', [['wine', 'Wine'], ['na', 'Zero-proof'], ['none', 'No pairing']]));
    const total = el('div', 'sc-total'), book = el('button', 'btn pri', 'Reserve this menu'); book.type = 'button'; book.addEventListener('click', () => toast(`Table request sent: ${S.len}-course ${S.diet === 'none' ? '' : S.diet === 'veg' ? 'vegetarian ' : 'gluten-free '}menu${S.pair === 'none' ? '' : ' with ' + (S.pair === 'wine' ? 'wine' : 'zero-proof') + ' pairing'}.`));
    ctrl.append(total, book); wrap.append(ctrl, menu); root.append(wrap);
    function render(anim) {
      let list = COURSES.slice(); if (S.len === 5) list = list.filter((_, i) => i !== 1 && i !== 5);
      menu.replaceChildren(el('p', 'sc-head', 'Salt & Cedar · this month'));
      list.forEach((c, i) => {
        const r = el('div', 'sc-c'), num = el('span', 'sc-n', ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i]);
        let dish = S.diet === 'veg' ? c.v : c.n; if (S.diet === 'gf' && c.g) dish = dish.replace('Sourdough', 'Buckwheat crisp').replace('Brown-butter cake', 'Brown-butter custard');
        const body = el('div'); body.append(el('h4', null, dish)); if (S.pair !== 'none' && c[S.pair] !== '—') body.append(el('p', 'sc-p', (S.pair === 'wine' ? 'with ' : 'with ') + c[S.pair]));
        r.append(num, body); menu.append(r);
      });
      const price = (S.len === 7 ? 135 : 98) + (S.pair === 'wine' ? (S.len === 7 ? 85 : 60) : S.pair === 'na' ? (S.len === 7 ? 45 : 32) : 0);
      total.replaceChildren(el('b', null, `$${price}`), el('span', null, `per guest · about ${S.len === 7 ? '2 h 45 m' : '2 h'}`));
      if (anim && G && !reduced) G.from(menu.querySelectorAll('.sc-c'), { y: 16, opacity: 0, duration: .5, stagger: .06, ease: 'power3.out' });
    }
    render(false);
  }

  demo(document.getElementById('demo'), H);
})();
