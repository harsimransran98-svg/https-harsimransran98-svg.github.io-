/* ==================================================================
   Bazozo homepage: every interactive behaviour lives here (zero inline
   scripts). Content comes from data.js. Libraries: GSAP + ScrollTrigger
   + Flip + MotionPathPlugin, Lenis smooth scroll, Three.js (lazy).
   ================================================================== */
/* GitHub Pages can't send X-Frame-Options, so refuse to render inside someone else's frame */
if(window.top !== window.self){
  try { window.top.location.replace(window.self.location.href); }
  catch(e){ document.documentElement.style.display = 'none'; }
}
document.getElementById('year').textContent = new Date().getFullYear();

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;
const hasFlip = typeof window.Flip !== 'undefined';
gsap.registerPlugin(ScrollTrigger);
if(hasFlip) gsap.registerPlugin(Flip);
if(window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);

const SVGNS = 'http://www.w3.org/2000/svg';
const dialCats = categories.filter(c => c.key !== 'all');
let heroScene = null;
let lenis = null;

/* ---------------- tiny DOM helpers (text only, never innerHTML) ---------------- */
function mk(tag, cls, text){ const n = document.createElement(tag); if(cls) n.className = cls; if(text != null) n.textContent = text; return n; }
function svgEl(tag, attrs){ const n = document.createElementNS(SVGNS, tag); if(attrs) for(const k in attrs) n.setAttribute(k, attrs[k]); return n; }
const pad = (n, l = 2) => String(n).padStart(l, '0');
function seeded(seed){ let t = (seed * 2654435761) >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
const countFor = cats => projects.filter(p => cats.includes(p.cat)).length;
const comingSoonHref = label => 'coming-soon.html?topic=' + encodeURIComponent(label).replace(/%20/g, '+');
const hrefFor = p => p.url ? p.url : p.cat === 'web' ? `work/${slugFor(p)}.html` : `demo/${p.cat}/${slugFor(p)}.html`;

/* 24px line icons */
const ICONS = {
  web:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18Z M3 12h18 M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9 M12 3c-2.5 2.6-3.8 5.6-3.8 9s1.3 6.4 3.8 9',
  video:'M3 6.5h13v11H3Z M16 10.5l5-3v9l-5-3 M7.5 9.8v4.4l3.6-2.2Z',
  puzzle:'M5 8h3.2a2.3 2.3 0 1 1 4.6 0H16v3.2a2.3 2.3 0 1 1 0 4.6V19h-3.2a2.3 2.3 0 1 0-4.6 0H5v-3.2a2.3 2.3 0 1 0 0-4.6Z',
  compass:'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18Z M15.6 8.4l-2.2 5-5 2.2 2.2-5Z',
  plug:'M9 3v5 M15 3v5 M6.5 8h11v3a5.5 5.5 0 0 1-11 0Z M12 16.5V21',
  phone:'M8 2.5h8a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V4A1.5 1.5 0 0 1 8 2.5Z M10.5 5h3 M11 18.5h2',
  windows:'M4 4h7v7H4Z M13 4h7v7h-7Z M4 13h7v7H4Z M13 13h7v7h-7Z',
  laptop:'M5 5h14v10H5Z M2.5 19h19l-2-4h-15Z',
  pad:'M7 8h10a4 4 0 0 1 4 4v1.2a2.8 2.8 0 0 1-5.1 1.6L14.6 13H9.4l-1.3 1.8A2.8 2.8 0 0 1 3 13.2V12a4 4 0 0 1 4-4Z M7.5 9.8v3.2 M5.9 11.4h3.2 M15.6 11h.01 M17.6 12.6h.01',
  lock:'M7 11V8a5 5 0 0 1 10 0v3 M5.5 11h13v9.5h-13Z'
};
const CAT_ICON = { web:'web', video:'video', chrome:'puzzle', firefox:'puzzle', safari:'compass', wordpress:'plug', android:'phone', ios:'phone', windows:'windows', mac:'laptop', androidgames:'pad', iosgames:'pad' };
function icon(name, cls){
  const s = svgEl('svg', { viewBox:'0 0 24 24', 'aria-hidden':'true', focusable:'false', class: cls || 'ico' });
  s.append(svgEl('path', { d: ICONS[name] }));
  return s;
}

/* ==================================================================
   custom cursor (one delegated listener, so re-rendered cards never
   stack duplicate handlers)
   ================================================================== */
if(isTouch) document.documentElement.classList.add('no-custom-cursor', 'touch');
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const cursorLabel = document.getElementById('cursorLabel');
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
if(!isTouch){
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`; }, { passive:true });
  gsap.ticker.add(() => { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`; });
  let curTarget = null;
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('a, button, [data-cursor-label]');
    if(t === curTarget) return;
    curTarget = t;
    cursorRing.classList.toggle('hover', !!t);
    const lab = t && (t.dataset.cursorLabel || (t.closest('[data-cursor-label]') || {}).dataset?.cursorLabel);
    cursorLabel.textContent = lab || '';
  });
}

/* ==================================================================
   pointer effects: magnetic pull, 3D tilt + radial spotlight
   ================================================================== */
function magnetic(el, strength = 0.32){
  if(isTouch || prefersReduced) return;
  const xTo = gsap.quickTo(el, 'x', { duration:0.7, ease:'elastic.out(1, 0.45)' });
  const yTo = gsap.quickTo(el, 'y', { duration:0.7, ease:'elastic.out(1, 0.45)' });
  el.addEventListener('pointermove', e => {
    if(e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const cx = r.left - gsap.getProperty(el, 'x') + r.width / 2;
    const cy = r.top - gsap.getProperty(el, 'y') + r.height / 2;
    xTo((e.clientX - cx) * strength); yTo((e.clientY - cy) * strength);
  });
  el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
}

/* delegated tilt: the outer element is measured (it never tilts), the inner one tilts.
   --mouse-x / --mouse-y feed the CSS spotlight on the inner element. */
const tiltCache = new WeakMap();
function tiltOf(el){
  let t = tiltCache.get(el);
  if(!t){
    gsap.set(el, { transformPerspective:900, transformOrigin:'50% 50%' });
    t = { rx: gsap.quickTo(el, 'rotationX', { duration:0.6, ease:'power3' }), ry: gsap.quickTo(el, 'rotationY', { duration:0.6, ease:'power3' }) };
    tiltCache.set(el, t);
  }
  return t;
}
function bindTilt(container, outerSel, innerSel, maxDeg, onChange){
  if(!container) return;
  let cur = null;
  const leave = el => {
    if(!el) return;
    el.classList.remove('is-hot');
    if(maxDeg && !prefersReduced){ const t = tiltOf(el); t.rx(0); t.ry(0); }
  };
  container.addEventListener('pointermove', e => {
    if(e.pointerType !== 'mouse') return;
    const outer = e.target.closest(outerSel);
    const inner = outer && (innerSel ? outer.querySelector(innerSel) : outer);
    if(inner !== cur){ leave(cur); cur = inner; if(onChange) onChange(inner, outer); if(inner) inner.classList.add('is-hot'); }
    if(!inner) return;
    const r = outer.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    inner.style.setProperty('--mouse-x', (px * 100).toFixed(1) + '%');
    inner.style.setProperty('--mouse-y', (py * 100).toFixed(1) + '%');
    if(maxDeg && !prefersReduced){ const t = tiltOf(inner); t.ry((px - 0.5) * 2 * maxDeg); t.rx(-(py - 0.5) * 2 * maxDeg); }
  });
  container.addEventListener('pointerleave', () => { leave(cur); cur = null; if(onChange) onChange(null, null); });
}

/* split text into word spans (keeps <strong>, <br>, spans) */
function splitWords(el, wrap){
  const out = [];
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if(n.nodeType === 3){
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if(!t) return;
          if(/^\s+$/.test(t)){ frag.append(document.createTextNode(t)); return; }
          const inner = mk('span', wrap ? 'wi' : 'aw', t);
          if(wrap){ const o = mk('span', 'w'); o.append(inner); frag.append(o); } else frag.append(inner);
          out.push(inner);
        });
        n.replaceWith(frag);
      } else if(n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
  return out;
}

