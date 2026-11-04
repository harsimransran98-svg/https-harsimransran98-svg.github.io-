/* NoteDock — markdown knowledge base simulator (Bazozo Studio).
   The markdown renderer builds DOM nodes with textContent; it never parses HTML. */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduced ? window.gsap : null;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  $('#year').textContent = new Date().getFullYear();

  /* ---------- desktop scale + clock ---------- */
  const wrap = $('#deskWrap'), desk = $('#desk');
  let S = 1;
  function fit() { S = Math.max(.5, Math.min(1, wrap.clientWidth / 1200)); wrap.style.setProperty('--s', S.toFixed(4)); }
  window.addEventListener('resize', fit); fit();
  const toDesk = (cx, cy) => { const r = desk.getBoundingClientRect(); return [(cx - r.left) / S, (cy - r.top) / S]; };
  const tick = () => { const d = new Date(), c = $('#clock'); c.replaceChildren(document.createTextNode(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), el('br'), document.createTextNode(d.toLocaleDateString('en-GB'))); };
  tick(); setInterval(tick, 10000);

  /* ---------- checklist + toast ---------- */
  const done = new Set();
  function check(k) { if (done.has(k)) return; done.add(k); const c = $(`#tryList [data-t="${k}"]`); if (c) { c.classList.add('done'); if (G) G.fromTo(c, { scale: .9 }, { scale: 1, duration: .45, ease: 'back.out(3)' }); } $('#tryCount').textContent = `${done.size}/5`; }
  const toast = $('#toast'); let tt = null;
  function say(msg) { toast.textContent = msg; toast.hidden = false; clearTimeout(tt); if (G) G.fromTo(toast, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: 'back.out(2)' }); tt = setTimeout(() => { toast.hidden = true; }, 2600); }

  /* ---------- vault ---------- */
  const NOTES = new Map(Object.entries({
    'Welcome': '# Welcome to Atlas\n\nThis vault is **plain markdown** on your disk. Everything links into a graph.\n\n## Start here\n- Read the [[Project Atlas]] brief\n- Check this week\'s [[Meeting Notes]]\n- Browse the [[Reading List]]\n\n> Write it down once, link it everywhere.\n\nTry editing this note on the left. #getting-started',
    'Project Atlas': '# Project Atlas\n\nA knowledge base for the design team. Owner: *Priya*.\n\n## Goals\n- [x] Pick a file format (plain `.md`)\n- [x] Draft the [[Linking Guide]]\n- [ ] Import the old wiki\n- [ ] Ship v1 to the team\n\n## Related\nDecisions live in [[Meeting Notes]]. Ideas go to [[Ideas Inbox]]. #project',
    'Meeting Notes': '# Meeting Notes · Tue\n\nAttendees: Priya, Leo, Sam\n\n1. Agreed on the [[Linking Guide]]\n2. Import tool needs a dry-run mode\n3. Next review on Friday\n\n```bash\nnotedock import ./old-wiki --dry-run\n```\n\nFollow-ups tracked in [[Project Atlas]]. #meeting',
    'Linking Guide': '# Linking Guide\n\nUse `[[double brackets]]` to link notes. Links to notes that don\'t exist yet show up **faded**, and clicking one creates it.\n\n---\n\nExample: see [[Welcome]] or start [[A Brand New Note]].',
    'Reading List': '# Reading List\n\n- [x] *Four Thousand Weeks*\n- [ ] *How to Take Smart Notes*\n- [ ] *The Making of a Manager*\n\nNotes on each book go in [[Ideas Inbox]]. #books',
    'Ideas Inbox': '# Ideas Inbox\n\n- A daily note template\n- Graph colours by **tag**\n- Publish a note as a page: see [[Project Atlas]]\n\n#ideas'
  }));
  const isNew = new Set();
  let current = 'Welcome', open = ['Welcome', 'Project Atlas'];
  const linksOf = src => [...src.replace(/```[\s\S]*?```|`[^`]*`/g, '').matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)].map(m => m[1].trim());

  /* ---------- markdown → DOM (safe) ---------- */
  const INLINE = /(\[\[[^\]]+\]\])|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(`[^`]+`)|(\[[^\]]+\]\((https?:\/\/[^)\s]+)\))|((?:^|(?<=\s))#[\w-]+)/g;
  function inline(text, parent) {
    let last = 0;
    for (const m of text.matchAll(INLINE)) {
      if (m.index > last) parent.append(document.createTextNode(text.slice(last, m.index)));
      const t = m[0];
      if (m[1]) { const inner = t.slice(2, -2), [target, alias] = inner.split('|').map(s => s.trim()); const a = el('span', 'wl' + (NOTES.has(target) ? '' : ' missing'), alias || target); a.setAttribute('role', 'link'); a.tabIndex = 0; a.dataset.target = target; parent.append(a); }
      else if (m[2]) inline(t.slice(2, -2), parent.appendChild(el('strong')));
      else if (m[3]) inline(t.slice(1, -1), parent.appendChild(el('em')));
      else if (m[4]) parent.append(el('code', null, t.slice(1, -1)));
      else if (m[5]) { const a = el('a', 'ext', t.slice(1, t.indexOf(']'))); a.href = m[6]; a.target = '_blank'; a.rel = 'noopener noreferrer'; parent.append(a); }
      else if (m[7]) parent.append(el('span', 'tagc', t.trim()));
      last = m.index + t.length;
    }
    if (last < text.length) parent.append(document.createTextNode(text.slice(last)));
  }
  function render(src, out) {
    out.replaceChildren();
    const lines = src.split('\n');
    let i = 0, para = null, list = null, listType = null;
    const endPara = () => { para = null; }, endList = () => { list = null; listType = null; };
    while (i < lines.length) {
      const line = lines[i];
      if (/^```/.test(line)) {
        endPara(); endList();
        const pre = el('pre'), code = el('code'); const buf = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
        code.textContent = buf.join('\n'); pre.append(code); out.append(pre); i++; continue;
      }
      let m;
      if ((m = line.match(/^(#{1,3})\s+(.*)/))) { endPara(); endList(); inline(m[2], out.appendChild(el('h' + m[1].length))); }
      else if (/^(-{3,}|\*{3,})\s*$/.test(line)) { endPara(); endList(); out.append(el('hr')); }
      else if ((m = line.match(/^>\s?(.*)/))) { endPara(); endList(); inline(m[1], out.appendChild(el('blockquote'))); }
      else if ((m = line.match(/^\s*[-*]\s+\[( |x|X)\]\s+(.*)/))) {
        endPara(); if (listType !== 'ul') { list = out.appendChild(el('ul')); listType = 'ul'; }
        const li = el('li', 'task' + (m[1] !== ' ' ? ' done' : '')), cb = el('input'); cb.type = 'checkbox'; cb.checked = m[1] !== ' '; cb.dataset.line = i; cb.setAttribute('aria-label', m[2]);
        const sp = el('span'); inline(m[2], sp); li.append(cb, sp); list.append(li);
      }
      else if ((m = line.match(/^\s*[-*]\s+(.*)/))) { endPara(); if (listType !== 'ul') { list = out.appendChild(el('ul')); listType = 'ul'; } inline(m[1], list.appendChild(el('li'))); }
      else if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) { endPara(); if (listType !== 'ol') { list = out.appendChild(el('ol')); listType = 'ol'; } inline(m[1], list.appendChild(el('li'))); }
      else if (!line.trim()) { endPara(); endList(); }
      else { endList(); if (!para) para = out.appendChild(el('p')); else para.append(document.createTextNode(' ')); inline(line, para); }
      i++;
    }
    // backlinks
    const back = [...NOTES.keys()].filter(k => k !== current && linksOf(NOTES.get(k)).includes(current));
    const bl = el('div', 'backlinks'); bl.append(el('b', null, `${back.length} backlink${back.length === 1 ? '' : 's'}`));
    back.forEach(k => { const b = el('button', null, k); b.type = 'button'; b.addEventListener('click', () => openNote(k)); bl.append(b); });
    out.append(bl);
    $('#stLinks').textContent = `${back.length} backlinks`;
  }

  /* ---------- editor ---------- */
  const ed = $('#ed'), preview = $('#preview');
  let saveT = null, typed = 0;
  function stats() { const t = ed.value; $('#stWords').textContent = `${(t.match(/\S+/g) || []).length} words`; $('#stChars').textContent = `${t.length} characters`; }
  ed.addEventListener('input', () => {
    NOTES.set(current, ed.value); render(ed.value, preview); stats(); renderTree();
    $('#stSaved').textContent = '● Editing…'; $('#stSaved').style.color = '#FBBF24';
    clearTimeout(saveT); saveT = setTimeout(() => { $('#stSaved').textContent = '● Saved'; $('#stSaved').style.color = ''; }, 700);
    if (++typed > 3) check('type');
    graphDirty = true;
  });
  ed.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); const s = ed.selectionStart; ed.setRangeText('  ', s, ed.selectionEnd, 'end'); ed.dispatchEvent(new Event('input')); } });
  preview.addEventListener('click', e => {
    const w = e.target.closest('.wl'); if (w) { followLink(w.dataset.target); return; }
  });
  preview.addEventListener('keydown', e => { const w = e.target.closest('.wl'); if (w && e.key === 'Enter') followLink(w.dataset.target); });
  preview.addEventListener('change', e => {
    const cb = e.target.closest('input[type=checkbox]'); if (!cb) return;
    const lines = ed.value.split('\n'), i = +cb.dataset.line;
    lines[i] = lines[i].replace(/\[( |x|X)\]/, cb.checked ? '[x]' : '[ ]');
    ed.value = lines.join('\n'); NOTES.set(current, ed.value); render(ed.value, preview); stats(); check('task');
    say(cb.checked ? 'Task done · saved to the .md file' : 'Task reopened');
  });
  function followLink(target) {
    if (!NOTES.has(target)) { NOTES.set(target, `# ${target}\n\nCreated from [[${current}]].\n\n- [ ] Write something here`); isNew.add(target); check('new'); say(`Created “${target}.md”`); graphDirty = true; }
    check('link'); openNote(target);
  }

  /* ---------- files, tabs ---------- */
  function renderTree() {
    const q = $('#search').value.trim().toLowerCase(), tree = $('#tree'); tree.replaceChildren();
    const f = el('div', 'folder', '▾ Atlas'); tree.append(f);
    [...NOTES.keys()].filter(k => !q || k.toLowerCase().includes(q) || NOTES.get(k).toLowerCase().includes(q)).forEach(k => {
      const b = el('button', 'note-btn'); b.type = 'button'; b.setAttribute('aria-current', String(k === current));
      const ic = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); ic.setAttribute('viewBox', '0 0 24 24'); ic.setAttribute('fill', 'none'); ic.setAttribute('stroke', 'currentColor'); ic.setAttribute('stroke-width', '2');
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', 'M6 3h9l4 4v14H6Z'); ic.append(p);
      b.append(ic, el('span', null, k)); if (isNew.has(k)) b.append(el('span', 'new', 'new'));
      b.addEventListener('click', () => openNote(k)); tree.append(b);
    });
  }
  $('#search').addEventListener('input', renderTree);
  function renderTabs() {
    const tabs = $('#tabs'); tabs.replaceChildren();
    open.forEach(k => {
      const t = el('div', 'tab'); t.setAttribute('role', 'tab'); t.setAttribute('aria-selected', String(k === current)); t.tabIndex = 0;
      t.append(el('span', null, k)); if (k === current) t.append(el('i', 'dot'));
      t.addEventListener('click', () => openNote(k)); t.addEventListener('keydown', e => { if (e.key === 'Enter') openNote(k); });
      tabs.append(t);
    });
  }
  function openNote(k) {
    current = k; if (!open.includes(k)) { open.push(k); if (open.length > 4) open.shift(); }
    ed.value = NOTES.get(k); $('#crumb').textContent = k + '.md';
    render(ed.value, preview); stats(); renderTree(); renderTabs();
    if (view === 'graph') setView('editor');
    if (G) G.from(preview.children, { y: 8, opacity: 0, duration: .3, stagger: .02 });
  }
  function newNote() {
    let n = 1; while (NOTES.has(`Untitled ${n}`)) n++;
    const k = `Untitled ${n}`; NOTES.set(k, `# ${k}\n\nStart typing. Link back to [[Welcome]].`); isNew.add(k); graphDirty = true;
    openNote(k); check('new'); say(`Created “${k}.md”`); ed.focus(); ed.setSelectionRange(ed.value.length, ed.value.length);
  }
  $('#newBtn').addEventListener('click', newNote); $('#newBtn2').addEventListener('click', newNote);
  $$('.mode button').forEach(b => b.addEventListener('click', () => {
    $$('.mode button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $('#split').className = 'split' + (b.dataset.m === 'edit' ? ' only-edit' : b.dataset.m === 'prev' ? ' only-prev' : '');
  }));

  /* ---------- graph view ---------- */
  const gWrap = $('#graphWrap'), cv = $('#graph'), ctx = cv.getContext('2d');
  let view = 'editor', graphDirty = true, nodes = [], edges = [], dragN = null, hoverN = null, raf = 0, heat = 1;
  function buildGraph() {
    const old = new Map(nodes.map(n => [n.id, n]));
    const ids = new Set(NOTES.keys()); NOTES.forEach(v => linksOf(v).forEach(l => ids.add(l)));
    const W = cv.width / devicePixelRatio, H = cv.height / devicePixelRatio;
    nodes = [...ids].map((id, i) => old.get(id) || { id, x: W / 2 + Math.cos(i * 2.4) * 120, y: H / 2 + Math.sin(i * 2.4) * 120, vx: 0, vy: 0 });
    const idx = new Map(nodes.map((n, i) => [n.id, i]));
    edges = []; NOTES.forEach((v, k) => linksOf(v).forEach(l => { if (l !== k) edges.push([idx.get(k), idx.get(l)]); }));
    nodes.forEach(n => { n.deg = edges.filter(e => nodes[e[0]] === n || nodes[e[1]] === n).length; n.ghost = !NOTES.has(n.id); });
    graphDirty = false; heat = 1;
    for (let k = 0; k < 220; k++) step();
    heat = .6;
  }
  function sizeCanvas() { const w = gWrap.offsetWidth, h = gWrap.offsetHeight, d = devicePixelRatio || 1; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
  function step() {
    const W = cv.width / devicePixelRatio, H = cv.height / devicePixelRatio;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j]; let dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy || .01, f = 9000 / d2;
      const d = Math.sqrt(d2); dx /= d; dy /= d; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
    }
    edges.forEach(([i, j]) => { const a = nodes[i], b = nodes[j]; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, f = (d - 170) * .012; a.vx += dx / d * f * 10; a.vy += dy / d * f * 10; b.vx -= dx / d * f * 10; b.vy -= dy / d * f * 10; });
    nodes.forEach(n => {
      n.vx += (W / 2 - n.x) * .0015; n.vy += (H / 2 - n.y) * .0015;
      if (n === dragN) { n.vx = n.vy = 0; return; }
      n.x += n.vx * .2 * heat; n.y += n.vy * .2 * heat; n.vx *= .6; n.vy *= .6;
      n.x = Math.max(30, Math.min(W - 30, n.x)); n.y = Math.max(30, Math.min(H - 56, n.y));
    });
    heat = Math.max(.25, heat * .995);
  }
  function draw() {
    const W = cv.width / devicePixelRatio, H = cv.height / devicePixelRatio;
    ctx.clearRect(0, 0, W, H);
    const focus = hoverN || dragN;
    const near = new Set(); if (focus) edges.forEach(([i, j]) => { if (nodes[i] === focus) near.add(nodes[j]); if (nodes[j] === focus) near.add(nodes[i]); });
    edges.forEach(([i, j]) => {
      const a = nodes[i], b = nodes[j], hot = focus && (a === focus || b === focus);
      ctx.strokeStyle = hot ? 'rgba(192,132,252,.9)' : focus ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.16)'; ctx.lineWidth = hot ? 1.8 : 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
    nodes.forEach(n => {
      const r = 5 + n.deg * 1.6, dim = focus && n !== focus && !near.has(n), cur = n.id === current;
      ctx.globalAlpha = dim ? .25 : 1;
      if (cur || n === focus) { ctx.shadowColor = '#A855F7'; ctx.shadowBlur = 18; }
      ctx.fillStyle = n.ghost ? '#3A3A44' : cur ? '#C084FC' : n === focus ? '#E9D5FF' : '#A855F7';
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      if (n.ghost) { ctx.strokeStyle = '#62626C'; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]); }
      ctx.fillStyle = n.ghost ? '#62626C' : '#EDEDF0'; ctx.font = `${cur ? 600 : 500} 12px Inter, sans-serif`; ctx.textAlign = 'center';
      ctx.fillText(n.id, n.x, n.y + r + 15);
      ctx.globalAlpha = 1;
    });
  }
  function loop() { if (view !== 'graph') return; if (graphDirty) buildGraph(); step(); draw(); raf = requestAnimationFrame(loop); }
  const local = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / S, (e.clientY - r.top) / S]; };
  const hit = (x, y) => nodes.slice().reverse().find(n => Math.hypot(n.x - x, n.y - y) < 8 + n.deg * 1.6);
  let downAt = null;
  cv.addEventListener('pointerdown', e => { const [x, y] = local(e); dragN = hit(x, y); downAt = [x, y]; if (dragN) { try { cv.setPointerCapture(e.pointerId); } catch (_) {} heat = 1; } });
  cv.addEventListener('pointermove', e => { const [x, y] = local(e); if (dragN) { dragN.x = x; dragN.y = y; if (Math.hypot(x - downAt[0], y - downAt[1]) > 6) { dragN.moved = true; check('graph'); } } else hoverN = hit(x, y) || null; cv.style.cursor = hoverN ? 'pointer' : 'grab'; });
  cv.addEventListener('pointerup', () => {
    if (dragN && !dragN.moved) { const id = dragN.id; dragN = null; if (NOTES.has(id)) openNote(id); else followLink(id); return; }
    if (dragN) dragN.moved = false; dragN = null;
  });
  cv.addEventListener('pointerleave', () => { hoverN = null; });
  $('#reheat').addEventListener('click', () => { nodes.forEach(n => { n.vx += (Math.random() - .5) * 400; n.vy += (Math.random() - .5) * 400; }); heat = 1; });
  $('#center').addEventListener('click', () => { const W = cv.width / devicePixelRatio, H = cv.height / devicePixelRatio; nodes.forEach((n, i) => { n.x = W / 2 + Math.cos(i * 2.4) * 140; n.y = H / 2 + Math.sin(i * 2.4) * 110; }); heat = 1; });
  function setView(v) {
    view = v; $$('.ribbon [data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    $('#split').hidden = v === 'graph'; gWrap.hidden = v !== 'graph'; $('#mainH .mode').style.visibility = v === 'graph' ? 'hidden' : '';
    $('#crumb').textContent = v === 'graph' ? 'Graph view' : current + '.md';
    if (v === 'graph') { sizeCanvas(); graphDirty = true; cancelAnimationFrame(raf); loop(); if (G) G.from(cv, { opacity: 0, scale: .96, duration: .4 }); }
  }
  $$('.ribbon [data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  window.addEventListener('resize', () => { if (view === 'graph') sizeCanvas(); });

  /* ---------- window management ---------- */
  const win = $('#win'), tb = $('#titlebar'), tbApp = $('#tbApp');
  let drag = null, maxed = false, saved = null, minimised = false;
  tb.addEventListener('pointerdown', e => { if (e.target.closest('button, .tab') || maxed) return; const [x, y] = toDesk(e.clientX, e.clientY); drag = { x, y, l: win.offsetLeft, t: win.offsetTop }; try { tb.setPointerCapture(e.pointerId); } catch (_) {} });
  tb.addEventListener('pointermove', e => { if (!drag) return; const [x, y] = toDesk(e.clientX, e.clientY); win.style.left = Math.max(-800, Math.min(1100, drag.l + x - drag.x)) + 'px'; win.style.top = Math.max(0, Math.min(640, drag.t + y - drag.y)) + 'px'; });
  tb.addEventListener('pointerup', () => { drag = null; });
  function maximise() {
    const to = maxed ? saved : { left: 0, top: 0, width: 1200, height: 672 };
    if (!maxed) saved = { left: win.offsetLeft, top: win.offsetTop, width: win.offsetWidth, height: win.offsetHeight };
    maxed = !maxed; const css = Object.fromEntries(Object.entries(to).map(([k, v]) => [k, v + 'px']));
    if (G) G.to(win, { ...css, duration: .35, ease: 'power3.inOut', onUpdate: () => { if (view === 'graph') sizeCanvas(); } }); else Object.assign(win.style, css);
  }
  function minimise() {
    minimised = true; tbApp.classList.add('min');
    const tr = tbApp.getBoundingClientRect(), wr = win.getBoundingClientRect();
    if (G) G.to(win, { x: (tr.left - wr.left - wr.width / 2) / S, y: (tr.top - wr.top - wr.height / 2) / S, scale: .08, opacity: 0, duration: .35, ease: 'power2.in', onComplete: () => { win.hidden = true; } }); else win.hidden = true;
  }
  function restore() { minimised = false; win.hidden = false; tbApp.classList.remove('min'); tbApp.classList.add('open'); if (G) G.to(win, { x: 0, y: 0, scale: 1, opacity: 1, duration: .4, ease: 'expo.out' }); }
  $('#wMin').addEventListener('click', minimise); $('#wMax').addEventListener('click', maximise);
  $('#wClose').addEventListener('click', () => { win.hidden = true; tbApp.classList.remove('open'); say('NoteDock closed. Your notes are already saved. Reopen it from the taskbar.'); });
  tbApp.addEventListener('click', () => { if (win.hidden) restore(); else minimise(); });

  /* ---------- boot ---------- */
  openNote('Welcome');
  if (G) {
    G.from('.intro > *', { y: 24, opacity: 0, duration: .8, stagger: .1, ease: 'expo.out' });
    G.from('#win', { y: 40, scale: .97, opacity: 0, duration: .7, ease: 'expo.out', delay: .3 });
  }
})();
