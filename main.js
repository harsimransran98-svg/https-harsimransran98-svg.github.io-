document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- GSAP setup (must run before first renderProjects() call below) ---------------- */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
gsap.registerPlugin(ScrollTrigger);
let projScrollTriggers = [];
let heroScene = null;
function animateProjectCards(cards){
  projScrollTriggers.forEach(st => st.kill());
  projScrollTriggers = [];
  if(!cards.length) return;
  if(prefersReduced){ gsap.set(cards, {opacity:1, y:0}); return; }
  gsap.set(cards, {opacity:0, y:26});
  projScrollTriggers = ScrollTrigger.batch(cards, {
    start:'top 92%',
    once:true,
    onEnter: batch => gsap.to(batch, {opacity:1, y:0, duration:0.65, ease:'power3.out', stagger:0.08, overwrite:true})
  });
}

/* ---------------- custom cursor (must also run before first renderProjects() call, since renderProjects -> bindCursorTargets references isTouch) ---------------- */
const isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;
if(isTouch){ document.documentElement.classList.add('no-custom-cursor'); }

const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const cursorLabel = document.getElementById('cursorLabel');
let mx=0,my=0, rx=0, ry=0;
if(!isTouch){
  window.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; cursorDot.style.left=mx+'px'; cursorDot.style.top=my+'px'; });
  function cursorLoop(){ rx += (mx-rx)*0.18; ry += (my-ry)*0.18; cursorRing.style.left=rx+'px'; cursorRing.style.top=ry+'px'; requestAnimationFrame(cursorLoop); }
  cursorLoop();
}
function bindCursorTargets(){
  if(isTouch) return;
  document.querySelectorAll('a, button, .proj-card, .craft-card, .chip').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.classList.add('hover');
      cursorLabel.textContent = el.getAttribute('data-cursor-label') || '';
    });
    el.addEventListener('mouseleave', () => { cursorRing.classList.remove('hover'); cursorLabel.textContent=''; });
  });
}

/* ---------------- render: timeline ---------------- */
/* (index.html pre-renders this list statically for no-JS/crawler visibility; clear and rebuild from data.js so JS stays the single source of truth) */
const tlList = document.getElementById('timelineList');
tlList.innerHTML = '';
experience.forEach((e,i) => {
  const div = document.createElement('div');
  div.className = 'tl-item';
  div.innerHTML = `<span class="tl-index mono">0${i+1}</span><span class="tl-date mono">${e.date}</span><div><div class="tl-role">${e.role}</div><div class="tl-desc">${e.desc}</div></div>`;
  tlList.appendChild(div);
});

/* ---------------- render: craft grid ---------------- */
const craftGrid = document.getElementById('craftGrid');
craftGrid.innerHTML = '';
crafts.forEach(c => {
  const meta = catMap[c.key];
  const div = document.createElement('div');
  div.className = 'craft-card';
  div.innerHTML = `<div class="craft-top"><span class="craft-mono mono">${meta.mono}</span><span class="craft-dot" style="background:${meta.color}"></span></div><div><div class="craft-name">${c.name}</div><div class="craft-sub">${c.sub}</div></div>`;
  craftGrid.appendChild(div);
});

/* ---------------- render: services grid ---------------- */
const serviceGrid = document.getElementById('serviceGrid');
serviceGrid.innerHTML = '';
services.forEach((s,i) => {
  const div = document.createElement('div');
  div.className = 'craft-card';
  div.innerHTML = `<div class="craft-top"><span class="craft-mono mono">${String(i+1).padStart(2,'0')}</span><span class="craft-dot" style="background:var(--brass)"></span></div><div><div class="craft-name">${s.title}</div><div class="craft-sub">${s.desc}</div></div>`;
  serviceGrid.appendChild(div);
});

