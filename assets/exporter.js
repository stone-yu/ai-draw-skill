/* assets/exporter.js — collapsing ⋯ toolbar with PNG / PDF / clipboard.
 *
 * Auto-injects on load. Reads:
 *   - #report-container — the element to capture (falls back to document.body)
 *
 * Depends on (loaded by template):
 *   - https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js
 *   - https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js
 */
(function () {
  function once() {
    if (document.querySelector('.toolbar')) return;
    const tb = document.createElement('div');
    tb.className = 'toolbar';
    tb.style.cssText = 'position:fixed;top:16px;right:16px;z-index:9000;display:flex;gap:6px;';
    tb.innerHTML = `
      <div class="toolbar-actions" style="display:none;gap:6px;">
        <button data-act="copy"  style="${btnStyle()}">📋 Copy</button>
        <button data-act="png"   style="${btnStyle()}">🖼️ PNG</button>
        <button data-act="pdf"   style="${btnStyle()}">📄 PDF</button>
      </div>
      <button class="toolbar-toggle" style="${btnStyle()}">⋯</button>
    `;
    document.body.appendChild(tb);

    const actions = tb.querySelector('.toolbar-actions');
    tb.querySelector('.toolbar-toggle').onclick = () => {
      actions.style.display = actions.style.display === 'none' ? 'flex' : 'none';
    };
    tb.querySelector('[data-act="copy"]').onclick = copyAsImage;
    tb.querySelector('[data-act="png"]').onclick  = downloadPNG;
    tb.querySelector('[data-act="pdf"]').onclick  = downloadPDF;

    // Hide toolbar from print + html2canvas captures
    const style = document.createElement('style');
    style.textContent = '@media print { .toolbar { display: none !important; } }';
    document.head.appendChild(style);
  }

  function btnStyle() {
    return 'padding:8px 12px;border:1px solid var(--border);background:var(--bg-2);color:var(--text-1);' +
           'border-radius:var(--radius);font-family:var(--font-mono);font-size:12px;cursor:pointer;';
  }

  function captureRect() {
    const target = document.getElementById('report-container') || document.body;
    const r = target.getBoundingClientRect();
    const pad = 32;
    return {
      x: Math.max(0, r.left + window.scrollX - pad),
      y: Math.max(0, r.top  + window.scrollY - pad),
      width:  r.width  + pad * 2,
      height: r.height + pad * 2,
    };
  }

  function snapshot() {
    if (!window.html2canvas) return Promise.reject(new Error('html2canvas not loaded'));
    const rect = captureRect();
    return window.html2canvas(document.body, {
      scale: 2,
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      ignoreElements: el => el.classList?.contains('toolbar'),
      backgroundColor: getComputedStyle(document.body).backgroundColor,
    });
  }

  async function downloadPNG() {
    const canvas = await snapshot();
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = (document.title || 'ai-draw') + '.png';
    a.click();
  }

  async function copyAsImage() {
    const canvas = await snapshot();
    canvas.toBlob(async blob => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        flash('Copied to clipboard');
      } catch (e) {
        flash('Clipboard blocked — use PNG button instead');
      }
    });
  }

  async function downloadPDF() {
    if (!window.jspdf) return alert('jspdf not loaded');
    const canvas = await snapshot();
    const { jsPDF } = window.jspdf;
    const w = canvas.width / 2, h = canvas.height / 2;
    const orient = w > h ? 'landscape' : 'portrait';
    const pdf = new jsPDF({ orientation: orient, unit: 'pt', format: [w, h] });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
    pdf.save((document.title || 'ai-draw') + '.pdf');
  }

  function flash(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg-3);color:var(--text-1);padding:8px 16px;border-radius:var(--radius);z-index:9999;';
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', once);
  else once();
})();
