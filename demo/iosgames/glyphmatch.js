/* Glyph Match — every board hides exactly one matching pair. Daily seeded mode. */
(() => {
  const W = 360, H = 640;
  const GLYPHS = 'ΔΣΩΨΦΞΛΠΓΘЖЯФДБЛИЦШЭЮЄЉЊЋЏ§¶†‡※∞≈±∑∫⌘⌥⊕⊗⊞⊠⋈';
  const ALL = [...GLYPHS];
  let rng = Math.random;
  function seeded(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  Arcade.start({
    id: 'glyphmatch', W, H, title: 'Glyph Match', overText: 'The clock drained. Scan rows, not single glyphs.',
    hint: 'Each board has exactly one pair of identical glyphs. Tap both to refill the clock. Today’s boards are the same for everyone.',
    init(g) { const t = new Date(); rng = seeded(t.getFullYear() * 400 + t.getMonth() * 32 + t.getDate()); Object.assign(g.data, { round: 0, time: 20, sel: null, wrong: 0, flash: null }); board(g); },
    update(g, dt) { const d = g.data; d.time -= dt; if (d.time <= 0) { g.over(`You found ${d.round} pair${d.round === 1 ? '' : 's'} on today’s boards.`); return; } d.cells.forEach(c => { c.s += (1 - c.s) * Math.min(1, dt * 10); if (c.bad > 0) c.bad -= dt; }); },
    draw(g, ctx) {
      const d = g.data; ctx.fillStyle = '#0B0F14'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(124,255,203,.05)'; for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      if (!d.cells) return;
      ctx.fillStyle = 'rgba(124,255,203,.15)'; ctx.fillRect(16, 100, W - 32, 6); ctx.fillStyle = d.time < 5 ? '#FF6B6B' : '#7CFFCB'; ctx.fillRect(16, 100, (W - 32) * Math.min(1, d.time / 20), 6);
      ctx.fillStyle = '#E6FFF6'; ctx.font = `${g.fw} 12px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`DAILY · BOARD ${d.round + 1}`, 16, 126); ctx.textAlign = 'right'; ctx.fillText(`${d.time.toFixed(1)}s`, W - 16, 126);
      d.cells.forEach((c, i) => {
        const sel = d.sel === i, ok = d.flash && d.flash.includes(i);
        ctx.save(); ctx.translate(c.x + c.w / 2 + (c.bad > 0 ? Math.sin(c.bad * 60) * 3 : 0), c.y + c.w / 2); ctx.scale(c.s, c.s);
        ctx.fillStyle = ok ? '#7CFFCB' : sel ? 'rgba(124,255,203,.25)' : 'rgba(230,255,246,.05)'; ctx.strokeStyle = sel ? '#7CFFCB' : c.bad > 0 ? '#FF6B6B' : 'rgba(124,255,203,.15)';
        ctx.beginPath(); ctx.roundRect(-c.w / 2 + 2, -c.w / 2 + 2, c.w - 4, c.w - 4, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = ok ? '#0B0F14' : '#E6FFF6'; ctx.font = `${Math.floor(c.w * .48)}px "Segoe UI Symbol", "Noto Sans Symbols", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c.g, 0, 2); ctx.textBaseline = 'alphabetic';
        ctx.restore();
      });
    },
    down(g, x, y) {
      const d = g.data, i = d.cells.findIndex(c => x > c.x && x < c.x + c.w && y > c.y && y < c.y + c.w); if (i < 0 || d.flash) return;
      if (d.sel == null) { d.sel = i; d.cells[i].s = .85; g.snd.tap(); return; }
      if (d.sel === i) { d.sel = null; return; }
      const a = d.cells[d.sel], b = d.cells[i];
      if (a.g === b.g) {
        d.flash = [d.sel, i]; d.sel = null; d.round++; const fast = d.time > 12; g.setMult(fast ? Math.min(5, g.mult + .5) : 1);
        g.add(50 + Math.round(d.time * 5), b.x + b.w / 2, b.y, '#7CFFCB'); [a, b].forEach(c => g.burst(c.x + c.w / 2, c.y + c.w / 2, ['#7CFFCB', '#fff'], 18, 170)); g.snd.pick(); g.shake(3, .12);
        d.time = Math.min(20, d.time + 6); setTimeout(() => { if (g.state === 'playing') { d.flash = null; board(g); } }, 450);
      } else { a.bad = b.bad = .3; d.sel = null; d.time -= 2; g.text('-2s', b.x + b.w / 2, b.y, '#FF6B6B', 15); g.snd.bad(); g.setMult(1); }
    }
  });
  function board(g) {
    const d = g.data, n = Math.min(6, 3 + Math.floor(d.round / 2)), count = n * n, pool = ALL.slice().sort(() => rng() - .5).slice(0, count - 1);
    const dup = pool[Math.floor(rng() * pool.length)], list = [...pool, dup].sort(() => rng() - .5);
    const gap = 6, w = Math.min(84, (W - 32 - gap * (n - 1)) / n), ox = (W - (w * n + gap * (n - 1))) / 2, oy = 150;
    d.cells = list.map((gl, i) => ({ g: gl, x: ox + (i % n) * (w + gap), y: oy + Math.floor(i / n) * (w + gap), w, s: 0, bad: 0 })); d.sel = null;
  }
})();
