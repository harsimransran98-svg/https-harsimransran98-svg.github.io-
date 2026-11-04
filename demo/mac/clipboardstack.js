/* ClipboardStack — macOS desktop simulator (Bazozo Studio). All output is written with textContent. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- scale the 1200×720 desktop to the page ---------- */
  const wrap = $('#deskWrap'), desk = $('#desk');
  let S = 1;
  function fit() { S = Math.max(.5, Math.min(1, wrap.clientWidth / 1200)); wrap.style.setProperty('--s', S.toFixed(4)); }
  window.addEventListener('resize', fit); fit();
  const toDesk = (cx, cy) => { const r = desk.getBoundingClientRect(); return [(cx - r.left) / S, (cy - r.top) / S]; };
  const tick = () => { const d = new Date(); $('#clock').textContent = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + '  ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  tick(); setInterval(tick, 10000);

  /* ---------- checklist ---------- */
  const done = new Set();
  function check(k) { if (done.has(k)) return; done.add(k); const c = $(`#tryList [data-t="${k}"]`); if (c) { c.classList.add('done'); if (G) G.fromTo(c, { scale: .9 }, { scale: 1, duration: .5, ease: 'back.out(3)' }); } $('#tryCount').textContent = `${done.size}/5`; }

  /* ---------- notification banner ---------- */
  const notif = $('#notif');
  let nTimer = null;
  function notify(t, s) {
    $('#nT').textContent = t; $('#nS').textContent = s; notif.hidden = false; clearTimeout(nTimer);
    if (G) G.fromTo(notif, { x: 360 }, { x: 0, duration: .5, ease: 'expo.out' });
    nTimer = setTimeout(() => { if (G) G.to(notif, { x: 360, duration: .35, ease: 'power3.in', onComplete: () => { notif.hidden = true; } }); else notif.hidden = true; }, 2600);
  }

  /* ---------- converters ---------- */
  const toYaml = (v, ind = '') => {
    if (v === null) return 'null';
    if (Array.isArray(v)) return v.length ? v.map(x => (typeof x === 'object' && x !== null) ? `${ind}- ${toYaml(x, ind + '  ').trimStart()}` : `${ind}- ${toYaml(x, ind)}`).join('\n') : '[]';
    if (typeof v === 'object') return Object.entries(v).map(([k, x]) => (typeof x === 'object' && x !== null && Object.keys(x).length) ? `${ind}${k}:\n${toYaml(x, ind + '  ')}` : `${ind}${k}: ${toYaml(x, ind)}`).join('\n') || '{}';
    if (typeof v === 'string') return /^[\w .\-/@]+$/.test(v) && !/^(true|false|null|\d.*)$/.test(v) ? v : JSON.stringify(v);
    return String(v);
  };
  const csvToJson = s => {
    const rows = s.trim().split(/\r?\n/).map(r => r.split(',').map(c => c.trim()));
    if (rows.length < 2) throw new Error('Need a header row and at least one data row');
    const [h, ...rest] = rows;
    return JSON.stringify(rest.map(r => Object.fromEntries(h.map((k, i) => { const v = r[i] ?? ''; return [k, v !== '' && !isNaN(v) ? Number(v) : v]; }))), null, 2);
  };
  const b64e = s => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
  const b64d = s => new TextDecoder().decode(Uint8Array.from(atob(s.trim()), c => c.charCodeAt(0)));
  const TRANSFORMS = {
    format: { name: 'Format JSON', ic: '{}', fn: s => JSON.stringify(JSON.parse(s), null, 2), kind: 'code' },
    minify: { name: 'Minify JSON', ic: '{}', fn: s => JSON.stringify(JSON.parse(s)), kind: 'code' },
    yaml: { name: 'JSON → YAML', ic: 'YA', fn: s => toYaml(JSON.parse(s)), kind: 'code' },
    csv: { name: 'CSV → JSON', ic: 'CS', fn: csvToJson, kind: 'code' },
    b64e: { name: 'Base64 encode', ic: '64', fn: b64e, kind: 'code' },
    b64d: { name: 'Base64 decode', ic: '64', fn: b64d, kind: 'text' },
    url: { name: 'URL encode', ic: '%', fn: s => encodeURIComponent(s), kind: 'link' },
    upper: { name: 'UPPERCASE', ic: 'Aa', fn: s => s.toUpperCase(), kind: 'text' },
    sort: { name: 'Sort lines A→Z', ic: '↕', fn: s => s.split('\n').sort((a, b) => a.localeCompare(b)).join('\n'), kind: 'text' },
    count: { name: 'Count words & characters', ic: '#', fn: s => `${s.trim().split(/\s+/).filter(Boolean).length} words\n${s.length} characters\n${s.split('\n').length} lines`, kind: 'text' }
  };
  const GENERATORS = {
    uuid: { name: 'Generate UUID', ic: 'ID', fn: () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); })) },
    now: { name: 'Insert timestamp', ic: '⏱', fn: () => { const d = new Date(); return `${d.toISOString()}\nunix: ${Math.floor(d / 1000)}`; } },
    lorem: { name: 'Lorem ipsum paragraph', ic: '¶', fn: () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.' }
  };

  /* ---------- clips ---------- */
  let uid = 0;
  const ago = m => m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`;
  const mk = (name, text, kind, mins, pinned = false) => ({ id: ++uid, name, text, kind, at: Date.now() - mins * 60000, pinned });
  let clips = [
    mk('API response', '{"user":{"id":4821,"name":"Ada Rivera","roles":["admin","billing"]},"plan":"pro","trial":false,"seats":12}', 'code', 2),
    mk('Pricing export', 'plan,seats,price\nstarter,1,9\npro,12,29\nteam,50,79', 'code', 9),
    mk('Staging URL', 'https://staging.example.com/api/v2/users?filter=active&sort=-created', 'link', 14),
    mk('Deploy note', 'Rolled back 2.4.0 because the login flicker came back on Android 15. Fix is in 2.4.1.', 'text', 31, true),
    mk('Base64 sample', 'SGVsbG8gZnJvbSBCYXpvem8gU3R1ZGlvIQ==', 'code', 47),
    mk('Brand accent', '#FF9F0A', 'text', 63, true),
    mk('SQL', 'SELECT id, email\nFROM users\nWHERE plan = \'pro\'\nORDER BY created_at DESC\nLIMIT 50;', 'code', 120)
  ];
  let sel = clips[0].id, filter = 'all';
  const cur = () => clips.find(c => c.id === sel);
  const listEl = $('#list');
  const matches = c => filter === 'all' || (filter === 'pinned' ? c.pinned : c.kind === filter);
  function renderList() {
    listEl.replaceChildren();
    clips.filter(matches).forEach(c => {
      const b = el('button', 'clip'); b.type = 'button'; b.setAttribute('role', 'option'); b.setAttribute('aria-selected', String(c.id === sel));
      b.append(el('span', 'ct', c.text.split('\n')[0]));
      const m = el('span', 'cm'); m.append(el('span', 'tag', c.kind), document.createTextNode(c.name + ' · ' + ago(Math.round((Date.now() - c.at) / 60000))));
      if (c.pinned) m.append(el('span', 'pin', '●'));
      b.append(m);
      b.addEventListener('click', () => { sel = c.id; renderList(); renderPreview(); });
      listEl.append(b);
    });
    $('#nAll').textContent = clips.length; $('#nPinned').textContent = clips.filter(c => c.pinned).length;
    $('#nCode').textContent = clips.filter(c => c.kind === 'code').length; $('#nLink').textContent = clips.filter(c => c.kind === 'link').length; $('#nText').textContent = clips.filter(c => c.kind === 'text').length;
    renderDropdown();
  }
  function renderPreview() {
    const c = cur(); if (!c) return;
    $('#pvTitle').textContent = c.name;
    $('#pvMeta').textContent = `${c.kind} · ${c.text.length} chars · ${ago(Math.round((Date.now() - c.at) / 60000))}`;
    $('#pv').textContent = c.text;
    $('#pinBtn').textContent = c.pinned ? 'Unpin' : 'Pin';
    const foot = $('#pvFoot'); foot.replaceChildren();
    const isJson = (() => { try { JSON.parse(c.text); return /^[[{]/.test(c.text.trim()); } catch (e) { return false; } })();
    const keys = isJson ? ['format', 'minify', 'yaml', 'b64e'] : c.text.includes(',') && c.text.includes('\n') ? ['csv', 'sort', 'count'] : /^[A-Za-z0-9+/=]{12,}$/.test(c.text.trim()) ? ['b64d', 'upper'] : ['url', 'upper', 'b64e', 'count'];
    keys.forEach(k => { const b = el('button', null, TRANSFORMS[k].name); b.type = 'button'; b.addEventListener('click', () => runTransform(k, c)); foot.append(b); });
    if (G) G.fromTo('#pv', { opacity: .3 }, { opacity: 1, duration: .25 });
  }
  function addClip(name, text, kind) {
    if (S_SET.pause) { notify('Capture is paused', 'Turn it back on in the menu bar to save new clips.'); return null; }
    const c = mk(name, text, kind, 0); clips.unshift(c); sel = c.id;
    if (filter !== 'all' && !matches(c)) { filter = 'all'; $$('.side button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === 'all'))); }
    renderList(); renderPreview();
    const first = listEl.firstElementChild; if (first && G) G.from(first, { x: -20, opacity: 0, duration: .45, ease: 'back.out(2)' });
    return c;
  }
  function runTransform(k, src, text) {
    const T = TRANSFORMS[k];
    try {
      const out = T.fn(text != null ? text : src.text);
      addClip(T.name + (src ? ' · ' + src.name : ''), out, T.kind);
      notify(T.name, `Saved as a new clip · ${out.length} chars`); check('transform');
    } catch (e) { notify(`${T.name} failed`, String(e.message || e).slice(0, 90)); if (G) G.fromTo('#win', { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1.4, .25)' }); }
  }
  $$('.side button').forEach(b => b.addEventListener('click', () => { filter = b.dataset.f; $$('.side button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); renderList(); }));
  async function copyClip(c) { try { await navigator.clipboard.writeText(c.text); notify('Copied to clipboard', c.name); } catch (e) { notify('Copied (demo)', 'Your browser blocked clipboard access'); } }
  $('#copyBtn').addEventListener('click', () => copyClip(cur()));
  $('#pinBtn').addEventListener('click', () => { const c = cur(); c.pinned = !c.pinned; renderList(); renderPreview(); });

  /* ---------- settings shared by dropdown + palette ---------- */
  const S_SET = { pause: false, plain: true, login: true, sound: false, menubar: false };
  const SET_NAMES = { pause: 'Pause capture', plain: 'Paste as plain text', login: 'Launch at login', sound: 'Sound effects', menubar: 'Solid dark menu bar' };
  function setSetting(k, v) {
    S_SET[k] = v; check('toggle');
    $$(`.sw[data-set="${k}"]`).forEach(s => s.setAttribute('aria-checked', String(v)));
    if (k === 'menubar') $('.menubar').style.background = v ? 'rgba(10,10,14,.92)' : '';
    if (k === 'pause') $('.mb-util .dot').style.background = v ? '#8E8E93' : '';
    notify(SET_NAMES[k], v ? 'On' : 'Off');
  }
  desk.addEventListener('click', e => { const s = e.target.closest('.sw[data-set]'); if (!s || s.closest('.palette')) return; e.stopPropagation(); setSetting(s.dataset.set, s.getAttribute('aria-checked') !== 'true'); });

  /* ---------- menu bar + dropdowns ---------- */
  let openMenu = null;
  function closeMenus() { if (!openMenu) return; openMenu.panel.hidden = true; openMenu.btn.setAttribute('aria-expanded', 'false'); openMenu = null; }
  function toggleMenu(btn, panel) {
    const was = openMenu && openMenu.panel === panel; closeMenus(); if (was) return;
    panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); openMenu = { btn, panel };
    if (G) G.fromTo(panel, { opacity: 0, y: -6, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .2, ease: 'power2.out', transformOrigin: 'top' });
  }
  $$('.menubar [data-menu]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); toggleMenu(b, $('#menu-' + b.dataset.menu)); }));
  $('#utilBtn').addEventListener('click', e => { e.stopPropagation(); toggleMenu($('#utilBtn'), $('#utilMenu')); check('menu'); });
  document.addEventListener('click', e => { if (openMenu && !openMenu.panel.contains(e.target)) closeMenus(); });
  function renderDropdown() {
    $('#ddCount').textContent = clips.length + ' clips';
    const row = c => { const b = el('button', 'dd-row'); b.type = 'button'; b.append(el('span', 'ic', c.kind[0].toUpperCase()), el('span', 'tx', c.text.split('\n')[0])); b.addEventListener('click', () => { closeMenus(); sel = c.id; renderList(); renderPreview(); copyClip(c); }); return b; };
    $('#ddRecent').replaceChildren(...clips.filter(c => !c.pinned).slice(0, 4).map(row));
    $('#ddPinned').replaceChildren(...clips.filter(c => c.pinned).slice(0, 3).map(row));
  }
  desk.addEventListener('click', e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    closeMenus();
    const act = a.dataset.act;
    if (act === 'palette') openPalette();
    if (act === 'about') notify('ClipboardStack 3.2', 'Made for macOS Sequoia · demo build');
    if (act === 'clear') { clips = clips.filter(c => c.pinned); sel = (clips[0] || {}).id; renderList(); renderPreview(); notify('History cleared', 'Pinned clips were kept'); }
    if (act === 'hide') minimise();
    if (act === 'new') addClip('New snippet', 'Type or paste something here…', 'text');
    if (act === 'export') addClip('Export', JSON.stringify(clips.slice(0, 3).map(c => ({ name: c.name, kind: c.kind })), null, 2), 'code');
    if (act === 'copy') copyClip(cur());
    if (act === 'pin') $('#pinBtn').click();
    if (act === 'filter-all') $('.side [data-f="all"]').click();
    if (act === 'filter-code') $('.side [data-f="code"]').click();
  });

  /* ---------- command palette ---------- */
  const pal = $('#palette'), palScrim = $('#palScrim'), palIn = $('#palInput'), palList = $('#palList');
  let items = [], idx = 0;
  function buildItems(q) {
    const ql = q.trim().toLowerCase(), out = [];
    const looksJson = /^\s*[[{]/.test(q) && (() => { try { JSON.parse(q); return true; } catch (e) { return false; } })();
    const looksCsv = q.includes(',') && q.includes('\n');
    if (looksJson) ['format', 'yaml', 'minify'].forEach(k => out.push({ sec: 'Pasted text', ic: TRANSFORMS[k].ic, label: TRANSFORMS[k].name, sub: 'on what you typed', run: () => runTransform(k, null, q) }));
    else if (looksCsv) out.push({ sec: 'Pasted text', ic: 'CS', label: 'CSV → JSON', sub: 'on what you typed', run: () => runTransform('csv', null, q) });
    const c = cur();
    Object.entries(TRANSFORMS).forEach(([k, T]) => { if (!ql || T.name.toLowerCase().includes(ql) || looksJson) if (!looksJson) out.push({ sec: 'Transform selected clip', ic: T.ic, label: T.name, sub: c ? c.name : '', run: () => runTransform(k, c) }); });
    Object.values(GENERATORS).forEach(Gn => { if (!ql || Gn.name.toLowerCase().includes(ql)) out.push({ sec: 'Generate', ic: Gn.ic, label: Gn.name, run: () => { addClip(Gn.name, Gn.fn(), 'text'); notify(Gn.name, 'Saved as a new clip'); check('transform'); } }); });
    Object.entries(SET_NAMES).forEach(([k, n]) => { if (!ql || n.toLowerCase().includes(ql) || 'toggle settings'.includes(ql)) out.push({ sec: 'Settings', ic: '⚙', label: n, toggle: k, run: () => { setSetting(k, !S_SET[k]); renderPal(); } }); });
    if (ql && !looksJson) clips.filter(x => (x.text + ' ' + x.name).toLowerCase().includes(ql)).slice(0, 5).forEach(x => out.push({ sec: 'Clips', ic: x.kind[0].toUpperCase(), label: x.text.split('\n')[0], sub: x.name, run: () => { sel = x.id; renderList(); renderPreview(); closePalette(); } }));
    return out;
  }
  function renderPal() {
    items = buildItems(palIn.value); idx = Math.min(idx, Math.max(0, items.length - 1));
    palList.replaceChildren();
    if (!items.length) { palList.append(el('div', 'pal-empty', 'No matches. Try “json”, “base64”, “uuid” or paste some JSON.')); return; }
    let lastSec = null;
    items.forEach((it, i) => {
      if (it.sec !== lastSec) { lastSec = it.sec; palList.append(el('div', 'pal-sec', it.sec)); }
      const b = el('button', 'pal-item'); b.type = 'button'; b.setAttribute('role', 'option'); b.setAttribute('aria-selected', String(i === idx));
      const tx = el('span', 'tx', it.label); if (it.sub) tx.append(el('small', null, it.sub));
      b.append(el('span', 'ic', it.ic), tx);
      if (it.toggle) { const s = el('span', 'sw'); s.setAttribute('aria-checked', String(S_SET[it.toggle])); b.append(s); } else b.append(el('span', 'k', '↵'));
      b.addEventListener('mousemove', () => { if (idx !== i) { idx = i; paintSel(); } });
      b.addEventListener('click', () => { idx = i; runItem(); });
      palList.append(b);
    });
  }
  function paintSel() { $$('.pal-item').forEach((b, i) => b.setAttribute('aria-selected', String(i === idx))); const s = $$('.pal-item')[idx]; if (s) s.scrollIntoView({ block: 'nearest' }); }
  function runItem() { const it = items[idx]; if (!it) return; const keep = !!it.toggle; it.run(); if (!keep && !pal.hidden) closePalette(); }
  function openPalette() {
    closeMenus(); if (win.hidden) restore();
    pal.hidden = false; palScrim.hidden = false; palIn.value = ''; idx = 0; renderPal(); check('palette');
    if (G) G.fromTo(pal, { opacity: 0, scale: .96, y: -10 }, { opacity: 1, scale: 1, y: 0, duration: .25, ease: 'back.out(1.8)' });
    setTimeout(() => palIn.focus({ preventScroll: true }), 20);
  }
  function closePalette() { pal.hidden = true; palScrim.hidden = true; }
  palIn.addEventListener('input', () => { idx = 0; renderPal(); });
  palIn.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(items.length - 1, idx + 1); paintSel(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(0, idx - 1); paintSel(); }
    if (e.key === 'Enter') { e.preventDefault(); runItem(); }
  });
  palScrim.addEventListener('click', closePalette);
  $('#palBtn').addEventListener('click', openPalette);
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openPalette() : closePalette(); }
    if (e.key === 'Escape') { if (!pal.hidden) closePalette(); else closeMenus(); }
  });

  /* ---------- window: drag, close, minimise, zoom ---------- */
  const win = $('#win'), tb = $('#titlebar');
  let drag = null, zoomed = false, saved = null, minimised = false;
  tb.addEventListener('pointerdown', e => {
    if (e.target.closest('button') || zoomed) return;
    const [x, y] = toDesk(e.clientX, e.clientY); drag = { x, y, l: win.offsetLeft, t: win.offsetTop };
    try { tb.setPointerCapture(e.pointerId); } catch (_) {}
  });
  tb.addEventListener('pointermove', e => {
    if (!drag) return; const [x, y] = toDesk(e.clientX, e.clientY);
    win.style.left = Math.max(-600, Math.min(1100, drag.l + x - drag.x)) + 'px';
    win.style.top = Math.max(28, Math.min(620, drag.t + y - drag.y)) + 'px';
  });
  tb.addEventListener('pointerup', () => { drag = null; });
  tb.addEventListener('dblclick', e => { if (!e.target.closest('button')) zoom(); });
  function zoom() {
    const to = zoomed ? saved : { left: 0, top: 28, width: 1200, height: 610 };
    if (!zoomed) saved = { left: win.offsetLeft, top: win.offsetTop, width: win.offsetWidth, height: win.offsetHeight };
    zoomed = !zoomed;
    if (G) G.to(win, { ...Object.fromEntries(Object.entries(to).map(([k, v]) => [k, v + 'px'])), borderRadius: zoomed ? 0 : 14, duration: .45, ease: 'expo.inOut' });
    else Object.entries(to).forEach(([k, v]) => { win.style[k] = v + 'px'; });
  }
  function minimise() {
    if (minimised) return; minimised = true; closePalette();
    const dr = $('#dockCS').getBoundingClientRect(), wr = win.getBoundingClientRect();
    const dx = (dr.left + dr.width / 2 - (wr.left + wr.width / 2)) / S, dy = (dr.top - (wr.top + wr.height / 2)) / S;
    if (G) G.to(win, { x: dx, y: dy, scale: .05, opacity: .3, duration: .55, ease: 'power3.in', onComplete: () => { win.hidden = true; } });
    else win.hidden = true;
  }
  function restore() {
    const wasMin = minimised; win.hidden = false; minimised = false;
    if (G) G.to(win, { x: 0, y: 0, scale: 1, opacity: 1, duration: .6, ease: 'expo.out' }); else win.style.transform = '';
    if (wasMin) check('dock');
  }
  $('#wMin').addEventListener('click', minimise);
  $('#wMax').addEventListener('click', zoom);
  $('#wClose').addEventListener('click', () => { minimised = false; if (G) G.to(win, { scale: .92, opacity: 0, duration: .22, onComplete: () => { win.hidden = true; G.set(win, { scale: 1, opacity: 1 }); } }); else win.hidden = true; notify('Window closed', 'ClipboardStack keeps running in the menu bar. Click its Dock icon to reopen.'); });

  /* ---------- dock: magnification + launch ---------- */
  const dock = $('#dock'), dockBtns = $$('#dock button');
  dock.addEventListener('mousemove', e => {
    dockBtns.forEach(b => {
      const r = b.getBoundingClientRect(), d = Math.abs(e.clientX - (r.left + r.width / 2)) / S;
      const sz = 52 + Math.max(0, 26 * (1 - d / 140));
      b.style.width = b.style.height = sz + 'px';
    });
  });
  dock.addEventListener('mouseleave', () => dockBtns.forEach(b => { b.style.width = b.style.height = ''; }));
  dockBtns.forEach(b => b.addEventListener('click', () => {
    if (G) G.timeline().to(b, { y: -18, duration: .2, ease: 'power2.out' }).to(b, { y: 0, duration: .5, ease: 'bounce.out' });
    if (b.dataset.app === 'cs') { if (win.hidden) restore(); else if (G) G.fromTo(win, { scale: .98 }, { scale: 1, duration: .3 }); }
    else notify('Just a prop', 'Only ClipboardStack runs in this demo.');
  }));

  /* ---------- boot ---------- */
  renderList(); renderPreview();
  if (G) {
    G.from('.intro > *', { y: 24, opacity: 0, duration: .8, stagger: .1, ease: 'expo.out' });
    G.from('#win', { y: 40, scale: .96, opacity: 0, duration: .9, ease: 'expo.out', delay: .3 });
    G.from('#dock', { y: 90, duration: .8, ease: 'back.out(1.6)', delay: .5 });
    G.delayedCall(1.6, () => notify('Tip: press ⌘K or Ctrl+K', 'The command palette works anywhere on this page.'));
  }
})();
