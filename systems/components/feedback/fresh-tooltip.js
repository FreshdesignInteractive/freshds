/* ============================================================
   FreshDS, <fresh-tooltip>

   Wraps any trigger element. Shows the tooltip on hover/focus.

   Usage:
     <fresh-tooltip tip="Copy to clipboard">
       <fresh-button variant="ghost" icon-only>…</fresh-button>
     </fresh-tooltip>

     <fresh-tooltip tip="Saved 2 minutes ago" placement="bottom">
       <span>Last saved</span>
     </fresh-tooltip>

   Attributes:
     tip        string          , tooltip text
     placement  top | bottom | left | right  (default: top)
     delay      number ms        (default: 200)
   ============================================================ */

class FreshTooltip extends HTMLElement {
  static get observedAttributes() { return ['tip', 'placement']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._show   = this._show.bind(this);
    this._hide   = this._hide.bind(this);
    this._timer  = null;
    this._visible = false;
  }

  connectedCallback() {
    this._render();
    this.addEventListener('mouseenter', this._show);
    this.addEventListener('mouseleave', this._hide);
    this.addEventListener('focusin',    this._show);
    this.addEventListener('focusout',   this._hide);
  }

  disconnectedCallback() {
    this.removeEventListener('mouseenter', this._show);
    this.removeEventListener('mouseleave', this._hide);
    this.removeEventListener('focusin',    this._show);
    this.removeEventListener('focusout',   this._hide);
    clearTimeout(this._timer);
  }

  attributeChangedCallback() {
    if (this.isConnected) this._render();
  }

  _show() {
    const delay = parseInt(this.getAttribute('delay') || '200', 10);
    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      const tip = this.shadowRoot.querySelector('.tip');
      if (tip) { tip.classList.add('visible'); this._visible = true; }
    }, delay);
  }

  _hide() {
    clearTimeout(this._timer);
    const tip = this.shadowRoot.querySelector('.tip');
    if (tip) { tip.classList.remove('visible'); this._visible = false; }
  }

  _render() {
    const tip       = this.getAttribute('tip')       || '';
    const placement = this.getAttribute('placement') || 'top';

    /* Position and arrow for each placement */
    const pos = {
      top:    { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
      bottom: { top:    'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
      left:   { right:  'calc(100% + 8px)', top:  '50%', transform: 'translateY(-50%)' },
      right:  { left:   'calc(100% + 8px)', top:  '50%', transform: 'translateY(-50%)' },
    }[placement] || {};

    const posCSS = Object.entries(pos).map(([k, v]) => `${k}: ${v};`).join(' ');

    const arrowBase = `
      content: '';
      position: absolute;
      width: 0; height: 0;
      border: 5px solid transparent;
    `;

    const arrows = {
      top:    `&::after { ${arrowBase} top: 100%; left: 50%; transform: translateX(-50%); border-top-color: var(--tooltip-bg); }`,
      bottom: `&::after { ${arrowBase} bottom: 100%; left: 50%; transform: translateX(-50%); border-bottom-color: var(--tooltip-bg); }`,
      left:   `&::after { ${arrowBase} left: 100%; top: 50%; transform: translateY(-50%); border-left-color: var(--tooltip-bg); }`,
      right:  `&::after { ${arrowBase} right: 100%; top: 50%; transform: translateY(-50%); border-right-color: var(--tooltip-bg); }`,
    };

    const arrowCSS = arrows[placement]
      ?.replace(/&::after/g, '.tip::after')
      .replace('content: \'\'', "content: ''") || '';

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host {
          display: inline-flex;
          position: relative;
          align-items: center;
          justify-content: center;
        }

        .trigger { display: contents; }

        .tip {
          position: absolute;
          ${posCSS}
          z-index: 200;
          padding: 5px 9px;
          border-radius: var(--radius-sm);
          background: var(--tooltip-bg);
          color: var(--tooltip-text);
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          line-height: 1.4;
          white-space: nowrap;
          max-width: 240px;
          white-space: normal;
          text-align: center;
          pointer-events: none;
          opacity: 0;
          transition: opacity 120ms ease;
          -webkit-font-smoothing: antialiased;
        }

        .tip.visible { opacity: 1; }

        ${arrowCSS}
      </style>

      <div class="trigger"><slot></slot></div>
      ${tip ? `<div class="tip" role="tooltip">${tip}</div>` : ''}
    `;

    if (this._visible) {
      this.shadowRoot.querySelector('.tip')?.classList.add('visible');
    }
  }
}

customElements.define('fresh-tooltip', FreshTooltip);
