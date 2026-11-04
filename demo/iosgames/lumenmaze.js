/* Lumen Maze — rotate mirrors to bend a light beam into every crystal.
   Levels are generated backwards from a real beam path, so each one is solvable. */
(() => {
  const W = 360, H = 640, N = 7, S = 46, OX = (W - N * S) / 2, OY = 150;
  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // E S W N
  // mirror '/' : E->N, N->E, W->S, S->W ; mirror '\' : E->S, S->E, W->N, N->W
  const reflect = (m, d) => m === 0 ? [3, 2, 1, 0][d] : [1, 0, 3, 2][d];
  function gen(level) {
    for (;;) {
      const grid = Array.from({ length: N }, () => Array(N).fill(null)); let x = 0, y = Math.floor(Math.random() * N), d = 0; const src = { x: -1, y, d: 0 }, crystals = [], mirrors = [];
      const turns = 3 + Math.min(4, level), visited = new Set();
      let steps = 0, ok = true;
      while (steps < 60) {
        if (x < 0 || y < 0 || x >= N || y >= N || visited.has(x + ',' + y)) { ok = false; break; }
        visited.add(x + ',' + y);
        if (mirrors.length < turns && Math.random() < .38 && steps > 0) {
          const nd = Math.random() < .5 ? (d + 1) % 4 : (d + 3) % 4; const m = [0, 1].find(mm => reflect(mm, d) === nd);
          grid[y][x] = { t: 'm', m, want: m }; mirrors.push(grid[y][x]); d = nd;
        } else if (mirrors.length >= turns && crystals.length < 1 + Math.floor(level / 3) && Math.random() < .25) { grid[y][x] = { t: 'c' }; crystals.push([x, y]); }
        if (crystals.length >= 1 + Math.floor(level / 3)) break;
        x += DIRS[d][0]; y += DIRS[d][1]; steps++;
      }
      if (!ok || crystals.length < 1 || mirrors.length < turns) continue;
      // decoy mirrors and walls, then scramble every mirror
      for (let i = 0; i < 3 + level; i++) { const a = Math.floor(Math.random() * N), b = Math.floor(Math.random() * N); if (!grid[b][a] && !visited.has(a + ',' + b)) grid[b][a] = Math.random() < .5 ? { t: 'm', m: Math.round(Math.random()) } : { t: 'w' }; }
      grid.flat().forEach(c => { if (c && c.t === 'm' && Math.random() < .7) c.m = 1 - c.m; });
      if (trace(grid, src).hit === crystals.length) grid.flat().forEach(c => { if (c && c.t === 'm' && c.want != null) c.m = 1 - c.want; });
      return { grid, src, crystals: crystals.length };
    }
  }
  function trace(grid, src) {
    let x = src.x, y = src.y, d = src.d; const pts = [[x, y]], lit = new Set(); let hit = 0;
    for (let i = 0; i < 80; i++) {
      x += DIRS[d][0]; y += DIRS[d][1]; if (x < 0 || y < 0 || x >= N || y >= N) { pts.push([x, y]); break; }
      const c = grid[y][x]; pts.push([x, y]);
      if (!c) continue; if (c.t === 'w') break; if (c.t === 'c') { if (!lit.has(x + ',' + y)) { lit.add(x + ',' + y); hit++; } continue; }
      d = reflect(c.m, d);
    }
    return { pts, lit, hit };
  }
  Arcade.start({
    id: 'lumenmaze', W, H, title: 'Lumen Maze', overTitle: 'Out of light',
    hint: 'Tap a mirror to flip it. Bend the beam so it passes through every crystal. Fewer taps score more.',
    init(g) { Object.assign(g.data, { level: 1, taps: 0, energy: 100, solved: 0 }); load(g); },
    update(g, dt) { const d = g.data; if (d.solved > 0) { d.solved -= dt; if (d.solved <= 0) { d.level++; load(g); } return; } d.energy -= dt * (1.4 + d.level * .15); if (d.energy <= 0) g.over(`You lit ${d.level - 1} maze${d.level === 2 ? '' : 's'}.`); },
    draw(g, ctx) {
      const d = g.data; ctx.fillStyle = '#05050A'; ctx.fillRect(0, 0, W, H);
      if (!d.lv) return;
      ctx.fillStyle = '#F0F0FF'; ctx.font = `13px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`LEVEL ${d.level}`, OX, 118); ctx.textAlign = 'right'; ctx.fillText(`TAPS ${d.taps}`, OX + N * S, 118);
      ctx.fillStyle = 'rgba(255,230,109,.15)'; ctx.fillRect(OX, 128, N * S, 5); ctx.fillStyle = '#FFE66D'; ctx.fillRect(OX, 128, N * S * Math.max(0, d.energy / 100), 5);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { ctx.fillStyle = (x + y) % 2 ? '#0D0D18' : '#10101D'; ctx.fillRect(OX + x * S, OY + y * S, S, S); }
      const tr = trace(d.lv.grid, d.lv.src);
      ctx.strokeStyle = '#FFE66D'; ctx.lineWidth = 3; ctx.shadowColor = '#FFE66D'; ctx.shadowBlur = 16; ctx.beginPath();
      tr.pts.forEach(([x, y], i) => { const px = OX + x * S + S / 2, py = OY + y * S + S / 2; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); ctx.stroke(); ctx.shadowBlur = 0;
      d.lv.grid.forEach((row, y) => row.forEach((c, x) => {
        if (!c) return; const cx = OX + x * S + S / 2, cy = OY + y * S + S / 2;
        if (c.t === 'w') { ctx.fillStyle = '#2A2A3D'; ctx.fillRect(cx - S / 2 + 3, cy - S / 2 + 3, S - 6, S - 6); }
        if (c.t === 'c') { const on = tr.lit.has(x + ',' + y); ctx.fillStyle = on ? '#4ECDC4' : 'rgba(78,205,196,.25)'; ctx.shadowColor = '#4ECDC4'; ctx.shadowBlur = on ? 22 : 0; ctx.beginPath(); ctx.moveTo(cx, cy - 15); ctx.lineTo(cx + 11, cy); ctx.lineTo(cx, cy + 15); ctx.lineTo(cx - 11, cy); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; }
        if (c.t === 'm') { ctx.save(); ctx.translate(cx, cy); ctx.rotate(c.vis != null ? c.vis : (c.vis = c.m ? Math.PI / 4 : -Math.PI / 4)); c.vis += ((c.m ? Math.PI / 4 : -Math.PI / 4) - c.vis) * .3; ctx.fillStyle = '#C8C8E8'; ctx.fillRect(-S * .42, -2.5, S * .84, 5); ctx.restore(); }
      }));
      const sx = OX - 10, sy = OY + d.lv.src.y * S + S / 2; ctx.fillStyle = '#FFE66D'; ctx.beginPath(); ctx.moveTo(sx - 10, sy - 10); ctx.lineTo(sx + 6, sy); ctx.lineTo(sx - 10, sy + 10); ctx.fill();
      ctx.fillStyle = 'rgba(240,240,255,.5)'; ctx.font = `12px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText(`${tr.hit} / ${d.lv.crystals} crystals lit`, W / 2, OY + N * S + 30);
    },
    down(g, x, y) {
      const d = g.data; if (d.solved > 0) return;
      const cx = Math.floor((x - OX) / S), cy = Math.floor((y - OY) / S); if (cx < 0 || cy < 0 || cx >= N || cy >= N) return;
      const c = d.lv.grid[cy][cx]; if (!c || c.t !== 'm') return;
      c.m = 1 - c.m; d.taps++; g.sfx(700, .04, 'triangle', .04);
      const tr = trace(d.lv.grid, d.lv.src);
      if (tr.hit === d.lv.crystals) { const pts = g.add(Math.max(50, 300 - d.taps * 20) + Math.round(d.energy * 2)); g.text(`ALL LIT +${pts}`, W / 2, OY - 20, '#4ECDC4', 18); g.snd.win(); g.shake(5); g.burst(W / 2, OY + N * S / 2, ['#FFE66D', '#4ECDC4', '#fff'], 60, 260); d.solved = 1; d.energy = Math.min(100, d.energy + 40); g.setMult(1 + d.level * .2); }
    }
  });
  function load(g) { const d = g.data; d.lv = gen(d.level); d.taps = 0; }
})();
