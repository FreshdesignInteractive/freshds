/* ============================================================
   FreshDS, <fresh-prompt-input>

   Signature AI prompt input with optional attach and voice actions.

   Usage:
     <fresh-prompt-input placeholder="Ask anything about your data…"></fresh-prompt-input>

     <fresh-prompt-input show-attach show-voice placeholder="Ask anything…"></fresh-prompt-input>

     <fresh-prompt-input focused></fresh-prompt-input>

   Attributes:
     placeholder  string , hint text (default: "Ask anything…")
     show-attach  boolean, show file attachment button
     show-voice   boolean, show voice input button
     focused      boolean, render with focus ring visible
     disabled     boolean, disables the input and send button

   Events:
     fresh-submit , CustomEvent({ detail: { value: string } }) on send
     fresh-attach , fired when the attach button is clicked
     fresh-voice  , fired when the voice button is clicked
   ============================================================ */

class FreshPromptInput extends HTMLElement {
  static get observedAttributes() {
    return ['placeholder', 'show-attach', 'show-voice', 'focused', 'disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._focused = false;
  }

  connectedCallback()        { this._render(); this._bind(); }
  attributeChangedCallback() { this._render(); this._bind(); }

  _submit() {
    const input = this.shadowRoot.querySelector('.prompt-input');
    if (!input || this.hasAttribute('disabled')) return;
    const val = input.value.trim();
    if (!val) return;
    this.dispatchEvent(new CustomEvent('fresh-submit', { bubbles: true, composed: true, detail: { value: val } }));
    input.value = '';
    input.focus();
  }

  _bind() {
    const root      = this.shadowRoot;
    const input     = root.querySelector('.prompt-input');
    const sendBtn   = root.querySelector('.send-btn');
    const attachBtn = root.querySelector('.attach-btn');
    const voiceBtn  = root.querySelector('.voice-btn');
    const wrap      = root.querySelector('.prompt-wrap');

    if (!input) return;

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._submit(); }
    });

    input.addEventListener('focus', () => {
      wrap && wrap.classList.add('is-focused');
    });
    input.addEventListener('blur', () => {
      if (!this.hasAttribute('focused')) wrap && wrap.classList.remove('is-focused');
    });

    sendBtn  && sendBtn.addEventListener('click',  () => this._submit());
    attachBtn && attachBtn.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('fresh-attach', { bubbles: true, composed: true })));
    voiceBtn  && voiceBtn.addEventListener('click',  () =>
      this.dispatchEvent(new CustomEvent('fresh-voice',  { bubbles: true, composed: true })));
  }

  _render() {
    const placeholder  = this.getAttribute('placeholder') || 'Ask anything…';
    const showAttach   = this.hasAttribute('show-attach');
    const showVoice    = this.hasAttribute('show-voice');
    const focused      = this.hasAttribute('focused');
    const disabled     = this.hasAttribute('disabled');

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; }
        :host { display: block; width: 100%; }

        .prompt-wrap {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
          background: var(--surface-input);
          border: 1px solid ${focused ? 'var(--input-focus-border)' : 'var(--surface-border)'};
          border-radius: var(--radius-xl);
          padding: var(--space-2) var(--space-3);
          box-shadow: ${focused ? '0 0 0 3px var(--input-focus-ring)' : 'none'};
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }

        .prompt-wrap.is-focused {
          border-color: var(--input-focus-border);
          box-shadow: 0 0 0 3px var(--input-focus-ring);
        }

        .sparkle-icon {
          font-size: var(--space-4);
          color: var(--color-ai);
          flex-shrink: 0;
          line-height: 1;
        }

        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          cursor: pointer;
          flex-shrink: 0;
          transition: color 120ms ease, background 120ms ease;
          font-size: var(--space-4);
          padding: 0;
        }

        .icon-btn:hover:not(:disabled) {
          color: var(--text-secondary);
          background: var(--surface-overlay);
        }

        .icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .prompt-input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          color: var(--text-primary);
          -webkit-font-smoothing: antialiased;
          padding: var(--space-1) 0;
        }

        .prompt-input::placeholder {
          color: var(--text-tertiary);
        }

        .prompt-input:disabled {
          cursor: not-allowed;
        }

        .send-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          border: none;
          background: var(--color-ai);
          color: var(--btn-ai-text);
          cursor: pointer;
          flex-shrink: 0;
          transition: background 120ms ease, opacity 120ms ease;
          font-size: var(--font-size-md);
          padding: 0;
        }

        .send-btn:hover:not(:disabled) {
          background: var(--btn-ai-hover);
        }

        .send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      </style>

      <div class="prompt-wrap${focused ? ' is-focused' : ''}" part="wrap">
        ${!showAttach ? `<i class="ti ti-sparkles sparkle-icon" aria-hidden="true"></i>` : ''}
        ${showAttach ? `<button class="icon-btn attach-btn" aria-label="Attach file"${disabled ? ' disabled' : ''}><i class="ti ti-paperclip"></i></button>` : ''}
        <input
          class="prompt-input"
          type="text"
          placeholder="${placeholder}"
          ${disabled ? 'disabled' : ''}
          part="input"
        >
        ${showVoice ? `<button class="icon-btn voice-btn" aria-label="Voice input"${disabled ? ' disabled' : ''}><i class="ti ti-microphone"></i></button>` : ''}
        <button class="send-btn" aria-label="Send"${disabled ? ' disabled' : ''}><i class="ti ti-arrow-up"></i></button>
      </div>
    `;
  }
}

customElements.define('fresh-prompt-input', FreshPromptInput);
