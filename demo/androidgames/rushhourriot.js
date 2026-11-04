/* Rush Hour Riot — sliding traffic puzzle. Levels are hand-made and solvable. */
(() => {
  const W = 360, H = 640, N = 6, S = 54, OX = (W - N * S) / 2, OY = 150;
  // [x, y, length, horizontal?] — first car is the red one on row 2. Generated and verified solvable by a BFS solver; par = shortest solution.
  const LEVELS = [
    [[0,  2,  2,  1],  [4,  1,  2,  0],  [1,  5,  3,  1],  [2,  2,  2,  0],  [0,  4,  2,  1],  [5,  3,  3,  0],  [3,  2,  3,  0],  [2,  0,  2,  0],  [4,  0,  2,  1]],
    [[2,  2,  2,  1],  [0,  1,  2,  1],  [4,  0,  2,  1],  [4,  1,  2,  0],  [2,  5,  2,  1],  [5,  3,  2,  0],  [2,  3,  2,  1],  [4,  3,  2,  0],  [1,  3,  2,  0],  [2,  0,  2,  0],  [0,  0,  2,  1]],
    [[0,  2,  2,  1],  [0,  0,  3,  1],  [3,  1,  2,  1],  [0,  1,  2,  1],  [2,  4,  2,  1],  [2,  5,  3,  1],  [2,  1,  3,  0],  [5,  1,  3,  0],  [3,  2,  2,  0],  [0,  4,  2,  0]],
    [[0,  2,  2,  1],  [2,  2,  2,  0],  [1,  1,  2,  1],  [2,  0,  3,  1],  [4,  2,  3,  0],  [5,  2,  3,  0],  [5,  0,  2,  0],  [1,  4,  3,  1],  [0,  3,  3,  0],  [1,  5,  3,  1],  [0,  0,  2,  0]],
    [[1,  2,  2,  1],  [0,  0,  2,  0],  [3,  2,  2,  0],  [3,  0,  2,  0],  [5,  1,  3,  0],  [0,  3,  2,  1],  [1,  4,  2,  0],  [3,  4,  2,  1],  [2,  3,  2,  0]]
  ];
  const COLS = ['#0077B6', '#2A9D8F', '#8338EC', '#FFB703', '#06D6A0', '#3A86FF', '#FB5607', '#6D6875'];
  Arcade.start({
    id: 'rushhourriot', W, H, title: 'Rush Hour Riot', overTitle: 'All jams cleared!',
    hint: 'Drag cars along their lane, or click a car and use the arrow keys. Get the red car out of the exit on the right.',
    init(g) { Object.assign(g.data, { lvl: 0, moves: 0, sel: 0, drag: null, exit: 0, history: [] }); load(g); },
    update(g, dt) {
      const d = g.data;
      d.cars.forEach(c => { c.dx += (c.x - c.dx) * Math.min(1, dt * 16); c.dy += (c.y - c.dy) * Math.min(1, dt * 16); });
      if (d.exit > 0) { d.exit += dt; d.cars[0].dx += dt * 14; if (d.exit > .9) next(g); }
    },
    draw(g, ctx) {
      const d = g.data;
      ctx.fillStyle = '#FFF4CC'; ctx.fillRect(0, 0, W, H);
      if (!d.cars) return;
      ctx.fillStyle = '#1D1D1D'; ctx.font = `30px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`LEVEL ${d.lvl + 1}/${LEVELS.length}`, OX, 120); ctx.textAlign = 'right'; ctx.fillText(`MOVES ${d.moves}`, OX + N * S, 120);
      ctx.fillStyle = '#3D3D3D'; ctx.beginPath(); ctx.roundRect(OX - 10, OY - 10, N * S + 20, N * S + 20, 16); ctx.fill();
      ctx.fillStyle = '#4A4A4A'; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) ctx.fillRect(OX + x * S + 2, OY + y * S + 2, S - 4, S - 4);
      ctx.fillStyle = '#FFF4CC'; ctx.fillRect(OX + N * S, OY + 2 * S + 4, 14, S - 8);
      ctx.fillStyle = '#FF4D00'; ctx.font = `18px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText('EXIT →', OX + N * S - 30, OY + 2 * S - 8);
      d.cars.forEach((c, i) => {
        const x = OX + c.dx * S, y = OY + c.dy * S, w = (c.h ? c.len : 1) * S, h = (c.h ? 1 : c.len) * S;
        ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.roundRect(x + 5, y + 7, w - 8, h - 8, 10); ctx.fill();
        ctx.fillStyle = i === 0 ? '#FF4D00' : COLS[i % COLS.length]; ctx.beginPath(); ctx.roundRect(x + 3, y + 3, w - 6, h - 6, 10); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)'; if (c.h) { ctx.fillRect(x + w - 22, y + 10, 8, h - 20); ctx.fillRect(x + 12, y + 10, 6, h - 20); } else { ctx.fillRect(x + 10, y + 12, w - 20, 7); ctx.fillRect(x + 10, y + h - 18, w - 20, 5); }
        if (i === d.sel) { ctx.strokeStyle = '#1D1D1D'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x + 1, y + 1, w - 2, h - 2, 12); ctx.stroke(); ctx.lineWidth = 1; }
      });
      ctx.fillStyle = 'rgba(29,29,29,.55)'; ctx.font = `16px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText(`PAR ${d.par} · ⭐⭐⭐ AT PAR OR LESS · U = UNDO`, W / 2, OY + N * S + 44);
    },
    down(g, x, y) { const d = g.data; if (d.exit) return; const gx = (x - OX) / S, gy = (y - OY) / S, i = d.cars.findIndex(c => gx >= c.x && gx < c.x + (c.h ? c.len : 1) && gy >= c.y && gy < c.y + (c.h ? 1 : c.len)); if (i < 0) return; d.sel = i; d.drag = { i, sx: x, sy: y, ox: d.cars[i].x, oy: d.cars[i].y }; g.snd.tap(); },
    move(g, x, y, isDown) { const d = g.data; if (!isDown || !d.drag) return; const c = d.cars[d.drag.i], delta = Math.round((c.h ? x - d.drag.sx : y - d.drag.sy) / S), target = (c.h ? d.drag.ox : d.drag.oy) + delta; slideTo(g, d.drag.i, target); },
    up(g) { const d = g.data; if (!d.drag) return; const c = d.cars[d.drag.i]; if (c.x !== d.drag.ox || c.y !== d.drag.oy) { d.moves++; d.history.push([d.drag.i, d.drag.ox, d.drag.oy]); g.sfx(300, .06, 'square', .03); check(g); } d.drag = null; },
    key(g, k, down) {
      if (!down) return; const d = g.data; if (d.exit) return;
      if (k === 'Tab' || k === 'n') { d.sel = (d.sel + 1) % d.cars.length; return; }
      if (k === 'u' || k === 'U') { const h = d.history.pop(); if (h) { d.cars[h[0]].x = h[1]; d.cars[h[0]].y = h[2]; d.moves++; } return; }
      const c = d.cars[d.sel], dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k]; if (!dir) return;
      if ((c.h && dir[1]) || (!c.h && dir[0])) return;
      const ox = c.x, oy = c.y; slideTo(g, d.sel, (c.h ? c.x : c.y) + (dir[0] || dir[1]));
      if (c.x !== ox || c.y !== oy) { d.moves++; d.history.push([d.sel, ox, oy]); g.sfx(300, .06, 'square', .03); check(g); }
    }
  });
  function occupied(d, skip) { const o = new Set(); d.cars.forEach((c, i) => { if (i === skip) return; for (let k = 0; k < c.len; k++) o.add(c.h ? `${c.x + k},${c.y}` : `${c.x},${c.y + k}`); }); return o; }
  function slideTo(g, i, target) {
    const d = g.data, c = d.cars[i], occ = occupied(d, i), cur = c.h ? c.x : c.y, dir = Math.sign(target - cur); let pos = cur;
    while (pos !== target) { const n = pos + dir, lead = dir > 0 ? n + c.len - 1 : n; if (lead < 0 || lead >= N || occ.has(c.h ? `${lead},${c.y}` : `${c.x},${lead}`)) break; pos = n; }
    if (c.h) c.x = pos; else c.y = pos;
  }
  function check(g) { const d = g.data, r = d.cars[0]; if (r.x + r.len === N) { d.exit = .01; const stars = d.moves <= d.par ? 3 : d.moves <= d.par + 4 ? 2 : 1; const pts = g.add(200 * stars + Math.max(0, 30 - d.moves) * 10, W / 2, OY + 2 * S, '#FF4D00'); g.text('⭐'.repeat(stars), W / 2, OY + 3 * S + 20, '#FFB703', 28); g.burst(OX + N * S, OY + 2.5 * S, ['#FF4D00', '#FFB703', '#0077B6'], 50, 260); g.snd.win(); g.shake(6); g.setMult(1 + stars * .25); } }
  function load(g) { const d = g.data; d.cars = LEVELS[d.lvl].map(([x, y, len, h]) => ({ x, y, len, h: !!h, dx: x, dy: y })); d.moves = 0; d.sel = 0; d.exit = 0; d.history = []; d.par = [5, 7, 11, 11, 13][d.lvl]; }
  function next(g) { const d = g.data; d.lvl++; if (d.lvl >= LEVELS.length) { g.over('Every jam cleared. Your best score is saved.'); return; } load(g); g.text(`LEVEL ${d.lvl + 1}`, W / 2, OY - 40, '#0077B6', 28); }
})();
