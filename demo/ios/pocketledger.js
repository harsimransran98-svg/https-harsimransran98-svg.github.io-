/* Pocket Ledger — interactive iPhone wallet prototype (Bazozo Studio). DOM built with textContent only. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const haptic = (ms = 8) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  const money = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- fit the phone to the viewport ---------- */
  const stage = $('#stage');
  function fit() {
    const vw = document.documentElement.clientWidth, wide = vw > 1180;
    const s = Math.max(.55, Math.min(1, wide ? (window.innerHeight - 110) / 820 : 1, (vw - 32) / 390));
    stage.style.setProperty('--s', s.toFixed(3));
  }
  window.addEventListener('resize', fit); fit();
  const tick = () => { const d = new Date(); $('#clock').textContent = `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`; };
  tick(); setInterval(tick, 15000);

  /* ---------- "try it" checklist ---------- */
  const done = new Set();
  function check(key) {
    if (done.has(key)) return;
    done.add(key);
    const li = $(`#tryList [data-t="${key}"]`); if (li) li.classList.add('done');
    $('#tryCount').textContent = `${done.size} / 5`;
    $('#tryBar').style.width = (done.size / 5 * 100) + '%';
  }

  /* ---------- toast + Dynamic Island ---------- */
  const toast = $('#toast');
  function say(msg) {
    toast.textContent = msg;
    if (G) { G.killTweensOf(toast); G.fromTo(toast, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .35, ease: 'back.out(2)' }); G.to(toast, { opacity: 0, y: 8, duration: .3, delay: 1.8 }); }
    else { toast.style.opacity = 1; setTimeout(() => { toast.style.opacity = 0; }, 2000); }
  }
  const island = $('#island'), islC = $('#islC');
  function islandAlert(title, sub) {
    islC.replaceChildren();
    const t = el('span', 'tick'); const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', '18'); svg.setAttribute('height', '18'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', '#000'); svg.setAttribute('stroke-width', '3');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', 'M5 12.5l4.2 4.2L19 7'); svg.append(p); t.append(svg);
    const txt = el('div'); txt.append(el('b', null, title), el('small', null, sub));
    islC.append(t, txt);
    if (!G) return;
    G.timeline()
      .to(island, { width: 316, height: 64, marginLeft: -158, borderRadius: 32, duration: .55, ease: 'elastic.out(1, .7)' })
      .to(islC, { opacity: 1, duration: .25 }, .2)
      .to(islC, { opacity: 0, duration: .2 }, 2.6)
      .to(island, { width: 124, height: 36, marginLeft: -62, borderRadius: 22, duration: .45, ease: 'power3.inOut' }, 2.7);
  }

  /* ---------- state ---------- */
  const S = { balance: 12480.32, hidden: false };
  const balEl = $('#balance');
  const shown = { v: S.balance };
  function paintBalance(animate) {
    if (S.hidden) { balEl.textContent = '••••••'; return; }
    if (G && animate) G.to(shown, { v: S.balance, duration: .9, ease: 'power3.out', onUpdate: () => { balEl.textContent = money(shown.v); } });
    else { shown.v = S.balance; balEl.textContent = money(S.balance); }
    $('#avail').textContent = 'Available $' + money(S.balance);
  }
  $('#eyeBtn').addEventListener('click', () => { S.hidden = !S.hidden; $('#eyeBtn').setAttribute('aria-label', S.hidden ? 'Show balance' : 'Hide balance'); paintBalance(false); haptic(); });

  /* ---------- titanium card: flip + tilt ---------- */
  const card = $('#card3d'), cardIn = $('#cardIn');
  const C = { flip: 0, rx: 0, ry: 0 };
  const paintCard = () => { cardIn.style.transform = `rotateX(${C.rx}deg) rotateY(${C.flip + C.ry}deg)`; };
  function flip() {
    haptic(12); check('flip');
    const to = C.flip === 0 ? 180 : 0;
    if (G) G.to(C, { flip: to, duration: 1, ease: 'elastic.out(1, .65)', onUpdate: paintCard });
    else { C.flip = to; paintCard(); }
  }
  card.addEventListener('click', flip);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  card.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    C.ry = (x - .5) * 16; C.rx = (.5 - y) * 12; paintCard();
    $$('.face').forEach(f => { f.style.setProperty('--gx', (x * 100) + '%'); f.style.setProperty('--gy', (y * 100) + '%'); });
  });
  card.addEventListener('pointerleave', () => { if (G) G.to(C, { rx: 0, ry: 0, duration: .6, ease: 'power3.out', onUpdate: paintCard }); else { C.rx = C.ry = 0; paintCard(); } });

  /* ---------- transactions with swipe actions ---------- */
  let TX = [
    { day: 'Today', name: 'Blue Bottle Coffee', cat: 'Food & drink', amt: -6.40, c: '#0A84FF', l: 'B' },
    { day: 'Today', name: 'Salary · Northwind', cat: 'Income', amt: 4250, c: '#30D158', l: 'N' },
    { day: 'Today', name: 'Uber', cat: 'Transport', amt: -18.90, c: '#636366', l: 'U' },
    { day: 'Yesterday', name: 'Whole Foods', cat: 'Groceries', amt: -84.12, c: '#34C759', l: 'W' },
    { day: 'Yesterday', name: 'Spotify', cat: 'Subscriptions', amt: -11.99, c: '#1DB954', l: 'S' },
    { day: 'Yesterday', name: 'Maya Chen', cat: 'Transfer received', amt: 40, c: '#BF5AF2', l: 'M' },
    { day: 'Mon', name: 'Apple Store', cat: 'Shopping', amt: -129, c: '#8E8E93', l: 'A' },
    { day: 'Mon', name: 'Shell', cat: 'Transport', amt: -52.30, c: '#FF9F0A', l: 'S' }
  ];
  const list = $('#txList');
  function renderTx() {
    list.replaceChildren();
    let day = null;
    TX.forEach((t, i) => {
      if (t.day !== day) { day = t.day; list.append(el('div', 'tx-day', day)); }
      const wrap = el('div', 'tx'); wrap.dataset.i = i;
      const acts = el('div', 'tx-actions');
      const fl = el('button', 'flag', t.flag ? 'Unflag' : 'Flag'); fl.type = 'button';
      const de = el('button', 'del', 'Delete'); de.type = 'button';
      acts.append(fl, de);
      const row = el('div', 'tx-row');
      const ic = el('span', 'tx-ic', t.l); ic.style.background = t.c;
      const mid = el('div', 'tx-mid'); const nb = el('b', null, t.name); if (t.flag) nb.append(el('span', 'flagged', '⚑'));
      mid.append(nb, el('small', null, t.cat));
      const amt = el('span', 'tx-amt' + (t.amt > 0 ? ' in' : ''), (t.amt > 0 ? '+' : '−') + '$' + money(Math.abs(t.amt)));
      row.append(ic, mid, amt);
      wrap.append(acts, row); list.append(wrap);
      swipeable(wrap, row);
      fl.addEventListener('click', () => { t.flag = !t.flag; haptic(); say(t.flag ? 'Flagged for review' : 'Flag removed'); renderTx(); });
      de.addEventListener('click', () => {
        haptic(15);
        const kill = () => { TX = TX.filter(x => x !== t); renderTx(); };
        if (G) G.to(wrap, { height: 0, marginBottom: 0, opacity: 0, duration: .35, ease: 'power2.in', onComplete: kill }); else kill();
        say('Transaction hidden');
      });
    });
  }
  let openRow = null;
  function swipeable(wrap, row) {
    let x0 = 0, y0 = 0, dx = 0, base = 0, active = false, horiz = null;
    const MAX = -152;
    const set = x => { row.style.transform = `translateX(${x}px)`; };
    row.addEventListener('pointerdown', e => { active = true; horiz = null; x0 = e.clientX; y0 = e.clientY; base = G ? G.getProperty(row, 'x') : 0; if (openRow && openRow !== row) { if (G) G.to(openRow, { x: 0, duration: .4, ease: 'power3.out' }); openRow = null; } });
    row.addEventListener('pointermove', e => {
      if (!active) return;
      dx = e.clientX - x0;
      if (horiz === null && (Math.abs(dx) > 8 || Math.abs(e.clientY - y0) > 8)) { horiz = Math.abs(dx) > Math.abs(e.clientY - y0); if (horiz) { try { row.setPointerCapture(e.pointerId); } catch (_) {} } }
      if (!horiz) return;
      let x = Math.min(0, base + dx); if (x < MAX) x = MAX + (x - MAX) * .3; // rubber band
      if (G) G.set(row, { x }); else set(x);
    });
    const end = () => {
      if (!active) return; active = false; if (!horiz) return;
      const x = G ? G.getProperty(row, 'x') : 0;
      if (x < -60) { if (G) G.to(row, { x: MAX, duration: .5, ease: 'elastic.out(1, .8)' }); openRow = row; haptic(); check('swipe'); }
      else if (G) G.to(row, { x: 0, duration: .45, ease: 'power3.out' });
    };
    row.addEventListener('pointerup', end); row.addEventListener('pointercancel', end);
  }
  renderTx();

  /* ---------- tabs ---------- */
  const views = { home: $('#v-home'), analytics: $('#v-analytics'), cards: $('#v-cards'), profile: $('#v-profile') };
  const order = ['home', 'analytics', 'cards', 'profile'];
  let current = 'home';
  function go(v) {
    if (v === current) return;
    const dir = order.indexOf(v) > order.indexOf(current) ? 1 : -1;
    const from = views[current], to = views[v];
    $$('.tabbar button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === v)));
    to.hidden = false; to.scrollTop = 0;
    if (G) { G.fromTo(to, { xPercent: 18 * dir, opacity: 0 }, { xPercent: 0, opacity: 1, duration: .45, ease: 'power3.out' }); G.to(from, { xPercent: -10 * dir, opacity: 0, duration: .3, ease: 'power2.in', onComplete: () => { from.hidden = true; G.set(from, { xPercent: 0, opacity: 1 }); } }); }
    else from.hidden = true;
    current = v; haptic(5);
    if (v === 'analytics') drawAnalytics(true);
  }
  $$('.tabbar button').forEach(b => b.addEventListener('click', () => go(b.dataset.v)));

  /* ---------- analytics ---------- */
  const DATA = {
    week: { labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], full: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], v: [181.3, 42.1, 96.4, 64.8, 210.5, 156.2, 73.9] },
    month: { labels: ['W1', 'W2', 'W3', 'W4'], full: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], v: [612.4, 488.9, 825.2, 540.1] }
  };
  const CATS = [['Groceries', '#34C759', 'G', .32], ['Food & drink', '#0A84FF', 'F', .24], ['Transport', '#FF9F0A', 'T', .18], ['Shopping', '#BF5AF2', 'S', .16], ['Subscriptions', '#FF453A', 'S', .10]];
  let period = 'week', selBar = -1;
  const spentEl = $('#spent'), barsEl = $('#bars'), catsEl = $('#cats');
  const spent = { v: 0 };
  function drawAnalytics(animate) {
    const D = DATA[period], total = D.v.reduce((a, b) => a + b, 0), max = Math.max(...D.v);
    $('#perLbl').textContent = period;
    if (G && animate) G.fromTo(spent, { v: 0 }, { v: total, duration: .9, ease: 'power3.out', onUpdate: () => { spentEl.textContent = '$' + money(spent.v); } });
    else spentEl.textContent = '$' + money(total);
    barsEl.replaceChildren();
    D.v.forEach((v, i) => {
      const b = el('button', 'bar' + (i === selBar ? ' on' : '')); b.type = 'button'; b.setAttribute('aria-label', `${D.full[i]}: $${money(v)}`);
      const fill = el('i'); fill.style.height = (v / max * 82) + '%';
      b.append(fill, el('small', null, D.labels[i]));
      b.addEventListener('click', () => {
        selBar = i; haptic(); check('analytics');
        $$('.bar').forEach((x, j) => x.classList.toggle('on', j === i));
        const tip = $('#barTip'); tip.replaceChildren(document.createTextNode(D.full[i] + ' · '), el('b', null, '$' + money(v)), document.createTextNode(` · ${Math.round(v / total * 100)}% of the ${period}`));
        if (G) G.fromTo(fill, { scaleY: .85 }, { scaleY: 1, transformOrigin: 'bottom', duration: .5, ease: 'elastic.out(1, .5)' });
      });
      barsEl.append(b);
    });
    if (G && animate) G.from(barsEl.querySelectorAll('i'), { scaleY: 0, transformOrigin: 'bottom', duration: .7, stagger: .05, ease: 'back.out(1.6)' });
    catsEl.replaceChildren();
    CATS.forEach(([n, c, l, f]) => {
      const r = el('div', 'cat'); const ic = el('span', 'tx-ic', l); ic.style.background = c;
      const mid = el('div'); const tr = el('div', 'tr'); const fi = el('i'); fi.style.background = c; fi.style.width = (f * 100 / .32 * .9) + '%'; tr.append(fi); mid.append(el('b', null, n), tr);
      r.append(ic, mid, el('span', null, '$' + money(total * f))); catsEl.append(r);
      if (G && animate) G.from(fi, { width: 0, duration: .9, ease: 'power3.out', delay: .2 });
    });
  }
  $$('.seg button').forEach((b, i) => b.addEventListener('click', () => {
    period = b.dataset.p; selBar = -1; $('#barTip').textContent = 'Tap a bar to see that day';
    $$('.seg button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    $('#segInd').style.transform = `translateX(${i * 100}%)`; haptic(); drawAnalytics(true);
  }));
  drawAnalytics(false);

  /* ---------- cards ---------- */
  const MINI = [['Titanium', 'linear-gradient(125deg,#5A5853,#C7C4BE 60%,#4F4D49)'], ['Virtual', 'linear-gradient(125deg,#0A84FF,#5E5CE6)'], ['Travel', 'linear-gradient(125deg,#30D158,#0A84FF)']];
  MINI.forEach(([n, bg], i) => {
    const b = el('button', 'mini-card'); b.type = 'button'; b.style.background = bg; b.setAttribute('aria-pressed', String(i === 0));
    b.append(el('span', null, n.toUpperCase()), el('span', 'mono', '•• ' + (4821 + i * 1117)));
    b.addEventListener('click', () => { $$('.mini-card').forEach(x => x.setAttribute('aria-pressed', String(x === b))); haptic(); });
    $('#miniCards').append(b);
  });
  $$('.sw').forEach(s => s.addEventListener('click', () => {
    const on = s.getAttribute('aria-checked') !== 'true'; s.setAttribute('aria-checked', String(on)); haptic(10);
    if (s.id === 'freezeSw') { cardIn.classList.toggle('frozen', on); say(on ? 'Card frozen · tap again to unfreeze' : 'Card unfrozen'); if (on) check('freeze'); }
  }));
  const lim = $('#limit');
  const paintLim = () => { const v = +lim.value, sp = 1214; lim.style.setProperty('--p', ((v - 200) / 4800 * 100) + '%'); $('#limOut').textContent = '$' + v.toLocaleString(); $('#limNote').textContent = v > sp ? `$1,214 spent · $${(v - sp).toLocaleString()} left` : '$1,214 spent · over your limit'; };
  lim.addEventListener('input', paintLim); paintLim();

  /* ---------- send / request sheet ---------- */
  const PEOPLE = [['Maya', '#BF5AF2'], ['Jon', '#FF9F0A'], ['Priya', '#30D158'], ['Leo', '#FF453A'], ['Sam', '#64D2FF'], ['Ada', '#5E5CE6']];
  const sheet = $('#sheet'), scrim = $('#scrim');
  const T = { amt: '0', who: null, mode: 'send' };
  PEOPLE.forEach(([n, c]) => {
    const b = el('button', 'contact'); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
    const av = el('span', 'av', n[0]); av.style.background = c; b.append(av, document.createTextNode(n));
    b.addEventListener('click', () => { T.who = n; $$('.contact').forEach(x => x.setAttribute('aria-pressed', String(x === b))); haptic(); if (G) G.fromTo(av, { scale: .8 }, { scale: 1.06, duration: .5, ease: 'elastic.out(1,.5)' }); paintSend(); });
    $('#contacts').append(b);
  });
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].forEach(k => {
    const b = el('button', 'key', k); b.type = 'button'; b.setAttribute('aria-label', k === '⌫' ? 'Delete' : k);
    b.addEventListener('click', () => press(k, b)); $('#keypad').append(b);
  });
  function press(k, b) {
    let a = T.amt;
    if (k === '⌫') a = a.length > 1 ? a.slice(0, -1) : '0';
    else if (k === '.') { if (!a.includes('.')) a += '.'; }
    else if (a.includes('.') && a.split('.')[1].length >= 2) { bump(true); return; }
    else if (a.replace('.', '').length >= 6) { bump(true); return; }
    else a = a === '0' ? k : a + k;
    T.amt = a; haptic(6);
    if (G && b) G.fromTo(b, { scale: .86 }, { scale: 1, duration: .45, ease: 'elastic.out(1.2, .4)' });
    bump(false); paintSend();
  }
  function bump(err) {
    const v = $('#amtV');
    if (!G) return;
    if (err) { haptic([10, 40, 10]); G.fromTo(v, { x: -10 }, { x: 0, duration: .5, ease: 'elastic.out(1.4, .25)' }); }
    else G.fromTo(v, { scale: 1.08 }, { scale: 1, duration: .45, ease: 'elastic.out(1, .45)' });
  }
  function paintSend() {
    const n = parseFloat(T.amt) || 0, over = T.mode === 'send' && n > S.balance;
    $('#amtN').textContent = T.amt;
    const av = $('#avail'); av.classList.toggle('err', over); av.textContent = over ? 'Not enough balance' : (T.mode === 'send' ? 'Available $' + money(S.balance) : 'They\'ll get a request in the app');
    const btn = $('#sendBtn');
    btn.disabled = !T.who || n <= 0 || over;
    $('#sendLbl').textContent = !T.who ? 'Choose a contact' : n <= 0 ? 'Enter an amount' : `${T.mode === 'send' ? 'Send' : 'Request'} $${money(n)} ${T.mode === 'send' ? 'to' : 'from'} ${T.who}`;
  }
  function openSheet(mode) {
    T.mode = mode; T.amt = '0'; T.who = null;
    $$('.contact').forEach(x => x.setAttribute('aria-pressed', 'false'));
    $('#sheetTitle').textContent = mode === 'send' ? 'Send money' : 'Request money';
    paintSend();
    sheet.hidden = false; scrim.hidden = false;
    if (G) { G.to(scrim, { opacity: 1, duration: .3 }); G.fromTo(sheet, { yPercent: 100 }, { yPercent: 0, duration: .65, ease: 'elastic.out(1, .85)' }); }
    else { sheet.style.transform = 'none'; scrim.style.opacity = 1; }
    haptic(10);
  }
  function closeSheet() {
    const fin = () => { sheet.hidden = true; scrim.hidden = true; };
    if (G) { G.to(scrim, { opacity: 0, duration: .25 }); G.to(sheet, { yPercent: 100, duration: .35, ease: 'power3.in', onComplete: fin }); } else fin();
  }
  $('#sheetClose').addEventListener('click', closeSheet);
  scrim.addEventListener('click', closeSheet);
  // drag the grabber down to dismiss
  const grab = $('#grab'); let gy0 = null;
  grab.addEventListener('pointerdown', e => { gy0 = e.clientY; grab.setPointerCapture(e.pointerId); });
  grab.addEventListener('pointermove', e => { if (gy0 == null || !G) return; const dy = Math.max(0, e.clientY - gy0) / (parseFloat(getComputedStyle(stage).getPropertyValue('--s')) || 1); G.set(sheet, { y: dy }); });
  grab.addEventListener('pointerup', e => { if (gy0 == null) return; const dy = e.clientY - gy0; gy0 = null; if (!G) return; if (dy > 110) { G.set(sheet, { y: 0 }); closeSheet(); } else G.to(sheet, { y: 0, duration: .5, ease: 'elastic.out(1, .7)' }); });
  $('#sendBtn').addEventListener('click', () => {
    const n = parseFloat(T.amt), who = T.who, mode = T.mode;
    const btn = $('#sendBtn'); btn.disabled = true; $('#sendLbl').textContent = 'Confirming with Face ID…';
    const finish = () => {
      if (mode === 'send') {
        S.balance -= n;
        TX.unshift({ day: 'Today', name: who, cat: 'Transfer sent', amt: -n, c: PEOPLE.find(p => p[0] === who)[1], l: who[0] });
        renderTx(); paintBalance(true); check('send');
        islandAlert(`Sent $${money(n)}`, `to ${who} · just now`);
      } else islandAlert(`Requested $${money(n)}`, `from ${who}`);
      haptic([12, 60, 18]); closeSheet();
      if (G) G.set('#sendProg', { scaleX: 0 });
    };
    if (G) G.fromTo('#sendProg', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power2.inOut', onComplete: finish }); else finish();
  });
  document.addEventListener('keydown', e => {
    if (sheet.hidden) return;
    if (e.key === 'Escape') closeSheet();
    if (/^[0-9.]$/.test(e.key)) press(e.key);
    if (e.key === 'Backspace') press('⌫');
  });

  /* ---------- quick actions + sidebar jumps ---------- */
  $$('.quick button').forEach(b => b.addEventListener('click', () => {
    const q = b.dataset.q;
    if (G) G.fromTo(b.firstElementChild, { scale: .85 }, { scale: 1, duration: .5, ease: 'elastic.out(1, .4)' });
    if (q === 'send' || q === 'request') openSheet(q);
    if (q === 'topup') { S.balance += 100; paintBalance(true); TX.unshift({ day: 'Today', name: 'Top up · Apple Pay', cat: 'Income', amt: 100, c: '#30D158', l: '+' }); renderTx(); islandAlert('Added $100.00', 'from Apple Pay'); haptic(12); }
    if (q === 'split') say('Split bills is in the full build');
  }));
  $$('[data-jump]').forEach(b => b.addEventListener('click', () => {
    const j = b.dataset.jump;
    if (document.documentElement.clientWidth <= 1180) stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    if (j === 'send') { go('home'); setTimeout(() => openSheet('send'), 350); } else { if (!sheet.hidden) closeSheet(); go(j); }
  }));

  paintBalance(false);

  /* ---------- intro ---------- */
  if (G) {
    G.from('#device', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' });
    G.from('.side', { y: 30, opacity: 0, duration: 1, stagger: .15, ease: 'expo.out', delay: .2 });
    G.from('#v-home > *', { y: 24, opacity: 0, duration: .7, stagger: .06, ease: 'power3.out', delay: .5 });
    // nudge: the card flips once by itself so people know it can
    G.delayedCall(1.8, () => { if (C.flip === 0) G.timeline().to(C, { flip: 22, duration: .35, ease: 'power2.out', onUpdate: paintCard }).to(C, { flip: 0, duration: .8, ease: 'elastic.out(1, .4)', onUpdate: paintCard }); });
  }
})();
