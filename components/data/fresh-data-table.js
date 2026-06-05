/* ============================================================
   FreshDS — <fresh-data-table>

   Enhanced table with search, sort, row selection, and row highlight.

   Usage:
     <fresh-data-table
       columns='[{"key":"name","label":"Name","sortable":true},...]'
       data='[{"name":"Jane",...},...]'
       searchable
       selectable
       highlightable>
       <div slot="bulk-actions">
         <fresh-button variant="danger" size="sm">Delete selected</fresh-button>
       </div>
     </fresh-data-table>

   Attributes:
     columns            JSON array  { key, label, sortable?, align?, width? }
     data               JSON array
     searchable         boolean — shows search input above table
     selectable         boolean — shows row checkboxes + bulk action bar
     highlightable      boolean — click any row to highlight it (single active row)
     search-placeholder string

   Events:
     selection-change → detail: { selected: number[] }  (row indices)
     row-highlight    → detail: { row: object|null, index: number|null }
     sort             → detail: { key, direction }
   ============================================================ */

class FreshDataTable extends HTMLElement {
  static get observedAttributes() {
    return ['columns', 'data', 'searchable', 'selectable', 'highlightable', 'search-placeholder'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._sortKey     = null;
    this._sortDir     = 'asc';
    this._query       = '';
    this._selected    = new Set();
    this._highlighted = null;
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._selected.clear(); this._render(); }

  _parse(attr) {
    try { return JSON.parse(this.getAttribute(attr) || '[]'); }
    catch { return []; }
  }

  _sort(key) {
    this._sortDir = this._sortKey === key && this._sortDir === 'asc' ? 'desc' : 'asc';
    this._sortKey = key;
    this.dispatchEvent(new CustomEvent('sort', { detail: { key, direction: this._sortDir }, bubbles: true, composed: true }));
    this._render();
  }

  _filteredSorted(rows) {
    let result = rows;
    if (this._query) {
      const q = this._query.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(v => String(v).toLowerCase().includes(q))
      );
    }
    if (this._sortKey) {
      result = [...result].sort((a, b) => {
        const cmp = String(a[this._sortKey] ?? '').localeCompare(String(b[this._sortKey] ?? ''), undefined, { numeric: true });
        return this._sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }

  _render() {
    const columns      = this._parse('columns');
    const allData      = this._parse('data');
    const rows         = this._filteredSorted(allData);
    const searchable   = this.hasAttribute('searchable');
    const selectable   = this.hasAttribute('selectable');
    const highlightable = this.hasAttribute('highlightable');
    const ph           = this.getAttribute('search-placeholder') || 'Search…';
    const selCount     = this._selected.size;
    const allSel       = rows.length > 0 && rows.every((_, i) => this._selected.has(i));
    const someSel      = selCount > 0 && !allSel;

    const asc  = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2L9 7H1L5 2Z" fill="currentColor"/></svg>`;
    const desc = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8L1 3H9L5 8Z" fill="currentColor"/></svg>`;
    const both = `<svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M5 1L9 5H1L5 1Z" fill="currentColor" opacity=".35"/><path d="M5 11L1 7H9L5 11Z" fill="currentColor" opacity=".35"/></svg>`;

    const headerCells = [
      selectable ? `<th class="th th-check"><input type="checkbox" class="select-all" ${allSel ? 'checked' : ''} data-indeterminate="${someSel}"></th>` : '',
      ...columns.map(col => {
        const isSorted = this._sortKey === col.key;
        const icon     = col.sortable ? (isSorted ? (this._sortDir === 'asc' ? asc : desc) : both) : '';
        return `<th class="th ${col.sortable ? 'sortable' : ''} ${isSorted ? 'sorted' : ''}" data-key="${col.key}" style="${col.width ? `width:${col.width};` : ''}text-align:${col.align || 'left'}">
          <span class="th-inner"><span>${col.label}</span>${col.sortable ? `<span class="sort-icon">${icon}</span>` : ''}</span>
        </th>`;
      })
    ].join('');

    const bodyRows = rows.length
      ? rows.map((row, ri) => {
          const isSel  = this._selected.has(ri);
          const isHl   = this._highlighted === ri;
          const trClass = ['tr', isSel ? 'selected' : '', isHl ? 'highlighted' : '', highlightable ? 'highlightable' : ''].filter(Boolean).join(' ');
          const cells  = [
            selectable ? `<td class="td td-check"><input type="checkbox" class="row-check" data-idx="${ri}" ${isSel ? 'checked' : ''}></td>` : '',
            ...columns.map(col => `<td class="td" style="text-align:${col.align || 'left'}">${row[col.key] ?? '—'}</td>`)
          ].join('');
          return `<tr class="${trClass}" data-ri="${ri}" part="tr">${cells}</tr>`;
        }).join('')
      : `<tr><td colspan="${columns.length + (selectable ? 1 : 0)}" class="empty-cell">No results</td></tr>`;

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: block; }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .search-wrap {
          position: relative;
          flex: 1;
          max-width: 280px;
        }
        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: var(--text-tertiary);
          pointer-events: none;
        }
        .search {
          all: unset;
          display: block;
          width: 100%;
          height: 34px;
          padding: 0 12px 0 32px;
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--text-primary);
          background: var(--surface-bg);
          border: 1px solid var(--surface-border-strong);
          border-radius: var(--radius-md);
          transition: border-color 150ms, box-shadow 150ms;
        }
        .search::placeholder { color: var(--text-tertiary); }
        .search:focus { border-color: var(--input-focus-border); box-shadow: 0 0 0 3px var(--input-focus-ring); }

        .bulk-bar {
          display: ${selCount > 0 ? 'flex' : 'none'};
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-4);
          background: var(--color-interactive);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-2);
        }
        .bulk-count {
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          color: var(--text-inverse);
          flex: 1;
        }

        .scroll {
          width: 100%;
          overflow-x: auto;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
        }
        .scroll::-webkit-scrollbar { height: 4px; }
        .scroll::-webkit-scrollbar-thumb { background: var(--surface-border-strong); border-radius: 2px; }

        table { width: 100%; border-collapse: collapse; font-family: var(--font-sans); font-size: 13px; -webkit-font-smoothing: antialiased; }

        .th { padding: var(--space-2) var(--space-4); font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-tertiary); background: var(--surface-subtle); border-bottom: 1px solid var(--surface-border); white-space: nowrap; user-select: none; }
        .th.sortable { cursor: pointer; transition: color 120ms, background 120ms; }
        .th.sortable:hover { color: var(--text-secondary); background: var(--surface-overlay); }
        .th.sorted { color: var(--color-interactive-text); }
        .th-check { width: 40px; text-align: center; }
        .th-inner { display: inline-flex; align-items: center; gap: 5px; }
        .sort-icon { display: flex; color: var(--text-tertiary); }
        .th.sorted .sort-icon { color: var(--color-interactive-text); }

        .tr { border-bottom: 1px solid var(--surface-border); transition: background 100ms, border-left-color 100ms; border-left: 2px solid transparent; }
        .tr:last-child { border-bottom: none; }
        .tr.highlightable { cursor: pointer; }
        .tr.highlightable:hover { background: var(--surface-overlay); }
        .tr.selected { background: var(--badge-primary-bg); }
        .tr.highlighted { background: var(--color-interactive-subtle); border-left-color: var(--color-interactive); }
        .tr.highlighted.highlightable:hover { background: var(--color-interactive-border); }
        .tr.highlighted .td { color: var(--text-primary); }
        .tr.highlighted .td:first-child:not(.td-check) { color: var(--color-interactive-text); }

        .td { padding: var(--space-3) var(--space-4); color: var(--text-secondary); vertical-align: middle; white-space: nowrap; }
        .td:first-child:not(.td-check) { color: var(--text-primary); font-weight: 500; }
        .td-check { width: 40px; text-align: center; }

        input[type="checkbox"] { accent-color: var(--color-interactive); width: 14px; height: 14px; cursor: pointer; }

        .empty-cell { padding: var(--space-10) var(--space-4); text-align: center; color: var(--text-tertiary); }
      </style>

      ${searchable || selCount > 0 ? `
        <div class="toolbar">
          ${searchable ? `
            <div class="search-wrap">
              <i class="ti ti-search search-icon"></i>
              <input class="search" placeholder="${ph}" value="${this._query}" autocomplete="off">
            </div>
          ` : '<span></span>'}
        </div>
      ` : ''}

      ${selCount > 0 ? `
        <div class="bulk-bar">
          <span class="bulk-count">${selCount} selected</span>
          <slot name="bulk-actions"></slot>
        </div>
      ` : ''}

      <div class="scroll">
        <table>
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
    `;

    /* Bind search */
    this.shadowRoot.querySelector('.search')?.addEventListener('input', e => {
      this._query = e.target.value;
      this._selected.clear();
      this._render();
    });

    /* Bind sort */
    this.shadowRoot.querySelectorAll('.th.sortable').forEach(th =>
      th.addEventListener('click', () => this._sort(th.dataset.key))
    );

    /* Bind select-all */
    const selAll = this.shadowRoot.querySelector('.select-all');
    if (selAll) {
      selAll.indeterminate = someSel;
      selAll.addEventListener('change', e => {
        if (e.target.checked) rows.forEach((_, i) => this._selected.add(i));
        else this._selected.clear();
        this._emitSelection();
        this._render();
      });
    }

    /* Bind row checkboxes */
    this.shadowRoot.querySelectorAll('.row-check').forEach(cb =>
      cb.addEventListener('change', e => {
        const idx = parseInt(e.target.dataset.idx, 10);
        e.target.checked ? this._selected.add(idx) : this._selected.delete(idx);
        this._emitSelection();
        this._render();
      })
    );

    /* Bind row highlight */
    if (this.hasAttribute('highlightable')) {
      this.shadowRoot.querySelectorAll('.tr.highlightable').forEach(tr =>
        tr.addEventListener('click', e => {
          if (e.target.closest('input[type="checkbox"]')) return;
          const ri = parseInt(tr.dataset.ri, 10);
          this._highlighted = this._highlighted === ri ? null : ri;
          this._emitHighlight(rows);
          this._render();
        })
      );
    }
  }

  _emitSelection() {
    this.dispatchEvent(new CustomEvent('selection-change', {
      detail: { selected: [...this._selected] },
      bubbles: true, composed: true
    }));
  }

  _emitHighlight(rows) {
    const idx = this._highlighted;
    this.dispatchEvent(new CustomEvent('row-highlight', {
      detail: { row: idx !== null ? rows[idx] : null, index: idx },
      bubbles: true, composed: true
    }));
  }
}

customElements.define('fresh-data-table', FreshDataTable);
