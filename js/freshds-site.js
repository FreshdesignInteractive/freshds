/* ============================================================
   FreshDS, Site application layer
   Powers index.html, configurator.html, and patterns.html.
   NOT included in the developer bundle export.

   Depends on freshds.js (core) being loaded first.
   ============================================================ */

// ── Default theme (blank / neutral) ───────────────────────────
var DEFAULT_THEME = {
  primary: '#1f2328', secondary: '#6b7280',
  scaleDark: '#1f2328', scaleLight: '#ffffff',
  success: '#22c55e', warning: '#f59e0b', danger: '#f43f5e', info: '#3b82f6',
  pageBg: '#ffffff', inputSurface: '#ffffff',
  fontSans: 'Inter', fontMono: 'JetBrains Mono',
  density: 'default',
  elev1: '3', elev2: '12', elev3: '24',
  radiusSm: '4', radiusMd: '8', radiusLg: '12', radiusXl: '20'
};

// ── Spacing / density presets ──────────────────────────────────
var DENSITY_PRESETS = {
  compact:     { 1:'3px', 2:'6px',  3:'10px', 4:'12px', 5:'16px', 6:'20px', 8:'28px', 10:'34px', 12:'42px' },
  default:     { 1:'4px', 2:'8px',  3:'12px', 4:'16px', 5:'20px', 6:'24px', 8:'32px', 10:'40px', 12:'48px' },
  comfortable: { 1:'5px', 2:'10px', 3:'15px', 4:'20px', 5:'26px', 6:'30px', 8:'42px', 10:'52px', 12:'62px' }
};

// ── Site state ─────────────────────────────────────────────────
var ds = {
  primary:     DEFAULT_THEME.primary,
  secondary:   DEFAULT_THEME.secondary,
  scaleDark:   DEFAULT_THEME.scaleDark,
  scaleLight:  DEFAULT_THEME.scaleLight,
  success:     DEFAULT_THEME.success,
  warning:     DEFAULT_THEME.warning,
  danger:      DEFAULT_THEME.danger,
  info:        DEFAULT_THEME.info,
  mode:        'light',
  fontSans:    DEFAULT_THEME.fontSans,
  fontMono:    DEFAULT_THEME.fontMono,
  pageBg:      DEFAULT_THEME.pageBg,
  inputSurface: DEFAULT_THEME.inputSurface,
  density:     DEFAULT_THEME.density,
  elev1: DEFAULT_THEME.elev1, elev2: DEFAULT_THEME.elev2, elev3: DEFAULT_THEME.elev3,
  radiusSm: DEFAULT_THEME.radiusSm, radiusMd: DEFAULT_THEME.radiusMd,
  radiusLg: DEFAULT_THEME.radiusLg, radiusXl: DEFAULT_THEME.radiusXl,

  stagedPrimary:      DEFAULT_THEME.primary,
  stagedSecondary:    DEFAULT_THEME.secondary,
  stagedDark:         DEFAULT_THEME.scaleDark,
  stagedLight:        DEFAULT_THEME.scaleLight,
  stagedSuccess:      DEFAULT_THEME.success,
  stagedWarning:      DEFAULT_THEME.warning,
  stagedDanger:       DEFAULT_THEME.danger,
  stagedInfo:         DEFAULT_THEME.info,
  stagedFontSans:     DEFAULT_THEME.fontSans,
  stagedFontMono:     DEFAULT_THEME.fontMono,
  stagedPageBg:       DEFAULT_THEME.pageBg,
  stagedInputSurface: DEFAULT_THEME.inputSurface,
  stagedDensity:      DEFAULT_THEME.density,
  stagedElev1: DEFAULT_THEME.elev1, stagedElev2: DEFAULT_THEME.elev2, stagedElev3: DEFAULT_THEME.elev3,
  stagedRadiusSm: DEFAULT_THEME.radiusSm, stagedRadiusMd: DEFAULT_THEME.radiusMd,
  stagedRadiusLg: DEFAULT_THEME.radiusLg, stagedRadiusXl: DEFAULT_THEME.radiusXl
};

// ── Theme persistence — restore before first paint ─────────────
(function() {
  try {
    var saved = localStorage.getItem('freshds-theme');
    if (!saved) return;
    var t = JSON.parse(saved);
    if (t.primary)      { ds.primary      = ds.stagedPrimary      = t.primary; }
    if (t.secondary)    { ds.secondary    = ds.stagedSecondary    = t.secondary; }
    if (t.scaleDark)    { ds.scaleDark    = ds.stagedDark         = t.scaleDark; }
    if (t.scaleLight)   { ds.scaleLight   = ds.stagedLight        = t.scaleLight; }
    if (t.success)      { ds.success      = ds.stagedSuccess      = t.success; }
    if (t.warning)      { ds.warning      = ds.stagedWarning      = t.warning; }
    if (t.danger)       { ds.danger       = ds.stagedDanger       = t.danger; }
    if (t.info)         { ds.info         = ds.stagedInfo         = t.info; }
    if (t.fontSans)     { ds.fontSans     = ds.stagedFontSans     = t.fontSans; }
    if (t.fontMono)     { ds.fontMono     = ds.stagedFontMono     = t.fontMono; }
    if (t.pageBg)       { ds.pageBg       = ds.stagedPageBg       = t.pageBg; }
    if (t.inputSurface) { ds.inputSurface = ds.stagedInputSurface = t.inputSurface; }
    if (t.density)    { ds.density    = ds.stagedDensity    = t.density; }
    if (t.elev1)      { ds.elev1      = ds.stagedElev1      = t.elev1; }
    if (t.elev2)      { ds.elev2      = ds.stagedElev2      = t.elev2; }
    if (t.elev3)      { ds.elev3      = ds.stagedElev3      = t.elev3; }
    if (t.radiusSm)   { ds.radiusSm   = ds.stagedRadiusSm   = t.radiusSm; }
    if (t.radiusMd)   { ds.radiusMd   = ds.stagedRadiusMd   = t.radiusMd; }
    if (t.radiusLg)   { ds.radiusLg   = ds.stagedRadiusLg   = t.radiusLg; }
    if (t.radiusXl)   { ds.radiusXl   = ds.stagedRadiusXl   = t.radiusXl; }
    if (t.mode)         { ds.mode = t.mode; }
  } catch(e) {}
})();

// ── Pre-paint: always DS defaults — customer theme is export-only ─────────────
applyScalesToElement(document.documentElement, DEFAULT_THEME.primary, DEFAULT_THEME.secondary, DEFAULT_THEME.scaleDark, DEFAULT_THEME.scaleLight);
document.documentElement.style.setProperty('--color-page-bg',      DEFAULT_THEME.pageBg);
document.documentElement.style.setProperty('--color-input-surface', DEFAULT_THEME.inputSurface);

// ── When loaded in an iframe (app.html #comp-frame), receive theme from parent ─
if (window !== window.top) {
  window.addEventListener('message', function(evt) {
    var d = evt.data;
    if (!d || d.type !== 'fds-theme') return;
    applyScalesToElement(document.documentElement, d.primary, d.secondary, d.scaleDark, d.scaleLight, d.success, d.warning, d.danger, d.info);
    document.documentElement.style.setProperty('--color-page-bg',       d.pageBg       || '#ffffff');
    document.documentElement.style.setProperty('--color-input-surface', d.inputSurface || '#ffffff');
    var appEl = document.getElementById('app');
    if (d.mode === 'dark') {
      document.documentElement.setAttribute('data-mode', 'dark');
      if (appEl) appEl.setAttribute('data-mode', 'dark');
    } else {
      document.documentElement.removeAttribute('data-mode');
      if (appEl) appEl.removeAttribute('data-mode');
    }
  });
}

// ── Color swatch resolver (docs site only) ─────────────────────
function resolveToken(prop) {
  var tmp = document.createElement('div');
  tmp.style.cssText = 'position:absolute;width:0;height:0;color:var(' + prop + ')';
  document.body.appendChild(tmp);
  var rgb = getComputedStyle(tmp).color;
  document.body.removeChild(tmp);
  var m = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!m) return '';
  return '#' + [m[1], m[2], m[3]].map(function(n) {
    return parseInt(n).toString(16).padStart(2, '0');
  }).join('');
}

function updateColorSwatches() {
  document.querySelectorAll('[data-prop]').forEach(function(el) {
    el.textContent = resolveToken(el.getAttribute('data-prop'));
  });
}

// ── Site-wide theme application ────────────────────────────────
function pushToRoot(p, s, dark, light, pageBg, inputSurface) {
  applyScalesToElement(document.documentElement, p, s, dark, light, ds.success, ds.warning, ds.danger, ds.info);
  var root = document.documentElement;
  root.style.setProperty('--color-page-bg',      pageBg       || '#ffffff');
  root.style.setProperty('--color-input-surface', inputSurface || '#ffffff');
  updateColorSwatches();
}