/* ---------------- render: filters ---------------- */
const filterRow = document.getElementById('filterRow');
let activeCat = 'all';
let filterDragMoved = false;
categories.forEach(c => {
  const btn = document.createElement('button');
  btn.className = 'chip' + (c.key==='all' ? ' active' : '');
  btn.dataset.cat = c.key;
  btn.style.setProperty('--chip-color', c.color);
  btn.innerHTML = (c.key!=='all' ? `<span class="cdot" style="background:${c.color}"></span>` : '') + c.label;
  btn.addEventListener('click', () => {
    if(filterDragMoved) return; // ignore the click that ends a real drag gesture
    activeCat = c.key;
    document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    visibleCount = 12;
    renderProjects();
  });
  filterRow.appendChild(btn);
});

/* let a plain vertical mouse wheel scroll this horizontal row, and support click-drag */
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

/* ---------------- render: project grid (paginated) ---------------- */
const projGrid = document.getElementById('projGrid');
const projCount = document.getElementById('projCount');
const loadMoreBtn = document.getElementById('loadMoreBtn');
let visibleCount = 12;

function renderProjects(){
  const filtered = activeCat === 'all' ? projects : projects.filter(p => p.cat === activeCat);
  projCount.textContent = `Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} — ${projects.length} total across the studio`;
  projGrid.innerHTML = '';
  filtered.slice(0, visibleCount).forEach(p => {
    const meta = catMap[p.cat];
    const card = document.createElement('div');
    card.className = 'proj-card';
    card.setAttribute('data-cursor-label','Open');
    card.style.setProperty('--tag-color', meta.color);
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
  loadMoreBtn.hidden = visibleCount >= filtered.length;
  bindCursorTargets();
  animateProjectCards(Array.from(projGrid.children));
}
loadMoreBtn.addEventListener('click', () => { visibleCount += 12; renderProjects(); });
renderProjects();

/* ---------------- hero craft dial cycle ---------------- */
const dialCats = categories.filter(c => c.key !== 'all');
let dialIdx = 0;
const heroSwap = document.getElementById('heroSwap');
const dialCurrent = document.getElementById('dialCurrent');
const dialProgress = document.getElementById('dialProgress');
const eyebrowDot = document.getElementById('eyebrowDot');
const CIRC = 276;

function setDial(i){
  const c = dialCats[i];
  document.documentElement.style.setProperty('--live-accent', c.color);
  heroSwap.textContent = c.label.toLowerCase();
  dialCurrent.textContent = c.label;
  dialCurrent.style.color = c.color;
  const offset = CIRC - (CIRC/dialCats.length)*(i+1);
  dialProgress.style.strokeDashoffset = offset;
  if(heroScene) heroScene.setTint(c.color);
}
setDial(0);
if(!prefersReduced){
  setInterval(() => { dialIdx = (dialIdx+1) % dialCats.length; setDial(dialIdx); }, 2400);
}

/* ---------------- nav scroll state + mobile menu ---------------- */
const siteNav = document.getElementById('siteNav');
window.addEventListener('scroll', () => {
  siteNav.classList.toggle('scrolled', window.scrollY > 40);
});
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');
burgerBtn.addEventListener('click', () => mobileMenu.classList.add('open'));
closeMenu.addEventListener('click', () => mobileMenu.classList.remove('open'));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

/* ---------------- reveal on scroll (GSAP ScrollTrigger, once) ---------------- */
document.querySelectorAll('.reveal').forEach(el => {
  if(prefersReduced){ gsap.set(el, {opacity:1, y:0}); return; }
  gsap.set(el, {opacity:0, y:28});
  ScrollTrigger.create({
    trigger: el, start:'top 88%', once:true,
    onEnter: () => gsap.to(el, {opacity:1, y:0, duration:0.8, ease:'power3.out'})
  });
});

/* ---------------- section-header parallax drift ---------------- */
document.querySelectorAll('.section-head').forEach(el => {
  if(prefersReduced) return;
  gsap.fromTo(el, {y:40}, {
    y:-40, ease:'none',
    scrollTrigger:{ trigger: el, start:'top bottom', end:'bottom top', scrub:true }
  });
});

/* ==================================================================
   Lenis smooth scroll
   ================================================================== */
let lenis = null;
if(!prefersReduced && window.Lenis){
  lenis = new Lenis({ autoRaf:false, smoothWheel:true, duration:1.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* smooth-scroll internal anchor links through Lenis */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if(id.length < 2) return;
    const target = document.querySelector(id);
    if(!target) return;
    e.preventDefault();
    if(lenis){ lenis.scrollTo(target, {offset:-76}); }
    else{ target.scrollIntoView({behavior: prefersReduced ? 'auto' : 'smooth', block:'start'}); }
  });
});

/* ---- shrink any hero headline word that would overflow its mask container ---- */
function fitHeroLines(){
  document.querySelectorAll('.hero h1 .line').forEach(line => {
    const inner = line.querySelector('.line-inner');
    inner.style.fontSize = '';
    const containerWidth = line.clientWidth;
    const textWidth = inner.scrollWidth;
    if(containerWidth > 0 && textWidth > containerWidth){
      const baseSize = parseFloat(getComputedStyle(inner).fontSize);
      inner.style.fontSize = (baseSize * (containerWidth / textWidth) * 0.97) + 'px';
    }
  });
}
window.addEventListener('resize', fitHeroLines);

/* ---- hero intro timeline (deferred until webfonts are ready, so the fit-check above
   measures final text metrics and the intro animation never visibly jumps sizes) ---- */
function startHeroIntro(){
  fitHeroLines();
  if(prefersReduced){
    gsap.set(['.eyebrow', '.hero h1 .line-inner', '.hero-sub', '.hero-bottom'], {opacity:1, y:0, clearProps:'transform'});
  } else {
    gsap.timeline({defaults:{ease:'power3.out'}})
      .from('.eyebrow', {opacity:0, y:16, duration:0.6})
      .from('.hero h1 .line-inner', {yPercent:110, duration:0.85, stagger:0.1}, '-=0.35')
      .from('.hero-sub', {opacity:0, y:18, duration:0.6}, '-=0.4')
      .from('.hero-bottom .dial-wrap', {opacity:0, y:18, duration:0.6}, '-=0.35')
      .from('.hero-bottom .scroll-cue', {opacity:0, y:18, duration:0.6}, '-=0.5');

    /* brief pin-and-dissolve as the user starts scrolling past the hero */
    ScrollTrigger.create({
      trigger:'.hero', start:'top top', end:'+=60%', pin:true, pinSpacing:true, scrub:1
    });
    gsap.to(['.hero-content','.hero-bottom'], {
      opacity:0, y:-40, scale:0.94, ease:'none',
      scrollTrigger:{ trigger:'.hero', start:'top top', end:'+=60%', scrub:1 }
    });
  }
}
if(document.fonts && document.fonts.ready){ document.fonts.ready.then(startHeroIntro); }
else { startHeroIntro(); }

/* one-time binding pass for static elements (nav links, craft/service cards, chips) */
bindCursorTargets();

/* ==================================================================
   hero background: Three.js particle scene (mouse-reactive, tinted by
   the live category accent color from the craft dial)
   ================================================================== */
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
  return new THREE.CanvasTexture(c);
}

function initHeroGL(){
  const canvas = document.getElementById('hero-gl');
  const heroEl = document.querySelector('.hero');
  if(!canvas || !window.THREE) return null;

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
    size: 1.15,
    map: makeDotTexture(),
    color: 0xe7b85c,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
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

  let camX = 0, camY = 0;
  function animate(){
    const nx = (mx / window.innerWidth) - 0.5;
    const ny = (my / window.innerHeight) - 0.5;
    camX += (nx * 6 - camX) * 0.04;
    camY += (-ny * 4 - camY) * 0.04;
    camera.position.x = camX;
    camera.position.y = camY;
    camera.lookAt(0, 0, 0);
    points.rotation.y += 0.0009;
    points.rotation.x += 0.0003;
    renderer.render(scene, camera);
    if(!prefersReduced) requestAnimationFrame(animate);
  }
  animate();

  return {
    setTint(hex){ material.color.set(hex); }
  };
}
heroScene = initHeroGL();
if(heroScene) heroScene.setTint(dialCats[0].color);
