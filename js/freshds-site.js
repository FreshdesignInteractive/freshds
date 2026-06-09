/* ============================================================
   FreshDS — Site application layer
   Powers index.html, configurator.html, and patterns.html.
   NOT included in the developer bundle export.

   Depends on freshds.js (core) being loaded first.
   ============================================================ */

// ── System themes ──────────────────────────────────────────────
var SYSTEM_THEMES = [
  { id: 'freshds',  name: 'FreshDS',  primary: '#7c6af7', secondary: '#2dd4bf', system: true },
  { id: 'fintech',  name: 'Fintech',  primary: '#0f766e', secondary: '#6366f1', system: true },
  { id: 'health',   name: 'Health',   primary: '#dc2626', secondary: '#f97316', system: true },
  { id: 'saas',     name: 'SaaS',     primary: '#1d4ed8', secondary: '#06b6d4', system: true },
  { id: 'creative', name: 'Creative', primary: '#7c3aed', secondary: '#ec4899', system: true },
  { id: 'retail',   name: 'Retail',   primary: '#92400e', secondary: '#d97706', system: true }
];

var _SYSTEM_DEFAULTS = SYSTEM_THEMES.map(function(t){ return JSON.parse(JSON.stringify(t)); });

// ── Site state ─────────────────────────────────────────────────
var ds = {
  primary:    '#7c6af7',
  secondary:  '#2dd4bf',
  scaleDark:  '#1f2328',
  scaleLight: '#ffffff',
  success:    '#22c55e',
  warning:    '#f59e0b',
  danger:     '#f43f5e',
  info:       '#3b82f6',
  mode:       'light',
  fontSans:   'Inter',
  fontMono:   'JetBrains Mono',
  appliedId:  'freshds',
  stagedId:   'freshds',
  stagedPrimary:   '#7c6af7',
  stagedSecondary: '#2dd4bf',
  stagedDark:      '#1f2328',
  stagedLight:     '#ffffff',
  stagedSuccess:   '#22c55e',
  stagedWarning:   '#f59e0b',
  stagedDanger:    '#f43f5e',
  stagedInfo:      '#3b82f6',
  stagedFontSans:  'Inter',
  stagedFontMono:  'JetBrains Mono',
  pageBg:           null,
  inputSurface:     null,
  stagedPageBg:     null,
  stagedInputSurface: null,
  customThemes:  [],
  _customCount:  0
};

// ── Theme persistence — restore before first paint ─────────────
(function() {
  try {
    var saved = localStorage.getItem('freshds-theme');
    if (!saved) return;
    var t = JSON.parse(saved);
    if (t.primary)    { ds.primary    = ds.stagedPrimary    = t.primary; }
    if (t.secondary)  { ds.secondary  = ds.stagedSecondary  = t.secondary; }
    if (t.scaleDark)  { ds.scaleDark  = ds.stagedDark       = t.scaleDark; }
    if (t.scaleLight) { ds.scaleLight = ds.stagedLight      = t.scaleLight; }
    if (t.success)    { ds.success    = ds.stagedSuccess    = t.success; }
    if (t.warning)    { ds.warning    = ds.stagedWarning    = t.warning; }
    if (t.danger)     { ds.danger     = ds.stagedDanger     = t.danger; }
    if (t.info)       { ds.info       = ds.stagedInfo       = t.info; }
    if (t.fontSans)   { ds.fontSans   = ds.stagedFontSans   = t.fontSans; }
    if (t.fontMono)   { ds.fontMono   = ds.stagedFontMono   = t.fontMono; }
    if (t.appliedId)    { ds.appliedId    = ds.stagedId           = t.appliedId; }
    if (t.pageBg)       { ds.pageBg       = ds.stagedPageBg     = t.pageBg; }
    if (t.inputSurface) { ds.inputSurface = ds.stagedInputSurface= t.inputSurface; }
    if (t.mode)         { ds.mode = t.mode; }
    if (t.customThemes && Array.isArray(t.customThemes)) { ds.customThemes = t.customThemes; }
    if (t._customCount) { ds._customCount = t._customCount; }
    if (t.deletedSystemIds && Array.isArray(t.deletedSystemIds)) {
      ds.deletedSystemIds = t.deletedSystemIds;
      t.deletedSystemIds.forEach(function(id) {
        var i = SYSTEM_THEMES.findIndex(function(s){ return s.id === id; });
        if (i >= 0) SYSTEM_THEMES.splice(i, 1);
      });
    }
    if (t.systemThemeStates && Array.isArray(t.systemThemeStates)) {
      t.systemThemeStates.forEach(function(saved) {
        var theme = SYSTEM_THEMES.filter(function(s){ return s.id === saved.id; })[0];
        if (theme) { theme.name = saved.name; theme.primary = saved.primary; theme.secondary = saved.secondary; theme.dark = saved.dark; theme.light = saved.light; theme.success = saved.success; theme.warning = saved.warning; theme.danger = saved.danger; theme.info = saved.info; theme.pageBg = saved.pageBg; theme.inputSurface = saved.inputSurface; }
      });
    }
  } catch(e) {}
})();

