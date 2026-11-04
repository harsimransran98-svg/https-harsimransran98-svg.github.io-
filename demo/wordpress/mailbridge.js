/* MailBridge — WordPress plugin page with a live wp-admin simulator (Bazozo Studio).
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
    const DOM_RE = /^(?=.{3,60}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;
    let domain = 'northwind.store';
    const rec = { spf: 'pass', dkim: 'fail', dmarc: 'warn' };
    const wrap = el('div', 'mb'), dns = el('div', 'mb-dns'), send = el('div', 'mb-send'), log = el('div', 'mb-log'), insp = el('div', 'mb-insp');
    // DNS checker
    const form = el('form', 'mb-form'); const inp = el('input'); inp.value = domain; inp.maxLength = 60; inp.spellcheck = false; inp.setAttribute('aria-label', 'Sending domain'); const chk = el('button', 'btn pri', 'Check DNS'); chk.type = 'submit'; form.append(inp, chk);
    const recs = el('div', 'mb-recs'), fix = el('button', 'mb-fix', 'Fix with MailBridge'); fix.type = 'button';
    dns.append(el('p', 'mb-l', 'Domain authentication'), form, recs, fix);
    // send test
    const lane = svgEl('svg', { viewBox: '0 0 520 120', class: 'mb-lane', 'aria-hidden': 'true' });
    lane.append(svgEl('path', { id: 'mbp', d: 'M40 70 C 160 10, 360 10, 480 70', fill: 'none', stroke: 'rgba(29,78,216,.25)', 'stroke-width': 2, 'stroke-dasharray': '6 6' }));
    const node = (x, label) => { const g = svgEl('g'); g.append(svgEl('rect', { x: x - 34, y: 76, width: 68, height: 30, rx: 8, fill: '#fff', stroke: '#C9D6EA' })); const t = svgEl('text', { x, y: 96, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: '#0B1F3A' }); t.textContent = label; g.append(t); return g; };
    lane.append(node(40, 'WordPress'), node(260, 'SMTP relay'), node(480, 'Inbox'));
    const env = svgEl('g', { opacity: 0 }); env.append(svgEl('rect', { x: -16, y: -11, width: 32, height: 22, rx: 3, fill: '#fff', stroke: '#1D4ED8', 'stroke-width': 2 }), svgEl('path', { d: 'M-16 -11 L0 3 L16 -11', fill: 'none', stroke: '#1D4ED8', 'stroke-width': 2 }), svgEl('circle', { cx: 11, cy: -6, r: 4, fill: '#E11D48' })); lane.append(env);
    const steps = el('div', 'mb-steps'), to = el('input'); to.value = 'priya@northwind.store'; to.maxLength = 80; to.setAttribute('aria-label', 'Send test email to');
    const go = el('button', 'btn pri', 'Send test email'); go.type = 'button'; const sendRow = el('div', 'mb-row'); sendRow.append(to, go);
    send.append(el('p', 'mb-l', 'Send a test'), sendRow, lane, steps);
    log.append(el('p', 'mb-l', 'Email log'));
    const table = el('div', 'mb-table'); log.append(table, insp);
    wrap.append(dns, send, log); root.append(wrap);
    const VALUES = {
      spf: { pass: () => `v=spf1 include:_spf.mailbridge.net ~all`, fail: () => 'No SPF record found', warn: () => 'v=spf1 +all  (allows anyone to send!)' },
      dkim: { pass: () => `mb1._domainkey.${domain}: k=rsa; p=MIIBIjANBgkq…QAB`, fail: () => `mb1._domainkey.${domain}: not found`, warn: () => 'Key is 1024-bit; upgrade to 2048' },
      dmarc: { pass: () => `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`, fail: () => 'No DMARC record', warn: () => 'v=DMARC1; p=none  (monitoring only)' }
    };
    const FIX = { spf: 'Add TXT @ → v=spf1 include:_spf.mailbridge.net ~all', dkim: 'Add TXT mb1._domainkey → the key MailBridge generated', dmarc: 'Change p=none to p=quarantine once reports look clean' };
    function renderRecs(anim) {
      recs.replaceChildren();
      ['spf', 'dkim', 'dmarc'].forEach((k, i) => {
        const st = rec[k], r = el('div', 'mb-rec ' + st); const ic = el('span', 'mb-ic', st === 'pass' ? '✓' : st === 'warn' ? '!' : '×');
        const body = el('div'); body.append(el('b', null, k.toUpperCase()), el('code', null, VALUES[k][st]())); if (st !== 'pass') body.append(el('small', null, 'Fix: ' + FIX[k]));
        r.append(ic, body); recs.append(r);
        if (anim && G && !reduced) G.from(r, { x: -20, opacity: 0, duration: .4, delay: i * .25, ease: 'power3.out' });
      });
      const ok = Object.values(rec).every(v => v === 'pass'); fix.hidden = ok;
    }
    form.addEventListener('submit', e => {
      e.preventDefault(); const d = inp.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!DOM_RE.test(d)) { inp.classList.add('bad'); toast('That doesn’t look like a domain. Try example.com'); return; }
      inp.classList.remove('bad'); domain = d; recs.replaceChildren(el('p', 'mb-wait', `Querying DNS for ${domain}…`));
      // deterministic but varied results per domain
      let h = 0; for (const c of d) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      rec.spf = ['pass', 'fail', 'warn'][h % 3]; rec.dkim = ['fail', 'pass', 'warn'][(h >> 3) % 3]; rec.dmarc = ['warn', 'fail', 'pass'][(h >> 6) % 3];
      setTimeout(() => renderRecs(true), reduced ? 0 : 700);
    });
    fix.addEventListener('click', () => { Object.keys(rec).forEach(k => { rec[k] = 'pass'; }); renderRecs(true); toast('DNS records published. Propagation usually takes a few minutes.'); });
    let n = 0; const rows = [];
    function addRow(m) { rows.unshift(m); table.replaceChildren(); const head = el('div', 'mb-tr mb-th'); ['Time', 'To', 'Subject', 'Status'].forEach(t => head.append(el('span', null, t))); table.append(head); rows.slice(0, 6).forEach(r => { const tr = el('button', 'mb-tr'); tr.type = 'button'; tr.append(el('span', null, r.time), el('span', null, r.to), el('span', null, r.subj), el('span', 'mb-st ' + r.st, r.stLabel)); tr.addEventListener('click', () => inspect(r)); table.append(tr); }); }
    function inspect(r) { insp.replaceChildren(el('p', 'mb-l', `Headers · ${r.id}`)); const pre = el('pre'); pre.textContent = `Message-ID: <${r.id}@${domain}>\nFrom: Northwind Store <hello@${domain}>\nTo: ${r.to}\nSubject: ${r.subj}\nReceived: from relay.mailbridge.net (TLS1.3) by mx.recipient\nDKIM-Signature: v=1; a=rsa-sha256; d=${domain}; s=mb1; ${r.auth.dkim === 'pass' ? 'bh=Q2h…' : '(not signed)'}\nAuthentication-Results: spf=${r.auth.spf}; dkim=${r.auth.dkim}; dmarc=${r.auth.dmarc}\nX-MailBridge-Verdict: ${r.stLabel}`; insp.append(pre); if (G && !reduced) G.from(insp, { opacity: 0, y: 10, duration: .3 }); }
    go.addEventListener('click', () => {
      const addr = to.value.trim(); if (!/^[^\s@]{1,64}@[^\s@]+\.[a-z]{2,}$/i.test(addr)) { toast('Enter a valid email address.'); return; }
      go.disabled = true; const auth = { ...rec }, inbox = Object.values(auth).every(v => v === 'pass');
      const STEPS = ['Queued in WordPress', 'SMTP handshake · STARTTLS', auth.dkim === 'pass' ? `Signed with DKIM (d=${domain})` : 'Not DKIM-signed', inbox ? 'Delivered to inbox' : 'Delivered to spam folder'];
      steps.replaceChildren(); STEPS.forEach(t => steps.append(el('span', null, t)));
      const path = lane.querySelector('#mbp'), len = path.getTotalLength(), o = { p: 0 };
      const place = () => { const pt = path.getPointAtLength(o.p * len); env.setAttribute('transform', `translate(${pt.x} ${pt.y})`); steps.querySelectorAll('span').forEach((s, i) => s.classList.toggle('on', o.p >= i / 3 - .01)); };
      env.setAttribute('opacity', 1);
      const finish = () => { const id = 'mb' + Date.now().toString(36); addRow({ id, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), to: addr, subj: `Test email #${++n} from MailBridge`, st: inbox ? 'ok' : 'spam', stLabel: inbox ? 'Delivered' : 'Spam', auth }); go.disabled = false; toast(inbox ? 'Delivered to the inbox. Open the log row to see headers.' : 'Landed in spam: fix the failing DNS records and try again.'); };
      if (G && !reduced) G.to(o, { p: 1, duration: 2.2, ease: 'power1.inOut', onUpdate: place, onComplete: () => { setTimeout(() => env.setAttribute('opacity', 0), 400); finish(); } });
      else { o.p = 1; place(); finish(); }
    });
    renderRecs(false);
    addRow({ id: 'mb0a1', time: '09:12:04', to: 'orders@northwind.store', subj: 'New order #10432', st: 'ok', stLabel: 'Delivered', auth: { spf: 'pass', dkim: 'pass', dmarc: 'pass' } });
  }

  demo(document.getElementById('demo'), H);
})();
