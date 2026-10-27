document.getElementById('year').textContent = new Date().getFullYear();

// 1. Safe GSAP & ScrollTrigger Initialization
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// 2. Custom Cursor (Only on non-touch devices)
const isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;
if (isTouch) { document.documentElement.classList.add('no-custom-cursor'); }

const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const cursorLabel = document.getElementById('cursorLabel');
let mx = 0, my = 0, rx = 0, ry = 0;

if (!isTouch && cursorDot && cursorRing) {
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px'; });
  function cursorLoop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px'; requestAnimationFrame(cursorLoop); }
  cursorLoop();
}

function bindCursorTargets() {
  if (isTouch || !cursorRing) return;
  document.querySelectorAll('a, button, .proj-card, .craft-card, .chip').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorRing.classList.add('hover');
      if(cursorLabel) cursorLabel.textContent = el.getAttribute('data-cursor-label') || '';
    });
    el.addEventListener('mouseleave', () => { 
      cursorRing.classList.remove('hover'); 
      if(cursorLabel) cursorLabel.textContent = ''; 
    });
  });
}

// 3. Populate Data (Experience, Crafts, Services)
const tlList = document.getElementById('timelineList');
if(tlList && typeof experience !== 'undefined') {
  tlList.innerHTML = '';
  experience.forEach((e, i) => {
    tlList.innerHTML += `<div class="tl-item"><span class="tl-index mono">0${i + 1}</span><span class="tl-date mono">${e.date}</span><div><div class="tl-role">${e.role}</div><div class="tl-desc">${e.desc}</div></div></div>`;
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
  services.forEach((s, i) => {
    serviceGrid.innerHTML += `<div class="craft-card"><div class="craft-top"><span class="craft-mono mono">${String(i + 1).padStart(2, '0')}</span><span class="craft-dot" style="background:var(--brass)"></span></div><div><div class="craft-name">${s.title}</div><div class="craft-sub">${s.desc}</div></div></div>`;
  });
}

// 4. Project Grid & Filters
const filterRow = document.getElementById('filterRow');
let activeCat = 'all';
let filterDragMoved = false;

if(filterRow && typeof categories !== 'undefined') {
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

  filterRow.addEventListener('wheel', e => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      filterRow.scrollLeft += e.deltaY;
    }
  }, { passive: false });

  let filterDragging = false, filterDragStartX = 0, filterDragStartScroll = 0;
  filterRow.addEventListener('mousedown', e => {
    filterDragging = true; filterDragMoved = false;
    filterDragStartX = e.clientX; filterDragStartScroll = filterRow.scrollLeft;
  });
  window.addEventListener('mousemove', e => {
    if (!filterDragging) return;
    const dx = e.clientX - filterDragStartX;
    if (Math.abs(dx) > 6) filterDragMoved = true;
    if (filterDragMoved) filterRow.scrollLeft = filterDragStartScroll - dx;
  });
  window.addEventListener('mouseup', () => { filterDragging = false; });
}

const projGrid = document.getElementById('projGrid');
const projCount = document.getElementById('projCount');
const loadMoreBtn = document.getElementById('loadMoreBtn');
let visibleCount = 12;

function renderProjects() {
  if(!projGrid || typeof projects === 'undefined') return;
  const filtered = activeCat === 'all' ? projects : projects.filter(p => p.cat === activeCat);
  if(projCount) projCount.textContent = `Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} — ${projects.length} total across the studio`;
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
  
  if(loadMoreBtn) loadMoreBtn.hidden = visibleCount >= filtered.length;
  bindCursorTargets();
  
  // Safely animate newly added project cards
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReduced) {
    const cards = Array.from(projGrid.children);
    gsap.fromTo(cards, 
      { opacity: 0, y: 26 },
      { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', stagger: 0.08, overwrite: true,
        scrollTrigger: { trigger: projGrid, start: 'top 92%', once: true } 
      }
    );
    ScrollTrigger.refresh();
  }
}