// ── Pre-paint: eliminate FOUC ──────────────────────────────────
applyScalesToElement(document.documentElement, ds.primary, ds.secondary, ds.scaleDark, ds.scaleLight);
document.documentElement.style.setProperty('--color-page-bg',      ds.pageBg       || '#ffffff');
document.documentElement.style.setProperty('--color-input-surface', ds.inputSurface || '#ffffff');

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

// ── Preview container ──────────────────────────────────────────
function stagePreview() {
  var el = document.getElementById('preview-live');
  if (!el) return;

  var n   = generateNeutralScale(ds.stagedDark, ds.stagedLight);
  var p   = generateScale(ds.stagedPrimary);
  var s   = generateScale(ds.stagedSecondary);
  var suc = generateScale(ds.stagedSuccess || '#22c55e');
  var warn= generateScale(ds.stagedWarning || '#f59e0b');
  var dang= generateScale(ds.stagedDanger  || '#f43f5e');
  var info= generateScale(ds.stagedInfo    || '#3b82f6');

  for (var i = 1; i <= 12; i++) {
    el.style.setProperty('--scale-'     + i, n[i]);
    el.style.setProperty('--primary-'   + i, p[i]);
    el.style.setProperty('--secondary-' + i, s[i]);
    el.style.setProperty('--success-'   + i, suc[i]);
    el.style.setProperty('--warning-'   + i, warn[i]);
    el.style.setProperty('--danger-'    + i, dang[i]);
    el.style.setProperty('--info-'      + i, info[i]);
  }
  el.style.setProperty('--primitive-primary',   ds.stagedPrimary);
  el.style.setProperty('--primitive-secondary', ds.stagedSecondary);
  el.style.setProperty('--color-page-bg',       ds.stagedPageBg       || '#ffffff');
  el.style.setProperty('--color-input-surface', ds.stagedInputSurface  || '#ffffff');
  el.style.setProperty('--font-sans', "'" + ds.stagedFontSans + "', system-ui, sans-serif");
  el.style.setProperty('--font-mono', "'" + ds.stagedFontMono + "', monospace");
}

// ── Theme card rendering ───────────────────────────────────────
function allThemes() { return SYSTEM_THEMES.concat(ds.customThemes); }

function renderThemeCards() {
  var container = document.getElementById('theme-cards');
  if (!container) return;
  container.innerHTML = allThemes().map(function(t) {
    var isApplied  = t.id === ds.appliedId;
    var isSelected = t.id === ds.stagedId;
    var border     = isSelected
      ? '2px solid ' + ds.stagedPrimary
      : '1px solid var(--surface-border)';
    var checkHtml  = isApplied
      ? '<div class="theme-applied-check" title="Applied to site"><i class="ti ti-check"></i></div>'
      : '';
    return '<div class="theme-card'+(isSelected?' selected':'')+'" style="border:'+border+'" onclick="selectTheme(\''+t.id+'\')" role="button" tabindex="0">'
      +'<div class="theme-palette"><span class="theme-swatch" style="background:'+t.primary+'"></span><span class="theme-swatch" style="background:'+t.secondary+'"></span></div>'
      +'<div class="theme-card-footer">'
        +'<input class="theme-name-input" value="'+t.name+'" onclick="event.stopPropagation()" oninput="renameCustomTheme(\''+t.id+'\',this.value)" placeholder="Theme name">'
        +'<button class="theme-delete-btn" onclick="event.stopPropagation();deleteCustomTheme(\''+t.id+'\')" aria-label="Delete theme"><i class="ti ti-trash"></i></button>'
      +'</div>'
      +checkHtml+'</div>';
  }).join('');
}

