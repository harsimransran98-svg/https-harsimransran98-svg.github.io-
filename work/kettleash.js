/* Kettle & Ash — live demo build (Bazozo Studio). Cart logic lives in cart.js. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  $('#msiteYear').textContent = new Date().getFullYear();

  /* ---------- nav + elastic burger menu ---------- */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { menu.hidden = false; void menu.offsetWidth; menu.classList.add('open'); }
    else { menu.classList.remove('open'); setTimeout(() => { if (!menu.classList.contains('open')) menu.hidden = true; }, 700); }
  }
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  if (!window.gsap || !window.ScrollTrigger) { $$('.rv').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger);

  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href'); if (id.length < 2) return;
      const t = document.querySelector(id); if (!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset: -70 });
    }));
    // stop page scroll while the cart or checkout is open
    new MutationObserver(() => (document.documentElement.classList.contains('cart-locked') ? lenis.stop() : lenis.start()))
      .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  /* ---------- "fly to cart" dot on every Add to Cart ---------- */
  const countEl = $('#cartCount');
  $$('.shop-card .add-btn').forEach(btn => btn.addEventListener('click', () => {
    if (reduced) return;
    const from = btn.getBoundingClientRect(), to = countEl.getBoundingClientRect();
    const dot = document.createElement('span'); dot.className = 'fly-dot';
    document.body.append(dot);
    const x0 = from.left + from.width / 2, y0 = from.top + from.height / 2;
    const x1 = to.left + to.width / 2, y1 = to.top + to.height / 2;
    gsap.set(dot, { left: x0, top: y0 });
    gsap.timeline({ onComplete: () => dot.remove() })
      .to(dot, { left: x1, duration: .75, ease: 'power1.inOut' }, 0)
      .to(dot, { top: y1, duration: .75, ease: 'back.in(1.6)' }, 0)
      .to(dot, { scale: .4, duration: .75, ease: 'power2.in' }, 0)
      .to('#cartToggle', { scale: 1.08, duration: .15, yoyo: true, repeat: 1, ease: 'power2.out' }, .7);
  }));

  if (finePointer && !reduced) {
    $$('.magnetic').forEach(btn => {
      const xTo = gsap.quickTo(btn, 'x', { duration: .6, ease: 'elastic.out(1, .35)' });
      const yTo = gsap.quickTo(btn, 'y', { duration: .6, ease: 'elastic.out(1, .35)' });
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .3); yTo((e.clientY - r.top - r.height / 2) * .4);
      });
      btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  if (reduced) { gsap.set('.rv', { opacity: 1, y: 0 }); return; }

  /* ---------- hero intro ---------- */
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero h1 .ln > span', { yPercent: 110, duration: 1.2, stagger: .08 })
    .from('.hero-photo .disc', { scale: .6, opacity: 0, duration: 1.4, ease: 'back.out(1.4)' }, .1)
    .from('.badge', { scale: 0, rotate: -120, duration: 1.2, ease: 'back.out(2)' }, .6)
    .from('.float-bag', { y: 160, opacity: 0, duration: 1.4, stagger: .1, ease: 'back.out(1.2)' }, .3)
    .from('.rv-h', { y: 24, opacity: 0, duration: .9, stagger: .1 }, .5);

  /* ---------- floating bag parallax (scroll) + gentle mouse drift ---------- */
  $$('.float-bag').forEach(bag => {
    const speed = parseFloat(bag.dataset.speed);
    gsap.to(bag, { y: () => speed * window.innerHeight, rotate: speed * 40, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1, invalidateOnRefresh: true } });
  });
  if (finePointer) {
    const drift = $$('.float-bag .bob').map(el => ({
      x: gsap.quickTo(el.parentElement, 'x', { duration: 1.2, ease: 'power3.out' }),
      depth: 18 + Math.random() * 30
    }));
    window.addEventListener('pointermove', e => {
      const nx = e.clientX / window.innerWidth - .5;
      drift.forEach(d => d.x(nx * d.depth * -1));
    }, { passive: true });
  }
  gsap.to('#heroImg', { scale: 1.35, rotate: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // subscription bags drift at different speeds
  $$('.sub-par').forEach(bag => {
    gsap.fromTo(bag, { y: () => -parseFloat(bag.dataset.speed) * 300 }, { y: () => parseFloat(bag.dataset.speed) * 300, ease: 'none',
      scrollTrigger: { trigger: '.sub-box', start: 'top bottom', end: 'bottom top', scrub: 1, invalidateOnRefresh: true } });
  });

  // marquee leans with scroll speed
  const marq = $('.marquee');
  const skewTo = gsap.quickTo(marq, 'skewX', { duration: .5, ease: 'power3.out' });
  ScrollTrigger.create({ onUpdate: self => skewTo(gsap.utils.clamp(-12, 12, self.getVelocity() / -300)) });

  ScrollTrigger.batch('.rv', { start: 'top 88%', once: true,
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .08 }) });
})();
