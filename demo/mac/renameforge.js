/* RenameForge — batch image compressor simulator (Bazozo Studio).
   Sample photos are painted on canvas; files you drop are compressed for real with the Canvas API.
   Nothing is uploaded. All DOM is built with createElement + textContent. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- desktop scale + clock ---------- */
  const wrap = $('#deskWrap'), desk = $('#desk');
  let S = 1;
  function fit() { S = Math.max(.5, Math.min(1, wrap.clientWidth / 1200)); wrap.style.setProperty('--s', S.toFixed(4)); }
  window.addEventListener('resize', fit); fit();
  const toDesk = (cx, cy) => { const r = desk.getBoundingClientRect(); return [(cx - r.left) / S, (cy - r.top) / S]; };
  const tick = () => { $('#clock').textContent = new Date().toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' }); };
  tick(); setInterval(tick, 10000);

  /* ---------- checklist + toast ---------- */
  const done = new Set();
  function check(k) { if (done.has(k)) return; done.add(k); const c = $(`#tryList [data-t="${k}"]`); if (c) { c.classList.add('done'); if (G) G.fromTo(c, { scale: .9 }, { scale: 1, duration: .45, ease: 'back.out(3)' }); } $('#tryCount').textContent = `${done.size}/5`; }
  const toast = $('#toast'); let tt = null;
  function say(title, body) { $('#toastT').textContent = title; $('#toastB').textContent = body; toast.hidden = false; clearTimeout(tt); if (G) G.fromTo(toast, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: 'back.out(1.6)' }); tt = setTimeout(() => { if (G) G.to(toast, { x: 40, opacity: 0, duration: .3, onComplete: () => { toast.hidden = true; } }); else toast.hidden = true; }, 3400); }

  /* ---------- procedural sample photos ---------- */
  const PW = 600, PH = 372;
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function grain(c, amt, r) { const d = c.getImageData(0, 0, PW, PH), a = d.data; for (let i = 0; i < a.length; i += 4) { const n = (r() - .5) * amt; a[i] += n; a[i + 1] += n; a[i + 2] += n; } c.putImageData(d, 0, 0); }
  function ridge(c, r, y0, amp, color) { c.fillStyle = color; c.beginPath(); c.moveTo(0, PH); let y = y0; for (let x = 0; x <= PW; x += 6) { y += (r() - .5) * amp; y = Math.max(y0 - amp * 3, Math.min(y0 + amp * 2, y)); c.lineTo(x, y); } c.lineTo(PW, PH); c.fill(); }
  const lin = (c, y0, y1, stops) => { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; };
  const PAINT = {
    sunset(c, r) { c.fillStyle = lin(c, 0, PH, ['#1E1B4B', '#7C3AED', '#F472B6', '#FB923C', '#FDE68A']); c.fillRect(0, 0, PW, PH); c.fillStyle = '#FEF3C7'; c.shadowColor = '#FDBA74'; c.shadowBlur = 60; c.beginPath(); c.arc(PW * .62, PH * .62, 46, 0, 7); c.fill(); c.shadowBlur = 0; ridge(c, r, PH * .6, 18, '#6D28D9'); ridge(c, r, PH * .7, 14, '#4C1D95'); ridge(c, r, PH * .82, 10, '#1E1B4B'); grain(c, 22, r); },
    forest(c, r) { c.fillStyle = lin(c, 0, PH, ['#D1FAE5', '#6EE7B7', '#065F46']); c.fillRect(0, 0, PW, PH); for (let L = 0; L < 4; L++) { c.fillStyle = ['#34D399', '#059669', '#065F46', '#022C22'][L]; for (let i = 0; i < 26; i++) { const x = r() * PW, h = 80 + L * 40 + r() * 60, b = PH * (.55 + L * .12); c.beginPath(); c.moveTo(x, b - h); c.lineTo(x - h * .28, b); c.lineTo(x + h * .28, b); c.fill(); } c.fillRect(0, PH * (.55 + L * .12), PW, PH); } c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(0, PH * .45, PW, 30); grain(c, 26, r); },
    city(c, r) { c.fillStyle = lin(c, 0, PH, ['#020617', '#1E293B', '#334155']); c.fillRect(0, 0, PW, PH); c.fillStyle = '#F8FAFC'; c.beginPath(); c.arc(90, 70, 22, 0, 7); c.fill(); for (let x = 0; x < PW;) { const w = 30 + r() * 50, h = 90 + r() * 200; c.fillStyle = `hsl(220,25%,${8 + r() * 10}%)`; c.fillRect(x, PH - h, w, h); for (let wy = PH - h + 8; wy < PH - 8; wy += 12) for (let wx = x + 5; wx < x + w - 6; wx += 9) if (r() > .55) { c.fillStyle = r() > .3 ? '#FDE68A' : '#93C5FD'; c.fillRect(wx, wy, 4, 6); } x += w + 2; } grain(c, 30, r); },
    ui(c, r) { c.fillStyle = '#F1F5F9'; c.fillRect(0, 0, PW, PH); c.fillStyle = '#0F172A'; c.fillRect(0, 0, 110, PH); for (let i = 0; i < 7; i++) { c.fillStyle = i === 1 ? '#10B981' : '#334155'; c.fillRect(16, 40 + i * 30, 70, 10); } [[130, 20], [282, 20], [434, 20]].forEach(([x, y], i) => { c.fillStyle = '#fff'; c.fillRect(x, y, 140, 76); c.fillStyle = ['#10B981', '#3B82F6', '#F59E0B'][i]; c.font = 'bold 24px Inter, sans-serif'; c.fillText(['$48k', '1,204', '92%'][i], x + 14, y + 48); c.fillStyle = '#CBD5E1'; c.fillRect(x + 14, y + 58, 70, 6); }); c.fillStyle = '#fff'; c.fillRect(130, 112, 444, 236); c.strokeStyle = '#10B981'; c.lineWidth = 3; c.beginPath(); let y = 290; for (let x = 150; x < 560; x += 20) { y = Math.max(140, Math.min(320, y + (r() - .55) * 40)); c.lineTo(x, y); } c.stroke(); c.strokeStyle = '#E2E8F0'; c.lineWidth = 1; for (let g = 140; g < 340; g += 40) { c.beginPath(); c.moveTo(150, g); c.lineTo(560, g); c.stroke(); } },
    graphic(c) { c.fillStyle = '#FDF4FF'; c.fillRect(0, 0, PW, PH); c.fillStyle = '#10B981'; c.beginPath(); c.arc(PW / 2, PH / 2, 120, 0, 7); c.fill(); c.fillStyle = '#0F172A'; c.beginPath(); c.arc(PW / 2 + 40, PH / 2 - 30, 60, 0, 7); c.fill(); c.fillStyle = '#F472B6'; c.fillRect(60, 60, 60, 60); c.fillStyle = '#3B82F6'; c.beginPath(); c.moveTo(520, 300); c.lineTo(560, 230); c.lineTo(600, 300); c.fill(); c.fillStyle = '#fff'; c.font = '800 64px Inter, sans-serif'; c.textAlign = 'center'; c.fillText('rf', PW / 2 - 20, PH / 2 + 50); },
    beach(c, r) { c.fillStyle = lin(c, 0, PH, ['#38BDF8', '#BAE6FD', '#2DD4BF', '#0D9488', '#FDE68A', '#FCD34D']); c.fillRect(0, 0, PW, PH); c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(80 + i * 120, 40 + r() * 50, 50, 14, 0, 0, 7); c.fill(); } c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; for (let w = 0; w < 4; w++) { c.beginPath(); for (let x = 0; x <= PW; x += 10) c.lineTo(x, PH * .62 + w * 9 + Math.sin(x / 30 + w) * 3); c.stroke(); } grain(c, 20, r); },
    product(c, r) { const g = c.createRadialGradient(PW / 2, PH / 2, 20, PW / 2, PH / 2, 360); g.addColorStop(0, '#FDE68A'); g.addColorStop(1, '#B45309'); c.fillStyle = g; c.fillRect(0, 0, PW, PH); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(PW / 2, PH - 50, 90, 16, 0, 0, 7); c.fill(); const b = c.createLinearGradient(PW / 2 - 50, 0, PW / 2 + 50, 0); b.addColorStop(0, '#064E3B'); b.addColorStop(.4, '#10B981'); b.addColorStop(1, '#022C22'); c.fillStyle = b; c.beginPath(); c.roundRect(PW / 2 - 50, 110, 100, 210, 20); c.fill(); c.fillRect(PW / 2 - 18, 70, 36, 50); c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(PW / 2 - 36, 190, 72, 44); grain(c, 16, r); },
    poster(c) { c.fillStyle = '#0F172A'; c.fillRect(0, 0, PW, PH); ['#F43F5E', '#F59E0B', '#10B981', '#3B82F6'].forEach((col, i) => { c.fillStyle = col; c.fillRect(i * 150, 0, 150, PH * (.3 + i * .15)); }); c.fillStyle = '#fff'; c.font = '900 76px Inter, sans-serif'; c.fillText('FORGE', 30, PH - 40); c.font = '600 18px Inter, sans-serif'; c.fillText('2026 · LIVE', 34, PH - 120); }
  };
  function makePreview(kind, seed) { const cv = document.createElement('canvas'); cv.width = PW; cv.height = PH; PAINT[kind](cv.getContext('2d'), rng(seed)); return cv; }
  function bitmapPreview(bmp) { const cv = document.createElement('canvas'); cv.width = PW; cv.height = PH; const c = cv.getContext('2d'), s = Math.max(PW / bmp.width, PH / bmp.height); c.drawImage(bmp, (PW - bmp.width * s) / 2, (PH - bmp.height * s) / 2, bmp.width * s, bmp.height * s); return cv; }

  /* ---------- state ---------- */
  const MB = 1048576;
  const SAMPLES = [
    { name: 'IMG_2041.HEIC', w: 4032, h: 3024, size: 4.2 * MB, kind: 'sunset', cls: 'photo' },
    { name: 'DSC_0187.JPG', w: 6000, h: 4000, size: 11.8 * MB, kind: 'forest', cls: 'photo' },
    { name: 'Rooftop_Night.jpg', w: 4000, h: 2667, size: 6.3 * MB, kind: 'city', cls: 'photo' },
    { name: 'Dashboard_Shot.png', w: 2880, h: 1800, size: 3.1 * MB, kind: 'ui', cls: 'ui' },
    { name: 'Brand_Mark.png', w: 2400, h: 2400, size: 1.4 * MB, kind: 'graphic', cls: 'graphic' }
  ];
  const DESKTOP = [
    { name: 'Beach_Day.heic', w: 4032, h: 3024, size: 3.9 * MB, kind: 'beach', cls: 'photo' },
    { name: 'Product_Shot.jpg', w: 5472, h: 3648, size: 9.6 * MB, kind: 'product', cls: 'photo' },
    { name: 'Poster_Final.png', w: 3000, h: 4000, size: 7.4 * MB, kind: 'poster', cls: 'graphic' }
  ];
  let files = [], uid = 0, sel = null, fmt = 'webp', Q = 72, maxW = 2560, busy = false;
  const EXT = { webp: 'webp', avif: 'avif', jpeg: 'jpg', png: 'png' };
  const MIME = { webp: 'image/webp', avif: 'image/avif', jpeg: 'image/jpeg', png: 'image/png' };

  const fmtB = b => b >= MB ? (b / MB).toFixed(b >= 10 * MB ? 0 : 1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
  const target = f => { const tw = maxW && f.w > maxW ? maxW : f.w; return [tw, Math.round(f.h * tw / f.w)]; };
  function estimate(f) {
    const [tw, th] = target(f), px = tw * th;
    let bpp;
    if (fmt === 'png') bpp = { photo: 13, ui: 3.2, graphic: 1.6 }[f.cls];
    else bpp = (.35 + 3.9 * (Q / 100) ** 2.4) * { webp: .7, avif: .5, jpeg: 1 }[fmt] * { photo: 1, ui: .42, graphic: .3 }[f.cls];
    return Math.round(px * bpp / 8);
  }
  const outSize = f => f.status === 'done' && f.out != null ? f.out : estimate(f);
  function outName(f, i, used) {
    const [tw] = target(f), base = f.name.replace(/\.[^.]+$/, '');
    const d = new Date(), date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let n = ($('#pat').value || '{name}').replace(/\{name\}/g, base).replace(/\{n\}/g, String(i + 1).padStart(2, '0')).replace(/\{w\}/g, tw).replace(/\{q\}/g, fmt === 'png' ? 'lossless' : Q).replace(/\{date\}/g, date);
    n = n.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').trim().slice(0, 80) || 'image';
    let out = `${n}.${EXT[fmt]}`, k = 2;
    while (used.has(out.toLowerCase())) out = `${n}-${k++}.${EXT[fmt]}`;
    used.add(out.toLowerCase()); return out;
  }

  /* ---------- queue rows ---------- */
  const rows = $('#rows');
  function addFile(spec, opts = {}) {
    const f = { id: ++uid, status: 'queued', out: null, ...spec };
    f.preview = f.preview || makePreview(f.kind, f.id * 977 + 13);
    const row = el('div', 'row'); row.setAttribute('role', 'option'); row.tabIndex = 0; f.row = row;
    const th = document.createElement('canvas'); th.width = 104; th.height = 76; th.getContext('2d').drawImage(f.preview, 0, 0, 104, 76);
    const nm = el('div', 'nm'); f.nmB = el('b', null, f.name); f.nmO = el('span', 'out'); nm.append(f.nmB, f.nmO);
    f.sz = el('div', 'sz');
    const st = el('div', 'st'); f.stT = el('span', null, 'Queued'); f.bar = el('div', 'bar'); f.fill = el('i'); f.bar.append(f.fill); st.append(f.stT, f.bar);
    const rm = el('button', 'rm', '×'); rm.type = 'button'; rm.setAttribute('aria-label', `Remove ${f.name}`);
    rm.addEventListener('click', e => { e.stopPropagation(); removeFile(f); });
    row.append(th, nm, f.sz, st, rm);
    row.addEventListener('click', () => select(f));
    row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(f); } if (e.key === 'Delete' || e.key === 'Backspace') removeFile(f); });
    files.push(f); rows.append(row);
    if (G && opts.animate) G.from(row, { x: -30, opacity: 0, backgroundColor: 'rgba(16,185,129,.35)', duration: .7, ease: 'expo.out' });
    if (!sel || opts.select) select(f);
    const g = $('#goBtn'); if (!busy) { g.classList.remove('done'); $('#goTxt').textContent = 'Process Batch'; }
    refresh();
    return f;
  }
  function removeFile(f) {
    if (busy && f.status === 'busy') return;
    if (f.url) URL.revokeObjectURL(f.url);
    files = files.filter(x => x !== f);
    if (f.icon) f.icon.classList.remove('used');
    const go = () => { f.row.remove(); if (sel === f) { sel = null; if (files[0]) select(files[0]); else clearPreview(); } refresh(); };
    if (G) G.to(f.row, { x: 40, opacity: 0, height: 0, duration: .3, ease: 'power2.in', onComplete: go }); else go();
  }
  function select(f) { sel = f; files.forEach(x => x.row.setAttribute('aria-selected', String(x === f))); drawPreview(); }
  function refresh() {
    const used = new Set(); let tin = 0, tout = 0;
    files.forEach((f, i) => {
      const o = outSize(f), pct = Math.round((1 - o / f.size) * 100), [tw, th] = target(f);
      f.outName = outName(f, i, used);
      f.nmO.textContent = `→ ${f.outName}`;
      f.sz.replaceChildren(el('b', null, fmtB(f.size)), document.createTextNode(' → '), document.createTextNode((f.status === 'done' ? '' : '~') + fmtB(o) + ' '), el('em', pct < 0 ? 'up' : null, `(${pct > 0 ? '-' : '+'}${Math.abs(pct)}%)`));
      f.sz.title = `${f.w}×${f.h} → ${tw}×${th}`;
      tin += f.size; tout += o;
    });
    $('#fCount').textContent = files.length; $('#fIn').textContent = fmtB(tin); $('#fOut').textContent = files.length ? fmtB(tout) : '0 KB';
    $('#subTtl').textContent = `${files.length} image${files.length === 1 ? '' : 's'} · Export to ~/Pictures/Compressed`;
    const pct = tin ? Math.round((1 - tout / tin) * 100) : 0, sv = $('#sumV');
    sv.replaceChildren(document.createTextNode(files.length ? `${fmtB(tin)} → ${fmtB(tout)} ` : 'Queue is empty'), ...(files.length ? [el('em', null, `(${pct >= 0 ? '-' : '+'}${Math.abs(pct)}%)`)] : []));
    const bw = tin ? Math.min(100, tout / tin * 100) : 0;
    if (G) G.to('#sumBar', { width: bw + '%', duration: .5, ease: 'power3.out' }); else $('#sumBar').style.width = bw + '%';
    $('#patEx').textContent = files[0] ? files[0].outName : '—';
    if (sel) { const [tw, th] = target(sel); $('#cmpInfo').textContent = `${sel.w}×${sel.h} → ${tw}×${th}`; }
  }
  function unDone() {
    let changed = false;
    files.forEach(f => { if (f.status === 'done') { f.status = 'queued'; f.out = null; f.stT.textContent = 'Settings changed · queued'; f.row.classList.remove('ok'); if (f.dl) { f.dl.remove(); f.dl = null; } if (f.url) { URL.revokeObjectURL(f.url); f.url = null; } if (G) G.to(f.fill, { width: 0, duration: .3 }); else f.fill.style.width = 0; changed = true; } });
    if (changed || !busy) { const g = $('#goBtn'); g.classList.remove('done'); $('#goTxt').textContent = 'Process Batch'; }
  }

  /* ---------- before / after preview ---------- */
  const cmpA = $('#cmpA'), cmpB = $('#cmpB'), cctx = cmpA.getContext('2d');
  let prevUrl = null, prevTok = 0, prevT = null, split = 50;
  function clearPreview() { cctx.clearRect(0, 0, PW, PH); cmpB.removeAttribute('src'); $('#cmpInfo').textContent = '—'; }
  function drawPreview() {
    if (!sel) return;
    cctx.drawImage(sel.preview, 0, 0);
    clearTimeout(prevT); prevT = setTimeout(encodePreview, 40);
    $('#cmpTag').textContent = fmt === 'png' ? 'PNG · lossless' : `${fmt.toUpperCase()} ${Q}`;
    refresh();
  }
  function encodePreview() {
    if (!sel) return;
    const tok = ++prevTok;
    // Browsers rarely ship an AVIF encoder, so the preview approximates AVIF with WebP at a lower setting.
    const mime = fmt === 'avif' ? 'image/webp' : MIME[fmt], q = fmt === 'avif' ? Math.min(1, Q / 100 * 1.12) : Q / 100;
    // Downscale-then-upscale mimics how the resize setting softens detail.
    const [tw] = target(sel), k = Math.min(1, tw / sel.w * 2.2);
    const tmp = document.createElement('canvas'); tmp.width = Math.round(PW * k); tmp.height = Math.round(PH * k);
    tmp.getContext('2d').drawImage(sel.preview, 0, 0, tmp.width, tmp.height);
    tmp.toBlob(b => { if (!b || tok !== prevTok) return; if (prevUrl) URL.revokeObjectURL(prevUrl); prevUrl = URL.createObjectURL(b); cmpB.src = prevUrl; }, mime, q);
  }
  const cmp = $('#cmp'), hand = $('#hand');
  function setSplit(p) { split = Math.max(0, Math.min(100, p)); cmpB.style.clipPath = `inset(0 0 0 ${split}%)`; hand.style.left = split + '%'; cmp.setAttribute('aria-valuenow', Math.round(split)); }
  let cdrag = false, cmoved = 0;
  cmp.addEventListener('pointerdown', e => { cdrag = true; cmoved = 0; try { cmp.setPointerCapture(e.pointerId); } catch (_) {} move(e); });
  const move = e => { const r = cmp.getBoundingClientRect(); setSplit((e.clientX - r.left) / r.width * 100); if (++cmoved > 2) check('compare'); };
  cmp.addEventListener('pointermove', e => { if (cdrag) move(e); });
  cmp.addEventListener('pointerup', () => { cdrag = false; });
  cmp.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); setSplit(split + (e.key === 'ArrowLeft' ? -5 : 5)); check('compare'); } });

  /* ---------- controls ---------- */
  const qIn = $('#q');
  function qUi() {
    const p = (Q - 10) / 90 * 100;
    $('#qNum').textContent = fmt === 'png' ? '—' : Q; $('#qFill').style.width = p + '%'; $('#qTh').style.left = p + '%';
    const [lab, hint] = fmt === 'png' ? ['Lossless', 'PNG ignores quality. Only resizing makes it smaller.'] : Q < 30 ? ['Tiny', 'Smallest files; blocky edges are visible.'] : Q < 55 ? ['Small', 'Good for thumbnails and previews.'] : Q < 80 ? ['Balanced', 'Best mix of size and detail for the web.'] : Q < 92 ? ['High', 'Detail you can pixel-peep. Bigger files.'] : ['Near-lossless', 'Archive quality. Savings drop fast here.'];
    $('#qLabel').textContent = lab; $('#qHint').textContent = hint;
    $('.qwrap').style.opacity = fmt === 'png' ? .45 : 1;
  }
  let qT = null;
  qIn.addEventListener('input', () => { Q = +qIn.value; qUi(); unDone(); check('quality'); clearTimeout(qT); qT = setTimeout(drawPreview, 60); refresh(); });
  const seg = $('#fmtSeg'), pill = $('#fmtPill');
  function placePill(anim) { const b = seg.querySelector('[aria-pressed="true"]'); const css = { left: b.offsetLeft + 'px', width: b.offsetWidth + 'px' }; if (G && anim) G.to(pill, { ...css, duration: .45, ease: 'elastic.out(1,.7)' }); else Object.assign(pill.style, css); }
  seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    if (busy) return; seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    fmt = b.dataset.f; placePill(true); qUi(); unDone(); drawPreview(); check('format');
  }));
  $$('#sizeChips .chip').forEach(b => b.addEventListener('click', () => {
    if (busy) return; $$('#sizeChips .chip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    maxW = +b.dataset.w; unDone(); drawPreview();
  }));
  $$('.sw button').forEach(b => b.addEventListener('click', () => { b.setAttribute('aria-checked', String(b.getAttribute('aria-checked') !== 'true')); }));
  const pat = $('#pat');
  pat.addEventListener('input', () => { unDone(); refresh(); });
  $$('#toks .tok').forEach(b => b.addEventListener('click', () => { const s = pat.selectionStart ?? pat.value.length; pat.setRangeText(b.textContent, s, pat.selectionEnd ?? s, 'end'); pat.focus(); pat.dispatchEvent(new Event('input')); }));

  /* ---------- process batch ---------- */
  function encodeReal(f) {
    return new Promise(res => {
      const [tw, th] = target(f), k = Math.min(1, 4096 / Math.max(tw, th));
      const cv = document.createElement('canvas'); cv.width = Math.round(tw * k); cv.height = Math.round(th * k);
      const c = cv.getContext('2d'); if (fmt === 'jpeg') { c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height); }
      c.drawImage(f.bitmap, 0, 0, cv.width, cv.height);
      cv.toBlob(b => {
        if (b && b.type === MIME[fmt]) return res(b);
        if (fmt === 'avif') cv.toBlob(b2 => res(b2 ? Object.assign(b2, { note: 'WebP (no AVIF encoder here)' }) : null), 'image/webp', Q / 100); else res(b);
      }, MIME[fmt], Q / 100);
    });
  }
  async function runOne(f) {
    f.status = 'busy'; f.stT.textContent = 'Compressing…'; f.row.classList.remove('ok');
    const dur = Math.min(1.8, .55 + f.size / (8 * MB));
    const anim = new Promise(r => { if (G) G.fromTo(f.fill, { width: '0%' }, { width: '100%', duration: dur, ease: 'power1.inOut', onComplete: r }); else { f.fill.style.width = '100%'; setTimeout(r, dur * 1000); } });
    const real = f.bitmap ? encodeReal(f) : Promise.resolve(null);
    const [, blob] = await Promise.all([anim, real]);
    f.out = blob ? blob.size : estimate(f); f.status = 'done'; f.row.classList.add('ok');
    f.stT.textContent = blob && blob.note ? `Done · ${blob.note}` : 'Done ✓';
    if (blob) {
      f.url = URL.createObjectURL(blob);
      const a = el('a', 'dl', 'Save'); a.href = f.url; a.download = f.outName.replace(/\.avif$/, blob.note ? '.webp' : '.avif'); a.addEventListener('click', e => e.stopPropagation());
      f.stT.after(a); f.dl = a;
    }
    if (G) G.fromTo(f.row, { backgroundColor: 'rgba(16,185,129,.22)' }, { backgroundColor: 'rgba(16,185,129,0)', duration: .9, clearProps: 'backgroundColor' });
    refresh();
  }
  $('#goBtn').addEventListener('click', async () => {
    const goB = $('#goBtn');
    if (busy) return;
    if (goB.classList.contains('done')) { say('Opened in Finder', '~/Pictures/Compressed · originals kept'); return; }
    const todo = files.filter(f => f.status !== 'done');
    if (!todo.length) { say('Nothing to process', 'Drag photos from the desktop into the queue first.'); return; }
    busy = true; goB.disabled = true; let n = 0; const before = files.reduce((s, f) => s + f.size, 0);
    const upd = () => { $('#goTxt').textContent = `Processing ${n}/${todo.length}…`; if (G) G.to('#goFill', { width: n / todo.length * 100 + '%', duration: .3 }); };
    upd();
    const q = todo.slice(); const worker = async () => { while (q.length) { await runOne(q.shift()); n++; upd(); } };
    await Promise.all([worker(), worker()]);
    busy = false; goB.disabled = false; goB.classList.add('done'); $('#goTxt').textContent = 'Done · Reveal in Finder';
    if (G) { G.set('#goFill', { width: 0 }); G.fromTo(goB, { scale: .94 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.5)' }); } else $('#goFill').style.width = 0;
    const after = files.reduce((s, f) => s + outSize(f), 0);
    say('Batch complete', `${todo.length} image${todo.length === 1 ? '' : 's'} · saved ${fmtB(before - after)} (-${Math.round((1 - after / before) * 100)}%)`);
    check('process');
  });
  $('#clearBtn').addEventListener('click', () => { files.filter(f => f.status === 'done').forEach(removeFile); });

  /* ---------- your own files ---------- */
  const fileIn = $('#fileIn');
  async function addReal(list) {
    const imgs = [...list].filter(f => /^image\//.test(f.type)).slice(0, 20);
    if (!imgs.length) { say('Not an image', 'RenameForge only accepts image files.'); return; }
    for (const file of imgs) {
      if (file.size > 40 * MB) { say('File too large for the demo', `${file.name} is over 40 MB.`); continue; }
      try {
        const bmp = await createImageBitmap(file);
        addFile({ name: file.name.slice(0, 80), w: bmp.width, h: bmp.height, size: file.size, cls: /png|gif/.test(file.type) ? 'graphic' : 'photo', bitmap: bmp, preview: bitmapPreview(bmp) }, { animate: true, select: true });
        check('drop');
      } catch (_) { say('Can’t read that file here', `${file.name} isn’t supported by this browser (HEIC usually isn’t).`); }
    }
  }
  $('#drop').addEventListener('click', () => fileIn.click());
  $('#drop').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileIn.click(); } });
  $('#addBtn').addEventListener('click', () => fileIn.click());
  fileIn.addEventListener('change', () => { if (fileIn.files.length) addReal(fileIn.files); fileIn.value = ''; });
  const win = $('#win'), dz = $('#dropzone'); let dzn = 0;
  win.addEventListener('dragenter', e => { if (![...e.dataTransfer.types].includes('Files')) return; e.preventDefault(); dzn++; dz.hidden = false; });
  win.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
  win.addEventListener('dragleave', () => { if (--dzn <= 0) { dzn = 0; dz.hidden = true; } });
  win.addEventListener('drop', e => { e.preventDefault(); dzn = 0; dz.hidden = true; if (e.dataTransfer.files.length) addReal(e.dataTransfer.files); });

  /* ---------- desktop photo icons (drag into the window) ---------- */
  const icons = $('#icons');
  DESKTOP.forEach((spec, i) => {
    const d = el('div', 'dfile'); d.tabIndex = 0; d.setAttribute('role', 'button'); d.setAttribute('aria-label', `${spec.name}: drag into RenameForge, or press Enter to add`);
    const pv = makePreview(spec.kind, 5000 + i * 31), th = document.createElement('canvas'); th.width = 128; th.height = 96; th.getContext('2d').drawImage(pv, 0, 0, 128, 96);
    d.append(th, el('span', null, spec.name)); icons.append(d);
    const add = () => { const f = addFile({ ...spec, preview: pv }, { animate: true, select: true }); f.icon = d; d.classList.add('used'); check('drop'); };
    d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(); } });
    let ghost = null, start = null, over = false;
    d.addEventListener('pointerdown', e => {
      try { d.setPointerCapture(e.pointerId); } catch (_) {}
      const [x, y] = toDesk(e.clientX, e.clientY); start = [x, y];
      ghost = document.createElement('canvas'); ghost.className = 'ghost'; ghost.width = 144; ghost.height = 108; ghost.getContext('2d').drawImage(pv, 0, 0, 144, 108);
      ghost.style.left = x - 36 + 'px'; ghost.style.top = y - 27 + 'px'; ghost.style.opacity = 0; desk.append(ghost);
    });
    d.addEventListener('pointermove', e => {
      if (!ghost) return; const [x, y] = toDesk(e.clientX, e.clientY);
      if (Math.hypot(x - start[0], y - start[1]) > 4) ghost.style.opacity = .92;
      ghost.style.left = x - 36 + 'px'; ghost.style.top = y - 27 + 'px';
      const r = win.getBoundingClientRect(); over = !win.hidden && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom; dz.hidden = !over;
    });
    const end = () => {
      if (!ghost) return; const g = ghost; ghost = null; dz.hidden = true;
      if (over) { g.remove(); add(); }
      else if (G) G.to(g, { left: start[0] - 36, top: start[1] - 27, opacity: 0, duration: .35, ease: 'power2.out', onComplete: () => g.remove() });
      else g.remove();
      over = false;
    };
    d.addEventListener('pointerup', end); d.addEventListener('pointercancel', end);
  });

  /* ---------- window management ---------- */
  const tb = $('#toolbar'), dockApp = $('#dockApp');
  let drag = null, zoomed = false, saved = null;
  tb.addEventListener('pointerdown', e => { if (e.target.closest('button') || zoomed) return; const [x, y] = toDesk(e.clientX, e.clientY); drag = { x, y, l: win.offsetLeft, t: win.offsetTop }; try { tb.setPointerCapture(e.pointerId); } catch (_) {} });
  tb.addEventListener('pointermove', e => { if (!drag) return; const [x, y] = toDesk(e.clientX, e.clientY); win.style.left = Math.max(-760, Math.min(1100, drag.l + x - drag.x)) + 'px'; win.style.top = Math.max(26, Math.min(640, drag.t + y - drag.y)) + 'px'; });
  tb.addEventListener('pointerup', () => { drag = null; });
  tb.addEventListener('dblclick', e => { if (!e.target.closest('button')) zoom(); });
  function zoom() {
    if (!zoomed) saved = { left: win.offsetLeft, top: win.offsetTop, width: win.offsetWidth, height: win.offsetHeight };
    const to = zoomed ? saved : { left: 0, top: 26, width: 1200, height: 622 }; zoomed = !zoomed;
    const css = Object.fromEntries(Object.entries(to).map(([k, v]) => [k, v + 'px']));
    if (G) G.to(win, { ...css, duration: .45, ease: 'expo.inOut', onUpdate: () => placePill(false) }); else Object.assign(win.style, css);
  }
  function minimise() {
    const dr = dockApp.getBoundingClientRect(), wr = win.getBoundingClientRect();
    if (G) G.to(win, { x: (dr.left + dr.width / 2 - (wr.left + wr.width / 2)) / S, y: (dr.top - wr.top - wr.height / 2) / S, scaleX: .05, scaleY: .02, opacity: .2, duration: .5, ease: 'power3.in', onComplete: () => { win.hidden = true; } });
    else win.hidden = true;
  }
  function restore() { win.hidden = false; dockApp.classList.add('on'); if (G) { G.to(win, { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: .55, ease: 'expo.out' }); G.fromTo(dockApp, { y: 0 }, { y: -14, duration: .2, yoyo: true, repeat: 1, ease: 'power1.out' }); } else Object.assign(win.style, { transform: '' }); }
  $('#wMin').addEventListener('click', minimise); $('#wZoom').addEventListener('click', zoom);
  $('#wClose').addEventListener('click', () => { if (G) G.to(win, { scale: .94, opacity: 0, duration: .2, onComplete: () => { win.hidden = true; G.set(win, { scale: 1, opacity: 1 }); } }); else win.hidden = true; dockApp.classList.remove('on'); say('RenameForge closed', 'Your queue is kept. Click the dock icon to reopen.'); });
  dockApp.addEventListener('click', () => { if (win.hidden) restore(); else minimise(); });

  /* ---------- boot ---------- */
  SAMPLES.forEach(s => addFile(s));
  select(files[0]); qUi(); setSplit(50);
  document.fonts.ready.then(() => placePill(false)); placePill(false);
  if (G) {
    G.from('.intro > *', { y: 24, opacity: 0, duration: .8, stagger: .1, ease: 'expo.out' });
    G.from('#win', { y: 50, scale: .96, opacity: 0, duration: .8, ease: 'expo.out', delay: .25 });
    G.from('.dfile', { x: 40, opacity: 0, duration: .6, stagger: .08, ease: 'back.out(1.6)', delay: .7, clearProps: 'transform,opacity' });
    G.from('.row', { x: -20, opacity: 0, duration: .5, stagger: .06, ease: 'power3.out', delay: .6, clearProps: 'transform,opacity' });
  }
})();
