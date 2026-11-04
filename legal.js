/* Bazozo legal pages: reading progress, active table-of-contents link, gear menu.
   No inline scripts; everything here uses textContent / classList only. */
(() => {
  if(window.top !== window.self){ try { window.top.location.replace(window.self.location.href); } catch(e){ document.documentElement.style.display = 'none'; } }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const year = document.getElementById('lgYear');
  if(year) year.textContent = new Date().getFullYear();

  /* gear menu */
  const btn = document.getElementById('lgMenuBtn'), menu = document.getElementById('lgMenu'), label = document.getElementById('lgMenuLabel');
  let open = false;
  const setMenu = o => {
    open = o; btn.setAttribute('aria-expanded', String(o)); btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    label.textContent = o ? 'Close' : 'Menu';
    document.documentElement.classList.toggle('lg-menu-open', o);
    menu.setAttribute('aria-hidden', String(!o));
    if(o) menu.removeAttribute('inert'); else menu.setAttribute('inert', '');
  };
  btn.addEventListener('click', () => setMenu(!open));
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && open){ setMenu(false); btn.focus(); } });

  /* smooth scrolling (Lenis) + reading progress + active section (GSAP ScrollTrigger) */
  let lenis = null;
  if(window.Lenis && window.gsap && !reduced){
    /* drive Lenis from GSAP's ticker (same as the homepage); Lenis 1.1.14 has no autoRaf */
    lenis = new Lenis({ smoothWheel:true, duration:1 });
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('.lg-toc a').forEach(a => a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href')); if(!t) return;
      e.preventDefault(); lenis.scrollTo(t, { offset:-90 }); history.replaceState(null, '', a.getAttribute('href'));
    }));
  }
  const bar = document.getElementById('lgProgress');
  const links = [...document.querySelectorAll('.lg-toc a')];
  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    if(lenis) lenis.on('scroll', ScrollTrigger.update);
    ScrollTrigger.create({ start:0, end:'max', onUpdate: s => { bar.style.transform = `scaleX(${s.progress.toFixed(4)})`; } });
    links.forEach(a => {
      const sec = document.querySelector(a.getAttribute('href'));
      if(sec) ScrollTrigger.create({ trigger:sec, start:'top 40%', end:'bottom 40%', onToggle: s => { if(s.isActive){ links.forEach(l => l.classList.remove('is-active')); a.classList.add('is-active'); } } });
    });
    if(!reduced) gsap.from('.lg-hero > *', { opacity:0, y:18, duration:0.7, stagger:0.08, ease:'power3.out' });
  }
})();
