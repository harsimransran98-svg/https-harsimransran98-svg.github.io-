/* ==================================================================
   LIVE DEMO ENGINE — every project card opens a functional in-page
   prototype. Prototypes are generated from a small set of reusable,
   fully interactive UI shapes, skinned per project.
   ================================================================== */
function hashStr(s){ let h=0; for(let i=0;i<s.length;i++){ h=(h*31 + s.charCodeAt(i))|0; } return Math.abs(h); }
const SHAPES = ['toggle','list','tracker','stats','form'];
function shapeFor(p){ return SHAPES[hashStr(p.title) % SHAPES.length]; }
function slugFor(p){ return p.title.toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,16) || 'demo'; }

function demoHead(project, meta){
  return `<div class="demo-head"><div class="demo-icon" style="background:${meta.color}">${project.title.replace(/[^A-Za-z]/g,'').charAt(0) || 'B'}</div><div><div class="demo-title">${project.title}</div><div class="demo-sub">${project.desc}</div></div></div>`;
}

function shapeHTML(shape, project, meta){
  const h = hashStr(project.title);
  if(shape === 'toggle'){
    return `<div class="demo-panel">${demoHead(project,meta)}
      <div class="demo-rows">
        <div class="demo-row"><span>Enabled</span><button class="demo-switch on" data-switch></button></div>
        <div class="demo-row"><span>Run automatically</span><button class="demo-switch" data-switch></button></div>
        <div class="demo-row"><span>Notifications</span><button class="demo-switch on" data-switch></button></div>
      </div>
      <div class="demo-status" data-status>2 of 3 active</div></div>`;
  }
  if(shape === 'list'){
    return `<div class="demo-panel">${demoHead(project,meta)}
      <div class="demo-addrow"><input class="demo-input" data-input placeholder="Add an item…" style="margin:0;"><button class="demo-btn-primary" data-add style="background:${meta.color}">Add</button></div>
      <ul class="demo-list" data-list>
        <li>Welcome to ${project.title}</li>
        <li>Sample saved item #${(h%89)+1}</li>
      </ul></div>`;
  }
  if(shape === 'tracker'){
    const bars = Array.from({length:7}, (_,i) => `<div style="height:${20 + ((h>>i)%80)}%"></div>`).join('');
    return `<div class="demo-panel">${demoHead(project,meta)}
      <div class="demo-trackrow"><div class="demo-bignum" data-bignum>${(h%400)+40}</div><button class="demo-btn-primary" data-inc style="background:${meta.color}">+ Track</button></div>
      <div class="demo-bars">${bars}</div>
      <div class="demo-status">Updated just now</div></div>`;
  }
  if(shape === 'stats'){
    return `<div class="demo-panel">${demoHead(project,meta)}
      <div class="demo-stat-grid">
        <div class="demo-stat"><div class="demo-stat-num" data-target="${(h%400)+80}">0</div><div class="demo-stat-label">Sessions</div></div>
        <div class="demo-stat"><div class="demo-stat-num" data-target="${(h%40)+60}">0</div><div class="demo-stat-label">Score</div></div>
        <div class="demo-stat"><div class="demo-stat-num" data-target="${(h%25)+3}">0</div><div class="demo-stat-label">Streak</div></div>
      </div></div>`;
  }
  // form
  return `<div class="demo-panel">${demoHead(project,meta)}
    <input class="demo-input" placeholder="Your name">
    <input class="demo-input" placeholder="Email address">
    <button class="demo-btn-primary" data-submit style="background:${meta.color}">Save settings</button>
    <div class="demo-success" data-success hidden>Saved ✓</div></div>`;
}

