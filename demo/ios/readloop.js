/* Readloop — interactive iPhone audio-story prototype (Bazozo Studio). DOM built with textContent only. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const haptic = (p = 8) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  $('#year').textContent = new Date().getFullYear();

  /* ---------- fit + clock ---------- */
  const stage = $('#stage');
  function fit() {
    const vw = document.documentElement.clientWidth, wide = vw > 1180;
    stage.style.setProperty('--s', Math.max(.55, Math.min(1, wide ? (window.innerHeight - 110) / 820 : 1, (vw - 32) / 390)).toFixed(3));
  }
  window.addEventListener('resize', fit); fit();
  const tick = () => { const d = new Date(); $('#clock').textContent = `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`; };
  tick(); setInterval(tick, 15000);

  /* ---------- checklist + toast ---------- */
  const done = new Set();
  function check(k) { if (done.has(k)) return; done.add(k); const li = $(`#tryList [data-t="${k}"]`); if (li) li.classList.add('done'); $('#tryCount').textContent = `${done.size} / 5`; $('#tryBar').style.width = (done.size * 20) + '%'; }
  const toast = $('#toast');
  function say(msg) {
    toast.textContent = msg;
    if (G) { G.killTweensOf(toast); G.fromTo(toast, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: 'back.out(2)' }); G.to(toast, { opacity: 0, duration: .3, delay: 1.8 }); }
    else { toast.style.opacity = 1; setTimeout(() => { toast.style.opacity = 0; }, 2000); }
  }

  /* ---------- stories ---------- */
  const STORIES = [
    { id: 'wharf', title: 'The Wharf at Dusk', by: 'Ingrid, Trondheim', where: 'Trondheim, NO', img: '../../images/nordlysarchitect.jpg', dur: 862, tags: ['History', 'Calm'], a: ['#9D174D', '#3730A3'], chord: [196, 246.9, 293.7],
      lines: ['The warehouses lean over the water', 'like old men telling the same joke.', 'My grandfather loaded salt cod here', 'before anyone painted them red.', 'In winter the river smokes at dawn', 'and the whole street smells of tar.', 'Walk slowly past the green one.', 'That is where the boats came home.'] },
    { id: 'barley', title: 'Barley Before Sunrise', by: 'Tom, the valley farm', where: 'Herefordshire, UK', img: '../../images/terranovafarms.jpg', dur: 645, tags: ['Calm', 'Food'], a: ['#92400E', '#7C2D12'], chord: [174.6, 220, 261.6],
      lines: ['We cut at five because the dew holds the dust down.', 'Listen. That hiss is the whole field breathing.', 'My father could tell rain by the colour of the awns.', 'I just check my phone.', 'Bread from this field is in the café by nine.', 'You might be eating it right now.'] },
    { id: 'supper', title: 'Supper on the Coast', by: 'Lucía, Lima', where: 'Lima, PE', img: '../../images/saltcedar.jpg', dur: 734, tags: ['Food'], a: ['#B45309', '#1E3A8A'], chord: [220, 277.2, 329.6],
      lines: ['Causa is a potato that has been to a party.', 'Yellow from ají amarillo, cold, and very proud.', 'My aunt makes it in a tin she will not let anyone touch.', 'Egg, tomato, a little mayonnaise on top.', 'Eat it slowly, with the sea behind you.', 'Then ask for the recipe. She will say no.'] },
    { id: 'cafe', title: 'Opening the Café', by: 'Grace, Bristol', where: 'Bristol, UK', img: '../../images/castironcoffee.jpg', dur: 512, tags: ['Food', 'Calm'], a: ['#065F46', '#7C2D12'], chord: [196, 233.1, 293.7],
      lines: ['The grinder goes on before the lights do.', 'First customer is always the postman.', 'Flat white, no sugar, a story about his dog.', 'By eight the tiles are steaming up.', 'I know eleven people by their order.', 'Come in. I will learn yours.'] },
    { id: 'quiet', title: 'A Room to Breathe', by: 'Mei, Kyoto', where: 'Kyoto, JP', img: '../../images/thequietroom.jpg', dur: 600, tags: ['Calm', 'Night walks'], a: ['#4C1D95', '#155E75'], chord: [164.8, 207.7, 246.9],
      lines: ['Light the incense and do not watch it.', 'Breathe in for four.', 'Hold, the way the temple bell holds.', 'Breathe out for six.', 'The city is still out there.', 'It will wait for you.'] },
    { id: 'set', title: 'Behind the Red Light', by: 'Jules, film set', where: 'London, UK', img: '../../images/driftwoodfilms.jpg', dur: 790, tags: ['History', 'Night walks'], a: ['#9F1239', '#1E1B4B'], chord: [185, 233.1, 277.2],
      lines: ['Quiet on set means everyone.', 'Even the boom operator holds her breath.', 'Take seven. The actor finally looks away from the bottle.', 'That small glance is the whole scene.', 'We wrap at two in the morning.', 'Nobody ever remembers the catering.'] }
  ];
  let queue = STORIES.map(s => s.id), saved = new Set(['quiet']);
  const byId = id => STORIES.find(s => s.id === id);

  /* ---------- card stack ---------- */
  const stack = $('#stack');
  function renderStack() {
    stack.replaceChildren();
    if (!queue.length) {
      const e = el('div', 'empty'); const inner = el('div'); inner.append(el('b', null, 'All caught up'), document.createTextNode('New stories land every evening at 6pm.'));
      const r = el('button', null, 'Shuffle again'); r.type = 'button'; r.addEventListener('click', () => { queue = STORIES.map(s => s.id); renderStack(); });
      inner.append(el('br'), r); e.append(inner); stack.append(e); return;
    }
    queue.slice(0, 3).reverse().forEach((id, k, arr) => {
      const depth = arr.length - 1 - k, s = byId(id);
      const c = el('article', 'scard'); c.dataset.id = id;
      const img = el('img'); img.src = s.img; img.alt = ''; img.draggable = false;
      const info = el('div', 'info'); info.append(el('span', 'where', '◉ ' + s.where), el('h3', null, s.title), el('p', null, `${s.by} · ${Math.round(s.dur / 60)} min`));
      const tags = el('div', 'tags'); s.tags.forEach(t => tags.append(el('span', null, t))); info.append(tags);
      c.append(img, el('span', 'stamp save', 'SAVE'), el('span', 'stamp skip', 'SKIP'), info);
      c.style.transform = `translateY(${depth * 14}px) scale(${1 - depth * .05})`;
      c.style.zIndex = 10 - depth;
      if (depth === 0) { draggable(c); c.setAttribute('aria-label', `${s.title}, by ${s.by}`); } else c.setAttribute('aria-hidden', 'true');
      stack.append(c);
    });
    setAurora(byId(queue[0]));
  }
  const topCard = () => stack.querySelector(`.scard[data-id="${queue[0]}"]`);
  function draggable(c) {
    let x0 = 0, y0 = 0, dx = 0, dy = 0, drag = false;
    const save = c.querySelector('.save'), skip = c.querySelector('.skip');
    const paint = () => { c.style.transform = `translate(${dx}px, ${dy * .4}px) rotate(${dx / 16}deg)`; save.style.opacity = Math.max(0, Math.min(1, dx / 90)); skip.style.opacity = Math.max(0, Math.min(1, -dx / 90)); };
    c.addEventListener('pointerdown', e => { drag = true; x0 = e.clientX; y0 = e.clientY; dx = dy = 0; try { c.setPointerCapture(e.pointerId); } catch (_) {} if (G) G.killTweensOf(c); });
    c.addEventListener('pointermove', e => { if (!drag) return; const s = parseFloat(getComputedStyle(stage).getPropertyValue('--s')) || 1; dx = (e.clientX - x0) / s; dy = (e.clientY - y0) / s; paint(); });
    const end = () => {
      if (!drag) return; drag = false;
      if (Math.abs(dx) > 100) fling(dx > 0 ? 1 : -1, dx, dy);
      else if (G) G.to({ dx, dy }, { dx: 0, dy: 0, duration: .6, ease: 'elastic.out(1, .55)', onUpdate() { dx = this.targets()[0].dx; dy = this.targets()[0].dy; paint(); } });
      else { dx = dy = 0; paint(); }
    };
    c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
  }
  function fling(dir, fromX = 0, fromY = 0) {
    const c = topCard(); if (!c) return;
    const id = queue[0], s = byId(id);
    haptic(dir > 0 ? [8, 30, 10] : 10); check('swipe');
    if (dir > 0) { saved.add(id); renderLib(); say(`Saved “${s.title}” to Library`); } else say('Skipped');
    const next = () => { queue.shift(); renderStack(); if (G) G.from(stack.querySelectorAll('.scard'), { y: '+=14', scale: '-=.04', duration: .45, ease: 'back.out(1.6)' }); };
    if (G) G.fromTo(c, { x: fromX, y: fromY * .4, rotation: fromX / 16 }, { x: dir * 520, y: fromY * .4 + 60, rotation: dir * 30, opacity: 0, duration: .45, ease: 'power2.in', onComplete: next });
    else next();
    if (G) G.to(c.querySelector(dir > 0 ? '.save' : '.skip'), { opacity: 1, duration: .15 });
  }
  $('#saveBtn').addEventListener('click', () => fling(1));
  $('#skipBtn').addEventListener('click', () => fling(-1));
  $('#playTop').addEventListener('click', () => { if (queue.length) load(byId(queue[0]), true); });
  $$('.filters button').forEach(b => b.addEventListener('click', () => { $$('.filters button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); haptic(4); }));
  function setAurora(s) { if (!s) return; const a = $('#sAurora'); a.style.setProperty('--a1', s.a[0]); a.style.setProperty('--a2', s.a[1]); }

  /* ---------- ambient audio (synthesised, quiet) ---------- */
  const A = { ctx: null, master: null, voices: [], muted: false };
  function audioFor(s) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    if (!A.ctx) {
      A.ctx = new AC();
      A.master = A.ctx.createGain(); A.master.gain.value = 0;
      const lp = A.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
      const lfo = A.ctx.createOscillator(), lfoG = A.ctx.createGain(); lfo.frequency.value = .08; lfoG.gain.value = 400; lfo.connect(lfoG).connect(lp.frequency); lfo.start();
      A.bus = A.ctx.createGain(); A.bus.connect(lp).connect(A.master).connect(A.ctx.destination);
    }
    if (A.ctx.state === 'suspended') A.ctx.resume();
    A.voices.forEach(v => { try { v.stop(A.ctx.currentTime + .6); } catch (_) {} });
    A.voices = [];
    s.chord.concat(s.chord[0] / 2).forEach((f, i) => {
      const o = A.ctx.createOscillator(), g = A.ctx.createGain();
      o.type = i === 3 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = (i - 1.5) * 5;
      g.gain.value = i === 3 ? .5 : .22; o.connect(g).connect(A.bus); o.start(); A.voices.push(o);
    });
  }
  function audioGain(on) { if (!A.ctx) return; A.master.gain.setTargetAtTime(on && !A.muted ? .05 : 0, A.ctx.currentTime, .35); }
  $('#npSound').addEventListener('click', () => { A.muted = !A.muted; $('#npWave').style.display = A.muted ? 'none' : ''; $('#npSound').setAttribute('aria-label', A.muted ? 'Unmute' : 'Mute'); audioGain(P.playing); haptic(5); });

  /* ---------- player ---------- */
  const P = { s: null, pos: 0, playing: false, rate: 1, last: 0 };
  const LINE = 4.2; // seconds per lyric line at 1×
  function load(s, play) {
    P.s = s; P.pos = 0; setAurora(s);
    $('#mini').hidden = false; $('#miniArt').src = s.img; $('#miniT').textContent = s.title; $('#miniS').textContent = s.by;
    $('#npImg').src = s.img; $('#npBg').style.backgroundImage = `url(${s.img})`; $('#islArt').style.backgroundImage = `url(${s.img})`;
    $('#npT').textContent = s.title; $('#npS').textContent = `${s.by} · ${s.where}`;
    $('#npHeart').setAttribute('aria-pressed', String(saved.has(s.id)));
    const li = $('#lyricsIn'); li.replaceChildren();
    s.lines.forEach((t, i) => { const p = el('p', null, t); p.addEventListener('click', () => { P.pos = i * LINE + .05; check('lyric'); haptic(5); paintPlayer(); if (!P.playing) setPlaying(true); }); li.append(p); });
    if (G) G.fromTo('#mini', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'back.out(1.7)' });
    audioFor(s);
    if (play) setPlaying(true);
    paintPlayer();
  }
  const playPath = 'M8 5v14l11-7L8 5Z', pausePath = 'M7 5h4v14H7zM13 5h4v14h-4z';
  function setIcon(svg, playing, fill) { svg.replaceChildren(); const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', playing ? pausePath : playPath); p.setAttribute('fill', fill); svg.append(p); }
  function setPlaying(on) {
    if (!P.s) return;
    P.playing = on; P.last = performance.now();
    setIcon($('#miniIc'), on, '#fff'); setIcon($('#npIc'), on, '#0D0B14');
    $('#miniPP').setAttribute('aria-label', on ? 'Pause' : 'Play'); $('#npPP').setAttribute('aria-label', on ? 'Pause' : 'Play');
    $('#npArt').classList.toggle('paused', !on);
    if (on && A.ctx && A.ctx.state === 'suspended') A.ctx.resume();
    audioGain(on);
    island(on); haptic(8);
    if (on) check('play');
  }
  const isl = $('#island');
  function island(live) {
    isl.classList.toggle('live', live);
    if (!G) return;
    G.to(isl, { width: live ? 196 : 124, marginLeft: live ? -98 : -62, duration: .5, ease: live ? 'elastic.out(1, .75)' : 'power3.inOut' });
    G.to(['#islArt', '#island .eq'], { opacity: live ? 1 : 0, duration: .25, delay: live ? .15 : 0 });
  }
  function paintPlayer() {
    if (!P.s) return;
    const d = P.s.dur, p = Math.min(1, P.pos / d);
    $('#miniBar').style.width = (p * 100) + '%';
    $('#sFill').style.width = (p * 100) + '%'; $('#sKnob').style.left = (p * 100) + '%';
    $('#scrub').setAttribute('aria-valuenow', Math.round(p * 100));
    $('#tNow').textContent = fmt(P.pos); $('#tLeft').textContent = '-' + fmt(Math.max(0, d - P.pos));
    const lines = $$('#lyricsIn p'), idx = Math.min(lines.length - 1, Math.floor(P.pos / LINE));
    lines.forEach((l, i) => { l.classList.toggle('on', i === idx); l.classList.toggle('past', i < idx); });
    const cur = lines[idx];
    if (cur) {
      const y = -(cur.offsetTop - $('#lyrics').clientHeight * .3);
      const li = $('#lyricsIn');
      if (G) G.to(li, { y: Math.min(0, y), duration: .6, ease: 'power3.out', overwrite: true }); else li.style.transform = `translateY(${Math.min(0, y)}px)`;
    }
  }
  let lastLine = -1;
  (function loop(now) {
    if (P.playing && P.s) {
      P.pos = Math.min(P.s.dur, P.pos + (now - P.last) / 1000 * P.rate); P.last = now;
      const li = Math.floor(P.pos / LINE);
      if (li !== lastLine) { lastLine = li; paintPlayer(); }
      else { const p = P.pos / P.s.dur; $('#miniBar').style.width = (p * 100) + '%'; $('#sFill').style.width = (p * 100) + '%'; $('#sKnob').style.left = (p * 100) + '%'; $('#tNow').textContent = fmt(P.pos); $('#tLeft').textContent = '-' + fmt(P.s.dur - P.pos); }
      if (P.pos >= P.s.dur) setPlaying(false);
    }
    requestAnimationFrame(loop);
  })(performance.now());

  $('#miniPP').addEventListener('click', e => { e.stopPropagation(); setPlaying(!P.playing); });
  $('#npPP').addEventListener('click', () => { setPlaying(!P.playing); if (G) G.fromTo('#npPP', { scale: .85 }, { scale: 1, duration: .5, ease: 'elastic.out(1, .4)' }); });
  $('#back15').addEventListener('click', () => { P.pos = Math.max(0, P.pos - 15); paintPlayer(); haptic(5); });
  $('#fwd30').addEventListener('click', () => { P.pos = Math.min(P.s.dur, P.pos + 30); paintPlayer(); haptic(5); });
  const RATES = [1, 1.25, 1.5, 2];
  $('#rateBtn').addEventListener('click', () => { P.rate = RATES[(RATES.indexOf(P.rate) + 1) % RATES.length]; $('#rateBtn').textContent = P.rate + '×'; haptic(5); });
  $('#sleepBtn').addEventListener('click', () => say('Sleep timer: end of this story'));
  $('#npHeart').addEventListener('click', () => {
    const id = P.s.id, on = !saved.has(id); on ? saved.add(id) : saved.delete(id);
    $('#npHeart').setAttribute('aria-pressed', String(on)); renderLib(); haptic(8);
    if (G) G.fromTo('#npHeart', { scale: .6 }, { scale: 1, duration: .6, ease: 'elastic.out(1.2, .4)' });
  });
  // scrubbing
  const scrub = $('#scrub');
  let scr = false;
  const seekTo = e => { const r = scrub.getBoundingClientRect(); P.pos = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * P.s.dur; paintPlayer(); };
  scrub.addEventListener('pointerdown', e => { scr = true; try { scrub.setPointerCapture(e.pointerId); } catch (_) {} seekTo(e); });
  scrub.addEventListener('pointermove', e => { if (scr) seekTo(e); });
  scrub.addEventListener('pointerup', () => { scr = false; });
  scrub.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { P.pos = Math.min(P.s.dur, P.pos + 10); paintPlayer(); } if (e.key === 'ArrowLeft') { P.pos = Math.max(0, P.pos - 10); paintPlayer(); } });

  /* now playing sheet */
  const np = $('#np');
  function openNP() {
    if (!P.s) return;
    np.hidden = false; check('expand'); haptic(10); paintPlayer();
    if (G) { G.fromTo(np, { yPercent: 100 }, { yPercent: 0, duration: .6, ease: 'expo.out' }); G.from('#npArt', { scale: .4, y: 300, borderRadius: 12, duration: .7, ease: 'expo.out' }); }
  }
  function closeNP() { const fin = () => { np.hidden = true; }; if (G) G.to(np, { yPercent: 100, duration: .4, ease: 'power3.in', onComplete: fin }); else fin(); }
  $('#mini').addEventListener('click', openNP);
  $('#mini').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNP(); } });
  $('#npClose').addEventListener('click', closeNP);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !np.hidden) closeNP(); });
  // drag the artwork / header down to dismiss
  let ny0 = null;
  np.addEventListener('pointerdown', e => { if (e.target.closest('button, .scrub, .lyrics')) return; ny0 = e.clientY; });
  np.addEventListener('pointermove', e => { if (ny0 == null || !G) return; G.set(np, { y: Math.max(0, e.clientY - ny0) }); });
  np.addEventListener('pointerup', e => { if (ny0 == null) return; const dy = e.clientY - ny0; ny0 = null; if (!G) return; if (dy > 120) { G.set(np, { y: 0 }); closeNP(); } else G.to(np, { y: 0, duration: .5, ease: 'elastic.out(1, .7)' }); });

  /* ---------- library + me ---------- */
  function renderLib() {
    const lib = $('#lib'); lib.replaceChildren();
    $('#libN').textContent = saved.size + ' saved';
    if (!saved.size) { lib.append(el('p', 'lib-empty', 'Swipe right on a story to save it here.')); return; }
    [...saved].reverse().forEach(id => {
      const s = byId(id); const b = el('button', 'lib-row'); b.type = 'button';
      const img = el('img'); img.src = s.img; img.alt = '';
      const mid = el('div'); mid.append(el('b', null, s.title), el('small', null, `${s.by} · ${Math.round(s.dur / 60)} min`));
      const pl = el('span', 'pl'); const sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('width', '16'); sv.setAttribute('height', '16'); sv.setAttribute('viewBox', '0 0 24 24'); const pp = document.createElementNS('http://www.w3.org/2000/svg', 'path'); pp.setAttribute('d', playPath); pp.setAttribute('fill', '#0D0B14'); sv.append(pp); pl.append(sv);
      b.append(img, mid, pl); b.addEventListener('click', () => load(s, true)); lib.append(b);
    });
  }
  const mb = $('#minsBars');
  [22, 40, 18, 55, 34, 60, 48, 30, 66, 52, 38, 70].forEach(v => { const i = el('i'); i.style.cssText = `flex:1;border-radius:4px;background:linear-gradient(180deg,#EC4899,#6366F1);height:${v}%`; mb.append(i); });

  /* ---------- tabs ---------- */
  const views = { discover: $('#v-discover'), library: $('#v-library'), me: $('#v-me') };
  const order = ['discover', 'library', 'me'];
  let cur = 'discover';
  function go(v) {
    if (v === cur) return;
    const dir = order.indexOf(v) > order.indexOf(cur) ? 1 : -1, from = views[cur], to = views[v];
    $$('.tabbar button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === v)));
    to.hidden = false; to.scrollTop = 0;
    if (G) { G.fromTo(to, { xPercent: 15 * dir, opacity: 0 }, { xPercent: 0, opacity: 1, duration: .45, ease: 'power3.out' }); G.to(from, { xPercent: -10 * dir, opacity: 0, duration: .25, onComplete: () => { from.hidden = true; G.set(from, { xPercent: 0, opacity: 1 }); } }); }
    else from.hidden = true;
    cur = v; haptic(5);
    if (v === 'library') { renderLib(); if (saved.size > 1 || [...saved].some(id => id !== 'quiet')) check('library'); if (G) G.from('#lib > *', { y: 14, opacity: 0, duration: .4, stagger: .05 }); }
    if (v === 'me' && G) G.from('#minsBars i', { scaleY: 0, transformOrigin: 'bottom', duration: .6, stagger: .03, ease: 'back.out(1.6)' });
  }
  $$('.tabbar button').forEach(b => b.addEventListener('click', () => { if (!np.hidden) closeNP(); go(b.dataset.v); }));
  $$('[data-jump]').forEach(b => b.addEventListener('click', () => {
    if (document.documentElement.clientWidth <= 1180) stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    const j = b.dataset.jump;
    if (j === 'play') { if (!P.s) load(byId(queue[0] || 'wharf'), true); setTimeout(openNP, 200); } else { if (!np.hidden) closeNP(); go(j); }
  }));

  /* ---------- boot ---------- */
  renderStack(); renderLib();
  if (G) {
    G.from('#device', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' });
    G.from('.side', { y: 30, opacity: 0, duration: 1, stagger: .15, ease: 'expo.out', delay: .2 });
    G.from('.scard', { y: 80, opacity: 0, duration: .9, stagger: .1, ease: 'back.out(1.4)', delay: .5 });
    // hint: the top card wiggles once so people know it can be dragged
    G.delayedCall(2.2, () => { const c = topCard(); if (c) G.timeline().to(c, { x: 34, rotation: 3, duration: .35, ease: 'power2.out' }).to(c, { x: 0, rotation: 0, duration: .8, ease: 'elastic.out(1, .4)' }); });
  }
  window.addEventListener('pagehide', () => { if (A.ctx) A.ctx.close(); });
})();
