/* ============================================================
   FreshDS, <fresh-toast> + FreshToast.show()

   Programmatic usage (recommended):
     FreshToast.show('Changes saved')
     FreshToast.show('Upload failed', { variant: 'danger', duration: 5000 })
     FreshToast.show('Processing…',   { variant: 'info',  duration: 0 })  ← persistent

   Declarative:
     <fresh-toast message="Done!" variant="success"></fresh-toast>

   Options:
     message   string
     variant   info | success | warning | danger   (default: info)
     duration  ms, 0 = persistent                  (default: 4000)
   ============================================================ */

class FreshToast extends HTMLElement {
  static get observedAttributes() { return ['message', 'variant', 'duration']; }

  /* ── Static API ── */
  static show(message, opts = {}) {
    const { variant = 'info', duration = 4000 } = opts;
    const toast = document.createElement('fresh-toast');
    toast.setAttribute('message', message);
    toast.setAttribute('variant', variant);
    toast._duration = duration;
    FreshToast._container().appendChild(toast);
    return toast;
  }

  static _container() {
    let c = document.getElementById('fresh-toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'fresh-toast-container';
      Object.assign(c.style, {
        position:      'fixed',
        bottom:        '24px',
        right:         '24px',
        zIndex:        '9999',
        display:       'flex',
        flexDirection: 'column',
        gap:           '10px',
        alignItems:    'flex-end',
        pointerEvents: 'none',
      });
      document.body.appendChild(c);
    }
    return c;
  }

  /* ── Instance ── */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._duration = 4000;
  }

  connectedCallback() {
    const attr = this.getAttribute('duration');
    if (attr !== null) this._duration = parseInt(attr, 10);
    this._render();
    if (this._duration > 0) {
      this._timer = setTimeout(() => this._dismiss(), this._duration);
    }
  }

  attributeChangedCallback() {
    if (this.isConnected) this._render();
  }

  _dismiss() {
    clearTimeout(this._timer);
    const el = this.shadowRoot.querySelector('.toast');
    if (el) {
      el.style.animation = 'slide-out 200ms ease forwards';
      setTimeout(() => this.remove(), 200);
    } else {
      this.remove();
    }
  }

  _render() {
    const message = this.getAttribute('message') || '';
    const variant = this.getAttribute('variant') || 'info';

    const cfg = {
      info:    { accent: 'var(--color-info)',         icon: this._iconInfo()    },
      success: { accent: 'var(--color-success)',     icon: this._iconSuccess() },
      warning: { accent: 'var(--color-warning)',     icon: this._iconWarning() },
      danger:  { accent: 'var(--color-danger)',      icon: this._iconDanger()  },
    };

    const c = cfg[variant] || cfg.info;

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host {
          display: block;
          pointer-events: all;
        }

        .toast {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          min-width: 300px;
          max-width: 420px;
          padding: 12px 14px;
          border-radius: var(--radius-lg);
          background: var(--surface-bg);
          border: 1px solid var(--surface-border-strong);
          box-shadow: var(--elev-3);
          -webkit-font-smoothing: antialiased;
          animation: slide-in 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .icon {
          color: ${c.accent};
          flex-shrink: 0;
          line-height: 0;
          margin-top: 1px;
        }

        .message {
          flex: 1;
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          color: var(--text-primary);
          line-height: 1.5;
        }

        .close {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 4px;
          color: var(--text-tertiary);
          cursor: pointer;
          flex-shrink: 0;
          transition: background 120ms ease, color 120ms ease;
        }
        .close:hover { background: var(--surface-overlay); color: var(--text-primary); }

        @keyframes slide-in {
          from { opacity: 0; transform: translateX(12px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slide-out {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to   { opacity: 0; transform: translateX(12px) scale(0.96); }
        }
      </style>

      <div class="toast" role="status" aria-live="polite" part="toast">
        <span class="icon" aria-hidden="true">${c.icon}</span>
        <span class="message">${message}</span>
        <button class="close" aria-label="Dismiss">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `;

    this.shadowRoot.querySelector('.close')?.addEventListener('click', () => this._dismiss());
  }

  _iconInfo() {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
      <rect x="7.25" y="6.5" width="1.5" height="5" rx=".75" fill="currentColor"/>
      <circle cx="8" cy="4.5" r=".875" fill="currentColor"/>
    </svg>`;
  }

  _iconSuccess() {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M5 8l2.3 2.3L11 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  _iconWarning() {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.5l5.8 10H2.2L8 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="7.25" y="6.5" width="1.5" height="3.5" rx=".75" fill="currentColor"/>
      <circle cx="8" cy="11.5" r=".875" fill="currentColor"/>
    </svg>`;
  }

  _iconDanger() {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;
  }
}

customElements.define('fresh-toast', FreshToast);
