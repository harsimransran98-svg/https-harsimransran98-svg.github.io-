/* NoteBeam — interactive Pixel productivity prototype (Bazozo Studio). DOM built with textContent only. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const haptic = (p = 8) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- fit + clock ---------- */
  const stage = $('#stage'), screen = $('#screen');
  const scale = () => parseFloat(getComputedStyle(stage).getPropertyValue('--s')) || 1;
  function fit() {
    const vw = document.documentElement.clientWidth, wide = vw > 1180;
    stage.style.setProperty('--s', Math.max(.55, Math.min(1, wide ? (window.innerHeight - 110) / 840 : 1, (vw - 32) / 396)).toFixed(3));
  }
  window.addEventListener('resize', fit); fit();
  const tick = () => { const d = new Date(); $('#clock').textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };
  tick(); setInterval(tick, 15000);
  $('#dateLbl').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' }).toLowerCase();

  /* ---------- checklist + snackbar ---------- */
  const done = new Set();
  function check(k) { if (done.has(k)) return; done.add(k); const li = $(`#tryList [data-t="${k}"]`); if (li) li.classList.add('done'); $('#tryCount').textContent = `${done.size}/5`; $('#tryBar').style.width = (done.size * 20) + '%'; }
  const snack = $('#snack');
  function say(msg) {
    snack.textContent = msg;
    if (G) { G.killTweensOf(snack); G.fromTo(snack, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'back.out(1.6)' }); G.to(snack, { y: 16, opacity: 0, duration: .3, delay: 2.2 }); }
    else { snack.style.opacity = 1; setTimeout(() => { snack.style.opacity = 0; }, 2400); }
  }

  /* ---------- board ---------- */
  let uid = 0;
  const T = (t, tag, tc, due, col) => ({ id: ++uid, t, tag, tc, due, col, done: col === 2 });
  let tasks = [
    T('Review the onboarding copy', 'design', '', 'today', 0),
    T('Reply to Leo about the API limits', 'email', 'o', '11:00', 0),
    T('Draft the Q3 roadmap one-pager', 'planning', '', 'today', 0),
    T('30 min walk, no phone', 'health', 'g', 'evening', 0),
    T('Fix the login flicker on Android 15', 'bug', 'o', 'today', 1),
    T('Prep slides for Thursday sync', 'work', '', 'tomorrow', 1),
    T('Morning journaling', 'habit', 'g', 'done', 2)
  ];
  const lists = [$('#L0'), $('#L1'), $('#L2')];
  function card(t) {
    const c = el('div', 'task' + (t.done ? ' done' : '')); c.dataset.id = t.id;
    const cb = el('button', 'cb'); cb.type = 'button'; cb.setAttribute('role', 'checkbox'); cb.setAttribute('aria-checked', String(t.done)); cb.setAttribute('aria-label', (t.done ? 'Mark not done: ' : 'Mark done: ') + t.t);
    const tt = el('div', 'tt'); tt.append(el('b', null, t.t));
    const meta = el('div', 'meta'); meta.append(el('span', 'tag ' + (t.tc || ''), t.tag), el('span', 'due', t.due));
    if (t.col === 0) { const mv = el('button', 'move', 'start →'); mv.type = 'button'; mv.setAttribute('aria-label', 'Move to Doing: ' + t.t); mv.addEventListener('click', () => moveTo(t, 1, c)); meta.append(mv); }
    tt.append(meta); c.append(cb, tt);
    cb.addEventListener('click', () => toggle(t, c, cb));
    return c;
  }
  function render() {
    lists.forEach(l => l.replaceChildren());
    tasks.forEach(t => lists[t.col].append(card(t)));
    [0, 1, 2].forEach(i => { $('#c' + i).textContent = tasks.filter(t => t.col === i).length; });
    const total = tasks.length, d = tasks.filter(t => t.done).length;
    $('#ringN').textContent = `${d}/${total}`;
    $('#ringArc').style.strokeDashoffset = (138.2 * (1 - d / total)).toFixed(1);
    $('#progS').textContent = `${d} of ${total} done today`;
    $('#progT').textContent = d === total ? 'All clear. Go outside.' : d / total > .5 ? 'Over halfway there' : d ? 'Good momentum' : 'Let\'s get going';
  }
  function confetti(from) {
    if (!G) return;
    const s = scale(), sr = screen.getBoundingClientRect(), r = from.getBoundingClientRect();
    const x = (r.left + r.width / 2 - sr.left) / s, y = (r.top + r.height / 2 - sr.top) / s;
    const cols = ['#4F46E5', '#818CF8', '#F97316', '#22C55E', '#EAB308', '#EC4899'];
    for (let i = 0; i < 26; i++) {
      const p = el('span', 'confetti'); p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.background = cols[i % cols.length];
      screen.append(p);
      const a = Math.random() * Math.PI * 2, v = 50 + Math.random() * 90;
      G.timeline({ onComplete: () => p.remove() })
        .to(p, { x: Math.cos(a) * v, duration: 1.1, ease: 'power2.out' }, 0)
        .to(p, { y: Math.sin(a) * v - 60, duration: .45, ease: 'power2.out' }, 0)
        .to(p, { y: '+=140', duration: .7, ease: 'power2.in' }, .45)
        .to(p, { rotation: Math.random() * 720 - 360, opacity: 0, duration: 1.15, ease: 'none' }, 0);
    }
  }
  function moveTo(t, col, node) {
    const go = () => { t.col = col; t.done = col === 2; render(); const n = lists[col].querySelector(`[data-id="${t.id}"]`); if (n && G) G.from(n, { scale: .85, opacity: 0, duration: .55, ease: 'back.out(2)' }); };
    haptic(6);
    if (G && node) G.to(node, { height: 0, paddingTop: 0, paddingBottom: 0, marginBottom: 0, opacity: 0, scale: .95, duration: .3, ease: 'power2.in', onComplete: go }); else go();
  }
  function toggle(t, node, cb) {
    if (!t.done) {
      t.done = true; node.classList.add('done'); cb.setAttribute('aria-checked', 'true');
      confetti(cb); haptic([10, 30, 16]); check('check');
      if (G) G.fromTo(cb, { scale: .6 }, { scale: 1, duration: .6, ease: 'elastic.out(1.2, .4)' });
      setTimeout(() => moveTo(t, 2, node), 520);
      const left = tasks.filter(x => !x.done).length;
      say(left ? `Nice. ${left} to go.` : 'Everything done. Streak saved.');
      if (!left) { $('#streakN').textContent = '13'; if (G) G.fromTo('.streak b', { scale: 1.5 }, { scale: 1, duration: .7, ease: 'elastic.out(1, .4)' }); }
    } else { t.done = false; moveTo(t, 0, node); }
  }
  $('#addForm').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#addIn').value.trim().slice(0, 60); if (!v) return;
    tasks.unshift(T(v, 'inbox', '', 'today', 0)); $('#addIn').value = '';
    render(); check('add'); haptic(8);
    const n = lists[0].firstElementChild; if (n && G) G.from(n, { y: -16, opacity: 0, duration: .5, ease: 'back.out(2)' });
  });
  // column chips scroll the board; scrolling updates the chips
  const board = $('#board'), cols = $$('.col');
  $$('.colnav button').forEach(b => b.addEventListener('click', () => { board.scrollTo({ left: cols[+b.dataset.c].offsetLeft - 18, behavior: reduced ? 'auto' : 'smooth' }); haptic(4); }));
  board.addEventListener('scroll', () => {
    const i = Math.round(board.scrollLeft / (cols[1].offsetLeft - cols[0].offsetLeft));
    $$('.colnav button').forEach((b, j) => b.setAttribute('aria-pressed', String(j === Math.min(2, i))));
  }, { passive: true });

  /* ---------- voice recorder (simulated audio) ---------- */
  const SCRIPT = 'Okay, quick brain dump. Send the Q3 deck to Priya by Thursday. Book the dentist sometime next week. The team retro moved to Friday at three, so tell Leo. And buy oat milk on the way home.';
  const words = SCRIPT.split(' ');
  const R = { on: false, t0: 0, elapsed: 0, w: 0, timer: null, level: 0 };
  const wave = $('#wave'), wctx = wave.getContext('2d');
  const bars = new Array(68).fill(.04);
  function drawWave() {
    const W = wave.width, H = wave.height, bw = W / bars.length, dark = screen.classList.contains('dark');
    wctx.clearRect(0, 0, W, H);
    bars.forEach((v, i) => {
      const h = Math.max(4, v * H * .9), x = i * bw + bw * .2;
      wctx.fillStyle = R.on ? (i > bars.length - 6 ? '#EF4444' : '#4F46E5') : (dark ? '#3F3F46' : '#D4D4D8');
      const r = Math.min(bw * .3, 5);
      wctx.beginPath(); wctx.roundRect ? wctx.roundRect(x, (H - h) / 2, bw * .6, h, r) : wctx.rect(x, (H - h) / 2, bw * .6, h); wctx.fill();
    });
  }
  let lastBar = 0;
  function loop(now) {
    if (R.on) {
      R.elapsed = (now - R.t0) / 1000;
      const s = Math.floor(R.elapsed);
      $('#recTime').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      if (now - lastBar > 55) {
        lastBar = now;
        // speech-like envelope: syllable bursts with pauses at punctuation
        const word = words[Math.min(words.length - 1, R.w)] || '';
        const pause = /[.,]$/.test(word) && (now % 900) > 500;
        const syl = Math.abs(Math.sin(now / 95)) * .6 + Math.random() * .4;
        bars.push(pause ? .05 + Math.random() * .05 : .15 + syl * .8); bars.shift();
      }
    } else if (now - lastBar > 60) { lastBar = now; bars.push(.03 + Math.random() * .03); bars.shift(); }
    drawWave();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  const tText = $('#tText');
  function startRec() {
    R.on = true; R.t0 = performance.now(); R.w = 0;
    $('#micBtn').classList.add('on'); $('#micBtn').setAttribute('aria-pressed', 'true'); $('#micBtn').setAttribute('aria-label', 'Stop recording');
    $('#micIc').replaceChildren(); const sq = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); sq.setAttribute('x', '7'); sq.setAttribute('y', '7'); sq.setAttribute('width', '10'); sq.setAttribute('height', '10'); sq.setAttribute('rx', '2'); sq.setAttribute('fill', 'currentColor'); $('#micIc').append(sq);
    $('#recState').replaceChildren(el('i'), document.createTextNode('Recording · on-device'));
    $('#micHint').textContent = 'Tap the square to stop';
    $('#transcript').hidden = false; $('#aiCard').hidden = true; tText.replaceChildren();
    words.forEach(w => { const s = el('span', 'w', w + ' '); tText.append(s); });
    haptic(15);
    R.timer = setInterval(() => {
      const s = tText.children[R.w]; if (s) { s.style.opacity = 1; if (G) G.from(s, { y: 6, filter: 'blur(4px)', duration: .3 }); }
      R.w++; if (R.w >= words.length) stopRec();
    }, 260);
  }
  function stopRec() {
    if (!R.on) return;
    R.on = false; clearInterval(R.timer);
    $$('#tText .w').forEach(s => { s.style.opacity = 1; });
    $('#micBtn').classList.remove('on'); $('#micBtn').setAttribute('aria-pressed', 'false'); $('#micBtn').setAttribute('aria-label', 'Start recording');
    $('#micIc').replaceChildren(); [['rect', { x: 9, y: 2, width: 6, height: 12, rx: 3 }], ['path', { d: 'M5 10a7 7 0 0 0 14 0M12 17v5' }]].forEach(([t, a]) => { const n = document.createElementNS('http://www.w3.org/2000/svg', t); for (const k in a) n.setAttribute(k, a[k]); $('#micIc').append(n); });
    $('#recState').textContent = 'Saved · summarising…'; $('#micHint').textContent = 'Tap to record again';
    haptic([10, 40, 10]); check('record'); summarise();
  }
  $('#micBtn').addEventListener('click', () => { if (G) G.fromTo('#micBtn', { scale: .88 }, { scale: 1, duration: .6, ease: 'elastic.out(1, .4)' }); R.on ? stopRec() : startRec(); });

  const EXTRACT = [['Send Q3 deck to Priya', 'Thu'], ['Book dentist appointment', 'next wk'], ['Tell Leo: retro moved to Fri 3pm', 'today'], ['Buy oat milk', 'tonight']];
  let sent = false;
  function summarise() {
    const ai = $('#aiCard'), body = $('#aiBody'); ai.hidden = false; sent = false;
    body.replaceChildren(el('div', 'shimmer'), el('div', 'shimmer'), el('div', 'shimmer'));
    body.children[1].style.width = '80%'; body.children[2].style.width = '60%';
    if (G) G.from(ai, { y: 20, opacity: 0, duration: .5, ease: 'back.out(1.6)' });
    setTimeout(() => {
      body.replaceChildren();
      const h = el('h4', null, 'Q3 deck, dentist & retro');
      const ul = el('ul'); EXTRACT.forEach(([t, d]) => { const li = el('li', null, t + ' '); li.append(el('span', 'due', '· ' + d)); ul.append(li); });
      const b = el('button', 'ai-btn', `Add ${EXTRACT.length} tasks to board`); b.type = 'button';
      b.addEventListener('click', () => {
        if (sent) return; sent = true; b.disabled = true; b.textContent = 'Added ✓';
        EXTRACT.slice().reverse().forEach(([t, d]) => tasks.unshift(T(t, 'AI', 'tai', d, 0)));
        render(); check('ai'); haptic([8, 30, 12]);
        setTimeout(() => { go('board'); board.scrollTo({ left: 0 }); if (G) G.from(lists[0].children, { x: -30, opacity: 0, duration: .5, stagger: .06, ease: 'back.out(1.8)', delay: .3 }); say('4 tasks added from your voice note'); }, 400);
      });
      body.append(h, ul, b);
      if (G) G.from(body.children, { y: 10, opacity: 0, duration: .4, stagger: .08 });
      $('#recState').textContent = `Saved · ${$('#recTime').textContent}`;
      addNote('Q3 deck, dentist & retro', 'Send the Q3 deck to Priya by Thursday, book the dentist, retro moved to Friday at 3…', $('#recTime').textContent, true);
    }, 1700);
  }

  /* ---------- notes ---------- */
  const notesEl = $('#notes');
  function addNote(title, text, dur, top) {
    const n = el('article', 'note'); const m = el('div', 'meta');
    m.append(el('span', 'tag' + (dur ? ' tai' : ''), dur ? '✦ voice · ' + dur : 'text'), el('span', 'due', top ? 'just now' : 'yesterday'));
    n.append(el('b', null, title), el('p', null, text), m);
    top ? notesEl.prepend(n) : notesEl.append(n);
  }
  addNote('Standup notes', 'Login flicker is a Compose recomposition issue. Leo owns the fix; ship in 2.4.1.', '01:12');
  addNote('Gift ideas', 'Priya: the ceramic pour-over. Mum: the gardening course, not another candle.', null);
  addNote('Book list', 'Four Thousand Weeks, The Making of a Manager, Piranesi.', null);

  /* ---------- dark mode with a circular wipe ---------- */
  const modeBtn = $('#modeBtn'), wipe = $('#wipe');
  function setDark(on) {
    const apply = () => {
      screen.classList.toggle('dark', on);
      modeBtn.setAttribute('aria-label', on ? 'Switch to light mode' : 'Switch to dark mode');
      $('#modeIc').replaceChildren();
      const p = document.createElementNS('http://www.w3.org/2000/svg', on ? 'circle' : 'path');
      if (on) { p.setAttribute('cx', '12'); p.setAttribute('cy', '12'); p.setAttribute('r', '5'); } else p.setAttribute('d', 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z');
      $('#modeIc').append(p);
      if (on) { const r = document.createElementNS('http://www.w3.org/2000/svg', 'path'); r.setAttribute('d', 'M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1'); $('#modeIc').append(r); }
    };
    haptic(10); if (on) check('dark');
    if (!G) { apply(); return; }
    const s = scale(), sr = screen.getBoundingClientRect(), r = modeBtn.getBoundingClientRect();
    const x = (r.left + r.width / 2 - sr.left) / s, y = (r.top + r.height / 2 - sr.top) / s;
    wipe.style.background = on ? '#09090B' : '#FAFAFA';
    G.timeline()
      .fromTo(wipe, { clipPath: `circle(0px at ${x}px ${y}px)`, opacity: 1 }, { clipPath: `circle(900px at ${x}px ${y}px)`, duration: .55, ease: 'power3.in' })
      .add(apply)
      .to(wipe, { opacity: 0, duration: .25 })
      .set(wipe, { clipPath: 'circle(0px at 0 0)' });
  }
  modeBtn.addEventListener('click', () => setDark(!screen.classList.contains('dark')));

  /* ---------- navigation ---------- */
  const views = { board: $('#v-board'), record: $('#v-record'), notes: $('#v-notes') };
  const order = ['board', 'record', 'notes'];
  let cur = 'board';
  function go(v) {
    if (v === cur) return;
    const i = order.indexOf(v), dir = i > order.indexOf(cur) ? 1 : -1, from = views[cur], to = views[v];
    $$('.navbar button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.v === v)));
    $('#navInd').style.transform = `translateX(calc(${i * 100}% + ${i * 4}px))`;
    to.hidden = false; to.scrollTop = 0;
    if (G) { G.fromTo(to, { x: 30 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: .4, ease: 'expo.out' }); G.to(from, { x: -24 * dir, opacity: 0, duration: .2, onComplete: () => { from.hidden = true; G.set(from, { x: 0, opacity: 1 }); } }); }
    else from.hidden = true;
    cur = v; haptic(5);
    if (v !== 'record' && R.on) stopRec();
    if (v === 'notes' && G) G.from(notesEl.children, { y: 16, opacity: 0, duration: .4, stagger: .05 });
  }
  $$('.navbar button').forEach(b => b.addEventListener('click', () => go(b.dataset.v)));
  $$('[data-jump]').forEach(b => b.addEventListener('click', () => {
    if (document.documentElement.clientWidth <= 1180) stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    if (b.dataset.jump === 'dark') setDark(!screen.classList.contains('dark')); else go(b.dataset.jump);
  }));

  /* ---------- boot ---------- */
  render();
  if (G) {
    G.from('#device', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out' });
    G.from('.side', { y: 30, opacity: 0, duration: 1, stagger: .15, ease: 'expo.out', delay: .2 });
    G.from('#v-board .task', { y: 20, opacity: 0, duration: .5, stagger: .05, ease: 'back.out(1.6)', delay: .5 });
  }
})();
