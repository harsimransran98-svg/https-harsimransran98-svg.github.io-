/* Driftline — one-tap zigzag down a narrowing path. */
(() => {
  const W = 360, H = 640, PY = 470;
  Arcade.start({
    id: 'driftline', W, H, title: 'Driftline', overText: 'Off the line. One tap, perfect timing.',
    hint: 'The line drifts diagonally. Tap, click or Space to switch direction and stay inside the path. Grab the orange gems.',
    init(g) { const d = g.data; Object.assign(d, { x: W / 2, dir: 1, path: [], gems: [], trail: [], dist: 0, taps: 0 }); let cx = W / 2; for (let y = PY + 200; y > -400; y -= 8) { d.path.push({ y, cx, w: 150 }); cx += Math.sin(y * .01) * 2; } },
    attract(g, dt) { },
    update(g, dt) {
      const d = g.data, sp = 150 + Math.min(170, g.t * 4); d.dist += sp * dt;
      d.x += d.dir * sp * .9 * dt;
      d.path.forEach(p => { p.y += sp * dt; }); d.gems.forEach(q => { q.y += sp * dt; });
      d.path = d.path.filter(p => p.y < H + 20);
      while (d.path[d.path.length - 1].y > -20) { const last = d.path[d.path.length - 1]; d.drift = (d.drift || 0) + g.rnd(-.25, .25); d.drift = g.clamp(d.drift, -2.2, 2.2); let cx = last.cx + d.drift; const w = Math.max(70, 150 - g.t * 1.6); if (cx < w / 2 + 14 || cx > W - w / 2 - 14) { d.drift *= -1; cx = g.clamp(cx, w / 2 + 14, W - w / 2 - 14); } d.path.push({ y: last.y - 8, cx, w }); if (Math.random() < .035) d.gems.push({ x: cx + g.rnd(-w * .3, w * .3), y: last.y - 8 }); }
      const seg = d.path.reduce((a, b) => Math.abs(b.y - PY) < Math.abs(a.y - PY) ? b : a);
      if (Math.abs(d.x - seg.cx) > seg.w / 2 - 5) { g.burst(d.x, PY, ['#111', '#FF4F00'], 40, 220); g.snd.hit(); g.over(`${Math.round(d.dist / 10)} m drifted with ${d.taps} taps.`); return; }
      for (let i = d.gems.length - 1; i >= 0; i--) { const q = d.gems[i]; if (Math.hypot(q.x - d.x, q.y - PY) < 16) { d.gems.splice(i, 1); g.setMult(Math.min(5, g.mult + .25)); g.add(25, q.x, q.y - 14, '#FF4F00'); g.burst(q.x, q.y, '#FF4F00', 14, 140); g.snd.pick(); } else if (q.y > H + 10) d.gems.splice(i, 1); }
      g.add(dt * 15); d.trail.push(d.x); if (d.trail.length > 60) d.trail.shift();
    },
    draw(g, ctx) {
      const d = g.data; ctx.fillStyle = '#ECE9E2'; ctx.fillRect(0, 0, W, H);
      if (!d.path) return;
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); d.path.forEach((p, i) => i ? ctx.lineTo(p.cx - p.w / 2, p.y) : ctx.moveTo(p.cx - p.w / 2, p.y)); for (let i = d.path.length - 1; i >= 0; i--) { const p = d.path[i]; ctx.lineTo(p.cx + p.w / 2, p.y); } ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); d.path.forEach((p, i) => i ? ctx.lineTo(p.cx - p.w / 2, p.y) : ctx.moveTo(p.cx - p.w / 2, p.y)); ctx.stroke(); ctx.beginPath(); d.path.forEach((p, i) => i ? ctx.lineTo(p.cx + p.w / 2, p.y) : ctx.moveTo(p.cx + p.w / 2, p.y)); ctx.stroke();
      d.gems.forEach(q => { ctx.fillStyle = '#FF4F00'; ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(Math.PI / 4); ctx.fillRect(-6, -6, 12, 12); ctx.restore(); });
      ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); const n = d.trail.length; d.trail.forEach((x, i) => { const y = PY + (n - 1 - i) * 2.6; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.lineCap = 'butt'; ctx.lineWidth = 1;
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(d.x, PY, 7, 0, 7); ctx.fill();
      ctx.font = `${g.fw} 15px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`${Math.round((d.dist || 0) / 10)} m`, 16, H - 22);
    },
    down(g) { turn(g); },
    key(g, k, down) { if (down && (k === ' ' || k === 'ArrowLeft' || k === 'ArrowRight')) turn(g); }
  });
  function turn(g) { const d = g.data; d.dir *= -1; d.taps++; g.sfx(d.dir > 0 ? 700 : 560, .04, 'sine', .05); }
})();