// ── Build a box-shadow from a single blur-radius value (px) ───
function _buildElevShadow(blurStr) {
  var n = parseInt(blurStr) || 0;
  if (n <= 0) return 'none';
  var y1    = Math.max(1, Math.round(n / 3));
  var y2    = Math.max(1, Math.round(n / 6));
  var blur2 = Math.max(1, Math.round(n / 3));
  var a1    = Math.min(0.20, 0.06 + n * 0.002).toFixed(3);
  return '0 ' + y1 + 'px ' + n + 'px rgba(0,0,0,' + a1 + '), 0 ' + y2 + 'px ' + blur2 + 'px rgba(0,0,0,0.04)';
}

// ── Isolated configurator preview updates (no root CSS writes) ─
function _updateFontPreviews() {
  var p = document.getElementById('font-sans-preview');
  var m = document.getElementById('font-mono-preview');
  if (p) p.style.fontFamily = "'" + ds.stagedFontSans + "', system-ui, sans-serif";
  if (m) m.style.fontFamily = "'" + ds.stagedFontMono + "', monospace";
}

function _updateElevPreviews() {
  [1, 2, 3].forEach(function(n) {
    var card  = document.getElementById('elev-' + n + '-preview');
    var input = document.getElementById('elev-' + n + '-blur');
    var val   = ds['stagedElev' + n];
    if (card)  card.style.boxShadow = _buildElevShadow(val);
    if (input && document.activeElement !== input) input.value = val;
  });
}

function _updateRadiusPreviews() {
  var lvls = { sm: ds.stagedRadiusSm, md: ds.stagedRadiusMd, lg: ds.stagedRadiusLg, xl: ds.stagedRadiusXl };
  Object.keys(lvls).forEach(function(lvl) {
    var preview = document.getElementById('radius-' + lvl + '-preview');
    var input   = document.getElementById('radius-' + lvl + '-val');
    var px      = (lvls[lvl] || '0') + 'px';
    if (preview) preview.style.borderRadius = px;
    if (input && document.activeElement !== input) input.value = lvls[lvl];
  });
}

function _updateDensityPreview() {
  var table = document.getElementById('density-preview-table');
  if (!table) return;
  var p = DENSITY_PRESETS[ds.stagedDensity] || DENSITY_PRESETS.default;
  var keys = [1, 2, 3, 4, 5, 6, 8, 10, 12];
  var maxPx = 62;
  table.innerHTML = keys.map(function(k) {
    var val  = p[k] || '0px';
    var barW = Math.round((parseInt(val) / maxPx) * 100);
    return '<div class="dpt-row">' +
      '<span class="dpt-name">--space-' + k + '</span>' +
      '<span class="dpt-val">' + val + '</span>' +
      '<div class="dpt-bar-wrap"><div class="dpt-bar" style="width:' + barW + '%"></div></div>' +
      '</div>';
  }).join('');
}

// ── Sync configurator preview elements after any staged change ─
function _pushStagedToRoot() {
  updateColorSwatches();
  _updateFontPreviews();
  _updateElevPreviews();
  _updateRadiusPreviews();
}

// ── Apply staged theme (saves to localStorage; no DOM side-effects) ───────────
function applyStagedToSite() {
  ds.primary      = ds.stagedPrimary;
  ds.secondary    = ds.stagedSecondary;
  ds.scaleDark    = ds.stagedDark;
  ds.scaleLight   = ds.stagedLight;
  ds.success      = ds.stagedSuccess;
  ds.warning      = ds.stagedWarning;
  ds.danger       = ds.stagedDanger;
  ds.info         = ds.stagedInfo;
  ds.fontSans     = ds.stagedFontSans;
  ds.fontMono     = ds.stagedFontMono;
  ds.pageBg       = ds.stagedPageBg;
  ds.inputSurface = ds.stagedInputSurface;
  ds.density      = ds.stagedDensity;
  ds.elev1        = ds.stagedElev1;
  ds.elev2        = ds.stagedElev2;
  ds.elev3        = ds.stagedElev3;
  ds.radiusSm     = ds.stagedRadiusSm;
  ds.radiusMd     = ds.stagedRadiusMd;
  ds.radiusLg     = ds.stagedRadiusLg;
  ds.radiusXl     = ds.stagedRadiusXl;
  _saveTheme();
  _syncConfiguratorUI();
  _updateTypoFontNames();
}

// ── Discard staged changes ─────────────────────────────────────
function discardStagedChanges() {
  ds.stagedPrimary      = ds.primary;
  ds.stagedSecondary    = ds.secondary;
  ds.stagedDark         = ds.scaleDark;
  ds.stagedLight        = ds.scaleLight;
  ds.stagedSuccess      = ds.success;
  ds.stagedWarning      = ds.warning;
  ds.stagedDanger       = ds.danger;
  ds.stagedInfo         = ds.info;
  ds.stagedFontSans     = ds.fontSans;
  ds.stagedFontMono     = ds.fontMono;
  ds.stagedPageBg       = ds.pageBg;
  ds.stagedInputSurface = ds.inputSurface;
  ds.stagedDensity      = ds.density;
  ds.stagedElev1        = ds.elev1;
  ds.stagedElev2        = ds.elev2;
  ds.stagedElev3        = ds.elev3;
  ds.stagedRadiusSm     = ds.radiusSm;
  ds.stagedRadiusMd     = ds.radiusMd;
  ds.stagedRadiusLg     = ds.radiusLg;
  ds.stagedRadiusXl     = ds.radiusXl;
  _syncConfiguratorUI();
  _pushStagedToRoot();
}

// ── Reset everything to factory defaults ──────────────────────
function resetToDefaults() {
  if (!confirm('Reset all settings to FreshDS defaults? This cannot be undone.')) return;
  ds.primary      = ds.stagedPrimary      = DEFAULT_THEME.primary;
  ds.secondary    = ds.stagedSecondary    = DEFAULT_THEME.secondary;
  ds.scaleDark    = ds.stagedDark         = DEFAULT_THEME.scaleDark;
  ds.scaleLight   = ds.stagedLight        = DEFAULT_THEME.scaleLight;
  ds.success      = ds.stagedSuccess      = DEFAULT_THEME.success;
  ds.warning      = ds.stagedWarning      = DEFAULT_THEME.warning;
  ds.danger       = ds.stagedDanger       = DEFAULT_THEME.danger;
  ds.info         = ds.stagedInfo         = DEFAULT_THEME.info;
  ds.fontSans     = ds.stagedFontSans     = DEFAULT_THEME.fontSans;
  ds.fontMono     = ds.stagedFontMono     = DEFAULT_THEME.fontMono;
  ds.pageBg       = ds.stagedPageBg       = DEFAULT_THEME.pageBg;
  ds.inputSurface = ds.stagedInputSurface = DEFAULT_THEME.inputSurface;
  ds.density      = ds.stagedDensity      = DEFAULT_THEME.density;
  ds.elev1        = ds.stagedElev1        = DEFAULT_THEME.elev1;
  ds.elev2        = ds.stagedElev2        = DEFAULT_THEME.elev2;
  ds.elev3        = ds.stagedElev3        = DEFAULT_THEME.elev3;
  ds.radiusSm     = ds.stagedRadiusSm     = DEFAULT_THEME.radiusSm;
  ds.radiusMd     = ds.stagedRadiusMd     = DEFAULT_THEME.radiusMd;
  ds.radiusLg     = ds.stagedRadiusLg     = DEFAULT_THEME.radiusLg;
  ds.radiusXl     = ds.stagedRadiusXl     = DEFAULT_THEME.radiusXl;
  localStorage.removeItem('freshds-theme');
  pushToRoot(DEFAULT_THEME.primary, DEFAULT_THEME.secondary, DEFAULT_THEME.scaleDark, DEFAULT_THEME.scaleLight, DEFAULT_THEME.pageBg, DEFAULT_THEME.inputSurface);
  _syncConfiguratorUI();
  _updateElevPreviews();
  _updateRadiusPreviews();
  _updateFontPreviews();
  _updateDensityPreview();
}

// ── Staging functions called from configurator UI ──────────────
function stageCfgElev(level, val) {
  ds['stagedElev' + level] = String(Math.max(0, parseInt(val) || 0));
  _updateElevPreviews();
  _syncConfiguratorUI();
}

function stageCfgDensity(val) {
  ds.stagedDensity = val;
  _syncConfiguratorUI();
}

function stageCfgRadius(level, val) {
  var cap = level.charAt(0).toUpperCase() + level.slice(1);
  ds['stagedRadius' + cap] = String(Math.max(0, parseInt(val) || 0));
  _updateRadiusPreviews();
  _syncConfiguratorUI();
}

