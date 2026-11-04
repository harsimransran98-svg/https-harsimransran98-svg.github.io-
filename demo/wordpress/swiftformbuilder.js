/* SwiftForm Builder — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
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
    let uid = 10;
    const fields = [
      { id: 1, type: 'text', label: 'Full name', req: true },
      { id: 2, type: 'email', label: 'Email', req: true },
      { id: 3, type: 'choice', label: 'What do you need?', req: true, opts: ['Website', 'App', 'Something else'] },
      { id: 4, type: 'number', label: 'Budget (USD)', req: true, min: 1000, max: 500000, cond: { f: 3, v: 'Website' } },
      { id: 5, type: 'text', label: 'Tell us more', req: false, long: true }
    ];
    const TYPES = { text: 'Short text', email: 'Email', choice: 'Choice', number: 'Number', check: 'Checkbox' };
    let multi = true, step = 0; const vals = {}; let touched = {};
    const wrap = el('div', 'sf'), build = el('div', 'sf-build'), prev = el('div', 'sf-prev');
    const pal = el('div', 'sf-pal'); Object.entries(TYPES).forEach(([t, n]) => { const b = el('button', 'sf-add', '+ ' + n); b.type = 'button'; b.addEventListener('click', () => { const f = { id: ++uid, type: t, label: n === 'Checkbox' ? 'I agree to the terms' : 'New ' + n.toLowerCase() + ' field', req: false }; if (t === 'choice') f.opts = ['Option A', 'Option B']; if (t === 'number') { f.min = 0; f.max = 100; } fields.push(f); renderBuild(); renderPrev(); const last = build.querySelector('.sf-row:last-of-type'); if (G && !reduced && last) G.from(last, { x: -20, opacity: 0, duration: .4, ease: 'back.out(2)' }); }); pal.append(b); });
    const msRow = el('label', 'sf-ms'), ms = el('button', 'sf-tg'); ms.type = 'button'; ms.setAttribute('role', 'switch'); ms.setAttribute('aria-checked', 'true'); ms.setAttribute('aria-label', 'Multi-step form'); ms.addEventListener('click', () => { multi = !multi; ms.setAttribute('aria-checked', String(multi)); step = 0; renderPrev(); }); msRow.append(ms, el('span', null, 'Multi-step with progress bar'));
    const rows = el('div', 'sf-rows');
    build.append(el('p', 'sf-l', 'Add a field'), pal, msRow, el('p', 'sf-l', 'Fields & logic'), rows);
    wrap.append(build, prev); root.append(wrap);
    function renderBuild() {
      rows.replaceChildren();
      fields.forEach((f, i) => {
        const r = el('div', 'sf-row'); r.append(el('span', 'sf-n', String(i + 1).padStart(2, '0')));
        const lab = el('input', 'sf-in'); lab.value = f.label; lab.maxLength = 40; lab.setAttribute('aria-label', `Label for field ${i + 1}`); lab.addEventListener('input', () => { f.label = lab.value; renderPrev(); });
        const meta = el('div', 'sf-meta'); meta.append(el('em', null, TYPES[f.type]));
        const req = el('button', 'sf-req', 'Required'); req.type = 'button'; req.setAttribute('aria-pressed', String(f.req)); req.addEventListener('click', () => { f.req = !f.req; req.setAttribute('aria-pressed', String(f.req)); renderPrev(); }); meta.append(req);
        const sel = el('select', 'sf-sel'); sel.setAttribute('aria-label', `Show condition for ${f.label}`); const o0 = el('option', null, 'Always show'); o0.value = ''; sel.append(o0);
        fields.filter(c => c.type === 'choice' && c.id !== f.id && fields.indexOf(c) < i).forEach(c => c.opts.forEach(v => { const o = el('option', null, `Show if “${c.label}” = ${v}`); o.value = c.id + '|' + v; if (f.cond && f.cond.f === c.id && f.cond.v === v) o.selected = true; sel.append(o); }));
        sel.addEventListener('change', () => { f.cond = sel.value ? { f: +sel.value.split('|')[0], v: sel.value.split('|').slice(1).join('|') } : null; renderPrev(); });
        const del = el('button', 'sf-del', '×'); del.type = 'button'; del.setAttribute('aria-label', `Remove ${f.label}`); del.addEventListener('click', () => { fields.splice(fields.indexOf(f), 1); fields.forEach(x => { if (x.cond && x.cond.f === f.id) x.cond = null; }); renderBuild(); renderPrev(); });
        r.append(lab, del, meta, sel); rows.append(r);
      });
    }
    const visible = () => fields.filter(f => !f.cond || vals[f.cond.f] === f.cond.v);
    function err(f) {
      const v = vals[f.id];
      if (f.type === 'check') return f.req && !v ? 'Please tick this box to continue.' : '';
      const s = v == null ? '' : String(v).trim();
      if (f.req && !s) return `${f.label || 'This field'} is required.`;
      if (s && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(s)) return 'That email looks incomplete, e.g. name@example.com';
      if (s && f.type === 'number') { const n = +s; if (isNaN(n)) return 'Numbers only, please.'; if (n < f.min || n > f.max) return `Enter between ${f.min.toLocaleString()} and ${f.max.toLocaleString()}.`; }
      return '';
    }
    function steps() { const v = visible(); if (!multi) return [v]; const out = []; for (let i = 0; i < v.length; i += 2) out.push(v.slice(i, i + 2)); return out.length ? out : [[]]; }
    function renderPrev(anim) {
      prev.replaceChildren(); const st = steps(); step = Math.min(step, st.length - 1);
      const head = el('div', 'sf-ph'); head.append(el('b', null, 'Start a project'), el('span', null, multi ? `Step ${step + 1} of ${st.length}` : `${visible().length} fields`)); prev.append(head);
      if (multi) { const bar = el('div', 'sf-bar'), f = el('i'); bar.append(f); prev.append(bar); const w = (step + 1) / st.length * 100; if (G && !reduced) G.to(f, { width: w + '%', duration: .5, ease: 'power3.out' }); else f.style.width = w + '%'; }
      const form = el('form', 'sf-form'); form.noValidate = true;
      st[step].forEach(f => {
        const w = el('div', 'sf-field'), id = 'sf' + f.id, lb = el('label', null, f.label + (f.req ? ' *' : '')); lb.htmlFor = id;
        let inp;
        if (f.type === 'choice') { inp = el('div', 'sf-opts'); inp.setAttribute('role', 'radiogroup'); inp.setAttribute('aria-label', f.label); f.opts.forEach(o => { const b = el('button', 'sf-opt', o); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(vals[f.id] === o)); b.addEventListener('click', () => { vals[f.id] = o; touched[f.id] = true; renderPrev(); }); inp.append(b); }); w.append(lb, inp); }
        else if (f.type === 'check') { const cb = el('input'); cb.type = 'checkbox'; cb.id = id; cb.checked = !!vals[f.id]; cb.addEventListener('change', () => { vals[f.id] = cb.checked; touched[f.id] = true; showErr(); }); const l2 = el('label', 'sf-cb'); l2.htmlFor = id; l2.append(cb, document.createTextNode(' ' + f.label + (f.req ? ' *' : ''))); w.append(l2); }
        else { inp = el(f.long ? 'textarea' : 'input', 'sf-fin'); inp.id = id; if (!f.long) inp.type = f.type === 'number' ? 'text' : f.type; if (f.type === 'number') inp.inputMode = 'numeric'; inp.maxLength = f.long ? 500 : 80; if (f.long) inp.rows = 3; inp.value = vals[f.id] || ''; inp.addEventListener('input', () => { vals[f.id] = inp.value; if (touched[f.id]) showErr(); }); inp.addEventListener('blur', () => { touched[f.id] = true; showErr(); }); w.append(lb, inp); }
        const e = el('p', 'sf-err'); e.setAttribute('aria-live', 'polite'); w.append(e);
        const showErr = () => { const m = touched[f.id] ? err(f) : ''; e.textContent = m; w.classList.toggle('bad', !!m); w.classList.toggle('good', touched[f.id] && !m); };
        w.showErr = () => { touched[f.id] = true; showErr(); }; showErr(); form.append(w);
        if (f.cond && G && !reduced && anim !== false) G.from(w, { height: 0, opacity: 0, duration: .35, clearProps: 'height' });
      });
      const nav = el('div', 'sf-nav');
      if (multi && step > 0) { const back = el('button', 'sf-back', '← Back'); back.type = 'button'; back.addEventListener('click', () => { step--; renderPrev(); }); nav.append(back); }
      const last = step >= st.length - 1, go = el('button', 'btn pri', last ? 'Submit' : 'Continue →'); go.type = 'submit'; nav.append(go); form.append(nav);
      form.addEventListener('submit', e => {
        e.preventDefault(); const bad = st[step].filter(f => err(f)); form.querySelectorAll('.sf-field').forEach(w => w.showErr && w.showErr());
        if (bad.length) { if (G && !reduced) G.fromTo(form, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)' }); return; }
        if (!last) { step++; renderPrev(); return; }
        const entry = {}; visible().forEach(f => { entry[f.label] = vals[f.id] ?? ''; });
        prev.replaceChildren(); const ok = el('div', 'sf-ok'); ok.append(el('b', null, '✓ Entry received'), el('p', null, 'This is what lands in your inbox and entries table:')); const pre = el('pre'); pre.textContent = JSON.stringify(entry, null, 2); const again = el('button', 'sf-back', 'Test again'); again.type = 'button'; again.addEventListener('click', () => { Object.keys(vals).forEach(k => delete vals[k]); touched = {}; step = 0; renderPrev(); }); ok.append(pre, again); prev.append(ok);
        if (G && !reduced) G.from(ok, { scale: .9, opacity: 0, duration: .5, ease: 'back.out(2)' }); toast('Form submitted with every rule passing.');
      });
      prev.append(form);
      if (anim && G && !reduced) G.from(form.children, { y: 10, opacity: 0, duration: .3, stagger: .05 });
    }
    renderBuild(); renderPrev(false);
  }

  demo(document.getElementById('demo'), H);
})();
