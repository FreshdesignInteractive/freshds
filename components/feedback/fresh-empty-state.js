/* ============================================================
   FreshDS, <fresh-empty-state>

   Usage:
     <fresh-empty-state
       icon="ti-inbox"
       title="No results found"
       description="Try adjusting your search or filters."
     ></fresh-empty-state>

     <fresh-empty-state icon="ti-sparkles" title="Start a conversation">
       <fresh-button slot="action" variant="primary">Ask AI</fresh-button>
     </fresh-empty-state>

   Attributes:
     icon         tabler icon class e.g. "ti-inbox"
     title        string
     description  string

   Slots:
     action , optional CTA button or link below the description
   ============================================================ */

class FreshEmptyState extends HTMLElement {
  static get observedAttributes() { return ['icon', 'title', 'description']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const icon  = this.getAttribute('icon')        || 'ti-inbox';
    const title = this.getAttribute('title')       || '';
    const desc  = this.getAttribute('description') || '';

    /* Icons are loaded globally in index.html — they work in shadow DOM
       because font-face glyphs are inherited, only CSS rules are not. */
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; }

        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: var(--space-12) var(--space-8);
          gap: var(--space-4);
        }

        .icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-xl);
          background: var(--surface-overlay);
          border: 1px solid var(--surface-border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-2);
        }

        .icon-wrap .ti {
          font-size: var(--font-size-3xl);
          color: var(--text-tertiary);
        }

        .title {
          font-family: var(--font-sans);
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          -webkit-font-smoothing: antialiased;
        }

        .desc {
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          color: var(--text-tertiary);
          line-height: 1.6;
          max-width: 300px;
          -webkit-font-smoothing: antialiased;
        }

        .action { margin-top: var(--space-2); }
      </style>

      <div class="empty" part="empty">
        <div class="icon-wrap">
          <i class="ti ${icon}" aria-hidden="true"></i>
        </div>
        ${title ? `<div class="title" part="title">${title}</div>` : ''}
        ${desc  ? `<div class="desc"  part="desc">${desc}</div>`   : ''}
        <div class="action"><slot name="action"></slot></div>
      </div>
    `;
  }
}

customElements.define('fresh-empty-state', FreshEmptyState);
