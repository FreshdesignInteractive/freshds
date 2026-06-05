/* ============================================================
   FreshDS — <fresh-spinner>

   Usage:
     <fresh-spinner></fresh-spinner>
     <fresh-spinner size="sm"></fresh-spinner>
     <fresh-spinner size="lg"></fresh-spinner>

   Attributes:
     size   sm | md | lg   (default: md)
   ============================================================ */

class FreshSpinner extends HTMLElement {
  static get observedAttributes() { return ['size']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const size = this.getAttribute('size') || 'md';
    const dims   = { sm: '14px', md: '20px', lg: '28px' };
    const stroke = { sm: '1.75px', md: '2.5px', lg: '3px' };

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ring {
          width: ${dims[size]};
          height: ${dims[size]};
          border-radius: 50%;
          border: ${stroke[size]} solid var(--surface-border-strong);
          border-top-color: var(--color-interactive);
          animation: spin 550ms linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
      <div class="ring" role="status" aria-label="Loading"></div>
    `;
  }
}

customElements.define('fresh-spinner', FreshSpinner);
