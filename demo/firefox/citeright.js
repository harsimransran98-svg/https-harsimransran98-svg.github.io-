/* CiteRight — Firefox add-on page with a live browser simulator (Bazozo Studio).
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
    const { el, G, reduced, toast } = H, pb = H.pop.body;
    const ARTS = [
      { key: 'a', type: 'Research article', title: 'Active and quiet sleep states in the common octopus', authors: [['Pereira', 'Lucas R.'], ['Nakamura', 'Aiko'], ['O’Connell', 'Siobhán'], ['Medeiros', 'Sylvia L.']], journal: 'Journal of Comparative Neurology', year: '2026', volume: '534', issue: '11', pages: '2101–2118', doi: '10.5555/jcn.2026.0412', date: '14 October 2026', path: 'jcn/article/10.5555/jcn.2026.0412',
        abs: 'Octopuses alternate between a quiet sleep state and short bouts of “active” sleep marked by rapid skin-colour changes and eye movements. Using continuous video and local field recordings in 18 animals, we show that active bouts recur roughly every 60 minutes and that depriving animals of active sleep produces a rebound. These results suggest a two-stage sleep architecture that evolved independently of the vertebrate one.', kw: ['cephalopods', 'sleep', 'REM', 'comparative neuroscience'] },
      { key: 'b', type: 'Short communication', title: 'Skin patterning during REM-like sleep in cuttlefish', authors: [['Kim', 'Ji-ho'], ['Alvarez', 'Marta']], journal: 'Marine Behaviour Letters', year: '2025', volume: '18', issue: '3', pages: '44–59', doi: '10.5555/mbl.2025.0093', date: '2 May 2025', path: 'mbl/article/10.5555/mbl.2025.0093',
        abs: 'We filmed 12 sleeping cuttlefish at high resolution and found that the skin patterns shown during REM-like sleep closely match the camouflage patterns they use while awake, hinting at a replay of waking experience.', kw: ['cuttlefish', 'camouflage', 'sleep'] }
    ];
    let A = null, meta = null, style = 'apa', bib = [];
    const STY = { apa: 'APA 7', mla: 'MLA 9', chi: 'Chicago', harv: 'Harvard', bib: 'BibTeX' };
    /* formatting helpers */
    const ini = g => g.split(/\s+/).filter(Boolean).map(p => p.split('-').map(x => x[0].toUpperCase() + '.').join('-')).join(' ');
    const MINOR = new Set('a an and as at but by for in of on or the to with'.split(' '));
    const titleCase = t => t.split(' ').map((w, i) => i && MINOR.has(w.toLowerCase()) ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1)).join(' ');
    const pgShort = p => { const [a, b] = p.split('–'); if (!b || a.length !== b.length) return p; let i = 0; while (i < a.length - 2 && a[i] === b[i]) i++; return a + '–' + b.slice(i); };
    const parseAuthors = s => s.split(';').map(x => x.trim()).filter(Boolean).map(x => { const [l, g] = x.split(',').map(y => (y || '').trim()); return [l, g || '']; });
    // returns [[text, italic?], ...]
    function fmt(m, st) {
      const au = m.authors, n = au.length, doiUrl = 'https://doi.org/' + m.doi;
      if (st === 'apa') { const names = au.map(([l, g]) => `${l}, ${ini(g)}`); const a = n === 1 ? names[0] : names.slice(0, -1).join(', ') + ', & ' + names[n - 1]; return [[`${a} (${m.year}). ${m.title}. `], [m.journal, 1], [', '], [m.volume, 1], [`(${m.issue}), ${m.pages}. ${doiUrl}`]]; }
      if (st === 'mla') { const a = n === 1 ? `${au[0][0]}, ${au[0][1]}` : n === 2 ? `${au[0][0]}, ${au[0][1]}, and ${au[1][1]} ${au[1][0]}` : `${au[0][0]}, ${au[0][1]}, et al`; return [[`${a}. “${titleCase(m.title)}.” `], [m.journal, 1], [`, vol. ${m.volume}, no. ${m.issue}, ${m.year}, pp. ${pgShort(m.pages)}. ${doiUrl}.`]]; }
      if (st === 'chi') { const rest = au.slice(1).map(([l, g]) => `${g} ${l}`); const a = n === 1 ? `${au[0][0]}, ${au[0][1]}` : `${au[0][0]}, ${au[0][1]}, ` + (rest.length > 1 ? rest.slice(0, -1).join(', ') + ', and ' + rest[rest.length - 1] : 'and ' + rest[0]); return [[`${a}. ${m.year}. “${titleCase(m.title)}.” `], [m.journal], [` ${m.volume} (${m.issue}): ${pgShort(m.pages)}. ${doiUrl}.`]].map((x, i) => i === 1 ? [x[0], 1] : x); }
      if (st === 'harv') { const names = au.map(([l, g]) => `${l}, ${ini(g).replace(/ /g, '')}`); const a = n === 1 ? names[0] : names.slice(0, -1).join(', ') + ' and ' + names[n - 1]; return [[`${a} (${m.year}) ‘${m.title}’, `], [m.journal, 1], [`, ${m.volume}(${m.issue}), pp. ${m.pages}. doi:${m.doi}.`]]; }
      const key = (au[0][0].normalize('NFD').replace(/[^A-Za-z]/g, '') + m.year + m.title.split(' ').find(w => !MINOR.has(w.toLowerCase()))).toLowerCase().replace(/[^a-z0-9]/g, '');
      return [[`@article{${key},\n  author  = {${au.map(([l, g]) => `${l}, ${g}`).join(' and ')}},\n  title   = {{${m.title}}},\n  journal = {${m.journal}},\n  year    = {${m.year}},\n  volume  = {${m.volume}},\n  number  = {${m.issue}},\n  pages   = {${m.pages.replace('–', '--')}},\n  doi     = {${m.doi}}\n}`]];
    }
    const plain = parts => parts.map(p => p[0]).join('');

    /* the journal page */
    const site = el('div', 'ci-site'); page.append(site);
    function load(a) {
      A = a; meta = JSON.parse(JSON.stringify({ title: a.title, authors: a.authors, journal: a.journal, year: a.year, volume: a.volume, issue: a.issue, pages: a.pages, doi: a.doi }));
      site.replaceChildren(); H.url('journals.example/' + a.path); page.scrollTop = 0;
      const top = el('header', 'ci-top'); top.append(el('b', null, '◈ journals.example'), el('span', null, 'Browse · Submit · Sign in')); site.append(top);
      const art = el('article', 'ci-art');
      const tag = (node, k) => { node.dataset.meta = k; return node; };
      art.append(el('p', 'ci-type', a.type + ' · Open access'), tag(el('h1', null, a.title), 'title'));
      const au = tag(el('p', 'ci-au'), 'authors'); a.authors.forEach(([l, g], i) => { au.append(el('span', null, `${g} ${l}`)); if (i < a.authors.length - 1) au.append(document.createTextNode(', ')); }); art.append(au);
      const src = el('p', 'ci-src'); src.append(tag(el('i', null, a.journal), 'journal'), document.createTextNode(' · '), tag(el('span', null, `Volume ${a.volume}, Issue ${a.issue}`), 'volume'), document.createTextNode(' · '), tag(el('span', null, `pp. ${a.pages}`), 'pages')); art.append(src);
      const pub = el('p', 'ci-pub'); pub.append(tag(el('span', null, `Published ${a.date}`), 'year'), document.createTextNode(' · '), tag(el('span', 'ci-doi', `https://doi.org/${a.doi}`), 'doi')); art.append(pub);
      art.append(el('h2', null, 'Abstract'), el('p', 'ci-abs', a.abs));
      const kw = el('p', 'ci-kw'); kw.append(el('b', null, 'Keywords: ')); a.kw.forEach(k => kw.append(el('span', null, k))); art.append(kw);
      const o = ARTS.find(x => x !== a), rel = el('button', 'ci-rel'); rel.type = 'button'; rel.append(el('small', null, 'Related article'), el('b', null, o.title), el('span', null, `${o.authors[0][0]} et al. · ${o.journal} · ${o.year}`)); rel.addEventListener('click', () => { load(o); scan(); }); art.append(rel);
      site.append(art); renderFields(); renderOut();
    }
    async function scan() {
      const order = ['title', 'authors', 'journal', 'volume', 'pages', 'year', 'doi']; status.textContent = 'Reading the page…';
      for (const k of order) {
        const n = site.querySelector(`[data-meta="${k}"]`); if (!n) continue;
        n.classList.add('ci-hit'); n.dataset.lab = k; const f = fields[k === 'volume' ? 'volume' : k]; if (f && G && !reduced) G.fromTo(f, { backgroundColor: 'rgba(200,150,62,.35)' }, { backgroundColor: 'rgba(200,150,62,0)', duration: .8, clearProps: 'backgroundColor' });
        await new Promise(r => setTimeout(r, reduced ? 10 : 170));
      }
      status.textContent = `Found 8 fields · DOI ${A.doi}`; setTimeout(() => site.querySelectorAll('.ci-hit').forEach(n => n.classList.remove('ci-hit')), 1400);
    }

    /* popup */
    const status = el('p', 'ci-status'), fieldsBox = el('div', 'ci-fields'), fields = {};
    const FLD = [['title', 'Title', 'wide'], ['authors', 'Authors (Last, First; …)', 'wide'], ['journal', 'Journal', 'wide'], ['year', 'Year'], ['volume', 'Volume'], ['issue', 'Issue'], ['pages', 'Pages'], ['doi', 'DOI', 'wide']];
    FLD.forEach(([k, l, w]) => { const lab = el('label', 'ci-f' + (w ? ' wide' : '')); const i = el(k === 'title' || k === 'authors' ? 'textarea' : 'input'); if (i.tagName === 'TEXTAREA') i.rows = 2; i.maxLength = 300; i.addEventListener('input', () => { meta[k] = k === 'authors' ? parseAuthors(i.value) : i.value; renderOut(); }); lab.append(el('span', null, l), i); fields[k] = i; fieldsBox.append(lab); });
    const seg = el('div', 'ci-seg'); Object.entries(STY).forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.k = k; b.addEventListener('click', () => { style = k; renderOut(); renderBib(); }); seg.append(b); });
    const out = el('div', 'ci-out'), row = el('div', 'ci-row'), cp = el('button', 'btn pri', 'Copy citation'), addB = el('button', 'ci-add', '+ Add to bibliography'); cp.type = addB.type = 'button'; row.append(cp, addB);
    const bibBox = el('div', 'ci-bib'), bibRow = el('div', 'ci-row'), cpAll = el('button', 'ci-add', 'Copy all'), dl = el('button', 'ci-add', 'Download'); cpAll.type = dl.type = 'button'; bibRow.append(cpAll, dl);
    const det = el('details', 'ci-det'); det.append(el('summary', null, 'Detected metadata · edit if needed'), fieldsBox);
    pb.append(status, seg, out, row, det, el('p', 'ci-l', 'Bibliography'), bibBox, bibRow);
    function renderFields() { FLD.forEach(([k]) => { fields[k].value = k === 'authors' ? meta.authors.map(([l, g]) => `${l}, ${g}`).join('; ') : meta[k]; }); }
    function renderOut() {
      seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === style)));
      out.replaceChildren(); out.classList.toggle('code', style === 'bib');
      if (!meta.authors.length) { out.append(el('p', null, 'Add at least one author.')); return; }
      fmt(meta, style).forEach(([t, it]) => out.append(it ? el('i', null, t) : document.createTextNode(t)));
    }
    const copy = (t, m) => { try { navigator.clipboard.writeText(t).catch(() => {}); } catch (_) {} toast(m); };
    cp.addEventListener('click', () => copy(plain(fmt(meta, style)), `${STY[style]} citation copied.`));
    addB.addEventListener('click', () => { if (bib.some(b => b.doi === meta.doi)) { toast('Already in your bibliography.'); return; } bib.push(JSON.parse(JSON.stringify(meta))); bib.sort((a, b) => a.authors[0][0].localeCompare(b.authors[0][0])); H.flyToIcon(addB); renderBib(true); toast('Added to your bibliography.'); });
    function renderBib(anim) {
      bibBox.replaceChildren(); if (!bib.length) bibBox.append(el('p', 'ci-empty', 'Nothing yet. Add this article, then open the related one.'));
      bib.forEach(m => { const r = el('div', 'ci-entry' + (style === 'bib' ? ' code' : '')); fmt(m, style).forEach(([t, it]) => r.append(it ? el('i', null, t) : document.createTextNode(t))); const x = el('button', 'ci-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Remove entry'); x.addEventListener('click', () => { bib = bib.filter(b => b !== m); renderBib(); }); r.append(x); bibBox.append(r); });
      if (anim && G && !reduced && bibBox.lastChild) G.from(bibBox.children, { x: 14, opacity: 0, duration: .35, stagger: .05 });
      dl.textContent = style === 'bib' ? 'Download .bib' : 'Download .txt'; H.badge(bib.length || '');
    }
    const allText = () => bib.map(m => plain(fmt(m, style))).join(style === 'bib' ? '\n\n' : '\n\n');
    cpAll.addEventListener('click', () => { if (!bib.length) { toast('Your bibliography is empty.'); return; } copy(allText(), `${bib.length} ${STY[style]} entries copied.`); });
    dl.addEventListener('click', () => { if (!bib.length) { toast('Your bibliography is empty.'); return; } const b = new Blob([allText() + '\n'], { type: 'text/plain' }), u = URL.createObjectURL(b), a = el('a'); a.href = u; a.download = style === 'bib' ? 'references.bib' : `references-${style}.txt`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); toast(`Saved ${a.download}`); });
    H.pop.onToggle(o => { if (o) scan(); });
    load(ARTS[0]); renderBib(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
