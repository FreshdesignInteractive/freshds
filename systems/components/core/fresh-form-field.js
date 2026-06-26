/* ============================================================
   FreshDS, <fresh-form-field>

   Wraps any input component with a consistent label, hint,
   and error message layout.

   Usage:
     <fresh-form-field label="Email address" hint="We'll never share your email.">
       <fresh-input type="email" placeholder="you@company.com"></fresh-input>
     </fresh-form-field>

     <fresh-form-field label="Role" required error="Please select a role">
       <fresh-select placeholder="Choose role">…</fresh-select>
     </fresh-form-field>

   Attributes:
     label     string
     hint      string
     error     string  , shows below the control in red, overrides hint
     required  boolean , adds an asterisk to the label
   ============================================================ */

class FreshFormField extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'hint', 'error', 'required'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const label    = this.getAttribute('label')    || '';
    const hint     = this.getAttribute('hint')     || '';
    const error    = this.getAttribute('error')    || '';
    const required = this.hasAttribute('required');

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; }

        .field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .label {
          display: flex;
          align-items: baseline;
          gap: 3px;
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-primary);
          -webkit-font-smoothing: antialiased;
        }

        .required {
          color: var(--color-danger);
          font-size: var(--font-size-xs);
          line-height: 1;
        }

        .control {
          display: block;
        }

        .sub {
          font-family: var(--font-sans);
          font-size: var(--font-size-xs);
          line-height: 1.45;
          -webkit-font-smoothing: antialiased;
        }

        .sub.hint  { color: var(--text-tertiary); }
        .sub.error { color: var(--color-danger); }
      </style>

      <div class="field" part="field">
        ${label ? `
          <div class="label" part="label">
            ${label}${required ? '<span class="required" aria-hidden="true">*</span>' : ''}
          </div>
        ` : ''}

        <div class="control" part="control">
          <slot></slot>
        </div>

        ${error
          ? `<span class="sub error" role="alert" part="error">${error}</span>`
          : hint
            ? `<span class="sub hint" part="hint">${hint}</span>`
            : ''
        }
      </div>
    `;
  }
}

customElements.define('fresh-form-field', FreshFormField);
