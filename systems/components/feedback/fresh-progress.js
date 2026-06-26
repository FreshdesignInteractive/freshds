/* ============================================================
   FreshDS, <fresh-progress>

   Usage:
     <fresh-progress value="65"></fresh-progress>
     <fresh-progress value="30" size="sm" label="Uploading…" show-percent></fresh-progress>
     <fresh-progress></fresh-progress>  ← indeterminate

   Attributes:
     value        number 0–100  , omit for indeterminate
     size         sm | md | lg   (default: md)
     label        string        , shown above the bar
     show-percent boolean       , shows percentage on the right
   ============================================================ */

class FreshProgress extends HTMLElement {
  static get observedAttributes() { return ['value', 'size', 'label', 'show-percent']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const rawVal      = this.getAttribute('value');
    const value       = rawVal !== null ? Math.min(100, Math.max(0, parseFloat(rawVal))) : null;
    const indeterminate = value === null;
    const size        = this.getAttribute('size') || 'md';
    const label       = this.getAttribute('label') || '';
    const showPct     = this.hasAttribute('show-percent');

    const heights = { sm: '3px', md: '5px', lg: '8px' };
    const h = heights[size];

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; width: 100%; }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 7px;
        }

        .label {
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          -webkit-font-smoothing: antialiased;
        }

        .pct {
          font-family: var(--font-mono);
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
        }

        .track {
          width: 100%;
          height: ${h};
          background: var(--surface-overlay);
          border-radius: 9999px;
          overflow: hidden;
          position: relative;
        }

        .fill {
          height: 100%;
          border-radius: 9999px;
          background: var(--color-interactive);
          transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
          width: ${indeterminate ? '35%' : value + '%'};
          ${indeterminate ? 'animation: indeterminate 1.4s ease infinite;' : ''}
        }

        @keyframes indeterminate {
          0%   { left: -35%; }
          60%  { left: 100%; }
          100% { left: 100%; }
        }

        ${indeterminate ? '.fill { position: absolute; }' : ''}
      </style>

      ${label || showPct ? `
        <div class="header">
          ${label ? `<span class="label">${label}</span>` : '<span></span>'}
          ${showPct && !indeterminate ? `<span class="pct">${Math.round(value)}%</span>` : ''}
        </div>
      ` : ''}

      <div
        class="track"
        role="progressbar"
        aria-valuenow="${indeterminate ? '' : value}"
        aria-valuemin="0"
        aria-valuemax="100"
        ${indeterminate ? 'aria-label="Loading"' : ''}
        part="track"
      >
        <div class="fill" part="fill"></div>
      </div>
    `;
  }
}

customElements.define('fresh-progress', FreshProgress);
