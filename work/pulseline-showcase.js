/* Pulseline showcase — tilted patient phone + clinic desktop monitor, joined by an ECG line
   that "beats" whenever the two apps sync. Radial menu instead of a hamburger. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DATA_KEY = 'pulseline.demo.v1';
  const PHONE = { w: 414, h: 868 }, MON = { w: 1316, h: 1018 };
  const stage = $('#stage'), phone = $('#phone'), monitor = $('#monitor');
  const phoneFrame = $('#phoneFrame'), deskFrame = $('#deskFrame');
  const ecg = $('#ecg'), track = $('#ecgTrack'), beat = $('#ecgBeat'), chip = $('#ecgChip');
  $('#year').textContent = new Date().getFullYear();
  const clock = () => { const d = new Date(); $('#clock').textContent = (d.getHours() % 12 || 12) + ':' + String(d.getMinutes()).padStart(2, '0'); };
  clock(); setInterval(clock, 20000);

  /* ---------- layout ---------- */
  const desk = matchMedia('(min-width: 1000px)');
  function fit(dev, size, s) {
    dev.querySelector('.scaler').style.width = size.w * s + 'px';
    dev.querySelector('.scaler').style.height = size.h * s + 'px';
    dev.querySelector('.frame').style.zoom = String(s);   // zoom re-lays out at the smaller size: crisp text, unlike transform: scale()
  }
  function layout() {
    if (!desk.matches) { $$('.scaler, .frame').forEach(n => n.removeAttribute('style')); chip.hidden = true; return; }
    const cs = getComputedStyle(stage);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight), padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const gap = parseFloat(cs.columnGap) || 60;
    const availH = Math.max(460, innerHeight - $('.head').offsetHeight - padY - 52);
    const ps = Math.min(1, availH * .92 / PHONE.h);
    const ms = Math.min((stage.clientWidth - padX - PHONE.w * ps - gap) / MON.w, availH / MON.h, 1);
    fit(phone, PHONE, ps); fit(monitor, MON, ms);
    drawEcg();
  }
  let len = 0;
  function drawEcg() {
    const s = stage.getBoundingClientRect(), p = phone.querySelector('.screen').getBoundingClientRect(), m = monitor.querySelector('.screen').getBoundingClientRect();
    ecg.setAttribute('width', s.width); ecg.setAttribute('height', s.height); ecg.style.left = '0'; ecg.style.top = '0';
    const x1 = p.right - s.left + 10, y1 = p.top - s.top + p.height * .5, x2 = m.left - s.left - 8, y2 = m.top - s.top + m.height * .5;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, w = Math.max(30, (x2 - x1) * .12);
    const d = `M${x1},${y1} C${x1 + (mx - x1) * .5},${y1} ${mx - w * 2},${my} ${mx - w},${my} L${mx - w * .5},${my} L${mx - w * .2},${my - 26} L${mx + w * .15},${my + 22} L${mx + w * .45},${my - 10} L${mx + w * .7},${my} L${mx + w},${my} C${mx + w * 2},${my} ${x2 - (x2 - mx) * .5},${y2} ${x2},${y2}`;
    track.setAttribute('d', d); beat.setAttribute('d', d);
    len = beat.getTotalLength();
    beat.style.strokeDasharray = `70 ${len + 80}`; beat.style.strokeDashoffset = String(len + 80);
    chip.hidden = false; chip.style.left = mx + 'px'; chip.style.top = (my - 52) + 'px';
  }
  function pulse(fromPhone, idle) {
    if (!idle) chip.classList.add('flash'); clearTimeout(pulse.t); pulse.t = setTimeout(() => chip.classList.remove('flash'), 1200);
    const g = window.gsap; if (!g || reduced || !len) return;
    g.killTweensOf(beat);
    g.fromTo(beat, { strokeDashoffset: fromPhone ? 70 : -len }, { strokeDashoffset: fromPhone ? -len : 70, duration: 1, ease: 'power1.inOut' });
  }
  addEventListener('storage', e => { if (e.key === DATA_KEY && desk.matches) pulse(document.activeElement === phoneFrame); });

  /* ---------- mobile switch ---------- */
  function show(dev) {
    $$('.switch button').forEach(x => x.setAttribute('aria-selected', String(x.dataset.dev === dev)));
    phone.classList.toggle('on', dev === 'phone'); monitor.classList.toggle('on', dev === 'monitor');
  }
  $$('.switch button').forEach(b => b.addEventListener('click', () => show(b.dataset.dev)));

  /* ---------- radial menu ---------- */
  const radial = $('#radial'), rbtn = $('#rbtn'), items = $$('.ritem'), rscrim = $('#rscrim');
  const R = 124, A0 = 180, A1 = 92;            // fan from left round to straight down, out of the top-right corner
  function setMenu(open) {
    radial.classList.toggle('open', open); rscrim.classList.toggle('on', open);
    rbtn.setAttribute('aria-expanded', String(open)); rbtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    const g = window.gsap;
    items.forEach((it, i) => {
      const a = (A0 + (A1 - A0) * i / (items.length - 1)) * Math.PI / 180;
      const x = Math.cos(a) * R, y = Math.sin(a) * R * .95 + 8;
      it.tabIndex = open ? 0 : -1;
      if (g && !reduced) g.to(it, { x: open ? x : 0, y: open ? y : 0, scale: open ? 1 : .4, opacity: open ? 1 : 0, duration: open ? .55 : .3, delay: open ? i * .05 : (items.length - i) * .03, ease: open ? 'back.out(1.8)' : 'power2.in' });
      else { it.style.transform = open ? `translate(${x}px,${y}px)` : ''; it.style.opacity = open ? '1' : '0'; }
    });
    if (open) setTimeout(() => items[0].focus(), 120);
  }
  items.forEach(it => it.tabIndex = -1);
  rbtn.addEventListener('click', () => setMenu(!radial.classList.contains('open')));
  rscrim.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && radial.classList.contains('open')) { setMenu(false); rbtn.focus(); } });
  let armed = 0;
  items.forEach(it => it.addEventListener('click', e => {
    const go = it.dataset.go; if (!go) return;
    e.preventDefault();
    if (go === 'reset') {
      const lab = it.querySelector('span');
      if (!armed) { armed = setTimeout(() => { armed = 0; lab.textContent = 'Reset demo'; }, 3000); lab.textContent = 'Tap again to reset'; lab.style.opacity = '1'; return; }
      clearTimeout(armed); armed = 0; lab.textContent = 'Reset demo'; lab.style.opacity = '';
      try { Object.keys(localStorage).filter(k => k.startsWith('pulseline.')).forEach(k => localStorage.removeItem(k)); } catch (er) { /* blocked */ }
      deskFrame.addEventListener('load', () => { phoneFrame.src = 'pulseline-app.html?mode=patient&r=' + Date.now(); }, { once: true });
      deskFrame.src = 'pulseline-app.html?mode=clinic&r=' + Date.now();
      setMenu(false); return;
    }
    setMenu(false);
    if (go === 'guide') { $('#guide').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); return; }
    if (!desk.matches) show(go);
    scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    const dev = go === 'phone' ? phone : monitor, g = window.gsap;
    if (g && !reduced && desk.matches) g.fromTo(dev.querySelector('.scaler'), { scale: 1 }, { scale: 1.035, duration: .35, yoyo: true, repeat: 1, ease: 'power2.out' });
  }));

  /* ---------- motion ---------- */
  layout(); addEventListener('resize', layout); addEventListener('load', layout); desk.addEventListener('change', layout);
  const g = window.gsap;
  if (g) {
    if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);
    const mm = g.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (window.Lenis) {
        const lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
        if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
        g.ticker.add(t => lenis.raf(t * 1000)); g.ticker.lagSmoothing(0);
      }
      if (window.ScrollTrigger) {
        g.from('.step', { y: 40, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.steps', start: 'top 85%' } });
        g.from('.bz-about > *', { y: 24, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.bz-about', start: 'top 85%' } });
      }
    });
    mm.add('(min-width: 1000px) and (prefers-reduced-motion: no-preference)', () => {
      g.from('#monitor', { y: 70, opacity: 0, duration: 1.1, ease: 'power3.out', clearProps: 'transform,opacity', onComplete: drawEcg });
      g.from('#phone .scaler', { y: 90, opacity: 0, duration: 1.2, delay: .15, ease: 'power3.out', clearProps: 'transform,opacity', onComplete: drawEcg });
      g.to('.bg-blob.a', { rotation: 18, duration: 14, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      g.to('.bg-blob.b', { rotation: -14, duration: 12, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      const beatIdle = () => { if (!document.hidden) pulse(Math.random() > .5, true); };
      const iv = setInterval(beatIdle, 7000);
      return () => clearInterval(iv);
    });
  }
})();
