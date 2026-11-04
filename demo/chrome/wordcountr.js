/* WordCountr — Chrome extension page with a live browser simulator (Bazozo Studio).
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
    const { el, svgEl, G, reduced, toast } = H, pb = H.pop.body;
    const DRAFT = [
      'The office is not dead, but it has changed its job.',
      'For most of the last century, the office was where work happened because that was where the files, the phones and the people were. Today the files live in the cloud, the phones live in our pockets, and the people live wherever the rent is reasonable, which means the building has to earn its place on the calendar in a way that it never had to before.',
      'Teams that do this well treat office days as events. They plan the workshops, the planning sessions and the long lunches for those days, and they protect the remote days for deep, quiet work.',
      'The hard part is not the technology. It is trust. Managers who measured presence now have to measure outcomes, and that requires clearer goals, better writing and fewer meetings.',
      'Writing matters more than ever. A clear written update saves a meeting. A vague one creates three.',
      'None of this is finished. But the teams that write well, plan their time together and trust each other are already pulling ahead, and they are not going back.'
    ].join('\n\n');
    /* the writing app */
    const app = el('div', 'wc-app'), top = el('div', 'wc-top'); top.append(el('b', null, 'Draftboard'), el('span', 'wc-saved', 'Saved'), el('span', 'wc-share', 'Share'));
    const doc = el('div', 'wc-doc'), title = el('h1', 'wc-title', 'The office has a new job');
    const ed = el('div', 'wc-ed'); ed.setAttribute('contenteditable', 'plaintext-only'); ed.setAttribute('role', 'textbox'); ed.setAttribute('aria-multiline', 'true'); ed.setAttribute('aria-label', 'Draft text'); ed.spellcheck = false; ed.textContent = DRAFT;
    const review = el('div', 'wc-review'); review.hidden = true;
    doc.append(el('p', 'wc-meta', 'Essay draft · last edited just now'), title, ed, review); app.append(top, doc); page.append(app);

    /* analysis */
    const STOP = new Set('the a an and or but of to in on for with at by from as is are was were be been it its this that these those they them their we our you your i he she his her not no so than then there which who what when where why how all any can could would should will just more most very into about over also have has had do does did up out one each every way make made'.split(' '));
    const syl = w => { w = w.toLowerCase().replace(/[^a-z]/g, ''); if (w.length <= 3) return 1; w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, ''); const m = w.match(/[aeiouy]{1,2}/g); return m ? m.length : 1; };
    const sentencesOf = t => t.split(/(?<=[.!?])\s+|\n\s*\n/).map(s => s.trim()).filter(s => /[A-Za-z0-9]/.test(s));
    function analyze(t) {
      const words = t.match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) || [], W = words.length, sents = sentencesOf(t), S = Math.max(1, sents.length);
      const sy = words.reduce((a, w) => a + syl(w), 0), paras = t.split(/\n\s*\n/).filter(p => p.trim()).length;
      const ease = W ? 206.835 - 1.015 * (W / S) - 84.6 * (sy / W) : 0, grade = W ? .39 * (W / S) + 11.8 * (sy / W) - 15.59 : 0;
      const freq = new Map(); words.forEach(w => { const k = w.toLowerCase().replace(/[’']s$/, ''); if (k.length > 2 && !STOP.has(k) && !/^\d+$/.test(k)) freq.set(k, (freq.get(k) || 0) + 1); });
      const kw = [...freq].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 6);
      const long = sents.filter(s => (s.match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) || []).length > 25).length;
      return { W, chars: t.replace(/\n/g, '').length, nosp: t.replace(/\s/g, '').length, S: sents.length, paras, ease: Math.max(0, Math.min(100, ease)), grade: Math.max(0, grade), kw, long, avg: W / S, read: W / 238, speak: W / 150 };
    }
    const mins = m => m < 1 ? `${Math.max(1, Math.round(m * 60))} sec` : `${Math.floor(m)} min ${Math.round(m % 1 * 60)} sec`;
    const GR = e => e >= 70 ? ['A', 'Easy to read', '#2F6F4E'] : e >= 60 ? ['B', 'Plain English', '#5B8C3A'] : e >= 50 ? ['C', 'Fairly difficult', '#C08A1E'] : e >= 30 ? ['D', 'Difficult', '#E07A2E'] : ['E', 'Very difficult', '#C2412D'];

    /* popup */
    let goal = 300, scope = 'all', selText = '', shown = 0;
    const scopeSeg = el('div', 'wc-seg'); [['all', 'Whole draft'], ['sel', 'Selection']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.k = k; b.addEventListener('click', () => { if (k === 'sel' && !selText) { toast('Select some text in the draft first.'); return; } scope = k; run(); }); scopeSeg.append(b); });
    const R = 38, CIRC = 2 * Math.PI * R, ring = svgEl('svg', { viewBox: '0 0 96 96', class: 'wc-ring', role: 'img', 'aria-label': 'Progress to word goal' });
    ring.append(svgEl('circle', { cx: 48, cy: 48, r: R, fill: 'none', stroke: 'rgba(47,111,78,.12)', 'stroke-width': 8 }));
    const arc = svgEl('circle', { cx: 48, cy: 48, r: R, fill: 'none', stroke: '#2F6F4E', 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-dasharray': CIRC, 'stroke-dashoffset': CIRC, transform: 'rotate(-90 48 48)' }); ring.append(arc);
    const pct = svgEl('text', { x: 48, y: 53, 'text-anchor': 'middle', class: 'wc-pct' }); ring.append(pct);
    const hero = el('div', 'wc-hero'), num = el('b', 'wc-num', '0'), lbl = el('span', 'wc-lbl'), gsel = el('select', 'wc-goal'); gsel.setAttribute('aria-label', 'Word goal');
    [300, 600, 1000, 1500].forEach(v => { const o = el('option', null, `Goal ${v.toLocaleString('en-GB')} words`); o.value = String(v); o.selected = v === goal; gsel.append(o); });
    gsel.addEventListener('change', () => { goal = +gsel.value; run(); });
    const ht = el('div', 'wc-ht'); ht.append(num, lbl, gsel); hero.append(ring, ht);
    const grid = el('div', 'wc-grid'), gradeBox = el('div', 'wc-grade'), kwBox = el('div', 'wc-kw');
    const longT = el('button', 'wc-long'); longT.type = 'button'; longT.setAttribute('aria-pressed', 'false');
    const rep = el('button', 'btn pri wc-rep', 'Copy report'); rep.type = 'button';
    pb.append(scopeSeg, hero, grid, el('p', 'wc-l', 'Readability'), gradeBox, el('p', 'wc-l', 'Keyword density'), kwBox, longT, rep);
    let last = null;
    function run() {
      const t = scope === 'sel' && selText ? selText : ed.textContent, a = analyze(t); last = a;
      scopeSeg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === scope)));
      const from = shown; shown = a.W;
      if (G && !reduced && from !== a.W) { const o = { v: from }; G.to(o, { v: a.W, duration: .5, ease: 'power2.out', onUpdate: () => { num.textContent = Math.round(o.v).toLocaleString('en-GB'); } }); } else num.textContent = a.W.toLocaleString('en-GB');
      lbl.textContent = scope === 'sel' ? 'words selected' : 'words in the draft';
      const p = Math.min(1, a.W / goal); arc.setAttribute('stroke-dashoffset', String(CIRC * (1 - p))); arc.setAttribute('stroke', a.W >= goal ? '#E07A2E' : '#2F6F4E'); pct.textContent = Math.round(a.W / goal * 100) + '%';
      grid.replaceChildren();
      [['Characters', a.chars.toLocaleString('en-GB')], ['No spaces', a.nosp.toLocaleString('en-GB')], ['Sentences', a.S], ['Paragraphs', a.paras], ['Reading time', mins(a.read)], ['Speaking time', mins(a.speak)], ['Avg sentence', a.avg.toFixed(1) + ' words'], ['Long sentences', a.long]].forEach(([k, v]) => { const d = el('div'); d.append(el('span', null, k), el('b', null, String(v))); grid.append(d); });
      const [L, txt, col] = GR(a.ease); gradeBox.replaceChildren(); gradeBox.style.setProperty('--g', col);
      const badge = el('span', 'wc-gl', L), gt = el('div'); gt.append(el('b', null, txt), el('small', null, `Flesch ${a.ease.toFixed(0)} / 100 · US school grade ${a.grade.toFixed(1)}`)); const meter = el('span', 'wc-meter'), mi = el('i'); mi.style.width = a.ease + '%'; meter.append(mi); gt.append(meter); gradeBox.append(badge, gt);
      kwBox.replaceChildren(); if (!a.kw.length) kwBox.append(el('p', 'wc-empty', 'Not enough words yet.'));
      const mx = a.kw.length ? a.kw[0][1] : 1; a.kw.forEach(([w, n]) => { const r = el('div', 'wc-kr'), b = el('span', 'wc-kb'), f = el('i'); f.style.width = (n / mx * 100) + '%'; b.append(f); r.append(el('b', null, w), b, el('code', null, `${n}× · ${(n / Math.max(1, a.W) * 100).toFixed(1)}%`)); kwBox.append(r); });
      longT.textContent = review.hidden ? `Highlight ${a.long} long sentence${a.long === 1 ? '' : 's'} (25+ words)` : 'Back to editing';
      H.badge(a.W > 999 ? (a.W / 1000).toFixed(1) + 'k' : a.W);
    }
    let tmr = null; ed.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(run, 80); top.querySelector('.wc-saved').textContent = 'Saving…'; setTimeout(() => { top.querySelector('.wc-saved').textContent = 'Saved'; }, 700); });
    document.addEventListener('selectionchange', () => {
      const s = getSelection(); const inside = s.rangeCount && !s.isCollapsed && ed.contains(s.getRangeAt(0).commonAncestorContainer);
      const t = inside ? s.toString() : '';
      if (t.trim() && t !== selText) { selText = t; scope = 'sel'; run(); }
      else if (!t.trim() && selText && document.activeElement !== gsel) { selText = ''; scope = 'all'; run(); }
    });
    /* long-sentence review */
    longT.addEventListener('click', () => {
      if (review.hidden) {
        review.replaceChildren();
        ed.textContent.split(/\n\s*\n/).forEach(p => { const pe = el('p'); p.split(/(?<=[.!?])\s+/).forEach((s, i) => { const n = (s.match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) || []).length; const sp = el('span', n > 25 ? 'wc-ls' : n > 18 ? 'wc-ms' : null, (i ? ' ' : '') + s); if (n > 25) sp.title = `${n} words. Try splitting this one.`; pe.append(sp); }); review.append(pe); });
        ed.hidden = true; review.hidden = false; longT.setAttribute('aria-pressed', 'true');
        if (G && !reduced) G.from(review.querySelectorAll('.wc-ls'), { backgroundSize: '0% 100%', duration: .6, stagger: .15, ease: 'power2.out' });
      } else { ed.hidden = false; review.hidden = true; longT.setAttribute('aria-pressed', 'false'); }
      run();
    });
    rep.addEventListener('click', () => {
      const a = last; if (!a) return;
      const txt = `WordCountr report · ${title.textContent}\nWords: ${a.W} (goal ${goal})\nCharacters: ${a.chars} (${a.nosp} without spaces)\nSentences: ${a.S} · Paragraphs: ${a.paras}\nReading time: ${mins(a.read)} · Speaking time: ${mins(a.speak)}\nReadability: ${GR(a.ease)[0]} (${GR(a.ease)[1]}), Flesch ${a.ease.toFixed(0)}, grade ${a.grade.toFixed(1)}\nTop keywords: ${a.kw.map(([w, n]) => `${w} ${n}×`).join(', ')}`;
      try { navigator.clipboard.writeText(txt).catch(() => {}); } catch (_) {} toast('Report copied.');
    });
    run(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
