/* ArchiveNow — Firefox add-on page with a live browser simulator (Bazozo Studio).
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
    if (window.ScrollTrigger) G.from('.cx', { y: 60, rotationX: 8, transformPerspective: 1400, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.cx', start: 'top 90%' } });
    if (window.ScrollTrigger) ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'expo.out' }) });
    else G.set('.rv', { opacity: 1, y: 0 });
  } else $$('.rv').forEach(r => { r.style.opacity = 1; r.style.transform = 'none'; });
  const H = { el, svgEl, G, reduced, toast, tone, audio, store, $, $$ };
  /* ---------- Chrome toolbar popup ---------- */
  const cxExt = $('#cxExt'), cxPop = $('#cxPop');
  let cxOpen = false; const cxHooks = [];
  function cxShow() { if (cxOpen) return; cxOpen = true; cxPop.hidden = false; cxExt.setAttribute('aria-expanded', 'true'); if (G && !reduced) G.fromTo(cxPop, { scale: .88, opacity: 0, y: -8 }, { scale: 1, opacity: 1, y: 0, duration: .45, ease: 'back.out(1.8)' }); cxHooks.forEach(f => f(true)); }
  function cxHide() { if (!cxOpen) return; cxOpen = false; cxExt.setAttribute('aria-expanded', 'false'); const done = () => { cxPop.hidden = true; if (G) G.set(cxPop, { clearProps: 'all' }); }; if (G && !reduced) G.to(cxPop, { scale: .92, opacity: 0, duration: .18, onComplete: done }); else done(); cxHooks.forEach(f => f(false)); }
  cxExt.addEventListener('click', () => cxOpen ? cxHide() : cxShow());
  $('#cxPopX').addEventListener('click', cxHide);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && cxOpen && !menuOpen) cxHide(); });
  H.pop = { body: $('#cxPopBody'), open: cxShow, close: cxHide, isOpen: () => cxOpen, onToggle: f => cxHooks.push(f) };
  H.badge = v => { const b = $('#cxBadge'); b.hidden = v == null || v === '' || v === 0; b.textContent = String(v); if (G && !reduced && !b.hidden) G.fromTo(b, { scale: 1.6 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); };
  H.url = t => { $('#cxUrl').textContent = t; };
  H.flyToIcon = (fromEl, color) => {
    if (!G || reduced) return; const a = fromEl.getBoundingClientRect(), b = cxExt.getBoundingClientRect(), d = el('i');
    Object.assign(d.style, { position: 'fixed', zIndex: 95, left: a.left + a.width / 2 + 'px', top: a.top + a.height / 2 + 'px', width: '14px', height: '14px', margin: '-7px 0 0 -7px', borderRadius: '50%', background: color || 'var(--accent)', boxShadow: '0 0 14px var(--accent)', pointerEvents: 'none' });
    document.body.append(d);
    G.to(d, { x: b.left + b.width / 2 - (a.left + a.width / 2), duration: .6, ease: 'power1.in' });
    G.to(d, { y: b.top + b.height / 2 - (a.top + a.height / 2), duration: .6, ease: 'back.in(1.4)', onComplete: () => { d.remove(); G.fromTo(cxExt, { scale: 1.35 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); } });
  };

/* ---------- add-on simulator ---------- */
  function demo(page, H) {
    const { el, G, reduced, toast } = H, pb = H.pop.body;
    /* five versions of the same article: the site keeps quietly editing it */
    const V = [
      { at: '2026-11-01T09:14:00', h: 'Council approves 12 km of new bike lanes', p: ['Riverton city council voted 7–2 on Thursday night to build 12 km of protected bike lanes across the city centre.', 'The £4.2 million plan will be paid for from the regional transport fund and is due to finish by autumn 2027.', 'Councillor Maya Okoro called it “the biggest change to our streets in a generation”.', 'Local businesses on Mill Street said they had not been consulted.'] },
      { at: '2026-11-01T18:40:00', h: 'Council approves 12 km of new bike lanes', p: ['Riverton city council voted 7–2 on Thursday night to build 12 km of protected bike lanes across the city centre.', 'The £4.2 million plan will be paid for from the regional transport fund and is due to finish by spring 2028.', 'Councillor Maya Okoro called it “the biggest change to our streets in a generation”.', 'Local businesses on Mill Street said they had not been consulted.'] },
      { at: '2026-11-02T08:02:00', h: 'Council narrowly backs new bike lanes', p: ['Riverton city council voted 5–4 on Thursday night to build 12 km of protected bike lanes across the city centre.', 'The £4.2 million plan will be paid for from the regional transport fund and is due to finish by spring 2028.', 'Councillor Maya Okoro called it “the biggest change to our streets in a generation”.'] },
      { at: '2026-11-03T07:30:00', h: 'Council narrowly backs new bike lanes', p: ['Riverton city council voted 5–4 on Thursday night to build 9 km of protected bike lanes across the city centre.', 'The £5.1 million plan will be paid for from the regional transport fund and is due to finish by spring 2028.', 'Councillor Maya Okoro called it “the biggest change to our streets in a generation”.', 'Correction: an earlier version of this story gave the wrong vote count.'] },
      { at: null, h: 'Council narrowly backs scaled-back bike lanes', p: ['Riverton city council voted 5–4 on Thursday night to build 9 km of protected bike lanes across the city centre, down from the 12 km first proposed.', 'The £5.1 million plan will be paid for from the regional transport fund and is due to finish by spring 2028.', 'Councillor Maya Okoro called it “a big change to our streets”.', 'Correction: an earlier version of this story gave the wrong vote count.'] }
    ];
    let live = 3;                    // the page as it is right now
    const snaps = [];                // { v, at, hash, body }
    let view = -1, diff = true;      // -1 = live page
    const fmtT = d => new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const ser = v => JSON.stringify({ h: v.h, p: v.p });
    async function sha(text) {
      try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
      catch (_) { let h = 0; for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0; return ('0000000' + h.toString(16)).slice(-8).repeat(8); }
    }
    /* word diff (LCS) */
    function wdiff(a, b) {
      const A = a.split(/(\s+)/), B = b.split(/(\s+)/), n = A.length, m = B.length, T = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
      for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) T[i][j] = A[i] === B[j] ? T[i + 1][j + 1] + 1 : Math.max(T[i + 1][j], T[i][j + 1]);
      const out = []; let i = 0, j = 0;
      while (i < n && j < m) { if (A[i] === B[j]) { out.push(['=', A[i]]); i++; j++; } else if (T[i + 1][j] >= T[i][j + 1]) out.push(['-', A[i++]]); else out.push(['+', B[j++]]); }
      while (i < n) out.push(['-', A[i++]]); while (j < m) out.push(['+', B[j++]]);
      return out;
    }
    function fill(node, a, b) { node.replaceChildren(); wdiff(a, b).forEach(([k, t]) => { if (k === '=') node.append(document.createTextNode(t)); else if (t.trim()) node.append(el(k === '+' ? 'ins' : 'del', null, t)); else if (k === '+') node.append(document.createTextNode(t)); }); }

    /* the newspaper page */
    const site = el('div', 'an-site'), mast = el('header', 'an-mast'); mast.append(el('b', null, 'The Riverton Post'), el('span', null, 'News · Transport'));
    const banner = el('div', 'an-banner'); banner.hidden = true;
    const art = el('article', 'an-art'); site.append(mast, banner, art); page.append(site);
    function render() {
      const cur = view < 0 ? V[live] : V[snaps[view].v], prevIdx = view < 0 ? (snaps.length ? snaps[snaps.length - 1].v : null) : (view > 0 ? snaps[view - 1].v : null), prev = prevIdx == null ? null : V[prevIdx];
      art.replaceChildren();
      const showDiff = diff && prev && prev !== cur;
      const h1 = el('h1'); if (showDiff) fill(h1, prev.h, cur.h); else h1.textContent = cur.h; art.append(el('p', 'an-kick', 'Transport'), h1);
      art.append(el('p', 'an-by', `By Jonas Albers · ${view < 0 ? 'Updated just now' : 'Archived ' + fmtT(snaps[view].at)}`));
      const n = Math.max(cur.p.length, showDiff ? prev.p.length : 0);
      for (let i = 0; i < n; i++) { const p = el('p', 'an-p'); const a = showDiff ? (prev.p[i] || '') : '', b = cur.p[i] || ''; if (showDiff && a !== b) { fill(p, a, b); p.classList.add('chg'); } else p.textContent = b; if (p.textContent.trim()) art.append(p); }
      banner.hidden = view < 0; banner.replaceChildren();
      if (view >= 0) { banner.append(el('b', null, `Archived copy · ${fmtT(snaps[view].at)}`), el('span', null, `SHA-256 ${snaps[view].hash.slice(0, 12)}…`)); const back = el('button', null, 'Back to live'); back.type = 'button'; back.addEventListener('click', () => { view = -1; sync(); }); banner.append(back); }
      H.url(view < 0 ? 'riverton-post.example/news/bike-lanes' : `archive.local/${snaps[view].at.replace(/\D/g, '').slice(0, 12)}/riverton-post.example/news/bike-lanes`);
      if (G && !reduced) G.from(art.children, { opacity: 0, y: 6, duration: .25, stagger: .03 });
    }

    /* popup */
    const go = el('button', 'btn pri an-go', 'Archive this page now'); go.type = 'button';
    const scrubW = el('div', 'an-scrub'), scrub = el('input'); scrub.type = 'range'; scrub.min = 0; scrub.step = 1; scrub.setAttribute('aria-label', 'Version scrubber');
    const ticks = el('div', 'an-ticks'), when = el('p', 'an-when'); scrubW.append(scrub, ticks, when);
    const dRow = el('label', 'an-diff'), dCb = el('input'); dCb.type = 'checkbox'; dCb.checked = diff; dRow.append(dCb, document.createTextNode(' Highlight changes since the previous snapshot'));
    const seal = el('div', 'an-seal'), list = el('div', 'an-list');
    const edit = el('button', 'an-edit', 'Simulate: the site edits the article'); edit.type = 'button';
    pb.append(go, el('p', 'an-l', 'Version scrubber'), scrubW, dRow, seal, el('p', 'an-l', 'Snapshots'), list, edit);
    function sync() {
      const max = snaps.length; scrub.max = String(max); scrub.value = String(view < 0 ? max : view);
      ticks.replaceChildren(); snaps.forEach((s, i) => { const t = el('i'); t.style.left = (max ? i / max * 100 : 0) + '%'; ticks.append(t); }); const tl = el('i', 'live'); tl.style.left = '100%'; ticks.append(tl);
      when.textContent = view < 0 ? 'Live page · now' : `Snapshot ${view + 1} of ${max} · ${fmtT(snaps[view].at)}`;
      list.replaceChildren();
      [...snaps].reverse().forEach((s, ri) => { const i = snaps.length - 1 - ri, r = el('button', 'an-snap' + (i === view ? ' on' : '')); r.type = 'button'; r.append(el('b', null, fmtT(s.at)), el('code', null, s.hash.slice(0, 10) + '…'), el('span', 'an-ok' + (s.bad ? ' bad' : ''), s.bad ? '✗ altered' : '✓ sealed')); r.addEventListener('click', () => { view = i; sync(); }); list.append(r); });
      renderSeal(); render(); H.badge(snaps.length);
    }
    function renderSeal() {
      seal.replaceChildren(); if (view < 0) { seal.append(el('small', null, 'Pick a snapshot to see its SHA-256 seal.')); return; }
      const s = snaps[view], top = el('div', 'an-st'); top.append(el('span', 'an-badge' + (s.bad ? ' bad' : ''), s.bad ? '✗ Hash mismatch' : '✓ SHA-256 verified'));
      const v = el('button', 'an-vbtn', 'Re-verify'); v.type = 'button'; v.addEventListener('click', () => verify(s)); top.append(v);
      const t = el('button', 'an-vbtn', 'Tamper test'); t.type = 'button'; t.title = 'Change one character in the stored copy, then verify'; t.addEventListener('click', () => { s.body = s.body.replace('council', 'counci1'); toast('One character in the stored copy was changed. Now re-verify.'); }); top.append(t);
      seal.append(top, el('code', 'an-hash', s.hash));
    }
    async function verify(s) {
      const h = await sha(s.body); s.bad = h !== s.hash; sync();
      const b = seal.querySelector('.an-badge'); if (G && !reduced && b) G.fromTo(b, { scale: 1.25 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
      toast(s.bad ? `Mismatch: the copy now hashes to ${h.slice(0, 10)}…, not ${s.hash.slice(0, 10)}…` : 'Hash matches. This snapshot is exactly as it was saved.');
    }
    async function archive(silentAt) {
      go.disabled = true; go.textContent = 'Saving snapshot…';
      const v = live, body = ser(V[v]), hash = await sha(body), at = silentAt || new Date().toISOString().slice(0, 19);
      snaps.push({ v, at, hash, body }); view = snaps.length - 1; go.disabled = false; go.textContent = 'Archive this page now';
      if (!silentAt) { H.flyToIcon(art, '#B4432F'); toast(`Snapshot saved and sealed · ${hash.slice(0, 12)}…`); try { H.tone(880, .08, 'triangle', .04); } catch (_) {} }
      sync();
    }
    go.addEventListener('click', () => archive());
    scrub.addEventListener('input', () => { const v = +scrub.value; view = v >= snaps.length ? -1 : v; sync(); });
    dCb.addEventListener('change', () => { diff = dCb.checked; render(); });
    edit.addEventListener('click', () => { if (live >= V.length - 1) { toast('The article is already at its latest edit.'); return; } live++; view = -1; sync(); toast('The site just changed the live article. Archive it to catch the edit.'); });
    // earlier snapshots already in the archive
    (async () => { live = 0; await archive(V[0].at); live = 1; await archive(V[1].at); live = 2; await archive(V[2].at); live = 3; view = -1; sync(); setTimeout(() => H.pop.open(), 900); })();
  }

  demo(document.getElementById('cxPage'), H);
})();
