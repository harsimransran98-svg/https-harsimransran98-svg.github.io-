/* BookmarkBloom — Firefox add-on page with a live browser simulator (Bazozo Studio).
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

/* ---------- add-on simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const TAGS = { rose: '#E0457B', amber: '#F2A93B', mint: '#2BB58A', sky: '#3A9BEA', violet: '#7A5CFA', ink: '#2B1B24' };
    const SEED = [
      ['Brutalist type specimens', 'typewolf.example', 'ink', 1.35, ['#111', '#E9E4DA'], 'grid', 200],
      ['Terracotta kitchen ideas', 'homeloom.example', 'amber', 1.0, ['#C8643B', '#F3D9B1'], 'arch', 200],
      ['Japanese packaging archive', 'pkgarchive.example', 'rose', 1.55, ['#F4B6C2', '#C2185B'], 'circle', 404],
      ['Gradient mesh tutorial', 'meshlab.example', 'violet', .85, ['#7A5CFA', '#FF8FB1'], 'blob', 200],
      ['Riso print colour chart', 'risolab.example', 'rose', 1.2, ['#FF48B0', '#00A95C'], 'stripes', 301],
      ['Coastal cabin, Norway', 'cabins.example', 'sky', 1.45, ['#3A6EA5', '#DDE8F0'], 'arch', 200],
      ['Swiss poster index 1958', 'posterindex.example', 'ink', 1.1, ['#E1251B', '#F4F1EA'], 'grid', 404],
      ['Moss & fern terrariums', 'greenjar.example', 'mint', 1.3, ['#2BB58A', '#0F3D2E'], 'blob', 200],
      ['Variable font playground', 'varfont.example', 'violet', .95, ['#1B1037', '#C6B8FF'], 'stripes', 200],
      ['Lisbon tile patterns', 'azulejo.example', 'sky', 1.0, ['#1F4FA3', '#F6F7FB'], 'circle', 200]
    ].map(([t, host, tag, h, c, kind, status], i) => ({ id: i + 1, t, host, tag, h, c, kind, status, checked: null }));
    const ATLAS = [
      ['Ceramics studio rebrand', 'amber', ['#B5562F', '#F6E3CF'], 'arch'], ['Neon night market', 'rose', ['#1B0A2E', '#FF3D9A'], 'stripes'], ['Desert observatory', 'amber', ['#E0A15A', '#3B2416'], 'circle'],
      ['Ocean data posters', 'sky', ['#0E3B5C', '#7FD1F7'], 'grid'], ['Botanical letterforms', 'mint', ['#1F5E45', '#E6F3EA'], 'blob'], ['Midnight jazz covers', 'violet', ['#120B2B', '#9C7BFF'], 'circle']
    ];
    let board = store.get('bb_board', null); if (!Array.isArray(board) || !board.length) board = SEED.map(x => ({ ...x }));
    let uid = Math.max(...board.map(b => b.id)) + 1, filter = 'all', q = '', tab = 0, pickTag = 'rose', checking = false;
    const save = () => { try { store.set('bb_board', board); } catch (_) {} };
    const thumb = (b, hgt) => { const t = el('div', 'bb-th k-' + b.kind); t.style.setProperty('--c1', b.c[0]); t.style.setProperty('--c2', b.c[1]); if (hgt) t.style.height = Math.round(120 * b.h) + 'px'; t.append(el('i')); return t; };

    /* two Firefox tabs: the board and a website */
    const bar = document.querySelector('.cx-tabs'), plus = bar.querySelector('.cx-plus'); bar.querySelectorAll('.cx-tab').forEach(t => t.remove());
    const TABS = [['Bloom board', 'linear-gradient(135deg,#E0457B,#7A5CFA)'], ['Studio Atlas · Inspiration', '#1B1B1B']];
    const tbs = TABS.map(([t, f], i) => { const b = el('button', 'cx-tab fxt'); b.type = 'button'; const fi = el('i', 'fav'); fi.style.background = f; b.append(fi, el('span', null, t)); b.addEventListener('click', () => show(i)); bar.insertBefore(b, plus); return b; });

    /* the board page */
    const boardV = el('div', 'bb-board'), head = el('div', 'bb-head'), title = el('div', 'bb-title');
    const search = el('input', 'bb-q'); search.type = 'search'; search.placeholder = 'Search your board…'; search.maxLength = 50; search.setAttribute('aria-label', 'Search bookmarks'); search.addEventListener('input', () => { q = search.value.toLowerCase(); renderBoard(); });
    const chips = el('div', 'bb-chips'), check = el('button', 'bb-check', 'Check for dead links'); check.type = 'button';
    const tools = el('div', 'bb-tools'); tools.append(search, check); head.append(title, tools, chips);
    const grid = el('div', 'bb-grid'); boardV.append(head, grid);
    /* the website page */
    const atlas = el('div', 'bb-atlas'), at = el('header', 'bb-at'); at.append(el('b', null, 'Studio Atlas'), el('span', null, 'Hover a project and press ♥ Bloom to save it'));
    const ag = el('div', 'bb-ag');
    ATLAS.forEach(([t, tag, c, kind]) => { const card = el('figure', 'bb-ac'); const b = { t, host: 'studioatlas.example', tag, h: 1, c, kind }; card.append(thumb(b), el('figcaption', null, t)); const sv = el('button', 'bb-sv', '♥ Bloom'); sv.type = 'button'; sv.setAttribute('aria-label', `Bloom ${t}`); sv.addEventListener('click', () => add({ ...b, tag: pickTag }, sv)); card.append(sv); ag.append(card); });
    atlas.append(at, ag);
    function show(i) {
      tab = i; tbs.forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-selected', String(j === i)); });
      page.replaceChildren(i === 0 ? boardV : atlas); page.scrollTop = 0; H.url(i === 0 ? 'moz-extension://bookmarkbloom/board' : 'studioatlas.example/inspiration'); renderPop();
      if (i === 0) renderBoard(true);
    }
    function add(b, from) {
      if (board.some(x => x.t === b.t)) { toast('Already on your board.'); return; }
      board.unshift({ ...b, id: uid++, h: .9 + Math.random() * .6, status: 200, checked: null }); save();
      if (from) H.flyToIcon(from, TAGS[b.tag]); if (from && from.classList) { from.textContent = '✓ Bloomed'; from.classList.add('done'); }
      toast(`Bloomed “${b.t}” with a ${b.tag} tag.`); renderPop();
    }
    function renderBoard(anim) {
      title.replaceChildren(); title.append(el('h1', null, 'Bloom board'), el('span', null, `${board.length} bookmarks · ${board.filter(b => b.checked === 404).length} dead`));
      chips.replaceChildren();
      [['all', 'All'], ...Object.keys(TAGS).map(k => [k, k])].forEach(([k, t]) => { const n = k === 'all' ? board.length : board.filter(b => b.tag === k).length; const c = el('button', 'bb-chip', `${t} · ${n}`); c.type = 'button'; if (k !== 'all') c.style.setProperty('--t', TAGS[k]); c.setAttribute('aria-pressed', String(filter === k)); c.addEventListener('click', () => { filter = k; renderBoard(true); }); chips.append(c); });
      grid.replaceChildren();
      const L = board.filter(b => (filter === 'all' || b.tag === filter) && (!q || (b.t + ' ' + b.host + ' ' + b.tag).toLowerCase().includes(q)));
      if (!L.length) grid.append(el('p', 'bb-empty', board.length ? 'Nothing matches.' : 'Your board is empty. Bloom something from Studio Atlas.'));
      L.forEach(b => {
        const card = el('article', 'bb-card' + (b.checked === 404 ? ' dead' : '')); card.style.setProperty('--t', TAGS[b.tag]);
        card.append(thumb(b, true));
        const meta = el('div', 'bb-meta'), dot = el('button', 'bb-dot'); dot.type = 'button'; dot.setAttribute('aria-label', `Tag: ${b.tag}. Click to change`); dot.title = 'Change colour tag';
        dot.addEventListener('click', () => { const ks = Object.keys(TAGS); b.tag = ks[(ks.indexOf(b.tag) + 1) % ks.length]; save(); renderBoard(); });
        meta.append(dot, el('b', null, b.t)); card.append(meta, el('small', null, b.host));
        if (b.checked) { const st = el('span', 'bb-st s' + b.checked, b.checked === 200 ? '200 OK' : b.checked === 301 ? '301 moved' : '404 dead'); card.append(st); }
        if (b.checked === 404) { const wb = el('button', 'bb-wb', 'Open archived copy'); wb.type = 'button'; wb.addEventListener('click', () => toast(`Opening the last archived copy of ${b.host}.`)); card.append(wb); }
        const x = el('button', 'bb-x', '×'); x.type = 'button'; x.setAttribute('aria-label', `Remove ${b.t}`); x.addEventListener('click', () => { board = board.filter(y => y !== b); save(); renderBoard(); renderPop(); }); card.append(x);
        grid.append(card);
      });
      if (anim && G && !reduced) G.from(grid.children, { y: 18, opacity: 0, scale: .96, duration: .45, stagger: .04, ease: 'back.out(1.6)' });
      H.badge(board.length);
    }
    check.addEventListener('click', async () => {
      if (checking) return;
      const dead = board.filter(b => b.checked === 404);
      if (dead.length && check.dataset.mode === 'clean') { board = board.filter(b => b.checked !== 404); save(); check.dataset.mode = ''; check.textContent = 'Check for dead links'; renderBoard(true); renderPop(); toast(`Removed ${dead.length} dead bookmark${dead.length > 1 ? 's' : ''}.`); return; }
      checking = true; check.disabled = true; filter = 'all'; renderBoard();
      for (const b of board) {
        check.textContent = `Checking ${b.host}…`; const card = [...grid.querySelectorAll('.bb-card')].find(c => c.querySelector('b').textContent === b.t);
        if (card) card.classList.add('scan'); await new Promise(r => setTimeout(r, reduced ? 10 : 160));
        b.checked = b.status; if (card) card.classList.remove('scan');
      }
      save(); renderBoard(); checking = false; check.disabled = false;
      const n = board.filter(b => b.checked === 404).length;
      if (n) { check.textContent = `Remove ${n} dead link${n > 1 ? 's' : ''}`; check.dataset.mode = 'clean'; toast(`${n} dead link${n > 1 ? 's' : ''} found. Archived copies are available.`); }
      else { check.textContent = 'Check for dead links'; toast('Every link is alive.'); }
      renderPop();
    });

    /* popup */
    const pg = el('div', 'bb-pg'), tagRow = el('div', 'bb-tagrow'), bloom = el('button', 'btn pri bb-bloom', 'Bloom this page'); bloom.type = 'button';
    Object.entries(TAGS).forEach(([k, c]) => { const b = el('button', 'bb-tg'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', `Tag colour ${k}`); b.dataset.k = k; b.addEventListener('click', () => { pickTag = k; renderPop(); }); tagRow.append(b); });
    const stats = el('div', 'bb-stats'), open = el('button', 'bb-open', 'Open my board →'); open.type = 'button'; open.addEventListener('click', () => show(0));
    pb.append(pg, el('p', 'bb-l', 'Colour tag'), tagRow, bloom, el('p', 'bb-l', 'Your board'), stats, open);
    bloom.addEventListener('click', () => { if (tab === 0) { toast('This is your board. Switch to Studio Atlas to bloom a page.'); return; } add({ t: 'Studio Atlas · Inspiration', host: 'studioatlas.example', tag: pickTag, c: ['#1B1B1B', TAGS[pickTag]], kind: 'grid' }, bloom); });
    function renderPop() {
      pg.replaceChildren(); const d = tab === 0 ? ['Bloom board', 'moz-extension://bookmarkbloom'] : ['Studio Atlas · Inspiration', 'studioatlas.example']; const th = el('i', 'bb-pgt'); th.style.background = tab === 0 ? 'linear-gradient(135deg,#E0457B,#7A5CFA)' : 'linear-gradient(135deg,#1B1B1B,' + TAGS[pickTag] + ')'; pg.append(th, el('b', null, d[0]), el('small', null, d[1]));
      tagRow.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === pickTag)));
      stats.replaceChildren(); const tot = Math.max(1, board.length);
      const barEl = el('div', 'bb-bar'); Object.entries(TAGS).forEach(([k, c]) => { const n = board.filter(b => b.tag === k).length; if (!n) return; const i = el('i'); i.style.background = c; i.style.flex = String(n); i.title = `${k}: ${n}`; barEl.append(i); });
      stats.append(barEl, el('small', null, `${board.length} bookmarks · ${board.filter(b => b.checked === 404).length} dead · ${Object.keys(TAGS).filter(k => board.some(b => b.tag === k)).length} colours used`));
      H.badge(board.length);
    }
    show(0); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
