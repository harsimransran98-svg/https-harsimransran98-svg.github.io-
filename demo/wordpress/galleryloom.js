/* GalleryLoom — block theme & Gutenberg block suite customizer (Bazozo Studio).
   All DOM is built with createElement + textContent. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const NS = 'http://www.w3.org/2000/svg';
  const svg = (vb, paths, attrs = {}) => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', vb); Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v)); paths.forEach(([t, a]) => { const p = document.createElementNS(NS, t); Object.entries(a).forEach(([k, v]) => p.setAttribute(k, v)); s.append(p); }); return s; };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- scale ---------- */
  const wrap = $('#stageWrap'); let S = 1;
  function fit() { S = Math.max(.5, Math.min(1, wrap.clientWidth / 1200)); wrap.style.setProperty('--s', S.toFixed(4)); }
  window.addEventListener('resize', fit); fit();

  /* ---------- checklist ---------- */
  const done = new Set();
  function check(k) { if (done.has(k)) return; done.add(k); const c = $(`#tryList [data-t="${k}"]`); if (c) { c.classList.add('done'); if (G) G.fromTo(c, { scale: .9 }, { scale: 1, duration: .45, ease: 'back.out(3)' }); } $('#tryCount').textContent = `${done.size}/5`; }

  /* ---------- presets ---------- */
  const TYPES = {
    editorial: { name: 'Editorial', head: "'Fraunces', Georgia, serif", body: "'Inter', sans-serif", hw: 800, ls: '-.03em', cs: 'none' },
    grotesk: { name: 'Grotesk', head: "'Space Grotesk', sans-serif", body: "'DM Sans', sans-serif", hw: 700, ls: '-.045em', cs: 'none' },
    classic: { name: 'Classic', head: "'Playfair Display', Georgia, serif", body: "'Lora', Georgia, serif", hw: 800, ls: '-.01em', cs: 'none' },
    mono: { name: 'Mono', head: "'DM Mono', ui-monospace, monospace", body: "'DM Sans', sans-serif", hw: 500, ls: '-.02em', cs: 'uppercase' }
  };
  const PALS = {
    paper: { name: 'Paper · warm cream with vermilion', bg: '#FBF8F3', ink: '#1C1917', acc: '#E2553A', soft: '#F1EBE2' },
    night: { name: 'Night · ink with saffron', bg: '#0F1115', ink: '#F3F4F6', acc: '#F5B942', soft: '#1A1D24' },
    sage: { name: 'Sage · garden greens', bg: '#F2F5EF', ink: '#1F2A22', acc: '#4D7C5A', soft: '#E3EBDF' },
    ocean: { name: 'Ocean · clear blues', bg: '#EEF5FB', ink: '#0B2540', acc: '#1F6FEB', soft: '#DCE9F7' },
    rose: { name: 'Rose · blush and magenta', bg: '#FFF5F7', ink: '#3B0A1A', acc: '#E11D74', soft: '#FCE7EF' }
  };
  const HDRS = {
    classic: { name: 'Classic', d: [['rect', { x: 4, y: 12, width: 22, height: 6, rx: 2 }], ['rect', { x: 60, y: 13, width: 40, height: 4, rx: 2 }], ['rect', { x: 106, y: 10, width: 20, height: 10, rx: 5 }]] },
    centered: { name: 'Centered', d: [['rect', { x: 50, y: 4, width: 30, height: 7, rx: 2 }], ['rect', { x: 35, y: 18, width: 60, height: 4, rx: 2 }]] },
    split: { name: 'Split', d: [['rect', { x: 4, y: 13, width: 36, height: 4, rx: 2 }], ['rect', { x: 52, y: 11, width: 26, height: 8, rx: 2 }], ['rect', { x: 106, y: 10, width: 20, height: 10, rx: 5 }]] },
    minimal: { name: 'Minimal', d: [['rect', { x: 4, y: 12, width: 22, height: 6, rx: 2 }], ['rect', { x: 112, y: 9, width: 14, height: 2, rx: 1 }], ['rect', { x: 112, y: 14, width: 14, height: 2, rx: 1 }], ['rect', { x: 112, y: 19, width: 14, height: 2, rx: 1 }]] }
  };
  const NAMES = { header: 'Header', hero: 'Hero', gallery: 'Gallery', features: 'Services', quote: 'Testimonial', pricing: 'Pricing', cta: 'Call to action', footer: 'Footer' };
  const ICONS = { header: 'M3 5h18v5H3Z', hero: 'M3 4h18v16H3Zm3 12 4-5 3 3 2-2 3 4', gallery: 'M3 3h8v8H3Zm10 0h8v5h-8Zm0 7h8v11h-8ZM3 13h8v8H3Z', features: 'M3 6h5v12H3Zm7 0h5v12h-5Zm7 0h4v12h-4Z', quote: 'M5 7h5v5c0 3-2 5-5 5m9-10h5v5c0 3-2 5-5 5', pricing: 'M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', cta: 'M4 8h16v8H4Zm4 4h8', footer: 'M3 14h18v5H3Z' };

  let state = { type: 'editorial', pal: 'paper', hdr: 'classic', gal: 'masonry', order: ['hero', 'gallery', 'features', 'quote', 'pricing', 'cta'], hidden: [] };
  let device = 'desktop', sel = null;

  /* ---------- the site ---------- */
  const site = $('#site'), frame = $('#frame'), blocks = {};
  const PHOTOS = [
    ['Golden hour, Lisbon', '4/5', '#F59E0B,#B45309 50%,#451A03'], ['Studio portrait', '1/1', '#E5E7EB,#9CA3AF 50%,#1F2937'], ['Coast road', '3/4', '#7DD3FC,#0EA5E9 45%,#0C4A6E'],
    ['Wedding, Udaipur', '4/3', '#FDA4AF,#E11D48 55%,#4C0519'], ['Pine forest', '3/5', '#86EFAC,#15803D 50%,#052E16'], ['Product · ceramics', '1/1', '#E7E5E4,#A8A29E 50%,#44403C'], ['Night market', '4/5', '#C4B5FD,#7C3AED 50%,#1E1B4B']
  ];
  function blk(id, cls) { const b = el(id === 'header' ? 'header' : id === 'footer' ? 'footer' : 'section', 'blk ' + (cls || '')); b.dataset.id = id; const t = el('span', 'btag', NAMES[id]); b.append(t); b.addEventListener('click', e => { if (e.target.closest('.tile')) return; select(id, false); }); blocks[id] = b; return b; }
  function build() {
    const h = blk('header', 'hdr'); const logo = el('div', 'logo'); logo.append(el('i'), document.createTextNode('Northlight'));
    const nav = el('nav', 'hnav'); ['Work', 'Journal', 'Prints', 'Contact'].forEach(n => nav.append(el('span', null, n)));
    const bu = el('span', 'burger'); bu.append(el('i')); h.append(logo, nav, el('span', 'hbtn', 'Book a shoot'), bu);
    const hero = blk('hero', 'hero'), hl = el('div'), h1 = el('h1'); h1.append(document.createTextNode('Light, '), el('em', null, 'kept'), document.createTextNode('.'));
    hl.append(h1, el('p', null, 'Northlight is a two-person photography studio for weddings, editorial and the small brands we love.'), el('span', 'go', 'See the work →'));
    hero.append(hl, el('div', 'art'));
    const gal = blk('gallery', 'sec'); gal.append(el('h2', null, 'Selected work'), el('p', 'lead', 'A GalleryLoom block: masonry or grid, lazy-loaded, with a lightbox.'));
    const g = el('div', 'gal masonry'); g.id = 'gal';
    PHOTOS.forEach(([cap, ar, grad], i) => { const t = el('button', 'tile'); t.type = 'button'; t.setAttribute('aria-label', `Open ${cap}`); const ph = el('i', 'ph'); ph.style.aspectRatio = ar; ph.style.background = `linear-gradient(160deg,${grad})`; t.append(ph, el('span', null, cap)); t.addEventListener('click', () => openLb(i)); g.append(t); });
    gal.append(g);
    const fe = blk('features', 'sec'); fe.append(el('h2', null, 'What we shoot')); const fs = el('div', 'feats');
    [['Weddings', 'Quiet, honest coverage from first look to last dance.'], ['Editorial', 'Portraits and stories for magazines and brands.'], ['Product', 'Clean studio stills that make things want to be held.']].forEach(([t, p]) => { const f = el('div', 'feat'); f.append(el('div', 'dot'), el('b', null, t), el('p', null, p)); fs.append(f); });
    fe.append(fs);
    const q = blk('quote', 'quote'); q.append(el('q', null, 'They noticed the moments we didn’t know we’d want to remember.'), el('span', null, 'Ana & Dev · married in Udaipur'));
    const pr = blk('pricing', 'sec'); pr.append(el('h2', null, 'Packages')); const ts = el('div', 'tiers');
    [['Portrait', '₹18k', ['2 hours', '40 edited photos', 'Online gallery']], ['Wedding', '₹1.6L', ['Full day, 2 shooters', '600+ photos', 'Printed album'], true], ['Brand', '₹45k', ['Half-day studio', 'Product + team', 'Usage licence']]].forEach(([n, p, li, pop]) => { const t = el('div', 'tier' + (pop ? ' pop' : '')); const ul = el('ul'); li.forEach(x => ul.append(el('li', null, '✓ ' + x))); t.append(el('small', null, n), el('b', null, p), ul); ts.append(t); });
    pr.append(ts);
    const c = blk('cta', 'cta'); c.append(el('h2', null, 'Let’s make something.'), el('span', null, 'Check our dates'));
    const f = blk('footer', 'sfoot'); f.append(el('span', null, '© Northlight Studio'), el('span', null, 'Built with GalleryLoom'));
  }
  function renderSite() {
    site.replaceChildren(blocks.header);
    state.order.forEach(id => { if (!state.hidden.includes(id)) site.append(blocks[id]); });
    site.append(blocks.footer);
  }
  function applyStyle() {
    const t = TYPES[state.type], p = PALS[state.pal];
    Object.entries({ '--s-head': t.head, '--s-body': t.body, '--s-hw': t.hw, '--s-ls': t.ls, '--s-case': t.cs, '--s-bg': p.bg, '--s-ink': p.ink, '--s-acc': p.acc, '--s-soft': p.soft }).forEach(([k, v]) => site.style.setProperty(k, v));
    blocks.header.className = `blk hdr ${state.hdr}${sel === 'header' ? ' sel' : ''}`;
    $('#gal').className = `gal ${state.gal}`;
    $('#palName').textContent = p.name;
  }

  /* ---------- styles panel ---------- */
  Object.entries(TYPES).forEach(([k, t]) => {
    const b = el('button', 'type'); b.type = 'button'; b.dataset.k = k; b.setAttribute('aria-pressed', 'false');
    const aa = el('b', null, 'Aa'); aa.style.fontFamily = t.head; aa.style.fontWeight = t.hw; b.append(aa, el('span', null, t.name));
    b.addEventListener('click', () => commit({ type: k }, 'type', `Typography: ${t.name}`)); $('#types').append(b);
  });
  Object.entries(PALS).forEach(([k, p]) => {
    const b = el('button', 'pal'); b.type = 'button'; b.dataset.k = k; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', p.name);
    [p.bg, p.ink, p.acc].forEach(c => { const i = el('i'); i.style.background = c; b.append(i); });
    b.addEventListener('click', () => commit({ pal: k }, 'palette', `Palette: ${p.name.split(' ·')[0]}`)); $('#pals').append(b);
  });
  Object.entries(HDRS).forEach(([k, h]) => {
    const b = el('button', 'hl'); b.type = 'button'; b.dataset.k = k; b.setAttribute('aria-pressed', 'false');
    b.append(svg('0 0 130 30', h.d.map(([t, a]) => [t, { ...a, fill: '#1E1E1E', opacity: .8 }]), { 'aria-hidden': 'true' }), el('span', null, h.name));
    b.addEventListener('click', () => { commit({ hdr: k }, 'header', `Header: ${h.name}`); select('header', true); }); $('#hdrs').append(b);
  });
  $$('#galSeg button').forEach(b => b.addEventListener('click', () => { commit({ gal: b.dataset.g }, null, `Gallery: ${b.textContent}`); select('gallery', true); }));
  function syncPanel() {
    $$('#types .type').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === state.type)));
    $$('#pals .pal').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === state.pal)));
    $$('#hdrs .hl').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === state.hdr)));
    $$('#galSeg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.g === state.gal)));
  }

  /* ---------- history ---------- */
  const past = [], future = []; let dirty = false;
  const snap = () => JSON.parse(JSON.stringify(state));
  function commit(patch, chk, label) {
    const before = snap(), next = { ...snap(), ...patch };
    if (JSON.stringify(before) === JSON.stringify(next)) return;
    past.push(before); future.length = 0; apply(next, true); if (chk) check(chk);
    setDirty(true);
  }
  function apply(next, anim) {
    const orderChanged = next.order.join() !== state.order.join() || next.hidden.join() !== state.hidden.join();
    const styleChanged = next.type !== state.type || next.pal !== state.pal;
    if (orderChanged) flip(() => { state = next; renderSite(); applyStyle(); }); else { state = next; applyStyle(); }
    if (styleChanged && G && anim) G.fromTo(site, { opacity: .55 }, { opacity: 1, duration: .45, ease: 'power2.out' });
    if (G && anim && !orderChanged && !styleChanged) G.fromTo(blocks.header.children, { y: -6, opacity: .2 }, { y: 0, opacity: 1, duration: .45, stagger: .04, ease: 'back.out(2)' });
    syncPanel(); renderList(); histUi();
  }
  function histUi() { $('#undo').disabled = !past.length; $('#redo').disabled = !future.length; }
  $('#undo').addEventListener('click', () => { if (!past.length) return; future.push(snap()); apply(past.pop(), true); setDirty(true); });
  $('#redo').addEventListener('click', () => { if (!future.length) return; past.push(snap()); apply(future.pop(), true); setDirty(true); });
  function setDirty(v) { dirty = v; const b = $('#saveBtn'); b.replaceChildren(document.createTextNode('Save')); if (v) b.append(el('span', 'dirty')); }

  /* ---------- FLIP reorder in the canvas ---------- */
  function flip(change) {
    const before = {}; Object.entries(blocks).forEach(([id, b]) => { if (b.isConnected) before[id] = b.getBoundingClientRect().top; });
    change();
    if (!G) return;
    Object.entries(blocks).forEach(([id, b]) => {
      if (!b.isConnected) return;
      if (before[id] == null) { G.from(b, { opacity: 0, scale: .96, duration: .5, ease: 'power3.out', clearProps: 'all' }); return; }
      const dy = (before[id] - b.getBoundingClientRect().top) / S;
      if (Math.abs(dy) > 1) G.fromTo(b, { y: dy }, { y: 0, duration: .65, ease: 'power3.inOut', clearProps: 'transform' });
    });
  }

  /* ---------- list view ---------- */
  const lvl = $('#lvl');
  function icon(id) { return svg('0 0 24 24', [['path', { d: ICONS[id], fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }]], { class: 'ic', 'aria-hidden': 'true' }); }
  function actBtn(label, d, fn) { const b = el('button'); b.type = 'button'; b.setAttribute('aria-label', label); b.append(svg('0 0 24 24', [['path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round' }]])); b.addEventListener('click', e => { e.stopPropagation(); fn(); }); return b; }
  function item(id, pinned) {
    const li = el('div', 'li' + (pinned ? ' pinned' : '') + (state.hidden.includes(id) ? ' off' : '')); li.dataset.id = id; li.setAttribute('role', 'option'); li.tabIndex = 0; li.setAttribute('aria-selected', String(sel === id));
    const grip = el('span', 'grip'); grip.append(svg('0 0 12 16', [[ 'circle', { cx: 3, cy: 3, r: 1.4, fill: 'currentColor' }], ['circle', { cx: 9, cy: 3, r: 1.4, fill: 'currentColor' }], ['circle', { cx: 3, cy: 8, r: 1.4, fill: 'currentColor' }], ['circle', { cx: 9, cy: 8, r: 1.4, fill: 'currentColor' }], ['circle', { cx: 3, cy: 13, r: 1.4, fill: 'currentColor' }], ['circle', { cx: 9, cy: 13, r: 1.4, fill: 'currentColor' }]]));
    li.append(grip, icon(id), el('span', 'nm', NAMES[id]));
    if (!pinned) {
      const a = el('span', 'acts');
      a.append(actBtn(`Move ${NAMES[id]} up`, 'M6 15l6-6 6 6', () => move(id, -1)), actBtn(`Move ${NAMES[id]} down`, 'M6 9l6 6 6-6', () => move(id, 1)),
        actBtn(state.hidden.includes(id) ? `Show ${NAMES[id]}` : `Hide ${NAMES[id]}`, state.hidden.includes(id) ? 'M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-2.4 3M6.6 6.6C4.2 8.2 3 12 3 12s4 6 9 6a9 9 0 0 0 4.4-1.2' : 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', () => toggleHide(id)));
      li.append(a);
      grip.addEventListener('pointerdown', e => startDrag(e, li));
    }
    li.addEventListener('click', () => select(id, true));
    li.addEventListener('keydown', e => { if (e.key === 'Enter') select(id, true); if (!pinned && e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); move(id, e.key === 'ArrowUp' ? -1 : 1); } });
    return li;
  }
  function renderList() { lvl.replaceChildren(item('header', true), ...state.order.map(id => item(id)), item('footer', true)); }
  function move(id, d) {
    const o = state.order.slice(), i = o.indexOf(id), j = i + d; if (j < 0 || j >= o.length) return;
    [o[i], o[j]] = [o[j], o[i]]; commit({ order: o }, 'reorder', `Moved ${NAMES[id]}`); select(id, true);
    const li = lvl.querySelector(`[data-id="${id}"]`); if (li) li.focus();
  }
  function toggleHide(id) { const h = state.hidden.includes(id) ? state.hidden.filter(x => x !== id) : [...state.hidden, id]; commit({ hidden: h }, null, `${NAMES[id]} ${h.includes(id) ? 'hidden' : 'shown'}`); }

  let drag = null;
  function startDrag(e, li) {
    e.preventDefault(); e.stopPropagation();
    const top = li.offsetTop, gap = el('div', 'li-gap');
    li.after(gap);
    Object.assign(li.style, { position: 'absolute', left: 0, right: 0, top: top + 'px' }); li.classList.add('dragging');
    drag = { li, gap, top, y0: e.clientY, id: li.dataset.id };
    try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
    e.target.addEventListener('pointermove', onDrag); e.target.addEventListener('pointerup', endDrag, { once: true }); e.target.addEventListener('pointercancel', endDrag, { once: true });
  }
  function onDrag(e) {
    if (!drag) return; const dy = (e.clientY - drag.y0) / S, y = drag.top + dy;
    drag.li.style.top = y + 'px';
    const items = [...lvl.querySelectorAll('.li:not(.dragging):not(.pinned)')], mid = y + 19;
    let before = null; for (const it of items) { if (mid < it.offsetTop + it.offsetHeight / 2) { before = it; break; } }
    const target = before || lvl.querySelector('.li.pinned[data-id="footer"]');
    if (drag.gap.nextSibling !== target) target.before(drag.gap);
  }
  function endDrag(e) {
    if (!drag) return; e.target.removeEventListener('pointermove', onDrag);
    const { li, gap, id } = drag; drag = null;
    gap.replaceWith(li); li.removeAttribute('style'); li.classList.remove('dragging');
    const order = [...lvl.querySelectorAll('.li:not(.pinned)')].map(x => x.dataset.id);
    if (order.join() !== state.order.join()) { commit({ order }, 'reorder', `Moved ${NAMES[id]}`); select(id, true); }
  }

  /* ---------- selection ---------- */
  function select(id, scroll) {
    sel = id; Object.entries(blocks).forEach(([k, b]) => b.classList.toggle('sel', k === id));
    $$('#lvl .li').forEach(li => li.setAttribute('aria-selected', String(li.dataset.id === id)));
    const b = blocks[id];
    if (scroll && b.isConnected) { const t = Math.max(0, b.offsetTop - 16); if (G) G.to(frame, { scrollTop: t, duration: .6, ease: 'power3.inOut' }); else frame.scrollTop = t; }
  }

  /* ---------- devices ---------- */
  const WIDTH = { desktop: 616, tablet: 470, mobile: 330 };
  $$('.dev button').forEach(b => b.addEventListener('click', () => {
    device = b.dataset.d; $$('.dev button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    frame.style.width = WIDTH[device] + 'px'; frame.className = 'frame ' + device;
    if (device === 'mobile') check('device');
  }));
  frame.style.width = WIDTH.desktop + 'px';

  /* ---------- lightbox ---------- */
  const lb = $('#lb'); let li0 = 0;
  function showLb() { const [cap, , grad] = PHOTOS[li0]; $('#lbImg').style.background = `linear-gradient(160deg,${grad})`; $('#lbCap').textContent = `${cap} · ${li0 + 1} / ${PHOTOS.length}`; }
  function openLb(i) { li0 = i; showLb(); lb.hidden = false; if (G) G.fromTo('#lbImg', { scale: .85, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: 'back.out(1.6)' }); $('#lbClose').focus(); }
  const step = d => { li0 = (li0 + d + PHOTOS.length) % PHOTOS.length; showLb(); if (G) G.fromTo('#lbImg', { x: 30 * d, opacity: .3 }, { x: 0, opacity: 1, duration: .35, ease: 'power2.out' }); };
  $('#lbPrev').addEventListener('click', () => step(-1)); $('#lbNext').addEventListener('click', () => step(1));
  $('#lbClose').addEventListener('click', () => { lb.hidden = true; });
  lb.addEventListener('click', e => { if (e.target === lb) lb.hidden = true; });

  /* ---------- save + generated code ---------- */
  const snack = $('#snack'); let st = null;
  function code() {
    const t = TYPES[state.type], p = PALS[state.pal];
    const json = {
      $schema: 'https://schemas.wp.org/trunk/theme.json', version: 3,
      settings: {
        color: { palette: [{ slug: 'base', name: 'Base', color: p.bg }, { slug: 'contrast', name: 'Contrast', color: p.ink }, { slug: 'accent', name: 'Accent', color: p.acc }, { slug: 'soft', name: 'Soft', color: p.soft }] },
        typography: { fontFamilies: [{ slug: 'heading', name: 'Heading', fontFamily: t.head }, { slug: 'body', name: 'Body', fontFamily: t.body }] }
      },
      styles: {
        color: { background: 'var(--wp--preset--color--base)', text: 'var(--wp--preset--color--contrast)' },
        typography: { fontFamily: 'var(--wp--preset--font-family--body)' },
        elements: { heading: { typography: { fontFamily: 'var(--wp--preset--font-family--heading)', fontWeight: String(t.hw), letterSpacing: t.ls, textTransform: t.cs } } }
      }
    };
    const SLUG = { hero: 'galleryloom/hero', gallery: 'galleryloom/gallery', features: 'galleryloom/services', quote: 'galleryloom/testimonial', pricing: 'galleryloom/pricing', cta: 'galleryloom/cta' };
    const tpl = [`<!-- wp:template-part {"slug":"header-${state.hdr}","tagName":"header"} /-->`, ...state.order.filter(id => !state.hidden.includes(id)).map(id => id === 'gallery' ? `<!-- wp:galleryloom/gallery {"layout":"${state.gal}","lightbox":true} /-->` : `<!-- wp:pattern {"slug":"${SLUG[id]}"} /-->`), '<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->'];
    return `// theme.json\n${JSON.stringify(json, null, 2)}\n\n// templates/home.html\n${tpl.join('\n')}\n`;
  }
  $('#saveBtn').addEventListener('click', () => {
    setDirty(false); $('#snackT').textContent = 'Site updated. Template and styles saved.'; snack.hidden = false; clearTimeout(st);
    if (G) G.fromTo(snack, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: 'back.out(2)' });
    st = setTimeout(() => { snack.hidden = true; }, 5000);
  });
  const modal = $('#modal');
  $('#snackBtn').addEventListener('click', () => { $('#code').textContent = code(); modal.hidden = false; snack.hidden = true; if (G) G.from('.mbox', { y: 20, opacity: 0, duration: .3 }); });
  const closeM = () => { modal.hidden = true; };
  $('#mClose').addEventListener('click', closeM); $('#mDone').addEventListener('click', closeM);
  modal.addEventListener('click', e => { if (e.target === modal) closeM(); });
  $('#mCopy').addEventListener('click', async () => { const b = $('#mCopy'); try { await navigator.clipboard.writeText(code()); b.textContent = 'Copied ✓'; } catch (_) { b.textContent = 'Select and copy'; } setTimeout(() => { b.textContent = 'Copy'; }, 1600); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!lb.hidden) lb.hidden = true; else if (!modal.hidden) closeM(); }
    if (!lb.hidden && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) step(e.key === 'ArrowLeft' ? -1 : 1);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && e.target.closest && e.target.closest('#stage')) { e.preventDefault(); (e.shiftKey ? $('#redo') : $('#undo')).click(); }
  });

  /* ---------- boot ---------- */
  build(); renderSite(); applyStyle(); syncPanel(); renderList(); histUi();
  if (G) {
    G.from('.intro > *', { y: 24, opacity: 0, duration: .8, stagger: .1, ease: 'expo.out' });
    G.from('#stage', { y: 40, opacity: 0, duration: .8, ease: 'expo.out', delay: .2 });
    G.from('#site > *', { y: 20, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out', delay: .5, clearProps: 'transform,opacity' });
  }
})();