/* 400ms "bracket lock" text scramble for kickers */
function scramble(el){
  const final = el.dataset.final || (el.dataset.final = el.textContent);
  const glyphs = '01X#%&/<>';
  let f = 0; const total = 14;
  const id = setInterval(() => {
    f++;
    el.textContent = [...final].map((ch, i) => (ch === ' ' || i < (f / total) * final.length) ? ch : glyphs[(Math.random() * glyphs.length) | 0]).join('');
    if(f >= total){ clearInterval(id); el.textContent = final; }
  }, 28);
}

/* ==================================================================
   render: timeline (static HTML is the crawler fallback; data.js wins)
   ================================================================== */
const tlList = document.getElementById('timelineList');
tlList.replaceChildren();
experience.forEach((e, i) => {
  const item = mk('div', 'tl-item');
  const body = mk('div');
  body.append(mk('div', 'tl-role', e.role), mk('div', 'tl-desc', e.desc));
  item.append(mk('span', 'tl-index mono', pad(i + 1)), mk('span', 'tl-date mono', e.date), body);
  tlList.append(item);
});

/* ---------------- render: four core pillars ---------------- */
const pillarGrid = document.getElementById('pillarGrid');
pillarGrid.replaceChildren();
pillars.forEach(p => {
  const card = mk('article', 'pillar');
  card.style.setProperty('--pillar', p.color);
  const head = mk('div', 'pillar-head');
  head.append(mk('span', 'pillar-num', p.num), mk('span', 'pillar-count mono'));
  const tags = mk('ul', 'pillar-tags');
  let total = 0;
  p.tags.forEach(t => {
    const li = document.createElement('li');
    let el;
    if(t.cats){
      const n = countFor(t.cats); total += n;
      el = mk('button', 'pillar-tag is-link', t.label);
      el.type = 'button';
      el.append(mk('span', 'pillar-tag-n mono', String(n)));
      el.setAttribute('aria-label', `${t.label}: see ${n} portfolio pieces`);
      el.addEventListener('click', () => showWork(t.cats[0]));
    } else if(t.href){
      el = mk('a', 'pillar-tag is-link', t.label); el.href = t.href;
    } else {
      /* no portfolio category yet: route to the bespoke coming-soon page for this stack */
      el = mk('a', 'pillar-tag is-link is-soon', t.label);
      el.href = comingSoonHref(t.label);
      el.append(mk('span', 'pillar-tag-n mono', 'soon'));
      el.setAttribute('aria-label', `${t.label}: showcase launching soon`);
    }
    li.append(el); tags.append(li);
  });
  head.lastChild.textContent = `${total} pieces`;
  card.append(head, mk('h3', 'pillar-title', p.title), mk('p', 'pillar-blurb', p.blurb), tags, mk('span', 'pillar-spot'));
  pillarGrid.append(card);
});

/* ---------------- render: twelve disciplines (#craftGrid) ---------------- */
const craftGrid = document.getElementById('craftGrid');
dialCats.forEach((c, i) => {
  const total = countFor([c.key]);
  const live = projects.filter(p => p.cat === c.key && p.live).length;
  const card = mk('button', 'disc-card');
  card.type = 'button';
  card.style.setProperty('--c', c.color);
  card.dataset.cursorLabel = 'Filter';
  card.setAttribute('aria-label', `${c.label}: ${total} projects, ${live} live interactive builds. Show them in Selected Work`);
  const inner = mk('span', 'disc-in');
  const top = mk('span', 'disc-top');
  top.append(mk('span', 'disc-n mono', pad(i + 1)), mk('span', 'disc-live mono', `${live}/${total} live`));
  const ic = mk('span', 'disc-icon'); ic.append(icon(CAT_ICON[c.key]));
  const meter = mk('span', 'disc-meter'); const fill = mk('i'); fill.style.setProperty('--p', (live / total).toFixed(3)); meter.append(fill);
  const go = mk('span', 'disc-go mono', `View ${total} builds`); go.append(mk('i', null, '→'));
  inner.append(top, ic, mk('span', 'disc-name', c.label), mk('span', 'disc-blurb', disciplineBlurbs[c.key] || ''), meter, go, mk('span', 'disc-spot'));
  card.append(inner);
  card.addEventListener('click', () => showWork(c.key));
  craftGrid.append(card);
});

/* ---------------- render: services grid ---------------- */
const serviceGrid = document.getElementById('serviceGrid');
serviceGrid.replaceChildren();
services.forEach((s, i) => {
  const card = mk('div', 'craft-card');
  card.append(mk('span', 'svc-up'), mk('span', 'svc-left'));
  const top = mk('div', 'craft-top');
  top.append(mk('span', 'craft-mono mono', pad(i + 1)), mk('span', 'craft-dot'));
  const body = mk('div');
  body.append(mk('div', 'craft-name', s.title), mk('div', 'craft-sub', s.desc));
  card.append(top, body);
  serviceGrid.append(card);
});

/* ==================================================================
   project previews: every card shows the real thing.
   - websites + all 10 app / extension / plugin / game disciplines:
     a real full-page screenshot of the live build (images/preview/),
     framed with its address bar, scrolling top-to-bottom on hover
   - video: the film's own stock clip, 3.6 s loop, plays on hover
   ================================================================== */
function dots(n, cls){ const f = document.createDocumentFragment(); for(let i = 0; i < n; i++) f.append(mk('i', cls)); return f; }
/* bump when screenshots are re-captured so browsers and the CDN fetch the new images */
const PREVIEW_VERSION = '20261104b';
const previewKey = p => p.cat === 'web' ? slugFor(p) : `${p.cat}/${slugFor(p)}`;
const previewLabel = p => p.url ? p.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : p.cat === 'web' ? `bazozo.in/work/${slugFor(p)}` : `bazozo.in/demo/${p.cat}/${slugFor(p)}`;

function pvShot(p){
  const meta = catMap[p.cat];
  const w = mk('div', 'pv pv-web pv-' + p.cat);
  const bar = mk('div', 'pv-bar');
  bar.append(dots(3, 'pv-d'));
  const url = mk('span', 'pv-url mono'); url.append(icon('lock', 'pv-lock'), document.createTextNode(previewLabel(p)));
  const st = mk('span', 'pv-stat mono'); st.append(mk('i', 'pv-pulse'), document.createTextNode(p.client ? 'CLIENT' : p.cat === 'web' ? 'LIVE' : 'DEMO'));
  bar.append(url, st);
  const shot = mk('div', 'pv-shot');
  const key = previewKey(p);
  if(previewShots.has(key)){
    const img = new Image();
    img.alt = `${p.title.replace(/"/g, '')}: ${meta.label.replace(/s$/, '')} preview`;
    img.loading = 'lazy'; img.decoding = 'async'; img.width = 640; img.height = 1000; img.className = 'pv-scroll';
    img.setAttribute('fetchpriority', 'low');
    img.src = `images/preview/${key}.webp?v=${PREVIEW_VERSION}`;
    shot.append(img, mk('span', 'pv-scrollhint mono', 'Hover to scroll ↓'));
  } else {
    const ph = mk('span', 'pv-missing'); ph.append(icon(CAT_ICON[p.cat] || 'web'), mk('b', null, p.title)); shot.append(ph);
  }
  w.append(bar, shot);
  return w;
}

