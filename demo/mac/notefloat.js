/* NoteFloat — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- NoteFloat ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say, desk, extra, win } = H;
    const COL = ['#FFE066', '#FFC9DE', '#B2F2BB', '#A5D8FF'];
    /* ---- window 1: code editor (frame window) ---- */
    const ttl = win.querySelector('.ttl'); if (ttl) ttl.textContent = 'ContentView.swift — Xcode';
    const code = el('div', 'nf-code'); [[['k', 'import'], ['', ' SwiftUI']], [], [['k', 'struct'], ['t', ' ContentView'], ['', ': '], ['t', 'View'], ['', ' {']], [['', '    '], ['k', '@State'], ['k', ' private var'], ['', ' notes: ['], ['t', 'Note'], ['', '] = []']], [], [['', '    '], ['k', 'var'], ['', ' body: '], ['k', 'some'], ['t', ' View'], ['', ' {']], [['', '        '], ['t', 'List'], ['', '(notes) { note '], ['k', 'in']], [['', '            '], ['t', 'Text'], ['', '(note.title)']], [['', '                .font(.'], ['t', 'headline'], ['', ')']], [['c', '            // TODO: swipe to delete']], [['', '        }']], [['', '        .navigationTitle('], ['s2', '"Notes"'], ['', ')']], [['', '    }']], [['', '}']]]
      .forEach((ln, i) => { const d = el('div', i === 9 ? 'hl' : null), c = el('span'); d.append(el('span', 'ln', String(i + 1)), c); ln.forEach(([k, t]) => c.append(k ? el('span', k, t) : document.createTextNode(t))); code.append(d); }); app.append(code);
    /* ---- window 2: browser ---- */
    const br = el('div', 'nf-br'), bt = el('div', 'nf-bt'), wl = el('span', 'nf-wl'); wl.append(el('i'), el('i'), el('i')); bt.append(wl, el('span', 'u', 'developer.apple.com/documentation/swiftui/list')); const bp = el('div', 'nf-bp'); bp.append(el('h2', null, 'List'), el('p', null, 'A container that presents rows of data arranged in a single column, optionally providing the ability to select one or more members.'), el('div', 'img'), el('p', null, 'Use onDelete(perform:) on a ForEach inside the list to enable swipe-to-delete.')); br.append(bt, bp); br.setAttribute('role', 'region'); br.setAttribute('aria-label', 'Safari window'); desk.append(br);
    /* ---- z-order: clicking a window raises it; unpinned notes fall behind ---- */
    let zTop = 24; const notes = [];
    function raiseWin(w) { [win, br].forEach(x => { x.style.zIndex = x === w ? 24 : 21; }); notes.forEach(n => { if (!n.pin) n.el.style.zIndex = 18; }); if (notes.some(n => n.pin)) check('pin'); }
    [win, br].forEach(w => w.addEventListener('pointerdown', () => raiseWin(w)));
    /* ---- notes ---- */
    function makeNote(o) { const n = Object.assign({ x: 80, y: 60, c: 0, title: 'Note', text: '', pin: false, fade: false }, o), e = el('section', 'nf-n'), hd = el('div', 'nf-nh'), tt = el('b'), sw = el('span', 'nf-sw'), pb = el('button', null, '📌'), fb = el('button', null, '◐'), mb = el('button', null, '–'), xb = el('button', null, '✕'), body = el('div', 'nf-nb');
      [pb, fb, mb, xb].forEach(b => { b.type = 'button'; }); pb.setAttribute('aria-label', 'Keep on top'); fb.setAttribute('aria-label', 'See-through'); mb.setAttribute('aria-label', 'Collapse'); xb.setAttribute('aria-label', 'Close note'); e.setAttribute('role', 'note');
      COL.forEach((c, i) => { const b = el('button'); b.type = 'button'; b.style.setProperty('--nc', c); b.setAttribute('aria-label', 'Colour ' + (i + 1)); b.addEventListener('click', () => { n.c = i; paint(); }); sw.append(b); }); hd.append(tt, sw, pb, fb, mb, xb); e.append(hd, body); desk.append(e); n.el = e; notes.push(n);
      const paint = () => { e.style.setProperty('--nc', COL[n.c]); e.style.left = n.x + 'px'; e.style.top = n.y + 'px'; e.classList.toggle('pin', n.pin); e.classList.toggle('fade', n.fade); pb.setAttribute('aria-pressed', String(n.pin)); fb.setAttribute('aria-pressed', String(n.fade)); tt.textContent = n.title; e.setAttribute('aria-label', 'Sticky note: ' + n.title + (n.pin ? ', pinned on top' : '')); };
      function render() { body.textContent = ''; const lines = n.text.split('\n'); lines.forEach((ln, i) => { const m = ln.match(/^- \[( |x)\] (.*)$/i); if (m) { const lb = el('label', m[1] !== ' ' ? 'dn' : null), cb = el('input'); cb.type = 'checkbox'; cb.checked = m[1] !== ' '; cb.addEventListener('change', () => { lines[i] = '- [' + (cb.checked ? 'x' : ' ') + '] ' + m[2]; n.text = lines.join('\n'); if (cb.checked) { check('check'); tone(1046, .04); } render(); }); lb.append(cb, el('span', null, m[2])); body.append(lb); } else body.append(el('p', null, ln.replace(/^- /, '• '))); }); }
      body.addEventListener('dblclick', () => edit()); function edit() { body.textContent = ''; const ta = el('textarea'); ta.value = n.text; ta.maxLength = 1500; ta.setAttribute('aria-label', 'Edit note ' + n.title); body.append(ta); ta.focus(); ta.addEventListener('blur', () => { n.text = ta.value; const first = n.text.split('\n')[0].replace(/^- \[.\] |^- /, '').trim(); if (first) n.title = first.slice(0, 26); paint(); render(); }); ta.addEventListener('keydown', ev => { if (ev.key === 'Escape') ta.blur(); }); }
      n.edit = edit; e.addEventListener('pointerdown', () => { e.style.zIndex = n.pin ? 30 : 25; });
      let sx = 0, sy = 0, ox = 0, oy = 0, moved = 0; hd.addEventListener('pointerdown', ev => { if (ev.target.closest('button')) return; const sc = desk.getBoundingClientRect().width / 1200; sx = ev.clientX; sy = ev.clientY; ox = n.x; oy = n.y; moved = 0; e.classList.add('drag'); try { hd.setPointerCapture(ev.pointerId); } catch (x) {} hd.onpointermove = m => { n.x = Math.max(-150, Math.min(1120, ox + (m.clientX - sx) / sc)); n.y = Math.max(28, Math.min(660, oy + (m.clientY - sy) / sc)); moved += 1; e.style.left = n.x + 'px'; e.style.top = n.y + 'px'; }; });
      const up = () => { hd.onpointermove = null; e.classList.remove('drag'); if (moved > 3) { const r = e.getBoundingClientRect(), ov = [win, br].some(w => { const q = w.getBoundingClientRect(); return r.left < q.right && r.right > q.left && r.top < q.bottom && r.bottom > q.top; }); if (ov) check('drag'); if (n.x > 960) { n.x = 1200 - e.offsetWidth - 12; e.style.left = n.x + 'px'; tone(900, .02); } } moved = 0; }; hd.addEventListener('pointerup', up); hd.addEventListener('pointercancel', up);
      hd.addEventListener('dblclick', ev => { if (!ev.target.closest('button')) { e.classList.toggle('min'); tone(500, .02); } });
      pb.addEventListener('click', () => { n.pin = !n.pin; e.style.zIndex = n.pin ? 30 : 25; tone(n.pin ? 880 : 500, .03); say(n.pin ? 'Pinned: stays above every window' : 'Unpinned: goes behind the window you click'); paint(); });
      fb.addEventListener('click', () => { n.fade = !n.fade; if (n.fade) { check('fade'); say('See-through: hover to bring it back'); } tone(640, .02); paint(); }); mb.addEventListener('click', () => e.classList.toggle('min'));
      xb.addEventListener('click', () => { const i = notes.indexOf(n); if (i >= 0) notes.splice(i, 1); if (G && !reduced) G.to(e, { scale: .7, opacity: 0, duration: .2, onComplete: () => e.remove() }); else e.remove(); });
      paint(); render(); e.style.zIndex = n.pin ? 30 : 25; return n; }
    makeNote({ x: 760, y: 70, c: 0, title: 'Ship list', text: 'Ship list\n- [x] List view\n- [ ] Swipe to delete\n- [ ] Empty state\n- [ ] App icon', pin: true });
    makeNote({ x: 640, y: 330, c: 1, title: 'Call Priya', text: 'Call Priya\nabout onboarding v3, before Friday' });
    makeNote({ x: 90, y: 80, c: 2, title: 'Shortcut', text: 'Shortcut\n⌘⇧O open quickly\n⌃⌥N new floating note' });
    function capture() { check('new'); const n = makeNote({ x: 470 + (notes.length % 4) * 26, y: 150 + (notes.length % 4) * 22, c: notes.length % 4, title: 'New note', text: '', pin: true }); if (G && !reduced) G.from(n.el, { scale: .6, opacity: 0, duration: .35, ease: 'back.out(2)' }); tone(1175, .04); n.edit(); say('New floating note · type, then click away'); }
    window.addEventListener('keydown', e => { if (e.ctrlKey && e.altKey && (e.key === 'n' || e.key === 'N' || e.code === 'KeyN')) { e.preventDefault(); capture(); } });
    const mx = el('button', 'nf-mx'); mx.type = 'button'; mx.append(el('i'), document.createTextNode('+')); mx.setAttribute('aria-label', 'New floating note (Control Option N)'); mx.addEventListener('click', e => { e.stopPropagation(); capture(); }); extra.append(mx);
    raiseWin(win);
    H.jump = (k, fs) => { if (fs) return; if (k === 'new') capture(); else if (k === 'pin') { raiseWin(br); say('Safari came forward · the pinned note stayed on top'); } else if (k === 'fade') { const n = notes[0]; if (n && !n.fade) n.el.querySelector('[aria-label="See-through"]').click(); } };
  }
  demo(H.app, H);
  H.boot();
})();
