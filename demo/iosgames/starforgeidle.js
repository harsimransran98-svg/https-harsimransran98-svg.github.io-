/* Starforge Idle — mine asteroids, forge drones and ships. Progress saved locally. */
(() => {
  const W = 360, H = 640;
  const SHOP = [{ k: 'drone', name: 'Forge drone', base: 15, grow: 1.17, desc: '+1 ore/s' }, { k: 'laser', name: 'Mining laser', base: 60, grow: 1.5, desc: '+3 ore per tap' }, { k: 'ship', name: 'Launch ship', base: 400, grow: 2.1, desc: '×2 all income' }];
  const BTN = i => ({ x: 14, y: 470 + i * 52, w: W - 28, h: 44 });
  const cost = (s, n) => Math.ceil(s.base * Math.pow(s.grow, n));
  Arcade.start({
    id: 'starforgeidle', W, H, title: 'Starforge Idle', overTitle: 'Fleet saved',
    hint: 'Tap the drifting asteroids to mine ore. Forge drones that mine for you and launch ships that double everything.',
    init(g) {
      const s = g.store.get('bz_starforge', null) || { ore: 0, total: 0, drone: 0, laser: 0, ship: 0 };
      Object.assign(g.data, s, { rocks: [], drones: [], stars: Array.from({ length: 70 }, () => [Math.random() * W, Math.random() * 440, Math.random()]), saveT: 0, launch: 0 });
      for (let i = 0; i < 5; i++) rock(g, true); for (let i = 0; i < Math.min(12, s.drone); i++) g.data.drones.push({ a: Math.random() * 6, r: g.rnd(40, 70), t: null });
      g.setScore(Math.floor(s.total));
    },
    update(g, dt) {
      const d = g.data, mult = Math.pow(2, d.ship), rate = d.drone * mult; d.ore += rate * dt; d.total += rate * dt; g.setScore(Math.floor(d.total)); g.setMult(mult);
      d.stars.forEach(s => { s[0] -= (s[2] + .1) * 12 * dt; if (s[0] < 0) s[0] += W; });
      d.rocks.forEach(r => { r.x += r.vx * dt; r.y += r.vy * dt; r.rot += r.vr * dt; if (r.x < 30 || r.x > W - 30) r.vx *= -1; if (r.y < 120 || r.y > 400) r.vy *= -1; r.hit = Math.max(0, r.hit - dt * 4); });
      d.drones.forEach((dr, i) => { const t = d.rocks[i % d.rocks.length]; dr.a += dt * 1.5; dr.x = t.x + Math.cos(dr.a) * dr.r; dr.y = t.y + Math.sin(dr.a) * dr.r * .5; dr.t = t; if (Math.random() < dt * 2) g.trail(dr.x, dr.y, '#7DF9FF', 1.5, .3); });
      d.launch = Math.max(0, d.launch - dt);
      d.saveT += dt; if (d.saveT > 2) { d.saveT = 0; save(g); }
    },
    draw(g, ctx) {
      const d = g.data; ctx.fillStyle = '#070B1F'; ctx.fillRect(0, 0, W, H);
      (d.stars || []).forEach(([x, y, z]) => { ctx.fillStyle = `rgba(233,241,255,${.2 + z * .7})`; ctx.fillRect(x, y, 1 + z, 1 + z); });
      if (!d.rocks) return;
      const neb = ctx.createRadialGradient(260, 180, 10, 260, 180, 200); neb.addColorStop(0, 'rgba(255,97,210,.18)'); neb.addColorStop(1, 'rgba(255,97,210,0)'); ctx.fillStyle = neb; ctx.fillRect(0, 0, W, 460);
      d.rocks.forEach(r => { ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.rot); ctx.fillStyle = r.hit ? '#FFFFFF' : '#5C5F7A'; ctx.beginPath(); r.pts.forEach(([a, m], i) => { const x = Math.cos(a) * r.s * m, y = Math.sin(a) * r.s * m; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#7DF9FF'; ctx.globalAlpha = .7; ctx.beginPath(); ctx.arc(r.s * .2, -r.s * .1, r.s * .18, 0, 7); ctx.fill(); ctx.globalAlpha = 1; ctx.restore(); });
      d.drones.forEach(dr => { if (dr.x == null) return; ctx.fillStyle = '#7DF9FF'; ctx.beginPath(); ctx.moveTo(dr.x + 5, dr.y); ctx.lineTo(dr.x - 4, dr.y - 3); ctx.lineTo(dr.x - 4, dr.y + 3); ctx.fill(); if (Math.random() < .08) { ctx.strokeStyle = 'rgba(125,249,255,.6)'; ctx.beginPath(); ctx.moveTo(dr.x, dr.y); ctx.lineTo(dr.t.x, dr.t.y); ctx.stroke(); } });
      for (let i = 0; i < Math.min(5, d.ship); i++) { const x = 40 + i * 30 + (d.launch && i === d.ship - 1 ? (1 - d.launch) * 300 : 0), y = 430 - i % 2 * 8; ctx.fillStyle = '#FF61D2'; ctx.beginPath(); ctx.moveTo(x + 14, y); ctx.lineTo(x - 8, y - 7); ctx.lineTo(x - 4, y); ctx.lineTo(x - 8, y + 7); ctx.fill(); }
      ctx.fillStyle = '#E9F1FF'; ctx.font = `${g.fw} 22px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`◆ ${Math.floor(d.ore).toLocaleString()}`, 14, 106); ctx.font = `${g.fw} 12px ${g.font}`; ctx.textAlign = 'right'; ctx.fillText(`${(d.drone * Math.pow(2, d.ship)).toFixed(0)}/s · tap ${tapOre(d)}`, W - 14, 104);
      SHOP.forEach((s, i) => { const b = BTN(i), c = cost(s, d[s.k]), ok = d.ore >= c; ctx.fillStyle = ok ? '#7DF9FF' : 'rgba(233,241,255,.08)'; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 10); ctx.fill(); ctx.fillStyle = ok ? '#070B1F' : 'rgba(233,241,255,.6)'; ctx.textAlign = 'left'; ctx.font = `${g.fw} 14px ${g.font}`; ctx.fillText(`${s.name} · ${d[s.k]}`, b.x + 12, b.y + 19); ctx.font = `11px ${g.font}`; ctx.fillText(s.desc, b.x + 12, b.y + 34); ctx.textAlign = 'right'; ctx.font = `${g.fw} 15px ${g.font}`; ctx.fillText(`◆ ${c.toLocaleString()}`, b.x + b.w - 12, b.y + 27); });
    },
    down(g, x, y) {
      const d = g.data;
      for (let i = 0; i < SHOP.length; i++) { const b = BTN(i); if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) { buy(g, SHOP[i]); return; } }
      const r = d.rocks.find(r => Math.hypot(r.x - x, r.y - y) < r.s + 10); if (!r) return;
      const v = tapOre(d) * Math.pow(2, d.ship); d.ore += v; d.total += v; r.hit = 1; r.hp--; g.text(`+${v}`, x, y - 14, '#7DF9FF', 15); g.burst(x, y, ['#7DF9FF', '#5C5F7A', '#FF61D2'], 10, 140, .5, 2.5); g.sfx(900, .04, 'square', .03);
      if (r.hp <= 0) { const bonus = 10 * v; d.ore += bonus; d.total += bonus; g.text(`CRACKED +${bonus}`, r.x, r.y - 30, '#FF61D2', 15); g.burst(r.x, r.y, ['#7DF9FF', '#FF61D2', '#fff', '#5C5F7A'], 40, 220); g.shake(5, .2); g.snd.pick(); d.rocks.splice(d.rocks.indexOf(r), 1); rock(g); }
      g.setScore(Math.floor(d.total));
    },
    key(g, k, down) { if (!down) return; if (k === ' ') { const r = g.data.rocks[0]; g.cfg.down(g, r.x, r.y); } if ('123'.includes(k)) buy(g, SHOP[+k - 1]); }
  });
  const tapOre = d => 1 + d.laser * 3;
  function rock(g, init) { const s = g.rnd(18, 34), pts = Array.from({ length: 9 }, (_, i) => [i / 9 * Math.PI * 2, g.rnd(.75, 1.15)]); g.data.rocks.push({ x: init ? g.rnd(40, W - 40) : W + 10, y: g.rnd(140, 380), vx: g.rnd(-25, 25) || 10, vy: g.rnd(-12, 12), rot: 0, vr: g.rnd(-.6, .6), s, pts, hit: 0, hp: Math.round(s / 3) }); }
  function buy(g, s) {
    const d = g.data, c = cost(s, d[s.k]); if (d.ore < c) { g.snd.bad(); return; }
    d.ore -= c; d[s.k]++; g.snd.pick(); g.burst(W / 2, 480, '#7DF9FF', 16, 150);
    if (s.k === 'drone' && d.drones.length < 12) d.drones.push({ a: 0, r: g.rnd(40, 70) });
    if (s.k === 'ship') { d.launch = 1; g.text(`SHIP LAUNCHED · ×${Math.pow(2, d.ship)}`, W / 2, 300, '#FF61D2', 16); g.shake(6, .3); g.snd.win(); }
    save(g);
  }
  function save(g) { const d = g.data; g.store.set('bz_starforge', { ore: d.ore, total: d.total, drone: d.drone, laser: d.laser, ship: d.ship }); g.saveBest(); }
})();
