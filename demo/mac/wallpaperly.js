/* Wallpaperly — macOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
  /* nav: full-screen burger menu (only on pages that use it) */
  { const nb = $('[data-burger]'), nm = nb && document.getElementById(nb.getAttribute('aria-controls')); if (nb && nm) { const lock = nb.dataset.burger !== 'card';
    const set = o => { nm.hidden = !o; nb.setAttribute('aria-expanded', String(o)); nb.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); if (lock) document.body.style.overflow = o ? 'hidden' : '';
      if (o && G && !reduced) { const pan = nm.querySelector('[data-panel]'); if (pan) G.from(pan, Object.assign({ duration: .55, ease: 'expo.out' }, nb.dataset.burger === 'sheet' ? { yPercent: 100 } : nb.dataset.burger === 'drawer' ? { xPercent: 100 } : { y: -12, opacity: 0, scale: .96, transformOrigin: '100% 0' })); G.from(nm.querySelectorAll('li'), { y: 24, opacity: 0, stagger: .05, duration: .5, ease: 'expo.out', delay: .1 }); }
      if (o) { const f = nm.querySelector('a'); if (f) f.focus(); } };
    nb.addEventListener('click', e => { e.stopPropagation(); set(nm.hidden); }); nm.addEventListener('click', e => { if (e.target.closest('a') || e.target === nm) set(false); });
    document.addEventListener('click', e => { if (!nm.hidden && !nm.contains(e.target) && !nb.contains(e.target)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !nm.hidden) { set(false); nb.focus(); } }); } }
  H.boot = () => {
    if (window.ScrollTrigger && window.gsap) { gsap.registerPlugin(ScrollTrigger);
      $$('.ch').forEach(ch => ScrollTrigger.create({ trigger: ch, start: 'top 55%', end: 'bottom 45%', onToggle: st => { ch.classList.toggle('on', st.isActive); if (st.isActive && H.jump) H.jump(ch.dataset.ch, true); } }));
      if (!reduced && $('.dc-tilt')) { const mt = gsap.matchMedia(); mt.add('(min-width: 900px)', () => { gsap.fromTo('.dc-tilt', { rotateX: 22, scale: .93 }, { rotateX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.dc-stage', start: 'top 96%', end: 'top 30%', scrub: 1 } }); }); }
      if (!reduced && $('.po-dev')) { const mm = gsap.matchMedia(); mm.add('(min-width: 1181px)', () => { gsap.to('.po-dev', { rotate: 2, y: -40, ease: 'none', scrollTrigger: { trigger: '.po-grid', start: 'top 80%', end: 'bottom top', scrub: 1 } }); }); }
    }
    if (G) {
      G.from(device || $('.desk-wrap'), { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' });
      G.from('#h1', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', delay: .1 });
      G.from('.lede, .try, .kick, .call, .spec, .metrics, .jump, .cta, .dk-chips, .po-steps, .ds-list, .dc-steps, .db-cards, .df-meta', { y: 24, opacity: 0, duration: .9, stagger: .05, ease: 'expo.out', delay: .25 });
    }
  };

  H.layout = "deskFrame";
/* ---------- Wallpaperly ---------- */
  function demo(app, H) {
    const { el, G, reduced, tone, haptic, check, say, desk, extra, win } = H;
    const PX = (id, w) => 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id + '.jpeg?auto=compress&cs=tinysrgb&w=' + w;
    const FOLDERS = [['mountains', 'Mountains', [1054218, 1287145, 417074, 2662116, 2896668]], ['golden', 'Golden hour', [1323550, 2559941, 3244513, 2387873]], ['night', 'Night skies', [3408744, 572897, 1906658]], ['aerial', 'From above', [1438761]]]
      .map(([id, n, ph]) => ({ id, n, ph, on: id === 'mountains' || id === 'golden' }));
    const TOD = [[5, 1323550, 'Dawn'], [8, 2662116, 'Day'], [17, 3244513, 'Dusk'], [20, 3408744, 'Night']];
    const RH = { m15: ['15 min', 15], hour: ['Hourly', 60], day: ['Daily', 1440], tod: ['Time of day', 0] };
    const S = { rhythm: 'm15', fit: 'fill', paused: false, cur: 1054218, left: 15, hour: 10.5, idx: 0 };
    const pool = () => FOLDERS.filter(f => f.on).flatMap(f => f.ph);
    const todPick = h => { let p = TOD[TOD.length - 1]; TOD.forEach(t => { if (h >= t[0]) p = t; }); if (h < TOD[0][0]) p = TOD[TOD.length - 1]; return p; };
    const fmtH = h => { const hh = Math.floor(h) % 24, mm = Math.round((h % 1) * 60) % 60; return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };
    /* ---- the real desktop wallpaper ---- */
    const bg = el('div', 'wpl-bg fill'); desk.prepend(bg); let layer = null;
    function setWall(id, quiet) { if (id === S.cur && layer) return; S.cur = id; const d = el('div'), b = el('img', 'blur'), t = el('img', 'fg'); b.alt = ''; t.alt = 'Desktop wallpaper'; b.src = PX(id, 900); t.src = PX(id, 1800); d.append(b, t); d.style.opacity = '0'; bg.append(d);
      const old = layer; layer = d; requestAnimationFrame(() => requestAnimationFrame(() => { d.style.opacity = '1'; })); if (old) setTimeout(() => old.remove(), 950); if (!quiet) tone(700, .03); paintGal(); paintDD(); }
    /* ---- app window ---- */
    const ttl = win.querySelector('.ttl'); if (ttl) ttl.textContent = 'Wallpaperly';
    const root = el('div', 'wpl'), sd = el('nav', 'wpl-sd'), mn = el('div', 'wpl-mn'); sd.setAttribute('aria-label', 'Folders'); root.append(sd, mn); app.append(root);
    sd.append(el('small', null, 'Folders'));
    FOLDERS.forEach(f => { const b = el('button', 'wpl-fd'), i = el('i'), t = el('div'), em = el('em', null, '✓'); b.type = 'button'; i.style.backgroundImage = 'url("' + PX(f.ph[0], 120) + '")'; t.append(el('b', null, f.n), el('span', null, f.ph.length + (f.ph.length === 1 ? ' photo' : ' photos'))); b.append(i, t, em); b.dataset.f = f.id;
      b.addEventListener('click', () => { if (f.on && FOLDERS.filter(x => x.on).length === 1) { say('Keep at least one folder on'); return; } f.on = !f.on; if (f.on && f.id === 'night') check('folder'); tone(f.on ? 760 : 420, .03); paintSd(); paintGal(); if (!f.on && f.ph.includes(S.cur) && S.rhythm !== 'tod') next(true); }); sd.append(b); });
    const add = el('button', 'wpl-add', '+ Add a folder…'); add.type = 'button'; add.addEventListener('click', () => say('In the app this opens Finder; folders stay on your Mac')); sd.append(add);
    const tb = el('div', 'wpl-tb'), seg = el('div', 'wpl-seg'), fitSeg = el('div', 'wpl-seg'), nx = el('button', 'wpl-nx', 'Next ↻'); nx.type = 'button'; seg.setAttribute('aria-label', 'Rhythm'); fitSeg.setAttribute('aria-label', 'Fit');
    Object.entries(RH).forEach(([k, [l]]) => { const b = el('button', null, l); b.type = 'button'; b.dataset.r = k; b.addEventListener('click', () => setRhythm(k)); seg.append(b); });
    [['fill', 'Fill'], ['fit', 'Fit'], ['blur', 'Blur fill']].forEach(([k, l]) => { const b = el('button', null, l); b.type = 'button'; b.dataset.f = k; b.addEventListener('click', () => { S.fit = k; bg.className = 'wpl-bg ' + k; if (k === 'blur') check('fit'); tone(600, .02); paintTb(); }); fitSeg.append(b); });
    nx.addEventListener('click', () => next()); tb.append(seg, fitSeg, nx);
    const clock = el('label', 'wpl-clock'), cl = el('input'), cb = el('b'); cl.type = 'range'; cl.min = 0; cl.max = 23.75; cl.step = .25; cl.value = S.hour; cl.setAttribute('aria-label', 'Time of day');
    cl.addEventListener('input', () => { S.hour = +cl.value; if (S.rhythm !== 'tod') setRhythm('tod'); applyTod(); if (todPick(S.hour)[2] === 'Night') check('time'); }); clock.append(el('span', null, '☀ Time'), cl, cb);
    const gal = el('div', 'wpl-gal'); gal.setAttribute('role', 'list'); const st = el('div', 'wpl-st'); mn.append(tb, clock, gal, st);
    function paintSd() { sd.querySelectorAll('.wpl-fd').forEach(b => b.setAttribute('aria-pressed', String(FOLDERS.find(f => f.id === b.dataset.f).on))); }
    function paintTb() { seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.r === S.rhythm))); fitSeg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === S.fit))); clock.style.opacity = S.rhythm === 'tod' ? '1' : '.55'; }
    function paintGal() { gal.textContent = ''; const list = S.rhythm === 'tod' ? TOD.map(t => t[1]) : pool();
      list.forEach(id => { const b = el('button', 'wpl-th'), im = el('img'); b.type = 'button'; b.setAttribute('role', 'listitem'); im.src = PX(id, 300); im.alt = 'Wallpaper ' + id; im.loading = 'lazy'; b.append(im); if (S.rhythm === 'tod') b.append(el('small', null, TOD.find(t => t[1] === id)[2] + ' · ' + String(TOD.find(t => t[1] === id)[0]).padStart(2, '0') + ':00'));
        b.setAttribute('aria-current', String(id === S.cur)); b.setAttribute('aria-label', 'Set wallpaper ' + id); b.addEventListener('click', () => { if (S.rhythm === 'tod') { say('Time of day picks the wallpaper. Drag the clock instead.'); return; } setWall(id); S.left = RH[S.rhythm][1]; }); gal.append(b); }); paintSt(); }
    function paintSt() { st.textContent = ''; const n = S.rhythm === 'tod' ? 4 : pool().length; st.append(el('span', null, n + ' wallpapers in rotation · ' + (S.fit === 'blur' ? 'blur fill' : S.fit))); const r = el('span'); r.append(document.createTextNode(S.paused ? 'Paused' : S.rhythm === 'tod' ? 'Following the clock · ' : 'Next in '), el('b', null, S.paused ? '' : S.rhythm === 'tod' ? todPick(S.hour)[2] : Math.ceil(S.left) + ' min')); st.append(r); }
    function setRhythm(k) { if (S.rhythm === k) return; S.rhythm = k; if (k === 'tod') { check('mode'); applyTod(); } else { S.left = RH[k][1]; if (!pool().includes(S.cur)) next(true); } tone(560, .03); paintTb(); paintGal(); paintDD(); }
    function applyTod() { const p = todPick(S.hour); cb.textContent = fmtH(S.hour) + ' · ' + p[2]; cl.value = S.hour; setWall(p[1], true); paintSt(); }
    function next(quiet) { if (S.rhythm === 'tod') { say('Following the time of day. Switch the rhythm to rotate freely.'); return; } const p = pool(); let i = p.indexOf(S.cur); const id = p[(i + 1) % p.length]; setWall(id, quiet); S.left = RH[S.rhythm][1]; if (!quiet) { check('next'); haptic(4); } }
    /* ---- menu bar ---- */
    const mx = el('button', 'wpl-mx'); mx.type = 'button'; mx.append(el('i')); mx.setAttribute('aria-label', 'Wallpaperly'); mx.setAttribute('aria-haspopup', 'true'); mx.setAttribute('aria-expanded', 'false'); extra.append(mx); let dd = null;
    function openDD(auto) { if (dd) { closeDD(); return; } dd = el('div', 'wpl-dd'); dd.setAttribute('role', 'dialog'); dd.setAttribute('aria-label', 'Wallpaperly'); const r = mx.getBoundingClientRect(), dr = desk.getBoundingClientRect(), sc = dr.width / 1200; dd.style.left = Math.min(1200 - 302, (r.left - dr.left) / sc - 130) + 'px'; desk.append(dd); mx.setAttribute('aria-expanded', 'true'); paintDD(); if (G && !reduced && !auto) G.from(dd, { opacity: 0, y: -6, duration: .2 }); }
    function closeDD() { if (!dd) return; dd.remove(); dd = null; mx.setAttribute('aria-expanded', 'false'); }
    mx.addEventListener('click', e => { e.stopPropagation(); openDD(); });
    function paintDD() { if (!dd) return; dd.textContent = ''; const pv = el('div', 'pv'); pv.style.backgroundImage = 'url("' + PX(S.cur, 600) + '")'; pv.append(el('span', null, (FOLDERS.find(f => f.ph.includes(S.cur)) || { n: 'Time of day' }).n));
      const row = el('div', 'row'), a = el('button', 'pri', 'Next'), b = el('button', null, S.paused ? 'Resume' : 'Pause'); a.type = b.type = 'button'; a.addEventListener('click', () => next()); b.addEventListener('click', () => { S.paused = !S.paused; say(S.paused ? 'Rotation paused' : 'Rotation resumed'); paintDD(); paintSt(); }); row.append(a, b);
      dd.append(pv, row, el('p', null, RH[S.rhythm][0] + (S.rhythm === 'tod' ? ' · ' + todPick(S.hour)[2] : S.paused ? ' · paused' : ' · next in ' + Math.ceil(S.left) + ' min'))); }
    /* ---- the clock: 1 s = 1 min ---- */
    let tick = 0; setInterval(() => { if (S.paused) return; const d = .25; if (S.rhythm === 'tod') { S.hour = (S.hour + d / 60) % 24; const was = todPick(S.hour - d / 60)[1]; if (todPick(S.hour)[1] !== was) applyTod(); else { cb.textContent = fmtH(S.hour) + ' · ' + todPick(S.hour)[2]; cl.value = S.hour; } }
      else { S.left -= d; if (S.left <= 0) next(true); } if (++tick % 4 === 0) { paintSt(); if (dd) { const p = dd.querySelector('p'); if (p) p.textContent = RH[S.rhythm][0] + (S.rhythm === 'tod' ? ' · ' + todPick(S.hour)[2] : ' · next in ' + Math.ceil(S.left) + ' min'); } } }, 250);
    H.jump = (k, fs) => { if (fs) return; if (k === 'next') { if (S.rhythm === 'tod') setRhythm('m15'); next(); } else if (k === 'tod') setRhythm('tod'); else if (k === 'night') { const f = FOLDERS.find(x => x.id === 'night'); if (!f.on) sd.querySelector('[data-f="night"]').click(); } };
    setWall(S.cur, true); cb.textContent = fmtH(S.hour) + ' · ' + todPick(S.hour)[2]; paintSd(); paintTb(); paintGal(); setTimeout(() => { if (!dd) openDD(true); }, 900);
  }
  demo(H.app, H);
  H.boot();
})();
