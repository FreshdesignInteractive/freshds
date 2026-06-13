/* ============================================================
   FreshDS, <fresh-ai-mode-toggle>

   Global switch for enabling or disabling AI features.
   Pill-shaped toggle with an animated AI indicator.

   Usage:
     <fresh-ai-mode-toggle></fresh-ai-mode-toggle>
     <fresh-ai-mode-toggle on></fresh-ai-mode-toggle>
     <fresh-ai-mode-toggle on label="AI Copilot"></fresh-ai-mode-toggle>

   Attributes:
     on      boolean, whether AI mode is active
     label   string , displayed next to the toggle (default: "AI mode")
     size    sm | md (default: md)

   Events:
     change → detail: { on: boolean }
   ============================================================ */

class FreshAiModeToggle extends HTMLElement {
  static get observedAttributes() { return ['on', 'label', 'size']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _toggle() {
    if (this.hasAttribute('on')) {
      this.removeAttribute('on');
    } else {
      this.setAttribute('on', '');
    }
    this.dispatchEvent(new CustomEvent('change', {
      detail: { on: this.hasAttribute('on') },
      bubbles: true, composed: true
    }));
  }

  _render() {
    const isOn  = this.hasAttribute('on');
    const label = this.getAttribute('label') || 'AI mode';
    const size  = this.getAttribute('size')  || 'md';
    const sm    = size === 'sm';

    const trackW  = sm ? 42  : 52;
    const trackH  = sm ? 22  : 28;
    const knobSz  = sm ? 16  : 22;
    const knobOff = sm ? 3   : 3;
    const travelX = trackW - knobSz - (knobOff * 2) - 2;
    const iconSz  = sm ? 9   : 11;
    const fontSize = sm ? '11px' : '13px';

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: inline-flex; }

        .toggle-wrap {
          display: inline-flex;
          align-items: center;
          gap: ${sm ? '7px' : '9px'};
          cursor: pointer;
          user-select: none;
        }

        .track {
          position: relative;
          width: ${trackW}px;
          height: ${trackH}px;
          border-radius: 9999px;
          background: ${isOn
            ? 'linear-gradient(135deg, var(--color-interactive), var(--color-interactive-hover))'
            : 'var(--surface-overlay)'};
          border: 1px solid ${isOn ? 'transparent' : 'var(--surface-border-strong)'};
          transition: background 250ms ease, border-color 250ms ease;
          flex-shrink: 0;
        }

        .knob {
          position: absolute;
          top: 50%;
          left: ${knobOff}px;
          width: ${knobSz}px;
          height: ${knobSz}px;
          border-radius: 50%;
          background: ${isOn ? 'var(--text-inverse)' : 'var(--text-tertiary)'};
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 250ms cubic-bezier(0.34,1.56,0.64,1), background 250ms;
          transform: translateX(${isOn ? travelX : 0}px) translateY(-50%);
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
          font-size: ${iconSz}px;
          color: ${isOn ? 'var(--color-interactive-text)' : 'var(--surface-overlay)'};
        }

        @keyframes spin-once {
          from { transform: translateX(${isOn ? travelX : 0}px) translateY(-50%) rotate(0deg); }
          to   { transform: translateX(${isOn ? travelX : 0}px) translateY(-50%) rotate(360deg); }
        }

        .track-glow {
          position: absolute;
          inset: -1px;
          border-radius: 9999px;
          background: linear-gradient(135deg, var(--color-interactive), var(--color-interactive-hover));
          opacity: ${isOn ? '0.25' : '0'};
          transition: opacity 300ms ease;
          filter: blur(6px);
          z-index: -1;
        }

        .label-wrap {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .label {
          font-family: var(--font-sans);
          font-size: ${fontSize};
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1;
          -webkit-font-smoothing: antialiased;
        }

        .status {
          font-family: var(--font-sans);
          font-size: var(--font-size-2xs);
          font-weight: 500;
          color: ${isOn ? 'var(--color-interactive-text)' : 'var(--text-tertiary)'};
          letter-spacing: 0.03em;
          line-height: 1;
          transition: color 250ms;
        }

        button.toggle-wrap {
          all: unset;
          display: inline-flex;
          align-items: center;
          gap: ${sm ? '7px' : '9px'};
          cursor: pointer;
        }
        button.toggle-wrap:focus-visible .track {
          outline: 2px solid var(--color-interactive-text);
          outline-offset: 2px;
        }
      </style>

      <button
        class="toggle-wrap"
        role="switch"
        aria-checked="${isOn}"
        aria-label="${label}, ${isOn ? 'on' : 'off'}"
      >
        <div class="track">
          <div class="track-glow"></div>
          <div class="knob">
            <i class="ti ti-sparkles"></i>
          </div>
        </div>
        <div class="label-wrap">
          <span class="label">${label}</span>
          <span class="status">${isOn ? 'Active' : 'Disabled'}</span>
        </div>
      </button>
    `;

    this.shadowRoot.querySelector('.toggle-wrap')?.addEventListener('click', () => this._toggle());
  }
}

customElements.define('fresh-ai-mode-toggle', FreshAiModeToggle);
