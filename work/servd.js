/* Servd — QR table ordering for restaurants. Static demo by Bazozo Studio.
   Guest app (?mode=guest) and kitchen display (?mode=kitchen) share one localStorage
   "database" and update each other through the `storage` event.
   All user text goes through textContent / DOM nodes, never innerHTML. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = () => (window.gsap && !reduced ? window.gsap : null);
  const MODE = new URLSearchParams(location.search).get('mode') === 'kitchen' ? 'kitchen' : 'guest';
  const FRAMED = document.documentElement.classList.contains('framed');
  const DATA_KEY = 'servd.demo.v1', SESSION_KEY = 'servd.session.v1.' + MODE;
  const GST = 0.05;
  const rs = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const uid = () => Math.random().toString(36).slice(2, 10);
  const mins = t => Math.max(0, Math.floor((Date.now() - t) / 60000));

  /* ---------------- DOM helpers ---------------- */
  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    if (props) for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'css') for (const p in v) n.style.setProperty(p, v[p]);
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)));
    return n;
  }
  const NS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs, parent) { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.append(n); return n; }
  const ICONS = {
    plus: ['M12 5v14', 'M5 12h14'], minus: ['M5 12h14'], x: ['M6 6l12 12', 'M18 6L6 18'],
    search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', 'M20 20l-4-4'],
    check: ['M5 12.5l4.5 4.5L19 7.5'], star: ['M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.3L12 17.5 6.4 20.4l1.1-6.3L3 9.7l6.2-.9z'],
    bag: ['M5 8h14l-1 12H6z', 'M9 8V6a3 3 0 0 1 6 0v2'], menu: ['M4 6h16', 'M4 12h16', 'M4 18h10'],
    bell: ['M6 16V11a6 6 0 0 1 12 0v5l2 2H4z', 'M10 20a2 2 0 0 0 4 0'], water: ['M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z'],
    receipt: ['M6 3h12v18l-3-2-3 2-3-2-3 2z', 'M9 8h6', 'M9 12h6'], clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
    fire: ['M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z'], chart: ['M4 20V10', 'M10 20V4', 'M16 20v-7', 'M22 20H2'],
    grid: ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M13 13h7v7h-7z'], zap: ['M13 2L4 14h7l-1 8 9-12h-7z'],
    pin: ['M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z', 'M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
    chili: ['M7 20c6 0 12-6 12-12', 'M19 8c0-2-1-4-3-4', 'M7 20c-2 0-3-1-3-3 3 0 8-3 11-9 1 1 3 1 4 0'],
  };
  function icon(name, fill) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', fill ? 'currentColor' : 'none'); s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
    for (const d of ICONS[name]) sv('path', { d }, s);
    return s;
  }
  const vegDot = veg => el('span', { class: 'vd' + (veg ? '' : ' nv'), title: veg ? 'Vegetarian' : 'Non-vegetarian', 'aria-label': veg ? 'Veg' : 'Non-veg' });
  const chilis = n => n ? el('span', { class: 'chili', 'aria-label': 'Spice ' + n + ' of 3' }, ...Array.from({ length: n }, () => icon('fire', true))) : null;

  /* ---------------- illustrated plates (procedural SVG) ---------------- */
  function rng(seed) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }
  function plate(item, size) {
    const a = item.art, r = rng(item.id);
    const s = sv('svg', { viewBox: '0 0 100 100', width: size, height: size, class: 'plate', 'aria-hidden': 'true' });
    const dots = (n, rad, col, cr, cy = 50, cx = 50) => { for (let i = 0; i < n; i++) { const ang = r() * Math.PI * 2, d = Math.sqrt(r()) * rad; sv('circle', { cx: cx + Math.cos(ang) * d, cy: cy + Math.sin(ang) * d, r: cr * (.7 + r() * .6), fill: col }, s); } };
    if (a.k === 'glass' || a.k === 'cup') {
      sv('circle', { cx: 50, cy: 52, r: 44, fill: '#EFE3D2' }, s);
      if (a.k === 'cup') sv('rect', { x: 74, y: 44, width: 16, height: 14, rx: 7, fill: 'none', stroke: '#F4EDE2', 'stroke-width': 5 }, s);
      sv('circle', { cx: 50, cy: 50, r: 30, fill: '#F9F5EE', stroke: '#E2D5C3', 'stroke-width': 1.5 }, s);
      sv('circle', { cx: 50, cy: 50, r: 25, fill: a.c1 }, s);
      sv('ellipse', { cx: 42, cy: 42, rx: 9, ry: 5, fill: '#fff', opacity: .35, transform: 'rotate(-30 42 42)' }, s);
      if (a.c3) { sv('circle', { cx: 62, cy: 40, r: 8, fill: a.c3, stroke: '#fff', 'stroke-width': 1.5 }, s); sv('path', { d: 'M62 32v16M54 40h16', stroke: '#fff', 'stroke-width': 1, opacity: .7 }, s); }
      if (a.c2) sv('line', { x1: 50, y1: 50, x2: 80, y2: 18, stroke: a.c2, 'stroke-width': 4, 'stroke-linecap': 'round' }, s);
      return s;
    }
    sv('circle', { cx: 50, cy: 51, r: 47, fill: '#E9DCCB' }, s);
    sv('circle', { cx: 50, cy: 50, r: 46, fill: '#FFFDF8' }, s);
    sv('circle', { cx: 50, cy: 50, r: 36, fill: '#F6EEE2' }, s);
    if (a.k === 'bowl') {
      sv('circle', { cx: 50, cy: 50, r: 32, fill: '#3B2B22' }, s);
      sv('circle', { cx: 50, cy: 50, r: 28, fill: a.c1 }, s);
      if (a.balls) for (let i = 0; i < a.balls; i++) { const ang = i / a.balls * Math.PI * 2 + r(); sv('circle', { cx: 50 + Math.cos(ang) * 12, cy: 50 + Math.sin(ang) * 12, r: 8, fill: a.c3 || '#6B2E14' }, s); sv('circle', { cx: 47 + Math.cos(ang) * 12, cy: 47 + Math.sin(ang) * 12, r: 2.5, fill: '#fff', opacity: .3 }, s); }
      if (a.c2) sv('path', { d: `M${34 + r() * 4} ${48 + r() * 4} q8 -10 16 0 t16 0`, fill: 'none', stroke: a.c2, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, s);
      dots(a.balls ? 4 : 7, 20, a.g || '#4E9A3A', 1.8);
    } else if (a.k === 'rice') {
      sv('circle', { cx: 50, cy: 50, r: 30, fill: a.c1 }, s);
      for (let i = 0; i < 70; i++) { const ang = r() * Math.PI * 2, d = Math.sqrt(r()) * 27; sv('ellipse', { cx: 50 + Math.cos(ang) * d, cy: 50 + Math.sin(ang) * d, rx: 2.4, ry: .9, fill: r() > .7 ? a.c2 : '#FFF8E6', transform: `rotate(${r() * 180} ${50 + Math.cos(ang) * d} ${50 + Math.sin(ang) * d})` }, s); }
      dots(6, 22, a.c3, 1.6);
    } else if (a.k === 'bread') {
      sv('ellipse', { cx: 44, cy: 54, rx: 28, ry: 19, fill: a.c1, transform: 'rotate(-18 44 54)' }, s);
      sv('ellipse', { cx: 56, cy: 45, rx: 28, ry: 19, fill: a.c1, stroke: '#FFFDF8', 'stroke-width': 1.5, transform: 'rotate(-18 56 45)' }, s);
      dots(12, 18, a.c2, 1.6, 45, 56);
      if (a.c3) dots(10, 16, a.c3, 1.1, 46, 56);
    } else if (a.k === 'pieces') {
      sv('path', { d: 'M24 64 q26 14 52 0', fill: 'none', stroke: '#D7C3A8', 'stroke-width': 2 }, s);
      const n = a.n || 6;
      for (let i = 0; i < n; i++) {
        const ang = i / n * Math.PI * 2 + r() * .4, cx = 50 + Math.cos(ang) * 17, cy = 50 + Math.sin(ang) * 17;
        if (a.round) sv('circle', { cx, cy, r: 8, fill: a.c1 }, s);
        else sv('rect', { x: cx - 7, y: cy - 6, width: 14, height: 12, rx: 3.5, fill: a.c1, transform: `rotate(${r() * 60} ${cx} ${cy})` }, s);
        sv('path', { d: `M${cx - 4} ${cy - 2} l8 3`, stroke: a.c2, 'stroke-width': 2, 'stroke-linecap': 'round' }, s);
      }
      if (a.c3) { sv('circle', { cx: 50, cy: 50, r: 6, fill: 'none', stroke: a.c3, 'stroke-width': 2 }, s); sv('circle', { cx: 50, cy: 50, r: 3, fill: '#8BC34A' }, s); }
    }
    return s;
  }

  /* ---------------- seed data ---------------- */
  const M = (id, cat, name, desc, price, veg, spicy, art, extra) => Object.assign({ id, cat, name, desc, price, veg, spicy, art, avail: true }, extra || {});
  const CATS = ['Starters', 'Mains', 'Breads', 'Desserts', 'Drinks'];
  function seedMenu() {
    return [
      M('pt', 'Starters', 'Paneer Tikka', 'Charred cottage cheese, peppers and onion, mint chutney.', 280, true, 2, { k: 'pieces', c1: '#E9A25B', c2: '#5A2E12', c3: '#C9465A' }, { hot: true }),
      M('hb', 'Starters', 'Hara Bhara Kebab', 'Spinach, peas and potato patties, shallow fried.', 240, true, 1, { k: 'pieces', round: true, n: 5, c1: '#5E8F3A', c2: '#3E5F25' }),
      M('c65', 'Starters', 'Chicken 65', 'Crisp curry-leaf chicken, Chennai style.', 320, false, 3, { k: 'pieces', n: 7, c1: '#C43C22', c2: '#7A1E0E', c3: '#F2E3B0' }, { hot: true }),
      M('af', 'Starters', 'Amritsari Fish', 'Gram-flour battered fish, carom and lemon.', 360, false, 2, { k: 'pieces', n: 5, c1: '#D9A24A', c2: '#8E5A1C' }),
      M('dm', 'Mains', 'Dal Makhani', 'Black lentils slow-cooked overnight, butter and cream.', 290, true, 1, { k: 'bowl', c1: '#5A2C1A', c2: '#F4E6D0' }, { hot: true }),
      M('bc', 'Mains', 'Butter Chicken', 'Tandoori chicken in silky tomato-butter gravy.', 380, false, 1, { k: 'bowl', c1: '#E06A2C', c2: '#FFF2DE' }, { hot: true }),
      M('pl', 'Mains', 'Paneer Lababdar', 'Paneer in a rich onion-tomato gravy with kasuri methi.', 320, true, 2, { k: 'bowl', c1: '#C8502A', c2: '#F8E3C8' }),
      M('rj', 'Mains', 'Mutton Rogan Josh', 'Kashmiri chilli, fennel and slow-braised lamb.', 460, false, 3, { k: 'bowl', c1: '#8E1E14', c2: '#D05A3A' }),
      M('vb', 'Mains', 'Veg Dum Biryani', 'Saffron basmati layered with vegetables, sealed and steamed.', 300, true, 2, { k: 'rice', c1: '#F0C55A', c2: '#E2862E', c3: '#4E9A3A' }),
      M('bn', 'Breads', 'Butter Naan', 'Tandoor-baked, brushed with butter.', 60, true, 0, { k: 'bread', c1: '#F0D49A', c2: '#B9772E' }),
      M('gn', 'Breads', 'Garlic Naan', 'Roasted garlic and coriander.', 70, true, 0, { k: 'bread', c1: '#EFD08F', c2: '#B9772E', c3: '#4E9A3A' }),
      M('lp', 'Breads', 'Lachha Paratha', 'Flaky layered whole-wheat bread.', 70, true, 0, { k: 'bread', c1: '#D9A65C', c2: '#8E5A1C' }),
      M('gj', 'Desserts', 'Gulab Jamun', 'Two warm milk dumplings in rose syrup.', 140, true, 0, { k: 'bowl', c1: '#E8B65A', balls: 2, c3: '#7A3214' }),
      M('rm', 'Desserts', 'Rasmalai', 'Saffron milk, pistachio, soft chenna discs.', 160, true, 0, { k: 'bowl', c1: '#F6E2B0', balls: 3, c3: '#FFF6E2', g: '#8BC34A' }),
      M('kf', 'Desserts', 'Kulfi Falooda', 'Malai kulfi, vermicelli, rose and basil seeds.', 180, true, 0, { k: 'bowl', c1: '#F3B7C4', c2: '#FFF6E8' }),
      M('sl', 'Drinks', 'Sweet Lassi', 'Thick churned yoghurt, a touch of cardamom.', 120, true, 0, { k: 'glass', c1: '#FFF6E2', c2: '#E8541E' }),
      M('mc', 'Drinks', 'Masala Chaas', 'Spiced buttermilk with roasted cumin.', 90, true, 0, { k: 'glass', c1: '#E7EFD6', c2: '#2E9E5B' }),
      M('ls', 'Drinks', 'Fresh Lime Soda', 'Sweet, salted or mixed.', 110, true, 0, { k: 'glass', c1: '#E4F2C8', c2: '#E9A82B', c3: '#B7D94C' }),
      M('ch', 'Drinks', 'Masala Chai', 'Ginger, cardamom, a proper boil.', 60, true, 0, { k: 'cup', c1: '#B07A4A' }),
    ];
  }
  function seed() {
    const menu = seedMenu(), now = Date.now();
    const pick = (r, n) => Array.from({ length: n }, () => menu[Math.floor(r() * menu.length)]);
    const r = rng('servd-day');
    let no = 1031;
    const mk = (table, items, status, ago, paid) => {
      const lines = []; items.forEach(m => { const ex = lines.find(l => l.id === m.id); if (ex) ex.qty++; else lines.push({ id: m.id, name: m.name, veg: m.veg, price: m.price, qty: 1 + (r() > .75 ? 1 : 0), spice: '', note: '' }); });
      const sub = lines.reduce((s, l) => s + l.price * l.qty, 0);
      return { id: uid(), no: no++, table, items: lines, status, placedAt: now - ago * 60000, sub, gst: sub * GST, total: sub * (1 + GST), paid: !!paid, rating: 0 };
    };
    const orders = [];
    for (let i = 0; i < 16; i++) orders.push(mk(1 + Math.floor(r() * 12), pick(r, 2 + Math.floor(r() * 3)), 'served', 360 - i * 20 - Math.floor(r() * 10), true));
    const byId = id => menu.find(m => m.id === id);
    const live = [
      mk(11, [byId('rj'), byId('lp'), byId('lp')], 'cooking', 22, false),
      mk(2, [byId('pt'), byId('sl')], 'ready', 13, false),
      mk(4, [byId('bc'), byId('bn'), byId('dm'), byId('gn')], 'cooking', 8, false),
      mk(9, [byId('c65'), byId('ls')], 'new', 2, false),
      mk(5, [byId('vb'), byId('mc')], 'served', 30, false),
    ];
    live[2].items[0].note = 'Less spicy for kids';
    orders.push(...live);
    return { restaurant: { name: 'Saffron Table', area: 'Sector 17, Chandigarh', rating: 4.6 }, menu, orders, calls: [{ id: uid(), table: 5, type: 'bill', t: now - 60000, done: false }], next: no };
  }

  /* ---------------- persistence ---------------- */
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* in-memory only */ } },
  };
  const valid = d => d && Array.isArray(d.menu) && Array.isArray(d.orders) && Array.isArray(d.calls) && d.restaurant;
  let db = store.get(DATA_KEY); if (!valid(db)) { db = seed(); store.set(DATA_KEY, db); }
  const freshSession = () => MODE === 'guest' ? { screen: 'welcome', table: 7, cart: [], orderIds: [], vegOnly: false } : { tab: 'orders' };
  let S = Object.assign(freshSession(), store.get(SESSION_KEY) || {});
  const save = () => store.set(DATA_KEY, db);
  const saveS = () => store.set(SESSION_KEY, S);
  const item = id => db.menu.find(m => m.id === id);
  const order = id => db.orders.find(o => o.id === id);

  /* ---------------- toasts ---------------- */
  function toast(msg, ic) {
    const t = el('div', { class: 'toast' }, icon(ic || 'check'), el('span', { text: msg }));
    $('#toasts').append(t);
    const g = G(); if (g) g.from(t, { y: -18, opacity: 0, scale: .9, duration: .45, ease: 'back.out(1.8)' });
    setTimeout(() => { if (g) g.to(t, { opacity: 0, y: -10, duration: .3, onComplete: () => t.remove() }); else t.remove(); }, 2800);
  }

  /* ---------------- sheet ---------------- */
  let closeSheetFn = null;
  function sheet(build, onClose) {
    closeSheet();
    const box = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' });
    const scrim = el('div', { class: 'scrim', onclick: e => { if (e.target === scrim) closeSheet(); } }, box);
    box.append(el('button', { class: 'icon-btn x', 'aria-label': 'Close', onclick: () => closeSheet() }, icon('x')));
    build(box, () => closeSheet());
    document.body.append(scrim);
    const g = G(); if (g) { g.from(scrim, { opacity: 0, duration: .25 }); g.from(box, { y: 80, duration: .5, ease: 'back.out(1.2)' }); }
    closeSheetFn = () => { scrim.remove(); if (onClose) onClose(); };
  }
  function closeSheet() { if (!closeSheetFn) return; const f = closeSheetFn; closeSheetFn = null; f(); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  const app = $('#app');
  function render(anim) {
    app.replaceChildren(MODE === 'guest' ? guest() : kitchen());
    const g = G();
    const ins = app.querySelectorAll('[data-in]');
    if (anim && g && ins.length) g.from(ins, { y: 18, opacity: 0, duration: .55, stagger: .05, ease: 'power3.out', clearProps: 'transform,opacity' });
  }

  /* ======================= GUEST ======================= */
  const cartCount = () => S.cart.reduce((n, c) => n + c.qty, 0);
  const cartSub = () => S.cart.reduce((n, c) => { const m = item(c.id); return n + (m ? m.price * c.qty : 0); }, 0);
  const qtyOf = id => S.cart.filter(c => c.id === id).reduce((n, c) => n + c.qty, 0);
  function addToCart(id, qty, spice, note) {
    const key = id + '|' + (spice || '') + '|' + (note || '');
    const ex = S.cart.find(c => c.key === key);
    if (ex) ex.qty += qty; else S.cart.push({ key, id, qty, spice: spice || '', note: note || '' });
    S.cart = S.cart.filter(c => c.qty > 0); saveS();
  }
  function changeSimple(id, d) {
    const line = [...S.cart].reverse().find(c => c.id === id);
    if (line) line.qty += d; else if (d > 0) S.cart.push({ key: id + '||', id, qty: d, spice: '', note: '' });
    S.cart = S.cart.filter(c => c.qty > 0); saveS();
  }
  function guest() {
    document.body.classList.toggle('has-cart', S.screen === 'menu' && cartCount() > 0);
    if (S.screen === 'welcome') return welcome();
    const wrap = el('div', { class: 'g' });
    if (S.screen === 'orders') wrap.append(ordersScreen());
    else wrap.append(menuScreen());
    wrap.append(guestNav());
    if (S.screen === 'menu' && cartCount()) wrap.append(cartBar());
    return wrap;
  }
  function welcome() {
    const art = el('div', { class: 'w-plates', 'aria-hidden': 'true' });
    [['bc', 210, '4%', '6%'], ['bn', 150, '58%', '0%'], ['sl', 120, '62%', '52%']].forEach(([id, sz, l, t], i) => {
      const p = plate(item(id), sz); p.style.left = l; p.style.top = t; art.append(p);
      const g = G(); if (g) { g.from(p, { scale: 0, rotation: -90, duration: 1, delay: .15 * i, ease: 'back.out(1.4)' }); g.to(p, { rotation: i % 2 ? -360 : 360, duration: 90 + i * 20, repeat: -1, ease: 'none', transformOrigin: '50% 50%' }); }
    });
    const tables = el('div', { class: 'tables', role: 'group', 'aria-label': 'Table number' }, ...Array.from({ length: 12 }, (_, i) => el('button', { 'aria-pressed': String(S.table === i + 1), text: String(i + 1), onclick: e => { S.table = i + 1; saveS(); $$('button', tables).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); $('#wTable').textContent = 'Table ' + S.table + ' · QR scanned'; } })));
    return el('div', { class: 'welcome' },
      el('div', { class: 'w-mark', 'data-in': '' }, el('span', { class: 'logo', text: 'S' }), el('div', null, db.restaurant.name, el('small', { text: db.restaurant.area }))),
      art,
      el('p', { class: 'w-table', id: 'wTable', 'data-in': '', text: 'Table ' + S.table + ' · QR scanned' }),
      el('h1', { 'data-in': '', text: 'Order from your table.' }),
      el('p', { 'data-in': '', text: 'Browse the menu, order in a few taps and follow your food from the kitchen. No app download, no waiting for the waiter.' }),
      el('div', { class: 'w-meta', 'data-in': '' }, el('span', null, icon('star', true), String(db.restaurant.rating) + ' rating'), el('span', null, icon('clock'), '15–20 min'), el('span', null, icon('pin'), 'Dine-in')),
      el('p', { class: 'opt-h', text: 'Not your table? Pick it' }), tables,
      el('button', { class: 'btn btn-solid btn-block', onclick: () => { S.screen = 'menu'; saveS(); render(true); } }, 'View menu & order', icon('bag')));
  }
  function menuScreen() {
    const frag = el('div');
    let q = '';
    const list = el('div');
    const catsBar = el('div', { class: 'cats', role: 'group', 'aria-label': 'Categories' });
    const draw = () => {
      list.replaceChildren();
      let any = false;
      CATS.forEach(cat => {
        const items = db.menu.filter(m => m.cat === cat && (!S.vegOnly || m.veg) && (!q || (m.name + ' ' + m.desc).toLowerCase().includes(q)));
        if (!items.length) return; any = true;
        list.append(el('section', { class: 'sec', id: 'cat-' + cat },
          el('h2', null, cat, el('small', { text: items.length + ' items' })),
          ...items.map(menuItem)));
      });
      if (!any) list.append(el('p', { class: 'empty', text: 'Nothing matches “' + q + '”.' }));
    };
    CATS.forEach(cat => catsBar.append(el('button', { 'aria-pressed': 'false', text: cat, onclick: e => {
      $$('button', catsBar).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget)));
      const sec = document.getElementById('cat-' + cat); if (sec) scrollTo({ top: sec.getBoundingClientRect().top + scrollY - head.offsetHeight - 4, behavior: 'smooth' });
    } })));
    const vegSw = el('button', { class: 'mini-switch', role: 'switch', 'aria-checked': String(!!S.vegOnly), 'aria-label': 'Veg only', onclick: () => { S.vegOnly = !S.vegOnly; saveS(); vegSw.setAttribute('aria-checked', String(S.vegOnly)); draw(); } });
    const head = el('header', { class: 'g-head' },
      el('div', { class: 'g-top' }, el('h1', { text: db.restaurant.name }), el('label', { class: 'vegonly' }, vegDot(true), vegSw), el('span', { class: 'tchip', text: 'T' + S.table })),
      el('div', { class: 'search' }, icon('search'), el('input', { type: 'search', placeholder: 'Search dishes', 'aria-label': 'Search dishes', oninput: e => { q = e.target.value.trim().toLowerCase(); draw(); } })),
      catsBar);
    draw();
    frag.append(head, list);
    return frag;
  }
  function menuItem(m) {
    const q = qtyOf(m.id);
    const ctl = !m.avail ? el('span', { class: 'tag tag-out', css: { 'margin-top': '-12px', position: 'relative' }, text: 'Sold out' })
      : q ? el('div', { class: 'stepper' },
          el('button', { 'aria-label': 'Remove one ' + m.name, onclick: () => { changeSimple(m.id, -1); render(false); } }, icon('minus')),
          el('b', { text: String(q) }),
          el('button', { 'aria-label': 'Add one ' + m.name, onclick: () => { changeSimple(m.id, 1); render(false); } }, icon('plus')))
        : el('button', { class: 'add', onclick: () => { changeSimple(m.id, 1); render(false); bump(); } }, 'ADD');
    return el('article', { class: 'item' + (m.avail ? '' : ' out') },
      el('div', { class: 'info' },
        el('div', { class: 'nm' }, vegDot(m.veg), el('span', { text: m.name })),
        el('p', { class: 'ds', text: m.desc }),
        el('div', { class: 'pr' }, rs(m.price), chilis(m.spicy), m.hot && m.avail ? el('span', { class: 'tag tag-hot', text: 'Bestseller' }) : null)),
      el('div', { class: 'art' }, el('button', { class: 'pic', 'aria-label': 'Details for ' + m.name, onclick: () => m.avail && itemSheet(m) }, plate(m, 96)), ctl));
  }
  function bump() { const g = G(), b = $('.cartbar'); if (g && b) g.fromTo(b, { scale: .94 }, { scale: 1, duration: .5, ease: 'elastic.out(1,.4)' }); }
  function itemSheet(m) {
    let qty = 1, spice = m.spicy ? ['Mild', 'Medium', 'Hot'][Math.min(2, m.spicy - 1)] : '';
    sheet((box, close) => {
      const qb = el('b', { text: '1' });
      const addBtn = el('button', { class: 'btn btn-solid', onclick: () => { addToCart(m.id, qty, spice, note.value.trim().slice(0, 80)); close(); toast(qty + ' × ' + m.name + ' added'); } }, 'Add · ' + rs(m.price));
      const upd = () => { qb.textContent = String(qty); addBtn.lastChild.textContent = 'Add · ' + rs(m.price * qty); };
      const note = el('textarea', { class: 'note', maxlength: '80', placeholder: 'e.g. no onion, extra crispy', 'aria-label': 'Cooking note' });
      const opts = m.spicy ? el('div', { class: 'opts', role: 'group', 'aria-label': 'Spice level' }, ...['Mild', 'Medium', 'Hot'].map(v => el('button', { 'aria-pressed': String(v === spice), text: v, onclick: e => { spice = v; $$('button', opts).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } }))) : null;
      const art = plate(m, 200);
      box.append(el('div', { class: 'sheet-art' }, art),
        el('div', { class: 'nm', css: { display: 'flex', gap: '8px', 'align-items': 'center' } }, vegDot(m.veg), chilis(m.spicy)),
        el('h2', { text: m.name, css: { 'margin-top': '6px' } }), el('p', { class: 'lead', text: m.desc }),
        opts ? el('p', { class: 'opt-h', text: 'Spice level' }) : null, opts,
        el('p', { class: 'opt-h', text: 'Note for the chef' }), note,
        el('div', { class: 'sheet-foot' }, el('div', { class: 'stepper' },
          el('button', { 'aria-label': 'Less', onclick: () => { qty = Math.max(1, qty - 1); upd(); } }, icon('minus')), qb,
          el('button', { 'aria-label': 'More', onclick: () => { qty = Math.min(20, qty + 1); upd(); } }, icon('plus'))), addBtn));
      const g = G(); if (g) g.from(art, { rotation: -120, scale: .6, duration: .9, ease: 'back.out(1.3)' });
    }, () => render(false));
  }
  function cartBar() {
    return el('div', { class: 'cartbar' },
      el('div', { class: 'ct' }, el('b', { text: cartCount() + ' item' + (cartCount() > 1 ? 's' : '') + ' · ' + rs(cartSub()) }), el('span', { text: 'Plus 5% GST · Table ' + S.table })),
      el('button', { class: 'btn', onclick: cartSheet }, 'View cart', icon('bag')));
  }
  function cartSheet() {
    sheet((box, close) => {
      const body = el('div');
      const draw = () => {
        body.replaceChildren();
        if (!S.cart.length) { body.append(el('p', { class: 'empty', text: 'Your cart is empty.' })); return; }
        S.cart.forEach(c => {
          const m = item(c.id); if (!m) return;
          body.append(el('div', { class: 'cart-row' },
            el('div', { class: 't' }, el('strong', null, vegDot(m.veg), m.name), (c.spice || c.note) ? el('span', { text: [c.spice, c.note].filter(Boolean).join(' · ') }) : null),
            el('div', { class: 'stepper' },
              el('button', { 'aria-label': 'Less', onclick: () => { c.qty--; S.cart = S.cart.filter(x => x.qty > 0); saveS(); draw(); } }, icon('minus')), el('b', { text: String(c.qty) }),
              el('button', { 'aria-label': 'More', onclick: () => { c.qty++; saveS(); draw(); } }, icon('plus'))),
            el('span', { class: 'amt', text: rs(m.price * c.qty) })));
        });
        const sub = cartSub();
        body.append(el('div', { class: 'bill' }, el('div', null, el('span', { text: 'Item total' }), el('span', { text: rs(sub) })), el('div', null, el('span', { text: 'GST (5%)' }), el('span', { text: rs(sub * GST) })), el('div', { class: 'tot' }, el('span', { text: 'To pay' }), el('span', { text: rs(sub * (1 + GST)) }))),
          el('button', { class: 'btn btn-solid btn-block', css: { 'margin-top': '16px', 'min-height': '54px' }, onclick: () => { placeOrder(); close(); } }, 'Place order · Table ' + S.table));
      };
      box.append(el('h2', { text: 'Your order' }), el('p', { class: 'lead', text: db.restaurant.name + ' · Table ' + S.table + ' · pay after your meal' }), body);
      draw();
    }, () => render(false));
  }
  function placeOrder() {
    const lines = S.cart.map(c => { const m = item(c.id); return m && m.avail ? { id: m.id, name: m.name, veg: m.veg, price: m.price, qty: c.qty, spice: c.spice, note: c.note } : null; }).filter(Boolean);
    if (!lines.length) { toast('Those items just sold out', 'fire'); return; }
    const sub = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const o = { id: uid(), no: db.next++, table: S.table, items: lines, status: 'new', placedAt: Date.now(), sub, gst: sub * GST, total: sub * (1 + GST), paid: false, rating: 0 };
    db.orders.push(o); save();
    S.cart = []; S.orderIds.push(o.id); S.screen = 'orders'; saveS();
    render(true); toast('Order #' + o.no + ' sent to the kitchen');
  }
  function guestNav() {
    const mine = S.orderIds.map(order).filter(Boolean);
    const active = mine.filter(o => !o.paid).length;
    const tabs = [['menu', 'menu', 'Menu'], ['orders', 'receipt', 'My orders']];
    return el('nav', { class: 'gnav', role: 'tablist' }, ...tabs.map(([k, ic, label]) => el('button', { role: 'tab', 'aria-selected': String(S.screen === k), onclick: () => { S.screen = k; saveS(); render(true); scrollTo({ top: 0 }); } },
      icon(ic), label, k === 'orders' && active ? el('span', { class: 'badge', text: String(active) }) : null)),
      el('button', { role: 'tab', 'aria-selected': 'false', onclick: () => { S.screen = 'welcome'; saveS(); render(true); } }, icon('pin'), 'Table ' + S.table));
  }
  const STEPS = [['new', 'Order sent', 'The kitchen has your ticket'], ['cooking', 'Being cooked', 'Chef is on it'], ['ready', 'Ready', 'On its way to your table'], ['served', 'Served', 'Enjoy your meal']];
  function ordersScreen() {
    const mine = S.orderIds.map(order).filter(Boolean);
    const wrap = el('div', { class: 'trk' });
    wrap.append(el('header', { class: 'g-top', css: { padding: '4px 0 0' } }, el('h1', { text: 'My orders' }), el('span', { class: 'tchip', text: 'Table ' + S.table })));
    if (!mine.length) { wrap.append(el('p', { class: 'empty', text: 'No orders yet. Add dishes from the menu.' }), el('button', { class: 'btn btn-solid', onclick: () => { S.screen = 'menu'; saveS(); render(true); } }, 'Open menu')); return wrap; }
    const unpaid = mine.filter(o => !o.paid);
    [...mine].reverse().forEach(o => {
      const idx = STEPS.findIndex(s => s[0] === o.status);
      const head = o.paid ? 'Paid · thank you!' : STEPS[idx][1];
      const eta = o.status === 'new' ? 'Waiting for the kitchen to accept' : o.status === 'cooking' ? 'About ' + Math.max(3, 15 - mins(o.placedAt)) + ' min to go' : o.status === 'ready' ? 'Coming to your table now' : o.paid ? 'Bill settled' : 'Pay whenever you are ready';
      const card = el('section', { class: 'trk-card', 'data-in': '' },
        el('div', { class: 'trk-top' }, el('span', { class: 'ono', text: 'ORDER #' + o.no + ' · ' + new Date(o.placedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) }), el('span', { css: { 'margin-left': 'auto', 'font-weight': '800' }, text: rs(o.total) })),
        el('h2', { text: head }), el('p', { class: 'eta', text: eta }));
      if (!o.paid) card.append(el('ol', { class: 'steps' }, ...STEPS.map(([k, t, sub], i) => el('li', { class: i < idx || (i === idx && k === 'served') ? 'done' : i === idx ? 'now' : '' }, el('i', null, i < idx || (i === idx && k === 'served') ? icon('check') : null), el('div', null, t, el('small', { text: sub }))))));
      card.append(el('div', { class: 'lines' }, ...o.items.map(l => el('div', null, el('span', { text: l.qty + '×' }), el('span', { text: l.name + (l.spice ? ' · ' + l.spice : '') }), el('span', { text: rs(l.price * l.qty) })))));
      if (FRAMED && o.status === 'new') card.append(el('p', { class: 'eta', css: { 'margin-top': '12px', color: 'var(--accent)', 'font-weight': '700' }, text: 'Demo: tap “Accept & cook” on the kitchen screen to move it along.' }));
      wrap.append(card);
    });
    // service buttons
    const pending = type => db.calls.some(c => !c.done && c.table === S.table && c.type === type);
    wrap.append(el('div', { class: 'svc', 'data-in': '' }, ...[['waiter', 'bell', 'Call waiter'], ['water', 'water', 'Water'], ['bill', 'receipt', 'Bring bill']].map(([type, ic, label]) =>
      el('button', { class: pending(type) ? 'sent' : '', onclick: () => {
        if (pending(type)) return;
        db.calls.push({ id: uid(), table: S.table, type, t: Date.now(), done: false }); save(); render(false); toast('Request sent to the staff', 'bell');
      } }, icon(pending(type) ? 'check' : ic), pending(type) ? 'Sent' : label))));
    if (unpaid.length) {
      const allServed = unpaid.every(o => o.status === 'served');
      const due = unpaid.reduce((s, o) => s + o.total, 0);
      wrap.append(el('button', { class: 'btn btn-solid btn-block', 'data-in': '', css: { 'min-height': '54px' }, disabled: !allServed, onclick: () => paySheet(unpaid, due) }, allServed ? 'Pay bill · ' + rs(due) : 'Pay after your food is served'));
    }
    wrap.append(el('button', { class: 'btn btn-line btn-block', onclick: () => { S.screen = 'menu'; saveS(); render(true); } }, icon('plus'), 'Order more'));
    return wrap;
  }
  function paySheet(list, due) {
    sheet((box, close) => {
      let app_ = 'GPay';
      const body = el('div');
      const apps = el('div', { class: 'upi', role: 'group', 'aria-label': 'UPI app' }, ...['GPay', 'PhonePe', 'Paytm'].map(a => el('button', { 'aria-pressed': String(a === app_), text: a, onclick: e => { app_ = a; $$('button', apps).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } })));
      body.append(el('h2', { text: 'Pay ' + rs(due) }), el('p', { class: 'lead', text: list.length + ' order' + (list.length > 1 ? 's' : '') + ' · Table ' + S.table + ' · includes 5% GST' }), apps,
        el('button', { class: 'btn btn-solid btn-block', css: { 'min-height': '54px' }, onclick: () => {
          body.replaceChildren(el('div', { class: 'paid-box' }, el('div', { class: 'spinner' }), el('strong', { text: 'Opening ' + app_ + '…' }), el('p', { class: 'lead', text: 'Simulated payment, nothing is charged.' })));
          setTimeout(() => {
            list.forEach(o => { const fresh = order(o.id); if (fresh) fresh.paid = true; });
            db.calls.forEach(c => { if (c.table === S.table && c.type === 'bill') c.done = true; });
            save();
            let rating = 0;
            const stars = el('div', { class: 'stars', role: 'group', 'aria-label': 'Rate your meal' }, ...[1, 2, 3, 4, 5].map(n => el('button', { 'aria-label': n + ' stars', onclick: () => { rating = n; $$('button', stars).forEach((b, i) => b.classList.toggle('on', i < n)); list.forEach(o => { const f = order(o.id); if (f) f.rating = n; }); save(); toast('Thanks for rating us ' + n + '★', 'star'); } }, icon('star', true))));
            const tk = el('div', { class: 'tick' }, icon('check'));
            body.replaceChildren(el('div', { class: 'paid-box' }, tk, el('h2', { text: 'Paid. Thank you!' }), el('p', { class: 'lead', text: 'Receipt sent. How was your meal?' }), stars,
              el('button', { class: 'btn btn-soft', css: { 'margin-top': '10px' }, onclick: close }, 'Done')));
            const g = G(); if (g) g.from(tk, { scale: 0, rotation: -90, duration: .7, ease: 'back.out(2)' });
          }, 1500);
        } }, 'Pay with UPI'),
        el('p', { class: 'lead', css: { 'text-align': 'center', 'font-size': '13px', 'margin-top': '10px' }, text: 'Demo: no money moves.' }));
      box.append(body);
    }, () => render(false));
  }

  /* ======================= KITCHEN ======================= */
  const COLS = [['new', 'New', '#E9A82B', 'Accept & cook', 'cooking'], ['cooking', 'Cooking', '#FF6B2C', 'Mark ready', 'ready'], ['ready', 'Ready', '#5EE08F', 'Served', 'served']];
  const CALL_TXT = { waiter: 'needs a waiter', water: 'wants water', bill: 'asked for the bill' };
  function kitchen() {
    const live = db.orders.filter(o => o.status !== 'served');
    const tabs = [['orders', 'grid', 'Orders', live.length], ['menu', 'menu', 'Menu', db.menu.filter(m => !m.avail).length || null], ['today', 'chart', 'Today', null]];
    const top = el('header', { class: 'k-top' },
      el('div', { class: 'k-brand' }, el('span', { class: 'logo', text: 'S' }), el('div', null, el('strong', { text: db.restaurant.name }), el('span', { text: 'Kitchen display · Servd' }))),
      el('nav', { class: 'k-tabs', role: 'tablist' }, ...tabs.map(([k, ic, label, n]) => el('button', { role: 'tab', 'aria-selected': String(S.tab === k), onclick: () => { S.tab = k; saveS(); render(true); } }, icon(ic), label, n ? el('span', { class: 'n', text: String(n) }) : null))),
      el('div', { class: 'k-right' }, el('span', { class: 'k-live', text: 'LIVE' }), el('span', { class: 'k-clock', id: 'kClock', text: clockTxt() }),
        el('button', { class: 'btn btn-solid btn-sm', onclick: simulateOrder, title: 'Add an order from another table' }, icon('zap'), 'Simulate order')));
    const body = el('div', { class: 'k-body' });
    if (S.tab === 'menu') body.append(kMenu()); else if (S.tab === 'today') body.append(kToday()); else body.append(kOrders());
    return el('div', { class: 'k' }, top, body);
  }
  const clockTxt = () => new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  function kOrders() {
    const frag = el('div');
    const calls = db.calls.filter(c => !c.done);
    if (calls.length) frag.append(el('div', { class: 'calls', 'data-in': '' }, ...calls.map(c => el('div', { class: 'call' }, icon(c.type === 'water' ? 'water' : c.type === 'bill' ? 'receipt' : 'bell'),
      'Table ' + c.table + ' ' + CALL_TXT[c.type], el('em', { text: mins(c.t) + 'm' }),
      el('button', { class: 'btn btn-solid btn-sm', onclick: () => { c.done = true; save(); render(false); } }, icon('check'), 'Done')))));
    const board = el('div', { class: 'board', 'data-in': '' });
    COLS.forEach(([st, label, color, action, next]) => {
      const list = db.orders.filter(o => o.status === st).sort((a, b) => a.placedAt - b.placedAt);
      board.append(el('section', { class: 'col', css: { '--c': color } },
        el('div', { class: 'col-h' }, el('i'), label, el('b', { text: String(list.length) })),
        el('div', { class: 'col-b' }, ...(list.length ? list.map(o => ticket(o, action, next)) : [el('p', { class: 'col-empty', text: st === 'new' ? 'No new orders. Place one from the phone.' : 'Nothing here' })]))));
    });
    const served = db.orders.filter(o => o.status === 'served').sort((a, b) => b.placedAt - a.placedAt).slice(0, 8);
    board.append(el('section', { class: 'col', css: { '--c': '#8C7B6D' } },
      el('div', { class: 'col-h' }, el('i'), 'Served', el('b', { text: String(db.orders.filter(o => o.status === 'served').length) })),
      el('div', { class: 'col-b' }, ...served.map(o => el('div', { class: 'served-row' }, el('b', { text: 'T' + o.table }), el('span', { text: '#' + o.no + ' · ' + rs(o.total) }), el('em', { class: o.paid ? 'paid-tag' : 'due-tag', text: o.paid ? 'PAID' : 'DUE' }))))));
    frag.append(board);
    return frag;
  }
  function ticket(o, action, next) {
    const age = mins(o.placedAt);
    const t = el('article', { class: 'ticket' + (age >= 20 ? ' very-late' : age >= 12 ? ' late' : '') + (flashIds.has(o.id) ? ' flash' : ''), 'data-id': o.id },
      el('div', { class: 't-top' }, el('div', { class: 't-table' }, el('small', { text: 'Table' }), String(o.table)),
        el('div', { class: 't-meta' }, el('b', { text: age + ' min' }), '#' + o.no)),
      el('ul', { class: 't-items' }, ...o.items.map(l => el('li', null, el('span', { class: 'q', text: l.qty + '×' }), el('div', null, l.name, (l.spice || l.note) ? el('span', { class: 'nt', text: [l.spice, l.note].filter(Boolean).join(' · ') }) : null)))),
      el('button', { class: 'btn btn-solid', onclick: () => { o.status = next; save(); render(false); toast('Table ' + o.table + ': ' + (next === 'cooking' ? 'cooking' : next === 'ready' ? 'ready to serve' : 'served'), next === 'cooking' ? 'fire' : 'check'); } }, action));
    return t;
  }
  function kMenu() {
    const frag = el('div', { 'data-in': '' });
    frag.append(el('div', { class: 'mtools' }, icon('zap'), 'Switch a dish off when it runs out. It shows “Sold out” on every guest phone instantly.'));
    CATS.forEach(cat => {
      frag.append(el('h3', { text: cat, css: { margin: '16px 0 10px', 'font-size': '21px' } }));
      frag.append(el('div', { class: 'mgrid' }, ...db.menu.filter(m => m.cat === cat).map(m => {
        const sw = el('button', { class: 'k-switch', role: 'switch', 'aria-checked': String(m.avail), 'aria-label': m.name + ' available', onclick: () => {
          m.avail = !m.avail; save(); render(false); toast(m.name + (m.avail ? ' back in stock' : ' marked sold out'), m.avail ? 'check' : 'fire');
        } });
        return el('div', { class: 'mcard' + (m.avail ? '' : ' off') }, plate(m, 54),
          el('div', { class: 't' }, el('strong', null, vegDot(m.veg), el('span', { text: m.name })), el('div', { class: 'p', text: rs(m.price) })),
          el('label', { class: 'avail', css: { color: m.avail ? '#5EE08F' : 'var(--faint)' } }, sw, m.avail ? 'In stock' : 'Sold out'));
      })));
    });
    return frag;
  }
  function kToday() {
    const os = db.orders, revenue = os.reduce((s, o) => s + o.total, 0);
    const tables = new Set(os.filter(o => !o.paid).map(o => o.table)).size;
    const kpi = (label, v, hi) => el('div', { class: 'kpi' + (hi ? ' hi' : '') }, el('span', { text: label }), el('b', { text: v }));
    // revenue by hour, last 8 hours
    const now = Date.now(), H = 3600e3, buckets = Array.from({ length: 8 }, (_, i) => ({ t: now - (7 - i) * H, v: 0 }));
    os.forEach(o => { const i = 7 - Math.floor((now - o.placedAt) / H); if (i >= 0 && i < 8) buckets[i].v += o.total; });
    const max = Math.max(1, ...buckets.map(b => b.v));
    const svg = sv('svg', { viewBox: '0 0 400 180', preserveAspectRatio: 'none', role: 'img', 'aria-label': 'Revenue per hour' });
    [45, 90, 135].forEach(y => sv('line', { x1: 0, x2: 400, y1: y, y2: y, stroke: 'rgba(246,238,227,.08)' }, svg));
    buckets.forEach((b, i) => {
      const h = Math.max(3, b.v / max * 140), x = i * 50 + 9;
      const r = sv('rect', { x, y: 155 - h, width: 32, height: h, rx: 6, fill: i === 7 ? '#FF6B2C' : 'rgba(255,107,44,.45)' }, svg);
      const tt = document.createElementNS(NS, 'title'); tt.textContent = rs(b.v); r.append(tt);
      const lab = sv('text', { x: x + 16, y: 174, 'text-anchor': 'middle', 'font-size': 11, fill: 'rgba(246,238,227,.45)', 'font-family': 'Martian Mono, monospace' }, svg);
      lab.textContent = new Date(b.t).toLocaleTimeString('en-IN', { hour: 'numeric' }).replace(' ', '').toLowerCase();
      const g = G(); if (g) g.from(r, { attr: { y: 155, height: 0 }, duration: .8, delay: i * .05, ease: 'power3.out' });
    });
    const counts = {}; os.forEach(o => o.items.forEach(l => { counts[l.name] = (counts[l.name] || 0) + l.qty; }));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5), topMax = top.length ? top[0][1] : 1;
    return el('div', { 'data-in': '' },
      el('div', { class: 'kpis' }, kpi('Revenue today', rs(revenue), true), kpi('Orders', String(os.length)), kpi('Average bill', rs(revenue / Math.max(1, os.length))), kpi('Tables open', String(tables))),
      el('div', { class: 'today' },
        el('section', { class: 'panel chart' }, el('h3', { text: 'Revenue, last 8 hours' }), svg),
        el('section', { class: 'panel' }, el('h3', { text: 'Top dishes' }), el('ol', { class: 'top5' }, ...top.map(([n, q]) => el('li', null, el('span', { text: n }), el('div', { class: 'bar' }, el('i', { css: { width: (q / topMax * 100) + '%' } })), el('em', { text: String(q) })))))));
  }
  function simulateOrder() {
    const r = Math.random, avail = db.menu.filter(m => m.avail);
    if (!avail.length) return toast('Everything is sold out!', 'fire');
    const lines = [];
    for (let i = 0, n = 1 + Math.floor(r() * 3); i < n; i++) { const m = avail[Math.floor(r() * avail.length)]; const ex = lines.find(l => l.id === m.id); if (ex) ex.qty++; else lines.push({ id: m.id, name: m.name, veg: m.veg, price: m.price, qty: 1, spice: '', note: r() > .7 ? 'No onion' : '' }); }
    const sub = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const o = { id: uid(), no: db.next++, table: [1, 3, 6, 8, 10, 12][Math.floor(r() * 6)], items: lines, status: 'new', placedAt: Date.now(), sub, gst: sub * GST, total: sub * (1 + GST), paid: false, rating: 0 };
    db.orders.push(o); save(); flash(o.id); S.tab = 'orders'; saveS(); render(false);
  }
  const flashIds = new Set();
  function flash(id) { flashIds.add(id); setTimeout(() => flashIds.delete(id), 3500); beep(); }
  let actx = null;
  document.addEventListener('pointerdown', () => { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ } }, { once: true });
  function beep() {
    if (!actx || actx.state !== 'running') return;
    [0, .16].forEach((d, i) => { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = i ? 1046 : 784; o.type = 'sine'; g.gain.setValueAtTime(.0001, actx.currentTime + d); g.gain.exponentialRampToValueAtTime(.18, actx.currentTime + d + .02); g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + d + .3); o.connect(g).connect(actx.destination); o.start(actx.currentTime + d); o.stop(actx.currentTime + d + .32); });
  }

  /* ---------------- live sync between screens ---------------- */
  addEventListener('storage', e => {
    if (e.key !== DATA_KEY) return;
    const fresh = store.get(DATA_KEY); if (!valid(fresh)) return;
    const before = db; db = fresh;
    if (MODE === 'kitchen') {
      const known = new Set(before.orders.map(o => o.id));
      const added = db.orders.filter(o => !known.has(o.id));
      added.forEach(o => { flash(o.id); toast('New order · Table ' + o.table, 'bell'); });
      const newCalls = db.calls.filter(c => !c.done && !before.calls.some(b => b.id === c.id));
      newCalls.forEach(c => { beep(); toast('Table ' + c.table + ' ' + CALL_TXT[c.type], 'bell'); });
      if (added.length && S.tab !== 'orders') { S.tab = 'orders'; saveS(); }
    } else {
      S.orderIds.forEach(id => {
        const a = before.orders.find(o => o.id === id), b = order(id);
        if (a && b && a.status !== b.status) toast(b.status === 'cooking' ? 'Your food is being cooked' : b.status === 'ready' ? 'Your food is ready!' : 'Served. Enjoy your meal!', b.status === 'cooking' ? 'fire' : 'check');
      });
      db.calls.forEach(c => { const was = before.calls.find(x => x.id === c.id); if (was && !was.done && c.done && c.table === S.table && c.type !== 'bill') toast(c.type === 'water' ? 'Water is on the way' : 'A waiter is coming', 'bell'); });
      const gone = S.cart.filter(c => { const m = item(c.id); return m && !m.avail; });
      if (gone.length) { toast(item(gone[0].id).name + ' just sold out', 'fire'); S.cart = S.cart.filter(c => !gone.includes(c)); saveS(); }
    }
    if (!closeSheetFn && !(document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName))) render(false);
  });
  // keep ticket ages and the clock fresh
  setInterval(() => {
    if (MODE !== 'kitchen') return;
    const c = $('#kClock'); if (c) c.textContent = clockTxt();
    if (S.tab === 'orders' && !closeSheetFn) render(false);
  }, 30000);

  render(true);
})();
