/* HandoffNotes — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "desk";
/* ---------- HandoffNotes ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say, desk, win } = H;
    const NOTES = [{ t: 'Groceries', body: 'oat milk\neggs\nsourdough\nbasil' }, { t: 'Trip ideas', body: 'Lisbon in May?\ncheck train from Porto\nbook the tile workshop' }, { t: 'Gift list', body: 'Mum: fountain pen\nSam: climbing chalk bag' }];
    let ci = 0, online = true, base = null, macDirty = false, phoneDirty = false, lastFrom = null, syncAt = Date.now();
    const ttl = win.querySelector('.ttl'); if (ttl) ttl.textContent = 'HandoffNotes';
    /* ---- Mac window ---- */
    const root = el('div', 'hn'), sd = el('nav', 'hn-sd'), ed = el('section', 'hn-ed'), eh = el('div', 'hn-eh'), et = el('b'), st = el('span', 'hn-st'), sti = el('i'), stt = el('span'), ta = el('textarea', 'hn-ta'); st.append(sti, stt); eh.append(et, st); ta.setAttribute('aria-label', 'Note on Mac'); ta.spellcheck = false; ta.maxLength = 2000;
    ed.append(eh, ta); root.append(sd, ed); app.append(root);
    /* ---- iPhone ---- */
    const ph = el('div', 'hn-ph'), sc = el('div', 'hn-sc'), sb = el('div', 'hn-sb'), clk = el('span', null, '9:41'), ap = el('span', 'ap', ''), pn = el('div', 'hn-pn'), pnt = el('b'), pt = el('textarea', 'hn-pt'), cc = el('div', 'hn-cc'), air = el('button'), nx = el('button');
    sb.append(clk, ap); pn.append(el('small', null, 'iPhone · HandoffNotes'), pnt); pt.setAttribute('aria-label', 'Note on iPhone'); pt.spellcheck = false; pt.maxLength = 2000; air.type = nx.type = 'button'; air.append('✈', ' Airplane'); nx.append('↻', ' Next note'); air.setAttribute('aria-pressed', 'false'); cc.append(air, nx); sc.append(el('i', 'hn-isl'), sb, pn, pt, cc); ph.append(sc); ph.setAttribute('role', 'group'); ph.setAttribute('aria-label', 'iPhone'); desk.append(ph);
    const ln = svgEl('svg', { class: 'hn-ln', viewBox: '0 0 1200 720', 'aria-hidden': 'true' }), lp = svgEl('path', { d: 'M740 300 C790 240 820 240 840 300' }); ln.append(lp); desk.append(ln);
    const ho = el('button', 'hn-ho'); ho.type = 'button'; ho.hidden = true; ho.setAttribute('aria-label', 'Handoff from iPhone: continue the note on this Mac'); ho.append('📝', el('small', null, 'iPhone')); desk.append(ho);
    setInterval(() => { const d = new Date(); clk.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); paintStatus(); }, 1000);
    /* ---- sync ---- */
    function packet(fromMac) { if (reduced || !G) return; const p = el('i', 'hn-pk'); desk.append(p); const L = lp.getTotalLength(), o = { t: 0 }; G.to(o, { t: 1, duration: .45, ease: 'power1.inOut', onUpdate: () => { const q = lp.getPointAtLength((fromMac ? o.t : 1 - o.t) * L); p.style.left = q.x + 'px'; p.style.top = q.y + 'px'; } }); setTimeout(() => p.remove(), 480); }
    let tm = 0, tp = 0;
    ta.addEventListener('input', () => { NOTES[ci].body = ta.value; macDirty = true; lastFrom = 'mac'; check('type'); paintSide(); if (!online) { paintStatus(); return; } clearTimeout(tm); tm = setTimeout(() => { packet(true); setTimeout(() => { pt.value = ta.value; syncAt = Date.now(); macDirty = false; paintStatus(); }, 450); }, 250); busy(); });
    pt.addEventListener('input', () => { if (online) NOTES[ci].body = pt.value; else phoneBody = pt.value; phoneDirty = true; lastFrom = 'phone'; check('phone'); ho.hidden = false; if (G && !reduced) G.fromTo(ho, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'back.out(2)' });
      if (!online) { paintStatus(); return; } clearTimeout(tp); tp = setTimeout(() => { packet(false); setTimeout(() => { ta.value = pt.value; syncAt = Date.now(); phoneDirty = false; paintSide(); paintStatus(); }, 450); }, 250); busy(); });
    let phoneBody = null;
    function busy() { st.className = 'hn-st busy'; stt.textContent = 'Syncing…'; }
    function paintStatus() { if (!online) { st.className = 'hn-st off'; stt.textContent = 'iPhone offline · ' + ((macDirty ? 1 : 0) + (phoneDirty ? 1 : 0)) + ' side(s) changed'; return; } if (st.className.includes('busy') && (Date.now() - syncAt) > 900 && !macDirty && !phoneDirty) st.className = 'hn-st'; if (!st.className.includes('busy')) { const a = Math.round((Date.now() - syncAt) / 1000); stt.textContent = 'Synced ' + (a < 2 ? 'just now' : a + ' s ago') + ' · encrypted'; } if (!macDirty && !phoneDirty) st.className = 'hn-st'; }
    /* ---- airplane + merge ---- */
    air.addEventListener('click', () => { if (online) { online = false; base = NOTES[ci].body; phoneBody = pt.value; air.setAttribute('aria-pressed', 'true'); ap.textContent = '✈'; ln.classList.add('off'); check('offline'); tone(300, .05); say('iPhone offline. Edit both, then reconnect'); paintStatus(); } else reconnect(); });
    function merge3(b, m, p) { const B = b.split('\n'), M = m.split('\n'), P = p.split('\n'), out = M.map(x => ({ t: x, k: B.includes(x) ? '' : 'm' })), removedP = B.filter(x => !P.includes(x) && M.includes(x));
      removedP.forEach(x => { const o = out.find(r => r.t === x && r.k === ''); if (o) o.k = 'x'; });
      P.forEach((x, i) => { if (B.includes(x) || M.includes(x)) return; let pos = out.length; for (let j = i - 1; j >= 0; j--) { const k = out.findIndex(r => r.t === P[j]); if (k >= 0) { pos = k + 1; while (pos < out.length && out[pos].k === 'p') pos++; break; } } out.splice(pos, 0, { t: x, k: 'p' }); }); return out; }
    let mg = null;
    function reconnect() { online = true; air.setAttribute('aria-pressed', 'false'); ap.textContent = ''; ln.classList.remove('off'); const pb = phoneBody != null ? phoneBody : pt.value, mb = NOTES[ci].body;
      if (pb === mb || base == null) { pt.value = mb; say('Back online · nothing to merge'); paintStatus(); return; } const res = merge3(base, mb, pb); packet(false); setTimeout(() => packet(true), 250);
      if (mg) mg.remove(); mg = el('div', 'hn-mg'); const hd = el('header'); hd.append(el('span', null, 'Merged ' + res.filter(r => r.k).length + ' changes'), el('span', null, '3-way · line level')); mg.append(hd); res.forEach(r => mg.append(el('p', r.k || null, r.t || ' ')));
      const lg = el('div', 'lg'); [['#FFF3CF', 'from Mac'], ['#DDEBFF', 'from iPhone'], ['#FDE2E2', 'deleted on iPhone']].forEach(([c, l]) => { const s2 = el('span'), i = el('i'); i.style.background = c; s2.append(i, document.createTextNode(l)); lg.append(s2); }); const ok = el('button', null, 'Keep merged note'); ok.type = 'button'; ok.addEventListener('click', () => { mg.remove(); mg = null; }); mg.append(lg, ok); ed.append(mg);
      const final = res.filter(r => r.k !== 'x').map(r => r.t).join('\n'); NOTES[ci].body = final; ta.value = final; pt.value = final; base = null; phoneBody = null; macDirty = phoneDirty = false; syncAt = Date.now(); check('merge'); tone(660, .05); setTimeout(() => tone(990, .07), 100); haptic(12); say('Merged both edits · nothing lost'); paintSide(); paintStatus(); if (G && !reduced) G.from(mg, { y: 20, opacity: 0, duration: .35, ease: 'expo.out' }); }
    /* ---- notes list + handoff ---- */
    function paintSide() { sd.textContent = ''; sd.append(el('small', null, 'Quick notes')); NOTES.forEach((n, i) => { const b = el('button'); b.type = 'button'; b.setAttribute('aria-current', String(i === ci)); b.append(el('b', null, n.t), el('span', null, n.body.split('\n').filter(Boolean).join(' · '))); b.addEventListener('click', () => select(i)); sd.append(b); }); }
    function select(i) { if (!online && i !== ci) { say('Reconnect the iPhone first'); return; } ci = i; et.textContent = NOTES[i].t; pnt.textContent = NOTES[i].t; ta.value = NOTES[i].body; if (online) { pt.value = NOTES[i].body; packet(true); } if (mg) { mg.remove(); mg = null; } paintSide(); tone(560, .02); }
    nx.addEventListener('click', () => select((ci + 1) % NOTES.length));
    ho.addEventListener('click', () => { check('handoff'); ho.hidden = true; ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); tone(880, .04); say('Continued on Mac · cursor where you left off'); if (G && !reduced) G.fromTo(win, { scale: .98 }, { scale: 1, duration: .35, ease: 'back.out(2)' }); });
    H.jump = (k, fs) => { if (fs) return; if (k === 'type') { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); say('Type here, watch the iPhone'); } else if (k === 'offline') { if (online) air.click(); else say('Edit both, then tap Airplane again to reconnect'); } else if (k === 'handoff') { if (ho.hidden) { pt.value = pt.value + '\nfrom my phone'; pt.dispatchEvent(new Event('input')); } } };
    select(0); paintStatus();
  }
  demo(H.app, H);
  H.boot();
})();