function wireShape(shape){
  const root = document.getElementById('demoBody');
  root.querySelectorAll('[data-switch]').forEach(sw => {
    sw.addEventListener('click', () => {
      sw.classList.toggle('on');
      const status = root.querySelector('[data-status]');
      if(status){
        const total = root.querySelectorAll('[data-switch]').length;
        const on = root.querySelectorAll('[data-switch].on').length;
        status.textContent = `${on} of ${total} active`;
      }
    });
  });
  const add = root.querySelector('[data-add]');
  if(add){
    add.addEventListener('click', () => {
      const input = root.querySelector('[data-input]');
      if(input.value.trim()){
        const li = document.createElement('li');
        li.textContent = input.value.trim();
        root.querySelector('[data-list]').prepend(li);
        input.value = '';
      }
    });
  }
  const inc = root.querySelector('[data-inc]');
  if(inc){
    inc.addEventListener('click', () => {
      const num = root.querySelector('[data-bignum]');
      num.textContent = parseInt(num.textContent,10) + 1;
    });
  }
  const submit = root.querySelector('[data-submit]');
  if(submit){
    submit.addEventListener('click', () => {
      const s = root.querySelector('[data-success]');
      s.hidden = false;
      clearTimeout(submit._t);
      submit._t = setTimeout(() => s.hidden = true, 2500);
    });
  }
  root.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const start = performance.now();
    const dur = 900;
    function step(now){
      const p = Math.min(1, (now-start)/dur);
      el.textContent = Math.round(target * (1 - Math.pow(1-p,3)));
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

function siteHTML(project, meta){
  return `<div class="demo-site">
    <div class="demo-site-nav"><span style="color:${meta.color}">●</span> ${project.title}<div class="demo-site-nav-links"><span>Work</span><span>About</span><span>Contact</span></div></div>
    <div class="demo-site-hero">
      <h3>${project.title}</h3>
      <p>${project.desc}</p>
      <button class="demo-btn-primary" data-cta style="background:${meta.color}">Get in touch</button>
    </div>
    <div class="demo-site-feats">
      <div class="demo-feat"><span>01</span><p>Thoughtful, subject-specific design</p></div>
      <div class="demo-feat"><span>02</span><p>Built for speed and clarity</p></div>
      <div class="demo-feat"><span>03</span><p>Fully responsive on every device</p></div>
    </div>
  </div>`;
}
function wireSite(){
  const cta = document.querySelector('#demoBody [data-cta]');
  if(!cta) return;
  cta.addEventListener('click', () => {
    let toast = document.querySelector('.demo-toast');
    if(!toast){
      toast = document.createElement('div');
      toast.className = 'demo-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = 'Thanks — this is a demo';
    setTimeout(() => toast.remove(), 2000);
  });
}

function wpAdminHTML(project, meta){
  return `<div class="demo-wp">
    <div class="demo-wp-head" style="font-family:'Unbounded',sans-serif;font-weight:700;font-size:14px;margin-bottom:14px;">${project.title} settings</div>
    <div class="demo-rows">
      <div class="demo-row"><span>Enable plugin</span><button class="demo-switch on" data-switch></button></div>
      <div class="demo-row"><span>Cache assets</span><button class="demo-switch" data-switch></button></div>
      <div class="demo-row"><span>Show admin bar widget</span><button class="demo-switch on" data-switch></button></div>
    </div>
    <button class="demo-btn-primary" data-save style="background:${meta.color}">Save changes</button>
    <div class="demo-success" data-success hidden>Settings saved</div>
  </div>`;
}
function wireWpAdmin(){
  wireShape('toggle');
  const save = document.querySelector('#demoBody [data-save]');
  if(save){
    save.addEventListener('click', () => {
      const s = document.querySelector('#demoBody [data-success]');
      s.hidden = false;
      setTimeout(() => s.hidden = true, 2200);
    });
  }
}

let demoVideoTimer = null;
let demoGameTimer = null;
function videoHTML(project, meta){
  return `<div class="demo-video">
    <div class="demo-video-screen" style="background:linear-gradient(135deg, ${meta.color}66, #050506)"><div class="demo-video-title">${project.title}</div></div>
    <div class="demo-video-controls">
      <button class="demo-play" data-play style="border-color:${meta.color}">▶</button>
      <div class="demo-progress-track"><div class="demo-progress-fill" data-fill style="background:${meta.color}"></div></div>
      <span class="demo-time mono" data-time>0:00</span>
      <input type="range" class="demo-volume" min="0" max="100" value="70">
    </div>
  </div>`;
}
function wireVideo(project){
  const root = document.getElementById('demoBody');
  const total = 45 + (hashStr(project.title) % 150);
  let elapsed = 0, playing = false;
  const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const btn = root.querySelector('[data-play]');
  const fill = root.querySelector('[data-fill]');
  const time = root.querySelector('[data-time]');
  btn.addEventListener('click', () => {
    playing = !playing;
    btn.textContent = playing ? '❚❚' : '▶';
    if(playing){
      demoVideoTimer = setInterval(() => {
        elapsed += 1;
        if(elapsed >= total){ elapsed = 0; playing = false; btn.textContent = '▶'; clearInterval(demoVideoTimer); }
        fill.style.width = (elapsed/total*100) + '%';
        time.textContent = fmt(elapsed);
      }, 300);
    } else {
      clearInterval(demoVideoTimer);
    }
  });
}

function extPopupWrap(inner, project, meta){
  return `<div class="ext-body"><div class="ext-popup">${inner}</div></div>`;
}

/* ---- mini playable games (Android/iOS game entries) ---- */
const GAME_SHAPES = ['reflex','memory'];
function gameShapeFor(p){ return GAME_SHAPES[hashStr(p.title + 'g') % GAME_SHAPES.length]; }

function gameHTML(shape, project, meta){
  if(shape === 'reflex'){
    return `<div class="demo-game">${demoHead(project,meta)}
      <div class="demo-game-stats"><span data-score>Score: 0</span><span data-timer>15s</span></div>
      <div class="demo-game-area" data-area>
        <button class="demo-game-target" data-target style="background:${meta.color}"></button>
        <div class="demo-game-over" data-over hidden><div>Game Over</div><div data-finalscore></div><button class="demo-btn-primary" data-replay style="background:${meta.color}">Play again</button></div>
      </div></div>`;
  }
  return `<div class="demo-game">${demoHead(project,meta)}
    <div class="demo-game-stats"><span data-moves>Moves: 0</span><span data-pairs>Pairs: 0/3</span></div>
    <div class="demo-memory-grid" data-grid></div>
    <div class="demo-game-over" data-over hidden style="margin:0 18px 18px; position:relative;"><div>You win! 🎉</div><button class="demo-btn-primary" data-replay style="background:${meta.color}">Play again</button></div>
    </div>`;
}

function wireGame(shape, project, meta){
  const root = document.getElementById('demoBody');
  clearInterval(demoGameTimer);

  if(shape === 'reflex'){
    const area = root.querySelector('[data-area]');
    const target = root.querySelector('[data-target]');
    const scoreEl = root.querySelector('[data-score]');
    const timerEl = root.querySelector('[data-timer]');
    const over = root.querySelector('[data-over]');
    const finalEl = root.querySelector('[data-finalscore]');
    const replay = root.querySelector('[data-replay]');
    let score = 0, timeLeft = 15;

    function moveTarget(){
      const w = area.clientWidth - 42, h = area.clientHeight - 42;
      target.style.left = Math.max(0, Math.random()*w) + 'px';
      target.style.top = Math.max(0, Math.random()*h) + 'px';
    }
    function tick(){
      timeLeft -= 1;
      timerEl.textContent = timeLeft + 's';
      if(timeLeft <= 0){
        clearInterval(demoGameTimer);
        target.style.display = 'none';
        finalEl.textContent = `Final score: ${score}`;
        over.hidden = false;
      }
    }
    function start(){
      score = 0; timeLeft = 15;
      scoreEl.textContent = 'Score: 0';
      timerEl.textContent = '15s';
      over.hidden = true;
      target.style.display = 'block';
      moveTarget();
      clearInterval(demoGameTimer);
      demoGameTimer = setInterval(tick, 1000);
    }
    target.addEventListener('click', () => {
      score += 1;
      scoreEl.textContent = 'Score: ' + score;
      moveTarget();
    });
    replay.addEventListener('click', start);
    start();
  } else {
    const symbols = ['◆','●','▲'];
    let deck = [...symbols, ...symbols].map(s => ({s, matched:false}));
    deck = deck.map(v => [Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(v=>v[1]);
    const grid = root.querySelector('[data-grid]');
    const movesEl = root.querySelector('[data-moves]');
    const pairsEl = root.querySelector('[data-pairs]');
    const over = root.querySelector('[data-over]');
    const replay = root.querySelector('[data-replay]');
    let moves = 0, pairsFound = 0, flipped = [], lock = false;

    function render(){
      grid.innerHTML = '';
      deck.forEach((card, i) => {
        const btn = document.createElement('button');
        btn.className = 'demo-memory-card' + (card.matched ? ' matched' : '');
        btn.textContent = card.matched ? card.s : '';
        btn.dataset.i = i;
        if(!card.matched){
          btn.addEventListener('click', () => onFlip(i, btn));
        }
        grid.appendChild(btn);
      });
    }
    function onFlip(i, btn){
      if(lock || flipped.find(f=>f.i===i) || deck[i].matched) return;
      btn.classList.add('flipped');
      btn.textContent = deck[i].s;
      flipped.push({i, btn});
      if(flipped.length === 2){
        moves += 1;
        movesEl.textContent = 'Moves: ' + moves;
        lock = true;
        const [a,b] = flipped;
        if(deck[a.i].s === deck[b.i].s){
          deck[a.i].matched = true; deck[b.i].matched = true;
          pairsFound += 1;
          pairsEl.textContent = `Pairs: ${pairsFound}/3`;
          flipped = []; lock = false;
          render();
          if(pairsFound === 3){ over.hidden = false; }
        } else {
          setTimeout(() => {
            a.btn.classList.remove('flipped'); a.btn.textContent = '';
            b.btn.classList.remove('flipped'); b.btn.textContent = '';
            flipped = []; lock = false;
          }, 650);
        }
      }
    }
    function start(){
      deck = [...symbols, ...symbols].map(s => ({s, matched:false}));
      deck = deck.map(v => [Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(v=>v[1]);
      moves = 0; pairsFound = 0; flipped = []; lock = false;
      movesEl.textContent = 'Moves: 0';
      pairsEl.textContent = 'Pairs: 0/3';
      over.hidden = true;
      render();
    }
    replay.addEventListener('click', start);
    start();
  }
}

function frameHTML(surface, inner, project, meta){
  const slug = slugFor(project);
  if(surface === 'browser'){
    return `<div class="frame browser-frame">
      <div class="frame-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><div class="frame-url">🔒 ${slug}.demo</div></div>
      <div class="frame-body">${inner}</div>
    </div>`;
  }
  if(surface === 'browser-ext'){
    return `<div class="frame browser-frame">
      <div class="frame-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><div class="frame-url">🔒 example.com</div><div class="frame-ext-icon" style="background:${meta.color}">${project.title.charAt(0)}</div></div>
      ${extPopupWrap(inner, project, meta)}
    </div>`;
  }
  if(surface === 'phone-android' || surface === 'phone-ios'){
    const os = surface === 'phone-ios' ? 'ios' : 'android';
    return `<div class="frame phone-frame ${os}">
      <div class="phone-notch"></div>
      <div class="phone-status"><span>9:41</span><span>••• 100%</span></div>
      <div class="phone-screen">${inner}</div>
      <div class="phone-home"></div>
    </div>`;
  }
  if(surface === 'desktop-mac' || surface === 'desktop-windows'){
    const os = surface === 'desktop-mac' ? 'mac' : 'windows';
    const bar = os === 'mac'
      ? `<span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="desktop-title">${project.title}</span>`
      : `<span class="desktop-title">${project.title}</span><span class="win-controls">–　▢　×</span>`;
    return `<div class="frame desktop-frame ${os}"><div class="desktop-bar">${bar}</div><div class="desktop-body">${inner}</div></div>`;
  }
  return `<div class="frame">${inner}</div>`;
}

function openDemo(project){
  const meta = catMap[project.cat];
  clearInterval(demoVideoTimer);
  clearInterval(demoGameTimer);
  document.getElementById('demoTag').textContent = meta.label;
  document.getElementById('demoTag').style.background = meta.color;
  document.getElementById('demoModalTitle').textContent = project.title;
  const body = document.getElementById('demoBody');
  let surface, inner, wire;

  if(project.cat === 'web'){
    surface = 'browser'; inner = siteHTML(project, meta); wire = wireSite;
  } else if(project.cat === 'video'){
    surface = 'video'; inner = videoHTML(project, meta); wire = () => wireVideo(project);
  } else if(project.cat === 'wordpress'){
    surface = 'browser'; inner = wpAdminHTML(project, meta); wire = wireWpAdmin;
  } else if(['chrome','firefox','safari'].includes(project.cat)){
    surface = 'browser-ext'; const shape = shapeFor(project); inner = shapeHTML(shape, project, meta); wire = () => wireShape(shape);
  } else if(['android','ios'].includes(project.cat)){
    surface = 'phone-' + project.cat; const shape = shapeFor(project); inner = shapeHTML(shape, project, meta); wire = () => wireShape(shape);
  } else if(['androidgames','iosgames'].includes(project.cat)){
    surface = 'phone-' + (project.cat === 'androidgames' ? 'android' : 'ios');
    const gshape = gameShapeFor(project); inner = gameHTML(gshape, project, meta); wire = () => wireGame(gshape, project, meta);
  } else {
    surface = 'desktop-' + (project.cat === 'mac' ? 'mac' : 'windows'); const shape = shapeFor(project); inner = shapeHTML(shape, project, meta); wire = () => wireShape(shape);
  }

  if(surface === 'video'){
    body.innerHTML = videoHTML(project, meta);
  } else {
    body.innerHTML = frameHTML(surface, inner, project, meta);
  }
  wire();
  document.getElementById('demoOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDemo(){
  clearInterval(demoVideoTimer);
  clearInterval(demoGameTimer);
  document.getElementById('demoOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('demoClose').addEventListener('click', closeDemo);
document.getElementById('demoOverlay').addEventListener('click', e => { if(e.target.id === 'demoOverlay') closeDemo(); });
window.addEventListener('keydown', e => { if(e.key === 'Escape') closeDemo(); });
