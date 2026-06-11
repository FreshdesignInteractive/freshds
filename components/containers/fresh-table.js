/* ============================================================
   FreshDS — <fresh-table>

   Usage:
     <fresh-table
       columns='[
         {"key":"name",   "label":"Name",   "sortable":true},
         {"key":"role",   "label":"Role"},
         {"key":"status", "label":"Status"},
         {"key":"joined", "label":"Joined",  "sortable":true, "align":"right"}
       ]'
       data='[
         {"name":"Jane Smith",  "role":"Admin",  "status":"Active",    "joined":"Jan 12, 2024"},
         {"name":"Marcus Lee",  "role":"Editor", "status":"Active",    "joined":"Feb 3, 2024"},
         {"name":"Priya Nair",  "role":"Viewer", "status":"Inactive",  "joined":"Mar 8, 2024"}
       ]'>
     </fresh-table>

   Attributes:
     columns   JSON array  { key, label, sortable?, align?, width? }
     data      JSON array  row objects keyed by column.key
     striped   boolean     alternating row backgrounds
     caption   string      accessible table caption

   Events:
     sort  → detail: { key, direction: 'asc' | 'desc' }
   ============================================================ */

class FreshTable extends HTMLElement {
  static get observedAttributes() { return ['columns', 'data', 'striped', 'caption']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._sortKey = null;
    this._sortDir = 'asc';
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _parse(attr) {
    try { return JSON.parse(this.getAttribute(attr) || '[]'); }
    catch { return []; }
  }

  _sort(key) {
    if (this._sortKey === key) {
      this._sortDir = this._sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this._sortKey = key;
      this._sortDir = 'asc';
    }
    this.dispatchEvent(new CustomEvent('sort', {
      detail: { key, direction: this._sortDir },
      bubbles: true,
      composed: true
    }));
    this._render();
  }

  _sortedData(rows) {
    if (!this._sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = String(a[this._sortKey] ?? '');
      const bv = String(b[this._sortKey] ?? '');
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return this._sortDir === 'asc' ? cmp : -cmp;
    });
  }

  _render() {
    const columns = this._parse('columns');
    const rows    = this._sortedData(this._parse('data'));
    const striped = this.hasAttribute('striped');
    const caption = this.getAttribute('caption') || '';

    const asc  = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2L9 7H1L5 2Z" fill="currentColor"/></svg>`;
    const desc = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8L1 3H9L5 8Z" fill="currentColor"/></svg>`;
    const both = `<svg width="10" height="12" viewBox="0 0 10 12" fill="none">
      <path d="M5 1L9 5H1L5 1Z" fill="currentColor" opacity=".35"/>
      <path d="M5 11L1 7H9L5 11Z" fill="currentColor" opacity=".35"/>
    </svg>`;

    const headerCells = columns.map(col => {
      const isSorted  = this._sortKey === col.key;
      const align     = col.align || 'left';
      const icon      = col.sortable
        ? (isSorted ? (this._sortDir === 'asc' ? asc : desc) : both)
        : '';

      return `
        <th
          class="th ${col.sortable ? 'sortable' : ''} ${isSorted ? 'sorted' : ''}"
          data-key="${col.key}"
          style="${col.width ? `width:${col.width};` : ''}text-align:${align}"
          part="th"
        >
          <span class="th-inner">
            <span>${col.label}</span>
            ${col.sortable ? `<span class="sort-icon" aria-hidden="true">${icon}</span>` : ''}
          </span>
        </th>
      `;
    }).join('');

    const bodyRows = rows.length
      ? rows.map((row, ri) => {
          const cells = columns.map(col => {
            const val   = row[col.key] ?? '—';
            const align = col.align || 'left';
            return `<td class="td" style="text-align:${align}" part="td">${val}</td>`;
          }).join('');
          return `<tr class="tr ${striped && ri % 2 === 1 ? 'striped' : ''}" part="tr">${cells}</tr>`;
        }).join('')
      : `<tr><td colspan="${columns.length}" class="empty-cell">No data</td></tr>`;

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; }

        .scroll {
          width: 100%;
          overflow-x: auto;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
        }

        .scroll::-webkit-scrollbar { height: 4px; }
        .scroll::-webkit-scrollbar-thumb { background: var(--surface-border-strong); border-radius: 2px; }

        table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          -webkit-font-smoothing: antialiased;
        }

        .th {
          padding: var(--space-2) var(--space-4);
          font-size: var(--font-size-xs);
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          background: var(--surface-subtle);
          border-bottom: 1px solid var(--surface-border);
          white-space: nowrap;
          user-select: none;
        }

        .th.sortable {
          cursor: pointer;
          transition: color 120ms ease, background 120ms ease;
        }
        .th.sortable:hover { color: var(--text-secondary); background: var(--surface-overlay); }
        .th.sorted         { color: var(--color-interactive-text); }

        .th-inner {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .sort-icon {
          display: flex;
          align-items: center;
          color: var(--text-tertiary);
          transition: color 120ms ease;
        }
        .th.sorted .sort-icon { color: var(--color-interactive-text); }

        .tr {
          border-bottom: 1px solid var(--surface-border);
          transition: background 100ms ease;
        }
        .tr:last-child { border-bottom: none; }
        .tr:hover      { background: var(--surface-subtle); }
        .tr.striped    { background: var(--surface-subtle); }
        .tr.striped:hover { background: var(--surface-overlay); }

        .td {
          padding: var(--space-3) var(--space-4);
          color: var(--text-secondary);
          vertical-align: middle;
          white-space: nowrap;
        }

        .td:first-child { color: var(--text-primary); font-weight: 500; }

        .empty-cell {
          padding: var(--space-10) var(--space-4);
          text-align: center;
          color: var(--text-tertiary);
          font-size: var(--font-size-md);
        }
      </style>

      <div class="scroll" part="scroll">
        <table part="table" ${caption ? `aria-label="${caption}"` : ''}>
          ${caption ? `<caption class="sr-only">${caption}</caption>` : ''}
          <thead>
            <tr>${headerCells}</tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
    `;

    this.shadowRoot.querySelectorAll('.th.sortable').forEach(th => {
      th.addEventListener('click', () => this._sort(th.dataset.key));
    });
  }
}

customElements.define('fresh-table', FreshTable);
