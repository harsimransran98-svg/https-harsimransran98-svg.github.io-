/* ShopSync — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
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
    if (window.ScrollTrigger) G.from('.wpa', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.wpa', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };

/* ---------- plugin simulator ---------- */
  function demo(root, H) {
    const { el, svgEl, G, reduced, toast } = H;
    const CH = [{ k: 'woo', n: 'WooCommerce', c: '#7F54B3', x: 90, y: 70 }, { k: 'shop', n: 'Shopify store', c: '#2DD4A7', x: 410, y: 70 }, { k: 'pos', n: 'Shop-floor POS', c: '#F59E0B', x: 250, y: 230 }];
    const SKUS = [{ sku: 'NW-LIN-01', n: 'Linen throw · oat', q: 24 }, { sku: 'NW-LIN-02', n: 'Linen throw · moss', q: 9 }, { sku: 'NW-MUG-07', n: 'Stoneware mug', q: 52 }, { sku: 'NW-CAN-03', n: 'Cedar candle', q: 3 }];
    const stock = {}; SKUS.forEach(s => { stock[s.sku] = { woo: s.q, shop: s.q, pos: s.q }; });
    let editCh = 'woo', conflict = null, syncing = 0;
    const wrap = el('div', 'ss'), net = el('div', 'ss-net'), right = el('div', 'ss-right');
    const sv = svgEl('svg', { viewBox: '0 0 500 300', class: 'ss-svg', role: 'img', 'aria-label': 'Sync network between WooCommerce, Shopify and POS' });
    const HUB = { x: 250, y: 130 };
    CH.forEach(c => sv.append(svgEl('line', { x1: HUB.x, y1: HUB.y, x2: c.x, y2: c.y, stroke: '#D9D2EE', 'stroke-width': 3, 'stroke-dasharray': '6 6', class: 'ss-link' })));
    const hub = svgEl('g'); hub.append(svgEl('circle', { cx: HUB.x, cy: HUB.y, r: 34, fill: '#1E1240' })); const ht = svgEl('text', { x: HUB.x, y: HUB.y + 5, 'text-anchor': 'middle', fill: '#fff', 'font-size': 13, 'font-weight': 800 }); ht.textContent = 'ShopSync'; hub.append(ht); sv.append(hub);
    const ring = svgEl('circle', { cx: HUB.x, cy: HUB.y, r: 34, fill: 'none', stroke: '#2DD4A7', 'stroke-width': 3, opacity: 0 }); sv.append(ring);
    const nodeEls = {}; CH.forEach(c => { const g = svgEl('g', { class: 'ss-node', tabindex: 0, role: 'button', 'aria-label': `Edit stock on ${c.n}` }); g.append(svgEl('rect', { x: c.x - 70, y: c.y - 24, width: 140, height: 48, rx: 14, fill: '#fff', stroke: c.c, 'stroke-width': 2.5 })); const t = svgEl('text', { x: c.x, y: c.y - 2, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#1E1240' }); t.textContent = c.n; const s = svgEl('text', { x: c.x, y: c.y + 15, 'text-anchor': 'middle', 'font-size': 11, fill: '#6B6290', class: 'st' }); s.textContent = 'in sync'; g.append(t, s); g.addEventListener('click', () => setEdit(c.k)); g.addEventListener('keydown', e => { if (e.key === 'Enter') setEdit(c.k); }); nodeEls[c.k] = g; sv.append(g); });
    const acts = el('div', 'ss-acts'), off = el('button', 'btn pri', 'Simulate simultaneous sales'); off.type = 'button'; acts.append(off);
    net.append(sv, acts);
    const tabs = el('div', 'ss-tabs'); CH.forEach(c => { const b = el('button', null, c.n); b.type = 'button'; b.dataset.k = c.k; b.style.setProperty('--c', c.c); b.addEventListener('click', () => setEdit(c.k)); tabs.append(b); });
    const table = el('div', 'ss-table'), conf = el('div', 'ss-conf'), log = el('div', 'ss-log');
    right.append(el('p', 'ss-l', 'Edit stock on'), tabs, table, conf, el('p', 'ss-l', 'Sync log'), log);
    wrap.append(net, right); root.append(wrap);
    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    function addLog(t, cls) { const p = el('p', cls || null); p.append(el('span', null, now()), document.createTextNode(' ' + t)); log.prepend(p); while (log.children.length > 7) log.lastChild.remove(); }
    function setEdit(k) { editCh = k; tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === k))); renderTable(); }
    function renderTable() {
      table.replaceChildren(); const head = el('div', 'ss-tr ss-th'); ['SKU', 'Product', 'Woo', 'Shopify', 'POS'].forEach(t => head.append(el('span', null, t))); table.append(head);
      SKUS.forEach(s => { const r = el('div', 'ss-tr'); r.append(el('code', null, s.sku), el('span', null, s.n)); CH.forEach(c => { const v = stock[s.sku][c.k], cell = el('span', 'ss-cell' + (c.k === editCh ? ' ed' : '')); if (c.k === editCh) { const m = el('button', null, '−'), p = el('button', null, '+'); m.type = p.type = 'button'; m.setAttribute('aria-label', `Decrease ${s.sku}`); p.setAttribute('aria-label', `Increase ${s.sku}`); m.addEventListener('click', () => change(s.sku, -1)); p.addEventListener('click', () => change(s.sku, 1)); cell.append(m, el('b', null, String(v)), p); } else cell.append(el('b', v <= 3 ? 'low' : null, String(v))); const same = CH.every(x => stock[s.sku][x.k] === v); if (!same) cell.classList.add('diff'); r.append(cell); }); table.append(r); });
    }
    function pulse(from, done) {
      const src = CH.find(c => c.k === from); syncing++; nodeEls[from].querySelector('.st').textContent = 'sending…';
      const dot = (a, b, cb) => { const d = svgEl('circle', { r: 7, fill: src.c, cx: a.x, cy: a.y }); sv.append(d); if (G && !reduced) G.to(d, { attr: { cx: b.x, cy: b.y }, duration: .5, ease: 'power2.inOut', onComplete: () => { d.remove(); cb && cb(); } }); else { d.remove(); cb && cb(); } };
      dot(src, HUB, () => { if (G && !reduced) G.fromTo(ring, { attr: { r: 34 }, opacity: .9 }, { attr: { r: 60 }, opacity: 0, duration: .6 }); let n = 0; CH.filter(c => c.k !== from).forEach(c => dot(HUB, c, () => { nodeEls[c.k].querySelector('.st').textContent = 'updated ✓'; if (++n === 2) { syncing--; nodeEls[from].querySelector('.st').textContent = 'in sync'; done(); setTimeout(() => CH.forEach(x => { nodeEls[x.k].querySelector('.st').textContent = conflict ? 'conflict!' : 'in sync'; }), 900); } })); });
    }
    function change(sku, d) {
      if (conflict) { toast('Resolve the conflict first.'); return; }
      const v = Math.max(0, stock[sku][editCh] + d); stock[sku][editCh] = v; renderTable();
      const ch = CH.find(c => c.k === editCh);
      pulse(editCh, () => { CH.forEach(c => { stock[sku][c.k] = v; }); renderTable(); addLog(`${sku} → ${v} from ${ch.n}, pushed to 2 channels`, 'ok'); if (v <= 3) addLog(`Low stock alert: ${sku} has ${v} left`, 'warn'); });
    }
    off.addEventListener('click', () => {
      if (conflict) return; const s = SKUS[0], base = stock[s.sku].woo;
      if (base < 3) { toast('Restock NW-LIN-01 first.'); return; }
      stock[s.sku].pos = base - 2; stock[s.sku].shop = base - 1; conflict = { sku: s.sku, base }; renderTable();
      addLog(`POS sold 2 × ${s.sku} while Shopify sold 1 at the same moment`, 'warn'); CH.forEach(x => { nodeEls[x.k].querySelector('.st').textContent = 'conflict!'; });
      renderConflict(); if (G && !reduced) G.fromTo(conf, { scale: .9, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: 'back.out(2)' });
    });
    function renderConflict() {
      conf.replaceChildren(); conf.hidden = !conflict; if (!conflict) return;
      const { sku, base } = conflict, st = stock[sku];
      conf.append(el('b', null, `Conflict on ${sku}`), el('p', null, `Started at ${base}. POS says ${st.pos}, Shopify says ${st.shop}, WooCommerce still says ${st.woo}.`));
      const opts = el('div', 'ss-opts');
      [[`Merge both sales → ${base - 3} (recommended)`, base - 3, 'Merged: both sales counted'], [`Keep POS → ${st.pos}`, st.pos, 'POS value kept'], [`Keep Shopify → ${st.shop}`, st.shop, 'Shopify value kept']].forEach(([t, v, msg], i) => { const b = el('button', i ? 'ss-opt' : 'ss-opt rec', t); b.type = 'button'; b.addEventListener('click', () => { CH.forEach(c => { stock[sku][c.k] = v; }); conflict = null; renderConflict(); renderTable(); addLog(`${msg}: ${sku} = ${v} everywhere`, i ? 'warn' : 'ok'); CH.forEach(x => { nodeEls[x.k].querySelector('.st').textContent = 'in sync'; }); toast(i ? 'Resolved, but one sale was overwritten: check the order log.' : 'Resolved with no lost sales.'); }); opts.append(b); });
      conf.append(opts);
    }
    if (G && !reduced) G.to(sv.querySelectorAll('.ss-link'), { strokeDashoffset: -24, duration: 1, repeat: -1, ease: 'none' });
    setEdit('woo'); renderConflict(); addLog('Connected: WooCommerce, Shopify store, POS · 4 SKUs mapped', 'ok');
  }

  demo(document.getElementById('demo'), H);
})();
