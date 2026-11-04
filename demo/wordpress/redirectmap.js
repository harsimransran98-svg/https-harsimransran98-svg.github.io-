/* RedirectMap — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
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
    if (window.ScrollTrigger) G.from('.wpa', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.wpa', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };

/* ---------- plugin simulator ---------- */
  function demo(root, H) {
    const { el, svgEl, G, reduced, toast } = H;
    const DEST = ['/shop/', '/shop/linen/', '/journal/', '/about/', '/contact/', '/shop/gift-cards/'];
    let broken = [{ u: '/old-shop/linen-throw', hits: 412, to: null }, { u: '/blog/2019/winter-guide', hits: 188, to: null }, { u: '/about-us.html', hits: 96, to: null }];
    const POOL = [['/products/gift-card', 71], ['/news/', 54], ['/category/linen/page/2', 39], ['/contact-us', 33], ['/blog/2020/shipping-update', 21]];
    let sel = null;
    const wrap = el('div', 'rm'), mapBox = el('div', 'rm-map'), side = el('div', 'rm-side');
    const tools = el('div', 'rm-tools'), scan = el('button', 'btn pri', 'Run 404 crawler'); scan.type = 'button'; const scanInfo = el('span', 'rm-si', 'Last crawl: 2 days ago');
    tools.append(scan, scanInfo);
    const sv = svgEl('svg', { class: 'rm-svg', role: 'img', 'aria-label': 'Map of broken URLs and their redirect destinations' });
    mapBox.append(tools, sv, el('p', 'rm-hint', 'Click a red broken URL, then a green destination to create a 301.'));
    const rx = el('div', 'rm-rx'), pat = el('input', 'rm-in'), rep = el('input', 'rm-in'), test = el('input', 'rm-in'), out = el('div', 'rm-out');
    pat.value = '^/blog/(\\d{4})/(.+)$'; rep.value = '/journal/$2'; test.value = '/blog/2019/winter-guide'; [pat, rep, test].forEach((i, k) => { i.maxLength = k === 2 ? 200 : 100; i.spellcheck = false; i.setAttribute('aria-label', ['Regex pattern', 'Replacement', 'Test URL'][k]); i.addEventListener('input', runRx); });
    const lab = t => el('label', 'rm-lb', t);
    rx.append(el('p', 'rm-l', 'Regex rule tester'), lab('Pattern'), pat, lab('Redirect to'), rep, lab('Test URL'), test, out);
    const rules = el('div', 'rm-rules'); side.append(rx, el('p', 'rm-l', 'Active 301 rules'), rules);
    wrap.append(mapBox, side); root.append(wrap);
    function draw() {
      sv.replaceChildren(); const h = Math.max(DEST.length, broken.length) * 52 + 30; sv.setAttribute('viewBox', `0 0 640 ${h}`);
      const by = i => 30 + i * 52, dy = i => 30 + i * ((h - 60) / Math.max(1, DEST.length - 1));
      broken.forEach((b, i) => { if (b.to == null) return; const d = DEST.indexOf(b.to); const path = svgEl('path', { d: `M250 ${by(i)} C 330 ${by(i)}, 330 ${dy(d)}, 410 ${dy(d)}`, fill: 'none', stroke: '#39FF88', 'stroke-width': 2, class: 'rm-edge' }); sv.append(path); const t = svgEl('text', { x: 330, y: (by(i) + dy(d)) / 2 - 6, 'text-anchor': 'middle', fill: '#39FF88', 'font-size': 10, 'font-family': 'JetBrains Mono, monospace' }); t.textContent = '301'; sv.append(t); });
      broken.forEach((b, i) => { const g = svgEl('g', { class: 'rm-node bad' + (sel === i ? ' sel' : '') + (b.to ? ' done' : ''), tabindex: 0, role: 'button', 'aria-label': `Broken ${b.u}, ${b.hits} hits` }); g.append(svgEl('rect', { x: 10, y: by(i) - 18, width: 240, height: 36, rx: 6 })); const t = svgEl('text', { x: 22, y: by(i) - 2, 'font-size': 12 }); t.textContent = b.u.length > 30 ? b.u.slice(0, 29) + '…' : b.u; const t2 = svgEl('text', { x: 22, y: by(i) + 12, 'font-size': 10, class: 'sub' }); t2.textContent = `404 · ${b.hits} hits/mo${b.to ? ' · fixed' : ''}`; g.append(t, t2); const pick = () => { sel = i; draw(); }; g.addEventListener('click', pick); g.addEventListener('keydown', e => { if (e.key === 'Enter') pick(); }); sv.append(g); });
      DEST.forEach((d, i) => { const g = svgEl('g', { class: 'rm-node ok', tabindex: 0, role: 'button', 'aria-label': `Destination ${d}` }); g.append(svgEl('rect', { x: 410, y: dy(i) - 15, width: 220, height: 30, rx: 6 })); const t = svgEl('text', { x: 422, y: dy(i) + 4, 'font-size': 12 }); t.textContent = '200  ' + d; g.append(t); const link = () => { if (sel == null) { toast('Pick a broken URL on the left first.'); return; } broken[sel].to = d; const was = broken[sel].u; sel = null; draw(); renderRules(); toast(`301 created: ${was} → ${d}`); const edges = sv.querySelectorAll('.rm-edge'); const e2 = edges[edges.length - 1]; if (G && !reduced && e2) { const L = e2.getTotalLength(); G.fromTo(e2, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .8, ease: 'power2.out' }); } }; g.addEventListener('click', link); g.addEventListener('keydown', e => { if (e.key === 'Enter') link(); }); sv.append(g); });
    }
    function renderRules() {
      rules.replaceChildren(); const list = broken.filter(b => b.to);
      if (!list.length) rules.append(el('p', 'rm-empty', 'No rules yet.'));
      list.forEach(b => { const r = el('div', 'rm-rule'); r.append(el('code', null, b.u), el('span', null, '→'), el('code', null, b.to)); const x = el('button', 'rm-del', '×'); x.type = 'button'; x.setAttribute('aria-label', `Remove redirect for ${b.u}`); x.addEventListener('click', () => { b.to = null; draw(); renderRules(); }); r.append(x); rules.append(r); });
      const left = broken.filter(b => !b.to).reduce((a, b) => a + b.hits, 0); rules.append(el('p', 'rm-sum', `${broken.length - list.length} broken URL${broken.length - list.length === 1 ? '' : 's'} left · ${left} visitors/mo still hitting 404s`));
    }
    function runRx() {
      out.replaceChildren(); let re;
      try { re = new RegExp(pat.value); } catch (e) { out.className = 'rm-out bad'; out.append(el('b', null, 'Invalid pattern'), el('span', null, String(e.message).slice(0, 80))); return; }
      const m = test.value.match(re);
      if (!m) { out.className = 'rm-out none'; out.append(el('b', null, 'No match'), el('span', null, 'This URL would fall through to the next rule.')); return; }
      const dest = rep.value.replace(/\$(\d)/g, (_, n) => m[+n] || '');
      out.className = 'rm-out ok'; out.append(el('b', null, `301 → ${dest}`), el('span', null, m.slice(1).map((g, i) => `$${i + 1} = ${g}`).join('  ·  ') || 'No capture groups'));
    }
    let scanning = false;
    scan.addEventListener('click', () => {
      if (scanning) return; scanning = true; scan.disabled = true; let n = 0; const total = 1240;
      const iv = setInterval(() => { n += 87; scanInfo.textContent = `Crawling… ${Math.min(n, total)} / ${total} URLs`; if (n >= total) { clearInterval(iv); const add = POOL.splice(0, 2).map(([u, hits]) => ({ u, hits, to: null })); broken = broken.concat(add); scanInfo.textContent = add.length ? `Crawl done · ${add.length} new 404s found` : 'Crawl done · no new 404s'; draw(); renderRules(); if (G && !reduced) G.from(sv.querySelectorAll('.rm-node.bad'), { x: -30, opacity: 0, duration: .5, stagger: .05 }); scan.disabled = false; scanning = false; } }, 90);
    });
    draw(); renderRules(); runRx();
  }

  demo(document.getElementById('demo'), H);
})();
