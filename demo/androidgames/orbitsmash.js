/* Orbit Smash — vector brick breaker / station defence. Rules only; engine in ../arcade-kit.js */
(() => {
  const W = 360, H = 640, PY = 592, COLS = 7, BW = 44, BH = 22, GAP = 4, TOP = 110;
  const HP_COL = ['#00E5FF', '#7CFF6B', '#FF9F1C', '#FF3D7F'];
  const PU = { M: ['MULTI', '#7CFF6B'], W: ['WIDE', '#00E5FF'], L: ['LASER', '#FF3D7F'], S: ['SHIELD', '#FF9F1C'] };

  function wave(g) {
    const d = g.data, n = d.wave, rows = Math.min(7, 3 + Math.floor(n / 2)), bricks = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < COLS; c++) {
      const pat = n % 4;
      if (pat === 1 && (r + c) % 2) continue;
      if (pat === 2 && Math.abs(c - 3) + Math.abs(r - (rows - 1) / 2) > 3.2) continue;
      if (pat === 3 && Math.abs(c - 3) < r - 1) continue;
      const hp = 1 + Math.min(3, Math.floor((rows - r - 1 + n) / 3));
      bricks.push({ x: 18 + c * (BW + GAP), y: TOP + r * (BH + GAP), hp, max: hp, shape: r % 4 });
    }
    d.bricks = bricks; d.fall = 0; d.drop = 2 + n * .9;
  }
  function newBall(d, stuck) { return { x: d.px, y: PY - 10, vx: 0, vy: 0, r: 6, stuck }; }

  Arcade.start({
    id: 'orbitsmash', W, H, title: 'Orbit Smash', overText: 'The invaders broke through. Regroup and launch again.',
    hint: 'Aim with the mouse, a finger or ← →. Tap or Space launches the core. Catch the drops for power-ups.',
    init(g) {
      const d = g.data; Object.assign(d, { px: W / 2, pw: 72, lives: 3, wave: 1, combo: 0, pus: [], bolts: [], wide: 0, laser: 0, shield: 0, fireT: 0, keyV: 0, stars: Array.from({ length: 50 }, () => [Math.random() * W, Math.random() * H, Math.random()]) });
      d.balls = [newBall(d, true)]; wave(g);
    },
    attract(g, dt) { g.data.stars && g.data.stars.forEach(s => { s[1] = (s[1] + dt * 20 * (s[2] + .3)) % H; }); },
    update(g, dt) {
      const d = g.data;
      d.stars.forEach(s => { s[1] = (s[1] + dt * 30 * (s[2] + .3)) % H; });
      if (d.keyV) d.px = g.clamp(d.px + d.keyV * 420 * dt, d.pw / 2, W - d.pw / 2);
      d.pw += ((d.wide > 0 ? 112 : 72) - d.pw) * Math.min(1, dt * 8);
      ['wide', 'laser', 'shield'].forEach(k => { if (d[k] > 0) d[k] -= dt; });
      // invaders creep down
      d.fall += dt; const creep = d.drop * dt; d.bricks.forEach(b => { b.y += creep; });
      if (d.bricks.some(b => b.y + BH > PY - 26)) { g.burst(W / 2, PY - 20, ['#FF3D7F', '#FF9F1C', '#fff'], 70, 300); g.snd.hit(); g.over(`They reached the station on wave ${d.wave}.`); return; }
      // lasers
      if (d.laser > 0) { d.fireT -= dt; if (d.fireT <= 0) { d.fireT = .22; d.bolts.push({ x: d.px - d.pw / 2 + 6, y: PY - 10 }, { x: d.px + d.pw / 2 - 6, y: PY - 10 }); g.sfx(1400, .05, 'square', .02, -600); } }
      for (let i = d.bolts.length - 1; i >= 0; i--) { const bo = d.bolts[i]; bo.y -= 640 * dt; const hit = d.bricks.find(b => bo.x > b.x && bo.x < b.x + BW && bo.y > b.y && bo.y < b.y + BH); if (hit) { damage(g, hit); d.bolts.splice(i, 1); } else if (bo.y < 0) d.bolts.splice(i, 1); }
      // balls
      const speed = 330 + d.wave * 14;
      for (let bi = d.balls.length - 1; bi >= 0; bi--) {
        const b = d.balls[bi];
        if (b.stuck) { b.x = d.px; b.y = PY - 10; continue; }
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx); g.sfx(300, .03, 'square', .02); }
        if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx); g.sfx(300, .03, 'square', .02); }
        if (b.y < 80 + b.r) { b.y = 80 + b.r; b.vy = Math.abs(b.vy); }
        // paddle
        if (b.vy > 0 && b.y + b.r > PY - 6 && b.y < PY + 8 && Math.abs(b.x - d.px) < d.pw / 2 + b.r) {
          const off = (b.x - d.px) / (d.pw / 2), a = off * 1.05;
          b.vx = Math.sin(a) * speed; b.vy = -Math.cos(a) * speed; b.y = PY - 6 - b.r;
          d.combo = 0; g.setMult(1); g.sfx(520, .05, 'square', .035); g.burst(b.x, PY - 6, '#00E5FF', 6, 90, .3, 2);
        }
        if (d.shield > 0 && b.vy > 0 && b.y > PY + 14) { b.vy = -Math.abs(b.vy); g.burst(b.x, PY + 16, '#FF9F1C', 10, 120); }
        // bricks (circle vs rect, resolve along the shallow axis)
        for (const k of d.bricks) {
          const cx = g.clamp(b.x, k.x, k.x + BW), cy = g.clamp(b.y, k.y, k.y + BH), dx = b.x - cx, dy = b.y - cy;
          if (dx * dx + dy * dy < b.r * b.r) {
            const ox = Math.min(b.x + b.r - k.x, k.x + BW - (b.x - b.r)), oy = Math.min(b.y + b.r - k.y, k.y + BH - (b.y - b.r));
            if (ox < oy) b.vx = b.x < k.x + BW / 2 ? -Math.abs(b.vx) : Math.abs(b.vx); else b.vy = b.y < k.y + BH / 2 ? -Math.abs(b.vy) : Math.abs(b.vy);
            damage(g, k); break;
          }
        }
        // keep speed constant
        const v = Math.hypot(b.vx, b.vy) || 1; b.vx = b.vx / v * speed; b.vy = b.vy / v * speed;
        if (Math.abs(b.vy) < speed * .25) b.vy = Math.sign(b.vy || -1) * speed * .25;
        g.trail(b.x, b.y, '#00E5FF', 2.2, .22);
        if (b.y > H + 20) d.balls.splice(bi, 1);
      }
      if (!d.balls.length) {
        d.lives--; g.shake(10, .35); g.snd.bad(); g.text(d.lives > 0 ? `${d.lives} ${d.lives === 1 ? 'LIFE' : 'LIVES'} LEFT` : '', W / 2, 400, '#FF3D7F', 16);
        if (d.lives <= 0) { g.over(`Out of cores on wave ${d.wave}.`); return; }
        d.balls = [newBall(d, true)];
      }
      // power-ups fall
      for (let i = d.pus.length - 1; i >= 0; i--) {
        const p = d.pus[i]; p.y += 150 * dt; p.rot += dt * 3;
        if (p.y > PY - 12 && p.y < PY + 12 && Math.abs(p.x - d.px) < d.pw / 2 + 12) { power(g, p.k); d.pus.splice(i, 1); }
        else if (p.y > H + 20) d.pus.splice(i, 1);
      }
      if (!d.bricks.length) {
        const bonus = g.add(500 * d.wave); g.text(`WAVE ${d.wave} CLEAR +${bonus}`, W / 2, 330, '#7CFF6B', 17); g.snd.win();
        d.wave++; wave(g); d.balls = [newBall(d, true)]; d.pus = []; d.bolts = [];
      }
    },
    draw(g, ctx) {
      const d = g.data;
      ctx.fillStyle = '#050B1A'; ctx.fillRect(0, 0, W, H);
      d.stars && d.stars.forEach(([x, y, z]) => { ctx.fillStyle = `rgba(180,230,255,${.2 + z * .6})`; ctx.fillRect(x, y, 1 + z, 1 + z); });
      ctx.strokeStyle = 'rgba(0,229,255,.08)'; ctx.lineWidth = 1; for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      if (!d.bricks) return;
      ctx.lineWidth = 2;
      d.bricks.forEach(b => {
        const c = HP_COL[Math.min(3, b.max - 1)], cx = b.x + BW / 2, cy = b.y + BH / 2;
        ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 10; ctx.fillStyle = c + (b.hp < b.max ? '22' : '33');
        ctx.beginPath();
        if (b.shape === 0) { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.lineTo(cx + Math.cos(a) * 21, cy + Math.sin(a) * 11); } }
        else if (b.shape === 1) { ctx.moveTo(cx, b.y); ctx.lineTo(b.x + BW, cy); ctx.lineTo(cx, b.y + BH); ctx.lineTo(b.x, cy); }
        else if (b.shape === 2) { ctx.moveTo(cx, b.y); ctx.lineTo(b.x + BW - 2, b.y + BH); ctx.lineTo(b.x + 2, b.y + BH); }
        else ctx.rect(b.x + 3, b.y + 2, BW - 6, BH - 4);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        if (b.hp > 1) { ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.font = `800 10px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText(b.hp, cx, cy + 4); }
      });
      ctx.shadowBlur = 0;
      // danger line
      ctx.strokeStyle = 'rgba(255,61,127,.4)'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(0, PY - 26); ctx.lineTo(W, PY - 26); ctx.stroke(); ctx.setLineDash([]);
      // power-ups
      d.pus.forEach(p => { const [lab, c] = PU[p.k]; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 12; ctx.strokeRect(-11, -11, 22, 22); ctx.restore(); ctx.shadowBlur = 0; ctx.fillStyle = c; ctx.font = `800 11px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText(p.k, p.x, p.y + 4); });
      // bolts
      ctx.strokeStyle = '#FF3D7F'; ctx.shadowColor = '#FF3D7F'; ctx.shadowBlur = 8; d.bolts.forEach(b => { ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, b.y - 12); ctx.stroke(); });
      // shield
      if (d.shield > 0) { ctx.strokeStyle = '#FF9F1C'; ctx.shadowColor = '#FF9F1C'; ctx.globalAlpha = d.shield < 2 ? .4 + .4 * Math.sin(g.t * 20) : 1; ctx.beginPath(); ctx.moveTo(0, PY + 16); ctx.lineTo(W, PY + 16); ctx.stroke(); ctx.globalAlpha = 1; }
      // paddle
      const pc = d.laser > 0 ? '#FF3D7F' : '#00E5FF';
      ctx.strokeStyle = pc; ctx.shadowColor = pc; ctx.shadowBlur = 16; ctx.lineWidth = 3; ctx.fillStyle = pc + '33';
      ctx.beginPath(); ctx.moveTo(d.px - d.pw / 2, PY + 6); ctx.lineTo(d.px - d.pw / 2 + 8, PY - 6); ctx.lineTo(d.px + d.pw / 2 - 8, PY - 6); ctx.lineTo(d.px + d.pw / 2, PY + 6); ctx.closePath(); ctx.fill(); ctx.stroke();
      // balls
      ctx.fillStyle = '#fff'; ctx.shadowColor = '#00E5FF'; d.balls.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); });
      ctx.shadowBlur = 0;
      // wave + lives
      ctx.fillStyle = 'rgba(230,247,255,.75)'; ctx.font = `800 11px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`WAVE ${d.wave}`, 14, 96);
      ctx.textAlign = 'right'; ctx.fillText('◆'.repeat(Math.max(0, d.lives)), W - 14, 96);
      if (d.balls.some(b => b.stuck) && g.state === 'playing') { ctx.textAlign = 'center'; ctx.fillStyle = '#00E5FF'; ctx.globalAlpha = .6 + .4 * Math.sin(g.t * 5); ctx.fillText('TAP / SPACE TO LAUNCH', W / 2, PY - 46); ctx.globalAlpha = 1; }
    },
    down(g, x) { g.data.px = g.clamp(x, g.data.pw / 2, W - g.data.pw / 2); launch(g); },
    move(g, x) { g.data.px = g.clamp(x, g.data.pw / 2, W - g.data.pw / 2); },
    key(g, k, down) {
      const d = g.data;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') d.keyV = down ? -1 : (d.keyV === -1 ? 0 : d.keyV);
      if (k === 'ArrowRight' || k === 'd' || k === 'D') d.keyV = down ? 1 : (d.keyV === 1 ? 0 : d.keyV);
      if (down && (k === ' ' || k === 'ArrowUp')) launch(g);
    }
  });

  function launch(g) { g.data.balls.forEach(b => { if (b.stuck) { b.stuck = false; const a = (Math.random() - .5) * .6; b.vx = Math.sin(a) * 330; b.vy = -Math.cos(a) * 330; g.snd.jump(); } }); }
  function damage(g, k) {
    const d = g.data; k.hp--; g.sfx(700 + d.combo * 40, .05, 'square', .03);
    if (k.hp > 0) { g.burst(k.x + BW / 2, k.y + BH / 2, HP_COL[k.hp - 1], 6, 100, .3, 2); return; }
    d.bricks.splice(d.bricks.indexOf(k), 1); d.combo++;
    g.setMult(1 + Math.min(3, d.combo * .25));
    const c = HP_COL[Math.min(3, k.max - 1)];
    g.add(10 * k.max, k.x + BW / 2, k.y, c); g.burst(k.x + BW / 2, k.y + BH / 2, [c, '#fff'], 18, 200); g.shake(k.max > 2 ? 6 : 3, .15);
    if (Math.random() < .17) d.pus.push({ x: k.x + BW / 2, y: k.y + BH / 2, k: g.pick(Object.keys(PU)), rot: 0 });
  }
  function power(g, k) {
    const d = g.data, [lab, c] = PU[k]; g.text(lab, d.px, PY - 40, c, 16); g.snd.pick(); g.burst(d.px, PY, c, 20, 160);
    if (k === 'M') { const src = d.balls.find(b => !b.stuck) || d.balls[0]; for (let i = 0; i < 2; i++) { const a = (i ? .5 : -.5); d.balls.push({ x: src.x, y: src.y, vx: Math.sin(a) * 330, vy: -Math.cos(a) * 330, r: 6, stuck: false }); } }
    if (k === 'W') d.wide = 10; if (k === 'L') d.laser = 6; if (k === 'S') d.shield = 10;
  }
})();