function pvVideo(p, r){
  const w = mk('div', 'pv pv-video');
  w.append(mk('i', 'pv-perf t'), mk('i', 'pv-perf b'));
  const scr = mk('div', 'pv-screen');
  scr.style.setProperty('--gx', Math.round(15 + r() * 60) + '%');
  const clip = videoPreviews[slugFor(p)];
  if(clip){
    const v = document.createElement('video');
    v.className = 'pv-vid'; v.muted = true; v.defaultMuted = true; v.playsInline = true; v.preload = 'none';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true'); v.disablePictureInPicture = true;
    v.dataset.src = 'https://videos.pexels.com/video-files/' + clip;
    scr.append(v);
  }
  scr.append(mk('span', 'pv-grade'), mk('span', 'pv-ghost', p.title.replace(/["“”]/g, '').toUpperCase()));
  const ret = svgEl('svg', { class:'pv-reticle', viewBox:'0 0 64 64', 'aria-hidden':'true' });
  ret.append(svgEl('circle', { class:'pv-r1', cx:32, cy:32, r:27 }), svgEl('circle', { class:'pv-r2', cx:32, cy:32, r:21 }),
    svgEl('path', { class:'pv-r3', d:'M32 1v7M32 56v7M1 32h7M56 32h7' }), svgEl('path', { class:'pv-play', d:'M27 23.5L42 32 27 40.5Z' }));
  const rec = mk('span', 'pv-rec mono'); rec.append(mk('i'), document.createTextNode('REC'));
  scr.append(ret, mk('span', 'pv-fmt mono', '2.39:1 • 60FPS'), rec, mk('span', 'pv-hint mono', 'Hover to play'));
  const deck = mk('div', 'pv-deck');
  deck.append(mk('span', 'pv-tc mono', '00:00:00:00'));
  const wave = mk('div', 'pv-wave');
  for(let i = 0; i < 40; i++){ const b = mk('i'); b.style.setProperty('--s', (0.22 + r() * 0.78).toFixed(2)); b.style.setProperty('--d', (-r() * 1.2).toFixed(2) + 's'); wave.append(b); }
  wave.append(mk('span', 'pv-head'));
  deck.append(wave);
  w.append(scr, deck);
  return w;
}

function buildPreview(p){ return p.cat === 'video' ? pvVideo(p, seeded(p.id + 7)) : pvShot(p); }

/* ---- video previews: lazy source, 3.6 s loop window, hover / in-view playback ---- */
const VID_LEN = 3.6;
function loadVid(v){
  if(v.src || !v.dataset.src) return;
  v.preload = 'metadata';
  v.addEventListener('loadedmetadata', () => { v.dataset.start = Math.min(1, Math.max(0, (v.duration || 4) - VID_LEN - 0.1)).toFixed(2); if(v.paused) v.currentTime = +v.dataset.start; }, { once:true });
  v.addEventListener('timeupdate', () => { const s = +(v.dataset.start || 0); if(v.currentTime > s + VID_LEN || v.currentTime < s - 0.25) v.currentTime = s; });
  v.addEventListener('ended', () => { v.currentTime = +(v.dataset.start || 0); v.play().catch(() => {}); });
  v.addEventListener('playing', () => v.closest('.proj-card')?.classList.add('is-playing'));
  v.addEventListener('pause', () => v.closest('.proj-card')?.classList.remove('is-playing'));
  v.src = v.dataset.src;
}
function playVid(v){ if(!v) return; loadVid(v); const pr = v.play(); if(pr) pr.catch(() => {}); }
function pauseVid(v){ if(v && !v.paused) v.pause(); }

/* only animate / load previews that are on screen; touch screens auto-play the most visible video */
const inView = 'IntersectionObserver' in window
  ? new IntersectionObserver(es => es.forEach(e => {
      const card = e.target, on = e.isIntersecting;
      card.classList.toggle('is-on', on);
      const v = card.querySelector('video.pv-vid');
      if(!v) return;
      if(on) loadVid(v);
      if(isTouch){ if(e.intersectionRatio >= 0.6) hoverCard(card.querySelector('.proj-inner')); else if(v === activeVid) hoverCard(null); else pauseVid(v); }
    }), { rootMargin:'60px', threshold:[0, 0.6] })
  : null;

const cardCache = new Map();
function buildCard(p){
  const meta = catMap[p.cat];
  const card = mk('article', 'proj-card' + (p.live ? ' is-live' : ''));
  card.dataset.flipId = 'p' + p.id;
  card.style.setProperty('--tag-color', meta.color);
  const label = p.client ? 'Visit ' + previewLabel(p) : p.cat === 'web' ? 'Visit live site' : 'Open live demo';
  const a = mk('a', 'proj-inner');
  a.href = hrefFor(p); a.target = '_blank'; a.rel = p.url ? 'noopener noreferrer' : 'noopener';
  a.dataset.cursorLabel = 'Open';
  a.setAttribute('aria-label', `${p.title}, ${meta.label}${p.client ? ', live client site' : p.live ? ', live interactive build' : ''}. ${label}`);
  const body = mk('div', 'proj-body');
  const top = mk('div', 'proj-top');
  top.append(mk('span', 'proj-mono mono', `${meta.mono} · ${pad(p.idx, 3)}`), mk('span', 'proj-tag', meta.label));
  const foot = mk('div', 'proj-foot');
  foot.append(mk('span', 'proj-open mono', label));
  if(p.live){ const b = mk('span', 'proj-live mono'); b.append(mk('i'), document.createTextNode(p.client ? 'Live client site' : 'Live interactive build')); foot.append(b); }
  if(p.client) card.classList.add('is-client');
  body.append(top, mk('h3', 'proj-title', p.title), mk('p', 'proj-desc', p.desc), foot);
  const prev = buildPreview(p); prev.classList.add('proj-preview');
  a.append(prev, body, mk('span', 'proj-spot'));
  card.append(a);
  if(inView) inView.observe(card); else card.classList.add('is-on');
  return card;
}
const cardFor = p => cardCache.get(p.id) || (cardCache.set(p.id, buildCard(p)), cardCache.get(p.id));

/* ---------------- filters ---------------- */
const filterRow = document.getElementById('filterRow');
const projGrid = document.getElementById('projGrid');
const projCount = document.getElementById('projCount');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const PAGE = 12;
let activeCat = 'all';
let visibleCount = PAGE;
let filterDragMoved = false;

categories.forEach(c => {
  const btn = mk('button', 'chip' + (c.key === 'all' ? ' active' : ''));
  btn.type = 'button';
  btn.dataset.cat = c.key;
  btn.setAttribute('aria-pressed', c.key === 'all' ? 'true' : 'false');
  btn.style.setProperty('--chip-color', c.color);
  if(c.key !== 'all'){ const d = mk('span', 'cdot'); d.style.background = c.color; btn.append(d); }
  btn.append(document.createTextNode(c.label), mk('span', 'chip-n', String(c.key === 'all' ? projects.length : countFor([c.key]))));
  btn.addEventListener('click', () => { if(!filterDragMoved) setFilter(c.key); });
  filterRow.append(btn);
});

function setFilter(cat){
  if(cat === activeCat) return;
  activeCat = cat;
  filterRow.querySelectorAll('.chip').forEach(x => { const on = x.dataset.cat === cat; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  const chip = filterRow.querySelector(`.chip[data-cat="${cat}"]`);
  if(chip) filterRow.scrollTo({ left: chip.offsetLeft - filterRow.clientWidth / 2 + chip.offsetWidth / 2, behavior: prefersReduced ? 'auto' : 'smooth' });
  visibleCount = PAGE;
  renderProjects(true);
}

/* wheel + drag scrolling for the chip row */
filterRow.addEventListener('wheel', e => { if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){ e.preventDefault(); filterRow.scrollLeft += e.deltaY; } }, { passive:false });
let filterDragging = false, filterDragStartX = 0, filterDragStartScroll = 0;
filterRow.addEventListener('mousedown', e => { filterDragging = true; filterDragMoved = false; filterDragStartX = e.clientX; filterDragStartScroll = filterRow.scrollLeft; });
window.addEventListener('mousemove', e => {
  if(!filterDragging) return;
  const dx = e.clientX - filterDragStartX;
  if(Math.abs(dx) > 6) filterDragMoved = true;
  if(filterDragMoved) filterRow.scrollLeft = filterDragStartScroll - dx;
});
window.addEventListener('mouseup', () => { filterDragging = false; setTimeout(() => { filterDragMoved = false; }, 0); });

/* ---------------- project grid: Flip on filter, batched 3D entrance on scroll ---------------- */
let projBatch = [];
function killProjBatch(){ projBatch.forEach(st => st.kill()); projBatch = []; }
function entrance(cards){
  if(!cards.length) return;
  if(prefersReduced){ gsap.set(cards, { opacity:1, clearProps:'transform' }); return; }
  const desk = window.matchMedia('(min-width: 768px)').matches;
  gsap.set(cards, desk ? { opacity:0, y:70, rotationX:-16, transformPerspective:1100, transformOrigin:'50% 0%' } : { opacity:0, y:36 });
  projBatch.push(...ScrollTrigger.batch(cards, {
    start:'top 94%', once:true,
    onEnter: b => gsap.to(b, { opacity:1, y:0, rotationX:0, duration:0.9, ease:'power3.out', stagger:0.08, overwrite:true })
  }));
}
function updateCount(filtered){
  const label = (activeCat === 'all' ? 'all disciplines' : catMap[activeCat].label) + (query ? ` · “${query}”` : '');
  const live = filtered.filter(p => p.live).length;
  projCount.textContent = `Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} · ${label} · ${live} live interactive builds · ${projects.length} total across the studio`;
}
/* instant search: title, description, discipline and stack keywords */
const STACK_WORDS = {
  web:'website web e-commerce ecommerce store landing gsap webgl scroll seo brand',
  video:'video film motion edit brand trailer reel gsap stock cinema',
  chrome:'chrome extension browser manifest v3 toolbar productivity',
  firefox:'firefox add-on extension browser privacy webextensions',
  safari:'safari extension macos ios apple browser',
  wordpress:'wordpress plugin woocommerce php cms admin dashboard',
  android:'android app mobile kotlin material',
  ios:'ios iphone app mobile swift apple',
  windows:'windows desktop app utility pc',
  mac:'mac macos desktop app menu bar utility apple',
  androidgames:'android game mobile arcade puzzle casual',
  iosgames:'ios iphone game mobile arcade puzzle casual'
};
const searchIndex = new Map(projects.map(p => [p.id, `${p.title} ${p.desc} ${catMap[p.cat].label} ${STACK_WORDS[p.cat] || ''}`.toLowerCase()]));
let query = '';
function getFiltered(){
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return projects.filter(p => (activeCat === 'all' || p.cat === activeCat) && terms.every(t => searchIndex.get(p.id).includes(t)));
}
const projSearch = document.getElementById('projSearch');
const projEmpty = mk('p', 'proj-empty mono');
let searchTimer = 0;
if(projSearch){
  projSearch.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { query = projSearch.value.trim().slice(0, 60); visibleCount = PAGE; renderProjects(true); }, 120);
  });
  projSearch.addEventListener('keydown', e => { if(e.key === 'Escape'){ projSearch.value = ''; query = ''; renderProjects(true); } });
  document.addEventListener('keydown', e => {
    if(e.key === '/' && !e.metaKey && !e.ctrlKey && !/input|textarea|select/i.test(document.activeElement.tagName)){ e.preventDefault(); projSearch.focus(); }
  });
}

function renderProjects(useFlip){
  const filtered = getFiltered();
  projEmpty.textContent = query ? `No builds match “${query}”${activeCat !== 'all' ? ' in ' + catMap[activeCat].label : ''}. Try “shop”, “timer”, “privacy” or “racer”.` : 'Nothing here yet.';
  projEmpty.hidden = filtered.length > 0;
  if(!projEmpty.isConnected) projGrid.after(projEmpty);
  const cards = filtered.slice(0, visibleCount).map(cardFor);
  updateCount(filtered);
  loadMoreBtn.hidden = visibleCount >= filtered.length;
  const flip = useFlip && hasFlip && !prefersReduced && projGrid.querySelector('.proj-card:not(.proj-static)');
  if(flip){
    const old = [...projGrid.querySelectorAll('.proj-card')];
    killProjBatch();
    if(old.length){ gsap.killTweensOf(old); gsap.set(old, { opacity:1, y:0, rotationX:0 }); }
    const state = Flip.getState(old);
    const fresh = cards.filter(c => !old.includes(c));
    projGrid.replaceChildren(...cards);
    if(cards.length) gsap.set(cards, { opacity:1, y:0, rotationX:0 });
    if(!cards.length){ ScrollTrigger.refresh(); return; }
    Flip.from(state, {
      targets: cards, duration:0.75, ease:'power3.inOut', scale:true, stagger:0.015, absolute:false,
      onEnter: () => fresh.length && gsap.fromTo(fresh, { opacity:0, scale:0.86, y:40 }, { opacity:1, scale:1, y:0, duration:0.65, ease:'power3.out', stagger:0.045 }),
      onComplete: () => { gsap.set(cards, { clearProps:'scale' }); ScrollTrigger.refresh(); }
    });
  } else {
    killProjBatch();
    projGrid.replaceChildren(...cards);
    entrance(cards);
    ScrollTrigger.refresh();
  }
}
loadMoreBtn.addEventListener('click', () => {
  const filtered = getFiltered();
  const before = visibleCount;
  visibleCount += PAGE;
  const add = filtered.slice(before, visibleCount).map(cardFor);
  projGrid.append(...add);
  updateCount(filtered);
  loadMoreBtn.hidden = visibleCount >= filtered.length;
  entrance(add);
  ScrollTrigger.refresh();
});
renderProjects(false);

/* jump from a pillar tag or discipline card to the portfolio, pre-filtered */
function showWork(cat){
  setFilter(cat);
  const work = document.getElementById('work');
  if(!work) return;
  if(lenis) lenis.scrollTo(work, { offset:-80, duration:1.4 });
  else work.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block:'start' });
}

