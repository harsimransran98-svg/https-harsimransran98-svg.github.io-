/* TabFolders — Safari extension page with a live browser simulator (Bazozo Studio, generated).
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


/* ---------- TabFolders simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast, store } = H, pb = H.pop.body;
    const M = {"tabs":[["Lisbon: 3-day itinerary","wanderly.example/lisbon","trip"],["PR #482: faster search","codehub.example/pr/482","work"],["Flights LHR → LIS","skyfare.example/lhr-lis","trip"],["Shakshuka for two","spoonful.example/shakshuka","home"],["Sprint board","trackly.example/board","work"],["Alfama guesthouse","staybook.example/alfama","trip"],["Sourdough starter guide","crumb.example/starter","home"],["Postgres index types","docs.example/postgres","work"],["Tram 28 timetable","carris.example/28","trip"],["Farmers market hours","localmarket.example","home"],["Design review notes","notely.example/review","work"],["Pastéis de nata recipe","spoonful.example/nata","home"]],"topics":{"trip":["Lisbon trip","#EA580C"],"work":["Work","#7C3AED"],"home":["Kitchen","#16A34A"]},"key":"tf_state_v1"};

    const label = (t, out) => { const l = el('div', 'pc-l'); l.append(el('span', null, t)); if (out) l.append(out); return l; };
    const swBtn = (title, sub, small) => { const b = el('button', 'pc-sw' + (small ? ' sm' : '')); b.type = 'button'; b.setAttribute('role', 'switch'); const t = el('span'); t.append(el('b', null, title)); if (sub) t.append(el('small', null, sub)); b.append(t, el('i')); return b; };
    const btn = (cls, text) => { const b = el('button', cls, text); b.type = 'button'; return b; };
    const COLS = ['#EA580C', '#7C3AED', '#16A34A', '#0EA5E9', '#DB2777', '#CA8A04'];
    const tabs = M.tabs.map(([t, h, topic], i) => ({ id: i, t, h, topic, f: null })); let folders = [], act = 0, dragId = null;
    const tc = x => { const f = folders.find(f => f.id === x.f); return f ? f.c : '#A8A29E'; };

    /* ---- tab strip ---- */
    const cx = document.getElementById('cx'), strip = cx.querySelector('.cx-tabs'), plus = strip.querySelector('.cx-plus'); strip.querySelectorAll('.cx-tab').forEach(n => n.remove());
    function ordered() { const out = []; folders.forEach(f => tabs.filter(x => x.f === f.id).forEach(x => out.push(x))); tabs.filter(x => x.f == null).forEach(x => out.push(x)); return out; }
    function renderTabs() {
      strip.querySelectorAll('.tf-t, .tf-chip').forEach(n => n.remove());
      const seen = new Set();
      ordered().forEach(x => { const f = folders.find(f => f.id === x.f);
        if (f && f.shut) { if (seen.has(f.id)) return; seen.add(f.id); const ch = el('div', 'cx-tab tf-chip'); ch.style.setProperty('--fc', f.c); ch.setAttribute('role', 'button'); ch.tabIndex = 0; ch.setAttribute('aria-label', 'Open folder ' + f.n); ch.append(document.createTextNode('📁 ' + f.n), el('b', null, String(tabs.filter(y => y.f === f.id).length)));
          const op = () => { f.shut = false; renderAll(); toast('Opened ' + f.n); }; ch.addEventListener('click', op); ch.addEventListener('keydown', e => { if (e.key === 'Enter') op(); }); strip.insertBefore(ch, plus); return; }
        const n = el('div', 'cx-tab tf-t' + (x.id === act ? ' on' : '')), fv = el('i', 'fav'); fv.style.background = tc(x); if (f) n.style.setProperty('--fc', f.c); n.setAttribute('role', 'tab'); n.title = x.t; n.append(fv, el('span', null, x.t));
        n.addEventListener('click', () => { act = x.id; renderTabs(); paint(); }); n.dataset.id = x.id; strip.insertBefore(n, plus); });
    }
    function paint() { const x = tabs.find(y => y.id === act) || tabs[0]; H.url(x.h); page.textContent = ''; const f = folders.find(f => f.id === x.f), site = el('div', 'tf-site'); if (f) site.style.setProperty('--fc', f.c);
      const top = el('div', 'tf-top'); top.append(el('i'), document.createTextNode(x.h.split('/')[0])); const b = el('div', 'tf-body'); b.append(el('small', null, f ? 'In folder: ' + f.n : 'Not in a folder yet'), el('h1', null, x.t), el('p', null, 'Twelve tabs, three different trains of thought. Let TabFolders sort them so the trip, the work and the cooking each get their own space.')); site.append(top, b); page.append(site); }

    /* ---- grouping ---- */
    let uid = 0;
    function group(by) {
      const keyOf = x => by === 'site' ? x.h.split('/')[0].split('.')[0] : x.topic; const keys = [...new Set(tabs.map(keyOf))];
      const old = new Map([...strip.querySelectorAll('.tf-t')].map(n => [+n.dataset.id, n.getBoundingClientRect()]));
      folders = keys.map((k, i) => ({ id: ++uid, k, n: by === 'topic' && M.topics[k] ? M.topics[k][0] : k[0].toUpperCase() + k.slice(1), c: by === 'topic' && M.topics[k] ? M.topics[k][1] : COLS[i % COLS.length], shut: false }));
      tabs.forEach(x => { x.f = folders.find(f => f.k === keyOf(x)).id; });
      renderAll(); const iconR = document.getElementById('cxExt').getBoundingClientRect();
      if (G && !reduced) [...strip.querySelectorAll('.tf-t')].forEach((n, i) => { const a = old.get(+n.dataset.id), b = n.getBoundingClientRect(); if (!a) return; G.from(n, { x: a.left - b.left, duration: .7, delay: i * .03, ease: 'expo.out' }); });
      toast('Grouped ' + tabs.length + ' tabs into ' + folders.length + ' folders'); H.tone(660, .06); setTimeout(() => H.tone(880, .08), 120);
    }
    function moveTo(x, fid) { x.f = fid === 'none' ? null : +fid; renderAll(); const f = folders.find(f => f.id === x.f); toast(f ? 'Moved to ' + f.n : 'Removed from folder'); }

    /* ---- popover ---- */
    const P = el('div', 'pc'), gb = el('div', 'tf-grp'), bTopic = btn('pri', 'Group by topic'), bSite = btn('', 'Group by site'), bClear = btn('', 'Ungroup all');
    bTopic.addEventListener('click', () => group('topic')); bSite.addEventListener('click', () => group('site')); bClear.addEventListener('click', () => { folders = []; tabs.forEach(x => { x.f = null; }); renderAll(); toast('All folders removed'); }); bClear.style.gridColumn = '1 / -1';
    gb.append(bTopic, bSite, bClear);
    const fb = el('div'), fs = el('div', 'tf-fs'), cnt = el('output'), nf = btn('', '+ New folder'); nf.style.cssText = 'height:30px;padding:0 10px;border-radius:8px;border:1px dashed var(--line);font-size:12px;font-weight:700;margin-top:6px;';
    nf.addEventListener('click', () => { if (folders.length >= 6) { toast('Six folders is plenty'); return; } folders.push({ id: ++uid, k: 'new', n: 'New folder', c: COLS[folders.length % COLS.length], shut: false }); renderAll(); const inp = fs.querySelectorAll('.tf-fh input'); const last = inp[inp.length - 1]; if (last) { last.focus(); last.select(); } });
    fb.append(label('Folders', cnt), fs, nf); P.append(gb, fb); pb.append(P);
    function rowFor(x) {
      const r = el('div', 'tf-r'), i = el('i'), sel = el('select'); i.style.setProperty('--tc', tc(x)); r.draggable = true; r.dataset.id = x.id;
      sel.setAttribute('aria-label', 'Move ' + x.t + ' to folder'); const o0 = el('option', null, 'No folder'); o0.value = 'none'; sel.append(o0); folders.forEach(f => { const o = el('option', null, f.n); o.value = f.id; sel.append(o); }); sel.value = x.f == null ? 'none' : String(x.f);
      sel.addEventListener('change', () => moveTo(x, sel.value)); r.append(i, el('span', null, x.t), sel);
      r.addEventListener('dragstart', e => { dragId = x.id; r.classList.add('drag'); try { e.dataTransfer.setData('text/plain', String(x.id)); e.dataTransfer.effectAllowed = 'move'; } catch (_) {} });
      r.addEventListener('dragend', () => { r.classList.remove('drag'); dragId = null; fs.querySelectorAll('.over').forEach(n => n.classList.remove('over')); });
      return r;
    }
    function folderBox(f) {
      const box = el('div', 'tf-f' + (f && f.shut ? ' shut' : '') + (f ? '' : ' tf-loose')), h = el('div', 'tf-fh'), list = el('div', 'tf-list'), items = tabs.filter(x => (f ? x.f === f.id : x.f == null));
      if (f) { box.style.setProperty('--fc', f.c); const i = el('i'), inp = el('input'), o = el('output', null, String(items.length)), tg = btn('', '▾'); inp.value = f.n; inp.maxLength = 24; inp.setAttribute('aria-label', 'Folder name');
        inp.addEventListener('change', () => { f.n = inp.value.trim().slice(0, 24) || 'Folder'; renderTabs(); paint(); }); tg.setAttribute('aria-expanded', String(!f.shut)); tg.setAttribute('aria-label', (f.shut ? 'Expand ' : 'Collapse ') + f.n);
        tg.addEventListener('click', () => { f.shut = !f.shut; renderAll(); toast(f.shut ? f.n + ' folded into one chip' : f.n + ' opened'); H.tone(f.shut ? 440 : 660, .05); }); h.append(i, inp, o, tg); }
      else { if (!items.length) return null; h.append(el('i'), el('span', null, 'Not in a folder'), el('output', null, String(items.length))); h.querySelector('i').style.background = '#A8A29E'; h.querySelector('span').style.cssText = 'flex:1;font-weight:700;font-size:13px;'; }
      items.forEach(x => list.append(rowFor(x))); box.append(h, list);
      box.addEventListener('dragover', e => { if (dragId == null) return; e.preventDefault(); box.classList.add('over'); }); box.addEventListener('dragleave', () => box.classList.remove('over'));
      box.addEventListener('drop', e => { e.preventDefault(); box.classList.remove('over'); const x = tabs.find(y => y.id === dragId); if (x) moveTo(x, f ? f.id : 'none'); });
      return box;
    }
    function renderAll() { fs.textContent = ''; folders.forEach(f => fs.append(folderBox(f))); const loose = folderBox(null); if (loose) fs.append(loose); cnt.textContent = folders.length + ' folders'; H.badge(folders.length || ''); renderTabs(); paint(); }
    renderAll();
    setTimeout(() => H.pop.open(), 900);
  }
  demo(document.getElementById('cxPage'), H);
})();