// ── Sync configurator UI to staged state ──────────────────────
function _syncConfiguratorUI() {
  var fields = [
    { pickerId: 'cfg-primary',        hexId: 'cfg-hex-primary',        val: ds.stagedPrimary },
    { pickerId: 'cfg-secondary',      hexId: 'cfg-hex-secondary',      val: ds.stagedSecondary },
    { pickerId: 'cfg-scale-dark',     hexId: 'cfg-hex-dark',           val: ds.stagedDark },
    { pickerId: 'cfg-scale-light',    hexId: 'cfg-hex-light',          val: ds.stagedLight },
    { pickerId: 'cfg-success',        hexId: 'cfg-hex-success',        val: ds.stagedSuccess },
    { pickerId: 'cfg-warning',        hexId: 'cfg-hex-warning',        val: ds.stagedWarning },
    { pickerId: 'cfg-danger',         hexId: 'cfg-hex-danger',         val: ds.stagedDanger },
    { pickerId: 'cfg-info',           hexId: 'cfg-hex-info',           val: ds.stagedInfo },
    { pickerId: 'cfg-page-bg',        hexId: 'cfg-hex-page-bg',        val: ds.stagedPageBg || '#ffffff' },
    { pickerId: 'cfg-input-surface',  hexId: 'cfg-hex-input-surface',  val: ds.stagedInputSurface || '#ffffff' }
  ];
  fields.forEach(function(f) {
    var picker = document.getElementById(f.pickerId);
    var hex    = document.getElementById(f.hexId);
    if (picker) picker.value = f.val;
    if (hex && document.activeElement !== hex) hex.value = f.val;
  });

  var selSans = document.getElementById('font-sans-select');
  var selMono = document.getElementById('font-mono-select');
  if (selSans) selSans.value = ds.stagedFontSans;
  if (selMono) selMono.value = ds.stagedFontMono;

  // Density pills
  var densityEl = document.getElementById('cfg-density');
  if (densityEl) densityEl.querySelectorAll('.cfg-pill').forEach(function(pill) {
    pill.classList.toggle('active', pill.dataset.value === ds.stagedDensity);
  });
  _updateDensityPreview();
  _updateElevPreviews();
  _updateRadiusPreviews();
  _updateFontPreviews();

  // Neutral scale strip
  var neutral = generateNeutralScale(ds.stagedDark, ds.stagedLight);
  for (var i = 1; i <= 12; i++) {
    var chip = document.getElementById('scale-chip-' + i);
    if (chip) chip.style.background = neutral[i];
  }

  // Footer diff check
  var isDiff = ds.stagedPrimary      !== ds.primary
    || ds.stagedSecondary    !== ds.secondary
    || ds.stagedDark         !== ds.scaleDark
    || ds.stagedLight        !== ds.scaleLight
    || ds.stagedSuccess      !== ds.success
    || ds.stagedWarning      !== ds.warning
    || ds.stagedDanger       !== ds.danger
    || ds.stagedInfo         !== ds.info
    || ds.stagedFontSans     !== ds.fontSans
    || ds.stagedFontMono     !== ds.fontMono
    || (ds.stagedPageBg       || null) !== (ds.pageBg       || null)
    || (ds.stagedInputSurface || null) !== (ds.inputSurface || null)
    || ds.stagedDensity      !== ds.density
    || ds.stagedElev1        !== ds.elev1
    || ds.stagedElev2        !== ds.elev2
    || ds.stagedElev3        !== ds.elev3
    || ds.stagedRadiusSm     !== ds.radiusSm
    || ds.stagedRadiusMd     !== ds.radiusMd
    || ds.stagedRadiusLg     !== ds.radiusLg
    || ds.stagedRadiusXl     !== ds.radiusXl;

  var footer = document.getElementById('cfg-footer');
  if (footer) footer.classList.toggle('visible', isDiff);
}

// ── Theme persistence ──────────────────────────────────────────
function _saveTheme() {
  try {
    var themeData = {
      primary:      ds.primary,
      secondary:    ds.secondary,
      scaleDark:    ds.scaleDark,
      scaleLight:   ds.scaleLight,
      success:      ds.success,
      warning:      ds.warning,
      danger:       ds.danger,
      info:         ds.info,
      fontSans:     ds.fontSans,
      fontMono:     ds.fontMono,
      mode:         ds.mode,
      pageBg:       ds.pageBg,
      inputSurface: ds.inputSurface,
      density:      ds.density,
      elev1:        ds.elev1,
      elev2:        ds.elev2,
      elev3:        ds.elev3,
      radiusSm:     ds.radiusSm,
      radiusMd:     ds.radiusMd,
      radiusLg:     ds.radiusLg,
      radiusXl:     ds.radiusXl
    };
    localStorage.setItem('freshds-theme', JSON.stringify(themeData));
    if (typeof window.__saveThemeToCloud === 'function') {
      window.__saveThemeToCloud(themeData);
    }
  } catch(e) {}
}

// ── Dark mode ──────────────────────────────────────────────────
function toggleMode() {
  ds.mode = ds.mode === 'light' ? 'dark' : 'light';
  document.getElementById('app').setAttribute('data-mode', ds.mode === 'dark' ? 'dark' : '');
  var btn = document.getElementById('mode-btn');
  if (btn) btn.innerHTML = ds.mode === 'dark'
    ? '<i class="ti ti-sun"></i> Light'
    : '<i class="ti ti-moon"></i> Dark';
  _saveTheme();
}

// ── Navigation ─────────────────────────────────────────────────
function _updateTypoFontNames() {
  var sansName  = document.getElementById('typo-sans-name');
  var monoName  = document.getElementById('typo-mono-name');
  var sansStack = document.getElementById('typo-sans-stack');
  var monoStack = document.getElementById('typo-mono-stack');
  if (sansName)  sansName.textContent  = ds.fontSans;
  if (monoName)  monoName.textContent  = ds.fontMono;
  if (sansStack) sansStack.textContent = "'" + ds.fontSans + "', system-ui, sans-serif";
  if (monoStack) monoStack.textContent = "'" + ds.fontMono + "', monospace";
}

var FOUNDATION_PAGES = {
  typography:  'pages/foundation/typography.html',
  colors:      'pages/foundation/colors.html',
  tokens:      'pages/foundation/tokens.html',
  spacing:     'pages/foundation/spacing.html',
  radius:      'pages/foundation/radius.html',
  gridsystem:  'pages/foundation/gridsystem.html',
  iconography:   'pages/foundation/iconography.html',
  accessibility: 'pages/foundation/accessibility.html'
};

var COMPONENT_PAGES = {
  button:          'pages/components/button.html',
  'dropdown-button': 'pages/components/dropdown-button.html',
  promptinput:     'pages/components/promptinput.html',
  input:           'pages/components/input.html',
  select:          'pages/components/select.html',
  checkbox:        'pages/components/checkbox.html',
  radio:           'pages/components/radio.html',
  toggle:          'pages/components/toggle.html',
  slider:          'pages/components/slider.html',
  formfield:       'pages/components/formfield.html',
  badge:           'pages/components/badge.html',
  alert:           'pages/components/alert.html',
  toast:           'pages/components/toast.html',
  tooltip:         'pages/components/tooltip.html',
  progress:        'pages/components/progress.html',
  skeleton:        'pages/components/skeleton.html',
  spinner:         'pages/components/spinner.html',
  emptystate:      'pages/components/emptystate.html',
  avatar:          'pages/components/avatar.html',
  navbar:          'pages/components/navbar.html',
  'sidebar-comp':  'pages/components/sidebar.html',
  tabs:            'pages/components/tabs.html',
  simpletabs:      'pages/components/simpletabs.html',
  breadcrumb:      'pages/components/breadcrumb.html',
  pagination:      'pages/components/pagination.html',
  stepper:         'pages/components/stepper.html',
  card:            'pages/components/card.html',
  mediacard:       'pages/components/mediacard.html',
  modal:           'pages/components/modal.html',
  drawer:          'pages/components/drawer.html',
  accordion:       'pages/components/accordion.html',
  popover:         'pages/components/popover.html',
  table:           'pages/components/table.html',
  statcard:        'pages/components/statcard.html',
  datatable:       'pages/components/datatable.html',
  chart:           'pages/components/chart.html',
  timeline:        'pages/components/timeline.html',
  airesponse:      'pages/components/airesponse.html',
  thinking:        'pages/components/thinking.html',
  confidence:      'pages/components/confidence.html',
  citation:        'pages/components/citation.html',
  suggestion:      'pages/components/suggestion.html',
  modelselector:   'pages/components/modelselector.html',
  tokenmeter:      'pages/components/tokenmeter.html',
  feedback:        'pages/components/feedback.html',
  diffviewer:      'pages/components/diffviewer.html',
  prompthistory:   'pages/components/prompthistory.html',
  aimodetoggle:    'pages/components/aimodetoggle.html'
};

