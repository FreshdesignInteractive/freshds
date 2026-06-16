/* ============================================================
   FreshDS, <fresh-sidebar> + <fresh-nav-group> + <fresh-nav-item>

   Usage:
     <fresh-sidebar>
       <div slot="brand">
         <strong>Acme DS</strong>
       </div>

       <fresh-nav-group label="Getting started" open>
         <fresh-nav-item active icon="ti-home">Overview</fresh-nav-item>
         <fresh-nav-item icon="ti-adjustments-horizontal">Theme</fresh-nav-item>
       </fresh-nav-group>

       <fresh-nav-group label="Components">
         <fresh-nav-item icon="ti-cursor">Button</fresh-nav-item>
         <fresh-nav-item icon="ti-forms">Input</fresh-nav-item>
       </fresh-nav-group>

       <div slot="footer">
         <fresh-avatar name="Jane Smith" size="sm" status="online"></fresh-avatar>
       </div>
     </fresh-sidebar>

   fresh-sidebar attributes:
     collapsed  boolean, icon-only narrow mode

   fresh-nav-group attributes:
     label  string
     open   boolean

   fresh-nav-item attributes:
     active  boolean
     icon    tabler icon class e.g. "ti-home"
     href    string
   ============================================================ */

/* ── fresh-sidebar ── */
class FreshSidebar extends HTMLElement {
  static get observedAttributes() { return ['collapsed']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const collapsed = this.hasAttribute('collapsed');

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

        *, *::before, *::after { box-sizing: border-box; }

        :host { display: flex; flex-direction: column; height: 100%; }

        .sidebar {
          display: flex;
          flex-direction: column;
          width: ${collapsed ? '56px' : 'var(--sidebar-w, 240px)'};
          height: 100%;
          background: var(--surface-nav);
          border-right: 1px solid var(--surface-border);
          transition: width 200ms ease;
          overflow: hidden;
          flex-shrink: 0;
        }

        .content {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-3) 0 var(--space-8);
        }

        .content::-webkit-scrollbar { width: 4px; }
        .content::-webkit-scrollbar-thumb {
          background: var(--surface-border-strong);
          border-radius: 2px;
        }

        .footer {
          border-top: 1px solid var(--surface-border);
          padding: var(--space-3) var(--space-4);
          flex-shrink: 0;
        }

        ::slotted([slot="footer"]) {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
      </style>

      <div class="sidebar" part="sidebar">
        <div class="content" part="content">
          <slot></slot>
        </div>
        <div class="footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}

/* ── fresh-nav-group ── */
class FreshNavGroup extends HTMLElement {
  static get observedAttributes() { return ['label', 'open']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = false;
  }

  connectedCallback() {
    this._open = this.hasAttribute('open');
    this._render();
  }

  attributeChangedCallback(name) {
    if (name === 'open') this._open = this.hasAttribute('open');
    this._render();
  }

  _toggle() {
    this._open = !this._open;
    if (this._open) this.setAttribute('open', '');
    else this.removeAttribute('open');
    this._render();
  }

  _render() {
    const label = this.getAttribute('label') || '';

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; margin-bottom: var(--space-1); }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2) var(--space-4);
          font-family: var(--font-sans);
          font-size: var(--font-size-xs);
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          cursor: pointer;
          user-select: none;
          transition: color 120ms ease;
          -webkit-font-smoothing: antialiased;
        }

        .header:hover { color: var(--text-secondary); }

        .chevron {
          font-size: var(--font-size-xs);
          transition: transform 200ms ease;
        }

        .chevron.open { transform: rotate(90deg); }

        .items {
          overflow: hidden;
          display: ${this._open ? 'block' : 'none'};
        }
      </style>

      <div class="header" part="header">
        <span>${label}</span>
        <i class="ti ti-chevron-right chevron ${this._open ? 'open' : ''}" aria-hidden="true"></i>
      </div>
      <div class="items" part="items">
        <slot></slot>
      </div>
    `;

    this.shadowRoot.querySelector('.header')
      ?.addEventListener('click', () => this._toggle());
  }
}

/* ── fresh-nav-item ── */
class FreshNavItem extends HTMLElement {
  static get observedAttributes() { return ['active', 'icon', 'href', 'badge']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const active = this.hasAttribute('active');
    const icon   = this.getAttribute('icon')  || '';
    const href   = this.getAttribute('href')  || null;
    const badge  = this.getAttribute('badge') || '';
    const tag    = href ? 'a' : 'div';
    const hrefAttr = href ? `href="${href}"` : '';

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; }

        .item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 6px var(--space-4) 6px calc(var(--space-4) + 8px);
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          font-weight: ${active ? '500' : '400'};
          color: ${active ? 'var(--nav-active-text)' : 'var(--text-secondary)'};
          background: ${active ? 'var(--nav-active-bg)' : 'transparent'};
          border-left: 2px solid ${active ? 'var(--color-interactive)' : 'transparent'};
          text-decoration: none;
          cursor: pointer;
          transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
          user-select: none;
          -webkit-font-smoothing: antialiased;
          margin: 1px 0;
        }

        .item:hover {
          color: ${active ? 'var(--nav-active-text)' : 'var(--text-primary)'};
          background: ${active ? 'var(--nav-active-bg)' : 'var(--surface-subtle)'};
        }

        .icon {
          font-size: var(--font-size-lg);
          opacity: ${active ? '1' : '0.6'};
          flex-shrink: 0;
          transition: opacity 120ms ease;
        }

        .item:hover .icon { opacity: 1; }

        .label { flex: 1; min-width: 0; }

        .badge-chip {
          font-size: var(--font-size-3xs);
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 1px 5px;
          border-radius: 9999px;
          background: var(--badge-ai-bg);
          color: var(--badge-ai-text);
          border: 1px solid var(--badge-ai-border);
          margin-left: auto;
          flex-shrink: 0;
        }
      </style>

      <${tag} class="item" ${hrefAttr} part="item" role="${href ? '' : 'button'}">
        ${icon ? `<i class="ti ${icon} icon" aria-hidden="true"></i>` : ''}
        <span class="label"><slot></slot></span>
        ${badge ? `<span class="badge-chip">${badge}</span>` : ''}
      </${tag}>
    `;

    if (!href) {
      this.shadowRoot.querySelector('.item')?.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('nav-click', { bubbles: true, composed: true }));
      });
    }
  }
}

customElements.define('fresh-sidebar',  FreshSidebar);
customElements.define('fresh-nav-group', FreshNavGroup);
customElements.define('fresh-nav-item',  FreshNavItem);
