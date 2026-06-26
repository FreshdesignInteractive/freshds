/**
 * freshds-nav-apply.js
 * Reads freshds-nav-cfg from localStorage and applies logo + action icons
 * to every <fresh-navbar> on the page. Include once per page; no config needed.
 *
 * Logged-out navbars (default): logo only — actions slot left as-is.
 * Logged-in navbars: set data-nav-logged-in on <fresh-navbar>; add an element
 * with data-nav-actions-logged-in inside it to receive the icon buttons + avatar.
 *
 * Exposed globally as window.FreshNavApply = { apply() }
 * so page scripts can re-trigger after toggling state.
 */
(function () {

  var NB_ICON_MAP = {
    search:   'ti-search',
    bell:     'ti-bell',
    help:     'ti-help-circle',
    plus:     'ti-circle-plus',
    grid:     'ti-grid-dots',
    settings: 'ti-settings-2',
    messages: 'ti-message-circle',
    bookmark: 'ti-bookmark'
  };

  function _readCfg() {
    var cfg = { logoUrl: '', logoUrlDark: '', activeIcons: [] };
    try {
      var s = localStorage.getItem('freshds-nav-cfg');
      if (s) {
        var stored = JSON.parse(s);
        cfg = Object.assign(cfg, stored.navbar_cfg || stored);
      }
    } catch (e) {}
    return cfg;
  }

  function _isDark() {
    return document.documentElement.getAttribute('data-mode') === 'dark' ||
           (document.getElementById('app') || document.body).getAttribute('data-mode') === 'dark';
  }

  function _updateLogoVisibility() {
    var dark = _isDark();
    document.querySelectorAll('.nav-logo-light').forEach(function (el) {
      el.style.display = dark ? 'none' : '';
    });
    document.querySelectorAll('.nav-logo-dark').forEach(function (el) {
      el.style.display = dark ? '' : 'none';
    });
  }

  var _modeObserver = null;
  function _ensureModeObserver() {
    if (_modeObserver) return;
    _modeObserver = new MutationObserver(_updateLogoVisibility);
    _modeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
    var app = document.getElementById('app');
    if (app) _modeObserver.observe(app, { attributes: true, attributeFilter: ['data-mode'] });
  }

  function _applyToNavbar(navbar, cfg) {
    /* ── Logo ── */
    navbar.querySelectorAll('[slot="brand"]').forEach(function (el) { el.remove(); });

    var effLight = cfg.logoUrl    || cfg.logoUrlDark;
    var effDark  = cfg.logoUrlDark || cfg.logoUrl;

    if (effLight || effDark) {
      var dark = _isDark();
      var brandDiv = document.createElement('div');
      brandDiv.setAttribute('slot', 'brand');
      if (effLight === effDark) {
        brandDiv.innerHTML =
          '<img src="' + effLight.replace(/"/g, '&quot;') + '"' +
          ' alt="Logo" style="height:24px;max-width:140px;object-fit:contain">';
      } else {
        brandDiv.innerHTML =
          '<img class="nav-logo-light" src="' + effLight.replace(/"/g, '&quot;') + '"' +
          ' alt="Logo" style="height:24px;max-width:140px;object-fit:contain;display:' + (dark ? 'none' : '') + '">' +
          '<img class="nav-logo-dark" src="' + effDark.replace(/"/g, '&quot;') + '"' +
          ' alt="Logo" style="height:24px;max-width:140px;object-fit:contain;display:' + (dark ? '' : 'none') + '">';
      }
      navbar.insertBefore(brandDiv, navbar.firstChild);
    }

    /* ── Logged-in action icons (only when data-nav-logged-in is present) ── */
    if (!navbar.hasAttribute('data-nav-logged-in')) return;

    var slot = navbar.querySelector('[data-nav-actions-logged-in]');
    if (!slot) return;

    var icons = (cfg.activeIcons || []).map(function (key) {
      var cls = NB_ICON_MAP[key];
      return cls
        ? '<fresh-button variant="ghost" icon-only size="sm" aria-label="' + key + '"><i class="ti ' + cls + '"></i></fresh-button>'
        : '';
    }).join('');

    slot.innerHTML = icons + '<fresh-avatar name="Jane Smith" size="sm"></fresh-avatar>';
  }

  function apply() {
    var cfg = _readCfg();
    document.querySelectorAll('fresh-navbar').forEach(function (nb) {
      _applyToNavbar(nb, cfg);
    });
    _updateLogoVisibility();
    _ensureModeObserver();
  }

  /* Run on load */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }

  /* Live-sync when navigation designer saves */
  window.addEventListener('storage', function (e) {
    if (e.key === 'freshds-nav-cfg') apply();
  });

  /* Public API */
  window.FreshNavApply = { apply: apply };

}());