function navigate(page) {
  if (page === 'configurator') { window.location.href = 'configurator.html'; return; }

  var url = FOUNDATION_PAGES[page] || COMPONENT_PAGES[page];
  if (url) {
    var frame = document.getElementById('comp-frame');
    var framePage = document.getElementById('page-frame');
    if (frame && framePage) {
      document.querySelectorAll('.fds-page').forEach(function(p){ p.classList.remove('active'); });
      document.querySelectorAll('.nav-item').forEach(function(el){ el.classList.remove('active'); });
      frame.src = url;
      frame.onload = function() {
        var t = {};
        try { t = JSON.parse(localStorage.getItem('freshds-theme') || '{}'); } catch(e) {}
        try {
          frame.contentWindow.postMessage({
            type:         'fds-theme',
            primary:      t.primary      || ds.primary,
            secondary:    t.secondary    || ds.secondary,
            scaleDark:    t.scaleDark    || ds.scaleDark,
            scaleLight:   t.scaleLight   || ds.scaleLight,
            success:      t.success      || ds.success,
            warning:      t.warning      || ds.warning,
            danger:       t.danger       || ds.danger,
            info:         t.info         || ds.info,
            pageBg:       t.pageBg       || ds.pageBg,
            inputSurface: t.inputSurface || ds.inputSurface,
            mode:         t.mode         || ds.mode
          }, '*');
        } catch(e) {}
      };
      framePage.classList.add('active');
      document.querySelectorAll('.nav-item').forEach(function(el){
        if ((el.getAttribute('data-page') || '') === page) el.classList.add('active');
        else if ((el.getAttribute('onclick') || '').indexOf("'" + page + "'") !== -1) el.classList.add('active');
      });
      var main = document.querySelector('.fds-main');
      if (main) main.scrollTop = 0;
      if (location.hash.slice(1) !== page) history.pushState(null, '', '#' + page);
      return;
    }
    window.location.href = url;
    return;
  }

  if (!document.getElementById('page-' + page)) { window.location.href = 'app.html#' + page; return; }
  document.querySelectorAll('.fds-page').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.nav-item').forEach(function(el){ el.classList.remove('active'); });
  var target = document.getElementById('page-' + page);
  target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(function(el){
    if ((el.getAttribute('data-page') || '') === page) el.classList.add('active');
    else if ((el.getAttribute('onclick') || '').indexOf("'" + page + "'") !== -1) el.classList.add('active');
  });
  var main = document.querySelector('.fds-main');
  if (main) main.scrollTop = 0;
  updateTokenOutput();
  if (page === 'typography') _updateTypoFontNames();
  if (location.hash.slice(1) !== page) history.pushState(null, '', '#' + page);
}

function toggleGroup(header) {
  header.classList.toggle('open');
  header.nextElementSibling.classList.toggle('collapsed');
}

// ── Sidebar search ─────────────────────────────────────────────
// Semantic alias map: query term → component keys.
// Enables "header" → navbar, "grid" → datatable, etc.
var SEARCH_ALIASES = {
  // Layout / navigation
  'header':        ['navbar'],
  'topbar':        ['navbar'],
  'top bar':       ['navbar'],
  'hamburger':     ['navbar'],
  'menu':          ['navbar', 'dropdown-button'],
  'navigation':    ['navbar', 'sidebar-comp', 'tabs', 'simpletabs', 'breadcrumb', 'pagination', 'stepper'],
  'sidebar':       ['sidebar-comp'],
  'side bar':      ['sidebar-comp'],
  'panel':         ['sidebar-comp', 'drawer'],
  'flyout':        ['drawer'],
  'side sheet':    ['drawer'],
  'fly out':       ['drawer'],
  'overlay':       ['modal', 'drawer', 'popover'],

  // Forms / inputs
  'form':          ['input', 'select', 'checkbox', 'radio', 'toggle', 'slider', 'formfield'],
  'text field':    ['input'],
  'text input':    ['input'],
  'textbox':       ['input'],
  'search':        ['input'],
  'field':         ['input', 'formfield'],
  'dropdown':      ['select', 'dropdown-button'],
  'combobox':      ['select'],
  'combo box':     ['select'],
  'option':        ['select', 'radio'],
  'switch':        ['toggle'],
  'on off':        ['toggle'],
  'range':         ['slider'],
  'knob':          ['slider'],
  'check':         ['checkbox'],
  'tick':          ['checkbox'],
  'multi select':  ['checkbox'],
  'pick':          ['checkbox', 'radio', 'select'],

  // Actions
  'cta':           ['button'],
  'link':          ['button'],
  'action':        ['button'],
  'submit':        ['button'],

  // Overlays / modals
  'dialog':        ['modal'],
  'popup':         ['modal', 'tooltip', 'popover'],
  'lightbox':      ['modal'],
  'hover':         ['tooltip'],
  'hint':          ['tooltip'],
  'help':          ['tooltip'],
  'context menu':  ['popover'],

  // Data display
  'table':         ['datatable', 'table'],
  'grid':          ['datatable', 'gridsystem'],
  'list':          ['datatable'],
  'rows':          ['datatable'],
  'data grid':     ['datatable'],

  // Notifications / status
  'notification':  ['badge', 'alert', 'toast'],
  'snackbar':      ['toast'],
  'flash':         ['toast', 'alert'],
  'message':       ['alert'],
  'warning':       ['alert', 'badge'],
  'error':         ['alert', 'badge'],
  'tag':           ['badge'],
  'chip':          ['badge'],
  'pill':          ['badge'],
  'status':        ['badge', 'alert', 'progress'],

  // Loading states
  'loading':       ['spinner', 'progress', 'skeleton', 'thinking'],
  'loader':        ['spinner', 'skeleton'],
  'shimmer':       ['skeleton'],
  'placeholder':   ['skeleton', 'emptystate'],
  'progress bar':  ['progress'],

  // Cards / surfaces
  'tile':          ['card', 'mediacard'],
  'metric':        ['statcard'],
  'kpi':           ['statcard'],
  'stat':          ['statcard'],
  'number':        ['statcard'],
  'counter':       ['statcard'],
  'media':         ['mediacard'],
  'thumbnail':     ['mediacard'],

  // Typography / foundation
  'font':          ['typography'],
  'heading':       ['typography'],
  'typeface':      ['typography'],
  'color':         ['colors'],
  'colour':        ['colors'],
  'palette':       ['colors'],
  'hue':           ['colors'],
  'swatch':        ['colors'],
  'variable':      ['tokens'],
  'css var':       ['tokens'],
  'design token':  ['tokens'],
  'margin':        ['spacing'],
  'padding':       ['spacing'],
  'gap':           ['spacing'],
  'border radius': ['radius'],
  'corner':        ['radius'],
  'rounded':       ['radius'],
  'icon':          ['iconography'],
  'symbol':        ['iconography'],
  'layout':        ['gridsystem'],
  'columns':       ['gridsystem'],
  'responsive':    ['gridsystem'],
  'breakpoint':    ['gridsystem'],

  // Navigation patterns
  'wizard':        ['stepper'],
  'steps':         ['stepper'],
  'onboarding':    ['stepper'],
  'trail':         ['breadcrumb'],
  'pager':         ['pagination'],
  'pages':         ['pagination'],
  'next prev':     ['pagination'],
  'expand':        ['accordion'],
  'collapse':      ['accordion'],
  'faq':           ['accordion'],
  'tab':           ['tabs', 'simpletabs'],

  // Data / content
  'graph':         ['chart'],
  'data viz':      ['chart'],
  'visualization': ['chart'],
  'activity':      ['timeline'],
  'feed':          ['timeline'],
  'profile':       ['avatar'],
  'user':          ['avatar'],
  'person':        ['avatar'],
  'initials':      ['avatar'],
  'photo':         ['avatar'],
  'empty':         ['emptystate'],
  'no data':       ['emptystate'],
  'zero state':    ['emptystate'],
  'blank':         ['emptystate'],

  // AI
  'ai':            ['promptinput', 'airesponse', 'thinking', 'confidence', 'tokenmeter', 'aimodetoggle', 'suggestion', 'modelselector', 'feedback', 'diffviewer', 'prompthistory', 'citation'],
  'chat':          ['airesponse', 'promptinput'],
  'assistant':     ['airesponse', 'promptinput', 'thinking'],
  'llm':           ['modelselector', 'tokenmeter', 'promptinput'],
  'model':         ['modelselector'],
  'prompt':        ['promptinput', 'prompthistory'],
  'query':         ['promptinput'],
  'ask':           ['promptinput'],
  'generating':    ['thinking', 'spinner'],
  'typing':        ['thinking'],
  'score':         ['confidence', 'statcard'],
  'probability':   ['confidence'],
  'context window':['tokenmeter'],
  'cite':          ['citation'],
  'source':        ['citation'],
  'reference':     ['citation'],
  'suggest':       ['suggestion'],
  'recommend':     ['suggestion'],
  'quick reply':   ['suggestion'],
  'thumbs':        ['feedback'],
  'rate':          ['feedback'],
  'rating':        ['feedback'],
  'reaction':      ['feedback'],
  'diff':          ['diffviewer'],
  'code diff':     ['diffviewer'],
  'compare':       ['diffviewer'],
  'recent':        ['prompthistory'],
  'history':       ['prompthistory', 'timeline']
};

