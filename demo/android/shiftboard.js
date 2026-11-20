/* ShiftBoard — Android app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "triptych";
/* ---------- ShiftBoard ---------- */
  function demo(app, H) {
    const { el, G, reduced, store, tone, haptic, check, say } = H;
    const M = {"key":"sb_state_v1","rate":15.8,"contract":37.5,"types":{"off":["Off","",0,0,"#E3E8EF"],"early":["Early","06:00–14:00",6,8,"#FFB547"],"late":["Late","14:00–22:00",14,8,"#0F62FE"],"night":["Night","22:00–06:00",22,8,"#3B2C7A"],"long":["Long day","07:00–19:30",7,12.5,"#14A44D"]},"week":["early","off","late","late","night","off","off"]}, T = M.types, DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const week = M.week.slice(); let swapState = 'open';
    const mon = (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; })(), todayI = (new Date().getDay() + 6) % 7;
    const money = v => '£' + v.toFixed(2);
    /* ---- pay engine ---- */
    function calc() { let hrs = 0, nightH = 0, sunH = 0, ot = 0; const lines = [];
      week.forEach((k, i) => { const [, , st, len] = T[k]; if (!len) return; hrs += len; if (k === 'night') nightH += len; if (i === 6) sunH += len; });
      ot = Math.max(0, hrs - M.contract); const base = Math.min(hrs, M.contract) * M.rate, otPay = ot * M.rate * 1.5, nightP = nightH * M.rate * .2, sunP = sunH * M.rate * 1.0;
      lines.push(['Basic', Math.min(hrs, M.contract).toFixed(1) + ' h × ' + money(M.rate), base]); if (ot) lines.push(['Overtime', ot.toFixed(1) + ' h × 1.5', otPay]); if (nightH) lines.push(['Night premium', nightH + ' h × 20%', nightP]); if (sunH) lines.push(['Sunday double time', sunH + ' h × 1.0 extra', sunP]);
      return { hrs, ot, total: base + otPay + nightP + sunP, lines }; }
    function rests() { const out = []; for (let i = 0; i < 6; i++) { const a = T[week[i]], b = T[week[i + 1]]; if (!a[3] || !b[3]) continue; const end = a[2] + a[3], gap = 24 + b[2] - end; if (gap < 11) out.push([i + 1, gap]); } return out; }

    const root = el('div', 'sb'), V = {}; ['week', 'pay', 'swaps'].forEach(k => { V[k] = el('section', 'sb-v'); V[k].setAttribute('aria-label', k); if (k !== 'week') V[k].hidden = true; root.append(V[k]); });
    const nav = el('nav', 'sb-nav'), dot = el('b'); [['week', 'Week'], ['pay', 'Pay'], ['swaps', 'Swaps']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); if (k === 'swaps') b.append(dot); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(nav); app.append(root); let cur = 'week';
    function go(k) { closeSheet(); if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k))); render(); if (k === 'pay') check('pay');
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .3, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .1, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; haptic(5); }
    H.jump = go;
    const head = (v, small, title) => { const h = el('div', 'sb-h'), d = el('div'); d.append(el('small', null, small), el('h2', null, title)); h.append(d); v.append(h); };

    function render() {
      const c = calc(), rs = rests();
      /* week */
      const v = V.week; v.textContent = ''; head(v, 'Week of ' + mon.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), 'My rota');
      const sum = el('div', 'sb-sum'), hr = el('div', 'sb-hrs'), bar = el('div', 'bar'), bi = el('i'), be = el('em'), mark = el('s'); const scale = 50;
      bi.style.width = Math.min(c.hrs, M.contract) / scale * 100 + '%'; be.style.left = M.contract / scale * 100 + '%'; be.style.width = c.ot / scale * 100 + '%'; mark.style.left = M.contract / scale * 100 + '%'; bar.append(bi, be, mark);
      hr.append(el('b', null, c.hrs.toFixed(1) + ' h'), el('small', null, 'of ' + M.contract + ' h contract'), bar);
      const py = el('div', 'sb-pay'); py.append(el('small', null, 'This week, before tax'), el('b', null, money(c.total)), el('em', null, c.ot ? '+' + c.ot.toFixed(1) + ' h overtime at ×1.5' : '')); sum.append(hr, py); v.append(sum);
      week.forEach((k, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); const [nm, tm, , len, col] = T[k], warn = rs.find(r => r[0] === i);
        const b = el('button', 'sb-day' + (i === todayI ? ' today' : '')), dn = el('span', 'dn'), sh = el('span', 'sb-sh' + (k === 'off' ? ' off' : '') + (warn ? ' warn' : '')); b.type = 'button';
        dn.append(document.createTextNode(DAYS[i]), el('small', null, String(d.getDate()))); sh.style.setProperty('--c', col); if (k === 'early') sh.style.setProperty('--ink', '#3B2400');
        const tx = el('span'); tx.append(el('b', null, nm), document.createElement('br'), el('small', null, tm || 'Day off')); sh.append(tx); if (len) sh.append(el('span', 'h', len + ' h'));
        b.setAttribute('aria-label', DAYS[i] + ': ' + nm + (tm ? ', ' + tm : '') + (warn ? ', warning: only ' + warn[1] + ' hours rest before' : '')); b.append(dn, sh); b.addEventListener('click', () => pick(i)); v.append(b);
        if (warn) { const w = el('div', 'sb-w'); w.append(el('b', null, '⚠'), document.createTextNode('Only ' + warn[1] + ' h rest before this shift. The minimum is 11 h.')); v.append(w); } });
      /* pay */
      const pv = V.pay; pv.textContent = ''; head(pv, 'Week estimate · ' + money(M.rate) + '/h', 'Pay breakdown');
      const tb = el('table', 'sb-tbl'); c.lines.forEach(([a, b2, x]) => { const tr = el('tr'), td1 = el('td'); td1.append(document.createTextNode(a), el('small', null, b2)); tr.append(td1, el('td', null, money(x))); tb.append(tr); });
      const tt = el('tr', 'tot'); tt.append(el('td', null, 'Total'), el('td', null, money(c.total))); tb.append(tt); pv.append(tb);
      /* swaps */
      const sv = V.swaps; sv.textContent = ''; head(sv, 'From your team', 'Swap requests'); dot.hidden = swapState !== 'open';
      const card = el('div', 'sb-sw'), p = el('p'); p.append(el('b', null, 'Priya'), document.createTextNode(' wants to swap her Thursday Early for your Saturday Night.'));
      const row = el('div', 'sb-swr'), a1 = el('div'), a2 = el('div'); a1.style.setProperty('--c', T.night[4]); a2.style.setProperty('--c', T.early[4]); a1.append(el('b', null, 'You give'), document.createTextNode('Sat Night')); a2.append(el('b', null, 'You get'), document.createTextNode('Thu Early')); a2.style.color = '#3B2400'; row.append(a1, el('span', null, '⇄'), a2);
      card.append(p, row);
      if (swapState === 'open') { const acts = el('div', 'sb-acts'), no = el('button', null, 'Decline'), ok = el('button', 'ok', 'Accept'); no.type = ok.type = 'button'; acts.append(no, ok); card.append(acts);
        no.addEventListener('click', () => { swapState = 'declined'; render(); say('Swap declined'); }); ok.addEventListener('click', () => { swapState = 'accepted'; week[3] = 'early'; week[5] = 'off'; check('swap'); tone(760, .08); say('Swap accepted · rota updated'); render(); }); }
      else card.append(el('p', 'sb-done', swapState === 'accepted' ? '✓ Accepted. Thursday is now Early and Saturday is off.' : 'Declined. Priya has been told.'));
      sv.append(card);
    }

    /* ---- shift picker sheet ---- */
    let sheet = null;
    function closeSheet() { if (!sheet) return; const [sc, sh] = sheet; sheet = null; sh.style.pointerEvents = 'none'; sc.remove(); if (G) G.to(sh, { y: '100%', duration: .25, onComplete: () => sh.remove() }); else sh.remove(); }
    function pick(i) { closeSheet(); const sc = el('div', 'sb-scrim'), sh = el('div', 'sb-sheet'), opts = el('div', 'sb-opts'); sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-label', 'Choose a shift for ' + DAYS[i]); sh.append(el('h3', null, DAYS[i] + ' shift'));
      Object.entries(T).forEach(([k, [nm, tm, , len, col]]) => { const b = el('button'), ic = el('i'); b.type = 'button'; ic.style.setProperty('--c', col); b.setAttribute('aria-pressed', String(week[i] === k)); b.append(ic, document.createTextNode(nm), el('small', null, tm ? tm + ' · ' + len + ' h' : 'rest'));
        b.addEventListener('click', () => { const before = calc(), was = week[i]; week[i] = k; const after = calc(); if (was === 'off' && k !== 'off') check('add'); if (after.ot > 0 && before.ot === 0) { check('ot'); say('Into overtime: +' + after.ot.toFixed(1) + ' h at time and a half'); } if (rests().length) check('rest');
          tone(k === 'off' ? 440 : 620, .05); closeSheet(); render(); }); opts.append(b); });
      sh.append(opts); sc.addEventListener('click', closeSheet); root.append(sc, sh); sheet = [sc, sh]; if (G) G.from(sh, { y: '100%', duration: .4, ease: 'expo.out' }); }

    nav.querySelector('[data-v="week"]').setAttribute('aria-selected', 'true'); render();
  }
  demo(H.app, H);
  H.boot();
})();