// ── Select (stage) a theme for preview ────────────────────────
function selectTheme(id) {
  var t = allThemes().filter(function(x){ return x.id === id; })[0];
  if (!t) return;
  ds.stagedId        = id;
  ds.stagedPrimary   = t.primary;
  ds.stagedSecondary = t.secondary;
  ds.stagedDark      = t.dark  !== undefined ? t.dark  : '#1f2328';
  ds.stagedLight     = t.light !== undefined ? t.light : '#ffffff';
  ds.stagedSuccess      = t.success || '#22c55e';
  ds.stagedWarning      = t.warning || '#f59e0b';
  ds.stagedDanger       = t.danger  || '#f43f5e';
  ds.stagedInfo         = t.info    || '#3b82f6';
  ds.stagedPageBg       = t.pageBg       || null;
  ds.stagedInputSurface = t.inputSurface || null;
  _syncConfiguratorUI();
  stagePreview();
  updateTokenOutput();
}

// ── Apply staged theme to the whole site ──────────────────────
function applyStagedToSite() {
  saveCurrentTheme();
  ds.primary    = ds.stagedPrimary;
  ds.secondary  = ds.stagedSecondary;
  ds.scaleDark  = ds.stagedDark;
  ds.scaleLight = ds.stagedLight;
  ds.success    = ds.stagedSuccess;
  ds.warning    = ds.stagedWarning;
  ds.danger     = ds.stagedDanger;
  ds.info         = ds.stagedInfo;
  ds.appliedId    = ds.stagedId;
  ds.fontSans     = ds.stagedFontSans;
  ds.fontMono     = ds.stagedFontMono;
  ds.pageBg       = ds.stagedPageBg;
  ds.inputSurface = ds.stagedInputSurface;
  pushToRoot(ds.primary, ds.secondary, ds.scaleDark, ds.scaleLight, ds.pageBg, ds.inputSurface);
  document.documentElement.style.setProperty('--font-sans', "'" + ds.fontSans + "', system-ui, sans-serif");
  document.documentElement.style.setProperty('--font-mono', "'" + ds.fontMono + "', monospace");
  _saveTheme();
  renderThemeCards();
  _syncConfiguratorUI();
  _updateTypoFontNames();
}

function resetDefaultThemes() {
  SYSTEM_THEMES.length = 0;
  _SYSTEM_DEFAULTS.forEach(function(d){ SYSTEM_THEMES.push(JSON.parse(JSON.stringify(d))); });
  ds.deletedSystemIds = [];
  var stillExists = allThemes().some(function(t){ return t.id === ds.stagedId; });
  selectTheme(stillExists ? ds.stagedId : 'freshds');
  _saveTheme();
}

function saveCurrentTheme() {
  var t = allThemes().filter(function(t){ return t.id === ds.stagedId; })[0];
  if (!t) return;
  t.primary      = ds.stagedPrimary;
  t.secondary    = ds.stagedSecondary;
  t.dark         = ds.stagedDark;
  t.light        = ds.stagedLight;
  t.success      = ds.stagedSuccess;
  t.warning      = ds.stagedWarning;
  t.danger       = ds.stagedDanger;
  t.info         = ds.stagedInfo;
  t.pageBg       = ds.stagedPageBg;
  t.inputSurface = ds.stagedInputSurface;
  _saveTheme();
  renderThemeCards();
  _syncConfiguratorUI();
}

function discardStagedChanges() {
  var t = allThemes().filter(function(t){ return t.id === ds.appliedId; })[0];
  if (t) {
    t.primary      = ds.primary;
    t.secondary    = ds.secondary;
    t.dark         = ds.scaleDark;
    t.light        = ds.scaleLight;
    t.success      = ds.success;
    t.warning      = ds.warning;
    t.danger       = ds.danger;
    t.info         = ds.info;
    t.pageBg       = ds.pageBg;
    t.inputSurface = ds.inputSurface;
  }
  _saveTheme();
  selectTheme(ds.appliedId);
}