var _searchIndex = [];

function _buildSearchIndex() {
  _searchIndex = [];
  document.querySelectorAll('.nav-item').forEach(function(el) {
    var onclick = el.getAttribute('onclick') || '';
    var m = onclick.match(/navigate\('([^']+)'\)/);
    var key = m ? m[1] : el.getAttribute('data-page');
    if (!key) return;
    // Collect all alias terms that point to this key
    var aliasTerms = [];
    Object.keys(SEARCH_ALIASES).forEach(function(term) {
      if (SEARCH_ALIASES[term].indexOf(key) >= 0) aliasTerms.push(term);
    });
    _searchIndex.push({ label: el.textContent.trim(), key: key, aliases: aliasTerms });
  });
}

function _escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _highlightMatch(label, q) {
  var i = label.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return _escapeHtml(label);
  return _escapeHtml(label.slice(0, i))
    + '<mark>' + _escapeHtml(label.slice(i, i + q.length)) + '</mark>'
    + _escapeHtml(label.slice(i + q.length));
}

function clearNavSearch() {
  var input   = document.getElementById('nav-search');
  var clear   = document.getElementById('nav-search-clear');
  var results = document.getElementById('nav-search-results');
  if (input)   input.value = '';
  if (clear)   clear.classList.remove('visible');
  if (results) { results.innerHTML = ''; results.classList.remove('visible'); }
  document.querySelectorAll('.nav-group').forEach(function(g) { g.style.display = ''; });
}

function initNavSearch() {
  var input   = document.getElementById('nav-search');
  var clear   = document.getElementById('nav-search-clear');
  var results = document.getElementById('nav-search-results');
  if (!input) return;

  _buildSearchIndex();

  input.addEventListener('input', function(e) {
    var q = (e.detail ? e.detail.value : input.value) || '';
    var trimmed = q.trim();

    clear.classList.toggle('visible', q.length > 0);

    if (trimmed.length < 2) {
      results.innerHTML = '';
      results.classList.remove('visible');
      document.querySelectorAll('.nav-group').forEach(function(g) { g.style.display = ''; });
      return;
    }

    var q = trimmed.toLowerCase();
    var matches = _searchIndex.filter(function(item) {
      if (item.label.toLowerCase().includes(q)) return true;
      return item.aliases.some(function(alias) {
        return alias.includes(q) || q.includes(alias);
      });
    });

    document.querySelectorAll('.nav-group').forEach(function(g) { g.style.display = 'none'; });

    if (matches.length === 0) {
      results.innerHTML = '<div class="nav-search-empty">No results for "' + _escapeHtml(trimmed) + '"</div>';
    } else {
      results.innerHTML = matches.map(function(item) {
        return '<div class="nav-search-result" onclick="navigate(\'' + item.key + '\');clearNavSearch()">'
          + _highlightMatch(item.label, trimmed)
          + '</div>';
      }).join('');
    }
    results.classList.add('visible');
  });

  clear.addEventListener('click', function() {
    clearNavSearch();
    input.focus();
  });
}

// ── Token output ───────────────────────────────────────────────
function updateTokenOutput() {
  var el = document.getElementById('token-output');
  if (!el) return;

  var neutral   = generateNeutralScale(ds.stagedDark, ds.stagedLight);
  var primary   = generateScale(ds.stagedPrimary);
  var secondary = generateScale(ds.stagedSecondary);

  function scaleBlock(prefix, scale) {
    var lines = '';
    for (var i = 1; i <= 12; i++) {
      var pad = i < 10 ? ' ' : '';
      lines += '  <span class="t-key">--'+prefix+'-'+i+'</span>:'+pad+'  <span class="t-val">'+scale[i]+'</span>;\n';
    }
    return lines;
  }

  el.innerHTML =
    '<span class="t-cmt">/* FreshDS, generated tokens · '+new Date().toLocaleDateString()+' */</span>\n\n'+
    '<span class="t-key">:root</span> {\n'+
    '  <span class="t-cmt">/* Neutral scale */</span>\n'+
    scaleBlock('scale', neutral)+
    '\n  <span class="t-cmt">/* Primary scale */</span>\n'+
    scaleBlock('primary', primary)+
    '\n  <span class="t-cmt">/* Secondary scale */</span>\n'+
    scaleBlock('secondary', secondary)+
    '\n  <span class="t-cmt">/* Typography */</span>\n'+
    '  <span class="t-key">--font-sans</span>:  <span class="t-str">\''+ds.stagedFontSans+'\', system-ui, sans-serif</span>;\n'+
    '  <span class="t-key">--font-mono</span>:  <span class="t-str">\''+ds.stagedFontMono+'\', monospace</span>;\n'+
    '}';
}

// ── Export ─────────────────────────────────────────────────────
function dl(name, content, type) {
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: type }));
  a.download = name;
  a.click();
}

function exportCSS() {
  var neutral   = generateNeutralScale(ds.stagedDark, ds.stagedLight);
  var primary   = generateScale(ds.stagedPrimary);
  var secondary = generateScale(ds.stagedSecondary);
  var success   = generateScale('#22c55e');
  var warning   = generateScale('#f59e0b');
  var danger    = generateScale('#f43f5e');

  function block(prefix, scale) {
    var out = '';
    for (var i = 1; i <= 12; i++) out += '  --'+prefix+'-'+i+': '+scale[i]+';\n';
    return out;
  }

  dl('freshds-tokens.css',
    '/* FreshDS, generated tokens */\n:root {\n'+
    '  /* Neutral scale, anchors: '+ds.stagedDark+' → '+ds.stagedLight+' */\n'+
    block('scale', neutral)+
    '\n  /* Primary: '+ds.stagedPrimary+' */\n'+ block('primary', primary)+
    '\n  /* Secondary: '+ds.stagedSecondary+' */\n'+ block('secondary', secondary)+
    '\n  /* Status scales */\n'+
    block('success', success)+ block('warning', warning)+ block('danger', danger)+
    '\n  /* Semantic */\n'+
    '  --surface-bg:            var(--scale-1);\n'+
    '  --surface-subtle:        var(--scale-2);\n'+
    '  --surface-overlay:       var(--scale-3);\n'+
    '  --surface-border:        var(--scale-4);\n'+
    '  --surface-border-strong: var(--scale-5);\n'+
    '  --text-primary:          var(--scale-11);\n'+
    '  --text-secondary:        var(--scale-9);\n'+
    '  --text-tertiary:         var(--scale-8);\n'+
    '  --color-interactive:     var(--primary-9);\n'+
    '  --color-accent:          var(--secondary-9);\n'+
    '\n  /* Typography */\n'+
    '  --font-sans: \''+ds.stagedFontSans+'\', system-ui, sans-serif;\n'+
    '  --font-mono: \''+ds.stagedFontMono+'\', monospace;\n'+
    '}',
    'text/css');
}

function exportJSON() {
  var neutral   = generateNeutralScale(ds.stagedDark, ds.stagedLight);
  var primary   = generateScale(ds.stagedPrimary);
  var secondary = generateScale(ds.stagedSecondary);

  function toTokenGroup(scale) {
    var g = {};
    for (var i = 1; i <= 12; i++) g[i] = { $value: scale[i], $type: 'color' };
    return g;
  }

  dl('freshds-tokens.json', JSON.stringify({
    meta: { system: 'FreshDS', generated: new Date().toISOString(), anchors: { dark: ds.stagedDark, light: ds.stagedLight } },
    scale:     toTokenGroup(neutral),
    primary:   toTokenGroup(primary),
    secondary: toTokenGroup(secondary),
    semantic: {
      'surface-bg':      { $value: '{scale.1}' },
      'surface-subtle':  { $value: '{scale.2}' },
      'text-primary':    { $value: '{scale.11}' },
      'color-interactive': { $value: '{primary.9}' },
      'color-accent':    { $value: '{secondary.9}' },
      'font-sans': { $value: ds.stagedFontSans, $type: 'fontFamily' },
      'font-mono': { $value: ds.stagedFontMono, $type: 'fontFamily' }
    }
  }, null, 2), 'application/json');
}