/* tilt + spotlight: project cards, discipline cards, services, pillars */
let activeTC = null, activeVid = null, tcStart = 0;
function hoverCard(inner){
  const v = inner ? inner.querySelector('video.pv-vid') : null;
  if(activeVid && activeVid !== v) pauseVid(activeVid);
  activeVid = v; if(v) playVid(v);
  activeTC = inner ? inner.querySelector('.pv-tc') : null; tcStart = performance.now();
}
bindTilt(projGrid, '.proj-card', '.proj-inner', isTouch ? 0 : 7, inner => { if(!isTouch) hoverCard(inner); });
projGrid.addEventListener('focusin', e => { const i = e.target.closest('.proj-inner'); if(i) hoverCard(i); });
projGrid.addEventListener('focusout', () => hoverCard(null));
bindTilt(craftGrid, '.disc-card', '.disc-in', isTouch ? 0 : 9);
bindTilt(serviceGrid, '.craft-card', null, 0);
bindTilt(pillarGrid, '.pillar', null, 0);
gsap.ticker.add(() => {
  if(!activeTC) return;
  const f = activeVid && !activeVid.paused ? Math.floor((activeVid.currentTime - (+activeVid.dataset.start || 0)) * 60) : Math.floor((performance.now() - tcStart) / (1000 / 60));
  const t = `00:${pad(Math.floor(f / 3600) % 60)}:${pad(Math.floor(f / 60) % 60)}:${pad(f % 60)}`;
  if(activeTC.textContent !== t) activeTC.textContent = t;
});

