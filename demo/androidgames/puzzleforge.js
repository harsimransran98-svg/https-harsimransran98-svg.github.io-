/* Puzzle Forge — match-3 that feeds a blacksmith's forge. */
(() => {
  const W = 360, H = 640, N = 7, S = 46, OX = (W - N * S) / 2, OY = 170;
  const MAT = [['#B0B7C3', 'iron'], ['#E07A1F', 'copper'], ['#F4D35E', 'gold'], ['#4EA8DE', 'sapphire'], ['#E5383B', 'ruby'], ['#6A994E', 'jade']];
  Arcade.start({
    id: 'puzzleforge', W, H, title: 'Puzzle Forge', overText: 'The forge went cold. Chain cascades to keep the heat up.',
    hint: 'Swap neighbouring tiles to line up three or more. Every match heats the forge. Fill it to craft a blade before the fire dies.',
    init(g) {
      const d = g.data; Object.assign(d, { b: [], sel: null, heat: 40, blades: 0, busy: 0, chain: 0, drag: null });
      do { d.b = Array.from({ length: N }, () => Array.from({ length: N }, () => ({ t: Math.floor(Math.random() * MAT.length), y: 0, pop: 0 }))); } while (matches(d).length);
    },
    update(g, dt) {
      const d = g.data;
      d.heat -= dt * (3 + d.blades * .6); if (d.heat <= 0) { g.over(`You forged ${d.blades} blade${d.blades === 1 ? '' : 's'}.`); return; }
      let moving = false; d.b.forEach(col => col.forEach(c => { if (c && c.y > 0) { c.y = Math.max(0, c.y - dt * 9); moving = true; } if (c && c.pop > 0) { c.pop -= dt * 4; } }));
      if (d.busy > 0) { d.busy -= dt; if (d.busy <= 0) resolve(g); } else if (!moving && d.chain) { d.chain = 0; g.setMult(1); }
      if (d.sw) { d.sw.t += dt * 6; if (d.sw.t >= 1) { const { a, b, back } = d.sw; d.sw = null; if (!back) { if (matches(d).length) resolve(g); else { swap(d, a, b); d.sw = { a, b, t: 0, back: true }; g.snd.bad(); } } } }
    },
    draw(g, ctx) {
      const d = g.data;
      ctx.fillStyle = '#1C1410'; ctx.fillRect(0, 0, W, H);
      if (!d.b.length) return;
      // forge meter
      const fx = 18, fy = 102, fw = W - 36; ctx.fillStyle = '#2E221B'; ctx.beginPath(); ctx.roundRect(fx, fy, fw, 18, 9); ctx.fill();
      const gr = ctx.createLinearGradient(fx, 0, fx + fw, 0); gr.addColorStop(0, '#FF7A00'); gr.addColorStop(1, '#FFD166'); ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(fx, fy, fw * Math.min(1, d.heat / 100), 18, 9); ctx.fill();
      ctx.fillStyle = '#F5E6D3'; ctx.font = `${g.fw} 12px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`FORGE HEAT · ${d.blades} BLADES`, fx, fy + 36);
      for (let i = 0; i < 6; i++) { ctx.fillStyle = `rgba(255,122,0,${.15 + Math.random() * .2})`; ctx.beginPath(); ctx.arc(fx + fw * Math.min(1, d.heat / 100) - 6, fy + 9 - Math.random() * 14, 2, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#2A1E17'; ctx.beginPath(); ctx.roundRect(OX - 6, OY - 6, N * S + 12, N * S + 12, 14); ctx.fill();
      for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
        const c = d.b[x][y]; if (!c) continue;
        let px = OX + x * S, py = OY + (y - c.y) * S;
        if (d.sw) { const t = Math.min(1, d.sw.t), e = t * t * (3 - 2 * t); const { a, b } = d.sw; if (a[0] === x && a[1] === y) { px += (b[0] - a[0]) * S * (1 - e); py += (b[1] - a[1]) * S * (1 - e); } if (b[0] === x && b[1] === y) { px += (a[0] - b[0]) * S * (1 - e); py += (a[1] - b[1]) * S * (1 - e); } }
        const [col] = MAT[c.t], s = c.pop > 0 ? 1 + c.pop * .3 : 1, sel = d.sel && d.sel[0] === x && d.sel[1] === y;
        ctx.save(); ctx.translate(px + S / 2, py + S / 2); ctx.scale(s, s);
        ctx.fillStyle = col; ctx.beginPath();
        if (c.t % 3 === 0) ctx.roundRect(-17, -17, 34, 34, 8); else if (c.t % 3 === 1) { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.lineTo(Math.cos(a) * 19, Math.sin(a) * 19); } } else { ctx.moveTo(0, -20); ctx.lineTo(18, 0); ctx.lineTo(0, 20); ctx.lineTo(-18, 0); }
        ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.arc(-6, -7, 5, 0, 7); ctx.fill();
        if (sel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(-21, -21, 42, 42); }
        ctx.restore();
      }
      ctx.fillStyle = 'rgba(245,230,211,.5)'; ctx.font = `12px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText('match ore and gems to stoke the fire', W / 2, OY + N * S + 32);
    },
    down(g, x, y) { const d = g.data; const cx = Math.floor((x - OX) / S), cy = Math.floor((y - OY) / S); if (cx < 0 || cy < 0 || cx >= N || cy >= N) return; d.drag = [cx, cy, x, y]; pick(g, cx, cy); },
    move(g, x, y, isDown) { const d = g.data; if (!isDown || !d.drag) return; const dx = x - d.drag[2], dy = y - d.drag[3]; if (Math.max(Math.abs(dx), Math.abs(dy)) > S * .5) { const [cx, cy] = d.drag; d.drag = null; d.sel = [cx, cy]; pick(g, cx + (Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0), cy + (Math.abs(dy) >= Math.abs(dx) ? Math.sign(dy) : 0)); } },
    up(g) { g.data.drag = null; }
  });
  function pick(g, x, y) {
    const d = g.data; if (d.busy > 0 || d.sw || x < 0 || y < 0 || x >= N || y >= N) return;
    if (!d.sel) { d.sel = [x, y]; g.snd.tap(); return; }
    const [sx, sy] = d.sel; if (sx === x && sy === y) { d.sel = null; return; }
    if (Math.abs(sx - x) + Math.abs(sy - y) !== 1) { d.sel = [x, y]; return; }
    d.sel = null; swap(d, [sx, sy], [x, y]); d.sw = { a: [sx, sy], b: [x, y], t: 0 }; g.sfx(440, .05, 'triangle', .04);
  }
  function swap(d, a, b) { const t = d.b[a[0]][a[1]]; d.b[a[0]][a[1]] = d.b[b[0]][b[1]]; d.b[b[0]][b[1]] = t; }
  function matches(d) {
    const out = new Set();
    for (let y = 0; y < N; y++) for (let x = 0; x < N - 2; x++) { const t = d.b[x][y] && d.b[x][y].t; if (t != null && d.b[x + 1][y] && d.b[x + 2][y] && d.b[x + 1][y].t === t && d.b[x + 2][y].t === t) [0, 1, 2].forEach(i => out.add((x + i) + ',' + y)); }
    for (let x = 0; x < N; x++) for (let y = 0; y < N - 2; y++) { const t = d.b[x][y] && d.b[x][y].t; if (t != null && d.b[x][y + 1] && d.b[x][y + 2] && d.b[x][y + 1].t === t && d.b[x][y + 2].t === t) [0, 1, 2].forEach(i => out.add(x + ',' + (y + i))); }
    return [...out].map(s => s.split(',').map(Number));
  }
  function resolve(g) {
    const d = g.data, m = matches(d); if (!m.length) return;
    d.chain++; g.setMult(Math.min(5, d.chain));
    m.forEach(([x, y]) => { const c = d.b[x][y]; g.burst(OX + x * S + S / 2, OY + y * S + S / 2, [MAT[c.t][0], '#FFD166'], 6, 150, .5, 2.5); d.b[x][y] = null; });
    g.add(10 * m.length, W / 2, OY - 10, '#FFD166'); d.heat = Math.min(100, d.heat + m.length * 2.2);
    if (d.chain > 1) g.text(`CASCADE ×${d.chain}`, W / 2, OY + N * S / 2, '#FF7A00', 18);
    g.sfx(600 + d.chain * 120, .08, 'square', .035); g.shake(2 + d.chain, .12);
    if (d.heat >= 100) { d.blades++; d.heat = 45; const b = g.add(300 * d.blades); g.text(`⚔ BLADE FORGED +${b}`, W / 2, 150, '#FFD166', 17); g.snd.win(); g.shake(8, .3); g.burst(W - 30, 110, ['#FF7A00', '#FFD166', '#fff'], 40, 220); }
    // gravity + refill
    for (let x = 0; x < N; x++) {
      const kept = []; d.b[x].forEach((c, y) => { if (c) kept.push([c, y]); });
      const miss = N - kept.length, col = [];
      for (let i = 0; i < miss; i++) col.push({ t: Math.floor(Math.random() * MAT.length), y: miss + 1, pop: 0 });
      kept.forEach(([c, oldY], i) => { c.y += (miss + i) - oldY; col.push(c); });
      d.b[x] = col;
    }
    d.busy = .32;
  }
})();
