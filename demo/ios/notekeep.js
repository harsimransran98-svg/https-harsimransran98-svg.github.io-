/* Notekeep — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- Notekeep ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const TPL = {"a":[[[5,4],[2,4],[1,5.5],[1.5,7.5],[3,8],[5,7]],[[5,4],[5,8]]],"b":[[[1,0],[1,8]],[[1,5],[3,4],[5,5],[5,7],[3,8],[1,7]]],"c":[[[5,4.5],[3,4],[1,5],[1,7],[3,8],[5,7.5]]],"d":[[[5,0],[5,8]],[[5,5],[3,4],[1,5],[1,7],[3,8],[5,7]]],"e":[[[1,6],[5,6],[4.5,4.5],[3,4],[1,5],[1,7],[3,8],[5,7.5]]],"f":[[[5,0.5],[3.5,0],[2.5,1],[2.5,8]],[[1,4],[4.5,4]]],"g":[[[5,5],[3,4],[1,5],[1,6.5],[3,7.5],[5,6.5]],[[5,4],[5,9.5],[3,10],[1,9.5]]],"h":[[[1,0],[1,8]],[[1,5],[3,4],[5,5],[5,8]]],"i":[[[3,4],[3,8]],[[3,2],[3,2.4]]],"j":[[[4,4],[4,9.5],[2.5,10],[1,9.5]],[[4,2],[4,2.4]]],"k":[[[1,0],[1,8]],[[5,4],[1,6.5],[5,8]]],"l":[[[3,0],[3,8]]],"m":[[[0.5,4],[0.5,8]],[[0.5,5],[2,4],[3,5],[3,8]],[[3,5],[4.5,4],[5.5,5],[5.5,8]]],"n":[[[1,4],[1,8]],[[1,5],[3,4],[5,5],[5,8]]],"o":[[[3,4],[1,5],[1,7],[3,8],[5,7],[5,5],[3,4]]],"p":[[[1,4],[1,10]],[[1,5],[3,4],[5,5],[5,7],[3,8],[1,7]]],"q":[[[5,4],[5,10]],[[5,5],[3,4],[1,5],[1,7],[3,8],[5,7]]],"r":[[[1,4],[1,8]],[[1,5.5],[3,4],[5,4.3]]],"s":[[[5,4.5],[3,4],[1,4.8],[3,6],[5,7],[3,8],[1,7.5]]],"t":[[[3,1],[3,7.5],[4,8],[5,7.5]],[[1,4],[5,4]]],"u":[[[1,4],[1,7],[3,8],[5,7]],[[5,4],[5,8]]],"v":[[[1,4],[3,8],[5,4]]],"w":[[[0.5,4],[1.8,8],[3,5],[4.2,8],[5.5,4]]],"x":[[[1,4],[5,8]],[[5,4],[1,8]]],"y":[[[1,4],[3,8]],[[5,4],[2,10]]],"z":[[[1,4],[5,4],[1,8],[5,8]]]}, LEX = ["a","an","and","at","to","do","the","for","with","from","of","on","in","is","it","my","we","me","be","go","buy","oat","oats","milk","eggs","egg","bread","call","mom","dad","meet","meeting","ten","two","one","note","notes","idea","ideas","list","pick","up","book","send","email","draft","plan","trip","pay","rent","gym","run","walk","read","write","fix","bug","ship","code","test","review","lunch","dinner","coffee","tea","back","today","monday","friday","week","next","new","old","big","good","home","work","desk","shop","store","fruit","apple","rice","pasta","soap","water","cheese","butter","jam","flowers","gift","card","thanks","hello","world","keep","pen","ink","paper","page","line","word","text","search","find","save","open","ask","flight","hotel","train","bus","map","gas","bank","cash","bill","tax","doctor","vet","dog","cat","feed","clean","wash","cook","bake","cake","pizza","salad","soup","honey","lemon","lime","mint","basil","onion","garlic","tomato","carrot","salt","sugar","flour","pack","kids","school","car","keys","love","yes","no","hi","bye","sun","fun","job","art","film","plants","water","garden"];
    const U = 5.5, LH = 70, BASE = 56, W = 370, HT = 420, N = 24, LINES = 6;
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    /* ---- $P point-cloud recogniser ---- */
    function resample(src, n) { let L = 0; for (let i = 1; i < src.length; i++) if (src[i][2] === src[i - 1][2]) L += dist(src[i - 1], src[i]);
      if (L === 0) return Array.from({ length: n }, () => src[0].slice()); const I = L / (n - 1), p = src.map(a => a.slice()), out = [p[0].slice()]; let D = 0;
      for (let i = 1; i < p.length; i++) { if (p[i][2] !== p[i - 1][2]) continue; const d = dist(p[i - 1], p[i]); if (D + d >= I && d > 0) { const t = (I - D) / d, q = [p[i - 1][0] + t * (p[i][0] - p[i - 1][0]), p[i - 1][1] + t * (p[i][1] - p[i - 1][1]), p[i][2]]; out.push(q); p.splice(i, 0, q); D = 0; } else D += d; }
      while (out.length < n) out.push(p[p.length - 1].slice()); return out.slice(0, n); }
    function cloudD(a, b, st) { const n = a.length, used = new Uint8Array(n); let sum = 0, i = st; do { let mn = Infinity, ix = 0; for (let j = 0; j < n; j++) if (!used[j]) { const dx = a[i][0] - b[j][0], dy = a[i][1] - b[j][1], d = dx * dx + dy * dy; if (d < mn) { mn = d; ix = j; } } used[ix] = 1; sum += (1 - ((i - st + n) % n) / n) * Math.sqrt(mn); i = (i + 1) % n; } while (i !== st); return sum; }
    function greedy(a, b) { const step = Math.floor(Math.sqrt(a.length)); let mn = Infinity; for (let i = 0; i < a.length; i += step) mn = Math.min(mn, cloudD(a, b, i), cloudD(b, a, i)); return mn; }
    const TC = {}, TW = {}; Object.keys(TPL).forEach(ch => { const pts = []; TPL[ch].forEach((st, si) => st.forEach(p => pts.push([p[0], p[1], si]))); const c = resample(pts, N), mx = c.reduce((s, p) => s + p[0], 0) / N; TC[ch] = c.map(p => [p[0] - mx, p[1]]); const xs = TPL[ch].flat().map(p => p[0]); TW[ch] = [Math.min(...xs), Math.max(...xs)]; });
    function scoreGroup(g, base) { const pts = []; g.forEach((s, si) => s.pts.forEach(p => pts.push([p[0], p[1], si]))); const c = resample(pts, N), mx = c.reduce((s, p) => s + p[0], 0) / N, cost = {};
      [.7, .85, 1, 1.2, 1.45].forEach(k => { const sc = c.map(p => [(p[0] - mx) / (U * k), 8 + (p[1] - base) / (U * k)]); for (const ch in TC) { const d = greedy(sc, TC[ch]); if (!(ch in cost) || d < cost[ch]) cost[ch] = d; } }); return cost; }
    function readWord(costs) { const raw = costs.map(c => Object.keys(c).reduce((a, b) => c[a] <= c[b] ? a : b)), rawCost = costs.reduce((s, c, i) => s + c[raw[i]], 0); let best = null, bc = Infinity;
      LEX.forEach(w => { if (w.length !== costs.length) return; let t = 0; for (let i = 0; i < w.length; i++) t += costs[i][w[i]]; if (t < bc) { bc = t; best = w; } });
      return best && bc <= rawCost * 1.3 ? { text: best, raw: raw.join(''), fixed: best !== raw.join('') } : { text: raw.join(''), raw: raw.join(''), fixed: false }; }
    const bbox = pts => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; pts.forEach(p => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }); return { x0, y0, x1, y1 }; };
    function segment(strokes) { const ss = strokes.map(s => ({ s, b: bbox(s.pts) })).sort((a, b) => a.b.x0 - b.b.x0), groups = [];
      ss.forEach(o => { const g = groups[groups.length - 1], w = o.b.x1 - o.b.x0; if (g) { const ov = Math.min(o.b.x1, g.x1) - Math.max(o.b.x0, g.x0), cx = (o.b.x0 + o.b.x1) / 2;
        if (ov > -2 || ov > .35 * Math.min(w, g.x1 - g.x0) || (w < 10 && cx > g.x0 - 4 && cx < g.x1 + 4)) { g.list.push(o.s); g.x0 = Math.min(g.x0, o.b.x0); g.x1 = Math.max(g.x1, o.b.x1); return; } }
        groups.push({ list: [o.s], x0: o.b.x0, x1: o.b.x1 }); });
      const gaps = groups.slice(1).map((g, i) => g.x0 - groups[i].x1), med = gaps.length ? gaps.slice().sort((a, b) => a - b)[Math.floor(gaps.length / 2)] : 0, thr = Math.max(12, med * 1.8), words = [];
      groups.forEach((g, i) => { if (!i || gaps[i - 1] > thr) words.push([]); words[words.length - 1].push(g); }); return words; }
    /* ---- handwriting generator (for the ghost writer + sample notes) ---- */
    function hand(text, x0, base, u, maxX, lh) { lh = lh || LH; let x = x0, b = base; const strokes = [], words = [];
      text.split(' ').forEach(w => { const need = [...w].reduce((s, ch) => s + (TW[ch] ? (TW[ch][1] - TW[ch][0] + 2.3) * u : 0), 0); if (maxX && x + need > maxX && x > x0) { x = x0; b += lh; }
        const wx = x; [...w].forEach(ch => { const t = TPL[ch]; if (!t) return; const [mn, mxx] = TW[ch], jx = (Math.random() - .5) * .3 * u, jy = (Math.random() - .5) * .5 * u;
          t.forEach(st => { const pts = []; for (let k = 1; k < st.length; k++) { const [ax, ay] = st[k - 1], [bx, by] = st[k], steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / .45));
            for (let q = k === 1 ? 0 : 1; q <= steps; q++) { const px = ax + (bx - ax) * q / steps, py = ay + (by - ay) * q / steps; pts.push([x + (px - mn) * u + (8 - py) * .13 * u + jx + (Math.random() - .5) * .25 * u, b + (py - 8) * u + jy + (Math.random() - .5) * .25 * u, 1.9 + Math.random() * .7]); } }
            strokes.push({ tool: 'pen', color: '#1B1F3B', pts }); }); x += (mxx - mn + 2.3) * u; });
        words.push({ text: w, x0: wx, x1: x, base: b }); x += 2.8 * u; }); return { strokes, words }; }
    /* ---- UI ---- */
    const root = el('div', 'nk'), hd = el('div', 'nk-hd'), ht = el('div'), hb = el('div', 'nk-hb'), lst = el('button', 'nk-ic', '☰'), cvt = el('button', 'nk-cvt', 'Convert'); lst.type = cvt.type = 'button'; lst.setAttribute('aria-label', 'All notes');
    ht.append(el('small', null, 'Nov 19 · Notes'), el('h2', null, 'Groceries')); hb.append(lst, cvt); hd.append(ht, hb);
    const pp = el('div', 'nk-pp'), cv = el('canvas'); cv.width = W * 2; cv.height = HT * 2; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', 'Ruled writing paper. Draw letters with the pointer.'); pp.append(cv); const ctx = cv.getContext('2d'); ctx.scale(2, 2); ctx.lineCap = ctx.lineJoin = 'round';
    const out = el('section', 'nk-out'), oh = el('header'), cp = el('button', null, 'Copy'), txt = el('div', 'nk-txt mt', 'Print letters on the lines, then press Convert.'), alt = el('div', 'nk-alt'); cp.type = 'button'; oh.append(el('span', null, 'TEXT'), cp); out.append(oh, txt, alt);
    const tray = el('div', 'nk-tray'); root.append(hd, pp, out, tray); app.append(root);
    let strokes = [], words = [], tool = 'pen', color = '#1B1F3B', busy = false, cur = null, wid = 0;
    const TOOLS = { pen: ['Pen', 'M3 18h16v52H3z', 'M3 18h16L11 0z', 'M8.2 6.6h5.6L11 0z'], hl: ['Highlighter', 'M2 18h18v52H2z', 'M2 18h18l-2-12-14 3z', 'M4 9l14-3 0 3-14 3z'], eraser: ['Eraser', 'M3 18h16v52H3z', 'M3 18h16V8a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4z', ''] };
    Object.entries(TOOLS).forEach(([k, [lbl, body, tip, nib]]) => { const b = el('button', 'nk-tl'), sv = svgEl('svg', { viewBox: '0 0 22 70', 'aria-hidden': 'true' }); b.type = 'button'; b.dataset.t = k; b.setAttribute('aria-label', lbl);
      sv.append(svgEl('path', { d: body, fill: '#ECEAE2' }), svgEl('path', { d: tip, fill: k === 'eraser' ? '#F2A7B0' : k === 'hl' ? '#FFE08A' : '#E9D8B4' })); if (nib) sv.append(svgEl('path', { d: nib, fill: k === 'hl' ? '#E8A913' : 'var(--ink, #1B1F3B)' })); sv.append(svgEl('rect', { x: k === 'hl' ? 2 : 3, y: 32, width: k === 'hl' ? 18 : 16, height: 5, fill: k === 'eraser' ? '#C9C5B8' : k === 'hl' ? '#E8A913' : 'var(--ink, #1B1F3B)' }));
      b.append(sv); b.addEventListener('click', () => { tool = k; pp.classList.toggle('er', k === 'eraser'); syncTray(); tone(k === 'eraser' ? 380 : 620, .03); haptic(3); }); tray.append(b); });
    tray.append(el('i', 'nk-sep')); [['#1B1F3B', 'Graphite'], ['#2B4BEE', 'Cobalt'], ['#D7443E', 'Red']].forEach(([c, n]) => { const b = el('button', 'nk-dot'); b.type = 'button'; b.dataset.c = c; b.style.setProperty('--c', c); b.setAttribute('aria-label', n + ' ink'); b.addEventListener('click', () => { color = c; if (tool !== 'pen') tool = 'pen'; syncTray(); }); tray.append(b); });
    const me = el('button', 'nk-me', 'Write for me'); me.type = 'button'; tray.append(me);
    function syncTray() { tray.querySelectorAll('.nk-tl').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === tool))); tray.querySelectorAll('.nk-dot').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.c === color))); tray.style.setProperty('--ink', color); }
    function draw() { ctx.clearRect(0, 0, W, HT); [...strokes.filter(s => s.tool === 'hl'), ...strokes.filter(s => s.tool !== 'hl'), ...(cur ? [cur] : [])].forEach(s => { const a = s.a == null ? 1 : s.a;
        ctx.globalCompositeOperation = s.tool === 'hl' ? 'multiply' : 'source-over'; ctx.globalAlpha = (s.tool === 'hl' ? .42 : 1) * a; ctx.strokeStyle = s.color; const p = s.pts;
        if (p.length === 1) { ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(p[0][0], p[0][1], p[0][2] / 2, 0, 7); ctx.fill(); }
        for (let i = 1; i < p.length; i++) { ctx.lineWidth = s.tool === 'hl' ? 16 : (p[i - 1][2] + p[i][2]) / 2; ctx.lineCap = s.tool === 'hl' ? 'butt' : 'round'; ctx.beginPath(); ctx.moveTo(p[i - 1][0], p[i - 1][1]); ctx.lineTo(p[i][0], p[i][1]); ctx.stroke(); } });
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
    /* ---- typed words on the paper ---- */
    const wordEls = new Map();
    function placeWords() { words.forEach(w => { if (wordEls.has(w)) return; const s = el('span', 'nk-wd' + (w.fixed ? ' fix' : ''), w.text); s.style.left = w.x0 + 'px'; s.style.top = (w.base - 19) + 'px'; if (w.fixed) s.title = 'Read as “' + w.raw + '”, corrected'; pp.append(s); wordEls.set(w, s); if (G && !reduced) G.from(s, { opacity: 0, y: 6, duration: .4, ease: 'back.out(2)' }); });
      [...wordEls.keys()].forEach(w => { if (!words.includes(w)) { wordEls.get(w).remove(); wordEls.delete(w); } }); syncText(); }
    function syncText() { const lines = []; words.slice().sort((a, b) => a.base - b.base || a.x0 - b.x0).forEach(w => { const li = Math.round(w.base / LH); (lines[li] = lines[li] || []).push(w.text); }); const t = lines.filter(Boolean).map(l => l.join(' ')).join('\n');
      txt.textContent = t || 'Print letters on the lines, then press Convert.'; txt.classList.toggle('mt', !t); txt.style.whiteSpace = 'pre-line'; const fx = words.filter(w => w.fixed); alt.textContent = fx.length ? 'Word list fixed: ' + fx.map(w => w.raw + ' → ' + w.text).join(', ') : ''; }
    cp.addEventListener('click', () => { const t = words.length ? txt.textContent : ''; if (!t) { say('Nothing to copy yet'); return; } try { navigator.clipboard.writeText(t).then(() => say('Copied'), () => say('Copy blocked here')); } catch (e) { say('Copy blocked here'); } });
    /* ---- input ---- */
    const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * HT / r.height]; };
    let last = null, lt = 0;
    function eraseAt(p) { let hit = false; strokes = strokes.filter(s => { const near = s.pts.some(q => dist(q, p) < 10); hit = hit || near; return !near; }); words = words.filter(w => { const sp = wordEls.get(w), wd = sp ? sp.offsetWidth : 40, on = p[0] >= w.x0 - 4 && p[0] <= w.x0 + wd + 4 && p[1] >= w.base - 22 && p[1] <= w.base + 6; hit = hit || on; return !on; }); if (hit) { draw(); placeWords(); tone(300, .015, 'triangle', .02); } }
    cv.addEventListener('pointerdown', e => { if (busy) return; e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} const p = pos(e); if (tool === 'eraser') { cur = { tool: 'eraser', pts: [] }; eraseAt(p); return; }
      cur = { tool, color: tool === 'hl' ? '#FFC93C' : color, pts: [[p[0], p[1], 2.2]] }; last = p; lt = performance.now(); draw(); });
    cv.addEventListener('pointermove', e => { if (!cur) return; const p = pos(e); if (cur.tool === 'eraser') { eraseAt(p); return; } const now = performance.now(), sp = dist(p, last) / Math.max(1, now - lt);
      const w = e.pointerType === 'pen' && e.pressure ? 1.2 + e.pressure * 3 : Math.max(1.4, Math.min(3, 3.1 - sp * 1.2)); cur.pts.push([p[0], p[1], w]); last = p; lt = now; draw(); });
    function isScribble(s) { if (s.pts.length < 12) return false; let rev = 0, dir = 0, acc = 0; for (let i = 1; i < s.pts.length; i++) { const dx = s.pts[i][0] - s.pts[i - 1][0]; if (!dx) continue; const d = Math.sign(dx); if (d === dir) acc += Math.abs(dx); else { if (dir && acc > 5) rev++; dir = d; acc = Math.abs(dx); } } const b = bbox(s.pts); return rev >= 5 && b.x1 - b.x0 > 22; }
    function endStroke() { if (!cur) return; const s = cur; cur = null; if (s.tool === 'eraser') return;
      if (s.tool === 'pen' && isScribble(s)) { const b = bbox(s.pts), inter = (o) => Math.max(0, Math.min(b.x1, o.x1) - Math.max(b.x0, o.x0)) * Math.max(0, Math.min(b.y1, o.y1) - Math.max(b.y0, o.y0));
        const n0 = strokes.length + words.length; strokes = strokes.filter(o => { const ob = bbox(o.pts), ar = Math.max(1, (ob.x1 - ob.x0 + 2) * (ob.y1 - ob.y0 + 2)); return inter({ x0: ob.x0 - 1, y0: ob.y0 - 1, x1: ob.x1 + 1, y1: ob.y1 + 1 }) / ar < .3; });
        words = words.filter(w => { const sp = wordEls.get(w), wd = sp ? sp.offsetWidth : 40, ob = { x0: w.x0, x1: w.x0 + wd, y0: w.base - 20, y1: w.base + 4 }; return inter(ob) / ((ob.x1 - ob.x0) * 24) < .25; });
        if (strokes.length + words.length < n0) { draw(); placeWords(); check('scribble'); say('Scribbled out'); tone(240, .06, 'sawtooth', .03); haptic(12); return; } }
      strokes.push(s); draw(); if (s.tool === 'pen' && s.pts.length > 3) check('write'); if (s.tool === 'hl') check('tool'); }
    cv.addEventListener('pointerup', endStroke); cv.addEventListener('pointercancel', endStroke); cv.addEventListener('lostpointercapture', endStroke);
    /* ---- convert ---- */
    function convert() { if (busy) return; const ink = strokes.filter(s => s.tool === 'pen'); if (!ink.length) { say('Write a word on the lines first'); return; } const t0 = performance.now(); let n = 0, done = [];
      for (let li = 0; li < LINES; li++) { const ls = ink.filter(s => { const b = bbox(s.pts), cy = (b.y0 + b.y1) / 2; return Math.max(0, Math.min(LINES - 1, Math.floor(cy / LH))) === li; }); if (!ls.length) continue; const base = li * LH + BASE;
        segment(ls).forEach(wg => { const costs = wg.map(g => scoreGroup(g.list, base)), r = readWord(costs); words.push({ text: r.text, raw: r.raw, fixed: r.fixed, x0: wg[0].x0, base }); n++; wg.forEach(g => done.push(...g.list)); }); }
      const ms = Math.max(1, Math.round(performance.now() - t0)); busy = true; cvt.disabled = true; const fade = { a: 1 }; done.forEach(s => { s.a = 1; });
      const fin = () => { strokes = strokes.filter(s => !done.includes(s)); draw(); placeWords(); busy = false; cvt.disabled = false; check('convert'); say(n + (n === 1 ? ' word' : ' words') + ' converted in ' + ms + ' ms, on device'); tone(880, .04); setTimeout(() => tone(1320, .05), 70); };
      if (G && !reduced) { G.to(fade, { a: 0, duration: .32, onUpdate: () => { done.forEach(s => { s.a = fade.a; }); draw(); } }); setTimeout(fin, 340); } else fin(); }
    cvt.addEventListener('click', convert);
    /* ---- ghost writer ---- */
    function ghost(text, li, cb) { if (busy) return; let g = hand(text, 36, li * LH + BASE, 4.6, W - 14); if (Math.max(...g.words.map(w => w.base)) > HT - 10) { strokes = []; words = []; draw(); placeWords(); g = hand(text, 36, BASE, 4.6, W - 14); } busy = true; me.disabled = cvt.disabled = true; const q = g.strokes.slice(); let s = null, k = 0;
      const t = setInterval(() => { for (let n = 0; n < 5; n++) { if (!s) { if (!q.length) { clearInterval(t); cur = null; busy = false; me.disabled = cvt.disabled = false; draw(); check('write'); if (cb) cb(); return; } s = q.shift(); cur = { tool: 'pen', color, pts: [] }; k = 0; }
        cur.pts.push(s.pts[k++]); if (k >= s.pts.length) { cur.color = color; strokes.push(cur); cur = null; s = null; } } draw(); }, reduced ? 1 : 16); }
    const PHR = ['buy oat milk', 'call mom at ten', 'send the draft', 'fix bug ship code', 'book train'];
    let pi = 0; const freeLine = () => { for (let li = 0; li < LINES; li++) if (!strokes.some(s => s.pts.some(p => Math.floor(p[1] / LH) === li)) && !words.some(w => Math.round((w.base - BASE) / LH) === li)) return li; return -1; };
    function writeForMe(cb) { let li = freeLine(); if (li < 0) { strokes = []; words = []; draw(); placeWords(); li = 0; } ghost(PHR[pi++ % PHR.length], li, cb); }
    me.addEventListener('click', () => writeForMe());
    /* ---- notes + search ---- */
    const SEED = [['Standup', 'Nov 17', 'fix bug ship code review the plan'], ['Weekend', 'Nov 15', 'book train pack gift card for mom'], ['Kitchen', 'Nov 12', 'buy honey lemon garlic and basil']];
    let nv = null;
    function openNotes() { if (nv) return; nv = el('section', 'nk-nv'); const bk = el('button', 'nk-bk', '‹ Paper'), q = el('label', 'nk-q'), inp = el('input'), res = el('p', 'nk-res'); bk.type = 'button'; inp.type = 'search'; inp.placeholder = 'Search handwriting'; inp.setAttribute('aria-label', 'Search your notes'); inp.maxLength = 40;
      q.append(el('span', null, '⌕'), inp); nv.append(bk, el('h2', null, 'All notes'), q, res); bk.addEventListener('click', closeNotes);
      const cards = []; const mine = el('article', 'nk-card'), tp = el('div', 'nk-tp'); const myWords = words.slice().sort((a, b) => a.base - b.base || a.x0 - b.x0).map(w => w.text);
      const tpWords = myWords.map(w => { const m = el('span', null, w); tp.append(m, document.createTextNode(' ')); return m; }); if (!myWords.length) { tp.textContent = 'Nothing converted on this page yet'; tp.style.color = '#A9A594'; }
      const p0 = el('p', null, 'Groceries'); p0.append(el('small', null, 'Today · typed')); mine.append(tp, p0); nv.append(mine); cards.push({ card: mine, words: myWords, marks: tpWords.map(m => ({ on: v => { if (v) { const mk = el('mark', null, m.textContent); m.textContent = ''; m.append(mk); } else m.textContent = m.textContent; } })) });
      SEED.forEach(([t, d, body]) => { const c = el('article', 'nk-card'), g = hand(body, 14, 34, 2.7, 356, 44), rows = Math.max(...g.words.map(w => w.base)) + 18, sv = svgEl('svg', { viewBox: '0 0 370 ' + rows, role: 'img', 'aria-label': 'Handwritten: ' + body });
        const rects = g.words.map(w => { const r = svgEl('rect', { x: w.x0 - 4, y: w.base - 24, width: w.x1 - w.x0 - 2, height: 31, rx: 6, fill: '#FFD34D', opacity: 0 }); sv.append(r); return r; });
        g.strokes.forEach(s => sv.append(svgEl('path', { d: 'M' + s.pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'), fill: 'none', stroke: '#1B1F3B', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })));
        const p = el('p', null, t); p.append(el('small', null, d + ' · handwritten')); c.append(sv, p); nv.append(c); cards.push({ card: c, words: g.words.map(w => w.text), marks: rects.map(r => ({ on: v => r.setAttribute('opacity', v ? .6 : 0) })) }); });
      const run = () => { const v = inp.value.trim().toLowerCase(); let hits = 0, nc = 0; cards.forEach(c => { let any = false; c.words.forEach((w, i) => { const m = !!v && w.includes(v); if (m) { any = true; hits++; } c.marks[i] && c.marks[i].on(m); }); c.card.hidden = !!v && !any; if (any) nc++; });
        res.textContent = v ? hits + (hits === 1 ? ' match' : ' matches') + ' in ' + nc + (nc === 1 ? ' note' : ' notes') : cards.length + ' notes · ' + cards.reduce((s, c) => s + c.words.length, 0) + ' words indexed'; if (v.length >= 2 && hits) check('search'); };
      inp.addEventListener('input', run); run(); root.append(nv); if (G && !reduced) G.from(nv, { x: 40, opacity: 0, duration: .3, ease: 'expo.out' }); }
    function closeNotes() { if (!nv) return; const v = nv; nv = null; v.style.pointerEvents = 'none'; if (G && !reduced) G.to(v, { x: 40, opacity: 0, duration: .2 }); setTimeout(() => v.remove(), 210); }
    lst.addEventListener('click', openNotes);
    H.jump = (k, fs) => { if (k === 'notes') { openNotes(); return; } closeNotes(); if (fs) return;
      if (k === 'write') say('Print a word on the first empty line');
      else if (k === 'convert') { if (strokes.some(s => s.tool === 'pen')) convert(); else writeForMe(() => setTimeout(convert, 250)); }
      else if (k === 'scribble') { if (words.length || strokes.length) say('Scribble back and forth over a word'); else writeForMe(() => setTimeout(() => { convert(); say('Now scribble over a word'); }, 250)); } };
    syncTray(); draw();
  }
  demo(H.app, H);
  H.boot();
})();
