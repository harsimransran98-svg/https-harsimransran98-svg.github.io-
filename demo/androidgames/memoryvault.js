/* Memory Vault — tiered card-matching memory game. */
(() => {
  const W = 360, H = 640;
  const GEMS = [['◆', '#FFC300'], ['●', '#FF5D8F'], ['▲', '#4CC9F0'], ['■', '#9D4EDD'], ['★', '#F9844A'], ['✚', '#80ED99'], ['♥', '#FF4D6D'], ['☾', '#E0E1DD'], ['✦', '#72EFDD'], ['⬢', '#FFD60A'], ['♣', '#52B788'], ['✿', '#F72585']];
  const TIERS = [[3, 4], [4, 4], [4, 5], [4, 6], [5, 6], [6, 6]];
  Arcade.start({
    id: 'memoryvault', W, H, title: 'Memory Vault', overText: 'The vault locked you out. Peek closer next time.',
    hint: 'Memorize the gems during the peek, then flip two cards at a time to match them. Fast matches build a streak.',
    init(g) { Object.assign(g.data, { tier: 0, time: 0, streak: 0, lastMatch: 0 }); deal(g); },
    update(g, dt) {
      const d = g.data;
      if (d.peek > 0) { d.peek -= dt; if (d.peek <= 0) d.cards.forEach(c => { c.up = false; }); return; }
      d.time -= dt; if (d.time <= 0) { g.over(`You opened ${d.tier} vault${d.tier === 1 ? '' : 's'}.`); return; }
      d.cards.forEach(c => { c.f += ((c.up || c.done ? 1 : 0) - c.f) * Math.min(1, dt * 14); if (c.shake > 0) c.shake -= dt; });
      if (d.wait > 0) { d.wait -= dt; if (d.wait <= 0) { d.open.forEach(c => { c.up = false; }); d.open = []; } }
    },
    draw(g, ctx) {
      const d = g.data;
      const bg = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 420); bg.addColorStop(0, '#2A1F45'); bg.addColorStop(1, '#120F1F'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      if (!d.cards) return;
      ctx.fillStyle = '#F3EEFF'; ctx.font = `13px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`VAULT ${d.tier + 1}`, 16, 100);
      ctx.textAlign = 'right'; ctx.fillStyle = d.time < 8 ? '#FF4D6D' : '#F3EEFF'; ctx.fillText(d.peek > 0 ? `PEEK ${d.peek.toFixed(1)}` : `${Math.ceil(d.time)}s`, W - 16, 100);
      d.cards.forEach(c => {
        const sx = Math.abs(Math.cos(c.f * Math.PI)), face = c.f > .5, ox = c.shake > 0 ? Math.sin(c.shake * 60) * 4 : 0;
        ctx.save(); ctx.translate(c.x + c.w / 2 + ox, c.y + c.h / 2); ctx.scale(Math.max(.04, sx), 1);
        ctx.fillStyle = face ? (c.done ? 'rgba(255,195,0,.12)' : '#F3EEFF') : '#3C2A6B'; ctx.beginPath(); ctx.roundRect(-c.w / 2, -c.h / 2, c.w, c.h, 10); ctx.fill();
        if (face) { ctx.fillStyle = c.gem[1]; ctx.font = `${Math.floor(c.h * .5)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c.gem[0], 0, 2); ctx.textBaseline = 'alphabetic'; }
        else { ctx.strokeStyle = '#FFC300'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, Math.min(c.w, c.h) * .22, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -c.h * .1); ctx.lineTo(0, c.h * .1); ctx.stroke(); }
        ctx.restore();
      });
    },
    down(g, x, y) {
      const d = g.data; if (d.peek > 0 || d.wait > 0) return;
      const c = d.cards.find(c => x > c.x && x < c.x + c.w && y > c.y && y < c.y + c.h); if (!c || c.up || c.done) return;
      c.up = true; d.open.push(c); g.sfx(500 + d.open.length * 150, .05, 'triangle', .04);
      if (d.open.length === 2) {
        const [a, b] = d.open;
        if (a.gem === b.gem) {
          a.done = b.done = true; d.open = [];
          const fast = g.t - d.lastMatch < 3; d.lastMatch = g.t; d.streak = fast ? d.streak + 1 : 1; g.setMult(Math.min(5, 1 + (d.streak - 1) * .5));
          g.add(50, b.x + b.w / 2, b.y, a.gem[1]); [a, b].forEach(k => g.burst(k.x + k.w / 2, k.y + k.h / 2, [a.gem[1], '#fff'], 14, 150)); g.snd.pick(); g.shake(3, .12);
          if (d.cards.every(k => k.done)) { const bonus = g.add(200 + Math.round(d.time) * 10); g.text(`VAULT OPEN +${bonus}`, W / 2, H / 2, '#FFC300', 20); g.snd.win(); g.shake(8, .3); d.tier = Math.min(TIERS.length - 1, d.tier + 1); setTimeout(() => { if (g.state === 'playing') deal(g); }, 900); }
        } else { d.wait = .7; a.shake = b.shake = .3; d.streak = 0; g.setMult(1); g.snd.bad(); }
      }
    },
    key(g, k, down) {
      if (!down) return; const d = g.data; if (!d.cursor) d.cursor = 0;
      const [cols] = TIERS[d.tier]; const n = d.cards.length;
      if (k === 'ArrowRight') d.cursor = (d.cursor + 1) % n; if (k === 'ArrowLeft') d.cursor = (d.cursor - 1 + n) % n; if (k === 'ArrowDown') d.cursor = Math.min(n - 1, d.cursor + cols); if (k === 'ArrowUp') d.cursor = Math.max(0, d.cursor - cols);
      if (k === ' ' || k === 'Enter') { const c = d.cards[d.cursor]; g.cfg.down(g, c.x + 2, c.y + 2); }
    }
  });
  function deal(g) {
    const d = g.data, [cols, rows] = TIERS[d.tier], n = cols * rows - (cols * rows) % 2;
    const pool = GEMS.slice().sort(() => Math.random() - .5).slice(0, n / 2), deck = [...pool, ...pool].sort(() => Math.random() - .5);
    const gap = 8, cw = Math.min(70, (W - 28 - gap * (cols - 1)) / cols), ch = Math.min(86, (H - 150 - gap * (rows - 1)) / rows), ox = (W - (cw * cols + gap * (cols - 1))) / 2, oy = 120;
    d.cards = deck.map((gem, i) => ({ gem, x: ox + (i % cols) * (cw + gap), y: oy + Math.floor(i / cols) * (ch + gap), w: cw, h: ch, up: true, done: false, f: 1, shake: 0 }));
    d.open = []; d.wait = 0; d.peek = Math.max(1.2, 3 - d.tier * .35); d.time = 25 + n * 2.2; d.cursor = 0;
  }
})();
