/* DiskSweep — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} } };
  let ac = null;
  const tone = (f = 440, d = .1, type = 'sine', v = .04) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d); o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d + .02); } catch (_) {} };
  const haptic = (p = 8) => { try { navigator.vibrate && navigator.vibrate(p); } catch (_) {} };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- fit the device to the space ---------- */
  const stage = $('#stage'), desk = $('#desk'), device = $('#device');
  function fit() {
    const vw = document.documentElement.clientWidth;
    if (desk) { const w = stage.clientWidth || vw - 32; stage.style.setProperty('--s', Math.min(1, w / 1200).toFixed(4)); return; }
    const W = device.offsetWidth, Hh = device.offsetHeight, wide = vw > 1180;
    stage.style.setProperty('--s', Math.max(.55, Math.min(1, wide ? (window.innerHeight - 110) / Hh : 1, (vw - 32) / W)).toFixed(3));
  }
  window.addEventListener('resize', fit); fit();
  const tick = () => { const d = new Date(); $$('[data-clock]').forEach(n => { n.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }); $$('[data-date]').forEach(n => { n.textContent = d.toLocaleDateString(); }); };
  tick(); setInterval(tick, 15000);

  /* ---------- try-it checklist (list, callouts or chips depending on layout) ---------- */
  const done = new Set(), total = $$('#tryList [data-t]').length;
  function check(k) {
    if (done.has(k)) return; done.add(k);
    $$('[data-t="' + k + '"]').forEach(n => n.classList.add('done'));
    const c = $('#tryCount'), b = $('#tryBar'); if (c) c.textContent = done.size + '/' + total; if (b) b.style.width = (done.size / total * 100) + '%';
    if (done.size === total) toastx('All done. That is the whole app in a minute.');
  }
  const snack = $('#snack');
  function say(msg) {
    if (!snack) return; snack.textContent = msg;
    if (G) { G.killTweensOf(snack); G.fromTo(snack, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: 'back.out(1.6)' }); G.to(snack, { y: 12, opacity: 0, duration: .3, delay: 2.3 }); }
    else { snack.style.opacity = 1; clearTimeout(say.t); say.t = setTimeout(() => { snack.style.opacity = 0; }, 2500); }
  }
  let tt = 0; function toastx(msg) { const t = $('#toastx'); t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => { t.hidden = true; }, 2800); }

  const H = { el, svgEl, G, reduced, store, tone, haptic, check, say, toast: say, $, $$, app: $('#app'), screen: $('#screen'), desk, win: $('#win'), tools: $('#tools'), extra: $('#menuExtra'), jump: null };

  /* ---------- jump buttons + chapters ---------- */
  $$('[data-jump]').forEach(b => b.addEventListener('click', () => {
    if (document.documentElement.clientWidth <= 1180 && !b.closest('.ch')) stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    if (H.jump) H.jump(b.dataset.jump);
  }));
  H.boot = () => {
    if (window.ScrollTrigger && window.gsap) { gsap.registerPlugin(ScrollTrigger);
      $$('.ch').forEach(ch => ScrollTrigger.create({ trigger: ch, start: 'top 55%', end: 'bottom 45%', onToggle: st => { ch.classList.toggle('on', st.isActive); if (st.isActive && H.jump) H.jump(ch.dataset.ch, true); } }));
      if (!reduced && $('.po-dev')) { const mm = gsap.matchMedia(); mm.add('(min-width: 1181px)', () => { gsap.to('.po-dev', { rotate: 2, y: -40, ease: 'none', scrollTrigger: { trigger: '.po-grid', start: 'top 80%', end: 'bottom top', scrub: 1 } }); }); }
    }
    if (G) {
      G.from(device || $('.desk-wrap'), { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' });
      G.from('#h1', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', delay: .1 });
      G.from('.lede, .try, .kick, .call, .spec, .metrics, .jump, .cta, .dk-chips, .po-steps', { y: 24, opacity: 0, duration: .9, stagger: .05, ease: 'expo.out', delay: .25 });
    }
  };

  H.layout = "desk";
/* ---------- DiskSweep ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say, win, tools } = H;
    const CAP = 494.4, CAT = { apps: ['#3E8EF7', 'Apps'], docs: ['#6E56CF', 'Documents'], media: ['#E5484D', 'Photos & video'], dev: ['#F2994A', 'Developer'], cache: ['#12A594', 'Caches'], dl: ['#D6409F', 'Downloads'], sys: ['#8E8AA3', 'System'], other: ['#B7B2C9', 'Other'] };
    const F = (name, gb, cat, kids, extra) => Object.assign({ name, gb, cat, kids: kids || null }, extra || {});
    const dl = [['macOS-Installer-14.6.dmg', 13.1], ['Xcode_15.4.xip', 7.9], ['Figma-Desktop.dmg', .4], ['wedding-photos.zip', 6.2], ['Final_cut_v3_EXPORT.mov', 8.4], ['zoom-recording-0412.mp4', 1.3], ['dataset_2023.csv', 0.9]].map(([n, g]) => F(n, g, 'dl', null, { old: n.match(/dmg|xip|zip/) ? 1 : 0 }));
    const tree = F('Macintosh HD', 0, 'other', [
      F('Users/alex', 0, 'docs', [
        F('Library', 0, 'cache', [F('Caches', 18.4, 'cache', [F('com.google.Chrome', 6.1, 'cache'), F('com.spotify.client', 4.8, 'cache'), F('Homebrew', 3.9, 'cache'), F('com.apple.Safari', 1.6, 'cache'), F('Yarn', 2.0, 'cache')]), F('Developer', 0, 'dev', [F('Xcode/DerivedData', 31.2, 'dev', null, { junk: 1 }), F('CoreSimulator', 22.6, 'dev', null, { junk: 1 }), F('Xcode/Archives', 6.4, 'dev')]), F('Containers', 14.1, 'apps'), F('Mail', 5.3, 'docs')]),
        F('Pictures', 0, 'media', [F('Photos Library.photoslibrary', 71.4, 'media'), F('Screenshots', 3.2, 'media')]), F('Movies', 0, 'media', [F('Trip to Lisbon 4K', 38.0, 'media'), F('Final_cut_v3_EXPORT.mov', 8.4, 'media', null, { dupe: 1 }), F('Screen recordings', 6.1, 'media')]),
        F('Downloads', 0, 'dl', dl), F('Documents', 0, 'docs', [F('Clients', 9.4, 'docs'), F('Taxes', 1.1, 'docs'), F('wedding-photos.zip', 6.2, 'docs', null, { dupe: 1 }), F('Notes & PDFs', 3.3, 'docs')]), F('Music', 9.6, 'media'), F('.docker', 0, 'dev', [F('Docker.raw', 24.0, 'dev')])]),
      F('Applications', 0, 'apps', [F('Xcode.app', 12.8, 'apps'), F('Final Cut Pro.app', 6.9, 'apps'), F('Logic Pro.app', 5.4, 'apps'), F('Other apps', 16.2, 'apps')]), F('System', 0, 'sys', [F('macOS (sealed)', 28.4, 'sys', null, { lock: 1 })]), F('Purgeable & other', 11.8, 'other', null, { lock: 1 })]);
    const sum = n => n.kids ? (n.gb = n.kids.reduce((a, k) => a + sum(k), 0)) : n.gb; sum(tree); const par = new Map(); (function link(n) { (n.kids || []).forEach(k => { par.set(k, n); link(k); }); })(tree);
    const path = n => { const p = []; while (n) { p.unshift(n); n = par.get(n); } return p; }, gbs = g => g >= 10 ? g.toFixed(0) + ' GB' : g >= 1 ? g.toFixed(1) + ' GB' : Math.round(g * 1000) + ' MB';
    const leaves = (n, out) => { out = out || []; if (n.kids) n.kids.forEach(k => leaves(k, out)); else out.push(n); return out; };
    let scanned = false, cur = tree, sel = null, marked = new Set();
    /* ---- squarified treemap ---- */
    function squarify(items, x, y, w, h) { const out = [], tot = items.reduce((a, b) => a + b.v, 0); if (!tot) return out; const sc = w * h / tot; let rest = items.map(i => ({ ...i, a: i.v * sc }));
      const worst = (row, len) => { const s2 = row.reduce((a, b) => a + b.a, 0), mx = Math.max(...row.map(r => r.a)), mn = Math.min(...row.map(r => r.a)); return Math.max(len * len * mx / (s2 * s2), s2 * s2 / (len * len * mn)); };
      while (rest.length) { const len = Math.min(w, h); let row = [rest[0]], i = 1; while (i < rest.length && worst(row.concat(rest[i]), len) <= worst(row, len)) { row.push(rest[i]); i++; }
        const s2 = row.reduce((a, b) => a + b.a, 0); if (w >= h) { const cw = s2 / h; let yy = y; row.forEach(r => { const rh = r.a / cw; out.push({ ...r, x, y: yy, w: cw, h: rh }); yy += rh; }); x += cw; w -= cw; } else { const ch = s2 / w; let xx = x; row.forEach(r => { const rw = r.a / ch; out.push({ ...r, x: xx, y, w: rw, h: ch }); xx += rw; }); y += ch; h -= ch; } rest = rest.slice(i); } return out; }
    /* ---- UI ---- */
    const root = el('div', 'ds'), top = el('div', 'ds-top'), th = el('header'), tB = el('b'), tS = el('span'), sb = el('div', 'ds-sb'), lg = el('div', 'ds-lg'); th.append(tB, tS); top.append(th, sb, lg);
    const body = el('div', 'ds-body'), mw = el('div', 'ds-mapw'), bc = el('nav', 'ds-bc'), map = el('div', 'ds-map'), ins = el('aside', 'ds-in'); bc.setAttribute('aria-label', 'Folder path'); map.setAttribute('role', 'group'); map.setAttribute('aria-label', 'Disk treemap'); mw.append(bc, map); body.append(mw, ins); root.append(top, body); app.append(root);
    const tb = el('div', 'ds-tb'), rs = el('button', null, '↻ Rescan'), db = el('button', null, '⧉ Duplicates'), cb = el('button', 'pri', 'Clean up'); [rs, db, cb].forEach(b => { b.type = 'button'; }); tb.append(rs, db, cb); tools.append(tb);
    const used = () => tree.gb, free = () => CAP - used();
    function paintTop() { tB.textContent = gbs(free()) + ' available'; tS.textContent = gbs(used()) + ' used of ' + CAP.toFixed(0) + ' GB'; sb.textContent = ''; lg.textContent = ''; const byCat = {}; leaves(tree).forEach(l => { byCat[l.cat] = (byCat[l.cat] || 0) + l.gb; });
      Object.keys(CAT).forEach(k => { if (!byCat[k]) return; const i = el('i'); i.style.flexGrow = byCat[k]; i.style.setProperty('--c', CAT[k][0]); i.title = CAT[k][1] + ' ' + gbs(byCat[k]); sb.append(i); const sp = el('span', null, CAT[k][1] + ' ' + gbs(byCat[k])); sp.style.setProperty('--c', CAT[k][0]); lg.append(sp); }); const fr = el('i'); fr.style.flexGrow = free(); fr.style.setProperty('--c', 'transparent'); sb.append(fr); }
    function paintBC() { bc.textContent = ''; path(cur).forEach((n, i, a) => { if (i) bc.append(el('em', null, '›')); const b = el('button', null, n.name); b.type = 'button'; b.addEventListener('click', () => { cur = n; sel = null; paintMap(); paintIns(); }); bc.append(b); }); }
    function paintMap(grow) { map.textContent = ''; paintBC(); if (!scanned) return; const W = map.clientWidth || 760, Hh = map.clientHeight || 420, items = cur.kids.filter(k => k.gb > .05).map(k => ({ n: k, v: k.gb })).sort((a, b) => b.v - a.v);
      squarify(items, 0, 0, W, Hh).forEach((r, i) => { const n = r.n, b = el('button', 'ds-r'); b.type = 'button'; b.style.cssText = 'left:' + (r.x + 1.5) + 'px;top:' + (r.y + 1.5) + 'px;width:' + Math.max(0, r.w - 3) + 'px;height:' + Math.max(0, r.h - 3) + 'px'; b.style.setProperty('--c', CAT[n.cat][0]);
        if (r.w > 60 && r.h > 34) b.append(el('b', null, n.name), el('small', null, gbs(n.gb) + (n.kids ? ' · ' + n.kids.length + ' items' : ''))); b.setAttribute('aria-label', n.name + ', ' + gbs(n.gb) + (n.kids ? ', folder' : '') + (n.lock ? ', protected' : ''));
        const mk = n.kids ? leaves(n).every(l => marked.has(l)) : marked.has(n); b.classList.toggle('mk', mk); b.classList.toggle('sel', n === sel); b.classList.toggle('lock', !!n.lock);
        b.addEventListener('click', () => { sel = n; paintIns(); map.querySelectorAll('.ds-r').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); tone(500 + Math.min(600, n.gb * 8), .015); });
        b.addEventListener('dblclick', () => { if (n.kids) { cur = n; sel = null; check('drill'); paintMap(true); paintIns(); tone(700, .03); } });
        b.addEventListener('keydown', e => { if (e.key === 'Enter' && n.kids) { e.preventDefault(); cur = n; sel = null; check('drill'); paintMap(true); paintIns(); } });
        map.append(b); if (grow && G && !reduced) G.from(b, { scale: .6, opacity: 0, duration: .45, delay: i * .025, ease: 'back.out(1.6)' }); }); }
    const markedGb = () => [...marked].reduce((a, l) => a + l.gb, 0);
    function toggleMark(n) { if (n.lock) return; const ls = n.kids ? leaves(n) : [n], all = ls.every(l => marked.has(l)); ls.forEach(l => { if (all) marked.delete(l); else if (!l.lock) marked.add(l); }); if (!all) check('select'); tone(all ? 420 : 760, .03); haptic(4); paintMap(); paintIns(); }
    const SUG = () => [['Xcode DerivedData', leaves(tree).filter(l => l.name === 'Xcode/DerivedData')], ['Old simulators', leaves(tree).filter(l => l.name === 'CoreSimulator')], ['App caches', leaves(tree).filter(l => par.get(l) && par.get(l).name === 'Caches')], ['Installers in Downloads', leaves(tree).filter(l => l.old)]].filter(([, ls]) => ls.length);
    function paintIns() { ins.textContent = ''; const c1 = el('div', 'ds-cd'), h4 = el('h4'); h4.append(el('span', null, sel ? (sel.kids ? 'Folder' : 'File') : 'Selection')); c1.append(h4);
      if (!sel) c1.append(el('p', 'pt', scanned ? 'Click a block to inspect it. Double-click a folder to open it.' : 'Scan the disk to start.'));
      else { c1.append(el('p', 'nm', sel.name), el('p', 'pt', '/' + path(sel).slice(1).map(n => n.name).join('/'))); const kv = (k, v) => { const r = el('div', 'kv'); r.append(el('span', null, k), el('b', null, v)); c1.append(r); }; kv('Size', gbs(sel.gb)); kv('Share of disk', (sel.gb / used() * 100).toFixed(1) + '%'); kv('Kind', CAT[sel.cat][1]); if (sel.kids) kv('Items', String(leaves(sel).length));
        const all = (sel.kids ? leaves(sel) : [sel]).every(l => marked.has(l)), mb = el('button', 'ds-mkb' + (all ? ' on' : ''), sel.lock ? 'Protected by macOS' : all ? 'Marked for Trash ✓' : 'Mark for Trash'); mb.type = 'button'; mb.disabled = !!sel.lock; mb.addEventListener('click', () => toggleMark(sel)); c1.append(mb); }
      ins.append(c1); if (!scanned) return;
      const c2 = el('div', 'ds-cd'), h2 = el('h4'); h2.append(el('span', null, 'Smart suggestions'), el('span', null, 'safe')); c2.append(h2); SUG().forEach(([lab, ls]) => { const r = el('label', 'ds-sg'), cbx = el('input'), g = ls.reduce((a, l) => a + l.gb, 0); cbx.type = 'checkbox'; cbx.checked = ls.every(l => marked.has(l)); cbx.addEventListener('change', () => { ls.forEach(l => cbx.checked ? marked.add(l) : marked.delete(l)); if (cbx.checked) check('select'); paintMap(); paintIns(); tone(cbx.checked ? 760 : 420, .02); }); r.append(cbx, el('span', null, lab), el('em', null, gbs(g))); c2.append(r); }); ins.append(c2);
      const c3 = el('div', 'ds-cd'), h3 = el('h4'); h3.append(el('span', null, 'Marked'), el('span', null, marked.size + (marked.size === 1 ? ' item' : ' items'))); const big = el('p', 'nm', gbs(markedGb())); c3.append(h3, big); const cl = el('button', 'ds-cl', 'Move to Trash & empty'); cl.type = 'button'; cl.disabled = !marked.size; cl.addEventListener('click', clean); c3.append(cl); ins.append(c3); cb.disabled = !marked.size; }
    /* ---- scan ---- */
    function scanOverlay() { const ov = el('div', 'ds-scan'), inner = el('div'), b = el('b', null, 'Ready to scan'), sp = el('span', null, 'Macintosh HD · APFS · ' + CAP.toFixed(0) + ' GB'), pb = el('div', 'pb'), pi = el('i'), go = el('button', null, 'Scan disk'); go.type = 'button'; pb.append(pi); inner.append(b, sp, pb, go); ov.append(inner); map.append(ov);
      go.addEventListener('click', () => { go.remove(); let n = 0; const tot = 2143870, t0 = performance.now(); const t = setInterval(() => { const p = Math.min(1, (performance.now() - t0) / (reduced ? 400 : 2400)); n = Math.round(tot * p * (2 - p)); pi.style.width = (p * 100) + '%'; b.textContent = n.toLocaleString('en-GB') + ' files'; sp.textContent = 'Scanning ' + ['~/Library/Caches', '~/Movies', '/Applications', '~/Library/Developer', '~/Downloads', '~/.docker'][Math.floor(p * 5.99)] + '…'; if (p % .2 < .05) tone(300 + p * 600, .008, 'square', .01);
        if (p >= 1) { clearInterval(t); scanned = true; check('scan'); tone(880, .05); setTimeout(() => tone(1320, .07), 90); say('Scan done · ' + gbs(used()) + ' mapped in 2.4 s'); paintTop(); paintMap(true); paintIns(); } }, 40); }); }
    rs.addEventListener('click', () => { scanned = false; cur = tree; sel = null; paintMap(); paintIns(); scanOverlay(); });
    /* ---- duplicates ---- */
    let dp = null; function dupes() { if (!scanned) { say('Scan the disk first'); return; } if (dp) return; check('dupes'); dp = el('div', 'ds-dp'); const h3 = el('h3', null, 'Duplicate files'), x = el('button', null, 'Done'); x.type = 'button'; x.addEventListener('click', () => { dp.remove(); dp = null; }); h3.append(x);
      const groups = [['Final_cut_v3_EXPORT.mov', 8.4, ['~/Downloads/Final_cut_v3_EXPORT.mov', '~/Movies/Final_cut_v3_EXPORT.mov']], ['wedding-photos.zip', 6.2, ['~/Downloads/wedding-photos.zip', '~/Documents/wedding-photos.zip']]];
      dp.append(h3, el('p', null, '2 groups · same size, then matching SHA-256 · keep the newest copy, Trash the rest'));
      groups.forEach(([n, g, paths]) => { const d = el('div', 'ds-dg'), hd = el('header'); hd.append(el('span', null, n), el('span', null, gbs(g) + ' × ' + paths.length)); d.append(hd); paths.forEach((p, i) => { const lb = el('label', i ? null : 'keep'), cbx = el('input'); cbx.type = 'checkbox'; const leaf = leaves(tree).find(l => l.name === n && (p.includes('Downloads') ? par.get(l).name === 'Downloads' : par.get(l).name !== 'Downloads'));
        cbx.checked = i > 0 && leaf && marked.has(leaf); cbx.disabled = i === 0; cbx.addEventListener('change', () => { if (leaf) { cbx.checked ? marked.add(leaf) : marked.delete(leaf); if (cbx.checked) check('select'); paintMap(); paintIns(); } }); lb.append(cbx, document.createTextNode(p + (i ? '' : '  (keep, newest)'))); d.append(lb); }); dp.append(d); });
      const all = el('button', 'ds-cl', 'Mark all extra copies'); all.type = 'button'; all.addEventListener('click', () => { dp.querySelectorAll('input:not(:disabled)').forEach(c => { if (!c.checked) { c.checked = true; c.dispatchEvent(new Event('change')); } }); say('Extra copies marked · ' + gbs(14.6)); }); dp.append(all); body.append(dp); if (G && !reduced) G.from(dp, { y: -14, opacity: 0, duration: .3, ease: 'expo.out' }); }
    db.addEventListener('click', dupes);
    /* ---- cleanup ---- */
    function clean() { if (!marked.size) return; if (dp) { dp.remove(); dp = null; } const g = markedGb(), list = [...marked]; map.querySelectorAll('.ds-r.mk').forEach(r => { if (G && !reduced) G.to(r, { scale: .2, opacity: 0, duration: .4, ease: 'power2.in' }); });
      setTimeout(() => { list.forEach(l => { const p = par.get(l); if (p) p.kids = p.kids.filter(k => k !== l); }); const prune = n => { if (n.kids) { n.kids.forEach(prune); n.kids = n.kids.filter(k => !k.kids || k.kids.length); } }; prune(tree); sum(tree); marked.clear(); while (cur !== tree && (!cur.kids || !cur.kids.length || !par.get(cur))) cur = par.get(cur) || tree; if (cur.kids && !cur.kids.length) cur = tree;
        sel = null; check('clean'); tone(523, .06); setTimeout(() => tone(784, .08), 100); setTimeout(() => tone(1046, .1), 200); haptic(20); say('Freed ' + gbs(g) + ' · ' + gbs(free()) + ' now available'); paintTop(); paintMap(true); paintIns(); }, reduced ? 0 : 420); }
    cb.addEventListener('click', clean);
    H.jump = (k, fs) => { if (fs) return; if (k === 'map') { if (!scanned) { const g = map.querySelector('.ds-scan button'); if (g) g.click(); } } else if (k === 'dupes') dupes(); else if (k === 'clean') { if (!scanned) { say('Scan the disk first'); return; } if (!marked.size) { SUG().slice(0, 2).forEach(([, ls]) => ls.forEach(l => marked.add(l))); check('select'); paintMap(); paintIns(); say('Marked the safe suggestions · press Move to Trash'); } else clean(); } };
    paintTop(); tB.textContent = 'Not scanned yet'; tS.textContent = CAP.toFixed(0) + ' GB disk'; sb.textContent = ''; lg.textContent = ''; paintMap(); paintIns(); scanOverlay();
    new ResizeObserver(() => { if (scanned) paintMap(); }).observe(map);
  }
  demo(H.app, H);
  H.boot();
})();
