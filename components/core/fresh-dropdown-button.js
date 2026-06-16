/* ============================================================
   FreshDS, <fresh-dropdown-button>  (Split / Menu button)

   Industry term: "split button" when the label and arrow are
   independently clickable; "dropdown button" / "menu button"
   (W3C ARIA) when the whole control opens the menu.

   Usage:
     <fresh-dropdown-button label="Export">
       <option value="csv">Export as CSV</option>
       <option value="pdf">Export as PDF</option>
       <option value="png">Export as PNG</option>
     </fresh-dropdown-button>

     <fresh-dropdown-button label="Actions" variant="secondary" size="sm">
       <option value="edit">Edit</option>
       <option value="duplicate">Duplicate</option>
       <option value="delete" class="danger">Delete</option>
     </fresh-dropdown-button>

   Attributes:
     label     string                                  (default: "Options")
     variant   primary | secondary | ghost | danger    (default: primary)
     size      sm | md | lg                            (default: md)
     disabled  boolean

   Events:
     select  → e.detail.value, e.detail.label
   ============================================================ */

class FreshDropdownButton extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'variant', 'size', 'disabled', 'split', 'items'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = false;
    this._onDocClick = this._onDocClick.bind(this);
  }

  connectedCallback() {
    // Defer so light-DOM children (<option> elements) are parsed before we read them
    Promise.resolve().then(() => { this._render(); this._bindEvents(); });
  }
  attributeChangedCallback() { this._render(); this._bindEvents(); }
  disconnectedCallback() { document.removeEventListener('click', this._onDocClick); this._close(); }

  _items() {
    const json = this.getAttribute('items');
    if (json) {
      try {
        return JSON.parse(json).map(i => ({
          value:     i.value     || '',
          label:     i.label     || '',
          desc:      i.desc      || '',
          separator: !!i.separator,
          danger:    !!i.danger,
          disabled:  !!i.disabled,
        }));
      } catch (e) {}
    }
    return Array.from(this.querySelectorAll('option')).map(o => ({
      value:     o.value,
      label:     o.textContent.trim(),
      desc:      o.dataset.desc || o.getAttribute('data-desc') || '',
      separator: o.hasAttribute('data-separator'),
      danger:    o.classList.contains('danger'),
      disabled:  o.disabled,
    }));
  }

  _render() {
    const variant  = this.getAttribute('variant')  || 'primary';
    const size     = this.getAttribute('size')     || 'md';
    const label    = this.getAttribute('label')    || 'Options';
    const disabled = this.hasAttribute('disabled');
    const split    = this.hasAttribute('split');

    const heights  = { sm: '28px', md: '34px', lg: '40px' };
    const pads     = { sm: '10px', md: '14px', lg: '18px' };
    const fsize    = { sm: '12px', md: '13px', lg: '14px' };
    const radius   = { sm: 'calc(var(--radius-md) - 2px)', md: 'var(--radius-md)', lg: 'var(--radius-md)' };
    const iconSize = { sm: '14px', md: '15px', lg: '16px' };
    const divW     = { sm: '28px', md: '34px', lg: '40px' };

    const items = this._items();

    const menuItems = items.map(item => {
      if (item.separator) return `<div class="menu-sep" role="separator"></div>`;
      return `
        <button
          class="menu-item${item.danger ? ' danger' : ''}${item.disabled ? ' disabled' : ''}${item.desc ? ' has-desc' : ''}"
          data-value="${item.value}"
          ${item.disabled ? 'disabled' : ''}
          role="menuitem"
        >
          <span class="menu-item-label">${item.label}</span>
          ${item.desc ? `<span class="menu-item-desc">${item.desc}</span>` : ''}
        </button>`;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host {
          display: inline-flex;
          vertical-align: middle;
          position: relative;
        }

        /* ── Shared base ── */
        .btn-base {
          all: unset;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          font-weight: 500;
          font-size: ${fsize[size]};
          letter-spacing: -0.01em;
          white-space: nowrap;
          cursor: pointer;
          height: ${heights[size]};
          border: 1px solid transparent;
          -webkit-font-smoothing: antialiased;
          transition:
            background-color 120ms ease,
            border-color     120ms ease,
            box-shadow       120ms ease,
            color            120ms ease,
            transform         80ms ease;
        }

        /* ── Label half ── */
        .btn-label {
          padding: 0 ${pads[size]};
          border-radius: ${radius[size]} 0 0 ${radius[size]};
          border-right: none !important;
          gap: 6px;
        }

        /* ── Arrow half (split mode only) ── */
        .btn-arrow {
          width: ${divW[size]};
          border-radius: 0 ${radius[size]} ${radius[size]} 0;
          border-left: none !important;
          flex-shrink: 0;
        }

        /* ── Single-button (dropdown) mode ── */
        .btn-full {
          padding: 0;
          border-radius: ${radius[size]};
          gap: 0;
        }
        .btn-full-label {
          flex: 1;
          white-space: nowrap;
          padding: 0 ${pads[size]};
        }
        .btn-full .chevron {
          width: ${divW[size]};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .chevron {
          width: ${iconSize[size]};
          height: ${iconSize[size]};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 150ms ease;
        }
        :host(.is-open) .chevron { transform: rotate(180deg); }

        /* ── Divider between halves ── */
        .divider {
          width: 1px;
          align-self: stretch;
          flex-shrink: 0;
        }

        /* ── Primary ── */
        .variant-primary {
          background: var(--btn-primary-bg);
          color:      var(--btn-primary-text);
        }
        .variant-primary:hover  { background: var(--btn-primary-hover); box-shadow: 0 1px 3px rgba(0,0,0,.18); }
        .variant-primary:active { transform: scale(0.985); box-shadow: none; }
        .divider-primary { background: color-mix(in srgb, var(--btn-primary-text) 30%, transparent); }

        /* ── Secondary ── */
        .variant-secondary {
          background:   transparent;
          color:        var(--btn-secondary-text);
          border-color: var(--btn-secondary-border);
        }
        .variant-secondary:hover  { background: var(--badge-primary-bg); }
        .variant-secondary:active { transform: scale(0.985); }
        .divider-secondary { background: var(--btn-secondary-border); }

        /* ── Ghost ── */
        .variant-ghost {
          background:   transparent;
          color:        var(--text-secondary);
          border-color: transparent;
        }
        .variant-ghost:hover  { background: var(--surface-overlay); color: var(--text-primary); }
        .variant-ghost:active { transform: scale(0.985); }
        .divider-ghost { background: var(--surface-border-strong); }

        /* ── Danger ── */
        .variant-danger {
          background:   var(--btn-danger-bg);
          color:        var(--color-danger);
          border-color: var(--btn-danger-border);
        }
        .variant-danger:hover  { background: var(--btn-danger-hover); border-color: var(--color-danger-border); }
        .variant-danger:active { transform: scale(0.985); }
        .divider-danger { background: var(--btn-danger-border); }

        /* ── Disabled ── */
        :host([disabled]) .btn-base {
          opacity: 0.38;
          cursor:  not-allowed;
          pointer-events: none;
        }

        /* ── Focus ring ── */
        .btn-base:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 2px var(--surface-canvas),
            0 0 0 4px var(--color-interactive);
          z-index: 1;
        }

        /* ── Dropdown menu ── */
        .menu {
          display: none;
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          min-width: max(100%, 220px);
          width: max-content;
          background: var(--surface-input);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-md);
          box-shadow: 0 4px 16px rgba(0,0,0,.12), 0 1px 4px rgba(0,0,0,.08);
          padding: 4px;
          z-index: 1000;
          animation: menu-in 120ms ease;
        }
        .menu.open { display: block; }

        @keyframes menu-in {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        .menu-item {
          all: unset;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          padding: 6px 10px;
          font-family: var(--font-sans);
          border-radius: calc(var(--radius-md) - 2px);
          cursor: pointer;
          -webkit-font-smoothing: antialiased;
          transition: background 100ms ease;
          box-sizing: border-box;
        }
        .menu-item.has-desc {
          padding: 10px 14px;
        }
        .menu-item:hover    { background: var(--surface-subtle); }
        .menu-item:active   { background: var(--surface-overlay); }
        .menu-item.danger .menu-item-label { color: var(--color-danger); }
        .menu-item.danger:hover { background: var(--color-danger-subtle); }
        .menu-item.disabled { opacity: 0.38; cursor: not-allowed; pointer-events: none; }

        .menu-item-label {
          font-size: ${fsize[size]};
          font-weight: 500;
          color: var(--text-primary);
          white-space: nowrap;
          line-height: 1.4;
        }
        .has-desc .menu-item-label {
          font-weight: 600;
        }
        .menu-item-desc {
          font-size: var(--font-size-sm);
          font-weight: 400;
          color: var(--text-secondary);
          white-space: normal;
          line-height: 1.4;
          margin-top: 2px;
          max-width: 260px;
        }
        .menu-sep {
          height: 1px;
          background: var(--surface-border);
          margin: 6px 0;
        }
      </style>

      ${split ? `
        <button class="btn-base btn-label variant-${variant}" part="label" ${disabled ? 'disabled' : ''}>
          ${label}
        </button>
        <span class="divider divider-${variant}"></span>
        <button class="btn-base btn-arrow variant-${variant}" part="arrow" aria-haspopup="menu" aria-expanded="false" ${disabled ? 'disabled' : ''}>
          <span class="chevron">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
      ` : `
        <button class="btn-base btn-full variant-${variant}" part="button" aria-haspopup="menu" aria-expanded="false" ${disabled ? 'disabled' : ''}>
          <span class="btn-full-label">${label}</span>
          <span class="divider divider-${variant}"></span>
          <span class="chevron">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
      `}

      <div class="menu" role="menu">${menuItems}</div>
    `;
  }

  _bindEvents() {
    const menu = this.shadowRoot.querySelector('.menu');
    if (!menu) return;

    // Dropdown mode: single button opens menu
    const full = this.shadowRoot.querySelector('.btn-full');
    if (full) {
      full.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggle();
      });
    }

    // Split mode: arrow opens menu, label fires action
    const arrow = this.shadowRoot.querySelector('.btn-arrow');
    if (arrow) {
      arrow.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggle();
      });
    }
    const label = this.shadowRoot.querySelector('.btn-label');
    if (label) {
      label.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('action', { bubbles: true, composed: true }));
      });
    }

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.menu-item');
      if (!item || item.disabled) return;
      this.dispatchEvent(new CustomEvent('select', {
        detail: { value: item.dataset.value, label: item.textContent.trim() },
        bubbles: true,
        composed: true,
      }));
      this._close();
    });
  }

  _toggle() {
    this._open ? this._close() : this._openMenu();
  }

  _openMenu() {
    this._open = true;
    this.classList.add('is-open');
    const menu = this.shadowRoot.querySelector('.menu');
    const trigger = this.shadowRoot.querySelector('.btn-arrow, .btn-full');
    if (menu) {
      menu.style.left  = '0';
      menu.style.right = 'auto';
      menu.classList.add('open');
      const rect = menu.getBoundingClientRect();
      if (rect.right > window.innerWidth - 8) {
        menu.style.left  = 'auto';
        menu.style.right = '0';
      }
    }
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', this._onDocClick);
  }

  _close() {
    this._open = false;
    this.classList.remove('is-open');
    const menu = this.shadowRoot.querySelector('.menu');
    const trigger = this.shadowRoot.querySelector('.btn-arrow, .btn-full');
    if (menu) {
      menu.classList.remove('open');
      menu.style.left  = '';
      menu.style.right = '';
    }
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', this._onDocClick);
  }

  _onDocClick(e) {
    if (!this.contains(e.target)) this._close();
  }
}

customElements.define('fresh-dropdown-button', FreshDropdownButton);
