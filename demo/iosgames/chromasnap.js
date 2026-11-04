/* Chroma Snap — rotate the four-colour wheel so each falling orb hits its own colour. */
(() => {
  const W = 360, H = 640, CX = 180, CY = 470, R = 92, COLS = ['#FF2D55', '#FFD60A', '#30D158', '#0A84FF'];
  Arcade.start({
    id: 'chromasnap', W, H, title: 'Chroma Snap', overText: 'Wrong colour! Rotate before the orb lands.',
    hint: 'Tap the left or right half (or ← →) to spin the wheel a quarter turn. Match the falling orb to the top segment.',
    init(g) { Object.assign(g.data, { rot: 0, vis: 0, orbs: [], spawn: .4, streak: 0, hits: 0 }); },
    attract(g, dt) { g.data.vis = (g.data.vis || 0) + dt * .6; },
    update(g, dt) {
      const d = g.data; d.vis += (d.rot * Math.PI / 2 - d.vis) * Math.min(1, dt * 16);
      const speed = 170 + Math.min(260, d.hits * 9);
      d.spawn -= dt; if (d.spawn <= 0) { d.spawn = Math.max(.55, 1.4 - d.hits * .03); d.orbs.push({ y: 80, c: Math.floor(Math.random() * 4), sp: speed }); }
      for (let i = d.orbs.length - 1; i >= 0; i--) {
        const o = d.orbs[i]; o.y += o.sp * dt;
        if (o.y >= CY - R - 10) {
          const top = ((-d.rot % 4) + 4) % 4;
          d.orbs.splice(i, 1);
          if (o.c === top) { d.hits++; d.streak++; g.setMult(Math.min(4, 1 + Math.floor(d.streak / 4))); g.add(10, CX, CY - R - 30, COLS[o.c]); g.burst(CX, CY - R, [COLS[o.c], '#fff'], 22, 200); g.sfx(500 + (d.streak % 8) * 70, .07, 'triangle', .05); if (d.hits % 10 === 0) { g.text('FASTER', CX, 260, '#FAFAFA', 20); g.shake(4); } }
          else { g.burst(CX, CY - R, [COLS[o.c], COLS[top]], 50, 280); g.snd.hit(); g.over(`${d.hits} orb${d.hits === 1 ? '' : 's'} snapped.`); return; }
        }
      }
    },
    draw(g, ctx) {
      const d = g.data;
      ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.setLineDash([4, 8]); ctx.beginPath(); ctx.moveTo(CX, 90); ctx.lineTo(CX, CY - R - 12); ctx.stroke(); ctx.setLineDash([]);
      (d.orbs || []).forEach(o => { ctx.fillStyle = COLS[o.c]; ctx.shadowColor = COLS[o.c]; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(CX, o.y, 14, 0, 7); ctx.fill(); });
      ctx.shadowBlur = 0;
      ctx.save(); ctx.translate(CX, CY); ctx.rotate(d.vis || 0);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = COLS[i]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, -Math.PI * .75 + i * Math.PI / 2, -Math.PI * .25 + i * Math.PI / 2); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, 0, R * .46, 0, 7); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#FAFAFA'; ctx.textAlign = 'center'; ctx.font = `22px ${g.font}`; ctx.fillText(d.hits || 0, CX, CY + 8);
      ctx.fillStyle = 'rgba(250,250,250,.35)'; ctx.font = `13px ${g.font}`; ctx.fillText('◀ TAP', 50, H - 30); ctx.fillText('TAP ▶', W - 50, H - 30);
    },
    down(g, x) { spin(g, x < W / 2 ? -1 : 1); },
    key(g, k, down) { if (!down) return; if (k === 'ArrowLeft' || k === 'a') spin(g, -1); if (k === 'ArrowRight' || k === 'd' || k === ' ') spin(g, 1); }
  });
  function spin(g, dir) { g.data.rot += dir; g.sfx(dir > 0 ? 340 : 300, .04, 'square', .025); }
})();
