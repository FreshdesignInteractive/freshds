/* ============================================================
   FreshDS, <fresh-avatar>

   Image avatar with graceful fallback to initials.
   Color is deterministically derived from the name.

   Usage:
     <fresh-avatar src="/photos/jane.jpg" name="Jane Smith"></fresh-avatar>
     <fresh-avatar name="Marcus Lee" size="lg"></fresh-avatar>
     <fresh-avatar name="AI Agent"   shape="square"></fresh-avatar>
     <fresh-avatar name="Sam K."     status="online"></fresh-avatar>
     <fresh-avatar src="/photo.jpg"  name="Raj S." size="xl" status="busy"></fresh-avatar>

   Attributes:
     src      image URL
     name     string , used for initials + accessible label + color
     size     xs | sm | md | lg | xl   (default: md)
     shape    circle | square          (default: circle)
     status   online | away | busy | offline

   Sizes:   xs=20  sm=28  md=36  lg=44  xl=64  (px)
   ============================================================ */

class FreshAvatar extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'name', 'size', 'shape', 'status'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._imgFailed = false;
  }

  connectedCallback()        { this._imgFailed = false; this._render(); }
  attributeChangedCallback() { this._imgFailed = false; this._render(); }

  /* ── Initials ── */
  _initials(name) {
    if (!name) return '?';
    return name.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  }

  /* ── Deterministic color from name ── */
  _color(name) {
    /* Fixed data-viz palette — not customer-configurable, so each user
       always gets the same color regardless of the active theme. */
    const palette = [
      'var(--dv-1, #4D6EE3)', 'var(--dv-2, #E8652A)', 'var(--dv-3, #3AAFA9)', 'var(--dv-4, #C94E8E)',
      'var(--dv-5, #D4981A)', 'var(--dv-6, #6B4FBB)', 'var(--dv-7, #3DAA62)', 'var(--dv-8, #8A7560)',
    ];
    let h = 0;
    for (let i = 0; i < (name || '').length; i++) {
      h = (name.charCodeAt(i) + ((h << 5) - h)) | 0;
    }
    return palette[Math.abs(h) % palette.length];
  }

  /* ── Status colors ── */
  _statusColor(status) {
    return { online: 'var(--color-success)', away: 'var(--color-warning)', busy: 'var(--color-danger)', offline: 'var(--text-tertiary)' }[status] || 'var(--text-tertiary)';
  }

  _render() {
    const src    = this.getAttribute('src')    || '';
    const name   = this.getAttribute('name')   || '';
    const size   = this.getAttribute('size')   || 'md';
    const shape  = this.getAttribute('shape')  || 'circle';
    const status = this.getAttribute('status') || '';

    const dims = { xs: 20, sm: 28, md: 36, lg: 44, xl: 64 };
    const fsize = { xs: '9px', sm: '11px', md: '13px', lg: '15px', xl: '22px' };
    const dotSz = { xs: '5px', sm: '7px', md: '9px', lg: '10px', xl: '14px' };
    const dotBd = { xs: '1px', sm: '1.5px', md: '2px', lg: '2px', xl: '2.5px' };

    const d      = dims[size] || 36;
    const fs     = fsize[size];
    const color  = this._color(name);
    const initials = this._initials(name);
    const showImg  = src && !this._imgFailed;

    const borderRadius = shape === 'square'
      ? (d <= 28 ? '6px' : d <= 44 ? '8px' : '12px')
      : '50%';

    const statusDotSz = dotSz[size];
    const statusBd    = dotBd[size];
    const statusColor = status ? this._statusColor(status) : '';

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; }

        :host {
          display: inline-flex;
          position: relative;
          flex-shrink: 0;
          width: ${d}px;
          height: ${d}px;
        }

        .avatar {
          width: ${d}px;
          height: ${d}px;
          border-radius: ${borderRadius};
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${showImg ? 'var(--surface-subtle)' : color};
          border: none;
          user-select: none;
          flex-shrink: 0;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: ${showImg ? 'block' : 'none'};
        }

        .initials {
          font-family: var(--font-sans);
          font-size: ${fs};
          font-weight: 600;
          color: var(--text-inverse);
          letter-spacing: 0.02em;
          line-height: 1;
          display: ${showImg ? 'none' : 'block'};
          -webkit-font-smoothing: antialiased;
        }

        .status {
          position: absolute;
          bottom: ${shape === 'circle' ? '0px' : '-1px'};
          right:  ${shape === 'circle' ? '0px' : '-1px'};
          width: ${statusDotSz};
          height: ${statusDotSz};
          border-radius: 50%;
          background: ${statusColor};
          border: ${statusBd} solid var(--surface-canvas);
          display: ${status ? 'block' : 'none'};
        }
      </style>

      <div class="avatar" part="avatar" role="img" aria-label="${name || 'Avatar'}">
        ${showImg ? `<img src="${src}" alt="${name}" part="image">` : ''}
        <span class="initials" aria-hidden="true">${initials}</span>
      </div>
      ${status ? `<span class="status" aria-label="${status}" title="${status}"></span>` : ''}
    `;

    /* Handle image load error → fall back to initials */
    if (showImg) {
      this.shadowRoot.querySelector('img')?.addEventListener('error', () => {
        this._imgFailed = true;
        this._render();
      });
    }
  }
}

customElements.define('fresh-avatar', FreshAvatar);
