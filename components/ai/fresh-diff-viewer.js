/* ============================================================
   FreshDS — <fresh-diff-viewer>

   Side-by-side or inline comparison of original and AI-edited text.

   Usage:
     <fresh-diff-viewer
       original="The quick brown fox"
       revised="The swift brown fox jumps high">
     </fresh-diff-viewer>

     <fresh-diff-viewer mode="inline" original="..." revised="..."></fresh-diff-viewer>

   Attributes:
     original  string — the before text
     revised   string — the after text (AI-edited)
     mode      side-by-side | inline  (default: side-by-side)

   Events:
     accept → user accepted the revised version
     reject → user rejected (reverted to original)
   ============================================================ */

class FreshDiffViewer extends HTMLElement {
  static get observedAttributes() { return ['original', 'revised', 'mode']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _diff(a, b) {
    const aWords = a.split(/(\s+)/);
    const bWords = b.split(/(\s+)/);
    const m = aWords.length, n = bWords.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = aWords[i-1] === bWords[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);

    const result = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && aWords[i-1] === bWords[j-1]) {
        result.unshift({ type: 'eq', val: aWords[i-1] }); i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
        result.unshift({ type: 'add', val: bWords[j-1] }); j--;
      } else {
        result.unshift({ type: 'del', val: aWords[i-1] }); i--;
      }
    }
    return result;
  }

  _render() {
    const original = this.getAttribute('original') || '';
    const revised  = this.getAttribute('revised')  || '';
    const mode     = this.getAttribute('mode') || 'side-by-side';
    const isSide   = mode === 'side-by-side';

    const diff = this._diff(original, revised);

    const removedHtml = diff.map(t =>
      t.type === 'eq'  ? `<span>${t.val}</span>` :
      t.type === 'del' ? `<span class="del">${t.val}</span>` : ''
    ).join('');

    const addedHtml = diff.map(t =>
      t.type === 'eq'  ? `<span>${t.val}</span>` :
      t.type === 'add' ? `<span class="add">${t.val}</span>` : ''
    ).join('');

    const inlineHtml = diff.map(t =>
      t.type === 'eq'  ? `<span>${t.val}</span>` :
      t.type === 'del' ? `<span class="del">${t.val}</span>` :
                         `<span class="add">${t.val}</span>`
    ).join('');

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: block; }

        .wrapper {
          border: 1px solid var(--surface-border-strong);
          border-radius: var(--radius-lg);
          overflow: hidden;
          font-family: var(--font-mono);
          font-size: 13px;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: var(--surface-subtle);
          border-bottom: 1px solid var(--surface-border);
          gap: var(--space-3);
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .ai-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 9999px;
          background: var(--badge-primary-bg);
          border: 1px solid var(--badge-primary-border);
          color: var(--color-interactive-text);
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .actions {
          display: flex;
          gap: 6px;
        }

        .action-btn {
          all: unset;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 26px;
          padding: 0 10px;
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 120ms;
          -webkit-font-smoothing: antialiased;
        }

        .accept-btn {
          background: var(--color-success);
          color: var(--text-inverse);
        }
        .accept-btn:hover { background: var(--color-success-text); }

        .reject-btn {
          background: var(--surface-overlay);
          color: var(--text-secondary);
          border: 1px solid var(--surface-border-strong);
        }
        .reject-btn:hover { background: var(--surface-subtle); }

        .panels {
          display: ${isSide ? 'grid' : 'block'};
          ${isSide ? 'grid-template-columns: 1fr 1fr;' : ''}
        }

        .panel {
          padding: var(--space-4) var(--space-5);
          line-height: 1.7;
          color: var(--text-primary);
          word-break: break-word;
        }

        .panel + .panel {
          border-${isSide ? 'left' : 'top'}: 1px solid var(--surface-border);
        }

        .panel-label {
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 8px;
        }

        span.del {
          background: var(--color-danger-subtle);
          color: var(--color-danger);
          text-decoration: line-through;
          border-radius: 2px;
          padding: 0 1px;
        }

        span.add {
          background: var(--color-success-subtle);
          color: var(--color-success-text);
          border-radius: 2px;
          padding: 0 1px;
        }
      </style>

      <div class="wrapper" part="wrapper">
        <div class="toolbar">
          <div class="toolbar-left">
            <span class="ai-chip"><i class="ti ti-sparkles" style="font-size:9px"></i> AI edit</span>
            <span>${isSide ? 'Side-by-side' : 'Inline'}</span>
          </div>
          <div class="actions">
            <button class="action-btn reject-btn"><i class="ti ti-x" style="font-size:12px"></i> Reject</button>
            <button class="action-btn accept-btn"><i class="ti ti-check" style="font-size:12px"></i> Accept</button>
          </div>
        </div>

        ${isSide ? `
          <div class="panels">
            <div class="panel">
              <div class="panel-label">Original</div>
              ${removedHtml}
            </div>
            <div class="panel">
              <div class="panel-label">Revised</div>
              ${addedHtml}
            </div>
          </div>
        ` : `
          <div class="panels">
            <div class="panel">
              <div class="panel-label">Inline diff</div>
              ${inlineHtml}
            </div>
          </div>
        `}
      </div>
    `;

    this.shadowRoot.querySelector('.accept-btn')?.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('accept', { bubbles: true, composed: true }))
    );
    this.shadowRoot.querySelector('.reject-btn')?.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('reject', { bubbles: true, composed: true }))
    );
  }
}

customElements.define('fresh-diff-viewer', FreshDiffViewer);
