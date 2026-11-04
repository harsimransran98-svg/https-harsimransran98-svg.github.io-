/* QuoteCatcher — Chrome extension page with a live browser simulator (Bazozo Studio).
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
    const { el, G, reduced, toast } = H, pb = H.pop.body;
    const COL = { y: ['Key idea', '#FFF34D'], p: ['Disagree', '#FF5FD2'], g: ['Evidence', '#3DFF9A'], b: ['To research', '#4DD9FF'] };
    const SRC = 'https://longform.example/essays/attention';
    let fmtC = 'apa';
    const FMT = { apa: 'APA 7', mla: 'MLA 9', md: 'Markdown' };
    const cite = (x, f = fmtC) => f === 'apa' ? `“${x.text}” (Lindqvist, 2026)

Lindqvist, A. (2026, November 2). The attention economy is a design choice. Longform. ${SRC}` : f === 'mla' ? `“${x.text}” (Lindqvist).

Lindqvist, Amara. “The Attention Economy Is a Design Choice.” Longform, 2 Nov. 2026, longform.example/essays/attention.` : `> ${x.text}
>
> — Amara Lindqvist, [*${TITLE}*](${SRC})${x.note ? `

${x.note}` : ''}`;
    const TITLE = 'The attention economy is a design choice';
    /* the essay */
    const art = el('article', 'qc-art');
    art.append(el('p', 'qc-kick', 'Essay · Technology · 8 min'), el('h1', null, TITLE), el('p', 'qc-dek', 'Our feeds were not built to inform us. They were built to hold us. That was a decision, which means it can be undone.'));
    const by = el('div', 'qc-by'); by.append(el('i'), el('b', null, 'Amara Lindqvist'), el('span', null, '2 November 2026')); art.append(by);
    const BODY = [
      ['p', 'Every product that runs on advertising has the same quiet goal: more minutes. Not better minutes, not more useful ones, just more. Once a team is measured by time spent, every design choice bends toward keeping you there.'],
      ['p', 'The infinite scroll is the clearest example. A page that never ends removes the natural moment where you might decide you are done. The choice to stop is taken away, and with it, a small piece of attention you never get back.'],
      ['h2', 'Attention is not infinite'],
      ['p', 'Researchers who study focus keep finding the same thing. After an interruption, it takes most people more than twenty minutes to return fully to the task they left. A dozen notifications a morning is not a dozen small costs. It is the whole morning.'],
      ['q', 'The scarce resource of our time is not information. It is the attention needed to make sense of it.'],
      ['p', 'This is why the debate about screen time often misses the point. Hours are a crude measure. What matters is whether the time was chosen, and whether you came away with something worth keeping.'],
      ['h2', 'Designing for the exit'],
      ['p', 'A few teams are trying the opposite approach. They add clear endings, daily digests instead of live feeds, and summaries that let you leave early with what you came for. Their engagement numbers go down. Their retention, oddly, goes up.'],
      ['p', 'People return to tools that respect them. A product you can finish is a product you can trust, and trust compounds in a way that compulsion never does.'],
      ['p', 'None of this needs new technology. It needs a different number on the dashboard. Measure whether people got what they needed, and the design will follow the metric, the way it always has.']
    ];
    BODY.forEach(([k, t]) => art.append(k === 'h2' ? el('h2', null, t) : k === 'q' ? el('blockquote', null, t) : el('p', 'qc-p', t)));
    art.append(el('p', 'qc-end', '— Filed under design ethics, product, focus.'));
    page.append(art);
    const tip = el('div', 'qc-tip'); tip.hidden = true; tip.setAttribute('role', 'toolbar'); tip.setAttribute('aria-label', 'Catch this quote');
    Object.entries(COL).forEach(([k, [n, c]]) => { const b = el('button', 'qc-dot'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', `Highlight as ${n}`); b.title = n; b.addEventListener('click', () => catchIt(k)); tip.append(b); });
    const cbtn = el('button', 'qc-catch', 'Catch'); cbtn.type = 'button'; cbtn.addEventListener('click', () => catchIt('y')); tip.append(cbtn);
    tip.addEventListener('mousedown', e => e.preventDefault()); page.append(tip);

    let quotes = [], uid = 0, pending = null, filter = 'all', q = '';
    const section = node => { let n = node; while (n && n !== art) { let s = n.previousElementSibling; while (s) { if (s.tagName === 'H2') return s.textContent; s = s.previousElementSibling; } n = n.parentElement; } return 'Introduction'; };
    const block = n => { const e = n.nodeType === 1 ? n : n.parentElement; return e && e.closest('.qc-art p, .qc-art blockquote, .qc-art h1, .qc-art h2'); };
    function onSel() {
      const s = getSelection(); if (!s.rangeCount || s.isCollapsed) { tip.hidden = true; pending = null; return; }
      const r = s.getRangeAt(0); if (!page.contains(r.commonAncestorContainer)) return;
      const b = block(r.commonAncestorContainer), text = s.toString().replace(/\s+/g, ' ').trim();
      if (!b || text.length < 3) { tip.hidden = true; pending = null; return; }
      if ([...b.querySelectorAll('.qc-m')].some(m => r.intersectsNode(m))) { tip.hidden = true; pending = null; return; }
      pending = { range: r.cloneRange(), block: b, text };
      const pr = page.getBoundingClientRect(), rr = r.getBoundingClientRect();
      tip.hidden = false;
      const x = Math.min(Math.max(8, rr.left - pr.left + rr.width / 2 - tip.offsetWidth / 2), page.clientWidth - tip.offsetWidth - 8);
      tip.style.left = x + 'px'; tip.style.top = (rr.top - pr.top + page.scrollTop - tip.offsetHeight - 10) + 'px';
      if (G && !reduced) G.fromTo(tip, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: .25, ease: 'back.out(2)' });
    }
    page.addEventListener('click', e => {
      const s = getSelection(); if (s.rangeCount && !s.isCollapsed) return;
      if (!e.target.closest('.qc-p, .qc-art blockquote') || e.target.closest('.qc-m, .qc-tip')) return;
      const cp = document.caretRangeFromPoint ? document.caretRangeFromPoint(e.clientX, e.clientY) : null; if (!cp || cp.startContainer.nodeType !== 3) return;
      const n = cp.startContainer, o = cp.startOffset, re = /[^.!?]+[.!?]+[”"’]?/g; let m;
      while ((m = re.exec(n.data))) { if (o >= m.index && o <= m.index + m[0].length) { const lead = m[0].length - m[0].trimStart().length, r = document.createRange(); r.setStart(n, m.index + lead); r.setEnd(n, m.index + m[0].length); s.removeAllRanges(); s.addRange(r); return; } }
    });
    let selT = null; document.addEventListener('selectionchange', () => { clearTimeout(selT); selT = setTimeout(onSel, 120); });
    function wrap(range, k, id) { const m = el('mark', 'qc-m c-' + k); m.dataset.q = String(id); m.append(range.extractContents()); range.insertNode(m); return m; }
    function catchIt(k) {
      if (!pending) { toast('Select some text in the essay first.'); return; }
      const { range, block: b, text } = pending; let m; const id = ++uid;
      try { m = wrap(range, k, id); } catch (_) { toast('Select text inside one paragraph.'); return; }
      try { getSelection().removeAllRanges(); } catch (_) {}
      tip.hidden = true; pending = null;
      quotes.unshift({ id, text, k, note: '', sec: section(b), at: Date.now() });
      if (G && !reduced) G.fromTo(m, { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: .5, ease: 'power2.out' });
      H.flyToIcon(m, COL[k][1]); if (!H.pop.isOpen()) H.pop.open(); render(true);
      toast(`Caught as “${COL[k][0]}”.`);
    }
    function find(id) { return page.querySelector(`mark[data-q="${id}"]`); }
    function remove(x) { const m = find(x.id); if (m) { const p = m.parentNode; m.replaceWith(...m.childNodes); p.normalize(); } quotes = quotes.filter(y => y !== x); render(); }
    function jump(x) {
      const m = find(x.id); if (!m) return;
      const top = page.scrollTop + m.getBoundingClientRect().top - page.getBoundingClientRect().top - page.clientHeight / 3;
      page.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      if (G && !reduced) G.fromTo(m, { boxShadow: `0 0 0 6px ${COL[x.k][1]}` }, { boxShadow: '0 0 0 0px rgba(0,0,0,0)', duration: 1.2, delay: .35, ease: 'power2.out', clearProps: 'boxShadow' });
    }
    const md = list => `# ${TITLE}\nAmara Lindqvist · longform.example/essays/attention\n\n` + list.map(x => `> ${x.text}\n\n— *${COL[x.k][0]}* · ${x.sec}${x.note ? `\n\nNote: ${x.note}` : ''}`).join('\n\n---\n\n');
    const copy = (t, msg) => { try { navigator.clipboard.writeText(t).catch(() => {}); } catch (_) {} toast(msg); };

    /* side panel library */
    const head = el('div', 'qc-head'), search = el('input', 'qc-q'); search.type = 'search'; search.placeholder = 'Search your quotes…'; search.maxLength = 60; search.setAttribute('aria-label', 'Search quotes');
    search.addEventListener('input', () => { q = search.value.toLowerCase(); render(); }); head.append(search);
    const chips = el('div', 'qc-chips'), list = el('div', 'qc-list'), foot = el('div', 'qc-foot');
    const exp = el('button', 'btn pri qc-exp'); exp.type = 'button';
    const NN = '\n\n';
    const allOut = () => fmtC === 'md' ? md(quotes) : `${fmtC === 'apa' ? 'Quotes' : 'Quotations'} · ${FMT[fmtC]}` + NN + quotes.map(x => cite(x).split(NN)[0] + (x.note ? '\nNote: ' + x.note : '')).join(NN) + NN + (fmtC === 'apa' ? 'Reference' : 'Works Cited') + '\n' + cite(quotes[0]).split(NN)[1];
    exp.addEventListener('click', () => { if (!quotes.length) { toast('Nothing to export yet.'); return; } copy(allOut(), `${quotes.length} quotes copied as ${FMT[fmtC]}.`); prev.textContent = allOut(); prev.hidden = false; });
    const fseg = el('div', 'qc-fmt'); Object.entries(FMT).forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.k = k; b.addEventListener('click', () => { fmtC = k; prev.hidden = true; render(); }); fseg.append(b); });
    const prev = el('pre', 'qc-md'); prev.hidden = true; foot.append(exp, prev);
    pb.append(head, fseg, chips, list, foot);
    const ago = t => { const s = Math.round((Date.now() - t) / 1000); return s < 60 ? 'just now' : s < 3600 ? Math.round(s / 60) + ' min ago' : Math.round(s / 3600) + ' h ago'; };
    function render(anim) {
      fseg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === fmtC))); exp.textContent = `Copy all as ${FMT[fmtC]}`;
      chips.replaceChildren();
      [['all', `All · ${quotes.length}`, null], ...Object.entries(COL).map(([k, [n, c]]) => [k, `${n} · ${quotes.filter(x => x.k === k).length}`, c])].forEach(([k, t, c]) => {
        const b = el('button', 'qc-chip', t); b.type = 'button'; b.setAttribute('aria-pressed', String(filter === k)); if (c) b.style.setProperty('--c', c);
        b.addEventListener('click', () => { filter = k; render(true); }); chips.append(b);
      });
      list.replaceChildren();
      const L = quotes.filter(x => (filter === 'all' || x.k === filter) && (!q || (x.text + ' ' + x.note + ' ' + x.sec).toLowerCase().includes(q)));
      if (!L.length) list.append(el('p', 'qc-empty', quotes.length ? 'Nothing matches.' : 'Select text on the page to catch your first quote.'));
      L.forEach(x => {
        const c = el('article', 'qc-card'); c.style.setProperty('--c', COL[x.k][1]);
        c.append(el('blockquote', 'qc-t', `“${x.text}”`), el('small', 'qc-meta', `${COL[x.k][0]} · § ${x.sec} · ${ago(x.at)}`));
        const note = el('textarea', 'qc-note'); note.rows = 2; note.maxLength = 280; note.placeholder = 'Add a note…'; note.value = x.note; note.setAttribute('aria-label', 'Note for this quote'); note.hidden = !x.note && !x.open;
        note.addEventListener('input', () => { x.note = note.value; });
        const acts = el('div', 'qc-acts');
        const mk = (t, fn, lbl) => { const b = el('button', null, t); b.type = 'button'; if (lbl) b.setAttribute('aria-label', lbl); b.addEventListener('click', fn); acts.append(b); return b; };
        mk('↗ Jump', () => jump(x), 'Jump to this quote on the page');
        mk('✎ Note', () => { x.open = true; note.hidden = false; note.focus(); }, 'Add a note');
        mk('⧉ Cite', () => copy(cite(x), `Copied as ${FMT[fmtC]}.`), 'Copy citation');
        mk('✕', () => remove(x), 'Delete quote').classList.add('qc-del');
        const ci = el('pre', 'qc-cite', cite(x)); c.append(ci, note, acts); list.append(c);
      });
      if (anim && G && !reduced && list.firstChild) G.from(list.firstChild, { x: 24, opacity: 0, duration: .4, ease: 'back.out(1.6)' });
      H.badge(quotes.length || '');
    }
    /* seed two quotes so the library is never empty on first look */
    function seed(phrase, k) {
      const w = document.createTreeWalker(art, NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { const i = n.data.indexOf(phrase); if (i < 0) continue; const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + phrase.length); const id = ++uid; wrap(r, k, id); quotes.unshift({ id, text: phrase, k, note: k === 'g' ? 'Find the original study for the newsletter.' : '', sec: section(n.parentElement), at: Date.now() - (k === 'y' ? 3 : 40) * 60000 }); return; }
    }
    seed('it takes most people more than twenty minutes to return fully to the task they left', 'g');
    seed('A product you can finish is a product you can trust', 'y');
    quotes.sort((a, b) => b.at - a.at);
    document.addEventListener('keydown', e => { if (e.altKey && e.code === 'KeyQ' && pending) { e.preventDefault(); catchIt('y'); } });
    H.pop.onToggle(o => { page.classList.toggle('qc-split', o); if (!o) tip.hidden = true; });
    render(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
