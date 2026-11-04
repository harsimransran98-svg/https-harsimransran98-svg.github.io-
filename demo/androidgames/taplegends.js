/* Tap Legends — idle tap-to-attack RPG battler. Progress is saved locally. */
(() => {
  const W = 360, H = 640, MX = 180, MY = 290;
  const MON = [['Slime', '#80ED99'], ['Goblin', '#90BE6D'], ['Bat', '#9D4EDD'], ['Skeleton', '#E9ECEF'], ['Wolf', '#ADB5BD'], ['Golem', '#B08968'], ['Wraith', '#4CC9F0'], ['Ogre', '#F3722C'], ['Lich', '#7209B7']];
  const UP = [{ k: 'blade', name: 'Sharper blade', base: 10, grow: 1.18, desc: '+2 tap damage' }, { k: 'hero', name: 'Hire hero', base: 30, grow: 1.22, desc: '+3 damage / s' }, { k: 'crit', name: 'Lucky charm', base: 120, grow: 1.9, desc: '+5% critical chance' }];
  const BTN = i => ({ x: 14, y: 476 + i * 50, w: W - 28, h: 42 });
  const cost = (u, n) => Math.ceil(u.base * Math.pow(u.grow, n));
  Arcade.start({
    id: 'taplegends', W, H, title: 'Tap Legends', overTitle: 'Defeated by the boss',
    hint: 'Tap the monster to strike. Spend gold on a sharper blade, heroes who fight for you, and luck. Beat the boss every 10th stage before its timer ends.',
    init(g) { const s = g.store.get('bz_legends', null) || { gold: 0, blade: 0, hero: 0, crit: 0, stage: 1, total: 0 }; Object.assign(g.data, s, { hitT: 0, saveT: 0, swing: 0 }); spawn(g); g.setScore(Math.floor(s.total)); },
    update(g, dt) {
      const d = g.data; d.hitT = Math.max(0, d.hitT - dt * 5); d.swing = Math.max(0, d.swing - dt * 4);
      if (d.hero) { d.acc = (d.acc || 0) + d.hero * 3 * dt; if (d.acc >= 1) { const n = Math.floor(d.acc); d.acc -= n; damage(g, n, false, true); } }
      if (d.boss) { d.bossT -= dt; if (d.bossT <= 0) { d.stage = Math.max(1, d.stage - 1); g.text('The boss escaped! Back one stage', W / 2, 200, '#F94144', 14); g.snd.bad(); spawn(g); } }
      d.saveT += dt; if (d.saveT > 2) { d.saveT = 0; save(g); }
    },
    draw(g, ctx) {
      const d = g.data;
      const bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#1B1035'); bg.addColorStop(1, '#3A1F5D'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#2A1650'; ctx.beginPath(); ctx.ellipse(MX, MY + 80, 120, 22, 0, 0, 7); ctx.fill();
      if (!d.mon) return;
      ctx.fillStyle = '#F5EEFF'; ctx.font = `20px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText(`Stage ${d.stage} · ${d.boss ? 'BOSS ' : ''}${d.mon.name}`, W / 2, 110);
      // hp bar
      ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(40, 124, W - 80, 14); ctx.fillStyle = d.boss ? '#F94144' : '#F9C74F'; ctx.fillRect(40, 124, (W - 80) * Math.max(0, d.hp / d.max), 14);
      ctx.fillStyle = '#fff'; ctx.font = `12px ${g.font}`; ctx.fillText(`${Math.ceil(d.hp).toLocaleString()} / ${d.max.toLocaleString()}`, W / 2, 135);
      if (d.boss) { ctx.fillStyle = d.bossT < 5 ? '#F94144' : '#F5EEFF'; ctx.fillText(`⏳ ${d.bossT.toFixed(1)}s`, W / 2, 158); }
      // monster
      const s = (d.boss ? 1.35 : 1) * (1 - d.hitT * .08), wob = Math.sin(g.t * 3) * 4;
      ctx.save(); ctx.translate(MX + (d.hitT > 0 ? (Math.random() - .5) * 8 : 0), MY + wob); ctx.scale(s, s);
      ctx.fillStyle = d.hitT > .5 ? '#fff' : d.mon.col; ctx.beginPath(); ctx.ellipse(0, 10, 62, 56, 0, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(0, 36, 50, 26, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#1B1035'; ctx.beginPath(); ctx.arc(-20, -4, 8, 0, 7); ctx.arc(20, -4, 8, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-18, -6, 3, 0, 7); ctx.arc(22, -6, 3, 0, 7); ctx.fill();
      ctx.strokeStyle = '#1B1035'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 26, 16, Math.PI * 1.1, Math.PI * 1.9, false); ctx.stroke();
      if (d.boss) { ctx.fillStyle = '#F9C74F'; ctx.beginPath(); ctx.moveTo(-36, -44); ctx.lineTo(-24, -70); ctx.lineTo(-12, -48); ctx.lineTo(0, -74); ctx.lineTo(12, -48); ctx.lineTo(24, -70); ctx.lineTo(36, -44); ctx.fill(); }
      ctx.restore();
      if (d.swing > 0) { ctx.strokeStyle = `rgba(255,255,255,${d.swing})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(MX, MY, 80, -1.2 + (1 - d.swing) * 1.4, -.2 + (1 - d.swing) * 1.4); ctx.stroke(); ctx.lineWidth = 1; }
      ctx.fillStyle = '#F9C74F'; ctx.font = `22px ${g.font}`; ctx.textAlign = 'left'; ctx.fillText(`◉ ${Math.floor(d.gold).toLocaleString()}`, 16, 452);
      ctx.fillStyle = '#F5EEFF'; ctx.font = `13px ${g.font}`; ctx.textAlign = 'right'; ctx.fillText(`tap ${tapDmg(d)} · heroes ${d.hero * 3}/s · crit ${Math.round(critP(d) * 100)}%`, W - 16, 450);
      UP.forEach((u, i) => { const b = BTN(i), c = cost(u, d[u.k]), ok = d.gold >= c; ctx.fillStyle = ok ? '#F9C74F' : 'rgba(245,238,255,.1)'; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 10); ctx.fill(); ctx.fillStyle = ok ? '#1B1035' : 'rgba(245,238,255,.6)'; ctx.textAlign = 'left'; ctx.font = `16px ${g.font}`; ctx.fillText(`${u.name} · ${d[u.k]}`, b.x + 12, b.y + 19); ctx.font = `12px ${g.font}`; ctx.fillText(u.desc, b.x + 12, b.y + 34); ctx.textAlign = 'right'; ctx.font = `16px ${g.font}`; ctx.fillText(`◉ ${c.toLocaleString()}`, b.x + b.w - 12, b.y + 27); });
    },
    down(g, x, y) {
      for (let i = 0; i < UP.length; i++) { const b = BTN(i); if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) { buy(g, UP[i]); return; } }
      if (y < 430) { const d = g.data, crit = Math.random() < critP(d); damage(g, tapDmg(d) * (crit ? 4 : 1), crit, false, x, y); d.swing = 1; }
    },
    key(g, k, down) { if (!down) return; if (k === ' ') g.cfg.down(g, MX, MY); if ('123'.includes(k)) buy(g, UP[+k - 1]); }
  });
  const tapDmg = d => 1 + d.blade * 2, critP = d => Math.min(.6, .05 + d.crit * .05);
  function spawn(g) { const d = g.data; d.boss = d.stage % 10 === 0; const m = MON[Math.floor((d.stage - 1) / 3) % MON.length]; d.mon = { name: m[0], col: m[1] }; d.max = Math.round(10 * Math.pow(1.32, d.stage - 1) * (d.boss ? 6 : 1)); d.hp = d.max; d.bossT = 30; }
  function damage(g, n, crit, auto, x = MX, y = MY - 40) {
    const d = g.data; d.hp -= n; d.hitT = 1;
    if (!auto) { g.text((crit ? 'CRIT ' : '') + n, x + g.rnd(-20, 20), y, crit ? '#F94144' : '#fff', crit ? 22 : 16); g.burst(x, y, crit ? ['#F94144', '#F9C74F'] : '#F5EEFF', crit ? 18 : 6, 160, .4, 2.5); g.sfx(crit ? 900 : 500, .05, 'square', .035); if (crit) g.shake(5, .12); }
    if (d.hp <= 0) {
      const gold = Math.round(d.max * .35 + 2); d.gold += gold; d.total += gold; g.add(0); g.setScore(Math.floor(d.total)); g.setMult(1 + Math.floor(d.stage / 10) * .5);
      g.text(`+${gold} ◉`, MX, MY - 80, '#F9C74F', 18); g.burst(MX, MY, [d.mon.col, '#F9C74F', '#fff'], d.boss ? 70 : 30, 240); g.shake(d.boss ? 12 : 4, .3);
      if (d.boss) { g.snd.win(); g.text('BOSS DEFEATED', W / 2, 200, '#F9C74F', 22); } else g.snd.pick();
      d.stage++; spawn(g); save(g);
    }
  }
  function buy(g, u) { const d = g.data, c = cost(u, d[u.k]); if (d.gold < c) { g.snd.bad(); return; } d.gold -= c; d[u.k]++; g.snd.pick(); g.burst(W / 2, 480, '#F9C74F', 16, 140); save(g); }
  function save(g) { const d = g.data; g.store.set('bz_legends', { gold: d.gold, blade: d.blade, hero: d.hero, crit: d.crit, stage: d.stage, total: d.total }); g.saveBest(); }
})();
