/* MenuBar Ledger — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "desk";
/* ---------- MenuBar Ledger ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say, desk, extra, win } = H;
    const CAT = { Food: ['#F2994A', 320, ['lunch', 'dinner', 'breakfast', 'coffee', 'pret', 'tesco', 'groceries', 'pizza', 'sushi', 'brunch', 'bakery']], Transport: ['#3E8EF7', 120, ['uber', 'train', 'tfl', 'bus', 'taxi', 'fuel', 'petrol', 'oyster', 'bike']], Bills: ['#6E56CF', 900, ['rent', 'electric', 'gas', 'water', 'internet', 'phone', 'council']], Fun: ['#D6409F', 150, ['cinema', 'drinks', 'pub', 'concert', 'gig', 'bowling', 'museum']], Subs: ['#1A7F64', 60, ['netflix', 'spotify', 'icloud', 'gym', 'figma', 'notion']], Shopping: ['#E5484D', 200, ['shoes', 'amazon', 'ikea', 'book', 'books', 'gift', 'clothes']], Other: ['#8A9AA0', 100, []] };
    const today = new Date(); today.setHours(12, 0, 0, 0); const D = 864e5, M0 = new Date(today.getFullYear(), today.getMonth(), 1);
    const dayOf = n => new Date(Math.max(+M0, +today - n * D)), fd = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    let rows = [[16, 'Landlord', 'Bills', 850], [15, 'Tesco', 'Food', 46.2], [14, 'Netflix', 'Subs', 10.99], [12, 'TfL', 'Transport', 34.5], [11, 'Pret', 'Food', 8.4], [9, 'Picturehouse', 'Fun', 24], [7, 'Spotify', 'Subs', 11.99], [6, 'Uber', 'Transport', 18.7], [4, 'Dishoom', 'Food', 62], [3, 'Waterstones', 'Shopping', 21.99], [2, 'Octopus Energy', 'Bills', 74.1], [1, 'Gail’s Bakery', 'Food', 7.8]].map(([n, m, c, a]) => ({ d: dayOf(Math.min(n, today.getDate() - 1)), m, c, a, split: 0 }));
    let cur = '£', lastNew = null;
    const money = v => cur + v.toFixed(2), spent = c => rows.filter(r => !c || r.c === c).reduce((a, r) => a + r.a, 0);
    /* ---- parser ---- */
    const DOW = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    function parse(t) { const out = { amount: null, merchant: null, date: today, dateTxt: 'today', cat: null, split: 0, note: '' }; let s2 = ' ' + t.trim() + ' ';
      const am = s2.match(/[£$€]?\s?(\d{1,5}(?:[.,]\d{1,2})?)\s?(?:£|gbp|quid|pounds?)?/i); if (am) { out.amount = parseFloat(am[1].replace(',', '.')); s2 = s2.replace(am[0], ' '); }
      const sp = s2.match(/\b(?:split|÷|\/)\s?(\d{1,2})\b|\bwith (\d) (?:friends|people|others)\b/i); if (sp) { out.split = parseInt(sp[1] || (+sp[2] + 1), 10); s2 = s2.replace(sp[0], ' '); }
      const tg = s2.match(/#(\w+)/); if (tg) { const k = Object.keys(CAT).find(c => c.toLowerCase().startsWith(tg[1].toLowerCase())); if (k) out.cat = k; s2 = s2.replace(tg[0], ' '); }
      const lw = s2.toLowerCase(); if (/\byesterday\b/.test(lw)) { out.date = new Date(+today - D); out.dateTxt = 'yesterday'; s2 = s2.replace(/yesterday/i, ' '); } else if (/\btoday\b/.test(lw)) s2 = s2.replace(/today/i, ' ');
      else { const dw = DOW.find(d => new RegExp('\\b(?:on |last )?' + d + '\\b').test(lw)); if (dw) { let n = (today.getDay() - DOW.indexOf(dw) + 7) % 7 || 7; out.date = new Date(+today - n * D); out.dateTxt = 'last ' + dw[0].toUpperCase() + dw.slice(1, 3); s2 = s2.replace(new RegExp('(?:on |last )?' + dw, 'i'), ' '); }
        else { const dm = lw.match(/\b(\d{1,2})(?:st|nd|rd|th)? (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*/); if (dm) { out.date = new Date(today.getFullYear(), MON.indexOf(dm[2]), +dm[1], 12); out.dateTxt = fd(out.date); s2 = s2.replace(new RegExp(dm[0], 'i'), ' '); } } }
      const at = s2.match(/\b(?:at|from|in)\s+([A-Z][\w'’&.-]*(?:\s+[A-Z][\w'’&.-]*)*)/); const words = s2.toLowerCase().split(/\s+/).filter(Boolean);
      if (!out.cat) out.cat = Object.keys(CAT).find(c => CAT[c][2].some(k => words.includes(k))) || null;
      if (at) { out.merchant = at[1]; s2 = s2.replace(at[0], ' '); } else { const cap = s2.match(/\b([A-Z][\w'’&.-]{2,})\b/); if (cap) out.merchant = cap[1]; }
      out.note = s2.replace(/\b(?:at|on|for|from|in)\b/gi, ' ').replace(/\s+/g, ' ').trim(); if (!out.merchant && out.note) out.merchant = out.note.split(' ').slice(0, 2).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
      if (!out.cat && out.merchant) out.cat = Object.keys(CAT).find(c => CAT[c][2].includes(out.merchant.toLowerCase())) || 'Other'; return out; }
    /* ---- ledger window ---- */
    const ttl = win.querySelector('.ttl'); if (ttl) ttl.textContent = 'Ledger · ' + today.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const root = el('div', 'ml'), tbw = el('div', 'ml-tb'), sd = el('aside', 'ml-sd'); root.append(tbw, sd); app.append(root);
    function paintWin() { tbw.textContent = ''; const t = el('table'), hr = el('tr'); [['Date', ''], ['Merchant', ''], ['Category', ''], ['Amount', 'n'], ['Running', 'n']].forEach(([h, c]) => hr.append(el('th', c || null, h))); const th = el('thead'); th.append(hr); t.append(th); const tb = el('tbody'); let run = 0; const sorted = rows.slice().sort((a, b) => a.d - b.d);
      sorted.forEach(r => { run += r.a; const tr = el('tr', r === lastNew ? 'new' : null), cc = el('td'), ct = el('span', 'ml-cat'), ci = el('i'), mt = el('td', null, r.m); ci.style.setProperty('--c', CAT[r.c][0]); ct.append(ci, document.createTextNode(r.c)); cc.append(ct); if (r.split) mt.append(el('span', 'ml-sp', '÷' + r.split)); tr.append(el('td', null, fd(r.d)), mt, cc, el('td', 'n', money(r.a)), el('td', 'n', money(run))); tb.append(tr); }); t.append(tb); tbw.append(t);
      if (lastNew) { const nr = tb.querySelector('.new'); if (nr) tbw.scrollTop = Math.max(0, nr.offsetTop - tbw.clientHeight / 2); }
      sd.textContent = ''; const h3 = el('h3'); h3.append(document.createTextNode('This month'), el('span', null, rows.length + ' entries')); const dn = el('div', 'ml-dn'), sv = svgEl('svg', { viewBox: '0 0 150 150', 'aria-hidden': 'true' }), tot = spent(), C = 2 * Math.PI * 58; let off = 0;
      Object.keys(CAT).forEach(c => { const v = spent(c); if (!v) return; const L = v / tot * C; sv.append(svgEl('circle', { cx: 75, cy: 75, r: 58, fill: 'none', stroke: CAT[c][0], 'stroke-width': 18, 'stroke-dasharray': Math.max(0, L - 1.5).toFixed(1) + ' ' + C.toFixed(1), 'stroke-dashoffset': (-off).toFixed(1) })); off += L; });
      const mid = el('div'); mid.append(el('b', null, money(tot)), el('small', null, 'spent')); dn.append(sv, mid); const lg = el('div', 'ml-lg'); Object.keys(CAT).forEach(c => { const v = spent(c); if (!v) return; const d = el('div'), sp2 = el('span', null, c); sp2.style.setProperty('--c', CAT[c][0]); d.append(sp2, el('b', null, money(v))); lg.append(d); });
      const qb = el('button', 'ml-btn', '⌥Space  Quick entry'), ex = el('button', 'ml-btn gh', '⇩ Export CSV'); qb.type = ex.type = 'button'; qb.addEventListener('click', e => { e.stopPropagation(); openQE(); }); ex.addEventListener('click', exportCSV); sd.append(h3, dn, lg, qb, ex); }
    /* ---- quick entry ---- */
    let qe = null, sugI = -1;
    const EX = ['12.50 lunch at Pret yesterday', '86 dinner at Dishoom split 3', '£4.20 coffee #food', '45 train to Brighton on friday', '9.99 Figma 1st nov #subs'];
    function openQE() { if (qe) { qe.querySelector('input').focus(); return; } closeDD(); if (hint) { hint.remove(); hint = null; } check('quick'); qe = el('div', 'ml-qe'); qe.setAttribute('role', 'dialog'); qe.setAttribute('aria-label', 'Quick expense entry'); const qi = el('div', 'ml-qi'), inp = el('input'), tk = el('div', 'ml-tk'), sg = el('div', 'ml-sg');
      inp.type = 'text'; inp.maxLength = 120; inp.placeholder = 'e.g. 12.50 lunch at Pret yesterday'; inp.setAttribute('aria-label', 'Describe the expense'); inp.autocomplete = 'off'; qi.append(el('span', null, '£'), inp, el('kbd', null, '↵ save · esc')); qe.append(qi, tk, sg); desk.append(qe);
      const paintTk = () => { tk.textContent = ''; const p = parse(inp.value), chip = (lab, val, ok) => { const c = el('span', ok ? 'ok' : 'miss'); c.append(el('small', null, lab), document.createTextNode(val)); tk.append(c); };
        if (!inp.value.trim()) { sg.textContent = ''; EX.forEach((e, i) => { const b = el('button', i === sugI ? 'on' : null); b.type = 'button'; b.append(el('span', null, e), el('em', null, 'try')); b.addEventListener('click', () => { inp.value = e; inp.focus(); paintTk(); }); sg.append(b); }); sg.hidden = false; return; } sg.hidden = true;
        chip('amount', p.amount != null ? money(p.amount) + (p.split ? ' → ' + money(p.amount / p.split) + ' each' : '') : 'missing', p.amount != null); chip('where', p.merchant || '—', !!p.merchant); chip('when', p.dateTxt, true); chip('category', p.cat || '—', !!p.cat); if (p.split) chip('split', p.split + ' ways', true); };
      inp.addEventListener('input', paintTk); inp.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); closeQE(); } else if (e.key === 'Enter') { e.preventDefault(); save(inp.value); } }); paintTk(); setTimeout(() => inp.focus(), 30);
      if (G && !reduced) G.from(qe, { opacity: 0, y: -12, scale: .97, duration: .22, ease: 'power2.out' }); tone(980, .02); }
    function closeQE() { if (!qe) return; qe.remove(); qe = null; }
    function save(text) { const p = parse(text); if (p.amount == null || !(p.amount > 0)) { say('Add an amount, like 12.50'); tone(220, .06, 'square', .03); if (G && !reduced && qe) G.fromTo(qe, { x: -8 }, { x: 0, duration: .4, ease: 'elastic.out(1,.3)' }); return; }
      const r = { d: p.date, m: p.merchant || 'Unknown', c: p.cat || 'Other', a: p.split ? Math.round(p.amount / p.split * 100) / 100 : p.amount, split: p.split }; rows.push(r); lastNew = r; check('parse'); if (p.split >= 2) check('split');
      tone(880, .04); setTimeout(() => tone(1320, .06), 70); haptic(8); say('Logged ' + money(r.a) + ' · ' + r.m + ' · ' + r.c + (p.split ? ' (your share of ' + money(p.amount) + ')' : '')); closeQE(); paintWin(); paintMx(); }
    desk.addEventListener('keydown', e => { if (e.altKey && (e.code === 'Space' || e.key === ' ')) { e.preventDefault(); openQE(); } }); window.addEventListener('keydown', e => { if (e.altKey && e.code === 'Space' && desk.matches(':hover')) { e.preventDefault(); openQE(); } });
    let hint = el('button', 'ml-hint'); hint.type = 'button'; hint.append(document.createTextNode('Press '), el('kbd', null, '⌥'), el('kbd', null, 'Space'), document.createTextNode(' or click here to log an expense')); hint.addEventListener('click', e => { e.stopPropagation(); openQE(); }); desk.append(hint);
    /* ---- menu bar ---- */
    const mx = el('button', 'ml-mx'), mi = el('i'), mt = el('span'); mx.type = 'button'; mx.append(mi, mt); mx.setAttribute('aria-haspopup', 'true'); mx.setAttribute('aria-expanded', 'false'); extra.append(mx); let dd = null;
    const budget = () => Object.values(CAT).reduce((a, c) => a + c[1], 0);
    function paintMx() { const t = spent(), f = t / budget(); mt.textContent = money(t); mi.style.setProperty('--c', f > 1 ? '#F25F5C' : f > .8 ? '#F2A300' : '#1A7F64'); mx.setAttribute('aria-label', 'Spent ' + money(t) + ' of ' + money(budget()) + ' this month'); if (dd) buildDD(); }
    function openDD(auto) { if (dd) { closeDD(); return; } if (!auto) check('budget'); dd = el('div', 'ml-dd'); dd.setAttribute('role', 'dialog'); dd.setAttribute('aria-label', 'Budgets'); const r = mx.getBoundingClientRect(), dr = desk.getBoundingClientRect(), sc = dr.width / 1200; dd.style.left = Math.min(1200 - 334, (r.left - dr.left) / sc - 140) + 'px'; desk.append(dd); mx.setAttribute('aria-expanded', 'true'); buildDD(); if (G && !reduced) G.from(dd, { opacity: 0, y: -6, duration: .2 }); }
    function closeDD() { if (!dd) return; dd.remove(); dd = null; mx.setAttribute('aria-expanded', 'false'); }
    function buildDD() { dd.textContent = ''; const hd = el('header'), left = today.getDate(), dim = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(); hd.append(el('b', null, money(spent())), el('span', null, 'of ' + money(budget()) + ' budget · ' + (dim - left) + ' days left')); dd.append(hd);
      const rg = el('div', 'ml-rg'); ['Food', 'Transport', 'Fun', 'Shopping', 'Subs', 'Bills'].forEach(c => { const v = spent(c), f = v / CAT[c][1], b = el('button'), sv = svgEl('svg', { viewBox: '0 0 66 66', 'aria-hidden': 'true' }), Cc = 2 * Math.PI * 26; b.type = 'button'; sv.append(svgEl('circle', { cx: 33, cy: 33, r: 26, fill: 'none', stroke: 'rgba(0,0,0,.07)', 'stroke-width': 7 }), svgEl('circle', { cx: 33, cy: 33, r: 26, fill: 'none', stroke: f > 1 ? '#F25F5C' : CAT[c][0], 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-dasharray': (Math.min(1, f) * Cc).toFixed(1) + ' ' + Cc.toFixed(1) }));
        b.append(sv, el('b', null, c), el('small', f > 1 ? 'ov' : null, money(v) + ' / ' + CAT[c][1])); b.setAttribute('aria-label', c + ': ' + money(v) + ' of ' + money(CAT[c][1])); b.addEventListener('click', () => say(c + ': ' + (f > 1 ? 'over by ' + money(v - CAT[c][1]) : money(CAT[c][1] - v) + ' left, about ' + money((CAT[c][1] - v) / Math.max(1, dim - left)) + ' a day'))); rg.append(b); }); dd.append(rg);
      const rc = el('div', 'ml-rc'); rows.slice(-3).reverse().forEach(r => { const d = el('div'); d.append(el('span', null, r.m + ' · ' + fd(r.d)), el('span', null, money(r.a))); rc.append(d); }); const qb = el('button', 'ml-btn', 'Quick entry  ⌥Space'); qb.type = 'button'; qb.addEventListener('click', e => { e.stopPropagation(); openQE(); }); dd.append(rc, qb); }
    mx.addEventListener('click', e => { e.stopPropagation(); openDD(); }); desk.addEventListener('click', e => { const p = e.composedPath();  if (qe && !p.includes(qe)) closeQE(); });
    /* ---- CSV export (formula-injection safe) ---- */
    function cell(v) { let s2 = String(v); if (/^[=+\-@\t\r]/.test(s2)) s2 = "'" + s2; return /[",\n]/.test(s2) ? '"' + s2.replace(/"/g, '""') + '"' : s2; }
    function exportCSV() { const lines = [['Date', 'Merchant', 'Category', 'Amount', 'Split']].concat(rows.slice().sort((a, b) => a.d - b.d).map(r => [r.d.toISOString().slice(0, 10), r.m, r.c, r.a.toFixed(2), r.split || ''])); const csv = lines.map(l => l.map(cell).join(',')).join('\r\n');
      try { const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })), a = document.createElement('a'); a.href = url; a.download = 'ledger-' + today.toISOString().slice(0, 7) + '.csv'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (e) {}
      check('export'); tone(700, .04); say('Exported ' + rows.length + ' rows · formulas escaped for Excel'); }
    H.jump = (k, fs) => { if (fs) return; if (k === 'quick') openQE(); else if (k === 'budget') { closeQE(); if (!dd) openDD(); } else if (k === 'export') exportCSV(); };
    paintWin(); paintMx();
    setTimeout(() => { if (!dd) openDD(true); }, 900);
  }
  demo(H.app, H);
  H.boot();
})();
