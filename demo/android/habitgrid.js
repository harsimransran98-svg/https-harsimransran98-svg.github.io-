/* HabitGrid — Android app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- HabitGrid ---------- */
  function demo(app, H) {
    const { el, G, reduced, store, tone, haptic, check, say } = H;
    const M = {"key":"hg_state_v1","habits":[["Read 20 pages","📚",0.78],["Morning run","🏃",0.55],["Meditate","🧘",0.68],["No sugar","🍬",0.42]],"scale":["#1C231D","#3B3415","#6E5A0E","#A77E0A","#E8B400"]};
    const now = new Date(), y0 = new Date(now.getFullYear(), 0, 1), dayIdx = Math.floor((now - y0) / 864e5), DAYS = 365, off = y0.getDay();
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const data = M.habits.map(([n, ic, rate]) => { const a = new Array(DAYS).fill(0); let run = 0; for (let i = 0; i < dayIdx; i++) { const p = run > 3 ? rate + .15 : rate; a[i] = rnd() < p ? 1 + Math.floor(rnd() * 4) : 0; run = a[i] ? run + 1 : 0; } return a; });
    let H0 = 0; const lvl = v => M.scale[Math.min(4, v)];
    const streak = a => { let s0 = 0, i = a[dayIdx] ? dayIdx : dayIdx - 1; while (i >= 0 && a[i]) { s0++; i--; } return s0; };
    const longest = a => { let b = 0, c = 0; a.slice(0, dayIdx + 1).forEach(v => { c = v ? c + 1 : 0; b = Math.max(b, c); }); return b; };
    const dateOf = i => new Date(y0.getTime() + i * 864e5);

    const root = el('div', 'hg'), V = {}; ['today', 'year', 'stats'].forEach(k => { V[k] = el('section', 'hg-v'); V[k].setAttribute('aria-label', k); if (k !== 'today') V[k].hidden = true; root.append(V[k]); });
    const nav = el('nav', 'hg-nav'); [['today', 'Today'], ['year', 'Year'], ['stats', 'Stats']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(nav); app.append(root); let cur = 'today';
    function go(k) { if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k)));
      render(); if (k === 'stats') check('stats');
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .35, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .12, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; haptic(5); }
    H.jump = go;
    const head = (v, small, title, right) => { const h = el('div', 'hg-h'), d = el('div'); d.append(el('small', null, small), el('h2', null, title)); h.append(d); if (right) h.append(right); v.append(h); };
    const streakEl = () => { const s0 = streak(data[H0]), e = el('div', 'hg-streak' + (s0 >= 3 ? ' hot' : '')); e.append(el('span', null, '🔥'), document.createTextNode(String(s0))); e.setAttribute('aria-label', s0 + ' day streak'); return e; };

    function render() {
      /* today */
      const t = V.today; t.textContent = ''; head(t, now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }), M.habits[H0][0], streakEl());
      const on = !!data[H0][dayIdx], big = el('button', 'hg-big' + (on ? ' on' : '')), wrap = el('div'), rp = el('span', 'rp'); big.type = 'button'; big.setAttribute('aria-pressed', String(on)); big.setAttribute('aria-label', on ? 'Checked in today. Tap to undo.' : 'Check in today');
      wrap.append(el('i', null, M.habits[H0][1]), el('b', null, on ? 'Done for today' : 'Tap to check in'), el('small', null, on ? 'See you tomorrow' : 'Day ' + (dayIdx + 1) + ' of ' + DAYS)); big.append(wrap, rp);
      big.addEventListener('click', () => { const was = data[H0][dayIdx]; data[H0][dayIdx] = was ? 0 : 3; if (!was) { check('checkin'); tone(660, .07); setTimeout(() => tone(990, .1), 100); haptic(20); say('Checked in · ' + streak(data[H0]) + ' day streak'); } render();
        if (!was && G && !reduced) { const r = V.today.querySelector('.rp'); G.fromTo(r, { scale: 1, opacity: 1 }, { scale: 14, opacity: 0, duration: .9, ease: 'expo.out' }); } });
      t.append(big);
      const list = el('div', 'hg-list'); M.habits.forEach(([n, ic], i) => { const b = el('button', 'hg-hb'), mid = el('div'), row = el('div', 'hg-row'); b.type = 'button'; b.setAttribute('aria-pressed', String(i === H0)); b.setAttribute('aria-label', n + ', ' + streak(data[i]) + ' day streak');
        for (let j = dayIdx - 13; j <= dayIdx; j++) { const c = el('i'); c.style.setProperty('--c', lvl(data[i][j] || 0)); row.append(c); } mid.append(el('b', null, n), row); b.append(el('span', null, ic), mid, el('em', null, streak(data[i]) + 'd'));
        b.addEventListener('click', () => { H0 = i; check('habit'); tone(520 + i * 60, .05); render(); }); list.append(b); }); t.append(list);
      /* year */
      const yv = V.year; yv.textContent = ''; head(yv, now.getFullYear() + ' · ' + data[H0].slice(0, dayIdx + 1).filter(Boolean).length + ' of ' + (dayIdx + 1) + ' days', 'Year grid');
      const sel = el('div', 'hg-sel'); M.habits.forEach(([n, ic], i) => { const b = el('button', null, ic + ' ' + n.split(' ')[0]); b.type = 'button'; b.setAttribute('aria-pressed', String(i === H0)); b.addEventListener('click', () => { H0 = i; check('habit'); render(); }); sel.append(b); }); yv.append(sel);
      const yr = el('div', 'hg-yr'), mon = el('div', 'hg-mon'), grid = el('div', 'hg-grid'), tip = el('div', 'hg-tip', 'Tap a square to fill in or clear a day.');
      for (let k = 0; k < off; k++) { const c = el('span', 'hg-c fut'); c.setAttribute('aria-hidden', 'true'); grid.append(c); }
      const weeks = Math.ceil((DAYS + off) / 7); for (let w = 0; w < weeks; w++) { const d = dateOf(w * 7 - off); mon.append(el('span', null, d.getDate() <= 7 && w * 7 - off >= 0 ? d.toLocaleDateString(undefined, { month: 'short' }) : '')); }
      data[H0].forEach((v, i) => { const c = el('button', 'hg-c' + (i > dayIdx ? ' fut' : '') + (i === dayIdx ? ' today' : '')); c.type = 'button'; c.style.setProperty('--c', i > dayIdx ? 'transparent' : lvl(v));
        const dl = dateOf(i).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); c.setAttribute('aria-label', dl + (v ? ', done' : ', missed')); if (i > dayIdx) c.tabIndex = -1;
        c.addEventListener('mouseenter', () => { tip.textContent = dl + ' · ' + (data[H0][i] ? 'done' : 'missed'); });
        c.addEventListener('click', () => { data[H0][i] = data[H0][i] ? 0 : 2; c.style.setProperty('--c', lvl(data[H0][i])); c.setAttribute('aria-label', dl + (data[H0][i] ? ', done' : ', missed')); tip.textContent = dl + ' · ' + (data[H0][i] ? 'filled in' : 'cleared'); check('cell'); tone(data[H0][i] ? 780 : 420, .04); if (G && !reduced) G.fromTo(c, { scale: 1.8 }, { scale: 1, duration: .4, ease: 'back.out(3)' }); });
        grid.append(c); });
      yr.append(mon, grid); yr.addEventListener('scroll', () => check('year'), { passive: true }); const leg = el('div', 'hg-leg'); leg.append(document.createTextNode('less')); M.scale.forEach(c => { const i = el('i'); i.style.setProperty('--c', c); leg.append(i); }); leg.append(document.createTextNode('more'));
      yv.append(yr, tip, leg); requestAnimationFrame(() => { yr.scrollLeft = Math.max(0, (dayIdx + off) / 7 * 17 - yr.clientWidth * .7); });
      /* stats */
      const sv = V.stats; sv.textContent = ''; head(sv, M.habits[H0][0], 'Stats'); const a = data[H0], done = a.slice(0, dayIdx + 1).filter(Boolean).length;
      const st = el('div', 'hg-st'); [[longest(a) + 'd', 'longest streak'], [streak(a) + 'd', 'current streak'], [Math.round(done / (dayIdx + 1) * 100) + '%', 'of days this year'], [done + '', 'days done']].forEach(([b, t0]) => { const d = el('div'); d.append(el('b', null, b), el('span', null, t0)); st.append(d); });
      const wd = el('div', 'hg-wd'), cnt = [0, 0, 0, 0, 0, 0, 0]; a.slice(0, dayIdx + 1).forEach((v, i) => { if (v) cnt[dateOf(i).getDay()]++; }); const mx = Math.max(...cnt);
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach((l, i) => { const d = el('div'), bar = el('i', cnt[i] === mx ? 'hgtop' : ''); bar.style.height = (cnt[i] / mx * 80) + '%'; d.append(bar, el('span', null, l)); wd.append(d); });
      sv.append(st, wd, el('p', 'hg-tip', 'Best day: ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][cnt.indexOf(mx)] + '.'));
    }
    nav.querySelector('[data-v="today"]').setAttribute('aria-selected', 'true'); render();
  }
  demo(H.app, H);
  H.boot();
})();
