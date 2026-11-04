/* Pantry Ping — interactive Pixel delivery prototype (Bazozo Studio). DOM built with textContent only. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const hasMP = !!(G && window.MotionPathPlugin);
  if (hasMP) G.registerPlugin(MotionPathPlugin);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const svgEl = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.append(n); return n; };
  const haptic = (p = 8) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  const usd = n => '$' + n.toFixed(2);
  $('#year').textContent = new Date().getFullYear();

  /* ---------- fit + clock ---------- */
  const stage = $('#stage');
  const scale = () => parseFloat(getComputedStyle(stage).getPropertyValue('--s')) || 1;
  function fit() {
    const vw = document.documentElement.clientWidth, wide = vw > 1180;
    stage.style.setProperty('--s', Math.max(.55, Math.min(1, wide ? (window.innerHeight - 110) / 840 : 1, (vw - 32) / 396)).toFixed(3));
  }
  window.addEventListener('resize', fit); fit();
  const tick = () => { const d = new Date(); $('#clock').textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };
  tick(); setInterval(tick, 15000);

  /* ---------- checklist + snackbar ---------- */
  const done = new Set();
  function check(k) { if (done.has(k)) return; done.add(k); const li = $(`#tryList [data-t="${k}"]`); if (li) li.classList.add('done'); $('#tryCount').textContent = `${done.size}/5`; $('#tryBar').style.width = (done.size * 20) + '%'; }
  const snack = $('#snack');
  function say(msg) {
    snack.textContent = msg;
    if (G) { G.killTweensOf(snack); G.fromTo(snack, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'back.out(1.6)' }); G.to(snack, { y: 20, opacity: 0, duration: .3, delay: 2.2 }); }
    else { snack.style.opacity = 1; setTimeout(() => { snack.style.opacity = 0; }, 2400); }
  }

  /* ---------- product illustrations (simple SVG shapes) ---------- */
  const ICONS = {
    avocado: [['ellipse', { cx: 50, cy: 54, rx: 28, ry: 36, fill: '#3E6B2A' }], ['ellipse', { cx: 50, cy: 56, rx: 21, ry: 29, fill: '#C9E27A' }], ['circle', { cx: 50, cy: 64, r: 12, fill: '#8A5A33' }], ['circle', { cx: 46, cy: 60, r: 3, fill: '#B07A4C' }]],
    loaf: [['path', { d: 'M14 66c0-18 16-30 36-30s36 12 36 30v6c0 4-3 6-6 6H20c-3 0-6-2-6-6v-6Z', fill: '#C98A45' }], ['path', { d: 'M30 50l10 10M44 46l10 12M58 46l10 12', stroke: '#F2D29B', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }], ['path', { d: 'M14 70h72', stroke: '#A86B2E', 'stroke-width': 3 }]],
    milk: [['path', { d: 'M32 30h36v54a4 4 0 0 1-4 4H36a4 4 0 0 1-4-4V30Z', fill: '#F4F7FB' }], ['path', { d: 'M32 30l8-14h20l8 14Z', fill: '#DDE6F1' }], ['rect', { x: 32, y: 50, width: 36, height: 18, fill: '#4A90D9' }], ['path', { d: 'M42 18h16', stroke: '#B8C6D8', 'stroke-width': 3 }]],
    eggs: [['ellipse', { cx: 34, cy: 60, rx: 13, ry: 17, fill: '#F6E7CF' }], ['ellipse', { cx: 62, cy: 58, rx: 13, ry: 17, fill: '#EFD8B4' }], ['ellipse', { cx: 48, cy: 46, rx: 13, ry: 17, fill: '#FBEFDC' }], ['path', { d: 'M18 70h64l-6 14H24Z', fill: '#B7926A' }]],
    berries: [['path', { d: 'M36 40c10-2 18 6 16 18-2 14-12 22-16 22S20 72 20 58c0-10 6-16 16-18Z', fill: '#E23A3A' }], ['path', { d: 'M62 34c10-2 18 6 16 18-2 14-12 22-16 22S46 66 46 52c0-10 6-16 16-18Z', fill: '#F04B4B' }], ['path', { d: 'M30 38l6-8 6 8M56 32l6-8 6 8', fill: '#3E8E3A' }], ['circle', { cx: 32, cy: 56, r: 1.6, fill: '#FCE38A' }], ['circle', { cx: 40, cy: 64, r: 1.6, fill: '#FCE38A' }], ['circle', { cx: 60, cy: 48, r: 1.6, fill: '#FCE38A' }], ['circle', { cx: 66, cy: 58, r: 1.6, fill: '#FCE38A' }]],
    croissant: [['path', { d: 'M14 64c6-22 26-34 36-34s30 12 36 34c-8 2-14-2-18-6-4 8-12 12-18 12s-14-4-18-12c-4 4-10 8-18 6Z', fill: '#D9953F' }], ['path', { d: 'M36 38l4 22M50 32v28M64 38l-4 22', stroke: '#B0702A', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }]],
    tomato: [['circle', { cx: 50, cy: 58, r: 26, fill: '#E8442E' }], ['circle', { cx: 40, cy: 50, r: 6, fill: '#F7836F' }], ['path', { d: 'M38 34l12 6 12-6-6 10h-12Z', fill: '#3E8E3A' }]],
    bowl: [['path', { d: 'M14 50h72c0 18-16 32-36 32S14 68 14 50Z', fill: '#2F6FB0' }], ['ellipse', { cx: 50, cy: 50, rx: 36, ry: 8, fill: '#F2E3C0' }], ['circle', { cx: 38, cy: 48, r: 6, fill: '#F6C744' }], ['circle', { cx: 58, cy: 47, r: 7, fill: '#5FAF4E' }], ['path', { d: 'M60 30l10 18M66 28l8 20', stroke: '#8A5A33', 'stroke-width': 3, 'stroke-linecap': 'round' }]],
    coffee: [['path', { d: 'M28 30h44l6 58H22Z', fill: '#5B3A2A' }], ['rect', { x: 34, y: 50, width: 32, height: 22, rx: 3, fill: '#F2E3C0' }], ['path', { d: 'M28 30l6-10h32l6 10', fill: '#43291D' }], ['circle', { cx: 50, cy: 61, r: 5, fill: '#5B3A2A' }]]
  };
  function icon(name, parent) {
    const s = svgEl('svg', { viewBox: '0 0 100 100', 'aria-hidden': 'true' }, parent);
    ICONS[name].forEach(([t, a]) => svgEl(t, a, s));
    return s;
  }

  /* ---------- catalogue ---------- */
  const PRODUCTS = [
    { id: 'avo', name: 'Ripe avocados', desc: 'Hass · ready to eat', cat: 'Produce', price: 3.5, bg: '#EAF3DD', icon: 'avocado', tag: 'Ripe today', sizes: [['2 pack', 0], ['4 pack', 2.8], ['6 pack', 5.2]], adds: [['Lime', .6], ['Chili flakes', .9]] },
    { id: 'loaf', name: 'Sourdough loaf', desc: 'Baked at 6am, 800g', cat: 'Bakery', price: 6.2, bg: '#F8E9D6', icon: 'loaf', tag: 'Fresh', sizes: [['Half', -2.4], ['Whole', 0], ['Sliced', .5]], adds: [['Cultured butter', 3.2], ['Honey', 4.5]] },
    { id: 'milk', name: 'Oat milk', desc: 'Barista edition, 1L', cat: 'Dairy', price: 2.9, bg: '#E7EFF8', icon: 'milk', sizes: [['1 L', 0], ['2 × 1 L', 2.5], ['6 × 1 L', 11]], adds: [['Chilled', 0], ['Vanilla shot', .8]] },
    { id: 'eggs', name: 'Free-range eggs', desc: 'Local farm, large', cat: 'Dairy', price: 4.1, bg: '#FBF0DE', icon: 'eggs', sizes: [['6', 0], ['12', 3.6], ['18', 6.9]], adds: [['Extra-large', 1.2]] },
    { id: 'berry', name: 'Strawberries', desc: 'British, 400g punnet', cat: 'Produce', price: 4.0, bg: '#FBE3E1', icon: 'berries', tag: 'In season', sizes: [['400 g', 0], ['800 g', 3.4], ['1.2 kg', 6.5]], adds: [['Clotted cream', 2.4], ['Dark chocolate', 2.9]] },
    { id: 'crois', name: 'Butter croissants', desc: 'Laminated in-house', cat: 'Bakery', price: 5.4, bg: '#F8E6CF', icon: 'croissant', sizes: [['2', 0], ['4', 4.6], ['6', 8.9]], adds: [['Jam', 1.5], ['Warm them', 0]] },
    { id: 'tom', name: 'Vine tomatoes', desc: 'Sweet and sun-ripened', cat: 'Produce', price: 2.6, bg: '#FCE3DE', icon: 'tomato', sizes: [['500 g', 0], ['1 kg', 2.1]], adds: [['Fresh basil', 1.1]] },
    { id: 'bowl', name: 'Miso ramen bowl', desc: 'Ready in 3 min · serves 1', cat: 'Meals', price: 8.9, bg: '#E2ECF6', icon: 'bowl', tag: 'Hot', sizes: [['Regular', 0], ['Large', 2.5]], adds: [['Soft egg', 1.5], ['Extra noodles', 2], ['Chili oil', .7]] },
    { id: 'coffee', name: 'House coffee beans', desc: 'Medium roast, 250g', cat: 'Pantry', price: 9.5, bg: '#F1E4D8', icon: 'coffee', sizes: [['Whole bean', 0], ['Ground', 0], ['1 kg', 24]], adds: [['Paper filters', 2.2]] }
  ];
  const CATS = ['All', 'Produce', 'Bakery', 'Dairy', 'Meals', 'Pantry'];
  let cat = 'All';
  const catsEl = $('#cats'), catInd = $('#catInd'), grid = $('#grid');
  CATS.forEach((c, i) => {
    const b = el('button', 'cat', c); b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0));
    b.addEventListener('click', () => { cat = c; haptic(5); if (c !== 'All') check('cat'); $$('.cat').forEach(x => x.setAttribute('aria-pressed', String(x === b))); moveInd(b); renderGrid(true); });
    catsEl.append(b);
  });
  function moveInd(b) { catInd.style.left = b.offsetLeft + 'px'; catInd.style.width = b.offsetWidth + 'px'; }
  function renderGrid(animate) {
    const list = PRODUCTS.filter(p => cat === 'All' || p.cat === cat);
    grid.replaceChildren();
    $('#secT').textContent = cat === 'All' ? 'Popular near you' : cat;
    $('#secN').textContent = list.length + (list.length === 1 ? ' item' : ' items');
    list.forEach(p => {
      const b = el('button', 'item'); b.type = 'button'; b.setAttribute('aria-label', `${p.name}, ${usd(p.price)}. Customise and add`);
      const pic = el('div', 'pic'); pic.style.background = p.bg; icon(p.icon, pic);
      b.append(pic);
      if (p.tag) b.append(el('span', 'tag', p.tag));
      const row = el('div', 'row'); row.append(el('span', 'price', usd(p.price)), el('span', 'plus', '+'));
      b.append(el('b', null, p.name), el('small', null, p.desc), row);
      b.addEventListener('click', () => openCustom(p, pic));
      grid.append(b);
    });
    if (G && animate) G.from(grid.children, { y: 24, opacity: 0, scale: .96, duration: .5, stagger: .04, ease: 'back.out(1.6)' });
  }

  /* ---------- sheets ---------- */
  const scrim = $('#scrim');
  let openSheetEl = null;
  function showSheet(s) {
    if (openSheetEl && openSheetEl !== s) openSheetEl.hidden = true;
    openSheetEl = s; s.hidden = false; scrim.hidden = false;
    if (G) { G.to(scrim, { opacity: 1, duration: .3 }); G.fromTo(s, { yPercent: 100 }, { yPercent: 0, duration: .6, ease: 'elastic.out(1, .9)' }); } else scrim.style.opacity = 1;
  }
  function hideSheet(cb) {
    const s = openSheetEl; if (!s) { if (cb) cb(); return; }
    openSheetEl = null;
    const fin = () => { s.hidden = true; scrim.hidden = true; if (cb) cb(); };
    if (G) { G.to(scrim, { opacity: 0, duration: .25 }); G.to(s, { yPercent: 100, duration: .3, ease: 'power3.in', onComplete: fin }); } else fin();
  }
  scrim.addEventListener('click', () => hideSheet());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && openSheetEl) hideSheet(); });

  /* customiser */
  const CZ = { p: null, size: 0, adds: new Set(), qty: 1, from: null };
  function czPrice() { const p = CZ.p; return (p.price + p.sizes[CZ.size][1] + [...CZ.adds].reduce((s, i) => s + p.adds[i][1], 0)); }
  function paintCz() {
    const unit = czPrice();
    $('#czQty').textContent = CZ.qty; $('#czTotal').textContent = usd(unit * CZ.qty);
    $$('.size').forEach((s, i) => s.setAttribute('aria-checked', String(i === CZ.size)));
    $$('.addon').forEach((a, i) => a.setAttribute('aria-checked', String(CZ.adds.has(i))));
  }
  function openCustom(p, fromPic) {
    Object.assign(CZ, { p, size: 0, adds: new Set(), qty: 1, from: fromPic });
    const pic = $('#czPic'); pic.replaceChildren(); pic.style.background = p.bg; icon(p.icon, pic);
    $('#czName').textContent = p.name; $('#czDesc').textContent = p.desc; $('#czBase').textContent = usd(p.price);
    const sz = $('#czSizes'); sz.replaceChildren();
    p.sizes.forEach(([lbl, d], i) => {
      const b = el('button', 'size', lbl); b.type = 'button'; b.setAttribute('role', 'radio');
      b.append(el('small', null, d === 0 ? 'base' : (d > 0 ? '+' : '−') + usd(Math.abs(d))));
      b.addEventListener('click', () => { CZ.size = i; haptic(5); paintCz(); });
      sz.append(b);
    });
    const ad = $('#czAdds'); ad.replaceChildren();
    p.adds.forEach(([lbl, pr], i) => {
      const b = el('button', 'addon'); b.type = 'button'; b.setAttribute('role', 'checkbox');
      b.append(el('i'), el('span', null, lbl), el('small', null, pr ? '+' + usd(pr) : 'free'));
      b.addEventListener('click', () => { CZ.adds.has(i) ? CZ.adds.delete(i) : CZ.adds.add(i); haptic(5); paintCz(); });
      ad.append(b);
    });
    paintCz(); showSheet($('#czSheet'));
    if (G) G.from('#czPic svg', { scale: .4, rotate: -20, duration: .8, ease: 'elastic.out(1, .5)', delay: .1 });
  }
  $('#czMinus').addEventListener('click', () => { CZ.qty = Math.max(1, CZ.qty - 1); haptic(4); paintCz(); });
  $('#czPlus').addEventListener('click', () => { CZ.qty = Math.min(20, CZ.qty + 1); haptic(4); paintCz(); });
  $('#czAdd').addEventListener('click', () => {
    const p = CZ.p, key = p.id + '|' + CZ.size + '|' + [...CZ.adds].sort().join(',');
    const ex = cart.find(l => l.key === key);
    if (ex) ex.qty += CZ.qty;
    else cart.push({ key, p, size: CZ.size, adds: [...CZ.adds], qty: CZ.qty, unit: czPrice() });
    check('custom'); haptic([8, 30, 12]);
    const from = CZ.from;
    hideSheet(() => flyToBag(p, from));
    renderCart();
  });

  /* fly the product into the bag */
  const screen = $('#screen'), bag = $('#bagBtn'), badge = $('#badge');
  function flyToBag(p, fromPic) {
    const bump = () => { if (G) G.fromTo(badge, { scale: 1.8 }, { scale: 1, duration: .6, ease: 'elastic.out(1.2, .4)' }); if (G) G.fromTo(bag, { rotate: -12 }, { rotate: 0, duration: .6, ease: 'elastic.out(1, .4)' }); };
    if (!G || !fromPic || !fromPic.isConnected) { bump(); return; }
    const s = scale(), sr = screen.getBoundingClientRect(), a = fromPic.getBoundingClientRect(), b = bag.getBoundingClientRect();
    const f = el('div', 'fly'); f.style.background = p.bg; icon(p.icon, f);
    const x0 = (a.left + a.width / 2 - sr.left) / s - 22, y0 = (a.top + a.height / 2 - sr.top) / s - 22;
    const x1 = (b.left + b.width / 2 - sr.left) / s - 22, y1 = (b.top + b.height / 2 - sr.top) / s - 22;
    f.style.left = x0 + 'px'; f.style.top = y0 + 'px'; screen.append(f);
    G.timeline({ onComplete: () => { f.remove(); bump(); } })
      .to(f, { x: x1 - x0, duration: .7, ease: 'power1.inOut' }, 0)
      .to(f, { y: y1 - y0, duration: .7, ease: 'back.in(1.4)' }, 0)
      .to(f, { scale: .35, rotate: 200, duration: .7, ease: 'power2.in' }, 0);
  }

  /* ---------- cart ---------- */
  let cart = [];
  const FREE = 25;
  function totals() { const sub = cart.reduce((s, l) => s + l.unit * l.qty, 0); const fee = sub === 0 || sub >= FREE ? 0 : 2.99; const service = sub ? 1.5 : 0; return { sub, fee, service, tot: sub + fee + service, n: cart.reduce((s, l) => s + l.qty, 0) }; }
  function renderCart() {
    const t = totals();
    badge.textContent = t.n; badge.dataset.n = t.n;
    $('#cartN').textContent = t.n + (t.n === 1 ? ' item' : ' items');
    const body = $('#cartBody'); body.replaceChildren();
    if (!cart.length) body.append(el('p', 'empty', 'Your cart is empty. Tap any product to add it.'));
    cart.forEach(l => {
      const r = el('div', 'cart-line');
      const pic = el('div', 'pic'); pic.style.background = l.p.bg; icon(l.p.icon, pic);
      const mid = el('div'); mid.append(el('b', null, l.p.name), el('small', null, [l.p.sizes[l.size][0], ...l.adds.map(i => l.p.adds[i][0])].join(' · ') + ' · ' + usd(l.unit * l.qty)));
      const q = el('div', 'qty');
      const m = el('button', null, '−'); m.type = 'button'; m.setAttribute('aria-label', 'Fewer ' + l.p.name);
      const n = el('b', null, String(l.qty));
      const pl = el('button', null, '+'); pl.type = 'button'; pl.setAttribute('aria-label', 'More ' + l.p.name);
      m.addEventListener('click', () => { l.qty--; if (l.qty <= 0) cart = cart.filter(x => x !== l); haptic(5); check('cart'); renderCart(); });
      pl.addEventListener('click', () => { l.qty = Math.min(20, l.qty + 1); haptic(5); check('cart'); renderCart(); });
      q.append(m, n, pl); r.append(pic, mid, q); body.append(r);
    });
    const sum = $('#cartSum'); sum.replaceChildren();
    const row = (k, v, cls) => { const d = el('div', cls); d.append(el('span', null, k), el('span', null, v)); sum.append(d); };
    if (cart.length) {
      const left = FREE - t.sub;
      const note = el('div'); note.style.fontSize = '12.5px'; note.textContent = left > 0 ? `Add ${usd(left)} more for free delivery` : 'You\'ve unlocked free delivery 🎉'.replace(' 🎉', '');
      const bar = el('div', 'free-bar'); const bi = el('i'); bi.style.width = Math.min(100, t.sub / FREE * 100) + '%'; bar.append(bi);
      sum.append(note, bar);
      row('Subtotal', usd(t.sub)); row('Delivery', t.fee ? usd(t.fee) : 'Free'); row('Service', usd(t.service)); row('Total', usd(t.tot), 'tot');
    }
    $('#placeTot').textContent = usd(t.tot);
    $('#placeBtn').disabled = !cart.length; $('#placeBtn').style.opacity = cart.length ? 1 : .4;
  }
  bag.addEventListener('click', () => { renderCart(); showSheet($('#cartSheet')); });
  $('#placeBtn').addEventListener('click', () => {
    if (!cart.length) return;
    const t = totals(); check('order'); haptic([10, 50, 20]);
    cart = []; renderCart();
    hideSheet(() => { go('orders'); startTracking(t.tot); });
  });

  /* ---------- live tracking ---------- */
  const route = $('#route'), rider = $('#riderDot');
  const L = route.getTotalLength();
  route.style.strokeDasharray = L; route.style.strokeDashoffset = L;
  let trip = null, speed = 1, timers = [];
  const stamp = () => { const d = new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };
  function setStep(i) { $$('#steps li').forEach((li, j) => li.classList.toggle('on', j <= i)); const s = $('#s' + i); if (s) s.textContent = stamp(); }
  function placeRider(p) {
    route.style.strokeDashoffset = L * (1 - p);
    if (!hasMP) { const pt = route.getPointAtLength(L * p); rider.setAttribute('transform', `translate(${pt.x} ${pt.y})`); }
    const mins = Math.max(0, Math.ceil(12 * (1 - p)));
    $('#etaVal').textContent = p >= 1 ? 'Delivered' : mins + ' min';
  }
  function startTracking(total) {
    timers.forEach(clearTimeout); timers = []; if (trip) trip.kill && trip.kill();
    $('#noOrder').hidden = true; $('#track').hidden = false; $('#ordDot').hidden = false;
    $('#ordNo').textContent = '#PP-' + (2041 + Math.floor(Math.random() * 900));
    $$('#steps small').forEach(s => { s.textContent = ''; });
    $('#etaLbl').textContent = 'Arriving in'; placeRider(0);
    if (hasMP) G.set(rider, { motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5], start: 0, end: 0 } });
    setStep(0); say(`Order placed · ${usd(total)} paid with Google Pay`);
    timers.push(setTimeout(() => setStep(1), 2200 / speed));
    timers.push(setTimeout(() => { setStep(2); ride(); }, 4400 / speed));
  }
  function ride() {
    const finish = () => { setStep(3); $('#etaLbl').textContent = 'Enjoy!'; placeRider(1); haptic([20, 60, 20]); say('Your order has arrived · rate Dev?'); check('track'); $('#ordDot').hidden = true; };
    if (hasMP) {
      trip = G.to(rider, { motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5] }, duration: 16, ease: 'power1.inOut', onUpdate() { placeRider(this.progress()); }, onComplete: finish });
      trip.timeScale(speed);
    } else {
      const t0 = performance.now(), dur = 16000 / speed;
      const step = now => { const p = Math.min(1, (now - t0) / dur); placeRider(p); if (p < 1) requestAnimationFrame(step); else finish(); };
      requestAnimationFrame(step);
    }
  }
  $('#speedBtn').addEventListener('click', e => {
    speed = speed === 1 ? 4 : 1; e.currentTarget.setAttribute('aria-pressed', String(speed > 1));
    e.currentTarget.textContent = `⏩ Demo speed: ${speed}×`;
    if (trip && trip.timeScale) trip.timeScale(speed);
  });

  /* ---------- navigation ---------- */
  const views = { shop: $('#v-shop'), orders: $('#v-orders'), account: $('#v-account') };
  const order = ['shop', 'orders', 'account'];
  let cur = 'shop';
  function go(v) {
    if (v === cur) return;
    const dir = order.indexOf(v) > order.indexOf(cur) ? 1 : -1, from = views[cur], to = views[v];
    $$('.navbar button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === v)));
    to.hidden = false; to.scrollTop = 0;
    if (G) { G.fromTo(to, { x: 40 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: 'expo.out' }); G.to(from, { x: -30 * dir, opacity: 0, duration: .25, onComplete: () => { from.hidden = true; G.set(from, { x: 0, opacity: 1 }); } }); }
    else from.hidden = true;
    cur = v; haptic(5);
  }
  $$('.navbar button').forEach(b => b.addEventListener('click', () => { if (openSheetEl) hideSheet(); go(b.dataset.v); }));
  $$('[data-jump]').forEach(b => b.addEventListener('click', () => {
    if (document.documentElement.clientWidth <= 1180) stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    const j = b.dataset.jump;
    if (j === 'custom') { go('shop'); setTimeout(() => openCustom(PRODUCTS[7], null), 300); }
    else if (j === 'cart') { go('shop'); setTimeout(() => { renderCart(); showSheet($('#cartSheet')); }, 300); }
    else { if (openSheetEl) hideSheet(); go(j); }
  }));

  /* ---------- boot ---------- */
  renderGrid(false); renderCart();
  requestAnimationFrame(() => moveInd($('.cat')));
  if (document.fonts) document.fonts.ready.then(() => moveInd($('.cat[aria-pressed="true"]')));
  if (G) {
    G.from('#device', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' });
    G.from('.side', { y: 30, opacity: 0, duration: 1, stagger: .15, ease: 'expo.out', delay: .2 });
    G.from('#v-shop > *', { y: 24, opacity: 0, duration: .7, stagger: .06, ease: 'expo.out', delay: .4 });
  }
})();
