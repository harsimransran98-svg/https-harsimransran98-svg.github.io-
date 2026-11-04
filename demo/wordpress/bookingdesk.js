/* BookingDesk — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
   All DOM is built with createElement + textContent. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap || null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} } };
  let tt = null;
  const toast = msg => { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(tt); if (G && !reduced) G.fromTo(t, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'back.out(2)' }); tt = setTimeout(() => { t.hidden = true; }, 2600); };
  let ac = null;
  const tone = (f = 440, d = .12, type = 'sine', v = .05) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + d + .02); } catch (_) {} };
  const audio = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); return ac; } catch (_) { return null; } };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- smooth scroll (Lenis) + ScrollTrigger ---------- */
  let lenis = null;
  if (G && window.ScrollTrigger) G.registerPlugin(ScrollTrigger);
  if (window.Lenis && G && !reduced) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    G.ticker.add(t => lenis.raf(t * 1000)); G.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'); const t = id.length > 1 ? $(id) : null; if (!t && id !== '#top') return; e.preventDefault(); closeMenu(); if (lenis) lenis.scrollTo(id === '#top' ? 0 : t, { offset: -70 }); else (t || document.body).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }));
  const nav = $('#nav'), prog = $('#prog');
  const onScroll = () => { const h = document.documentElement, y = window.scrollY; nav.classList.toggle('scrolled', y > 40); prog.style.transform = `scaleX(${Math.min(1, y / ((h.scrollHeight - h.clientHeight) || 1))})`; };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- animated menu ---------- */
  const burger = $('#burger'), menu = $('#menu'), variant = +menu.dataset.variant;
  let menuOpen = false, back = null;
  function openMenu() {
    menuOpen = true; menu.hidden = false; burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Close menu');
    if (lenis) lenis.stop(); document.documentElement.style.overflow = 'hidden';
    const links = menu.querySelectorAll('nav a, .mnote');
    if (variant === 2) { back = el('div', 'menu-back'); back.addEventListener('click', closeMenu); document.body.append(back); }
    if (G && !reduced) {
      if (variant === 1) G.fromTo(menu, { clipPath: 'circle(0% at calc(100% - 44px) 40px)' }, { clipPath: 'circle(150% at calc(100% - 44px) 40px)', duration: .8, ease: 'power3.inOut' });
      if (variant === 2) { G.fromTo(menu, { xPercent: 100 }, { xPercent: 0, duration: .8, ease: 'elastic.out(1,.85)' }); G.from(back, { opacity: 0, duration: .3 }); }
      if (variant === 3) G.fromTo(menu, { scaleY: 0 }, { scaleY: 1, duration: .6, ease: 'expo.inOut' });
      if (variant === 4) { G.set(menu, { clipPath: 'none' }); G.fromTo(menu.querySelectorAll('.tiles i'), { scale: 0, borderRadius: '50%' }, { scale: 1.02, borderRadius: '0%', duration: .55, stagger: .07, ease: 'power3.out' }); }
      G.fromTo(links, { y: 60, opacity: 0, rotation: variant === 3 ? 4 : 0 }, { y: 0, opacity: 1, rotation: 0, duration: .7, stagger: .06, delay: .25, ease: 'expo.out' });
    }
    setTimeout(() => { const a = menu.querySelector('nav a'); if (a) a.focus(); }, 300);
  }
  function closeMenu() {
    if (!menuOpen) return; menuOpen = false; burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu');
    if (lenis) lenis.start(); document.documentElement.style.overflow = '';
    const done = () => { menu.hidden = true; if (G) G.set(menu, { clearProps: 'all' }); if (back) { back.remove(); back = null; } };
    if (G && !reduced) {
      if (variant === 1) G.to(menu, { clipPath: 'circle(0% at calc(100% - 44px) 40px)', duration: .55, ease: 'power3.inOut', onComplete: done });
      else if (variant === 2) { G.to(menu, { xPercent: 100, duration: .45, ease: 'power3.in', onComplete: done }); if (back) G.to(back, { opacity: 0, duration: .3 }); }
      else if (variant === 3) G.to(menu, { scaleY: 0, transformOrigin: '50% 100%', duration: .5, ease: 'expo.inOut', onComplete: done });
      else G.to(menu.querySelectorAll('.tiles i, nav a, .mnote'), { scale: 0, opacity: 0, duration: .35, stagger: .03, ease: 'power2.in', onComplete: done });
    } else done();
    burger.focus();
  }
  burger.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) closeMenu(); });

  /* ---------- buttons ---------- */
  const BTN = 1;
  $$('.btn').forEach(b => {
    if (BTN === 4) { const label = b.textContent; b.textContent = ''; const r = el('span', 'roll'); r.append(el('span', null, label), el('span', null, label)); b.append(r); b.setAttribute('aria-label', label); }
    if (BTN === 2 && G && !reduced) {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); G.to(b, { x: (e.clientX - r.left - r.width / 2) * .35, y: (e.clientY - r.top - r.height / 2) * .45, duration: .4, ease: 'power3.out' }); });
      b.addEventListener('pointerleave', () => G.to(b, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.35)' }));
    }
  });

  /* ---------- hero + reveals (responsive with matchMedia) ---------- */
  if (G && !reduced) {
    G.from('#h1 .w > span', { yPercent: 115, duration: 1.1, stagger: .07, ease: 'expo.out', delay: .15 });
    G.from('.hero .kick, .hero .lead, .hero .acts, .hero .stats', { y: 24, opacity: 0, duration: .9, stagger: .1, ease: 'expo.out', delay: .45 });
    G.from('.orb', { scale: .4, opacity: 0, duration: 1.6, stagger: .15, ease: 'expo.out' });
    const mm = G.matchMedia();
    mm.add('(min-width: 861px)', () => { if (window.ScrollTrigger) $$('.orb').forEach((o, i) => G.to(o, { yPercent: (i % 2 ? -1 : 1) * 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } })); });
    if (window.ScrollTrigger) G.from('.wpa', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.wpa', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };

/* ---------- plugin simulator ---------- */
  function demo(root, H) {
    const { el, G, reduced, toast } = H;
    const SERVICES = [{ n: 'Signature cut', m: 45, p: 55 }, { n: 'Colour & gloss', m: 120, p: 140 }, { n: 'Beard sculpt', m: 30, p: 28 }, { n: 'Scalp ritual', m: 60, p: 75 }];
    const STAFF = [{ n: 'Amara', c: '#C8553D', start: 9, end: 17, does: [0, 1, 3] }, { n: 'Diego', c: '#6B8F71', start: 11, end: 19, does: [0, 2] }, { n: 'Mei', c: '#8E6C8A', start: 9, end: 15, does: [1, 3] }];
    const on = [true, true, true];
    const S = { svc: 0, day: 0, staff: -1, slot: null };
    const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; });
    let seed = 13; const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const booked = {}; days.forEach((d, di) => STAFF.forEach((s, si) => { for (let h = 9; h < 19; h += .5) if (r() < .28) booked[`${di}-${si}-${h}`] = true; }));
    const wrap = el('div', 'bd'), colA = el('div', 'bd-a'), colB = el('div', 'bd-b');
    const svcBox = el('div', 'bd-svcs'), staffBox = el('div', 'bd-staff'), cal = el('div', 'bd-cal'), slots = el('div', 'bd-slots'), sum = el('div', 'bd-sum');
    colA.append(el('p', 'bd-l', '1 · Service'), svcBox, el('p', 'bd-l', 'Team today · admin toggles'), staffBox);
    colB.append(el('p', 'bd-l', '2 · Date'), cal, el('p', 'bd-l', '3 · Time'), slots, sum);
    wrap.append(colA, colB); root.append(wrap);
    const modal = el('div', 'bd-modal'); modal.hidden = true; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Booking confirmation preview'); root.append(modal);
    const hhmm = h => `${Math.floor(h)}:${h % 1 ? '30' : '00'}`;
    function renderSvcs() { svcBox.replaceChildren(); SERVICES.forEach((s, i) => { const b = el('button', 'bd-svc'); b.type = 'button'; b.setAttribute('aria-pressed', String(i === S.svc)); b.append(el('b', null, s.n), el('span', null, `${s.m} min`), el('em', null, `$${s.p}`)); b.addEventListener('click', () => { S.svc = i; S.slot = null; renderAll(); }); svcBox.append(b); }); }
    function renderStaff() { staffBox.replaceChildren(); STAFF.forEach((s, i) => { const row = el('div', 'bd-st' + (on[i] ? '' : ' off')); const av = el('span', 'bd-av', s.n[0]); av.style.background = s.c; const info = el('div'); info.append(el('b', null, s.n), el('span', null, `${hhmm(s.start)}–${hhmm(s.end)} · ${s.does.map(x => SERVICES[x].n.split(' ')[0]).join(', ')}`)); const tg = el('button', 'bd-tg'); tg.type = 'button'; tg.setAttribute('role', 'switch'); tg.setAttribute('aria-checked', String(on[i])); tg.setAttribute('aria-label', `${s.n} is working`); tg.addEventListener('click', () => { on[i] = !on[i]; if (S.staff === i && !on[i]) S.staff = -1; S.slot = null; renderAll(); toast(on[i] ? `${s.n} is back on the rota.` : `${s.n} marked off. Their slots disappear for clients instantly.`); }); row.append(av, info, tg); staffBox.append(row); }); }
    function renderCal() { cal.replaceChildren(); days.forEach((d, i) => { const b = el('button', 'bd-day'); b.type = 'button'; b.setAttribute('aria-pressed', String(i === S.day)); const closed = d.getDay() === 1; b.disabled = closed; b.append(el('small', null, d.toLocaleDateString([], { weekday: 'short' })), el('b', null, d.getDate()), el('i', null, closed ? 'closed' : `${free(i).length}`)); b.addEventListener('click', () => { S.day = i; S.slot = null; renderAll(); }); cal.append(b); }); }
    function free(di) {
      const svc = SERVICES[S.svc], need = svc.m / 60, out = [];
      for (let h = 9; h + need <= 19; h += .5) {
        const who = STAFF.map((s, si) => si).filter(si => on[si] && STAFF[si].does.includes(S.svc) && h >= STAFF[si].start && h + need <= STAFF[si].end && (S.staff < 0 || S.staff === si) && Array.from({ length: need * 2 }, (_, k) => !booked[`${di}-${si}-${h + k * .5}`]).every(Boolean));
        if (who.length) out.push({ h, who });
      }
      if (di === 0) { const n = new Date(), cur = n.getHours() + n.getMinutes() / 60; return out.filter(o => o.h > cur + .5); }
      return out;
    }
    function renderSlots() {
      slots.replaceChildren(); const list = free(S.day);
      const pick = el('div', 'bd-who'); [-1, ...STAFF.map((_, i) => i)].forEach(i => { if (i >= 0 && (!on[i] || !STAFF[i].does.includes(S.svc))) return; const b = el('button', 'bd-chip', i < 0 ? 'Anyone' : STAFF[i].n); b.type = 'button'; b.setAttribute('aria-pressed', String(S.staff === i)); b.addEventListener('click', () => { S.staff = i; S.slot = null; renderAll(); }); pick.append(b); }); slots.append(pick);
      if (!list.length) { slots.append(el('p', 'bd-none', 'No free slots that day. Try another date or switch someone back on.')); return; }
      const g = el('div', 'bd-grid'); list.forEach(o => { const b = el('button', 'bd-slot', hhmm(o.h)); b.type = 'button'; b.setAttribute('aria-pressed', String(S.slot && S.slot.h === o.h)); b.addEventListener('click', () => { S.slot = o; renderSlots(); renderSum(true); }); g.append(b); }); slots.append(g);
    }
    function renderSum(anim) {
      sum.replaceChildren(); if (!S.slot) { sum.append(el('p', 'bd-none', 'Pick a time to continue.')); return; }
      const svc = SERVICES[S.svc], who = STAFF[S.staff >= 0 ? S.staff : S.slot.who[0]], d = days[S.day];
      sum.append(el('b', null, `${svc.n} with ${who.n}`), el('span', null, `${d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })} · ${hhmm(S.slot.h)}–${hhmm(S.slot.h + svc.m / 60)} · $${svc.p}`));
      const b = el('button', 'btn pri', 'Preview client confirmation'); b.type = 'button'; b.addEventListener('click', () => openModal(svc, who, d)); sum.append(b);
      if (anim && G && !reduced) G.fromTo(sum, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'back.out(2)' });
    }
    function openModal(svc, who, d) {
      modal.replaceChildren(); const card = el('div', 'bd-card'), ref = 'ND-' + Math.floor(1000 + Math.random() * 9000);
      const x = el('button', 'bd-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close preview');
      card.append(x, el('p', 'bd-l', 'Email to client · preview'), el('h4', null, 'You’re booked in ✓'), el('p', null, `Hi Jordan, your ${svc.n.toLowerCase()} with ${who.n} is confirmed.`));
      const dl = el('dl'); [['When', `${d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}, ${hhmm(S.slot.h)}`], ['Length', `${svc.m} minutes`], ['Price', `$${svc.p} · $15 deposit paid`], ['Where', 'Northwind Studio, 18 Canal St'], ['Reference', ref]].forEach(([k, v]) => { const r2 = el('div'); r2.append(el('dt', null, k), el('dd', null, v)); dl.append(r2); });
      const acts = el('div', 'bd-acts'); ['Add to calendar', 'Reschedule', 'Cancel'].forEach(t => { const b = el('span', 'bd-link', t); acts.append(b); });
      const conf = el('button', 'btn pri', 'Confirm booking'); conf.type = 'button'; conf.addEventListener('click', () => { const key = `${S.day}-${STAFF.indexOf(who)}-${S.slot.h}`; for (let k = 0; k < svc.m / 30; k++) booked[`${S.day}-${STAFF.indexOf(who)}-${S.slot.h + k * .5}`] = true; close(); S.slot = null; renderAll(); toast(`Booked ${ref}. Reminder SMS scheduled for 24 h before.`); });
      card.append(dl, acts, conf); modal.append(card); modal.hidden = false;
      const close = () => { modal.hidden = true; }; x.addEventListener('click', close); modal.addEventListener('click', e => { if (e.target === modal) close(); });
      if (G && !reduced) { G.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: .25 }); G.fromTo(card, { y: 40, scale: .92, rotation: -2 }, { y: 0, scale: 1, rotation: 0, duration: .6, ease: 'back.out(1.8)' }); }
      conf.focus();
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) modal.hidden = true; });
    function renderAll() { renderSvcs(); renderStaff(); renderCal(); renderSlots(); renderSum(false); }
    if (days[0].getDay() === 1) S.day = 1;
    renderAll();
  }

  demo(document.getElementById('demo'), H);
})();