var _COMPONENT_FILES = [
  'components/core/fresh-button.js',
  'components/core/fresh-input.js',
  'components/core/fresh-select.js',
  'components/core/fresh-checkbox.js',
  'components/core/fresh-radio.js',
  'components/core/fresh-toggle.js',
  'components/core/fresh-slider.js',
  'components/core/fresh-form-field.js',
  'components/core/fresh-dropdown-button.js',
  'components/feedback/fresh-badge.js',
  'components/feedback/fresh-alert.js',
  'components/feedback/fresh-toast.js',
  'components/feedback/fresh-tooltip.js',
  'components/feedback/fresh-progress.js',
  'components/feedback/fresh-skeleton.js',
  'components/feedback/fresh-spinner.js',
  'components/feedback/fresh-empty-state.js',
  'components/navigation/fresh-navbar.js',
  'components/navigation/fresh-sidebar.js',
  'components/navigation/fresh-tabs.js',
  'components/navigation/fresh-simple-tabs.js',
  'components/navigation/fresh-breadcrumb.js',
  'components/navigation/fresh-pagination.js',
  'components/navigation/fresh-stepper.js',
  'components/containers/fresh-card.js',
  'components/containers/fresh-modal.js',
  'components/containers/fresh-drawer.js',
  'components/containers/fresh-accordion.js',
  'components/containers/fresh-popover.js',
  'components/containers/fresh-media-card.js',
  'components/data/fresh-avatar.js',
  'components/data/fresh-stat-card.js',
  'components/data/fresh-data-table.js',
  'components/data/fresh-chart.js',
  'components/data/fresh-timeline.js',
  'components/ai/fresh-prompt-input.js',
  'components/ai/fresh-ai-response.js',
  'components/ai/fresh-thinking.js',
  'components/ai/fresh-confidence-badge.js',
  'components/ai/fresh-citation-chip.js',
  'components/ai/fresh-suggestion-card.js',
  'components/ai/fresh-model-selector.js',
  'components/ai/fresh-token-meter.js',
  'components/ai/fresh-feedback.js',
  'components/ai/fresh-diff-viewer.js',
  'components/ai/fresh-prompt-history.js',
  'components/ai/fresh-ai-mode-toggle.js'
];

function _generateThemeVarsCss() {
  var neutral   = generateNeutralScale(ds.stagedDark,    ds.stagedLight);
  var primary   = generateScale(ds.stagedPrimary);
  var secondary = generateScale(ds.stagedSecondary);
  var success   = generateScale('#22c55e');
  var warning   = generateScale('#f59e0b');
  var danger    = generateScale('#f43f5e');

  function block(prefix, scale) {
    var out = '';
    for (var i = 1; i <= 12; i++) out += '  --' + prefix + '-' + i + ': ' + scale[i] + ';\n';
    return out;
  }

  return (
    '/* © Freshdesign Interactive, Inc., Do not redistribute.\n' +
    '   FreshDS, Generated theme variables\n' +
    '   Theme    : custom\n' +
    '   Primary  : ' + ds.stagedPrimary + '\n' +
    '   Secondary: ' + ds.stagedSecondary + '\n' +
    '   Generated: ' + new Date().toISOString() + '\n' +
    '   Override any value directly, all components inherit via var(). */\n\n' +
    ':root {\n' +
    '  /* Neutral scale (dark → ' + ds.stagedDark + ' · light → ' + ds.stagedLight + ') */\n' +
    block('scale', neutral) +
    '\n  /* Primary: ' + ds.stagedPrimary + ' */\n' +
    block('primary', primary) +
    '\n  /* Secondary: ' + ds.stagedSecondary + ' */\n' +
    block('secondary', secondary) +
    '\n  /* Status */\n' +
    block('success', success) +
    block('warning', warning) +
    block('danger',  danger) +
    '\n  /* Primitive aliases */\n' +
    '  --primitive-primary:   ' + ds.stagedPrimary   + ';\n' +
    '  --primitive-secondary: ' + ds.stagedSecondary + ';\n' +
    '\n  /* Elevation */\n' +
    '  --elev-1: ' + _buildElevShadow(ds.stagedElev1) + ';\n' +
    '  --elev-2: ' + _buildElevShadow(ds.stagedElev2) + ';\n' +
    '  --elev-3: ' + _buildElevShadow(ds.stagedElev3) + ';\n' +
    '\n  /* Border radius */\n' +
    '  --radius-sm: ' + ds.stagedRadiusSm + 'px;\n' +
    '  --radius-md: ' + ds.stagedRadiusMd + 'px;\n' +
    '  --radius-lg: ' + ds.stagedRadiusLg + 'px;\n' +
    '  --radius-xl: ' + ds.stagedRadiusXl + 'px;\n' +
    '\n  /* Spacing (' + ds.stagedDensity + ') */\n' +
    (function() {
      var p = DENSITY_PRESETS[ds.stagedDensity] || DENSITY_PRESETS.default;
      return Object.keys(p).map(function(k) { return '  --space-' + k + ': ' + p[k] + ';'; }).join('\n') + '\n';
    })() +
    '\n  /* Typography */\n' +
    "  --font-sans: '" + ds.stagedFontSans + "', system-ui, sans-serif;\n" +
    "  --font-mono: '" + ds.stagedFontMono + "', monospace;\n" +
    '}'
  );
}

function _generateReadme(isSite) {
  var themeName = 'FreshDS';
  return (
    '# FreshDS, ' + (isSite ? 'Documentation Site' : 'Developer Bundle') + '\n\n' +
    'Theme: **' + themeName + '**  \n' +
    'Primary: `' + ds.stagedPrimary + '`  \n' +
    'Secondary: `' + ds.stagedSecondary + '`  \n' +
    'Generated: ' + new Date().toISOString() + '\n\n' +
    '## Quick start\n\n' +
    '```html\n' +
    '<!-- 1. Load tokens -->\n' +
    '<link rel="stylesheet" href="tokens/primitives.css">\n' +
    '<link rel="stylesheet" href="tokens/theme-vars.css">\n' +
    '<link rel="stylesheet" href="tokens/theme.css">\n\n' +
    '<!-- 2. Load component CSS (optional) -->\n' +
    '<link rel="stylesheet" href="styles/components.css">\n\n' +
    '<!-- 3. Load grid (optional) -->\n' +
    '<link rel="stylesheet" href="styles/grid.css">\n\n' +
    '<!-- 4. Register web components -->\n' +
    '<script src="js/freshds.js"><\/script>\n' +
    '<script src="components/core/fresh-button.js"><\/script>\n' +
    '<!-- ... repeat for each component -->\n' +
    '```\n\n' +
    '## Dark mode\n\n' +
    'Add `data-mode="dark"` to your root element:\n\n' +
    '```html\n' +
    '<body data-mode="dark"> ... </body>\n' +
    '```\n'
  );
}

function _cssFromSheet(pathHint) {
  var norm = pathHint.replace(/\\/g, '/');
  for (var i = 0; i < document.styleSheets.length; i++) {
    var href = (document.styleSheets[i].href || '').replace(/\\/g, '/');
    if (href && href.indexOf(norm) !== -1) {
      try {
        return Array.from(document.styleSheets[i].cssRules)
          .map(function(r) { return r.cssText; }).join('\n\n');
      } catch(e) {}
    }
  }
  return null;
}

function _xhrSync(path) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, false);
    xhr.send(null);
    return (xhr.status === 200 || xhr.status === 0) ? xhr.responseText : null;
  } catch(e) { return null; }
}

function _fetchAll(paths) {
  var results = [], failed = [];
  paths.forEach(function(p) {
    var text = null;
    if (p.endsWith('.css')) text = _cssFromSheet(p);
    if (text === null)      text = _xhrSync(p);
    if (text !== null) {
      results.push({ path: p, text: text });
    } else {
      failed.push(p);
    }
  });
  if (failed.length) {
    return Promise.reject(new Error(
      failed.length + ' file(s) could not be read on file://.\n\n' +
      'Serve the DS via a local server:\n' +
      '  python3 -m http.server 8080\n' +
      '  (or VS Code Live Server)'
    ));
  }
  return Promise.resolve(results);
}

function _zipAndDownload(zip, filename) {
  zip.generateAsync({ type: 'blob', compression: 'DEFLATE' }).then(function(blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  });
}

// Dev bundle — core engine + tokens + components only. No site JS.
function exportDeveloperBundle() {
  if (typeof JSZip === 'undefined') { alert('JSZip not loaded, check your internet connection.'); return; }

  var staticPaths = [
    'tokens/primitives.css',
    'tokens/theme.css',
    'styles/grid.css',
    'styles/components/core.css',
    'js/freshds.js'
  ].concat(_COMPONENT_FILES);

  _fetchAll(staticPaths).then(function(files) {
    var zip = new JSZip();
    var root = 'freshds-bundle/';
    zip.file(root + 'tokens/theme-vars.css', _generateThemeVarsCss());
    files.forEach(function(f) { zip.file(root + f.path, f.text); });
    zip.file(root + 'README.md', _generateReadme(false));
    _zipAndDownload(zip, 'freshds-bundle.zip');
  }).catch(function(err) {
    alert('Export failed: ' + err.message);
  });
}

