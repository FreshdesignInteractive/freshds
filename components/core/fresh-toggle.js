/* ============================================================
   FreshDS, <fresh-toggle>

   Usage:
     <fresh-toggle label="Dark mode"></fresh-toggle>
     <fresh-toggle checked label="Notifications on"></fresh-toggle>
     <fresh-toggle size="sm" checked></fresh-toggle>
     <fresh-toggle disabled label="Managed by admin"></fresh-toggle>

   Attributes:
     label    string
     checked  boolean
     disabled boolean
     size     sm | md | lg   (default: md)

   Events:
     change → detail: { checked: boolean }
   ============================================================ */

class FreshToggle extends HTMLElement {
  static get observedAttributes() {
    return ['checked', 'disabled', 'label', 'size'];
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
    const size     = this.getAttribute('size')  || 'md';
    const disabled = this.hasAttribute('disabled');

    /* Track and thumb dimensions */
    const tracks = { sm: { w: '28px', h: '16px' }, md: { w: '36px', h: '20px' }, lg: { w: '44px', h: '24px' } };
    const thumbs = { sm: '10px', md: '14px', lg: '18px' };
    const fsize  = { sm: '12px', md: '13px', lg: '14px' };
    const t      = tracks[size];
    const thumb  = thumbs[size];
    const pad    = '3px';

    /* How far the thumb travels */
    const travel = `calc(${t.w} - ${thumb} - ${pad} * 2 - 2px)`;

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: inline-flex; }

        .root {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          opacity: ${disabled ? '0.4' : '1'};
          user-select: none;
          -webkit-font-smoothing: antialiased;
        }

        input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .track {
          position: relative;
          width: ${t.w};
          height: ${t.h};
          border-radius: 9999px;
          background: ${this._checked ? 'var(--color-interactive)' : 'var(--surface-overlay)'};
          border: 1px solid ${this._checked ? 'transparent' : 'var(--surface-border-strong)'};
          transition:
            background  200ms ease,
            border-color 200ms ease;
          flex-shrink: 0;
        }

        .root:not(.disabled):hover .track {
          ${!this._checked ? 'border-color: var(--text-tertiary);' : ''}
        }

        .thumb {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: ${this._checked ? `calc(${pad} + ${travel})` : pad};
          width: ${thumb};
          height: ${thumb};
          border-radius: 50%;
          background: ${this._checked ? 'var(--text-inverse)' : 'var(--text-tertiary)'};
          transition:
            left        200ms ease,
            background  200ms ease,
            transform   200ms ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
        }

        input:focus-visible ~ .track {
          box-shadow:
            0 0 0 2px var(--surface-bg),
            0 0 0 4px var(--color-interactive);
        }

        .label-text {
          font-family: var(--font-sans);
          font-size: ${fsize[size]};
          color: var(--text-secondary);
          line-height: 1;
        }
      </style>

      <label class="root ${disabled ? 'disabled' : ''}">
        <input
          type="checkbox"
          role="switch"
          ${this._checked ? 'checked' : ''}
          ${disabled ? 'disabled' : ''}
          aria-checked="${this._checked}"
        >
        <div class="track" part="track">
          <div class="thumb" part="thumb"></div>
        </div>
        ${label ? `<span class="label-text" part="label">${label}</span>` : '<slot></slot>'}
      </label>
    `;

    this.shadowRoot.querySelector('input')?.addEventListener('change', (e) => {
      if (disabled) return;
      this._checked = e.target.checked;
      if (this._checked) {
        this.setAttribute('checked', '');
      } else {
        this.removeAttribute('checked');
      }
      this.dispatchEvent(new CustomEvent('change', {
        detail: { checked: this._checked },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('fresh-toggle', FreshToggle);
