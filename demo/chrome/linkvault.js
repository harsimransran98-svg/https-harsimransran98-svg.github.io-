/* LinkVault — Chrome extension page with a live browser simulator (Bazozo Studio).
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
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const LINKS = [
      { u: 'https://research.example/edge-ai-chips-2026', t: 'Edge AI chips hit the mid-range', tags: ['ai', 'hardware'], s: 'New mid-range phones run 7B-parameter models locally, cutting cloud costs and latency for everyday assistants.', status: 200 },
      { u: 'https://citydesk.example/transit-app-redesign', t: 'How a city rebuilt its transit app', tags: ['design', 'cities'], s: 'A small team replaced six legacy apps with one, and complaints fell by half within a quarter.', status: 301 },
      { u: 'https://oldblog.example/2019/css-grid-tricks', t: '12 CSS Grid tricks (2019)', tags: ['css', 'design'], s: 'Practical grid patterns: auto-fill cards, named areas and the holy-grail layout.', status: 404 },
      { u: 'https://energy.example/home-battery-guide', t: 'The honest home-battery guide', tags: ['energy'], s: 'Payback periods, warranties and the questions installers rarely volunteer.', status: 200 },
      { u: 'https://dev.example/rust-in-the-browser', t: 'Rust in the browser, two years on', tags: ['web', 'rust'], s: 'WebAssembly tooling matured; the hard part is now team habits, not compilers.', status: 200 }
    ];
    // the news page with saveable links
    const site = el('div', 'lv-site'), top = el('div', 'lv-top'); top.append(el('b', null, 'The Weekly Brief'), el('span', null, 'Tech · 3 November'));
    const art = el('article', 'lv-art'); art.append(el('h1', null, 'Five links worth your weekend'), el('p', 'lv-dek', 'Hover a link and press + to save it to LinkVault with an automatic summary.'));
    LINKS.forEach((L, i) => { const p = el('p', 'lv-item'); const a = el('a', 'lv-a', L.t); a.href = L.u; a.setAttribute('rel', 'noopener'); a.addEventListener('click', e => e.preventDefault()); const add = el('button', 'lv-add', '+'); add.type = 'button'; add.setAttribute('aria-label', `Save ${L.t}`); add.addEventListener('click', () => save(L, add)); p.append(el('span', 'lv-n', String(i + 1).padStart(2, '0')), a, add, el('small', null, ` — ${L.s.split(',')[0]}.`)); art.append(p); });
    site.append(top, art); page.append(site);
    let saved = store.get('lv_saved', null); if (!Array.isArray(saved)) saved = [{ ...LINKS[0], at: Date.now() - 864e5 }, { ...LINKS[2], at: Date.now() - 3 * 864e5 }];
    let tag = 'all', q = '', checking = false;
    const persist = () => store.set('lv_saved', saved);
    function save(L, btn) { if (saved.some(s => s.u === L.u)) { toast('Already in your vault.'); return; } saved.unshift({ ...L, at: Date.now(), checked: null }); persist(); H.flyToIcon(btn); H.badge(saved.length); btn.textContent = '✓'; btn.classList.add('done'); render(true); }
    function savePage() { save({ u: 'https://weeklybrief.news/tech', t: 'The Weekly Brief · Five links worth your weekend', tags: ['newsletter'], s: 'A weekly roundup: edge AI chips, transit design, CSS grid, home batteries and Rust in the browser.', status: 200 }, $saveBtn); }
    const head = el('div', 'lv-head'), search = el('input', 'lv-q'); search.type = 'search'; search.placeholder = 'Search saved links…'; search.maxLength = 50; search.setAttribute('aria-label', 'Search saved links'); search.addEventListener('input', () => { q = search.value.toLowerCase(); render(); });
    const $saveBtn = el('button', 'btn pri lv-sp', 'Save this page'); $saveBtn.type = 'button'; $saveBtn.addEventListener('click', savePage);
    head.append($saveBtn, search);
    const tags = el('div', 'lv-tags'), list = el('div', 'lv-list'), foot = el('div', 'lv-foot'), chk = el('button', 'lv-chk', 'Check all links'); chk.type = 'button';
    foot.append(chk); pb.append(head, tags, list, foot);
    const ago = t => { const d = Math.round((Date.now() - t) / 864e5); return d < 1 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`; };
    function render(anim) {
      const all = [...new Set(saved.flatMap(s => s.tags))]; tags.replaceChildren();
      ['all', ...all].forEach(t => { const b = el('button', 'lv-tag', t === 'all' ? `All · ${saved.length}` : `#${t}`); b.type = 'button'; b.setAttribute('aria-pressed', String(tag === t)); b.addEventListener('click', () => { tag = t; render(true); }); tags.append(b); });
      if (tag !== 'all' && !all.includes(tag)) tag = 'all';
      list.replaceChildren(); const L = saved.filter(s => (tag === 'all' || s.tags.includes(tag)) && (!q || (s.t + s.s + s.tags.join(' ')).toLowerCase().includes(q)));
      if (!L.length) list.append(el('p', 'lv-empty', saved.length ? 'Nothing matches.' : 'Your vault is empty. Save a link from the page.'));
      L.forEach(s => {
        const c = el('article', 'lv-card'), st = s.checked == null ? el('span', 'lv-st idle', 'not checked') : el('span', 'lv-st s' + s.checked, s.checked === 200 ? '200 OK' : s.checked === 301 ? '301 moved' : '404 dead');
        const h = el('div', 'lv-ch'); h.append(el('b', null, s.t), st);
        const host = s.u.replace(/^https?:\/\//, '').split('/')[0];
        c.append(h, el('p', 'lv-sum', s.s), el('small', null, `${host} · saved ${ago(s.at)}`));
        const tg = el('div', 'lv-ctags'); s.tags.forEach(t => { const b = el('button', null, '#' + t); b.type = 'button'; b.addEventListener('click', () => { tag = t; render(true); }); tg.append(b); }); c.append(tg);
        if (s.checked === 404) { const ar = el('button', 'lv-arch', 'Open archived copy (saved ' + ago(s.at) + ')'); ar.type = 'button'; ar.addEventListener('click', () => toast('Opening the archived copy LinkVault stored when you saved it.')); c.append(ar); }
        const del = el('button', 'lv-del', '×'); del.type = 'button'; del.setAttribute('aria-label', `Remove ${s.t}`); del.addEventListener('click', () => { saved = saved.filter(x => x !== s); persist(); H.badge(saved.length); render(); }); c.append(del);
        list.append(c);
      });
      if (anim && G && !reduced) G.from(list.children, { y: 12, opacity: 0, duration: .35, stagger: .05, ease: 'power3.out' });
    }
    chk.addEventListener('click', async () => {
      if (checking || !saved.length) return; checking = true; chk.disabled = true;
      for (const s of saved) { s.checked = null; render(); chk.textContent = `Checking ${s.u.replace(/^https?:\/\//, '').split('/')[0]}…`; await new Promise(r => setTimeout(r, reduced ? 10 : 380)); s.checked = s.status; render(); const card = [...list.querySelectorAll('.lv-card')].find(c => c.querySelector('b').textContent === s.t); if (card && G && !reduced) G.fromTo(card, { backgroundColor: s.status === 404 ? 'rgba(220,38,38,.12)' : 'rgba(14,124,102,.12)' }, { backgroundColor: 'rgba(0,0,0,0)', duration: .9, clearProps: 'backgroundColor' }); }
      persist(); const dead = saved.filter(s => s.checked === 404).length; chk.textContent = 'Check all links'; chk.disabled = false; checking = false; toast(dead ? `${dead} dead link${dead > 1 ? 's' : ''} found. Archived copies are ready.` : 'Every link is alive.');
    });
    H.badge(saved.length); render(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
