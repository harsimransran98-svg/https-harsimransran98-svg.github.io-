/* Fjord — live demo build (Bazozo Studio) */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  $('#year').textContent = new Date().getFullYear();
  const h = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const sv = (tag, attrs, parent, text) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (text != null) n.textContent = text; if (parent) parent.append(n); return n; };
  const money = v => { const a = Math.abs(v), sgn = v < 0 ? '−' : ''; return sgn + '$' + (a >= 1e6 ? (a / 1e6).toFixed(2) + 'M' : a >= 1e4 ? Math.round(a / 1e3) + 'k' : a >= 1e3 ? (a / 1e3).toFixed(1) + 'k' : Math.round(a)); };

  /* ---------- nav + 9-dot menu ---------- */
  const nav = $('#nav'), btn = $('#menuBtn'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      menu.hidden = false;
      if (hasGsap && !reduced) { gsap.fromTo(menu, { opacity: 0, scale: .92, y: -8 }, { opacity: 1, scale: 1, y: 0, duration: .5, ease: 'back.out(1.6)' }); gsap.from('.menu a', { x: 14, opacity: 0, duration: .4, stagger: .05, delay: .1 }); }
    } else if (hasGsap && !reduced) gsap.to(menu, { opacity: 0, scale: .95, duration: .2, onComplete: () => { menu.hidden = true; } });
    else menu.hidden = true;
  }
  btn.addEventListener('click', e => { e.stopPropagation(); setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });

  /* ---------- live ledger demo ---------- */
  const TX = [
    ['Stripe payout', 'Batch #48121', 18420.55, 'INV-2041'], ['AWS EMEA', 'Card •• 4410', -3218.07, 'BILL-0937'], ['Gusto payroll', 'ACH', -41250.00, 'PAY-11'],
    ['Figma Inc.', 'Card •• 4410', -540.00, 'BILL-0938'], ['Northwind Ltd', 'Wire', 12800.00, 'INV-2038'], ['WeWork', 'Direct debit', -6900.00, 'BILL-0935'],
    ['Figma Inc.', 'Card •• 4410', -540.00, null, 'Duplicate charge?'], ['Halden GmbH', 'SEPA', 7450.20, 'INV-2044'], ['Google Ads', 'Card •• 7713', -2205.90, 'BILL-0940'],
    ['New vendor: Acme Supp1y', 'Wire · bank changed', -18900.00, null, 'Bank details changed'], ['Kepler & Co', 'ACH', 9300.00, 'INV-2046'], ['Slack', 'Card •• 4410', -1180.00, 'BILL-0941']
  ];
  const rowsEl = $('#rows');
  let ti = 0, matched = 0, flagged = 0, totalMs = 0;
  function addRow(animate) {
    const [who, sub, amt, ref, flag] = TX[ti++ % TX.length];
    const r = h('div', 'lrow');
    const w = h('div', 'who', who); w.append(h('small', null, sub));
    const a = h('span', 'amt ' + (amt < 0 ? 'neg' : 'pos'), (amt < 0 ? '−' : '+') + '$' + Math.abs(amt).toLocaleString(undefined, { minimumFractionDigits: 2 }));
    const b = h('span', 'badge wait', 'matching…');
    r.append(w, a, b);
    rowsEl.prepend(r);
    while (rowsEl.children.length > 6) rowsEl.lastChild.remove();
    if (animate && hasGsap) gsap.from(r, { height: 0, opacity: 0, y: -10, duration: .45, ease: 'power3.out' });
    const ms = 250 + Math.random() * 500;
    const finish = () => {
      if (flag) { b.className = 'badge flag'; b.textContent = '⚑ ' + flag; r.classList.add('flagged'); flagged++; }
      else { b.className = 'badge ok'; b.textContent = '✓ ' + ref; matched++; }
      totalMs += ms;
      $('#lfMatched').textContent = matched; $('#lfFlag').textContent = flagged;
      $('#lfTime').textContent = (totalMs / (matched + flagged) / 1000).toFixed(1) + 's';
    };
    animate ? setTimeout(finish, ms + 400) : finish();
  }
  for (let i = 0; i < 5; i++) addRow(false);
  let ledgerTimer = null;
  const ledger = $('.ledger');
  if (!reduced) new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !ledgerTimer) ledgerTimer = setInterval(() => { if (!document.hidden) addRow(true); }, 1700);
    if (!e.isIntersecting && ledgerTimer) { clearInterval(ledgerTimer); ledgerTimer = null; }
  }).observe(ledger);

  /* ---------- ROI & revenue calculator ---------- */
  const ins = { tx: $('#tx'), team: $('#team'), hrs: $('#hrs'), cost: $('#cost') };
  const ONBOARD = 1500, MONTHS = 24;
  const X0 = 56, X1 = 620, Y0 = 262, Y1 = 16;
  function plan(tx) { return tx <= 5000 ? ['Starter', 499] : tx <= 20000 ? ['Growth', 1299] : ['Scale', 2499]; }
  function model() {
    const tx = +ins.tx.value, team = +ins.team.value, hrs = +ins.hrs.value, cost = +ins.cost.value;
    const [pName, pCost] = plan(tx);
    const labour = team * hrs * 4.33 * cost, errors = tx * .006 * 35;
    const manual = labour + errors;
    const saved = labour * .72 + errors * .85;
    const fjMonthly = manual - saved + pCost;
    const base = [], fj = [];
    for (let m = 0; m <= MONTHS; m++) { base.push(manual * m); fj.push(ONBOARD + fjMonthly * m); }
    const net = saved - pCost;
    return { tx, team, hrs, cost, pName, pCost, manual, saved, net, base, fj,
      yearNet: net * 12, payback: net > 0 ? ONBOARD / net : Infinity, roi: (saved * 12) / (pCost * 12 + ONBOARD) };
  }

  // chart: draw from current arrays, morph to new ones on every change
  const cur = { base: new Array(MONTHS + 1).fill(0), fj: new Array(MONTHS + 1).fill(0), max: 1 };
  const xAt = i => X0 + (X1 - X0) * i / MONTHS;
  const yAt = v => Y0 - (Y0 - Y1) * v / cur.max;
  const line = arr => arr.map((v, i) => (i ? 'L' : 'M') + xAt(i).toFixed(1) + ' ' + yAt(v).toFixed(1)).join('');
  const gridG = $('#gridG');
  function drawGrid() {
    gridG.replaceChildren();
    for (let k = 0; k <= 4; k++) {
      const v = cur.max * k / 4, y = yAt(v);
      sv('line', { class: 'gridl', x1: X0, x2: X1, y1: y, y2: y }, gridG);
      sv('text', { class: 'ax', x: X0 - 8, y: y + 3, 'text-anchor': 'end' }, gridG, money(v));
    }
    [0, 6, 12, 18, 24].forEach(m => sv('text', { class: 'ax', x: xAt(m), y: Y0 + 18, 'text-anchor': 'middle' }, gridG, m ? 'M' + m : 'Start'));
  }
  function drawChart() {
    drawGrid();
    const bl = line(cur.base), fl = line(cur.fj);
    $('#baseLine').setAttribute('d', bl); $('#fjLine').setAttribute('d', fl);
    $('#baseArea').setAttribute('d', bl + `L${X1} ${Y0}L${X0} ${Y0}Z`);
    $('#fjArea').setAttribute('d', fl + `L${X1} ${Y0}L${X0} ${Y0}Z`);
    // savings wedge: between the manual line and the Fjord line where Fjord is cheaper
    const low = cur.fj.map((v, i) => Math.min(v, cur.base[i]));
    let gap = line(cur.base);
    for (let i = MONTHS; i >= 0; i--) gap += 'L' + xAt(i).toFixed(1) + ' ' + yAt(low[i]).toFixed(1);
    $('#gapArea').setAttribute('d', gap + 'Z');
    // break-even marker
    const be = $('#beG'); be.replaceChildren();
    for (let i = 1; i <= MONTHS; i++) {
      const d0 = cur.fj[i - 1] - cur.base[i - 1], d1 = cur.fj[i] - cur.base[i];
      if (d0 > 0 && d1 <= 0) {
        const f = d0 / (d0 - d1), xm = i - 1 + f, v = cur.base[i - 1] + (cur.base[i] - cur.base[i - 1]) * f;
        const x = xAt(xm), y = yAt(v);
        sv('circle', { class: 'be', cx: x, cy: y, r: 5 }, be);
        sv('circle', { cx: x, cy: y, r: 11, fill: 'none', stroke: '#34D399', 'stroke-opacity': .4 }, be);
        const when = xm < 1 ? (n => `day ${n}`)(Math.max(1, Math.round(xm * 30))) : `month ${xm.toFixed(1)}`;
        sv('text', { class: 'be-t', x: Math.min(x + 16, X1 - 130), y: Math.max(y - 16, 30) }, be, `Break-even · ${when}`);
        break;
      }
    }
  }

  const kpi = { save: 0, roi: 0 };
  let last = null, morph = null;
  function update() {
    const M = model();
    last = M;
    // slider readouts + fills
    $('#vTx').textContent = M.tx.toLocaleString(); $('#vTeam').textContent = M.team; $('#vHrs').textContent = M.hrs; $('#vCost').textContent = '$' + M.cost;
    Object.values(ins).forEach(i => i.style.setProperty('--p', ((i.value - i.min) / (i.max - i.min) * 100) + '%'));
    const pb = $('#planBox'); pb.replaceChildren(document.createTextNode('Plan: '), h('b', null, M.pName), document.createTextNode(` · $${M.pCost.toLocaleString()}/mo · $${ONBOARD.toLocaleString()} onboarding`));
    // KPIs
    const paint = () => { $('#kSave').textContent = money(kpi.save); $('#kRoi').textContent = kpi.roi > 0 ? kpi.roi.toFixed(1) + '×' : '—'; };
    $('#kSave').parentElement.classList.toggle('em', M.yearNet > 0);
    $('#kPay').textContent = !isFinite(M.payback) ? 'Not yet' : M.payback < 1 ? (d => d + (d === 1 ? ' day' : ' days'))(Math.max(1, Math.round(M.payback * 30))) : M.payback.toFixed(1) + ' mo';
    // chart morph
    const from = { base: cur.base.slice(), fj: cur.fj.slice(), max: cur.max };
    const toMax = Math.max(M.base[MONTHS], M.fj[MONTHS]) * 1.08;
    if (hasGsap && !reduced) {
      gsap.to(kpi, { save: M.yearNet, roi: M.roi, duration: .6, ease: 'power3.out', onUpdate: paint, overwrite: true });
      if (morph) morph.kill();
      const p = { t: 0 };
      morph = gsap.to(p, { t: 1, duration: .6, ease: 'power3.out', onUpdate: () => {
        cur.max = from.max + (toMax - from.max) * p.t;
        for (let i = 0; i <= MONTHS; i++) { cur.base[i] = from.base[i] + (M.base[i] - from.base[i]) * p.t; cur.fj[i] = from.fj[i] + (M.fj[i] - from.fj[i]) * p.t; }
        drawChart();
      } });
    } else {
      kpi.save = M.yearNet; kpi.roi = M.roi; paint();
      cur.max = toMax; cur.base = M.base.slice(); cur.fj = M.fj.slice(); drawChart();
    }
  }
  Object.values(ins).forEach(i => i.addEventListener('input', update));

  // hover / touch crosshair with month values
  const svgEl = $('#chartSvg'), tip = $('#tip'), xh = $('#xh'), chart = $('#chart');
  function hover(e) {
    const r = svgEl.getBoundingClientRect();
    const vx = (e.clientX - r.left) / r.width * 640;
    if (vx < X0 || vx > X1 || !last) return hide();
    const i = Math.round((vx - X0) / (X1 - X0) * MONTHS);
    const x = xAt(i);
    xh.setAttribute('x1', x); xh.setAttribute('x2', x); xh.setAttribute('visibility', 'visible');
    tip.replaceChildren();
    const l1 = h('div'); l1.append(h('b', null, i ? 'Month ' + i : 'Start'));
    const l2 = h('div', null, 'Manual  ' + money(last.base[i])); l2.style.color = '#FB7185';
    const l3 = h('div', null, 'Fjord   ' + money(last.fj[i])); l3.style.color = '#34D399';
    const d = last.base[i] - last.fj[i];
    const l4 = h('div', null, (d >= 0 ? 'Saved   ' : 'Behind  ') + money(Math.abs(d)));
    tip.append(l1, l2, l3, l4);
    tip.hidden = false;
    tip.style.left = Math.min(Math.max(x / 640 * r.width, 80), r.width - 80) + 'px';
    tip.style.top = (yAt(Math.max(last.base[i], last.fj[i])) / 300 * r.height) + 'px';
  }
  function hide() { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); }
  chart.addEventListener('pointermove', hover);
  chart.addEventListener('pointerleave', hide);

  update();

  /* ---------- GSAP ---------- */
  if (!hasGsap) { $$('.rv').forEach(n => { n.style.opacity = 1; n.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (reduced) { gsap.set('.rv', { opacity: 1, y: 0 }); return; }

  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = document.querySelector(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -80 });
    }));
  }

  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero h1 .ln > span', { yPercent: 110, duration: 1.1, stagger: .1 })
    .from('.ledger', { y: 40, opacity: 0, rotateX: 12, transformPerspective: 900, duration: 1.3 }, .1)
    .from('.rv-h:not(.ledger)', { y: 22, opacity: 0, duration: .9, stagger: .08 }, .3);
  gsap.to('.aurora i:first-child', { xPercent: 20, yPercent: 30, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });

  // chart draws itself in the first time you reach the calculator
  ScrollTrigger.create({ trigger: '#roi', start: 'top 65%', once: true, onEnter: () => {
    cur.base.fill(0); cur.fj.fill(0); drawChart(); update();
  } });
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .08 }) });
})();
