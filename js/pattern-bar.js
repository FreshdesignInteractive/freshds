/* ============================================================
   FreshDS — Pattern viewer toolbar
   ============================================================ */

var _isThumb = location.href.indexOf('?thumb') !== -1;

if (_isThumb) {
  /* Hide demo bar immediately — inline document.write in the HTML
     also handles this, but belt-and-suspenders */
  document.head.insertAdjacentHTML('beforeend',
    '<style>#demo-bar{display:none!important}</style>');

  /* Receive theme pushed from patterns.html via postMessage.
     postMessage works reliably across file:// iframes in all browsers. */
  window.addEventListener('message', function (evt) {
    var d = evt.data;
    if (!d || d.type !== 'fds-theme') return;
    applyScalesToElement(
      document.documentElement,
      d.primary, d.secondary, d.scaleDark, d.scaleLight,
      d.success, d.warning,   d.danger,    d.info
    );
    document.documentElement.style.setProperty('--color-page-bg',       d.pageBg);
    document.documentElement.style.setProperty('--color-input-surface', d.inputSurface);
    var app = document.getElementById('app');
    if (d.mode === 'dark') {
      document.documentElement.setAttribute('data-mode', 'dark');
      if (app) app.setAttribute('data-mode', 'dark');
    } else {
      document.documentElement.removeAttribute('data-mode');
      if (app) app.removeAttribute('data-mode');
    }
  });

} else {
  /* ── Normal page mode — apply theme from localStorage ── */
  (function () {
    var p    = '#7c6af7', s    = '#2dd4bf';
    var dark = '#1f2328', light = '#ffffff';
    var suc  = '#22c55e', warn  = '#f59e0b';
    var dang = '#f43f5e', info  = '#3b82f6';
    var pageBg = '#ffffff', inputSurface = '#ffffff';
    try {
      var t = JSON.parse(localStorage.getItem('freshds-theme') || '{}');
      if (t.primary)      p            = t.primary;
      if (t.secondary)    s            = t.secondary;
      if (t.scaleDark)    dark         = t.scaleDark;
      if (t.scaleLight)   light        = t.scaleLight;
      if (t.success)      suc          = t.success;
      if (t.warning)      warn         = t.warning;
      if (t.danger)       dang         = t.danger;
      if (t.info)         info         = t.info;
      if (t.pageBg)       pageBg       = t.pageBg;
      if (t.inputSurface) inputSurface = t.inputSurface;
    } catch (e) {}
    applyScalesToElement(document.documentElement, p, s, dark, light, suc, warn, dang, info);
    document.documentElement.style.setProperty('--color-page-bg',       pageBg);
    document.documentElement.style.setProperty('--color-input-surface', inputSurface);
  })();

  /* Dark mode restore — runs before DOMContentLoaded to avoid flash */
  (function () {
    try {
      var t = JSON.parse(localStorage.getItem('freshds-theme') || '{}');
      if (t.mode === 'dark') {
        /* Set on html so shadow DOM components inherit dark tokens */
        document.documentElement.setAttribute('data-mode', 'dark');
        /* Also set on #app — may not exist yet; retry after DOM ready */
        var app = document.getElementById('app');
        if (app) {
          app.setAttribute('data-mode', 'dark');
        } else {
          document.addEventListener('DOMContentLoaded', function () {
            var a = document.getElementById('app');
            if (a) a.setAttribute('data-mode', 'dark');
          });
        }
        var btn = document.getElementById('mode-toggle-btn');
        if (btn) btn.innerHTML = '<i class="ti ti-sun"></i>';
        else {
          document.addEventListener('DOMContentLoaded', function () {
            var b = document.getElementById('mode-toggle-btn');
            if (b) b.innerHTML = '<i class="ti ti-sun"></i>';
          });
        }
      }
    } catch (e) {}
  })();
}

/* ── Dark mode toggle ── */
function toggleDemoMode() {
  var app  = document.getElementById('app');
  var btn  = document.getElementById('mode-toggle-btn');
  var dark = document.documentElement.getAttribute('data-mode') === 'dark';

  if (dark) {
    document.documentElement.removeAttribute('data-mode');
    if (app) app.removeAttribute('data-mode');
    if (btn) btn.innerHTML = '<i class="ti ti-moon"></i>';
    /* Persist: clear mode in localStorage */
    try {
      var t = JSON.parse(localStorage.getItem('freshds-theme') || '{}');
      delete t.mode;
      localStorage.setItem('freshds-theme', JSON.stringify(t));
    } catch (e) {}
  } else {
    document.documentElement.setAttribute('data-mode', 'dark');
    if (app) app.setAttribute('data-mode', 'dark');
    if (btn) btn.innerHTML = '<i class="ti ti-sun"></i>';
    /* Persist: save mode to localStorage */
    try {
      var t = JSON.parse(localStorage.getItem('freshds-theme') || '{}');
      t.mode = 'dark';
      localStorage.setItem('freshds-theme', JSON.stringify(t));
    } catch (e) {}
  }
}


/* ── Collapse / expand ── */
function toggleDemoBar() {
  var bar = document.getElementById('demo-bar');
  var btn = document.getElementById('demo-collapse-btn');
  var collapsed = bar.classList.toggle('collapsed');
  if (btn) btn.innerHTML = collapsed
    ? '<i class="ti ti-plus"></i>'
    : '<i class="ti ti-minus"></i>';
  if (btn) btn.setAttribute('aria-label', collapsed ? 'Expand toolbar' : 'Collapse toolbar');
}
