/* Servd showcase — kitchen tablet + guest phone (overlapping), synced via localStorage. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DATA_KEY = 'servd.demo.v1';
  const PHONE = { w: 414, h: 868 }, TABLET = { w: 1224, h: 864 }, OVERLAP = 22;
  const stage = $('#stage'), phone = $('#phone'), tablet = $('#tablet');
  const phoneFrame = $('#phoneFrame'), tabletFrame = $('#tabletFrame');
  const flyer = $('#flyer'), chip = $('#syncChip');
  $('#year').textContent = new Date().getFullYear();
  const clock = () => { const d = new Date(); $('#clock').textContent = (d.getHours() % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0'); };
  clock(); setInterval(clock, 20000);

  /* ---------- layout ---------- */
  const deskMQ = matchMedia('(min-width: 1000px)');
  function fit(dev, size, scale) {
    dev.querySelector('.scaler').style.width = size.w * scale + 'px';
    dev.querySelector('.scaler').style.height = size.h * scale + 'px';
    dev.querySelector('.frame').style.zoom = String(scale);
  }
  function layout() {
    if (!deskMQ.matches) { $$('.scaler, .frame').forEach(n => n.removeAttribute('style')); phone.style.marginLeft = ''; return; }
    const cs = getComputedStyle(stage);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const availH = Math.max(440, innerHeight - $('.head').offsetHeight - padY - 48);
    const ps = Math.min(1, availH / PHONE.h);
    const availW = stage.clientWidth - padX - (PHONE.w - OVERLAP) * ps;
    const ts = Math.min(availW / TABLET.w, (availH * .86) / TABLET.h, 1);
    fit(phone, PHONE, ps); fit(tablet, TABLET, ts);
    phone.style.marginLeft = -(OVERLAP * ps) + 'px';
  }

  /* ---------- mobile switch ---------- */
  $$('.switch button').forEach(b => b.addEventListener('click', () => {
    $$('.switch button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    phone.classList.toggle('on', b.dataset.dev === 'phone');
    tablet.classList.toggle('on', b.dataset.dev === 'tablet');
    const g = window.gsap; if (g && !reduced) g.from(b.dataset.dev === 'phone' ? phone : tablet, { opacity: 0, y: 16, duration: .4, clearProps: 'all' });
  }));

  /* ---------- sync: flying kitchen ticket ---------- */
  let flashT = 0;
  const countOrders = raw => { try { const d = JSON.parse(raw); return d && Array.isArray(d.orders) ? d : null; } catch (e) { return null; } };
  addEventListener('storage', e => {
    if (e.key !== DATA_KEY || !deskMQ.matches) return;
    chip.classList.add('flash'); clearTimeout(flashT); flashT = setTimeout(() => chip.classList.remove('flash'), 1200);
    const d = countOrders(e.newValue), prev = countOrders(e.oldValue);
    if (!d || !prev || d.orders.length <= prev.orders.length) return;
    const o = d.orders[d.orders.length - 1];
    fly(o, document.activeElement === phoneFrame);
  });
  function fly(o, fromPhone) {
    const g = window.gsap;
    if (!g || reduced || !window.MotionPathPlugin) return;
    const s = stage.getBoundingClientRect(), p = phone.querySelector('.screen').getBoundingClientRect(), t = tablet.querySelector('.screen').getBoundingClientRect();
    $('#flyer b').textContent = 'T' + o.table;
    $('#flyerTxt').textContent = '#' + o.no + ' · ' + o.items.reduce((n, l) => n + l.qty, 0) + ' items';
    const start = fromPhone ? { x: p.left - s.left + p.width * .35, y: p.top - s.top + p.height * .55 } : { x: t.left - s.left - 40, y: t.top - s.top - 60 };
    const end = { x: t.left - s.left + t.width * .07, y: t.top - s.top + t.height * .2 };
    const mid = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 120 };
    g.killTweensOf(flyer);
    g.set(flyer, { x: start.x, y: start.y, opacity: 1, rotation: -8, scale: .7 });
    g.timeline()
      .to(flyer, { duration: 1.1, ease: 'power2.inOut', scale: 1, rotation: 6, motionPath: { path: [start, mid, end], curviness: 1.4 } })
      .to(flyer, { scale: .4, opacity: 0, duration: .3, ease: 'power2.in' });
  }

  /* ---------- reset (click twice) ---------- */
  const resetBtn = $('#resetBtn'), lbl = resetBtn.querySelector('.lbl');
  let armT = 0;
  const disarm = () => { resetBtn.classList.remove('armed'); lbl.textContent = 'Reset demo'; resetBtn.removeAttribute('aria-label'); };
  resetBtn.addEventListener('click', () => {
    if (!resetBtn.classList.contains('armed')) {
      resetBtn.classList.add('armed'); lbl.textContent = 'Click again to reset'; resetBtn.setAttribute('aria-label', 'Click again to reset the demo');
      armT = setTimeout(disarm, 3200); return;
    }
    clearTimeout(armT); disarm();
    try { Object.keys(localStorage).filter(k => k.startsWith('servd.')).forEach(k => localStorage.removeItem(k)); } catch (e) { /* blocked */ }
    tabletFrame.addEventListener('load', () => { phoneFrame.src = 'servd-app.html?mode=guest&r=' + Date.now(); }, { once: true });
    tabletFrame.src = 'servd-app.html?mode=kitchen&r=' + Date.now();
  });

  /* ---------- motion ---------- */
  layout();
  addEventListener('resize', layout);
  addEventListener('load', layout);
  deskMQ.addEventListener('change', layout);
  const g = window.gsap;
  if (g) {
    if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);
    if (window.MotionPathPlugin) g.registerPlugin(window.MotionPathPlugin);
    const mm = g.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (window.Lenis) {
        const lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
        if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
        g.ticker.add(t => lenis.raf(t * 1000)); g.ticker.lagSmoothing(0);
      }
      if (window.ScrollTrigger) {
        g.from('.step', { y: 40, opacity: 0, rotation: 1.5, duration: .8, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.steps', start: 'top 85%' } });
        g.from('.bz-about > *', { y: 24, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.bz-about', start: 'top 85%' } });
      }
    });
    mm.add('(min-width: 1000px) and (prefers-reduced-motion: no-preference)', () => {
      g.from('#tablet', { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', clearProps: 'transform,opacity' });
      g.from('#phone', { y: 90, x: 40, rotation: 4, opacity: 0, duration: 1.2, delay: .2, ease: 'power3.out', clearProps: 'transform,opacity' });
    });
  }
})();