/* ==================================================================
   hero craft dial
   ================================================================== */
let dialIdx = 0;
const heroSwap = document.getElementById('heroSwap');
const dialCurrent = document.getElementById('dialCurrent');
const dialProgress = document.getElementById('dialProgress');
const CIRC = 276;
function reserveDialWidths(){
  if(!heroSwap || !dialCurrent) return;
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
  swapProbe.remove(); curProbe.remove();
  const wide = window.matchMedia('(min-width: 700px)').matches;
  heroSwap.style.display = wide ? 'inline-block' : 'inline';
  heroSwap.style.minWidth = wide ? Math.min(Math.ceil(maxSwapW), heroSwap.parentNode.clientWidth) + 'px' : '';
  dialCurrent.style.minWidth = Math.ceil(maxCurW) + 'px';
}
reserveDialWidths();
window.addEventListener('resize', reserveDialWidths);
function setDial(i){
  const c = dialCats[i];
  document.documentElement.style.setProperty('--live-accent', c.color);
  heroSwap.textContent = c.label.toLowerCase();
  dialCurrent.textContent = c.label;
  dialCurrent.style.color = c.color;
  dialProgress.style.strokeDashoffset = CIRC - (CIRC / dialCats.length) * (i + 1);
  if(heroScene) heroScene.setTint(c.color);
}
setDial(0);
if(!prefersReduced) setInterval(() => { dialIdx = (dialIdx + 1) % dialCats.length; setDial(dialIdx); }, 2400);

/* ==================================================================
   header: floating pill, hide-on-scroll-down, progress hairline,
   gear-toggle index drawer (signature hamburger #4)
   ================================================================== */
const siteNav = document.getElementById('siteNav');
const navProgress = document.getElementById('navProgress');
const burgerBtn = document.getElementById('burgerBtn');
const burgerLabel = document.getElementById('burgerLabel');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;
function setMenu(open){
  menuOpen = open;
  burgerBtn.setAttribute('aria-expanded', String(open));
  burgerBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  burgerLabel.textContent = open ? 'Close' : 'Index';
  document.documentElement.classList.toggle('menu-open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  if(open){ mobileMenu.removeAttribute('inert'); siteNav.classList.remove('nav-hidden'); }
  else mobileMenu.setAttribute('inert', '');
  if(lenis){ open ? lenis.stop() : lenis.start(); }
  if(open){ const first = mobileMenu.querySelector('a'); if(first) setTimeout(() => first.focus({ preventScroll:true }), 380); }
}
burgerBtn.addEventListener('click', () => setMenu(!menuOpen));
document.addEventListener('keydown', e => { if(e.key === 'Escape' && menuOpen){ setMenu(false); burgerBtn.focus(); } });
window.matchMedia('(min-width: 861px)').addEventListener('change', e => { if(e.matches && menuOpen) setMenu(false); });

/* plain scroll listener (Lenis drives native scroll), so ScrollTrigger refreshes never reset it */
let lastNavY = window.scrollY;
function updateNav(){
  const y = window.scrollY, max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  siteNav.classList.toggle('scrolled', y > 40);
  if(!menuOpen && Math.abs(y - lastNavY) > 4) siteNav.classList.toggle('nav-hidden', y > lastNavY && y > innerHeight * 0.9);
  lastNavY = y;
  navProgress.style.transform = `scaleX(${Math.min(1, y / max).toFixed(4)})`;
}
window.addEventListener('scroll', updateNav, { passive:true });
updateNav();
document.querySelectorAll('.mag').forEach(el => magnetic(el, el.classList.contains('beam-btn') ? 0.38 : 0.28));

/* ==================================================================
   Lenis smooth scroll + anchor links
   ================================================================== */
if(!prefersReduced && window.Lenis){
  lenis = new Lenis({ autoRaf:false, smoothWheel:true, duration:1.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if(id.length < 2) return;
    const target = document.querySelector(id);
    if(!target) return;
    e.preventDefault();
    if(menuOpen) setMenu(false);
    if(lenis) lenis.scrollTo(target, { offset:-80 });
    else target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block:'start' });
  });
});

/* ==================================================================
   gear + chain drivetrain divider (generated SVG, scrubbed to scroll).
   Every gear angle is derived from one number, chain travel s, so the
   teeth and the roller chain stay meshed at every scroll position.
   ================================================================== */
function gearPath(cx, cy, r, n, phase, o = {}){
  const step = 2 * Math.PI / n, m = 2 * r / n, ro = r + m * (o.add ?? 0.95), ri = r - m * (o.ded ?? 1.15);
  const P = (R, a) => (cx + R * Math.cos(a)).toFixed(2) + ' ' + (cy + R * Math.sin(a)).toFixed(2);
  let d = '';
  for(let i = 0; i < n; i++){
    const a = phase + i * step;
    [[ri, a - step * 0.5], [ri, a - step * 0.29], [ro, a - step * 0.15], [ro, a + step * 0.15], [ri, a + step * 0.29]]
      .forEach(([R, A], k) => { d += (i === 0 && k === 0 ? 'M' : 'L') + P(R, A); });
  }
  d += 'Z';
  const hole = (hx, hy, hr) => `M${(hx + hr).toFixed(2)} ${hy.toFixed(2)}A${hr.toFixed(2)} ${hr.toFixed(2)} 0 1 0 ${(hx - hr).toFixed(2)} ${hy.toFixed(2)}A${hr.toFixed(2)} ${hr.toFixed(2)} 0 1 0 ${(hx + hr).toFixed(2)} ${hy.toFixed(2)}Z`;
  d += hole(cx, cy, o.hub ?? r * 0.16);
  for(let k = 0; k < (o.spokes || 0); k++){ const a = phase + k * 2 * Math.PI / o.spokes; d += hole(cx + Math.cos(a) * r * 0.56, cy + Math.sin(a) * r * 0.56, r * 0.17); }
  return d;
}

