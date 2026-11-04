/* Tap Duel — two-player (or vs CPU) reaction duel on one screen. */
(() => {
  const W = 360, H = 640, MID = H / 2 + 20;
  Arcade.start({
    id: 'tapduel', W, H, title: 'Tap Duel', overTitle: 'Duel over',
    hint: 'Red owns the top half (A key), blue the bottom (L key). Wait for DRAW, then tap first. Tap early and you lose the round. Alone? Blue plays the CPU. Best of 5.',
    init(g) { Object.assign(g.data, { red: 0, blue: 0, phase: 'wait', timer: g.rnd(1.6, 3.6), msg: 'WAIT FOR IT…', react: null, cpu: true, last: 'none', drawAt: 0, flash: 0, winner: null }); },
    update(g, dt) {
      const d = g.data; d.flash = Math.max(0, d.flash - dt * 3);
      if (d.phase === 'wait') { d.timer -= dt; if (d.timer <= 0) { d.phase = 'draw'; d.drawAt = performance.now(); d.msg = 'DRAW!'; d.flash = 1; g.sfx(1046, .15, 'square', .06); d.cpuT = g.rnd(.24, .42); } }
      else if (d.phase === 'draw' && d.cpu) { d.cpuT -= dt; if (d.cpuT <= 0) win(g, 'red', (performance.now() - d.drawAt) | 0); }
      else if (d.phase === 'result') { d.timer -= dt; if (d.timer <= 0) { if (d.red >= 3 || d.blue >= 3) { const you = d.blue >= 3; g.setScore(g.score); g.over(d.cpu ? (you ? `You beat the CPU ${d.blue}–${d.red}.` : `The CPU won ${d.red}–${d.blue}.`) : `${d.blue >= 3 ? 'Blue' : 'Red'} wins ${Math.max(d.red, d.blue)}–${Math.min(d.red, d.blue)}.`); return; } d.phase = 'wait'; d.timer = g.rnd(1.4, 3.8); d.msg = 'WAIT FOR IT…'; d.winner = null; } }
    },
    draw(g, ctx) {
      const d = g.data;
      ctx.fillStyle = d.winner === 'red' ? '#FF3B30' : '#3A0E0C'; ctx.fillRect(0, 0, W, MID);
      ctx.fillStyle = d.winner === 'blue' ? '#0A84FF' : '#071C36'; ctx.fillRect(0, MID, W, H - MID);
      if (d.phase === 'draw' || d.flash) { ctx.fillStyle = `rgba(255,255,255,${d.flash * .5})`; ctx.fillRect(0, 0, W, H); }
      if (!d.msg) return;
      ctx.textAlign = 'center';
      ctx.save(); ctx.translate(W / 2, MID / 2 + 50); ctx.rotate(Math.PI); ctx.fillStyle = '#FAFAFA'; ctx.font = `64px ${g.font}`; ctx.fillText(d.red, 0, 0); ctx.font = `18px ${g.font}`; ctx.fillText(d.cpu ? 'CPU' : 'RED · A', 0, 34); ctx.restore();
      ctx.fillStyle = '#FAFAFA'; ctx.font = `64px ${g.font}`; ctx.fillText(d.blue, W / 2, MID + (H - MID) / 2 + 20); ctx.font = `18px ${g.font}`; ctx.fillText(d.cpu ? 'YOU · L or tap' : 'BLUE · L', W / 2, MID + (H - MID) / 2 + 52);
      ctx.fillStyle = '#101010'; ctx.fillRect(0, MID - 26, W, 52);
      ctx.fillStyle = d.phase === 'draw' ? '#FFD60A' : '#FAFAFA'; ctx.font = `${d.phase === 'draw' ? 40 : 26}px ${g.font}`; ctx.fillText(d.msg, W / 2, MID + 12);
      if (d.react != null) { ctx.font = `14px ${g.font}`; ctx.fillStyle = 'rgba(250,250,250,.7)'; ctx.fillText(d.react, W / 2, MID + 44); }
      ctx.font = `13px ${g.font}`; ctx.fillStyle = 'rgba(250,250,250,.6)'; ctx.fillText(d.cpu ? 'Two humans? Press 2 or tap the red half to switch' : 'Press 1 for solo vs CPU', W / 2, H - 16);
    },
    down(g, x, y) { const d = g.data; if (d.cpu && y < MID && d.phase === 'wait' && d.red === 0 && d.blue === 0) { d.cpu = false; d.msg = '2 PLAYERS · WAIT…'; return; } tap(g, y < MID ? 'red' : 'blue'); },
    key(g, k, down) { if (!down) return; const d = g.data; if (k === 'a' || k === 'A') tap(g, 'red'); if (k === 'l' || k === 'L' || k === ' ') tap(g, 'blue'); if (k === '2') d.cpu = false; if (k === '1') d.cpu = true; }
  });
  function tap(g, who) {
    const d = g.data; if (d.cpu && who === 'red') return;
    if (d.phase === 'wait') { const other = who === 'red' ? 'blue' : 'red'; d.msg = `${who.toUpperCase()} JUMPED THE GUN`; d.react = 'false start'; d[other]++; d.winner = other; d.phase = 'result'; d.timer = 1.6; g.snd.bad(); g.shake(8, .3); if (other === 'blue') g.add(50); return; }
    if (d.phase === 'draw') win(g, who, (performance.now() - d.drawAt) | 0);
  }
  function win(g, who, ms) {
    const d = g.data; d[who]++; d.winner = who; d.phase = 'result'; d.timer = 1.6; d.react = `${ms} ms`;
    d.msg = d.cpu ? (who === 'blue' ? 'YOU WIN THE ROUND' : 'CPU WINS THE ROUND') : `${who.toUpperCase()} WINS`;
    const y = who === 'red' ? MID / 2 : MID + (H - MID) / 2; g.burst(W / 2, y, who === 'red' ? ['#FF3B30', '#fff'] : ['#0A84FF', '#fff'], 50, 260); g.shake(6, .2);
    if (who === 'blue') { g.setMult(Math.max(1, 3 - ms / 200)); g.add(Math.max(10, 500 - ms)); g.snd.win(); } else g.snd.bad();
  }
})();
