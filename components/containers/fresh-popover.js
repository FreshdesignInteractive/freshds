/* ============================================================
   FreshDS, <fresh-popover>

   Wraps a trigger element. Clicking the trigger opens a floating
   panel; clicking outside closes it.

   Usage:
     <fresh-popover>
       <fresh-button slot="trigger" variant="secondary">
         Options <i class="ti ti-chevron-down"></i>
       </fresh-button>

       <div style="padding:8px 0;min-width:180px">
         <div class="menu-item">Edit</div>
         <div class="menu-item">Duplicate</div>
         <div class="menu-item danger">Delete</div>
       </div>
     </fresh-popover>

   Attributes:
     placement  top | bottom | left | right   (default: bottom)
     offset     number px from trigger         (default: 6)

   Events:
     open, close
   ============================================================ */

class FreshPopover extends HTMLElement {
  static get observedAttributes() { return ['placement', 'offset']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open     = false;
    this._onOutside = this._onOutside.bind(this);
  }

  connectedCallback() { this._render(); }

  disconnectedCallback() {
    document.removeEventListener('click', this._onOutside);
    document.removeEventListener('keydown', this._onKey.bind(this));
  }

  attributeChangedCallback() {
    if (this.isConnected) this._render();
  }

  _show() {
    this._open = true;
    this._render();
    this._position();
    setTimeout(() => document.addEventListener('click', this._onOutside), 0);
    document.addEventListener('keydown', this._onEsc = (e) => {
      if (e.key === 'Escape') this._hide();
    });
    this.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true }));
  }

  _hide() {
    this._open = false;
    this._render();
    document.removeEventListener('click', this._onOutside);
    document.removeEventListener('keydown', this._onEsc);
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  _onOutside(e) {
    if (!this.contains(e.target) && !this.shadowRoot.contains(e.target)) this._hide();
  }

  _position() {
    requestAnimationFrame(() => {
      const panel     = this.shadowRoot.querySelector('.panel');
      const trigger   = this.shadowRoot.querySelector('slot[name="trigger"]')
                          ?.assignedElements()[0];
      if (!panel || !trigger) return;

      const placement = this.getAttribute('placement') || 'bottom';
      const offset    = parseInt(this.getAttribute('offset') || '6', 10);
      const tr        = trigger.getBoundingClientRect();

      panel.style.position = 'fixed';
      panel.style.zIndex   = '300';

      switch (placement) {
        case 'bottom':
          panel.style.top  = `${tr.bottom + offset}px`;
          panel.style.left = `${tr.left}px`;
          break;
        case 'top':
          panel.style.bottom = `${window.innerHeight - tr.top + offset}px`;
          panel.style.top    = 'auto';
          panel.style.left   = `${tr.left}px`;
          break;
        case 'right':
          panel.style.top  = `${tr.top}px`;
          panel.style.left = `${tr.right + offset}px`;
          break;
        case 'left':
          panel.style.top   = `${tr.top}px`;
          panel.style.right = `${window.innerWidth - tr.left + offset}px`;
          panel.style.left  = 'auto';
          break;
      }

      /* Keep inside viewport horizontally */
      const pr = panel.getBoundingClientRect();
      if (pr.right > window.innerWidth - 8) {
        panel.style.left = `${tr.right - pr.width}px`;
      }
    });
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: inline-flex; position: relative; }

        .trigger-wrap { display: contents; }

        .panel {
          position: fixed;
          background: var(--surface-bg);
          border: 1px solid var(--surface-border-strong);
          border-radius: var(--radius-lg);
          box-shadow: var(--elev-3);
          min-width: 160px;
          display: ${this._open ? 'block' : 'none'};
          animation: ${this._open ? 'pop-in 120ms cubic-bezier(0.16,1,0.3,1) forwards' : 'none'};
          overflow: hidden;
        }

        @keyframes pop-in {
          from { opacity: 0; transform: scale(0.96) translateY(-4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      </style>

      <div class="trigger-wrap">
        <slot name="trigger"></slot>
      </div>

      <div class="panel" part="panel" role="dialog">
        <slot></slot>
      </div>
    `;

    this.shadowRoot.querySelector('slot[name="trigger"]')
      ?.addEventListener('slotchange', () => {
        this.shadowRoot.querySelector('slot[name="trigger"]')
          ?.assignedElements()[0]
          ?.addEventListener('click', (e) => {
            e.stopPropagation();
            this._open ? this._hide() : this._show();
          });
      });

    if (this._open) {
      this.shadowRoot.querySelector('slot[name="trigger"]')
        ?.assignedElements()[0]
        ?.addEventListener('click', (e) => {
          e.stopPropagation();
          this._hide();
        }, { once: true });
    }
  }
}

customElements.define('fresh-popover', FreshPopover);
