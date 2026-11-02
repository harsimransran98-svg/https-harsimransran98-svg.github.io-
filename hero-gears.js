/* ==================================================================
   Hero gear train: scroll-driven rotation (GSAP ScrollTrigger + MotionPath)
   Every gear turns by (driver angle × its ratio), so meshing teeth and
   the roller chain stay locked together at any scroll position.
   ================================================================== */
(() => {
  const svg = document.querySelector('.hero-gears');
  if (!svg || !window.gsap || !window.ScrollTrigger) return;
  if (window.MotionPathPlugin) gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  else gsap.registerPlugin(ScrollTrigger);

  const gears = [...svg.querySelectorAll('.hg-gear')];
  const chainLayers = [...svg.querySelectorAll('[data-base]')];
  const track = svg.querySelector('.hg-chain-track');
  const master = svg.querySelector('.hg-master');
  const chainR = parseFloat(svg.dataset.chainR);
  const chainRatio = parseFloat(svg.dataset.chainRatio);
  const chainLen = parseFloat(svg.dataset.chainLen);
  const pitch = parseFloat(svg.dataset.pitch);
  const masterStart = (pitch * 0.5) / chainLen; // sits on an outer plate

  const pathVars = (start, end) => ({ path: track, align: track, alignOrigin: [0.5, 0.5], autoRotate: true, start, end });
  const parkMaster = () => gsap.set(master, { motionPath: pathVars(masterStart, masterStart) });

  // driver angle of the big gear across the whole hero scroll (negative = counter-clockwise)
  function build(turn, drift) {
    const tl = gsap.timeline({
      defaults: { ease: 'none', duration: 1 },
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });

    gears.forEach(g => {
      tl.to(g, {
        rotation: turn * parseFloat(g.dataset.ratio),
        svgOrigin: `${g.dataset.cx} ${g.dataset.cy}`
      }, 0);
    });

    // chain travel = sprocket pitch radius × sprocket angle (radians)
    const travel = chainR * (turn * chainRatio) * Math.PI / 180;
    chainLayers.forEach(layer => {
      tl.to(layer, { attr: { 'stroke-dashoffset': parseFloat(layer.dataset.base) - travel } }, 0);
    });

    if (master && track && window.MotionPathPlugin) {
      parkMaster();
      tl.to(master, { motionPath: pathVars(masterStart, masterStart + travel / chainLen) }, 0);
    }

    // whole rig drifts up a touch so it feels anchored to the page, not the screen
    tl.to(svg, { yPercent: -drift }, 0);
  }

  const mm = gsap.matchMedia();
  mm.add({
    desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
    mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
    reduced: '(prefers-reduced-motion: reduce)'
  }, ctx => {
    const { desktop, reduced } = ctx.conditions;
    if (reduced) {
      // static, but park the master link on the chain
      if (master && track && window.MotionPathPlugin) parkMaster();
      return;
    }
    gsap.from(".hero-gears-wrap", { opacity: 0, duration: 1.4, delay: 0.5, ease: "power3.out" });
    build(desktop ? -300 : -200, desktop ? 8 : 4);
  });
})();
