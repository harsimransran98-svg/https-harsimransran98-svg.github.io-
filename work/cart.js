/* ==================================================================
   Interactive cart demo: add to cart, qty +/-, live subtotal,
   slide-out drawer, checkout preview. No payment is taken and
   nothing leaves the browser. All DOM is built with textContent.
   ================================================================== */
(() => {
  const PRODUCTS = {
    huila:  { name: 'Huila Sunrise',      origin: 'Colombia · Washed',       price: 18, color: '#c17a4a' },
    kochere:{ name: 'Yirgacheffe Kochere', origin: 'Ethiopia · Natural',      price: 21, color: '#b9875a' },
    ash:    { name: 'Ash House Blend',    origin: 'Brazil + Guatemala',      price: 16, color: '#5b3a2a' },
    sumatra:{ name: 'Sumatra Wet-Hulled', origin: 'Indonesia · Giling Basah', price: 19, color: '#3d4a3a' }
  };
  const FREE_SHIP = 45, SHIP_FEE = 6, MAX_QTY = 20, STORE_KEY = 'ka-demo-cart';
  const money = n => '$' + n.toFixed(2);
  const $ = sel => document.querySelector(sel);

  const toggleBtn = $('#cartToggle'), countEl = $('#cartCount');
  const scrim = $('#cartScrim'), drawer = $('#cartDrawer'), list = $('#cartItems');
  const headCount = $('#cartHeadCount'), shipText = $('#shipText'), shipBar = $('#shipBar');
  const subEl = $('#cartSubtotal'), shipEl = $('#cartShipping'), totalEl = $('#cartTotal');
  const checkoutBtn = $('#checkoutBtn');
  const modal = $('#checkoutModal'), coBody = $('#coBody'), coSteps = document.querySelectorAll('.co-steps span');
  if (!toggleBtn || !drawer || !modal) return;

  /* ---------- state ---------- */
  let cart = load();
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      // only accept known products + sane quantities from storage
      return Array.isArray(raw) ? raw.filter(l => PRODUCTS[l.id] && typeof l.grind === 'string' && l.grind.length < 40)
        .map(l => ({ id: l.id, grind: l.grind, qty: Math.min(MAX_QTY, Math.max(1, parseInt(l.qty, 10) || 1)) })) : [];
    } catch (e) { return []; }
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch (e) { /* storage blocked: cart still works this visit */ } }
  const totals = () => {
    const sub = cart.reduce((s, l) => s + PRODUCTS[l.id].price * l.qty, 0);
    const ship = sub === 0 || sub >= FREE_SHIP ? 0 : SHIP_FEE;
    return { sub, ship, total: sub + ship, count: cart.reduce((s, l) => s + l.qty, 0) };
  };

  function add(id, grind) {
    const line = cart.find(l => l.id === id && l.grind === grind);
    if (line) line.qty = Math.min(MAX_QTY, line.qty + 1);
    else cart.push({ id, grind, qty: 1 });
    commit();
  }
  function setQty(idx, qty) {
    if (qty <= 0) cart.splice(idx, 1);
    else cart[idx].qty = Math.min(MAX_QTY, qty);
    commit();
  }
  function commit() { save(); render(); }

  /* ---------- tiny DOM helper (no innerHTML anywhere) ---------- */
  function el(tag, attrs, ...kids) {
    const node = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'style') node.setAttribute('style', v);
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    kids.flat().forEach(c => c != null && node.append(c));
    return node;
  }
  const svgIcon = d => {
    const ns = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(ns, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '1.6'); s.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); s.append(p);
    return s;
  };

  /* ---------- render ---------- */
  function render() {
    const t = totals();
    countEl.textContent = t.count;
    countEl.dataset.empty = String(t.count === 0);
    toggleBtn.setAttribute('aria-label', `Open cart, ${t.count} item${t.count === 1 ? '' : 's'}`);
    headCount.textContent = `(${t.count})`;

    const left = FREE_SHIP - t.sub;
    shipText.replaceChildren();
    if (t.sub === 0) shipText.append(`Free shipping on orders over ${money(FREE_SHIP)}`);
    else if (left > 0) shipText.append('You\'re ', el('strong', { text: money(left) }), ' away from free shipping');
    else shipText.append(el('strong', { text: 'Free shipping unlocked' }), ' — roasted and shipped within 48h');
    shipBar.style.width = Math.min(100, (t.sub / FREE_SHIP) * 100) + '%';

    subEl.textContent = money(t.sub);
    shipEl.textContent = t.sub === 0 ? '—' : t.ship === 0 ? 'Free' : money(t.ship);
    totalEl.textContent = money(t.total);
    checkoutBtn.disabled = t.count === 0;

    list.replaceChildren();
    if (!cart.length) {
      list.append(el('div', { class: 'cart-empty' },
        svgIcon('M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Zm4 0V6a3 3 0 0 1 6 0v2'),
        el('p', { text: 'Your cart is empty. This week\'s roast won\'t wait long.' }),
        el('button', { class: 'add-btn', type: 'button', text: 'Browse the roast', onclick: () => { closeDrawer(); $('#shop').scrollIntoView({ behavior: 'smooth' }); } })
      ));
      return;
    }
    cart.forEach((line, idx) => {
      const p = PRODUCTS[line.id];
      list.append(el('div', { class: 'cart-line' },
        el('div', { class: 'mini-bag', style: `--bag:${p.color}` }),
        el('div', null,
          el('h3', { text: p.name }),
          el('p', { text: `${line.grind} · 250g · ${money(p.price)}` }),
          el('button', { class: 'remove-btn', type: 'button', text: 'Remove', 'aria-label': `Remove ${p.name} from cart`, onclick: () => setQty(idx, 0) })
        ),
        el('div', { class: 'cart-line-right' },
          el('span', { class: 'line-total', text: money(p.price * line.qty) }),
          el('div', { class: 'stepper', role: 'group', 'aria-label': `Quantity for ${p.name}` },
            el('button', { type: 'button', text: '−', 'aria-label': 'Decrease quantity', onclick: () => setQty(idx, line.qty - 1) }),
            el('output', { text: String(line.qty), 'aria-live': 'polite' }),
            el('button', { type: 'button', text: '+', 'aria-label': 'Increase quantity', onclick: () => setQty(idx, line.qty + 1) })
          )
        )
      ));
    });
  }

  /* ---------- open / close with focus management ---------- */
  let lastFocus = null;
  function show(node) { node.hidden = false; void node.offsetWidth; node.classList.add('open'); }
  function hide(node) {
    node.classList.remove('open');
    const done = () => { if (!node.classList.contains('open')) node.hidden = true; };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) done();
    else setTimeout(done, 500);
  }
  function openDrawer() {
    lastFocus = document.activeElement;
    show(scrim); show(drawer);
    document.documentElement.classList.add('cart-locked');
    toggleBtn.setAttribute('aria-expanded', 'true');
    setTimeout(() => $('#cartClose').focus(), 60);
  }
  function closeDrawer() {
    hide(scrim); hide(drawer);
    document.documentElement.classList.remove('cart-locked');
    toggleBtn.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function trapFocus(container, e) {
    const f = [...container.querySelectorAll('button, input, select, [href], [tabindex]:not([tabindex="-1"])')].filter(n => !n.disabled && n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  toggleBtn.addEventListener('click', openDrawer);
  $('#cartClose').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => {
    const modalOpen = !modal.hidden, drawerOpen = !drawer.hidden;
    if (e.key === 'Escape') { if (modalOpen) closeCheckout(); else if (drawerOpen) closeDrawer(); }
    if (e.key === 'Tab') { if (modalOpen) trapFocus(modal, e); else if (drawerOpen) trapFocus(drawer, e); }
  });

  /* ---------- add-to-cart buttons ---------- */
  document.querySelectorAll('.shop-card').forEach(card => {
    const btn = card.querySelector('.add-btn'), grind = card.querySelector('.grind-select');
    btn.addEventListener('click', () => {
      add(card.dataset.id, grind.value);
      btn.textContent = 'Added ✓'; btn.classList.add('added');
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { btn.textContent = 'Add to cart'; btn.classList.remove('added'); }, 1300);
      if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.fromTo(countEl, { scale: 1.5 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        gsap.fromTo(card.querySelector('.bag-body'), { y: -14 }, { y: 0, duration: 0.7, ease: 'bounce.out', clearProps: 'transform' });
      }
    });
  });

  /* ---------- checkout preview ---------- */
  function setStep(n) { coSteps.forEach((s, i) => s.classList.toggle('on', i < n)); }
  function summaryBlock() {
    const t = totals();
    return el('div', { class: 'co-summary' },
      cart.map(l => el('div', { class: 'sum-row' },
        el('span', { text: `${PRODUCTS[l.id].name} × ${l.qty}` }),
        el('span', { text: money(PRODUCTS[l.id].price * l.qty) }))),
      el('div', { class: 'sum-row' }, el('span', { text: 'Shipping' }), el('span', { text: t.ship ? money(t.ship) : 'Free' })),
      el('div', { class: 'sum-row total' }, el('span', { text: 'Total' }), el('span', { text: money(t.total) }))
    );
  }
  function field(id, label, type, auto, full) {
    const input = el('input', { id, name: id, type, autocomplete: auto, required: '', maxlength: '120' });
    return el('div', { class: 'field' + (full ? ' full' : '') }, el('label', { for: id, text: label }), input, el('small', { id: id + 'Err', 'aria-live': 'polite' }));
  }
  function renderForm() {
    setStep(2);
    const form = el('form', { class: 'co-form', novalidate: '' },
      field('coName', 'Full name', 'text', 'name', true),
      field('coEmail', 'Email', 'email', 'email'),
      field('coCity', 'City', 'text', 'address-level2'),
      field('coAddress', 'Shipping address', 'text', 'street-address', true)
    );
    const note = el('div', { class: 'pay-note' },
      el('span', null, el('b', { text: 'Demo checkout. ' }), 'No payment is taken and nothing you type leaves this page. In a production build this step hands off to Stripe, Razorpay or Shopify Checkout.')
    );
    const submit = el('button', { class: 'checkout-btn', type: 'submit', text: `Place demo order · ${money(totals().total)}` });
    form.append(el('div', { class: 'full' }, note), el('div', { class: 'full' }, submit));
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      [['coName', v => v.trim().length >= 2, 'Enter your name'],
       ['coEmail', v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), 'Enter a valid email'],
       ['coCity', v => v.trim().length >= 2, 'Enter a city'],
       ['coAddress', v => v.trim().length >= 5, 'Enter a street address']].forEach(([id, test, msg]) => {
        const input = form.querySelector('#' + id), err = form.querySelector('#' + id + 'Err');
        const valid = test(input.value);
        input.setAttribute('aria-invalid', String(!valid));
        err.textContent = valid ? '' : msg;
        if (!valid && ok) { input.focus(); ok = false; }
      });
      if (ok) renderSuccess(form.querySelector('#coName').value.trim().split(' ')[0]);
    });
    coBody.replaceChildren(summaryBlock(), form);
    setTimeout(() => form.querySelector('input').focus(), 80);
  }
  function renderSuccess(firstName) {
    setStep(3);
    const id = 'KA-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const tick = el('div', { class: 'tick' }, svgIcon('M5 12.5l4.2 4.2L19 7'));
    tick.querySelector('svg').setAttribute('width', '30'); tick.querySelector('svg').setAttribute('stroke-width', '2.4');
    coBody.replaceChildren(el('div', { class: 'co-success' },
      tick,
      el('h3', { text: `Thanks, ${firstName}` }),
      el('p', { text: 'That\'s the full flow your customers would see. Cart, live totals, shipping logic and checkout are all wired up and ready to connect to a real payment provider.' }),
      el('span', { class: 'order-id', text: `Demo order ${id}` }),
      el('button', { class: 'add-btn', type: 'button', text: 'Close & reset demo', onclick: () => { cart = []; commit(); closeCheckout(); closeDrawer(); } })
    ));
    coBody.querySelector('.add-btn').focus();
  }
  function openCheckout() {
    if (!cart.length) return;
    show(modal);
    renderForm();
  }
  function closeCheckout() { hide(modal); checkoutBtn.focus(); }
  checkoutBtn.addEventListener('click', openCheckout);
  $('#coClose').addEventListener('click', closeCheckout);
  modal.addEventListener('click', e => { if (e.target === modal) closeCheckout(); });

  render();
})();
