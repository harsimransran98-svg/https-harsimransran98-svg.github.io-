/* Colony Tap — idle ant-colony builder. Progress is saved locally. */
(() => {
  const W = 360, H = 640, NEST = { x: 180, y: 300 };
  const UP = [
    { k: 'worker', name: 'Hire worker', base: 15, grow: 1.15, desc: '+1 food/s' },
    { k: 'mandible', name: 'Stronger jaws', base: 40, grow: 1.6, desc: '+1 per tap' },
    { k: 'chamber', name: 'Dig chamber', base: 250, grow: 2.2, desc: '×1.5 all income' }
  ];
  const BTN = (i) => ({ x: 14, y: 470 + i * 52, w: W - 28, h: 44 });
  const cost = (u, n) => Math.ceil(u.base * Math.pow(u.grow, n));
  Arcade.start({
    id: 'colonytap', W, H, title: 'Colony Tap', overTitle: 'Colony saved',
    hint: 'Tap the nest to forage. Spend food on workers, jaws and chambers. Your colony keeps working while you watch.',
    init(g) {
      const save = g.store.get('bz_colony', null) || { food: 0, worker: 0, mandible: 0, chamber: 0, total: 0 };
      Object.assign(g.data, save, { ants: [], crumbs: Array.from({ length: 10 }, () => ({ x: g.rnd(30, W - 30), y: g.rnd(110, 200) })), saveT: 0, pulse: 0 });
      for (let i = 0; i < Math.min(40, g.data.worker); i++) addAnt(g);
      g.setScore(Math.floor(g.data.total));
    },
    update(g, dt) {
      const d = g.data, rate = d.worker * Math.pow(1.5, d.chamber);
      d.food += rate * dt; d.total += rate * dt; g.setScore(Math.floor(d.total)); g.setMult(Math.pow(1.5, d.chamber));
      d.pulse = Math.max(0, d.pulse - dt * 4);
      d.ants.forEach(a => { const t = a.toFood ? a.target : NEST; const dx = t.x - a.x, dy = t.y - a.y, dist = Math.hypot(dx, dy); if (dist < 4) { a.toFood = !a.toFood; if (a.toFood) a.target = g.pick(d.crumbs); } else { a.x += dx / dist * a.sp * dt + Math.sin(g.t * 9 + a.ph) * .4; a.y += dy / dist * a.sp * dt; } });
      d.saveT += dt; if (d.saveT > 2) { d.saveT = 0; persist(g); }
    },
    draw(g, ctx) {
      const d = g.data;
      const sky = ctx.createLinearGradient(0, 0, 0, 230); sky.addColorStop(0, '#8ECAE6'); sky.addColorStop(1, '#BDE0FE'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 230);
      ctx.fillStyle = '#8AC926'; ctx.fillRect(0, 200, W, 30); ctx.fillStyle = '#5C3D1E'; ctx.fillRect(0, 230, W, H - 230);
      ctx.fillStyle = '#4A2F15'; for (let i = 0; i < 40; i++) ctx.fillRect((i * 83) % W, 240 + (i * 37) % 200, 4, 3);
      if (!d.crumbs) return;
      // tunnels and chambers
      ctx.strokeStyle = '#2B1B0E'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(NEST.x, 215); ctx.lineTo(NEST.x, NEST.y); ctx.stroke();
      for (let i = 0; i < Math.min(6, d.chamber); i++) { const cx = i % 2 ? 260 : 100, cy = 300 + Math.floor(i / 2) * 50; ctx.beginPath(); ctx.moveTo(NEST.x, NEST.y); ctx.lineTo(cx, cy); ctx.stroke(); ctx.fillStyle = '#2B1B0E'; ctx.beginPath(); ctx.ellipse(cx, cy, 34, 18, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#F4A261'; ctx.beginPath(); ctx.arc(cx - 8, cy + 4, 4, 0, 7); ctx.arc(cx + 6, cy + 2, 3, 0, 7); ctx.fill(); }
      d.crumbs.forEach(c => { ctx.fillStyle = '#F4A261'; ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, 7); ctx.fill(); });
      // nest mound (tap target)
      const s = 1 + d.pulse * .12; ctx.save(); ctx.translate(NEST.x, 214); ctx.scale(s, s);
      ctx.fillStyle = '#7A5230'; ctx.beginPath(); ctx.ellipse(0, 0, 60, 34, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#2B1B0E'; ctx.beginPath(); ctx.ellipse(0, -2, 12, 7, 0, 0, 7); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#FFF3E0'; ctx.font = `13px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText('TAP THE NEST', NEST.x, 168);
      d.ants.forEach(a => { ctx.fillStyle = '#1A0F07'; ctx.beginPath(); ctx.arc(a.x, a.y, 2.6, 0, 7); ctx.arc(a.x + 3, a.y, 2, 0, 7); ctx.fill(); if (!a.toFood) { ctx.fillStyle = '#F4A261'; ctx.fillRect(a.x - 1, a.y - 4, 2, 2); } });
      // stats + shop
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 410, W, 52);
      ctx.fillStyle = '#FFF3E0'; ctx.font = `22px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`❋ ${Math.floor(d.food).toLocaleString()}`, 14, 444);
      ctx.font = `13px ${g.font}`; ctx.textAlign = 'right'; ctx.fillText(`${(d.worker * Math.pow(1.5, d.chamber)).toFixed(1)}/s · ${d.worker} ants`, W - 14, 442);
      UP.forEach((u, i) => {
        const b = BTN(i), c = cost(u, d[u.k]), ok = d.food >= c;
        ctx.fillStyle = ok ? '#F4A261' : 'rgba(255,243,224,.12)'; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 12); ctx.fill();
        ctx.fillStyle = ok ? '#2B1B0E' : 'rgba(255,243,224,.6)'; ctx.textAlign = 'left'; ctx.font = `15px ${g.font}`; ctx.fillText(`${u.name} (${d[u.k]})`, b.x + 14, b.y + 20);
        ctx.font = `11px ${g.font}`; ctx.fillText(u.desc, b.x + 14, b.y + 36); ctx.textAlign = 'right'; ctx.font = `15px ${g.font}`; ctx.fillText(`❋ ${c.toLocaleString()}`, b.x + b.w - 14, b.y + 28);
      });
    },
    down(g, x, y) {
      const d = g.data;
      for (let i = 0; i < UP.length; i++) { const b = BTN(i); if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) { buy(g, UP[i]); return; } }
      if (y < 400) { const v = (1 + d.mandible) * Math.pow(1.5, d.chamber); d.food += v; d.total += v; d.pulse = 1; g.text('+' + (Math.round(v * 10) / 10), x, y - 10, '#F4A261', 16); g.burst(x, y, ['#F4A261', '#8AC926'], 8, 120, .4, 2.5); g.snd.tap(); g.setScore(Math.floor(d.total)); }
    },
    key(g, k, down) { if (!down) return; if (k === ' ') g.cfg.down(g, NEST.x, 214); if (k === '1' || k === '2' || k === '3') buy(g, UP[+k - 1]); }
  });
  function addAnt(g) { const d = g.data; d.ants.push({ x: NEST.x, y: 214, toFood: true, target: g.pick(d.crumbs), sp: g.rnd(30, 55), ph: Math.random() * 6 }); }
  function buy(g, u) {
    const d = g.data, c = cost(u, d[u.k]);
    if (d.food < c) { g.snd.bad(); g.text('Need more food', W / 2, 400, '#FFF3E0', 13); return; }
    d.food -= c; d[u.k]++; g.snd.pick(); g.burst(W / 2, 470, '#F4A261', 18, 160); g.shake(3, .1);
    if (u.k === 'worker' && d.ants.length < 40) addAnt(g);
    if (u.k === 'chamber') g.text(`Chamber ${d.chamber} dug! ×${Math.pow(1.5, d.chamber).toFixed(2)}`, W / 2, 360, '#8AC926', 15);
    persist(g);
  }
  function persist(g) { const d = g.data; g.store.set('bz_colony', { food: d.food, worker: d.worker, mandible: d.mandible, chamber: d.chamber, total: d.total }); g.saveBest(); }
})();
