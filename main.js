document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- Custom Cursor ---------------- */
const isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;
if(isTouch){ document.documentElement.classList.add('no-custom-cursor'); }

const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const cursorLabel = document.getElementById('cursorLabel');
let mx=0, my=0, rx=0, ry=0;

if(!isTouch && cursorDot && cursorRing){
  window.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; cursorDot.style.left=mx+'px'; cursorDot.style.top=my+'px'; });
  function cursorLoop(){ rx += (mx-rx)*0.18; ry += (my-ry)*0.18; cursorRing.style.left=rx+'px'; cursorRing.style.top=ry+'px'; requestAnimationFrame(cursorLoop); }
  cursorLoop();
}

function bindCursorTargets(){
  if(isTouch || !cursorRing) return;
  document.querySelectorAll('a, button, .proj-card, .craft-card, .chip').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.classList.add('hover');
      if(cursorLabel) cursorLabel.textContent = el.getAttribute('data-cursor-label') || '';
    });
    el.addEventListener('mouseleave', () => { 
      cursorRing.classList.remove('hover'); 
      if(cursorLabel) cursorLabel.textContent=''; 
    });
  });
}

/* ---------------- Data Injection (Timeline, Crafts, Services) ---------------- */
const tlList = document.getElementById('timelineList');
if(tlList && typeof experience !== 'undefined') {
  tlList.innerHTML = '';
  experience.forEach((e,i) => {
    tlList.innerHTML += `<div class="tl-item"><span class="tl-index mono">0${i+1}</span><span class="tl-date mono">${e.date}</span><div><div class="tl-role">${e.role}</div><div class="tl-desc">${e.desc}</div></div></div>`;
  });
}

const craftGrid = document.getElementById('craftGrid');
if(craftGrid && typeof crafts !== 'undefined') {
  craftGrid.innerHTML = '';
  crafts.forEach(c => {
    const meta = catMap[c.key];
    craftGrid.innerHTML += `<div class="craft-card"><div class="craft-top"><span class="craft-mono mono">${meta.mono}</span><span class="craft-dot" style="background:${meta.color}"></span></div><div><div class="craft-name">${c.name}</div><div class="craft-sub">${c.sub}</div></div></div>`;
  });
}

const serviceGrid = document.getElementById('serviceGrid');
if(serviceGrid && typeof services !== 'undefined') {
  serviceGrid.innerHTML = '';
  services.forEach((s,i) => {
    serviceGrid.innerHTML += `<div class="craft-card"><div class="craft-top"><span class="craft-mono mono">${String(i+1).padStart(2,'0')}</span><span class="craft-dot" style="background:var(--brass)"></span></div><div><div class="craft-name">${s.title}</div><div class="craft-sub">${s.desc}</div></div></div>`;
  });
}

/* ---------------- Filters ---------------- */
const filterRow = document.getElementById('filterRow');
let activeCat = 'all';
let filterDragMoved = false;

if(filterRow && typeof categories !== 'undefined') {
  categories.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (c.key==='all' ? ' active' : '');
    btn.dataset.cat = c.key;
    btn.style.setProperty('--chip-color', c.color);
    btn.innerHTML = (c.key!=='all' ? `<span class="cdot" style="background:${c.color}"></span>` : '') + c.label;
    btn.addEventListener('click', () => {
      if(filterDragMoved) return; 
      activeCat = c.key;
      document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
      visibleCount = 12;
      renderProjects();
    });
    filterRow.appendChild(btn);
  });

  filterRow.addEventListener('wheel', e => {
    if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
      e.preventDefault();
      filterRow.scrollLeft += e.deltaY;
    }
  }, { passive:false });

  let filterDragging = false, filterDragStartX = 0, filterDragStartScroll = 0;
  filterRow.addEventListener('mousedown', e => {
    filterDragging = true; filterDragMoved = false;
    filterDragStartX = e.clientX; filterDragStartScroll = filterRow.scrollLeft;
  });
  window.addEventListener('mousemove', e => {
    if(!filterDragging) return;
    const dx = e.clientX - filterDragStartX;
    if(Math.abs(dx) > 6) filterDragMoved = true;
    if(filterDragMoved) filterRow.scrollLeft = filterDragStartScroll - dx;
  });
  window.addEventListener('mouseup', () => { filterDragging = false; });
}

/* ---------------- Project Grid ---------------- */
const projGrid = document.getElementById('projGrid');
const projCount = document.getElementById('projCount');
const loadMoreBtn = document.getElementById('loadMoreBtn');
let visibleCount = 12;

