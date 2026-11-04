/* SpeedTrim WP — wp-admin performance plugin simulator (Bazozo Studio).
   Scores are modelled, not measured. All DOM is built with createElement + textContent. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const wait = ms => new Promise(r => setTimeout(r, reduced ? 30 : ms));
  $('#year').textContent = new Date().getFullYear();

  /* ---------- scale ---------- */
  const wrap = $('#stageWrap');
  function fit() { wrap.style.setProperty('--s', Math.max(.5, Math.min(1, wrap.clientWidth / 1200)).toFixed(4)); }
  window.addEventListener('resize', fit); fit();

  /* ---------- checklist ---------- */
  const done = new Set();
  function check(k) { if (done.has(k)) return; done.add(k); const c = $(`#tryList [data-t="${k}"]`); if (c) { c.classList.add('done'); if (G) G.fromTo(c, { scale: .9 }, { scale: 1, duration: .45, ease: 'back.out(3)' }); } $('#tryCount').textContent = `${done.size}/5`; }

  /* ---------- model ---------- */
  const OPTS = [
    { k: 'minCss', g: 'assets', name: 'Minify CSS', desc: 'Strip whitespace and comments from 3 stylesheets', pts: 6, lcp: .2, inp: 0, cls: .03, kb: 120, req: 0 },
    { k: 'minJs', g: 'assets', name: 'Minify JavaScript', desc: 'Compress 5 scripts, keep source maps for debugging', pts: 7, lcp: .2, inp: 80, cls: 0, kb: 210, req: 0 },
    { k: 'defer', g: 'assets', name: 'Defer non-critical JavaScript', desc: 'Analytics, chat and cart fragments load after first paint', pts: 9, lcp: .5, inp: 150, cls: 0, kb: 0, req: -6 },
    { k: 'unused', g: 'assets', name: 'Remove unused CSS', desc: 'Inline critical CSS per page; load the rest later', pts: 5, lcp: .3, inp: 30, cls: .04, kb: 260, req: 0 },
    { k: 'lazy', g: 'images', name: 'Lazy load images', desc: 'Below-the-fold images wait until the shopper scrolls', pts: 8, lcp: .6, inp: 0, cls: .1, kb: 1100, req: -14 },
    { k: 'webp', g: 'images', name: 'Serve WebP images', desc: 'Convert 248 product images in the background', pts: 7, lcp: .8, inp: 0, cls: 0, kb: 900, req: 0 },
    { k: 'preload', g: 'images', name: 'Preload the hero image', desc: 'Fetch the largest image first so it paints sooner', pts: 6, lcp: .9, inp: 0, cls: .05, kb: 0, req: 0 },
    { k: 'checkout', g: 'checkout', name: 'Streamline checkout', desc: 'Hide optional fields and drop checkout bloat scripts', pts: 3, lcp: .2, inp: 30, cls: 0, kb: 90, req: -2 }
  ];
  const on = Object.fromEntries(OPTS.map(o => [o.k, false]));
  const BASE = { score: 48, lcp: 4.8, inp: 380, cls: .24, kb: 3891, req: 71 };
  const FIELDS = [
    { k: 'name', label: 'First and last name', req: true },
    { k: 'company', label: 'Company name (optional)', opt: true },
    { k: 'addr', label: 'Street address', req: true },
    { k: 'addr2', label: 'Apartment, suite, unit (optional)', opt: true },
    { k: 'city', label: 'Town / City · PIN code', req: true },
    { k: 'phone', label: 'Phone (optional)', opt: true },
    { k: 'email', label: 'Email address', req: true },
    { k: 'notes', label: 'Order notes (optional)', opt: true, tall: true }
  ];
  const showField = Object.fromEntries(FIELDS.map(f => [f.k, true]));

  /* ---------- toggle rows ---------- */
  const rows = {};
  function makeRow(o) {
    const r = el('div', 'opt'), t = el('div'); t.append(el('b', null, o.name), el('span', null, o.desc));
    const tg = el('button', 'tg'); tg.type = 'button'; tg.setAttribute('role', 'switch'); tg.setAttribute('aria-checked', 'false'); tg.setAttribute('aria-label', o.name);
    tg.addEventListener('click', () => setOpt(o.k, !on[o.k]));
    r.append(t, el('span', 'imp', `+${o.pts}`), tg);
    (rows[o.k] = rows[o.k] || []).push(r); return r;
  }
  OPTS.forEach(o => { $('#optsAll').append(makeRow(o)); $({ assets: '#optsAssets', images: '#optsImages', checkout: '#optsCheckout' }[o.g]).append(makeRow(o)); });

  function setOpt(k, v, quiet) {
    if (on[k] === v) return; on[k] = v;
    if (k === 'checkout') { ['company', 'addr2', 'notes'].forEach(f => { showField[f] = !v; }); renderFields(true); }
    sync(k);
    if (!quiet) notice(`Settings saved. <b>${OPTS.find(o => o.k === k).name}</b> ${v ? 'enabled' : 'disabled'}.`);
    if (v && (k === 'minCss' || k === 'minJs')) check('asset');
    if (v && k === 'lazy') check('lazy');
  }
  function sync(k) {
    (rows[k] || []).forEach(r => {
      r.classList.toggle('on', on[k]); r.querySelector('.tg').setAttribute('aria-checked', String(on[k]));
      if (G && on[k]) G.fromTo(r, { backgroundColor: 'rgba(0,163,42,.12)' }, { backgroundColor: 'rgba(0,163,42,0)', duration: .8, clearProps: 'backgroundColor' });
    });
    recompute();
  }

  /* ---------- notices (built from fixed strings; <b> is created as a node) ---------- */
  function notice(msg, info) {
    const box = $('#notices'); box.replaceChildren();
    const n = el('div', 'notice' + (info ? ' info' : '')), p = el('p');
    msg.split(/(<b>.*?<\/b>)/).forEach(part => { const m = part.match(/^<b>(.*)<\/b>$/); p.append(m ? el('b', null, m[1]) : document.createTextNode(part)); });
    const x = el('button', 'dis', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Dismiss this notice'); x.addEventListener('click', () => n.remove());
    n.append(p, x); box.append(n);
    if (G) G.from(n, { y: -8, opacity: 0, duration: .3, ease: 'power2.out' });
  }

  /* ---------- scores ---------- */
  const C = 2 * Math.PI * 52;
  let shown = BASE.score, first = true;
  const colorFor = s => s >= 90 ? '#00A32A' : s >= 50 ? '#DBA617' : '#D63638';
  const rate = (v, good, ok) => v <= good ? '#00A32A' : v <= ok ? '#DBA617' : '#D63638';
  function metrics() {
    const sum = f => OPTS.reduce((a, o) => a + (on[o.k] ? o[f] : 0), 0);
    return { score: BASE.score + sum('pts'), lcp: Math.max(1.1, BASE.lcp - sum('lcp')), inp: Math.max(90, BASE.inp - sum('inp')), cls: Math.max(.02, BASE.cls - sum('cls')), kb: BASE.kb - sum('kb'), req: BASE.req + sum('req') };
  }
  function recompute(force) {
    const m = metrics();
    animateScore(m.score, force);
    const set = (id, txt, col, bar, frac) => { const b = $(id); b.textContent = txt; b.style.color = col; const i = $(bar); i.style.background = col; if (G) G.to(i, { width: Math.min(100, frac * 100) + '%', duration: .6, ease: 'power3.out' }); else i.style.width = Math.min(100, frac * 100) + '%'; };
    set('#mLcp', m.lcp.toFixed(1) + 's', rate(m.lcp, 2.5, 4), '#bLcp', m.lcp / 6);
    set('#mInp', Math.round(m.inp) + 'ms', rate(m.inp, 200, 500), '#bInp', m.inp / 500);
    set('#mCls', m.cls.toFixed(2), rate(m.cls, .1, .25), '#bCls', m.cls / .3);
    set('#mKb', (m.kb / 1024).toFixed(1) + ' MB', rate(m.kb, 1600, 3000), '#bKb', m.kb / BASE.kb);
    $('#mReq').textContent = `${m.req} requests`;
    const n = OPTS.filter(o => on[o.k]).length; $('#onCount').textContent = `${n} of 8 on`;
    film(m.lcp); assets(); images(); conv();
    if (m.score >= 90) check('green');
  }
  function animateScore(target, force) {
    const arc = $('#arc'), num = $('#score'), from = force ? 0 : shown;
    const paint = v => { const s = Math.round(v), c = colorFor(s); num.textContent = s; num.style.color = c; arc.style.stroke = c; arc.style.strokeDashoffset = C * (1 - v / 100); $('#abScore').textContent = s; const ab = $('#abPerf'); ab.style.color = c; ab.style.background = c + '22'; };
    if (G && !first) { const o = { v: from }; G.to(o, { v: target, duration: force ? 1.4 : .8, ease: 'power3.out', onUpdate: () => paint(o.v) }); } else paint(target);
    first = false; shown = target;
    const lbl = $('#scoreLbl'), c = colorFor(target); lbl.textContent = target >= 90 ? 'Good' : target >= 50 ? 'Needs improvement' : 'Poor'; lbl.style.color = c; lbl.style.background = c + '1A';
    $('#delta').textContent = target === BASE.score ? 'Flip a switch to start trimming.' : target >= 99 ? `+${target - BASE.score} points. Top marks. ☕` : `+${target - BASE.score} points since you started`;
  }
  function film(lcp) {
    const f = $('#film'); f.replaceChildren(); let marked = false;
    for (let i = 1; i <= 6; i++) {
      const t = i * .5, fr = el('div', 'fr'), sc = el('div', 'sc');
      if (t >= lcp) sc.classList.add('lo'); else if (t >= lcp * .45) sc.classList.add('part');
      ['h', 'im', 't', 't2'].forEach(c => sc.append(el('i', c)));
      let lab = t.toFixed(1) + 's';
      if (t >= lcp && !marked) { marked = true; fr.classList.add('lcp'); lab += ' · LCP'; }
      fr.append(sc, document.createTextNode(lab)); f.append(fr);
    }
    if (!marked) f.lastChild.lastChild.textContent = `3.0s · LCP at ${lcp.toFixed(1)}s`;
  }

  /* ---------- assets tab ---------- */
  const FILES = [
    { f: 'theme/style.css', t: 'CSS', o: 182, crit: true }, { f: 'woocommerce.css', t: 'CSS', o: 96, crit: true }, { f: 'block-library.css', t: 'CSS', o: 88, crit: true },
    { f: 'jquery.min.js', t: 'JS', o: 87, def: true }, { f: 'cart-fragments.js', t: 'JS', o: 42, def: true }, { f: 'theme.js', t: 'JS', o: 64 }, { f: 'analytics.js', t: 'JS', o: 52, def: true }, { f: 'chat-widget.js', t: 'JS', o: 118, def: true }
  ];
  function assets() {
    const b = $('#assetBody'); b.replaceChildren(); let tot = 0, orig = 0;
    FILES.forEach(x => {
      let now = x.o; const tags = [];
      if (x.t === 'CSS') { if (on.minCss) { now *= .78; tags.push(['minified', 'g']); } if (on.unused && x.crit) { now *= .55; tags.push(['critical only', 'g']); } }
      else { if (on.minJs) { now *= .62; tags.push(['minified', 'g']); } if (on.defer && x.def) tags.push(['deferred', 'b']); }
      if (!tags.length) tags.push(['render-blocking', 'r']);
      tot += now; orig += x.o;
      const tr = el('tr'), st = el('td'); tags.forEach(([t, c]) => { st.append(el('span', 'pill ' + c, t), document.createTextNode(' ')); });
      tr.append(el('td', 'm', x.f), el('td', null, x.t), el('td', 'm', x.o + ' KB'), el('td', 'm' + (now < x.o ? ' sv' : ''), Math.round(now) + ' KB'), st); b.append(tr);
    });
    $('#awKb').textContent = Math.round(tot) + ' KB'; $('#awSave').textContent = tot < orig ? `−${Math.round((1 - tot / orig) * 100)}%` : 'nothing trimmed yet';
    $('#awBar').style.width = tot / orig * 100 + '%';
  }

  /* ---------- images tab ---------- */
  const IMGS = [['hero-banner.jpg', 820, '#7C4A26,#C2853B'], ['beans-ethiopia.jpg', 410, '#3F2A1D,#8B5E3C'], ['pour-over-kit.jpg', 380, '#C9A27E,#6B4A31'], ['grinder-burr.jpg', 360, '#444,#9A9A9A'], ['mug-ember.jpg', 290, '#B45309,#F59E0B'], ['cold-brew.jpg', 330, '#1E1B18,#6B4F3A'], ['gift-box.jpg', 300, '#7F1D1D,#DC2626'], ['barista-team.jpg', 450, '#57534E,#D6D3D1']];
  function images() {
    const g = $('#imgs'); g.replaceChildren();
    IMGS.forEach(([n, kb, grad], i) => {
      const it = el('div', 'im'), ph = el('div', 'ph2' + (on.lazy && i >= 3 ? ' lazy' : '')); ph.style.background = `linear-gradient(135deg,${grad})`;
      if (i === 0 && on.preload) ph.append(el('span', 'tag p', 'preload'));
      else ph.append(el('span', 'tag', on.webp ? 'WebP' : 'JPG'));
      const cap = el('div', 'cap'), now = on.webp ? Math.round(kb * .36) : kb;
      cap.append(el('b', null, on.webp ? n.replace('.jpg', '.webp') : n), el('span', on.webp ? 's' : null, now + ' KB'));
      it.append(ph, cap); g.append(it);
    });
  }

  /* ---------- checkout tab ---------- */
  const fieldEls = {};
  FIELDS.forEach(f => {
    const w = el('div', 'f' + (f.tall ? ' tall' : '')); w.append(el('label', null, f.label), el('i')); fieldEls[f.k] = w; $('#coForm').append(w);
    if (!f.opt) return;
    const r = el('div', 'opt'), t = el('div'); t.append(el('b', null, f.label.replace(' (optional)', '')), el('span', null, 'Optional field'));
    const tg = el('button', 'tg'); tg.type = 'button'; tg.setAttribute('role', 'switch'); tg.setAttribute('aria-checked', 'true'); tg.setAttribute('aria-label', `Show ${f.label}`); f.tg = tg;
    tg.addEventListener('click', () => {
      showField[f.k] = !showField[f.k]; renderFields(true); check('checkout');
      const hidden = FIELDS.filter(x => x.opt && !showField[x.k]).length, want = hidden >= 2;
      if (want !== on.checkout) { on.checkout = want; sync('checkout'); } else recompute();
      notice(`Settings saved. <b>${f.label.replace(' (optional)', '')}</b> is now ${showField[f.k] ? 'shown' : 'hidden'} at checkout.`);
    });
    r.append(t, el('span', 'imp', showField[f.k] ? 'shown' : 'hidden'), tg); $('#fieldOpts').append(r); f.row = r;
  });
  function renderFields(anim) {
    FIELDS.forEach(f => {
      const w = fieldEls[f.k], show = showField[f.k];
      if (f.tg) { f.tg.setAttribute('aria-checked', String(show)); f.row.querySelector('.imp').textContent = show ? 'shown' : 'hidden'; }
      if (show && w.hidden) { w.hidden = false; if (G && anim) G.fromTo(w, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .4, ease: 'power2.out', clearProps: 'height,opacity' }); }
      else if (!show && !w.hidden) { if (G && anim) G.to(w, { height: 0, opacity: 0, marginBottom: 0, duration: .35, ease: 'power2.in', onComplete: () => { w.hidden = true; G.set(w, { clearProps: 'all' }); } }); else w.hidden = true; }
    });
  }
  function conv() {
    const hidden = FIELDS.filter(x => x.opt && !showField[x.k]).length, rate2 = 61 + hidden * 2.5 + (on.checkout ? 3 : 0);
    const c = $('#conv'); c.replaceChildren(document.createTextNode(`${FIELDS.length - hidden} fields · estimated checkout completion `), el('b', null, `${rate2.toFixed(1)}%`), document.createTextNode(hidden ? ` (was 61%)` : ''));
  }

  /* ---------- tabs ---------- */
  function setTab(t) {
    $$('.navtabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
    $$('#sub button').forEach(b => { if (b.dataset.tab === t) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    $$('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== t; });
    const pane = $(`[data-pane="${t}"]`); if (G) G.from(pane.children, { y: 10, opacity: 0, duration: .35, stagger: .06, ease: 'power2.out', clearProps: 'transform,opacity' });
    if (t !== 'overview') check('tabs');
  }
  $$('.navtabs button, #sub button').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));

  /* ---------- speed test + one click ---------- */
  let busy = false;
  $('#testBtn').addEventListener('click', async () => {
    if (busy) return; busy = true; $('#testBtn').disabled = true;
    const sc = $('#scan'); sc.hidden = false; if (G) G.from('.scan .bx', { y: 16, opacity: 0, duration: .3 });
    const steps = ['Loading the shop homepage', 'Measuring largest paint', 'Checking render-blocking files', 'Measuring interaction delay', 'Scoring'];
    for (let i = 0; i < steps.length; i++) { $('#scanStep').textContent = steps[i] + '…'; if (G) G.to('#scanBar', { width: (i + 1) / steps.length * 100 + '%', duration: .4 }); else $('#scanBar').style.width = (i + 1) * 20 + '%'; await wait(480); }
    sc.hidden = true; if (G) G.set('#scanBar', { width: 0 });
    setTab('overview'); recompute(true);
    notice(`Speed test finished. Mobile score <b>${metrics().score}</b>.`, true);
    $('#testBtn').disabled = false; busy = false;
  });
  $('#oneClick').addEventListener('click', async () => {
    if (busy) return; busy = true; const b = $('#oneClick'); b.disabled = true;
    setTab('overview');
    for (const o of OPTS) { if (!on[o.k]) { setOpt(o.k, true, true); notice(`Enabling <b>${o.name}</b>…`, true); await wait(340); } }
    notice(`All 8 optimisations are on. Mobile score <b>${metrics().score}</b>. Your shoppers will feel it.`);
    if (G) G.fromTo('.gauge .g', { scale: .9 }, { scale: 1, duration: .8, ease: 'elastic.out(1,.4)' });
    b.disabled = false; busy = false;
  });

  /* ---------- boot ---------- */
  recompute();
  notice('SpeedTrim found <b>8 quick wins</b> on your store. Start with the switches below or press One-click optimise.', true);
  if (G) {
    G.from('.intro > *', { y: 24, opacity: 0, duration: .8, stagger: .1, ease: 'expo.out' });
    G.from('#stage', { y: 40, opacity: 0, duration: .8, ease: 'expo.out', delay: .2 });
  }
})();
