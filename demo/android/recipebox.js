/* RecipeBox — Android app concept with a live, interactive build (Bazozo Studio, generated). DOM is built with textContent only. */
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
/* ---------- RecipeBox ---------- */
  function demo(app, H) {
    const { el, svgEl, G, reduced, store, tone, haptic, check, say } = H;
    const M = {"key":"rb_state_v1","pantry":[["eggs","🥚"],["rice","🍚"],["tomatoes","🍅"],["onion","🧅"],["garlic","🧄"],["pasta","🍝"],["cheese","🧀"],["spinach","🥬"],["chickpeas","🫘"],["lemon","🍋"],["butter","🧈"],["milk","🥛"]],"have":["eggs","onion","garlic","pasta","cheese","butter"],"recipes":[{"n":"Shakshuka","t":25,"c":"#C8384E","serves":2,"ing":[["eggs",4,""],["tomatoes",400,"g"],["onion",1,""],["garlic",2,"cloves"],["spinach",60,"g"]],"steps":[["Soften the onion and garlic in oil.",5],["Add the tomatoes and simmer until thick.",10],["Make four wells and crack in the eggs.",0],["Cover and cook until the whites set.",6]]},{"n":"Cacio e pepe","t":15,"c":"#E8A33D","serves":2,"ing":[["pasta",200,"g"],["cheese",80,"g"],["butter",20,"g"],["pepper",1,"tsp"]],"steps":[["Boil the pasta in less water than usual.",9],["Toast the pepper in butter.",2],["Toss pasta, cheese and a splash of pasta water.",0]]},{"n":"Lemon chickpea rice","t":30,"c":"#7FA046","serves":3,"ing":[["rice",200,"g"],["chickpeas",400,"g"],["lemon",1,""],["garlic",2,"cloves"],["spinach",80,"g"]],"steps":[["Fry the garlic, add rice and toast it.",3],["Add water and simmer.",15],["Stir in chickpeas, spinach and lemon.",2]]},{"n":"Cheesy omelette","t":10,"c":"#D98E04","serves":1,"ing":[["eggs",3,""],["cheese",40,"g"],["butter",10,"g"],["milk",2,"tbsp"]],"steps":[["Whisk the eggs with the milk.",0],["Cook in foaming butter, stirring gently.",2],["Add cheese, fold and serve.",1]]}]};
    const ICON = Object.fromEntries(M.pantry); ICON.pepper = '🌶';
    const saved = store.get(M.key, null) || {};
    const have = new Set(Array.isArray(saved.have) ? saved.have.filter(k => ICON[k]) : M.have);
    const list = Array.isArray(saved.list) ? saved.list.filter(x => x && typeof x.n === 'string').slice(0, 30) : [];
    const save = () => store.set(M.key, { have: [...have], list });
    let sel = null, serves = 2, offline = false;
    const score = r => r.ing.filter(([k]) => have.has(k)).length / r.ing.length;
    const fmtQ = (q, u) => { const v = Math.round(q * 10) / 10; return (u === '' ? '× ' + v : v + (u.length <= 2 ? '' : ' ') + u); };

    const root = el('div', 'rb'), V = {}; ['pantry', 'recipe', 'list'].forEach(k => { V[k] = el('section', 'rb-v'); V[k].setAttribute('aria-label', k); if (k !== 'pantry') V[k].hidden = true; root.append(V[k]); });
    const nav = el('nav', 'rb-nav'), badge = el('b'); [['pantry', '🥫', 'Cook'], ['recipe', '📖', 'Recipe'], ['list', '🛒', 'Shopping']].forEach(([k, ic, t]) => { const b = el('button'); b.type = 'button'; b.dataset.v = k; b.setAttribute('role', 'tab'); b.append(el('span', null, ic), document.createTextNode(t)); if (k === 'list') b.append(badge); b.addEventListener('click', () => go(k)); nav.append(b); });
    root.append(nav); app.append(root); let cur = 'pantry';
    function go(k) { if (k === 'recipe' && !sel) sel = ranked()[0]; if (k === cur) { render(); return; } const a = V[cur], ak = cur; V[k].hidden = false; cur = k; nav.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === k))); render(); if (k === 'recipe') check('open');
      if (G) { G.killTweensOf(V[k]); G.fromTo(V[k], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .35, ease: 'expo.out' }); G.to(a, { opacity: 0, duration: .12, onComplete: () => { if (cur !== ak) a.hidden = true; G.set(a, { opacity: 1 }); } }); } else a.hidden = true; haptic(5); }
    H.jump = go;
    const ranked = () => [...M.recipes].sort((a, b) => score(b) - score(a) || a.t - b.t);
    const pct = (r) => { const w = el('div', 'rb-pct'), sv = svgEl('svg', { viewBox: '0 0 46 46', 'aria-hidden': 'true' }), C = 2 * Math.PI * 18; w.style.setProperty('--c', r.c); sv.append(svgEl('circle', { cx: 23, cy: 23, r: 18, class: 't' }), svgEl('circle', { cx: 23, cy: 23, r: 18, class: 'a', 'stroke-dasharray': C.toFixed(1), 'stroke-dashoffset': (C * (1 - score(r))).toFixed(1) })); w.append(sv, el('span', null, Math.round(score(r) * 100) + '%')); return w; };

    function render() {
      /* pantry + ranked suggestions */
      const v = V.pantry; v.textContent = ''; const h = el('div', 'rb-h'), ht = el('div'), off = el('button', 'rb-off'); off.type = 'button'; off.setAttribute('aria-pressed', String(offline)); off.append(document.createTextNode(offline ? '✈ Offline' : '● Online'));
      off.addEventListener('click', () => { offline = !offline; if (offline) { check('offline'); say('Airplane mode on. Every recipe still works'); } render(); }); ht.append(el('small', null, have.size + ' things in the cupboard'), el('h2', null, 'What can I cook?')); h.append(ht, off); v.append(h);
      const pan = el('div', 'rb-pan'); M.pantry.forEach(([k, ic]) => { const b = el('button'); b.type = 'button'; b.setAttribute('aria-pressed', String(have.has(k))); b.append(el('span', null, ic), document.createTextNode(k)); b.addEventListener('click', () => { if (have.has(k)) have.delete(k); else have.add(k); save(); check('pantry'); tone(have.has(k) ? 700 : 450, .04); renderCards(true); b.setAttribute('aria-pressed', String(have.has(k))); ht.firstChild.textContent = have.size + ' things in the cupboard'; }); pan.append(b); });
      v.append(pan, el('p', 'rb-sec', 'Best matches')); const cards = el('div'); v.append(cards);
      function renderCards(anim) { const first = new Map([...cards.children].map(c => [c.dataset.n, c.getBoundingClientRect().top])); cards.textContent = '';
        ranked().forEach(r => { const miss = r.ing.filter(([k]) => !have.has(k)), c = el('button', 'rb-card'), pic = el('div', 'rb-pic', ICON[r.ing[0][0]] || '🍽'), mid = el('div'); c.type = 'button'; c.dataset.n = r.n; pic.style.setProperty('--c', r.c);
          mid.append(el('b', null, r.n), el('small', null, r.t + ' min · serves ' + r.serves), el('small', miss.length ? 'miss' : '', miss.length ? 'Missing: ' + miss.map(x => x[0]).join(', ') : 'You have everything')); c.append(pic, mid, pct(r)); c.setAttribute('aria-label', r.n + ', ' + Math.round(score(r) * 100) + ' percent match');
          c.addEventListener('click', () => { sel = r; serves = r.serves; go('recipe'); }); cards.append(c); });
        if (anim && G && !reduced) [...cards.children].forEach(c => { const t0 = first.get(c.dataset.n); if (t0 != null) G.from(c, { y: t0 - c.getBoundingClientRect().top, duration: .5, ease: 'expo.out' }); }); }
      renderCards(false);

      /* recipe detail */
      const rv = V.recipe; rv.textContent = ''; const r = sel || ranked()[0]; sel = r; const back = el('button', 'rb-back', '← All recipes'); back.type = 'button'; back.addEventListener('click', () => go('pantry'));
      const hero = el('div', 'rb-hero', ICON[r.ing[0][0]] || '🍽'); hero.style.setProperty('--c', r.c); const hh = el('div', 'rb-h'), hd = el('div'); hd.append(el('small', null, r.t + ' min · ' + Math.round(score(r) * 100) + '% in your cupboard'), el('h2', null, r.n)); hh.append(hd);
      const srv = el('div', 'rb-srv'), minus = el('button', null, '−'), plus = el('button', null, '+'), sb = el('b', null, String(serves)); minus.type = plus.type = 'button'; minus.setAttribute('aria-label', 'Fewer servings'); plus.setAttribute('aria-label', 'More servings'); srv.append(el('span', null, 'Servings'), minus, sb, plus);
      const ing = el('div', 'rb-ing'); const paintIng = bump => { ing.textContent = ''; r.ing.forEach(([k, q, u]) => { const d = el('div', have.has(k) ? '' : 'miss'), b = el('b', bump ? 'bump' : '', fmtQ(q * serves / r.serves, u)); d.append(el('i'), document.createTextNode((ICON[k] || '') + ' ' + k + (have.has(k) ? '' : ' (missing)')), b); ing.append(d); }); };
      const setS = n => { serves = Math.max(1, Math.min(8, n)); sb.textContent = String(serves); paintIng(true); check('scale'); tone(500 + serves * 40, .04); setTimeout(() => ing.querySelectorAll('b').forEach(b => b.classList.remove('bump')), 500); };
      minus.addEventListener('click', () => setS(serves - 1)); plus.addEventListener('click', () => setS(serves + 1)); paintIng(false);
      const btns = el('div', 'rb-btns'), cookB = el('button', 'pri', '▶ Cook mode'), shopB = el('button', null, '🛒 Add missing'); cookB.type = shopB.type = 'button';
      shopB.addEventListener('click', () => { const miss = r.ing.filter(([k]) => !have.has(k)); if (!miss.length) { say('Nothing missing. You can cook this now'); return; } miss.forEach(([k, q, u]) => { if (!list.some(x => x.n === k)) list.push({ n: k, q: fmtQ(q * serves / r.serves, u), f: r.n, done: false }); }); save(); check('shop'); paintBadge(); say(miss.length + ' items added to your list'); tone(760, .06); });
      cookB.addEventListener('click', () => cook(r)); btns.append(cookB, shopB); rv.append(back, hero, hh, srv, el('p', 'rb-sec', 'Ingredients'), ing, btns);

      /* shopping list */
      const lv = V.list; lv.textContent = ''; const lh = el('div', 'rb-h'), ld = el('div'); ld.append(el('small', null, list.filter(x => !x.done).length + ' to buy'), el('h2', null, 'Shopping')); lh.append(ld); lv.append(lh);
      if (!list.length) lv.append(el('p', 'rb-sec', 'Add missing ingredients from any recipe.'));
      list.forEach(x => { const b = el('button', 'rb-li' + (x.done ? ' done' : '')); b.type = 'button'; b.setAttribute('aria-pressed', String(x.done)); b.append(el('i', null, x.done ? '✓' : ''), document.createTextNode((ICON[x.n] || '') + ' ' + x.n + ' · ' + x.q), el('small', null, 'for ' + x.f)); b.addEventListener('click', () => { x.done = !x.done; if (x.done) { have.add(x.n); } save(); render(); paintBadge(); }); lv.append(b); });
      paintBadge();
    }
    const paintBadge = () => { const n = list.filter(x => !x.done).length; badge.textContent = String(n); badge.hidden = !n; };

    /* ---- cook mode with step timers ---- */
    function cook(r) {
      let i = 0, tmr = 0, left = 0; const ov = el('div', 'rb-cook'); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Cook mode'); root.append(ov);
      const draw = () => { ov.textContent = ''; const dots = el('div', 'rb-dots'); r.steps.forEach((_, j) => dots.append(el('i', j <= i ? 'on' : ''))); const [txt, min] = r.steps[i];
        ov.append(dots, el('small', null, r.n.toUpperCase() + ' · STEP ' + (i + 1) + ' OF ' + r.steps.length), el('h3', null, txt));
        if (min) { const tm = el('div', 'rb-tm'), tb = el('b', null, String(min).padStart(2, '0') + ':00'), st = el('button', null, 'Start'); st.type = 'button'; tm.append(tb, st); ov.append(tm);
          st.addEventListener('click', () => { clearInterval(tmr); left = min * 60; check('timer'); st.textContent = 'Running'; tmr = setInterval(() => { left -= 10; tb.textContent = String(Math.max(0, Math.floor(left / 60))).padStart(2, '0') + ':' + String(Math.max(0, left % 60)).padStart(2, '0'); if (left <= 0) { clearInterval(tmr); st.textContent = 'Done'; tm.classList.add('ring'); tone(880, .2); setTimeout(() => tone(880, .2), 300); say('Step timer done'); } }, 100); }); }
        const nx = el('div', 'rb-nx'), ex = el('button', null, i ? '← Back' : 'Exit'), go2 = el('button', 'pri', i < r.steps.length - 1 ? 'Next step →' : 'Done, enjoy!'); ex.type = go2.type = 'button'; nx.append(ex, go2); ov.append(nx);
        ex.addEventListener('click', () => { clearInterval(tmr); if (i) { i--; draw(); } else ov.remove(); }); go2.addEventListener('click', () => { clearInterval(tmr); if (i < r.steps.length - 1) { i++; draw(); tone(620, .05); } else { ov.remove(); say('Bon appétit'); } });
        if (G && !reduced) G.from(ov.querySelector('h3'), { y: 20, opacity: 0, duration: .4, ease: 'expo.out' }); go2.focus(); };
      if (G && !reduced) G.from(ov, { y: '100%', duration: .45, ease: 'expo.out' }); draw();
    }

    nav.querySelector('[data-v="pantry"]').setAttribute('aria-selected', 'true'); render();
  }
  demo(H.app, H);
  H.boot();
})();
