/* ============================================================
   FreshDS, <fresh-ai-response>

   Chat bubble for user and AI assistant messages.

   Usage:
     <fresh-ai-response role="user">What's the revenue trend?</fresh-ai-response>

     <fresh-ai-response role="assistant" model="Claude Sonnet">
       Revenue grew 12.4% MoM, driven by enterprise tier…
     </fresh-ai-response>

     <fresh-ai-response role="assistant" streaming>
       Analyzing your data
     </fresh-ai-response>

   Attributes:
     role       user | assistant   (default: assistant)
     model      string, model name shown in header
     streaming  boolean, shows blinking cursor
     avatar     string, initials or name for assistant avatar (default: "AI")
   ============================================================ */

class FreshAiResponse extends HTMLElement {
  static get observedAttributes() {
    return ['role', 'model', 'streaming', 'avatar'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const role      = this.getAttribute('role')    || 'assistant';
    const model     = this.getAttribute('model')   || '';
    const streaming = this.hasAttribute('streaming');
    const avatarStr = this.getAttribute('avatar')  || 'AI';
    const isUser    = role === 'user';

    /* Deterministic color for avatar */
    /* Intentional identity palette — fixed hues so each assistant name
       always gets the same color regardless of current theme. */
    const palette = [
      'var(--primary-9)', 'var(--primary-7)',
      'var(--secondary-9)', 'var(--secondary-7)',
      'var(--success-9)', 'var(--warning-9)'
    ];
    let h = 0;
    for (let i = 0; i < avatarStr.length; i++) h = (avatarStr.charCodeAt(i) + ((h << 5) - h)) | 0;
    const avatarColor = palette[Math.abs(h) % palette.length];
    const initials    = avatarStr.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: block; }

        .bubble {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
          ${isUser ? 'flex-direction: row-reverse;' : ''}
          max-width: 100%;
        }

        .avatar {
          width: 28px;
          height: 28px;
          border-radius: ${isUser ? '50%' : '8px'};
          background: ${isUser ? 'var(--color-interactive)' : avatarColor};
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          font-size: var(--font-size-2xs);
          font-weight: 600;
          color: var(--text-inverse);
          flex-shrink: 0;
          letter-spacing: 0.02em;
          -webkit-font-smoothing: antialiased;
        }

        .body { flex: 1; min-width: 0; max-width: ${isUser ? '75%' : '100%'}; }

        .meta {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: 5px;
          ${isUser ? 'justify-content: flex-end;' : ''}
        }

        .name {
          font-family: var(--font-sans);
          font-size: var(--font-size-xs);
          font-weight: 600;
          color: var(--text-tertiary);
          -webkit-font-smoothing: antialiased;
        }

        .model-badge {
          font-family: var(--font-mono);
          font-size: var(--font-size-3xs);
          font-weight: 500;
          letter-spacing: 0.04em;
          padding: 1px 6px;
          border-radius: 9999px;
          background: var(--badge-ai-bg);
          color: var(--badge-ai-text);
          border: 1px solid var(--badge-ai-border);
        }

        .content {
          display: inline-block;
          padding: 10px 14px;
          border-radius: ${isUser ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px'};
          background: ${isUser ? 'var(--color-interactive)' : 'var(--surface-subtle)'};
          border: ${isUser ? 'none' : '1px solid var(--surface-border)'};
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          color: ${isUser ? 'var(--text-inverse)' : 'var(--text-primary)'};
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          word-break: break-word;
          max-width: 100%;
        }

        .cursor {
          display: ${streaming ? 'inline-block' : 'none'};
          width: 2px;
          height: 1.1em;
          background: ${isUser ? 'var(--btn-primary-text)' : 'var(--color-ai)'};
          margin-left: 2px;
          vertical-align: text-bottom;
          border-radius: 1px;
          animation: blink 900ms step-end infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      </style>

      <div class="bubble" part="bubble">
        <div class="avatar" part="avatar">${initials}</div>
        <div class="body">
          <div class="meta">
            <span class="name">${isUser ? 'You' : (avatarStr === 'AI' ? 'Assistant' : avatarStr)}</span>
            ${model ? `<span class="model-badge">${model}</span>` : ''}
          </div>
          <div class="content" part="content">
            <slot></slot>
            <span class="cursor" aria-hidden="true"></span>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('fresh-ai-response', FreshAiResponse);
