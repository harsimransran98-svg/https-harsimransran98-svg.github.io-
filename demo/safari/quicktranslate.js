/* QuickTranslate — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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


/* ---------- QuickTranslate simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"h1":["Una noche de tapas en Barcelona","A night of tapas in Barcelona","Une soirée tapas à Barcelone"],"paras":[[["El barrio del Born se llena de gente cuando cae el sol.","The Born neighbourhood fills with people when the sun goes down.","Le quartier du Born se remplit de monde au coucher du soleil."],["Los bares sacan sus mesas a la calle y el olor a ajo invade las plazas.","Bars put their tables out on the street and the smell of garlic fills the squares.","Les bars sortent leurs tables dans la rue et l’odeur d’ail envahit les places."]],[["Pedimos patatas bravas, croquetas de jamón y una ración de pulpo a la gallega.","We ordered patatas bravas, ham croquettes and a portion of Galician-style octopus.","Nous avons commandé des patatas bravas, des croquettes au jambon et une portion de poulpe à la galicienne."],["El camarero nos recomendó un vermut de la casa, servido con una aceituna y una rodaja de naranja.","The waiter recommended the house vermouth, served with an olive and a slice of orange.","Le serveur nous a conseillé le vermouth maison, servi avec une olive et une tranche d’orange."]],[["Lo mejor llegó al final: una crema catalana con el azúcar recién quemado.","The best came last: a crema catalana with freshly burnt sugar.","Le meilleur est arrivé à la fin : une crème catalane au sucre fraîchement brûlé."],["Cuesta creer que la cuenta fuera de solo treinta euros para dos.","It is hard to believe the bill was only thirty euros for two.","Difficile de croire que l’addition n’était que de trente euros pour deux."]]],"words":{"ración":["portion","une portion","A larger plate than a tapa, made for sharing."],"vermut":["vermouth","vermouth","A fortified wine, a classic pre-dinner drink in Barcelona."],"camarero":["waiter","serveur","The person who serves you at the table or bar."],"cuenta":["bill","addition","What you ask for at the end: “la cuenta, por favor”."],"barrio":["neighbourhood","quartier","A district of a city, each with its own character."],"plazas":["squares","places","Open public squares, the heart of Spanish street life."],"aceituna":["olive","olive","Often served free with a drink."],"ajo":["garlic","ail","The smell of every good tapas bar."]},"key":"qtr_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const saved = store.get(M.key, null) || {};
    const S = { to: saved.to === 'fr' ? 'fr' : 'en', pill: saved.pill !== false, book: Array.isArray(saved.book) ? saved.book.filter(x => x && typeof x.o === 'string' && typeof x.t === 'string').slice(0, 30).map(x => ({ o: x.o.slice(0, 200), t: x.t.slice(0, 200) })) : [] };
    const save = () => store.set(M.key, S);
    const T = () => S.to === 'fr' ? 2 : 1; let words = 0, whole = false;

    /* ---- article built from sentence spans ---- */
    const site = el('div', 'qt-site'), top = el('div', 'qt-top'), art = el('article', 'qt-art');
    top.append(document.createTextNode('Sabores'), el('span', null, 'Recetas · Viajes · Mercados'));
    const sents = []; const span = (row, cls) => { const sp = el('span', 'qt-s' + (cls ? ' ' + cls : ''), row[0]); sp.dataset.i = sents.length; sents.push({ row, sp, tr: false }); return sp; };
    const h1 = el('h1'); h1.append(span(M.h1)); art.append(el('small', null, 'Viajes · 4 min'), h1, el('div', 'qt-hero'));
    M.paras.forEach(p => { const pe = el('p'); p.forEach((row, i) => { if (i) pe.append(document.createTextNode(' ')); pe.append(span(row)); }); art.append(pe); });
    const pill = btn('qt-pill'); pill.hidden = true; pill.append(el('i', null, '文'), document.createTextNode('Translate'));
    const card = el('div', 'qt-card'); card.hidden = true; card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'Translation');
    site.append(top, art, pill, card); page.append(site);
    const o = () => site.getBoundingClientRect();

    /* ---- selection ---- */
    let selInfo = null;
    function onSel() {
      const sel = window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) { pill.hidden = true; return; }
      const r = sel.getRangeAt(0); if (!art.contains(r.commonAncestorContainer)) { pill.hidden = true; return; }
      const text = sel.toString().trim(); if (!text) { pill.hidden = true; return; }
      const hit = sents.filter(x => r.intersectsNode(x.sp)); const rr = r.getBoundingClientRect();
      selInfo = { text, hit, rect: rr };
      if (!S.pill) return;
      pill.style.left = Math.max(70, Math.min(site.clientWidth - 70, rr.left - o().left + rr.width / 2)) + 'px'; pill.style.top = (rr.top - o().top - 8) + 'px';
      if (pill.hidden) { pill.hidden = false; if (G && !reduced) G.fromTo(pill, { scale: .7, opacity: 0 }, { scale: 1, opacity: 1, duration: .3, ease: 'back.out(2.2)' }); }
    }
    art.addEventListener('pointerup', () => setTimeout(onSel, 10)); art.addEventListener('keyup', onSel);
    art.addEventListener('keydown', e => { if (e.altKey && e.key === 'Enter' && selInfo) { e.preventDefault(); showCard(selInfo); } });
    pill.addEventListener('pointerdown', e => e.preventDefault()); pill.addEventListener('click', () => { if (selInfo) showCard(selInfo); pill.hidden = true; });
    art.addEventListener('dblclick', () => setTimeout(() => { const sel = window.getSelection(); const w0 = sel ? sel.toString().trim().toLowerCase().replace(/[.,:;]/g, '') : ''; if (M.words[w0]) { const r = sel.getRangeAt(0); showWord(w0, r.getBoundingClientRect()); pill.hidden = true; } }, 20));

    /* ---- the card ---- */
    function place(rect) { const w = card.offsetWidth || 380, left = Math.max(12, Math.min(site.clientWidth - w - 12, rect.left - o().left + rect.width / 2 - w / 2)); card.style.left = left + 'px'; card.style.top = (rect.bottom - o().top + 10) + 'px'; }
    function typeIn(node, text) { if (!G || reduced) { node.textContent = text; return; } const st = { n: 0 }; node.textContent = ''; G.to(st, { n: text.length, duration: Math.min(1.2, text.length / 70), ease: 'none', onUpdate: () => { node.textContent = text.slice(0, Math.round(st.n)); } }); }
    function speak(text, lang) { try { const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = .95; speechSynthesis.cancel(); speechSynthesis.speak(u); return true; } catch (_) { toast('Speech is not available in this browser'); return false; } }
    function actions(list) { const a = el('div', 'qt-act'); list.forEach(([t, f, on]) => { const b = btn(on ? 'on' : '', t); b.addEventListener('click', () => f(b)); a.append(b); }); return a; }
    function showCard(info) {
      if (G) G.killTweensOf(card); card.textContent = ''; card.hidden = false;
      const list = info.hit.length ? info.hit : [], tr = list.map(x => x.row[T()]).join(' '), orig = list.map(x => x.row[0]).join(' ');
      const ch = el('div', 'qt-ch'); ch.append(document.createTextNode('SPANISH → ' + (S.to === 'fr' ? 'FRENCH' : 'ENGLISH')), el('span', null, list.length + (list.length === 1 ? ' sentence' : ' sentences')));
      const cb = el('div', 'qt-cb'), tx = el('div', 'qt-tx'); cb.append(tx, el('div', 'qt-or', '“' + orig + '”'));
      const replaced = list.length && list.every(x => x.tr);
      card.append(ch, cb, actions([['🔊 Listen', () => speak(orig, 'es-ES')], ['⧉ Copy', () => { try { navigator.clipboard.writeText(tr).then(() => toast('Translation copied'), () => toast(tr)); } catch (_) { toast(tr); } }],
        [replaced ? '↺ Original' : '⇄ Replace', b => { list.forEach(x => setTr(x, !replaced)); hide(); }], ['★ Save', () => { if (!S.book.some(x => x.o === orig)) { S.book.unshift({ o: orig, t: tr }); save(); renderPop(); toast('Saved to your phrasebook'); H.flyToIcon(tx, '#0E7490'); } }]]));
      place(info.rect); if (G && !reduced) G.fromTo(card, { y: -8, opacity: 0, scale: .96 }, { y: 0, opacity: 1, scale: 1, duration: .35, ease: 'back.out(1.8)' });
      typeIn(tx, tr); words += orig.split(/\s+/).length; renderPop(); H.tone(700, .05);
    }
    function showWord(w0, rect) {
      if (G) G.killTweensOf(card); const d = M.words[w0]; card.textContent = ''; card.hidden = false;
      const ch = el('div', 'qt-ch'); ch.append(document.createTextNode('WORD · SPANISH'), el('span', null, 'noun'));
      const cb = el('div', 'qt-cb'); cb.append(el('div', 'qt-word', w0 + ' → ' + d[S.to === 'fr' ? 1 : 0]), el('div', 'qt-def', d[2]));
      card.append(ch, cb, actions([['🔊 Listen', () => speak(w0, 'es-ES')], ['★ Save', () => { if (!S.book.some(x => x.o === w0)) { S.book.unshift({ o: w0, t: d[S.to === 'fr' ? 1 : 0] }); save(); renderPop(); toast('Saved “' + w0 + '”'); } }]]));
      place(rect); if (G && !reduced) G.fromTo(card, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: .3 }); words++; renderPop();
    }
    function hide() { card.hidden = true; }
    site.addEventListener('pointerdown', e => { if (!card.hidden && !card.contains(e.target)) hide(); if (!pill.contains(e.target)) pill.hidden = true; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { hide(); pill.hidden = true; } });
    function setTr(x, v) { x.tr = v; x.sp.textContent = v ? x.row[T()] : x.row[0]; x.sp.classList.toggle('tr', v); x.sp.lang = v ? S.to : 'es'; x.sp.classList.remove('qsh'); void x.sp.offsetWidth; x.sp.classList.add('qsh'); }

    /* ---- popover ---- */
    const P = el('div', 'pc'), lb = el('div'), seg = el('div', 'pc-seg');
    [['en', 'English'], ['fr', 'Français']].forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => { S.to = k; save(); sents.forEach(x => { if (x.tr) setTr(x, true); }); renderPop(); }); seg.append(b); });
    lb.append(label('Translate into'), seg);
    const big = btn('qt-big', 'Translate the whole page'); big.addEventListener('click', () => {
      whole = !whole; sents.forEach((x, i) => setTimeout(() => setTr(x, whole), reduced ? 0 : i * 140)); if (whole) words += sents.reduce((a, x) => a + x.row[0].split(/\s+/).length, 0); renderPop(); toast(whole ? 'Translating the page into ' + (S.to === 'fr' ? 'French' : 'English') : 'Showing the original Spanish'); H.tone(whole ? 660 : 440, .06); });
    const pl = swBtn('Show the Translate button on selection', 'Or press ⌥ Return after selecting', true); pl.addEventListener('click', () => { S.pill = !S.pill; save(); renderPop(); });
    const stt = el('div', 'qt-stt'), s1 = el('div'), s2 = el('div'), n1 = el('b'), n2 = el('b'); s1.append(n1, el('span', null, 'words translated')); s2.append(n2, el('span', null, 'in phrasebook')); stt.append(s1, s2);
    const bb = el('div'), book = el('div', 'qt-pb'); bb.append(label('Phrasebook'), book);
    P.append(lb, big, pl, stt, bb); pb.append(P);
    const popSub = document.querySelector('#cxPop .cx-pop-s');
    function renderPop() {
      seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.to))); pl.setAttribute('aria-checked', String(S.pill));
      big.textContent = whole ? 'Show the original' : 'Translate the whole page'; big.setAttribute('aria-pressed', String(whole)); if (popSub) popSub.textContent = 'Spanish → ' + (S.to === 'fr' ? 'French' : 'English');
      n1.textContent = String(words); n2.textContent = String(S.book.length); H.badge(S.book.length || '');
      book.textContent = ''; S.book.forEach(x => { const d = el('div'); d.append(el('b', null, x.o), el('span', null, x.t)); book.append(d); }); if (!S.book.length) book.append(el('p', 'pc-empty', 'Save a translation and it lands here.'));
    }
    renderPop();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
