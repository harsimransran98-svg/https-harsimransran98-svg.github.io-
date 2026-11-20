/* FontBar — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- FontBar ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say, desk, extra, win } = H;
    const FONTS = [['Fraunces', 'serif', 800, 'Variable soft serif'], ['Playfair Display', 'serif', 700, 'High-contrast transitional'], ['Libre Baskerville', 'serif', 400, 'Book serif for reading'], ['DM Serif Display', 'display', 400, 'Condensed display serif'], ['Bebas Neue', 'display', 400, 'All-caps poster sans'], ['Space Grotesk', 'sans', 700, 'Quirky grotesque'], ['Schibsted Grotesk', 'sans', 600, 'Newsroom grotesk'], ['Outfit', 'sans', 600, 'Geometric sans'], ['JetBrains Mono', 'mono', 500, 'Coding mono with ligatures'], ['Sometype Mono', 'mono', 500, 'Typewriter mono'], ['Caveat', 'script', 600, 'Handwritten marker'], ['Pacifico', 'script', 400, 'Retro brush script']].map(([n, c, w, d]) => ({ n, c, w, d, inst: ['Fraunces', 'Schibsted Grotesk', 'Sometype Mono'].includes(n) }));
    const byN = n => FONTS.find(f => f.n === n), fam = f => "'" + f.n + "', " + (f.c === 'mono' ? 'monospace' : f.c === 'serif' || f.n.includes('Serif') ? 'serif' : f.c === 'script' ? 'cursive' : 'sans-serif');
    const PAIRS = { 'Playfair Display': 'Outfit', 'Bebas Neue': 'Libre Baskerville', 'DM Serif Display': 'Space Grotesk', 'Fraunces': 'Schibsted Grotesk', 'Space Grotesk': 'Libre Baskerville', 'Outfit': 'Libre Baskerville', 'Libre Baskerville': 'Outfit', 'Schibsted Grotesk': 'Fraunces', 'Caveat': 'Outfit', 'Pacifico': 'Outfit', 'JetBrains Mono': 'Schibsted Grotesk', 'Sometype Mono': 'Fraunces' };
    let head = byN('Fraunces'), bodyF = byN('Schibsted Grotesk'), role = 'h', size = 64, preview = null, pins = [], cat = 'all', q = '', focusF = byN('Playfair Display');
    /* ---- document window ---- */
    const ttl = win.querySelector('.ttl'); if (ttl) ttl.textContent = 'Poster draft — Edited';
    const root = el('div', 'fo'), bar = el('div', 'fo-bar'), rl = el('div', 'fo-rl'), sz = el('input'), lab = el('span'), sp = el('span', 'sp'); sz.type = 'range'; sz.min = 36; sz.max = 96; sz.value = size; sz.setAttribute('aria-label', 'Headline size');
    [['h', 'Headline'], ['b', 'Body']].forEach(([k, l]) => { const b = el('button', null, l); b.type = 'button'; b.dataset.r = k; b.addEventListener('click', () => { role = k; paintDoc(); }); rl.append(b); }); bar.append(rl, el('span', null, 'Size'), sz, sp); sz.addEventListener('input', () => { size = +sz.value; paintDoc(); });
    const doc = el('div', 'fo-doc'), pg = el('div', 'fo-pg'), kk = el('p', 'fo-k', 'Spring lecture series'), hh = el('h1', 'fo-h', 'Small type, big ideas'), ss = el('p', 'fo-s', 'Six evenings on letters, layout and the people who draw them.'), bb = el('p', 'fo-b', 'Doors at 18:30 in the old print hall. Free entry, limited seats. Bring a pencil; we will draw a lowercase g together and it will be harder than you think.'), tag = el('span', 'fo-tag');
    [hh, ss, bb].forEach(e => { e.setAttribute('contenteditable', 'plaintext-only'); e.spellcheck = false; }); hh.addEventListener('paste', e => { e.preventDefault(); const t = (e.clipboardData || window.clipboardData).getData('text/plain').slice(0, 120); document.execCommand('insertText', false, t); });
    pg.append(tag, kk, hh, ss, bb); doc.append(pg); root.append(bar, doc); app.append(root); let cmpEl = null;
    function paintDoc() { rl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.r === role))); const hf = role === 'h' && preview ? preview : head, bf = role === 'b' && preview ? preview : bodyF;
      hh.style.fontFamily = fam(hf); hh.style.fontWeight = hf.w; ss.style.fontFamily = fam(bf); bb.style.fontFamily = fam(bf); pg.style.setProperty('--hs', size + 'px'); hh.classList.toggle('role', role === 'h'); bb.classList.toggle('role', role === 'b'); pg.classList.toggle('pv', !!preview);
      tag.textContent = preview ? 'Preview: ' + preview.n + (preview.inst ? '' : ' · not installed') : ''; sp.textContent = 'Headline: ' + head.n + ' · Body: ' + bodyF.n;
      if (pins.length >= 2) { if (!cmpEl) { cmpEl = el('div', 'fo-cmp'); pg.hidden = true; doc.append(cmpEl); } cmpEl.textContent = ''; pins.forEach(f => { const c = el('div'), sm = el('small'), un = el('button', null, 'Unpin'), p = el('p', null, hh.textContent || 'Small type, big ideas'); un.type = 'button'; un.addEventListener('click', () => togglePin(f)); sm.append(el('span', null, f.n + ' · ' + f.c + (f.inst ? ' · installed' : '')), un); p.style.fontFamily = fam(f); p.style.fontWeight = f.w; c.append(sm, p); cmpEl.append(c); }); }
      else if (cmpEl) { cmpEl.remove(); cmpEl = null; pg.hidden = false; } }
    /* ---- menu-bar extra + dropdown ---- */
    const mx = el('button', 'fo-mx', 'Aa'); mx.type = 'button'; mx.setAttribute('aria-label', 'FontBar'); mx.setAttribute('aria-haspopup', 'true'); mx.setAttribute('aria-expanded', 'false'); extra.append(mx);
    let dd = null, ls = null, prB = null;
    function openDD(auto) { if (dd) { closeDD(); return; } if (!auto) check('menu'); dd = el('div', 'fo-dd'); dd.setAttribute('role', 'dialog'); dd.setAttribute('aria-label', 'FontBar fonts'); const r = mx.getBoundingClientRect(), dr = desk.getBoundingClientRect(), sc = dr.width / 1200; dd.style.left = Math.max(720, Math.min(1200 - 432, (r.left - dr.left) / sc - 330)) + 'px';
      const dh = el('div', 'fo-dh'), qq = el('label', 'fo-q'), inp = el('input'), ch = el('div', 'fo-ch'); inp.type = 'search'; inp.placeholder = 'Search 12 fonts'; inp.maxLength = 30; inp.setAttribute('aria-label', 'Search fonts'); inp.value = q; inp.addEventListener('input', () => { q = inp.value.trim().toLowerCase(); paintList(); }); qq.append(el('span', null, '⌕'), inp);
      ['all', 'serif', 'sans', 'display', 'mono', 'script'].forEach(c => { const b = el('button', null, c[0].toUpperCase() + c.slice(1)); b.type = 'button'; b.dataset.c = c; b.addEventListener('click', () => { cat = c; paintList(); }); ch.append(b); }); dh.append(qq, ch);
      ls = el('div', 'fo-ls'); ls.setAttribute('role', 'list'); ls.addEventListener('mouseleave', () => { preview = null; paintDoc(); }); prB = el('div', 'fo-pr'); dd.append(dh, ls, prB); desk.append(dd); mx.setAttribute('aria-expanded', 'true'); paintList(); paintPair(); if (G && !reduced) G.from(dd, { opacity: 0, y: -6, scale: .98, transformOrigin: '80% 0', duration: .22 }); }
    function closeDD() { if (!dd) return; dd.remove(); dd = null; mx.setAttribute('aria-expanded', 'false'); preview = null; paintDoc(); }
    mx.addEventListener('click', e => { e.stopPropagation(); openDD(); }); desk.addEventListener('click', e => { const p = e.composedPath();  });
    function paintList() { if (!dd) return; dd.querySelectorAll('.fo-ch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.c === cat))); ls.textContent = ''; FONTS.filter(f => (cat === 'all' || f.c === cat) && (!q || f.n.toLowerCase().includes(q) || f.c.includes(q))).forEach(f => {
        const r = el('div', 'fo-row' + (f === focusF ? ' on' : '')), m = el('div'), smp = el('p', 'smp', f.c === 'mono' ? 'fn draw(g) {}' : f.c === 'display' ? 'BIG IDEAS' : 'Hamburgefonts'), ins = el('button', 'fo-ins' + (f.inst ? ' done' : '')), pin = el('button', 'fo-pin', '📌'); r.setAttribute('role', 'listitem'); smp.style.fontFamily = fam(f); smp.style.fontWeight = f.w; m.append(smp, el('small', null, f.n + ' · ' + f.d));
        ins.type = pin.type = 'button'; ins.append(el('i'), el('span', null, f.inst ? 'Installed' : 'Install')); ins.setAttribute('aria-label', (f.inst ? 'Use ' : 'Install ') + f.n); pin.setAttribute('aria-pressed', String(pins.includes(f))); pin.setAttribute('aria-label', 'Pin ' + f.n + ' to compare');
        r.addEventListener('mouseenter', () => { preview = f; focusF = f; paintDoc(); check('preview'); paintPair(); ls.querySelectorAll('.fo-row').forEach(x => x.classList.toggle('on', x === r)); });
        ins.addEventListener('click', () => { if (f.inst) { apply(f); return; } install(f, ins, () => apply(f)); }); pin.addEventListener('click', () => togglePin(f)); r.append(m, pin, ins); ls.append(r); }); }
    function install(f, btn, cb) { if (f.busy) return; f.busy = true; const bar2 = btn ? btn.querySelector('i') : null, lb = btn ? btn.querySelector('span') : null; if (lb) lb.textContent = '0%'; let p = 0; const t = setInterval(() => { p = Math.min(1, p + .09); if (bar2) bar2.style.width = (p * 100) + '%'; if (lb) lb.textContent = Math.round(p * 100) + '%'; if (p >= 1) { clearInterval(t); f.inst = true; f.busy = false; check('install'); tone(880, .05); setTimeout(() => tone(1320, .06), 80); say(f.n + ' installed · available in every app'); paintList(); paintPair(); if (cb) cb(); } }, reduced ? 10 : 45); }
    function apply(f) { if (role === 'h') head = f; else bodyF = f; preview = null; tone(620, .03); paintDoc(); say((role === 'h' ? 'Headline' : 'Body') + ' set in ' + f.n); }
    function togglePin(f) { const i = pins.indexOf(f); if (i >= 0) pins.splice(i, 1); else { if (pins.length >= 3) pins.shift(); pins.push(f); } if (pins.length >= 3) check('compare'); tone(i >= 0 ? 420 : 760, .03); paintList(); paintDoc(); }
    function paintPair() { if (!prB) return; prB.textContent = ''; const a = focusF, b = byN(PAIRS[a.n]), h4 = el('h4'), pp = el('div', 'pp'), d = el('div'), hb = el('b', null, a.n), bs = el('span', null, 'with ' + b.n + ' for body text'), go = el('button', null, 'Apply pair'); h4.append(el('span', null, 'Pairs well'), el('span', null, a.c + ' + ' + b.c)); hb.style.fontFamily = fam(a); hb.style.fontWeight = a.w; bs.style.fontFamily = fam(b); d.append(hb, bs); go.type = 'button';
      go.addEventListener('click', () => { const need = [a, b].filter(f => !f.inst), done = () => { head = a; bodyF = b; preview = null; check('pair'); paintDoc(); say('Applied ' + a.n + ' + ' + b.n); if (G && !reduced) G.fromTo(pg, { scale: .985 }, { scale: 1, duration: .4, ease: 'back.out(2)' }); }; if (!need.length) done(); else { let n = need.length; need.forEach(f => install(f, null, () => { if (--n === 0) done(); })); say('Installing ' + need.map(f => f.n).join(' and ') + '…'); } }); pp.append(d, go); prB.append(h4, pp); }
    H.jump = (k, fs) => { if (fs) return; if (k === 'menu') { if (!dd) openDD(); } else if (k === 'pair') { if (!dd) openDD(); const b = prB && prB.querySelector('button'); if (b) b.click(); } else if (k === 'compare') { ['Playfair Display', 'Bebas Neue', 'Caveat'].forEach(n => { const f = byN(n); if (!pins.includes(f)) togglePin(f); }); } };
    paintDoc();
    setTimeout(() => { if (!dd) openDD(true); }, 900);
  }
  demo(H.app, H);
  H.boot();
})();
