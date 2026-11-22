/* Lectern — multi-tenant online classes platform, static demo (Bazozo Studio)
   All data lives in localStorage. Every piece of user text is rendered with
   textContent / DOM nodes — never innerHTML — so typed input can't inject markup. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = () => (window.gsap && !reduced ? window.gsap : null);
  // ?mode=student → phone (student only); ?mode=admin → laptop (admin + super admin); no mode → all roles.
  const MODE = (m => (m === 'student' || m === 'admin' ? m : null))(new URLSearchParams(location.search).get('mode'));
  const ROLES = MODE === 'student' ? ['student'] : MODE === 'admin' ? ['admin', 'super'] : ['student', 'admin', 'super'];
  const DATA_KEY = 'lectern.demo.v1', SESSION_KEY = 'lectern.session.v1' + (MODE ? '.' + MODE : '');
  const STUDENT_PRICE = 499, PLAN_PRICE = { BASIC: 1999, PRO: 4999 }, BASIC_PLAYLIST_LIMIT = 2;
  const rupees = n => '₹' + n.toLocaleString('en-IN');
  const uid = () => Math.random().toString(36).slice(2, 10);
  if ($('#year')) $('#year').textContent = new Date().getFullYear();

  /* ---------------- tiny DOM builder ---------------- */
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
    lock: ['M6 10h12v10H6z', 'M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10'],
    play: ['M8 5.5v13l10.5-6.5z'],
    check: ['M5 12.5l4.5 4.5L19 7.5'],
    x: ['M6 6l12 12', 'M18 6L6 18'],
    logout: ['M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3', 'M10 17l5-5-5-5', 'M15 12H4'],
    book: ['M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z', 'M4 19V5', 'M9 7h6'],
    live: ['M12 12h.01', 'M8.5 8.5a5 5 0 0 0 0 7', 'M15.5 8.5a5 5 0 0 1 0 7', 'M5.6 5.6a9 9 0 0 0 0 12.8', 'M18.4 5.6a9 9 0 0 1 0 12.8'],
    user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'],
    users: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M2 21a7 7 0 0 1 14 0', 'M16 3.5a4 4 0 0 1 0 7.5', 'M22 21a7 7 0 0 0-4-6.3'],
    plus: ['M12 5v14', 'M5 12h14'],
    trash: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13'],
    send: ['M4 12l16-8-6 16-2.5-6.5z'],
    eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
    search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', 'M20 20l-4-4'],
    caret: ['M6 9l6 6 6-6'],
    crown: ['M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z'],
    grid: ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M13 13h7v7h-7z'],
    list: ['M8 6h12', 'M8 12h12', 'M8 18h12', 'M4 6h.01', 'M4 12h.01', 'M4 18h.01'],
    spark: ['M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z'],
    arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
    clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
    warn: ['M12 3l10 18H2z', 'M12 10v4', 'M12 17h.01'],
  };
  function icon(name, cls) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', name === 'play' ? 'currentColor' : 'none');
    s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2');
    s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
    if (cls) s.setAttribute('class', cls);
    for (const d of ICONS[name]) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); s.append(p); }
    return s;
  }
  const initials = name => (String(name).trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2) || '?').toUpperCase();
  const ago = ts => { const m = Math.max(0, Math.round((Date.now() - ts) / 60000)); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : Math.floor(m / 60) + 'h ' + (m % 60) + 'm ago'; };
  const AV_COLORS = ['#E8590C', '#0F8B8D', '#7048E8', '#D6336C', '#2B8A3E', '#1971C2', '#B8860B', '#C2255C'];
  const avColor = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return AV_COLORS[Math.abs(h) % AV_COLORS.length]; };

  /* ---------------- YouTube ---------------- */
  function ytId(raw) {
    const s = String(raw || '').trim();
    if (/^[\w-]{11}$/.test(s)) return s;
    let id = null;
    try {
      const u = new URL(s);
      const host = u.hostname.replace(/^(www|m|music)\./, '');
      if (host === 'youtu.be') id = u.pathname.slice(1, 12);
      else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        id = u.searchParams.get('v') || (u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/) || [])[1];
      }
    } catch (e) { /* not a URL */ }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  }
  const thumbUrl = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  /* ---------------- seed data ---------------- */
  function seed() {
    const now = Date.now(), day = 864e5;
    const L = (title, yt, access, dur) => ({ id: uid(), title, yt, access, dur });
    const S = (name, contact, tier, daysAgo) => ({ id: uid(), name, contact, tier, joined: now - daysAgo * day, watched: [] });
    return {
      academies: [
        {
          id: 'apex', code: 'APEX01', name: 'Apex Science Academy', tagline: 'Board + entrance prep for classes 9–12', color: '#2F5BEA', plan: 'PRO',
          live: { on: true, title: "Newton's laws — live doubt clearing", startedAt: now - 14 * 60000 },
          playlists: [
            { id: uid(), title: 'Physics & Calculus Foundations', lectures: [
              L('Motion in a straight line', 'ZM8ECpBuQYE', 'free', '10:59'),
              L('The essence of calculus', 'WUvTyaaNkzM', 'free', '17:04'),
              L('The Fourier transform, visualised', 'spUNpyF58BY', 'paid', '20:56'),
            ] },
            { id: uid(), title: 'Chemistry, Biology & Vectors', lectures: [
              L('The nucleus: intro to chemistry', 'FSyAehMdpyI', 'free', '10:12'),
              L('Carbon: the building block of life', 'QnQe0xW_JY4', 'paid', '11:52'),
              L('Vectors, what even are they?', 'fNk_zzaMoSs', 'paid', '9:52'),
            ] },
          ],
          students: [
            S('Riya Sharma', 'riya@demo.in', 'free', 21), S('Arjun Mehta', 'arjun@demo.in', 'paid', 64),
            S('Kabir Singh', '9876500011', 'paid', 40), S('Ananya Iyer', 'ananya@demo.in', 'free', 9),
            S('Meera Joshi', 'meera@demo.in', 'paid', 33), S('Ishaan Gupta', '9876500042', 'free', 3),
          ],
          chat: [
            { id: uid(), who: 'Dr. Nair', role: 'teacher', text: "Welcome everyone! Today: Newton's 2nd law with solved examples.", t: now - 13 * 60000 },
            { id: uid(), who: 'Kabir Singh', role: 'student', text: 'Sir, is F = ma valid when mass changes?', t: now - 9 * 60000 },
            { id: uid(), who: 'Dr. Nair', role: 'teacher', text: 'Great question. Then we use F = dp/dt. Writing it on the board now.', t: now - 8 * 60000 },
            { id: uid(), who: 'Meera Joshi', role: 'student', text: 'Clear now, thank you!', t: now - 4 * 60000 },
          ],
          teacher: 'Dr. Nair',
        },
        {
          id: 'skill', code: 'SKILL02', name: 'SkillCraft Coding Hub', tagline: 'Job-ready web & Python skills, from zero', color: '#E8590C', plan: 'BASIC',
          live: { on: false, title: '', startedAt: 0 },
          playlists: [
            { id: uid(), title: 'Web Foundations', lectures: [
              L('HTML crash course', 'UB1O30fR-EE', 'free', '1:00:41'),
              L('CSS crash course', 'yfoY53QXEnI', 'free', '1:25:11'),
              L('JavaScript crash course', 'hdI2bqOjy3c', 'paid', '1:40:30'),
            ] },
            { id: uid(), title: 'Python & Computer Science', lectures: [
              L('Intro to programming & CS', 'zOjov-2OZ0E', 'free', '1:59:59'),
              L('Python for beginners', 'kqtD5dpn9C8', 'paid', '1:00:06'),
              L('What is a neural network?', 'aircAruvnKk', 'paid', '18:40'),
            ] },
          ],
          students: [
            S('Dev Patel', 'dev@demo.in', 'free', 12), S('Sara Khan', 'sara@demo.in', 'paid', 50),
            S('Rohan Verma', '9876500077', 'free', 6), S('Tanvi Rao', 'tanvi@demo.in', 'paid', 18),
          ],
          chat: [],
          teacher: 'Aman (Mentor)',
        },
      ],
    };
  }
  const DEMO_ACCOUNTS = [
    { label: 'Free student', academy: 'apex', contact: 'riya@demo.in' },
    { label: 'Paid student', academy: 'apex', contact: 'arjun@demo.in' },
    { label: 'Free student · Basic plan academy', academy: 'skill', contact: 'dev@demo.in' },
  ];

  /* ---------------- persistence ---------------- */
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode: in-memory only */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };
  const valid = d => d && Array.isArray(d.academies) && d.academies.every(a => a && a.id && a.code && Array.isArray(a.playlists) && Array.isArray(a.students) && a.live);
  let db = store.get(DATA_KEY); if (!valid(db)) { db = seed(); store.set(DATA_KEY, db); }
  const freshSession = () => ({ role: ROLES[0], academyId: null, studentId: null, adminAcademy: 'apex', adminTab: 'content', studentTab: 'learn' });
  let session = Object.assign(freshSession(), store.get(SESSION_KEY) || {});
  if (!ROLES.includes(session.role)) session.role = ROLES[0];
  const save = () => store.set(DATA_KEY, db);
  const saveSession = () => store.set(SESSION_KEY, session);
  const academy = id => db.academies.find(a => a.id === id);
  const byCode = code => db.academies.find(a => a.code === String(code).trim().toUpperCase());
  const lectureCount = a => a.playlists.reduce((n, p) => n + p.lectures.length, 0);
  function currentStudent() {
    const a = academy(session.academyId);
    const s = a && a.students.find(x => x.id === session.studentId);
    return a && s ? { a, s } : null;
  }
  function setAccent(color) {
    const r = document.documentElement.style;
    r.setProperty('--acc', color);
    r.setProperty('--acc-soft', hexA(color, .11));
  }
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }

  /* ---------------- toasts ---------------- */
  function toast(msg, kind) {
    const t = el('div', { class: 'toast' + (kind === 'warn' ? ' warn' : '') }, icon(kind === 'warn' ? 'warn' : 'check'), el('span', { text: msg }));
    $('#toasts').append(t);
    const g = G();
    if (g) g.from(t, { y: -16, opacity: 0, scale: .92, duration: .45, ease: 'back.out(1.8)' });
    setTimeout(() => { if (g) g.to(t, { y: -10, opacity: 0, duration: .3, onComplete: () => t.remove() }); else t.remove(); }, 2600);
  }

  /* ---------------- modal ---------------- */
  let lenis = null, closeModalFn = null;
  function openModal(build, opts = {}) {
    closeModal(true);
    const sheet = el('div', { class: 'sheet' + (opts.wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true', 'data-lenis-prevent': '' });
    const scrim = el('div', { class: 'scrim', onclick: e => { if (e.target === scrim) closeModal(); } }, sheet);
    const close = () => closeModal();
    sheet.append(el('button', { class: 'icon-btn x', 'aria-label': 'Close', onclick: close }, icon('x')));
    build(sheet, close);
    document.body.append(scrim);
    if (lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
    const g = G();
    if (g) { g.from(scrim, { opacity: 0, duration: .25 }); g.from(sheet, { y: 60, opacity: 0, scale: .97, duration: .5, ease: 'back.out(1.3)' }); }
    const f = sheet.querySelector('input, .btn-solid'); if (f && matchMedia('(pointer:fine)').matches) f.focus();
    closeModalFn = () => { scrim.remove(); if (opts.onClose) opts.onClose(); };
  }
  function closeModal(silent) {
    if (!closeModalFn) return;
    const fn = closeModalFn; closeModalFn = null; fn();
    if (!$('.room')) { document.body.style.overflow = ''; if (lenis) lenis.start(); }
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (closeModalFn) closeModal(); else if (roomState) leaveRoom(); } });

  /* ---------------- role switcher ---------------- */
  $$('.role').forEach(b => { if (!ROLES.includes(b.dataset.role)) b.remove(); });
  const roleBtns = $$('.role'), pill = $('.roles-pill');
  function syncRoles() {
    roleBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.role === session.role)));
    const on = roleBtns.find(b => b.dataset.role === session.role);
    pill.style.width = on.offsetWidth + 'px';
    pill.style.transform = `translateX(${on.offsetLeft - 4}px)`;
  }
  roleBtns.forEach(b => b.addEventListener('click', () => { if (session.role === b.dataset.role) return; session.role = b.dataset.role; saveSession(); render(true); }));
  addEventListener('resize', syncRoles);
  if ('ResizeObserver' in window) new ResizeObserver(syncRoles).observe($('.roles'));
  $('#brandHome').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); });
  $('#resetBtn').addEventListener('click', () => openModal((sh, close) => {
    sh.append(el('h2', { text: 'Reset demo data?' }),
      el('p', { class: 'lead', text: 'This removes every playlist, student, chat message, plan change and login you made in this browser and restores the original two academies.' }),
      el('div', { class: 'row', css: { 'margin-top': '20px' } },
        el('button', { class: 'btn btn-ghost grow', text: 'Cancel', onclick: close }),
        el('button', { class: 'btn btn-solid btn-danger grow', onclick: () => {
          store.del(DATA_KEY); store.del(SESSION_KEY);
          db = seed(); save(); session = freshSession(); saveSession();
          close(); render(true); toast('Demo data reset');
        } }, icon('trash'), 'Reset everything')));
  }));

  /* ---------------- render root ---------------- */
  const app = $('#app');
  function render(animate) {
    if (roomState) leaveRoom(true);
    syncRoles();
    if (window.gsap) window.gsap.killTweensOf(app.querySelectorAll('.orb'));
    app.replaceChildren();
    let view;
    if (session.role === 'student') view = currentStudent() ? studentView() : loginView();
    else if (session.role === 'admin') view = adminView();
    else view = superView();
    app.append(view);
    if (animate) {
      const g = G();
      if (g) g.from(view.querySelectorAll('[data-in]'), { y: 22, opacity: 0, duration: .6, stagger: .06, ease: 'power3.out', clearProps: 'transform,opacity' });
      scrollTo({ top: 0 });
    }
  }
  // keep tabs in sync (e.g. admin in one tab, student in another)
  addEventListener('storage', e => {
    if (e.key !== DATA_KEY) return;
    const fresh = store.get(DATA_KEY); if (!valid(fresh)) return;
    db = fresh;
    if (roomState) { updateRoomFromDb(); return; }
    if (adminChatBox && adminChatBox.isConnected) renderAdminChat();
    if (!closeModalFn && !(document.activeElement && /INPUT|SELECT/.test(document.activeElement.tagName))) render(false);
  });

  /* ======================= LOGIN ======================= */
  function loginView() {
    setAccent('#4A2FE0');
    const code = el('input', { class: 'input code', id: 'lgCode', autocomplete: 'off', maxlength: '12', placeholder: 'e.g. APEX01', spellcheck: 'false' });
    const contact = el('input', { class: 'input', id: 'lgContact', autocomplete: 'email', placeholder: 'you@email.com or 10-digit phone' });
    const name = el('input', { class: 'input', id: 'lgName', autocomplete: 'name', maxlength: '40', placeholder: 'Only needed for new students' });
    const err = el('p', { class: 'err', role: 'alert' });
    const academyHint = el('p', { class: 'hint' });
    code.addEventListener('input', () => {
      const a = byCode(code.value); code.classList.remove('bad');
      academyHint.textContent = a ? '✓ ' + a.name : code.value.length >= 4 ? 'No academy with this code yet' : '';
      academyHint.style.color = a ? 'var(--ok)' : '';
      if (a) setAccent(a.color);
    });
    const fill = c => { code.value = c; code.dispatchEvent(new Event('input')); contact.focus(); };
    function submit(e) {
      e.preventDefault(); err.textContent = '';
      const a = byCode(code.value);
      if (!a) { code.classList.add('bad'); err.textContent = 'That academy code was not found. Try APEX01 or SKILL02.'; return; }
      const raw = contact.value.trim(), isEmail = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(raw), digits = raw.replace(/\D/g, '');
      if (!isEmail && !(digits.length >= 10 && digits.length <= 13 && /^[+\d\s-]+$/.test(raw))) { contact.classList.add('bad'); err.textContent = 'Enter a valid email or a 10-digit phone number.'; return; }
      const key = isEmail ? raw.toLowerCase() : digits.slice(-10);
      let s = a.students.find(x => x.contact.toLowerCase() === key);
      if (!s) {
        const nm = name.value.trim() || (isEmail ? key.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Student ' + key.slice(-4));
        s = { id: uid(), name: nm.slice(0, 40), contact: key, tier: 'free', joined: Date.now(), watched: [] };
        a.students.push(s); save();
        toast('Welcome! You joined ' + a.name);
      }
      signIn(a, s);
    }
    contact.addEventListener('input', () => contact.classList.remove('bad'));
    const form = el('form', { onsubmit: submit, novalidate: true },
      el('div', { class: 'field' }, el('label', { for: 'lgCode', text: 'Academy code' }), code,
        el('div', { class: 'row' }, el('div', { class: 'code-chips' }, ...db.academies.slice(0, 4).map(a => el('button', { type: 'button', class: 'code-chip', text: a.code, onclick: () => fill(a.code) }))), academyHint)),
      el('div', { class: 'field' }, el('label', { for: 'lgContact', text: 'Email or phone' }), contact),
      el('div', { class: 'field' }, el('label', { for: 'lgName', text: 'Your name (optional)' }), name),
      err,
      el('button', { class: 'btn btn-solid btn-block', type: 'submit', css: { 'margin-top': '6px', 'min-height': '48px' } }, 'Continue', icon('arrow')));

    const accts = el('div', { class: 'demo-accts' }, ...DEMO_ACCOUNTS.map(d => {
      const a = academy(d.academy); const s = a && a.students.find(x => x.contact === d.contact);
      if (!a || !s) return null;
      return el('button', { class: 'demo-acct', css: { '--c': a.color }, onclick: () => signIn(a, s) },
        el('span', { class: 'av', css: { '--c': avColor(s.name) }, text: initials(s.name) }),
        el('div', null, el('strong', { text: s.name + ' · ' + d.label }), el('span', { text: a.name + ' (' + a.code + ')' })),
        el('span', { class: 'chip ' + (s.tier === 'paid' ? 'chip-paid' : 'chip-free'), text: s.tier === 'paid' ? 'Paid' : 'Free' }));
    }));

    return el('div', { class: 'login' },
      el('div', { class: 'login-hero', 'data-in': '' }, orbitSvg(),
        el('p', { class: 'eyebrow', text: 'Lectern · classes for every academy' }),
        el('h1', { text: 'Your academy, in your students’ pocket.' }),
        el('p', { text: 'Each academy gets its own branded classroom: recorded lectures, paid courses and live classes. Log in with the code your academy gave you.' }),
        el('div', { class: 'tenants' }, ...db.academies.slice(0, 3).map(a => el('span', { class: 'tenant' }, el('span', { class: 'av', css: { '--c': a.color, width: '26px', height: '26px', 'border-radius': '50%', 'font-size': '10px' }, text: initials(a.name) }), a.name.split(' ')[0], el('b', { text: a.code }))))),
      el('div', { class: 'card login-card', 'data-in': '' },
        el('h2', { text: 'Student login' }),
        el('p', { text: 'Enter your academy code and the email or phone you registered with. New here? You will be enrolled as a free student.' }),
        form,
        el('div', { class: 'divider', text: 'or try a demo account' }),
        accts));
  }
  function signIn(a, s) {
    session.academyId = a.id; session.studentId = s.id; session.studentTab = 'learn'; saveSession();
    render(true);
  }
  function orbitSvg() {
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 300 300'); s.setAttribute('class', 'hero-orbit'); s.setAttribute('aria-hidden', 'true');
    const add = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); s.append(n); return n; };
    [140, 100, 60].forEach((r, i) => add('circle', { cx: 150, cy: 150, r, fill: 'none', stroke: 'rgba(255,255,255,' + (0.1 + i * 0.05) + ')', 'stroke-dasharray': i === 1 ? '4 8' : 'none' }));
    db.academies.slice(0, 3).forEach((a, i) => {
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'orb'); g.style.transformOrigin = '150px 150px'; s.append(g);
      const c = document.createElementNS(NS, 'circle'); const r = [140, 100, 60][i];
      c.setAttribute('cx', 150 + r); c.setAttribute('cy', 150); c.setAttribute('r', 9 - i); c.setAttribute('fill', a.color); g.append(c);
      const g2 = G(); if (g2) g2.to(g, { rotation: 360, duration: 26 + i * 8, repeat: -1, ease: 'none' }); else g.setAttribute('transform', `rotate(${i * 120} 150 150)`);
    });
    add('circle', { cx: 150, cy: 150, r: 6, fill: 'rgba(255,255,255,.5)' });
    return s;
  }

  /* ======================= STUDENT ======================= */
  function studentView() {
    const { a, s } = currentStudent();
    setAccent(a.color);
    const total = lectureCount(a), watched = s.watched.filter(id => a.playlists.some(p => p.lectures.some(l => l.id === id))).length;
    const isPaid = s.tier === 'paid';
    const liveAvailable = a.plan === 'PRO', liveOn = liveAvailable && a.live.on;

    const hero = el('section', { class: 's-hero', 'data-in': '' }, patternSvg(),
      el('div', { class: 's-hero-top' },
        el('span', { class: 'crest', text: initials(a.name) }),
        el('div', { class: 'grow' }, el('h1', { text: a.name }), el('p', { class: 'tag', text: a.tagline || 'Online classes' })),
        el('button', { class: 'icon-btn logout', 'aria-label': 'Log out', title: 'Log out', onclick: () => { session.academyId = session.studentId = null; saveSession(); render(true); toast('Logged out'); } }, icon('logout'))),
      el('div', { class: 's-me' },
        progressRing(watched, total),
        el('div', { class: 'who' }, el('strong', { text: 'Hi, ' + s.name.split(' ')[0] }), el('span', { text: `${watched} of ${total} lectures watched · ${isPaid ? 'Paid' : 'Free'} plan` })),
        isPaid ? el('span', { class: 'chip chip-paid' }, icon('crown'), 'All access') : el('button', { class: 'btn btn-sm', onclick: () => upgradeModal(a, s) }, icon('spark'), 'Unlock all')));

    const learn = el('div', { class: 's-main', 'data-pane': 'learn' },
      ...(a.playlists.length ? a.playlists.map(p => el('section', { class: 'pl', 'data-in': '' },
        el('div', { class: 'pl-h' }, el('h3', { text: p.title }), el('span', { text: p.lectures.length + ' lectures' })),
        p.lectures.length ? el('div', { class: 'lectures', 'data-lenis-prevent-horizontal': '' }, ...p.lectures.map(l => lectureCard(a, s, p, l)))
          : el('p', { class: 'empty', text: 'Lectures are coming soon.' })))
        : [el('p', { class: 'empty', 'data-in': '', text: 'Your academy has not published any lectures yet.' })]));

    const liveCard = el('div', { class: 'card live-card' + (liveOn ? ' on' : !liveAvailable ? ' locked' : ''), 'data-in': '' });
    if (liveOn) {
      liveCard.append(el('div', { class: 'signal', 'aria-hidden': 'true' }, el('span'), el('span'), el('span'), el('i')),
        el('span', { class: 'chip chip-live' }, el('span', { class: 'dot' }), 'LIVE NOW'),
        el('h3', { text: a.live.title || 'Live class' }),
        el('p', { class: 'sub', text: `${a.teacher || 'Your teacher'} · started ${ago(a.live.startedAt)} · ${viewerCount(a)} watching` }),
        isPaid ? el('button', { class: 'btn btn-solid btn-block', onclick: () => openRoom(a, s) }, icon('live'), 'Join live class')
          : el('button', { class: 'btn btn-solid btn-block', css: { '--b': '#E8A317' }, onclick: () => upgradeModal(a, s, 'live') }, icon('lock'), 'Upgrade to join live'));
    } else if (liveAvailable) {
      liveCard.append(el('span', { class: 'chip chip-off' }, el('span', { class: 'dot' }), 'OFF AIR'),
        el('h3', { text: 'No live class right now' }),
        el('p', { class: 'sub', text: 'You will see the class here the moment your teacher goes live.' + (isPaid ? '' : ' Live classes are for paid students.') }));
    } else {
      liveCard.append(el('span', { class: 'chip chip-basic' }, icon('lock'), 'LIVE CLASSES'),
        el('h3', { text: 'Live classes aren’t on yet' }),
        el('p', { class: 'sub', text: a.name + ' hasn’t switched on live classes. Recorded lectures are available below.' }));
    }

    const profile = el('div', { class: 'card profile-card', 'data-in': '' },
      el('div', { class: 'row' }, el('span', { class: 'av', css: { '--c': avColor(s.name) }, text: initials(s.name) }), el('div', { class: 'grow' }, el('strong', { text: s.name }), el('div', { class: 'hint', text: s.contact })),
        el('span', { class: 'chip ' + (isPaid ? 'chip-paid' : 'chip-free'), text: isPaid ? 'Paid' : 'Free' })),
      el('dl', null,
        el('dt', { text: 'Academy' }), el('dd', { text: a.name }),
        el('dt', { text: 'Code' }), el('dd', { class: 'mono', text: a.code }),
        el('dt', { text: 'Joined' }), el('dd', { text: new Date(s.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }),
        el('dt', { text: 'Unlocked' }), el('dd', { text: isPaid ? 'All lectures + live' : 'Free lectures only' })),
      isPaid ? null : el('button', { class: 'btn btn-solid btn-block', css: { 'margin-top': '16px' }, onclick: () => upgradeModal(a, s) }, 'Upgrade for ' + rupees(STUDENT_PRICE) + '/month'),
      el('button', { class: 'btn btn-ghost btn-block', css: { 'margin-top': '10px' }, onclick: () => { session.academyId = session.studentId = null; saveSession(); render(true); } }, icon('logout'), 'Log out'));

    const side = el('aside', { class: 's-side' }, el('div', { 'data-pane': 'live' }, liveCard), el('div', { 'data-pane': 'me' }, profile));
    const grid = el('div', { class: 's-grid', 'data-tab': session.studentTab || 'learn' }, learn, side);

    const tabs = [['learn', 'book', 'Learn'], ['live', 'live', 'Live'], ['me', 'user', 'Profile']];
    const bar = el('nav', { class: 'tabbar', role: 'tablist', 'aria-label': 'Sections' }, ...tabs.map(([k, ic, label]) =>
      el('button', { class: 'tab', role: 'tab', 'aria-selected': String((session.studentTab || 'learn') === k), onclick: ev => {
        session.studentTab = k; saveSession(); grid.dataset.tab = k;
        $$('.tab', bar).forEach(t => t.setAttribute('aria-selected', String(t === ev.currentTarget)));
        const g = G(); if (g) g.from(grid.querySelectorAll(`[data-pane="${k}"] > *, [data-pane="${k}"] .pl`), { y: 14, opacity: 0, duration: .4, stagger: .05, clearProps: 'all' });
        scrollTo({ top: 0, behavior: 'smooth' });
      } }, icon(ic), label, k === 'live' && liveOn ? el('span', { class: 'live-dot' }) : null)));

    return el('div', { class: 'page' }, hero, grid, bar);
  }
  function progressRing(done, total) {
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 40 40');
    const c = (stroke, dash) => { const n = document.createElementNS(NS, 'circle'); n.setAttribute('cx', 20); n.setAttribute('cy', 20); n.setAttribute('r', 16); n.setAttribute('fill', 'none'); n.setAttribute('stroke', stroke); n.setAttribute('stroke-width', 4); n.setAttribute('stroke-linecap', 'round'); if (dash != null) { n.setAttribute('stroke-dasharray', '100.5'); n.setAttribute('stroke-dashoffset', String(dash)); } s.append(n); return n; };
    c('rgba(255,255,255,.2)');
    const pct = total ? done / total : 0;
    const arc = c('#fff', 100.5);
    requestAnimationFrame(() => { arc.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)'; arc.setAttribute('stroke-dashoffset', String(100.5 * (1 - pct))); });
    return el('div', { class: 'ring', 'aria-label': `${Math.round(pct * 100)}% complete` }, s, el('b', { text: Math.round(pct * 100) + '%' }));
  }
  function patternSvg() {
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 100 100'); s.setAttribute('class', 'pattern'); s.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 6; i++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', 60); c.setAttribute('cy', 40); c.setAttribute('r', 8 + i * 9); c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#fff'); c.setAttribute('stroke-width', '1.2'); s.append(c); }
    return s;
  }
  function lectureCard(a, s, p, l) {
    const locked = l.access === 'paid' && s.tier !== 'paid';
    const done = s.watched.includes(l.id);
    const img = el('img', { src: thumbUrl(l.yt), alt: '', loading: 'lazy', decoding: 'async' });
    return el('button', { class: 'lec' + (locked ? ' locked' : ''), 'aria-label': (locked ? 'Locked: ' : 'Play: ') + l.title, onclick: () => locked ? upgradeModal(a, s, 'lecture', l) : playLecture(a, s, p, l) },
      el('div', { class: 'thumb' }, img,
        el('span', { class: 'chip badge ' + (l.access === 'paid' ? 'chip-paid' : 'chip-free'), text: l.access === 'paid' ? 'Paid' : 'Free' }),
        done && !locked ? el('span', { class: 'done', title: 'Watched' }, icon('check')) : null,
        locked ? el('span', { class: 'lock-veil' }, el('i', null, icon('lock')), 'Unlock with Paid') : el('span', { class: 'play' }, icon('play'))),
      el('div', { class: 'lec-body' }, el('strong', { text: l.title }), el('span', { text: (l.dur || 'Video') + (done ? ' · watched' : '') })));
  }
  function playLecture(a, s, p, l) {
    if (!s.watched.includes(l.id)) { s.watched.push(l.id); save(); }
    const list = p.lectures, idx = list.indexOf(l);
    const next = list.slice(idx + 1).find(x => x.access === 'free' || s.tier === 'paid');
    openModal((sh, close) => {
      sh.append(el('div', { class: 'player' }, el('iframe', {
        src: `https://www.youtube-nocookie.com/embed/${l.yt}?autoplay=1&rel=0&modestbranding=1`, title: l.title,
        allow: 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin', loading: 'lazy' })),
        el('p', { class: 'eyebrow', text: p.title + ' · lecture ' + (idx + 1) + ' of ' + list.length }),
        el('h2', { text: l.title, css: { 'margin-top': '6px' } }),
        el('div', { class: 'row', css: { 'margin-top': '16px' } },
          el('span', { class: 'chip ' + (l.access === 'paid' ? 'chip-paid' : 'chip-free'), text: l.access === 'paid' ? 'Paid lecture' : 'Free lecture' }),
          el('span', { class: 'chip chip-free' }, icon('check'), 'Marked as watched'),
          next ? el('button', { class: 'btn btn-ghost btn-sm', css: { 'margin-left': 'auto' }, onclick: () => playLecture(a, s, p, next) }, 'Next: ' + (next.title.length > 22 ? next.title.slice(0, 22) + '…' : next.title), icon('arrow')) : null));
    }, { wide: true, onClose: () => render(false) });
  }
  function upgradeModal(a, s, reason, lec) {
    openModal((sh, close) => {
      const body = el('div');
      let method = 'UPI';
      const methods = el('div', { class: 'pay-methods', role: 'group', 'aria-label': 'Payment method' }, ...['UPI', 'Card', 'NetBanking'].map(m =>
        el('button', { class: 'pay-m', 'aria-pressed': String(m === method), text: m, onclick: e => { method = m; $$('.pay-m', methods).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } })));
      const pay = el('button', { class: 'btn btn-solid btn-block', css: { 'min-height': '50px' }, onclick: () => {
        body.replaceChildren(el('div', { class: 'paying' }, el('div', { class: 'spinner' }), el('strong', { text: `Processing ${rupees(STUDENT_PRICE)} via ${method}…` }), el('p', { class: 'hint', text: 'Simulated payment, nothing is charged.' })));
        setTimeout(() => {
          s.tier = 'paid'; save();
          const tick = el('div', { class: 'success-tick' }, icon('check'));
          body.replaceChildren(el('div', { class: 'paying' }, tick, el('h2', { text: 'You’re a Paid student!' }), el('p', { class: 'lead', text: 'Every lecture' + (a.plan === 'PRO' ? ' and live class' : '') + ' at ' + a.name + ' is now unlocked.' }),
            el('button', { class: 'btn btn-solid', onclick: () => { close(); if (lec) { const p = a.playlists.find(pp => pp.lectures.includes(lec)); if (p) playLecture(a, s, p, lec); } else if (reason === 'live' && a.live.on) openRoom(a, s); } }, lec ? 'Watch now' : reason === 'live' ? 'Join live class' : 'Start learning', icon('arrow'))));
          const g = G(); if (g) g.from(tick, { scale: 0, rotation: -90, duration: .7, ease: 'back.out(2)' });
        }, 1400);
      } }, icon('lock'), 'Pay ' + rupees(STUDENT_PRICE) + ' & unlock');
      body.append(
        el('p', { class: 'eyebrow', text: a.name }),
        el('h2', { text: reason === 'live' ? 'Live classes are for Paid students' : lec ? 'Unlock “' + lec.title + '”' : 'Upgrade to Paid' , css: { 'margin-top': '6px' } }),
        el('p', { class: 'lead', text: 'One plan unlocks everything your academy publishes.' }),
        el('div', { class: 'up-price' }, el('b', { text: rupees(STUDENT_PRICE) }), el('span', { text: '/ month · cancel anytime' })),
        el('ul', { class: 'perks' },
          ...[`All ${lectureCount(a)} lectures, including paid ones`, a.plan === 'PRO' ? 'Join live classes and chat with your teacher' : 'Live classes as soon as your academy enables them', 'New lectures the day they are added', 'Watch on any device'].map(t => el('li', null, icon('check'), el('span', { text: t })))),
        methods, pay,
        el('p', { class: 'fine', text: 'Demo payment: your status upgrades instantly in this browser.' }));
      sh.append(body);
    }, { onClose: () => { if (!roomState) render(false); } });
  }

  /* ======================= LIVE ROOM ======================= */
  let roomState = null;
  const PEERS = ['Ananya', 'Kabir', 'Meera', 'Ishaan', 'Sara', 'Tanvi', 'Rohan', 'Zoya', 'Vikram'];
  const PEER_LINES = ['Understood 👍', 'Can you repeat the last step?', 'Sir please share notes after class', 'This is so clear now', 'What about friction here?', 'Audio is clear ✅', 'Will this come in the exam?', 'Thank you!', 'One more example please'];
  const BOARDS = {
    apex: ["Newton's 2nd law", 'F = m · a', 'F = dp/dt  (mass changes)', 'v = u + at', 's = ut + ½at²', 'Ex: m = 2 kg, a = 3 m/s²  →  F = 6 N'],
    skill: ['Loops in JavaScript', 'for (let i = 0; i < 5; i++) {', '   console.log(i * i);', '}', '// → 0 1 4 9 16'],
    other: ["Today's topic", 'Key idea #1', 'Worked example', 'Practice question', 'Summary'],
  };
  function viewerCount(a) { const base = 18 + (a.students.length * 7) % 40; return base + Math.floor((Date.now() / 7000) % 9); }
  function openRoom(a, s) {
    if (roomState) leaveRoom(true);
    const canvas = el('canvas', { 'aria-label': 'Live whiteboard stream' });
    const viewers = el('span', { class: 'viewers' }, icon('eye'), el('span', { text: String(viewerCount(a)) }));
    const msgs = el('div', { class: 'msgs', 'data-lenis-prevent': '' });
    const input = el('input', { placeholder: 'Ask a doubt…', maxlength: '200', 'aria-label': 'Chat message' });
    const stage = el('div', { class: 'stage' }, canvas, el('span', { class: 'chip chip-live' }, el('span', { class: 'dot' }), 'LIVE'), el('div', { class: 'cam' }, teacherSvg(a.color), el('span', { text: a.teacher || 'Teacher' })));
    const form = el('form', { class: 'chat-form', onsubmit: e => { e.preventDefault(); const t = input.value.trim(); if (!t) return; postChat(a, s.name, 'student', t); input.value = ''; } }, input, el('button', { class: 'btn btn-solid', 'aria-label': 'Send' }, icon('send')));
    const reacts = el('div', { class: 'reacts' }, ...['👍', '👏', '🔥', '❓'].map(r => el('button', { type: 'button', class: 'react', text: r, onclick: () => floatEmoji(stage, r) })));
    const room = el('div', { class: 'room', role: 'dialog', 'aria-label': 'Live class' },
      el('div', { class: 'room-top' }, el('span', { class: 'crest', css: { width: '34px', height: '34px', 'font-size': '13px', 'border-radius': '10px', '--c': a.color }, text: initials(a.name) }), el('strong', { text: a.live.title || 'Live class' }), viewers,
        el('button', { class: 'btn btn-sm btn-solid btn-danger', onclick: () => leaveRoom() }, 'Leave')),
      el('div', { class: 'room-body' }, stage, el('div', { class: 'chat' }, el('div', { class: 'chat-h', text: 'Live chat' }), msgs, reacts, form)));
    document.body.append(room); document.body.style.overflow = 'hidden'; if (lenis) lenis.stop();
    const g = G(); if (g) g.from(room, { opacity: 0, scale: 1.03, duration: .4, ease: 'power2.out' });
    roomState = { a, s, room, msgs, viewers, stage, canvas, timers: [], raf: 0, seen: new Set() };
    renderChat(true);
    startBoard(BOARDS[a.id] || BOARDS.other);
    roomState.timers.push(setInterval(() => { roomState.viewers.lastChild.textContent = String(viewerCount(a)); }, 4000));
    roomState.timers.push(setInterval(() => {
      if (Math.random() < .55) postChat(a, PEERS[Math.floor(Math.random() * PEERS.length)], 'student', PEER_LINES[Math.floor(Math.random() * PEER_LINES.length)]);
      else if (Math.random() < .3) floatEmoji(stage, ['👍', '👏', '🔥'][Math.floor(Math.random() * 3)]);
    }, 6500));
    if (matchMedia('(pointer:fine)').matches) input.focus();
  }
  function postChat(a, who, role, text) {
    const fresh = academy(a.id); if (!fresh) return;
    fresh.chat.push({ id: uid(), who: String(who).slice(0, 40), role, text: String(text).slice(0, 200), t: Date.now() });
    if (fresh.chat.length > 80) fresh.chat.splice(0, fresh.chat.length - 80);
    save();
    if (roomState) { roomState.a = fresh; renderChat(); }
    if (adminChatBox && adminChatBox.isConnected) renderAdminChat();
  }
  function chatNode(m, meName) {
    return el('div', { class: 'msg' + (m.who === meName ? ' me' : '') },
      el('span', { class: 'av', css: { '--c': m.role === 'teacher' ? 'var(--acc)' : avColor(m.who) }, text: initials(m.who) }),
      el('div', null, el('b', null, m.who === meName ? m.who + ' (you)' : m.who, m.role === 'teacher' ? el('em', { text: 'Teacher' }) : null), el('p', { text: m.text })));
  }
  function renderChat(all) {
    const { a, s, msgs, seen } = roomState;
    const list = academy(a.id).chat;
    if (all) { msgs.replaceChildren(); seen.clear(); if (!list.length) msgs.append(el('p', { class: 'hint', css: { 'text-align': 'center', color: 'rgba(255,255,255,.4)' }, text: 'Say hello 👋' })); }
    for (const m of list) {
      if (seen.has(m.id)) continue; seen.add(m.id);
      if (msgs.firstChild && msgs.firstChild.classList && msgs.firstChild.classList.contains('hint')) msgs.firstChild.remove();
      const n = chatNode(m, s.name); msgs.append(n);
      const g = G(); if (g && !all) g.from(n, { y: 10, opacity: 0, duration: .35 });
    }
    msgs.scrollTop = msgs.scrollHeight;
  }
  function updateRoomFromDb() {
    const a = academy(roomState.a.id);
    if (!a || !a.live.on || a.plan !== 'PRO') {
      if (!roomState.stage.querySelector('.ended')) roomState.stage.append(el('div', { class: 'ended' }, el('span', { text: 'The class has ended' }), el('button', { class: 'btn btn-solid btn-sm', onclick: () => leaveRoom() }, 'Back to lectures')));
      return;
    }
    roomState.a = a; renderChat();
  }
  function leaveRoom(silent) {
    if (!roomState) return;
    roomState.timers.forEach(clearInterval); cancelAnimationFrame(roomState.raf);
    if (roomState.ro) roomState.ro.disconnect();
    if (window.gsap) window.gsap.killTweensOf(roomState.room.querySelectorAll('.cam svg *'));
    roomState.room.remove(); roomState = null;
    document.body.style.overflow = ''; if (lenis) lenis.start();
    if (!silent) render(false);
  }
  function floatEmoji(stage, e) {
    const f = el('span', { class: 'floaty', text: e, css: { right: (20 + Math.random() * 40) + '%' } }); stage.append(f);
    const g = window.gsap;
    if (g) g.to(f, { y: -160 - Math.random() * 80, x: (Math.random() - .5) * 60, opacity: 0, scale: 1.4, duration: 2.2, ease: 'power1.out', onComplete: () => f.remove() });
    else setTimeout(() => f.remove(), 800);
  }
  function teacherSvg(color) {
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 120 90'); s.setAttribute('aria-hidden', 'true');
    const add = (tag, at) => { const n = document.createElementNS(NS, tag); for (const k in at) n.setAttribute(k, at[k]); s.append(n); return n; };
    add('rect', { width: 120, height: 90, fill: '#2A2C38' });
    add('rect', { x: 0, y: 0, width: 120, height: 90, fill: color, opacity: .18 });
    add('path', { d: 'M28 90c2-20 15-30 32-30s30 10 32 30z', fill: color });
    const head = add('g', {});
    const h = document.createElementNS(NS, 'circle'); h.setAttribute('cx', 60); h.setAttribute('cy', 38); h.setAttribute('r', 15); h.setAttribute('fill', '#E9C3A0'); head.append(h);
    const hair = document.createElementNS(NS, 'path'); hair.setAttribute('d', 'M45 36c0-12 8-17 15-17s16 4 15 17c-4-6-10-8-15-8s-11 2-15 8z'); hair.setAttribute('fill', '#2B2118'); head.append(hair);
    const mouth = document.createElementNS(NS, 'ellipse'); mouth.setAttribute('cx', 60); mouth.setAttribute('cy', 45); mouth.setAttribute('rx', 4); mouth.setAttribute('ry', 1.5); mouth.setAttribute('fill', '#8A4B3A'); head.append(mouth);
    const g = window.gsap;
    if (g && !reduced) { g.to(mouth, { attr: { ry: 3.2 }, duration: .18, repeat: -1, yoyo: true, repeatDelay: .05, ease: 'sine.inOut' }); g.to(head, { rotation: 4, transformOrigin: '60px 50px', duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut' }); }
    return s;
  }
  function startBoard(lines) {
    const { canvas } = roomState; const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1;
    const size = () => { const r = canvas.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    if ('ResizeObserver' in window) { roomState.ro = new ResizeObserver(size); roomState.ro.observe(canvas); }
    const total = lines.reduce((n, l) => n + l.length, 0);
    let t0 = performance.now();
    const frame = now => {
      if (!roomState) return;
      const elapsed = (now - t0) / 1000;
      const chars = reduced ? total : Math.floor(elapsed * 14);
      if (chars > total + 70) t0 = now; // pause, then wipe and redraw
      // board
      const grd = ctx.createLinearGradient(0, 0, W, H); grd.addColorStop(0, '#1E3A32'); grd.addColorStop(1, '#152A24');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = 1;
      for (let y = 30; y < H; y += 34) { ctx.beginPath(); ctx.moveTo(0, y + Math.sin(y) * 2); ctx.lineTo(W, y); ctx.stroke(); }
      const fs = Math.max(16, Math.min(40, W / 22));
      ctx.font = `600 ${fs}px Caveat, 'Comic Sans MS', cursive`; ctx.textBaseline = 'top';
      let left = chars, x = W * .06, y = H * .09, cx = x, cy = y;
      for (let i = 0; i < lines.length && left > 0; i++) {
        const shown = lines[i].slice(0, left); left -= lines[i].length;
        ctx.fillStyle = i === 0 ? '#FFE08A' : 'rgba(250,250,240,.92)';
        ctx.fillText(shown, x, y);
        cx = x + ctx.measureText(shown).width; cy = y;
        if (i === 0 && shown.length === lines[0].length) { ctx.fillRect(x, y + fs * 1.05, ctx.measureText(shown).width, 2); }
        y += fs * 1.45;
      }
      // chalk cursor
      if (chars <= total) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + 4, cy + fs * .7, 3, 0, Math.PI * 2); ctx.fill(); }
      roomState.raf = requestAnimationFrame(frame);
    };
    roomState.raf = requestAnimationFrame(frame);
  }

  /* ======================= ACADEMY ADMIN ======================= */
  let adminChatBox = null;
  function adminView() {
    let a = academy(session.adminAcademy) || db.academies[0];
    session.adminAcademy = a.id;
    setAccent(a.color);
    const pro = a.plan === 'PRO';

    const sel = el('select', { 'aria-label': 'Choose academy', onchange: e => { session.adminAcademy = e.target.value; saveSession(); render(true); } },
      ...db.academies.map(x => { const o = el('option', { value: x.id, text: x.name }); if (x.id === a.id) o.selected = true; return o; }));
    const head = el('div', { class: 'dash-h', 'data-in': '' },
      el('div', { class: 'grow', css: { 'min-width': '220px' } }, el('p', { class: 'eyebrow', text: 'Academy studio' }), el('h1', { text: 'Manage your classroom' }), el('p', { text: 'Signed in as admin. Pick an academy to manage it.' })),
      el('div', { class: 'right' },
        el('label', { class: 'tenant-pick' }, el('span', { class: 'av', css: { '--c': a.color }, text: initials(a.name) }), sel, icon('caret', 'caret')),
        el('span', { class: 'chip ' + (pro ? 'chip-pro' : 'chip-basic'), text: a.plan + ' plan' })));

    const tab = session.adminTab || 'content';
    const tabs = el('div', { class: 'tabs', role: 'tablist', 'data-in': '' }, ...[
      ['content', 'list', 'Playlists', a.playlists.length],
      ['live', 'live', 'Live class', a.live.on && pro ? '●' : null],
      ['students', 'users', 'Students', a.students.length],
    ].map(([k, ic, label, count]) => el('button', { role: 'tab', 'aria-selected': String(k === tab), onclick: () => { session.adminTab = k; saveSession(); render(true); } },
      icon(ic), label, count != null ? el('span', { class: 'count', css: k === 'live' ? { color: 'var(--live)', background: 'rgba(240,62,62,.1)' } : null, text: String(count) }) : null)));

    let body;
    if (tab === 'content') body = adminContent(a);
    else if (tab === 'live') body = adminLive(a);
    else body = adminStudents(a);
    return el('div', { class: 'page' }, el('div', { class: 'dash' }, head, tabs, body));
  }
  function proPrompt(a, feature) {
    openModal((sh, close) => {
      sh.append(el('div', { class: 'lock-card', css: { padding: '6px 0 0', background: 'none' } },
        el('span', { class: 'lk' }, icon('crown')),
        el('h2', { text: 'Upgrade to Pro to unlock ' + feature, css: { 'padding-right': '0' } }),
        el('p', { text: `${a.name} is on the Basic plan (${rupees(PLAN_PRICE.BASIC)}/mo): up to ${BASIC_PLAYLIST_LIMIT} playlists and no live classes. Pro (${rupees(PLAN_PRICE.PRO)}/mo) adds live classes with chat and unlimited playlists.` }),
        el('div', { class: 'row', css: { 'margin-top': '10px', width: '100%' } },
          el('button', { class: 'btn btn-ghost grow', text: 'Not now', onclick: close }),
          el('button', { class: 'btn btn-ink grow', onclick: () => { a.plan = 'PRO'; save(); close(); toast(a.name + ' is now on Pro'); } }, icon('crown'), 'Upgrade to Pro')),
        el('p', { class: 'fine', text: 'Demo: upgrades instantly. The platform owner can also change plans from Super Admin.' })));
    }, { onClose: () => render(false) });
  }
  function adminContent(a) {
    const wrap = el('div', { class: 'dash', 'data-in': '' });
    const atLimit = a.plan === 'BASIC' && a.playlists.length >= BASIC_PLAYLIST_LIMIT;
    const plTitle = el('input', { class: 'input', placeholder: 'New playlist name, e.g. Organic Chemistry', maxlength: '60', 'aria-label': 'Playlist name' });
    const newPl = el('form', { class: 'card', css: { padding: '14px', display: 'flex', gap: '10px', 'flex-wrap': 'wrap', 'align-items': 'center' }, onsubmit: e => {
      e.preventDefault();
      if (atLimit) return proPrompt(a, 'more playlists');
      const t = plTitle.value.trim(); if (!t) { plTitle.classList.add('bad'); plTitle.focus(); return; }
      a.playlists.push({ id: uid(), title: t, lectures: [] }); save(); render(false); toast('Playlist “' + t + '” created');
    } }, el('div', { class: 'grow', css: { 'min-width': '200px' } }, plTitle),
      el('button', { class: 'btn ' + (atLimit ? 'btn-ink' : 'btn-solid') }, icon(atLimit ? 'lock' : 'plus'), atLimit ? 'Playlist limit reached' : 'Create playlist'),
      a.plan === 'BASIC' ? el('p', { class: 'hint', css: { width: '100%' }, text: `Basic plan: ${a.playlists.length} of ${BASIC_PLAYLIST_LIMIT} playlists used.` }) : null);
    plTitle.addEventListener('input', () => plTitle.classList.remove('bad'));
    wrap.append(newPl);
    if (!a.playlists.length) wrap.append(el('p', { class: 'empty', text: 'No playlists yet. Create your first one above.' }));
    a.playlists.forEach(p => wrap.append(playlistAdmin(a, p)));
    return wrap;
  }
  function playlistAdmin(a, p) {
    const card = el('section', { class: 'card pl-admin' });
    card.append(el('div', { class: 'pl-admin-h' }, el('h3', { text: p.title }), el('span', { text: p.lectures.length + ' lectures' }),
      el('button', { class: 'icon-btn', 'aria-label': 'Delete playlist ' + p.title, title: 'Delete playlist', onclick: () => confirmDelete('playlist “' + p.title + '” and its ' + p.lectures.length + ' lectures', () => { a.playlists = a.playlists.filter(x => x !== p); save(); toast('Playlist deleted'); }) }, icon('trash'))));
    if (!p.lectures.length) card.append(el('p', { class: 'hint', css: { padding: '14px 16px' }, text: 'No lectures yet.' }));
    p.lectures.forEach(l => {
      const sw = el('button', { class: 'switch paid', role: 'switch', 'aria-checked': String(l.access === 'paid'), 'aria-label': 'Paid lecture', onclick: () => {
        l.access = l.access === 'paid' ? 'free' : 'paid'; save();
        sw.setAttribute('aria-checked', String(l.access === 'paid')); lab.textContent = l.access === 'paid' ? 'Paid' : 'Free'; lab.style.color = l.access === 'paid' ? '#9A5B00' : 'var(--ok)';
      } });
      const lab = el('span', { css: { 'font-size': '12px', 'font-weight': '800', width: '32px', color: l.access === 'paid' ? '#9A5B00' : 'var(--ok)' }, text: l.access === 'paid' ? 'Paid' : 'Free' });
      card.append(el('div', { class: 'lec-row' },
        el('span', { class: 'mini' }, el('img', { src: thumbUrl(l.yt), alt: '', loading: 'lazy' })),
        el('div', { class: 't' }, el('strong', { text: l.title }), el('span', { text: 'youtu.be/' + l.yt + (l.dur ? ' · ' + l.dur : '') })),
        lab, sw,
        el('button', { class: 'icon-btn', 'aria-label': 'Remove ' + l.title, title: 'Remove lecture', onclick: () => confirmDelete('lecture “' + l.title + '”', () => { p.lectures = p.lectures.filter(x => x !== l); save(); toast('Lecture removed'); }) }, icon('trash'))));
    });
    // add-lecture form (collapsed until opened)
    const formBox = el('div', { class: 'add-lec', hidden: true });
    const tIn = el('input', { class: 'input', placeholder: 'Lecture title', maxlength: '80', 'aria-label': 'Lecture title' });
    const uIn = el('input', { class: 'input', placeholder: 'YouTube link, e.g. https://youtu.be/…', 'aria-label': 'YouTube URL', inputmode: 'url' });
    const prev = el('div', { class: 'yt-preview' });
    let access = 'free';
    const seg = el('div', { class: 'seg', role: 'group', 'aria-label': 'Access' }, ...['free', 'paid'].map(v => el('button', { type: 'button', 'aria-pressed': String(v === access), text: v === 'free' ? 'Free' : 'Paid', onclick: e => { access = v; $$('button', seg).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } })));
    const err = el('p', { class: 'err' });
    uIn.addEventListener('input', () => {
      uIn.classList.remove('bad'); const id = ytId(uIn.value);
      prev.replaceChildren(...(id ? [el('img', { src: thumbUrl(id), alt: '' }), el('span', { text: 'Valid YouTube video · ' + id })] : []));
    });
    tIn.addEventListener('input', () => tIn.classList.remove('bad'));
    const f = el('form', { novalidate: true, onsubmit: e => {
      e.preventDefault(); err.textContent = '';
      const t = tIn.value.trim(), id = ytId(uIn.value);
      if (!t) { tIn.classList.add('bad'); err.textContent = 'Give the lecture a title.'; return; }
      if (!id) { uIn.classList.add('bad'); err.textContent = 'That doesn’t look like a YouTube link. Paste a youtube.com or youtu.be URL.'; return; }
      p.lectures.push({ id: uid(), title: t, yt: id, access, dur: '' }); save(); render(false); toast('Lecture added to ' + p.title);
    } }, el('div', { class: 'add-lec-grid' },
      el('div', { class: 'field' }, el('label', { text: 'Title' }), tIn),
      el('div', { class: 'field' }, el('label', { text: 'YouTube URL' }), uIn),
      el('div', { class: 'full-w row' }, prev),
      el('div', { class: 'full-w row' }, el('span', { class: 'hint', text: 'Who can watch?' }), seg, el('div', { class: 'grow' }),
        el('button', { type: 'button', class: 'btn btn-ghost btn-sm', text: 'Cancel', onclick: () => { formBox.hidden = true; trig.hidden = false; } }),
        el('button', { class: 'btn btn-solid btn-sm' }, icon('plus'), 'Add lecture')),
      el('div', { class: 'full-w' }, err)));
    formBox.append(f);
    const trig = el('button', { class: 'add-trigger', onclick: () => { formBox.hidden = false; trig.hidden = true; tIn.focus(); const g = G(); if (g) g.from(formBox, { height: 0, opacity: 0, duration: .4, ease: 'power2.out', clearProps: 'height,opacity' }); } }, icon('plus'), 'Add lecture');
    card.append(formBox, trig);
    return card;
  }
  function confirmDelete(what, fn) {
    openModal((sh, close) => sh.append(el('h2', { text: 'Delete ' + what + '?' }), el('p', { class: 'lead', text: 'Students will no longer see it. You can restore everything with “Reset demo”.' }),
      el('div', { class: 'row', css: { 'margin-top': '18px' } }, el('button', { class: 'btn btn-ghost grow', text: 'Cancel', onclick: close }),
        el('button', { class: 'btn btn-solid btn-danger grow', onclick: () => { fn(); close(); } }, icon('trash'), 'Delete'))), { onClose: () => render(false) });
  }
  function adminLive(a) {
    if (a.plan !== 'PRO') {
      return el('div', { class: 'card lock-card', 'data-in': '' }, el('span', { class: 'lk' }, icon('lock')),
        el('h3', { text: 'Upgrade to Pro to unlock Live Classes' }),
        el('p', { text: `Go live to all your paid students with a built-in chat. Live classes are part of the Pro plan (${rupees(PLAN_PRICE.PRO)}/mo). ${a.name} is on Basic.` }),
        el('button', { class: 'btn btn-ink', onclick: () => proPrompt(a, 'Live Classes') }, icon('crown'), 'See Pro plan'));
    }
    const on = a.live.on;
    const titleIn = el('input', { class: 'input', value: a.live.title || '', placeholder: 'Class title, e.g. Thermodynamics revision', maxlength: '70', 'aria-label': 'Live class title', disabled: on });
    const toggle = el('button', { class: 'big-toggle', role: 'switch', 'aria-checked': String(on), 'aria-label': on ? 'Stop live class' : 'Go live', onclick: () => {
      if (!a.live.on) { a.live = { on: true, title: titleIn.value.trim() || 'Live class', startedAt: Date.now() }; save(); toast('You are live! Paid students can join now.'); }
      else { a.live.on = false; save(); toast('Live class ended'); }
      render(false);
    } });
    const paid = a.students.filter(s => s.tier === 'paid').length;
    const box = el('section', { class: 'card golive' },
      el('div', { class: 'golive-top' }, toggle,
        el('div', { class: 'grow' }, el('p', { class: 'eyebrow', text: on ? 'On air' : 'Off air' }), el('h3', { css: { 'font-size': '20px', 'margin-top': '4px' }, text: on ? 'You are live: ' + a.live.title : 'Start a live class' })),
        on ? el('span', { class: 'chip chip-live' }, el('span', { class: 'dot' }), 'LIVE') : null),
      on ? null : el('div', { class: 'field', css: { margin: 0 } }, el('label', { text: 'Class title' }), titleIn),
      el('div', { class: 'stat-row' },
        el('div', { class: 'stat' }, el('b', { text: on ? String(viewerCount(a)) : '0' }), el('span', { text: 'watching' })),
        el('div', { class: 'stat' }, el('b', { text: String(paid) }), el('span', { text: 'paid students can join' })),
        el('div', { class: 'stat' }, el('b', { text: on ? ago(a.live.startedAt).replace(' ago', '') : '—' }), el('span', { text: 'on air' }))),
      el('p', { class: 'hint', text: MODE === 'admin' ? 'Tip: log in on the phone as the Paid student and join. Messages sync both ways.' : 'Tip: open this page in a second tab as a Paid student to see the class and chat update together.' }));
    adminChatBox = el('div', { class: 'msgs', 'data-lenis-prevent': '' });
    const inp = el('input', { placeholder: on ? 'Reply as ' + (a.teacher || 'Teacher') + '…' : 'Go live to chat', maxlength: '200', disabled: !on, 'aria-label': 'Teacher message' });
    const chat = el('div', { class: 'admin-chat' }, el('div', { class: 'chat-h', text: 'Class chat' }), adminChatBox,
      el('form', { class: 'chat-form', onsubmit: e => { e.preventDefault(); const t = inp.value.trim(); if (!t) return; postChat(a, a.teacher || 'Teacher', 'teacher', t); inp.value = ''; } }, inp, el('button', { class: 'btn btn-solid', 'aria-label': 'Send', disabled: !on }, icon('send'))));
    const grid = el('div', { class: 'admin-grid', 'data-in': '' }, box, chat);
    requestAnimationFrame(renderAdminChat);
    return grid;
  }
  function renderAdminChat() {
    const a = academy(session.adminAcademy); if (!a || !adminChatBox) return;
    adminChatBox.replaceChildren(...(a.chat.length ? a.chat.map(m => chatNode(m, a.teacher)) : [el('p', { class: 'hint', css: { color: 'rgba(255,255,255,.4)', 'text-align': 'center' }, text: 'No messages yet.' })]));
    adminChatBox.scrollTop = adminChatBox.scrollHeight;
  }
  function adminStudents(a) {
    let q = '', filter = 'all';
    const list = el('div', { class: 'card list' });
    const counts = el('span', { class: 'hint' });
    const draw = () => {
      const rows = a.students.filter(s => (filter === 'all' || s.tier === filter) && (s.name + ' ' + s.contact).toLowerCase().includes(q));
      counts.textContent = `${a.students.filter(s => s.tier === 'paid').length} paid · ${a.students.filter(s => s.tier === 'free').length} free`;
      list.replaceChildren(...(rows.length ? rows.map(s => {
        const lab = el('label', { text: s.tier === 'paid' ? 'Paid' : 'Free', css: { color: s.tier === 'paid' ? '#9A5B00' : 'var(--ok)' } });
        const sw = el('button', { class: 'switch paid', role: 'switch', 'aria-checked': String(s.tier === 'paid'), 'aria-label': 'Paid status for ' + s.name, onclick: () => {
          s.tier = s.tier === 'paid' ? 'free' : 'paid'; save(); draw(); toast(s.name + ' is now ' + (s.tier === 'paid' ? 'Paid' : 'Free'));
        } });
        return el('div', { class: 'st-row' }, el('span', { class: 'av', css: { '--c': avColor(s.name) }, text: initials(s.name) }),
          el('div', { class: 't' }, el('strong', { text: s.name }), el('span', { text: s.contact + ' · joined ' + new Date(s.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' · ' + s.watched.length + ' watched' })),
          el('div', { class: 'tier' }, lab, sw));
      }) : [el('p', { class: 'empty', css: { margin: '14px', border: '0' }, text: a.students.length ? 'No students match.' : 'No students yet. They join by logging in with code ' + a.code + '.' })]));
    };
    const search = el('div', { class: 'search' }, icon('search'), el('input', { class: 'input', type: 'search', placeholder: 'Search name, email or phone', 'aria-label': 'Search students', oninput: e => { q = e.target.value.toLowerCase().trim(); draw(); } }));
    const seg = el('div', { class: 'seg', role: 'group', 'aria-label': 'Filter' }, ...[['all', 'All'], ['paid', 'Paid'], ['free', 'Free']].map(([v, t]) => el('button', { 'aria-pressed': String(v === filter), text: t, onclick: e => { filter = v; $$('button', seg).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); draw(); } })));
    draw();
    return el('div', { class: 'dash', 'data-in': '' }, el('div', { class: 'toolbar' }, search, seg, counts), list,
      el('p', { class: 'hint', text: `Students join by logging in with academy code ${a.code}. Toggle the switch to move anyone between Free and Paid.` }));
  }

  /* ======================= SUPER ADMIN ======================= */
  function superView() {
    setAccent('#4A2FE0');
    const studentsTotal = db.academies.reduce((n, a) => n + a.students.length, 0);
    const pros = db.academies.filter(a => a.plan === 'PRO').length;
    const mrr = db.academies.reduce((n, a) => n + PLAN_PRICE[a.plan], 0);
    const liveNow = db.academies.filter(a => a.plan === 'PRO' && a.live.on).length;
    const kpi = (label, value, dark) => el('div', { class: 'kpi' + (dark ? ' dark' : '') }, el('span', { text: label }), el('b', { text: value }));
    const head = el('div', { class: 'dash-h', 'data-in': '' },
      el('div', { class: 'grow' }, el('p', { class: 'eyebrow', text: 'Super admin · platform owner' }), el('h1', { text: 'All academies' }), el('p', { text: 'Every tenant on Lectern, their students and SaaS plan.' })),
      el('div', { class: 'right' }, el('button', { class: 'btn btn-ink', onclick: addAcademyModal }, icon('plus'), 'Add academy')));
    const kpis = el('div', { class: 'kpis', 'data-in': '' }, kpi('Platform MRR', rupees(mrr), true), kpi('Academies', String(db.academies.length)), kpi('Students', String(studentsTotal)), kpi('Pro · live now', pros + ' · ' + liveNow));
    const list = el('div', { class: 'card list', 'data-in': '' }, ...db.academies.map(a => {
      const paid = a.students.filter(s => s.tier === 'paid').length;
      const seg = el('div', { class: 'seg plan', role: 'group', 'aria-label': 'Plan for ' + a.name }, ...['BASIC', 'PRO'].map(v => el('button', { 'data-v': v, 'aria-pressed': String(a.plan === v), text: v === 'PRO' ? 'Pro' : 'Basic', onclick: () => {
        if (a.plan === v) return;
        a.plan = v; if (v === 'BASIC' && a.live.on) a.live.on = false; save(); render(false);
        toast(a.name + (v === 'PRO' ? ' upgraded to Pro: live classes on' : ' moved to Basic: live classes off'), v === 'PRO' ? null : 'warn');
      } })));
      return el('div', { class: 'ac-row' },
        el('span', { class: 'crest', css: { '--c': a.color, width: '44px', height: '44px', 'font-size': '16px', 'border-radius': '13px' }, text: initials(a.name) }),
        el('div', { class: 't' }, el('strong', { text: a.name }), el('span', { text: a.code + ' · ' + rupees(PLAN_PRICE[a.plan]) + '/mo' })),
        seg,
        el('div', { class: 'ac-meta' },
          el('span', { class: 'm' }, icon('users'), `${a.students.length} students (${paid} paid)`),
          el('span', { class: 'm' }, icon('list'), `${a.playlists.length} playlists · ${lectureCount(a)} lectures`),
          a.plan === 'PRO' ? (a.live.on ? el('span', { class: 'chip chip-live' }, el('span', { class: 'dot' }), 'LIVE') : el('span', { class: 'chip chip-off', text: 'Live: off air' })) : el('span', { class: 'chip chip-basic' }, icon('lock'), 'Live locked'),
          el('span', { class: 'acts' }, el('button', { class: 'btn btn-ghost btn-sm', onclick: () => { session.role = 'admin'; session.adminAcademy = a.id; session.adminTab = 'content'; saveSession(); render(true); } }, 'Open studio', icon('arrow')))));
    }));
    return el('div', { class: 'page' }, el('div', { class: 'dash' }, head, kpis,
      el('div', { class: 'section-h', css: { margin: '10px 0 0' } }, el('h2', { text: 'Academies' }), el('p', { text: 'Basic ' + rupees(PLAN_PRICE.BASIC) + ' · Pro ' + rupees(PLAN_PRICE.PRO) + ' per month' })),
      list));
  }
  const SWATCHES = ['#2F5BEA', '#E8590C', '#0F8B8D', '#7048E8', '#D6336C', '#2B8A3E'];
  function addAcademyModal() {
    openModal((sh, close) => {
      let color = SWATCHES[(db.academies.length + 2) % SWATCHES.length], plan = 'BASIC';
      const nameIn = el('input', { class: 'input', id: 'naName', maxlength: '40', placeholder: 'e.g. Vidya Maths Classes' });
      const codeIn = el('input', { class: 'input code', id: 'naCode', maxlength: '8', placeholder: 'e.g. VIDYA03', spellcheck: 'false', autocomplete: 'off' });
      const tagIn = el('input', { class: 'input', id: 'naTag', maxlength: '60', placeholder: 'Short tagline (optional)' });
      const err = el('p', { class: 'err', role: 'alert' });
      nameIn.addEventListener('input', () => { nameIn.classList.remove('bad'); if (!codeIn.dataset.touched) codeIn.value = (nameIn.value.replace(/[^a-z]/gi, '').slice(0, 5).toUpperCase() + String(db.academies.length + 1).padStart(2, '0')).slice(0, 8); });
      codeIn.addEventListener('input', () => { codeIn.dataset.touched = '1'; codeIn.classList.remove('bad'); codeIn.value = codeIn.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
      const sw = el('div', { class: 'swatches', role: 'group', 'aria-label': 'Brand colour' }, ...SWATCHES.map(c => el('button', { type: 'button', class: 'sw', css: { '--c': c }, 'aria-label': 'Colour ' + c, 'aria-pressed': String(c === color), onclick: e => { color = c; $$('.sw', sw).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } })));
      const seg = el('div', { class: 'seg plan', role: 'group', 'aria-label': 'Plan' }, ...['BASIC', 'PRO'].map(v => el('button', { type: 'button', 'data-v': v, 'aria-pressed': String(v === plan), text: v === 'PRO' ? 'Pro · ' + rupees(PLAN_PRICE.PRO) : 'Basic · ' + rupees(PLAN_PRICE.BASIC), onclick: e => { plan = v; $$('button', seg).forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } })));
      sh.append(el('h2', { text: 'Add a new academy' }), el('p', { class: 'lead', text: 'Students will log in with the academy code you choose.', css: { 'margin-bottom': '18px' } }),
        el('form', { novalidate: true, onsubmit: e => {
          e.preventDefault(); err.textContent = '';
          const name = nameIn.value.trim(), code = codeIn.value.trim().toUpperCase();
          if (name.length < 3) { nameIn.classList.add('bad'); err.textContent = 'Enter the academy name (3+ characters).'; return; }
          if (!/^[A-Z0-9]{4,8}$/.test(code)) { codeIn.classList.add('bad'); err.textContent = 'Code must be 4–8 letters or numbers.'; return; }
          if (byCode(code)) { codeIn.classList.add('bad'); err.textContent = 'Code ' + code + ' is already taken.'; return; }
          db.academies.push({ id: uid(), code, name, tagline: tagIn.value.trim(), color, plan, live: { on: false, title: '', startedAt: 0 }, playlists: [], students: [], chat: [], teacher: 'Teacher' });
          save(); close(); toast(name + ' added · code ' + code);
        } },
          el('div', { class: 'field' }, el('label', { for: 'naName', text: 'Academy name' }), nameIn),
          el('div', { class: 'field' }, el('label', { for: 'naCode', text: 'Academy code' }), codeIn),
          el('div', { class: 'field' }, el('label', { for: 'naTag', text: 'Tagline' }), tagIn),
          el('div', { class: 'field' }, el('label', { text: 'Brand colour' }), sw),
          el('div', { class: 'field' }, el('label', { text: 'SaaS plan' }), seg),
          err,
          el('button', { class: 'btn btn-ink btn-block', css: { 'min-height': '48px', 'margin-top': '6px' } }, icon('plus'), 'Create academy')));
      setTimeout(() => nameIn.focus(), 50);
    }, { onClose: () => render(false) });
  }

  /* ---------------- motion setup ---------------- */
  function initMotion() {
    const g = window.gsap;
    if (!g) return;
    if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);
    const mm = g.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (window.Lenis) {
        lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
        if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
        g.ticker.add(t => lenis.raf(t * 1000)); g.ticker.lagSmoothing(0);
      }
      if (window.ScrollTrigger && $('.bz-about')) g.from('.bz-about > *', { y: 24, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.bz-about', start: 'top 85%' } });
    });
    // magnetic primary buttons — desktop pointers only
    mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const move = e => {
        const b = e.target.closest && e.target.closest('.btn-solid, .btn-ink'); if (!b) return;
        const r = b.getBoundingClientRect();
        g.to(b, { x: (e.clientX - r.left - r.width / 2) * .18, y: (e.clientY - r.top - r.height / 2) * .3, duration: .4, ease: 'power3.out' });
      };
      const leave = e => { const b = e.target.closest && e.target.closest('.btn-solid, .btn-ink'); if (b && !b.contains(e.relatedTarget)) g.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }); };
      document.addEventListener('pointermove', move); document.addEventListener('pointerout', leave);
      return () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerout', leave); };
    });
  }

  render(false);
  initMotion();
  { const g = G(); if (g) g.from($$('#app [data-in]'), { y: 22, opacity: 0, duration: .6, stagger: .06, ease: 'power3.out', clearProps: 'transform,opacity' }); }
  addEventListener('load', syncRoles);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncRoles);
})();
