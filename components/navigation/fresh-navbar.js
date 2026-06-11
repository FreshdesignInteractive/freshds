/* ============================================================
   FreshDS — <fresh-navbar>

   Usage:
     <fresh-navbar hamburger>
       <div slot="brand" style="display:flex;align-items:center;gap:8px">
         <strong>Acme</strong>
       </div>
       <nav slot="nav">
         <a href="/dashboard">Dashboard</a>
         <a href="/projects" class="active">Projects</a>
         <a href="/settings">Settings</a>
       </nav>
       <div slot="actions">
         <fresh-avatar name="Jane Smith" size="sm"></fresh-avatar>
       </div>
     </fresh-navbar>

   Slots:
     nav      — navigation links  (left, after brand logo)
     actions  — right-side tools  (right)

   Attributes:
     border     boolean — show bottom border (default: true)
     hamburger  boolean — show hamburger menu button left of brand (default: false)

   Events:
     hamburger-click — fired when the hamburger button is clicked
   ============================================================ */

class FreshNavbar extends HTMLElement {
  static get observedAttributes() { return ['border', 'hamburger']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback()        { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const border    = this.getAttribute('border') !== 'false';
    const hamburger = this.hasAttribute('hamburger');

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');
        *, *::before, *::after { box-sizing: border-box; }

        :host { display: block; width: 100%; }

        .bar {
          height: var(--topbar-h, 52px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          padding: 0 var(--space-6);
          background: var(--surface-bg);
          ${border ? 'border-bottom: 1px solid var(--surface-border);' : ''}
        }

        .left {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex: 1;
          min-width: 0;
        }

        /* Hamburger button */
        .hamburger-btn {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          flex-shrink: 0;
          transition: background 120ms ease, color 120ms ease;
        }
        .hamburger-btn:hover {
          background: var(--surface-subtle);
          color: var(--text-primary);
        }
        .hamburger-btn .ti { font-size: var(--font-size-2xl); line-height: 1; }

        /* Brand logo */
        .brand {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          color: var(--text-primary);
          line-height: 0;
          margin-right: var(--space-1);
        }

        /* Nav slot */
        .nav-wrap {
          display: flex;
          align-items: center;
          margin-left: var(--space-2);
        }

        ::slotted([slot="nav"]) {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          list-style: none;
          margin: 0;
          padding: 0;
        }

        ::slotted(a), ::slotted([slot="nav"] a) {
          font-family: var(--font-sans);
          font-size: var(--font-size-md);
          color: var(--text-secondary);
          text-decoration: none;
          padding: 5px 10px;
          border-radius: var(--radius-md);
          transition: color 120ms ease, background 120ms ease;
          -webkit-font-smoothing: antialiased;
        }

        /* Actions slot */
        .actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-shrink: 0;
        }

        ::slotted([slot="actions"]) {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
      </style>

      <header class="bar" part="bar">
        <div class="left">
          ${hamburger ? `<button class="hamburger-btn" part="hamburger" aria-label="Open menu"><i class="ti ti-menu-2"></i></button>` : ''}
          <div class="brand" part="brand">
            <slot name="brand"><svg aria-label="Acme" role="img" width="84" height="28" viewBox="0 0 84 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M11.4 24.4C10.3667 24.4 9.39167 24.2 8.475 23.8C7.575 23.3833 6.78333 22.8167 6.1 22.1C5.41667 21.3667 4.875 20.525 4.475 19.575C4.09167 18.6083 3.9 17.5833 3.9 16.5C3.9 15.4167 4.09167 14.4 4.475 13.45C4.875 12.4833 5.41667 11.6417 6.1 10.925C6.78333 10.1917 7.575 9.625 8.475 9.225C9.39167 8.80833 10.3667 8.6 11.4 8.6C12.3667 8.6 13.25 8.775 14.05 9.125C14.85 9.45833 15.5333 9.925 16.1 10.525V9H19.85V24H16.1V22.475C15.5333 23.075 14.85 23.55 14.05 23.9C13.25 24.2333 12.3667 24.4 11.4 24.4ZM11.925 20.575C12.6583 20.575 13.325 20.3917 13.925 20.025C14.525 19.6583 15 19.1667 15.35 18.55C15.7167 17.9333 15.9 17.25 15.9 16.5C15.9 15.75 15.7167 15.0667 15.35 14.45C15 13.8333 14.525 13.3417 13.925 12.975C13.325 12.6083 12.6583 12.425 11.925 12.425C11.1917 12.425 10.525 12.6083 9.925 12.975C9.325 13.3417 8.84167 13.8333 8.475 14.45C8.125 15.0667 7.95 15.75 7.95 16.5C7.95 17.25 8.125 17.9333 8.475 18.55C8.84167 19.1667 9.325 19.6583 9.925 20.025C10.525 20.3917 11.1917 20.575 11.925 20.575ZM30.4922 24.5C29.3755 24.5 28.3255 24.2917 27.3422 23.875C26.3589 23.4583 25.4922 22.8833 24.7422 22.15C24.0089 21.4167 23.4339 20.5667 23.0172 19.6C22.6005 18.6333 22.3922 17.6 22.3922 16.5C22.3922 15.4 22.6005 14.3667 23.0172 13.4C23.4339 12.4333 24.0089 11.5833 24.7422 10.85C25.4922 10.1167 26.3589 9.54167 27.3422 9.125C28.3255 8.70833 29.3755 8.5 30.4922 8.5C31.5255 8.5 32.5005 8.675 33.4172 9.025C34.3505 9.35833 35.1755 9.85833 35.8922 10.525L34.7672 14.95C34.3505 14.2667 33.7922 13.675 33.0922 13.175C32.4089 12.6583 31.6005 12.4 30.6672 12.4C29.8839 12.4 29.1839 12.5833 28.5672 12.95C27.9505 13.3167 27.4672 13.8083 27.1172 14.425C26.7672 15.0417 26.5922 15.7333 26.5922 16.5C26.5922 17.25 26.7672 17.9417 27.1172 18.575C27.4672 19.1917 27.9505 19.6833 28.5672 20.05C29.1839 20.4167 29.8839 20.6 30.6672 20.6C31.6005 20.6 32.4089 20.35 33.0922 19.85C33.7922 19.3333 34.3505 18.7333 34.7672 18.05L35.8922 22.475C35.1755 23.1417 34.3505 23.65 33.4172 24C32.5005 24.3333 31.5255 24.5 30.4922 24.5ZM38.1539 24V9H42.0539V10.65C42.5872 9.95 43.2456 9.41667 44.0289 9.05C44.8289 8.68333 45.6622 8.5 46.5289 8.5C47.4122 8.5 48.2456 8.68333 49.0289 9.05C49.8122 9.41667 50.4706 9.95 51.0039 10.65C51.5872 9.95 52.3122 9.41667 53.1789 9.05C54.0456 8.68333 54.9872 8.5 56.0039 8.5C57.0706 8.5 58.0706 8.75 59.0039 9.25C59.9372 9.73333 60.6956 10.45 61.2789 11.4C61.8622 12.3333 62.1539 13.475 62.1539 14.825V24H57.8039V15.45C57.8039 14.65 57.5706 13.9417 57.1039 13.325C56.6372 12.7083 55.9622 12.4 55.0789 12.4C54.6122 12.4 54.1622 12.5167 53.7289 12.75C53.3122 12.9667 52.9706 13.3 52.7039 13.75C52.4539 14.1833 52.3289 14.7333 52.3289 15.4V24H47.9789V15.45C47.9789 14.9167 47.8706 14.4167 47.6539 13.95C47.4539 13.4833 47.1456 13.1083 46.7289 12.825C46.3289 12.5417 45.8372 12.4 45.2539 12.4C44.7872 12.4 44.3372 12.5167 43.9039 12.75C43.4872 12.9667 43.1456 13.3 42.8789 13.75C42.6289 14.1833 42.5039 14.7333 42.5039 15.4V24H38.1539ZM72.9289 24.5C71.6622 24.5 70.5039 24.3 69.4539 23.9C68.4206 23.5 67.5206 22.9417 66.7539 22.225C66.0039 21.4917 65.4206 20.625 65.0039 19.625C64.6039 18.625 64.4039 17.5333 64.4039 16.35C64.4039 15.2167 64.6039 14.175 65.0039 13.225C65.4039 12.2583 65.9622 11.425 66.6789 10.725C67.3956 10.025 68.2289 9.48333 69.1789 9.1C70.1289 8.7 71.1539 8.5 72.2539 8.5C73.7372 8.5 75.0622 8.84167 76.2289 9.525C77.3956 10.1917 78.3122 11.1083 78.9789 12.275C79.6622 13.4417 80.0039 14.7667 80.0039 16.25V17.775H70.8539C70.4372 17.775 70.0372 17.75 69.6539 17.7C69.2706 17.65 68.8872 17.5917 68.5039 17.525C68.6372 18.1917 68.9039 18.7833 69.3039 19.3C69.7039 19.8 70.2206 20.1917 70.8539 20.475C71.4872 20.7583 72.2122 20.9 73.0289 20.9C73.9789 20.9 74.8289 20.7083 75.5789 20.325C76.3456 19.9417 76.9706 19.4667 77.4539 18.9L78.4039 22.8C77.6539 23.3667 76.8039 23.7917 75.8539 24.075C74.9206 24.3583 73.9456 24.5 72.9289 24.5ZM68.4039 14.9C68.8039 14.8167 69.2039 14.75 69.6039 14.7C70.0206 14.65 70.4372 14.625 70.8539 14.625H73.5039C73.9706 14.625 74.4122 14.6417 74.8289 14.675C75.2456 14.7083 75.6372 14.7667 76.0039 14.85C75.8372 14.25 75.5789 13.7333 75.2289 13.3C74.8789 12.8667 74.4456 12.5333 73.9289 12.3C73.4289 12.0667 72.8539 11.95 72.2039 11.95C71.5872 11.95 71.0206 12.075 70.5039 12.325C70.0039 12.5583 69.5706 12.8917 69.2039 13.325C68.8539 13.7583 68.5872 14.2833 68.4039 14.9Z"/></svg></slot>
          </div>
          <div class="nav-wrap" part="nav">
            <slot name="nav"></slot>
          </div>
        </div>
        <div class="actions" part="actions">
          <slot name="actions"></slot>
        </div>
      </header>
    `;

    if (hamburger) {
      this.shadowRoot.querySelector('.hamburger-btn')?.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('hamburger-click', { bubbles: true, composed: true }));
      });
    }
  }
}

customElements.define('fresh-navbar', FreshNavbar);