// ── Custom theme management ────────────────────────────────────
function addCustomTheme() {
  ds._customCount++;
  var id = 'custom-' + ds._customCount;
  ds.customThemes.push({ id: id, name: 'Custom ' + ds._customCount, primary: '#1f2328', secondary: '#6b7280', success: '#22c55e', warning: '#f59e0b', danger: '#f43f5e', info: '#3b82f6', system: false });
  selectTheme(id);
}

function deleteCustomTheme(id) {
  var t = ds.customThemes.filter(function(t){ return t.id === id; })[0];
  if (typeof openDeleteModal === 'function') {
    openDeleteModal(id, t ? t.name : 'this theme');
    return;
  }
  var input = prompt('Type DELETE to confirm removing "' + (t ? t.name : 'this theme') + '".');
  if (input === null || input.trim() !== 'DELETE') return;
  _doDeleteTheme(id);
}

function _doDeleteTheme(id) {
  var inSystem = SYSTEM_THEMES.some(function(t){ return t.id === id; });
  if (inSystem) {
    SYSTEM_THEMES.splice(SYSTEM_THEMES.findIndex(function(t){ return t.id === id; }), 1);
    if (!ds.deletedSystemIds) ds.deletedSystemIds = [];
    ds.deletedSystemIds.push(id);
  } else {
    ds.customThemes = ds.customThemes.filter(function(t){ return t.id !== id; });
  }
  var remaining  = allThemes();
  var fallback   = remaining.length ? remaining[0].id : null;
  var fallbackId = fallback || 'freshds';

  if (ds.appliedId === id) {
    var fb = allThemes().filter(function(t){ return t.id === fallbackId; })[0];
    if (fb) {
      ds.primary    = fb.primary;
      ds.secondary  = fb.secondary;
      ds.scaleDark  = fb.dark  || '#1f2328';
      ds.scaleLight = fb.light || '#ffffff';
      ds.success    = fb.success || '#22c55e';
      ds.warning    = fb.warning || '#f59e0b';
      ds.danger     = fb.danger  || '#f43f5e';
      ds.info       = fb.info    || '#3b82f6';
      ds.pageBg     = fb.pageBg  || null;
      ds.inputSurface = fb.inputSurface || null;
      pushToRoot(ds.primary, ds.secondary, ds.scaleDark, ds.scaleLight, ds.pageBg, ds.inputSurface);
    }
    ds.appliedId = fallbackId;
  }

  if (ds.stagedId === id) {
    fallback ? selectTheme(fallbackId) : renderThemeCards();
  } else {
    renderThemeCards();
    stagePreview();
  }
  _saveTheme();
}

function renameCustomTheme(id, name) {
  var t = allThemes().filter(function(t){ return t.id === id; })[0];
  if (t) t.name = name;
  if (ds.stagedId === id) {
    var nameEl = document.getElementById('cfg-theme-name-label');
    if (nameEl) nameEl.textContent = name;
  }
  _saveTheme();
}

