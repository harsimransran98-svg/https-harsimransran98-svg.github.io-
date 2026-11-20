/* PastePlain — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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


/* ---------- PastePlain simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"key":"pp_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const saved = store.get(M.key, null) || {};
    const S = { on: saved.on !== false, mode: ['plain', 'basic', 'md'].includes(saved.mode) ? saved.mode : 'plain', quotes: saved.quotes !== false, track: saved.track !== false, inv: saved.inv !== false, ws: saved.ws !== false };
    const save = () => store.set(M.key, S);
    let last = null, cleaned = 0;
    const ZW = '\u200B', NB = '\u00A0';

    /* ---- the messy newsletter (our own DOM) ---- */
    const site = el('div', 'pp-site'), src = el('section', 'pp-src'), dst = el('section', 'pp-dst');
    src.setAttribute('aria-label', 'Newsletter you can copy from');
    const block = (node, name) => { const b = el('div', 'pp-blk'), c = btn('pp-cp', 'Copy'); c.setAttribute('aria-label', 'Copy ' + name); c.addEventListener('click', () => copyNode(node)); b.append(node, c); src.append(b); return node; };
    const h = el('h2', 'pp-big', '🌸 Spring Sale: 40%' + NB + 'off EVERYTHING!!'); block(h, 'heading');
    const p1 = el('p', 'pp-p'); const lnk = el('a', 'pp-lnk', 'Shop the sale'); lnk.href = 'https://hearthhome.example/sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring26&fbclid=IwAR3xZq&ref=hdr'; lnk.addEventListener('click', e => e.preventDefault());
    p1.append(document.createTextNode('Our “biggest event of the year” starts ' + ZW + 'today. '), el('span', 'pp-hl', 'Every candle, throw and mug'), document.createTextNode(' is reduced, and members get ' + ZW + 'free delivery.' + NB + NB + ' '), el('span', 'pp-red', 'Hurry!'), document.createTextNode(' '), lnk, document.createTextNode('.')); block(p1, 'paragraph');
    const p2 = el('p', 'pp-p'), it = el('em', 'pp-it', 'it’s the cosiest week of the year'); const l2 = el('a', 'pp-lnk', 'gift guide'); l2.href = 'https://hearthhome.example/gifts?utm_source=newsletter&utm_campaign=spring26&mc_eid=8f2a'; l2.addEventListener('click', e => e.preventDefault());
    p2.append(document.createTextNode('As our founder says, ‘'), it, document.createTextNode('.’ Browse the '), l2, document.createTextNode(' for ideas under £20.')); block(p2, 'quote');
    const tbl = el('table', 'pp-tbl'), tr0 = el('tr'); ['Item', 'Was', 'Now'].forEach(t => tr0.append(el('th', null, t))); tbl.append(tr0);
    [['Linen throw', '£60', '£36'], ['Soy candle', '£18', '£10.80'], ['Stoneware mug', '£12', '£7.20']].forEach(r => { const tr = el('tr'); r.forEach(t => tr.append(el('td', null, t))); tbl.append(tr); }); block(tbl, 'price table');
    const ul = el('ul', 'pp-ul'); ['✨ Free returns for 60 days', '🚚 Next-day delivery' + NB + 'on orders over £40', '💳 Pay in three with no interest'].forEach(t => ul.append(el('li', null, t))); block(ul, 'list');
    const mail = el('div', 'pp-mail'), mh = el('div', 'pp-mh'); [['To', 'sam@example.com'], ['Subject', 'Saw this sale, thought of you']].forEach(([k, v]) => { const d = el('div'); d.append(document.createTextNode(k + ': '), el('b', null, v)); mh.append(d); });
    const body = el('div', 'pp-body'); body.tabIndex = 0; body.setAttribute('role', 'textbox'); body.setAttribute('aria-label', 'Email body. Press Command V or the Paste button'); body.append(el('span', 'ph', 'Hi Sam, look at this:'));
    const bar = el('div', 'pp-bar'), pst = btn('paste', 'Paste'), clr = btn('clr', 'Clear'), hint = el('span'); bar.append(pst, clr, hint); mail.append(mh, body, bar); dst.append(mail);
    site.append(src, dst); page.append(site);

    /* ---- cleaning ---- */
    const TRK = /^(utm_[a-z]+|fbclid|gclid|mc_eid|mc_cid|ref|igshid)$/i;
    function cleanUrl(u, rep) { try { const x = new URL(u); const keys = [...x.searchParams.keys()]; let n = 0; keys.forEach(k => { if (TRK.test(k)) { x.searchParams.delete(k); n++; } }); if (n && S.track) { rep.track += n; return x.toString().replace(/\?$/, ''); } } catch (_) {} return u; }
    function cleanText(t, rep) {
      if (S.inv) { const n = (t.match(/[\u200B-\u200D\uFEFF]/g) || []).length; if (n) { rep.inv += n; t = t.replace(/[\u200B-\u200D\uFEFF]/g, ''); } }
      if (S.quotes) { const n = (t.match(/[“”‘’]/g) || []).length; if (n) { rep.q += n; t = t.replace(/[“”]/g, '"').replace(/[‘’]/g, "'"); } }
      if (S.ws) { const n = (t.match(/\u00A0/g) || []).length; rep.ws += n; t = t.replace(/\u00A0/g, ' ').replace(/ {2,}/g, ' '); }
      return t;
    }
    function toText(frag, mode, rep) {
      const out = []; const walk = (n, ctx) => {
        if (n.nodeType === 3) { out.push(cleanText(n.textContent, rep)); return; } if (n.nodeType !== 1 && n.nodeType !== 11) return;
        const tag = n.nodeName, kids = () => n.childNodes.forEach(c => walk(c, ctx));
        if (n.classList && n.classList.contains('pp-cp')) return;
        if (tag === 'A') { const t0 = out.length; kids(); const txt = out.splice(t0).join(''), url = cleanUrl(n.getAttribute('href') || '', rep); out.push(mode === 'md' ? '[' + txt + '](' + url + ')' : mode === 'plain' ? txt + ' (' + url + ')' : txt); return; }
        if (mode === 'md' && (tag === 'B' || tag === 'STRONG' || (n.classList && (n.classList.contains('pp-hl') || n.classList.contains('pp-red'))))) { out.push('**'); kids(); out.push('**'); return; }
        if (mode === 'md' && (tag === 'EM' || tag === 'I')) { out.push('_'); kids(); out.push('_'); return; }
        if (tag === 'H2') { out.push(mode === 'md' ? '## ' : ''); kids(); out.push('\n\n'); return; }
        if (tag === 'P' || tag === 'DIV') { kids(); out.push('\n\n'); return; }
        if (tag === 'LI') { out.push(mode === 'md' ? '- ' : '• '); kids(); out.push('\n'); return; }
        if (tag === 'UL') { kids(); out.push('\n'); return; }
        if (tag === 'TR') { const cells = [...n.children].map(c => { const o = []; const w2 = x => { if (x.nodeType === 3) o.push(cleanText(x.textContent, rep)); else x.childNodes.forEach(w2); }; w2(c); return o.join('').trim(); });
          out.push(mode === 'md' ? '| ' + cells.join(' | ') + ' |\n' + (n.firstElementChild && n.firstElementChild.nodeName === 'TH' ? '|' + cells.map(() => ' --- |').join('') + '\n' : '') : cells.join('\t') + '\n'); return; }
        if (tag === 'TABLE' || tag === 'TBODY') { kids(); out.push('\n'); return; }
        kids();
      };
      walk(frag); return out.join('').replace(/\n{3,}/g, '\n\n').trim();
    }
    function toBasic(frag, rep) {
      const root = el('div'); const walk = (n, into) => {
        if (n.nodeType === 3) { const t = cleanText(n.textContent, rep); if (t) into.append(document.createTextNode(t)); return; } if (n.nodeType !== 1 && n.nodeType !== 11) return;
        if (n.classList && n.classList.contains('pp-cp')) return; const tag = n.nodeName; let nx = into;
        if (tag === 'A') { nx = el('a'); nx.href = cleanUrl(n.getAttribute('href') || '', rep); nx.rel = 'noopener'; nx.addEventListener('click', e => e.preventDefault()); }
        else if (tag === 'EM' || tag === 'I') nx = el('i'); else if (n.classList && (n.classList.contains('pp-hl') || n.classList.contains('pp-red'))) nx = el('b');
        else if (['P', 'H2', 'LI', 'TR', 'DIV'].includes(tag)) nx = el('div'); else if (tag === 'TD' || tag === 'TH') { n.childNodes.forEach(c => walk(c, into)); into.append(document.createTextNode('   ')); return; }
        n.childNodes.forEach(c => walk(c, nx)); if (nx !== into) into.append(nx);
      }; walk(frag, root); return root;
    }
    function process(frag) {
      const rep = { track: 0, q: 0, inv: 0, ws: 0 };
      const text = toText(frag, S.mode === 'basic' ? 'plain' : S.mode, rep);
      const basic = S.mode === 'basic' ? toBasic(frag, { track: 0, q: 0, inv: 0, ws: 0 }) : null;
      return { frag, text, basic, rep, mode: S.mode, on: S.on };
    }
    function copyNode(node) { const r = document.createRange(); r.selectNode(node); const frag = r.cloneContents(); last = process(frag); const t = S.on ? last.text : node.textContent;
      try { navigator.clipboard.writeText(t).catch(() => {}); } catch (_) {} afterCopy(); }
    src.addEventListener('copy', e => {
      const sel = window.getSelection(); if (!sel || !sel.rangeCount) return; const r = sel.getRangeAt(0); if (!src.contains(r.commonAncestorContainer)) return;
      last = process(r.cloneContents()); if (S.on) { e.preventDefault(); e.clipboardData.setData('text/plain', last.text); } afterCopy();
    });
    function afterCopy() { const n = last.rep.track + last.rep.q + last.rep.inv; if (S.on) { toast('Copied clean' + (n ? ' · ' + n + ' fixes' : '')); H.tone(740, .05); } else toast('Copied with all its formatting'); renderPop(); hint.textContent = 'Ready to paste'; }

    /* ---- paste into the email ---- */
    function doPaste() {
      if (!last) { toast('Copy something from the newsletter first'); return; }
      const ph = body.querySelector('.ph'); if (ph) ph.remove(); const ch = el('div', 'chunk new');
      if (!last.on) ch.append(last.frag.cloneNode(true));
      else if (last.mode === 'basic') ch.append(last.basic.cloneNode(true));
      else if (last.mode === 'md') ch.append(el('pre', null, last.text));
      else ch.append(el('div', 'txt', last.text));
      ch.querySelectorAll('.pp-cp').forEach(x => x.remove()); ch.querySelectorAll('a').forEach(a => a.addEventListener('click', e => e.preventDefault()));
      body.append(ch); body.scrollTop = body.scrollHeight; if (last.on) cleaned++; renderPop(); hint.textContent = last.on ? 'Pasted clean' : 'Pasted with formatting';
      if (G && !reduced) G.from(ch, { y: 8, opacity: 0, duration: .4, ease: 'expo.out' });
    }
    pst.addEventListener('click', doPaste); clr.addEventListener('click', () => { body.textContent = ''; body.append(el('span', 'ph', 'Hi Sam, look at this:')); hint.textContent = ''; });
    body.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') { e.preventDefault(); doPaste(); } });
    body.addEventListener('paste', e => { e.preventDefault(); doPaste(); });

    /* ---- popover ---- */
    const P = el('div', 'pc'), power = swBtn('PastePlain', 'Clean everything you copy');
    power.addEventListener('click', () => { S.on = !S.on; save(); renderPop(); toast(S.on ? 'PastePlain on' : 'PastePlain off: copies keep their formatting'); });
    const mb = el('div'), seg = el('div', 'pc-seg'); [['plain', 'Plain'], ['basic', 'Basic'], ['md', 'Markdown']].forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => { S.mode = k; save(); if (last) last = process(last.frag); renderPop(); }); seg.append(b); }); mb.append(label('Paste as'), seg);
    const sw = [['quotes', 'Straighten curly quotes'], ['track', 'Remove tracking from links'], ['inv', 'Remove invisible characters'], ['ws', 'Tidy spaces']].map(([k, t]) => { const b = swBtn(t, null, true); b.addEventListener('click', () => { S[k] = !S[k]; save(); if (last) last = process(last.frag); renderPop(); }); return [k, b]; });
    const rb = el('div'), rep = el('div', 'pp-rep'), pre = el('pre', 'pp-pre'); rb.append(label('Last copy'), rep, pre);
    const cnt = el('div', 'pp-cnt'), cn = el('b', null, '0'); cnt.append(cn, document.createTextNode('pastes cleaned'));
    P.append(power, mb, ...sw.map(x => x[1]), rb, cnt); pb.append(P);
    function renderPop() {
      power.setAttribute('aria-checked', String(S.on)); seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.mode))); sw.forEach(([k, b]) => { b.setAttribute('aria-checked', String(S[k])); b.classList.toggle('pc-off', !S.on); });
      rep.textContent = ''; pre.textContent = '';
      if (!last) { rep.append(el('p', 'pc-empty', 'Copy part of the newsletter to see what gets cleaned.')); pre.hidden = true; }
      else { pre.hidden = false; const r = last.rep, chips = []; if (!S.on) chips.push('Off: nothing cleaned'); else { if (r.track) chips.push(r.track + ' tracking codes'); if (r.q) chips.push(r.q + ' curly quotes'); if (r.inv) chips.push(r.inv + ' invisible chars'); chips.push('fonts and colours dropped'); }
        chips.forEach(c => rep.append(el('span', null, c))); pre.textContent = S.on ? last.text.slice(0, 600) : 'Pasting will bring the newsletter’s fonts, colours and highlights with it.'; }
      cn.textContent = String(cleaned); H.badge(cleaned || '');
    }
    renderPop();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
  /* poster layout: the tilted demo straightens as it scrolls into view */
  if (window.gsap && window.ScrollTrigger && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 700px)', () => { gsap.to('.po-tilt', { rotate: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.po-tilt', start: 'top 95%', end: 'top 30%', scrub: 1 } }); });
    mm.add('(max-width: 699px)', () => { gsap.set('.po-tilt', { rotate: 0, scale: 1 }); });
  }
})();
