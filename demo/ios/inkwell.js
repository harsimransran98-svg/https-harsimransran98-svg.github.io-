/* Inkwell — iOS app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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

  H.layout = "poster";
/* ---------- Inkwell ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const M = {"key":"iw_state_v1","prompts":["What made you laugh this week, and why did it land?","Describe a room you loved as a child, in enough detail to walk through it.","What are you pretending not to know?","Write a thank-you note you will never send.","What would today look like if it went perfectly?","Which small habit is quietly changing your life?"],"past":[["Nov 17","🙂","The walk home","The fog came in early tonight and the streetlights looked like dandelions. I took the long way past the canal just to stay in it a little longer."],["Nov 15","😐","Too many tabs","Felt scattered all day. Twenty things half-started. Tomorrow: one thing, finished, before lunch."],["Nov 12","😄","Mara’s news","She got the job. We ate noodles on the stairs because the table was covered in boxes and it was the best dinner of the month."]]};
    let pi = 0, focus = false, mood = null; const past = M.past.map(x => x.slice());
    const root = el('div', 'iw'), V = {}; ['today', 'past'].forEach(k => { V[k] = el('section', 'iw-v'); V[k].setAttribute('aria-label', k); if (k !== 'today') V[k].hidden = true; root.append(V[k]); });
    const nav = el('nav', 'iw-nav'); [['today', 'Today'], ['past', 'Past']].forEach(([k, t]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(nav); app.append(root); let cur = 'today';
    function go(k) { if (k === cur) return; const a = V[cur], ak = cur; V[k].hidden = false; cur = k; nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k))); if (k === 'past') renderPast();
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0 }, { opacity: 1, duration: .4 }); G.to(a, { opacity: 0, duration: .12, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; }
    H.jump = go;

    /* ---- today: ring + prompt deck + editor ---- */
    const v = V.today, top = el('div', 'iw-top'), ring = el('div', 'iw-ring'), rs = svgEl('svg', { viewBox: '0 0 46 46', 'aria-hidden': 'true' }), C = 2 * Math.PI * 19, arc = svgEl('circle', { cx: 23, cy: 23, r: 19, class: 'a', 'stroke-dasharray': C.toFixed(1), 'stroke-dashoffset': C.toFixed(1) }), rn = el('span', null, '0');
    rs.append(svgEl('circle', { cx: 23, cy: 23, r: 19, class: 't' }), arc); ring.append(rs, rn); ring.setAttribute('role', 'img'); top.append(el('small', null, new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()), ring);
    const deck = el('div', 'iw-deck'); deck.setAttribute('aria-label', 'Prompt. Swipe or press the arrow keys for another.'); deck.tabIndex = 0;
    function drawDeck() { deck.textContent = ''; for (let k = 2; k >= 0; k--) { const c = el('div', 'iw-card' + (k ? ' b' + k : '')); c.append(el('small', null, k ? '' : 'TODAY’S PROMPT'), el('p', null, M.prompts[(pi + k) % M.prompts.length])); if (!k) c.append(el('em', null, '← swipe for another')); deck.append(c); } bindTop(); }
    function next(dir) { const c = deck.lastChild; const done = () => { pi = (pi + 1) % M.prompts.length; drawDeck(); check('prompt'); tone(620, .04); };
      if (G && !reduced) { G.to(c, { x: dir * 360, rotation: dir * 18, opacity: 0, duration: .35, ease: 'power2.in' }); setTimeout(done, 360); } else done(); }
    function bindTop() { const c = deck.lastChild; let x0 = null; c.addEventListener('pointerdown', e => { x0 = e.clientX; try { c.setPointerCapture(e.pointerId); } catch (_) {} });
      c.addEventListener('pointermove', e => { if (x0 == null) return; const dx = e.clientX - x0; c.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 20 + 'deg)'; });
      c.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 80) next(Math.sign(dx)); else c.style.transform = ''; }); }
    deck.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); next(e.key === 'ArrowLeft' ? -1 : 1); } });
    const ed = el('div', 'iw-ed'), mir = el('div', 'iw-mir'), ta = el('textarea'); ta.placeholder = 'Start anywhere. Nobody else will read this.'; ta.maxLength = 5000; ta.spellcheck = false; ta.setAttribute('aria-label', 'Journal entry'); mir.setAttribute('aria-hidden', 'true'); ed.append(mir, ta);
    const tools = el('div', 'iw-tools'), fc = el('button', 'fc', '◐ Focus'), moods = el('div', 'iw-moods'); fc.type = 'button'; fc.setAttribute('aria-pressed', 'false');
    ['😞', '😐', '🙂', '😄', '🤩'].forEach((f, i) => { const b = el('button', null, f); b.type = 'button'; b.setAttribute('aria-label', ['Low', 'Meh', 'Okay', 'Good', 'Great'][i] + ' mood'); b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', () => { mood = f; moods.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); check('mood'); tone(500 + i * 90, .05); }); moods.append(b); });
    tools.append(fc, moods); v.append(top, deck, ed, tools);
    function paint() {
      const t = ta.value, caret = ta.selectionStart; mir.textContent = '';
      const parts = t.match(/[^.!?\n]+[.!?]*\s*|\n/g) || []; let pos = 0;
      parts.forEach(p => { const sp = el('span', null, p); if (focus && !(caret >= pos && caret <= pos + p.length)) sp.className = 'dim'; mir.append(sp); pos += p.length; }); mir.append(document.createTextNode('\n'));
      const words = (t.match(/\S+/g) || []).length; rn.textContent = String(words); arc.setAttribute('stroke-dashoffset', (C * (1 - Math.min(1, words / 250))).toFixed(1)); ring.setAttribute('aria-label', words + ' of 250 words');
      if (words >= 30) check('write'); ta.style.height = Math.max(300, ta.scrollHeight) + 'px'; }
    ['input', 'click', 'keyup', 'select'].forEach(ev => ta.addEventListener(ev, paint));
    fc.addEventListener('click', () => { focus = !focus; fc.setAttribute('aria-pressed', String(focus)); if (focus) check('focus'); paint(); ta.focus(); say(focus ? 'Focus mode: only this sentence stays bright' : 'Focus mode off'); });

    /* ---- past ---- */
    let q = '', openI = -1;
    function renderPast() { const pv = V.past; pv.textContent = ''; const h = el('div', 'iw-h'); h.append(el('small', null, past.length + ' ENTRIES · 12 DAY STREAK'), el('h2', null, 'Past entries')); pv.append(h);
      const f = el('input', 'iw-find'); f.type = 'search'; f.placeholder = 'Search your journal'; f.value = q; f.setAttribute('aria-label', 'Search entries'); f.addEventListener('input', () => { q = f.value; renderPast(); pv.querySelector('.iw-find').focus(); }); pv.append(f);
      const ta2 = ta.value.trim(); const list = (ta2 ? [['Today', mood || '✍️', M.prompts[pi].slice(0, 32) + '…', ta2]] : []).concat(past);
      list.filter(e => !q || (e[2] + e[3]).toLowerCase().includes(q.toLowerCase())).forEach((e, i) => { const b = el('button', 'iw-e'); b.type = 'button'; b.setAttribute('aria-expanded', String(i === openI)); const p = el('p');
        if (q) { const t = e[3], k = t.toLowerCase().indexOf(q.toLowerCase()); if (k >= 0) { p.append(document.createTextNode(t.slice(0, k)), el('mark', null, t.slice(k, k + q.length)), document.createTextNode(t.slice(k + q.length))); } else p.textContent = t; } else p.textContent = e[3];
        b.append(el('small', null, e[0] + '  ' + e[1]), el('b', null, e[2]), p); b.addEventListener('click', () => { openI = openI === i ? -1 : i; check('past'); renderPast(); }); pv.append(b); }); }
    nav.querySelector('[data-v="today"]').setAttribute('aria-selected', 'true'); drawDeck(); paint();
  }
  demo(H.app, H);
  H.boot();
})();
