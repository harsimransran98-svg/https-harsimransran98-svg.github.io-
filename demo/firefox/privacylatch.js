/* PrivacyLatch — privacy extension simulator (Bazozo Studio).
   Every request on these pages is simulated; tracker domains are fictional.
   All DOM is built with createElement + textContent. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- scale ---------- */
  const wrap = $('#stageWrap');
  function fit() { wrap.style.setProperty('--s', Math.max(.5, Math.min(1, wrap.clientWidth / 1200)).toFixed(4)); }
  window.addEventListener('resize', fit); fit();

  /* ---------- checklist ---------- */
  const done = new Set();
  function check(k) { if (done.has(k)) return; done.add(k); const c = $(`#tryList [data-t="${k}"]`); if (c) { c.classList.add('done'); if (G) G.fromTo(c, { scale: .9 }, { scale: 1, duration: .45, ease: 'back.out(3)' }); } $('#tryCount').textContent = `${done.size}/5`; }

  /* ---------- data ---------- */
  const TRK = {
    ad: [['px.adsphere.net', 180], ['cdn.bannerloop.com', 420], ['ads.clickmint.io', 260], ['vid.autoroll.tv', 1400], ['bid.yieldstack.net', 90]],
    an: [['metrics.trackly.io', 45], ['collect.pagepulse.net', 38], ['heat.scrollmap.io', 120], ['sync.cookiematch.net', 12]],
    so: [['widgets.sharebuzz.com', 210], ['pixel.socialnest.com', 25]],
    fp: [['fp.deviceprint.io', 60], ['canvas.idgraph.net', 30], ['audio.fpkit.net', 22]]
  };
  const SITES = [
    { id: 'news', dom: 'morningledger.news', path: '/climate/ocean-cleanup', title: 'The ocean cleanup that finally worked · Morning Ledger', fav: '#C2410C', letter: 'M', mix: { ad: 14, an: 9, so: 4, fp: 4 }, first: 22 },
    { id: 'food', dom: 'cooksy.recipes', path: '/dinner/one-pot-dal', title: 'One-pot dal in 25 minutes · Cooksy', fav: '#16A34A', letter: 'C', mix: { ad: 18, an: 11, so: 3, fp: 5 }, first: 16 }
  ];
  const allow = new Set(['mybank.example', 'docs.internal.example']);
  let cur = SITES[0], shieldOn = true, toggles = 0, popOpen = false;
  const page = { req: 0, blk: 0, tr: 0, ad: 0, fp: 0, savedKb: 0 };
  let sessionKb = 0, allTime = 18204, loadTok = 0;
  const protectedNow = () => shieldOn && !allow.has(cur.dom);
  const fmtKb = kb => kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.round(kb) + ' KB';

  /* ---------- browser tabs ---------- */
  function renderTabs() {
    const t = $('#tabs'); t.replaceChildren();
    SITES.forEach(s => {
      const b = el('button', 'tab'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(s === cur));
      const f = el('span', 'fav', s.letter); f.style.background = s.fav;
      b.append(f, el('span', null, s.title));
      if (s === cur) { s.tbEl = el('span', 'tb', '0'); b.append(s.tbEl); }
      b.addEventListener('click', () => { if (s === cur) return; cur = s; renderTabs(); load(); check('reload'); });
      t.append(b);
    });
    const nt = el('button', 'newtab', '+'); nt.type = 'button'; nt.setAttribute('aria-label', 'New tab'); t.append(nt);
  }

  /* ---------- fake websites ---------- */
  const site = $('#site'), vp = $('#vp');
  let slots = [], floaters = [];
  function adSlot(cls, label, kb, from, extra) {
    const s = el('div', 'slot'), ad = el('div', 'ad ' + cls); ad.append(el('small', null, 'AD'));
    if (cls === 'vid') { const p = el('span', 'play'); p.textContent = '▶'; ad.append(p, el('span', null, label), el('i', 'bar')); }
    else { ad.append(el('span', null, label)); if (extra) ad.append(el('span', 'fake', extra)); }
    const z = el('div', 'zap' + (cls === 'lb' ? ' lbz' : '')); z.append(shieldSvg(), document.createTextNode(`ad removed · ${fmtKb(kb)} saved · ${from}`));
    s.append(ad, z); slots.push({ ad, z, kb }); return s;
  }
  function shieldSvg() { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'currentColor'); const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', 'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5Z'); s.append(p); return s; }
  const P = (t, cls) => el('p', cls, t);
  function buildSite() {
    slots = []; floaters.forEach(f => f.remove()); floaters = [];
    site.replaceChildren(); site.scrollTop = 0;
    const news = cur.id === 'news';
    const head = el('div', 's-head'), logo = el('div', 's-logo', news ? 'Morning Ledger' : 'cooksy'), nav = el('div', 's-nav');
    if (!news) { logo.style.color = '#16A34A'; logo.style.fontFamily = 'var(--sans)'; }
    (news ? ['World', 'Business', 'Climate', 'Tech', 'Opinion'] : ['Dinner', 'Quick', 'Vegetarian', 'Baking', 'Meal plans']).forEach(n => nav.append(el('span', null, n)));
    head.append(logo, nav); site.append(head);
    site.append(adSlot('lb', news ? 'MEGA SALE · 90% OFF EVERYTHING' : 'HUNGRY? ORDER NOW · FREE DELIVERY', 420, 'cdn.bannerloop.com'));
    const body = el('div', 's-body'), art = el('article', 's-art'), side = el('aside', 's-side');
    art.append(el('span', 'kick2', news ? 'Climate' : 'Dinner · 25 min · Serves 4'), el('h2', null, news ? 'The ocean cleanup that finally worked' : 'One-pot dal in 25 minutes'));
    const hero = el('div', 'hero'); hero.style.background = news ? 'linear-gradient(160deg,#0EA5E9,#0369A1 60%,#082F49)' : 'radial-gradient(circle at 40% 45%,#FDE047,#F59E0B 35%,#B45309 70%)'; art.append(hero);
    if (news) {
      art.append(P('Three years after the first barrier went into the Pacific, the numbers are in, and they are better than anyone dared to hope.'), P('Plastic in the target zone is down by a third. The fleet now runs on recovered fuel, and fishing crews have joined in.'));
      art.append(adSlot('vid', 'Autoplay video ad · sound on', 1400, 'vid.autoroll.tv'));
      art.append(P('The project started with a student’s question and a borrowed boat. Today it employs four hundred people across three ports.'), P('What changed was not the technology but the way the cleanup was funded: by the towns whose beaches it saved.'));
      art.append(adSlot('inl', 'Earn $5,000/day with crypto bots →', 260, 'ads.clickmint.io'));
      art.append(P('Next year the team plans to bring the barrier design to two rivers in Southeast Asia.'));
    } else {
      art.append(P('Lentils, a few spices and one pot. This is the dal we make on busy weeknights, and it tastes like it took all afternoon.'));
      const ul = el('ul'); ul.style.cssText = 'margin:0 0 12px 20px;font-size:15px;line-height:1.8;color:#333';
      ['1 cup yellow lentils, rinsed', '1 onion, 2 tomatoes, chopped', '1 tsp each cumin, turmeric, chilli', 'Ghee, garlic, coriander to finish'].forEach(t => ul.append(el('li', null, t)));
      art.append(ul, adSlot('inl', 'Kitchen gadgets 70% off · today only', 260, 'ads.clickmint.io'));
      art.append(P('Bring the lentils to a boil with three cups of water and turmeric. Skim, then simmer for fifteen minutes.'));
      art.append(adSlot('vid', 'Autoplay video ad · sound on', 1400, 'vid.autoroll.tv'));
      art.append(P('Fry the cumin in ghee until it crackles, add garlic and chilli, then pour it sizzling over the dal.'));
    }
    side.append(adSlot('box', news ? 'YOU WON!' : 'Lose 10 kg in 7 days', 180, 'px.adsphere.net', news ? 'Claim your prize' : 'See the trick'));
    const card = el('div', 'card'); card.append(el('b', null, news ? 'Most read' : 'Popular this week'));
    (news ? ['Rail strike called off', 'The quiet return of the bookshop', 'Rates hold steady'] : ['Paneer butter masala', 'Lemon rice', '10-minute chutney']).forEach(t => card.append(el('div', null, '· ' + t)));
    side.append(card, adSlot('box', news ? 'Hot singles near you' : 'Win a free air fryer', 180, 'bid.yieldstack.net', 'Click here'));
    body.append(art, side); site.append(body);
    // fixed overlays
    const stick = el('div', 'ad stick'); stick.append(el('small', null, 'AD'), el('span', null, news ? 'Download our app · 50% off premium' : 'Install Cooksy+ for ad-free recipes'));
    const ck = el('div', 'cookie'); ck.append(el('b', null, 'We value your privacy 🍪'), document.createTextNode('We and our 847 partners store and access information on your device.'));
    const cb = el('div', 'cb'); cb.append(el('span', null, 'Accept all'), el('span', null, 'Manage')); ck.append(cb);
    vp.append(stick, ck); floaters = [stick, ck];
    applyAds(false);
  }
  function applyAds(anim) {
    const prot = protectedNow();
    slots.forEach(({ ad, z }) => {
      if (prot) {
        if (ad.hidden) return;
        if (G && anim) G.to(ad, { height: 0, opacity: 0, marginTop: 0, marginBottom: 0, duration: .45, ease: 'power3.in', onComplete: () => { ad.hidden = true; G.set(ad, { clearProps: 'all' }); z.hidden = false; G.from(z, { opacity: 0, scaleX: .7, transformOrigin: '0 50%', duration: .4, ease: 'back.out(2)' }); } });
        else { ad.hidden = true; z.hidden = false; }
      } else {
        z.hidden = true; if (!ad.hidden && !anim) return; ad.hidden = false;
        if (G && anim) { const h = ad.offsetHeight; G.fromTo(ad, { height: 0, opacity: 0 }, { height: h, opacity: 1, duration: .55, ease: 'back.out(1.4)', clearProps: 'height,opacity' }); }
      }
    });
    floaters.forEach(f => { if (prot) { if (G && anim && !f.hidden) G.to(f, { y: 40, opacity: 0, duration: .3, onComplete: () => { f.hidden = true; G.set(f, { clearProps: 'all' }); } }); else f.hidden = true; } else { f.hidden = false; if (G && anim) G.from(f, { y: 50, opacity: 0, duration: .5, ease: 'back.out(1.6)', delay: .2 }); } });
    page.ad = prot ? slots.length + floaters.length : 0;
    stateUi();
  }

  /* ---------- request stream ---------- */
  function load() {
    const tok = ++loadTok;
    Object.assign(page, { req: 0, blk: 0, tr: 0, ad: 0, fp: 0, savedKb: 0 });
    $('#ticker').replaceChildren(); $('#urlDom').textContent = cur.dom; $('#urlPath').textContent = cur.path;
    buildSite(); if (G) G.from(site, { opacity: 0, duration: .35 });
    const list = [];
    Object.entries(cur.mix).forEach(([k, n]) => { for (let i = 0; i < n; i++) { const [d, kb] = TRK[k][i % TRK[k].length]; list.push({ d, k, kb }); } });
    for (let i = 0; i < cur.first; i++) list.push({ d: cur.dom, k: 'first', kb: 30 });
    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    let t = 120;
    list.forEach(r => { t += 30 + Math.random() * 70; setTimeout(() => { if (tok === loadTok) request(r); }, t); });
    stateUi();
  }
  function request(r) {
    page.req++;
    if (r.k !== 'first') {
      const prot = protectedNow();
      if (prot) {
        page.blk++; allTime++; page.savedKb += r.kb; sessionKb += r.kb * 2.6;
        if (r.k === 'fp') page.fp++; else page.tr++;
        bumpBadge();
      }
      chip(r, prot); logRow(r, prot);
    }
    counters();
  }
  function chip(r, blocked) {
    const tk = $('#ticker'), c = el('span', 'tk' + (blocked ? ' ok' : ''), r.d);
    tk.prepend(c); while (tk.children.length > 5) tk.lastChild.remove();
    if (G) G.from(c, { x: -20, opacity: 0, duration: .3, ease: 'power2.out' });
  }
  const KLAB = { ad: ['ad', 'Ad'], an: ['an', 'Analytics'], so: ['so', 'Social'], fp: ['fp', 'Fingerprint'] };
  function logRow(r, blocked) {
    const log = $('#log'), row = el('div', 'li'), d = new Date();
    const [cls, lab] = blocked ? KLAB[r.k] : ['ld', 'Loaded'];
    row.append(el('span', 't', d.toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })), el('span', 'd', r.d), el('span', 'k ' + cls, blocked ? lab : 'Allowed'));
    const emp = log.querySelector('.empty'); if (emp) emp.remove();
    log.prepend(row); while (log.children.length > 80) log.lastChild.remove();
  }
  function bumpBadge() { if (G) { G.fromTo('#badge', { scale: 1.35 }, { scale: 1, duration: .3, ease: 'back.out(3)' }); } }
  let memShown = 0;
  function counters() {
    $('#badge').textContent = shieldOn ? page.blk : 'off';
    if (cur.tbEl) cur.tbEl.textContent = page.blk;
    $('#hReq').textContent = page.req; $('#hBlk').textContent = page.blk; $('#hSave').textContent = fmtKb(page.savedKb);
    $('#sTr').textContent = page.tr; $('#sAd').textContent = page.ad; $('#sFp').textContent = page.fp;
    $('#totAll').textContent = `${allTime.toLocaleString()} blocked all-time`;
    const mb = sessionKb / 1024;
    $('#memV').textContent = mb.toFixed(1) + ' MB';
    const w = Math.min(100, mb / 80 * 100);
    if (Math.abs(w - memShown) > .3) { memShown = w; if (G) G.to('#memBar', { width: w + '%', duration: .4, ease: 'power2.out' }); else $('#memBar').style.width = w + '%'; }
    const speed = page.savedKb ? (1 + page.savedKb / 2600).toFixed(1) : null;
    $('#memSub').textContent = speed ? `This page loaded about ${speed}× faster with ${fmtKb(page.savedKb)} of junk skipped.` : protectedNow() ? 'Pages load faster when ads never arrive.' : 'Nothing is being blocked on this page.';
  }
  function stateUi() {
    const prot = protectedNow(), paused = shieldOn && allow.has(cur.dom);
    $('#pin').classList.toggle('off', !prot);
    $('#ext').classList.toggle('off', !shieldOn);
    $('#hud').classList.toggle('off', !prot);
    $('#hudState').textContent = prot ? 'Protected' : paused ? 'Paused on this site' : 'Protection off';
    $('#stTitle').textContent = prot ? 'Protected' : paused ? 'Paused here' : 'Protection off';
    $('#stSub').textContent = prot ? `Blocking trackers on ${cur.dom}` : paused ? `${cur.dom} is on your allowlist` : 'Trackers can see everything you do';
    $('#urlShield').style.color = prot ? 'var(--accent-2)' : '#6E6889';
    $('#pSite').textContent = cur.dom;
    $('#shieldBtn').setAttribute('aria-checked', String(shieldOn));
    $('#siteTg').setAttribute('aria-checked', String(allow.has(cur.dom)));
    if (spin) { if (prot) spin.play(); else spin.pause(); }
    counters();
  }

  /* ---------- popup ---------- */
  const popup = $('#popup'), ext = $('#ext');
  function openPop() { popOpen = true; popup.hidden = false; ext.setAttribute('aria-expanded', 'true'); placeInd(false); if (G) G.fromTo(popup, { scale: .85, opacity: 0, y: -8 }, { scale: 1, opacity: 1, y: 0, duration: .45, ease: 'back.out(1.8)' }); check('popup'); }
  function closePop() { popOpen = false; ext.setAttribute('aria-expanded', 'false'); if (G) G.to(popup, { scale: .9, opacity: 0, duration: .18, onComplete: () => { popup.hidden = true; G.set(popup, { clearProps: 'all' }); } }); else popup.hidden = true; }
  ext.addEventListener('click', e => { e.stopPropagation(); popOpen ? closePop() : openPop(); });
  document.addEventListener('pointerdown', e => { if (popOpen && !popup.contains(e.target) && !ext.contains(e.target)) closePop(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && popOpen) closePop(); });
  function placeInd(anim) { const b = popup.querySelector('.ptabs [aria-selected="true"]'), css = { left: b.offsetLeft + 'px', width: b.offsetWidth + 'px' }; if (G && anim) G.to('#pInd', { ...css, duration: .45, ease: 'elastic.out(1,.75)' }); else Object.assign($('#pInd').style, css); }
  $$('.ptabs button').forEach(b => b.addEventListener('click', () => {
    $$('.ptabs button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    $$('.pp').forEach(p => { p.hidden = p.dataset.pane !== b.dataset.p; });
    placeInd(true);
    const pane = popup.querySelector(`[data-pane="${b.dataset.p}"]`); if (G) G.from(pane.children, { y: 8, opacity: 0, duration: .3, stagger: .04, clearProps: 'transform,opacity' });
    if (b.dataset.p === 'log') { check('log'); if (!$('#log').children.length) $('#log').append(el('div', 'empty', 'Nothing yet. Reload the page.')); }
    if (b.dataset.p === 'allow') renderAllow();
  }));

  /* ---------- the big shield ---------- */
  let spin = null;
  if (G) spin = G.to('#ring', { rotation: 360, duration: 6, ease: 'none', repeat: -1 });
  $('#shieldBtn').addEventListener('click', () => {
    shieldOn = !shieldOn; toggles++;
    if (G) {
      G.fromTo('#ripple', { scale: 1, opacity: .9, borderColor: shieldOn ? '#FF7139' : '#6E6889' }, { scale: 1.9, opacity: 0, duration: .7, ease: 'power2.out' });
      G.fromTo('#shieldBtn svg', { scale: .7, rotation: shieldOn ? -25 : 25 }, { scale: 1, rotation: 0, duration: .8, ease: 'elastic.out(1,.45)' });
      G.fromTo('#pulse', { opacity: 1, scale: 1 }, { opacity: 0, scale: 1.6, duration: .6 });
    }
    applyAds(true);
    if (toggles >= 2 && shieldOn) check('shield');
  });
  $('#siteTg').addEventListener('click', () => {
    if (allow.has(cur.dom)) allow.delete(cur.dom); else { allow.add(cur.dom); check('allow'); }
    applyAds(true); renderAllow();
  });

  /* ---------- allowlist ---------- */
  const DOM_RE = /^(?=.{3,60}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;
  function hue(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
  function renderAllow() {
    const l = $('#alist'); l.replaceChildren();
    if (!allow.size) l.append(el('div', 'empty', 'No sites allowed. Protection runs everywhere.'));
    [...allow].reverse().forEach(d => {
      const it = el('div', 'aitem' + (d === cur.dom ? ' cur' : '')), fv = el('span', 'fv', d[0].toUpperCase()); fv.style.background = `hsl(${hue(d)},55%,45%)`;
      const x = el('button', null, '×'); x.type = 'button'; x.setAttribute('aria-label', `Remove ${d}`);
      x.addEventListener('click', () => { const go = () => { allow.delete(d); renderAllow(); if (d === cur.dom) applyAds(true); else stateUi(); }; if (G) G.to(it, { x: 30, opacity: 0, duration: .25, onComplete: go }); else go(); });
      it.append(fv, el('span', null, d)); if (d === cur.dom) it.append(el('small', null, 'this tab')); it.append(x);
      l.append(it);
    });
  }
  $('#allowForm').addEventListener('submit', e => {
    e.preventDefault();
    const inp = $('#allowIn'), h = $('#allowHint');
    const d = inp.value.trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/[/?#].*$/, '').replace(/^www\./, '');
    if (!DOM_RE.test(d)) { inp.classList.add('err'); h.classList.add('err'); h.textContent = 'That doesn’t look like a domain. Try something like news.example'; if (G) G.fromTo(inp, { x: -6 }, { x: 0, duration: .4, ease: 'elastic.out(1,.3)' }); return; }
    inp.classList.remove('err'); h.classList.remove('err');
    if (allow.has(d)) { h.textContent = `${d} is already on the list.`; return; }
    allow.add(d); inp.value = ''; h.textContent = d === cur.dom ? `Paused on ${d}. Ads and trackers are back on this tab.` : `${d} added. Trackers won’t be blocked there.`;
    renderAllow(); const first = $('#alist').firstChild; if (G && first) G.from(first, { y: -12, opacity: 0, backgroundColor: 'rgba(255,113,57,.3)', duration: .5 });
    check('allow'); if (d === cur.dom) applyAds(true);
  });
  $('#allowIn').addEventListener('input', () => { $('#allowIn').classList.remove('err'); $('#allowHint').classList.remove('err'); });

  /* ---------- reload ---------- */
  $('#reload').addEventListener('click', () => { if (G) G.fromTo('#reload svg', { rotation: 0 }, { rotation: 360, duration: .6, ease: 'power2.inOut' }); load(); check('reload'); });

  /* ---------- boot ---------- */
  renderTabs(); load(); renderAllow();
  if (G) {
    G.from('.intro > *', { y: 24, opacity: 0, duration: .8, stagger: .1, ease: 'expo.out' });
    G.from('#stage', { y: 40, opacity: 0, duration: .8, ease: 'expo.out', delay: .2 });
  }
})();
