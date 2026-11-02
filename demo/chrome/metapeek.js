/* MetaPeek — interactive browser-extension simulator (Bazozo Studio).
   Everything is built with DOM methods + textContent (no innerHTML). */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const sysReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!window.gsap;
  $('#year').textContent = new Date().getFullYear();

  /* ---------- the two pages open in the simulated browser ---------- */
  const PAGES = {
    shop: {
      host: 'kettle-ash.example', path: '/shop',
      title: 'Kettle & Ash — Small-batch coffee roasted twice a week',
      description: 'Small-batch specialty coffee roasted every Tuesday and Friday and shipped within 48 hours. Free shipping on orders over $45.',
      canonical: 'https://kettle-ash.example/shop', ogTitle: 'Kettle & Ash — This week\'s roast', ogImage: null,
      lang: 'en', viewport: 'width=device-width, initial-scale=1'
    },
    blog: {
      host: 'my-blog.example', path: '/post?id=42',
      title: 'Home', description: null, canonical: null, ogTitle: null, ogImage: null,
      lang: null, viewport: 'width=device-width, initial-scale=1'
    }
  };
  let current = 'shop';
  const article = () => $(`.mock[data-page="${current}"]`);

  /* ---------- settings (persisted per viewer) ---------- */
  const DEFAULTS = { autoAudit: true, flagAlt: true, showHeadings: false, badge: true, calm: false };
  let settings = { ...DEFAULTS };
  try { Object.assign(settings, JSON.parse(localStorage.getItem('metapeek-settings') || '{}')); } catch (e) {}
  const saveSettings = () => { try { localStorage.setItem('metapeek-settings', JSON.stringify(settings)); } catch (e) {} };
  const calm = () => settings.calm || sysReduced || !hasGsap;

  /* ---------- tiny DOM helper ---------- */
  function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  /* ---------- audit: 10 weighted on-page checks, run against the live mock DOM ---------- */
  function audit() {
    const meta = PAGES[current], doc = article();
    const words = (doc.innerText || doc.textContent).trim().split(/\s+/).filter(Boolean).length;
    const heads = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')];
    const h1s = heads.filter(h => h.tagName === 'H1').length;
    let skip = null, prev = 0;
    heads.forEach(h => { const lv = +h.tagName[1]; if (prev && lv > prev + 1 && !skip) skip = `H${prev} → H${lv}`; prev = lv; });
    const noAlt = doc.querySelectorAll('img:not([alt])').length;
    const vague = [...doc.querySelectorAll('a')].filter(a => /^(click here|here|read more|more)$/i.test(a.textContent.trim())).length;
    const tl = meta.title.length, dl = meta.description ? meta.description.length : 0;
    const og = (meta.ogTitle ? 1 : 0) + (meta.ogImage ? 1 : 0);
    return [
      { label: 'Title tag', w: 12, s: tl >= 30 && tl <= 60 ? 'pass' : tl >= 10 && tl <= 70 ? 'warn' : 'fail', d: `${tl} characters (aim for 30–60)` },
      { label: 'Meta description', w: 12, s: !dl ? 'fail' : dl >= 70 && dl <= 160 ? 'pass' : 'warn', d: dl ? `${dl} characters (aim for 70–160)` : 'Missing' },
      { label: 'Single H1', w: 12, s: h1s === 1 ? 'pass' : 'fail', d: `${h1s} H1 heading${h1s === 1 ? '' : 's'} found` },
      { label: 'Heading order', w: 8, s: skip ? 'warn' : 'pass', d: skip ? `Skips a level: ${skip}` : 'No skipped levels' },
      { label: 'Image alt text', w: 14, s: noAlt ? 'fail' : 'pass', d: noAlt ? `${noAlt} image${noAlt === 1 ? '' : 's'} missing alt` : 'Every image is described' },
      { label: 'Canonical URL', w: 10, s: meta.canonical ? 'pass' : 'warn', d: meta.canonical ? 'Present' : 'Missing (duplicate-content risk)' },
      { label: 'Open Graph tags', w: 10, s: og === 2 ? 'pass' : og === 1 ? 'warn' : 'fail', d: og === 2 ? 'og:title and og:image set' : og === 1 ? 'og:image missing' : 'No share preview tags' },
      { label: 'Mobile viewport', w: 8, s: meta.viewport ? 'pass' : 'fail', d: meta.viewport ? 'Responsive viewport set' : 'Missing' },
      { label: 'Language attribute', w: 6, s: meta.lang ? 'pass' : 'warn', d: meta.lang ? `lang="${meta.lang}"` : 'No lang on <html>' },
      { label: 'Descriptive links', w: 8, s: vague ? 'warn' : 'pass', d: vague ? `${vague} vague link${vague === 1 ? '' : 's'} (“click here”)` : 'Link text is descriptive' }
    ].map(c => ({ ...c, pts: c.s === 'pass' ? c.w : c.s === 'warn' ? c.w / 2 : 0, words }));
  }

  /* ---------- dashboard ---------- */
  const CIRC = 2 * Math.PI * 52;
  const ring = $('#ringProg'), scoreNum = $('#scoreNum'), grade = $('#grade'), gradeNote = $('#gradeNote');
  const runBtn = $('#runBtn'), checksEl = $('#checks'), logEl = $('#log');
  const badge = $('#mpBadge');
  const results = {}; // last audit per page
  let running = null;

  const colorFor = s => (s >= 85 ? 'var(--good)' : s >= 60 ? 'var(--warn)' : 'var(--bad)');
  const gradeFor = s => (s >= 85 ? 'Strong' : s >= 60 ? 'Needs work' : 'Poor');
  function setRing(score) { ring.setAttribute('stroke-dashoffset', String(CIRC * (1 - score / 100))); }

  function checkItem(c) {
    const li = el('li', c.s);
    const dot = el('span', 'dot', c.s === 'pass' ? '✓' : c.s === 'warn' ? '!' : '×');
    dot.setAttribute('aria-hidden', 'true');
    const body = el('div', null, c.label); body.append(el('small', null, c.d));
    li.append(dot, body, el('span', 'pts mono', `${c.pts}/${c.w}`));
    li.setAttribute('aria-label', `${c.label}: ${c.s}. ${c.d}`);
    return li;
  }
  function paintSummary(res) {
    const score = Math.round(res.reduce((s, c) => s + c.pts, 0));
    const issues = res.filter(c => c.s !== 'pass').length;
    scoreNum.textContent = score;
    grade.replaceChildren(document.createTextNode('Grade'));
    const pill = el('i', null, gradeFor(score)); pill.style.background = colorFor(score); pill.style.color = '#0B0C14';
    grade.append(pill);
    gradeNote.textContent = issues ? `${issues} thing${issues === 1 ? '' : 's'} to fix on ${PAGES[current].host}.` : 'Nothing to fix. Nice work.';
    $('#stIssues').textContent = issues; $('#stPassed').textContent = res.length - issues; $('#stWords').textContent = res[0].words;
    $('#ppTime').textContent = 'Last run ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updateBadge();
  }
  function showStored() {
    const res = results[current];
    checksEl.replaceChildren();
    if (!res) {
      scoreNum.textContent = '—'; setRing(0); grade.textContent = 'Not audited yet';
      gradeNote.textContent = 'Run an audit to score this page against 10 on-page SEO checks.';
      ['#stIssues', '#stPassed', '#stWords'].forEach(s => { $(s).textContent = '—'; });
      const e = el('li', 'empty', 'Results appear here after an audit.'); e.style.cssText = 'display:block;background:none;padding:2px';
      checksEl.append(e); logEl.textContent = ''; return;
    }
    res.forEach(c => checksEl.append(checkItem(c)));
    setRing(Math.round(res.reduce((s, c) => s + c.pts, 0)));
    paintSummary(res); logEl.textContent = 'Complete';
  }
  function updateBadge() {
    const res = results[current];
    const n = res ? res.filter(c => c.s !== 'pass').length : 0;
    badge.hidden = !settings.badge || !res || n === 0;
    badge.textContent = n;
  }

  function runAudit({ silent = false } = {}) {
    const res = audit();
    results[current] = res;
    if (silent || calm()) { showStored(); return; }
    if (running) running.kill();
    runBtn.disabled = true; runBtn.textContent = 'Auditing…';
    checksEl.replaceChildren();
    const ringState = { v: 0 }, num = { v: 0 };
    setRing(0); scoreNum.textContent = '0';
    const tl = gsap.timeline({ onComplete: () => {
      runBtn.disabled = false; runBtn.textContent = 'Run Instant Audit'; logEl.textContent = 'Complete'; running = null;
      paintSummary(res);
      gsap.fromTo('.ring', { scale: 1 }, { scale: 1.06, duration: .18, yoyo: true, repeat: 1, ease: 'power2.out' });
    } });
    let acc = 0;
    res.forEach((c, i) => {
      acc += c.pts;
      const target = acc;
      tl.call(() => {
        logEl.textContent = `Checking ${c.label.toLowerCase()}…`;
        const li = checkItem(c); checksEl.append(li);
        gsap.from(li, { x: -14, opacity: 0, duration: .35, ease: 'power3.out' });
      }, null, i * .2);
      tl.to(ringState, { v: target, duration: .32, ease: 'power2.out', onUpdate: () => setRing(ringState.v) }, i * .2);
      tl.to(num, { v: target, duration: .32, ease: 'power2.out', onUpdate: () => { scoreNum.textContent = Math.round(num.v); } }, i * .2);
    });
    running = tl;
  }
  runBtn.addEventListener('click', () => runAudit());

  /* ---------- inspector: metadata, heading tree, element picker ---------- */
  const metaList = $('#metaList'), tree = $('#tree'), elCard = $('#elCard');
  function renderMeta() {
    const m = PAGES[current];
    const rows = [['<title>', m.title], ['description', m.description], ['canonical', m.canonical], ['og:title', m.ogTitle], ['og:image', m.ogImage], ['html lang', m.lang], ['viewport', m.viewport]];
    metaList.replaceChildren();
    rows.forEach(([k, v]) => {
      const li = el('li');
      li.append(el('span', 'k', k), el('span', 'v' + (v ? '' : ' missing'), v || 'missing'));
      if (v) {
        const b = el('button', 'copy', 'Copy'); b.type = 'button'; b.setAttribute('aria-label', `Copy ${k}`);
        b.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(v); b.textContent = 'Copied'; } catch (e) { b.textContent = 'Blocked'; }
          setTimeout(() => { b.textContent = 'Copy'; }, 1200);
        });
        li.append(b);
      }
      metaList.append(li);
    });
    tree.replaceChildren();
    let prev = 0;
    article().querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
      const lv = +h.tagName[1];
      const li = el('li', prev && lv > prev + 1 ? 'skip' : null);
      li.style.paddingLeft = (lv - 1) * 12 + 'px';
      li.append(el('b', null, 'H' + lv), document.createTextNode(h.textContent.trim()));
      tree.append(li); prev = lv;
    });
    $('#ppHost').textContent = m.host;
  }

  const viewport = $('#viewport'), hl = $('#hl'), hlTip = $('#hlTip'), pickHint = $('#pickHint');
  let picking = false;
  function boxFor(node) {
    const vr = viewport.getBoundingClientRect(), r = node.getBoundingClientRect();
    return { x: r.left - vr.left, y: r.top - vr.top + viewport.scrollTop, w: r.width, h: r.height };
  }
  function highlight(node) {
    const b = boxFor(node);
    hl.hidden = false; Object.assign(hl.style, { left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px' });
    hlTip.replaceChildren();
    const cls = node.classList.length ? '.' + [...node.classList].join('.') : '';
    hlTip.append(el('b', null, node.tagName.toLowerCase() + cls), document.createTextNode(`  ${Math.round(b.w)} × ${Math.round(b.h)}`));
    hlTip.hidden = false;
    const tipY = b.y - 26 < viewport.scrollTop ? b.y + b.h + 6 : b.y - 26;
    Object.assign(hlTip.style, { left: Math.max(4, Math.min(b.x, viewport.clientWidth - 220)) + 'px', top: tipY + 'px' });
  }
  function clearHighlight() { hl.hidden = true; hlTip.hidden = true; }
  const pickable = t => t && t !== viewport && !t.classList.contains('mock') && article().contains(t);

  function startPick() {
    picking = true; viewport.classList.add('picking'); pickHint.hidden = false;
    closePopup(true);
  }
  function stopPick(reopen) {
    picking = false; viewport.classList.remove('picking'); pickHint.hidden = true;
    if (reopen) openPopup('insp');
  }
  $('#pickBtn').addEventListener('click', startPick);
  viewport.addEventListener('pointermove', e => { if (picking && pickable(e.target)) highlight(e.target); });
  viewport.addEventListener('click', e => {
    if (!picking) return;
    e.preventDefault(); e.stopPropagation();
    if (!pickable(e.target)) return;
    highlight(e.target); describe(e.target); stopPick(true);
  }, true);

  function bgOf(node) {
    for (let n = node; n && n !== viewport; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && c !== 'transparent' && !/rgba\(\d+, \d+, \d+, 0\)/.test(c)) return c;
    }
    return 'rgb(255, 255, 255)';
  }
  function describe(node) {
    const cs = getComputedStyle(node), b = boxFor(node);
    const cls = node.classList.length ? '.' + [...node.classList].join('.') : '';
    const head = el('div', 'tag', `<${node.tagName.toLowerCase()}${cls ? ' class="' + [...node.classList].join(' ') + '"' : ''}>`);
    const dl = el('dl');
    const row = (k, v, swatch) => {
      const dd = el('dd');
      if (swatch) { const s = el('span', 'swatch'); s.style.background = swatch; dd.append(s); }
      dd.append(document.createTextNode(v));
      dl.append(el('dt', null, k), dd);
    };
    const text = node.tagName === 'IMG' ? null : node.textContent.trim().replace(/\s+/g, ' ');
    if (text) row('Text', text.length > 60 ? text.slice(0, 60) + '…' : text);
    row('Size', `${Math.round(b.w)} × ${Math.round(b.h)} px`);
    row('Font', `${cs.fontFamily.split(',')[0].replace(/["']/g, '')} · ${cs.fontSize} · ${cs.fontWeight}`);
    row('Colour', cs.color, cs.color);
    row('Background', bgOf(node), bgOf(node));
    if (node.tagName === 'IMG') row('Alt text', node.hasAttribute('alt') ? (node.alt || '(empty, decorative)') : '⚠ missing');
    if (node.tagName === 'A') row('Link to', node.getAttribute('href') || '—');
    elCard.replaceChildren(head, dl);
  }

  /* ---------- popup open / close + tabs ---------- */
  const popup = $('#popup'), icon = $('#mpIcon');
  const tabs = $$('.pp-tabs [role="tab"]'), ind = $('#ppInd');
  function selectTab(i, focus) {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    ind.style.transform = `translateX(${i * 100}%)`;
    if (focus) tabs[i].focus();
    if (i === 1) renderMeta();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(i));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') selectTab((i + 1) % 3, true);
      if (e.key === 'ArrowLeft') selectTab((i + 2) % 3, true);
    });
  });

  function openPopup(tab) {
    if (tab === 'insp') selectTab(1);
    if (!popup.hidden) return;
    popup.hidden = false; icon.setAttribute('aria-expanded', 'true');
    if (calm()) { if (hasGsap) gsap.set(popup, { clearProps: 'all' }); }
    else {
      gsap.killTweensOf(popup);
      gsap.fromTo(popup, { scale: .55, opacity: 0, y: -14 }, { scale: 1, opacity: 1, y: 0, duration: .95, ease: 'elastic.out(1, .62)' });
    }
  }
  function closePopup(keepIcon) {
    if (popup.hidden) return;
    icon.setAttribute('aria-expanded', 'false');
    const done = () => { popup.hidden = true; };
    if (calm()) done();
    else gsap.to(popup, { scale: .9, opacity: 0, y: -6, duration: .18, ease: 'power2.in', onComplete: done });
    if (!keepIcon) clearHighlight();
  }
  icon.addEventListener('click', e => { e.stopPropagation(); if (picking) stopPick(false); popup.hidden ? openPopup() : closePopup(); });
  // like real Chrome: clicking the page closes the popup
  $('#browser').addEventListener('click', e => {
    if (picking || popup.hidden) return;
    if (!popup.contains(e.target) && !icon.contains(e.target)) closePopup();
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (picking) { stopPick(true); clearHighlight(); } else if (!popup.hidden) { closePopup(); icon.focus(); }
  });
  // stop mock-page links from jumping the real page
  viewport.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a || picking) return;
    e.preventDefault();
    const t = viewport.querySelector(a.getAttribute('href'));
    if (t) viewport.scrollTo({ top: t.offsetTop - 10, behavior: calm() ? 'auto' : 'smooth' });
  });

  /* ---------- browser tabs ---------- */
  const urlEl = $('#url');
  function showUrl() {
    const m = PAGES[current];
    urlEl.replaceChildren(document.createTextNode(m.host), el('b', null, m.path));
  }
  $$('.btab').forEach(t => t.addEventListener('click', e => {
    e.stopPropagation();
    if (t.dataset.page === current) return;
    current = t.dataset.page;
    $$('.btab').forEach(b => b.setAttribute('aria-selected', String(b === t)));
    $$('.mock').forEach(m => { m.hidden = m.dataset.page !== current; });
    viewport.scrollTop = 0; clearHighlight();
    elCard.replaceChildren(el('span', 'empty', 'No element selected. Pick one to see its tag, size, font and colours.'));
    showUrl(); renderMeta();
    if (settings.autoAudit) runAudit({ silent: popup.hidden || tabs[0].getAttribute('aria-selected') !== 'true' });
    else showStored();
    updateBadge();
  }));

  /* ---------- settings switches ---------- */
  function applySettings() {
    viewport.classList.toggle('flag-alt', settings.flagAlt);
    viewport.classList.toggle('show-headings', settings.showHeadings);
    $$('.switch').forEach(s => s.setAttribute('aria-checked', String(!!settings[s.dataset.set])));
    updateBadge();
  }
  $$('.switch').forEach(s => s.addEventListener('click', () => {
    settings[s.dataset.set] = !settings[s.dataset.set];
    saveSettings(); applySettings();
  }));

  /* ---------- Chrome / Safari skin ---------- */
  const pill = $('#skinPill');
  function setSkin(name) {
    $('#browser').classList.toggle('safari', name === 'safari');
    $$('.skin button').forEach(b => {
      const on = b.dataset.skin === name; b.setAttribute('aria-pressed', String(on));
      if (on) { pill.style.width = b.offsetWidth + 'px'; pill.style.transform = `translateX(${b.offsetLeft - 4}px)`; }
    });
  }
  $$('.skin button').forEach(b => b.addEventListener('click', () => setSkin(b.dataset.skin)));

  /* ---------- boot: open the popup with a bounce and run a first audit ---------- */
  showUrl(); renderMeta(); applySettings(); setSkin('chrome'); selectTab(0);
  if (hasGsap && !sysReduced) {
    gsap.from('#browser', { y: 40, opacity: 0, duration: 1, ease: 'expo.out' });
    gsap.delayedCall(.7, () => { openPopup(); gsap.delayedCall(.6, () => runAudit()); });
  } else { openPopup(); runAudit({ silent: true }); }
})();
