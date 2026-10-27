document.getElementById('year').textContent = new Date().getFullYear();

/* ==================================================================
   1. DATA INJECTION (Render all content first to establish page height)
   ================================================================== */
const tlList = document.getElementById('timelineList');
if (tlList && typeof experience !== 'undefined') {
  tlList.innerHTML = '';
  experience.forEach((e, i) => {
    tlList.innerHTML += `<div class="tl-item"><span class="tl-index mono">0${i + 1}</span><span class="tl-date mono">${e.date}</span><div><div class="tl-role">${e.role}</div><div class="tl-desc">${e.desc}</div></div></div>`;
  });
}

const craftGrid = document.getElementById('craftGrid');
if (craftGrid && typeof crafts !== 'undefined') {
  craftGrid.innerHTML = '';
  crafts.forEach(c => {
    const meta = catMap[c.key];
    craftGrid.innerHTML += `<div class="craft-card"><div class="craft-top"><span class="craft-mono mono">${meta.mono}</span><span class="craft-dot" style="background:${meta.color}"></span></div><div><div class="craft-name">${c.name}</div><div class="craft-sub">${c.sub}</div></div></div>`;
  });
}

const serviceGrid = document.getElementById('serviceGrid');
if (serviceGrid && typeof services !== 'undefined') {
  serviceGrid.innerHTML = '';
  services.forEach((s, i) => {
    serviceGrid.innerHTML += `<div class="craft-card"><div class="craft-top"><span class="craft-mono mono">${String(i + 1).padStart(2, '0')}</span><span class="craft-dot" style="background:var(--brass)"></span></div><div><div class="craft-name">${s.title}</div><div class="craft-sub">${s.desc}</div></div></div>`;
  });
}

/* --- Project Grid & Filters --- */
let visibleCount = 12;
let activeCat = 'all';

function renderProjects() {
  const projGrid = document.getElementById('projGrid');
  const projCount = document.getElementById('projCount');
  if (!projGrid || typeof projects === 'undefined') return;
  
  const filtered = activeCat === 'all' ? projects : projects.filter(p => p.cat === activeCat);
  if (projCount) projCount.textContent = `Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} — ${projects.length} total across the studio`;
  
  projGrid.innerHTML = '';
  filtered.slice(0, visibleCount).forEach(p => {
    const meta = catMap[p.cat];
    const card = document.createElement('div');
    card.className = 'proj-card';
    card.setAttribute('data-cursor-label', 'Open');
    card.style.setProperty('--tag-color', meta.color);
    const href = p.cat === 'web' ? `work/${slugFor(p)}.html` : `demo/${p.cat}/${slugFor(p)}.html`;
    const label = p.cat === 'web' ? 'Visit live site' : 'Open live demo';
    card.innerHTML = `
      <div class="proj-top">
        <span class="proj-mono mono">${meta.mono} · ${String(p.idx).padStart(3, '0')}</span>
        <span class="proj-tag" style="--tag-color:${meta.color}">${meta.label}</span>
      </div>
      <div class="proj-title">${p.title}</div>
      <div class="proj-desc">${p.desc}</div>
      <a class="proj-open" href="${href}" target="_blank" rel="noopener">${label}</a>`;
    projGrid.appendChild(card);
  });
  
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) loadMoreBtn.hidden = visibleCount >= filtered.length;
  bindCursorTargets();
  
  // Safe animation for newly loaded cards
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.fromTo(Array.from(projGrid.children), 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out', overwrite: true }
    );
    setTimeout(() => ScrollTrigger.refresh(), 100);
  }
}

const filterRow = document.getElementById('filterRow');
if (filterRow && typeof categories !== 'undefined') {
  let filterDragMoved = false;
  categories.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (c.key === 'all' ? ' active' : '');
    btn.dataset.cat = c.key;
    btn.style.setProperty('--chip-color', c.color);
    btn.innerHTML = (c.key !== 'all' ? `<span class="cdot" style="background:${c.color}"></span>` : '') + c.label;
    btn.addEventListener('click', () => {
      if (filterDragMoved) return;
      activeCat = c.key;
      document.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      visibleCount = 12;
      renderProjects();
    });
    filterRow.appendChild(btn);
  });

  let isDown = false;
  let startX, scrollLeft;
  filterRow.addEventListener('mousedown', (e) => {
    isDown = true; filterDragMoved = false;
    startX = e.pageX - filterRow.offsetLeft;
    scrollLeft = filterRow.scrollLeft;
  });
  window.addEventListener('mouseup', () => { isDown = false; });
  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - filterRow.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 5) filterDragMoved = true;
    filterRow.scrollLeft = scrollLeft - walk;
  });
}

const loadMoreBtn = document.getElementById('loadMoreBtn');
if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => { visibleCount += 12; renderProjects(); });
renderProjects();


/* ==================================================================
   2. INTERACTIVITY & UI LOGIC
   ================================================================== */
const isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;
if(isTouch) document.documentElement.classList.add('no-custom-cursor');

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
    el.addEventListener('mouseenter', () => { cursorRing.classList.add('hover'); if(cursorLabel) cursorLabel.textContent = el.getAttribute('data-cursor-label') || ''; });
    el.addEventListener('mouseleave', () => { cursorRing.classList.remove('hover'); if(cursorLabel) cursorLabel.textContent=''; });
  });
}
bindCursorTargets();

/* --- Nav Menu --- */
const siteNav = document.getElementById('siteNav');
if(siteNav) window.addEventListener('scroll', () => { siteNav.classList.toggle('scrolled', window.scrollY > 40); }, {passive:true});

const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');
if(burgerBtn && mobileMenu && closeMenu){
  burgerBtn.addEventListener('click', () => mobileMenu.classList.add('open'));
  closeMenu.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
}