function buildDrivetrain(){
  const svg = document.getElementById('gdSvg');
  if(!svg) return null;
  const pitch = 2 * Math.PI * 70 / 22;              // chain pitch = sprocket tooth pitch
  const rad = n => n * pitch / (2 * Math.PI);
  const cy = 150, rS = rad(22), Ls = 44 * pitch;     // straight run = 44 links
  const xA = 305, xB = xA + Ls;
  const L = 2 * Ls + 2 * Math.PI * rS;              // 110 links total
  const step = n => 2 * Math.PI / n;

  /* gear table. k = radians turned per px of chain travel */
  const G = [];
  const A = { id:'A', cx:xA, cy, n:22, r:rS, phase:-Math.PI / 2 + step(22) / 2, k:1 / rS, cls:'gd-sprocket', o:{ add:0.7, ded:0.9, spokes:5 } };
  const B = { id:'B', cx:xB, cy, n:22, r:rS, phase:-Math.PI / 2 + step(22) / 2, k:1 / rS, cls:'gd-sprocket', o:{ add:0.7, ded:0.9, spokes:5 } };
  G.push(A, B);
  function mesh(parent, n, dir, extra){
    const r = rad(n), sp = step(parent.n), sc = step(n);
    const delta = (((dir - parent.phase) % sp) + sp) % sp;
    const g = { n, r, cx: parent.cx + Math.cos(dir) * (parent.r + r), cy: parent.cy + Math.sin(dir) * (parent.r + r),
      phase: dir + Math.PI + delta * parent.r / r + sc / 2, k: -parent.k * parent.r / r, cls:'gd-gear', o: extra || {} };
    G.push(g); return g;
  }
  const gL = mesh(A, 18, Math.PI, { spokes:5 });
  mesh(gL, 10, Math.PI * 0.72, { hub:3.4 });
  const gR = mesh(B, 28, 0, { spokes:6 });
  mesh(gR, 12, -Math.PI * 0.24, { hub:3.6 });

  const g = (cls) => svgEl('g', cls ? { class: cls } : null);
  const back = g('gd-back'), front = g('gd-front');
  svg.append(svgEl('rect', { class:'gd-bed', x:0, y:0, width:1600, height:300 }), back, front);

  /* dotted pitch circles + centre label inside the chain loop */
  G.forEach(t => back.append(svgEl('circle', { class:'gd-pitch', cx:t.cx.toFixed(2), cy:t.cy.toFixed(2), r:t.r.toFixed(2) })));
  const label = svgEl('text', { class:'gd-label', x:((xA + xB) / 2).toFixed(1), y:cy + 5, 'text-anchor':'middle' });
  label.textContent = 'TWELVE DISCIPLINES  ·  ONE DRIVETRAIN';
  back.append(svgEl('path', { class:'gd-axis', d:`M${xA} ${cy}H${xB}` }), label);

  const gearEls = G.map(t => {
    const p = svgEl('path', { class:'gd-g ' + t.cls, 'fill-rule':'evenodd', d: gearPath(t.cx, t.cy, t.r, t.n, t.phase, t.o) });
    (t.cls === 'gd-sprocket' ? front : back).append(p);
    return p;
  });
  G.forEach(t => (t.cls === 'gd-sprocket' ? front : back).append(svgEl('circle', { class:'gd-axle', cx:t.cx.toFixed(2), cy:t.cy.toFixed(2), r:4 })));

  /* roller chain: clockwise stadium path around both sprockets */
  const top = cy - rS, bot = cy + rS;
  const d = `M${xA} ${top}L${xB} ${top}A${rS} ${rS} 0 0 1 ${xB} ${bot}L${xA} ${bot}A${rS} ${rS} 0 0 1 ${xA} ${top}Z`;
  const chain = [
    { cls:'gd-c-outer', dash:`${(pitch * 1.3).toFixed(3)} ${(pitch * 0.7).toFixed(3)}`, base: pitch * 0.15 },
    { cls:'gd-c-inner', dash:`${(pitch * 1.05).toFixed(3)} ${(pitch * 0.95).toFixed(3)}`, base: -pitch * 0.975 },
    { cls:'gd-c-roll', dash:`0.01 ${(pitch - 0.01).toFixed(3)}`, base: 0 }
  ].map(c => { const p = svgEl('path', { class:c.cls, d, 'stroke-dasharray':c.dash, 'stroke-dashoffset':c.base.toFixed(3) }); front.append(p); return { el:p, base:c.base }; });

  /* twelve coloured links, one per discipline, riding the chain */
  const along = u => {
    u = ((u % L) + L) % L;
    if(u < Ls) return [xA + u, top, 0];
    u -= Ls; if(u < Math.PI * rS){ const t = -Math.PI / 2 + u / rS; return [xB + rS * Math.cos(t), cy + rS * Math.sin(t), t + Math.PI / 2]; }
    u -= Math.PI * rS; if(u < Ls) return [xB - u, bot, Math.PI];
    u -= Ls; const t = Math.PI / 2 + u / rS; return [xA + rS * Math.cos(t), cy + rS * Math.sin(t), t + Math.PI / 2];
  };
  const tags = dialCats.map((c, i) => {
    const el = svgEl('g', { class:'gd-tag' });
    el.append(svgEl('rect', { x:-15, y:-7.5, width:30, height:15, rx:7.5, fill:c.color }), svgEl('circle', { cx:0, cy:0, r:2.6, class:'gd-tag-pin' }));
    front.append(el);
    return { el, u0: (Math.round(i * 110 / 12) + 0.5) * pitch };
  });

  let lastS = null;
  function set(s){
    if(s === lastS) return; lastS = s;
    G.forEach((t, i) => gearEls[i].setAttribute('transform', `rotate(${(t.k * s * 180 / Math.PI).toFixed(3)} ${t.cx.toFixed(2)} ${t.cy.toFixed(2)})`));
    chain.forEach(c => c.el.setAttribute('stroke-dashoffset', (c.base - s).toFixed(3)));
    tags.forEach(t => { const [x, y, a] = along(t.u0 + s); t.el.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(a * 180 / Math.PI).toFixed(2)})`); });
  }
  set(0);
  return { set, rS };
}
const drivetrain = buildDrivetrain();

/* ==================================================================
   scroll choreography (responsive via gsap.matchMedia)
   ================================================================== */
const sectionTitles = [...document.querySelectorAll('section:not(.hero) .section-title, .contact-title')];
const titleWords = sectionTitles.map(t => splitWords(t, true));
const aboutWords = [...document.querySelectorAll('.about-copy p')].flatMap(p => splitWords(p, false));
const kickers = [...document.querySelectorAll('section:not(.hero) .kicker')].filter(k => k.style.visibility !== 'hidden');

const mm = gsap.matchMedia();
mm.add({
  desktop:'(min-width: 768px) and (prefers-reduced-motion: no-preference)',
  mobile:'(max-width: 767px) and (prefers-reduced-motion: no-preference)',
  reduced:'(prefers-reduced-motion: reduce)'
}, ctx => {
  const { desktop, reduced } = ctx.conditions;
  let meterFn = null;
  const spineFill = document.getElementById('tlSpineFill');
  const spineSvg = document.getElementById('tlSpine');
  const tlHead = document.getElementById('tlHead');
  const tlWrap = document.getElementById('tlWrap');
  const sizeSpine = () => {
    const h = Math.max(1, tlWrap.offsetHeight);
    spineSvg.setAttribute('viewBox', `0 0 8 ${h}`);
    spineSvg.querySelectorAll('path').forEach(p => p.setAttribute('d', `M4 0V${h}`));
    spineFill.setAttribute('stroke-dasharray', h);
    return h;
  };

  if(reduced){
    gsap.set('.reveal', { opacity:1, y:0 });
    sizeSpine(); spineFill.setAttribute('stroke-dashoffset', 0); gsap.set(tlHead, { opacity:0 });
    document.querySelectorAll('.tl-item').forEach(i => i.classList.add('is-lit'));
    return;
  }

  /* generic reveal-once */
  document.querySelectorAll('.reveal').forEach(el => {
    gsap.fromTo(el, { opacity:0, y:28 }, { opacity:1, y:0, duration:0.85, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 88%', once:true } });
  });

  /* hero: brief pin-and-dissolve (created first so later triggers measure the pin spacer) */
  ScrollTrigger.create({ trigger:'.hero', start:'top top', end:'+=60%', pin:true, pinSpacing:true, scrub:1, refreshPriority:10 });
  gsap.to(['.hero-content', '.hero-bottom'], { opacity:0, y:-40, scale:0.94, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'+=60%', scrub:1 } });

  /* drivetrain: chain travel + opposing marquees, scrub:1 */
  if(drivetrain){
    const svg = document.getElementById('gdSvg');
    svg.setAttribute('viewBox', desktop ? '0 0 1600 300' : '40 0 760 300');
    const travel = desktop ? 2400 : 1500;
    const proxy = { s:0 };
    let prevS = 0, rpm = 0;
    const rpmEl = document.getElementById('gdRpm'), travelEl = document.getElementById('gdTravel');
    gsap.to(proxy, {
      s: travel, ease:'none',
      scrollTrigger:{ trigger:'#gearDivider', start:'top bottom', end:'bottom top', scrub:1 },
      onUpdate: () => drivetrain.set(proxy.s)
    });
    const meter = () => {
      const ds = Math.abs(proxy.s - prevS); prevS = proxy.s;
      const inst = ds * 60 / (2 * Math.PI * drivetrain.rS) * 60;      // px/frame -> sprocket rpm
      rpm += (inst - rpm) * 0.12;
      const r = pad(Math.round(rpm), 3), t = pad(Math.round(proxy.s * 0.8), 4);
      if(rpmEl.textContent !== r) rpmEl.textContent = r;
      if(travelEl.textContent !== t) travelEl.textContent = t;
    };
    gsap.ticker.add(meter);
    gsap.fromTo('#gdTrack1', { xPercent:0 }, { xPercent:-25, ease:'none', scrollTrigger:{ trigger:'#gearDivider', start:'top bottom', end:'bottom top', scrub:1 } });
    gsap.fromTo('#gdTrack2', { xPercent:-25 }, { xPercent:0, ease:'none', scrollTrigger:{ trigger:'#gearDivider', start:'top bottom', end:'bottom top', scrub:1 } });
    gsap.from('.gd-rig', { scale:0.92, opacity:0.2, ease:'none', scrollTrigger:{ trigger:'#gearDivider', start:'top bottom', end:'top 45%', scrub:1 } });
    meterFn = meter;
  }

  /* kinetic section titles: per-word mask rise */
  titleWords.forEach((words, i) => {
    gsap.from(words, { yPercent:110, rotation:desktop ? 4 : 0, duration:0.9, ease:'power4.out', stagger:0.06,
      scrollTrigger:{ trigger:sectionTitles[i], start:'top 86%', once:true } });
  });
  kickers.forEach(k => ScrollTrigger.create({ trigger:k, start:'top 90%', once:true, onEnter:() => scramble(k) }));

  /* section-head parallax drift (desktop only) */
  if(desktop){
    document.querySelectorAll('.section-head').forEach(el => {
      gsap.fromTo(el, { y:40 }, { y:-40, ease:'none', scrollTrigger:{ trigger:el, start:'top bottom', end:'bottom top', scrub:true } });
    });
  }

  /* about: monogram parallax + word-by-word ink-in */
  gsap.fromTo('.monogram', { yPercent:18, rotationX:desktop ? 35 : 0, letterSpacing:'0.12em', transformPerspective:800 },
    { yPercent:-10, rotationX:0, letterSpacing:'-0.02em', ease:'none', scrollTrigger:{ trigger:'#about', start:'top bottom', end:'bottom 30%', scrub:1 } });
  if(aboutWords.length){
    gsap.fromTo(aboutWords, { opacity:0.14 }, { opacity:1, ease:'none', stagger:0.04,
      scrollTrigger:{ trigger:'.about-copy', start:'top 82%', end:'bottom 52%', scrub:1 } });
  }
  gsap.from('.fact-list > div', { opacity:0, y:26, duration:0.7, ease:'power3.out', stagger:0.08, scrollTrigger:{ trigger:'.fact-list', start:'top 90%', once:true } });

  /* timeline: SVG spine draws with scroll, nodes light as it passes */
  const spine = { p:0 };
  let H = sizeSpine();
  const onRefreshInit = () => { H = sizeSpine(); };
  ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
  gsap.to(spine, { p:1, ease:'none',
    scrollTrigger:{ trigger:tlWrap, start:'top 70%', end:'bottom 55%', scrub:1 },
    onUpdate: () => {
      spineFill.setAttribute('stroke-dashoffset', (H * (1 - spine.p)).toFixed(1));
      tlHead.style.transform = `translateY(${(H * spine.p).toFixed(1)}px)`;
    }
  });
  spineFill.setAttribute('stroke-dashoffset', H);
  document.querySelectorAll('.tl-item').forEach(item => {
    ScrollTrigger.create({ trigger:item, start:'top 62%', end:'bottom 62%', toggleClass:{ targets:item, className:'is-lit' }, onLeave:() => item.classList.add('is-lit') });
  });

  /* pillars: staggered 3D rise */
  gsap.from('.pillar', { opacity:0, y:80, rotationX:desktop ? -22 : 0, transformPerspective:1000, transformOrigin:'50% 100%', duration:1, ease:'power3.out', stagger:0.12,
    scrollTrigger:{ trigger:'#pillarGrid', start:'top 85%', once:true } });

  /* twelve disciplines: staggered 3D flip-in from the grid's top-left */
  gsap.from('.disc-card', { opacity:0, y:desktop ? 90 : 40, z:desktop ? -160 : 0, rotationX:desktop ? -70 : 0, transformPerspective:1200, transformOrigin:'50% 0%',
    duration:1.05, ease:'power3.out', stagger:{ each:0.06, grid:'auto', from:'start' },
    scrollTrigger:{ trigger:'#craftGrid', start:'top 88%', once:true } });


  /* contact: giant outline marquee scrubbed sideways */
  gsap.fromTo('#contactMarquee', { xPercent:0 }, { xPercent:-30, ease:'none', scrollTrigger:{ trigger:'#contact', start:'top bottom', end:'bottom top', scrub:1 } });
  gsap.from('.contact-item', { opacity:0, y:30, duration:0.7, ease:'power3.out', stagger:0.08, scrollTrigger:{ trigger:'.contact-row', start:'top 92%', once:true } });

  return () => { if(meterFn) gsap.ticker.remove(meterFn); ScrollTrigger.removeEventListener('refreshInit', onRefreshInit); };
});

/* ==================================================================
   services: rows rise and wire themselves into the row above.
   Reversible (scrub), so scrolling back up disconnects them again.
   Rebuilt per column count, because rows change with the grid.
   ================================================================== */
function serviceRows(){
  const rows = []; let lastTop = null;
  [...serviceGrid.children].forEach(c => {
    c.classList.remove('has-up', 'has-left');
    if(c.offsetTop !== lastTop){ rows.push([]); lastTop = c.offsetTop; }
    rows[rows.length - 1].push(c);
  });
  rows.forEach((row, ri) => row.forEach((c, ci) => { if(ri) c.classList.add('has-up'); if(ci) c.classList.add('has-left'); }));
  return rows;
}
gsap.matchMedia().add({
  wide:'(min-width: 901px)', mid:'(min-width: 481px) and (max-width: 900px)', narrow:'(max-width: 480px)',
  reduced:'(prefers-reduced-motion: reduce)'
}, ctx => {
  const rows = serviceRows();
  if(ctx.conditions.reduced){ gsap.set('#serviceGrid .svc-up', { scaleY:1 }); gsap.set('#serviceGrid .svc-left', { scaleX:1 }); return; }
  rows.forEach(row => {
    const ups = row.map(c => c.querySelector('.svc-up')), lefts = row.map(c => c.querySelector('.svc-left'));
    gsap.timeline({ scrollTrigger:{ trigger:row[0], start:'top 98%', end:'top 62%', scrub:0.6 } })
      .fromTo(row, { y:65, opacity:0, scale:0.94 }, { y:0, opacity:1, scale:1, duration:1, ease:'power2.out', stagger:0.08 })
      .fromTo(lefts, { scaleX:0 }, { scaleX:1, duration:0.5, ease:'none', stagger:0.08 }, '-=0.45')
      .fromTo(ups, { scaleY:0 }, { scaleY:1, duration:0.6, ease:'none', stagger:0.08 }, '<');
  });
});

/* ==================================================================
   contact scope selector: pre-fills the email + WhatsApp briefs
   ================================================================== */
const scopePills = document.getElementById('scopePills');
const contactMail = document.getElementById('contactMail');
const contactWa = document.getElementById('contactWa');
const scopeNote = document.getElementById('scopeNote');
if(scopePills && contactMail && contactWa){
  const pills = contactScopes.map((sc, i) => {
    const b = mk('button', 'scope-pill', sc.label);
    b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', 'false'); b.tabIndex = i === 0 ? 0 : -1;
    b.addEventListener('click', () => setScope(i));
    b.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if(!d) return; e.preventDefault(); const n = (i + d + pills.length) % pills.length; setScope(n); pills[n].focus();
    });
    scopePills.append(b); return b;
  });
  function setScope(i){
    const sc = contactScopes[i];
    pills.forEach((b, k) => { b.setAttribute('aria-checked', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
    const msg = `Hi Bazozo, I'd like to talk about ${sc.line}.`;
    contactMail.href = `mailto:hello@bazozo.in?subject=${encodeURIComponent('Project enquiry: ' + sc.label)}&body=${encodeURIComponent(msg + '\n\nWhat it should do:\nTimeline:\nBudget range:\n')}`;
    contactWa.href = `https://wa.me/917347500770?text=${encodeURIComponent(msg)}`;
    scopeNote.textContent = `Scope set to ${sc.label}. Email and WhatsApp now open with this brief pre-filled.`;
    if(!prefersReduced) gsap.fromTo([contactMail, contactWa], { color:'#e7b85c' }, { color:'#f4f2ec', duration:1.2, ease:'power2.out', clearProps:'color' });
  }
}

