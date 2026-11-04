/* BackupVault — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
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
    const { el, G, reduced, toast } = H;
    // a small site tree; each snapshot records which files changed since the previous one
    const TREE = [
      ['wp-content', [['uploads', [['2026/10', ['hero-autumn.webp', 'lookbook-01.jpg', 'lookbook-02.jpg']], ['2026/11', ['black-friday.webp', 'gift-guide.pdf']]]], ['themes/northwind', ['style.css', 'functions.php', 'templates/home.html']], ['plugins', ['woocommerce/', 'backupvault/', 'cacherunner/']]]],
      ['database', ['wp_posts.sql', 'wp_postmeta.sql', 'wp_wc_orders.sql', 'wp_options.sql']],
      ['wp-config.php', null]
    ];
    const files = []; (function walk(nodes, pre) { nodes.forEach(([n, kids]) => { const p = pre ? pre + '/' + n : n; if (kids == null) files.push(p); else if (typeof kids[0] === 'string') kids.forEach(k => files.push(p + '/' + k)); else walk(kids, p); }); })(TREE, '');
    const now = Date.now(), HOUR = 3600e3;
    let seed = 5; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const snaps = [];
    for (let i = 0; i < 9; i++) { const full = i === 0, changed = full ? files.slice() : files.filter(() => r() < .25); snaps.push({ t: now - (9 - i) * 6 * HOUR, full, changed, mb: full ? 412 : +(changed.length * 1.7 + r() * 4).toFixed(1) }); }
    let pick = snaps.length - 1, busy = false;
    const wrap = el('div', 'bv'), top = el('div', 'bv-top'), run = el('button', 'btn pri bv-run', 'Run incremental backup'); run.type = 'button';
    const meta = el('div', 'bv-meta'); top.append(run, meta);
    const con = el('div', 'bv-con'), conLog = el('div', 'bv-log'), conBar = el('div', 'bv-bar'), conFill = el('i'); conBar.append(conFill); con.append(el('p', 'bv-ch', '$ backupvault snapshot --incremental'), conLog, conBar);
    const tm = el('div', 'bv-tm'), rail = el('div', 'bv-rail'), slider = el('input'); slider.type = 'range'; slider.min = 0; slider.className = 'bv-slider'; slider.setAttribute('aria-label', 'Restore point');
    const tmInfo = el('div', 'bv-tminfo'), restore = el('button', 'btn ghost bv-restore', 'Restore to this point'); restore.type = 'button';
    tm.append(el('p', 'bv-l', 'Restore point'), rail, slider, tmInfo, restore);
    const tree = el('div', 'bv-tree'), fileInfo = el('div', 'bv-file');
    const left = el('div', 'bv-left'); left.append(top, con, tm);
    const right = el('div', 'bv-right'); right.append(el('p', 'bv-l', 'Encrypted archive · AES-256-GCM'), tree, fileInfo);
    wrap.append(left, right); root.append(wrap);
    const fmt = t => new Date(t).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0).toString(16).padStart(8, '0'); };
    function renderRail() {
      rail.replaceChildren(); slider.max = snaps.length - 1; slider.value = pick;
      snaps.forEach((s, i) => { const d = el('button', 'bv-dot' + (s.full ? ' full' : '') + (i === pick ? ' on' : '')); d.type = 'button'; d.style.left = (i / (snaps.length - 1) * 100) + '%'; d.setAttribute('aria-label', `${s.full ? 'Full' : 'Incremental'} snapshot ${fmt(s.t)}`); d.addEventListener('click', () => { pick = i; renderAll(); }); rail.append(d); });
    }
    function renderMeta() {
      const tot = snaps.reduce((a, s) => a + s.mb, 0);
      meta.replaceChildren(); [[snaps.length, 'snapshots'], [`${tot.toFixed(0)} MB`, 'stored'], [fmt(snaps[snaps.length - 1].t), 'last backup']].forEach(([v, l]) => { const d = el('div'); d.append(el('b', null, String(v)), el('span', null, l)); meta.append(d); });
    }
    function renderTree() {
      tree.replaceChildren(); const s = snaps[pick], changedSet = new Set(s.changed);
      const mk = (nodes, pre, depth, parent) => nodes.forEach(([n, kids]) => {
        const p = pre ? pre + '/' + n : n;
        if (kids == null) { file(p, n, depth, parent); return; }
        const det = el('details', 'bv-dir'); det.open = depth < 2; const sum = el('summary'); sum.style.paddingLeft = depth * 14 + 'px'; sum.append(el('span', 'bv-fi', '▸'), document.createTextNode(n + '/'));
        const n2 = files.filter(f => f.startsWith(p + '/') && changedSet.has(f)).length; if (n2 && !s.full) sum.append(el('em', 'bv-badge', `${n2} changed`));
        det.append(sum); parent.append(det);
        if (typeof kids[0] === 'string') kids.forEach(k => file(p + '/' + k, k, depth + 1, det)); else mk(kids, p, depth + 1, det);
      });
      function file(p, n, depth, parent) { const b = el('button', 'bv-f' + (changedSet.has(p) ? (s.full ? ' full' : ' ch') : '')); b.type = 'button'; b.style.paddingLeft = (depth * 14 + 18) + 'px'; b.append(el('span', null, '🔒'), el('span', 'bv-fn', n), el('span', 'bv-fs', changedSet.has(p) ? (s.full ? 'stored' : 'changed') : 'unchanged')); b.addEventListener('click', () => { fileInfo.replaceChildren(el('b', null, p), el('span', null, `sha256 ${hash(p + pick)}…${hash(p)} · chunk ${hash(p).slice(0, 4)} · ${changedSet.has(p) ? 'new blocks in this snapshot' : 'deduplicated from an earlier snapshot'}`)); }); parent.append(b); }
      mk(TREE, '', 0, tree);
    }
    function renderTm() {
      const s = snaps[pick], latest = pick === snaps.length - 1;
      tmInfo.replaceChildren(el('b', null, fmt(s.t)), el('span', null, `${s.full ? 'Full snapshot' : 'Incremental'} · ${s.changed.length} files · ${s.mb} MB${latest ? ' · current' : ''}`));
      restore.disabled = latest; restore.textContent = latest ? 'This is the live site' : `Restore to ${fmt(s.t)}`;
    }
    function renderAll() { renderRail(); renderMeta(); renderTree(); renderTm(); }
    slider.addEventListener('input', () => { pick = +slider.value; renderRail(); renderTree(); renderTm(); });
    const sleep = ms => new Promise(res => setTimeout(res, reduced ? 20 : ms));
    function line(t, cls) { const p = el('p', cls || null, t); conLog.append(p); conLog.scrollTop = conLog.scrollHeight; if (G && !reduced) G.from(p, { x: -8, opacity: 0, duration: .25 }); }
    async function backup() {
      if (busy) return; busy = true; run.disabled = true; conLog.replaceChildren(); conFill.style.width = '0%';
      const changed = files.filter(() => Math.random() < .3); if (!changed.length) changed.push(files[0]);
      const steps = [[`Scanning ${files.length} files and 4 tables…`, 10], [`Diffing against snapshot #${snaps.length}: ${changed.length} files changed`, 25], ['Chunking changed blocks (4 MB, content-defined)…', 45], ['Compressing with zstd level 6 · ratio 3.8×', 60], ['Encrypting with AES-256-GCM · key never leaves this server', 78], ['Uploading to vault eu-west · 3 parallel streams', 92], ['Verifying checksums… ✓ all chunks match', 100]];
      for (const [t, p] of steps) { line(t); if (G && !reduced) G.to(conFill, { width: p + '%', duration: .5, ease: 'power2.out' }); else conFill.style.width = p + '%'; await sleep(520); }
      const mb = +(changed.length * 1.7 + 1.2).toFixed(1); snaps.push({ t: Date.now(), full: false, changed, mb }); pick = snaps.length - 1;
      line(`Snapshot #${snaps.length} sealed · ${mb} MB · ${changed.length} files`, 'ok');
      renderAll(); if (G && !reduced) G.fromTo(rail.lastChild, { scale: 2.4 }, { scale: 1, duration: .8, ease: 'elastic.out(1,.4)' });
      toast('Incremental backup complete and verified.'); busy = false; run.disabled = false;
    }
    run.addEventListener('click', backup);
    restore.addEventListener('click', async () => {
      if (busy || pick === snaps.length - 1) return; busy = true; const s = snaps[pick]; conLog.replaceChildren(); conFill.style.width = '0%';
      for (const [t, p] of [[`Restoring to ${fmt(s.t)}…`, 20], ['Decrypting chunks locally', 50], ['Swapping files atomically · maintenance mode on for 3 s', 85], ['Database rolled back · caches purged', 100]]) { line(t); if (G && !reduced) G.to(conFill, { width: p + '%', duration: .5 }); else conFill.style.width = p + '%'; await sleep(480); }
      line('Site restored. A safety snapshot of the old state was kept.', 'ok'); toast(`Restored to ${fmt(s.t)}. Nothing was lost: we kept a safety snapshot.`); busy = false;
    });
    line('Vault connected · last verify 2 h ago · 0 errors', 'ok'); renderAll();
  }

  demo(document.getElementById('demo'), H);
})();
