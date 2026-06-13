/* ============================================================
   FreshDS, <fresh-input>

   Usage:
     <fresh-input placeholder="Search…"></fresh-input>
     <fresh-input type="email" size="lg" placeholder="you@company.com"></fresh-input>
     <fresh-input icon="ti-search" placeholder="Search components…"></fresh-input>
     <fresh-input error="Required field" placeholder="Name"></fresh-input>
     <fresh-input disabled placeholder="Not editable"></fresh-input>

   Attributes:
     type         text | email | password | number | search  (default: text)
     placeholder  string
     value        string
     size         sm | md | lg                               (default: md)
     icon         tabler icon class e.g. "ti-search"
     error        string, error message, triggers error styling
     disabled     boolean
     readonly     boolean
     clearable    boolean, shows an × button when the field has a value
   ============================================================ */

class FreshInput extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'placeholder', 'value', 'size', 'icon', 'error', 'disabled', 'readonly', 'clearable'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
  }

  get value() {
    return this.shadowRoot.querySelector('input')?.value ?? '';
  }
  set value(v) {
    const input = this.shadowRoot.querySelector('input');
    if (input) input.value = v;
  }

  connectedCallback() {
    this._render();
    this._bindEvents();
  }

  attributeChangedCallback(name) {
    if (!this.shadowRoot.querySelector('input')) return;
    const input = this.shadowRoot.querySelector('input');
    const wrap  = this.shadowRoot.querySelector('.wrap');

    switch (name) {
      case 'disabled':     input.disabled  = this.hasAttribute('disabled'); break;
      case 'readonly':     input.readOnly  = this.hasAttribute('readonly'); break;
      case 'placeholder':  input.placeholder = this.getAttribute('placeholder') || ''; break;
      case 'type':         input.type      = this.getAttribute('type') || 'text'; break;
      case 'error':
      case 'size':
        this._rerender();
        break;
    }
  }

  _rerender() {
    const prev = this.shadowRoot.querySelector('input')?.value;
    this._render();
    this._bindEvents();
    if (prev !== undefined) this.shadowRoot.querySelector('input').value = prev;
  }

  _render() {
    const type     = this.getAttribute('type')        || 'text';
    const ph       = this.getAttribute('placeholder') || '';
    const size     = this.getAttribute('size')        || 'md';
    const icon     = this.getAttribute('icon')        || '';
    const error    = this.getAttribute('error')       || '';
    const disabled  = this.hasAttribute('disabled');
    const readonly  = this.hasAttribute('readonly');
    const clearable = this.hasAttribute('clearable');
    const val       = this.getAttribute('value')       || '';

    const heights = { sm: '28px', md: '34px', lg: '40px' };
    const pads    = { sm: '9px',  md: '11px', lg: '13px' };
    const fsize   = { sm: 'var(--font-size-sm)', md: 'var(--font-size-md)', lg: 'var(--font-size-lg)' };
    const radius  = { sm: 'calc(var(--radius-md) - 2px)', md: 'var(--radius-md)', lg: 'var(--radius-md)' };

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; width: 100%; }

        .wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .icon {
          position: absolute;
          left: ${size === 'sm' ? '8px' : '10px'};
          font-size: ${size === 'sm' ? 'var(--font-size-md)' : 'var(--font-size-xl)'};
          color: var(--text-tertiary);
          pointer-events: none;
          line-height: 1;
          top: 50%;
          transform: translateY(-50%);
          transition: color 150ms ease;
        }

        .clear-btn {
          position: absolute;
          right: ${size === 'sm' ? '6px' : '8px'};
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${size === 'sm' ? '16px' : '18px'};
          height: ${size === 'sm' ? '16px' : '18px'};
          border-radius: 50%;
          background: transparent;
          color: var(--text-tertiary);
          cursor: pointer;
          border: none;
          padding: 0;
          opacity: 0;
          pointer-events: none;
          transition: opacity 100ms ease, background 100ms ease, color 100ms ease;
          flex-shrink: 0;
        }
        .clear-btn.visible {
          opacity: 1;
          pointer-events: auto;
        }
        .clear-btn:hover {
          background: var(--surface-overlay);
          color: var(--text-primary);
        }

        input {
          all: unset;
          display: block;
          width: 100%;
          height: ${heights[size]};
          padding: 0 ${clearable ? (size === 'sm' ? '26px' : '30px') : pads[size]};
          padding-left: ${icon ? (size === 'sm' ? '26px' : '32px') : pads[size]};
          font-family: var(--font-sans);
          font-size: ${fsize[size]};
          color: var(--text-primary);
          background: var(--surface-input);
          border: 1px solid ${error ? 'var(--color-danger-border)' : 'var(--surface-border-strong)'};
          border-radius: ${radius[size]};
          transition:
            border-color 150ms ease,
            box-shadow   150ms ease;
          -webkit-font-smoothing: antialiased;
        }

        input::placeholder { color: var(--text-tertiary); }

        input:hover:not(:disabled):not(:read-only) {
          border-color: ${error ? 'var(--color-danger)' : 'var(--text-tertiary)'};
        }

        input:focus {
          border-color: ${error ? 'var(--color-danger)' : 'var(--input-focus-border)'};
          box-shadow: 0 0 0 3px ${error ? 'var(--color-danger-subtle)' : 'var(--input-focus-ring)'};
          outline: none;
        }

        input:focus ~ .icon,
        .wrap:focus-within .icon {
          color: ${error ? 'var(--color-danger)' : 'var(--color-interactive-text)'};
        }

        input:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: var(--surface-subtle);
        }

        input:read-only {
          background: var(--surface-subtle);
          cursor: default;
        }

        .error-msg {
          margin-top: 5px;
          font-family: var(--font-sans);
          font-size: var(--font-size-xs);
          color: var(--color-danger);
          display: flex;
          align-items: center;
          gap: 4px;
        }
      </style>

      <div class="wrap">
        ${icon ? `<i class="ti ${icon} icon" aria-hidden="true"></i>` : ''}
        <input
          type="${type}"
          placeholder="${ph}"
          value="${val}"
          ${disabled ? 'disabled' : ''}
          ${readonly ? 'readonly' : ''}
          part="input"
        >
        ${clearable ? `<button class="clear-btn${val ? ' visible' : ''}" aria-label="Clear" tabindex="-1">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>` : ''}
      </div>
      ${error ? `<div class="error-msg" role="alert">${error}</div>` : ''}
    `;
  }

  _bindEvents() {
    const input    = this.shadowRoot.querySelector('input');
    const clearBtn = this.shadowRoot.querySelector('.clear-btn');
    if (!input) return;

    ['input', 'change', 'focus', 'blur'].forEach(ev => {
      input.addEventListener(ev, (e) => {
        if (clearBtn) clearBtn.classList.toggle('visible', input.value.length > 0);
        this.dispatchEvent(new CustomEvent(ev, {
          detail: { value: input.value },
          bubbles: true,
          composed: true
        }));
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        clearBtn.classList.remove('visible');
        input.focus();
        ['input', 'change'].forEach(ev => {
          this.dispatchEvent(new CustomEvent(ev, {
            detail: { value: '' },
            bubbles: true,
            composed: true
          }));
        });
      });
    }
  }
}

customElements.define('fresh-input', FreshInput);
