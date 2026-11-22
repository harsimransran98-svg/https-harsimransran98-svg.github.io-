/* Lectern showcase — phone (student app) + laptop (dashboard) side by side.
   Both frames load lectern-app.html from the same origin, so they share localStorage
   and update each other through the `storage` event. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DATA_KEY = 'lectern.demo.v1';
  const PHONE = { w: 414, h: 868 }, LAPTOP = { w: 1420, h: 872 };
  const stage = $('#stage'), phone = $('#phone'), laptop = $('#laptop');
  const phoneFrame = $('#phoneFrame'), laptopFrame = $('#laptopFrame');
  const sync = $('#sync'), syncPath = $('#syncPath'), packet = $('#packet'), chip = $('#syncChip');
  $('#year').textContent = new Date().getFullYear();

  /* ---------- status-bar clock ---------- */
  const clock = () => { const d = new Date(); $('#clock').textContent = (d.getHours() % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0'); };
  clock(); setInterval(clock, 20000);

  /* ---------- layout ---------- */
  const deskMQ = matchMedia('(min-width: 1000px)');
  const solo = () => !deskMQ.matches;
  function fit(dev, size, scale) {
    const scaler = dev.querySelector('.scaler'), frame = dev.querySelector('.frame');
    scaler.style.width = size.w * scale + 'px';
    scaler.style.height = size.h * scale + 'px';
    frame.style.transform = `scale(${scale})`;
  }
  function layout() {
    if (solo()) {
      $$('.scaler, .frame').forEach(n => n.removeAttribute('style'));
      chip.hidden = true;
      return;
    }
    const cs = getComputedStyle(stage);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const gap = parseFloat(cs.columnGap) || 40;
    const head = $('.head').offsetHeight;
    const availH = Math.max(420, innerHeight - head - padY - 46);
    const ps = Math.min(1, availH / PHONE.h);
    const availW = stage.clientWidth - padX - PHONE.w * ps - gap;
    const ls = Math.min(availW / LAPTOP.w, (availH - 10) / LAPTOP.h, 1);
    fit(phone, PHONE, ps); fit(laptop, LAPTOP, ls);
    drawSync();
  }
  function drawSync() {
    const s = stage.getBoundingClientRect();
    const p = phone.querySelector('.scaler').getBoundingClientRect();
    const l = laptop.querySelector('.scaler').getBoundingClientRect();
    sync.setAttribute('width', s.width); sync.setAttribute('height', s.height);
    sync.style.left = '0px'; sync.style.top = '0px';
    const x1 = p.right - s.left + 6, y1 = p.top - s.top + p.height * .42;
    const x2 = l.left - s.left + l.width * .035, y2 = l.top - s.top + l.height * .42;
    const mx = (x1 + x2) / 2;
    syncPath.setAttribute('d', `M${x1},${y1} C${mx},${y1 - 40} ${mx},${y2 - 40} ${x2},${y2}`);
    chip.hidden = false;
    chip.style.left = mx + 'px'; chip.style.top = (Math.min(y1, y2) - 34) + 'px';
  }

  /* ---------- mobile: one app at a time ---------- */
  $$('.switch button').forEach(b => b.addEventListener('click', () => {
    $$('.switch button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    phone.classList.toggle('on', b.dataset.dev === 'phone');
    laptop.classList.toggle('on', b.dataset.dev === 'laptop');
    const g = window.gsap;
    if (g && !reduced) g.from(b.dataset.dev === 'phone' ? phone : laptop, { opacity: 0, y: 16, duration: .4, ease: 'power2.out', clearProps: 'all' });
  }));

  /* ---------- sync packet (MotionPath) ---------- */
  let flashT = 0;
  addEventListener('storage', e => {
    if (e.key !== DATA_KEY || solo()) return;
    const fromPhone = document.activeElement === phoneFrame;
    chip.classList.add('flash'); clearTimeout(flashT); flashT = setTimeout(() => chip.classList.remove('flash'), 1100);
    const g = window.gsap;
    if (!g || reduced || !window.MotionPathPlugin) return;
    g.killTweensOf(packet);
    g.set(packet, { opacity: 1 });
    g.to(packet, {
      duration: .9, ease: 'power2.inOut',
      motionPath: { path: syncPath, align: syncPath, alignOrigin: [.5, .5], start: fromPhone ? 0 : 1, end: fromPhone ? 1 : 0 },
      onComplete: () => g.to(packet, { opacity: 0, duration: .25 }),
    });
  });

  /* ---------- reset (click twice) ---------- */
  const resetBtn = $('#resetBtn'), resetLbl = resetBtn.querySelector('.lbl');
  let armT = 0;
  resetBtn.addEventListener('click', () => {
    if (!resetBtn.classList.contains('armed')) {
      resetBtn.classList.add('armed'); resetLbl.textContent = 'Click again to reset';
      resetBtn.setAttribute('aria-label', 'Click again to reset the demo');
      armT = setTimeout(disarm, 3200);
      return;
    }
    clearTimeout(armT); disarm();
    try { Object.keys(localStorage).filter(k => k.startsWith('lectern.')).forEach(k => localStorage.removeItem(k)); } catch (e) { /* storage blocked */ }
    // phone first (it seeds fresh data), then the laptop reads the same data
    phoneFrame.addEventListener('load', () => { laptopFrame.src = 'lectern-app.html?mode=admin'; }, { once: true });
    phoneFrame.src = 'lectern-app.html?mode=student&r=' + Date.now();
  });
  function disarm() { resetBtn.classList.remove('armed'); resetLbl.textContent = 'Reset demo'; resetBtn.removeAttribute('aria-label'); }

  /* ---------- motion ---------- */
  layout();
  addEventListener('resize', layout);
  deskMQ.addEventListener('change', layout);
  addEventListener('load', layout);
  const g = window.gsap;
  if (g) {
    if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);
    if (window.MotionPathPlugin) g.registerPlugin(window.MotionPathPlugin);
    const mm = g.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      g.from('.dev', { y: 50, opacity: 0, duration: 1, stagger: .15, ease: 'power3.out', clearProps: 'transform,opacity' });
      if (window.Lenis) {
        const lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
        if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
        g.ticker.add(t => lenis.raf(t * 1000)); g.ticker.lagSmoothing(0);
      }
      if (window.ScrollTrigger) {
        g.from('.step', { y: 30, opacity: 0, duration: .7, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.steps', start: 'top 85%' } });
        g.from('.bz-about > *', { y: 24, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.bz-about', start: 'top 85%' } });
      }
    });
    // gentle idle float on the phone, desktop only
    mm.add('(min-width: 1000px) and (prefers-reduced-motion: no-preference)', () => {
      g.to('#phone .scaler', { y: -6, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.2 });
    });
  }
})();
