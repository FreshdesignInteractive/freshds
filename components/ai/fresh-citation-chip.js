/* ============================================================
   FreshDS, <fresh-citation-chip>

   Inline reference chip linking AI output to a source.

   Usage:
     Revenue grew 12.4% this quarter
     <fresh-citation-chip source="Q3 Report" page="14" href="/docs/q3"></fresh-citation-chip>
     driven by enterprise demand.

     <fresh-citation-chip source="annual-report.pdf"></fresh-citation-chip>

   Attributes:
     source  string, document or source name
     page    string, page number or section
     href    string, link to the source
   ============================================================ */

class FreshCitationChip extends HTMLElement {
  static get observedAttributes() { return ['source', 'page', 'href']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const source = this.getAttribute('source') || 'Source';
    const page   = this.getAttribute('page')   || '';
    const href   = this.getAttribute('href')   || '';
    const tag    = href ? 'a' : 'span';

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: inline-flex; vertical-align: middle; }

        .chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 18px;
          padding: 0 7px;
          border-radius: 9999px;
          background: var(--surface-overlay);
          border: 1px solid var(--surface-border-strong);
          font-family: var(--font-sans);
          font-size: var(--font-size-xs);
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          cursor: ${href ? 'pointer' : 'default'};
          transition: border-color 120ms, color 120ms, background 120ms;
          white-space: nowrap;
          -webkit-font-smoothing: antialiased;
        }

        a.chip:hover {
          border-color: var(--color-interactive-text);
          color: var(--color-interactive-text);
          background: var(--badge-primary-bg);
        }

        a.chip:focus-visible {
          outline: 2px solid var(--color-interactive-text);
          outline-offset: 2px;
        }

        .icon {
          display: flex;
          align-items: center;
          opacity: 0.6;
        }

        .page {
          color: var(--text-tertiary);
          font-weight: 400;
        }
      </style>

      <${tag} class="chip" ${href ? `href="${href}" target="_blank" rel="noopener"` : ''} part="chip" title="${source}${page ? ` · p.${page}` : ''}">
        <span class="icon" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 1h4.5L9 3.5V9H2V1Z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/>
            <path d="M6 1v3h3" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/>
          </svg>
        </span>
        ${source}${page ? `<span class="page">·${page}</span>` : ''}
      </${tag}>
    `;
  }
}

customElements.define('fresh-citation-chip', FreshCitationChip);
