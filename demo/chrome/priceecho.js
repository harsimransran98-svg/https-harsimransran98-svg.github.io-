/* PriceEcho — coupon finder & price tracker simulator (Bazozo Studio).
   The store, codes and prices are fictional. All DOM is built with createElement + textContent. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, a) => { const n = document.createElementNS(NS, tag); Object.entries(a).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
  const wait = ms => new Promise(r => setTimeout(r, reduced ? Math.min(ms, 60) : ms));
  $('#year').textContent = new Date().getFullYear();

  /* ---------- scale ---------- */
  const wrap = $('#stageWrap'); let S = 1;
  function fit() { S = Math.max(.5, Math.min(1, wrap.clientWidth / 1200)); wrap.style.setProperty('--s', S.toFixed(4)); }
  window.addEventListener('resize', fit); fit();

  /* ---------- checklist + notification ---------- */
  const done = new Set();
  function check(k) { if (done.has(k)) return; done.add(k); const c = $(`#tryList [data-t="${k}"]`); if (c) { c.classList.add('done'); if (G) G.fromTo(c, { scale: .9 }, { scale: 1, duration: .45, ease: 'back.out(3)' }); } $('#tryCount').textContent = `${done.size}/5`; }
  const notif = $('#notif'); let nt = null;
  function notify(t, b) { $('#nT').textContent = t; $('#nB').textContent = b; notif.hidden = false; clearTimeout(nt); if (G) G.fromTo(notif, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: 'back.out(1.6)' }); nt = setTimeout(() => { notif.hidden = true; }, 3800); }

  /* ---------- cart ---------- */
  const PRICE = 249, SHIP = 9.99, TAX = .08;
  let qty = 1, applied = null;
  const usd = n => '$' + n.toFixed(2);
  const CODES = [
    { code: 'SAVE10', note: '10% off sitewide', test: (sub) => ({ ok: true, item: sub * .1, ship: false, msg: '10% off' }) },
    { code: 'FREESHIP', note: 'Free standard shipping', test: () => ({ ok: true, item: 0, ship: true, msg: 'Free shipping' }) },
    { code: 'AUDIO25', note: '25% off one audio item', test: (sub, q) => q === 1 ? { ok: true, item: sub * .25, ship: false, msg: '25% off' } : { ok: false, msg: 'Limit 1 item' } },
    { code: 'TAKE70', note: '$70 off orders $400+', test: (sub) => sub >= 400 ? { ok: true, item: 70, ship: false, msg: '$70 off' } : { ok: false, msg: 'Needs $400+' } },
    { code: 'SPRING30', note: 'Spring sale', test: () => ({ ok: false, msg: 'Expired' }) }
  ];
  function calc(c) {
    const sub = PRICE * qty, r = c ? c.test(sub, qty) : { ok: false };
    const item = r.ok ? r.item : 0, ship = r.ok && r.ship ? 0 : SHIP, tax = (sub - item) * TAX;
    return { sub, item, ship, tax, total: sub - item + ship + tax, r };
  }
  let shownTotal = 0;
  function renderCart(anim) {
    const base = calc(null), c = applied ? calc(applied) : base;
    $('#qty').textContent = qty; $('#cartN').textContent = qty;
    $('#sItems').textContent = `Aero Max × ${qty}`; $('#sSub').textContent = usd(c.sub);
    $('#sShip').textContent = c.ship ? usd(c.ship) : 'FREE'; $('#sTax').textContent = usd(c.tax);
    const dr = $('#sDiscRow'); dr.hidden = !applied || !c.item;
    if (applied) { $('#sDiscL').textContent = `Promo ${applied.code}`; $('#sDisc').textContent = '−' + usd(c.item); }
    const was = $('#tWas'); was.hidden = !applied; was.textContent = usd(base.total);
    const tot = $('#tot');
    if (G && anim) { const o = { v: shownTotal }; G.to(o, { v: c.total, duration: 1, ease: 'power3.out', onUpdate: () => { tot.textContent = usd(o.v); } }); }
    else tot.textContent = usd(c.total);
    shownTotal = c.total;
  }
  function setQty(n) {
    qty = Math.max(1, Math.min(5, n)); check('cart');
    if (applied && !applied.test(PRICE * qty, qty).ok) {
      const lost = applied.code; applied = null; setPin(''); pmsg(`${lost} no longer applies to ${qty} items. Run PriceEcho again.`, 'bad');
      $('#winCard').hidden = true; $$('.code').forEach(r => r.classList.remove('best'));
    }
    renderCart(true);
  }
  $('#qMinus').addEventListener('click', () => setQty(qty - 1));
  $('#qPlus').addEventListener('click', () => setQty(qty + 1));
  $('#addBtn').addEventListener('click', () => {
    if (qty >= 5) { pmsg('Limit 5 per order.', 'bad'); return; }
    setQty(qty + 1); const b = $('#addBtn'); b.textContent = 'Added ✓';
    if (G) G.fromTo('.s-cart', { scale: 1.4 }, { scale: 1, duration: .5, ease: 'elastic.out(1,.4)' });
    setTimeout(() => { b.textContent = 'Add to cart'; }, 1200);
  });
  $$('#sws .sw').forEach(b => b.addEventListener('click', () => {
    $$('#sws .sw').forEach(x => x.setAttribute('aria-pressed', String(x === b))); $('#swName').textContent = b.dataset.n;
    $$('#heroImg .cup').forEach(c => { if (G) G.to(c, { attr: { fill: b.dataset.c }, duration: .4 }); else c.setAttribute('fill', b.dataset.c); });
    if (G) G.fromTo('#heroImg svg', { rotation: -6, scale: .94 }, { rotation: 0, scale: 1, duration: .7, ease: 'elastic.out(1,.5)' });
  }));

  /* ---------- the page's promo field ---------- */
  const pin = $('#pin');
  function setPin(text, cursor) { pin.replaceChildren(); if (!text && !cursor) { pin.append(el('span', 'ph', 'Promo code')); return; } pin.append(document.createTextNode(text)); if (cursor) pin.append(el('span', 'cur')); }
  function pmsg(t, cls) { const m = $('#pmsg'); m.textContent = t; m.className = 'pmsg' + (cls ? ' ' + cls : ''); }
  async function typeCode(code) { pin.className = 'pin typing'; for (let i = 1; i <= code.length; i++) { setPin(code.slice(0, i), true); await wait(45); } setPin(code, false); }

  /* ---------- sidebar ---------- */
  const side = $('#side'), page = $('#page'), ext = $('#ext');
  let open = false;
  function openSide() {
    open = true; ext.setAttribute('aria-expanded', 'true'); ext.classList.add('seen'); $('#callout').hidden = true;
    if (G) { G.to(side, { x: 0, duration: .6, ease: 'expo.out' }); G.to(page, { right: 372, duration: .6, ease: 'expo.out' }); G.from('.side-b > *', { x: 40, opacity: 0, duration: .5, stagger: .07, delay: .15, ease: 'power3.out', clearProps: 'transform,opacity' }); }
    else { side.style.transform = 'none'; page.style.right = '372px'; }
    drawChart(); check('open');
  }
  function closeSide() {
    open = false; ext.setAttribute('aria-expanded', 'false');
    if (G) { G.to(side, { x: 380, duration: .45, ease: 'power3.in' }); G.to(page, { right: 0, duration: .45, ease: 'power3.in' }); }
    else { side.style.transform = ''; page.style.right = '0'; }
  }
  if (G) G.set(side, { x: 380 });
  ext.addEventListener('click', () => open ? closeSide() : openSide());
  $('#sideX').addEventListener('click', closeSide);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeSide(); });
  if (G) G.to('#callout', { y: -6, duration: .8, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  /* ---------- coupon testing ---------- */
  const rows = new Map();
  CODES.forEach(c => {
    const r = el('div', 'code'), l = el('div'); l.append(el('b', null, c.code), el('small', null, c.note));
    const res = el('span', 'r', 'untested'); r.append(l, res); rows.set(c.code, { r, res }); $('#codes').append(r);
  });
  let testing = false;
  $('#testBtn').addEventListener('click', async () => {
    if (testing) return; testing = true;
    const btn = $('#testBtn'); btn.disabled = true; $('#winCard').hidden = true; applied = null; renderCart(true);
    rows.forEach(({ r, res }) => { r.className = 'code'; res.textContent = 'queued'; });
    const sum = $('.summary'), target = Math.max(0, sum.offsetTop + sum.offsetHeight - page.clientHeight + 16);
    if (G) G.to(page, { scrollTop: target, duration: .7, ease: 'power2.inOut' }); else page.scrollTop = target;
    const base = calc(null).total; let best = null, bestSave = 0;
    for (let i = 0; i < CODES.length; i++) {
      const c = CODES[i], { r, res } = rows.get(c.code);
      r.classList.add('run'); res.replaceChildren(el('span', 'spin')); $('#testTxt').textContent = `Testing ${c.code}… (${i + 1}/5)`;
      if (G) G.fromTo(r, { x: -4 }, { x: 0, duration: .3 });
      await typeCode(c.code); await wait(380);
      const x = calc(c), save = base - x.total;
      r.classList.remove('run');
      if (x.r.ok) { r.classList.add('ok'); res.textContent = `−${usd(save)}`; pin.className = 'pin'; pmsg(`${c.code} works: ${x.r.msg} (−${usd(save)})`, 'ok'); if (save > bestSave) { best = c; bestSave = save; } }
      else { r.classList.add('no'); res.textContent = `✗ ${x.r.msg}`; pin.className = 'pin bad'; pmsg(`${c.code}: ${x.r.msg}`, 'bad'); }
      const p = (i + 1) / CODES.length * 100;
      if (G) { G.to('#pbar', { width: p + '%', duration: .4, ease: 'power2.out' }); G.to('#testFl', { width: p + '%', duration: .4 }); } else $('#pbar').style.width = p + '%';
      await wait(260);
    }
    if (best) {
      $('#testTxt').textContent = `Applying ${best.code}…`;
      await typeCode(best.code); pin.className = 'pin';
      applied = best; rows.get(best.code).r.classList.add('best'); rows.get(best.code).res.textContent = `★ −${usd(bestSave)}`;
      pmsg(`${best.code} applied. You save ${usd(bestSave)}.`, 'ok'); renderCart(true);
      $('#winT').textContent = `You saved ${usd(bestSave)}`; $('#winS').textContent = `${best.code} was the best of 5 codes · ${Math.round(bestSave / base * 100)}% off this order`;
      const w = $('#winCard'); w.hidden = false; if (G) G.from(w, { scale: .8, opacity: 0, duration: .6, ease: 'back.out(2)' });
      const sb = $('.side-b'); if (G) G.to(sb, { scrollTop: w.offsetTop - 120, duration: .6, ease: 'power2.inOut' }); else sb.scrollTop = w.offsetTop - 120;
      confetti(); badgeTo('✓');
    }
    $('#testTxt').textContent = 'Re-test codes'; if (G) G.set('#testFl', { width: 0 }); btn.disabled = false; testing = false;
    check('test');
  });
  function badgeTo(t) { $('#badge').textContent = t; if (G) G.fromTo('#badge', { scale: 1.6 }, { scale: 1, duration: .5, ease: 'back.out(3)' }); }
  function confetti() {
    if (!G) return; const vp = $('#vp'), vr = vp.getBoundingClientRect(), tr = $('#tot').getBoundingClientRect();
    const x0 = (tr.left + tr.width / 2 - vr.left) / S, y0 = (tr.top - vr.top) / S;
    const COL = ['#22C55E', '#FACC15', '#86EFAC', '#F97316', '#38BDF8', '#F472B6'];
    for (let i = 0; i < 46; i++) {
      const c = el('span', 'confetti'); c.style.background = COL[i % COL.length]; c.style.left = x0 + 'px'; c.style.top = y0 + 'px'; vp.append(c);
      const a = -Math.PI / 2 + (Math.random() - .5) * 2.2, v = 120 + Math.random() * 220;
      G.to(c, { x: Math.cos(a) * v, y: Math.sin(a) * v, rotation: Math.random() * 720, duration: .8, ease: 'power3.out' });
      G.to(c, { y: '+=180', opacity: 0, duration: 1, delay: .7, ease: 'power1.in', onComplete: () => c.remove() });
    }
  }

  /* ---------- price history ---------- */
  const DAYS = 90, hist = [];
  (() => {
    let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < DAYS; i++) {
      let v = 279 + (r() - .5) * 8;
      if (i >= 22 && i <= 27) v = 219 + r() * 4;
      if (i >= 52 && i <= 56) v = 239 + r() * 3;
      if (i >= DAYS - 12) v = 249;
      hist.push(Math.round(v));
    }
  })();
  const dayDate = i => { const d = new Date(); d.setDate(d.getDate() - (DAYS - 1 - i)); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
  const lo = Math.min(...hist), loI = hist.indexOf(lo);
  const sorted = [...hist].sort((a, b) => a - b), typical = sorted[Math.floor(DAYS / 2)];
  $('#lgLo').textContent = `$${lo} · ${dayDate(loI)}`; $('#lgTy').textContent = `$${typical}`; $('#lgNow').textContent = `$${hist[DAYS - 1]}`;
  const W = 340, H = 130, Y0 = 200, Y1 = 300;
  const px = i => i / (DAYS - 1) * W, py = v => H - 10 - (v - Y0) / (Y1 - Y0) * (H - 24);
  let drawn = false, cross = null, dot = null;
  function drawChart() {
    if (drawn) return; drawn = true;
    const s = $('#chartSvg');
    const defs = sv('defs', {}), g = sv('linearGradient', { id: 'ar', x1: 0, y1: 0, x2: 0, y2: 1 });
    g.append(sv('stop', { offset: 0, 'stop-color': '#22C55E', 'stop-opacity': .35 }), sv('stop', { offset: 1, 'stop-color': '#22C55E', 'stop-opacity': 0 })); defs.append(g); s.append(defs);
    [220, 250, 280].forEach(v => { s.append(sv('line', { x1: 0, x2: W, y1: py(v), y2: py(v), stroke: 'rgba(255,255,255,.07)', 'vector-effect': 'non-scaling-stroke' })); });
    const d = hist.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');
    s.append(sv('path', { d: `${d} L${W} ${H} L0 ${H} Z`, fill: 'url(#ar)' }));
    const line = sv('path', { d, fill: 'none', stroke: '#22C55E', 'stroke-width': 2.2, 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round' }); s.append(line);
    s.append(sv('circle', { cx: px(loI), cy: py(lo), r: 4, fill: '#FACC15', 'vector-effect': 'non-scaling-stroke' }));
    cross = sv('line', { x1: 0, x2: 0, y1: 0, y2: H, stroke: 'rgba(255,255,255,.4)', 'stroke-dasharray': '3 3', 'vector-effect': 'non-scaling-stroke', visibility: 'hidden' });
    dot = sv('circle', { r: 4.5, fill: '#fff', stroke: '#22C55E', 'stroke-width': 2, visibility: 'hidden', 'vector-effect': 'non-scaling-stroke' }); s.append(cross, dot);
    if (G) { const len = line.getTotalLength(); G.fromTo(line, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out', delay: .3 }); }
  }
  const chart = $('#chart'), tip = $('#tip'); let scrubs = 0;
  function scrub(e) {
    const r = chart.getBoundingClientRect(), f = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), i = Math.round(f * (DAYS - 1)), v = hist[i];
    cross.setAttribute('x1', px(i)); cross.setAttribute('x2', px(i)); cross.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', px(i)); dot.setAttribute('cy', py(v)); dot.setAttribute('visibility', 'visible');
    tip.hidden = false; tip.textContent = `${dayDate(i)} · $${v}${i === loI ? ' · lowest' : ''}`; tip.style.left = Math.max(14, Math.min(86, f * 100)) + '%';
    if (++scrubs > 4) check('history');
  }
  chart.addEventListener('pointermove', scrub);
  chart.addEventListener('pointerdown', e => { try { chart.setPointerCapture(e.pointerId); } catch (_) {} scrub(e); });
  chart.addEventListener('pointerleave', () => { tip.hidden = true; if (cross) { cross.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); } });

  /* ---------- price alert ---------- */
  const alIn = $('#alIn'); let watching = false;
  function alUi() {
    const v = +alIn.value, p = (v - 199) / 50 * 100, hits = hist.filter(h => h <= v).length;
    $('#alV').textContent = '$' + v; $('#alFl').style.width = p + '%'; $('#alTh').style.left = p + '%';
    $('#alSub').textContent = hits ? `At or below $${v} on ${hits} of the last 90 days.` : `Never this low in 90 days. You may wait a while.`;
    $('#watchBtn').textContent = watching ? `Watching · below $${v} ✓` : `Notify me below $${v}`;
  }
  alIn.addEventListener('input', alUi);
  $('#watchBtn').addEventListener('click', () => {
    watching = !watching; const b = $('#watchBtn'); b.classList.toggle('on', watching); $('#alState').textContent = watching ? 'on' : 'off'; alUi();
    if (watching) { if (G) G.fromTo(b, { scale: .94 }, { scale: 1, duration: .5, ease: 'elastic.out(1,.4)' }); notify('PriceEcho is watching', `We’ll ping you when Aero Max drops below $${alIn.value}.`); check('alert'); }
  });

  /* ---------- boot ---------- */
  setPin(''); renderCart(false); alUi();
  if (G) {
    G.from('.intro > *', { y: 24, opacity: 0, duration: .8, stagger: .1, ease: 'expo.out' });
    G.from('#stage', { y: 40, opacity: 0, duration: .8, ease: 'expo.out', delay: .2 });
    G.from('#callout', { scale: 0, opacity: 0, duration: .6, ease: 'back.out(2)', delay: 1.4 });
  }
})();
