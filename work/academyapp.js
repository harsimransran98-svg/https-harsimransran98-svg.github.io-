/* White-label academy app (static demo).
   Everything the student sees is driven by `brandConfig`. Pick a preset with
   ?brand=apex | ?brand=skillcraft, or re-skin live from the Customize Brand drawer.
   State lives in localStorage. User text is always rendered with textContent. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = () => (window.gsap && !reduced ? window.gsap : null);
  const uid = () => Math.random().toString(36).slice(2, 10);
  const rs = n => '₹' + Number(n).toLocaleString('en-IN');
  const params = new URLSearchParams(location.search);
  const REEL = params.has('reel');   // recording mode for the promo reel: poster instead of a live YouTube embed, start on cue

  /* ================= brand presets ================= */
  const PRESETS = {
    apex: {
      id: 'apex', name: 'Apex Science Academy', short: 'Apex', tagline: 'Board + JEE/NEET prep, classes 9–12',
      logo: '', primary: '#2952E3', secondary: '#FF9F1C', price: 499,
      whatsapp: '919876500011', email: 'help@apexacademy.in', teacher: 'Dr. Nair',
      banner: { tag: 'New batch', title: 'Board exam crash course', sub: '40 days, 120 lectures, daily live doubt sessions.' },
    },
    skillcraft: {
      id: 'skillcraft', name: 'SkillCraft Coding Hub', short: 'SkillCraft', tagline: 'Job-ready web & Python skills, from zero',
      logo: '', primary: '#0E9F6E', secondary: '#1B3A4B', price: 699,
      whatsapp: '919876500022', email: 'hello@skillcraft.dev', teacher: 'Aman (Mentor)',
      banner: { tag: 'Placement track', title: 'Full-stack in 12 weeks', sub: 'Build 6 real projects. Mock interviews every Friday.' },
    },
  };
  const CUSTOM_KEY = 'academyapp.custom.v1';
  const HEX = /^#[0-9a-f]{6}$/i;
  const safeLogo = u => { const s = String(u || '').trim(); if (/^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(s)) return s; try { const x = new URL(s); return x.protocol === 'https:' ? x.href : ''; } catch (e) { return ''; } };
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };

  /* Build the active brandConfig: preset (URL) → saved pitch customisation → URL pitch params */
  function resolveBrand() {
    const asked = (params.get('brand') || '').toLowerCase();
    let custom = store.get(CUSTOM_KEY);
    // pitch link: ?name=…&color=…&logo=…
    if (params.get('name') || params.get('color')) {
      custom = { base: PRESETS[asked] ? asked : 'apex', name: (params.get('name') || '').slice(0, 40), primary: HEX.test('#' + (params.get('color') || '')) ? '#' + params.get('color') : '', secondary: HEX.test('#' + (params.get('color2') || '')) ? '#' + params.get('color2') : '', logo: safeLogo(params.get('logo')) };
    } else if (PRESETS[asked]) custom = null;              // explicit preset wins
    const base = PRESETS[custom && PRESETS[custom.base] ? custom.base : PRESETS[asked] ? asked : 'apex'];
    const b = JSON.parse(JSON.stringify(base));
    if (custom) {
      if (custom.name) { b.name = custom.name; b.short = custom.name.split(/\s+/)[0]; }
      if (custom.tagline) b.tagline = custom.tagline;
      if (HEX.test(custom.primary || '')) b.primary = custom.primary;
      if (HEX.test(custom.secondary || '')) b.secondary = custom.secondary;
      b.logo = safeLogo(custom.logo);
      b.custom = true;
    }
    return b;
  }
  let brandConfig = resolveBrand();

  /* ---------- colour helpers ---------- */
  const lum = hex => { const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  const onColor = hex => lum(hex) > .42 ? '#121528' : '#FFFFFF';
  const initials = s => (String(s).trim().split(/\s+/).map(w => (w.match(/[a-z0-9]/i) || [''])[0]).join('').slice(0, 2) || 'A').toUpperCase();

  /* Apply brandConfig to the whole UI: CSS variables, titles, PWA meta, icons */
  function applyBrand() {
    const b = brandConfig, r = document.documentElement.style;
    r.setProperty('--p', b.primary); r.setProperty('--accent', b.primary); r.setProperty('--s', b.secondary);
    r.setProperty('--on-p', onColor(b.primary)); r.setProperty('--on-s', onColor(b.secondary));
    document.title = b.name;
    $('#metaTheme').setAttribute('content', b.primary);
    $('#metaAppTitle').setAttribute('content', b.short);
    $('#metaAppName').setAttribute('content', b.short);
    makeIcon(b).then(url => { if (url) { $('#linkIcon').href = url; $('#linkTouch').href = url; } });
  }
  function makeIcon(b) {
    return new Promise(res => {
      try {
        const c = document.createElement('canvas'); c.width = c.height = 180; const x = c.getContext('2d');
        x.fillStyle = b.primary; x.beginPath(); x.roundRect ? x.roundRect(0, 0, 180, 180, 40) : x.rect(0, 0, 180, 180); x.fill();
        const text = () => { x.fillStyle = onColor(b.primary); x.font = '800 72px "Plus Jakarta Sans", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(initials(b.name), 90, 96); res(c.toDataURL('image/png')); };
        if (b.logo && b.logo.startsWith('data:')) { const im = new Image(); im.onload = () => { x.drawImage(im, 20, 20, 140, 140); res(c.toDataURL('image/png')); }; im.onerror = text; im.src = b.logo; }
        else text();
      } catch (e) { res(''); }
    });
  }

  /* ================= DOM helpers ================= */
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
    home: ['M3 11l9-8 9 8', 'M5 10v10h14V10'], book: ['M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z', 'M4 19V5'],
    live: ['M12 12h.01', 'M8.5 8.5a5 5 0 0 0 0 7', 'M15.5 8.5a5 5 0 0 1 0 7', 'M5.6 5.6a9 9 0 0 0 0 12.8', 'M18.4 5.6a9 9 0 0 1 0 12.8'],
    user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'], play: ['M8 5.5v13l10.5-6.5z'],
    lock: ['M6 10h12v10H6z', 'M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10'], check: ['M5 12.5l4.5 4.5L19 7.5'], x: ['M6 6l12 12', 'M18 6L6 18'],
    bell: ['M6 16V11a6 6 0 0 1 12 0v5l2 2H4z', 'M10 20a2 2 0 0 0 4 0'], brush: ['M4 20c3 0 5-2 5-5l9-9a2 2 0 0 0-3-3l-9 9c-3 0-5 2-5 5', 'M14 6l4 4'],
    send: ['M4 12l16-8-6 16-2.5-6.5z'], chev: ['M9 6l6 6-6 6'], back: ['M15 6l-6 6 6 6'], plus: ['M12 5v14', 'M5 12h14'],
    mega: ['M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1z', 'M17 9a4 4 0 0 1 0 6'], crown: ['M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z'],
    chat: ['M4 5h16v11H8l-4 4z'], mail: ['M3 6h18v12H3z', 'M3 7l9 6 9-6'], logout: ['M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3', 'M10 17l5-5-5-5', 'M15 12H4'],
    shield: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'M9 12l2 2 4-4'], upload: ['M12 16V4', 'M7 9l5-5 5 5', 'M4 20h16'], link: ['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1', 'M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'],
    trash: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13'], cal: ['M4 6h16v14H4z', 'M4 10h16', 'M8 3v4', 'M16 3v4'], eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  };
  function icon(name, cls) {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', name === 'play' ? 'currentColor' : 'none'); s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
    if (cls) s.setAttribute('class', cls);
    for (const d of ICONS[name]) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); s.append(p); }
    return s;
  }
  function logo(size, radius, fs) {
    const b = brandConfig;
    const box = el('span', { class: 'logo', css: { width: size + 'px', height: size + 'px', 'border-radius': radius + 'px', 'font-size': fs + 'px' }, 'aria-hidden': 'true' });
    if (b.logo) { const im = el('img', { src: b.logo, alt: '', referrerpolicy: 'no-referrer' }); im.addEventListener('error', () => { im.remove(); box.textContent = initials(b.name); }); box.append(im); }
    else box.textContent = initials(b.name);
    return box;
  }
  function ytId(raw) {
    const s = String(raw || '').trim();
    if (/^[\w-]{11}$/.test(s)) return s;
    try { const u = new URL(s), h = u.hostname.replace(/^(www|m)\./, ''); let id = null;
      if (h === 'youtu.be') id = u.pathname.slice(1, 12);
      else if (h === 'youtube.com' || h === 'youtube-nocookie.com') id = u.searchParams.get('v') || (u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/) || [])[1];
      return id && /^[\w-]{11}$/.test(id) ? id : null; } catch (e) { return null; }
  }
  const thumb = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const ago = t => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? m + 'm ago' : m < 1440 ? Math.floor(m / 60) + 'h ago' : Math.floor(m / 1440) + 'd ago'; };

  /* ================= content per base brand ================= */
  const L = (title, yt, access, dur) => ({ id: uid(), title, yt, access, dur });
  function seedContent(base) {
    const now = Date.now(), day = 864e5, at = (d, h, m) => { const x = new Date(now + d * day); x.setHours(h, m, 0, 0); return x.getTime(); };
    if (base === 'skillcraft') return {
      courses: [
        { id: uid(), title: 'Web Foundations', sub: 'HTML, CSS & JavaScript from scratch', lectures: [L('HTML crash course', 'UB1O30fR-EE', 'free', '1:00:41'), L('CSS crash course', 'yfoY53QXEnI', 'free', '1:25:11'), L('JavaScript crash course', 'hdI2bqOjy3c', 'paid', '1:40:30')] },
        { id: uid(), title: 'Python & CS', sub: 'Programming fundamentals that stick', lectures: [L('Intro to programming & CS', 'zOjov-2OZ0E', 'free', '1:59:59'), L('Python for beginners', 'kqtD5dpn9C8', 'paid', '1:00:06'), L('What is a neural network?', 'aircAruvnKk', 'paid', '18:40')] },
      ],
      announcements: [{ id: uid(), text: 'Mock interview slots for Friday are open. Book from the Live tab.', t: now - 3 * 3600e3 }, { id: uid(), text: 'New: JavaScript crash course added to Web Foundations.', t: now - 2 * day }],
      live: { on: false, title: '', startedAt: 0 },
      schedule: [{ id: uid(), title: 'Build a to-do app, live', at: at(0, 19, 0) }, { id: uid(), title: 'Python Q&A clinic', at: at(1, 18, 30) }, { id: uid(), title: 'Mock interview: arrays', at: at(3, 17, 0) }],
      chat: [],
    };
    return {
      courses: [
        { id: uid(), title: 'Physics & Calculus', sub: 'Motion, rates of change, waves', lectures: [L('Motion in a straight line', 'ZM8ECpBuQYE', 'free', '10:59'), L('The essence of calculus', 'WUvTyaaNkzM', 'free', '17:04'), L('The Fourier transform, visualised', 'spUNpyF58BY', 'paid', '20:56')] },
        { id: uid(), title: 'Chemistry & Biology', sub: 'Atoms, carbon and the maths behind them', lectures: [L('The nucleus: intro to chemistry', 'FSyAehMdpyI', 'free', '10:12'), L('Carbon: building block of life', 'QnQe0xW_JY4', 'paid', '11:52'), L('Vectors, what even are they?', 'fNk_zzaMoSs', 'paid', '9:52')] },
      ],
      announcements: [{ id: uid(), text: 'Unit test 3 on Saturday, 10 am. Syllabus: Motion + Calculus basics.', t: now - 5 * 3600e3 }, { id: uid(), text: 'Doubt-clearing live class every evening at 7 pm this week.', t: now - day }],
      live: { on: true, title: "Newton's laws: live doubt clearing", startedAt: now - 12 * 60000 },
      schedule: [{ id: uid(), title: 'Organic chemistry basics', at: at(1, 19, 0) }, { id: uid(), title: 'Integration in 60 minutes', at: at(2, 18, 0) }, { id: uid(), title: 'Unit test 3 discussion', at: at(4, 17, 30) }],
      chat: [{ id: uid(), who: 'Teacher', role: 'teacher', text: 'Welcome! Drop your doubts here.', t: now - 11 * 60000 }, { id: uid(), who: 'Kabir', role: 'student', text: 'Sir, is F = ma valid when mass changes?', t: now - 6 * 60000 }],
    };
  }
  const base = () => (PRESETS[brandConfig.id] ? brandConfig.id : 'apex');
  const DATA_KEY = () => 'academyapp.data.' + base() + '.v1';
  const SESS_KEY = () => 'academyapp.session.' + base() + '.v1';
  const validData = d => d && Array.isArray(d.courses) && Array.isArray(d.announcements) && d.live && Array.isArray(d.schedule) && Array.isArray(d.chat);
  let data, S;
  function loadState() {
    data = store.get(DATA_KEY()); if (!validData(data)) { data = seedContent(base()); store.set(DATA_KEY(), data); }
    S = Object.assign({ user: null, watched: [], owner: false, tab: 'home', course: null, reminders: [], splashSeen: false }, store.get(SESS_KEY()) || {});
  }
  const save = () => store.set(DATA_KEY(), data);
  const saveS = () => store.set(SESS_KEY(), S);
  const allLectures = () => data.courses.flatMap(c => c.lectures.map(l => ({ c, l })));

  /* ================= toasts + sheets ================= */
  function toast(msg, ic) {
    const t = el('div', { class: 'toast' }, icon(ic || 'check'), el('span', { text: msg }));
    $('#toasts').append(t);
    const g = G(); if (g) g.from(t, { y: -16, opacity: 0, scale: .92, duration: .45, ease: 'back.out(1.8)' });
    setTimeout(() => { if (g) g.to(t, { opacity: 0, y: -10, duration: .3, onComplete: () => t.remove() }); else t.remove(); }, 2600);
  }
  let closeSheetFn = null;
  function sheet(build, onClose) {
    closeSheet();
    const box = el('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true' });
    const scrim = el('div', { class: 'scrim', onclick: e => { if (e.target === scrim) closeSheet(); } }, box);
    box.append(el('button', { class: 'icon-btn x', 'aria-label': 'Close', onclick: () => closeSheet() }, icon('x')));
    build(box, () => closeSheet());
    document.body.append(scrim); document.body.style.overflow = 'hidden';
    const g = G(); if (g) { g.from(scrim, { opacity: 0, duration: .2 }); g.from(box, { y: 80, duration: .5, ease: 'back.out(1.2)' }); }
    closeSheetFn = () => { scrim.remove(); document.body.style.overflow = ''; if (onClose) onClose(); };
  }
  function closeSheet() { if (!closeSheetFn) return; const f = closeSheetFn; closeSheetFn = null; f(); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (drawerOpen) closeDrawer(); else if (closeSheetFn) closeSheet(); else if (room) leaveRoom(); } });

  /* ================= render ================= */
  const app = $('#app');
  function render(anim) {
    app.replaceChildren(S.user ? shell() : splash());
    const g = G(), ins = app.querySelectorAll('[data-in]');
    if (anim && g && ins.length) g.from(ins, { y: 16, opacity: 0, duration: .5, stagger: .05, ease: 'power3.out', clearProps: 'transform,opacity' });
  }

  /* ---------- splash + direct login ---------- */
  function splash() {
    const b = brandConfig;
    const name = el('input', { class: 'input', id: 'lgName', placeholder: 'Your name', maxlength: '40', autocomplete: 'name' });
    const contact = el('input', { class: 'input', id: 'lgContact', placeholder: 'Email or 10-digit phone', autocomplete: 'email' });
    const err = el('p', { class: 'err', role: 'alert' });
    const login = el('form', { class: 'login', novalidate: true, onsubmit: e => {
      e.preventDefault(); err.textContent = '';
      const raw = contact.value.trim(), isEmail = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(raw), digits = raw.replace(/\D/g, '');
      if (!isEmail && !(digits.length >= 10 && digits.length <= 13 && /^[+\d\s-]+$/.test(raw))) { contact.classList.add('bad'); err.textContent = 'Enter a valid email or phone number.'; return; }
      signIn({ name: (name.value.trim() || (isEmail ? raw.split('@')[0] : 'Student')).slice(0, 40), contact: isEmail ? raw.toLowerCase() : digits.slice(-10), tier: 'free' });
    } },
      el('h2', { text: 'Welcome to ' + b.short }),
      el('p', { text: 'Log in to start learning. No codes, no setup.' }),
      el('div', { class: 'demo-pick' },
        el('button', { type: 'button', onclick: () => signIn({ name: 'Riya Sharma', contact: 'riya@demo.in', tier: 'free' }) }, el('span', { class: 'badge b-free', text: 'Free' }), el('strong', { text: 'Free student' }), el('span', { text: 'Free lectures only' })),
        el('button', { type: 'button', onclick: () => signIn({ name: 'Arjun Mehta', contact: 'arjun@demo.in', tier: 'paid' }) }, el('span', { class: 'badge b-paid' }, icon('crown'), 'Paid'), el('strong', { text: 'Paid student' }), el('span', { text: 'All lectures + live' }))),
      el('div', { class: 'or', text: 'or with your details' }),
      el('div', { class: 'field' }, name), el('div', { class: 'field' }, contact), err,
      el('button', { class: 'btn btn-p btn-block', css: { 'min-height': '52px' } }, 'Continue'),
      el('button', { type: 'button', class: 'owner-link', onclick: () => signIn({ name: b.teacher || 'Academy owner', contact: b.email, tier: 'paid' }, true) }, 'Academy owner? ', el('b', { text: 'Log in to manage' })));
    contact.addEventListener('input', () => contact.classList.remove('bad'));
    const view = el('div', { class: 'splash' },
      el('div', { class: 'sp-brand' }, logo(96, 30, 36), el('h1', { text: b.name }), el('p', { text: b.tagline })),
      login);
    const g = G();
    if (g && !S.splashSeen) {
      requestAnimationFrame(() => {
        g.from(view.querySelector('.sp-brand .logo'), { scale: .3, rotation: -20, opacity: 0, duration: .9, ease: 'back.out(1.6)' });
        g.from(view.querySelectorAll('.sp-brand h1, .sp-brand p'), { y: 16, opacity: 0, duration: .6, stagger: .1, delay: .3 });
        g.from(login, { yPercent: 100, duration: .8, delay: .7, ease: 'power3.out' });
      });
      S.splashSeen = true; saveS();
    }
    return view;
  }
  function signIn(user, owner) {
    S.user = user; S.owner = !!owner; S.tab = owner ? 'profile' : 'home'; S.course = null; saveS();
    render(true); toast('Welcome, ' + user.name.split(' ')[0] + '!');
  }

  /* ---------- shell: top bar + tab + bottom nav ---------- */
  function shell() {
    const b = brandConfig, frag = el('div');
    const liveOn = data.live.on;
    frag.append(el('header', { class: 'top' }, logo(38, 12, 15),
      el('div', { class: 'nm' }, el('strong', { text: b.name }), el('span', { text: S.owner ? 'Owner mode' : b.tagline })),
      el('button', { class: 'icon-btn customize', 'aria-label': 'Customize brand', title: 'Customize brand', onclick: openDrawer }, icon('brush')),
      el('button', { class: 'icon-btn', 'aria-label': 'Announcements', onclick: () => { S.tab = 'home'; saveS(); render(true); setTimeout(() => { const a = $('#annH'); if (a) a.scrollIntoView({ behavior: 'smooth' }); }, 60); } }, icon('bell'), data.announcements.length ? el('span', { class: 'pip' }) : null)));
    if (S.owner) frag.append(el('div', { class: 'owner-bar' }, icon('crown'), 'Owner mode: you can add lectures, post updates and go live.'));
    const page = el('main', { class: 'page' });
    page.append(S.tab === 'courses' ? courses() : S.tab === 'live' ? live() : S.tab === 'profile' ? profile() : home());
    frag.append(page);
    const tabs = [['home', 'home', 'Home'], ['courses', 'book', 'Courses'], ['live', 'live', 'Live'], ['profile', 'user', 'Profile']];
    frag.append(el('nav', { class: 'nav', role: 'tablist', 'aria-label': 'Main' }, ...tabs.map(([k, ic, lab]) => el('button', { role: 'tab', 'aria-selected': String(S.tab === k), onclick: () => { if (S.tab === k && k !== 'courses') return; S.tab = k; if (k === 'courses') S.course = null; saveS(); render(true); scrollTo({ top: 0 }); } },
      el('i', null, icon(ic)), lab, k === 'live' && liveOn ? el('span', { class: 'ndot' }) : null))));
    return frag;
  }

  /* ---------- home ---------- */
  function home() {
    const b = brandConfig, wrap = el('div');
    const first = S.user.name.split(' ')[0];
    wrap.append(el('div', { class: 'hello', 'data-in': '' }, el('p', { text: greet() + ',' }), el('h1', { text: first + ' 👋' })));
    wrap.append(el('section', { class: 'banner', 'data-in': '' },
      el('span', { class: 'badge', text: b.banner.tag }), el('h2', { text: b.banner.title }), el('p', { text: b.banner.sub }),
      el('button', { class: 'btn btn-sm', onclick: () => { S.tab = 'courses'; S.course = null; saveS(); render(true); } }, 'Explore courses', icon('chev'))));
    if (data.live.on) wrap.append(el('div', { class: 'live-strip', 'data-in': '' }, el('span', { class: 'badge b-live' }, el('span', { class: 'dot' }), 'LIVE'),
      el('div', { class: 't' }, el('strong', { text: data.live.title }), el('span', { text: (b.teacher || 'Teacher') + ' · started ' + ago(data.live.startedAt) })),
      el('button', { class: 'btn btn-sm', onclick: () => { S.tab = 'live'; saveS(); render(true); } }, 'Join')));
    // continue watching
    const last = [...S.watched].reverse().map(id => allLectures().find(x => x.l.id === id)).find(Boolean);
    const next = last ? last.c.lectures[last.c.lectures.indexOf(last.l) + 1] || last.l : allLectures()[0] && allLectures()[0].l;
    const nextC = next && allLectures().find(x => x.l === next);
    if (nextC) {
      wrap.append(el('div', { class: 'sec-h' }, el('h2', { text: last ? 'Continue learning' : 'Start here' })));
      wrap.append(el('button', { class: 'card cont', 'data-in': '', css: { width: '100%', 'text-align': 'left' }, onclick: () => openLecture(nextC.c, nextC.l) },
        el('span', { class: 'th' }, el('img', { src: thumb(next.yt), alt: '', loading: 'lazy' }), icon(locked(next) ? 'lock' : 'play')),
        el('div', { class: 't' }, el('strong', { text: next.title }), el('span', { text: nextC.c.title + ' · ' + (next.dur || 'Video') }))));
    }
    // courses rail
    wrap.append(el('div', { class: 'sec-h' }, el('h2', { text: 'Your courses' }), el('button', { onclick: () => { S.tab = 'courses'; S.course = null; saveS(); render(true); } }, 'See all')));
    wrap.append(el('div', { class: 'rail', 'data-in': '' }, ...data.courses.map(c => courseCard(c))));
    // announcements
    wrap.append(el('div', { class: 'sec-h', id: 'annH' }, el('h2', { text: 'Announcements' })));
    wrap.append(data.announcements.length ? el('div', { class: 'card', 'data-in': '' }, ...[...data.announcements].sort((a, z) => z.t - a.t).slice(0, 4).map(a => el('div', { class: 'ann' }, el('i', null, icon('mega')), el('div', null, el('p', { text: a.text }), el('span', { text: ago(a.t) })))))
      : el('p', { class: 'empty', text: 'No announcements yet.' }));
    return wrap;
  }
  const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
  const progressOf = c => c.lectures.length ? c.lectures.filter(l => S.watched.includes(l.id)).length / c.lectures.length : 0;
  function courseCard(c) {
    const first = c.lectures[0];
    return el('button', { class: 'ccard', onclick: () => { S.tab = 'courses'; S.course = c.id; saveS(); render(true); } },
      el('div', { class: 'cv' }, first ? el('img', { src: thumb(first.yt), alt: '', loading: 'lazy' }) : null, el('span', { class: 'badge b-p', css: { background: 'rgba(255,255,255,.92)' }, text: c.lectures.length + ' lectures' })),
      el('div', { class: 'cb' }, el('strong', { text: c.title }), el('span', { text: c.sub || '' }), el('div', { class: 'prog' }, el('i', { css: { width: Math.round(progressOf(c) * 100) + '%' } }))));
  }

  /* ---------- courses ---------- */
  const locked = l => l.access === 'paid' && S.user.tier !== 'paid';
  function courses() {
    const c = data.courses.find(x => x.id === S.course);
    if (c) return courseDetail(c);
    const wrap = el('div');
    wrap.append(el('div', { class: 'hello', 'data-in': '' }, el('p', { text: data.courses.length + ' courses · ' + allLectures().length + ' lectures' }), el('h1', { text: 'Courses' })));
    data.courses.forEach(c => {
      const free = c.lectures.filter(l => l.access === 'free').length;
      wrap.append(el('button', { class: 'card course', 'data-in': '', onclick: () => { S.course = c.id; saveS(); render(true); } },
        el('span', { class: 'cv' }, c.lectures[0] ? el('img', { src: thumb(c.lectures[0].yt), alt: '', loading: 'lazy' }) : null),
        el('div', { class: 't' }, el('strong', { text: c.title }), el('span', { text: c.lectures.length + ' lectures · ' + free + ' free' }), el('div', { class: 'prog' }, el('i', { css: { width: Math.round(progressOf(c) * 100) + '%' } }))),
        icon('chev')));
    });
    if (S.user.tier !== 'paid') wrap.append(el('button', { class: 'btn btn-s btn-block', css: { 'margin-top': '8px' }, onclick: () => upgrade() }, icon('crown'), 'Unlock every course · ' + rs(brandConfig.price) + '/mo'));
    return wrap;
  }
  function courseDetail(c) {
    const wrap = el('div');
    wrap.append(el('button', { class: 'back-row', onclick: () => { S.course = null; saveS(); render(true); } }, icon('back'), 'All courses'));
    wrap.append(el('div', { class: 'c-hero', 'data-in': '' }, c.lectures[0] ? el('img', { src: thumb(c.lectures[0].yt), alt: '' }) : null, el('div', null, el('h1', { text: c.title }), el('p', { text: c.lectures.length + ' lectures · ' + Math.round(progressOf(c) * 100) + '% complete' }))));
    const list = el('div', { class: 'card', 'data-in': '', css: { padding: '4px 14px', 'margin-top': '12px' } });
    if (!c.lectures.length) list.append(el('p', { class: 'empty', text: 'Lectures coming soon.' }));
    c.lectures.forEach((l, i) => {
      const lk = locked(l), done = S.watched.includes(l.id);
      list.append(el('button', { class: 'lec' + (lk ? ' locked' : done ? ' done' : ''), onclick: () => openLecture(c, l) },
        el('span', { class: 'n' }, lk ? icon('lock') : done ? icon('check') : String(i + 1).padStart(2, '0')),
        el('div', { class: 't' }, el('strong', { text: l.title }), el('span', { text: (l.dur || 'Video') + (done ? ' · watched' : '') })),
        el('span', { class: 'badge ' + (l.access === 'paid' ? 'b-paid' : 'b-free'), text: l.access === 'paid' ? 'Paid' : 'Free' })));
    });
    wrap.append(list);
    return wrap;
  }
  function openLecture(c, l) {
    if (locked(l)) return upgrade(l);
    if (!S.watched.includes(l.id)) { S.watched.push(l.id); saveS(); }
    const nxt = c.lectures[c.lectures.indexOf(l) + 1];
    sheet((box) => {
      const wm = el('span', { class: 'wm', text: S.user.contact + ' · ' + S.user.name });
      const player = el('div', { class: 'player' },
        REEL ? el('div', { class: 'reel-poster' }, el('img', { src: thumb(l.yt), alt: '' }), el('span', { class: 'reel-bar' }, el('i')))
          : el('iframe', { src: `https://www.youtube-nocookie.com/embed/${l.yt}?autoplay=1&rel=0&modestbranding=1`, title: l.title, allow: 'autoplay; encrypted-media; picture-in-picture', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin' }),
        el('span', { class: 'wm-tile', 'aria-hidden': 'true' }), wm);
      // anti-piracy watermark: drifts to a new random spot every few seconds
      const move = () => { if (!wm.isConnected) return clearInterval(t); wm.style.left = (4 + Math.random() * 52) + '%'; wm.style.top = (8 + Math.random() * 76) + '%'; };
      const t = setInterval(move, 2800); setTimeout(move, 60);
      box.append(player,
        el('span', { class: 'badge ' + (l.access === 'paid' ? 'b-paid' : 'b-free'), text: l.access === 'paid' ? 'Paid lecture' : 'Free lecture' }),
        el('h2', { text: l.title, css: { 'margin-top': '8px' } }),
        el('p', { class: 'lead', text: c.title + ' · ' + (l.dur || 'Video') }),
        el('p', { class: 'hint', css: { display: 'flex', gap: '6px', 'align-items': 'center', 'margin-top': '12px' } }, icon('shield'), 'Protected: your ' + (S.user.contact.includes('@') ? 'email' : 'phone') + ' is watermarked on this video.'),
        nxt ? el('button', { class: 'btn btn-line btn-block', css: { 'margin-top': '14px' }, onclick: () => openLecture(c, nxt) }, 'Next: ' + nxt.title, icon('chev')) : null);
    }, () => render(false));
  }
  function upgrade(lec) {
    const b = brandConfig;
    sheet((box, close) => {
      const body = el('div');
      let m = 'UPI';
      const methods = el('div', { class: 'pay-m', role: 'group', 'aria-label': 'Payment method' }, ...['UPI', 'Card', 'NetBanking'].map(x => el('button', { 'aria-pressed': String(x === m), text: x, onclick: e => { m = x; $$('button', methods).forEach(z => z.setAttribute('aria-pressed', String(z === e.currentTarget))); } })));
      body.append(el('span', { class: 'badge b-p', text: b.short + ' Pro' }),
        el('h2', { text: lec ? 'Unlock “' + lec.title + '”' : 'Upgrade to Paid', css: { 'margin-top': '10px' } }),
        el('p', { class: 'lead', text: 'One plan unlocks every course and live class.' }),
        el('div', { class: 'price' }, el('b', { text: rs(b.price) }), el('span', { text: '/ month' })),
        el('ul', { class: 'perks' }, ...['All ' + allLectures().length + ' lectures, including paid ones', 'Join live classes and chat with your teacher', 'New lectures the day they are added', 'Watch on phone, tablet or laptop'].map(t => el('li', null, icon('check'), el('span', { text: t })))),
        methods,
        el('button', { class: 'btn btn-p btn-block', css: { 'min-height': '52px' }, onclick: () => {
          body.replaceChildren(el('div', { class: 'center' }, el('div', { class: 'spinner' }), el('strong', { text: 'Processing ' + rs(b.price) + ' via ' + m + '…' }), el('p', { class: 'hint', text: 'Demo payment, nothing is charged.' })));
          setTimeout(() => {
            S.user.tier = 'paid'; saveS();
            const tk = el('div', { class: 'tick' }, icon('check'));
            body.replaceChildren(el('div', { class: 'center' }, tk, el('h2', { text: 'You’re all set!', css: { padding: 0 } }), el('p', { class: 'lead', text: 'Every course at ' + b.name + ' is unlocked.' }),
              el('button', { class: 'btn btn-p', onclick: () => { close(); if (lec) { const x = allLectures().find(z => z.l.id === lec.id); if (x) openLecture(x.c, x.l); } } }, lec ? 'Watch now' : 'Start learning')));
            const g = G(); if (g) g.from(tk, { scale: 0, rotation: -90, duration: .7, ease: 'back.out(2)' });
          }, 1400);
        } }, icon('lock'), 'Pay ' + rs(b.price) + ' & unlock'),
        el('p', { class: 'hint', css: { 'text-align': 'center', 'margin-top': '10px' }, text: 'Demo payment: upgrades instantly on this device.' }));
      box.append(body);
    }, () => render(false));
  }

  /* ---------- live ---------- */
  function live() {
    const b = brandConfig, wrap = el('div'), on = data.live.on, paid = S.user.tier === 'paid';
    wrap.append(el('div', { class: 'hello', 'data-in': '' }, el('p', { text: on ? 'Happening now' : 'Live classes' }), el('h1', { text: 'Live' })));
    if (S.owner) {
      const title = el('input', { class: 'input', placeholder: 'Class title', maxlength: '70', value: on ? data.live.title : '', 'aria-label': 'Live class title', disabled: on });
      wrap.append(el('div', { class: 'card golive', 'data-in': '' },
        el('div', { class: 'row' }, el('strong', { text: on ? 'You are live' : 'Go live now' }),
          el('button', { class: 'switch live', role: 'switch', 'aria-checked': String(on), 'aria-label': 'Go live', onclick: () => {
            if (!data.live.on) { data.live = { on: true, title: title.value.trim() || 'Live class', startedAt: Date.now() }; toast('You are live! Paid students can join.', 'live'); }
            else { data.live.on = false; toast('Live class ended'); }
            save(); render(false);
          } })),
        on ? null : title));
    }
    if (on) {
      wrap.append(el('section', { class: 'live-hero', 'data-in': '' },
        el('span', { class: 'badge b-live' }, el('span', { class: 'dot' }), 'LIVE NOW'),
        el('h2', { text: data.live.title }), el('p', { text: (b.teacher || 'Teacher') + ' · started ' + ago(data.live.startedAt) + ' · ' + viewers() + ' watching' }),
        paid ? el('button', { class: 'btn btn-p btn-block', onclick: openRoom }, icon('live'), 'Join Live Now')
          : el('button', { class: 'btn btn-s btn-block', onclick: () => upgrade() }, icon('lock'), 'Upgrade to join live')));
    } else wrap.append(el('div', { class: 'card', 'data-in': '', css: { padding: '18px' } }, el('strong', { text: 'No class live right now' }), el('p', { class: 'hint', text: 'You will get a notification when your teacher goes live.' })));
    wrap.append(el('div', { class: 'sec-h' }, el('h2', { text: 'Upcoming' })));
    const list = el('div', { class: 'card', 'data-in': '' });
    [...data.schedule].sort((a, z) => a.at - z.at).forEach(s => {
      const d = new Date(s.at), on2 = S.reminders.includes(s.id);
      list.append(el('div', { class: 'sched' },
        el('div', { class: 'd' }, el('b', { text: String(d.getDate()) }), el('span', { text: d.toLocaleDateString('en-IN', { month: 'short' }) })),
        el('div', { class: 't' }, el('strong', { text: s.title }), el('span', { text: d.toLocaleDateString('en-IN', { weekday: 'short' }) + ' · ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) })),
        el('button', { class: 'remind', 'aria-pressed': String(on2), onclick: e => {
          const i = S.reminders.indexOf(s.id); if (i >= 0) S.reminders.splice(i, 1); else S.reminders.push(s.id); saveS();
          const p = S.reminders.includes(s.id); e.currentTarget.setAttribute('aria-pressed', String(p)); e.currentTarget.lastChild.textContent = p ? 'Set' : 'Remind';
          toast(p ? 'Reminder set for ' + s.title : 'Reminder removed', 'bell');
        } }, icon('bell'), on2 ? 'Set' : 'Remind')));
    });
    wrap.append(list);
    return wrap;
  }
  const viewers = () => 24 + Math.floor((Date.now() / 9000) % 11);
  let room = null;
  const PEERS = ['Ananya', 'Kabir', 'Meera', 'Ishaan', 'Zoya', 'Vikram', 'Sara'];
  const LINES = ['Understood 👍', 'Can you repeat that step?', 'Please share notes after class', 'This is so clear now', 'Audio is clear ✅', 'Will this come in the exam?', 'Thank you!'];
  function openRoom() {
    const b = brandConfig;
    const msgs = el('div', { class: 'msgs' });
    const inp = el('input', { placeholder: 'Ask a doubt…', maxlength: '200', 'aria-label': 'Chat message' });
    const wm = el('span', { class: 'wm', text: S.user.contact });
    const slide = el('div', { class: 'slide' }, el('small', { text: b.short + ' · Live' }), el('b', { text: data.live.title }), el('i', { css: { width: '92%' } }), el('i', { css: { width: '76%' } }), el('i', { css: { width: '84%' } }), el('i', { css: { width: '58%' } }));
    const stream = el('div', { class: 'stream' }, slide, teacherArt(),
      el('span', { class: 'badge b-live' }, el('span', { class: 'dot' }), 'LIVE'),
      el('div', { class: 'wave', 'aria-hidden': 'true' }, ...Array.from({ length: 8 }, (_, i) => el('i', { css: { 'animation-delay': (i * .11) + 's' } }))), wm);
    const vEl = el('span', { class: 'v', text: viewers() + ' watching' });
    const node = el('div', { class: 'room', role: 'dialog', 'aria-label': 'Live class' },
      el('div', { class: 'room-top' }, logo(32, 10, 12), el('strong', { text: data.live.title }), vEl, el('button', { class: 'btn btn-sm', css: { background: 'var(--live)', color: '#fff' }, onclick: () => leaveRoom() }, 'Leave')),
      stream,
      el('div', { class: 'chat' }, msgs, el('form', { class: 'chat-form', onsubmit: e => { e.preventDefault(); const t = inp.value.trim(); if (!t) return; post(S.user.name, S.owner ? 'teacher' : 'student', t); inp.value = ''; } }, inp, el('button', { class: 'btn btn-p', 'aria-label': 'Send' }, icon('send')))));
    document.body.append(node); document.body.style.overflow = 'hidden';
    room = { node, msgs, seen: new Set(), timers: [] };
    drawChat();
    const g = G();
    if (g) { g.from(node, { opacity: 0, scale: 1.03, duration: .35 }); g.fromTo(slide.querySelectorAll('i'), { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: .5, repeat: -1, repeatDelay: 3, ease: 'power2.out' }); }
    room.timers.push(setInterval(() => { wm.style.left = (4 + Math.random() * 60) + '%'; wm.style.top = (8 + Math.random() * 80) + '%'; vEl.textContent = viewers() + ' watching'; }, 2800));
    room.timers.push(setInterval(() => { if (Math.random() < .6) post(PEERS[Math.floor(Math.random() * PEERS.length)], 'student', LINES[Math.floor(Math.random() * LINES.length)]); }, 6000));
  }
  function teacherArt() {
    const b = brandConfig, s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 100 110'); s.setAttribute('aria-hidden', 'true');
    const add = (t, a) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); s.append(n); return n; };
    add('path', { d: 'M12 110c3-26 18-38 38-38s35 12 38 38z', fill: b.primary });
    add('circle', { cx: 50, cy: 46, r: 20, fill: '#E9C3A0' });
    add('path', { d: 'M30 44c0-16 10-22 20-22s21 5 20 22c-5-8-13-10-20-10s-15 2-20 10z', fill: '#2B2118' });
    const mouth = add('ellipse', { cx: 50, cy: 55, rx: 5, ry: 1.6, fill: '#8A4B3A' });
    const g = G(); if (g) g.to(mouth, { attr: { ry: 3.6 }, duration: .17, repeat: -1, yoyo: true, repeatDelay: .06 });
    return el('div', { class: 'teacher' }, s, el('span', { text: b.teacher || 'Teacher' }));
  }
  function post(who, role, text) {
    data.chat.push({ id: uid(), who: String(who).slice(0, 40), role, text: String(text).slice(0, 200), t: Date.now() });
    if (data.chat.length > 80) data.chat.splice(0, data.chat.length - 80);
    save(); drawChat();
  }
  function drawChat() {
    if (!room) return;
    for (const m of data.chat) {
      if (room.seen.has(m.id)) continue; room.seen.add(m.id);
      const me = m.who === S.user.name;
      const n = el('div', { class: 'msg' }, el('span', { class: 'av', css: { background: m.role === 'teacher' ? 'var(--p)' : 'rgba(255,255,255,.12)', color: m.role === 'teacher' ? 'var(--on-p)' : '#fff' }, text: initials(m.who) }),
        el('div', null, el('b', null, me ? m.who + ' (you)' : m.who, m.role === 'teacher' ? el('em', { text: 'Teacher' }) : null), el('p', { text: m.text })));
      room.msgs.append(n);
    }
    room.msgs.scrollTop = room.msgs.scrollHeight;
  }
  function leaveRoom() {
    if (!room) return;
    room.timers.forEach(clearInterval);
    if (window.gsap) window.gsap.killTweensOf(room.node.querySelectorAll('*'));
    room.node.remove(); room = null; document.body.style.overflow = '';
    render(false);
  }

  /* ---------- profile + owner studio ---------- */
  function profile() {
    const b = brandConfig, u = S.user, wrap = el('div');
    const watched = S.watched.filter(id => allLectures().some(x => x.l.id === id)).length, total = allLectures().length;
    wrap.append(el('div', { class: 'card me', 'data-in': '', css: { 'margin-top': '8px' } }, el('span', { class: 'av', text: initials(u.name) }),
      el('div', { css: { flex: '1', 'min-width': '0' } }, el('strong', { text: u.name }), el('span', { text: u.contact })),
      el('span', { class: 'badge ' + (u.tier === 'paid' ? 'b-paid' : 'b-free'), text: u.tier === 'paid' ? 'Paid' : 'Free' })));
    wrap.append(el('div', { class: 'stats', 'data-in': '' },
      el('div', { class: 'stat' }, el('b', { text: String(watched) }), el('span', { text: 'watched' })),
      el('div', { class: 'stat' }, el('b', { text: (total ? Math.round(watched / total * 100) : 0) + '%' }), el('span', { text: 'complete' })),
      el('div', { class: 'stat' }, el('b', { text: String(S.reminders.length) }), el('span', { text: 'reminders' }))));
    if (u.tier !== 'paid') wrap.append(el('button', { class: 'btn btn-s btn-block', css: { 'margin-top': '12px' }, onclick: () => upgrade() }, icon('crown'), 'Upgrade · ' + rs(b.price) + '/mo'));
    const wa = 'https://wa.me/' + b.whatsapp + '?text=' + encodeURIComponent('Hi ' + b.short + ', I need help with the app. (' + u.name + ')');
    const ownerSw = el('button', { class: 'switch', role: 'switch', 'aria-checked': String(!!S.owner), 'aria-label': 'Academy owner mode', onclick: () => { S.owner = !S.owner; saveS(); render(false); toast(S.owner ? 'Owner mode on' : 'Owner mode off', 'crown'); } });
    wrap.append(el('div', { class: 'sec-h' }, el('h2', { text: 'Help & settings' })));
    wrap.append(el('div', { class: 'card menu-list', 'data-in': '' },
      el('a', { class: 'mrow', href: wa, target: '_blank', rel: 'noopener noreferrer' }, icon('chat'), el('div', { class: 't' }, 'WhatsApp support', el('span', { text: '+' + b.whatsapp })), icon('chev', 'chev')),
      el('a', { class: 'mrow', href: 'mailto:' + b.email }, icon('mail'), el('div', { class: 't' }, 'Email us', el('span', { text: b.email })), icon('chev', 'chev')),
      el('div', { class: 'mrow' }, icon('crown'), el('div', { class: 't' }, 'Academy owner mode', el('span', { text: 'Add lectures, post updates, go live' })), ownerSw),
      el('button', { class: 'mrow', onclick: () => { S.user = null; S.owner = false; S.tab = 'home'; saveS(); render(true); } }, icon('logout'), el('div', { class: 't' }, 'Log out'))));
    if (S.owner) wrap.append(studio());
    wrap.append(el('p', { class: 'foot-note', text: b.name + ' app · v1.0' }));
    return wrap;
  }
  function studio() {
    const frag = el('div', { 'data-in': '' });
    // add lecture
    const courseSel = el('select', { class: 'select', 'aria-label': 'Course' }, ...data.courses.map(c => el('option', { value: c.id, text: c.title })));
    const t = el('input', { class: 'input', placeholder: 'Lecture title', maxlength: '80', 'aria-label': 'Lecture title' });
    const u = el('input', { class: 'input', placeholder: 'YouTube link', inputmode: 'url', 'aria-label': 'YouTube URL' });
    const prev = el('div'); let access = 'free';
    const seg = el('div', { class: 'seg', role: 'group', 'aria-label': 'Access' }, ...['free', 'paid'].map(v => el('button', { type: 'button', 'aria-pressed': String(v === access), text: v === 'free' ? 'Free' : 'Paid', onclick: e => { access = v; $$('button', seg).forEach(z => z.setAttribute('aria-pressed', String(z === e.currentTarget))); } })));
    const err = el('p', { class: 'err' });
    u.addEventListener('input', () => { u.classList.remove('bad'); const id = ytId(u.value); prev.replaceChildren(...(id ? [el('div', { class: 'yt-ok' }, el('img', { src: thumb(id), alt: '' }), 'Valid YouTube video')] : [])); });
    frag.append(el('form', { class: 'card studio', novalidate: true, onsubmit: e => {
      e.preventDefault(); err.textContent = '';
      const id = ytId(u.value), title = t.value.trim();
      if (!title) { t.classList.add('bad'); err.textContent = 'Add a title.'; return; }
      if (!id) { u.classList.add('bad'); err.textContent = 'Paste a youtube.com or youtu.be link.'; return; }
      const c = data.courses.find(x => x.id === courseSel.value) || data.courses[0];
      c.lectures.push({ id: uid(), title, yt: id, access, dur: '' }); save(); render(false); toast('Lecture added to ' + c.title);
    } }, el('h3', null, icon('plus'), 'Add a lecture'),
      el('div', { class: 'field' }, courseSel), el('div', { class: 'field' }, t), el('div', { class: 'field' }, u), prev,
      el('div', { class: 'field', css: { 'grid-auto-flow': 'column', 'justify-content': 'space-between', 'align-items': 'center' } }, el('span', { class: 'hint', text: 'Who can watch?' }), seg),
      err, el('button', { class: 'btn btn-p btn-block' }, icon('plus'), 'Add lecture')));
    // announcement
    const ta = el('textarea', { class: 'textarea', maxlength: '160', placeholder: 'e.g. Test postponed to Monday', 'aria-label': 'Announcement' });
    frag.append(el('form', { class: 'card studio', onsubmit: e => {
      e.preventDefault(); const txt = ta.value.trim(); if (!txt) { ta.focus(); return; }
      data.announcements.push({ id: uid(), text: txt, t: Date.now() }); save(); render(false); toast('Announcement posted', 'mega');
    } }, el('h3', null, icon('mega'), 'Post an announcement'), el('div', { class: 'field' }, ta), el('button', { class: 'btn btn-p btn-block' }, 'Post to all students'),
      ...[...data.announcements].sort((a, z) => z.t - a.t).slice(0, 3).map(a => el('div', { class: 'ann', css: { padding: '12px 0 0' } }, el('div', { css: { flex: '1' } }, el('p', { text: a.text }), el('span', { text: ago(a.t) })),
        el('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Delete announcement', onclick: () => { data.announcements = data.announcements.filter(x => x !== a); save(); render(false); } }, icon('trash'))))));
    // go live shortcut
    frag.append(el('div', { class: 'card studio' }, el('h3', null, icon('live'), 'Live class'),
      el('p', { class: 'hint', text: data.live.on ? 'You are live: ' + data.live.title : 'Start a class from the Live tab.' }),
      el('button', { class: 'btn btn-line btn-block', css: { 'margin-top': '10px' }, onclick: () => { S.tab = 'live'; saveS(); render(true); } }, data.live.on ? 'Manage live class' : 'Go live', icon('chev'))));
    return frag;
  }

  /* ================= Client Pitch Customizer ================= */
  let drawerOpen = false;
  const SWATCHES = ['#2952E3', '#0E9F6E', '#7048E8', '#E8590C', '#D6336C', '#0C8599', '#C92A2A', '#212529'];
  const SWATCHES2 = ['#FF9F1C', '#1B3A4B', '#FFD43B', '#20C997', '#F06595', '#FFFFFF', '#343A40', '#74C0FC'];
  function openDrawer() {
    if (drawerOpen) return; drawerOpen = true;
    const b = brandConfig;
    let draft = { base: base(), name: b.name, tagline: b.tagline, logo: b.logo, primary: b.primary, secondary: b.secondary };
    const prevChip = el('div', { class: 'preview-chip' });
    const commit = () => {
      store.set(CUSTOM_KEY, draft) || toast('Logo too large to save, try a smaller image', 'brush');
      brandConfig = resolveBrandFrom(draft);
      applyBrand(); render(false); paintPreview();
    };
    const paintPreview = () => prevChip.replaceChildren(logo(40, 12, 15), el('div', null, el('strong', { text: brandConfig.name }), el('span', { text: 'Live preview · applied to the whole app' })));
    const nameIn = el('input', { class: 'input', value: draft.name, maxlength: '40', 'aria-label': 'Academy name', oninput: e => { draft.name = e.target.value.trim() || PRESETS[draft.base].name; commit(); } });
    const tagIn = el('input', { class: 'input', value: draft.tagline, maxlength: '60', 'aria-label': 'Tagline', oninput: e => { draft.tagline = e.target.value.trim(); commit(); } });
    const urlIn = el('input', { class: 'input', placeholder: 'https://…/logo.png', value: draft.logo && !draft.logo.startsWith('data:') ? draft.logo : '', 'aria-label': 'Logo URL', inputmode: 'url' });
    const logoErr = el('p', { class: 'err' });
    urlIn.addEventListener('change', () => { const v = urlIn.value.trim(); if (!v) { draft.logo = ''; commit(); return; } const ok = safeLogo(v); logoErr.textContent = ok ? '' : 'Use an https:// image link.'; if (ok) { draft.logo = ok; commit(); } });
    const file = el('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', hidden: true, onchange: e => {
      const f = e.target.files && e.target.files[0]; if (!f || !/^image\//.test(f.type)) return;
      const rd = new FileReader();
      rd.onload = () => { const im = new Image(); im.onload = () => {
        const c = document.createElement('canvas'), n = 192; c.width = c.height = n; const x = c.getContext('2d');
        const sc = Math.max(n / im.width, n / im.height), w = im.width * sc, h = im.height * sc;
        x.fillStyle = '#fff'; x.fillRect(0, 0, n, n); x.drawImage(im, (n - w) / 2, (n - h) / 2, w, h);
        draft.logo = c.toDataURL('image/png'); urlIn.value = ''; logoErr.textContent = ''; commit();
      }; im.src = rd.result; };
      rd.readAsDataURL(f);
    } });
    const swRow = (list, key) => {
      const row = el('div', { class: 'sw-row', role: 'group', 'aria-label': key === 'primary' ? 'Primary colour' : 'Secondary colour' });
      const sync = () => $$('.sw', row).forEach(s => s.setAttribute('aria-pressed', String(s.dataset.c.toLowerCase() === draft[key].toLowerCase())));
      list.forEach(c => row.append(el('button', { type: 'button', class: 'sw', 'data-c': c, css: { '--c': c }, 'aria-label': c, onclick: () => { draft[key] = c; pick.value = c; sync(); commit(); } })));
      const pick = el('input', { type: 'color', value: draft[key], 'aria-label': 'Custom colour', oninput: e => { if (HEX.test(e.target.value)) { draft[key] = e.target.value; sync(); commit(); } } });
      row.append(el('label', { class: 'picker', title: 'Any colour' }, pick));
      sync();
      return row;
    };
    const baseSeg = el('div', { class: 'seg', role: 'group', 'aria-label': 'Demo content' }, ...Object.values(PRESETS).map(p => el('button', { type: 'button', 'aria-pressed': String(p.id === draft.base), text: p.id === 'apex' ? 'Science' : 'Coding', onclick: () => { draft.base = p.id; store.set(CUSTOM_KEY, draft); const os = ['android', 'ios'].includes(params.get('os')) ? params.get('os') : ''; history.replaceState(null, '', os ? '?os=' + os : '?'); location.reload(); } })));
    const d = el('aside', { class: 'drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Customize brand' },
      el('button', { class: 'icon-btn x', 'aria-label': 'Close', onclick: closeDrawer }, icon('x')),
      el('h2', null, icon('brush'), 'Customize brand'),
      el('p', { class: 'lead', text: 'Re-skin the whole app for the academy you are pitching. Changes apply instantly.' }),
      prevChip,
      el('div', { class: 'field' }, el('label', { text: 'Academy name' }), nameIn),
      el('div', { class: 'field' }, el('label', { text: 'Tagline' }), tagIn),
      el('div', { class: 'field' }, el('label', { text: 'Logo' }),
        el('div', { class: 'logo-row' }, el('button', { type: 'button', class: 'btn btn-line btn-sm', onclick: () => file.click() }, icon('upload'), 'Upload'), el('button', { type: 'button', class: 'btn btn-soft btn-sm', onclick: () => { draft.logo = ''; urlIn.value = ''; commit(); } }, 'Use initials'), file),
        urlIn, logoErr),
      el('div', { class: 'field' }, el('label', { text: 'Primary colour' }), swRow(SWATCHES, 'primary')),
      el('div', { class: 'field' }, el('label', { text: 'Secondary colour' }), swRow(SWATCHES2, 'secondary')),
      el('div', { class: 'field' }, el('label', { text: 'Demo courses' }), baseSeg),
      el('button', { class: 'btn btn-p btn-block', css: { 'margin-top': '6px' }, onclick: () => {
        const q = new URLSearchParams({ brand: draft.base, name: draft.name, color: draft.primary.slice(1), color2: draft.secondary.slice(1) });
        if (draft.logo && !draft.logo.startsWith('data:')) q.set('logo', draft.logo);
        const link = location.origin + location.pathname + '?' + q.toString();
        (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(() => toast('Pitch link copied', 'link'), () => { prompt('Copy this pitch link:', link); });
      } }, icon('link'), 'Copy pitch link'),
      el('button', { class: 'btn btn-line btn-block', css: { 'margin-top': '10px' }, onclick: () => { store.del(CUSTOM_KEY); brandConfig = JSON.parse(JSON.stringify(PRESETS[draft.base])); applyBrand(); closeDrawer(); render(false); toast('Back to ' + brandConfig.name); } }, 'Reset to original brand'));
    const scrim = el('div', { class: 'drawer-scrim', onclick: closeDrawer });
    document.body.append(scrim, d); paintPreview();
    const g = G(); if (g) { g.from(scrim, { opacity: 0, duration: .25 }); g.from(d, { xPercent: 100, duration: .5, ease: 'power3.out' }); }
    drawerEls = [scrim, d];
  }
  let drawerEls = [];
  function closeDrawer() {
    if (!drawerOpen) return; drawerOpen = false;
    const [scrim, d] = drawerEls, g = G();
    if (g) { g.to(scrim, { opacity: 0, duration: .2 }); g.to(d, { xPercent: 100, duration: .35, ease: 'power2.in', onComplete: () => { scrim.remove(); d.remove(); } }); }
    else { scrim.remove(); d.remove(); }
  }
  function resolveBrandFrom(c) {
    const b = JSON.parse(JSON.stringify(PRESETS[PRESETS[c.base] ? c.base : 'apex']));
    if (c.name) { b.name = c.name; b.short = c.name.split(/\s+/)[0]; }
    if (c.tagline) b.tagline = c.tagline;
    if (HEX.test(c.primary || '')) b.primary = c.primary;
    if (HEX.test(c.secondary || '')) b.secondary = c.secondary;
    b.logo = safeLogo(c.logo); b.custom = true;
    return b;
  }
  // let a parent page (sales showcase) open the drawer or switch brand
  window.academyApp = { openCustomizer: openDrawer, brand: () => JSON.parse(JSON.stringify(brandConfig)) };

  /* cross-tab sync of content (e.g. owner on one device, student on another) */
  addEventListener('storage', e => {
    if (e.key === DATA_KEY()) { const f = store.get(DATA_KEY()); if (validData(f)) { data = f; if (room) drawChat(); else if (!closeSheetFn && !drawerOpen && !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) render(false); } }
    if (e.key === CUSTOM_KEY && !params.get('brand')) { brandConfig = resolveBrand(); applyBrand(); if (!drawerOpen) render(false); }
  });

  loadState();
  applyBrand();
  if (REEL) window.academyApp.boot = () => render(true);
  else render(true);
})();