if(loadMoreBtn) loadMoreBtn.addEventListener('click', () => { visibleCount += 12; renderProjects(); });

// Initial render
renderProjects();

// 5. Hero Dial
const dialCats = typeof categories !== 'undefined' ? categories.filter(c => c.key !== 'all') : [];
let dialIdx = 0;
const heroSwap = document.getElementById('heroSwap');
const dialCurrent = document.getElementById('dialCurrent');
const dialProgress = document.getElementById('dialProgress');
const eyebrowDot = document.getElementById('eyebrowDot');
const CIRC = 276;

function reserveDialWidths() {
  if (!heroSwap || !dialCurrent || dialCats.length === 0) return;
  const swapProbe = heroSwap.cloneNode(false);
  swapProbe.style.cssText = 'position:absolute; visibility:hidden; white-space:nowrap; display:inline-block; min-width:0;';
  heroSwap.parentNode.insertBefore(swapProbe, heroSwap.nextSibling);
  const curProbe = dialCurrent.cloneNode(false);
  curProbe.style.cssText = 'position:absolute; visibility:hidden; white-space:nowrap; min-width:0;';
  dialCurrent.parentNode.insertBefore(curProbe, dialCurrent.nextSibling);
  let maxSwapW = 0, maxCurW = 0;
  dialCats.forEach(c => {
    swapProbe.textContent = c.label.toLowerCase();
    maxSwapW = Math.max(maxSwapW, swapProbe.getBoundingClientRect().width);
    curProbe.textContent = c.label;
    maxCurW = Math.max(maxCurW, curProbe.getBoundingClientRect().width);
  });
  swapProbe.remove();
  curProbe.remove();
  heroSwap.style.display = 'inline-block';
  heroSwap.style.minWidth = Math.ceil(maxSwapW) + 'px';
  dialCurrent.style.minWidth = Math.ceil(maxCurW) + 'px';
}
reserveDialWidths();
window.addEventListener('resize', reserveDialWidths);

function setDial(i) {
  if(dialCats.length === 0) return;
  const c = dialCats[i];
  document.documentElement.style.setProperty('--live-accent', c.color);
  if(heroSwap) heroSwap.textContent = c.label.toLowerCase();
  if(dialCurrent) {
    dialCurrent.textContent = c.label;
    dialCurrent.style.color = c.color;
  }
  if(dialProgress) {
    const offset = CIRC - (CIRC / dialCats.length) * (i + 1);
    dialProgress.style.strokeDashoffset = offset;
  }
  if (typeof heroScene !== 'undefined' && heroScene) heroScene.setTint(c.color);
}
setDial(0);
if (!prefersReduced && dialCats.length > 0) {
  setInterval(() => { dialIdx = (dialIdx + 1) % dialCats.length; setDial(dialIdx); }, 2400);
}

// 6. Nav & Mobile Menu
const siteNav = document.getElementById('siteNav');
if(siteNav) {
  window.addEventListener('scroll', () => { siteNav.classList.toggle('scrolled', window.scrollY > 40); }, {passive: true});
}
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');
if(burgerBtn && mobileMenu && closeMenu) {
  burgerBtn.addEventListener('click', () => mobileMenu.classList.add('open'));
  closeMenu.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
}

// 7. Bulletproof Animations & ScrollReveal
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || prefersReduced) return;

  // Standard reveals
  document.querySelectorAll('.reveal').forEach(el => {
    gsap.fromTo(el, 
      { opacity: 0, y: 28 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      }
    );
  });

  // Parallax headers
  document.querySelectorAll('.section-head').forEach(el => {
    gsap.fromTo(el, 
      { y: 40 }, 
      { y: -40, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }
    );
  });

  ScrollTrigger.refresh();
}
// Run immediately to catch already-rendered elements
initScrollAnimations();

