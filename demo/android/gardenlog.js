/* GardenLog — Android app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- GardenLog ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const M = {"key":"gl_state_v1","plants":[{"k":"monty","n":"Monty","sp":"Monstera","kind":"monstera","room":"Living room","every":7,"last":6,"c":"#3F7D3A"},{"k":"sage","n":"Sage","sp":"Sweet basil","kind":"basil","room":"Kitchen","every":2,"last":2,"c":"#5FA052"},{"k":"stan","n":"Stan","sp":"Snake plant","kind":"snake","room":"Bedroom","every":14,"last":3,"c":"#4E7D52"},{"k":"fern","n":"Fernando","sp":"Boston fern","kind":"fern","room":"Bathroom","every":3,"last":4,"c":"#6A9B4E"}],"notes":["Repotted, a bit droopy","First new leaf!","Moved closer to the window","Two new shoots","Fed with half-strength feed","Looking lush"]};
    const plants = M.plants.map(p => ({ ...p, photos: [.18, .3, .42, .55, .7, .84].map((g, i) => ({ g: Math.min(1, g + (p.k.length % 3) * .03), note: M.notes[(i + p.k.length) % M.notes.length], wk: i + 1 })) }));
    let sel = plants[0], room = 'All', wk = 5;
    const tasks = [];
    const thirst = p => Math.max(0, p.every - p.last), ringCol = p => thirst(p) === 0 ? '#D9534F' : thirst(p) <= 1 ? '#E39A2F' : '#3F7D3A';

    /* ---- procedural plant drawing ---- */
    function plant(p, g) {
      const sv = svgEl('svg', { viewBox: '0 0 200 160', class: 'pl', 'aria-hidden': 'true' }), base = 128, stemH = 20 + g * 80, n = Math.round(2 + g * 9), leaf = p.c;
      sv.append(svgEl('ellipse', { cx: 100, cy: 152, rx: 46, ry: 5, fill: 'rgba(0,0,0,.08)' }), svgEl('path', { d: 'M72 124 L128 124 L122 152 L78 152 Z', fill: '#C9764B' }), svgEl('rect', { x: 68, y: 118, width: 64, height: 10, rx: 3, fill: '#B3623A' }));
      const lv = (x, y, a, len, w, col) => { const e = svgEl('path', { d: 'M0 0 C' + (w) + ' ' + (-len * .3) + ' ' + (w * .6) + ' ' + (-len * .9) + ' 0 ' + (-len) + ' C' + (-w * .6) + ' ' + (-len * .9) + ' ' + (-w) + ' ' + (-len * .3) + ' 0 0Z', fill: col, transform: 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + a.toFixed(1) + ')' }); sv.append(e); return e; };
      if (p.kind === 'snake') { for (let i = 0; i < n; i++) { const x = 84 + (i / Math.max(1, n - 1)) * 32, h = 30 + g * 70 * (0.6 + .4 * Math.sin(i * 1.7) ** 2); lv(x, base, (i - n / 2) * 4, h, 7, i % 2 ? '#4E7D52' : '#6B9A5C'); } return sv; }
      if (p.kind === 'fern') { for (let i = 0; i < n + 3; i++) { const a = -70 + (i / (n + 2)) * 140, len = 30 + g * 50; const fr = svgEl('g', { transform: 'translate(100 ' + base + ') rotate(' + a.toFixed(1) + ')' }); fr.append(svgEl('path', { d: 'M0 0 Q 6 ' + (-len * .5) + ' 0 ' + (-len), stroke: '#5C8A44', 'stroke-width': 2, fill: 'none' }));
          for (let j = 1; j < 8; j++) { const y = -len * j / 8; [-1, 1].forEach(sd => fr.append(svgEl('ellipse', { cx: sd * (7 - j * .5), cy: y, rx: 6 - j * .5, ry: 2.2, fill: '#6A9B4E', transform: 'rotate(' + (sd * 25) + ' ' + (sd * (7 - j * .5)) + ' ' + y + ')' }))); } sv.append(fr); } return sv; }
      sv.append(svgEl('path', { d: 'M100 ' + base + ' C 96 ' + (base - stemH * .5) + ' 104 ' + (base - stemH * .7) + ' 100 ' + (base - stemH), stroke: '#4F7A3A', 'stroke-width': 3, fill: 'none' }));
      for (let i = 0; i < n; i++) { const t = (i + 1) / n, y = base - stemH * t, sd = i % 2 ? 1 : -1, big = p.kind === 'monstera', len = (big ? 34 : 16) * (0.6 + g * .6) * (1 - t * .25), w = big ? len * .75 : len * .55;
        const e = lv(100, y, sd * (big ? 55 : 48) + (Math.sin(i) * 8), len, w, i % 3 ? leaf : '#2F6B2B');
        if (big && len > 26) sv.append(svgEl('path', { d: 'M0 ' + (-len * .4) + ' L ' + (w * .7) + ' ' + (-len * .5) + ' M0 ' + (-len * .65) + ' L ' + (w * .55) + ' ' + (-len * .75), stroke: '#F7F9F2', 'stroke-width': 2.5, transform: e.getAttribute('transform') })); }
      return sv;
    }
    const ring = p => { const r = el('div', 'gl-ring'), sv = svgEl('svg', { viewBox: '0 0 42 42', 'aria-hidden': 'true' }), C = 2 * Math.PI * 17, f = thirst(p) / p.every;
      sv.append(svgEl('circle', { cx: 21, cy: 21, r: 17, class: 't' }), svgEl('circle', { cx: 21, cy: 21, r: 17, class: 'a', 'stroke-dasharray': C.toFixed(1), 'stroke-dashoffset': (C * (1 - f)).toFixed(1) })); r.style.setProperty('--rc', ringCol(p)); r.append(sv, el('span', null, thirst(p) + 'd')); return r; };

    /* ---- shell ---- */
    const root = el('div', 'gl'), V = {}; ['garden', 'plant', 'today'].forEach(k => { V[k] = el('section', 'gl-v'); V[k].setAttribute('aria-label', k); if (k !== 'garden') V[k].hidden = true; root.append(V[k]); });
    const nav = el('nav', 'gl-nav'); [['garden', '🪴', 'Garden'], ['plant', '📷', 'Timeline'], ['today', '💧', 'Today']].forEach(([k, ic, t]) => { const b = el('button'); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', t); b.append(el('span', null, ic), el('em', null, t)); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(nav); app.append(root); let cur = 'garden';
    function go(k) { if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k)));
      if (k === 'plant') renderPlant(); if (k === 'today') renderToday(); if (k === 'garden') renderGarden();
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .12, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; haptic(5); }
    H.jump = go;
    const head = (v, small, title) => { const h = el('div', 'gl-h'); h.append(el('small', null, small), el('h2', null, title)); v.append(h); };

    /* ---- garden ---- */
    function renderGarden() { const v = V.garden; v.textContent = ''; head(v, plants.filter(p => !thirst(p)).length + ' thirsty today', 'My garden');
      const rooms = el('div', 'gl-rooms'); ['All', ...new Set(plants.map(p => p.room))].forEach(r => { const b = el('button', null, r); b.type = 'button'; b.setAttribute('aria-pressed', String(r === room)); b.addEventListener('click', () => { room = r; if (r !== 'All') check('room'); renderGarden(); }); rooms.append(b); }); v.append(rooms);
      const grid = el('div', 'gl-grid'); plants.filter(p => room === 'All' || p.room === room).forEach(p => { const c = el('button', 'gl-card'); c.type = 'button'; c.setAttribute('aria-label', p.n + ', ' + p.sp + ', ' + (thirst(p) ? 'water in ' + thirst(p) + ' days' : 'needs water now'));
        c.append(plant(p, p.photos[5].g), ring(p)); if (!thirst(p)) c.append(el('span', 'gl-due', 'THIRSTY')); c.append(el('b', null, p.n), el('small', null, p.sp + ' · ' + p.room)); c.addEventListener('click', () => { sel = p; wk = 5; go('plant'); }); grid.append(c); });
      v.append(grid); if (G) G.from(grid.children, { y: 16, opacity: 0, duration: .45, stagger: .05, ease: 'back.out(1.6)' }); }

    /* ---- plant detail with growth scrubber ---- */
    let stage, scrub, noteEl, wkEl;
    function renderPlant() { const v = V.plant, p = sel; v.textContent = ''; const back = el('button', 'gl-back', '← Garden'); back.type = 'button'; back.addEventListener('click', () => go('garden')); v.append(back); head(v, p.sp + ' · ' + p.room, p.n);
      stage = el('div', 'gl-stage'); wkEl = el('span', 'wk'); stage.append(plant(p, p.photos[wk].g), wkEl, el('i', 'flash')); v.append(stage);
      const sc = el('div', 'gl-scrub'); scrub = el('input'); scrub.type = 'range'; scrub.min = 0; scrub.max = p.photos.length - 1; scrub.step = .01; scrub.value = wk; scrub.setAttribute('aria-label', 'Growth timeline, week');
      const ticks = el('div', 'gl-ticks'); p.photos.forEach(ph => ticks.append(el('span', null, 'wk' + ph.wk))); sc.append(scrub, ticks); noteEl = el('div', 'gl-note'); v.append(sc, noteEl);
      scrub.addEventListener('input', () => { const f = +scrub.value, i = Math.floor(f), t = f - i, a = p.photos[i], b = p.photos[Math.min(p.photos.length - 1, i + 1)]; paintStage(a.g + (b.g - a.g) * t, Math.round(f)); check('scrub'); });
      scrub.addEventListener('change', () => { tone(500 + +scrub.value * 60, .04); });
      const acts = el('div', 'gl-acts'); [['w', '💧', 'Water', water], ['', '🌱', 'Feed', () => { say('Fed ' + p.n + ' · next feed in 4 weeks'); tone(660, .06); }], ['', '📷', 'Photo', photo]].forEach(([cls, ic, t, f]) => { const b = el('button', cls); b.type = 'button'; b.append(el('span', null, ic), document.createTextNode(t)); b.addEventListener('click', e => f(b)); acts.append(b); });
      v.append(acts); paintStage(p.photos[wk].g, wk); }
    function paintStage(g, i) { const old = stage.querySelector('svg.pl'); old.replaceWith(plant(sel, g)); const ph = sel.photos[Math.min(sel.photos.length - 1, i)]; wkEl.textContent = 'week ' + ph.wk + ' · growth ' + Math.round(g * 100) + '%'; scrub.style.setProperty('--p', (scrub.value / scrub.max * 100) + '%');
      noteEl.textContent = ''; noteEl.append(el('b', null, 'Week ' + ph.wk + ' note'), document.createTextNode(ph.note)); }
    function water(btnEl) { const p = sel, r = btnEl.getBoundingClientRect(), o = root.getBoundingClientRect();
      if (G && !reduced) for (let i = 0; i < 9; i++) { const d = el('i', 'gl-drop'); d.style.left = (r.left - o.left + r.width / 2 + (Math.random() - .5) * 40) + 'px'; d.style.top = (r.top - o.top) + 'px'; root.append(d); G.to(d, { y: -140 - Math.random() * 80, x: (Math.random() - .5) * 60, opacity: 0, duration: .9, delay: i * .04, ease: 'power2.out', onComplete: () => d.remove() }); }
      const was = thirst(p); p.last = 0; check('water'); tone(520, .08); setTimeout(() => tone(780, .08), 90); say(was ? p.n + ' watered early · next in ' + p.every + ' days' : p.n + ' watered · next in ' + p.every + ' days'); haptic(15); }
    function photo() { const p = sel, last = p.photos[p.photos.length - 1], ng = Math.min(1, last.g + .08); p.photos.push({ g: ng, note: 'New photo · ' + new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), wk: last.wk + 1 });
      if (G && !reduced) G.fromTo(stage.querySelector('.flash'), { opacity: .95 }, { opacity: 0, duration: .5 }); tone(1500, .03, 'square', .03);
      wk = p.photos.length - 1; scrub.max = wk; scrub.value = wk; const ticks = scrub.parentNode.querySelector('.gl-ticks'); ticks.append(el('span', null, 'wk' + (last.wk + 1))); paintStage(ng, wk); check('photo'); say('Photo saved to ' + p.n + '’s timeline'); }

    /* ---- today ---- */
    function renderToday() { const v = V.today; v.textContent = ''; head(v, new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }), 'Today');
      if (!tasks.length) plants.forEach(p => { if (thirst(p) <= 1) tasks.push({ p, t: 'Water ' + p.n, sub: p.sp + ' · ' + (thirst(p) ? 'due tomorrow' : 'due today'), ic: '💧', done: false }); }), tasks.push({ p: plants[0], t: 'Wipe Monty’s leaves', sub: 'Monthly · keeps them glossy', ic: '🧽', done: false }, { p: plants[1], t: 'Pinch Sage’s flower buds', sub: 'Basil grows bushier', ic: '✂️', done: false });
      tasks.forEach(tk => { const b = el('button', 'gl-task' + (tk.done ? ' done' : '')), p = el('p'); b.type = 'button'; b.setAttribute('aria-pressed', String(tk.done)); p.append(el('b', null, tk.t), document.createTextNode(tk.sub)); b.append(el('i', null, tk.done ? '✓' : ''), p, el('em', null, tk.ic));
        b.addEventListener('click', () => { tk.done = !tk.done; if (tk.done) { check('task'); if (tk.t.startsWith('Water')) tk.p.last = 0; tone(740, .06); } renderToday(); }); v.append(b); }); }

    nav.querySelector('[data-v="garden"]').setAttribute('aria-selected', 'true'); renderGarden();
  }
  demo(H.app, H);
  H.boot();
})();
