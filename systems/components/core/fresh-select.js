/* ============================================================
   FreshDS, <fresh-select>

   Usage:
     <fresh-select placeholder="Choose a role">
       <option value="admin">Admin</option>
       <option value="editor">Editor</option>
       <option value="viewer">Viewer</option>
     </fresh-select>

     <fresh-select size="lg" value="editor">…</fresh-select>
     <fresh-select error="Required" placeholder="Pick one">…</fresh-select>

   Attributes:
     placeholder  string, shown when no value selected
     value        string, selected option value
     size         sm | md | lg   (default: md)
     error        string, error message
     disabled     boolean
   ============================================================ */

class FreshSelect extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'size', 'error', 'disabled', 'placeholder'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
  }

  get value() {
    return this.shadowRoot.querySelector('select')?.value ?? '';
  }
  set value(v) {
    const sel = this.shadowRoot.querySelector('select');
    if (sel) sel.value = v;
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    if (!this.shadowRoot.querySelector('select')) return;
    const prev = this.shadowRoot.querySelector('select')?.value;
    this._render();
    if (prev) {
      const sel = this.shadowRoot.querySelector('select');
      if (sel) sel.value = prev;
    }
  }

  _render() {
    const size     = this.getAttribute('size')        || 'md';
    const error    = this.getAttribute('error')       || '';
    const ph       = this.getAttribute('placeholder') || '';
    const val      = this.getAttribute('value')       || '';
    const disabled = this.hasAttribute('disabled');

    const heights = { sm: '28px', md: '34px', lg: '40px' };
    const pads    = { sm: '9px',  md: '11px', lg: '13px' };
    const fsize   = { sm: '12px', md: '13px', lg: '14px' };
    const radius  = { sm: 'calc(var(--radius-md) - 2px)', md: 'var(--radius-md)', lg: 'var(--radius-md)' };
    const arrowSz = { sm: '13px', md: '14px', lg: '15px' };

    /* Collect options from light DOM before replacing shadow */
    const options = Array.from(this.querySelectorAll('option')).map(o =>
      `<option value="${o.value}" ${o.value === val || o.selected ? 'selected' : ''}>${o.textContent}</option>`
    ).join('');

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; width: 100%; }

        .wrap {
          position: relative;
          width: 100%;
        }

        select {
          appearance: none;
          -webkit-appearance: none;
          display: block;
          width: 100%;
          height: ${heights[size]};
          padding: 0 ${pads[size]};
          padding-right: 32px;
          font-family: var(--font-sans);
          font-size: ${fsize[size]};
          color: var(--text-primary);
          background: var(--surface-input);
          border: 1px solid ${error ? 'var(--color-danger-border)' : 'var(--surface-border-strong)'};
          border-radius: ${radius[size]};
          cursor: pointer;
          outline: none;
          transition:
            border-color 150ms ease,
            box-shadow   150ms ease;
          -webkit-font-smoothing: antialiased;
        }

        select:hover:not(:disabled) {
          border-color: ${error ? 'var(--color-danger)' : 'var(--text-tertiary)'};
        }

        select:focus {
          border-color: ${error ? 'var(--color-danger)' : 'var(--input-focus-border)'};
          box-shadow: 0 0 0 3px ${error ? 'var(--color-danger-subtle)' : 'var(--input-focus-ring)'};
        }

        select:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: var(--surface-subtle);
        }

        /* Option styling — limited cross-browser */
        option {
          font-family: var(--font-sans);
          background: var(--surface-input);
          color: var(--text-primary);
        }

        .chevron {
          position: absolute;
          right: ${size === 'sm' ? '8px' : '10px'};
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          width: ${arrowSz[size]};
          height: ${arrowSz[size]};
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .error-msg {
          margin-top: 5px;
          font-family: var(--font-sans);
          font-size: var(--font-size-xs);
          color: var(--color-danger);
        }
      </style>

      <div class="wrap">
        <select ${disabled ? 'disabled' : ''} part="select">
          ${ph ? `<option value="" disabled ${!val ? 'selected' : ''} hidden>${ph}</option>` : ''}
          ${options}
        </select>
        <span class="chevron" aria-hidden="true">
          <svg width="${arrowSz[size]}" height="${arrowSz[size]}" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>
      ${error ? `<div class="error-msg" role="alert">${error}</div>` : ''}
    `;

    this.shadowRoot.querySelector('select')?.addEventListener('change', (e) => {
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: e.target.value },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('fresh-select', FreshSelect);
