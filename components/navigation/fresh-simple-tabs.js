/* ============================================================
   FreshDS — <fresh-simple-tabs>

   Text-first tab bar with a pill background on the active tab.
   No underline — ideal for top-level navigation, marketing
   pages, and any context where the underline style is too heavy.

   Usage:
     <fresh-simple-tabs
       tabs='[{"key":"overview","label":"Overview"},{"key":"activity","label":"Activity"}]'
       active="overview">
     </fresh-simple-tabs>

     <script>
       document.querySelector('fresh-simple-tabs').addEventListener('change', e => {
         // e.detail.key — the newly active tab key
       });
     </script>

   Attributes:
     tabs    JSON array of { key, label, disabled? }
     active  string — key of the active tab
     size    sm | md | lg   (default: md)

   Events:
     change  — CustomEvent({ detail: { key } }) — bubbles, composed
   ============================================================ */

class FreshSimpleTabs extends HTMLElement {
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

    const py     = { sm: '5px',  md: '8px',  lg: '11px' };
    const px     = { sm: '10px', md: '16px', lg: '22px' };
    const fsize  = { sm: '11px', md: '13px', lg: '15px' };
    const radius = { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)' };

    const items = tabs.map(t => {
      const isActive   = t.key === active;
      const isDisabled = t.disabled;
      return `
        <button
          class="tab${isActive ? ' active' : ''}${isDisabled ? ' disabled' : ''}"
          data-key="${t.key}"
          role="tab"
          aria-selected="${isActive}"
          ${isDisabled ? 'disabled' : ''}
          part="tab${isActive ? ' tab-active' : ''}"
        >${t.label}</button>
      `;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: block; }

        .tablist {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .tab {
          all: unset;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: ${py[size]} ${px[size]};
          font-family: var(--font-sans);
          font-size: ${fsize[size]};
          font-weight: 500;
          color: var(--text-secondary);
          border-radius: ${radius[size]};
          cursor: pointer;
          white-space: nowrap;
          transition: color 150ms ease, background 150ms ease;
          -webkit-font-smoothing: antialiased;
          flex-shrink: 0;
        }

        .tab:hover:not(.disabled):not(.active) {
          color: var(--text-primary);
          background: var(--surface-subtle);
        }

        .tab.active {
          font-weight: 600;
          color: var(--text-primary);
          background: var(--surface-overlay);
        }

        .tab.disabled {
          opacity: 0.38;
          cursor: not-allowed;
          pointer-events: none;
        }

        .tab:focus-visible {
          outline: 2px solid var(--color-interactive);
          outline-offset: 2px;
        }
      </style>

      <div class="tablist" role="tablist" part="tablist">
        ${items}
      </div>
    `;

    this.shadowRoot.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => this._select(btn.dataset.key));
      btn.addEventListener('keydown', e => {
        const all = [...this.shadowRoot.querySelectorAll('.tab:not(.disabled)')];
        const i   = all.indexOf(btn);
        if (e.key === 'ArrowRight') { e.preventDefault(); all[(i + 1) % all.length]?.focus(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); all[(i - 1 + all.length) % all.length]?.focus(); }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._select(btn.dataset.key); }
      });
    });
  }
}

customElements.define('fresh-simple-tabs', FreshSimpleTabs);
