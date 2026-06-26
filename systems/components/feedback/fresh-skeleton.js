/* ============================================================
   FreshDS, <fresh-skeleton>

   Usage:
     <fresh-skeleton width="240px" height="14px"></fresh-skeleton>
     <fresh-skeleton variant="circle" size="40px"></fresh-skeleton>
     <fresh-skeleton variant="text" lines="3"></fresh-skeleton>

   Attributes:
     variant  rect | circle | text   (default: rect)
     width    CSS value              (default: 100%)
     height   CSS value              (default: 14px)
     size     CSS value             , shorthand for circle diameter
     lines    number                , text variant: number of lines
     radius   CSS value             , override border-radius for rect
   ============================================================ */

class FreshSkeleton extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'width', 'height', 'size', 'lines', 'radius'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const variant = this.getAttribute('variant') || 'rect';
    const width   = this.getAttribute('width')   || '100%';
    const height  = this.getAttribute('height')  || '14px';
    const size    = this.getAttribute('size')    || '40px';
    const lines   = parseInt(this.getAttribute('lines') || '3', 10);
    const radius  = this.getAttribute('radius')  || 'var(--radius-sm)';

    const shimmer = `
      background: linear-gradient(
        90deg,
        var(--surface-overlay) 0%,
        var(--surface-subtle)  50%,
        var(--surface-overlay) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.6s ease infinite;
    `;

    let content = '';

    if (variant === 'circle') {
      content = `<div class="bone circle" style="width:${size};height:${size};border-radius:50%"></div>`;
    } else if (variant === 'text') {
      const lineEls = Array.from({ length: lines }, (_, i) => {
        const w = i === lines - 1 && lines > 1 ? '65%' : '100%';
        return `<div class="bone" style="width:${w};height:${height};border-radius:${radius}"></div>`;
      }).join('');
      content = `<div class="text-stack">${lineEls}</div>`;
    } else {
      content = `<div class="bone" style="width:${width};height:${height};border-radius:${radius}"></div>`;
    }

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: inline-block; }

        .bone {
          ${shimmer}
          display: block;
        }

        .text-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: ${width};
        }

        .circle { flex-shrink: 0; }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      </style>

      ${content}
    `;
  }
}

customElements.define('fresh-skeleton', FreshSkeleton);
