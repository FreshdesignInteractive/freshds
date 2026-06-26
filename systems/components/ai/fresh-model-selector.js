/* ============================================================
   FreshDS, <fresh-model-selector>

   Dropdown for switching AI models within an application.

   Usage:
     <fresh-model-selector
       selected="sonnet"
       models='[
         {"key":"opus",    "name":"Claude Opus 4",    "badge":"Most capable"},
         {"key":"sonnet",  "name":"Claude Sonnet 4",  "badge":"Balanced"},
         {"key":"haiku",   "name":"Claude Haiku 4",   "badge":"Fast"}
       ]'>
     </fresh-model-selector>

   Attributes:
     models    JSON array  { key, name, badge?, description?, disabled? }
     selected  string, key of the currently selected model

   Events:
     change → detail: { key, name }
   ============================================================ */

class FreshModelSelector extends HTMLElement {
  static get observedAttributes() { return ['models', 'selected']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = false;
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._open = false; this._render(); }

  _parse() {
    try { return JSON.parse(this.getAttribute('models') || '[]'); }
    catch { return []; }
  }

  _select(model) {
    if (model.disabled) return;
    this.setAttribute('selected', model.key);
    this._open = false;
    this.dispatchEvent(new CustomEvent('change', {
      detail: { key: model.key, name: model.name },
      bubbles: true, composed: true
    }));
    this._render();
  }

  _render() {
    const models   = this._parse();
    const selKey   = this.getAttribute('selected') || '';
    const selModel = models.find(m => m.key === selKey) || models[0];

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: inline-flex; position: relative; }

        .trigger {
          all: unset;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 34px;
          padding: 0 12px;
          background: var(--surface-canvas);
          border: 1px solid var(--surface-border-strong);
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          color: var(--text-primary);
          cursor: pointer;
          transition: border-color 150ms, background 150ms;
          -webkit-font-smoothing: antialiased;
        }
        .trigger:hover { border-color: var(--text-tertiary); }
        .trigger:focus-visible { outline: 2px solid var(--color-ai-text); outline-offset: 2px; }

        .ai-icon { color: var(--color-ai-text); font-size: var(--font-size-lg); }
        .name    { font-weight: 500; }
        .chevron { color: var(--text-tertiary); font-size: var(--font-size-sm); transition: transform 200ms ease; }
        .chevron.open { transform: rotate(180deg); }

        .dropdown {
          display: ${this._open ? 'block' : 'none'};
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          min-width: 240px;
          background: var(--surface-canvas);
          border: 1px solid var(--surface-border-strong);
          border-radius: var(--radius-lg);
          box-shadow: var(--elev-3);
          z-index: 200;
          overflow: hidden;
          animation: pop-in 120ms cubic-bezier(0.16,1,0.3,1) forwards;
        }

        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.97) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px var(--space-4);
          cursor: pointer;
          transition: background 100ms;
          border-bottom: 1px solid var(--surface-border);
        }
        .option:last-child { border-bottom: none; }
        .option:hover:not(.disabled) { background: var(--surface-subtle); }
        .option.active { background: var(--nav-active-bg); }
        .option.disabled { opacity: 0.38; cursor: not-allowed; }

        .opt-left { display: flex; align-items: center; gap: 10px; }

        .opt-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--surface-border-strong);
          flex-shrink: 0;
          transition: background 120ms;
        }
        .option.active .opt-dot { background: var(--color-ai); }

        .opt-name {
          font-family: var(--font-mono);
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--text-primary);
        }

        .opt-badge {
          font-family: var(--font-sans);
          font-size: var(--font-size-2xs);
          font-weight: 500;
          padding: 2px 7px;
          border-radius: 9999px;
          background: var(--surface-overlay);
          color: var(--text-tertiary);
          border: 1px solid var(--surface-border);
        }
        .option.active .opt-badge {
          background: var(--badge-ai-bg);
          color: var(--badge-ai-text);
          border-color: var(--badge-ai-border);
        }
      </style>

      <button class="trigger" part="trigger">
        <i class="ti ti-cpu ai-icon" aria-hidden="true"></i>
        <span class="name">${selModel?.name || 'Select model'}</span>
        <i class="ti ti-chevron-down chevron ${this._open ? 'open' : ''}" aria-hidden="true"></i>
      </button>

      <div class="dropdown" role="listbox" part="dropdown">
        ${models.map(m => `
          <div
            class="option ${m.key === selKey ? 'active' : ''} ${m.disabled ? 'disabled' : ''}"
            data-key="${m.key}"
            role="option"
            aria-selected="${m.key === selKey}"
          >
            <div class="opt-left">
              <span class="opt-dot"></span>
              <span class="opt-name">${m.name}</span>
            </div>
            ${m.badge ? `<span class="opt-badge">${m.badge}</span>` : ''}
          </div>
        `).join('')}
      </div>
    `;

    this.shadowRoot.querySelector('.trigger')?.addEventListener('click', e => {
      e.stopPropagation();
      this._open = !this._open;
      this._render();
      if (this._open) {
        setTimeout(() => document.addEventListener('click', this._outsideHandler = () => {
          this._open = false; this._render();
          document.removeEventListener('click', this._outsideHandler);
        }), 0);
      }
    });

    this.shadowRoot.querySelectorAll('.option:not(.disabled)').forEach(opt => {
      opt.addEventListener('click', () => {
        const m = models.find(m => m.key === opt.dataset.key);
        if (m) this._select(m);
      });
    });
  }
}

customElements.define('fresh-model-selector', FreshModelSelector);
