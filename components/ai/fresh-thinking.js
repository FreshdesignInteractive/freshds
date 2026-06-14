/* ============================================================
   FreshDS, <fresh-thinking>

   Animated state shown while the AI processes a request.

   Usage:
     <fresh-thinking></fresh-thinking>
     <fresh-thinking label="Analyzing your data"></fresh-thinking>
     <fresh-thinking label="Writing code" size="sm"></fresh-thinking>

   Attributes:
     label   string    (default: "Thinking")
     size    sm | md   (default: md)
   ============================================================ */

class FreshThinking extends HTMLElement {
  static get observedAttributes() { return ['label', 'size']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const label = this.getAttribute('label') || 'Thinking';
    const size  = this.getAttribute('size')  || 'md';
    const dotSz = size === 'sm' ? '5px' : '6px';
    const fsize = size === 'sm' ? '12px' : '13px';

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: inline-flex; }

        .wrap {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: ${size === 'sm' ? '7px 12px' : '9px 14px'};
          background: var(--surface-subtle);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
        }

        .dots {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dot {
          width: ${dotSz};
          height: ${dotSz};
          border-radius: 50%;
          background: var(--color-ai);
          opacity: 0.3;
          animation: bounce 1.2s ease-in-out infinite;
        }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30%            { opacity: 1;   transform: translateY(-3px); }
        }

        .label {
          font-family: var(--font-sans);
          font-size: ${fsize};
          color: var(--text-secondary);
          -webkit-font-smoothing: antialiased;
        }
      </style>

      <div class="wrap" role="status" aria-label="${label}" part="wrap">
        <div class="dots" aria-hidden="true">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <span class="label">${label}</span>
      </div>
    `;
  }
}

customElements.define('fresh-thinking', FreshThinking);
