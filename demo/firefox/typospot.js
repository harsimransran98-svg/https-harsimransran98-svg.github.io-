/* TypoSpot — Firefox add-on page with a live browser simulator (Bazozo Studio, generated).
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
  /* ---------- Firefox toolbar popup ---------- */
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


/* ---------- TypoSpot simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"dict":{"teh":"the","recieve":"receive","recieved":"received","untill":"until","definately":"definitely","seperate":"separate","occured":"occurred","wich":"which","alot":"a lot","dashbord":"dashboard","apreciate":"appreciate","accomodate":"accommodate","becuase":"because","tommorow":"tomorrow","wierd":"weird","thier":"their","goverment":"government","enviroment":"environment","adress":"address","begining":"beginning","calender":"calendar","concious":"conscious","existance":"existence","freind":"friend","independant":"independent","neccessary":"necessary","occassion":"occasion","publically":"publicly","reccomend":"recommend","succesful":"successful","truely":"truly","youre":"you’re","dont":"don’t","cant":"can’t","doesnt":"doesn’t","isnt":"isn’t","beleive":"believe","recieving":"receiving","arguement":"argument","basicly":"basically","comming":"coming","diffrent":"different","finaly":"finally","knowlege":"knowledge","occurence":"occurrence","writting":"writing"},"us":{"colour":"color","favourite":"favorite","organise":"organize","realise":"realize","behaviour":"behavior","centre":"center","cancelled":"canceled"},"uk":{"color":"colour","favorite":"favourite","organize":"organise","realize":"realise","behavior":"behaviour","center":"centre","canceled":"cancelled"},"post":{"who":"maria_k","when":"2 hours ago","title":"Dashboard won’t load after the update","text":"Since yesterday’s update the dashbord won’t load. I tried seperate browsers and it occured on all of them. Clearing the cache didn’t help either. I’d apreciate any help, I have a client demo tommorow."},"draft":"Hi Maria, I recieve the same error untill I clear the the cookies, not just the cache. It definately started with the last update. Wich browser are you on? Also the error colour is hard to read. Thanks alot!","key":"tsp_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const saved = store.get(M.key, null) || {};
    const S = { type: saved.type !== false, read: saved.read !== false, region: saved.region === 'uk' ? 'uk' : 'us', words: Array.isArray(saved.words) ? saved.words.filter(w => typeof w === 'string' && /^[a-z’']{1,30}$/.test(w)).slice(0, 40) : [] };
    const save = () => store.set(M.key, { type: S.type, read: S.read, region: S.region, words: S.words });
    const ignored = new Set(); let fixed = 0, armed = false;
    const cap = (w, f) => w[0] !== w[0].toLowerCase() ? f[0].toUpperCase() + f.slice(1) : f;

    /* ---- the checker ---- */
    function check(text) {
      const out = [], re = /[A-Za-z’']+/g; let mt, prev = null;
      while ((mt = re.exec(text))) {
        const w = mt[0], lw = w.toLowerCase(), a = mt.index, b = a + w.length;
        if (prev && prev.lw === lw && /^\s+$/.test(text.slice(prev.b, a)) && !ignored.has('rep:' + a)) out.push({ a: prev.b, b, w, fix: '', kind: 'rep' });
        else if (!S.words.includes(lw) && !ignored.has(lw)) {
          const f = M.dict[lw] || (M[S.region][lw]);
          if (f) out.push({ a, b, w, fix: cap(w, f), kind: M.dict[lw] ? 'typo' : 'reg' });
        }
        prev = { lw, b };
      }
      return out;
    }
    function paint(container, text, issues, interactive) {
      container.textContent = ''; let i0 = 0;
      issues.forEach((it, i) => { container.append(document.createTextNode(text.slice(i0, it.a))); const mk = el('mark', 'ts-m' + (it.kind === 'rep' ? ' rep' : it.kind === 'reg' ? ' reg' : ''), text.slice(it.a, it.b)); mk.dataset.i = i;
        if (interactive) { mk.tabIndex = 0; mk.setAttribute('role', 'button'); mk.setAttribute('aria-label', 'Possible typo: ' + it.w + ', suggestion ' + (it.fix || 'remove repeated word')); }
        container.append(mk); i0 = it.b; });
      container.append(document.createTextNode(text.slice(i0) + '\n'));
    }

    /* ---- the forum page ---- */
    const site = el('div', 'ts-site'), top = el('div', 'ts-top'), wrap = el('div', 'ts-wrap');
    top.append(el('i'), document.createTextNode('Helpdesk Forum'), el('span', null, 'Topics · Guides · Status'));
    const post = el('article', 'ts-post'), who = el('div', 'ts-who'), wb = el('span'); wb.append(el('b', null, M.post.who), document.createTextNode(' · ' + M.post.when)); who.append(el('i'), wb);
    const ptext = el('p'); post.append(who, el('h1', null, M.post.title), ptext);
    const thread = el('div');
    const reply = el('section', 'ts-reply'), box = el('div', 'ts-box'), mirror = el('div', 'ts-mirror'), ta = el('textarea');
    mirror.setAttribute('aria-hidden', 'true'); ta.value = M.draft; ta.maxLength = 1200; ta.spellcheck = false; ta.setAttribute('aria-label', 'Your reply');
    box.append(mirror, ta);
    const bar = el('div', 'ts-bar'), stat = el('span'), postBtn = btn('', 'Post reply'); bar.append(stat, postBtn);
    reply.append(el('h3', null, 'Your reply'), box, bar);
    const bub = el('div', 'ts-bub'); bub.hidden = true;
    wrap.append(post, thread, reply); site.append(top, wrap, bub); page.append(site);

    let draftIssues = [], pageIssues = [];
    function run() {
      draftIssues = S.type ? check(ta.value) : []; paint(mirror, ta.value, draftIssues, false); mirror.scrollTop = ta.scrollTop;
      pageIssues = S.read ? check(M.post.text) : []; paint(ptext, M.post.text, pageIssues, true);
      ptext.lastChild.textContent = ptext.lastChild.textContent.replace(/\n$/, '');
      stat.textContent = ''; if (S.type) { if (draftIssues.length) stat.append(el('b', null, String(draftIssues.length)), document.createTextNode(draftIssues.length > 1 ? ' possible typos' : ' possible typo')); else stat.textContent = 'No typos found ✓'; }
      H.badge(draftIssues.length + pageIssues.length || ''); renderPop();
    }
    ta.addEventListener('input', () => { armed = false; bub.hidden = true; run(); });
    ta.addEventListener('scroll', () => { mirror.scrollTop = ta.scrollTop; bub.hidden = true; });

    /* ---- suggestion bubble ---- */
    function showBub(markEl, it, editable) {
      bub.textContent = ''; markEl.classList.add('hot');
      bub.append(el('small', null, it.kind === 'rep' ? 'Repeated word' : it.kind === 'reg' ? (S.region === 'us' ? 'US spelling' : 'UK spelling') : 'Possible typo'));
      const f = btn('fix'); f.append(el('s', null, it.kind === 'rep' ? ta.value.slice(it.a, it.b).trim() : it.w), document.createTextNode(it.kind === 'rep' ? 'remove it' : it.fix));
      if (editable) f.addEventListener('click', () => applyFix(it)); else { f.disabled = true; f.title = 'This is someone else’s post'; }
      const row = el('div', 'row'), ig = btn('', 'Ignore'), add = btn('', 'Add to dictionary');
      ig.addEventListener('click', () => { ignored.add(it.kind === 'rep' ? 'rep:' + it.b : it.w.toLowerCase()); bub.hidden = true; run(); toast('Ignored for this session'); });
      add.addEventListener('click', () => { const lw = it.w.toLowerCase(); if (!S.words.includes(lw)) S.words.push(lw); save(); bub.hidden = true; run(); toast('“' + it.w + '” added to your dictionary'); });
      row.append(ig); if (it.kind !== 'rep') row.append(add); bub.append(f, row);
      const r = markEl.getBoundingClientRect(), o = site.getBoundingClientRect();
      bub.hidden = false; const left = Math.max(8, Math.min(site.clientWidth - 240, r.left - o.left));
      bub.style.left = left + 'px'; bub.style.top = (r.bottom - o.top + 8) + 'px';
      if (G && !reduced) G.fromTo(bub, { y: -6, opacity: 0, scale: .96 }, { y: 0, opacity: 1, scale: 1, duration: .3, ease: 'back.out(2)' });
      H.tone(620, .04);
    }
    function applyFix(it) {
      const v = ta.value, before = v.slice(0, it.a), after = v.slice(it.b);
      ta.value = before + it.fix + after; fixed++; bub.hidden = true; run(); ta.focus(); ta.setSelectionRange(before.length + it.fix.length, before.length + it.fix.length);
      H.tone(880, .06);
    }
    ta.addEventListener('click', () => {
      const p = ta.selectionStart, i = draftIssues.findIndex(it => p >= it.a && p <= it.b);
      mirror.querySelectorAll('.hot').forEach(x => x.classList.remove('hot'));
      if (i < 0) { bub.hidden = true; return; } const mk = mirror.querySelector('[data-i="' + i + '"]'); if (mk) showBub(mk, draftIssues[i], true);
    });
    ptext.addEventListener('click', e => { const mk = e.target.closest('mark'); if (!mk) return; showBub(mk, pageIssues[+mk.dataset.i], false); });
    ptext.addEventListener('keydown', e => { const mk = e.target.closest('mark'); if (mk && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); showBub(mk, pageIssues[+mk.dataset.i], false); } });
    site.addEventListener('pointerdown', e => { if (!bub.hidden && !bub.contains(e.target) && e.target !== ta && !e.target.closest('mark')) { bub.hidden = true; site.querySelectorAll('.hot').forEach(x => x.classList.remove('hot')); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') bub.hidden = true; });
    postBtn.addEventListener('click', () => {
      const text = ta.value.trim(); if (!text) { toast('Write something first'); return; }
      if (draftIssues.length && !armed) { armed = true; toast(draftIssues.length + ' possible typos left. Press Post again to send anyway'); H.tone(300, .1); return; }
      const n = el('article', 'ts-new'), w = el('div', 'ts-who'), sp = el('span'); sp.append(el('b', null, 'you'), document.createTextNode(' · just now')); w.append(el('i'), sp); n.append(w, el('p', null, text.slice(0, 1200)));
      thread.append(n); ta.value = ''; armed = false; run(); toast(draftIssues.length ? 'Posted' : 'Posted, typo-free'); H.tone(784, .1);
      if (G && !reduced) G.from(n, { y: 16, opacity: 0, duration: .5, ease: 'back.out(1.6)' });
    });

    /* ---- popup ---- */
    const P = el('div', 'pc'), sw1 = swBtn('Check while I type', 'Every text box on every site', true), sw2 = swBtn('Flag typos in pages I read', null, true);
    sw1.addEventListener('click', () => { S.type = !S.type; save(); run(); }); sw2.addEventListener('click', () => { S.read = !S.read; save(); run(); });
    const rg = el('div'), seg = el('div', 'pc-seg'); [['us', 'English (US)'], ['uk', 'English (UK)']].forEach(([k, t]) => { const b = btn('', t); b.dataset.k = k; b.addEventListener('click', () => { S.region = k; save(); run(); toast(k === 'us' ? 'US spelling: color, favorite' : 'UK spelling: colour, favourite'); }); seg.append(b); }); rg.append(label('Spelling'), seg);
    const sum = el('div', 'ts-sum'), n1 = el('b'), n2 = el('b'), n3 = el('b'); [[n1, 'in your draft'], [n2, 'on this page'], [n3, 'fixed']].forEach(([b, t]) => { const d = el('div'); d.append(b, el('span', null, t)); sum.append(d); });
    const lb = el('div'), list = el('div', 'ts-list'), all = btn('ts-all', 'Fix all in my draft'); lb.append(label('In your draft'), list, all);
    all.addEventListener('click', () => { if (!draftIssues.length) { toast('Nothing to fix'); return; } let v = ta.value; const n = draftIssues.length; [...draftIssues].sort((a, b) => b.a - a.a).forEach(it => { v = v.slice(0, it.a) + it.fix + v.slice(it.b); }); ta.value = v; fixed += n; run(); toast('Fixed ' + n + ' typos'); H.tone(880, .06); H.tone(1100, .08); if (G && !reduced) G.fromTo(box, { boxShadow: 'inset 0 0 0 2px #22C55E' }, { boxShadow: 'inset 0 0 0 1.5px #D9DCE2', duration: 1.2 }); });
    const wb2 = el('div'), words = el('div', 'ts-words'); wb2.append(label('Your dictionary'), words);
    P.append(sw1, sw2, rg, sum, lb, wb2); pb.append(P);
    function renderPop() {
      sw1.setAttribute('aria-checked', String(S.type)); sw2.setAttribute('aria-checked', String(S.read)); seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.region)));
      n1.textContent = String(draftIssues.length); n2.textContent = String(pageIssues.length); n3.textContent = String(fixed);
      list.textContent = ''; draftIssues.forEach(it => { const r = el('div', 'ts-li'), sp = el('span'), f = btn('', 'Fix'); sp.append(el('s', null, it.kind === 'rep' ? 'the the'.replace(/the/g, it.w.toLowerCase()) : it.w), document.createTextNode(' → '), el('b', null, it.kind === 'rep' ? it.w.toLowerCase() : it.fix)); f.setAttribute('aria-label', 'Fix ' + it.w); f.addEventListener('click', () => applyFix(it)); r.append(sp, f); list.append(r); });
      if (!draftIssues.length) list.append(el('p', 'pc-empty', S.type ? 'Your draft looks clean.' : 'Checking while typing is off.'));
      all.hidden = !draftIssues.length;
      words.textContent = ''; S.words.forEach(w => { const c = el('span'), x = btn('', '×'); x.setAttribute('aria-label', 'Remove ' + w); x.addEventListener('click', () => { S.words = S.words.filter(v => v !== w); save(); run(); }); c.append(document.createTextNode(w), x); words.append(c); });
      if (!S.words.length) words.append(el('p', 'pc-empty', 'Words you add will never be flagged.'));
    }
    run();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
