/* Petal Drift — calm catcher: collect only the petals that match the lotus. */
(() => {
  const W = 360, H = 640, BY = 560, COLS = [['#E5989B', 'rose'], ['#B5838D', 'mauve'], ['#FFD6A5', 'peach'], ['#A0C4FF', 'sky']];
  Arcade.start({
    id: 'petaldrift', W, H, title: 'Petal Drift', overTitle: 'The pond rests',
    hint: 'Glide the bowl with the mouse, a finger or ← →. Catch petals that match the lotus colour; let the others drift by. Three wrong petals end the session.',
    init(g) { Object.assign(g.data, { bx: W / 2, keyV: 0, petals: [], spawn: .3, target: 0, caught: 0, wrong: 0, wind: 0, ripples: [], streak: 0 }); },
    attract(g, dt) { },
    update(g, dt) {
      const d = g.data; d.wind = Math.sin(g.t * .4) * 40 + Math.sin(g.t * 1.3) * 12;
      if (d.keyV) d.bx = g.clamp(d.bx + d.keyV * 300 * dt, 50, W - 50);
      d.spawn -= dt; if (d.spawn <= 0) { d.spawn = Math.max(.45, 1 - g.t * .006); d.petals.push({ x: g.rnd(20, W - 20), y: 80, c: Math.random() < .45 ? d.target : Math.floor(Math.random() * 4), r: Math.random() * 6, vr: g.rnd(-2, 2), sw: Math.random() * 6, vy: g.rnd(55, 85) + Math.min(60, g.t) }); }
      for (let i = d.petals.length - 1; i >= 0; i--) {
        const p = d.petals[i]; p.y += p.vy * dt; p.sw += dt * 1.6; p.x += (Math.sin(p.sw) * 30 + d.wind) * dt; p.r += p.vr * dt;
        if (p.y > BY - 12 && p.y < BY + 10 && Math.abs(p.x - d.bx) < 44) {
          d.petals.splice(i, 1);
          if (p.c === d.target) { d.caught++; d.streak++; g.setMult(1 + Math.min(4, Math.floor(d.streak / 4)) * .5); g.add(10, p.x, BY - 24, COLS[p.c][0]); g.burst(p.x, BY - 6, [COLS[p.c][0], '#fff'], 10, 90, .6, 2.5); g.sfx(523 * Math.pow(2, (d.streak % 8) / 12 * 2), .4, 'sine', .04); if (d.caught % 8 === 0) { d.target = (d.target + 1 + Math.floor(Math.random() * 3)) % 4; g.text(`now: ${COLS[d.target][1]}`, W / 2, 300, '#6D597A', 18); } }
          else { d.wrong++; d.streak = 0; g.setMult(1); g.text('not this one', p.x, BY - 24, '#6D597A', 13); g.sfx(220, .3, 'sine', .04); g.shake(3, .2); if (d.wrong >= 3) { g.over(`You gathered ${d.caught} petals.`); return; } }
        } else if (p.y > H + 20) { if (p.y > H + 20) { d.ripples.push({ x: p.x, r: 0 }); } d.petals.splice(i, 1); }
      }
      d.ripples.forEach(r => r.r += dt * 40); d.ripples = d.ripples.filter(r => r.r < 40);
    },
    draw(g, ctx) {
      const d = g.data; const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#FDF0F3'); bg.addColorStop(.75, '#F7D9E0'); bg.addColorStop(1, '#C9E4DE'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(109,89,122,.12)'; ctx.beginPath(); ctx.arc(70, 150, 44, 0, 7); ctx.fill();
      if (!d.petals) return;
      d.petals.forEach(p => { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = COLS[p.c][0]; ctx.beginPath(); ctx.ellipse(0, 0, 9, 5, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(-2, -1, 4, 2, 0, 0, 7); ctx.fill(); ctx.restore(); });
      // lotus (target) indicator
      const tc = COLS[d.target][0]; ctx.save(); ctx.translate(W / 2, 140);
      for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.fillStyle = tc; ctx.globalAlpha = .85; ctx.beginPath(); ctx.ellipse(0, -16, 7, 16, 0, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, 7); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#4A2C3A'; ctx.font = `${g.fw} 18px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText(`gather the ${COLS[d.target][1]} petals`, W / 2, 196);
      ctx.fillStyle = '#C9E4DE'; ctx.fillRect(0, BY + 22, W, H); d.ripples.forEach(r => { ctx.strokeStyle = `rgba(109,89,122,${.4 - r.r / 100})`; ctx.beginPath(); ctx.ellipse(r.x, BY + 40, r.r, r.r * .3, 0, 0, 7); ctx.stroke(); });
      ctx.fillStyle = '#6D597A'; ctx.beginPath(); ctx.ellipse(d.bx, BY, 46, 16, 0, 0, Math.PI); ctx.fill(); ctx.fillStyle = '#B5838D'; ctx.beginPath(); ctx.ellipse(d.bx, BY, 46, 7, 0, 0, 7); ctx.fill();
      for (let i = 0; i < 3; i++) { ctx.fillStyle = i < 3 - d.wrong ? '#E5989B' : 'rgba(229,152,155,.2)'; ctx.beginPath(); ctx.arc(W - 70 + i * 22, H - 30, 6, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#4A2C3A'; ctx.font = `${g.fw} 16px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`${d.caught} petals`, 16, H - 24);
    },
    move(g, x) { g.data.bx = g.clamp(x, 50, W - 50); }, down(g, x) { g.data.bx = g.clamp(x, 50, W - 50); },
    key(g, k, down) { const d = g.data; if (k === 'ArrowLeft' || k === 'a') d.keyV = down ? -1 : (d.keyV < 0 ? 0 : d.keyV); if (k === 'ArrowRight' || k === 'd') d.keyV = down ? 1 : (d.keyV > 0 ? 0 : d.keyV); }
  });
})();
