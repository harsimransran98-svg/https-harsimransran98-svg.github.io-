/* TableForge — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
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
    if (window.ScrollTrigger) G.from('.wpa', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.wpa', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };

/* ---------- plugin simulator ---------- */
  function demo(root, H) {
    const { el, G, reduced, toast } = H;
    const REG = ['EU-West', 'US-East', 'APAC', 'US-West'], PLAN = ['Starter', 'Growth', 'Scale', 'Enterprise'];
    let seed = 21; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    let cols = ['Plan', 'Region', 'Seats', 'Storage (GB)', 'Price / mo', 'Uptime %'];
    let data = Array.from({ length: 42 }, (_, i) => { const p = i % 4; return [PLAN[p], REG[Math.floor(r() * 4)], [5, 25, 100, 500][p] + Math.floor(r() * 5) * (p + 1), [50, 250, 1000, 5000][p], +([19, 59, 199, 899][p] * (0.9 + r() * .3)).toFixed(2), +(99.5 + r() * .49 + p * .002).toFixed(3)]; });
    const S = { sort: 4, dir: 1, q: '', page: 0, size: 8, view: 'table', best: true };
    const wrap = el('div', 'tf'), bar = el('div', 'tf-bar'), q = el('input', 'tf-q'); q.type = 'search'; q.placeholder = 'Search all columns…'; q.maxLength = 60; q.setAttribute('aria-label', 'Search the table');
    q.addEventListener('input', () => { S.q = q.value.toLowerCase(); S.page = 0; render(); });
    const size = el('select', 'tf-sel'); size.setAttribute('aria-label', 'Rows per page'); [5, 8, 15, 30].forEach(n => { const o = el('option', null, `${n} / page`); o.value = n; o.selected = n === S.size; size.append(o); }); size.addEventListener('change', () => { S.size = +size.value; S.page = 0; render(); });
    const vw = el('div', 'tf-seg'); [['table', 'Table'], ['cards', 'Mobile cards']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.setAttribute('aria-pressed', String(S.view === k)); b.addEventListener('click', () => { S.view = k; vw.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); render(true); }); vw.append(b); });
    const best = el('button', 'tf-chip', '★ Highlight best value'); best.type = 'button'; best.setAttribute('aria-pressed', 'true'); best.addEventListener('click', () => { S.best = !S.best; best.setAttribute('aria-pressed', String(S.best)); render(); });
    bar.append(q, size, vw, best);
    const out = el('div', 'tf-out'), pager = el('div', 'tf-pager'), count = el('span', 'tf-count');
    const imp = el('div', 'tf-imp'), ta = el('textarea', 'tf-ta'); ta.rows = 6; ta.maxLength = 20000; ta.spellcheck = false; ta.setAttribute('aria-label', 'CSV or JSON to import');
    ta.value = 'Plan,Region,Seats,Storage (GB),Price / mo,Uptime %\nHobby,EU-West,1,10,0,99.5\nTeam,US-East,10,200,49,99.9\n"Pro, annual",APAC,50,800,149,99.95';
    const fmtSeg = el('div', 'tf-seg'); let fmt = 'csv'; [['csv', 'CSV'], ['json', 'JSON']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.setAttribute('aria-pressed', String(k === fmt)); b.addEventListener('click', () => { fmt = k; fmtSeg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); ta.value = k === 'json' ? JSON.stringify([{ Plan: 'Hobby', Region: 'EU-West', Seats: 1, 'Storage (GB)': 10, 'Price / mo': 0, 'Uptime %': 99.5 }, { Plan: 'Team', Region: 'US-East', Seats: 10, 'Storage (GB)': 200, 'Price / mo': 49, 'Uptime %': 99.9 }], null, 2) : 'Plan,Region,Seats,Storage (GB),Price / mo,Uptime %\nHobby,EU-West,1,10,0,99.5\nTeam,US-East,10,200,49,99.9'; preview(); }); fmtSeg.append(b); });
    const pv = el('div', 'tf-pv'), doImp = el('button', 'btn pri', 'Import into table'); doImp.type = 'button'; const reset = el('button', 'tf-reset', 'Restore sample data'); reset.type = 'button';
    const actions = el('div', 'tf-acts'); actions.append(doImp, reset);
    imp.append(el('p', 'tf-l', 'Import CSV or JSON'), fmtSeg, ta, pv, actions);
    const left = el('div', 'tf-left'); left.append(bar, out, pager);
    wrap.append(left, imp); root.append(wrap);
    const ORIG = { cols: cols.slice(), data: data.map(r2 => r2.slice()) };
    const num = v => typeof v === 'number' ? v : (v !== '' && !isNaN(+v) ? +v : null);
    function filtered() { let rows = data.filter(r2 => !S.q || r2.some(v => String(v).toLowerCase().includes(S.q))); if (S.sort != null && S.sort < cols.length) rows = rows.slice().sort((a, b) => { const x = a[S.sort], y = b[S.sort], nx = num(x), ny = num(y); return (nx != null && ny != null ? nx - ny : String(x).localeCompare(String(y))) * S.dir; }); return rows; }
    function bestIdx(rows) { const pi = cols.findIndex(c => /price/i.test(c)), si = cols.findIndex(c => /storage/i.test(c)); if (pi < 0 || si < 0) return -1; let bi = -1, bv = Infinity; rows.forEach((r2, i) => { const p = num(r2[pi]), s = num(r2[si]); if (p > 0 && s > 0 && p / s < bv) { bv = p / s; bi = i; } }); return bi; }
    function hl(parent, text) { const s = String(text); if (!S.q) { parent.append(s); return; } const i = s.toLowerCase().indexOf(S.q); if (i < 0) { parent.append(s); return; } parent.append(s.slice(0, i), el('mark', null, s.slice(i, i + S.q.length)), s.slice(i + S.q.length)); }
    function render(anim) {
      const rows = filtered(), pages = Math.max(1, Math.ceil(rows.length / S.size)); S.page = Math.min(S.page, pages - 1);
      const slice = rows.slice(S.page * S.size, S.page * S.size + S.size), bi = S.best ? bestIdx(rows) : -1, bestRow = bi >= 0 ? rows[bi] : null;
      out.replaceChildren(); out.className = 'tf-out ' + S.view;
      if (S.view === 'table') {
        const t = el('table', 'tf-t'), th = el('thead'), tr = el('tr');
        cols.forEach((c, i) => { const h = el('th'); h.setAttribute('aria-sort', S.sort === i ? (S.dir > 0 ? 'ascending' : 'descending') : 'none'); const b = el('button', null, c); b.type = 'button'; b.append(el('i', null, S.sort === i ? (S.dir > 0 ? ' ▲' : ' ▼') : ' ⇅')); b.addEventListener('click', () => { if (S.sort === i) S.dir *= -1; else { S.sort = i; S.dir = 1; } render(); }); h.append(b); tr.append(h); });
        th.append(tr); t.append(th); const tb = el('tbody');
        slice.forEach(r2 => { const row = el('tr', r2 === bestRow ? 'best' : null); r2.forEach((v, i) => { const td = el('td', num(v) != null ? 'n' : null); hl(td, /price/i.test(cols[i]) && num(v) != null ? '$' + num(v).toFixed(2) : v); row.append(td); }); tb.append(row); });
        if (!slice.length) { const row = el('tr'), td = el('td', 'tf-none', 'No rows match your search.'); td.colSpan = cols.length; row.append(td); tb.append(row); }
        t.append(tb); out.append(t);
      } else {
        slice.forEach(r2 => { const c = el('article', 'tf-card' + (r2 === bestRow ? ' best' : '')); c.append(el('b', null, String(r2[0]))); const dl = el('dl'); cols.slice(1).forEach((h, i) => { const d = el('div'); const dd = el('dd'); hl(dd, /price/i.test(h) && num(r2[i + 1]) != null ? '$' + num(r2[i + 1]).toFixed(2) : r2[i + 1]); d.append(el('dt', null, h), dd); dl.append(d); }); c.append(dl); out.append(c); });
        if (!slice.length) out.append(el('p', 'tf-none', 'No rows match your search.'));
      }
      pager.replaceChildren(); const pv2 = el('button', 'tf-pg', '‹'); pv2.type = 'button'; pv2.disabled = S.page === 0; pv2.setAttribute('aria-label', 'Previous page'); pv2.addEventListener('click', () => { S.page--; render(true); }); pager.append(pv2);
      for (let i = 0; i < pages; i++) { if (pages > 7 && i > 1 && i < pages - 2 && Math.abs(i - S.page) > 1) { if (!pager.lastChild.classList.contains('dots')) pager.append(el('span', 'tf-pg dots', '…')); continue; } const b = el('button', 'tf-pg', String(i + 1)); b.type = 'button'; b.setAttribute('aria-current', String(i === S.page)); b.addEventListener('click', () => { S.page = i; render(true); }); pager.append(b); }
      const nx = el('button', 'tf-pg', '›'); nx.type = 'button'; nx.disabled = S.page >= pages - 1; nx.setAttribute('aria-label', 'Next page'); nx.addEventListener('click', () => { S.page++; render(true); }); pager.append(nx);
      count.textContent = `${rows.length} of ${data.length} rows`; pager.append(count);
      if (anim && G && !reduced) G.from(out.querySelectorAll('tbody tr, .tf-card'), { y: 8, opacity: 0, duration: .3, stagger: .02 });
    }
    function parseCSV(t) {
      const rows = []; let row = [], cur = '', q2 = false;
      for (let i = 0; i < t.length; i++) { const ch = t[i]; if (q2) { if (ch === '"' && t[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') q2 = false; else cur += ch; } else if (ch === '"') q2 = true; else if (ch === ',') { row.push(cur); cur = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; } else cur += ch; }
      if (cur || row.length) { row.push(cur); rows.push(row); }
      return rows.filter(r2 => r2.some(c => c.trim() !== ''));
    }
    let parsed = null;
    function preview() {
      pv.replaceChildren(); parsed = null; const t = ta.value.trim(); if (!t) { pv.append(el('p', 'tf-err', 'Paste some data first.')); return; }
      try {
        let head, body;
        if (fmt === 'json') { const j = JSON.parse(t); if (!Array.isArray(j) || !j.length || typeof j[0] !== 'object') throw new Error('Expected an array of objects.'); head = Object.keys(j[0]); body = j.map(o => head.map(k => o[k] ?? '')); }
        else { const rows = parseCSV(t); if (rows.length < 2) throw new Error('Need a header row and at least one data row.'); head = rows[0].map(h => h.trim()); body = rows.slice(1); const bad = body.findIndex(r2 => r2.length !== head.length); if (bad >= 0) throw new Error(`Row ${bad + 2} has ${body[bad].length} values, expected ${head.length}.`); }
        if (head.length > 12 || body.length > 500) throw new Error('Demo limit: 12 columns, 500 rows.');
        body = body.map(r2 => r2.map(v => { const n = num(typeof v === 'string' ? v.trim() : v); return n != null ? n : String(v).trim(); }));
        parsed = { head, body };
        const types = head.map((_, i) => body.every(r2 => typeof r2[i] === 'number') ? 'number' : 'text');
        pv.append(el('p', 'tf-ok', `✓ ${body.length} rows · ${head.length} columns detected`)); const chips = el('div', 'tf-types'); head.forEach((h, i) => chips.append(el('span', types[i], `${h} · ${types[i]}`))); pv.append(chips);
      } catch (e) { pv.append(el('p', 'tf-err', '✗ ' + String(e.message).slice(0, 120))); }
    }
    ta.addEventListener('input', preview);
    doImp.addEventListener('click', () => { if (!parsed) { toast('Fix the import errors first.'); return; } cols = parsed.head; data = parsed.body; S.sort = null; S.page = 0; S.q = ''; q.value = ''; render(true); toast(`Imported ${data.length} rows. Sorting and search work on your columns now.`); });
    reset.addEventListener('click', () => { cols = ORIG.cols.slice(); data = ORIG.data.map(r2 => r2.slice()); S.sort = 4; S.dir = 1; S.page = 0; render(true); });
    render(false); preview();
  }

  demo(document.getElementById('demo'), H);
})();
