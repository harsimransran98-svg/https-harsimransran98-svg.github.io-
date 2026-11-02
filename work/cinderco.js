/* Cinder & Co — live demo build (Bazozo Studio) */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  $('#year').textContent = new Date().getFullYear();

  /* ---------- nav ---------- */
  const nav = $('#nav'), burger = $('#burger'), drawer = $('#drawer');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setDrawer(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { drawer.hidden = false; void drawer.offsetWidth; drawer.classList.add('open'); }
    else { drawer.classList.remove('open'); setTimeout(() => { if (!drawer.classList.contains('open')) drawer.hidden = true; }, 800); }
  }
  burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) setDrawer(false); });

  /* ---------- before / after slider (native range input = drag, touch and keyboard) ---------- */
  const compare = $('#compare'), range = $('#baRange');
  const setPos = v => { compare.style.setProperty('--pos', v + '%'); range.value = v; };
  range.addEventListener('input', () => setPos(+range.value));
  range.addEventListener('pointerdown', () => compare.classList.add('dragging'));
  window.addEventListener('pointerup', () => compare.classList.remove('dragging'));

  /* ---------- split the statement into words (DOM nodes only, no innerHTML) ---------- */
  const statement = $('#statement');
  function splitWords(node) {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.append(s);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) splitWords(child);
    });
  }
  splitWords(statement);

  if (!window.gsap || !window.ScrollTrigger) { $$('.rv').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger);

  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ duration: 1.25, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = document.querySelector(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: id === '#walkthrough' ? 0 : -60 });
    }));
  }

  if (finePointer && !reduced) {
    $$('.magnetic').forEach(btn => {
      const xTo = gsap.quickTo(btn, 'x', { duration: .6, ease: 'elastic.out(1, .35)' });
      const yTo = gsap.quickTo(btn, 'y', { duration: .6, ease: 'elastic.out(1, .35)' });
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .25); yTo((e.clientY - r.top - r.height / 2) * .35);
      });
      btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  if (reduced) { gsap.set('.rv', { opacity: 1, y: 0 }); return; }

  /* ---------- hero ---------- */
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero h1 .ln > span', { yPercent: 105, duration: 1.3, stagger: .1 })
    .fromTo('#heroArch', { clipPath: 'inset(100% 0 0 0 round 999px 999px 6px 6px)' }, { clipPath: 'inset(0% 0 0 0 round 999px 999px 6px 6px)', duration: 1.6, ease: 'expo.inOut' }, 0)
    .from('#heroArch img', { scale: 1.35, duration: 2, ease: 'expo.out' }, .3)
    .from('.rv-hero, .arch-cap, .stamp', { y: 24, opacity: 0, duration: 1, stagger: .1 }, .6);
  gsap.to('#heroArch img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- statement: words light up as you read ---------- */
  gsap.to('#statement .w', { opacity: 1, stagger: .1, ease: 'none',
    scrollTrigger: { trigger: '.statement', start: 'top 70%', end: 'bottom 60%', scrub: true } });

  /* ---------- horizontal room-by-room walkthrough ---------- */
  const track = $('#track'), rooms = $$('.room[data-room]');
  const roomName = $('#roomName'), roomNum = $('#roomNum');
  const distance = () => track.scrollWidth - window.innerWidth;
  let current = -1;
  const hz = gsap.to(track, {
    x: () => -distance(), ease: 'none',
    scrollTrigger: {
      trigger: '.walk', start: 'top top', end: () => '+=' + distance(),
      pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: self => {
        // which room sits under the middle of the screen?
        const mid = self.progress * distance() + window.innerWidth / 2;
        let idx = -1;
        rooms.forEach((r, i) => { if (mid >= r.offsetLeft) idx = i; });
        if (idx !== current) {
          current = idx;
          roomName.textContent = idx < 0 ? 'Walkthrough' : rooms[idx].dataset.room;
          roomNum.textContent = String(idx + 1).padStart(2, '0') + ' / 05';
        }
      }
    }
  });
  gsap.to('#walkBar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.walk', start: 'top top', end: () => '+=' + distance(), scrub: true, invalidateOnRefresh: true } });

  // parallax + reveals inside the moving track (containerAnimation needs a linear tween, which hz is)
  rooms.forEach(room => {
    gsap.from(room.querySelectorAll('h3, .num, p, .sw'), {
      y: 40, opacity: 0, stagger: .06, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: room, containerAnimation: hz, start: 'left 65%', toggleActions: 'play none none reverse' }
    });
    room.querySelectorAll('.par').forEach((el, i) => {
      gsap.fromTo(el, { x: 70 + i * 30 }, { x: -70 - i * 30, rotate: i % 2 ? 8 : -6, ease: 'none',
        scrollTrigger: { trigger: room, containerAnimation: hz, start: 'left right', end: 'right left', scrub: true } });
    });
    const img = room.querySelector('.par-img');
    if (img) gsap.fromTo(img, { xPercent: -12 }, { xPercent: 0, ease: 'none',
      scrollTrigger: { trigger: room, containerAnimation: hz, start: 'left right', end: 'right left', scrub: true } });
  });

  /* ---------- before/after: show it's draggable with a one-time sweep ---------- */
  const sweep = { v: 50 };
  ScrollTrigger.create({ trigger: compare, start: 'top 70%', once: true, onEnter: () => {
    gsap.timeline({ onUpdate: () => setPos(Math.round(sweep.v * 2) / 2) })
      .to(sweep, { v: 18, duration: .9, ease: 'power2.inOut', delay: .3 })
      .to(sweep, { v: 80, duration: 1.1, ease: 'power2.inOut' })
      .to(sweep, { v: 50, duration: .8, ease: 'power2.out' });
  } });

  /* ---------- process steps ---------- */
  gsap.from('.step', { y: 40, opacity: 0, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.steps', start: 'top 82%' } });
  // terracotta rule draws across the top of each step in turn
  gsap.to('.step', { '--p': 1, duration: 1, stagger: .15, ease: 'power3.inOut', scrollTrigger: { trigger: '.steps', start: 'top 82%' } });

  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .1 }) });
})();
