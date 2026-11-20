/* FocusDial — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} } };
  let ac = null;
  const tone = (f = 440, d = .1, type = 'sine', v = .04) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d); o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d + .02); } catch (_) {} };
  const haptic = (p = 8) => { try { navigator.vibrate && navigator.vibrate(p); } catch (_) {} };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- fit the device to the space ---------- */
  const stage = $('#stage'), desk = $('#desk'), device = $('#device');
  function fit() {
    const vw = document.documentElement.clientWidth;
    if (desk) { const w = stage.clientWidth || vw - 32; stage.style.setProperty('--s', Math.min(1, w / 1200).toFixed(4)); return; }
    const W = device.offsetWidth, Hh = device.offsetHeight, wide = vw > 1180;
    stage.style.setProperty('--s', Math.max(.55, Math.min(1, wide ? (window.innerHeight - 110) / Hh : 1, (vw - 32) / W)).toFixed(3));
  }
  window.addEventListener('resize', fit); fit();
  const tick = () => { const d = new Date(); $$('[data-clock]').forEach(n => { n.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }); $$('[data-date]').forEach(n => { n.textContent = d.toLocaleDateString(); }); };
  tick(); setInterval(tick, 15000);

  /* ---------- try-it checklist (list, callouts or chips depending on layout) ---------- */
  const done = new Set(), total = $$('#tryList [data-t]').length;
  function check(k) {
    if (done.has(k)) return; done.add(k);
    $$('[data-t="' + k + '"]').forEach(n => n.classList.add('done'));
    const c = $('#tryCount'), b = $('#tryBar'); if (c) c.textContent = done.size + '/' + total; if (b) b.style.width = (done.size / total * 100) + '%';
    if (done.size === total) toastx('All done. That is the whole app in a minute.');
  }
  const snack = $('#snack');
  function say(msg) {
    if (!snack) return; snack.textContent = msg;
    if (G) { G.killTweensOf(snack); G.fromTo(snack, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: 'back.out(1.6)' }); G.to(snack, { y: 12, opacity: 0, duration: .3, delay: 2.3 }); }
    else { snack.style.opacity = 1; clearTimeout(say.t); say.t = setTimeout(() => { snack.style.opacity = 0; }, 2500); }
  }
  let tt = 0; function toastx(msg) { const t = $('#toastx'); t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => { t.hidden = true; }, 2800); }

  const H = { el, svgEl, G, reduced, store, tone, haptic, check, say, toast: say, $, $$, app: $('#app'), screen: $('#screen'), desk, win: $('#win'), tools: $('#tools'), extra: $('#menuExtra'), jump: null };

  /* ---------- jump buttons + chapters ---------- */
  $$('[data-jump]').forEach(b => b.addEventListener('click', () => {
    if (document.documentElement.clientWidth <= 1180 && !b.closest('.ch')) stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    if (H.jump) H.jump(b.dataset.jump);
  }));
  H.boot = () => {
    if (window.ScrollTrigger && window.gsap) { gsap.registerPlugin(ScrollTrigger);
      $$('.ch').forEach(ch => ScrollTrigger.create({ trigger: ch, start: 'top 55%', end: 'bottom 45%', onToggle: st => { ch.classList.toggle('on', st.isActive); if (st.isActive && H.jump) H.jump(ch.dataset.ch, true); } }));
      if (!reduced && $('.po-dev')) { const mm = gsap.matchMedia(); mm.add('(min-width: 1181px)', () => { gsap.to('.po-dev', { rotate: 2, y: -40, ease: 'none', scrollTrigger: { trigger: '.po-grid', start: 'top 80%', end: 'bottom top', scrub: 1 } }); }); }
    }
    if (G) {
      G.from(device || $('.desk-wrap'), { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' });
      G.from('#h1', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', delay: .1 });
      G.from('.lede, .try, .kick, .call, .spec, .metrics, .jump, .cta, .dk-chips, .po-steps', { y: 24, opacity: 0, duration: .9, stagger: .05, ease: 'expo.out', delay: .25 });
    }
  };

  H.layout = "stage";
/* ---------- FocusDial ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    let budget = 90, used = 62, style = 'fade', nudged = false, snooze = 0;
    const root = el('div', 'fd'), V = {}; ['dial', 'feed', 'week'].forEach(k => { V[k] = el('section', k === 'feed' ? 'fd-feed' : 'fd-v'); V[k].setAttribute('aria-label', k); if (k !== 'dial') V[k].hidden = true; root.append(V[k]); });
    const nav = el('nav', 'fd-nav'); [['dial', 'Today'], ['feed', 'Scroll'], ['week', 'Week']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(nav); app.append(root); let cur = 'dial';
    function go(k) { if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k))); nav.style.display = k === 'feed' ? 'none' : ''; if (k === 'week') { renderWeek(); check('week'); } if (k === 'dial') paint();
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0 }, { opacity: 1, duration: .3 }); G.to(a, { opacity: 0, duration: .1, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; }
    H.jump = go;
    const fmt = mn => Math.floor(mn / 60) + 'h ' + String(Math.round(mn % 60)).padStart(2, '0') + 'm';

    /* ---- rotary dial: 30..240 min across 300° ---- */
    const v = V.dial, hd = el('div', 'fd-h'); hd.append(el('small', null, 'TODAY'), el('h2', null, 'Your daily budget')); v.append(hd);
    const dial = el('div', 'fd-dial'), S = 270, C = 135, R = 108, A0 = -150, A1 = 150, toA = mn => A0 + (mn - 30) / 210 * (A1 - A0), pt = (a, r) => [C + Math.sin(a * Math.PI / 180) * r, C - Math.cos(a * Math.PI / 180) * r];
    const sv = svgEl('svg', { viewBox: '0 0 ' + S + ' ' + S, 'aria-hidden': 'true' }); for (let mn = 30; mn <= 240; mn += 15) { const a = toA(mn), [x1, y1] = pt(a, R + 18), [x2, y2] = pt(a, R + (mn % 60 === 0 ? 8 : 12)); sv.append(svgEl('line', { x1, y1, x2, y2, class: 'tk' + (mn % 60 === 0 ? ' mj' : '') })); }
    const arcD = (a, b) => { const [x1, y1] = pt(a, R), [x2, y2] = pt(b, R); return 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' A' + R + ' ' + R + ' 0 ' + (b - a > 180 ? 1 : 0) + ' 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1); };
    const bud = svgEl('path', { class: 'bud' }), usedP = svgEl('path', { class: 'used' }), knob = svgEl('circle', { r: 14, class: 'knob' }); sv.append(bud, usedP, knob);
    const face = el('div', 'fd-face'), fw = el('div'), fb = el('b'), fs = el('span'); fw.append(el('small', null, 'USED / BUDGET'), fb, fs); face.append(fw); dial.append(sv, face);
    dial.tabIndex = 0; dial.setAttribute('role', 'slider'); dial.setAttribute('aria-label', 'Daily screen time budget'); dial.setAttribute('aria-valuemin', '30'); dial.setAttribute('aria-valuemax', '240');
    function paint() { const a = toA(budget), [kx, ky] = pt(a, R); bud.setAttribute('d', arcD(A0, a)); knob.setAttribute('cx', kx.toFixed(1)); knob.setAttribute('cy', ky.toFixed(1)); const ua = toA(Math.min(240, Math.max(30, used))); usedP.setAttribute('d', arcD(A0, Math.max(A0 + .5, ua))); usedP.style.stroke = used > budget ? '#B5452A' : '#C2683E';
      fb.textContent = fmt(used); fs.textContent = used > budget ? fmt(used - budget) + ' over, that’s okay' : fmt(budget - used) + ' left of ' + fmt(budget); dial.setAttribute('aria-valuenow', String(budget)); dial.setAttribute('aria-valuetext', fmt(budget) + ' budget, ' + fmt(used) + ' used'); }
    const setB = mn => { const n = Math.max(30, Math.min(240, Math.round(mn / 5) * 5)); if (n !== budget) { budget = n; nudged = false; tone(400 + n, .015, 'square', .02); haptic(3); check('budget'); paint(); } };
    dial.addEventListener('pointerdown', e => { try { dial.setPointerCapture(e.pointerId); } catch (_) {} const mv = ev => { const r = dial.getBoundingClientRect(), dx = ev.clientX - r.left - r.width / 2, dy = ev.clientY - r.top - r.height / 2, a = Math.max(A0, Math.min(A1, Math.atan2(dx, -dy) * 180 / Math.PI)); setB(30 + (a - A0) / (A1 - A0) * 210); }; mv(e); const up = () => { dial.removeEventListener('pointermove', mv); dial.removeEventListener('pointerup', up); }; dial.addEventListener('pointermove', mv); dial.addEventListener('pointerup', up); });
    dial.addEventListener('keydown', e => { const d = { ArrowUp: 5, ArrowRight: 5, ArrowDown: -5, ArrowLeft: -5, PageUp: 30, PageDown: -30 }[e.key]; if (d) { e.preventDefault(); setB(budget + d); } });
    v.append(dial, el('p', 'fd-lbl', 'When I go over'));
    const sty = el('div', 'fd-sty'); [['fade', '🌫', 'Soft fade'], ['breathe', '🫧', 'Breathe'], ['banner', '💬', 'Banner']].forEach(([k, ic, t]) => { const b = el('button'); b.type = 'button'; b.dataset.k = k; b.append(el('span', null, ic), document.createTextNode(t)); b.addEventListener('click', () => { style = k; nudged = false; check('style'); sty.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.k === style))); say(t + ' it is'); }); sty.append(b); }); v.append(sty);
    sty.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.k === style)));

    /* ---- the feed ---- */
    const f = V.feed, fh = el('div', 'fd-fh'), fsp = el('span'), ex = el('button', 'fd-ex', '‹ Done scrolling'); ex.type = 'button'; ex.addEventListener('click', () => { clearNudge(); go('dial'); }); fh.append(document.createTextNode('Friendly'), fsp); f.append(fh, ex);
    const G2 = ['linear-gradient(135deg,#F6D365,#FDA085)', 'linear-gradient(135deg,#A1C4FD,#C2E9FB)', 'linear-gradient(135deg,#D4FC79,#96E6A1)', 'linear-gradient(135deg,#FBC2EB,#A6C1EE)', 'linear-gradient(135deg,#FFECD2,#FCB69F)'], lines = ['Sunday market haul 🍑', 'This view though', 'Can’t stop watching this', 'Weekend plans?', 'Day 3 of the challenge'];
    let posts = 0; const more = () => { for (let i = 0; i < 6; i++) { const p = el('article', 'fd-post'), who = el('div', 'who'), a = el('i'), im = el('div', 'img'); a.style.setProperty('--g', G2[(posts + 2) % 5]); im.style.setProperty('--g', G2[posts % 5]); who.append(a, document.createTextNode(['mia', 'theo', 'ana', 'raj', 'lena'][posts % 5] + '_' + (posts + 3))); p.append(who, im, el('p', null, lines[posts % 5])); f.append(p); posts++; } };
    more(); let lastY = 0;
    f.addEventListener('scroll', () => { const dy = Math.abs(f.scrollTop - lastY); lastY = f.scrollTop; used += dy / 90; check('scroll'); fsp.textContent = fmt(used) + ' today'; if (f.scrollTop + f.clientHeight > f.scrollHeight - 400) more(); if (used > budget + snooze && !nudged) nudge(); }, { passive: true });
    let nb = null;
    function clearNudge() { f.style.filter = ''; if (nb) { nb.remove(); nb = null; } }
    function nudge() { nudged = true; check('nudge'); haptic(15); tone(523, .3, 'sine', .03);
      if (style === 'fade') { f.style.filter = 'grayscale(1) contrast(.85) brightness(1.08)'; setTimeout(() => { if (cur !== 'feed') return; nb = el('div', 'fd-bn'); const b = el('button', null, '5 more min'); b.type = 'button'; nb.append(el('i', null, '◐'), el('span', null, 'Your budget is used. The colour will come back tomorrow.'), b); b.addEventListener('click', () => { snooze += 5; nudged = false; clearNudge(); }); root.append(nb); }, 1400); }
      else if (style === 'breathe') { nb = el('div', 'fd-nb'); nb.setAttribute('role', 'dialog'); nb.setAttribute('aria-label', 'Take a breath'); const w = el('div'), a = el('button', 'a', 'Done for now'), b = el('button', 'b', 'Keep going, 5 min'); a.type = b.type = 'button'; w.append(el('div', 'fd-br'), el('h3', null, 'Take three slow breaths?'), el('p', null, 'You planned ' + fmt(budget) + ' today. No pressure either way.'), a, b); nb.append(w); root.append(nb);
        a.addEventListener('click', () => { clearNudge(); go('dial'); say('Nice. See you later'); }); b.addEventListener('click', () => { snooze += 5; nudged = false; clearNudge(); }); if (G && !reduced) G.from(nb, { opacity: 0, duration: 1.2 }); a.focus(); }
      else { nb = el('div', 'fd-bn'); const b = el('button', null, 'Okay'); b.type = 'button'; nb.append(el('i', null, 'FD'), el('span', null, 'That’s your ' + fmt(budget) + '. Maybe a stretch?'), b); b.addEventListener('click', () => { snooze += 5; nudged = false; clearNudge(); }); root.append(nb); if (G && !reduced) G.from(nb, { y: -60, opacity: 0, duration: .5, ease: 'back.out(1.6)' }); } }

    /* ---- week ---- */
    function renderWeek() { const w = V.week; w.textContent = ''; const h = el('div', 'fd-h'); h.append(el('small', null, 'THIS WEEK'), el('h2', null, 'Gently, it’s working')); w.append(h);
      const data = [128, 104, 96, 112, 88, 141, Math.round(used)], wk = el('div', 'fd-wk'), mx = Math.max(...data, budget); ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => { const c = el('div'), bar = el('i', data[i] <= budget ? 'ok' : ''); bar.style.height = (data[i] / mx * 100) + '%'; bar.title = fmt(data[i]); c.append(bar, el('span', null, d)); wk.append(c); });
      const under = data.filter(x => x <= budget).length; w.append(wk, el('div', 'fd-ref', under + ' of 7 days inside your budget. You picked up your phone 41 times on Tuesday, 9 fewer than last week. Small steps count.')); }
    nav.querySelector('[data-v="dial"]').setAttribute('aria-selected', 'true'); paint();
  }
  demo(H.app, H);
  H.boot();
})();
