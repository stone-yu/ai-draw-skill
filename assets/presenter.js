/* assets/presenter.js — speaker window with 4 draggable, resizable cards.
 *
 * Public API: window.AiDrawPresenter.toggle()
 *
 * Card positions/sizes persist to localStorage per deck.
 * Two windows sync via BroadcastChannel('ai-draw-' + pathname) AND postMessage.
 */
(function () {
  let win = null;

  function toggle() {
    if (win && !win.closed) { win.close(); win = null; return; }
    win = window.open('', 'ai-draw-presenter', 'width=1280,height=800,resizable=yes');
    if (!win) { alert('Popup blocked — please allow popups for this page'); return; }
    win.document.write(buildPresenterHTML());
    win.document.close();
    win.focus();
  }

  function buildPresenterHTML() {
    const channel = 'ai-draw-' + location.pathname;
    const deckURL = location.pathname;
    const total   = window.AiDraw?.getSlideCount() || 1;
    const startIdx = window.AiDraw?.getActiveSlide() || 0;
    const notes   = collectNotes();
    const storeKey = 'ai-draw-presenter-' + location.pathname;

    return `<!DOCTYPE html>
<html><head>
  <title>Presenter — ${document.title}</title>
  <style>
    body { margin:0; background:#0a0e1a; color:#e2e8f0; font-family:ui-monospace,monospace; height:100vh; overflow:hidden; }
    .card { position:absolute; background:#131826; border:1px solid #334155; border-radius:8px; min-width:200px; min-height:120px; display:flex; flex-direction:column; resize:both; overflow:hidden; }
    .card-header { background:#1c2333; padding:8px 12px; cursor:move; user-select:none; font-size:11px; letter-spacing:.05em; display:flex; justify-content:space-between; align-items:center; }
    .card-body { flex:1; overflow:auto; padding:12px; }
    .card.cur, .card.nxt { border-color:#22d3ee; } .card.cur .card-header { background:#0e7490; }
    .card.nxt .card-header { background:#7c3aed; } .card.scr { border-color:#fb923c; } .card.scr .card-header { background:#c2410c; }
    .card.tmr { border-color:#34d399; } .card.tmr .card-header { background:#15803d; }
    .card iframe { width:100%; height:100%; border:0; background:#000; }
    .script-text { font-size:18px; line-height:1.6; }
    .timer { font-size:48px; font-family:monospace; text-align:center; padding:16px 0; }
    .meta { font-size:13px; color:#94a3b8; text-align:center; }
    .btn-row { display:flex; gap:6px; justify-content:center; margin-top:12px; }
    .btn { padding:8px 14px; background:#1c2333; color:#e2e8f0; border:1px solid #334155; border-radius:4px; cursor:pointer; font-family:inherit; }
    .reset-layout { position:fixed; top:8px; right:8px; }
  </style>
</head><body>
  <button class="btn reset-layout" onclick="resetLayout()">Reset layout</button>

  <div class="card cur" data-id="cur" style="left:24px;top:24px;width:600px;height:340px;">
    <div class="card-header"><span>🔵 CURRENT</span><span class="cur-idx">1 / ${total}</span></div>
    <iframe class="cur-frame" src="${deckURL}?preview=${startIdx + 1}"></iframe>
  </div>

  <div class="card nxt" data-id="nxt" style="left:640px;top:24px;width:540px;height:340px;">
    <div class="card-header"><span>🟣 NEXT</span><span class="nxt-idx">${Math.min(startIdx + 2, total)} / ${total}</span></div>
    <iframe class="nxt-frame" src="${deckURL}?preview=${Math.min(startIdx + 2, total)}"></iframe>
  </div>

  <div class="card scr" data-id="scr" style="left:24px;top:380px;width:760px;height:380px;">
    <div class="card-header"><span>🟠 SPEAKER SCRIPT</span></div>
    <div class="card-body script-text" id="script">${(notes[startIdx] || '<em>(no notes)</em>')}</div>
  </div>

  <div class="card tmr" data-id="tmr" style="left:800px;top:380px;width:380px;height:380px;">
    <div class="card-header"><span>🟢 TIMER</span></div>
    <div class="card-body">
      <div class="timer" id="timer">00:00</div>
      <div class="meta"><span id="page">${startIdx + 1}</span> / ${total}</div>
      <div class="btn-row">
        <button class="btn" onclick="prev()">← Prev</button>
        <button class="btn" onclick="next()">Next →</button>
        <button class="btn" onclick="reset()">R Reset</button>
      </div>
    </div>
  </div>

<script>
  const NOTES = ${JSON.stringify(notes)};
  const TOTAL = ${total};
  let idx = ${startIdx};
  let started = Date.now();

  const bc = ('BroadcastChannel' in window) ? new BroadcastChannel('${channel}') : null;
  if (bc) bc.onmessage = e => { if (e.data?.type === 'slide-change') { idx = e.data.idx; render(); } };

  function tellAudience(i) {
    bc?.postMessage({ type: 'preview-goto', idx: i });
    if (window.opener && !window.opener.closed) window.opener.postMessage({ type: 'preview-goto', idx: i }, '*');
  }

  function render() {
    document.querySelector('.cur-idx').textContent = (idx + 1) + ' / ' + TOTAL;
    document.querySelector('.nxt-idx').textContent = (Math.min(idx + 2, TOTAL)) + ' / ' + TOTAL;
    document.querySelector('.cur-frame').contentWindow.postMessage({ type: 'preview-goto', idx }, '*');
    document.querySelector('.nxt-frame').contentWindow.postMessage({ type: 'preview-goto', idx: Math.min(idx + 1, TOTAL - 1) }, '*');
    document.getElementById('script').innerHTML = NOTES[idx] || '<em>(no notes)</em>';
    document.getElementById('page').textContent = idx + 1;
  }
  function next()  { if (idx < TOTAL - 1) { idx++; tellAudience(idx); render(); } }
  function prev()  { if (idx > 0) { idx--; tellAudience(idx); render(); } }
  function reset() { started = Date.now(); }

  setInterval(() => {
    const s = Math.floor((Date.now() - started) / 1000);
    document.getElementById('timer').textContent =
      String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }, 1000);

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft')              { e.preventDefault(); prev(); }
    else if (e.key === 'R' || e.key === 'r')     { reset(); }
    else if (e.key === 'Escape')                 { window.close(); }
  });

  // Drag
  document.querySelectorAll('.card').forEach(card => {
    const header = card.querySelector('.card-header');
    let sx, sy, sl, st;
    header.addEventListener('mousedown', e => {
      sx = e.clientX; sy = e.clientY;
      sl = card.offsetLeft; st = card.offsetTop;
      const move = ev => { card.style.left = (sl + ev.clientX - sx) + 'px'; card.style.top = (st + ev.clientY - sy) + 'px'; };
      const up   = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); savePositions(); };
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    });
  });

  function savePositions() {
    const out = {};
    document.querySelectorAll('.card').forEach(c => {
      out[c.dataset.id] = { left: c.style.left, top: c.style.top, width: c.style.width, height: c.style.height };
    });
    try { localStorage.setItem('${storeKey}', JSON.stringify(out)); } catch (_) {}
  }
  function restorePositions() {
    try {
      const saved = JSON.parse(localStorage.getItem('${storeKey}') || '{}');
      document.querySelectorAll('.card').forEach(c => {
        const s = saved[c.dataset.id];
        if (s) { Object.assign(c.style, s); }
      });
    } catch (_) {}
  }
  function resetLayout() { localStorage.removeItem('${storeKey}'); location.reload(); }
  window.resetLayout = resetLayout;

  restorePositions();
  setInterval(savePositions, 2000);
</script>
</body></html>`;
  }

  function collectNotes() {
    return Array.from(document.querySelectorAll('.slide')).map(s =>
      s.querySelector('.notes')?.innerHTML || ''
    );
  }

  window.AiDrawPresenter = { toggle };
})();
