/* FeedStream — Firefox add-on page with a live browser simulator (Bazozo Studio).
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
    const FEEDS = [
      { id: 'gw', name: 'Gadget Weekly', url: 'https://gadgetweekly.example/atom.xml', type: 'Atom', col: '#F26522' },
      { id: 'fn', name: 'Field Notes', url: 'https://fieldnotes.example/rss', type: 'RSS', col: '#8FBF9F' },
      { id: 'sn', name: 'Solar Notes', url: 'https://solarnotes.example/feed.xml', type: 'RSS', col: '#E8C15A' }
    ];
    const SITE_FEED = { id: 'sw', name: 'Slow Web Journal', url: 'https://slowweb.example/journal/feed.xml', type: 'RSS', col: '#C98B6B' };
    let uid = 0;
    const I = (feed, title, date, read, body, author) => ({ id: ++uid, feed, title, date, read, body, author });
    const items = [
      I('gw', 'The best e-readers of 2026, tested for a month', '3 Nov', false, ['We read eleven novels across six e-readers to find the one that disappears in your hands.', 'The winner is light, warm-lit and lasts five weeks on a charge. The runner-up has the best page-turn buttons we have ever used.'], 'Priya Nair'),
      I('gw', 'Why every laptop suddenly has a “copilot” key', '2 Nov', false, ['A single new key has appeared on most new keyboards this year.', 'We asked three manufacturers what it is for, and got three different answers.'], 'Tom Ellery'),
      I('gw', 'Repairable phones are finally getting good', '31 Oct', false, ['Swappable batteries are back, and so are screws you can actually turn.', 'Here is how the latest models score on our repair test.'], 'Priya Nair'),
      I('gw', 'A week with a dumb phone', '28 Oct', true, ['I swapped my smartphone for a flip phone for seven days.', 'I missed maps. I did not miss anything else.'], 'Jo Banks'),
      I('fn', 'Autumn migration over the estuary', '2 Nov', false, ['At dawn the mudflats were loud with curlew and godwit.', 'Counts are up on last year, which the wardens put down to the mild September.'], 'Ada Moor'),
      I('fn', 'How to start a moth trap', '30 Oct', false, ['All you need is a white sheet, a lamp and some egg boxes.', 'The trick is patience. Most moths arrive after midnight.'], 'Ada Moor'),
      I('fn', 'Notes on a heron', '25 Oct', true, ['It stood so still for so long that I began to doubt it was real.'], 'Ada Moor'),
      I('sn', 'Running a website on 10 watts of sunlight', '1 Nov', false, ['Our server sits on a balcony and runs on a small solar panel.', 'On cloudy days the site goes offline, and that is fine.'], 'Kris De Vries'),
      I('sn', 'The case for slower charging', '20 Oct', true, ['Fast charging is convenient. It is also why batteries wear out.'], 'Kris De Vries')
    ];
    const SITE_ITEMS = [
      ['Notes from a week without notifications', '3 Nov', ['I turned off every notification for a week and checked things on my own schedule.', 'Nothing important was missed. Several unimportant things were, happily.']],
      ['The joy of a website that ends', '27 Oct', ['A page that finishes gives you a moment to stop. Infinite scroll takes that moment away.']],
      ['Writing in plain text again', '19 Oct', ['Plain text files will open in fifty years. Most apps will not.']],
      ['Small tools, sharp edges', '12 Oct', ['The best tools do one thing and let you see how they work.']]
    ];
    let subs = FEEDS.map(f => ({ ...f })), sel = 'all', openId = null, refreshN = 0;
    const unread = f => items.filter(i => (f === 'all' || i.feed === f) && !i.read && subs.some(s => s.id === i.feed)).length;
    const feedOf = id => subs.find(f => f.id === id) || SITE_FEED;

    /* RSS icon in the address bar */
    const rss = el('button', 'fs-rss'); rss.type = 'button'; rss.setAttribute('aria-label', 'This page has a feed. Subscribe with FeedStream'); rss.title = 'Subscribe to this page';
    const ic = H.svgEl('svg', { viewBox: '0 0 24 24', width: 14, height: 14, fill: 'none', stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round', 'aria-hidden': 'true' }); ic.append(H.svgEl('circle', { cx: 5, cy: 19, r: 1.6, fill: 'currentColor', stroke: 'none' }), H.svgEl('path', { d: 'M4 11a9 9 0 0 1 9 9' }), H.svgEl('path', { d: 'M4 4a16 16 0 0 1 16 16' })); rss.append(ic); document.querySelector('.cx-omni').insertBefore(rss, document.querySelector('.cx-star'));
    rss.addEventListener('click', () => { if (!H.pop.isOpen()) H.pop.open(); subscribe(); });

    /* the page: blog or reader view */
    function blog() {
      openId = null; H.url('slowweb.example/journal'); page.replaceChildren(); page.scrollTop = 0;
      const s = el('div', 'fs-blog'), top = el('header', 'fs-btop'); top.append(el('b', null, 'Slow Web Journal'), el('span', null, 'Essays on calmer technology'));
      const list = el('div', 'fs-posts'); SITE_ITEMS.forEach(([t, d, p]) => { const a = el('article', 'fs-post'); a.append(el('small', null, d + ' 2026'), el('h2', null, t), el('p', null, p[0])); list.append(a); });
      const foot = el('p', 'fs-foot', 'Subscribe via RSS: slowweb.example/journal/feed.xml');
      s.append(top, list, foot); page.append(s); rss.classList.toggle('on', !subs.some(f => f.id === 'sw'));
    }
    function reader(it) {
      openId = it.id; it.read = true; const f = feedOf(it.feed); H.url('about:reader?url=' + f.url.replace('https://', '').split('/')[0] + '/' + it.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40));
      page.replaceChildren(); page.scrollTop = 0;
      const r = el('article', 'fs-reader'); r.style.setProperty('--fc', f.col);
      const bar = el('div', 'fs-rbar'), back = el('button', null, '← Back to the site'); back.type = 'button'; back.addEventListener('click', () => { blog(); render(); });
      const mu = el('button', null, 'Mark unread'); mu.type = 'button'; mu.addEventListener('click', () => { it.read = false; render(); toast('Marked as unread.'); });
      const nx = el('button', 'nx', 'Next unread →'); nx.type = 'button'; nx.addEventListener('click', () => { const n = items.find(i => !i.read && subs.some(s => s.id === i.feed) && (sel === 'all' || i.feed === sel)); if (n) { reader(n); render(); } else toast('All caught up.'); });
      bar.append(back, mu, nx); r.append(bar, el('p', 'fs-src', `${f.name} · ${it.date} 2026 · ${it.author}`), el('h1', null, it.title));
      const wc = it.body.join(' ').split(/\s+/).length; r.append(el('p', 'fs-rt', `${Math.max(1, Math.round(wc / 200))} min read · reader view`));
      it.body.forEach(p => r.append(el('p', 'fs-p', p))); r.append(el('p', 'fs-p dim', 'This is a reader-view rendering: no ads, no pop-ups, just the post.'));
      page.append(r); if (G && !reduced) G.from(r.children, { opacity: 0, y: 12, duration: .35, stagger: .05, ease: 'power2.out' });
    }

    /* the sidebar */
    const acts = el('div', 'fs-acts'), ref = el('button', null, '↻ Refresh'), mar = el('button', null, '✓ Mark all read'), opml = el('button', null, '⇩ OPML'); [ref, mar, opml].forEach(b => { b.type = 'button'; acts.append(b); });
    const detect = el('div', 'fs-detect'), feedsBox = el('div', 'fs-feeds'), itemsBox = el('div', 'fs-items'), pre = el('pre', 'fs-opml'); pre.hidden = true;
    pb.append(acts, detect, feedsBox, itemsBox, pre);
    function render() {
      detect.replaceChildren();
      if (!subs.some(f => f.id === 'sw')) { detect.append(el('b', null, 'This site has an RSS feed'), el('small', null, 'Slow Web Journal · 4 posts')); const s = el('button', 'btn pri', 'Subscribe'); s.type = 'button'; s.addEventListener('click', subscribe); detect.append(s); detect.hidden = false; } else detect.hidden = true;
      feedsBox.replaceChildren();
      const row = (id, name, col, n, type) => { const b = el('button', 'fs-feed' + (sel === id ? ' on' : '')); b.type = 'button'; const d = el('i'); d.style.background = col; b.append(d, el('span', null, name)); if (type) b.append(el('small', null, type)); b.append(el('b', n ? 'n' : 'z', String(n))); b.addEventListener('click', () => { sel = id; render(); }); feedsBox.append(b); };
      row('all', 'All items', 'linear-gradient(135deg,#F26522,#8FBF9F)', unread('all'));
      subs.forEach(f => row(f.id, f.name, f.col, unread(f.id), f.type));
      itemsBox.replaceChildren();
      const L = items.filter(i => subs.some(s => s.id === i.feed) && (sel === 'all' || i.feed === sel));
      if (!L.length) itemsBox.append(el('p', 'fs-empty', 'No items.'));
      L.forEach(i => { const b = el('button', 'fs-item' + (i.read ? ' read' : '') + (i.id === openId ? ' on' : '')); b.type = 'button'; b.style.setProperty('--fc', feedOf(i.feed).col); b.append(el('i'), el('b', null, i.title), el('small', null, `${feedOf(i.feed).name} · ${i.date}`)); b.addEventListener('click', () => { reader(i); render(); }); itemsBox.append(b); });
      H.badge(unread('all') || '');
    }
    function subscribe() {
      if (subs.some(f => f.id === 'sw')) { toast('Already subscribed.'); return; }
      subs.push({ ...SITE_FEED }); [...SITE_ITEMS].reverse().forEach(([t, d, p]) => items.unshift(I('sw', t, d, false, p, 'Mara Lind'))); sel = 'sw'; rss.classList.remove('on');
      H.flyToIcon(rss, SITE_FEED.col); render(); toast('Subscribed to Slow Web Journal · 4 new items.');
      if (G && !reduced) G.from(itemsBox.children, { x: -16, opacity: 0, duration: .35, stagger: .05 });
    }
    const NEW = [['gw', 'Hands-on with the new pocket projector', ['It is the size of a deck of cards and surprisingly bright.'], 'Tom Ellery'], ['fn', 'First frost on the marsh', ['The reeds were white at sunrise and gone gold by nine.'], 'Ada Moor'], ['sn', 'What a dark sky taught our solar server', ['Three cloudy days in a row meant three days offline. Readers did not mind.'], 'Kris De Vries']];
    ref.addEventListener('click', () => {
      ref.disabled = true; ref.textContent = '↻ Checking…';
      setTimeout(() => {
        const n = NEW[refreshN++ % NEW.length]; items.unshift(I(n[0], n[1], 'now', false, n[2], n[3])); ref.disabled = false; ref.textContent = '↻ Refresh'; render();
        const first = itemsBox.querySelector('.fs-item'); if (first && G && !reduced) G.fromTo(first, { backgroundColor: 'rgba(242,101,34,.35)' }, { backgroundColor: 'rgba(242,101,34,0)', duration: 1.2, clearProps: 'backgroundColor' });
        toast(`1 new item in ${feedOf(n[0]).name}.`);
      }, reduced ? 50 : 700);
    });
    mar.addEventListener('click', () => { const n = items.filter(i => !i.read && (sel === 'all' || i.feed === sel)).length; items.forEach(i => { if (sel === 'all' || i.feed === sel) i.read = true; }); render(); toast(n ? `${n} items marked as read.` : 'Nothing unread here.'); });
    const xml = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    opml.addEventListener('click', () => {
      const out = `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head><title>FeedStream subscriptions</title></head>\n  <body>\n${subs.map(f => `    <outline type="rss" text="${xml(f.name)}" xmlUrl="${xml(f.url)}"/>`).join('\n')}\n  </body>\n</opml>\n`;
      pre.textContent = out; pre.hidden = false;
      const b = new Blob([out], { type: 'text/x-opml' }), u = URL.createObjectURL(b), a = el('a'); a.href = u; a.download = 'feedstream-subscriptions.opml'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000);
      toast(`Exported ${subs.length} feeds as OPML.`);
    });
    H.pop.onToggle(o => page.classList.toggle('fs-split', o));
    blog(); render(); setTimeout(() => H.pop.open(), 900);
  }

  demo(document.getElementById('cxPage'), H);
})();
