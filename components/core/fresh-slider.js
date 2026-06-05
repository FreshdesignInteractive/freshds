/* ============================================================
   FreshDS — <fresh-slider>

   Usage:
     <fresh-slider></fresh-slider>
     <fresh-slider value="60" min="0" max="100"></fresh-slider>
     <fresh-slider value="3" min="1" max="5" step="1"></fresh-slider>
     <fresh-slider disabled value="40"></fresh-slider>

   Attributes:
     min       number   (default: 0)
     max       number   (default: 100)
     value     number   (default: 50)
     step      number   (default: 1)
     disabled  boolean

   Events:
     input  → detail: { value: number }
     change → detail: { value: number }
   ============================================================ */

class FreshSlider extends HTMLElement {
  static get observedAttributes() {
    return ['min', 'max', 'value', 'step', 'disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });
  }

  get value() {
    return parseFloat(this.shadowRoot.querySelector('input')?.value ?? this.getAttribute('value') ?? '50');
  }
  set value(v) {
    const input = this.shadowRoot.querySelector('input');
    if (input) { input.value = v; this._updateFill(input); }
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() {
    if (!this.shadowRoot.querySelector('input')) return;
    const prev = this.shadowRoot.querySelector('input')?.value;
    this._render();
    if (prev !== undefined) {
      const input = this.shadowRoot.querySelector('input');
      input.value = prev;
      this._updateFill(input);
    }
  }

  _updateFill(input) {
    const min = parseFloat(input.min) || 0;
    const max = parseFloat(input.max) || 100;
    const val = parseFloat(input.value);
    const pct = Math.round(((val - min) / (max - min)) * 100);
    input.style.setProperty('--fill', pct + '%');
  }

  _render() {
    const min      = this.getAttribute('min')   || '0';
    const max      = this.getAttribute('max')   || '100';
    const val      = this.getAttribute('value') || '50';
    const step     = this.getAttribute('step')  || '1';
    const disabled = this.hasAttribute('disabled');
    const pct      = Math.round(((parseFloat(val) - parseFloat(min)) / (parseFloat(max) - parseFloat(min))) * 100);

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; width: 100%; }

        .wrap {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 10px 0;
        }

        input[type=range] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 9999px;
          background: linear-gradient(
            to right,
            var(--color-interactive) var(--fill, ${pct}%),
            var(--surface-overlay)   var(--fill, ${pct}%)
          );
          --fill: ${pct}%;
          outline: none;
          cursor: ${disabled ? 'not-allowed' : 'pointer'};
          opacity: ${disabled ? '0.4' : '1'};
          transition: opacity 150ms ease;
          border: none;
        }

        /* Thumb — WebKit */
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-interactive);
          border: 2px solid var(--surface-input);
          box-shadow: 0 0 0 1px var(--color-interactive), 0 1px 3px rgba(0,0,0,0.18);
          cursor: ${disabled ? 'not-allowed' : 'grab'};
          transition:
            transform  120ms ease,
            box-shadow 120ms ease;
        }
        input[type=range]::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.15);
        }
        input[type=range]:not(:disabled):hover::-webkit-slider-thumb {
          box-shadow: 0 0 0 1px var(--color-interactive), 0 0 0 4px var(--input-focus-ring);
        }

        /* Thumb — Firefox */
        input[type=range]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--color-interactive);
          border: 2px solid var(--surface-input);
          box-shadow: 0 0 0 1px var(--color-interactive);
          cursor: ${disabled ? 'not-allowed' : 'grab'};
        }

        /* Focus ring */
        input[type=range]:focus-visible::-webkit-slider-thumb {
          box-shadow:
            0 0 0 2px var(--surface-input),
            0 0 0 5px var(--color-interactive);
        }
      </style>

      <div class="wrap">
        <input
          type="range"
          min="${min}"
          max="${max}"
          value="${val}"
          step="${step}"
          ${disabled ? 'disabled' : ''}
          part="input"
        >
      </div>
    `;

    const input = this.shadowRoot.querySelector('input');
    input?.addEventListener('input', (e) => {
      this._updateFill(e.target);
      this.dispatchEvent(new CustomEvent('input', {
        detail: { value: parseFloat(e.target.value) },
        bubbles: true,
        composed: true
      }));
    });
    input?.addEventListener('change', (e) => {
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: parseFloat(e.target.value) },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('fresh-slider', FreshSlider);
