/* Pixel Raiders — top-down permadeath dungeon run. */
(() => {
  const W = 360, H = 640, T = 24, CW = 15, CH = 20, OX = 0, OY = 112;
  function floor(g) {
    const d = g.data, grid = Array.from({ length: CH }, (_, y) => Array.from({ length: CW }, (_, x) => (x === 0 || y === 0 || x === CW - 1 || y === CH - 1) ? 1 : 0));
    for (let i = 0; i < 26 + d.depth * 2; i++) { const x = 2 + Math.floor(Math.random() * (CW - 4)), y = 2 + Math.floor(Math.random() * (CH - 4)); if (!(x < 4 && y < 4)) grid[y][x] = 1; }
    const free = () => { for (;;) { const x = 1 + Math.floor(Math.random() * (CW - 2)), y = 1 + Math.floor(Math.random() * (CH - 2)); if (!grid[y][x] && x + y > 8) return [x, y]; } };
    d.grid = grid; d.p = { x: 1.5 * T, y: 1.5 * T, vx: 0, vy: 0 };
    d.coins = Array.from({ length: 6 + d.depth }, () => { const [x, y] = free(); return { x: (x + .5) * T, y: (y + .5) * T }; });
    d.slimes = Array.from({ length: 2 + d.depth }, () => { const [x, y] = free(); return { x: (x + .5) * T, y: (y + .5) * T, sp: 38 + d.depth * 6 + Math.random() * 14, hop: Math.random() }; });
    const [sx, sy] = free(); d.stairs = { x: (sx + .5) * T, y: (sy + .5) * T };
  }
  const solid = (d, x, y) => { const cx = Math.floor(x / T), cy = Math.floor(y / T); return cx < 0 || cy < 0 || cx >= CW || cy >= CH || d.grid[cy][cx] === 1; };
  function moveBody(d, b, dx, dy, r) { if (!solid(d, b.x + dx + Math.sign(dx) * r, b.y - r + 1) && !solid(d, b.x + dx + Math.sign(dx) * r, b.y + r - 1)) b.x += dx; if (!solid(d, b.x - r + 1, b.y + dy + Math.sign(dy) * r) && !solid(d, b.x + r - 1, b.y + dy + Math.sign(dy) * r)) b.y += dy; }
  Arcade.start({
    id: 'pixelraiders', W, H, title: 'Pixel Raiders', overText: 'A slime got you. Permadeath means a fresh dungeon.',
    hint: 'Move with arrows / WASD or drag. Space or a quick tap dashes through slimes. Grab the gold and take the stairs.',
    init(g) { Object.assign(g.data, { depth: 1, dash: 0, cd: 0, face: 1, drag: null, tapT: 0 }); floor(g); },
    update(g, dt) {
      const d = g.data, p = d.p; let ax = 0, ay = 0; const k = g.keys;
      if (k.has('ArrowLeft') || k.has('a')) ax--; if (k.has('ArrowRight') || k.has('d')) ax++; if (k.has('ArrowUp') || k.has('w')) ay--; if (k.has('ArrowDown') || k.has('s')) ay++;
      if (d.drag) { const dx = g.ptr.x - d.drag[0], dy = g.ptr.y - d.drag[1], m = Math.hypot(dx, dy); if (m > 10) { ax = dx / m; ay = dy / m; } }
      const m = Math.hypot(ax, ay) || 1, sp = d.dash > 0 ? 380 : 130; if (ax) d.face = Math.sign(ax);
      d.dash -= dt; d.cd -= dt;
      moveBody(d, p, ax / m * sp * dt, ay / m * sp * dt, 8);
      if (d.dash > 0) g.trail(p.x, p.y + OY, '#FFD23F', 4, .25);
      d.slimes.forEach(s => { s.hop += dt * 4; const dx = p.x - s.x, dy = p.y - s.y, dist = Math.hypot(dx, dy) || 1; if (dist < 220) moveBody(d, s, dx / dist * s.sp * dt, dy / dist * s.sp * dt, 8); });
      for (let i = d.slimes.length - 1; i >= 0; i--) { const s = d.slimes[i]; if (Math.hypot(s.x - p.x, s.y - p.y) < 16) { if (d.dash > 0) { g.add(30, s.x, s.y + OY - 10, '#E63946'); g.burst(s.x, s.y + OY, ['#80ED99', '#2D6A4F'], 20, 180, .5, 3); g.snd.hit(); g.shake(5, .15); d.slimes.splice(i, 1); } else { g.burst(p.x, p.y + OY, ['#E63946', '#F1FAEE'], 40, 220, .7, 3); g.snd.hit(); g.over(`You fell on floor ${d.depth}.`); return; } } }
      for (let i = d.coins.length - 1; i >= 0; i--) { const c = d.coins[i]; if (Math.hypot(c.x - p.x, c.y - p.y) < 16) { d.coins.splice(i, 1); g.add(10, c.x, c.y + OY - 8, '#FFD23F'); g.burst(c.x, c.y + OY, '#FFD23F', 10, 110, .4, 2); g.snd.pick(); } }
      if (Math.hypot(d.stairs.x - p.x, d.stairs.y - p.y) < 14) { const b = g.add(100 * d.depth, p.x, p.y + OY - 20, '#F1FAEE'); d.depth++; g.setMult(1 + (d.depth - 1) * .25); g.text(`FLOOR ${d.depth}`, W / 2, 300, '#FFD23F', 22); g.snd.win(); floor(g); }
    },
    draw(g, ctx) {
      const d = g.data; ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#1A1423'; ctx.fillRect(0, 0, W, H);
      if (!d.grid) return;
      ctx.save(); ctx.translate(OX, OY);
      d.grid.forEach((row, y) => row.forEach((c, x) => { ctx.fillStyle = c ? '#3D2C4F' : ((x + y) % 2 ? '#241A30' : '#271D34'); ctx.fillRect(x * T, y * T, T, T); if (c) { ctx.fillStyle = '#4E3A63'; ctx.fillRect(x * T, y * T, T, 4); } }));
      ctx.fillStyle = '#8D99AE'; for (let i = 0; i < 3; i++) ctx.fillRect(d.stairs.x - 9 + i * 3, d.stairs.y - 9 + i * 6, 18 - i * 6, 4);
      d.coins.forEach(c => { const b = Math.sin(g.t * 6 + c.x) * 2; ctx.fillStyle = '#FFD23F'; ctx.fillRect(c.x - 4, c.y - 4 + b, 8, 8); ctx.fillStyle = '#FFF3B0'; ctx.fillRect(c.x - 2, c.y - 2 + b, 2, 2); });
      d.slimes.forEach(s => { const sq = Math.abs(Math.sin(s.hop)) * 3; ctx.fillStyle = '#80ED99'; ctx.fillRect(s.x - 9, s.y - 6 + sq, 18, 12 - sq); ctx.fillStyle = '#1A1423'; ctx.fillRect(s.x - 5, s.y - 2 + sq, 3, 3); ctx.fillRect(s.x + 2, s.y - 2 + sq, 3, 3); });
      const p = d.p; ctx.fillStyle = d.dash > 0 ? '#FFD23F' : '#F1FAEE'; ctx.fillRect(p.x - 7, p.y - 9, 14, 18); ctx.fillStyle = '#E63946'; ctx.fillRect(p.x - 7, p.y - 9, 14, 5); ctx.fillStyle = '#1A1423'; ctx.fillRect(p.x + (d.face > 0 ? 1 : -4), p.y - 3, 3, 3);
      ctx.restore();
      ctx.fillStyle = '#F1FAEE'; ctx.font = `${g.fw} 14px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`FLOOR ${d.depth}`, 12, 100); ctx.textAlign = 'right'; ctx.fillText(d.cd > 0 ? 'DASH …' : 'DASH READY', W - 12, 100);
    },
    down(g, x, y) { g.data.drag = [x, y]; g.data.tapT = g.t; },
    up(g) { const d = g.data; if (g.t - d.tapT < .18) dash(g); d.drag = null; },
    key(g, k, down) { if (down && k === ' ') dash(g); }
  });
  function dash(g) { const d = g.data; if (d.cd > 0) return; d.dash = .22; d.cd = 1.1; g.sfx(800, .1, 'square', .03, -400); }
})();
