/* ContainerFlow — Firefox add-on page with a live browser simulator (Bazozo Studio).
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
    const C = { personal: ['Personal', '#37ADFF', '◉'], banking: ['Banking', '#51CD00', '$'], dev: ['Dev', '#FF9F00', '</>'], client: ['Client', '#FF4BDA', '◆'], none: ['No container', '#8F8F9D', '○'] };
    const SITES = {
      mail: { host: 'mail.example', path: '/inbox', title: 'Inbox · Mail', fav: '#EA4335', cookie: 'session_id', acct: { personal: 'sam.rivera@mail.example', client: 'sam@northwind-agency.example' } },
      bank: { host: 'bank.example', path: '/accounts', title: 'Northbank · Accounts', fav: '#1F8A4C', cookie: 'nb_auth', acct: { banking: 'Sam Rivera · ••4821' } },
      code: { host: 'codehub.example', path: '/northwind/api', title: 'northwind/api · CodeHub', fav: '#24292F', cookie: 'user_session', acct: { dev: '@samr-dev' } },
      client: { host: 'portal.acme.example', path: '/projects', title: 'ACME client portal', fav: '#7C3AED', cookie: 'acme_sso', acct: { client: 'Sam (Northwind Agency)' } },
      news: { host: 'dailyfeed.example', path: '/tech', title: 'Daily Feed · Tech', fav: '#0EA5E9', cookie: 'df_pref', acct: {} }
    };
    let uid = 0;
    const tabs = [['mail', 'personal'], ['bank', 'banking'], ['code', 'dev'], ['client', 'client'], ['mail', 'client'], ['news', 'none']].map(([s, c]) => ({ id: ++uid, s, c }));
    const jars = { personal: [], banking: [], dev: [], client: [], none: [] };
    const login = (site, c) => { if (!jars[c].some(k => k.site === site)) jars[c].push({ site, name: SITES[site].cookie }); };
    tabs.forEach(t => { if (SITES[t.s].acct[t.c]) login(t.s, t.c); });
    jars.none.push({ site: 'news', name: 'df_pref' }, { site: 'adnet', name: '_adnet_uid' }); jars.personal.push({ site: 'news', name: 'theme' });
    let active = tabs[0].id, rule = true;

    /* tab strip with container colours */
    const bar = document.querySelector('.cx-tabs'), plus = bar.querySelector('.cx-plus'); bar.querySelectorAll('.cx-tab').forEach(t => t.remove());
    const strip = el('div', 'cf-strip'); bar.insertBefore(strip, plus);
    const chip = el('span', 'cf-chip'); document.querySelector('.cx-omni').insertBefore(chip, document.querySelector('.cx-star'));
    function renderTabs() {
      strip.replaceChildren();
      tabs.forEach(t => { const s = SITES[t.s], b = el('button', 'cx-tab cf-tab' + (t.id === active ? ' on' : '')); b.type = 'button'; b.style.setProperty('--cc', C[t.c][1]); const f = el('i', 'fav'); f.style.background = s.fav; b.append(f, el('span', null, s.title)); b.setAttribute('aria-label', `${s.title}, ${C[t.c][0]} container`); b.addEventListener('click', () => { active = t.id; all(); }); strip.append(b); });
    }
    const cur = () => tabs.find(t => t.id === active);

    /* the page */
    function renderPage() {
      const t = cur(), s = SITES[t.s], who = s.acct[t.c], logged = jars[t.c].some(k => k.site === t.s) && who;
      H.url(s.host + s.path); chip.textContent = C[t.c][0]; chip.style.setProperty('--cc', C[t.c][1]); chip.hidden = t.c === 'none';
      page.replaceChildren(); const v = el('div', 'cf-site s-' + t.s); v.style.setProperty('--cc', C[t.c][1]);
      const top = el('header', 'cf-top'), f = el('i'); f.style.background = s.fav; top.append(f, el('b', null, s.host));
      const acc = el('span', 'cf-acc'); if (logged) { const av = el('i', null, who[0].toUpperCase()); acc.append(av, el('span', null, who)); } else acc.append(el('span', null, 'Not signed in')); top.append(acc); v.append(top);
      const strip2 = el('div', 'cf-cstrip'); strip2.append(el('b', null, `${C[t.c][2]}  ${C[t.c][0]} container`), el('span', null, `${jars[t.c].length} cookie${jars[t.c].length === 1 ? '' : 's'} in this jar · sealed from the other ${Object.keys(C).length - 1}`)); v.append(strip2);
      const body = el('div', 'cf-body');
      if (!logged && t.s !== 'news') {
        const box = el('div', 'cf-login'); box.append(el('h2', null, `Sign in to ${s.host}`), el('p', null, 'This container has no cookies for this site, so you are signed out here, even if you are signed in somewhere else.'));
        const opts = Object.keys(s.acct); const btn = el('button', 'cf-sign', opts.includes(t.c) ? `Sign in as ${s.acct[t.c]}` : `Sign in with a new ${C[t.c][0].toLowerCase()} account`); btn.type = 'button';
        btn.addEventListener('click', () => { if (!s.acct[t.c]) s.acct[t.c] = t.c === 'none' ? 'guest' : `sam.${t.c}@${s.host}`; login(t.s, t.c); flyCookie(btn, t.c); all(); toast(`Cookie ${s.cookie} stored in the ${C[t.c][0]} jar only.`); });
        box.append(btn); body.append(box);
      } else if (t.s === 'mail') { body.append(el('h2', null, 'Inbox')); [['Lena Park', 'Dinner Friday?'], ['Northwind', 'Q4 kickoff deck'], ['Bookshop', 'Your order has shipped'], ['Ravi', 'Photos from the hike']].forEach(([a, b], i) => { const r = el('div', 'cf-mail'); r.append(el('b', null, t.c === 'client' ? ['ACME · Dana', 'Brief v3', 'Invoice 0931', 'Kickoff notes'][i] : a), el('span', null, t.c === 'client' ? ['Feedback on homepage', 'Updated scope', 'Paid, thank you', 'From Tuesday'][i] : b)); body.append(r); }); }
      else if (t.s === 'bank') { const bal = el('div', 'cf-bal'); bal.append(el('small', null, 'Current account'), el('b', null, '£4,218.60')); body.append(bal); ['Rent  −£1,150.00', 'Salary  +£3,420.00', 'Groceries  −£64.18'].forEach(x => body.append(el('p', 'cf-tx', x))); }
      else if (t.s === 'code') { body.append(el('h2', null, 'northwind/api')); ['src/', 'tests/', 'README.md', 'package.json'].forEach(x => body.append(el('p', 'cf-file', x))); }
      else if (t.s === 'client') { body.append(el('h2', null, 'Projects')); ['Homepage redesign · 72%', 'Brand refresh · 40%', 'Email templates · done'].forEach(x => body.append(el('p', 'cf-proj', x))); }
      else { body.append(el('h2', null, 'Ten gadgets we loved this year')); body.append(el('p', null, 'From folding keyboards to a lamp that knows when you are reading, here are the gadgets that earned a place on our desks.')); const ad = el('div', 'cf-ad'); ad.append(el('small', null, 'Ad · adnet.example'), el('b', null, 'This ad would love to know what you bank with.')); body.append(ad); }
      v.append(body); page.append(v);
      if (G && !reduced) G.from(v.children, { opacity: 0, y: 8, duration: .3, stagger: .05 });
    }
    function flyCookie(from, c) {
      const target = pop.isOpen() ? jarEls[c] : document.getElementById('cxExt'); if (!G || reduced || !target) return;
      const a = from.getBoundingClientRect(), b = target.getBoundingClientRect(), d = el('i', 'cf-fly'); d.style.left = a.left + a.width / 2 + 'px'; d.style.top = a.top + 'px'; document.body.append(d);
      G.to(d, { x: b.left + b.width / 2 - a.left - a.width / 2, duration: .7, ease: 'power1.inOut' });
      G.to(d, { y: b.top + b.height * .45 - a.top, duration: .7, ease: 'back.in(1.5)', onComplete: () => { d.remove(); if (jarEls[c]) G.fromTo(jarEls[c], { scale: 1.18 }, { scale: 1, duration: .5, ease: 'back.out(3)' }); } });
    }

    /* popup */
    const pop = H.pop, curBox = el('div', 'cf-cur'), reopen = el('div', 'cf-reopen'), jarRow = el('div', 'cf-jars'), jarInfo = el('div', 'cf-jinfo'), jarEls = {};
    const trk = el('button', 'btn pri cf-trk', 'Run the tracker test'); trk.type = 'button';
    const ruleRow = el('label', 'cf-rule'), rc = el('input'); rc.type = 'checkbox'; rc.checked = rule; rc.addEventListener('change', () => { rule = rc.checked; }); ruleRow.append(rc, document.createTextNode(' Always open bank.example in Banking'));
    const linkB = el('button', 'cf-link', 'Test: click a bank link from the news page'); linkB.type = 'button';
    pb.append(curBox, el('p', 'cf-l', 'Reopen this tab in'), reopen, el('p', 'cf-l', 'Cookie jars'), jarRow, jarInfo, trk, el('p', 'cf-l', 'Rules'), ruleRow, linkB);
    Object.entries(C).forEach(([k, [n, col]]) => { const j = el('button', 'cf-jar'); j.type = 'button'; j.style.setProperty('--cc', col); j.setAttribute('aria-label', `${n} cookie jar`); const glass = el('span', 'cf-glass'), lid = el('i', 'cf-lid'); j.append(lid, glass, el('small', null, n.replace(' container', ''))); j.addEventListener('click', () => showJar(k)); jarRow.append(j); jarEls[k] = j; });
    let shownJar = 'personal';
    function showJar(k) { shownJar = k; jarInfo.replaceChildren(); const h = el('b', null, `${C[k][0]} jar`); jarInfo.append(h); if (!jars[k].length) jarInfo.append(el('span', null, 'Empty.')); jars[k].forEach(c => jarInfo.append(el('code', null, `${c.site === 'adnet' ? 'adnet.example' : SITES[c.site].host} · ${c.name}`))); Object.values(jarEls).forEach(j => j.classList.toggle('on', j === jarEls[k])); }
    function renderPop() {
      const t = cur(); curBox.replaceChildren(); curBox.style.setProperty('--cc', C[t.c][1]); curBox.append(el('i', null, C[t.c][2]), el('b', null, SITES[t.s].title), el('small', null, `${C[t.c][0]} container`));
      reopen.replaceChildren(); Object.entries(C).forEach(([k, [n, col, ic]]) => { const b = el('button', 'cf-rb'); b.type = 'button'; b.style.setProperty('--cc', col); b.append(el('i', null, ic), el('span', null, n.replace(' container', ''))); b.disabled = k === t.c; b.addEventListener('click', () => { t.c = k; all(); toast(`Reopened in ${n}. ${jars[k].some(c => c.site === t.s) ? 'This jar has its own login.' : 'No cookies for this site in that jar, so you are signed out.'}`); }); reopen.append(b); });
      Object.entries(jarEls).forEach(([k, j]) => { const g = j.querySelector('.cf-glass'); g.replaceChildren(); jars[k].forEach((c, i) => { const ck = el('i', 'cf-ck'); ck.style.left = (12 + (i * 23) % 60) + '%'; ck.style.bottom = (6 + Math.floor(i / 3) * 22) + '%'; g.append(ck); }); });
      showJar(shownJar); H.badge(tabs.filter(x => x.c !== 'none').length);
    }
    function all() { renderTabs(); renderPage(); renderPop(); }
    trk.addEventListener('click', async () => {
      trk.disabled = true; const t = tabs.find(x => x.s === 'news'); active = t.id; all();
      let seen = 0;
      for (const [k, j] of Object.entries(jarEls)) {
        const open = k === t.c; j.classList.add(open ? 'leak' : 'block'); if (open) seen += jars[k].length;
        trk.textContent = `adnet.example probing ${C[k][0]}…`; await new Promise(r => setTimeout(r, reduced ? 10 : 380));
      }
      setTimeout(() => Object.values(jarEls).forEach(j => j.classList.remove('leak', 'block')), 2600);
      trk.disabled = false; trk.textContent = 'Run the tracker test';
      toast(`adnet.example could read ${seen} cookies from the No-container jar, and 0 from Personal, Banking, Dev or Client.`);
    });
    linkB.addEventListener('click', () => { const c = rule ? 'banking' : 'none', t = { id: ++uid, s: 'bank', c }; tabs.push(t); active = t.id; all(); toast(rule ? 'The rule opened bank.example straight into Banking. You are signed in there.' : 'Without the rule, the bank opened outside any container. Signed out.'); });
    all(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
