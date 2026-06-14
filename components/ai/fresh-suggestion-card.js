/* ============================================================
   FreshDS, <fresh-suggestion-card>

   Proactive AI recommendation with accept and dismiss actions.

   Usage:
     <fresh-suggestion-card
       icon="ti-chart-bar"
       title="Revenue is up 18% this week"
       description="This is above your usual growth rate. Would you like a detailed breakdown?">
     </fresh-suggestion-card>

   Attributes:
     icon         tabler icon class
     title        string
     description  string
     accept-label string (default: "Show me")
     dismiss      boolean, if set, the component is hidden

   Events:
     accept , user clicked the primary action
     dismiss, user dismissed the card
   ============================================================ */

class FreshSuggestionCard extends HTMLElement {
  static get observedAttributes() {
    return ['icon', 'title', 'description', 'accept-label'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const icon        = this.getAttribute('icon')         || 'ti-sparkles';
    const title       = this.getAttribute('title')        || '';
    const description = this.getAttribute('description')  || '';
    const acceptLabel = this.getAttribute('accept-label') || 'Show me';

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: block; }

        .card {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-5);
          background: var(--surface-bg);
          border: 1px solid var(--surface-border);
          border-left: 3px solid var(--color-ai);
          border-radius: var(--radius-lg);
          animation: slide-up 200ms cubic-bezier(0.16,1,0.3,1) forwards;
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: var(--badge-primary-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-ai-text);
          font-size: var(--font-size-xl);
          flex-shrink: 0;
        }

        .body { flex: 1; min-width: 0; }

        .title {
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 3px;
          -webkit-font-smoothing: antialiased;
        }

        .desc {
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          line-height: 1.55;
          margin-bottom: 10px;
          -webkit-font-smoothing: antialiased;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .accept {
          all: unset;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          background: var(--color-ai);
          color: var(--text-inverse);
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          font-weight: 500;
          cursor: pointer;
          transition: background 120ms, transform 80ms;
          -webkit-font-smoothing: antialiased;
        }
        .accept:hover  { background: var(--btn-primary-hover); }
        .accept:active { transform: scale(0.97); }

        .dismiss {
          all: unset;
          display: inline-flex;
          align-items: center;
          height: 28px;
          padding: 0 10px;
          border-radius: var(--radius-md);
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          cursor: pointer;
          transition: color 120ms, background 120ms;
        }
        .dismiss:hover { color: var(--text-secondary); background: var(--surface-overlay); }
      </style>

      <div class="card" part="card" role="note">
        <div class="icon" aria-hidden="true">
          <i class="ti ${icon}"></i>
        </div>
        <div class="body">
          ${title       ? `<div class="title">${title}</div>`       : ''}
          ${description ? `<div class="desc">${description}</div>`  : ''}
          <div class="actions">
            <button class="accept">
              <i class="ti ti-sparkles" style="font-size:var(--font-size-xs)"></i>
              ${acceptLabel}
            </button>
            <button class="dismiss">Dismiss</button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.accept')?.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('accept', { bubbles: true, composed: true }))
    );

    this.shadowRoot.querySelector('.dismiss')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
      this.remove();
    });
  }
}

customElements.define('fresh-suggestion-card', FreshSuggestionCard);
