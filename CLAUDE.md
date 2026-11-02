# Long-Term Web Development Standards

## 1. Animations, Gears & Scroll Effects
- Always load GSAP (`gsap.min.js`), `ScrollTrigger.min.js`, `MotionPathPlugin.min.js`, and `Lenis` smooth scroll via free official CDNs.
- For mechanical effects (interlocking gears, revolving chains, moving parts): generate clean inline `<svg>` elements and animate them smoothly on scroll using GSAP ScrollTrigger (`scrub: 1`).
- Always make animations responsive using `gsap.matchMedia()` so mobile screens never lag or overflow horizontally.

## 2. Design, Menus, Buttons & Hover Effects
- Never write plain default HTML buttons or menus.
- Always include smooth CSS micro-interactions (magnetic hover, glowing borders, elastic hamburger menu transitions) and clean CSS variables (`--bg`, `--text`, `--accent`) at the top of the stylesheet so color themes can be swapped in 5 seconds.

## 3. Security & Anti-Hacking Rules
- Never hardcode API keys or secret tokens in frontend HTML/JS files.
- Never use unsafe `innerHTML` with user inputs; prevent XSS at all times.
- Always maintain a `_headers` file in the root folder for Cloudflare/Vercel security (Content-Security-Policy, X-Frame-Options, nosniff).
