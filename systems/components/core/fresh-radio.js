/* ============================================================
   FreshDS, <fresh-radio>

   Usage:
     <fresh-radio name="plan" value="starter" label="Starter"></fresh-radio>
     <fresh-radio name="plan" value="pro"     label="Pro" checked></fresh-radio>
     <fresh-radio name="plan" value="enterprise" label="Enterprise" disabled></fresh-radio>

   Attributes:
     label    string
     value    string
     name     string   , groups radios together
     checked  boolean
     disabled boolean

   Events:
     change → detail: { value: string, name: string }
   ============================================================ */

class FreshRadio extends HTMLElement {
  static get observedAttributes() {
    return ['checked', 'disabled', 'label', 'value', 'name'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._checked = false;
  }

  get checked()  { return this._checked; }
  set checked(v) { this._checked = Boolean(v); this._render(); }

  connectedCallback() {
    this._checked = this.hasAttribute('checked');
    this._render();
  }

  attributeChangedCallback(name) {
    if (name === 'checked') this._checked = this.hasAttribute('checked');
    this._render();
  }

  _render() {
    const label    = this.getAttribute('label') || '';
    const disabled = this.hasAttribute('disabled');

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: inline-flex; }

        .root {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          opacity: ${disabled ? '0.4' : '1'};
          user-select: none;
          -webkit-font-smoothing: antialiased;
        }

        .circle {
          position: relative;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          border-radius: 50%;
          border: ${this._checked ? '5px' : '1.5px'} solid ${this._checked ? 'var(--color-interactive-text)' : 'var(--surface-border-strong)'};
          background: var(--surface-input);
          transition:
            border-color 150ms ease,
            border-width  150ms ease,
            box-shadow   150ms ease;
        }

        .root:not(.disabled):hover .circle {
          border-color: var(--color-interactive-text);
          box-shadow: ${this._checked ? 'none' : '0 0 0 3px var(--input-focus-ring)'};
        }

        input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
          margin: 0;
        }

        input:focus-visible ~ .circle {
          box-shadow:
            0 0 0 2px var(--surface-input),
            0 0 0 4px var(--color-interactive);
        }

        label {
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          color: var(--text-primary);
          line-height: 1;
          cursor: inherit;
        }
      </style>

      <label class="root ${disabled ? 'disabled' : ''}">
        <input
          type="radio"
          name="${this.getAttribute('name') || ''}"
          value="${this.getAttribute('value') || ''}"
          ${this._checked ? 'checked' : ''}
          ${disabled ? 'disabled' : ''}
        >
        <div class="circle" part="circle"></div>
        ${label ? `<span part="label">${label}</span>` : '<slot></slot>'}
      </label>
    `;

    this.shadowRoot.querySelector('input')?.addEventListener('change', (e) => {
      if (disabled || !e.target.checked) return;
      this._checked = true;
      this.setAttribute('checked', '');
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          value: this.getAttribute('value') || '',
          name:  this.getAttribute('name')  || ''
        },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('fresh-radio', FreshRadio);
