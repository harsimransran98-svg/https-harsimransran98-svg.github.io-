/* NetGauge — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- NetGauge ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say, desk, extra, win, tools } = H;
    const APPS = [['Zoom', '#2D8CFF', 2600, 1900, 'call', [['zoom.us', 'US · SFO', 'UDP 8801'], ['zoomgov.com', 'US · IAD', 'TLS 443']], 0], ['Safari', '#4CC2FF', 900, 90, 'burst', [['github.com', 'US · IAD', 'TLS 443'], ['cdn.jsdelivr.net', 'EU · AMS', 'TLS 443'], ['fonts.gstatic.com', 'EU · LHR', 'TLS 443']], 0], ['Spotify', '#1ED760', 380, 12, 'chunk', [['audio-fa.scdn.co', 'EU · FRA', 'TLS 443']], 0],
      ['Dropbox', '#7B61FF', 120, 1400, 'sync', [['content.dropboxapi.com', 'US · ORD', 'TLS 443']], 1], ['iCloud Photos', '#B9C3D6', 60, 900, 'sync', [['p43-content.icloud.com', 'EU · AMS', 'TLS 443']], 1], ['Mail', '#5AC8FA', 40, 10, 'poll', [['imap.fastmail.com', 'AU · SYD', 'IMAPS 993']], 0], ['Slack', '#E01E5A', 60, 20, 'poll', [['wss-primary.slack.com', 'US · IAD', 'WSS 443']], 0], ['App Store', '#FF6B35', 0, 0, 'idle', [['osxapps.itunes.apple.com', 'EU · LHR', 'TLS 443']], 1]]
      .map(([n, c, dn, up, pat, hosts, bg]) => ({ n, c, dn, up, pat, hosts, bg, h: [], rd: 0, ru: 0, tot: 0, blocked: false, dl: 0 }));
    const N = 120; APPS.forEach(a => { for (let i = 0; i < N; i++) a.h.push([0, 0]); });
    let t = 0, sel = null, net = 'wifi', lowData = false, hotUsed = 0, CAP = 2048, warned = false;
    const fmt = k => k >= 1000 ? (k / 1000).toFixed(k >= 10000 ? 0 : 1) + ' MB/s' : Math.round(k) + ' KB/s', fmtB = mb => mb >= 1024 ? (mb / 1024).toFixed(2) + ' GB' : mb.toFixed(mb >= 10 ? 0 : 1) + ' MB';
    /* ---- window ---- */
    const ttl = win.querySelector('.ttl'); if (ttl) ttl.textContent = 'NetGauge — Wi-Fi';
    const root = el('div', 'ng'), ch = el('div', 'ng-ch'), cv = el('canvas'), chl = el('div', 'ng-chl'), ls = el('div', 'ng-ls'), dt = el('aside', 'ng-dt'); cv.width = 2176; cv.height = 420; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Live network traffic per app, download above the line and upload below');
    const ax = [['t', ''], ['m', '0'], ['btm', '']].map(([k, v]) => { const a = el('span', 'ng-ax ' + k, v); ch.append(a); return a; }); ch.prepend(cv); ch.append(chl); root.append(ch, ls, dt); app.append(root);
    const tb = el('div', 'ng-tb'), dlb = el('button', null, '⬇ Update Xcode (3.1 GB)'), hsb = el('button', null, '📱 Use iPhone hotspot'); dlb.type = hsb.type = 'button'; hsb.setAttribute('aria-pressed', 'false'); tb.append(dlb, hsb); tools.append(tb);
    const cx = cv.getContext('2d'); cx.scale(2, 2);
    const tbl = el('table'), thd = el('thead'), thr = el('tr'); [['App', ''], ['Download', 'n'], ['Upload', 'n'], ['Last 30 s', ''], ['Session', 'n']].forEach(([h, c]) => thr.append(el('th', c || null, h))); thd.append(thr); const tbd = el('tbody'); tbl.append(thd, tbd); ls.append(tbl);
    const rowsEl = new Map(); APPS.forEach(a => { const tr = el('tr'), n = el('td'), ci = el('i'), d = el('td', 'n'), u = el('td', 'n'), sc = el('td'), spc = el('canvas'), to = el('td', 'n'); spc.width = 240; spc.height = 44; ci.style.setProperty('--c', a.c); n.append(ci, document.createTextNode(a.n)); sc.append(spc); tr.append(n, d, u, sc, to); tr.tabIndex = 0; tr.setAttribute('aria-selected', 'false');
      const pick = () => { sel = a; check('app'); paintDetail(); tone(620, .02); }; tr.addEventListener('click', pick); tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } }); rowsEl.set(a, { tr, d, u, to, sp: spc.getContext('2d') }); tbd.append(tr); });
    /* ---- traffic model ---- */
    function rate(a) { if (a.blocked) return [0, 0]; if ((net === 'hot' && lowData) && a.bg) return [0, 0]; const k = t * .25, nz = () => .8 + Math.random() * .4; let d = 0, u = 0;
      switch (a.pat) { case 'call': d = a.dn * nz(); u = a.up * nz(); break; case 'burst': { const ph = Math.sin(k * .9) + Math.sin(k * 2.3); d = ph > 1.1 ? a.dn * 4 * nz() : a.dn * .15 * nz(); u = d * .08; break; } case 'chunk': d = (t % 40) < 6 ? a.dn * 6 * nz() : 8; u = a.up; break; case 'sync': u = (Math.sin(k * .4) > .3 ? a.up : a.up * .05) * nz(); d = a.dn * .3 * nz(); break; case 'poll': d = (t % 20) < 2 ? a.dn * 5 : 2; u = (t % 20) < 2 ? a.up * 3 : 1; break; case 'idle': d = 0; u = 0; }
      if (a.dl > 0) { const v = Math.min(a.dl, 11000 * nz() * (net === 'hot' ? .35 : 1)); d += v; }
      if (net === 'hot') { d = Math.min(d, 1800); u = Math.min(u, 600); } return [d, u]; }
    setInterval(() => { t++; let td = 0, tu = 0; APPS.forEach(a => { const [d, u] = rate(a); a.rd = d; a.ru = u; a.h.push([d, u]); if (a.h.length > N) a.h.shift(); a.tot += (d + u) * .25 / 1000; if (a.dl > 0) { a.got = (a.got || 0) + d * .25 / 1000 * 12; if (a.got >= 3174) { a.dl = 0; a.got = 0; say('Xcode update downloaded'); dlb.disabled = false; dlb.textContent = '⬇ Update Xcode (3.1 GB)'; } else dlb.textContent = 'Downloading… ' + Math.round(a.got / 3174 * 100) + '%'; } td += d; tu += u; });
      if (net === 'hot') { hotUsed += (td + tu) * .25 / 1000; if (hotUsed > CAP * .8 && !warned) { warned = true; say('Hotspot at 80% of your 2 GB plan'); } } paint(td, tu); }, 250);
    /* ---- chart ---- */
    function paint(td, tu) { const W = 1088, Hh = 210, mid = 104, mxD = Math.max(1500, ...APPS[0].h.map((_, i) => APPS.reduce((s2, a) => s2 + a.h[i][0], 0))), mxU = Math.max(1500, ...APPS[0].h.map((_, i) => APPS.reduce((s2, a) => s2 + a.h[i][1], 0)));
      cx.clearRect(0, 0, W, Hh); cx.strokeStyle = '#1C2438'; cx.lineWidth = 1; for (let g = 0; g <= 4; g++) { const y = mid - g * 25; cx.beginPath(); cx.moveTo(0, y); cx.lineTo(W, y); cx.stroke(); cx.beginPath(); cx.moveTo(0, mid + g * 25); cx.lineTo(W, mid + g * 25); cx.stroke(); }
      const X = i => i / (N - 1) * W; [0, 1].forEach(side => { const base = new Array(N).fill(0); APPS.forEach(a => { cx.beginPath(); for (let i = 0; i < N; i++) { const v = base[i] + a.h[i][side], y = side ? mid + 2 + v / mxU * 98 : mid - 2 - v / mxD * 98; i ? cx.lineTo(X(i), y) : cx.moveTo(X(i), y); }
        for (let i = N - 1; i >= 0; i--) { const y = side ? mid + 2 + base[i] / mxU * 98 : mid - 2 - base[i] / mxD * 98; cx.lineTo(X(i), y); } cx.closePath(); cx.globalAlpha = sel && sel !== a ? .25 : side ? .75 : .9; cx.fillStyle = a.c; cx.fill(); for (let i = 0; i < N; i++) base[i] += a.h[i][side]; }); }); cx.globalAlpha = 1;
      cx.fillStyle = '#E6ECF7'; cx.fillRect(0, mid - .5, W, 1); ax[0].textContent = fmt(mxD); ax[2].textContent = fmt(mxU);
      chl.textContent = ''; chl.append(el('b', null, '↓ ' + fmt(td)), el('b', 'u', '↑ ' + fmt(tu)), document.createTextNode(net === 'hot' ? 'iPhone hotspot · capped' : 'Wi-Fi · 300 Mbps'));
      APPS.slice().sort((a, b) => (b.rd + b.ru) - (a.rd + a.ru)).forEach(a => { const r = rowsEl.get(a); tbd.append(r.tr); r.d.textContent = fmt(a.rd); r.u.textContent = fmt(a.ru); r.to.textContent = fmtB(a.tot); r.tr.classList.toggle('blk', a.blocked); r.tr.classList.toggle('pzd', !a.blocked && net === 'hot' && lowData && a.bg); r.tr.setAttribute('aria-selected', String(a === sel));
        const sp = r.sp, m = Math.max(50, ...a.h.map(v => v[0] + v[1])); sp.clearRect(0, 0, 240, 44); sp.strokeStyle = a.c; sp.lineWidth = 2; sp.beginPath(); a.h.forEach((v, i) => { const x = i / (N - 1) * 240, y = 42 - (v[0] + v[1]) / m * 38; i ? sp.lineTo(x, y) : sp.moveTo(x, y); }); sp.stroke(); });
      mxOut(td, tu); if (sel) paintLive(); if (dd) paintDD(); }
    /* ---- detail ---- */
    let live = {};
    function paintDetail() { dt.textContent = ''; live = {}; if (!sel) { dt.append(el('h3', null, 'Select an app'), el('p', null, 'Click any row to see the hosts it is talking to and to block it.')); capBox(); return; } const a = sel, h3 = el('h3'), ic = el('i'); ic.style.setProperty('--c', a.c); h3.append(ic, document.createTextNode(a.n)); dt.append(h3, el('p', null, a.bg ? 'Background app · paused by Low Data Mode' : 'Foreground app'));
      const kv = el('div', 'ng-kv'), cell = l => { const d = el('div'), b = el('b'); d.append(el('small', null, l), b); kv.append(d); return b; }; live.d = cell('Download'); live.u = cell('Upload'); live.t = cell('This session'); live.c = cell('Connections'); dt.append(kv);
      const hs = el('div', 'ng-hs'); hs.append(el('h4', null, 'Talking to')); a.hosts.forEach(([h, loc, proto], i) => { const d = el('div'); d.append(el('span', null, h), el('span', null, a.blocked ? '—' : ['62%', '27%', '11%'][i] || '5%'), el('small', null, loc + ' · ' + proto)); hs.append(d); }); dt.append(hs);
      const fw = el('div', 'ng-fw'), tx = el('span'), tg = el('button', 'ng-tg'); tg.type = 'button'; tg.setAttribute('role', 'switch'); tg.setAttribute('aria-checked', String(a.blocked)); tg.setAttribute('aria-label', 'Block ' + a.n); tx.append(document.createTextNode('Block network access'), el('small', null, a.blocked ? 'All connections denied' : 'Firewall rule for this app'));
      tg.addEventListener('click', () => { a.blocked = !a.blocked; if (a.blocked) { check('block'); tone(220, .08, 'square', .04); say(a.n + ' blocked · its connections were closed'); } else { tone(700, .04); say(a.n + ' allowed again'); } paintDetail(); }); fw.append(tx, tg); dt.append(fw); capBox(); paintLive(); }
    function paintLive() { if (!sel || !live.d) return; live.d.textContent = fmt(sel.rd); live.u.textContent = fmt(sel.ru); live.t.textContent = fmtB(sel.tot); live.c.textContent = sel.blocked ? '0' : String(sel.hosts.length + (sel.rd + sel.ru > 100 ? 2 : 0)); if (capEl) paintCap(); }
    let capEl = null; function capBox() { capEl = null; if (net !== 'hot') return; capEl = el('div', 'ng-cap'); dt.append(capEl); paintCap(); }
    function paintCap() { capEl.textContent = ''; const b = el('b'); b.append(el('span', null, 'Hotspot data'), el('span', null, fmtB(hotUsed) + ' / 2 GB')); const bar = el('div', 'bar'), i = el('i'); i.style.width = Math.min(100, hotUsed / CAP * 100) + '%'; bar.append(i); capEl.append(b, bar, el('span', null, lowData ? 'Low Data Mode on · Dropbox, iCloud and App Store paused' : 'Background sync is still running'));
      if (!lowData) { const lb = el('button', null, 'Turn on Low Data Mode'); lb.type = 'button'; lb.addEventListener('click', () => { lowData = true; say('Low Data Mode: background apps paused'); tone(600, .04); paintDetail(); }); capEl.append(lb); } }
    /* ---- actions ---- */
    const store2 = APPS.find(a => a.n === 'App Store'); dlb.addEventListener('click', () => { if (store2.dl > 0) return; if (store2.blocked) { say('App Store is blocked by your firewall rule'); return; } store2.dl = 1e9; store2.got = 0; dlb.disabled = true; check('spike'); tone(500, .05); say('Downloading Xcode update · watch the graph'); });
    hsb.addEventListener('click', () => { net = net === 'wifi' ? 'hot' : 'wifi'; hsb.setAttribute('aria-pressed', String(net === 'hot')); hsb.textContent = net === 'hot' ? '📶 Back to Wi-Fi' : '📱 Use iPhone hotspot'; if (ttl) ttl.textContent = 'NetGauge — ' + (net === 'hot' ? 'iPhone hotspot' : 'Wi-Fi'); if (net === 'hot') { check('hotspot'); say('On a metered hotspot · 2 GB plan'); } else lowData = false; tone(net === 'hot' ? 440 : 660, .05); paintDetail(); });
    /* ---- menu bar ---- */
    const mx = el('button', 'ng-mx'), m1 = el('span'), m2 = el('span'); mx.type = 'button'; mx.append(m1, m2); mx.setAttribute('aria-haspopup', 'true'); mx.setAttribute('aria-expanded', 'false'); extra.append(mx); let dd = null;
    function mxOut(td, tu) { m1.textContent = '↑ ' + fmt(tu); m2.textContent = '↓ ' + fmt(td); mx.setAttribute('aria-label', 'Network: down ' + fmt(td) + ', up ' + fmt(tu)); }
    function openDD(auto) { if (dd) { closeDD(); return; } if (!auto) check('menu'); dd = el('div', 'ng-dd'); dd.setAttribute('role', 'dialog'); dd.setAttribute('aria-label', 'NetGauge'); const r = mx.getBoundingClientRect(), dr = desk.getBoundingClientRect(), sc = dr.width / 1200; dd.style.left = Math.min(1200 - 312, (r.left - dr.left) / sc - 120) + 'px'; desk.append(dd); mx.setAttribute('aria-expanded', 'true'); paintDD(); }
    function closeDD() { if (!dd) return; dd.remove(); dd = null; mx.setAttribute('aria-expanded', 'false'); }
    function paintDD() { dd.textContent = ''; const hd = el('header'), td = APPS.reduce((a, b) => a + b.rd, 0), tu = APPS.reduce((a, b) => a + b.ru, 0); hd.append(el('b', null, '↓ ' + fmt(td)), el('span', null, '↑ ' + fmt(tu) + ' · ' + (net === 'hot' ? 'hotspot' : 'Wi-Fi'))); dd.append(hd); const mxv = Math.max(100, ...APPS.map(a => a.rd + a.ru));
      APPS.slice().sort((a, b) => (b.rd + b.ru) - (a.rd + a.ru)).slice(0, 5).forEach(a => { const r = el('div', 'row'), bar = el('div'), i = el('i'); i.style.width = ((a.rd + a.ru) / mxv * 100) + '%'; i.style.setProperty('--c', a.c); bar.append(i); r.append(el('span', null, a.n), bar, el('span', null, fmt(a.rd + a.ru))); dd.append(r); });
      const op = el('button', null, 'Open NetGauge'); op.type = 'button'; op.addEventListener('click', closeDD); dd.append(op); }
    mx.addEventListener('click', e => { e.stopPropagation(); openDD(); }); desk.addEventListener('click', e => { const p = e.composedPath();  });
    H.jump = (k, fs) => { if (fs) return; if (k === 'app') { sel = APPS[0]; check('app'); paintDetail(); } else if (k === 'spike') dlb.click(); else if (k === 'hotspot') { if (net !== 'hot') hsb.click(); } };
    paintDetail();
    setTimeout(() => { if (!dd) openDD(true); }, 900);
  }
  demo(H.app, H);
  H.boot();
})();
