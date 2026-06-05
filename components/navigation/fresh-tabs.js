/* ============================================================
   FreshDS — <fresh-tabs>

   Renders the tab bar. Panels are managed by the developer —
   listen to the `change` event to show/hide content.

   Usage:
     <fresh-tabs id="tabs"
       tabs='[
         {"key":"overview","label":"Overview"},
         {"key":"analytics","label":"Analytics"},
         {"key":"settings","label":"Settings","disabled":true}
       ]'
       active="overview">
     </fresh-tabs>

     <script>
       document.getElementById('tabs').addEventListener('change', e => {
         // e.detail.key — the newly active tab key
       });
     </script>

   Attributes:
     tabs    JSON array of { key, label, badge?, disabled? }
     active  string — key of the active tab
     size    sm | md | lg   (default: md)
   ============================================================ */

class FreshTabs extends HTMLElement {
  static get observedAttributes() { return ['tabs', 'active', 'size']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  get active() { return this.getAttribute('active') || ''; }

  _parseTabs() {
    try { return JSON.parse(this.getAttribute('tabs') || '[]'); }
    catch { return []; }
  }

  _select(key) {
    if (key === this.active) return;
    this.setAttribute('active', key);
    this.dispatchEvent(new CustomEvent('change', {
      detail: { key },
      bubbles: true,
      composed: true
    }));
  }

  _render() {
    const tabs   = this._parseTabs();
    const active = this.active;
    const size   = this.getAttribute('size') || 'md';

    const heights = { sm: '32px', md: '38px', lg: '44px' };
    const fsize   = { sm: '12px', md: '13px', lg: '14px' };
    const px      = { sm: '10px', md: '14px', lg: '18px' };
    const h = heights[size];

    const items = tabs.map(t => {
      const isActive   = t.key === active;
      const isDisabled = t.disabled;

      return `
        <button
          class="tab ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}"
          data-key="${t.key}"
          role="tab"
          aria-selected="${isActive}"
          ${isDisabled ? 'disabled' : ''}
          part="tab ${isActive ? 'tab-active' : ''}"
        >
          ${t.label}
          ${t.badge ? `<span class="badge">${t.badge}</span>` : ''}
        </button>
      `;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; }

        .tablist {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          border-bottom: 1px solid var(--surface-border);
          padding: 0 2px;
        }

        .tab {
          all: unset;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: ${h};
          padding: 0 ${px[size]};
          font-family: var(--font-sans);
          font-size: ${fsize[size]};
          font-weight: 500;
          color: var(--text-tertiary);
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          cursor: pointer;
          white-space: nowrap;
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          transition:
            color        150ms ease,
            border-color 150ms ease,
            background   150ms ease;
          -webkit-font-smoothing: antialiased;
          flex-shrink: 0;
        }

        .tab:hover:not(.disabled):not(.active) {
          color: var(--text-secondary);
          background: var(--surface-subtle);
        }

        .tab.active {
          color: var(--text-primary);
          border-bottom-color: var(--color-interactive-text);
        }

        .tab.disabled {
          opacity: 0.38;
          cursor: not-allowed;
          pointer-events: none;
        }

        .tab:focus-visible {
          outline: none;
          background: var(--surface-overlay);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 16px;
          padding: 0 5px;
          border-radius: 9999px;
          background: var(--surface-overlay);
          color: var(--text-tertiary);
          font-size: 10px;
          font-weight: 600;
        }

        .tab.active .badge {
          background: var(--badge-primary-bg);
          color: var(--color-interactive-text);
        }
      </style>

      <div class="tablist" role="tablist" part="tablist">
        ${items}
      </div>
    `;

    this.shadowRoot.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => this._select(btn.dataset.key));
      btn.addEventListener('keydown', e => {
        const tabs = [...this.shadowRoot.querySelectorAll('.tab:not(.disabled)')];
        const i    = tabs.indexOf(btn);
        if (e.key === 'ArrowRight') { e.preventDefault(); tabs[(i + 1) % tabs.length]?.focus(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); tabs[(i - 1 + tabs.length) % tabs.length]?.focus(); }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._select(btn.dataset.key); }
      });
    });
  }
}

customElements.define('fresh-tabs', FreshTabs);
