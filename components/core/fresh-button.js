/* ============================================================
   FreshDS — <fresh-button>

   Usage:
     <fresh-button>Save changes</fresh-button>
     <fresh-button variant="secondary">Cancel</fresh-button>
     <fresh-button variant="ghost" size="sm">Learn more</fresh-button>
     <fresh-button variant="danger">Delete</fresh-button>
     <fresh-button loading>Saving…</fresh-button>
     <fresh-button disabled>Unavailable</fresh-button>
     <fresh-button icon-only aria-label="Settings">⚙</fresh-button>

   Attributes:
     variant   primary | secondary | ghost | danger   (default: primary)
     size      sm | md | lg                           (default: md)
     disabled  boolean
     loading   boolean
     icon-only boolean — square proportions, centered content
   ============================================================ */

class FreshButton extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'loading', 'icon-only'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const variant  = this.getAttribute('variant')  || 'primary';
    const size     = this.getAttribute('size')     || 'md';
    const disabled = this.hasAttribute('disabled');
    const loading  = this.hasAttribute('loading');
    const iconOnly = this.hasAttribute('icon-only');

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host {
          display: inline-flex;
          vertical-align: middle;
        }

        /* ── Base button reset + shared styles ── */
        button {
          all: unset;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          font-weight: 500;
          letter-spacing: -0.01em;
          white-space: nowrap;
          cursor: pointer;
          border: 1px solid transparent;
          position: relative;
          -webkit-font-smoothing: antialiased;
          transition:
            background-color 120ms ease,
            border-color     120ms ease,
            box-shadow       120ms ease,
            color            120ms ease,
            transform         80ms ease;
        }

        /* ── Sizes ── */
        button.size-sm {
          height: 28px;
          padding: 0 10px;
          font-size: var(--font-size-sm);
          gap: 5px;
          border-radius: calc(var(--radius-md) - 2px);
        }

        button.size-md {
          height: 34px;
          padding: 0 14px;
          font-size: var(--font-size-md);
          gap: 6px;
          border-radius: var(--radius-md);
        }

        button.size-lg {
          height: 40px;
          padding: 0 18px;
          font-size: var(--font-size-lg);
          gap: 7px;
          border-radius: var(--radius-md);
        }

        /* ── Icon-only: square ── */
        button.icon-only { padding: 0; }
        button.icon-only.size-sm { width: 28px; }
        button.icon-only.size-md { width: 34px; }
        button.icon-only.size-lg { width: 40px; }

        /* ── Primary ── */
        button.variant-primary {
          background: var(--btn-primary-bg);
          color:      var(--btn-primary-text);
          border-color: transparent;
        }
        button.variant-primary:hover {
          background: var(--btn-primary-hover);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18), 0 1px 2px rgba(0, 0, 0, 0.12);
        }
        button.variant-primary:active {
          transform: scale(0.985);
          box-shadow: none;
        }

        /* ── Secondary ── */
        button.variant-secondary {
          background:   transparent;
          color:        var(--btn-secondary-text);
          border-color: var(--btn-secondary-border);
        }
        button.variant-secondary:hover {
          background: var(--badge-primary-bg);
        }
        button.variant-secondary:active {
          transform: scale(0.985);
        }

        /* ── Ghost ── */
        button.variant-ghost {
          background:   transparent;
          color:        var(--text-secondary);
          border-color: transparent;
        }
        button.variant-ghost:hover {
          background: var(--surface-overlay);
          color:      var(--text-primary);
        }
        button.variant-ghost:active {
          transform: scale(0.985);
        }

        /* ── Danger ── */
        button.variant-danger {
          background:   var(--btn-danger-bg);
          color:        var(--color-danger);
          border-color: var(--btn-danger-border);
        }
        button.variant-danger:hover {
          background:   var(--btn-danger-hover);
          border-color: var(--color-danger-border);
        }
        button.variant-danger:active {
          transform: scale(0.985);
        }

        /* ── Disabled ── */
        button:disabled,
        :host([disabled]) button {
          opacity: 0.38;
          cursor:  not-allowed;
          pointer-events: none;
          transform: none !important;
          box-shadow: none !important;
        }

        /* ── Loading ── */
        button.is-loading {
          cursor: wait;
          pointer-events: none;
        }

        .spinner {
          width:  13px;
          height: 13px;
          border: 1.5px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          flex-shrink: 0;
          opacity: 0.75;
          animation: fresh-spin 550ms linear infinite;
        }
        button.size-sm .spinner { width: 11px; height: 11px; }
        button.size-lg .spinner { width: 15px; height: 15px; }

        @keyframes fresh-spin {
          to { transform: rotate(360deg); }
        }

        /* ── Focus ring — double-ring style (macOS / Linear) ── */
        button:focus-visible {
          outline: none;
          box-shadow:
            0 0 0 2px var(--surface-bg),
            0 0 0 4px var(--color-interactive);
        }
      </style>

      <button
        class="variant-${variant} size-${size}${iconOnly ? ' icon-only' : ''}${loading ? ' is-loading' : ''}"
        ${disabled || loading ? 'disabled' : ''}
        part="button"
        aria-disabled="${disabled || loading ? 'true' : 'false'}"
        ${loading ? 'aria-busy="true"' : ''}
      >${loading ? '<span class="spinner" aria-hidden="true"></span>' : ''}<slot></slot></button>
    `;
  }
}

customElements.define('fresh-button', FreshButton);