// ── Sync configurator UI ───────────────────────────────────────
function _syncConfiguratorUI() {
  var cpP = document.getElementById('cfg-primary');
  var cpS = document.getElementById('cfg-secondary');
  if (cpP) { cpP.value = ds.stagedPrimary; cpP.disabled = false; }
  if (cpS) { cpS.value = ds.stagedSecondary; cpS.disabled = false; }
  var hPrimary   = document.getElementById('cfg-hex-primary');
  var hSecondary = document.getElementById('cfg-hex-secondary');
  if (hPrimary   && document.activeElement !== hPrimary)   hPrimary.value   = ds.stagedPrimary;
  if (hSecondary && document.activeElement !== hSecondary) hSecondary.value = ds.stagedSecondary;

  var cpSuc = document.getElementById('cfg-success');
  var cpWarn = document.getElementById('cfg-warning');
  var cpDang = document.getElementById('cfg-danger');
  var cpInfo = document.getElementById('cfg-info');
  if (cpSuc)  { cpSuc.value  = ds.stagedSuccess; cpSuc.disabled  = false; }
  if (cpWarn) { cpWarn.value = ds.stagedWarning; cpWarn.disabled = false; }
  if (cpDang) { cpDang.value = ds.stagedDanger;  cpDang.disabled = false; }
  if (cpInfo) { cpInfo.value = ds.stagedInfo;    cpInfo.disabled = false; }
  var hSuc = document.getElementById('cfg-hex-success');
  var hWarn = document.getElementById('cfg-hex-warning');
  var hDang = document.getElementById('cfg-hex-danger');
  var hInfo = document.getElementById('cfg-hex-info');
  if (hSuc  && document.activeElement !== hSuc)  hSuc.value  = ds.stagedSuccess;
  if (hWarn && document.activeElement !== hWarn) hWarn.value = ds.stagedWarning;
  if (hDang && document.activeElement !== hDang) hDang.value = ds.stagedDanger;
  if (hInfo && document.activeElement !== hInfo) hInfo.value = ds.stagedInfo;

  var cpD = document.getElementById('cfg-scale-dark');
  var cpL = document.getElementById('cfg-scale-light');
  if (cpD) { cpD.value = ds.stagedDark;  cpD.disabled = false; }
  if (cpL) { cpL.value = ds.stagedLight; cpL.disabled = false; }
  var hD = document.getElementById('cfg-hex-dark');
  var hL = document.getElementById('cfg-hex-light');
  if (hD && document.activeElement !== hD) hD.value = ds.stagedDark;
  if (hL && document.activeElement !== hL) hL.value = ds.stagedLight;

  var cpPgBg  = document.getElementById('cfg-page-bg');
  var cpInSf  = document.getElementById('cfg-input-surface');
  var hPgBg   = document.getElementById('cfg-hex-page-bg');
  var hInSf   = document.getElementById('cfg-hex-input-surface');
  var dispPgBg  = ds.stagedPageBg       || '#ffffff';
  var dispInSf  = ds.stagedInputSurface || '#ffffff';
  if (cpPgBg) { cpPgBg.value = dispPgBg; cpPgBg.disabled = false; }
  if (cpInSf) { cpInSf.value = dispInSf; cpInSf.disabled = false; }
  if (hPgBg && document.activeElement !== hPgBg) hPgBg.value = dispPgBg;
  if (hInSf && document.activeElement !== hInSf) hInSf.value = dispInSf;

  var selSans = document.getElementById('font-sans-select');
  var selMono = document.getElementById('font-mono-select');
  if (selSans) { selSans.value = ds.stagedFontSans; selSans.disabled = false; }
  if (selMono) { selMono.value = ds.stagedFontMono; selMono.disabled = false; }

  var isDiff = ds.stagedId        !== ds.appliedId
    || ds.stagedPrimary      !== ds.primary
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
    || (ds.stagedInputSurface || null) !== (ds.inputSurface || null);

  var tObj = allThemes().filter(function(x){ return x.id === ds.stagedId; })[0];
  var hasUnsavedEdits = tObj && (
    ds.stagedPrimary      !== (tObj.primary   || ds.stagedPrimary)   ||
    ds.stagedSecondary    !== (tObj.secondary || ds.stagedSecondary) ||
    ds.stagedSuccess      !== (tObj.success   || '#22c55e')          ||
    ds.stagedWarning      !== (tObj.warning   || '#f59e0b')          ||
    ds.stagedDanger       !== (tObj.danger    || '#f43f5e')          ||
    ds.stagedInfo         !== (tObj.info      || '#3b82f6')          ||
    ds.stagedDark         !== (tObj.dark      || ds.scaleDark)       ||
    ds.stagedLight        !== (tObj.light     || ds.scaleLight)      ||
    (ds.stagedPageBg       || null) !== (tObj.pageBg       || null)  ||
    (ds.stagedInputSurface || null) !== (tObj.inputSurface || null)
  );

  var footer      = document.getElementById('cfg-footer');
  var footerLabel = document.getElementById('cfg-footer-label-text');
  var saveBtn     = document.getElementById('cfg-footer-save-btn');
  var showFooter  = isDiff || hasUnsavedEdits;
  if (footer) footer.classList.toggle('visible', showFooter);
  if (saveBtn) saveBtn.style.display = hasUnsavedEdits ? '' : 'none';
  var footerLabelWrap = document.getElementById('cfg-footer-label-wrap');
  if (footerLabel) {
    var safeName = (tObj && tObj.name) ? tObj.name : 'Theme';
    footerLabel.textContent = hasUnsavedEdits ? safeName + ' — unsaved changes' : '';
  }
  if (footerLabelWrap) footerLabelWrap.style.visibility = hasUnsavedEdits ? '' : 'hidden';

  var t = allThemes().filter(function(x){ return x.id === ds.stagedId; })[0];
  var themeName = t ? t.name : 'Custom';
  var nameEl = document.getElementById('cfg-theme-name-label');
  if (nameEl) nameEl.textContent = themeName;
  var label = document.getElementById('cfg-preview-label');
  if (label) {
    var isAppliedTheme = ds.stagedId === ds.appliedId;
    label.textContent    = isAppliedTheme ? 'Applied' : '';
    label.style.display  = isAppliedTheme ? '' : 'none';
    label.style.color    = 'var(--text-tertiary)';
  }

  // 12-step neutral scale strip
  var neutral = generateNeutralScale(ds.stagedDark, ds.stagedLight);
  for (var i = 1; i <= 12; i++) {
    var chip = document.getElementById('scale-chip-' + i);
    if (chip) chip.style.background = neutral[i];
  }

  renderThemeCards();
}

