/* ============================================================
   FreshDS, <fresh-stat-card>

   Usage:
     <fresh-stat-card
       value="$24,580"
       label="Monthly revenue"
       trend="12.4"
       trend-label="vs last month"
       icon="ti-currency-dollar">
     </fresh-stat-card>

     <fresh-stat-card value="98.7%" label="Uptime" trend="-0.2" trend-label="this week"></fresh-stat-card>
     <fresh-stat-card value="1,284"  label="Active users" icon="ti-users"></fresh-stat-card>

   Attributes:
     value        string , the primary metric
     label        string , metric name
     trend        number , positive = up, negative = down, omit = no trend
     trend-label  string , context for the trend e.g. "vs last month"
     icon         string , tabler icon class
   ============================================================ */

class FreshStatCard extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'label', 'trend', 'trend-label', 'icon'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const value      = this.getAttribute('value')       || '';
    const label      = this.getAttribute('label')       || '';
    const trend      = this.getAttribute('trend');
    const trendLabel = this.getAttribute('trend-label') || '';
    const icon       = this.getAttribute('icon')        || '';

    const hasTrend   = trend !== null && trend !== '';
    const trendVal   = hasTrend ? parseFloat(trend) : 0;
    const isUp       = trendVal > 0;
    const isDown     = trendVal < 0;
    const trendColor = isUp ? 'var(--color-success)' : isDown ? 'var(--color-danger)' : 'var(--text-tertiary)';
    const trendIcon  = isUp
      ? `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2.5L10.5 8H1.5L6 2.5Z" fill="currentColor"/></svg>`
      : `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 9.5L1.5 4H10.5L6 9.5Z" fill="currentColor"/></svg>`;

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; }

        .card {
          background: var(--surface-bg);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
          padding: var(--space-5) var(--space-6);
        }

        .top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-3);
        }

        .label {
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-tertiary);
          letter-spacing: 0.01em;
          -webkit-font-smoothing: antialiased;
        }

        .icon {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-md);
          background: var(--surface-overlay);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-interactive-text);
          font-size: var(--font-size-xl);
          flex-shrink: 0;
        }

        .value {
          font-family: var(--font-sans);
          font-size: var(--font-size-4xl);
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: var(--space-2);
          -webkit-font-smoothing: antialiased;
        }

        .trend {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: ${trendColor};
          -webkit-font-smoothing: antialiased;
        }

        .trend-label {
          font-size: var(--font-size-sm);
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          margin-left: 4px;
        }
      </style>

      <div class="card" part="card">
        <div class="top">
          <span class="label">${label}</span>
          ${icon ? `<div class="icon"><i class="ti ${icon}"></i></div>` : ''}
        </div>
        <div class="value" part="value">${value}</div>
        ${hasTrend ? `
          <div>
            <span class="trend">
              ${trendIcon}
              ${Math.abs(trendVal)}%
            </span>
            ${trendLabel ? `<span class="trend-label">${trendLabel}</span>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('fresh-stat-card', FreshStatCard);
