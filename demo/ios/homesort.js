/* HomeSort — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "triptych";
/* ---------- HomeSort ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const M = {"key":"hs_state_v1","rooms":[["living","Living room","#3F6FD8",[0,0,3,2]],["kitchen","Kitchen","#E8A33D",[3,0,2,2]],["bed","Bedroom","#8E6CC9",[0,2,2,2]],["office","Office","#2E9E7A",[2,2,2,2]],["bath","Bathroom","#4BB4D8",[4,2,1,2]]],"items":[["living","📺","OLED TV 55\"",1299,9],["living","🛋","Corner sofa",1850,52],["living","🔊","Soundbar",349,1],["kitchen","☕","Espresso machine",549,14],["kitchen","🧊","Fridge freezer",899,30],["bed","🛏","Mattress",760,98],["office","💻","Laptop",1899,4],["office","🖥","Monitor 27\"",429,20],["office","🪑","Desk chair",389,40],["bath","🪒","Electric toothbrush",119,7]],"scan":["kitchen","🍞","Toaster",79,24,"5 012345 678900"]};
    const items = M.items.map(([r, ic, n, v, wm], i) => ({ id: i, r, ic, n, v, wm, fresh: false })); let room = null, scanned = false;
    const R = Object.fromEntries(M.rooms.map(([k, n, c, rect]) => [k, { k, n, c, rect }])), money = v => '£' + v.toLocaleString();
    const root = el('div', 'hs'), V = {}; ['plan', 'warranty', 'report'].forEach(k => { V[k] = el('section', 'hs-v'); V[k].setAttribute('aria-label', k); if (k !== 'plan') V[k].hidden = true; root.append(V[k]); });
    const tab = el('nav', 'hs-tab'); [['plan', '🏠', 'Home'], ['warranty', '🛡', 'Warranties'], ['report', '📄', 'Insurance']].forEach(([k, ic, t]) => { const b = el('button'); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.append(el('span', null, ic), document.createTextNode(t)); b.addEventListener('click', () => go(k)); tab.append(b); });
    root.append(tab); app.append(root); let cur = 'plan';
    function go(k) { if (k === cur) { if (k === 'plan') { room = null; render(); } return; } const a = V[cur], ak = cur; V[k].hidden = false; cur = k; tab.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k))); render(); if (k === 'warranty') check('warranty');
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .3, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .1, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; haptic(4); }
    H.jump = k => { if (k === 'plan') { room = null; } go(k); if (k === 'plan') render(); };
    const head = (v, small, title) => { const h = el('div', 'hs-h'); h.append(el('small', null, small), el('h2', null, title)); v.append(h); };
    const wCol = mo => mo <= 3 ? '#E5484D' : mo <= 12 ? '#E8A33D' : '#2E9E7A';

    /* ---- isometric plan ---- */
    function iso(x, y, z) { const s0 = 30; return [170 + (x - y) * s0 * .866, 40 + (x + y) * s0 * .5 - z]; }
    function plan() { const sv = svgEl('svg', { viewBox: '0 0 340 230', role: 'group', 'aria-label': 'Floor plan, choose a room' });
      M.rooms.forEach(([k, n, c, [x, y, w, h]]) => { const g = svgEl('g', { class: 'rm' + (room === k ? ' on' : ''), tabindex: '0', role: 'button', 'aria-label': n + ', ' + items.filter(i => i.r === k).length + ' item' + (items.filter(i => i.r === k).length === 1 ? '' : 's') }), wallH = 16;
        const P = (a, b, z) => iso(a, b, z).map(v => v.toFixed(1)).join(','), top = [P(x, y, wallH), P(x + w, y, wallH), P(x + w, y + h, wallH), P(x, y + h, wallH)].join(' ');
        g.append(svgEl('polygon', { points: [P(x, y + h, 0), P(x + w, y + h, 0), P(x + w, y + h, wallH), P(x, y + h, wallH)].join(' '), fill: c, opacity: .55 }), svgEl('polygon', { points: [P(x + w, y, 0), P(x + w, y + h, 0), P(x + w, y + h, wallH), P(x + w, y, wallH)].join(' '), fill: c, opacity: .75 }), svgEl('polygon', { points: top, fill: c, class: 'top', stroke: 'rgba(255,255,255,.6)', 'stroke-width': 1 }));
        const [cx, cy] = iso(x + w / 2, y + h / 2, wallH); const t = svgEl('text', { x: cx, y: cy, 'text-anchor': 'middle' }); t.textContent = n; const t2 = svgEl('text', { x: cx, y: cy + 12, 'text-anchor': 'middle', class: 'n' }); const nI = items.filter(i => i.r === k).length; t2.textContent = nI + (nI === 1 ? ' item' : ' items'); g.append(t, t2);
        const open = () => { room = k; check('room'); tone(560, .05); render(); }; g.addEventListener('click', open); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }); sv.append(g); });
      return sv; }
    function itemRow(it) { const r = el('div', 'hs-it' + (it.fresh ? ' new' : '')), mid = el('div'), wb = el('div', 'wb'), wi = el('i'); wi.style.setProperty('--c', wCol(it.wm)); wi.style.width = Math.min(100, it.wm / 36 * 100) + '%'; wb.append(wi);
      mid.append(el('b', null, it.n), el('small', null, it.wm <= 0 ? 'warranty ended' : 'warranty ' + it.wm + ' mo left · ' + R[it.r].n), wb); r.append(el('span', null, it.ic), mid, el('em', null, money(it.v))); return r; }
    function render() {
      const total = items.reduce((a, i) => a + i.v, 0);
      const v = V.plan; v.textContent = '';
      if (!room) { head(v, M.rooms.length + ' rooms · ' + items.length + ' things', 'My home'); const t = el('div', 'hs-tot'), l = el('div'); l.append(el('small', null, 'Total insured value'), document.createElement('br'), el('b', null, money(total))); t.append(l, el('span', null, '›')); t.tabIndex = 0; t.setAttribute('role', 'button'); const tv = () => { check('value'); go('report'); }; t.addEventListener('click', tv); t.addEventListener('keydown', e => { if (e.key === 'Enter') tv(); });
        const pl = el('div', 'hs-plan'); pl.append(plan()); v.append(t, pl); if (G && !reduced) G.from(pl.querySelectorAll('g.rm'), { y: 30, opacity: 0, duration: .5, stagger: .06, ease: 'back.out(1.6)' }); }
      else { const rm = R[room], back = el('button', 'hs-back', '‹ Floor plan'); back.type = 'button'; back.addEventListener('click', () => { room = null; render(); }); v.append(back); const list = items.filter(i => i.r === room); head(v, list.length + ' items · ' + money(list.reduce((a, i) => a + i.v, 0)), rm.n);
        list.forEach(it => v.append(itemRow(it)));
        const sc = el('div', 'hs-scan'), bc = el('div', 'hs-bc'), laser = el('i', 'hs-laser'); [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 3, 2, 1, 1, 2, 3].forEach(w => { const b = el('i'); b.style.setProperty('--w', w * 2 + 'px'); bc.append(b); }); sc.append(bc, el('small', null, M.scan[5]), laser); sc.setAttribute('role', 'img'); sc.setAttribute('aria-label', 'Camera pointed at a barcode');
        const btn = el('button', 'hs-btn', scanned ? 'Scan another' : '▢ Scan a barcode to add'); btn.type = 'button'; v.append(sc, btn);
        btn.addEventListener('click', () => { btn.disabled = true; btn.textContent = 'Scanning…'; if (G && !reduced) G.fromTo(laser, { opacity: 1, top: '30%' }, { top: '70%', duration: .35, yoyo: true, repeat: 3 });
          setTimeout(() => { laser.style.opacity = 0; if (!scanned) { const [r, ic, n, val, wm] = M.scan; items.push({ id: 99, r: room, ic, n, v: val, wm, fresh: true }); scanned = true; } check('add'); tone(1500, .05, 'square', .03); haptic(15); say('Found it: ' + M.scan[2] + ' · 2-year warranty added'); render(); }, 1500); }); }
      /* warranty timeline */
      const w = V.warranty; w.textContent = ''; head(w, 'Soonest first', 'Warranties'); const tl = el('div', 'hs-tl');
      [...items].sort((a, b) => a.wm - b.wm).forEach(it => { const e = el('div', 'hs-te' + (it.wm <= 3 ? ' soon' : '')), when = new Date(); when.setMonth(when.getMonth() + it.wm); e.style.setProperty('--c', wCol(it.wm)); e.append(el('b', null, it.ic + ' ' + it.n), el('small', null, (it.wm <= 3 ? 'ends in ' + it.wm + ' month' + (it.wm === 1 ? '' : 's') + ' · ' : '') + when.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) + ' · ' + R[it.r].n)); tl.append(e); }); w.append(tl);
      /* report */
      const rp = V.report; rp.textContent = ''; head(rp, 'For your insurer', 'Insurance'); const box = el('div', 'hs-rep'), tb = el('table'); box.append(el('b', null, 'Contents by room'));
      M.rooms.forEach(([k, n]) => { const tr = el('tr'); tr.append(el('td', null, n), el('td', null, money(items.filter(i => i.r === k).reduce((a, i) => a + i.v, 0)))); tb.append(tr); }); const tt = el('tr', 't'); tt.append(el('td', null, 'Total'), el('td', null, money(total))); tb.append(tt); box.append(tb);
      const mk = el('button', 'hs-btn', 'Build claim report (PDF)'); mk.type = 'button'; mk.addEventListener('click', () => { const pdf = el('div', 'hs-pdf'), tx = el('div'); tx.append(el('b', null, 'HomeSort_Inventory.pdf'), document.createElement('br'), document.createTextNode(items.length + ' items · photos and receipts · ' + money(total))); pdf.append(el('i', null, 'PDF'), tx); rp.append(pdf); mk.disabled = true; check('report'); tone(880, .08); say('Report ready to send to your insurer'); }); rp.append(box, mk);
    }
    tab.querySelector('[data-v="plan"]').setAttribute('aria-selected', 'true'); render();
  }
  demo(H.app, H);
  H.boot();
})();
