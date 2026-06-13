/* ============================================================
   FreshDS, <fresh-accordion> + <fresh-accordion-item>

   Usage:
     <fresh-accordion>
       <fresh-accordion-item label="What is FreshDS?">
         A token-driven, framework-agnostic design system…
       </fresh-accordion-item>
       <fresh-accordion-item label="How do I create a client theme?" open>
         Run the Configurator and export your CSS tokens…
       </fresh-accordion-item>
       <fresh-accordion-item label="Is it free?" disabled>
         Yes, MIT licensed.
       </fresh-accordion-item>
     </fresh-accordion>

   fresh-accordion attributes:
     multiple  boolean, allow multiple items open simultaneously

   fresh-accordion-item attributes:
     label     string
     open      boolean
     disabled  boolean
   ============================================================ */

class FreshAccordion extends HTMLElement {
  static get observedAttributes() { return ['multiple']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
    this.addEventListener('_item-open', this._onItemOpen.bind(this));
  }

  attributeChangedCallback() { this._render(); }

  _onItemOpen(e) {
    if (this.hasAttribute('multiple')) return;
    /* Close all sibling items except the one that just opened */
    this.querySelectorAll('fresh-accordion-item').forEach(item => {
      if (item !== e.target && item.hasAttribute('open')) {
        item.removeAttribute('open');
      }
    });
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        .accordion {
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        ::slotted(fresh-accordion-item:not(:last-child)) {
          border-bottom: 1px solid var(--surface-border);
        }
      </style>
      <div class="accordion" part="accordion">
        <slot></slot>
      </div>
    `;
  }
}

class FreshAccordionItem extends HTMLElement {
  static get observedAttributes() { return ['label', 'open', 'disabled']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = false;
  }

  connectedCallback() {
    this._open = this.hasAttribute('open');
    this._render();
  }

  attributeChangedCallback(name) {
    if (name === 'open') this._open = this.hasAttribute('open');
    this._render();
  }

  _toggle() {
    if (this.hasAttribute('disabled')) return;
    this._open = !this._open;
    if (this._open) {
      this.setAttribute('open', '');
      this.dispatchEvent(new CustomEvent('_item-open', { bubbles: true, composed: true }));
    } else {
      this.removeAttribute('open');
    }
    this.dispatchEvent(new CustomEvent('change', {
      detail: { open: this._open },
      bubbles: true,
      composed: true
    }));
  }

  _render() {
    const label    = this.getAttribute('label') || '';
    const disabled = this.hasAttribute('disabled');

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; background: var(--surface-bg); }

        .trigger {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: var(--space-4) var(--space-5);
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          font-weight: 500;
          color: ${disabled ? 'var(--text-tertiary)' : 'var(--text-primary)'};
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          text-align: left;
          transition: background 120ms ease, color 120ms ease;
          -webkit-font-smoothing: antialiased;
          gap: var(--space-4);
        }

        .trigger:hover:not(.disabled) {
          background: var(--surface-subtle);
        }

        .trigger:focus-visible {
          outline: 2px solid var(--color-interactive-text);
          outline-offset: -2px;
        }

        .label { flex: 1; }

        .icon {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          transition: transform 200ms ease, color 200ms ease;
          transform: rotate(${this._open ? '180deg' : '0deg'});
        }

        .icon svg { display: block; }

        .panel {
          overflow: hidden;
          max-height: ${this._open ? '1000px' : '0'};
          transition: max-height 250ms ease;
        }

        .panel-inner {
          padding: 0 var(--space-5) var(--space-5);
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          color: var(--text-secondary);
          line-height: 1.65;
          -webkit-font-smoothing: antialiased;
        }
      </style>

      <button
        class="trigger ${disabled ? 'disabled' : ''}"
        aria-expanded="${this._open}"
        ${disabled ? 'disabled' : ''}
        part="trigger"
      >
        <span class="label">${label}</span>
        <span class="icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 5l4.5 4.5L11.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>

      <div class="panel" role="region" part="panel">
        <div class="panel-inner">
          <slot></slot>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.trigger')
      ?.addEventListener('click', () => this._toggle());
  }
}

customElements.define('fresh-accordion',      FreshAccordion);
customElements.define('fresh-accordion-item', FreshAccordionItem);
