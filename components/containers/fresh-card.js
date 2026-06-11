/* ============================================================
   FreshDS — <fresh-card>

   Usage:
     <fresh-card>Simple body content</fresh-card>

     <fresh-card>
       <div slot="header">
         <span>Card title</span>
         <fresh-button variant="ghost" icon-only size="sm">…</fresh-button>
       </div>
       Body content
       <div slot="footer">
         <fresh-button variant="primary" size="sm">Confirm</fresh-button>
         <fresh-button variant="ghost"   size="sm">Cancel</fresh-button>
       </div>
     </fresh-card>

     <fresh-card interactive href="/projects/42">Clickable card</fresh-card>

   Attributes:
     padding      none | sm | md | lg    (default: md)
     interactive  boolean — hover lift, pointer cursor
     href         string  — renders as <a>, implies interactive
   ============================================================ */

class FreshCard extends HTMLElement {
  static get observedAttributes() { return ['padding', 'interactive', 'href', 'target']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const padding     = this.getAttribute('padding') || 'md';
    const interactive = this.hasAttribute('interactive') || this.hasAttribute('href');
    const href        = this.getAttribute('href') || '';
    const target      = this.getAttribute('target') || '';
    const tag         = href ? 'a' : 'div';

    const pads = { none: '0', sm: 'var(--space-4)', md: 'var(--space-6)', lg: 'var(--space-8)' };
    const p    = pads[padding] || pads.md;

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; }

        .card {
          display: flex;
          flex-direction: column;
          background: var(--surface-bg);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition:
            border-color 150ms ease,
            box-shadow   150ms ease,
            transform    120ms ease;
        }

        ${interactive ? `
          .card {
            cursor: pointer;
          }
          .card:hover {
            border-color: var(--surface-border-strong);
            box-shadow: var(--elev-2);
            transform: translateY(-1px);
          }
          .card:active {
            transform: translateY(0);
            box-shadow: var(--elev-1);
          }
          .card:focus-visible {
            outline: 2px solid var(--color-interactive-text);
            outline-offset: 2px;
          }
        ` : ''}

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) ${p};
          border-bottom: 1px solid var(--surface-border);
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          font-weight: 600;
          color: var(--text-primary);
          -webkit-font-smoothing: antialiased;
        }

        /* Hide header slot wrapper when unused */
        .header-wrap:not(:has(slot[name="header"] ~ *)):empty,
        .has-no-header { display: none; }

        .body {
          flex: 1;
          padding: ${p};
        }

        /* Tighten body top padding when header is present */
        slot[name="header"] + .body { padding-top: var(--space-4); }

        .footer {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4) ${p};
          border-top: 1px solid var(--surface-border);
        }
      </style>

      <${tag}
        class="card"
        ${href   ? `href="${href}"` : ''}
        ${target ? `target="${target}"` : ''}
        ${target === '_blank' ? 'rel="noopener noreferrer"' : ''}
        part="card"
      >
        <slot name="header" class="header"></slot>
        <div class="body" part="body">
          <slot></slot>
        </div>
        <slot name="footer" class="footer"></slot>
      </${tag}>
    `;
  }
}

customElements.define('fresh-card', FreshCard);