function switchCfgTab(tab) {
  document.querySelectorAll('.cfg-tab').forEach(function(t){ t.classList.toggle('active', t.dataset.tab === tab); });
  document.querySelectorAll('.cfg-tab-panel').forEach(function(p){ p.classList.toggle('active', p.dataset.tab === tab); });
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
      appliedId:    ds.appliedId,
      mode:         ds.mode,
      pageBg:       ds.pageBg,
      inputSurface: ds.inputSurface,
      customThemes:      ds.customThemes,
      _customCount:      ds._customCount,
      systemThemeStates: SYSTEM_THEMES.map(function(t){ return { id: t.id, name: t.name, primary: t.primary, secondary: t.secondary, dark: t.dark, light: t.light, success: t.success, warning: t.warning, danger: t.danger, info: t.info, pageBg: t.pageBg, inputSurface: t.inputSurface }; }),
      deletedSystemIds:  ds.deletedSystemIds || []
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
  stagePreview();
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
  iconography: 'pages/foundation/iconography.html'
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
  if (FOUNDATION_PAGES[page]) { window.location.href = FOUNDATION_PAGES[page]; return; }
  if (COMPONENT_PAGES[page]) { window.location.href = COMPONENT_PAGES[page]; return; }
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
    '<span class="t-cmt">/* FreshDS — generated tokens · '+new Date().toLocaleDateString()+' */</span>\n\n'+
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
    '/* FreshDS — generated tokens */\n:root {\n'+
    '  /* Neutral scale — anchors: '+ds.stagedDark+' → '+ds.stagedLight+' */\n'+
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
    '/* © Freshdesign Interactive, Inc. — Do not redistribute.\n' +
    '   FreshDS — Generated theme variables\n' +
    '   Theme    : ' + (ds.stagedId || 'custom') + '\n' +
    '   Primary  : ' + ds.stagedPrimary + '\n' +
    '   Secondary: ' + ds.stagedSecondary + '\n' +
    '   Generated: ' + new Date().toISOString() + '\n' +
    '   Override any value directly — all components inherit via var(). */\n\n' +
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
    '}'
  );
}

