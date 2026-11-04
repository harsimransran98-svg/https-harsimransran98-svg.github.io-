/* Skyline Jumpers — rooftop runner with a charge-to-jump-higher control. */
(() => {
  const W = 360, H = 640, PX = 80;
  Arcade.start({
    id: 'skylinejumpers', W, H, title: 'Skyline Jumpers', overText: 'Missed the roof. Hold longer for the wide gaps.',
    hint: 'Hold Space, the mouse or a finger to charge; release to jump. Longer holds jump higher and further. Grab the coins on the way.',
    init(g) { const d = g.data; Object.assign(d, { y: 0, vy: 0, ground: true, charge: 0, holding: false, roofs: [], coins: [], dist: 0, bgx: 0, land: 0 }); let x = -20; for (let i = 0; i < 6; i++) { const w = i === 0 ? 260 : g.rnd(110, 200); d.roofs.push({ x, w, h: i === 0 ? 380 : g.rnd(300, 420) }); x += w + (i === 0 ? 60 : g.rnd(50, 90)); } d.y = H - d.roofs[0].h - 30; },
    attract(g, dt) { g.data.bgx = (g.data.bgx || 0) + dt * 20; },
    update(g, dt) {
      const d = g.data, sp = 200 + Math.min(170, g.t * 4); d.dist += sp * dt; d.bgx += sp * .2 * dt;
      if (d.holding && d.ground) d.charge = Math.min(1, d.charge + dt * 1.8);
      d.roofs.forEach(r => r.x -= sp * dt); d.coins.forEach(c => c.x -= sp * dt);
      if (d.roofs[0].x + d.roofs[0].w < -40) { d.roofs.shift(); const last = d.roofs[d.roofs.length - 1], gap = g.rnd(55, 85) + Math.min(70, g.t * 1.6), w = g.rnd(90, 190), h = g.clamp(last.h + g.rnd(-70, 60), 260, 440); d.roofs.push({ x: last.x + last.w + gap, w, h, ant: Math.random() < .3 }); if (Math.random() < .7) for (let i = 0; i < 3; i++) d.coins.push({ x: last.x + last.w + gap * .5 + i * 16 - 16, y: H - Math.max(h, last.h) - 70 - Math.sin(i / 2 * Math.PI) * 26 }); }
      d.vy += 1500 * dt; d.y += d.vy * dt;
      const roof = d.roofs.find(r => PX + 10 > r.x && PX - 10 < r.x + r.w), top = roof ? H - roof.h : H + 999;
      if (roof && d.vy >= 0 && d.y + 30 >= top && d.y + 30 - d.vy * dt <= top + 8) {
        if (!d.ground) { d.land = .2; g.burst(PX, top, '#FFB4A2', 8, 90, .35, 2); if (roof.ant && !roof.antGot) { roof.antGot = true; g.add(40, PX, top - 50, '#E63946'); g.text('ANTENNA BONUS', PX + 40, top - 70, '#E63946', 14); } g.sfx(180, .05, 'triangle', .04); }
        d.y = top - 30; d.vy = 0; d.ground = true;
      } else if (roof && d.y + 30 > top + 8) { g.burst(PX, d.y + 15, ['#E63946', '#F1FAEE'], 40, 240); g.snd.hit(); g.over(`You hit a wall after ${Math.round(d.dist / 10)} m.`); return; }
      else d.ground = false;
      if (d.y > H + 40) { g.snd.hit(); g.over(`You fell after ${Math.round(d.dist / 10)} m.`); return; }
      for (let i = d.coins.length - 1; i >= 0; i--) { const c = d.coins[i]; if (Math.abs(c.x - PX) < 18 && Math.abs(c.y - (d.y + 15)) < 26) { d.coins.splice(i, 1); g.add(15, c.x, c.y - 10, '#FFB4A2'); g.burst(c.x, c.y, '#FFD166', 8, 110, .4, 2); g.snd.pick(); } else if (c.x < -20) d.coins.splice(i, 1); }
      d.land = Math.max(0, d.land - dt); g.add(dt * 12); g.setMult(1 + Math.floor(g.t / 15) * .5);
    },
    draw(g, ctx) {
      const d = g.data; const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#1D3557'); sky.addColorStop(.55, '#E56B6F'); sky.addColorStop(1, '#FFB4A2'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#FFE8D6'; ctx.beginPath(); ctx.arc(260, 300, 60, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(29,53,87,.45)'; for (let i = 0; i < 12; i++) { const x = ((i * 70 - (d.bgx || 0)) % 840 + 840) % 840 - 60, h = 140 + (i * 53) % 160; ctx.fillRect(x, H - h - 60, 50, h + 60); }
      if (!d.roofs) return;
      d.roofs.forEach(r => { ctx.fillStyle = '#1D3557'; ctx.fillRect(r.x, H - r.h, r.w, r.h); ctx.fillStyle = '#457B9D'; ctx.fillRect(r.x, H - r.h, r.w, 6); ctx.fillStyle = 'rgba(255,214,102,.5)'; for (let wy = H - r.h + 24; wy < H; wy += 26) for (let wx = r.x + 12; wx < r.x + r.w - 12; wx += 22) if ((wx * 7 + wy) % 5 < 2) ctx.fillRect(wx, wy, 8, 12); if (r.ant) { ctx.strokeStyle = '#F1FAEE'; ctx.beginPath(); ctx.moveTo(r.x + r.w / 2, H - r.h); ctx.lineTo(r.x + r.w / 2, H - r.h - 40); ctx.stroke(); ctx.fillStyle = r.antGot ? '#457B9D' : '#E63946'; ctx.beginPath(); ctx.arc(r.x + r.w / 2, H - r.h - 40, 4, 0, 7); ctx.fill(); } });
      d.coins.forEach(c => { ctx.fillStyle = '#FFD166'; ctx.beginPath(); ctx.ellipse(c.x, c.y, 6 * Math.abs(Math.cos(g.t * 4 + c.x)), 7, 0, 0, 7); ctx.fill(); });
      const sq = d.ground ? d.charge * 8 + d.land * 20 : 0;
      ctx.fillStyle = '#F1FAEE'; ctx.fillRect(PX - 10, d.y + sq, 20, 30 - sq); ctx.fillStyle = '#E63946'; ctx.fillRect(PX - 10, d.y + sq, 20, 7); ctx.fillStyle = '#1D3557'; ctx.fillRect(PX + 3, d.y + sq + 10, 4, 4);
      if (d.charge > 0 && d.ground) { ctx.fillStyle = 'rgba(241,250,238,.3)'; ctx.fillRect(PX - 22, d.y - 16, 44, 6); ctx.fillStyle = '#FFB4A2'; ctx.fillRect(PX - 22, d.y - 16, 44 * d.charge, 6); }
      ctx.fillStyle = '#F1FAEE'; ctx.font = `20px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`${Math.round((d.dist || 0) / 10)} M`, 16, H - 20);
    },
    down(g) { g.data.holding = true; }, up(g) { jump(g); },
    key(g, k, down) { if (k === ' ' || k === 'ArrowUp') { if (down) g.data.holding = true; else jump(g); } }
  });
  function jump(g) { const d = g.data; d.holding = false; if (!d.ground) return; d.vy = -(430 + d.charge * 420); d.ground = false; g.sfx(300 + d.charge * 300, .12, 'square', .04, 300); g.burst(PX, d.y + 30, '#FFB4A2', 10, 100, .3, 2); d.charge = 0; }
})();
