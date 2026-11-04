/* CommentGuard — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
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
  const BTN = 3;
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
    // a small, explainable scorer: every point added comes with a reason shown to the moderator
    const SPAM = ['casino', 'crypto', 'viagra', 'free money', 'click here', 'buy now', 'earn $', 'work from home', 'seo services', 'cheap', 'loan', 'bitcoin', 'forex', 'dm me'];
    const TOXIC = ['idiot', 'stupid', 'trash', 'garbage', 'shut up', 'loser', 'pathetic', 'hate you'];
    function score(c) {
      const t = c.text, low = t.toLowerCase(), why = []; let s = 0;
      const links = (t.match(/https?:\/\/|www\./g) || []).length; if (links) { s += Math.min(45, links * 22); why.push(`${links} link${links > 1 ? 's' : ''}`); }
      SPAM.forEach(w => { if (low.includes(w)) { s += 24; why.push(`spam phrase “${w}”`); } });
      TOXIC.forEach(w => { if (low.includes(w)) { s += 30; why.push(`toxic “${w}”`); } });
      const letters = t.replace(/[^a-z]/gi, ''), caps = letters ? (t.replace(/[^A-Z]/g, '').length / letters.length) : 0; if (letters.length > 12 && caps > .55) { s += 18; why.push('mostly CAPS'); }
      if (/(.)\1{4,}/.test(t)) { s += 10; why.push('repeated characters'); }
      if ((t.match(/!/g) || []).length > 3) { s += 8; why.push('!!!'); }
      if (/\d{6,}/.test(t)) { s += 10; why.push('long number'); }
      if (c.age != null && c.age < 2) { s += 12; why.push(`account ${c.age} min old`); }
      if (t.length < 6) { s += 8; why.push('very short'); }
      if (!why.length) why.push('no risk signals');
      return { s: Math.min(99, s), why };
    }
    const STREAM = [
      ['Lena K.', 'Loved the recipe! I swapped the butter for olive oil and it still worked.', 340], ['crypto_king88', 'EARN $5000 A WEEK!!! click here www.fast-cash.example', 0], ['Marco', 'Does the pan need to be preheated? The post doesn’t say.', 120],
      ['seo_agency', 'Great post. We offer cheap SEO services, dm me for backlinks https://spam.example', 1], ['Priya S.', 'This saved my Sunday dinner, thank you 🙏', 900], ['anon', 'this is garbage and you are an idiot', 3],
      ['Tom', 'Made it twice now. Second time with extra garlic, even better.', 410], ['b0t_1173', 'nice nice nice nice nice nice 123456789', 0], ['Aisha', 'Could you add metric measurements?', 66], ['loan_offers', 'Instant loan approval, no credit check! Buy now www.loan.example', 0]
    ];
    let thr = 60, idx = 0, all = [], blocked = 0;
    const wrap = el('div', 'cg'), top = el('div', 'cg-top'), thrBox = el('div', 'cg-thr'), range = el('input'); range.type = 'range'; range.min = 10; range.max = 95; range.value = thr; range.setAttribute('aria-label', 'Quarantine threshold');
    const thrV = el('b'), kpis = el('div', 'cg-kpis'); thrBox.append(el('p', 'cg-l', 'Quarantine threshold'), thrV, range, el('p', 'cg-hint', 'Lower = stricter. Comments scoring at or above the line are quarantined.')); top.append(thrBox, kpis);
    const cols = el('div', 'cg-cols'), colOk = el('div', 'cg-col ok'), colQ = el('div', 'cg-col q'); colOk.append(el('p', 'cg-h', '✓ Published')); colQ.append(el('p', 'cg-h', '⛨ Quarantined')); const okList = el('div', 'cg-list'), qList = el('div', 'cg-list'); colOk.append(okList); colQ.append(qList); cols.append(colOk, colQ);
    const test = el('div', 'cg-test'), ta = el('textarea'); ta.maxLength = 280; ta.rows = 3; ta.placeholder = 'Write a comment to test it…'; ta.setAttribute('aria-label', 'Test comment');
    const samples = el('div', 'cg-samples'); [['Spam bot', 'FREE MONEY!!! Earn $900/day from home, click here www.win.example'], ['Troll', 'shut up, this blog is trash'], ['Real reader', 'Thanks for the clear steps, it worked first time.']].forEach(([n, t]) => { const b = el('button', 'cg-sample', n); b.type = 'button'; b.addEventListener('click', () => { ta.value = t; }); samples.append(b); });
    const send = el('button', 'btn pri', 'Post comment'); send.type = 'button'; const verdict = el('div', 'cg-verdict');
    test.append(el('p', 'cg-l', 'Test the firewall'), ta, samples, send, verdict);
    wrap.append(top, cols, test); root.append(wrap);
    function kpi() { kpis.replaceChildren(); const q = all.filter(c => c.r.s >= thr).length; [[all.length, 'scanned'], [q, 'quarantined'], [blocked, 'bots blocked today'], ['12 ms', 'avg scan']].forEach(([v, l]) => { const d = el('div'); d.append(el('b', null, String(v)), el('span', null, l)); kpis.append(d); }); thrV.textContent = `${thr} / 100`; }
    function card(c) {
      const d = el('article', 'cg-c'); const head = el('div', 'cg-ch'); const av = el('span', 'cg-av', c.a[0].toUpperCase()); head.append(av, el('b', null, c.a), el('em', null, `${c.r.s}`));
      const bar = el('div', 'cg-bar'), fill = el('i'); fill.style.width = c.r.s + '%'; fill.style.background = c.r.s >= 70 ? '#F43F5E' : c.r.s >= 40 ? '#F59E0B' : '#22C55E'; bar.append(fill);
      d.append(head, el('p', null, c.text), bar, el('small', null, c.r.why.join(' · '))); c.node = d; return d;
    }
    function place(c, anim) {
      const q = c.r.s >= thr, list = q ? qList : okList; list.prepend(c.node); c.node.classList.toggle('isq', q);
      while (list.children.length > 6) list.lastChild.remove();
      if (anim && G && !reduced) G.fromTo(c.node, { y: -24, opacity: 0, scale: q ? 1.05 : 1 }, { y: 0, opacity: 1, scale: 1, duration: .5, ease: q ? 'back.out(3)' : 'power3.out' });
      if (anim && q && G && !reduced) G.fromTo(colQ, { boxShadow: '0 0 0 2px #F43F5E' }, { boxShadow: '0 0 0 0px #F43F5E', duration: .8 });
    }
    function relayout() { okList.replaceChildren(); qList.replaceChildren(); all.slice(-12).forEach(c => place(c, false)); kpi(); }
    function ingest(a, text, age, mine) { const c = { a, text, age }; c.r = score(c); card(c); all.push(c); if (c.r.s >= thr) blocked++; place(c, true); kpi(); return c; }
    range.addEventListener('input', () => { thr = +range.value; relayout(); });
    send.addEventListener('click', () => {
      const t = ta.value.trim(); if (!t) { ta.focus(); return; }
      const c = ingest('You (test)', t, 0, true); verdict.replaceChildren();
      const q = c.r.s >= thr; verdict.className = 'cg-verdict ' + (q ? 'bad' : 'good'); verdict.append(el('b', null, q ? `Quarantined · score ${c.r.s}` : `Published · score ${c.r.s}`), el('span', null, c.r.why.join(' · ')));
      if (G && !reduced) G.fromTo(verdict, { scale: .9, opacity: 0 }, { scale: 1, opacity: 1, duration: .4, ease: 'back.out(2)' }); ta.value = '';
    });
    const tick = () => { const [a, t, age] = STREAM[idx++ % STREAM.length]; ingest(a, t, age); };
    for (let i = 0; i < 4; i++) tick(); setInterval(tick, 2600);
  }

  demo(document.getElementById('demo'), H);
})();
