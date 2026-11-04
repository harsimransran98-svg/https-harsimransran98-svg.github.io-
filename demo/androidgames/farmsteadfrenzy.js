/* Farmstead Frenzy — 90-second farming time-management rounds. */
(() => {
  const W = 360, H = 640, GX = 24, GY = 150, CS = 96, GAP = 8;
  const CROPS = [{ k: 'carrot', c: '#F77F00', grow: 3.2, pay: 30, e: '🥕' }, { k: 'corn', c: '#FFD60A', grow: 4.5, pay: 45, e: '🌽' }, { k: 'tomato', c: '#E63946', grow: 6, pay: 60, e: '🍅' }];
  Arcade.start({
    id: 'farmsteadfrenzy', W, H, title: 'Farmstead Frenzy', overTitle: 'Market closed!',
    hint: 'Tap an empty plot to plant the selected seed, tap again to water, and tap ripe crops to harvest and fill orders. 90 seconds!',
    init(g) {
      const d = g.data; Object.assign(d, { time: 90, seed: 0, plots: Array.from({ length: 9 }, () => ({ st: 'empty' })), orders: [], barn: { carrot: 0, corn: 0, tomato: 0 }, served: 0 });
      for (let i = 0; i < 3; i++) newOrder(g);
    },
    update(g, dt) {
      const d = g.data; d.time -= dt;
      if (d.time <= 0) { d.time = 0; g.over(`You served ${d.served} order${d.served === 1 ? '' : 's'} today.`); return; }
      d.plots.forEach(p => { if (p.st === 'grow') { p.t += dt * (p.wet ? 1.8 : 1); if (p.t >= p.crop.grow) { p.st = 'ripe'; p.rt = 0; } } else if (p.st === 'ripe') { p.rt += dt; if (p.rt > 8) { p.st = 'wilt'; } } });
      d.orders.forEach(o => { o.t -= dt; }); const late = d.orders.filter(o => o.t <= 0); if (late.length) { d.orders = d.orders.filter(o => o.t > 0); late.forEach(() => newOrder(g)); g.snd.bad(); g.text('Order expired', 290, 120, '#E63946', 13); g.setMult(1); }
    },
    draw(g, ctx) {
      const d = g.data;
      ctx.fillStyle = '#FFF7E6'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#B7E4C7'; ctx.fillRect(0, 130, W, 330);
      if (!d.plots) return;
      // timer bar
      ctx.fillStyle = 'rgba(59,42,22,.12)'; ctx.fillRect(14, 96, W - 28, 10); ctx.fillStyle = d.time < 15 ? '#E63946' : '#2A9D8F'; ctx.fillRect(14, 96, (W - 28) * d.time / 90, 10);
      ctx.fillStyle = '#3B2A16'; ctx.font = `${g.fw} 13px ${g.font}`; ctx.textAlign = 'right'; ctx.fillText(`${Math.ceil(d.time)}s`, W - 14, 124);
      d.plots.forEach((p, i) => {
        const x = GX + (i % 3) * (CS + GAP), y = GY + Math.floor(i / 3) * (CS + GAP);
        ctx.fillStyle = p.wet ? '#6B4226' : '#9C6B3F'; ctx.beginPath(); ctx.roundRect(x, y, CS, CS, 14); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.12)'; for (let r = 1; r < 4; r++) { ctx.beginPath(); ctx.moveTo(x + 10, y + r * 24); ctx.lineTo(x + CS - 10, y + r * 24); ctx.stroke(); }
        ctx.textAlign = 'center';
        if (p.st === 'grow') { const f = p.t / p.crop.grow; ctx.fillStyle = '#2D6A4F'; ctx.beginPath(); ctx.ellipse(x + CS / 2, y + CS - 26 - f * 18, 6 + f * 12, 4 + f * 10, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x + 14, y + CS - 12, (CS - 28) * f, 5); if (!p.wet) { ctx.font = '16px sans-serif'; ctx.fillText('💧?', x + CS - 22, y + 22); } }
        if (p.st === 'ripe') { const b = 1 + Math.sin(g.t * 8) * .08; ctx.save(); ctx.translate(x + CS / 2, y + CS / 2); ctx.scale(b, b); ctx.font = '42px sans-serif'; ctx.fillText(p.crop.e, 0, 14); ctx.restore(); ctx.strokeStyle = '#FFD60A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x + 2, y + 2, CS - 4, CS - 4, 12); ctx.stroke(); ctx.lineWidth = 1; }
        if (p.st === 'wilt') { ctx.font = '34px sans-serif'; ctx.fillText('🥀', x + CS / 2, y + CS / 2 + 12); }
        if (p.st === 'empty') { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = `${g.fw} 11px ${g.font}`; ctx.fillText('PLANT', x + CS / 2, y + CS / 2 + 4); }
      });
      // seed picker
      CROPS.forEach((c, i) => { const x = 24 + i * 108, y = 476; ctx.fillStyle = i === d.seed ? c.c : 'rgba(59,42,22,.08)'; ctx.beginPath(); ctx.roundRect(x, y, 96, 40, 12); ctx.fill(); ctx.fillStyle = i === d.seed ? '#fff' : '#3B2A16'; ctx.font = `${g.fw} 14px ${g.font}`; ctx.textAlign = 'center'; ctx.fillText(`${c.e} ${c.k}`, x + 48, y + 26); });
      // orders
      ctx.textAlign = 'left'; ctx.fillStyle = '#3B2A16'; ctx.font = `${g.fw} 12px ${g.font}`; ctx.fillText('ORDERS · tap ripe crops to deliver', 24, 538);
      d.orders.forEach((o, i) => { const x = 24 + i * 108, y = 548; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(x, y, 96, 58, 12); ctx.fill(); ctx.fillStyle = 'rgba(231,111,81,.25)'; ctx.fillRect(x + 8, y + 48, 80 * Math.max(0, o.t / o.max), 4); ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(o.items.map(k => CROPS.find(c => c.k === k).e).join(''), x + 48, y + 28); ctx.fillStyle = '#2A9D8F'; ctx.font = `${g.fw} 12px ${g.font}`; ctx.fillText(`${o.got}/${o.items.length}`, x + 48, y + 44); });
    },
    down(g, x, y) {
      const d = g.data;
      if (y > 476 && y < 516) { const i = Math.floor((x - 24) / 108); if (i >= 0 && i < 3) { d.seed = i; g.snd.tap(); } return; }
      const cx = Math.floor((x - GX) / (CS + GAP)), cy = Math.floor((y - GY) / (CS + GAP)); if (cx < 0 || cx > 2 || cy < 0 || cy > 2) return;
      const p = d.plots[cy * 3 + cx], px = GX + cx * (CS + GAP) + CS / 2, py = GY + cy * (CS + GAP) + CS / 2;
      if (p.st === 'empty') { Object.assign(p, { st: 'grow', crop: CROPS[d.seed], t: 0, wet: false }); g.sfx(500, .06, 'triangle', .04); g.burst(px, py, '#9C6B3F', 8, 80, .4, 2); }
      else if (p.st === 'grow' && !p.wet) { p.wet = true; g.sfx(900, .1, 'sine', .04, -500); g.burst(px, py - 20, '#48CAE4', 14, 110, .5, 2); }
      else if (p.st === 'ripe') { harvest(g, p, px, py); }
      else if (p.st === 'wilt') { p.st = 'empty'; g.sfx(200, .1, 'triangle', .03); }
    },
    key(g, k, down) { if (down && '123'.includes(k)) g.data.seed = +k - 1; }
  });
  function newOrder(g) { const n = 1 + Math.floor(Math.random() * 3), items = Array.from({ length: n }, () => g.pick(CROPS).k); g.data.orders.push({ items, got: 0, t: 20 + n * 8, max: 20 + n * 8 }); if (g.data.orders.length > 3) g.data.orders.shift(); }
  function harvest(g, p, px, py) {
    const d = g.data, k = p.crop.k; p.st = 'empty';
    const o = d.orders.find(o => o.items.slice(o.got).includes(k));
    if (o) {
      const idx = o.items.indexOf(k, o.got); [o.items[o.got], o.items[idx]] = [o.items[idx], o.items[o.got]]; o.got++;
      g.add(p.crop.pay, px, py - 30, '#2A9D8F'); g.burst(px, py, ['#FFD60A', p.crop.c], 16, 160); g.snd.pick();
      if (o.got === o.items.length) { d.served++; g.setMult(Math.min(4, g.mult + .5)); const tip = g.add(40 * o.items.length + Math.round(o.t * 3)); g.text(`Order done! +${tip} tip`, 180, 530, '#E76F51', 15); g.shake(4); g.snd.win(); d.orders.splice(d.orders.indexOf(o), 1); newOrder(g); d.time = Math.min(90, d.time + 3); }
    } else { g.add(5, px, py - 30, '#3B2A16'); g.text('No order wants that', px, py, '#3B2A16', 11); g.snd.tap(); }
  }
})();
