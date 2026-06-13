/* ============================================================
   FreshDS, <fresh-alert>

   Usage:
     <fresh-alert variant="info" title="New version available">
       Refresh the page to get the latest features.
     </fresh-alert>

     <fresh-alert variant="success" dismissible>
       Your changes have been saved.
     </fresh-alert>

     <fresh-alert variant="warning" title="Rate limit approaching">
       You have used 90% of your monthly quota.
     </fresh-alert>

     <fresh-alert variant="danger" title="Deployment failed" dismissible>
       Build error on line 42. Check logs for details.
     </fresh-alert>

   Attributes:
     variant     info | success | warning | danger   (default: info)
     title       string
     dismissible boolean

   Events:
     dismiss, fired when the close button is clicked
   ============================================================ */

class FreshAlert extends HTMLElement {
  static get observedAttributes() { return ['variant', 'title', 'dismissible']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const variant     = this.getAttribute('variant')  || 'info';
    const title       = this.getAttribute('title')    || '';
    const dismissible = this.hasAttribute('dismissible');

    const cfg = {
      info:    { accent: 'var(--color-info)',         bg: 'var(--color-info-subtle)',         border: 'var(--color-info-border)',         icon: this._iconInfo(),    label: 'Info' },
      success: { accent: 'var(--color-success)',     bg: 'var(--color-success-subtle)',      border: 'var(--color-success-border)',     icon: this._iconSuccess(), label: 'Success' },
      warning: { accent: 'var(--color-warning)',     bg: 'var(--color-warning-subtle)',      border: 'var(--color-warning-border)',     icon: this._iconWarning(), label: 'Warning' },
      danger:  { accent: 'var(--color-danger)',      bg: 'var(--color-danger-subtle)',       border: 'var(--color-danger-border)',      icon: this._iconDanger(),  label: 'Error' },
    };

    const c = cfg[variant] || cfg.info;

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; }

        .alert {
          display: flex;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-lg);
          border: 1px solid ${c.border};
          background: ${c.bg};
          border-left: 3px solid ${c.accent};
          -webkit-font-smoothing: antialiased;
        }

        .alert.no-title {
          align-items: center;
        }

        .icon {
          color: ${c.accent};
          flex-shrink: 0;
          margin-top: ${title ? '1px' : '0'};
          line-height: 0;
        }

        .body { flex: 1; min-width: 0; }

        .title {
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1px;
          line-height: 1.3;
        }

        .message {
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          color: var(--text-secondary);
          line-height: 1.55;
        }

        .message ::slotted(*) { margin: 0; }

        .dismiss {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: var(--radius-sm);
          color: var(--text-tertiary);
          cursor: pointer;
          flex-shrink: 0;
          margin-top: -2px;
          margin-right: -4px;
          transition: background 120ms ease, color 120ms ease;
        }
        .dismiss:hover { background: var(--surface-overlay); color: var(--text-primary); }
      </style>

      <div class="alert${title ? '' : ' no-title'}" role="alert" aria-label="${c.label}" part="alert">
        <span class="icon" aria-hidden="true">${c.icon}</span>

        <div class="body">
          ${title ? `<div class="title">${title}</div>` : ''}
          <div class="message"><slot></slot></div>
        </div>

        ${dismissible ? `
          <button class="dismiss" aria-label="Dismiss">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        ` : ''}
      </div>
    `;

    this.shadowRoot.querySelector('.dismiss')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
      this.remove();
    });
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

customElements.define('fresh-alert', FreshAlert);
