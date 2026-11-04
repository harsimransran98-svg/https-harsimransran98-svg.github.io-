/* Gravity Maze — tilt the board to roll the ball into the goal. */
(() => {
  const W = 360, H = 640, S = 36, OX = 18, OY = 110, COLS = 9, ROWS = 13;
  // carve a maze with a randomized DFS so every level is solvable
  function maze(level) {
    const w = 4 + Math.min(4, Math.floor(level / 2)), h = 6 + Math.min(6, level), cw = Math.floor(COLS / 2), ch = Math.floor(ROWS / 2);
    const mw = Math.min(w, cw), mh = Math.min(h, ch), grid = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    const seen = new Set(), stack = [[0, 0]]; seen.add('0,0'); grid[1][1] = 0;
    while (stack.length) {
      const [x, y] = stack[stack.length - 1], nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => a >= 0 && b >= 0 && a < mw && b < mh && !seen.has(a + ',' + b));
      if (!nb.length) { stack.pop(); continue; }
      const [nx, ny] = nb[Math.floor(Math.random() * nb.length)]; seen.add(nx + ',' + ny);
      grid[ny * 2 + 1][nx * 2 + 1] = 0; grid[y + ny + 1][x + nx + 1] = 0; stack.push([nx, ny]);
    }
    // open a few extra loops so it isn't a pure corridor
    for (let i = 0; i < 4; i++) { const x = 1 + Math.floor(Math.random() * (mw * 2 - 1)), y = 1 + Math.floor(Math.random() * (mh * 2 - 1)); if (grid[y][x] === 1 && x % 2 !== y % 2) grid[y][x] = 0; }
    return { grid, goal: [(mw - 1) * 2 + 1, (mh - 1) * 2 + 1], mw, mh };
  }
  Arcade.start({
    id: 'gravitymaze', W, H, title: 'Gravity Maze', overText: 'Time is up. Tilt smoother, not harder.',
    hint: 'Tilt with the arrow keys / WASD, or drag anywhere. Roll the ball into the glowing hole. Avoid the red traps.',
    init(g) { Object.assign(g.data, { level: 1, time: 45, tx: 0, ty: 0, drag: null }); load(g); },
    update(g, dt) {
      const d = g.data; d.time -= dt; if (d.time <= 0) { g.over(`You reached level ${d.level}.`); return; }
      let ax = 0, ay = 0; const k = g.keys;
      if (k.has('ArrowLeft') || k.has('a')) ax -= 1; if (k.has('ArrowRight') || k.has('d')) ax += 1; if (k.has('ArrowUp') || k.has('w')) ay -= 1; if (k.has('ArrowDown') || k.has('s')) ay += 1;
      if (d.drag) { ax = g.clamp((g.ptr.x - d.drag[0]) / 60, -1, 1); ay = g.clamp((g.ptr.y - d.drag[1]) / 60, -1, 1); }
      d.tx += (ax - d.tx) * Math.min(1, dt * 8); d.ty += (ay - d.ty) * Math.min(1, dt * 8);
      const b = d.ball; b.vx += d.tx * 900 * dt; b.vy += d.ty * 900 * dt; b.vx *= .985; b.vy *= .985;
      // sub-step for solid wall collisions
      const steps = 4;
      for (let s = 0; s < steps; s++) {
        b.x += b.vx * dt / steps; collide(d, b, 'x');
        b.y += b.vy * dt / steps; collide(d, b, 'y');
      }
      const [gx, gy] = d.m.goal, gcx = OX + gx * S + S / 2, gcy = OY + gy * S + S / 2;
      if (Math.hypot(b.x - gcx, b.y - gcy) < 12) {
        const bonus = g.add(100 * d.level + Math.round(d.time) * 5, gcx, gcy - 20, '#06D6A0'); g.burst(gcx, gcy, ['#FFD166', '#06D6A0', '#fff'], 40, 220); g.snd.win(); g.shake(5);
        d.level++; d.time = Math.min(60, d.time + 15); g.text(`LEVEL ${d.level}`, W / 2, 300, '#FFD166', 22); g.setMult(1 + (d.level - 1) * .25); load(g);
      }
      for (const t of d.traps) if (Math.hypot(b.x - t[0], b.y - t[1]) < 13) { g.burst(b.x, b.y, ['#EF476F', '#fff'], 26, 200); g.snd.bad(); g.shake(6); d.time -= 5; g.text('-5s', b.x, b.y - 20, '#EF476F', 16); Object.assign(b, { x: OX + S * 1.5, y: OY + S * 1.5, vx: 0, vy: 0 }); }
      if (Math.hypot(b.vx, b.vy) > 120) g.trail(b.x, b.y, 'rgba(255,209,102,.6)', 3, .25);
    },
    draw(g, ctx) {
      const d = g.data;
      ctx.fillStyle = '#0E1A2B'; ctx.fillRect(0, 0, W, H);
      if (!d.m) return;
      ctx.save(); ctx.translate(W / 2, OY + ROWS * S / 2); ctx.rotate(d.tx * .04); ctx.translate(-W / 2, -(OY + ROWS * S / 2));
      ctx.fillStyle = '#16263D'; ctx.fillRect(OX, OY, COLS * S, ROWS * S);
      d.m.grid.forEach((row, y) => row.forEach((c, x) => { if (c) { ctx.fillStyle = '#26415F'; ctx.fillRect(OX + x * S, OY + y * S, S, S); ctx.fillStyle = '#335680'; ctx.fillRect(OX + x * S, OY + y * S, S, 4); } }));
      const [gx, gy] = d.m.goal; ctx.fillStyle = '#06D6A0'; ctx.shadowColor = '#06D6A0'; ctx.shadowBlur = 18 + Math.sin(g.t * 5) * 6; ctx.beginPath(); ctx.arc(OX + gx * S + S / 2, OY + gy * S + S / 2, 13, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#0B1320'; ctx.beginPath(); ctx.arc(OX + gx * S + S / 2, OY + gy * S + S / 2, 8, 0, 7); ctx.fill();
      d.traps.forEach(([x, y]) => { ctx.fillStyle = '#EF476F'; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#0B1320'; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); });
      const b = d.ball, gr = ctx.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, 9); gr.addColorStop(0, '#FFF3C4'); gr.addColorStop(1, '#FFD166');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(b.x, b.y, 9, 0, 7); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#EAF2FF'; ctx.font = `14px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`LEVEL ${d.level}`, 18, 96); ctx.textAlign = 'right'; ctx.fillStyle = d.time < 10 ? '#EF476F' : '#EAF2FF'; ctx.fillText(`${Math.ceil(d.time)}s`, W - 18, 96);
      // tilt indicator
      ctx.strokeStyle = 'rgba(234,242,255,.3)'; ctx.beginPath(); ctx.arc(W / 2, H - 50, 22, 0, 7); ctx.stroke(); ctx.fillStyle = '#FFD166'; ctx.beginPath(); ctx.arc(W / 2 + d.tx * 16, H - 50 + d.ty * 16, 6, 0, 7); ctx.fill();
    },
    down(g, x, y) { g.data.drag = [x, y]; },
    up(g) { g.data.drag = null; }
  });
  function load(g) {
    const d = g.data; d.m = maze(d.level); d.ball = { x: OX + S * 1.5, y: OY + S * 1.5, vx: 0, vy: 0 };
    const open = []; d.m.grid.forEach((row, y) => row.forEach((c, x) => { if (!c && (x + y) > 4 && !(x === d.m.goal[0] && y === d.m.goal[1])) open.push([OX + x * S + S / 2, OY + y * S + S / 2]); }));
    d.traps = []; for (let i = 0; i < Math.min(5, d.level - 1); i++) d.traps.push(open.splice(Math.floor(Math.random() * open.length), 1)[0]);
  }
  function collide(d, b, axis) {
    const r = 9, x0 = Math.floor((b.x - r - OX) / S), x1 = Math.floor((b.x + r - OX) / S), y0 = Math.floor((b.y - r - OY) / S), y1 = Math.floor((b.y + r - OY) / S);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const solid = y < 0 || x < 0 || y >= ROWS || x >= COLS || d.m.grid[y][x]; if (!solid) continue;
      const rx = OX + x * S, ry = OY + y * S, cx = Math.max(rx, Math.min(b.x, rx + S)), cy = Math.max(ry, Math.min(b.y, ry + S));
      if ((b.x - cx) ** 2 + (b.y - cy) ** 2 < r * r) {
        if (axis === 'x') { b.x = b.vx > 0 ? rx - r - .01 : rx + S + r + .01; b.vx *= -.35; } else { b.y = b.vy > 0 ? ry - r - .01 : ry + S + r + .01; b.vy *= -.35; }
        return;
      }
    }
  }
})();