// Full site export — includes both JS files.
function exportDSSite() {
  if (typeof JSZip === 'undefined') { alert('JSZip not loaded, check your internet connection.'); return; }

  var sitePaths = [
    'tokens/primitives.css',
    'tokens/theme.css',
    'styles/layout.css',
    'styles/grid.css',
    'styles/docs.css',
    'styles/components/core.css',
    'js/freshds.js',
    'js/freshds-site.js',
    'favicon.svg',
    'app.html'
  ].concat(_COMPONENT_FILES);

  _fetchAll(sitePaths).then(function(files) {
    var zip = new JSZip();
    var root = 'FreshDS/';
    zip.file(root + 'tokens/theme-vars.css', _generateThemeVarsCss());
    files.forEach(function(f) { zip.file(root + f.path, f.text); });
    zip.file(root + 'README.md', _generateReadme(true));
    _zipAndDownload(zip, 'FreshDS.zip');
  }).catch(function(err) {
    alert('Export failed: ' + err.message);
  });
}

// ── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  if (ds.mode === 'dark') {
    var appEl = document.getElementById('app');
    if (appEl) appEl.setAttribute('data-mode', 'dark');
    var modeBtn = document.getElementById('mode-btn');
    if (modeBtn) modeBtn.innerHTML = '<i class="ti ti-sun"></i> Light';
  }

  var fontSansEl = document.getElementById('font-sans-select');
  var fontMonoEl = document.getElementById('font-mono-select');
  if (fontSansEl) fontSansEl.addEventListener('change', function(e) {
    var val = e.detail ? e.detail.value : e.target.value;
    ds.stagedFontSans = val;
    if (SANS_FONTS && SANS_FONTS[val]) loadFont(val, SANS_FONTS[val]);
    _updateFontPreviews();
    _syncConfiguratorUI();
  });
  if (fontMonoEl) fontMonoEl.addEventListener('change', function(e) {
    var val = e.detail ? e.detail.value : e.target.value;
    ds.stagedFontMono = val;
    if (MONO_FONTS && MONO_FONTS[val]) loadFont(val, MONO_FONTS[val]);
    _updateFontPreviews();
    _syncConfiguratorUI();
  });

  var cpP = document.getElementById('cfg-primary');
  var cpS = document.getElementById('cfg-secondary');
  if (cpP) cpP.addEventListener('input', function(e) {
    ds.stagedPrimary = e.target.value;
    _pushStagedToRoot(); _syncConfiguratorUI(); updateTokenOutput();
  });
  if (cpS) cpS.addEventListener('input', function(e) {
    ds.stagedSecondary = e.target.value;
    _pushStagedToRoot(); _syncConfiguratorUI(); updateTokenOutput();
  });

  var cpSuc2 = document.getElementById('cfg-success');
  var cpWarn2 = document.getElementById('cfg-warning');
  var cpDang2 = document.getElementById('cfg-danger');
  var cpInfo2 = document.getElementById('cfg-info');
  if (cpSuc2) cpSuc2.addEventListener('input', function(e) {
    ds.stagedSuccess = e.target.value;
    _pushStagedToRoot(); _syncConfiguratorUI(); updateTokenOutput();
  });
  if (cpWarn2) cpWarn2.addEventListener('input', function(e) {
    ds.stagedWarning = e.target.value;
    _pushStagedToRoot(); _syncConfiguratorUI(); updateTokenOutput();
  });
  if (cpDang2) cpDang2.addEventListener('input', function(e) {
    ds.stagedDanger = e.target.value;
    _pushStagedToRoot(); _syncConfiguratorUI(); updateTokenOutput();
  });
  if (cpInfo2) cpInfo2.addEventListener('input', function(e) {
    ds.stagedInfo = e.target.value;
    _pushStagedToRoot(); _syncConfiguratorUI(); updateTokenOutput();
  });

  var cpD = document.getElementById('cfg-scale-dark');
  var cpL = document.getElementById('cfg-scale-light');
  if (cpD) cpD.addEventListener('input', function(e) {
    ds.stagedDark = e.target.value;
    _pushStagedToRoot(); _syncConfiguratorUI(); updateTokenOutput();
  });
  if (cpL) cpL.addEventListener('input', function(e) {
    ds.stagedLight = e.target.value;
    _pushStagedToRoot(); _syncConfiguratorUI(); updateTokenOutput();
  });

  var cpPgBg2 = document.getElementById('cfg-page-bg');
  var cpInSf2 = document.getElementById('cfg-input-surface');
  if (cpPgBg2) cpPgBg2.addEventListener('input', function(e) {
    ds.stagedPageBg = e.target.value;
    _pushStagedToRoot(); _syncConfiguratorUI(); updateTokenOutput();
  });
  if (cpInSf2) cpInSf2.addEventListener('input', function(e) {
    ds.stagedInputSurface = e.target.value;
    _pushStagedToRoot(); _syncConfiguratorUI(); updateTokenOutput();
  });

  var hexMap = [
    { hexId: 'cfg-hex-primary',      pickerId: 'cfg-primary',      key: 'stagedPrimary'      },
    { hexId: 'cfg-hex-secondary',    pickerId: 'cfg-secondary',    key: 'stagedSecondary'    },
    { hexId: 'cfg-hex-dark',         pickerId: 'cfg-scale-dark',   key: 'stagedDark'         },
    { hexId: 'cfg-hex-light',        pickerId: 'cfg-scale-light',  key: 'stagedLight'        },
    { hexId: 'cfg-hex-success',      pickerId: 'cfg-success',      key: 'stagedSuccess'      },
    { hexId: 'cfg-hex-warning',      pickerId: 'cfg-warning',      key: 'stagedWarning'      },
    { hexId: 'cfg-hex-danger',       pickerId: 'cfg-danger',       key: 'stagedDanger'       },
    { hexId: 'cfg-hex-info',         pickerId: 'cfg-info',         key: 'stagedInfo'         },
    { hexId: 'cfg-hex-page-bg',      pickerId: 'cfg-page-bg',      key: 'stagedPageBg'       },
    { hexId: 'cfg-hex-input-surface',pickerId: 'cfg-input-surface',key: 'stagedInputSurface' }
  ];
  hexMap.forEach(function(entry) {
    var hexEl    = document.getElementById(entry.hexId);
    var pickerEl = document.getElementById(entry.pickerId);
    if (!hexEl) return;
    hexEl.addEventListener('input', function(e) {
      var val = ((e.detail && e.detail.value !== undefined) ? e.detail.value : hexEl.value).trim();
      if (val && val[0] !== '#') { val = '#' + val; hexEl.value = val; }
      if (!/^#[0-9a-fA-F]{6}$/.test(val)) return;
      ds[entry.key] = val;
      if (pickerEl) pickerEl.value = val;
      _pushStagedToRoot(); _syncConfiguratorUI(); updateTokenOutput();
    });
  });

  // Elevation blur inputs
  [1, 2, 3].forEach(function(n) {
    var el = document.getElementById('elev-' + n + '-blur');
    if (el) el.addEventListener('input', function(e) { stageCfgElev(n, e.target.value); });
  });

  // Radius inputs
  ['sm', 'md', 'lg', 'xl'].forEach(function(lvl) {
    var el = document.getElementById('radius-' + lvl + '-val');
    if (el) el.addEventListener('input', function(e) { stageCfgRadius(lvl, e.target.value); });
  });

  _pushStagedToRoot();
  _syncConfiguratorUI();
  updateTokenOutput();
  initNavSearch();
  _updateTypoFontNames();

  var navGroups = document.querySelector('.nav-groups');
  var sidebar   = document.querySelector('.fds-sidebar');
  if (navGroups && sidebar) {
    navGroups.addEventListener('scroll', function() {
      sidebar.classList.toggle('is-scrolled', navGroups.scrollTop > 0);
    });
  }

  var _startHash = location.hash.slice(1);
  if (_startHash) navigate(_startHash);

  window.addEventListener('hashchange', function() {
    var page = location.hash.slice(1);
    if (page) navigate(page);
  });
});

