/* ============================================================
   FreshDS — <fresh-chart>

   Styled container for any chart library (Chart.js, Recharts,
   D3, etc.). Provides the FreshDS header, metadata, and
   consistent padding — you provide the chart via the default slot.

   Usage:
     <fresh-chart title="Revenue over time" description="Monthly MRR across all plans">
       <canvas id="my-chart"></canvas>
     </fresh-chart>

     <fresh-chart title="Model usage" height="200px">
       <div id="chart-container"></div>
     </fresh-chart>

   Attributes:
     title        string
     description  string
     height       CSS value for the chart area (default: 280px)
     loading      boolean — shows skeleton shimmer
     empty        boolean — shows empty state
   ============================================================ */

class FreshChart extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'description', 'height', 'loading', 'empty'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const title   = this.getAttribute('title')       || '';
    const desc    = this.getAttribute('description') || '';
    const height  = this.getAttribute('height')      || '280px';
    const loading = this.hasAttribute('loading');
    const empty   = this.hasAttribute('empty');

    const shimmer = `
      background: linear-gradient(90deg, var(--surface-overlay) 0%, var(--surface-subtle) 50%, var(--surface-overlay) 100%);
      background-size: 200% 100%;
      animation: shimmer 1.6s ease infinite;
    `;

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: block; }

        .card {
          background: var(--surface-bg);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: var(--space-5) var(--space-6) var(--space-4);
          gap: var(--space-4);
        }

        .meta { flex: 1; min-width: 0; }

        .title {
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          -webkit-font-smoothing: antialiased;
        }

        .desc {
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
          margin-top: 2px;
          -webkit-font-smoothing: antialiased;
        }

        .actions { flex-shrink: 0; }

        .divider { height: 1px; background: var(--surface-border); }

        .chart-area {
          height: ${height};
          padding: var(--space-5) var(--space-6);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .loading-overlay {
          position: absolute;
          inset: var(--space-5) var(--space-6);
          border-radius: var(--radius-md);
          ${shimmer}
        }

        .empty-msg {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
        }

        ::slotted(*) { width: 100%; height: 100%; }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      </style>

      <div class="card" part="card">
        ${title || desc ? `
          <div class="header" part="header">
            <div class="meta">
              ${title ? `<div class="title">${title}</div>` : ''}
              ${desc  ? `<div class="desc">${desc}</div>`   : ''}
            </div>
            <div class="actions"><slot name="actions"></slot></div>
          </div>
          <div class="divider"></div>
        ` : ''}

        <div class="chart-area" part="chart-area">
          ${loading ? `<div class="loading-overlay" aria-hidden="true"></div>` : ''}
          ${empty && !loading
            ? `<div class="empty-msg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 3v18h18M8 17V9m4 8V5m4 12v-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                No data available
               </div>`
            : '<slot></slot>'
          }
        </div>
      </div>
    `;
  }
}

customElements.define('fresh-chart', FreshChart);
