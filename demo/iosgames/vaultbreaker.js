/* Vault Breaker — find each number by listening for louder clicks, then hold to lock it in. */
(() => {
  const W = 360, H = 640, CX = 180, CY = 340, R = 118;
  Arcade.start({
    id: 'vaultbreaker', W, H, title: 'Vault Breaker', overText: 'The guards are coming. Lighter touch next time.',
    hint: 'Drag around the dial or use ← → to turn it. Clicks get louder and the ring glows as you near the number. Hold still on it for a moment to lock it.',
    init(g) { Object.assign(g.data, { vaults: 0, time: 75, ang: 0, lastTick: 0, still: 0, drag: null, keyV: 0 }); newVault(g); },
    update(g, dt) {
      const d = g.data; d.time -= dt; if (d.time <= 0) { g.over(`You cracked ${d.vaults} vault${d.vaults === 1 ? '' : 's'}.`); return; }
      if (d.keyV) { d.ang += d.keyV * 1.4 * dt; d.moved = true; }
      const num = ((Math.round(-d.ang / (Math.PI * 2) * 100) % 100) + 100) % 100;
      if (num !== d.lastTick) { d.lastTick = num; const dist = Math.min(Math.abs(num - d.combo[d.step]), 100 - Math.abs(num - d.combo[d.step])), near = Math.max(0, 1 - dist / 25); g.sfx(1800 + near * 900, .015 + near * .02, 'square', .01 + near * .06); d.still = 0; d.glow = near; }
      else { const dist = Math.min(Math.abs(num - d.combo[d.step]), 100 - Math.abs(num - d.combo[d.step])); if (dist === 0) { d.still += dt; if (d.still > .55) lock(g); } }
      d.open = Math.max(0, (d.open || 0) - dt);
    },
    draw(g, ctx) {
      const d = g.data; ctx.fillStyle = '#0D1117'; ctx.fillRect(0, 0, W, H);
      if (!d.combo) return;
      ctx.fillStyle = '#161B22'; ctx.beginPath(); ctx.roundRect(24, 150, W - 48, 380, 24); ctx.fill(); ctx.strokeStyle = '#30363D'; ctx.lineWidth = 2; ctx.stroke();
      for (const [x, y] of [[44, 170], [W - 44, 170], [44, 510], [W - 44, 510]]) { ctx.fillStyle = '#30363D'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill(); }
      const glow = d.glow || 0; ctx.strokeStyle = `rgba(212,175,55,${.2 + glow * .8})`; ctx.lineWidth = 6; ctx.shadowColor = '#D4AF37'; ctx.shadowBlur = glow * 30; ctx.beginPath(); ctx.arc(CX, CY, R + 14, 0, 7); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.save(); ctx.translate(CX, CY); ctx.rotate(d.ang);
      const gr = ctx.createRadialGradient(-30, -30, 10, 0, 0, R); gr.addColorStop(0, '#3A3F47'); gr.addColorStop(1, '#1C2128'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
      for (let i = 0; i < 100; i++) { const a = i / 100 * Math.PI * 2 - Math.PI / 2, l = i % 10 === 0 ? 16 : i % 5 === 0 ? 10 : 5; ctx.strokeStyle = i % 10 === 0 ? '#E6EDF3' : '#8B949E'; ctx.lineWidth = i % 10 === 0 ? 2 : 1; ctx.beginPath(); ctx.moveTo(Math.cos(a) * (R - 4), Math.sin(a) * (R - 4)); ctx.lineTo(Math.cos(a) * (R - 4 - l), Math.sin(a) * (R - 4 - l)); ctx.stroke(); if (i % 10 === 0) { ctx.fillStyle = '#E6EDF3'; ctx.font = `12px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText(i, Math.cos(a) * (R - 34), Math.sin(a) * (R - 34) + 4); } }
      ctx.fillStyle = '#0D1117'; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill(); ctx.fillStyle = '#D4AF37'; ctx.fillRect(-3, -30, 6, 22);
      ctx.restore();
      ctx.fillStyle = '#D4AF37'; ctx.beginPath(); ctx.moveTo(CX - 9, CY - R - 30); ctx.lineTo(CX + 9, CY - R - 30); ctx.lineTo(CX, CY - R - 16); ctx.fill();
      const num = ((Math.round(-d.ang / (Math.PI * 2) * 100) % 100) + 100) % 100;
      ctx.fillStyle = '#E6EDF3'; ctx.font = `28px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText(String(num).padStart(2, '0'), CX, 120);
      d.combo.forEach((c, i) => { const x = CX - 60 + i * 60; ctx.fillStyle = i < d.step ? '#D4AF37' : i === d.step ? 'rgba(212,175,55,.25)' : '#21262D'; ctx.beginPath(); ctx.roundRect(x - 22, 548, 44, 40, 8); ctx.fill(); ctx.fillStyle = i < d.step ? '#0D1117' : '#8B949E'; ctx.font = `16px ${g.font}`; ctx.fillText(i < d.step ? String(c).padStart(2, '0') : '??', x, 574); });
      if (d.still > 0) { ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(CX, CY, 40, -Math.PI / 2, -Math.PI / 2 + d.still / .55 * Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = d.time < 15 ? '#F85149' : '#8B949E'; ctx.font = `14px ${g.font}`; ctx.textAlign = 'right'; ctx.fillText(`${Math.ceil(d.time)}s`, W - 24, 610); ctx.textAlign = 'left'; ctx.fillText(`vaults ${d.vaults}`, 24, 610);
      if (d.open) { ctx.fillStyle = `rgba(212,175,55,${d.open * .3})`; ctx.fillRect(0, 0, W, H); }
    },
    down(g, x, y) { g.data.drag = Math.atan2(y - CY, x - CX); },
    move(g, x, y, isDown) { const d = g.data; if (!isDown || d.drag == null) return; const a = Math.atan2(y - CY, x - CX); let da = a - d.drag; if (da > Math.PI) da -= Math.PI * 2; if (da < -Math.PI) da += Math.PI * 2; d.ang += da; d.drag = a; },
    up(g) { g.data.drag = null; },
    key(g, k, down) { const d = g.data; if (k === 'ArrowLeft') d.keyV = down ? -1 : 0; if (k === 'ArrowRight') d.keyV = down ? 1 : 0; }
  });
  function newVault(g) { const d = g.data; d.combo = [0, 1, 2].map(() => Math.floor(Math.random() * 100)); d.step = 0; d.still = 0; }
  function lock(g) {
    const d = g.data; d.step++; d.still = 0; g.sfx(220, .2, 'square', .08); g.noise(.08, .06); g.shake(5, .15); g.add(50, CX, CY - 60, '#D4AF37'); g.burst(CX, CY - R, '#D4AF37', 16, 160);
    if (d.step >= 3) { d.vaults++; d.open = 1; g.setMult(1 + d.vaults * .5); const b = g.add(200 + Math.round(d.time) * 2); g.text(`VAULT OPEN +${b}`, CX, CY, '#D4AF37', 22); g.snd.win(); g.burst(CX, CY, ['#D4AF37', '#E6EDF3', '#FFF3B0'], 70, 280); d.time = Math.min(90, d.time + 25); newVault(g); }
  }
})();
