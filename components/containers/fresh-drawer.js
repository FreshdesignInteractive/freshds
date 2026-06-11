/* ============================================================
   FreshDS — <fresh-drawer>

   Usage:
     <fresh-drawer id="settings-drawer" title="Settings" placement="right">
       <div>Drawer body content…</div>
       <div slot="footer">
         <fresh-button variant="primary" onclick="document.getElementById('settings-drawer').close()">Save</fresh-button>
         <fresh-button variant="ghost"   onclick="document.getElementById('settings-drawer').close()">Cancel</fresh-button>
       </div>
     </fresh-drawer>

     <fresh-button onclick="document.getElementById('settings-drawer').show()">Open</fresh-button>

   Attributes:
     open       boolean
     title      string
     placement  left | right   (default: right)
     size       sm | md | lg   (default: md)

   Methods:
     show()
     close()

   Events:
     close
   ============================================================ */

class FreshDrawer extends HTMLElement {
  static get observedAttributes() { return ['open', 'title', 'placement', 'size']; }

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
    const panel    = this.shadowRoot.querySelector('.panel');
    const backdrop = this.shadowRoot.querySelector('.backdrop');
    const placement = this.getAttribute('placement') || 'right';
    const outX      = placement === 'right' ? '100%' : '-100%';

    if (panel) {
      panel.style.transition   = 'transform 220ms ease';
      panel.style.transform    = `translateX(${outX})`;
      backdrop.style.transition = 'opacity 220ms ease';
      backdrop.style.opacity   = '0';
      setTimeout(() => {
        this._closing = false;
        this.removeAttribute('open');
        this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
        document.body.style.overflow = '';
      }, 220);
    } else {
      this.removeAttribute('open');
    }
  }

  _render() {
    const isOpen    = this.hasAttribute('open');
    const title     = this.getAttribute('title')     || '';
    const placement = this.getAttribute('placement') || 'right';
    const size      = this.getAttribute('size')      || 'md';

    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';

    const widths = { sm: '320px', md: '420px', lg: '560px' };
    const w = widths[size] || widths.md;
    const side = placement === 'right' ? 'right: 0;' : 'left: 0;';

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
          background: rgba(0, 0, 0, 0.4);
          z-index: 300;
          animation: fade-in 200ms ease forwards;
        }

        .panel {
          position: fixed;
          top: 0;
          ${side}
          width: ${w};
          max-width: calc(100vw - var(--space-8));
          height: 100vh;
          background: var(--surface-bg);
          border-${placement === 'right' ? 'left' : 'right'}: 1px solid var(--surface-border);
          box-shadow: var(--elev-3);
          display: flex;
          flex-direction: column;
          z-index: 301;
          animation: slide-in-${placement} 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
          font-size: var(--font-size-lg);
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
          gap: var(--space-2);
          padding: var(--space-4) var(--space-6);
          border-top: 1px solid var(--surface-border);
          flex-shrink: 0;
        }

        @keyframes fade-in       { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slide-in-left  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      </style>

      <div class="backdrop" part="backdrop"></div>

      <div class="panel" role="dialog" aria-modal="true" ${title ? 'aria-labelledby="drawer-title"' : ''} part="panel">
        <div class="header" part="header">
          <span class="title" id="drawer-title">${title}</span>
          <button class="close-btn" aria-label="Close">
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
    `;

    this.shadowRoot.querySelector('.close-btn')
      ?.addEventListener('click', () => this._animateClose());

    this.shadowRoot.querySelector('.backdrop')
      ?.addEventListener('click', () => this._animateClose());

    this._onEsc = (e) => { if (e.key === 'Escape') this._animateClose(); };
    document.addEventListener('keydown', this._onEsc);
  }

  disconnectedCallback() {
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._onEsc);
  }
}

customElements.define('fresh-drawer', FreshDrawer);