// 8. Lenis Smooth Scroll
let lenis = null;
if (!prefersReduced && typeof Lenis !== 'undefined') {
  // Safe init for Lenis 1.1+
  lenis = new Lenis({ autoRaf: true, smoothWheel: true, duration: 1.1 });
  if(typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
}

// 9. Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) { lenis.scrollTo(target, { offset: -76 }); }
    else { target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' }); }
  });
});

// 10. Hero Intro Sequence (Fail-Safe)
function fitHeroLines() {
  document.querySelectorAll('.hero h1 .line').forEach(line => {
    const inner = line.querySelector('.line-inner');
    if(!inner) return;
    inner.style.fontSize = '';
    const containerWidth = line.clientWidth;
    const textWidth = inner.scrollWidth;
    if (containerWidth > 0 && textWidth > containerWidth) {
      const baseSize = parseFloat(getComputedStyle(inner).fontSize);
      inner.style.fontSize = (baseSize * (containerWidth / textWidth) * 0.97) + 'px';
    }
  });
}
window.addEventListener('resize', fitHeroLines);

function startHeroIntro() {
  fitHeroLines();
  if (typeof gsap === 'undefined' || prefersReduced) {
    // Fallback: force visibility if GSAP fails
    document.querySelectorAll('.eyebrow, .hero h1 .line-inner, .hero-sub, .hero-bottom').forEach(el => {
      el.style.opacity = 1; el.style.transform = 'none';
    });
    return;
  }
  
  // Force visibility of lines before animating (in case CSS hides them)
  gsap.set('.hero h1 .line-inner', { opacity: 1 });

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .fromTo('.eyebrow', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 })
    .fromTo('.hero h1 .line-inner', { yPercent: 110 }, { yPercent: 0, duration: 0.85, stagger: 0.1 }, '-=0.35')
    .fromTo('.hero-sub', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .fromTo('.hero-bottom .dial-wrap', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.35')
    .fromTo('.hero-bottom .scroll-cue', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.5');

  if(typeof ScrollTrigger !== 'undefined' && document.querySelector('.hero')) {
    ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: '+=60%', pin: true, pinSpacing: true, scrub: 1 });
    gsap.to(['.hero-content', '.hero-bottom'], {
      opacity: 0, y: -40, scale: 0.94, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=60%', scrub: 1 }
    });
    // CRITICAL: Refresh to account for pinning!
    setTimeout(() => ScrollTrigger.refresh(), 100);
  }
}

// Safe font loading fallback (Prevents black screen if fonts hang)
let introStarted = false;
const launchIntro = () => { if(!introStarted) { introStarted = true; startHeroIntro(); }};
if (document.fonts && document.fonts.ready) { 
  document.fonts.ready.then(launchIntro);
  // Failsafe: if fonts take longer than 1.5s, force it anyway
  setTimeout(launchIntro, 1500);
} else { 
  launchIntro(); 
}

// 11. Three.js Hero Canvas
let heroScene = null;
function makeDotTexture() {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  if(typeof THREE !== 'undefined') return new THREE.CanvasTexture(c);
  return null;
}

function initHeroGL() {
  const canvas = document.getElementById('hero-gl');
  const heroEl = document.querySelector('.hero');
  if (!canvas || !window.THREE) return null;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 30;

  const COUNT = 720;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
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

  function resize() {
    const w = heroEl.clientWidth || window.innerWidth;
    const h = heroEl.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', resize);
  resize();

  let camX = 0, camY = 0;
  function animate() {
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
    if (!prefersReduced) requestAnimationFrame(animate);
  }
  animate();

  return {
    setTint(hex) { material.color.set(hex); }
  };
}

function loadHeroGL() {
  if (prefersReduced || window.THREE) return;
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
  s.onload = () => {
    heroScene = initHeroGL();
    if (heroScene && dialCats.length > 0) heroScene.setTint(dialCats[dialIdx].color);
  };
  document.body.appendChild(s);
}

if (!prefersReduced) {
  if ('requestIdleCallback' in window) requestIdleCallback(loadHeroGL, { timeout: 2000 });
  else window.addEventListener('load', loadHeroGL);
}
