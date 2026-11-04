/* Tiny Kingdoms — idle island city-builder with neighbour bonuses. Progress saved locally. */
(() => {
  const W = 360, H = 640, N = 6, S = 50, OX = (W - N * S) / 2, OY = 130;
  const B = [
    { k: 'farm', name: 'Farm', e: '🌾', cost: 20, inc: 1, likes: 'mill', col: '#C9E4A0' },
    { k: 'mill', name: 'Mill', e: '🏭', cost: 60, inc: 3, likes: 'farm', col: '#E9D8A6' },
    { k: 'house', name: 'House', e: '🏠', cost: 120, inc: 6, likes: 'market', col: '#F4ACB7' },
    { k: 'market', name: 'Market', e: '🏪', cost: 300, inc: 14, likes: 'house', col: '#A2D2FF' }
  ];
  const land = (x, y) => Math.hypot(x - 2.5, (y - 2.5) * 1.1) < 3.1;
  Arcade.start({
    id: 'tinykingdoms', W, H, title: 'Tiny Kingdoms', overTitle: 'Kingdom saved',
    hint: 'Pick a building at the bottom, then tap empty grass to build. Buildings next to the ones they like earn double.',
    init(g) {
      const s = g.store.get('bz_kingdom', null) || { gold: 30, total: 0, map: [] };
      Object.assign(g.data, { gold: s.gold, total: s.total, map: Array.from({ length: N }, (_, y) => Array.from({ length: N }, (_, x) => (s.map[y] && s.map[y][x]) || null)), sel: 0, pops: [], saveT: 0 });
      g.setScore(Math.floor(s.total));
    },
    update(g, dt) {
      const d = g.data, inc = income(d); d.gold += inc * dt; d.total += inc * dt; g.setScore(Math.floor(d.total));
      d.pops.forEach(p => p.t += dt); d.pops = d.pops.filter(p => p.t < .5);
      d.saveT += dt; if (d.saveT > 2) { d.saveT = 0; save(g); }
      if (Math.random() < dt * Math.min(3, inc / 8)) { const cells = []; d.map.forEach((r, y) => r.forEach((c, x) => c && cells.push([x, y]))); if (cells.length) { const [x, y] = g.pick(cells); g.text('+◉', OX + x * S + S / 2, OY + y * S + 8, '#F77F00', 11); } }
    },
    draw(g, ctx) {
      const d = g.data;
      ctx.fillStyle = '#48CAE4'; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 12; i++) { ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); const y = 100 + (i * 47) % 520, x = (i * 89 + g.t * 12) % (W + 60) - 30; ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y - 4, x + 20, y); ctx.stroke(); }
      if (!d.map) return;
      ctx.fillStyle = '#1B4332'; ctx.font = `20px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`◉ ${Math.floor(d.gold).toLocaleString()}`, 16, 106); ctx.textAlign = 'right'; ctx.font = `15px ${g.font}`; ctx.fillText(`${income(d).toFixed(1)} gold/s`, W - 16, 104);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        if (!land(x, y)) continue; const px = OX + x * S, py = OY + y * S;
        ctx.fillStyle = (x + y) % 2 ? '#95D5B2' : '#8ACCA6'; ctx.fillRect(px, py, S, S);
        const c = d.map[y][x]; if (!c) continue; const b = B.find(q => q.k === c), pop = d.pops.find(p => p.x === x && p.y === y), s = pop ? 1 + Math.sin(pop.t * Math.PI * 2) * .25 * (1 - pop.t * 2) : 1;
        ctx.fillStyle = b.col; ctx.beginPath(); ctx.roundRect(px + 4, py + 4, S - 8, S - 8, 10); ctx.fill();
        if (bonus(d, x, y)) { ctx.strokeStyle = '#F77F00'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(px + 4, py + 4, S - 8, S - 8, 10); ctx.stroke(); ctx.lineWidth = 1; }
        ctx.save(); ctx.translate(px + S / 2, py + S / 2 + 2); ctx.scale(s, s); ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.e, 0, 0); ctx.restore(); ctx.textBaseline = 'alphabetic';
      }
      B.forEach((b, i) => { const x = 12 + i * 85, y = 470; ctx.fillStyle = i === d.sel ? '#F77F00' : 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.roundRect(x, y, 80, 92, 14); ctx.fill(); ctx.textAlign = 'center'; ctx.font = '26px sans-serif'; ctx.fillText(b.e, x + 40, y + 34); ctx.fillStyle = i === d.sel ? '#fff' : '#1B4332'; ctx.font = `15px ${g.font}`; ctx.fillText(b.name, x + 40, y + 58); ctx.font = `12px ${g.font}`; ctx.fillText(`◉${b.cost} · +${b.inc}/s`, x + 40, y + 78); });
      ctx.fillStyle = 'rgba(27,67,50,.8)'; ctx.font = `12px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText(`${B[d.sel].name}s earn double next to a ${B.find(q => q.k === B[d.sel].likes).name.toLowerCase()}`, W / 2, 590);
    },
    down(g, x, y) {
      const d = g.data;
      if (y > 470 && y < 562) { const i = Math.floor((x - 12) / 85); if (i >= 0 && i < B.length) { d.sel = i; g.snd.tap(); } return; }
      const cx = Math.floor((x - OX) / S), cy = Math.floor((y - OY) / S); if (cx < 0 || cy < 0 || cx >= N || cy >= N || !land(cx, cy)) return;
      if (d.map[cy][cx]) { g.text(B.find(q => q.k === d.map[cy][cx]).name, x, y - 10, '#1B4332', 13); return; }
      const b = B[d.sel]; if (d.gold < b.cost) { g.snd.bad(); g.text(`Need ◉${b.cost}`, x, y - 10, '#1B4332', 14); return; }
      d.gold -= b.cost; d.map[cy][cx] = b.k; d.pops.push({ x: cx, y: cy, t: 0 }); g.burst(OX + cx * S + S / 2, OY + cy * S + S / 2, [b.col, '#F77F00', '#fff'], 18, 150); g.snd.pick(); g.shake(3, .1);
      if (bonus(d, cx, cy)) g.text('Neighbour bonus ×2!', OX + cx * S + S / 2, OY + cy * S - 6, '#F77F00', 13);
      save(g);
    },
    key(g, k, down) { if (down && '1234'.includes(k)) g.data.sel = +k - 1; }
  });
  function bonus(d, x, y) { const c = d.map[y][x]; if (!c) return false; const likes = B.find(q => q.k === c).likes; return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => d.map[y + dy] && d.map[y + dy][x + dx] === likes); }
  function income(d) { let s = 0; d.map.forEach((r, y) => r.forEach((c, x) => { if (c) s += B.find(q => q.k === c).inc * (bonus(d, x, y) ? 2 : 1); })); return s + .5; }
  function save(g) { const d = g.data; g.store.set('bz_kingdom', { gold: d.gold, total: d.total, map: d.map }); g.saveBest(); }
})();
