/* ============================================================
   FreshDS, <fresh-stepper>

   Usage:
     <fresh-stepper
       step="2"
       steps='[
         {"label":"Account",  "description":"Basic info"},
         {"label":"Profile",  "description":"Your details"},
         {"label":"Billing",  "description":"Payment method"},
         {"label":"Review"}
       ]'>
     </fresh-stepper>

   Attributes:
     step          number , current step, 1-based      (default: 1)
     steps         JSON array of { label, description? }
     orientation   horizontal | vertical                 (default: horizontal)
   ============================================================ */

class FreshStepper extends HTMLElement {
  static get observedAttributes() { return ['step', 'steps', 'orientation']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const step        = Math.max(1, parseInt(this.getAttribute('step') || '1', 10));
    const orientation = this.getAttribute('orientation') || 'horizontal';
    const isVertical  = orientation === 'vertical';

    let steps = [];
    try { steps = JSON.parse(this.getAttribute('steps') || '[]'); }
    catch {}

    /* SVG checkmark for completed steps */
    const check = `<svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 3.5L3.8 6.5L9 1" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const stepItems = steps.map((s, i) => {
      const n          = i + 1;
      const isComplete = n < step;
      const isActive   = n === step;
      const isUpcoming = n > step;
      const isLast     = i === steps.length - 1;

      const circleContent = isComplete
        ? check
        : `<span class="num">${n}</span>`;

      const stateClass = isComplete ? 'complete' : isActive ? 'active' : 'upcoming';

      const connector = !isLast
        ? `<div class="connector ${isComplete ? 'done' : ''}"></div>`
        : '';

      if (isVertical) {
        return `
          <div class="vstep">
            <div class="vleft">
              <div class="circle ${stateClass}">${circleContent}</div>
              ${!isLast ? `<div class="vline ${isComplete ? 'done' : ''}"></div>` : ''}
            </div>
            <div class="vlabel">
              <div class="label ${stateClass}">${s.label}</div>
              ${s.description ? `<div class="desc">${s.description}</div>` : ''}
            </div>
          </div>
        `;
      }

      return `
        <div class="step">
          <div class="circle ${stateClass}">${circleContent}</div>
          ${connector}
          <div class="hlabel">
            <div class="label ${stateClass}">${s.label}</div>
            ${s.description ? `<div class="desc">${s.description}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; }

        /* ── Horizontal ── */
        .hstepper {
          display: flex;
          align-items: flex-start;
          width: 100%;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }

        .connector {
          position: absolute;
          top: 12px;
          left: calc(50% + 12px);
          right: calc(-50% + 12px);
          height: 1px;
          background: var(--surface-border-strong);
          z-index: 0;
        }

        .connector.done {
          background: var(--color-interactive);
        }

        .hlabel {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-top: 10px;
          padding: 0 4px;
        }

        /* ── Vertical ── */
        .vstepper {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .vstep {
          display: flex;
          gap: 14px;
        }

        .vleft {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }

        .vline {
          width: 1px;
          flex: 1;
          min-height: 24px;
          background: var(--surface-border-strong);
          margin: 4px 0;
        }

        .vline.done { background: var(--color-interactive); }

        .vlabel {
          padding-bottom: 20px;
          padding-top: 4px;
        }

        /* ── Circle ── */
        .circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          transition: background 200ms ease, border-color 200ms ease;
        }

        .circle.complete {
          background: var(--color-interactive);
          border: none;
        }

        .circle.active {
          background: var(--surface-bg);
          border: 2px solid var(--color-interactive-text);
          box-shadow: 0 0 0 3px var(--input-focus-ring);
        }

        .circle.upcoming {
          background: var(--surface-bg);
          border: 1.5px solid var(--surface-border-strong);
        }

        .num {
          font-family: var(--font-sans);
          font-size: var(--font-size-xs);
          font-weight: 600;
          line-height: 1;
          -webkit-font-smoothing: antialiased;
        }

        .circle.active   .num { color: var(--color-interactive-text); }
        .circle.upcoming .num { color: var(--text-tertiary); }

        /* ── Labels ── */
        .label {
          font-family: var(--font-sans);
          font-size: var(--font-size-sm);
          font-weight: 500;
          -webkit-font-smoothing: antialiased;
          white-space: nowrap;
        }

        .label.complete,
        .label.active   { color: var(--text-primary); }
        .label.upcoming { color: var(--text-tertiary); }

        .desc {
          font-family: var(--font-sans);
          font-size: var(--font-size-xs);
          color: var(--text-tertiary);
          margin-top: 2px;
          -webkit-font-smoothing: antialiased;
        }
      </style>

      ${isVertical
        ? `<div class="vstepper" role="list">${stepItems}</div>`
        : `<div class="hstepper" role="list">${stepItems}</div>`
      }
    `;
  }
}

customElements.define('fresh-stepper', FreshStepper);
