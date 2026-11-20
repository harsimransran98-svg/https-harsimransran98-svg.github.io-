/* TabHarbor — Firefox add-on page with a live browser simulator (Bazozo Studio, generated).
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


/* ---------- TabHarbor simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"tabs":[{"t":"Sprint board — Trackly","h":"trackly.example/board","c":"#5B5BD6","idle":0,"mb":180,"pin":true},{"t":"PR #482: faster search","h":"codehub.example/pr/482","c":"#24292F","idle":14,"mb":96},{"t":"Postgres index types","h":"docs.example/postgres/indexes","c":"#336791","idle":52,"mb":74},{"t":"Design review notes","h":"notely.example/review","c":"#E8A33D","idle":95,"mb":62},{"t":"Flight status BA117","h":"skyfare.example/ba117","c":"#0EA5E9","idle":170,"mb":58},{"t":"Hiking boots — sale","h":"trailshop.example/boots","c":"#3F8F4E","idle":240,"mb":141},{"t":"Regex cheat sheet","h":"docs.example/regex","c":"#336791","idle":300,"mb":40},{"t":"Lo-fi for focus","h":"wavelength.example/focus","c":"#7B61FF","idle":30,"mb":120,"pin":true},{"t":"Quarterly planning doc","h":"notely.example/q4-plan","c":"#E8A33D","idle":420,"mb":66},{"t":"Tram line approved","h":"metrodaily.example/tram","c":"#C2410C","idle":610,"mb":210}],"docked":[{"t":"Kubernetes probes explained","h":"docs.example/k8s/probes","c":"#336791","when":"Yesterday","mb":52},{"t":"Birthday gift ideas","h":"giftly.example/ideas","c":"#DB2777","when":"Mon","mb":88}],"key":"th_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const NS = 'http://www.w3.org/2000/svg';
    const pinIc = () => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'currentColor'); s.setAttribute('aria-hidden', 'true'); const p = document.createElementNS(NS, 'path'); p.setAttribute('d', 'M15 3l6 6-3 1-4 4 1 5-2 2-4-5-5 5-1-1 5-5-5-4 2-2 5 1 4-4z'); s.append(p); return s; };
    const LIM = [[15, '15 min'], [60, '1 hour'], [240, '4 hours']];
    const saved = store.get(M.key, null) || {};
    const S = { auto: saved.auto !== false, lim: LIM.some(l => l[0] === saved.lim) ? saved.lim : 60 };
    const save = () => store.set(M.key, { auto: S.auto, lim: S.lim });
    let tabs = M.tabs.map(t => ({ ...t })), docked = M.docked.map(d => ({ ...d })), active = tabs[0], clock = 0, freed = 0, fresh = new Set();
    const idleTxt = m => m < 1 ? 'just now' : m < 60 ? 'idle ' + m + 'm' : 'idle ' + Math.floor(m / 60) + 'h' + (m % 60 ? ' ' + (m % 60) + 'm' : '');
    const hostOf = h => h.split('/')[0];

    /* ---- tab strip ---- */
    const cx = document.getElementById('cx'), strip = cx.querySelector('.cx-tabs'), plus = strip.querySelector('.cx-plus');
    strip.querySelectorAll('.cx-tab').forEach(n => n.remove());
    const nodes = new Map();
    function render(back) {
      strip.querySelectorAll('.th-tab').forEach(n => n.remove()); nodes.clear();
      const order = tabs.filter(t => t.pin).concat(tabs.filter(t => !t.pin));
      order.forEach(t => {
        const lvl = t === active || t.pin ? 0 : t.idle >= S.lim * .8 ? 2 : t.idle >= S.lim * .45 ? 1 : 0;
        const n = el('div', 'cx-tab th-tab' + (t === active ? ' on' : '') + (t.pin ? ' pin' : '') + (lvl ? ' i' + lvl : '') + (back === t ? ' back' : ''));
        n.setAttribute('role', 'tab'); n.setAttribute('aria-selected', String(t === active)); n.tabIndex = 0; n.setAttribute('aria-label', t.t + (t.pin ? ', pinned' : ', ' + idleTxt(t === active ? 0 : t.idle)));
        const f = el('i', 'fav'); f.style.background = t.c; const tt = el('span', 'th-tt'); tt.append(el('span', null, t.t), el('small', lvl === 2 ? 'warn' : null, t.pin ? 'pinned' : idleTxt(t === active ? 0 : t.idle)));
        const pn = btn('th-pn'); pn.append(pinIc()); pn.setAttribute('aria-label', (t.pin ? 'Unpin ' : 'Pin ') + t.t); pn.addEventListener('click', e => { e.stopPropagation(); t.pin = !t.pin; render(); renderPop(); toast(t.pin ? 'Pinned: TabHarbor will never dock it' : 'Unpinned'); H.tone(t.pin ? 700 : 500, .05); });
        const x = btn('th-x', '×'); x.setAttribute('aria-label', 'Close ' + t.t); x.addEventListener('click', e => { e.stopPropagation(); tabs.splice(tabs.indexOf(t), 1); if (active === t) active = tabs[0]; render(); paintPage(); renderPop(); });
        n.append(f, tt, pn, x);
        const go = () => { active = t; t.idle = 0; render(); paintPage(); };
        n.addEventListener('click', go); n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        strip.insertBefore(n, plus); nodes.set(t, n);
      });
    }
    function paintPage() {
      page.textContent = ''; if (!active) return; H.url(active.h);
      const site = el('div', 'th-site'); site.style.setProperty('--c', active.c);
      const top = el('div', 'th-top'); top.append(el('i'), document.createTextNode(hostOf(active.h)));
      const b = el('div', 'th-body'); b.append(el('h1', null, active.t), el('p', null, 'You are on this tab, so TabHarbor leaves it alone. Tabs you have not looked at for a while fade in the tab bar and then dock in the harbor.'));
      const cols = el('div', 'th-cols'); for (let i = 0; i < 3; i++) { const c = el('div'); for (let j = 0; j < 3 - (i % 2); j++) c.append(el('i')); cols.append(c); } b.append(cols);
      site.append(top, b); page.append(site);
    }
    const clk = el('div', 'th-clock'); page.parentElement.append(clk);
    const clockTxt = () => { const d = new Date(Date.now() + clock * 60000); clk.textContent = '⏱ ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) + (clock ? '  · +' + idleTxt(clock).replace('idle ', '') : ''); };

    /* ---- docking ---- */
    function dock(list, why) {
      if (!list.length) { if (why === 'now') toast('Nothing idle enough to dock yet'); return; }
      const iconR = document.getElementById('cxExt').getBoundingClientRect();
      list.forEach((t, i) => {
        const n = nodes.get(t);
        if (n && G && !reduced) { const r = n.getBoundingClientRect(), b = el('div', 'th-boat'), c = el('i'); c.style.setProperty('--c', t.c); b.append(c, el('span', null, t.t.slice(0, 22))); Object.assign(b.style, { left: r.left + 'px', top: r.top + 'px' }); document.body.append(b);
          G.to(b, { x: iconR.left - r.left - 20, y: iconR.top - r.top + 6, scale: .5, opacity: 0, duration: .9, delay: i * .12, ease: 'power2.in', onComplete: () => b.remove() }); }
        tabs.splice(tabs.indexOf(t), 1); const d = { t: t.t, h: t.h, c: t.c, mb: t.mb, when: 'Just now' }; docked.unshift(d); fresh.add(d); freed += t.mb;
      });
      render(); renderPop(); toast(list.length + (list.length > 1 ? ' idle tabs' : ' idle tab') + ' docked · ' + list.reduce((a, t) => a + t.mb, 0) + ' MB freed'); H.tone(523, .07); H.tone(392, .12);
      setTimeout(() => fresh.clear(), 1200);
    }
    const idleOnes = () => tabs.filter(t => t !== active && !t.pin && t.idle >= S.lim);
    function ff() { clock += 60; tabs.forEach(t => { if (t !== active) t.idle += 60; }); clockTxt(); render(); if (S.auto) dock(idleOnes(), 'auto'); else renderPop(); }
    function restore(d) { docked.splice(docked.indexOf(d), 1); const t = { t: d.t, h: d.h, c: d.c, mb: d.mb, idle: 0 }; tabs.push(t); freed = Math.max(0, freed - d.mb); render(t); renderPop(); H.tone(784, .08); }

    /* ---- popup ---- */
    const P = el('div', 'pc'), power = swBtn('Auto-dock idle tabs', 'Pinned tabs and this tab are never docked');
    power.addEventListener('click', () => { S.auto = !S.auto; save(); renderPop(); toast(S.auto ? 'Auto-dock on' : 'Auto-dock off: tabs stay until you dock them'); if (S.auto) dock(idleOnes(), 'auto'); });
    const limBox = el('div'), seg = el('div', 'pc-seg');
    LIM.forEach(([v, t]) => { const b = btn('', t); b.dataset.v = v; b.addEventListener('click', () => { S.lim = v; save(); render(); renderPop(); if (S.auto) dock(idleOnes(), 'auto'); H.tone(523, .05); }); seg.append(b); });
    limBox.append(label('Dock after'), seg);
    const ctl = el('div', 'th-ctl'), fwd = btn('pri', '⏩ Fast-forward 1 h'), now = btn('', 'Dock idle now');
    fwd.addEventListener('click', ff); now.addEventListener('click', () => dock(idleOnes(), 'now')); ctl.append(fwd, now);
    const st = el('div', 'th-st'), sd = el('b'), sm = el('b'), a = el('div'), b2 = el('div'); a.append(sd, el('span', null, 'tabs in the harbor')); b2.append(sm, el('span', null, 'memory freed')); st.append(a, b2);
    const hb = el('div'), find = el('input', 'th-find'), harbor = el('div', 'th-harbor');
    find.type = 'search'; find.placeholder = 'Search the harbor'; find.setAttribute('aria-label', 'Search docked tabs'); find.addEventListener('input', () => renderPop());
    hb.append(label('Harbor'), find, harbor);
    P.append(power, limBox, ctl, st, hb); pb.append(P);
    function renderPop() {
      power.setAttribute('aria-checked', String(S.auto)); seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.v === S.lim)));
      sd.textContent = String(docked.length); sm.textContent = freed + ' MB'; H.badge(docked.length || '');
      const q = find.value.trim().toLowerCase(), list = docked.filter(d => !q || d.t.toLowerCase().includes(q) || d.h.includes(q)), groups = new Map();
      list.forEach(d => { const k = hostOf(d.h); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(d); });
      harbor.textContent = '';
      groups.forEach((items, host) => {
        const g = el('div', 'th-g'), gh = el('div', 'th-gh'), all = btn('', items.length > 1 ? 'Restore all' : ''); gh.append(el('span', null, host + ' · ' + items.length)); if (items.length > 1) { all.addEventListener('click', () => { items.forEach(restore); toast('Restored ' + items.length + ' tabs from ' + host); }); gh.append(all); } g.append(gh);
        items.forEach(d => { const it = el('div', 'th-it' + (fresh.has(d) ? ' fresh' : '')), i = el('i'), sp = el('span'), r = btn('', 'Restore'); i.style.setProperty('--c', d.c); sp.append(el('b', null, d.t), el('small', null, d.when + ' · ' + d.mb + ' MB'));
          r.setAttribute('aria-label', 'Restore ' + d.t); r.addEventListener('click', () => { restore(d); toast('Sailed back: ' + d.t); }); it.append(i, sp, r); g.append(it); });
        harbor.append(g);
      });
      if (!list.length) harbor.append(el('p', 'pc-empty', q ? 'No docked tab matches “' + find.value.trim() + '”.' : 'The harbor is empty.'));
    }
    clockTxt(); render(); paintPage(); renderPop();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