function renderProjects(){
  if(!projGrid || typeof projects === 'undefined') return;
  
  const filtered = activeCat === 'all' ? projects : projects.filter(p => p.cat === activeCat);
  if(projCount) projCount.textContent = `Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} — ${projects.length} total across the studio`;
  
  projGrid.innerHTML = '';
  filtered.slice(0, visibleCount).forEach(p => {
    const meta = catMap[p.cat];
    const card = document.createElement('div');
    card.className = 'proj-card';
    card.setAttribute('data-cursor-label','Open');
    card.style.setProperty('--tag-color', meta.color);
    
    // CRITICAL FIX: Force card to be visible instantly, no GSAP opacity: 0 issues
    card.style.opacity = '1';
    card.style.visibility = 'visible';
    card.style.transform = 'none';

    const href = p.cat === 'web' ? `work/${slugFor(p)}.html` : `demo/${p.cat}/${slugFor(p)}.html`;
    const label = p.cat === 'web' ? 'Visit live site' : 'Open live demo';
    card.innerHTML = `
      <div class="proj-top">
        <span class="proj-mono mono">${meta.mono} · ${String(p.idx).padStart(3,'0')}</span>
        <span class="proj-tag" style="--tag-color:${meta.color}">${meta.label}</span>
      </div>
      <div class="proj-title">${p.title}</div>
      <div class="proj-desc">${p.desc}</div>
      <a class="proj-open" href="${href}" target="_blank" rel="noopener">${label}</a>`;
    projGrid.appendChild(card);
  });
  
  if(loadMoreBtn) loadMoreBtn.hidden = visibleCount >= filtered.length;
  bindCursorTargets();
}

if(loadMoreBtn) loadMoreBtn.addEventListener('click', () => { visibleCount += 12; renderProjects(); });
renderProjects();

// CRITICAL FIX: Override any CSS that might be hiding the reveal sections
document.querySelectorAll('.reveal, .section-head, .hero-content, .hero-bottom, .eyebrow').forEach(el => {
  el.style.opacity = '1';
  el.style.visibility = 'visible';
  el.style.transform = 'none';
});

/* ---------------- Hero Dial ---------------- */
let heroScene = null;
const dialCats = typeof categories !== 'undefined' ? categories.filter(c => c.key !== 'all') : [];
let dialIdx = 0;
const heroSwap = document.getElementById('heroSwap');
const dialCurrent = document.getElementById('dialCurrent');
const dialProgress = document.getElementById('dialProgress');
const CIRC = 276;

function setDial(i){
  if(!dialCats.length) return;
  const c = dialCats[i];
  document.documentElement.style.setProperty('--live-accent', c.color);
  if(heroSwap) heroSwap.textContent = c.label.toLowerCase();
  if(dialCurrent) {
    dialCurrent.textContent = c.label;
    dialCurrent.style.color = c.color;
  }
  if(dialProgress){
    const offset = CIRC - (CIRC/dialCats.length)*(i+1);
    dialProgress.style.strokeDashoffset = offset;
  }
  if(heroScene) heroScene.setTint(c.color);
}
setDial(0);
if(dialCats.length > 0){
  setInterval(() => { dialIdx = (dialIdx+1) % dialCats.length; setDial(dialIdx); }, 2400);
}

/* ---------------- Nav & Menu ---------------- */
const siteNav = document.getElementById('siteNav');
if(siteNav){
  window.addEventListener('scroll', () => { siteNav.classList.toggle('scrolled', window.scrollY > 40); }, {passive:true});
}
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');
if(burgerBtn && mobileMenu && closeMenu){
  burgerBtn.addEventListener('click', () => mobileMenu.classList.add('open'));
  closeMenu.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
}

/* ---------------- Lenis Smooth Scroll ---------------- */
let lenis = null;
if(typeof Lenis !== 'undefined'){
  lenis = new Lenis({ autoRaf:true, smoothWheel:true, duration:1.1 });
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if(id.length < 2) return;
    const target = document.querySelector(id);
    if(!target) return;
    e.preventDefault();
    if(lenis){ lenis.scrollTo(target, {offset:-76}); }
    else{ target.scrollIntoView({behavior: 'smooth', block:'start'}); }
  });
});

/* ---------------- Three.js Background ---------------- */
function makeDotTexture(){
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return typeof THREE !== 'undefined' ? new THREE.CanvasTexture(c) : null;
}

function initHeroGL(){
  const canvas = document.getElementById('hero-gl');
  const heroEl = document.querySelector('.hero');
  if(!canvas || typeof THREE === 'undefined') return null;
  
  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 30;
  
  const COUNT = 720;
  const positions = new Float32Array(COUNT * 3);
  for(let i = 0; i < COUNT; i++){
    positions[i*3]   = (Math.random()-0.5) * 80;
    positions[i*3+1] = (Math.random()-0.5) * 50;
    positions[i*3+2] = (Math.random()-0.5) * 40 - 5;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    size: 1.15, map: makeDotTexture(), color: 0xe7b85c,
    transparent: true, opacity: 0.85, sizeAttenuation: true,
    depthWrite: false, blending: typeof THREE !== 'undefined' ? THREE.AdditiveBlending : 2
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  
  function resize(){
    const w = heroEl.clientWidth || window.innerWidth;
    const h = heroEl.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', resize);
  resize();
  
  function animate(){
    const nx = (mx / window.innerWidth) - 0.5;
    const ny = (my / window.innerHeight) - 0.5;
    camera.position.x += (nx * 6 - camera.position.x) * 0.04;
    camera.position.y += (-ny * 4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    points.rotation.y += 0.0009;
    points.rotation.x += 0.0003;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
  
  return { setTint(hex){ material.color.set(hex); } };
}

const s = document.createElement('script');
s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
s.onload = () => {
  heroScene = initHeroGL();
  if(heroScene && dialCats.length > 0) heroScene.setTint(dialCats[dialIdx].color);
};
document.body.appendChild(s);
