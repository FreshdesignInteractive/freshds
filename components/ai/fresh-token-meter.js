/* ============================================================
   FreshDS — <fresh-token-meter>

   Context window usage indicator. Color shifts at warn threshold.

   Usage:
     <fresh-token-meter used="24500" total="100000"></fresh-token-meter>
     <fresh-token-meter used="85000" total="100000" warn-at="80"></fresh-token-meter>
     <fresh-token-meter used="12000" total="200000" compact></fresh-token-meter>

   Attributes:
     used     number — tokens consumed
     total    number — total context window
     warn-at  number — percentage threshold for warning (default: 80)
     compact  boolean — minimal display (bar + count only)
   ============================================================ */

class FreshTokenMeter extends HTMLElement {
  static get observedAttributes() { return ['used', 'total', 'warn-at', 'compact']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _fmt(n) {
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
    return String(n);
  }

  _render() {
    const used    = parseInt(this.getAttribute('used')    || '0',   10);
    const total   = parseInt(this.getAttribute('total')   || '4096',10);
    const warnAt  = parseInt(this.getAttribute('warn-at') || '80',  10);
    const compact = this.hasAttribute('compact');

    const pct     = Math.min(100, Math.round((used / total) * 100));
    const isWarn  = pct >= warnAt;
    const isCrit  = pct >= 95;

    const color = isCrit ? 'var(--color-danger)' : isWarn ? 'var(--color-warning)' : 'var(--color-interactive)';

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: inline-flex; }

        .meter {
          display: flex;
          flex-direction: column;
          gap: ${compact ? '4px' : '6px'};
          min-width: ${compact ? '120px' : '180px'};
        }

        .top {
          display: ${compact ? 'none' : 'flex'};
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
        }

        .label {
          font-family: var(--font-sans);
          font-size: var(--font-size-xs);
          font-weight: 500;
          color: var(--text-tertiary);
          letter-spacing: 0.01em;
          -webkit-font-smoothing: antialiased;
        }

        .counts {
          font-family: var(--font-mono);
          font-size: var(--font-size-xs);
          color: ${isWarn ? color : 'var(--text-tertiary)'};
          white-space: nowrap;
        }

        .track {
          height: 4px;
          background: var(--surface-overlay);
          border-radius: 9999px;
          overflow: hidden;
        }

        .fill {
          height: 100%;
          width: ${pct}%;
          background: ${color};
          border-radius: 9999px;
          transition: width 400ms ease, background 300ms ease;
        }

        .compact-row {
          display: ${compact ? 'flex' : 'none'};
          align-items: center;
          gap: 6px;
        }

        .compact-label {
          font-family: var(--font-mono);
          font-size: var(--font-size-2xs);
          color: var(--text-tertiary);
          white-space: nowrap;
        }
      </style>

      <div class="meter" part="meter" role="meter" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Token usage: ${pct}%">
        <div class="top">
          <span class="label">Tokens used</span>
          <span class="counts">${this._fmt(used)} / ${this._fmt(total)}</span>
        </div>

        <div class="compact-row">
          <div class="track" style="flex:1"><div class="fill"></div></div>
          <span class="compact-label">${pct}%</span>
        </div>

        ${!compact ? `<div class="track"><div class="fill"></div></div>` : ''}
      </div>
    `;
  }
}

customElements.define('fresh-token-meter', FreshTokenMeter);
