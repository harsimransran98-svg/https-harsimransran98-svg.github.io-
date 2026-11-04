/* Wavelength — three-lane rhythm game on a generated 120 BPM beat. */
(() => {
  const W = 360, H = 640, HIT = 540, LX = [80, 180, 280], BPM = 120, BEAT = 60 / BPM, TRAVEL = 1.6, COLS = ['#00FFC6', '#FF4FD8', '#FFE66D'];
  const SCALE = [261.6, 293.7, 329.6, 392, 440, 523.3];
  Arcade.start({
    id: 'wavelength', W, H, title: 'Wavelength', overText: 'The song slipped away. Feel the beat, don’t chase it.',
    hint: 'Notes fall to the beat. Tap a lane (or press J, K, L) as each note crosses the line. Six misses end the song.',
    init(g) { Object.assign(g.data, { notes: [], nextBeat: 1, misses: 0, streak: 0, judge: '', jt: 0, pulse: 0, lanes: [0, 0, 0], beatN: 0 }); },
    update(g, dt) {
      const d = g.data, t = g.t;
      while (d.nextBeat * BEAT < t + TRAVEL) {
        const b = d.nextBeat, bar = Math.floor(b / 4), dens = Math.min(.95, .55 + bar * .03);
        if (Math.random() < dens) d.notes.push({ at: b * BEAT, lane: Math.floor(Math.random() * 3), done: false });
        if (bar > 3 && b % 2 === 1 && Math.random() < .3) d.notes.push({ at: (b + .5) * BEAT, lane: Math.floor(Math.random() * 3), done: false });
        d.nextBeat++;
      }
      // the beat itself: kick on every beat, hat on off-beats
      const beatNow = Math.floor(t / BEAT); if (beatNow !== d.beatN) { d.beatN = beatNow; d.pulse = 1; g.sfx(110, .12, 'sine', .08, -60); if (beatNow % 2) g.noise(.04, .025); }
      d.pulse = Math.max(0, d.pulse - dt * 4); d.jt = Math.max(0, d.jt - dt); d.lanes = d.lanes.map(v => Math.max(0, v - dt * 5));
      d.notes.forEach(n => { if (!n.done && t - n.at > .14) { n.done = true; miss(g); } });
      d.notes = d.notes.filter(n => !(n.done && t - n.at > .4));
    },
    draw(g, ctx) {
      const d = g.data; ctx.fillStyle = '#12002B'; ctx.fillRect(0, 0, W, H);
      if (!d.notes) return;
      ctx.fillStyle = `rgba(255,79,216,${.05 + d.pulse * .08})`; ctx.fillRect(0, 0, W, H);
      LX.forEach((x, i) => { ctx.fillStyle = `rgba(255,255,255,${.03 + d.lanes[i] * .15})`; ctx.fillRect(x - 46, 90, 92, H); ctx.strokeStyle = 'rgba(247,238,255,.08)'; ctx.beginPath(); ctx.moveTo(x - 46, 90); ctx.lineTo(x - 46, H); ctx.stroke(); });
      for (let b = Math.floor(g.t / BEAT); b < (g.t + TRAVEL) / BEAT; b++) { const y = HIT - (b * BEAT - g.t) / TRAVEL * (HIT - 90); ctx.strokeStyle = 'rgba(247,238,255,.06)'; ctx.beginPath(); ctx.moveTo(34, y); ctx.lineTo(W - 34, y); ctx.stroke(); }
      ctx.strokeStyle = '#F7EEFF'; ctx.lineWidth = 3; ctx.shadowColor = '#00FFC6'; ctx.shadowBlur = 10 + d.pulse * 20; ctx.beginPath(); ctx.moveTo(30, HIT); ctx.lineTo(W - 30, HIT); ctx.stroke(); ctx.shadowBlur = 0; ctx.lineWidth = 1;
      d.notes.forEach(n => { if (n.done) return; const y = HIT - (n.at - g.t) / TRAVEL * (HIT - 90), x = LX[n.lane]; ctx.fillStyle = COLS[n.lane]; ctx.shadowColor = COLS[n.lane]; ctx.shadowBlur = 16; ctx.beginPath(); ctx.roundRect(x - 36, y - 9, 72, 18, 9); ctx.fill(); });
      ctx.shadowBlur = 0;
      LX.forEach((x, i) => { ctx.strokeStyle = COLS[i]; ctx.globalAlpha = .4 + d.lanes[i] * .6; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x - 38, HIT - 11, 76, 22, 11); ctx.stroke(); ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(247,238,255,.4)'; ctx.font = `14px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText('JKL'[i], x, HIT + 44); });
      if (d.jt) { ctx.fillStyle = d.judge === 'MISS' ? '#FF4F6D' : d.judge === 'PERFECT' ? '#00FFC6' : '#FFE66D'; ctx.globalAlpha = Math.min(1, d.jt * 3); ctx.font = `30px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText(d.judge, W / 2, 300); ctx.globalAlpha = 1; }
      ctx.fillStyle = '#F7EEFF'; ctx.font = `13px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`STREAK ${d.streak}`, 16, H - 16); ctx.textAlign = 'right'; ctx.fillText(`MISSES ${d.misses}/6`, W - 16, H - 16);
    },
    down(g, x) { hit(g, x < 130 ? 0 : x < 230 ? 1 : 2); },
    key(g, k, down) { if (!down) return; const i = { j: 0, J: 0, k: 1, K: 1, l: 2, L: 2, ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2 }[k]; if (i != null) hit(g, i); }
  });
  function hit(g, lane) {
    const d = g.data; d.lanes[lane] = 1;
    const cand = d.notes.filter(n => !n.done && n.lane === lane).sort((a, b) => Math.abs(a.at - g.t) - Math.abs(b.at - g.t))[0];
    if (!cand || Math.abs(cand.at - g.t) > .14) { g.sfx(160, .05, 'square', .02); return; }
    cand.done = true; const err = Math.abs(cand.at - g.t), perfect = err < .045;
    d.streak++; g.setMult(Math.min(4, 1 + Math.floor(d.streak / 8))); d.judge = perfect ? 'PERFECT' : 'GOOD'; d.jt = .5;
    g.add(perfect ? 30 : 15, LX[lane], HIT - 40, COLS[lane]); g.burst(LX[lane], HIT, [COLS[lane], '#fff'], perfect ? 22 : 10, 200); g.sfx(SCALE[(lane * 2 + d.streak) % SCALE.length] * (perfect ? 2 : 1), .18, 'triangle', .05); if (perfect) g.shake(2, .08);
  }
  function miss(g) { const d = g.data; d.misses++; d.streak = 0; g.setMult(1); d.judge = 'MISS'; d.jt = .5; g.shake(4, .15); if (d.misses >= 6) g.over(`You lasted ${Math.floor(g.t / (BEAT * 4))} bars.`); }
})();
