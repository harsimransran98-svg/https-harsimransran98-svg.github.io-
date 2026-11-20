/* Ledgerly — Android app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "chapters";
/* ---------- Ledgerly ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const M = {"key":"lg_state_v1","pay":210000,"envs":[["rent","Rent",95000,95000,"#2F5D50"],["food","Food",32000,34600,"#C8553D"],["bills","Bills",18000,9200,"#8C6A3F"],["fun","Fun",15000,6400,"#6B4E8C"],["save","Savings",50000,0,"#3A6EA5"]]};
    const hx = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }, mixc = (a, b, t) => 'rgb(' + hx(a).map((v, i) => Math.round(b[i] + (v - b[i]) * t)).join(',') + ')';
    const money = p => (p < 0 ? '−' : '') + '£' + (Math.abs(p) / 100).toFixed(2);
    const E = M.envs.map(([k, n, budget, spent, c]) => ({ k, n, budget, bal: budget - spent, spent, c }));
    let unassigned = 0;
    const root = el('div', 'lg'), V = {}; ['envelopes', 'spend', 'month'].forEach(k => { V[k] = el('section', 'lg-v'); V[k].setAttribute('aria-label', k); if (k !== 'envelopes') V[k].hidden = true; root.append(V[k]); });
    const nav = el('nav', 'lg-nav'); [['envelopes', '✉', 'Envelopes'], ['spend', '−', 'Spend'], ['month', '◔', 'Month']].forEach(([k, ic, t]) => { const b = el('button'); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.append(el('span', null, ic), document.createTextNode(t)); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(nav); app.append(root); let cur = 'envelopes';
    function go(k) { closeSheet(); if (k === cur) { render(); return; } const a = V[cur], ak = cur; V[k].hidden = false; cur = k; nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k))); render(); if (k === 'month') check('month');
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: .35, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .12, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; haptic(5); }
    H.jump = k => { if (k === 'payday') { go('envelopes'); setTimeout(paydaySheet, 250); } else if (k === 'move') { go('envelopes'); setTimeout(() => moveSheet(), 250); } else go(k); };
    const head = (v, small, title) => { const h = el('div', 'lg-h'), d = el('div'); d.append(el('small', null, small), el('h2', null, title)); h.append(d); v.append(h); };

    /* ---- the paper envelope ---- */
    function envelope(e) {
      const wrap = el('div', 'lg-env'), f = Math.max(0, Math.min(1, e.bal / e.budget)), notes = Math.ceil(f * 5), sv = svgEl('svg', { viewBox: '0 0 160 112', 'aria-hidden': 'true' });
      sv.append(svgEl('rect', { x: 2, y: 22, width: 156, height: 88, rx: 6, fill: mixc(e.c, [243, 235, 221], .22) }), svgEl('path', { d: 'M2 26 L80 2 L158 26 Z', fill: mixc(e.c, [237, 227, 210], .3) }));
      for (let i = 0; i < notes; i++) { const g = svgEl('g', { transform: 'translate(' + (18 + i * 9) + ' ' + (18 - i * 2 + (5 - notes) * 3) + ') rotate(' + (-4 + i * 2) + ')' }); g.append(svgEl('rect', { width: 108, height: 50, rx: 3, fill: '#BFDDB8', stroke: '#5E8F66', 'stroke-width': 1.5 }), svgEl('circle', { cx: 54, cy: 25, r: 11, fill: 'none', stroke: '#5E8F66', 'stroke-width': 1.5 }), svgEl('text', { x: 10, y: 16, 'font-size': 10, 'font-family': 'IBM Plex Mono', fill: '#3F6B4A' }));
        g.lastChild.textContent = '£'; sv.append(g); }
      sv.append(svgEl('path', { d: 'M2 44 L80 76 L158 44 L158 104 Q158 110 152 110 L8 110 Q2 110 2 104 Z', fill: mixc(e.c, [255, 251, 243], .12), stroke: 'rgba(34,32,27,.12)' }));
      const lbl = el('div', 'lbl'), am = el('span', e.bal < 0 ? 'neg' : '', money(e.bal) + ' left'); lbl.append(el('b', null, e.n), am); wrap.append(sv, lbl);
      if (e.bal < 0) wrap.append(el('span', 'lg-stamp', 'OVER'));
      wrap.setAttribute('role', 'group'); wrap.setAttribute('aria-label', e.n + ' envelope, ' + money(e.bal) + ' left of ' + money(e.budget)); return wrap;
    }

    function render() {
      const v = V.envelopes; v.textContent = ''; head(v, new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }), 'Envelopes');
      const un = el('div', 'lg-un'), ut = el('div'), pb = el('button', null, unassigned ? 'Share it out' : 'Payday'); pb.type = 'button'; ut.append(el('small', null, unassigned ? 'Ready to assign' : 'Next pay day: 28th'), el('b', null, money(unassigned))); un.append(ut, pb); pb.addEventListener('click', paydaySheet); v.append(un);
      const grid = el('div', 'lg-grid'); E.forEach(e => { const c = el('div'); c.append(envelope(e)); if (e.bal < 0) { const b = el('button', 'lg-cover', 'Cover it'); b.type = 'button'; b.setAttribute('aria-label', 'Cover ' + e.n + ' overspend'); b.addEventListener('click', () => moveSheet(e)); c.append(b); } c.dataset.k = e.k; grid.append(c); }); v.append(grid);
      renderSpend(); renderMonth();
    }

    /* ---- sheets ---- */
    let sheetEls = null;
    function closeSheet() { if (!sheetEls) return; const [sc, sh] = sheetEls; sheetEls = null; sh.style.pointerEvents = 'none'; sc.style.pointerEvents = 'none'; if (G) { G.to(sh, { y: '100%', duration: .25, onComplete: () => sh.remove() }); G.to(sc, { opacity: 0, duration: .25, onComplete: () => sc.remove() }); } else { sh.remove(); sc.remove(); } }
    function openSheet(build) { closeSheet(); const sc = el('div', 'lg-scrim'), sh = el('div', 'lg-sheet'); sh.setAttribute('role', 'dialog'); sc.addEventListener('click', closeSheet); build(sh); root.append(sc, sh); sheetEls = [sc, sh]; if (G) { G.from(sh, { y: '100%', duration: .45, ease: 'expo.out' }); G.from(sc, { opacity: 0, duration: .3 }); } }
    function paydaySheet() { openSheet(sh => { sh.setAttribute('aria-label', 'Payday'); sh.append(el('h3', null, 'Payday: ' + money(M.pay)), el('p', 's', 'Shared out using last month’s plan. Every pound gets a job.'));
      const plan = el('div', 'lg-plan'); E.forEach(e => { const r = el('div'), i = el('i'); i.style.setProperty('--c', e.c); r.append(i, document.createTextNode(e.n), el('b', null, money(e.budget))); plan.append(r); });
      const go2 = el('button', 'lg-go', 'Share out ' + money(M.pay)); go2.type = 'button'; go2.addEventListener('click', share); sh.append(plan, go2); }); }
    function share() { closeSheet(); const from = V.envelopes.querySelector('.lg-un'), o = root.getBoundingClientRect(), fr = from.getBoundingClientRect();
      E.forEach((e, i) => { setTimeout(() => { e.bal += e.budget; e.spent = 0; const card = V.envelopes.querySelector('[data-k="' + e.k + '"]');
        if (G && !reduced && card) { const to = card.getBoundingClientRect(); for (let j = 0; j < 3; j++) { const n = el('i', 'lg-note'); n.style.left = (fr.left - o.left + fr.width - 90) + 'px'; n.style.top = (fr.top - o.top + 10) + 'px'; root.append(n); G.to(n, { x: to.left - fr.left - fr.width + 90 + 40 + j * 6, y: to.top - fr.top + 10, rotation: -20 + j * 15, duration: .6, delay: j * .06, ease: 'power2.inOut', onComplete: () => n.remove() }); } }
        tone(520 + i * 90, .05); if (i === E.length - 1) setTimeout(() => { render(); check('payday'); say('Payday shared out · £0 left unassigned'); }, 650); }, reduced ? 0 : i * 180); }); }
    function moveSheet(target) {
      const S = { from: E.find(e => e.k === 'fun' && e !== target) || E.find(e => e !== target), to: target || E.find(e => e.bal < 0) || E[1], amt: 0 };
      S.amt = target && target.bal < 0 ? Math.min(-target.bal, Math.max(0, S.from.bal)) : Math.min(2000, Math.max(0, S.from.bal));
      openSheet(sh => { sh.setAttribute('aria-label', 'Move money'); sh.append(el('h3', null, 'Move money'), el('p', 's', 'Take it from an envelope with room to spare.'));
        const amt = el('div', 'lg-amt'), rng = el('input', 'lg-rng'); rng.type = 'range'; rng.min = 0; rng.step = 50; rng.setAttribute('aria-label', 'Amount to move');
        const chipRow = (lab, key) => { sh.append(el('p', 'lg-lbl', lab)); const row = el('div', 'lg-chips'); E.forEach(e => { const b = el('button'), i = el('i'); b.type = 'button'; b.style.setProperty('--c', e.c); b.append(i, document.createTextNode(e.n + ' ' + money(e.bal))); b.addEventListener('click', () => { S[key] = e; sync(); }); b.dataset.k = e.k; row.append(b); }); sh.append(row); return row; };
        const fr = chipRow('From', 'from'), tr = chipRow('To', 'to'); sh.append(el('p', 'lg-lbl', 'Amount'), amt, rng); const go2 = el('button', 'lg-go'); go2.type = 'button'; sh.append(go2);
        function sync() { rng.max = Math.max(0, S.from.bal); S.amt = Math.min(S.amt, +rng.max); rng.value = S.amt; rng.style.setProperty('--p', (rng.max > 0 ? S.amt / rng.max * 100 : 0) + '%'); amt.textContent = money(S.amt);
          fr.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.from.k))); tr.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === S.to.k)));
          go2.textContent = 'Move ' + money(S.amt) + ' to ' + S.to.n; go2.disabled = !S.amt || S.from === S.to; }
        rng.addEventListener('input', () => { S.amt = +rng.value; sync(); });
        go2.addEventListener('click', () => { const wasNeg = S.to.bal < 0; S.from.bal -= S.amt; S.to.bal += S.amt; check('move'); if (wasNeg && S.to.bal >= 0) { check('cover'); say(S.to.n + ' covered · the red stamp is gone'); } else say('Moved ' + money(S.amt) + ' from ' + S.from.n + ' to ' + S.to.n); tone(700, .07); closeSheet(); render(); });
        sync(); }); }

    /* ---- spend ---- */
    const P = [['☕', 'Coffee', 450, 'fun'], ['🛒', 'Groceries', 2380, 'food'], ['🎬', 'Cinema', 1200, 'fun'], ['💡', 'Phone bill', 1500, 'bills']]; let pick = 1, env = 'food';
    function renderSpend() { const v = V.spend; v.textContent = ''; head(v, 'Log a purchase', 'Spend');
      const pr = el('div', 'lg-presets'); P.forEach(([ic, t, a, k], i) => { const b = el('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(i === pick)); b.append(el('b', null, ic + ' ' + money(a)), el('small', null, t)); b.addEventListener('click', () => { pick = i; env = k; renderSpend(); }); pr.append(b); }); v.append(pr, el('p', 'lg-lbl', 'From envelope'));
      const row = el('div', 'lg-chips'); E.forEach(e => { const b = el('button'), i = el('i'); b.type = 'button'; b.style.setProperty('--c', e.c); b.setAttribute('aria-pressed', String(e.k === env)); b.append(i, document.createTextNode(e.n + ' ' + money(e.bal))); b.addEventListener('click', () => { env = e.k; renderSpend(); }); row.append(b); }); v.append(row);
      const e = E.find(x => x.k === env), go2 = el('button', 'lg-go', 'Spend ' + money(P[pick][2]) + ' from ' + e.n); go2.type = 'button'; v.append(go2, el('p', 'lg-lbl', e.bal - P[pick][2] < 0 ? 'This would overspend ' + e.n + ' by ' + money(-(e.bal - P[pick][2])) : money(e.bal - P[pick][2]) + ' will be left in ' + e.n));
      go2.addEventListener('click', () => { e.bal -= P[pick][2]; e.spent += P[pick][2]; check('spend'); tone(e.bal < 0 ? 300 : 600, .07); say(e.bal < 0 ? e.n + ' is over. Cover it from another envelope' : P[pick][1] + ' logged · ' + money(e.bal) + ' left in ' + e.n); render(); }); }

    /* ---- month ---- */
    function renderMonth() { const v = V.month; v.textContent = ''; head(v, 'Spent vs planned', 'This month');
      const left = E.filter(e => e.k !== 'save' && e.k !== 'rent').reduce((a, e) => a + Math.max(0, e.bal), 0), days = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate() + 1;
      const sf = el('div', 'lg-safe'); sf.append(el('b', null, money(Math.floor(left / days))), el('span', null, 'safe to spend per day for the next ' + days + ' days')); v.append(sf);
      E.forEach(e => { const b = el('div', 'lg-bar'), p = el('p'), tr = el('div'), i = el('i', e.bal < 0 ? 'over' : ''); i.style.setProperty('--c', e.c); i.style.width = Math.min(100, (e.budget - e.bal) / e.budget * 100) + '%';
        p.append(document.createTextNode(e.n), el('b', null, money(e.budget - e.bal) + ' / ' + money(e.budget))); tr.append(i); b.append(p, tr); v.append(b); }); }

    nav.querySelector('[data-v="envelopes"]').setAttribute('aria-selected', 'true'); render();
  }
  demo(H.app, H);
  H.boot();
})();
