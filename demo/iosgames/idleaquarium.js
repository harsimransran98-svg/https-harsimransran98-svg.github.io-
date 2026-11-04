/* Idle Aquarium — feed fish, collect pearls, grow a calmer tank. Progress saved locally. */
(() => {
  const W = 360, H = 640, TOP = 96, BOT = 450;
  const SPECIES = [['Guppy', '#FFB703', 1], ['Tetra', '#FB8500', 2], ['Angelfish', '#8ECAE6', 4], ['Koi', '#E63946', 8], ['Moonfish', '#C77DFF', 15]];
  const SHOP = [{ k: 'fish', name: 'Buy fish', base: 10, grow: 1.35 }, { k: 'plant', name: 'Kelp garden', base: 50, grow: 1.8 }, { k: 'filter', name: 'Better filter', base: 150, grow: 2.2 }];
  const BTN = i => ({ x: 14 + i * 113, y: 520, w: 105, h: 74 });
  const cost = (s, n) => Math.ceil(s.base * Math.pow(s.grow, n));
  Arcade.start({
    id: 'idleaquarium', W, H, title: 'Idle Aquarium', overTitle: 'Tank saved',
    hint: 'Tap the water to drop food; fed fish drop pearls. Buy fish, kelp and filters. No timers, no stress.',
    init(g) {
      const s = g.store.get('bz_aquarium', null) || { pearls: 5, total: 0, fish: 1, plant: 0, filter: 0 };
      Object.assign(g.data, s, { swim: [], food: [], drops: [], bubbles: [], saveT: 0 });
      for (let i = 0; i < Math.min(18, s.fish); i++) addFish(g, i);
      g.setScore(Math.floor(s.total));
    },
    update(g, dt) {
      const d = g.data;
      d.swim.forEach(f => {
        let tx = f.tx, ty = f.ty; const food = d.food.length ? d.food.reduce((a, b) => Math.hypot(b.x - f.x, b.y - f.y) < Math.hypot(a.x - f.x, a.y - f.y) ? b : a) : null;
        if (food && Math.hypot(food.x - f.x, food.y - f.y) < 220) { tx = food.x; ty = food.y; }
        else if (Math.hypot(tx - f.x, ty - f.y) < 10) { f.tx = g.rnd(30, W - 30); f.ty = g.rnd(TOP + 30, BOT - 40); }
        const dx = tx - f.x, dy = ty - f.y, m = Math.hypot(dx, dy) || 1; f.vx += (dx / m * f.sp - f.vx) * dt * 2; f.vy += (dy / m * f.sp - f.vy) * dt * 2; f.x += f.vx * dt; f.y += f.vy * dt; f.t += dt * 6; f.hunger = Math.max(0, f.hunger - dt);
        if (food && Math.hypot(food.x - f.x, food.y - f.y) < 12) { food.eaten = true; f.hunger = 3; d.drops.push({ x: f.x, y: f.y, vy: 0, v: f.val * (1 + d.filter * .5) }); g.sfx(800, .04, 'sine', .03); }
      });
      d.food.forEach(p => { p.y += 30 * dt; p.x += Math.sin(p.y * .05) * .3; }); d.food = d.food.filter(p => !p.eaten && p.y < BOT);
      for (let i = d.drops.length - 1; i >= 0; i--) { const p = d.drops[i]; p.vy += 90 * dt; p.y += p.vy * dt; if (p.y > BOT - 8) { d.drops.splice(i, 1); collect(g, p.v, p.x, BOT - 16); } }
      const passive = d.plant * .4 * (1 + d.filter * .5); d.pearls += passive * dt; d.total += passive * dt; g.setScore(Math.floor(d.total));
      if (Math.random() < dt * 3) d.bubbles.push({ x: g.rnd(20, W - 20), y: BOT, r: g.rnd(2, 5) }); d.bubbles.forEach(b => { b.y -= 40 * dt; b.x += Math.sin(b.y * .05) * .3; }); d.bubbles = d.bubbles.filter(b => b.y > TOP);
      d.saveT += dt; if (d.saveT > 2) { d.saveT = 0; save(g); }
    },
    draw(g, ctx) {
      const d = g.data;
      const water = ctx.createLinearGradient(0, TOP, 0, BOT); water.addColorStop(0, '#0B4F8A'); water.addColorStop(1, '#03254C'); ctx.fillStyle = '#021B36'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = water; ctx.fillRect(0, TOP, W, BOT - TOP);
      for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(142,202,230,.05)'; ctx.beginPath(); ctx.moveTo(40 + i * 70 + Math.sin(g.t + i) * 10, TOP); ctx.lineTo(70 + i * 70, BOT); ctx.lineTo(90 + i * 70, BOT); ctx.lineTo(60 + i * 70 + Math.sin(g.t + i) * 10, TOP); ctx.fill(); }
      ctx.fillStyle = '#E9C46A'; ctx.beginPath(); ctx.moveTo(0, BOT); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, BOT - 14 + Math.sin(x * .05) * 5); ctx.lineTo(W, BOT); ctx.fill();
      if (!d.swim) return;
      for (let i = 0; i < Math.min(8, d.plant); i++) { const x = 24 + i * 44; ctx.strokeStyle = '#52B788'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, BOT - 8); for (let k = 1; k < 6; k++) ctx.lineTo(x + Math.sin(g.t * 1.5 + k + i) * 6, BOT - 8 - k * 18); ctx.stroke(); }
      ctx.lineCap = 'butt'; ctx.lineWidth = 1;
      d.bubbles.forEach(b => { ctx.strokeStyle = 'rgba(232,246,255,.5)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.stroke(); });
      d.food.forEach(p => { ctx.fillStyle = '#FFB703'; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); });
      d.drops.forEach(p => { ctx.fillStyle = '#F1FAEE'; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 7); ctx.fill(); });
      d.swim.forEach(f => { const dir = f.vx >= 0 ? 1 : -1; ctx.save(); ctx.translate(f.x, f.y); ctx.scale(dir * f.size, f.size); ctx.fillStyle = f.col; ctx.beginPath(); ctx.ellipse(0, 0, 14, 8, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-22, -8 + Math.sin(f.t) * 3); ctx.lineTo(-22, 8 + Math.sin(f.t) * 3); ctx.fill(); ctx.fillStyle = '#03254C'; ctx.beginPath(); ctx.arc(7, -2, 2, 0, 7); ctx.fill(); ctx.restore(); });
      ctx.fillStyle = '#E8F6FF'; ctx.font = `${g.fw} 22px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`◍ ${Math.floor(d.pearls).toLocaleString()}`, 16, 492); ctx.font = `${g.fw} 12px ${g.font}`; ctx.textAlign = 'right'; ctx.fillText(`${d.fish} fish · ${d.plant} kelp · filter ${d.filter}`, W - 16, 490);
      SHOP.forEach((s, i) => { const b = BTN(i), c = cost(s, d[s.k]), ok = d.pearls >= c; ctx.fillStyle = ok ? '#FFB703' : 'rgba(232,246,255,.1)'; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 16); ctx.fill(); ctx.fillStyle = ok ? '#03254C' : 'rgba(232,246,255,.6)'; ctx.textAlign = 'center'; ctx.font = `${g.fw} 13px ${g.font}`; ctx.fillText(s.name, b.x + b.w / 2, b.y + 28); ctx.font = `${g.fw} 15px ${g.font}`; ctx.fillText(`◍ ${c}`, b.x + b.w / 2, b.y + 52); });
    },
    down(g, x, y) {
      const d = g.data;
      for (let i = 0; i < SHOP.length; i++) { const b = BTN(i); if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) { buy(g, SHOP[i]); return; } }
      if (y > TOP && y < BOT - 20) { for (let i = 0; i < 4; i++) d.food.push({ x: x + g.rnd(-12, 12), y: Math.max(TOP + 4, y - 40 + i * 6) }); g.burst(x, y - 30, '#FFB703', 6, 60, .4, 2); g.sfx(1200, .03, 'sine', .02); }
    },
    key(g, k, down) { if (!down) return; if (k === ' ') g.cfg.down(g, g.rnd(60, 300), 200); if ('123'.includes(k)) buy(g, SHOP[+k - 1]); }
  });
  function addFish(g, i) { const sp = SPECIES[Math.min(SPECIES.length - 1, Math.floor(i / 3))]; g.data.swim.push({ x: g.rnd(40, W - 40), y: g.rnd(TOP + 40, BOT - 60), vx: 0, vy: 0, tx: g.rnd(30, W - 30), ty: g.rnd(TOP + 40, BOT - 60), sp: g.rnd(28, 48), t: Math.random() * 6, col: sp[1], val: sp[2], size: .8 + Math.min(.6, i * .04), hunger: 0 }); }
  function collect(g, v, x, y) { const d = g.data; d.pearls += v; d.total += v; g.add(0); g.setScore(Math.floor(d.total)); g.text(`+${Math.round(v * 10) / 10}`, x, y, '#F1FAEE', 13); g.burst(x, y, '#F1FAEE', 6, 70, .4, 2); }
  function buy(g, s) {
    const d = g.data, c = cost(s, d[s.k]); if (d.pearls < c) { g.snd.bad(); return; }
    d.pearls -= c; d[s.k]++; g.snd.pick(); g.burst(W / 2, 520, '#FFB703', 18, 150);
    if (s.k === 'fish' && d.swim.length < 18) { addFish(g, d.fish - 1); g.text(`A new ${SPECIES[Math.min(4, Math.floor((d.fish - 1) / 3))][0]}!`, W / 2, 300, '#E8F6FF', 15); }
    save(g);
  }
  function save(g) { const d = g.data; g.store.set('bz_aquarium', { pearls: d.pearls, total: d.total, fish: d.fish, plant: d.plant, filter: d.filter }); g.saveBest(); }
})();
