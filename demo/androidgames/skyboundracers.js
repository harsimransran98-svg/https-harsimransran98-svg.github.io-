/* Skybound Racers — hold to climb, thread the sky gates, chain them for boost. */
(() => {
  const W = 360, H = 640, PX = 90;
  Arcade.start({
    id: 'skyboundracers', W, H, title: 'Skybound Racers', overText: 'You clipped the storm. Smooth inputs win races.',
    hint: 'Hold the mouse, a finger or Space to climb; let go to dive. Fly through the pink gates to build boost and avoid the storm clouds.',
    init(g) { Object.assign(g.data, { y: 320, vy: 0, hold: false, gates: [], storms: [], spawn: .5, chain: 0, boost: 0, clouds: Array.from({ length: 8 }, (_, i) => ({ x: i * 60, y: 140 + Math.random() * 420, s: .4 + Math.random() * .6 })) }); },
    attract(g, dt) { (g.data.clouds || []).forEach(c => { c.x -= dt * 30 * c.s; if (c.x < -80) c.x += W + 160; }); },
    update(g, dt) {
      const d = g.data, spd = (190 + Math.min(200, g.t * 5)) * (d.boost > 0 ? 1.5 : 1);
      d.vy += (d.hold ? -1100 : 820) * dt; d.vy = g.clamp(d.vy, -420, 460); d.y += d.vy * dt;
      if (d.y < 100 || d.y > H - 30) { g.burst(PX, d.y, ['#FF006E', '#fff'], 40, 240); g.snd.hit(); g.over(`You flew ${Math.round(g.t * spd / 40)} km.`); return; }
      d.boost = Math.max(0, d.boost - dt);
      d.clouds.forEach(c => { c.x -= spd * .3 * c.s * dt; if (c.x < -80) { c.x += W + 160; c.y = 140 + Math.random() * 420; } });
      d.spawn -= dt;
      if (d.spawn <= 0) { d.spawn = Math.max(.9, 1.6 - g.t * .01); const gy = g.rnd(190, H - 130); d.gates.push({ x: W + 30, y: gy, gap: Math.max(90, 140 - g.t * .8) }); if (Math.random() < Math.min(.7, .25 + g.t * .01)) d.storms.push({ x: W + 30 + g.rnd(110, 180), y: g.rnd(150, H - 80), r: g.rnd(24, 40), ph: Math.random() * 6 }); }
      d.gates.forEach(gt => { gt.x -= spd * dt; if (!gt.done && gt.x < PX) { gt.done = true; if (Math.abs(d.y - gt.y) < gt.gap / 2) { d.chain++; g.setMult(Math.min(5, 1 + d.chain * .5)); g.add(50, PX + 20, gt.y - gt.gap / 2 - 8, '#FF006E'); g.burst(PX, d.y, ['#FF006E', '#8ECAE6', '#fff'], 22, 200); g.snd.pick(); if (d.chain % 4 === 0) { d.boost = 2.5; g.text('DRIFT BOOST!', W / 2, 260, '#8ECAE6', 20); g.shake(5); } } else { if (d.chain) g.text('CHAIN LOST', PX + 40, d.y - 20, '#EAF4FF', 13); d.chain = 0; g.setMult(1); g.snd.bad(); } } });
      d.gates = d.gates.filter(gt => gt.x > -40);
      d.storms.forEach(s => { s.x -= spd * dt; s.ph += dt * 3; if (Math.hypot(s.x - PX, s.y + Math.sin(s.ph) * 10 - d.y) < s.r + 8) { if (d.boost > 0) { s.dead = true; g.add(30, s.x, s.y); g.burst(s.x, s.y, '#5E6B7D', 20, 160); g.snd.hit(); } else { g.burst(PX, d.y, ['#FF006E', '#FFE66D', '#fff'], 50, 260); g.snd.hit(); g.over(`Struck by the storm after ${d.chain} gates in a row.`); } } });
      if (g.state !== 'playing') return;
      d.storms = d.storms.filter(s => s.x > -60 && !s.dead);
      g.add(dt * 20); g.trail(PX - 14, d.y + 3, d.boost > 0 ? '#8ECAE6' : 'rgba(255,255,255,.7)', 2.5, .4, -spd * .4, 0);
    },
    draw(g, ctx) {
      const d = g.data;
      const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0A1F44'); sky.addColorStop(.6, '#2E4A7D'); sky.addColorStop(1, '#F28482'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      (d.clouds || []).forEach(c => { ctx.fillStyle = `rgba(234,244,255,${.08 + c.s * .1})`; ctx.beginPath(); ctx.ellipse(c.x, c.y, 50 * c.s + 20, 14 * c.s + 6, 0, 0, 7); ctx.fill(); });
      if (!d.gates) return;
      d.gates.forEach(gt => { ctx.strokeStyle = gt.done ? 'rgba(255,0,110,.3)' : '#FF006E'; ctx.lineWidth = 6; ctx.shadowColor = '#FF006E'; ctx.shadowBlur = gt.done ? 0 : 14; ctx.beginPath(); ctx.ellipse(gt.x, gt.y, 14, gt.gap / 2, 0, 0, 7); ctx.stroke(); });
      ctx.shadowBlur = 0; ctx.lineWidth = 1;
      d.storms.forEach(s => { const y = s.y + Math.sin(s.ph) * 10; ctx.fillStyle = '#3B4556'; ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 7); ctx.arc(s.x - s.r * .7, y + 6, s.r * .7, 0, 7); ctx.arc(s.x + s.r * .7, y + 6, s.r * .7, 0, 7); ctx.fill(); if (Math.sin(s.ph * 3) > .8) { ctx.strokeStyle = '#FFE66D'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x, y + 10); ctx.lineTo(s.x - 6, y + 26); ctx.lineTo(s.x + 4, y + 26); ctx.lineTo(s.x - 4, y + 44); ctx.stroke(); ctx.lineWidth = 1; } });
      ctx.save(); ctx.translate(PX, d.y); ctx.rotate(g.clamp(d.vy / 900, -.45, .45));
      ctx.fillStyle = '#FF006E'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-14, -9); ctx.lineTo(-8, 0); ctx.lineTo(-14, 9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#EAF4FF'; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-10, -18); ctx.lineTo(-4, 0); ctx.lineTo(-10, 18); ctx.closePath(); ctx.fill();
      ctx.restore();
      if (d.boost > 0) { ctx.strokeStyle = 'rgba(142,202,230,.5)'; for (let i = 0; i < 10; i++) { const y = (i * 61 + g.t * 300) % H; ctx.beginPath(); ctx.moveTo(W - ((g.t * 1200 + i * 90) % W), y); ctx.lineTo(W - ((g.t * 1200 + i * 90) % W) - 50, y); ctx.stroke(); } }
      ctx.fillStyle = '#EAF4FF'; ctx.font = `15px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`CHAIN ${d.chain}`, 14, H - 18);
    },
    down(g) { g.data.hold = true; }, up(g) { g.data.hold = false; },
    key(g, k, down) { if (k === ' ' || k === 'ArrowUp') g.data.hold = down; }
  });
})();