/* ---- shrink any hero headline word that would overflow its mask ---- */
function fitHeroLines(){
  document.querySelectorAll('.hero h1 .line').forEach(line => {
    const inner = line.querySelector('.line-inner');
    inner.style.fontSize = '';
    const cw = line.clientWidth, tw = inner.scrollWidth;
    if(cw > 0 && tw > cw){ inner.style.fontSize = (parseFloat(getComputedStyle(inner).fontSize) * (cw / tw) * 0.97) + 'px'; }
  });
}
window.addEventListener('resize', fitHeroLines);

/* ---- hero intro (after webfonts, so the fit-check measures final metrics) ---- */
function startHeroIntro(){
  fitHeroLines();
  if(prefersReduced){
    gsap.set(['.eyebrow', '.hero h1 .line-inner', '.hero-sub', '.hero-bottom'], { opacity:1, y:0, clearProps:'transform' });
  } else {
    gsap.timeline({ defaults:{ ease:'power3.out' } })
      .from('.eyebrow', { opacity:0, y:16, duration:0.6 })
      .from('.hero h1 .line-inner', { yPercent:110, duration:0.85, stagger:0.1 }, '-=0.35')
      .from('.hero-sub', { opacity:0, y:18, duration:0.6 }, '-=0.4')
      .from('.hero-bottom .dial-wrap', { opacity:0, y:18, duration:0.6 }, '-=0.35')
      .from('.hero-bottom .scroll-cue', { opacity:0, y:18, duration:0.6 }, '-=0.5')
      .from('.nav-pill', { opacity:0, y:-24, duration:0.7 }, 0.1);
  }
  ScrollTrigger.refresh();
}
if(document.fonts && document.fonts.ready) document.fonts.ready.then(startHeroIntro);
else startHeroIntro();

