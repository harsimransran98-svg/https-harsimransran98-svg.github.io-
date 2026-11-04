/* Memory Peaks — Simon-style sequence memory with a note per mountain. */
(() => {
  const W = 360, H = 640, BASE = 520;
  const PEAKS = [{ x: 60, h: 190, w: 120, c: '#3E92CC', f: 330 }, { x: 140, h: 270, w: 140, c: '#D8315B', f: 392 }, { x: 225, h: 230, w: 130, c: '#2A9D8F', f: 494 }, { x: 300, h: 170, w: 110, c: '#E9C46A', f: 587 }];
  Arcade.start({
    id: 'memorypeaks', W, H, title: 'Memory Peaks', overText: 'Wrong peak. The mountain waits for you.',
    hint: 'Watch the peaks light up and listen to the melody. Then tap them back in the same order (or press 1–4). It grows by one note each round.',
    init(g) { Object.assign(g.data, { seq: [], input: 0, showing: 0, showI: 0, lit: -1, litT: 0, snow: Array.from({ length: 40 }, () => [Math.random() * W, Math.random() * H, .4 + Math.random()]) }); extend(g); },
    attract(g, dt) { (g.data.snow || []).forEach(s => { s[1] += s[2] * 20 * dt; if (s[1] > H) s[1] = 0; }); },
    update(g, dt) {
      const d = g.data; d.snow.forEach(s => { s[1] += s[2] * 20 * dt; s[0] += Math.sin(g.t + s[2]) * .2; if (s[1] > H) s[1] = 0; });
      d.litT -= dt; if (d.litT <= 0 && d.lit >= 0 && !d.showing) d.lit = -1;
      if (d.showing) {
        d.showT -= dt;
        if (d.showT <= 0) {
          if (d.lit >= 0) { d.lit = -1; d.showT = .12; return; }
          if (d.showI >= d.seq.length) { d.showing = 0; d.input = 0; return; }
          const p = d.seq[d.showI++]; d.lit = p; d.showT = Math.max(.22, .55 - d.seq.length * .02); tone(g, p);
        }
      }
    },
    draw(g, ctx) {
      const d = g.data;
      const sky = ctx.createLinearGradient(0, 0, 0, BASE); sky.addColorStop(0, '#C9D6DF'); sky.addColorStop(1, '#E8EEF2'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      if (!d.seq) return;
      const alt = 1000 + d.seq.length * 500;
      ctx.fillStyle = '#22303C'; ctx.font = `${g.fw} 26px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText(`${alt.toLocaleString()} m`, W / 2, 140);
      ctx.font = `${g.fw} 13px ${g.font}`; ctx.fillStyle = 'rgba(34,48,60,.6)'; ctx.fillText(d.showing ? 'LISTEN…' : g.state === 'playing' ? `YOUR TURN · ${d.input}/${d.seq.length}` : '', W / 2, 166);
      PEAKS.forEach((p, i) => {
        const on = d.lit === i, top = BASE - p.h - (on ? 10 : 0);
        ctx.fillStyle = on ? p.c : shade(p.c); ctx.shadowColor = p.c; ctx.shadowBlur = on ? 30 : 0;
        ctx.beginPath(); ctx.moveTo(p.x - p.w / 2 - 20, BASE); ctx.lineTo(p.x, top); ctx.lineTo(p.x + p.w / 2 + 20, BASE); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(p.x - 22, top + 34); ctx.lineTo(p.x, top); ctx.lineTo(p.x + 22, top + 34); ctx.lineTo(p.x + 8, top + 26); ctx.lineTo(p.x, top + 36); ctx.lineTo(p.x - 9, top + 25); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = `${g.fw} 14px ${g.font}`; ctx.fillText(i + 1, p.x, BASE - 14);
      });
      ctx.fillStyle = '#22303C'; ctx.fillRect(0, BASE, W, H - BASE);
      ctx.fillStyle = '#E8EEF2'; d.snow.forEach(s => { ctx.globalAlpha = .7; ctx.beginPath(); ctx.arc(s[0], s[1], s[2] * 1.6, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
    },
    down(g, x, y) { if (y > BASE || y < 200) return; let best = 0, bd = 1e9; PEAKS.forEach((p, i) => { const dd = Math.abs(x - p.x); if (dd < bd) { bd = dd; best = i; } }); press(g, best); },
    key(g, k, down) { if (down && '1234'.includes(k)) press(g, +k - 1); }
  });
  const shade = c => c + '99';
  function tone(g, i) { g.sfx(PEAKS[i].f, .32, 'sine', .07); g.sfx(PEAKS[i].f * 2, .2, 'triangle', .015); }
  function extend(g) { const d = g.data; d.seq.push(Math.floor(Math.random() * 4)); d.showing = 1; d.showI = 0; d.showT = .7; d.lit = -1; }
  function press(g, i) {
    const d = g.data; if (d.showing) return;
    d.lit = i; d.litT = .22; tone(g, i); const p = PEAKS[i]; g.burst(p.x, BASE - p.h, ['#fff', p.c], 10, 120, .5, 2.5);
    if (d.seq[d.input] !== i) { g.shake(10, .3); g.over(`You climbed to ${(1000 + (d.seq.length - 1) * 500).toLocaleString()} m. The melody was ${d.seq.length} notes long.`); return; }
    d.input++;
    if (d.input === d.seq.length) { g.setMult(1 + Math.floor(d.seq.length / 4) * .5); g.add(10 * d.seq.length, W / 2, 200, '#3E92CC'); g.shake(3, .12); if (d.seq.length % 5 === 0) { g.text('NEW CAMP!', W / 2, 230, '#D8315B', 18); g.snd.win(); } setTimeout(() => { if (g.state === 'playing') extend(g); }, 650); }
  }
})();
