/* Driftwood Films — 35mm filmstrip, storyboard toggle & director's commentary (Bazozo Studio) */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  $('#year').textContent = new Date().getFullYear();
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  /* ---------- nav + sprocket menu ---------- */
  const nav = $('#nav'), btn = $('#menuBtn'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    if (open && hasGsap && !reduced) { gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: .35 }); gsap.from('.menu a', { x: -40, opacity: 0, duration: .7, stagger: .07, ease: 'expo.out' }); }
  }
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); btn.focus(); } });

  /* ---------- the film: eight frames ---------- */
  const FRAMES = [
    { src: '../images/terranovafarms.jpg', title: 'Barley at first light', tc: '00:01:12', alt: 'Barley field at sunrise with soft golden haze', note: 'EXT. FIELD – DAWN. Slow push in, hold on the light.', focus: '50% 60%' },
    { src: '../images/kettleash.jpg', title: 'Hands at the roaster', tc: '00:09:40', alt: 'Hands cupping freshly roasted coffee beans over the roaster', note: 'INS. HANDS. Top-down, let the beans fall out of frame.', focus: '50% 45%' },
    { src: '../images/castironcoffee.jpg', title: 'The café opens', tc: '00:18:05', alt: 'A café counter with tiled walls, shelves of bottles and a barista at the espresso machine', note: 'INT. CAFÉ – MORNING. Locked off, one take, 40 min.', focus: '55% 55%' },
    { src: '../images/nordlysarchitect.jpg', title: 'Warehouses on the river', tc: '00:27:31', alt: 'Colourful timber warehouses on stilts reflected in a river', note: 'EXT. RIVER – OVERCAST. Wait for the break in cloud.', focus: '70% 50%' },
    { src: '../images/thequietroom.jpg', title: 'Before the interview', tc: '00:41:18', alt: 'A quiet living room with a ceramic vase and incense in the foreground, a woman sitting cross-legged behind', note: 'INT. HOUSE. Rack focus vase → subject. Room tone only.', focus: '45% 55%' },
    { src: '../images/saltcedar.jpg', title: 'The harvest supper', tc: '00:58:44', alt: 'A layered yellow potato dish with egg and tomato on a blue plate, a fork reaching in', note: 'INS. TABLE – NIGHT. Practical light only, warm.', focus: '50% 50%' },
    { src: '../images/driftwoodfilms.jpg', title: 'Reconstructing the evening', tc: '01:06:20', alt: 'Film set with a director, a boom microphone and two actors under red light', note: 'INT. SET. Show the crew. Break the fourth wall.', focus: '55% 50%' },
    { src: '../images/hollowpoint.jpg', title: 'Mixing the score', tc: '01:19:02', alt: 'An engineer’s hands on the faders of a mixing desk', note: 'INT. STUDIO. Faders up as the credits start.', focus: '55% 50%' }
  ];
  const film = $('#film');
  const frames = FRAMES.map((F, i) => {
    const fr = el('figure', 'frame');
    const inner = el('div', 'frame-in');
    const fin = el('div', 'face final'); const img = el('img'); img.src = F.src; img.alt = F.alt; img.loading = 'lazy'; img.style.objectPosition = F.focus; img.width = 640; img.height = 346;
    fin.append(img, el('span', 'num', `${String(i + 1).padStart(2, '0')} · ${F.tc}`));
    const board = el('div', 'face board'); board.setAttribute('aria-hidden', 'true');
    const cv = el('canvas'); cv.width = 640; cv.height = 346;
    board.append(cv, el('span', 'num', `PANEL ${i + 1}`), el('span', 'note', F.note));
    inner.append(fin, board);
    const cap = el('figcaption', 'cap'); cap.append(el('b', null, F.title), el('span', null, `Frame ${String(i + 1).padStart(2, '0')}`));
    fr.append(inner, cap);
    film.append(fr);
    return { fr, inner, img, cv, F };
  });
  const code = '◄ DRIFTWOOD 5219 · 24 ▪ KODAK VISION3 · ';
  $('#edgeT').textContent = code.repeat(30); $('#edgeB').textContent = code.split('').reverse().join('').repeat(30);

  /* storyboard panels: pencil sketches generated from each frame (edge detection + hatching) */
  function sketch(f) {
    const { cv, F } = f, ctx = cv.getContext('2d', { willReadFrequently: true }), W = cv.width, H = cv.height;
    const img = new Image();
    img.onload = () => {
      const s = Math.max(W / img.naturalWidth, H / img.naturalHeight), dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      const [fx, fy] = F.focus.split(' ').map(v => parseFloat(v) / 100);
      ctx.drawImage(img, (W - dw) * fx, (H - dh) * fy, dw, dh);
      let d;
      try { d = ctx.getImageData(0, 0, W, H); } catch (e) {
        ctx.filter = 'grayscale(1) contrast(2.4) brightness(1.35)'; ctx.drawImage(cv, 0, 0); return; // blocked: approximate
      }
      const g = new Float32Array(W * H);
      for (let i = 0; i < W * H; i++) g[i] = (.3 * d.data[i * 4] + .59 * d.data[i * 4 + 1] + .11 * d.data[i * 4 + 2]) / 255;
      const out = ctx.createImageData(W, H), o = out.data;
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        const gx = -g[i - W - 1] - 2 * g[i - 1] - g[i + W - 1] + g[i - W + 1] + 2 * g[i + 1] + g[i + W + 1];
        const gy = -g[i - W - 1] - 2 * g[i - W] - g[i - W + 1] + g[i + W - 1] + 2 * g[i + W] + g[i + W + 1];
        let v = 1 - Math.min(1, Math.hypot(gx, gy) * 2.2);           // pencil outline
        const dark = 1 - g[i];
        if (dark > .55 && (x + y) % 6 === 0) v -= (dark - .55) * 1.6;  // cross-hatch the shadows
        if (dark > .75 && (x - y + 600) % 6 === 0) v -= (dark - .75) * 1.8;
        v = Math.max(0, Math.min(1, v));
        const p = i * 4; o[p] = 60 + v * 177; o[p + 1] = 52 + v * 178; o[p + 2] = 44 + v * 172; o[p + 3] = 255;
      }
      ctx.putImageData(out, 0, 0);
    };
    img.src = F.src;
  }
  frames.forEach(sketch);

  /* storyboard ⇄ final toggle: each frame flips like a card */
  let view = 'final';
  $$('.toggle button').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.v === view) return; view = b.dataset.v;
    $$('.toggle button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const deg = view === 'board' ? 180 : 0;
    if (hasGsap && !reduced) gsap.to(frames.map(f => f.inner), { rotateY: deg, duration: .9, stagger: .06, ease: 'power3.inOut' });
    else frames.forEach(f => { f.inner.style.transform = `rotateY(${deg}deg)`; });
  }));

  /* ---------- director's commentary ---------- */
  const LINES = [
    { f: 1, text: 'We started filming in the barley at five in the morning, because that is when the valley actually wakes up.' },
    { f: 2, text: 'Most of this film is hands. Hands roasting, hands pouring, hands fixing things. The faces come later.' },
    { f: 3, text: 'The café scene is one take. We put the camera on the counter and did not touch it for forty minutes.' },
    { f: 4, text: 'The river warehouses were the hardest to light. We waited three days for the cloud to break.' },
    { f: 5, text: 'In the edit we cut almost all of the music. In the quiet scenes, the room tone is doing the work.' },
    { f: 8, text: 'The score was mixed in a single weekend, with the composer sitting right next to the editor.' }
  ];
  const wordsDur = t => t.split(/\s+/).length / 2.55 + .7; // seconds, at a calm reading pace
  let acc = 0;
  LINES.forEach(L => { L.start = acc; L.dur = wordsDur(L.text); acc += L.dur; });
  const TOTAL = acc;
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  $('#tDur').textContent = fmt(TOTAL);
  const linesEl = $('#lines');
  LINES.forEach((L, i) => {
    const li = el('li'); const b = el('button'); b.type = 'button';
    b.append(el('span', null, fmt(L.start)), document.createTextNode(L.text));
    b.addEventListener('click', () => { P.idx = i; P.pos = L.start; startLine(true); });
    li.append(b); linesEl.append(li);
  });

  // waveform: speech-like syllable bumps per line, gaps between lines
  const wave = $('#wave'), wctx = wave.getContext('2d'), BARS = 180;
  const amp = new Float32Array(BARS);
  (() => { let x = 7; const r = () => { x = (x * 9301 + 49297) % 233280; return x / 233280; };
    for (let i = 0; i < BARS; i++) {
      const t = i / BARS * TOTAL, L = LINES.find(l => t >= l.start && t < l.start + l.dur);
      const inLine = L ? (t - L.start) / L.dur : 0;
      const edge = L ? Math.min(1, inLine * 8, (1 - inLine) * 6) : 0;
      amp[i] = L ? Math.max(.06, (.3 + .7 * Math.abs(Math.sin(t * 5.3 + r() * 2)) * (.5 + r() * .5)) * edge) : .04;
    } })();
  function drawWave() {
    const W = wave.width, H = wave.height, bw = W / BARS, ph = P.pos / TOTAL;
    wctx.clearRect(0, 0, W, H);
    for (let i = 0; i < BARS; i++) {
      const h = amp[i] * H * .42;
      wctx.fillStyle = i / BARS <= ph ? '#E09F3E' : 'rgba(232,223,209,.28)';
      wctx.fillRect(i * bw + 1, H / 2 - h, Math.max(1, bw - 2), h * 2);
    }
    LINES.forEach(L => { wctx.fillStyle = 'rgba(232,223,209,.18)'; wctx.fillRect(L.start / TOTAL * W, 0, 1, H); });
  }

  const P = { playing: false, idx: 0, pos: 0, lineT0: 0, timer: null };
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let voice = null;
  const pickVoice = () => { if (!synth) return; const v = synth.getVoices(); voice = v.find(x => /en-GB/i.test(x.lang) && /female|libby|sonia|kate|serena/i.test(x.name)) || v.find(x => /^en/i.test(x.lang)) || null; };
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }
  if (!synth) $('#pNote').textContent = 'Your browser has no speech voice, so the commentary plays as captions.';

  function showLine(i) {
    const L = LINES[i];
    $('#capWho').textContent = `Mara Lind · Frame ${String(L.f).padStart(2, '0')}`;
    $('#capText').textContent = L.text;
    $$('#lines li').forEach((li, j) => li.classList.toggle('on', j === i));
    if (hasGsap && !reduced) gsap.from('#capText', { opacity: 0, y: 8, duration: .5, ease: 'power2.out' });
  }
  function startLine(fromClick) {
    clearTimeout(P.timer); if (synth) synth.cancel();
    const i = P.idx; if (i >= LINES.length) return stop(true);
    const L = LINES[i];
    P.pos = L.start; P.lineT0 = performance.now(); P.playing = true; setIcon();
    showLine(i);
    const next = () => { if (!P.playing || P.idx !== i) return; P.idx = i + 1; startLine(); };
    if (synth) {
      const u = new SpeechSynthesisUtterance(L.text); if (voice) u.voice = voice; u.rate = .95; u.pitch = 1;
      u.onend = next; u.onerror = () => { P.timer = setTimeout(next, L.dur * 1000); };
      synth.speak(u);
      P.timer = setTimeout(next, (L.dur + 6) * 1000); // safety net if a voice never fires onend
    } else P.timer = setTimeout(next, L.dur * 1000);
    if (fromClick) document.getElementById('commentary').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
  }
  function stop(done) {
    P.playing = false; clearTimeout(P.timer); if (synth) synth.cancel(); setIcon();
    if (done) { P.idx = 0; P.pos = TOTAL; }
  }
  function setIcon() {
    const path = $('#playIcon path');
    path.setAttribute('d', P.playing ? 'M6 4.5h4v15H6zM14 4.5h4v15h-4z' : 'M7 4.5v15l13-7.5z');
    $('#playBtn').setAttribute('aria-label', P.playing ? 'Pause commentary' : 'Play commentary');
  }
  $('#playBtn').addEventListener('click', () => {
    if (P.playing) { stop(false); return; }
    if (P.idx >= LINES.length) P.idx = 0;
    startLine();
  });
  wave.addEventListener('click', e => {
    const r = wave.getBoundingClientRect(), t = (e.clientX - r.left) / r.width * TOTAL;
    P.idx = Math.max(0, LINES.findIndex(L => t < L.start + L.dur)); startLine();
  });
  window.addEventListener('pagehide', () => { if (synth) synth.cancel(); });

  const spin = $('#reelSpin'); let ang = 0, last = performance.now();
  (function tick(now) {
    const dt = (now - last) / 1000; last = now;
    if (P.playing) {
      const L = LINES[P.idx];
      if (L) P.pos = Math.min(L.start + L.dur * .98, L.start + (now - P.lineT0) / 1000);
      ang += dt * 90; spin.setAttribute('transform', `rotate(${ang.toFixed(1)} 100 100)`);
    }
    $('#tNow').textContent = fmt(Math.min(P.pos, TOTAL));
    drawWave();
    requestAnimationFrame(tick);
  })(last);

  /* ---------- GSAP: smooth scroll, pinned filmstrip ---------- */
  if (!hasGsap) { $$('.rv').forEach(n => { n.style.opacity = 1; n.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (reduced) { gsap.set('.rv', { opacity: 1, y: 0 }); return; }

  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.3, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = document.querySelector(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: id === '#reel' ? 0 : -70 });
    }));
  }

  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero h1 .ln > span', { yPercent: 110, duration: 1.4, stagger: .12 })
    .from('#heroImg img', { scale: 1.2, duration: 2.4 }, 0)
    .from('.rv-h', { y: 22, opacity: 0, duration: 1, stagger: .1 }, .5);
  gsap.to('#heroImg img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  const track = $('#track');
  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const strip = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: '#reel', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: self => {
        $('#progBar').style.transform = `scaleX(${self.progress})`;
        $('#frameOut').textContent = `Frame ${String(Math.min(8, Math.floor(self.progress * 8) + 1)).padStart(2, '0')} / 08`;
      }
    }
  });
  // each frame drifts slightly inside its gate, like film moving through a projector
  frames.forEach(f => gsap.fromTo(f.img, { xPercent: -4, scale: 1.1 }, { xPercent: 4, scale: 1.1, ease: 'none',
    scrollTrigger: { trigger: f.fr, containerAnimation: strip, start: 'left right', end: 'right left', scrub: true } }));
  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .1 }) });
})();
