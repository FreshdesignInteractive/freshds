/* ============================================================
   FreshDS — <fresh-pagination>

   Usage:
     <fresh-pagination page="4" total="20"></fresh-pagination>
     <fresh-pagination page="1" total="5"  size="sm"></fresh-pagination>
     <fresh-pagination page="8" total="50" siblings="2"></fresh-pagination>

   Attributes:
     page      number  — current page, 1-based       (default: 1)
     total     number  — total number of pages        (default: 1)
     siblings  number  — pages either side of current (default: 1)
     size      sm | md                                (default: md)

   Events:
     change → detail: { page: number }
   ============================================================ */

class FreshPagination extends HTMLElement {
  static get observedAttributes() { return ['page', 'total', 'siblings', 'size']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  get _page()     { return Math.max(1, parseInt(this.getAttribute('page')     || '1',  10)); }
  get _total()    { return Math.max(1, parseInt(this.getAttribute('total')    || '1',  10)); }
  get _siblings() { return Math.max(1, parseInt(this.getAttribute('siblings') || '1',  10)); }

  _go(page) {
    if (page < 1 || page > this._total || page === this._page) return;
    this.setAttribute('page', page);
    this.dispatchEvent(new CustomEvent('change', {
      detail: { page },
      bubbles: true,
      composed: true
    }));
  }

  /* Returns array of page numbers + '…' strings */
  _pages() {
    const { _page: cur, _total: tot, _siblings: sib } = this;
    const delta  = sib + 2;
    const range  = [];
    const result = [];
    let last;

    for (let i = Math.max(2, cur - sib); i <= Math.min(tot - 1, cur + sib); i++) {
      range.push(i);
    }

    result.push(1);
    if (range[0] > 2)           result.push('…');
    result.push(...range);
    if (range[range.length - 1] < tot - 1) result.push('…');
    if (tot > 1)                result.push(tot);

    return result;
  }

  _render() {
    const page  = this._page;
    const total = this._total;
    const size  = this.getAttribute('size') || 'md';

    const btnSz  = size === 'sm' ? '28px' : '32px';
    const fsize  = size === 'sm' ? '12px' : '13px';
    const gap    = size === 'sm' ? '3px'  : '4px';

    const pages = this._pages();

    const pageItems = pages.map(p => {
      if (p === '…') {
        return `<span class="ellipsis" aria-hidden="true">…</span>`;
      }
      const isActive = p === page;
      return `
        <button
          class="btn ${isActive ? 'active' : ''}"
          data-page="${p}"
          aria-label="Page ${p}"
          aria-current="${isActive ? 'page' : ''}"
          ${isActive ? 'disabled' : ''}
          part="page ${isActive ? 'page-active' : ''}"
        >${p}</button>
      `;
    }).join('');

    const prevSVG = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 3L5 7l3.5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const nextSVG = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 3L9 7l-3.5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: inline-flex; }

        .pagination {
          display: flex;
          align-items: center;
          gap: ${gap};
        }

        .btn {
          all: unset;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: ${btnSz};
          height: ${btnSz};
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-size: ${fsize};
          font-weight: 500;
          color: var(--text-secondary);
          border: 1px solid transparent;
          cursor: pointer;
          transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
          flex-shrink: 0;
          -webkit-font-smoothing: antialiased;
        }

        .btn:hover:not(:disabled) {
          background: var(--surface-overlay);
          color: var(--text-primary);
        }

        .btn:focus-visible {
          outline: 2px solid var(--color-interactive-text);
          outline-offset: 2px;
        }

        .btn.active {
          background: var(--color-interactive);
          color: var(--btn-primary-text);
          cursor: default;
          pointer-events: none;
        }

        .btn.arrow {
          color: var(--text-tertiary);
          border: 1px solid var(--surface-border-strong);
        }

        .btn.arrow:hover:not(:disabled) {
          color: var(--text-primary);
          border-color: var(--text-tertiary);
        }

        .btn.arrow:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          pointer-events: none;
        }

        .ellipsis {
          width: ${btnSz};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: ${fsize};
          color: var(--text-tertiary);
          user-select: none;
        }
      </style>

      <nav class="pagination" aria-label="Pagination" part="pagination">
        <button class="btn arrow" data-action="prev" aria-label="Previous page" ${page <= 1 ? 'disabled' : ''} part="prev">
          ${prevSVG}
        </button>

        ${pageItems}

        <button class="btn arrow" data-action="next" aria-label="Next page" ${page >= total ? 'disabled' : ''} part="next">
          ${nextSVG}
        </button>
      </nav>
    `;

    this.shadowRoot.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => this._go(parseInt(btn.dataset.page, 10)));
    });
    this.shadowRoot.querySelector('[data-action="prev"]')
      ?.addEventListener('click', () => this._go(page - 1));
    this.shadowRoot.querySelector('[data-action="next"]')
      ?.addEventListener('click', () => this._go(page + 1));
  }
}

customElements.define('fresh-pagination', FreshPagination);
