/* MembershipGate — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
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
  const BTN = 5;
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
    const { el, svgEl, G, reduced, toast } = H;
    const TIERS = ['Free', 'Pro', 'VIP'], RANK = { Free: 0, Pro: 1, VIP: 2 };
    const BLOCKS = [
      { k: 'intro', n: 'Intro paragraph', need: 'Free', t: 'The Quiet Compounding Playbook', body: 'Most people overestimate a month and underestimate a decade. This guide walks through the habits our readers used to grow a side income into a second salary.' },
      { k: 'ch2', n: 'Chapter 2 · The 90-day system', need: 'Pro', t: 'Chapter 2 · The 90-day system', body: 'Pick one channel, publish twice a week, measure one number. After 90 days, double what worked and cut everything else. The worksheet below makes it painless.' },
      { k: 'sheet', n: 'Downloadable worksheet', need: 'Pro', t: '📄 90-day tracker (PDF + Sheets)', body: 'Weekly targets, a habit grid and a review template.' },
      { k: 'video', n: 'Masterclass video', need: 'VIP', t: '▶ Masterclass: from 0 to 1,000 members (42 min)', body: 'A live teardown of three real membership launches, with the numbers.' },
      { k: 'call', n: 'Monthly founders call', need: 'VIP', t: '☎ Founders call · last Thursday monthly', body: 'Bring a question, leave with a plan. Recording available for 7 days.' }
    ];
    const PRICE = { Pro: 12, VIP: 29 };
    let view = 'Free', pro = 420, vip = 110, growth = 6;
    const wrap = el('div', 'mg'), left = el('div', 'mg-left'), right = el('div', 'mg-right');
    const tabs = el('div', 'mg-tabs'); tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'View content as');
    const ind = el('span', 'mg-ind'); tabs.append(ind);
    TIERS.forEach(t => { const b = el('button', 'mg-tab', t === 'Free' ? 'Free reader' : `${t} member`); b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.t = t; b.setAttribute('aria-selected', String(t === view)); b.addEventListener('click', () => { const was = view; view = t; tabs.querySelectorAll('.mg-tab').forEach(x => x.setAttribute('aria-selected', String(x === b))); moveInd(true); renderArticle(was); }); tabs.append(b); });
    const art = el('article', 'mg-art');
    left.append(el('p', 'mg-l', 'Preview as'), tabs, art);
    const rules = el('div', 'mg-rules'), mrr = el('div', 'mg-mrr');
    right.append(el('p', 'mg-l', 'Restriction rules'), rules, el('p', 'mg-l', 'Recurring revenue'), mrr);
    wrap.append(left, right); root.append(wrap);
    function moveInd(anim) { const b = tabs.querySelector('[aria-selected="true"]'), css = { left: b.offsetLeft + 'px', width: b.offsetWidth + 'px' }; if (G && anim && !reduced) G.to(ind, { ...css, duration: .5, ease: 'elastic.out(1,.7)' }); else Object.assign(ind.style, css); }
    function renderArticle(was) {
      art.replaceChildren();
      BLOCKS.forEach(b => {
        const open = RANK[view] >= RANK[b.need], blk = el('section', 'mg-b' + (open ? '' : ' locked')); blk.dataset.k = b.k;
        const inner = el('div', 'mg-in'); inner.append(el(b.k === 'intro' ? 'h4' : 'h5', null, b.t), el('p', null, b.body)); blk.append(inner);
        if (!open) { const lock = el('div', 'mg-lock'); const up = el('button', 'btn pri', `Unlock with ${b.need} · $${PRICE[b.need]}/mo`); up.type = 'button'; up.addEventListener('click', () => { const tb = tabs.querySelector(`[data-t="${b.need}"]`); tb.click(); toast(`Checkout preview: ${b.need} plan, $${PRICE[b.need]}/month, cancel any time.`); }); lock.append(el('span', 'mg-key', '🔒'), el('b', null, `${b.need} members only`), up); blk.append(lock); }
        else if (b.need !== 'Free') blk.append(el('span', 'mg-badge', b.need));
        art.append(blk);
        const wasOpen = was != null && RANK[was] >= RANK[b.need];
        if (G && !reduced && was != null && open && !wasOpen) { G.fromTo(inner, { filter: 'blur(8px)', opacity: .4 }, { filter: 'blur(0px)', opacity: 1, duration: .8, ease: 'power2.out' }); G.fromTo(blk, { boxShadow: '0 0 0 2px #D4AF37' }, { boxShadow: '0 0 0 0px #D4AF37', duration: 1.2 }); }
      });
    }
    function renderRules() {
      rules.replaceChildren();
      BLOCKS.forEach(b => {
        const r = el('div', 'mg-rule'), sel = el('div', 'mg-seg'); r.append(el('span', null, b.n));
        TIERS.forEach(t => { const o = el('button', null, t); o.type = 'button'; o.setAttribute('aria-pressed', String(b.need === t)); o.setAttribute('aria-label', `${b.n} requires ${t}`); o.addEventListener('click', () => { b.need = t; sel.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === o))); renderArticle(); }); sel.append(o); });
        r.append(sel); rules.append(r);
      });
    }
    function slider(label, min, max, val, step, fmt, on) { const w = el('label', 'mg-sl'), v = el('b', null, fmt(val)), r = el('input'); r.type = 'range'; r.min = min; r.max = max; r.value = val; r.step = step; r.setAttribute('aria-label', label); r.addEventListener('input', () => { v.textContent = fmt(+r.value); on(+r.value); }); w.append(el('span', null, label), r, v); return w; }
    const chart = svgEl('svg', { viewBox: '0 0 360 150', class: 'mg-chart', role: 'img', 'aria-label': 'Projected monthly recurring revenue for 12 months' });
    const big = el('div', 'mg-big');
    mrr.append(big, chart, slider('Pro members', 0, 2000, pro, 10, v => v.toLocaleString(), v => { pro = v; drawMrr(); }), slider('VIP members', 0, 600, vip, 5, v => v.toLocaleString(), v => { vip = v; drawMrr(); }), slider('Monthly growth', 0, 20, growth, 1, v => v + '%', v => { growth = v; drawMrr(); }));
    function drawMrr() {
      const base = pro * PRICE.Pro + vip * PRICE.VIP, pts = Array.from({ length: 12 }, (_, i) => base * Math.pow(1 + growth / 100, i)), max = Math.max(...pts, 1);
      big.replaceChildren(el('b', null, `$${Math.round(base).toLocaleString()}`), el('span', null, `MRR today · $${Math.round(pts[11]).toLocaleString()} in 12 months · ARR $${Math.round(base * 12).toLocaleString()}`));
      chart.replaceChildren();
      const X = i => 10 + i * 31, Y = v => 135 - v / max * 120;
      const d = pts.map((v, i) => `${i ? 'L' : 'M'}${X(i)} ${Y(v).toFixed(1)}`).join(' ');
      const defs = svgEl('defs'), gr = svgEl('linearGradient', { id: 'mgg', x1: 0, y1: 0, x2: 0, y2: 1 }); gr.append(svgEl('stop', { offset: 0, 'stop-color': '#D4AF37', 'stop-opacity': .45 }), svgEl('stop', { offset: 1, 'stop-color': '#D4AF37', 'stop-opacity': 0 })); defs.append(gr); chart.append(defs);
      chart.append(svgEl('path', { d: `${d} L${X(11)} 140 L${X(0)} 140Z`, fill: 'url(#mgg)' }), svgEl('path', { d, fill: 'none', stroke: '#D4AF37', 'stroke-width': 2.5 }));
      pts.forEach((v, i) => { const pb = pro * PRICE.Pro * Math.pow(1 + growth / 100, i) / max * 120; chart.append(svgEl('rect', { x: X(i) - 6, y: 135 - pb, width: 12, height: pb, fill: 'rgba(139,30,63,.55)', rx: 2 })); });
      const t = svgEl('text', { x: 350, y: 14, 'text-anchor': 'end', fill: '#F3E9D2', 'font-size': 10, opacity: .7 }); t.textContent = 'gold line = total · bars = Pro share'; chart.append(t);
    }
    renderArticle(); renderRules(); drawMrr(); requestAnimationFrame(() => moveInd(false));
    document.fonts && document.fonts.ready.then(() => moveInd(false));
  }

  demo(document.getElementById('demo'), H);
})();