// ── DsTopbar web component ─────────────────────────────────────
(function() {
  if (customElements.get('ds-topbar')) return;

  class DsTopbar extends HTMLElement {
    static get observedAttributes() { return ['active-section']; }
    connectedCallback() { this._render(); }
    attributeChangedCallback() { this._render(); }
    _render() {
      if (window !== window.top) return;
      var section = this.getAttribute('active-section') || 'ds';
      this.innerHTML = [
        '<header class="fds-topbar">',
        '  <div class="fds-logo">',
        '    <img class="fds-logotype fds-logotype-light" src="freshdesign-logo.svg" alt="Freshdesign">',
        '    <img class="fds-logotype fds-logotype-dark"  src="freshdesign-logo-dark.svg" alt="Freshdesign">',
        '  </div>',
        '  <fresh-simple-tabs id="section-tabs"',
        '    tabs=\'[{"key":"ds","label":"Design System"},{"key":"patterns","label":"Pattern Library"}]\'',
        '    active="' + section + '">',
        '  </fresh-simple-tabs>',
        '  <div class="fds-topbar-right">',
        '    <fresh-button variant="secondary" id="mode-btn" onclick="toggleMode()"><i class="ti ti-moon"></i> Dark</fresh-button>',
        '    <fresh-button variant="primary" onclick="window.location.href=\'configurator.html\'"><i class="ti ti-adjustments-horizontal"></i> Configurator</fresh-button>',
        '  </div>',
        '</header>'
      ].join('\n');

      var tabsEl = this.querySelector('#section-tabs');
      if (tabsEl) tabsEl.addEventListener('change', function(e) {
        if (e.detail && e.detail.key === 'patterns') window.location.href = 'patterns.html';
        else if (e.detail && e.detail.key === 'ds') window.location.href = 'app.html';
      });
    }
  }
  customElements.define('ds-topbar', DsTopbar);
})();

// ── DsShell web component ──────────────────────────────────────
(function() {
  if (customElements.get('ds-shell')) return;

  var NAV_GROUPS = [
    { group: 'Getting started', icon: 'ti-home', items: [
      { id: 'home', label: 'Overview', href: 'app.html#home' }
    ]},
    { group: 'Foundation', icon: 'ti-stack-2', items: [
      { id: 'typography',  label: 'Typography',    href: 'pages/foundation/typography.html' },
      { id: 'colors',      label: 'Color system',  href: 'pages/foundation/colors.html' },
      { id: 'tokens',      label: 'Tokens',        href: 'pages/foundation/tokens.html' },
      { id: 'spacing',     label: 'Spacing',       href: 'pages/foundation/spacing.html' },
      { id: 'radius',      label: 'Border radius', href: 'pages/foundation/radius.html' },
      { id: 'gridsystem',  label: 'Grid system',   href: 'pages/foundation/gridsystem.html' },
      { id: 'iconography',   label: 'Iconography',   href: 'pages/foundation/iconography.html' },
      { id: 'accessibility', label: 'Accessibility', href: 'pages/foundation/accessibility.html' }
    ]},
    { group: 'Core UI', icon: 'ti-components', items: [
      { id: 'button',          label: 'Button',          href: 'app.html#button' },
      { id: 'dropdown-button', label: 'Dropdown button', href: 'app.html#dropdown-button' },
      { id: 'input',           label: 'Input',           href: 'app.html#input' },
      { id: 'select',          label: 'Select',          href: 'app.html#select' },
      { id: 'checkbox',        label: 'Checkbox',        href: 'app.html#checkbox' },
      { id: 'radio',           label: 'Radio',           href: 'app.html#radio' },
      { id: 'toggle',          label: 'Toggle',          href: 'app.html#toggle' },
      { id: 'slider',          label: 'Slider',          href: 'app.html#slider' },
      { id: 'formfield',       label: 'Form field',      href: 'app.html#formfield' }
    ]},
    { group: 'Feedback &amp; status', icon: 'ti-bell', items: [
      { id: 'badge',      label: 'Badge',        href: 'app.html#badge' },
      { id: 'alert',      label: 'Alert',        href: 'app.html#alert' },
      { id: 'toast',      label: 'Toast',        href: 'app.html#toast' },
      { id: 'tooltip',    label: 'Tooltip',      href: 'app.html#tooltip' },
      { id: 'progress',   label: 'Progress bar', href: 'app.html#progress' },
      { id: 'skeleton',   label: 'Skeleton',     href: 'app.html#skeleton' },
      { id: 'spinner',    label: 'Spinner',      href: 'app.html#spinner' },
      { id: 'emptystate', label: 'Empty state',  href: 'app.html#emptystate' }
    ]},
    { group: 'Navigation', icon: 'ti-compass', items: [
      { id: 'navbar',       label: 'Navbar',      href: 'app.html#navbar' },
      { id: 'sidebar-comp', label: 'Sidebar',     href: 'app.html#sidebar-comp' },
      { id: 'tabs',         label: 'Tabs',        href: 'app.html#tabs' },
      { id: 'simpletabs',   label: 'Simple tabs', href: 'app.html#simpletabs' },
      { id: 'breadcrumb',   label: 'Breadcrumb',  href: 'app.html#breadcrumb' },
      { id: 'pagination',   label: 'Pagination',  href: 'app.html#pagination' },
      { id: 'stepper',      label: 'Stepper',     href: 'app.html#stepper' }
    ]},
    { group: 'Containers', icon: 'ti-box', items: [
      { id: 'card',      label: 'Card',       href: 'app.html#card' },
      { id: 'mediacard', label: 'Media card', href: 'app.html#mediacard' },
      { id: 'modal',     label: 'Modal',      href: 'app.html#modal' },
      { id: 'drawer',    label: 'Drawer',     href: 'app.html#drawer' },
      { id: 'accordion', label: 'Accordion',  href: 'app.html#accordion' },
      { id: 'popover',   label: 'Popover',    href: 'app.html#popover' },
      { id: 'table',     label: 'Table',      href: 'app.html#table' }
    ]},
    { group: 'Data display', icon: 'ti-chart-bar', items: [
      { id: 'statcard',  label: 'Stat card',     href: 'app.html#statcard' },
      { id: 'datatable', label: 'Data table',    href: 'app.html#datatable' },
      { id: 'chart',     label: 'Chart wrapper', href: 'app.html#chart' },
      { id: 'timeline',  label: 'Timeline',      href: 'app.html#timeline' },
      { id: 'avatar',    label: 'Avatar',        href: 'app.html#avatar' }
    ]},
    { group: 'AI components', icon: 'ti-sparkles', items: [
      { id: 'promptinput',   label: 'Prompt input',       href: 'app.html#promptinput' },
      { id: 'airesponse',    label: 'Response bubble',    href: 'app.html#airesponse' },
      { id: 'thinking',      label: 'Thinking indicator', href: 'app.html#thinking' },
      { id: 'confidence',    label: 'Confidence badge',   href: 'app.html#confidence' },
      { id: 'citation',      label: 'Citation chip',      href: 'app.html#citation' },
      { id: 'suggestion',    label: 'Suggestion card',    href: 'app.html#suggestion' },
      { id: 'modelselector', label: 'Model selector',     href: 'app.html#modelselector' },
      { id: 'tokenmeter',    label: 'Token meter',        href: 'app.html#tokenmeter' },
      { id: 'feedback',      label: 'Feedback row',       href: 'app.html#feedback' },
      { id: 'diffviewer',    label: 'Diff viewer',        href: 'app.html#diffviewer' },
      { id: 'prompthistory', label: 'Prompt history',     href: 'app.html#prompthistory' },
      { id: 'aimodetoggle',  label: 'AI mode toggle',     href: 'app.html#aimodetoggle' }
    ]}
  ];

  class DsShell extends HTMLElement {
    static get observedAttributes() { return ['active']; }
    connectedCallback() { this._render(); }
    attributeChangedCallback() { this._render(); }
    _render() {
      if (window !== window.top) return;
      var active = this.getAttribute('active') || '';
      var groups = NAV_GROUPS.map(function(g) {
        var items = g.items.map(function(item) {
          var cls = 'nav-item' + (item.id === active ? ' active' : '');
          return '<a class="' + cls + '" href="' + item.href + '" data-page="' + item.id + '" onclick="navigate(\'' + item.id + '\');event.preventDefault();">' + item.label + '</a>';
        }).join('');
        return '<div class="nav-group">'
          + '<div class="nav-group-header open" onclick="toggleGroup(this)">'
          + '<i class="ti ' + g.icon + ' nav-section-icon"></i><span>' + g.group + '</span><i class="ti ti-chevron-right"></i>'
          + '</div>'
          + '<div class="nav-group-items">' + items + '</div>'
          + '</div>';
      }).join('');

      this.innerHTML = '<nav class="fds-sidebar">'
        + '<div class="nav-search-wrap">'
        + '<fresh-input id="nav-search" icon="ti-search" placeholder="Search components…"></fresh-input>'
        + '<fresh-button class="nav-search-clear" id="nav-search-clear" variant="ghost" size="sm" icon-only aria-label="Clear search"><i class="ti ti-x"></i></fresh-button>'
        + '</div>'
        + '<div id="nav-search-results" class="nav-search-results"></div>'
        + '<div class="nav-groups">' + groups + '</div>'
        + '</nav>';
    }
  }
  customElements.define('ds-shell', DsShell);
})();
