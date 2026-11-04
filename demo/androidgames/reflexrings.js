/* Reflex Rings — tap when the shrinking ring meets the target. */
(() => {
  const W = 360, H = 640, CX = 180, CY = 360, TR = 70;
  Arcade.start({
    id: 'reflexrings', W, H, title: 'Reflex Rings', overText: 'Three misses. Tap on the line, not near it.',
    hint: 'A ring shrinks toward the target circle. Tap, click or Space the moment they touch. Perfect hits build your streak.',
    init(g) { Object.assign(g.data, { rings: [], lives: 3, streak: 0, next: .6, flash: 0, flashC: '#33FFCC', judged: '', hue: 0 }); },
    attract(g, dt) { g.data.hue = (g.data.hue || 0) + dt; },
    update(g, dt) {
      const d = g.data; d.hue += dt; d.flash = Math.max(0, d.flash - dt * 3);
      const speed = 150 + Math.min(260, g.t * 4);
      d.next -= dt; if (d.next <= 0) { d.next = Math.max(.45, 1.15 - g.t * .01) * g.rnd(.85, 1.2); d.rings.push({ r: 250, sp: speed * g.rnd(.9, 1.15) }); }
      d.rings.forEach(r => { r.r -= r.sp * dt; });
      const missed = d.rings.filter(r => r.r < TR - 18); if (missed.length) { d.rings = d.rings.filter(r => r.r >= TR - 18); missed.forEach(() => miss(g, 'TOO LATE')); }
    },
    draw(g, ctx) {
      const d = g.data;
      ctx.fillStyle = '#06141B'; ctx.fillRect(0, 0, W, H);
      if (d.flash) { ctx.fillStyle = d.flashC; ctx.globalAlpha = d.flash * .15; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      for (let i = 0; i < 8; i++) { ctx.strokeStyle = `rgba(51,255,204,${.03 + i * .006})`; ctx.beginPath(); ctx.arc(CX, CY, 40 + i * 32 + (g.t * 20 % 32), 0, 7); ctx.stroke(); }
      ctx.lineWidth = 10; ctx.strokeStyle = '#33FFCC'; ctx.shadowColor = '#33FFCC'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(CX, CY, TR, 0, 7); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(230,255,250,.25)'; [TR - 7, TR + 7].forEach(r => { ctx.beginPath(); ctx.arc(CX, CY, r, 0, 7); ctx.stroke(); });
      (d.rings || []).forEach(r => { const near = Math.abs(r.r - TR); ctx.lineWidth = 5; ctx.strokeStyle = near < 12 ? '#FFFFFF' : '#FF3366'; ctx.shadowColor = '#FF3366'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(CX, CY, Math.max(1, r.r), 0, 7); ctx.stroke(); });
      ctx.shadowBlur = 0; ctx.lineWidth = 1;
      ctx.fillStyle = '#E6FFFA'; ctx.textAlign = 'center'; ctx.font = `${g.fw} 34px ${g.font}`; ctx.fillText(d.streak || '', CX, CY + 12);
      if (d.judged) { ctx.font = `${g.fw} 18px ${g.font}`; ctx.fillStyle = d.flashC; ctx.fillText(d.judged, CX, CY - 120); }
      for (let i = 0; i < 3; i++) { ctx.fillStyle = i < d.lives ? '#FF3366' : 'rgba(255,51,102,.2)'; ctx.beginPath(); ctx.arc(CX - 24 + i * 24, H - 70, 7, 0, 7); ctx.fill(); }
    },
    down(g) { hit(g); },
    key(g, k, down) { if (down && (k === ' ' || k === 'Enter')) hit(g); }
  });
  function hit(g) {
    const d = g.data; if (!d.rings.length) { miss(g, 'NOTHING THERE'); return; }
    const r = d.rings.reduce((a, b) => Math.abs(b.r - TR) < Math.abs(a.r - TR) ? b : a), err = Math.abs(r.r - TR);
    if (err > 26) { miss(g, 'TOO EARLY'); return; }
    d.rings.splice(d.rings.indexOf(r), 1);
    const perfect = err < 7; d.streak = perfect ? d.streak + 1 : Math.max(1, d.streak); g.setMult(Math.min(6, 1 + Math.floor(d.streak / 3)));
    g.add(perfect ? 30 : 12, CX, CY - 90, perfect ? '#33FFCC' : '#E6FFFA');
    d.judged = perfect ? 'PERFECT' : 'GOOD'; d.flashC = perfect ? '#33FFCC' : '#E6FFFA'; d.flash = 1;
    for (let i = 0; i < (perfect ? 28 : 12); i++) { const a = Math.random() * 7; g.burst(CX + Math.cos(a) * TR, CY + Math.sin(a) * TR, perfect ? ['#33FFCC', '#fff'] : '#E6FFFA', 1, 160, .5, 2.5); }
    g.sfx(perfect ? 880 + Math.min(12, d.streak) * 40 : 520, .08, 'triangle', .05); g.shake(perfect ? 5 : 2, .12);
  }
  function miss(g, why) { const d = g.data; d.lives--; d.streak = 0; g.setMult(1); d.judged = why; d.flashC = '#FF3366'; d.flash = 1; g.snd.bad(); g.shake(8, .25); if (d.lives <= 0) g.over(`Three misses. Last call: ${why.toLowerCase()}.`); }
})();
