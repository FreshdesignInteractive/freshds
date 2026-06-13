/* ============================================================
   FreshDS, <fresh-badge>

   Usage:
     <fresh-badge>Active</fresh-badge>
     <fresh-badge variant="success">Live</fresh-badge>
     <fresh-badge variant="warning" dot>Degraded</fresh-badge>
     <fresh-badge variant="danger">Failed</fresh-badge>
     <fresh-badge variant="ai">AI</fresh-badge>
     <fresh-badge variant="neutral" size="sm">Draft</fresh-badge>

   Attributes:
     variant  primary | success | warning | danger | neutral | ai  (default: primary)
     size     sm | md                                               (default: md)
     dot      boolean, prepends a pulsing status dot
   ============================================================ */

class FreshBadge extends HTMLElement {
  static get observedAttributes() { return ['variant', 'size', 'dot']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const variant = this.getAttribute('variant') || 'primary';
    const size    = this.getAttribute('size')    || 'md';
    const dot     = this.hasAttribute('dot');

    const styles = {
      primary: { bg: 'var(--color-interactive-subtle)', text: 'var(--color-interactive-text)', border: 'var(--color-interactive-border)', dot: 'var(--color-interactive)' },
      success: { bg: 'var(--color-success-subtle)',     text: 'var(--color-success-text)',      border: 'var(--color-success-border)',     dot: 'var(--color-success)' },
      warning: { bg: 'var(--color-warning-subtle)',     text: 'var(--color-warning-text)',      border: 'var(--color-warning-border)',     dot: 'var(--color-warning)' },
      danger:  { bg: 'var(--color-danger-subtle)',      text: 'var(--color-danger-text)',       border: 'var(--color-danger-border)',      dot: 'var(--color-danger)' },
      neutral: { bg: 'var(--surface-overlay)',          text: 'var(--text-secondary)',          border: 'var(--surface-border)',           dot: 'var(--text-tertiary)' },
      ai:      { bg: 'var(--color-accent-subtle)',      text: 'var(--color-accent-text)',       border: 'var(--color-accent-border)',      dot: 'var(--color-accent)' },
    };

    const s  = styles[variant] || styles.primary;
    const h  = size === 'sm' ? '18px' : '22px';
    const px = size === 'sm' ? '7px'  : '9px';
    const fs = size === 'sm' ? 'var(--font-size-2xs)' : 'var(--font-size-xs)';

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: inline-flex; }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: ${h};
          padding: 0 ${px};
          border-radius: 9999px;
          border: 1px solid ${s.border};
          background: ${s.bg};
          color: ${s.text};
          font-family: var(--font-sans);
          font-size: ${fs};
          font-weight: 500;
          letter-spacing: 0.01em;
          white-space: nowrap;
          -webkit-font-smoothing: antialiased;
        }

        .dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: ${s.dot};
          flex-shrink: 0;
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
      </style>

      <span class="badge" part="badge">
        ${dot ? '<span class="dot" aria-hidden="true"></span>' : ''}
        <slot></slot>
      </span>
    `;
  }
}

customElements.define('fresh-badge', FreshBadge);