function _generateReadme(isSite) {
  var themeName = ds.stagedId || 'custom';
  return (
    '# FreshDS — ' + (isSite ? 'Documentation Site' : 'Developer Bundle') + '\n\n' +
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
  if (typeof JSZip === 'undefined') { alert('JSZip not loaded — check your internet connection.'); return; }

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
  if (typeof JSZip === 'undefined') { alert('JSZip not loaded — check your internet connection.'); return; }

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
    var root = 'freshds-site/';
    zip.file(root + 'tokens/theme-vars.css', _generateThemeVarsCss());
    files.forEach(function(f) { zip.file(root + f.path, f.text); });
    zip.file(root + 'README.md', _generateReadme(true));
    _zipAndDownload(zip, 'freshds-site.zip');
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

  pushToRoot(ds.primary, ds.secondary, ds.scaleDark, ds.scaleLight, ds.pageBg, ds.inputSurface);

  var fontSansEl = document.getElementById('font-sans-select');
  var fontMonoEl = document.getElementById('font-mono-select');
  if (fontSansEl) fontSansEl.addEventListener('change', function(e) {
    var val = e.detail ? e.detail.value : e.target.value;
    ds.stagedFontSans = val;
    applyFont('sans', val);
    _syncConfiguratorUI(); stagePreview(); updateTokenOutput();
  });
  if (fontMonoEl) fontMonoEl.addEventListener('change', function(e) {
    var val = e.detail ? e.detail.value : e.target.value;
    ds.stagedFontMono = val;
    applyFont('mono', val);
    _syncConfiguratorUI(); stagePreview(); updateTokenOutput();
  });

  var cpP = document.getElementById('cfg-primary');
  var cpS = document.getElementById('cfg-secondary');
  if (cpP) cpP.addEventListener('input', function(e) {
    ds.stagedPrimary = e.target.value;
    _syncConfiguratorUI(); stagePreview(); updateTokenOutput();
  });
  if (cpS) cpS.addEventListener('input', function(e) {
    ds.stagedSecondary = e.target.value;
    _syncConfiguratorUI(); stagePreview(); updateTokenOutput();
  });

  var cpSuc2 = document.getElementById('cfg-success');
  var cpWarn2 = document.getElementById('cfg-warning');
  var cpDang2 = document.getElementById('cfg-danger');
  var cpInfo2 = document.getElementById('cfg-info');
  if (cpSuc2) cpSuc2.addEventListener('input', function(e) {
    ds.stagedSuccess = e.target.value;
    _syncConfiguratorUI(); stagePreview(); updateTokenOutput();
  });
  if (cpWarn2) cpWarn2.addEventListener('input', function(e) {
    ds.stagedWarning = e.target.value;
    _syncConfiguratorUI(); stagePreview(); updateTokenOutput();
  });
  if (cpDang2) cpDang2.addEventListener('input', function(e) {
    ds.stagedDanger = e.target.value;
    _syncConfiguratorUI(); stagePreview(); updateTokenOutput();
  });
  if (cpInfo2) cpInfo2.addEventListener('input', function(e) {
    ds.stagedInfo = e.target.value;
    _syncConfiguratorUI(); stagePreview(); updateTokenOutput();
  });

  var cpD = document.getElementById('cfg-scale-dark');
  var cpL = document.getElementById('cfg-scale-light');
  if (cpD) cpD.addEventListener('input', function(e) {
    ds.stagedDark = e.target.value;
    _syncConfiguratorUI(); stagePreview(); updateTokenOutput();
  });
  if (cpL) cpL.addEventListener('input', function(e) {
    ds.stagedLight = e.target.value;
    _syncConfiguratorUI(); stagePreview(); updateTokenOutput();
  });

  var cpPgBg2 = document.getElementById('cfg-page-bg');
  var cpInSf2 = document.getElementById('cfg-input-surface');
  if (cpPgBg2) cpPgBg2.addEventListener('input', function(e) {
    ds.stagedPageBg = e.target.value;
    _syncConfiguratorUI(); stagePreview(); updateTokenOutput();
  });
  if (cpInSf2) cpInSf2.addEventListener('input', function(e) {
    ds.stagedInputSurface = e.target.value;
    _syncConfiguratorUI(); stagePreview(); updateTokenOutput();
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
      _syncConfiguratorUI(); stagePreview(); updateTokenOutput();
    });
  });

  renderThemeCards();
  _syncConfiguratorUI();
  stagePreview();
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
      { id: 'iconography', label: 'Iconography',   href: 'pages/foundation/iconography.html' }
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
      var active = this.getAttribute('active') || '';
      var groups = NAV_GROUPS.map(function(g) {
        var items = g.items.map(function(item) {
          var cls = 'nav-item' + (item.id === active ? ' active' : '');
          return '<a class="' + cls + '" href="' + item.href + '" data-page="' + item.id + '">' + item.label + '</a>';
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
