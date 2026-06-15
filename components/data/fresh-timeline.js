/* ============================================================
   FreshDS, <fresh-timeline>

   Usage:
     <fresh-timeline items='[
       {
         "timestamp": "2 min ago",
         "title": "Deployment complete",
         "description": "v2.4.1 deployed to production by Jane Smith.",
         "icon": "ti-rocket",
         "variant": "success"
       },
       {
         "timestamp": "1 hr ago",
         "title": "PR #482 merged",
         "icon": "ti-git-merge",
         "variant": "primary"
       },
       {
         "timestamp": "Yesterday",
         "title": "Review requested",
         "description": "2 reviewers assigned.",
         "icon": "ti-eye"
       }
     ]'>
     </fresh-timeline>

   Attributes:
     items   JSON array  { timestamp, title, description?, icon?, variant? }
             variant: primary | success | warning | danger | neutral (default: neutral)
   ============================================================ */

class FreshTimeline extends HTMLElement {
  static get observedAttributes() { return ['items']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    let items = [];
    try { items = JSON.parse(this.getAttribute('items') || '[]'); }
    catch {}

    const variantColors = {
      primary: { bg: 'var(--color-interactive)',  icon: 'var(--text-inverse)' },
      success: { bg: 'var(--color-success)',       icon: 'var(--text-inverse)' },
      warning: { bg: 'var(--color-warning)',       icon: 'var(--text-inverse)' },
      danger:  { bg: 'var(--color-danger)',        icon: 'var(--text-inverse)' },
      neutral: { bg: 'var(--surface-border-strong)', icon: 'var(--text-secondary)' },
    };

    const entries = items.map((item, i) => {
      const isLast = i === items.length - 1;
      const vc     = variantColors[item.variant || 'neutral'];

      return `
        <div class="entry" part="entry">
          <div class="left">
            <div class="dot" style="background:${vc.bg};color:${vc.icon}">
              ${item.icon ? `<i class="ti ${item.icon}"></i>` : ''}
            </div>
            ${!isLast ? `<div class="line"></div>` : ''}
          </div>
          <div class="content">
            <div class="header">
              <span class="title">${item.title}</span>
              ${item.timestamp ? `<span class="timestamp">${item.timestamp}</span>` : ''}
            </div>
            ${item.description ? `<div class="desc">${item.description}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; }

        .entry {
          display: flex;
          gap: var(--space-4);
        }

        .left {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }

        .dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid var(--surface-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-md);
          flex-shrink: 0;
          z-index: 1;
        }

        .line {
          width: 1px;
          flex: 1;
          min-height: 20px;
          background: var(--surface-border);
          margin: 4px 0;
        }

        .content {
          flex: 1;
          padding-bottom: var(--space-5);
          min-width: 0;
        }

        .entry:last-child .content { padding-bottom: 0; }

        .header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: var(--space-3);
          margin-top: 4px;
        }

        .title {
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          font-weight: 500;
          color: var(--text-primary);
          -webkit-font-smoothing: antialiased;
        }

        .timestamp {
          font-family: var(--font-sans);
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .desc {
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          margin-top: 4px;
          line-height: 1.55;
          -webkit-font-smoothing: antialiased;
        }
      </style>

      <div part="timeline">
        ${entries || '<span style="font-family:var(--font-sans);font-size:var(--font-size-md);color:var(--text-tertiary)">No items</span>'}
      </div>
    `;
  }
}

customElements.define('fresh-timeline', FreshTimeline);