/* --- Hero Dial --- */
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
  if(dialCurrent) { dialCurrent.textContent = c.label; dialCurrent.style.color = c.color; }
  if(dialProgress) dialProgress.style.strokeDashoffset = CIRC - (CIRC/dialCats.length)*(i+1);
  if(heroScene) heroScene.setTint(c.color);
}
setDial(0);
if(dialCats.length > 0) setInterval(() => { dialIdx = (dialIdx+1) % dialCats.length; setDial(dialIdx); }, 2400);


/* ==================================================================
   3. THREE.JS HERO CANVAS
   ================================================================== */
function makeDotTexture(){
  const size = 64; const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d'); const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.4, 'rgba(255,255,255,0.55)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
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
  
  const COUNT = 720; const positions = new Float32Array(COUNT * 3);
  for(let i = 0; i < COUNT; i++){
    positions[i*3] = (Math.random()-0.5) * 80; positions[i*3+1] = (Math.random()-0.5) * 50; positions[i*3+2] = (Math.random()-0.5) * 40 - 5;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    size: 1.15, map: makeDotTexture(), color: 0xe7b85c,
    transparent: true, opacity: 0.85, sizeAttenuation: true, depthWrite: false,
    blending: typeof THREE !== 'undefined' ? THREE.AdditiveBlending : 2
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  
  function resize(){
    const w = heroEl.clientWidth || window.innerWidth; const h = heroEl.clientHeight || window.innerHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', resize);
  resize();
  
  function animate(){
    const nx = (mx / window.innerWidth) - 0.5; const ny = (my / window.innerHeight) - 0.5;
    camera.position.x += (nx * 6 - camera.position.x) * 0.04;
    camera.position.y += (-ny * 4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    points.rotation.y += 0.0009; points.rotation.x += 0.0003;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
  return { setTint(hex){ material.color.set(hex); } };
}

const s = document.createElement('script');
s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
s.onload = () => { heroScene = initHeroGL(); if(heroScene && dialCats.length) heroScene.setTint(dialCats[dialIdx].color); };
document.body.appendChild(s);


/* ==================================================================
   4. ANIMATIONS & SCROLL (Executed on window.onload for absolute safety)
   ================================================================== */
window.addEventListener('load', () => {
  
  // 4a. Initialize Lenis Smooth Scroll
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ autoRaf: true, duration: 1.2 });
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  // Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if(id.length < 2) return;
      const target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      if(lenis) lenis.scrollTo(target, {offset:-76});
      else target.scrollIntoView({behavior: 'smooth', block:'start'});
    });
  });

  // 4b. Initialize GSAP Safely
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // If GSAP failed to load from CDN, force everything visible immediately
    document.querySelectorAll('.eyebrow, .hero h1 .line-inner, .hero-sub, .hero-bottom, .reveal, .section-head, .craft-card').forEach(el => {
      el.style.opacity = 1; el.style.transform = 'none';
    });
    return;
  }
  
  gsap.registerPlugin(ScrollTrigger);

  // Fix Hero text resizing
  function fitHeroLines(){
    document.querySelectorAll('.hero h1 .line').forEach(line => {
      const inner = line.querySelector('.line-inner');
      if(!inner) return;
      inner.style.fontSize = '';
      const containerWidth = line.clientWidth;
      const textWidth = inner.scrollWidth;
      if(containerWidth > 0 && textWidth > containerWidth){
        const baseSize = parseFloat(getComputedStyle(inner).fontSize);
        inner.style.fontSize = (baseSize * (containerWidth / textWidth) * 0.97) + 'px';
      }
    });
  }
  fitHeroLines();
  window.addEventListener('resize', fitHeroLines);

  // Animate Hero Intro
  const heroTl = gsap.timeline({defaults:{ease:'power3.out'}});
  heroTl.fromTo('.eyebrow', {opacity:0, y:16}, {opacity:1, y:0, duration:0.6})
        .fromTo('.hero h1 .line-inner', {yPercent:110}, {yPercent:0, duration:0.85, stagger:0.1}, '-=0.35')
        .fromTo('.hero-sub', {opacity:0, y:18}, {opacity:1, y:0, duration:0.6}, '-=0.4')
        .fromTo('.hero-bottom .dial-wrap', {opacity:0, y:18}, {opacity:1, y:0, duration:0.6}, '-=0.35')
        .fromTo('.hero-bottom .scroll-cue', {opacity:0, y:18}, {opacity:1, y:0, duration:0.6}, '-=0.5');

  // Hero Scroll Fade
  const heroEl = document.querySelector('.hero');
  if(heroEl){
    ScrollTrigger.create({ trigger: heroEl, start:'top top', end:'+=60%', pin:true, pinSpacing:true, scrub:1 });
    gsap.to(['.hero-content','.hero-bottom'], {
      opacity:0, y:-40, scale:0.94, ease:'none',
      scrollTrigger:{ trigger: heroEl, start:'top top', end:'+=60%', scrub:1 }
    });
  }

  // Animate Reveals (Ensuring they start hidden and fade in correctly)
  document.querySelectorAll('.reveal').forEach(el => {
    gsap.fromTo(el, 
      { opacity: 0, y: 35 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
    );
  });

  // Animate Craft & Service Cards
  const cCards = gsap.utils.toArray('.craft-card');
  if(cCards.length > 0) {
    ScrollTrigger.batch(cCards, {
      start: 'top 90%', once: true,
      onEnter: batch => gsap.fromTo(batch, {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', overwrite: true})
    });
  }

  // Tell ScrollTrigger to measure the newly injected page height
  setTimeout(() => ScrollTrigger.refresh(), 100);
});
