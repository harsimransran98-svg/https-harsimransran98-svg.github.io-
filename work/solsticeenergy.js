/* Solstice Energy — case study page (Bazozo Studio). Menu, motion and the live demo widget.
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
  const BTN = 4;
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
    G.from('.hero .kick, .hero .lead, .hero .acts', { y: 24, opacity: 0, duration: .9, stagger: .1, ease: 'expo.out', delay: .45 });
    G.from('#heroImg', { scale: 1.18, duration: 2.2, ease: 'expo.out' });
    const mm = G.matchMedia();
    mm.add('(min-width: 861px)', () => { if (window.ScrollTrigger) G.to('#heroImg', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } }); });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };

/* ---------- live demo ---------- */
  function demo(root, H) {
    const { el, svgEl, G, reduced, toast } = H;
    const wrap = el('div', 'so-wrap'), live = el('div', 'so-live'), calc = el('div', 'so-calc');
    // live dashboard of a demo rooftop: today's output curve + ticking counters
    const head = el('div', 'so-head'); const dot = el('i', 'so-dot'); head.append(dot, el('b', null, 'Live · demo rooftop, 6.4 kW'), el('span', 'so-time', ''));
    const kpis = el('div', 'so-kpis'); const K = {}; [['now', 'kW right now'], ['today', 'kWh today'], ['co2', 'kg CO₂ avoided'], ['saved', 'saved this month']].forEach(([k, l]) => { const d = el('div'); K[k] = el('b', null, '—'); d.append(K[k], el('span', null, l)); kpis.append(d); });
    const sv = svgEl('svg', { viewBox: '0 0 600 200', class: 'so-chart', role: 'img', 'aria-label': 'Solar output across today' });
    live.append(head, kpis, sv);
    const curve = h => Math.max(0, Math.sin((h - 6) / 13 * Math.PI)) * 6.1;
    const pts = []; for (let h = 5; h <= 20; h += .25) pts.push([h, curve(h) * (.9 + Math.sin(h * 7) * .06)]);
    const X = h => (h - 5) / 15 * 600, Y = v => 180 - v / 6.5 * 160;
    const area = svgEl('path', { fill: 'rgba(255,183,3,.18)' }), line = svgEl('path', { fill: 'none', stroke: '#FFB703', 'stroke-width': 3 }), nowL = svgEl('line', { y1: 10, y2: 180, stroke: 'rgba(241,245,249,.4)', 'stroke-dasharray': '4 4' }), sun = svgEl('circle', { r: 7, fill: '#FFB703' });
    [6, 9, 12, 15, 18].forEach(h => { const t = svgEl('text', { x: X(h), y: 197, fill: 'rgba(241,245,249,.45)', 'font-size': 11, 'text-anchor': 'middle' }); t.textContent = (h > 12 ? h - 12 : h) + (h >= 12 ? 'pm' : 'am'); sv.append(t); });
    sv.append(area, line, nowL, sun);
    const realH = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
    let today = 0, co2 = 0, saved = 0;
    function tick() {
      const h = Math.min(20, Math.max(5, realH())), upto = pts.filter(p => p[0] <= h);
      const dPath = upto.map(([hh, v], i) => `${i ? 'L' : 'M'}${X(hh).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
      line.setAttribute('d', dPath || 'M0 180'); area.setAttribute('d', upto.length ? `${dPath} L${X(upto[upto.length - 1][0])} 180 L0 180Z` : '');
      const now = curve(realH()) * (.95 + Math.random() * .08);
      nowL.setAttribute('x1', X(h)); nowL.setAttribute('x2', X(h)); sun.setAttribute('cx', X(h)); sun.setAttribute('cy', Y(Math.max(.1, curve(h))));
      today = upto.reduce((a, [, v]) => a + v * .25, 0) + Math.random() * .01; co2 = today * .39; saved = 41.2 + today * .17;
      K.now.textContent = now.toFixed(2); K.today.textContent = today.toFixed(1); K.co2.textContent = co2.toFixed(1); K.saved.textContent = '$' + saved.toFixed(2);
      head.querySelector('.so-time').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      dot.classList.toggle('night', now < .05);
    }
    tick(); setInterval(tick, 1000);
    // savings calculator
    const S = { bill: 140, roof: 'south', shade: 'little' };
    const bill = el('input'); bill.type = 'range'; bill.min = 40; bill.max = 400; bill.step = 5; bill.value = S.bill; bill.className = 'so-range'; bill.setAttribute('aria-label', 'Monthly electricity bill');
    const billV = el('b', 'so-bv'); const seg = (label, key, opts) => { const g = el('div'); g.append(el('p', 'so-l', label)); const row = el('div', 'so-seg'); opts.forEach(([v, t]) => { const b = el('button', null, t); b.type = 'button'; b.setAttribute('aria-pressed', String(S[key] === v)); b.addEventListener('click', () => { S[key] = v; row.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); calcIt(); }); row.append(b); }); g.append(row); return g; };
    const res = el('div', 'so-res'), go = el('button', 'btn pri', 'Check my eligibility'); go.type = 'button'; go.addEventListener('click', () => toast('Eligible for the federal 30% credit plus one state rebate. No sales call. We’ll email the report.'));
    const bg = el('div'); bg.append(el('p', 'so-l', 'Monthly electric bill'), billV, bill);
    calc.append(bg, seg('Roof faces', 'roof', [['south', 'South'], ['eastwest', 'East/West'], ['north', 'North']]), seg('Shade', 'shade', [['little', 'Little'], ['some', 'Some'], ['lots', 'A lot']]), res, go);
    wrap.append(live, calc); root.append(wrap);
    let shown = { save: 0 };
    function calcIt() {
      S.bill = +bill.value; billV.textContent = `$${S.bill}/month`;
      const eff = { south: 1, eastwest: .85, north: .6 }[S.roof] * { little: 1, some: .82, lots: .55 }[S.shade];
      const kw = Math.min(14, S.bill / 22), cost = kw * 2600 * .7, yearly = S.bill * 12 * .92 * eff, payback = cost / yearly;
      res.replaceChildren(); [[`${kw.toFixed(1)} kW`, 'system size'], [`$${Math.round(cost).toLocaleString()}`, 'after 30% credit'], [`${payback.toFixed(1)} yrs`, 'payback'], ['', '25-yr savings']].forEach(([v, l], i) => { const d = el('div'); const b = el('b', null, v); if (i === 3) b.id = 'soSave'; d.append(b, el('span', null, l)); res.append(d); });
      const target = Math.round(yearly * 25 - cost), node = res.querySelector('#soSave');
      if (G && !reduced) G.to(shown, { save: target, duration: .8, ease: 'power3.out', onUpdate: () => { node.textContent = '$' + Math.round(shown.save).toLocaleString(); } }); else node.textContent = '$' + target.toLocaleString();
    }
    bill.addEventListener('input', calcIt); calcIt();
  }

  demo(document.getElementById('demo'), H);
})();
