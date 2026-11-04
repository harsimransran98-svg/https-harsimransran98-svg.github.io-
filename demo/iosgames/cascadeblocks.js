/* Cascade Blocks — drop the sliding block onto the tower; overhang gets sliced off. */
(() => {
  const W = 360, H = 640, BH = 26, BASEY = 560;
  const col = (i) => `hsl(${(200 + i * 9) % 360},85%,${62 - Math.min(20, i * .4)}%)`;
  Arcade.start({
    id: 'cascadeblocks', W, H, title: 'Cascade Blocks', overText: 'Missed the tower. Perfect drops keep the full width.',
    hint: 'A block slides across. Tap, click or Space to drop it. Perfect drops keep the full width and build a streak.',
    init(g) { const d = g.data; d.stack = [{ x: 80, w: 200, i: 0 }]; d.cut = []; d.cam = 0; d.streak = 0; next(g); },
    attract(g, dt) { const d = g.data; if (d.cur) { d.cur.x += d.cur.v * dt; if (d.cur.x < -d.cur.w * .4 || d.cur.x + d.cur.w > W + d.cur.w * .4) d.cur.v *= -1; } },
    update(g, dt) {
      const d = g.data, c = d.cur; c.x += c.v * dt;
      if (c.x + c.w > W + 30) { c.x = W + 30 - c.w; c.v = -Math.abs(c.v); } if (c.x < -30) { c.x = -30; c.v = Math.abs(c.v); }
      d.cut.forEach(p => { p.vy += 1400 * dt; p.y += p.vy * dt; p.r += p.vr * dt; }); d.cut = d.cut.filter(p => p.y < d.cam + H + 100);
      const target = Math.max(0, (d.stack.length - 9) * BH); d.cam += (target - d.cam) * Math.min(1, dt * 5);
    },
    draw(g, ctx) {
      const d = g.data, bg = ctx.createLinearGradient(0, 0, 0, H), h = (220 + (d.stack ? d.stack.length : 0) * 4) % 360;
      bg.addColorStop(0, `hsl(${h},45%,10%)`); bg.addColorStop(1, '#0F172A'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      if (!d.stack) return;
      const Y = i => BASEY - i * BH + d.cam;
      ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(70, Y(0) + BH, 220, H);
      d.stack.forEach((b, i) => { ctx.fillStyle = col(b.i); ctx.fillRect(b.x, Y(i), b.w, BH - 1); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(b.x, Y(i), b.w, 4); });
      if (g.state === 'playing' || g.state === 'title') { const c = d.cur, i = d.stack.length; ctx.fillStyle = col(c.i); ctx.globalAlpha = .95; ctx.fillRect(c.x, Y(i), c.w, BH - 1); ctx.globalAlpha = 1; }
      d.cut.forEach(p => { ctx.save(); ctx.translate(p.x + p.w / 2, p.y + BH / 2 + d.cam); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -BH / 2, p.w, BH - 1); ctx.restore(); });
      ctx.fillStyle = '#E2E8F0'; ctx.textAlign = 'center'; ctx.font = `${g.fw} 46px ${g.font}`; ctx.fillText(d.stack.length - 1, W / 2, 150);
      if (d.streak > 1) { ctx.font = `${g.fw} 14px ${g.font}`; ctx.fillStyle = '#F472B6'; ctx.fillText(`PERFECT ×${d.streak}`, W / 2, 176); }
    },
    down(g) { drop(g); },
    key(g, k, down) { if (down && (k === ' ' || k === 'ArrowDown' || k === 'Enter')) drop(g); }
  });
  function next(g) { const d = g.data, top = d.stack[d.stack.length - 1], i = d.stack.length, fromLeft = i % 2; d.cur = { x: fromLeft ? -top.w : W, w: top.w, v: (fromLeft ? 1 : -1) * (150 + Math.min(220, i * 7)), i }; }
  function drop(g) {
    const d = g.data, c = d.cur, top = d.stack[d.stack.length - 1], Y = BASEY - d.stack.length * BH;
    const l = Math.max(c.x, top.x), r = Math.min(c.x + c.w, top.x + top.w), w = r - l;
    if (w <= 0) { d.cut.push({ x: c.x, y: Y, w: c.w, vy: 0, r: 0, vr: (Math.random() - .5) * 4, c: col(c.i) }); g.snd.hit(); g.over(`Your tower reached ${d.stack.length - 1} blocks.`); return; }
    const perfect = Math.abs(c.x - top.x) < 5;
    if (perfect) { d.stack.push({ x: top.x, w: top.w, i: c.i }); d.streak++; if (d.streak >= 3) { const grow = Math.min(W * .62, top.w + 10); d.stack[d.stack.length - 1].x -= (grow - top.w) / 2; d.stack[d.stack.length - 1].w = grow; }
      g.setMult(Math.min(5, 1 + d.streak * .5)); g.add(20, W / 2, Y + d.cam - 10, '#F472B6'); g.burst(top.x + top.w / 2, Y + d.cam + BH / 2, ['#F472B6', '#38BDF8', '#fff'], 24, 180); g.sfx(600 + d.streak * 60, .1, 'triangle', .05); g.shake(4, .15); }
    else {
      d.stack.push({ x: l, w, i: c.i }); d.streak = 0; g.setMult(1); g.add(10, W / 2, Y + d.cam - 10, '#E2E8F0'); g.sfx(320, .08, 'square', .04);
      const offX = c.x < top.x ? c.x : r, offW = c.w - w; d.cut.push({ x: offX, y: Y, w: offW, vy: -80, r: 0, vr: (c.x < top.x ? -1 : 1) * 3, c: col(c.i) });
      g.burst(c.x < top.x ? l : r, Y + d.cam + BH / 2, col(c.i), 10, 140, .4, 2.5);
    }
    next(g);
  }
})();
