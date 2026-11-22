/* Shared driver for the Android / iOS device pages that run a real app in an iframe:
   scales the phone to fit, ticks the status-bar clock, wires brand switching for the
   white-label Academy App, and adds light GSAP motion. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const box = $('#box'), frame = $('#appFrame');
  const device = box && box.firstElementChild;
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* fit the phone: by height on desktop, by width on phones */
  function fit() {
    if (!device) return;
    const W = device.offsetWidth, H = device.offsetHeight;
    const byH = (innerHeight - 110) / H, byW = (Math.min(innerWidth, document.documentElement.clientWidth) - 32) / W;
    const s = innerWidth >= 960 ? Math.min(1, Math.max(.55, byH)) : Math.min(1, byW, Math.max(.6, (innerHeight - 40) / H));
    box.style.setProperty('--s', s.toFixed(4));
  }
  fit(); addEventListener('resize', fit); addEventListener('load', fit);

  /* status-bar clock: Android shows 24h, iOS 12h */
  const isAndroid = location.pathname.includes('/android/');
  const tick = () => { const d = new Date(), m = String(d.getMinutes()).padStart(2, '0'); $$('[data-clock]').forEach(n => { n.textContent = isAndroid ? d.getHours() + ':' + m : (d.getHours() % 12 || 12) + ':' + m; }); };
  tick(); setInterval(tick, 20000);

  /* white-label brand switching (Academy App page only) */
  const chips = $$('.bchip[data-brand]');
  if (chips.length && frame) {
    const base = frame.getAttribute('src').split('?')[0], os = isAndroid ? 'android' : 'ios';
    chips.forEach(c => c.addEventListener('click', () => {
      chips.forEach(x => x.setAttribute('aria-pressed', String(x === c)));
      frame.src = base + '?brand=' + encodeURIComponent(c.dataset.brand) + '&os=' + os;
    }));
    const cz = $('#customize');
    if (cz) cz.addEventListener('click', () => {
      try { frame.contentWindow.academyApp.openCustomizer(); } catch (e) { /* app still loading */ }
    });
  }

  /* motion */
  const g = window.gsap;
  if (!g || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);
  const mm = g.matchMedia();
  mm.add('(min-width: 960px)', () => {
    g.from('.device', { y: 70, rotation: isAndroid ? 3 : -3, opacity: 0, duration: 1.1, ease: 'power3.out', clearProps: 'transform,opacity' });
    g.from('.intro > *', { y: 24, opacity: 0, duration: .7, stagger: .07, ease: 'power3.out', clearProps: 'transform,opacity' });
  });
  mm.add('(max-width: 959px)', () => {
    g.from('.intro > *', { y: 16, opacity: 0, duration: .55, stagger: .05, ease: 'power2.out', clearProps: 'transform,opacity' });
  });
  if (window.Lenis) {
    const lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
    if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
    g.ticker.add(t => lenis.raf(t * 1000)); g.ticker.lagSmoothing(0);
  }
  if (window.ScrollTrigger) g.from('.spec div, .bz-about > *', { y: 20, opacity: 0, duration: .6, stagger: .05, ease: 'power2.out', scrollTrigger: { trigger: '.st-foot', start: 'top 88%' } });
})();
