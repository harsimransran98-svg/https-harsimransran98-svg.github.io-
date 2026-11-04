/* Puzzle Loop — rotate pipes to connect the source to the drain.
   Boards are generated from a random spanning path, then scrambled, so they are always solvable. */
(() => {
  const W = 360, H = 640;
  const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0]; // N E S W bit 1,2,4,8
  const rotBits = b => ((b << 1) | (b >> 3)) & 15;
  function gen(n) {
    const bits = Array.from({ length: n }, () => Array(n).fill(0)), seen = new Set(['0,0']), stack = [[0, 0]];
    while (stack.length) { const [x, y] = stack[stack.length - 1], nb = [0, 1, 2, 3].filter(d => { const a = x + DX[d], b = y + DY[d]; return a >= 0 && b >= 0 && a < n && b < n && !seen.has(a + ',' + b); }); if (!nb.length) { stack.pop(); continue; } const d = nb[Math.floor(Math.random() * nb.length)], a = x + DX[d], b = y + DY[d]; bits[y][x] |= 1 << d; bits[b][a] |= 1 << ((d + 2) % 4); seen.add(a + ',' + b); stack.push([a, b]); }
    const cells = bits.map(r => r.map(b => { let r2 = b; const k = Math.floor(Math.random() * 4); for (let i = 0; i < k; i++) r2 = rotBits(r2); return { b: r2, vis: 0, want: b }; }));
    return { n, cells };
  }
  function flow(lv) {
    const { n, cells } = lv, lit = new Set(['0,0']), q = [[0, 0]];
    while (q.length) { const [x, y] = q.shift(), b = cells[y][x].b; for (let d = 0; d < 4; d++) { if (!(b & (1 << d))) continue; const a = x + DX[d], c = y + DY[d]; if (a < 0 || c < 0 || a >= n || c >= n) continue; if (!(cells[c][a].b & (1 << ((d + 2) % 4)))) continue; const k = a + ',' + c; if (!lit.has(k)) { lit.add(k); q.push([a, c]); } } }
    return lit;
  }
  Arcade.start({
    id: 'puzzleloop', W, H, title: 'Puzzle Loop', overTitle: 'Time for a break',
    hint: 'Tap a tile to rotate it. Connect every pipe so water flows from the top-left source through the whole board.',
    init(g) { Object.assign(g.data, { level: 1, taps: 0, done: 0, time: 90 }); load(g); },
    update(g, dt) {
      const d = g.data; d.lv.cells.flat().forEach(c => { c.vis += (0 - c.vis) * Math.min(1, dt * 14); });
      if (d.done > 0) { d.done -= dt; if (d.done <= 0) { d.level++; load(g); } return; }
      d.time -= dt; if (d.time <= 0) g.over(`You solved ${d.level - 1} board${d.level === 2 ? '' : 's'}.`);
    },
    draw(g, ctx) {
      const d = g.data; ctx.fillStyle = '#0E2A2F'; ctx.fillRect(0, 0, W, H);
      if (!d.lv) return;
      const { n, cells } = d.lv, S = Math.floor((W - 40) / n), ox = (W - S * n) / 2, oy = 160, lit = flow(d.lv);
      ctx.fillStyle = '#E6FFFB'; ctx.font = `14px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`BOARD ${d.level} · ${n}×${n}`, ox, 118); ctx.textAlign = 'right'; ctx.fillStyle = d.time < 15 ? '#FF9F1C' : '#E6FFFB'; ctx.fillText(`${Math.ceil(d.time)}s · ${d.taps} taps`, ox + S * n, 118);
      ctx.fillStyle = 'rgba(46,196,182,.15)'; ctx.fillRect(ox, 132, S * n, 5); ctx.fillStyle = '#2EC4B6'; ctx.fillRect(ox, 132, S * n * lit.size / (n * n), 5);
      cells.forEach((row, y) => row.forEach((c, x) => {
        const cx = ox + x * S + S / 2, cy = oy + y * S + S / 2, on = lit.has(x + ',' + y);
        ctx.fillStyle = on ? 'rgba(46,196,182,.12)' : 'rgba(230,255,251,.04)'; ctx.beginPath(); ctx.roundRect(ox + x * S + 2, oy + y * S + 2, S - 4, S - 4, 8); ctx.fill();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(c.vis); ctx.strokeStyle = on ? '#2EC4B6' : '#3E5C61'; ctx.lineWidth = S * .2; ctx.lineCap = 'round'; if (on) { ctx.shadowColor = '#2EC4B6'; ctx.shadowBlur = 10; }
        for (let k = 0; k < 4; k++) if (c.b & (1 << k)) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(DX[k] * S / 2, DY[k] * S / 2); ctx.stroke(); }
        ctx.fillStyle = on ? '#2EC4B6' : '#3E5C61'; ctx.beginPath(); ctx.arc(0, 0, S * .12, 0, 7); ctx.fill(); ctx.restore(); ctx.shadowBlur = 0;
      }));
      ctx.fillStyle = '#FF9F1C'; ctx.beginPath(); ctx.arc(ox - 6, oy + S / 2, 8, 0, 7); ctx.fill(); ctx.lineCap = 'butt';
    },
    down(g, x, y) {
      const d = g.data; if (d.done > 0) return; const { n, cells } = d.lv, S = Math.floor((W - 40) / n), ox = (W - S * n) / 2, oy = 160;
      const cx = Math.floor((x - ox) / S), cy = Math.floor((y - oy) / S); if (cx < 0 || cy < 0 || cx >= n || cy >= n) return;
      const c = cells[cy][cx]; c.b = rotBits(c.b); c.vis = -Math.PI / 2; d.taps++; g.sfx(380 + flow(d.lv).size * 12, .05, 'triangle', .04);
      if (flow(d.lv).size === n * n) { const pts = g.add(100 * n + Math.max(0, n * n * 3 - d.taps) * 10 + Math.round(d.time)); g.text(`FLOWING! +${pts}`, W / 2, 150, '#2EC4B6', 18); g.snd.win(); g.shake(6); g.burst(W / 2, 160 + S * n / 2, ['#2EC4B6', '#FF9F1C', '#E6FFFB'], 70, 280); d.done = 1.1; d.time = Math.min(120, d.time + 30); g.setMult(1 + d.level * .25); }
    }
  });
  function load(g) { const d = g.data, n = Math.min(8, 4 + Math.floor((d.level - 1) / 2)); let lv; do { lv = gen(n); } while (flow(lv).size === n * n); d.lv = lv; d.taps = 0; }
})();
