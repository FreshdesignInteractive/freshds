/* ============================================================
   FreshDS — <fresh-prompt-history>

   Horizontally scrollable row of recent prompts as clickable chips.

   Usage:
     <fresh-prompt-history
       prompts='[
         "Summarize last quarter revenue",
         "Show active users by region",
         "Compare Q3 vs Q4"
       ]'>
     </fresh-prompt-history>

   Attributes:
     prompts   JSON array of strings
     max-chars number — truncation length per chip (default: 40)

   Events:
     select → detail: { prompt: string, index: number }
   ============================================================ */

class FreshPromptHistory extends HTMLElement {
  static get observedAttributes() { return ['prompts', 'max-chars']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    let prompts = [];
    try { prompts = JSON.parse(this.getAttribute('prompts') || '[]'); } catch {}
    const maxChars = parseInt(this.getAttribute('max-chars') || '40', 10);

    const chips = prompts.map((p, i) => {
      const truncated = p.length > maxChars ? p.slice(0, maxChars).trimEnd() + '…' : p;
      return `<button class="chip" data-index="${i}" title="${p}">${truncated}</button>`;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: block; width: 100%; min-width: 0; overflow: hidden; }

        .row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: none;
        }
        .row::-webkit-scrollbar { display: none; }

        .label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: 0.01em;
        }

        .chip {
          all: unset;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 11px;
          border-radius: 9999px;
          background: var(--surface-overlay);
          border: 1px solid var(--surface-border-strong);
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: border-color 120ms, color 120ms, background 120ms;
          -webkit-font-smoothing: antialiased;
        }

        .chip:hover {
          border-color: var(--color-interactive-text);
          color: var(--color-interactive-text);
          background: var(--badge-primary-bg);
        }

        .chip:focus-visible {
          outline: 2px solid var(--color-interactive-text);
          outline-offset: 2px;
        }

        .empty {
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text-tertiary);
          padding: 4px 0;
        }
      </style>

      <div class="row" role="list" aria-label="Recent prompts">
        <span class="label" aria-hidden="true">
          <i class="ti ti-history" style="font-size:13px"></i>
          Recent
        </span>
        ${prompts.length ? chips : '<span class="empty">No recent prompts</span>'}
      </div>
    `;

    this.shadowRoot.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const idx = parseInt(chip.dataset.index, 10);
        this.dispatchEvent(new CustomEvent('select', {
          detail: { prompt: prompts[idx], index: idx },
          bubbles: true, composed: true
        }));
      });
    });
  }
}

customElements.define('fresh-prompt-history', FreshPromptHistory);
