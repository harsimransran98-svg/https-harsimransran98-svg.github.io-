/* ==================================================================
   LIVE DEMO ENGINE — High-Fidelity Authentic Simulators
   ================================================================== */
function hashStr(s){ let h=0; for(let i=0;i<s.length;i++){ h=(h*31 + s.charCodeAt(i))|0; } return Math.abs(h); }

function demoHead(project, meta){
  return `<div class="demo-head"><div class="demo-icon" style="background:${meta.color}">${project.title.replace(/[^A-Za-z]/g,'').charAt(0) || 'B'}</div><div><div class="demo-title">${project.title}</div><div class="demo-sub">${project.desc}</div></div></div>`;
}

// --- 1. Browser Extension Simulator ---
function renderExtensionDemo(project, meta) {
  return `
    <div class="frame browser-frame">
      <div class="frame-bar">
        <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
        <div class="frame-url">🔒 client-site.com</div>
        <div class="frame-ext-icon" style="background:${meta.color}">${project.title.charAt(0)}</div>
      </div>
      <div class="ext-body">
        <div class="ext-popup" style="border: 1px solid #333; border-radius: 8px; padding: 16px; margin: 20px auto; max-width: 320px; background: #111;">
          ${demoHead(project, meta)}
          <div class="ext-metric-box" style="margin: 20px 0; padding: 12px; background: #1a1a1a; border-radius: 6px; text-align: center;">
            <span style="display: block; font-size: 24px; font-weight: 700; color: ${meta.color};">Active</span>
            <span style="font-size: 11px; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px;">Status</span>
          </div>
          <button class="demo-btn-primary" style="background:${meta.color}; width: 100%;">Run ${project.title}</button>
        </div>
      </div>
    </div>
  `;
}

// --- 2. Video Editing Simulator ---
function renderVideoDemo(project, meta) {
  return `
    <div class="demo-video">
      <div class="demo-video-screen" style="background:linear-gradient(135deg, ${meta.color}33, #050506); border-radius: 8px 8px 0 0;">
        <div class="demo-video-title">${project.title}</div>
        <div style="position: absolute; top: 12px; right: 12px; font-size: 10px; background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 4px; font-family: monospace;">4K ProRes</div>
        <button class="demo-play" data-play style="border-color:${meta.color}">▶</button>
      </div>
      <div class="demo-video-controls" style="border-radius: 0;">
        <div class="demo-progress-track"><div class="demo-progress-fill" data-fill style="background:${meta.color}"></div></div>
        <span class="demo-time mono" data-time>0:00</span>
      </div>
      <div class="timeline-editor-mock" style="background: #0a0a0c; padding: 12px; border-radius: 0 0 8px 8px; border: 1px solid #222; border-top: none;">
        <div style="display: flex; align-items: center; margin-bottom: 6px; font-size: 10px; color: #666;">
          <span style="width: 30px;">V1</span>
          <div style="height: 16px; width: 85%; background: ${meta.color}88; border-radius: 3px; border: 1px solid ${meta.color}"></div>
        </div>
        <div style="display: flex; align-items: center; font-size: 10px; color: #666;">
          <span style="width: 30px;">A1</span>
          <div style="height: 16px; width: 85%; background: #333; border-radius: 3px; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 40%; left: 0; right: 0; height: 20%; background: #555;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- 3. Native Mobile Simulator ---
function renderMobileDemo(project, meta, os) {
  const h = hashStr(project.title);
  const isIOS = os === 'ios';
  return `
    <div class="frame phone-frame ${isIOS ? 'ios' : 'android'}">
      ${isIOS ? '<div class="phone-notch"></div>' : ''}
      <div class="phone-status"><span>9:41</span><span>••• 100%</span></div>
      <div class="phone-screen native-layout" style="display: flex; flex-direction: column; padding: 20px;">
        ${demoHead(project, meta)}
        <div class="native-card" style="background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <div class="native-stat" style="color:${meta.color}; font-size: 32px; font-weight: 700; font-family: 'Unbounded', sans-serif;">${(h%400)+40}</div>
          <div class="native-label" style="font-size: 12px; opacity: 0.6; margin-top: 4px;">Today's Activity</div>
        </div>
        <div style="flex-grow: 1;"></div>
        <button class="demo-btn-primary" style="background:${meta.color}; border-radius: ${isIOS ? '20px' : '8px'};">Launch Action</button>
      </div>
      ${isIOS ? '<div class="phone-home"></div>' : ''}
    </div>
  `;
}

// --- 4. Web / Desktop / WordPress Simulator ---
function renderWebDemo(project, meta) {
  return `
    <div class="frame browser-frame">
      <div class="frame-bar">
        <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
        <div class="frame-url">🔒 bazozo.in/demo</div>
      </div>
      <div class="frame-body" style="padding: 40px 20px;">
        ${demoHead(project, meta)}
        <div style="margin: 30px 0; padding: 20px; border: 1px dashed #333; border-radius: 8px; text-align: center;">
          <p style="opacity: 0.7; font-size: 14px; margin-bottom: 20px;">Live interactive ${meta.label} environment.</p>
          <button class="demo-btn-primary" style="background:${meta.color}; margin: 0 auto;">Initialize Module</button>
        </div>
      </div>
    </div>
  `;
}

/* ---------------- MAIN RENDERER ---------------- */
let demoVideoTimer = null;

function renderLiveDemo(project) {
  const meta = catMap[project.cat];
  clearInterval(demoVideoTimer);
  const body = document.getElementById('demoBody');
  
  let html = '';
  
  if (project.cat === 'video') {
    html = renderVideoDemo(project, meta);
  } else if (['chrome', 'firefox', 'safari'].includes(project.cat)) {
    html = renderExtensionDemo(project, meta);
  } else if (['ios', 'iosgames'].includes(project.cat)) {
    html = renderMobileDemo(project, meta, 'ios');
  } else if (['android', 'androidgames'].includes(project.cat)) {
    html = renderMobileDemo(project, meta, 'android');
  } else {
    html = renderWebDemo(project, meta);
  }

  // BAZOZO BUSINESS CTA: Added to every demo
  html += `
    <div class="demo-inquire-cta" style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #222; text-align: center;">
      <h4 style="font-family: 'Unbounded', sans-serif; font-size: 14px; margin-bottom: 12px; color: #fff;">Need a custom ${meta.label}?</h4>
      <a href="../../index.html#contact" class="demo-inquire-btn" style="color: ${meta.color}; border: 1px solid ${meta.color}; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; transition: all 0.2s;">
        Get an estimate for your project →
      </a>
    </div>
  `;

  body.innerHTML = html;

  // Video Play Logic
  if (project.cat === 'video') {
    const btn = body.querySelector('[data-play]');
    const fill = body.querySelector('[data-fill]');
    const time = body.querySelector('[data-time]');
    let playing = false;
    let elapsed = 0;
    const total = 30 + (hashStr(project.title) % 30); // 30-60 sec dummy duration
    
    if(btn) {
      btn.addEventListener('click', () => {
        playing = !playing;
        btn.textContent = playing ? '❚❚' : '▶';
        if (playing) {
          demoVideoTimer = setInterval(() => {
            elapsed++;
            if (elapsed >= total) { elapsed = 0; playing = false; btn.textContent = '▶'; clearInterval(demoVideoTimer); }
            if (fill) fill.style.width = (elapsed / total * 100) + '%';
            if (time) time.textContent = '0:' + String(elapsed).padStart(2, '0');
          }, 300);
        } else {
          clearInterval(demoVideoTimer);
        }
      });
    }
  }
}
