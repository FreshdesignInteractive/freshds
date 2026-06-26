/* ============================================================
   FreshDS, <fresh-checkbox>

   Usage:
     <fresh-checkbox label="Remember me"></fresh-checkbox>
     <fresh-checkbox checked label="Enabled by default"></fresh-checkbox>
     <fresh-checkbox indeterminate label="Select all"></fresh-checkbox>
     <fresh-checkbox disabled label="Not available"></fresh-checkbox>

   Attributes:
     label          string
     checked        boolean
     indeterminate  boolean
     disabled       boolean
     value          string

   Events:
     change → detail: { checked: boolean, value: string }
   ============================================================ */

class FreshCheckbox extends HTMLElement {
  static get observedAttributes() {
    return ['checked', 'indeterminate', 'disabled', 'label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._checked       = false;
    this._indeterminate = false;
  }

  get checked()       { return this._checked; }
  set checked(v)      { this._checked = Boolean(v); this._render(); }

  get indeterminate() { return this._indeterminate; }
  set indeterminate(v){ this._indeterminate = Boolean(v); this._render(); }

  connectedCallback() {
    this._checked       = this.hasAttribute('checked');
    this._indeterminate = this.hasAttribute('indeterminate');
    this._render();
  }

  attributeChangedCallback(name) {
    if (name === 'checked')       this._checked       = this.hasAttribute('checked');
    if (name === 'indeterminate') this._indeterminate = this.hasAttribute('indeterminate');
    this._render();
  }

  _render() {
    const label    = this.getAttribute('label') || '';
    const disabled = this.hasAttribute('disabled');

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

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

        .box {
          position: relative;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          border-radius: 4px;
          border: 1.5px solid ${this._checked || this._indeterminate ? 'transparent' : 'var(--surface-border-strong)'};
          background: ${this._checked || this._indeterminate ? 'var(--color-interactive)' : 'var(--surface-input)'};
          display: flex;
          align-items: center;
          justify-content: center;
          transition:
            background  150ms ease,
            border-color 150ms ease,
            box-shadow  150ms ease;
        }

        .root:not(.disabled):hover .box {
          border-color: ${this._checked || this._indeterminate ? 'transparent' : 'var(--color-interactive)'};
          box-shadow: ${this._checked || this._indeterminate ? 'none' : '0 0 0 3px var(--input-focus-ring)'};
        }

        .checkmark {
          display: ${this._checked && !this._indeterminate ? 'block' : 'none'};
          pointer-events: none;
        }

        .indeterminate-bar {
          display: ${this._indeterminate ? 'block' : 'none'};
          width: 8px;
          height: 1.5px;
          background: var(--text-inverse);
          border-radius: 1px;
        }

        /* Focus ring via hidden native input */
        input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
          margin: 0;
        }

        input:focus-visible ~ .box {
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
          type="checkbox"
          ${this._checked ? 'checked' : ''}
          ${disabled ? 'disabled' : ''}
          tabindex="0"
        >
        <div class="box" part="box">
          <svg class="checkmark" width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 3.5L3.5 6L8 1" stroke="var(--text-inverse)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="indeterminate-bar"></div>
        </div>
        ${label ? `<span class="label" part="label">${label}</span>` : '<slot></slot>'}
      </label>
    `;

    this.shadowRoot.querySelector('input')?.addEventListener('change', (e) => {
      if (disabled) return;
      this._checked       = e.target.checked;
      this._indeterminate = false;
      if (this._checked) {
        this.setAttribute('checked', '');
      } else {
        this.removeAttribute('checked');
      }
      this.removeAttribute('indeterminate');
      this.dispatchEvent(new CustomEvent('change', {
        detail: { checked: this._checked, value: this.getAttribute('value') || '' },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('fresh-checkbox', FreshCheckbox);
