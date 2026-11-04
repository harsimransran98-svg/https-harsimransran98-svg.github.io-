/* Bazozo Arcade Kit — tiny shared engine for the playable game case studies.
   60fps requestAnimationFrame loop, score + high score (localStorage), particles,
   floating text, screen shake, WebAudio sound, pause, and unified touch/mouse/keyboard input.
   Each game supplies its own rules in its own .js file via Arcade.start({...}).
   No innerHTML anywhere: all text goes through textContent. */
(() => {
  const $ = id => document.getElementById(id);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} }
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function start(cfg) {
    const cv = $('game'), ctx = cv.getContext('2d');
    const W = cfg.W || 360, H = cfg.H || 640;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rootCss = getComputedStyle(document.documentElement);
    cfg.font = cfg.font || rootCss.getPropertyValue('--gfont').trim() || 'sans-serif';
    const key = 'bz_hs_' + cfg.id;
    const g = {
      W, H, ctx, cfg, t: 0, score: 0, mult: 1, state: 'title', data: {},
      best: store.get(key, 0), keys: new Set(), ptr: { x: W / 2, y: H / 2, down: false },
      parts: [], texts: [], shakeT: 0, shakeA: 0, muted: store.get('bz_mute', false), plays: store.get(key + '_n', 0),
      font: cfg.font, fw: rootCss.getPropertyValue('--gfw').trim() || '700',
      rnd: (a, b) => a + Math.random() * (b - a),
      pick: arr => arr[Math.floor(Math.random() * arr.length)],
      clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
      store
    };

    /* ---------- HUD ---------- */
    const hScore = $('hScore'), hBest = $('hBest'), hMult = $('hMult');
    let shownScore = 0;
    function hud() {
      if (hBest) hBest.textContent = Math.max(g.best, g.score).toLocaleString();
      if (hMult) { hMult.textContent = '×' + (Math.round(g.mult * 10) / 10); hMult.parentElement.classList.toggle('hot', g.mult > 1); }
    }
    g.add = (n, x, y, color) => {
      const v = Math.round(n * g.mult); g.score += v;
      if (x != null && v) g.text('+' + v, x, y, color);
      hud();
      if (hScore && hScore.parentElement && !reduced) { hScore.parentElement.classList.remove('pop'); void hScore.offsetWidth; hScore.parentElement.classList.add('pop'); }
      return v;
    };
    g.setScore = v => { g.score = v; hud(); };
    g.setMult = m => { g.mult = m; hud(); };

    /* ---------- effects ---------- */
    g.burst = (x, y, color, n = 18, speed = 180, life = .6, size = 3) => {
      if (reduced) n = Math.min(n, 6);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = speed * (.3 + Math.random() * .9);
        g.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life, max: life, color: Array.isArray(color) ? g.pick(color) : color, size: size * (.6 + Math.random() * .8) });
      }
    };
    g.trail = (x, y, color, size = 3, life = .35, vx = 0, vy = 0) => { g.parts.push({ x, y, vx, vy, life, max: life, color, size, drag: true }); };
    g.text = (str, x, y, color = '#fff', size = 16) => { g.texts.push({ str: String(str), x, y, color, size, life: .9 }); };
    g.shake = (a = 6, t = .25) => { if (reduced) return; g.shakeA = Math.max(g.shakeA, a); g.shakeT = Math.max(g.shakeT, t); try { if (a > 7 && navigator.vibrate) navigator.vibrate(25); } catch (_) {} };

    /* ---------- sound ---------- */
    let ac = null;
    g.sfx = (freq = 440, dur = .1, type = 'square', vol = .05, slide = 0) => {
      if (g.muted) return;
      try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        const o = ac.createOscillator(), gn = ac.createGain(), t = ac.currentTime;
        o.type = type; o.frequency.setValueAtTime(freq, t);
        if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
        gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + dur + .02);
      } catch (_) {}
    };
    g.noise = (dur = .2, vol = .06) => {
      if (g.muted) return;
      try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const s = ac.createBufferSource(), gn = ac.createGain(); s.buffer = b; gn.gain.value = vol; s.connect(gn).connect(ac.destination); s.start();
      } catch (_) {}
    };
    g.snd = {
      tap: () => g.sfx(660, .06, 'triangle', .05),
      pick: () => { g.sfx(880, .07, 'square', .04); setTimeout(() => g.sfx(1320, .08, 'square', .035), 60); },
      hit: () => { g.noise(.18, .08); g.sfx(160, .2, 'sawtooth', .05, -100); },
      jump: () => g.sfx(320, .14, 'square', .04, 380),
      bad: () => g.sfx(200, .25, 'sawtooth', .05, -120),
      win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => g.sfx(f, .14, 'triangle', .05), i * 90)),
      over: () => [392, 330, 262, 196].forEach((f, i) => setTimeout(() => g.sfx(f, .2, 'triangle', .05), i * 120))
    };

    /* ---------- overlay / states ---------- */
    const ovl = $('ovl'), oT = $('ovlTitle'), oX = $('ovlText'), oS = $('ovlScore'), play = $('playBtn');
    function showOvl(title, text, scoreLine, btn) {
      oT.textContent = title; oX.textContent = text; oS.textContent = scoreLine || ''; oS.hidden = !scoreLine; play.textContent = btn;
      ovl.hidden = false; ovl.classList.remove('in'); void ovl.offsetWidth; ovl.classList.add('in');
    }
    function begin() {
      g.score = 0; g.mult = 1; g.t = 0; g.parts.length = 0; g.texts.length = 0; g.data = {};
      cfg.init && cfg.init(g);
      g.state = 'playing'; ovl.hidden = true; hud(); if (hScore) hScore.textContent = '0'; shownScore = 0;
      g.plays++; store.set(key + '_n', g.plays);
      g.snd.tap();
      document.dispatchEvent(new CustomEvent('arcade:start'));
    }
    g.over = (msg) => {
      if (g.state !== 'playing') return;
      g.state = 'over';
      const isBest = g.score > g.best;
      if (isBest) { g.best = g.score; store.set(key, g.best); }
      hud();
      g.snd.over(); g.shake(10, .4);
      setTimeout(() => showOvl(isBest ? 'New high score!' : (cfg.overTitle || 'Game over'), msg || cfg.overText || 'One more go?', `${g.score.toLocaleString()} pts · best ${g.best.toLocaleString()}`, 'Play again'), 550);
      document.dispatchEvent(new CustomEvent('arcade:over', { detail: { score: g.score, best: g.best, isBest } }));
    };
    g.saveBest = () => { if (g.score > g.best) { g.best = g.score; store.set(key, g.best); hud(); } };
    function pause(p) {
      if (p && g.state === 'playing') { g.state = 'paused'; showOvl('Paused', 'Take a breath.', `${g.score.toLocaleString()} pts`, 'Resume'); }
      else if (!p && g.state === 'paused') { g.state = 'playing'; ovl.hidden = true; }
    }
    play.addEventListener('click', () => { if (g.state === 'paused') pause(false); else begin(); });
    const pb = $('pauseBtn'); if (pb) pb.addEventListener('click', () => pause(g.state === 'playing'));
    const mb = $('muteBtn');
    function muteUi() { if (mb) { mb.setAttribute('aria-pressed', String(g.muted)); mb.textContent = g.muted ? '🔇' : '🔊'; } }
    if (mb) mb.addEventListener('click', () => { g.muted = !g.muted; store.set('bz_mute', g.muted); muteUi(); });
    muteUi();
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });

    /* ---------- input ---------- */
    const toLocal = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
    cv.addEventListener('pointerdown', e => {
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      const [x, y] = toLocal(e); g.ptr.x = x; g.ptr.y = y; g.ptr.down = true;
      if (g.state === 'title' || g.state === 'over') { if (g.state === 'title' || !ovl.hidden) return; }
      if (g.state === 'playing' && cfg.down) cfg.down(g, x, y, e);
    });
    cv.addEventListener('pointermove', e => { const [x, y] = toLocal(e); g.ptr.x = x; g.ptr.y = y; if (g.state === 'playing' && cfg.move) cfg.move(g, x, y, g.ptr.down, e); });
    const up = e => { const [x, y] = toLocal(e); g.ptr.down = false; if (g.state === 'playing' && cfg.up) cfg.up(g, x, y, e); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('contextmenu', e => e.preventDefault());
    const GAME_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Spacebar']);
    window.addEventListener('keydown', e => {
      const inField = e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
      if (inField) return;
      const stageFocused = document.activeElement === document.body || (document.activeElement && document.activeElement.closest('.device'));
      if (!stageFocused) return;
      if (GAME_KEYS.has(e.key)) e.preventDefault();
      if ((e.key === ' ' || e.key === 'Enter') && g.state !== 'playing') { if (!ovl.hidden) { play.click(); } return; }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') { pause(g.state === 'playing'); return; }
      if (g.keys.has(e.key)) return;
      g.keys.add(e.key);
      if (g.state === 'playing' && cfg.key) cfg.key(g, e.key, true);
    });
    window.addEventListener('keyup', e => { g.keys.delete(e.key); if (g.state === 'playing' && cfg.key) cfg.key(g, e.key, false); });

    /* ---------- loop ---------- */
    let last = performance.now(), fpsAcc = 0, fpsN = 0;
    const fpsEl = $('hFps');
    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (g.state === 'playing') { g.t += dt; cfg.update(g, dt); }
      else if (cfg.attract && g.state === 'title') cfg.attract(g, dt);
      for (let i = g.parts.length - 1; i >= 0; i--) {
        const p = g.parts[i]; p.life -= dt; if (p.life <= 0) { g.parts.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; const k = p.drag ? .9 : .96; p.vx *= k; p.vy *= k; if (!p.drag) p.vy += 120 * dt;
      }
      for (let i = g.texts.length - 1; i >= 0; i--) { const t = g.texts[i]; t.life -= dt; t.y -= 40 * dt; if (t.life <= 0) g.texts.splice(i, 1); }
      if (g.shakeT > 0) g.shakeT -= dt; else g.shakeA = 0;
      // count the score display up smoothly
      if (hScore && shownScore !== g.score) { shownScore += Math.ceil((g.score - shownScore) * .25) || (g.score > shownScore ? 1 : -1); if (Math.abs(g.score - shownScore) < 1) shownScore = g.score; hScore.textContent = shownScore.toLocaleString(); }
      ctx.save();
      if (g.shakeA) ctx.translate((Math.random() - .5) * g.shakeA, (Math.random() - .5) * g.shakeA);
      cfg.draw(g, ctx);
      for (const p of g.parts) { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.drag ? p.life / p.max + .3 : 1), 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      for (const t of g.texts) { ctx.globalAlpha = Math.min(1, t.life * 1.6); ctx.fillStyle = t.color; ctx.font = `${g.fw} ${t.size}px ${cfg.font}`; ctx.textAlign = 'center'; ctx.fillText(t.str, t.x, t.y); }
      ctx.globalAlpha = 1; ctx.restore();
      fpsAcc += dt; fpsN++; if (fpsAcc > .5) { if (fpsEl) fpsEl.textContent = Math.round(fpsN / fpsAcc) + ' fps'; fpsAcc = 0; fpsN = 0; }
      requestAnimationFrame(frame);
    }
    hud(); if (hScore) hScore.textContent = '0';
    showOvl(cfg.title, cfg.hint, g.best ? `Best ${g.best.toLocaleString()}` : '', 'Play');
    cfg.init && cfg.init(g);
    requestAnimationFrame(frame);
    window.__arcade = g; // handy for testing in the console
    return g;
  }
  const yr = document.getElementById('year'); if (yr) yr.textContent = new Date().getFullYear();
  if (window.gsap && !reduced) {
    gsap.from('.hero > div:first-child > *', { y: 24, opacity: 0, duration: .8, stagger: .07, ease: 'expo.out', clearProps: 'transform,opacity' });
    gsap.from('.device', { y: 50, rotation: 3, opacity: 0, duration: 1, ease: 'expo.out', delay: .15, clearProps: 'transform,opacity' });
    gsap.from('.feat', { y: 20, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out', delay: .4, clearProps: 'transform,opacity' });
  }
  window.Arcade = { start };
})();
