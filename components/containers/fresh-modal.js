/* ============================================================
   FreshDS, <fresh-modal>

   Usage:
     <fresh-modal id="my-modal" title="Confirm deletion" size="sm">
       Are you sure you want to delete this item? This cannot be undone.
       <div slot="footer">
         <fresh-button variant="danger"   onclick="document.getElementById('my-modal').close()">Delete</fresh-button>
         <fresh-button variant="ghost"    onclick="document.getElementById('my-modal').close()">Cancel</fresh-button>
       </div>
     </fresh-modal>

     <fresh-button onclick="document.getElementById('my-modal').show()">Open modal</fresh-button>

   Attributes:
     open         boolean, controlled open state
     title        string
     size         sm | md | lg   (default: md)
     dismissible  boolean, close on backdrop click  (default: true)

   Methods:
     show()
     close()

   Events:
     close
   ============================================================ */

class FreshModal extends HTMLElement {
  static get observedAttributes() { return ['open', 'title', 'size', 'dismissible']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._closing = false;
  }

  show()  { this.setAttribute('open', ''); }
  close() { this._animateClose(); }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _animateClose() {
    if (this._closing) return;
    this._closing = true;
    const panel   = this.shadowRoot.querySelector('.panel');
    const backdrop = this.shadowRoot.querySelector('.backdrop');
    if (panel) {
      panel.style.animation   = 'modal-out 150ms ease forwards';
      backdrop.style.animation = 'fade-out 150ms ease forwards';
      setTimeout(() => {
        this._closing = false;
        this.removeAttribute('open');
        this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
        document.body.style.overflow = '';
      }, 150);
    } else {
      this.removeAttribute('open');
    }
  }

  _render() {
    // Move title off the host element the first time we see it — the native
    // `title` attribute triggers a browser tooltip on hover, which we never want.
    const rawTitle = this.getAttribute('title');
    if (rawTitle !== null) {
      this._titleCache = rawTitle;
      this.removeAttribute('title'); // triggers another _render; bail and let that one run
      return;
    }
    const isOpen      = this.hasAttribute('open');
    const title       = this._titleCache || '';
    const size        = this.getAttribute('size')  || 'md';
    const dismissible = this.getAttribute('dismissible') !== 'false';

    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';

    const maxWidths = { sm: '400px', md: '560px', lg: '720px' };
    const mw = maxWidths[size] || maxWidths.md;

    if (!isOpen) {
      this.shadowRoot.innerHTML = `<style>:host { display: none; }</style>`;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; }

        .backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.48);
          z-index: 400;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          animation: fade-in 150ms ease forwards;
        }

        .panel {
          background: var(--surface-bg);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--elev-3);
          width: 100%;
          max-width: ${mw};
          max-height: calc(100vh - var(--space-8));
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: modal-in 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-5) var(--space-6);
          border-bottom: 1px solid var(--surface-border);
          flex-shrink: 0;
        }

        .title {
          font-family: var(--font-sans);
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          -webkit-font-smoothing: antialiased;
        }

        .close-btn {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: var(--radius-md);
          color: var(--text-tertiary);
          cursor: pointer;
          transition: background 120ms ease, color 120ms ease;
          flex-shrink: 0;
        }
        .close-btn:hover { background: var(--surface-overlay); color: var(--text-primary); }
        .close-btn:focus-visible {
          outline: 2px solid var(--color-interactive-text);
          outline-offset: 2px;
        }

        .body {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-6);
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          color: var(--text-secondary);
          line-height: 1.65;
          -webkit-font-smoothing: antialiased;
        }

        .body::-webkit-scrollbar { width: 4px; }
        .body::-webkit-scrollbar-thumb { background: var(--surface-border-strong); border-radius: 2px; }

        .footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: var(--space-2);
          padding: var(--space-4) var(--space-6);
          border-top: 1px solid var(--surface-border);
          flex-shrink: 0;
        }

        @keyframes fade-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes modal-in  { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes modal-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.97); } }
      </style>

      <div class="backdrop" part="backdrop">
        <div class="panel" role="dialog" aria-modal="true" ${title ? `aria-labelledby="modal-title"` : ''} part="panel">

          <div class="header" part="header">
            <span class="title" id="modal-title">${title}</span>
            <button class="close-btn" aria-label="Close dialog">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="body" part="body">
            <slot></slot>
          </div>

          <div class="footer" part="footer">
            <slot name="footer"></slot>
          </div>

        </div>
      </div>
    `;

    /* Close button */
    this.shadowRoot.querySelector('.close-btn')
      ?.addEventListener('click', () => this._animateClose());

    /* Backdrop click */
    this.shadowRoot.querySelector('.backdrop')
      ?.addEventListener('click', (e) => {
        if (dismissible && e.target === this.shadowRoot.querySelector('.backdrop')) {
          this._animateClose();
        }
      });

    /* ESC key */
    this._onEsc = (e) => { if (e.key === 'Escape') this._animateClose(); };
    document.addEventListener('keydown', this._onEsc);
  }

  disconnectedCallback() {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._onEsc);
  }
}

customElements.define('fresh-modal', FreshModal);
