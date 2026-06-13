/* ============================================================
   FreshDS, <fresh-breadcrumb>

   Usage:
     <fresh-breadcrumb items='[
       {"label":"Home",     "href":"/"},
       {"label":"Settings", "href":"/settings"},
       {"label":"API Keys"}
     ]'></fresh-breadcrumb>

   Attributes:
     items  JSON array of { label, href? } , last item is the current page (no link)
     size   sm | md                          (default: md)
   ============================================================ */

class FreshBreadcrumb extends HTMLElement {
  static get observedAttributes() { return ['items', 'size']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const size = this.getAttribute('size') || 'md';
    const fsize = size === 'sm' ? '11px' : '13px';

    let items = [];
    try { items = JSON.parse(this.getAttribute('items') || '[]'); }
    catch {}

    const crumbs = items.map((item, i) => {
      const isLast = i === items.length - 1;
      const sep    = !isLast
        ? `<span class="sep" aria-hidden="true">
             <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
               <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
             </svg>
           </span>`
        : '';

      const crumb = isLast
        ? `<span class="crumb current" aria-current="page">${item.label}</span>`
        : item.href
          ? `<a class="crumb link" href="${item.href}">${item.label}</a>`
          : `<span class="crumb">${item.label}</span>`;

      return `<li class="item">${crumb}${sep}</li>`;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; }

        ol {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 2px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .item {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .crumb {
          font-family: var(--font-sans);
          font-size: ${fsize};
          color: var(--text-tertiary);
          white-space: nowrap;
          -webkit-font-smoothing: antialiased;
        }

        .crumb.link {
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: var(--radius-sm);
          padding: 2px 4px;
          margin: -2px -4px;
          transition: color 120ms ease, background 120ms ease;
        }

        .crumb.link:hover {
          color: var(--text-primary);
          background: var(--surface-overlay);
        }

        .crumb.link:focus-visible {
          outline: 2px solid var(--color-interactive-text);
          outline-offset: 2px;
        }

        .crumb.current {
          color: var(--text-primary);
          font-weight: 500;
        }

        .sep {
          display: flex;
          align-items: center;
          color: var(--text-tertiary);
          opacity: 0.5;
        }
      </style>

      <nav aria-label="Breadcrumb">
        <ol>${crumbs}</ol>
      </nav>
    `;
  }
}

customElements.define('fresh-breadcrumb', FreshBreadcrumb);
