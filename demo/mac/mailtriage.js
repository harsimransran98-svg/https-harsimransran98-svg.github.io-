/* MailTriage — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- MailTriage ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say, desk, extra, win } = H;
    const MAIL = [['The Verge', 'news', 'Vergecast: the phones that folded', 'This week we tried every foldable and only one survived the pocket test.', '#E0217A'], ['Priya Shah', 'person', 'Onboarding flow v3', 'Left a few comments on the second screen. Can we talk before Friday?', '#3D5AFE'], ['GitHub', 'notif', '[bazozo/site] PR #482 merged', 'jonah merged 3 commits into main from fix/lazy-images.', '#24292F'],
      ['Morning Brew', 'news', 'Coffee prices are doing something weird', 'Plus: the startup selling sunlight and why your rent went up again.', '#C27C2C'], ['Uber Receipts', 'receipt', 'Your Thursday evening trip', '£14.20 · Shoreditch to Hackney · Thank you for riding.', '#111111'], ['Sam Okafor', 'person', 'lunch tomorrow?', 'That noodle place opened a second branch near the canal 🍜', '#00A87E'],
      ['Figma', 'notif', 'You were mentioned in Homepage v2', '@alex can you check the hero spacing on mobile?', '#F24E1E'], ['Substack', 'news', 'New post from Design Notes', 'Why every dashboard looks the same, and how to escape it.', '#FF6719'], ['Lisbon Tiles Co.', 'receipt', 'Booking confirmed: Tile workshop', 'Saturday 10 May, 10:00 · 2 people · Rua da Madalena 41.', '#2F6FAE'],
      ['Calendar', 'notif', 'Invitation: Design review', 'Thursday 15:00–15:45 · Room 3 · Priya Shah has invited you.', '#E5484D'], ['Dense Discovery', 'news', 'Issue 291', 'Tools, books and things worth your attention this week.', '#6E56CF'], ['Mum', 'person', 'Sunday?', 'Are you coming for lunch on Sunday? Bring the good bread.', '#D6409F']].map(([from, cat, subj, body, c], i) => ({ id: i, from, cat, subj, body, c, at: ['08:12', '08:40', '09:02', '09:15', 'Yesterday', 'Yesterday', '10:31', '07:55', 'Mon', '11:02', '06:30', '11:20'][i] }));
    let inbox = MAIL.slice(), later = 0, archived = 0, deleted = 0, replied = 0, log = [], t0 = 0, rules = new Set(), catCount = {}, offered = new Set();
    const CATL = { news: 'Newsletter', person: 'Person', notif: 'Notification', receipt: 'Receipt' };
    /* ---- Mail window ---- */
    const ttl = win.querySelector('.ttl'); if (ttl) ttl.textContent = 'Inbox — Mail';
    const root = el('div', 'mt'), mb = el('nav', 'mt-mb'), ls = el('section', 'mt-ls'); root.append(mb, ls); app.append(root);
    function paintMail() { mb.textContent = ''; mb.append(el('small', null, 'Mailboxes')); [['Inbox', inbox.length, true], ['Later', later], ['Archive', 1284 + archived], ['Trash', deleted]].forEach(([n, c, on]) => { const d = el('div', on ? 'on' : null); d.append(el('span', null, n), el('b', null, String(c))); mb.append(d); });
      ls.textContent = ''; const hd = el('div', 'mt-hd'); hd.append(el('b', null, 'Inbox'), el('span', null, inbox.length + ' messages')); ls.append(hd);
      if (!inbox.length) { const e = el('div', 'mt-emp'); e.append(el('b', null, 'Inbox zero'), document.createTextNode('Nothing left. Go outside.')); ls.append(e); return; }
      inbox.forEach((m, i) => { const r = el('div', 'mt-it' + (i === 0 && dk ? ' cur' : '')); r.dataset.id = m.id; r.append(el('i'), el('b', null, m.from), el('span', null, m.at), el('p', null, m.subj + ' — ' + m.body)); ls.append(r); }); }
    /* ---- menu-bar extra ---- */
    const mx = el('button', 'mt-mx'), mxb = el('b'); mx.type = 'button'; mx.append('✉', mxb); mx.setAttribute('aria-haspopup', 'true'); mx.setAttribute('aria-expanded', 'false'); extra.append(mx);
    let dk = null, R = {};
    function openDk(auto) { if (dk) { closeDk(); return; } if (!auto) check('menu'); if (!t0) t0 = performance.now(); dk = el('div', 'mt-dk'); dk.setAttribute('role', 'dialog'); dk.setAttribute('aria-label', 'MailTriage deck'); dk.tabIndex = -1; const r = mx.getBoundingClientRect(), dr = desk.getBoundingClientRect(), sc = dr.width / 1200; dk.style.left = Math.max(770, Math.min(1200 - 412, (r.left - dr.left) / sc - 300)) + 'px';
      desk.append(dk); mx.setAttribute('aria-expanded', 'true'); paintDk(); dk.focus(); if (G && !reduced) G.from(dk, { opacity: 0, y: -8, scale: .97, transformOrigin: '80% 0', duration: .25 }); paintMail(); }
    function closeDk() { if (!dk) return; dk.remove(); dk = null; mx.setAttribute('aria-expanded', 'false'); paintMail(); }
    mx.addEventListener('click', e => { e.stopPropagation(); openDk(); }); desk.addEventListener('click', e => { const p = e.composedPath();  });
    function paintDk() { if (!dk) return; dk.textContent = ''; const dh = el('div', 'mt-dh'); dh.append(el('b', null, inbox.length ? 'Triage · ' + inbox.length + ' left' : 'Inbox zero'), el('span', null, Math.round(perf()) + ' s')); const pg = el('div', 'mt-pg'), pi = el('i'); pi.style.width = ((MAIL.length - inbox.length) / MAIL.length * 100) + '%'; pg.append(pi); dk.append(dh, pg);
      if (!inbox.length) { zero(); return; }
      const stk = el('div', 'mt-stk'); inbox.slice(0, 3).reverse().forEach((m, k, arr) => { const depth = arr.length - 1 - k, c = el('div', 'mt-cd' + (depth ? ' b' + depth : '')), hd = el('header'), av = el('span', 'av', m.from[0]), w = el('div'); av.style.setProperty('--c', m.c); w.append(el('b', null, m.from), el('span', null, m.at)); hd.append(av, w);
        c.append(hd, el('h3', null, m.subj), el('p', null, m.body), el('span', 'tg', CATL[m.cat]), el('span', 'mt-st ar', 'Archive'), el('span', 'mt-st dl', 'Delete'), el('span', 'mt-st sn', 'Later')); if (!depth) { c.setAttribute('role', 'article'); c.setAttribute('aria-label', m.from + ': ' + m.subj); drag(c, m); R.card = c; } stk.append(c); }); dk.append(stk);
      const acts = el('div', 'mt-acts'); [['kd', 'Delete', 'D', 'del'], ['ks', 'Later', 'S', 'later'], ['kr', 'Reply', 'R', 'reply'], ['ka', 'Archive', 'A', 'arch']].forEach(([cls, l, k, act]) => { const b = el('button', cls); b.type = 'button'; b.append(el('span', null, l), el('kbd', null, k)); b.setAttribute('aria-label', l + ' (' + k + ')'); b.addEventListener('click', () => doAct(act)); acts.append(b); }); dk.append(acts);
      const ft = el('div', 'mt-ft'), un = el('button', null, '↶ Undo'); un.type = 'button'; un.disabled = !log.length; un.addEventListener('click', undo); ft.append(el('span', null, '← delete · → archive · ↑ later'), un); dk.append(ft); R.sub = null; offerRule(); }
    const perf = () => t0 ? (performance.now() - t0) / 1000 : 0;
    /* drag physics */
    function drag(c, m) { let x0 = 0, y0 = 0, dx = 0, dy = 0, on = false; const stA = c.querySelector('.ar'), stD = c.querySelector('.dl'), stS = c.querySelector('.sn');
      c.addEventListener('pointerdown', e => { on = true; x0 = e.clientX; y0 = e.clientY; dx = dy = 0; try { c.setPointerCapture(e.pointerId); } catch (x) {} c.style.transition = 'none'; });
      c.addEventListener('pointermove', e => { if (!on) return; const sc = desk.getBoundingClientRect().width / 1200; dx = (e.clientX - x0) / sc; dy = (e.clientY - y0) / sc; c.style.transform = 'translate(' + dx + 'px,' + Math.min(0, dy) * .9 + 'px) rotate(' + dx / 18 + 'deg)'; stA.style.opacity = Math.max(0, Math.min(1, dx / 90)); stD.style.opacity = Math.max(0, Math.min(1, -dx / 90)); stS.style.opacity = Math.max(0, Math.min(1, -dy / 80 - Math.abs(dx) / 200)); });
      const end = () => { if (!on) return; on = false; c.style.transition = 'transform .35s cubic-bezier(.34,1.56,.64,1)'; if (dx > 110) { check('swipe'); doAct('arch', dx); } else if (dx < -110) { check('swipe'); doAct('del', dx); } else if (dy < -90) { check('swipe'); doAct('later'); } else { c.style.transform = ''; [stA, stD, stS].forEach(s2 => { s2.style.opacity = 0; }); } };
      c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end); }
    function fly(act) { const c = R.card; if (!c) return; c.style.transition = 'transform .32s ease-in, opacity .32s ease-in'; c.style.transform = act === 'arch' ? 'translate(520px,-40px) rotate(24deg)' : act === 'del' ? 'translate(-520px,-40px) rotate(-24deg)' : 'translate(0,-380px) scale(.8)'; c.style.opacity = '0'; c.style.pointerEvents = 'none'; }
    function doAct(act, viaDrag) { if (!inbox.length) return; const m = inbox[0]; if (act === 'reply') { replyBox(m); return; } if (act === 'later' && !viaDrag && !R.sub) { snoozeBox(m); return; } commit(m, act); }
    function commit(m, act, extra2) { fly(act); const row = ls.querySelector('[data-id="' + m.id + '"]'); if (row) row.classList.add('out'); tone(act === 'arch' ? 880 : act === 'del' ? 330 : act === 'reply' ? 990 : 660, .04); haptic(6);
      setTimeout(() => { inbox = inbox.filter(x => x !== m); log.push([m, act]); if (act === 'arch') archived++; else if (act === 'del') deleted++; else if (act === 'later') later++; else replied++; catCount[m.cat] = (catCount[m.cat] || 0) + (act === 'arch' || act === 'del' ? 1 : 0); paintBadge(); paintMail(); paintDk(); if (!inbox.length) { check('zero'); tone(523, .06); setTimeout(() => tone(659, .06), 110); setTimeout(() => tone(784, .1), 220); } }, reduced ? 0 : 300);
      if (extra2) say(extra2); }
    function undo() { const last = log.pop(); if (!last) return; const [m, act] = last; inbox.unshift(m); if (act === 'arch') archived--; else if (act === 'del') deleted--; else if (act === 'later') later--; else replied--; if (act === 'arch' || act === 'del') catCount[m.cat]--; tone(500, .04); say('Undone: ' + m.subj); paintBadge(); paintMail(); paintDk(); }
    function snoozeBox(m) { const b = el('div', 'mt-sub'), ch = el('div', 'mt-chips'); b.append(el('p', null, 'Bring it back…')); [['Later today', '18:00'], ['Tomorrow', '08:00'], ['This weekend', 'Sat 09:00'], ['Next week', 'Mon 08:00']].forEach(([l, t]) => { const x = el('button', null, l); x.type = 'button'; x.addEventListener('click', () => commit(m, 'later', 'Snoozed until ' + t)); ch.append(x); }); b.append(ch); if (R.sub) R.sub.remove(); R.sub = b; dk.append(b); }
    function replyBox(m) { const b = el('div', 'mt-sub'), ch = el('div', 'mt-chips'), ta = el('textarea'), sn = el('button', 'send', 'Send & archive'); sn.type = 'button'; ta.maxLength = 500; ta.setAttribute('aria-label', 'Reply'); b.append(el('p', null, 'Quick reply to ' + m.from));
      const SR = m.cat === 'person' ? ['Sounds good!', 'Can we do Friday instead?', 'On it, will reply properly later.'] : ['Thanks, received.', 'Please remove me from this list.']; SR.forEach(t => { const x = el('button', null, t); x.type = 'button'; x.addEventListener('click', () => { ta.value = t; ta.focus(); }); ch.append(x); });
      sn.addEventListener('click', () => { commit(m, 'reply', 'Sent to ' + m.from + (ta.value ? ': “' + ta.value.slice(0, 40) + '”' : '')); }); b.append(ch, ta, sn); if (R.sub) R.sub.remove(); R.sub = b; dk.append(b); ta.focus(); }
    function offerRule() { const cat = Object.keys(catCount).find(c => catCount[c] >= 2 && !rules.has(c) && !offered.has(c) && inbox.some(m => m.cat === c)); if (!cat || !dk) return; const n = inbox.filter(m => m.cat === cat).length, r = el('div', 'mt-rule'), tx = el('span'), y = el('button', null, 'Always'), no = el('button', null, 'No');
      y.type = no.type = 'button'; tx.append(document.createTextNode('You cleared 2 ' + CATL[cat].toLowerCase() + 's. '), el('b', null, 'Auto-archive ' + CATL[cat].toLowerCase() + 's?'), document.createTextNode(' (' + n + ' waiting)')); r.append(tx, y, no); dk.append(r);
      y.addEventListener('click', () => { rules.add(cat); check('rule'); const hit = inbox.filter(m => m.cat === cat); hit.forEach(m => { const row = ls.querySelector('[data-id="' + m.id + '"]'); if (row) row.classList.add('out'); }); setTimeout(() => { inbox = inbox.filter(m => m.cat !== cat); archived += hit.length; hit.forEach(m => log.push([m, 'arch'])); paintBadge(); paintMail(); paintDk(); if (!inbox.length) check('zero'); }, 320); say('Rule created · ' + hit.length + ' archived now, future ones skip the inbox'); tone(880, .05); setTimeout(() => tone(1175, .07), 90); });
      no.addEventListener('click', () => { offered.add(cat); r.remove(); }); }
    function zero() { const z = el('div', 'mt-zero'), sv = svgEl('svg', { viewBox: '0 0 120 120', 'aria-hidden': 'true' }); sv.append(svgEl('circle', { cx: 60, cy: 60, r: 50, fill: '#E3F7F0' }), svgEl('path', { d: 'M38 62 l14 14 l30 -32', fill: 'none', stroke: '#00A87E', 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; sv.append(svgEl('circle', { cx: 60 + Math.cos(a) * 56, cy: 60 + Math.sin(a) * 56, r: 2.5, fill: ['#3D5AFE', '#00A87E', '#F2A300', '#E5484D'][i % 4] })); }
      const gr = el('div', 'gr'); [[archived, 'archived'], [later, 'snoozed'], [replied, 'replied'], [deleted, 'deleted']].forEach(([n, l]) => { const d = el('div'); d.append(el('b', null, String(n)), el('span', null, l)); gr.append(d); }); z.append(sv, el('b', null, 'Inbox zero'), el('p', null, MAIL.length + ' emails in ' + Math.round(perf()) + ' s · ' + (perf() / MAIL.length).toFixed(1) + ' s each'), gr);
      const un = el('button', null, '↶ Undo last'); un.type = 'button'; un.style.cssText = 'margin-top:10px;height:28px;padding:0 12px;border-radius:8px;font-weight:600;font-size:12px;color:#3D5AFE'; un.addEventListener('click', undo); z.append(un); dk.append(z); if (G && !reduced) G.from(sv, { scale: .3, rotation: -40, duration: .6, ease: 'back.out(2)' }); }
    desk.addEventListener('keydown', e => { if (!dk || e.target.tagName === 'TEXTAREA') return; const k = e.key.toLowerCase(), map = { a: 'arch', arrowright: 'arch', d: 'del', arrowleft: 'del', s: 'later', arrowup: 'later', r: 'reply' }; if ((e.metaKey || e.ctrlKey) && k === 'z') { e.preventDefault(); undo(); return; } if (map[k]) { e.preventDefault(); check('keys'); doAct(map[k]); } });
    function paintBadge() { mxb.textContent = inbox.length ? String(inbox.length) : ''; mx.setAttribute('aria-label', 'MailTriage, ' + inbox.length + ' in inbox'); }
    H.jump = (k, fs) => { if (fs) return; if (k === 'menu') { if (!dk) openDk(); } else if (k === 'rule') { if (!dk) openDk(); if (!catCount.news || catCount.news < 2) { const ns = inbox.filter(m => m.cat === 'news').slice(0, 2 - (catCount.news || 0)); ns.forEach(m => { inbox = inbox.filter(x => x !== m); inbox.unshift(m); }); say('Archive two newsletters and a rule appears'); paintDk(); } } else if (k === 'zero') { if (!dk) openDk(); } };
    paintBadge(); paintMail();
    setTimeout(() => { if (!dk) openDk(true); }, 900);
  }
  demo(H.app, H);
  H.boot();
})();
