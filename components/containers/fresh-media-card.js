/* ============================================================
   FreshDS, <fresh-media-card>

   Full-bleed thumbnail card with a title and optional description
   footer. Designed for pattern libraries, galleries, and any
   grid of visual items.

   Usage:
     <!-- Slotted thumbnail (gradient, custom markup) -->
     <fresh-media-card title="Login" description="Auth pattern"
       href="patterns/auth-login.html" target="_blank">
       <div slot="thumb" style="background:var(--color-interactive-subtle);height:100%"></div>
     </fresh-media-card>

     <!-- Image thumbnail -->
     <fresh-media-card src="screenshots/dashboard.png"
       title="Dashboard" description="Analytics overview">
     </fresh-media-card>

   Attributes:
     title        string , card label (required)
     description  string , optional secondary line
     src          string , image URL; if set, renders <img> in thumb
     href         string , makes the card a link
     target       string , e.g. "_blank"
     ratio        string , thumbnail aspect ratio (default: 16/10)
   ============================================================ */

class FreshMediaCard extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'src', 'href', 'target', 'ratio'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const title  = this.getAttribute('title')       || '';
    const desc   = this.getAttribute('description') || '';
    const src    = this.getAttribute('src')         || '';
    const href   = this.getAttribute('href')        || '';
    const target = this.getAttribute('target')      || '';
    const ratio  = this.getAttribute('ratio')       || '16/10';
    const tag    = href ? 'a' : 'div';

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: block; }
        :host([fill]) { height: 100%; }
        :host([fill]) .card { height: 100%; min-height: 0; }
        :host([fill]) .thumb { flex: 1; min-height: 0; aspect-ratio: unset; }

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
          cursor: pointer;
        }
        :host([no-hover]) .card { cursor: default; }
        :host([no-hover]) .thumb { background: var(--surface-bg); }

        :host(:not([no-hover])) .card:hover {
          border-color: var(--surface-border-strong);
          box-shadow: var(--elev-2);
          transform: translateY(-2px);
        }

        :host(:not([no-hover])) .card:active {
          transform: translateY(0);
          box-shadow: var(--elev-1);
        }

        .card:focus-visible {
          outline: 2px solid var(--color-interactive);
          outline-offset: 2px;
        }

        .thumb {
          aspect-ratio: ${ratio};
          overflow: hidden;
          flex-shrink: 0;
          background: var(--surface-subtle);
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        ::slotted([slot="thumb"]) {
          width: 100%;
          height: 100%;
          display: block;
          overflow: hidden;
        }

        .info {
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--surface-border);
        }

        .title {
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-font-smoothing: antialiased;
        }

        .desc {
          display: ${desc ? 'block' : 'none'};
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-font-smoothing: antialiased;
        }
      </style>

      <${tag}
        class="card"
        ${href   ? `href="${href}"` : ''}
        ${target ? `target="${target}"` : ''}
        ${target === '_blank' ? 'rel="noopener noreferrer"' : ''}
        part="card"
      >
        <div class="thumb" part="thumb">
          ${src
            ? `<img src="${src}" alt="${title}" loading="lazy">`
            : `<slot name="thumb"></slot>`
          }
        </div>
        <div class="info" part="info">
          <div class="title" part="title">${title}</div>
          <div class="desc"  part="desc">${desc}</div>
        </div>
      </${tag}>
    `;
  }
}

customElements.define('fresh-media-card', FreshMediaCard);
