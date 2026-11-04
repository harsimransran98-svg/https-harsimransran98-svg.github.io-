/* PrintQueue+ — POS, inventory & GST billing simulator (Bazozo Studio).
   All DOM is built with createElement + textContent. Exported receipts are plain-text Blobs. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs) => { const n = document.createElementNS(SVGNS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- desktop scale + clock ---------- */
  const wrap = $('#deskWrap'), desk = $('#desk');
  let S = 1;
  function fit() { S = Math.max(.5, Math.min(1, wrap.clientWidth / 1200)); wrap.style.setProperty('--s', S.toFixed(4)); }
  window.addEventListener('resize', fit); fit();
  const toDesk = (cx, cy) => { const r = desk.getBoundingClientRect(); return [(cx - r.left) / S, (cy - r.top) / S]; };
  const tick = () => { const d = new Date(), c = $('#clock'); c.replaceChildren(document.createTextNode(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), el('br'), document.createTextNode(d.toLocaleDateString('en-IN'))); };
  tick(); setInterval(tick, 10000);

  /* ---------- checklist, toast, sound ---------- */
  const done = new Set();
  function check(k) { if (done.has(k)) return; done.add(k); const c = $(`#tryList [data-t="${k}"]`); if (c) { c.classList.add('done'); if (G) G.fromTo(c, { scale: .9 }, { scale: 1, duration: .45, ease: 'back.out(3)' }); } $('#tryCount').textContent = `${done.size}/5`; }
  const toast = $('#toast'); let tt = null;
  function say(t, b) { $('#toastT').textContent = t; $('#toastB').textContent = b; toast.hidden = false; clearTimeout(tt); if (G) G.fromTo(toast, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: 'back.out(2)' }); tt = setTimeout(() => { toast.hidden = true; }, 3200); }
  let ac = null;
  function tone(freq, dur, type = 'square', vol = .05) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + dur);
      o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
    } catch (_) {}
  }
  const beep = () => tone(1850, .09);

  /* ---------- catalogue ---------- */
  const P = [
    ['chai', 'Masala Chai 250 g', 145, 5, 'Grocery', '#B45309', 24],
    ['rice', 'Basmati Rice 1 kg', 189, 5, 'Grocery', '#CA8A04', 40],
    ['dal', 'Toor Dal 1 kg', 162, 5, 'Grocery', '#D97706', 18],
    ['ghee', 'Desi Ghee 500 ml', 340, 12, 'Dairy', '#EAB308', 6],
    ['butter', 'Salted Butter 500 g', 275, 12, 'Dairy', '#F59E0B', 4],
    ['paneer', 'Fresh Paneer 200 g', 90, 5, 'Dairy', '#A3A3A3', 12],
    ['choco', 'Dark Chocolate 100 g', 120, 18, 'Snacks', '#7C2D12', 30],
    ['bisc', 'Biscuits Family Pack', 85, 18, 'Snacks', '#DC2626', 26],
    ['nood', 'Instant Noodles ×4', 56, 12, 'Snacks', '#EA580C', 3],
    ['coffee', 'Cold Coffee 200 ml', 45, 18, 'Snacks', '#57534E', 22],
    ['note', 'Notebook A5 · 160 pg', 60, 12, 'Stationery', '#2563EB', 50],
    ['pens', 'Gel Pens · pack of 5', 50, 18, 'Stationery', '#7C3AED', 35],
    ['shamp', 'Herbal Shampoo 340 ml', 299, 18, 'Home', '#059669', 9],
    ['dish', 'Dish Wash Gel 500 ml', 110, 18, 'Home', '#16A34A', 2],
    ['soap', 'Neem Soap ×3', 99, 18, 'Home', '#0D9488', 15],
    ['det', 'Detergent 1 kg', 135, 18, 'Home', '#0284C7', 0]
  ].map(([id, name, price, gst, cat, color, stock], i) => ({ id, name, price, gst, cat, color, stock, bc: '8901' + String(2048170 + i * 7919).padStart(8, '0') + (i % 10) }));
  const byId = new Map(P.map(p => [p.id, p]));
  const initials = n => n.split(/\s+/).filter(w => /^[A-Za-z]/.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const inr = n => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const inr0 = n => '₹' + Math.round(n).toLocaleString('en-IN');

  /* ---------- bill state ---------- */
  const bill = new Map();
  let billNo = 1043, disc = '0', pay = 'UPI', cat = 'All';
  const sales = { total: 18420, bills: 41, gst: 1690 };
  function totals() {
    let sub = 0; bill.forEach((q, id) => { sub += byId.get(id).price * q; });
    const dAmt = disc === 'flat50' ? Math.min(50, sub) : sub * (+disc) / 100;
    const f = sub ? (sub - dAmt) / sub : 0;
    const slabs = new Map();
    bill.forEach((q, id) => { const p = byId.get(id), t = p.price * q * f; slabs.set(p.gst, (slabs.get(p.gst) || 0) + t); });
    let tax = 0; const gst = [...slabs.entries()].sort((a, b) => a[0] - b[0]).map(([r, t]) => { const x = t * r / 100; tax += x; return { r, t, x }; });
    const raw = sub - dAmt + tax, grand = Math.round(raw);
    return { sub, dAmt, taxable: sub - dAmt, gst, tax, round: grand - raw, grand, items: [...bill.values()].reduce((a, b) => a + b, 0) };
  }

  /* ---------- product grid ---------- */
  const grid = $('#grid'), cards = new Map();
  const CATS = ['All', ...new Set(P.map(p => p.cat))];
  CATS.forEach(c => { const b = el('button', 'cat', c); b.type = 'button'; b.setAttribute('aria-pressed', String(c === 'All')); b.addEventListener('click', () => { cat = c; $$('#cats .cat').forEach(x => x.setAttribute('aria-pressed', String(x === b))); renderGrid(true); }); $('#cats').append(b); });
  P.forEach(p => {
    const b = el('button', 'prod'); b.type = 'button';
    const ic = el('span', 'ic', initials(p.name)); ic.style.background = `linear-gradient(135deg, ${p.color}, color-mix(in srgb, ${p.color} 55%, #000))`;
    const row = el('span', 'row'); p.stkEl = el('span', 'stk'); row.append(el('span', 'pr', inr0(p.price)), p.stkEl);
    p.badge = el('span', 'qtyb'); p.badge.hidden = true;
    b.append(ic, el('b', null, p.name), row, el('span', 'bc', p.bc), p.badge);
    b.addEventListener('click', () => addItem(p.id, b));
    cards.set(p.id, b);
  });
  function renderGrid(anim) {
    grid.replaceChildren();
    const list = P.filter(p => cat === 'All' || p.cat === cat);
    list.forEach(p => {
      const b = cards.get(p.id), left = p.stock - (bill.get(p.id) || 0);
      p.stkEl.textContent = p.stock === 0 ? 'Out of stock' : `${left} left`; p.stkEl.className = 'stk' + (left <= 5 ? ' low' : '');
      b.disabled = left <= 0 && !bill.get(p.id); b.setAttribute('aria-label', `${p.name}, ${inr0(p.price)}, ${left} in stock`);
      const q = bill.get(p.id) || 0; p.badge.hidden = !q; p.badge.textContent = q;
      grid.append(b);
    });
    if (G && anim) G.from(grid.children, { y: 12, opacity: 0, duration: .35, stagger: .025, ease: 'power3.out', clearProps: 'transform,opacity' });
  }

  /* ---------- bill rendering ---------- */
  const lines = $('#lines');
  function renderBill(flashId) {
    lines.replaceChildren();
    if (!bill.size) {
      const e = el('div', 'empty'); const s = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5' }); s.append(svgEl('path', { d: 'M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3M7 8v8M10 8v8M13 8v8M16 8v8' }));
      e.append(s, document.createTextNode('Scan a barcode or tap an item to start the bill.')); lines.append(e);
    }
    bill.forEach((q, id) => {
      const p = byId.get(id), ln = el('div', 'line');
      const n = el('div', 'n', p.name); n.append(el('small', null, `${inr0(p.price)} · GST ${p.gst}%`));
      const st = el('div', 'step'), m = el('button', null, '−'), pl = el('button', null, '+');
      m.type = pl.type = 'button'; m.setAttribute('aria-label', `One less ${p.name}`); pl.setAttribute('aria-label', `One more ${p.name}`);
      m.addEventListener('click', () => { const v = (bill.get(id) || 0) - 1; if (v <= 0) bill.delete(id); else bill.set(id, v); update(); });
      pl.addEventListener('click', () => addItem(id));
      st.append(m, el('span', null, q), pl);
      ln.append(n, st, el('div', 'amt', inr(p.price * q)));
      lines.append(ln);
      if (id === flashId && G) G.fromTo(ln, { backgroundColor: 'rgba(58,134,255,.25)' }, { backgroundColor: 'rgba(58,134,255,0)', duration: .8, clearProps: 'backgroundColor' });
    });
    const t = totals(), tot = $('#tot'); tot.replaceChildren();
    const row = (a, b, cls) => { const d = el('div', cls); d.append(el('span', null, a), el('span', null, b)); tot.append(d); };
    row(`Subtotal · ${t.items} item${t.items === 1 ? '' : 's'}`, inr(t.sub));
    if (t.dAmt) row(disc === 'flat50' ? 'Discount · ₹50 off' : `Discount · ${disc}%`, '−' + inr(t.dAmt), 'dsc');
    t.gst.forEach(g => row(`GST ${g.r}% · CGST ${g.r / 2}% + SGST ${g.r / 2}%`, inr(g.x), 'gst'));
    if (bill.size) row('Round off', (t.round >= 0 ? '+' : '−') + inr(Math.abs(t.round)));
    const gEl = $('#grand'), from = +(gEl.dataset.v || 0);
    if (G) { const o = { v: from }; G.to(o, { v: t.grand, duration: .45, ease: 'power2.out', onUpdate: () => { gEl.textContent = inr(o.v); } }); } else gEl.textContent = inr(t.grand);
    gEl.dataset.v = t.grand;
    const cb = $('#chargeBtn'); cb.disabled = !bill.size; $('#chargeTxt').textContent = bill.size ? `Charge ${inr0(t.grand)} · ${pay}` : 'Add items to bill';
    lines.scrollTop = lines.scrollHeight;
  }
  function update(flashId) { renderBill(flashId); renderGrid(false); }
  function addItem(id, fromEl) {
    const p = byId.get(id), q = bill.get(id) || 0;
    if (q >= p.stock) { say('Out of stock', `${p.name} has ${p.stock} left in stock.`); tone(220, .2, 'sawtooth', .04); return false; }
    bill.set(id, q + 1); update(id);
    if (G && fromEl) flyToBill(fromEl, p.color);
    if (bill.size >= 3) check('add');
    return true;
  }
  function flyToBill(from, color) {
    const a = from.getBoundingClientRect(), b = $('#grand').getBoundingClientRect();
    const [x0, y0] = toDesk(a.left + a.width / 2, a.top + 30), [x1, y1] = toDesk(b.left + b.width / 2, b.top + b.height / 2);
    const dot = el('span'); Object.assign(dot.style, { position: 'absolute', zIndex: 65, left: 0, top: 0, width: '14px', height: '14px', marginLeft: '-7px', marginTop: '-7px', borderRadius: '50%', background: color, boxShadow: `0 0 14px ${color}`, pointerEvents: 'none' });
    desk.append(dot);
    G.set(dot, { x: x0, y: y0 });
    G.to(dot, { x: x1, duration: .55, ease: 'power1.in' });
    G.to(dot, { y: Math.min(y0, y1) - 80, duration: .25, ease: 'power2.out' });
    G.to(dot, { y: y1, scale: .4, duration: .3, delay: .25, ease: 'power2.in', onComplete: () => { dot.remove(); G.fromTo('#grand', { scale: 1.12 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); } });
  }

  /* ---------- scanner ---------- */
  const scanIn = $('#scanIn'), laser = $('#laser');
  function sweep() { if (G) G.fromTo(laser, { opacity: 1, scaleX: .1 }, { scaleX: 1, duration: .25, yoyo: true, repeat: 1, ease: 'power2.inOut', onComplete: () => G.set(laser, { opacity: 0 }) }); }
  function lookup(q) {
    q = q.trim().toLowerCase(); if (!q) return null;
    return P.find(p => p.bc === q) || P.find(p => p.bc.startsWith(q) && p.stock - (bill.get(p.id) || 0) > 0) || P.find(p => p.name.toLowerCase().includes(q));
  }
  scanIn.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return; e.preventDefault();
    const p = lookup(scanIn.value);
    if (!p) { say('No item found', `Nothing matches “${scanIn.value.slice(0, 20)}”.`); tone(220, .2, 'sawtooth', .04); if (G) G.fromTo(scanIn, { x: -6 }, { x: 0, duration: .4, ease: 'elastic.out(1,.3)' }); return; }
    sweep(); if (addItem(p.id, cards.get(p.id))) { beep(); check('scan'); } scanIn.value = '';
  });
  let scanning = false;
  $('#scanBtn').addEventListener('click', () => {
    if (scanning) return;
    const pool = P.filter(p => p.stock - (bill.get(p.id) || 0) > 0); if (!pool.length) return;
    const p = pool[Math.floor(Math.random() * pool.length)]; scanning = true; sweep();
    let i = 0; scanIn.value = '';
    const iv = setInterval(() => { scanIn.value = p.bc.slice(0, ++i * 2); if (i * 2 >= p.bc.length) { clearInterval(iv); setTimeout(() => { scanIn.value = ''; scanning = false; if (addItem(p.id, cards.get(p.id))) { beep(); check('scan'); } }, 120); } }, 22);
  });

  /* ---------- discount + payment ---------- */
  $$('.dchip').forEach(b => b.addEventListener('click', () => {
    disc = b.dataset.d; $$('.dchip').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    renderBill(); if (disc !== '0' && bill.size) check('disc');
    if (disc !== '0' && !bill.size) say('Discount set', 'It will apply as soon as items are on the bill.');
  }));
  $$('.pay button').forEach(b => b.addEventListener('click', () => { pay = b.dataset.p; $$('.pay button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); renderBill(); }));

  /* ---------- receipt ---------- */
  const scrim = $('#scrim'), paper = $('#paper');
  const W = 40;
  const pad = (a, b, w = W) => { a = String(a); b = String(b); const room = w - b.length - 1; return (a.length > room ? a.slice(0, room - 1) + '…' : a).padEnd(room) + ' ' + b; };
  function receiptRows() {
    const t = totals(), d = new Date(), R = [];
    R.push({ c: 'big', s: 'SHARMA GENERAL STORE' }, { c: 'c', s: 'Model Town Market · Ludhiana' }, { c: 'c', s: 'GSTIN 03DEMO0000X1Z5' }, { hr: 1 }, { c: 'c', s: 'TAX INVOICE' });
    R.push({ r: [`Bill #${billNo}`, d.toLocaleDateString('en-IN')] }, { r: ['Counter 1 · Cashier Aman', d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })] }, { hr: 1 });
    R.push({ r: ['Item            Qty x Rate', 'Amount'] }, { hr: 1 });
    bill.forEach((q, id) => { const p = byId.get(id); R.push({ r: [p.name, ''] }, { r: [`  ${q} x ${p.price.toFixed(2)}  (GST ${p.gst}%)`, (p.price * q).toFixed(2)] }); });
    R.push({ hr: 1 }, { r: ['Subtotal', t.sub.toFixed(2)] });
    if (t.dAmt) R.push({ r: [disc === 'flat50' ? 'Discount (flat)' : `Discount ${disc}%`, '-' + t.dAmt.toFixed(2)] });
    R.push({ r: ['Taxable value', t.taxable.toFixed(2)] });
    t.gst.forEach(g => { R.push({ r: [`CGST ${g.r / 2}% on ${g.t.toFixed(2)}`, (g.x / 2).toFixed(2)] }, { r: [`SGST ${g.r / 2}% on ${g.t.toFixed(2)}`, (g.x / 2).toFixed(2)] }); });
    R.push({ r: ['Round off', (t.round >= 0 ? '+' : '-') + Math.abs(t.round).toFixed(2)] }, { hr: 1 }, { r: ['TOTAL  INR', t.grand.toFixed(2)], big: 1 }, { r: [`Paid via ${pay}`, `${t.items} items`] }, { hr: 1 });
    return { R, t };
  }
  function qrSvg(seed) {
    const s = svgEl('svg', { width: 76, height: 76, viewBox: '0 0 25 25', 'shape-rendering': 'crispEdges', 'aria-label': 'UPI QR code' });
    let x = seed * 9301 + 49297; const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
    const finder = (fx, fy) => { s.append(svgEl('rect', { x: fx, y: fy, width: 7, height: 7, fill: '#111' }), svgEl('rect', { x: fx + 1, y: fy + 1, width: 5, height: 5, fill: '#FBFBF7' }), svgEl('rect', { x: fx + 2, y: fy + 2, width: 3, height: 3, fill: '#111' })); };
    for (let yy = 0; yy < 25; yy++) for (let xx = 0; xx < 25; xx++) { const inF = (xx < 8 && yy < 8) || (xx > 16 && yy < 8) || (xx < 8 && yy > 16); if (!inF && rnd() > .52) s.append(svgEl('rect', { x: xx, y: yy, width: 1, height: 1, fill: '#111' })); }
    finder(0, 0); finder(18, 0); finder(0, 18); return s;
  }
  function barSvg(text) {
    const s = svgEl('svg', { width: 200, height: 34, viewBox: '0 0 200 34', 'aria-hidden': 'true' }); let x = 6;
    [...text].forEach((ch, i) => { const v = ch.charCodeAt(0) + i; for (let k = 0; k < 4; k++) { const w = 1 + ((v >> k) & 1) + (k % 2); s.append(svgEl('rect', { x, y: 0, width: w, height: 34, fill: '#111' })); x += w + 1 + ((v >> (k + 1)) & 1); } });
    return s;
  }
  function openReceipt() {
    if (!bill.size) return;
    const { R } = receiptRows(); paper.replaceChildren();
    R.forEach(r => {
      if (r.hr) paper.append(el('div', 'hr'));
      else if (r.c) paper.append(el('div', r.c === 'big' ? 'c big' : 'c', r.s));
      else { const d = el('div', 'r' + (r.big ? ' t' : '')); d.append(el('span', null, r.r[0]), el('span', null, r.r[1])); paper.append(d); }
    });
    const qr = el('div', 'qr'); const cap = el('div', null); cap.append(el('div', null, 'Scan to pay'), el('div', null, 'or review us'), el('div', null, 'next visit ★'));
    qr.append(qrSvg(billNo), cap); paper.append(qr);
    const bc = el('div', 'c'); bc.style.marginTop = '8px'; bc.append(barSvg(`INV${billNo}`)); paper.append(bc, el('div', 'c', `INV-${billNo}`), el('div', 'c', 'Thank you! Visit again 🙏'));
    scrim.hidden = false;
    if (G) { G.from(scrim, { opacity: 0, duration: .25 }); G.fromTo(paper, { yPercent: -100 }, { yPercent: 0, duration: .9, ease: 'power2.out' }); G.from('.side > *', { x: 20, opacity: 0, duration: .4, stagger: .05, delay: .15, clearProps: 'transform,opacity' }); }
    $('#printBtn').focus();
  }
  function closeReceipt() { scrim.hidden = true; }
  $('#chargeBtn').addEventListener('click', openReceipt);
  $('#closeRc').addEventListener('click', closeReceipt);
  scrim.addEventListener('click', e => { if (e.target === scrim) closeReceipt(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'F9' && !$('#win').hidden) { e.preventDefault(); if (scrim.hidden) openReceipt(); else $('#printBtn').click(); }
    if (e.key === 'Escape' && !scrim.hidden) closeReceipt();
  });
  let printing = false, roll = 92;
  $('#printBtn').addEventListener('click', () => {
    if (printing || !bill.size) return; printing = true;
    const t = totals(), no = billNo, items = [...bill.entries()];
    const buzz = setInterval(() => tone(140 + Math.random() * 40, .05, 'sawtooth', .015), 70);
    const finish = () => {
      clearInterval(buzz); beep();
      items.forEach(([id, q]) => { byId.get(id).stock -= q; });
      sales.total += t.grand; sales.bills++; sales.gst += t.tax; hourly[curH] += t.grand;
      roll = Math.max(5, roll - 2); $('#rollPct').textContent = roll + '%'; $('#rollBar').style.width = roll + '%';
      addJob(`Receipt #${no}`, `${t.items} items · ${inr0(t.grand)} · ${pay}`, true);
      bill.clear(); billNo++; $('#billNo').textContent = '#' + billNo;
      disc = '0'; $$('.dchip').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.d === '0')));
      closeReceipt(); update(); renderStock(); renderReports(); printing = false;
      say(`Printed bill #${no}`, `${inr(t.grand)} received via ${pay}. Stock updated, next bill ready.`);
      check('print');
    };
    if (G) G.fromTo(paper, { yPercent: -100 }, { yPercent: 0, duration: 1.8, ease: 'steps(36)', onComplete: () => setTimeout(finish, 350) });
    else setTimeout(finish, 300);
  });
  $('#exportBtn').addEventListener('click', () => {
    const { R } = receiptRows();
    const txt = R.map(r => r.hr ? '-'.repeat(W) : r.c ? r.s.padStart(Math.floor((W + r.s.length) / 2)) : pad(r.r[0], r.r[1])).join('\n') + `\n\n${'Thank you! Visit again'.padStart(31)}\n`;
    const url = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }));
    const a = el('a'); a.href = url; a.download = `bill-${billNo}.txt`; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    say('Receipt exported', `bill-${billNo}.txt saved to your downloads.`); check('print');
  });

  /* ---------- stock view ---------- */
  function renderStock() {
    const body = $('#invBody'); body.replaceChildren(); let low = 0;
    P.forEach(p => {
      const tr = el('tr'), lvl = el('span', 'lvl'), i = el('i'); const pct = Math.min(100, p.stock / 40 * 100);
      i.style.width = Math.max(3, pct) + '%'; i.className = p.stock === 0 ? 'out' : p.stock <= 5 ? 'low' : ''; lvl.append(i);
      if (p.stock <= 5) low++;
      const td = el('td'); td.append(lvl, document.createTextNode(p.stock === 0 ? 'Out' : p.stock));
      const rs = el('button', 'mini', '+10 restock'); rs.type = 'button';
      rs.addEventListener('click', () => { p.stock += 10; renderStock(); renderGrid(false); addJob('Shelf labels', `${p.name} · 10 labels`, false); say('Restocked', `${p.name}: +10 units, shelf labels sent to the label printer.`); });
      const act = el('td'); act.append(rs);
      tr.append(el('td', null, p.name), el('td', 'm', p.bc), el('td', null, p.gst + '%'), el('td', 'm', inr0(p.price)), td, act);
      body.append(tr);
    });
    const b = $('#lowBdg'); b.hidden = !low; b.textContent = low;
  }

  /* ---------- print queue ---------- */
  const jobs = $('#jobs');
  function addJob(title, sub, receipt) {
    const j = el('div', 'job'), pb = el('div', 'pb'), fill = el('i'), s = el('span', 's', 'Printing…');
    pb.append(fill); j.append(el('span', 'm', new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })), (() => { const d = el('div'); d.append(el('b', null, title), document.createTextNode(' '), el('span', 'm', sub)); return d; })(), pb, s);
    jobs.prepend(j);
    const fin = () => { s.textContent = receipt ? 'Printed ✓' : 'Labels ✓'; s.classList.add('ok'); fill.style.width = '100%'; };
    if (G) { G.from(j, { y: -10, opacity: 0, duration: .35 }); G.to(fill, { width: '100%', duration: 1.2, ease: 'power1.inOut', onComplete: fin }); } else fin();
  }
  [['Shelf labels', 'Toor Dal 1 kg · 12 labels', false], ['Receipt #1041', '6 items · ₹712 · Cash', true], ['Receipt #1042', '2 items · ₹289 · UPI', true]].forEach(a => addJob(...a));

  /* ---------- reports ---------- */
  const hourly = [620, 1340, 2210, 1680, 1420, 1890, 2560, 1980, 1240, 1610, 1870, 1420, 980];
  const HOURS = Array.from({ length: 13 }, (_, i) => 9 + i);
  const curH = Math.min(12, Math.max(0, new Date().getHours() - 9));
  for (let i = curH + 1; i < hourly.length; i++) hourly[i] = 0;
  function renderReports() {
    $('#kSales').textContent = inr0(sales.total); $('#kBills').textContent = sales.bills; $('#kAvg').textContent = inr0(sales.total / sales.bills); $('#kGst').textContent = inr0(sales.gst);
    const svg = $('#chart'); svg.replaceChildren(); const max = Math.max(3000, ...hourly) * 1.1, bw = 800 / 13;
    for (let g = 0; g <= 3; g++) { const y = 190 - g * 55; svg.append(svgEl('line', { x1: 0, x2: 800, y1: y, y2: y, stroke: 'currentColor', 'stroke-opacity': .1 })); }
    hourly.forEach((v, i) => {
      const h = v / max * 170, x = i * bw + 10;
      const r = svgEl('rect', { x, y: 190 - h, width: bw - 20, height: Math.max(h, 1), rx: 5, fill: i === curH ? '#3A86FF' : 'rgba(58,134,255,.35)' });
      svg.append(r);
      const lab = svgEl('text', { x: x + (bw - 20) / 2, y: 210, 'text-anchor': 'middle', 'font-size': 11, fill: 'currentColor', 'fill-opacity': .55 }); lab.textContent = `${HOURS[i] % 12 || 12}${HOURS[i] < 12 ? 'a' : 'p'}`; svg.append(lab);
      if (i === curH && v) { const t = svgEl('text', { x: x + (bw - 20) / 2, y: 182 - h, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#3A86FF' }); t.textContent = inr0(v); svg.append(t); }
    });
  }

  /* ---------- navigation, theme ---------- */
  const pip = $('#pip');
  function placePip(b, anim) { const y = b.offsetTop + b.offsetHeight / 2 - 10; if (G && anim) G.to(pip, { top: y, duration: .5, ease: 'elastic.out(1,.6)' }); else pip.style.top = y + 'px'; }
  $$('#rail button').forEach(b => b.addEventListener('click', () => {
    $$('#rail button').forEach(x => x.toggleAttribute('aria-current', x === b)); b.setAttribute('aria-current', 'page');
    $$('.view').forEach(v => { v.hidden = v.dataset.view !== b.dataset.v; });
    placePip(b, true);
    if (b.dataset.v === 'inv') renderStock(); if (b.dataset.v === 'rep') renderReports();
    const v = $(`.view[data-view="${b.dataset.v}"]`); if (G) G.from(v, { opacity: 0, x: 10, duration: .3, clearProps: 'opacity,transform' });
  }));
  $('#themeBtn').addEventListener('click', () => {
    const w = $('#win'), light = w.dataset.theme !== 'light'; w.dataset.theme = light ? 'light' : 'dark';
    $('#themeBtn').setAttribute('aria-checked', String(light)); check('theme');
  });

  /* ---------- window management ---------- */
  const win = $('#win'), tb = $('#titlebar'), tbApp = $('#tbApp');
  let drag = null, maxed = false, saved = null;
  tb.addEventListener('pointerdown', e => { if (e.target.closest('button') || maxed) return; const [x, y] = toDesk(e.clientX, e.clientY); drag = { x, y, l: win.offsetLeft, t: win.offsetTop }; try { tb.setPointerCapture(e.pointerId); } catch (_) {} });
  tb.addEventListener('pointermove', e => { if (!drag) return; const [x, y] = toDesk(e.clientX, e.clientY); win.style.left = Math.max(-900, Math.min(1100, drag.l + x - drag.x)) + 'px'; win.style.top = Math.max(0, Math.min(640, drag.t + y - drag.y)) + 'px'; });
  tb.addEventListener('pointerup', () => { drag = null; });
  tb.addEventListener('dblclick', e => { if (!e.target.closest('button')) maximise(); });
  function maximise() {
    if (!maxed) saved = { left: win.offsetLeft, top: win.offsetTop, width: win.offsetWidth, height: win.offsetHeight };
    const to = maxed ? saved : { left: 0, top: 0, width: 1200, height: 672 }; maxed = !maxed;
    const css = Object.fromEntries(Object.entries(to).map(([k, v]) => [k, v + 'px']));
    if (G) G.to(win, { ...css, duration: .35, ease: 'power3.inOut' }); else Object.assign(win.style, css);
  }
  function minimise() {
    tbApp.classList.add('min');
    const tr = tbApp.getBoundingClientRect(), wr = win.getBoundingClientRect();
    if (G) G.to(win, { x: (tr.left - wr.left - wr.width / 2) / S, y: (tr.top - wr.top - wr.height / 2) / S, scale: .08, opacity: 0, duration: .35, ease: 'power2.in', onComplete: () => { win.hidden = true; } }); else win.hidden = true;
  }
  function restore() { win.hidden = false; tbApp.classList.remove('min'); tbApp.classList.add('open'); if (G) G.to(win, { x: 0, y: 0, scale: 1, opacity: 1, duration: .4, ease: 'expo.out' }); }
  $('#wMin').addEventListener('click', minimise); $('#wMax').addEventListener('click', maximise);
  $('#wClose').addEventListener('click', () => { win.hidden = true; tbApp.classList.remove('open'); closeReceipt(); say('PrintQueue+ closed', 'The open bill is kept. Reopen it from the taskbar.'); });
  tbApp.addEventListener('click', () => { if (win.hidden) restore(); else minimise(); });

  /* ---------- boot ---------- */
  $('#billNo').textContent = '#' + billNo;
  renderGrid(false); renderBill(); renderStock(); renderReports();
  placePip($('#rail button[aria-current="page"]'), false);
  if (G) {
    G.from('.intro > *', { y: 24, opacity: 0, duration: .8, stagger: .1, ease: 'expo.out' });
    G.from('#win', { y: 40, scale: .97, opacity: 0, duration: .7, ease: 'expo.out', delay: .3 });
    G.from('.prod', { y: 16, opacity: 0, duration: .45, stagger: .03, ease: 'power3.out', delay: .6, clearProps: 'transform,opacity' });
  }
})();
