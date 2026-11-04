/* Shadow Runner — gravity-flip endless runner. */
(() => {
  const W = 360, H = 640, FLOOR = 520, CEIL = 150, PX = 80, SZ = 22;
  Arcade.start({
    id: 'shadowrunner', W, H, title: 'Shadow Runner', overText: 'The shadows caught you. Flip faster.',
    hint: 'Tap, click or Space flips gravity. Dodge the spikes on both sides and grab the green shards.',
    init(g) { Object.assign(g.data, { y: FLOOR - SZ, vy: 0, grav: 1, spikes: [], shards: [], dist: 0, spawn: 1.2, ghosts: [], speedT: 0, combo: 0, bg: Array.from({ length: 14 }, (_, i) => ({ x: i * 40, h: 30 + Math.random() * 80 })) }); },
    attract(g, dt) { g.data.bg && g.data.bg.forEach(b => { b.x -= dt * 40; if (b.x < -40) b.x += 560; }); },
    update(g, dt) {
      const d = g.data, spd = 230 + Math.min(260, g.t * 7);
      d.dist += spd * dt; d.bg.forEach(b => { b.x -= spd * .3 * dt; if (b.x < -40) { b.x += 560; b.h = 30 + Math.random() * 80; } });
      d.vy += 2100 * d.grav * dt; d.y += d.vy * dt;
      if (d.y > FLOOR - SZ) { d.y = FLOOR - SZ; d.vy = 0; } if (d.y < CEIL) { d.y = CEIL; d.vy = 0; }
      d.ghosts.push({ x: PX, y: d.y, a: .5 }); if (d.ghosts.length > 8) d.ghosts.shift(); d.ghosts.forEach(gh => { gh.x -= spd * dt; gh.a *= .86; });
      d.spawn -= dt;
      if (d.spawn <= 0) {
        d.spawn = Math.max(.42, 1.1 - g.t * .012) * g.rnd(.8, 1.3);
        const top = Math.random() < .5, h = g.rnd(34, 70), w = g.rnd(26, 46);
        d.spikes.push({ x: W + 20, top, h, w });
        if (Math.random() < .55) d.shards.push({ x: W + 20 + g.rnd(80, 140), y: g.rnd(CEIL + 40, FLOOR - 60), t: 0 });
      }
      d.spikes.forEach(s => { s.x -= spd * dt; }); d.spikes = d.spikes.filter(s => s.x > -60);
      d.shards.forEach(s => { s.x -= spd * dt; s.t += dt; }); d.shards = d.shards.filter(s => s.x > -20 && !s.got);
      // collisions: triangle spikes approximated by their inner box
      for (const s of d.spikes) {
        const sx0 = s.x + s.w * .25, sx1 = s.x + s.w * .75, sy0 = s.top ? CEIL : FLOOR - s.h * .8, sy1 = s.top ? CEIL + s.h * .8 : FLOOR;
        if (PX + SZ > sx0 && PX < sx1 && d.y + SZ > sy0 && d.y < sy1) { g.burst(PX + SZ / 2, d.y + SZ / 2, ['#A3FF12', '#7B2CFF', '#fff'], 50, 280); g.snd.hit(); g.over(`You ran ${Math.round(d.dist / 10)} m into the dark.`); return; }
        if (!s.passed && s.x + s.w < PX) { s.passed = true; g.add(10); }
      }
      for (const s of d.shards) if (Math.abs(s.x - (PX + SZ / 2)) < 20 && Math.abs(s.y - (d.y + SZ / 2)) < 24) {
        s.got = true; d.combo++; g.setMult(1 + Math.min(4, d.combo) * .5); g.add(25, s.x, s.y - 10, '#A3FF12'); g.burst(s.x, s.y, ['#A3FF12', '#fff'], 16, 160); g.snd.pick();
      }
      for (const s of d.shards) if (!s.got && s.x < PX - 30 && !s.miss) { s.miss = true; if (d.combo) { d.combo = 0; g.setMult(1); } }
      d.speedT += dt; if (d.speedT > 10) { d.speedT = 0; g.text('FASTER', W / 2, 320, '#7B2CFF', 20); g.sfx(300, .25, 'sawtooth', .03, 400); }
      g.trail(PX, d.y + SZ / 2 + g.rnd(-6, 6), '#7B2CFF', 3, .3, -spd * .5, 0);
    },
    draw(g, ctx) {
      const d = g.data;
      ctx.fillStyle = '#0B0B0F'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#16131F'; d.bg && d.bg.forEach(b => { ctx.fillRect(b.x, FLOOR - b.h, 36, b.h); ctx.fillRect(b.x + 18, CEIL, 30, b.h * .7); });
      ctx.fillStyle = '#1C1726'; ctx.fillRect(0, FLOOR, W, H - FLOOR); ctx.fillRect(0, 0, W, CEIL);
      ctx.strokeStyle = '#A3FF12'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, FLOOR); ctx.lineTo(W, FLOOR); ctx.moveTo(0, CEIL); ctx.lineTo(W, CEIL); ctx.stroke();
      if (!d.spikes) return;
      ctx.fillStyle = '#7B2CFF'; d.spikes.forEach(s => { ctx.beginPath(); if (s.top) { ctx.moveTo(s.x, CEIL); ctx.lineTo(s.x + s.w / 2, CEIL + s.h); ctx.lineTo(s.x + s.w, CEIL); } else { ctx.moveTo(s.x, FLOOR); ctx.lineTo(s.x + s.w / 2, FLOOR - s.h); ctx.lineTo(s.x + s.w, FLOOR); } ctx.fill(); });
      d.shards.forEach(s => { ctx.save(); ctx.translate(s.x, s.y + Math.sin(s.t * 5) * 4); ctx.rotate(s.t * 2); ctx.fillStyle = '#A3FF12'; ctx.shadowColor = '#A3FF12'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(6, 0); ctx.lineTo(0, 9); ctx.lineTo(-6, 0); ctx.fill(); ctx.restore(); });
      ctx.shadowBlur = 0;
      d.ghosts.forEach(gh => { ctx.globalAlpha = gh.a * .6; ctx.fillStyle = '#7B2CFF'; ctx.fillRect(gh.x, gh.y, SZ, SZ); }); ctx.globalAlpha = 1;
      ctx.fillStyle = '#F2F2F2'; ctx.shadowColor = '#A3FF12'; ctx.shadowBlur = 16; ctx.fillRect(PX, d.y, SZ, SZ); ctx.shadowBlur = 0;
      ctx.fillStyle = '#0B0B0F'; const ey = d.grav > 0 ? d.y + 6 : d.y + SZ - 10; ctx.fillRect(PX + 13, ey, 4, 4);
      ctx.fillStyle = 'rgba(242,242,242,.6)'; ctx.font = `14px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`${Math.round(d.dist / 10)} m`, 14, H - 30);
    },
    down(g) { flip(g); },
    key(g, k, down) { if (down && (k === ' ' || k === 'ArrowUp' || k === 'ArrowDown')) flip(g); }
  });
  function flip(g) { const d = g.data; d.grav *= -1; d.vy = -240 * d.grav * -1; g.sfx(d.grav > 0 ? 260 : 520, .08, 'square', .04, d.grav > 0 ? -100 : 200); g.burst(PX + SZ / 2, d.y + SZ / 2, '#A3FF12', 8, 120, .3, 2); }
})();
