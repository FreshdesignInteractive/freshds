/* ============================================================
   FreshDS, <fresh-feedback>

   Thumbs up/down and optional flag controls for rating AI responses.

   Usage:
     <fresh-feedback></fresh-feedback>
     <fresh-feedback show-flag></fresh-feedback>
     <fresh-feedback compact></fresh-feedback>

   Attributes:
     show-flag  boolean, shows a flag/report button
     compact    boolean, icon-only, no labels

   Events:
     rate   → detail: { value: 'up' | 'down' }
     flag   → fired when the flag button is clicked
   ============================================================ */

class FreshFeedback extends HTMLElement {
  static get observedAttributes() { return ['show-flag', 'compact']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._vote = null;
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _cast(value) {
    this._vote = this._vote === value ? null : value;
    this.dispatchEvent(new CustomEvent('rate', {
      detail: { value: this._vote },
      bubbles: true, composed: true
    }));
    this._render();
  }

  _render() {
    const showFlag = this.hasAttribute('show-flag');
    const compact  = this.hasAttribute('compact');
    const vote     = this._vote;

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: inline-flex; }

        .row {
          display: inline-flex;
          align-items: center;
          gap: ${compact ? '2px' : '4px'};
        }

        .btn {
          all: unset;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: ${compact ? '28px' : '30px'};
          padding: 0 ${compact ? '7px' : '10px'};
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: color 120ms, background 120ms;
          border: 1px solid transparent;
          -webkit-font-smoothing: antialiased;
        }
        .btn:hover { color: var(--text-secondary); background: var(--surface-overlay); }
        .btn:focus-visible { outline: 2px solid var(--color-ai-text); outline-offset: 2px; }

        .btn.up.active   { color: var(--color-success); background: var(--color-success-subtle); border-color: var(--color-success-border); }
        .btn.down.active { color: var(--color-danger); background: var(--color-danger-subtle); border-color: var(--color-danger-border); }

        .divider {
          width: 1px;
          height: 16px;
          background: var(--surface-border-strong);
          margin: 0 4px;
          display: ${showFlag ? 'block' : 'none'};
        }

        .flag:hover { color: var(--color-warning); background: var(--color-warning-subtle); }
      </style>

      <div class="row" role="group" aria-label="Rate this response">
        <button class="btn up ${vote === 'up' ? 'active' : ''}" aria-label="Helpful" aria-pressed="${vote === 'up'}">
          <i class="ti ti-thumb-up" style="font-size:var(--font-size-lg)"></i>
          ${compact ? '' : '<span>Helpful</span>'}
        </button>
        <button class="btn down ${vote === 'down' ? 'active' : ''}" aria-label="Not helpful" aria-pressed="${vote === 'down'}">
          <i class="ti ti-thumb-down" style="font-size:var(--font-size-lg)"></i>
          ${compact ? '' : '<span>Not helpful</span>'}
        </button>
        <div class="divider" aria-hidden="true"></div>
        ${showFlag ? `<button class="btn flag" aria-label="Report issue"><i class="ti ti-flag" style="font-size:var(--font-size-lg)"></i></button>` : ''}
      </div>
    `;

    this.shadowRoot.querySelector('.up')?.addEventListener('click',  () => this._cast('up'));
    this.shadowRoot.querySelector('.down')?.addEventListener('click', () => this._cast('down'));
    this.shadowRoot.querySelector('.flag')?.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('flag', { bubbles: true, composed: true }))
    );
  }
}

customElements.define('fresh-feedback', FreshFeedback);
