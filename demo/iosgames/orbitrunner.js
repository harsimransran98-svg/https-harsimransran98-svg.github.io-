/* Orbit Runner — one-tap orbital timing. Rules only; engine in ../arcade-kit.js */
(() => {
  const W = 360, H = 640;
  let dots = null;
  const COLS = ['#FF5A5F', '#3D5AFE', '#FFB400', '#00A896', '#8E44AD'];

  function planet(g, y, i) {
    const r = g.rnd(16, 30);
    return { x: g.rnd(70, W - 70), y, r, orbit: r + g.rnd(26, 36), col: COLS[i % COLS.length], spin: 1.8 + Math.min(1.6, i * .05), drift: i > 8 && Math.random() < .4 ? g.rnd(20, 50) * (Math.random() < .5 ? -1 : 1) : 0, phase: Math.random() * 6 };
  }

  Arcade.start({
    id: 'orbitrunner', W, H, title: 'Orbit Runner', overText: 'Lost in space. Tap a little earlier or later and try again.',
    hint: 'Tap to launch off your orbit. Land on the next ring. Clean landings build a combo.',
    init(g) {
      const d = g.data; d.planets = []; d.idx = 0; d.cam = 0; d.combo = 0; d.trail = [];
      let y = H - 150; for (let i = 0; i < 6; i++) { d.planets.push(planet(g, y, i)); y -= g.rnd(150, 200); }
      d.planets[0].x = W / 2;
      Object.assign(d, { cur: d.planets[0], ang: -Math.PI / 2, dir: 1, fly: false, vx: 0, vy: 0, x: 0, y: 0, flyT: 0, made: 0 });
      place(d);
    },
    attract(g, dt) { const d = g.data; if (!d.cur) return; d.ang += d.dir * d.cur.spin * dt * .6; place(d); },
    update(g, dt) {
      const d = g.data;
      d.planets.forEach(p => { if (p.drift) { p.phase += dt; p.x = g.clamp(p.x + Math.cos(p.phase) * p.drift * dt, 60, W - 60); } });
      if (!d.fly) { d.ang += d.dir * d.cur.spin * dt; place(d); }
      else {
        d.flyT += dt; d.x += d.vx * dt; d.y += d.vy * dt;
        g.trail(d.x, d.y - d.cam, '#1B1B1F', 2.5, .4);
        for (const p of d.planets) {
          if (p === d.cur || p.y > d.cur.y + 10) continue;
          const dist = Math.hypot(d.x - p.x, d.y - p.y);
          if (dist < p.r + 6) { crash(g, 'You flew straight into a planet.'); return; }
          if (Math.abs(dist - p.orbit) < 9) { land(g, p, Math.abs(dist - p.orbit)); break; }
        }
        if (d.fly && (d.x < -20 || d.x > W + 20 || d.y - d.cam > H + 30 || d.y - d.cam < -60 || d.flyT > 2.6)) { crash(g, 'Lost in space.'); return; }
      }
      // camera follows the current planet
      const target = d.cur.y - H * .68; d.cam += (target - d.cam) * Math.min(1, dt * 3);
    },
    draw(g, ctx) {
      const d = g.data;
      ctx.fillStyle = '#F4F1EA'; ctx.fillRect(0, 0, W, H);
      if (!dots) { const c = document.createElement('canvas'); c.width = 32; c.height = 32; const x = c.getContext('2d'); x.fillStyle = 'rgba(27,27,31,.08)'; x.beginPath(); x.arc(16, 16, 1.3, 0, 7); x.fill(); dots = ctx.createPattern(c, 'repeat'); }
      const off = ((-d.cam) % 32 + 32) % 32; ctx.save(); ctx.translate(0, off - 32); ctx.fillStyle = dots; ctx.fillRect(0, 0, W, H + 64); ctx.restore();
      ctx.save(); ctx.translate(0, -d.cam);
      d.planets.forEach(p => {
        ctx.strokeStyle = p === d.cur ? p.col : 'rgba(27,27,31,.22)'; ctx.lineWidth = p === d.cur ? 2 : 1.5; ctx.setLineDash(p === d.cur ? [] : [4, 6]);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.orbit, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(p.x - p.r * .3, p.y - p.r * .3, p.r * .35, 0, 7); ctx.fill();
      });
      // launch preview line while orbiting
      if (!d.fly && g.state === 'playing') {
        const tx = -Math.sin(d.ang) * d.dir, ty = Math.cos(d.ang) * d.dir;
        ctx.strokeStyle = 'rgba(27,27,31,.18)'; ctx.setLineDash([2, 6]); ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + tx * 70, d.y + ty * 70); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.fillStyle = '#1B1B1F'; ctx.beginPath(); ctx.arc(d.x, d.y, 7, 0, 7); ctx.fill();
      ctx.restore();
      if (d.combo > 1) { ctx.fillStyle = '#3D5AFE'; ctx.font = `${g.fw} 15px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`combo ${d.combo}`, 14, H - 16); }
    },
    down(g) { launch(g); },
    key(g, k, down) { if (down && (k === ' ' || k === 'ArrowUp' || k === 'Spacebar')) launch(g); }
  });

  function place(d) { d.x = d.cur.x + Math.cos(d.ang) * d.cur.orbit; d.y = d.cur.y + Math.sin(d.ang) * d.cur.orbit; }
  function launch(g) {
    const d = g.data; if (d.fly) return;
    const sp = 330 + Math.min(140, d.made * 5);
    d.vx = -Math.sin(d.ang) * d.dir * sp; d.vy = Math.cos(d.ang) * d.dir * sp;
    d.fly = true; d.flyT = 0; g.snd.jump();
  }
  function land(g, p, err) {
    const d = g.data;
    d.fly = false; d.cur = p; d.ang = Math.atan2(d.y - p.y, d.x - p.x);
    const cross = (d.x - p.x) * d.vy - (d.y - p.y) * d.vx; d.dir = cross > 0 ? 1 : -1;
    d.made++;
    const clean = err < 4;
    d.combo = clean ? d.combo + 1 : 0; g.setMult(1 + Math.min(4, d.combo) * .5);
    g.add(clean ? 20 : 10, d.x, p.y - p.orbit - 12, clean ? '#3D5AFE' : '#1B1B1F');
    if (clean) { g.text('PERFECT', d.x, d.y - 20, '#FF5A5F', 14); g.shake(6, .2); g.snd.pick(); } else { g.shake(3, .15); g.snd.tap(); }
    g.burst(d.x, d.y - d.cam, [p.col, '#1B1B1F'], clean ? 26 : 12, 160);
    // keep a few planets above
    const top = d.planets[d.planets.length - 1];
    d.planets.push(planet(g, top.y - g.rnd(150, 205), d.planets.length));
    d.planets = d.planets.filter(q => q.y < d.cam + H + 200 || q === p);
  }
  function crash(g, msg) { const d = g.data; g.burst(d.x, d.y - d.cam, ['#FF5A5F', '#1B1B1F', '#3D5AFE'], 40, 240); g.snd.hit(); g.over(`${msg} You reached ${d.made} planet${d.made === 1 ? '' : 's'}.`); }
})();
