/* Neon Drift — synthwave lane-weaving racer. Rules only; engine in ../arcade-kit.js */
(() => {
  const W = 360, H = 640, HZ = 250, CX = 180;
  const P = d => Math.pow(d, 1.6);
  const proj = (d, lane) => { const p = P(d), half = 14 + 166 * p; return { x: CX + lane * half * .62, y: HZ + 310 * p, s: .08 + .92 * p }; };
  const CAR_COL = ['#FF2E97', '#B517FF', '#FF9F1C', '#F8F0FF'];

  Arcade.start({
    id: 'neondrift', W, H, title: 'Neon Drift', overText: 'You hit traffic. The city never sleeps, so go again.',
    hint: 'Steer through midnight traffic. Near misses score big, cyan orbs give you a boost.',
    init(g) { Object.assign(g.data, { px: 0, tx: 0, obs: [], spawn: .8, scroll: 0, boost: 0, acc: 0, lean: 0, dx0: null, tier: 0 }); },
    attract(g, dt) { g.data.scroll = (g.data.scroll + dt * 3) % 1; },
    update(g, dt) {
      const d = g.data, spd = (.55 + Math.min(.9, g.t * .018)) * (d.boost > 0 ? 1.45 : 1);
      d.scroll = (d.scroll + dt * spd * 4) % 1;
      const prev = d.px; d.px += (d.tx - d.px) * Math.min(1, dt * 12); d.lean = (d.px - prev) / Math.max(dt, .001);
      // speed tiers raise the multiplier
      const tier = Math.min(8, Math.floor(g.t / 9));
      if (tier !== d.tier) { d.tier = tier; g.text(`SPEED ×${1 + tier * .5}`, CX, 300, '#00F0FF', 18); g.sfx(500, .2, 'sawtooth', .03, 500); }
      const m = (1 + tier * .5) * (d.boost > 0 ? 2 : 1); if (m !== g.mult) g.setMult(m);
      if (d.boost > 0) { d.boost -= dt; if (d.boost <= 0) g.text('BOOST OVER', CX, 380, '#FF2E97', 14); }
      d.acc += dt * 60 * spd; if (d.acc >= 1) { const n = Math.floor(d.acc); d.acc -= n; g.add(n); }
      // spawn traffic and orbs
      d.spawn -= dt;
      if (d.spawn <= 0) {
        d.spawn = Math.max(.32, .95 - g.t * .012) * (.8 + Math.random() * .4);
        const lanes = [-1, 0, 1].sort(() => Math.random() - .5), n = Math.random() < Math.min(.45, g.t * .01) ? 2 : 1;
        for (let i = 0; i < n; i++) d.obs.push({ d: 0, lane: lanes[i], col: g.pick(CAR_COL), orb: false, near: false });
        if (Math.random() < .16) d.obs.push({ d: -.08, lane: lanes[2], orb: true });
      }
      // move + collide
      const pr = proj(1, d.px);
      for (let i = d.obs.length - 1; i >= 0; i--) {
        const o = d.obs[i]; o.d += dt * spd * (.28 + Math.max(0, o.d) * 1.5);
        if (o.d > .88 && o.d < .99 && !o.done) {
          const gap = Math.abs(o.lane - d.px);
          if (gap < .55) {
            o.done = true;
            if (o.orb) { d.boost = 3.5; g.add(250, pr.x, 500, '#00F0FF'); g.burst(pr.x, 540, ['#00F0FF', '#fff'], 26, 220); g.snd.pick(); g.shake(4); g.text('BOOST ×2', CX, 330, '#00F0FF', 22); d.obs.splice(i, 1); continue; }
            if (d.boost > 0) { const p = proj(o.d, o.lane); g.add(150, p.x, p.y - 20, '#FF9F1C'); g.burst(p.x, p.y, [o.col, '#fff', '#FF9F1C'], 30, 260); g.snd.hit(); g.shake(8); d.obs.splice(i, 1); continue; }
            g.burst(pr.x, 550, ['#FF2E97', '#00F0FF', '#fff', '#FF9F1C'], 60, 320, .9, 4); g.snd.hit(); g.over(`You hit traffic at speed ×${1 + d.tier * .5}.`); return;
          }
          if (!o.orb && gap < 1.15 && !o.near) { o.near = true; }
        }
        if (o.d >= 1 && o.near && !o.scored && !o.orb) { o.scored = true; g.add(50, pr.x, 470, '#FF2E97'); g.text('NEAR MISS', pr.x, 450, '#FF2E97', 13); g.sfx(1200, .06, 'square', .03); }
        if (o.d > 1.15) d.obs.splice(i, 1);
      }
      // exhaust trail
      const c = d.boost > 0 ? '#00F0FF' : '#FF2E97';
      g.trail(pr.x - 10 + Math.random() * 4, 588, c, 3, .35, -d.lean * 6, 260);
      g.trail(pr.x + 10 - Math.random() * 4, 588, c, 3, .35, -d.lean * 6, 260);
    },
    draw(g, ctx) {
      const d = g.data;
      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, HZ); sky.addColorStop(0, '#0D0221'); sky.addColorStop(.6, '#2D0B5A'); sky.addColorStop(1, '#8A1C7C');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, HZ);
      for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${.2 + (i % 5) * .1})`; ctx.fillRect((i * 97) % W, (i * 53) % 170, 1.5, 1.5); }
      // sun with stripes
      ctx.save(); ctx.beginPath(); ctx.arc(CX, HZ - 30, 78, 0, 7); ctx.clip();
      const sun = ctx.createLinearGradient(0, HZ - 108, 0, HZ + 48); sun.addColorStop(0, '#FFE66D'); sun.addColorStop(.55, '#FF6B9D'); sun.addColorStop(1, '#FF2E97');
      ctx.fillStyle = sun; ctx.fillRect(CX - 80, HZ - 110, 160, 160);
      ctx.fillStyle = '#3A0E5C'; for (let i = 0; i < 7; i++) { const y = HZ - 52 + i * 9 + ((d.scroll * 9) % 9); ctx.fillRect(CX - 80, y, 160, 1.5 + i * .7); }
      ctx.restore();
      // mountains
      ctx.fillStyle = '#16052E'; ctx.strokeStyle = '#00F0FF'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, HZ);
      [[0, 210], [40, 190], [80, 222], [120, 200], [150, 228], [210, 228], [240, 196], [280, 216], [320, 186], [360, 214]].forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.lineTo(W, HZ); ctx.closePath(); ctx.fill(); ctx.stroke();
      // ground + grid
      ctx.fillStyle = '#0A0118'; ctx.fillRect(0, HZ, W, H - HZ);
      ctx.strokeStyle = 'rgba(255,46,151,.55)'; ctx.lineWidth = 1;
      for (let k = 0; k < 16; k++) { const dd = ((k + d.scroll) % 16) / 16, y = HZ + 390 * P(dd); ctx.globalAlpha = .15 + dd * .85; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.globalAlpha = 1;
      for (let i = -9; i <= 9; i++) { ctx.beginPath(); ctx.moveTo(CX + i * 6, HZ); ctx.lineTo(CX + i * 150, H + 60); ctx.stroke(); }
      // road edges
      ctx.strokeStyle = '#00F0FF'; ctx.lineWidth = 2.5; ctx.shadowColor = '#00F0FF'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(CX - 14, HZ); ctx.lineTo(CX - 200, H + 30); ctx.moveTo(CX + 14, HZ); ctx.lineTo(CX + 200, H + 30); ctx.stroke();
      ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(248,240,255,.35)'; ctx.setLineDash([14, 18]); ctx.lineDashOffset = -d.scroll * 64;
      [-.5, .5].forEach(l => { ctx.beginPath(); const a = proj(0, l), b = proj(1.1, l); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }); ctx.setLineDash([]);
      // traffic (far first)
      d.obs.slice().sort((a, b) => a.d - b.d).forEach(o => {
        if (o.d < 0) return; const p = proj(o.d, o.lane), s = p.s;
        if (o.orb) { ctx.fillStyle = '#00F0FF'; ctx.shadowColor = '#00F0FF'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(p.x, p.y - 14 * s, 11 * s, 0, 7); ctx.fill(); ctx.shadowBlur = 0; return; }
        const w = 50 * s, h = 26 * s;
        ctx.fillStyle = '#12052A'; ctx.strokeStyle = o.col; ctx.lineWidth = 2; ctx.shadowColor = o.col; ctx.shadowBlur = 14 * s;
        ctx.beginPath(); ctx.roundRect(p.x - w / 2, p.y - h, w, h, 4 * s); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p.x - w * .35, p.y - h); ctx.lineTo(p.x - w * .25, p.y - h * 1.5); ctx.lineTo(p.x + w * .25, p.y - h * 1.5); ctx.lineTo(p.x + w * .35, p.y - h); ctx.stroke();
        ctx.fillStyle = '#FF003C'; ctx.fillRect(p.x - w * .42, p.y - h * .55, w * .2, h * .2); ctx.fillRect(p.x + w * .22, p.y - h * .55, w * .2, h * .2);
        ctx.shadowBlur = 0;
      });
      // player
      const pr = proj(1, d.px), col = d.boost > 0 ? '#00F0FF' : '#FF2E97';
      ctx.save(); ctx.translate(pr.x, 575); ctx.rotate(Math.max(-.25, Math.min(.25, d.lean * .02)));
      ctx.shadowColor = col; ctx.shadowBlur = 22; ctx.fillStyle = '#1A0533'; ctx.strokeStyle = col; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(26, 6); ctx.lineTo(20, 14); ctx.lineTo(-20, 14); ctx.lineTo(-26, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(12, -4); ctx.lineTo(-12, -4); ctx.closePath(); ctx.strokeStyle = '#00F0FF'; ctx.stroke();
      ctx.restore(); ctx.shadowBlur = 0;
      if (d.boost > 0) { ctx.strokeStyle = 'rgba(0,240,255,.35)'; for (let i = 0; i < 8; i++) { const x = (i * 53 + g.t * 900) % W, y = 300 + (i * 41) % 300; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 40); ctx.stroke(); } }
    },
    key(g, k, down) { if (!down) return; const d = g.data; if (k === 'ArrowLeft' || k === 'a' || k === 'A') d.tx = Math.max(-1, Math.round(d.tx) - 1); if (k === 'ArrowRight' || k === 'd' || k === 'D') d.tx = Math.min(1, Math.round(d.tx) + 1); },
    down(g, x) { g.data.dx0 = x; g.data.dragged = false; },
    move(g, x, y, isDown) { const d = g.data; if (!isDown || d.dx0 == null) return; if (Math.abs(x - d.dx0) > 12) d.dragged = true; if (d.dragged) d.tx = g.clamp((x - CX) / 110, -1.1, 1.1); },
    up(g, x) { const d = g.data; if (!d.dragged && d.dx0 != null) d.tx = x < CX ? Math.max(-1, Math.round(d.tx) - 1) : Math.min(1, Math.round(d.tx) + 1); d.dx0 = null; }
  });
})();
