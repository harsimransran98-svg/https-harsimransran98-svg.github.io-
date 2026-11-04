/* Halcyon Clinic — live demo build (Bazozo Studio) */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  $('#year').textContent = new Date().getFullYear();
  const h = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const s = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.append(n); return n; };

  /* ---------- seeded availability (stable per date, so it doesn't reshuffle) ---------- */
  function rng(seed) { let x = 0; for (const c of seed) x = (x * 31 + c.charCodeAt(0)) >>> 0; return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const lastDay = new Date(today); lastDay.setDate(lastDay.getDate() + 60);
  function slotsFor(date, who, mins) {
    if (date < today || date > lastDay || date.getDay() === 0) return [];
    const r = rng(iso(date) + (who || 'any'));
    const full = r() < .1;
    const out = [];
    for (let m = 9 * 60; m + mins <= 18 * 60; m += 45) {
      const dt = new Date(date); dt.setHours(0, m, 0, 0);
      const past = dt.getTime() < Date.now() + 2 * 3600e3;
      out.push({ m, label: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`, free: !full && !past && r() > .45 });
    }
    return out;
  }
  const fmtDay = d => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  (function nextAvailable() {
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      const free = slotsFor(d, 'any', 60).find(x => x.free);
      if (free) { const t = `${i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : fmtDay(d)} · ${free.label}`; $('#nextSlot').textContent = t; $('#islandNext').textContent = 'Next: ' + t; return; }
    }
  })();

  /* ---------- pill → glass navigation island ---------- */
  const pill = $('#pill'), island = $('#island'), pillLbl = $('#pillLbl');
  function islandTarget() {
    const pr = pill.getBoundingClientRect();
    island.hidden = false;
    const w = Math.min(560, window.innerWidth - 32);
    island.style.width = w + 'px'; island.style.height = 'auto';
    const hgt = island.querySelector('.island-in').offsetHeight;
    return { pr, to: { left: Math.max(16, Math.min(pr.right - w, window.innerWidth - w - 16)), top: pr.bottom + 12, width: w, height: hgt, borderRadius: 30 } };
  }
  function setIsland(open) {
    pill.setAttribute('aria-expanded', String(open));
    pill.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    pillLbl.textContent = open ? 'Close' : 'Menu';
    const { pr, to } = islandTarget();
    const from = { left: pr.left, top: pr.top, width: pr.width, height: pr.height, borderRadius: pr.height / 2 };
    const inner = island.querySelector('.island-in');
    if (!hasGsap || reduced) { Object.assign(island.style, px(to)); island.hidden = !open; return; }
    gsap.killTweensOf([island, inner]);
    if (open) {
      gsap.fromTo(island, from, { ...to, duration: 1, ease: 'elastic.out(1, .78)' });
      gsap.fromTo(inner, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: .5, delay: .25, ease: 'power2.out' });
    } else {
      gsap.to(inner, { opacity: 0, duration: .15 });
      gsap.to(island, { ...from, duration: .5, ease: 'power3.inOut', onComplete: () => { island.hidden = true; } });
    }
  }
  const px = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v + 'px']));
  pill.addEventListener('click', () => setIsland(pill.getAttribute('aria-expanded') !== 'true'));
  island.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setIsland(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !island.hidden) { setIsland(false); pill.focus(); } });
  document.addEventListener('click', e => { if (!island.hidden && !island.contains(e.target) && !pill.contains(e.target)) setIsland(false); });
  window.addEventListener('resize', () => { if (!island.hidden) { const { to } = islandTarget(); Object.assign(island.style, px(to)); } });

  /* ---------- soft magnetic buttons ---------- */
  function magnetize(btn) {
    if (!fine || reduced || !hasGsap || btn._mag) return;
    btn._mag = true;
    const lbl = btn.querySelector('.lbl');
    const bx = gsap.quickTo(btn, 'x', { duration: .8, ease: 'power3.out' }), by = gsap.quickTo(btn, 'y', { duration: .8, ease: 'power3.out' });
    const lx = lbl && gsap.quickTo(lbl, 'x', { duration: .8, ease: 'power3.out' }), ly = lbl && gsap.quickTo(lbl, 'y', { duration: .8, ease: 'power3.out' });
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
      bx(dx * .22); by(dy * .3); if (lbl) { lx(dx * .1); ly(dy * .14); }
    });
    btn.addEventListener('pointerleave', () => { bx(0); by(0); if (lbl) { lx(0); ly(0); } });
  }

  /* ---------- treatment results timeline ---------- */
  const TL = {
    collagen: { label: 'Collagen induction', keys: [0, 1, 2, 4, 6, 8, 12],
      m: { Texture: [40, 38, 45, 58, 68, 76, 84], Hydration: [50, 48, 55, 62, 66, 70, 72], 'Tone evenness': [55, 52, 58, 64, 70, 74, 78], Redness: [10, 70, 35, 15, 10, 8, 6] },
      ms: [[0, 'Day 0 · Treatment', 'Fine needling triggers the skin to start making new collagen.'], [1, 'Week 1 · Recovery', 'Pink and tight for two or three days, like mild sunburn. Normal.'], [3, 'Weeks 2–3 · Settling', 'Redness fades; skin feels smoother as the surface turns over.'], [7, 'Weeks 4–7 · Rebuilding', 'New collagen forms. Texture and fine lines start to soften visibly.'], [12, 'Weeks 8–12 · Full effect', 'Peak results. Most people book a maintenance session at six months.']] },
    hydra: { label: 'Hydra renewal', keys: [0, 1, 2, 4, 6, 8, 12],
      m: { Texture: [40, 52, 56, 62, 66, 68, 70], Hydration: [45, 80, 78, 82, 85, 86, 88], 'Tone evenness': [55, 60, 62, 66, 68, 70, 72], Redness: [10, 18, 10, 8, 6, 6, 6] },
      ms: [[0, 'Day 0 · Treatment', 'Cleanse, exfoliate, extract, then a hydrating serum infusion.'], [1, 'Week 1 · Glow', 'Plump, hydrated skin straight away, with no downtime.'], [4, 'Weeks 2–4 · Second session', 'A monthly rhythm keeps hydration up between sessions.'], [12, 'Weeks 5–12 · Steady state', 'With three sessions, texture and tone hold steadily better.']] },
    pigment: { label: 'Pigment correction', keys: [0, 1, 2, 4, 6, 8, 12],
      m: { Texture: [45, 44, 48, 52, 55, 58, 60], Hydration: [50, 48, 52, 55, 57, 58, 60], 'Tone evenness': [35, 30, 42, 55, 66, 76, 86], Redness: [10, 45, 25, 12, 8, 6, 5] },
      ms: [[0, 'Day 0 · First pass', 'Low-energy laser targets pigment without heating the whole skin.'], [1, 'Week 1 · Darkening', 'Spots look darker for a few days before they lift. Expected.'], [4, 'Weeks 2–4 · Lifting', 'Treated pigment flakes away; the second pass is booked now.'], [12, 'Weeks 5–12 · Even tone', 'After three sessions most sun spots are faded. SPF keeps them away.']] }
  };
  let tlKey = 'collagen';
  const tabs = $('#tlTabs');
  Object.entries(TL).forEach(([k, v], i) => {
    const b = h('button', null, v.label); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.k = k;
    b.setAttribute('aria-selected', String(i === 0));
    b.addEventListener('click', () => { tlKey = k; $$('#tlTabs button').forEach(x => x.setAttribute('aria-selected', String(x === b))); paintTL(true); });
    tabs.append(b);
  });
  // static skin details, generated once
  const R = rng('halcyon-skin');
  const pores = $('#pores'), lines = $('#lines'), spots = $('#spots');
  for (let i = 0; i < 180; i++) s('circle', { cx: (R() * 400).toFixed(1), cy: (R() * 400).toFixed(1), r: (.8 + R() * 1.6).toFixed(1), fill: '#B98468', opacity: (.25 + R() * .4).toFixed(2) }, pores);
  [['M70 150 Q140 135 210 150', 2.2], ['M90 175 Q160 162 230 178', 1.6], ['M250 250 Q290 265 330 255', 2], ['M120 290 Q170 300 215 286', 1.4], ['M270 120 Q300 140 320 170', 1.5], ['M60 230 Q90 250 120 245', 1.2]]
    .forEach(([d, w]) => s('path', { d, 'stroke-width': w, opacity: .7 }, lines));
  for (let i = 0; i < 28; i++) s('ellipse', { cx: (60 + R() * 280).toFixed(1), cy: (60 + R() * 280).toFixed(1), rx: (3 + R() * 9).toFixed(1), ry: (3 + R() * 8).toFixed(1), fill: '#8F5A3E', opacity: (.3 + R() * .4).toFixed(2) }, spots);
  const metricsEl = $('#metrics');
  const metricRows = {};
  ['Texture', 'Hydration', 'Tone evenness', 'Redness'].forEach(k => {
    const m = h('div', 'metric' + (k === 'Redness' ? ' neg' : ''));
    const l = h('div', 'ml'); const v = h('b'); l.append(h('span', null, k), v);
    const t = h('div', 'mt'); const i = h('i'); t.append(i); m.append(l, t); metricsEl.append(m);
    metricRows[k] = { v, i };
  });
  const lerpKey = (keys, vals, w) => { for (let i = 1; i < keys.length; i++) if (w <= keys[i]) { const f = (w - keys[i - 1]) / (keys[i] - keys[i - 1]); return vals[i - 1] + (vals[i] - vals[i - 1]) * f; } return vals[vals.length - 1]; };
  const weekIn = $('#week');
  function paintTL(animate) {
    const w = +weekIn.value, T = TL[tlKey];
    weekIn.style.setProperty('--p', (w / 12 * 100) + '%');
    $('#weekNum').textContent = w;
    const vals = {};
    Object.keys(T.m).forEach(k => { vals[k] = lerpKey(T.keys, T.m[k], w); metricRows[k].v.textContent = Math.round(vals[k]) + '%'; metricRows[k].i.style.width = vals[k] + '%'; });
    const ms = T.ms.find(x => w <= x[0]) || T.ms[T.ms.length - 1];
    $('#msTitle').textContent = ms[1]; $('#msText').textContent = ms[2];
    const target = { spots: Math.max(0, 1 - (vals['Tone evenness'] - 30) / 62), lines: Math.max(0, (100 - vals.Texture) / 62), pores: Math.max(.15, (100 - vals.Texture) / 70), red: vals.Redness / 100 * .95, sheen: vals.Hydration / 100 * .85 };
    const set = (sel, o) => { if (hasGsap && !reduced && animate !== false) gsap.to(sel, { opacity: o, duration: .5, ease: 'power2.out', overwrite: true }); else $(sel).setAttribute('opacity', o); };
    set('#spots', target.spots); set('#lines', target.lines); set('#pores', target.pores); set('#redness', target.red); set('#sheen', target.sheen);
  }
  weekIn.addEventListener('input', () => paintTL(true));
  paintTL(false);

  /* ---------- booking flow ---------- */
  const TREATS = [
    { id: 'consult', name: 'Doctor consultation', mins: 60, price: '£95' },
    { id: 'hydra', name: 'Hydra renewal', mins: 45, price: 'from £140' },
    { id: 'collagen', name: 'Collagen induction', mins: 60, price: 'from £260' },
    { id: 'pigment', name: 'Pigment correction', mins: 40, price: 'from £220' }
  ];
  const PEOPLE = [
    { id: 'any', name: 'First available', role: 'Fastest appointment', init: '✦' },
    { id: 'okoye', name: 'Dr Amara Okoye', role: 'Consultant dermatologist', init: 'AO' },
    { id: 'fischer', name: 'Dr Lena Fischer', role: 'Aesthetic doctor', init: 'LF' },
    { id: 'marin', name: 'Sofia Marin', role: 'Senior skin therapist', init: 'SM' }
  ];
  const B = { step: 0, treat: null, who: null, date: null, slot: null, month: new Date(today.getFullYear(), today.getMonth(), 1), details: {} };
  const pane = $('#pane'), nextBtn = $('#nextBtn'), backBtn = $('#backBtn');
  const TITLES = [['Choose a treatment', 'You can change this at your consultation.'], ['Who would you like to see?', 'Every practitioner here is registered and insured.'], ['Pick a date', 'Dots show days with free slots. Sundays we rest.'], ['Pick a time', 'All times are local to the clinic.'], ['Your details', 'We only use these to confirm your appointment.']];

  function choiceBtn(title, sub, pressed, onClick, avatar) {
    const b = h('button', 'choice'); b.type = 'button'; b.setAttribute('aria-pressed', String(pressed));
    if (avatar) b.append(h('span', 'av', avatar));
    b.append(h('b', null, title), h('span', null, sub));
    b.addEventListener('click', onClick);
    return b;
  }
  function renderStep() {
    const st = B.step;
    $$('#steps li').forEach((li, i) => { li.classList.toggle('on', i === st); li.classList.toggle('done', i < st); });
    renderSummary();
    if (st === 5) return renderDone();
    $('#bTitle').textContent = TITLES[st][0]; $('#bSub').textContent = TITLES[st][1];
    $('#bFoot').hidden = false;
    backBtn.style.visibility = st === 0 ? 'hidden' : 'visible';
    nextBtn.querySelector('.lbl').firstChild.textContent = st === 4 ? 'Confirm booking ' : 'Continue ';
    pane.replaceChildren();
    if (st === 0) { const g = h('div', 'choices'); TREATS.forEach(t => g.append(choiceBtn(t.name, `${t.mins} min · ${t.price}`, B.treat === t, () => { B.treat = t; B.slot = null; renderStep(); }))); pane.append(g); }
    if (st === 1) { const g = h('div', 'choices'); PEOPLE.forEach(p => g.append(choiceBtn(p.name, p.role, B.who === p, () => { B.who = p; B.date = null; B.slot = null; renderStep(); }, p.init))); pane.append(g); }
    if (st === 2) renderCalendar();
    if (st === 3) renderSlots();
    if (st === 4) renderForm();
    nextBtn.disabled = !valid(st);
    if (hasGsap && !reduced) gsap.from(pane.children, { y: 14, opacity: 0, duration: .45, ease: 'power3.out', stagger: .04 });
  }
  const valid = st => (st === 0 && B.treat) || (st === 1 && B.who) || (st === 2 && B.date) || (st === 3 && B.slot) || st === 4;

  function renderCalendar() {
    const m = B.month, y = m.getFullYear(), mo = m.getMonth();
    const head = h('div', 'cal-h'); head.append(h('b', null, m.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })));
    const navs = h('div', 'cal-nav');
    const prev = h('button', null, '‹'); prev.type = 'button'; prev.setAttribute('aria-label', 'Previous month');
    const next = h('button', null, '›'); next.type = 'button'; next.setAttribute('aria-label', 'Next month');
    prev.disabled = y === today.getFullYear() && mo === today.getMonth();
    next.disabled = new Date(y, mo + 1, 1) > lastDay;
    prev.addEventListener('click', () => { B.month = new Date(y, mo - 1, 1); renderStep(); });
    next.addEventListener('click', () => { B.month = new Date(y, mo + 1, 1); renderStep(); });
    navs.append(prev, next); head.append(navs);
    const grid = h('div', 'cal'); grid.setAttribute('role', 'grid');
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(d => grid.append(h('span', 'dow', d)));
    const first = new Date(y, mo, 1), pad = (first.getDay() + 6) % 7;
    for (let i = 0; i < pad; i++) grid.append(h('span'));
    const days = new Date(y, mo + 1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const date = new Date(y, mo, d);
      const free = slotsFor(date, B.who.id, B.treat.mins).filter(x => x.free).length;
      const b = h('button', 'day' + (free && free <= 3 ? ' few' : '') + (+date === +today ? ' today' : ''), String(d)); b.type = 'button';
      b.disabled = !free;
      b.setAttribute('aria-label', `${date.toDateString()}${free ? `, ${free} slots` : ', unavailable'}`);
      b.setAttribute('aria-pressed', String(!!B.date && +B.date === +date));
      if (free) b.append(h('span', 'av-dot'));
      b.addEventListener('click', () => { B.date = date; B.slot = null; renderStep(); });
      grid.append(b);
    }
    const legend = h('div', 'legend'); const a = h('span'); a.append(h('i'), document.createTextNode('Available')); const f = h('span'); f.append(h('i', 'f'), document.createTextNode('Few left')); legend.append(a, f);
    pane.append(head, grid, legend);
  }
  function renderSlots() {
    const head = h('p', 'sub', fmtDay(B.date) + ' · ' + B.treat.mins + ' min with ' + B.who.name);
    head.style.marginBottom = '12px';
    const g = h('div', 'slots');
    slotsFor(B.date, B.who.id, B.treat.mins).forEach(x => {
      const b = h('button', 'slot', x.label); b.type = 'button'; b.disabled = !x.free;
      b.setAttribute('aria-pressed', String(B.slot === x.label));
      if (!x.free) b.setAttribute('aria-label', x.label + ', booked');
      b.addEventListener('click', () => { B.slot = x.label; renderStep(); });
      g.append(b);
    });
    pane.append(head, g);
  }
  function field(id, label, type, full, opts = {}) {
    const f = h('div', 'field' + (full ? ' full' : ''));
    const l = h('label', null, label); l.htmlFor = id;
    const i = h(type === 'textarea' ? 'textarea' : 'input'); i.id = id; if (type !== 'textarea') i.type = type;
    Object.assign(i, opts); i.value = B.details[id] || ''; i.maxLength = type === 'textarea' ? 400 : 120;
    i.addEventListener('input', () => { B.details[id] = i.value; });
    const err = h('small'); err.id = id + 'Err'; err.setAttribute('aria-live', 'polite');
    f.append(l, i, err); return f;
  }
  function renderForm() {
    const g = h('div', 'fields');
    g.append(field('fName', 'Full name', 'text', false, { autocomplete: 'name' }), field('fEmail', 'Email', 'email', false, { autocomplete: 'email' }),
      field('fPhone', 'Phone (optional)', 'tel', false, { autocomplete: 'tel' }), field('fDob', 'Date of birth (optional)', 'text', false, { placeholder: 'DD/MM/YYYY' }),
      field('fNote', 'Anything we should know?', 'textarea', true));
    const note = h('p', 'sub', 'Demo booking: nothing is sent or stored anywhere.'); note.style.marginTop = '12px';
    pane.append(g, note);
  }
  function checkForm() {
    let ok = true;
    [['fName', v => v.trim().length >= 2, 'Please enter your name'], ['fEmail', v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), 'Please enter a valid email']].forEach(([id, test, msg]) => {
      const i = $('#' + id), e = $('#' + id + 'Err'), good = test(i.value);
      i.setAttribute('aria-invalid', String(!good)); e.textContent = good ? '' : msg;
      if (!good && ok) { i.focus(); ok = false; }
    });
    return ok;
  }
  function renderSummary() {
    const sm = $('#summary'); sm.replaceChildren();
    [['Treatment', B.treat && B.treat.name], ['With', B.who && B.who.name], ['Date', B.date && fmtDay(B.date)], ['Time', B.slot]].forEach(([k, v]) => {
      if (!v) return; const d = h('div'); d.append(document.createTextNode(k + ' '), h('b', null, v)); sm.append(d);
    });
  }
  function renderDone() {
    $('#bTitle').textContent = ''; $('#bSub').textContent = ''; $('#bFoot').hidden = true;
    const ref = 'HC-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const c = h('div', 'done-card');
    const tick = h('div', 'tick'); const sv = s('svg', { viewBox: '0 0 24 24', width: 34, height: 34, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.4 }); s('path', { d: 'M5 12.5l4.2 4.2L19 7' }, sv); tick.append(sv);
    const h4 = h('h4', 'serif', `See you ${fmtDay(B.date)}, ${B.details.fName.trim().split(' ')[0]}.`);
    c.append(tick, h4, h('p', null, `${B.treat.name} with ${B.who.name} at ${B.slot}. A confirmation and the pre-visit guide would arrive by email.`), h('span', 'ref', 'Ref ' + ref));
    const row = h('div'); row.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px';
    const ics = h('button', 'mag'); ics.type = 'button'; const il = h('span', 'lbl', 'Add to calendar (.ics)'); ics.append(il);
    ics.addEventListener('click', () => downloadIcs(ref));
    const again = h('button', 'mag ghost'); again.type = 'button'; again.append(h('span', 'lbl', 'Book another'));
    again.addEventListener('click', () => { Object.assign(B, { step: 0, treat: null, who: null, date: null, slot: null, details: {} }); renderStep(); });
    row.append(ics, again); c.append(row);
    pane.replaceChildren(c);
    [ics, again].forEach(magnetize);
    if (hasGsap && !reduced) gsap.from(c.children, { y: 16, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out' });
  }
  function downloadIcs(ref) {
    const [hh, mm] = B.slot.split(':').map(Number);
    const start = new Date(B.date); start.setHours(hh, mm, 0, 0);
    const end = new Date(start.getTime() + B.treat.mins * 60000);
    const f = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Halcyon Demo//EN', 'BEGIN:VEVENT', `UID:${ref}@halcyon.example`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`, `SUMMARY:${B.treat.name} – Halcyon (demo)`, `DESCRIPTION:With ${B.who.name}. Demo booking ${ref}.`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
    const a = h('a'); a.href = url; a.download = `halcyon-${ref}.ics`; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  nextBtn.addEventListener('click', () => {
    if (B.step === 4 && !checkForm()) return;
    if (B.step === 2 && B.date) B.month = new Date(B.date.getFullYear(), B.date.getMonth(), 1);
    B.step++; renderStep();
  });
  backBtn.addEventListener('click', () => { if (B.step > 0) { B.step--; renderStep(); } });
  renderStep();
  $$('.mag').forEach(magnetize);

  /* ---------- GSAP ---------- */
  if (!hasGsap) { $$('.rv').forEach(n => { n.style.opacity = 1; n.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (reduced) { gsap.set('.rv', { opacity: 1, y: 0 }); return; }

  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.5, smoothWheel: true }); // deliberately slow: the brand's calm pace
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = document.querySelector(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -90 });
    }));
  }

  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero h1 .ln > span', { yPercent: 110, duration: 1.6, stagger: .14 })
    .from('#heroImg', { clipPath: 'inset(100% 0 0 0 round 240px 240px 30px 30px)', duration: 1.8, ease: 'expo.inOut' }, 0)
    .from('#heroImg img', { scale: 1.25, duration: 2.4 }, .2)
    .from('.glass-card', { y: 30, opacity: 0, duration: 1.2 }, 1)
    .from('.rv-h', { y: 22, opacity: 0, duration: 1.2, stagger: .12 }, .6);
  gsap.to('#heroImg img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  // gently play the timeline the first time it scrolls into view
  ScrollTrigger.create({ trigger: '#results', start: 'top 55%', once: true, onEnter: () => {
    const o = { w: 0 };
    gsap.to(o, { w: 8, duration: 2.4, ease: 'power2.inOut', onUpdate: () => { const w = Math.round(o.w); if (+weekIn.value !== w) { weekIn.value = w; paintTL(true); } } });
  } });
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.3, ease: 'expo.out', stagger: .12 }) });
})();
