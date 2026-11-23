/* Pulseline — doctor booking + live clinic queue. Static demo by Bazozo Studio.
   ?mode=patient → patient phone app, ?mode=clinic → clinic desktop (reception + doctor).
   Both share one localStorage "database" and update each other via the storage event.
   All user text is rendered with textContent / DOM nodes, never innerHTML. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = () => (window.gsap && !reduced ? window.gsap : null);
  const MODE = new URLSearchParams(location.search).get('mode') === 'clinic' ? 'clinic' : 'patient';
  const FRAMED = document.documentElement.classList.contains('framed');
  const DATA_KEY = 'pulseline.demo.v1', SESS_KEY = 'pulseline.session.v1.' + MODE;
  const uid = () => Math.random().toString(36).slice(2, 10);
  const rs = n => '₹' + Number(n).toLocaleString('en-IN');
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const TODAY = ymd(new Date());
  const dayOf = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const fmtDay = s => dayOf(s).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const fmtTime = t => { const [h, m] = t.split(':').map(Number); return (h % 12 || 12) + ':' + pad(m) + (h < 12 ? ' am' : ' pm'); };
  const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'now' : m < 60 ? m + 'm' : m < 1440 ? Math.floor(m / 60) + 'h' : Math.floor(m / 1440) + 'd'; };
  const initials = s => (String(s).replace(/^Dr\.?\s*/i, '').trim().split(/\s+/).map(w => (w.match(/[a-z0-9]/i) || [''])[0]).join('').slice(0, 2) || '?').toUpperCase();
  const SLOTS_AM = ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45'];
  const SLOTS_PM = ['17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45'];

  /* ---------- DOM helpers ---------- */
  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    if (props) for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'css') for (const p in v) n.style.setProperty(p, v[p]);
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)));
    return n;
  }
  const NS = 'http://www.w3.org/2000/svg';
  const ICONS = {
    home: ['M3 11l9-8 9 8', 'M5 10v10h14V10'], cal: ['M4 6h16v14H4z', 'M4 10h16', 'M8 3v4', 'M16 3v4'], plus: ['M12 5v14', 'M5 12h14'],
    file: ['M6 3h9l4 4v14H6z', 'M14 3v5h5', 'M9 13h6', 'M9 17h4'], bell: ['M6 16V11a6 6 0 0 1 12 0v5l2 2H4z', 'M10 20a2 2 0 0 0 4 0'],
    video: ['M3 7h12v10H3z', 'M15 10l6-3v10l-6-3'], clinic: ['M4 21V9l8-6 8 6v12', 'M9 21v-6h6v6', 'M12 7v4', 'M10 9h4'],
    pay: ['M3 6h18v12H3z', 'M3 10h18', 'M7 15h3'], x: ['M6 6l12 12', 'M18 6L6 18'], check: ['M5 12.5l4.5 4.5L19 7.5'],
    back: ['M15 6l-6 6 6 6'], chev: ['M9 6l6 6-6 6'], phone: ['M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z'],
    mic: ['M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z', 'M5 11a7 7 0 0 0 14 0', 'M12 18v3'], cam: ['M3 7h12v10H3z', 'M15 10l6-3v10l-6-3'],
    sun: ['M12 4V2', 'M12 22v-2', 'M4 12H2', 'M22 12h-2', 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z'], moon: ['M20 14a8 8 0 1 1-10-10 7 7 0 0 0 10 10z'],
    users: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M2 21a7 7 0 0 1 14 0', 'M16 3.5a4 4 0 0 1 0 7.5', 'M22 21a7 7 0 0 0-4-6.3'],
    queue: ['M4 6h10', 'M4 12h10', 'M4 18h10', 'M18 6v12', 'M15 15l3 3 3-3'], search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', 'M20 20l-4-4'],
    trash: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13'], send: ['M4 12l16-8-6 16-2.5-6.5z'], pin: ['M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z', 'M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
    heart: ['M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z'], next: ['M5 5l8 7-8 7z', 'M17 5v14'], star: ['M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.3L12 17.5 6.4 20.4l1.1-6.3L3 9.7l6.2-.9z'],
  };
  function icon(name, fill) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', fill ? 'currentColor' : 'none'); s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
    for (const d of ICONS[name]) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); s.append(p); }
    return s;
  }
  function pulseLine() {
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 240 28'); s.setAttribute('preserveAspectRatio', 'none'); s.setAttribute('class', 'pulse-line'); s.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(NS, 'path'); p.setAttribute('d', 'M0 16 H70 L80 16 L88 4 L98 26 L106 10 L112 16 H170 L178 12 L184 16 H240'); s.append(p); return s;
  }
  const avatar = (name, color, size) => el('span', { class: 'av', css: Object.assign({ '--c': color || '#137A70' }, size ? { width: size + 'px', height: size + 'px', 'font-size': Math.round(size * .36) + 'px' } : {}), text: initials(name) });

  /* ---------- seed ---------- */
  const DOCS = [
    { id: 'd1', name: 'Dr. Meera Kapoor', spec: 'General Physician', fee: 500, room: 2, color: '#137A70', exp: 12, rating: 4.8 },
    { id: 'd2', name: 'Dr. Arjun Rao', spec: 'Paediatrician', fee: 600, room: 3, color: '#FF7A59', exp: 9, rating: 4.9 },
    { id: 'd3', name: 'Dr. Sana Qureshi', spec: 'Dermatologist', fee: 700, room: 4, color: '#6C63FF', exp: 7, rating: 4.7 },
    { id: 'd4', name: 'Dr. Vikram Sethi', spec: 'Cardiologist', fee: 900, room: 5, color: '#D98A1F', exp: 18, rating: 4.9 },
  ];
  const ME = { name: 'Riya Sharma', phone: '98765 00011', age: 29, gender: 'F' };
  function seed() {
    const now = Date.now(), day = 864e5;
    const P = (name, phone, age, gender) => ({ name, phone, age, gender });
    const A = (doctorId, date, time, patient, status, token, type, extra) => Object.assign({ id: uid(), doctorId, date, time, patient, status, token, type: type || 'clinic', paid: true, createdAt: now - 2 * day, rx: null, reason: '' }, extra || {});
    const past = ymd(new Date(now - 58 * day));
    const appts = [
      A('d1', TODAY, '10:00', P('Aman Gill', '98140 22301', 41, 'M'), 'done', 1),
      A('d1', TODAY, '10:15', P('Pooja Nair', '99887 10021', 33, 'F'), 'done', 2),
      A('d1', TODAY, '10:30', P('Rahul Verma', '98111 45670', 52, 'M'), 'done', 3),
      A('d1', TODAY, '10:45', P('Kiran Das', '97790 33412', 26, 'F'), 'in', 4, 'clinic', { reason: 'Fever and body ache, 3 days' }),
      A('d1', TODAY, '11:00', P('Neha Joshi', '98722 90110', 37, 'F'), 'waiting', 5, 'clinic', { reason: 'Follow-up: thyroid' }),
      A('d1', TODAY, '11:15', P('Imran Shaikh', '98300 77881', 45, 'M'), 'waiting', 6, 'video', { reason: 'BP review' }),
      A('d1', TODAY, '11:30', ME, 'waiting', 7, 'clinic', { reason: 'Sore throat and cough' }),
      A('d1', TODAY, '11:45', P('Dev Malhotra', '98880 12345', 30, 'M'), 'waiting', 8),
      A('d2', TODAY, '10:00', P('Baby Aarav (Neha M.)', '98123 45001', 2, 'M'), 'done', 1),
      A('d2', TODAY, '10:15', P('Ishita (Rohit K.)', '99001 22334', 6, 'F'), 'in', 2),
      A('d2', TODAY, '10:45', P('Kabir (Sonia P.)', '98989 00012', 4, 'M'), 'waiting', 3),
      A('d3', TODAY, '11:00', P('Tanvi Rao', '97000 11223', 24, 'F'), 'waiting', 1, 'video', { reason: 'Acne follow-up' }),
      A('d3', TODAY, '17:30', P('Zoya Khan', '98450 99887', 28, 'F'), 'waiting', 2),
      A('d4', TODAY, '12:00', P('Suresh Iyer', '98400 55660', 63, 'M'), 'waiting', 1, 'clinic', { reason: 'Chest discomfort on exertion' }),
      A('d4', TODAY, '17:15', P('Harpreet Kaur', '98720 44551', 55, 'F'), 'waiting', 2),
      A('d4', past, '18:00', ME, 'done', 2, 'clinic', { createdAt: now - 60 * day, rx: { id: uid(), at: now - 58 * day, meds: [{ name: 'Vitamin D3 60,000 IU', dose: '1 cap', freq: 'Once a week', days: '8 wks' }, { name: 'Iron + Folic acid', dose: '1 tab', freq: '0-1-0', days: '30 days' }], advice: 'Morning sunlight 15 minutes. Repeat Vitamin D test after 2 months.' } }),
    ];
    return {
      clinic: { name: 'Arogya Family Clinic', area: 'Sector 21, Panchkula' },
      appts,
      notes: [
        { id: uid(), t: now - 26 * 3600e3, text: 'Booking confirmed ✅ Dr. Meera Kapoor, today 11:30 am. Token will be shared in the morning.' },
        { id: uid(), t: now - 90 * 60000, text: 'Good morning Riya! Your token is 7 for Dr. Meera Kapoor (Room 2). Track the live queue in the app.' },
      ],
      video: null,
    };
  }

  /* ---------- state ---------- */
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* in-memory only */ } },
  };
  const valid = d => d && Array.isArray(d.appts) && Array.isArray(d.notes) && d.clinic;
  let db = store.get(DATA_KEY);
  if (!valid(db) || !db.appts.some(a => a.date === TODAY)) { db = seed(); store.set(DATA_KEY, db); }   // new day → fresh queue
  const fresh = () => MODE === 'patient' ? { tab: 'home', seenNotes: db.notes.length } : { tab: 'queue', doc: 'd1', drafts: {} };
  let S = Object.assign(fresh(), store.get(SESS_KEY) || {});
  const save = () => store.set(DATA_KEY, db);
  const saveS = () => store.set(SESS_KEY, S);
  const doc = id => DOCS.find(d => d.id === id);
  const appt = id => db.appts.find(a => a.id === id);
  const isMe = a => a.patient.phone === ME.phone;
  const queue = docId => db.appts.filter(a => a.doctorId === docId && a.date === TODAY && a.status !== 'cancelled' && a.token != null).sort((a, b) => a.token - b.token);
  const serving = docId => queue(docId).find(a => a.status === 'in');
  const aheadOf = a => queue(a.doctorId).filter(x => x.token < a.token && (x.status === 'waiting' || x.status === 'in')).length;
  const note = text => { db.notes.push({ id: uid(), t: Date.now(), text }); if (db.notes.length > 40) db.notes.shift(); };

  /* ---------- toasts / sheets ---------- */
  function toast(msg, ic) {
    const t = el('div', { class: 'toast' }, icon(ic || 'check'), el('span', { text: msg }));
    $('#toasts').append(t);
    const g = G(); if (g) g.from(t, { y: -18, opacity: 0, scale: .9, duration: .45, ease: 'back.out(1.8)' });
    setTimeout(() => { if (g) g.to(t, { opacity: 0, y: -10, duration: .3, onComplete: () => t.remove() }); else t.remove(); }, 3000);
  }
  let closeOverlay = null;
  function sheet(build, onClose, asModal) {
    shut();
    const box = el('div', { class: asModal ? 'modal' : 'sheet', role: 'dialog', 'aria-modal': 'true' });
    const scrim = el('div', { class: asModal ? 'modal-scrim' : 'scrim', onclick: e => { if (e.target === scrim) shut(); } }, box);
    box.append(el('button', { class: 'icon-btn x', 'aria-label': 'Close', onclick: () => shut() }, icon('x')));
    build(box, () => shut());
    document.body.append(scrim);
    const g = G(); if (g) { g.from(scrim, { opacity: 0, duration: .22 }); g.from(box, asModal ? { scale: .92, opacity: 0, duration: .4, ease: 'back.out(1.5)' } : { y: 90, duration: .5, ease: 'back.out(1.15)' }); }
    closeOverlay = () => { scrim.remove(); if (onClose) onClose(); };
  }
  function shut() { if (!closeOverlay) return; const f = closeOverlay; closeOverlay = null; f(); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });

  const app = $('#app');
  function render(anim) {
    app.replaceChildren(MODE === 'patient' ? patient() : clinic());
    syncCallUI();
    const g = G(), ins = app.querySelectorAll('[data-in]');
    if (anim && g && ins.length) g.from(ins, { y: 18, opacity: 0, duration: .55, stagger: .05, ease: 'power3.out', clearProps: 'transform,opacity' });
  }

  /* ---------- illustrated people for video calls ---------- */
  function person(skin, hair, shirt, female) {
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 200 200'); s.setAttribute('class', 'person'); s.setAttribute('aria-hidden', 'true');
    const add = (t, a) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); s.append(n); return n; };
    add('path', { d: 'M30 200c6-44 34-66 70-66s64 22 70 66z', fill: shirt });
    add('path', { d: 'M84 134l16 22 16-22', fill: '#fff', opacity: .9 });
    if (female) add('path', { d: 'M56 92c0-44 22-62 44-62s46 16 44 62c-2 26-8 44-14 50H70c-8-6-14-24-14-50z', fill: hair });
    add('ellipse', { cx: 100, cy: 92, rx: 34, ry: 40, fill: skin });
    add('path', { d: female ? 'M66 84c4-26 18-38 34-38s32 10 36 36c-14-12-30-16-36-16s-22 4-34 18z' : 'M64 84c0-30 16-42 36-42s38 12 36 42c-8-14-22-20-36-20s-28 6-36 20z', fill: hair });
    add('circle', { cx: 86, cy: 94, r: 3.4, fill: '#2B1D16' }); add('circle', { cx: 114, cy: 94, r: 3.4, fill: '#2B1D16' });
    const m = add('ellipse', { cx: 100, cy: 114, rx: 8, ry: 2.4, fill: '#8A4B3A' });
    if (!female) { add('path', { d: 'M74 150c0 14 10 22 26 22', fill: 'none', stroke: '#C9D6DF', 'stroke-width': 4, 'stroke-linecap': 'round' }); add('circle', { cx: 100, cy: 174, r: 6, fill: '#C9D6DF' }); }
    const g = G(); if (g) g.to(m, { attr: { ry: 5.5 }, duration: .16, repeat: -1, yoyo: true, repeatDelay: .08, ease: 'sine.inOut' });
    return s;
  }

  /* ======================= PATIENT ======================= */
  const mine = () => db.appts.filter(isMe);
  function patient() {
    const wrap = el('div', { class: 'pt' });
    const view = S.tab === 'visits' ? visits() : S.tab === 'records' ? records() : S.tab === 'alerts' ? alerts() : home();
    wrap.append(view, pnav());
    return wrap;
  }
  function pnav() {
    const unread = Math.max(0, db.notes.length - (S.seenNotes || 0));
    const tab = (k, ic, label, badge) => el('button', { role: 'tab', 'aria-selected': String(S.tab === k), onclick: () => { S.tab = k; if (k === 'alerts') S.seenNotes = db.notes.length; saveS(); render(true); scrollTo({ top: 0 }); } }, icon(ic), label, badge ? el('span', { class: 'badge', text: String(badge) }) : null);
    return el('nav', { class: 'pnav', role: 'tablist', 'aria-label': 'Main' },
      tab('home', 'home', 'Home'), tab('visits', 'cal', 'Visits'),
      el('button', { class: 'fab', 'aria-label': 'Book an appointment', onclick: () => book() }, icon('plus')),
      tab('records', 'file', 'Records'), tab('alerts', 'bell', 'Alerts', unread));
  }
  function home() {
    const wrap = el('div');
    const h = new Date().getHours();
    wrap.append(el('header', { class: 'pt-top', 'data-in': '' },
      el('div', { class: 't' }, el('span', { text: h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }), el('strong', { text: ME.name.split(' ')[0] + ' 🌿' })),
      el('button', { class: 'icon-btn', 'aria-label': 'Alerts', onclick: () => { S.tab = 'alerts'; S.seenNotes = db.notes.length; saveS(); render(true); } }, icon('bell')),
      avatar(ME.name, '#FF7A59')));
    // next appointment with live queue
    const upcoming = mine().filter(a => a.status !== 'cancelled' && a.status !== 'done' && a.date >= TODAY).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const recentDone = mine().filter(a => a.date === TODAY && a.status === 'done').pop();
    const a = upcoming[0];
    if (a) wrap.append(nextCard(a));
    else if (recentDone) wrap.append(el('section', { class: 'next', 'data-in': '' }, el('div', { class: 'row' }, el('span', { class: 'av blob', text: '✓' }), el('div', { class: 'who' }, el('strong', { text: 'Visit complete' }), el('span', { text: doc(recentDone.doctorId).name }))),
      el('p', { css: { margin: '14px 0', opacity: '.85' }, text: recentDone.rx ? 'Your prescription is in Records.' : 'Get well soon!' }),
      recentDone.rx ? el('button', { class: 'btn btn-solid btn-sm', onclick: () => showRx(recentDone) }, icon('file'), 'View prescription') : null));
    else wrap.append(el('section', { class: 'next', 'data-in': '' }, el('h3', { css: { 'font-size': '23px' }, text: 'No upcoming visits' }), el('p', { css: { opacity: '.8', margin: '6px 0 14px' }, text: 'Book a doctor in under a minute.' }), el('button', { class: 'btn btn-solid btn-sm', onclick: () => book() }, icon('plus'), 'Book now')));
    wrap.append(el('div', { class: 'quick', 'data-in': '' },
      el('button', { css: { '--c': '#137A70' }, onclick: () => book() }, el('i', { class: 'blob' }, icon('clinic')), 'Book visit'),
      el('button', { css: { '--c': '#6C63FF' }, onclick: () => book(null, 'video') }, el('i', { class: 'blob' }, icon('video')), 'Video consult'),
      el('button', { css: { '--c': '#FF7A59' }, onclick: () => { S.tab = 'records'; saveS(); render(true); } }, el('i', { class: 'blob' }, icon('file')), 'Reports'),
      el('button', { css: { '--c': '#D98A1F' }, onclick: receipts }, el('i', { class: 'blob' }, icon('pay')), 'Payments')));
    wrap.append(el('h2', { 'data-in': '' }, 'Our doctors', el('small', { text: DOCS.length + ' available' })));
    wrap.append(el('div', { class: 'docs', 'data-in': '' }, ...DOCS.map(d => el('button', { class: 'card doc', onclick: () => book(d.id) },
      el('span', { class: 'av blob', css: { '--c': d.color }, text: initials(d.name) }),
      el('div', { class: 't' }, el('strong', { text: d.name }), el('span', { text: d.spec + ' · ' + d.exp + ' yrs' }), el('span', { css: { color: '#D98A1F', 'font-weight': '700' }, text: '★ ' + d.rating })),
      el('div', { class: 'fee' }, rs(d.fee), el('small', { text: 'per visit' }))))));
    return wrap;
  }
  function nextCard(a) {
    const d = doc(a.doctorId), q = a.date === TODAY ? queue(a.doctorId) : [];
    const now = serving(a.doctorId), ahead = a.date === TODAY ? aheadOf(a) : 0;
    const card = el('section', { class: 'next', 'data-in': '' },
      el('div', { class: 'row' }, el('span', { class: 'av blob', text: initials(d.name) }), el('div', { class: 'who' }, el('strong', { text: d.name }), el('span', { text: d.spec + (a.type === 'video' ? ' · Video' : ' · Room ' + d.room) })),
        el('div', { class: 'when', text: (a.date === TODAY ? 'Today' : fmtDay(a.date)) + '\n' + fmtTime(a.time) })));
    if (a.date !== TODAY || a.token == null) {
      card.append(el('p', { css: { margin: '16px 0 12px', opacity: '.85' }, text: 'Your token is shared on the morning of your visit. We’ll remind you on WhatsApp.' }),
        el('span', { class: 'pill', css: { background: 'rgba(255,255,255,.15)', color: '#fff' } }, icon('check'), 'Paid ' + rs(d.fee)));
      return card;
    }
    if (a.status === 'in') {
      card.append(el('div', { class: 'turn' }, icon(a.type === 'video' ? 'video' : 'pin'), a.type === 'video' ? 'Your turn: the doctor will call you now' : 'It’s your turn · Please go to Room ' + d.room));
      if (a.type === 'video' && db.video && db.video.apptId === a.id && db.video.state === 'ringing') card.append(el('button', { class: 'btn btn-solid btn-block', css: { 'margin-top': '10px' }, onclick: acceptCall }, icon('video'), 'Join video call'));
      return card;
    }
    card.append(el('div', { class: 'token' },
      el('div', { class: 'big' }, el('small', { text: 'YOUR TOKEN' }), String(a.token)),
      el('div', { class: 'meta' }, el('b', { text: ahead === 0 ? 'You’re next!' : ahead + ' ahead of you' }), 'Now serving ' + (now ? now.token : '—') + ' · ~' + Math.max(2, ahead * 8) + ' min')));
    card.append(el('div', { class: 'track', 'aria-hidden': 'true' }, ...q.slice(0, 12).map(x => el('i', { class: x.id === a.id ? 'me' : x.status === 'done' ? 'done' : x.status === 'in' ? 'now' : '' }))));
    card.append(el('div', { css: { display: 'flex', gap: '8px' } },
      el('button', { class: 'btn btn-solid btn-sm', onclick: () => directions(d) }, icon('pin'), 'Directions'),
      el('button', { class: 'btn btn-sm', css: { background: 'rgba(255,255,255,.14)', color: '#fff' }, onclick: () => { S.tab = 'visits'; saveS(); render(true); } }, 'Manage')));
    return card;
  }
  function directions(d) {
    sheet(box => box.append(el('h2', { text: db.clinic.name }), el('p', { class: 'lead', text: db.clinic.area + ' · Room ' + d.room + ', first floor' }),
      el('div', { class: 'card', css: { height: '180px', margin: '16px 0', 'border-radius': '26px', background: 'repeating-linear-gradient(45deg,#DCEFE8 0 14px,#E7F4EF 14px 28px)', display: 'grid', 'place-items': 'center' } }, el('span', { class: 'av blob', css: { '--c': '#FF7A59', width: '56px', height: '56px' } }, icon('pin'))),
      el('p', { class: 'hint', text: 'Demo map. The live app opens Google Maps.' })));
  }

  /* booking flow: doctor → type + date + slot → pay */
  function book(docId, type, reschedule) {
    const draft = { doc: docId || (reschedule && reschedule.doctorId) || null, type: type || (reschedule && reschedule.type) || 'clinic', date: TODAY, time: null, upi: 'GPay' };
    let step = draft.doc ? 2 : 1;
    sheet((box, close) => {
      const body = el('div');
      const draw = () => {
        body.replaceChildren(el('h2', { text: reschedule ? 'Reschedule visit' : step === 1 ? 'Choose a doctor' : step === 2 ? 'Pick a time' : 'Confirm & pay' }),
          el('div', { class: 'steps-bar', 'aria-hidden': 'true' }, ...[1, 2, 3].map(i => el('i', { class: i <= step ? 'on' : '' }))));
        if (step === 1) {
          body.append(el('div', { class: 'docs' }, ...DOCS.map(d => el('button', { class: 'card doc', onclick: () => { draft.doc = d.id; step = 2; draw(); } },
            el('span', { class: 'av blob', css: { '--c': d.color }, text: initials(d.name) }), el('div', { class: 't' }, el('strong', { text: d.name }), el('span', { text: d.spec })), el('div', { class: 'fee' }, rs(d.fee))))));
        } else if (step === 2) {
          const d = doc(draft.doc);
          body.append(el('div', { class: 'card doc', css: { 'margin-bottom': '14px' } }, el('span', { class: 'av blob', css: { '--c': d.color }, text: initials(d.name) }), el('div', { class: 't' }, el('strong', { text: d.name }), el('span', { text: d.spec })),
            reschedule ? null : el('button', { class: 'btn btn-line btn-sm', onclick: () => { step = 1; draw(); } }, 'Change')));
          if (!reschedule) body.append(el('div', { class: 'seg', role: 'group', 'aria-label': 'Visit type' }, ...[['clinic', 'clinic', 'In clinic'], ['video', 'video', 'Video call']].map(([k, ic, lab]) => el('button', { 'aria-pressed': String(draft.type === k), onclick: () => { draft.type = k; draw(); } }, icon(ic), lab))));
          const days = el('div', { class: 'days', css: { 'margin-top': '14px' } });
          for (let i = 0; i < 7; i++) { const dt = new Date(); dt.setDate(dt.getDate() + i); const k = ymd(dt);
            days.append(el('button', { 'aria-pressed': String(draft.date === k), onclick: () => { draft.date = k; draft.time = null; draw(); } }, el('span', { text: i === 0 ? 'Today' : dt.toLocaleDateString('en-IN', { weekday: 'short' }) }), el('b', { text: String(dt.getDate()) }))); }
          body.append(days);
          const taken = new Set(db.appts.filter(a => a.doctorId === draft.doc && a.date === draft.date && a.status !== 'cancelled' && (!reschedule || a.id !== reschedule.id)).map(a => a.time));
          const slotGrid = list => el('div', { class: 'slots' }, ...list.map(t => el('button', { 'aria-pressed': String(draft.time === t), disabled: taken.has(t), onclick: () => { draft.time = t; draw(); } }, fmtTime(t).replace(' am', '').replace(' pm', ''))));
          body.append(el('p', { class: 'slot-h' }, icon('sun'), 'Morning'), slotGrid(SLOTS_AM), el('p', { class: 'slot-h' }, icon('moon'), 'Evening'), slotGrid(SLOTS_PM));
          body.append(el('button', { class: 'btn btn-solid btn-coral btn-block', css: { 'margin-top': '18px', 'min-height': '52px' }, disabled: !draft.time, onclick: () => {
            if (reschedule) { const a = appt(reschedule.id); a.date = draft.date; a.time = draft.time; if (a.date !== TODAY) a.token = null; else if (a.token == null) a.token = nextToken(a.doctorId); a.status = a.date === TODAY ? 'waiting' : 'booked';
              note('Rescheduled ✅ ' + doc(a.doctorId).name + ', ' + (a.date === TODAY ? 'today' : fmtDay(a.date)) + ' ' + fmtTime(a.time) + '.'); save(); close(); toast('Visit rescheduled', 'cal'); return; }
            step = 3; draw(); } }, reschedule ? 'Confirm new time' : 'Continue', icon('chev')));
        } else {
          const d = doc(draft.doc);
          body.append(el('div', { class: 'sum' },
            el('div', null, el('span', { text: 'Doctor' }), el('b', { text: d.name })),
            el('div', null, el('span', { text: 'When' }), el('b', { text: (draft.date === TODAY ? 'Today' : fmtDay(draft.date)) + ', ' + fmtTime(draft.time) })),
            el('div', null, el('span', { text: 'Visit' }), el('b', { text: draft.type === 'video' ? 'Video consultation' : 'In clinic · Room ' + d.room })),
            el('div', { class: 'tot' }, el('span', { text: 'Consultation fee' }), el('b', { text: rs(d.fee) }))));
          const upi = el('div', { class: 'upi', role: 'group', 'aria-label': 'Pay with' }, ...['GPay', 'PhonePe', 'Paytm'].map(u => el('button', { 'aria-pressed': String(draft.upi === u), text: u, onclick: () => { draft.upi = u; draw(); } })));
          body.append(upi, el('button', { class: 'btn btn-solid btn-coral btn-block', css: { 'min-height': '54px' }, onclick: () => {
            body.replaceChildren(el('div', { class: 'center' }, el('div', { class: 'spinner' }), el('strong', { text: 'Paying ' + rs(d.fee) + ' with ' + draft.upi + '…' }), el('p', { class: 'hint', text: 'Simulated payment, nothing is charged.' })));
            setTimeout(() => {
              const a = { id: uid(), doctorId: d.id, date: draft.date, time: draft.time, patient: ME, status: draft.date === TODAY ? 'waiting' : 'booked', token: draft.date === TODAY ? nextToken(d.id) : null, type: draft.type, paid: true, createdAt: Date.now(), rx: null, reason: '' };
              db.appts.push(a);
              note('Booking confirmed ✅ ' + d.name + ', ' + (a.date === TODAY ? 'today' : fmtDay(a.date)) + ' ' + fmtTime(a.time) + (a.token ? '. Your token is ' + a.token + '.' : '.') + ' Paid ' + rs(d.fee) + '.');
              note('⏰ Reminder: ' + (a.type === 'video' ? 'video consult' : 'visit') + ' with ' + d.name + ' ' + (a.date === TODAY ? 'today' : 'on ' + fmtDay(a.date)) + ' at ' + fmtTime(a.time) + '. Reply C to cancel.');
              save();
              const tk = el('div', { class: 'tick blob' }, icon('check'));
              body.replaceChildren(el('div', { class: 'center' }, tk, el('h2', { text: 'You’re booked!', css: { padding: 0 } }),
                el('p', { class: 'lead', text: d.name + ' · ' + (a.date === TODAY ? 'Today' : fmtDay(a.date)) + ', ' + fmtTime(a.time) + (a.token ? ' · Token ' + a.token : '') }),
                el('p', { class: 'hint', text: 'Confirmation and reminder sent on WhatsApp.' }),
                el('button', { class: 'btn btn-solid', onclick: () => { close(); S.tab = 'home'; saveS(); render(true); } }, 'Done')));
              const g = G(); if (g) g.from(tk, { scale: 0, rotation: -90, duration: .7, ease: 'back.out(2)' });
            }, 1400);
          } }, icon('pay'), 'Pay ' + rs(d.fee)));
        }
      };
      box.append(body); draw();
    }, () => render(false));
  }
  const nextToken = docId => 1 + Math.max(0, ...db.appts.filter(a => a.doctorId === docId && a.date === TODAY && a.token != null).map(a => a.token));
  function receipts() {
    sheet(box => box.append(el('h2', { text: 'Payments' }), el('p', { class: 'lead', text: 'All consultation fees paid in the app.' }),
      el('div', { class: 'sum' }, ...mine().filter(a => a.paid).sort((a, b) => b.createdAt - a.createdAt).map(a => el('div', null, el('span', { text: doc(a.doctorId).name + ' · ' + fmtDay(a.date) }), el('b', { text: rs(doc(a.doctorId).fee) }))))));
  }
  function visits() {
    const wrap = el('div');
    wrap.append(el('header', { class: 'pt-top', 'data-in': '' }, el('div', { class: 't' }, el('span', { text: 'Appointments' }), el('strong', { text: 'Your visits' }))));
    const list = mine().sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    const up = list.filter(a => ['waiting', 'booked', 'in'].includes(a.status)).reverse(), past = list.filter(a => !['waiting', 'booked', 'in'].includes(a.status));
    const row = a => {
      const d = doc(a.doctorId), dt = dayOf(a.date);
      const st = a.status === 'cancelled' ? ['p-cancel', 'Cancelled'] : a.status === 'done' ? ['p-done', 'Completed'] : a.status === 'in' ? ['p-in', 'In progress'] : ['p-wait', a.token ? 'Token ' + a.token : 'Booked'];
      return el('div', { class: 'card visit', 'data-in': '' },
        el('div', { class: 'd' }, el('b', { text: String(dt.getDate()) }), el('span', { text: dt.toLocaleDateString('en-IN', { month: 'short' }) })),
        el('div', { class: 't' }, el('strong', { text: d.name }), el('span', { text: fmtTime(a.time) + ' · ' + (a.type === 'video' ? 'Video' : 'In clinic') }),
          el('div', { css: { display: 'flex', gap: '6px', 'flex-wrap': 'wrap' } }, el('span', { class: 'pill ' + st[0], text: st[1] }), a.type === 'video' ? el('span', { class: 'pill p-video' }, icon('video'), 'Video') : null),
          ['waiting', 'booked'].includes(a.status) ? el('div', { class: 'acts' },
            el('button', { class: 'btn btn-line btn-sm', onclick: () => book(null, null, a) }, 'Reschedule'),
            el('button', { class: 'btn btn-sm', css: { color: 'var(--live)' }, onclick: () => cancel(a) }, 'Cancel')) : null,
          a.rx ? el('div', { class: 'acts' }, el('button', { class: 'btn btn-soft btn-sm', onclick: () => showRx(a) }, icon('file'), 'Prescription')) : null));
    };
    wrap.append(el('h2', { text: 'Upcoming' }), ...(up.length ? up.map(row) : [el('p', { class: 'empty', text: 'Nothing booked. Tap + to book.' })]));
    wrap.append(el('h2', { text: 'Past' }), ...(past.length ? past.map(row) : [el('p', { class: 'empty', text: 'No past visits yet.' })]));
    return wrap;
  }
  function cancel(a) {
    sheet((box, close) => box.append(el('h2', { text: 'Cancel this visit?' }), el('p', { class: 'lead', text: doc(a.doctorId).name + ', ' + fmtDay(a.date) + ' ' + fmtTime(a.time) + '. The fee is refunded to your UPI in 2–3 days.' }),
      el('div', { css: { display: 'flex', gap: '10px', 'margin-top': '18px' } }, el('button', { class: 'btn btn-line', css: { flex: '1' }, onclick: close }, 'Keep it'),
        el('button', { class: 'btn btn-solid', css: { flex: '1', '--b': 'var(--live)' }, onclick: () => { appt(a.id).status = 'cancelled'; note('Cancelled ❌ ' + doc(a.doctorId).name + ', ' + fmtDay(a.date) + '. Refund of ' + rs(doc(a.doctorId).fee) + ' initiated.'); save(); close(); toast('Visit cancelled · refund started', 'pay'); } }, 'Cancel visit'))), () => render(false));
  }
  const REPORTS = [['Complete Blood Count', 'Pathology', 52, [['Haemoglobin', '12.8 g/dL', '12–15'], ['WBC', '7,400 /µL', '4,000–11,000'], ['Platelets', '2.6 lakh /µL', '1.5–4.5 lakh']]],
    ['Vitamin D (25-OH)', 'Pathology', 58, [['Vitamin D', '14 ng/mL', '30–100'], ['Calcium', '9.1 mg/dL', '8.5–10.5']]],
    ['Thyroid profile', 'Pathology', 120, [['TSH', '2.1 µIU/mL', '0.4–4.0'], ['T4', '8.2 µg/dL', '5–12']]]];
  function records() {
    const wrap = el('div');
    wrap.append(el('header', { class: 'pt-top', 'data-in': '' }, el('div', { class: 't' }, el('span', { text: 'Health records' }), el('strong', { text: 'Prescriptions & reports' }))));
    const rxs = mine().filter(a => a.rx).sort((a, b) => b.rx.at - a.rx.at);
    wrap.append(el('h2', { text: 'Prescriptions' }));
    rxs.forEach((a, i) => wrap.append(el('button', { class: 'card rx-row' + (i === 0 && Date.now() - a.rx.at < 3600e3 ? ' new' : ''), 'data-in': '', onclick: () => showRx(a) },
      el('i', { class: 'blob', text: 'Rx' }), el('div', { class: 't' }, el('strong', { text: doc(a.doctorId).name }), el('span', { text: fmtDay(a.date) + ' · ' + a.rx.meds.length + ' medicine' + (a.rx.meds.length > 1 ? 's' : '') })), icon('chev'))));
    if (!rxs.length) wrap.append(el('p', { class: 'empty', text: 'No prescriptions yet.' }));
    wrap.append(el('h2', { text: 'Lab reports' }));
    REPORTS.forEach(([title, lab, days, rows]) => wrap.append(el('button', { class: 'card rx-row', 'data-in': '', onclick: () => sheet(box => box.append(el('h2', { text: title }), el('p', { class: 'lead', text: lab + ' · ' + fmtDay(ymd(new Date(Date.now() - days * 864e5))) }),
      el('div', { class: 'rx', css: { 'margin-top': '14px' } }, el('table', null, el('tbody', null, ...rows.map(([k, v, r]) => el('tr', null, el('td', null, el('strong', { text: k }), el('small', { text: 'Range ' + r })), el('td', { text: v })))))),
      el('p', { class: 'hint', css: { 'margin-top': '12px' }, text: 'Demo report. In the live app this opens the lab PDF.' }))) },
      el('i', { class: 'blob', css: { background: 'var(--teal-soft)', color: 'var(--teal)' } }, icon('file')), el('div', { class: 't' }, el('strong', { text: title }), el('span', { text: lab + ' · ' + days + ' days ago' })), icon('chev'))));
    return wrap;
  }
  function showRx(a) {
    const d = doc(a.doctorId), rx = a.rx;
    sheet(box => box.append(el('h2', { text: 'Prescription' }),
      el('div', { class: 'rx', css: { 'margin-top': '14px' } },
        el('div', { class: 'rx-head' }, el('div', null, el('strong', { text: d.name }), el('span', { text: d.spec + ' · ' + db.clinic.name })), el('div', { css: { 'text-align': 'right' } }, el('strong', { text: a.patient.name, css: { 'font-size': '15px', color: 'var(--text)' } }), el('span', { text: fmtDay(a.date) }))),
        el('div', { class: 'rx-sym', text: 'Rx' }),
        el('table', null, el('tbody', null, ...rx.meds.map(m => el('tr', null, el('td', null, el('strong', { text: m.name }), el('small', { text: m.dose + ' · ' + m.freq })), el('td', { text: m.days }))))),
        rx.advice ? el('p', { class: 'adv', text: 'Advice: ' + rx.advice }) : null,
        el('p', { class: 'sign', text: d.name })),
      el('button', { class: 'btn btn-soft btn-block', css: { 'margin-top': '14px' }, onclick: () => toast('Sent to Wellness Pharmacy · ready in 20 min', 'send') }, icon('send'), 'Order medicines')));
  }
  function alerts() {
    S.seenNotes = db.notes.length; saveS();
    const wrap = el('div');
    wrap.append(el('header', { class: 'pt-top', 'data-in': '' }, el('div', { class: 't' }, el('span', { text: 'WhatsApp reminders' }), el('strong', { text: 'Alerts' }))));
    wrap.append(el('div', { class: 'wa', 'data-in': '' },
      el('div', { class: 'wa-head' }, avatar(db.clinic.name, '#137A70'), el('div', null, el('strong', { text: db.clinic.name }), el('span', { text: 'Business account · verified' }))),
      ...db.notes.slice(-14).map(n => el('div', { class: 'bub' }, n.text, el('small', null, new Date(n.t).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) + ' ', el('b', { text: '✓✓' }))))));
    return wrap;
  }

  /* video call (patient side) */
  let callEl = null;
  function syncCallUI() {
    const v = db.video;
    if (MODE === 'patient') {
      const mineCall = v && appt(v.apptId) && isMe(appt(v.apptId));
      const want = mineCall ? v.state : null;
      if (callEl && callEl.dataset.state !== want) { callEl.remove(); callEl = null; }
      if (!callEl && want === 'ringing') { callEl = incoming(appt(v.apptId)); document.body.append(callEl); }
      if (!callEl && want === 'live') { callEl = vroomPatient(appt(v.apptId)); document.body.append(callEl); }
    } else {
      const want = v && (v.state === 'ringing' || v.state === 'live') ? v.state : null;
      if (callEl && callEl.dataset.state !== want) { callEl.remove(); callEl = null; }
      if (!callEl && want) { callEl = vroomDoctor(appt(v.apptId), want); document.body.append(callEl); }
    }
  }
  function incoming(a) {
    const d = doc(a.doctorId);
    const n = el('div', { class: 'call', 'data-state': 'ringing', role: 'dialog', 'aria-label': 'Incoming video call' },
      el('div', { css: { display: 'grid', 'justify-items': 'center' } }, el('span', { class: 'av', text: initials(d.name) }), el('h2', { text: d.name }), el('p', { text: 'Video consultation · ' + db.clinic.name })),
      el('div', { class: 'acts' }, el('button', { class: 'round stop', 'aria-label': 'Decline', onclick: () => { db.video.state = 'declined'; save(); render(false); toast('Call declined'); } }, icon('phone')),
        el('button', { class: 'round go', 'aria-label': 'Accept', onclick: acceptCall }, icon('video'))));
    const g = G(); if (g) g.from(n, { opacity: 0, duration: .35 });
    return n;
  }
  function acceptCall() { if (!db.video) return; db.video.state = 'live'; db.video.startedAt = Date.now(); save(); render(false); }
  function endCall() { if (!db.video) return; db.video.state = 'ended'; save(); render(false); toast('Call ended'); }
  function callTimer(span) { const tick = () => { if (!span.isConnected || !db.video || !db.video.startedAt) return; const s = Math.floor((Date.now() - db.video.startedAt) / 1000); span.textContent = pad(Math.floor(s / 60)) + ':' + pad(s % 60); setTimeout(tick, 1000); }; tick(); }
  function vroomPatient(a) {
    const d = doc(a.doctorId), timer = el('span', { text: '00:00' });
    const mic = el('button', { class: 'round', 'aria-label': 'Mute', 'aria-pressed': 'false', onclick: e => e.currentTarget.setAttribute('aria-pressed', String(e.currentTarget.getAttribute('aria-pressed') !== 'true')) }, icon('mic'));
    const cam = el('button', { class: 'round', 'aria-label': 'Camera off', 'aria-pressed': 'false', onclick: e => e.currentTarget.setAttribute('aria-pressed', String(e.currentTarget.getAttribute('aria-pressed') !== 'true')) }, icon('cam'));
    const n = el('div', { class: 'vroom', 'data-state': 'live', role: 'dialog', 'aria-label': 'Video consultation' },
      el('div', { class: 'vfeed' }, person('#C98F6B', '#2B1D16', '#E9F1EF', true), el('div', { class: 'vtag' }, el('i'), d.name, ' · ', timer),
        el('div', { class: 'vself' }, person('#E8B996', '#3A261C', '#FF7A59', true)), el('p', { class: 'vcap', text: 'Encrypted consultation · recorded to your health file' })),
      el('div', { class: 'vbar' }, mic, cam, el('button', { class: 'round stop', 'aria-label': 'End call', onclick: endCall }, icon('phone'))));
    callTimer(timer);
    return n;
  }

  /* ======================= CLINIC ======================= */
  const flashIds = new Set();
  function clinic() {
    const waiting = db.appts.filter(a => a.date === TODAY && a.status === 'waiting').length;
    const tabs = [['queue', 'queue', 'Live queue', waiting], ['schedule', 'cal', 'Schedule'], ['patients', 'users', 'Patients']];
    const rail = el('aside', { class: 'rail' },
      el('div', { class: 'brand' }, el('span', { class: 'mk blob' }, icon('heart')), el('div', null, el('strong', { text: 'Pulseline' }), el('span', { text: db.clinic.name }))),
      el('nav', { role: 'tablist', 'aria-label': 'Sections' }, ...tabs.map(([k, ic, label, n]) => el('button', { role: 'tab', 'aria-selected': String(S.tab === k), onclick: () => { S.tab = k; saveS(); render(true); } }, icon(ic), label, n ? el('span', { class: 'n', text: String(n) }) : null))),
      el('div', { class: 'me' }, avatar('Reception Desk', '#fff'), el('div', null, el('strong', { text: 'Reception' }), el('span', { text: 'Front desk' }))));
    const main = el('main', { class: 'cmain' });
    main.append(S.tab === 'schedule' ? schedule() : S.tab === 'patients' ? patients() : queueView());
    return el('div', { class: 'cl' }, rail, main);
  }
  function kpis() {
    const t = db.appts.filter(a => a.date === TODAY && a.status !== 'cancelled');
    const k = (label, v, hot) => el('div', { class: 'kpi' + (hot ? ' hot' : '') }, el('span', { text: label }), el('b', { text: v }));
    return el('div', { class: 'kpis', 'data-in': '' }, k('Appointments today', String(t.length)), k('Waiting now', String(t.filter(a => a.status === 'waiting').length), true), k('Completed', String(t.filter(a => a.status === 'done').length)),
      k('Video consults', String(t.filter(a => a.type === 'video').length)), k('Collected', rs(t.filter(a => a.paid).reduce((s, a) => s + doc(a.doctorId).fee, 0))));
  }
  function head(title, sub) {
    return el('div', { class: 'chead', 'data-in': '' }, el('div', null, el('h1', { text: title }), el('p', { text: sub })),
      el('div', { class: 'right' }, el('span', { class: 'live-chip' }, el('span', { class: 'dot' }), 'Live · syncs with patient app')));
  }
  function docPicker() {
    return el('div', { class: 'docpick', role: 'group', 'aria-label': 'Doctor' }, ...DOCS.map(d => el('button', { 'aria-pressed': String(S.doc === d.id), onclick: () => { S.doc = d.id; saveS(); render(false); } }, avatar(d.name, d.color), d.name.replace('Dr. ', '').split(' ')[0])));
  }
  function queueView() {
    const d = doc(S.doc), q = queue(S.doc), cur = serving(S.doc), nextUp = q.find(a => a.status === 'waiting');
    const frag = el('div');
    frag.append(head('Live queue', new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' + db.clinic.name), kpis());
    frag.append(el('div', { css: { 'margin-bottom': '14px' }, 'data-in': '' }, docPicker()));
    const card = el('section', { class: 'serving', 'data-in': '' }, el('small', { text: 'NOW SERVING · ROOM ' + d.room }),
      el('div', { class: 'num', text: cur ? String(cur.token) : '—' }),
      el('div', { class: 'who', text: cur ? cur.patient.name : 'No one in the room' }, cur ? el('span', { text: (cur.type === 'video' ? 'Video consult · ' : '') + (cur.reason || 'General consultation') }) : null),
      pulseLine(),
      el('button', { class: 'btn btn-solid btn-block', disabled: !nextUp, onclick: callNext }, icon('next'), nextUp ? 'Call next · Token ' + nextUp.token : 'Queue is clear'));
    const list = el('section', { class: 'card qlist', 'data-in': '' },
      el('div', { class: 'qrow hd' }, el('span', { text: 'Token' }), el('span', { text: 'Patient' }), el('span', { class: 'tm', text: 'Slot' }), el('span', { text: 'Status' }), el('span', { css: { 'text-align': 'right' }, text: 'Action' })));
    q.forEach(a => {
      const st = a.status === 'done' ? el('span', { class: 'pill p-done' }, icon('check'), 'Done') : a.status === 'in' ? el('span', { class: 'pill p-in' }, el('span', { class: 'dot' }), 'In room') : el('span', { class: 'pill p-wait', text: 'Waiting' });
      list.append(el('div', { class: 'qrow ' + (a.status === 'in' ? 'in' : a.status === 'done' ? 'done' : '') + (flashIds.has(a.id) ? ' flash' : '') },
        el('span', { class: 'tk', text: String(a.token) }),
        el('div', { class: 'nm' }, el('strong', { text: a.patient.name + (isMe(a) ? ' · app' : '') }), el('span', { text: a.patient.age + ' · ' + a.patient.gender + ' · ' + a.patient.phone })),
        el('span', { class: 'tm mono', text: fmtTime(a.time) }),
        el('span', { class: 'st', css: { display: 'flex', gap: '5px', 'flex-wrap': 'wrap' } }, st, a.type === 'video' ? el('span', { class: 'pill p-video' }, icon('video')) : null),
        el('div', { class: 'act' }, a.status === 'waiting' ? el('button', { class: 'btn btn-line btn-sm', onclick: () => callIn(a) }, 'Call in') : a.status === 'done' && a.rx ? el('span', { class: 'pill p-paid' }, 'Rx sent') : null)));
    });
    if (!q.length) list.append(el('p', { class: 'empty', text: 'No appointments for ' + d.name + ' today.' }));
    frag.append(el('div', { class: 'qgrid' }, card, list));
    if (cur) frag.append(consultPanel(cur));
    return frag;
  }
  function callIn(a) {
    const cur = serving(a.doctorId); if (cur) cur.status = 'done';
    a.status = 'in'; announce(a); save(); render(false);
  }
  function callNext() {
    const q = queue(S.doc), cur = serving(S.doc), nx = q.find(a => a.status === 'waiting');
    if (cur) cur.status = 'done';
    if (nx) { nx.status = 'in'; announce(nx); }
    save(); render(false);
  }
  function announce(a) {
    const d = doc(a.doctorId);
    toast('Calling token ' + a.token + ' · ' + a.patient.name, 'bell');
    if (isMe(a)) note(a.type === 'video' ? '📞 It’s your turn! ' + d.name + ' will video-call you in the app now.' : '🔔 It’s your turn! Token ' + a.token + ', please go to Room ' + d.room + '.');
    // heads-up for the app patient when they become next
    const me = queue(a.doctorId).find(x => isMe(x) && x.status === 'waiting');
    if (me && aheadOf(me) === 1) note('⏳ You’re next for ' + d.name + '. Please be at the clinic' + (me.type === 'video' ? ' / keep the app open' : '') + '.');
  }
  const MEDS = [['Paracetamol 650', '1 tab', '1-1-1', '3 days'], ['Azithromycin 500', '1 tab', '1-0-0', '3 days'], ['Cetirizine 10', '1 tab', '0-0-1', '5 days'], ['Pantoprazole 40', '1 tab', '1-0-0', '7 days'], ['ORS sachet', '1 sachet', 'As needed', '3 days'], ['Benzydamine gargle', '15 ml', '1-1-1', '5 days']];
  function consultPanel(a) {
    const d = doc(a.doctorId);
    S.drafts = S.drafts || {};
    const dr = S.drafts[a.id] = S.drafts[a.id] || { meds: [], advice: '', notes: '' };
    const rows = el('div');
    const drawRows = () => {
      rows.replaceChildren(...dr.meds.map((m, i) => el('div', { class: 'medrow' },
        el('input', { class: 'input', value: m.name, 'aria-label': 'Medicine', maxlength: '60', oninput: e => { m.name = e.target.value; saveS(); } }),
        el('input', { class: 'input', value: m.dose, 'aria-label': 'Dose', maxlength: '20', oninput: e => { m.dose = e.target.value; saveS(); } }),
        el('select', { class: 'select', 'aria-label': 'Frequency', onchange: e => { m.freq = e.target.value; saveS(); } }, ...['1-0-0', '0-1-0', '0-0-1', '1-0-1', '1-1-1', 'As needed', 'Once a week'].map(f => { const o = el('option', { value: f, text: f }); if (f === m.freq) o.selected = true; return o; })),
        el('input', { class: 'input', value: m.days, 'aria-label': 'Duration', maxlength: '12', oninput: e => { m.days = e.target.value; saveS(); } }),
        el('button', { class: 'icon-btn', 'aria-label': 'Remove ' + m.name, onclick: () => { dr.meds.splice(i, 1); saveS(); drawRows(); } }, icon('trash')))));
      if (!dr.meds.length) rows.append(el('p', { class: 'hint', text: 'Tap a common medicine below, or add your own.' }));
    };
    drawRows();
    const v = db.video && db.video.apptId === a.id ? db.video.state : null;
    const panel = el('section', { class: 'card consult', 'data-in': '' },
      el('div', null,
        el('h3', { text: 'Consultation · Token ' + a.token }),
        el('p', { class: 'sub', text: a.patient.name + ' with ' + d.name + (a.type === 'video' ? ' · video consult' : ' · Room ' + d.room) }),
        a.type === 'video' ? el('div', { css: { display: 'flex', gap: '8px', 'align-items': 'center', 'margin-bottom': '14px' } },
          el('button', { class: 'btn btn-solid', css: { '--b': '#6C63FF' }, disabled: v === 'ringing' || v === 'live', onclick: () => { db.video = { apptId: a.id, state: 'ringing', startedAt: 0 }; save(); render(false); } }, icon('video'), v === 'ringing' ? 'Ringing…' : v === 'live' ? 'In call' : 'Start video call'),
          v === 'declined' ? el('span', { class: 'pill p-cancel', text: 'Patient declined' }) : v === 'ended' ? el('span', { class: 'pill p-done', text: 'Call ended' }) : null) : null,
        el('div', { class: 'field' }, el('label', { text: 'Clinical notes' }), el('textarea', { class: 'textarea', placeholder: 'Symptoms, findings, diagnosis…', maxlength: '400', oninput: e => { dr.notes = e.target.value; saveS(); } }, dr.notes)),
        el('label', { css: { 'font-size': '13px', 'font-weight': '700', color: 'var(--dim)' }, text: 'E-prescription' }), rows,
        el('div', { class: 'chips' }, ...MEDS.map(([n, dose, f, days]) => el('button', { onclick: () => { dr.meds.push({ name: n, dose, freq: f, days }); saveS(); drawRows(); } }, '+ ' + n)),
          el('button', { onclick: () => { dr.meds.push({ name: '', dose: '1 tab', freq: '1-0-1', days: '5 days' }); saveS(); drawRows(); const ins = rows.querySelectorAll('.medrow .input'); if (ins.length) ins[ins.length - 3].focus(); } }, '+ Custom')),
        el('div', { class: 'field' }, el('label', { text: 'Advice for the patient' }), el('textarea', { class: 'textarea', css: { 'min-height': '64px' }, placeholder: 'e.g. Warm fluids, rest for 3 days', maxlength: '240', oninput: e => { dr.advice = e.target.value; saveS(); } }, dr.advice)),
        el('div', { css: { display: 'flex', gap: '10px', 'flex-wrap': 'wrap' } },
          el('button', { class: 'btn btn-solid btn-coral', onclick: () => sendRx(a) }, icon('send'), 'Send prescription & finish'),
          el('button', { class: 'btn btn-line', onclick: () => { a.status = 'done'; save(); render(false); toast('Visit marked done'); } }, 'Finish without Rx'))),
      el('aside', { class: 'ptcard' },
        el('div', { css: { display: 'flex', gap: '10px', 'align-items': 'center', 'margin-bottom': '6px' } }, avatar(a.patient.name, isMe(a) ? '#FF7A59' : '#137A70'), el('div', null, el('strong', { text: a.patient.name }), el('div', { class: 'hint', text: a.patient.phone }))),
        el('div', { class: 'row' }, el('span', { text: 'Age / sex' }), el('b', { text: a.patient.age + ' / ' + a.patient.gender })),
        el('div', { class: 'row' }, el('span', { text: 'Reason' }), el('b', { text: a.reason || 'General', css: { 'text-align': 'right' } })),
        el('div', { class: 'row' }, el('span', { text: 'Fee' }), el('b', { text: a.paid ? rs(d.fee) + ' paid' : 'Due' })),
        el('div', { class: 'row' }, el('span', { text: 'Past visits' }), el('b', { text: String(db.appts.filter(x => x.patient.phone === a.patient.phone && x.status === 'done').length) })),
        el('div', { class: 'vitals' }, ...[['BP', '118/76'], ['Pulse', '82'], ['Temp', '99.4°F'], ['SpO₂', '98%']].map(([k, v]) => el('div', null, el('b', { text: v }), el('span', { text: k }))))));
    return panel;
  }
  function sendRx(a) {
    const dr = S.drafts[a.id], meds = (dr ? dr.meds : []).map(m => ({ name: String(m.name).trim().slice(0, 60), dose: String(m.dose).slice(0, 20), freq: m.freq, days: String(m.days).slice(0, 12) })).filter(m => m.name);
    if (!meds.length) { toast('Add at least one medicine', 'file'); return; }
    a.rx = { id: uid(), at: Date.now(), meds, advice: String(dr.advice || '').trim().slice(0, 240) };
    a.status = 'done';
    if (db.video && db.video.apptId === a.id && db.video.state === 'live') db.video.state = 'ended';
    if (isMe(a)) note('💊 ' + doc(a.doctorId).name + ' sent your prescription (' + meds.length + ' medicine' + (meds.length > 1 ? 's' : '') + '). Open Records in the app.');
    delete S.drafts[a.id]; saveS(); save(); render(false);
    toast('Prescription sent to ' + a.patient.name, 'send');
  }
  function vroomDoctor(a, state) {
    const d = doc(a.doctorId), timer = el('span', { text: state === 'live' ? '00:00' : 'Ringing…' });
    const n = el('div', { class: 'dvroom', 'data-state': state, role: 'dialog', 'aria-label': 'Video consultation' },
      el('div', { class: 'dvbox' },
        el('div', { class: 'vfeed' }, state === 'live' ? person('#E8B996', '#3A261C', '#FF7A59', true) : el('div', { css: { display: 'grid', 'justify-items': 'center', gap: '10px' } }, avatar(a.patient.name, '#FF7A59', 96), el('p', { text: 'Calling ' + a.patient.name + '…' })),
          el('div', { class: 'vtag' }, el('i'), a.patient.name, ' · ', timer),
          el('div', { class: 'vself' }, person('#C98F6B', '#2B1D16', '#E9F1EF', true))),
        el('div', { class: 'dvside' }, el('h3', { text: 'Video consult' }), el('p', { text: d.name + ' with ' + a.patient.name + ' (' + a.patient.age + ', ' + a.patient.gender + ')' }),
          el('p', { text: a.reason || 'General consultation' }),
          el('div', { class: 'vbar' }, el('button', { class: 'round', 'aria-label': 'Mute', 'aria-pressed': 'false', onclick: e => e.currentTarget.setAttribute('aria-pressed', String(e.currentTarget.getAttribute('aria-pressed') !== 'true')) }, icon('mic')),
            el('button', { class: 'round stop', 'aria-label': 'End call', onclick: endCall }, icon('phone'))),
          el('p', { css: { 'font-size': '13px' }, text: 'Tip: end the call, then write the prescription below. It reaches the patient’s app instantly.' }))));
    if (state === 'live') callTimer(timer);
    return n;
  }
  function schedule() {
    const frag = el('div');
    frag.append(head('Today’s schedule', 'All doctors · bookings from the app appear here instantly'), kpis());
    const g = el('div', { class: 'sgrid' }, el('div', { class: 'h' }), ...DOCS.map(d => el('div', { class: 'h' }, avatar(d.name, d.color), d.name.replace('Dr. ', ''))));
    const today = db.appts.filter(a => a.date === TODAY && a.status !== 'cancelled');
    [...SLOTS_AM, ...SLOTS_PM].forEach(t => {
      g.append(el('div', { class: 'tm', text: fmtTime(t) }));
      DOCS.forEach(d => {
        const a = today.find(x => x.doctorId === d.id && x.time === t);
        g.append(el('div', { class: 'cell' }, a ? el('div', { class: 'blk' + (flashIds.has(a.id) ? ' new' : ''), css: { '--c': d.color }, title: a.patient.name },
          a.type === 'video' ? icon('video') : a.status === 'done' ? icon('check') : null, (a.token ? '#' + a.token + ' ' : '') + a.patient.name) : null));
      });
    });
    frag.append(el('section', { class: 'card sched', 'data-in': '' }, g));
    return frag;
  }
  function patients() {
    const frag = el('div');
    frag.append(head('Patients', 'Everyone who booked or visited'));
    const map = new Map();
    db.appts.forEach(a => { const p = map.get(a.patient.phone) || { p: a.patient, visits: 0, last: '', rx: 0, video: 0 }; if (a.status !== 'cancelled') p.visits++; if (a.date > p.last) p.last = a.date; if (a.rx) p.rx++; if (a.type === 'video') p.video++; map.set(a.patient.phone, p); });
    let q = '';
    const table = el('section', { class: 'card ptable', 'data-in': '' });
    const draw = () => {
      const rows = [...map.values()].filter(x => (x.p.name + ' ' + x.p.phone).toLowerCase().includes(q)).sort((a, b) => b.last.localeCompare(a.last));
      table.replaceChildren(el('div', { class: 'prow hd' }, el('span', { text: 'Patient' }), el('span', { text: 'Visits' }), el('span', { text: 'Last visit' }), el('span', { text: 'Rx' }), el('span', { text: 'Video' })),
        ...rows.map(x => el('div', { class: 'prow' }, el('div', { class: 'nm' }, avatar(x.p.name, x.p.phone === ME.phone ? '#FF7A59' : '#137A70'), el('div', null, el('strong', { text: x.p.name }), el('div', { class: 'hint', text: x.p.phone }))),
          el('span', { class: 'mono', text: String(x.visits) }), el('span', { text: fmtDay(x.last) }), el('span', { class: 'mono', text: String(x.rx) }), el('span', { class: 'mono', text: String(x.video) }))));
    };
    frag.append(el('div', { class: 'search', css: { margin: '16px 0' } }, icon('search'), el('input', { class: 'input', type: 'search', placeholder: 'Search name or phone', 'aria-label': 'Search patients', oninput: e => { q = e.target.value.toLowerCase().trim(); draw(); } })));
    draw(); frag.append(table);
    return frag;
  }

  /* ---------- live sync between the two apps ---------- */
  addEventListener('storage', e => {
    if (e.key !== DATA_KEY) return;
    const nd = store.get(DATA_KEY); if (!valid(nd)) return;
    const before = db; db = nd;
    if (MODE === 'clinic') {
      const known = new Set(before.appts.map(a => a.id));
      db.appts.filter(a => !known.has(a.id)).forEach(a => { flashIds.add(a.id); setTimeout(() => flashIds.delete(a.id), 4000); toast('New booking · ' + a.patient.name + ' with ' + doc(a.doctorId).name.replace('Dr. ', 'Dr '), 'cal'); });
      db.appts.forEach(a => { const b = before.appts.find(x => x.id === a.id); if (b && b.status !== 'cancelled' && a.status === 'cancelled') toast(a.patient.name + ' cancelled', 'x'); if (b && b.time !== a.time) toast(a.patient.name + ' rescheduled to ' + fmtTime(a.time), 'cal'); });
      if (before.video && db.video && before.video.state === 'ringing' && db.video.state === 'live') toast('Patient joined the call', 'video');
      if (before.video && db.video && before.video.state !== 'declined' && db.video.state === 'declined') toast('Patient declined the call', 'phone');
    } else {
      mine().forEach(a => { const b = before.appts.find(x => x.id === a.id); if (!b) return;
        if (b.status !== 'in' && a.status === 'in') toast(a.type === 'video' ? 'Your turn! The doctor will call you' : 'It’s your turn · Room ' + doc(a.doctorId).room, 'bell');
        if (!b.rx && a.rx) toast('New prescription from ' + doc(a.doctorId).name, 'file'); });
      const me = mine().find(a => a.date === TODAY && a.status === 'waiting');
      if (me) { const b = before.appts.find(x => x.id === me.id); if (b) { const was = before.appts.filter(x => x.doctorId === me.doctorId && x.date === TODAY && x.token < me.token && (x.status === 'waiting' || x.status === 'in')).length, now = aheadOf(me); if (now < was) toast(now === 0 ? 'You’re next!' : now + ' ahead of you now', 'queue'); } }
    }
    const typing = document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (!closeOverlay && !typing) render(false); else syncCallUI();
  });
  // keep relative times fresh
  setInterval(() => { if (!closeOverlay && !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) render(false); }, 60000);

  render(true);
})();
