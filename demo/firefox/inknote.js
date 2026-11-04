/* InkNote — Firefox add-on page with a live browser simulator (Bazozo Studio).
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
    const COL = { idea: ['Idea', '#FFE066'], question: ['Question', '#FF9EB5'], todo: ['To-do', '#9BE7C4'], ref: ['Reference', '#A9CCFF'] };
    const KEY = 'in_notes_calm';
    const SEED = [
      { x: 470, y: 150, c: 'idea', t: 'Use this line as the pull quote on the landing page.', min: false },
      { x: 24, y: 560, c: 'question', t: 'Does “ambient” status work for screen-reader users too?', min: false },
      { x: 420, y: 930, c: 'todo', t: 'Audit our app’s notifications against these three rules.', min: true }
    ];
    let notes = store.get(KEY, null); if (!Array.isArray(notes)) notes = SEED.map((n, i) => ({ ...n, id: i + 1 }));
    let uid = Math.max(0, ...notes.map(n => n.id)) + 1, mode = false, cur = 'idea', hidden = false, filter = 'all', confirmClear = false;
    const save = () => { try { store.set(KEY, notes.map(({ el: _e, ...n }) => n)); } catch (_) {} };

    /* the article */
    const site = el('div', 'in-site'), top = el('header', 'in-top'); top.append(el('b', null, 'UX Journal'), el('span', null, 'Essays · Patterns · Talks'));
    const art = el('article', 'in-art');
    art.append(el('p', 'in-kick', 'Essay · 7 min read'), el('h1', null, 'Designing calm interfaces'), el('p', 'in-dek', 'The best tools ask for our attention only when they truly need it. Here is how to build them.'));
    [['p', 'Most software is loud by default. Badges, banners, sounds and red dots all compete for the same small pool of attention, and each one assumes it deserves to win.'],
     ['q', 'Calm technology informs without demanding. It lives at the edge of attention and moves to the centre only when it must.'],
     ['h2', 'Rule one: prefer the periphery'], ['p', 'A soft colour change in a status bar can carry as much information as a pop-up, without stopping the person mid-sentence. Reserve interruptions for things that cannot wait.'],
     ['h2', 'Rule two: let silence mean “all is well”'], ['p', 'When nothing needs attention, show nothing. People learn to trust a quiet interface, and that trust is what makes the rare alert land.'],
     ['p', 'The opposite is a dashboard where every number glows. When everything is highlighted, nothing is.'],
     ['h2', 'Rule three: make it easy to leave'], ['p', 'A calm product has a clear end. Daily summaries, finished queues and “you’re all caught up” messages give people permission to close the tab.'],
     ['p', 'None of this means hiding information. It means choosing the right volume for each piece of it, and keeping most things at a whisper.']
    ].forEach(([k, t]) => art.append(k === 'h2' ? el('h2', null, t) : k === 'q' ? el('blockquote', null, t) : el('p', 'in-p', t)));
    const banner = el('div', 'in-banner', 'Note mode · click anywhere on the page to pin a note · Esc to stop'); banner.hidden = true;
    site.append(top, art); page.append(banner, site);

    /* notes on the page */
    function mount(n, fresh) {
      const d = el('div', 'in-note' + (n.min ? ' min' : '')); d.style.left = Math.min(n.x, Math.max(0, art.clientWidth - 176)) + 'px'; d.style.top = n.y + 'px'; d.style.setProperty('--nc', COL[n.c][1]); d.dataset.id = String(n.id);
      const hd = el('div', 'in-nh'); hd.setAttribute('aria-label', 'Drag to move note');
      const dots = el('span', 'in-dots'); Object.entries(COL).forEach(([k, [nm, c]]) => { const b = el('button'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', `Colour: ${nm}`); b.addEventListener('click', e => { e.stopPropagation(); n.c = k; d.style.setProperty('--nc', c); save(); renderPop(); }); dots.append(b); });
      const mn = el('button', 'in-mn', '–'), x = el('button', 'in-x', '×'); mn.type = x.type = 'button'; mn.setAttribute('aria-label', 'Fold note'); x.setAttribute('aria-label', 'Delete note');
      mn.addEventListener('click', e => { e.stopPropagation(); n.min = !n.min; d.classList.toggle('min', n.min); save(); });
      x.addEventListener('click', e => { e.stopPropagation(); const go = () => { d.remove(); notes = notes.filter(y => y !== n); save(); renderPop(); }; if (G && !reduced) G.to(d, { scale: .4, opacity: 0, rotate: -12, duration: .3, ease: 'back.in(2)', onComplete: go }); else go(); });
      hd.append(dots, mn, x);
      const pin = el('button', 'in-pin', String(notes.indexOf(n) + 1)); pin.type = 'button'; pin.setAttribute('aria-label', 'Unfold note'); pin.addEventListener('click', e => { e.stopPropagation(); n.min = false; d.classList.remove('min'); save(); });
      const ta = el('textarea'); ta.value = n.t; ta.rows = 4; ta.maxLength = 400; ta.placeholder = 'Write a note…'; ta.setAttribute('aria-label', 'Note text'); ta.addEventListener('input', () => { n.t = ta.value; save(); renderPop(); });
      const ft = el('small', 'in-co'); const coord = () => { ft.textContent = `${COL[n.c][0]} · x ${Math.round(n.x)} · y ${Math.round(n.y)}`; }; coord();
      d.append(pin, hd, ta, ft); art.append(d); n.el = d; n.coord = coord;
      /* drag */
      let s = null;
      hd.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; e.preventDefault(); hd.setPointerCapture(e.pointerId); s = { x: e.clientX, y: e.clientY, nx: n.x, ny: n.y }; d.classList.add('drag'); });
      hd.addEventListener('pointermove', e => { if (!s) return; n.x = Math.max(0, Math.min(art.clientWidth - 60, s.nx + e.clientX - s.x)); n.y = Math.max(0, Math.min(art.scrollHeight - 40, s.ny + e.clientY - s.y)); d.style.left = n.x + 'px'; d.style.top = n.y + 'px'; coord(); });
      const end = () => { if (!s) return; s = null; d.classList.remove('drag'); save(); renderPop(); }; hd.addEventListener('pointerup', end); hd.addEventListener('pointercancel', end);
      if (fresh && G && !reduced) G.from(d, { scale: .3, opacity: 0, rotate: 8, duration: .45, ease: 'back.out(2.2)', transformOrigin: '0 0' });
      if (fresh) setTimeout(() => ta.focus(), 50);
    }
    art.addEventListener('click', e => {
      if (!mode || e.target.closest('.in-note')) return;
      const r = art.getBoundingClientRect(), n = { id: uid++, x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top), c: cur, t: '', min: false };
      n.x = Math.min(n.x, art.clientWidth - 200); notes.push(n); mount(n, true); save(); renderPop();
      try { H.tone(720, .07, 'triangle', .04); } catch (_) {}
    });
    function setMode(v) { mode = v; site.classList.toggle('in-mode', v); banner.hidden = !v; renderPop(); if (v) { if (hidden) { hidden = false; site.classList.remove('in-hide'); } toast('Note mode on. Click anywhere on the article to pin a note.'); } }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && mode) setMode(false); if (e.altKey && e.shiftKey && e.code === 'KeyN') { e.preventDefault(); setMode(!mode); } });
    function jump(n) {
      if (hidden) { hidden = false; site.classList.remove('in-hide'); }
      const pr = page.getBoundingClientRect(), r = n.el.getBoundingClientRect(); page.scrollTo({ top: page.scrollTop + r.top - pr.top - 80, behavior: reduced ? 'auto' : 'smooth' });
      if (G && !reduced) G.fromTo(n.el, { rotate: -4 }, { rotate: 0, duration: .8, ease: 'elastic.out(1.2,.3)', delay: .3, clearProps: 'rotate' });
    }

    /* popup */
    const sw = el('button', 'in-sw'); sw.type = 'button'; sw.setAttribute('role', 'switch'); const swt = el('div'); swt.append(el('b', null, 'Note mode'), el('small', null, 'Click the page to pin a note')); const knob = el('i'); sw.append(swt, knob);
    sw.addEventListener('click', () => setMode(!mode));
    const colRow = el('div', 'in-cols'); Object.entries(COL).forEach(([k, [n, c]]) => { const b = el('button'); b.type = 'button'; b.dataset.k = k; b.style.setProperty('--nc', c); b.append(el('i'), document.createTextNode(n)); b.addEventListener('click', () => { cur = k; renderPop(); }); colRow.append(b); });
    const fil = el('div', 'in-fil'), list = el('div', 'in-list'), acts = el('div', 'in-acts');
    const hideB = el('button', null, 'Hide notes'), md = el('button', null, 'Copy Markdown'), clr = el('button', 'warn', 'Clear all'); [hideB, md, clr].forEach(b => { b.type = 'button'; acts.append(b); });
    pb.append(sw, el('p', 'in-l', 'New note colour'), colRow, el('p', 'in-l', 'Notes on this page'), fil, list, acts);
    hideB.addEventListener('click', () => { hidden = !hidden; site.classList.toggle('in-hide', hidden); renderPop(); });
    md.addEventListener('click', () => { const t = `## Notes · Designing calm interfaces\nuxjournal.example/calm-interfaces\n\n` + notes.map(n => `- **${COL[n.c][0]}** (x ${n.x}, y ${n.y}): ${n.t || '(empty)'}`).join('\n'); try { navigator.clipboard.writeText(t).catch(() => {}); } catch (_) {} toast(`${notes.length} notes copied as Markdown.`); });
    clr.addEventListener('click', () => { if (!confirmClear) { confirmClear = true; clr.textContent = 'Click again to clear'; setTimeout(() => { confirmClear = false; clr.textContent = 'Clear all'; }, 2500); return; } notes.forEach(n => n.el && n.el.remove()); notes = []; save(); confirmClear = false; clr.textContent = 'Clear all'; renderPop(); toast('All notes removed from this page.'); });
    function renderPop() {
      sw.setAttribute('aria-checked', String(mode)); colRow.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === cur)));
      fil.replaceChildren(); [['all', 'All', null], ...Object.entries(COL).map(([k, [n, c]]) => [k, n, c])].forEach(([k, n, c]) => { const cnt = k === 'all' ? notes.length : notes.filter(x => x.c === k).length; const b = el('button', null, `${n} ${cnt}`); b.type = 'button'; if (c) b.style.setProperty('--nc', c); b.setAttribute('aria-pressed', String(filter === k)); b.addEventListener('click', () => { filter = k; renderPop(); }); fil.append(b); });
      list.replaceChildren(); const L = notes.filter(n => filter === 'all' || n.c === filter);
      if (!L.length) list.append(el('p', 'in-empty', notes.length ? 'No notes in this colour.' : 'No notes yet. Turn on Note mode and click the page.'));
      L.forEach(n => { const b = el('button', 'in-li'); b.type = 'button'; b.style.setProperty('--nc', COL[n.c][1]); b.append(el('i'), el('span', null, n.t || 'Empty note'), el('small', null, `x ${n.x} · y ${n.y}`)); b.addEventListener('click', () => jump(n)); list.append(b); });
      hideB.textContent = hidden ? 'Show notes' : 'Hide notes'; H.badge(notes.length || '');
    }
    notes.forEach(n => mount(n, false)); renderPop(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