/* ==================================================================
   hero background: Three.js particle field (lazy, tinted by the dial)
   ================================================================== */
function makeDotTexture(){
  const size = 64, c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.4, 'rgba(255,255,255,0.55)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
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
  const COUNT = 720, positions = new Float32Array(COUNT * 3);
  for(let i = 0; i < COUNT; i++){ positions[i * 3] = (Math.random() - 0.5) * 80; positions[i * 3 + 1] = (Math.random() - 0.5) * 50; positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5; }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ size:1.15, map:makeDotTexture(), color:0xe7b85c, transparent:true, opacity:0.85, sizeAttenuation:true, depthWrite:false, blending:THREE.AdditiveBlending });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  function resize(){ const w = heroEl.clientWidth || innerWidth, h = heroEl.clientHeight || innerHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); }
  window.addEventListener('resize', resize); resize();
  let camX = 0, camY = 0, heroVisible = true;
  ScrollTrigger.create({ trigger:heroEl, start:'top bottom', end:'bottom top', onToggle: self => { heroVisible = self.isActive; } });
  function animate(){
    if(heroVisible){
      const nx = (mx / innerWidth) - 0.5, ny = (my / innerHeight) - 0.5;
      camX += (nx * 6 - camX) * 0.04; camY += (-ny * 4 - camY) * 0.04;
      camera.position.x = camX; camera.position.y = camY; camera.lookAt(0, 0, 0);
      points.rotation.y += 0.0009; points.rotation.x += 0.0003;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  }
  animate();
  return { setTint(hex){ material.color.set(hex); } };
}
function loadHeroGL(){
  const saveData = navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || ''));
  if(prefersReduced || window.THREE || isTouch || saveData || window.innerWidth < 900) return;
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
  s.integrity = 'sha512-334uBDwY0iZ2TklV1OtDtBW9vp7jjP7SWRzT7Ehu1fdtPIjTpCwTSFb8HI/YBau9L1/kRBEOALrS229Kry4yFQ==';
  s.crossOrigin = 'anonymous';
  s.onload = () => { heroScene = initHeroGL(); if(heroScene) heroScene.setTint(dialCats[dialIdx].color); };
  document.body.appendChild(s);
}
if(!prefersReduced){
  if('requestIdleCallback' in window) requestIdleCallback(loadHeroGL, { timeout:2000 });
  else window.addEventListener('load', loadHeroGL);
}
