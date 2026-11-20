/* Driftlist — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "poster";
/* ---------- Driftlist ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const M = {"key":"dl_state_v1","tasks":[["Call the dentist",0,"Health"],["Send invoice to Mara",0,"Work"],["Water the plants",1,"Home"],["Book train to Leeds",2,"Travel"],["Return library books",4,"Errands"],["Sort photo backup",7,"Home"]]};
    let tasks = M.tasks.map(([t, age, tag], i) => ({ id: i, t, age, tag, done: false })), size = 'm', uid = 99, view = 'home';
    const root = el('div', 'dl'), wall = el('div', 'dl-wall'), home = el('div', 'dl-home'), dock = el('div', 'dl-dock'); root.append(wall, home, dock); app.append(root);
    [['#34C759', '#30B0C7'], ['#5856D6', '#AF52DE'], ['#FF9500', '#FF2D55'], ['#8E8E93', '#3A3A3C']].forEach(([a, b]) => { const i = el('i'); i.style.setProperty('--g', 'linear-gradient(135deg,' + a + ',' + b + ')'); dock.append(i); });
    const ICONS = [['Driftlist', '✓', 'linear-gradient(135deg,#8C6CFF,#6E4CF5)', 'app'], ['Photos', '🌸', 'linear-gradient(135deg,#fff,#F2F2F7)'], ['Maps', '🧭', 'linear-gradient(135deg,#A8E063,#56AB2F)'], ['Weather', '⛅', 'linear-gradient(135deg,#4FACFE,#00F2FE)'], ['Notes', '📝', 'linear-gradient(135deg,#FFE259,#FFA751)'], ['Music', '♪', 'linear-gradient(135deg,#FF5F6D,#FFC371)'], ['Wallet', '💳', 'linear-gradient(135deg,#232526,#414345)'], ['Settings', '⚙', 'linear-gradient(135deg,#BDC3C7,#2C3E50)']];
    const active = () => tasks.filter(t => !t.done).sort((a, b) => a.age - b.age);
    let editing = false, pressT = 0;
    function widget() {
      const w = el('div', 'dl-w ' + size + (editing ? ' edit' : '')), hd = el('div', 'dl-wh'), list = active(); w.setAttribute('role', 'group'); w.setAttribute('aria-label', 'Driftlist widget, ' + list.length + ' tasks. Press and hold to resize.');
      hd.append(el('b', null, 'Today'), el('span', null, String(list.length))); w.append(hd);
      const n = size === 's' ? 3 : size === 'm' ? 3 : 8; list.slice(0, n).forEach(t => { const r = el('button', 'dl-row' + (t.age > 2 ? ' old' : '')); r.type = 'button'; r.setAttribute('role', 'checkbox'); r.setAttribute('aria-checked', 'false'); r.setAttribute('aria-label', t.t);
        r.append(el('i'), el('span', null, t.t)); if (size !== 's' && t.age) r.append(el('em', null, t.age + 'd')); r.addEventListener('click', e => { e.stopPropagation(); if (editing) return; tick(t, r); }); w.append(r); });
      if (list.length > n) w.append(el('span', 'more', '+' + (list.length - n) + ' more'));
      if (!list.length) w.append(el('span', 'more', 'All clear. Enjoy the day ✨'));
      w.addEventListener('pointerdown', () => { clearTimeout(pressT); pressT = setTimeout(() => { editing = true; haptic(20); renderHome(); editBar(); }, 550); }); ['pointerup', 'pointerleave'].forEach(ev => w.addEventListener(ev, () => clearTimeout(pressT)));
      w.addEventListener('contextmenu', e => { e.preventDefault(); editing = true; renderHome(); editBar(); });
      return w; }
    function tick(t, r) { t.done = true; check('tick'); tone(880, .05); haptic(10); r.classList.add('done'); r.setAttribute('aria-checked', 'true');
      if (G && !reduced) { const o = root.getBoundingClientRect(), rr = r.getBoundingClientRect(), f = el('div', 'dl-fly', '✓ ' + t.t); f.style.left = (rr.left - o.left) + 'px'; f.style.top = (rr.top - o.top) + 'px'; root.append(f); G.to(f, { y: -120, x: 30, rotation: 8, opacity: 0, duration: 1.1, ease: 'power2.out', onComplete: () => f.remove() }); }
      setTimeout(renderHome, 450); }
    function renderHome() { home.textContent = ''; home.append(widget()); ICONS.forEach(([n, ic, g, act]) => { const b = el('button', 'dl-ic'), i = el('i', null, ic); b.type = 'button'; i.style.setProperty('--g', g); b.append(i, document.createTextNode(n)); b.setAttribute('aria-label', 'Open ' + n);
      b.addEventListener('click', () => { if (act) openApp(b); else say(n + ' is just for show in this demo'); }); home.append(b); }); }
    let ed = null;
    function editBar() { if (ed) ed.remove(); ed = el('div', 'dl-ed'); [['s', 'Small'], ['m', 'Medium'], ['l', 'Large']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.setAttribute('aria-pressed', String(k === size)); b.addEventListener('click', () => { size = k; check('size'); tone(600, .04); renderHome(); editBar(); }); ed.append(b); });
      const x = el('button', 'x', 'Done'); x.type = 'button'; x.style.width = '64px'; x.addEventListener('click', () => { editing = false; ed.remove(); ed = null; renderHome(); }); ed.append(x); root.append(ed); }
    H.extraEdit = () => { editing = true; renderHome(); editBar(); };

    /* ---- the app ---- */
    let appEl = null;
    function openApp(from) { if (appEl) return; check('open'); view = 'app'; appEl = el('div', 'dl-app'); appEl.setAttribute('role', 'dialog'); appEl.setAttribute('aria-label', 'Driftlist app'); root.append(appEl); renderApp();
      if (G && !reduced) { const r = (from || root).getBoundingClientRect(), o = root.getBoundingClientRect(); G.fromTo(appEl, { clipPath: 'inset(' + (r.top - o.top) + 'px ' + (o.right - r.right) + 'px ' + (o.bottom - r.bottom) + 'px ' + (r.left - o.left) + 'px round 15px)' }, { clipPath: 'inset(0px 0px 0px 0px round 48px)', duration: .5, ease: 'expo.out' }); } }
    function closeApp() { if (!appEl) return; const a = appEl; appEl = null; view = 'home'; if (G && !reduced) G.to(a, { scale: .4, opacity: 0, duration: .35, ease: 'power2.in', onComplete: () => a.remove() }); else a.remove(); renderHome(); }
    function renderApp() { const a = appEl; a.textContent = ''; const back = el('button', null, '‹ Home'); back.type = 'button'; back.style.cssText = 'height:30px;font-size:15px;color:#6E4CF5;font-weight:600'; back.addEventListener('click', closeApp);
      a.append(back, el('h2', null, 'Today'), el('small', null, active().length + ' to do · drifted tasks sink, then fade'));
      const f = el('form', 'dl-add'), inp = el('input'), b = el('button', null, '+'); inp.placeholder = 'Add a task'; inp.maxLength = 50; inp.setAttribute('aria-label', 'New task'); b.type = 'submit'; b.setAttribute('aria-label', 'Add task'); f.append(inp, b); a.append(f);
      f.addEventListener('submit', e => { e.preventDefault(); const t = inp.value.trim().slice(0, 50); if (!t) return; tasks.unshift({ id: uid++, t, age: 0, tag: 'Inbox', done: false }); check('add'); tone(760, .06); say('Added · it’s on your widget now'); renderApp(); });
      const groups = [['Today', x => x.age === 0], ['Drifting', x => x.age > 0 && x.age <= 3], ['Long drift', x => x.age > 3]];
      groups.forEach(([g, fn]) => { const list = tasks.filter(x => !x.done && fn(x)); if (!list.length) return; a.append(el('p', 'dl-sec', g)); list.forEach(t => { const r = el('button', 'dl-li'), p = el('p'); r.type = 'button'; r.setAttribute('role', 'checkbox'); r.setAttribute('aria-checked', 'false'); r.style.setProperty('--dx', Math.min(24, t.age * 3) + 'px'); r.style.opacity = String(Math.max(.45, 1 - t.age * .07));
        p.append(document.createTextNode(t.t), el('small', null, t.tag)); r.append(el('i'), p); if (t.age) r.append(el('span', 'dl-drift', '↓ ' + t.age + 'd'));
        r.addEventListener('click', () => { t.done = true; check('tick'); tone(880, .05); renderApp(); }); a.append(r); }); });
      const doneL = tasks.filter(x => x.done); if (doneL.length) { a.append(el('p', 'dl-sec', 'Done')); doneL.forEach(t => { const r = el('div', 'dl-li done'), p = el('p'); p.append(document.createTextNode(t.t)); r.append(el('i'), p); a.append(r); }); } }

    /* ---- lock screen ---- */
    let lockEl = null;
    function lock() { if (lockEl) return; if (appEl) closeApp(); check('lock'); lockEl = el('div', 'dl-lock'); const d = new Date(), acc = el('div', 'dl-acc'), a1 = el('div'), C = 2 * Math.PI * 18, list = active(), total = tasks.length, f = (total - list.length) / Math.max(1, total);
      const sv = svgEl('svg', { viewBox: '0 0 44 44', 'aria-hidden': 'true' }); sv.append(svgEl('circle', { cx: 22, cy: 22, r: 18, stroke: 'rgba(255,255,255,.25)' }), svgEl('circle', { cx: 22, cy: 22, r: 18, stroke: '#fff', 'stroke-dasharray': C.toFixed(1), 'stroke-dashoffset': (C * (1 - f)).toFixed(1), 'stroke-linecap': 'round' }));
      const tx = el('div'); tx.append(document.createTextNode(list.length + ' left'), el('small', null, list[0] ? 'Next: ' + list[0].t : 'All clear')); a1.append(sv, tx); acc.append(a1);
      const un = el('button', 'dl-unlock', 'Swipe up to unlock'); un.type = 'button'; un.addEventListener('click', () => { const l = lockEl; lockEl = null; if (G) G.to(l, { y: '-100%', duration: .45, ease: 'power3.in', onComplete: () => l.remove() }); else l.remove(); });
      lockEl.append(el('div', 'd', d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })), el('div', 't', d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0')), acc, un); root.append(lockEl); if (G && !reduced) G.from(lockEl, { y: '-100%', duration: .5, ease: 'expo.out' }); un.focus(); }
    H.jump = k => { if (k === 'app') openApp(); else if (k === 'lock') lock(); else if (k === 'edit') { if (lockEl) { lockEl.remove(); lockEl = null; } closeApp(); H.extraEdit(); } else { if (lockEl) { lockEl.remove(); lockEl = null; } closeApp(); } };
    renderHome();
  }
  demo(H.app, H);
  H.boot();
})();
