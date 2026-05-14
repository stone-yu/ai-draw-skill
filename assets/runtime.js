/* assets/runtime.js — single + deck mode runtime.
 *
 * Responsibilities:
 *   - keyboard nav (← → / Space / PgUp / PgDn / Home / End / digits / Esc)
 *   - T = cycle 3 recommended themes; Shift+T = cycle all 8
 *   - F = fullscreen
 *   - O = slide overview (deck only)
 *   - S = open speaker window (deck only; presenter.js handles the popup)
 *   - N = bottom notes drawer (deck only)
 *   - hash deep-link #/N (deck only)
 *   - URL ?preview=N forces preview-only mode (used by presenter iframes)
 *   - Mermaid re-render on theme change
 *
 * Reads:
 *   - <html data-themes="a,b,c">       — comma list of T-cycle themes
 *   - <body data-mode="single|deck">  — feature gating
 *
 * Public API on window.AiDraw:
 *   applyTheme(name), nextSlide(), prevSlide(), gotoSlide(idx), toggleSpeaker(),
 *   toggleOverview(), toggleNotes()
 */
(function () {
  const ALL_THEMES = [
    'tech-dark', 'blueprint', 'business-clean', 'xhs-soft',
    'cyberpunk-neon', 'minimal-light', 'academic-paper', 'hand-drawn'
  ];
  const MERMAID_DARK   = ['tech-dark', 'blueprint', 'cyberpunk-neon'];
  const docEl          = document.documentElement;
  const recommended    = (docEl.dataset.themes || '').split(',').map(s => s.trim()).filter(Boolean);
  const isDeck         = document.body.dataset.mode === 'deck';

  // ---- Theme system ---------------------------------------------------------
  // For site mode (multi-page): all pages share the same theme via localStorage.
  // The <html> tag carries data-site-id="<slug>" when the page belongs to a site.
  const siteId = docEl.dataset.siteId || null;
  const siteStoreKey = siteId ? 'ai-draw-site-theme:' + siteId : null;

  // Theme link path looks like: .../assets/themes-diagram/tech-dark.css OR .../assets/themes-ppt/tokyo-night.css
  // Capture both catalog (diagram|ppt) and theme name.
  const themeMatch = document.getElementById('theme-link')?.href.match(/themes-(diagram|ppt)\/([^/.]+)\.css/);
  const themeCatalog = themeMatch ? themeMatch[1] : 'diagram';  // default to diagram for v0.1/v0.2 compat
  let currentTheme = (themeMatch && themeMatch[2]) || recommended[0] || 'tech-dark';

  // On load, if this page belongs to a site and another page already chose a theme,
  // adopt that theme so the user's choice persists across navigation.
  if (siteStoreKey) {
    try {
      const saved = localStorage.getItem(siteStoreKey);
      if (saved && ALL_THEMES.includes(saved) && saved !== currentTheme) {
        // Defer to next tick so the link swap happens after DOM is ready.
        queueMicrotask(() => applyTheme(saved));
      }
    } catch (_) { /* localStorage may be unavailable in some sandboxes */ }
  }

  function applyTheme(name) {
    // ALL_THEMES is the diagram catalog (8). PPT mode pages cycle through themes-ppt/
    // and we don't validate against a hardcoded list — task 52 will introduce a fuller mechanism.
    if (themeCatalog === 'diagram' && !ALL_THEMES.includes(name)) return;
    const link = document.getElementById('theme-link');
    if (!link) return;
    // Preserve the catalog (themes-diagram/ or themes-ppt/) when swapping the theme name
    const base = link.href.replace(/themes-(diagram|ppt)\/[^/.]+\.css.*$/, 'themes-' + themeCatalog + '/');
    link.href = base + name + '.css';
    currentTheme = name;
    docEl.dataset.theme = name;
    // Site mode: broadcast theme to sibling pages via localStorage
    if (siteStoreKey) {
      try { localStorage.setItem(siteStoreKey, name); } catch (_) {}
    }
    rerunMermaid();
    refreshMarkmap();
  }

  function cycleTheme(useAll) {
    const list = useAll ? ALL_THEMES : (recommended.length ? recommended : ALL_THEMES);
    const i = list.indexOf(currentTheme);
    applyTheme(list[(i + 1) % list.length]);
  }

  function rerunMermaid() {
    if (!window.mermaid) return;
    const flavor = MERMAID_DARK.includes(currentTheme) ? 'dark' : 'neutral';
    document.querySelectorAll('pre.mermaid').forEach(el => {
      // Restore source from data-source if mermaid already replaced it with svg
      if (el.dataset.source) el.textContent = el.dataset.source;
      else el.dataset.source = el.textContent;
      el.removeAttribute('data-processed');
    });
    window.mermaid.initialize({ startOnLoad: false, theme: flavor });
    window.mermaid.run({ querySelector: 'pre.mermaid' });
  }

  function refreshMarkmap() {
    if (window.AiDrawMarkmap?.refresh) window.AiDrawMarkmap.refresh();
  }

  // ---- Slide nav (deck mode) ------------------------------------------------
  const slides = isDeck ? Array.from(document.querySelectorAll('.slide')) : [];
  let activeIdx = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));

  function gotoSlide(i) {
    if (!isDeck || slides.length === 0) return;
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides[activeIdx]?.classList.remove('is-active');
    slides[i].classList.add('is-active');
    activeIdx = i;
    location.hash = '#/' + (i + 1);
    document.body.style.setProperty('--progress', ((i + 1) / slides.length * 100) + '%');
    broadcast({ type: 'slide-change', idx: i });
  }
  function nextSlide() { gotoSlide(activeIdx + 1); }
  function prevSlide() { gotoSlide(activeIdx - 1); }

  // ---- Preview-only mode (used by presenter.js iframes) --------------------
  const previewIdx = new URLSearchParams(location.search).get('preview');
  if (previewIdx !== null && isDeck) {
    document.body.classList.add('is-preview');
    document.documentElement.style.setProperty('--progress', '0%');
    const i = Math.max(0, Math.min(slides.length - 1, parseInt(previewIdx, 10) - 1));
    slides.forEach(s => s.classList.remove('is-active'));
    slides[i]?.classList.add('is-active');
    activeIdx = i;
    document.querySelectorAll('.deck-progress, .toolbar').forEach(el => el.style.display = 'none');
  }

  // ---- BroadcastChannel sync (deck only, between speaker + audience) -------
  let bc = null;
  if (isDeck && 'BroadcastChannel' in window) {
    const channel = 'ai-draw-' + (location.pathname);
    bc = new BroadcastChannel(channel);
    bc.onmessage = e => {
      const msg = e.data;
      if (msg.type === 'preview-goto' && typeof msg.idx === 'number') gotoSlide(msg.idx);
    };
  }
  function broadcast(msg) { bc?.postMessage(msg); }

  // ---- postMessage (presenter iframe) ---------------------------------------
  window.addEventListener('message', e => {
    const m = e.data;
    if (m && m.type === 'preview-goto' && typeof m.idx === 'number') gotoSlide(m.idx);
  });

  // ---- Keyboard -------------------------------------------------------------
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, [contenteditable]')) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === ' ' || k === 'PageDown') { e.preventDefault(); nextSlide(); }
    else if (k === 'ArrowLeft' || k === 'PageUp')           { e.preventDefault(); prevSlide(); }
    else if (k === 'Home') { gotoSlide(0); }
    else if (k === 'End')  { gotoSlide(slides.length - 1); }
    else if (k === 'T')    { e.shiftKey ? cycleTheme(true) : cycleTheme(false); }
    else if (k === 't')    { cycleTheme(false); }
    else if (k === 'F' || k === 'f') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    }
    else if ((k === 'S' || k === 's') && isDeck) { window.AiDrawPresenter?.toggle(); }
    else if ((k === 'O' || k === 'o') && isDeck) { window.AiDraw.toggleOverview(); }
    else if ((k === 'N' || k === 'n') && isDeck) { window.AiDraw.toggleNotes(); }
    else if (k === 'Escape') {
      document.querySelectorAll('.overlay').forEach(el => el.remove());
      if (document.fullscreenElement) document.exitFullscreen();
    }
  });

  // ---- Hash deep-link -------------------------------------------------------
  function readHash() {
    const m = location.hash.match(/^#\/(\d+)$/);
    if (m && isDeck) gotoSlide(parseInt(m[1], 10) - 1);
  }
  window.addEventListener('hashchange', readHash);
  if (location.hash) readHash();

  // ---- Overview grid (lazy DOM) ---------------------------------------------
  function toggleOverview() {
    let ov = document.querySelector('.overlay.overview');
    if (ov) { ov.remove(); return; }
    ov = document.createElement('div');
    ov.className = 'overlay overview';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;overflow:auto;padding:24px;';
    ov.innerHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">' +
      slides.map((s, i) =>
        `<div data-i="${i}" style="border:1px solid var(--border);border-radius:8px;padding:12px;cursor:pointer;background:var(--bg-2);min-height:120px;">
          <div style="font-size:10px;color:var(--text-3);">SLIDE ${i+1}</div>
          <div style="font-size:13px;color:var(--text-1);margin-top:4px;">${(s.querySelector('h1,h2,h3')?.textContent || '').slice(0, 40)}</div>
        </div>`
      ).join('') +
      '</div>';
    ov.addEventListener('click', e => {
      const i = e.target.closest('[data-i]')?.dataset.i;
      if (i !== undefined) { gotoSlide(parseInt(i, 10)); ov.remove(); }
    });
    document.body.appendChild(ov);
  }

  // ---- Notes drawer ---------------------------------------------------------
  function toggleNotes() {
    let dr = document.querySelector('.overlay.notes-drawer');
    if (dr) { dr.remove(); return; }
    dr = document.createElement('div');
    dr.className = 'overlay notes-drawer';
    dr.style.cssText = 'position:fixed;left:0;right:0;bottom:0;background:var(--bg-2);border-top:1px solid var(--border);padding:24px;max-height:40vh;overflow:auto;z-index:9998;';
    const notes = slides[activeIdx]?.querySelector('.notes')?.innerHTML || '<em>(no notes for this slide)</em>';
    dr.innerHTML = '<div style="font-size:11px;color:var(--text-3);margin-bottom:8px;">SPEAKER NOTES — slide ' + (activeIdx + 1) + '</div>' + notes;
    document.body.appendChild(dr);
  }

  // ---- Public API -----------------------------------------------------------
  window.AiDraw = {
    applyTheme, cycleTheme, gotoSlide, nextSlide, prevSlide,
    toggleOverview, toggleNotes,
    getActiveSlide: () => activeIdx,
    getSlideCount: () => slides.length,
    getCurrentTheme: () => currentTheme,
    getRecommendedThemes: () => recommended.slice(),
    getAllThemes: () => ALL_THEMES.slice(),
    isDeck: () => isDeck,
    broadcast,
  };

  // Init progress bar
  if (isDeck && slides.length) {
    document.body.style.setProperty('--progress', ((activeIdx + 1) / slides.length * 100) + '%');
    if (!document.querySelector('.deck-progress')) {
      const bar = document.createElement('div');
      bar.className = 'deck-progress';
      document.body.appendChild(bar);
    }
  }
})();
