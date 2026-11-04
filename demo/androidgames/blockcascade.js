/* Block Cascade — falling-block puzzle with cascade combos. */
(() => {
  const W = 360, H = 640, C = 10, R = 18, S = 26, OX = (W - C * S) / 2, OY = 118;
  const SHAPES = { I: [[0, 1], [1, 1], [2, 1], [3, 1]], O: [[1, 0], [2, 0], [1, 1], [2, 1]], T: [[1, 0], [0, 1], [1, 1], [2, 1]], S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], L: [[2, 0], [0, 1], [1, 1], [2, 1]] };
  const COL = { I: '#22D3EE', O: '#FACC15', T: '#A855F7', S: '#4ADE80', Z: '#F43F5E', J: '#3B82F6', L: '#F97316' };
  const keys = Object.keys(SHAPES);
  const rot = cells => cells.map(([x, y]) => [2 - y, x]);
  function spawn(g) {
    const d = g.data, k = d.next || g.pick(keys); d.next = g.pick(keys);
    d.p = { k, cells: SHAPES[k].map(c => c.slice()), x: 3, y: -1 };
    if (!fits(d, d.p.cells, d.p.x, d.p.y)) { g.burst(W / 2, OY + 40, ['#F97316', '#22D3EE'], 50, 260); g.over(`The stack topped out on level ${d.level}.`); }
  }
  function fits(d, cells, x, y) { return cells.every(([cx, cy]) => { const X = x + cx, Y = y + cy; return X >= 0 && X < C && Y < R && (Y < 0 || !d.grid[Y][X]); }); }
  Arcade.start({
    id: 'blockcascade', W, H, title: 'Block Cascade', overText: 'Topped out. Clear lines back to back for cascade combos.',
    hint: 'Arrow keys or swipe to move, ↑ or tap to rotate, ↓ or swipe down to drop. Clear lines back to back to cascade.',
    init(g) { const d = g.data; Object.assign(d, { grid: Array.from({ length: R }, () => Array(C).fill(null)), fallT: 0, level: 1, lines: 0, chain: 0, flash: [], sx: null }); spawn(g); },
    update(g, dt) {
      const d = g.data; if (!d.p) return;
      d.fallT += dt; const iv = Math.max(.08, .7 - (d.level - 1) * .055);
      if (d.fallT > iv) { d.fallT = 0; step(g); }
      d.flash.forEach(f => f.t -= dt); d.flash = d.flash.filter(f => f.t > 0);
    },
    draw(g, ctx) {
      const d = g.data;
      ctx.fillStyle = '#101828'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#0B1220'; ctx.fillRect(OX - 4, OY - 4, C * S + 8, R * S + 8);
      ctx.strokeStyle = 'rgba(255,255,255,.04)'; for (let x = 0; x <= C; x++) { ctx.beginPath(); ctx.moveTo(OX + x * S, OY); ctx.lineTo(OX + x * S, OY + R * S); ctx.stroke(); }
      if (!d.grid) return;
      const cell = (x, y, c, a = 1) => { if (y < 0) return; ctx.globalAlpha = a; ctx.fillStyle = c; ctx.fillRect(OX + x * S + 1, OY + y * S + 1, S - 2, S - 2); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(OX + x * S + 1, OY + y * S + 1, S - 2, 4); ctx.globalAlpha = 1; };
      d.grid.forEach((row, y) => row.forEach((c, x) => c && cell(x, y, c)));
      d.flash.forEach(f => { ctx.fillStyle = `rgba(255,255,255,${f.t * 3})`; ctx.fillRect(OX, OY + f.y * S, C * S, S); });
      if (d.p) {
        let gy = d.p.y; while (fits(d, d.p.cells, d.p.x, gy + 1)) gy++;
        d.p.cells.forEach(([cx, cy]) => { if (gy + cy >= 0) { ctx.strokeStyle = COL[d.p.k]; ctx.globalAlpha = .45; ctx.strokeRect(OX + (d.p.x + cx) * S + 2, OY + (gy + cy) * S + 2, S - 4, S - 4); ctx.globalAlpha = 1; } });
        d.p.cells.forEach(([cx, cy]) => cell(d.p.x + cx, d.p.y + cy, COL[d.p.k]));
      }
      ctx.fillStyle = '#EEF2F7'; ctx.font = `13px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`LEVEL ${d.level}`, OX, OY + R * S + 26); ctx.textAlign = 'right'; ctx.fillText(`LINES ${d.lines}`, OX + C * S, OY + R * S + 26);
      if (d.next) { ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(238,242,247,.5)'; ctx.font = `11px ${g.font}`; ctx.fillText('NEXT', W / 2 - 40, OY + R * S + 52); SHAPES[d.next].forEach(([x, y]) => { ctx.fillStyle = COL[d.next]; ctx.fillRect(W / 2 - 10 + x * 12, OY + R * S + 40 + y * 12, 11, 11); }); }
    },
    key(g, k, down) {
      if (!down) return; const d = g.data; if (!d.p) return;
      if (k === 'ArrowLeft' || k === 'a') move(g, -1); if (k === 'ArrowRight' || k === 'd') move(g, 1);
      if (k === 'ArrowUp' || k === 'w' || k === 'x') rotate(g); if (k === 'ArrowDown' || k === 's') step(g, true); if (k === ' ') hard(g);
    },
    down(g, x, y) { g.data.sx = x; g.data.sy = y; g.data.moved = 0; },
    move(g, x, y, isDown) { const d = g.data; if (!isDown || d.sx == null) return; const dx = x - d.sx; if (Math.abs(dx) > S) { move(g, Math.sign(dx)); d.sx = x; d.moved++; } if (y - d.sy > 70 && d.moved === 0) { hard(g); d.sx = null; } },
    up(g) { const d = g.data; if (d.sx != null && d.moved === 0) rotate(g); d.sx = null; }
  });
  function move(g, dx) { const d = g.data; if (fits(d, d.p.cells, d.p.x + dx, d.p.y)) { d.p.x += dx; g.sfx(400, .03, 'square', .02); } }
  function rotate(g) { const d = g.data; if (d.p.k === 'O') return; const r = rot(d.p.cells); for (const k of [0, -1, 1, -2, 2]) if (fits(d, r, d.p.x + k, d.p.y)) { d.p.cells = r; d.p.x += k; g.sfx(600, .04, 'triangle', .03); return; } }
  function hard(g) { const d = g.data; let n = 0; while (fits(d, d.p.cells, d.p.x, d.p.y + 1)) { d.p.y++; n++; } g.add(n * 2); g.shake(4, .12); lock(g); }
  function step(g, soft) { const d = g.data; if (fits(d, d.p.cells, d.p.x, d.p.y + 1)) { d.p.y++; if (soft) g.add(1); } else lock(g); }
  function lock(g) {
    const d = g.data;
    d.p.cells.forEach(([cx, cy]) => { const y = d.p.y + cy; if (y >= 0) d.grid[y][d.p.x + cx] = COL[d.p.k]; });
    g.sfx(220, .06, 'triangle', .04);
    const full = []; d.grid.forEach((row, y) => { if (row.every(Boolean)) full.push(y); });
    if (full.length) {
      d.chain++; g.setMult(Math.min(8, d.chain));
      full.forEach(y => { d.flash.push({ y, t: .3 }); for (let x = 0; x < C; x++) g.burst(OX + x * S + S / 2, OY + y * S + S / 2, d.grid[y][x], 4, 140, .5, 2.5); });
      d.grid = d.grid.filter((_, y) => !full.includes(y)); while (d.grid.length < R) d.grid.unshift(Array(C).fill(null));
      const pts = [0, 100, 300, 500, 800][full.length]; g.add(pts * d.level, W / 2, OY + full[0] * S, '#F97316');
      if (d.chain > 1) g.text(`CASCADE ×${d.chain}`, W / 2, OY + 120, '#22D3EE', 20);
      g.shake(3 + full.length * 2, .2); g.snd.pick();
      d.lines += full.length; const lv = 1 + Math.floor(d.lines / 8); if (lv > d.level) { d.level = lv; g.text(`LEVEL ${lv}`, W / 2, OY + 200, '#FACC15', 22); g.snd.win(); }
    } else if (d.chain) { d.chain = 0; g.setMult(1); }
    spawn(g);
  }
})();
