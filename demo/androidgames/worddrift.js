/* Word Drift — catch falling letters in order to spell the word. */
(() => {
  const W = 360, H = 640, BY = 560;
  const WORDS = ['DRIFT', 'OCEAN', 'LIGHT', 'PIXEL', 'STORM', 'BRAVE', 'QUIET', 'MAPLE', 'CANDY', 'GHOST', 'LEMON', 'TIGER', 'PLANET', 'ROCKET', 'GARDEN', 'BRIDGE', 'SILVER', 'WINTER', 'CASTLE', 'VELVET'];
  const ABC = 'ABCDEFGHIJKLMNOPRSTUVWY';
  Arcade.start({
    id: 'worddrift', W, H, title: 'Word Drift', overText: 'Out of time. Watch for the decoys.',
    hint: 'Steer the basket with the mouse, a finger or ← →. Catch the next letter of the word; decoys cost you time.',
    init(g) { Object.assign(g.data, { bx: W / 2, time: 60, letters: [], spawn: .2, words: 0, keyV: 0 }); newWord(g); },
    update(g, dt) {
      const d = g.data; d.time -= dt; if (d.time <= 0) { g.over(`You spelled ${d.words} word${d.words === 1 ? '' : 's'}.`); return; }
      if (d.keyV) d.bx = g.clamp(d.bx + d.keyV * 380 * dt, 40, W - 40);
      d.spawn -= dt;
      if (d.spawn <= 0) { d.spawn = Math.max(.35, .75 - d.words * .03); const need = d.word[d.idx], good = Math.random() < .42 || !d.letters.some(l => l.ch === need); d.letters.push({ ch: good ? need : g.pick(ABC.replace(need, '')), x: g.rnd(30, W - 30), y: 90, vy: g.rnd(90, 130) + d.words * 6, rot: g.rnd(-.4, .4), sway: Math.random() * 6 }); }
      for (let i = d.letters.length - 1; i >= 0; i--) {
        const l = d.letters[i]; l.y += l.vy * dt; l.sway += dt * 2; l.x += Math.sin(l.sway) * 18 * dt;
        if (l.y > BY - 14 && l.y < BY + 10 && Math.abs(l.x - d.bx) < 40) {
          d.letters.splice(i, 1);
          if (l.ch === d.word[d.idx]) { d.idx++; g.add(10, l.x, BY - 30, '#003049'); g.burst(l.x, BY - 10, ['#D62828', '#003049', '#F77F00'], 12, 140); g.sfx(500 + d.idx * 90, .07, 'triangle', .05); if (d.idx >= d.word.length) done(g); }
          else { d.time -= 3; g.text('-3s', l.x, BY - 30, '#D62828', 16); g.snd.bad(); g.shake(5, .15); g.setMult(1); }
        } else if (l.y > H + 20) d.letters.splice(i, 1);
      }
    },
    draw(g, ctx) {
      const d = g.data;
      ctx.fillStyle = '#F8F4EC'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(0,48,73,.07)'; for (let y = 120; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      if (!d.word) return;
      ctx.fillStyle = 'rgba(0,48,73,.12)'; ctx.fillRect(14, 98, W - 28, 6); ctx.fillStyle = d.time < 10 ? '#D62828' : '#003049'; ctx.fillRect(14, 98, (W - 28) * Math.min(1, d.time / 60), 6);
      // target word
      const sz = 34, tw = d.word.length * (sz * .8); ctx.textAlign = 'center';
      [...d.word].forEach((ch, i) => { const x = W / 2 - tw / 2 + i * sz * .8 + sz * .4; ctx.font = `${sz}px ${g.font}`; ctx.fillStyle = i < d.idx ? '#D62828' : i === d.idx ? '#003049' : 'rgba(0,48,73,.25)'; ctx.fillText(ch, x, 150); if (i === d.idx) { ctx.fillRect(x - 10, 158, 20, 3); } });
      d.letters.forEach(l => { ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.rot + Math.sin(l.sway) * .15); ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(0,0,0,.15)'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.roundRect(-17, -19, 34, 38, 8); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#222'; ctx.font = `24px ${g.font}`; ctx.fillText(l.ch, 0, 9); ctx.restore(); });
      // basket
      ctx.fillStyle = '#D62828'; ctx.beginPath(); ctx.moveTo(d.bx - 44, BY - 8); ctx.lineTo(d.bx + 44, BY - 8); ctx.lineTo(d.bx + 34, BY + 22); ctx.lineTo(d.bx - 34, BY + 22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(d.bx + i * 14, BY - 6); ctx.lineTo(d.bx + i * 11, BY + 20); ctx.stroke(); }
      ctx.fillStyle = '#003049'; ctx.font = `16px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`${Math.ceil(d.time)}s`, 14, H - 22); ctx.textAlign = 'right'; ctx.fillText(`${d.words} words`, W - 14, H - 22);
    },
    move(g, x) { g.data.bx = g.clamp(x, 40, W - 40); }, down(g, x) { g.data.bx = g.clamp(x, 40, W - 40); },
    key(g, k, down) { const d = g.data; if (k === 'ArrowLeft' || k === 'a') d.keyV = down ? -1 : (d.keyV < 0 ? 0 : d.keyV); if (k === 'ArrowRight' || k === 'd') d.keyV = down ? 1 : (d.keyV > 0 ? 0 : d.keyV); }
  });
  function newWord(g) { const d = g.data; let w; do { w = g.pick(WORDS); } while (w === d.word); d.word = w; d.idx = 0; d.letters = []; }
  function done(g) { const d = g.data; d.words++; g.setMult(Math.min(5, g.mult + .5)); const b = g.add(50 * d.word.length, W / 2, 200, '#D62828'); g.text(`${d.word}! +5s`, W / 2, 230, '#003049', 22); d.time = Math.min(60, d.time + 5); g.snd.win(); g.shake(4); g.burst(W / 2, 150, ['#D62828', '#003049', '#F77F00'], 40, 220); newWord(g); }
})();
