/* Nightfall Dash — three-lane dash through the dark with ember multipliers. */
(() => {
  const W = 360, H = 640, LANES = [80, 180, 280], PY = 540;
  Arcade.start({
    id: 'nightfalldash', W, H, title: 'Nightfall Dash', overText: 'Swallowed by the night. Read two rows ahead.',
    hint: 'Change lanes with ← →, a swipe, or a tap on either side. Embers raise your multiplier; the crystals end the run.',
    init(g) { Object.assign(g.data, { lane: 1, x: LANES[1], obs: [], spawn: .5, row: 0, embers: 0, sx: null, stars: Array.from({ length: 50 }, () => [Math.random() * W, Math.random() * H, Math.random()]) }); },
    attract(g, dt) { (g.data.stars || []).forEach(s => { s[1] = (s[1] + dt * 30 * (s[2] + .2)) % H; }); },
    update(g, dt) {
      const d = g.data, sp = 260 + Math.min(320, g.t * 8);
      d.stars.forEach(s => { s[1] = (s[1] + dt * sp * .3 * (s[2] + .2)) % H; });
      const px = d.x; d.x += (LANES[d.lane] - d.x) * Math.min(1, dt * 16); if (Math.abs(d.x - px) > 1) g.trail(d.x, PY + 10, '#B517FF', 5, .3);
      d.spawn -= dt;
      if (d.spawn <= 0) { d.spawn = Math.max(.33, .8 - g.t * .01); const free = Math.floor(Math.random() * 3); for (let l = 0; l < 3; l++) { if (l === free) { if (Math.random() < .45) d.obs.push({ l, y: -30, ember: true }); } else if (Math.random() < .55 + Math.min(.25, g.t * .006)) d.obs.push({ l, y: -30 }); } }
      for (let i = d.obs.length - 1; i >= 0; i--) {
        const o = d.obs[i]; o.y += sp * dt;
        if (Math.abs(o.y - PY) < 24 && Math.abs(LANES[o.l] - d.x) < 30) {
          if (o.ember) { d.obs.splice(i, 1); d.embers++; g.setMult(Math.min(8, 1 + Math.floor(d.embers / 3))); g.add(15, d.x, PY - 30, '#FFB800'); g.burst(d.x, PY, ['#FFB800', '#FF6B00'], 14, 150); g.snd.pick(); continue; }
          g.burst(d.x, PY, ['#B517FF', '#FFB800', '#fff'], 50, 280); g.snd.hit(); g.over(`Dashed ${Math.round(g.t * sp / 30)} m with ${d.embers} embers.`); return;
        }
        if (o.y > H + 30) { d.obs.splice(i, 1); if (!o.ember) g.add(2); }
      }
    },
    draw(g, ctx) {
      const d = g.data; const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0B0A12'); bg.addColorStop(1, '#1C0F33'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      (d.stars || []).forEach(([x, y, z]) => { ctx.fillStyle = `rgba(243,238,255,${.15 + z * .5})`; ctx.fillRect(x, y, 1.5, 2 + z * 8); });
      ctx.strokeStyle = 'rgba(181,23,255,.18)'; ctx.setLineDash([20, 20]); ctx.lineDashOffset = -(g.t * 400) % 40; [130, 230].forEach(x => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }); ctx.setLineDash([]);
      if (!d.obs) return;
      d.obs.forEach(o => { const x = LANES[o.l]; if (o.ember) { ctx.fillStyle = '#FFB800'; ctx.shadowColor = '#FF6B00'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(x, o.y, 9 + Math.sin(g.t * 12) * 2, 0, 7); ctx.fill(); } else { ctx.fillStyle = '#2A1748'; ctx.strokeStyle = '#B517FF'; ctx.shadowColor = '#B517FF'; ctx.shadowBlur = 14; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, o.y - 26); ctx.lineTo(x + 24, o.y); ctx.lineTo(x, o.y + 26); ctx.lineTo(x - 24, o.y); ctx.closePath(); ctx.fill(); ctx.stroke(); } });
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#F3EEFF'; ctx.shadowColor = '#B517FF'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.moveTo(d.x, PY - 22); ctx.lineTo(d.x + 16, PY + 16); ctx.lineTo(d.x, PY + 8); ctx.lineTo(d.x - 16, PY + 16); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFB800'; ctx.font = `${g.fw} 20px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`EMBERS ${d.embers}`, 16, H - 20);
    },
    key(g, k, down) { if (!down) return; if (k === 'ArrowLeft' || k === 'a') shift(g, -1); if (k === 'ArrowRight' || k === 'd') shift(g, 1); },
    down(g, x) { g.data.sx = x; },
    up(g, x) { const d = g.data; if (d.sx == null) return; const dx = x - d.sx; if (Math.abs(dx) > 30) shift(g, Math.sign(dx)); else shift(g, x < W / 2 ? -1 : 1); d.sx = null; }
  });
  function shift(g, dir) { const d = g.data, n = Math.max(0, Math.min(2, d.lane + dir)); if (n !== d.lane) { d.lane = n; g.sfx(dir > 0 ? 520 : 440, .05, 'square', .03); } }
})();
