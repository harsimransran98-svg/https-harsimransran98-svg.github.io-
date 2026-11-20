/* CoinKeeper — Android app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "stage";
/* ---------- CoinKeeper ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const M = {"key":"ck_state_v1","people":[["you","You","#146C43"],["maya","Maya","#E4572E"],["tom","Tom","#3D5A80"]],"cats":{"food":["Groceries","🥦","#2E933C"],"bills":["Bills","💡","#F2B705"],"home":["Home","🧽","#3D5A80"],"fun":["Going out","🍕","#E4572E"]},"seed":[["Big weekly shop",4860,"food","maya",["you","maya","tom"],0],["Electricity, October",9300,"bills","you",["you","maya","tom"],1],["Cleaning stuff",1290,"home","tom",["you","maya","tom"],1],["Pizza night",3600,"fun","you",["you","tom"],2],["Broadband",3000,"bills","maya",["you","maya","tom"],3]]};
    const P = Object.fromEntries(M.people.map(([k, n, c]) => [k, { k, n, c }]));
    const money = p => '£' + (Math.abs(p) / 100).toFixed(2);
    const valid = e => e && typeof e.t === 'string' && Number.isInteger(e.a) && e.a > 0 && e.a < 10000000 && P[e.by] && Array.isArray(e.split) && e.split.length && e.split.every(k => P[k]) && (e.cat === 'settle' || M.cats[e.cat]);
    const saved = store.get(M.key, null);
    let ex = Array.isArray(saved) && saved.every(valid) ? saved.map(e => ({ ...e, t: e.t.slice(0, 40) })) : M.seed.map(([t, a, cat, by, split, d], i) => ({ id: i + 1, t, a, cat, by, split, d }));
    let uid = Math.max(0, ...ex.map(e => e.id || 0)) + 1;
    const save = () => store.set(M.key, ex);
    const dayLbl = d => d === 0 ? 'Today' : d === 1 ? 'Yesterday' : new Date(Date.now() - d * 864e5).toLocaleDateString(undefined, { weekday: 'long' });
    const av = k => { const a = el('span', 'ck-av', P[k].n[0]); a.style.setProperty('--pc', P[k].c); a.setAttribute('aria-hidden', 'true'); return a; };

    /* ---- balances (integer pennies) + greedy simplification ---- */
    function nets() { const n = {}; M.people.forEach(([k]) => { n[k] = 0; }); ex.forEach(e => { n[e.by] += e.a; const share = Math.floor(e.a / e.split.length); let rem = e.a - share * e.split.length; e.split.forEach(k => { n[k] -= share + (rem-- > 0 ? 1 : 0); }); }); return n; }
    function simplify() { const n = nets(), cr = [], db = []; Object.entries(n).forEach(([k, v]) => { if (v > 0) cr.push([k, v]); else if (v < 0) db.push([k, -v]); });
      const out = []; cr.sort((a, b) => b[1] - a[1]); db.sort((a, b) => b[1] - a[1]); let i = 0, j = 0;
      while (i < db.length && j < cr.length) { const x = Math.min(db[i][1], cr[j][1]); if (x > 0) out.push({ from: db[i][0], to: cr[j][0], a: x }); db[i][1] -= x; cr[j][1] -= x; if (!db[i][1]) i++; if (!cr[j][1]) j++; } return out; }

    /* ---- shell ---- */
    const root = el('div', 'ck'), views = { home: el('section', 'ck-v'), add: el('section', 'ck-v'), activity: el('section', 'ck-v') };
    Object.entries(views).forEach(([k, v]) => { v.setAttribute('aria-label', k); if (k !== 'home') v.hidden = true; root.append(v); });
    const nav = el('nav', 'ck-nav'), mkNav = (v, label, path) => { const b = el('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.v = v; const ic = svgEl('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'aria-hidden': 'true' }); ic.append(svgEl('path', { d: path })); b.append(ic, document.createTextNode(label)); b.addEventListener('click', () => go(v)); return b; };
    const fab = el('button', 'ck-fab', '+'); fab.type = 'button'; fab.setAttribute('aria-label', 'Add expense'); fab.dataset.v = 'add'; fab.addEventListener('click', () => go('add'));
    nav.append(mkNav('home', 'Balances', 'M3 12h4l3-8 4 16 3-8h4'), fab, mkNav('activity', 'Activity', 'M4 6h16M4 12h16M4 18h10')); root.append(nav); app.append(root);
    let cur = 'home';
    function go(v, quiet) { if (v === cur) return; const from = views[cur], to = views[v]; nav.querySelectorAll('[data-v]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === v)));
      to.hidden = false; to.scrollTop = 0; if (v === 'add') resetAdd(); if (v === 'activity') { renderAct(); check('activity'); } if (v === 'home') renderHome();
      const fk = cur; if (G) { G.killTweensOf(to); G.fromTo(to, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .38, ease: 'expo.out' }); G.to(from, { opacity: 0, duration: .15, onComplete: () => { if (cur !== fk) from.hidden = true; G.set(from, { opacity: 1 }); } }); } else from.hidden = true;
      cur = v; if (!quiet) haptic(6); }
    H.jump = v => go(v);

    /* ---- home ---- */
    function renderHome() {
      const v = views.home; v.textContent = ''; const h = el('div', 'ck-h'), ht = el('div'); ht.append(el('small', null, new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })), el('h2', null, 'Flat 4B')); h.append(ht, av('you'));
      const total = ex.filter(e => e.cat !== 'settle').reduce((a, e) => a + e.a, 0), tot = el('div', 'ck-tot'), avs = el('div', 'avs'); M.people.forEach(([k]) => avs.append(av(k))); tot.append(el('small', null, 'Spent together this month'), el('b', null, money(total)), avs);
      v.append(h, tot, el('p', 'ck-sec', 'Settle up'));
      const debts = simplify();
      if (!debts.length) v.append(el('div', 'ck-even', 'Everyone is square 🎉'));
      debts.forEach(d => { const r = el('div', 'ck-debt'), p = el('p'), b = el('button', null, 'Settle up'); b.type = 'button'; p.append(el('b', null, money(d.a)), document.createTextNode(P[d.from].n + (d.from === 'you' ? ' owe ' : ' owes ') + P[d.to].n));
        b.setAttribute('aria-label', 'Settle ' + money(d.a) + ' from ' + P[d.from].n + ' to ' + P[d.to].n); b.addEventListener('click', () => sheet(d)); r.append(av(d.from), el('span', 'ar', '→'), av(d.to), p, b); v.append(r); });
      v.append(el('p', 'ck-sec', 'This month by category'));
      const by = {}; ex.forEach(e => { if (e.cat !== 'settle') by[e.cat] = (by[e.cat] || 0) + e.a; });
      const ch = el('div', 'ck-chart'), svg = svgEl('svg', { viewBox: '0 0 100 100', 'aria-hidden': 'true' }), lg = el('div', 'ck-lg'); ch.tabIndex = 0; ch.setAttribute('role', 'button'); ch.setAttribute('aria-label', 'Spending by category');
      const C = 2 * Math.PI * 38; let off = 0; svg.append(svgEl('circle', { cx: 50, cy: 50, r: 38, stroke: '#EEF2EC' }));
      Object.entries(by).sort((a, b) => b[1] - a[1]).forEach(([k, a]) => { const f = a / Math.max(1, total), c0 = svgEl('circle', { cx: 50, cy: 50, r: 38, stroke: M.cats[k][2], 'stroke-dasharray': (f * C - 2).toFixed(1) + ' ' + C.toFixed(1), 'stroke-dashoffset': (-off * C).toFixed(1) }); svg.append(c0); off += f;
        const sp = el('span'), i = el('i'); i.style.setProperty('--c', M.cats[k][2]); sp.append(i, document.createTextNode(M.cats[k][0]), el('b', null, Math.round(f * 100) + '%')); lg.append(sp); });
      ch.append(svg, lg); const hit = () => { check('chart'); say('Bills are the biggest slice this month'); }; ch.addEventListener('click', hit); ch.addEventListener('keydown', e => { if (e.key === 'Enter') hit(); }); v.append(ch);
    }

    /* ---- settle sheet + coins ---- */
    function sheet(d) {
      const scrim = el('div', 'ck-scrim'), sh = el('div', 'ck-sheet'), who = el('div', 'who'); sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-label', 'Settle up');
      who.append(av(d.from), document.createTextNode(money(d.a)), av(d.to));
      const pay = el('button', 'pay', 'Mark as paid'), bank = el('button', 'bank', 'Open banking app'); pay.type = bank.type = 'button';
      sh.append(el('h3', null, 'Settle up'), el('p', null, P[d.from].n + ' pays ' + P[d.to].n + '. This clears the balance between you.'), who, pay, bank); root.append(scrim, sh);
      const close = () => { if (G) { G.to(sh, { y: '100%', duration: .3, ease: 'power2.in', onComplete: () => sh.remove() }); G.to(scrim, { opacity: 0, duration: .3, onComplete: () => scrim.remove() }); } else { sh.remove(); scrim.remove(); } };
      scrim.addEventListener('click', close); bank.addEventListener('click', () => { say('This demo cannot open your bank, but the real app does'); });
      pay.addEventListener('click', () => { ex.unshift({ id: uid++, t: P[d.from].n + ' paid ' + P[d.to].n, a: d.a, cat: 'settle', by: d.from, split: [d.to], d: 0 }); save(); close(); coins(); renderHome(); check('settle'); tone(988, .08); setTimeout(() => tone(1318, .1), 110); say(money(d.a) + ' settled'); });
      if (G) { G.from(sh, { y: '100%', duration: .45, ease: 'expo.out' }); G.from(scrim, { opacity: 0, duration: .3 }); } pay.focus();
    }
    function coins() { if (!G || reduced) return; const r = root.getBoundingClientRect(); for (let i = 0; i < 14; i++) { const c = el('i', 'ck-coin'); c.style.left = (r.width / 2 - 11) + 'px'; c.style.top = (r.height * .55) + 'px'; root.append(c);
      G.to(c, { x: (Math.random() - .5) * 260, y: -120 - Math.random() * 200, rotation: Math.random() * 720, duration: .7, ease: 'power2.out' }); G.to(c, { y: '+=420', opacity: 0, duration: .7, delay: .7, ease: 'power2.in', onComplete: () => c.remove() }); } }

    /* ---- add expense ---- */
    const A = { p: 0, cat: 'food', by: 'you', split: M.people.map(p => p[0]) };
    const v = views.add, hd = el('div', 'ck-h'), hh = el('div'); hh.append(el('small', null, 'New expense'), el('h2', null, 'Add')); hd.append(hh);
    const amt = el('div', 'ck-amt', '£0.00'), each = el('div', 'ck-each'), desc = el('input', 'ck-desc'); amt.setAttribute('aria-live', 'polite'); desc.maxLength = 40; desc.setAttribute('aria-label', 'What was it for?');
    const chips = el('div', 'ck-chips'); Object.entries(M.cats).forEach(([k, [n, e]]) => { const b = el('button', null, e + ' ' + n); b.type = 'button'; b.dataset.k = k; b.addEventListener('click', () => { A.cat = k; desc.placeholder = n; sync(); }); chips.append(b); });
    const paid = el('div', 'ck-pp'), spl = el('div', 'ck-pp');
    M.people.forEach(([k, n, c]) => { const b1 = el('button'), b2 = el('button'); b1.type = b2.type = 'button'; [b1, b2].forEach(b => { b.style.setProperty('--pc', c); b.append(av(k), document.createTextNode(n)); });
      b1.dataset.k = b2.dataset.k = k; b1.addEventListener('click', () => { A.by = k; sync(); }); b2.addEventListener('click', () => { const i = A.split.indexOf(k); if (i >= 0 && A.split.length > 1) A.split.splice(i, 1); else if (i < 0) A.split.push(k); sync(); }); paid.append(b1); spl.append(b2); });
    const r1 = el('div', 'ck-row'), r2 = el('div', 'ck-row'); r1.append(el('span', null, 'Paid by'), paid); r2.append(el('span', null, 'Split'), spl);
    const keys = el('div', 'ck-keys'); ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '⌫'].forEach(k => { const b = el('button', null, k); b.type = 'button'; b.setAttribute('aria-label', k === '⌫' ? 'Delete digit' : k); b.addEventListener('click', () => key(k)); keys.append(b); });
    const saveB = el('button', 'ck-save', 'Add expense'); saveB.type = 'button'; v.append(hd, amt, each, desc, chips, r1, r2, keys, saveB);
    function key(k) { if (k === '⌫') A.p = Math.floor(A.p / 10); else { const nx = Number(String(A.p) + k); if (nx < 10000000) A.p = nx; } amt.classList.remove('pop'); void amt.offsetWidth; amt.classList.add('pop'); tone(600 + (A.p % 7) * 40, .03); sync(); }
    v.addEventListener('keydown', e => { if (e.target === desc) return; if (/^[0-9]$/.test(e.key)) key(e.key); if (e.key === 'Backspace') key('⌫'); });
    function sync() { amt.textContent = money(A.p); each.textContent = A.p ? money(Math.round(A.p / A.split.length)) + ' each · ' + A.split.length + ' people' : ' '; chips.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === A.cat)));
      paid.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === A.by))); spl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(A.split.includes(b.dataset.k)))); saveB.disabled = !A.p; }
    function resetAdd() { A.p = 0; A.cat = 'food'; A.by = 'you'; A.split = M.people.map(p => p[0]); desc.value = ''; desc.placeholder = M.cats.food[0]; sync(); }
    saveB.addEventListener('click', () => { if (!A.p) return; ex.unshift({ id: uid++, t: (desc.value.trim() || M.cats[A.cat][0]).slice(0, 40), a: A.p, cat: A.cat, by: A.by, split: A.split.slice(), d: 0 }); save(); check('add'); if (A.split.length < M.people.length) check('split'); tone(784, .08); say(money(A.p) + ' added · balances updated'); go('home'); });

    /* ---- activity + undo ---- */
    let undoEl = null, undoT = 0;
    function renderAct() {
      const w = views.activity; w.textContent = ''; const h = el('div', 'ck-h'), ht = el('div'); ht.append(el('small', null, ex.length + ' entries'), el('h2', null, 'Activity')); h.append(ht); w.append(h);
      let last = -1; [...ex].sort((a, b) => a.d - b.d).forEach(e => { if (e.d !== last) { w.append(el('p', 'ck-day', dayLbl(e.d))); last = e.d; }
        const r = el('div', 'ck-ex' + (e.cat === 'settle' ? ' settle' : '')), ic = el('span', 'ic', e.cat === 'settle' ? '🤝' : M.cats[e.cat][1]), p = el('p'), yo = el('span', 'yo'), del = el('button', null, '🗑'); del.type = 'button';
        ic.style.setProperty('--c', e.cat === 'settle' ? '#F2B705' : M.cats[e.cat][2]); p.append(el('b', null, e.t), el('span', null, P[e.by].n + ' paid ' + money(e.a)));
        const mine = (e.by === 'you' ? e.a : 0) - (e.split.includes('you') ? Math.round(e.a / e.split.length) : 0); yo.textContent = mine ? (mine > 0 ? '+' : '−') + money(mine) : '–'; yo.classList.add(mine > 0 ? 'pos' : 'neg');
        del.setAttribute('aria-label', 'Delete ' + e.t); del.addEventListener('click', () => remove(e, r)); r.append(ic, p, yo, del); w.append(r); });
    }
    function remove(e, r) {
      const i = ex.indexOf(e); ex.splice(i, 1); save(); const done = () => { renderAct(); }; if (G) G.to(r, { x: -40, opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, duration: .3, onComplete: done }); else done();
      if (undoEl) undoEl.remove(); clearTimeout(undoT); undoEl = el('div', 'ck-undo'); const u = el('button', null, 'Undo'); u.type = 'button'; undoEl.append(el('span', null, '“' + e.t + '” deleted'), u); root.append(undoEl);
      u.addEventListener('click', () => { ex.splice(i, 0, e); save(); renderAct(); undoEl.remove(); undoEl = null; check('undo'); say('Restored'); });
      undoT = setTimeout(() => { if (undoEl) { undoEl.remove(); undoEl = null; } }, 5000); haptic(12);
    }

    nav.querySelector('[data-v="home"]').setAttribute('aria-selected', 'true'); renderHome(); resetAdd();
  }
  demo(H.app, H);
  H.boot();
})();
