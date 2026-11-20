/* ClipToNotes — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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
    if (window.ScrollTrigger) G.from('.cx', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.cx', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };
  /* ---------- Safari toolbar popup ---------- */
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


/* ---------- ClipToNotes simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"site":{"name":"The Civic","kick":"Climate · 6 min read","h1":"How cities are cooling their streets","dek":"From white roofs to tiny forests, the cheapest heat fixes are often the oldest ones.","by":"By Lena Ortiz"},"paras":["On the hottest afternoons, a dark asphalt road can reach 60°C, while a shaded street a block away stays more than 20 degrees cooler. That gap is where most of the new heat plans begin.","Paris has opened 300 schoolyards as “oasis courtyards”, swapping tarmac for trees, soil and water fountains. The yards are open to neighbours at weekends, turning them into cool spots for the whole district.","In Los Angeles, a reflective coating on 50 streets lowered surface temperatures by around 6°C. The paint costs less than resurfacing and lasts about seven years.","Planners say the cheapest measure of all is still the tree. A mature canopy shades, cools the air through evaporation and soaks up rain, and it gets better every year it grows."],"notes":[{"n":"Heat plan research","f":"Work","body":"Ideas for the council briefing."},{"n":"Reading list","f":"Notes","body":"Long reads to finish this week."}],"key":"ctn_state_v1","host":"thecivic.example","title":"How cities are cooling their streets"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const str = (v, n) => typeof v === 'string' ? v.slice(0, n) : '';
    const saved = store.get(M.key, null) || {};
    const S = { dest: saved.dest === 'new' ? 'new' : 'append', target: Number.isInteger(saved.target) ? saved.target : 0, style: saved.style === 'plain' ? 'plain' : 'quote', link: saved.link !== false };
    let notes = Array.isArray(saved.notes) ? saved.notes.filter(n => n && typeof n.n === 'string').slice(0, 12).map(n => ({ n: str(n.n, 60), f: str(n.f, 20) || 'Notes', body: str(n.body, 200), clips: Array.isArray(n.clips) ? n.clips.filter(c => c && typeof c.t === 'string').slice(0, 30).map(c => ({ t: str(c.t, 600), src: str(c.src, 80), style: c.style === 'plain' ? 'plain' : 'quote', at: str(c.at, 20) })) : [] })) : [];
    if (!notes.length) notes = M.notes.map(n => ({ ...n, clips: [] }));
    if (S.target >= notes.length) S.target = 0;
    const save = () => store.set(M.key, { ...S, notes });
    let shown = S.target, lastNew = null;
    const hl = (window.CSS && CSS.highlights && window.Highlight) ? new Highlight() : null; if (hl) CSS.highlights.set('ctn', hl);
    const NS = 'http://www.w3.org/2000/svg';
    const clipIc = () => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2'); s.setAttribute('aria-hidden', 'true'); ['M6 3h9l4 4v14H6z', 'M9 12h7M9 16h5'].forEach(d => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); s.append(p); }); return s; };

    /* ---- article ---- */
    const site = el('div', 'cn-site'), top = el('div', 'cn-top'), art = el('article', 'cn-art');
    top.append(document.createTextNode(M.site.name), el('span', null, 'Climate · Cities · Ideas'));
    art.append(el('p', 'cn-kick', M.site.kick), el('h1', null, M.site.h1), el('p', 'cn-dek', M.site.dek), el('p', 'cn-by', M.site.by));
    const P = M.paras.map((t, i) => { const p = el('p', 'cn-p', t), b = btn('cn-cb'); b.append(clipIc()); b.setAttribute('aria-label', 'Clip paragraph ' + (i + 1) + ' to Notes');
      b.addEventListener('click', e => { e.stopPropagation(); const r = document.createRange(); r.selectNodeContents(p.firstChild); clip(t, r, b); p.classList.add('clipped'); }); p.append(b); art.append(p); return p; });
    const pill = btn('cn-pill'); pill.hidden = true; pill.append(el('i'), document.createTextNode('Clip to Notes'));
    site.append(top, art, pill); page.append(site);

    /* ---- selection -> pill ---- */
    let selRange = null;
    function onSel() {
      const sel = window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) { pill.hidden = true; selRange = null; return; }
      const r = sel.getRangeAt(0); if (!art.contains(r.commonAncestorContainer)) { pill.hidden = true; return; }
      const text = sel.toString().replace(/\s+/g, ' ').trim(); if (text.length < 3) { pill.hidden = true; return; }
      selRange = r.cloneRange(); const rr = r.getBoundingClientRect(), o = site.getBoundingClientRect();
      pill.style.left = Math.max(80, Math.min(site.clientWidth - 80, rr.left - o.left + rr.width / 2)) + 'px'; pill.style.top = (rr.top - o.top - 10) + 'px';
      if (pill.hidden) { pill.hidden = false; if (G && !reduced) G.fromTo(pill, { scale: .7, opacity: 0 }, { scale: 1, opacity: 1, duration: .35, ease: 'back.out(2.2)' }); }
    }
    site.addEventListener('pointerup', () => setTimeout(onSel, 10)); site.addEventListener('keyup', onSel);
    pill.addEventListener('pointerdown', e => e.preventDefault());
    pill.addEventListener('click', () => { if (!selRange) return; const t = selRange.toString().replace(/\s+/g, ' ').trim().slice(0, 600); clip(t, selRange, pill); window.getSelection().removeAllRanges(); pill.hidden = true; });

    /* ---- clipping ---- */
    function clip(text, range, from) {
      const c = { t: text, src: M.host, style: S.style, at: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) };
      let note;
      if (S.dest === 'new') { note = { n: M.title, f: 'Web Clips', body: 'Clipped from Safari.', clips: [] }; notes.unshift(note); S.target = 0; }
      else note = notes[S.target];
      note.clips.push(c); lastNew = c; shown = notes.indexOf(note); S.dest = S.dest === 'new' ? 'append' : S.dest; save();
      if (hl && range) { try { hl.add(range.cloneRange()); } catch (_) {} }
      H.flyToIcon(from, '#FFD43B'); H.tone(740, .06); setTimeout(() => H.tone(988, .08), 90);
      toast('Clipped to “' + note.n + '”'); renderPop(); if (!win.hidden) renderWin();
    }

    /* ---- Notes window ---- */
    const win = el('div', 'cn-win'); win.hidden = true; win.setAttribute('role', 'dialog'); win.setAttribute('aria-label', 'Notes');
    const wt = el('div', 'cn-wt'), wx = btn(''); wx.setAttribute('aria-label', 'Close Notes'); wx.addEventListener('click', () => { win.hidden = true; H.pop.open(); });
    wt.append(wx, el('i'), el('i'), document.createTextNode('Notes'));
    const wb = el('div', 'cn-wb'), fold = el('div', 'cn-fold'), list = el('div', 'cn-list'), body = el('div', 'cn-note'); wb.append(fold, list, body); win.append(wt, wb); page.parentElement.append(win);
    function renderWin() {
      fold.textContent = ''; fold.append(el('small', null, 'iCloud'));
      const counts = {}; notes.forEach(n => { counts[n.f] = (counts[n.f] || 0) + 1; }); const cur = notes[shown] || notes[0];
      Object.entries(counts).forEach(([f, n]) => { const d = el('div', cur && cur.f === f ? 'on' : ''); d.append(document.createTextNode(f), el('span', null, String(n))); fold.append(d); });
      list.textContent = ''; notes.forEach((n, i) => { const b = btn(i === shown ? 'on' : ''); const last = n.clips.length ? n.clips[n.clips.length - 1].t : n.body; b.append(el('b', null, n.n), el('small', null, last)); b.addEventListener('click', () => { shown = i; renderWin(); }); list.append(b); });
      body.textContent = ''; if (!cur) return;
      body.append(el('h2', null, cur.n), el('p', 'meta', cur.f + ' · ' + cur.clips.length + ' clips'), el('p', 'plain', cur.body));
      cur.clips.forEach(c => { const q = el(c.style === 'quote' ? 'blockquote' : 'p', c.style === 'quote' ? '' : 'plain', c.t); if (c === lastNew) q.classList.add('new'); body.append(q); if (S.link) body.append(el('p', 'src', '— ' + c.src + ' · ' + c.at)); });
    }
    function openWin() { H.pop.close(); renderWin(); win.hidden = false; if (G && !reduced) G.fromTo(win, { scale: .94, opacity: 0, y: 14 }, { scale: 1, opacity: 1, y: 0, duration: .45, ease: 'back.out(1.6)' }); wx.focus(); }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !win.hidden) { win.hidden = true; H.pop.open(); } });

    /* ---- popover ---- */
    const PP = el('div', 'pc');
    const d1 = el('div'), seg = el('div', 'pc-seg'); [['new', 'New note'], ['append', 'Append to note']].forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => { S.dest = k; save(); renderPop(); }); seg.append(b); }); d1.append(label('Send clips to'), seg);
    const d2 = el('div'), nl = el('div', 'cn-notes'); d2.append(label('Note'), nl);
    const d3 = el('div'), seg2 = el('div', 'pc-seg'); [['quote', 'Quote'], ['plain', 'Plain text']].forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => { S.style = k; save(); renderPop(); }); seg2.append(b); }); d3.append(label('Style'), seg2);
    const lk = swBtn('Include the source link', null, true); lk.addEventListener('click', () => { S.link = !S.link; save(); renderPop(); });
    const d4 = el('div'), rec = el('div', 'cn-rec'), cnt = el('output'); d4.append(label('Recent clips', cnt), rec);
    const open = btn('cn-open', 'Open in Notes'); open.addEventListener('click', openWin);
    PP.append(d1, d2, d3, lk, d4, open); pb.append(PP);
    function renderPop() {
      seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.dest))); seg2.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.style)));
      lk.setAttribute('aria-checked', String(S.link)); d2.hidden = S.dest !== 'append';
      nl.textContent = ''; notes.slice(0, 4).forEach((n, i) => { const b = btn(''); b.setAttribute('aria-pressed', String(i === S.target)); b.append(el('i'), el('span', null, n.n), el('small', null, n.clips.length + ' clips')); b.addEventListener('click', () => { S.target = i; save(); renderPop(); }); nl.append(b); });
      const all = []; notes.forEach(n => n.clips.forEach(c => all.push([n, c]))); cnt.textContent = String(all.length); H.badge(all.length || '');
      rec.textContent = ''; all.slice(-3).reverse().forEach(([n, c]) => { const d = el('div'); d.append(el('b', null, n.n), el('span', null, c.t)); rec.append(d); });
      if (!all.length) rec.append(el('p', 'pc-empty', 'Select text in the article to make your first clip.'));
    }
    renderPop();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
