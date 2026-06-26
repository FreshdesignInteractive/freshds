/* ============================================================
   FreshDS, <fresh-confidence-badge>

   Displays AI model certainty as a percentage with semantic color.

   Usage:
     <fresh-confidence-badge value="94"></fresh-confidence-badge>
     <fresh-confidence-badge value="67" label="Confidence"></fresh-confidence-badge>
     <fresh-confidence-badge value="31" show-bar></fresh-confidence-badge>

   Attributes:
     value     number 0–100
     label     string (default: "Confidence")
     show-bar  boolean, renders a mini progress bar
   ============================================================ */

class FreshConfidenceBadge extends HTMLElement {
  static get observedAttributes() { return ['value', 'label', 'show-bar']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const raw     = parseFloat(this.getAttribute('value') ?? '0');
    const value   = Math.min(100, Math.max(0, raw));
    const label   = this.getAttribute('label') || 'Confidence';
    const showBar = this.hasAttribute('show-bar');

    const color = value >= 80 ? 'var(--color-success)' : value >= 50 ? 'var(--color-warning)' : 'var(--color-danger)';
    const bg    = value >= 80 ? 'var(--color-success-subtle)' : value >= 50 ? 'var(--color-warning-subtle)' : 'var(--color-danger-subtle)';
    const bdr   = value >= 80 ? 'var(--color-success-border)' : value >= 50 ? 'var(--color-warning-border)' : 'var(--color-danger-border)';

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: inline-flex; }

        .badge {
          display: inline-flex;
          flex-direction: column;
          gap: 5px;
          padding: ${showBar ? '8px 12px' : '3px 9px'};
          border-radius: ${showBar ? 'var(--radius-md)' : '9999px'};
          background: ${bg};
          border: 1px solid ${bdr};
        }

        .row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${color};
          flex-shrink: 0;
        }

        .text {
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: ${color};
          -webkit-font-smoothing: antialiased;
          white-space: nowrap;
        }

        .label {
          font-family: var(--font-sans);
          font-size: var(--font-size-2xs);
          color: var(--text-tertiary);
          -webkit-font-smoothing: antialiased;
        }

        .bar {
          width: 100%;
          height: 3px;
          background: var(--surface-border-strong);
          border-radius: 9999px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          width: ${value}%;
          background: ${color};
          border-radius: 9999px;
          transition: width 400ms ease;
        }
      </style>

      <div class="badge" part="badge" role="meter" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100" aria-label="${label}: ${value}%">
        <div class="row">
          <span class="dot" aria-hidden="true"></span>
          <span class="text">${value}%</span>
          ${showBar ? `<span class="label">${label}</span>` : ''}
        </div>
        ${showBar ? `<div class="bar"><div class="bar-fill"></div></div>` : ''}
      </div>
    `;
  }
}

customElements.define('fresh-confidence-badge', FreshConfidenceBadge);
